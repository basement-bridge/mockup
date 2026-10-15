/* Option C: a four-week grid as a desktop panel anchored to the Plan button (agent's recommendation, not chosen). Four rows of seven days: today ringed, past greyed,
   each cell shows the meal there, a usual day off says Off. Arrow keys move in two directions, Enter plans, today (or the next free day) is preselected.
   Keys are A's: digits and letters jump within the week of the chosen day. The panel reads four weeks of the plan when it opens (one range read in the build). */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, esc = PK.esc, ico = PK.ico, H = window.HDP;
var el, want = null, W = 468;
function cells() {
  var h = '<div class="pk-gh" aria-hidden="true"></div>' + P.dn.map(function (d) { return '<div class="pk-gh" aria-hidden="true">' + d + "</div>"; }).join("");
  for (var r = 0; r < 4; r++) {
    var m = PK.info(r * 7);
    h += '<div class="pk-gw" role="rowheader"><b>' + (r === 0 ? "This" : r === 1 ? "Next" : "+" + r) + '</b><span>' + m.num + " " + m.mon + "</span></div>";
    for (var i = 0; i < 7; i++) {
      var n = r * 7 + i, d = PK.info(n), cls = "pkc" + (n === P.todayN ? " today" : "") + (d.meals.length ? " full" : d.off ? " off" : ""), on = S.sel === n;
      var txt = d.meals.length ? PK.first(d.meals[0].name) + (d.meals.length > 1 ? " +" + (d.meals.length - 1) : "") : d.off ? "Off" : "Free";
      var lab = d.label + (n === P.todayN ? ", today" : "") + (d.past ? ", past" : "") + ", " + (d.meals.length ? d.meals.map(function (x) { return x.name; }).join(" and ") : d.off ? "usual day off" : "free");
      h += '<button type="button" role="gridcell" class="' + cls + '" data-n="' + n + '" aria-selected="' + on + '"' + (d.past ? " disabled" : "") + ' tabindex="' + (on ? 0 : -1) + '" aria-label="' + esc(lab) + '"><i>' + (d.num === 1 ? d.num + " " + d.mon : d.num) + "</i><span>" + txt + "</span></button>";
    }
  }
  return h;
}
function draw() {
  el.innerHTML = '<div class="pk-pt"><div><h3 id="pk-t">Plan ' + esc(PK.R().name) + '</h3><p class="pk-sub">Pick a day, this week to three weeks ahead</p></div><button type="button" class="x" data-close aria-label="Close">' + ico.x + "</button></div>" +
    '<div class="pk-grid" role="grid" aria-label="Day, four weeks">' + cells() + "</div>" +
    '<p class="pk-key"><span class="pk-sw0 t"></span>Today <span class="pk-sw0 f"></span>Meal planned <span class="pk-sw0 o"></span>Usual day off</p>' +
    PK.noteHtml(true) + PK.guardHtml() + PK.whoHtml() + PK.holdHtml() +
    PK.footHtml(PK.kbd("←") + PK.kbd("→") + PK.kbd("↑") + PK.kbd("↓") + " move " + PK.kbd("Enter") + " plan " + PK.kbd("Esc") + " close");
  place();
  if (want) { var t = el.querySelector(want); want = null; if (t) t.focus({ preventScroll: true }); }
}
/* anchored: to the left of the pane the Plan button is in, level with the button, with a caret that points at it; where there is no room on the left, under or over the button */
function place() {
  if (!el) return;
  var a = PK.anchor && PK.anchor.isConnected ? PK.anchor : document.querySelector('#detail [data-act="plan"]'); if (!a) return;
  var r = a.getBoundingClientRect(), pane = a.closest(".panel, .card") || a, pr = pane.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, h = el.offsetHeight, left, top, side = "l";
  left = pr.left - W - 12;
  if (left < 100) { side = "b"; left = Math.max(100, Math.min(vw - W - 8, r.right - W)); }
  top = side === "l" ? Math.max(8, Math.min(vh - h - 8, r.top + r.height / 2 - h / 2)) : Math.max(8, Math.min(vh - h - 8, r.bottom + 10));
  el.style.left = left + "px"; el.style.top = top + "px"; el.dataset.side = side;
  el.style.setProperty("--caret", Math.max(18, Math.min(h - 30, r.top + r.height / 2 - top - 6)) + "px");
}
function pick(n) { S.sel = n; S.leave = false; want = '[data-n="' + n + '"]'; draw(); }
function enabled(n) { return n >= 0 && n < P.GRIDN && !PK.info(n).past; }
function nextEnabled(n, d) { for (var m = n + d; m >= 0 && m < P.GRIDN; m += d) if (enabled(m)) return m; return n; }
function rowDays(n) { var r = Math.floor(n / 7), out = []; for (var i = 0; i < 7; i++) if (enabled(r * 7 + i)) out.push(r * 7 + i); return out; }
function jump(k, n) {
  var ds = rowDays(n); if (/^[1-7]$/.test(k)) { var t = Math.floor(n / 7) * 7 + (+k - 1); if (ds.indexOf(t) > -1) { pick(t); return true; } return false; }
  var L = ["m", "t", "w", "t", "f", "s", "s"], c = k.toLowerCase(), cand = ds.filter(function (x) { return L[x % 7] === c; });
  if (!cand.length) return false; pick(cand[(cand.indexOf(n) + 1) % cand.length]); return true;
}
function key(e) {
  if (!e.target.closest || !e.target.closest(".pk-grid")) return;
  var k = e.key, cur = +e.target.dataset.n; if (isNaN(cur)) return;
  if (k === "ArrowRight") { e.preventDefault(); pick(nextEnabled(cur, 1)); }
  else if (k === "ArrowLeft") { e.preventDefault(); pick(nextEnabled(cur, -1)); }
  else if (k === "ArrowDown") { e.preventDefault(); pick(enabled(cur + 7) ? cur + 7 : cur); }
  else if (k === "ArrowUp") { e.preventDefault(); pick(enabled(cur - 7) ? cur - 7 : cur); }
  else if (k === "Home" || k === "End") { e.preventDefault(); var ds = rowDays(cur); pick(k === "Home" ? ds[0] : ds[ds.length - 1]); }
  else if (k === "Enter") { e.preventDefault(); S.sel = cur; PK.ok(); }
  else if (k.length === 1 && /[1-7a-zA-Z]/.test(k) && !e.shiftKey) { if (jump(k, cur)) e.preventDefault(); }
}
PK.register({
  open: function () {
    el = document.createElement("div"); el.className = "pk-pop pk"; el.setAttribute("role", "dialog"); el.setAttribute("aria-labelledby", "pk-t"); el.setAttribute("aria-modal", "false");
    document.body.appendChild(el);
    S.sel = PK.firstFree(P.GRIDN);
    el.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t || t.disabled) return;
      if (t.dataset.n != null) { pick(+t.dataset.n); return; }
      PK.common(t, function () { want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : t.hasAttribute("data-hold") ? "[data-hold]" : null; draw(); });
    });
    draw(); var f = S.sel != null ? el.querySelector('[data-n="' + S.sel + '"]') : el.querySelector(".pkc:not(:disabled)"); if (f) f.focus({ preventScroll: true });
    document.addEventListener("pointerdown", PK.outside = function (e) { if (el && !el.contains(e.target) && !e.target.closest("#kb,.toast,[data-act=plan]")) PK.close(); }, true);
    addEventListener("resize", place);
  },
  close: function () { document.removeEventListener("pointerdown", PK.outside, true); removeEventListener("resize", place); if (el) el.remove(); el = null; },
  key: key,
  focus: function () { if (!el) return; var f = el.querySelector('[aria-selected="true"]') || el.querySelector(".pkc:not(:disabled)"); if (f) f.focus({ preventScroll: true }); },
  help: function () { var r = [["←  →  ↑  ↓", "Move between days and weeks"], ["Home  End", "First and last day of that week"], ["Enter", "Plan the chosen day"], ["1 – 7  or  M T W F S", "Jump to a day of that week (T and S again for the second one)"], ["Esc", "Close without planning"]]; r.title = "Choosing a day (Plan it, option C)"; return r; }
});
})();
