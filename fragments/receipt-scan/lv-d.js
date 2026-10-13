/* Direction D, Camera and list. The picture is the top half and a live list is the bottom half: one row per line, in receipt order, appearing as the lines are read, like the paper printing out below the lens.
   The list is where decisions are made: a row holds the quick answer, tap it for the card. Tapping a box finds its row. Nothing needs the picture to hold still, and on a desktop the list is the lane (RS-42). */
(function () {
  var LV = window.LV, S = LV.S, L = LV.L, out = LV.out, info = LV.info, ic = LV.ic, esc = LV.esc;
  function row(l) {
    var x = info(l), o = out(l), id = l.id, on = S.sel === id, k = o.k, right = "";
    if (k === "open" && l.st === "fuzzy") right = '<span class="rs-cw">' + LV.conf(l) + "<em>" + LV.BW[LV.band(l)] + "</em></span>";
    else right = '<span class="rs-chip" data-k="' + k + '" data-st="' + l.st + '">' + ic(x.g, 14) + "<b>" + x.label + "</b></span>";
    var h = '<div class="lv-lr' + (on ? " on" : "") + '" data-k="' + k + '" data-st="' + l.st + '" data-id="' + id + '" role="listitem"><button type="button" class="lv-lrb" data-act="box" data-id="' + id + '" aria-expanded="' + on + '"><span class="rs-g" data-k="' + k + '" data-st="' + l.st + '">' + ic(x.g, 18) + '</span><span class="lv-lt"><b>' + esc(x.name || l.raw[0]) + "</b><small>" + esc(x.detail) + "</small></span>" + right + "</button>";
    if (on) h += LV.card(l, "full"); else if (k === "open" || l.st === "skip") h += '<div class="lv-lq">' + LV.acts(l, { short: true }) + "</div>";
    return h + "</div>";
  }
  function list() {
    var ls = LV.seenLines().sort(function (a, b) { return LV.ORDER.indexOf(a.id) - LV.ORDER.indexOf(b.id); });
    if (!ls.length) return '<div class="lv-list lv-keep" role="list"><p class="lv-empty">' + ic("receipt", 18) + "Lines appear here as they are read.</p></div>";
    return '<div class="lv-list lv-keep" role="list" aria-label="Lines read, in receipt order">' + ls.map(row).join("") + "</div>";
  }
  LV.dirs.d = {
    holds: false,
    stageCls: function () { return "lv-live lv-short"; },
    tap: function (id) { S.sel = S.sel === id ? null : id; LV.render(); },
    afterAnswer: function (id) { if (S.sel === id) S.sel = null; LV.render(); },
    extra: function () { return LV.DESK() ? "" : list(); },
    /* the list follows the first line that needs an answer until the person scrolls it themselves */
    after: function () {
      var l = LV.$(".lv-list"); if (!l) return;
      if (!l.dataset.bound) { l.dataset.bound = "1"; ["wheel", "touchstart", "keydown"].forEach(function (ev) { l.addEventListener(ev, function () { S.listFree = true; }, { passive: true }); }); }
      if (S.listFree || S.sel) return;
      var r = LV.$(".lv-lr[data-k=open]", l); if (r) l.scrollTop = Math.max(0, r.offsetTop - l.offsetTop - 6);
    },
    lane: function () { return '<div class="rs-sh"><h2>Lines read</h2><span class="tag">' + LV.tally().seen + "</span></div>" + list() + LV.summary("lane"); }
  };
})();
