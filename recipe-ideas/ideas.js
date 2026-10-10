/* Cooking ideas: sample signals, the ranking, and the shared renderers for the Home pane and the full ideas screen.
   Builds on ../recipe/recipe.js (RCP: recipes, pantry, personas, icons, sheet, toast).
   The ranking function (rank) is written as the build would have it: pure, given signals in, ideas plus reasons out. It runs in Kitchie
   (the caller), never in Recipe (Recipe never reasons). Sample values (names, dates, rules) live only in this file. */
(function () {
  var X = window.RCP, ic = X.ic, esc = X.esc, P = X.P;
  var Q = X.Q;
  var pick = function (k, d) { var v = Q.get(k); if (v) { X.store.set("i-" + k, v); return v; } return X.store.get("i-" + k, d); };
  var S = {
    pane: pick("pane", "A"),     /* I-O1 pane layout */
    tune: pick("tune", "A"),     /* I-O2 tuning */
    ai: pick("ai", "A"),         /* I-O3 assistant path */
    state: Q.get("state") || "normal", /* normal | cold | low | nostock | nothing | planned | late | morning (not remembered: a link pins it) */
    lean: X.store.get("i-lean-" + P.persona, P.persona === "batch" ? "batch" : "balanced")
  };

  /* Extra icons this slice needs (the shared set has no info, sliders, sun, moon). */
  var EX = {
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.2"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'
  };
  var ix = function (n, c) { return EX[n] ? '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + EX[n] + "</svg>" : ic(n, c); };

  /* ---------- Signals (sample). In the build each line names where it is read from. ---------- */
  /* Kitchie: use-by in days from today, for stock lines Recipe matched by name (matched_as). Not in the inventory capability on purpose: Kitchie joins it itself. */
  var USEBY = { spinach: 1, mushrooms: 2, cream: 3, eggs: 6 };
  /* Kitchie: days since last cooked, from cooking_sessions and past plan_entries (preferences Q-F9: Kitchie counts, not Recipe's last_used). */
  var LAST = { efr: 6, cur: 9, pas: 14, sha: 20, fri: 30, rag: 40, oml: 1 };
  /* Kitchie: freezer portions of a saved recipe (batch cook end, R-D19, put into Pantry, Freezer). */
  var FREEZER = [{ id: "cur", portions: 3, when: "28 Sep" }];
  /* Kitchie: this week's plan (Monday first). Tuesday is today. */
  var WEEK = [["Mon", "oml", "cooked"], ["Tue", null], ["Wed", null], ["Thu", null, "off"], ["Fri", null], ["Sat", null], ["Sun", "Roast chicken", "adhoc"]];
  /* Kitchie: food rules (preferences option B, food F1 to F4). Avoid excludes, like and dislike weigh, cap counts. */
  var MEMBERS = [["sam", "Sam"], ["jane", "Jane"], ["alex", "Alex"], ["priya", "Priya"]];
  var RULES = [
    { who: "jane", rule: "dislike", match: "mushrooms", said: "Jane: \"not a mushroom person\"" },
    { who: "alex", rule: "avoid", match: "mince", said: "Alex avoids beef" },
    { who: "sam", rule: "cap", match: "eggs", max: 3, said: "Sam: \"eggs no more than three times a week\"", count: 1 }
  ];
  /* Recipe: a version in the "trying" state (recipe-versions slice). Only the person who made it gets the nudge. */
  var TRYING = { efr: { v: "v2", name: "Less soy, more garlic", by: "improviser" } };
  /* Kitchie: what is already on the shopping list (a missing item that is on the list costs less). */
  var ONLIST = { feta: 1 };
  var NAMES = { sam: "Sam", jane: "Jane", alex: "Alex", priya: "Priya" };
  var meKey = { weeknight: "sam", batch: "priya", improviser: "alex", follower: "jane" }[P.persona] || "sam";

  var eaters = (function () { var v = X.store.get("i-eat-" + P.persona, ""); return v ? v.split(",") : MEMBERS.map(function (m) { return m[0]; }); })();
  var saveEaters = function () { X.store.set("i-eat-" + P.persona, eaters.join(",")); };
  var snoozed = (function () { try { return JSON.parse(X.store.get("i-snooze", "{}")); } catch (e) { return {}; } })();
  var saveSnooze = function () { X.store.set("i-snooze", JSON.stringify(snoozed)); };

  var LEANS = [["balanced", "Balanced"], ["use", "Use it up"], ["quick", "Quick"], ["fav", "Favourites"], ["new", "Something different"], ["batch", "Batch"]];
  var W = function (lean, k) { /* lean doubles one family of reasons; nothing else changes (I-D7) */
    var m = { use: { useup: 2 }, quick: { time: 2 }, fav: { fav: 2 }, new: { rot: 2, fav: 0 }, batch: { batch: 2 } }[lean] || {};
    return m[k] == null ? 1 : m[k];
  };

  /* ---------- The ranking (I-D4 to I-D9). Pure: signals in, ideas and left-out out. ---------- */
  function rank(opt) {
    opt = opt || {};
    var lean = opt.lean || S.lean, who = opt.eaters || eaters, stockKnown = S.state !== "nostock";
    var hour = S.state === "late" ? 21 : S.state === "morning" ? 8 : 17;
    var weekday = true;
    var ideas = [], out = [];
    var planned = {}; WEEK.forEach(function (d, i) { if (d[1] && i >= 1 && d[2] !== "adhoc") planned[d[1]] = d[0]; });
    var frozen = {}; FREEZER.forEach(function (f) { frozen[f.id] = f; });

    X.R.forEach(function (r) {
      var res = X.resolve(r), ings = res.ings;
      var keys = ings.map(function (x) { return x.i[0]; });
      /* 1. Hard filters: never shown as ideas, listed under "Left out" with the reason (I-D5). */
      var avoid = RULES.filter(function (u) { return u.rule === "avoid" && who.indexOf(u.who) > -1 && keys.indexOf(u.match) > -1; })[0];
      if (avoid) { out.push({ r: r, why: avoid.said + " · " + NAMES[avoid.who] + " is eating" }); return; }
      var cap = RULES.filter(function (u) { return u.rule === "cap" && who.indexOf(u.who) > -1 && keys.indexOf(u.match) > -1 && u.count >= u.max; })[0];
      if (cap) { out.push({ r: r, why: "Cap reached: " + cap.said }); return; }
      if (planned[r.id]) { out.push({ r: r, why: "Already on the plan for " + planned[r.id] }); return; }
      if (LAST[r.id] != null && LAST[r.id] <= 2) { out.push({ r: r, why: "Cooked " + (LAST[r.id] === 1 ? "yesterday" : LAST[r.id] + " days ago") }); return; }
      if (snoozed[r.id] === today()) { out.push({ r: r, why: "You said not tonight" }); return; }

      var why = [], miss = [], unk = 0;
      var add = function (k, pts, text, src) { var w = W(lean, k); if (pts && w) why.push({ k: k, pts: pts * w, text: text, src: src }); };

      /* 2. Ready: from what_am_i_missing / what_can_i_cook. Held for another meal counts as missing (plan-week-ai 33). Unknown stays unknown. */
      if (stockKnown) {
        ings.forEach(function (x) { if (!X.has(x.i[0])) miss.push(x.i); });
        if (!miss.length) add("ready", 3, "Everything is in", "Recipe what_can_i_cook, stock from Kitchie");
        else if (miss.length === 1) add("ready", ONLIST[miss[0][0]] ? 1.5 : 1, "Needs " + miss[0][1].toLowerCase() + (ONLIST[miss[0][0]] ? " (already on your list)" : ""), "Recipe what_am_i_missing");
        else if (miss.length === 2) add("ready", 0.01, "Needs " + miss.length + " things", "Recipe what_am_i_missing");
        else add("ready", -2, "Needs " + miss.length + " things", "Recipe what_am_i_missing");
      }
      /* 3. Use it up: ingredients whose stock line is close to its use-by. Capped so one recipe cannot win on this alone. */
      if (stockKnown) {
        var u = 0, names = [];
        ings.forEach(function (x) { var d = USEBY[x.i[0]]; if (d != null && d <= 3 && X.has(x.i[0])) { u += d <= 1 ? 3 : 2; names.push(x.i[1].toLowerCase().replace(/^tinned /, "")); } });
        if (u) add("useup", Math.min(u, 4), "Uses " + list(names) + " before " + (names.length > 1 ? "they go" : "it goes"), "Kitchie use-by dates");
      }
      /* 4. Rotation: not had for a while lifts, had recently sinks. */
      var l = LAST[r.id];
      if (l == null) add("rot", 1.5, "Never cooked yet", "Kitchie cooking history");
      else if (l >= 30) add("rot", 2, "Not had for a month", "Kitchie cooking history");
      else if (l >= 14) add("rot", 1, "Not had for " + Math.round(l / 7) + " weeks", "Kitchie cooking history");
      else if (l <= 4) add("rot", -2, "Had " + l + " days ago", "Kitchie cooking history");
      /* 5. Favour: household star and vote (Recipe preferences). */
      if (r.star) add("fav", 1, "A household favourite", "Recipe star");
      /* 6. Person rules for the people eating: like and dislike weigh, never exclude (food F3). */
      RULES.forEach(function (u) { if (who.indexOf(u.who) < 0 || keys.indexOf(u.match) < 0) return; if (u.rule === "dislike") add("pref", -1.5, NAMES[u.who] + " is not keen on " + u.match, "Kitchie food rules (" + NAMES[u.who] + ")"); if (u.rule === "like") add("pref", 1, NAMES[u.who] + " likes " + u.match, "Kitchie food rules"); });
      /* 7. Trying a version: only the person who made it, and only until they have cooked it. */
      var t = TRYING[r.id]; if (t && t.by === P.persona) add("try", 1.5, "You are trying “" + t.name + "”", "Recipe version status");
      /* 8. Time fit: a weekday evening wants 30 minutes or less. */
      if (weekday && r.min <= 30) add("time", 1, r.min + " minutes", "Recipe prep + cook minutes");
      if (weekday && r.min > 60) add("time", -2, r.min + " minutes, long for a weeknight", "Recipe prep + cook minutes");
      /* 9. Batch: on a batch lean, recipes that freeze lift. */
      if (r.batch) add("batch", P.persona === "batch" ? 1 : 0.01, "Makes " + r.serves + ", freezes", "Recipe tags");

      var idea = { r: r, miss: miss, why: why, kind: "cook" };
      /* A dish already in the freezer is offered as eating from the freezer, not cooking again (I-D9). */
      if (frozen[r.id]) {
        var f = frozen[r.id];
        idea = { r: r, miss: [], kind: "freezer", why: [{ k: "freezer", pts: 3, text: f.portions + " portions in the freezer from " + f.when, src: "Kitchie Pantry, Freezer" }, { k: "time", pts: 1 * W(lean, "time"), text: "Reheat in 10 minutes", src: "" }] };
        if (W(lean, "useup") > 1) idea.why.push({ k: "useup", pts: 1, text: "Frees the freezer", src: "" });
      }
      idea.score = idea.why.reduce(function (a, b) { return a + b.pts; }, 0);
      idea.line = oneLine(idea);
      ideas.push(idea);
    });

    /* Tie-break: fewer missing, then longest since cooked. Then keep variety in the first three: no two with the same main ingredient. */
    ideas.sort(function (a, b) { return b.score - a.score || a.miss.length - b.miss.length || (LAST[b.r.id] || 99) - (LAST[a.r.id] || 99); });
    if (S.state === "nothing") { out = out.concat(ideas.map(function (i) { return { r: i.r, why: "Needs 3 or more things you do not have" }; })); ideas = []; }
    if (S.state === "low") ideas = ideas.filter(function (i) { return i.r.id === "sha" || i.r.id === "oml"; });
    var keep = ideas.filter(function (i) { return i.score > 0; });
    return { ideas: keep, weak: ideas.filter(function (i) { return i.score <= 0; }), out: out, hour: hour, stockKnown: stockKnown };
  }
  function oneLine(idea) { /* I-D10: the strongest positive reason, plus what is missing; never more than one line */
    var pos = idea.why.filter(function (w) { return w.pts > 0.5 && w.k !== "ready"; }).sort(function (a, b) { return b.pts - a.pts; });
    var ready = idea.why.filter(function (w) { return w.k === "ready"; })[0];
    var a = pos[0] ? pos[0].text : ready ? ready.text : "";
    var neg = idea.why.filter(function (w) { return w.k === "pref" && w.pts < 0; })[0];
    /* second half: what is missing wins, then a caveat for someone eating, then "all in" */
    var b = idea.miss.length && ready ? ready.text : neg ? neg.text : ready && pos[0] ? "all in" : pos[1] ? pos[1].text.toLowerCase() : "";
    return a + (b && b !== a ? " · " + b : "");
  }
  function list(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function today() { return "2026-10-13"; }
  var rtag = function (i) {
    if (i.kind === "freezer") return '<span class="rtag">' + ic("snow", "xs") + "Freezer</span>";
    var top = i.why.filter(function (w) { return w.pts > 0.5; }).sort(function (a, b) { return b.pts - a.pts; })[0];
    if (!top) return "";
    return { useup: '<span class="rtag dan">' + ix("leaf", "xs") + "Use it up</span>", try: '<span class="rtag acc">' + ic("branch", "xs") + "Trying</span>", rot: '<span class="rtag">Not had lately</span>', fav: '<span class="rtag acc">' + ic("star", "xs") + "Favourite</span>", ready: '<span class="rtag">' + ic("check", "xs") + "All in</span>", time: '<span class="rtag">' + ic("clock", "xs") + "Quick</span>", batch: '<span class="rtag">' + ic("snow", "xs") + "Batch</span>" }[top.k] || "";
  };

  /* ---------- Renderers ---------- */
  var ph = function (i) { return (P.photos === "on" && i.r.photos[0]) || i.r.e; };
  var lead = function (i) {
    var m = i.miss.length;
    var meta = i.kind === "freezer" ? "From the freezer · reheat 10 min" : i.r.min + " min · " + (i.r.batch ? "makes " + i.r.serves : "for " + eaters.length);
    return '<div class="idl" data-id="' + i.r.id + '"><a class="top2" href="../recipe/detail.html?id=' + i.r.id + '&from=idea"><span class="ph" aria-hidden="true">' + ph(i) + '</span><span class="t"><b>' + esc(i.r.name) + '</b><small style="display:block;color:var(--muted);font-size:12.5px;margin-top:2px">' + meta + '</small><span class="why">' + ix("bulb") + "<span>" + esc(i.line) + "</span></span></span></a>" +
      '<div class="acts">' +
      (i.kind === "freezer"
        ? '<button type="button" class="btn" data-act="eat" data-id="' + i.r.id + '">' + ic("snow", "s") + "Have it tonight</button>"
        : '<a class="btn" href="../recipe/cook.html?id=' + i.r.id + '&from=idea">' + ic("flame", "s") + "Cook now</a>") +
      '<button type="button" class="btn ghost" data-act="plan" data-id="' + i.r.id + '">' + ic("cal", "s") + "Plan</button>" +
      '<button type="button" class="ib" data-act="why" data-id="' + i.r.id + '" aria-label="Why this idea">' + ix("info", "s") + "</button></div>" +
      (m && m < 3 ? '<div style="display:flex;align-items:center;gap:8px;padding:0 12px 12px;font-size:13px;color:var(--muted)"><span style="flex:1">Missing: ' + i.miss.map(function (x) { return esc(x[1].toLowerCase()); }).join(", ") + '</span><button type="button" class="mini ico" data-act="cart" data-id="' + i.r.id + '" aria-label="Add the missing to shopping">' + ic("cart", "s") + "</button></div>" : "") +
      "</div>";
  };
  var row = function (i, full) {
    /* A link and the Why button side by side (never a button inside a link). */
    var inner = '<a class="go" href="../recipe/detail.html?id=' + i.r.id + '&from=idea"><span class="e" aria-hidden="true">' + ph(i) + '</span><span class="t">' + (full ? rtag(i) : "") + "<b>" + esc(i.r.name) + '</b><span class="why"><span>' + esc(i.line) + "</span></span></span>" + (full ? "" : '<span class="chev">' + ic("chev", "s") + "</span>") + "</a>";
    return '<div class="idr" data-id="' + i.r.id + '">' + inner + (full ? '<button type="button" class="ib bare" data-act="why" data-id="' + i.r.id + '" aria-label="Why ' + esc(i.r.name) + '">' + ix("info", "s") + "</button>" : "") + "</div>";
  };
  var aiRow = function () { /* I-O3 B: an idea the assistant pinned for today. Made up, nothing saved behind it (plan-week-ai 7c label). */
    return '<div class="idr"><a class="go" href="#" data-act="aiidea"><span class="e" aria-hidden="true">🥗</span><span class="t"><span class="rtag acc">' + ic("spark", "xs") + 'From your assistant</span><b>Warm lentil and spinach salad</b><span class="why"><span>“Uses the spinach and lentils; Sam asked for something light”</span></span></span><span class="chev">' + ic("chev", "s") + "</span></a></div>";
  };

  function header(title, sub) {
    return '<div class="th2"><span class="ric t2" aria-hidden="true">' + ic("chef", "s") + "</span><h2>" + title + "</h2>" +
      (S.tune === "A" ? '<button type="button" class="ib bare" data-act="tune" aria-label="Tune ideas">' + ix("sliders", "s") + "</button>" : "") +
      '<a class="va" href="all.html">See all</a></div>' + (sub ? '<p style="font-size:12.5px;margin-top:2px">' + sub + "</p>" : "");
  }
  function whoLine() {
    if (eaters.length === MEMBERS.length) return "";
    return "For " + list(eaters.map(function (k) { return NAMES[k]; }));
  }
  function pane() {
    var R = rank(), late = R.hour >= 20, morning = R.hour < 11;
    var title = late ? "Ideas for tomorrow" : "Ideas for tonight";
    var h = "";
    /* Product boundary: a household without Recipes never loads this (DESIGN.md 6). Drawn in the household flow already. */
    if (S.state === "cold") {
      return '<section class="ideas" aria-label="Cooking ideas">' + header("Cooking ideas") +
        '<div class="empt"><div class="big" aria-hidden="true">📖</div><b>No recipes yet</b><p>Ideas come from your own recipes, checked against what is in.</p><div class="row"><a class="btn sm" href="../recipe/add.html">' + ic("plus", "s") + 'Add a recipe</a><button type="button" class="btn ghost sm" data-act="askai">' + ic("spark", "s") + "Ask your assistant</button></div></div></section>";
    }
    var tonightPlanned = S.state === "planned" || P.persona === "follower";
    if (tonightPlanned) {
      h += '<a class="tonight" href="../recipe/detail.html?id=efr&from=plan"><span style="font-size:22px" aria-hidden="true">🍚</span><span class="t"><b>Tonight: Egg fried rice</b><small>Planned by Sam · for 4 · 1 missing</small></span><span class="chev">' + ic("chev", "s") + "</span></a>";
    }
    if (!R.ideas.length) {
      var fz = FREEZER[0];
      h += '<div class="empt"><div class="big" aria-hidden="true">🤔</div><b>Nothing fits tonight from what is in</b><p>Every recipe needs three or more things you do not have, or is left out for someone eating.</p><div class="row">' +
        '<button type="button" class="btn sm" data-act="eat" data-id="' + fz.id + '">' + ic("snow", "s") + "Freezer: curry, " + fz.portions + "</button>" +
        '<a class="btn ghost sm" href="all.html?lens=ahead">Plan ahead</a><button type="button" class="btn ghost sm" data-act="askai">' + ic("spark", "s") + "Ask your assistant</button></div></div>";
      return '<section class="ideas" aria-label="Cooking ideas">' + header(title) + h + "</section>";
    }
    var sub = [];
    if (whoLine()) sub.push(whoLine());
    if (S.lean !== "balanced") sub.push("Leaning: " + LEANS.filter(function (l) { return l[0] === S.lean; })[0][1]);
    var lst = R.ideas;
    if (tonightPlanned) {
      h += '<p class="sub">If plans change</p>' + lst.slice(0, P.persona === "follower" ? 1 : 2).map(function (i) { return row(i); }).join("");
    } else if (S.pane === "A") {
      h += lead(lst[0]) + '<div style="margin-top:4px">' + (S.ai === "B" ? aiRow() : "") + lst.slice(1, S.ai === "B" ? 2 : 3).map(function (i) { return row(i); }).join("") + "</div>";
    } else if (S.pane === "B") {
      h += '<div class="isnap" id="isnap">' + lst.slice(0, 5).map(lead).join("") + "</div>" + '<div class="idots" aria-hidden="true">' + lst.slice(0, 5).map(function (_, n) { return '<i class="' + (n ? "" : "on") + '"></i>'; }).join("") + "</div>";
    } else {
      h += '<div style="margin-top:4px">' + (S.ai === "B" ? aiRow() : "") + lst.slice(0, 4).map(function (i) { return row(i, true); }).join("") + "</div>";
    }
    if (!R.stockKnown) h += '<p class="warnl">' + ix("info", "s") + "<span>Cannot see the pantry right now, so these are not checked against what is in. Nothing is marked missing.</span></p>";
    if (S.state === "low") h += '<p class="warnl">' + ix("bulb", "s") + '<span>Only two recipes so far. Ideas get better with more: <a href="../recipe/add.html" style="color:var(--accent);font-weight:700">add one</a>.</span></p>';
    if (morning && !tonightPlanned) h += '<p class="warnl">' + ic("snow", "s") + "<span>Curry in the freezer? Take it out this morning for tonight.</span></p>";
    if (S.ai === "A" && !tonightPlanned) h += '<div class="pfoot"><button type="button" class="lnk2 mut" data-act="askai">' + ic("spark", "s") + "Ask your assistant for more</button></div>";
    return '<section class="ideas" aria-label="Cooking ideas">' + header(title, sub.join(" · ")) + h + "</section>";
  }

  /* ---------- Sheets ---------- */
  function whySheet(id) {
    var R = rank(), i = R.ideas.concat(R.weak).filter(function (x) { return x.r.id === id; })[0];
    if (!i) return;
    var rows = i.why.slice().sort(function (a, b) { return Math.abs(b.pts) - Math.abs(a.pts); }).map(function (w) {
      var s = w.pts > 0.05 ? "+" : w.pts < -0.05 ? "−" : "·";
      return '<div class="rs"><span class="sg ' + (s === "−" ? "dn" : s === "·" ? "nt" : "") + '" aria-hidden="true">' + s + '</span><span style="flex:1">' + esc(w.text) + (w.src ? "<small>" + esc(w.src) + "</small>" : "") + "</span></div>";
    }).join("");
    X.sheet('<h3>Why ' + esc(i.r.name) + "</h3><p style=\"font-size:13px\">Ranked " + (R.ideas.indexOf(i) + 1) + " of " + R.ideas.length + " for " + (eaters.length === MEMBERS.length ? "everyone" : list(eaters.map(function (k) { return NAMES[k]; }))) + ", tonight.</p>" +
      '<div style="margin-top:8px">' + rows + "</div>" +
      '<p class="srcs">Worked out by Kitchie from your pantry, plan and food rules, and Recipe’s recipes. Nothing here was guessed by an AI.</p>' +
      '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button type="button" class="btn ghost sm" data-not>Not tonight</button><button type="button" class="btn ghost sm" data-meh>Not for me</button><a class="btn sm" href="../recipe/detail.html?id=' + i.r.id + '&from=idea">Open</a></div>',
      function (s, close) {
        s.querySelector("[data-not]").onclick = function () { close(); snoozed[id] = today(); saveSnooze(); redraw(); X.toast(esc(i.r.name) + " is off tonight’s ideas", function () { delete snoozed[id]; saveSnooze(); redraw(); }); };
        s.querySelector("[data-meh]").onclick = function () { close(); X.toast("Noted: " + NAMES[meKey] + " is not keen on " + esc(i.r.name.toLowerCase()) + ". Change it in Preferences.", function () {}); };
      });
  }
  function tuneSheet() {
    var draw = function (s) {
      s.querySelector(".tb").innerHTML = "<h3>Tune ideas</h3><p style=\"font-size:13px\">Just for you, on every device. Your food rules still apply.</p>" +
        '<div class="lblrow"><span class="lbl">Lean towards</span></div><div class="segs" role="group" aria-label="Lean towards">' + LEANS.map(function (l) { return '<button type="button" data-lean="' + l[0] + '" aria-pressed="' + (S.lean === l[0]) + '">' + l[1] + "</button>"; }).join("") + "</div>" +
        '<div class="lblrow"><span class="lbl">Who is eating tonight</span></div><div class="segs" role="group" aria-label="Who is eating">' + MEMBERS.map(function (m) { return '<button type="button" data-eat="' + m[0] + '" aria-pressed="' + (eaters.indexOf(m[0]) > -1) + '">' + m[1] + "</button>"; }).join("") + "</div>" +
        '<p style="font-size:12.5px;margin-top:8px">Taken from tonight’s plan when there is one. Changing it here is for tonight only.</p>' +
        '<div style="display:flex;gap:8px;margin-top:16px"><button type="button" class="btn ghost" data-reset>Reset</button><button type="button" class="btn" data-close>Done</button></div>';
    };
    X.sheet('<div class="tb"></div>', function (s, close) {
      draw(s);
      s.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        if (b.dataset.lean) { S.lean = b.dataset.lean; X.store.set("i-lean-" + P.persona, S.lean); draw(s); redraw(); }
        else if (b.dataset.eat) { var k = b.dataset.eat, j = eaters.indexOf(k); if (j > -1 && eaters.length > 1) eaters.splice(j, 1); else if (j < 0) eaters.push(k); saveEaters(); draw(s); redraw(); }
        else if (b.hasAttribute("data-reset")) { S.lean = "balanced"; X.store.set("i-lean-" + P.persona, S.lean); eaters = MEMBERS.map(function (m) { return m[0]; }); saveEaters(); draw(s); redraw(); }
      });
    });
  }
  function askAi() {
    X.sheet('<h3>Ask your assistant</h3><p style="font-size:13px">Opens your default AI app (plan-week-ai decision 45). It reads the same ideas and reasons through Kitchie, so it starts where this list ends.</p>' +
      '<div class="note" style="margin-top:12px;font-size:13.5px"><span class="lbl">Starts the chat with</span><p style="color:var(--fg);margin-top:4px">“What should we cook tonight? Use Kitchie’s ideas for us.”</p></div>' +
      '<div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn" data-close>' + ic("spark", "s") + "Open</button></div>");
  }

  var redraw = function () { if (window.ideasRedraw) window.ideasRedraw(); };
  /* One delegated handler for both screens. */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var a = b.dataset.act, id = b.dataset.id;
    if (a === "why") { e.preventDefault(); whySheet(id); }
    else if (a === "plan") { e.preventDefault(); window.planSheet(X.byId(id)); }
    else if (a === "tune") { e.preventDefault(); tuneSheet(); }
    else if (a === "askai") { e.preventDefault(); askAi(); }
    else if (a === "cart") { e.preventDefault(); X.toast("Added to shopping", function () { X.toast("Taken off the list"); }); }
    else if (a === "eat") { e.preventDefault(); X.toast("Curry from the freezer is on tonight’s plan", function () { X.toast("Taken off the plan"); }); }
    else if (a === "aiidea") { e.preventDefault(); X.toast("Made up by your assistant: plan it, or ask it to save it as a recipe"); }
  });

  /* Prototype controls for this slice, added to the shared Mockup panel. */
  var seg = function (k, opts, cur) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-iset="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>"; };
  var controlsHtml = function () {
    return "<h4>Ideas pane, option</h4>" + seg("pane", [["A", "A Lead + two"], ["B", "B Swipe cards"], ["C", "C Rows with tags"]], S.pane) +
      "<h4>Tuning, option</h4>" + seg("tune", [["A", "A Tune sheet"], ["B", "B Chips only"]], S.tune) +
      "<h4>Assistant, option</h4>" + seg("ai", [["A", "A Opens your AI app"], ["B", "B It can pin ideas"]], S.ai) +
      "<h4>State</h4>" + seg("state", [["normal", "Normal"], ["planned", "Tonight planned"], ["morning", "Morning"], ["late", "After 8pm"], ["low", "Few recipes"], ["cold", "No recipes"], ["nostock", "Pantry unreadable"], ["nothing", "Nothing fits"]], S.state);
  };
  document.addEventListener("click", function (e) {
    var x = e.target.closest("[data-iset]"); if (!x) return;
    var u = new URL(location.href);
    if (x.dataset.iset === "state") u.searchParams.set("state", x.dataset.v); else { X.store.set("i-" + x.dataset.iset, x.dataset.v); u.searchParams.delete(x.dataset.iset); }
    location.href = u.toString();
  });

  window.IDEAS = { S: S, rank: rank, pane: pane, lead: lead, row: row, aiRow: aiRow, whySheet: whySheet, tuneSheet: tuneSheet, controlsHtml: controlsHtml, ix: ix, LEANS: LEANS, MEMBERS: MEMBERS, NAMES: NAMES, eaters: function () { return eaters; }, list: list };
})();
