/* Photo enhance, Option A: Enhance is a second tab inside the existing Crop and rotate sheet (one sheet, crop and enhance together;
   enhance is applied to the cropped result). Plain script, no build, same style as Kitchie's server/src/assets/*.js.
   Mockup-only data (the fake recipe screen, the sample list, the side log) lives here, never in a.css.
   Loading (DESIGN.md section 6): this file is the whole default path. The engine script is injected on the first point, focus or tap on the Enhance tab;
   its Worker starts on PhotoEnhance.open(); the sample list and photos load when the source sheet opens. */
(function () {
  "use strict";
  var BASE = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, "") : ""; })();
  var ENG = BASE + "../engine/", IMG = BASE + "../../../recipe-photos/img/";
  var Q = new URLSearchParams(location.search);
  var P = { w: Q.get("w") === "360" ? "360" : "390", kind: Q.get("kind") || "banner", entry: Q.get("entry") || "add", photo: Q.get("photo") || "", tab: Q.get("tab") || "", state: Q.get("state") || "" };
  var SIZES = { banner: { w: 1600, h: 1200, name: "Banner" }, step: { w: 960, h: 720, name: "Step photo" }, more: { w: 960, h: 720, name: "More photos" }, cook: { w: 960, h: 720, name: "Photo after cooking" } };
  var LEVELS = [["off", "Original", "as shot"], ["light", "Light", "a touch"], ["balanced", "Balanced", "default"], ["full", "Full", "most"]];
  var LKEY = "pe-a-level";
  var ph = document.getElementById("ph"), aside = document.getElementById("aside");
  ph.style.setProperty("--pw", P.w + "px");
  var PE_A = window.PE_A = { engineLoads: 0, opens: 0, encodeCalls: 0, plainEncodes: 0, last: null, log: [] };
  var featOK = typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" && !!window.createImageBitmap && P.state !== "unsupported";

  var IC = {
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    crop: '<path d="M7 3v14h14M3 7h14v14"/>', eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    img: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10.5" r="1.6"/><path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4"/>',
    cam: '<path d="M4 8h3l1.6-2.5h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.1"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    rot: '<path d="M4 9a8 8 0 1 1-1 5M4 4v5h5"/>', clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>', back: '<path d="M15 6l-6 6 6 6"/>', chef: '<path d="M7 14a4 4 0 0 1-1-7.7 4.5 4.5 0 0 1 8.6-1.3 4 4 0 0 1 3.4 5.5A4 4 0 0 1 17 14v5H7z"/><path d="M7 17h10"/>'
  };
  var ic = function (n, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || "") + "</svg>"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var kb = function (b) { return b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + " KB" : (b / 1048576).toFixed(1) + " MB"; };
  var store = { get: function (k, d) { try { var v = sessionStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* fine */ } } };
  var log = function (s) { PE_A.log.push(s); var el = document.getElementById("plog"); if (el) el.textContent = PE_A.log.slice(-8).join("\n"); };

  /* ---------- the page around the phone (mockup only) ---------- */
  function href(over) { var u = new URLSearchParams(); var o = Object.assign({}, P, over || {}); Object.keys(o).forEach(function (k) { if (o[k]) u.set(k, o[k]); }); return "?" + u.toString(); }
  function chips(label, key, opts) { return '<div class="chips2"><b>' + label + "</b>" + opts.map(function (o) { return '<a href="' + href(o[2] || (function () { var x = {}; x[key] = o[0]; return x; })()) + '"' + (P[key] === o[0] ? ' aria-current="true"' : "") + ">" + o[1] + "</a>"; }).join("") + "</div>"; }
  aside.innerHTML = '<a href="../../../index.html">Mockup index</a>' +
    "<h1>Photo enhance, Option A: Enhance lives inside Crop and rotate</h1>" +
    "<p>One sheet, two tabs. Pick a photo, the Crop and rotate sheet opens, <b>Enhance</b> is its second tab and works on the cropped result. Real engine, real photos, all on this phone: <b>Stays on this phone until you confirm.</b></p>" +
    chips("Width", "w", [["360", "360"], ["390", "390"]]) +
    chips("Start with", "entry", [["add", "Add a photo"], ["existing", "Crop a saved photo"], ["cook", "After cooking"]]) +
    chips("Kind", "kind", [["banner", "Banner 1600"], ["step", "Step 960"], ["more", "More 960"]]) +
    chips("Open", "photo", [["", "Nothing yet", { photo: "" }], ["dark.jpg", "Dark", { photo: "dark.jpg", tab: "enhance" }], ["warm.jpg", "Warm", { photo: "warm.jpg", tab: "enhance" }], ["blown.jpg", "Blown", { photo: "blown.jpg", tab: "enhance" }], ["noisy.jpg", "Noisy", { photo: "noisy.jpg", tab: "enhance" }], ["good.jpg", "Good", { photo: "good.jpg", tab: "enhance" }], ["large.jpg", "Large", { photo: "large.jpg", tab: "enhance" }]]) +
    chips("Edge", "state", [["", "Normal"], ["unsupported", "No Enhance (old browser)"], ["heic", "HEIC it cannot read"]]) +
    '<details><summary>What this run did (the engine log)</summary><div class="log" id="plog" aria-live="off">Nothing yet.</div></details>';
  /* On a phone the phone IS the page: the controls move behind one small Mockup button, like every other mockup here. */
  if (window.matchMedia && matchMedia("(max-width:599.98px)").matches) {
    var mb = document.createElement("button"); mb.type = "button"; mb.className = "mockb"; mb.textContent = "Mockup"; mb.setAttribute("aria-expanded", "false");
    var mp = document.createElement("div"); mp.className = "mockp"; mp.hidden = true; mp.innerHTML = aside.innerHTML; aside.innerHTML = ""; aside.hidden = true;
    document.body.appendChild(mp); document.body.appendChild(mb);
    mb.addEventListener("click", function () { mp.hidden = !mp.hidden; mb.setAttribute("aria-expanded", String(!mp.hidden)); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") mp.hidden = true; });
  }

  /* ---------- the fake recipe edit screen: only where the sheet opens from ---------- */
  var state = { banner: IMG + "efr-1-l.webp", prevBanner: null, extra: [IMG + "efr-2-t.webp"], step: "" };
  function screen() {
    ph.innerHTML = '<div class="top"><span class="ttl">Egg fried rice</span></div><div class="pbody" id="pbody">' +
      '<h2>Banner <span class="kindtag">1600 px</span></h2><div class="edpv" id="vban"><img class="pimg" alt="Banner photo of egg fried rice" src="' + state.banner + '"></div>' +
      '<div class="prow"><button type="button" class="mini pri" data-act="banner-opts">' + ic("img", "s") + " Photo options</button></div>" +
      '<h2>Step 3 <span class="kindtag">960 px</span></h2><div class="stepcard"><p>Tip in the cold rice and break up any lumps.</p><div id="vstep"></div><div class="prow"><button type="button" class="mini" data-act="add-step">' + ic("cam", "s") + " Add a photo</button></div></div>" +
      '<h2>More photos <span class="kindtag">960 px</span></h2><div class="thumbs" id="vmore">' + state.extra.map(function (u) { return '<div class="pth"><img alt="" src="' + u + '"></div>'; }).join("") + '</div><div class="prow"><button type="button" class="mini" data-act="add-more">' + ic("cam", "s") + " Add a photo</button></div>" +
      '<div class="cookcard"><b>Cooked it?</b><p>Cook mode: add a photo after cooking. It goes straight up, no sheet, no Enhance.</p><div class="thumbs" id="vcook"></div><button type="button" class="mini" data-act="add-cook">' + ic("chef", "s") + " Add a photo of dinner</button></div></div>";
  }
  var toastT;
  function toast(msg, undo, ms) {
    var old = ph.querySelector(".toast"); if (old) old.remove();
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
    t.innerHTML = "<span>" + msg + "</span>" + (undo ? '<button type="button">Undo</button>' : ""); ph.appendChild(t);
    if (undo) t.querySelector("button").onclick = function () { t.remove(); undo(); };
    clearTimeout(toastT); toastT = setTimeout(function () { t.remove(); }, ms || 5000);
  }
  /* The app's sheet: scrim + .sheet role=dialog. Escape and the scrim close it; focus goes in and comes back. */
  function sheet(html, ready) {
    var from = document.activeElement, s = document.createElement("div");
    s.innerHTML = '<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + "</div>";
    ph.appendChild(s);
    var onKey = function (e) { if (e.key === "Escape") close(); };
    var close = function () { document.removeEventListener("keydown", onKey); s.remove(); if (from && from.focus && document.contains(from)) try { from.focus(); } catch (e) { /* fine */ } if (s.__onclose) s.__onclose(); };
    document.addEventListener("keydown", onKey);
    s.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) close(); });
    var sh = s.querySelector(".sheet"); sh.__root = s;
    if (ready) ready(sh, close, function (fn) { s.__onclose = fn; });
    sh.tabIndex = -1; sh.style.outline = "none"; sh.focus({ preventScroll: true });
    return close;
  }

  /* ---------- decoding ---------- */
  function viaImage(src) {
    return new Promise(function (ok, no) {
      var u = typeof src === "string" ? src : URL.createObjectURL(src), i = new Image();
      i.onload = function () { if (typeof src !== "string") URL.revokeObjectURL(u); ok(i); };
      i.onerror = function () { if (typeof src !== "string") URL.revokeObjectURL(u); no(new Error("read")); };
      i.src = u;
    });
  }
  function decode(src) {
    if (P.state === "heic") return Promise.reject(new Error("heic"));
    if (typeof src === "string") return viaImage(src);
    if (window.createImageBitmap) return createImageBitmap(src, { imageOrientation: "from-image" }).catch(function () { return viaImage(src); });
    return viaImage(src);
  }
  var dims = function (im) { return { w: im.width || im.naturalWidth, h: im.height || im.naturalHeight }; };
  var toBlob = function (cv, type, q) { return new Promise(function (ok, no) { cv.toBlob(function (b) { b ? ok(b) : no(new Error("canvas")); }, type, q); }); };
  /* What the phone does today: shrink to the long edge, re-draw (EXIF and location gone), WebP; plus the 240 px square. Used by Skip and by the cook path. */
  function shrink(im, edge) {
    var d = dims(im), k = Math.min(1, edge / Math.max(d.w, d.h)), cv = document.createElement("canvas"); cv.width = Math.round(d.w * k); cv.height = Math.round(d.h * k);
    var g = cv.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, 0, 0, cv.width, cv.height); PE_A.plainEncodes++;
    return toBlob(cv, "image/webp", 0.82);
  }
  /* The square is cut from the SAME finished picture (enhanced or not), so it is never enhanced twice. */
  function square(blob) {
    return decode(blob).then(function (im) {
      var d = dims(im), s = Math.min(d.w, d.h), cv = document.createElement("canvas"); cv.width = cv.height = 240;
      var g = cv.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, (d.w - s) / 2, (d.h - s) / 2, s, s, 0, 0, 240, 240); return toBlob(cv, "image/webp", 0.8);
    });
  }

  /* ---------- the engine, fetched on engagement ---------- */
  var engineP = null;
  function loadEngine() {
    if (!featOK) return Promise.reject({ code: "unsupported" });
    if (window.PhotoEnhance) return Promise.resolve(window.PhotoEnhance);
    if (!engineP) engineP = new Promise(function (ok, no) {
      var j = document.createElement("script"); j.src = ENG + "enhance.js"; PE_A.engineLoads++;
      j.onload = function () { window.PhotoEnhance && window.PhotoEnhance.supported ? ok(window.PhotoEnhance) : no({ code: "unsupported" }); };
      j.onerror = function () { no({ code: "unsupported" }); }; document.head.appendChild(j);
    });
    return engineP;
  }

  /* ---------- sources ---------- */
  var samplesP = null;
  function samples() { return samplesP || (samplesP = fetch(ENG + "samples/samples.json").then(function (r) { return r.json(); }).catch(function () { return []; })); }
  function openSource(kind, existing) {
    var S = SIZES[kind], title = kind === "cook" ? "Photo of what you cooked" : (existing ? "Replace " : "Add ") + (kind === "banner" ? "the banner" : kind === "step" ? "the step photo" : "a photo");
    sheet("<h3>" + esc(title) + '</h3><p class="cnote" style="margin:4px 0 0">Your phone shrinks it to ' + S.w + ' px first. <b>Stays on this phone until you confirm.</b></p>' +
      '<div class="srcgrid" id="srcg" aria-label="Sample photos"></div>' +
      '<label class="ownpick">' + ic("cam") + '<span style="flex:1"><b>Try your own photo</b><small>Take one or choose one. Never leaves this page.</small></span><input type="file" accept="image/*"></label>' +
      '<button type="button" class="btn ghost" data-close style="width:100%;margin-top:var(--sp-2)">Cancel</button>',
      function (s, close) {
        samples().then(function (list) {
          var g = s.querySelector("#srcg"); if (!g) return;
          g.innerHTML = list.length ? list.map(function (x) { return '<button type="button" data-f="' + esc(x.file) + '" aria-label="' + esc(x.label) + '"><img alt="" loading="lazy" decoding="async" src="' + ENG + "samples/" + esc(x.file) + '"><span>' + esc(x.label) + "</span></button>"; }).join("") : '<p class="cnote">The sample photos come with the engine. Use your own photo meanwhile.</p>';
        });
        s.addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (!b) return; var f = b.dataset.f; close(); fromSample(f, kind, existing); });
        s.querySelector("input[type=file]").addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; close(); picked(f, kind, existing, f.name); });
      });
  }
  function fromSample(f, kind, existing) { fetch(ENG + "samples/" + f).then(function (r) { return r.blob(); }).then(function (b) { picked(b, kind, existing, f); }, function () { toast("Could not open that sample."); }); }
  function picked(blob, kind, existing, name) {
    log("picked " + name + " " + kb(blob.size) + " for " + kind + (kind === "cook" ? " (cook path: no sheet)" : ""));
    if (kind === "cook") { decode(blob).then(function (im) { var d0 = dims(im), k0 = Math.min(1, SIZES.cook.w / Math.max(d0.w, d0.h)); return shrink(im, SIZES.cook.w).then(function (b) { return square(b).then(function (sq) { handOff(kind, b, sq, null, { w: Math.round(d0.w * k0), h: Math.round(d0.h * k0) }); }); }); }, function () { bad(); }); return; }
    cropSheet({ source: blob, kind: kind, name: name, add: true });
  }
  var bad = function () { toast("Use a JPEG, PNG or WebP picture. This one could not be read."); log("decode failed (a format this browser cannot open, such as HEIC)"); };

  /* ---------- the queue hand-off (Kitchie's photo-queue states, drawn not reinvented) ---------- */
  function handOff(kind, blob, sq, info, d) {
    var url = URL.createObjectURL(blob), host, badge = document.createElement("span"); badge.className = "pq"; badge.setAttribute("role", "status");
    if (kind === "banner") { host = ph.querySelector("#vban"); state.prevBanner = state.banner; host.querySelector("img").src = url; state.banner = url; }
    else if (kind === "step") { host = document.createElement("div"); host.className = "edpv"; host.style.marginTop = "var(--sp-2)"; host.innerHTML = '<img class="pimg" alt="Step photo" src="' + url + '">'; ph.querySelector("#vstep").appendChild(host); }
    else { host = document.createElement("div"); host.className = "pth"; host.innerHTML = '<img alt="" src="' + url + '">'; ph.querySelector(kind === "cook" ? "#vcook" : "#vmore").appendChild(host); }
    host.appendChild(badge); host.scrollIntoView({ block: "nearest" });
    var steps = [["Waiting", 350], ["Uploading 40%", 700], ["Uploading 90%", 700], ["Photo is being prepared", 900]], i = 0;
    (function next() { if (i >= steps.length) { badge.remove(); return; } badge.textContent = steps[i][0]; badge.dataset.q = i < 1 ? "queued" : i < 3 ? "uploading" : "processing"; setTimeout(next, steps[i++][1]); })();
    var line = esc(SIZES[kind].name) + ": " + (d ? Math.max(d.w, d.h) : SIZES[kind].w) + " px long edge, " + kb(blob.size) + ", square " + kb(sq.size) + (info && info.level && info.level !== "off" ? ". Enhanced: " + esc(info.label) : (info ? ". Not enhanced" : ""));
    PE_A.last = { kind: kind, bytes: blob.size, squareBytes: sq.size, level: info && info.level || "off", edge: d ? Math.max(d.w, d.h) : null };
    log("sent to the queue: " + line.replace(/&[a-z]+;/g, ""));
    toast(line + ". Undo for 5 minutes.", function () { host.remove(); if (kind === "banner") { ph.querySelector("#vban img").src = state.prevBanner; state.banner = state.prevBanner; } log("undone (the stored photo was the enhanced one; the original is not kept)"); }, 9000);
  }

  /* ---------- the Crop and rotate sheet with the Enhance tab ---------- */
  function cropSheet(ctx) {
    var kind = ctx.kind, S = SIZES[kind], W = S.w, H = S.h, big = ctx.source && ctx.source.size > 3 * 1024 * 1024;
    var t = { x: 0, y: 0, rot: 0, z: 1 }, img = null, st = { ses: null, sig: "", tok: 0, level: store.get(LKEY, "balanced"), visited: false, stale: false, busy: false, latch: false };
    var tabs = featOK ? '<div class="etabs" role="tablist" aria-label="Crop or enhance"><button type="button" role="tab" id="tcrop" aria-selected="true" aria-controls="pcrop">' + ic("crop", "s") + 'Crop</button><button type="button" role="tab" id="tenh" aria-selected="false" aria-controls="penh" tabindex="-1">' + ic("spark", "s") + 'Enhance<i class="dot2" aria-hidden="true"></i></button></div>' : "";
    var html = '<div class="hrow"><h3>Crop and rotate</h3>' + (ctx.add ? '<button type="button" class="mini" data-asis>Upload as is</button>' : "") + "</div>" +
      '<p class="sub"><span class="kindtag">' + esc(S.name) + "</span><span>" + (ctx.existing ? "Works on the saved copy." : "Stays on this phone until you tap Use photo.") + "</span></p>" + tabs +
      '<div class="cstage"><div class="cframe" id="cframe" data-tab="crop" tabindex="0" aria-label="Photo. Drag to move it, or use the arrow keys."><canvas id="ccv" width="640" height="480"></canvas><canvas class="ocv" id="ocv" width="640" height="480"></canvas><canvas class="ecv" id="ecv" width="640" height="480"></canvas>' +
      '<span class="echip" id="echip" role="status"></span><button type="button" class="ehold" id="ehold" aria-pressed="false" aria-label="Show the original. Hold to look, or press once to switch.">' + ic("eye", "s") + '<span>Hold: original</span></button></div></div>' +
      '<div id="pcrop" role="tabpanel"><div class="crow"><button type="button" class="mini ico" data-rot="-90" aria-label="Rotate left">' + ic("rot", "s") + '</button><input type="range" id="cz" min="1" max="3" step="0.01" value="1" aria-label="Zoom"><button type="button" class="mini ico" data-rot="90" aria-label="Rotate right">' + ic("rot", "s") + "</button></div></div>" +
      '<div id="penh" role="tabpanel" hidden><div class="elev" role="group" aria-label="How much">' + LEVELS.map(function (l) { return '<button type="button" data-lv="' + l[0] + '" aria-pressed="false">' + l[1] + "<small>" + l[2] + "</small></button>"; }).join("") + '</div>' +
      '<details class="enotes" id="enotes"><summary id="enotesum">What changed</summary><ul id="enotel"><li>Looking at your photo…</li></ul></details><p class="egood" id="egood" hidden>' + ic("check", "xs") + "<span></span></p></div>" +
      '<p class="cinfo" id="cinfo"></p><p class="cnote" id="cnote"></p><p class="cerr" id="cerr" role="alert" hidden></p><div class="pbar" id="pb" hidden><i></i></div>' +
      '<div class="cbar"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn" data-save disabled>Use photo</button></div>';
    sheet(html, function (s, close) {
      var $ = function (q) { return s.querySelector(q); };
      var fr = $("#cframe"), cv = $("#ccv"), ocv = $("#ocv"), ecv = $("#ecv"), chip = $("#echip"), hold = $("#ehold"), sv = $("[data-save]"), info = $("#cinfo"), note = $("#cnote"), err = $("#cerr"), pb = $("#pb");
      var tmp = document.createElement("canvas"), tab = "crop";
      fr.__cancelled = false;
      sv.disabled = true; info.innerHTML = ic("clock", "xs") + "<span>" + (big ? "Reading a big photo. This takes a moment." : "Reading your photo…") + "</span>"; pb.hidden = false; pb.classList.add("run");
      s.__root.__onclose = function () { st.tok++; if (st.ses) { try { st.ses.close(); } catch (e) { /* fine */ } st.ses = null; } };

      function paint(target, tw, th) {
        var g = target.getContext("2d"); g.clearRect(0, 0, tw, th); g.fillStyle = "#000"; g.fillRect(0, 0, tw, th); if (!img) return;
        var d = dims(img), odd = (t.rot / 90) % 2 !== 0, bw = odd ? d.h : d.w, bh = odd ? d.w : d.h, cover = Math.max(tw / bw, th / bh) * t.z;
        g.imageSmoothingQuality = "high"; g.save(); g.translate(tw / 2 + t.x * tw, th / 2 + t.y * th); g.rotate(t.rot * Math.PI / 180); g.scale(cover, cover); g.drawImage(img, -d.w / 2, -d.h / 2); g.restore();
      }
      var sig = function () { return [t.x.toFixed(3), t.y.toFixed(3), t.rot, t.z.toFixed(2)].join("|"); };
      var redraw = function () { paint(cv, cv.width, cv.height); st.stale = !!st.ses && st.sig !== sig(); infoLine(); };
      var clamp = function () { var m = (t.z - 1) / 2; t.x = Math.max(-m, Math.min(m, t.x)); t.y = Math.max(-m, Math.min(m, t.y)); };
      function levelLabel(id) { return (LEVELS.filter(function (l) { return l[0] === id; })[0] || LEVELS[2])[1]; }
      function infoLine() {
        if (st.busy) return; var d = img && dims(img), soft = img && Math.max(d.w, d.h) / t.z < W * 0.5;
        var on = st.visited && st.level !== "off";
        info.innerHTML = ic(soft ? "x" : "check", "xs") + "<span>Saves at <b>" + W + " × " + H + "</b> px." + (soft ? " That is small for this photo: it will look soft." : "") + (on ? " Enhance: <b>" + esc(levelLabel(st.level)) + "</b>." : "") + (big && tab === "enhance" ? " Big photo: preview here, full size made when you tap Use photo." : "") + "</span>";
        note.innerHTML = tab === "enhance" ? "<b>Recipe keeps no original.</b> The saved photo is the cropped, enhanced one, so Enhance cannot be switched off later. Undo works for 5 minutes." : "<b>Recipe keeps no original.</b> What you crop away is gone for good once the 5 minutes of undo end." + (ctx.existing ? " Zooming in leaves fewer pixels, which can look soft." : "");
      }
      decode(ctx.source || ctx.url).then(function (im) {
        img = im; sv.disabled = false; pb.classList.remove("run"); pb.hidden = true; redraw();
        var d = dims(im); if (d.w * d.h > 12e6) { big = true; infoLine(); } log("decoded " + d.w + "x" + d.h + " (" + (d.w * d.h / 1e6).toFixed(1) + " MP)");
        if (P.tab === "enhance" && featOK && !ctx.autoDone) { ctx.autoDone = true; setTab("enhance"); }
      }, function () { close(); bad(); });

      /* crop gestures, as the app has them */
      var drag = null;
      fr.addEventListener("pointerdown", function (e) { if (tab !== "crop") return; drag = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y }; try { fr.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } });
      fr.addEventListener("pointermove", function (e) { if (!drag) return; t.x = drag.tx + (e.clientX - drag.x) / fr.clientWidth; t.y = drag.ty + (e.clientY - drag.y) / fr.clientHeight; clamp(); redraw(); });
      var up = function () { drag = null; }; fr.addEventListener("pointerup", up); fr.addEventListener("pointercancel", up);
      fr.addEventListener("keydown", function (e) { if (tab !== "crop") return; var k = { ArrowLeft: [-.03, 0], ArrowRight: [.03, 0], ArrowUp: [0, -.03], ArrowDown: [0, .03] }[e.key]; if (k) { e.preventDefault(); t.x += k[0]; t.y += k[1]; clamp(); redraw(); } });
      $("#cz").addEventListener("input", function (e) { t.z = +e.target.value; clamp(); redraw(); });
      s.addEventListener("click", function (e) { var r = e.target.closest("[data-rot]"); if (r) { t.rot = (t.rot + +r.dataset.rot + 360) % 360; t.x = 0; t.y = 0; redraw(); } });
      fr.addEventListener("contextmenu", function (e) { e.preventDefault(); });

      /* tabs */
      var tc = $("#tcrop"), te = $("#tenh");
      function setTab(n) {
        if (!te || st.busy) return; tab = n; fr.dataset.tab = n; releasePeek();
        tc.setAttribute("aria-selected", n === "crop"); te.setAttribute("aria-selected", n === "enhance"); tc.tabIndex = n === "crop" ? 0 : -1; te.tabIndex = n === "enhance" ? 0 : -1;
        $("#pcrop").hidden = n !== "crop"; $("#penh").hidden = n !== "enhance"; fr.setAttribute("aria-label", n === "crop" ? "Photo. Drag to move it, or use the arrow keys." : "Photo preview. Press and hold to see the original."); infoLine();
        if (n === "enhance") startEnhance();
      }
      if (te) {
        var warm = function () { loadEngine().catch(function () { /* handled on open */ }); };
        ["pointerenter", "focus", "touchstart"].forEach(function (ev) { te.addEventListener(ev, warm, { once: true, passive: true }); });
        tc.onclick = function () { setTab("crop"); }; te.onclick = function () { setTab("enhance"); };
        $(".etabs").addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); var n = tab === "crop" ? "enhance" : "crop"; setTab(n); (n === "crop" ? tc : te).focus(); } });
      }
      function noEnhance() { if (!te) return; te.remove(); $(".etabs").remove(); tab = "crop"; fr.dataset.tab = "crop"; $("#pcrop").hidden = false; $("#penh").hidden = true; st.ses = null; log("engine unsupported: Enhance hidden, sheet is the plain Crop and rotate sheet"); infoLine(); }

      /* Enhance: open a session on the CROPPED result */
      function cropBlob() { var out = document.createElement("canvas"); out.width = W; out.height = H; paint(out, W, H); return toBlob(out, "image/png"); }
      function startEnhance() {
        st.visited = true; if (st.ses && st.sig === sig()) { showLevel(st.level, true); return; }
        var tok = ++st.tok; ocv.width = 640; ocv.height = 480; ocv.getContext("2d").drawImage(cv, 0, 0); ecv.getContext("2d").clearRect(0, 0, ecv.width, ecv.height);
        setChip("prep", "Preparing…"); mark(st.level);
        if (st.ses) { try { st.ses.close(); } catch (e) { /* fine */ } st.ses = null; }
        var mySig = sig();
        loadEngine().then(function () { return cropBlob(); }).then(function (blob) { if (tok !== st.tok) return null; PE_A.opens++; return window.PhotoEnhance.open(blob); }).then(function (ses) {
          if (!ses) return; if (tok !== st.tok) { ses.close(); return; }
          st.ses = ses; st.sig = mySig; st.stale = false; notes(ses);
          return ses.render("off", ocv).then(function () { if (tok !== st.tok) return; showLevel(st.level, true); ses.prefetch(["light", "balanced", "full"]).catch(function () { /* fine */ }); });
        }).catch(function (e) { if (e && e.code === "unsupported" || !window.PhotoEnhance) noEnhance(); else { setChip("prep", "Enhance did not start"); err.textContent = "Enhance did not start. You can still use the photo as it is."; err.hidden = false; log("enhance error " + (e && (e.code || e.message))); } });
      }
      function notes(ses) {
        var n = ses.notes || [], good = ses.good === true || !n.length || n.some(function (x) { return /looks good already/i.test(x.text || ""); }), ul = $("#enotel"), eg = $("#egood");
        ul.innerHTML = n.filter(function (x) { return !/looks good already/i.test(x.text || ""); }).map(function (x) { return "<li>" + esc(x.text) + "</li>"; }).join("") || "<li>Nothing to change.</li>";
        $("#enotesum").textContent = good ? "Nothing needed" : "What changed";
        eg.hidden = !good; if (good) eg.querySelector("span").textContent = "Looks good already. Balanced barely changes this one, so Original may be all you need.";
      }
      function mark(id) { s.querySelectorAll("[data-lv]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lv === id)); }); }
      function setChip(kindS, text) { chip.dataset.s = kindS; chip.textContent = text; }
      function chipFor() { if (st.latch || fr.classList.contains("peek")) return setChip("orig", "Original"); setChip("ok", st.level === "off" ? "Original" : "Enhanced · " + levelLabel(st.level)); }
      function showLevel(id, first) {
        var ses = st.ses; st.level = id; store.set(LKEY, id); mark(id); infoLine(); if (!ses) return;
        var tok = ++st.tok2 || (st.tok2 = 1);
        if (id === "off") { ecv.getContext("2d").clearRect(0, 0, ecv.width, ecv.height); chipFor(); return; }
        var cached = ses.ready(id); if (!cached) setChip("prep", "Preparing…");
        ses.render(id, tmp).then(function () {
          if (tok !== st.tok2 || !st.ses) return; ecv.width = tmp.width; ecv.height = tmp.height; ecv.getContext("2d").drawImage(tmp, 0, 0); chipFor();
        }, function (e) { if (tok === st.tok2) { setChip("prep", "Could not make that one"); log("render error " + (e && e.message)); } });
      }
      s.addEventListener("click", function (e) { var b = e.target.closest("[data-lv]"); if (b && st.ses) showLevel(b.dataset.lv); else if (b) { st.level = b.dataset.lv; store.set(LKEY, st.level); mark(st.level); } });

      /* press and hold to see the original: touch, mouse and keyboard on the button; press and hold on the picture itself too;
         one quick press on the button switches and stays (for people who cannot hold); a screen reader's click does the same */
      function peek(on) { fr.classList.toggle("peek", on); hold.setAttribute("aria-pressed", String(on)); hold.querySelector("span").textContent = on ? (st.latch ? "Tap: back to enhanced" : "Release: enhanced") : "Hold: original"; chipFor(); }
      function releasePeek() { st.latch = false; if (fr.classList.contains("peek")) peek(false); }
      function bindHold(el, canLatch) {
        var t0 = 0, active = false;
        var down = function () { if (active) return; active = true; t0 = Date.now(); if (st.latch) { st.latch = false; peek(false); active = "unlatch"; return; } peek(true); };
        var upf = function () { if (!active) return; var was = active; active = false; if (was === "unlatch") return; if (canLatch && Date.now() - t0 < 220) { st.latch = true; peek(true); } else peek(false); };
        el.addEventListener("pointerdown", function (e) { if (tab !== "enhance") return; e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } down(); });
        el.addEventListener("pointerup", function (e) { e.stopPropagation(); upf(); }); el.addEventListener("pointercancel", upf); el.addEventListener("lostpointercapture", upf);
        el.addEventListener("contextmenu", function (e) { e.preventDefault(); }); el.addEventListener("dragstart", function (e) { e.preventDefault(); });
        if (canLatch) {
          el.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) down(); } });
          el.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); upf(); } });
          el.addEventListener("blur", function () { if (active) { active = false; peek(false); } });
          el.addEventListener("click", function (e) { if (e.detail === 0 && !e.__k) { st.latch = !st.latch; peek(st.latch); } }); /* a screen reader's activation: a plain toggle */
        }
      }
      bindHold(hold, true); bindHold(fr, false);
      window.addEventListener("blur", releasePeek);

      /* confirm: the ONLY moment an enhanced picture is encoded */
      var busy = function (on, text) { st.busy = on; sv.disabled = on; s.querySelectorAll("button,input").forEach(function (b) { if (b !== sv) b.disabled = on; }); pb.hidden = !on; pb.classList.toggle("run", on); if (on) info.innerHTML = ic("clock", "xs") + "<span>" + text + "</span>"; };
      function finish(made, wasEnh, d) { var q = square(made); return q.then(function (sq) { close(); handOff(kind, made, sq, { level: wasEnh ? st.level : "off", label: levelLabel(st.level) }, d); }); }
      sv.onclick = function () {
        err.hidden = true; var enh = st.visited && st.level !== "off" && !!window.PhotoEnhance && !!st.ses;
        busy(true, enh ? (big ? "Making the full-size photo. Big photos take a few seconds." : "Making your photo…") : "Making your photo…");
        var work;
        if (enh) {
          work = Promise.resolve(st.ses && st.sig === sig() ? st.ses : cropBlob().then(function (b) { PE_A.opens++; return window.PhotoEnhance.open(b); }).then(function (ses) { if (st.ses) st.ses.close(); st.ses = ses; st.sig = sig(); return ses; }))
            .then(function (ses) { PE_A.encodeCalls++; log("encode(" + st.level + ", maxEdge " + W + ") on confirm"); return ses.encode(st.level, { maxEdge: W, type: "image/webp", quality: 0.82 }); });
        } else {
          work = Promise.resolve().then(function () { var out = document.createElement("canvas"); out.width = W; out.height = H; paint(out, W, H); PE_A.plainEncodes++; return toBlob(out, "image/webp", 0.82); });
        }
        work.then(function (b) { return finish(b, enh, { w: W, h: H }); }).catch(function (e) { busy(false); infoLine(); err.textContent = "That did not work. Nothing was changed. Try again."; err.hidden = false; sv.textContent = "Try again"; log("confirm error " + (e && (e.code || e.message))); });
      };
      var asis = $("[data-asis]");
      if (asis) asis.onclick = function () {
        busy(true, "Uploading as it is…");
        shrink(img, W).then(function (b) { var d = dims(img), k = Math.min(1, W / Math.max(d.w, d.h)); return square(b).then(function (sq) { close(); handOff(kind, b, sq, null, { w: Math.round(d.w * k), h: Math.round(d.h * k) }); }); }).catch(function () { busy(false); err.textContent = "That did not work. Nothing was changed."; err.hidden = false; });
      };
    });
  }

  /* ---------- wiring ---------- */
  screen();
  ph.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return; var a = b.dataset.act;
    if (a === "add-step") openSource("step"); else if (a === "add-more") openSource("more"); else if (a === "add-cook") openSource("cook");
    else if (a === "banner-opts") sheet("<h3>Banner</h3>" + '<button type="button" class="opt" data-a="rep">' + ic("cam") + '<span class="t"><b>Replace banner</b><small>Camera or your photos. Then Crop and rotate, with Enhance.</small></span></button><button type="button" class="opt" data-a="crop">' + ic("img") + '<span class="t"><b>Crop and rotate</b><small>Works on the saved copy. Enhance is in here too.</small></span></button><button type="button" class="btn ghost" data-close style="width:100%;margin-top:var(--sp-2)">Cancel</button>', function (s, close) {
      s.addEventListener("click", function (ev) { var o = ev.target.closest("[data-a]"); if (!o) return; close(); if (o.dataset.a === "rep") openSource("banner", true); else cropSheet({ url: state.banner, kind: "banner", existing: true }); });
    });
  });
  if (P.photo) { if (P.entry === "cook") fromSample(P.photo, "cook"); else fromSample(P.photo, SIZES[P.kind] && P.kind !== "cook" ? P.kind : "banner", P.entry === "existing"); }
  else if (P.entry === "existing") cropSheet({ url: state.banner, kind: SIZES[P.kind] ? P.kind : "banner", existing: true });
  else if (P.entry === "cook") openSource("cook");
})();
