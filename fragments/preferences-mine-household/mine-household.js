/* Preferences, option B: "Mine" and "Household" as two separate sections.
   Mockup only: sample people, sample values and the little state machine live here, never in the stylesheet (AGENTS.md "Mockup and build stay close").
   The rules below are the ones the code holds today (see docs/knowledge/user-preferences/option-b-mine-and-household.md):
   - Stock-check dials resolve per key: built-in default, then the household's value, then the member's own (Kitchie store.ts dialsFor). Clearing a value falls back one level.
   - Kitchie today lets only the household owner (the longest-standing member) write household dials and the household note (web-stock.ts). D5 (any member may) and D8 (any member may record household food claims)
     are SUPERSEDED by D25 to D29 (owner, voice, 10 October 2026, later session): a binary household admin role. The founding member is admin by default and grants or revokes admin per person (D26, D27);
     only admins change household-level values (D28), so a non-admin sees them read-only with "Only household admins can change this."; personal values are never gated (D29). Tenure gating and finer roles stay deferred.
     A member may also set quiet hours to none for themselves (D6). Most suggestions per day is 1 to 20 (D7), default 3 (D20 revised the default from 2).
   - Roles: the sample household has Arjan (founding member), Jo (an admin) and Sam (a plain member). "Household admin" is not "Kitchen role", which is a free label on the person's own profile (D30).
   - Voice review of 10 October 2026 (D15 to D24, docs/knowledge/user-preferences/option-b-mine-and-household.md): sources are App, Household, You (D16); the section is Stock level checks and holds the
     switched-off list (D17); no time zone setting (D18); quiet hours app default 10pm to 6am, a person may pick own hours or None (D19); level and frequency are set by scope, most specific wins, and the
     standalone "How proactive" dial is gone (D21); check amounts is on by default (D22); household and personal notes sit side by side (D23); Kitchen role and My assistant live in the profile (D24).
   - Notes are NOT an override: the household note and the member's own note are both read.
   - Food statements are NOT an override either: a member sees their own plus the household's ("Everyone"). They are said to the assistant today; no web editor exists (Proposal here).
   - Food rules (owner, voice, 10 October 2026; docs/knowledge/user-preferences/food-preferences.md F1 to F10): avoid is permanent and hard ("never suggest" is dropped); like and dislike are soft and may end;
     a limit caps how often; a category holds the rule, a note and recipes attached by reference whose titles are read from Recipe each time. The JSON shape and operations are a PROPOSAL (Q-F1 and on).
   - Substitutions (owner, voice, 10 October 2026; food F11 and on): "usually" is no longer a kind of its own. A substitution says: when ingredient X is in a recipe, swap in Y (optionally with a reason),
     or do Z to it (a cooking instruction, for example blanch frozen food). Household and person tiers like the other food rules, the person's over the household's, and NO end date. The record shape
     (rule substitute, swap or instruction, why) is a PROPOSAL (Q-F13 and on). A past "usually" habit statement (pancakes at the weekend) is drawn here as a like with its day; that reading is also open.
   - Nothing here is viewport specific: the wide layout lives in mine-household-600.css and mine-household-1024.css. */
(function () {
  "use strict";

  /* ---------- the model's own vocabulary ---------- */
  var DEFAULTS = { enabled: "on", quiet_start: "22:00", quiet_end: "06:00", daily_cap: "3", level: "normal", every: null }; // the app's own values (DEFAULT_DIALS); "every" null: the app decides per item
  var LEVELS = [["quiet", "Quiet, I do not need to know"], ["normal", "Normal"], ["helpful", "Helpful, ask me more"]];
  var EVERY = [["1", "Every day"], ["3", "Every 3 days"], ["7", "Once a week"], ["14", "Every 2 weeks"], ["30", "Once a month"]];
  var ASSISTANTS = [["claude", "Claude"], ["chatgpt", "ChatGPT"]]; // the clients linked through sign-in (profile demo only)
  var RULE_WORD = { avoid: "Avoids", cap: "Limit", substitute: "Substitution", like: "Likes", dislike: "Dislikes" };
  var RULE_ORDER = ["avoid", "cap", "substitute", "like", "dislike"];
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
    var full = kind !== "empty"; // "nosubs" is the same as typical without any substitution
    return {
      hh: {
        dials: full ? { quiet_start: "21:00", quiet_end: "07:00", daily_cap: "5" } : {},
        note: full ? "Not a nut-free kitchen, check labels before anything goes on the list." : ""
      },
      /* D25 to D27. The role is kept on the household member, not on a preference. The founding member is the person who first set the household up. */
      members: [{ id: "arjan", role: "founder" }, { id: "jo", role: "admin" }, { id: "sam", role: "member" }],
      me: {
        jo: { dials: {}, note: "", assistant: null, role: null, stops: [] },
        sam: {
          dials: {},
          note: full ? "Tea before talk. Keep questions short." : "",
          role: full ? "Pantry Marshal" : null,
          stops: full ? [
            { id: "st1", name: "Freezer", what: "Everything in this place. We check back after 2026-11-09", own: true },
            { id: "st2", name: "Oat milk", what: "Snoozed. Asks again after 2026-10-17 (a stop on one item covers everyone)", own: false }
          ] : []
        },
        arjan: {
          dials: full ? { daily_cap: "6", enabled: "on" } : {},
          note: "",
          role: full ? "Head Chef" : null,
          stops: []
        }
      },
      /* Check level and frequency by scope (D21). who: hh (the household's) or a person. kind: item, catloc (category in a location), cat, loc (a location, with a spot or without), all (the whole kitchen).
         A rule sets a level, a frequency (days) or both; what it leaves out comes from a broader rule, then the app. Sample items below are the mockup's own (Kitchie items carry area, spot and category). */
      rules: full ? [
        { id: "all-hh", who: "hh", kind: "all", level: "quiet" },
        { id: "ru2", who: "sam", kind: "item", a: "milk", every: "7" },
        { id: "ru3", who: "sam", kind: "catloc", a: "Proteins", b: "Freezer", level: "quiet" },
        { id: "all-sam", who: "sam", kind: "all", level: "helpful" }
      ] : [],
      /* the AI clients this person has linked through platform sign-in (oauth_grants.client_name); the profile demo only */
      linked: { sam: full ? ["claude"] : [], arjan: full ? ["claude", "chatgpt"] : [] },
      defaultAssistant: { sam: null, arjan: null },
      /* member_id null in the model means the household: here owner is null for "Everyone".
         level: ingredient (matched on what is in a recipe) or category (matched on the recipes attached to it, by reference).
         ends: optional, only on like and dislike; the person's words gave it ("for the next two weeks"), there is no date field. */
      food: full ? [
        { id: "c1", owner: null, level: "ingredient", rule: "avoid", subject: "peanuts", reason: "safety", said: "We cannot have peanuts in the house.", support: 3 },
        { id: "c2", owner: null, level: "ingredient", rule: "avoid", subject: "liver", reason: "other", said: "Never suggest liver, nobody eats it.", support: 1 },
        { id: "c3", owner: null, level: "ingredient", rule: "like", subject: "pancakes", when: "weekend", said: "We usually do pancakes at the weekend.", support: 2 },
        /* substitutions: trigger in subject (words), then swap (a list, first is preferred) or instruction (one cooking instruction), optional why. No ends: they stand until changed or removed. */
        { id: "c12", owner: null, level: "ingredient", rule: "substitute", subject: "frozen food", instruction: "Blanch it first", why: "Texture", said: "Wherever there is frozen food, blanch it first, otherwise it comes out rubbery.", support: 1 },
        { id: "c15", owner: null, level: "ingredient", rule: "substitute", subject: "white bread", swap: ["wholegrain bread"], said: "We buy wholegrain, not white.", support: 1 },
        { id: "c8", owner: null, level: "category", rule: "cap", subject: "Deep-fried", max: 1, recipes: ["r-fish"], suggest: [], said: "Deep-fried dinners no more than once a week.", support: 1 },
        { id: "c4", owner: "sam", level: "ingredient", rule: "dislike", subject: "coriander", said: "I do not like coriander, fine if it is a garnish.", support: 1 },
        { id: "c5", owner: "sam", level: "ingredient", rule: "like", subject: "pumpkin", ends: "2026-10-31", said: "I am into pumpkin this month.", support: 1 },
        { id: "c6", owner: "sam", level: "ingredient", rule: "dislike", subject: "mushrooms", said: "Not a fan of mushrooms.", support: 1 },
        { id: "c9", owner: "sam", level: "category", rule: "cap", subject: "Spicy", max: 2, recipes: ["r-chilli", "r-laksa", "r-green"], suggest: [["r-kimchi", "Chilli paste in the sauce"], ["r-tomyum", "Hot and sour broth with chilli"]], said: "Spicy is fine, just no more than twice a week.", support: 1 },
        { id: "c10", owner: "sam", level: "category", rule: "dislike", subject: "Spicy noodles", ends: "2026-10-24", recipes: ["r-dandan", "r-garlic"], suggest: [], said: "I cannot face spicy noodles for the next two weeks.", support: 1 },
        { id: "c11", owner: "sam", level: "ingredient", rule: "dislike", subject: "lamb", ends: "2026-10-05", said: "No lamb for a week, please.", support: 1 },
        { id: "c7", owner: "arjan", level: "ingredient", rule: "like", subject: "roast chicken", said: "Roast chicken is my favourite.", support: 1 },
        { id: "c13", owner: "arjan", level: "ingredient", rule: "substitute", subject: "gluten-based pasta", swap: ["sourdough bread"], said: "Wherever there is gluten-based pasta I am happy to have sourdough bread instead.", support: 1 },
        { id: "c14", owner: "arjan", level: "ingredient", rule: "substitute", subject: "white bread", swap: ["sourdough", "seeded sourdough"], said: "Wherever there is white bread, I would rather have sourdough or seeded sourdough.", support: 1 }
      ].filter(function (c) { return kind !== "nosubs" || c.rule !== "substitute"; }) : [],
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
  var S = { as: "sam", tab: "mine", view: null, data: "typical", open: null, flash: "", saved: "", confirm: null, probe: "milk", pfmsg: "" };
  var M = seed(S.data);
  var root = document.getElementById("app");

  /* ---------- where the screen lives (owner, 11 Oct 2026) ----------
     Desktop: Preferences is its own section of the Settings window, right after Settings, and it opens inside that window (the /settings/preferences address too). There is no separate full-page layout.
     This page therefore draws the Settings window around the screen at 1024px and wider (KProfile.inline, from fragments/desktop-profile), and the Profile window's Preferences section loads this page with ?embed=1.
     Phone and tablet: unchanged, Settings > Kitchen > Preferences, the phone frame with a Settings back link. The choice is made at load. */
  var EMBED = new URLSearchParams(location.search).get("embed") === "1";
  var INWIN = EMBED || !!(window.KProfile && window.KProfile.inline && window.matchMedia("(min-width:1024px)").matches);
  if (INWIN) document.documentElement.classList.add("mh-win");
  if (EMBED) {
    document.documentElement.classList.add("mh-embed");
    if (window.parent !== window) document.addEventListener("keydown", function (e) { /* hand the window's own keys up to the Settings window */
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || "");
      if ((e.key === "Enter" && (e.ctrlKey || e.metaKey)) || (!inField && !e.ctrlKey && !e.metaKey && !e.altKey && /^[1-6?]$/.test(e.key))) { e.preventDefault(); window.parent.postMessage({ kind: "pf-key", key: e.key, ctrl: e.ctrlKey, meta: e.metaKey }, "*"); }
    });
  } else if (INWIN) {
    var host = root.closest(".mh-frame");
    if (host) { host.classList.add("mh-winhost"); var pane = window.KProfile.inline(host, "preferences"); pane.classList.add("pf-flush"); pane.appendChild(root); }
  }

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

  /* Effective dial values: the app's own, then the household's, then this member's (store.ts dialsFor). The three sources are App, Household and You (D16). */
  function effective(key) {
    var h = M.hh.dials, m = mine().dials;
    if (m[key] !== undefined) return { v: m[key], from: "you" };
    if (h[key] !== undefined) return { v: h[key], from: "hh" };
    return { v: DEFAULTS[key], from: "app" };
  }
  function householdValue(key) { // what a member falls back to
    var h = M.hh.dials;
    return h[key] !== undefined ? { v: h[key], from: "hh" } : { v: DEFAULTS[key], from: "app" };
  }
  function show(key, v) {
    if (key === "enabled") return v === "on" ? "On" : "Off";
    return v;
  }
  function clock(t) { // "22:00" reads as 10pm, "06:30" as 6:30am
    var p = t.split(":"), h = Number(p[0]), ap = h >= 12 ? "pm" : "am", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (p[1] === "00" ? "" : ":" + p[1]) + ap;
  }
  function quietText(start, end) { return start && end ? clock(start) + " to " + clock(end) : "None"; }
  function quietOf(d, below) { // one value, from this level or the level below. A person's explicit "none" is a value of their own (D6, D19)
    if (d.quiet_off) return { start: null, end: null, own: true };
    if (d.quiet_start !== undefined && d.quiet_end !== undefined) return { start: d.quiet_start, end: d.quiet_end, own: true };
    return { start: below.start, end: below.end, own: false };
  }
  function appQuiet() { return { start: DEFAULTS.quiet_start, end: DEFAULTS.quiet_end }; }
  function hhQuiet() { return quietOf(M.hh.dials, appQuiet()); }

  /* One row model per setting, the same three rows for Mine and Household. Time zone is not here (D18): Kitchie takes it from the device or account. */
  var ROWS = [
    { id: "enabled", label: "Ask me to check amounts", hhLabel: "Ask to check amounts", keys: ["enabled"] },
    { id: "quiet", label: "Quiet hours", hhLabel: "Quiet hours", keys: ["quiet_start", "quiet_end"] },
    { id: "daily_cap", label: "Most suggestions per day", hhLabel: "Most suggestions per day", keys: ["daily_cap"] }
  ];

  function rowValue(row, scope) { // scope: "me" or "hh"; returns { text, from, ... }
    var base = scope === "me" ? effective : householdValue;
    if (row.id === "quiet") {
      var hq = hhQuiet(), hfrom = hq.own ? "hh" : "app";
      if (scope === "hh") return { text: quietText(hq.start, hq.end), from: hfrom, plain: hq };
      var mq = quietOf(mine().dials, hq);
      return { text: quietText(mq.start, mq.end), from: mq.own ? "you" : hfrom, plain: mq, hh: hq, hhFrom: hfrom };
    }
    var e = base(row.id), out = { text: show(row.id, e.v), from: e.from, raw: e.v };
    if (scope === "me" && e.from === "you") { var h = householdValue(row.id); out.hhText = show(row.id, h.v); out.hhFrom = h.from; }
    return out;
  }

  var CHIP = { you: ["you", "You"], hh: ["hh", "Household"], app: ["app", "App"] };
  function chip(kind, text) { return '<span class="src ' + kind + '">' + esc(text) + "</span>"; }
  /* The Household chip as the tap target (owner, 11 Oct 2026): it goes to the household notes on the Household tab. Same chip, drawn as a button with a chevron. */
  function chipGo(kind, text, id, label) { return '<button type="button" class="src ' + kind + '" data-act="goto" data-id="' + id + '" aria-label="' + esc(label) + '">' + esc(text) + ICON.chev + "</button>"; }
  function chipFor(from) { return chip(CHIP[from][0], CHIP[from][1]); }

  /* The provenance chain, App then Household then You, with the one in force in bold (D16). */
  function chainLine(parts) { // parts: [[word, value or null]] in order; the last one with a value is in force
    var last = -1;
    parts.forEach(function (p, i) { if (p[1] !== null) last = i; });
    return '<p class="pw" aria-label="Where the value comes from">' + parts.map(function (p, i) {
      return (i === last ? "<b>" : "") + esc(p[0]) + " " + esc(p[1] === null ? "not set" : p[1]) + (i === last ? "</b>" : "");
    }).join(" &rsaquo; ") + "</p>";
  }
  function dialChain(row, scope) {
    var hh = M.hh.dials, me = mine().dials, parts = [];
    if (row.id === "quiet") {
      parts.push(["App", quietText(DEFAULTS.quiet_start, DEFAULTS.quiet_end)]);
      parts.push(["Household", hhQuiet().own ? quietText(hhQuiet().start, hhQuiet().end) : null]);
      if (scope === "me") parts.push(["You", me.quiet_off ? "None" : me.quiet_start !== undefined ? quietText(me.quiet_start, me.quiet_end) : null]);
    } else {
      var k = row.id;
      parts.push(["App", show(k, DEFAULTS[k])]);
      parts.push(["Household", hh[k] !== undefined ? show(k, hh[k]) : null]);
      if (scope === "me") parts.push(["You", me[k] !== undefined ? show(k, me[k]) : null]);
    }
    return chainLine(parts);
  }

  /* ---------- setting rows ---------- */
  function dialRow(row, scope) {
    var v = rowValue(row, scope), openId = scope + ":" + row.id, isOpen = S.open === openId;
    var label = scope === "me" ? row.label : row.hhLabel;
    var why = "";
    if (scope === "me" && v.from === "you") why = '<span class="pw">' + (v.hhFrom === "hh" ? "Household" : "App") + " says " + esc(row.id === "quiet" ? quietText(v.hh.start, v.hh.end) : v.hhText) + "</span>";
    if (scope === "me" && v.from === "hh") why = '<span class="pw">Same as household</span>';
    if (scope === "me" && v.from === "app") why = '<span class="pw">Same as app default</span>';
    return '<div class="prow" data-row="' + openId + '">' +
      '<button type="button" class="pbtn" data-act="toggle" data-id="' + openId + '" aria-expanded="' + isOpen + '" aria-controls="ed-' + scope + '-' + row.id + '">' +
      '<span class="pt"><span class="pl">' + esc(label) + '</span><span class="pv"><b>' + esc(v.text) + "</b></span>" + why + "</span>" +
      chipFor(v.from) + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" +
      (isOpen ? dialEditor(row, scope, v) : "") + "</div>";
  }

  function savedLine(id) { return S.saved === id ? '<p class="saved small" role="status">Saved</p>' : ""; }

  function optionBtn(act, id, val, text, checked, extra) {
    return '<button type="button" class="popt" role="radio" aria-checked="' + checked + '" data-act="' + act + '" data-id="' + id + '" data-val="' + esc(val) + '"' + (extra || "") + '><span>' + esc(text) + '</span><span class="ck" aria-hidden="true"></span></button>';
  }

  /* The open row says where the value comes from in its first choice: "Same as household (value)", or "Same as app default (value)" when nobody above has set one (D16). */
  function inheritLabel(row, scope) {
    var below = scope === "me" ? rowValue(row, "hh") : { text: row.id === "quiet" ? quietText(DEFAULTS.quiet_start, DEFAULTS.quiet_end) : show(row.id, DEFAULTS[row.id]), from: "app" };
    return { text: (below.from === "hh" ? "Same as household" : "Same as app default") + " (" + below.text + ")", raw: below.raw };
  }

  function dialEditor(row, scope, v) {
    if (!canWrite(scope)) return '<div class="ped" id="ed-' + scope + "-" + row.id + '"><p class="small">' + (row.id === "quiet" ? "Members who have not set their own hours get this." : "Members who have not chosen their own get this.") + "</p>" + lockNote() + "</div>";
    var id = scope + ":" + row.id, d = scope === "me" ? mine().dials : M.hh.dials, out = "";
    var inh = inheritLabel(row, scope);
    var set = row.keys.some(function (k) { return d[k] !== undefined; }) || !!d.quiet_off;
    out += '<div class="ped" id="ed-' + scope + "-" + row.id + '">' + dialChain(row, scope);
    if (row.id === "enabled") {
      out += '<div role="radiogroup" aria-label="' + esc(row.label) + '" class="plist">' +
        optionBtn("pick", id, "", inh.text, !set) + optionBtn("pick", id, "on", "On", set && d.enabled === "on") + optionBtn("pick", id, "off", "Off", set && d.enabled === "off") + "</div>";
      out += '<p class="note">Turning this off stops every question on the web and in chat. Estimates already stored stay. It is on unless someone turns it off.</p>';
    } else if (row.id === "quiet") {
      var mode = d.quiet_off ? "off" : d.quiet_start !== undefined ? "own" : "inherit";
      out += '<div role="radiogroup" aria-label="Quiet hours" class="plist">' + optionBtn("pick", id, "", inh.text, mode === "inherit") +
        optionBtn("pick", id, "own", scope === "me" ? "My own hours" : "Household hours", mode === "own") +
        (scope === "me" ? optionBtn("pick", id, "off", "None, no quiet hours for me", mode === "off") : "") + "</div>";
      if (mode === "own") out += '<fieldset class="two"><legend>Quiet hours</legend><div><label for="q-s-' + scope + '">From</label><input id="q-s-' + scope + '" type="time" data-act="quiet" data-id="' + id + '" data-end="start" value="' + esc(d.quiet_start) + '"></div>' +
        '<div><label for="q-e-' + scope + '">Until</label><input id="q-e-' + scope + '" type="time" data-act="quiet" data-id="' + id + '" data-end="end" value="' + esc(d.quiet_end) + '"></div></fieldset>';
      out += '<p class="note">No questions are asked in between. The hours follow ' + (scope === "me" ? "your" : "each person\'s") + " time zone, which comes from the device or account. It is not a setting.</p>";
      if (scope === "me") out += '<p class="note">This one is always yours to change. None means no quiet hours for you at all, whatever the household has.</p>';
    } else if (row.id === "daily_cap") {
      var own = d.daily_cap !== undefined;
      out += '<div role="radiogroup" aria-label="Most suggestions per day" class="plist">' + optionBtn("pick", id, "", inh.text, !own) + optionBtn("pick", id, "own", scope === "me" ? "My own number" : "A number for the household", own) + "</div>";
      if (own) out += '<label for="cap-' + scope + '">Most suggestions per day</label><input id="cap-' + scope + '" class="fld" type="number" min="1" max="20" step="1" inputmode="numeric" data-act="field" data-id="' + id + '" value="' + esc(d.daily_cap) + '">';
      out += '<p class="note">From 1 to 20. The most stock level questions asked in one day.</p>';
    }
    if (scope === "me" && v.from !== "you") {
      out += '<p class="small"><button type="button" class="lnk" data-act="goto" data-id="hh:' + row.id + '">See the household\'s setting</button></p>';
    }
    out += savedLine(id) + "</div>";
    return out;
  }

  /* ---------- level and how often, by scope (D21) ----------
     One rule model replaces the standalone "How proactive" dial: the same quiet, normal or helpful level, and a check frequency, can be set for the whole kitchen, a category, a location (with or without a spot), a
     category in a location, or one item. The most specific scope wins. Two things are not decided and are marked in the code: category against location (Q-V3), and a person's broad rule against the household's
     narrow one (Q-V2). Here a narrow scope wins first, and at the same scope You beat Household. */
  var ITEMS = {
    milk: { name: "Milk", loc: "Fridge", spot: "Door", cat: "Dairy" },
    yoghurt: { name: "Yoghurt", loc: "Fridge", spot: "Shelf 1", cat: "Dairy" },
    chicken: { name: "Chicken thighs", loc: "Freezer", spot: "Top drawer", cat: "Proteins" },
    pasta: { name: "Pasta", loc: "Pantry", spot: "Shelf 2", cat: "Dry goods" }
  };
  var RANK = { all: 1, cat: 2, loc: 2, catloc: 3, item: 4 };
  function applies(r, it) {
    if (r.kind === "all") return true;
    if (!it) return false;
    if (r.kind === "item") return ITEMS[r.a] === it;
    if (r.kind === "cat") return it.cat === r.a;
    if (r.kind === "catloc") return it.cat === r.a && it.loc === r.b;
    if (r.kind === "loc") return it.loc === r.a && (!r.b || it.spot === r.b);
    return false;
  }
  function weight(r) { return [RANK[r.kind], r.kind === "loc" && r.b ? 1 : 0, r.who === "hh" ? 0 : 1]; }
  function cmpW(a, b) { for (var i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }
  function visibleRules(viewer) { return M.rules.filter(function (r) { return r.who === "hh" || (viewer && r.who === viewer); }); }
  /* The winning value for one key (level or every) on one item. `below`: only rules lighter than this weight, for the "Same as" choice. */
  function pickKey(it, key, viewer, below) {
    var rs = visibleRules(viewer).filter(function (r) { return r[key] !== undefined && applies(r, it) && (!below || cmpW(weight(r), below) < 0); });
    if (!rs.length) return { v: DEFAULTS[key], from: "app" };
    rs.sort(function (a, b) { return cmpW(weight(b), weight(a)); });
    var top = rs[0];
    var tie = rs.some(function (r) { return r !== top && r.kind !== top.kind && RANK[r.kind] === RANK[top.kind] && weight(r)[1] === weight(top)[1]; }); // category against location: Q-V3
    return { v: top[key], from: top.who === "hh" ? "hh" : "you", rule: top, tie: tie };
  }
  function ruleFallback(r, key, viewer) { // what applies without this rule, for an item in its target (or the whole kitchen)
    var it = null;
    Object.keys(ITEMS).forEach(function (k) { if (!it && r.kind !== "all" && applies(r, ITEMS[k])) it = ITEMS[k]; });
    return pickKey(it, key, viewer, weight(r));
  }
  function levelWord(v) { return cap(v); }
  function everyWord(v) { var f = EVERY.filter(function (x) { return x[0] === v; })[0]; return f ? f[1] : v ? "Every " + v + " days" : "The app decides how often"; }
  function ruleTitle(r) {
    if (r.kind === "item") return ITEMS[r.a].name;
    if (r.kind === "catloc") return r.a + " in " + r.b;
    if (r.kind === "loc") return r.b ? r.a + " (" + r.b + ")" : r.a;
    if (r.kind === "all") return "Everything";
    return r.a;
  }
  function ruleScope(r) {
    if (r.kind === "item") { var it = ITEMS[r.a]; return "Item, in " + it.loc + " (" + it.spot + "), " + it.cat; }
    return { all: "The whole kitchen", cat: "Category", loc: r.b ? "Location and spot" : "Location", catloc: "Category in a location" }[r.kind];
  }
  function ruleValue(r) {
    var p = [];
    if (r.level) p.push(levelWord(r.level));
    if (r.every) p.push(everyWord(r.every));
    return p.length ? p.join(" · ") : "Same as the broader rule";
  }
  function findRule(id, make) {
    var r = M.rules.filter(function (x) { return x.id === id; })[0];
    if (!r && make && id.indexOf("all-") === 0) { r = { id: id, who: id.slice(4), kind: "all" }; M.rules.push(r); }
    return r;
  }
  function tidyRule(r) { if (r.kind === "all" && r.level === undefined && r.every === undefined) M.rules = M.rules.filter(function (x) { return x !== r; }); }

  /* the whole-kitchen row: what applies to everything nobody has a narrower rule for. It is the old "How proactive" row, now one scope of the same model. */
  function everythingRow(scope) {
    var viewer = scope === "me" ? S.as : null, openId = scope + ":all", isOpen = S.open === openId;
    var lv = pickKey(null, "level", viewer), ev = pickKey(null, "every", viewer);
    var from = lv.from === "you" || ev.from === "you" ? "you" : lv.from === "hh" || ev.from === "hh" ? "hh" : "app";
    var why = "";
    if (scope === "me" && from === "you") { var hl = pickKey(null, "level", null); why = '<span class="pw">' + (hl.from === "hh" ? "Household" : "App") + " says " + esc(levelWord(hl.v)) + "</span>"; }
    return '<div class="prow" data-row="' + openId + '"><button type="button" class="pbtn" data-act="toggle" data-id="' + openId + '" aria-expanded="' + isOpen + '" aria-controls="ed-' + scope + '-all"><span class="pt"><span class="pl">Everything else</span><span class="pv"><b>' +
      esc(levelWord(lv.v)) + "</b> · " + esc(everyWord(ev.v)) + "</span>" + why + "</span>" + chipFor(from) + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" +
      (isOpen ? ruleEditor(findRule("all-" + (scope === "me" ? S.as : "hh")) || { id: "all-" + (scope === "me" ? S.as : "hh"), who: scope === "me" ? S.as : "hh", kind: "all" }, scope) : "") + "</div>";
  }

  function ruleRow(r, scope) {
    var openId = scope + ":rule:" + r.id, isOpen = S.open === openId;
    var mineRule = r.who !== "hh", chipHtml = chip(mineRule ? "you" : "hh", mineRule ? "You" : "Household");
    var text = '<span class="pt"><span class="pl">' + esc(ruleTitle(r)) + '</span><span class="pv"><b>' + esc(ruleValue(r)) + '</b></span><span class="pw">' + esc(ruleScope(r)) + "</span>";
    if (scope === "me" && !mineRule) {
      return '<div class="prow static household-note" data-row="' + openId + '"><div class="pbtn">' + text + '<button type="button" class="lnk" data-act="goto" data-id="hh:rule:' + r.id + '">Open in Household</button></span>' + chipHtml + "</div></div>";
    }
    return '<div class="prow" data-row="' + openId + '"><button type="button" class="pbtn" data-act="toggle" data-id="' + openId + '" aria-expanded="' + isOpen + '" aria-controls="ed-' + scope + "-" + r.id + '">' + text + "</span>" +
      chipHtml + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" + (isOpen ? ruleEditor(r, scope) : "") + "</div>";
  }

  function ruleEditor(r, scope) {
    var viewer = scope === "me" ? S.as : null, rid = r.id, out = '<div class="ped" id="ed-' + scope + "-" + (r.kind === "all" ? "all" : rid) + '">';
    if (!canWrite(scope)) return out + '<p class="small">Members who have not set their own get this.</p>' + lockNote() + "</div>"; // D28: a household value is read-only for a member who is not an admin
    var fl = ruleFallback(r, "level", viewer), fe = ruleFallback(r, "every", viewer);
    var word = function (f) { return f.from === "hh" ? "Same as household" : f.from === "you" ? "Same as your broader rule" : "Same as app default"; };
    out += '<div role="radiogroup" aria-label="Level for ' + esc(ruleTitle(r)) + '" class="plist">' +
      optionBtn("rulelevel", rid, "", word(fl) + " (" + levelWord(fl.v) + ")", r.level === undefined, ' data-scope="' + scope + '"') +
      LEVELS.map(function (l) { return optionBtn("rulelevel", rid, l[0], l[1], r.level === l[0], ' data-scope="' + scope + '"'); }).join("") + "</div>";
    out += '<label for="ev-' + scope + "-" + rid + '">How often to check</label><select id="ev-' + scope + "-" + rid + '" class="fld" data-act="ruleevery" data-id="' + rid + '" data-scope="' + scope + '"><option value=""' + (r.every === undefined ? " selected" : "") + ">" + esc(word(fe) + (fe.v ? " (" + everyWord(fe.v).toLowerCase() + ")" : "")) + "</option>" +
      EVERY.map(function (e) { return '<option value="' + e[0] + '"' + (r.every === e[0] ? " selected" : "") + ">" + esc(e[1]) + "</option>"; }).join("") + "</select>";
    if (r.kind === "all") {
      var ch = function (key, fmt) {
        var hr = findRule("all-hh"), me = scope === "me" ? findRule("all-" + S.as) : null;
        return chainLine([["App", fmt(DEFAULTS[key])], ["Household", hr && hr[key] !== undefined ? fmt(hr[key]) : null]].concat(scope === "me" ? [["You", me && me[key] !== undefined ? fmt(me[key]) : null]] : []));
      };
      out += "<p class=\"small\">Level</p>" + ch("level", levelWord) + "<p class=\"small\">How often</p>" + ch("every", function (v) { return v ? everyWord(v) : "decides per item"; });
    } else {
      out += '<button type="button" class="btn ghost danger" data-act="ruledel" data-id="' + rid + '" data-scope="' + scope + '">Remove this rule</button>';
    }
    out += '<p class="note">Quiet asks the least, helpful asks the most. A narrower rule beats a broader one, so ' + (r.kind === "item" ? "an item rule beats its category, its location and everything else." : r.kind === "all" ? "anything with a narrower rule follows that instead." : "an item inside it can still have its own rule.") + "</p>" + savedLine((scope + ":" + (r.kind === "all" ? "all" : "rule:" + rid))) + "</div>";
    return out;
  }

  var ADD_OPTIONS = [
    ["Item", [["item|milk", "Milk"], ["item|yoghurt", "Yoghurt"], ["item|chicken", "Chicken thighs"], ["item|pasta", "Pasta"]]],
    ["Category in a location", [["catloc|Dairy|Fridge", "Dairy in Fridge"], ["catloc|Proteins|Freezer", "Proteins in Freezer"], ["catloc|Dry goods|Pantry", "Dry goods in Pantry"]]],
    ["Category", [["cat|Dairy", "Dairy"], ["cat|Proteins", "Proteins"], ["cat|Dry goods", "Dry goods"]]],
    ["Location", [["loc|Fridge", "Fridge"], ["loc|Fridge|Door", "Fridge (Door)"], ["loc|Freezer", "Freezer"], ["loc|Pantry", "Pantry"]]]
  ];
  function addForm(scope) {
    var id = scope + ":add", isOpen = S.open === id;
    if (!canWrite(scope)) return "";
    var btn = '<button type="button" class="btn ghost" data-act="toggle" data-id="' + id + '" aria-expanded="' + isOpen + '">Add a rule for a place or an item</button>';
    if (!isOpen) return '<div class="prow static"><div class="pbtn">' + btn + "</div></div>";
    return '<div class="prow static"><div class="ped"><label for="add-' + scope + '">Where should it apply?</label><select id="add-' + scope + '" class="fld">' +
      ADD_OPTIONS.map(function (g) { return '<optgroup label="' + esc(g[0]) + '">' + g[1].map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("") + "</optgroup>"; }).join("") +
      '</select><div class="acts"><button type="button" class="btn" data-act="addgo" data-id="' + scope + '">Add the rule</button><button type="button" class="btn ghost" data-act="toggle" data-id="' + id + '">Cancel</button></div>' +
      '<p class="note">Then choose its level, how often, or both. Whatever you leave out comes from a broader rule, then the app.</p></div></div>';
  }

  /* "What applies to an item": the worked example, live. It shows which scope each part came from. */
  function probeRow() {
    var id = "me:probe", isOpen = S.open === id, it = ITEMS[S.probe], viewer = S.as;
    var head = '<button type="button" class="pbtn" data-act="toggle" data-id="' + id + '" aria-expanded="' + isOpen + '" aria-controls="ed-me-probe"><span class="pt"><span class="pl">What applies to an item</span><span class="pv">Pick one to see which rule wins</span></span><span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>";
    if (!isOpen) return '<div class="prow" data-row="' + id + '">' + head + "</div>";
    var lv = pickKey(it, "level", viewer), ev = pickKey(it, "every", viewer);
    var src = function (k) { return k.rule ? (k.from === "you" ? "Your " : "Household ") + "rule for " + ruleTitle(k.rule).toLowerCase() : k.from === "app" ? "The app's own" : ""; };
    return '<div class="prow" data-row="' + id + '">' + head + '<div class="ped" id="ed-me-probe"><label for="probe">Item</label><select id="probe" class="fld" data-act="probe">' +
      Object.keys(ITEMS).map(function (k) { return '<option value="' + k + '"' + (S.probe === k ? " selected" : "") + ">" + esc(ITEMS[k].name) + "</option>"; }).join("") + "</select>" +
      '<dl class="facts"><div><dt>Where</dt><dd>' + esc(it.loc + " (" + it.spot + "), " + it.cat) + "</dd></div>" +
      "<div><dt>Level</dt><dd><span>" + esc(levelWord(lv.v)) + "</span>" + chipFor(lv.from) + "</dd></div>" +
      "<div><dt>How often</dt><dd><span>" + esc(everyWord(ev.v)) + "</span>" + chipFor(ev.from) + "</dd></div></dl>" +
      '<p class="note">Level: ' + esc(src(lv)) + ". How often: " + esc(src(ev)) + "." + (lv.tie || ev.tie ? " A category and a location disagree here, and which one wins is not decided yet." : "") + "</p></div></div>";
  }

  function ruleSub(title, line) { // a heading line inside the card
    return '<div class="prow static grp"><div class="pbtn"><span class="pt"><span class="fs">' + esc(title) + "</span>" + (line ? '<span class="pw">' + esc(line) + "</span>" : "") + "</span></div></div>";
  }
  function rulesBlock(scope) {
    var viewer = scope === "me" ? S.as : null;
    var rs = visibleRules(viewer).filter(function (r) { return r.kind !== "all"; }).sort(function (a, b) { return cmpW(weight(b), weight(a)); });
    return ruleSub("Level and how often, by place", "The most specific place wins: an item, then a category in a location, then a category or a location, then everything else.") +
      rs.map(function (r) { return ruleRow(r, scope); }).join("") + everythingRow(scope) + addForm(scope) + (scope === "me" ? probeRow() : "");
  }

  /* ---------- notes ---------- */
  function noteRow(scope) {
    var text = scope === "me" ? mine().note : M.hh.note, id = scope + ":note", isOpen = S.open === id;
    var label = scope === "me" ? "Your note" : "Household note";
    var empty = text === "";
    var preview = empty ? '<span class="pv">' + "Add a note" + "</span>" : '<span class="pv clamp">' + esc(text) + "</span>";
    var chipHtml = scope === "me" ? chip("you", "You") : chip("hh", "Household");
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
  function sameWords(a, b) { return String(a).toLowerCase().replace(/\s+/g, " ").trim() === String(b).toLowerCase().replace(/\s+/g, " ").trim(); }
  function overrideOf(c) { // the signed-in person's own substitution that comes before this household one (the person over the household)
    if (c.rule !== "substitute" || c.owner !== null) return null;
    return M.food.filter(function (x) { return x.rule === "substitute" && x.owner === S.as && sameWords(x.subject, c.subject); })[0] || null;
  }
  function overridesHousehold(c) { // this person's substitution has a household one for the same ingredient underneath it
    return c.rule === "substitute" && c.owner !== null && M.food.some(function (x) { return x.rule === "substitute" && x.owner === null && sameWords(x.subject, c.subject); });
  }
  function orWords(list) { return list.join(" or "); }
  function subThen(c) { return c.instruction ? c.instruction : "Swap in " + orWords(c.swap); }
  function foodDetail(c, scope) {
    var parts = [];
    if (c.rule === "substitute") {
      parts.push(subThen(c));
      if (c.why) parts.push(c.why);
      if (scope === "me" && overrideOf(c)) parts.push("Not used for you, yours comes first");
      return parts.join(" · ");
    }
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
  function foodSub(c, scope) { // what the rule says, then where it stands against the other tier. Applying it never edits a recipe (Recipe's recipes are immutable).
    if (c.rule !== "substitute") return "";
    var out = '<dl class="facts"><div><dt>When a recipe has</dt><dd>' + esc(c.subject) + "</dd></div><div><dt>" + (c.instruction ? "Do this" : "Swap in") + "</dt><dd>" + esc(c.instruction ? c.instruction : orWords(c.swap)) + "</dd></div>" + (c.why ? "<div><dt>Why</dt><dd>" + esc(c.why) + "</dd></div>" : "") + "</dl>";
    out += '<p class="note">Your assistant uses it when it plans or shows a recipe, and the shopping list follows. The recipe itself is never changed.</p>';
    if (c.owner !== null && overridesHousehold(c)) out += '<p class="note">Used for you instead of the household\'s rule for ' + esc(c.subject) + ". It stays as it is for everyone else.</p>";
    else if (c.owner === null && scope === "me" && overrideOf(c)) out += '<p class="note">Not used for you, because you have your own rule for ' + esc(c.subject) + ". It still applies to everyone else.</p>";
    else if (c.owner === null && scope === "me") out += '<p class="note">To have something different for you, tell your assistant it is for you. Yours then comes first for you only.</p>';
    return out;
  }
  function foodEnd(c, id) {
    if (c.rule === "substitute") return '<p class="note">A substitution has no end date. It stands until someone changes or removes it.</p>';
    if (c.rule === "avoid") return '<p class="note">An avoid has no end. It stays, and a like never outweighs it, until you stop remembering it.</p>';
    if (c.rule !== "like" && c.rule !== "dislike") return "";
    if (!c.ends) return '<p class="note">No end, so it stands until you stop it. To give it a time, tell your assistant, for example “for the next two weeks”.</p>';
    return '<p class="note">Ends on its own after ' + dayText(c.ends) + ", then goes back to neutral. That time came from what you said.</p>" +
      '<button type="button" class="btn ghost" data-act="clearend" data-id="' + id + '">Keep it for good</button>';
  }
  function foodRow(c, scope) {
    var id = scope + ":" + c.id, isOpen = S.open === id;
    var chipHtml = c.owner === null ? chip("hh", "Everyone") : chip("you", "Just you");
    var detail = foodDetail(c, scope);
    var confirm = S.confirm === id;
    var locked = c.owner === null && !isAdmin(); // D28: a household claim or rule is read-only for a member who is not an admin
    var ed = "";
    if (isOpen && locked) {
      ed = '<div class="ped" id="ed-' + id.replace(":", "-") + '"><p class="small">Said: <q>' + esc(c.said) + '</q></p>' +
        (c.rule === "cap" ? '<p class="note">At most ' + capText(c.max) + ", checked against the last seven days of meals.</p>" : "") +
        (c.level === "category" && c.recipes.length ? '<span class="lbl">Recipes in ' + esc(c.subject) + '</span><ul class="stops" aria-label="Attached recipes">' + c.recipes.map(function (r) { return '<li><span class="sname">' + esc(recipeTitle(r)) + "</span></li>"; }).join("") + "</ul>" : "") +
        foodSub(c, scope) + (c.rule === "substitute" ? foodEnd(c, id) : "") + lockNote() + "</div>";
    } else if (isOpen) {
      var strict = c.rule === "avoid" && c.reason !== "other";
      ed = '<div class="ped" id="ed-' + id.replace(":", "-") + '"><p class="small">Said: <q>' + esc(c.said) + '</q> <span class="muted">(kept as data, said ' + c.support + (c.support === 1 ? " time" : " times") + ")</span></p>" +
        (c.rule === "cap" ? '<label for="mx-' + scope + "-" + c.id + '">Most per week</label><input id="mx-' + scope + "-" + c.id + '" class="fld" type="number" min="1" max="7" step="1" inputmode="numeric" data-act="cap" data-id="' + id + '" value="' + c.max + '"><p class="note">Checked against the meals planned and cooked in the last seven days, before a recipe here is suggested.</p>' : "") +
        foodSub(c, scope) + foodEnd(c, id) + (c.level === "category" ? foodSuggest(c, id) + foodRecipes(c, id) : "") + savedLine(id) +
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
        (scope === "me" ? "Tell your assistant what you like, dislike, cannot eat, want less often or want swapped for something else, and it shows up here." : isAdmin() ? "Allergies and house rules for everyone go here. Tell your assistant, and say it is for the household." : "Allergies and house rules for everyone go here. Only household admins can add them.") + "</p></div>";
    }
    var out = "";
    RULE_ORDER.forEach(function (st) {
      var g = rows.filter(function (c) { return c.rule === st; });
      if (g.length) out += g.map(function (c) { return foodRow(c, scope); }).join("");
    });
    var ended = scope === "me" ? endedFood() : [];
    var noSubs = rows.some(function (c) { return c.rule === "substitute"; }) ? "" : '<p class="note">No substitutions ' + (scope === "me" ? "yet" : "for the whole kitchen yet") + ". Tell your assistant, for example: “whenever a recipe has white bread, use sourdough” or “frozen food always needs blanching first”.</p>";
    return '<ul class="flist">' + out + "</ul>" + noSubs + (ended.length ? '<p class="note">Ended on its own and back to neutral: ' + ended.map(function (c) { return esc(c.subject) + " (" + dayText(c.ends) + ")"; }).join(", ") + ".</p>" : "");
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

  /* The switched-off list is the existing per-item "stop asking" control (stock_stops), now part of the same group as the checks (D17). */
  function stopsList() {
    var st = mine().stops;
    var body = !st.length ? '<p class="note">Nothing is switched off. Use Stop asking on a check, or tell the assistant.</p>' : '<ul class="stops" aria-label="Switched off">' + st.map(function (x) {
      return '<li><span class="sname">' + esc(x.name) + '<span class="swhat">' + esc(x.what) + '</span></span><button type="button" class="btn" data-act="askagain" data-id="' + x.id + '" aria-label="Ask again about ' + esc(x.name) + '">Ask again</button></li>';
    }).join("") + "</ul>";
    return ruleSub("Switched off", "Things you told Kitchie to stop asking about. A switch-off always wins over a rule above.") + body;
  }

  function mineScreen() {
    return '<div role="tabpanel" id="panel-mine" aria-labelledby="tab-mine" class="mbody2">' +
      '<p>What you have chosen for yourself, and where everything else comes from.</p>' +
      '<p class="legend small"><span class="lg">' + chip("you", "You") + " you chose it</span><span class=\"lg\">" + chip("hh", "Household") + " the kitchen's value, as you have not chosen</span><span class=\"lg\">" + chip("app", "App") + " nobody has, so Kitchie's own</span></p>" +
      '<span class="lbl">Stock level checks</span><div class="card sgroup">' + ROWS.map(function (r) { return dialRow(r, "me"); }).join("") + rulesBlock("me") + stopsList() + "</div>" +
      '<p class="small">Stock level checks ask whether the level Kitchie has recorded is still right. They are not about how much you have.</p>' +
      '<span class="lbl">Notes</span><div class="card sgroup notescard">' + noteRow("me") +
      '<div class="prow static household-note"><div class="pbtn"><span class="pt"><span class="pl">Household note</span>' + (M.hh.note ? '<span class="pv clamp">' + esc(M.hh.note) + "</span>" : '<span class="pv">Nobody has written one</span>') + "</span>" + chipGo("hh", "Household", "hh:note", "Household note, open it in the Household tab") + "</div></div>" +
      '<p class="note">Both notes are read. Neither replaces the other.</p></div>' +
      '<span class="lbl">Food</span><div class="card sgroup foodcard">' + foodList("me") +
      '<p class="note">Your statements and the household\'s are added together, not swapped. Say new ones, or a new category, to your assistant. The household\'s can be changed by household admins only.</p></div>' +
      '</div>';
  }

  function householdScreen() {
    var only = M.only;
    var head = isAdmin() ? '<p class="note">' + (roleOf(S.as) === "founder" ? "You are the founding member, so you are an admin." : "You are a household admin.") + " Admins can change these. Other members can only look.</p>"
      : '<p class="note ro">' + ICON.lock + "<span>" + ADMIN_WHY + " You can still change everything on Mine.</span></p>";
    return '<div role="tabpanel" id="panel-hh" aria-labelledby="tab-hh" class="mbody2">' +
      '<p>Shared by everyone in ' + esc(only.name) + ". Used for anyone who has not chosen their own.</p>" + head +
      '<span class="lbl">Stock level check defaults</span><div class="card sgroup">' + ROWS.map(function (r) { return dialRow(r, "hh"); }).join("") + rulesBlock("hh") + "</div>" +
      '<span class="lbl">Household note</span><div class="card sgroup notescard">' + noteRow("hh") + '<p class="note">Everyone\'s assistant reads this next to their own note. It does not replace theirs.</p></div>' +
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
    var KIND = { founder: "you", admin: "hh", member: "app" };
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

  /* ---------- the profile, where Kitchen role and the assistant went (D24) ----------
     Kitchie today keeps "My assistant" as a free choice (stock_prefs key assistant) that does not depend on what is linked. The link itself is made on platform (oauth_grants, one per client).
     Here the assistant comes from what is linked: one linked is used at once with no picker; two or more need a default. Kitchen role is a free label the person edits. */
  function profileDemo() {
    var host = document.getElementById("profile-demo");
    if (!host) return;
    var linked = M.linked[S.as], dflt = M.defaultAssistant[S.as], m = mine();
    var nameOf = function (id) { return ASSISTANTS.filter(function (x) { return x[0] === id; })[0][1]; };
    var rows = linked.map(function (id) {
      return '<li><span class="sname">' + esc(nameOf(id)) + '<span class="swhat">' + (linked.length > 1 && dflt === id ? "Linked through sign-in. Your default" : "Linked through sign-in") + '</span></span><button type="button" class="btn" data-act="pnav" data-id="Disconnect ' + esc(nameOf(id)) + '" aria-label="Disconnect ' + esc(nameOf(id)) + '">Disconnect</button></li>';
    }).join("");
    var body;
    if (!linked.length) body = '<p class="note">No assistant is linked yet. Link one and it is used automatically.</p><button type="button" class="btn" data-act="pnav" data-id="Link your assistant">Link your assistant</button>';
    else if (linked.length === 1) body = '<ul class="stops" aria-label="Linked assistants">' + rows + '</ul><p class="note">' + esc(nameOf(linked[0])) + " is the only one linked, so it is used automatically. There is nothing to pick.</p>";
    else body = '<ul class="stops" aria-label="Linked assistants">' + rows + '</ul><p class="pl">Default assistant</p><div role="radiogroup" aria-label="Default assistant" class="plist">' + linked.map(function (id) { return optionBtn("pdefault", "pf", id, nameOf(id) + (dflt === id ? ", my default" : ""), dflt === id); }).join("") + "</div>" +
      (dflt ? '<p class="note">The plan button opens ' + esc(nameOf(dflt)) + ".</p>" : '<div class="note ro" role="status">' + ICON.spark + "<div>More than one is linked, so choose a default. The plan button opens it.</div></div>");
    host.innerHTML = '<div class="sp"><div class="mtop"><span style="width:64px" aria-hidden="true"></span><h3 class="ttl">Me</h3><span style="width:64px" aria-hidden="true"></span></div><div class="mbody">' +
      (S.pfmsg ? '<div class="banner" role="status">' + esc(S.pfmsg) + "</div>" : "") +
      '<span class="lbl">Kitchen</span><div class="card sgroup"><button type="button" class="pbtn" data-act="pnav" data-id="Kitchen role"><span class="pt"><span class="pl">Kitchen role</span><span class="pv"><b>' + esc(m.role || "Pick a kitchen role") + '</b></span><span class="pw">A label for you. You can change it any time.</span></span><span class="chev" aria-hidden="true">' + ICON.chev + "</span></button></div>" +
      '<span class="lbl">AI assistants</span><div class="card sgroup"><div class="ped">' + body + (linked.length ? '<button type="button" class="btn ghost" data-act="pnav" data-id="Reset and relink">Reset and link again</button>' : "") + "</div></div></div></div>";
  }

  function render() {
    var keepScroll = window.scrollY;
    var flash = S.flash ? '<div class="banner" role="status">' + esc(S.flash) + "</div>" : "";
    if (S.view === "members") { root.innerHTML = membersScreen(flash); window.scrollTo(0, keepScroll); syncControls(); if (S.focus) { var fe = root.querySelector(S.focus); if (fe) fe.focus({ preventScroll: true }); S.focus = null; } return; }
    root.innerHTML = '<div class="sp">' + (INWIN ? "" : '<div class="mtop"><a class="back" href="#" data-act="nav" data-id="Settings">&lsaquo; Settings</a><h1 class="ttl">Preferences</h1><span style="width:64px" aria-hidden="true"></span></div>') +
      '<main class="mbody">' + flash + seg() + (S.tab === "mine" ? mineScreen() : householdScreen()) + "</main></div>";
    var cur = document.activeElement;
    window.scrollTo(0, keepScroll);
    syncControls();
    profileDemo();
    if (S.focus) { var el = root.querySelector(S.focus); if (el) el.focus({ preventScroll: true }); S.focus = null; }
    void cur;
  }

  function syncControls() {
    document.querySelectorAll("[data-pc]").forEach(function (b) {
      var k = b.getAttribute("data-pc"), v = b.getAttribute("data-v");
      b.setAttribute("aria-pressed", String(S[k] === v));
    });
    var st = document.getElementById("mh-state");
    if (st) st.textContent = who().name + " (" + ROLE_WORD[roleOf(S.as)].toLowerCase() + ") · " + (S.view === "members" ? "Members and admins" : S.tab === "mine" ? "Mine" : "Household") + " · " + (S.data === "empty" ? "nothing set yet" : S.data === "nosubs" ? "some set, no substitutions" : "some set");
  }

  /* ---------- actions ---------- */
  function saved(id) { S.saved = id; }
  function setDial(scope, key, val) {
    var d = scope === "me" ? mine().dials : M.hh.dials;
    if (val === "" || val === null) delete d[key]; else d[key] = val;
  }
  function foodById(id) { return M.food.filter(function (x) { return x.id === id.split(":")[1]; })[0]; }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-act]");
    if (!t || !root.contains(t) && !t.closest(".mh-jump") && !t.closest("#profile-demo")) return;
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
      if (row === "quiet") { // three states: same as the level below, hours of its own (starting from what is in force), or None (a person's own, D19)
        var base = p[0] === "me" ? hhQuiet() : appQuiet();
        setDial(p[0], "quiet_start", val === "own" ? base.start || DEFAULTS.quiet_start : ""); setDial(p[0], "quiet_end", val === "own" ? base.end || DEFAULTS.quiet_end : "");
        setDial(p[0], "quiet_off", val === "off" ? "1" : "");
      }
      else if (row === "daily_cap" && val === "own") setDial(p[0], row, p[0] === "me" ? householdValue(row).v : DEFAULTS[row]);
      else setDial(p[0], row, val);
      saved(id); S.focus = '[data-act="pick"][data-id="' + id + '"][data-val="' + val + '"]'; render();
    }
    else if (act === "rulelevel") {
      var rl = findRule(id, true), sc = t.getAttribute("data-scope");
      if (!canWrite(sc)) return;
      if (val === "") delete rl.level; else rl.level = val;
      tidyRule(rl); saved(sc + ":" + (rl.kind === "all" ? "all" : "rule:" + id)); S.focus = '[data-act="rulelevel"][data-id="' + id + '"][data-val="' + val + '"]'; render();
    }
    else if (act === "ruledel") { if (!canWrite(t.getAttribute("data-scope"))) return; M.rules = M.rules.filter(function (x) { return x.id !== id; }); S.open = null; S.saved = ""; S.focus = null; render(); }
    else if (act === "addgo") {
      if (!canWrite(id)) return;
      var pv = root.querySelector("#add-" + id).value.split("|"), who = id === "me" ? S.as : "hh";
      var ex = M.rules.filter(function (x) { return x.who === who && x.kind === pv[0] && x.a === pv[1] && x.b === pv[2]; })[0];
      if (!ex) { ex = { id: "ru" + Date.now() % 100000, who: who, kind: pv[0], a: pv[1], b: pv[2] }; M.rules.push(ex); }
      S.open = id + ":rule:" + ex.id; S.saved = ""; S.focus = '[data-act="toggle"][data-id="' + S.open + '"]'; render();
      var nr = root.querySelector('[data-row="' + S.open + '"]'); if (nr) nr.scrollIntoView({ block: "center" });
    }
    else if (act === "pdefault") { M.defaultAssistant[S.as] = val; S.pfmsg = ""; S.focus = '#profile-demo [data-act="pdefault"][data-val="' + val + '"]'; render(); }
    else if (act === "pnav") { S.pfmsg = "Opens " + id + ". Not drawn in this option."; render(); }
    else if (act === "goto") { var g = id.split(":"), rest = id.slice(id.indexOf(":") + 1); S.tab = g[0]; S.open = g[1] === "recipes" ? null : g[0] + ":" + rest; S.saved = ""; S.flash = ""; render(); var target = root.querySelector(g[1] === "recipes" ? "#hh-recipes" : '[data-row="' + g[0] + ":" + rest + '"]'); if (target) { target.scrollIntoView({ block: "center" }); } }
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
      if (t.value) d[t.getAttribute("data-end") === "start" ? "quiet_start" : "quiet_end"] = t.value; // both ends always stay set; an emptied box keeps the old time
      saved(id); S.focus = "#" + t.id; render();
    } else if (act === "field") {
      var q = id.split(":"), key = q[1], n = parseInt(t.value, 10);
      if (!canWrite(q[0])) return;
      if (key === "daily_cap" && isFinite(n) && n >= 1 && n <= 20) setDial(q[0], key, String(n)); // 1 to 20 (D7); anything else is ignored and the old number stays
      saved(id); S.focus = "#" + t.id; render();
    } else if (act === "ruleevery") {
      var re = findRule(id, true), sc2 = t.getAttribute("data-scope");
      if (!canWrite(sc2)) return;
      if (t.value === "") delete re.every; else re.every = t.value;
      tidyRule(re); saved(sc2 + ":" + (re.kind === "all" ? "all" : "rule:" + id)); S.focus = "#" + t.id; render();
    } else if (act === "probe") { S.probe = t.value; S.focus = "#probe"; render(); }
    else if (act === "cap") {
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
    if (data && data !== S.data && (data === "typical" || data === "empty" || data === "nosubs")) { S.data = data; var kept = M.members; M = seed(data); M.members = kept; }
    S.view = view === "members" ? "members" : null;
    if (tab === "mine" || tab === "hh") S.tab = tab;
    S.open = open || null; S.saved = ""; S.flash = ""; S.confirm = null;
    render();
    if (open) { var el = root.querySelector('[data-row="' + open + '"]'); if (el) el.scrollIntoView({ block: "center" }); }
    var to = q.get("to"); if (to) { var te = document.getElementById(to); if (te) te.scrollIntoView({ block: "start" }); }
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
