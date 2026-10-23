/* Stacked-night cue options (owner, 24 Oct 2026: the thin sliver under a day row "reads as a stray border"; draw other visual languages). MOCKUP ONLY, nothing is built, nothing is saved.
   The F flyout is the real one (../pick-f.js, ../rows.js, ../rows.css, unchanged). This file only decorates what it draws: for each "stacked night" row (.row-w.has-peek) it reads the night's meals from the
   page's own sample (PK.info) and puts a cue into the existing .peek-b button, so the button, its keys (right arrow opens, left folds, the first pick opens the night, the second plans) and its aria-expanded
   are exactly F's. ?cue=0 (default) the sliver as it is today; 1 count badge; 2 stacked cards; 3 who dots; 4 mini row. ?open=0 leaves the flyout closed. */
(function () {
"use strict";
var Q = new URLSearchParams(location.search), CUE = /^[0-4]$/.test(Q.get("cue") || "") ? Q.get("cue") : "0";
var PK = window.PK, P = window.PKD, app = document.getElementById("app");
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
var ICON = '<svg class="cue-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3.5" width="14" height="10" rx="2.5"/><rect x="3" y="9.5" width="14" height="10" rx="2.5" fill="var(--surface)"/></svg>';
function nm(w) { return w === "me" ? P.me : w; }
function groups(n) { var o = [], m = PK.info(n).meals.filter(function (x) { return x.who !== "all"; }); m.forEach(function (x) { var p = nm(x.who), g = o.filter(function (z) { return z.p === p; })[0]; if (!g) o.push(g = { p: p, a: [] }); g.a.push(x.name); }); return o; }
function decorate() {
  var host = document.getElementById("week"); if (!host) return;
  host.setAttribute("data-cue", CUE);
  [].forEach.call(host.querySelectorAll(".row-w.has-peek"), function (w) {
    var i = +w.dataset.w, n = P.todayN + i, total = PK.info(n).meals.length, g = groups(n), b = w.querySelector(".peek-b"), open = w.classList.contains("open"), day = w.querySelector(".dl").textContent;
    w.setAttribute("data-meals", total); w.setAttribute("data-extra", Math.min(2, total - 1));
    w.classList.toggle("cue-solo", total < 2 && CUE !== "0"); /* one meal only (someone's own plan on an otherwise open night): F still opens it in two steps, but no cue is drawn (see the notes) */
    if (!b || open || CUE === "0" || b.dataset.cued || total < 2) return; b.dataset.cued = CUE;
    var who = g.map(function (x) { return x.p; }).join(" and ");
    b.setAttribute("aria-label", total + " meals on " + day + ", " + who + (g.length > 1 ? " have their own" : " has their own") + ". Show everyone’s plans");
    if (CUE === "1") b.innerHTML = ICON + "<b>" + total + " meals</b>";
    else if (CUE === "2") b.innerHTML = '<span class="cue-sr">' + total + " meals</span>";
    else if (CUE === "3") b.innerHTML = '<span class="cue-av" aria-hidden="true">' + g.slice(0, 3).map(function (x) { return "<i>" + esc(x.p.charAt(0)) + "</i>"; }).join("") + '</span><span class="cue-sr">' + esc(who) + (g.length > 1 ? " have" : " has") + " their own</span>";
    else if (CUE === "4") b.innerHTML = g.slice(0, 2).map(function (x) { return '<span class="cue-mini"><i class="cue-l" aria-hidden="true"></i><b>' + esc(x.p) + "</b><span>" + esc(x.a.join(" and ")) + "</span></span>"; }).join("") + (g.length > 2 ? '<span class="cue-mini"><i class="cue-l" aria-hidden="true"></i><span>+' + (g.length - 2) + " more</span></span>" : "");
  });
}
var host = document.getElementById("week");
if (host) { new MutationObserver(decorate).observe(host, { childList: true, subtree: true }); }
decorate();
if (Q.get("open") !== "0") setTimeout(function () { var b = document.querySelector('#detail [data-act="plan"]'); if (b && PK && !PK.S.open) { PK.open(b, P.rid); } if (Q.get("night") === "open") setTimeout(function () { var r = document.querySelector('#week .peek-b'); if (r) r.click(); }, 150); }, 350);
})();
