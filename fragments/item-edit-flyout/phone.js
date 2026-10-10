/* Phone and tablet host (under 1024px). Fetched only at these sizes; desktop.js is the other host. Everything here is about touch and the stacked sheets.
   The item flyout is a bottom sheet; the child (Edit, History) is a taller sheet stacked over it; Add is a tall sheet. Same behaviours as the household item sheet:
   tap the dim to close, drag the grab handle down to close, Esc closes the top layer. Dragging uses pointer events, so a mouse drags exactly like a finger. */
(function () {
"use strict";
var IEF = window.IEF, $ = IEF.$, S = IEF.S, open = false;
var NAV = [["home", "Home"], ["pantry", "Pantry"], ["recipes", "Recipes"], ["cartnav", "Shopping"]];
IEF.host = {
  keys: null, closeLabel: "",
  shell: function (p) {
    return '<div class="app" id="ief-app"><main class="main">' + p.list + "</main>"
      + '<nav class="tabbar" aria-label="Main">' + NAV.map(function (n) { return '<span class="nv' + (n[0] === "pantry" ? " on" : "") + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + IEF.IC[n[0]] + "</svg>" + n[1] + "</span>"; }).join("") + "</nav>"
      + '<div class="dim" id="ief-dim" data-ief="dim"></div>'
      + '<aside class="panel" id="ief-panel" role="dialog" aria-modal="true" aria-label="Item detail" data-empty="1"></aside>'
      + '<aside class="ief-child" id="ief-child" role="dialog" aria-modal="true" aria-label="Edit item" hidden></aside></div>'
      + '<div class="toast" id="ief-toast" role="status" hidden></div>';
  },
  /* the sheet rises the first time it opens, and does not re-rise when you pick another item */
  itemOpened: function () { var p = $("#ief-panel"); if (!open) { p.classList.remove("rise"); void p.offsetWidth; p.classList.add("rise"); } open = true; var t = p.querySelector(".tl"); if (t && !S.child) t.focus({ preventScroll: true }); },
  itemClosed: function () { open = false; },
  addReady: function () { var p = $("#ief-panel"); if (!open) { p.classList.remove("rise"); void p.offsetWidth; p.classList.add("rise"); } open = true; },
  addClosed: function () { open = !!S.sel; },
  /* a phone has no hardware keyboard to steal: do not pop the on-screen keyboard open. Land on the field (highlighted) and let the person tap it. */
  childReady: function (kind, o) {
    if (kind === "history") { var c = $("#ief-child .cbody"); if (c) c.focus({ preventScroll: true }); return; }
    IEF.form.focusField(o.field || "", false);
  },
  booted: function () { if (S.sel || S.mode === "add") open = true; var p = $("#ief-panel"); if (S.sel && S.mode !== "add") p.classList.add("rise"); }
};
if (S.sel || S.mode === "add") open = false;

/* Esc: the top layer first (Add, then the child, then the item). */
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  var t = e.target; if (t.closest && t.closest("input,textarea,select") && t.type !== "date") { t.blur(); return; }
  if (IEF.closeTop()) e.preventDefault();
});

/* Drag a grab handle (or the child's header) down to close that layer. Pointer events: touch and mouse behave the same. With a child open, the strip you can see belongs to the parent, but dragging it drags the child. */
var drag = null;
document.addEventListener("pointerdown", function (e) {
  var h = e.target.closest && e.target.closest("[data-grab]"); if (!h || e.button > 0 || e.target.closest("button,input,select")) return;
  var sh = S.child && h.closest("#ief-panel") ? $("#ief-child") : h.closest("#ief-panel, #ief-child"); if (!sh) return;
  drag = { y: e.clientY, sh: sh, dy: 0, t: Date.now() }; sh.style.transition = "none"; try { h.setPointerCapture(e.pointerId); } catch (x) {}
});
document.addEventListener("pointermove", function (e) { if (!drag) return; drag.dy = Math.max(0, e.clientY - drag.y); drag.sh.style.transform = "translateY(" + drag.dy + "px)"; });
function end() {
  if (!drag) return; var d = drag; drag = null; var fast = d.dy / Math.max(1, Date.now() - d.t) > 0.5;
  d.sh.style.transition = "transform .2s";
  if (d.dy > 90 || (fast && d.dy > 40)) { d.sh.style.transform = "translateY(100%)"; setTimeout(function () { d.sh.style.transition = ""; d.sh.style.transform = ""; IEF.closeTop(); }, 190); }
  else { d.sh.style.transform = ""; setTimeout(function () { d.sh.style.transition = ""; }, 220); }
}
document.addEventListener("pointerup", end); document.addEventListener("pointercancel", end);
})();
