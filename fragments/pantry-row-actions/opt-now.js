/* Today's desktop Pantry row, for comparison only (Kitchie #866). */
(function () {
  "use strict";
  var P = window.PRA;
  P.opt.extra = function (i) {
    if (i.out) return "";
    return '<div class="now-acts">' + (i.kind ? '<button type="button" class="nb" data-do="one" data-id="' + i.id + '" aria-label="Use one of ' + P.esc(i.name) + '" title="Use one">' + P.icon("minus") + "</button>" : "") +
      '<button type="button" class="nb ok" data-do="all" data-id="' + i.id + '" aria-label="Mark ' + P.esc(i.name) + ' as used up" title="Used up">' + P.icon("check") + "</button></div>";
  };
  P.opt.mount = function () {
    var n = document.createElement("p"); n.className = "nownote";
    n.textContent = "Today: a minus (counted items) and a tick on hover, no way to add to the shopping list from the row, and a mouse drag also swipes (not drawn). Keys U D S Z and the panel are as in the app.";
    document.getElementById("count").after(n);
  };
})();
