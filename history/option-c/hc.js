/* History in context (Option C). One renderer for the phone sheet and the desktop panel: same data, same words, two layouts.
   Sample data only. Nothing is fetched on load: the journal for a scope is built when History is opened (DESIGN.md section 6). */
(function () {
"use strict";
var BASE = new Date(2026, 9, 11), WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dayLabel(ago) { if (ago === 0) return "Today"; if (ago === 1) return "Yesterday"; var d = new Date(BASE); d.setDate(d.getDate() - ago); return WD[d.getDay()] + " " + d.getDate() + " " + MO[d.getMonth()]; }
function dayShort(ago) { if (ago === 0) return "today"; if (ago === 1) return "yesterday"; var d = new Date(BASE); d.setDate(d.getDate() - ago); return WD[d.getDay()]; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

/* Revised to the owner's locked decisions H2, H5, H9, H10 (11 Oct 2026).
   H2: history stays in context for pantry, recipes and shopping, each its own concern. Only SHOPPING is drawn here; pantry and recipes are existing screens and are linked.
   H9: no typed search, no questions to ask. H10: no assistant category; an assistant's action shows as the person it acted for. */
var ITEMS = { rice: ["Basmati rice", "🍚"], eggs: ["Eggs", "🥚"], peas: ["Frozen peas", "🫛"], tea: ["Green tea", "🍵"] };
var RECIPES = { "fried-rice": "Egg fried rice" };
var PEOPLE = { priya: ["Priya", "You"], sam: ["Sam", "Sam"], visitor: ["Someone shopping", "Someone shopping"] };
var VIA = { app: "", voice: "by voice", assistant: "via assistant", shopper: "shopper link", import: "receipt import" };
/* kind groups = the "What" pick: the five things that can happen to a shopping list entry */
var KINDS = { add: ["Added", ["shop-add"]], qty: ["Amount", ["shop-qty"]], buy: ["Bought", ["shop-buy"]], rem: ["Removed", ["shop-rem"]] };
function groupOf(k) { for (var g in KINDS) if (KINDS[g][1].indexOf(k) > -1) return g; return "add"; }
/* Sample shopping events (the field catalogue in docs/knowledge/history-option-c.md). Names differ from option D's sample on purpose: each mockup holds its own. */
var E = [
 { id: "r2", ago: 0, tm: "9:20 am", who: "priya", via: "app", kind: "shop-qty", items: ["rice"], text: "Changed the amount of Basmati rice", from: "1 kg", to: "2 kg", undo: "Set it back to 1 kg" },
 { id: "r1", ago: 0, tm: "9:12 am", who: "sam", via: "voice", kind: "shop-add", items: ["rice"], text: "Added Basmati rice to the shopping list", detail: "“We are nearly out of rice”", undo: "Take it off the list" },
 { id: "t2", ago: 1, tm: "5:45 pm", who: "priya", via: "app", kind: "shop-rem", items: ["tea"], text: "Took Green tea off the shopping list", detail: "“Already have some”", undo: "Put it back on the list" },
 { id: "g1", ago: 2, tm: "4:00 pm", who: "priya", via: "app", kind: "shop-buy", items: ["eggs"], text: "Bought Eggs, 12", from: "on the list", to: "bought", undo: "Put it back on the list" },
 { id: "t1", ago: 2, tm: "8:10 am", who: "sam", via: "app", kind: "shop-add", items: ["tea"], text: "Added Green tea to the shopping list", undo: "Take it off the list" },
 { id: "g2", ago: 3, tm: "6:25 pm", who: "sam", via: "assistant", kind: "shop-add", items: ["eggs"], recipe: "fried-rice", text: "Added Eggs to the shopping list", detail: "Saturday’s dinner needs them", undo: "Take it off the list" },
 { id: "r3", ago: 5, tm: "12:05 pm", who: "priya", via: "import", kind: "shop-buy", items: ["rice"], text: "Bought Basmati rice, 1 kg", from: "on the list", to: "bought", detail: "Ticked off from a receipt import", undo: "Put it back on the list" },
 { id: "r4", ago: 7, tm: "6:30 pm", who: "sam", via: "app", kind: "shop-add", items: ["rice"], text: "Added Basmati rice to the shopping list", undo: "Take it off the list" },
 { id: "p2", ago: 8, tm: "5:40 pm", who: "visitor", via: "shopper", kind: "shop-buy", items: ["peas"], text: "Bought Frozen peas", from: "on the list", to: "bought", detail: "Ticked off on the shopper link, no sign-in", undo: "Put it back on the list" },
 { id: "p1", ago: 9, tm: "8:01 pm", who: "sam", via: "app", kind: "shop-add", items: ["peas"], text: "Added Frozen peas to the shopping list", undo: "Take it off the list" }
];
var BYID = {}; E.forEach(function (e) { BYID[e.id] = e; });

/* Scopes. shop = one list entry, list = the whole shopping list (the one widening step, a pick). pantry and recipes are hand-offs to the existing screens. */
var SC = {
 shop: function (id) { return { t: "shop", id: id, label: ITEMS[id][0], has: function (e) { return (e.items || []).indexOf(id) > -1; } }; },
 list: function () { return { t: "list", id: "", label: "The shopping list", has: function () { return true; } }; },
 pantry: function (id) { return { t: "pantry", id: id, label: "Pantry", link: true }; },
 recipes: function (id) { return { t: "recipes", id: id, label: "Recipes", link: true }; }
};
function chainOf(s) { if (s.t === "shop") return [SC.shop(s.id), SC.list()]; if (s.t === "list") return [SC.list()]; return [SC[s.t](s.id)]; }
function parse(str) { var p = str.split(":"); return { t: p[0], id: p.slice(1).join(":") }; }
function whoName(e) { return PEOPLE[e.who][1]; }

var ICON = {
 clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
 mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', chev: '<path d="m9 6 6 6-6 6"/>', back: '<path d="m15 6-6 6 6 6"/>',
 pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', filter: '<path d="M4 6h16M7 12h10M10 18h4"/>', up: '<path d="m6 15 6-6 6 6"/>', receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
 cart: '<path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>', open: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'
};
function ic(n, s) { s = s || 18; return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || "") + "</svg>"; }
/* H10: an assistant's action is drawn as the person it acted for (their own initial). Only voice, import and the shopper link keep a small icon. */
function avatar(e) { if (e.via === "voice") return '<span class="hc-av voice" title="By voice">' + ic("mic", 16) + "</span>"; if (e.via === "import") return '<span class="hc-av" title="Receipt import">' + ic("receipt", 16) + "</span>"; if (e.who === "visitor") return '<span class="hc-av" title="Shopper link">' + ic("link", 16) + "</span>"; return '<span class="hc-av' + (e.who === "priya" ? " me" : "") + '" aria-hidden="true">' + PEOPLE[e.who][0].charAt(0) + "</span>"; }

var KEYHINT = /Mac|iPhone|iPad/.test(navigator.platform || "") ? "⌘" : "Ctrl";
function kbd(k) { return '<kbd class="kbd">' + k + "</kbd>"; }
var LINKS = {
 pantry: [["../../fragments/item-edit-flyout/pantry.html?sel=rice&child=history", "Open Basmati rice, History", 0]],
 recipes: [["../../recipe-versions/history.html?v=v0", "Open the version history", 0], ["../../recipe-versions/suggestions.html", "Open To review (per-change undo)", 1]]
};
var HAND = {
 pantry: ["Pantry history stays as it is", "Every pantry item already has its History in the item flyout (the clock, or the comma key). It is not redrawn here, so there is one version of it."],
 recipes: ["Recipe history is the screens it already has", "A recipe has its version history, and To review lists an assistant’s changes with a per-change undo. They are linked, not redrawn."]
};

function create(root, opt) {
 var mode = opt.mode, desk = mode === "desktop";
 var st = { entry: parse(opt.scope || "shop:rice"), lvl: 0, who: "all", what: "all", when: "all", days: 3, filt: false, open: true, extra: [], undone: {}, focus: -1, from: opt.from || "", focusId: opt.focus || "" };
 function chain() { return chainOf(st.entry); }
 function scope() { return chain()[Math.min(st.lvl, chain().length - 1)]; }
 function all() { return st.extra.concat(E); }
 function scoped() { var sc = scope(); return sc.link ? [] : all().filter(function (e) { return sc.has(e); }); }
 function matchF(e) {
  if (st.who === "me" && e.who !== "priya") return false;
  if (st.who === "sam" && e.who !== "sam") return false;
  if (st.what !== "all" && groupOf(e.kind) !== st.what) return false;
  if (st.when === "today" && e.ago > 0) return false;
  if (st.when === "week" && e.ago > 6) return false;
  return true;
 }
 function rows() { return scoped().filter(matchF); }
 function active() { return (st.who !== "all") + (st.what !== "all") + (st.when !== "all"); }

 function chip(kind, id, label) { return '<button type="button" class="hc-ref" data-jump="' + kind + ":" + id + '">' + esc(label) + "</button>"; }
 function title(e) {
  var t = esc(e.text);
  (e.items || []).forEach(function (i) { var n = ITEMS[i][0]; if (scope().t === "list") t = t.replace(esc(n), '<button type="button" class="hc-ref" data-jump="shop:' + i + '">' + esc(n) + "</button>"); });
  return t;
 }
 function row(e, k) {
  var u = st.undone[e.id], x = "";
  if (e.recipe) x += '<span class="hc-link">' + ic("link", 13) + " for " + chip("recipes", e.recipe, RECIPES[e.recipe]) + ", on the plan</span>";
  var ft = e.from != null || e.to != null ? '<span class="hc-ft"><s>' + esc(e.from || "not set") + "</s> " + ic("chev", 12) + " <b>" + esc(e.to || "not set") + "</b></span>" : "";
  var via = VIA[e.via] ? '<span class="hc-via">' + esc(VIA[e.via]) + "</span>" : "";
  var act = e.undo ? (u ? '<span class="hc-done">' + ic("undo", 14) + " Undone</span>" : '<button type="button" class="hc-undo" data-undo="' + e.id + '" title="' + esc(e.undo) + '" aria-label="' + esc(e.undo) + '">' + ic("undo", 15) + "<span>" + esc(e.undo) + "</span></button>") : "";
  return '<li class="hc-row' + (u ? " undone" : "") + (e.fresh ? " fresh" : "") + '" data-i="' + k + '" data-id="' + e.id + '" tabindex="-1">' + avatar(e) + '<div class="hc-body"><p class="hc-t">' + title(e) + "</p>" + ft + (e.detail ? '<p class="hc-d">' + esc(e.detail) + "</p>" : "") + x + '<p class="hc-m"><span>' + esc(whoName(e)) + "</span> " + via + "<time>" + e.tm + "</time></p></div>" + act + "</li>";
 }
 function handoff() {
  var sc = scope(), h = HAND[sc.t];
  return '<div class="hc-empty"><span class="hc-big">' + ic("open", 28) + "</span><b>" + esc(h[0]) + "</b><p>" + esc(h[1]) + '</p><div class="hc-empty-acts">' + LINKS[sc.t].map(function (l) { return '<a class="hc-btn' + (l[2] ? " ghost" : "") + '" href="' + l[0] + '">' + esc(l[1]) + "</a>"; }).join("") + "</div></div>";
 }
 function list() {
  var sc = scope();
  if (sc.link) return handoff();
  var rs = rows(), ch = chain(), h = "";
  if (!rs.length) {
   var nx = ch[st.lvl + 1];
   return '<div class="hc-empty"><span class="hc-big">' + ic("filter", 28) + "</span><b>Nothing matches these filters in " + esc(sc.label) + "</b><p>Take a filter off, or look at the whole list.</p><div class=\"hc-empty-acts\">" + (nx ? '<button type="button" class="hc-btn" data-widen>Look at ' + esc(nx.label) + "</button>" : "") + '<button type="button" class="hc-btn ghost" data-clear>Clear filters</button></div></div>';
  }
  var groups = [], by = {};
  rs.forEach(function (e) { if (!by[e.ago]) { by[e.ago] = []; groups.push(e.ago); } by[e.ago].push(e); });
  var shown = Math.min(groups.length, st.days), idx = 0;
  groups.slice(0, shown).forEach(function (a) { h += '<section class="hc-day"><h3>' + dayLabel(a) + '</h3><ul class="hc-list">' + by[a].map(function (e) { return row(e, idx++); }).join("") + "</ul></section>"; });
  if (groups.length > shown) h += '<button type="button" class="hc-more" data-more>Show ' + Math.min(5, groups.length - shown) + " more day" + (Math.min(5, groups.length - shown) > 1 ? "s" : "") + " <small>" + (groups.length - shown) + " earlier with entries</small></button>";
  else h += '<p class="hc-end">That is everything for ' + esc(sc.label) + '. Nothing is ever deleted.</p>';
  return h;
 }
 function crumbs() {
  var ch = chain();
  if (ch.length < 2) return "";
  return '<nav class="hc-crumbs" aria-label="History scope">' + ch.map(function (c, i) { return (i ? '<span class="hc-sep" aria-hidden="true">' + ic("chev", 14) + "</span>" : "") + '<button type="button" class="hc-crumb" data-lvl="' + i + '"' + (i === st.lvl ? ' aria-current="true"' : "") + ">" + esc(c.label) + "</button>"; }).join("") + "</nav>";
 }
 function actions() {
  var ch = chain(), sc = scope();
  if (sc.link) return "";
  var w = st.lvl < ch.length - 1 ? '<button type="button" class="hc-widen" data-widen>' + ic("up", 16) + "<span>Widen to " + esc(ch[st.lvl + 1].label) + "</span>" + (desk ? kbd("W") : "") + "</button>" : "";
  return '<div class="hc-search">' + w + '<button type="button" class="hc-fbtn" data-ftoggle aria-expanded="' + st.filt + '">' + ic("filter", 18) + "<span>Filters</span>" + (active() ? "<i>" + active() + "</i>" : "") + "</button></div>" + (st.filt ? filters() : "");
 }
 function filters() {
  var fb = function (key, v, l) { return '<button type="button" data-f="' + key + ":" + v + '" aria-pressed="' + (st[key] === v) + '">' + l + "</button>"; };
  return '<div class="hc-fs"><div class="hc-fg" role="group" aria-label="Who"><span class="hc-fl">Who</span>' + fb("who", "all", "Anyone") + fb("who", "me", "Me") + fb("who", "sam", "Sam") + '</div><div class="hc-fg" role="group" aria-label="What"><span class="hc-fl">What</span>' + fb("what", "all", "Anything") + Object.keys(KINDS).map(function (g) { return fb("what", g, KINDS[g][0]); }).join("") + '</div><div class="hc-fg" role="group" aria-label="When"><span class="hc-fl">When</span>' + fb("when", "all", "Any time") + fb("when", "today", "Today") + fb("when", "week", "This week") + "</div></div>";
 }
 function from() {
  if (st.from !== "catchup") return "";
  return '<div class="hc-from"><button type="button" class="hc-back" data-back>' + ic("back", 16) + "<span>Back to the catch-up</span></button><span class=\"hc-fromtx\">" + ic("bell", 14) + " From the catch-up</span></div>";
 }
 function head() {
  var sc = scope(), sub = sc.link ? "Existing screen, linked" : esc(sc.label) + " · " + scoped().length + " entries";
  return '<header class="hc-head"><div class="hc-ttl"><span class="hc-ic">' + ic("clock", 20) + "</span><div><h2>History</h2><p>" + sub + "</p></div></div>" + (opt.onClose ? '<button type="button" class="hc-close" data-close aria-label="Close history">' + ic("x", 20) + "</button>" : "") + "</header>";
 }
 function foot() {
  if (scope().link) return desk ? '<footer class="hc-foot keys"><span>' + kbd(",") + " or " + kbd(KEYHINT + " Esc") + " close</span></footer>" : "";
  if (!desk) return '<p class="hc-foot">Nothing is deleted. An undo is saved as a new entry.</p>';
  return '<footer class="hc-foot keys"><span>' + kbd("W") + " widen</span><span>" + kbd("⇧ W") + " narrower</span><span>" + kbd("J") + kbd("K") + " move</span><span>" + kbd("R") + " undo the row</span><span>" + kbd(",") + " or " + kbd(KEYHINT + " Esc") + " close</span></footer>";
 }
 function paint() {
  root.className = "hc " + (desk ? "hcd" : "hcm");
  root.innerHTML = head() + from() + '<div class="hc-main"><div class="hc-top">' + crumbs() + actions() + "</div><div class=\"hc-scroll\" data-scroll>" + list() + "</div></div>" + foot() + '<div class="hc-toast" role="status" aria-live="polite"></div>';
  if (st.focusId) { var f = root.querySelector('[data-id="' + st.focusId + '"]'); if (f) { f.classList.add("kf"); } }
  if (opt.onPaint) opt.onPaint(st);
 }
 function toast(m) { var t = root.querySelector(".hc-toast"); if (!t) return; t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("on"); }, 3400); }
 function setScope(entry) { st.entry = entry; st.lvl = 0; st.days = 3; st.focusId = ""; st.who = st.what = st.when = "all"; paint(); if (opt.onScope) opt.onScope(entry); }
 function widen(d) { var n = chain().length; var to = Math.max(0, Math.min(n - 1, st.lvl + d)); if (to === st.lvl) return; st.lvl = to; st.days = 3; paint(); }
 function undo(id) {
  var e = BYID[id]; if (!e || st.undone[id]) return;
  st.undone[id] = 1;
  st.extra.unshift({ id: "u" + id, ago: 0, tm: "just now", who: "priya", via: "app", kind: e.kind, items: e.items, fresh: 1, text: "Undid: " + e.text.charAt(0).toLowerCase() + e.text.slice(1), from: e.to, to: e.from, detail: "Saved as a new entry. The original stays in the history." });
  paint(); toast("Done. The undo is its own entry; nothing was deleted.");
 }
 root.addEventListener("click", function (ev) {
  var t = ev.target.closest("button"); if (!t || !root.contains(t)) return;
  if (t.dataset.jump) { setScope(parse(t.dataset.jump)); return; }
  if (t.dataset.lvl != null) { st.lvl = +t.dataset.lvl; st.days = 3; paint(); return; }
  if ("widen" in t.dataset) { widen(1); return; }
  if (t.dataset.f) { var p = t.dataset.f.split(":"); st[p[0]] = p[1]; st.days = 3; paint(); return; }
  if ("ftoggle" in t.dataset) { st.filt = !st.filt; paint(); return; }
  if ("more" in t.dataset) { st.days += 5; paint(); return; }
  if ("clear" in t.dataset) { st.who = st.what = st.when = "all"; paint(); return; }
  if (t.dataset.undo) { undo(t.dataset.undo); return; }
  if ("back" in t.dataset && opt.onBack) { opt.onBack(); return; }
  if ("close" in t.dataset && opt.onClose) opt.onClose();
 });
 if (desk) document.addEventListener("keydown", function (ev) {
  if (!st.open) return;
  var tg = ev.target, typing = tg.matches && tg.matches("input,textarea,select,[contenteditable]");
  if ((ev.ctrlKey || ev.metaKey) && (ev.key === "Escape" || ev.key === "Enter")) { if (opt.onClose) { ev.preventDefault(); opt.onClose(); } return; }
  if (typing || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  var k = ev.key;
  if (k === "W") { ev.preventDefault(); widen(-1); }
  else if (k === "w") { ev.preventDefault(); widen(1); }
  else if (k === "j" || k === "k") { var rs = root.querySelectorAll(".hc-row"); if (!rs.length) return; st.focus = Math.max(0, Math.min(rs.length - 1, st.focus + (k === "j" ? 1 : -1))); rs.forEach(function (r) { r.classList.remove("kf"); }); rs[st.focus].classList.add("kf"); rs[st.focus].scrollIntoView({ block: "nearest" }); }
  else if (k === "r") { var f = root.querySelector(".hc-row.kf [data-undo]"); if (f) undo(f.dataset.undo); }
 });
 st.open = true;
 paint();
 return { state: st, set: setScope, repaint: paint, setOpen: function (b) { st.open = b; }, widenTo: function (n) { st.lvl = n; paint(); }, setFilt: function (b) { st.filt = b; paint(); }, setFilter: function (o) { for (var k in o) st[k] = o[k]; st.filt = true; paint(); } };
}
window.HC = { create: create, ITEMS: ITEMS, RECIPES: RECIPES, PEOPLE: PEOPLE, ic: ic, kbd: kbd, esc: esc, KEY: KEYHINT, dayLabel: dayLabel, chainOf: chainOf, parse: parse };
})();
