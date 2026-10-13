/* Receipt scan, live: phone and tablet. The tab bar, the sheets over a dim, the full-screen viewfinder, and the swipe that crosses a no-match line off. Loaded only below 1024px (lv-run.js picks the file). */
(function () {
  var LV = window.LV, S = LV.S;
  LV.vp.name = "phone";
  LV.vp.words = {};
  var grab = '<button type="button" class="grab" data-act="closesheet" aria-label="Close"></button>';
  LV.vp.compose = function (s) {
    var h = "";
    if (s.step === "entry" || s.step === "done") {
      h += '<main class="main">' + s.main + '</main><nav class="tabbar" aria-label="Main">' + LV.nav() + "</nav>";
      if (s.sheet) h += '<div class="dim" data-act="closesheet"></div><div class="panel" data-mode="add" role="dialog" aria-label="Add an item">' + grab + s.sheet + "</div>";
      return h + s.toast;
    }
    if (s.step === "refused") return '<div class="rl lv-rl" data-dir="' + LV.dir + '">' + s.html + "</div>";
    h += '<div class="rl lv-rl" data-dir="' + LV.dir + '">' + s.col + (s.sheet && !s.summary ? s.sheet : "") + "</div>";
    if (s.summary) h += '<div class="dim" data-act="closesheet"></div><div class="panel" data-mode="sum" role="dialog" aria-label="Add to your Pantry">' + grab + s.sheet + "</div>";
    return h + s.toast;
  };
  /* crossing off with a finger: swipe across the printed line on a no-match card (RS-40) */
  var d0 = null;
  document.addEventListener("pointerdown", function (e) { var r = e.target.closest && e.target.closest(".lv-card[data-k=open] .rs-read"); var c = r && r.closest(".lv-card"); var l = c && LV.L(c.dataset.id); d0 = l && l.st === "none" ? { x: e.clientX, id: c.dataset.id } : null; });
  document.addEventListener("pointerup", function (e) { if (d0 && Math.abs(e.clientX - d0.x) > 70) LV.act("skip", d0.id); d0 = null; });
  document.addEventListener("pointercancel", function () { d0 = null; });
})();
