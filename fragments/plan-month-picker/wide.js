/* The wide layout of the month picker: when Another day is pressed in a window wide enough (1288px and up), the flyout takes two flyouts' worth of width and the Monday to Sunday week gets room for a meal in each cell.
   Owner, typed, 17 Oct 2026: "when people click another day ... I want that Monday to Sunday, if there's enough space, to take two flyouts worth of space ... do a few more visuals". Three layouts, ?wide=a|b|c (default a):
   A roomy calendar (the cells carry the meal; hover popover on the date), B calendar with a side card (the card follows the date you are on, and holds the Plan button), C open nights first (a shortcut to the first open night and an open count per week).
   Fetched only by a wide window on the first press of Another day (pick-month.js withMonth); never on page load, never by a narrower window. Desktop only. Sample data, nothing is stored.
   Loaded after, or before, month.js: nothing here reads PKMonth until it is called. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, esc = PK.esc, W = window.PKWide = {};
function R() { return window.PKRows; }
function Mo() { return window.PKMonth; }
var CHIP = { open: "Open", plan: "Planned", stack: "Planned, several", off: "Day off", past: "Past" };
/* B: the card for one date: the meal being planned, then the date, what is on it, what picking it does, and the Plan button. Same facts as the popover and the line under the grid. */
W.sideHtml = function (n) {
  var M = Mo(), d = PK.vis(n), dj = PK.dayObj(n), k = M.state(d), r = PK.R(), g = d.past ? null : PK.guardFor(n), v = R().view(dj, PK.ctxFor(dj)), plans = d.past ? [] : M.plans(PK.vdayObj(n));
  var h = '<div class="pdw-rec"><span class="pdw-e" aria-hidden="true">' + esc(r.emoji || "") + '</span><div><b>' + esc(r.name) + "</b><small>" + r.mins + " min, serves " + r.serves + "</small></div></div>";
  h += '<div class="pdw-date"><b>' + d.full + " " + d.num + " " + d.monFull + '</b><span class="pdw-chip c-' + k + '">' + CHIP[k] + "</span></div>";
  if (plans.length) h += '<div class="pdw-plans">' + plans.map(function (p) { return "<p><b>" + esc(p.k) + "</b><span>" + esc(p.v) + "</span></p>"; }).join("") + "</div>";
  else if (k === "off") h += '<p class="pdw-q">' + (d.off === "usual" ? "Not cooking. Every week, usual day off." : "Not cooking. This week only.") + "</p>";
  else if (k === "open") h += '<p class="pdw-q">Nothing planned. This night is free.</p>';
  if (d.past) return h + '<p class="pdw-q">Already past.</p>';
  h += '<p class="pdw-cons">' + esc(v.cons) + (v.peek ? " Pick it twice: the first pick shows everyone’s plans." : "") + "</p>";
  if (g === "stop") return h;
  var label = k === "open" ? "Plan " + d.label : /^Replaces/.test(v.cons) ? "Replace what is planned" : k === "off" ? "Plan it, cook this week" : "Plan it here too";
  var short = k === "open" ? "Plan " + d.label : /^Replaces/.test(v.cons) ? "Replace" : k === "off" ? "Plan it" : "Add too"; /* the bottom strip is one line, so its button is short; the aria-label keeps the full words */
  return h + '<button type="button" class="pdw-go' + (k === "open" ? " is-open" : "") + '" data-sidepick data-n="' + n + '"' + (window.PKCard === "strip" ? ' aria-label="' + esc(label) + '">' + esc(short) : ">" + label) + "</button>";
};
/* the three layouts: the same parts, put together differently */
W.compose = function (opt, p) {
  var M = Mo();
  if (opt === "b") { var c = window.PKCard || "docked"; return '<div class="pdw-b" data-card="' + c + '"><div class="pdw-main">' + p.grid + p.cap + p.full + '</div><aside class="pdw-side' + (c === "strip" ? " pdw-strip" : "") + '" id="pdw-side" aria-label="The date you are on" aria-live="polite">' + W.sideHtml(p.cur) + "</aside></div>" + p.hold + p.hint + p.legend; }
  if (opt === "c") return M.nextHtml() + p.grid + p.cap + p.st + p.full + p.hold + p.hint + p.legend;
  return p.grid + p.cap + p.st + p.full + p.hold + p.hint + p.legend;
};
})();
