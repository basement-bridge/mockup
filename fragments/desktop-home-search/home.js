/* Desktop Home, search first. DEFAULT PATH: draws idle Home (the settled Dashboard, no toggle) and wires the search field.
   Nothing about search results is here: search.js (+ search.css) is fetched on the first focus or keystroke, flyout.js on the first result picked.
   Mockup only; nothing is saved or fetched from a server. Sample names are invented. */
(function () {
"use strict";
var Q = new URLSearchParams(location.search);
var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");

/* ---- what Home already has (idle): tonight's lead, other ideas, going off, running low, the week ---- */
var D = {
  lead: { id: "traybake", n: "Lemon chicken traybake", e: "🍋", note: "45 min", why: "uses the chicken thighs going off tomorrow" },
  others: [{ id: "curry", n: "Chickpea and spinach curry", e: "🍛", sub: "All in · 30 min · uses the spinach" }, { id: "salad", n: "Cucumber and spring onion salad", e: "🥗", sub: "All in · 10 min · uses the cucumbers" }],
  soon: [["thighs", "🍗", "Chicken thighs", "Tomorrow"], ["cuc", "🥒", "Cucumbers", "Tomorrow"], ["spinach", "🥬", "Spinach", "In 2 days"]],
  low: [["limes", "🍋", "Limes", "1 left"], ["pb", "🥜", "Crunchy peanut butter", "a little left"]],
  week: ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"], plan: { 1: "Not cooking", 3: "Chicken laksa", 4: "Egg fried rice" }
};
var S = { active: 0, suppress: false, dismissed: false };
var ST = { planned: Q.get("tonight") === "planned", q: Q.get("q") || "", recede: Q.get("recede") === "collapse" ? "collapse" : "dim", searching: false };

var IC = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
function rail() { return '<nav class="rail" id="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div><span class="nv on" aria-current="page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>Home</span><span class="nv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14v12H5zM8 8V5h8v3"/></svg>Pantry</span><span class="nv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/></svg>Recipes</span><span class="nv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg>Shopping</span></nav>'; }
function itemRow(r, hot) { return '<div class="or"><button type="button" class="hrow" data-open="item" data-id="' + r[0] + '"><span class="e s" aria-hidden="true">' + r[1] + '</span><span class="t"><b>' + r[2] + '</b></span><span class="pl' + (hot ? " hot" : "") + '">' + r[3] + "</span></button></div>"; }
function cards() {
  var L = D.lead, pl = ST.planned;
  var lead = '<div class="lead"><button type="button" class="hrow" data-open="recipe" data-id="' + L.id + '"><span class="e" aria-hidden="true">' + L.e + '</span><span class="t"><small class="k' + (pl ? " planned" : "") + '">' + (pl ? "Planned for today &middot; Mon 12" : "Tonight") + "</small><b>" + L.n + "</b><small>&#10003; All in &middot; " + L.note + " &middot; " + (pl ? "on the plan, nothing to decide" : L.why) + '</small></span></button><span class="acts"><button type="button" class="btn pri" data-say="Starts cooking ' + L.n + '.">Make it</button><button type="button" class="btn" data-say="Opens the Plan flow.">Plan</button><button type="button" class="btn lnk" data-say="Why this fits tonight.">Why</button></span></div>';
  var oth = D.others.map(function (o) { return '<div class="ir"><button type="button" class="hrow" data-open="recipe" data-id="' + o.id + '"><span class="e s" aria-hidden="true">' + o.e + '</span><span class="t"><b>' + o.n + "</b><small>" + o.sub + '</small></span></button><button type="button" class="btn sm" data-say="Opens the Plan flow for ' + o.n + '.">Plan</button></div>'; }).join("");
  var ideas = '<section class="card" aria-label="Cooking ideas"><div class="th"><h2>Cooking ideas</h2><button type="button" data-say="Tune ideas opens inline, collapsed behind this button.">Tune ideas</button><a href="#" data-say="Opens all ideas.">See all</a></div>' + lead + '<div class="sh2">Other ideas</div><div class="rows">' + oth + "</div></section>";
  var stack = '<section class="card stack" aria-label="Going off and running low"><div class="sh">On the way out</div>' + D.soon.map(function (r) { return itemRow(r, 1); }).join("") + '<div class="sh">Running low</div>' + D.low.map(function (r) { return itemRow(r, 0); }).join("") + "</section>";
  return ideas + stack;
}
function week() {
  var pl = {}; for (var k in D.plan) pl[k] = D.plan[k]; if (ST.planned) pl[0] = D.lead.n;
  return "<h2>This week</h2><p>Live from the plan</p>" + D.week.map(function (d, i) { return '<div class="wd' + (i === 0 ? " now" : "") + (pl[i] ? " set" : "") + '"><b>' + d + "</b><span>" + (pl[i] || "Nothing planned") + "</span></div>"; }).join("");
}
function draw() {
  $("#deskHost").innerHTML = '<div class="desk' + (ST.recede === "collapse" ? " collapse" : "") + '" id="desk">' + rail() +
    '<div class="main" id="main"><div class="topbar"><div class="sw"><div class="us" id="us">' + IC +
    '<input id="q" type="search" role="combobox" aria-expanded="false" aria-controls="sres" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off" spellcheck="false" placeholder="Search recipes, pantry, shopping or the plan" aria-label="Search recipes, pantry, shopping and the plan"><span class="kbd" aria-hidden="true">/</span></div>' +
    '<div class="sres" id="sres" role="listbox" aria-label="Search results" hidden></div></div></div><div class="cards" id="cards">' + cards() + "</div></div>" +
    '<aside class="week" id="week" aria-label="This week">' + week() + '</aside><aside class="fly" id="fly" hidden></aside><div class="toast" id="toast" role="status" hidden></div></div>';
  wire();
  if (ST.q) { $("#q").value = ST.q; $("#us").classList.add("has"); kick(); }
}

/* ---- lazy loading: search.js + search.css on first focus or keystroke; flyout.js on first pick ---- */
var loaded = {};
function need(file) {
  if (loaded[file]) return loaded[file];
  loaded[file] = new Promise(function (ok) {
    if (/\.css$/.test(file)) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + file; l.onload = ok; l.onerror = ok; document.head.appendChild(l); }
    else { var s = document.createElement("script"); s.src = BASE + file; s.onload = ok; s.onerror = ok; document.head.appendChild(s); }
  });
  return loaded[file];
}
function search() { return Promise.all([need("search.css"), need("search.js")]); }
function kick() { search().then(function () { DHS.update(); }); }

var tt;
function toast(t) { var el = $("#toast"); if (!el) return; el.textContent = t; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2600); }

function wire() {
  var q = $("#q"), desk = $("#desk");
  q.addEventListener("focus", function () { search(); if (!S.suppress) { S.dismissed = false; if (q.value.trim().length >= 2) kick(); } });
  q.addEventListener("blur", function () { S.dismissed = true; DHS.update(); });
  q.addEventListener("input", function () { S.suppress = false; S.dismissed = false; ST.q = q.value; $("#us").classList.toggle("has", !!q.value); kick(); });
  desk.addEventListener("click", function (e) {
    var b = e.target.closest("[data-open],[data-say],.x"); if (!b) { return; }
    if (b.classList.contains("x")) { DHS.closeFly(); return; }
    if (b.dataset.say) { e.preventDefault(); toast(b.dataset.say); return; }
    DHS.pick({ kind: b.dataset.open, id: b.dataset.id, from: "page" });
  });
}

/* keys: / or Ctrl+K focuses; the rest (arrows, Enter, Esc) live in search.js with the list */
document.addEventListener("keydown", function (e) {
  var q = $("#q"); if (!q) return;
  var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
  if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); q.focus(); q.select(); return; }
  if (e.key === "Escape" && e.target === q && !q.value && !e.ctrlKey && !e.metaKey) { q.blur(); return; }
  if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); q.focus(); return; }
});

/* the page: state switch (mockup control, not part of the screen) */
function setQ(v) { ST.q = v; S.suppress = false; S.dismissed = false; var q = $("#q"); if (q) { q.value = v; $("#us").classList.toggle("has", !!v); if (v) q.focus({ preventScroll: true }); else q.blur(); } kick(); }
function syncBar() {
  $$("#stateSw button").forEach(function (b) {
    var d = b.dataset, on = d.q != null ? ST.q === d.q : d.t != null ? (d.t === "planned") === ST.planned : d.r === ST.recede;
    b.setAttribute("aria-pressed", on);
  });
  var u = new URL(location.href); ST.q ? u.searchParams.set("q", ST.q) : u.searchParams.delete("q"); u.searchParams.set("tonight", ST.planned ? "planned" : "open"); u.searchParams.set("recede", ST.recede); history.replaceState(null, "", u);
}
document.addEventListener("click", function (e) {
  var b = e.target.closest("#stateSw button"); if (!b) return; var d = b.dataset;
  if (d.q != null) { DHS.closeFly(); setQ(d.q); }
  else if (d.t != null) { ST.planned = d.t === "planned"; draw(); syncBar(); return; }
  else if (d.r) { ST.recede = d.r; draw(); }
  syncBar();
});

var stub = function (r) { need("flyout.js").then(function () { if (DHS.pick !== stub) DHS.pick(r); }); };
window.DHS = { S: S, ST: ST, D: D, $: $, $$: $$, esc: esc, need: need, toast: toast, syncBar: syncBar, draw: draw, update: function () {}, pick: stub, closeFly: function () {} };
draw(); syncBar();
})();
