/* The stand-in host for the tablet and phone sheets (tablet.html, phone.html). On a tablet or phone the month is a sheet over the recipe screen, not a flyout beside Home, so this file gives the flyout (pick-month.js, unchanged)
   the little it asks of Home: the sample recipe, a "front" switch that shows or hides the sheet, and the toast with Undo. Nothing is stored. Mockup scaffolding only, not part of the app. */
(function () {
"use strict";
var D = window.HDP_DATA, H = window.HDP = {}, P = window.PKD;
var $ = function (s, r) { return (r || document).querySelector(s); };
if (/[?&]embed=1/.test(location.search)) document.body.setAttribute("data-no-theme-fab", "");
H.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
H.$ = $; H.D = D;
H.idea = function (id) { return D.ideas.filter(function (r) { return r.id === id; })[0]; };
H.S = { front: "detail", open: "recipe:" + P.rid, undo: null };
H.set = function (o) {
  Object.keys(o).forEach(function (k) { H.S[k] = o[k]; });
  var w = $("#week"), on = H.S.front === "week"; if (w) w.hidden = !on;
  document.body.dataset.sheet = on ? "open" : "";
  document.documentElement.style.overflow = on ? "hidden" : "";
};
H.kbd = function (c) { return '<kbd class="kbd">' + c + "</kbd>"; };
H.toast = function (msg, undo) {
  var t = $(".toast"); if (t) t.remove();
  t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
  t.innerHTML = "<span>" + msg + "</span>" + (undo ? '<button type="button" data-act="undo">Undo</button>' : "");
  document.body.appendChild(t); H.S.undo = undo || null; clearTimeout(H.toast.t); H.toast.t = setTimeout(function () { if (t.parentNode) t.remove(); }, 6000);
};
document.addEventListener("click", function (e) {
  var u = e.target.closest('[data-act="undo"]'); if (!u) return;
  if (H.S.undo) { var f = H.S.undo; H.S.undo = null; f(); var t = $(".toast"); if (t) t.remove(); }
});
var d = D.ideas.filter(function (r) { return r.id === P.rid; })[0];
var host = $("#sh-recipe"); if (host && d) {
  host.innerHTML = '<div class="sh-hero"><span class="sh-e" aria-hidden="true">' + H.esc(d.emoji) + '</span><div><h1>' + H.esc(d.name) + "</h1><p>" + d.mins + " min, serves " + d.serves + ". " + H.esc(d.why) + ".</p></div></div>" +
    '<ul class="sh-lines">' + d.lines.map(function (l) { return "<li><span>" + H.esc(l.n) + "</span><small>need " + H.esc(l.need) + ", have " + H.esc(l.have) + "</small></li>"; }).join("") + "</ul>" +
    '<button type="button" class="sh-plan" data-act="plan">Add to plan</button>';
}
})();
