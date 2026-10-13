/* Direction A, Tap the paper. Boxes on the live picture are the controls. Tap one: the frame holds, the line comes up to the top of the picture and its card opens at the bottom (a sheet on a phone, the right lane on a desktop).
   Answer it and the camera carries on. Auto-capture banks each screenful and the receipt slides on, so a long receipt works. What no match needs (a confirm as new) is done in the Last look at the end (RS-39). */
(function () {
  var LV = window.LV, S = LV.S, L = LV.L, ic = LV.ic, esc = LV.esc;
  var head = function (l) { var x = LV.info(l); return '<div class="rs-sh"><h2>' + esc(x.name || l.raw[0]) + '</h2><button type="button" class="x ib" data-act="deselect" aria-label="Close and carry on">' + ic("x", 20) + "</button></div>"; };
  LV.dirs.a = {
    holds: true,
    stageCls: function () { return "lv-live"; },
    tap: function (id) { LV.select(id); },
    afterAnswer: function (id) { LV.deselect(); },
    sheet: function () { if (!S.sel) return ""; var l = L(S.sel); return '<div class="lv-sheet" role="dialog" aria-label="' + esc(l.raw[0]) + '"><button type="button" class="grab" data-act="deselect" aria-label="Close"></button>' + head(l) + LV.card(l, "compact") + "</div>"; },
    lane: function () { if (!S.sel) return LV.summary("lane"); var l = L(S.sel); return head(l) + LV.card(l, "full"); }
  };
})();
