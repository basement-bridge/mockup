/* Option D: the panel and the keys only (Kitchie #866). In the app: item-sheet.js / the desktop item panel gets Use one beside the Used up and Add to shopping list it already has, with key caps; desktop-pantry.js adds the keys line.
   The keys U D S Z J K are the app's own today. After Used up the next row is current, as the app does. */
(function () {
  "use strict";
  var P = window.PRA;
  P.opt.panelTop = function (i) {
    var gone = i.out;
    return '<div class="pact"><button type="button" class="btn one" data-do="one" data-id="' + i.id + '"' + (!P.counted(i) ? ' aria-disabled="true"' : "") + '><span class="l">' + P.icon("minus") + "Use one</span>" + P.kbd("U") + "</button>" +
      '<button type="button" class="btn shop" data-do="shop" data-id="' + i.id + '"><span class="l">' + P.icon("cart") + "Add to shopping list</span>" + P.kbd("S") + "</button>" +
      '<button type="button" class="btn all dng" data-do="all" data-id="' + i.id + '"' + (gone ? ' aria-disabled="true"' : "") + '><span class="l">' + P.icon("check") + "Used up</span>" + P.kbd("D") + "</button></div>" +
      (!P.counted(i) && !gone ? '<p class="why">Not counted, so no Use one. Change its level instead.</p>' : "");
  };
  P.opt.panelBottom = function () { return ""; };
  P.opt.mount = function () {
    var k = document.createElement("div"); k.className = "keysline"; k.setAttribute("aria-label", "Keys");
    k.innerHTML = "<span>" + P.kbd("J") + P.kbd("K") + " move</span><span>" + P.kbd("U") + " use one</span><span>" + P.kbd("D") + " used up</span><span>" + P.kbd("S") + " add to list</span><span>" + P.kbd("Z") + " undo</span>";
    document.getElementById("col").appendChild(k);
  };
})();
