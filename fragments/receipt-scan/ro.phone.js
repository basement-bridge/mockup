/* Receipt scan, chosen flow: phone and tablet. The tab bar, the sheets over a dim, the full-screen viewfinder with the receipt-order list under the picture, and the swipe on a row (RS-59, RS-60).
   Loaded only below 1024px (ro-run.js picks the file). Swipe right accepts a recommended line without opening it; swipe left rejects it (New on a recommended line, Ignore on any other). */
(function () {
  var RO = window.RO, S = RO.S;
  RO.vp.name = "phone";
  RO.vp.words = {};
  var grab = '<button type="button" class="grab" data-act="closesheet" aria-label="Close"></button>';
  RO.vp.compose = function (s) {
    var h = "";
    if (s.step === "entry" || s.step === "done") {
      h += '<main class="main">' + s.main + '</main><nav class="tabbar" aria-label="Main">' + RO.nav() + "</nav>";
      if (s.sheet) h += '<div class="dim" data-act="closesheet"></div><div class="panel" data-mode="add" role="dialog" aria-label="Add an item">' + grab + s.sheet + "</div>";
      return h + s.toast;
    }
    if (s.step === "refused") return '<div class="rl lv-rl ro-rl">' + s.html + "</div>";
    h += '<div class="rl lv-rl ro-rl">' + s.col + "</div>";
    if (s.summary) h += '<div class="dim" data-act="closesheet"></div><div class="panel" data-mode="sum" role="dialog" aria-label="Add to your Pantry">' + grab + s.sheet + "</div>";
    return h + s.toast;
  };
  /* the swipe: a row follows the finger; past 72 px it is an answer, short of it the row springs back */
  var d0 = null, GO = 72;
  var kind = function (id) { return RO.out(RO.L(id)).k; };
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || e.target.closest("button,input,a,.ro-pick,.ro-more")) { d0 = null; return; }
    var r = e.target.closest(".ro-row"); d0 = r ? { x: e.clientX, y: e.clientY, r: r, id: r.dataset.id, on: false } : null;
  });
  document.addEventListener("pointermove", function (e) {
    if (!d0) return; var dx = e.clientX - d0.x, dy = e.clientY - d0.y;
    if (!d0.on) { if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.4) { if (Math.abs(dy) > 12) d0 = null; return; } d0.on = true; d0.r.classList.add("ro-drag"); try { d0.r.setPointerCapture(e.pointerId); } catch (x) {} }
    var k = kind(d0.id), can = dx > 0 ? (k === "top" || k === "check" || k === "ignored") : k !== "ignored";
    d0.r.parentNode.setAttribute("data-swipe", can ? (dx > 0 ? "r" : "l") : "");
    d0.r.style.transform = "translateX(" + Math.max(-140, Math.min(140, dx * (can ? 1 : .25))) + "px)";
  });
  function end(e, cancel) {
    if (!d0) return; var d = d0; d0 = null; var dx = e.clientX - d.x;
    d.r.classList.remove("ro-drag"); d.r.style.transform = ""; d.r.parentNode.removeAttribute("data-swipe");
    if (!d.on) return; RO.swiped = Date.now(); if (cancel || Math.abs(dx) < GO) return;
    var k = kind(d.id);
    if (dx > 0) { if (k === "check") RO.act("accept", d.id); else if (k === "ignored") RO.act("restore", d.id); else if (k === "top") RO.act("accept", d.id); }
    else if (k === "top" || k === "check") RO.act("new", d.id); else if (k === "unsure" || k === "new") RO.act("ignore", d.id);
  }
  document.addEventListener("pointerup", function (e) { end(e, false); });
  document.addEventListener("pointercancel", function (e) { end(e, true); });
})();
