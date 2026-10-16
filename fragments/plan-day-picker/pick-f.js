/* Option F: a responsive right-side flyout. It slides in over the SAME slot as Home's permanent "This week" panel (#week), not on top of it: while a day is being chosen the
   slot's content is swapped, then handed back to the normal This week when done or cancelled. Content follows the room:
   roomy: the four-week grid at once (option C's grid, grid.js); tight: step one is Tonight / Tomorrow / Pick a day, and only Pick a day opens the grid.
   Roomy or tight is read from the window (1440px and up is roomy) and can be forced: ?fit=roomy|tight, or the Mockup only buttons at the foot of the flyout.
   Keys are A's and C's: arrows, Enter, digit and letter jumps, Esc, the ? list. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, H = window.HDP, esc = PK.esc, ico = PK.ico, $ = PK.$;
var el, want = null, step = 0, saved = null, fit = (new URLSearchParams(location.search).get("fit") || "auto");
if (["roomy", "tight", "auto"].indexOf(fit) < 0) fit = "auto";
function tight() { return fit === "tight" || (fit === "auto" && innerWidth < 1440); }
function quick() {
  var t = PK.info(P.todayN), m = PK.info(P.todayN + 1);
  function q(d, label) { return '<button type="button" data-quick="' + d.n + '" class="' + (d.meals.length ? "full" : d.off ? "off" : "") + '" aria-pressed="' + (S.sel === d.n) + '"><b>' + label + "</b><small>" + d.dn + " " + d.num + " &middot; " + PK.sub(d) + "</small></button>"; }
  return '<div class="pk-quick" role="group" aria-label="Quick picks">' + q(t, "Tonight") + q(m, "Tomorrow") + '<button type="button" class="more" data-pick><b>Pick a day</b><small>Four weeks</small></button></div>';
}
function draw() {
  var tt = tight(), grid = !tt || step === 1;
  var hint = PK.kbd("←") + PK.kbd("→") + PK.kbd("↑") + PK.kbd("↓") + " move " + PK.kbd("Enter") + " plan " + PK.kbd("Esc") + " close";
  el.innerHTML = '<div class="pk-pt"><div><h2 id="pk-t">Plan ' + esc(PK.R().name) + '</h2><p class="pk-sub">' + (grid ? "Pick a day, this week to three weeks ahead" : "When?") + '</p></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" +
    (tt && step === 1 ? '<button type="button" class="back pk-back" data-less>&lsaquo; Quick picks</button>' : "") +
    (grid ? PK.grid.html() + '<p class="pk-key"><span class="pk-sw0 t"></span>Today <span class="pk-sw0 f"></span>Meal planned <span class="pk-sw0 o"></span>Usual day off</p>' : quick()) +
    PK.noteHtml(true) + PK.guardHtml() + PK.whoHtml() + PK.holdHtml() + PK.footHtml(grid ? hint : "") +
    '<div class="pk-mock" role="group" aria-label="Mockup only: room available"><span>Mockup only</span>' + ["roomy", "tight", "auto"].map(function (f) { return '<button type="button" data-fit="' + f + '" aria-pressed="' + (fit === f) + '">' + f.charAt(0).toUpperCase() + f.slice(1) + "</button>"; }).join("") + "</div>";
  if (want) { var t = el.querySelector(want); want = null; if (t) t.focus({ preventScroll: true }); }
}
function pick(n) { S.sel = n; S.leave = false; want = '[data-n="' + n + '"]'; draw(); }
function click(e) {
  var t = e.target.closest("button"); if (!t || t.disabled) return;
  if (t.dataset.n != null) { pick(+t.dataset.n); return; }
  if (t.dataset.fit) { fit = t.dataset.fit; step = 0; want = '[data-fit="' + fit + '"]'; draw(); return; }
  if (t.dataset.quick != null) {
    var n = +t.dataset.quick, d = PK.info(n); S.sel = n; S.leave = false;
    /* a free day is one click; a day with a meal or a usual day off is chosen and waits for Plan (as B) */
    if (!d.meals.length && !d.off && !PK.guard()) { PK.commit(n); return; }
    step = 1; want = '[data-n="' + n + '"]'; draw(); return;
  }
  if (t.hasAttribute("data-pick")) { step = 1; S.sel = PK.firstFree(P.GRIDN); want = S.sel != null ? '[data-n="' + S.sel + '"]' : ".pkc:not(:disabled)"; draw(); return; }
  if (t.hasAttribute("data-less")) { step = 0; S.sel = null; want = "[data-pick]"; draw(); return; }
  PK.common(t, function () { want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : t.hasAttribute("data-hold") ? "[data-hold]" : null; draw(); });
}
function onResize() { if (el && fit === "auto") { step = 0; draw(); } }
PK.register({
  open: function () {
    step = 0; saved = H.S.front;
    /* the slot is the This week panel: bring it to the front when the pane is stacked over it, then swap its content */
    if (saved !== "week") H.set({ front: "week" });
    el = $("#week"); el.classList.add("pk", "pk-fly"); el.addEventListener("click", click); addEventListener("resize", onResize);
    S.sel = tight() ? null : PK.firstFree(P.GRIDN);
    draw();
    var f = S.sel != null ? el.querySelector('[data-n="' + S.sel + '"]') : el.querySelector("[data-quick]") || el.querySelector(".pkc:not(:disabled)"); if (f) f.focus({ preventScroll: true });
  },
  /* hand the slot back: This week is drawn again by Home itself */
  close: function () { if (!el) return; el.removeEventListener("click", click); removeEventListener("resize", onResize); el.classList.remove("pk", "pk-fly"); el = null; H.set({ front: saved || "detail" }); },
  key: function (e) {
    if (e.target.closest && e.target.closest(".pk-grid")) { var t = PK.grid.target(e); if (!t) return; e.preventDefault(); if (t.enter) { S.sel = t.n; PK.ok(); } else pick(t.n); return; }
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && e.target.closest && e.target.closest(".pk-quick")) {
      e.preventDefault(); var b = Array.prototype.slice.call(el.querySelectorAll(".pk-quick button")), i = b.indexOf(e.target); if (i > -1) b[Math.max(0, Math.min(b.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)))].focus();
    }
  },
  focus: function () { if (!el) return; var f = el.querySelector('[aria-selected="true"]') || el.querySelector(".pk-quick button") || el.querySelector(".pkc:not(:disabled)"); if (f) f.focus({ preventScroll: true }); },
  help: function () { var r = PK.grid.helpRows("F"); r.push(["←  →", "Move along Tonight, Tomorrow and Pick a day (tight space)"]); return r; }
});
})();
