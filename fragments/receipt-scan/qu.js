/* Receipt scan, quantity with a unit (Kitchie issue 754), revision 2, 15 October 2026: the owner chose Option A (RS-87). The review row shows a scanned quantity that carries a unit; the person corrects it with the shopping list's own box (RS-91).
   Loaded after ro-core.js and ro-run.js; it wraps the row, the actions, the header parts and the scroll. The page names its option with <body data-opt="a|b"> (qu-a.html is the chosen one; qu-b.html is kept, not chosen).
   A (chosen): the amount is plain text in the row ("Updates existing (1 L to 3 L)", "New item, 2 L"); the opened row's figure is the shopping list's box with its unit pill.
   B (not chosen, kept): the amount is a quiet pill in the row; tapping it opens the shopping list's quantity sheet.
   Both: the unit is drawn only for a line whose unit was read from its name (rd "unit"). A line with NO quantity read (rd "none") shows a BLANK box, never 1 (RS-88). Number-only, size and weight lines keep today's row (Empty is absent).
   Also here: the list scroll drives a highlight on the receipt photo (RS-89); the summary strip is a slim line at the top (RS-90).
   Mockup only. WORDS, readWords and fits are stand-ins for the sample data: the build uses the shopping list's one reader (quantity-words.ts, quantity.js, held equal by a test) and KitchieQuantity (RS-74). */
(function () {
  "use strict";
  var RO = window.RO, S = RO.S, D = RO.D, ic = RO.ic, esc = RO.esc, fmt = RO.fmt, qOf = RO.qOf, $ = RO.$, $$ = RO.$$, OPT = (document.body.dataset.opt || "a");
  var WORDS = { g: "g gm gms gr grm gram grams gramme grammes", kg: "kg kgs kilo kilos kilogram kilograms kilogramme kilogrammes", mL: "ml mls millilitre millilitres milliliter milliliters", L: "l lt ltr ltrs litre litres liter liters letter letters" };
  var UNIT_OF = {}; Object.keys(WORDS).forEach(function (u) { WORDS[u].split(" ").forEach(function (w) { UNIT_OF[w] = u; }); });
  var PILL = { g: 1, kg: 1, mL: 1, L: 1 };
  var NUMW = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: .5, quarter: .25 };
  /* What the person typed, read the way the shopping list reads it when the box is left: { n, u } for a number with a known unit or none, { words } for anything else (kept exactly as typed). "" is blank. */
  function read(t, pu) {
    t = String(t).trim(); if (!t) return { blank: true };
    var m = /^(\d{1,4}(?:[.,]\d{1,3})?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter)\s*([a-z]*)$/i.exec(t);
    if (!m) return { words: t };
    var n = /^\d/.test(m[1]) ? parseFloat(m[1].replace(",", ".")) : NUMW[m[1].toLowerCase()], w = m[2].toLowerCase();
    if (!w) return { n: n, u: null };
    if (UNIT_OF[w]) return { n: n, u: UNIT_OF[w] };
    if (pu && !PILL[pu] && (w === pu || w === pu + "s")) return { n: n, u: pu };
    return { words: t };
  }
  var fam = function (u) { return u === "g" || u === "kg" ? "w" : u === "mL" || u === "L" ? "v" : ""; };
  /* does this amount add to the item's amount (same unit family; a bare count takes a counted item's unit)? Stand-in for KitchieQuantity.addInto */
  function fits(q, u, pu) { if (u === pu) return true; if (!u) return !fam(pu); return !!fam(u) && fam(u) === fam(pu); }
  var P = RO.P, L = RO.L;
  S.w = {};                                                 /* the person's own words for a line, kept exactly as typed */
  var item = function (l) { return l.st !== "left"; };
  var carries = function (l) { return item(l) && (l.rd === "unit" || l.rd === "none"); };
  var blank = function (l) { return l.rd === "none" && S.q[l.id] == null && S.w[l.id] == null; };
  var nameOf = function (l) { return RO.info(l).name; };
  var txt = function (l) { return S.w[l.id] != null ? S.w[l.id] : blank(l) ? "" : String(Math.round(qOf(l) * 1000) / 1000); };

  var draft = null;                                         /* the sheet's own draft (B), until Save */
  if (RO.Q.get("nounit")) { var lu = L(RO.Q.get("nounit")); if (lu) lu.u = ""; }   /* a state for the page: the unit already taken off */
  if (RO.Q.get("typed")) { var tp = RO.Q.get("typed").split("~"); S.w[tp[0]] = tp[1]; var lt = L(tp[0]); if (lt) lt.u = ""; }   /* a state for the page: the person's own words */
  if (RO.Q.get("qs")) S.qs = RO.Q.get("qs");
  function openDraft(id) { var l = L(id); draft = { id: id, t: txt(l), u: l.u }; }

  /* the shopping list's box: the unit sits in the box as a pill; the x takes it off and the box is the person's own words again. inputmode is numeric only while the pill is on (shopping.js); a box with no pill is a plain text box. */
  function box(id, id2, t, u) {
    var pill = u && PILL[u] ? '<button type="button" class="wunit" id="' + id2 + 'u" data-act="quclr" data-id="' + id + '" aria-label="Unit ' + esc(u) + '. Remove the unit and keep your own words">' + esc(u) + '<span class="wx" aria-hidden="true">×</span></button>' : u ? '<span class="wunit">' + esc(u) + "</span>" : "";
    return '<div class="wantbox' + (u ? " hasunit" : "") + '"><input type="text" class="rs-in field" id="' + id2 + '" data-qu="' + id + '" value="' + esc(t) + '"' + (u && PILL[u] ? ' inputmode="decimal"' : "") + ' autocomplete="off" aria-label="How much">' + pill + "</div>";
  }

  var row0 = RO.row;
  RO.row = function (l) {
    var h = row0(l), o = RO.out(l), id = l.id, p = o.m && P(o.m);
    if (!carries(l) || o.k === "ignored") return h;
    var q = qOf(l), bl = blank(l), w = S.w[id];
    var setOut = function (t) { h = h.replace(/(<span class="ro-out"[^>]*>)[^<]*/, "$1" + t); };
    /* the outcome line says what will happen; a blank amount says it is waiting for the person (RS-88) */
    if (o.k === "top" || o.k === "check") {
      if (w != null) setOut("Updates existing (" + esc(fmt(p.q, p.u)) + " plus “" + esc(w) + "”)");
      else if (bl) setOut("Updates existing (" + esc(fmt(p.q, p.u)) + "). Type how much was bought");
      else if (!fits(q, l.u, p.u)) setOut("Kept as a separate item: " + esc(fmt(q, l.u)) + " cannot be added to " + esc(fmt(p.q, p.u)));
    }
    if (OPT === "a" && o.k === "new") h = h.replace(/(<span class="ro-out" data-k="new">)New item/, "$1New item" + (w != null ? ", “" + esc(w) + "”" : bl ? "" : ", " + esc(fmt(q, l.u))));
    if (OPT === "b" && l.u && w == null && !bl) {
      h = h.replace(/(<span class="ro-st">[\s\S]*?)(<\/span><\/div>)/, '$1<button type="button" class="ro-amt" data-act="quo" data-id="' + id + '" aria-haspopup="dialog" aria-expanded="' + (S.qs === id) + '" aria-label="Amount ' + esc(fmt(q, l.u)) + ". Change it\"><span>" + esc(fmt(q, l.u)) + "</span></button>$2");
      if (S.qs === id && RO.DESK()) { if (!draft || draft.id !== id) openDraft(id); h = h.replace(/<\/li>$/, '<div class="qu-inline" role="group" aria-label="How much ' + esc(nameOf(l)) + '"><h3>How much ' + esc(nameOf(l)) + "?</h3>" + sheetBody(l) + "</div></li>"); }
    }
    if (OPT === "a" && S.sel === id) {
      var u = w != null ? "" : l.u, ct = l.rd === "none" ? "" : l.u ? "" : "";
      if (w == null && !l.u && !bl && l.rd === "unit") h = h.replace(/(<div class="rs-qrow">[\s\S]*?<\/div>)/, '$1<p class="qu-hint">' + hint(l, q, p) + "</p>");
      h = h.replace(/<output>[\s\S]*?<\/output>/, box(id, "qb-" + id, txt(l), u));
      if (w != null) h = h.replace(/(data-act="q[mp]")/g, '$1 disabled');
    }
    return h;
  };
  function hint(l, q, p) { return "The unit is off: counted as " + esc(fmt(q, "")) + "." + (p && !fits(q, "", p.u) ? " That cannot be added to " + esc(fmt(p.q, p.u)) + ", so it would be kept as a separate item." : "") + " Type words if you like, for example 2 litres: they are read when you leave the box."; }
  function sheetBody(l) {
    var d = draft, h = box(l.id, "qs-" + l.id, d.t, d.u);
    h += '<p class="qu-hint">' + (d.u ? "The unit is read from the receipt line. The × takes it off and keeps your own words." : "Your own words. Type 2 litres or 2 L and it is read when you leave the box.") + "</p>";
    return h + '<button type="button" class="rs-b pri" data-act="qusave" data-id="' + l.id + '">Save</button>';
  }

  /* what leaving the box does: the same as the shopping list. A number and a known unit is folded (2 litres, 2L, 2 ltr all become 2 L); a number alone keeps the line's unit as it is now; anything else is kept as typed. */
  function apply(id, t, to) {
    var l = L(id), p = P(RO.out(l).m || ""), r = read(t, p && p.u);
    if (r.blank) { if (to === "draft") { draft.t = ""; } else { delete S.q[id]; delete S.w[id]; if (l.rd === "none") { l.u = l.u; } } return; }
    if (r.words) { if (to === "draft") { draft.t = r.words; draft.u = ""; } else { S.w[id] = r.words; l.u = ""; } return; }
    if (to === "draft") { draft.t = String(r.n); if (r.u) draft.u = r.u; return; }
    delete S.w[id]; S.q[id] = r.n; if (r.u) l.u = r.u;
  }
  var act0 = RO.act;
  RO.act = function (a, id, v) {
    var l = id && L(id);
    switch (a) {
      case "quo": S.qs = S.qs === id ? null : id; draft = null; if (S.qs) openDraft(id); S.sel = null; S.pick = null; RO.render(); return;
      case "quclose": S.qs = null; draft = null; RO.render(); return;
      case "qusave": if (draft) { var d = draft; draft = null; S.qs = null; var r = read(d.t, null); if (r.words) { S.w[id] = r.words; l.u = ""; } else if (r.n != null) { delete S.w[id]; S.q[id] = r.n; l.u = r.u || d.u; } } S.qs = null; draft = null; RO.render(); return;
      case "quclr":
        if (S.qs && draft && draft.id === id) draft.u = ""; else l.u = "";
        RO.render(); var inp = document.getElementById((S.qs && draft ? "qs-" : "qb-") + id); if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {} } return;
    }
    return act0.apply(this, arguments);
  };
  function takeBox(t) { var id = t.dataset.qu; if (S.qs && draft && draft.id === id) apply(id, t.value, "draft"); else apply(id, t.value, "line"); }
  document.addEventListener("change", function (e) { var t = e.target; if (t.matches && t.matches("input[data-qu]")) { if (t.id.indexOf("qs-") === 0 && !draft) return; takeBox(t); setTimeout(RO.render, 0); } });
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (e.key === "Enter" && t.matches && t.matches("input[data-qu]")) { e.preventDefault(); takeBox(t); if (S.qs && draft) { draft.t = draft.t; RO.act("qusave", draft.id); } else RO.render(); }
    else if (e.key === "Escape" && S.qs) { e.stopPropagation(); RO.act("quclose"); }
  }, true);

  /* B's sheet on a phone: appended after each render, over a dim (the same .dim and .panel as the other sheets) */
  var root = document.getElementById("app");
  function sheet() {
    if (OPT !== "b" || !S.qs || RO.DESK() || !root || root.querySelector(".qu-sheet")) return;
    var l = L(S.qs); if (!l) return; if (!draft || draft.id !== S.qs) openDraft(S.qs);
    var el = document.createElement("div");
    el.innerHTML = '<div class="dim" data-act="quclose"></div><div class="panel qu-sheet" data-mode="qty" role="dialog" aria-label="How much ' + esc(nameOf(l)) + '"><button type="button" class="grab" data-act="quclose" aria-label="Close"></button><h2>How much ' + esc(nameOf(l)) + "?</h2>" + sheetBody(l) + "</div>";
    while (el.firstChild) root.appendChild(el.firstChild);
  }

  /* ---- RS-90: the summary strip is a slim line at the top. Once the whole receipt is read (or a photo), the status card (a second box saying "That is the whole receipt: 16 lines, 9 to settle") is dropped: its words are the filter's counts and the progress, which move up under the title as one line. While the camera is looking, the prompt stays (it is the instruction). ---- */
  var settled = function () { return S.phase === "end" || S.phase === "still"; };
  var parts0 = RO.parts, head0 = RO.head;
  RO.parts = function () {
    var p = parts0();
    if (settled()) {
      var t = RO.tally(), pct = t.total ? Math.round(t.resolved / t.total * 100) : 0;
      p.status = "";
      p.bar += '<div class="qu-top" role="status" aria-live="polite"><b class="ro-pn">' + t.resolved + " of " + t.total + ' resolved</b><span class="ro-pb" role="progressbar" aria-valuemin="0" aria-valuemax="' + t.total + '" aria-valuenow="' + t.resolved + '" aria-label="Lines resolved"><i style="width:' + pct + '%"></i></span></div>';
    }
    return p;
  };
  RO.head = function () { var h = head0(); return settled() ? h.replace(/<div class="ro-prog">[\s\S]*?<\/div>(?=<div class="ro-fs")/, "") : h; };

  /* ---- RS-89: the list drives the photo. Scrolling the parsed lines (the phone's list, the desktop's lane) puts the receipt photo on the first line in view and rings it, as a selected line is ringed; nothing re-renders, so the scroll is never disturbed. ---- */
  var tracked = null, tick = 0;
  function listBox() { return RO.DESK() ? $(".panel[data-mode=lane]") : $(".ro-list"); }
  function mark() {
    $$(".lv-ln.qu-track").forEach(function (e) { e.classList.remove("qu-track"); });
    var id = S.sel || tracked, paper = $(".lv-paper"); if (!paper || !id || !settled() || !RO.GEO[id]) return;
    var ln = $('.lv-ln[data-id="' + id + '"]', paper); if (ln && !S.sel) ln.classList.add("qu-track");
    var g = RO.GEO[id], to = Math.max(0, Math.min(RO.maxScroll(), Math.round(g.top - (S.stageH - g.h) / 2)));
    S.scroll = to; paper.style.transform = "translateY(" + (-to) + "px)";
  }
  function follow() {
    tick = 0; var b = listBox(); if (!b || !settled()) return;
    var top = b.getBoundingClientRect().top, rows = $$(".ro-li", b), cur = null;
    for (var i = 0; i < rows.length; i++) { if (rows[i].getBoundingClientRect().bottom > top + 24) { cur = rows[i]; break; } }
    if (rows.length && b.scrollTop + b.clientHeight >= b.scrollHeight - 2 && !RO.DESK()) cur = rows[rows.length - 1];
    if (!cur || cur.dataset.id === tracked) return; tracked = cur.dataset.id; mark();
  }
  document.addEventListener("scroll", function (e) { var t = e.target; if (t && t.matches && (t.matches(".ro-list") || t.matches(".panel[data-mode=lane]")) && !tick) tick = requestAnimationFrame(follow); }, true);
  new MutationObserver(function () { sheet(); if (settled()) { if (!tracked) follow(); else mark(); } }).observe(root, { childList: true });
  if (S.qs) { setTimeout(sheet, 0); setTimeout(sheet, 400); }
})();
