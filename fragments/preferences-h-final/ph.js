/* Preferences, option H final (bottom-sheet editing). Phone only. Mockup only: nothing here is built by this file.
   Owner, 25 Oct 2026: "build H". Base = fragments/preferences-options option H (read-only list; every add and edit in ONE bottom sheet).
   Locked decisions (coordinator, 25 Oct 2026): Add and Edit open the same sheet; swipe a row LEFT to remove it (a Hard rule asks in place, anything else goes at once); after any removal a short Undo bar;
   a button in the sheet is the non-gesture way; "Reason" is "Comment" with a "Share with household" box, OFF by default; a plus button on the right of each group header opens the sheet for that group (no add rows);
   Hard and Soft are WORDS, not lock glyphs (owner, 25 Oct 2026 07:36, closes SR-Q64); Just you and Everyone stay one person and two people. "Exceptions to a rule" is closed: exceptions live in the Comment text.
   Class names are the BUILD's (fgroup, fh, frow, fmain, fmark, fscope) so the CSS and markup lift into the app. Theme tokens only. Everything drawn is escaped. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var P = {
    back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    one: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
    many: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.1 2.7-5 6-5s6 1.9 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.6 0 4.5 1.6 4.5 4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', bell: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>', note: '<path d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h5"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>', power: '<path d="M12 3v9M6.5 6.5a8 8 0 1 0 11 0"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'
  };
  function ic(n, s, cls) { return '<svg class="i' + (cls ? " " + cls : "") + '" style="width:' + (s || 1.4) + 'em;height:' + (s || 1.4) + 'em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + P[n] + "</svg>"; }
  function d(s) { return '<span class="d">' + esc(s) + "</span>"; } /* sample data: never counted as interface words */

  /* the four groups: id, heading, singular (sheet title), the label of the thing in the sheet */
  var KINDS = [["avoid", "Avoids", "Avoid", "Food"], ["like", "Likes", "Like", "Food"], ["swap", "Swaps", "Swap", "Instead of"], ["limit", "Limits", "Limit", "Food"]];
  function kd(k) { return KINDS.filter(function (x) { return x[0] === k; })[0]; }
  var UNDO_MS = 8000;

  /* sample data: the owner's own (gluten is Hard for Everyone, comment shared; the rest Just you, comments private), plus one household rule another admin wrote whose comment is private to them */
  function fresh() {
    return {
      scope: "me", role: "admin", n: 100,
      d: { me: { on: true, q: { on: true, s: "22:00", e: "06:00" }, cap: 3 }, hh: { on: true, q: { on: true, s: "22:00", e: "06:00" }, cap: 3 } },
      rules: [
        { id: "g", kind: "avoid", hard: true, who: "hh", s: "gluten", why: "Coeliac, so nothing with wheat, barley or rye", share: true, by: "me" },
        { id: "h2", kind: "avoid", hard: true, who: "hh", s: "peanuts", why: "Sam is allergic", share: false, by: "sam" },
        { id: "p", kind: "avoid", hard: true, who: "me", s: "pasta", why: "Too many carbs", share: false, by: "me" },
        { id: "r", kind: "avoid", hard: true, who: "me", s: "roti", why: "Too many carbs", share: false, by: "me" },
        { id: "t", kind: "avoid", hard: true, who: "me", s: "tomato-based foods", why: "Reflux", share: false, by: "me" },
        { id: "n", kind: "avoid", hard: true, who: "me", s: "non-rice noodles", why: "Too many carbs", share: false, by: "me" },
        { id: "i", kind: "avoid", hard: false, who: "me", s: "iceberg lettuce", why: "", share: false, by: "me" },
        { id: "l1", kind: "like", who: "me", s: "protein-forward carb-conscious meals", why: "", by: "me" },
        { id: "l2", kind: "like", who: "me", s: "gluten-free bread", why: "", by: "me" },
        { id: "l3", kind: "like", who: "me", s: "rice noodles", why: "", by: "me" },
        { id: "s1", kind: "swap", who: "me", s: "white bread", to: "gluten-free bread", why: "", by: "me" },
        { id: "c1", kind: "limit", who: "me", s: "fried food", max: 2, why: "", by: "me" }
      ],
      note: "", places: [["Dairy in the Fridge", "Low, weekly"], ["Freezer items", "Out, daily"]], stops: [["Anchovies", "Low check"]], mates: ["Sam", "Pat"],
      ui: { conf: null, sheet: null, draft: null, qopen: false, disc: null, undo: null, err: "", say: "" }
    };
  }
  function t12(h) { var m = /^(\d\d):(\d\d)$/.exec(h || ""); if (!m) return ""; var H = +m[1], M = m[2], ap = H >= 12 ? "pm" : "am"; H = H % 12 || 12; return H + (M === "00" ? "" : ":" + M) + ap; }
  function quietText(q) { return q.on ? t12(q.s) + "–" + t12(q.e) : "Off"; }
  function dials(S) { return S.d[S.scope]; }
  function vis(S) { return S.rules.filter(function (r) { return S.scope === "me" || r.who === "hh"; }); }
  function ofKind(S, k) { return vis(S).filter(function (r) { return r.kind === k; }).sort(function (a, b) { return (b.hard === true) - (a.hard === true); }); }
  function mayChange(S, r) { return r.who === "me" || S.role === "admin"; }
  function mayAdd(S) { return S.scope === "me" || S.role === "admin"; }
  function canRead(r) { return r.share === true || r.by === "me"; } /* the viewer is "me": a private comment is readable by whoever wrote it, and by the person whose own rule it is */
  function hasComment(r) { return r.kind === "avoid"; } /* where a reason exists today: an avoid, Hard or Soft */
  function line(r) { return r.kind === "swap" ? "Swap in " + r.to : r.kind === "limit" ? "At most " + maxText(r.max) : ""; }
  function maxText(n) { return n === 1 ? "once a week" : n === 2 ? "twice a week" : n + " times a week"; }
  function fk(a) { return ' data-act="' + esc(a) + '" data-fk="' + esc(a) + '"'; }

  /* the state of a rule is a word (Hard, Soft) and a person glyph (one: Just you, two: Everyone); the word is never colour alone */
  function mark(r) { return r.kind === "avoid" ? '<span class="fmark' + (r.hard ? "" : " soft") + '"><span class="fw">' + (r.hard ? "Hard" : "Soft") + "</span></span>" : ""; }
  function who(r) { return r.who === "hh" ? '<span class="fscope" title="Everyone">' + ic("many", 1.4) + '<span class="vh">Everyone</span></span>' : '<span class="fscope" title="Just you">' + ic("one", 1.4) + '<span class="vh">Just you</span></span>'; }

  function seg(S) {
    return '<div class="seg" role="radiogroup" aria-label="Whose preferences">' + [["me", "Mine"], ["hh", "Everyone"]].map(function (x) {
      var on = S.scope === x[0]; return '<button type="button" role="radio" aria-checked="' + on + '"' + fk("scope:" + x[0]) + ">" + (on ? ic("check", 1.1) : "") + x[1] + "</button>";
    }).join("") + "</div>";
  }

  /* ---------- a group: heading, a plus on the right edge, the rows. No add row. ---------- */
  function row(S, r) {
    var conf = S.ui.conf && S.ui.conf.id === r.id, can = mayChange(S, r), ln = line(r);
    var inner;
    if (conf) {
      inner = '<div class="fr"><div class="propconf" role="group" aria-label="Remove this hard stop"><p>Remove this hard stop?</p><div class="btns"><button type="button" class="pbtn danger"' + fk("rmok:" + r.id) + '>Remove</button><button type="button" class="pbtn"' + fk("keep") + ">Keep</button></div></div></div>";
    } else {
      inner = '<div class="fr">' + (can ? '<div class="fdel" aria-hidden="true">' + ic("trash", 1.3) + "<span>Remove</span></div>" : "") +
        '<button type="button" class="fmain" data-act="sheet:' + esc(r.id) + '" data-fk="sheet:' + esc(r.id) + '" aria-haspopup="dialog"' + (can ? ' data-swipe-ok="1"' : "") + '><span class="rm"><span class="nm">' + d(r.s) + "</span>" + (ln ? '<span class="fline">' + d(ln) + "</span>" : "") + "</span>" + mark(r) + who(r) + "</button></div>";
    }
    return '<li class="frow" data-row="' + esc(r.id) + '" data-rkind="ingredient">' + inner + "</li>";
  }
  function group(S, k) {
    var rs = ofKind(S, k[0]);
    if (!rs.length && S.scope === "hh" && k[0] !== "avoid") return "";
    var plus = mayAdd(S) ? '<button type="button" class="fplus' + (k[0] === "avoid" ? "" : " quiet") + '"' + fk("add:" + k[0]) + ' aria-haspopup="dialog" aria-label="Add ' + k[2].toLowerCase() + '">' + ic("plus", 1.4) + "</button>" : "";
    return '<section class="fgroup" data-setting="' + k[0] + 's" aria-label="' + k[1] + '"><div class="fh"><h3>' + k[1] + "</h3>" + plus + '</div><ul class="flist">' + rs.map(function (r) { return row(S, r); }).join("") + "</ul></section>";
  }

  /* ---------- the dial rows and the other rows: unchanged from option H ---------- */
  function swRow(S) { var D = dials(S); return '<div class="crow" data-ctl="checks"><span class="nm">Amount checks</span><label class="sw"><input type="checkbox" role="switch" data-sw="on" data-fk="sw" aria-label="Amount checks"' + (D.on ? " checked" : "") + '><span class="swt"></span></label></div>'; }
  function quietPanel(S) {
    var q = dials(S).q;
    return '<div class="tms">' + (q.on ? '<input type="time" class="tm" data-q="s" value="' + esc(q.s) + '" aria-label="Quiet hours from" data-fk="qs"><span aria-hidden="true">–</span><input type="time" class="tm" data-q="e" value="' + esc(q.e) + '" aria-label="Quiet hours to" data-fk="qe"><button type="button" class="lnk"' + fk("qnone") + ">No quiet hours</button>" : '<button type="button" class="lnk"' + fk("qagain") + ">Use quiet hours</button>") + "</div>";
  }
  function quietRow(S) {
    var q = dials(S).q, open = S.ui.qopen;
    return '<div class="crow vcol" data-ctl="quiet"><button type="button" class="vrow"' + fk("q") + ' aria-expanded="' + open + '"><span class="nm">Quiet hours</span><span class="val">' + quietText(q) + '</span><span class="chev' + (open ? " up" : "") + '">' + ic("down", 1.1) + "</span></button>" + (open ? quietPanel(S) : "") + "</div>";
  }
  function capRow(S) {
    var D = dials(S);
    return '<div class="crow" data-ctl="cap"><span class="nm">Suggestions a day</span><span class="num" role="group" aria-label="Suggestions a day"><button type="button"' + fk("step:-1") + ' aria-label="Fewer"' + (D.cap <= 1 ? " disabled" : "") + '>−</button><b aria-live="polite">' + D.cap + '</b><button type="button"' + fk("step:1") + ' aria-label="More"' + (D.cap >= 20 ? " disabled" : "") + ">+</button></span></div>";
  }
  function extraDefs(S) {
    var out = [];
    out.push({ id: "notes", label: "Assistant notes", val: S.note, body: '<textarea class="in ta" rows="2" maxlength="600" placeholder="Anything to know" aria-label="Assistant notes" data-note data-fk="note">' + esc(S.note) + "</textarea>" });
    if (S.scope === "me") out.push({ id: "mates", label: "Housemates", val: S.mates.length, body: S.mates.map(function (m) { return '<div class="mate"><span class="av">' + esc(m[0]) + '</span><span class="nm">' + d(m) + "</span></div>"; }).join("") });
    out.push({ id: "places", label: "Place rules", val: S.places.length, body: S.places.map(function (p) { return '<div class="mate"><span class="nm">' + d(p[0]) + '</span><span class="sm">' + d(p[1]) + "</span></div>"; }).join("") });
    if (S.scope === "me" && S.stops.length) out.push({ id: "stops", label: "Switched off", val: S.stops.length, body: S.stops.map(function (p, n) { return '<div class="mate"><span class="rm"><span class="nm">' + d(p[0]) + '</span><span class="sm">' + d(p[1]) + '</span></span><button type="button" class="lnk"' + fk("ask:" + n) + ">Ask again</button></div>"; }).join("") });
    return out;
  }
  function discRow(S, x) {
    var open = S.ui.disc === x.id, v = x.id === "notes" ? (x.val ? '<span class="val">' + d(x.val) + "</span>" : "") : '<span class="val">' + d(x.val) + "</span>";
    return '<div class="crow vcol" data-ctl="' + x.id + '"><button type="button" class="vrow"' + fk("disc:" + x.id) + ' aria-expanded="' + open + '"><span class="nm">' + x.label + "</span>" + v + '<span class="chev' + (open ? " up" : "") + '">' + ic("down", 1.1) + "</span></button>" + (open ? '<div class="dbody">' + x.body + "</div>" : "") + "</div>";
  }

  function body(S) {
    var h = '<div class="blk">' + seg(S) + '</div><div class="fl">';
    KINDS.forEach(function (k) { h += group(S, k); });
    h += "</div>" + '<h3 class="hd2"><span></span></h3>' + swRow(S) + quietRow(S) + capRow(S) + extraDefs(S).map(function (x) { return discRow(S, x); }).join("");
    return h;
  }

  /* ---------- the sheet: ONE design for Add and Edit ---------- */
  function sheet(S) {
    var sh = S.ui.sheet; if (!sh) return "";
    var add = sh.mode === "add", r = add ? null : S.rules.filter(function (x) { return x.id === sh.id; })[0], D = S.ui.draft, k = add ? sh.kind : r.kind, K = kd(k);
    if (!add && !r) return "";
    var can = add ? mayAdd(S) : mayChange(S, r), item = add ? D : r, h = "";
    var title = add ? "Add " + K[2].toLowerCase() : r.s;
    if (add) {
      h += '<label class="flab" for="sh-name">' + K[3] + '</label><input id="sh-name" class="in" type="text" maxlength="60" autocomplete="off" value="' + esc(D.s) + '" data-in="s" data-fk="in:s"' + (S.ui.err ? ' aria-invalid="true" aria-describedby="sh-err"' : "") + ">";
      if (S.ui.err) h += '<p class="note error" id="sh-err" role="alert">' + esc(S.ui.err) + "</p>";
      if (k === "swap") h += '<label class="flab" for="sh-to">Use</label><input id="sh-to" class="in" type="text" maxlength="60" autocomplete="off" value="' + esc(D.to) + '" data-in="to" data-fk="in:to">';
      if (k === "limit") h += '<div class="crow flat" data-ctl="max"><span class="nm" id="sh-maxl">Times a week</span><span class="num" role="group" aria-labelledby="sh-maxl"><button type="button"' + fk("max:-1") + ' aria-label="Fewer"' + (D.max <= 1 ? " disabled" : "") + '>−</button><b aria-live="polite">' + D.max + '</b><button type="button"' + fk("max:1") + ' aria-label="More"' + (D.max >= 21 ? " disabled" : "") + ">+</button></span></div>";
    } else if (line(r)) h += '<p class="said">' + d(line(r)) + "</p>";
    if (k === "avoid") {
      var hard = item.hard;
      if (can) {
        h += '<div class="seg two" role="radiogroup" aria-label="Hard or soft"><button type="button" role="radio" aria-checked="' + hard + '"' + fk("set:hard") + ">" + (hard ? ic("check", 1.1) : "") + 'Hard</button><button type="button" role="radio" aria-checked="' + !hard + '"' + fk("set:soft") + ">" + (!hard ? ic("check", 1.1) : "") + "Soft</button></div>";
        if (S.ui.conf && S.ui.conf.k === "soft") h += '<div class="propconf" role="group" aria-label="Make it soft"><p>Make it soft? It can still turn up.</p><div class="btns"><button type="button" class="pbtn"' + fk("softok") + '>Make soft</button><button type="button" class="pbtn"' + fk("keep") + ">Keep hard</button></div></div>";
        h += '<p class="sm conseq" aria-live="polite">' + (hard ? "Never suggested." : "Ranked lower.") + "</p>";
      } else h += '<p class="aud"><span class="fw">' + (hard ? "Hard" : "Soft") + "</span></p>";
    }
    if (add && can) {
      var hh = D.who === "hh";
      h += S.scope === "hh" ? "" : '<div class="seg two" role="radiogroup" aria-label="Who is it for"><button type="button" role="radio" aria-checked="' + !hh + '"' + fk("who:me") + ">" + ic("one", 1.2) + 'Just you</button><button type="button" role="radio" aria-checked="' + hh + '"' + (S.role === "admin" ? fk("who:hh") : " disabled") + ">" + ic("many", 1.2) + "Everyone</button></div>";
    } else h += '<p class="aud">' + (item.who === "hh" ? ic("many", 1.3) + " Everyone" : ic("one", 1.3) + " Just you") + "</p>";
    if (k === "avoid" && (add || canRead(r))) {
      var share = item.share === true, why = item.why;
      if (can) {
        h += '<label class="chk" for="sh-share"><input id="sh-share" type="checkbox" data-in="share" data-fk="in:share"' + (share ? " checked" : "") + '><span class="bx" aria-hidden="true">' + ic("check", 1.1) + '</span><span>Share with household</span></label>';
        h += '<p class="sm" role="status" data-shnote>' + (share ? "The household can read it." : "Only you can read it.") + "</p>";
        h += '<label class="flab" for="sh-why">Comment</label><textarea id="sh-why" class="in ta" rows="2" maxlength="200" placeholder="Optional" data-in="why" data-fk="in:why">' + esc(why) + "</textarea>";
      } else if (why) h += '<p class="flab">Comment</p><p class="said">' + d(why) + "</p>";
    }
    if (!can) h += '<p class="sm lock">Admins only.</p>';
    var foot = "";
    if (add) foot = '<button type="button" class="pbtn primary"' + fk("addok") + ">Add</button>";
    else if (can) {
      var cf = S.ui.conf && S.ui.conf.k === "stop";
      foot = cf ? '<div class="propconf" role="group" aria-label="Remove this hard stop"><p>Remove this hard stop?</p><div class="btns"><button type="button" class="pbtn danger"' + fk("stopok") + ">Remove</button><button type=\"button\" class=\"pbtn\"" + fk("keep") + ">Keep</button></div></div>"
        : '<div class="btns"><button type="button" class="stopq"' + fk("stop") + ">" + ic("trash", 1.2) + " Remove</button><button type=\"button\" class=\"pbtn\"" + fk("sheetx") + ">Done</button></div>";
    }
    return '<div class="shd" data-act="sheetx"></div><div class="shp" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="shh"><b class="nm" id="sh-t">' + (add ? esc(title) : d(title)) + '</b><button type="button" class="ib"' + fk("sheetx") + ' aria-label="Close">' + ic("x", 1.4) + '</button></div><div class="ped">' + h + (foot ? '<div class="shf">' + foot + "</div>" : "") + "</div></div>";
  }

  /* ============================================================ the phone ============================================================ */
  var phones = [], scale = 0;
  function scaleVars(n) { var s = n === 3 ? 1.3 : 1, h = Math.max(0.88, Math.min(1.15, 1 + (s - 1) / 2)); return { ts: s, hk: h / s }; }
  function applyScale(ph) { var v = scaleVars(scale); ph.el.style.setProperty("--ts", v.ts); ph.el.style.setProperty("--hk", v.hk); }
  function setScale(n) { scale = n; phones.forEach(applyScale); }
  function pickTheme(id) { var b = document.createElement("button"); b.hidden = true; b.setAttribute("data-theme-pick", id); document.body.appendChild(b); b.click(); b.remove(); }
  var GO = 72; /* px: past this a swipe is a removal; short of it the row springs back (the receipt rows use 72 too) */

  function Phone(host) {
    var ph = this; ph.S = fresh(); ph.undoMs = UNDO_MS;
    ph.el = document.createElement("div"); ph.el.className = "ph";
    ph.el.innerHTML = '<header class="hd"><button type="button" class="bk" data-act="back" aria-label="Back">' + ic("back", 1.4) + '</button><h2 class="ttl">Preferences</h2><button type="button" class="ib" data-act="find" aria-label="Search settings">' + ic("search", 1.4) + '</button></header><div class="bd" data-bd></div><div class="sheet" hidden></div><div class="undo" role="status" aria-live="polite" hidden></div><div class="toast" role="status" aria-live="polite" hidden></div><p class="vh" role="status" aria-live="polite" data-say></p>';
    host.appendChild(ph.el); ph.bd = $("[data-bd]", ph.el); ph.shEl = $(".sheet", ph.el); phones.push(ph); applyScale(ph);
    ph.el.addEventListener("click", function (e) {
      var sr = e.target.closest(".fmain"); if (ph.swiped && Date.now() - ph.swiped < 350 && sr && sr.closest(".frow").getAttribute("data-row") === ph.swipedRow) { e.preventDefault(); e.stopPropagation(); return; }
      var b = e.target.closest("[data-act]"); if (b && ph.el.contains(b) && !b.disabled) ph.act(b.getAttribute("data-act"), b);
    });
    ph.el.addEventListener("change", function (e) { var t = e.target; if (t.hasAttribute("data-sw")) { dials(ph.S).on = t.checked; ph.draw(); } else if (t.hasAttribute("data-q")) { dials(ph.S).q[t.getAttribute("data-q")] = t.value || dials(ph.S).q[t.getAttribute("data-q")]; ph.draw(); } else if (t.getAttribute("data-in") === "share") ph.setField("share", t.checked); });
    ph.el.addEventListener("input", function (e) { var t = e.target, f = t.getAttribute && t.getAttribute("data-in"); if (f && f !== "share") ph.setField(f, t.value); else if (t.hasAttribute && t.hasAttribute("data-note")) ph.S.note = t.value; });
    ph.el.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ph.S.ui.sheet) { ph.act("sheetx"); return; }
      if (e.key === "Tab" && ph.S.ui.sheet) { var f = $$("button,input,textarea,[href]", $(".shp", ph.el)).filter(function (x) { return !x.disabled && x.offsetParent !== null; }); if (!f.length) return; var i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); } }
      /* the keyboard way to a swipe: Delete or Backspace on a row removes it, the same way */
      if ((e.key === "Delete" || e.key === "Backspace") && e.target.matches && e.target.matches(".fmain[data-swipe-ok]")) { e.preventDefault(); ph.act("swipe:" + e.target.closest(".frow").getAttribute("data-row")); }
    });
    ph.swipes();
    ph.draw();
  }
  Phone.prototype.rule = function (id) { return this.S.rules.filter(function (r) { return r.id === id; })[0]; };
  Phone.prototype.toast = function (t) { var el = $(".toast", this.el); el.textContent = t; el.hidden = false; clearTimeout(this.tt); this.tt = setTimeout(function () { el.hidden = true; }, 2200); };
  Phone.prototype.say = function (t) { var el = $("[data-say]", this.el); el.textContent = ""; setTimeout(function () { el.textContent = t; }, 30); };
  Phone.prototype.setField = function (f, v) {
    var S = this.S, sh = S.ui.sheet; if (!sh) return;
    var o = sh.mode === "add" ? S.ui.draft : this.rule(sh.id); if (!o) return;
    o[f] = v; if (f === "s") S.ui.err = "";
    if (f === "share") { var n = $("[data-shnote]", this.el); if (n) n.textContent = v ? "The household can read it." : "Only you can read it."; }
  };

  /* swipe a row left: a row follows the finger on its own track; vertical movement stays the page's scroll (touch-action: pan-y), so the page never fights it */
  Phone.prototype.swipes = function () {
    var ph = this, g = null;
    ph.el.addEventListener("pointerdown", function (e) {
      var m = e.target.closest && e.target.closest(".fmain[data-swipe-ok]"); if (!m || !e.isPrimary || ph.S.ui.sheet) { g = null; return; }
      g = { x: e.clientX, y: e.clientY, m: m, on: false, id: e.pointerId };
    });
    ph.el.addEventListener("pointermove", function (e) {
      if (!g || e.pointerId !== g.id) return; var dx = e.clientX - g.x, dy = e.clientY - g.y;
      if (!g.on) { if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { g = null; return; } if (dx > -12 || Math.abs(dx) < Math.abs(dy) * 1.4) return; g.on = true; g.m.classList.add("drag"); try { g.m.setPointerCapture(e.pointerId); } catch (x) { /* no capture */ } }
      var x = Math.max(-140, Math.min(0, dx)); g.m.style.transform = "translateX(" + x + "px)"; g.m.parentNode.setAttribute("data-swipe", x <= -GO ? "armed" : "on");
    });
    function end(e, cancel) {
      if (!g || e.pointerId !== g.id) return; var s = g; g = null; var dx = e.clientX - s.x;
      s.m.classList.remove("drag"); s.m.style.transform = ""; s.m.parentNode.removeAttribute("data-swipe");
      if (!s.on) return; ph.swiped = Date.now(); ph.swipedRow = s.m.closest(".frow").getAttribute("data-row"); if (cancel || dx > -GO) return;
      ph.act("swipe:" + s.m.closest(".frow").getAttribute("data-row"));
    }
    ph.el.addEventListener("pointerup", function (e) { end(e, false); });
    ph.el.addEventListener("pointercancel", function (e) { end(e, true); });
  };

  Phone.prototype.draw = function () {
    var ph = this, S = ph.S, a = document.activeElement, key = a && ph.el.contains(a) ? a.getAttribute("data-fk") : null, top = ph.bd.scrollTop;
    ph.bd.innerHTML = body(S);
    var open = !!S.ui.sheet;
    ph.shEl.innerHTML = open ? sheet(S) : ""; ph.shEl.hidden = !open;
    ph.bd.inert = open; $(".hd", ph.el).inert = open;
    ph.bd.scrollTop = top;
    ph.drawUndo();
    if (open && !(key && ph.shEl.querySelector('[data-fk="' + key.replace(/"/g, '\\"') + '"]'))) { var f0 = ph.focusFirst(); if (f0) key = null; }
    if (key && !(open && !ph.shEl.querySelector('[data-fk="' + key.replace(/"/g, '\\"') + '"]'))) { var el = $('[data-fk="' + key.replace(/"/g, '\\"') + '"]', open ? ph.shEl : ph.el); if (el && !el.disabled) { try { el.focus({ preventScroll: true }); } catch (e) { } } }
    ph.el.setAttribute("data-scope", S.scope);
  };
  Phone.prototype.focusFirst = function () { var s = $(".shp", this.el); if (!s) return null; var t = $("input:not([type=checkbox]),textarea", s) && S_isAdd(this.S) ? $("input:not([type=checkbox])", s) : $(".shh .ib", s); if (t) t.focus({ preventScroll: true }); return t; };
  function S_isAdd(S) { return S.ui.sheet && S.ui.sheet.mode === "add"; }
  Phone.prototype.drawUndo = function () {
    var ph = this, u = ph.S.ui.undo, el = $(".undo", ph.el);
    if (!u || ph.S.ui.sheet) { el.hidden = true; el.innerHTML = ""; return; }
    el.innerHTML = '<span class="u-t">Removed ' + d(u.rule.s) + '</span><button type="button" class="u-b" data-act="undo" data-fk="undo">Undo</button>'; el.hidden = false;
  };
  Phone.prototype.startUndo = function (rule, index) {
    var ph = this; clearTimeout(ph.ut); ph.S.ui.undo = { rule: rule, index: index };
    ph.ut = setTimeout(function () { ph.S.ui.undo = null; ph.drawUndo(); }, ph.undoMs);
  };
  Phone.prototype.remove = function (id, from) {
    var ph = this, S = ph.S, i = S.rules.findIndex(function (r) { return r.id === id; }); if (i < 0) return;
    var r = S.rules[i]; S.rules.splice(i, 1); S.ui.conf = null; S.ui.sheet = null; S.ui.draft = null; ph.startUndo(r, i);
    ph.say("Removed " + r.s); ph.draw();
    /* focus goes to the next row in the group, else the group's plus */
    var nxt = $$(".frow .fmain", ph.el).filter(function (x) { return true; }); var g = $('.fgroup[data-setting="' + r.kind + 's"]', ph.el);
    var t = g && ($(".frow .fmain", g) || $(".fplus", g)); if (from !== "sheet" && t) t.focus({ preventScroll: true }); else if (t) t.focus({ preventScroll: true });
  };

  Phone.prototype.act = function (a, btn) {
    var ph = this, S = ph.S, U = S.ui, p = a.split(":"), v = p[0], id = p[1], r;
    if (v === "scope") { S.scope = id; U.conf = null; U.disc = null; U.qopen = false; U.sheet = null; }
    else if (v === "sheet") { U.sheet = { mode: "edit", id: id }; U.conf = null; U.err = ""; ph.sheetKey = btn ? btn.getAttribute("data-fk") : null; }
    else if (v === "add") { U.sheet = { mode: "add", kind: id }; U.draft = { s: "", to: "", max: 2, hard: true, who: S.scope === "hh" ? "hh" : "me", why: "", share: false }; U.err = ""; U.conf = null; ph.sheetKey = btn ? btn.getAttribute("data-fk") : null; }
    else if (v === "sheetx") { U.sheet = null; U.draft = null; U.conf = null; U.err = ""; var k = ph.sheetKey; ph.draw(); var el = k ? $('[data-fk="' + k.replace(/"/g, '\\"') + '"]', ph.el) : null; if (el) el.focus({ preventScroll: true }); return; }
    else if (v === "set") { var tgt = U.sheet.mode === "add" ? U.draft : ph.rule(U.sheet.id); if (id === "soft" && tgt.hard && U.sheet.mode === "edit") U.conf = { k: "soft" }; else { tgt.hard = id === "hard"; U.conf = null; } }
    else if (v === "softok") { ph.rule(U.sheet.id).hard = false; U.conf = null; }
    else if (v === "keep") { var cid = U.conf && U.conf.id; U.conf = null; ph.draw(); var kb = cid ? $('.frow[data-row="' + cid + '"] .fmain', ph.el) : null; if (kb) kb.focus({ preventScroll: true }); return; }
    else if (v === "who") { U.draft.who = id; }
    else if (v === "max") { U.draft.max = Math.max(1, Math.min(21, U.draft.max + (+id))); }
    else if (v === "addok") {
      var D = U.draft, K = U.sheet.kind; if (!D.s.trim()) { U.err = "Needed"; ph.draw(); var n = $("#sh-name", ph.el); if (n) n.focus(); return; }
      if (K === "swap" && !D.to.trim()) { U.err = "Needed"; ph.draw(); var n2 = $("#sh-to", ph.el); if (n2) n2.focus(); return; }
      var nr = { id: "n" + (++S.n), kind: K, who: D.who, s: D.s.trim(), why: K === "avoid" ? D.why.trim() : "", share: K === "avoid" && D.share, by: "me" };
      if (K === "avoid") nr.hard = D.hard; if (K === "swap") nr.to = D.to.trim(); if (K === "limit") nr.max = D.max;
      S.rules.push(nr); U.sheet = null; U.draft = null; ph.say("Added " + nr.s); ph.draw();
      var nb = $('.frow[data-row="' + nr.id + '"] .fmain', ph.el); if (nb) nb.focus({ preventScroll: true }); return;
    }
    else if (v === "stop") { r = ph.rule(U.sheet.id); if (r.kind === "avoid" && r.hard) U.conf = { k: "stop" }; else return ph.remove(r.id, "sheet"); }
    else if (v === "stopok") return ph.remove(U.sheet.id, "sheet");
    else if (v === "swipe") { r = ph.rule(id); if (!r || !mayChange(S, r)) return; if (r.kind === "avoid" && r.hard) { U.conf = { id: id, k: "swipe" }; ph.draw(); var kp = $('.frow[data-row="' + id + '"] .propconf .pbtn:last-child', ph.el); if (kp) kp.focus({ preventScroll: true }); return; } return ph.remove(id, "row"); }
    else if (v === "rmok") return ph.remove(id, "row");
    else if (v === "undo") {
      var u = U.undo; if (!u) return; clearTimeout(ph.ut); U.undo = null; S.rules.splice(Math.min(u.index, S.rules.length), 0, u.rule); ph.say("Back: " + u.rule.s); ph.draw();
      var ub = $('.frow[data-row="' + u.rule.id + '"] .fmain', ph.el); if (ub) ub.focus({ preventScroll: true }); return;
    }
    else if (v === "q") U.qopen = !U.qopen;
    else if (v === "qnone") dials(S).q.on = false;
    else if (v === "qagain") dials(S).q.on = true;
    else if (v === "step") { var D2 = dials(S); D2.cap = Math.max(1, Math.min(20, D2.cap + (+id))); }
    else if (v === "disc") U.disc = U.disc === id ? null : id;
    else if (v === "back") { ph.toast("Back to the Menu"); return; }
    else if (v === "ask") { S.stops.splice(+id, 1); ph.toast("Will ask again"); }
    else if (v === "find") { ph.toast("Search works from here as in the chosen design."); return; }
    ph.draw();
  };

  /* words the person has to read on the first screen: everything visible except sample data and screen-reader-only text */
  function wordCount(ph) {
    var c = ph.el.cloneNode(true); $$(".d,.vh,svg,.toast,.sheet,.undo,.fdel", c).forEach(function (x) { x.remove(); });
    $$("[hidden],[inert]", c).forEach(function (x) { x.remove(); });
    return [$(".hd .ttl", c).textContent, $(".bd", c).textContent].join(" ").replace(/[·→–]/g, " ").split(/\s+/).filter(function (w) { return /[A-Za-z0-9]/.test(w); }).length;
  }
  function make(host, preset) { var ph = new Phone(host); if (preset) preset(ph); return ph; }
  window.PH = { make: make, setScale: setScale, pickTheme: pickTheme, wordCount: wordCount, GO: GO, UNDO_MS: UNDO_MS };
})();
