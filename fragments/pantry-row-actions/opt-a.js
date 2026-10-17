/* Option A: hover actions on the row (Kitchie #866). In the app: desktop-pantry.js adds the Add-to-list button beside the minus and the tick the server already draws, and gives the three a key cap
   and a label that opens on hover; the buttons call KitchieSwipe.act and shop like the keys. */
(function () {
  "use strict";
  var P = window.PRA;
  function btn(kind, cls, icon, label, key, id, name, aria) {
    return '<button type="button" class="rb ' + cls + '" data-do="' + kind + '" data-id="' + id + '" aria-label="' + aria + P.esc(name) + '" title="' + label + " (" + key + ')">' + P.icon(icon) + '<span class="lbl">' + label + "</span>" + P.kbd(key) + "</button>";
  }
  P.opt.extra = function (i) {
    return '<div class="ract" role="group" aria-label="' + P.esc(i.name) + ' actions">' +
      (i.kind ? btn("one", "one", "minus", "Use one", "U", i.id, i.name, "Use one of ") : "") +
      btn("shop", "shop", "cart", "Add to list", "S", i.id, i.name, "Add to shopping list: ") +
      btn("all", "all", "check", "Used up", "D", i.id, i.name, "Mark as used up: ") + "</div>";
  };
})();
