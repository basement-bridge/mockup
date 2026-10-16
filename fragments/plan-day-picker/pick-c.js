/* Option C: a four-week grid as a desktop panel anchored to the Plan button (agent's recommendation, not chosen). Four rows of seven days: today ringed, past greyed,
   each cell shows the meal there, a usual day off says Off. Arrow keys move in two directions, Enter plans, today (or the next free day) is preselected.
   Keys are A's: digits and letters jump within the week of the chosen day. The panel reads four weeks of the plan when it opens (one range read in the build). */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, esc = PK.esc, ico = PK.ico, H = window.HDP;
var el, want = null, W = 468;
function draw() {
  el.innerHTML = '<div class="pk-pt"><div><h3 id="pk-t">Plan ' + esc(PK.R().name) + '</h3><p class="pk-sub">Pick a day, this week to three weeks ahead</p></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" +
    PK.grid.html() +
    '<p class="pk-key"><span class="pk-sw0 t"></span>Today <span class="pk-sw0 f"></span>Meal planned <span class="pk-sw0 o"></span>Usual day off</p>' +
    PK.noteHtml(true) + PK.guardHtml() + PK.whoHtml() + PK.holdHtml() +
    PK.footHtml(PK.kbd("←") + PK.kbd("→") + PK.kbd("↑") + PK.kbd("↓") + " move " + PK.kbd("Enter") + " plan " + PK.kbd("Esc") + " close");
  place();
  if (want) { var t = el.querySelector(want); want = null; if (t) t.focus({ preventScroll: true }); }
}
/* anchored: to the left of the pane the Plan button is in, level with the button, with a caret that points at it; where there is no room on the left, under or over the button */
function place() {
  if (!el) return;
  var a = PK.anchor && PK.anchor.isConnected ? PK.anchor : document.querySelector('#detail [data-act="plan"]'); if (!a) return;
  var r = a.getBoundingClientRect(), pane = a.closest(".panel, .card") || a, pr = pane.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, h = el.offsetHeight, left, top, side = "l";
  left = pr.left - W - 12;
  if (left < 100) { side = "b"; left = Math.max(100, Math.min(vw - W - 8, r.right - W)); }
  top = side === "l" ? Math.max(8, Math.min(vh - h - 8, r.top + r.height / 2 - h / 2)) : Math.max(8, Math.min(vh - h - 8, r.bottom + 10));
  el.style.left = left + "px"; el.style.top = top + "px"; el.dataset.side = side;
  el.style.setProperty("--caret", Math.max(18, Math.min(h - 30, r.top + r.height / 2 - top - 6)) + "px");
}
function pick(n) { S.sel = n; S.leave = false; want = '[data-n="' + n + '"]'; draw(); }
function key(e) {
  if (!e.target.closest || !e.target.closest(".pk-grid")) return;
  var t = PK.grid.target(e); if (!t) return; e.preventDefault();
  if (t.enter) { S.sel = t.n; PK.ok(); } else pick(t.n);
}
PK.register({
  open: function () {
    el = document.createElement("div"); el.className = "pk-pop pk"; el.setAttribute("role", "dialog"); el.setAttribute("aria-labelledby", "pk-t"); el.setAttribute("aria-modal", "false");
    document.body.appendChild(el);
    S.sel = PK.firstFree(P.GRIDN);
    el.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t || t.disabled) return;
      if (t.dataset.n != null) { pick(+t.dataset.n); return; }
      PK.common(t, function () { want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : t.hasAttribute("data-hold") ? "[data-hold]" : null; draw(); });
    });
    draw(); var f = S.sel != null ? el.querySelector('[data-n="' + S.sel + '"]') : el.querySelector(".pkc:not(:disabled)"); if (f) f.focus({ preventScroll: true });
    document.addEventListener("pointerdown", PK.outside = function (e) { if (el && !el.contains(e.target) && !e.target.closest("#kb,.toast,[data-act=plan]")) PK.close(); }, true);
    addEventListener("resize", place);
  },
  close: function () { document.removeEventListener("pointerdown", PK.outside, true); removeEventListener("resize", place); if (el) el.remove(); el = null; },
  key: key,
  focus: function () { if (!el) return; var f = el.querySelector('[aria-selected="true"]') || el.querySelector(".pkc:not(:disabled)"); if (f) f.focus({ preventScroll: true }); },
  help: function () { return PK.grid.helpRows("C"); }
});
})();
