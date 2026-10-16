/* Option F, the owner's choice (voice, 16 Oct 2026): a right-side flyout in the SAME slot as Home's permanent "This week" panel (#week): the slot's content is swapped while picking, then handed back.
   Top: Who is it for (the existing people chips). Below: a plain rolling list of the next 7 real days starting today; the list IS the picker. Each row: the day name in a square label, what is planned
   that night on the right (read only). Picking a row commits at once: no Plan or Confirm button and no Cancel; Esc or the X closes. A wrong pick is fixed by picking again (Undo chip).
   What a pick does follows the owner's rulings: a usual day off takes a meal; the household plan on a household-meal night is a Replace; the household plan where one person has their own plan is planned for
   everyone but that person and leaves theirs alone; one person replanning only for themselves takes only themselves out of the household meal. Under Everyone a row shows only the household plan with a peek
   behind it when anyone has their own plan; Right opens that one night's full picture, Left folds it.
   Mockup only (foot of the flyout): the Hard avoid on or off, and whether off days take a meal (owner) or refuse as the code does today (day_blocked). */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, H = window.HDP, R = window.PKRows, esc = PK.esc, ico = PK.ico, $ = PK.$;
var el, hold = null, want = null, saved = null, openDay = null, offRule = (new URLSearchParams(location.search).get("off") === "refuse") ? "refuse" : "open";
P.weekOff = P.weekOff || { 8: 1 }; /* Tue 20 Oct: off this week only (a blocked day with source week) */
function days() {
  var o = [];
  for (var i = 0; i < 7; i++) { var n = P.todayN + i, inf = PK.info(n); o.push({ n: n, dn: inf.dn, today: i === 0, off: inf.off ? "usual" : P.weekOff[n] ? "week" : null, meals: inf.meals.map(function (m) { return { name: m.name, who: m.who, notFor: [].concat(m.notFor || []) }; }) }); }
  return o;
}
function ctx() { return { who: S.who, me: P.me, avoid: P.avoid, guard: PK.guard(), offRule: offRule }; }
function dayObj(n) { return days().filter(function (d) { return d.n === n; })[0]; }
function draw() {
  var g = PK.guard();
  el.innerHTML = '<div class="pk-pt"><div><h2 id="pk-t">Plan ' + esc(PK.R().name) + '</h2><p class="pk-sub">Pick a night. It is planned as soon as you pick.</p></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" +
    PK.whoHtml() + (g ? PK.guardHtml() : "") + R.html(days(), ctx(), openDay) + PK.holdHtml() +
    '<p class="phint hint pk-hint">' + PK.kbd("↑") + PK.kbd("↓") + " move " + PK.kbd("Enter") + " plan " + PK.kbd("→") + " everyone’s plans " + PK.kbd("Esc") + " close</p>" +
    '<div class="pk-mock" role="group" aria-label="Mockup only"><span>Mockup only</span><button type="button" data-avoid aria-pressed="' + !!P.avoid + '">Jo avoids mango</button><button type="button" data-offrule aria-pressed="' + (offRule === "refuse") + '">Off days refuse</button></div>';
  if (want) { var t = el.querySelector(want); want = null; if (t) t.focus({ preventScroll: true }); }
}
/* what a pick does to the night, in the data model the plan already has */
function rules(n, o) {
  var d = dayObj(n), ind = d.meals.filter(function (m) { return m.who !== "all" && m.who !== "me"; }).map(function (m) { return m.who; }).filter(function (x, i, z) { return z.indexOf(x) === i; });
  if (o && o.leave) return { remove: function (m) { return m.who === "all" || m.who === "me"; }, who: "me", notFor: [P.avoid.who] };
  if (S.who === "all") return { remove: function (m) { return m.who === "all" || m.who === "me"; }, who: "all", notFor: ind, stays: ind.length ? ind.join(" and ") + "’s meal stays." : "" };
  if (S.who === P.me) return { remove: function (m) { return m.who === "me"; }, who: "me", carve: [P.me] };
  return { remove: function () { return false; }, who: S.who, carve: [S.who], stays: "" };
}
function pickRow(i) {
  if (hold) return;
  var d = days()[i], v = R.view(d, ctx());
  if (v.refuse) { H.toast(esc(d.dn) + " is off for you. Pick another day."); return; }
  if (v.peek && openDay !== i) { openDay = i; want = '.row-d[data-i="' + i + '"]'; draw(); return; } /* a stacked night (household plan with someone's own): the first pick only opens it, the second plans */
  var g = PK.guard();
  S.sel = d.n; S.leave = false;
  if (g) { want = '.row-d[data-i="' + i + '"]'; draw(); return; } /* stop: nothing to press; warn: Leave Jo out is the one action */
  PK.commit(d.n);
}
function click(e) {
  if (hold) return;
  var t = e.target.closest("button"); if (!t) return;
  if (t.dataset.avoid !== undefined) { P.avoid = P.avoid ? null : { who: "Jo", item: "mango" }; S.sel = null; S.leave = false; want = "[data-avoid]"; draw(); return; }
  if (t.dataset.offrule !== undefined) { offRule = offRule === "refuse" ? "open" : "refuse"; want = "[data-offrule]"; draw(); return; }
  if (t.dataset.peek !== undefined) { var i = +t.dataset.peek; openDay = openDay === i ? null : i; want = '.row-d[data-i="' + i + '"]'; draw(); var q = el.querySelector('[data-w="' + i + '"] .peek-b'); if (q) q.focus(); return; }
  if (t.classList.contains("row-d")) { pickRow(+t.dataset.i); return; }
  PK.common(t, function () { openDay = null; want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : t.hasAttribute("data-hold") ? "[data-hold]" : null; draw(); });
}
PK.register({
  rules: rules,
  open: function () {
    saved = H.S.front; openDay = null; S.sel = null;
    if (saved !== "week") H.set({ front: "week" });
    el = $("#week"); el.classList.add("pk", "pk-fly"); el.addEventListener("click", click);
    draw(); var f = el.querySelector(".row-d"); if (f) f.focus({ preventScroll: true });
  },
  confirm: function (verb, name, label, note) {
    if (hold) hold.cancel(true);
    el.innerHTML = '<div class="pk-pt"><div><h2 id="pk-t">Plan ' + esc(name) + '</h2></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" + R.confHtml(verb, name, esc(label), esc(note || ""));
    el.querySelector("[data-close]").focus({ preventScroll: true });
    hold = R.hold(el, function () { hold = null; if (S.open) { PK.close(true); PK.refocus(); } });
  },
  close: function () { if (!el) return; if (hold) { var h = hold; hold = null; h.live = false; clearTimeout(h.t); clearTimeout(h.t2); } el.classList.remove("pk-out"); el.removeEventListener("click", click); el.classList.remove("pk", "pk-fly"); el = null; H.set({ front: saved || "detail" }); },
  key: function (e) {
    if (hold && (e.key === "z" || e.key === "Z")) { var u = document.querySelector('.toast [data-act="undo"]'); if (u) { e.preventDefault(); u.click(); } return; }
    if (!el.contains(e.target)) return;
    R.key(e, el, { toggle: function (i, on) { openDay = on ? i : null; want = '.row-d[data-i="' + i + '"]'; draw(); if (on) { var q = el.querySelector('[data-w="' + i + '"] .peek-b'); if (q) q.focus(); } } });
  },
  focus: function () { if (!el) return; var f = el.querySelector(".row-d"); if (f) f.focus({ preventScroll: true }); },
  help: function () { var r = [["↑  ↓", "Move along the nights"], ["Home  End", "First and last night"], ["Enter", "Plan that night (it is planned at once; Undo is in the message). A confirmation stays about 3 seconds, then slides out; Esc closes it sooner"], ["→", "Open that night’s full picture (everyone’s plans)"], ["←", "Fold it again"], ["Esc", "Close"]]; r.title = "Choosing a night (Plan it, option F)"; return r; }
});
})();
