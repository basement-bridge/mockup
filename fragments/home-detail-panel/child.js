/* Edit and History for the item in the detail panel. Fetched on the first E or comma, never on page load (DESIGN.md section 6). No size rules.
   Decision 159 (owner 13 Oct 2026, replaces the tucked-under-the-header drawing of 141): the child REPLACES the simple view in the same panel, at every width: the item's header, tiles, buttons and hint are not shown while it is open,
   and it carries its own title row (title, and the x that returns to the item). Home never opens a fourth column (152). The name is shown once: as the Name field in Edit, in the subtitle in History.
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
  var back = function (label) { return '<button type="button" class="x ib" data-act="childback" aria-label="' + label + '" title="' + label + '">' + sv(IC.x, 20) + "</button>"; };
  if (kind === "edit") {
    return '<div class="child" id="ief-child"><div class="chd"><div><h2>Edit item</h2></div>' + back("Close edit") + '</div><label class="ef-w"><span class="ef-l">Name</span><input class="ef-in" value="' + esc(it.name) + '"></label><label class="ef-w"><span class="ef-l">Quantity</span><input class="ef-in" value="' + esc(it.qty || "") + '"></label><div class="ef-w"><span class="ef-l">Location</span><div class="chipset"><span class="pill ' + (it.area === "Fridge" ? "on" : "") + '">Fridge</span><span class="pill ' + (it.area === "Cabinet" ? "on" : "") + '">Cabinet</span><span class="pill">Freezer</span></div></div><p class="note">Stand-in. The full form, saved as you go, is in the item edit flyout mockup. Press E again or the x to return to the item.</p></div>';
  }
  return '<div class="child" id="ief-child"><div class="chd"><div><h2>History</h2><p class="trunc" title="' + esc(it.name) + '">' + esc(it.name) + ' only</p></div>' + back("Close history") + '</div>' + HIST.map(function (d) {
    return '<div class="hday"><h3>' + d[0] + '</h3><ul class="hist">' + d[1].map(function (e) { return "<li><b>" + e[2] + "<em>" + e[0] + " &middot; " + e[1] + '</em></b><span class="hch">' + esc(e[3] || "none") + " &rarr; " + esc(e[4].replace("{u}", it.useLabel || "none").replace("{q}", it.qty || "none").replace("{a}", it.area)) + "</span></li>"; }).join("") + "</ul></div>";
  }).join("") + '<p class="note">Fetched only now, for this item only (the Pantry rule). Sample entries.</p></div>';
};
})();
