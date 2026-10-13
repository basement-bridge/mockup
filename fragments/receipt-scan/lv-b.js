/* Direction B, Freeze and walk. The live picture is only for reading: boxes are drawn, nothing is tapped. When the view holds steady it is captured and the frame stays on screen as a held photo.
   The open lines are then walked through one at a time on the held frame, the others dimmed; a no-match line is crossed out on the paper itself (RS-40). "Scan the rest" goes back to the live picture. */
(function () {
  var LV = window.LV, S = LV.S, L = LV.L;
  LV.dirs.b = {
    holds: false,
    stageCls: function () { return S.walk ? "lv-still" : "lv-ro"; },
    tap: function (id) { if (S.walk) { var i = S.walk.q.indexOf(id); if (i >= 0) { S.walk.i = i; S.walk.cur = id; S.scroll = LV.focusScroll(id); LV.render(); } } },
    afterCapture: function () {
      var ids = LV.openLines().map(function (l) { return l.id; }); if (!ids.length) return false;
      S.frozen = true; S.phase = "frozen"; S.walk = { q: ids, i: 0, cur: ids[0], kind: "open" }; S.scroll = LV.focusScroll(ids[0]); LV.render(); return true;
    },
    lane: function () { return LV.summary("lane"); }
  };
})();
