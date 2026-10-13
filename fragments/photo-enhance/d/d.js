/* Option D shell (mockup only): the Photos part of Edit by hand, the Add / Replace picker, a stand-in for the photo queue, and the Mockup panel.
   The Enhance sheet itself is split.js, fetched with the engine on the first photo action (DESIGN.md section 6). */
(function () {
"use strict";
var Q = new URLSearchParams(location.search);
var HERE = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, "") : ""; })();
var IMG = HERE + "../../../recipe-photos/img/", ENG = HERE + "../engine/";
var ph = document.getElementById("ph");
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var IC = {
  back: '<path d="M15 6l-6 6 6 6"/>', cam: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  img: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 18l5-5 4 4 2-2 3 3"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>', hand: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-1.5V5a1.5 1.5 0 0 1 3 0v6m0-3a1.5 1.5 0 0 1 3 0v6.5A6 6 0 0 1 11 20a6 6 0 0 1-5-2.7L4 14a1.5 1.5 0 0 1 2.4-1.8L8 14"/>',
  split: '<path d="M12 4v16"/><path d="M8 9l-4 3 4 3M16 9l4 3-4 3"/>', clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>', cook: '<path d="M7 14a4 4 0 0 1-1-7.7 4.5 4.5 0 0 1 8.6-1.3 4 4 0 0 1 3.4 5.5A4 4 0 0 1 17 14v5H7z"/><path d="M7 17h10"/>'
};
var ic = function (n, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || "") + "</svg>"; };

/* ---- sheet and toast, as recipe.js draws them; the sheet gets an onClose so the Enhance session can be freed ---- */
var toastT;
function toast(msg, undo) {
  var old = ph.querySelector(".toast"); if (old) old.remove();
  var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
  t.innerHTML = "<span>" + msg + "</span>" + (undo ? '<button type="button">Undo</button>' : "");
  ph.appendChild(t); if (undo) t.querySelector("button").onclick = function () { t.remove(); undo(); };
  clearTimeout(toastT); toastT = setTimeout(function () { t.remove(); }, 4500);
}
function sheet(html, onReady, onClose) {
  var s = document.createElement("div"); s.innerHTML = '<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + "</div>";
  ph.appendChild(s); var gone = false;
  var close = function (why) { if (gone) return; gone = true; s.remove(); document.removeEventListener("keydown", esc2); if (onClose) onClose(why || "cancel"); };
  var esc2 = function (e) { if (e.key === "Escape") close("cancel"); };
  document.addEventListener("keydown", esc2);
  s.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) close("cancel"); });
  if (onReady) onReady(s.querySelector(".sheet"), close);
  return close;
}
var X = { ic: ic, esc: esc, sheet: sheet, toast: toast };

/* ---- sizes: what the app does today (recipes-edit-photo.js shrink), shared by Skip and by the unsupported fallback ---- */
var KIND = {
  banner: { label: "Banner", edge: 1600, noun: "the banner", what: "banner size (1600 px) and a square" },
  step: { label: "Step photo", edge: 960, noun: "the step photo", what: "medium (960 px) and a square" },
  more: { label: "Photo", edge: 960, noun: "the photo", what: "medium (960 px) and a square" },
  cook: { label: "Cook photo", edge: 960, noun: "the cook photo", what: "medium (960 px) and a square" }
};
var toBlob = function (cv, q) { return new Promise(function (ok, no) { try { cv.toBlob(function (b) { b ? ok(b) : no(new Error("encode")); }, "image/webp", q); } catch (e) { no(e); } }); };
/* A drawable (ImageBitmap, canvas or image) at its long edge `edge`, plus the 240 px square from the centre, both WebP. */
function sizesOf(draw, w, h, edge) {
  var k = Math.min(1, edge / Math.max(w, h)), W = Math.max(1, Math.round(w * k)), H = Math.max(1, Math.round(h * k));
  var big = document.createElement("canvas"); big.width = W; big.height = H; var g = big.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(draw, 0, 0, W, H);
  return squareOf(big).then(function (r) { return toBlob(big, 0.82).then(function (b) { return { blob: b, sq: r, w: W, h: H }; }); });
}
function squareOf(cv) {
  var sq = document.createElement("canvas"); sq.width = sq.height = 240; var s = Math.min(cv.width, cv.height);
  sq.getContext("2d").drawImage(cv, (cv.width - s) / 2, (cv.height - s) / 2, s, s, 0, 0, 240, 240);
  return toBlob(sq, 0.8);
}
function bitmapOf(src) {
  var p = typeof src === "string" ? fetch(src).then(function (r) { return r.blob(); }) : Promise.resolve(src);
  return p.then(function (b) { return createImageBitmap(b, { imageOrientation: "from-image" }); });
}
var D = window.PEDemo = { encodes: 0, last: "", listeners: [], sizesOf: sizesOf, squareOf: squareOf, KIND: KIND, X: X, state: { banner: IMG + "efr-1-l.webp" }, tell: function (m) { D.last = m; D.listeners.forEach(function (f) { f(); }); } };

/* ---- lazy loading: the engine and the Enhance sheet are fetched when a person first taps Add or Replace ---- */
var need = null;
function load(src) { return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = function () { no(new Error("load " + src)); }; document.head.appendChild(s); }); }
function warm() {
  if (need) return need;
  var css = document.createElement("link"); css.rel = "prefetch"; // nothing: d.css is already in; kept so the pattern is visible
  need = (Q.get("demo") === "noengine" ? Promise.reject(new Error("x")) : load(ENG + "enhance.js")).then(function () { return load(HERE + "split.js"); }).catch(function () { return null; });
  return need;
}

/* ---- the screen behind: Photos of a recipe version (stand-in for Edit by hand, Photos section) ---- */
var kind0 = Q.get("kind") || "banner", ver = "Egg fried rice";
function tiles() {
  return '<div class="top"><a class="back" href="../index.html" aria-label="Back to options" style="display:inline-flex;align-items:center;min-height:44px;min-width:44px">' + ic("back") + '</a><span class="ttl">Photos · ' + esc(ver) + '</span><span style="width:44px"></span></div>' +
    '<div class="body"><div class="pgs">' +
    '<h2>Banner <small>1600 px, one per version</small></h2>' +
    '<div class="edban pqtile" id="t-banner"><img class="pq-prev" id="i-banner" alt="Current banner" src="' + D.state.banner + '"></div>' +
    '<div id="u-banner"></div>' +
    '<button type="button" class="opt" data-add="banner">' + ic("cam") + '<span class="t"><b>Replace banner</b><small>Camera or your photos. Enhance is optional.</small></span></button>' +
    '<h2>Step photo <small>960 px</small></h2>' +
    '<div class="pgrow"><span class="edph has pqtile" id="t-step"><img class="pq-prev" id="i-step" alt="Step 2 photo" src="' + IMG + 'efr-s1-m.webp"></span><div class="t"><b>Step 2: Add the rice</b>One photo per step</div><button type="button" class="mini" data-add="step" style="min-height:44px">' + ic("cam", "xs") + 'Replace</button></div>' +
    '<h2>More photos <small>up to 3</small></h2>' +
    '<div class="pgrow"><span class="edph has pqtile" id="t-more"><img class="pq-prev" id="i-more" alt="Gallery photo" src="' + IMG + 'efr-2-t.webp"></span><div class="t"><b>1 of 3</b>Shown on demand</div><button type="button" class="mini" data-add="more" style="min-height:44px">' + ic("plus", "xs") + 'Add</button></div>' +
    '<h2>After cooking <small>up to 3 per cook</small></h2>' +
    '<button type="button" class="opt" data-add="cook">' + ic("cook") + '<span class="t"><b>Add a photo of tonight\'s dish</b><small>Goes into Cooked, not the banner</small></span></button>' +
    '<p class="enhsafe">' + ic("lock") + 'Picked photos stay on this phone until you confirm. Nothing here is sent anywhere.</p>' +
    '</div></div>';
}
ph.innerHTML = tiles();

/* ---- the Add / Replace picker (the two real choices, then this mockup's sample photos) ---- */
var samples = null;
function getSamples() {
  if (samples) return samples;
  samples = fetch(ENG + "samples/samples.json").then(function (r) { return r.json(); }).then(function (j) { return Array.isArray(j) ? j : (j.samples || []); }).catch(function () { return []; });
  return samples;
}
function picker(kind) {
  var K = KIND[kind]; warm();
  sheet('<h3>' + (kind === "cook" ? "Add a photo of the dish" : "Replace " + K.noun) + '</h3>' +
    '<p style="font-size:13px;color:var(--muted);margin:2px 0 var(--sp-2)">Your phone shrinks it to ' + K.what + ' before it goes up. Nothing leaves this phone until you confirm.</p>' +
    '<label class="opt" style="cursor:pointer">' + ic("cam") + '<span class="t"><b>Take a photo</b></span><input type="file" accept="image/*" capture="environment" data-file style="position:absolute;opacity:0;width:1px;height:1px"></label>' +
    '<label class="opt" style="cursor:pointer">' + ic("img") + '<span class="t"><b>Choose from your photos</b><small>Try your own photo. Stays on this phone until you confirm.</small></span><input type="file" accept="image/*" data-file style="position:absolute;opacity:0;width:1px;height:1px"></label>' +
    '<p class="lblx">Mockup only: sample photos</p><div class="enhsm" id="smp"></div>' +
    '<button type="button" class="btn ghost" data-close style="width:100%;margin-top:var(--sp-3)">Cancel</button>',
    function (s, close) {
      getSamples().then(function (list) {
        var g = s.querySelector("#smp"); if (!g) return;
        g.innerHTML = list.map(function (it, i) { return '<button type="button" data-s="' + i + '" aria-label="' + esc(it.label + ". " + it.flaw) + '"><img alt="" loading="lazy" src="' + ENG + "samples/" + esc(it.file) + '"><span>' + esc(it.label) + '<small>' + esc(it.flaw) + "</small></span></button>"; }).join("");
      });
      s.addEventListener("click", function (e) {
        var b = e.target.closest("[data-s]"); if (!b) return;
        getSamples().then(function (list) { var it = list[+b.dataset.s]; close("pick"); begin(kind, ENG + "samples/" + it.file, it.label); });
      });
      [].forEach.call(s.querySelectorAll("[data-file]"), function (inp) {
        inp.addEventListener("change", function () { var f = inp.files && inp.files[0]; if (!f) return; close("pick"); begin(kind, f, f.name); });
      });
    });
}

/* ---- a picked photo: the Enhance sheet if this browser can, else exactly today's flow ---- */
function begin(kind, source, name) {
  if (!(source instanceof Blob) && Q.get("demo") === "heic") source = new Blob([new Uint8Array(64)], { type: "image/heic" });
  warm().then(function () {
    var PE = window.PhotoEnhance, S = window.EnhanceSplit;
    if (!PE || !PE.supported || !S || Q.get("demo") === "unsupported") { plain(kind, source); return; } // silent: no Enhance, upload as today
    D.tell("Enhance step opened for " + name);
    S.open({ X: X, D: D, source: source, name: name, kind: kind, K: KIND[kind], onUse: function (r) { handoff(kind, r); }, onUnreadable: function () { toast("That photo could not be read."); } });
  });
}
function plain(kind, source) {
  toast("Getting the photo ready…");
  bitmapOf(source).then(function (bm) { return sizesOf(bm, bm.width, bm.height, KIND[kind].edge).then(function (r) { r.enhanced = false; r.level = "off"; handoff(kind, r); }); },
    function () { toast("That photo could not be read."); });
}

/* ---- the photo queue, as a stand-in: the tile shows Waiting, Uploading n%, Photo is being prepared, Done (the app's own states) ---- */
var prev = {};
function handoff(kind, r) {
  var url = URL.createObjectURL(r.blob), tile = ph.querySelector("#t-" + kind) || ph.querySelector("#t-more"), img = tile && tile.querySelector("img");
  var was = img && img.src; D.tell("Queued " + r.w + " × " + r.h + " " + Math.round(r.blob.size / 1024) + " KB " + (r.enhanced ? "enhanced" : "as it is"));
  if (!tile) { toast("Added"); return; }
  img.src = url; tile.querySelector(".pq") && tile.querySelector(".pq").remove();
  var b = document.createElement("span"); b.className = "pq"; b.setAttribute("role", "status"); tile.appendChild(b);
  var set = function (q, t, spin) { b.dataset.q = q; b.innerHTML = (spin ? '<i class="pqs"></i>' : "") + t; };
  var quick = matchMedia("(prefers-reduced-motion:reduce)").matches, n = 0;
  set("waiting", "Waiting");
  setTimeout(function () {
    var iv = setInterval(function () {
      n += 22; if (n >= 100) { clearInterval(iv); set("processing", "Photo is being prepared", true); setTimeout(function () { set("done", "Done"); setTimeout(function () { b.remove(); }, 2500); undoLine(kind, r, was); }, 900); return; }
      set("uploading", "Uploading " + n + "%", true);
    }, quick ? 60 : 260);
  }, 500);
}
/* Undo for 5 minutes (the app's rule). What Undo does, and what it cannot do, is stated plainly (PE-D-O13). */
function undoLine(kind, r, was) {
  var host = ph.querySelector("#u-" + kind) || ph.querySelector("#u-banner"); if (!host) { toast("Photo replaced", function () {}); return; }
  host.innerHTML = '<div class="pundo">' + ic("undo") + '<span class="t"><b>' + (r.enhanced ? "Enhanced photo saved" : "Photo saved") + '</b><small>Undo for 5 minutes, then the old one is gone.' + (r.enhanced ? " Kitchie keeps no original, so after that it cannot be un-enhanced." : "") + '</small></span><span class="acts"><button type="button" class="mini" data-undo>Undo</button>' +
    (r.enhanced && r.plain ? '<button type="button" class="mini" data-orig style="color:var(--fg);border-color:var(--border)">Use original</button>' : "") + "</span></div>";
  host.onclick = function (e) {
    if (e.target.closest("[data-undo]")) { var im = ph.querySelector("#t-" + kind + " img"); if (im && was) im.src = was; host.innerHTML = ""; toast("Put back"); }
    else if (e.target.closest("[data-orig]")) { handoff(kind, r.plain); host.innerHTML = ""; }
  };
}
/* the handoff above gets the plain (not enhanced) copy only when split.js made one while the phone still holds it: PE-D-O13 Proposal */

ph.addEventListener("click", function (e) { var b = e.target.closest("[data-add]"); if (b) picker(b.dataset.add); });
if (Q.get("open")) setTimeout(function () { picker(Q.get("open")); }, 0);

/* ---- the Mockup panel (same look as the other Recipe mockups) ---- */
(function () {
  var b = document.createElement("button"); b.type = "button"; b.className = "mockb"; b.textContent = "Mockup"; b.setAttribute("aria-expanded", "false");
  var p = document.createElement("div"); p.className = "mockp"; p.hidden = true;
  var link = function (q, t) { var u = new URL(location.href); u.search = q; return '<a href="' + esc(u.pathname + u.search) + '">' + t + "</a>"; };
  p.innerHTML = '<h4>Proof it is client side</h4><p id="pstat" style="font-size:12px"></p>' +
    '<h4>States</h4><p>' + link("?open=banner", "Banner") + " · " + link("?open=step", "Step photo") + " · " + link("?open=cook", "Cook photo") + '</p>' +
    '<p style="margin-top:6px">' + link("?demo=unsupported&open=banner", "Engine unsupported (silent fallback)") + "<br>" + link("?demo=heic&open=banner", "HEIC the browser cannot read") + "<br>" + link("?demo=noengine&open=banner", "Engine file missing") + "</p>" +
    '<p style="font-size:12px;margin-top:6px">Large (48 MP), small and already-good photos are in the sample list: pick them in the sheet.</p>' +
    '<h4>Theme</h4><div class="tgrid swatches">' + (window.themeHtml ? themeHtml(null, true) : "") + '</div><h4>Screens</h4><p><a href="../index.html">All options</a> · <a href="NOTES.md">Notes</a></p>';
  document.body.appendChild(p); document.body.appendChild(b);
  var stat = function () { var el = p.querySelector("#pstat"); el.innerHTML = "Encodes so far: <b>" + D.encodes + "</b> (only Use photo makes one)<br>Last: " + esc(D.last || "nothing yet"); };
  D.listeners.push(stat); stat();
  b.addEventListener("click", function () { p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden)); if (window.themeWarm) themeWarm(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !p.hidden) p.hidden = true; });
})();
})();
