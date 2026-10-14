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
      else if (!fits(q, l.u, p.u)) setOut("Kept separate: " + esc(fmt(q, l.u)) + " cannot join " + esc(fmt(p.q, p.u)));
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

  /* ---- RS-92: the first pill is Exact (it replaces All). Every line is in exactly one pill: Exact (the line is settled: matched exactly, or settled by the person and adding), Check, Unsure, Ignored. "all" is kept only as an alias of the first pill, so older links and the Leave reset still land on it. ---- */
  var pillOf = function (l) { var k = RO.out(l).k; return k === "top" || k === "new" ? "exact" : k; };
  var inFilter0 = RO.inFilter;
  RO.inFilter = function (l, f) { return f === "all" || f === "exact" ? pillOf(l) === "exact" : inFilter0(l, f); };

  /* ---- RS-94: long-press Exact ticks every exact-match line for Add at once. Nothing is written until Add (RS-69). An Exact line waits for a tick (it is not in "Add N" until ticked); a line with a blank amount cannot be ticked (RS-88). S.cf = the ticked ids. ---- */
  S.cf = {}; S.cfPrev = null;
  var isEx = function (l) { var o = RO.out(l); return item(l) && l.st === "exact" && o.k === "top" && !o.picked; };
  var pending = function (l) { return isEx(l) && !S.cf[l.id]; };
  var tickable = function (l) { return pending(l) && !blank(l); };
  var tickables = function () { return RO.seenLines().filter(tickable); };
  var qcf = RO.Q.get("cf");                                  /* a state for the page: cf=all ticks every exact line, cf=l1,l2 ticks those */
  if (qcf === "all" || RO.Q.get("pre") === "resolved" || RO.Q.get("pre") === "half" || S.step === "done") D.lines.forEach(function (l) { if (l.st === "exact") S.cf[l.id] = true; });
  else if (qcf) qcf.split(",").forEach(function (i) { S.cf[i] = true; });
  RO.adjTally = function (t) { RO.seenLines().forEach(function (l) { if (pending(l)) { t.top--; t.resolved--; t.exact--; t.pend = (t.pend || 0) + 1; } }); };
  RO.adjEntries = function (e) { e.top = e.top.filter(function (a) { if (!pending(a[0])) return true; e.open.push(a); return false; }); };

  var pressMs = 600;
  function tickAll() {
    var ids = tickables().map(function (l) { return l.id; }); if (!ids.length) return;
    S.cfPrev = Object.assign({}, S.cf); ids.forEach(function (i) { S.cf[i] = true; });
    var n = ids.length; S.toast = n + " exact line" + (n === 1 ? "" : "s") + ' ticked for Add. <button type="button" data-act="excfundo">Undo</button>' + (S.fixed ? "" : '<span class="lv-cd" aria-hidden="true"><i></i></span>');
    RO.render(); clearTimeout(tickAll.t); if (!S.fixed) tickAll.t = setTimeout(function () { S.toast = null; S.cfPrev = null; RO.render(true); }, 9000);
  }
  if (RO.Q.get("toast") === "cf") { S.cfPrev = {}; S.toast = Object.keys(S.cf).length + ' exact lines ticked for Add. <button type="button" data-act="excfundo">Undo</button>'; }
  var act1 = RO.act;
  RO.act = function (a, id, v) {
    var l = id && L(id);
    switch (a) {
      case "exall": tickAll(); return;
      case "excfundo": if (S.cfPrev) S.cf = S.cfPrev; S.cfPrev = null; S.toast = null; clearTimeout(tickAll.t); RO.render(); return;
      case "accept": if (l && isEx(l)) { if (tickable(l)) S.cf[id] = true; RO.render(); return; } break;
      case "excf": if (tickable(l)) S.cf[id] = true; RO.render(); return;
      case "excfoff": delete S.cf[id]; RO.render(); return;
      case "box": if (l && !RO.inFilter(l, S.filter === "all" ? "exact" : S.filter)) S.filter = pillOf(l); break;   /* a tap on a photo box opens the pill that holds its line */
    }
    return act1.apply(this, arguments);
  };
  var acts0 = RO.acts;
  RO.acts = function (l) {
    var h = acts0(l); if (!isEx(l)) return h;
    var key = RO.DESK() && S.keys;
    return (pending(l) ? '<button type="button" class="rs-b pri sm" data-act="excf" data-id="' + l.id + '"' + (blank(l) ? " disabled" : "") + ">" + ic("check", 18) + "<span>Accept</span>" + (key ? '<span class="kbd cap">Y</span>' : "") + "</button>" : '<button type="button" class="rs-b sm" data-act="excfoff" data-id="' + l.id + '"><span>Undo accept</span></button>') + h;
  };
  var row1 = RO.row;
  RO.row = function (l) {
    var h = row1(l); if (!isEx(l)) return h;
    return h.replace("<b>Exact</b>", "<b>" + (pending(l) ? "Exact" : "Ready") + "</b>").replace('data-st="exact">', 'data-st="exact"' + (pending(l) ? "" : ' data-tick="1"') + ">");
  };
  var head1 = RO.head;
  RO.head = function () {
    /* RS-98: the list opens on whichever pill needs the person: Check when any line needs a check, otherwise Exact. Chosen once the receipt is read (not while lines are still arriving, so the tab does not jump under the camera); an explicit ?filter= or a tap on a pill wins, and a line already selected (an older link with ?sel=) opens on the pill that holds it. */
    if (S.filter === "all" && (S.fixed || S.still || S.phase === "end" || S.step === "done")) S.filter = S.sel && L(S.sel) ? pillOf(L(S.sel)) : RO.seenLines().some(function (l) { return pillOf(l) === "check"; }) ? "check" : "exact";
    var t = RO.tally(), n = RO.seenLines().filter(function (l) { return pillOf(l) === "exact"; }).length, f = S.filter === "all" ? "exact" : S.filter, nt = tickables().length, hold = RO.Q.get("hold") === "1";
    var h = head1().replace(/<button[^>]*data-v="all"[\s\S]*?<\/button>/, '<button type="button" class="ro-f' + (hold ? " qu-hold qu-held" : "") + '" role="tab" aria-selected="' + (f === "exact") + '" data-act="filter" data-v="exact" data-hold="1" aria-describedby="qu-hint"><span>Exact</span><b>' + n + "</b></button>");
    if (f === "exact" && (nt || hold)) h = h.replace(/<\/div>$/, '<div class="qu-hintrow" id="qu-hint"><span>' + (hold ? "Keep holding Exact to tick all " + nt : "Hold Exact to tick all " + nt) + '</span><button type="button" class="rs-b sm" data-act="exall">' + ic("check", 16) + "<span>Tick all " + nt + "</span>" + (RO.DESK() && S.keys ? '<span class="kbd cap">A</span>' : "") + "</button></div></div>");
    return h;
  };
  /* the long press itself: hold the Exact pill. Short of it, the pill is an ordinary filter tab. */
  var hd = null;
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".ro-f[data-hold]"); if (!b || e.button) return;
    hd = { b: b, done: false }; b.classList.add("qu-hold");
    hd.t = setTimeout(function () { if (!hd) return; hd.done = true; b.classList.add("qu-held"); if (navigator.vibrate) { try { navigator.vibrate(15); } catch (x) {} } tickAll(); }, pressMs);
  });
  var rel = function () { if (!hd) return; clearTimeout(hd.t); if (!hd.done) hd.b.classList.remove("qu-hold"); setTimeout(function () { hd = null; }, 0); };
  document.addEventListener("pointerup", rel); document.addEventListener("pointercancel", rel); document.addEventListener("pointerleave", rel, true);
  document.addEventListener("contextmenu", function (e) { if (e.target.closest && e.target.closest(".ro-f[data-hold]")) e.preventDefault(); });
  document.addEventListener("click", function (e) { if (hd && hd.done && e.target.closest && e.target.closest(".ro-f[data-hold]")) { e.stopPropagation(); e.preventDefault(); } }, true);
  /* keyboard (desktop): A ticks every exact line, as the long press does; Enter or Space on the focused pill only shows the Exact lines */
  document.addEventListener("keydown", function (e) {
    var t = e.target; if (e.key !== "a" && e.key !== "A" || e.ctrlKey || e.metaKey || e.altKey || (t.closest && t.closest("input,textarea,select")) || !RO.DESK() || S.step !== "view" || S.sheet) return;
    e.preventDefault(); tickAll();
  });

  /* ---- RS-96: a draggable handle between the receipt and the list. Phone and tablet: the receipt picture sits above the list, the handle moves the picture's height. Desktop: the picture column sits beside the lane, the handle moves the lane's width. It stays where it is left, remembered on this device (localStorage, per orientation); nothing re-renders while dragging, so the scroll-tracked photo (RS-89) keeps working and re-centres on the new height. ---- */
  var KEY = function () { return "rs754.split." + (RO.DESK() ? "lane" : "stage"); };
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var root0 = document.documentElement, SPLIT = { stage: 150, lane: 400 };
  function applySplit(kind, px, keep) {
    SPLIT[kind] = Math.round(px); root0.style.setProperty(kind === "lane" ? "--qu-lane" : "--qu-stage", SPLIT[kind] + "px");
    if (kind === "stage") { var st = $(".lv-stage"); S.stageH = st && st.clientHeight ? st.clientHeight : SPLIT.stage; if (S.step === "view") mark(); }
    place(); var h = $(".qu-split"); if (h) h.setAttribute("aria-valuenow", String(SPLIT[kind]));
    if (!keep) store.set(KEY(), String(SPLIT[kind]));
  }
  var rangeOf = function () {
    if (RO.DESK()) return { kind: "lane", min: 320, max: 560, step: 24 };
    var list = $(".ro-list"), st = $(".lv-stage"), cur = st ? st.getBoundingClientRect().height : SPLIT.stage;
    return { kind: "stage", min: 64, max: Math.max(120, Math.round(cur + (list ? list.clientHeight : 200) - 120)), step: 24 };
  };
  var q96 = parseInt(RO.Q.get("split") || "", 10), saved = parseInt(store.get("rs754.split.stage") || "", 10), savedL = parseInt(store.get("rs754.split.lane") || "", 10);
  if (q96) root0.style.setProperty(RO.DESK() ? "--qu-lane" : "--qu-stage", q96 + "px");
  else { if (saved >= 64) root0.style.setProperty("--qu-stage", saved + "px"); if (savedL >= 320) root0.style.setProperty("--qu-lane", savedL + "px"); }
  if (q96) SPLIT[RO.DESK() ? "lane" : "stage"] = q96; else { if (saved >= 64) SPLIT.stage = saved; if (savedL >= 320) SPLIT.lane = savedL; }
  function handleHtml() { var r = rangeOf(); return '<div class="qu-split" role="separator" tabindex="0" aria-orientation="' + (RO.DESK() ? "vertical" : "horizontal") + '" aria-label="Resize: receipt and list" aria-valuemin="' + r.min + '" aria-valuemax="' + r.max + '" aria-valuenow="' + SPLIT[r.kind] + '"><i aria-hidden="true"></i></div>'; }
  var stage0 = RO.stageHtml;
  RO.stageHtml = function () {
    var h = stage0(); if (RO.DESK() || /rl-drop/.test(h)) return h;
    return h + handleHtml();
  };
  /* the desktop handle floats on the lane's left edge, put there after each render */
  function place() {
    if (!RO.DESK()) return; var lane = $(".panel[data-mode=lane]"), h = $(".qu-split"); if (!lane) { if (h) h.remove(); return; }
    if (!h) { var d = document.createElement("div"); d.innerHTML = handleHtml(); h = d.firstChild; document.getElementById("app").appendChild(h); }
    h.style.left = Math.round(lane.getBoundingClientRect().left - 8) + "px";
  }
  var drag = null;
  document.addEventListener("pointerdown", function (e) {
    var h = e.target.closest && e.target.closest(".qu-split"); if (!h || e.button) return; var r = rangeOf();
    drag = { r: r, x: e.clientX, y: e.clientY, v: SPLIT[r.kind] === 150 && r.kind === "stage" && $(".lv-stage") ? Math.round($(".lv-stage").getBoundingClientRect().height) : SPLIT[r.kind] }; h.classList.add("qu-drag"); try { h.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault();
  });
  document.addEventListener("pointermove", function (e) {
    if (!drag) return; var d = drag, v = d.r.kind === "lane" ? d.v - (e.clientX - d.x) : d.v + (e.clientY - d.y);
    applySplit(d.r.kind, Math.max(d.r.min, Math.min(d.r.max, v)), true);
  });
  var endDrag = function () { if (!drag) return; var k = drag.r.kind; drag = null; var h = $(".qu-split"); if (h) h.classList.remove("qu-drag"); store.set(KEY(), String(SPLIT[k])); };
  document.addEventListener("pointerup", endDrag); document.addEventListener("pointercancel", endDrag);
  document.addEventListener("keydown", function (e) {
    var h = e.target.closest && e.target.closest(".qu-split"); if (!h) return; var r = rangeOf(), v = SPLIT[r.kind], a = e.key, nv = null;
    if (r.kind === "stage" && v === 150) { var st = $(".lv-stage"); if (st) v = Math.round(st.getBoundingClientRect().height); }
    if (a === (r.kind === "lane" ? "ArrowLeft" : "ArrowDown")) nv = v + r.step; else if (a === (r.kind === "lane" ? "ArrowRight" : "ArrowUp")) nv = v - r.step;
    else if (a === "PageDown") nv = v + r.step * 4; else if (a === "PageUp") nv = v - r.step * 4; else if (a === "Home") nv = r.min; else if (a === "End") nv = r.max; else if (a === "Enter" || a === " ") { applySplit(r.kind, r.kind === "lane" ? 400 : 150); e.preventDefault(); return; }
    if (nv == null) return; e.preventDefault(); e.stopPropagation(); applySplit(r.kind, Math.max(r.min, Math.min(r.max, nv)));
  }, true);
  window.addEventListener("resize", place);
  new MutationObserver(function () { place(); }).observe(document.getElementById("app"), { childList: true });
  setTimeout(place, 0);

  /* ---- RS-95: the whole receipt. Tap the picture (or its corner button) and it opens full size with the boxes drawn on it; tap a box and it says which line it is; Back (or Escape) returns. A tap on a box in the small picture still finds its row, as before. ---- */
  S.qv = RO.Q.get("view") === "1"; S.vl = RO.Q.get("vline") || null;
  var iconExpand = '<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var stage1 = RO.stageHtml;
  RO.stageHtml = function () {
    var h = stage1(); if (/rl-drop/.test(h) || !/lv-paper/.test(h)) return h;
    return h.replace('<div class="rl-flash"', '<button type="button" class="qu-expand" data-act="quview" aria-label="Open the whole receipt, full size">' + iconExpand + '</button><div class="rl-flash"');
  };
  var lineNo = function (id) { return RO.ORDER.indexOf(id) + 1; };
  function callout(id) {
    var l = L(id); if (!l) return '<span>Tap a box to see which line it is.</span>';
    var x = RO.info(l), o = RO.out(l);
    return "<span><b>Line " + lineNo(id) + " of " + RO.ORDER.length + "</b> · " + esc(l.raw[0]) + " · " + esc(x.label) + (x.k === "top" || x.k === "check" ? " · " + esc(cap(x.name)) : "") + "</span><span class=\"qu-vsub\">" + esc(x.outcome) + '</span><button type="button" class="rs-b sm" data-act="quto" data-id="' + id + '">Show in the list</button>';
  }
  function cap(n) { return n.charAt(0).toUpperCase() + n.slice(1); }
  function viewer() {
    var root = document.getElementById("app");
    if (!S.qv) { var o = root.querySelector(".qu-viewer"); if (o) o.remove(); return; }
    if (root.querySelector(".qu-viewer") || S.step !== "view") return;
    var paper = $(".lv-paper", root); if (!paper) return;
    var c = paper.cloneNode(true); c.style.transform = "none"; c.style.transition = "none"; c.classList.add("lv-boxes");
    $$(".lv-ln", c).forEach(function (e) { e.removeAttribute("data-act"); e.removeAttribute("aria-label"); if (e.dataset.id) { e.setAttribute("role", "button"); e.setAttribute("tabindex", "0"); e.setAttribute("aria-label", "Line " + lineNo(e.dataset.id) + ": " + L(e.dataset.id).raw[0]); } e.classList.toggle("lv-sel", e.dataset.id === S.vl); });
    var el = document.createElement("div"); el.className = "qu-viewer"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "The whole receipt");
    el.innerHTML = '<div class="qu-vbar"><button type="button" class="rl-done" data-act="quclosev">' + RO.ic("x", 18) + 'Back</button><b>The whole receipt</b></div><div class="qu-vscroll"><div class="qu-vpaper" style="height:' + RO.PH + 'px"></div></div><div class="qu-vcall" role="status" aria-live="polite">' + callout(S.vl) + "</div>";
    el.querySelector(".qu-vpaper").appendChild(c); root.appendChild(el);
    var b = el.querySelector(".rl-done"); if (b && !S.vl) try { b.focus({ preventScroll: true }); } catch (x) {}
    var ln = S.vl && $('.lv-ln[data-id="' + S.vl + '"]', c), sc = el.querySelector(".qu-vscroll"); if (ln && sc) sc.scrollTop = Math.max(0, ln.offsetTop - 80);
  }
  function pickLine(id) { S.vl = id; var el = $(".qu-viewer"); if (!el) return; $$(".lv-ln", el).forEach(function (e) { e.classList.toggle("lv-sel", e.dataset.id === id); }); $(".qu-vcall", el).innerHTML = callout(id); }
  var act2 = RO.act;
  RO.act = function (a, id, v) {
    switch (a) {
      case "quview": S.qv = true; S.vl = null; S.sel = S.sel; viewer(); return;
      case "quclosev": S.qv = false; S.vl = null; viewer(); var bt = $(".qu-expand"); if (bt) try { bt.focus({ preventScroll: true }); } catch (x) {} return;
      case "quto": var l = L(id); S.qv = false; S.vl = null; S.filter = pillOf(l); S.sel = id; S.pick = null; viewer(); RO.render(); return;
    }
    return act2.apply(this, arguments);
  };
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest) return;
    var v = t.closest(".qu-viewer");
    if (v) { var ln = t.closest(".lv-ln[data-id]"); if (ln) pickLine(ln.dataset.id); return; }
    var st = t.closest(".rl-stage:not(.rl-drop)");
    if (st && !t.closest(".lv-ln[data-act],.qu-expand,.rl-go,.qu-split") && $(".lv-paper", st) && S.step === "view") { S.qv = true; S.vl = null; viewer(); }
  });
  document.addEventListener("keydown", function (e) {
    if (S.qv && e.key === "Escape") { e.stopPropagation(); RO.act("quclosev"); return; }
    var ln = e.target.closest && e.target.closest(".qu-viewer .lv-ln[data-id]"); if (ln && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickLine(ln.dataset.id); }
  }, true);
  if (S.qv) { setTimeout(viewer, 0); setTimeout(viewer, 400); }

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
  new MutationObserver(function () { sheet(); viewer(); if (settled()) { if (!tracked) follow(); else mark(); } }).observe(root, { childList: true });
  if (S.qs) { setTimeout(sheet, 0); setTimeout(sheet, 400); }
})();
