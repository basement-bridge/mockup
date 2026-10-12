/* Recipe tab mockup, flow 2 helpers (owner's locked decisions, 10 October 2026): add by assistant (L4), cook-mode step labels and navigation (L7).
   Loaded only by add.html, review.html and cook.html (edit.html is now the hand-off to the assistant and needs none of it), after recipe.js. No sample data here: the build can lift this file as it is.
   Performance note: under 2 KB, no network, nothing runs until a screen calls it. */
(function () {
  /* L7: a short label for a step, taken from its own words. First sentence, then the first clause; if still long, the part before " and ".
     The button clamps to two lines, so a long label never breaks the layout. */
  var stepLabel = function (text) {
    var s = (String(text || "").match(/^[^.!?]*/) || [""])[0].trim();
    var c = s.split(/[,;:]\s/)[0];
    if (c.length > 30) c = c.split(/\s(?:and|then)\s/)[0];
    return c || s;
  };

  /* L7: move between steps by swipe (left = forward, right = back) and by the arrow keys. go(+1) or go(-1); the caller decides the bounds.
     A swipe counts only when it is clearly sideways, so scrolling a long step still works. Off while a sheet is open or a field has focus. */
  var stepNav = function (root, canSwipe, go) {
    var x0 = null, y0 = 0;
    root.addEventListener("pointerdown", function (e) {
      if (!canSwipe() || !e.target.closest(".body") || e.target.closest("input,textarea,.sheet")) { x0 = null; return; }
      x0 = e.clientX; y0 = e.clientY;
    });
    root.addEventListener("pointerup", function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    });
    root.addEventListener("pointercancel", function () { x0 = null; });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (document.querySelector(".phone .sheet") || /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "")) return;
      e.preventDefault(); go(e.key === "ArrowRight" ? 1 : -1);
    });
  };

  /* A step navigation button: a small kicker (where it goes) over the destination's own words. dir is "prev" or "next". */
  var navBtn = function (ic, dir, kicker, label, attr, ghost) {
    var t = '<span class="t"><small>' + kicker + "</small><b>" + label + "</b></span>";
    return '<button type="button" class="btn snav ' + dir + (ghost ? " ghost" : "") + '" ' + attr + ' aria-label="' + kicker + ": " + label + '">' +
      (dir === "prev" ? ic("back", "s") + t : t + ic("chev", "s")) + "</button>";
  };

  window.FLOW2 = { stepLabel: stepLabel, stepNav: stepNav, navBtn: navBtn };
})();
