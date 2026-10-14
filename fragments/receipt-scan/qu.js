/* Receipt scan, quantity with a unit (Kitchie issue 754): how a review row shows a scanned quantity that carries a unit, and how the person corrects it.
   Loaded after ro-core.js and ro-run.js; it wraps the row and the actions and changes nothing else. The page names its option with <body data-opt="a|b"> (qu-a.html, qu-b.html).
   Option A: the amount is plain text in the row (the outcome line already says "Updates existing (1 L to 3 L)"; a New item says "New item, 2 L"); when the row is opened the figure is the shopping list's box with its unit pill.
   Option B: the amount is a quiet pill in the row; tapping it opens the shopping list's quantity sheet (bottom sheet on a phone, inline in the lane on a desktop). The opened row's stepper is as built today.
   Both: drawn ONLY for a line whose unit was read from its name (rd "unit"). A number-only line, a line with no number, a size and a weight line keep today's row exactly (Empty is absent).
   Mockup only. WORDS, readWords and the add-up check below are stand-ins for the sample data: the build uses the shopping list's one reader (quantity-words.ts, quantity.js) and KitchieQuantity (RS-74). */
(function () {
  "use strict";
  var RO = window.RO, S = RO.S, D = RO.D, ic = RO.ic, esc = RO.esc, fmt = RO.fmt, qOf = RO.qOf, $ = RO.$, OPT = (document.body.dataset.opt || "a");
  var WORDS = { g: "g gm gms gr grm gram grams gramme grammes", kg: "kg kgs kilo kilos kilogram kilograms kilogramme kilogrammes", mL: "ml mls millilitre millilitres milliliter milliliters", L: "l lt ltr ltrs litre litres liter liters letter letters" };
  var UNIT_OF = {}; Object.keys(WORDS).forEach(function (u) { WORDS[u].split(" ").forEach(function (w) { UNIT_OF[w] = u; }); });
  var PILL = { g: 1, kg: 1, mL: 1, L: 1 };
  function readWords(t) { var m = /^(\d{1,4}(?:[.,]\d{1,3})?)\s*([a-z]*)$/i.exec(String(t).trim()); if (!m) return null; var n = parseFloat(m[1].replace(",", ".")); if (!m[2]) return { n: n, u: null }; var u = UNIT_OF[m[2].toLowerCase()]; return u ? { n: n, u: u } : null; }
  var fam = function (u) { return u === "g" || u === "kg" ? "w" : u === "mL" || u === "L" ? "v" : ""; };
  /* does this amount add to the item's amount (same unit family; a bare count takes a counted item's unit)? Stand-in for KitchieQuantity.addInto */
  function fits(q, u, pu) { if (u === pu) return true; if (!u) return !fam(pu); return !!fam(u) && fam(u) === fam(pu); }
  var P = RO.P, L = RO.L;
  var carries = function (l) { return l.rd === "unit" && l.st !== "left"; };
  var nameOf = function (l) { return RO.info(l).name; };

  /* the sheet's own draft, until Save (Shopping: Save is the only button; a tap outside cancels) */
  var draft = null;
  if (RO.Q.get("nounit")) { var lu = L(RO.Q.get("nounit")); if (lu) lu.u = ""; }   /* a state for the page: the unit already taken off */
  if (RO.Q.get("qs")) { S.qs = RO.Q.get("qs"); }
  function openDraft(id) { var l = L(id); draft = { id: id, t: String(Math.round(qOf(l) * 1000) / 1000), u: l.u }; }

  function box(id, id2, t, u) {
    var pill = u && PILL[u] ? '<button type="button" class="wunit" id="' + id2 + 'u" data-act="quclr" data-id="' + id + '" aria-label="Unit ' + esc(u) + '. Remove the unit and keep your own words">' + esc(u) + '<span class="wx" aria-hidden="true">×</span></button>' : u ? '<span class="wunit">' + esc(u) + "</span>" : "";
    return '<div class="wantbox' + (u ? " hasunit" : "") + '"><input class="rs-in field" id="' + id2 + '" data-qu="' + id + '" value="' + esc(t) + '" inputmode="decimal" autocomplete="off" aria-label="How much">' + pill + "</div>";
  }
  var after = function (h, marker, add) { var i = h.indexOf(marker); return i < 0 ? h : h.slice(0, i + marker.length) + add + h.slice(i + marker.length); };

  var row0 = RO.row;
  RO.row = function (l) {
    var h = row0(l), o = RO.out(l), id = l.id, p = o.m && P(o.m);
    if (!carries(l) || o.k === "ignored") return h;
    var q = qOf(l);
    /* the outcome line: an amount the Pantry item cannot take is said plainly, as the screen already says for any amount (RS-74) */
    if ((o.k === "top" || o.k === "check") && p && !fits(q, l.u, p.u)) h = h.replace(/(<span class="ro-out"[^>]*>)[^<]*/, "$1Kept as a separate item: " + esc(fmt(q, l.u)) + " cannot be added to " + esc(fmt(p.q, p.u)));
    if (OPT === "a" && o.k === "new") h = h.replace(/(<span class="ro-out" data-k="new">)New item/, "$1New item, " + esc(fmt(q, l.u)));
    if (OPT === "b" && l.u) {
      h = h.replace(/(<span class="ro-st">[\s\S]*?)(<\/span><\/div>)/, '$1<button type="button" class="ro-amt" data-act="quo" data-id="' + id + '" aria-haspopup="dialog" aria-expanded="' + (S.qs === id) + '" aria-label="Amount ' + esc(fmt(q, l.u)) + ". Change it\"><span>" + esc(fmt(q, l.u)) + "</span></button>$2");
      if (S.qs === id && RO.DESK()) { if (!draft || draft.id !== id) openDraft(id); h = h.replace(/<\/li>$/, '<div class="qu-inline" role="group" aria-label="How much ' + esc(nameOf(l)) + '"><h3>How much ' + esc(nameOf(l)) + "?</h3>" + sheetBody(l) + "</div></li>"); }
    }
    if (OPT === "a" && S.sel === id) {
      if (!l.u) h = h.replace(/(<div class="rs-qrow">[\s\S]*?<\/div>)/, '$1<p class="qu-hint">' + hintNoUnit(l, q, p) + "</p>");
      h = h.replace(/<output>[\s\S]*?<\/output>/, box(id, "qb-" + id, String(Math.round(q * 1000) / 1000), l.u));
    }
    return h;
  };
  function hintNoUnit(l, q, p) { return "No unit: counted as " + esc(fmt(q, "")) + "." + (p && !fits(q, "", p.u) ? " That cannot be added to " + esc(fmt(p.q, p.u)) + ", so it would be kept as a separate item." : "") + " Type a unit after the number (for example 2 L) to read it again."; }
  function sheetBody(l) {
    var d = draft, p = P(RO.out(l).m || ""), h = box(l.id, "qs-" + l.id, d.t, d.u);
    h += '<p class="qu-hint">' + (d.u ? "The unit is read from the receipt line. The × takes it off and keeps your own words." : "No unit. Type one after the number, for example 2 L, and it is read when you leave the box.") + "</p>";
    return h + '<button type="button" class="rs-b pri" data-act="qusave" data-id="' + l.id + '">Save</button>';
  }

  /* actions */
  var act0 = RO.act;
  RO.act = function (a, id, v) {
    var l = id && L(id);
    switch (a) {
      case "quo": S.qs = S.qs === id ? null : id; draft = null; if (S.qs) openDraft(id); S.sel = null; S.pick = null; RO.render(); return;
      case "quclose": S.qs = null; draft = null; RO.render(); return;
      case "qusave": if (draft) { var r = readWords(draft.t); if (r) { S.q[id] = r.n; l.u = r.u || draft.u; } } S.qs = null; draft = null; RO.render(); return;
      case "quclr": if (S.qs && draft && draft.id === id) draft.u = ""; else l.u = ""; RO.render(); return;
    }
    return act0.apply(this, arguments);
  };
  /* reading the box when it is left: a number, or a number and a unit word */
  function takeBox(t) {
    var id = t.dataset.qu, l = L(id), r = readWords(t.value);
    if (!r) return false;
    if (S.qs && draft && draft.id === id) { draft.t = String(r.n); if (r.u) draft.u = r.u; } else { S.q[id] = r.n; if (r.u) l.u = r.u; }
    return true;
  }
  document.addEventListener("change", function (e) { var t = e.target; if (t.matches && t.matches("input[data-qu]")) { if (t.id.indexOf("qs-") === 0 && !draft) return; takeBox(t); setTimeout(RO.render, 0); } });
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (e.key === "Enter" && t.matches && t.matches("input[data-qu]")) { e.preventDefault(); takeBox(t); if (S.qs && draft) RO.act("qusave", draft.id); else RO.render(); }
    else if (e.key === "Escape" && S.qs) { e.stopPropagation(); RO.act("quclose"); }
  }, true);

  /* the phone's sheet: appended after each render, over a dim (the same .dim and .panel as the other sheets) */
  var root = document.getElementById("app");
  function sheet() {
    if (OPT !== "b" || !S.qs || RO.DESK() || !root || root.querySelector(".qu-sheet")) return;
    var l = L(S.qs); if (!l) return; if (!draft || draft.id !== S.qs) openDraft(S.qs);
    var el = document.createElement("div");
    el.innerHTML = '<div class="dim" data-act="quclose"></div><div class="panel qu-sheet" data-mode="qty" role="dialog" aria-label="How much ' + esc(nameOf(l)) + '"><button type="button" class="grab" data-act="quclose" aria-label="Close"></button><h2>How much ' + esc(nameOf(l)) + "?</h2>" + sheetBody(l) + "</div>";
    while (el.firstChild) root.appendChild(el.firstChild);
  }
  new MutationObserver(function () { sheet(); }).observe(root, { childList: true });
  if (S.qs) { var fire = function () { sheet(); }; setTimeout(fire, 0); setTimeout(fire, 400); }
})();
