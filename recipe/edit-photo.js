/* Photo actions and crop and rotate for Edit by hand (owner, 11 Oct 2026). Fetched on the first photo action.
   The honest part: Recipe keeps NO original (P3). The banner is stored at large (1600 px wide) and every other photo at medium (960 px) plus a
   square. So crop and rotate act on the stored copy: what you crop away is gone for good once the 5 minutes of undo end, a rotate re-saves the
   file (so it is encoded again), and zooming in leaves fewer pixels, which can look soft. The screen says so, and shows the size it will save at.
   This mockup applies the result as a transform on the sample picture; the build re-encodes the stored large or medium in the browser (small, fast,
   the same shrink the add route uses) and replaces the stored copy and its square through the photo route, keeping the old copy for 5 minutes. */
(function () {
"use strict";
var IMG = (function () { var s = document.currentScript && document.currentScript.src; return (s ? s.replace(/[^\/]*$/, "") : "") + "../recipe-photos/img/"; })();
var BANNER = { w: 1600, h: 1200 }, OTHER = { w: 960, h: 720 };
var E = {};
function sheetOf(ctx, extra) {
  var X = ctx.X, esc = ctx.esc, ic = ctx.ic, p = ctx.p, v = ctx.v;
  var prep = p && p.prep, inh = ctx.inherited;
  return '<h3>' + esc(ctx.label) + '</h3>' +
    (p ? '<div class="edpv">' + X.frame(p, ctx.kind === "banner" ? "l" : "m", { phase: "demand", inh: inh ? ctx.from : "", alt: ctx.label }) + '</div>' : '<p class="edpn">' + ic("img", "xs") + 'No photo here yet.</p>') +
    (prep ? '<p class="edpn">' + ic("clock", "xs") + 'This photo is saved and its sizes are still being made. Crop and rotate come back when it is ready.</p>' : '') +
    (inh ? '<p class="edpn">' + ic("branch", "xs") + 'This is ' + esc(ctx.from) + "'s photo. Replace or crop makes " + esc(v.name) + ' its own copy; ' + esc(ctx.from) + ' keeps its photo.</p>' : '') +
    (ctx.kind === "banner" && p && !inh ? '<p class="edpn">' + ic("img", "xs") + 'A version always has one banner. Replace it, or make another photo the banner.</p>' : '') + (extra || '');
}
E.open = function (ctx) {
  var X = ctx.X, ic = ctx.ic, p = ctx.p, prep = p && p.prep;
  var opts = '';
  if (ctx.canMake && p) opts += '<button type="button" class="opt" data-a="make">' + ic("img") + '<span class="t"><b>Make banner</b><small>Shown at the top of ' + ctx.esc(ctx.v.name) + '. The old banner stays in Photos.</small></span></button>';
  if (ctx.kind === "banner" && ctx.gallery && ctx.gallery.length) opts += '<button type="button" class="opt" data-a="from">' + ic("img") + '<span class="t"><b>Make another photo the banner</b><small>Choose from this recipe\'s photos</small></span></button>';
  opts += '<button type="button" class="opt" data-a="replace">' + ic("cam") + '<span class="t"><b>' + (p ? (ctx.kind === "banner" ? "Replace banner" : ctx.kind === "step" ? "Replace step photo" : "Replace") : "Add a photo") + '</b><small>Camera or your photos. Your phone shrinks it first.</small></span></button>';
  if (p) opts += '<button type="button" class="opt" data-a="crop"' + (prep ? ' disabled' : '') + '>' + ic("img") + '<span class="t"><b>Crop and rotate</b><small>' + (prep ? 'Available once the photo is ready' : 'Works on the saved copy. We keep no original.') + '</small></span></button>';
  if (p && !ctx.inherited && ctx.kind !== "banner") opts += '<button type="button" class="opt" data-a="remove">' + ic("x") + '<span class="t"><b>Remove</b><small>Undo for 5 minutes, then it is gone for good</small></span></button>';
  X.sheet(sheetOf(ctx) + opts, function (s, close) {
    s.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]"); if (!b || b.disabled) return; var a = b.dataset.a;
      if (a === "make") { close(); ctx.onMake(); }
      else if (a === "from") {
        s.querySelector("[data-a=from]").insertAdjacentHTML("afterend", '<div class="edpick">' + ctx.gallery.map(function (id) { return '<button type="button" data-pick="' + id + '" aria-label="Use this photo as the banner">' + X.frame({ id: id }, "t", { phase: "more" }) + '</button>'; }).join("") + '</div>');
        s.querySelector("[data-a=from]").removeAttribute("data-a"); X.loadPhase(s, "more");
      } else if (a === "replace") { close(); replace(ctx); }
      else if (a === "crop") { close(); crop(ctx); }
      else if (a === "remove") { close(); confirmRemove(ctx); }
    });
    s.addEventListener("click", function (e) { var b = e.target.closest("[data-pick]"); if (b) { close(); ctx.onMakeFrom(b.dataset.pick); } });
  });
};
function replace(ctx) {
  var X = ctx.X, ic = ctx.ic, id = ctx.p ? ctx.p.id : (ctx.kind === "step" ? "efr-s2" : "efr-1");
  X.sheet('<h3>' + (ctx.p ? "Replace" : "Add") + ' ' + (ctx.kind === "banner" ? "the banner" : ctx.kind === "step" ? "the step photo" : "the photo") + '</h3>' +
    '<p style="font-size:13px">Your phone shrinks it to ' + (ctx.kind === "banner" ? "banner size (1600 px) and a square" : "medium (960 px) and a square") + ' before it goes up. It shows "Photo is being prepared" until the server has made the sizes.</p>' +
    '<button type="button" class="opt" data-src>' + ic("cam") + '<span class="t"><b>Take a photo</b></span></button><button type="button" class="opt" data-src>' + ic("img") + '<span class="t"><b>Choose from your photos</b></span></button>' +
    '<button type="button" class="btn ghost" data-close style="width:100%;margin-top:12px">Cancel</button>',
    function (s, close) { s.addEventListener("click", function (e) { if (e.target.closest("[data-src]")) { close(); ctx.onReplace({ id: id, prep: 1 }); } }); });
}
function confirmRemove(ctx) {
  ctx.X.sheet('<h3>Remove this photo?</h3><p style="font-size:13px">It disappears for everyone in the household now. You can undo it for <b>5 minutes</b>; after that it is gone for good. The recipe and its history stay as they are.</p>' +
    '<div style="display:flex;gap:8px;margin-top:14px"><button class="btn ghost" data-close>Keep it</button><button class="btn" data-really>Remove</button></div>',
    function (s, close) { s.querySelector("[data-really]").onclick = function () { close(); ctx.onRemove(); }; });
}
function crop(ctx) {
  var X = ctx.X, ic = ctx.ic, ph = document.querySelector(".phone"), id = ctx.p.id, banner = ctx.kind === "banner";
  var S = banner ? BANNER : OTHER, size = banner ? "l" : "m";
  var prev = ctx.tf[id] ? Object.assign({}, ctx.tf[id]) : null;
  var t = prev ? Object.assign({}, prev) : { x: 0, y: 0, rot: 0, z: 1 };
  var d = document.createElement("div"); d.className = "crop"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "Crop and rotate");
  d.innerHTML = '<div class="top"><button type="button" class="back" data-cancel>' + ic("back", "s") + 'Cancel</button><span class="ttl">Crop and rotate</span><button type="button" class="btn sm" data-use style="min-width:64px">Use</button></div>' +
    '<div class="cstage"><div class="cframe" tabindex="0" aria-label="Photo. Drag to move it, or use the arrow keys."><img alt="" src="' + IMG + id + "-" + size + '.webp"></div></div>' +
    '<div class="cctl"><div class="crow"><button type="button" class="ib" data-rot="-90" aria-label="Rotate left"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9a8 8 0 1 1-1 5M4 4v5h5"/></svg></button>' +
    '<button type="button" class="ib" data-rot="90" aria-label="Rotate right"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 9a8 8 0 1 0 1 5M20 4v5h-5"/></svg></button>' +
    '<input type="range" min="1" max="3" step="0.01" value="1" aria-label="Zoom"><button type="button" class="mini" data-reset>Reset</button></div>' +
    '<p class="cinfo" id="cinfo"></p><p class="cnote"><b>We keep no original.</b> This changes the saved ' + (banner ? "large (1600 px)" : "medium (960 px)") + ' copy. What you crop away is gone for good after the 5 minutes you can undo it, and zooming in leaves fewer pixels.</p></div>';
  ph.appendChild(d);
  var fr = d.querySelector(".cframe"), img = fr.querySelector("img"), rg = d.querySelector("input[type=range]"), info = d.querySelector("#cinfo");
  var minZ = function () { return t.rot % 180 ? 4 / 3 : 1; };
  var clamp = function () {
    t.z = Math.max(minZ(), Math.min(3, t.z));
    var mx = t.rot % 180 ? (3 * t.z - 4) / 8 : (t.z - 1) / 2, my = t.rot % 180 ? (4 * t.z - 3) / 6 : (t.z - 1) / 2;
    t.x = Math.max(-mx * 100, Math.min(mx * 100, t.x)); t.y = Math.max(-my * 100, Math.min(my * 100, t.y));
  };
  var paint = function () {
    clamp(); rg.min = minZ(); rg.value = t.z;
    img.style.transform = "translate(" + t.x + "%," + t.y + "%) rotate(" + t.rot + "deg) scale(" + t.z + ")";
    var eff = t.rot % 180 ? t.z / (4 / 3) : t.z, w = Math.round(S.w / eff / 10) * 10, h = Math.round(S.h / eff / 10) * 10;
    var soft = banner ? w < 800 : w < 600, mid = banner ? w < 1200 : w < 800;
    info.className = "cinfo" + (soft ? " soft" : "");
    info.innerHTML = ic(soft ? "x" : "check", "xs") + '<span>Saves at about <b>' + w + ' × ' + h + '</b>. ' + (soft ? 'That is small for ' + (banner ? "a banner" : "a photo") + ': it will look soft. Zoom out a little.' : mid ? 'Fine on a phone, a little soft on a big screen.' : 'Sharp.') + '</span>';
  };
  var drag = null;
  fr.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y }; fr.setPointerCapture(e.pointerId); });
  fr.addEventListener("pointermove", function (e) { if (!drag) return; var b = fr.getBoundingClientRect(); t.x = drag.tx + (e.clientX - drag.x) / b.width * 100; t.y = drag.ty + (e.clientY - drag.y) / b.height * 100; paint(); });
  fr.addEventListener("pointerup", function () { drag = null; }); fr.addEventListener("pointercancel", function () { drag = null; });
  fr.addEventListener("keydown", function (e) { var k = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key]; if (k) { e.preventDefault(); t.x += k[0]; t.y += k[1]; paint(); } });
  rg.addEventListener("input", function () { t.z = +rg.value; paint(); });
  d.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.rot) { t.rot = (t.rot + +b.dataset.rot + 360) % 360; t.x = 0; t.y = 0; paint(); }
    else if (b.hasAttribute("data-reset")) { t.x = 0; t.y = 0; t.rot = 0; t.z = 1; paint(); }
    else if (b.hasAttribute("data-cancel")) d.remove();
    else if (b.hasAttribute("data-use")) {
      var changed = !prev || prev.x !== t.x || prev.y !== t.y || prev.rot !== t.rot || prev.z !== t.z;
      d.remove(); if (!changed) return;
      ctx.tf[id] = Object.assign({}, t); ctx.applyTf(); ctx.redraw();
      ctx.setUndo(t.rot !== (prev ? prev.rot : 0) && t.z === (prev ? prev.z : 1) ? "Photo rotated" : "Photo cropped", function () { if (prev) ctx.tf[id] = prev; else delete ctx.tf[id]; ctx.redraw(); });
    }
  });
  paint(); d.querySelector("[data-cancel]").focus();
}
window.EDP = E;
})();
