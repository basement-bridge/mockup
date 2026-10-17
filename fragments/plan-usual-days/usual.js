/* The Off days flyout, usual days off cooking, at two levels: the household's, then each person's own (Kitchie #860). One script for phone and desktop: the same markup, the same classes (.ud-*),
   only the container differs (a bottom sheet on a phone, a right-hand flyout on desktop, see lane.css / sheet.css). Mockup only: nothing is saved.

   The model, written the way the build will hold it (see the Build impact section of the notes):
     S.hh                 the weekdays the household has off ("Mon".."Sun"). A weekday not listed is open for the household.
     S.own[person][day]   "off" | "open". Absent means the day is INHERITED: the person has said nothing, so the household's value applies. Today's personal list (plan_stencil) is exactly the "off" entries.
   The value of a day is open or off. Inherited is a flag on that value: it came from the household, the person did not set it. The effective value for a person on a weekday: their own setting if they have one (the person wins), else the household's (inherited).
   Controls above the flyout on the stand-in pages ("Mockup only") change the sample data and who is looking; they are not part of the design. */
(function () {
  "use strict";
  var WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    PL = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];
  var Q = new URLSearchParams(location.search);
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var PEOPLE3 = [["sam", "Sam"], ["jane", "Jane"], ["priya", "Priya"]];
  /* sample households (?data=...). typical shows every state at once: Tue and Fri are the household's days off; Sam inherits Tue, opens Fri and is off Sun; Jane is off Wed. */
  var PRE = {
    typical: { hh: ["Tue", "Fri"], people: PEOPLE3, own: { sam: { Fri: "open", Sun: "off" }, jane: { Wed: "off" }, priya: {} } },
    empty: { hh: [], people: PEOPLE3, own: { sam: {}, jane: {}, priya: {} } },
    everyday: { hh: ["Tue", "Fri"], people: PEOPLE3, own: { sam: { Mon: "open", Tue: "open", Wed: "off", Thu: "open", Fri: "open", Sat: "off", Sun: "off" }, jane: {}, priya: {} } },
    solo: { hh: [], people: [["sam", "Sam"]], own: { sam: { Sun: "off" } } },
    solohh: { hh: ["Fri"], people: [["sam", "Sam"]], own: { sam: {} } },
    removed: { hh: ["Tue", "Fri"], people: [["sam", "Sam"], ["priya", "Priya"]], own: { sam: { Fri: "open", Sun: "off" }, priya: {} } }
  };
  var S = UD_S();
  function UD_S() { return { data: "typical", hh: [], people: [], own: {}, me: "sam", admin: true, pick: null, say: null, host: null, mode: "lane", done: false, want: null }; }

  function load(k) {
    var p = PRE[k] || PRE.typical; S.data = PRE[k] ? k : "typical";
    S.hh = p.hh.slice(); S.people = p.people.map(function (x) { return { id: x[0], name: x[1] }; });
    S.own = {}; S.people.forEach(function (x) { S.own[x.id] = {}; for (var d in p.own[x.id] || {}) S.own[x.id][d] = p.own[x.id][d]; });
    S.pick = null; S.say = null;
  }
  function person(id) { return S.people.filter(function (p) { return p.id === id; })[0]; }
  function hhOff(d) { return S.hh.indexOf(d) > -1; }
  /* the effective result for a person on a weekday: their own setting wins, else the household's */
  function eff(id, d) {
    var o = S.own[id] && S.own[id][d];
    if (o) return { off: o === "off", src: "own" };
    return { off: hhOff(d), src: "inherited" };
  }
  /* The Household row is drawn when there is someone to share it with, or when household days exist (a person who is now alone still inherits them, so they must be visible and editable). */
  function showHH() { return S.people.length > 1 || S.hh.length > 0; }
  function ownDays(id) { return WD.filter(function (d) { return S.own[id] && S.own[id][d]; }); }
  function ownText(id) { return ownDays(id).map(function (d) { return d + " " + S.own[id][d]; }).join(", "); }
  function join(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function nameOf(id) { return id === S.me ? "you" : person(id).name; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  /* who differs from the household somewhere: people whose own setting disagrees with the household for that weekday */
  function differs() {
    var out = [];
    S.people.forEach(function (p) {
      var bits = WD.filter(function (d) { return S.own[p.id][d] && ((S.own[p.id][d] === "off") !== hhOff(d)); }).map(function (d) { return d + " " + S.own[p.id][d]; });
      if (bits.length) out.push((p.id === S.me ? "you" : p.name) + " (" + bits.join(", ") + ")");
    });
    return out;
  }

  /* ---- drawing ---- */
  function chip(row, d, i) {
    var hh = row === "hh", solo = !showHH(), dis, off, src = null, own = false, lab, ex = "";
    if (hh) { off = hhOff(d); dis = !S.admin; lab = FULL[i] + ", " + (off ? "not cooking" : "open") + " for the household" + (dis ? ", only household admins can change this" : ""); }
    else {
      var x = eff(row, d); off = x.off; own = x.src === "own"; src = solo ? null : x.src; dis = row !== S.me;
      lab = FULL[i] + ", " + (off ? "not cooking" : "open") + (solo ? "" : own ? ", set by " + (row === S.me ? "you" : person(row).name) : ", inherited from the household") + (dis ? ", " + person(row).name + " only can change this" : "");
      if (!solo && !dis) { var o = S.pick && S.pick.who === row && S.pick.day === d; ex = ' aria-expanded="' + !!o + '" aria-controls="ud-pick"'; }
    }
    return '<button type="button" class="ud-d" data-who="' + row + '" data-d="' + d + '" data-eff="' + (off ? "off" : "open") + '"' + (src ? ' data-src="' + src + '"' : "") + ' aria-pressed="' + off + '" aria-label="' + esc(lab) + '"' + ex + (dis ? " disabled" : "") + ' data-fk="' + row + ":" + d + '">' + d + (own && !solo ? '<i class="ud-dot" aria-hidden="true"></i>' : "") + "</button>";
  }
  function row(rowId) { return '<div class="ud-days" role="group" aria-labelledby="ud-l-' + rowId + '">' + WD.map(function (d, i) { return chip(rowId, d, i); }).join("") + "</div>"; }
  function say(rowId) { return S.say && S.say.row === rowId ? '<p class="ud-say" role="status"><span>' + esc(S.say.text) + "</span>" + (S.say.undo ? '<button type="button" class="ud-link" data-undo data-fk="undo">Undo</button>' : "") + "</p>" : ""; }

  function pickHtml(rowId) {
    if (!S.pick || S.pick.who !== rowId) return "";
    var d = S.pick.day, i = WD.indexOf(d), cur = S.own[rowId][d] || "inherit", h = hhOff(d) ? "off" : "open";
    function opt(v, t) { return '<button type="button" class="ud-opt" role="radio" aria-checked="' + (cur === v) + '" data-set="' + v + '" data-fk="set:' + v + '"><span class="ud-rd" aria-hidden="true"></span><span>' + t + "</span></button>"; }
    return '<div class="ud-pick" id="ud-pick" role="radiogroup" aria-label="' + FULL[i] + ', for you"><p class="ud-pick-h">' + PL[i] + ", for you</p>" +
      opt("inherit", "Inherited from the household <em>(" + h + ")</em>") + opt("off", "Off every " + FULL[i]) + opt("open", "Open every " + FULL[i]) + "</div>";
  }
  function personRow(p) {
    var me = p.id === S.me, solo = !showHH(), n = ownDays(p.id).length, hint, btn = "";
    var who = me ? "Your" : p.name + "’s";
    if (solo) hint = "";
    else if (n === 0) hint = S.hh.length ? "Every day is inherited from the household." : (me ? "Nothing set. Tap a day you do not cook." : "");
    else if (n === 7) hint = who + " own on every day. Nothing is inherited.";
    else hint = who + " own: " + ownText(p.id) + "." + (S.hh.length ? " The rest is inherited from the household." : "");
    if (me && !solo && n > 0) btn = '<button type="button" class="ud-link" data-clear aria-label="Clear my own days: every day inherited from the household" data-fk="clear">Inherit all</button>';
    var lab = me ? "You (" + esc(p.name) + ")" : esc(p.name) + " · only " + esc(p.name) + " can change";
    return '<div class="ud-lbl" id="ud-l-' + p.id + '">' + lab + "</div>" + row(p.id) + pickHtml(p.id) + say(p.id) +
      (hint || btn ? '<div class="ud-hr"><p class="ud-hint">' + esc(hint) + "</p>" + btn + "</div>" : "");
  }
  function hhRow() {
    var off = WD.filter(hhOff), dif = differs(), hint;
    if (!off.length) hint = "No household days off yet." + (S.admin ? " Tap the days nobody usually cooks." : "");
    else hint = "Off every " + join(off) + ". Everyone inherits this unless they set their own.";
    if (!S.admin) hint += " Only household admins can change this.";
    return '<div class="ud-lbl" id="ud-l-hh">Household<span> · everyone’s default</span></div>' + row("hh") + say("hh") +
      '<p class="ud-hint">' + esc(hint) + "</p>" + (dif.length ? '<p class="ud-hint ud-diff">Different for ' + esc(join(dif.length > 3 ? dif.slice(0, 3).concat(["" + (dif.length - 3) + " more"]) : dif)) + ".</p>" : "");
  }
  function legend() {
    if (!showHH() || (!S.hh.length && !S.people.some(function (p) { return ownDays(p.id).length; }))) return ""; /* nothing set anywhere: nothing to read */
    function sw(eff2, src, t) { return '<span class="ud-k"><span class="ud-d ud-sw" data-eff="' + eff2 + '" data-src="' + src + '" aria-hidden="true">' + (src === "own" ? '<i class="ud-dot"></i>' : "") + "</span>" + t + "</span>"; }
    return '<div class="ud-key" role="group" aria-label="How to read the days">' + sw("off", "inherited", "Off, inherited") + sw("off", "own", "Off, set by the person") + sw("open", "own", "Open, set by the person") + sw("open", "inherited", "Open, inherited") + "</div>";
  }
  function bodyHtml() {
    var h = '<div class="ud-pt"><div><h2 id="ud-t">Off days</h2><p class="ud-sub">Usual days off cooking. Each week starts with these blocked. Repeating days are set only here; the grid changes one week at a time.</p></div><button type="button" class="x ud-x" data-close aria-label="Close" data-fk="x"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    if (showHH()) h += hhRow();
    S.people.forEach(function (p) { h += personRow(p); });
    h += legend();
    h += '<button type="button" class="ud-done" data-close data-fk="done">Done</button>';
    return h;
  }

  /* ---- doing ---- */
  function summary(d, i) {
    /* after the household changed a day: who inherits it, whose own setting stays (only those that disagree with the new household value count) */
    var on = hhOff(d), fol = [], keep = [];
    S.people.forEach(function (p) { var o = S.own[p.id][d]; if (!o) fol.push(nameOf(p.id)); else if ((o === "off") !== on) keep.push(nameOf(p.id)); });
    var t = PL[i] + " are " + (on ? "off" : "open") + " for the household.";
    if (fol.length) t += " Inherited by: " + join(fol) + ".";
    if (keep.length) t += " Own setting stays: " + join(keep) + ".";
    return t;
  }
  function render() {
    if (!S.host) return;
    var ae = document.activeElement, fk = ae && ae.getAttribute && ae.getAttribute("data-fk"), sc = S.host.querySelector(".ud-scroll");
    var st = sc ? sc.scrollTop : 0;
    S.host.innerHTML = '<div class="ud ud-' + S.mode + '" id="ud" tabindex="-1" role="dialog" aria-modal="' + (S.mode !== "lane") + '" aria-labelledby="ud-t"><div class="ud-scroll">' + bodyHtml() + "</div></div>";
    var sc2 = S.host.querySelector(".ud-scroll"); if (sc2) sc2.scrollTop = st;
    var f = fk ? S.host.querySelector('[data-fk="' + fk + '"]') : null;
    if (S.want) { f = S.host.querySelector(S.want); S.want = null; }
    if (f && !f.disabled) f.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent("ud:change"));
  }
  function toggleHH(d) {
    if (!S.admin) return;
    var i = WD.indexOf(d), k = S.hh.indexOf(d);
    if (k > -1) S.hh.splice(k, 1); else S.hh.push(d);
    S.pick = null; S.say = { row: "hh", text: summary(d, i) }; S.want = '[data-fk="hh:' + d + '"]'; render();
  }
  function setOwn(who, d, v) {
    var i = WD.indexOf(d);
    if (v === "inherit") delete S.own[who][d]; else S.own[who][d] = v;
    var x = eff(who, d), t;
    if (v === "inherit") t = PL[i] + ": inherited again from the household (" + (hhOff(d) ? "off" : "open") + ").";
    else if (v === "off") t = PL[i] + ": off for you every week" + (hhOff(d) ? ", same as the household." : ".");
    else t = PL[i] + ": open for you every week" + (hhOff(d) ? ", the household has it off." : ", same as the household.");
    S.pick = null; S.say = { row: who, text: t }; S.want = '[data-fk="' + who + ":" + d + '"]'; render();
  }
  function onChip(b) {
    var who = b.getAttribute("data-who"), d = b.getAttribute("data-d");
    if (who === "hh") return toggleHH(d);
    if (who !== S.me) return;
    if (!showHH()) { /* nobody to inherit from: a plain on and off, as today */ var i = WD.indexOf(d); if (S.own[who][d]) delete S.own[who][d]; else S.own[who][d] = "off"; S.say = null; S.want = '[data-fk="' + who + ":" + d + '"]'; render(); return; }
    S.say = null;
    S.pick = S.pick && S.pick.who === who && S.pick.day === d ? null : { who: who, day: d };
    S.want = '[data-fk="' + who + ":" + d + '"]'; render();
    if (S.pick) { var f = S.host.querySelector('.ud-opt[aria-checked="true"]'); if (f) f.focus({ preventScroll: true }); }
  }
  function click(e) {
    var t = e.target.closest ? e.target.closest("button") : null; if (!t || !S.host.contains(t) || t.disabled) return;
    if (t.hasAttribute("data-close")) { UD.close(); return; }
    if (t.classList.contains("ud-d") && t.hasAttribute("data-who")) { onChip(t); return; }
    if (t.hasAttribute("data-set") && S.pick) { setOwn(S.pick.who, S.pick.day, t.getAttribute("data-set")); return; }
    if (t.hasAttribute("data-clear")) { var was = {}; for (var k in S.own[S.me]) was[k] = S.own[S.me][k]; S.own[S.me] = {}; S.pick = null; S.say = { row: S.me, text: "Your own days are cleared. Every day is inherited from the household.", undo: was }; S.want = '[data-fk="' + S.me + ":Mon\"]"; render(); return; }
    if (t.hasAttribute("data-undo") && S.say && S.say.undo) { S.own[S.me] = S.say.undo; S.say = { row: S.me, text: "Your own days are back." }; S.want = '[data-fk="' + S.me + ":Mon\"]"; render(); }
  }
  function key(e) {
    if (!S.host || !S.open) return;
    if (e.key === "Escape") { e.preventDefault(); if (S.pick) { var w = S.pick; S.pick = null; S.want = '[data-fk="' + w.who + ":" + w.day + '"]'; render(); } else UD.close(); return; }
    var t = e.target;
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && t.classList && t.classList.contains("ud-d")) {
      var cs = [].slice.call(t.parentNode.querySelectorAll(".ud-d:not(:disabled)")), i = cs.indexOf(t) + (e.key === "ArrowRight" ? 1 : -1);
      if (cs[i]) { e.preventDefault(); cs[i].focus(); }
    }
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && t.classList && t.classList.contains("ud-opt")) {
      var os = [].slice.call(t.parentNode.querySelectorAll(".ud-opt")), j = os.indexOf(t) + (e.key === "ArrowDown" ? 1 : -1);
      if (os[j]) { e.preventDefault(); os[j].focus(); }
    }
  }

  var UD = window.UD = {
    S: S, WD: WD, FULL: FULL, esc: esc, eff: eff, hhOff: hhOff, person: person, showHH: showHH, load: load,
    /* mount(host, mode): mode is "lane" (desktop right-hand flyout), "sheet" (phone bottom sheet) or "dialog" (centred window, the alternative drawn on desktop) */
    mount: function (host, mode) { S.host = host; S.mode = mode || "lane"; host.addEventListener("click", click); document.addEventListener("keydown", key); },
    open: function (back) { S.open = true; S.back = back || null; S.host.hidden = false; document.documentElement.setAttribute("data-ud-open", S.mode); render(); var f = S.host.querySelector("#ud"); if (f) f.focus({ preventScroll: true }); document.dispatchEvent(new CustomEvent("ud:open")); },
    close: function () { if (!S.open) return; S.open = false; S.pick = null; S.say = null; S.host.hidden = true; S.host.innerHTML = ""; document.documentElement.removeAttribute("data-ud-open"); if (S.back && S.back.focus) S.back.focus({ preventScroll: true }); document.dispatchEvent(new CustomEvent("ud:close")); },
    render: render, setAdmin: function (v) { S.admin = !!v; S.pick = null; S.say = null; render(); }, reset: function (k) { load(k); S.pick = null; S.say = null; render(); }
  };
  S.admin = Q.get("as") !== "member";
  load(Q.get("data") || "typical");
})();
