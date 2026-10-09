/* Desktop Filters dialog, three options (A centred, B two-pane, C live preview). Static sample data, no storage, no libraries.
   Owner, 9 October 2026: Filters on desktop is a screen-blocking window; give a few ideas. Statuses combine with OR, groups with AND (as the phone sheet).
   URL for review: ?opt=a|b|c  &open=1  &place=lane  &mode=toggle  &pre=1 (starts with a few filters chosen) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var Q = new URLSearchParams(location.search);
  var MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
  var MOD = MAC ? "⌘" : "Ctrl";

  /* ---------- sample data: name, place, category, use-by days (null = none), added hours ago, level percent ---------- */
  var LOCN = { P: "Pantry", F: "Fridge", Z: "Freezer", L: "Laundry" };
  var RAW = [
    ["Garam masala", "P", "Spices++", null, 900, 55], ["Turmeric", "P", "Spices++", null, 1500, 70], ["Cumin seeds", "P", "Spices++", null, 1200, 20], ["Smoked paprika", "P", "Spices++", null, 300, 80],
    ["Chilli flakes", "P", "Spices++", null, 2000, 15], ["Black pepper", "P", "Spices++", null, 700, 90], ["Cinnamon sticks", "P", "Spices++", null, 1800, 60], ["Curry leaves", "Z", "Spices++", 40, 100, 50],
    ["Basmati rice", "P", "Carbs", null, 800, 85], ["Spaghetti", "P", "Carbs", null, 400, 40], ["Penne", "P", "Carbs", null, 450, 65], ["Plain flour", "P", "Carbs", null, 1100, 30],
    ["Rolled oats", "P", "Carbs", null, 200, 22], ["Sourdough loaf", "P", "Carbs", 4, 5, 90], ["Tortillas", "F", "Carbs", 12, 60, 75], ["Naan bread", "Z", "Carbs", 60, 140, 50],
    ["Red lentils", "P", "Carbs", null, 1000, 45], ["Bulk rice 10 kg", "L", "Carbs", null, 2200, 95], ["Spare pasta", "L", "Carbs", null, 2100, 100],
    ["Carrots", "F", "Veggies", 9, 90, 70], ["Spinach", "F", "Veggies", 1, 20, 25], ["Onions", "P", "Veggies", 21, 160, 60], ["Garlic", "P", "Veggies", 30, 240, 80], ["Potatoes", "P", "Veggies", 25, 100, 50],
    ["Broccoli", "F", "Veggies", 5, 50, 100], ["Capsicum", "F", "Veggies", 6, 3, 100], ["Frozen peas", "Z", "Veggies", 120, 600, 35], ["Frozen corn", "Z", "Veggies", 120, 620, 18], ["Cherry tomatoes", "F", "Veggies", 4, 30, 40],
    ["Zucchini", "F", "Veggies", 7, 70, 60], ["Ginger", "F", "Veggies", 16, 150, 50],
    ["Soy sauce", "P", "Condiments", null, 1400, 60], ["Tomato sauce", "F", "Condiments", 90, 500, 45], ["Mayonnaise", "F", "Condiments", 45, 300, 30], ["Dijon mustard", "F", "Condiments", 120, 800, 70],
    ["Olive oil", "P", "Condiments", null, 600, 24], ["Honey", "P", "Condiments", null, 1900, 55], ["Peanut butter", "P", "Condiments", null, 350, 60], ["Sriracha", "F", "Condiments", 200, 900, 80], ["Apple cider vinegar", "P", "Condiments", null, 1300, 90],
    ["Chicken thighs", "F", "Protein", 2, 8, 100], ["Chicken breast", "Z", "Protein", 80, 200, 60], ["Beef mince", "Z", "Protein", 70, 260, 15], ["Salmon fillets", "Z", "Protein", 60, 100, 50], ["Tofu", "F", "Protein", 5, 40, 100],
    ["Bacon", "F", "Protein", 6, 55, 50], ["Sausages", "Z", "Protein", 90, 330, 66], ["Prawns", "Z", "Protein", 75, 400, 40], ["Lamb chops", "Z", "Protein", 85, 120, 100], ["Tempeh", "F", "Protein", 10, 65, 100],
    ["Butter", "F", "Dairy", 40, 70, 80], ["Cheddar", "F", "Dairy", 28, 130, 55], ["Parmesan", "F", "Dairy", 60, 480, 30], ["Greek yoghurt", "F", "Dairy", 7, 36, 50], ["Cream", "F", "Dairy", 3, 10, 22], ["Feta", "F", "Dairy", 12, 90, 70], ["Sour cream", "F", "Dairy", 9, 150, 40],
    ["Chopped tomatoes", "P", "Cans", null, 500, 75], ["Chickpeas", "P", "Cans", null, 650, 50], ["Black beans", "P", "Cans", null, 700, 20], ["Coconut milk", "P", "Cans", null, 550, 100], ["Tuna", "P", "Cans", null, 1000, 60],
    ["Corn kernels", "P", "Cans", null, 1200, 100], ["Baked beans", "P", "Cans", null, 900, 33], ["Spare chopped tomatoes", "L", "Cans", null, 2100, 100], ["Spare coconut milk", "L", "Cans", null, 2150, 100],
    ["Eggs", "F", "Dairy and eggs", 18, 48, 50], ["Milk", "F", "Dairy and eggs", 0, 60, 18], ["Paneer", "F", "Dairy and eggs", 3, 100, 15], ["Halloumi", "F", "Dairy and eggs", 14, 22, 100], ["Ice cream", "Z", "Dairy and eggs", 150, 500, 40],
    ["Custard", "F", "Dairy and eggs", 5, 80, 55], ["Cottage cheese", "F", "Dairy and eggs", 8, 170, 60], ["Ricotta", "F", "Dairy and eggs", 6, 6, 100], ["Egg whites carton", "F", "Dairy and eggs", 15, 190, 100], ["Lactose-free milk", "F", "Dairy and eggs", 11, 44, 70]
  ];
  var DATA = RAW.map(function (r, i) { return { id: i, name: r[0], loc: LOCN[r[1]], cat: r[2], days: r[3], added: r[4], lvl: r[5] }; });
  var LOCS = ["Pantry", "Freezer", "Fridge", "Laundry"];
  var CATS = ["Spices++", "Carbs", "Veggies", "Condiments", "Protein", "Dairy", "Cans", "Dairy and eggs"];

  /* ---------- statuses (same windows as the phone sheet) ---------- */
  var ST = [
    { k: "low", label: "Running low", opts: [["now", 0]], def: 0, test: function (it) { return it.lvl <= 25; } },
    { k: "soon", label: "Expiring soon", opts: [["in 3 days", 3], ["in 1 week", 7], ["in 2 weeks", 14], ["in 1 month", 30]], def: 1, test: function (it, v) { return it.days !== null && it.days <= v; } },
    { k: "recent", label: "Recently added", opts: [["last 24 hours", 24], ["last 3 days", 72], ["last week", 168]], def: 0, test: function (it, v) { return it.added <= v; } }
  ];
  var STK = {}; ST.forEach(function (s) { STK[s.k] = s; });

  /* ---------- sort ---------- */
  function nullsLast(a, b, f) { return a.days === null && b.days === null ? 0 : a.days === null ? 1 : b.days === null ? -1 : f(a.days, b.days); }
  var SORT = [
    { k: "name", l: "Name", d: ["A to Z", "Z to A"], c: function (a, b, r) { return (r ? -1 : 1) * a.name.localeCompare(b.name); } },
    { k: "loc", l: "Location", d: ["A to Z", "Z to A"], c: function (a, b, r) { return (r ? -1 : 1) * a.loc.localeCompare(b.loc); } },
    { k: "useby", l: "Use by", d: ["Soonest first", "Latest first"], c: function (a, b, r) { return nullsLast(a, b, function (x, y) { return r ? y - x : x - y; }); } },
    { k: "added", l: "Recently added", d: ["Newest first", "Oldest first"], c: function (a, b, r) { return (r ? -1 : 1) * (a.added - b.added); } },
    { k: "qty", l: "Quantity", d: ["Lowest first", "Highest first"], c: function (a, b, r) { return (r ? -1 : 1) * (a.lvl - b.lvl); } }
  ];
  var SORTI = {}; SORT.forEach(function (s, i) { SORTI[s.k] = i; });

  /* ---------- state: draft is what the open dialog edits; applied is what the Pantry behind shows ---------- */
  function blank() { return { st: { low: { on: 0, i: 0 }, soon: { on: 0, i: 1 }, recent: { on: 0, i: 0 } }, locs: [], cats: [], key: "name", dir: 0 }; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function nChosen(f) { return ST.filter(function (s) { return f.st[s.k].on; }).length + f.locs.length + f.cats.length; }
  function dirty(f) { return nChosen(f) > 0 || f.key !== "name" || f.dir !== 0; }
  function pass(it, f, skip) {
    if (skip !== "st") {
      var on = ST.filter(function (s) { return f.st[s.k].on; });
      if (on.length && !on.some(function (s) { return s.test(it, s.opts[f.st[s.k].i][1]); })) return false;
    }
    if (skip !== "locs" && f.locs.length && f.locs.indexOf(it.loc) < 0) return false;
    if (skip !== "cats" && f.cats.length && f.cats.indexOf(it.cat) < 0) return false;
    return true;
  }
  function matches(f) {
    var s = SORT[SORTI[f.key]];
    return DATA.filter(function (it) { return pass(it, f); }).sort(function (a, b) { return s.c(a, b, f.dir) || a.name.localeCompare(b.name); });
  }
  var applied = blank(), draft = blank();
  /* "Use last filters" is seeded with a sample so the link can be tried (a real one would remember the previous Show). */
  var last = blank(); last.st.soon.on = 1; last.locs = ["Fridge"]; last.key = "useby";
  if (Q.get("pre") === "1") { draft.st.soon.on = 1; draft.locs = ["Fridge", "Pantry"]; draft.cats = ["Dairy", "Dairy and eggs"]; draft.key = "useby"; }

  /* ---------- prototype settings ---------- */
  var MODE = Q.get("mode") === "toggle" ? "toggle" : "ctrl";     /* plain click: pick one (Ctrl/Cmd-click adds), or toggle (phone) */
  var PLACE = Q.get("place") === "lane" ? "lane" : "centre";     /* option A only */
  var OPT = /^[abc]$/.test(Q.get("opt") || "") ? Q.get("opt") : "a";
  var armed = "status", curSec = "status", isOpen = false, opener = null;

  /* ---------- small helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function svg(p, cls) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : "") + ">" + p + "</svg>"; }
  var P = {
    tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', minus: '<path d="M6 12h12"/>', plus: '<path d="M12 6v12M6 12h12"/>',
    Pantry: '<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',
    Freezer: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5L12 6.5l2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
    Fridge: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10h12M9 6v2M9 13v3"/>',
    Laundry: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M8 6.5h.01M11 6.5h.01"/>',
    dir: '<path d="M12 19V5M6 11l6-6 6 6"/>'
  };
  function kb(n) { return '<kbd class="fx-k" aria-hidden="true">' + n + "</kbd>"; }
  function hk(l) { return '<kbd class="fx-hk" aria-hidden="true">' + l + "</kbd>"; }
  function plural(n) { return n + (n === 1 ? " item" : " items"); }
  function dueText(d) { return d === null ? "No use-by" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : "in " + d + " days"; }
  function agoText(h) { return h < 1 ? "just now" : h < 24 ? h + " h ago" : Math.round(h / 24) + " d ago"; }
  function levelText(l) { return l <= 25 ? "Running low" : l <= 60 ? "Some" : "Plenty"; }
  function valueFor(it, key) { return key === "useby" ? dueText(it.days) : key === "added" ? agoText(it.added) : key === "qty" ? levelText(it.lvl) : key === "loc" ? it.loc : it.cat; }

  /* ---------- markup builders ---------- */
  function stSection(big) {
    return '<section class="fx-sec" data-sec="status"' + (big ? ' id="panel-status" role="tabpanel" aria-labelledby="sec-status"' : "") + ">" +
      (big ? '<h3 class="fx-h">Status</h3><p class="fx-help">Shows an item that matches any one of these.</p>' : '<h3 class="fx-h">Status' + hk("S") + "</h3>") +
      '<div class="fx-sts">' + ST.map(function (s, n) {
        return '<div class="fx-st" data-st="' + s.k + '"><button type="button" class="fx-stb" role="checkbox" aria-checked="false" data-act="st" data-k="' + s.k + '" data-n="' + (n + 1) + '"><span class="fx-circ" aria-hidden="true">' + svg(P.tick) + '</span><span class="fx-stt"><b>' + s.label + '</b><span data-sub></span></span>' + kb(n + 1) + "</button>" +
          (s.opts.length > 1
            ? '<span class="fx-step" role="group" aria-label="' + s.label + ' period"><button type="button" data-act="step" data-k="' + s.k + '" data-d="-1" aria-label="Shorter period">' + svg(P.minus) + '</button><button type="button" data-act="step" data-k="' + s.k + '" data-d="1" aria-label="Longer period">' + svg(P.plus) + "</button></span>"
            : '<span class="fx-step fx-nostep" aria-hidden="true"></span>') + "</div>";
      }).join("") + "</div></section>";
  }
  function pills(g, vals, icons, tiles) {
    return '<div class="fx-pills' + (tiles ? " fx-tilegrid" : "") + '" role="group" aria-label="' + (g === "locs" ? "Location" : "Category") + '">' + vals.map(function (v, n) {
      return '<button type="button" class="fx-pill' + (tiles ? " fx-tile" : "") + '" aria-pressed="false" data-act="pill" data-g="' + g + '" data-v="' + esc(v) + '" data-n="' + (n + 1) + '">' +
        (icons ? svg(P[v]) : svg(P.tick, "fx-tk")) + '<span class="fx-pl">' + esc(v) + '</span><span class="fx-pc" data-c></span>' + kb(n + 1) + "</button>";
    }).join("") + "</div>";
  }
  function locSection(big) {
    return '<section class="fx-sec" data-sec="loc"' + (big ? ' id="panel-loc" role="tabpanel" aria-labelledby="sec-loc" hidden' : "") + ">" +
      (big ? '<h3 class="fx-h">Location</h3><p class="fx-help">Items kept in any of the places you pick.</p>' : '<h3 class="fx-h">Location' + hk("L") + "</h3>") + pills("locs", LOCS, true, big) + "</section>";
  }
  function catSection(big) {
    return '<section class="fx-sec" data-sec="cat"' + (big ? ' id="panel-cat" role="tabpanel" aria-labelledby="sec-cat" hidden' : "") + ">" +
      (big ? '<h3 class="fx-h">Category</h3><p class="fx-help">Items in any of the categories you pick.</p>' : '<h3 class="fx-h">Category' + hk("C") + "</h3>") + pills("cats", CATS, false, false) + "</section>";
  }
  function dirSeg() {
    return '<div class="fx-seg" role="radiogroup" aria-label="Direction">' + [0, 1].map(function (d) { return '<button type="button" role="radio" aria-checked="false" data-act="dir" data-v="' + d + '"></button>'; }).join("") + "</div>";
  }
  function sortSection(variant) {
    var head = variant === "list" ? '<h3 class="fx-h">Sort</h3><p class="fx-help">How the list is ordered once you show it.</p>' : '<h3 class="fx-h">Sort' + hk("O") + "</h3>";
    var attrs = ' data-sec="sort"' + (variant === "list" ? ' id="panel-sort" role="tabpanel" aria-labelledby="sec-sort" hidden' : "");
    if (variant === "list") {
      return "<section class=\"fx-sec\"" + attrs + ">" + head + '<div class="fx-sortlist" role="radiogroup" aria-label="Sort by">' + SORT.map(function (s, n) {
        return '<button type="button" class="fx-sr" role="radio" aria-checked="false" data-act="sortkey" data-v="' + s.k + '" data-n="' + (n + 1) + '"><span class="fx-circ" aria-hidden="true">' + svg(P.tick) + "</span><b>" + s.l + "</b>" + kb(n + 1) + "</button>";
      }).join("") + "</div>" + dirSeg() + "</section>";
    }
    return "<section class=\"fx-sec\"" + attrs + ">" + head + '<div class="fx-pills" role="radiogroup" aria-label="Sort by">' + SORT.map(function (s, n) {
      return '<button type="button" class="fx-pill" role="radio" aria-checked="false" data-act="sortkey" data-v="' + s.k + '" data-n="' + (n + 1) + '"><span class="fx-pl">' + s.l + "</span>" + kb(n + 1) + "</button>";
    }).join("") + "</div>" + dirSeg() + "</section>";
  }
  function sortCompact(select) {
    return select + '<button type="button" class="fx-dirb" data-act="dirflip">' + svg(P.dir) + '<span data-dirl></span></button>';
  }
  function selectHtml(id) {
    return '<select class="fx-sel" id="' + id + '" aria-label="Sort by" data-act="sortsel">' + SORT.map(function (s) { return '<option value="' + s.k + '">' + s.l + "</option>"; }).join("") + "</select>";
  }
  function footer() {
    return '<footer class="fx-ft"><div class="fx-fl"><button type="button" class="fx-lnk fx-lnk-acc" data-act="uselast">Use last filters</button><button type="button" class="fx-lnk" data-act="clear">Clear</button></div><button type="button" class="fx-show" data-act="show" data-show>Show items</button></footer>' +
      '<div class="fx-keys" data-keys></div><p class="fx-sr-only" role="status" aria-live="polite" data-live></p>';
  }
  function header() {
    return '<header class="fx-dh"><h2 id="fx-title">Filters and sort</h2><span class="fx-hc" data-hcount></span><button type="button" class="fx-x" data-act="close" aria-label="Close filters">' + svg(P.x) + "</button></header>";
  }
  function tray() {
    return '<div class="fx-tray"><span class="fx-trl" id="fx-trl">Your filters</span><ul class="fx-chips" data-chips aria-labelledby="fx-trl"></ul></div>';
  }
  function build(opt) {
    if (opt === "a") {
      return header() + '<div class="fx-bd"><div class="fx-a"><div>' + stSection(false) + locSection(false) + "</div><div>" + catSection(false) + (PLACE === "lane" ? '<section class="fx-sec" data-sec="sort"><h3 class="fx-h">Sort' + hk("O") + '</h3><div class="fx-sortrow">' + sortCompact(selectHtml("fx-sortsel")) + "</div></section>" : sortSection("strip")) + "</div></div></div>" + footer();
    }
    if (opt === "b") {
      var nav = [["status", "Status", "S"], ["loc", "Location", "L"], ["cat", "Category", "C"], ["sort", "Sort", "O"]].map(function (s) {
        return '<button type="button" role="tab" id="sec-' + s[0] + '" aria-selected="false" aria-controls="panel-' + s[0] + '" tabindex="-1" data-act="sec" data-sec="' + s[0] + '"><span class="fx-nvt"><b>' + s[1] + '</b><span data-sum="' + s[0] + '"></span></span><span class="fx-nb" data-nb="' + s[0] + '"></span>' + hk(s[2]) + "</button>";
      }).join("");
      return header() + '<div class="fx-bd fx-b"><div class="fx-nav" role="tablist" aria-orientation="vertical" aria-label="Sections">' + nav + '</div><div class="fx-bp">' + stSection(true) + locSection(true) + catSection(true) + sortSection("list") + "</div></div>" + tray() + footer();
    }
    return header() + '<div class="fx-bd fx-c"><div class="fx-cl">' + stSection(false) + locSection(false) + catSection(false) + '</div><section class="fx-cr" aria-label="Matching items"><div class="fx-pvh"><div class="fx-pvt"><b data-pvcount></b><span>match</span></div>' +
      '<div class="fx-sortc" data-sec="sort"><label for="fx-sortsel">Sort' + hk("O") + '</label>' + sortCompact(selectHtml("fx-sortsel")) + '</div></div><ol class="fx-pv" data-pv></ol></section></div>' + footer();
  }

  /* ---------- dialog: open, close, switch ---------- */
  var scrim = $("#fx-scrim"), dlg = $("#fx-dlg"), cap = $("#fx-cap");
  function setInert(on) {
    $$("body > *").forEach(function (el) { if (el === scrim || el.tagName === "SCRIPT") return; if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
  }
  function mount() {
    dlg.setAttribute("data-opt", OPT);
    scrim.setAttribute("data-place", OPT === "a" ? PLACE : "centre");
    dlg.innerHTML = build(OPT);
    curSec = "status"; armed = "status";
    if (OPT === "b") showSection("status", false);
    arm(armed);
    sync();
  }
  function open(from) {
    opener = from || document.activeElement;
    draft = clone(applied);
    if (Q.get("pre") === "1" && !open.once) { open.once = 1; draft = clone(draftPre()); }
    isOpen = true;
    setInert(true);
    scrim.hidden = false;
    mount();
    dlg.focus();
  }
  function draftPre() { var d = blank(); d.st.soon.on = 1; d.locs = ["Fridge", "Pantry"]; d.cats = ["Dairy", "Dairy and eggs"]; d.key = "useby"; return d; }
  function close() {
    if (!isOpen) return;
    isOpen = false; scrim.hidden = true; setInert(false);
    var o = opener && document.contains(opener) ? opener : $("#fx-open");
    if (o && o.focus) o.focus();
  }
  function switchOpt(opt) {
    OPT = opt;
    $$(".fx-tabs [role=tab]").forEach(function (t) { var on = t.dataset.opt === opt; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    ["a", "b", "c"].forEach(function (o) { $("#note-" + o).hidden = o !== opt; });
    $("#fx-place").hidden = opt !== "a"; $("#fx-placel").hidden = opt !== "a";
    if (isOpen) { mount(); dlg.focus(); } else { updateCap(); }
  }
  function updateCap() {
    cap.innerHTML = "Mockup &middot; Option " + OPT.toUpperCase() + " &middot; <kbd>[</kbd> <kbd>]</kbd> switch option" + (OPT === "a" ? " &middot; <kbd>P</kbd> placement" : "") + " &middot; <kbd>M</kbd> pill click rule";
  }

  /* ---------- selection rules ---------- */
  function pickList(arr, v, add) {
    var i = arr.indexOf(v);
    if (add) { if (i < 0) arr.push(v); else arr.splice(i, 1); }
    else if (i >= 0 && arr.length === 1) arr.length = 0;
    else { arr.length = 0; arr.push(v); }
  }
  function pickStatus(k, add) {
    var s = draft.st[k], others = ST.filter(function (x) { return x.k !== k && draft.st[x.k].on; });
    if (add) s.on = s.on ? 0 : 1;
    else if (s.on && !others.length) s.on = 0;
    else { ST.forEach(function (x) { draft.st[x.k].on = 0; }); s.on = 1; }
  }
  function isAdd(e) { return MODE === "toggle" || e.ctrlKey || e.metaKey || e.shiftKey || e.detail === 0; }
  function setKey(k) { if (draft.key !== k) { draft.key = k; } }

  /* ---------- sync: paint the draft into the open dialog ---------- */
  function setCount(n) {
    $$("[data-show]", dlg).forEach(function (b) { b.disabled = n === 0; b.textContent = n === 0 ? "No items match" : "Show " + plural(n); });
    $$("[data-hcount]", dlg).forEach(function (el) { el.textContent = plural(n); });
  }
  function chipList(f) {
    var c = [];
    ST.forEach(function (s) { if (f.st[s.k].on) c.push(["st", s.k, s.label + (s.opts.length > 1 ? ", " + s.opts[f.st[s.k].i][0] : "")]); });
    f.locs.forEach(function (v) { c.push(["locs", v, v]); });
    f.cats.forEach(function (v) { c.push(["cats", v, v]); });
    if (f.key !== "name" || f.dir !== 0) c.push(["sort", "", "Sort: " + SORT[SORTI[f.key]].l + ", " + SORT[SORTI[f.key]].d[f.dir]]);
    return c;
  }
  function sync() {
    if (!isOpen) return;
    var d = draft, res = matches(d), n = res.length;
    setCount(n);
    var live = $("[data-live]", dlg); if (live && live._n !== n) { live._n = n; live.textContent = plural(n) + " match."; }
    $$("[data-st]", dlg).forEach(function (row) {
      var s = STK[row.dataset.st], st = d.st[s.k], on = !!st.on;
      row.classList.toggle("on", on);
      $("[role=checkbox]", row).setAttribute("aria-checked", String(on));
      var cnt = DATA.filter(function (it) { return pass(it, d, "st") && s.test(it, s.opts[st.i][1]); }).length;
      $("[data-sub]", row).textContent = s.opts[st.i][0] + " · " + plural(cnt);
      var b = $$("[data-act=step]", row); if (b.length) { b[0].disabled = st.i <= 0; b[1].disabled = st.i >= s.opts.length - 1; }
    });
    $$(".fx-pill[data-g]", dlg).forEach(function (p) {
      var g = p.dataset.g, v = p.dataset.v, on = d[g].indexOf(v) >= 0;
      p.setAttribute("aria-pressed", String(on));
      var cnt = DATA.filter(function (it) { return (g === "locs" ? it.loc : it.cat) === v && pass(it, d, g); }).length;
      $("[data-c]", p).textContent = cnt;
      p.classList.toggle("fx-zero", cnt === 0);
    });
    $$("[data-act=sortkey]", dlg).forEach(function (r) { r.setAttribute("aria-checked", String(r.dataset.v === d.key)); });
    var sk = SORT[SORTI[d.key]];
    $$("[data-act=dir]", dlg).forEach(function (r) { r.textContent = sk.d[+r.dataset.v]; r.setAttribute("aria-checked", String(+r.dataset.v === d.dir)); });
    var sel = $("[data-act=sortsel]", dlg); if (sel) sel.value = d.key;
    var dl = $("[data-dirl]", dlg); if (dl) { dl.textContent = sk.d[d.dir]; $(".fx-dirb svg", dlg).style.transform = d.dir ? "rotate(180deg)" : ""; }
    var clr = $("[data-act=clear]", dlg); clr.disabled = !dirty(d);
    $("[data-act=uselast]", dlg).disabled = !last;
    var chips = $("[data-chips]", dlg);
    if (chips) {
      var cl = chipList(d);
      chips.innerHTML = cl.length ? cl.map(function (c) { return '<li><button type="button" class="fx-chipx" data-act="rm" data-t="' + c[0] + '" data-v="' + esc(c[1]) + '" aria-label="Remove ' + esc(c[2]) + '"><span>' + esc(c[2]) + "</span>" + svg(P.x) + "</button></li>"; }).join("") : '<li class="fx-none">Nothing chosen yet. Pick on the left, the count updates as you go.</li>';
      var ss = chipList(d).filter(function (c) { return c[0] === "st"; }).map(function (c) { return c[2]; });
      var sum = { status: ss.length ? ss[0] + (ss.length > 1 ? " +" + (ss.length - 1) : "") : "Any", loc: d.locs.length ? d.locs.join(", ") : "Anywhere", cat: d.cats.length ? d.cats.join(", ") : "Any category", sort: sk.l + ", " + sk.d[d.dir] };
      var nb = { status: ss.length, loc: d.locs.length, cat: d.cats.length, sort: 0 };
      Object.keys(sum).forEach(function (k) { var e = $('[data-sum="' + k + '"]', dlg); if (e) e.textContent = sum[k]; var b = $('[data-nb="' + k + '"]', dlg); if (b) { b.textContent = nb[k] || ""; b.hidden = !nb[k]; } });
    }
    var pv = $("[data-pv]", dlg);
    if (pv) {
      $("[data-pvcount]", dlg).textContent = plural(n);
      pv.innerHTML = res.length ? res.map(function (it) {
        return '<li class="fx-pr"><span class="fx-ph">' + esc(it.name.charAt(0)) + '</span><div class="fx-prt"><b>' + esc(it.name) + "</b><span>" + it.loc + " · " + it.cat + '</span></div><span class="fx-prv' + (it.days !== null && it.days <= 1 && d.key === "useby" ? " hot" : "") + '">' + esc(valueFor(it, d.key)) + "</span></li>";
      }).join("") : '<li class="fx-pnone">Nothing matches. Try clearing one choice.</li>';
    }
    keysHint();
  }
  function keysHint() {
    var k = $("[data-keys]", dlg); if (!k) return;
    var pillRule = MODE === "ctrl" ? "<span><kbd>Click</kbd> picks one</span><span><kbd>" + MOD + "</kbd>+<kbd>Click</kbd> adds more</span>" : "<span><kbd>Click</kbd> toggles</span>";
    k.innerHTML = "<span><kbd>Enter</kbd> Show</span><span><kbd>Esc</kbd> Close</span>" + pillRule + (OPT === "b" ? "<span><kbd>↑</kbd><kbd>↓</kbd> sections</span>" : "") + "<span><kbd>S</kbd><kbd>L</kbd><kbd>C</kbd><kbd>O</kbd> jump</span><span><kbd>1</kbd>&ndash;<kbd>9</kbd> toggle</span>";
  }

  /* ---------- sections ---------- */
  function arm(sec) { armed = sec; $$("[data-sec]", dlg).forEach(function (s) { if (s.classList.contains("fx-sec") || s.classList.contains("fx-sortc")) s.toggleAttribute("data-armed", s.dataset.sec === sec); }); }
  function showSection(sec, focus) {
    curSec = sec;
    $$("[role=tab][data-sec]", dlg).forEach(function (t) { var on = t.dataset.sec === sec; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    $$(".fx-bp > .fx-sec", dlg).forEach(function (p) { p.hidden = p.dataset.sec !== sec; });
    arm(sec);
    if (focus) { var t = $("#sec-" + sec, dlg); if (t) t.focus(); }
  }
  function jump(sec) {
    if (OPT === "b") { showSection(sec, false); var pnl = $("#panel-" + sec, dlg); var f = $('[aria-pressed="true"],[aria-checked="true"],button', pnl); if (f) f.focus(); return; }
    var s = $('[data-sec="' + sec + '"]', dlg); if (!s) return;
    var f2 = $('[aria-pressed="true"],[aria-checked="true"]', s) || $("button,select", s);
    if (sec === "sort" && $("select", s)) f2 = $("select", s);
    if (f2) { f2.focus(); if (f2.scrollIntoView) f2.scrollIntoView({ block: "nearest" }); }
    arm(sec);
  }
  function digit(n) {
    var el = $('[data-sec="' + armed + '"] [data-n="' + n + '"]', dlg);
    if (armed === "sort") { if (SORT[n - 1]) { setKey(SORT[n - 1].k); sync(); } return; }
    if (!el) return;
    if (el.dataset.act === "st") pickStatus(el.dataset.k, true);
    else if (el.dataset.act === "pill") pickList(draft[el.dataset.g], el.dataset.v, true);
    sync();
  }

  /* ---------- actions ---------- */
  function show() {
    if (matches(draft).length === 0) return;
    applied = clone(draft);
    if (dirty(applied)) last = clone(applied);
    close(); renderBg();
  }
  dlg.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]"); if (!t || !dlg.contains(t)) return;
    var a = t.dataset.act;
    if (a === "close") return close();
    if (a === "show") return show();
    if (a === "clear") { draft = blank(); sync(); return; }
    if (a === "uselast") { if (last) { draft = clone(last); sync(); } return; }
    if (a === "st") pickStatus(t.dataset.k, isAdd(e));
    else if (a === "step") { var s = STK[t.dataset.k], st = draft.st[s.k]; st.i = Math.max(0, Math.min(s.opts.length - 1, st.i + +t.dataset.d)); st.on = 1; }
    else if (a === "pill") pickList(draft[t.dataset.g], t.dataset.v, isAdd(e));
    else if (a === "sortkey") setKey(t.dataset.v);
    else if (a === "dir") draft.dir = +t.dataset.v;
    else if (a === "dirflip") draft.dir = draft.dir ? 0 : 1;
    else if (a === "sec") { showSection(t.dataset.sec, false); return; }
    else if (a === "rm") {
      var ty = t.dataset.t, v = t.dataset.v;
      if (ty === "st") draft.st[v].on = 0; else if (ty === "sort") { draft.key = "name"; draft.dir = 0; } else pickList(draft[ty], v, true);
      sync();
      var first = $("[data-act=rm]", dlg); if (first) first.focus(); else dlg.focus();
      return;
    }
    sync();
  });
  dlg.addEventListener("change", function (e) { if (e.target.dataset.act === "sortsel") { setKey(e.target.value); sync(); } });
  dlg.addEventListener("focusin", function (e) {
    var s = e.target.closest && e.target.closest("[data-sec]");
    if (s && s.dataset.sec !== armed && s.getAttribute("role") !== "tab") arm(s.dataset.sec);
  });

  /* scrim click closes (only when the press began on the scrim too, so a drag out of the dialog does not close it) */
  var downOnScrim = false;
  scrim.addEventListener("mousedown", function (e) { downOnScrim = e.target === scrim; });
  scrim.addEventListener("click", function (e) { if (e.target === scrim && downOnScrim) close(); downOnScrim = false; });

  function focusables() {
    return $$('button:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])', dlg).filter(function (el) { return el.getClientRects().length > 0 && !el.closest("[hidden]"); });
  }
  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    var k = e.key, tgt = e.target, plain = !(e.ctrlKey || e.metaKey || e.altKey);
    if (k === "Escape") { e.preventDefault(); return close(); }
    if (k === "Tab") {
      var list = focusables(); if (!list.length) { e.preventDefault(); return; }
      var first = list[0], lastEl = list[list.length - 1], act = document.activeElement;
      if (e.shiftKey && (act === first || act === dlg)) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && (act === lastEl || !dlg.contains(act))) { e.preventDefault(); first.focus(); }
      return;
    }
    if (k === "Enter" && !e.shiftKey) {
      if ((e.ctrlKey || e.metaKey) || !(tgt.closest && tgt.closest('[data-act="show"],[data-act="clear"],[data-act="uselast"],[data-act="close"],[data-act="rm"],[data-act="step"]'))) { e.preventDefault(); show(); }
      return;
    }
    if (tgt.tagName === "SELECT" && !/^[\[\]]$/.test(k)) { return; }
    if (k === "ArrowDown" || k === "ArrowUp") {
      if (OPT === "b" && tgt.getAttribute && tgt.getAttribute("role") === "tab") {
        e.preventDefault(); var ids = ["status", "loc", "cat", "sort"], i = ids.indexOf(tgt.dataset.sec) + (k === "ArrowDown" ? 1 : -1);
        showSection(ids[(i + 4) % 4], true);
      }
      return;
    }
    if (!plain) return;
    var lk = k.length === 1 ? k.toLowerCase() : k;
    if (lk >= "1" && lk <= "9") { e.preventDefault(); return digit(+lk); }
    if (lk === "s") { e.preventDefault(); return jump("status"); }
    if (lk === "l") { e.preventDefault(); return jump("loc"); }
    if (lk === "c") { e.preventDefault(); return jump("cat"); }
    if (lk === "o") { e.preventDefault(); return jump("sort"); }
    if (lk === "r") { e.preventDefault(); draft.dir = draft.dir ? 0 : 1; return sync(); }
    /* prototype-only keys */
    if (lk === "]" || lk === "[") { e.preventDefault(); var o = ["a", "b", "c"], j = o.indexOf(OPT) + (lk === "]" ? 1 : -1); return switchOpt(o[(j + 3) % 3]); }
    if (lk === "m") { e.preventDefault(); return setMode(MODE === "ctrl" ? "toggle" : "ctrl"); }
    if (lk === "p" && OPT === "a") { e.preventDefault(); return setPlace(PLACE === "lane" ? "centre" : "lane"); }
  });

  /* ---------- the Pantry behind (a quiet copy that shows the applied filters) ---------- */
  function renderBg() {
    var res = matches(applied), n = nChosen(applied);
    $("#fx-bgcount").textContent = plural(res.length);
    var b = $("#fx-badge"); b.hidden = n === 0; b.textContent = n;
    $("#fx-list").innerHTML = res.slice(0, 14).map(function (it) {
      return '<li><div class="fx-row' + (it.name === "Butter" ? " sel" : "") + '"><span class="fx-ph">' + esc(it.name.charAt(0)) + '</span><div><div class="fx-nm">' + esc(it.name) + '</div><div class="fx-mt">' + it.loc + " · " + it.cat + '</div></div><span class="fx-due' + (it.days !== null && it.days <= 1 ? " hot" : "") + '">' + esc(applied.key === "added" ? agoText(it.added) : dueText(it.days)) + "</span></div></li>";
    }).join("") || '<li class="fx-bgnone">Nothing matches these filters.</li>';
  }

  /* ---------- prototype chrome ---------- */
  function setMode(m) {
    MODE = m;
    $$("[data-mode]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.mode === m)); });
    if (isOpen) keysHint();
  }
  function setPlace(p) {
    PLACE = p;
    $$("[data-place]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.place === p)); });
    scrim.setAttribute("data-place", OPT === "a" ? PLACE : "centre");
    if (isOpen && OPT === "a") { mount(); dlg.focus(); }
  }
  $$(".fx-mod").forEach(function (m) { m.textContent = MOD; });
  $$("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.dataset.mode); }); });
  $$("[data-place]").forEach(function (b) { b.addEventListener("click", function () { setPlace(b.dataset.place); }); });
  $$(".fx-tabs [role=tab]").forEach(function (t) {
    t.addEventListener("click", function () { switchOpt(t.dataset.opt); if (!isOpen) open(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var o = ["a", "b", "c"], i = o.indexOf(t.dataset.opt) + (e.key === "ArrowRight" ? 1 : -1), nx = o[(i + 3) % 3];
      switchOpt(nx); $("#tab-" + nx).focus(); e.preventDefault();
    });
  });
  $("#fx-open").addEventListener("click", function () { open(this); });
  setMode(MODE); setPlace(PLACE); switchOpt(OPT); updateCap(); renderBg();
  if (Q.get("open") === "1") open($("#fx-open"));
})();
