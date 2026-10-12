/* Nested Edit and History for the item in the detail panel. Fetched on the first E or comma, never on page load (DESIGN.md section 6). No size rules.
   On Home the child is tucked under the item's header inside the same lane at every width (the item edit flyout does this below 1240px; Home never opens a fourth column).
   The real forms are in ../item-edit-flyout/ (Edit and History); this is a stand-in that shows the behaviour and the room it has, not a second design of them. */
(function () {
"use strict";
var H = window.HDP, esc = H.esc, sv = H.sv, IC = H.IC;
var HIST = [
  ["Today", [["Priya", "Assistant", "Level", "Plenty", "Some"]]],
  ["Fri 9 Oct", [["Sam", "Item sheet", "Use by", "", "{u}"], ["Sam", "Item sheet", "Quantity", "2", "{q}"]]],
  ["Sat 3 Oct", [["Priya", "Assistant", "Location", "Pantry", "{a}"]]]
];
H.childHtml = function (kind, it) {
  var back = '<button type="button" class="ib" data-act="childback" aria-label="Back to the item" title="Back">' + sv(IC.back, 20) + "</button>";
  if (kind === "edit") {
    return '<div class="child" id="ief-child"><h3>' + back + 'Edit ' + esc(it.name) + '</h3><label class="ef-w"><span class="ef-l">Name</span><input class="ef-in" value="' + esc(it.name) + '"></label><label class="ef-w"><span class="ef-l">Quantity</span><input class="ef-in" value="' + esc(it.qty || "") + '"></label><div class="ef-w"><span class="ef-l">Location</span><div class="chipset"><span class="pill ' + (it.area === "Fridge" ? "on" : "") + '">Fridge</span><span class="pill ' + (it.area === "Cabinet" ? "on" : "") + '">Cabinet</span><span class="pill">Freezer</span></div></div><p class="note">Stand-in. The full form, saved as you go, is in the item edit flyout mockup. Press E again or the back arrow to return.</p></div>';
  }
  return '<div class="child" id="ief-child"><h3>' + back + 'History</h3>' + HIST.map(function (d) {
    return '<div class="hday"><h3>' + d[0] + '</h3><ul class="hist">' + d[1].map(function (e) { return "<li><b>" + e[2] + "<em>" + e[0] + " &middot; " + e[1] + '</em></b><span class="hch">' + esc(e[3] || "none") + " &rarr; " + esc(e[4].replace("{u}", it.useLabel || "none").replace("{q}", it.qty || "none").replace("{a}", it.area)) + "</span></li>"; }).join("") + "</ul></div>";
  }).join("") + '<p class="note">Fetched only now, for this item only (the Pantry rule). Sample entries.</p></div>';
};
})();
