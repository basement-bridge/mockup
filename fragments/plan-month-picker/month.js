/* The month picker for "Another day" (owner, voice, 17 Oct 2026): weekdays run DOWN the left (Mon to Sun as rows), the weeks are stacked as COLUMNS going across, one date per cell.
   The plan window is the real server's: this week and four weeks ahead, so five columns (35 days) from the Monday of today's week to the Sunday four weeks on (kitchie docs/plan-week-api.md "Week window").
   Loaded on engagement only: the flyout fetches this file and month.css the first time "Another day" is pressed (DESIGN.md section 6). Desktop only. Sample data, nothing is stored.
   Markup, keys, the legend and the read-only popover live here; what a pick does is the flyout's (pick-month.js), which is F's. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, esc = PK.esc, R = window.PKRows, Q = PK.Q;
var COLS = Q.get("cols") === "dates" ? "dates" : "both", MONTH = Q.get("month") === "band" ? "band" : "cell";
/* the weekly Plan's own wording (kitchie plan.phone-data.js REL, plan.desktop-data.js weekRel) */
var NAMES = ["This week", "Next week", "In 2 weeks", "In 3 weeks", "In 4 weeks"], LONG = ["this week", "next week", "in 2 weeks", "in 3 weeks", "in 4 weeks"];
function svg(body, cls) { return '<svg class="pdm-i' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + body + "</svg>"; }
var I = {
  plus: svg('<path d="M12 6.5v11M6.5 12h11"/>'),
  plate: svg('<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.3"/>'),
  stack: svg('<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12.5l8 4 8-4"/><path d="M4 17l8 4 8-4"/>'),
  moon: svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'),
  moonF: svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>', "fill"),
  stop: svg('<circle cx="12" cy="12" r="8"/><path d="M6.4 6.4l11.2 11.2"/>'),
  warn: svg('<path d="M12 4l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.1"/>'),
  end: svg('<path d="M5 12h13M13 7l5 5-5 5M20.5 5v14"/>')
};
var M = window.PKMonth = {};

/* the state of one date, from the plan data the flyout already has (a past day, a night with one or more meals, a usual day off, a day off this week only, or open) */
function state(d) {
  if (d.past) return "past";
  if (d.meals.length > 1) return "stack";
  if (d.meals.length) return "plan";
  if (d.off === "usual") return "usual";
  if (d.off === "week") return "week";
  return "open";
}
var WORD = { past: "past", stack: "planned, more than one plan", plan: "planned", usual: "usual day off", week: "off this week only", open: "open" };
function nameOf(w) { return w === "me" ? P.me + " (you)" : w; }
function join(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
/* what is planned that night, read only, grouped as the stacked-night picture does: the household plan, then each person's own */
M.plans = function (d) {
  var hh = d.meals.filter(function (m) { return m.who === "all"; }), ind = d.meals.filter(function (m) { return m.who !== "all"; }), out = [];
  if (hh.length) out.push({ k: "Household", v: hh.map(function (m) { return m.name + ((m.notFor || []).length ? " (without " + join(m.notFor) + ")" : ""); }).join(" and ") });
  uniq(ind.map(function (m) { return m.who; })).forEach(function (w) { out.push({ k: nameOf(w), v: ind.filter(function (m) { return m.who === w; }).map(function (m) { return m.name; }).join(" and ") }); });
  return out;
};

/* ---------- the grid ---------- */
function cell(n, cur) {
  var d = PK.info(n), dj = PK.dayObj(n), k = state(d), g = d.past ? null : PK.guardFor(n), v = R.view(dj, PK.ctxFor(dj));
  var up = n - 1, left = n - 7, ml = left >= P.winStart && PK.info(left).monN !== d.monN, mt = d.i > 0 && PK.info(up).monN !== d.monN;
  var icon = g === "stop" ? I.stop : k === "open" ? I.plus : k === "plan" ? I.plate : k === "stack" ? I.stack + '<b class="pdm-cnt">' + d.meals.length + "</b>" : k === "usual" ? I.moon : k === "week" ? I.moonF : "";
  var badge = (d.off && d.meals.length && !d.past ? '<span class="pdm-bd moon" aria-hidden="true">' + I.moonF + "</span>" : "") + (g === "warn" ? '<span class="pdm-bd warn" aria-hidden="true">' + I.warn + "</span>" : "");
  var said = d.past ? "past" : d.meals.length ? (d.meals.length > 1 ? "planned, " + d.meals.length + " plans" : "planned") + (d.off ? (d.off === "usual" ? ", usual day off, cooking this week" : ", off this week only, cooking it") : "") : WORD[k];
  var plans = !d.past && d.meals.length ? ". " + M.plans(dj).map(function (p) { return p.k + ": " + p.v; }).join(". ") : "";
  var lab = d.full + " " + d.num + " " + d.monFull + (d.today ? ", today" : "") + ", " + said + plans;
  var cls = "pdm-c st-" + k + (d.today ? " today" : "") + (ml ? " ml" : "") + (mt ? " mt" : "") + (g ? " g-" + g : "") + (d.num === 1 ? " first" : "");
  return '<button type="button" role="gridcell" class="' + cls + '" data-n="' + n + '"' + (d.past ? " disabled" : "") + ' tabindex="' + (n === cur ? 0 : -1) + '" aria-label="' + esc(lab) + '">' +
    '<b class="pdm-n">' + (d.num === 1 ? "1 " + d.mon : d.num) + "</b>" + icon + badge + "</button>";
}
M.html = function (cur) {
  var w0 = P.winStart, h = '<div class="pdm pdm-' + COLS + (MONTH === "band" ? " has-band" : "") + '" role="grid" aria-label="Another day, weeks across and days down, ' + PK.info(P.todayN).label + " to " + PK.info(P.lastN).label + '">';
  if (MONTH === "band") {
    h += '<div class="pdm-r" role="row"><span class="pdm-corner"></span>';
    var runs = []; for (var c = 0; c < 5; c++) { var m = PK.info(w0 + c * 7); if (runs.length && runs[runs.length - 1].m === m.monN) runs[runs.length - 1].to = c + 3; else runs.push({ m: m.monN, name: m.monFull, from: c + 2, to: c + 3 }); }
    runs.forEach(function (r) { h += '<span class="pdm-mb" role="columnheader" style="grid-column:' + r.from + "/" + r.to + '">' + r.name + "</span>"; });
    h += "</div>";
  }
  h += '<div class="pdm-r" role="row"><span class="pdm-corner" role="columnheader"><span class="sr-only">Day</span></span>';
  for (var c2 = 0; c2 < 5; c2++) {
    var m2 = PK.info(w0 + c2 * 7), dt = m2.num + (MONTH === "band" ? "" : " " + m2.mon);
    h += '<span class="pdm-h" role="columnheader" aria-label="Week of ' + m2.num + " " + m2.monFull + ", " + LONG[c2] + (c2 === 4 ? ", the last week you can plan" : "") + '">' +
      (COLS === "both" ? '<span class="pdm-hn">' + NAMES[c2] + "</span>" : "") + '<b class="pdm-hd">' + dt + "</b></span>";
  }
  h += "</div>";
  for (var r2 = 0; r2 < 7; r2++) {
    h += '<div class="pdm-r" role="row"><span class="pdm-d" role="rowheader" aria-label="' + P.df[r2] + '">' + P.dn[r2] + "</span>";
    for (var c3 = 0; c3 < 5; c3++) h += cell(w0 + c3 * 7 + r2, cur);
    h += "</div>";
  }
  return h + "</div>";
};
/* the end of the cap: said in words under the last column, never only a colour */
M.capHtml = function () { var l = PK.info(P.lastN); return '<p class="pdm-cap">' + I.end + "<span>The plan ends " + l.dn + " " + l.num + " " + l.mon + ", four weeks ahead</span></p>"; };

/* the line under the grid: what picking that date would do (the row's own consequence line), live for the hovered or focused date */
M.say = function (n, msg) {
  if (msg) return '<span class="pdm-warn-t">' + esc(msg) + "</span>";
  var d = PK.info(n); if (d.past) return "<b>" + d.label + "</b> Already past.";
  var dj = PK.dayObj(n), v = R.view(dj, PK.ctxFor(dj));
  return "<b>" + (d.today ? "Today, " : "") + d.label + "</b> " + esc(/[.!?]$/.test(v.cons) ? v.cons : v.cons + ".") + (v.peek ? " Pick it twice: the first pick shows everyone’s plans." : "");
};
/* a stacked night, opened in place by its first pick: the household plan and each person's own (the same picture as F's) */
M.fullHtml = function (n) {
  var d = PK.info(n), dj = PK.dayObj(n);
  return '<div class="pdm-full" role="group" aria-label="' + d.label + ', everyone’s plans">' + M.plans(dj).map(function (p) { return "<p><b>" + esc(p.k) + "</b>" + esc(p.v) + "</p>"; }).join("") + '<p class="row-hint">Pick the date again to plan it.</p></div>';
};

/* ---------- the legend, at the foot of the flyout: the same swatches as the cells, each with an icon or a pattern and a word ---------- */
M.legendHtml = function () {
  var items = [["open", I.plus, "Open"], ["plan", I.plate, "Planned"], ["stack", I.stack, "2+ plans"], ["usual", I.moon, "Usual day off"], ["week", I.moonF, "Off this week"], ["past", "", "Past"], ["none today", "", "Today"]];
  if (P.avoid) items.push(["none g-warn", I.warn, "Hard avoid: asks first"]);
  return '<ul class="pdm-lg" aria-label="Key">' + items.map(function (x) { return '<li><span class="pdm-c pdm-sw st-' + x[0] + '" aria-hidden="true">' + (x[2] === "Past" ? '<b class="pdm-n">9</b>' : x[2] === "Today" ? '<b class="pdm-n">17</b>' : x[1]) + "</span>" + x[2] + "</li>"; }).join("") + "</ul>";
};

/* ---------- keys: arrows in two directions. Up and Down are one day, Left and Right are one week (the same weekday). Home is today, End the last day of the plan ---------- */
M.target = function (e, cur) {
  var k = e.key, lo = P.todayN, hi = P.lastN, step = k === "ArrowRight" ? 7 : k === "ArrowLeft" ? -7 : k === "ArrowDown" ? 1 : k === "ArrowUp" ? -1 : 0;
  if (k === "Enter") return { n: cur, enter: true };
  if (k === "Home") return { n: lo };
  if (k === "End") return { n: hi };
  if (!step) return null;
  var t = cur + step, l = PK.info(hi);
  if (t > hi) return { n: cur, msg: cur === hi ? l.label + " is the last day you can plan." : "The plan ends " + l.label + "." };
  if (t < lo) return { n: cur, msg: cur === lo ? "Today is the first day you can plan." : "Earlier days are already past." };
  return { n: t };
};

/* ---------- the read-only popover: hover or keyboard focus on a planned or closed date. It sits to the left of the flyout so the grid stays visible ---------- */
var pop = null;
M.hidePop = function () { if (pop) { pop.remove(); pop = null; } };
M.showPop = function (btn, host) {
  M.hidePop(); var n = +btn.dataset.n, d = PK.info(n), dj = PK.dayObj(n); if (d.past) return;
  var plans = M.plans(dj), k = state(d); if (k === "open") return;
  var chip = d.meals.length ? (d.off ? (d.off === "usual" ? "Usual day off, cooking this week" : "Off this week only, cooking it") : d.meals.length > 1 ? d.meals.length + " plans" : "Planned") : d.off === "usual" ? "Usual day off" : "Off this week only";
  var body = plans.length ? plans.map(function (p) { return "<p><b>" + esc(p.k) + "</b>" + esc(p.v) + "</p>"; }).join("") : '<p class="pdm-pop-q">' + (d.off === "usual" ? "Not cooking. Every week, usual day off." : "Not cooking. This week only.") + "</p>";
  pop = document.createElement("div"); pop.className = "pdm-pop"; pop.setAttribute("role", "tooltip"); pop.id = "pdm-pop";
  pop.innerHTML = '<div class="pdm-pop-h"><b>' + d.full + " " + d.num + " " + d.monFull + '</b><span>' + chip + "</span></div>" + body + '<p class="pdm-pop-f">Read only. Pick the date to plan it.</p>';
  document.body.appendChild(pop);
  var r = btn.getBoundingClientRect(), hr = host.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  var left = hr.left - pw - 10; if (left < 96) left = Math.min(innerWidth - pw - 8, r.right + 8); /* no room on the left: to the right of the cell */
  var top = Math.max(8, Math.min(innerHeight - ph - 8, r.top + r.height / 2 - ph / 2));
  pop.style.left = left + "px"; pop.style.top = top + "px"; btn.setAttribute("aria-describedby", "pdm-pop");
};
})();
