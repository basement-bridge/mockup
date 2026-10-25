/* Rename Location to Area and Spot to Zone (Kitchie #1137). Sample data lives here only. A switch flips Today / Proposed; nothing is saved. */
(function () {
  var W = { area: { today: "Location", next: "Area" }, zone: { today: "Spot", next: "Zone" } };
  var PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6-5.6-6-10a6 6 0 1112 0c0 4.4-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>';
  var scr = (location.hash || "#add").slice(1), v = "next";
  var root = document.getElementById("az-root");
  function w(k) { return W[k][v]; }
  function chip(t, on) { return '<button type="button" class="az-chip" aria-pressed="' + (on ? "true" : "false") + '">' + t + "</button>"; }
  function was(k) { return '<span class="az-was"> (' + W[k].next + ")</span>"; }
  var screens = {
    add: function () {
      return '<div class="az-card"><div class="az-lbl">Where</div>' +
        '<div class="az-f"><label>' + w("area") + '</label><div class="az-in on">Fridge</div><div class="az-strip">' + chip("Fridge", true) + chip("Pantry") + chip("Freezer") + chip("Bench") + '</div></div>' +
        '<div class="az-f"><label>' + w("zone") + '</label><div class="az-in ph">Pick or type</div><div class="az-strip">' + chip("Door") + chip("Crisper") + chip("Carbs bin") + '</div></div></div>' +
        '<p class="az-note">Strip chevron reads "Show all ' + (v === "next" ? "zones" : "spots") + '". A typed new word reads "Add “Shelf” as a new ' + (v === "next" ? "zone" : "spot") + '".</p>' +
        '<button class="az-save" type="button">Add item</button>';
    },
    sheet: function () {
      return '<div class="az-card"><div style="font-size:1.25rem;font-weight:800">Yogurt, Greek style plain</div>' +
        '<div><div class="az-row"><b>Amount</b><span>1 tub (900 g)</span></div>' +
        '<div class="az-row"><b>' + w("area") + '</b><span class="az-pin">Fridge</span></div>' +
        '<div class="az-row"><b>' + w("zone") + '</b><span class="az-pin">Door</span></div>' +
        '<div class="az-row"><b>Use by</b><span>Mon 2 Nov</span></div></div></div>';
    },
    filters: function () {
      return '<div class="az-card"><div class="az-lbl">Group by</div><div class="az-strip">' + chip("Off") + chip(w("area"), true) + chip("Category") + '</div>' +
        '<div class="az-lbl">' + w("area") + '</div><div class="az-strip">' + chip("Fridge", true) + chip("Pantry") + chip("Freezer") + chip("Bench") + chip("Shelves") + chip("Cabinet") + '</div>' +
        '<div class="az-lbl">Sort</div><div class="az-strip">' + chip("Name") + chip("Area") + chip(w("zone")) + chip("Amount") + chip("Use by") + '</div></div>';
    },
    history: function () {
      var A = w("area"), Z = w("zone");
      return '<div class="az-card az-hist"><p><b>Moved</b> Greek yogurt<br><small>' + A + ': Pantry \u2192 Fridge</small></p>' +
        '<p><b>' + Z + ' changed</b> Peas<br><small>' + Z + ': Top drawer \u2192 Bottom drawer</small></p>' +
        '<p><b>Renamed</b><br><small>' + A + ' \u201cPantry\u201d changed to \u201cLarder\u201d</small></p></div>';
    }
  };
  var titles = { add: "Add item", sheet: "Item", filters: "Filters", history: "History" };
  function draw() {
    root.className = "az-page"; root.setAttribute("data-v", v === "next" ? "next" : "today");
    root.innerHTML = '<div class="az-bar"><h2>' + titles[scr] + '</h2><div class="az-sw" role="group" aria-label="Wording"><button type="button" data-v="today" aria-pressed="' + (v === "today") + '">Today</button><button type="button" data-v="next" aria-pressed="' + (v === "next") + '">Proposed</button></div></div>' + (screens[scr] || screens.add)();
    root.querySelectorAll(".az-sw button").forEach(function (b) { b.onclick = function () { v = b.getAttribute("data-v"); draw(); }; });
    root.querySelectorAll(".az-chip").forEach(function (c) { c.addEventListener("click", function () { var on = c.getAttribute("aria-pressed") === "true"; c.setAttribute("aria-pressed", on ? "false" : "true"); }); });
  }
  window.addEventListener("hashchange", function () { scr = (location.hash || "#add").slice(1); draw(); });
  draw();
})();
