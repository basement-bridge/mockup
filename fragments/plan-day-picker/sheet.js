/* The Plan it sheet as it is today (recipes-plan-sheet.js, drawn the way recipe/plan-sheet.js draws it): a title, a This week header with two arrows, a strip of seven
   day buttons, Who it is for, Hold what is in, Cancel and Pick a day. On a desktop it is the same bottom sheet as on the phone. This is option E, unchanged;
   A and B build on it through cfg (A: keys, B: quick). Markup, class names and wording are the sheet's own so the build can lift them. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, esc = PK.esc, ico = PK.ico;
PK.makeSheet = function (cfg) {
  cfg = cfg || {};
  var dim, el, want = null;
  function strip() {
    var h = "";
    for (var i = 0; i < 7; i++) {
      var n = S.wk * 7 + i, d = PK.info(n), w0 = S.wk === 0;
      var past = w0 && d.past, cls = w0 && d.meals.length ? "full" : w0 && d.off ? "off" : "";
      var sub = w0 ? PK.sub(d) : "Free", on = S.sel === n;
      var tab = cfg.keys && S.sel != null && !on ? ' tabindex="-1"' : "";
      h += '<button type="button" data-n="' + n + '" class="' + cls + '" aria-pressed="' + on + '"' + (past ? " disabled" : "") + tab + ' aria-label="' + d.dn + ", " + sub + '">' + d.dn + "<small>" + d.num + "</small><small>" + sub + "</small></button>";
    }
    return h;
  }
  function quick() {
    var t = PK.info(P.todayN), m = PK.info(P.todayN + 1);
    function q(d, label) { return '<button type="button" data-quick="' + d.n + '" class="' + (d.meals.length ? "full" : d.off ? "off" : "") + '" aria-pressed="' + (S.sel === d.n) + '"><b>' + label + "</b><small>" + d.dn + " " + d.num + " &middot; " + PK.sub(d) + "</small></button>"; }
    return '<div class="pk-quick" role="group" aria-label="Quick picks">' + q(t, "Tonight") + q(m, "Tomorrow") + '<button type="button" class="more" data-more>Another day&hellip;</button></div>';
  }
  function draw() {
    var week = '<div class="pk-wk"><button type="button" class="pk-ib" data-wk="-1" aria-label="Previous week"' + (S.wk === 0 ? " disabled" : "") + ">" + ico.back + "</button><b>" + PK.weekLabel(S.wk) + '</b><button type="button" class="pk-ib" data-wk="1" aria-label="Next week"' + (S.wk === 4 ? " disabled" : "") + ">" + ico.chev + "</button></div>";
    var days = cfg.quick && !S.more ? quick() : (cfg.quick ? '<button type="button" class="back pk-back" data-less>&lsaquo; Quick picks</button>' : "") + week + '<div class="days" role="group" aria-label="Day">' + strip() + "</div>";
    var hint = cfg.keys ? PK.kbd("←") + PK.kbd("→") + " move " + PK.kbd("Enter") + " plan " + PK.kbd("1–7") + " jump to a day " + PK.kbd("Esc") + " close" : "";
    el.innerHTML = '<div class="grab" aria-hidden="true"></div><div class="pk-in"><h3 id="pk-t">Plan ' + esc(PK.R().name) + "</h3>" + days + PK.noteHtml() + PK.guardHtml() + PK.whoHtml() + PK.holdHtml() + PK.footHtml(hint) + "</div>";
    if (want) { var t = el.querySelector(want); want = null; if (t) t.focus({ preventScroll: true }); }
  }
  function redraw(sel) { want = sel || null; draw(); }
  function pick(n, o) { S.sel = n; S.leave = false; redraw('[data-n="' + n + '"]'); }
  function days() { var out = []; for (var i = 0; i < 7; i++) { var n = S.wk * 7 + i; if (!(S.wk === 0 && PK.info(n).past)) out.push(n); } return out; }
  function jump(k) {
    var ds = days(), i;
    if (/^[1-7]$/.test(k)) { i = +k - 1; var n = S.wk * 7 + i; if (ds.indexOf(n) > -1) pick(n); return true; }
    var L = ["m", "t", "w", "t", "f", "s", "s"], c = k.toLowerCase(), cand = [];
    ds.forEach(function (n) { if (L[n % 7] === c) cand.push(n); });
    if (!cand.length) return false;
    var at = cand.indexOf(S.sel); pick(cand[(at + 1) % cand.length]); return true;
  }
  function key(e) {
    if (!cfg.keys) return;
    var inDays = e.target.closest && e.target.closest(".days"), k = e.key;
    if (!inDays) return;
    var ds = days(), cur = ds.indexOf(S.sel);
    if (cur < 0) cur = ds.indexOf(+(e.target.dataset && e.target.dataset.n));
    if (k === "ArrowRight" || k === "ArrowLeft") { e.preventDefault(); var j = Math.max(0, Math.min(ds.length - 1, (cur < 0 ? 0 : cur) + (k === "ArrowRight" ? 1 : -1))); pick(ds[j]); }
    else if (k === "Home" || k === "End") { e.preventDefault(); pick(k === "Home" ? ds[0] : ds[ds.length - 1]); }
    else if (k === "Enter") { e.preventDefault(); if (e.target.dataset && e.target.dataset.n != null && S.sel !== +e.target.dataset.n) S.sel = +e.target.dataset.n; PK.ok(); }
    else if (k.length === 1 && /[1-7a-zA-Z]/.test(k) && !e.shiftKey) { if (jump(k)) e.preventDefault(); }
  }
  return {
    open: function () {
      dim = document.createElement("div"); dim.className = "pk-dim"; dim.addEventListener("click", function () { PK.close(); });
      el = document.createElement("div"); el.className = "pk-sheet pk"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "pk-t");
      document.body.appendChild(dim); document.body.appendChild(el);
      if (cfg.keys) S.sel = PK.firstFree(7);
      el.addEventListener("click", function (e) {
        var t = e.target.closest("button"); if (!t || t.disabled) return;
        if (t.dataset.quick != null) { var n = +t.dataset.quick, d = PK.info(n); S.sel = n; S.leave = false;
          /* a free day is one click; a day with a meal or a usual day off is chosen and waits for Plan, so a second meal or a replace is never an accident */
          if (!d.meals.length && !d.off && !PK.guard()) { PK.commit(n); return; } S.more = true; S.wk = 0; redraw('[data-n="' + n + '"]'); return; }
        if (t.hasAttribute("data-more")) { S.more = true; redraw('[data-wk="1"]'); return; }
        if (t.hasAttribute("data-less")) { S.more = false; S.sel = null; redraw('[data-more]'); return; }
        if (t.dataset.n != null) { pick(+t.dataset.n); return; }
        if (t.dataset.wk) { var pi = S.sel != null ? S.sel % 7 : null; S.wk = Math.max(0, Math.min(4, S.wk + +t.dataset.wk)); S.sel = cfg.keys && pi != null ? PK.guardWeek(S.wk, pi) : null; S.leave = false; redraw('[data-wk="' + t.dataset.wk + '"]'); return; }
        PK.common(t, function () { redraw(t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : t.hasAttribute("data-hold") ? "[data-hold]" : null); });
      });
      draw();
      var f = S.sel != null ? el.querySelector('[data-n="' + S.sel + '"]') : el.querySelector(cfg.quick ? "[data-quick]" : ".days button:not(:disabled)");
      if (f) f.focus({ preventScroll: true });
    },
    close: function () { if (dim) dim.remove(); if (el) el.remove(); dim = el = null; },
    key: key,
    focus: function () { if (!el) return; var f = el.querySelector('[aria-pressed="true"]') || el.querySelector("button:not(:disabled)"); if (f) f.focus({ preventScroll: true }); },
    help: cfg.keys ? function () { var r = [["←  →", "Move along the days of the week"], ["Home  End", "First and last day of the week"], ["Enter", "Plan the chosen day"], ["1 – 7  or  M T W F S", "Jump to a day (T and S again for the second one)"], ["Esc", "Close without planning"]]; r.title = "Choosing a day (Plan it, option A)"; return r; } : null
  };
};
/* A keeps the same weekday when it turns the week; a past or full weekday is not taken (never an accidental second meal) */
PK.guardWeek = function (wk, i) { var n = wk * 7 + i; return n; };
})();
