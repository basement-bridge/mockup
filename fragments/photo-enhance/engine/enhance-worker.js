/* Photo Enhance engine: the worker. Own typed-array code, no library, no network.
 * Everything here runs OFF the main thread. It never receives or touches the
 * person's original bitmap on the main thread: it gets its own copy (<= 3200 px long edge).
 * Protocol: init -> ready; render -> pixels; encode -> blob(s); close. One job at a time. */
"use strict";

var sessions = {};            // sid -> { bmp, w, h, base: {key, img}, an }
var SRGB2LIN = new Float32Array(257);
var LIN2SRGB = new Uint8ClampedArray(8193);
(function () {
  var i, c;
  for (i = 0; i < 256; i++) { c = i / 255; SRGB2LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  SRGB2LIN[256] = 1;
  for (i = 0; i <= 8192; i++) { c = i / 8192; LIN2SRGB[i] = Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)); }
})();
function lin(v) { var i = v | 0; if (i >= 255) return 1; if (i < 0) return 0; var f = v - i; return SRGB2LIN[i] + (SRGB2LIN[i + 1] - SRGB2LIN[i]) * f; }
function enc(l) { return l <= 0 ? 0 : l >= 1 ? 255 : LIN2SRGB[(l * 8192 + 0.5) | 0]; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function pct(sorted, p) { return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))]; }

/* ---------- drawing the source at a size ---------- */
function drawSized(s, w, h, crop) {
  var cv = new OffscreenCanvas(w, h), cx = cv.getContext("2d", { willReadFrequently: true });
  cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
  if (crop) cx.drawImage(s.bmp, crop.x * s.w, crop.y * s.h, crop.w * s.w, crop.h * s.h, 0, 0, w, h);
  else cx.drawImage(s.bmp, 0, 0, w, h);
  return { cv: cv, cx: cx };
}
function getBase(s, w, h, crop) {
  var key = w + "x" + h + (crop ? JSON.stringify(crop) : "");
  if (s.base && s.base.key === key) return s.base.img;
  var d = drawSized(s, w, h, crop), img = d.cx.getImageData(0, 0, w, h);
  s.base = { key: key, img: img };
  return img;
}

/* ---------- analysis (once, from the original, on a <=1280 px working copy) ---------- */
function analyse(s) {
  var sc = Math.min(1, 1280 / Math.max(s.w, s.h)), w = Math.max(1, Math.round(s.w * sc)), h = Math.max(1, Math.round(s.h * sc));
  var img = getBase(s, w, h, null), d = img.data, n = w * h;
  var stride = Math.max(1, Math.floor(Math.sqrt(n / 120000)));
  var ys = [], i, x, y, r, g, b, yy, mx, mn, sat;
  var nr = 0, ng = 0, nb = 0, nn = 0, satSum = 0, satN = 0, clip = 0, dark = 0, tot = 0;
  for (y = 0; y < h; y += stride) for (x = 0; x < w; x += stride) {
    i = (y * w + x) * 4; r = d[i]; g = d[i + 1]; b = d[i + 2];
    yy = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    ys.push(yy); tot++;
    if (yy > 0.985) clip++;
    if (yy < 0.12) dark++;
    mx = Math.max(r, g, b); mn = Math.min(r, g, b); sat = mx ? (mx - mn) / mx : 0;
    if (yy > 0.15 && yy < 0.9) { satSum += sat; satN++; }
    if (sat < 0.3 && yy > 0.45 && yy < 0.97) { nr += lin(r); ng += lin(g); nb += lin(b); nn++; }
  }
  ys.sort(function (a, b2) { return a - b2; });
  var p01 = pct(ys, 0.01), p10 = pct(ys, 0.1), p50 = pct(ys, 0.5), p99 = pct(ys, 0.99);
  var A = { w: w, h: h, p01: p01, p10: p10, p50: p50, p99: p99, clipFrac: clip / tot, darkFrac: dark / tot, neutralFrac: nn / tot };

  /* exposure: move the median toward 0.46 (sRGB), 60% of the way, never clip p99 */
  var tgt = 0.46, st = 0.6 * Math.log(lin(tgt * 255) / Math.max(1e-4, lin(p50 * 255))) / Math.LN2;
  if (st < 0) st *= 0.6;
  if (st > 0) { var room = Math.log(1.08 / Math.max(1e-3, lin(p99 * 255))) / Math.LN2; st = Math.min(st, Math.max(0, room)); }
  st = clamp(st, -0.4, 0.7);
  if (Math.abs(st) < 0.15) st = 0;
  A.stops = st;

  /* white balance: only from near-neutral pixels (plates, cloths, backgrounds), only when clear and there are enough of them */
  var gr = 1, gb = 1, dev = 0;
  if (nn / tot > 0.08 && nn > 400) {
    var rg = Math.log(nr / ng) / Math.LN2, bg = Math.log(nb / ng) / Math.LN2;   // + means red-ish / blue-ish
    A.castRG = rg; A.castBG = bg;
    var dom = Math.max(Math.abs(rg), Math.abs(bg));
    if (dom > 0.22) {
      gr = clamp(Math.pow(2, -rg * 0.85), 0.72, 1.4); gb = clamp(Math.pow(2, -bg * 0.85), 0.72, 1.4);
      dev = Math.log(gb / gr) / Math.LN2;                                       // + means made cooler... see notes text
    }
  }
  A.wb = [gr, 1, gb]; A.wbShift = dev;

  /* highlights and shadows */
  A.highlights = clamp((A.clipFrac - 0.02) / 0.10, 0, 1) * 0.7 + (A.clipFrac > 0.02 ? clamp((p99 - 0.97) / 0.03, 0, 1) * 0.15 : 0);
  A.highlights = clamp(A.highlights, 0, 0.8);
  A.shadows = clamp((A.darkFrac - 0.08) / 0.45, 0, 1) * 0.7 + clamp((0.2 - p10) / 0.2, 0, 1) * 0.15;
  A.shadows = clamp(A.shadows + clamp((0.3 - p50) / 0.2, 0, 1) * 0.4, 0, 0.8);

  /* vibrance: only when the mid-tones are quiet */
  var ms = satN ? satSum / satN : 0;
  A.meanSat = ms;
  A.vibrance = clamp((0.45 - ms) / 0.3, 0, 1) * 0.35;
  if (A.vibrance < 0.06) A.vibrance = 0;

  /* noise: robust (median) Laplacian estimate on luma, 0..255 units */
  var res = [], c0, v, k = 0, lum = new Float32Array(n);
  for (i = 0; i < n; i++) lum[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  var st2 = Math.max(1, Math.floor(Math.sqrt(n / 60000)));
  for (y = 1; y < h - 1; y += st2) for (x = 1; x < w - 1; x += st2) {
    c0 = y * w + x;
    v = lum[c0 - w - 1] - 2 * lum[c0 - w] + lum[c0 - w + 1] - 2 * lum[c0 - 1] + 4 * lum[c0] - 2 * lum[c0 + 1] + lum[c0 + w - 1] - 2 * lum[c0 + w] + lum[c0 + w + 1];
    res.push(Math.abs(v));
  }
  res.sort(function (a, b2) { return a - b2; });
  A.sigma = res.length ? pct(res, 0.5) / (0.6745 * 6) : 0;
  A.denoise = clamp((A.sigma - 1.2) / 5, 0, 1);
  if (A.denoise < 0.05) A.denoise = 0;
  A.sharpen = clamp(1 - A.sigma / 8, 0.25, 1);

  var sig = Math.abs(A.stops) / 0.7 + (Math.abs(A.wbShift) > 0 ? 1 : 0) + A.highlights + A.shadows + A.vibrance * 2 + A.denoise;
  A.good = sig < 0.5;
  return A;
}

/* ---------- box blur on a float plane ---------- */
function boxBlur(src, w, h, r, passes) {
  var a = src, t = new Float32Array(w * h), o = new Float32Array(w * h), p, x, y, i, acc, inv = 1 / (2 * r + 1), k;
  for (p = 0; p < passes; p++) {
    for (y = 0; y < h; y++) {                                  // horizontal: a -> t
      i = y * w; acc = 0;
      for (k = -r; k <= r; k++) acc += a[i + clamp(k, 0, w - 1)];
      for (x = 0; x < w; x++) {
        t[i + x] = acc * inv;
        acc += a[i + Math.min(w - 1, x + r + 1)] - a[i + Math.max(0, x - r)];
      }
    }
    for (x = 0; x < w; x++) {                                  // vertical: t -> o
      acc = 0;
      for (k = -r; k <= r; k++) acc += t[clamp(k, 0, h - 1) * w + x];
      for (y = 0; y < h; y++) {
        o[y * w + x] = acc * inv;
        acc += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x];
      }
    }
    if (p === 0 && passes > 1) { a = o; o = new Float32Array(w * h); }   // keep the caller's src untouched
    else { var sw = a; a = o; o = (sw === src) ? new Float32Array(w * h) : sw; }
  }
  return a;
}

/* ---------- the pipeline. p = analysis scaled by level k. Returns the same ImageData, changed. ---------- */
function process(img, A, k, outLong, prog) {
  var w = img.width, h = img.height, n = w * h, d = img.data, i, j, x, y;
  if (!(k > 0)) return img;
  var stops = A.stops * k, gr = Math.pow(A.wb[0], k), gb = Math.pow(A.wb[2], k);
  var sh = A.shadows * k, hi = A.highlights * k, vib = A.vibrance * k, dn = A.denoise * k, shp = A.sharpen * k;
  var R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n);
  for (i = 0; i < n; i++) { R[i] = d[i * 4]; G[i] = d[i * 4 + 1]; B[i] = d[i * 4 + 2]; }
  if (prog) prog("noise", 0.05);

  /* 1. noise: chroma first, edge-preserving 5x5 bilateral, stronger in the shadows */
  if (dn > 0.02) {
    var Y = new Float32Array(n), Cb = new Float32Array(n), Cr = new Float32Array(n);
    for (i = 0; i < n; i++) {
      Y[i] = 0.299 * R[i] + 0.587 * G[i] + 0.114 * B[i];
      Cb[i] = B[i] - Y[i]; Cr[i] = R[i] - Y[i];
    }
    var sg = Math.max(1.5, A.sigma), sy = 2.2 * sg + 2, sc = 3 * sg + 3;
    var LUTY = new Float32Array(256), LUTC = new Float32Array(256), q;
    for (q = 0; q < 256; q++) { LUTY[q] = Math.exp(-(q * 4) / (2 * sy * sy)); LUTC[q] = Math.exp(-(q * 4) / (2 * sc * sc)); } // index q = d*d/4, so exp(-d*d / 2s^2) = exp(-q*4 / 2s^2)
    var sw = [0.37, 0.61, 0.78, 0.61, 0.37]; // 1D spatial weights (sigma ~1.6)
    var oY = new Float32Array(n), oB = new Float32Array(n), oR = new Float32Array(n);
    var xx, yy, ci, ni, wy, wc, sY, sB, sR, sWy, sWc, dy, dc, wsp, ix, iy, qy, qc;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        ci = y * w + x;
        if (y < 2 || x < 2 || y >= h - 2 || x >= w - 2) { oY[ci] = Y[ci]; oB[ci] = Cb[ci]; oR[ci] = Cr[ci]; continue; }
        sY = 0; sB = 0; sR = 0; sWy = 0; sWc = 0;
        for (iy = -2; iy <= 2; iy++) for (ix = -2; ix <= 2; ix++) {
          ni = ci + iy * w + ix; wsp = sw[iy + 2] * sw[ix + 2];
          dy = Y[ni] - Y[ci]; dc = Math.abs(Cb[ni] - Cb[ci]) + Math.abs(Cr[ni] - Cr[ci]);
          qy = Math.min(255, (dy * dy * 0.25) | 0); qc = Math.min(255, (dc * dc * 0.25) | 0);
          wy = wsp * LUTY[qy]; wc = wsp * LUTY[qy] * LUTC[qc];
          sY += Y[ni] * wy; sWy += wy; sB += Cb[ni] * wc; sR += Cr[ni] * wc; sWc += wc;
        }
        oY[ci] = sY / sWy; oB[ci] = sB / sWc; oR[ci] = sR / sWc;
      }
      if (prog && (y & 127) === 0) prog("noise", 0.05 + 0.3 * y / h);
    }
    for (i = 0; i < n; i++) {
      var sd = dn * (1 + 0.8 * (1 - Y[i] / 255)), bl = sd > 1 ? 1 : sd;
      var cbl = Math.min(1, dn * 1.2);                       // chroma is smoothed harder than luma
      var yN = Y[i] + (oY[i] - Y[i]) * bl, cb = Cb[i] + (oB[i] - Cb[i]) * cbl, cr = Cr[i] + (oR[i] - Cr[i]) * cbl;
      R[i] = yN + cr; B[i] = yN + cb; G[i] = (yN - 0.299 * R[i] - 0.114 * B[i]) / 0.587;
    }
    Y = Cb = Cr = oY = oB = oR = null;
  }

  /* 2. light: white balance, exposure, smooth highlight/shadow masks (linear light) */
  if (prog) prog("tone", 0.4);
  var gain = Math.pow(2, stops), needMask = sh > 0.01 || hi > 0.01, Lb = null;
  if (needMask) {
    var L0 = new Float32Array(n);
    for (i = 0; i < n; i++) L0[i] = 0.2126 * lin(R[i]) + 0.7152 * lin(G[i]) + 0.0722 * lin(B[i]);
    var rr = Math.max(2, Math.round(Math.max(w, h) * 0.035));
    Lb = boxBlur(L0, w, h, rr, 2); L0 = null;
  }
  for (i = 0; i < n; i++) {
    var r = lin(R[i]) * gr * gain, g = lin(G[i]) * gain, b = lin(B[i]) * gb * gain;
    if (needMask) {
      var ml = Math.sqrt(Math.min(1, Lb[i] * gain)), f = 1;
      if (sh > 0.01) f += sh * 1.1 * (1 - smooth(0.06, 0.55, ml));
      if (hi > 0.01) f -= hi * 0.45 * smooth(0.5, 0.98, ml);
      r *= f; g *= f; b *= f;
    }
    if (hi > 0.01) {                                      // shoulder: pull the brightest channel gently, keep hue
      var m = r > g ? (r > b ? r : b) : (g > b ? g : b);
      if (m > 0.7) { var m2 = 0.7 + (m - 0.7) * (1 - hi * 0.55); var s2 = m2 / m; r *= s2; g *= s2; b *= s2; }
    }
    R[i] = enc(r); G[i] = enc(g); B[i] = enc(b);
  }
  Lb = null;

  /* 3. vibrance (display space): low-saturation pixels more, reds and oranges protected */
  if (prog) prog("colour", 0.7);
  if (vib > 0.01) {
    for (i = 0; i < n; i++) {
      var rv = R[i], gv = G[i], bv = B[i], mx = Math.max(rv, gv, bv), mn = Math.min(rv, gv, bv);
      if (mx - mn < 3) continue;
      var sat = (mx - mn) / mx, prot = 0;
      if (mx === rv) prot = gv >= bv ? 0.8 : 0.55;           // reds, oranges, skin; magenta-reds a bit less
      else if (mx === gv && rv > bv && rv > 0.7 * gv) prot = 0.5; // yellows and olive
      var amt = vib * (1 - sat) * (1 - prot) * 1.5, lm = 0.299 * rv + 0.587 * gv + 0.114 * bv;
      R[i] = lm + (rv - lm) * (1 + amt); G[i] = lm + (gv - lm) * (1 + amt); B[i] = lm + (bv - lm) * (1 + amt);
    }
  }

  /* 4. mild unsharp on luma, scaled to output size, with coring so noise is not sharpened */
  if (prog) prog("sharpen", 0.85);
  var YY = new Float32Array(n);
  for (i = 0; i < n; i++) YY[i] = 0.299 * R[i] + 0.587 * G[i] + 0.114 * B[i];
  if (shp > 0.02) {
    var br = Math.max(1, Math.round(outLong / 1600)), YB = boxBlur(YY, w, h, br, 3), amt2 = 0.8 * shp, t2 = 2 + 1.5 * A.sigma;
    t2 *= t2;
    for (i = 0; i < n; i++) {
      var df = YY[i] - YB[i], add = df * amt2 * (df * df / (df * df + t2));
      R[i] += add; G[i] += add; B[i] += add;
    }
  }
  for (i = 0, j = 0; i < n; i++, j += 4) {
    d[j] = R[i] < 0 ? 0 : R[i] > 255 ? 255 : R[i] + 0.5; d[j + 1] = G[i] < 0 ? 0 : G[i] > 255 ? 255 : G[i] + 0.5; d[j + 2] = B[i] < 0 ? 0 : B[i] > 255 ? 255 : B[i] + 0.5;
  }
  return img;
}

/* ---------- messages ---------- */
function post(m, tr) { self.postMessage(m, tr || []); }
self.onmessage = function (e) {
  var m = e.data, s, t0 = performance.now();
  try {
    if (m.type === "init") {
      s = sessions[m.sid] = { bmp: m.bitmap, w: m.bitmap.width, h: m.bitmap.height, base: null };
      s.an = analyse(s);
      post({ type: "ready", sid: m.sid, id: m.id, analysis: s.an, ms: performance.now() - t0, scope: self.constructor && self.constructor.name, hasDocument: typeof document !== "undefined" });
    } else if (m.type === "render") {
      s = sessions[m.sid];
      var img0 = getBase(s, m.w, m.h, m.crop);
      var img = new ImageData(new Uint8ClampedArray(img0.data), m.w, m.h);        // never edit the cached base
      process(img, s.an, m.k, Math.max(m.w, m.h), null);
      post({ type: "render", sid: m.sid, id: m.id, w: m.w, h: m.h, buffer: img.data.buffer, ms: performance.now() - t0 }, [img.data.buffer]);
    } else if (m.type === "encode") {
      s = sessions[m.sid];
      var dr = drawSized(s, m.w, m.h, m.crop), im = dr.cx.getImageData(0, 0, m.w, m.h);
      process(im, s.an, m.k, Math.max(m.w, m.h), function (ph, f) { post({ type: "progress", sid: m.sid, id: m.id, phase: ph, pct: f }); });
      dr.cx.putImageData(im, 0, 0);
      post({ type: "progress", sid: m.sid, id: m.id, phase: "encode", pct: 0.92 });
      dr.cv.convertToBlob({ type: m.mime || "image/webp", quality: m.quality }).then(function (blob) {
        if (!m.square) return [blob, null];
        var q = m.square, sq = new OffscreenCanvas(q, q), sc = sq.getContext("2d"), side = Math.min(m.w, m.h);
        sc.imageSmoothingQuality = "high";
        sc.drawImage(dr.cv, (m.w - side) / 2, (m.h - side) / 2, side, side, 0, 0, q, q);   // same enhanced pixels, not enhanced twice
        return sq.convertToBlob({ type: m.mime || "image/webp", quality: m.quality }).then(function (b2) { return [blob, b2]; });
      }).then(function (pair) {
        post({ type: "encode", sid: m.sid, id: m.id, w: m.w, h: m.h, blob: pair[0], square: pair[1], ms: performance.now() - t0 });
      }, function (err) { post({ type: "error", sid: m.sid, id: m.id, message: String(err && err.message || err) }); });
    } else if (m.type === "close") {
      s = sessions[m.sid]; if (s) { try { s.bmp.close(); } catch (e2) {} delete sessions[m.sid]; }
    }
  } catch (err) {
    post({ type: "error", sid: m.sid, id: m.id, message: String(err && err.message || err) });
  }
};
