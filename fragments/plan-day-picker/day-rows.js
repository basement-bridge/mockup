/* Standalone day rows with the scenario switch (sample data, nothing saved). Option F draws the same rows from the host's calendar (pick-f.js). */
(function () {
"use strict";
var R = window.PKRows, Q = new URLSearchParams(location.search), me = "Sam";
var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], t = Q.get("today") === null ? 2 : +Q.get("today"); if (!(t >= 0 && t <= 6)) t = 2;
/* the week the host uses (Wed 14 Oct): keyed by weekday so any start day reads the same */
var M = { 4: [{ name: "Salmon patties", who: "me" }], 5: [{ name: "Veg stir-fry", who: "all" }], 6: [{ name: "Chilli noodles", who: "Jo" }], 0: [{ name: "Prawn curry with coconut rice", who: "all", notFor: ["Jo"] }, { name: "Cheese toastie", who: "Jo" }] };
var OFF = { 3: "usual", 1: "week" };
var S = { who: Q.get("who") || "all", avoid: Q.get("avoid") === "mango", off: Q.get("off") === "refuse" ? "refuse" : "open", open: null, pend: null };
var el = document.getElementById("demo"), say = document.getElementById("say");
function days() { var o = []; for (var i = 0; i < 7; i++) { var d = (t + i) % 7; o.push({ dn: DN[d], today: i === 0, off: OFF[d] || null, meals: (M[d] || []).map(function (m) { return { name: m.name, who: m.who, notFor: m.notFor }; }) }); } return o; }
function guard() { if (!S.avoid) return null; return S.who === "Jo" ? "stop" : S.who === "all" ? "warn" : null; }
function ctx() { return { who: S.who, me: me, avoid: S.avoid ? { who: "Jo", item: "mango" } : null, guard: guard(), offRule: S.off }; }
function draw(focus) {
  el.innerHTML = '<div class="rows-ctl" role="group" aria-label="Who is it for"><b>Who is it for</b><span class="seg2">' + [["all", "Everyone"], ["Sam", "Sam"], ["Jo", "Jo"]].map(function (w) { return '<button type="button" data-who="' + w[0] + '" aria-pressed="' + (S.who === w[0]) + '">' + w[1] + "</button>"; }).join("") + "</span></div>" + R.html(days(), ctx(), S.open);
  if (focus != null) { var b = el.querySelector('.row-d[data-i="' + focus + '"]'); if (b) b.focus(); }
}
draw();
function toggle(i, on) { S.open = on ? i : null; draw(i); if (on) { var p = el.querySelector('[data-w="' + i + '"] .peek-b'); if (p) p.focus(); } }
el.addEventListener("click", function (e) {
  var w = e.target.closest("[data-who]"); if (w) { S.who = w.dataset.who; S.open = null; say.textContent = ""; draw(); return; }
  var p = e.target.closest(".peek-b"); if (p) { var i = +p.dataset.peek; S.open = S.open === i ? null : i; draw(); var q = el.querySelector('[data-w="' + i + '"] .peek-b'); if (q) q.focus(); return; }
  var b = e.target.closest(".row-d"); if (!b) return;
  var d = days()[+b.dataset.i], v = R.view(d, ctx());
  say.textContent = v.refuse ? v.cons : v.disabled ? v.cons : (guard() === "warn" ? v.cons + " (Leave Jo out of this meal is the action)" : "Picking " + d.dn + " would commit now. " + v.cons);
});
el.addEventListener("keydown", function (e) { R.key(e, el, { toggle: toggle }); });
document.getElementById("ctl").addEventListener("click", function (e) {
  var b = e.target.closest("button"); if (!b) return;
  if (b.dataset.avoid) S.avoid = b.dataset.avoid === "on"; if (b.dataset.off) S.off = b.dataset.off;
  [].forEach.call(document.querySelectorAll("#ctl button"), function (x) { x.setAttribute("aria-pressed", x.dataset.avoid ? (S.avoid === (x.dataset.avoid === "on")) : (S.off === x.dataset.off)); });
  say.textContent = ""; draw();
});
})();
