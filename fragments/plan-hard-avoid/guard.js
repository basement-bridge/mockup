/* Hard avoid guard on the Plan it panel. Sample data only, nothing is stored or sent.
   The rule (owner, 12 Oct 2026): a Hard avoid blocks a hand-planned meal only when the person is part of the meal (a meal for them,
   or a household meal that includes them). The shopping list is not blocked. A meal for other people is untouched. Soft never blocks.
   The panel is the "Plan it" day picker (recipe/plan-sheet.js, R-D28) with a For row in place of the People counter (Proposal).
   Params: state=stop|warn|warn2|excluded|excluded2|clear|others|soft  (presets), then r=pasta|curry|shak|stir  for=all|Sam|Jane|Kai
   hh=2|3  day=Mon..Sun  planned=1 (already planned)  closed=1 (panel closed). */
(function () {
  "use strict";
  var Q = new URLSearchParams(location.search);
  var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], DF = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var DATE = [12, 13, 14, 15, 16, 17, 18]; /* next week, October 2026 */
  var ME = "Sam";
  var RECIPES = {
    pasta: { e: "🍝", n: "Mushroom pasta", ing: ["pasta", "mushrooms", "cream"] },
    curry: { e: "🍛", n: "Chicken curry", ing: ["chicken thighs", "veg bag", "curry sauce", "jasmine rice"] },
    shak: { e: "🥚", n: "Shakshuka", ing: ["eggs", "tomatoes", "onion", "feta"] },
    stir: { e: "🥘", n: "Veg stir-fry", ing: ["rice", "carrots", "spring greens", "soy sauce"] },
    left: { e: "♻️", n: "Leftovers: chicken curry", ing: [] },
    rice: { e: "🍳", n: "Egg fried rice", ing: ["eggs", "rice", "spring onion"] },
    patty: { e: "🐟", n: "Salmon patties", ing: ["canned salmon", "potatoes", "eggs", "dill", "lemon"] }
  };
  /* what each person has chosen (type is Hard or Soft, reason is their own words; SW-59). SW-O48 resolved: a Hard avoid's reason is never drawn here (the viewer is Sam, never the owner); only the Soft line quotes it */
  var AVOIDS = {
    Jane: [{ item: "mushrooms", type: "hard", reason: "Allergic, makes me ill" }, { item: "onion", type: "soft", reason: "don't like it" }],
    Kai: [{ item: "cream", type: "hard", reason: "Can't have dairy" }]
  };
  var PRESET = {
    stop: { r: "pasta", f: "Jane" }, warn: { r: "pasta", f: "all" }, warn2: { r: "pasta", f: "all", hh: 3 },
    excluded: { r: "pasta", f: "all", done: 1 }, excluded2: { r: "pasta", f: "all", hh: 3, done: 1 },
    clear: { r: "curry", f: "all" }, others: { r: "pasta", f: "Sam" }, soft: { r: "shak", f: "all" }
  };
  var pre = PRESET[Q.get("state")] || PRESET.warn;
  var S = {
    r: Q.get("r") && RECIPES[Q.get("r")] ? Q.get("r") : pre.r,
    f: Q.get("for") || pre.f,
    hh: +(Q.get("hh") || pre.hh || 2) === 3 ? 3 : 2,
    day: DN.indexOf(Q.get("day")) > -1 ? Q.get("day") : "Sat",
    panel: Q.get("closed") === "1" ? null : "edit", added: [], toast: null
  };
  var MEMBERS = function () { return S.hh === 3 ? ["Sam", "Jane", "Kai"] : ["Sam", "Jane"]; };
  if (MEMBERS().indexOf(S.f) < 0 && S.f !== "all") S.f = "all";
  var BASE = [
    { day: "Mon", r: "shak", f: "all" }, { day: "Tue", r: "rice", f: "all" }, { day: "Wed", r: "curry", f: "all" },
    { day: "Thu", r: "patty", f: "all" }, { day: "Fri", r: "left", f: "Sam" }, { day: "Sun", r: "stir", f: "Jane" }
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function join(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  var I = {
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
    warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.2"/></svg>',
    soft: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.2"/></svg>',
    slash: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M6.3 6.3l11.4 11.4"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    plan: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v3M16 3v3M8 14h3M13 14h3M8 17h3"/>',
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    pantry: '<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',
    recipes: '<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',
    cartn: '<path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/>'
  };

  /* ---- matching: whole words on the title and the ingredient lines, as the engine does (SW-58); no traces, no hidden ingredients ---- */
  function stem(w) { return w.toLowerCase().replace(/(es|s)$/, ""); }
  function words(s) { return s.split(/[^a-z]+/i).filter(Boolean).map(stem); }
  function has(text, item) { var t = words(text), w = words(item); return w.length > 0 && w.every(function (x) { return t.indexOf(x) > -1; }); }
  function matches(person, type) {
    var rec = RECIPES[S.r], out = [];
    (AVOIDS[person] || []).forEach(function (a) {
      if (a.type !== type) return;
      var ing = rec.ing.filter(function (i) { return has(i, a.item); })[0] || (has(rec.n, a.item) ? a.item : null);
      if (ing) out.push({ p: person, item: a.item, ing: ing, reason: a.reason });
    });
    return out;
  }
  function eaters() { return S.f === "all" ? MEMBERS() : [S.f]; }
  function check() {
    var who = eaters(), hard = [], soft = [];
    who.forEach(function (p) { hard = hard.concat(matches(p, "hard")); soft = soft.concat(matches(p, "soft")); });
    var blocked = [];
    hard.forEach(function (h) { if (blocked.indexOf(h.p) < 0) blocked.push(h.p); });
    var mode = !blocked.length ? "ok" : (S.f !== "all" || blocked.length === who.length) ? "stop" : "warn";
    return { mode: mode, hard: hard, soft: soft, blocked: blocked, who: who };
  }

  /* ---- the agenda behind the panel ---- */
  function cardsFor(day) {
    var cs = BASE.filter(function (c) { return c.day === day && (c.f === "all" || MEMBERS().indexOf(c.f) > -1); });
    S.added.forEach(function (a, i) { if (a.day === day) cs = cs.concat([{ day: day, r: a.r, f: a.f, out: a.out, fresh: i === S.added.length - 1 }]); });
    return cs;
  }
  function avatar(c) {
    if (c.f === "all") return '<span class="av all" title="Everyone">👥</span>';
    return '<span class="av' + (c.f === ME ? "" : " j") + '" title="' + esc(c.f) + '">' + esc(c.f.charAt(0)) + "</span>";
  }
  function cardHtml(c) {
    var r = RECIPES[c.r], out = c.out || [], n = c.f === "all" ? MEMBERS().length - out.length : 1;
    var who = c.f === "all" ? (out.length ? join(MEMBERS().filter(function (m) { return out.indexOf(m) < 0; })) : "Everyone") : c.f;
    var meta = r.ing.length ? who + " · " + plural(n, "person").replace("persons", "people") : who;
    var tag = out.length ? '<span class="chips"><span class="tg mute" data-notfor>' + I.slash + "Not for " + esc(join(out)) + "</span></span>" : "";
    var av = c.f === "all" && out.length ? avatar({ f: ME }) : avatar(c); /* the avatar of a meal with someone left out is the planner's, not the group icon */
    return '<div class="mcw' + (c.fresh ? " fresh" : "") + '"><div class="mc" data-card="' + esc(c.r) + '"><span class="e">' + r.e + '</span><span class="t"><b>' + esc(r.n) + "</b><small>" + esc(meta) + "</small>" + tag + "</span>" + av + "</div></div>";
  }
  function boardHtml() {
    return DN.map(function (d, i) {
      var cs = cardsFor(d), tgt = d === S.day && S.panel === "edit";
      return '<section class="day' + (tgt ? " target" : "") + '" data-day="' + d + '" aria-label="' + DF[i] + " " + DATE[i] + ' Oct"><header class="dh"><span class="dn">' + d + '</span><span class="dd">' + DATE[i] + " Oct</span></header><div class=\"stack\">"
        + (cs.length ? cs.map(cardHtml).join("") : '<div class="slot" aria-label="' + DF[i] + ', nothing planned"></div>') + "</div></section>";
    }).join("");
  }

  /* ---- the panel ---- */
  function ingLine() {
    var rec = RECIPES[S.r], c = check(), hit = c.hard.map(function (h) { return h.ing; });
    return rec.ing.map(function (i) { return hit.indexOf(i) > -1 ? "<em>" + esc(i) + "</em>" : esc(i); }).join(", ");
  }
  function guardHtml(c) {
    var rec = RECIPES[S.r];
    if (c.mode === "stop") {
      var names = c.blocked, one = S.f !== "all";
      var h = '<div class="guard stop" id="guard" role="alert" data-mode="stop"><div class="gh">' + I.stop + "<b>" + (one ? "Not for " + esc(S.f) : "Not for anyone in this meal") + "</b></div>";
      if (one) {
        var m = c.hard[0];
        h += "<p>" + esc(rec.n) + ' has <em class="hit">' + esc(m.ing) + "</em> in it. " + esc(S.f) + " has a hard avoid on " + esc(m.item) + ".</p>"
          + "<p>A hard avoid is avoided completely, so this meal cannot be planned for " + esc(S.f) + ". Pick someone else above, or choose another meal.</p>";
      } else {
        h += "<p>Everyone in this meal has a hard avoid on something in " + esc(rec.n) + ".</p>" + whoList(c) + "<p>Choose another meal.</p>";
      }
      return h + "</div>";
    }
    if (c.mode === "warn") {
      var n = c.blocked, left = c.who.filter(function (p) { return n.indexOf(p) < 0; });
      var h2 = '<div class="guard warn" id="guard" role="alert" data-mode="warn"><div class="gh">' + I.warn + "<b>" + esc(join(n)) + (n.length === 1 ? " is" : " are") + " part of this meal</b></div>"
        + "<p>This meal is for everyone, so it includes " + esc(join(n)) + ". " + esc(rec.n) + " has " + (n.length === 1 ? "<em class=\"hit\">" + esc(c.hard[0].ing) + "</em> in it, and " + esc(n[0]) + " has a hard avoid on " + esc(c.hard[0].item) + "." : "things " + esc(join(n)) + " avoid completely.") + "</p>"
        + (n.length === 1 ? "" : whoList(c));
      return h2 + '<button type="button" class="btn pri" data-leave>Leave ' + esc(join(n)) + " out of this meal</button>"
        + '<p class="after">Plans ' + esc(DF[DN.indexOf(S.day)]) + " for " + esc(join(left)) + " only and marks it not for " + esc(join(n)) + ". Quantities are worked out for " + esc(join(left)) + ".</p></div>";
    }
    if (c.soft.length) {
      var s = c.soft[0];
      return '<p class="softnote" id="guard" role="status" data-mode="soft">' + I.soft + "<span>" + esc(s.p) + " would rather avoid " + esc(s.item) + " (soft: &ldquo;" + esc(s.reason) + "&rdquo;). " + esc(rec.n) + " has it, and that does not stop the meal.</span></p>";
    }
    return '<span id="guard" data-mode="ok"></span>';
  }
  function whoList(c) {
    var seen = [], h = '<ul class="who">';
    c.hard.forEach(function (m) {
      if (seen.indexOf(m.p) > -1) return; seen.push(m.p);
      h += "<li><b>" + esc(m.p) + "</b>: hard avoid on " + esc(m.item) + "</li>";
    });
    return h + "</ul>";
  }
  function forHtml() {
    var all = MEMBERS();
    var h = '<button type="button" aria-pressed="' + (S.f === "all") + '" data-for="all">Everyone<small>' + all.length + "</small></button>";
    all.forEach(function (m) { h += '<button type="button" aria-pressed="' + (S.f === m) + '" data-for="' + m + '">' + esc(m) + "</button>"; });
    return h;
  }
  function editHtml() {
    var rec = RECIPES[S.r], c = check(), n = c.who.length;
    var days = DN.map(function (d, i) { return '<button type="button" data-d="' + d + '" aria-pressed="' + (S.day === d) + '" aria-label="' + DF[i] + " " + DATE[i] + ' October">' + d + "<small>" + DATE[i] + "</small></button>"; }).join("");
    var foot = c.mode === "ok"
      ? '<button type="button" class="btn ghost" data-cancel>Cancel</button><button type="button" class="btn pri" data-plan>Plan for ' + DF[DN.indexOf(S.day)] + "</button>"
      : '<button type="button" class="btn ghost" data-cancel>Cancel</button><button type="button" class="btn' + (c.mode === "stop" ? " pri" : "") + '" data-other>Choose another meal</button>';
    return '<div class="top"><span class="ph">' + rec.e + '</span><div><h2 id="pt">Plan ' + esc(rec.n) + '</h2><p class="ingl2">' + ingLine() + '</p></div><button type="button" class="x" data-cancel aria-label="Cancel">&times;</button></div>'
      + '<div class="lbl">Day, next week</div><div class="days" role="group" aria-label="Day">' + days + "</div>"
      + '<div class="lbl">Who it is for</div><div class="fors" role="group" aria-label="Who it is for">' + forHtml() + "</div>"
      + '<p class="formeta">' + plural(n, "person").replace("persons", "people") + "</p>"
      + guardHtml(c) + '<div class="acts">' + foot + "</div>";
  }
  function plannedHtml() {
    var p = S.added[S.added.length - 1], rec = RECIPES[p.r], i = DN.indexOf(p.day);
    var inn = p.f === "all" ? MEMBERS().filter(function (m) { return p.out.indexOf(m) < 0; }) : [p.f];
    var rows = inn.map(function (m) { return '<div class="whorow"><span class="av' + (m === ME ? "" : " j") + '">' + esc(m.charAt(0)) + '</span><span class="nm"><b>' + esc(m) + "</b></span></div>"; }).join("");
    p.out.forEach(function (m) {
      var a = (AVOIDS[m] || []).filter(function (x) { return x.type === "hard" && matchesItem(p.r, x.item); })[0];
      rows += '<div class="whorow out" data-out="' + esc(m) + '"><span class="av">' + esc(m.charAt(0)) + '</span><span class="nm"><b>' + esc(m) + "</b><small>Left out: hard avoid on " + esc(a ? a.item : "something in it") + "</small></span>" + I.lock + "</div>";
    });
    return '<div class="top"><span class="ph">' + rec.e + '</span><div><h2 id="pt" tabindex="-1">' + esc(rec.n) + "</h2><p>" + DF[i] + " " + DATE[i] + ' Oct</p></div><button type="button" class="x" data-cancel aria-label="Close">&times;</button></div>'
      + '<div class="lbl">Who it is for</div><div id="whofor">' + rows + "</div>"
      + '<p class="formeta">' + (p.out.length ? "Quantities are worked out for " + esc(join(inn)) + ". " + esc(join(p.out)) + (p.out.length === 1 ? " is" : " are") + " not counted." : plural(inn.length, "person").replace("persons", "people") + ".") + "</p>";
  }
  function matchesItem(r, item) { var rec = RECIPES[r]; return rec.ing.some(function (i) { return has(i, item); }) || has(rec.n, item); }

  /* ---- shell ---- */
  function railHtml() {
    var NAV = [["home", "Home"], ["pantry", "Pantry"], ["plan", "Plan"], ["recipes", "Recipes"], ["cartn", "Shopping"]];
    return '<nav class="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div>' + NAV.map(function (n) {
      var on = n[0] === "plan"; return '<button type="button" class="nv' + (on ? " on" : "") + '"' + (on ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true">' + I[n[0]] + "</svg><span>" + n[1] + "</span></button>";
    }).join("") + '<div class="me"><button type="button" class="av" aria-label="Profile and settings">S</button></div></nav>';
  }
  function render(focusId) {
    var root = q("#root"), edit = S.panel === "edit", done = S.panel === "planned" && S.added.length;
    var panel = edit ? editHtml() : done ? plannedHtml() : "";
    root.innerHTML = '<div class="app' + (panel ? "" : " nolane") + '" id="app">' + railHtml()
      + '<main class="main" id="main"><div class="hd"><div class="wk"><b>Next week</b><small>12 to 18 Oct · planning as Sam</small></div><button type="button" class="btn" data-reopen>Plan a meal</button></div><div class="board" role="group" aria-label="Week">' + boardHtml() + "</div></main>"
      + (panel ? '<aside class="panel' + (edit ? "" : " planned") + '" id="panel" role="dialog" aria-modal="false" aria-labelledby="pt">' + panel + "</aside>" : "") + "</div>"
      + (edit ? '<div class="sheet-dim" data-cancel></div>' : "")
      + (S.toast ? '<div class="toast" role="status"><span>' + esc(S.toast.t) + "</span>" + (S.toast.undo ? '<button type="button" data-undo>Undo</button>' : "") + "</div>" : "");
    if (focusId) { var f = q("#" + focusId); if (f) f.focus({ preventScroll: true }); }
  }
  function toast(t, undo) { S.toast = { t: t, undo: undo }; }

  function plan() {
    var c = check(), out = c.mode === "warn" ? c.blocked : [];
    S.added.push({ day: S.day, r: S.r, f: S.f, out: out });
    toast(plannedText(S.added[S.added.length - 1]), true);
    S.panel = "planned";
    render("pt");
  }
  function plannedText(a) {
    var left = a.f === "all" ? MEMBERS().filter(function (m) { return a.out.indexOf(m) < 0; }) : [a.f];
    return "Planned " + RECIPES[a.r].n + " for " + DF[DN.indexOf(a.day)] + (a.out.length ? ": " + join(left) + " only, " + join(a.out) + " left out." : ".");
  }
  function close() { if (S.panel === "edit") toast("Nothing was planned."); S.panel = null; render(); }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("button,[data-cancel]"); if (!t) return;
    if (t.dataset.d) { S.day = t.dataset.d; S.toast = null; render(); var b = q('[data-d="' + S.day + '"]'); if (b) b.focus({ preventScroll: true }); }
    else if (t.dataset["for"]) { S.f = t.dataset["for"]; S.toast = null; render(); var b2 = q('[data-for="' + S.f + '"]'); if (b2) b2.focus({ preventScroll: true }); }
    else if (t.hasAttribute("data-leave") || t.hasAttribute("data-plan")) plan();
    else if (t.hasAttribute("data-other")) { S.panel = null; toast("Back to the recipe list to pick another meal (not drawn here)."); render(); }
    else if (t.hasAttribute("data-cancel")) close();
    else if (t.hasAttribute("data-reopen")) { S.toast = null; S.panel = "edit"; render("pt"); }
    else if (t.hasAttribute("data-undo")) { var u = S.added.pop(); if (u) { S.day = u.day; S.r = u.r; S.f = u.f; } S.toast = null; S.panel = "edit"; render("pt"); }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && q("#panel")) { e.preventDefault(); close(); }
  });

  /* boot */
  if (pre.done || Q.get("planned") === "1") {
    var c0 = check(); S.added.push({ day: S.day, r: S.r, f: S.f, out: c0.mode === "warn" ? c0.blocked : [] });
    S.panel = "planned"; S.toast = { t: plannedText(S.added[0]), undo: true };
  }
  render();
  window.GUARD = { S: S, check: check };
})();
