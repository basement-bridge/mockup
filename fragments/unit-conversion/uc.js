/* Kitchie #800 mockup: switching an item's unit in the Edit item flyout converts the quantity AND the minimum together.
   The page is the item-edit-flyout's Edit form with the same markup, class names (ef-*, ief-child, chd, cbody, rw, row) and tokens. Only the parts new to #800 have new class names:
   .ef-conv (the in-place card under the unit chips: .done, .warn or .ask) and .ef-also (the other rows of one name, combined). Nothing opens over the form (DESIGN.md 6a, in place).
   The logic is convert.js (UCV); the household is sample.js. A state is a link: ?item=ID&to=UNIT&n=NUMBER&go=1 (see index.html). */
(function () {
  "use strict";
  var U = window.UCV, Q = new URLSearchParams(location.search);
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function sv(p, cls, sz) { sz = sz || 20; return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '"' + (cls ? ' class="' + cls + '"' : "") + ' aria-hidden="true" focusable="false">' + p + "</svg>"; }
  var IC = {
    edit: '<path d="M4 20l1.1-4.2L16.3 4.6a2 2 0 0 1 2.8 0l.3.3a2 2 0 0 1 0 2.8L8.2 18.9z"/><path d="M14.4 6.5l3.1 3.1"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5v4.2h4.2"/><path d="M12 7.8V12l2.8 1.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M6 12h12"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.5"/>', ruler: '<path d="M3.5 15.5l12-12 5 5-12 12z"/><path d="M7 12l2.2 2.2M10 9l1.6 1.6M13 6l2.2 2.2"/>',
    chevd: '<path d="M7 10l5 5 5-5"/>', swap: '<path d="M4 9h13l-3-3M20 15H7l3 3"/>', rows: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', pantry: '<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',
    recipes: '<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>', cartnav: '<path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/>'
  };
  var UNITS = ["g", "kg", "mL", "L"].concat(U.COUNT);
  var STEP = { g: 50, mL: 50, kg: 0.5, L: 0.5 };
  var ROWS = window.UC_ITEMS.map(function (r) { return JSON.parse(JSON.stringify(r)); });
  var S = { sel: Q.get("item") || "yog", ask: Q.get("ask") === "two" ? "two" : "one", more: Q.get("more") === "1" };
  var P = null; /* a question waiting for the person: { kind: "ask" | "zero", to, n, nm } */
  var N = null; /* the line after a change: { html, undo (the row as it was) } */
  var saved = false, boot = true; /* no focus is moved while the page loads, so a frame on the notes page never scrolls its parent */

  function cur() { return ROWS.filter(function (r) { return r.id === S.sel; })[0] || ROWS[0]; }
  function same(it) { return ROWS.filter(function (r) { return r.name === it.name; }); }
  function tg(it) { return U.together(same(it)); }
  function qtyText(r) { return r.amount === null ? "" : U.say(r.amount, r.unit); }
  function lvlOf(it) { var t = tg(it); return t ? U.level(t.amount, t.min) : U.level(it.amount, it.min); }
  var BAT = { Plenty: [3, "plenty"], Some: [2, "some"], "Running low": [1, "low"], Out: [0, "out"] };
  function battery(l, w) {
    var a = BAT[l], c = "";
    for (var i = 0; i < 3; i++) c += '<rect x="' + (1 + i * 18) + '" y="1" width="14" height="14" rx="3.2" fill="' + (i < a[0] ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8"/>';
    return '<svg class="bat lv-' + a[1] + '" width="' + w + '" height="' + Math.round(w * 16 / 52) + '" viewBox="0 0 52 16" aria-hidden="true" focusable="false">' + c + "</svg>";
  }
  function stepBtn(d, label, ic, key) { return '<button type="button" data-ef="step" data-d="' + d + '" data-key="' + key + '" aria-label="' + label + '"' + (P ? " disabled" : "") + ">" + sv(ic, "", 20) + "</button>"; }

  /* ---------- the Edit form ---------- */
  function chips(it) {
    var want = P ? P.to : "", cu = it.unit.toLowerCase();
    var list = UNITS.slice(); if (it.unit && list.map(function (c) { return c.toLowerCase(); }).indexOf(cu) < 0) list.push(it.unit);
    var h = list.map(function (u) {
      var on = u === it.unit, pend = u === want;
      return '<button type="button" class="ef-chip' + (on ? " on" : "") + (pend ? " pend" : "") + '" data-ef="unitchip" data-v="' + esc(u) + '" aria-pressed="' + on + '">' + esc(u) + "</button>";
    }).join("");
    h += '<button type="button" class="ef-chip" data-ef="unitchip" data-v="" aria-pressed="' + (it.unit === "") + '">No unit</button>';
    return '<div class="ef-cats more" data-kind="unit" data-open="' + S.more + '"><span class="ef-ct" aria-hidden="true">' + sv(IC.ruler, "", 20) + '</span><div class="ef-cl" role="group" aria-label="Unit suggestions">' + h + '</div><button type="button" class="ef-cx" data-ef="chipsmore" aria-expanded="' + S.more + '" aria-label="' + (S.more ? "Show fewer" : "Show all") + ' units">' + sv(IC.chevd, "", 18) + "</button></div>";
  }
  function line(ic, html) { return '<div class="ef-convh">' + sv(ic, "", 20) + '<p class="ef-convt">' + html + "</p></div>"; }
  function b(t) { return "<b>" + esc(t) + "</b>"; }
  function convCard(it) {
    if (P && P.kind === "zero") {
      var parts = P.zero.map(function (z) { return (z.what === "min" ? "The minimum " : "The quantity ") + b(U.say(z.from, it.unit)) + " is " + U.fmt(z.raw) + " " + P.to + ", and " + P.to + " is kept to " + U.decimals(it.unit, P.to) + " decimals, so it would become " + b("0") + (z.what === "min" ? " (no minimum)." : " (used up)."); });
      return '<div class="ef-conv warn" data-conv="warn" role="alert">' + line(IC.alert, parts.join(" ")) + '<div class="ef-convb"><button type="button" class="btn pri sm" data-ef="convkeep">Keep ' + esc(it.unit) + '</button><button type="button" class="btn sm" data-ef="convgo">Switch to ' + esc(P.to) + " anyway</button></div></div>";
    }
    if (P && P.kind === "ask") {
      var hasQ = it.amount > 0, hasM = it.min > 0, two = S.ask === "two" && hasQ && hasM, to = P.to, ui = '<span class="ef-unit">' + esc(to) + "</span>";
      var inp = function (f, v, label, ph) { return '<div class="ef-row"><input class="ef-in ef-convin" data-f="' + f + '" inputmode="decimal" value="' + esc(v || "") + '" placeholder="' + ph + '" aria-label="' + esc(label) + '" autocomplete="off">' + ui + "</div>"; };
      var q = "There is no fixed rate between " + b(it.unit) + " and " + b(to) + ". ", body, note = "";
      if (two) {
        body = line(IC.ruler, q + "Tell Kitchie both numbers.") + '<div class="ef-conv2"><label class="ef-l">Quantity: ' + esc(qtyText(it)) + " is</label>" + inp("convn", P.n, "How many " + to + " is your " + qtyText(it), "e.g. 1.6") + '<label class="ef-l">Minimum: ' + esc(U.say(it.min, it.unit)) + " is</label>" + inp("convm", P.nm, "How many " + to + " is the minimum " + U.say(it.min, it.unit), "e.g. 1.6") + "</div>";
      } else if (hasQ) {
        body = line(IC.ruler, q + "How many " + b(to) + " is your " + b(qtyText(it)) + "?") + inp("convn", P.n, "How many " + to + " is your " + qtyText(it), "e.g. 1.6");
        if (hasM) note = '<p class="ef-note" id="ef-convnote" aria-live="polite">' + minFollows(it) + "</p>";
      } else {
        body = line(IC.ruler, q + "Your quantity is 0. How many " + b(to) + " is the minimum of " + b(U.say(it.min, it.unit)) + "?") + inp("convm", P.nm, "How many " + to + " is the minimum", "e.g. 1.6");
      }
      return '<div class="ef-conv ask" data-conv="ask" role="group" aria-label="Convert to ' + esc(to) + '">' + body + note + '<div class="ef-convb"><button type="button" class="btn pri sm" data-ef="convok"' + (askReady(it) ? "" : " disabled") + '>Convert</button><button type="button" class="btn sm" data-ef="convcancel">Keep ' + esc(it.unit) + "</button></div></div>";
    }
    if (N) return '<div class="ef-conv done" data-conv="done" role="status">' + line(IC.tick, N.html) + (N.undo ? '<button type="button" class="ef-clear" data-ef="convundo">Undo</button>' : "") + "</div>";
    return "";
  }
  function minFollows(it) {
    var n = parseFloat(String(P.n).replace(",", "."));
    return n > 0 ? "Minimum " + b(U.say(it.min, it.unit)) + " becomes " + b(U.say(Math.round(it.min * (n / it.amount) * 1000) / 1000, P.to)) + " at the same rate." : "Minimum " + b(U.say(it.min, it.unit)) + " follows at the same rate.";
  }
  function askReady(it) {
    var n = parseFloat(String(P.n).replace(",", ".")), m = parseFloat(String(P.nm).replace(",", ".")), hasQ = it.amount > 0, hasM = it.min > 0, two = S.ask === "two" && hasQ && hasM;
    if (two) return n > 0 && m > 0; if (hasQ) return n > 0; return m > 0;
  }
  function alsoBlock(it) {
    var t = tg(it); if (!t) return "";
    var others = t.rows.filter(function (r) { return r !== it; });
    var o = others.map(function (r) { return b(qtyText(r)) + " in " + esc(r.area) + (r.min ? " (minimum " + esc(U.say(r.min, r.unit)) + ")" : ""); }).join(", ");
    return '<div class="ef-also" data-conv="also">' + sv(IC.rows, "", 20) + '<p class="ef-convt">Also held: ' + o + ". Together " + b(U.say(t.amount, t.unit)) + " (shown in the smaller unit). The level uses the total and the larger minimum, " + b(U.say(t.min, t.unit)) + ".</p></div>";
  }
  function qtySec(it) {
    var pend = !!P;
    return '<div class="ef-w' + (pend ? " asking" : "") + '" id="ef-s-qty" data-field="qty"><div class="ef-lh"><span class="ef-l">Quantity</span></div><div class="ef-row"><div class="ef-step" role="group" aria-label="Quantity">' + stepBtn(-1, "Less", IC.minus, "amount") +
      '<input class="ef-num" data-f="amount" inputmode="decimal" value="' + esc(it.amount === null ? "" : U.fmt(it.amount)) + '" aria-label="Quantity" autocomplete="off"' + (pend ? " disabled" : "") + ">" + stepBtn(1, "More", IC.plus, "amount") +
      '</div><input class="ef-in ef-unitin" data-f="unit" value="' + esc(it.unit) + '" placeholder="Unit" maxlength="20" autocomplete="off" autocapitalize="none" enterkeyhint="done" aria-label="Unit"></div>' + chips(it) + convCard(it) + alsoBlock(it) + "</div>";
  }
  function levelSec(it) {
    var lv = lvlOf(it), t = tg(it);
    return '<div class="ef-w" id="ef-s-level" data-field="level"><div class="ef-lh"><span class="ef-l">Level</span><p class="ef-lvm" id="ef-lvm"><span class="ef-src" title="' + (t ? "Worked out from every row of " + esc(it.name) + " and the larger minimum." : "Worked out from the amount and the minimum.") + ' Pick one to set it yourself.">Automatic</span></p></div><div class="opts lvpick" role="radiogroup" aria-label="Level">' +
      ["Plenty", "Some", "Running low", "Out"].map(function (l) { return '<button type="button" class="opt' + (l === lv ? " on" : "") + '" role="radio" aria-checked="' + (l === lv) + '" data-ef="lvl" data-v="' + l + '" tabindex="' + (l === lv ? 0 : -1) + '">' + battery(l, 45) + '<span class="sr-only">' + l + "</span></button>"; }).join("") + "</div></div>";
  }
  function minSec(it) {
    var pend = !!P;
    return '<div class="ef-w" id="ef-s-min" data-field="min"><span class="ef-l">Minimum stock</span><div class="ef-row"><div class="ef-step" role="group" aria-label="Minimum stock">' + stepBtn(-1, "Lower the minimum", IC.minus, "min") +
      '<input class="ef-num" data-f="min" inputmode="decimal" value="' + esc(it.min ? U.fmt(it.min) : "") + '" placeholder="None" aria-label="Minimum stock" autocomplete="off"' + (pend ? " disabled" : "") + ">" + stepBtn(1, "Raise the minimum", IC.plus, "min") + "</div>" +
      (it.unit ? '<span class="ef-unit" id="ef-minunit">' + esc(it.unit) + "</span>" : "") + (it.min ? '<button type="button" class="ef-clear" data-ef="clearmin"' + (pend ? " disabled" : "") + ">Clear</button>" : "") + '</div><p class="ef-note">' + (it.min ? "Running low is at or under this. Plenty is over twice it." : "No minimum: the level is Plenty until it is gone. You can set Some or Running low yourself.") + "</p></div>";
  }
  function form(it) {
    return '<div class="ef"><section class="ef-sec"><h3 class="ef-h">Item</h3><div class="ef-w" id="ef-s-name" data-field="name"><div class="ef-nrow"><button type="button" class="ef-emo" aria-label="' + (it.emoji ? "Change the emoji" : "Add an emoji") + '" title="' + (it.emoji ? "Change the emoji" : "Add an emoji") + '">' + (it.emoji ? esc(it.emoji) : sv(IC.plus, "", 22)) + '</button><label class="ef-big"><span class="sr-only">Name</span><input data-f="name" value="' + esc(it.name) + '" maxlength="60" autocomplete="off" placeholder="What is it?" readonly></label></div></div></section>' +
      '<section class="ef-sec"><h3 class="ef-h">Amount</h3>' + qtySec(it) + levelSec(it) + minSec(it) + "</section></div>";
  }

  /* ---------- the page around it (the Pantry list, the rail or tab bar, the item flyout's header): the same markup as item-edit-flyout ---------- */
  function listHtml() {
    var order = ["Fridge", "Pantry", "Cupboard"], h = "";
    order.forEach(function (a) {
      var rs = ROWS.filter(function (r) { return r.area === a; }); if (!rs.length) return;
      h += '<div class="grp"><h2>' + a + '</h2><span class="kbd keep">' + rs.length + '</span></div><ul class="rows">' + rs.map(function (r) {
        var on = r.id === S.sel;
        return '<li class="rw' + (on ? " sel" : "") + '" data-id="' + r.id + '"><button type="button" class="row" data-ief="open" data-id="' + r.id + '"' + (on ? ' aria-current="true"' : "") + '><div class="rmain"><div class="nm" title="' + esc(r.name) + '">' + (r.emoji ? r.emoji + " " : "") + esc(r.name) + '</div><div class="mt">' + esc(r.area) + (r.amount ? " · " + esc(qtyText(r)) : " · Out") + " · " + esc(r.spot) + "</div></div></button></li>";
      }).join("") + "</ul>";
    });
    return h;
  }
  function shell(it) {
    var nav = function (ic, t, on) { return '<span class="nv' + (on ? " on" : "") + '">' + sv(ic, "", 24) + "<span>" + t + "</span></span>"; };
    return '<div class="app" id="ief-app" data-open="1" data-hint="show" data-child="edit">' +
      '<nav class="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div>' + nav(IC.home, "Home") + nav(IC.pantry, "Pantry", 1) + nav(IC.recipes, "Recipes") + nav(IC.cartnav, "Shopping") + '<div class="me"><span class="av" aria-hidden="true">S</span></div></nav>' +
      '<main class="main"><div class="col"><div class="hd"><h1 class="sr-only">Pantry</h1><span class="count" id="uc-count">' + ROWS.length + ' items</span><button type="button" class="btn pri" tabindex="-1">+ Add</button></div><div id="uc-list">' + listHtml() + "</div></div></main>" +
      '<nav class="tabbar" aria-label="Main">' + nav(IC.home, "Home") + nav(IC.pantry, "Pantry", 1) + nav(IC.recipes, "Recipes") + nav(IC.cartnav, "Shopping") + "</nav>" +
      '<div class="dim" id="ief-dim"></div>' +
      '<aside class="panel" id="ief-panel" role="dialog" aria-modal="true" aria-label="' + esc(it.name) + '" data-mode="item"><span class="grab" aria-hidden="true"></span><div class="top shead" id="uc-head"><span class="ph" aria-hidden="true">' + (it.emoji ? esc(it.emoji) : sv(IC.plus, "", 22)) + '</span><div class="sid"><h2 class="nm2">' + esc(it.name) + '</h2><span class="shq">' + esc(qtyText(it)) + '</span><span class="shw"><b>' + esc(it.area) + "</b> · " + esc(it.spot) + "</span></div></div></aside>" +
      '<aside class="ief-child" id="ief-child" role="dialog" aria-modal="true" aria-label="Edit item" data-kind="edit"><span class="grab" aria-hidden="true"></span><div class="chd"><div id="ief-ctitle"><h2>Edit item</h2><p class="trunc" id="uc-ctitle" title="' + esc(it.name) + '">' + esc(it.name) + '</p></div><span class="saved" id="ief-saved" role="status" aria-live="polite"></span><button type="button" class="x ib" aria-label="Close edit" title="Close edit">' + sv(IC.x, "", 20) + '</button></div><div class="cbody" id="ief-cbody"></div></aside></div>';
  }

  var root = $("#root");
  function paint(focus) {
    var it = cur(), body = $("#ief-cbody");
    if (!body) { root.innerHTML = shell(it); body = $("#ief-cbody"); }
    body.innerHTML = form(it);
    $("#uc-list").innerHTML = listHtml();
    var t = $("#uc-ctitle"); if (t) { t.textContent = it.name; t.title = it.name; }
    var s = $("#ief-saved"); if (s) s.innerHTML = saved ? sv(IC.tick, "", 14) + "Saved" : "";
    var h = $("#uc-head"); if (h) { h.querySelector(".nm2").textContent = it.name; h.querySelector(".shq").textContent = qtyText(it); h.querySelector(".ph").innerHTML = it.emoji ? esc(it.emoji) : sv(IC.plus, "", 22); }
    document.documentElement.dataset.ucState = P ? P.kind : N ? "done" : "rest";
    if (focus && !boot) { var f = $(focus); if (f) f.focus(); }
  }
  function snap(it) { return JSON.parse(JSON.stringify(it)); }
  function parse(v) { var n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; }

  /* ---------- the switch: ONE operation, quantity and minimum together (Option A; the build's changeItemUnit) ---------- */
  function apply(it, to, na, nm, how) {
    var before = snap(it), from = it.unit, parts = [];
    if (it.amount !== null) parts.push((how === "ask" ? "Your count: " : "Converted ") + b(U.say(before.amount, from)) + (how === "ask" ? " is " : " to ") + b(U.say(na, to)) + ".");
    if (before.min) parts.push("Minimum " + b(U.say(before.min, from)) + (nm ? (how === "ask" ? " is " : " to ") + b(U.say(nm, to)) : " is now " + b("none")) + ".");
    it.amount = na; it.min = nm; it.unit = to; N = { html: parts.join(" "), undo: before }; P = null; saved = true;
  }
  function pick(raw) {
    var it = cur(), from = it.unit, to = U.match(raw); if (to === from) return;
    P = null; N = null;
    if (!from || !to) { var before = snap(it); it.unit = to; N = { html: (to ? "Unit is now " + b(to) : "Unit removed") + ". There was no unit to convert from or to, so the number stays " + b(it.amount === null ? "as it is" : U.fmt(it.amount)) + ".", undo: before }; saved = true; return paint('[data-ef=unitchip][data-v="' + to + '"]'); }
    if (U.factor(from, to) !== null) {
      var na = it.amount === null ? null : U.convert(it.amount, from, to), nm = it.min ? U.convert(it.min, from, to) : 0, zero = [];
      if (it.amount > 0 && na === 0) zero.push({ what: "amount", from: it.amount, raw: it.amount * U.factor(from, to) });
      if (it.min > 0 && nm === 0) zero.push({ what: "min", from: it.min, raw: it.min * U.factor(from, to) });
      if (zero.length) { P = { kind: "zero", to: to, zero: zero, na: na, nm: nm }; return paint("[data-ef=convkeep]"); }
      apply(it, to, na, nm, "known"); return paint('[data-ef=unitchip][data-v="' + to + '"]');
    }
    if (it.amount === null || (!it.amount && !it.min)) { var b0 = snap(it); it.unit = to; N = { html: "Unit is now " + b(to) + ". There is no quantity or minimum to convert.", undo: b0 }; saved = true; return paint('[data-ef=unitchip][data-v="' + to + '"]'); }
    P = { kind: "ask", to: to, n: "", nm: "" }; paint("[data-f=" + (it.amount > 0 ? "convn" : "convm") + "]");
  }
  function confirmAsk() {
    var it = cur(), hasQ = it.amount > 0, hasM = it.min > 0, two = S.ask === "two" && hasQ && hasM, n = parse(P.n), m = parse(P.nm), to = P.to, na, nm;
    if (two) { na = U.convert(n, to, to); nm = m; }
    else if (hasQ) { na = n; nm = hasM ? Math.round(it.min * (n / it.amount) * 1000) / 1000 : 0; }
    else { na = 0; nm = m; }
    apply(it, to, Math.round(na * 1000) / 1000, nm, "ask"); paint('[data-ef=unitchip][data-v="' + to + '"]');
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-ef],[data-ief]"); if (!el) return;
    var it = cur(), k = el.dataset.ef;
    if (el.dataset.ief === "open") { S.sel = el.dataset.id; P = null; N = null; saved = false; return paint(); }
    if (k === "unitchip") return pick(el.dataset.v);
    if (k === "chipsmore") { S.more = !S.more; return paint("[data-ef=chipsmore]"); }
    if (k === "convundo") { var u = N.undo; Object.keys(u).forEach(function (x) { it[x] = u[x]; }); N = null; saved = true; return paint('[data-ef=unitchip][data-v="' + it.unit + '"]'); }
    if (k === "convkeep" || k === "convcancel") { var old = it.unit; P = null; return paint('[data-ef=unitchip][data-v="' + old + '"]'); }
    if (k === "convgo") { var p = P; apply(it, p.to, p.na, p.nm, "known"); return paint('[data-ef=unitchip][data-v="' + p.to + '"]'); }
    if (k === "convok") { if (askReady(it)) confirmAsk(); return; }
    if (k === "clearmin") { it.min = 0; N = null; saved = true; return paint("[data-f=min]"); }
    if (k === "step") {
      var key = el.dataset.key, d = +el.dataset.d, st = U.rule(it.unit) ? (STEP[it.unit] || 1) : 1, c = key === "min" ? it.min || 0 : it.amount || 0;
      it[key] = Math.max(0, Math.round((c + d * st) * 1000) / 1000); N = null; saved = true; return paint();
    }
    if (k === "lvl") return;
  });
  document.addEventListener("input", function (e) {
    var f = e.target.dataset && e.target.dataset.f; if (!P || P.kind !== "ask") return;
    if (f === "convn" || f === "convm") {
      if (f === "convn") P.n = e.target.value; else P.nm = e.target.value;
      var it = cur(), note = $("#ef-convnote"); if (note) note.innerHTML = minFollows(it);
      var ok = $("[data-ef=convok]"); if (ok) ok.disabled = !askReady(it);
    }
  });
  document.addEventListener("change", function (e) {
    var f = e.target.dataset && e.target.dataset.f, it = cur(); if (!f) return;
    if (f === "unit") return pick(e.target.value);
    if (f === "amount" || f === "min") { var v = parse(e.target.value); it[f] = f === "min" ? v || 0 : v; N = null; saved = true; paint(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var f = e.target.dataset && e.target.dataset.f;
    if (f === "convn" || f === "convm") { e.preventDefault(); var it = cur(); if (askReady(it)) confirmAsk(); }
    else if (f === "unit") { e.preventDefault(); pick(e.target.value); }
  });

  /* a state is a link: to=kg switches the unit at load; n= types the count; m= types the minimum (two-number form); go=1 presses the button on the card (Convert, or Switch anyway) */
  paint();
  if (Q.get("to")) {
    pick(Q.get("to"));
    if (P && P.kind === "ask") { if (Q.get("n")) { P.n = Q.get("n"); } if (Q.get("m")) { P.nm = Q.get("m"); } paint(); var inp = $("[data-f=convn]") || $("[data-f=convm]"); if (inp && Q.get("go") === "1" && askReady(cur())) confirmAsk(); }
    else if (P && P.kind === "zero" && Q.get("go") === "1") { var p = P; apply(cur(), p.to, p.na, p.nm, "known"); paint(); }
  }
  boot = false;
})();
