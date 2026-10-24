/* Preferences, nine calmer directions (A to I). Phone only. Mockup only: nothing here is built.
   Owner, 25 Oct 2026: "I still don't like that Preferences page, it's too crowded. What we had before was better; you made it worse. I want to see mockups, a lot of options."
   He loved DISPLAYING VALUES on the rows (each setting shows its current value on the row): every option keeps that.
   Everything on the real Preferences page exists here (Mine / Everyone, amount checks, quiet hours, suggestions a day, Food: Avoids, Likes, Swaps, Limits with Hard / Soft, reasons, Everyone / Just you,
   add, stop remembering, assistant notes, housemates, place rules, switched off). Adding a rule is the assistant's job today (food F8): Add shows what to tell it. Moving a rule between Everyone and
   Just you has no operation today: it is shown, never a control. Theme tokens only (theme.css); no raw colours. Class names are plain so the CSS can be lifted. Everything drawn is escaped.
   Several phones can live on one page (directions.html); each has its own state. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- icons (stroke, currentColor); sizes are in em so they follow text size ---------- */
  var P = {
    back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 7.6-1.7"/>',
    one: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
    many: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.1 2.7-5 6-5s6 1.9 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.6 0 4.5 1.6 4.5 4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', swap: '<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>',
    limit: '<path d="M4 18a8 8 0 0 1 16 0"/><path d="M12 18l4-5"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    bell: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>', note: '<path d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h5"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>', power: '<path d="M12 3v9M6.5 6.5a8 8 0 1 0 11 0"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    fork: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 21V3c-2 1-3 4-3 8h3"/>'
  };
  function ic(n, s, cls) { return '<svg class="i' + (cls ? " " + cls : "") + '" style="width:' + (s || 1.4) + 'em;height:' + (s || 1.4) + 'em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + P[n] + "</svg>"; }
  function chev() { return '<span class="chev">' + ic("chev", 1.1) + "</span>"; }
  function d(s) { return '<span class="d">' + esc(s) + "</span>"; } /* sample data: never counted as interface words */

  /* ---------- sample data: what the owner has (gluten Hard Everyone with a reason; the rest Just you) ---------- */
  var KINDS = [["avoid", "Avoids", "Avoid", "I never eat peanuts, I would rather skip olives"], ["like", "Likes", "Like", "I like mushrooms, we love lemon"], ["swap", "Swaps", "Swap", "whenever a recipe has white bread, use sourdough"], ["limit", "Limits", "Limit", "pasta at most twice a week"]];
  function fresh() {
    return {
      scope: "me",
      d: { me: { on: true, q: { on: true, s: "22:00", e: "06:00" }, cap: 3 }, hh: { on: true, q: { on: true, s: "22:00", e: "06:00" }, cap: 3 } },
      rules: [
        { id: "g", kind: "avoid", hard: true, who: "hh", s: "gluten", why: "Coeliac, so nothing with wheat, barley or rye" },
        { id: "p", kind: "avoid", hard: true, who: "me", s: "pasta", why: "Too many carbs" },
        { id: "r", kind: "avoid", hard: true, who: "me", s: "roti", why: "Too many carbs" },
        { id: "t", kind: "avoid", hard: true, who: "me", s: "tomato-based foods", why: "Reflux" },
        { id: "n", kind: "avoid", hard: true, who: "me", s: "non-rice noodles", why: "Too many carbs" },
        { id: "i", kind: "avoid", hard: false, who: "me", s: "iceberg lettuce", why: "" },
        { id: "l1", kind: "like", who: "me", s: "protein-forward carb-conscious meals", why: "" },
        { id: "l2", kind: "like", who: "me", s: "gluten-free bread", why: "" },
        { id: "l3", kind: "like", who: "me", s: "rice noodles", why: "" },
        { id: "s1", kind: "swap", who: "me", s: "white bread", to: "gluten-free bread", why: "" },
        { id: "c1", kind: "limit", who: "me", s: "fried food", max: "twice a week", why: "" }
      ],
      note: "", places: [["Dairy in the Fridge", "Low, weekly"], ["Freezer items", "Out, daily"]], stops: [["Anchovies", "Low check"]], mates: ["Sam", "Pat"],
      ui: { open: null, conf: null, add: null, addany: false, tab: "avoid", grp: null, drill: null, page: 0, sheet: null, qopen: false, disc: null }
    };
  }
  function t12(h) { var m = /^(\d\d):(\d\d)$/.exec(h || ""); if (!m) return ""; var H = +m[1], M = m[2], ap = H >= 12 ? "pm" : "am"; H = H % 12 || 12; return H + (M === "00" ? "" : ":" + M) + ap; }
  function quietText(q) { return q.on ? t12(q.s) + "–" + t12(q.e) : "Off"; }
  function dials(S) { return S.d[S.scope]; }
  function vis(S) { return S.rules.filter(function (r) { return S.scope === "me" || r.who === "hh"; }); }
  function ofKind(S, k) { return vis(S).filter(function (r) { return r.kind === k; }).sort(function (a, b) { return (b.hard === true) - (a.hard === true); }); }
  function line(r) { return r.kind === "swap" ? "Swap in " + r.to : r.kind === "limit" ? "At most " + r.max : r.why || ""; }

  /* ---------- shared pieces ---------- */
  function fk(a) { return ' data-a="' + esc(a) + '" data-fk="' + esc(a) + '"'; }
  function seg(S, cls) {
    return '<div class="seg ' + (cls || "") + '" role="radiogroup" aria-label="Whose preferences">' + [["me", "Mine"], ["hh", "Everyone"]].map(function (x) {
      var on = S.scope === x[0]; return '<button type="button" role="radio" aria-checked="' + on + '"' + fk("scope:" + x[0]) + ">" + (on ? ic("check", 1.1) : "") + x[1] + "</button>";
    }).join("") + "</div>";
  }
  function mark(r) { return r.kind === "avoid" ? (r.hard ? '<span class="mk hard" title="Hard">' + ic("lock", 1.4, "hard") + '<span class="vh">Hard</span></span>' : '<span class="mk soft" title="Soft">' + ic("unlock", 1.4) + '<span class="vh">Soft</span></span>') : ""; }
  function who(r) { return r.who === "hh" ? '<span class="wh" title="Everyone">' + ic("many", 1.4) + '<span class="vh">Everyone</span></span>' : '<span class="wh" title="Just you">' + ic("one", 1.4) + '<span class="vh">Just you</span></span>'; }
  function kglyph(r) { return r.kind === "avoid" ? (r.hard ? ic("lock", 1.4, "hard") : ic("unlock", 1.4)) : r.kind === "like" ? ic("heart", 1.4) : r.kind === "swap" ? ic("swap", 1.4) : ic("limit", 1.4); }
  function kword(r) { return r.kind === "avoid" ? (r.hard ? "Hard" : "Soft") : r.kind === "like" ? "Like" : r.kind === "swap" ? "Swap" : "Limit"; }

  /* the opened rule: only the controls (Hard or Soft, Reason, Stop). Everyone or Just you is shown, not a control. */
  function detail(S, r) {
    var c = S.ui.conf, id = r.id, h = "";
    if (r.kind === "avoid") {
      h += '<div class="seg two" role="radiogroup" aria-label="Hard or soft"><button type="button" role="radio" aria-checked="' + r.hard + '"' + fk("set:" + id + ":hard") + ">" + ic("lock", 1.3, "hard") + "Hard</button><button type=\"button\" role=\"radio\" aria-checked=\"" + !r.hard + '"' + fk("set:" + id + ":soft") + ">" + ic("unlock", 1.3) + "Soft</button></div>";
      if (c && c.id === id && c.k === "soft") h += '<div class="conf" role="group" aria-label="Make it soft"><p>Make it soft? It can still turn up.</p><div class="btns"><button type="button" class="pbtn"' + fk("softok:" + id) + '>Make soft</button><button type="button" class="pbtn"' + fk("keep") + ">Keep hard</button></div></div>";
      h += '<label class="fl" for="rs-' + id + '">Reason</label><input id="rs-' + id + '" class="in" type="text" maxlength="200" autocomplete="off" placeholder="Optional" value="' + esc(r.why) + '" data-reason="' + id + '" data-fk="reason:' + id + '">';
    } else if (line(r)) h += '<p class="said">' + d(line(r)) + "</p>";
    h += '<p class="aud">' + (r.who === "hh" ? ic("many", 1.3) + " Everyone" : ic("one", 1.3) + " Just you") + "</p>";
    if (c && c.id === id && c.k === "stop") h += '<div class="conf" role="group" aria-label="Remove this hard stop"><p>Remove this hard stop?</p><div class="btns"><button type="button" class="pbtn danger"' + fk("stopok:" + id) + '>Remove</button><button type="button" class="pbtn"' + fk("keep") + ">Keep</button></div></div>";
    else h += '<button type="button" class="stopq"' + fk("stop:" + id) + ">" + ic("trash", 1.2) + " Stop remembering</button>";
    return '<div class="ped" id="ed-' + id + '">' + h + "</div>";
  }
  function addHint(S, kind) {
    var k = KINDS.filter(function (x) { return x[0] === kind; })[0];
    return '<div class="addhint" role="status"><p>Tell your assistant: “' + esc(k[3]) + "”." + (S.scope === "hh" ? " Say it is for everyone." : "") + "</p></div>";
  }
  function addRow(S, kind, label) {
    var on = S.ui.add === kind;
    return '<div class="addli"><button type="button" class="add' + (kind === "avoid" ? "" : " quiet") + '"' + fk("add:" + kind) + ' aria-expanded="' + on + '" aria-label="Add to ' + esc(KINDS.filter(function (x) { return x[0] === kind; })[0][1]) + '">' + ic("plus", 1.2) + (label || "Add") + "</button>" + (on ? addHint(S, kind) : "") + "</div>";
  }

  /* dial rows: every one shows its value */
  function swRow(S, lead) {
    var D = dials(S);
    return '<div class="crow" data-ctl="checks">' + (lead ? '<span class="lead">' + ic("bell", 1.3) + "</span>" : "") + '<span class="nm">Amount checks</span><label class="sw"><input type="checkbox" role="switch" data-sw="on" data-fk="sw" aria-label="Amount checks"' + (D.on ? " checked" : "") + '><span class="swt"></span></label></div>';
  }
  function quietPanel(S) {
    var q = dials(S).q;
    return '<div class="tms">' + (q.on ? '<input type="time" class="tm" data-q="s" value="' + esc(q.s) + '" aria-label="Quiet hours from" data-fk="qs"><span aria-hidden="true">–</span><input type="time" class="tm" data-q="e" value="' + esc(q.e) + '" aria-label="Quiet hours to" data-fk="qe"><button type="button" class="lnk"' + fk("qnone") + ">No quiet hours</button>" : '<button type="button" class="lnk"' + fk("qagain") + ">Use quiet hours</button>") + "</div>";
  }
  function quietRow(S, lead) {
    var q = dials(S).q, open = S.ui.qopen;
    return '<div class="crow vcol" data-ctl="quiet"><button type="button" class="vrow"' + fk("q") + ' aria-expanded="' + open + '">' + (lead ? '<span class="lead">' + ic("moon", 1.3) + "</span>" : "") + '<span class="nm">Quiet hours</span><span class="val">' + quietText(q) + '</span><span class="chev' + (open ? " up" : "") + '">' + ic("down", 1.1) + "</span></button>" + (open ? quietPanel(S) : "") + "</div>";
  }
  function capRow(S, lead) {
    var D = dials(S);
    return '<div class="crow" data-ctl="cap">' + (lead ? '<span class="lead">' + ic("list", 1.3) + "</span>" : "") + '<span class="nm">Suggestions a day</span><span class="num" role="group" aria-label="Suggestions a day"><button type="button"' + fk("step:-1") + ' aria-label="Fewer"' + (D.cap <= 1 ? " disabled" : "") + '>−</button><b aria-live="polite">' + D.cap + '</b><button type="button"' + fk("step:1") + ' aria-label="More"' + (D.cap >= 20 ? " disabled" : "") + ">+</button></span></div>";
  }
  function dialRows(S, lead) { return swRow(S, lead) + quietRow(S, lead) + capRow(S, lead); }

  /* the other rows: each shows a value and opens in place (or drills, in E) */
  function extraDefs(S) {
    var out = [];
    out.push({ id: "notes", label: "Assistant notes", val: S.note ? S.note : "", icon: "note", body: '<textarea class="in ta" rows="2" maxlength="600" placeholder="Anything to know" aria-label="Assistant notes" data-note data-fk="note">' + esc(S.note) + "</textarea>" });
    if (S.scope === "me") out.push({ id: "mates", label: "Housemates", val: S.mates.length, icon: "many", body: S.mates.map(function (m) { return '<div class="mate"><span class="av">' + esc(m[0]) + '</span><span class="nm">' + d(m) + '</span><button type="button" class="pbtn"' + fk("toast:" + m) + ">Suggest</button></div>"; }).join("") });
    out.push({ id: "places", label: "Place rules", val: S.places.length, icon: "pin", body: S.places.map(function (p) { return '<div class="mate"><span class="nm">' + d(p[0]) + '</span><span class="sm">' + d(p[1]) + "</span></div>"; }).join("") });
    if (S.scope === "me" && S.stops.length) out.push({ id: "stops", label: "Switched off", val: S.stops.length, icon: "power", body: S.stops.map(function (p, n) { return '<div class="mate"><span class="rm"><span class="nm">' + d(p[0]) + '</span><span class="sm">' + d(p[1]) + '</span></span><button type="button" class="lnk"' + fk("ask:" + n) + ">Ask again</button></div>"; }).join("") });
    return out;
  }
  function discRow(S, x, lead) {
    var open = S.ui.disc === x.id, v = x.id === "notes" ? (x.val ? '<span class="val">' + d(x.val) + "</span>" : "") : '<span class="val">' + d(x.val) + "</span>";
    return '<div class="crow vcol" data-ctl="' + x.id + '"><button type="button" class="vrow"' + fk("disc:" + x.id) + ' aria-expanded="' + open + '">' + (lead ? '<span class="lead">' + ic(x.icon, 1.3) + "</span>" : "") + '<span class="nm">' + x.label + "</span>" + v + '<span class="chev' + (open ? " up" : "") + '">' + ic("down", 1.1) + "</span></button>" + (open ? '<div class="dbody">' + x.body + "</div>" : "") + "</div>";
  }
  function extras(S, lead) { return extraDefs(S).map(function (x) { return discRow(S, x, lead); }).join(""); }
  function hd2(t, v) { return '<h3 class="hd2"><span>' + t + "</span>" + (v == null ? "" : '<span class="val">' + v + "</span>") + "</h3>"; }

  /* a rule row, per style */
  function rowA(S, r) {
    var open = S.ui.open === r.id;
    return '<li class="rule"><button type="button" class="row"' + fk("tog:" + r.id) + ' aria-expanded="' + open + '"><span class="rm"><span class="nm">' + d(r.s) + "</span>" + (line(r) ? '<span class="ln">' + d(line(r)) + "</span>" : "") + "</span>" + mark(r) + who(r) + chev() + "</button>" + (open ? detail(S, r) : "") + "</li>";
  }
  function rowCalm(S, r, o) { /* name, then the lock and the audience; no second line, no chevron (H, D, E) */
    var open = S.ui.open === r.id, a = o && o.sheet ? fk("sheet:" + r.id) : fk("tog:" + r.id);
    return '<li class="rule"><button type="button" class="row"' + a + ' aria-expanded="' + open + '"><span class="rm"><span class="nm">' + d(r.s) + "</span></span>" + mark(r) + who(r) + "</button>" + (open && !(o && o.sheet) ? detail(S, r) : "") + "</li>";
  }
  function rowSent(S, r) { /* B: one sentence */
    var open = S.ui.open === r.id, v = r.kind === "avoid" ? (r.hard ? "Never" : "Rather not") : r.kind === "like" ? "Likes" : null, tx;
    if (v) tx = "<b>" + v + "</b> " + d(r.s);
    else if (r.kind === "swap") tx = "<b>Swap</b> " + d(r.s) + " <span class=\"arr\" aria-hidden=\"true\">→</span><span class=\"vh\"> to </span> " + d(r.to);
    else tx = d(r.s) + " <b>at most</b> " + d(r.max);
    return '<li class="rule"><button type="button" class="row"' + fk("tog:" + r.id) + ' aria-expanded="' + open + '"><span class="rm"><span class="sent">' + tx + "</span>" + (r.kind === "avoid" && r.why ? '<span class="ln">' + d(r.why) + "</span>" : "") + "</span>" + (r.who === "hh" ? who(r) : "") + "</button>" + (open ? detail(S, r) : "") + "</li>";
  }
  function rowGlyph(S, r) { /* C: one glyph, the rule, nothing else; a ring means Everyone */
    var open = S.ui.open === r.id;
    return '<li class="rule"><button type="button" class="row"' + fk("tog:" + r.id) + ' aria-expanded="' + open + '"><span class="kg' + (r.who === "hh" ? " ring" : "") + '" title="' + kword(r) + (r.who === "hh" ? ", Everyone" : "") + '">' + kglyph(r) + '<span class="vh">' + kword(r) + (r.who === "hh" ? ", Everyone" : "") + '</span></span><span class="rm"><span class="nm">' + d(r.s) + "</span></span></button>" + (open ? detail(S, r) : "") + "</li>";
  }
  function chipOf(S, r) { /* I */
    var open = S.ui.open === r.id;
    return '<button type="button" class="cp' + (open ? " on" : "") + '"' + fk("tog:" + r.id) + ' aria-expanded="' + open + '">' + (r.kind === "avoid" ? (r.hard ? ic("lock", 1.15, "hard") : ic("unlock", 1.15)) : "") + '<span class="nm">' + d(r.s) + "</span>" + (r.who === "hh" ? '<span class="wh" title="Everyone">' + ic("many", 1.15) + '<span class="vh">Everyone</span></span>' : "") + (r.kind === "avoid" && !r.hard ? '<span class="vh">Soft</span>' : r.kind === "avoid" ? '<span class="vh">Hard</span>' : "") + "</button>";
  }

  /* ============================== the nine directions ============================== */
  var DIR = {};

  /* A. Restore: the 0.177.0 layout, word cuts only, values on the rows */
  DIR.A = {
    draw: function (S) {
      var h = '<div class="blk">' + seg(S) + "</div>" + dialRows(S, false);
      KINDS.forEach(function (k) {
        var rs = ofKind(S, k[0]); if (!rs.length && S.scope === "hh" && k[0] !== "avoid") return;
        h += hd2(k[1].toUpperCase()) + '<ul class="list">' + addRow(S, k[0]) + rs.map(function (r) { return rowA(S, r); }).join("") + "</ul>";
      });
      return h + hd2("") + extras(S, false);
    }
  };

  /* B. Sentence rows: "Never gluten", the verb is the group, one list, one Add */
  DIR.B = {
    draw: function (S) {
      var rs = []; KINDS.forEach(function (k) { rs = rs.concat(ofKind(S, k[0])); });
      var add = S.ui.addany
        ? '<div class="addli"><button type="button" class="add"' + fk("addany") + ' aria-expanded="true">' + ic("x", 1.2) + 'Add</button><div class="cps" role="group" aria-label="What kind">' + KINDS.map(function (k) { return '<button type="button" class="cp"' + fk("addk:" + k[0]) + ">" + k[2] + "</button>"; }).join("") + "</div>" + (S.ui.add ? addHint(S, S.ui.add) : "") + "</div>"
        : '<div class="addli"><button type="button" class="add"' + fk("addany") + ' aria-expanded="false">' + ic("plus", 1.2) + "Add</button></div>";
      return '<div class="blk">' + seg(S) + '</div><ul class="list">' + rs.map(function (r) { return rowSent(S, r); }).join("") + add + "</ul>" + hd2("") + dialRows(S, false) + extras(S, false);
    }
  };

  /* C. One glyph per rule, details on open, Add is the thumb button, scope lives in the header */
  DIR.C = {
    draw: function (S) {
      var rs = []; KINDS.forEach(function (k) { rs = rs.concat(ofKind(S, k[0])); });
      var fab = '<div class="cbar">' + seg(S) + '<button type="button" class="fab"' + fk("addany") + ' aria-label="Add a rule" aria-expanded="' + !!S.ui.addany + '">' + ic(S.ui.addany ? "x" : "plus", 1.6) + "</button></div>";
      var pick = S.ui.addany ? '<div class="addli"><div class="cps" role="group" aria-label="What kind">' + KINDS.map(function (k) { return '<button type="button" class="cp"' + fk("addk:" + k[0]) + ">" + kglyphK(k[0]) + k[2] + "</button>"; }).join("") + "</div>" + (S.ui.add ? addHint(S, S.ui.add) : "") + "</div>" : "";
      return '<ul class="list c">' + rs.map(function (r) { return rowGlyph(S, r); }).join("") + "</ul>" + pick + '<div class="gap"></div>' + dialRows(S, true) + extras(S, true) + fab;
    }
  };
  function kglyphK(k) { return k === "avoid" ? ic("lock", 1.2, "hard") : k === "like" ? ic("heart", 1.2) : k === "swap" ? ic("swap", 1.2) : ic("limit", 1.2); }

  /* D. A card per kind; the header shows a value and a preview, and opens */
  DIR.D = {
    draw: function (S) {
      var h = '<div class="blk">' + seg(S) + "</div>";
      KINDS.forEach(function (k) {
        var rs = ofKind(S, k[0]); if (!rs.length && S.scope === "hh" && k[0] !== "avoid") return;
        var open = S.ui.grp === k[0], names = rs.slice(0, 2).map(function (r) { return r.s; }).join(", ") + (rs.length > 2 ? " +" + (rs.length - 2) : "");
        h += '<section class="card"><button type="button" class="chead"' + fk("grp:" + k[0]) + ' aria-expanded="' + open + '"><span class="lead">' + kglyphK(k[0]) + '</span><span class="rm"><span class="nm">' + k[1] + "</span>" + (open ? "" : '<span class="ln">' + d(names) + "</span>") + '</span><span class="val">' + rs.length + '</span><span class="chev' + (open ? " up" : "") + '">' + ic("down", 1.1) + "</span></button>" +
          (open ? '<ul class="list in">' + addRow(S, k[0]) + rs.map(function (r) { return rowCalm(S, r); }).join("") + "</ul>" : "") + "</section>";
      });
      return h + hd2("") + dialRows(S, false) + extras(S, false);
    }
  };

  /* E. Two levels: the top shows only values; a tap drills to a calm page */
  var DRILL_TITLE = { food: "Food", quiet: "Quiet hours", notes: "Assistant notes", mates: "Housemates", places: "Place rules", stops: "Switched off" };
  DIR.E = {
    title: function (S) { return S.ui.drill ? DRILL_TITLE[S.ui.drill] : "Preferences"; },
    draw: function (S) {
      var dr = S.ui.drill;
      if (dr === "food") {
        var h = "";
        KINDS.forEach(function (k) { var rs = ofKind(S, k[0]); if (!rs.length && S.scope === "hh" && k[0] !== "avoid") return; h += hd2(k[1].toUpperCase()) + '<ul class="list">' + addRow(S, k[0]) + rs.map(function (r) { return rowCalm(S, r); }).join("") + "</ul>"; });
        return h;
      }
      if (dr === "quiet") return '<div class="blk">' + quietPanel(S) + "</div>";
      if (dr) { var x = extraDefs(S).filter(function (y) { return y.id === dr; })[0]; return '<div class="blk">' + (x ? x.body : "") + "</div>"; }
      function vr(id, label, val, icon) { return '<div class="crow vcol"><button type="button" class="vrow"' + fk("drill:" + id) + '><span class="nm">' + label + '</span><span class="val">' + val + "</span>" + chev() + "</button></div>"; }
      var cnt = function (k) { return ofKind(S, k).length; };
      var food = cnt("avoid") + " avoids · " + cnt("like") + " likes";
      var D = dials(S), ex = extraDefs(S);
      return '<div class="blk">' + seg(S) + "</div>" + vr("food", "Food", food) + swRow(S) + vr("quiet", "Quiet hours", quietText(D.q)) + capRow(S) +
        ex.map(function (x) { return vr(x.id, x.label, x.id === "notes" ? (x.val ? d(x.val) : "") : d(x.val)); }).join("");
    }
  };

  /* F. Swipe through: one category per screen, snap like the theme rotary */
  var PAGES = [["avoid", "Avoids"], ["like", "Likes"], ["swap", "Swaps"], ["limit", "Limits"], ["checks", "Checks"], ["more", "More"]];
  DIR.F = {
    pager: true,
    draw: function (S) {
      var nav = '<div class="blk">' + seg(S) + '</div><div class="pnav"><button type="button" class="ib"' + fk("pg:-1") + ' aria-label="Previous"' + (S.ui.page <= 0 ? " disabled" : "") + '>' + ic("back", 1.4) + '</button><div class="ptt" aria-live="polite"><b>' + PAGES[S.ui.page][1] + '</b><span class="dots" aria-hidden="true">' + PAGES.map(function (p, n) { return '<i class="' + (n === S.ui.page ? "on" : "") + '"></i>'; }).join("") + '</span></div><button type="button" class="ib"' + fk("pg:1") + ' aria-label="Next"' + (S.ui.page >= PAGES.length - 1 ? " disabled" : "") + ">" + ic("chev", 1.4) + "</button></div>";
      var pages = PAGES.map(function (p, n) {
        var inner;
        if (p[0] === "checks") inner = dialRows(S, false);
        else if (p[0] === "more") inner = extras(S, false);
        else { var rs = ofKind(S, p[0]); inner = '<ul class="list">' + addRow(S, p[0]) + rs.map(function (r) { return rowCalm(S, r); }).join("") + "</ul>"; }
        return '<section class="pgs" data-pg="' + n + '" aria-label="' + p[1] + '"' + (n === S.ui.page ? "" : " inert") + ">" + inner + "</section>";
      }).join("");
      return nav + '<div class="pager" data-pager>' + pages + "</div>";
    }
  };

  /* G. Chips for the four kinds, one calm list below */
  DIR.G = {
    draw: function (S) {
      var h = '<div class="blk">' + seg(S) + "</div>", tab = S.ui.tab;
      if (S.scope === "hh" && tab !== "avoid" && !ofKind(S, tab).length) tab = "avoid";
      h += '<div class="tabs" role="radiogroup" aria-label="Kind of rule">' + KINDS.map(function (k) { var on = tab === k[0]; return '<button type="button" role="radio" aria-checked="' + on + '"' + fk("tab:" + k[0]) + ">" + (on ? ic("check", 1) : "") + k[1] + ' <span class="val">' + ofKind(S, k[0]).length + "</span></button>"; }).join("") + "</div>";
      h += '<ul class="list">' + addRow(S, tab) + ofKind(S, tab).map(function (r) { return rowCalm(S, r); }).join("") + "</ul>";
      return h + hd2("") + dialRows(S, false) + extras(S, false);
    }
  };

  /* H. The list is only reading; every edit happens in a bottom sheet */
  DIR.H = {
    draw: function (S) {
      var h = '<div class="blk">' + seg(S) + "</div>";
      KINDS.forEach(function (k) { var rs = ofKind(S, k[0]); if (!rs.length && S.scope === "hh" && k[0] !== "avoid") return; h += hd2(k[1].toUpperCase()) + '<ul class="list">' + addRow(S, k[0]) + rs.map(function (r) { return rowCalm(S, r, { sheet: true }); }).join("") + "</ul>"; });
      return h + hd2("") + dialRows(S, false) + extras(S, false);
    },
    sheet: function (S) {
      var r = S.rules.filter(function (x) { return x.id === S.ui.sheet; })[0]; if (!r) return "";
      return '<div class="shd" data-a="sheetx"></div><div class="shp" role="dialog" aria-modal="true" aria-label="' + esc(r.s) + '"><div class="shh"><b class="nm">' + d(r.s) + '</b><button type="button" class="ib"' + fk("sheetx") + ' aria-label="Close">' + ic("x", 1.4) + "</button></div>" + detail(S, r) + "</div>";
    }
  };

  /* I. Chips: each kind is one cloud of names */
  DIR.I = {
    draw: function (S) {
      var h = '<div class="blk">' + seg(S) + "</div>";
      KINDS.forEach(function (k) {
        var rs = ofKind(S, k[0]); if (!rs.length && S.scope === "hh" && k[0] !== "avoid") return;
        var on = S.ui.add === k[0], op = rs.filter(function (r) { return r.id === S.ui.open; })[0];
        h += hd2(k[1].toUpperCase()) + '<div class="cloud"><div class="cps">' + rs.map(function (r) { return chipOf(S, r); }).join("") + '<button type="button" class="cp add"' + fk("add:" + k[0]) + ' aria-expanded="' + on + '" aria-label="Add to ' + k[1] + '">' + ic("plus", 1.15) + "Add</button></div>" + (op ? detail(S, op) : "") + (on ? addHint(S, k[0]) : "") + "</div>";
      });
      return h + hd2("") + dialRows(S, false) + extras(S, false);
    }
  };

  /* ---------- the notes for each direction: one source for index.html and directions.html ---------- */
  var META = {
    A: { name: "Restore the earlier page", job: "See what is avoided, add one, with the page he knew.", accent: "Add, on Avoids only", pros: "Known layout; every group visible at once; least to rebuild; adds the values on the rows.", cons: "Still the longest page: rows keep a lock, a person and a chevron each.", foodFirst: false },
    B: { name: "Sentence rows", job: "Read what is never, rarely, liked, in plain words.", accent: "Add, one row at the end", pros: "Nothing to decode: the verb is the group and the lock. No headings. Just you needs no mark.", cons: "The most words on the page (24, the rest 3 to 15); Hard and Soft ride in a word, not a glyph; Add costs one more tap (which kind).", foodFirst: true },
    C: { name: "One glyph per rule", job: "Scan names; open one only when it matters.", accent: "The round Add button under the thumb", pros: "Shortest list: a glyph and a name. Add is reachable. Scope moves to the header.", cons: "A glyph must be learned (ring means Everyone); no reason until opened; no group names.", foodFirst: true },
    D: { name: "A card per kind", job: "Know how many of each, open one group at a time.", accent: "None on the page; the count of Avoids reads first by position", pros: "First view is six lines of values: calm, short. Counts and a two-name preview answer 'what is in there'.", cons: "Seeing the avoids costs a tap; one group open at a time hides the others.", foodFirst: true },
    E: { name: "Values, then drill", job: "Check a value at a glance; go deeper only to change.", accent: "Food, first row, with its value", pros: "The Settings front's own pattern: the owner loved values on rows. Top level has no food rows at all.", cons: "Every real edit is two taps or more; adds a level; Notes and Housemates become pages.", foodFirst: true },
    F: { name: "Swipe through", job: "One thing at a time; the rest is a swipe away.", accent: "The category name above the list", pros: "Each screen is short and calm; matches the theme rotary gesture; Avoids is the first screen.", cons: "Hides everything else; swipe is never the only way (arrows are buttons); six screens to learn.", foodFirst: true },
    G: { name: "Kind chips", job: "Pick a kind, read its list.", accent: "The chosen chip", pros: "Four counts visible at once; list stays about 6 rows; Add belongs to the chosen kind.", cons: "Chips wrap to two lines at +30%; one kind at a time (no all-in-one scan).", foodFirst: true },
    H: { name: "Bottom-sheet editing", job: "Read the list quietly; edit in one place.", accent: "Add, and the sheet", pros: "Rows never grow, so the page never jumps; one editor design for every rule.", cons: "Every edit is a modal; focus must be trapped; the sheet hides the list while you edit.", foodFirst: false },
    I: { name: "Chips cloud", job: "See every name at once, as a cloud.", accent: "The dashed Add chip on Avoids", pros: "Eleven names in about a third of the height; scannable; chips are the right control for many tags.", cons: "Reasons hidden until opened; long names fill a line; weaker for reading the words.", foodFirst: true }
  };
  /* The four common jobs, as the taps that do them (selectors, in order), played by tools/preferences-options-check.mjs. */
  var T = function (a) { return '[data-a="' + a + '"]'; };
  var JOBS = {
    A: { see: [], add: [T("add:avoid")], soft: [T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    B: { see: [], add: [T("addany"), T("addk:avoid")], soft: [T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    C: { see: [], add: [T("addany"), T("addk:avoid")], soft: [T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    D: { see: [T("grp:avoid")], add: [T("grp:avoid"), T("add:avoid")], soft: [T("grp:avoid"), T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    E: { see: [T("drill:food")], add: [T("drill:food"), T("add:avoid")], soft: [T("drill:food"), T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    F: { see: [], add: [T("add:avoid")], soft: [T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    G: { see: [], add: [T("add:avoid")], soft: [T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    H: { see: [], add: [T("add:avoid")], soft: [T("sheet:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] },
    I: { see: [], add: [T("add:avoid")], soft: [T("tog:p"), T("set:p:soft"), T("softok:p")], scope: [T("scope:hh")] }
  };

  /* ============================================================ the phone ============================================================ */
  var phones = [], scale = 0;
  function scaleVars(n) { var s = n === 3 ? 1.3 : 1, h = Math.max(0.88, Math.min(1.15, 1 + (s - 1) / 2)); return { ts: s, hk: h / s }; }
  function applyScale(ph) { var v = scaleVars(scale); ph.el.style.setProperty("--ts", v.ts); ph.el.style.setProperty("--hk", v.hk); }
  function setScale(n) { scale = n; phones.forEach(applyScale); }
  function pickTheme(id) { var b = document.createElement("button"); b.hidden = true; b.setAttribute("data-theme-pick", id); document.body.appendChild(b); b.click(); b.remove(); }

  function Phone(host, o) {
    var ph = this; ph.o = o; ph.S = fresh(); ph.D = DIR[o];
    ph.el = document.createElement("div"); ph.el.className = "ph"; ph.el.setAttribute("data-o", o);
    ph.el.innerHTML = '<header class="hd"><button type="button" class="bk" data-a="back" aria-label="Back">' + ic("back", 1.4) + '<span class="bkw">Menu</span></button><h2 class="ttl"></h2><span class="hx"></span><button type="button" class="ib" data-a="find" aria-label="Search settings">' + ic("search", 1.4) + '</button></header><div class="bd" data-bd></div><div class="sheet" hidden></div><div class="toast" role="status" aria-live="polite" hidden></div>';
    host.appendChild(ph.el); ph.bd = $("[data-bd]", ph.el); ph.shEl = $(".sheet", ph.el); phones.push(ph); applyScale(ph);
    ph.el.addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (b && ph.el.contains(b) && !b.disabled) ph.act(b.getAttribute("data-a"), b); });
    ph.el.addEventListener("change", function (e) { var t = e.target; if (t.hasAttribute("data-sw")) { dials(ph.S).on = t.checked; ph.draw(); } else if (t.hasAttribute("data-q")) { dials(ph.S).q[t.getAttribute("data-q")] = t.value || dials(ph.S).q[t.getAttribute("data-q")]; ph.draw(); } });
    ph.el.addEventListener("input", function (e) { var t = e.target; if (t.hasAttribute("data-reason")) { ph.rule(t.getAttribute("data-reason")).why = t.value; } else if (t.hasAttribute("data-note")) { ph.S.note = t.value; } });
    ph.el.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ph.S.ui.sheet) { ph.act("sheetx"); return; }
      if (e.key === "Tab" && ph.S.ui.sheet) { var f = $$("button,input,textarea,[href]", $(".shp", ph.el)).filter(function (x) { return !x.disabled; }); if (!f.length) return; var i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
    if (ph.D.pager) { ph.bd.addEventListener("scroll", function (e) { if (e.target.hasAttribute && e.target.hasAttribute("data-pager")) ph.pagerScroll(e.target); }, true); }
    ph.draw();
  }
  Phone.prototype.rule = function (id) { return this.S.rules.filter(function (r) { return r.id === id; })[0]; };
  Phone.prototype.toast = function (t) { var el = $(".toast", this.el); el.textContent = t; el.hidden = false; clearTimeout(this.tt); this.tt = setTimeout(function () { el.hidden = true; }, 2200); };
  Phone.prototype.pagerScroll = function (pg) {
    var n = Math.round(pg.scrollLeft / Math.max(1, pg.clientWidth)); if (n === this.S.ui.page || n < 0 || n >= PAGES.length) return;
    clearTimeout(this.ps); var ph = this; this.ps = setTimeout(function () { ph.S.ui.page = n; ph.draw(true); }, 90);
  };
  Phone.prototype.draw = function (keepPager) {
    var ph = this, S = ph.S, a = document.activeElement, key = a && ph.el.contains(a) ? a.getAttribute("data-fk") : null, top = ph.bd.scrollTop, D = ph.D;
    var sc = null, pgTop = []; if (D.pager) { var pg0 = $("[data-pager]", ph.el); if (pg0) { sc = pg0.scrollLeft; pgTop = $$(".pgs", pg0).map(function (x) { return x.scrollTop; }); } }
    $(".ttl", ph.el).textContent = D.title ? D.title(S) : "Preferences";
    $(".hx", ph.el).innerHTML = D.head ? D.head(S) : "";
    var bk = $(".bk", ph.el); $(".bkw", ph.el).textContent = D.title && S.ui.drill ? "Preferences" : "Menu";
    ph.el.classList.toggle("drilled", !!(D.title && S.ui.drill));
    ph.bd.innerHTML = D.draw(S);
    ph.shEl.innerHTML = D.sheet && S.ui.sheet ? D.sheet(S) : ""; ph.shEl.hidden = !(D.sheet && S.ui.sheet);
    var modal = !!(D.sheet && S.ui.sheet); ph.bd.inert = modal; $(".hd", ph.el).inert = modal;
    if (modal && !(key && ph.shEl.contains($('[data-fk="' + key.replace(/"/g, '\\"') + '"]', ph.el)))) { var f0 = $(".shp .ib", ph.el); if (f0) f0.focus({ preventScroll: true }); key = null; }
    ph.bd.classList.toggle("pgd", !!D.pager);
    ph.bd.scrollTop = top;
    if (D.pager) { var pg = $("[data-pager]", ph.el); if (pg) { pg.style.scrollBehavior = "auto"; pg.scrollLeft = sc != null && keepPager ? pg.clientWidth * S.ui.page : pg.clientWidth * S.ui.page; $$(".pgs", pg).forEach(function (x, n) { x.scrollTop = pgTop[n] || 0; }); pg.style.scrollBehavior = ""; } }
    if (key) { var el = $('[data-fk="' + key.replace(/"/g, '\\"') + '"]', ph.el); if (el && !el.disabled) { try { el.focus({ preventScroll: true }); } catch (e) { } } }
    ph.el.setAttribute("data-scope", S.scope);
  };
  Phone.prototype.act = function (a, btn) {
    var ph = this, S = ph.S, U = S.ui, p = a.split(":"), v = p[0], id = p[1], r;
    if (v === "scope") { S.scope = id; U.open = null; U.conf = null; U.add = null; U.disc = null; U.qopen = false; U.grp = U.grp; U.sheet = null; if (S.scope === "hh" && U.tab !== "avoid" && !ofKind(S, U.tab).length) U.tab = "avoid"; }
    else if (v === "tog") { U.open = U.open === id ? null : id; U.conf = null; }
    else if (v === "sheet") { U.sheet = id; U.open = id; U.conf = null; ph.sheetKey = btn ? btn.getAttribute("data-fk") : null; }
    else if (v === "sheetx") { U.sheet = null; U.open = null; U.conf = null; var k = ph.sheetKey; ph.draw(); var el = k ? $('[data-fk="' + k + '"]', ph.el) : null; if (el) el.focus({ preventScroll: true }); return; }
    else if (v === "set") { r = ph.rule(id); if (p[2] === "soft" && r.hard) U.conf = { id: id, k: "soft" }; else if (p[2] === "hard") { r.hard = true; U.conf = null; } }
    else if (v === "softok") { ph.rule(id).hard = false; U.conf = null; }
    else if (v === "keep") U.conf = null;
    else if (v === "stop") { r = ph.rule(id); if (r.kind === "avoid" && r.hard) U.conf = { id: id, k: "stop" }; else { S.rules = S.rules.filter(function (x) { return x.id !== id; }); U.open = null; U.sheet = null; } }
    else if (v === "stopok") { S.rules = S.rules.filter(function (x) { return x.id !== id; }); U.open = null; U.conf = null; U.sheet = null; }
    else if (v === "add") { U.add = U.add === id ? null : id; }
    else if (v === "addany") { U.addany = !U.addany; U.add = null; }
    else if (v === "addk") { U.add = id; }
    else if (v === "q") U.qopen = !U.qopen;
    else if (v === "qnone") dials(S).q.on = false;
    else if (v === "qagain") dials(S).q.on = true;
    else if (v === "step") { var D = dials(S); D.cap = Math.max(1, Math.min(20, D.cap + (+id))); }
    else if (v === "disc") U.disc = U.disc === id ? null : id;
    else if (v === "drill") U.drill = id;
    else if (v === "back") { if (U.drill) U.drill = null; else { ph.toast("Back to the Menu"); return; } }
    else if (v === "grp") U.grp = U.grp === id ? null : id;
    else if (v === "tab") { U.tab = id; U.add = null; U.open = null; }
    else if (v === "pg") { var n = Math.max(0, Math.min(PAGES.length - 1, U.page + (+id))); U.page = n; ph.draw(); var pg = $("[data-pager]", ph.el); if (pg) pg.scrollTo({ left: pg.clientWidth * n, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); return; }
    else if (v === "toast") { ph.toast("Suggest something for " + id); return; }
    else if (v === "ask") { S.stops.splice(+id, 1); ph.toast("Will ask again"); }
    else if (v === "find") { ph.toast("Search works from here as in the chosen design."); return; }
    ph.draw();
  };

  /* words the person has to read on the first screen: everything visible except sample data and screen-reader-only text */
  function wordCount(ph) {
    var c = ph.el.cloneNode(true); $$(".d,.vh,svg,.toast,.sheet,.dots", c).forEach(function (x) { x.remove(); });
    $$("[hidden],[inert]", c).forEach(function (x) { x.remove(); });
    var t = $(".hd", c) ? "" : ""; var parts = [$(".hd .ttl", c) ? $(".hd .ttl", c).textContent : "", $(".bd", c).textContent];
    var bk = $(".bkw", c); if (bk) parts.push(bk.textContent);
    return parts.join(" ").replace(/[·→–]/g, " ").split(/\s+/).filter(function (w) { return /[A-Za-z0-9]/.test(w); }).length;
  }
  function make(host, o, preset) { var ph = new Phone(host, o); if (preset) preset(ph); return ph; }
  function drop(ph) { var i = phones.indexOf(ph); if (i > -1) phones.splice(i, 1); ph.el.remove(); }
  window.PO = { make: make, drop: drop, setScale: setScale, pickTheme: pickTheme, META: META, JOBS: JOBS, ORDER: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], wordCount: wordCount, KINDS: KINDS };
})();
