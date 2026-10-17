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
/* B: the card for one date is M.cardHtml (month.js): the same card the compact strip uses */
W.sideHtml = function (n) { return Mo().cardHtml(n); };
/* the three layouts: the same parts, put together differently */
W.compose = function (opt, p) {
  var M = Mo();
  if (opt === "b") { var c = window.PKCard || "docked"; return '<div class="pdw-b" data-card="' + c + '"><div class="pdw-main">' + p.grid + p.cap + p.full + '</div><aside class="pdw-side' + (c === "strip" ? " pdw-strip" : "") + '" id="pdw-side" aria-label="The date you are on" aria-live="polite">' + W.sideHtml(p.cur) + "</aside></div>" + p.hold + p.hint + p.legend; }
  if (opt === "c") return M.nextHtml() + p.grid + p.cap + p.st + p.full + p.hold + p.hint + p.legend;
  return p.grid + p.cap + p.st + p.full + p.hold + p.hint + p.legend;
};
})();
