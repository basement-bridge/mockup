/* Settings, the other areas: three directions (A flat pages, B one note, C faces). Phone only. Mockup only: nothing here is built.
   Everything under the Settings front except the front itself (search, quick controls, pinned area, theme rotary, text-size stepper), which is the chosen design in ../settings-shakeup/ and is drawn here
   static and inert, only so the taps from the front can be counted. The areas drawn: the profile menu, Household (name, people, invite, leave), You (picture, name, role, data, install, sign out),
   Preferences (stock checks, food, notes, housemates, rules by place), Kitchen setup (categories, locations and spots, sample items) and Assistants (connect, default, personal link).
   Rules from the chosen design are kept: the control is the shortcut (a switch, a stepper, a time is in its own row), double tap resets a control to its default (here: to the household's value),
   the pin is an icon, there are no pills, counts or explainer lines. Class names are plain so the CSS can be lifted. Everything drawn is escaped.
   Several phones can live on one page (directions.html); each has its own state. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- icons (stroke, currentColor) ---------- */
  var P = {
    back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', looks: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18z" fill="currentColor"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    home: '<path d="M4 11l8-7 8 7v9H4zM10 20v-6h4v6"/>', sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    pot: '<path d="M4 10h16v7a3 3 0 01-3 3H7a3 3 0 01-3-3zM2 10h2M20 10h2M9 6c0-2 2-2 2-4M14 6c0-2 2-2 2-4"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>', undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 017.5-2"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>', download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    install: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M12 8v6M9.5 11.5L12 14l2.5-2.5"/>', signout: '<path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4M15 8l4 4-4 4M19 12H9"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', one: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>', many: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.1 2.7-5 6-5s6 1.9 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.6 0 4.5 1.6 4.5 4"/>'
  };
  function ic(n, s) { return '<svg class="i" width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>"; }
  function chev() { return '<span class="chev">' + ic("chev", 18) + "</span>"; }

  /* ---------- sample data ---------- */
  var AV = ["🥕", "🍋", "🥑", "🍄", "🌶️", "🍞", "🧀", "🍓", "🥦", "🍅", "🧄", "🍇"];
  var ROLES = ["Head chef", "Sous chef", "Baker", "Grill master", "Snack scout", "Dishwasher hero"];
  var CATS = ["Dairy", "Meat", "Fish", "Produce", "Bakery", "Frozen", "Tins and jars", "Pasta and rice", "Baking", "Drinks", "Snacks", "Spices"];
  function fresh() {
    return {
      hh: "Henderson kitchen", me: { name: "Alex", pic: "", role: "Sous chef", admin: true, founder: true },
      people: [{ id: "sam", name: "Sam", pic: "🥕", admin: false, food: { hard: ["Shellfish"], soft: ["Olives"], like: ["Mushrooms", "Lemon"] }, waiting: 1 }, { id: "jo", name: "Jo", pic: "", admin: false, food: { hard: [], soft: [], like: [] }, waiting: 0 }],
      pending: [{ id: "i1", left: 6 }], kind: "join", link: null,
      scope: "me",
      d: { me: { ask: null, q: null, cap: null }, hh: { ask: true, q: { s: "21:00", e: "07:00" }, cap: 5 }, app: { ask: true, q: { s: "22:00", e: "06:00" }, cap: 3 } },
      food: { me: { hard: [], soft: ["Pasta", "Roti", "Tomato-based foods", "Iceberg lettuce", "Non-rice noodles"], like: ["Protein-forward, carb-conscious meals", "Gluten-free bread", "Rice noodles"], swap: ["Butter to olive oil"] }, hh: { hard: ["Gluten"], soft: [], like: [], swap: [] } },
      why: { Gluten: "Gluten sensitivity in the household, so nothing with wheat, barley or rye goes in a plan", Pasta: "Too heavy on carbs for most weeknights", "Tomato-based foods": "Heartburn", "Iceberg lettuce": "", "Non-rice noodles": "Only rice noodles, never wheat", "Protein-forward, carb-conscious meals": "", "Gluten-free bread": "Toast and sandwiches" },
      notes: { me: "", hh: "" },
      rules: [{ t: "Dairy in the Fridge", v: "Low, weekly" }, { t: "Freezer items", v: "Out, daily" }], stops: 2,
      cats: CATS.slice(), areas: [{ n: "Kitchen", spots: ["Fridge", "Freezer", "Pantry", "Spice rack"] }, { n: "Garage", spots: ["Chest freezer"] }, { n: "Balcony", spots: [] }],
      samples: 12, ai: { claude: true, chatgpt: false, gemini: false }, dflt: "claude", link: false, installable: true,
      ui: { open: {}, chip: null, confirm: null, avopen: false, dr: null, sheet: null, rule: { what: "Category", lvl: "Low", often: "Weekly" }, leaveTyped: "", last: null }
    };
  }
  var ASSISTS = [["claude", "Claude"], ["chatgpt", "ChatGPT"], ["gemini", "Gemini"]];
  function aname(id) { return ASSISTS.filter(function (a) { return a[0] === id; })[0][1]; }

  /* ---------- state helpers ---------- */
  function get(S, path) { var o = S, p = path.split("."); for (var i = 0; i < p.length; i++) { o = o[isNaN(p[i]) ? p[i] : +p[i]]; if (o == null) return null; } return o; }
  function eff(S, scope, k) {
    var d = S.d, v;
    if (scope === "hh") { v = d.hh[k]; return v != null ? v : d.app[k]; }
    v = d.me[k]; if (v != null) return v; v = d.hh[k]; return v != null ? v : d.app[k];
  }
  function own(S, scope, k) { return scope === "hh" ? S.d.hh[k] != null : S.d.me[k] != null; }
  function fromWho(S, k) { return S.d.hh[k] != null ? "household" : "Kitchie"; }
  function t12(h) { if (!h) return ""; var p = h.split(":"), n = +p[0], s = n >= 12 ? "pm" : "am"; n = n % 12 || 12; return n + (p[1] === "00" ? "" : ":" + p[1]) + s; }
  function quietText(q) { return q === "none" ? "None" : t12(q.s) + " to " + t12(q.e); }
  function pl(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function initialOf(n) { return (String(n).trim().charAt(0) || "?").toUpperCase(); }
  function discHtml(name, pic, cls) { return '<span class="av' + (cls ? " " + cls : "") + '" aria-hidden="true">' + esc(pic || initialOf(name)) + "</span>"; }
  function joinNames(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }

  /* ---------- small controls ---------- */
  function sw(a, on, label) { return '<label class="sw"><input type="checkbox" role="switch" data-a="' + a + '"' + (on ? " checked" : "") + ' aria-label="' + esc(label) + '"><i class="swt" aria-hidden="true"></i></label>'; }
  function tseg(label, opts, cur, pre) { return '<div class="tseg" role="radiogroup" aria-label="' + esc(label) + '">' + opts.map(function (o) { return '<button type="button" role="radio" aria-checked="' + (cur === o[0]) + '" data-a="' + pre + ":" + o[0] + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>"; }
  function num(key, v, lo, hi) { return '<span class="num" role="group" aria-label="Most suggestions per day"><button type="button" data-a="step:' + key + ':-1" aria-label="Fewer"' + (v <= lo ? " disabled" : "") + '>−</button><b aria-live="polite">' + v + '</b><button type="button" data-a="step:' + key + ':1" aria-label="More"' + (v >= hi ? " disabled" : "") + '>+</button></span>'; }
  function timeIn(k, v, label, dis) { return '<input type="time" class="tm" data-in="' + k + '" value="' + esc(v) + '" aria-label="' + esc(label) + '"' + (dis ? " disabled" : "") + ">"; }

  /* ---------- the dials: ask, quiet hours, most per day. scope 'me' or 'hh'. Mine falls back to the household's, then the app's; a double tap on a row (or the quiet words) goes back ---------- */
  /* A value that is not yours says where it comes from as a link glyph and one word; a value that is yours has a Reset glyph button instead (words budget: no "Same as ...", no "Yours. Use the ...") */
  function inhLine(S, scope, k) {
    if (scope === "hh" || own(S, "me", k)) return "";
    return '<span class="inh" title="Same as ' + fromWho(S, k) + '">' + ic("link", 14) + (S.d.hh[k] != null ? "Household" : "Kitchie") + "</span>";
  }
  function resetBtn(S, scope, k) {
    if (scope === "hh" || !own(S, "me", k)) return "";
    return '<button type="button" class="ibtn2" data-a="reset:' + k + '" aria-label="Use the ' + fromWho(S, k) + '&rsquo;s" title="Use the ' + fromWho(S, k) + '&rsquo;s">' + ic("undo", 20) + "</button>";
  }
  function ctlAttr(scope, k) { return scope === "me" ? ' data-ctl="' + k + '"' : ""; }
  function dialAsk(S, scope) {
    var on = eff(S, scope, "ask");
    return '<div class="crow"' + ctlAttr(scope, "ask") + '><div class="top"><span class="rm"><b class="nm">Amount checks</b>' + inhLine(S, scope, "ask") + "</span>" + resetBtn(S, scope, "ask") + sw("tog:ask", on, scope === "me" ? "Ask me to check amounts" : "Ask to check amounts") + "</div></div>";
  }
  function dialQuiet(S, scope) {
    var q = eff(S, scope, "q"), none = q === "none";
    return '<div class="crow"' + ctlAttr(scope, "q") + '><div class="top"><span class="rm"><b class="nm">Quiet hours</b>' + inhLine(S, scope, "q") + "</span>" + resetBtn(S, scope, "q") + "</div>" +
      '<div class="ctl tms">' + (none ? '<span class="sm">None</span>' : timeIn("qs", q.s, "Quiet hours from") + '<span aria-hidden="true">&ndash;</span>' + timeIn("qe", q.e, "Quiet hours to")) +
      (scope === "me" ? '<button type="button" class="lnk" data-a="qnone">' + (none ? "Use quiet hours" : "No quiet hours") + "</button>" : "") + "</div></div>";
  }
  function dialCap(S, scope) {
    var v = eff(S, scope, "cap");
    return '<div class="crow"' + ctlAttr(scope, "cap") + '><div class="top"><span class="rm"><b class="nm">Suggestions a day</b>' + inhLine(S, scope, "cap") + "</span>" + resetBtn(S, scope, "cap") + num("cap", v, 1, 20) + "</div></div>";
  }
  function dialsRows(S, scope) { return dialAsk(S, scope) + dialQuiet(S, scope) + dialCap(S, scope); }

  /* ---------- chips (food words, categories, spots) with the edit in place ---------- */
  var FOODL = [["hard", "Never"], ["soft", "Rather not"], ["like", "Likes"], ["swap", "Swaps"]];
  function chipEditor(ui, path, items) {
    var c = ui.chip; if (!c || c.path !== path) return "";
    if (c.add) return '<div class="edit"><input class="in" data-in="chipin" aria-label="Add" placeholder="Add" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="pbtn go" data-a="chipsave">Add</button><button type="button" class="lnk" data-a="chipdone">Cancel</button></div>';
    return '<div class="edit"><button type="button" class="dng" data-a="chiprm">Remove ' + esc(items[c.i]) + '</button><button type="button" class="lnk" data-a="chipdone">Done</button></div>';
  }
  function chipList(S, path, items, locked) {
    var ui = S.ui, c = ui.chip;
    var chips = (locked || []).map(function (t) { return '<span class="cp lock" title="Set by the household">' + esc(t) + "</span>"; }).join("") + items.map(function (t, i) {
      return '<button type="button" class="cp" data-user data-a="chip:' + path + ":" + i + '" aria-expanded="' + !!(c && c.path === path && c.i === i) + '">' + esc(t) + "</button>";
    }).join("") + '<button type="button" class="cp add" data-a="chipadd:' + path + '" aria-label="Add">' + ic("plus", 16) + " Add</button>";
    return '<div class="cps">' + chips + "</div>" + chipEditor(ui, path, items);
  }
  /* Food list (owner, 24 Oct 2026; built in kitchie #1125): one heading per group (Avoids, Likes, Swaps), dense rows (name, one quiet line for the reason, cut with an ellipsis; nothing when there is no reason),
     a lock for Hard and the word Soft for soft, a small icon for Everyone or Just you (shown, not a control: moving a rule between the two has no operation today), and an add row first in each group. */
  var LOCKI = '<svg class="hard" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var UNLOCKI = '<svg class="soft" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>';
  var ONEI = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>';
  var MANYI = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.1 2.7-5 6-5s6 1.9 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.6 0 4.5 1.6 4.5 4"/></svg>';
  /* Hard is a closed lock, Soft an open lock (one metaphor, two shapes; the colour is not the signal), Everyone two people, Just you one. Words only for a screen reader. A row opens in place:
     what was said (a quote), Hard or Soft as a two-way control, the Reason (a box, no help text), Stop remembering (asks once for a Hard one), and one line: changing it is the assistant's. */
  function foodRow(S, sc, kind, t, everyone) {
    var key = sc + "." + kind + ":" + t, why = (S.why || {})[t] || "", open = S.ui.open["food:" + key];
    var mark = kind === "hard" ? '<span class="fmark" title="Hard">' + LOCKI + '<span class="vh">Hard</span></span>' : kind === "soft" ? '<span class="fmark soft" title="Soft">' + UNLOCKI + '<span class="vh">Soft</span></span>' : "";
    return '<li class="frow prow"><button type="button" class="fmain" data-a="open:food:' + esc(key) + '" aria-expanded="' + !!open + '"><span class="rm"><span class="nm" data-user>' + esc(t) + "</span>" + (why ? '<span class="fline">' + esc(why) + "</span>" : "") + "</span>" + mark + '<span class="fscope" title="' + (everyone ? "Everyone" : "Just you") + '">' + (everyone ? MANYI : ONEI) + '<span class="vh">' + (everyone ? "Everyone" : "Just you") + "</span></span>" + chev() + "</button>" + (open ? foodEditor(S, sc, kind, t, everyone, key, why) : "") + "</li>";
  }
  function foodEditor(S, sc, kind, t, everyone, key, why) {
    var conf = S.ui.confirm, typed = kind === "hard" || kind === "soft", stopAsk = conf === "stop:" + key, softAsk = conf === "soft:" + key;
    var said = '<p class="said"><q>' + esc((S.said || {})[t] || (kind === "hard" ? "Never " + t.toLowerCase() : kind === "soft" ? "Rather not " + t.toLowerCase() : kind === "like" ? "I like " + t.toLowerCase() : t)) + "</q></p>";
    var seg = typed ? '<div class="tseg" role="radiogroup" aria-label="Hard or soft"><button type="button" role="radio" aria-checked="' + (kind === "hard") + '" data-a="ftype:' + esc(key) + ':hard">' + LOCKI + ' Hard</button><button type="button" role="radio" aria-checked="' + (kind === "soft") + '" data-a="ftype:' + esc(key) + ':soft">' + UNLOCKI + " Soft</button></div>" +
      '<p class="sm conseq">' + (kind === "hard" ? "Never suggested." : "Ranked lower.") + "</p>" : "";
    var soft = softAsk ? confirmHtml("Make " + t + " soft?", "It can come back.", '<button type="button" class="pbtn danger" data-a="do:soft:' + esc(key) + '">Make soft</button><button type="button" class="pbtn" data-a="keep">Keep hard</button>') : "";
    var reason = typed ? '<label class="fl" for="why-' + esc(t) + '">Reason</label><input id="why-' + esc(t) + '" class="in boxed" data-in="why:' + esc(t) + '" maxlength="200" placeholder="Optional" autocomplete="off" value="' + esc(why) + '">' : "";
    var stop = stopAsk ? confirmHtml("Stop remembering " + t + "?", kind === "hard" ? "It can be suggested again." : "", '<button type="button" class="pbtn danger" data-a="do:stop:' + esc(key) + '">Stop</button><button type="button" class="pbtn" data-a="keep">Keep</button>') : '<button type="button" class="dng plain" data-a="' + (kind === "hard" ? "ask:stop:" : "do:stop:") + esc(key) + '">Stop remembering</button>';
    return '<div class="ped">' + said + seg + soft + reason + stop + '<p class="sm">Change it: tell your assistant.</p></div>';
  }
  function foodGroup(S, scope, title, add, rows, eg) {
    return '<p class="hd2 fh">' + title + '</p><ul class="list flist"><li class="fadd-li"><button type="button" class="fadd" data-a="toast:Tell your assistant, e.g. &ldquo;' + eg + '&rdquo;." aria-label="' + esc(add) + '">' + ic("plus", 18) + "Add</button></li>" + rows + "</ul>";
  }
  function foodBlock(S, scope) {
    var f = S.food[scope], hh = S.food.hh, row = function (sc, k, t, kind, ev) { return foodRow(S, sc, kind, t, ev); };
    var avoids = (scope === "me" ? hh.hard.map(function (t) { return row("hh", "hard", t, "hard", true); }).join("") : "") + f.hard.map(function (t) { return row(scope, "hard", t, "hard", scope === "hh"); }).join("") + (scope === "me" ? hh.soft.map(function (t) { return row("hh", "soft", t, "soft", true); }).join("") : "") + f.soft.map(function (t) { return row(scope, "soft", t, "soft", scope === "hh"); }).join("");
    var likes = f.like.map(function (t) { return row(scope, "like", t, "like", scope === "hh"); }).join("");
    var swaps = f.swap.map(function (t) { return row(scope, "swap", t, "swap", scope === "hh"); }).join("");
    var me = scope === "me";
    return '<p class="hd2">Food</p>' + foodGroup(S, scope, "Avoids", "Add something to avoid", avoids, me ? "never peanuts" : "we never have peanuts") + foodGroup(S, scope, "Likes", "Add something you like", likes, me ? "I like mushrooms" : "we love lemon") + foodGroup(S, scope, "Swaps", "Add a swap", swaps, "use sourdough for white bread");
  }
  function notesBlock(S, scope) {
    var priv = scope === "me";
    return '<div class="blk"><label class="fl" for="note-' + scope + '"><b class="nm">Assistant notes</b><span class="fscope" title="' + (priv ? "Only you and your assistant read this" : "Everyone&rsquo;s assistant reads this") + '">' + (priv ? ic("one", 16) : ic("many", 16)) + '<span class="vh">' + (priv ? "Only you and your assistant read this" : "Everyone&rsquo;s assistant reads this") + '</span></span></label><textarea id="note-' + scope + '" class="in ta" rows="2" data-in="note:' + scope + '" placeholder="Anything to know">' + esc(S.notes[scope]) + "</textarea></div>";
  }
  function housematesRows(S) {
    return '<p class="hd2">Housemates</p><ul class="list">' + S.people.map(function (p) {
      var n = p.food.hard.length + p.food.soft.length + p.food.like.length, id = "hm:" + p.id, open = S.ui.open[id];
      var chips = ["hard", "soft", "like"].map(function (k) { return p.food[k].map(function (t) { return '<span class="cp lock" data-user>' + esc((k === "hard" ? "Never " : k === "soft" ? "Rather not " : "Likes ") + t) + "</span>"; }).join(""); }).join("");
      var sub = p.waiting ? p.waiting + " waiting" : "";
      return '<li class="prow"><button type="button" class="rb" data-a="open:' + id + '" aria-expanded="' + !!open + '">' + discHtml(p.name, p.pic, "s") + '<span class="rm"><span class="nm" data-user>' + esc(p.name) + "</span>" + (sub ? '<span class="sub">' + sub + "</span>" : "") + "</span>" + chev() + "</button>" +
        (open ? '<div class="exp">' + (chips ? '<div class="cps">' + chips + "</div>" : "") + '<button type="button" class="pbtn wide" data-a="toast:Suggest opens a short form (as built today).">Suggest for ' + esc(p.name) + "</button></div>" : "") + "</li>";
    }).join("") + "</ul>";
  }
  function rulesBlock(S) {
    var open = S.ui.open.rules;
    return '<li class="prow"><button type="button" class="rb" data-a="open:rules" aria-expanded="' + !!open + '"><span class="nm">Place rules</span><span class="val">' + S.rules.length + "</span>" + chev() + "</button>" +
      (open ? '<div class="exp">' + S.rules.map(function (r, i) { return '<div class="crow"><div class="top"><span class="rm"><b class="nm" data-user>' + esc(r.t) + '</b><span class="sub">' + esc(r.v) + '</span></span><button type="button" class="ibtn2" data-a="rulerm:' + i + '" aria-label="Remove ' + esc(r.t) + '" title="Remove">' + ic("trash", 20) + '</button></div></div>'; }).join("") +
        '<button type="button" class="pbtn wide" data-a="sheet:rule">Add rule</button></div>' : "") + "</li>";
  }

  /* ---------- people, invite, leave ---------- */
  function peopleRows(S) {
    var all = [{ id: "me", name: S.me.name, pic: S.me.pic, admin: S.me.admin, you: true }].concat(S.people);
    return all.map(function (p) {
      var open = S.ui.open["p:" + p.id], conf = S.ui.confirm === "rm:" + p.id;
      var adm = p.admin ? '<span class="val adm" title="Admin">' + ic("shield", 20) + '<span class="vh">Admin</span></span>' : "";
      var row = '<button type="button" class="rb" data-a="' + (p.you ? "go:you" : "open:p:" + p.id) + '"' + (p.you ? "" : ' aria-expanded="' + !!open + '"') + ">" + discHtml(p.name, p.pic, "s") + '<span class="rm"><span class="nm" data-pn="' + p.id + '" data-user>' + esc(p.name) + "</span>" + (p.you ? '<span class="sub">You</span>' : "") + "</span>" + adm + chev() + "</button>";
      var exp = !p.you && open ? '<div class="exp"><div class="crow"><div class="top"><span class="rm"><b class="nm">Admin</b></span>' + sw("adm:" + p.id, p.admin, "Admin: " + p.name) + "</div></div>" +
        (conf ? confirmHtml("Remove " + p.name + "?", "They lose access.", '<button type="button" class="pbtn danger" data-a="do:rm:' + p.id + '">Remove ' + esc(p.name) + '</button><button type="button" class="pbtn" data-a="keep">Keep</button>') : '<button type="button" class="dng plain" data-a="ask:rm:' + p.id + '">Remove ' + esc(p.name) + "</button>") + "</div>" : "";
      return '<li class="prow">' + row + exp + "</li>";
    }).join("") + S.pending.map(function (v) { return '<li class="prow"><div class="rline">' + discHtml("", "✉", "s dash") + '<span class="rm"><span class="nm">Invite</span><span class="sub">' + v.left + ' days</span></span><button type="button" class="lnk" data-a="cancelinv:' + v.id + '">Cancel</button></div></li>'; }).join("");
  }
  function confirmHtml(t, sub, btns) { return '<div class="conf" role="group" aria-label="' + esc(t) + '"><p><b>' + esc(t) + "</b>" + (sub ? " " + esc(sub) : "") + '</p><div class="btns">' + btns + "</div></div>"; }
  function inviteBlock(S, bare) {
    var join = S.kind === "join";
    var link = S.link ? '<p class="link"><b>' + esc(S.link) + "</b><span>" + (join ? "One use &middot; 48 hours" : "One use &middot; their own household") + "</span></p>" : "";
    return '<div class="invite2">' + tseg("Who the invite is for", [["join", "Join us"], ["own", "Their own"]], S.kind, "kind") +
      '<button type="button" class="pbtn go wide" data-a="copy">' + ic(S.link ? "check" : "copy", 18) + " " + (S.link ? "Copied" : "Copy link") + "</button>" + link + "</div>";
  }
  function leaveBlock(S) {
    if (S.ui.confirm !== "leave") return '<div class="blk"><button type="button" class="dng plain" data-a="ask:leave">Leave household</button></div>';
    var ok = S.ui.leaveTyped.trim().toLowerCase() === S.me.name.trim().toLowerCase();
    return '<div class="blk">' + confirmHtml("Leave " + S.hh + "?", "You lose its pantry, shopping and recipes. Only an invite brings you back.",
      '<label class="sm" for="lv" style="flex:1 1 100%">Type your name</label><input id="lv" class="in" data-in="leave" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(S.me.name) + '" style="flex:1 1 100%;min-height:max(44px,2.9em)" value="' + esc(S.ui.leaveTyped) + '"><button type="button" class="pbtn danger" data-a="do:leave" aria-disabled="' + !ok + '"' + (ok ? "" : ' tabindex="-1"') + ">Leave</button><button type=\"button\" class=\"pbtn\" data-a=\"keep\">Stay</button>") + "</div>";
  }

  function historyRow() { return '<ul class="list"><li class="prow"><button type="button" class="rb" data-a="toast:History is its own screen."><i class="lead" aria-hidden="true">' + ic("clock", 20) + '</i><span class="nm">History</span>' + chev() + '</button></li></ul>'; }

  /* ---------- you ---------- */
  function youTop(S) {
    return '<div class="you-top"><button type="button" class="big-av" data-a="avopen" aria-expanded="' + !!S.ui.avopen + '" aria-label="Change your picture"><span data-myav>' + esc(S.me.pic || initialOf(S.me.name)) + '</span><i class="edb" aria-hidden="true">' + ic("pencil", 16) + "</i></button></div>" +
      (S.ui.avopen ? '<div class="avrow" role="group" aria-label="Pictures">' + [""].concat(AV).map(function (a) { return '<button type="button" data-a="pic:' + (a ? AV.indexOf(a) : "x") + '" aria-pressed="' + (S.me.pic === a) + '" aria-label="' + (a ? "Picture " + (AV.indexOf(a) + 1) : "Your initial") + '">' + esc(a || initialOf(S.me.name)) + "</button>"; }).join("") + "</div>" : "");
  }
  function nameField(S) { return '<label class="field"><span class="fl">Name</span><input class="in" data-in="myname" value="' + esc(S.me.name) + '" maxlength="40" autocomplete="off" aria-label="Your name"></label>'; }
  function roleBlock(S) {
    var open = S.ui.open.role;
    return '<div class="blk"><button type="button" class="rb" style="padding:0;min-height:var(--t)" data-a="open:role" aria-expanded="' + !!open + '"><span class="nm">Role</span><span class="val">' + esc(S.me.role) + "</span>" + chev() + "</button>" +
      (open ? '<div class="rolechips" role="radiogroup" aria-label="Kitchen role">' + ROLES.map(function (r) { return '<button type="button" role="radio" class="cp" data-user aria-checked="' + (S.me.role === r) + '" aria-expanded="' + (S.me.role === r) + '" data-a="role:' + ROLES.indexOf(r) + '">' + esc(r) + "</button>"; }).join("") + "</div>" : "") + "</div>";
  }
  function accountRows(S, withOut) {
    var lead = function (n) { return '<i class="lead" aria-hidden="true">' + ic(n, 20) + "</i>"; };
    return '<ul class="list mrows"><li class="prow"><button type="button" class="rb" data-a="toast:Downloads your inventory as a spreadsheet.">' + lead("download") + '<span class="nm">Download my data</span>' + chev() + "</button></li>" +
      (S.installable ? '<li class="prow"><button type="button" class="rb" data-a="toast:Adds Kitchie to your home screen.">' + lead("install") + '<span class="nm">Install app</span>' + chev() + "</button></li>" : "") +
      (withOut ? '<li class="prow"><button type="button" class="rb danger" data-a="toast:Signed out (mockup).">' + lead("signout") + '<span class="nm">Sign out</span></button></li>' : "") + "</ul>";
  }

  /* ---------- kitchen: categories, locations and spots, samples, assistants ---------- */
  function catsBlock(S) { return '<div class="blk"><b class="nm">Categories</b>' + chipList(S, "cats", S.cats, []) + "</div>"; }
  function locsBlock(S) {
    return '<div class="blk"><b class="nm">Locations and spots</b>' + S.areas.map(function (a, i) {
      return '<div class="area"><div class="an" data-user><span>' + esc(a.n) + "</span></div>" + chipList(S, "areas." + i + ".spots", a.spots, []) + "</div>";
    }).join("") + '<div class="cps"><button type="button" class="cp add" data-a="toast:Adds a place (name it, then add spots).">' + ic("plus", 16) + " Add place</button></div></div>";
  }
  function samplesRow(S) {
    if (!S.samples) return "";
    return '<div class="crow"><div class="top"><span class="rm"><b class="nm">' + pl(S.samples, 'sample item') + '</b></span><button type="button" class="pbtn" data-a="clear:samples">Clear</button></div></div>';
  }
  /* Assistants: a name, a dot and ONE button. The dot is a ring (not connected) or a filled disc with a tick (connected): shape, not only colour. Connect is the accent button; Disconnect asks in place.
     With two or more connected a star marks the default (a star button, pressed = default). No "Connected" twice, no "the default" sentence. */
  function dot(on, label) { return '<i class="cdot' + (on ? " on" : "") + '" role="img" aria-label="' + label + '">' + (on ? ic("check", 14) : "") + "</i>"; }
  function assistRow(S, a) {
    var conn = ASSISTS.filter(function (x) { return S.ai[x[0]]; }).length;
    var on = S.ai[a[0]], dis = S.ui.confirm === "ai:" + a[0];
    var star = on && conn > 1 ? '<button type="button" class="ibtn2 star" data-a="dflt:' + a[0] + '" aria-pressed="' + (S.dflt === a[0]) + '" aria-label="Use ' + a[1] + ' by default" title="Default">' + ic("star", 22) + "</button>" : "";
    var act = on ? '<button type="button" class="pbtn" data-a="ask:ai:' + a[0] + '">Disconnect</button>' : '<button type="button" class="pbtn go" data-a="ai:' + a[0] + '">Connect</button>';
    var more = on && dis ? '<div class="exp">' + confirmHtml("Disconnect " + a[1] + "?", "It stops seeing your kitchen.", '<button type="button" class="pbtn danger" data-a="do:ai:' + a[0] + '">Disconnect</button><button type="button" class="pbtn" data-a="keep">Keep</button>') + "</div>" : "";
    return '<div class="arow-wrap"><div class="arow"><span class="nm">' + a[1] + "</span>" + dot(on, on ? "Connected" : "Not connected") + star + act + "</div>" + more + "</div>";
  }
  function linkRow(S) {
    var lk = S.link, rev = S.ui.confirm === "revoke";
    return '<div class="arow"><span class="nm">My own link</span>' + dot(!!lk, lk ? "Active" : "Not made") + (lk ? '<button type="button" class="pbtn" data-a="ask:revoke">Revoke</button>' : '<button type="button" class="pbtn go" data-a="link:make">Make link</button>') + "</div>" +
      (rev ? '<div class="exp">' + confirmHtml("Revoke your link?", "Every assistant using it loses access.", '<button type="button" class="pbtn danger" data-a="do:revoke">Revoke</button><button type="button" class="pbtn" data-a="keep">Keep</button>') + "</div>" : "");
  }
  function assistRows(S) { return ASSISTS.map(function (a) { return assistRow(S, a); }).join("") + linkRow(S) + '<p class="sm foot">Assistants act as you and see your whole household.</p>'; }

  /* ---------- the sheet for a rule (the scoped picker as a sheet) ---------- */
  function ruleSheet(S) {
    var r = S.ui.rule;
    return '<div class="blk"><b class="nm">Applies to</b>' + tseg("Applies to", [["Item", "Item"], ["Category", "Category"], ["Place", "Place"]], r.what, "rwhat") + "</div>" +
      '<div class="blk"><b class="nm">Level</b>' + tseg("Level", [["Low", "Low"], ["Out", "Out"]], r.lvl, "rlvl") + "</div>" +
      '<div class="blk"><b class="nm">How often</b>' + tseg("How often", [["Daily", "Daily"], ["Weekly", "Weekly"], ["Monthly", "Monthly"]], r.often, "roft") + "</div>" +
      '<div class="blk"><button type="button" class="pbtn go wide" data-a="ruleadd">Add rule</button></div>';
  }

  /* ============================================================ the phone ============================================================ */
  var phones = [], scale = 0, DIRS = {};
  function scaleVars(n) { var p = { "0": 0, "3": 30 }[n] || 0, s = 1 + p / 100, h = Math.max(0.88, Math.min(1.15, 1 + (s - 1) / 2)); return { ts: s, hk: h / s }; }
  function applyScale(ph) { var v = scaleVars(scale); ph.el.style.setProperty("--ts", v.ts); ph.el.style.setProperty("--hk", v.hk); ph.el.style.setProperty("--hs", v.ts === 1 ? 1 : 1 + (v.ts - 1) / 2); }
  function setScale(n) { scale = n; phones.forEach(applyScale); }
  function pickTheme(id) { var b = document.createElement("button"); b.hidden = true; b.setAttribute("data-theme-pick", id); document.body.appendChild(b); b.click(); b.remove(); }

  function Phone(host, opts) {
    var ph = this; opts = opts || {};
    ph.o = opts.o || "A"; ph.S = fresh(); ph.page = "front"; ph.stack = []; ph.last = {}; ph.noClick = 0;
    ph.el = document.createElement("div"); ph.el.className = "phone"; ph.el.setAttribute("data-o", ph.o);
    ph.el.innerHTML = '<header class="hd"><button type="button" class="bk" data-a="back"></button><h2 class="ttl"></h2><button type="button" class="ibtn" data-a="toast:Search works from here as in the chosen design." aria-label="Search settings">' + ic("search", 22) + "</button></header>" +
      '<div class="bd" data-bd></div><div class="sheet" hidden></div><div class="toast" role="status" aria-live="polite" hidden></div>';
    host.appendChild(ph.el); ph.bd = $("[data-bd]", ph.el); ph.sheetEl = $(".sheet", ph.el);
    phones.push(ph); applyScale(ph);
    ph.el.addEventListener("click", function (ev) {
      if (Date.now() < ph.noClick) { ev.stopPropagation(); ev.preventDefault(); return; }
      var c = ev.target.closest("[data-ctl]"), now = Date.now(), L = ph.last.tap;
      if (L && now - L.t < 340 && Math.abs(ev.clientX - L.x) < 26 && Math.abs(ev.clientY - L.y) < 52) { ph.last.tap = null; ev.stopPropagation(); ev.preventDefault(); ph.reset(L.k); return; }
      ph.last.tap = c && ph.el.contains(c) ? { k: c.getAttribute("data-ctl"), t: now, x: ev.clientX, y: ev.clientY } : null;
    }, true);
    ph.el.addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-a]"); if (!t || !ph.el.contains(t) || t.type === "checkbox") return;
      ph.act(t.getAttribute("data-a"), t);
    });
    ph.el.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t.type === "checkbox" && t.hasAttribute("data-a")) { ph.act(t.getAttribute("data-a"), t); return; }
      if (t.type === "time") { ph.timeSet(t.getAttribute("data-in"), t.value); }
    });
    ph.el.addEventListener("input", function (ev) {
      var t = ev.target, k = t.getAttribute && t.getAttribute("data-in"); if (!k) return;
      var S = ph.S;
      if (k === "hhname") S.hh = t.value || "Our kitchen";
      else if (k === "myname") { S.me.name = t.value || "Alex"; if (!S.me.pic) $$("[data-myav]", ph.el).forEach(function (n) { n.textContent = initialOf(S.me.name); }); $$("[data-pn=me]", ph.el).forEach(function (n) { n.textContent = S.me.name; }); $$("[data-metk]", ph.el).forEach(function (n) { n.textContent = S.me.name; }); }
      else if (k.indexOf("note:") === 0) S.notes[k.slice(5)] = t.value;
      else if (k.indexOf("why:") === 0) S.why[k.slice(4)] = t.value;
      else if (k === "leave") { S.ui.leaveTyped = t.value; var b = $("[data-a='do:leave']", ph.el); if (b) { var ok = t.value.trim().toLowerCase() === S.me.name.trim().toLowerCase(); b.setAttribute("aria-disabled", String(!ok)); b.tabIndex = ok ? 0 : -1; } }
    });
    ph.el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && ev.target.getAttribute && ev.target.getAttribute("data-in") === "chipin") { ev.preventDefault(); ph.chipSave(); }
      if (ev.key === "Escape" && ph.S.ui.sheet) { ph.shut(); }
    });
    ph.draw();
  }
  var Pp = Phone.prototype;
  Pp.toast = function (m) { var t = $(".toast", this.el); t.textContent = m; t.hidden = false; clearTimeout(this._t); this._t = setTimeout(function () { t.hidden = true; }, 2600); };
  Pp.dir = function () { return DIRS[this.o]; };
  Pp.goPage = function (p) { this.page = p; this.S.ui.dr = null; this.S.ui.chip = null; this.S.ui.confirm = null; this.draw(); this.bd.scrollTop = 0; };
  Pp.go = function (p) { this.stack.push(this.page); this.goPage(p); };
  Pp.back = function () {
    var d = this.dir(), pg = d.pages[this.page];
    if (this.S.ui.sheet) { this.shut(); return; }
    var to = pg.back;
    if (!to) { this.toast("Back to the app (mockup)."); return; }
    this.stack = []; this.goPage(to);
  };
  Pp.draw = function () {
    var ph = this, d = ph.dir(), pg = d.pages[ph.page], S = ph.S, top = ph.bd.scrollTop;
    ph.el.setAttribute("data-page", ph.page); ph.el.setAttribute("data-searching", "false");
    $(".ttl", ph.el).textContent = pg.title;
    var bk = $(".bk", ph.el); bk.innerHTML = ic("back", 22) + "<span>" + esc(pg.backLabel) + "</span>"; bk.setAttribute("aria-label", "Back to " + pg.backLabel);
    $("[data-a^='toast:Search']", ph.el).hidden = ph.page === "front";
    ph.bd.innerHTML = pg.render(ph);
    ph.bd.scrollTop = top;
    ph.drawSheet();
  };
  Pp.drawSheet = function () {
    var ph = this, S = ph.S, sh = S.ui.sheet, el = ph.sheetEl;
    if (!sh) { el.hidden = true; el.innerHTML = ""; return; }
    var d = ph.dir(), body = d.sheet(ph, sh);
    el.innerHTML = '<button type="button" class="scrim" data-a="shut" aria-label="Close"></button><div class="sh" role="dialog" aria-modal="true" aria-label="' + esc(body.title) + '"><div class="shh"><h3 class="ttl">' + esc(body.title) + '</h3><button type="button" class="pbtn go" data-a="shut">Done</button></div><div class="shb">' + body.html + "</div></div>";
    el.hidden = false;
  };
  Pp.shut = function () { this.S.ui.sheet = null; this.S.ui.chip = null; this.S.ui.confirm = null; this.drawSheet(); this.draw(); };
  Pp.chipSave = function () {
    var S = this.S, c = S.ui.chip; if (!c || !c.add) return;
    var inp = $("[data-in=chipin]", this.el), v = inp ? inp.value.trim() : ""; if (!v) { this.toast("Type a word first."); return; }
    var arr = get(S, c.path); arr.push(v); S.ui.chip = null; this.redraw();
  };
  Pp.redraw = function () { this.draw(); };
  Pp.reset = function (k) {
    var S = this.S, sc = this.scopeFor(); if (sc !== "me") return;
    if (k === "all") { S.d.me.ask = null; S.d.me.q = null; S.d.me.cap = null; this.redraw(); this.toast("Back to the household\u2019s settings."); return; }
    if (S.d.me[k] == null) return;
    S.d.me[k] = null; this.redraw(); this.toast("Back to " + (S.d.hh[k] != null ? "the household’s" : "Kitchie’s own") + " setting.");
  };
  Pp.act = function (a, el) {
    var ph = this, S = ph.S, ui = S.ui, p = a.split(":"), sc = ph.scopeFor();
    switch (p[0]) {
      case "back": ph.back(); return;
      case "go": ph.go(p[1]); return;
      case "shut": ph.shut(); return;
      case "toast": ph.toast(a.slice(6)); return;
      case "sheet": ui.sheet = p[2] ? { t: p[1], id: p[2] } : { t: p[1] }; ph.draw(); var bt = $(".sheet .pbtn.go", ph.el); if (bt) bt.focus({ preventScroll: true }); return;
      case "open": var id = p.slice(1).join(":"); ui.open[id] = !ui.open[id]; ui.confirm = null; ph.redraw(); return;
      case "scope": S.scope = p[1]; ph.redraw(); return;
      case "tog": if (p[1] === "ask") { S.d[sc].ask = el.checked; ph.redraw(); } return;
      case "step": var cur = eff(S, sc, "cap"); S.d[sc].cap = Math.max(1, Math.min(20, cur + (+p[2]))); ph.redraw(); return;
      case "reset": ph.reset(p[1]); return;
      case "qnone": var q = eff(S, sc, "q"); S.d[sc].q = q === "none" ? { s: S.d.hh.q.s, e: S.d.hh.q.e } : "none"; ph.redraw(); return;
      case "chip": var path = p[1], i = +p[2]; ui.chip = ui.chip && ui.chip.path === path && ui.chip.i === i ? null : { path: path, i: i }; ph.redraw(); return;
      case "chipadd": ui.chip = { path: p[1], add: true }; ph.redraw(); var inp = $("[data-in=chipin]", ph.el); if (inp) inp.focus({ preventScroll: true }); return;
      case "chipsave": ph.chipSave(); return;
      case "chipdone": ui.chip = null; ph.redraw(); return;
      case "chiprm": var c = ui.chip, arr = get(S, c.path), gone = arr.splice(c.i, 1)[0]; ui.chip = null; ph.redraw(); ph.toast("Removed " + gone + "."); return;
      case "ask": ui.confirm = p.slice(1).join(":"); if (p[1] === "rm") ui.open["p:" + p[2]] = true; ph.redraw(); return;
      case "keep": ui.confirm = null; ph.redraw(); return;
      case "do":
        if (p[1] === "stop") { ph.foodStop(a.slice(8)); return; }
        if (p[1] === "soft") { ph.foodMove(a.slice(8), "soft"); return; }
        if (p[1] === "rm") { var who = S.people.filter(function (x) { return x.id === p[2]; })[0]; S.people = S.people.filter(function (x) { return x.id !== p[2]; }); ui.confirm = null; ph.afterRemove(); ph.toast("Removed " + who.name + "."); return; }
        if (p[1] === "leave") { ui.confirm = null; ph.redraw(); ph.toast("You would leave " + S.hh + " (mockup)."); return; }
        if (p[1] === "ai") { S.ai[p[2]] = false; if (S.dflt === p[2]) S.dflt = ASSISTS.map(function (x) { return x[0]; }).filter(function (x) { return S.ai[x]; })[0] || ""; ui.confirm = null; ph.redraw(); ph.toast(aname(p[2]) + " is disconnected."); return; }
        if (p[1] === "revoke") { S.link = false; ui.confirm = null; ph.redraw(); ph.toast("Your link is revoked."); return; }
        return;
      case "adm": var pr = S.people.filter(function (x) { return x.id === p[1]; })[0]; if (pr) { pr.admin = el.checked; ph.toast(pr.name + (pr.admin ? " is an admin." : " is not an admin.")); } ph.redraw(); return;
      case "kind": S.kind = p[1]; S.link = null; ph.redraw(); return;
      case "copy": S.link = "kitchie.app/join/" + (S.kind === "join" ? "K7QX-2M9P" : "N3RT-8W4Z"); try { if (navigator.clipboard) navigator.clipboard.writeText("https://" + S.link).catch(function () { /* the link is still shown */ }); } catch (e) { /* shown anyway */ } ph.redraw(); ph.toast("Invite link copied."); return;
      case "cancelinv": S.pending = S.pending.filter(function (x) { return x.id !== p[1]; }); ph.afterRemove(); ph.toast("Invite cancelled."); return;
      case "avopen": ui.avopen = !ui.avopen; ph.redraw(); return;
      case "pic": S.me.pic = p[1] === "x" ? "" : AV[+p[1]]; ph.redraw(); return;
      case "role": S.me.role = ROLES[+p[1]]; ph.redraw(); return;
      case "ai": S.ai[p[1]] = true; if (!S.dflt) S.dflt = p[1]; ph.redraw(); ph.toast(aname(p[1]) + " opens to finish connecting (mockup). Connected."); return;
      case "dflt": S.dflt = p[1]; ph.redraw(); ph.toast(aname(p[1]) + " is the default."); return;
      case "ftype": ph.foodType(a.slice(6)); return;
      case "link": S.link = true; ph.redraw(); ph.toast("Your link is made. It is shown once."); return;
      case "clear": S.samples = 0; ph.redraw(); ph.toast("Sample items cleared."); return;
      case "rulerm": S.rules.splice(+p[1], 1); ph.redraw(); return;
      case "rwhat": ui.rule.what = p[1]; ph.drawSheet(); return;
      case "rlvl": ui.rule.lvl = p[1]; ph.drawSheet(); return;
      case "roft": ui.rule.often = p[1]; ph.drawSheet(); return;
      case "ruleadd": S.rules.push({ t: ui.rule.what + " rule", v: ui.rule.lvl + ", " + ui.rule.often.toLowerCase() }); ph.shut(); ph.toast("Rule added."); return;
      case "tk":
        var tid = a.slice(3); ui.dr = ui.dr === tid ? null : tid; ui.chip = null; ui.confirm = null;
        if (tid === "invite" && ui.dr === "invite" && !S.link) { S.link = "kitchie.app/join/" + (S.kind === "join" ? "K7QX-2M9P" : "N3RT-8W4Z"); try { if (navigator.clipboard) navigator.clipboard.writeText("https://" + S.link).catch(function () { /* shown anyway */ }); } catch (e) { /* shown anyway */ } ph.redraw(); ph.toast("Invite link copied."); return; }
        if (tid === "ask") { ui.dr = null; S.d[sc].ask = !eff(S, sc, "ask"); ph.redraw(); return; }
        ph.redraw(); return;
    }
  };
  /* food rows: key is scope.kind:text (the row's key); Hard to Soft asks once, Soft to Hard does not; Stop removes the rule */
  function foodKey(key) { var m = /^(me|hh)\.(hard|soft|like|swap):(.*)$/.exec(key); return m ? { sc: m[1], kind: m[2], t: m[3] } : null; }
  Pp.foodMove = function (key, to) {
    var k = foodKey(key), f = k && this.S.food[k.sc]; if (!f) return;
    f[k.kind].splice(f[k.kind].indexOf(k.t), 1); f[to].push(k.t); this.S.ui.confirm = null;
    delete this.S.ui.open["food:" + key]; this.S.ui.open["food:" + k.sc + "." + to + ":" + k.t] = true; this.redraw();
  };
  Pp.foodType = function (rest) {
    var i = rest.lastIndexOf(":"), key = rest.slice(0, i), to = rest.slice(i + 1), k = foodKey(key); if (!k || k.kind === to) return;
    if (to === "soft") { this.S.ui.confirm = "soft:" + key; this.redraw(); return; }
    this.foodMove(key, to);
  };
  Pp.foodStop = function (key) {
    var k = foodKey(key), f = k && this.S.food[k.sc]; if (!f) return;
    f[k.kind].splice(f[k.kind].indexOf(k.t), 1); this.S.ui.confirm = null; delete this.S.ui.open["food:" + key]; this.redraw(); this.toast("Stopped remembering " + k.t + ".");
  };
  Pp.afterRemove = function () { if (this.S.ui.sheet && this.S.ui.sheet.t === "face") this.S.ui.sheet = null; this.redraw(); };

  /* ---------- the front: drawn static and inert (the chosen design), with the rows each direction leaves ---------- */
  function frontStatic() {
    var segs = ""; for (var i = -3; i <= 3; i++) segs += '<button type="button" class="seg' + (i === 0 ? " on mid" : "") + '" tabindex="-1"><i></i></button>';
    return '<button type="button" class="looksrow" inert><i class="lead" aria-hidden="true">' + ic("looks", 20) + '</i><span class="nm">Looks</span><span class="val">Kitchie Night</span>' + chev() + "</button>" +
      '<div class="pins" data-n="2" inert aria-hidden="true"><div class="pin"><div class="ctrl small"><span class="clab"><b>Text size</b><span class="cval">Match my phone</span></span><div class="ts"><div class="bat">' + segs + '</div></div></div></div>' +
      '<div class="pin"><div class="ctrl theme small"><span class="clab"><b>Theme</b></span><div class="tline"><div class="rot"><div class="rtrack"><div class="rit cur" style="--pbg:var(--bg);--pcd:var(--surface);--pac:var(--accent);--pfg:var(--fg)"><span class="rcard"><b>Kitchie Night</b><i aria-hidden="true"></i></span></div></div></div></div></div></div></div>';
  }
  function navRow(pg, label, v, icon, vhtml) { return '<li class="prow"><button type="button" class="rb" data-a="go:' + pg + '"><i class="lead" aria-hidden="true">' + ic(icon, 20) + '</i><span class="nm">' + esc(label) + "</span>" + (vhtml ? '<span class="val">' + vhtml + "</span>" : v ? '<span class="val">' + esc(v) + "</span>" : "") + chev() + "</button></li>"; }
  function frontPage(rows) {
    return function (ph) {
      return '<div class="sb"><button type="button" class="find" data-a="toast:Search works from here as in the chosen design." aria-label="Search settings">' + ic("search", 20) + "<span>Search settings</span></button></div>" + frontStatic() + '<ul class="list main">' + rows(ph.S) + "</ul>";
    };
  }
  /* ---------- the profile menu: your face, Settings, History, Sign out. Preferences, Me and Household are no longer repeated here (they are on Settings) ---------- */
  function menuPage(opens) {
    return function (ph) {
      var S = ph.S, hd = '<button type="button" class="mhead" data-a="' + opens + '"><span class="av" aria-hidden="true">' + esc(S.me.pic || initialOf(S.me.name)) + '</span><span class="rm"><span class="nm">' + esc(S.me.name) + '</span><span class="sub">' + esc(S.me.role) + ", " + esc(S.hh) + "</span></span>" + chev() + "</button>";
      var start = '<div class="start"><span class="rm"><span class="nm">Invite someone</span></span><button type="button" class="pbtn go" data-a="copy">' + ic(S.link ? "check" : "copy", 16) + " " + (S.link ? "Copied" : "Copy link") + "</button></div>";
      return hd + start + '<ul class="list mrows"><li class="prow"><button type="button" class="rb" data-a="go:front"><i class="lead" aria-hidden="true">' + ic("sliders", 20) + '</i><span class="nm">Settings</span>' + chev() + '</button></li><li class="prow"><button type="button" class="rb" data-a="toast:History is its own screen."><i class="lead" aria-hidden="true">' + ic("pot", 20) + '</i><span class="nm">History</span>' + chev() + '</button></li><li class="prow"><button type="button" class="rb danger" data-a="toast:Signed out (mockup)."><span class="nm">Sign out</span></button></li></ul>';
    };
  }

  /* ============================================================ A. Flat pages ============================================================ */
  DIRS.A = {
    name: "Flat pages",
    pages: {
      menu: { title: "", back: null, backLabel: "the app", render: menuPage("go:you") },
      front: { title: "Settings", back: null, backLabel: "the app", render: frontPage(function (S) { return navRow("household", "Household", S.hh, "home") + navRow("prefs", "Preferences", "Quiet " + quietText(eff(S, "me", "q")), "sliders") + navRow("kitchen", "Kitchen setup", ASSISTS.filter(function (a) { return S.ai[a[0]]; }).map(function (a) { return a[1]; }).join(", ") + " connected", "pot"); }) },
      household: { title: "Household", back: "front", backLabel: "Settings", render: function (ph) { var S = ph.S;
        return '<label class="field"><span class="fl">Name</span><input class="in" data-in="hhname" value="' + esc(S.hh) + '" maxlength="40" autocomplete="off" aria-label="Household name"></label><ul class="list people">' + peopleRows(S) + "</ul>" + inviteBlock(S) + historyRow(); } },
      you: { title: "You", back: "household", backLabel: "Household", render: function (ph) { var S = ph.S; return youTop(S) + nameField(S) + roleBlock(S) + accountRows(S, true) + leaveBlock(S); } },
      prefs: { title: "Preferences", back: "front", backLabel: "Settings", render: function (ph) { var S = ph.S, sc = S.scope;
        return '<div class="blk">' + tseg("Whose preferences", [["me", "Mine"], ["hh", "Everyone"]], sc, "scope") + "</div>" + dialsRows(S, sc) + foodBlock(S, sc) + notesBlock(S, sc) +
          (sc === "me" ? housematesRows(S) : "") + '<ul class="list">' + rulesBlock(S) + "</ul>"; } },
      kitchen: { title: "Kitchen setup", back: "front", backLabel: "Settings", render: function (ph) { var S = ph.S;
        return catsBlock(S) + locsBlock(S) + samplesRow(S) + '<div class="blk" style="padding-bottom:0"><b class="nm">Assistants</b></div>' + assistRows(S); } }
    },
    sheet: function (ph, sh) { return sh.t === "rule" ? { title: "Add a rule", html: ruleSheet(ph.S) } : { title: "", html: "" }; },
    screens: [["menu", "Profile menu"], ["front", "Settings front (as decided)"], ["household", "Household"], ["household+invite", "Household, invite copied"], ["you", "You"], ["prefs", "Preferences, mine"], ["prefs+hh", "Preferences, everyone"], ["kitchen", "Kitchen setup and Assistants"]]
  };

  /* ============================================================ B. One note ============================================================ */
  function tk(id, text, ph, extra, attrs) { var open = ph.S.ui.dr === id; return '<button type="button" class="tk' + (extra ? " " + extra : "") + '" data-a="tk:' + esc(id) + '"' + (attrs || "") + ' aria-expanded="' + open + '">' + text + "</button>"; }
  function drawer(ph, ids, html) { var cur = ph.S.ui.dr; return cur && ids.indexOf(cur) > -1 ? '<div class="dr" role="group">' + html + '<button type="button" class="lnk shut" data-a="tk:' + esc(cur) + '">Close</button></div>' : ""; }
  function noteBody(ph) {
    var S = ph.S, sc = S.scope, me = sc === "me", ui = S.ui, out = "";
    var q = eff(S, sc, "q"), cap = eff(S, sc, "cap"), ask = eff(S, sc, "ask");
    /* the household's name is the heading */
    out += '<div class="note"><input class="hh" data-in="hhname" value="' + esc(S.hh) + '" aria-label="Household name" maxlength="40" autocomplete="off">';
    /* people */
    var names = [tk("p:me", '<span data-metk>' + esc(S.me.name) + "</span>", ph) + " (you)"].concat(S.people.map(function (p) { return tk("p:" + p.id, esc(p.name), ph); }));
    out += '<p class="s" data-sec="people">' + joinNames(names) + " cook" + (names.length === 1 ? "s" : "") + " here. " + tk("invite", "Invite someone", ph) + "." + (S.pending.length ? " One invite is waiting; " + tk("pend", "cancel it", ph) + "." : "") + "</p>";
    out += drawer(ph, ["p:me"], youTop(S) + nameField(S) + roleBlock(S));
    S.people.forEach(function (p) {
      var conf = ui.confirm === "rm:" + p.id;
      out += drawer(ph, ["p:" + p.id], '<div class="row2"><b class="nm">' + esc(p.name) + " is an admin</b>" + sw("adm:" + p.id, p.admin, "Admin: " + p.name) + "</div>" +
        (conf ? confirmHtml("Remove " + p.name + "?", "They lose access. Nothing is deleted.", '<button type="button" class="pbtn danger" data-a="do:rm:' + p.id + '">Remove ' + esc(p.name) + '</button><button type="button" class="pbtn" data-a="keep">Keep</button>') : '<button type="button" class="dng plain" data-a="ask:rm:' + p.id + '">Remove ' + esc(p.name) + "</button>"));
    });
    out += drawer(ph, ["invite"], inviteBlock(S).replace('class="invite2"', 'class="invite2" style="padding:0"'));
    out += drawer(ph, ["pend"], S.pending.map(function (v) { return '<div class="row2"><span class="nm">Invite link, ' + v.left + ' days left</span><button type="button" class="pbtn" data-a="cancelinv:' + v.id + '">Cancel it</button></div>'; }).join(""));
    /* the checks */
    out += '<p class="s" data-sec="checks">These are ' + tk("scope", me ? "my own" : "everyone&rsquo;s", ph) + " settings. Kitchie " + tk("ask", ask ? "may" : "may not", ph, "", me ? ' data-ctl="ask"' : "") + " ask " + (me ? "me" : "us") + " to check amounts, " +
      (q === "none" ? "at any hour" : "never between " + tk("q", t12(q.s), ph) + " and " + tk("q2", t12(q.e), ph)) + ", and " + (ask ? "no more than " + tk("cap", String(cap), ph) + " a day" : "not at all") + ".</p>";
    out += drawer(ph, ["scope"], tseg("Whose settings", [["me", "Mine"], ["hh", "Everyone"]], sc, "scope") + (me && (S.d.me.ask != null || S.d.me.q != null || S.d.me.cap != null) ? '<button type="button" class="lnk" data-a="reset:all">Use the household\u2019s for all three</button>' : ""));
    out += drawer(ph, ["ask"], dialAsk(S, sc).replace('class="crow"', 'class="crow" style="padding:0;border:0"'));
    out += drawer(ph, ["q", "q2"], dialQuiet(S, sc).replace('class="crow"', 'class="crow" style="padding:0;border:0"'));
    out += drawer(ph, ["cap"], dialCap(S, sc).replace('class="crow"', 'class="crow" style="padding:0;border:0"'));
    /* food */
    var f = S.food[sc], fw = function (k, path) { return f[k].length ? joinNames(f[k].map(function (t, i) { return tk("f:" + path + "." + k + ":" + i, esc(t.toLowerCase()), ph); })) : "nothing yet"; };
    out += '<p class="s" data-sec="food">' + (me ? "I never eat " : "We never serve ") + fw("hard", sc) + (me ? ", I&rsquo;d rather skip " : ", we&rsquo;d rather skip ") + fw("soft", sc) + (me ? ", and I like " : ", and we like ") + fw("like", sc) + ". " + tk("fadd", "Add a word", ph) + "." + (f.swap.length ? " Instead of " + joinNames(f.swap.map(function (t, i) { return tk("f:" + sc + ".swap:" + i, esc(t.toLowerCase()), ph); })) + "." : "") + "</p>";
    FOODL.forEach(function (l) { f[l[0]].forEach(function (t, i) { out += drawer(ph, ["f:" + sc + "." + l[0] + ":" + i], '<div class="row2"><span class="nm">' + esc(t) + '</span><button type="button" class="dng" data-a="chip2:' + sc + "." + l[0] + ":" + i + '">Remove</button></div>'); }); });
    out += drawer(ph, ["fadd"], tseg("Which list", [["hard", "Never"], ["soft", "Rather not"], ["like", "Like"]], ui.addList || "hard", "addlist") + '<div class="edit" style="margin:0"><input class="in" data-in="chipin" aria-label="Add a word" placeholder="A word" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="pbtn go" data-a="faddsave">Add</button></div>');
    if (me) {
      out += '<p class="s">' + joinNames(S.people.map(function (p) { return tk("hm:" + p.id, esc(p.name), ph); })) + " have food notes of their own.</p>";
      S.people.forEach(function (p) {
        var chips = ["hard", "soft", "like"].map(function (k) { return p.food[k].map(function (t) { return '<span class="cp lock">' + esc((k === "hard" ? "Never " : k === "soft" ? "Rather not " : "Likes ") + t) + "</span>"; }).join(""); }).join("");
        out += drawer(ph, ["hm:" + p.id], '<div class="cps">' + (chips || '<span class="sm">Nothing to show yet.</span>') + '</div><button type="button" class="pbtn wide" data-a="toast:Suggest opens a short form (as built today).">Suggest something for ' + esc(p.name) + "</button>");
      });
    }
    out += '<p class="s">' + tk("notes", me ? "My notes" : "The household&rsquo;s notes", ph) + " for the assistant" + (S.notes[sc] ? ": &ldquo;" + esc(S.notes[sc].slice(0, 40)) + (S.notes[sc].length > 40 ? "&hellip;" : "") + "&rdquo;" : " are empty") + ". " + tk("rules", pl(S.rules.length, "rule") + " by place", ph) + ".</p>";
    out += drawer(ph, ["notes"], notesBlock(S, sc).replace('class="blk"', 'class="blk" style="padding:0"'));
    out += drawer(ph, ["rules"], S.rules.map(function (r, i) { return '<div class="row2"><span class="nm">' + esc(r.t) + ", " + esc(r.v.toLowerCase()) + '</span><button type="button" class="lnk" data-a="rulerm:' + i + '">Remove</button></div>'; }).join("") + '<button type="button" class="pbtn wide" data-a="sheet:rule">Add a rule</button>');
    /* places */
    out += '<p class="s" data-sec="places">Food lives in ' + tk("locs", pl(S.areas.length, "place"), ph) + " and is sorted into " + tk("cats", S.cats.length === 1 ? "1 category" : S.cats.length + " categories", ph) + "." + (S.samples ? " " + tk("samples", pl(S.samples, "sample item"), ph) + " are left over from the start." : "") + "</p>";
    out += drawer(ph, ["locs"], locsBlock(S).replace('<b class="nm">Locations and spots</b>', ""));
    out += drawer(ph, ["cats"], chipList(S, "cats", S.cats, []));
    out += drawer(ph, ["samples"], samplesRow(S).replace('class="crow"', 'class="crow" style="padding:0;border:0"'));
    /* assistants */
    var on = ASSISTS.filter(function (a) { return S.ai[a[0]]; }), off = ASSISTS.filter(function (a) { return !S.ai[a[0]]; });
    out += '<p class="s" data-sec="assist">' + (on.length ? joinNames(on.map(function (a) { return tk("a:" + a[0], a[1], ph); })) + (on.length > 1 ? " are" : " is") + " connected" + (S.dflt && on.length > 1 ? ", " + aname(S.dflt) + " by default" : "") + ". " : "No assistant is connected. ") +
      (off.length ? joinNames(off.map(function (a) { return tk("a:" + a[0], a[1], ph); })) + (off.length > 1 ? " are" : " is") + " not. " : "") + "My own link is " + tk("mylink", S.link ? "active" : "not made yet", ph) + ".</p>";
    ASSISTS.forEach(function (a) { out += drawer(ph, ["a:" + a[0]], assistRow(S, a).replace('<div class="arow">', '<div class="arow" style="padding:0;border:0">')); });
    out += drawer(ph, ["mylink"], (S.link ? '<div class="row2"><span class="nm">Your link is active</span><button type="button" class="pbtn" data-a="ask:revoke">Revoke</button></div>' : '<button type="button" class="pbtn go wide" data-a="link:make">Make my link</button>') + (ui.confirm === "revoke" ? confirmHtml("Revoke your link?", "Every assistant using it loses access at once.", '<button type="button" class="pbtn danger" data-a="do:revoke">Revoke</button><button type="button" class="pbtn" data-a="keep">Keep it</button>') : ""));
    /* the rest */
    out += '<p class="s" data-sec="rest">' + tk("csv", "Download my data", ph) + (S.installable ? ", " + tk("inst", "install Kitchie", ph) : "") + ", " + tk("out", "sign out", ph) + ", or " + tk("leave", "leave " + esc(S.hh), ph, "warn") + ". " + tk("hist", "See what changed", ph) + ".</p>";
    out += drawer(ph, ["csv"], '<button type="button" class="pbtn wide" data-a="toast:Downloads your inventory as a spreadsheet.">Download as CSV</button>');
    out += drawer(ph, ["inst"], '<button type="button" class="pbtn wide" data-a="toast:Adds Kitchie to your home screen.">Add to home screen</button>');
    out += drawer(ph, ["hist"], '<button type="button" class="pbtn wide" data-a="toast:History is its own screen.">Open History</button>');
    out += drawer(ph, ["out"], '<button type="button" class="pbtn danger wide" data-a="toast:Signed out (mockup).">Sign out</button>');
    out += drawer(ph, ["leave"], leaveBlock(S).replace('class="blk"', 'class="blk" style="padding:0"'));
    return out + "</div>";
  }
  DIRS.B = {
    name: "One note",
    pages: {
      menu: { title: "", back: null, backLabel: "the app", render: menuPage("go:note") },
      front: { title: "Settings", back: null, backLabel: "the app", render: frontPage(function (S) { return navRow("note", "Our kitchen", S.hh + ", " + (S.people.length + 1) + " people", "home"); }) },
      note: { title: "Our kitchen", back: "front", backLabel: "Settings", render: noteBody }
    },
    sheet: function (ph, sh) { return sh.t === "rule" ? { title: "Add a rule", html: ruleSheet(ph.S) } : { title: "", html: "" }; },
    screens: [["menu", "Profile menu"], ["front", "Settings front, one row"], ["note", "Our kitchen, top"], ["note@checks", "Our kitchen, the checks"], ["note@food", "Our kitchen, food"], ["note@places", "Our kitchen, places"], ["note@assist", "Our kitchen, assistants"], ["note@rest", "Our kitchen, the end"]]
  };

  /* ============================================================ C. Faces ============================================================ */
  function facesHtml(ph) {
    var S = ph.S, all = [{ id: "me", name: S.me.name, pic: S.me.pic, t: "You" }].concat(S.people.map(function (p) { return { id: p.id, name: p.name, pic: p.pic, t: p.admin ? "Admin" : "" }; }));
    return '<div class="faces" role="group" aria-label="People">' + all.map(function (p) {
      return '<button type="button" class="face" data-a="sheet:face:' + p.id + '">' + discHtml(p.name, p.pic) + '<span class="fn" data-pn="' + p.id + '">' + esc(p.name) + "</span>" + (p.t ? '<span class="ft">' + p.t + "</span>" : "") + "</button>";
    }).join("") + S.pending.map(function (v) { return '<button type="button" class="face" data-a="sheet:face:' + v.id + '">' + discHtml("", "✉", "dash") + '<span class="fn">Invited</span><span class="ft">' + v.left + " days left</span></button>"; }).join("") +
      '<button type="button" class="face" data-a="sheet:invite">' + discHtml("", "+", "dash") + '<span class="fn">Invite</span></button></div>';
  }
  function faceSheet(ph, id) {
    var S = ph.S;
    if (id === "me") {
      var f = "";
      return { title: S.me.name, html: youTop(S) + nameField(S) + roleBlock(S) +
        '<p class="gh">Preferences</p>' + dialsRows(S, "me") + foodBlock(S, "me") + notesBlock(S, "me") +
        '<p class="gh">Assistants</p>' + assistRows(S) + '<p class="gh">You</p>' + accountRows(S, true) + leaveBlock(S) };
    }
    var v = S.pending.filter(function (x) { return x.id === id; })[0];
    if (v) return { title: "Invite link", html: '<div class="invite2"><p>' + v.left + ' days left. Anyone with the link can join.</p><button type="button" class="pbtn danger wide" data-a="cancelinv:' + v.id + '">Cancel this invite</button></div>' };
    var p = S.people.filter(function (x) { return x.id === id; })[0]; if (!p) return { title: "", html: "" };
    var chips = ["hard", "soft", "like"].map(function (k) { return p.food[k].map(function (t) { return '<span class="cp lock">' + esc((k === "hard" ? "Never " : k === "soft" ? "Rather not " : "Likes ") + t) + "</span>"; }).join(""); }).join("");
    var conf = S.ui.confirm === "rm:" + p.id;
    return { title: p.name, html: '<div class="you-top">' + '<span class="big-av" style="cursor:default">' + esc(p.pic || initialOf(p.name)) + '</span></div>' +
      '<div class="blk"><b class="nm">Food</b><div class="cps">' + (chips || '<span class="sm">Nothing of their own yet.</span>') + '</div></div><div class="blk"><button type="button" class="pbtn wide" data-a="toast:Suggest opens a short form (as built today).">Suggest something for ' + esc(p.name) + "</button></div>" +
      '<div class="crow"><div class="top"><span class="rm"><b class="nm">Admin</b></span>' + sw("adm:" + p.id, p.admin, "Admin: " + p.name) + "</div></div>" +
      '<div class="blk">' + (conf ? confirmHtml("Remove " + p.name + " from " + S.hh + "?", "They lose access. Nothing is deleted.", '<button type="button" class="pbtn danger" data-a="do:rm:' + p.id + '">Remove ' + esc(p.name) + '</button><button type="button" class="pbtn" data-a="keep">Keep</button>') : '<button type="button" class="dng plain" data-a="ask:rm:' + p.id + '">Remove ' + esc(p.name) + "</button>") + "</div>" };
  }
  DIRS.C = {
    name: "Faces",
    pages: {
      menu: { title: "", back: null, backLabel: "the app", render: menuPage("sheet:face:me") },
      front: { title: "Settings", back: null, backLabel: "the app", render: frontPage(function (S) { return navRow("household", "Household", "", "home", '<span class="vals" aria-label="' + esc([S.me.name].concat(S.people.map(function (p) { return p.name; })).join(", ")) + '">' + [{ n: S.me.name, p: S.me.pic }].concat(S.people.map(function (p) { return { n: p.name, p: p.pic }; })).map(function (x) { return discHtml(x.n, x.p); }).join("") + "</span>") + navRow("kitchen", "Kitchen setup", S.cats.length + " categories", "pot"); }) },
      household: { title: "Household", back: "front", backLabel: "Settings", render: function (ph) { var S = ph.S;
        return '<label class="field"><span class="fl">Household name</span><input class="in" data-in="hhname" value="' + esc(S.hh) + '" maxlength="40" autocomplete="off"></label>' + facesHtml(ph) +
          '<p class="gh">For everyone</p>' + dialsRows(S, "hh") + foodBlock(S, "hh") + notesBlock(S, "hh") + "<ul class=\"list\">" + rulesBlock(S) + "</ul>" + historyRow(); } },
      kitchen: { title: "Kitchen setup", back: "front", backLabel: "Settings", render: function (ph) { var S = ph.S; return catsBlock(S) + locsBlock(S) + samplesRow(S); } }
    },
    sheet: function (ph, sh) {
      if (sh.t === "rule") return { title: "Add a rule", html: ruleSheet(ph.S) };
      if (sh.t === "invite") return { title: "Invite someone", html: inviteBlock(ph.S) };
      if (sh.t === "face") return faceSheet(ph, sh.id);
      return { title: "", html: "" };
    },
    screens: [["menu", "Profile menu"], ["front", "Settings front, two rows"], ["household", "Household"], ["household+me", "Your face"], ["household+sam", "Someone else&rsquo;s face"], ["household+invite", "The plus face"], ["household+hh", "Household, further down"], ["kitchen", "Kitchen setup"]]
  };
  /* in C the household defaults page and your sheet both edit dials; the sheet is Mine, the page is Everyone */
  Pp.scopeFor = function () { var S = this.S; if (this.o === "C") return S.ui.sheet ? "me" : "hh"; return S.scope; };
  Pp.qscope = Pp.scopeFor;
  Pp.timeSet = function (k, v) {
    var S = this.S, sc = this.scopeFor(), cur = eff(S, sc, "q"); if (!v || cur === "none") return;
    var q = { s: cur.s, e: cur.e }; q[k === "qs" ? "s" : "e"] = v; S.d[sc].q = q; this.redraw();
  };
  /* sheets redraw both the page behind and the sheet */
  Pp.redraw = function () { var top = this.sheetEl.querySelector(".shb"), st = top ? top.scrollTop : 0; this.draw(); var nb = this.sheetEl.querySelector(".shb"); if (nb) nb.scrollTop = st; };
  /* B only: the add-a-word drawer and the one-tap remove */
  var baseAct = Pp.act;
  Pp.act = function (a, el) {
    var p = a.split(":"), S = this.S;
    if (p[0] === "addlist") { S.ui.addList = p[1]; this.redraw(); return; }
    if (p[0] === "faddsave") { var inp = $("[data-in=chipin]", this.el), v = inp ? inp.value.trim() : ""; if (!v) { this.toast("Type a word first."); return; } S.food[S.scope][S.ui.addList || "hard"].push(v); S.ui.dr = null; this.redraw(); this.toast("Added " + v + "."); return; }
    if (p[0] === "chip2") { var q = p[1].split("."), arr = S.food[q[0]][q[1]], gone = arr.splice(+p[2], 1)[0]; S.ui.dr = null; this.redraw(); this.toast("Removed " + gone + "."); return; }
    return baseAct.call(this, a, el);
  };

  /* ---------- presets used by the gallery and the links ---------- */
  Pp.preset = function (id) {
    var S = this.S, base = id.split(/[+@]/)[0], mod = (id.split(/[+@]/)[1] || ""), at = id.indexOf("@") > -1;
    if (base === "prefs" && mod === "hh") S.scope = "hh";
    if (base === "household" && mod === "invite") { if (this.o === "C") S.ui.sheet = { t: "invite" }; else { S.link = "kitchie.app/join/K7QX-2M9P"; } }
    if (base === "household" && mod === "me") S.ui.sheet = { t: "face", id: "me" };
    if (base === "household" && mod === "sam") S.ui.sheet = { t: "face", id: "sam" };
    this.page = base; this.stack = [];
    this.draw(); this.bd.scrollTop = 0;
    if (base === "household" && mod === "hh") { var g = $(".gh", this.bd); if (g) this.bd.scrollTop = Math.max(0, g.offsetTop - 70); }
    if (at) { var el = $("[data-sec=" + mod + "]", this.bd); if (el) this.bd.scrollTop = Math.max(0, el.offsetTop - 70); }
  };

  window.AREAS = {
    DIRS: DIRS, phones: phones,
    make: function (host, o, preset) { var ph = new Phone(host, { o: o }); if (preset) ph.preset(preset); return ph; },
    drop: function (ph) { var i = phones.indexOf(ph); if (i > -1) phones.splice(i, 1); if (ph.el.parentNode) ph.el.parentNode.removeChild(ph.el); },
    setScale: setScale, pickTheme: pickTheme
  };
})();
