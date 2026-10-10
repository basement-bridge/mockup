/* Preferences, option B: "Mine" and "Household" as two separate sections.
   Mockup only: sample people, sample values and the little state machine live here, never in the stylesheet (AGENTS.md "Mockup and build stay close").
   The rules below are the ones the code holds today (see docs/knowledge/user-preferences/option-b-mine-and-household.md):
   - Stock-check dials resolve per key: built-in default, then the household's value, then the member's own (Kitchie store.ts dialsFor). Clearing a value falls back one level.
   - Kitchie today lets only the household owner (the longest-standing member) write household dials and the household note (web-stock.ts). LOCKED by the owner (voice, 10 October 2026, D5): any member may,
     with no owner and no tenure gate; a tenure gate is deferred, not decided. So this mockup has no read-only state. A member may also set quiet hours to none for themselves (D6).
     Most suggestions per day is 1 to 20, default 2 (D7). Household food statements are open to any member (D8).
   - Notes are NOT an override: the household note and the member's own note are both read.
   - Food statements are NOT an override either: a member sees their own plus the household's ("Everyone"). They are said to the assistant today; no web editor exists (Proposal here).
   - Nothing here is viewport specific: the wide layout lives in mine-household-600.css and mine-household-1024.css. */
(function () {
  "use strict";

  /* ---------- the model's own vocabulary ---------- */
  var DEFAULTS = { enabled: "on", proactivity: "normal", quiet_start: null, quiet_end: null, daily_cap: "2", tz_offset_minutes: "0" }; // DEFAULT_DIALS
  var PROACTIVITY = ["quiet", "normal", "helpful"];
  var ASSISTANTS = [["claude", "Claude"], ["chatgpt", "ChatGPT"], ["gemini", "Gemini"], ["other", "Another assistant"], ["none", "None"]];
  var STATEMENT_WORD = { avoids: "Avoids", stop: "Never suggest", usually: "Usually", likes: "Likes", dislikes: "Dislikes" };
  var STATEMENT_ORDER = ["avoids", "stop", "usually", "likes", "dislikes"];
  var NOTE_MAX = 600;

  var PEOPLE = { sam: { name: "Sam" }, arjan: { name: "Arjan" } };

  /* ---------- sample data (mockup only) ---------- */
  function seed(kind) {
    var full = kind !== "empty";
    return {
      hh: {
        dials: full ? { proactivity: "quiet", quiet_start: "21:00", quiet_end: "07:00", tz_offset_minutes: "660" } : {},
        note: full ? "Nut-free kitchen. Check labels before anything goes on the list." : ""
      },
      me: {
        sam: {
          dials: full ? { proactivity: "helpful" } : {},
          note: full ? "Keep questions short. Tea before talk." : "",
          assistant: full ? "claude" : null,
          role: full ? "Pantry Marshal" : null,
          stops: full ? [
            { id: "st1", name: "Freezer", what: "Everything in this place. We check back after 2026-11-09", own: true },
            { id: "st2", name: "Oat milk", what: "Snoozed. Asks again after 2026-10-17 (a stop on one item covers everyone)", own: false }
          ] : []
        },
        arjan: {
          dials: full ? { daily_cap: "6", enabled: "on" } : {},
          note: "",
          assistant: full ? "chatgpt" : null,
          role: full ? "Head Chef" : null,
          stops: []
        }
      },
      /* member_id null in the model means the household: here owner is null for "Everyone" */
      food: full ? [
        { id: "c1", owner: null, statement: "avoids", subject: "peanuts", severity: "hard", reason: "safety", said: "We cannot have peanuts in the house.", support: 3 },
        { id: "c2", owner: null, statement: "stop", subject: "liver", said: "Never suggest liver, nobody eats it.", support: 1 },
        { id: "c3", owner: null, statement: "usually", subject: "pancakes", when: "weekend", said: "We usually do pancakes at the weekend.", support: 2 },
        { id: "c4", owner: "sam", statement: "avoids", subject: "coriander", severity: "soft", reason: "other", said: "I do not like coriander, fine if it is a garnish.", support: 1 },
        { id: "c5", owner: "sam", statement: "likes", subject: "spicy noodles", said: "I love spicy noodles.", support: 2 },
        { id: "c6", owner: "sam", statement: "dislikes", subject: "mushrooms", said: "Not a fan of mushrooms.", support: 1 },
        { id: "c7", owner: "arjan", statement: "likes", subject: "roast chicken", said: "Roast chicken is my favourite.", support: 1 }
      ] : [],
      only: {
        name: "Our kitchen",
        categories: full ? "11 categories" : "11 suggested categories",
        locations: full ? "4 places, 9 spots" : "Not set up yet",
        recipes: full ? "3 starred of 12" : "None starred yet",
        recipesWhy: "One star and one vote per recipe, for the whole kitchen. Not per person."
      }
    };
  }

  /* ---------- state ---------- */
  var S = { as: "sam", tab: "mine", data: "typical", open: null, flash: "", saved: "", confirm: null };
  var M = seed(S.data);
  var root = document.getElementById("app");

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function who() { return PEOPLE[S.as]; }
  function mine() { return M.me[S.as]; }
  var ICON = {
    chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    leaf: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 38C8 22 18 10 38 9c1 20-9 30-26 29z"/><path d="M10 38c6-8 12-14 20-19"/></svg>',
    pot: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21h30v13a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6z"/><path d="M5 21h38M30 7l-6 14M16 9c0 3 3 3 3 6"/></svg>'
  };

  /* Effective dial values: default, then household, then this member (store.ts dialsFor). */
  function effective(key) {
    var h = M.hh.dials, m = mine().dials;
    if (m[key] !== undefined) return { v: m[key], from: "you" };
    if (h[key] !== undefined) return { v: h[key], from: "hh" };
    return { v: DEFAULTS[key], from: "bi" };
  }
  function householdValue(key) { // what a member falls back to
    var h = M.hh.dials;
    return h[key] !== undefined ? { v: h[key], from: "hh" } : { v: DEFAULTS[key], from: "bi" };
  }
  function show(key, v) {
    if (key === "enabled") return v === "on" ? "On" : "Off";
    if (key === "proactivity") return cap(v);
    if (key === "daily_cap") return v;
    if (key === "tz_offset_minutes") { var h = Number(v) / 60; return (h > 0 ? "+" : "") + h + " hours from UTC"; }
    return v;
  }
  function quietText(start, end) { return start && end ? start + " to " + end : "None"; }
  function quietOf(scopeDials, fallback) {
    var s = scopeDials.quiet_start, e = scopeDials.quiet_end;
    if (scopeDials.quiet_off) return { start: null, end: null, own: true }; // D6: a member's own "none" over the household's hours
    return s !== undefined || e !== undefined ? { start: s || null, end: e || null, own: true } : { start: fallback.start, end: fallback.end, own: false };
  }

  /* One row model per dial, the same five rows for Mine and Household. */
  var ROWS = [
    { id: "enabled", label: "Ask me to check amounts", hhLabel: "Ask to check amounts", keys: ["enabled"] },
    { id: "proactivity", label: "How proactive", hhLabel: "How proactive", keys: ["proactivity"] },
    { id: "quiet", label: "Quiet hours", hhLabel: "Quiet hours", keys: ["quiet_start", "quiet_end"] },
    { id: "daily_cap", label: "Most suggestions per day", hhLabel: "Most suggestions per day", keys: ["daily_cap"] },
    { id: "tz_offset_minutes", label: "Time zone", hhLabel: "Time zone", keys: ["tz_offset_minutes"] }
  ];

  function rowValue(row, scope) { // scope: "me" or "hh"; returns { text, from, why }
    var base = scope === "me" ? effective : householdValue;
    if (row.id === "quiet") {
      var hq = quietOf(M.hh.dials, { start: DEFAULTS.quiet_start, end: DEFAULTS.quiet_end });
      var hfrom = hq.own ? "hh" : "bi";
      if (scope === "hh") return { text: quietText(hq.start, hq.end), from: hfrom, plain: hq };
      var mq = quietOf(mine().dials, hq);
      return { text: quietText(mq.start, mq.end), from: mq.own ? "you" : hfrom, plain: mq, hh: hq, hhFrom: hfrom };
    }
    var e = base(row.id), out = { text: show(row.id, e.v), from: e.from, raw: e.v };
    if (scope === "me" && e.from === "you") { var h = householdValue(row.id); out.hhText = show(row.id, h.v); out.hhFrom = h.from; }
    return out;
  }

  var CHIP = { you: ["you", "Yours"], hh: ["hh", "Household"], bi: ["bi", "Built-in"] };
  function chip(kind, text) { return '<span class="src ' + kind + '">' + esc(text) + "</span>"; }
  function chipFor(from) { return chip(CHIP[from][0], CHIP[from][1]); }

  /* ---------- dial rows ---------- */
  function dialRow(row, scope) {
    var v = rowValue(row, scope), openId = scope + ":" + row.id, isOpen = S.open === openId;
    var label = scope === "me" ? row.label : row.hhLabel;
    var why = "";
    if (scope === "me" && v.from === "you") why = '<span class="pw">Household says ' + esc(row.id === "quiet" ? quietText(v.hh.start, v.hh.end) : v.hhText) + (v.hhFrom === "bi" ? " (built-in)" : "") + "</span>";
    if (scope === "me" && v.from === "hh") why = '<span class="pw">Not set by you</span>';
    if (scope === "me" && v.from === "bi") why = '<span class="pw">Nobody has set it</span>';
    return '<div class="prow" data-row="' + openId + '">' +
      '<button type="button" class="pbtn" data-act="toggle" data-id="' + openId + '" aria-expanded="' + isOpen + '" aria-controls="ed-' + scope + '-' + row.id + '">' +
      '<span class="pt"><span class="pl">' + esc(label) + '</span><span class="pv"><b>' + esc(v.text) + "</b></span>" + why + "</span>" +
      chipFor(v.from) + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" +
      (isOpen ? dialEditor(row, scope, v) : "") + "</div>";
  }

  function savedLine(id) { return S.saved === id ? '<p class="saved small" role="status">Saved</p>' : ""; }

  function optionBtn(act, id, val, text, checked) {
    return '<button type="button" class="popt" role="radio" aria-checked="' + checked + '" data-act="' + act + '" data-id="' + id + '" data-val="' + esc(val) + '"><span>' + esc(text) + '</span><span class="ck" aria-hidden="true"></span></button>';
  }

  function dialEditor(row, scope, v) {
    var id = scope + ":" + row.id, d = scope === "me" ? mine().dials : M.hh.dials, out = "";
    var inheritWord = scope === "me" ? "Same as household" : "Built-in default";
    var fallback = scope === "me" ? rowValue(row, "hh") : { text: row.id === "quiet" ? "None" : show(row.id, DEFAULTS[row.id]) };
    var inheritText = inheritWord + " (" + fallback.text + ")";
    var set = row.keys.some(function (k) { return d[k] !== undefined; }) || !!d.quiet_off;
    out += '<div class="ped" id="ed-' + scope + "-" + row.id + '">';
    if (row.id === "enabled") {
      out += '<div role="radiogroup" aria-label="' + esc(row.label) + '" class="plist">' +
        optionBtn("pick", id, "", inheritText, !set) + optionBtn("pick", id, "on", "On", set && d.enabled === "on") + optionBtn("pick", id, "off", "Off", set && d.enabled === "off") + "</div>";
      out += '<p class="note">Turning this off stops every question on the web and in chat. Estimates already stored stay.</p>';
    } else if (row.id === "proactivity") {
      out += '<div role="radiogroup" aria-label="' + esc(row.label) + '" class="plist">' + optionBtn("pick", id, "", inheritText, !set) +
        PROACTIVITY.map(function (p) { return optionBtn("pick", id, p, cap(p), set && d.proactivity === p); }).join("") + "</div>";
      out += '<p class="note">Quiet asks the least, helpful asks the most.</p>';
    } else if (row.id === "quiet") {
      out += '<fieldset class="two"><legend>Quiet hours</legend><div><label for="q-s-' + scope + '">From</label><input id="q-s-' + scope + '" type="time" data-act="quiet" data-id="' + id + '" data-end="start" value="' + esc(d.quiet_start || "") + '"></div>' +
        '<div><label for="q-e-' + scope + '">Until</label><input id="q-e-' + scope + '" type="time" data-act="quiet" data-id="' + id + '" data-end="end" value="' + esc(d.quiet_end || "") + '"></div></fieldset>';
      out += '<p class="note">24 hour clock, in the time zone below. No questions are raised in between. Quiet hours apply only when both are set.</p>';
      out += '<div role="radiogroup" aria-label="Use the shared value" class="plist">' + optionBtn("pick", id, "", inheritText, !set) + (scope === "me" ? optionBtn("pick", id, "off", "None, no quiet hours for me", !!d.quiet_off) : "") + "</div>";
      if (scope === "me") out += '<p class="note">You can switch quiet hours off for yourself, whatever the household has.</p>';
    } else if (row.id === "daily_cap") {
      out += '<label for="cap-' + scope + '">Most suggestions per day</label><input id="cap-' + scope + '" class="fld" type="number" min="1" max="20" step="1" inputmode="numeric" data-act="field" data-id="' + id + '" value="' + esc(d.daily_cap || "") + '" placeholder="' + esc(fallback.text.replace(/\D.*/, "") || "2") + '">';
      out += '<p class="note">From 1 to 20. Empty uses ' + (scope === "me" ? "the household\'s" : "the built-in default") + " (" + esc(fallback.text) + ").</p>";
    } else if (row.id === "tz_offset_minutes") {
      out += '<label for="tz-' + scope + '">Time zone</label><input id="tz-' + scope + '" class="fld" type="text" inputmode="decimal" autocomplete="off" data-act="field" data-id="' + id + '" value="' + esc(d.tz_offset_minutes !== undefined ? Number(d.tz_offset_minutes) / 60 : "") + '" placeholder="' + esc(String(Number((scope === "me" ? effectiveHH() : DEFAULTS.tz_offset_minutes)) / 60)) + '">';
      out += '<p class="note">Hours ahead of UTC, for example 10 for Sydney in winter or 11 in summer time. It decides when a check date counts as today and when quiet hours fall. Empty uses ' + (scope === "me" ? "the household\'s" : "the built-in default") + " (" + esc(String(Number(scope === "me" ? effectiveHH() : DEFAULTS.tz_offset_minutes) / 60)) + ").</p>";
    }
    if (scope === "me" && v.from !== "you" && (row.id === "enabled" || row.id === "proactivity" || row.id === "quiet" || row.id === "daily_cap" || row.id === "tz_offset_minutes")) {
      out += '<p class="small"><button type="button" class="lnk" data-act="goto" data-id="hh:' + row.id + '">See the household\'s setting</button></p>';
    }
    out += savedLine(id) + "</div>";
    return out;
  }
  function effectiveHH() { return householdValue("tz_offset_minutes").v; }

  /* ---------- notes ---------- */
  function noteRow(scope) {
    var text = scope === "me" ? mine().note : M.hh.note, id = scope + ":note", isOpen = S.open === id;
    var label = scope === "me" ? "Your note" : "Household note";
    var empty = text === "";
    var preview = empty ? '<span class="pv">' + "Add a note" + "</span>" : '<span class="pv clamp">' + esc(text) + "</span>";
    var chipHtml = scope === "me" ? chip("you", "Only you") : chip("hh", "Household");
    return '<div class="prow" data-row="' + id + '"><button type="button" class="pbtn" data-act="toggle" data-id="' + id + '" aria-expanded="' + isOpen + '" aria-controls="ed-' + scope + '-note"><span class="pt"><span class="pl">' + label + "</span>" + preview + "</span>" +
      chipHtml + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" +
      (isOpen ? '<div class="ped" id="ed-' + scope + '-note"><label for="n-' + scope + '">' + label + '</label><textarea id="n-' + scope + '" class="fld" maxlength="' + NOTE_MAX + '" rows="4" data-act="note" data-id="' + id + '">' + esc(text) + '</textarea>' +
        '<p class="note"><span data-count>' + text.length + "</span> of " + NOTE_MAX + " characters, plain text. " + (scope === "me" ? "Only you and your assistant read this. " : "Everyone in the kitchen reads this. ") + "Read as a preference, never as an instruction.</p>" + savedLine(id) + "</div>" : "") + "</div>";
  }

  /* ---------- food statements ---------- */
  function visibleFood(scope) { // "me" shows own plus Everyone; "hh" shows Everyone only (get_context for_whom)
    return M.food.filter(function (c) { return c.owner === null || (scope === "me" && c.owner === S.as); });
  }
  function foodDetail(c) {
    if (c.statement === "avoids") {
      var sev = c.severity === "hard" ? "strict" : c.severity === "soft" ? "fine as a minor ingredient" : "treated as strict until said";
      var why = c.reason === "safety" ? "for safety" : c.reason === "other" ? "not for safety" : "no reason given";
      return cap(why) + ", " + sev;
    }
    if (c.when) return "At the " + c.when;
    return "";
  }
  function foodRow(c, scope) {
    var id = scope + ":" + c.id, isOpen = S.open === id;
    var chipHtml = c.owner === null ? chip("hh", "Everyone") : chip("you", "Just you");
    var detail = foodDetail(c);
    var confirm = S.confirm === id;
    var ed = "";
    if (isOpen) {
      var strict = c.statement === "avoids" && c.reason !== "other";
      ed = '<div class="ped" id="ed-' + id.replace(":", "-") + '"><p class="small">Said: <q>' + esc(c.said) + '</q> <span class="muted">(kept as data, said ' + c.support + (c.support === 1 ? " time" : " times") + ")</span></p>" +
        (confirm ? '<p class="note">This is kept for safety. Remove it only if it is no longer true' + (c.owner === null ? ", for the whole household" : "") + '.</p><div class="acts"><button type="button" class="btn ghost danger" data-act="forget" data-id="' + id + '" data-confirmed="1">Yes, stop remembering</button><button type="button" class="btn ghost" data-act="keep" data-id="' + id + '">Keep it</button></div>'
          : '<button type="button" class="btn ghost danger" data-act="forget" data-id="' + id + '" data-strict="' + (strict ? 1 : 0) + '">Stop remembering this</button>' +
            '<p class="note">To change it instead, tell your assistant. Moving a statement between Just you and Everyone has no operation today: say it again for the other one.</p>') + "</div>";
    }
    return '<li class="frow prow" data-row="' + id + '"><button type="button" class="pbtn" data-act="toggle" data-id="' + id + '" aria-expanded="' + isOpen + '"><span class="pt"><span class="fs">' + STATEMENT_WORD[c.statement] + '</span><span class="pl">' + esc(c.subject) + "</span>" + (detail ? '<span class="pv">' + esc(detail) + "</span>" : "") + "</span>" + chipHtml + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" + ed + "</li>";
  }
  function foodList(scope) {
    var rows = visibleFood(scope);
    if (!rows.length) {
      return '<div class="empty">' + ICON.pot + "<b>" + (scope === "me" ? "Nothing remembered about you yet" : "Nothing for the whole kitchen yet") + "</b><p class=\"small\">" +
        (scope === "me" ? "Tell your assistant what you like, dislike or cannot eat, and it shows up here." : "Allergies and house rules for everyone go here. Tell your assistant, and say it is for the household.") + "</p></div>";
    }
    var out = "";
    STATEMENT_ORDER.forEach(function (st) {
      var g = rows.filter(function (c) { return c.statement === st; });
      if (g.length) out += g.map(function (c) { return foodRow(c, scope); }).join("");
    });
    return '<ul class="flist">' + out + "</ul>";
  }

  /* ---------- screens ---------- */
  function seg() {
    return '<div class="seg2 wide" role="tablist" aria-label="Whose preferences">' +
      [["mine", "Mine"], ["hh", "Household"]].map(function (t) {
        return '<button type="button" role="tab" id="tab-' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '" aria-controls="panel-' + t[0] + '" class="' + (S.tab === t[0] ? "on" : "") + '" data-act="tab" data-id="' + t[0] + '">' + t[1] + "</button>";
      }).join("") + "</div>";
  }

  function navRow(label, value, kind, text, id) {
    return '<button type="button" class="pbtn navrow" data-act="nav" data-id="' + esc(id) + '"><span class="pt"><span class="pl">' + esc(label) + '</span><span class="pv">' + esc(value) + "</span></span>" + chip(kind, text) + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>";
  }

  function stopsList() {
    var s = mine().stops;
    if (!s.length) return '<p class="note">Nothing is switched off. Use Stop asking on a check, or tell the assistant.</p>';
    return '<ul class="stops" aria-label="Not asking about">' + s.map(function (x) {
      return '<li><span class="sname">' + esc(x.name) + '<span class="swhat">' + esc(x.what) + '</span></span><button type="button" class="btn" data-act="askagain" data-id="' + x.id + '" aria-label="Ask again about ' + esc(x.name) + '">Ask again</button></li>';
    }).join("") + "</ul>";
  }

  function assistantRow() {
    var a = mine().assistant, id = "me:assistant", isOpen = S.open === id;
    var name = a ? ASSISTANTS.filter(function (x) { return x[0] === a; })[0][1] : "Not chosen";
    return '<div class="prow" data-row="' + id + '"><button type="button" class="pbtn" data-act="toggle" data-id="' + id + '" aria-expanded="' + isOpen + '" aria-controls="ed-me-assistant"><span class="pt"><span class="pl">My assistant</span><span class="pv"><b>' + esc(name) + "</b></span></span>" + chip("you", "Only you") + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" +
      (isOpen ? '<div class="ped" id="ed-me-assistant"><div role="radiogroup" aria-label="My assistant" class="plist">' + ASSISTANTS.map(function (x) { return optionBtn("assistant", id, x[0], x[1], (a || "none") === x[0] && (a !== null || x[0] === "none")); }).join("") + '</div><p class="note">The AI app you use with Kitchie. The plan opens it for you. There is no household choice: it is always personal.</p>' + savedLine(id) + "</div>" : "") + "</div>";
  }

  function mineScreen() {
    var m = mine();
    return '<div role="tabpanel" id="panel-mine" aria-labelledby="tab-mine" class="mbody2">' +
      '<p>What you have chosen for yourself, and where everything else comes from.</p>' +
      '<p class="legend small"><span class="lg">' + chip("you", "Yours") + " you chose it</span><span class=\"lg\">" + chip("hh", "Household") + " the kitchen's value, as you have not chosen</span><span class=\"lg\">" + chip("bi", "Built-in") + " nobody has, so Kitchie's own</span></p>" +
      '<span class="lbl">Stock checks</span><div class="card sgroup">' + ROWS.map(function (r) { return dialRow(r, "me"); }).join("") + "</div>" +
      '<span class="lbl">Notes</span><div class="card sgroup">' + noteRow("me") +
      (M.hh.note ? '<div class="prow static household-note"><div class="pbtn"><span class="pt"><span class="pl">Household note</span><span class="pv clamp">' + esc(M.hh.note) + '</span><span class="pw">Read together with yours.</span><button type="button" class="lnk" data-act="goto" data-id="hh:note">Open in Household</button></span>' + chip("hh", "Household") + "</div></div>" : "") + "</div>" +
      '<span class="lbl">Food</span><div class="card sgroup foodcard">' + foodList("me") +
      '<p class="note">Your statements and the household\'s are added together, not swapped. Say new ones to your assistant.</p></div>' +
      '<span class="lbl">Just for you</span><div class="card sgroup">' + assistantRow() +
      navRow("Kitchen role", m.role || "Pick a kitchen role", "you", "Only you", "Me") + "</div>" +
      '<span class="lbl">Not asking about</span><div class="card sgroup">' + stopsList() + "</div>" +
      '<span class="lbl">On this device</span><div class="card sgroup">' + navRow("Look and display", "Theme, name size, emoji, compact rows", "bi", "This device", "Settings") + '</div>' +
      '<p class="small">Theme and display options stay on this phone and are not part of your account. Recipe stars and votes belong to the household, not to you.</p><button type="button" class="lnk" data-act="goto" data-id="hh:recipes">See Recipe stars and votes under Household</button></div>';
  }

  function householdScreen() {
    var only = M.only;
    var head = '<p class="note">Any member of the kitchen can change these.</p>';
    return '<div role="tabpanel" id="panel-hh" aria-labelledby="tab-hh" class="mbody2">' +
      '<p>Shared by everyone in ' + esc(only.name) + ". Used for anyone who has not chosen their own.</p>" + head +
      '<span class="lbl">Stock-check defaults</span><div class="card sgroup">' + ROWS.map(function (r) { return dialRow(r, "hh"); }).join("") + "</div>" +
      '<span class="lbl">Household note</span><div class="card sgroup">' + noteRow("hh") + "</div>" +
      '<span class="lbl">Food for everyone</span><div class="card sgroup foodcard">' + foodList("hh") +
      '<p class="note">Any member can say or remove these. Safety ones ask twice before they are removed.</p></div>' +
      '<span class="lbl">Only the household has these</span><div class="card sgroup">' +
      navRow("Household name", only.name, "hh", "Household only", "Household name") +
      navRow("Categories", only.categories, "hh", "Household only", "Categories") +
      navRow("Locations and spots", only.locations, "hh", "Household only", "Locations and spots") +
      '<div class="prow static" id="hh-recipes"><div class="pbtn"><span class="pt"><span class="pl">Recipe stars and votes</span><span class="pv"><b>' + esc(only.recipes) + '</b></span><span class="pw">' + esc(only.recipesWhy) + "</span></span>" + chip("hh", "Household only") + "</div></div></div>" +
      '<p class="small">These have no personal version, so there is nothing to override on Mine.</p></div>';
  }

  function render() {
    var keepScroll = window.scrollY;
    var flash = S.flash ? '<div class="banner" role="status">' + esc(S.flash) + "</div>" : "";
    root.innerHTML = '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="nav" data-id="Settings">&lsaquo; Settings</a><h1 class="ttl">Preferences</h1><span style="width:64px" aria-hidden="true"></span></div>' +
      '<main class="mbody">' + flash + seg() + (S.tab === "mine" ? mineScreen() : householdScreen()) + "</main></div>";
    var cur = document.activeElement;
    window.scrollTo(0, keepScroll);
    syncControls();
    if (S.focus) { var el = root.querySelector(S.focus); if (el) el.focus({ preventScroll: true }); S.focus = null; }
    void cur;
  }

  function syncControls() {
    document.querySelectorAll("[data-pc]").forEach(function (b) {
      var k = b.getAttribute("data-pc"), v = b.getAttribute("data-v");
      b.setAttribute("aria-pressed", String(S[k] === v));
    });
    var st = document.getElementById("mh-state");
    if (st) st.textContent = who().name + " · " + (S.tab === "mine" ? "Mine" : "Household") + " · " + (S.data === "empty" ? "nothing set yet" : "some set");
  }

  /* ---------- actions ---------- */
  function saved(id) { S.saved = id; }
  function setDial(scope, key, val) {
    var d = scope === "me" ? mine().dials : M.hh.dials;
    if (val === "" || val === null) delete d[key]; else d[key] = val;
  }
  function parseHours(t) {
    var n = Number(String(t).replace(",", "."));
    return isFinite(n) && n >= -12 && n <= 14 ? String(Math.round(n * 60)) : null;
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-act]");
    if (!t || !root.contains(t) && !t.closest(".mh-jump")) return;
    var act = t.getAttribute("data-act"), id = t.getAttribute("data-id"), val = t.getAttribute("data-val");
    if (t.tagName === "A") ev.preventDefault();
    if (act === "tab") { S.tab = id; S.open = null; S.flash = ""; S.saved = ""; S.confirm = null; render(); }
    else if (act === "toggle") { S.open = S.open === id ? null : id; S.saved = ""; S.confirm = null; S.flash = ""; S.focus = '[data-id="' + id + '"]'; render(); }
    else if (act === "pick") {
      var p = id.split(":"), row = p[1];
      if (row === "quiet") { setDial(p[0], "quiet_start", ""); setDial(p[0], "quiet_end", ""); setDial(p[0], "quiet_off", val === "off" ? "1" : ""); }
      else setDial(p[0], row, val);
      saved(id); S.focus = '[data-act="pick"][data-id="' + id + '"][data-val="' + val + '"]'; render();
    }
    else if (act === "assistant") { mine().assistant = val === "none" ? null : val; saved(id); S.focus = '[data-act="assistant"][data-val="' + val + '"]'; render(); }
    else if (act === "goto") { var g = id.split(":"); S.tab = g[0]; S.open = g[1] === "recipes" ? null : g[0] + ":" + g[1]; S.saved = ""; S.flash = ""; render(); var target = root.querySelector(g[1] === "recipes" ? "#hh-recipes" : '[data-row="' + g[0] + ":" + g[1] + '"]'); if (target) { target.scrollIntoView({ block: "center" }); } }
    else if (act === "nav") { S.flash = "Opens " + id + ". Not drawn in this option."; S.open = null; render(); }
    else if (act === "askagain") { var m = mine(); m.stops = m.stops.filter(function (x) { return x.id !== id; }); S.focus = null; render(); }
    else if (act === "forget") {
      var c = M.food.filter(function (x) { return x.id === id.split(":")[1]; })[0];
      var strict = c && c.statement === "avoids" && c.reason !== "other";
      if (strict && !t.getAttribute("data-confirmed")) { S.confirm = id; S.focus = '[data-act="forget"][data-id="' + id + '"]'; render(); return; }
      M.food = M.food.filter(function (x) { return x.id !== c.id; }); S.open = null; S.confirm = null; render();
    }
    else if (act === "keep") { S.confirm = null; S.focus = '[data-act="toggle"][data-id="' + id + '"]'; render(); }
    else if (act === "jump") { applyParams(new URLSearchParams(t.getAttribute("href").split("?")[1] || "")); }
    else if (act === "pc") { /* handled below */ }
  });

  document.addEventListener("change", function (ev) {
    var t = ev.target.closest("[data-act]");
    if (!t || !root.contains(t)) return;
    var act = t.getAttribute("data-act"), id = t.getAttribute("data-id");
    if (act === "quiet") {
      var p = id.split(":"), d = p[0] === "me" ? mine().dials : M.hh.dials;
      delete d.quiet_off; // picking hours again drops the member's "none"
      d[t.getAttribute("data-end") === "start" ? "quiet_start" : "quiet_end"] = t.value || undefined;
      if (d.quiet_start === undefined && d.quiet_end === undefined) { delete d.quiet_start; delete d.quiet_end; }
      else { if (d.quiet_start === undefined) delete d.quiet_start; if (d.quiet_end === undefined) delete d.quiet_end; }
      saved(id); S.focus = "#" + t.id; render();
    } else if (act === "field") {
      var q = id.split(":"), key = q[1];
      if (key === "daily_cap") { var n = parseInt(t.value, 10); setDial(q[0], key, isFinite(n) && n >= 1 && n <= 20 ? String(n) : ""); }
      else { var m2 = t.value.trim() === "" ? "" : parseHours(t.value); setDial(q[0], key, m2 === null ? "" : m2); }
      saved(id); S.focus = "#" + t.id; render();
    } else if (act === "note") {
      var s = id.split(":")[0], text = t.value.trim().slice(0, NOTE_MAX);
      if (s === "me") mine().note = text; else M.hh.note = text;
      saved(id); S.focus = "#" + t.id; render();
    }
  });
  document.addEventListener("input", function (ev) {
    var t = ev.target;
    if (t.matches && t.matches('textarea[data-act="note"]')) { var c = t.parentNode.querySelector("[data-count]"); if (c) c.textContent = t.value.length; }
  });

  /* ---------- page controls (the prototype's own, not part of the screen) ---------- */
  function applyParams(q) {
    var as = q.get("as"), data = q.get("data"), tab = q.get("tab"), open = q.get("open");
    if (as && PEOPLE[as]) S.as = as;
    if (data && data !== S.data && (data === "typical" || data === "empty")) { S.data = data; M = seed(data); }
    if (tab === "mine" || tab === "hh") S.tab = tab;
    S.open = open || null; S.saved = ""; S.flash = ""; S.confirm = null;
    render();
    if (open) { var el = root.querySelector('[data-row="' + open + '"]'); if (el) el.scrollIntoView({ block: "center" }); }
  }
  document.querySelectorAll("[data-pc]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-pc"), v = b.getAttribute("data-v");
      if (k === "data") { S.data = v; M = seed(v); } else if (k === "as") { S.as = v; }
      S.open = null; S.saved = ""; S.flash = ""; S.confirm = null; render();
    });
  });
  document.querySelectorAll(".mh-jump a").forEach(function (a) {
    a.addEventListener("click", function (ev) { ev.preventDefault(); applyParams(new URLSearchParams(a.getAttribute("href").split("?")[1] || "")); window.scrollTo({ top: 0 }); });
  });

  applyParams(new URLSearchParams(location.search));
})();
