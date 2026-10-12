/* Option D, One at a time: accept the exact matches in one glance, then decide the doubtful lines as cards, one per line.
   Phone: swipe right to say yes, left for a new item (the buttons do the same). Desktop: the card in the column, the queue in the right lane, Y N X on the keyboard. */
(function () {
  var RS = window.RS, S = RS.S, D = RS.D, esc = RS.esc, fmt = RS.fmt;
  var V = RS.views.d = { phoneDetail: "none" };
  var need = function () { return D.lines.filter(function (l) { return l.st === "fuzzy" || l.st === "none"; }); };
  var openL = function () { return need().filter(function (l) { return RS.out(l).k === "open"; }); };
  V.visible = function (l) { return l.st === "fuzzy" || l.st === "none"; };
  function cur() { var o = openL(), c = S.sel && RS.L(S.sel); if (c && RS.out(c).k === "open") return c; var f = o[0]; S.sel = f ? f.id : null; return f; }
  function card(l) {
    var all = need(), i = all.indexOf(l) + 1, h = '<article class="d-card" data-id="' + l.id + '" data-st="' + l.st + '" aria-label="Line ' + i + " of " + all.length + '">';
    h += '<div class="d-sw d-yes" aria-hidden="true">' + RS.ic("check", 28) + "<span>" + (l.st === "fuzzy" ? "Yes" : "Add") + '</span></div><div class="d-sw d-no" aria-hidden="true">' + RS.ic(l.st === "fuzzy" ? "plus" : "x", 28) + "<span>" + (l.st === "fuzzy" ? "New item" : "Not an item") + "</span></div>";
    h += '<div class="d-cnt"><b>' + i + "</b> of " + all.length + '</div><div class="d-print">' + l.raw.map(function (t) { return "<div>" + esc(t) + "</div>"; }).join("") + '<span class="d-pr">' + RS.parts.money(l.price) + "</span></div>";
    h += '<p class="d-how">' + RS.ic("receipt", 14) + "<span>" + esc(l.note) + "</span></p>";
    if (l.st === "fuzzy") {
      h += '<div class="d-lead"><span class="rs-lbl">Closest in your Pantry</span><div class="d-who">' + RS.itemTile(RS.P(l.m)) + '</div><div class="d-cf">' + RS.conf(l) + "<em>" + RS.BW[RS.band(l.score)] + "</em></div></div>";
      var cs = (l.cand || []); if (cs.length) h += '<div class="d-or"><span class="rs-lbl">Or</span><div class="rs-cl">' + cs.map(function (c) { return '<button type="button" class="rs-cc" data-act="pick" data-id="' + l.id + '" data-v="' + c + '">' + (RS.P(c).em || "•") + " " + esc(RS.P(c).name) + "</button>"; }).join("") + "</div></div>";
    } else {
      h += '<div class="d-lead none"><span class="rs-lbl">Not in your Pantry</span><label class="d-nm"><span class="sr-only">New item name</span><input class="rs-in" data-nm="' + l.id + '" value="' + esc(S.nm[l.id] != null ? S.nm[l.id] : l.guess || "") + '" placeholder="' + (l.unclear ? "What is it? The text was unclear" : "Name") + '" autocomplete="off"></label></div>';
    }
    h += '<div class="d-q"><span class="rs-lbl">Amount</span>' + RS.parts.stepper(l) + "</div>";
    var key = RS.DESK() && S.keys;
    if (l.st === "fuzzy") h += '<div class="rs-acts col">' + RS.btn("match", l.id, "Yes, it’s " + RS.P(l.m).name, "pri big", "check", key && "Y") + '<div class="d-two">' + RS.btn("new", l.id, "No, new item", "", "plus", key && "N") + RS.btn("skip", l.id, "Not an item", "", "x", key && "X") + "</div></div>";
    else h += '<div class="rs-acts col">' + RS.btn("new", l.id, "Add as new item", "pri big", "check", key && "Y") + RS.btn("skip", l.id, "Not an item", "", "x", key && "X") + "</div>";
    return h + "</article>";
  }
  function readyCard() {
    var ex = D.lines.filter(function (l) { return l.st === "exact"; }), t = ex.filter(function (l) { return RS.out(l).k === "top"; }).length;
    return '<details class="d-ready"><summary><span class="d-rg">' + RS.ic("check", 22) + '</span><span class="d-rt"><b>' + ex.length + " exact matches are ready</b><small>" + t + " top up, " + (ex.length - t) + " new item" + (ex.length - t === 1 ? "" : "s") + '</small></span><span class="d-em">' + ex.map(function (l) { return RS.P(l.m).em || "•"; }).join(" ") + "</span>" + RS.ic("down", 18) + '</summary><ul class="d-rl">' + ex.map(function (l) { var x = RS.info(l); return '<li><button type="button" data-act="sel" data-id="' + l.id + '"><b>' + esc(x.name) + "</b><span>" + RS.parts.chip(l) + " " + esc(x.detail) + "</span></button></li>"; }).join("") + "</ul></details>";
  }
  function decided() {
    var d = need().filter(function (l) { return RS.out(l).k !== "open"; });
    if (!d.length) return "";
    return '<details class="d-dec"><summary>Decided (' + d.length + ")" + RS.ic("down", 18) + '</summary><ul class="d-rl">' + d.map(function (l) { var x = RS.info(l); return "<li><div><b" + (x.k === "skip" ? ' class="mute"' : "") + ">" + esc(RS.nameOf(l)) + "</b><span>" + RS.parts.chip(l) + " " + esc(x.detail) + '</span></div><button type="button" class="rs-b ghost sm" data-act="undo" data-id="' + l.id + '">' + RS.ic("undo", 16) + "<span>Change</span></button></li>"; }).join("") + "</ul></details>";
  }
  function skipped() { var s = D.lines.filter(function (l) { return l.st === "skip"; }); return '<details class="d-dec"' + (S.filter === "skip" ? " open" : "") + "><summary>Not added (" + s.length + ")" + RS.ic("down", 18) + '</summary><ul class="d-rl">' + s.map(function (l) { return "<li><div><b" + (RS.out(l).k === "skip" ? ' class="mute"' : "") + ">" + esc(l.raw[0]) + "</b><span>" + esc(l.why) + "</span></div>" + RS.acts(l) + "</li>"; }).join("") + "</ul></details>"; }
  V.review = function () {
    var c = cur(), o = openL(), all = need(), h = '<section class="scr rs-reviewpage d-page" aria-label="Receipt review">' + RS.head(o.length ? o.length + " to check, one at a time" : "Everything checked") + '<div class="scr-body">' + RS.banner() + readyCard();
    h += '<div class="d-deck">';
    if (c) { h += '<div class="d-dots" role="tablist" aria-label="Lines to check">' + all.map(function (l) { var k = RS.out(l).k; return '<button type="button" role="tab" class="d-dot" data-k="' + k + '" data-cur="' + (l === c) + '" data-act="sel" data-id="' + l.id + '" aria-label="' + esc(RS.nameOf(l)) + '"></button>'; }).join("") + "</div>" + card(c) + '<p class="d-swipe">' + (RS.DESK() ? "Keys: " + RS.kc("Y") + " yes " + RS.kc("N") + " new item " + RS.kc("X") + " not an item" : "Swipe the card right for yes, left for a new item") + "</p>"; }
    else h += '<div class="d-all"><span class="d-big">' + RS.ic("check", 36) + "</span><h2>All checked</h2><p>Nothing is added until you say so.</p>" + RS.btn("commit", "", "Review and add " + RS.tally().ready, "pri big", "check") + "</div>";
    h += "</div>" + decided() + skipped();
    return h + "</div>" + RS.bar() + "</section>";
  };
  V.panel = function () {
    var o = openL(), t = RS.tally(), h = '<div class="rs-sh"><h2>Up next</h2></div><ol class="d-q2">';
    need().forEach(function (l) { var k = RS.out(l).k; h += '<li data-k="' + k + '" data-cur="' + (S.sel === l.id) + '"><button type="button" data-act="sel" data-id="' + l.id + '">' + RS.glyph(l) + '<span class="d-qt"><b>' + esc(RS.nameOf(l)) + "</b><small>" + esc(l.raw[0]) + "</small></span>" + (k === "open" ? (l.st === "fuzzy" ? RS.conf(l) : "") : RS.parts.chip(l)) + "</button></li>"; });
    h += "</ol>" + RS.summaryHtml(false);
    return h;
  };
  /* touch: drag the card, release past the line to decide (phone file calls this) */
  V.swipe = function () {
    var st = null;
    document.addEventListener("pointerdown", function (e) { var c = e.target.closest(".d-card"); if (!c || e.target.closest("button,input,a")) return; st = { c: c, x: e.clientX, id: c.dataset.id, dx: 0 }; c.setPointerCapture(e.pointerId); c.classList.add("drag"); });
    document.addEventListener("pointermove", function (e) { if (!st) return; st.dx = e.clientX - st.x; st.c.style.transform = "translateX(" + st.dx + "px) rotate(" + st.dx / 24 + "deg)"; st.c.dataset.dir = st.dx > 30 ? "yes" : st.dx < -30 ? "no" : ""; });
    var end = function () { if (!st) return; var l = RS.L(st.id), dx = st.dx, c = st.c; st = null; c.classList.remove("drag"); if (Math.abs(dx) > 90) { c.style.transition = "transform .18s ease-in,opacity .18s"; c.style.transform = "translateX(" + (dx > 0 ? 500 : -500) + "px)"; c.style.opacity = "0"; setTimeout(function () { RS.act(dx > 0 ? (l.st === "fuzzy" ? "match" : "new") : (l.st === "fuzzy" ? "new" : "skip"), l.id); }, 170); } else { c.style.transform = ""; c.dataset.dir = ""; } };
    document.addEventListener("pointerup", end); document.addEventListener("pointercancel", end);
  };
})();
