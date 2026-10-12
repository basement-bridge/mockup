/* Option B, Sort the pile: the review sorts itself by what needs you. "Check these" (close matches) and "Not recognised" come first and shrink as you decide;
   decided lines sink into "Ready". Phone and desktop: the detail opens in a sheet (phone) or the right lane (desktop). */
(function () {
  var RS = window.RS, S = RS.S, D = RS.D, esc = RS.esc, fmt = RS.fmt;
  var V = RS.views.b = { phoneDetail: "sheet" };
  var grpOf = function (l) { var k = RS.out(l).k; return k === "open" ? (l.st === "fuzzy" ? "check" : "new") : k === "skip" ? "skip" : "ready"; };
  V.visible = function (l) { return true; };
  function card(l) {
    var g = grpOf(l), o = RS.out(l), x = RS.info(l), p = l.m && RS.P(l.m), h = '<article class="b-c" data-g="' + g + '"' + (S.sel === l.id ? ' data-sel="1"' : "") + ' data-id="' + l.id + '">';
    h += '<button type="button" class="b-top" data-act="sel" data-id="' + l.id + '"><span class="b-raw">' + esc(l.raw[0]) + (l.raw[1] ? " · " + esc(l.raw[1]) : "") + '</span><span class="b-pr">' + RS.parts.money(l.price) + "</span></button>";
    if (g === "check") {
      h += '<div class="b-sug"><span class="b-arrow">→</span><div class="b-who">' + RS.itemTile(p) + '</div><span class="b-cf">' + RS.conf(l) + "<em>" + RS.BW[RS.band(l.score)] + "</em></span></div>";
      h += '<div class="b-q">' + RS.parts.stepper(l) + '</div><div class="rs-acts">' + RS.acts(l, { short: true }) + '<button type="button" class="rs-b ghost sm" data-act="sel" data-id="' + l.id + '">' + RS.ic("swap", 18) + "<span>Pick another</span></button></div>";
    } else if (g === "new") {
      h += '<label class="b-nm"><span class="rs-lbl">Add as</span><input class="rs-in" data-nm="' + l.id + '" value="' + esc(S.nm[l.id] != null ? S.nm[l.id] : l.guess || "") + '" placeholder="' + (l.unclear ? "What is it? The text was unclear" : "Name") + '" autocomplete="off"></label><div class="b-q">' + RS.parts.stepper(l) + "</div>";
      h += '<div class="rs-acts">' + RS.acts(l, { short: true }) + "</div>";
    } else {
      h += '<button type="button" class="b-ln" data-act="sel" data-id="' + l.id + '">' + RS.glyph(l) + '<span class="b-lt"><b class="' + (g === "skip" ? "mute" : "") + '">' + esc(RS.nameOf(l)) + '</b><span>' + esc(x.detail) + '</span></span><span class="b-lq">' + (g === "skip" ? "" : fmt(RS.qOf(l), l.u)) + "</span></button>";
      if (g === "skip" && l.st === "skip") h += '<div class="rs-acts" style="padding:0 12px 10px">' + RS.acts(l) + "</div>";
    }
    return h + "</article>";
  }
  function group(g, title, sub, ls, opts) {
    var h = '<section class="b-g" data-g="' + g + '"><header class="b-gh"><div><h2>' + title + '</h2><p>' + sub + '</p></div><span class="b-n">' + ls.length + "</span></header>";
    if (!ls.length) h += '<p class="b-empty">' + RS.ic("check", 18) + " " + (opts.empty || "All done") + "</p>";
    else if (opts.fold) h += '<details class="b-fold"' + (S.filter === g ? " open" : "") + "><summary><span>" + (opts.peek || "Show") + "</span>" + RS.ic("down", 18) + '</summary><div class="b-list">' + ls.map(card).join("") + "</div></details>";
    else h += '<div class="b-list">' + ls.map(card).join("") + "</div>";
    return h + "</section>";
  }
  V.review = function () {
    var by = { check: [], new: [], ready: [], skip: [] }; D.lines.forEach(function (l) { by[grpOf(l)].push(l); });
    var need = D.lines.filter(function (l) { return l.st === "fuzzy" || l.st === "none"; }).length, left = by.check.length + by.new.length, done = need - left;
    var h = '<section class="scr rs-reviewpage b-page" aria-label="Receipt review">' + RS.head("Sorted by what needs you") + '<div class="scr-body">' + RS.banner();
    h += '<div class="b-prog"><div class="b-pt"><b>' + (left ? left + " to decide" : "All decided") + '</b><span>' + done + " of " + need + " checked</span></div><div class=\"rs-prog\" role=\"progressbar\" aria-valuenow=\"" + done + '" aria-valuemin="0" aria-valuemax="' + need + '"><i style="width:' + Math.round(done / need * 100) + '%"></i></div></div>';
    h += group("check", "Check these", "Close to something you have. Is it the same one?", by.check, { empty: "Nothing left to check" });
    h += group("new", "Not recognised", "Nothing like these in your Pantry. Add each as new, or cross it out.", by.new, { empty: "Nothing left to confirm" });
    var peek = by.ready.slice(0, 3).map(function (l) { return esc(RS.nameOf(l)); }).join(", ") + (by.ready.length > 3 ? " and " + (by.ready.length - 3) + " more" : "");
    h += group("ready", "Ready", "Exact matches and the ones you decided. Open one to change it.", by.ready, { fold: true, peek: peek });
    h += group("skip", "Not added", "Discounts, bags and things that are not food.", by.skip, { fold: true, peek: by.skip.map(function (l) { return esc(l.short || "Not an item"); }).join(", ") });
    return h + "</div>" + RS.bar() + "</section>";
  };
})();
