/* The idle pane: what the right-hand lane shows when nothing is picked (Kitchie, Pantry "Pick an item to see it here", Recipes "Pick a recipe to see it here").
   Six options per screen. Each one is built only from what the list page already carries per row (data.js says which attribute), so none of them asks the server for anything.
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
    /* a head with no filter behind it (Planned this week, Cooked lately: the Recipes list has no such chip) is a plain label, not a button */
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
    },
    f: function (s, st) {
      if (!st.total) return emptyPantry(s, "f");
      var allgood = !st.soon.length && !st.low.length; /* Out items are left out of the recommendation: the default list hides them on purpose (EP-P8) */
      return '<section class="ip ip-f' + (allgood ? " ip-calm" : "") + '" aria-label="Your kitchen at a glance">' + (allgood ? "" : head("jar", "Your kitchen", st.listed + " items in " + st.places + (st.places === 1 ? " place" : " places"))) +
        (allgood ? '<p class="ip-line">Pick an item to see it here.</p>' : (
          (st.soon.length ? block({ f: "soon", act: "filter", icon: "clock", tone: "amber", title: "Use soon", list: st.soon, cap: 2, sub: function (x) { return when(x.ub); } }) : "") +
          (st.low.length ? block({ f: "low", act: "filter", icon: "low", tone: "red", title: "Running low", list: st.low, cap: 2, sub: function (x) { return x.qty; } }) : ""))) +
        foot(s.touch) + "</section>";
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
        (st.lately.length ? block({ f: "lately", act: "", icon: "clockback", tone: "", title: "Cooked lately", list: st.lately, cap: s.cap, sub: function (x) { return cooked(x.cd); } }) : "") +
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
        (lately.length ? '<p class="ip-sub">Cooked lately</p><ul class="ip-li flat">' + lately.map(function (x) { return '<li><button type="button" class="ip-nm" data-act="open" data-id="' + esc(x.id) + '"><span class="ip-t">' + esc(x.n) + "</span><small>" + esc(cooked(x.cd)) + "</small></button></li>"; }).join("") + "</ul>" : "") + "</section>";
    },
    d: function (s, st) {
      var K = [[["↑", "↓"], "Move"], [["Enter"], "Open"], [["O"], "Open the full recipe"], [["N"], "Notes and reactions"], [["E"], "Edit"], [[","], "History"], [["S"], "Share"]];
      return '<section class="ip ip-d" aria-label="Keys and search">' + head("keys", "Find it fast", "") +
        '<button type="button" class="ip-find" data-act="search"><span class="ip-i">' + ico("search") + "</span><span>Search recipes or ingredients</span>" + (s.touch ? "" : kbd("/")) + "</button>" +
        (s.touch ? quiet("hand", "Tap a recipe to open it", "Keys need a keyboard.") : '<ul class="ip-keys">' + K.map(function (r) { return keyRow(r[0], r[1]); }).join("") + "</ul>") + "</section>";
    },
    f: function (s, st) {
      if (!st.total) return emptyRecipes(s);
      var any = st.ready.length || st.planned.length || st.lately.length;
      if (!any && st.known) return '<section class="ip ip-f ip-calm" aria-label="What to cook"><p class="ip-line">Pick a recipe to see it here.</p>' + foot(s.touch, "a recipe") + "</section>";
      return '<section class="ip ip-f" aria-label="What to cook">' + head("chef", "What to cook", st.total + " recipes") +
        (st.known ? (st.ready.length ? block({ f: "ready", act: "chip", icon: "check", tone: "sage", title: "Ready now", list: st.ready, cap: 3, sub: function (x) { return x.min + " min"; } }) : "")
          : '<p class="ip-note">Kitchie cannot read the pantry right now, so it cannot say what is ready.</p>') +
        (st.planned.length ? block({ f: "planned", act: "", icon: "cal", title: "Planned this week", list: st.planned, cap: 2, sub: function (x) { return x.min + " min"; } }) : "") +
        (st.lately.length ? block({ f: "lately", act: "", icon: "clockback", title: "Cooked lately", list: st.lately, cap: 2, sub: function (x) { return cooked(x.cd); } }) : "") +
        foot(s.touch, "a recipe") + "</section>";
    }
  };
  function emptyRecipes(s) {
    return '<section class="ip ip-empty" aria-label="No recipes yet">' + head("chef", "No recipes yet", "") + '<div class="ip-acts">' +
      action({ act: "assistant", icon: "spark", title: "Ask your assistant to add one", sub: "Recipes are added through your AI app" }) + "</div>" +
      '<p class="ip-foot">Once there is a recipe, this space shows what you can cook.</p></section>';
  }

  /* s = { screen, opt, data, items, cap, touch, recent }  ->  HTML (empty string for option e: no pane at all) */
  window.EP_PANE = function (s) {
    if (s.opt === "e") return "";
    if (s.screen === "pantry") return PANTRY[s.opt](s, pantryStats(s.items));
    return RECIPES[s.opt](s, recipeStats(s.items, s.data));
  };
  window.EP_STATS = { pantry: pantryStats, recipes: recipeStats, when: when, cooked: cooked, ago: ago, close: CLOSE, ico: ico };
})();
