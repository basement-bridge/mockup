/* Preferences, option C: a household member proposes a preference ON BEHALF OF another member.
   Mockup only: sample people, sample values and the little state machine live here, never in the stylesheet (AGENTS.md "Mockup and build stay close").
   The shape is the owner's (voice, 10 October 2026), recorded in docs/knowledge/user-preferences/option-c-propose-for-another-member.md:
   - Any member can write a food statement for another member ("Sam avoids peanuts").
   - It is written DIRECTLY on that member's own personal list (owner = Sam), tagged "proposed by", pending Sam's acknowledgment. Never on the household list.
   - It takes effect IMMEDIATELY (planning and recipe building use it at once).
   - Sam gets a courtesy notice at the next login and can accept as is, edit, or reject. Not an approval gate.
   Household-level values: D5 and D8 (any member edits) are SUPERSEDED by the household admin role (D25 to D30): only admins change them (D28); proposing for another member is not gated (D29, D9).
   Locked by the owner (voice, 10 October 2026, D5 to D14 in the notes): any member may propose for another member (D9); a later reject or edit never changes a meal already planned (D10);
   the proposer is NEVER told what the subject decided (D11, so there is no outcome line or event list here); a pending proposal never expires or escalates (D12); the subject sees nothing of it
   before the next-login notice (D13, so the subject never appears in the "Added for housemates" lines, and no badge or preview is drawn elsewhere); while pending it is fully reliable and in use at once (D14).
   Everything that the owner did not say is a reading, marked READING below and listed as an open question in the notes.
   Field names in claims follow the model they would need: owner (member_id), proposed_by, ack_state (pending, accepted, edited; a rejected record is retired).
   Nothing here is viewport specific: the wide layout lives in option-c-600.css and option-c-1024.css. */
(function () {
  "use strict";

  /* ---------- the model's own vocabulary (Kitchie context.ts) ---------- */
  var STATEMENT_WORD = { avoids: "Avoids", stop: "Never suggest", usually: "Usually", likes: "Likes", dislikes: "Dislikes" };
  var STATEMENT_ORDER = ["avoids", "stop", "usually", "likes", "dislikes"];
  var PROPOSABLE = ["avoids", "dislikes", "likes", "usually"]; // READING: "never suggest" and "fact" are not proposed for someone else
  var SEVERITY = [["hard", "None at all"], ["soft", "Fine as a minor ingredient"], ["", "Not sure"]];
  var REASON = [["safety", "Safety (allergy, intolerance, medical)"], ["other", "Another reason"], ["", "Not sure"]];

  var PEOPLE = { sam: { name: "Sam" }, arjan: { name: "Arjan" }, jo: { name: "Jo" } };
  var ORDER = ["arjan", "sam", "jo"];
  /* D25 to D28: household-level values (the Household tab, and the household's rows on Mine) are changed by household admins only. Arjan is the founding member, Jo an admin, Sam a member (same household as option B).
     A proposal for another member is written on that member's own record and is not gated by role (D29, D9). */
  var HH_ROLE = { arjan: "founder", jo: "admin", sam: "member" };
  function isAdmin(id) { return HH_ROLE[id] === "founder" || HH_ROLE[id] === "admin"; }
  function lockNote() { return '<p class="note ro">' + ICON.lock + "<span>" + ADMIN_WHY + "</span></p>"; }
  var ADMIN_WHY = "Only household admins can change this.";
  var ROLE = { arjan: "Arjan, who proposes", sam: "Sam, the person it is about", jo: "Jo, another member" };

  /* ---------- sample data (mockup only) ---------- */
  var seq = 100;
  function seed(kind) {
    var full = kind !== "empty";
    return {
      claims: full ? [
        { id: "c2", owner: null, statement: "stop", subject: "liver", said: "Never suggest liver, nobody eats it.", support: 1 },
        { id: "c3", owner: null, statement: "usually", subject: "pancakes", when: "weekend", said: "We usually do pancakes at the weekend.", support: 2 },
        /* Sam's own list: one he said himself, one proposed and since edited, one proposed and kept, two proposed and waiting */
        { id: "c5", owner: "sam", statement: "likes", subject: "spicy noodles", said: "I love spicy noodles.", support: 2 },
        { id: "c4", owner: "sam", statement: "avoids", subject: "coriander", severity: "soft", reason: "other", said: "I do not like coriander, fine if it is a garnish.", support: 1, proposed_by: "jo", ack_state: "edited", ack_when: "Tue 6 Oct" },
        { id: "a1", owner: "sam", statement: "avoids", subject: "shellfish", severity: "hard", reason: "safety", said: "Sam cannot have shellfish.", support: 1, proposed_by: "arjan", ack_state: "accepted", ack_when: "Sat 3 Oct" },
        { id: "p1", owner: "sam", statement: "avoids", subject: "peanuts", severity: "hard", reason: "safety", said: "Sam avoids peanuts.", support: 1, proposed_by: "arjan", ack_state: "pending", at: "Today, 4:40 pm" },
        { id: "p2", owner: "sam", statement: "dislikes", subject: "olives", said: "Sam is not keen on olives.", support: 1, proposed_by: "jo", ack_state: "pending", at: "Today, 5:05 pm" },
        { id: "c7", owner: "arjan", statement: "likes", subject: "roast chicken", said: "Roast chicken is my favourite.", support: 1 }
      ] : []
    };
  }

  /* ---------- state ---------- */
  var S = { as: "sam", tab: "mine", screen: "main", data: "typical", open: null, flash: "", confirm: null, confirmEdit: false, target: null, noticeGone: false, draft: null, last: null, focus: null };
  var M = seed(S.data);
  var root = document.getElementById("app");

  /* 11 Oct 2026 (owner): on desktop Preferences is a section of the Settings window, right after Settings, and opens inside it (the /settings/preferences address too); no separate full-page layout.
     At 1024px and wider this page draws that window around the screen (KProfile.inline, fragments/desktop-profile). Phone and tablet keep Settings > Kitchen > Preferences. Chosen at load. */
  var INWIN = !!(window.KProfile && window.KProfile.inline && window.matchMedia("(min-width:1024px)").matches);
  if (INWIN) {
    document.documentElement.classList.add("oc-win");
    var host = root.closest(".oc-frame");
    if (host) { host.classList.add("oc-winhost"); var pane = window.KProfile.inline(host, "preferences"); pane.classList.add("pf-flush"); pane.appendChild(root); }
  }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function name(id) { return PEOPLE[id].name; }
  function nameOr(id, viewer) { return id === viewer ? "you" : name(id); }
  function claim(id) { return M.claims.filter(function (c) { return c.id === id; })[0]; }
  function others() { return ORDER.filter(function (p) { return p !== S.as; }); }
  function pendingAbout(owner) { return M.claims.filter(function (c) { return c.owner === owner && c.ack_state === "pending"; }); }
  function isStrictSafety(c) { return c.statement === "avoids" && c.reason !== "other"; } // model: unspecified reason is treated as safety
  function keyOf(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

  var ICON = {
    chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/></svg>',
    bin: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/></svg>',
    person: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/></svg>',
    warn: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.1"/></svg>',
    leaf: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 38C8 22 18 10 38 9c1 20-9 30-26 29z"/><path d="M10 38c6-8 12-14 20-19"/></svg>',
    pot: '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21h30v13a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6z"/><path d="M5 21h38M30 7l-6 14M16 9c0 3 3 3 3 6"/></svg>'
  };

  function chip(kind, text) { return '<span class="src ' + kind + '">' + esc(text) + "</span>"; }
  function av(id) { return '<span class="av" aria-hidden="true">' + esc(name(id).charAt(0)) + "</span>"; }

  /* ---------- wording for a record ---------- */
  function foodDetail(c) {
    if (c.statement === "avoids") {
      var sev = c.severity === "hard" ? "none at all" : c.severity === "soft" ? "fine as a minor ingredient" : "treated as none at all until said";
      var why = c.reason === "safety" ? "for safety" : c.reason === "other" ? "not for safety" : "treated as safety until said";
      return cap(why) + ", " + sev;
    }
    if (c.when) return "At the " + c.when;
    return "";
  }
  /* The attribution line under a proposed record, from the point of view of whoever is looking. */
  function attribution(c, viewer) {
    if (!c.proposed_by) return "";
    var by = nameOr(c.proposed_by, viewer), who = name(c.owner);
    if (c.ack_state === "pending") {
      return viewer === c.owner
        ? "Proposed by " + by + " · " + c.at + ". In use now."
        : "Proposed by " + by + " · " + c.at + ". In use now. " + who + " has not answered.";
    }
    var did = c.ack_state === "accepted" ? "kept it" : "changed it";
    return "Proposed by " + by + ". " + cap(nameOr(c.owner, viewer)) + " " + did + ", " + c.ack_when + ".";
  }

  /* ---------- the food list ---------- */
  function visibleFood(viewer) { // own (including what others proposed for you) plus Everyone; nobody else's (Kitchie: another member's are never read)
    return M.claims.filter(function (c) { return c.owner === null || c.owner === viewer; });
  }
  function foodRow(c, viewer) {
    var id = "f:" + c.id, isOpen = S.open === id;
    var pend = c.ack_state === "pending";
    var chipHtml = c.owner === null ? chip("hh", "Everyone") : pend ? chip("wait", "Waiting for you") : chip("you", "Just you");
    var detail = foodDetail(c), attr = attribution(c, viewer);
    var ed = "";
    if (isOpen) {
      if (pend) {
        ed = '<div class="ped" id="ed-' + c.id + '"><p class="small">Said: <q>' + esc(c.said) + '</q></p>' +
          '<p class="note">This is already in use. Recipes and plans leave it out' + (c.statement === "avoids" ? "" : " or take it into account") + ' while you decide.</p>' +
          '<button type="button" class="btn" data-act="go" data-id="review">Keep, change or remove it</button></div>';
      } else if (c.owner === null && !isAdmin(viewer)) { // D28: a household rule is read-only for a member who is not an admin
        ed = '<div class="ped" id="ed-' + c.id + '"><p class="small">Said: <q>' + esc(c.said) + '</q></p>' + lockNote() + "</div>";
      } else {
        ed = '<div class="ped" id="ed-' + c.id + '"><p class="small">Said: <q>' + esc(c.said) + '</q></p>' +
          (c.proposed_by ? '<p class="note">It started as ' + esc(name(c.proposed_by)) + '\'s suggestion and is now yours. The note stays so you can see where it came from.</p>' : "") +
          '<button type="button" class="btn ghost danger" data-act="forget" data-id="' + c.id + '">Stop remembering this</button>' +
          '<p class="note">To change it instead, tell your assistant.</p></div>';
      }
    }
    return '<li class="frow prow" data-row="' + id + '"><button type="button" class="pbtn" data-act="toggle" data-id="' + id + '" aria-expanded="' + isOpen + '"><span class="pt"><span class="fs">' + STATEMENT_WORD[c.statement] + '</span><span class="pl">' + esc(c.subject) + "</span>" +
      (detail ? '<span class="pv">' + esc(detail) + "</span>" : "") + (attr ? '<span class="pw">' + esc(attr) + "</span>" : "") + "</span>" + chipHtml + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>" + ed + "</li>";
  }
  function foodList(viewer, scope) {
    var rows = visibleFood(viewer).filter(function (c) { return scope === "hh" ? c.owner === null : true; });
    if (!rows.length) {
      return '<div class="empty">' + ICON.pot + "<b>" + (scope === "hh" ? "Nothing for the whole kitchen yet" : "Nothing remembered about you yet") + "</b><p class=\"small\">" +
        (scope === "hh" ? (isAdmin(viewer) ? "Allergies and house rules for everyone go here. Tell your assistant, and say it is for the household." : "Allergies and house rules for everyone go here. Only household admins can add them.") : "Tell your assistant what you like, dislike or cannot eat, and it shows up here. A housemate can also add something for you.") + "</p></div>";
    }
    var out = "";
    var waiting = rows.filter(function (c) { return c.ack_state === "pending"; });
    if (waiting.length) out += waiting.map(function (c) { return foodRow(c, viewer); }).join("");
    STATEMENT_ORDER.forEach(function (st) {
      rows.filter(function (c) { return c.statement === st && c.ack_state !== "pending"; }).forEach(function (c) { out += foodRow(c, viewer); });
    });
    return '<ul class="flist">' + out + "</ul>";
  }

  /* ---------- "added for housemates": what the proposer sees, and what other members see ---------- */
  function housemateCard(viewer) {
    var mine = M.claims.filter(function (c) { return c.proposed_by === viewer && c.owner !== viewer && c.ack_state === "pending"; });
    /* D13: the subject never gets a line about their own pending record (c.owner !== viewer), so nothing of it shows before their next-login notice. */
    var theirs = M.claims.filter(function (c) { return c.proposed_by && c.proposed_by !== viewer && c.owner !== viewer && c.ack_state === "pending"; });
    var out = "";
    mine.forEach(function (c) {
      out += '<div class="followup" data-row="mine:' + c.id + '"><span class="pt"><span class="fs">' + STATEMENT_WORD[c.statement] + " · for " + esc(name(c.owner)) + '</span><span class="pl">' + esc(c.subject) + '</span><span class="pw">Added ' + esc(c.at.toLowerCase()) + ". In use now. " + esc(name(c.owner)) + ' has not answered.</span><span class="rowlink">' + chip("wait", "Waiting for " + name(c.owner)) + '</span></span>' +
        '<button type="button" class="btn" data-act="takeback" data-id="' + c.id + '" aria-label="Take back ' + esc(c.subject) + ' from ' + esc(name(c.owner)) + '">Take back</button></div>';
    });
    theirs.forEach(function (c) {
      out += '<div class="followup" data-row="their:' + c.id + '"><span class="pt"><span class="fs">' + STATEMENT_WORD[c.statement] + " · for " + esc(name(c.owner)) + '</span><span class="pl">' + esc(c.subject) + '</span><span class="pw">Added by ' + esc(name(c.proposed_by)) + " " + esc(c.at.toLowerCase()) + ". In use now. Read only for you.</span><span class=\"rowlink\">" + chip("wait", "Waiting for " + name(c.owner)) + "</span></span></div>";
    });
    if (!out) out = '<p class="note">Nothing waiting. What you add for a housemate, and what others add, is listed here until it has been dealt with. You are not told what they decide.</p>';
    return '<span class="lbl">Added for housemates</span><div class="card sgroup">' + out + "</div>";
  }

  function navRow(label, value, kind, text, id) {
    return '<button type="button" class="pbtn navrow" data-act="nav" data-id="' + esc(id) + '"><span class="pt"><span class="pl">' + esc(label) + '</span><span class="pv">' + esc(value) + "</span></span>" + chip(kind, text) + '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button>";
  }

  /* ---------- screens ---------- */
  function seg() {
    return '<div class="seg2 wide" role="tablist" aria-label="Whose preferences">' +
      [["mine", "Mine"], ["hh", "Household"]].map(function (t) {
        return '<button type="button" role="tab" id="tab-' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '" aria-controls="panel-' + t[0] + '" class="' + (S.tab === t[0] ? "on" : "") + '" data-act="tab" data-id="' + t[0] + '">' + t[1] + "</button>";
      }).join("") + "</div>";
  }

  /* The courtesy notice, queued until the person's next login. Dismissing it does not clear the pending flag (READING). */
  function noticeBanner(viewer) {
    var list = pendingAbout(viewer);
    if (!list.length || S.noticeGone) return "";
    var who = []; list.forEach(function (c) { if (who.indexOf(c.proposed_by) < 0) who.push(c.proposed_by); });
    var names = who.map(name).join(" and ");
    var head = list.length === 1 ? names + " added something to your food list" : names + " added " + list.length + " things to your food list";
    return '<div class="banner" role="status"><b>' + esc(head) + "</b><span class=\"small muted\">They are already in use. You decide if they stay.</span>" +
      '<div class="brow"><button type="button" class="btn" data-act="go" data-id="review">Review</button><button type="button" class="btn ghost" data-act="later">Later</button></div></div>';
  }

  function mineScreen() {
    var v = S.as, waiting = pendingAbout(v).length;
    var review = waiting
      ? navRow("Added for you", waiting + (waiting === 1 ? " thing" : " things") + " from housemates, in use now", "wait", "Waiting for you", "review")
      : navRow("Added for you", "Nothing waiting", "bi", "All clear", "review");
    return '<div role="tabpanel" id="panel-mine" aria-labelledby="tab-mine" class="mbody2">' +
      '<p>Your food list. A housemate can add something for you: it goes on this list, is used straight away, and waits for you to keep, change or remove it.</p>' +
      '<p class="legend small"><span class="lg">' + chip("you", "Just you") + " yours, said by you or kept by you</span><span class=\"lg\">" + chip("wait", "Waiting") + " added by a housemate, in use, not answered yet</span><span class=\"lg\">" + chip("hh", "Everyone") + " the whole kitchen's</span></p>" +
      '<div class="card sgroup">' + review + "</div>" +
      '<span class="lbl">Food</span><div class="card sgroup foodcard">' + foodList(v, "mine") +
      '<button type="button" class="btn ghost" data-act="go" data-id="propose" data-val="fill0">Add something for a housemate</button></div>' +
      housemateCard(v) +
      '<span class="lbl">Where it is used</span><div class="card sgroup">' + navRow("Dinner ideas", "See what planning does with these", "bi", "Live", "plan") + "</div>" +
      '<span class="lbl">Everything else</span><div class="card sgroup">' + navRow("Stock checks, notes, assistant, stops", "Exactly as in option B", "bi", "Unchanged", "Option B rows") + "</div></div>";
  }

  function householdScreen() {
    return '<div role="tabpanel" id="panel-hh" aria-labelledby="tab-hh" class="mbody2">' +
      '<p>Shared by everyone in Our kitchen.</p>' +
      '<p class="note ro">' + ICON.lock + "<span>Nothing a member adds for another member is kept here. It is written on that person's own list, so it never becomes a household rule.</span></p>" +
      (isAdmin(S.as) ? "" : '<p class="note ro">' + ICON.lock + "<span>" + ADMIN_WHY + " You can still change everything on Mine.</span></p>") +
      '<span class="lbl">Food for everyone</span><div class="card sgroup foodcard">' + foodList(S.as, "hh") + '<p class="note">' + (isAdmin(S.as) ? "Household admins can say or retire these. Same as option B." : "Only household admins can say or retire these.") + "</p></div>" +
      '<span class="lbl">Everything else</span><div class="card sgroup">' + navRow("Stock-check defaults, household note, names and places", "Exactly as in option B", "bi", "Unchanged", "Option B rows") + "</div></div>";
  }

  /* ---------- the proposer's flow ---------- */
  function radio(act, field, val, text, checked, lead) {
    return '<button type="button" class="popt" role="radio" aria-checked="' + checked + '" data-act="' + act + '" data-id="' + field + '" data-val="' + esc(val) + '"><span class="who">' + (lead || "") + "<span>" + esc(text) + '</span></span><span class="ck" aria-hidden="true"></span></button>';
  }
  function draftForm(opts) {
    var d = S.draft, out = "";
    if (opts.pickWho) {
      out += '<span class="stepno">1 &middot; Who is it about?</span><div role="radiogroup" aria-label="Who is it about" class="plist">' +
        others().map(function (p) { return radio("dset", "who", p, name(p), d.who === p, av(p)); }).join("") + "</div>";
    }
    var wn = opts.pickWho ? name(d.who) : "you";
    out += '<span class="stepno">' + (opts.pickWho ? "2" : "1") + ' &middot; What about ' + esc(wn) + '?</span><div role="radiogroup" aria-label="What about them" class="plist">' +
      PROPOSABLE.map(function (s) { return radio("dset", "statement", s, STATEMENT_WORD[s], d.statement === s); }).join("") + "</div>";
    out += '<label for="subj" class="stepno" style="margin-top:4px">' + (opts.pickWho ? "3" : "2") + ' &middot; What is it?</label><input id="subj" class="fld" type="text" autocomplete="off" maxlength="60" data-act="subject" placeholder="for example peanuts" value="' + esc(d.subject) + '">';
    if (d.statement === "avoids") {
      out += '<span class="stepno">' + (opts.pickWho ? "4" : "3") + ' &middot; How strict?</span><div role="radiogroup" aria-label="How strict" class="plist">' +
        SEVERITY.map(function (x) { return radio("dset", "severity", x[0], x[1], (d.severity || "") === x[0]); }).join("") + "</div>" +
        '<span class="stepno">' + (opts.pickWho ? "5" : "4") + ' &middot; Why?</span><div role="radiogroup" aria-label="Why" class="plist">' +
        REASON.map(function (x) { return radio("dset", "reason", x[0], x[1], (d.reason || "") === x[0]); }).join("") + "</div>" +
        '<p class="note">Not sure is fine. Kitchie then treats it as none at all and for safety until ' + (opts.pickWho ? esc(name(d.who)) + " says" : "you say") + " otherwise.</p>";
    }
    return out;
  }

  function proposeScreen() {
    var d = S.draft, who = name(d.who), subject = d.subject.trim();
    var label = "Add to " + who + "'s list now";
    return '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="go" data-id="main">&lsaquo; Preferences</a><h1 class="ttl">Add for a housemate</h1><span style="width:64px" aria-hidden="true"></span></div>' +
      '<main class="mbody">' + flashHtml() +
      '<p>Tell Kitchie something about someone else in the kitchen. It goes on their own list and is used straight away. It does not wait for their approval.</p>' +
      '<div class="card">' + draftForm({ pickWho: true }) + "</div>" +
      '<span class="lbl">What happens when you press the button</span><div class="card"><ul class="happens three">' +
      "<li>" + ICON.bolt + "<div><b>Used straight away</b><span>Recipes and plans " + (d.statement === "avoids" ? "leave out " : "take into account ") + esc(subject || "this") + " for " + esc(who) + " from now. It does not wait for " + esc(who) + " to sign in.</span></div></li>" +
      "<li>" + ICON.person + "<div><b>Written on " + esc(who) + "'s own list</b><span>It is " + esc(who) + "'s record, tagged <q>proposed by " + esc(name(S.as)) + "</q>. It is not a household rule and is not under Household.</span></div></li>" +
      "<li>" + ICON.bell + "<div><b>" + esc(who) + " is told, and has the last word</b><span>Next time " + esc(who) + " opens Kitchie, they can keep it, change it or remove it.</span></div></li></ul></div>" +
      '<button type="button" class="btn" data-act="submit">' + esc(label) + '</button>' +
      '<a class="lnk" href="#" data-act="go" data-id="main">Cancel</a></main></div>';
  }

  function doneScreen() {
    var c = S.last ? claim(S.last) : null;
    if (!c) return '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="go" data-id="main">&lsaquo; Preferences</a><h1 class="ttl">Added</h1><span style="width:64px" aria-hidden="true"></span></div><main class="mbody"><p>Nothing was added.</p></main></div>';
    var who = name(c.owner);
    return '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="go" data-id="main">&lsaquo; Preferences</a><h1 class="ttl">Added</h1><span style="width:64px" aria-hidden="true"></span></div>' +
      '<main class="mbody"><div class="empty">' + ICON.leaf + "<b>On " + esc(who) + "'s list, and in use now</b><p class=\"small\">" + esc(STATEMENT_WORD[c.statement]) + " " + esc(c.subject) + ". Recipes and plans use it already.</p></div>" +
      '<div class="card sgroup"><div class="prow static"><div class="pbtn"><span class="pt"><span class="fs">' + STATEMENT_WORD[c.statement] + " · for " + esc(who) + '</span><span class="pl">' + esc(c.subject) + '</span><span class="pv">' + esc(foodDetail(c)) + '</span><span class="pw">Proposed by you · ' + esc(c.at) + "</span></span>" + chip("wait", "Waiting for " + who) + "</div></div></div>" +
      '<p class="small">' + esc(who) + " will see a note the next time they open Kitchie, and can keep it, change it or remove it. You are not told what they decide. You can take it back from Added for housemates until then.</p>" +
      '<div class="acts"><button type="button" class="btn" data-act="go" data-id="plan">See dinner ideas</button><button type="button" class="btn ghost" data-act="go" data-id="main">Back to Preferences</button><button type="button" class="btn ghost" data-act="go" data-id="propose" data-val="fill0">Add another</button></div></main></div>';
  }

  /* ---------- the subject's flow ---------- */
  function reviewCard(c) {
    var by = name(c.proposed_by), confirming = S.confirm === c.id;
    var head = '<span class="fs">' + esc(by) + " added</span><span class=\"pl\">" + esc(STATEMENT_WORD[c.statement]) + " " + esc(c.subject) + "</span>" +
      (foodDetail(c) ? '<span class="pv">' + esc(foodDetail(c)) + "</span>" : "") + '<span class="pw">' + esc(c.at) + ". In use now: recipes and plans " + (c.statement === "avoids" ? "leave it out" : "take it into account") + ".</span>";
    var acts;
    if (confirming) {
      acts = '<p class="note">This is kept for safety' + (c.reason === "safety" ? "" : " (no reason was given, so it is treated as safety)") + '. Remove it only if it is no longer true.</p>' +
        '<div class="acts"><button type="button" class="btn ghost danger" data-act="reject" data-id="' + c.id + '" data-confirmed="1">Yes, remove it</button><button type="button" class="btn ghost" data-act="keepit" data-id="' + c.id + '">Keep it for now</button></div>';
    } else {
      acts = '<div class="pacts">' +
        '<button type="button" class="pact go" data-act="accept" data-id="' + c.id + '">' + ICON.check + '<span class="pt"><span class="pl">Keep it as it is</span><span class="pv">Clears the waiting note. It stays on your list as yours, still tagged proposed by ' + esc(by) + ".</span></span></button>" +
        '<button type="button" class="pact" data-act="edit" data-id="' + c.id + '">' + ICON.pencil + '<span class="pt"><span class="pl">Change it</span><span class="pv">Fix the wording or how strict it is. Your version replaces ' + esc(by) + "'s and is the one in use.</span></span></button>" +
        '<button type="button" class="pact danger" data-act="reject" data-id="' + c.id + '">' + ICON.bin + '<span class="pt"><span class="pl">Remove it</span><span class="pv">Takes it off your list. New plans and recipes stop using it; a meal already planned stays as it was.</span></span></button></div>';
    }
    return '<div class="card" data-row="rv:' + c.id + '"><span class="pt">' + head + "</span>" + acts + "</div>";
  }
  function reviewScreen() {
    var list = pendingAbout(S.as), body;
    if (!list.length) {
      body = '<div class="empty">' + ICON.leaf + "<b>Nothing waiting</b><p class=\"small\">When a housemate adds something to your list, it shows up here the next time you open Kitchie. Until you answer, it is already in use.</p></div>" +
        '<button type="button" class="btn ghost" data-act="go" data-id="main">Back to Preferences</button>';
    } else {
      body = '<p>Housemates added ' + (list.length === 1 ? "this to your own list" : "these to your own list") + '. It is already in use. Nothing here needs your approval, and you have the last word.</p>' +
        list.map(reviewCard).join("") + '<button type="button" class="lnk" data-act="go" data-id="plan">See what planning does with them</button>';
    }
    return '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="go" data-id="main">&lsaquo; Preferences</a><h1 class="ttl">Added for you</h1><span style="width:64px" aria-hidden="true"></span></div><main class="mbody">' + flashHtml() + body + "</main></div>";
  }
  function editScreen() {
    var c = claim(S.target);
    if (!c) { S.screen = "review"; return reviewScreen(); }
    var by = name(c.proposed_by), d = S.draft;
    var weak = isStrictSafety(c) && (d.severity === "soft" && c.severity === "hard" || d.reason === "other");
    var confirm = S.confirmEdit && weak;
    return '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="go" data-id="review">&lsaquo; Added for you</a><h1 class="ttl">Change it</h1><span style="width:64px" aria-hidden="true"></span></div>' +
      '<main class="mbody">' + flashHtml() + "<p>" + esc(by) + " added <q>" + esc(c.said) + "</q> Change what is wrong. Your version replaces theirs and is used from the moment you save.</p>" +
      '<div class="card">' + draftForm({ pickWho: false }) + "</div>" +
      (confirm ? '<p class="note">This was kept for safety. Make it softer, or say it is not for safety, only if that is true for you.</p><div class="acts"><button type="button" class="btn" data-act="saveedit" data-id="' + c.id + '" data-confirmed="1">Yes, save my version</button><button type="button" class="btn ghost" data-act="go" data-id="review">Cancel</button></div>'
        : '<button type="button" class="btn" data-act="saveedit" data-id="' + c.id + '">Save my version</button><p class="small">Stays tagged <q>proposed by ' + esc(by) + ", changed by you</q>.</p><a class=\"lnk\" href=\"#\" data-act=\"go\" data-id=\"review\">Cancel</a>") + "</main></div>";
  }

  /* ---------- planning uses it now (a stand-in for the real plan and recipe screens) ---------- */
  function activeAbout(owner, statement, key) {
    return M.claims.filter(function (c) { return c.owner === owner && c.statement === statement && keyOf(c.subject) === key; })[0];
  }
  function whyLine(c) {
    var s = name(c.owner) + " " + STATEMENT_WORD[c.statement].toLowerCase() + " " + c.subject;
    if (!c.proposed_by) return s + ". On " + name(c.owner) + "'s own list.";
    if (c.ack_state === "pending") return s + ". Proposed by " + name(c.proposed_by) + ", waiting for " + name(c.owner) + ".";
    return s + ". Proposed by " + name(c.proposed_by) + ", " + (c.ack_state === "accepted" ? "kept" : "changed") + " by " + name(c.owner) + ".";
  }
  function planScreen() {
    var peanut = activeAbout("sam", "avoids", "peanuts"), olive = activeAbout("sam", "dislikes", "olives");
    var rows = "";
    rows += '<div class="sug"><span class="em" aria-hidden="true">🍚</span><span class="pt"><span class="pl">Egg fried rice</span><span class="fstat">Fits everyone</span></span></div>';
    rows += peanut
      ? '<div class="sug out"><span class="em" aria-hidden="true">🍜</span><span class="pt"><span class="pl">Satay noodles</span><span class="hold">' + ICON.warn + "<span>Left out: contains peanuts. " + esc(whyLine(peanut)) + "</span></span></span></div>"
      : '<div class="sug"><span class="em" aria-hidden="true">🍜</span><span class="pt"><span class="pl">Satay noodles</span><span class="fstat">Fits everyone</span></span></div>';
    rows += olive
      ? '<div class="sug"><span class="em" aria-hidden="true">🫒</span><span class="pt"><span class="pl">Greek chicken with olives</span><span class="hold soft">' + ICON.warn + "<span>Noted: has olives. " + esc(whyLine(olive)) + "</span></span></span></div>"
      : '<div class="sug"><span class="em" aria-hidden="true">🫒</span><span class="pt"><span class="pl">Greek chicken with olives</span><span class="fstat">Fits everyone</span></span></div>';
    var planned = peanut
      ? '<div class="sug"><span class="em" aria-hidden="true">🍜</span><span class="pt"><span class="fs">Planned earlier · Fri</span><span class="pl">Satay noodles</span><span class="hold">' + ICON.warn + "<span>Check this meal: contains peanuts. " + esc(whyLine(peanut)) + "</span></span></span></div>"
      : '<div class="sug"><span class="em" aria-hidden="true">🍜</span><span class="pt"><span class="fs">Planned earlier · Fri</span><span class="pl">Satay noodles</span><span class="pw">Nothing flagged. A meal you already planned stays as it was; only new ideas follow the list.</span></span></div>';
    return '<div class="sp"><div class="mtop"><a class="back" href="#" data-act="go" data-id="main">&lsaquo; Preferences</a><h1 class="ttl">Dinner ideas</h1><span style="width:64px" aria-hidden="true"></span></div><main class="mbody">' +
      "<p>Tonight, for the kitchen. Planning reads Sam's own list the moment something is added to it, whether Sam has signed in or not.</p>" +
      '<span class="lbl">Ideas</span><div class="card sgroup">' + rows + '</div><span class="lbl">Already on the plan</span><div class="card sgroup">' + planned + "</div>" +
      '<p class="small">This is a stand-in for the plan and recipe screens, to show the effect. The real screens are in plan-week.</p></main></div>';
  }

  function flashHtml() { return S.flash ? '<div class="banner" role="status">' + esc(S.flash) + "</div>" : ""; }

  function mainScreen() {
    var top = INWIN ? "" : '<div class="mtop"><a class="back" href="#" data-act="nav" data-id="Settings">&lsaquo; Settings</a><h1 class="ttl">Preferences</h1><span style="width:64px" aria-hidden="true"></span></div>';
    return '<div class="sp">' + top + '<main class="mbody">' + flashHtml() + (S.tab === "mine" ? noticeBanner(S.as) : "") + seg() + (S.tab === "mine" ? mineScreen() : householdScreen()) + "</main></div>";
  }

  function render() {
    var html = S.screen === "propose" ? proposeScreen() : S.screen === "done" ? doneScreen() : S.screen === "review" ? reviewScreen() : S.screen === "edit" ? editScreen() : S.screen === "plan" ? planScreen() : mainScreen();
    root.innerHTML = html;
    syncControls();
    if (S.focus) { var el = root.querySelector(S.focus); if (el) el.focus({ preventScroll: true }); S.focus = null; }
  }

  var SCREEN_WORD = { main: "Preferences", propose: "Add for a housemate", done: "Added", review: "Added for you", edit: "Change it", plan: "Dinner ideas" };
  function syncControls() {
    document.querySelectorAll("[data-pc]").forEach(function (b) {
      var k = b.getAttribute("data-pc"), v = b.getAttribute("data-v");
      b.setAttribute("aria-pressed", String(S[k] === v));
    });
    var st = document.getElementById("oc-state");
    if (st) st.textContent = ROLE[S.as] + (isAdmin(S.as) ? " (" + (HH_ROLE[S.as] === "founder" ? "founding member" : "household admin") + ")" : " (not an admin)") + " · " + SCREEN_WORD[S.screen] + (S.screen === "main" ? " · " + (S.tab === "mine" ? "Mine" : "Household") : "") + " · " + (S.data === "empty" ? "nothing set yet" : "some set");
  }

  /* ---------- actions ---------- */
  function newDraft(fill, owner) {
    var o = others();
    return { who: owner || o[0], statement: "avoids", subject: fill ? "peanuts" : "", severity: fill ? "hard" : "", reason: fill ? "safety" : "" };
  }
  function go(screen, val) {
    S.screen = screen; S.open = null; S.flash = ""; S.confirm = null; S.confirmEdit = false;
    if (screen === "propose") S.draft = newDraft(val === "fill1", S.draft && S.draft.keepWho && others().indexOf(S.draft.who) >= 0 ? S.draft.who : null);
    if (screen === "main") S.tab = "mine";
    render();
    var f = root.closest(".oc-frame"); if (f && f.getBoundingClientRect().top < 0) f.scrollIntoView({ block: "start" });
  }
  function doAccept(c) {
    c.ack_state = "accepted"; c.ack_when = "today";
    S.flash = "Kept. " + cap(c.subject) + " stays on your list as yours, still tagged proposed by " + name(c.proposed_by) + ".";
  }
  function doReject(c) {
    M.claims = M.claims.filter(function (x) { return x.id !== c.id; });
    S.flash = "Removed. " + cap(c.subject) + " is off your list, and new plans and recipes stop using it. Meals already planned stay as they were.";
  }
  function doEdit(c) {
    var d = S.draft;
    c.statement = d.statement; c.subject = d.subject.trim() || c.subject;
    c.severity = d.statement === "avoids" ? (d.severity || null) : undefined;
    c.reason = d.statement === "avoids" ? (d.reason || null) : undefined;
    c.said = "Changed by " + name(c.owner) + " from " + name(c.proposed_by) + "'s suggestion.";
    c.ack_state = "edited"; c.ack_when = "today";
    S.flash = "Saved. Your version replaces " + name(c.proposed_by) + "'s and is the one in use. It stays tagged proposed by " + name(c.proposed_by) + ".";
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-act]");
    if (!t || !root.contains(t) && !t.closest(".oc-jump")) return;
    var act = t.getAttribute("data-act"), id = t.getAttribute("data-id"), val = t.getAttribute("data-val");
    if (t.tagName === "A") ev.preventDefault();
    var c;
    if (act === "tab") { S.tab = id; S.open = null; S.flash = ""; render(); }
    else if (act === "toggle") { S.open = S.open === id ? null : id; S.flash = ""; S.focus = '[data-id="' + id + '"]'; render(); }
    else if (act === "go") go(id, val);
    else if (act === "later") { S.noticeGone = true; S.flash = "Kept for later. Nothing changed: these are still in use, and still waiting for you."; render(); }
    else if (act === "dset") { S.draft[id] = val; if (id === "statement" && val !== "avoids") { S.draft.severity = ""; S.draft.reason = ""; } S.focus = '[data-act="dset"][data-id="' + id + '"][data-val="' + val + '"]'; render(); }
    else if (act === "submit") {
      var d = S.draft, subj = d.subject.trim();
      if (!subj) { S.flash = "Say what it is first, for example peanuts."; S.focus = "#subj"; render(); return; }
      var dup = M.claims.filter(function (x) { return x.owner === d.who && x.statement === d.statement && keyOf(x.subject) === keyOf(subj); })[0];
      if (dup) { S.flash = name(d.who) + " already has " + STATEMENT_WORD[d.statement].toLowerCase() + " " + subj + " on their list. Nothing was added."; S.focus = "#subj"; render(); return; }
      var n = { id: "n" + (++seq), owner: d.who, statement: d.statement, subject: subj, said: name(d.who) + " " + STATEMENT_WORD[d.statement].toLowerCase() + " " + subj + ".", support: 1, proposed_by: S.as, ack_state: "pending", at: "Just now" };
      if (d.statement === "avoids") { n.severity = d.severity || null; n.reason = d.reason || null; }
      M.claims.push(n); S.last = n.id; S.noticeGone = false; go("done");
    }
    else if (act === "accept") { c = claim(id); if (c) { doAccept(c); S.focus = null; render(); } }
    else if (act === "edit") { c = claim(id); if (c) { S.target = id; S.draft = { who: c.owner, statement: c.statement, subject: c.subject, severity: c.severity || "", reason: c.reason || "" }; S.screen = "edit"; S.flash = ""; S.confirmEdit = false; render(); } }
    else if (act === "saveedit") {
      c = claim(id); if (!c) return;
      var dd = S.draft, weak = isStrictSafety(c) && (dd.severity === "soft" && c.severity === "hard" || dd.reason === "other");
      if (dd.subject.trim() === "") { S.flash = "Say what it is first."; S.focus = "#subj"; render(); return; }
      if (weak && !t.getAttribute("data-confirmed")) { S.confirmEdit = true; render(); return; }
      doEdit(c); S.screen = "review"; S.confirmEdit = false; render();
    }
    else if (act === "reject") {
      c = claim(id); if (!c) return;
      if (isStrictSafety(c) && !t.getAttribute("data-confirmed")) { S.confirm = id; S.focus = '[data-act="reject"][data-id="' + id + '"]'; render(); return; }
      S.confirm = null; doReject(c); render();
    }
    else if (act === "keepit") { S.confirm = null; S.focus = '[data-act="reject"][data-id="' + id + '"]'; render(); }
    else if (act === "takeback") { c = claim(id); if (c) { M.claims = M.claims.filter(function (x) { return x.id !== id; }); S.flash = "Taken back. " + cap(c.subject) + " is off " + name(c.owner) + "'s list and no longer used."; render(); } }
    else if (act === "forget") { var fg = claim(id); if (fg && fg.owner === null && !isAdmin(S.as)) return; M.claims = M.claims.filter(function (x) { return x.id !== id; }); S.open = null; render(); }
    else if (act === "nav") { S.flash = id === "plan" ? "" : "Opens " + id + ". Not drawn in this option."; if (id === "plan") { go("plan"); return; } if (id === "review") { go("review"); return; } S.open = null; render(); }
  });

  document.addEventListener("input", function (ev) {
    var t = ev.target;
    if (t.matches && t.matches('input[data-act="subject"]')) S.draft.subject = t.value;
  });
  document.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t.matches && t.matches('input[data-act="subject"]')) S.draft.subject = t.value;
  });

  /* ---------- page controls (the prototype's own, not part of the screen) ---------- */
  function applyParams(q) {
    var as = q.get("as"), data = q.get("data"), tab = q.get("tab"), open = q.get("open"), screen = q.get("screen"), act = q.get("do");
    if (data && data !== S.data && (data === "typical" || data === "empty")) { S.data = data; M = seed(data); S.noticeGone = false; }
    if (as && PEOPLE[as]) S.as = as;
    if (tab === "mine" || tab === "hh") S.tab = tab; else S.tab = "mine";
    S.open = open ? "f:" + open : null; S.flash = ""; S.confirm = null; S.confirmEdit = false; S.target = null;
    if (q.get("later") === "1") S.noticeGone = true;
    /* "do=reject:p1" and so on: the subject has already answered. The proposer is told nothing (D11): their view just no longer lists it. */
    if (act) { var p = act.split(":"), c = claim(p[1]); if (c && c.ack_state === "pending") { if (p[0] === "accept") doAccept(c); else if (p[0] === "reject") doReject(c); else if (p[0] === "edit") { S.draft = { who: c.owner, statement: "avoids", subject: "peanuts", severity: "soft", reason: "other" }; doEdit(c); } S.flash = ""; } }
    S.screen = ["main", "propose", "done", "review", "edit", "plan"].indexOf(screen) >= 0 ? screen : "main";
    if (S.screen === "propose") S.draft = newDraft(q.get("fill") === "1", null);
    if (S.screen === "done") { var lastp = M.claims.filter(function (x) { return x.id === (q.get("id") || "p1"); })[0]; S.last = lastp ? lastp.id : null; }
    if (S.screen === "edit") { var ec = claim(q.get("id") || "p1"); if (ec) { S.target = ec.id; S.draft = { who: ec.owner, statement: ec.statement, subject: ec.subject, severity: ec.severity || "", reason: ec.reason || "" }; } else S.screen = "review"; }
    if (S.screen === "review" && q.get("confirm")) S.confirm = q.get("confirm");
    render();
    if (open) { var el = root.querySelector('[data-row="f:' + open + '"]'); if (el) el.scrollIntoView({ block: "center" }); }
  }
  document.querySelectorAll("[data-pc]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-pc"), v = b.getAttribute("data-v");
      if (k === "data") { S.data = v; M = seed(v); S.noticeGone = false; } else if (k === "as") { S.as = v; }
      S.open = null; S.flash = ""; S.confirm = null; S.confirmEdit = false;
      if (S.screen === "propose") S.draft = newDraft(false, null);
      if (S.screen === "edit" || S.screen === "done") S.screen = "main";
      render();
    });
  });
  var reset = document.getElementById("oc-reset");
  if (reset) reset.addEventListener("click", function () { M = seed(S.data); S.noticeGone = false; S.screen = "main"; S.tab = "mine"; S.flash = ""; S.open = null; render(); });
  document.querySelectorAll(".oc-jump a").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      M = seed("typical"); S.data = "typical"; S.noticeGone = false;
      applyParams(new URLSearchParams(a.getAttribute("href").split("?")[1] || ""));
      var f = root.closest(".oc-frame"); if (f) f.scrollIntoView({ block: "start" });
    });
  });

  applyParams(new URLSearchParams(location.search));
})();
