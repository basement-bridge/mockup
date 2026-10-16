/* Home with a detail panel (mockup). Shared behaviour for every size and option: no size rules here (the stylesheets decide stack or displace).
   Four ways in, one panel: a search result, a Cooking idea, an item under "On the way out", an item under "Running low".
   The recipe view (recipe.js) and the nested Edit and History (child.js) are fetched on first use, not on page load (DESIGN.md section 6).
   State is in the URL: ?open=item:cucumbers  ?open=recipe:lime-tacos  ?front=week  ?child=edit|history  ?q=lime  ?ideas=ok|loading|unavailable  ?lead=planned (today's planned meal is the lead; default: the top idea)  ?week=empty|planned  ?detail=ok|loading|error  ?opt=a|b|c  ?peek=6 */
(function () {
"use strict";
var D = window.HDP_DATA, Q = new URLSearchParams(location.search), HDP = window.HDP = {};
var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var norm = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
var app = $("#app"), ITEMS = JSON.parse(JSON.stringify(D.items));
var S = HDP.S = { open: Q.get("open") || "", front: Q.get("front") === "week" ? "week" : "detail", child: Q.get("child") || "", lead: Q.get("lead") === "planned" ? "planned" : "idea", view: Q.get("view") === "compact" ? "compact" : "dash", ideas: Q.get("ideas") || "ok", week: Q.get("week") || "empty", detail: Q.get("detail") || "ok", q: Q.get("q") || "", cur: -1, plan: {}, undo: null };
HDP.D = D; HDP.esc = esc; HDP.$ = $; HDP.items = ITEMS;
if (/[?&]embed=1/.test(location.search)) document.body.setAttribute("data-no-theme-fab", "");

/* ---------- icons: the same paths as the item edit flyout ---------- */
var IC = HDP.IC = {
  edit: '<path d="M4 20l1.1-4.2L16.3 4.6a2 2 0 0 1 2.8 0l.3.3a2 2 0 0 1 0 2.8L8.2 18.9z"/><path d="M14.4 6.5l3.1 3.1"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5v4.2h4.2"/><path d="M12 7.8V12l2.8 1.8"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>', basket: '<path d="M4 9h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z"/><path d="M8 9l3-5M16 9l-3-5"/>',
  down: '<path d="M12 4v13M6 12l6 6 6-6"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M6 12h12"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 .98.8h8.8a1 1 0 0 0 1-.8L20 8H6.2"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  pot: '<path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M3 11h18M15 3l-3 8"/>', back: '<path d="M15 6l-6 6 6 6"/>', serves: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.5M17.5 14a5.5 5.5 0 0 1 3 5"/>',
  warn: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.5"/>'
};
var sv = HDP.sv = function (p, sz) { sz = sz || 20; return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" aria-hidden="true" focusable="false">' + p + "</svg>"; };
var BAT = { Plenty: [3, "plenty"], Some: [2, "some"], "Running low": [1, "low"], Out: [0, "out"] }; /* the level icon, three squares (item-edit-flyout decision 133) */
function battery(l, w) {
  var a = BAT[l] || BAT.Out, c = ""; for (var i = 0; i < 3; i++) c += '<rect x="' + (1 + i * 18) + '" y="1" width="14" height="14" rx="3.2" fill="' + (i < a[0] ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8"/>';
  return '<svg class="bat lv-' + a[1] + '" width="' + w + '" height="' + Math.round(w * 16 / 52) + '" viewBox="0 0 52 16" aria-hidden="true" focusable="false">' + c + "</svg>";
}
var kbd = function (c, cls) { return '<kbd class="kbd' + (cls ? " " + cls : "") + '">' + c + "</kbd>"; };
var MAC = /Mac|iPhone|iPad/.test(navigator.platform || ""), MOD = MAC ? "Cmd" : "Ctrl";
HDP.kbd = kbd; HDP.battery = battery; HDP.MOD = MOD;

var item = HDP.item = function (id) { return ITEMS.filter(function (i) { return i.id === id; })[0]; };
var idea = HDP.idea = function (id) { return D.plannedLead.id === id ? D.plannedLead : D.ideas.filter(function (r) { return r.id === id; })[0]; };
/* "meal:<id>" is today's planned meal when it is not a Recipe family (the build's key for it); it opens the same recipe view, so its kind is "recipe" */
/* "fly:<id>" is a recipe SEARCH RESULT: it opens the Recipes summary flyout (flyout.js), not the idea view (decision 288) */
function keyOf(s) { var p = s.split(":"); return { kind: p[0] === "meal" ? "recipe" : p[0], id: p[1] }; }
function qtyOf(it) { return it.level === "Out" ? "Out" : it.qty; }

/* ---------- the page: Cooking ideas, On the way out, Running low ---------- */
function itemRow(id, withPill) {
  var it = item(id), k = "item:" + id;
  return '<div class="or"><button type="button" class="hrow' + (S.open === k ? " sel" : "") + '" data-open="' + k + '"' + (S.open === k ? ' aria-current="true"' : "") + '><span class="e s" aria-hidden="true">' + it.emoji + '</span><span class="t"><b>' + esc(it.name) + '</b></span>' + (it.pill ? '<span class="pl' + (it.hot ? " hot" : "") + '">' + esc(it.pill) + "</span>" : "") + "</button></div>";
}
function drawIdeas() {
  if (S.view === "compact") { drawCompact(); return; }
  $("#ideas").className = "card";
  var h = '<div class="th"><h2>Cooking ideas</h2><a href="#" data-act="seeall">See all</a></div>';
  if (S.ideas === "loading") h += '<div class="sk a" aria-hidden="true"></div><div class="sk b" aria-hidden="true"></div><div class="sk b" aria-hidden="true"></div><p class="sr-only" role="status">Loading ideas</p>';
  else if (S.ideas === "unavailable") h += '<div class="away" role="status"><span class="e" aria-hidden="true">🍳</span><div><b>Ideas are not available right now</b><span>Your pantry and plan are fine. Try again in a moment.</span></div><button type="button" class="btn sm" data-act="retryideas">Try again</button></div>';
  else {
    var A = D.ideas, pl = S.lead === "planned", lead = pl ? D.plannedLead : A[0], rest = pl ? A.slice(0, 2) : A.slice(1), lk = (pl ? "meal:" : "recipe:") + lead.id;
    if (pl) h += '<div class="lead hl" data-lead="planned"><button type="button" class="hrow' + (S.open === lk ? " sel" : "") + '" data-open="' + lk + '"' + (S.open === lk ? ' aria-current="true"' : "") + '><span class="e" aria-hidden="true">' + lead.emoji + '</span><span class="t"><small class="k planned">Planned for today &middot; Mon 12</small><b>' + esc(lead.name) + '</b><span class="why">' + esc(lead.why) + '</span></span></button><button type="button" class="btn sm" data-act="planlink">Plan</button></div><div class="sh2">Other ideas</div>';
    else h += '<div class="lead hl"><button type="button" class="hrow' + (S.open === lk ? " sel" : "") + '" data-open="' + lk + '"' + (S.open === lk ? ' aria-current="true"' : "") + '><span class="e" aria-hidden="true">' + lead.emoji + '</span><span class="t"><small class="k">Tonight &middot; leaning quick</small><b>' + esc(lead.name) + '</b><span class="why">' + miss(lead) + " &middot; " + lead.mins + " min &middot; " + esc(lead.why) + '</span></span></button><button type="button" class="btn sm" data-act="quickplan" data-id="' + lead.id + '">Plan</button></div><div class="sh2">Other ideas</div>';
    h += rest.map(function (r) { var k = "recipe:" + r.id; return '<div class="ir"><button type="button" class="hrow' + (S.open === k ? " sel" : "") + '" data-open="' + k + '"' + (S.open === k ? ' aria-current="true"' : "") + '><span class="e s" aria-hidden="true">' + r.emoji + '</span><span class="t"><b>' + esc(r.name) + "</b><small>" + miss(r) + " &middot; " + r.mins + " min &middot; " + esc(r.why) + '</small></span></button><button type="button" class="btn sm" data-act="quickplan" data-id="' + r.id + '">Plan</button></div>'; }).join("");
  }
  $("#ideas").innerHTML = h;
}
/* Compact view (the build's desktop-home Compact): ask first, the lean chips, the lead idea, a glance row. No stack card, no This week, no detail panel (133). Drawn here only so the flyout has a page to sit beside (290). */
function drawCompact() {
  var A = D.ideas, pl = S.lead === "planned", lead = pl ? D.plannedLead : A[0];
  var h = '<h2 class="ask">What are we eating?</h2><div class="lean" role="group" aria-label="Tune ideas"><span>Quick</span><span>Use up</span><span>Something new</span><span>Comfort</span></div>';
  h += '<div class="lead hl"><span class="e" aria-hidden="true">' + lead.emoji + '</span><span class="t"><span class="k' + (pl ? " planned" : "") + '">' + (pl ? "Planned today" : "Tonight") + "</span><b>" + esc(lead.name) + "</b><small>" + miss(lead).replace(/<[^>]+>/g, "") + (lead.mins ? " \u00b7 " + lead.mins + " min" : "") + '</small></span><a class="btn pri" href="#" data-act="cook">Cook now</a><a class="btn" href="#" data-act="planlink">Plan</a></div>';
  h += '<div class="glance"><a href="#" data-act="glance">' + D.soon.length + ' going off</a><a href="#" data-act="glance">' + D.low.length + ' running low</a><a href="#" data-act="glance">' + (mealsOn(0).length ? "Today planned" : "Nothing planned today") + "</a></div>";
  var el = $("#ideas"); el.className = "compact"; el.innerHTML = h;
}
function miss(r) { var n = r.lines.filter(function (l) { return l.s === "miss"; }).length; return n ? '<span class="rmiss">' + n + " missing</span>" : '<span class="rok">&#10003; All in</span>'; }
HDP.missText = miss;
function drawSoon() {
  $("#soon").innerHTML = '<div class="sh">On the way out</div>' + D.soon.map(itemRow).join("") + '<div class="sh">Running low</div>' + D.low.map(itemRow).join("");
}
/* the meals on a day: the household plan and the viewer's own plan show plainly; someone else's individual plan carries that person's initial (decision 154) */
function mealsOn(i) { return (S.week === "planned" && D.planned[i] ? D.planned[i] : []).concat(S.plan[i] || []); }
function other(m) { return m.who && m.who !== "me" && D.people[m.who] ? D.people[m.who] : null; }
function chip(p) { return ' (<span class="av" title="' + esc(p.name) + '\'s plan">' + esc(p.initial) + "</span>)"; }
function drawWeek() {
  var days = D.days.map(function (d, i) {
    var ms = mealsOn(i), v = ms.map(function (m) { var o = other(m); return esc(m.name) + (o ? chip(o) : ""); }).join(", ");
    return '<button type="button" class="wd' + (i === 0 ? " now" : "") + (v ? " set" : "") + '" data-act="day" data-i="' + i + '"><b>' + d + "</b><span>" + (v || "Nothing planned") + "</span></button>";
  }).join("");
  $("#week").innerHTML = '<h2>This week</h2><p class="sub">Live from the plan</p><div>' + days + '</div><p class="pn">Tap a day to open the plan.</p>';
}

/* ---------- search ---------- */
function results(q) {
  q = norm(q.trim()); if (!q) return { items: [], ideas: [] };
  return { items: ITEMS.filter(function (i) { return norm(i.name).indexOf(q) > -1; }), ideas: D.ideas.filter(function (r) { return norm(r.name).indexOf(q) > -1; }) };
}
var flat = [];
function drawSearch() {
  var box = $("#sres"), q = $("#q"), r = results(S.q); flat = [];
  if (!S.q.trim() || document.activeElement !== q && !HDP.forceSearch) { box.hidden = true; q.setAttribute("aria-expanded", "false"); return; }
  var h = "";
  if (r.items.length) { h += '<div class="g">Pantry</div>'; r.items.forEach(function (i) { flat.push("item:" + i.id); h += '<button type="button" class="i" role="option" data-open="item:' + i.id + '" data-from="search"><span class="e s" aria-hidden="true">' + i.emoji + "</span><b>" + esc(i.name) + "</b><small>" + esc((qtyOf(i) ? qtyOf(i) + " \u00b7 " : "") + i.area) + "</small></button>"; }); }
  if (r.ideas.length) { h += '<div class="g">Recipes</div>'; r.ideas.forEach(function (i) { flat.push("fly:" + i.id); h += '<button type="button" class="i" role="option" data-open="fly:' + i.id + '" data-from="search"><span class="e s" aria-hidden="true">' + i.emoji + "</span><b>" + esc(i.name) + "</b><small>" + miss(i).replace(/<[^>]+>/g, "") + "</small></button>"; }); }
  if (!flat.length) h = '<div class="none">Nothing in your pantry or recipes matches &ldquo;' + esc(S.q.trim()) + "&rdquo;.</div>";
  box.innerHTML = h; box.hidden = false; q.setAttribute("aria-expanded", "true");
  if (S.cur >= flat.length) S.cur = flat.length - 1;
  $$(".i", box).forEach(function (b, n) { b.classList.toggle("cur", n === S.cur); });
}

/* ---------- the detail panel ---------- */
function ib(act, label, icon, key, on) {
  return '<button type="button" class="ib' + (on ? " on" : "") + '" data-act="' + act + '" aria-label="' + label + '"' + (on ? ' aria-expanded="true"' : "") + ' title="' + label + (key ? " (" + key + ")" : "") + '">' + sv(icon, 20) + (key ? kbd(key, "cap") : "") + "</button>";
}
HDP.ib = ib;
function closeBtn() { return '<button type="button" class="x ib" data-act="close" aria-label="Close" title="Close (' + MOD + ' Esc)">' + sv(IC.x, 20) + "</button>"; }
HDP.closeBtn = closeBtn;
function tile(ic, val, cap, prompt, sr) {
  return val === null ? '<button type="button" class="tl empty" data-act="tile">' + sv(IC.plus, 20) + "<span>" + prompt + "</span></button>" : '<button type="button" class="tl" data-act="tile"' + (sr ? ' aria-label="' + esc(sr) + '"' : "") + ">" + ic + (val === "" ? "" : "<b>" + val + "</b>") + (cap ? "<span>" + cap + "</span>" : "") + "</button>";
}
/* "Used in": only ideas actually planned in the rolling next 7 days (today and the six days after), weekday first then the recipe, never a date. A rolling week cannot hold two of the same weekday.
   Same day, more than one meal: grouped under the one weekday, "Tuesday, prawn curry (J), lamb curry" (decision 155, proposal). Days are joined by a middle dot, in day order.
   A meal on the household plan or the viewer's own plan is plain; one on someone else's individual plan carries their initial in brackets (decision 154). None planned: no line. */
var DAYNAME = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
function usedIn(it) {
  var out = [];
  D.days.forEach(function (d, i) {
    var hit = mealsOn(i).filter(function (m) { var u = D.planUses[m.name]; return u && u.indexOf(it.id) > -1; });
    if (hit.length) out.push(esc(DAYNAME[d.split(" ")[0]]) + ", " + hit.map(function (m) { var o = other(m); return esc(m.name.charAt(0).toLowerCase() + m.name.slice(1)) + (o ? chip(o) : ""); }).join(", "));
  });
  return out.length ? '<p class="usedin" id="d-usedin"><b>Used in:</b> ' + out.join(" \u00b7 ") + "</p>" : "";
}
HDP.usedIn = usedIn;
function itemHtml(it) {
  var out = it.level === "Out", sp = it.spot && it.spot !== "Anywhere" ? " &middot; " + esc(it.spot) : "";
  var head = '<div class="top shead" id="d-head"><button type="button" class="ph" data-act="edit" aria-label="Emoji ' + it.emoji + '. Change it in Edit" title="Change the emoji (in Edit)">' + it.emoji + '</button><div class="sid"><h2 class="nm2" id="d-title" tabindex="-1" title="' + esc(it.name) + '">' + esc(it.name) + "</h2>" + (qtyOf(it) ? '<span class="shq">' + esc(qtyOf(it)) + "</span>" : "") + '<span class="shw"><b>' + esc(it.area) + "</b>" + sp + "</span>" + (it.list !== null ? '<span class="onl">On your list</span>' : "") + '</div><div class="hacts" role="group" aria-label="Item actions">' + ib("edit", "Edit item", IC.edit, "E", S.child === "edit") + ib("history", "History", IC.history, ",", S.child === "history") + closeBtn() + "</div></div>";
  var d = it.days, t = [];
  t.push(tile(battery(it.level, 48), "", "", "", "Level, " + it.level + ". Opens the edit flyout"));
  t.push(tile(sv(IC.clock, 20), it.days === null ? null : d === 0 ? "Today" : d === 1 ? "1D" : d < 7 ? d + "D" : it.useLabel, "Use by", "Add use-by", it.days === null ? "" : "Use by, " + it.useLabel));
  t.push(tile(sv(IC.down, 20), it.min ? esc(it.min + (it.unit && it.unit !== "bunch" ? " " + it.unit : "")) : null, "Minimum", "Add minimum"));
  t.push(it.cat ? tile(sv(IC.basket, 20), esc(it.cat), "", "", "Category, " + it.cat) : tile("", null, "", "Add category"));
  var buy = (it.level === "Running low" || out) ? '<div class="sbuyw"><div class="sbuy"><span class="ef-l" id="d-buyl">How much to buy</span><div class="ef-row"><div class="ef-step" role="group" aria-labelledby="d-buyl"><button type="button" aria-label="Buy less" data-act="buyless">' + sv(IC.minus, 20) + '</button><input class="ef-num" id="d-buy" inputmode="decimal" value="' + (it.buy || 1) + '" aria-label="How much to buy" autocomplete="off"><button type="button" aria-label="Buy more" data-act="buymore">' + sv(IC.plus, 20) + "</button></div>" + (it.unit ? '<span class="ef-unit">' + esc(it.unit) + "</span>" : "") + '</div><p class="ef-note">Starts from what you have.</p></div></div>' : "";
  var acts = (out ? '<button type="button" class="btn ghost" disabled>' + sv(IC.tick) + "<span>Marked Out</span></button>" : '<button type="button" class="btn ghost" data-act="usedup">' + sv(IC.tick) + "<span>Used up</span>" + kbd("D") + "</button>")
    + (it.list !== null ? '<button type="button" class="btn ghost" disabled>' + sv(IC.tick) + "<span>On your list</span></button>" : '<button type="button" class="btn pri" data-act="shop">' + sv(IC.cart) + "<span>Add to shopping</span>" + kbd("S") + "</button>");
  var hint = '<p class="phint hint">' + (it.counted ? kbd("U") + " use one " : "") + kbd("D") + " used up " + kbd("S") + " shopping list " + kbd("E") + " edit " + kbd(",") + " history</p>";
  return head + '<div class="tiles tiles4">' + t.join("") + "</div>" + buy + '<div class="sacts">' + acts + "</div>" + usedIn(it) + hint + '<div id="d-child"></div>';
}
function skeleton() {
  return '<div class="top shead"><span class="ph sk" style="border:0"></span><div class="sid"><span class="sk" style="height:20px;width:70%"></span><span class="sk" style="height:14px;width:40%;margin-top:8px"></span></div><div class="hacts">' + closeBtn() + '</div></div><div class="tiles tiles4"><span class="sk" style="height:72px"></span><span class="sk" style="height:72px"></span><span class="sk" style="height:72px"></span><span class="sk" style="height:72px"></span></div><span class="sk" style="height:48px"></span><span class="sk" style="height:48px"></span><p class="sr-only" role="status">Loading</p>';
}
function errorHtml(label) {
  return '<div class="top shead"><div class="sid"><h2 class="nm2" id="d-title" tabindex="-1">' + esc(label) + '</h2></div><div class="hacts">' + closeBtn() + '</div></div><div class="away" role="alert"><span class="e" aria-hidden="true">' + sv(IC.warn, 26) + '</span><div><b>Could not load this right now</b><span>Nothing was changed.</span></div></div><button type="button" class="btn pri" data-act="retry">Try again</button>';
}
var panelKey = "";
function drawDetail(opts) {
  var d = $("#detail"), k = S.open, o = opts || {};
  if (!k) { d.hidden = true; d.innerHTML = ""; app.dataset.open = "none"; app.dataset.front = "detail"; panelKey = ""; return; }
  var K = keyOf(k), kind = K.kind;
  app.dataset.open = kind; app.dataset.front = S.front; d.hidden = false;
  d.setAttribute("aria-label", kind === "fly" ? "Recipe summary" : kind === "recipe" ? "Idea" : "Item");
  var fresh = panelKey !== k; panelKey = k;
  if (S.detail === "loading") { d.innerHTML = skeleton(); return; }
  if (S.detail === "error") { d.className = "panel detail"; d.innerHTML = errorHtml(kind === "item" ? (item(K.id) || {}).name : (idea(K.id) || {}).name); return; }
  if (kind === "fly") {
    d.className = "panel detail";
    if (window.HDP.flyHtml) { d.className = "panel detail rbhost"; d.innerHTML = window.HDP.flyHtml(idea(K.id)); }
    else { d.innerHTML = skeleton(); load("flyout.js", function () { if (S.open === k && window.HDP.flyHtml) drawDetail(); }); }
  }
  else if (kind === "item") { d.innerHTML = itemHtml(item(K.id)); d.className = "panel detail" + (S.child ? " hasChild" : ""); drawChild(); }
  else {
    d.className = "panel detail";
    if (window.HDP.recipeHtml) d.innerHTML = window.HDP.recipeHtml(idea(K.id));
    else { d.innerHTML = skeleton(); load("recipe.js", function () { if (S.open === k && window.HDP.recipeHtml) drawDetail(); }); } /* never redraw while the view is still not defined: load() calls back at once for a script already loaded, which would recurse forever */
  }
  if (fresh) d.scrollTop = 0;
}
var loaded = {};
function load(src, cb) {
  if (loaded[src] === true) return cb();
  if (loaded[src]) return loaded[src].push(cb);
  loaded[src] = [cb]; var s = document.createElement("script"); s.src = src;
  s.onload = function () { var q = loaded[src]; loaded[src] = true; q.forEach(function (f) { f(); }); }; document.head.appendChild(s);
}
HDP.load = load;
function drawChild() {
  var h = $("#d-child"); if (!h) return;
  if (!S.child) { h.innerHTML = ""; return; }
  var it = item(keyOf(S.open).id);
  if (window.HDP.childHtml) { h.innerHTML = window.HDP.childHtml(S.child, it); return; }
  h.innerHTML = '<div class="child"><span class="sk a" aria-hidden="true"></span></div>';
  load("child.js", function () { if (S.child) drawChild(); });
}

/* ---------- state changes ---------- */
function sync() {
  var u = new URL(location.href), p = u.searchParams;
  function set(k, v, d) { if (v && v !== d) p.set(k, v); else p.delete(k); }
  set("open", S.open); set("front", S.front, "detail"); set("child", S.child); set("view", S.view, "dash"); app.dataset.view = S.view; $$(".seg button").forEach(function (b) { var on = b.dataset.v === S.view; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
  try { history.replaceState(null, "", u.pathname + (p.toString() ? "?" + p.toString() : "") + u.hash); } catch (e) {}
  mode();
  var pk = $("#peek"), t = S.front === "week" ? (S.open ? $("#d-title") && $("#d-title").textContent || "the panel" : "") : "This week";
  pk.setAttribute("aria-label", S.front === "week" ? "Show " + t : "Show This week"); pk.title = (S.front === "week" ? "Show " + t : "Show This week") + " (W)";
}
function mode() {
  var m = window.innerWidth >= window.HDP_BP ? "displace" : "stack";
  app.dataset.mode = m; app.dataset.opt = window.HDP_OPT;
  if (window.parent !== window) window.parent.postMessage({ hdp: "state", mode: m, w: window.innerWidth, open: S.open, front: S.front, opt: window.HDP_OPT, bp: window.HDP_BP === Infinity ? 0 : window.HDP_BP }, "*");
}
function drawAll() { drawIdeas(); drawSoon(); drawWeek(); drawDetail(); sync(); }
function open(k, o) {
  o = o || {}; if (!k) return;
  var K = keyOf(k); if (K.kind === "item" ? !item(K.id) : !idea(K.id)) return;
  /* Compact has no gutter and no detail panel (decision 133, unchanged); only a recipe search result gets the flyout there (290). Everything else follows its link, as the build does. */
  if (S.view === "compact" && K.kind !== "fly") { closeSearch(); toast(K.kind === "item" ? "Opens the item in the Pantry (not drawn here)." : "Opens the recipe in the Recipes tab (not drawn here)."); return; }
  if (S.open !== k) S.child = "";
  S.open = k; S.front = "detail"; closeSearch();
  drawIdeas(); drawSoon(); drawDetail(); sync();
  if (o.focusRow) { var r = $('[data-open="' + k + '"]', $("#main")); if (r) r.focus({ preventScroll: true }); }
  if (o.focusPanel) { var t = $("#d-title"); if (t) t.focus({ preventScroll: true }); }
}
function close() {
  if (!S.open) return; var was = S.open; S.open = ""; S.child = ""; S.front = "detail";
  drawIdeas(); drawSoon(); drawDetail(); sync();
  if (keyOf(was).kind === "fly") { HDP.quiet = true; $("#q").focus({ preventScroll: true }); HDP.quiet = false; }
  else { var r = $('[data-open="' + was + '"]', $("#main")); if (r) r.focus({ preventScroll: true }); }   /* a search result is not a row: focus goes back to the box, and the list does not reopen (291) */
}
function front(f) { if (!S.open) return; if (app.dataset.mode === "displace") return; S.front = f || (S.front === "week" ? "detail" : "week"); app.dataset.front = S.front; sync(); }
function closeSearch() { var q = $("#q"); HDP.forceSearch = false; $("#sres").hidden = true; q.setAttribute("aria-expanded", "false"); S.cur = -1; }
HDP.open = open; HDP.close = close; HDP.front = front; HDP.redraw = drawAll;
HDP.set = function (o) { Object.keys(o).forEach(function (k) { S[k] = o[k]; }); drawAll(); };
HDP.search = function (v) { var q = $("#q"); q.value = v; S.q = v; HDP.forceSearch = !!v; S.cur = -1; drawSearch(); };
HDP.drawChild = drawChild;

/* ---------- actions ---------- */
function toast(msg, undo) {
  var t = $(".toast"); if (t) t.remove();
  t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
  t.innerHTML = "<span>" + msg + "</span>" + (undo ? '<button type="button" data-act="undo">Undo ' + kbd("Z") + "</button>" : "");
  document.body.appendChild(t); S.undo = undo || null; clearTimeout(toast.t); toast.t = setTimeout(function () { if (t.parentNode) t.remove(); }, 6000);
}
HDP.toast = toast;
function cur() { var K = keyOf(S.open || ":"); return K.kind === "item" ? item(K.id) : null; }
function pulse() { var p = $("#peek"); if (app.dataset.mode === "stack" && S.front === "detail" && S.open) { p.classList.remove("pulse"); void p.offsetWidth; p.classList.add("pulse"); } }
function planIdea(r) {
  var i = 0; while (i < 7 && mealsOn(i).length) i++;
  if (i > 6) { toast("The week is full. Open the plan to swap a day."); return; }
  S.plan[i] = [{ name: r.name, who: "" }]; D.planUses[r.name] = r.uses; drawWeek(); if (cur()) drawDetail(); pulse(); toast(esc(r.name) + " is on the plan for " + D.days[i] + ".", function () { delete S.plan[i]; drawWeek(); });
}
HDP.planIdea = planIdea;
function act(a, el) {
  var it = cur(), K = keyOf(S.open || ":");
  if (a === "close") close();
  else if (a === "view") { S.view = el.dataset.v === "compact" ? "compact" : "dash"; if (S.view === "compact" && S.open && keyOf(S.open).kind !== "fly") { S.open = ""; S.child = ""; } drawAll(); }
  else if (a === "glance") toast("Opens that list (not drawn here).");
  else if (a === "cook") toast("Opens Cook now for this recipe (not drawn here).");
  else if (a === "peek") front();
  else if (a === "edit" || a === "history") { if (!it) return; S.child = S.child === a ? "" : a; drawDetail(); sync(); var b = S.child ? $('#ief-child [data-act="childback"]') : $('[data-act="' + a + '"].ib'); if (b) b.focus({ preventScroll: true }); }
  else if (a === "childback") { var was = S.child; S.child = ""; drawDetail(); sync(); var r = $('[data-act="' + was + '"].ib'); if (r) r.focus({ preventScroll: true }); }
  else if (a === "usedup") { if (!it || it.level === "Out") return; var s = JSON.stringify(it); it.level = "Out"; it.qty = ""; it.amount = 0; it.pill = "Out"; if (D.low.indexOf(it.id) < 0) D.low.push(it.id); drawIdeas(); drawSoon(); drawDetail(); toast(esc(it.name) + " is marked Out.", function () { Object.assign(it, JSON.parse(s)); drawIdeas(); drawSoon(); drawDetail(); }); }
  else if (a === "shop") { if (!it || it.list !== null) return; var l0 = it.list; it.list = 1; drawDetail(); toast(esc(it.name) + " is on your shopping list.", function () { it.list = l0; drawDetail(); }); }
  else if (a === "useone") { if (!it || !it.counted || !(it.amount > 0)) return; it.amount -= 1; it.qty = it.amount ? String(it.amount) : ""; if (!it.amount) it.level = "Out"; drawSoon(); drawDetail(); toast(esc(it.name) + ": " + (it.amount || "Out") + " left."); }
  else if (a === "buymore" || a === "buyless") { if (!it) return; it.buy = Math.max(1, (it.buy || 1) + (a === "buymore" ? 1 : -1)); var inp = $("#d-buy"); if (inp) inp.value = it.buy; }
  else if (a === "tile") { if (it) { S.child = "edit"; drawDetail(); sync(); } }
  else if (a === "retry") { S.detail = "ok"; drawDetail(); }
  else if (a === "retryideas") { S.ideas = "ok"; drawIdeas(); }
  else if (a === "seeall" || a === "day") toast(a === "day" ? "Opens the plan for " + D.days[+el.dataset.i] + " (not drawn here)." : "Opens all ideas in Recipes (not drawn here).");
  else if (a === "quickplan") planIdea(idea(el.dataset.id));
  else if (a === "plan" || a === "planned") { if (K.kind === "recipe") { var pr = idea(K.id); if (pr.planned) toast(esc(pr.name) + " is already on the plan for today."); else planIdea(pr); } }
  else if (a === "planlink") toast("Opens the Plan it sheet (not drawn here).");
  else if (a === "openrecipe") toast("Opens the recipe in the Recipes tab (not drawn here).");
  else if (a === "addmissing") { var r = K.kind === "recipe" ? idea(K.id) : null; if (r) { var m = r.lines.filter(function (x) { return x.s === "miss"; }).length; if (m) { r.added = true; drawDetail(); toast(m + " missing " + (m === 1 ? "item is" : "items are") + " on your shopping list.", function () { r.added = false; drawDetail(); }); } } }
  else if (a === "addline") { var r2 = idea(K.id); var ln = r2.lines[+el.dataset.n]; ln.added = true; drawDetail(); toast(esc(ln.n) + " is on your shopping list.", function () { ln.added = false; drawDetail(); }); }
  else if (a === "undo") { if (S.undo) { var u = S.undo; S.undo = null; u(); var t = $(".toast"); if (t) t.remove(); } }
  else if (a === "help") help(true);
}
document.addEventListener("click", function (e) {
  var o = e.target.closest("[data-open]:not(.app)");
  if (o) { e.preventDefault(); var fromSearch = o.dataset.from === "search"; open(o.dataset.open, { focusRow: false }); if (fromSearch) { var q = $("#q"); q.blur(); } return; }
  var a = e.target.closest("[data-act]"); if (a) { e.preventDefault(); act(a.dataset.act, a); return; }
  var c = e.target.closest("[data-chip]"); if (c) { open(c.dataset.chip, { focusPanel: true }); return; }
  if (!e.target.closest("#sres,.us")) closeSearch();
});
/* a result is chosen on press, so the box losing focus cannot swallow the click */
$("#sres").addEventListener("mousedown", function (e) { e.preventDefault(); });

/* ---------- the search box ---------- */
var qin = $("#q");
qin.addEventListener("input", function () { S.q = qin.value; S.cur = -1; HDP.forceSearch = false; drawSearch(); });
qin.addEventListener("focus", function () { if (!HDP.quiet) drawSearch(); });
qin.addEventListener("blur", function () { setTimeout(function () { if (document.activeElement !== qin && !HDP.forceSearch) closeSearch(); }, 120); });
qin.addEventListener("keydown", function (e) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") { if (!flat.length) return; e.preventDefault(); S.cur = (S.cur + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % flat.length; drawSearch(); }
  else if (e.key === "Enter" && !(e.ctrlKey || e.metaKey)) { var k = flat[S.cur >= 0 ? S.cur : 0]; if (k) { e.preventDefault(); open(k); qin.blur(); } }
  else if (e.key === "Escape" && !(e.ctrlKey || e.metaKey)) { if (S.q && !$("#sres").hidden) { closeSearch(); } else { qin.value = ""; S.q = ""; qin.blur(); } }
});

/* ---------- keyboard (the item edit flyout's keys; close is Ctrl or Cmd plus Esc; plain Esc closes nothing) ---------- */
function rows() { return $$("#main .hrow"); }
function move(d) {
  var r = rows(), keys = r.map(function (b) { return b.dataset.open; }), i = keys.indexOf(S.open);
  var n = i < 0 ? (d > 0 ? 0 : keys.length - 1) : Math.max(0, Math.min(keys.length - 1, i + d));
  open(keys[n], { focusRow: true }); var b = $('[data-open="' + keys[n] + '"]', $("#main")); if (b) b.scrollIntoView({ block: "nearest" });
}
var HELP = [["/", "Search"], ["↑ ↓  or  J K", "Move through the rows and open each one"], ["M", "Back to the first row in the column"], ["E", "Edit the item (opens under the header)"], [",", "History of the item"], ["U  D  S", "Use one, Used up, Add to shopping (items)"], ["P  O  S", "Add to plan, Open recipe, Add the missing to the list (ideas)"], ["W", "Bring This week forward, or the panel back (when stacked)"], ["Z", "Undo"], [MOD + " Esc", "Close the panel (plain Esc stays for leaving full screen and closes nothing)"], ["?  or  H", "This list"]];
function help(on) {
  var k = $("#kb"); if (!on) { k.hidden = true; return; }
  k.innerHTML = '<div class="kbc"><div class="kbh"><h2>Shortcuts on Home</h2><button type="button" class="x ib" id="kbx" aria-label="Close the list">' + sv(IC.x, 20) + "</button></div>" + HELP.map(function (r) { return '<div class="kbr"><span class="kk">' + r[0].split(/\s{2}or\s{2}|\s{2}/).map(function (x) { return "<kbd>" + esc(x) + "</kbd>"; }).join(" ") + "</span><span>" + r[1] + "</span></div>"; }).join("") + "</div>";
  k.hidden = false; $("#kbx").onclick = function () { help(false); }; $("#kbx").focus();
}
document.addEventListener("keydown", function (e) {
  var t = e.target, typing = t.closest && t.closest("input,textarea,select,[contenteditable]");
  if (e.key === "Escape" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (!$("#kb").hidden) help(false); else close(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (typing) return;
  if (!$("#kb").hidden) { if (e.key === "?" || e.key.toLowerCase() === "h") { e.preventDefault(); help(false); } return; }
  var k = e.key, kl = k.length === 1 ? k.toLowerCase() : k;
  if (k === "?" || kl === "h") { e.preventDefault(); help(true); }
  else if (k === "/") { e.preventDefault(); qin.focus(); }
  else if (k === "ArrowDown" || kl === "j") { e.preventDefault(); move(1); }
  else if (k === "ArrowUp" || kl === "k") { e.preventDefault(); move(-1); }
  else if (kl === "m") { e.preventDefault(); var f = rows()[0]; if (f) f.focus(); }
  else if (kl === "w") { e.preventDefault(); front(); }
  else if (kl === "z") { e.preventDefault(); act("undo"); }
  else if (!S.open) return;
  else if (keyOf(S.open).kind === "item") {
    if (kl === "e") { e.preventDefault(); act("edit"); } else if (k === ",") { e.preventDefault(); act("history"); }
    else if (kl === "u") { e.preventDefault(); act("useone"); } else if (kl === "d") { e.preventDefault(); act("usedup"); } else if (kl === "s") { e.preventDefault(); act("shop"); }
  } else if (keyOf(S.open).kind === "fly") {
    if (kl === "o") { e.preventDefault(); act("openrecipe"); }
  } else {
    if (kl === "p") { e.preventDefault(); act("plan"); } else if (kl === "o") { e.preventDefault(); act("openrecipe"); } else if (kl === "s") { e.preventDefault(); act("addmissing"); }
  }
});
addEventListener("resize", function () { mode(); });

drawAll();
if (S.q) { qin.value = S.q; if (Q.get("sres") === "1") HDP.search(S.q); }
if (window.parent !== window) window.parent.postMessage({ hdp: "ready" }, "*");
})();
