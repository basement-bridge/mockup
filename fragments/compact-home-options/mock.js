/* Compact view, options: sample data and renderers. Mockup only; nothing is saved or fetched.
   One render path draws every option: an option is a set of flags (near, strip, split, lens, eco, dash), so the markup a build lifts is the same everywhere.
   Sample data is invented (the repo's rule); names such as the household's allergies exist only here, never in compact.css. */
(function () {
"use strict";
var Q = new URLSearchParams(location.search);
var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var IC = {
  cart: '<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>', ban: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', down: '<path d="M7 10l5 5 5-5"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>', spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', plus: '<path d="M12 5v14M5 12h14"/>'
};
var sv = function (n, z) { z = z || 18; return '<svg class="i" viewBox="0 0 24 24" width="' + z + '" height="' + z + '" aria-hidden="true" focusable="false">' + IC[n] + "</svg>"; };

/* ---- the household (sample): Sam is the viewer. Hard avoids are why a recipe is left out for someone eating. ---- */
var EAT = "Sam, Jo and Priya";
/* ---- recipes (sample). t = the lens tags; why = the one-line reason ---- */
var R = {
  salad: { n: "Cucumber and spring onion salad", e: "🥗", m: 10, t: ["quick", "useup"], why: "uses the cucumbers and spring onions going off tomorrow" },
  tacos: { n: "Lime chicken tacos", e: "🌮", m: 25, t: ["quick"], why: "uses the limes and the jalapeños" },
  corn: { n: "Jalapeño cornbread", e: "🌽", m: 40, t: ["comfort"], why: "uses the jalapeños" },
  pnood: { n: "Peanut noodles", e: "🍜", m: 15, t: ["quick", "useup"], why: "uses up the last of the peanut butter" },
  efr: { n: "Egg fried rice", e: "🍚", m: 20, t: ["quick", "comfort"], why: "" },
  prawn: { n: "Prawn curry", e: "🍤", m: 35, t: ["comfort", "new"], why: "" },
  lamb: { n: "Lamb curry", e: "🍛", m: 60, t: ["comfort"], why: "" },
  chilli: { n: "Chilli noodles", e: "🌶️", m: 20, t: ["quick", "new"], why: "" },
  risotto: { n: "Mushroom risotto", e: "🍄", m: 45, t: ["comfort"], why: "" }
};
var LENS = [["quick", "Quick"], ["useup", "Use up"], ["new", "Something new"], ["comfort", "Comfort"]];
/* the four states. recipes: [id, missing things, [who, ingredient] blocks]. "Fits" = nothing blocked and at most 2 missing (the rule today: three or more missing does not fit). */
var ITEMS = { cucumbers: ["🥒", "Cucumbers", "Tomorrow"], spring: ["🌱", "Spring onion stalks", "Tomorrow"], limes: ["🍋", "Limes", "1 left, wants 3"], pb: ["🥜", "Crunchy peanut butter", "a little left"] };
var SC = {
  fits: { label: "Normal, with fits", planned: null, soon: ["cucumbers", "spring"], low: ["limes", "pb"], freezer: null, recipes: [
    ["salad", [], []], ["tacos", ["coriander"], []], ["corn", ["cornmeal", "buttermilk"], []], ["pnood", [], [["Priya", "peanut butter"]]], ["prawn", ["coconut milk", "prawns", "curry paste"], []]] },
  planned: { label: "Tonight planned", planned: { n: "Cheesy barramundi", e: "🐟", note: "All in · 30 min" }, soon: ["cucumbers", "spring"], low: ["limes", "pb"], freezer: null, recipes: [
    ["salad", [], []], ["tacos", ["coriander"], []], ["corn", ["cornmeal", "buttermilk"], []], ["pnood", [], [["Priya", "peanut butter"]]], ["prawn", ["coconut milk", "prawns", "curry paste"], []]] },
  none: { label: "Nothing fits", planned: null, soon: [], low: ["limes", "pb"], freezer: { n: "Beef curry", p: "2 portions" }, recipes: [
    ["chilli", ["chilli oil", "bok choy", "garlic"], []], ["tacos", ["coriander", "sour cream", "avocado"], []], ["prawn", ["coconut milk", "prawns", "curry paste"], []],
    ["lamb", ["lamb shoulder", "coconut milk", "curry paste"], []], ["risotto", ["arborio rice", "mushrooms", "stock", "parmesan"], []]] },
  excl: { label: "Nothing fits, exclusions", planned: null, soon: ["cucumbers", "spring"], low: ["limes", "pb"], freezer: { n: "Beef curry", p: "2 portions" }, recipes: [
    ["salad", [], [["Priya", "sesame oil"]]], ["pnood", [], [["Priya", "peanut butter"]]], ["corn", ["cornmeal"], [["Jo", "eggs"]]], ["efr", [], [["Jo", "eggs"]]],
    ["tacos", ["coriander", "sour cream", "avocado"], []], ["prawn", ["coconut milk", "prawns", "curry paste"], []]] }
};
var OPTS = [
  { id: "T", name: "Today", sub: "Compact view as it is now, from the screenshot", f: {} },
  { id: "A", name: "Near-misses", sub: "When nothing fits, show the closest three", f: { near: 1 } },
  { id: "B", name: "Actionable status strip", sub: "Running low and Plan tonight become controls", f: { strip: 1 } },
  { id: "C", name: "Split the reason", sub: "Blocked for a person, kept apart from missing things", f: { split: 1 } },
  { id: "D", name: "Chips as a lens", sub: "Below the answer, re-rank, grey when empty", f: { lens: 1 } },
  { id: "E", name: "Recommended: A + B + C + D, economical", sub: "One screen, no scroll in any state", f: { near: 1, strip: 1, split: 1, lens: 1, eco: 1 }, rec: 1 },
  { id: "F", name: "Retire Compact: Dashboard with density", sub: "No toggle; Settings > Compact rows also tightens Home", f: { dash: 1, near: 1, split: 1 } }
];

/* ---- state: the page (state, filter), the list and the plan are shared across frames so a tap in one shows in all ---- */
var ST = { s: SC[Q.get("s")] ? Q.get("s") : "fits", lens: {}, tray: {}, why: {}, dense: Q.get("dense") === "1", list: {}, low: {}, plan: null, only: Q.get("o") || "" };
if (Q.get("lens")) ST.lens[Q.get("o") || "D"] = Q.get("lens");
if (Q.get("tray")) ST.tray[Q.get("o") || "E"] = Q.get("tray");
if (Q.get("why")) ST.why[Q.get("o") || "E"] = 1;

/* ---- ranking: the one function the lens re-ranks. Blocked is never shown as a candidate; fits <= 2 missing; near = the rest, fewest missing then quickest (Proposal CH-A2) ---- */
function rank(sc, lens) {
  var all = sc.recipes.map(function (x, i) { return { id: x[0], r: R[x[0]], miss: x[1], block: x[2], i: i }; });
  var hit = function (o) { return lens && o.r.t.indexOf(lens) < 0 ? 1 : 0; };
  var cmp = function (a, b) { return hit(a) - hit(b) || a.miss.length - b.miss.length || a.r.m - b.r.m || a.i - b.i; };
  return {
    fits: all.filter(function (o) { return !o.block.length && o.miss.length <= 2; }).sort(cmp),
    near: all.filter(function (o) { return !o.block.length && o.miss.length > 2; }).sort(cmp),
    blocked: all.filter(function (o) { return o.block.length; })
  };
}
function people(list) { var n = []; list.forEach(function (o) { o.block.forEach(function (b) { if (n.indexOf(b[0]) < 0) n.push(b[0]); }); }); return n.length > 1 ? n.slice(0, -1).join(", ") + " and " + n[n.length - 1] : n[0] || ""; }
function sorted(a) { return a.slice().sort(); }
var list2 = function (a) { return a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0] || ""; };
function whoWhat(blocked) { var m = {}; blocked.forEach(function (o) { o.block.forEach(function (b) { (m[b[0]] = m[b[0]] || []); if (m[b[0]].indexOf(b[1]) < 0) m[b[0]].push(b[1]); }); }); return Object.keys(m).map(function (k) { return k + " (" + list2(m[k]) + ")"; }); }

/* ---- pieces ---- */
function railHtml() {
  return '<nav class="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div><span class="nv on" aria-current="page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>Home</span><span class="nv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/></svg>Pantry</span><span class="nv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/></svg>Recipes</span><span class="nv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/></svg>Shopping</span></nav>';
}
function topbar(seg) {
  return '<div class="topbar"><div class="us"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><span>Search pantry, recipes and shopping</span></div>' +
    (seg ? '<div class="seg" aria-label="Home view"><span>Dashboard</span><span class="on">Compact view</span></div>' : "") + "</div>";
}
function missText(o) { return o.miss.length ? '<span class="rmiss">Missing ' + o.miss.length + ": " + esc(o.miss.join(", ")) + "</span>" : '<span class="rok">&#10003; All in</span>'; }
function listBtn(o, key, big) {
  var on = ST.list[o.id], n = o.miss.length;
  return '<button type="button" class="btn sm' + (on ? " on" : "") + '" data-act="list" data-r="' + o.id + '" data-f="list-' + key + o.id + '" aria-pressed="' + !!on + '" aria-label="' + (on ? "On the list, tap to take off: " : "Add " + n + " to the shopping list: ") + esc(o.r.n) + '">' + sv(on ? "tick" : "cart", 16) + (on ? "On the list" : big ? "Add " + n + " to list" : "Add " + n) + "</button>";
}
function openAttr(o) { return ' data-act="open" data-name="' + esc(o.r.n) + '"'; }
function nearRow(o, key, big) {
  return '<div class="nrow"><button type="button" class="hrow"' + openAttr(o) + ' data-f="open-' + key + o.id + '"><span class="e s" aria-hidden="true">' + o.r.e + '</span><span class="t"><b>' + esc(o.r.n) + "</b><small>" + missText(o) + " &middot; " + o.r.m + " min</small></span></button>" + listBtn(o, key, big) + "</div>";
}
function ideaRow(o, key) {
  var plan = '<button type="button" class="btn sm" data-act="plan" data-name="' + esc(o.r.n) + '" data-f="plan-' + key + o.id + '">Plan</button>';
  return '<div class="ir"><button type="button" class="hrow"' + openAttr(o) + ' data-f="open-' + key + o.id + '"><span class="e s" aria-hidden="true">' + o.r.e + '</span><span class="t"><b>' + esc(o.r.n) + "</b><small>" + missText(o) + " &middot; " + o.r.m + " min</small></span></button>" + (o.miss.length ? listBtn(o, key) : "") + plan + "</div>";
}
function leadHtml(sc, L, f, key, lensOn) {
  var pl = sc.planned, o = L.fits[0];
  if (pl) return '<div class="lead hl"><span class="e" aria-hidden="true">' + pl.e + '</span><span class="t"><span class="k planned">Planned today</span><b>' + esc(pl.n) + "</b><small>" + esc(pl.note) + '</small></span><button type="button" class="btn pri" data-act="cook" data-name="' + esc(pl.n) + '" data-f="cook-' + key + '">Make it</button><button type="button" class="btn" data-act="plan" data-name="' + esc(pl.n) + '" data-f="plan-' + key + '">Plan</button></div>';
  return '<div class="lead hl"><span class="e" aria-hidden="true">' + o.r.e + '</span><span class="t"><span class="k">Tonight' + (lensOn ? " &middot; leaning " + esc(lensName(lensOn).toLowerCase()) : "") + "</span><b>" + esc(o.r.n) + "</b><small>" + (o.miss.length ? "Missing " + o.miss.length + ": " + esc(o.miss.join(", ")) : "&#10003; All in") + " &middot; " + o.r.m + " min" + (o.r.why ? " &middot; " + esc(o.r.why) : "") + '</small></span><button type="button" class="btn pri" data-act="cook" data-name="' + esc(o.r.n) + '" data-f="cook-' + key + '">Make it</button><button type="button" class="btn" data-act="plan" data-name="' + esc(o.r.n) + '" data-f="plan-' + key + '">Plan</button></div>';
}
var lensName = function (k) { return LENS.filter(function (l) { return l[0] === k; })[0][1]; };
function plainChips() { return '<div class="lean" role="group" aria-label="Tune ideas">' + LENS.map(function (l) { return "<span>" + l[1] + "</span>"; }).join("") + "</div>"; }
function lensRow(sc, L, key, f) {
  var pool = L.fits.length ? L.fits : (f.near ? L.near : []);
  var cur = ST.lens[key] || "";
  var h = '<div class="lean lens" role="group" aria-label="Lean tonight\'s ideas towards">' + LENS.map(function (l) {
    var n = pool.filter(function (o) { return o.r.t.indexOf(l[0]) > -1; }).length;
    return '<button type="button" data-act="lens" data-key="' + key + '" data-l="' + l[0] + '" data-f="lens-' + key + l[0] + '" aria-pressed="' + (cur === l[0]) + '"' + (n ? "" : ' class="zero" aria-disabled="true" title="Nothing tonight to lean this way"') + ">" + l[1] + " <i>" + n + "</i></button>";
  }).join("");
  if (f.eco && L.blocked.length && L.fits.length) h += '<button type="button" class="rblock" data-act="why" data-key="' + key + '" data-f="why-' + key + '" aria-expanded="' + !!ST.why[key] + '">' + sv("ban", 14) + L.blocked.length + " left out</button>";
  return h + "</div>";
}
/* the reason nothing fits: today one sentence for two different problems; split, each group says who can fix it */
function reasons(sc, L, f, key) {
  var h = '<div class="rsn">', nb = L.blocked.length, nn = L.near.length;
  if (nn) h += '<div class="rg">' + sv("cart") + '<div class="t"><b>' + nn + (nn === 1 ? " recipe needs" : " recipes need") + " 3 or more things</b><small>A shop would fix this.</small></div></div>";
  if (nb) {
    var open = !f.eco || ST.why[key];
    h += '<div class="rg">' + sv("ban") + '<div class="t"><b>' + nb + (nb === 1 ? " recipe" : " recipes") + " left out for " + esc(people(L.blocked)) + "</b><small>Shopping cannot fix this. " + esc(whoWhat(L.blocked).join(", ")) + "." + (f.eco ? ' <button type="button" class="lk" data-act="why" data-key="' + key + '" data-f="which-' + key + '" aria-expanded="' + !!open + '">' + (open ? "Hide" : "Which ones?") + "</button>" : "") + "</small>" +
      (open ? "<ul>" + L.blocked.map(function (o) { return "<li><b>" + esc(o.r.n) + "</b> &middot; blocked for " + esc(o.block.map(function (b) { return b[0] + " (" + b[1] + ")"; }).join(", ")) + "</li>"; }).join("") + "</ul>" : "") + '</div><button type="button" class="btn lnk sm" data-act="eaters" data-f="eat-' + key + '">Change who is eating</button></div>';
  }
  return h + "</div>";
}
function trayHtml(sc, key) {
  var t = ST.tray[key]; if (!t) return "";
  var ids = t === "soon" ? sc.soon : sc.low;
  var rows = ids.map(function (id) {
    var it = ITEMS[id], on = ST.low[id];
    return '<div class="or"><span class="e s" aria-hidden="true">' + it[0] + '</span><span class="t"><b>' + it[1] + "</b><small>" + it[2] + "</small></span>" +
      (t === "low" ? '<button type="button" class="btn sm' + (on ? " on" : "") + '" data-act="low" data-id="' + id + '" data-f="low-' + key + id + '" aria-pressed="' + !!on + '">' + sv(on ? "tick" : "cart", 16) + (on ? "On the list" : "Add to list") + "</button>" : "") + "</div>";
  }).join("");
  var foot = t === "low" ? '<div class="tf"><button type="button" class="btn sm" data-act="lowall" data-f="lowall-' + key + '">' + sv("cart", 16) + "Add both to the list</button></div>" : '<div class="tf"><button type="button" class="btn lnk sm" data-act="pantry" data-f="pan-' + key + '">Open in the Pantry</button></div>';
  return '<div class="tray" role="region" aria-label="' + (t === "soon" ? "Going off" : "Running low") + '">' + rows + foot + "</div>";
}
function stripHtml(sc, L, f, key) {
  if (!f.strip) {
    return '<div class="glance">' + (sc.soon.length ? '<a href="#" data-act="glance">' + sc.soon.length + " going off</a>" : "") + '<a href="#" data-act="glance">' + sc.low.length + ' running low</a><a href="#" data-act="glance">' + (sc.planned ? "Today planned" : "Nothing planned today") + "</a></div>";
  }
  var h = '<div class="glance">', pill = function (t, label) { var on = ST.tray[key] === t; return '<button type="button" class="gp" data-act="tray" data-key="' + key + '" data-t="' + t + '" data-f="tray-' + key + t + '" aria-expanded="' + on + '">' + label + sv("down", 14) + "</button>"; };
  if (sc.soon.length) h += pill("soon", sc.soon.length + " going off");
  h += pill("low", sc.low.length + " running low");
  var top = !sc.planned && !L.fits.length ? L.near[0] : null;
  if (top) h += '<button type="button" class="gp hot" data-act="plantonight" data-name="' + esc(top.r.n) + '" data-id="' + top.id + '" data-f="pt-' + key + '" title="Plans ' + esc(top.r.n) + " for tonight and adds the " + top.miss.length + ' missing things to the list">' + (ST.plan === top.id ? sv("tick", 14) + '<span class="tx">Planned: <b>' : sv("cal", 14) + '<span class="tx">Plan tonight: <b>') + esc(top.r.n) + "</b></span></button>";
  h += '<button type="button" class="gp ghost" data-act="ahead" data-f="ahead-' + key + '">Plan ahead</button>' + trayHtml(sc, key) + "</div>";
  return h;
}
function emptyHtml(sc, L, f, key) {
  var title = "Nothing fits tonight" + (f.split ? "" : " from what is in");
  var body = f.split ? reasons(sc, L, f, key) : "<p>Every recipe needs three or more things you do not have, or is left out for someone eating.</p>";
  var acts = f.strip ? "" : '<div class="row"><button type="button" class="btn" data-act="ahead" data-f="ahead-' + key + '">Plan ahead</button></div>';
  if (f.eco) return '<div class="empt"><span class="big" aria-hidden="true">🤔</span><div class="eb"><b>' + title + "</b>" + body + "</div></div>";
  return '<div class="empt"><span class="big" aria-hidden="true">🤔</span><b>' + title + "</b>" + body + acts + "</div>";
}
function nearBlock(sc, L, f, key) {
  var rows = "";
  if (sc.freezer) rows += '<div class="nrow"><button type="button" class="hrow" data-act="open" data-name="' + esc(sc.freezer.n) + '" data-f="fz-' + key + '"><span class="e s" aria-hidden="true">' + sv("snow", 20) + '</span><span class="t"><b>From the freezer: ' + esc(sc.freezer.n) + "</b><small>" + sc.freezer.p + ' &middot; reheat 10 min</small></span></button><button type="button" class="btn sm" data-act="eat" data-name="' + esc(sc.freezer.n) + '" data-f="eat-fz-' + key + '">Have it tonight</button></div>';
  rows += L.near.slice(0, 3).map(function (o) { return nearRow(o, key, !f.eco); }).join("");
  if (!rows) return "";
  return '<div class="sh2">Closest to cooking</div><div class="rows">' + rows + "</div>";
}

/* ---- one Compact column: every option is this, with flags ---- */
function compactBody(sc, f, key) {
  var lens = f.lens ? (ST.lens[key] || "") : "", L = rank(sc, lens);
  var fitsAny = !!(sc.planned || L.fits.length), h = '<div class="compact' + (f.eco ? " eco" : "") + '"><h2 class="ask">What are we eating?</h2>';
  if (!f.lens) h += plainChips();
  if (fitsAny) {
    h += leadHtml(sc, L, f, key, lens);
    if (f.lens) {
      var rest = sc.planned ? L.fits.slice(0, 2) : L.fits.slice(1, 3);
      if (rest.length) h += (sc.planned ? '<div class="sh2">If plans change</div>' : "") + '<div class="rows">' + rest.map(function (o) { return ideaRow(o, key); }).join("") + "</div>";
      h += lensRow(sc, L, key, f);
      if (f.eco && ST.why[key] && L.blocked.length) h += reasons(sc, { near: [], blocked: L.blocked }, f, key);
    }
  } else {
    h += emptyHtml(sc, L, f, key);
    if (f.near) h += nearBlock(sc, L, f, key);
    if (f.lens) h += lensRow(sc, L, key, f);
    if (f.eco) h += '<button type="button" class="btn lnk sm" data-act="askai" data-f="ai-' + key + '" title="Opens your AI app. The only hand-off on this screen.">' + sv("spark", 16) + "Ask AI</button>";
  }
  return h + stripHtml(sc, L, f, key) + "</div>";
}

/* ---- Dashboard (option F): the cards of the Dashboard in the mockups, rows and a This week gutter. No toggle. ---- */
function dashBody(sc, f, key) {
  var L = rank(sc, ""), dense = ST.dense;
  var ideas = '<div class="th"><h2>Cooking ideas</h2><button type="button" data-act="tune" data-f="tune">Tune ideas</button><a href="#" data-act="glance">See all</a></div>';
  if (sc.planned) {
    ideas += '<div class="lead hl"><button type="button" class="hrow" data-act="open" data-name="' + esc(sc.planned.n) + '" data-f="dl"><span class="e" aria-hidden="true">' + sc.planned.e + '</span><span class="t"><small class="k planned">Planned for today &middot; Mon 12</small><b>' + esc(sc.planned.n) + "</b><small>" + esc(sc.planned.note) + '</small></span></button><button type="button" class="btn sm" data-act="plan" data-name="' + esc(sc.planned.n) + '" data-f="dp">Plan</button></div><div class="sh2">If plans change</div><div class="rows">' + L.fits.slice(0, 2).map(function (o) { return ideaRow(o, key); }).join("") + "</div>";
  } else if (L.fits.length) {
    var o = L.fits[0];
    ideas += '<div class="lead hl"><button type="button" class="hrow" data-act="open" data-name="' + esc(o.r.n) + '" data-f="dl"><span class="e" aria-hidden="true">' + o.r.e + '</span><span class="t"><small class="k">Tonight</small><b>' + esc(o.r.n) + "</b><small>" + (o.miss.length ? "Missing " + o.miss.length : "&#10003; All in") + " &middot; " + o.r.m + " min &middot; " + esc(o.r.why) + '</small></span></button><button type="button" class="btn sm" data-act="plan" data-name="' + esc(o.r.n) + '" data-f="dp">Plan</button></div><div class="sh2">Other ideas</div><div class="rows">' + L.fits.slice(1, 3).map(function (x) { return ideaRow(x, key); }).join("") + "</div>";
  } else {
    var fe = Object.create(f); fe.eco = 1;
    ideas += '<div class="empt"><span class="big" aria-hidden="true">🤔</span><div class="eb"><b>Nothing fits tonight</b>' + reasons(sc, L, fe, key) + "</div></div>" + nearBlock(sc, L, f, key);
  }
  var stack = "";
  if (sc.soon.length) stack += '<div class="sh">On the way out</div>' + sc.soon.map(function (id) { return itemRow(id, ITEMS[id][2], true); }).join("");
  stack += '<div class="sh">Running low</div>' + sc.low.map(function (id) { return itemRow(id, "Running low", false); }).join("");
  var wk = ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"], pl = { 1: "Lamb curry", 2: "Not cooking", 4: "Egg fried rice" };
  if (sc.planned) pl[0] = sc.planned.n;
  var week = '<aside class="week" aria-label="This week"><h2>This week</h2><p>Live from the plan</p>' + wk.map(function (d, i) { return '<div class="wd' + (i === 0 ? " now" : "") + (pl[i] ? " set" : "") + '"><b>' + d + "</b><span>" + (pl[i] || "Nothing planned") + "</span></div>"; }).join("") + "</aside>";
  return { main: '<div class="col"><section class="card" aria-label="Cooking ideas">' + ideas + '</section><section class="card" aria-label="Going off and running low">' + stack + "</section></div>", week: week };
}
function itemRow(id, pill, hot) { var it = ITEMS[id]; return '<div class="or"><button type="button" class="hrow" data-act="open" data-name="' + it[1] + '" data-f="it-' + id + '"><span class="e s" aria-hidden="true">' + it[0] + '</span><span class="t"><b>' + it[1] + '</b></span><span class="pl' + (hot ? " hot" : "") + '">' + pill + "</span></button></div>"; }

/* ---- frames ---- */
function frame(o) {
  var sc = SC[ST.s], key = o.id, h;
  if (o.f.dash) {
    var d = dashBody(sc, o.f, key);
    h = '<div class="desk dash' + (ST.dense ? " dense" : "") + '" data-frame="' + key + '">' + railHtml() + '<div class="main">' + topbar(false) + d.main + "</div>" + d.week + "</div>";
  } else h = '<div class="desk" data-frame="' + key + '">' + railHtml() + '<div class="main">' + topbar(true) + compactBody(sc, o.f, key) + "</div></div>";
  var cap = '<figcaption><span class="fh"><b>' + o.id + " &middot; " + o.name + "</b>" + (o.rec ? '<span class="badge">recommended</span>' : "") + "</span><span>" + o.sub + "</span>" +
    (o.f.dash ? '<button type="button" class="mockctl" data-act="dense" aria-pressed="' + ST.dense + '" data-f="dense">Settings &gt; Compact rows: ' + (ST.dense ? "on" : "off") + "</button>" : "") + "</figcaption>";
  return '<figure class="dw" id="opt-' + o.id + '" aria-labelledby="cap-' + o.id + '">' + cap.replace("<figcaption>", '<figcaption id="cap-' + o.id + '">') + h + "</figure>";
}
function draw() {
  var ae = document.activeElement, fid = ae && ae.dataset ? ae.dataset.f : "";
  $("#frames").innerHTML = OPTS.filter(function (o) { return !ST.only || o.id === ST.only; }).map(frame).join("");
  $$("#stateSw button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.s === ST.s); });
  $$("#nav a").forEach(function (a) { a.classList.toggle("on", a.dataset.o === ST.only); });
  if (fid) { var n = $('[data-f="' + fid + '"]'); if (n) n.focus({ preventScroll: true }); }
  var u = new URL(location.href); u.searchParams.set("s", ST.s); history.replaceState(null, "", u);
}
var tt;
function toast(t) { var el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2600); }
function cur() { return SC[ST.s]; }
function missOf(id) { var r = cur().recipes.filter(function (x) { return x[0] === id; })[0]; return r ? r[1] : []; }

document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-act],[data-s]"); if (!b) return;
  var a = b.dataset.act, d = b.dataset;
  if (d.s && !a) { ST.s = d.s; ST.tray = {}; ST.why = {}; ST.lens = {}; ST.plan = null; draw(); return; }
  if (a === "glance") e.preventDefault();
  if (a === "lens") { if (b.classList.contains("zero")) { toast("Nothing tonight to lean that way, so it stays out of the way."); return; } ST.lens[d.key] = ST.lens[d.key] === d.l ? "" : d.l; draw(); return; }
  if (a === "tray") { ST.tray[d.key] = ST.tray[d.key] === d.t ? "" : d.t; draw(); return; }
  if (a === "why") { ST.why[d.key] = !ST.why[d.key]; draw(); return; }
  if (a === "list") { var m = missOf(d.r); ST.list[d.r] = !ST.list[d.r]; toast(ST.list[d.r] ? "Added " + m.length + " to the shopping list: " + m.join(", ") + "." : "Taken off the shopping list."); draw(); return; }
  if (a === "low") { ST.low[d.id] = !ST.low[d.id]; toast(ST.low[d.id] ? ITEMS[d.id][1] + " added to the shopping list." : "Taken off the shopping list."); draw(); return; }
  if (a === "lowall") { cur().low.forEach(function (id) { ST.low[id] = true; }); toast("Added " + cur().low.length + " running-low items to the shopping list."); draw(); return; }
  if (a === "plantonight") { var on = ST.plan === d.id; ST.plan = on ? null : d.id; var ms = missOf(d.id); toast(on ? "Plan undone." : d.name + " planned for tonight; " + ms.length + " missing things added to the list."); draw(); return; }
  if (a === "dense") { ST.dense = !ST.dense; draw(); return; }
  var say = { open: "Opens " + (d.name || "") + " in the recipe flyout (decision 290).", plan: "Opens the Plan flow for " + (d.name || "") + ".", cook: "Starts cooking " + (d.name || "") + ".", ahead: "Opens Plan ahead: the week, ranked by what is in.", eaters: "Opens Who is eating tonight (Tune ideas, tonight only).", eat: d.name + " goes on tonight's plan from the freezer.", askai: "Opens your AI app. Nothing on this screen calls an AI itself.", pantry: "Opens the Pantry on those items.", glance: "Follows the link to the Pantry or Plan (today's behaviour).", tune: "Tune ideas opens inline, collapsed behind this button." };
  if (say[a]) toast(say[a]);
});
$$("#stateSw button").forEach(function (b) { b.textContent = SC[b.dataset.s].label; });
window.CHO = { ST: ST, SC: SC, rank: rank, draw: draw };
draw();
})();
