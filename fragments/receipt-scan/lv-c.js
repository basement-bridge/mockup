/* Direction C, Cards under the camera. The camera never stops. Boxes are drawn but nothing on the picture has to be tapped: the lines that need the person drop into a dock of cards between the picture and the shutter, in the thumb's reach.
   Answer a card and it leaves the dock. Tapping a box finds its card. A no-match line is a card with the printed line on it, crossed off or added (RS-41). The Last look is the dock made full size. */
(function () {
  var LV = window.LV, S = LV.S, L = LV.L, out = LV.out, ic = LV.ic, esc = LV.esc;
  function dock() {
    var ls = LV.openLines(), h = '<div class="lv-dock" role="region" aria-label="To answer"><div class="lv-dh"><b>To answer</b><span>' + (ls.length ? ls.length + " left" : "none") + '</span><button type="button" class="rs-lk" data-act="last">' + ic("list", 14) + "Last look</button></div>";
    if (!ls.length) return h + '<p class="lv-empty">' + ic("check", 18) + (LV.tally().seen ? "Nothing to answer. Keep scanning, or add." : "Lines that need you will land here.") + "</p></div>";
    h += '<div class="lv-dscroll" tabindex="0">' + ls.map(function (l) { return '<article class="lv-dc' + (S.sel === l.id ? " on" : "") + '" data-id="' + l.id + '" data-st="' + l.st + '">' + LV.card(l, "compact") + "</article>"; }).join("") + "</div></div>";
    return h;
  }
  var sheetCard = function () { return S.sel && out(L(S.sel)).k !== "open"; };
  LV.dirs.c = {
    holds: false,
    stageCls: function () { return "lv-live"; },
    tap: function (id) { S.sel = S.sel === id ? null : id; LV.render(); },
    afterAnswer: function (id) { if (S.sel === id) S.sel = null; LV.render(); },
    extra: function () { return LV.DESK() ? "" : dock(); },
    sheet: function () { if (!sheetCard()) return ""; var l = L(S.sel); return '<div class="lv-sheet" role="dialog"><button type="button" class="grab" data-act="deselect" aria-label="Close"></button><div class="rs-sh"><h2>' + esc(LV.info(l).name || l.raw[0]) + '</h2><button type="button" class="x ib" data-act="deselect" aria-label="Close">' + ic("x", 20) + "</button></div>" + LV.card(l, "full") + "</div>"; },
    lane: function () {
      var ls = LV.openLines(), h = '<div class="rs-sh"><h2>To answer</h2><span class="tag">' + ls.length + "</span></div>";
      if (sheetCard()) return h + LV.card(L(S.sel), "full") + '<div class="rs-acts"><button type="button" class="rs-b" data-act="deselect"><span>Back to the queue</span></button></div>';
      if (!ls.length) return h + '<p class="lv-empty">' + ic("check", 18) + "Nothing to answer. The camera is still reading.</p>" + LV.summary("lane");
      return h + '<div class="lv-stack">' + ls.map(function (l) { return '<article class="lv-dc' + (S.sel === l.id ? " on" : "") + '" data-id="' + l.id + '" data-st="' + l.st + '">' + LV.card(l, "compact") + "</article>"; }).join("") + "</div>";
    }
  };
})();
