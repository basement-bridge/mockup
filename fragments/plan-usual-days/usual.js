/* The Off days flyout, usual days off cooking, at two levels: the household's, then each person's own (Kitchie #860). One script for phone and desktop: the same markup, the same classes (.ud-*),
   only the container differs (a bottom sheet on a phone, a right-hand flyout on desktop, see lane.css / sheet.css). Mockup only: nothing is saved.

   The model, written the way the build will hold it (see the Build impact section of the notes):
     S.hh                 the weekdays the household has off ("Mon".."Sun"). A weekday not listed is open for the household.
     S.own[person][day]   "off" | "open", kept ONLY where it differs from the household (owner, 17 Oct 2026: "anything I'm changing from the household is what I mark"). Absent means the day is the same as the household's.
                          Today's personal list (plan_stencil) is exactly the "off" entries.
   A day is open (unfilled) or off (filled). A day that differs from the household carries a dotted ring; a day that equals the household's is plain (it is simply inherited; its tooltip says "Same as household").
   Tapping a day on your own row flips it; flipping it back to the household's value deletes the override, so the tap is also the reset. No legend, no bulk reset.
   Controls above the flyout on the stand-in pages ("Mockup only") change the sample data and who is looking; they are not part of the design. */
(function () {
  "use strict";
  var WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    PL = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];
  var Q = new URLSearchParams(location.search);
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var PEOPLE3 = [["sam", "Sam"], ["jane", "Jane"], ["priya", "Priya"]];
  /* sample households (?data=...). typical shows every case at once: Tue and Fri are the household's days off; Sam is the same as the household on Tue (off) and differs on Fri (he opened it) and Sun (he closed it); Jane differs on Wed (she closed it). */
  var PRE = {
    typical: { hh: ["Tue", "Fri"], people: PEOPLE3, own: { sam: { Fri: "open", Sun: "off" }, jane: { Wed: "off" }, priya: {} } },
    empty: { hh: [], people: PEOPLE3, own: { sam: {}, jane: {}, priya: {} } },
    everyday: { hh: ["Tue", "Fri"], people: PEOPLE3, own: { sam: { Mon: "off", Tue: "open", Wed: "off", Thu: "off", Fri: "open", Sat: "off", Sun: "off" }, jane: {}, priya: {} } },
    solo: { hh: [], people: [["sam", "Sam"]], own: { sam: { Sun: "off" } } },
    solohh: { hh: ["Fri"], people: [["sam", "Sam"]], own: { sam: {} } },
    removed: { hh: ["Tue", "Fri"], people: [["sam", "Sam"], ["priya", "Priya"]], own: { sam: { Fri: "open", Sun: "off" }, priya: {} } }
  };
  var S = UD_S();
  function UD_S() { return { data: "typical", hh: [], people: [], own: {}, me: "sam", admin: true, say: null, host: null, mode: "lane", done: false, want: null }; }

  function load(k) {
    var p = PRE[k] || PRE.typical; S.data = PRE[k] ? k : "typical";
    S.hh = p.hh.slice(); S.people = p.people.map(function (x) { return { id: x[0], name: x[1] }; });
    S.own = {}; S.people.forEach(function (x) { S.own[x.id] = {}; for (var d in p.own[x.id] || {}) S.own[x.id][d] = p.own[x.id][d]; });
    S.say = null;
  }
  function person(id) { return S.people.filter(function (p) { return p.id === id; })[0]; }
  function hhOff(d) { return S.hh.indexOf(d) > -1; }
  /* the effective result for a person on a weekday: their own setting wins, else the household's. "own" means it differs from the household (marked); "same" means it equals the household's (plain). A stored value that happens to equal the household's reads as same. */
  function eff(id, d) {
    var o = S.own[id] && S.own[id][d];
    if (o && (o === "off") !== hhOff(d)) return { off: o === "off", src: "own" };
    return { off: hhOff(d), src: "same" };
  }
  /* The Household row is drawn when there is someone to share it with, or when household days exist (a person who is now alone still shares them, so they must be visible and editable). */
  function showHH() { return S.people.length > 1 || S.hh.length > 0; }
  function diffDays(id) { return WD.filter(function (d) { return eff(id, d).src === "own"; }); }
  function diffText(id) { return diffDays(id).map(function (d) { return d + " " + (eff(id, d).off ? "off" : "open"); }).join(", "); }
  function join(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function nameOf(id) { return id === S.me ? "you" : person(id).name; }
  function snap() { var o = {}; for (var k in S.own) { o[k] = {}; for (var d in S.own[k]) o[k][d] = S.own[k][d]; } return { hh: S.hh.slice(), own: o }; }
  function restore(x) { S.hh = x.hh.slice(); S.own = {}; for (var k in x.own) { S.own[k] = {}; for (var d in x.own[k]) S.own[k][d] = x.own[k][d]; } }

  /* ---- drawing ---- */
  function chip(row, d, i) {
    var hh = row === "hh", solo = !showHH(), ro, off, diff = false, lab, tip = "", who;
    if (hh) {
      off = hhOff(d); ro = !S.admin; tip = (off ? "Off" : "Open") + " for the household" + (ro ? ". Only household admins can change this" : "");
      lab = FULL[i] + ", " + (off ? "not cooking" : "open") + " for the household" + (ro ? ", only household admins can change this" : "");
    } else {
      var x = eff(row, d); off = x.off; diff = !solo && x.src === "own"; ro = row !== S.me; who = person(row).name;
      lab = FULL[i] + ", " + (off ? "not cooking" : "open");
      if (!solo) {
        tip = diff ? "Different from the household (" + (off ? "off" : "open") + ")" + (ro ? "" : ". Click again to reset") : "Same as household";
        lab += diff ? ", different from the household, which has it " + (off ? "open" : "off") + (ro ? "" : ". Click again to reset") : ", same as household";
      }
      if (ro) { tip += (tip ? ". " : "") + "Only " + who + " can change this"; lab += ", only " + who + " can change this"; }
    }
    return '<button type="button" class="ud-d' + (ro ? " ud-ro" : "") + '" data-who="' + row + '" data-d="' + d + '" data-eff="' + (off ? "off" : "open") + '"' + (diff ? ' data-diff="1"' : "") + ' aria-pressed="' + off + '" aria-label="' + esc(lab) + '"' + (tip ? ' title="' + esc(tip) + '"' : "") + (ro ? ' aria-disabled="true"' : "") + ' data-fk="' + row + ":" + d + '">' + d + "</button>";
  }
  function row(rowId) { return '<div class="ud-days" role="group" aria-labelledby="ud-l-' + rowId + '">' + WD.map(function (d, i) { return chip(rowId, d, i); }).join("") + "</div>"; }
  function sec(rowId, lbl, hint) { return '<section class="ud-row" data-row="' + rowId + '"><div class="ud-lbl" id="ud-l-' + rowId + '">' + lbl + "</div>" + row(rowId) + (hint ? '<p class="ud-hint">' + esc(hint) + "</p>" : "") + "</section>"; }
  function personRow(p) {
    var me = p.id === S.me, solo = !showHH(), n = diffDays(p.id).length, hint;
    if (solo) hint = n || !me ? "" : "Nothing set. Tap a day you do not cook.";
    else hint = n ? "Different from the household: " + diffText(p.id) + "." : "Same as the household.";
    return sec(p.id, me ? "You (" + esc(p.name) + ")" : esc(p.name) + " · only " + esc(p.name) + " can change", hint);
  }
  function hhRow() {
    var off = WD.filter(hhOff), hint;
    if (!off.length) hint = "No household days off yet." + (S.admin ? " Tap the days nobody usually cooks." : "");
    else hint = "Off every " + join(off) + ".";
    if (!S.admin) hint += " Only household admins can change this.";
    return sec("hh", "Household<span> · everyone’s default</span>", hint);
  }
  /* the one status line: what the last tap did (with Undo), else how it works. Its height is reserved so nothing jumps. */
  function status() {
    var t, undo = false;
    if (S.say) { t = S.say.text; undo = !!S.say.undo; }
    else t = S.admin ? "Tap a day to change it, tap it again to reset." : "Tap a day on your row to change it, tap it again to reset.";
    var more = S.people.length > 2 ? S.people.filter(function (p) { return p.id !== S.me; }).map(function (p) { return p.name; }) : [];
    return '<p class="ud-say" role="status"><span>' + esc(t) + (!S.say && more.length ? ' <span class="ud-more">' + esc(join(more)) + " below.</span>" : "") + "</span>" + (undo ? '<button type="button" class="ud-link" data-undo data-fk="undo">Undo</button>' : "") + "</p>";
  }
  function bodyHtml() {
    var h = '<div class="ud-pt"><div><h2 id="ud-t">Off days</h2><p class="ud-sub">Usual days off cooking. Each week starts with these blocked. Repeating days are set only here; the grid changes one week at a time.</p></div><button type="button" class="x ud-x" data-close aria-label="Close" data-fk="x"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    var rows = (showHH() ? hhRow() : "") + S.people.filter(function (p) { return p.id === S.me; }).map(personRow).join("") + S.people.filter(function (p) { return p.id !== S.me; }).map(personRow).join("");
    var n = S.people.length + (showHH() ? 1 : 0);
    h += '<div class="ud-list" id="ud-list" data-n="' + n + '"' + (n > 2 ? " tabindex=\"-1\"" : "") + ">" + rows + "</div>" + status();
    h += '<button type="button" class="ud-done" data-close data-fk="done">Done</button>';
    return h;
  }

  /* ---- doing ---- */
  function householdSay(d, i, same) {
    /* after the household changed a day: whose own setting now equals it and so was dropped */
    return PL[i] + " are " + (hhOff(d) ? "off" : "open") + " for the household." + (same.length ? " Now the same as household: " + join(same) + "." : "");
  }
  function more() { var l = S.host && S.host.querySelector(".ud-list"); if (l) l.setAttribute("data-more", String(l.scrollHeight - l.clientHeight - l.scrollTop > 2)); }
  function render() {
    if (!S.host) return;
    var ae = document.activeElement, fk = ae && ae.getAttribute && ae.getAttribute("data-fk"), sc = S.host.querySelector(".ud-list");
    var st = sc ? sc.scrollTop : 0;
    S.host.innerHTML = '<div class="ud ud-' + S.mode + '" id="ud" tabindex="-1" role="dialog" aria-modal="' + (S.mode !== "lane") + '" aria-labelledby="ud-t"><div class="ud-scroll">' + bodyHtml() + "</div></div>";
    var sc2 = S.host.querySelector(".ud-list"); if (sc2) { sc2.scrollTop = st; sc2.addEventListener("scroll", more); }
    var f = fk ? S.host.querySelector('[data-fk="' + fk + '"]') : null;
    if (S.want) { f = S.host.querySelector(S.want); S.want = null; }
    if (f) f.focus({ preventScroll: true });
    more();
    document.dispatchEvent(new CustomEvent("ud:change"));
  }
  function toggleHH(d) {
    if (!S.admin) return;
    var i = WD.indexOf(d), k = S.hh.indexOf(d), was = snap();
    if (k > -1) S.hh.splice(k, 1); else S.hh.push(d);
    /* an own setting that now equals the household's is no longer a difference, so it is dropped in the same step (stored only when it differs; UD-P5). Nobody's result changes by it. */
    var same = [];
    S.people.forEach(function (p) { var o = S.own[p.id][d]; if (o && (o === "off") === hhOff(d)) { delete S.own[p.id][d]; same.push(nameOf(p.id)); } });
    S.say = { text: householdSay(d, i, same), undo: was, fk: "hh:" + d }; S.want = '[data-fk="hh:' + d + '"]'; render();
  }
  /* a tap on your own day flips its value; if that lands on the household's value the override is deleted (the tap is the reset), else it is stored */
  function flipOwn(who, d) {
    var i = WD.indexOf(d), was = snap(), nowOff = !eff(who, d).off, hh = hhOff(d), t;
    if (!showHH()) { if (nowOff) S.own[who][d] = "off"; else delete S.own[who][d]; t = null; }
    else if (nowOff === hh) { delete S.own[who][d]; t = PL[i] + ": same as the household (" + (hh ? "off" : "open") + ")."; }
    else { S.own[who][d] = nowOff ? "off" : "open"; t = PL[i] + ": " + (nowOff ? "off" : "open") + " for you, the household has them " + (hh ? "off" : "open") + ". Tap again to reset."; }
    S.say = t ? { text: t, undo: was, fk: who + ":" + d } : null; S.want = '[data-fk="' + who + ":" + d + '"]'; render();
  }
  function onChip(b) {
    var who = b.getAttribute("data-who"), d = b.getAttribute("data-d"), i = WD.indexOf(d);
    if (b.getAttribute("aria-disabled") === "true") { /* read only: the tap says why (the same words as the tooltip), nothing changes */
      S.say = { text: who === "hh" ? "Only household admins can change the household days." : person(who).name + "’s " + FULL[i] + ": " + (eff(who, d).src === "own" ? "different from the household (" + (eff(who, d).off ? "off" : "open") + "). " : "same as household. ") + "Only " + person(who).name + " can change this." };
      S.want = '[data-fk="' + who + ":" + d + '"]'; render(); return;
    }
    if (who === "hh") return toggleHH(d);
    flipOwn(who, d);
  }
  function click(e) {
    var t = e.target.closest ? e.target.closest("button") : null; if (!t || !S.host.contains(t)) return;
    if (t.hasAttribute("data-close")) { UD.close(); return; }
    if (t.classList.contains("ud-d") && t.hasAttribute("data-who")) { onChip(t); return; }
    if (t.hasAttribute("data-undo") && S.say && S.say.undo) { var fk = S.say.fk; restore(S.say.undo); S.say = { text: "Undone." }; S.want = fk ? '[data-fk="' + fk + '"]' : '[data-fk="done"]'; render(); }
  }
  function key(e) {
    if (!S.host || !S.open) return;
    if (e.key === "Escape") { e.preventDefault(); UD.close(); return; }
    var t = e.target;
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && t.classList && t.classList.contains("ud-d")) {
      var cs = [].slice.call(t.parentNode.querySelectorAll(".ud-d")), i = cs.indexOf(t) + (e.key === "ArrowRight" ? 1 : -1);
      if (cs[i]) { e.preventDefault(); cs[i].focus(); }
    }
  }

  var UD = window.UD = {
    S: S, WD: WD, FULL: FULL, esc: esc, eff: eff, hhOff: hhOff, person: person, showHH: showHH, load: load,
    /* mount(host, mode): mode is "lane" (desktop right-hand flyout), "sheet" (phone bottom sheet) or "dialog" (centred window, the alternative drawn on desktop) */
    mount: function (host, mode) { S.host = host; S.mode = mode || "lane"; host.addEventListener("click", click); document.addEventListener("keydown", key); },
    open: function (back) { S.open = true; S.back = back || null; S.host.hidden = false; document.documentElement.setAttribute("data-ud-open", S.mode); render(); var f = S.host.querySelector("#ud"); if (f) f.focus({ preventScroll: true }); document.dispatchEvent(new CustomEvent("ud:open")); },
    close: function () { if (!S.open) return; S.open = false; S.say = null; S.host.hidden = true; S.host.innerHTML = ""; document.documentElement.removeAttribute("data-ud-open"); if (S.back && S.back.focus) S.back.focus({ preventScroll: true }); document.dispatchEvent(new CustomEvent("ud:close")); },
    render: render, setAdmin: function (v) { S.admin = !!v; S.say = null; render(); }, reset: function (k) { load(k); S.say = null; render(); }
  };
  S.admin = Q.get("as") !== "member";
  load(Q.get("data") || "typical");
})();
