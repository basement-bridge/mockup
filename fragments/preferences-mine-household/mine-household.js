/* Preferences, option B: "Mine" and "Household" as two separate sections.
   Mockup only: sample people, sample values and the little state machine live here, never in the stylesheet (AGENTS.md "Mockup and build stay close").
   The rules below are the ones the code holds today (see docs/knowledge/user-preferences/option-b-mine-and-household.md):
   - Stock-check dials resolve per key: built-in default, then the household's value, then the member's own (Kitchie store.ts dialsFor). Clearing a value falls back one level.
   - Kitchie today lets only the household owner (the longest-standing member) write household dials and the household note (web-stock.ts). D5 (any member may) and D8 (any member may record household food claims)
     are SUPERSEDED by D25 to D29 (owner, voice, 10 October 2026, later session): a binary household admin role. The founding member is admin by default and grants or revokes admin per person (D26, D27);
     only admins change household-level values (D28), so a non-admin sees them read-only with "Only household admins can change this."; personal values are never gated (D29). Tenure gating and finer roles stay deferred.
     A member may also set quiet hours to none for themselves (D6). Most suggestions per day is 1 to 20, default 2 (D7).
   - Roles: the sample household has Arjan (founding member), Jo (an admin) and Sam (a plain member). "Household admin" is not "Kitchen role", which is a free label on the person's own profile (D30).
   - Notes are NOT an override: the household note and the member's own note are both read.
   - Food statements are NOT an override either: a member sees their own plus the household's ("Everyone"). They are said to the assistant today; no web editor exists (Proposal here).
   - Food rules (owner, voice, 10 October 2026; docs/knowledge/user-preferences/food-preferences.md F1 to F10): avoid is permanent and hard ("never suggest" is dropped); like and dislike are soft and may end;
     a limit caps how often; a category holds the rule, a note and recipes attached by reference whose titles are read from Recipe each time. The JSON shape and operations are a PROPOSAL (Q-F1 and on).
   - Nothing here is viewport specific: the wide layout lives in mine-household-600.css and mine-household-1024.css. */
(function () {
  "use strict";

  /* ---------- the model's own vocabulary ---------- */
  var DEFAULTS = { enabled: "on", proactivity: "normal", quiet_start: null, quiet_end: null, daily_cap: "2", tz_offset_minutes: "0" }; // DEFAULT_DIALS
  var PROACTIVITY = ["quiet", "normal", "helpful"];
  var ASSISTANTS = [["claude", "Claude"], ["chatgpt", "ChatGPT"], ["gemini", "Gemini"], ["other", "Another assistant"], ["none", "None"]];
  var RULE_WORD = { avoid: "Avoids", cap: "Limit", usually: "Usually", like: "Likes", dislike: "Dislikes" };
  var RULE_ORDER = ["avoid", "cap", "usually", "like", "dislike"];
  var TODAY = "2026-10-10"; // the mockup's own "today", so a rule that has lapsed can be shown
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  /* Recipe's own titles. Mockup only: the screen asks for a title each time it draws and never keeps one (food-preferences F6). */
  var RECIPES = { "r-fish": "Fish and chips", "r-chilli": "Chilli con carne", "r-laksa": "Prawn laksa", "r-green": "Thai green curry", "r-kimchi": "Kimchi fried rice", "r-tomyum": "Tom yum noodle soup", "r-dandan": "Dan dan noodles", "r-garlic": "Chilli garlic noodles" };
  var NOTE_MAX = 600;

  var PEOPLE = { sam: { name: "Sam" }, arjan: { name: "Arjan" }, jo: { name: "Jo" } };
  var ROLE_WORD = { founder: "Founding member", admin: "Admin", member: "Member" }; // D25 to D27: binary, so founder and admin may edit household values, a member may not
  var ADMIN_WHY = "Only household admins can change this.";

  /* ---------- sample data (mockup only) ---------- */
  function seed(kind) {
    var full = kind !== "empty";
    return {
      hh: {
        dials: full ? { proactivity: "quiet", quiet_start: "21:00", quiet_end: "07:00", tz_offset_minutes: "660" } : {},
        note: full ? "Nut-free kitchen. Check labels before anything goes on the list." : ""
      },
      /* D25 to D27. The role is kept on the household member, not on a preference. The founding member is the person who first set the household up. */
      members: [{ id: "arjan", role: "founder" }, { id: "jo", role: "admin" }, { id: "sam", role: "member" }],
      me: {
        jo: { dials: {}, note: "", assistant: null, role: null, stops: [] },
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
      /* member_id null in the model means the household: here owner is null for "Everyone".
         level: ingredient (matched on what is in a recipe) or category (matched on the recipes attached to it, by reference).
         ends: optional, only on like and dislike; the person's words gave it ("for the next two weeks"), there is no date field. */
      food: full ? [
        { id: "c1", owner: null, level: "ingredient", rule: "avoid", subject: "peanuts", reason: "safety", said: "We cannot have peanuts in the house.", support: 3 },
        { id: "c2", owner: null, level: "ingredient", rule: "avoid", subject: "liver", reason: "other", said: "Never suggest liver, nobody eats it.", support: 1 },
        { id: "c3", owner: null, rule: "usually", subject: "pancakes", when: "weekend", said: "We usually do pancakes at the weekend.", support: 2 },
        { id: "c8", owner: null, level: "category", rule: "cap", subject: "Deep-fried", max: 1, recipes: ["r-fish"], suggest: [], said: "Deep-fried dinners no more than once a week.", support: 1 },
        { id: "c4", owner: "sam", level: "ingredient", rule: "dislike", subject: "coriander", said: "I do not like coriander, fine if it is a garnish.", support: 1 },
        { id: "c5", owner: "sam", level: "ingredient", rule: "like", subject: "pumpkin", ends: "2026-10-31", said: "I am into pumpkin this month.", support: 1 },
        { id: "c6", owner: "sam", level: "ingredient", rule: "dislike", subject: "mushrooms", said: "Not a fan of mushrooms.", support: 1 },
        { id: "c9", owner: "sam", level: "category", rule: "cap", subject: "Spicy", max: 2, recipes: ["r-chilli", "r-laksa", "r-green"], suggest: [["r-kimchi", "Chilli paste in the sauce"], ["r-tomyum", "Hot and sour broth with chilli"]], said: "Spicy is fine, just no more than twice a week.", support: 1 },
        { id: "c10", owner: "sam", level: "category", rule: "dislike", subject: "Spicy noodles", ends: "2026-10-24", recipes: ["r-dandan", "r-garlic"], suggest: [], said: "I cannot face spicy noodles for the next two weeks.", support: 1 },
        { id: "c11", owner: "sam", level: "ingredient", rule: "dislike", subject: "lamb", ends: "2026-10-05", said: "No lamb for a week, please.", support: 1 },
        { id: "c7", owner: "arjan", level: "ingredient", rule: "like", subject: "roast chicken", said: "Roast chicken is my favourite.", support: 1 }
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
  var S = { as: "sam", tab: "mine", view: null, data: "typical", open: null, flash: "", saved: "", confirm: null };
  var M = seed(S.data);
  var root = document.getElementById("app");

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function who() { return PEOPLE[S.as]; }
  function mine() { return M.me[S.as]; }
  /* D28: this is the ONE place that decides who may change a household-level value. The screen, and every write below, ask it (in the build the web routes and the MCP tools call the same service check). Personal values never ask (D29). */
  function roleOf(id) { return M.members.filter(function (m) { return m.id === id; })[0].role; }
  function isAdmin(id) { var r = roleOf(id || S.as); return r === "founder" || r === "admin"; }
  function canWrite(scope) { return scope !== "hh" || isAdmin(); }
  function adminNames() { return M.members.filter(function (m) { return isAdmin(m.id); }).map(function (m) { return PEOPLE[m.id].name; }); }
  function lockNote() { // a household value, seen by a member who is not an admin: read-only, with the reason
    return '<p class="note ro">' + ICON.lock + "<span>" + ADMIN_WHY + " Admins: " + esc(adminNames().join(" and ")) + '.</span></p>' +
      '<p class="small"><button type="button" class="lnk" data-act="view" data-id="members">See members and admins</button></p>';
  }
  var ICON = {
    chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    leaf: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 38C8 22 18 10 38 9c1 20-9 30-26 29z"/><path d="M10 38c6-8 12-14 20-19"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    spark: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2.1 2.1.7-2.1.7L19 20.6l-.7-2.1-2.1-.7 2.1-.7z"/></svg>',
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
    if (!canWrite(scope)) return '<div class="ped" id="ed-' + scope + "-" + row.id + '"><p class="small">' + (row.id === "quiet" ? "Members who have not set their own hours get this." : "Members who have not chosen their own get this.") + "</p>" + lockNote() + "</div>";
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
      (isOpen && !canWrite(scope) ? '<div class="ped" id="ed-' + scope + '-note"><p class="small">' + (empty ? "No household note yet." : esc(text)) + "</p>" + lockNote() + "</div>" :
       isOpen ? '<div class="ped" id="ed-' + scope + '-note"><label for="n-' + scope + '">' + label + '</label><textarea id="n-' + scope + '" class="fld" maxlength="' + NOTE_MAX + '" rows="4" data-act="note" data-id="' + id + '">' + esc(text) + '</textarea>' +
        '<p class="note"><span data-count>' + text.length + "</span> of " + NOTE_MAX + " characters, plain text. " + (scope === "me" ? "Only you and your assistant read this. " : "Everyone in the kitchen reads this. ") + "Read as a preference, never as an instruction.</p>" + savedLine(id) + "</div>" : "") + "</div>";
  }

  /* ---------- food rules ---------- */
  function dayText(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1]; }
  function lapsed(c) { return !!c.ends && c.ends < TODAY; } // a rule whose end has passed is neutral again, and not listed
  function recipeTitle(id) { return RECIPES[id] || "Recipe not found in Recipe"; } // asked of Recipe on every draw, never copied
  function capText(n) { return n === 1 ? "once a week" : n === 2 ? "twice a week" : n + " times a week"; }
  function visibleFood(scope) { // "me" shows own plus Everyone; "hh" shows Everyone only (get_context for_whom)
    return M.food.filter(function (c) { return !lapsed(c) && (c.owner === null || (scope === "me" && c.owner === S.as)); });
  }
  function endedFood() { return M.food.filter(function (c) { return lapsed(c) && c.owner === S.as; }); }
  function foodDetail(c) {
    var parts = [];
    if (c.rule === "avoid") parts.push(c.reason === "safety" ? "For safety, no end" : c.reason === "other" ? "Not for safety, no end" : "No end");
    if (c.rule === "cap") parts.push("At most " + capText(c.max));
    if (c.when) parts.push("At the " + c.when);
    if (c.ends) parts.push("Until " + dayText(c.ends));
    if (c.level === "category") parts.push((c.recipes.length || "No") + (c.recipes.length === 1 ? " recipe" : " recipes"));
    return parts.join(" · ");
  }
  function foodSuggest(c, id) { // the assistant noticed existing recipes that look like a match (food-preferences F7): offered, never attached on its own
    var sug = c.suggest || [];
    if (!sug.length) return "";
    return '<div class="note ro">' + ICON.spark + "<div><b>Your assistant thinks " + (sug.length === 1 ? "this recipe seems" : "these recipes seem") + " to match " + esc(c.subject) + ".</b> Attach " + (sug.length === 1 ? "it" : "them") + " so " + (c.rule === "avoid" || c.rule === "dislike" ? "they are left out?" : "they count?") +
      '<ul class="stops" aria-label="Seem to match">' + sug.map(function (x) {
        return '<li><span class="sname">' + esc(recipeTitle(x[0])) + '<span class="swhat">' + esc(x[1]) + '</span></span><button type="button" class="btn" data-act="attach" data-id="' + id + '" data-val="' + esc(x[0]) + '" aria-label="Attach ' + esc(recipeTitle(x[0])) + '">Attach</button></li>';
      }).join("") + "</ul>" +
      '<div class="acts">' + (sug.length > 1 ? '<button type="button" class="btn" data-act="attachall" data-id="' + id + '">Attach all ' + sug.length + "</button>" : "") + '<button type="button" class="btn ghost" data-act="notthese" data-id="' + id + '">Not ' + (sug.length === 1 ? "this one" : "these") + "</button></div></div></div>";
  }
  function foodRecipes(c, id) {
    var out = '<span class="lbl">Recipes in ' + esc(c.subject) + "</span>";
    if (!c.recipes.length) out += '<p class="note">No recipe is attached yet, so nothing is checked. Tell your assistant which recipes belong here.</p>';
    else out += '<ul class="stops" aria-label="Attached recipes">' + c.recipes.map(function (r) {
      return '<li><span class="sname">' + esc(recipeTitle(r)) + '</span><button type="button" class="btn" data-act="detach" data-id="' + id + '" data-val="' + esc(r) + '" aria-label="Take ' + esc(recipeTitle(r)) + ' out of ' + esc(c.subject) + '">Take out</button></li>';
    }).join("") + "</ul>";
    return out + '<p class="note">Titles are read from Recipe each time, so a rename shows here at once. Only attached recipes are checked.</p>';
  }
  function foodEnd(c, id) {
    if (c.rule === "avoid") return '<p class="note">An avoid has no end. It stays, and a like never outweighs it, until you stop remembering it.</p>';
    if (c.rule !== "like" && c.rule !== "dislike") return "";
    if (!c.ends) return '<p class="note">No end, so it stands until you stop it. To give it a time, tell your assistant, for example “for the next two weeks”.</p>';
    return '<p class="note">Ends on its own after ' + dayText(c.ends) + ", then goes back to neutral. That time came from what you said.</p>" +
      '<button type="button" class="btn ghost" data-act="clearend" data-id="' + id + '">Keep it for good</button>';
  }
  function foodRow(c, scope) {
    var id = scope + ":" + c.id, isOpen = S.open === id;
    var chipHtml = c.owner === null ? chip("hh", "Everyone") : chip("you", "Just you");
    var detail = foodDetail(c);
    var confirm = S.confirm === id;
    var locked = c.owner === null && !isAdmin(); // D28: a household claim or rule is read-only for a member who is not an admin
    var ed = "";
    if (isOpen && locked) {
      ed = '<div class="ped" id="ed-' + id.replace(":", "-") + '"><p class="small">Said: <q>' + esc(c.said) + '</q></p>' +
        (c.rule === "cap" ? '<p class="note">At most ' + capText(c.max) + ", checked against the last seven days of meals.</p>" : "") +
        (c.level === "category" && c.recipes.length ? '<span class="lbl">Recipes in ' + esc(c.subject) + '</span><ul class="stops" aria-label="Attached recipes">' + c.recipes.map(function (r) { return '<li><span class="sname">' + esc(recipeTitle(r)) + "</span></li>"; }).join("") + "</ul>" : "") +
        lockNote() + "</div>";
    } else if (isOpen) {
      var strict = c.rule === "avoid" && c.reason !== "other";
      ed = '<div class="ped" id="ed-' + id.replace(":", "-") + '"><p class="small">Said: <q>' + esc(c.said) + '</q> <span class="muted">(kept as data, said ' + c.support + (c.support === 1 ? " time" : " times") + ")</span></p>" +
        (c.rule === "cap" ? '<label for="mx-' + scope + "-" + c.id + '">Most per week</label><input id="mx-' + scope + "-" + c.id + '" class="fld" type="number" min="1" max="7" step="1" inputmode="numeric" data-act="cap" data-id="' + id + '" value="' + c.max + '"><p class="note">Checked against the meals planned and cooked in the last seven days, before a recipe here is suggested.</p>' : "") +
        foodEnd(c, id) + (c.level === "category" ? foodSuggest(c, id) + foodRecipes(c, id) : "") + savedLine(id) +
        (confirm ? '<p class="note">This is kept for safety. Remove it only if it is no longer true' + (c.owner === null ? ", for the whole household" : "") + '.</p><div class="acts"><button type="button" class="btn ghost danger" data-act="forget" data-id="' + id + '" data-confirmed="1">Yes, stop remembering</button><button type="button" class="btn ghost" data-act="keep" data-id="' + id + '">Keep it</button></div>'
          : '<button type="button" class="btn ghost danger" data-act="forget" data-id="' + id + '" data-strict="' + (strict ? 1 : 0) + '">Stop remembering this</button>' +
            '<p class="note">To change the rule itself, tell your assistant. Moving a statement between Just you and Everyone has no operation today: say it again for the other one.</p>') + "</div>";
    }
    return '<li class="frow prow" data-row="' + id + '"><button type="button" class="pbtn" data-act="toggle" data-id="' + id + '" aria-expanded="' + isOpen + '"><span class="pt"><span class="fs">' + RULE_WORD[c.rule] + '</span><span class="pl">' + esc(c.subject) + "</span>" + (detail ? '<span class="pv">' + esc(detail) + "</span>" : "") + "</span>" + chipHtml + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" + ed + "</li>";
  }
  function foodList(scope) {
    var rows = visibleFood(scope);
    if (!rows.length) {
      return '<div class="empty">' + ICON.pot + "<b>" + (scope === "me" ? "Nothing remembered about you yet" : "Nothing for the whole kitchen yet") + "</b><p class=\"small\">" +
        (scope === "me" ? "Tell your assistant what you like, dislike, cannot eat or want less often, and it shows up here." : isAdmin() ? "Allergies and house rules for everyone go here. Tell your assistant, and say it is for the household." : "Allergies and house rules for everyone go here. Only household admins can add them.") + "</p></div>";
    }
    var out = "";
    RULE_ORDER.forEach(function (st) {
      var g = rows.filter(function (c) { return c.rule === st; });
      if (g.length) out += g.map(function (c) { return foodRow(c, scope); }).join("");
    });
    var ended = scope === "me" ? endedFood() : [];
    return '<ul class="flist">' + out + "</ul>" + (ended.length ? '<p class="note">Ended on its own and back to neutral: ' + ended.map(function (c) { return esc(c.subject) + " (" + dayText(c.ends) + ")"; }).join(", ") + ".</p>" : "");
  }

  /* ---------- screens ---------- */
  function seg() {
    return '<div class="seg2 wide" role="tablist" aria-label="Whose preferences">' +
      [["mine", "Mine"], ["hh", "Household"]].map(function (t) {
        return '<button type="button" role="tab" id="tab-' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '" aria-controls="panel-' + t[0] + '" class="' + (S.tab === t[0] ? "on" : "") + '" data-act="tab" data-id="' + t[0] + '">' + t[1] + "</button>";
      }).join("") + "</div>";
  }

  function navRow(label, value, kind, text, id, act) {
    return '<button type="button" class="pbtn navrow" data-act="' + (act || "nav") + '" data-id="' + esc(id) + '"><span class="pt"><span class="pl">' + esc(label) + '</span><span class="pv">' + esc(value) + "</span></span>" + chip(kind, text) + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>";
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
      '<p class="note">Your statements and the household\'s are added together, not swapped. Say new ones, or a new category, to your assistant. The household\'s can be changed by household admins only.</p></div>' +
      '<span class="lbl">Just for you</span><div class="card sgroup">' + assistantRow() +
      navRow("Kitchen role", m.role || "Pick a kitchen role", "you", "Only you", "Me") + "</div>" +
      '<span class="lbl">Not asking about</span><div class="card sgroup">' + stopsList() + "</div>" +
      '<span class="lbl">On this device</span><div class="card sgroup">' + navRow("Look and display", "Theme, name size, emoji, compact rows", "bi", "This device", "Settings") + '</div>' +
      '<p class="small">Theme and display options stay on this phone and are not part of your account. Recipe stars and votes belong to the household, not to you.</p><button type="button" class="lnk" data-act="goto" data-id="hh:recipes">See Recipe stars and votes under Household</button></div>';
  }

  function householdScreen() {
    var only = M.only;
    var head = isAdmin() ? '<p class="note">' + (roleOf(S.as) === "founder" ? "You are the founding member, so you are an admin." : "You are a household admin.") + " Admins can change these. Other members can only look.</p>"
      : '<p class="note ro">' + ICON.lock + "<span>" + ADMIN_WHY + " You can still change everything on Mine.</span></p>";
    return '<div role="tabpanel" id="panel-hh" aria-labelledby="tab-hh" class="mbody2">' +
      '<p>Shared by everyone in ' + esc(only.name) + ". Used for anyone who has not chosen their own.</p>" + head +
      '<span class="lbl">Stock-check defaults</span><div class="card sgroup">' + ROWS.map(function (r) { return dialRow(r, "hh"); }).join("") + "</div>" +
      '<span class="lbl">Household note</span><div class="card sgroup">' + noteRow("hh") + "</div>" +
      '<span class="lbl">Food for everyone</span><div class="card sgroup foodcard">' + foodList("hh") +
      '<p class="note">' + (isAdmin() ? "Household admins can say or remove these. Safety ones ask twice before they are removed." : "Only household admins can say or remove these.") + "</p></div>" +
      '<span class="lbl">Only the household has these</span><div class="card sgroup">' +
      navRow("Members and admins", M.members.length + " members, " + adminNames().length + " admins", "hh", "Household only", "members", "view") +
      navRow("Household name", only.name, "hh", "Household only", "Household name") +
      navRow("Categories", only.categories, "hh", "Household only", "Categories") +
      navRow("Locations and spots", only.locations, "hh", "Household only", "Locations and spots") +
      '<div class="prow static" id="hh-recipes"><div class="pbtn"><span class="pt"><span class="pl">Recipe stars and votes</span><span class="pv"><b>' + esc(only.recipes) + '</b></span><span class="pw">' + esc(only.recipesWhy) + "</span></span>" + chip("hh", "Household only") + "</div></div></div>" +
      '<p class="small">These have no personal version, so there is nothing to override on Mine.</p></div>';
  }

  /* Members and admins (D25 to D27). Every member can see it (READING: who may see who is admin is open); only the founding member gets the grant and revoke buttons (READING: whether admins share that right is open). */
  function membersScreen(flash) {
    var canGrant = roleOf(S.as) === "founder";
    var WHAT = { founder: "Set the household up. Always an admin.", admin: "Can change household settings", member: "Can change their own preferences" };
    var KIND = { founder: "you", admin: "hh", member: "bi" };
    var li = M.members.map(function (m) {
      var n = PEOPLE[m.id].name;
      var btn = canGrant && m.role !== "founder"
        ? '<button type="button" class="btn" data-act="' + (m.role === "admin" ? "revoke" : "grant") + '" data-id="' + m.id + '" aria-label="' + (m.role === "admin" ? "Remove " + esc(n) + " as admin" : "Make " + esc(n) + " an admin") + '">' + (m.role === "admin" ? "Remove admin" : "Make admin") + "</button>" : "";
      return '<li><span class="sname">' + esc(n) + (m.id === S.as ? " (you)" : "") + '<span class="swhat">' + chip(KIND[m.role], ROLE_WORD[m.role]) + "<br>" + esc(WHAT[m.role]) + "</span></span>" + btn + "</li>";
    }).join("");
    return '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="view" data-id="main">&lsaquo; Back</a><h1 class="ttl">Members and admins</h1><span style="width:64px" aria-hidden="true"></span></div>' +
      '<main class="mbody">' + flash +
      "<p>Admins can change what the whole household shares: its settings, notes and food rules. Everyone can always change their own preferences, whatever their role.</p>" +
      '<span class="lbl">Members</span><div class="card sgroup"><ul class="stops" aria-label="Members and admins">' + li + "</ul></div>" +
      '<p class="note">' + (canGrant ? "You set up the household. You choose who else is an admin, one person at a time, and you can take it back." : "Only the founding member can make someone an admin, or take it back.") + "</p></main></div>";
  }

  function render() {
    var keepScroll = window.scrollY;
    var flash = S.flash ? '<div class="banner" role="status">' + esc(S.flash) + "</div>" : "";
    if (S.view === "members") { root.innerHTML = membersScreen(flash); window.scrollTo(0, keepScroll); syncControls(); if (S.focus) { var fe = root.querySelector(S.focus); if (fe) fe.focus({ preventScroll: true }); S.focus = null; } return; }
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
    if (st) st.textContent = who().name + " (" + ROLE_WORD[roleOf(S.as)].toLowerCase() + ") · " + (S.view === "members" ? "Members and admins" : S.tab === "mine" ? "Mine" : "Household") + " · " + (S.data === "empty" ? "nothing set yet" : "some set");
  }

  /* ---------- actions ---------- */
  function saved(id) { S.saved = id; }
  function setDial(scope, key, val) {
    var d = scope === "me" ? mine().dials : M.hh.dials;
    if (val === "" || val === null) delete d[key]; else d[key] = val;
  }
  function foodById(id) { return M.food.filter(function (x) { return x.id === id.split(":")[1]; })[0]; }
  function parseHours(t) {
    var n = Number(String(t).replace(",", "."));
    return isFinite(n) && n >= -12 && n <= 14 ? String(Math.round(n * 60)) : null;
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-act]");
    if (!t || !root.contains(t) && !t.closest(".mh-jump")) return;
    var act = t.getAttribute("data-act"), id = t.getAttribute("data-id"), val = t.getAttribute("data-val");
    if (t.tagName === "A") ev.preventDefault();
    if (act === "view") { S.view = id === "main" ? null : id; S.open = null; S.flash = ""; S.saved = ""; S.confirm = null; S.focus = null; render(); var vf = root.closest(".mh-frame"); if (vf && vf.getBoundingClientRect().top < 0) vf.scrollIntoView({ block: "start" }); }
    else if (act === "grant" || act === "revoke") { /* D27: the founding member's call, per person */
      if (roleOf(S.as) !== "founder") return;
      M.members.forEach(function (m) { if (m.id === id && m.role !== "founder") m.role = act === "grant" ? "admin" : "member"; });
      S.flash = PEOPLE[id].name + (act === "grant" ? " is now a household admin." : " is no longer a household admin."); S.focus = '[data-act="' + (act === "grant" ? "revoke" : "grant") + '"][data-id="' + id + '"]'; render();
    }
    else if (act === "tab") { S.tab = id; S.open = null; S.flash = ""; S.saved = ""; S.confirm = null; render(); }
    else if (act === "toggle") { S.open = S.open === id ? null : id; S.saved = ""; S.confirm = null; S.flash = ""; S.focus = '[data-id="' + id + '"]'; render(); }
    else if (act === "pick") {
      var p = id.split(":"), row = p[1];
      if (!canWrite(p[0])) return;
      if (row === "quiet") { setDial(p[0], "quiet_start", ""); setDial(p[0], "quiet_end", ""); setDial(p[0], "quiet_off", val === "off" ? "1" : ""); }
      else setDial(p[0], row, val);
      saved(id); S.focus = '[data-act="pick"][data-id="' + id + '"][data-val="' + val + '"]'; render();
    }
    else if (act === "assistant") { mine().assistant = val === "none" ? null : val; saved(id); S.focus = '[data-act="assistant"][data-val="' + val + '"]'; render(); }
    else if (act === "goto") { var g = id.split(":"); S.tab = g[0]; S.open = g[1] === "recipes" ? null : g[0] + ":" + g[1]; S.saved = ""; S.flash = ""; render(); var target = root.querySelector(g[1] === "recipes" ? "#hh-recipes" : '[data-row="' + g[0] + ":" + g[1] + '"]'); if (target) { target.scrollIntoView({ block: "center" }); } }
    else if (act === "nav") { S.flash = "Opens " + id + ". Not drawn in this option."; S.open = null; render(); }
    else if (act === "askagain") { var m = mine(); m.stops = m.stops.filter(function (x) { return x.id !== id; }); S.focus = null; render(); }
    else if (act === "attach" || act === "attachall" || act === "notthese" || act === "detach" || act === "clearend") {
      var f = foodById(id);
      if (f.owner === null && !isAdmin()) return;
      if (act === "attach") { f.suggest = f.suggest.filter(function (x) { if (x[0] === val) { f.recipes.push(x[0]); return false; } return true; }); }
      else if (act === "attachall") { f.suggest.forEach(function (x) { f.recipes.push(x[0]); }); f.suggest = []; }
      else if (act === "notthese") { f.suggest = []; }
      else if (act === "detach") { f.recipes = f.recipes.filter(function (r) { return r !== val; }); }
      else if (act === "clearend") { delete f.ends; }
      saved(id); S.focus = '[data-act="toggle"][data-id="' + id + '"]'; render();
    }
    else if (act === "forget") {
      var c = foodById(id);
      if (c.owner === null && !isAdmin()) return;
      var strict = c && c.rule === "avoid" && c.reason !== "other";
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
      if (!canWrite(p[0])) return;
      delete d.quiet_off; // picking hours again drops the member's "none"
      d[t.getAttribute("data-end") === "start" ? "quiet_start" : "quiet_end"] = t.value || undefined;
      if (d.quiet_start === undefined && d.quiet_end === undefined) { delete d.quiet_start; delete d.quiet_end; }
      else { if (d.quiet_start === undefined) delete d.quiet_start; if (d.quiet_end === undefined) delete d.quiet_end; }
      saved(id); S.focus = "#" + t.id; render();
    } else if (act === "field") {
      var q = id.split(":"), key = q[1];
      if (!canWrite(q[0])) return;
      if (key === "daily_cap") { var n = parseInt(t.value, 10); setDial(q[0], key, isFinite(n) && n >= 1 && n <= 20 ? String(n) : ""); }
      else { var m2 = t.value.trim() === "" ? "" : parseHours(t.value); setDial(q[0], key, m2 === null ? "" : m2); }
      saved(id); S.focus = "#" + t.id; render();
    } else if (act === "cap") {
      var fc = foodById(id), mx = parseInt(t.value, 10);
      if (fc.owner === null && !isAdmin()) return;
      if (isFinite(mx) && mx >= 1 && mx <= 7) fc.max = mx;
      saved(id); S.focus = "#" + t.id; render();
    } else if (act === "note") {
      var s = id.split(":")[0], text = t.value.trim().slice(0, NOTE_MAX);
      if (!canWrite(s)) return;
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
    var as = q.get("as"), data = q.get("data"), tab = q.get("tab"), open = q.get("open"), view = q.get("view");
    if (as && PEOPLE[as]) S.as = as;
    if (data && data !== S.data && (data === "typical" || data === "empty")) { S.data = data; var kept = M.members; M = seed(data); M.members = kept; }
    S.view = view === "members" ? "members" : null;
    if (tab === "mine" || tab === "hh") S.tab = tab;
    S.open = open || null; S.saved = ""; S.flash = ""; S.confirm = null;
    render();
    if (open) { var el = root.querySelector('[data-row="' + open + '"]'); if (el) el.scrollIntoView({ block: "center" }); }
  }
  document.querySelectorAll("[data-pc]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-pc"), v = b.getAttribute("data-v");
      if (k === "data") { S.data = v; var kept = M.members; M = seed(v); M.members = kept; } else if (k === "as") { S.as = v; }
      S.open = null; S.saved = ""; S.flash = ""; S.confirm = null; render();
    });
  });
  document.querySelectorAll(".mh-jump a").forEach(function (a) {
    a.addEventListener("click", function (ev) { ev.preventDefault(); applyParams(new URLSearchParams(a.getAttribute("href").split("?")[1] || "")); window.scrollTo({ top: 0 }); });
  });

  applyParams(new URLSearchParams(location.search));
})();
