/* The idle pane: what the right-hand lane shows when nothing is picked (Kitchie, Pantry "Pick an item to see it here", Recipes "Pick a recipe to see it here").
   Six options per screen (F is the one the owner decided on 17 October 2026 for both screens; A to E are kept as the options that were not chosen; A on Recipes still draws One thing short, which was not chosen). Each one is built only from what the list page already carries per row (data.js says which attribute), so none of them asks the server for anything.
   Class names are the build's to keep: .ip (the pane), .ip-blk (a block), .ip-bh (its head, a button), .ip-li (its names), .ip-act (an action row), .ip-keys, .ip-foot, .ip-quiet.
   MOCK ONLY: the sample data, the toast and the fake "when" words. */
(function () {
  "use strict";
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var IC = {
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    low: '<rect x="3" y="8.500" width="5" height="7" rx="1.200" fill="currentColor"/><rect x="9.500" y="8.500" width="5" height="7" rx="1.200"/><rect x="16" y="8.500" width="5" height="7" rx="1.200"/>',
    out: '<rect x="3" y="8.500" width="5" height="7" rx="1.200"/><rect x="9.500" y="8.500" width="5" height="7" rx="1.200"/><rect x="16" y="8.500" width="5" height="7" rx="1.200"/>',
    jar: '<path d="M7 7.5h10a2 2 0 0 1 2 2V18a2.5 2.5 0 0 1-2.500 2.500h-9A2.500 2.500 0 0 1 5 18V9.500a2 2 0 0 1 2-2zM8 4.500h8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7 12h10"/>',
    search: '<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
    chef: '<path d="M7 14.500a3.500 3.500 0 1 1 1.500-6.700 4 4 0 0 1 7 0A3.500 3.500 0 1 1 17 14.500V19H7zM7 17h10"/>',
    cal: '<path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.500V7M16 3.500V7"/>',
    star: '<path d="M12 4l2.400 5 5.600.7-4.100 3.900 1 5.500L12 16.400 7.100 19.100l1-5.500L4 9.700 9.600 9z"/>',
    spark: '<path d="M12 4l1.800 5.200L19 11l-5.200 1.800L12 18l-1.800-5.200L5 11l5.200-1.800z"/>',
    keys: '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M7 11h.01M11 11h.01M15 11h.01M7.500 14.500h9"/>',
    clockback: '<path d="M4 12a8 8 0 1 0 2.500-5.800M4 5v4h4M12 8v4l2.500 1.500"/>',
    almost: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500v5.500M12 16.200v.01"/>',
    hand: '<path d="M8 12V6.500a1.500 1.500 0 0 1 3 0V11m0-4.500a1.500 1.500 0 0 1 3 0V11m0-3a1.500 1.500 0 0 1 3 0v6a6 6 0 0 1-6 6h-.5a5 5 0 0 1-4-2L4.500 14.500a1.500 1.500 0 0 1 2.300-1.900L8 14"/>'
  };
  var ico = function (n) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + "</svg>"; };
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
  var CLOSE = isMac ? "⌘ Esc" : "Ctrl Esc";
  var kbd = function (t) { return '<span class="kbd" aria-hidden="true">' + esc(t) + "</span>"; };

  function when(ub) {
    if (ub === null || ub === undefined) return "";
    if (ub < -1) return -ub + " days over";
    if (ub === -1) return "a day over";
    if (ub === 0) return "today";
    if (ub === 1) return "tomorrow";
    return "in " + ub + " days";
  }
  function cooked(cd) {
    if (cd === null || cd === undefined) return "not cooked yet";
    if (cd === 0) return "today";
    if (cd === 1) return "yesterday";
    return cd + " days ago";
  }
  function ago(ms) {
    var m = Math.round((Date.now() - ms) / 60000);
    if (m < 2) return "just now";
    if (m < 90) return m + " min ago";
    var h = Math.round(m / 60);
    if (h < 20) return h + " hours ago";
    var d = Math.round(h / 24);
    return d <= 1 ? "yesterday" : d + " days ago";
  }

  /* ---------- derived numbers (what list.js already computes from the rows' data attributes) ---------- */
  function pantryStats(items) {
    var live = items.filter(function (i) { return i.lvl !== "out"; });
    var soon = live.filter(function (i) { return i.ub !== null && i.ub <= 7; }).sort(function (a, b) { return a.ub - b.ub; });
    var low = live.filter(function (i) { return i.lvl === "low"; });
    var out = items.filter(function (i) { return i.lvl === "out"; });
    var places = {}; live.forEach(function (i) { places[i.loc] = 1; });
    return { total: items.length, listed: live.length, places: Object.keys(places).length, soon: soon, low: low, out: out };
  }
  function recipeStats(rows, d) {
    var known = rows.length > 0 && rows[0].miss !== null;
    var rank = rows.slice().sort(function (a, b) { var ma = known ? a.miss : 0, mb = known ? b.miss : 0; return ma - mb || (a.cd === null ? 1e9 : a.cd) - (b.cd === null ? 1e9 : b.cd) || a.n.localeCompare(b.n); });
    return {
      total: rows.length, known: known,
      ready: known ? rank.filter(function (r) { return r.miss === 0; }) : [],
      short: known ? rank.filter(function (r) { return r.miss === 1; }) : [],
      planned: rows.filter(function (r) { return r.planned; }),
      lately: rows.filter(function (r) { return r.cd !== null && r.cd <= 7; }).sort(function (a, b) { return a.cd - b.cd; }),
      reviews: d === "large" ? 3 : d === "typical" ? 1 : 0
    };
  }

  /* ---------- building blocks ---------- */
  function head(icon, title, sub) {
    return '<header class="ip-h"><span class="ip-ic">' + ico(icon) + "</span><div><b>" + esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</div></header>";
  }
  /* one block: a head button that applies the same filter Home's tiles do, then up to `cap` names that pick the item. */
  function block(o) {
    var names = o.list.slice(0, o.cap).map(function (x) {
      return '<li><button type="button" class="ip-nm" data-act="open" data-id="' + esc(x.id) + '"><span class="ip-t">' + esc(x.n) + '</span><small>' + esc(o.sub(x)) + "</small></button></li>";
    }).join("");
    var more = o.list.length > o.cap && o.act ? '<button type="button" class="ip-more" data-act="' + o.act + '" data-f="' + o.f + '">and ' + (o.list.length - o.cap) + " more</button>" : "";
    var inner = '<span class="ip-i ' + (o.tone || "") + '">' + ico(o.icon) + "</span><b>" + esc(o.title) + '</b><span class="ip-n">' + o.list.length + "</span>";
    /* a head with no filter behind it (Planned this week, Recently cooked: the Recipes list has no such chip) is a plain label, not a button */
    var hd = o.act ? '<button type="button" class="ip-bh" data-act="' + o.act + '" data-f="' + o.f + '">' + inner + '<span class="ip-go">' + ico("chev") + "</span></button>" : '<div class="ip-bh static">' + inner + "</div>";
    return '<section class="ip-blk" data-blk="' + o.f + '">' + hd +
      (names ? '<ul class="ip-li">' + names + "</ul>" : "") + more + "</section>";
  }
  function action(o) {
    return '<button type="button" class="ip-act" data-act="' + o.act + '"' + (o.f ? ' data-f="' + o.f + '"' : "") + '><span class="ip-i ' + (o.tone || "") + '">' + ico(o.icon) + '</span><span class="ip-tx"><b>' + esc(o.title) + "</b><small>" + esc(o.sub) + "</small></span>" + (o.key ? kbd(o.key) : '<span class="ip-go">' + ico("chev") + "</span>") + "</button>";
  }
  function quiet(icon, line, sub) {
    return '<div class="ip-quiet"><span class="ip-ic big">' + ico(icon) + "</span><p><b>" + esc(line) + "</b></p>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div>";
  }
  function foot(touch, extra) {
    return '<p class="ip-foot">' + (touch ? "Tap " + (extra || "an item") + " to open it." : kbd("/") + " search " + kbd("↑") + kbd("↓") + " move " + kbd("?") + " all shortcuts") + "</p>";
  }
  function keyRow(k, t) { return '<li><span>' + t + "</span><span class=\"ks\">" + k.map(kbd).join("") + "</span></li>"; }

  /* ---------- PANTRY ---------- */
  var PANTRY = {
    a: function (s, st) {
      if (!st.total) return emptyPantry(s, "a");
      var allgood = !st.soon.length && !st.low.length && !st.out.length;
      return '<section class="ip ip-a" aria-label="Your kitchen at a glance">' + head("jar", "Your kitchen", st.listed + " items in " + st.places + (st.places === 1 ? " place" : " places")) +
        (allgood ? quiet("check", "Nothing is going off", "And nothing is running low.") : (
          (st.soon.length ? block({ f: "soon", act: "filter", icon: "clock", tone: "amber", title: "Use soon", list: st.soon, cap: s.cap, sub: function (x) { return when(x.ub); } }) : "") +
          (st.low.length ? block({ f: "low", act: "filter", icon: "low", tone: "red", title: "Running low", list: st.low, cap: s.cap, sub: function (x) { return x.qty; } }) : "") +
          (st.out.length ? block({ f: "out", act: "filter", icon: "out", tone: "mute", title: "Out", list: st.out, cap: s.cap, sub: function (x) { return x.loc; } }) : ""))) + "</section>";
    },
    b: function (s, st) {
      if (!st.total) return emptyPantry(s, "b");
      return '<section class="ip ip-b" aria-label="Things to do">' + head("spark", "What next?", "") + '<div class="ip-acts">' +
        action({ act: "add", icon: "plus", title: "Add an item", sub: "Type it in", key: "N" }) +
        action({ act: "scan", icon: "scan", title: "Scan a receipt", sub: "Add a whole shop at once" }) +
        action({ act: "filter", f: "soon", icon: "clock", tone: "amber", title: "See what is going off", sub: st.soon.length ? st.soon.length + " to look at" : "Nothing is going off" }) +
        action({ act: "filter", f: "low", icon: "low", tone: "red", title: "See what is running low", sub: st.low.length ? st.low.length + " running low" : "Nothing is running low" }) +
        "</div></section>";
    },
    c: function (s, st) {
      var r = s.recent;
      if (!st.total) return '<section class="ip ip-c">' + head("clockback", "Pick up where you left off", "") + quiet("hand", "Nothing opened yet", "The items you open show up here.") + "</section>";
      if (!r.length) return '<section class="ip ip-c">' + head("clockback", "Pick up where you left off", "") + quiet("hand", "Nothing opened yet", "The items you open show up here.") + "</section>";
      var first = r[0];
      return '<section class="ip ip-c">' + head("clockback", "Pick up where you left off", "On this device") +
        '<button type="button" class="ip-last" data-act="open" data-id="' + esc(first.id) + '"><span class="ip-t">' + esc(first.n) + "</span><small>" + esc(first.loc + " · " + ago(first.at)) + '</small><span class="ip-go">' + ico("chev") + "</span></button>" +
        (r.length > 1 ? '<p class="ip-sub">Before that</p><ul class="ip-li flat">' + r.slice(1, 5).map(function (x) { return '<li><button type="button" class="ip-nm" data-act="open" data-id="' + esc(x.id) + '"><span class="ip-t">' + esc(x.n) + "</span><small>" + esc(ago(x.at)) + "</small></button></li>"; }).join("") + "</ul>" : "") + "</section>";
    },
    d: function (s, st) {
      var K = [[["↑", "↓"], "Move"], [["Enter"], "Open"], [["E"], "Edit"], [[","], "History"], [["U"], "Use one"], [["D"], "Used up"], [["S"], "Add to the list"], [["N"], "Add an item"], [["F"], "Filters"], [["?"], "All shortcuts"]];
      return '<section class="ip ip-d" aria-label="Keys and search">' + head("keys", "Find it fast", "") +
        '<button type="button" class="ip-find" data-act="search"><span class="ip-i">' + ico("search") + "</span><span>Search your pantry</span>" + (s.touch ? "" : kbd("/")) + "</button>" +
        (s.touch ? quiet("hand", "Tap an item to open it", "Keys need a keyboard.") : '<ul class="ip-keys">' + K.map(function (r) { return keyRow(r[0], r[1]); }).join("") + "</ul>" + (st.total ? "" : '<p class="ip-foot">Most keys act on an open item. Add one to start.</p>')) + "</section>";
    }
  };

  function emptyPantry(s, o) {
    var small = o === "a" || o === "f";
    return '<section class="ip ip-' + o + ' ip-empty" aria-label="Nothing in the pantry yet">' + head("jar", "Your pantry is empty", small ? "Start with one" : "") +
      '<div class="ip-acts">' + action({ act: "add", icon: "plus", title: "Add an item", sub: "Type it in", key: s.touch ? "" : "N" }) +
      action({ act: "scan", icon: "scan", title: "Scan a receipt", sub: "Add a whole shop at once" }) +
      (small ? "" : action({ act: "assistant", icon: "spark", title: "Ask your assistant", sub: "It can fill the pantry for you" })) + "</div></section>";
  }

  /* ---------- RECIPES ---------- */
  var RECIPES = {
    a: function (s, st) {
      if (!st.total) return emptyRecipes(s);
      var any = st.ready.length || st.short.length || st.planned.length || st.lately.length;
      return '<section class="ip ip-a" aria-label="What to cook">' + head("chef", "What to cook", st.total + " recipes") +
        (st.known ? (st.ready.length ? block({ f: "ready", act: "chip", icon: "check", tone: "sage", title: "Ready now", list: st.ready, cap: s.cap, sub: function (x) { return x.min + " min"; } }) : "") + (st.short.length ? block({ f: "short", act: "", icon: "almost", tone: "amber", title: "One thing short", list: st.short, cap: s.cap, sub: function () { return "1 missing"; } }) : "")
          : '<p class="ip-note">Kitchie cannot read the pantry right now, so it cannot say what is ready.</p>') +
        (st.planned.length ? block({ f: "planned", act: "", icon: "cal", tone: "", title: "Planned this week", list: st.planned, cap: s.cap, sub: function (x) { return x.min + " min"; } }) : "") +
        (st.lately.length ? block({ f: "lately", act: "", icon: "clockback", tone: "", title: "Recently cooked", list: st.lately, cap: s.cap, sub: function (x) { return cooked(x.cd); } }) : "") +
        (!any && st.known ? quiet("chef", "Nothing is ready yet", "Add to the pantry and this fills in.") : "") + "</section>";
    },
    b: function (s, st) {
      if (!st.total) return emptyRecipes(s);
      return '<section class="ip ip-b" aria-label="Things to do">' + head("spark", "What next?", "") + '<div class="ip-acts">' +
        action({ act: "assistant", icon: "spark", title: "Ask your assistant to add a recipe", sub: "It opens your AI app" }) +
        action({ act: "plan", icon: "cal", title: "Plan a recipe this week", sub: "Pick a night" }) +
        action({ act: "chip", f: "ready", icon: "check", tone: "sage", title: "See what is ready now", sub: st.known ? st.ready.length + " recipes, all ingredients in" : "Needs the pantry, which cannot be read now" }) +
        (st.reviews ? action({ act: "review", icon: "star", tone: "amber", title: "Review " + st.reviews + (st.reviews === 1 ? " change" : " changes"), sub: "Your assistant changed " + (st.reviews === 1 ? "a recipe" : "recipes") }) : "") +
        "</div></section>";
    },
    c: function (s, st) {
      var r = s.recent;
      var lately = st.lately.slice(0, 3);
      if (!st.total) return '<section class="ip ip-c">' + head("clockback", "Pick up where you left off", "") + quiet("hand", "Nothing opened yet", "The recipes you open show up here.") + "</section>";
      return '<section class="ip ip-c">' + head("clockback", "Pick up where you left off", r.length ? "On this device" : "") +
        (r.length ? '<button type="button" class="ip-last" data-act="open" data-id="' + esc(r[0].id) + '"><span class="ip-t">' + esc(r[0].n) + "</span><small>" + esc("Opened " + ago(r[0].at)) + '</small><span class="ip-go">' + ico("chev") + "</span></button>" +
          (r.length > 1 ? '<p class="ip-sub">Before that</p><ul class="ip-li flat">' + r.slice(1, 4).map(function (x) { return '<li><button type="button" class="ip-nm" data-act="open" data-id="' + esc(x.id) + '"><span class="ip-t">' + esc(x.n) + "</span><small>" + esc(ago(x.at)) + "</small></button></li>"; }).join("") + "</ul>" : "")
          : quiet("hand", "Nothing opened yet", "The recipes you open show up here.")) +
        (lately.length ? '<p class="ip-sub">Recently cooked</p><ul class="ip-li flat">' + lately.map(function (x) { return '<li><button type="button" class="ip-nm" data-act="open" data-id="' + esc(x.id) + '"><span class="ip-t">' + esc(x.n) + "</span><small>" + esc(cooked(x.cd)) + "</small></button></li>"; }).join("") + "</ul>" : "") + "</section>";
    },
    d: function (s, st) {
      var K = [[["↑", "↓"], "Move"], [["Enter"], "Open"], [["O"], "Open the full recipe"], [["N"], "Notes and reactions"], [["E"], "Edit"], [[","], "History"], [["S"], "Share"]];
      return '<section class="ip ip-d" aria-label="Keys and search">' + head("keys", "Find it fast", "") +
        '<button type="button" class="ip-find" data-act="search"><span class="ip-i">' + ico("search") + "</span><span>Search recipes or ingredients</span>" + (s.touch ? "" : kbd("/")) + "</button>" +
        (s.touch ? quiet("hand", "Tap a recipe to open it", "Keys need a keyboard.") : '<ul class="ip-keys">' + K.map(function (r) { return keyRow(r[0], r[1]); }).join("") + "</ul>") + "</section>";
    }
  };

  function emptyRecipes(s) {
    return '<section class="ip ip-empty" aria-label="No recipes yet">' + head("chef", "No recipes yet", "") + '<div class="ip-acts">' +
      action({ act: "assistant", icon: "spark", title: "Ask your assistant to add one", sub: "Recipes are added through your AI app" }) + "</div>" +
      '<p class="ip-foot">Once there is a recipe, this space shows what you can cook.</p></section>';
  }

  /* ---------- THE DECIDED PANE (owner, voice, 17 Oct 2026): the same shared section and row widget on Pantry and Recipes ----------
     Pantry: Use soon, Running low, Out.  Recipes: Ready now, Planned this week, Newly added, Recently cooked.
     Data source rule: coming from Home, the sections Home already holds are drawn at once from what Home handed over; coming straight to the screen, every section is lazy:
     the COUNT first (a number in the head), then a shimmer in the rows (one grey row per row to come, so nothing jumps), then the real rows replace it. */
  IC.basket = '<path d="M4 9h16l-1.500 9a2 2 0 0 1-2 1.700H7.500a2 2 0 0 1-2-1.700z"/><path d="M8 9l3-5M16 9l-3-5"/>';
  IC.cartPlus = IC.basket + '<path d="M12 12v4M10 14h4"/>';
  IC.onList = IC.basket + '<path d="M9.500 14.200l2 2 3.500-3.600"/>';
  IC.calOk = '<path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.500V7M16 3.500V7"/><path d="M9 15l2 2 4-4"/>';
  IC.calWarn = '<path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.500V7M16 3.500V7"/><path d="M12 12.500v3M12 18v.01"/>';
  IC.findPlan = '<path d="M4 8h14M4 8V6.500A1.500 1.500 0 0 1 5.500 5h11A1.500 1.500 0 0 1 18 6.500V11M8 3.500V6M14 3.500V6"/><circle cx="12.500" cy="14.500" r="3.500"/><path d="M15.200 17.200L19 21"/>';
  IC.newTag = IC.spark;
  IC.back = '<path d="M15 6l-6 6 6 6"/>';
  IC.calPlus = '<path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.500V7M16 3.500V7M12 12.500v5M9.500 15h5"/>';
  IC.clockdone = IC.clockback;
  var HOME_HAS = { pantry: ["soon", "low"], recipes: ["ready", "planned"] };
  var CAP = { soon: 3, low: 3, out: 2, ready: 3, planned: 2, fresh: 2, cooked: 2 };
  var FRESH_DAYS = 14, T = { count: 250, rows: 900, step: 250 };

  function planKind(it) { return !it.plan ? "none" : it.plan.d <= it.ub ? "ok" : "late"; }
  function nameOf(it) { return it.n; }
  function glyph(it, fallback) { return '<span class="e s" aria-hidden="true">' + (it.em ? esc(it.em) : ico(fallback || "basket")) + "</span>"; }
  function nm(it, sub, pill) {
    return '<button type="button" class="ip-nm t" data-act="open" data-id="' + esc(it.id) + '"><span class="ip-t">' + esc(it.n) + "</span>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</button>" + (pill || "");
  }
  /* an icon control: a button when it does something, a focusable image when it only says something. Both carry the words as the accessible name and as the tooltip. */
  function ib(o) {
    var common = ' class="ip-ib ' + (o.tone || "") + '" aria-label="' + esc(o.label) + '" data-tip="' + esc(o.tip || o.label) + '"';
    return o.act
      ? '<button type="button"' + common + ' data-act="' + o.act + '" data-id="' + esc(o.id) + '">' + ico(o.icon) + "</button>"
      : '<span' + common + ' role="img" tabindex="0">' + ico(o.icon) + "</span>";
  }
  function pill(text, hot) { return '<span class="pl' + (hot ? " hot" : "") + '">' + esc(text) + "</span>"; }

  /* ---- the section definitions: the lists are sorted here; a count is the length of its list, so it always equals the rows its filter shows ---- */
  function defsFor(s) {
    var items = s.items, d = [];
    if (s.screen === "pantry") {
      var st = pantryStats(items);
      var soon = st.soon.map(function (x) { return x; });
      var rank = function (x) { return planKind(x) === "ok" ? 1 : 0; }; /* planned in time goes to the bottom: it needs nothing */
      soon = soon.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) { return rank(a.x) - rank(b.x) || a.i - b.i; }).map(function (o) { return o.x; });
      var byList = function (a) { return a.slice().map(function (x, i) { return { x: x, i: i }; }).sort(function (a2, b2) { return (a2.x.onList ? 1 : 0) - (b2.x.onList ? 1 : 0) || a2.i - b2.i; }).map(function (o) { return o.x; }); };
      var low = byList(st.low.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }));
      var out = byList(st.out.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }));
      d.push({ key: "soon", title: "Use soon", icon: "clock", tone: "amber", f: "soon", list: soon, row: soonRow });
      d.push({ key: "low", title: "Running low", icon: "basket", tone: "red", f: "low", list: low, row: lowRow });
      d.push({ key: "out", title: "Out", icon: "out", tone: "mute", f: "out", list: out, row: lowRow });
      return { defs: d, known: true, empty: !st.total };
    }
    var rs = recipeStats(items, s.data);
    var fresh = items.filter(function (r) { return r.added !== null && r.added !== undefined && r.added <= FRESH_DAYS; }).sort(function (a, b) { return a.added - b.added || a.n.localeCompare(b.n); });
    if (rs.known) d.push({ key: "ready", title: "Ready now", icon: "check", tone: "sage", f: "ready", list: rs.ready, row: readyRow });
    d.push({ key: "planned", title: "Planned this week", icon: "cal", tone: "", f: "", list: rs.planned.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }), row: plannedRow });
    d.push({ key: "fresh", title: "Newly added", icon: "newTag", tone: "amber", f: "", list: fresh, row: freshRow, quietWhenEmpty: true });
    d.push({ key: "cooked", title: "Recently cooked", icon: "clockback", tone: "", f: "", list: rs.lately, row: cookedRow });
    return { defs: d, known: rs.known, empty: !items.length };
  }

  /* ---- rows: one shape (glyph, name with a small line, then icons), the same on every section ---- */
  function soonRow(it) {
    var k = planKind(it), icon;
    if (k === "ok") icon = ib({ icon: "calOk", tone: "sage", label: "Planned in time: " + it.plan.meal + ", " + it.plan.night, tip: "Planned before its use-by: " + it.plan.meal + ", " + it.plan.night });
    else if (k === "late") icon = ib({ icon: "calWarn", tone: "warn", act: "plan-find", id: it.id, label: "Planned too late: " + it.plan.meal + ", " + it.plan.night + ", after its use-by. Find a recipe to plan sooner", tip: "Planned after its use-by (" + it.plan.meal + ", " + it.plan.night + "). Find a recipe to plan sooner" });
    else icon = ib({ icon: "findPlan", tone: "find", act: "plan-find", id: it.id, label: "Not planned. Find a recipe to plan with " + it.n, tip: "Not planned. Find a recipe with " + it.n });
    return '<li class="or" data-id="' + esc(it.id) + '" data-plan="' + k + '">' + glyph(it) + nm(it, "", pill(when(it.ub), it.ub <= 2)) + icon + "</li>";
  }
  function lowRow(it) {
    var control = it.onList ? ib({ icon: "onList", tone: "sage", label: "On the shopping list", tip: "On the shopping list" }) : ib({ icon: "cartPlus", tone: "find", act: "shop-add", id: it.id, label: "Add " + it.n + " to the shopping list", tip: "Add to the shopping list" });
    return '<li class="or" data-id="' + esc(it.id) + '" data-onlist="' + (it.onList ? 1 : 0) + '">' + glyph(it) + nm(it, it.lvl === "out" ? it.loc : it.qty) + control + "</li>";
  }
  function readyRow(r) { return '<li class="or" data-id="' + esc(r.id) + '">' + glyph(r, "chef") + nm(r, r.min + " min") + ib({ icon: "check", tone: "sage", label: "All ingredients are in the pantry", tip: "All ingredients are in" }) + "</li>"; }
  function plannedRow(r) { return '<li class="or" data-id="' + esc(r.id) + '">' + glyph(r, "chef") + nm(r, r.night || (r.min + " min")) + ib({ icon: "calOk", tone: "sage", label: "Planned for " + (r.night || "this week"), tip: "Planned for " + (r.night || "this week") }) + "</li>"; }
  function freshRow(r) { var w = r.added === 0 ? "today" : r.added === 1 ? "yesterday" : r.added + " days ago"; return '<li class="or" data-id="' + esc(r.id) + '">' + glyph(r, "chef") + nm(r, "Added " + w) + ib({ icon: "newTag", tone: "new", label: "New: added " + w, tip: "Added " + w }) + "</li>"; }
  function cookedRow(r) { return '<li class="or" data-id="' + esc(r.id) + '">' + glyph(r, "chef") + nm(r, "Cooked " + cooked(r.cd)) + ib({ icon: "clockback", tone: "", label: "Cooked " + cooked(r.cd), tip: "Cooked " + cooked(r.cd) }) + "</li>"; }

  /* ---- one section in one of three phases: ph (head only, count pending), count (count and the shimmer), rows (the real rows) ---- */
  function sectionHtml(def, phase, s) {
    var n = def.list.length, cap = CAP[def.key], sh = n > cap ? n - cap : 0;
    var cnt = phase === "ph" ? '<span class="ip-n sk" aria-hidden="true"></span>' : '<span class="ip-n">' + n + "</span>";
    var inner = '<span class="ip-i ' + (def.tone || "") + '">' + ico(def.icon) + "</span><b>" + esc(def.title) + "</b>" + cnt;
    var hd = def.f && phase === "rows"
      ? '<button type="button" class="ip-bh" data-act="' + (def.key === "ready" ? "chip" : "filter") + '" data-f="' + def.f + '" aria-label="' + esc(def.title + ", " + n + ". Show them in the list") + '">' + inner + '<span class="ip-go">' + ico("chev") + "</span></button>"
      : '<div class="ip-bh static">' + inner + "</div>";
    var body = "";
    if (phase === "count" && n > 0) {
      var k = Math.min(n, cap), r = ""; for (var i = 0; i < k; i++) r += '<li class="or sk-r" aria-hidden="true"><span class="e s"></span><span class="t"><i></i><i></i></span><span class="sk-a"></span></li>';
      body = '<ul class="ip-rows">' + r + "</ul>" + (sh && def.f ? '<div class="ip-more sk-more" aria-hidden="true"><i></i></div>' : "");
    } else if (phase === "rows") {
      if (n > 0) body = '<ul class="ip-rows">' + def.list.slice(0, cap).map(def.row).join("") + "</ul>" +
        (sh ? (def.f ? '<button type="button" class="ip-more" data-act="' + (def.key === "ready" ? "chip" : "filter") + '" data-f="' + def.f + '">and ' + sh + " more</button>" : "") : "");
      else if (def.quietWhenEmpty) body = '<p class="ip-qline">Nothing added in the last ' + FRESH_DAYS + " days. " + '<button type="button" class="ip-ib find" data-act="assistant" aria-label="Ask your assistant to add a recipe" data-tip="Ask your assistant to add a recipe">' + ico("spark") + "</button></p>";
    }
    if (phase !== "ph" && n === 0 && !def.quietWhenEmpty) return "";
    return '<section class="ip-blk" data-blk="' + def.key + '" data-phase="' + phase + '"' + (phase === "rows" ? "" : ' aria-busy="true"') + ">" + hd + body + "</section>";
  }
  var LEG = {
    pantry: [["calOk", "planned in time"], ["calWarn", "planned after its use-by"], ["findPlan", "find a recipe"], ["cartPlus", "add to the list"], ["onList", "on the list"]],
    recipes: [["check", "all in"], ["cal", "planned"], ["newTag", "added lately"], ["clockback", "cooked"]]
  };
  function legend(s) { return '<ul class="ip-leg" aria-label="What the icons mean">' + LEG[s.screen].map(function (l) { return "<li>" + ico(l[0]) + "<span>" + l[1] + "</span></li>"; }).join("") + "</ul>"; }

  function paneDecided(s) {
    var D = defsFor(s);
    if (D.empty) return s.screen === "pantry" ? emptyPantry(s, "f") : emptyRecipes(s);
    var ph = s.phase || {};
    var pending = D.defs.some(function (d) { return (ph[d.key] || "rows") === "ph"; });
    var total = D.defs.reduce(function (a, d) { return a + d.list.length; }, 0);
    var aria = s.screen === "pantry" ? "Your kitchen at a glance" : "What to cook";
    if (!pending && total === 0 && D.known) return '<section class="ip ip-f ip-calm" aria-label="' + aria + '"><p class="ip-line">' + (s.screen === "pantry" ? "Pick an item to see it here." : "Pick a recipe to see it here.") + "</p>" + foot(s.touch, s.screen === "pantry" ? "an item" : "a recipe") + "</section>";
    var note = !D.known ? '<p class="ip-note">Kitchie cannot read the pantry right now, so it cannot say what is ready.</p>' : "";
    return '<section class="ip ip-f" aria-label="' + aria + '">' + note + D.defs.map(function (d) { return sectionHtml(d, ph[d.key] || "rows", s); }).join("") + legend(s) + foot(s.touch, s.screen === "pantry" ? "an item" : "a recipe") + "</section>";
  }

  /* ---- the sketch of what "find a recipe to plan" opens: the Recipes search look, the item already typed in ---- */
  function searchSketch(s, id) {
    var it = s.items.filter(function (x) { return x.id === id; })[0]; if (!it) return paneDecided(s);
    var recs = ((window.EP_DATA && window.EP_DATA.recipes.typical) || []).filter(function (r) { return r.miss === 0 || r.miss === 1; }).slice(0, 3);
    return '<section class="ip ip-search" aria-label="Find a recipe for ' + esc(it.n) + '">' +
      '<header class="ip-sh"><button type="button" class="ip-ib" data-act="idle-back" aria-label="Back" data-tip="Back">' + ico("back") + '</button><b>Recipes with ' + esc(it.n.toLowerCase()) + "</b></header>" +
      '<div class="ip-find static"><span class="ip-i">' + ico("search") + '</span><span class="ip-q">' + esc(it.n.toLowerCase()) + "</span></div>" +
      '<p class="ip-sub">Uses it up before ' + esc(when(it.ub)) + '</p><ul class="ip-rows">' +
      recs.map(function (r) { return '<li class="or"><span class="e s" aria-hidden="true">' + ico("chef") + '</span><span class="t"><b>' + esc(r.n) + "</b><small>" + r.min + " min · " + (r.miss === 0 ? "all in" : "1 missing") + '</small></span>' + ib({ icon: "calPlus", tone: "find", act: "plan-pick", id: r.id, label: "Plan " + r.n, tip: "Plan it" }) + "</li>"; }).join("") + "</ul>" +
      '<p class="ip-note">Sketch. It reuses the Recipes search, with the item as the first search word and the soonest use-by in mind. Plan opens the Plan it flyout (unchanged).</p></section>';
  }

  /* ---- timing: what the build would do. Coming from Home, the sections Home holds are drawn at once; everything else (and everything, coming straight here) shows its count, then the shimmer, then the rows ---- */
  function initPhase(s) {
    var D = defsFor(s), mode = s.mode || "direct", p = {};
    D.defs.forEach(function (d) { p[d.key] = (mode === "ready" || (mode === "home" && HOME_HAS[s.screen].indexOf(d.key) > -1) || D.empty) ? "rows" : "ph"; });
    s.phase = p; return p;
  }
  function run(s, onTick) {
    var D = defsFor(s), timers = [], t0 = Date.now(), log = [];
    var lazy = D.defs.filter(function (d) { return s.phase[d.key] === "ph"; });
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var ev = function (k, ph) { s.phase[k] = ph; log.push({ ms: Date.now() - t0, key: k, phase: ph }); onTick(k, ph, log); };
    D.defs.forEach(function (d) { if (s.phase[d.key] === "rows") log.push({ ms: 0, key: d.key, phase: "rows", fromHome: true }); });
    lazy.forEach(function (d, i) { at(T.count, function () { ev(d.key, "count"); }); at(T.rows + i * T.step, function () { ev(d.key, "rows"); }); });
    s.log = log;
    return function () { timers.forEach(clearTimeout); };
  }
  function patch(lane, s, key) {
    var el = lane.querySelector('[data-blk="' + key + '"]'), D = defsFor(s);
    var def = D.defs.filter(function (d) { return d.key === key; })[0];
    var pending = D.defs.some(function (d) { return s.phase[d.key] === "ph"; });
    var total = D.defs.reduce(function (a, d) { return a + d.list.length; }, 0);
    if (!pending && total === 0 && D.known) { lane.innerHTML = paneDecided(s); return; }
    if (!el || !def) return;
    var html = sectionHtml(def, s.phase[key], s);
    if (!html) { el.remove(); return; }
    var tmp = document.createElement("div"); tmp.innerHTML = html; el.replaceWith(tmp.firstChild);
  }

  /* s = { screen, opt, data, items, cap, touch, recent }  ->  HTML (empty string for option e: no pane at all) */
  window.EP_PANE = function (s) {
    if (s.opt === "e") return "";
    if (s.search) return searchSketch(s, s.search);
    if (s.opt === "f") return paneDecided(s);
    if (s.screen === "pantry") return PANTRY[s.opt](s, pantryStats(s.items));
    return RECIPES[s.opt](s, recipeStats(s.items, s.data));
  };
  window.EP_IDLE = { rows: { soon: soonRow, low: lowRow, ready: readyRow, planned: plannedRow, fresh: freshRow, cooked: cookedRow }, initPhase: initPhase, run: run, patch: patch, defs: defsFor, planKind: planKind, TIMES: T, HOME_HAS: HOME_HAS, CAP: CAP, FRESH_DAYS: FRESH_DAYS };
  window.EP_STATS = { pantry: pantryStats, recipes: recipeStats, when: when, cooked: cooked, ago: ago, close: CLOSE, ico: ico };
})();
