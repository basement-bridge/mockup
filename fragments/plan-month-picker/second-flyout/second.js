/* ANOTHER DAY IN A SECOND FLYOUT (owner, 24 Oct 2026): the month calendar (the "Other / Another day" four-week grid) opens in a SECOND flyout, on top of or beside the first (the Plan it flyout), instead of one wider panel with a side card (#844, #826, PM-D15, PM-D44).
   Mockup only, awaiting the owner's pick (PM-D47 to PM-D50 in docs/knowledge/plan-month-picker.md). Nothing is built in Kitchie.
   Derived from ../pick-month.js (the seven-day list, the pick, the hold and Undo, the guard, the halo and the keys are the same code paths; month.js, data.js, common.js, rows.js are used as they are). What is new here:
   - the first flyout (#week) always keeps the seven days; the month is drawn into its own element (#week2) at the single-flyout width (the compact cells and the bottom strip of PM-D43, so no wide files are fetched);
   - ?second=a|b|c places it: A stacked right of the first (from 1360px; below that A behaves as B), B over the first, which waits behind it dimmed, C a floating card anchored to the Another day row;
   - Esc and the back arrow close the second flyout and return to the first (focus goes back to the Another day row); X closes both; Ctrl or Cmd+Esc closes both; a pick commits at once with the 3 second inline Undo, in the flyout you picked from.
   Mockup controls in the rail: the Second flyout group (this page's) and the usual scenario, today, who, Hard avoid and halo groups. Nothing is saved or sent. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, H = window.HDP, R = window.PKRows, esc = PK.esc, ico = PK.ico, $ = PK.$, Q = PK.Q;
var BASE = (document.currentScript ? document.currentScript.src.replace(/[^\/]*$/, "") : "") + "../"; /* month.css and month.js live one folder up */
var quiet = false, el, el2, app, hold = null, want = null, saved = null, openDay = null, openN = null, view = "list", cur = P.todayN, msg = "", M = null, selIn = 1, loading = false;
var VAR = /^(a|b|c)$/.test(Q.get("second") || "") ? Q.get("second") : "a"; /* ?second=a|b|c */
var NUM = /^(a|b|c)$/.test(Q.get("num") || "") ? Q.get("num") : "b", HALO = /^(hold|off)$/.test(Q.get("halo") || "") ? Q.get("halo") : "timed";
var A_MIN = 1360, MQ = window.matchMedia ? window.matchMedia("(min-width:" + A_MIN + "px)") : { matches: true }; /* 88 rail + 472 Home column (it gives up width, never covered) + 400 + 400 */
function eff() { return VAR === "a" && !MQ.matches ? "b" : VAR; } /* A needs two lanes; below 1360px it is B (the second flyout over the first), in the 1024 to 1359px compact breakpoint */
var halo = false, haloT = null, holdMsgT = null;
function holdToggle(t) {
  S.hold = !S.hold;
  [].forEach.call(document.querySelectorAll("[data-hold]"), function (b) { b.setAttribute("aria-pressed", String(S.hold)); var sp = b.querySelector("span"); if (sp) sp.textContent = S.hold ? "Held" : "Hold"; });
  var f = t.closest(".pk-fly"), m = f && f.querySelector(".pk-holdmsg"); if (!m) return;
  m.textContent = S.hold ? "Ingredients will be reserved for this recipe." : "Ingredients released."; m.classList.add("on"); clearTimeout(holdMsgT);
  holdMsgT = setTimeout(function () { m.classList.remove("on"); setTimeout(function () { if (!m.classList.contains("on")) m.textContent = ""; }, 400); }, 3000); /* about 3 seconds, a polite live region that the toggle does not redraw (PM-D42) */
}
function haloOn() { clearTimeout(haloT); halo = HALO !== "off" && !!M; if (halo && HALO === "timed") haloT = setTimeout(clearHalo, 3000); }
function clearHalo() {
  clearTimeout(haloT); halo = false; if (!el2) return;
  var hs = el2.querySelectorAll(".pdm-c.halo"); if (!hs.length) return;
  [].forEach.call(hs, function (h) { h.classList.remove("halo"); h.classList.add("halo-out"); });
  setTimeout(function () { [].forEach.call(el2 ? el2.querySelectorAll(".pdm-c.halo-out") : [], function (h) { h.classList.remove("halo-out"); }); }, 520);
}
function lastLabel() { var l = PK.info(P.lastN); return l.dn + " " + l.num + " " + l.mon; }
function days() { var o = []; for (var i = 0; i < 7; i++) { var d = PK.dayObj(P.todayN + i); d.today = i === 0; o.push(d); } return o; }
function ctxFor(d) { return { who: S.who, me: P.me, avoid: P.avoid, guard: PK.guardFor(d.n), offRule: "open" }; }
PK.ctxFor = ctxFor;
var cellSel = function (n) { return '.pdm-c[data-n="' + n + '"]'; };
function rules(n, o) { /* what a pick does to the night: F's rules, unchanged (as ../pick-month.js) */
  var d = PK.dayObj(n), ind = d.meals.filter(function (m) { return m.who !== "all" && m.who !== "me"; }).map(function (m) { return m.who; }).filter(function (x, i, z) { return z.indexOf(x) === i; });
  if (o && o.leave) return { remove: function (m) { return m.who === "all" || m.who === "me"; }, who: "me", notFor: [P.avoid.who] };
  if (S.who === "all") return { remove: function (m) { return m.who === "all" || m.who === "me"; }, who: "all", notFor: ind, stays: ind.length ? ind.join(" and ") + "’s meal stays." : "" };
  if (S.who === P.me) return { remove: function (m) { return m.who === "me"; }, who: "me", carve: [P.me] };
  return { remove: function () { return false; }, who: S.who, carve: [S.who], stays: "" };
}

/* ---------- drawing ---------- */
function moreRow() {
  var on = view === "month";
  return '<div class="rows more"><button type="button" class="row-d more" data-more aria-haspopup="dialog" aria-expanded="' + on + '"' + (on ? ' aria-controls="week2"' : "") + ' aria-label="Another day: pick a date from the month, up to ' + lastLabel() + '"><span class="dl">' + ico.cal + '</span><span class="dt"><span class="ln">Another day</span><small class="cons">Pick a date from the month, up to ' + lastLabel() + ".</small></span></button></div>";
}
function hint(mo) {
  return '<p class="phint hint pk-hint">' + (mo ? PK.kbd("←") + PK.kbd("→") + " day " + PK.kbd("↑") + PK.kbd("↓") + " week " + PK.kbd("Enter") + " plan " + PK.kbd("Esc") + " back"
    : PK.kbd("↑") + PK.kbd("↓") + " move " + PK.kbd("Enter") + " plan " + PK.kbd("→") + " everyone’s plans " + PK.kbd("Esc") + (view === "month" ? " back" : " close")) + "</p>";
}
function drawFirst() {
  var name = esc(PK.R().name), g = S.sel == null || selIn !== 1 ? null : PK.guardFor(S.sel);
  el.innerHTML = '<div class="pk-pt"><div><h2 id="pk-t">Plan ' + name + '</h2><p class="pk-sub">Pick a night. It is planned as soon as you pick.</p></div>' + PK.holdBtn() + '<button type="button" class="x" data-close aria-label="Close">' + ico.x + '</button><p class="pk-holdmsg" role="status" aria-live="polite"></p></div>' +
    PK.whoHtml() + (g ? PK.guardHtml() : "") + R.html(days(), ctxFor, openDay) + moreRow() + PK.holdHtml() + hint(false);
}
function drawSecond() {
  var name = esc(PK.R().name), g = S.sel == null || selIn !== 2 ? null : PK.guardFor(S.sel);
  el2.dataset.num = NUM;
  M.noPop = true; M.popOver = false; window.PKCardStrip = true; /* the strip below the grid is the detail (PM-D43, PM-D44), so there is no hover pop-up */
  var cardEl = '<aside class="pdw-side pdw-strip pdw-compact" id="pdw-side" aria-label="The date you are on" aria-live="polite">' + M.cardHtml(cur) + "</aside>";
  el2.innerHTML = '<div class="pk-pt"><button type="button" class="x pdm-back" data-back aria-label="Back to the next seven days" title="Back to the next seven days (Esc)">' + ico.back + '</button><div><h2 id="pk-t2">Another day</h2><p class="pk-sub">' + name + "</p></div>" +
    PK.holdBtn() + '<button type="button" class="x" data-close aria-label="Close">' + ico.x + '</button><p class="pk-holdmsg" role="status" aria-live="polite"></p></div>' + PK.whoHtml() + (g ? PK.guardHtml() : "") +
    M.html(cur, {}) + M.capHtml() + '<p class="pdm-st" id="pdm-st" role="status" aria-live="polite">' + (msg ? M.say(cur, msg) : "") + "</p>" + cardEl + (openN != null ? M.fullHtml(openN) : "") + PK.holdHtml() + hint(true) + M.legendHtml();
  if (halo) [].forEach.call(el2.querySelectorAll(".pdm-c[data-n].st-open:not(.g-stop):not(:disabled)"), function (c) { c.classList.add("halo"); });
}
function place() { /* C: the card sits beside the first flyout, its caret on the Another day row */
  if (!el2 || view !== "month") return;
  el2.style.removeProperty("--caret-x"); el2.style.removeProperty("--caret-y"); el2.style.left = ""; el2.style.top = "";
  if (eff() !== "c") return;
  var fr0 = el.getBoundingClientRect(), fr = { left: el.offsetLeft + app.getBoundingClientRect().left, top: fr0.top, bottom: fr0.bottom }, row = el.querySelector("[data-more]"), rr = row ? row.getBoundingClientRect() : fr, w = 400, h = el2.offsetHeight, y = rr.top + rr.height / 2;
  var left = Math.max(96, fr.left - w - 16), top = Math.max(8, Math.min(innerHeight - h - 8, y - Math.min(h * 0.82, 200)));
  el2.style.left = left + "px"; el2.style.top = top + "px"; el2.style.setProperty("--caret-x", left + w + "px"); el2.style.setProperty("--caret-y", Math.max(top + 24, Math.min(top + h - 24, y)) + "px");
}
function focusWant() {
  if (!want) return; var t = (el2 && !el2.hidden && el2.querySelector(want)) || el.querySelector(want); want = null;
  if (t) { quiet = true; t.focus({ preventScroll: true }); quiet = false; } /* a focus the flyout moves itself shows no card update */
}
function layout() {
  var mo = view === "month" && M, e = eff();
  if (mo) app.dataset.second = e; else delete app.dataset.second;
  el2.hidden = !mo; $("#pk-scrim").hidden = !(mo && e === "b");
  if (mo && e === "b") el.setAttribute("inert", ""); else el.removeAttribute("inert"); /* B: the first flyout waits behind the second, so Tab stays in front */
}
function draw() {
  if (M) M.hidePop();
  drawFirst(); if (view === "month" && M) drawSecond(); else if (el2) el2.innerHTML = "";
  layout(); place(); focusWant();
}
/* the month's file and styles are fetched the first time Another day is pressed (DESIGN.md section 6); no wide files: the second flyout is one flyout wide */
function withMonth(cb) {
  if (window.PKMonth) { M = window.PKMonth; cb(); return; }
  var left = 2, one = function () { if (--left > 0) return; M = window.PKMonth; cb(); };
  var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "month.css"; l.onload = l.onerror = one; document.head.appendChild(l);
  var s = document.createElement("script"); s.src = BASE + "month.js"; s.onload = s.onerror = one; document.head.appendChild(s);
}
function openMonth() {
  if (hold || loading) return; loading = true;
  withMonth(function () { loading = false; if (!el) return; view = "month"; openN = null; msg = ""; S.sel = null; S.leave = false; cur = P.todayN; want = cellSel(cur); haloOn(); draw(); });
}
/* close the second flyout only (Esc, the back arrow, the dimmed edge in B): the first flyout stays and the focus goes back to Another day */
function closeSecond() {
  if (view !== "month") return; clearHalo(); if (M) M.hidePop();
  view = "list"; openN = null; msg = ""; if (selIn === 2) { S.sel = null; S.leave = false; } want = "[data-more]"; draw();
}
function onWide() { if (el && view === "month") draw(); }

/* ---------- picking ---------- */
function pickRow(i) {
  if (hold) return;
  var d = days()[i], v = R.view(d, ctxFor(d));
  if (v.peek && openDay !== i) { openDay = i; want = '.row-d[data-i="' + i + '"]'; draw(); return; } /* a stacked night: the first pick only opens it, the second plans */
  if (view === "month") { clearHalo(); view = "list"; openN = null; draw(); } /* a pick in the first flyout dismisses the second */
  var g = PK.guardFor(d.n); selIn = 1; S.sel = d.n; S.leave = false;
  if (g) { want = '.row-d[data-i="' + i + '"]'; draw(); return; }
  PK.commit(d.n);
}
function pickCell(n) {
  if (hold || n < P.todayN || n > P.lastN) return;
  var d = PK.dayObj(n), v = R.view(d, ctxFor(d));
  if (openN != null && openN !== n) openN = null;
  cur = n; msg = ""; selIn = 2;
  if (v.peek && openN !== n) { openN = n; want = cellSel(n); draw(); return; }
  var g = PK.guardFor(n); S.sel = n; S.leave = false;
  if (g) { want = cellSel(n); draw(); return; }
  PK.commit(n);
}
function side(n) { var sd = $("#pdw-side"); if (sd && M) sd.innerHTML = M.cardHtml(n); }
function setCur(n, m) {
  var old = el2.querySelector('.pdm-c[tabindex="0"]'); if (old) old.tabIndex = -1;
  cur = n; msg = m || ""; var b = el2.querySelector(cellSel(n)); if (b) { b.tabIndex = 0; b.focus({ preventScroll: true }); }
  side(n); var s = $("#pdm-st"); if (s) s.innerHTML = m ? M.say(n, m) : "";
}
function click(e) {
  var t = e.target.closest("button"); if (!t) return;
  if (hold) { if (t.hasAttribute("data-cfundo")) { var u = document.querySelector('.toast [data-act="undo"]'); if (u) u.click(); } return; }
  if (t.hasAttribute("data-more")) { if (view === "month") closeSecond(); else openMonth(); return; }
  if (t.hasAttribute("data-hold")) { holdToggle(t); return; }
  if (t.hasAttribute("data-back")) { closeSecond(); return; }
  if (t.hasAttribute("data-sidepick")) { pickCell(+t.dataset.n); return; }
  if (t.classList.contains("pdm-c")) { pickCell(+t.dataset.n); return; }
  if (t.dataset.peek !== undefined) { var i = +t.dataset.peek; openDay = openDay === i ? null : i; want = '.row-d[data-i="' + i + '"]'; draw(); var q = el.querySelector('[data-w="' + i + '"] .peek-b'); if (q) q.focus(); return; }
  if (t.classList.contains("row-d")) { pickRow(+t.dataset.i); return; }
  PK.common(t, function () { openDay = null; openN = null; want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : null; draw(); });
}
function over(e) {
  if (view !== "month" || !M || !el2.contains(e.target)) return; var b = e.target.closest && e.target.closest(".pdm-c"); if (!b || b.disabled || b.classList.contains("pdm-sw")) return;
  if (!quiet) side(+b.dataset.n);
}
function out(e) {
  if (view !== "month" || !M || !el2.contains(e.target)) return; var b = e.target.closest && e.target.closest(".pdm-c"); if (!b) return;
  if (e.relatedTarget && b.contains(e.relatedTarget)) return;
  var a = document.activeElement, n = a && a.classList && a.classList.contains("pdm-c") && el2.contains(a) ? +a.dataset.n : cur; /* the strip goes back to the date you are on */
  side(n);
}
function winKey(e) { /* Ctrl or Cmd+Esc closes both flyouts at once (Home's own close); window capture runs before common.js */
  if (!S.open || e.key !== "Escape" || !(e.ctrlKey || e.metaKey)) return;
  if (!$("#kb").hidden) return; e.preventDefault(); e.stopPropagation(); PK.close();
}
var scrim;
function attach(on) {
  var f = on ? "addEventListener" : "removeEventListener";
  [el, el2].forEach(function (x) { x[f]("click", click); x[f]("mouseover", over); x[f]("mouseout", out); x[f]("focusin", over); x[f]("focusout", out); });
  el2[f]("pointerdown", clearHalo); el2[f]("keydown", clearHalo); scrim[f]("click", closeSecond); window[f]("keydown", winKey, true);
  if (MQ.addEventListener) MQ[f]("change", onWide); addEventListener("resize", place);
  if (!on) removeEventListener("resize", place);
}

PK.register({
  rules: rules,
  open: function () {
    saved = H.S.front; openDay = null; openN = null; view = "list"; S.sel = null; cur = P.todayN; msg = ""; selIn = 1;
    if (saved !== "week") H.set({ front: "week" });
    el = $("#week"); el2 = $("#week2"); app = $("#app"); scrim = $("#pk-scrim"); el.classList.add("pk", "pk-fly");
    attach(true); draw(); var f = el.querySelector(".row-d"); if (f) f.focus({ preventScroll: true });
  },
  confirm: function (verb, name, label, note) {
    if (hold) return; if (M) M.hidePop();
    var t = view === "month" ? el2 : el; /* the confirmation shows where you picked, with its 3 second Undo */
    t.innerHTML = '<div class="pk-pt"><div><h2 id="' + (t === el2 ? "pk-t2" : "pk-t") + '">Plan ' + esc(name) + '</h2></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" + R.confHtml(verb, name, esc(label), esc(note || ""));
    if (t === el2) { el.classList.add("pk-under"); el.setAttribute("inert", ""); }
    t.querySelector("[data-close]").focus({ preventScroll: true });
    hold = R.hold(t, function () { hold = null; if (S.open) { PK.close(true); PK.refocus(); } });
  },
  undone: function () { if (hold) hold.didUndo(); },
  close: function () {
    if (!el) return; if (M) M.hidePop();
    if (hold) { var h = hold; hold = null; h.live = false; clearTimeout(h.t); clearTimeout(h.t2); }
    clearTimeout(haloT); halo = false; attach(false);
    el.classList.remove("pk-out", "pk-under"); el2.classList.remove("pk-out"); el.removeAttribute("inert"); el2.hidden = true; el2.innerHTML = ""; scrim.hidden = true; delete app.dataset.second; view = "list";
    el.classList.remove("pk", "pk-fly"); el = null; H.set({ front: saved || "detail" });
  },
  esc: function () { if (!hold && view === "month") { closeSecond(); return; } PK.close(); }, /* Esc closes the top flyout: the second first, then the first */
  key: function (e) {
    if (halo && el && (el.contains(e.target) || el2.contains(e.target))) clearHalo();
    if (hold && (e.key === "z" || e.key === "Z")) { var u = document.querySelector('.toast [data-act="undo"]'); if (u) { e.preventDefault(); u.click(); } return; }
    if (hold) return;
    if (view === "month" && el2.contains(e.target)) {
      if (!e.target.classList || !e.target.classList.contains("pdm-c")) return;
      var t = M.target(e, +e.target.dataset.n); if (!t || t.enter) return;
      e.preventDefault(); setCur(t.n, t.msg); return;
    }
    if (!el.contains(e.target)) return;
    R.key(e, el, { toggle: function (i, on) { openDay = on ? i : null; want = '.row-d[data-i="' + i + '"]'; draw(); if (on) { var q = el.querySelector('[data-w="' + i + '"] .peek-b'); if (q) q.focus(); } } });
  },
  focus: function () { if (!el) return; var f = view === "month" ? el2.querySelector(cellSel(cur)) : el.querySelector(".row-d"); if (f) f.focus({ preventScroll: true }); },
  help: function () {
    return [{ title: "Choosing a night (Plan it, the next seven days)", rows: [["↑  ↓", "Move along the nights"], ["Home  End", "First and last night"], ["Enter", "Plan that night. It is planned at once; a confirmation with Undo stays about 3 seconds, then slides out"], ["→", "Open that night’s full picture (everyone’s plans)"], ["←", "Fold it again"], ["Esc", "Close"]] },
      { title: "Choosing another day (the second flyout)", rows: [["Enter", "On the Another day row: open the month in a second flyout"], ["←  →", "A day back or ahead"], ["↑  ↓", "A week back or ahead, the same weekday"], ["Home  End", "The first and last day of the plan"], ["Enter", "Plan that date (a stacked night shows everyone’s plans first; Enter again plans it)"], ["Esc", "Close the second flyout and go back to the seven days"], ["Ctrl  Esc", "Close both flyouts (Cmd Esc on a Mac)"]] }];
  }
});

/* the rail's mockup controls: this page's Second flyout group, and without the groups that belong to the one-wide-panel layouts */
(function () {
  var pn = $("#pk-swp"); if (!pn) return;
  [].forEach.call(pn.querySelectorAll(".pk-swg"), function (g) { var t = (g.querySelector("span") || {}).textContent || ""; if (/^(Wide layout|Side card|Another day|Flyout width)/.test(t)) g.remove(); });
  var u = new URL(location.href), opts = [["a", "A: stacked right of the first"], ["b", "B: over the first, first dimmed"], ["c", "C: floating, anchored to the row"]], h = '<div class="pk-swg"><span>Second flyout</span>';
  opts.forEach(function (o) { var p = new URLSearchParams(u.search); p.set("second", o[0]); p.set("start", "month"); h += '<a href="?' + p.toString() + '"' + (VAR === o[0] ? ' aria-current="true"' : "") + ">" + o[1] + "</a>"; });
  pn.insertAdjacentHTML("afterbegin", h + "</div>");
})();
/* ?start=list|month opens the flyout on load (the rail's mockup controls and the check use it); month also opens the second flyout */
var st = Q.get("start");
if (st === "list" || st === "month") setTimeout(function () { PK.open(null, P.rid); if (st === "month") openMonth(); }, 60);
})();
