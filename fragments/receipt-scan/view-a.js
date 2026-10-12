/* Option A, Receipt order: the receipt as one list in the order it was printed. One row per line, state glyph on the left, confidence dots on the right.
   Phone: a row opens inline. Desktop: a row opens in the right lane (the Pantry's flyout). Viewport differences are in phone.css and desktop.css. */
(function () {
  var RS = window.RS, S = RS.S, D = RS.D, esc = RS.esc, fmt = RS.fmt;
  var V = RS.views.a = { phoneDetail: "inline" };
  function counts() { var t = RS.tally(); return { all: D.lines.length, check: t.check, newq: t.newq, ready: t.ready, skip: t.skip }; }
  function filt(l) { var o = RS.out(l).k, f = S.filter; return f === "all" || (f === "check" && o === "open" && l.st === "fuzzy") || (f === "new" && o === "open" && l.st === "none") || (f === "ready" && /^(top|newb|new)$/.test(o)) || (f === "skip" && o === "skip"); }
  function row(l) {
    var o = RS.out(l), x = RS.info(l), openk = o.k === "open", exp = S.open === l.id && !RS.DESK(), sel = S.sel === l.id && RS.DESK();
    var side = l.st === "fuzzy" && (openk || o.picked || RS.S.res[l.id]) && o.k !== "new" && o.k !== "skip" ? RS.conf(l) : '<span class="a-q">' + (l.st === "skip" ? RS.parts.money(l.price) : fmt(RS.qOf(l), l.u)) + "</span>";
    if (l.st === "fuzzy" && openk) side = RS.conf(l) + '<span class="a-q">' + fmt(RS.qOf(l), l.u) + "</span>";
    var h = '<li class="a-r" data-k="' + o.k + '" data-st="' + l.st + '"' + (sel ? ' data-sel="1"' : "") + (exp ? ' data-exp="1"' : "") + ">";
    h += '<button type="button" class="a-main" data-act="' + (RS.DESK() ? "sel" : "toggle") + '" data-id="' + l.id + '" aria-expanded="' + (exp || sel) + '">' + RS.glyph(l) + '<span class="a-t"><span class="a-raw">' + esc(l.raw[0]) + (l.raw[1] ? " · " + esc(l.raw[1]) : "") + '</span><span class="a-nm' + (o.k === "skip" ? " mute" : "") + '">' + esc(RS.nameOf(l)) + (l.from && !S.split[l.id] ? ' <small class="a-x2">2 lines</small>' : "") + '</span><span class="a-sub">' + RS.parts.chip(l) + '<span class="a-d">' + esc(x.detail) + "</span></span></span>" + '<span class="a-side">' + side + "</span></button>";
    if (openk || l.st === "skip" && o.k !== "skip") h += '<div class="a-acts">' + RS.acts(l, { short: true }) + "</div>";
    else if (l.st === "skip") h += '<div class="a-acts">' + RS.acts(l, { short: true }) + "</div>";
    if (exp) h += '<div class="a-more">' + RS.detail(l) + "</div>";
    return h + "</li>";
  }
  V.review = function () {
    var c = counts(), f = S.filter, h = '<section class="scr rs-reviewpage a-page" aria-label="Receipt review">' + RS.head("Receipt order · " + c.all + " lines") + '<div class="scr-body">' + RS.banner();
    var chips = [["all", "All", c.all], ["check", "Check", c.check], ["new", "New?", c.newq], ["ready", "Ready", c.ready], ["skip", "Not added", c.skip]];
    h += '<div class="a-filt" role="tablist" aria-label="Show">' + chips.map(function (a) { return '<button type="button" role="tab" aria-selected="' + (f === a[0]) + '" data-act="filter" data-v="' + a[0] + '" data-k="' + a[0] + '">' + a[1] + "<b>" + a[2] + "</b></button>"; }).join("") + "</div>";
    var ls = D.lines.filter(filt);
    h += '<ul class="a-list">' + (ls.length ? ls.map(row).join("") : '<li class="a-none">Nothing here. Every line in this group is dealt with.</li>') + "</ul>";
    if (f === "skip" || f === "all") h += '<details class="a-ign"' + (f === "skip" ? " open" : "") + "><summary>" + RS.ic("receipt", 16) + " Header and totals, ignored (" + D.ignored.length + ")</summary><ul>" + D.ignored.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></details>";
    return h + "</div>" + RS.bar() + "</section>";
  };
})();
