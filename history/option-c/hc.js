/* History in context (Option C). One renderer for the phone sheet and the desktop panel: same data, same words, two layouts.
   Sample data only. Nothing is fetched on load: the journal for a scope is built when History is opened (DESIGN.md section 6). */
(function () {
"use strict";
var BASE = new Date(2026, 9, 11), WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dayLabel(ago) { if (ago === 0) return "Today"; if (ago === 1) return "Yesterday"; var d = new Date(BASE); d.setDate(d.getDate() - ago); return WD[d.getDay()] + " " + d.getDate() + " " + MO[d.getMonth()]; }
function dayShort(ago) { if (ago === 0) return "today"; if (ago === 1) return "yesterday"; var d = new Date(BASE); d.setDate(d.getDate() - ago); return WD[d.getDay()]; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

var ITEMS = { rice: ["Basmati rice", "Pantry", "Top shelf"], eggs: ["Eggs", "Fridge", "Door"], soy: ["Soy sauce", "Pantry", "Door"], lentils: ["Red lentils", "Pantry", "Basket"], peas: ["Frozen peas", "Freezer", "Drawer 2"], tea: ["Green tea", "Pantry", "Basket"] };
var RECIPES = { "fried-rice": "Egg fried rice", dal: "Lemon dal" };
var PEOPLE = { priya: ["Priya", "You"], sam: ["Sam", "Sam"], claude: ["Claude", "Claude"] };
var VIA = { app: "", voice: "by voice", assistant: "assistant", mcp: "MCP", import: "import" };
/* kind groups = the "What" facet */
var KINDS = { stock: ["Stock", ["added", "used", "level", "moved", "edit", "usedup"]], shop: ["Shopping", ["shop"]], plan: ["Plan", ["plan"]], cook: ["Cooking", ["cook"]], recipe: ["Recipes", ["recipe-new", "recipe-edit", "star", "vote"]], prefs: ["Preferences", ["prefs"]], place: ["Places", ["place"]] };
function groupOf(k) { for (var g in KINDS) if (KINDS[g][1].indexOf(k) > -1) return g; return "stock"; }

/* The journal. Newest first. child:true = a stock change caused by a cook: shown in item and place scopes, folded into the cook row elsewhere. */
var E = [
 { id: "e1", ago: 0, tm: "9:12 am", who: "sam", via: "voice", kind: "shop", items: ["rice"], text: "Added Basmati rice to the shopping list", detail: "“We are nearly out of rice”", undo: "Take it off the list" },
 { id: "e2", ago: 0, tm: "8:30 am", who: "claude", for: "priya", via: "assistant", kind: "level", items: ["rice"], place: "Pantry", spot: "Top shelf", text: "Set the level of Basmati rice", from: "Some", to: "Running low", detail: "After Saturday’s cook (estimated)", undo: "Set it back to Some" },
 { id: "e23", ago: 1, tm: "6:15 pm", who: "sam", via: "app", kind: "plan", planDay: "Sat", recipe: "fried-rice", text: "Moved Egg fried rice to 7:30 pm", from: "6:30 pm", to: "7:30 pm", undo: "Move it back" },
 { id: "e3", ago: 1, tm: "7:40 pm", who: "priya", via: "app", kind: "cook", recipe: "fried-rice", items: ["rice", "eggs", "soy"], text: "Cooked Egg fried rice", detail: "4 servings. Stock was taken off when she finished.", uses: [["rice", "2 cups"], ["eggs", "3"], ["soy", "1 tbsp"]], undo: "Put the stock back" },
 { id: "e4", ago: 1, tm: "7:40 pm", who: "priya", via: "app", kind: "used", child: "e3", items: ["rice"], recipe: "fried-rice", place: "Pantry", spot: "Top shelf", amt: "2 cups", text: "Used 2 cups of Basmati rice", from: "about 5 cups", to: "about 3 cups" },
 { id: "e5", ago: 1, tm: "7:40 pm", who: "priya", via: "app", kind: "used", child: "e3", items: ["eggs"], recipe: "fried-rice", place: "Fridge", spot: "Door", amt: "3", text: "Used 3 Eggs", from: "9", to: "6" },
 { id: "e6", ago: 1, tm: "5:10 pm", who: "sam", via: "app", kind: "recipe-edit", recipe: "fried-rice", text: "Edited Egg fried rice, our usual (revision 6)", from: "Soy sauce 1 tbsp", to: "Soy sauce 2 tbsp", undo: "Undo this change" },
 { id: "e7", ago: 2, tm: "6:20 pm", who: "claude", for: "sam", via: "assistant", kind: "plan", planDay: "Sat", recipe: "fried-rice", text: "Planned Egg fried rice for Saturday dinner", undo: "Take it off the plan" },
 { id: "e22", ago: 2, tm: "4:00 pm", who: "priya", via: "app", kind: "shop", items: ["eggs"], place: "Fridge", spot: "Door", text: "Checked off Eggs: bought 12", undo: "Put it back on the list" },
 { id: "e8", ago: 2, tm: "7:05 am", who: "sam", via: "app", kind: "moved", items: ["rice"], place: "Pantry", spot: "Top shelf", text: "Moved Basmati rice", from: "Door", to: "Top shelf", undo: "Move it back" },
 { id: "e9", ago: 3, tm: "8:20 pm", who: "priya", via: "app", kind: "star", recipe: "fried-rice", text: "Starred Egg fried rice", undo: "Unstar it" },
 { id: "e10", ago: 3, tm: "6:00 pm", who: "sam", via: "app", kind: "vote", recipe: "dal", text: "Voted Lemon dal a thumbs up", undo: "Take the vote back" },
 { id: "e20", ago: 4, tm: "10:02 am", who: "claude", for: "priya", via: "mcp", kind: "edit", items: ["eggs"], place: "Fridge", spot: "Door", text: "Set use-by on Eggs", from: "not set", to: "20 Oct", undo: "Clear it" },
 { id: "e11", ago: 5, tm: "7:15 pm", who: "priya", via: "app", kind: "cook", recipe: "dal", items: ["lentils", "rice"], text: "Cooked Lemon dal", detail: "3 servings", uses: [["lentils", "1 cup"], ["rice", "1 cup"]], undo: "Put the stock back" },
 { id: "e12", ago: 5, tm: "7:15 pm", who: "priya", via: "app", kind: "used", child: "e11", items: ["rice"], recipe: "dal", place: "Pantry", spot: "Door", amt: "1 cup", text: "Used 1 cup of Basmati rice", from: "about 6 cups", to: "about 5 cups" },
 { id: "e13", ago: 5, tm: "7:15 pm", who: "priya", via: "app", kind: "used", child: "e11", items: ["lentils"], recipe: "dal", place: "Pantry", spot: "Basket", amt: "1 cup", text: "Used 1 cup of Red lentils", from: "4 cups", to: "3 cups" },
 { id: "e14", ago: 5, tm: "12:10 pm", who: "priya", via: "import", kind: "added", items: ["rice"], place: "Pantry", spot: "Door", text: "Added Basmati rice, 1 kg", detail: "From a receipt import", undo: "Remove it" },
 { id: "e15", ago: 6, tm: "4:30 pm", who: "sam", via: "app", kind: "prefs", person: "sam", text: "Set “No peanuts” for Sam", undo: "Undo" },
 { id: "e16", ago: 6, tm: "11:00 am", who: "claude", for: "priya", via: "assistant", kind: "recipe-new", recipe: "dal", text: "Saved a variation of Lemon dal: “less chilli”", detail: "Waiting for review", undo: "Put it away" },
 { id: "e17", ago: 7, tm: "6:10 pm", who: "priya", via: "app", kind: "place", place: "Pantry", text: "Added a spot “Basket” to Pantry", undo: "Remove the spot" },
 { id: "e18", ago: 8, tm: "8:01 pm", who: "sam", via: "app", kind: "shop", items: ["peas"], place: "Freezer", spot: "Drawer 2", text: "Added Frozen peas to the shopping list", undo: "Take it off the list" },
 { id: "e19", ago: 8, tm: "8:00 pm", who: "sam", via: "app", kind: "usedup", items: ["peas"], place: "Freezer", spot: "Drawer 2", text: "Marked Frozen peas as used up", undo: "Bring it back" }
];
var BYID = {}; E.forEach(function (e) { BYID[e.id] = e; });

/* Scopes: each has a label and a test. The chain says how it widens. */
function itemOf(id) { return ITEMS[id]; }
var SC = {
 item: function (id) { return { t: "item", id: id, label: ITEMS[id][0], noun: "this item", has: function (e) { return (e.items || []).indexOf(id) > -1; } }; },
 spot: function (id) { var p = id.split("|"); return { t: "spot", id: id, label: p[1], noun: "this spot", has: function (e) { return e.place === p[0] && e.spot === p[1]; } }; },
 place: function (id) { return { t: "place", id: id, label: id, noun: "this place", has: function (e) { return e.place === id; } }; },
 recipe: function (id) { return { t: "recipe", id: id, label: RECIPES[id], noun: "this recipe", has: function (e) { return e.recipe === id; } }; },
 recipes: function () { return { t: "recipes", id: "", label: "All recipes", noun: "all recipes", has: function (e) { return !!e.recipe || groupOf(e.kind) === "recipe"; } }; },
 person: function (id) { return { t: "person", id: id, label: PEOPLE[id][0], noun: "this person", has: function (e) { return e.who === id || e.for === id || e.person === id; } }; },
 day: function (id) { return { t: "day", id: id, label: id === "Sat" ? "Saturday" : id, noun: "this day", has: function (e) { return e.planDay === id; } }; },
 week: function () { return { t: "week", id: "", label: "The week’s plan", noun: "the plan", has: function (e) { return !!e.planDay; } }; },
 all: function () { return { t: "all", id: "", label: "Everything", noun: "the household", has: function () { return true; } }; }
};
function chainOf(s) {
 var h = SC.all();
 if (s.t === "item") { var it = ITEMS[s.id]; return [SC.item(s.id), SC.place(it[1]), h]; }
 if (s.t === "spot") return [SC.spot(s.id), SC.place(s.id.split("|")[0]), h];
 if (s.t === "place") return [SC.place(s.id), h];
 if (s.t === "recipe") return [SC.recipe(s.id), SC.recipes(), h];
 if (s.t === "person") return [SC.person(s.id), h];
 if (s.t === "day") return [SC.day(s.id), SC.week(), h];
 return [h];
}
function parse(str) { var p = str.split(":"); return { t: p[0], id: p.slice(1).join(":") }; }

/* Questions answered first, per scope type. pick selects the entries; say writes one sentence. */
function whoName(e) { var n = e.who === "priya" ? "You" : PEOPLE[e.who][0]; return e.for ? n + " (for " + PEOPLE[e.for][0] + ")" : n; }
function when(e) { return dayShort(e.ago) + ", " + e.tm; }
function last(ms, tail) { if (!ms.length) return null; var e = ms[0]; return whoName(e) + ": " + e.text.charAt(0).toLowerCase() + e.text.slice(1) + (e.from || e.to ? " (" + (e.from || "not set") + " → " + (e.to || "not set") + ")" : "") + ", " + when(e) + (tail || "") + "."; }
var Q = {
 item: [
  { q: "Where did it go?", pick: function (e) { return e.kind === "used" || e.kind === "usedup"; }, say: function (ms) { var u = ms.filter(function (e) { return e.kind === "used"; }); if (!u.length) return "Nothing has been used from it yet."; return "Used " + u.length + " times in the last 2 weeks: " + u.map(function (e) { return e.amt + " for " + RECIPES[e.recipe] + " (" + dayShort(e.ago) + ")"; }).join(", ") + ". About 3 cups left."; } },
  { q: "Who changed it last?", pick: function () { return true; }, say: function (ms) { return last(ms); } },
  { q: "When did I last move it?", pick: function (e) { return e.kind === "moved"; }, say: function (ms) { return last(ms) || "It has never been moved."; } }
 ],
 spot: [{ q: "What was here lately?", pick: function () { return true; }, say: function (ms) { return ms.length + " things changed in this spot. " + last(ms); } }, { q: "What left it?", pick: function (e) { return e.kind === "used" || e.kind === "usedup" || e.kind === "moved"; }, say: function (ms) { return ms.length ? last(ms) : "Nothing has left it."; } }],
 place: [
  { q: "What left it this week?", pick: function (e) { return e.kind === "used" || e.kind === "usedup" || e.kind === "moved"; }, say: function (ms) { return ms.length ? ms.length + " changes: " + ms.map(function (e) { return e.text.replace(/^Used /, "").replace(/^Marked /, "").replace(/ as used up$/, " (used up)"); }).slice(0, 4).join(", ") + "." : "Nothing left it."; } },
  { q: "Who moves things here?", pick: function (e) { return e.kind === "moved" || e.kind === "added" || e.kind === "place"; }, say: function (ms) { return last(ms) || "Nobody has moved anything here."; } },
  { q: "What did the assistants do here?", pick: function (e) { return e.via === "assistant" || e.via === "mcp" || e.via === "voice"; }, say: function (ms) { return ms.length ? ms.length + " things, latest: " + last(ms) : "The assistants have not touched this place."; } }
 ],
 recipe: [
  { q: "When did we last cook this?", pick: function (e) { return e.kind === "cook"; }, say: function (ms) { return ms.length ? whoName(ms[0]) + " cooked it " + when(ms[0]) + ", " + ms[0].detail.split(".")[0] + ". Used " + ms[0].uses.map(function (u) { return u[1] + " " + ITEMS[u[0]][0].toLowerCase(); }).join(", ") + "." : "It has not been cooked yet."; } },
  { q: "Who last edited it?", pick: function (e) { return e.kind === "recipe-edit" || e.kind === "recipe-new"; }, say: function (ms) { return last(ms) || "Nobody has edited it."; } },
  { q: "Who starred or voted?", pick: function (e) { return e.kind === "star" || e.kind === "vote"; }, say: function (ms) { return ms.length ? ms.map(function (e) { return whoName(e) + " " + e.text.charAt(0).toLowerCase() + e.text.slice(1).replace(/ Egg fried rice| Lemon dal/, ""); }).join(". ") + "." : "No stars or votes yet."; } }
 ],
 recipes: [{ q: "What did we cook lately?", pick: function (e) { return e.kind === "cook"; }, say: function (ms) { return ms.map(function (e) { return RECIPES[e.recipe] + " (" + dayShort(e.ago) + ")"; }).join(", ") + "."; } }, { q: "What changed in recipes?", pick: function (e) { return groupOf(e.kind) === "recipe"; }, say: function (ms) { return last(ms); } }],
 person: [
  { q: "What did they do this week?", pick: function () { return true; }, say: function (ms, sc) { var o = ms.filter(function (e) { return e.who === sc.id; }); return o.length + " things by hand or voice, " + (ms.length - o.length) + " by assistants for them. Latest: " + last(ms); } },
  { q: "What did their assistant do?", pick: function (e) { return e.via === "assistant" || e.via === "mcp" || e.via === "voice"; }, say: function (ms) { return ms.length ? ms.length + " things, latest: " + last(ms) : "No assistant activity."; } }
 ],
 day: [{ q: "What changed on this day?", pick: function () { return true; }, say: function (ms) { return ms.length + " changes. " + last(ms); } }],
 week: [{ q: "Who changed the plan?", pick: function () { return true; }, say: function (ms) { return last(ms); } }],
 all: [
  { q: "What did the assistants do?", pick: function (e) { return e.via !== "app" && e.via !== "import"; }, say: function (ms) { return ms.length + " things by assistants, voice or MCP. Latest: " + last(ms); } },
  { q: "What changed today?", pick: function (e) { return e.ago === 0; }, say: function (ms) { return ms.length ? ms.length + " changes today. Latest: " + last(ms) : "Nothing yet today."; } },
  { q: "What did we cook?", pick: function (e) { return e.kind === "cook"; }, say: function (ms) { return ms.map(function (e) { return RECIPES[e.recipe] + " (" + dayShort(e.ago) + ", " + whoName(e) + ")"; }).join("; ") + "."; } }
 ]
};

var ICON = {
 clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
 spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', plug: '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5"/>', chev: '<path d="m9 6 6 6-6 6"/>',
 pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', filter: '<path d="M4 6h16M7 12h10M10 18h4"/>', up: '<path d="m6 15 6-6 6 6"/>', pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM8 6c0-2 2-2 2-4M14 6c0-2 2-2 2-4"/>', receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>'
};
function ic(n, s) { s = s || 18; return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || "") + "</svg>"; }
function avatar(e) { if (e.via === "voice") return '<span class="hc-av voice" title="By voice">' + ic("mic", 16) + "</span>"; if (e.who === "claude") return '<span class="hc-av ai" title="Assistant">' + ic(e.via === "mcp" ? "plug" : "spark", 16) + "</span>"; if (e.via === "import") return '<span class="hc-av" title="Import">' + ic("receipt", 16) + "</span>"; return '<span class="hc-av' + (e.who === "priya" ? " me" : "") + '" aria-hidden="true">' + PEOPLE[e.who][0].charAt(0) + "</span>"; }

var KEYHINT = /Mac|iPhone|iPad/.test(navigator.platform || "") ? "⌘" : "Ctrl";
function kbd(k) { return '<kbd class="kbd">' + k + "</kbd>"; }

function create(root, opt) {
 var mode = opt.mode, desk = mode === "desktop";
 var st = { entry: parse(opt.scope || "item:rice"), lvl: 0, q: "", who: "all", what: "all", when: "all", qn: -1, days: 3, filt: false, wide: false, open: true, extra: [], undone: {}, focus: -1 };
 function chain() { return chainOf(st.entry); }
 function scope() { return chain()[Math.min(st.lvl, chain().length - 1)]; }
 function all() { return st.extra.concat(E); }
 function scoped() { var sc = scope(); return all().filter(function (e) { return sc.has(e) && (!e.child || sc.t === "item" || sc.t === "spot" || sc.t === "place"); }); }
 function matchQ(e) {
  if (!st.q) return true;
  var hay = [e.text, e.detail, e.from, e.to, whoName(e), VIA[e.via], KINDS[groupOf(e.kind)][0], e.place, e.spot, e.recipe && RECIPES[e.recipe], (e.items || []).map(function (i) { return ITEMS[i][0]; }).join(" "), (e.uses || []).map(function (u) { return u[1] + " " + ITEMS[u[0]][0]; }).join(" "), e.ago === 0 ? "today" : e.ago === 1 ? "yesterday" : dayLabel(e.ago), e.ago < 7 ? "this week" : "", e.via === "voice" ? "voice spoke said" : "", e.who === "claude" ? "ai assistant" : ""].join(" ").toLowerCase();
  return st.q.toLowerCase().split(/\s+/).every(function (t) { return !t || hay.indexOf(t) > -1; });
 }
 function matchF(e) {
  if (st.who === "me" && !(e.who === "priya")) return false;
  if (st.who === "sam" && !(e.who === "sam")) return false;
  if (st.who === "ai" && !(e.via === "assistant" || e.via === "mcp" || e.via === "voice")) return false;
  if (st.what !== "all" && groupOf(e.kind) !== st.what) return false;
  if (st.when === "today" && e.ago > 0) return false;
  if (st.when === "week" && e.ago > 6) return false;
  return true;
 }
 function qDef() { var l = Q[scope().t] || []; return st.qn > -1 ? l[st.qn] : null; }
 function rows() { var d = qDef(); return scoped().filter(function (e) { return matchQ(e) && matchF(e) && (!d || d.pick(e)); }); }
 function active() { return (st.who !== "all") + (st.what !== "all") + (st.when !== "all"); }

 function chip(kind, id, label) { return '<button type="button" class="hc-ref" data-jump="' + kind + ":" + id + '">' + esc(label) + "</button>"; }
 function title(e) {
  var t = esc(e.text);
  (e.items || []).forEach(function (i) { var n = ITEMS[i][0]; if (e.kind === "cook") return; t = t.replace(esc(n), '<button type="button" class="hc-ref" data-jump="item:' + i + '">' + esc(n) + "</button>"); });
  if (e.recipe) { var rn = RECIPES[e.recipe]; t = t.replace(esc(rn), '<button type="button" class="hc-ref" data-jump="recipe:' + e.recipe + '">' + esc(rn) + "</button>"); }
  return t;
 }
 function row(e, k) {
  var u = st.undone[e.id], x = "";
  if (e.child) { x += '<span class="hc-link">' + ic("link", 13) + " for " + chip("recipe", e.recipe, RECIPES[e.recipe]) + ", cooked " + dayShort(e.ago) + "</span>"; }
  if (e.uses && scope().t !== "item") { x += '<span class="hc-uses">' + e.uses.map(function (p) { return chip("item", p[0], p[1] + " " + ITEMS[p[0]][0]); }).join("") + "</span>"; }
  if (e.uses && scope().t === "item") { x += '<span class="hc-link">' + ic("link", 13) + " used " + e.uses.map(function (p) { return p[1] + " " + ITEMS[p[0]][0].toLowerCase(); }).join(", ") + "</span>"; }
  var ft = e.from != null || e.to != null ? '<span class="hc-ft"><s>' + esc(e.from || "not set") + "</s> " + ic("chev", 12) + " <b>" + esc(e.to || "not set") + "</b></span>" : "";
  var via = VIA[e.via] ? '<span class="hc-via">' + esc(VIA[e.via]) + "</span>" : "";
  var act = e.undo && !e.child ? (u ? '<span class="hc-done">' + ic("undo", 14) + " Undone</span>" : '<button type="button" class="hc-undo" data-undo="' + e.id + '" title="' + esc(e.undo) + '" aria-label="' + esc(e.undo) + '">' + ic("undo", 15) + "<span>" + esc(e.undo) + "</span></button>") : "";
  return '<li class="hc-row' + (u ? " undone" : "") + (e.fresh ? " fresh" : "") + '" data-i="' + k + '" tabindex="-1">' + avatar(e) + '<div class="hc-body"><p class="hc-t">' + title(e) + "</p>" + ft + (e.detail ? '<p class="hc-d">' + esc(e.detail) + "</p>" : "") + x + '<p class="hc-m"><span>' + esc(whoName(e)) + "</span> " + via + "<time>" + e.tm + "</time></p></div>" + act + "</li>";
 }
 function list() {
  var rs = rows(), sc = scope(), ch = chain(), h = "";
  if (!rs.length) {
   var any = scoped().length;
   if (!any) {
    var nx = ch[st.lvl + 1];
    return '<div class="hc-empty"><span class="hc-big">' + ic("clock", 28) + "</span><b>" + esc(sc.label) + " has been quiet</b><p>Nothing has changed since it was added. When something does, it lands here.</p>" + (nx ? '<button type="button" class="hc-btn" data-widen>Look in ' + esc(nx.label) + "</button>" : "") + "</div>";
   }
   var nx2 = ch[st.lvl + 1], msg = st.q ? "Nothing for “" + esc(st.q) + "” in " + esc(sc.label) : "Nothing matches these filters in " + esc(sc.label);
   return '<div class="hc-empty"><span class="hc-big">' + ic("search", 28) + "</span><b>" + msg + "</b><p>Try fewer words, or look wider.</p><div class=\"hc-empty-acts\">" + (nx2 ? '<button type="button" class="hc-btn" data-widen>Search ' + esc(nx2.label) + "</button>" : "") + '<button type="button" class="hc-btn ghost" data-clear>Clear search and filters</button></div></div>';
  }
  var groups = [], by = {};
  rs.forEach(function (e) { if (!by[e.ago]) { by[e.ago] = []; groups.push(e.ago); } by[e.ago].push(e); });
  var shown = Math.min(groups.length, st.days), idx = 0;
  groups.slice(0, shown).forEach(function (a) { h += '<section class="hc-day"><h3>' + dayLabel(a) + '</h3><ul class="hc-list">' + by[a].map(function (e) { return row(e, idx++); }).join("") + "</ul></section>"; });
  if (groups.length > shown) h += '<button type="button" class="hc-more" data-more>Show ' + Math.min(5, groups.length - shown) + " more day" + (Math.min(5, groups.length - shown) > 1 ? "s" : "") + " <small>" + (groups.length - shown) + " earlier with entries</small></button>";
  else h += '<p class="hc-end">That is everything' + (sc.t === "all" ? "" : " in " + esc(sc.label)) + '. Nothing is ever deleted.</p>';
  return h;
 }
 function crumbs() {
  var ch = chain();
  return '<nav class="hc-crumbs" aria-label="History scope">' + ch.map(function (c, i) { return (i ? '<span class="hc-sep" aria-hidden="true">' + ic("chev", 14) + "</span>" : "") + '<button type="button" class="hc-crumb" data-lvl="' + i + '"' + (i === st.lvl ? ' aria-current="true"' : "") + ">" + esc(c.label) + "</button>"; }).join("") + "</nav>" +
   (st.lvl < ch.length - 1 ? '<button type="button" class="hc-widen" data-widen>' + ic("up", 16) + "<span>Widen to " + esc(ch[st.lvl + 1].label) + "</span>" + (desk ? kbd("W") : "") + "</button>" : "");
 }
 function questions() {
  var l = Q[scope().t] || [], d = qDef();
  var chips = '<div class="hc-qs" role="group" aria-label="Quick questions">' + l.map(function (q, i) { return '<button type="button" class="hc-q" data-q="' + i + '" aria-pressed="' + (i === st.qn) + '">' + esc(q.q) + "</button>"; }).join("") + "</div>";
  var ans = "";
  if (d) { var ms = scoped().filter(d.pick); ans = '<div class="hc-ans" role="status"><b>' + esc(d.q) + "</b><p>" + esc(d.say(ms, scope())) + '</p><button type="button" class="hc-x" data-qclear aria-label="Clear the question">' + ic("x", 16) + "</button></div>"; }
  return chips + ans;
 }
 function filters() {
  var fb = function (key, v, l) { return '<button type="button" data-f="' + key + ":" + v + '" aria-pressed="' + (st[key] === v) + '">' + l + "</button>"; };
  return '<div class="hc-fs"><div class="hc-fg" role="group" aria-label="Who"><span class="hc-fl">Who</span>' + fb("who", "all", "Anyone") + fb("who", "me", "Me") + fb("who", "sam", "Sam") + fb("who", "ai", "Assistants and voice") + '</div><div class="hc-fg" role="group" aria-label="What"><span class="hc-fl">What</span>' + fb("what", "all", "Anything") + Object.keys(KINDS).map(function (g) { return fb("what", g, KINDS[g][0]); }).join("") + '</div><div class="hc-fg" role="group" aria-label="When"><span class="hc-fl">When</span>' + fb("when", "all", "Any time") + fb("when", "today", "Today") + fb("when", "week", "This week") + "</div></div>";
 }
 function head() {
  var sc = scope();
  return '<header class="hc-head"><div class="hc-ttl"><span class="hc-ic">' + ic("clock", 20) + "</span><div><h2>History</h2><p>" + esc(sc.label) + " · " + scoped().length + " entries</p></div></div>" + (opt.onClose ? '<button type="button" class="hc-close" data-close aria-label="Close history">' + ic("x", 20) + "</button>" : "") + "</header>";
 }
 function searchBox() {
  var sc = scope();
  return '<div class="hc-search"><label class="hc-sb">' + ic("search", 18) + '<input type="search" data-q-in placeholder="Search ' + esc(sc.label.toLowerCase() === "everything" ? "everything" : sc.label) + '" value="' + esc(st.q) + '" aria-label="Search history in ' + esc(sc.label) + '" autocomplete="off">' + (desk ? kbd("/") : "") + '</label><button type="button" class="hc-fbtn" data-ftoggle aria-expanded="' + st.filt + '">' + ic("filter", 18) + "<span>Filters</span>" + (active() ? "<i>" + active() + "</i>" : "") + "</button></div>" + (st.filt ? filters() : "");
 }
 function facets() {
  /* desktop Everything: scope tree on the left */
  var fb = function (key, v, l, n) { return '<button type="button" class="hc-fa" data-f="' + key + ":" + v + '" aria-pressed="' + (st[key] === v) + '"><span>' + l + "</span>" + (n != null ? "<em>" + n + "</em>" : "") + "</button>"; };
  var src = scoped().filter(function (e) { return matchQ(e); }), c = function (fn) { return src.filter(fn).length; };
  var h = '<aside class="hc-facets" aria-label="Narrow the history">';
  h += '<h4>Who</h4>' + fb("who", "all", "Anyone", src.length) + fb("who", "me", "Me", c(function (e) { return e.who === "priya"; })) + fb("who", "sam", "Sam", c(function (e) { return e.who === "sam"; })) + fb("who", "ai", "Assistants and voice", c(function (e) { return e.via === "assistant" || e.via === "mcp" || e.via === "voice"; }));
  h += "<h4>What</h4>" + fb("what", "all", "Anything", src.length) + Object.keys(KINDS).map(function (g) { return fb("what", g, KINDS[g][0], c(function (e) { return groupOf(e.kind) === g; })); }).join("");
  h += "<h4>When</h4>" + fb("when", "all", "Any time", src.length) + fb("when", "today", "Today", c(function (e) { return e.ago === 0; })) + fb("when", "week", "This week", c(function (e) { return e.ago < 7; }));
  h += "<h4>Jump to</h4>" + [["place:Pantry", "Pantry"], ["place:Fridge", "Fridge"], ["person:sam", "Sam"], ["person:claude", "Claude"], ["recipe:fried-rice", "Egg fried rice"], ["day:Sat", "Saturday’s plan"]].map(function (j) { return '<button type="button" class="hc-fa jump" data-jump="' + j[0] + '"><span>' + j[1] + "</span>" + ic("chev", 14) + "</button>"; }).join("");
  return h + "</aside>";
 }
 function foot() {
  if (!desk) return '<p class="hc-foot">Nothing is deleted. An undo is saved as a new entry.</p>';
  return '<footer class="hc-foot keys"><span>' + kbd("/") + " search</span><span>" + kbd("W") + " widen</span><span>" + kbd("⇧ W") + " narrower</span><span>" + kbd("J") + kbd("K") + " move</span><span>" + kbd("R") + " undo the row</span><span>" + kbd(",") + " or " + kbd(KEYHINT + " Esc") + " close</span></footer>";
 }
 function paint(keepFocus) {
  var a = document.activeElement, hadIn = a && a.matches && a.matches("[data-q-in]"), pos = hadIn ? a.selectionStart : 0;
  var wide = desk && st.wide;
  root.className = "hc " + (desk ? "hcd" : "hcm") + (wide ? " wide" : "");
  root.innerHTML = head() + (wide ? '<div class="hc-wide">' + facets() + '<div class="hc-main">' : '<div class="hc-main">') + '<div class="hc-top">' + crumbs() + searchBox() + questions() + "</div><div class=\"hc-scroll\" data-scroll>" + list() + "</div>" + (wide ? "</div></div>" : "</div>") + foot() + '<div class="hc-toast" role="status" aria-live="polite"></div>';
  if (opt.onPaint) opt.onPaint(st);
  if (hadIn || keepFocus === "in") { var i = root.querySelector("[data-q-in]"); i.focus(); try { i.setSelectionRange(pos, pos); } catch (x) {} }
 }
 function toast(m) { var t = root.querySelector(".hc-toast"); if (!t) return; t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("on"); }, 3400); }
 function setScope(entry) { st.entry = entry; st.lvl = 0; st.q = ""; st.qn = -1; st.days = 3; st.who = st.what = st.when = "all"; paint(); if (opt.onScope) opt.onScope(entry); }
 function widen(d) { var n = chain().length; var to = Math.max(0, Math.min(n - 1, st.lvl + d)); if (to === st.lvl) return; st.lvl = to; st.qn = -1; st.days = 3; paint(); if (desk && to === n - 1 && d > 0) { st.wide = true; paint(); } if (opt.onWiden) opt.onWiden(st); }
 function undo(id) {
  var e = BYID[id] || st.extra.filter(function (x) { return x.id === id; })[0]; if (!e || st.undone[id]) return;
  st.undone[id] = 1;
  st.extra.unshift({ id: "u" + id, ago: 0, tm: "just now", who: "priya", via: "app", kind: e.kind, items: e.items, recipe: e.recipe, place: e.place, spot: e.spot, planDay: e.planDay, person: e.person, fresh: 1, text: "Undid: " + e.text.charAt(0).toLowerCase() + e.text.slice(1), from: e.to, to: e.from, detail: "Saved as a new entry. The original stays in the history." });
  paint(); toast("Done. The undo is its own entry; nothing was deleted.");
 }
 root.addEventListener("click", function (ev) {
  var t = ev.target.closest("button"); if (!t || !root.contains(t)) return;
  if (t.dataset.jump) { setScope(parse(t.dataset.jump)); return; }
  if (t.dataset.lvl != null) { st.lvl = +t.dataset.lvl; st.qn = -1; st.days = 3; if (!(desk && st.lvl === chain().length - 1)) st.wide = false; paint(); return; }
  if ("widen" in t.dataset) { widen(1); return; }
  if (t.dataset.q != null) { st.qn = st.qn === +t.dataset.q ? -1 : +t.dataset.q; paint(); return; }
  if ("qclear" in t.dataset) { st.qn = -1; paint(); return; }
  if (t.dataset.f) { var p = t.dataset.f.split(":"); st[p[0]] = p[1]; st.days = 3; paint(); return; }
  if ("ftoggle" in t.dataset) { st.filt = !st.filt; paint(); return; }
  if ("more" in t.dataset) { st.days += 5; paint(); return; }
  if ("clear" in t.dataset) { st.q = ""; st.who = st.what = st.when = "all"; st.qn = -1; paint(); return; }
  if (t.dataset.undo) { undo(t.dataset.undo); return; }
  if ("close" in t.dataset && opt.onClose) opt.onClose();
 });
 root.addEventListener("input", function (ev) { if (ev.target.matches("[data-q-in]")) { st.q = ev.target.value.trim(); st.days = 3; paint(); } });
 root.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && ev.target.matches("[data-q-in]") && !(ev.ctrlKey || ev.metaKey)) { st.q = ""; ev.target.value = ""; paint("in"); ev.stopPropagation(); } });
 if (desk) document.addEventListener("keydown", function (ev) {
  if (!st.open) return;
  var tg = ev.target, typing = tg.matches && tg.matches("input,textarea,select,[contenteditable]");
  if ((ev.ctrlKey || ev.metaKey) && (ev.key === "Escape" || ev.key === "Enter")) { if (opt.onClose) { ev.preventDefault(); opt.onClose(); } return; }
  if (typing || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  var k = ev.key;
  if (k === "/") { ev.preventDefault(); var i = root.querySelector("[data-q-in]"); if (i) i.focus(); }
  else if (k === "W") { ev.preventDefault(); widen(-1); if (st.lvl < chain().length - 1) { st.wide = false; paint(); } }
  else if (k === "w") { ev.preventDefault(); widen(1); }
  else if (k === "j" || k === "k") { var rs = root.querySelectorAll(".hc-row"); if (!rs.length) return; st.focus = Math.max(0, Math.min(rs.length - 1, st.focus + (k === "j" ? 1 : -1))); rs.forEach(function (r) { r.classList.remove("kf"); }); rs[st.focus].classList.add("kf"); rs[st.focus].scrollIntoView({ block: "nearest" }); }
  else if (k === "r") { var f = root.querySelector(".hc-row.kf [data-undo]"); if (f) undo(f.dataset.undo); }
 });
 st.open = true;
 paint();
 return { state: st, set: setScope, repaint: paint, setOpen: function (b) { st.open = b; }, widenTo: function (n) { st.lvl = n; st.wide = desk && n === chain().length - 1; paint(); }, setQuery: function (q) { st.q = q; paint(); }, setWide: function (b) { st.wide = b; paint(); }, setFilt: function (b) { st.filt = b; paint(); } };
}
window.HC = { create: create, ITEMS: ITEMS, RECIPES: RECIPES, PEOPLE: PEOPLE, ic: ic, kbd: kbd, esc: esc, KEY: KEYHINT, dayLabel: dayLabel, chainOf: chainOf, parse: parse };
})();
