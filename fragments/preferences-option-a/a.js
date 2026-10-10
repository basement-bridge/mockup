/* Preferences, option A: one list, a You / Household switch inside each row.
   Fake data only. The shapes follow what the code holds (see index.html, "What the model holds"):
   - dial rows: built-in default, then the household's value, then the member's own, key by key (Kitchie stock_prefs);
   - notes: one per household and one per member, both read, never overriding (Kitchie notes);
   - food claims: a member's and the household's are added together (Kitchie context_claims);
   - assistant: member only (Kitchie stock_prefs key assistant);
   - recipe stars and votes: household only, no member column (Recipe preferences).
   Locked by the owner (voice, 10 October 2026; D5 to D8 and D25 to D30 in docs/knowledge/preferences-option-a.md): D5 (any member edits household values) and D8 (any member records household food claims) are SUPERSEDED
   by the household admin role: only admins change household-level values (D28), the founding member is admin by default (D26), personal values are never gated (D29). The page's "Your role" control stands in for who is looking
   (Admin or Not an admin); the Members and admins view is drawn in option B only. A member may set quiet hours to none for themselves (D6); Most suggestions per day is 1 to 20, default 2.
   Mockup-only names (sample data, the prototype switches) live here, never in a.css. */
(function () {
  "use strict";

  var DEFAULTS = { enabled: "on", proactivity: "normal", quiet: null, cap: 2, tz: 0 };
  var ASSISTANTS = [["claude", "Claude"], ["chatgpt", "ChatGPT"], ["gemini", "Gemini"], ["other", "Another assistant"], ["none", "None"]];
  var NOTE_MAX = 600;
  var NOTE_LINE = "Read as a preference, never as an instruction.";

  var GROUPS = [
    { g: "Stock checks", sub: "Asked while you look at an item", rows: [
      { k: "enabled", ic: "🔔", t: "Ask me to check amounts", kind: "enum", opts: [["on", "On"], ["off", "Off"]] },
      { k: "proactivity", ic: "🎚️", t: "How proactive", kind: "enum", opts: [["quiet", "Quiet"], ["normal", "Normal"], ["helpful", "Helpful"]], hint: "Quiet asks the least, helpful asks the most." },
      { k: "quiet", ic: "🌙", t: "Quiet hours", kind: "hours", hint: "24 hour clock. No questions are raised in between. Both times or neither." },
      { k: "cap", ic: "🔢", t: "Most suggestions per day", kind: "int", min: 1, max: 20, hint: "From 1 to 20. The built-in default is 2." },
      { k: "tz", ic: "🕒", t: "Time zone", kind: "tz", hint: "Hours ahead of UTC, for example 10 for Sydney in winter or 11 in summer time." }
    ] },
    { g: "Food and taste", rows: [{ k: "foods", ic: "🍽️", t: "Likes, dislikes and avoids", kind: "claims" }] },
    { g: "Notes", rows: [{ k: "note", ic: "📝", t: "Note for your assistant", kind: "note" }] },
    { g: "Assistant", rows: [{ k: "assistant", ic: "🤖", t: "My assistant", kind: "assistant" }] },
    { g: "Recipes", needs: "recipe", rows: [{ k: "recipes", ic: "⭐", t: "Starred and voted recipes", kind: "recipes" }] }
  ];

  var S, UI;
  var role = "admin"; // the viewer's household role (D25 to D27): "admin" (the founding member or one they made admin) or "member"
  var ADMIN_WHY = "Only household admins can change this.";
  function isAdmin() { return role === "admin"; } // D28: the one place that decides who may change a household-level value; personal values never ask (D29)

  function sample(data) {
    var s = { recipe: data !== "norecipe", me: {}, house: {}, note: { me: "", house: "" }, assistant: null, foods: { me: [], house: [] }, rec: { star: 0, up: 0, down: 0 } };
    if (data === "empty") return s;
    s.house.proactivity = "quiet";
    s.house.quiet = { s: "22:00", e: "07:00" };
    s.house.tz = 10;
    s.me.quiet = { s: "23:00", e: "06:30" };
    s.me.cap = 5;
    s.note.house = "We cook mostly vegetarian on weekdays.";
    s.note.me = "Keep questions short, I am usually mid-cook.";
    s.assistant = "claude";
    s.foods.me = [{ st: "avoids", subj: "shellfish", sev: "hard", why: "safety" }, { st: "likes", subj: "ginger" }];
    s.foods.house = [{ st: "dislikes", subj: "coriander" }];
    if (s.recipe) s.rec = { star: 6, up: 4, down: 2 };
    return s;
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---- the value rules (built-in default, then household, then member) ---- */
  function fmt(k, v) {
    if (k === "enabled") return v === "on" ? "On" : "Off";
    if (k === "proactivity") return cap1(v);
    if (k === "quiet") return v && v.s ? v.s + " to " + v.e : "None"; // "none" is a choice a member can make over the household's hours (D6)
    if (k === "cap") return String(v);
    if (k === "tz") return "UTC" + (v < 0 ? "−" : "+") + Math.abs(v);
    return String(v);
  }
  function below(k) { return S.house[k] !== undefined ? { v: S.house[k], from: "household" } : { v: DEFAULTS[k], from: "default" }; }
  function eff(k) { return S.me[k] !== undefined ? { v: S.me[k], from: "member", below: below(k) } : { v: below(k).v, from: below(k).from, below: below(k) }; }

  /* ---- chips and summaries ---- */
  function chip(cls, text) { return '<i class="chip ' + cls + '">' + esc(text) + "</i>"; }
  function srcChip(from) { return from === "member" ? chip("member", "Your choice") : from === "household" ? chip("household", "From household") : chip("default", "Built-in default"); }
  function srcWords(e) {
    if (e.from === "member") return "Overrides " + (e.below.from === "household" ? "household: " : "built-in default: ") + fmt(e.k, e.below.v);
    if (e.from === "household") return "Same as the household";
    return "Nobody has set this";
  }

  function head(def, pv, subHtml) {
    var open = UI.open === def.k;
    return '<button type="button" class="pref-h" data-act="open" data-k="' + def.k + '" aria-expanded="' + open + '" aria-controls="b-' + def.k + '">' +
      '<span class="pi" aria-hidden="true">' + def.ic + '</span><span class="pt"><b>' + esc(def.t) + '</b><span class="ps">' + subHtml + '</span></span>' +
      '<span class="pv">' + esc(pv) + '</span><span class="chev" aria-hidden="true">›</span></button>';
  }

  function scopeSwitch(def, scope, lock) {
    function seg(id, label) {
      var dis = lock === id;
      return '<button type="button" role="radio" aria-checked="' + (scope === id) + '"' + (dis ? ' aria-disabled="true"' : "") + ' class="' + (scope === id ? "on" : "") + '" data-act="scope" data-k="' + def.k + '" data-s="' + id + '">' + label + "</button>";
    }
    return '<div class="seg2" role="radiogroup" aria-label="Whose value for ' + esc(def.t) + '">' + seg("me", "You") + seg("house", "Household") + "</div>";
  }

  function rad(act, k, val, label, sub, checked) {
    return '<button type="button" role="radio" class="rad" aria-checked="' + checked + '" data-act="' + act + '" data-k="' + k + '" data-v="' + esc(val) + '"><i aria-hidden="true"></i><span class="rt">' + esc(label) + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span></button>";
  }

  /* D28: household values are changed by household admins. A member who is not an admin sees the value and the reason, read-only. */
  function anyLine() {
    return '<p class="small">Household admins can change this. It applies to everyone who has not set their own.</p>';
  }
  function lockLine() { return '<p class="small"><span aria-hidden="true">🔒</span> ' + ADMIN_WHY + "</p>"; }

  /* ---- dial rows: enum, hours, int, tz ---- */
  function editor(def, level) {
    var k = def.k, store = level === "me" ? S.me : S.house, cur = store[k];
    var inheritVal = level === "me" ? below(k).v : DEFAULTS[k];
    var inheritLabel = (level === "me" ? "Same as household" : "Built-in default") + " (" + fmt(k, inheritVal) + ")";
    var unset = cur === undefined;
    var out = '<div class="rads" role="radiogroup" aria-label="' + esc(def.t) + '">' + rad("pick", k, "", inheritLabel, "", unset);
    if (def.kind === "enum") {
      def.opts.forEach(function (o) { out += rad("pick", k, o[0], o[1], "", cur === o[0]); });
      out += "</div>";
    } else {
      var label = def.kind === "hours" ? "Set quiet hours" : def.kind === "int" ? "Set my own number" : "Set a time zone";
      if (level === "house") label = label.replace("my own", "a");
      var none = def.kind === "hours" && level === "me";
      out += rad("pick", k, "own", label, "", !unset && cur !== "none") + (none ? rad("pick", k, "none", "None, no quiet hours for me", "", cur === "none") : "") + "</div>";
      if (!unset && cur !== "none") out += ownField(def, level, cur);
    }
    return out + (def.hint ? '<p class="small">' + esc(def.hint) + "</p>" : "") + (def.kind === "hours" && level === "me" ? '<p class="small">You can switch quiet hours off for yourself, whatever the household has.</p>' : "");
  }
  function ownField(def, level, cur) {
    var k = def.k;
    if (def.kind === "hours") {
      return '<div class="fr"><label>From<input class="field" type="time" data-k="' + k + '" data-f="s" data-l="' + level + '" value="' + esc(cur.s) + '"></label><label>Until<input class="field" type="time" data-k="' + k + '" data-f="e" data-l="' + level + '" value="' + esc(cur.e) + '"></label></div>';
    }
    if (def.kind === "int") {
      return '<div class="step" role="group" aria-label="' + esc(def.t) + '"><button type="button" data-act="step" data-k="' + k + '" data-d="-1" data-l="' + level + '" aria-label="One fewer"' + (cur <= def.min ? " disabled" : "") + '>−</button><output aria-live="polite">' + cur + '</output><button type="button" data-act="step" data-k="' + k + '" data-d="1" data-l="' + level + '" aria-label="One more"' + (cur >= def.max ? " disabled" : "") + ">+</button></div>";
    }
    return '<label class="fr" style="grid-template-columns:1fr"><span class="small">Hours ahead of UTC</span><input class="field" type="text" inputmode="decimal" autocomplete="off" data-k="' + k + '" data-f="tz" data-l="' + level + '" value="' + esc(cur) + '"></label>';
  }

  function dialRow(def) {
    var e = eff(def.k); e.k = def.k;
    var scope = UI.scope[def.k] || "me";
    var sub = srcChip(e.from) + "<span>" + esc(srcWords(e)) + "</span>";
    var html = '<li class="pref" data-pref="' + def.k + '" data-src="' + e.from + '" data-open="' + (UI.open === def.k) + '">' + head(def, fmt(def.k, e.v), sub);
    if (UI.open === def.k) {
      var why, body;
      if (scope === "me") {
        why = e.from === "member"
          ? "You chose " + fmt(def.k, e.v) + ". " + (e.below.from === "household" ? "The household has " + fmt(def.k, e.below.v) + "." : "Without your choice you would get the built-in default, " + fmt(def.k, e.below.v) + ".")
          : e.from === "household"
            ? "The household chose " + fmt(def.k, e.v) + ", so that is what you get. Pick one to use your own."
            : "Nobody has set this, so the built-in default applies: " + fmt(def.k, e.v) + ". Pick one to use your own.";
        body = editor(def, "me");
      } else {
        var h = S.house[def.k];
        why = h !== undefined
          ? "The household chose " + fmt(def.k, h) + ". It applies to everyone who has not set their own."
          : "The household has not set this. Everyone gets the built-in default, " + fmt(def.k, DEFAULTS[def.k]) + ", unless they set their own.";
        body = isAdmin() ? editor(def, "house") + anyLine() : lockLine();
      }
      html += '<div class="pref-b" id="b-' + def.k + '">' + scopeSwitch(def, scope) + '<p class="why">' + esc(why) + "</p>" + body + "</div>";
    }
    return html + "</li>";
  }

  /* ---- notes: both are read, neither overrides ---- */
  function noteRow(def) {
    var n = S.note, count = (n.me ? 1 : 0) + (n.house ? 1 : 0);
    var pv = count === 2 ? "2 notes" : n.me ? "Your note" : n.house ? "Household note" : "None yet";
    var sub = chip("both", "Both are read") + "<span>" + (count ? "Neither overrides the other" : "Nothing written") + "</span>";
    var scope = UI.scope.note || "me";
    var html = '<li class="pref" data-pref="note" data-src="both" data-open="' + (UI.open === "note") + '">' + head(def, pv, sub);
    if (UI.open === "note") {
      var body;
      if (scope === "me") {
        body = '<textarea class="field" data-f="note" data-l="me" maxlength="' + NOTE_MAX + '" rows="4" aria-label="Your note" placeholder="Anything your assistant should keep in mind">' + esc(n.me) + '</textarea><div class="count">' + n.me.length + " / " + NOTE_MAX + '</div><p class="small">Only you and your assistant see your note. ' + NOTE_LINE + "</p>";
      } else if (!isAdmin()) {
        body = '<p class="why">' + (n.house ? esc(n.house) : "No household note yet.") + "</p>" + lockLine() + '<p class="small">Every member’s assistant reads this. ' + NOTE_LINE + "</p>";
      } else {
        body = '<textarea class="field" data-f="note" data-l="house" maxlength="' + NOTE_MAX + '" rows="4" aria-label="Household note" placeholder="Anything every member’s assistant should keep in mind">' + esc(n.house) + '</textarea><div class="count">' + n.house.length + " / " + NOTE_MAX + '</div><p class="small">Every member’s assistant reads this, and household admins can change it. ' + NOTE_LINE + "</p>";
      }
      html += '<div class="pref-b" id="b-note">' + scopeSwitch(def, scope) + '<p class="why">Notes do not override each other. Your assistant reads the household’s and yours.</p>' + body + "</div>";
    }
    return html + "</li>";
  }

  /* ---- food claims: added together, only the assistant writes them ---- */
  function claimLi(c) {
    var verb = { avoids: "Avoids", likes: "Likes", dislikes: "Dislikes", usually: "Usually", fact: "Fact" }[c.st];
    var ic = c.st === "avoids" ? "🚫" : c.st === "likes" ? "💚" : c.st === "dislikes" ? "😕" : "📌";
    var sm = c.st === "avoids" ? (c.why === "safety" ? "Safety" : "Not safety") + ", " + c.sev : "";
    return '<li><span aria-hidden="true">' + ic + '</span><span class="ct">' + verb + " " + esc(c.subj) + (sm ? "<small>" + esc(sm) + "</small>" : "") + "</span></li>";
  }
  function foodsRow(def) {
    var n = S.foods.me.length + S.foods.house.length;
    var pv = n ? n + " noted" : "None yet";
    var sub = chip("both", "Added together") + "<span>" + (n ? S.foods.me.length + " yours, " + S.foods.house.length + " household" : "Nothing recorded") + "</span>";
    var scope = UI.scope.foods || "me", list = S.foods[scope];
    var html = '<li class="pref" data-pref="foods" data-src="both" data-open="' + (UI.open === "foods") + '">' + head(def, pv, sub);
    if (UI.open === "foods") {
      var who = scope === "me" ? "you" : "the household";
      var body = list.length ? '<ul class="claims">' + list.map(claimLi).join("") + "</ul>" : '<div class="claims none">Nothing recorded for ' + who + ' yet. Tell your assistant what ' + (scope === "me" ? "you like or avoid" : "the household likes or avoids") + ", in your own words.</div>";
      html += '<div class="pref-b" id="b-foods">' + scopeSwitch(def, scope) + '<p class="why">Yours and the household’s are used together. One person cannot switch off something the household avoids.' + (scope === "house" && isAdmin() ? " Household admins can add to the household’s." : "") + '</p>' + body +
        (scope === "house" && !isAdmin() ? lockLine() : '<button type="button" class="btn ghost" data-act="proto" data-m="Said to your assistant, not typed here. Kitchie records it when the assistant reports what you stated.">Tell your assistant' + (scope === "house" ? " for the household" : "") + "</button>") +
        '<p class="small">This is the only way in. Kitchie only records what you state. It never guesses from what you cook.</p></div>';
    }
    return html + "</li>";
  }

  /* ---- assistant: a person's own choice, no household layer ---- */
  function assistantRow(def) {
    var a = S.assistant, label = a && a !== "none" ? ASSISTANTS.filter(function (x) { return x[0] === a; })[0][1] : "Not chosen";
    var sub = a ? chip("member", "Your choice") + "<span>Only yours</span>" : chip("default", "Not set") + "<span>Only yours</span>";
    var html = '<li class="pref" data-pref="assistant" data-src="member" data-open="' + (UI.open === "assistant") + '">' + head(def, label, sub);
    if (UI.open === "assistant") {
      html += '<div class="pref-b" id="b-assistant">' + scopeSwitch(def, "me", "house") + '<p class="why">Everyone picks their own app. There is no household version.</p><div class="rads" role="radiogroup" aria-label="My assistant">' +
        ASSISTANTS.map(function (x) { return rad("assistant", "assistant", x[0], x[1], "", (a || "none") === x[0]); }).join("") + '</div><p class="small">The AI app you use with Kitchie. The plan’s button opens it with a starting message, and you take it from there.</p></div>';
    }
    return html + "</li>";
  }

  /* ---- recipes: the household's, nobody is recorded ---- */
  function recipesRow(def) {
    var r = S.rec, none = !r.star && !r.down && !r.up;
    var pv = none ? "None yet" : r.star + " starred";
    var sub = chip("only", "Household only") + "<span>" + (none ? "Nothing starred" : r.up + " liked, " + r.down + " downvoted") + "</span>";
    var html = '<li class="pref" data-pref="recipes" data-src="household" data-open="' + (UI.open === "recipes") + '">' + head(def, pv, sub);
    if (UI.open === "recipes") {
      html += '<div class="pref-b" id="b-recipes">' + scopeSwitch(def, "house", "me") +
        '<p class="why">Stars and votes belong to the household. Recipe does not record who gave them, so there is no personal copy.</p>' +
        (none ? '<div class="claims none">Nothing starred yet. Star a recipe and it shows up here for everyone.</div>'
          : '<ul class="claims"><li><span aria-hidden="true">⭐</span><span class="ct">' + r.star + ' starred</span></li><li><span aria-hidden="true">👍</span><span class="ct">' + r.up + ' liked</span></li><li><span aria-hidden="true">👎</span><span class="ct">' + r.down + ' downvoted</span></li></ul>') +
        '<button type="button" class="btn ghost" data-act="proto" data-m="Stars and votes are set on each recipe, not here.">Open recipes</button></div>';
    }
    return html + "</li>";
  }

  function nothingSet() {
    return !Object.keys(S.me).length && !Object.keys(S.house).length && !S.note.me && !S.note.house && !S.assistant && !S.foods.me.length && !S.foods.house.length && !S.rec.star && !S.rec.down && !S.rec.up;
  }

  /* ---- the screen ---- */
  function render() {
    var scr = document.querySelector("#ph .scr"), top = scr ? scr.scrollTop : 0;
    var h = '<div class="scr"><div class="hd"><button type="button" class="bk" data-act="proto" data-m="Back to Settings">‹ Settings</button><h3>Preferences</h3></div>' +
      '<p class="small">Each row shows the value in force for you, and where it comes from. Open a row to see the household’s value, and to change it if you are a household admin.</p>' +
      '<div class="legend" aria-label="Where a value comes from">' + chip("default", "Built-in default") + chip("household", "From household") + chip("member", "Your choice") + "</div>";
    if (nothingSet()) h += '<div class="pa-empty"><span class="e" aria-hidden="true">🌱</span><div><b>Nothing set yet</b><p>Everything follows the built-in defaults. Change a row when you want it your way.</p></div></div>';
    GROUPS.forEach(function (g) {
      if (g.needs === "recipe" && !S.recipe) return;
      h += '<span class="lbl">' + esc(g.g) + (g.sub ? "<small>" + esc(g.sub) + "</small>" : "") + '</span><ul class="prefs">';
      g.rows.forEach(function (d) {
        h += d.kind === "note" ? noteRow(d) : d.kind === "claims" ? foodsRow(d) : d.kind === "assistant" ? assistantRow(d) : d.kind === "recipes" ? recipesRow(d) : dialRow(d);
      });
      h += "</ul>";
    });
    h += "</div>" + '<div class="tst" id="tst" role="status" hidden></div>';
    document.getElementById("ph").innerHTML = h;
    var n = document.querySelector("#ph .scr"); if (n) n.scrollTop = top;
  }

  var tstTimer;
  function say(m) {
    var t = document.getElementById("tst"); if (!t) return;
    t.textContent = m; t.hidden = false; clearTimeout(tstTimer);
    tstTimer = setTimeout(function () { t.hidden = true; }, 2400);
  }

  /* ---- writes: a member writes their own; only an admin writes the household's (D28; D5 is superseded) ---- */
  function write(level, k, v) {
    if (level === "house" && !isAdmin()) return false;
    var store = level === "me" ? S.me : S.house;
    if (v === undefined || v === null) delete store[k]; else store[k] = v;
    return true;
  }
  function ownDefault(k) { return k === "quiet" ? { s: "22:00", e: "07:00" } : k === "cap" ? 3 : 10; }
  function level() { return (UI.scope[UI.open] || "me"); }

  function onClick(ev) {
    var b = ev.target.closest("[data-act]"); if (!b) return;
    var act = b.getAttribute("data-act"), k = b.getAttribute("data-k");
    if (act === "open") { UI.open = UI.open === k ? null : k; render(); return; }
    if (act === "scope") {
      if (b.getAttribute("aria-disabled") === "true") { say(k === "recipes" ? "Recipe keeps this for the household only." : "This is not a household setting."); return; }
      UI.scope[k] = b.getAttribute("data-s"); render(); return;
    }
    if (act === "pick") {
      var v = b.getAttribute("data-v"), lv = level();
      write(lv, k, v === "" ? null : v === "own" ? ownDefault(k) : v);
      render(); say("Saved"); return;
    }
    if (act === "step") {
      var l2 = b.getAttribute("data-l"), cur = (l2 === "me" ? S.me : S.house)[k], def = GROUPS[0].rows.filter(function (r) { return r.k === k; })[0];
      var nv = Math.max(def.min, Math.min(def.max, cur + Number(b.getAttribute("data-d"))));
      write(l2, k, nv); render(); say("Saved"); return;
    }
    if (act === "assistant") { S.assistant = b.getAttribute("data-v"); render(); say("Saved"); return; }
    if (act === "proto") { say(b.getAttribute("data-m")); }
  }

  function onChange(ev) {
    var f = ev.target.getAttribute("data-f"); if (!f) return;
    var l = ev.target.getAttribute("data-l"), k = ev.target.getAttribute("data-k");
    if (f === "note") { S.note[l] = ev.target.value.slice(0, NOTE_MAX); render(); say("Saved"); return; }
    var store = l === "me" ? S.me : S.house;
    if (f === "s" || f === "e") {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(ev.target.value)) { render(); say("Use a time like 22:00."); return; }
      store[k] = { s: store[k].s, e: store[k].e }; store[k][f] = ev.target.value; render(); say("Saved"); return;
    }
    if (f === "tz") {
      var n = Number(ev.target.value.replace(",", "."));
      if (!/^[+-]?\d{1,2}(\.\d{1,2})?$/.test(ev.target.value.trim()) || n < -12 || n > 14) { render(); say("Time zone is hours ahead of UTC, from -12 to 14."); return; }
      store[k] = n; render(); say("Saved");
    }
  }
  function onInput(ev) {
    if (ev.target.getAttribute("data-f") !== "note") return;
    var c = ev.target.parentNode.querySelector(".count"); if (c) c.textContent = ev.target.value.length + " / " + NOTE_MAX;
  }

  function init() {
    var data = "some";
    function start() { S = sample(data); UI = { open: null, scope: {} }; render(); }
    document.querySelectorAll("[data-pc]").forEach(function (b) {
      b.addEventListener("click", function () {
        var kind = b.getAttribute("data-pc"), v = b.getAttribute("data-v");
        if (kind === "reset") { start(); return; }
        if (kind === "role") { role = v; document.querySelectorAll('[data-pc="role"]').forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); render(); return; }
        data = v;
        document.querySelectorAll('[data-pc="' + kind + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        start();
      });
    });
    var ph = document.getElementById("ph");
    ph.addEventListener("click", onClick);
    ph.addEventListener("change", onChange);
    ph.addEventListener("input", onInput);
    start();
  }
  init();
})();
