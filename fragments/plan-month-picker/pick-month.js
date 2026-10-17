/* WIDE (owner, typed, 17 Oct 2026): choosing Another day widens the flyout to take two flyouts' worth of width when the window has room, so the Monday to Sunday week has space for a meal name in each cell.
   The rule and the layouts are in wide.css and wide.js (fetched only when the window is wide enough and Another day is pressed); below that width the month keeps the single-flyout width with compact cells (month.css),
   and tablet.html and phone.html show it as a sheet (tablet.css, phone.css). ?wide=a|b|c picks the wide layout (default a), ?wide=off shows the compact fallback at any width.
   The flyout of option F (the owner's choice, Kitchie #757) with "Another day" opening a month picker in the same slot (owner, voice, 17 Oct 2026). Same slot as Home's "This week" panel (#week): its content is
   swapped while picking, then handed back. The seven-day list is F's (copied from fragments/plan-day-picker/pick-f.js, which is being edited elsewhere): a pick plans at once, a 3 second Planned or Replaced hold
   with an inline Undo and a slide-out, two steps only for a stacked night, a usual day off is not locked, the Hard avoid guard is asked for the date picked, Replace is the person's own meal.
   Another day is a row at the foot of the seven days (default) or an icon in the header (?another=header). It replaces the flyout's content with the month (month.js, loaded on first use), with a back control to the seven days.
   Mockup only: the rail's "Mockup controls" (scenario, today, Hard avoid, labels, narrow). Nothing is saved or sent. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, H = window.HDP, R = window.PKRows, esc = PK.esc, ico = PK.ico, $ = PK.$, Q = PK.Q;
var BASE = document.currentScript ? document.currentScript.src.replace(/[^\/]*$/, "") : "";
var quiet = false, el, hold = null, want = null, saved = null, openDay = null, openN = null, view = "list", cur = P.todayN, msg = "", M = null;
var ANOTHER = Q.get("another") === "header" ? "header" : "row", NARROW = Q.get("w") === "narrow"; /* ?w=narrow: the single-flyout width with compact cells at ANY window size, the same look as ?wide=off and as a 1024 to 1359px window; ?w (normal) goes two flyouts wide when the window is 1360px or more */
var NUM = /^(a|b|c)$/.test(Q.get("num") || "") ? Q.get("num") : "b", HALO = /^(hold|off)$/.test(Q.get("halo") || "") ? Q.get("halo") : "timed"; /* ?num=a|b|c the date number; ?halo=hold keeps the opening halo on, ?halo=off shows the month after it faded */
var halo = false, haloT = null;
var holdMsg = "", holdMsgT = null; /* the brief confirmation after Hold or Unhold: about 3 seconds like F's hold, in a polite live region that is not redrawn by the toggle, so a screen reader announces it */
function showHoldMsg(txt) {
  holdMsg = txt; clearTimeout(holdMsgT); var m = $("#pk-holdmsg"); if (m) { m.textContent = txt; m.classList.add("on"); }
  holdMsgT = setTimeout(function () { holdMsg = ""; var q = $("#pk-holdmsg"); if (q) { q.classList.remove("on"); setTimeout(function () { if (!holdMsg && q) q.textContent = ""; }, 400); } }, 3000);
}
function holdToggle(t) {
  S.hold = !S.hold; t.setAttribute("aria-pressed", String(S.hold)); var sp = t.querySelector("span"); if (sp) sp.textContent = S.hold ? "Held" : "Hold";
  showHoldMsg(S.hold ? "Ingredients will be reserved for this recipe." : "Ingredients released.");
}
/* the transient halo on EVERY open date at once (owner, voice, 17 Oct 2026): it fires by itself the moment the month opens (no hover or focus needed), holds about 3 seconds (F's confirmation-hold family), then fades; the first press or key ends it at once.
   Today stays the selected and focused cell. Hover and keyboard focus keep their own glow on top (month.css). */
function haloOn() { clearTimeout(haloT); halo = HALO === "off" || !M ? false : true; if (halo && HALO === "timed") haloT = setTimeout(clearHalo, 3000); }
function clearHalo() {
  clearTimeout(haloT); halo = false; if (!el) return;
  var hs = el.querySelectorAll(".pdm-c.halo"); if (!hs.length) return;
  [].forEach.call(hs, function (h) { h.classList.remove("halo"); h.classList.add("halo-out"); });
  setTimeout(function () { [].forEach.call(el ? el.querySelectorAll(".pdm-c.halo-out") : [], function (h) { h.classList.remove("halo-out"); }); }, 520);
}
var WIDE_MIN = 1360, WIDE_MQ = window.matchMedia ? window.matchMedia("(min-width:" + WIDE_MIN + "px)") : { matches: false }; /* 88 rail + 472 column (never covered: it gives up width) + 800 for two flyouts */
var CARD = /^(slim|collapsed|overlay|strip)$/.test(Q.get("card") || "") ? Q.get("card") : "docked"; /* ?card= how layout B spends its width (owner open sub-question, 17 Oct 2026): docked (as chosen), slim, collapsed until a date is on, overlay while open, strip below the weeks. Any ?card implies layout B; no ?card, no ?wide: layout A as before (B is NOT the default yet). */
var WOPT = /^(a|b|c)$/.test(Q.get("wide") || "") ? Q.get("wide") : CARD !== "docked" ? "b" : "a", NOWIDE = Q.get("wide") === "off" || NARROW;
window.PKCard = CARD;
function wideNow() { return view === "month" && !NOWIDE && WIDE_MQ.matches && !!window.PKWide; }
function wantWide() { return !NOWIDE && WIDE_MQ.matches && !window.PKWide; }
function lastLabel() { var l = PK.info(P.lastN); return l.dn + " " + l.num + " " + l.mon; }
function days() { var o = []; for (var i = 0; i < 7; i++) { var d = PK.dayObj(P.todayN + i); d.today = i === 0; o.push(d); } return o; }
function ctxFor(d) { return { who: S.who, me: P.me, avoid: P.avoid, guard: PK.guardFor(d.n), offRule: "open" }; }
PK.ctxFor = ctxFor;
function stText(n, msg) { return $("#pdw-side") ? (msg ? M.say(n, msg) : "") : M.say(n, msg); } /* with a card or strip the line under the grid only carries a key message (the end of the plan); it never restates what picking does */
var cellSel = function (n) { return '.pdm-c[data-n="' + n + '"]'; };

/* what a pick does to the night, in the data model the plan already has (F's rules, unchanged) */
function rules(n, o) {
  var d = PK.dayObj(n), ind = d.meals.filter(function (m) { return m.who !== "all" && m.who !== "me"; }).map(function (m) { return m.who; }).filter(function (x, i, z) { return z.indexOf(x) === i; });
  if (o && o.leave) return { remove: function (m) { return m.who === "all" || m.who === "me"; }, who: "me", notFor: [P.avoid.who] };
  if (S.who === "all") return { remove: function (m) { return m.who === "all" || m.who === "me"; }, who: "all", notFor: ind, stays: ind.length ? ind.join(" and ") + "’s meal stays." : "" };
  if (S.who === P.me) return { remove: function (m) { return m.who === "me"; }, who: "me", carve: [P.me] };
  return { remove: function () { return false; }, who: S.who, carve: [S.who], stays: "" };
}

/* ---------- drawing ---------- */
function moreRow() {
  return '<div class="rows more"><button type="button" class="row-d more" data-more aria-label="Another day: pick a date from the month, up to ' + lastLabel() + '"><span class="dl">' + ico.cal + '</span><span class="dt"><span class="ln">Another day</span><small class="cons">Pick a date from the month, up to ' + lastLabel() + ".</small></span></button></div>";
}
function hint() {
  if (PK.touch) return "";
  return '<p class="phint hint pk-hint">' + (view === "month" ? PK.kbd("←") + PK.kbd("→") + " day " + PK.kbd("↑") + PK.kbd("↓") + " week " + PK.kbd("Enter") + " plan " + PK.kbd("Esc") + " back"
    : PK.kbd("↑") + PK.kbd("↓") + " move " + PK.kbd("Enter") + " plan " + PK.kbd("→") + " everyone’s plans " + PK.kbd("Esc") + " close") + "</p>";
}
function draw() {
  if (M) M.hidePop();
  var name = esc(PK.R().name), g = S.sel == null ? null : PK.guardFor(S.sel), mo = view === "month" && M, W = mo && wideNow() ? window.PKWide : null;
  var app = $("#app"); if (app) { if (W) app.dataset.plan = "wide"; else delete app.dataset.plan; } /* the host lane widens (wide.css); data-plan is the only thing the host sees */
  if (el) { if (mo) el.dataset.num = NUM; else delete el.dataset.num; }
  if (el) { if (W) el.dataset.wide = WOPT; else delete el.dataset.wide; if (W || PK.rich) el.dataset.rich = "1"; else delete el.dataset.rich; } /* rich: cells big enough for a meal name (rich.css) */ if (M) { M.noPop = (!!W && WOPT === "b") || (!W && !PK.touch); M.popOver = !!W; } /* the card or strip is the detail, so there is no hover pop-up with it */
  var h = '<div class="pk-pt">' + (mo ? '<button type="button" class="x pdm-back" data-back aria-label="Back to the next seven days" title="Back to the next seven days">' + ico.back + "</button>" : "") +
    '<div><h2 id="pk-t">' + (mo ? "Another day" : "Plan " + name) + '</h2><p class="pk-sub">' + (mo ? name : "Pick a night. It is planned as soon as you pick.") + "</p></div>" +
    (!mo && ANOTHER === "header" ? '<button type="button" class="x pdm-cal" data-more aria-label="Another day: pick a date from the month, up to ' + lastLabel() + '" title="Another day">' + ico.cal + "</button>" : "") +
    PK.holdBtn() + '<button type="button" class="x" data-close aria-label="Close">' + ico.x + '</button><p class="pk-holdmsg' + (holdMsg ? " on" : "") + '" id="pk-holdmsg" role="status" aria-live="polite">' + esc(holdMsg) + "</p></div>" + PK.whoHtml() + (g ? PK.guardHtml() : "");
  if (mo) {
    var strip = !W && !PK.touch; /* the compact (narrow-desktop) flyout: the card docks at the bottom as a strip instead of the line under the grid */
    var parts = { grid: M.html(cur, { summary: W && WOPT === "c" }), cap: M.capHtml(), st: '<p class="pdm-st" id="pdm-st" role="status" aria-live="polite">' + (strip ? (msg ? M.say(cur, msg) : "") : M.say(cur, msg)) + "</p>", full: openN != null ? M.fullHtml(openN) : "", hold: PK.holdHtml(), hint: hint(), legend: M.legendHtml(), cur: cur };
    window.PKCardStrip = strip || (!!W && WOPT === "b" && CARD === "strip");
    var cardEl = strip ? '<aside class="pdw-side pdw-strip pdw-compact" id="pdw-side" aria-label="The date you are on" aria-live="polite">' + M.cardHtml(cur) + "</aside>" : "";
    h += W ? W.compose(WOPT, parts) : (PK.touch ? M.nextHtml() : "") + parts.grid + parts.cap + parts.st + cardEl + parts.full + parts.hold + parts.hint + parts.legend;
  } else {
    h += R.html(days(), ctxFor, openDay) + (ANOTHER === "row" ? moreRow() : "") + PK.holdHtml() + hint();
  }
  el.innerHTML = h;
  if (mo && halo) [].forEach.call(el.querySelectorAll(".pdm-c[data-n].st-open:not(.g-stop):not(:disabled)"), function (c) { c.classList.add("halo"); });
  if (want) { var t = el.querySelector(want); want = null; if (t) { quiet = true; t.focus({ preventScroll: true }); quiet = false; } } /* a focus the flyout moves itself shows no popover */
}
/* the month's file and styles are fetched the first time Another day is pressed (DESIGN.md section 6) */
function withMonth(cb) {
  var need = [], add = function (kind, file, media) { need.push([kind, file, media]); };
  if (!window.PKMonth) { add("css", "month.css"); add("js", "month.js"); }
  if (wantWide()) { add("css", "rich.css", "(min-width:" + WIDE_MIN + "px)"); add("css", "wide.css", "(min-width:" + WIDE_MIN + "px)"); add("js", "wide.js"); } /* only a window that is wide enough fetches the wide layout (DESIGN.md section 6, 7) */
  var left = need.length, one = function () { if (--left > 0) return; M = window.PKMonth; cb(); };
  if (!left) { M = window.PKMonth; cb(); return; }
  need.forEach(function (x) {
    if (x[0] === "css") { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + x[1]; if (x[2]) l.media = x[2]; l.onload = l.onerror = one; document.head.appendChild(l); }
    else { var s = document.createElement("script"); s.src = BASE + x[1]; s.onload = s.onerror = one; document.head.appendChild(s); }
  });
}
/* the window crosses the wide width while the month is open: widen or fold back in place */
function onWide() {
  if (!el || view !== "month") return;
  if (wantWide()) withMonth(function () { if (el) draw(); }); else draw();
}
function openMonth() {
  if (hold) return;
  withMonth(function () { if (!el) return; view = "month"; openN = null; msg = ""; S.sel = null; S.leave = false; cur = P.todayN; /* today is the default selected and focused cell (owner, voice, 17 Oct 2026); the halo marks every open date */ want = cellSel(cur); haloOn(); draw(); });
}
function back() { clearHalo(); view = "list"; openN = null; msg = ""; S.sel = null; S.leave = false; openDay = null; want = "[data-more]"; draw(); }

/* ---------- picking ---------- */
function pickRow(i) {
  if (hold) return;
  var d = days()[i], v = R.view(d, ctxFor(d));
  if (v.peek && openDay !== i) { openDay = i; want = '.row-d[data-i="' + i + '"]'; draw(); return; } /* a stacked night: the first pick only opens it, the second plans */
  var g = PK.guardFor(d.n);
  S.sel = d.n; S.leave = false;
  if (g) { want = '.row-d[data-i="' + i + '"]'; draw(); return; } /* stop: nothing to press; warn: Leave Jo out is the one action */
  PK.commit(d.n);
}
function pickCell(n) {
  if (hold || n < P.todayN || n > P.lastN) return;
  var d = PK.dayObj(n), v = R.view(d, ctxFor(d));
  if (openN != null && openN !== n) openN = null;
  cur = n; msg = "";
  if ((v.peek || (PK.touch && (d.meals.length || d.off))) && openN !== n) { openN = n; want = cellSel(n); draw(); return; } /* a stacked night: two steps, as in the seven days. On a touch screen there is no hover, so a planned night or a day off also shows what is there first (phone.js sets PK.touch) */
  var g = PK.guardFor(n);
  S.sel = n; S.leave = false;
  if (g) { want = cellSel(n); draw(); return; }
  PK.commit(n);
}
/* wide option B: the side card follows the hovered or focused date */
function side(n) {
  var sd = $("#pdw-side"); if (!sd || !M) return; sd.innerHTML = M.cardHtml(n);
  var b = sd.closest(".pdw-b"); if (b) { b.classList.add("has-card"); b.dataset.side = PK.info(n).i >= 4 ? "left" : "right"; } /* collapsed and overlay: the card opens on the first date you point at or focus; the overlay sits on the side away from that date */
}
function setCur(n, m) {
  var old = el.querySelector('.pdm-c[tabindex="0"]'); if (old) old.tabIndex = -1;
  cur = n; msg = m || ""; var b = el.querySelector(cellSel(n)); if (b) { b.tabIndex = 0; b.focus({ preventScroll: true }); }
  side(n); var s = $("#pdm-st"); if (s) s.innerHTML = stText(n, msg);
  if (b && !m) M.showPop(b, el); else if (M) M.hidePop();
}
function click(e) {
  var t = e.target.closest("button"); if (!t) return;
  if (hold) { if (t.hasAttribute("data-cfundo")) { var u = document.querySelector('.toast [data-act="undo"]'); if (u) u.click(); } return; }
  if (t.hasAttribute("data-more")) { openMonth(); return; }
  if (t.hasAttribute("data-hold")) { holdToggle(t); return; }
  if (t.hasAttribute("data-back")) { back(); return; }
  if (t.hasAttribute("data-nextopen") || t.hasAttribute("data-sidepick")) { pickCell(+t.dataset.n); return; }
  if (t.classList.contains("pdm-c")) { pickCell(+t.dataset.n); return; }
  if (t.dataset.peek !== undefined) { var i = +t.dataset.peek; openDay = openDay === i ? null : i; want = '.row-d[data-i="' + i + '"]'; draw(); var q = el.querySelector('[data-w="' + i + '"] .peek-b'); if (q) q.focus(); return; }
  if (t.classList.contains("row-d")) { pickRow(+t.dataset.i); return; }
  PK.common(t, function () { openDay = null; openN = null; want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : t.hasAttribute("data-hold") ? "[data-hold]" : null; draw(); });
}
/* hover and focus on a date: the line under the grid says what picking it does; a planned or closed date also shows what is planned, read only */
function over(e) {
  if (view !== "month" || !M) return; var b = e.target.closest && e.target.closest(".pdm-c"); if (!b || b.disabled || b.classList.contains("pdm-sw")) return;
  if (!quiet) side(+b.dataset.n); var s = $("#pdm-st"); if (s) s.innerHTML = stText(+b.dataset.n); if (!quiet) M.showPop(b, el); /* the focus the flyout moves itself (today, on open) neither opens the card nor a popover */
}
function out(e) {
  if (view !== "month" || !M) return; var b = e.target.closest && e.target.closest(".pdm-c"); if (!b) return;
  if (e.relatedTarget && b.contains(e.relatedTarget)) return;
  if (CARD === "overlay" && e.relatedTarget && e.relatedTarget.closest && !e.relatedTarget.closest(".pdw-b")) { var ob = el.querySelector(".pdw-b"); if (ob) ob.classList.remove("has-card"); } /* the overlay closes when the pointer leaves the grid and the card */
  M.hidePop(); var s = $("#pdm-st"), a = document.activeElement, n = a && a.classList && a.classList.contains("pdm-c") && el.contains(a) ? +a.dataset.n : cur;
  if (s) s.innerHTML = stText(n, n === cur ? msg : ""); /* the side card (wide B) is left on the last date you pointed at, so moving to its Plan button never changes the date */
}

PK.register({
  rules: rules,
  open: function () {
    saved = H.S.front; openDay = null; openN = null; view = "list"; S.sel = null; cur = P.todayN; msg = "";
    if (saved !== "week") H.set({ front: "week" });
    el = $("#week"); el.classList.add("pk", "pk-fly");
    if (WIDE_MQ.addEventListener) WIDE_MQ.addEventListener("change", onWide);
    el.addEventListener("pointerdown", clearHalo); el.addEventListener("keydown", clearHalo); el.addEventListener("click", click); el.addEventListener("mouseover", over); el.addEventListener("mouseout", out); el.addEventListener("focusin", over); el.addEventListener("focusout", out);
    draw(); var f = el.querySelector(".row-d"); if (f) f.focus({ preventScroll: true });
  },
  confirm: function (verb, name, label, note) {
    if (hold) return; if (M) M.hidePop();
    el.innerHTML = '<div class="pk-pt"><div><h2 id="pk-t">Plan ' + esc(name) + '</h2></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" + R.confHtml(verb, name, esc(label), esc(note || ""));
    el.querySelector("[data-close]").focus({ preventScroll: true });
    hold = R.hold(el, function () { hold = null; if (S.open) { PK.close(true); PK.refocus(); } });
  },
  undone: function () { if (hold) hold.didUndo(); }, /* inline Undo, the Home chip or Z: the confirmation reads Undone, then the flyout closes */
  close: function () {
    if (!el) return; if (M) M.hidePop();
    if (hold) { var h = hold; hold = null; h.live = false; clearTimeout(h.t); clearTimeout(h.t2); }
    el.classList.remove("pk-out"); clearTimeout(haloT); halo = false; el.removeEventListener("pointerdown", clearHalo); el.removeEventListener("keydown", clearHalo); el.removeEventListener("click", click); el.removeEventListener("mouseover", over); el.removeEventListener("mouseout", out); el.removeEventListener("focusin", over); el.removeEventListener("focusout", out);
    if (WIDE_MQ.removeEventListener) WIDE_MQ.removeEventListener("change", onWide);
    var app = $("#app"); if (app) delete app.dataset.plan; delete el.dataset.wide; delete el.dataset.rich;
    el.classList.remove("pk", "pk-fly"); el = null; H.set({ front: saved || "detail" });
  },
  esc: function () { if (!hold && view === "month") { back(); return; } PK.close(); },
  key: function (e) {
    if (halo && el && el.contains(e.target)) clearHalo(); /* the first key clears the halo */
    if (hold && (e.key === "z" || e.key === "Z")) { var u = document.querySelector('.toast [data-act="undo"]'); if (u) { e.preventDefault(); u.click(); } return; }
    if (hold || !el.contains(e.target)) return;
    if (view === "month") {
      if (!e.target.classList || !e.target.classList.contains("pdm-c")) return;
      var t = M.target(e, +e.target.dataset.n); if (!t || t.enter) return; /* Enter and Space are the button's own click */
      e.preventDefault(); setCur(t.n, t.msg); return;
    }
    R.key(e, el, { toggle: function (i, on) { openDay = on ? i : null; want = '.row-d[data-i="' + i + '"]'; draw(); if (on) { var q = el.querySelector('[data-w="' + i + '"] .peek-b'); if (q) q.focus(); } } });
  },
  focus: function () { if (!el) return; var f = view === "month" ? el.querySelector(cellSel(cur)) : el.querySelector(".row-d"); if (f) f.focus({ preventScroll: true }); },
  help: function () {
    return [{ title: "Choosing a night (Plan it, the next seven days)", rows: [["↑  ↓", "Move along the nights"], ["Home  End", "First and last night"], ["Enter", "Plan that night. It is planned at once; a confirmation with Undo stays about 3 seconds, then slides out"], ["→", "Open that night’s full picture (everyone’s plans)"], ["←", "Fold it again"], ["Esc", "Close"]] },
      { title: "Choosing another day (Plan it, month)", rows: [["Enter", "On the Another day row: open the month"], ["←  →", "A day back or ahead"], ["↑  ↓", "A week back or ahead, the same weekday"], ["Home  End", "The first and last day of the plan"], ["Enter", "Plan that date (a stacked night shows everyone’s plans first; Enter again plans it)"], ["Esc", "Back to the next seven days"]] }];
  }
});
/* ?start=list|month opens the flyout on load (the rail's mockup controls and the check use it) */
var st = Q.get("start");
if (st === "list" || st === "month") setTimeout(function () { PK.open(null, P.rid); if (st === "month") openMonth(); }, 60);
})();
