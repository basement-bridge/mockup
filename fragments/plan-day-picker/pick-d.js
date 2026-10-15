/* Option D: choose on the Plan page. The recipe is carried to the real week and dropped on a day; there is no sheet. Leaving Home is a navigation (the cost the issue names),
   drawn here in place over Home so the mockup stays one page; back is one press. A drop is a second meal, never a replace (Replace is the Home card only). The
   week page here is a plain stand-in for the desktop Plan agenda (fragments/plan-desktop): one week at a time, up to four weeks ahead, rows that take a drop. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, H = window.HDP, esc = PK.esc, ico = PK.ico, $ = PK.$;
var el, want = null, hover = null, done = null;
PK.noReplace = true;
function rows() {
  var h = "";
  for (var i = 0; i < 7; i++) {
    var n = S.wk * 7 + i, d = PK.info(n), tile = d.meals.map(function (m) { return '<span class="pk-m' + (m.who === "me" ? " own" : "") + '"><b>' + esc(m.name) + "</b><small>" + (m.who === "all" ? "Everyone" : m.who === "me" ? P.me : m.who) + (m.hold ? " &middot; held" : "") + "</small></span>"; }).join("");
    var lab = "Drop on " + d.label + (d.past ? ", past" : d.off ? ", usual day off" : d.meals.length ? ", already has " + d.meals.map(function (x) { return x.name; }).join(" and ") : ", free");
    h += '<button type="button" class="pk-dr' + (d.past ? " past" : "") + (n === P.todayN ? " today" : "") + (hover === n ? " over" : "") + (S.sel === n ? " target" : "") + '" data-n="' + n + '" aria-label="' + esc(lab) + '"' + (d.past ? " aria-disabled=\"true\" tabindex=\"-1\"" : "") + '><span class="pk-dh"><b>' + d.dn + "</b><small>" + d.num + " " + d.mon + "</small></span><span class=\"pk-ds\">" + (tile || (d.off ? '<em>Usual day off</em>' : "<em>Free</em>")) + "</span></button>";
  }
  return h;
}
function lane() {
  var r = PK.R();
  if (done) return '<h2>Planned</h2><p class="pk-sub">' + esc(r.name) + " is on " + esc(done) + '.</p><button type="button" class="btn pri" data-back>Back to Home</button><p class="phint hint pk-hint">Undo is in the message at the bottom.</p>';
  var inf = S.sel != null ? PK.info(S.sel) : null;
  return '<h2>Plan it</h2><p class="pk-sub">Drag the meal to a day, or choose a day and press Enter.</p>' +
    '<div class="pk-carry" draggable="true" data-carry aria-label="' + esc(r.name) + ', drag to a day"><span class="e">' + r.emoji + '</span><span class="t"><b>' + esc(r.name) + "</b><small>" + r.mins + " min &middot; serves " + r.serves + "</small></span></div>" +
    (inf && !PK.guard() ? '<p class="pk-note">' + (inf.meals.length ? esc(inf.meals[0].name) + " is already on " + inf.dn + ". This adds a second meal; it does not replace it." : inf.off ? inf.dn + " is a usual day off. Planning it cooks this week only." : "Ready for " + inf.label + ".") + "</p>" : "") +
    PK.guardHtml() + PK.whoHtml() + PK.holdHtml() +
    '<div class="pk-foot"><button type="button" class="btn ghost" data-back>Back to Home</button><button type="button" class="btn pri" data-ok' + (S.sel == null || PK.guard() ? " disabled" : "") + ">" + (inf ? "Plan for " + inf.dn : "Pick a day") + "</button></div>" +
    '<p class="phint hint pk-hint">' + PK.kbd("Enter") + " on a day plans it " + PK.kbd("Esc") + " back to Home</p>";
}
function draw() {
  el.innerHTML = '<div class="pk-pm"><div class="pk-ph"><h1>Plan</h1><div class="pk-wk"><button type="button" class="pk-ib" data-wk="-1" aria-label="Previous week"' + (S.wk === 0 ? " disabled" : "") + ">" + ico.back + "</button><b>" + PK.weekLabel(S.wk) + '</b><button type="button" class="pk-ib" data-wk="1" aria-label="Next week"' + (S.wk === 4 ? " disabled" : "") + ">" + ico.chev + '</button></div></div><div class="pk-dl" role="group" aria-label="Days">' + rows() + '</div></div><aside class="pk-lane" aria-label="Plan it">' + lane() + "</aside>";
  if (want) { var t = el.querySelector(want); want = null; if (t) t.focus({ preventScroll: true }); }
}
function choose(n) { var d = PK.info(n); if (d.past) return; S.sel = n; S.leave = false; want = '[data-n="' + n + '"]'; draw(); if (!PK.guard()) PK.ok(); }
PK.register({
  open: function () {
    done = null; el = document.createElement("div"); el.className = "pk-plan pk"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Plan page"); document.body.appendChild(el);
    S.sel = null;
    el.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.hasAttribute("data-back")) { PK.close(); return; }
      if (t.dataset.n != null) { choose(+t.dataset.n); return; }
      if (t.dataset.wk) { S.wk = Math.max(0, Math.min(4, S.wk + +t.dataset.wk)); S.sel = null; want = '[data-wk="' + t.dataset.wk + '"]'; draw(); return; }
      PK.common(t, function () { want = t.dataset.who ? '[data-who="' + t.dataset.who + '"]' : "[data-hold]"; draw(); });
    });
    el.addEventListener("dragstart", function (e) { var c = e.target.closest("[data-carry]"); if (!c) return; e.dataTransfer.setData("text/plain", P.rid); e.dataTransfer.effectAllowed = "move"; c.classList.add("lift"); });
    el.addEventListener("dragend", function () { hover = null; draw(); });
    el.addEventListener("dragover", function (e) { var r = e.target.closest(".pk-dr"); if (!r || r.classList.contains("past")) return; e.preventDefault(); e.dataTransfer.dropEffect = "move"; var n = +r.dataset.n; if (hover !== n) { hover = n; r.classList.add("over"); el.querySelectorAll(".pk-dr.over").forEach(function (x) { if (x !== r) x.classList.remove("over"); }); } });
    el.addEventListener("drop", function (e) { var r = e.target.closest(".pk-dr"); if (!r || r.classList.contains("past")) return; e.preventDefault(); hover = null; choose(+r.dataset.n); });
    draw(); var f = el.querySelector(".pk-dr:not(.past)"); if (f) f.focus({ preventScroll: true });
  },
  close: function () { if (el) el.remove(); el = null; },
  after: function (n) { done = PK.info(n).label; S.sel = null; want = "[data-back]"; draw(); },
  undone: function () { done = null; draw(); },
  key: function (e) { if (e.key === "Enter" && e.target.closest && e.target.closest(".pk-dr")) { /* the button's own click plans it */ } },
  focus: function () { if (el) { var f = el.querySelector(".pk-dr:not(.past)"); if (f) f.focus({ preventScroll: true }); } },
  help: null
});
})();
