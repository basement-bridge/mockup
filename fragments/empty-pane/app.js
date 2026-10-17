/* MOCK: the desktop Pantry and Recipes with the idle pane in the lane (owner, voice, 17 Oct 2026: "what are your design options for that space when something is not picked?").
   Everything the pane shows is worked out here from the rows already on the page, with no request, the way the real pages can (data.js).
   Hooks (query string):  o=a|b|c|d|e|f   (the option; default f, the recommendation)   d=typical|large|empty|calm|nostock (calm = nothing needs attention; nostock is Recipes only)
                          theme=kitchie|kitchie-day   touch=1 (a wide tablet with no keyboard)   ev=quiet (option E keeps the lane, drawn empty)
                          fresh=1 (a first visit: nothing remembered)   open=<row id>   flt=soon|low|out|ready|short|planned|lately   mk=0 (hide the mockup switcher)   lane=1 (the lane alone) */
(function () {
  "use strict";
  var Q = new URLSearchParams(location.search), $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var screen = document.body.dataset.screen || Q.get("s") || "pantry";
  var OPTS = ["a", "b", "c", "d", "e", "f"];
  var S = {
    screen: screen, opt: OPTS.indexOf(Q.get("o")) > -1 ? Q.get("o") : "f", data: Q.get("d") || "typical", touch: Q.get("touch") === "1", quiet: Q.get("ev") === "quiet",
    flt: Q.get("flt") || "", sel: null, loc: "All", chip: "all", q: "", recent: [], laneOnly: Q.get("lane") === "1"
  };
  if (!window.EP_DATA[screen][S.data]) S.data = "typical";
  var ITEMS = window.EP_DATA[screen][S.data];
  var KEY = "ep.recent." + screen, toastT;
  var DET = { sel: null };

  /* ---------- what the person opened last, kept in this browser only (a remembered choice is client-side: owner, 15 Oct 2026) ---------- */
  function seeds() {
    if (S.data === "empty" || Q.get("fresh") === "1" || !ITEMS.length) return [];
    var h = 3600000, ix = screen === "pantry" ? [0, 8, 14] : [0, 4, 7];
    return [ix[0], ix[1], ix[2]].map(function (n, k) { var it = ITEMS[n]; return it && { id: it.id, n: it.n, loc: it.loc || "", at: Date.now() - [2 * h, 26 * h, 80 * h][k] }; }).filter(Boolean);
  }
  function loadRecent() {
    var mem = [];
    try { if (Q.get("fresh") !== "1") mem = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { mem = []; }
    var ids = {}; mem = (mem || []).filter(function (r) { return r && ITEMS.some(function (i) { return i.id === r.id; }) && !ids[r.id] && (ids[r.id] = 1); });
    seeds().forEach(function (r) { if (!ids[r.id]) { mem.push(r); ids[r.id] = 1; } });
    S.recent = mem.slice(0, 5);
  }
  function remember(it) {
    S.recent = [{ id: it.id, n: it.n, loc: it.loc || "", at: Date.now() }].concat(S.recent.filter(function (r) { return r.id !== it.id; })).slice(0, 5);
    try { localStorage.setItem(KEY, JSON.stringify(S.recent.slice(0, 5))); } catch (e) { /* private window: the option still works for this visit */ }
  }

  /* ---------- the list ---------- */
  function visible() {
    var q = S.q.trim().toLowerCase();
    return ITEMS.filter(function (i) {
      if (q && i.n.toLowerCase().indexOf(q) < 0) return false;
      if (screen === "pantry") {
        if (S.flt === "out") return i.lvl === "out";
        if (i.lvl === "out") return false; /* Out items are hidden from the default list */
        if (S.flt === "soon") return i.ub !== null && i.ub <= 7;
        if (S.flt === "low") return i.lvl === "low";
        return S.loc === "All" || i.loc === S.loc;
      }
      if (S.flt === "ready") return i.miss === 0;
      if (S.flt === "short") return i.miss === 1;
      if (S.flt === "planned") return i.planned;
      if (S.flt === "lately") return i.cd !== null && i.cd <= 7;
      if (S.chip === "ready") return i.miss === 0;
      if (S.chip === "star") return i.star;
      if (S.chip === "quick") return i.min <= 30;
      return true;
    });
  }
  var FLT_LABEL = { soon: "Use soon", low: "Running low", out: "Out", ready: "Ready now", short: "One thing short", planned: "Planned this week", lately: "Cooked lately" };
  function rowPantry(i) {
    var d = i.ub === null ? "" : i.ub <= 7 ? '<span class="due soon">' + esc(window.EP_STATS.when(i.ub)) + "</span>" : "";
    return '<li><button type="button" class="rowx' + (DET.sel === i.id ? " sel" : "") + '" data-row="' + esc(i.id) + '"><span><span class="name">' + esc(i.n.toLowerCase()) + '</span><span class="meta">' + esc(i.loc + " · " + i.qty) + "</span></span>" + d + "</button></li>";
  }
  function rowRecipe(i) {
    var pills = (i.miss === 0 ? '<span class="tg ok">All in</span>' : typeof i.miss === "number" ? '<span class="tg">' + i.miss + " missing</span>" : "") + (i.planned ? '<span class="tg acc">Planned</span>' : "") + (i.star ? '<span class="tg acc">★</span>' : "");
    return '<li><button type="button" class="rowx' + (DET.sel === i.id ? " sel" : "") + '" data-row="' + esc(i.id) + '"><span class="th">' + window.EP_STATS.ico("chef") + '</span><span><span class="name">' + esc(i.n) + '</span><span class="meta">' + esc(i.min + " min · serves " + i.serves + " · cooked " + (i.cd === null ? "not yet" : window.EP_STATS.cooked(i.cd))) + '</span><span class="pills">' + pills + "</span></span></button></li>";
  }
  function listHtml() {
    var v = visible();
    if (!ITEMS.length) return screen === "pantry" ? '<div class="empty-list"><p><b>Nothing here yet.</b></p></div>' : '<div class="empty-list"><p><b>Nothing here.</b></p></div>';
    if (!v.length) return '<div class="empty-list"><p>Nothing matches.</p></div>';
    if (screen === "recipes") {
      var rank = v.slice().sort(function (a, b) { var known = ITEMS[0].miss !== null; return (known ? a.miss - b.miss : 0) || (a.cd === null ? 1e9 : a.cd) - (b.cd === null ? 1e9 : b.cd) || a.n.localeCompare(b.n); });
      return '<ul class="rows">' + rank.map(rowRecipe).join("") + "</ul>";
    }
    if (S.flt) return '<ul class="rows">' + v.slice().sort(function (a, b) { return (a.ub === null ? 1e9 : a.ub) - (b.ub === null ? 1e9 : b.ub) || a.n.localeCompare(b.n); }).map(rowPantry).join("") + "</ul>";
    var places = []; v.forEach(function (i) { if (places.indexOf(i.loc) < 0) places.push(i.loc); });
    return places.map(function (p) { return '<section class="group"><h2>' + esc(p) + '</h2><ul class="rows">' + v.filter(function (i) { return i.loc === p; }).sort(function (a, b) { return a.n.localeCompare(b.n); }).map(rowPantry).join("") + "</ul></section>"; }).join("");
  }
  function ribbonHtml() {
    if (screen === "pantry") {
      var places = ["All"]; ITEMS.forEach(function (i) { if (i.lvl !== "out" && places.indexOf(i.loc) < 0) places.push(i.loc); });
      if (!ITEMS.length) return "";
      return '<div class="ribbon" role="group" aria-label="Location">' + places.slice(0, 7).map(function (p) { return '<button type="button" class="rc2' + (S.loc === p && !S.flt ? " on" : "") + '" data-loc="' + esc(p) + '">' + esc(p) + "</button>"; }).join("") + "</div>";
    }
    return '<div class="ribbon" role="group" aria-label="Show">' + [["all", "All"], ["ready", "Ready now"], ["star", "Starred"], ["quick", "Under 30"]].map(function (c) { return '<button type="button" class="rc2' + (S.chip === c[0] && !S.flt ? " on" : "") + '" data-chip="' + c[0] + '">' + c[1] + "</button>"; }).join("") + "</div>";
  }

  /* ---------- the lane ---------- */
  function detailHtml(i) {
    var close = '<button type="button" class="x" data-act="close" aria-label="Close" title="Close (' + window.EP_STATS.close + ')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    if (screen === "pantry") {
      var n = { out: 0, low: 1, some: 2, plenty: 3 }[i.lvl];
      return '<div class="det"><header><h3>' + esc(i.n) + "</h3>" + close + '</header><dl><dt>Level</dt><dd><span class="lvl ' + (i.lvl === "low" ? "low" : "") + '"><i class="' + (n > 0 ? "on" : "") + '"></i><i class="' + (n > 1 ? "on" : "") + '"></i><i class="' + (n > 2 ? "on" : "") + '"></i></span>' + esc({ out: "Out", low: "Running low", some: "Some", plenty: "Plenty" }[i.lvl]) + "</dd><dt>Quantity</dt><dd>" + esc(i.qty) + "</dd><dt>Where</dt><dd>" + esc(i.loc) + "</dd><dt>Use by</dt><dd>" + (i.ub === null ? "Not set" : esc(window.EP_STATS.when(i.ub))) + '</dd></dl><div class="btns"><button type="button" class="pri" data-act="stub">Used up</button><button type="button" data-act="stub">Add to shopping list</button></div><p class="cap">The existing item flyout, drawn small. Close it and the idle pane comes back.</p></div>';
    }
    return '<div class="det"><header><h3>' + esc(i.n) + "</h3>" + close + '</header><div class="banner" aria-hidden="true"></div><dl><dt>Time</dt><dd>' + i.min + " min</dd><dt>Serves</dt><dd>" + i.serves + "</dd><dt>Pantry</dt><dd>" + (i.miss === null ? "Cannot be read now" : i.miss === 0 ? "All in" : i.miss + " missing") + "</dd><dt>Cooked</dt><dd>" + esc(i.cd === null ? "Not yet" : window.EP_STATS.cooked(i.cd)) + '</dd></dl><div class="btns"><button type="button" class="pri" data-act="stub">Cook now</button><button type="button" data-act="stub">Plan</button><button type="button" data-act="stub">Open full recipe</button></div><p class="cap">The existing recipe flyout, drawn small. Close it and the idle pane comes back.</p></div>';
  }
  function paneHtml() {
    return window.EP_PANE({ screen: screen, opt: S.opt, data: S.data, items: ITEMS, cap: S.data === "large" ? 3 : 3, touch: S.touch, recent: S.recent });
  }
  function drawLane() {
    var lane = $("lane"), app = $("app"); if (!lane) return;
    var it = DET.sel && ITEMS.filter(function (x) { return x.id === DET.sel; })[0];
    var none = S.opt === "e" && !S.quiet && !it;
    app.dataset.lane = none ? "none" : (S.opt === "e" && S.quiet && !it) ? "quiet" : "on";
    lane.hidden = none;
    lane.innerHTML = it ? detailHtml(it) : paneHtml();
    lane.setAttribute("aria-label", it ? (screen === "pantry" ? "Item" : "Recipe") : "Nothing picked");
  }
  function drawList() {
    var el = $("list"); if (!el) return;
    el.innerHTML = listHtml();
    $("strip").innerHTML = S.flt ? '<span>Showing <b>' + esc(FLT_LABEL[S.flt]) + "</b> · " + visible().length + '</span><button type="button" data-act="clearflt">Show everything</button>' : "";
    $("strip").hidden = !S.flt;
    $("count").textContent = ITEMS.length ? visible().length + (screen === "pantry" ? " items" : " recipes") : "";
    var r = $("ribbon"); if (r) r.innerHTML = ribbonHtml();
  }
  function toast(t) { var el = $("toast"); if (!el) return; el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 2600); }
  function pick(id) {
    var it = ITEMS.filter(function (x) { return x.id === id; })[0]; if (!it) return;
    DET.sel = id; remember(it); drawList(); drawLane();
    var row = document.querySelector('[data-row="' + id + '"]'); if (row && row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
  }
  function close() { if (!DET.sel) return; var id = DET.sel; DET.sel = null; drawList(); drawLane(); var r = document.querySelector('[data-row="' + id + '"]'); if (r) r.focus(); }
  var STUB = {
    add: "Add opens the add panel in this lane (unchanged).", scan: "Scan a receipt opens from the Add panel. The reading code loads only now, not before.",
    assistant: "Opens your AI app (unchanged).", plan: "Opens the Plan it flyout (unchanged).", review: "Opens the review page (unchanged).", stub: "Unchanged, not drawn here."
  };

  /* ---------- build the page ---------- */
  function build() {
    var nvIcons = {
      Home: '<path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-3.5v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19.5z"/>', Pantry: '<path d="M7 7.5h10a2 2 0 0 1 2 2V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V9.5a2 2 0 0 1 2-2z"/>',
      Plan: '<path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.5V7M16 3.5V7"/>', Recipes: '<path d="M7 14.5a3.5 3.5 0 1 1 1.5-6.7 4 4 0 0 1 7 0A3.5 3.5 0 1 1 17 14.5V19H7zM7 17h10"/>', Shopping: '<path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2"/>'
    };
    var rail = '<nav class="rail" aria-label="Main"><div class="brand">Kitchie</div>' + ["Home", "Pantry", "Plan", "Recipes", "Shopping"].map(function (n) {
      var on = (screen === "pantry" && n === "Pantry") || (screen === "recipes" && n === "Recipes");
      return '<a class="nv' + (on ? " on" : "") + '" href="#"' + (on ? ' aria-current="page"' : "") + ' aria-label="' + n + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + nvIcons[n] + "</svg>" + n + "</a>";
    }).join("") + "</nav>";
    var hd = '<div class="hd"><form class="dsrch" role="search" action="#"><span class="mg" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg></span><input class="field" id="q" type="search" placeholder="' + (screen === "pantry" ? "Search pantry" : "Search recipes or ingredients") + '" aria-label="Search" autocomplete="off"></form>' +
      (screen === "pantry" ? '<button type="button" class="tbtn" id="filters-open">Filters</button><button type="button" class="icon addbtn" data-act="add" aria-label="Add an item" title="Add an item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>' : "") + "</div>";
    var main = '<main class="main"><div class="col">' + hd + '<div id="ribbon"></div><div id="strip" class="strip" hidden></div><div id="count" class="count"></div><div id="list"></div></div></main>';
    var mk = Q.get("mk") === "0" ? "" : mockBar();
    $("app").innerHTML = rail + main + '<aside class="lane" id="lane" aria-label="Nothing picked"></aside>';
    $("app").insertAdjacentHTML("afterend", '<div class="toast" id="toast" role="status" hidden></div>' + mk);
  }
  function link(p, label, on) { var u = new URLSearchParams(Q); for (var k in p) { if (p[k] === null) u.delete(k); else u.set(k, p[k]); } return '<a href="?' + u.toString() + '"' + (on ? ' aria-current="true"' : "") + ">" + label + "</a>"; }
  function mockBar() {
    var other = screen === "pantry" ? "recipes.html" : "pantry.html", u = new URLSearchParams(Q); u.delete("open"); u.delete("flt");
    return '<div class="mk" aria-label="Mockup only"><b>Mockup only</b>' + OPTS.map(function (o) { return link({ o: o, open: null, flt: null }, o === "f" ? "F★" : o.toUpperCase(), S.opt === o); }).join("") +
      '<span aria-hidden="true">|</span>' + ["empty", "typical", "large", "calm"].concat(screen === "recipes" ? ["nostock"] : []).map(function (d) { return link({ d: d, open: null, flt: null }, d, S.data === d); }).join("") +
      '<span aria-hidden="true">|</span>' + link({ touch: S.touch ? null : "1" }, S.touch ? "touch on" : "touch off", S.touch) + '<a href="' + other + "?" + u.toString() + '">' + (screen === "pantry" ? "Recipes" : "Pantry") + "</a></div>";
  }

  function onClick(e) {
    var t = e.target.closest && e.target.closest("[data-row],[data-act],[data-loc],[data-chip]"); if (!t) return;
    if (t.dataset.row) { pick(t.dataset.row); return; }
    if (t.dataset.loc) { S.loc = t.dataset.loc; S.flt = ""; drawList(); return; }
    if (t.dataset.chip) { S.chip = t.dataset.chip; S.flt = ""; drawList(); return; }
    var a = t.dataset.act;
    if (a === "open") pick(t.dataset.id);
    else if (a === "close") close();
    else if (a === "clearflt") { S.flt = ""; drawList(); }
    else if (a === "filter" || a === "chip") { DET.sel = null; S.flt = t.dataset.f; drawList(); drawLane(); toast("Applies the same filter as Home's tiles: " + FLT_LABEL[t.dataset.f] + "."); }
    else if (a === "search") { var q = $("q"); if (q) { q.focus(); q.select(); } }
    else if (STUB[a]) toast(STUB[a]);
  }
  function onKey(e) {
    var typing = e.target && e.target.closest && e.target.closest("input,textarea,select");
    if ((e.ctrlKey || e.metaKey) && (e.key === "Escape" || e.key === "Enter")) { close(); e.preventDefault(); return; }
    if (typing) { if (e.key === "Escape" && e.target.id === "q") { e.target.value = ""; S.q = ""; drawList(); } return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "/") { var q = $("q"); if (q) { e.preventDefault(); q.focus(); q.select(); } }
    else if (e.key === "j" || e.key === "k" || e.key === "ArrowDown" || e.key === "ArrowUp") {
      var rows = [].slice.call(document.querySelectorAll("[data-row]")); if (!rows.length) return;
      var i = rows.findIndex(function (r) { return r.dataset.row === DET.sel; }), d = (e.key === "j" || e.key === "ArrowDown") ? 1 : -1;
      e.preventDefault(); pick(rows[Math.max(0, Math.min(rows.length - 1, i < 0 ? (d > 0 ? 0 : rows.length - 1) : i + d))].dataset.row);
    } else if (e.key === "?") toast("The shortcuts list opens (unchanged).");
  }
  function init() {
    if (S.laneOnly) {
      document.body.classList.add("lane-only");
      $("app").innerHTML = '<aside class="lane" id="lane"></aside>'; $("app").dataset.lane = "on"; loadRecent(); drawLane(); return;
    }
    build(); loadRecent(); drawList();
    if (Q.get("open")) { DET.sel = Q.get("open"); }
    drawList(); drawLane();
    $("app").addEventListener("click", onClick); document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    $("q").addEventListener("input", function () { S.q = $("q").value; drawList(); });
    $("q").closest("form").addEventListener("submit", function (e) { e.preventDefault(); });
  }
  window.EP_APP = { state: S };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
