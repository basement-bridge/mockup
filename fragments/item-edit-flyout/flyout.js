/* Item edit flyout: shared core. No size rules in this file (DESIGN.md section 7): everything that differs by screen size lives in phone.* , tablet.css and desktop*.* .
   Holds the sample items, the item flyout's header, tiles and actions, the nested child frame (Edit, History), Add mode, the history log of edits made here, the toast and the URL state.
   The form (form.js) and the History view (history.js) are fetched on first use, not on page load (DESIGN.md section 6). Exactly one host file is fetched: phone.js below 1024px, desktop.js from 1024px.
   Sample data only, nothing is stored. Today is fixed at Sat 10 Oct 2026 so the dates in the sample never drift. */
(function () {
"use strict";
var Q = new URLSearchParams(location.search);
var IEF = window.IEF = { host: null, S: null, wide: matchMedia("(min-width:1024px)").matches };
var $ = IEF.$ = function (s, r) { return (r || document).querySelector(s); };
var esc = IEF.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };

/* ---------- dates (fixed today) ---------- */
var DAY = 864e5, TODAY = new Date(2026, 9, 10), WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function p2(n) { return (n < 10 ? "0" : "") + n; }
IEF.isoIn = function (n) { var d = new Date(TODAY.getTime() + n * DAY); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); };
IEF.daysTo = function (s) { if (!s) return null; var p = s.split("-"); return Math.round((new Date(+p[0], +p[1] - 1, +p[2]) - TODAY) / DAY); };
IEF.dayName = function (s) { var p = s.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]); return WD[d.getDay()] + " " + d.getDate() + " " + MO[d.getMonth()]; };
IEF.rel = function (n) { return n === null ? "" : n < 0 ? (-n) + (n === -1 ? " day" : " days") + " ago" : n === 0 ? "Today" : n === 1 ? "Tomorrow" : "in " + n + " days"; };
IEF.todayIso = IEF.isoIn(0);

/* ---------- items ---------- */
function mk(id, emoji, name, area, spot, cat, amount, unit, text, useIn, min, level, x) {
  var it = { id: id, emoji: emoji, name: name, area: area, spot: spot, cat: cat, amount: amount, unit: unit, text: text || "", useby: useIn === null ? "" : IEF.isoIn(useIn), min: min === null ? "" : String(min), level: level || "Plenty", lvSet: null, list: null };
  if (x) for (var k in x) it[k] = x[k];
  return it;
}
var ITEMS = IEF.items = [
  mk("butter", "🧈", "butter", "Fridge", "Door", "Dairy and eggs", 250, "g", "", null, null, "Plenty"),
  mk("carrots", "🥕", "carrots", "Fridge", "Crisper", "Vegetables", 1, "bag", "", null, null),
  mk("cheddar", "", "cheddar", "Fridge", "Top shelf", "Dairy and eggs", 200, "g", "", 12, 250),
  mk("eggs", "🥚", "eggs", "Fridge", "Door", "Dairy and eggs", 12, "", "", 6, 4),
  mk("yog", "", "greek yoghurt", "Fridge", "Top shelf", "Dairy and eggs", 500, "g", "", 7, 250, "Some"),
  mk("milk", "🥛", "milk", "Fridge", "Door", "Dairy and eggs", 1, "L", "", 0, null, "Plenty", { list: "2 L", lvSet: "Running low" }),
  mk("paneer", "", "paneer", "Fridge", "Top shelf", "Dairy and eggs", 50, "g", "", 3, null, "Plenty", { lvSet: "Running low" }),
  mk("spinach", "🥬", "spinach", "Fridge", "Crisper", "Vegetables", null, "", "a big handful", 1, null, "Some"),
  mk("rice", "🍚", "Basmati rice", "Pantry", "Bottom shelf", "Dry goods", 5, "kg", "", null, null),
  mk("tom", "🥫", "Chopped tomatoes", "Pantry", "Top shelf", "Cans", 4, "tin", "", null, 4),
  mk("onion", "🧅", "Onions", "Pantry", "Baskets", "Vegetables", 6, "", "", null, null),
  mk("garam", "", "Garam masala", "Pantry", "Spice rack", "Seasoning", 1, "jar", "", null, null),
  mk("peas", "", "peas", "Freezer", "Drawer 2", "Vegetables", 1, "kg", "", null, null),
  mk("ice", "🍨", "ice cream", "Freezer", "Door", "Dessert", 1, "box", "", null, null)
];
IEF.AREAS = ["Fridge", "Pantry", "Freezer", "Unplaced"];
IEF.SPOTS = { Fridge: ["Door", "Top shelf", "Crisper", "Bottom shelf"], Pantry: ["Top shelf", "Bottom shelf", "Baskets", "Spice rack"], Freezer: ["Drawer 1", "Drawer 2", "Door"], Unplaced: [] };
IEF.COUNT = ["", "pack", "tin", "jar", "bottle", "bag", "box", "carton", "bunch", "roll"];
/* the unit quick-picks: weight and volume, the count units, then any unit a household item already uses (typed once, offered after) */
IEF.units = function () { var u = ["g", "kg", "mL", "L"].concat(IEF.COUNT.filter(Boolean)); ITEMS.forEach(function (i) { if (i.unit && u.indexOf(i.unit) < 0) u.push(i.unit); }); return u; };
IEF.STEP = { g: 50, mL: 50, kg: 0.5, L: 0.5 };
IEF.cats = function () { var c = ["Dairy and eggs", "Vegetables", "Dry goods", "Cans", "Seasoning", "Dessert", "Meat and fish", "Bakery"]; ITEMS.forEach(function (i) { if (i.cat && c.indexOf(i.cat) < 0) c.push(i.cat); }); return c; };
/* weighed or measured: g, kg, mL, L. Any other unit, including one the person typed ("punnet"), counts in whole steps like the count units. */
IEF.WEIGHED = ["g", "kg", "mL", "L"];
var counted = IEF.counted = function (it) { return it.amount !== null && IEF.WEIGHED.indexOf(it.unit) < 0; };
/* Level (owner's rules of 8 Oct 2026, item-sheet.md; confirmed and refined by voice 11 Oct 2026, decisions 94 to 101 over 82 to 86).
   AUTOMATIC: any item with a number (counted or weighed) has its level worked out.
     WITH a minimum (decision 84, confirmed): more than twice the minimum is Plenty; more than the minimum and up to twice it is Some; at or under it but above 0 is Running low; 0 is Out.
     With NO minimum (decision 95): Plenty while the amount is above 0, Out at 0, no bands in between. The person can hand-set Some or Running low.
   HAND-SET: the person can always pick the level. The pick (lvSet) wins over the rules and looks the same as a calculated level everywhere. It is cleared only when the quantity next INCREASES (a restock); a decrease never clears it (decision 96, supersedes 85).
   NO NUMBER (a worded quantity, or none): there are no rules to apply; the level is the stored label the person picked (it.level). */
var minOf = function (it) { return parseFloat(it.min) || 0; };
IEF.auto = function (it) { return it.amount !== null; };
IEF.autoLevel = function (it) {
  if (it.amount === 0) return "Out";
  var n = it.amount, m = minOf(it); if (!(m > 0)) return "Plenty";
  return n <= m ? "Running low" : n <= 2 * m ? "Some" : "Plenty";
};
var level = IEF.level = function (it) {
  if (it.amount === 0) return "Out";
  if (IEF.auto(it)) return it.lvSet || IEF.autoLevel(it);
  return it.level;
};
/* "set" = the person's pick is showing; "auto" = the rules are; "" = no rules apply, so there is no cue to draw */
IEF.lvSource = function (it) { return !IEF.auto(it) ? "" : it.lvSet && it.amount !== 0 ? "set" : "auto"; };
/* the quantity changed from `was` (a number or null): only an INCREASE (stock added) hands the level back to the rules. A decrease, a unit change or a minimum change keeps the pick. */
IEF.qtyChanged = function (it, was) { if (it.amount !== null && was !== null && was !== undefined && it.amount > was) it.lvSet = null; };
/* "go back to automatic" (the small icon beside "Set by you") */
IEF.autoAgain = function (it) { it.lvSet = null; };
var round2 = IEF.round2 = function (n) { return Math.round(n * 100) / 100; };
var qtyText = IEF.qtyText = function (it) { return it.amount !== null ? round2(it.amount) + (it.unit ? " " + it.unit : "") : it.text; };
IEF.cur = function () { return ITEMS.filter(function (i) { return i.id === IEF.S.sel; })[0] || null; };
/* the item the open form edits: the item itself, or the draft in Add mode */
IEF.target = function () { return IEF.S.mode === "add" ? IEF.draft : IEF.cur(); };

/* ---------- state (the URL carries it, so every state has a link) ---------- */
var S = IEF.S = {
  sel: Q.get("sel") === "" ? null : (Q.get("sel") || "butter"),
  child: /^(edit|history)$/.test(Q.get("child")) ? Q.get("child") : null,
  mode: Q.get("mode") === "add" ? "add" : "item",
  hint: Q.get("hint") === "reveal" ? "reveal" : "show",
  cat: Q.get("cat") === "list" ? "list" : "chips",
  recipes: Q.get("recipes") !== "0", down: Q.get("down") === "1",
  field: Q.get("field") || "", more: +Q.get("more") || 0
};
IEF.url = function () {
  try { var u = new URL(location.href); function set(k, v) { if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); }
    u.searchParams.set("sel", S.sel || ""); set("child", S.child); set("mode", S.mode === "add" ? "add" : ""); history.replaceState(null, "", u); } catch (e) {}
};

/* ---------- icons ---------- */
function sv(p, cls, sz) { sz = sz || 20; return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '"' + (cls ? ' class="' + cls + '"' : "") + ' aria-hidden="true" focusable="false">' + p + "</svg>"; }
var IC = IEF.IC = {
  /* edit = a pencil. history = a clock with a turned-back arrow, so it is not the plain clock the Use by tile already uses */
  edit: '<path d="M4 20l1.1-4.2L16.3 4.6a2 2 0 0 1 2.8 0l.3.3a2 2 0 0 1 0 2.8L8.2 18.9z"/><path d="M14.4 6.5l3.1 3.1"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5v4.2h4.2"/><path d="M12 7.8V12l2.8 1.8"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  basket: '<path d="M4 9h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z"/><path d="M8 9l3-5M16 9l-3-5"/>',
  down: '<path d="M12 4v13M6 12l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M6 12h12"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', chev: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M15 6l-6 6 6 6"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 .98.8h8.8a1 1 0 0 0 1-.8L20 8H6.2"/>',
  pot: '<path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M3 11h18M15 3l-3 8"/>', alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.5"/>',
  pin: '<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
  ruler: '<path d="M3.5 15.5l12-12 5 5-12 12z"/><path d="M7 12l2.2 2.2M10 9l1.6 1.6M13 6l2.2 2.2"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', chevd: '<path d="M7 10l5 5 5-5"/>',
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  pantry: '<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',
  recipes: '<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',
  cartnav: '<path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/>'
};
IEF.sv = sv;
/* The level icon is a BATTERY everywhere the level is drawn (decision 94, confirmed by the owner 11 Oct 2026; the drop is gone). Four cells: Plenty 4 filled and green, Some 2 amber, Running low 1 red, Out 0 and black.
   Same colour tokens as the drop had: --cue, --accent, --danger, --out. The level name is screen-reader text only (.sr-only), never drawn. A hand-set level is drawn exactly like a calculated one. */
var BAT = { Plenty: [4, "plenty"], Some: [2, "some"], "Running low": [1, "low"], Out: [0, "out"] };
IEF.battery = function (l, width) {
  var a = BAT[l], n = a[0], c = "";
  for (var i = 0; i < n; i++) c += '<rect x="' + (4 + i * 6) + '" y="5" width="5.2" height="10" rx="1.2" fill="currentColor" stroke="none"/>';
  return '<svg class="bat lv-' + a[1] + '" width="' + width + '" height="' + Math.round(width * 20 / 34) + '" viewBox="0 0 34 20" aria-hidden="true" focusable="false"><rect x="1" y="2" width="29" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M31.4 7.5h.8a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-.8z" fill="currentColor" stroke="none"/>' + c + "</svg>";
};
/* the width the tile and the picker draw it at: 38 in the item flyout's level tile, 35 on each picker button */
IEF.lvIcon = function (l, size) { return IEF.battery(l, Math.round(size * 1.25)); };
IEF.sr = function (t) { return '<span class="sr-only">' + esc(t) + "</span>"; };
IEF.LEVELS = ["Plenty", "Some", "Running low", "Out"];

/* ---------- key hints: the host says which keys exist at this size (none on a phone). The same .kbd chip the Pantry uses; the Pantry's cue switch hides it. ---------- */
var KEYS = { edit: "E", history: ",", add: "N", used: "D", shop: "S", use: "U", undo: "Z", enter: "Enter" };
function hk(k) { return IEF.host && IEF.host.keys ? KEYS[k] || "" : ""; }
function kbd(k, cls) { var c = hk(k); return c ? '<kbd class="kbd' + (cls ? " " + cls : "") + '">' + c + "</kbd>" : ""; }
IEF.kbd = kbd;

/* ---------- the page behind the flyouts: the Pantry list ---------- */
function due(d) { return d === null ? "" : d === 0 ? '<span class="due hot">Today</span>' : d === 1 ? '<span class="due hot">Tomorrow</span>' : '<span class="due">Use within<br>' + d + " days</span>"; }
function row(i) {
  var on = S.sel === i.id && S.mode !== "add", q = qtyText(i), out = level(i) === "Out", d = IEF.daysTo(i.useby);
  return '<li class="rw' + (on ? " sel" : "") + '" data-id="' + i.id + '"><button type="button" class="row" data-ief="open" data-id="' + i.id + '"' + (on ? ' aria-current="true"' : "") + '><div class="rmain"><div class="nm" title="' + esc(i.name) + '">' + (i.emoji ? i.emoji + " " : "") + esc(i.name) + '</div><div class="mt">' + esc(i.area) + (out ? " · Out" : q ? " · " + esc(q) : "") + (i.spot && i.spot !== "Anywhere" ? " · " + esc(i.spot) : "") + (i.cat ? " · " + esc(i.cat) : "") + (i.list !== null ? ' · <b class="onl">On your list</b>' : "") + "</div></div>" + (out ? "" : due(d)) + "</button></li>";
}
function listInner() {
  return IEF.AREAS.map(function (a) { return [a, ITEMS.filter(function (i) { return i.area === a; })]; }).filter(function (g) { return g[1].length; })
    .map(function (g) { return '<div class="grp"><h2>' + esc(g[0]) + '</h2><span class="kbd keep">' + g[1].length + '</span></div><ul class="rows">' + g[1].map(row).join("") + "</ul>"; }).join("");
}
IEF.listHtml = function () {
  return '<div class="hd"><h1 class="sr-only">Pantry</h1><span class="count" id="ief-count">' + ITEMS.length + ' items</span><button type="button" class="btn pri" data-ief="add" aria-label="Add an item">+ Add ' + kbd("add") + '</button></div><div id="ief-list">' + listInner() + "</div>";
};
IEF.drawList = function () { var l = $("#ief-list"), c = $("#ief-count"); if (l) l.innerHTML = listInner(); if (c) c.textContent = ITEMS.length + " items"; };

/* ---------- the item flyout: header, tiles, actions (the same markup on every screen size) ---------- */
function ib(act, label, icon) {
  var on = S.child === act;
  return '<button type="button" class="ib' + (on ? " on" : "") + '" data-ief="' + act + '" aria-label="' + label + '" aria-expanded="' + on + '" aria-controls="ief-child" aria-keyshortcuts="' + (act === "edit" ? "E" : ",") + '" title="' + label + (hk(act) ? " (" + hk(act) + ")" : "") + '">' + sv(icon, "", 20) + kbd(act, "cap") + "</button>";
}
IEF.closeBtn = function (label, attr) { return '<button type="button" class="x ib" ' + (attr || 'data-ief="closechild"') + ' aria-label="' + label + '" title="' + label + '">' + sv(IC.x, "", 20) + "</button>"; };
IEF.headHtml = function (it) {
  var q = qtyText(it), out = level(it) === "Out", sp = it.spot && it.spot !== "Anywhere" ? " · " + esc(it.spot) : "";
  return '<span class="ph" aria-hidden="true">' + (it.emoji || "🍽️") + '</span><div class="sid"><h2 class="nm2" title="' + esc(it.name) + '">' + esc(it.name) + "</h2>" + (q || out ? '<span class="shq">' + (out ? "Out" : esc(q)) + "</span>" : "") + (it.area ? '<span class="shw"><b>' + esc(it.area) + "</b>" + sp + "</span>" : "") + (it.list !== null ? '<span class="onl">On your list</span>' : "") + "</div>"
    + '<div class="hacts" role="group" aria-label="Item actions">' + ib("edit", "Edit item", IC.edit) + ib("history", "History", IC.history) + IEF.closeBtn("Close", 'data-ief="closeitem"') + "</div>";
};
IEF.tilesHtml = function (it) {
  function tl(k, ic, val, cap, prompt, sr) {
    return val === null
      ? '<button type="button" class="tl empty" data-ief="tile" data-k="' + k + '">' + sv(IC.plus, "", 20) + "<span>" + prompt + "</span></button>"
      : '<button type="button" class="tl" data-ief="tile" data-k="' + k + '"' + (sr ? ' aria-label="' + esc(sr) + '"' : "") + ">" + ic + (val === "" ? "" : "<b>" + val + "</b>") + (cap ? "<span>" + cap + "</span>" : "") + "</button>";
  }
  var lv = level(it), d = IEF.daysTo(it.useby), t = [];
  t.push(tl(counted(it) ? "qty" : "level", IEF.lvIcon(lv, 30), "", "", "", "Level, " + lv + ". Opens the edit flyout"));
  t.push(tl("useby", sv(IC.clock, "", 20), it.useby ? esc(d === 0 ? "Today" : d === 1 ? "1D" : d > 1 && d < 7 ? d + "D" : IEF.dayName(it.useby).replace(/^\w+ /, "")) : null, "Use by", "Add use-by", it.useby ? "Use by, " + IEF.rel(d) : ""));
  var third = false;
  if (it.unit || it.min) { t.push(tl("min", sv(IC.down, "", 20), it.min ? esc(it.min + (it.unit ? " " + it.unit : "")) : null, "Minimum", "Add minimum")); third = true; }
  if (it.amount === null && !it.text) { t.push(tl("qty", "", null, "", "Add quantity")); third = true; }
  if (it.cat) t.push(tl("cat", sv(IC.basket, "", 20), esc(it.cat), "", "", "Category, " + it.cat));
  else if (t.length < 4) t.push(tl("cat", "", null, "", "Add category"));
  return t.slice(0, 4).join("");
};
/* kept exactly as the existing Pantry item sheet has them (owner, 10 Oct 2026): Used up, and Add to shopping / On your list */
IEF.actsHtml = function (it) {
  var out = level(it) === "Out";
  return (out ? '<button type="button" class="btn ghost" disabled>' + sv(IC.tick, "", 20) + "<span>Marked Out</span></button>" : '<button type="button" class="btn ghost" data-ief="usedup">' + sv(IC.tick, "", 20) + "<span>Used up</span>" + kbd("used") + "</button>")
    + (it.list !== null ? '<button type="button" class="btn ghost" disabled>' + sv(IC.tick, "", 20) + "<span>On your list</span></button>" : '<button type="button" class="btn pri" data-ief="shopquick">' + sv(IC.cart, "", 20) + "<span>Add to shopping</span>" + kbd("shop") + "</button>");
};
/* the shortcut part: the pattern is key, then a lower-case label, for every key. Edit keeps E, History is the comma. */
IEF.hintHtml = function (it) {
  if (!hk("edit")) return "";
  return '<p class="phint" id="ief-hint">' + (counted(it) ? '<span class="kbd">U</span> use one ' : "") + '<span class="kbd">D</span> used up <span class="kbd">S</span> shopping list <span class="kbd">E</span> edit <span class="kbd">,</span> history</p>';
};
IEF.parentInner = function (it) {
  return '<span class="grab" data-grab aria-hidden="true"></span><div class="top shead" id="ief-head" data-ief="strip">' + IEF.headHtml(it) + '</div><div class="tiles tiles4" id="ief-tiles">' + IEF.tilesHtml(it) + '</div><div class="sacts" id="ief-acts">' + IEF.actsHtml(it) + '</div><div id="ief-hintw">' + IEF.hintHtml(it) + "</div>";
};
IEF.emptyHtml = function () { return '<div class="pick"><p>Pick an item to see it here.</p><p class="phint">' + (hk("edit") ? '<span class="kbd">&uarr;</span> <span class="kbd">&darr;</span> to move, <span class="kbd">?</span> for all shortcuts' : "") + "</p></div>"; };
/* re-draw only what an edit can change in the item flyout, so nothing under the pointer or focus is replaced */
IEF.syncParent = function () {
  var it = IEF.cur(); if (!it || S.mode === "add") return;
  var h = $("#ief-head"), t = $("#ief-tiles"), a = $("#ief-acts"), k = $("#ief-hintw");
  var f = document.activeElement, keep = f && f.dataset && f.dataset.ief && h && h.contains(f) ? f.dataset.ief : null;
  if (h) h.innerHTML = IEF.headHtml(it); if (t) t.innerHTML = IEF.tilesHtml(it); if (a) a.innerHTML = IEF.actsHtml(it); if (k) k.innerHTML = IEF.hintHtml(it);
  if (keep) { var n = $('#ief-head [data-ief="' + keep + '"]'); if (n) n.focus(); }
  IEF.drawList();
};
/* the parent flyout (or Add) is drawn into #ief-panel */
IEF.drawPanel = function () {
  var p = $("#ief-panel"), it = IEF.cur();
  attr("open", (S.mode === "add" || it) ? "1" : "");
  if (S.mode === "add") { p.innerHTML = IEF.childInner("add"); p.dataset.mode = "add"; p.dataset.empty = ""; return; }
  p.dataset.mode = "item"; p.dataset.empty = it ? "" : "1";
  p.innerHTML = it ? IEF.parentInner(it) : IEF.emptyHtml();
  p.setAttribute("aria-label", it ? it.name : "Item detail");
};

/* a box you are typing in commits when it loses focus. Do that before the form is replaced, while the item it belongs to is still the current one. */
var settle = IEF.settle = function () { var a = document.activeElement; if (a && a.blur && a.matches && a.matches("input,select,textarea")) a.blur(); };

/* ---------- the nested child (Edit, History) and Add: one frame, two homes (a column or a stacked card on desktop, a stacked sheet on a phone) ---------- */
IEF.childInner = function (kind) {
  var it = IEF.target();
  if (kind === "history") return '<span class="grab" data-grab aria-hidden="true"></span><div class="chd" data-grab><div><h2>History</h2><p class="trunc" title="' + esc(it.name) + '">' + esc(it.name) + ' only</p></div>' + IEF.closeBtn("Close history") + '</div><div class="cbody hbody" id="ief-cbody" aria-busy="true"></div>';
  if (kind === "add") return '<span class="grab" data-grab aria-hidden="true"></span><div class="chd" data-grab><div><h2>Add an item</h2></div>' + IEF.closeBtn("Cancel adding", 'data-ief="addcancel"') + '</div><div class="cbody" id="ief-cbody"></div><div class="cft" id="ief-cft"></div>';
  return '<span class="grab" data-grab aria-hidden="true"></span><div class="chd" data-grab><div id="ief-ctitle"><h2>Edit item</h2><p class="trunc" title="' + esc(it.name) + '">' + esc(it.name) + '</p></div><span class="saved" id="ief-saved" role="status" aria-live="polite"></span>' + IEF.closeBtn("Close edit") + '</div><div class="cbody" id="ief-cbody"></div>';
};
var need = IEF.need = (function () { var got = {}; return function (file, cb) { if (got[file] === true) return cb(); if (got[file]) return got[file].push(cb); got[file] = [cb]; var s = document.createElement("script"); s.src = file; s.onload = function () { var q = got[file]; got[file] = true; q.forEach(function (f) { f(); }); }; document.head.appendChild(s); }; })();
/* fills the child body; the first Edit (or Add) fetches form.js, the first History fetches history.js. cb runs when the body is there. */
IEF.fillChild = function (kind, cb) {
  var done = function () { if (cb) cb(); };
  if (kind === "history") need("history.js", function () { IEF.hist.fill(IEF.cur(), done); });
  else need("form.js", function () { if (kind === "add") IEF.form.fillAdd(); else IEF.form.fill(IEF.cur()); done(); });
};
function app() { return $("#ief-app"); }
function attr(n, v) { var a = app(); if (!a) return; if (v) a.setAttribute("data-" + n, v); else a.removeAttribute("data-" + n); }
function syncIcons() { ["edit", "history"].forEach(function (k) { var b = $('#ief-head [data-ief="' + k + '"]'); if (b) { b.classList.toggle("on", S.child === k); b.setAttribute("aria-expanded", S.child === k); } }); }
/* open (or swap to) a child: Edit or History. field = the form field to land on (a tile tap), from = the control that opened it, so closing can hand focus back. */
IEF.setChild = function (kind, o) {
  o = o || {}; settle();
  if (S.mode === "add" || !IEF.cur()) return;
  var c = $("#ief-child"), prev = S.child; S.child = kind; S.field = o.field || ""; IEF.from = o.from || IEF.from || null;
  if (!kind) { c.hidden = true; c.innerHTML = ""; attr("child", ""); syncIcons(); IEF.url(); if (IEF.host.childClosed) IEF.host.childClosed(prev); return; }
  c.hidden = false; c.dataset.kind = kind; attr("child", kind);
  c.setAttribute("aria-label", kind === "history" ? "History" : "Edit item");
  c.classList.remove("enter"); if (!prev && !o.still) { void c.offsetWidth; c.classList.add("enter"); }
  c.innerHTML = IEF.childInner(kind);
  syncIcons(); IEF.url();
  IEF.fillChild(kind, function () { if (IEF.host.childReady) IEF.host.childReady(kind, o); });
};
IEF.toggleChild = function (kind, from) { IEF.setChild(S.child === kind ? null : kind, { from: from || document.activeElement }); if (S.child === null) IEF.restoreFocus(kind); };
IEF.restoreFocus = function (kind) { var b = $('#ief-head [data-ief="' + (kind || "edit") + '"]'); if (b) b.focus({ preventScroll: true }); };
IEF.closeChild = function (refocus) { var k = S.child; if (!k) return false; IEF.setChild(null); if (refocus !== false) IEF.restoreFocus(k); return true; };
IEF.openItem = function (id, o) {
  o = o || {}; settle(); if (S.mode === "add") IEF.cancelAdd(true);
  S.sel = id; IEF.drawPanel(); IEF.drawList(); IEF.url();
  if (S.child) { var k = S.child; S.child = null; IEF.setChild(k, { from: null, still: true }); }
  if (IEF.host.itemOpened) IEF.host.itemOpened(o);
};
IEF.closeItem = function () {
  settle();
  if (S.child) IEF.setChild(null);
  var id = S.sel; S.sel = null; IEF.drawPanel(); IEF.drawList(); IEF.url();
  if (IEF.host.itemClosed) IEF.host.itemClosed(id);
};

/* close the top-most layer: Add, else the child, else the item. */
IEF.closeTop = function (o) {
  o = o || {};
  if (S.mode === "add") { IEF.cancelAdd(); return true; }
  if (S.child) { IEF.closeChild(true); return true; }
  if (S.sel) { IEF.closeItem(); return true; }
  return false;
};

/* ---------- Add mode: the same form, an empty draft, in the parent's place (a side panel on desktop, a tall sheet on a phone) ---------- */
IEF.startAdd = function () {
  settle();
  if (S.child) IEF.setChild(null);
  IEF.draft = { id: "new", emoji: "", name: "", area: "Unplaced", spot: "", cat: "", amount: null, unit: "", text: "", useby: "", min: "", level: "Plenty", lvSet: null, list: null };
  S.mode = "add"; S.field = ""; IEF.drawPanel(); IEF.drawList(); IEF.fillChild("add", function () { if (IEF.host.addReady) IEF.host.addReady(); }); IEF.url();
};
IEF.cancelAdd = function (quiet) {
  if (S.mode !== "add") return; settle(); S.mode = "item"; IEF.draft = null;
  if (!quiet) { IEF.drawPanel(); IEF.drawList(); IEF.url(); if (IEF.host.addClosed) IEF.host.addClosed(); }
};
IEF.commitAdd = function (more) {
  var d = IEF.draft; if (!d) return;
  if (!d.name.trim()) { IEF.form.nameError(); return; }
  d.id = "n" + Date.now(); d.name = d.name.trim(); ITEMS.push(d); IEF.log(d, "Added", "", "Added");
  var id = d.id; IEF.toast(esc(d.name) + " is added to " + esc(d.area) + ".");
  if (more) { IEF.startAdd(); return; }
  S.mode = "item"; IEF.draft = null; S.sel = id; IEF.drawPanel(); IEF.drawList(); IEF.url(); if (IEF.host.itemOpened) IEF.host.itemOpened({});
};

/* ---------- the history log of edits made here (merged: a field edited twice in a row is one line with the net change) ---------- */
var LOG = IEF.LOG = {};
IEF.log = function (it, field, from, to) {
  var a = LOG[it.id] = LOG[it.id] || [], idx = -1;
  a.forEach(function (e, i) { if (e.field === field) idx = i; });
  if (field === "Added" || field === "Used up") { a.push({ field: field, from: from, to: to }); return; }
  if (idx > -1) { a[idx].to = to; a[idx].n++; if (String(a[idx].from) === String(to)) a.splice(idx, 1); }
  else if (String(from) !== String(to)) a.push({ field: field, from: from, to: to, n: 1 });
};

/* ---------- save feedback, toast, undo ---------- */
var savedT = null, toastT = null, undoSnap = null;
IEF.say = function (msg) {
  var n = $("#ief-saved"); if (!n) return;
  clearTimeout(savedT); n.innerHTML = msg ? sv(IC.tick, "", 14) + "<span>" + esc(msg) + "</span>" : "";
  if (msg) savedT = setTimeout(function () { n.innerHTML = ""; }, 2400);
};
IEF.toast = function (msg, snap) {
  var t = $("#ief-toast"); if (!t) return; clearTimeout(toastT);
  undoSnap = snap || null;
  t.innerHTML = "<span>" + msg + "</span>" + (snap ? '<button type="button" data-ief="undo">Undo ' + kbd("undo", "keep") + "</button>" : ""); t.hidden = false;
  toastT = setTimeout(function () { t.hidden = true; undoSnap = null; }, 6000);
};
IEF.snap = function () { return JSON.stringify([ITEMS, S.sel, LOG]); };
IEF.restore = function (s) { var a = JSON.parse(s); ITEMS.length = 0; a[0].forEach(function (i) { ITEMS.push(i); }); S.sel = a[1]; Object.keys(LOG).forEach(function (k) { delete LOG[k]; }); for (var k in a[2]) LOG[k] = a[2][k]; };
IEF.undo = function () {
  if (!undoSnap) return; IEF.restore(undoSnap); undoSnap = null; $("#ief-toast").hidden = true;
  var k = S.child; IEF.drawPanel(); IEF.drawList(); if (k) { S.child = null; IEF.setChild(k, {}); }
};

/* ---------- actions from the item flyout (the form's own are in form.js) ---------- */
function usedUp() {
  var it = IEF.cur(); if (!it || level(it) === "Out") return; var s = IEF.snap();
  it.prev = it.amount; it.amount = it.amount === null ? null : 0; if (it.amount === null) it.level = "Out"; IEF.log(it, "Used up", "", "Used up"); IEF.setChild(null); IEF.syncParent();
  IEF.toast(esc(it.name) + " is marked Out. It is in History.", s);
}
function shopQuick() { var it = IEF.cur(); if (!it || it.list !== null) return; var s = IEF.snap(); it.list = ""; IEF.log(it, "Shopping list", "not on it", "on it"); IEF.syncParent(); if (S.child === "edit" && IEF.form) IEF.form.refreshShop(); IEF.toast(esc(it.name) + " is on your shopping list.", s); }
IEF.usedUp = usedUp; IEF.shopQuick = shopQuick;
IEF.act = {
  open: function (el) { IEF.openItem(el.dataset.id, { from: el }); },
  edit: function (el) { IEF.toggleChild("edit", el); },
  history: function (el) { IEF.toggleChild("history", el); },
  closechild: function () { IEF.closeChild(true); },
  closeitem: function () { IEF.closeItem(); },
  tile: function (el) { IEF.setChild("edit", { field: el.dataset.k, from: el }); },
  usedup: usedUp, shopquick: shopQuick,
  add: function () { IEF.startAdd(); },
  addcancel: function () { IEF.cancelAdd(); },
  undo: function () { IEF.undo(); },
  dim: function () { IEF.closeTop(); },
  /* tapping the parent's collapsed header while a child is open (a stacked sheet or lane) takes you back to the parent */
  strip: function (el, e) { if (S.child && e && !e.target.closest("button")) IEF.closeChild(true); }
};
document.addEventListener("click", function (e) {
  var el = e.target.closest && e.target.closest("[data-ief]"); if (!el) return;
  var f = IEF.act[el.dataset.ief]; if (f && !el.disabled) { if (el.tagName === "BUTTON") e.preventDefault(); f(el, e); }
});

/* ---------- boot: fetch the one host file for this size, draw the page, then apply the state in the URL ---------- */
function boot() {
  var h = IEF.host;
  $("#root").innerHTML = h.shell({ list: IEF.listHtml() });
  IEF.drawPanel(); attr("hint", S.hint);
  if (S.mode === "add") { IEF.startAdd(); }
  else if (S.sel && S.child) { var k = S.child; S.child = null; IEF.setChild(k, { field: S.field }); }
  if (h.booted) h.booted();
}
need(IEF.wide ? "desktop.js" : "phone.js", boot);
/* a host is chosen once; crossing the 1024px line (resizing a real window) reloads the page */
matchMedia("(min-width:1024px)").addEventListener("change", function () { location.reload(); });
})();
