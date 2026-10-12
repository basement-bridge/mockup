/* Option C, The paper page: the receipt drawn as paper. Every printed line has a circle in the margin. Tick it to say "yes, as written next to it" (a close match accepted, a new item added);
   the Shopping list's own scribble crosses the line out when you do. A cross at the end of the line says "not an item". The pencilled note beside each line is the machine's suggestion; tap it to change it.
   Phone: the note opens a sheet. Desktop: the right lane. */
(function () {
  var RS = window.RS, S = RS.S, D = RS.D, esc = RS.esc, fmt = RS.fmt;
  var V = RS.views.c = { phoneDetail: "sheet", advance: true };
  var scr = function (l) { return '<svg class="c-scr" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="' + RS.scrib(l.id) + '"/></svg>'; };
  function line(l) {
    var o = RS.out(l), x = RS.info(l), r = S.res[l.id], k = o.k, you = r && (r.k === "match" || r.k === "pick" || r.k === "new" || r.k === "add");
    var tick, note;
    if (k === "open") tick = '<button type="button" class="c-tick" data-act="' + (l.st === "fuzzy" ? "match" : "new") + '" data-id="' + l.id + '" aria-label="' + (l.st === "fuzzy" ? "Tick: yes, it is " + esc(RS.P(l.m).name) : "Tick: add " + esc(l.guess || "this") + " as a new item") + '"></button>';
    else if (k === "skip") tick = l.st === "skip" ? '<button type="button" class="c-tick off" data-act="add2" data-id="' + l.id + '" aria-label="This is an item, add it"></button>' : '<button type="button" class="c-tick off" data-act="undo" data-id="' + l.id + '" aria-label="Bring it back"></button>';
    else tick = '<button type="button" class="c-tick on" data-act="' + (you ? "undo" : "sel") + '" data-id="' + l.id + '" aria-label="' + (you ? "Untick" : "Ready, open to change") + '">' + RS.ic("check", 16) + "</button>";
    if (k === "open" && l.st === "fuzzy") note = '<span class="c-n-t">' + RS.ic("approx", 14) + esc(RS.P(l.m).name) + "?</span>" + RS.conf(l);
    else if (k === "open") note = '<span class="c-n-t">' + RS.ic("q", 14) + (l.unclear ? "Unclear. Name it" : "New: " + esc(S.nm[l.id] != null ? S.nm[l.id] : l.guess)) + "</span>";
    else if (k === "top") note = '<span class="c-n-t">' + RS.ic("up", 14) + esc(x.name) + " " + esc(x.detail) + "</span>";
    else if (k === "newb" || k === "new") note = '<span class="c-n-t">' + RS.ic("plus", 14) + "New: " + esc(x.name) + ", " + fmt(RS.qOf(l), l.u) + "</span>";
    else note = '<span class="c-n-t mute">' + (l.st === "skip" ? esc(l.short) : "Not an item") + "</span>";
    var h = '<li class="c-l" data-k="' + k + '" data-st="' + l.st + '"' + (S.sel === l.id ? ' data-sel="1"' : "") + (you ? ' data-you="1"' : "") + ' data-id="' + l.id + '">' + tick;
    h += '<div class="c-body"><div class="c-print">' + l.raw.map(function (t, i) { return '<span class="c-pl">' + esc(t) + (i === l.raw.length - 1 ? '<span class="c-dots"></span><i>' + RS.parts.money(l.price) + "</i>" : "") + "</span>"; }).join("") + (you && k !== "skip" ? scr(l) : "") + "</div>";
    h += '<button type="button" class="c-note" data-act="sel" data-id="' + l.id + '">' + note + "</button></div>";
    if (k === "open") h += '<button type="button" class="c-x" data-act="skip" data-id="' + l.id + '" aria-label="Not an item: cross it out">' + RS.ic("x", 18) + "</button>";
    return h + "</li>";
  }
  V.review = function () {
    var t = RS.tally(), h = '<section class="scr rs-reviewpage c-page" aria-label="Receipt review">' + RS.head("Tick what is right. Cross out what is not") + '<div class="scr-body">' + RS.banner();
    h += '<div class="c-key" aria-label="Key"><span><i class="c-tick on sm">' + RS.ic("check", 12) + "</i> ready</span><span><i class=\"c-tick sm\"></i> your tick</span><span>" + RS.ic("x", 14) + " not an item</span></div>";
    h += '<div class="c-paper"><div class="c-head">Receipt · ' + D.lines.length + " lines</div><ol class=\"c-lines\">" + D.lines.map(line).join("") + '</ol><div class="c-foot"><span>' + RS.ic("receipt", 14) + " Header and totals ignored (" + D.ignored.length + ')</span></div></div>';
    return h + "</div>" + RS.bar() + "</section>";
  };
})();
