/* Photo Enhance engine (mockup phase; written the way the app's server/src/assets/*.js are:
 * a plain <script>, no modules, no build, no CDN). Defines window.PhotoEnhance.
 * Nothing loads or starts until open() is called: the Worker is created lazily then.
 * Rules: the original is never modified; every level renders from the original;
 * processing is in a Worker; a stale render never overwrites a newer one (latest wins);
 * nothing is encoded until encode() / encodeSet() is called (on confirm). */
(function () {
  "use strict";
  var SCRIPT = document.currentScript && document.currentScript.src;
  var WORKER_URL = SCRIPT ? new URL("enhance-worker.js", SCRIPT).href : "enhance-worker.js";

  var LEVELS = [
    { id: "off", label: "Original", k: 0 },
    { id: "light", label: "Light", k: 0.4 },
    { id: "balanced", label: "Balanced", k: 0.7 },
    { id: "full", label: "Full", k: 1 }
  ];
  var DEFAULT = "balanced", PREVIEW_EDGE = 1280, DECODE_CAP = 3200, CACHE_MAX = 8;

  var supported = (function () {
    try {
      return typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" &&
        typeof createImageBitmap === "function" && !!new OffscreenCanvas(1, 1).getContext("2d") &&
        typeof OffscreenCanvas.prototype.convertToBlob === "function";
    } catch (e) { return false; }
  })();

  /* counters the mockups and the check tool read; harmless in the app */
  var stats = { opens: 0, renders: 0, workerJobs: 0, dropped: 0, encodeCalls: 0, workerStarted: false, lastAnalysisMs: 0, lastRenderMs: 0, lastEncodeMs: 0, worker: null };

  function err(code, msg) { var e = new Error(msg || code); e.code = code; return e; }
  function levelOf(id) { for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) return LEVELS[i]; throw err("level", "Unknown level " + id); }
  function fit(w, h, maxEdge, crop) {
    var sw = crop ? crop.w * w : w, sh = crop ? crop.h * h : h, sc = Math.min(1, maxEdge / Math.max(sw, sh));
    return { w: Math.max(1, Math.round(sw * sc)), h: Math.max(1, Math.round(sh * sc)) };
  }
  function keyOf(id, d, crop) { return id + "|" + d.w + "x" + d.h + (crop ? "|" + [crop.x, crop.y, crop.w, crop.h].join(",") : ""); }

  /* ---------- one shared worker, one job in flight, priority queue, stale jobs dropped before they start ---------- */
  var worker = null, nextId = 1, queue = [], inflight = null, waitersById = {}, nextSid = 1, byId = {};
  function ensureWorker() {
    if (worker) return worker;
    worker = new Worker(WORKER_URL);
    stats.workerStarted = true; stats.worker = worker;
    worker.onmessage = onMsg;
    worker.onerror = function (ev) { failInflight(err("worker", ev.message || "worker error")); };
    return worker;
  }
  function failInflight(e) { var j = inflight; inflight = null; if (j) j.waiters.forEach(function (w) { w.reject(e); }); pump(); }
  function pump() {
    if (inflight) return;
    var best = -1, i, bp = -1;
    for (i = 0; i < queue.length; i++) {
      var j = queue[i];
      if (j.prio < 3 && j.waiters.every(function (w) { return w.stale(); })) {          // everyone who asked has moved on
        queue.splice(i, 1); i--; stats.dropped++; j.waiters.forEach(function (w) { w.resolve(null); }); continue;
      }
      if (j.prio > bp) { bp = j.prio; best = i; }
    }
    if (best < 0) return;
    var job = queue.splice(best, 1)[0]; inflight = job; stats.workerJobs++;
    job.msg.id = job.id; byId[job.id] = job;
    ensureWorker().postMessage(job.msg, job.transfer || []);
  }
  function enqueue(msg, prio, waiter, transfer) {
    var j = { id: nextId++, msg: msg, prio: prio, waiters: [waiter], transfer: transfer, dedupe: msg.dedupe };
    delete msg.dedupe;
    if (j.dedupe) {                                    // same level/size already queued or running: share it, and promote it
      for (var i = 0; i < queue.length; i++) if (queue[i].dedupe === j.dedupe) { queue[i].waiters.push(waiter); if (prio > queue[i].prio) queue[i].prio = prio; return; }
      if (inflight && inflight.dedupe === j.dedupe) { inflight.waiters.push(waiter); return; }
    }
    queue.push(j); pump();
  }
  function onMsg(ev) {
    var m = ev.data, job = byId[m.id];
    if (m.type === "progress") { if (job) job.waiters.forEach(function (w) { if (w.progress) w.progress(m); }); return; }
    if (!job) return;
    delete byId[m.id]; if (inflight === job) inflight = null;
    job.waiters.forEach(function (w) { if (m.type === "error") w.reject(err("worker", m.message)); else w.resolve(m); });
    pump();
  }

  /* ---------- notes: plain words from the analysis, scaled to a level ---------- */
  function round(v, p) { var f = Math.pow(10, p); return Math.round(v * f) / f; }
  function notesFor(A, k) {
    var out = [];
    if (!(k > 0)) return out;
    var st = A.stops * k;
    if (Math.abs(st) >= 0.08) out.push({ key: "exposure", label: "Brightness", value: round(st, 1), unit: "stop", text: (st > 0 ? "A little brighter" : "A little darker") });
    var sh = A.wbShift * k;
    if (Math.abs(sh) >= 0.05) out.push({ key: "whitebalance", label: "Colour balance", value: round(sh, 2), unit: "stop", text: sh > 0 ? "Slightly cooler, to take out a yellow cast" : "Slightly warmer, to take out a blue cast" });
    if (A.highlights * k >= 0.06) out.push({ key: "highlights", label: "Highlights", value: Math.round(A.highlights * k * 100), unit: "%", text: "Bright spots calmed" });
    if (A.shadows * k >= 0.06) out.push({ key: "shadows", label: "Shadows", value: Math.round(A.shadows * k * 100), unit: "%", text: "Shadows lifted" });
    if (A.vibrance * k >= 0.04) out.push({ key: "vibrance", label: "Colour", value: Math.round(A.vibrance * k * 100), unit: "%", text: "Colours a touch richer, reds left alone" });
    if (A.denoise * k >= 0.06) out.push({ key: "denoise", label: "Grain", value: Math.round(A.denoise * k * 100), unit: "%", text: "Grain smoothed" });
    if (A.sharpen * k >= 0.1) out.push({ key: "sharpen", label: "Sharpness", value: Math.round(A.sharpen * k * 100), unit: "%", text: "Edges a touch crisper" });
    if (A.good) return [{ key: "good", label: "Looks good", value: 0, unit: "", text: "Looks good already" }];
    return out;
  }

  /* ---------- decode once ---------- */
  function toBlob(source) {
    if (source instanceof Blob) return Promise.resolve(source);
    if (typeof source === "string") return fetch(source).then(function (r) { if (!r.ok) throw err("decode", "HTTP " + r.status); return r.blob(); });
    return Promise.reject(err("decode", "Unsupported source"));
  }
  function open(source, opts) {
    opts = opts || {};
    if (!supported) return Promise.reject(err("unsupported", "Enhance is not available in this browser"));
    stats.opens++;
    return toBlob(source).then(function (blob) {
      return createImageBitmap(blob, { imageOrientation: "from-image" });          // EXIF orientation honoured, decoded once
    }).catch(function (e) { throw e && typeof e.code === "string" ? e : err("decode", "This photo cannot be read here"); })
      .then(function (bmp) { var s = new Session(bmp, opts); return s._ready.catch(function (e) { try { bmp.close(); } catch (x) {} throw e; }); });
  }

  function Session(bmp, opts) {
    var self = this;
    this.original = bmp; this.width = bmp.width; this.height = bmp.height;
    this.megapixels = round(bmp.width * bmp.height / 1e6, 1);
    this.small = Math.max(bmp.width, bmp.height) < 480;
    this._sid = nextSid++; this._cache = []; this._off = {}; this._closed = false; this._an = null;
    this.notes = []; this.good = false;
    var cap = Math.min(1, DECODE_CAP / Math.max(bmp.width, bmp.height));
    var make = cap < 1 ? createImageBitmap(bmp, { resizeWidth: Math.round(bmp.width * cap), resizeHeight: Math.round(bmp.height * cap), resizeQuality: "high" }) : createImageBitmap(bmp);
    var t0 = performance.now();
    this._ready = make.then(function (copy) {
      return new Promise(function (resolve, reject) {
        var id = nextId++;
        var j = { id: id, msg: { type: "init", sid: self._sid, bitmap: copy, id: id }, prio: 4, waiters: [{ resolve: resolve, reject: reject, stale: function () { return false; } }], transfer: [copy] };
        queue.push(j); pump();
      });
    }).then(function (m) {
      self._an = m.analysis; self.analysis = m.analysis; self.good = !!m.analysis.good;
      self.notes = notesFor(m.analysis, levelOf(DEFAULT).k);
      stats.lastAnalysisMs = m.ms; stats.workerScope = m.scope; stats.workerHasDocument = m.hasDocument;
      return self;
    });
  }
  var P = Session.prototype;
  P.notesFor = function (levelId) { return notesFor(this._an, levelOf(levelId).k); };
  P._dims = function (opts) { return fit(this.width, this.height, (opts && opts.maxEdge) || PREVIEW_EDGE, opts && opts.crop); };
  P._get = function (key) { for (var i = 0; i < this._cache.length; i++) if (this._cache[i].key === key) return this._cache[i]; return null; };
  P._put = function (key, img) {
    this._cache = this._cache.filter(function (c) { return c.key !== key; });
    this._cache.push({ key: key, img: img });
    while (this._cache.length > CACHE_MAX) this._cache.shift();
  };
  P.ready = function (levelId, opts) {
    var L = levelOf(levelId); if (L.k === 0) return true;
    return !!this._get(keyOf(levelId, this._dims(opts), opts && opts.crop));
  };
  /* the original at preview size, a plain drawImage; kept as a canvas so hold-to-compare is one blit */
  P._offCanvas = function (d, crop) {
    var key = keyOf("off", d, crop), c = this._off[key];
    if (c) return c;
    c = document.createElement("canvas"); c.width = d.w; c.height = d.h;
    var cx = c.getContext("2d"); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
    if (crop) cx.drawImage(this.original, crop.x * this.width, crop.y * this.height, crop.w * this.width, crop.h * this.height, 0, 0, d.w, d.h);
    else cx.drawImage(this.original, 0, 0, d.w, d.h);
    this._off = {}; this._off[key] = c;            // keep one
    return c;
  };
  function paint(canvas, d, src) {
    if (canvas.width !== d.w) canvas.width = d.w;
    if (canvas.height !== d.h) canvas.height = d.h;
    var cx = canvas.getContext("2d");
    if (src instanceof ImageData) cx.putImageData(src, 0, 0); else cx.drawImage(src, 0, 0);
  }
  P._request = function (levelId, d, crop, prio, waiter) {
    var L = levelOf(levelId), key = keyOf(levelId, d, crop), self = this;
    enqueue({ type: "render", sid: this._sid, k: L.k, w: d.w, h: d.h, crop: crop || null, dedupe: this._sid + key }, prio, waiter);
  };
  P.render = function (levelId, canvas, opts) {
    var self = this, L = levelOf(levelId), d = this._dims(opts), crop = opts && opts.crop;
    if (this._closed) return Promise.reject(err("closed"));
    stats.renders++;
    var seq = (canvas._peSeq = (canvas._peSeq || 0) + 1);           // latest call for this canvas wins
    var stale = function () { return canvas._peSeq !== seq; };
    return this._ready.then(function () {
      if (stale()) return;
      if (L.k === 0) { paint(canvas, d, self._offCanvas(d, crop)); return; }
      var key = keyOf(levelId, d, crop), hit = self._get(key);
      if (hit) { paint(canvas, d, hit.img); return; }                // cached: same frame
      return new Promise(function (resolve, reject) {
        self._request(levelId, d, crop, 2, {
          stale: stale, reject: reject,
          resolve: function (m) {
            if (m) { var img = new ImageData(new Uint8ClampedArray(m.buffer), m.w, m.h); self._put(key, img); stats.lastRenderMs = m.ms; if (!stale() && !self._closed) paint(canvas, d, img); }
            resolve();
          }
        });
      });
    });
  };
  P.prefetch = function (levelIds, opts) {
    var self = this, d = this._dims(opts), crop = opts && opts.crop;
    return this._ready.then(function () {
      return Promise.all(levelIds.map(function (id) {
        var L = levelOf(id), key = keyOf(id, d, crop);
        if (L.k === 0) { self._offCanvas(d, crop); return null; }
        if (self._get(key) || self._closed) return null;
        return new Promise(function (resolve, reject) {
          self._request(id, d, crop, 1, {
            stale: function () { return self._closed; }, reject: reject,
            resolve: function (m) { if (m && !self._closed) { self._put(key, new ImageData(new Uint8ClampedArray(m.buffer), m.w, m.h)); stats.lastRenderMs = m.ms; } resolve(); }
          });
        });
      }));
    }).then(function () {});
  };

  /* ONLY called on confirm. Full pixels, capped at maxEdge, enhanced from the original, then encoded. */
  P.encodeSet = function (levelId, o) {
    o = o || {};
    var self = this, L = levelOf(levelId), crop = o.crop || null;
    if (this._closed) return Promise.reject(err("closed"));
    stats.encodeCalls++;
    var d = fit(this.width, this.height, o.maxEdge || 1600, crop);
    return this._ready.then(function () {
      return new Promise(function (resolve, reject) {
        enqueue({ type: "encode", sid: self._sid, k: L.k, w: d.w, h: d.h, crop: crop, mime: o.type || "image/webp", quality: o.quality == null ? 0.82 : o.quality, square: o.square || 0 }, 3, {
          stale: function () { return false; }, reject: reject, progress: o.onProgress,
          resolve: function (m) { stats.lastEncodeMs = m.ms; resolve({ blob: m.blob, width: m.w, height: m.h, square: m.square || null, squareSize: o.square || 0, ms: m.ms }); }
        });
      });
    });
  };
  P.encode = function (levelId, o) { return this.encodeSet(levelId, o).then(function (r) { return r.blob; }); };
  P.close = function () {
    if (this._closed) return; this._closed = true;
    this._cache = []; this._off = {};
    try { this.original.close(); } catch (e) {}
    if (worker) worker.postMessage({ type: "close", sid: this._sid });
  };

  window.PhotoEnhance = { LEVELS: LEVELS, DEFAULT: DEFAULT, supported: supported, open: open, stats: stats, version: "0.1.0" };
})();
