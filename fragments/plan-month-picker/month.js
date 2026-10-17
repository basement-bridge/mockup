/* The month picker for "Another day". Owner, 17 Oct 2026 (voice, then typed): weekdays Monday to Sunday run HORIZONTALLY, left to right, and the weeks stack as ROWS (this week plus four), one date per cell.
   (The first cut had weekdays down the side; the owner: "it's not how humans work".) Markup is the same at every width; the stylesheet decides how much each cell shows: month.css (the single-flyout width, compact cells),
   wide.css (two flyouts' worth of width, meal names in the cells), tablet.css and phone.css (the sheet).
   The plan window is the real server's: this week and four weeks ahead, so five columns (35 days) from the Monday of today's week to the Sunday four weeks on (kitchie docs/plan-week-api.md "Week window").
   Loaded on engagement only: the flyout fetches this file and month.css the first time "Another day" is pressed (DESIGN.md section 6). Desktop only. Sample data, nothing is stored.
   Markup, keys, the legend and the read-only popover live here; what a pick does is the flyout's (pick-month.js), which is F's. */
(function () {
"use strict";
var PK = window.PK, P = window.PKD, S = PK.S, esc = PK.esc, R = window.PKRows, Q = PK.Q;
function svg(body, cls) { return '<svg class="pdm-i' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + body + "</svg>"; }
var I = {
  plus: svg('<path d="M12 6.5v11M6.5 12h11"/>'),
  plate: svg('<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.3"/>'),
  stack: svg('<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12.5l8 4 8-4"/><path d="M4 17l8 4 8-4"/>'),
  moon: svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'),
  moonF: svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>', "fill"),
  bang: svg('<path d="M12 4.5v10M12 19v.1"/>', "bang"), /* the Hard avoid mark: a plain exclamation mark (owner, voice, 17 Oct 2026; the triangle looked see-through) */
  end: svg('<path d="M5 12h13M13 7l5 5-5 5M20.5 5v14"/>')
};
/* the planned marks: one neutral dark-grey mark for a night with one plan, three for a stacked night (the count of marks is the cue; same grey, quantity only; red is reserved for the Hard avoid exclamation, owner, voice, 17 Oct 2026) */
function mk(k) { return '<span class="pdm-mk" aria-hidden="true">' + (k > 1 ? "<i></i><i></i><i></i>" : "<i></i>") + "</span>"; }
var M = window.PKMonth = {};

/* the state of one date, from the plan data the flyout already has (a past day, a night with one or more meals, a usual day off, a day off this week only, or open) */
function state(d) {
  if (d.past) return "past";
  if (d.meals.length > 1) return "stack";
  if (d.meals.length) return "plan";
  if (d.off) return "off"; /* one state for every kind of day off (owner, voice, 17 Oct 2026: "just a day off no matter what kind"); the kind is said in the popover and the aria-label. Awaiting his confirmation of the single grey look. */
  return "open";
}
var WORD = { past: "past", stack: "planned, more than one plan", plan: "planned", off: "day off", open: "open" };
function kindOff(d) { return d.off === "usual" ? "usual day off, every week" : "off this week only"; }
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
  var d = PK.vis(n), dj = PK.vdayObj(n), k = state(d), g = d.past ? null : PK.guardFor(n);
  var left = n - 1, up = n - 7, ml = d.i > 0 && n - 1 >= P.winStart && PK.info(left).monN !== d.monN, mt = up >= P.winStart && PK.info(up).monN !== d.monN;
  /* row 2: the plus on an open day, the planned dots (1 or 3), a moon for a day off; a date that cannot be planned for the selected person (the stop) has none */
  var icon = g === "stop" ? "" : k === "open" ? I.plus : k === "plan" ? mk(1) : k === "stack" ? mk(3) : k === "off" ? I.moon : "";
  var moon = d.off && d.meals.length && !d.past ? '<span class="pdm-bd moon" aria-hidden="true">' + I.moonF + "</span>" : "";
  var warn = g ? '<span class="pdm-bd warn" aria-hidden="true">' + I.bang + "</span>" : ""; /* row 1: the red Hard avoid exclamation (asks first, or the stop) */
  var said = d.past ? "past" : d.meals.length ? (d.meals.length > 1 ? "planned, " + d.meals.length + " plans" : "planned") + (d.off ? (d.off === "usual" ? ", usual day off, cooking this week" : ", off this week only, cooking it") : "") : k === "off" ? "day off, " + kindOff(d) : WORD[k];
  var plans = !d.past && d.meals.length ? ". " + M.plans(dj).map(function (p) { return p.k + ": " + p.v; }).join(". ") : "";
  var lab = d.full + " " + d.num + " " + d.monFull + ", " + said + (g === "stop" ? ", Hard avoid, not for " + P.avoid.who : g === "warn" ? ", Hard avoid, asks first" : "") + plans;
  var cls = "pdm-c st-" + k + (ml ? " ml" : "") + (mt ? " mt" : "") + (g ? " g-" + g : "") + (d.num === 1 ? " first" : "");
  return '<button type="button" role="gridcell" class="' + cls + '" data-n="' + n + '"' + (d.past ? " disabled" : "") + ' tabindex="' + (n === cur ? 0 : -1) + '" aria-label="' + esc(lab) + '">' +
    '<span class="pdm-top"><b class="pdm-n">' + (d.num === 1 || n === P.winStart ? d.num + " " + d.mon : d.num) + "</b>" + warn + "</span>" + (icon ? '<span class="pdm-mark">' + icon + "</span>" : "") + moon + "</button>";
}
function openCount(c) { var k = 0; for (var i = 0; i < 7; i++) if (state(PK.vis(P.winStart + c * 7 + i)) === "open") k++; return k; }
/* o.summary: an "N open" count at the end of each week row (wide option C) */
M.html = function (cur, o) {
  o = o || {};
  /* No week labels at all (owner, voice, 17 Oct 2026: "the dates are self-explanatory"): seven weekday heads, then five rows of dates. The month shows where it changes: the heavy step-rule, and "1 Nov" (or the first cell's "12 Oct") spelled on the cell. */
  var w0 = P.winStart, h = '<div class="pdm' + (o.summary ? " has-sum" : "") + '" role="grid" aria-label="Another day, Monday to Sunday across, ' + PK.info(P.todayN).label + " to " + PK.info(P.lastN).label + '">';
  h += '<div class="pdm-r pdm-hr" role="row">';
  for (var i = 0; i < 7; i++) h += '<span class="pdm-dh" role="columnheader" aria-label="' + P.df[i] + '">' + P.dn[i] + "</span>";
  if (o.summary) h += '<span class="pdm-rs-h" role="columnheader">Open</span>';
  h += "</div>";
  for (var c = 0; c < 5; c++) {
    var a = PK.info(w0 + c * 7);
    h += '<div class="pdm-r" role="row" aria-label="Week of ' + a.num + " " + a.monFull + (c === 4 ? ", the last week you can plan" : "") + '">';
    for (var r = 0; r < 7; r++) h += cell(w0 + c * 7 + r, cur);
    if (o.summary) { var oc = openCount(c); h += '<span class="pdm-rs' + (oc ? "" : " none") + '" role="gridcell" aria-label="' + oc + ' open nights that week">' + (oc ? "<b>" + oc + "</b> open" : "none open") + "</span>"; }
    h += "</div>";
  }
  return h + "</div>";
};
/* the first open night from today (the shortcut under wide option C and on the phone) */
M.nextOpen = function () {
  for (var n = P.todayN; n <= P.lastN; n++) { var d = PK.vis(n); if (state(d) === "open" && PK.guardFor(n) !== "stop") return n; }
  return null;
};
M.openTotal = function () { var k = 0; for (var n = P.todayN; n <= P.lastN; n++) if (state(PK.vis(n)) === "open") k++; return k; };
M.state = state;
/* the shortcut to the open nights: one button for the first open night (wide option C, and the phone). It plans that date at once, like any pick, and names the date on the button. */
M.nextHtml = function () {
  var n = M.nextOpen(), t = M.openTotal();
  if (n == null) return '<p class="pdm-next none">' + I.moon + "<span>No open night in the next five weeks. Pick a planned night to replace or add to it.</span></p>";
  var d = PK.info(n);
  return '<div class="pdm-next"><button type="button" class="pdm-next-b" data-nextopen data-n="' + n + '" aria-label="Plan the next open night, ' + d.full + " " + d.num + " " + d.monFull + '">' + I.plus + "<span>Plan the next open night <b>" + d.label + '</b></span></button><span class="pdm-next-c">' + t + " open in the next five weeks</span></div>";
};
/* the end of the cap: said in words under the last column, never only a colour */
M.capHtml = function () { var l = PK.info(P.lastN); return '<p class="pdm-cap">' + I.end + "<span>The plan ends " + l.dn + " " + l.num + " " + l.mon + ", four weeks ahead</span></p>"; };

/* ---------- the date card: what the side card, the bottom strip and the compact strip say about the date you are on (owner, voice, 17 Oct 2026: for a date that already has something, the tile is the signal, so the lines that restate what is planned are dropped; the chip, the consequence line and the action stay; an open date keeps the full detail) ---------- */
var CHIP = { open: "Open", plan: "Planned", stack: "Planned, several", off: "Day off", past: "Past" };
M.cardHtml = function (n) {
  var d = PK.vis(n), dj = PK.dayObj(n), k = state(d), r = PK.R(), g = d.past ? null : PK.guardFor(n), v = R.view(dj, PK.ctxFor(dj));
  var h = '<div class="pdw-rec"><span class="pdw-e" aria-hidden="true">' + esc(r.emoji || "") + '</span><div><b>' + esc(r.name) + "</b><small>" + r.mins + " min, serves " + r.serves + "</small></div></div>";
  h += '<div class="pdw-date"><b>' + d.full + " " + d.num + " " + d.monFull + '</b><span class="pdw-chip c-' + k + '">' + CHIP[k] + (k === "off" ? ", " + (d.off === "usual" ? "every week" : "this week only") : "") + "</span></div>";
  if (k === "open" && !d.past) h += '<p class="pdw-q">Nothing planned. This night is free.</p>';
  if (d.past) return h + '<p class="pdw-q">Already past.</p>';
  h += '<p class="pdw-cons">' + esc(v.cons) + (v.peek ? " Pick it twice: the first pick shows everyone’s plans." : "") + "</p>";
  if (g === "stop") return h;
  var label = k === "open" ? "Plan " + d.label : /^Replaces/.test(v.cons) ? "Replace what is planned" : k === "off" ? "Plan it, cook this week" : "Plan it here too";
  var short = k === "open" ? "Plan " + d.label : /^Replaces/.test(v.cons) ? "Replace" : k === "off" ? "Plan it" : "Add too"; /* a one-line strip has a short button; the aria-label keeps the full words */
  var strip = !!window.PKCardStrip;
  return h + '<button type="button" class="pdw-go' + (k === "open" ? " is-open" : "") + '" data-sidepick data-n="' + n + '"' + (strip ? ' aria-label="' + esc(label) + '">' + esc(short) : ">" + label) + "</button>";
};

/* the line under the grid: what picking that date would do (the row's own consequence line), live for the hovered or focused date */
M.say = function (n, msg) {
  if (msg) return '<span class="pdm-warn-t">' + esc(msg) + "</span>";
  var d = PK.info(n); if (d.past) return "<b>" + d.label + "</b> Already past.";
  var dj = PK.dayObj(n), v = R.view(dj, PK.ctxFor(dj));
  return "<b>" + d.label + "</b> " + esc(/[.!?]$/.test(v.cons) ? v.cons : v.cons + ".") + (v.peek ? " Pick it twice: the first pick shows everyone’s plans." : "");
};
/* a stacked night, opened in place by its first pick: the household plan and each person's own (the same picture as F's) */
M.fullHtml = function (n) {
  var d = PK.vis(n), dj = PK.vdayObj(n);
  var ps = M.plans(dj);
  return '<div class="pdm-full" role="group" aria-label="' + d.label + ', everyone’s plans">' + (ps.length ? ps.map(function (p) { return "<p><b>" + esc(p.k) + "</b>" + esc(p.v) + "</p>"; }).join("") : '<p class="row-hint">' + esc(d.off === "usual" ? "Usual day off, every week. Planning it cooks this week only." : "Off this week only. Planning it cooks this week.") + "</p>") + '<p class="row-hint">Pick the date again to plan it.</p></div>';
};

/* ---------- the legend, at the foot of the flyout: the same swatches as the cells, each with an icon or a pattern and a word ---------- */
M.legendHtml = function () {
  var items = [["open", I.plus, "Open"], ["plan", mk(1), "Planned"], ["stack", mk(3), "Planned, several"], ["off", I.moon, "Day off"], ["none g-warn", I.bang, "Hard avoid"], ["past", "", "Past"]];
  return '<ul class="pdm-lg" aria-label="Key">' + items.map(function (x) { return '<li><span class="pdm-c pdm-sw st-' + x[0] + '" aria-hidden="true">' + x[1] + "</span>" + x[2] + "</li>"; }).join("") + "</ul>";
};

/* ---------- keys: arrows in two directions, as the grid is drawn. Left and Right are one day, Up and Down are one week (the same weekday). Home is today, End the last day of the plan ---------- */
M.target = function (e, cur) {
  var k = e.key, lo = P.todayN, hi = P.lastN, step = k === "ArrowDown" ? 7 : k === "ArrowUp" ? -7 : k === "ArrowRight" ? 1 : k === "ArrowLeft" ? -1 : 0;
  if (k === "Enter") return { n: cur, enter: true };
  if (k === "Home") return { n: lo };
  if (k === "End") return { n: hi };
  if (!step) return null;
  var t = cur + step, l = PK.info(hi), l0 = PK.info(lo);
  if (t > hi) return { n: cur, msg: cur === hi ? l.label + " is the last day you can plan." : "The plan ends " + l.label + "." };
  if (t < lo) return { n: cur, msg: cur === lo ? l0.label + " is the first day you can plan." : "Earlier days are already past." };
  return { n: t };
};

/* ---------- the read-only popover: hover or keyboard focus on a planned or closed date. It sits to the left of the flyout so the grid stays visible ---------- */
var pop = null;
M.hidePop = function () { if (pop) { pop.remove(); pop = null; } };
M.showPop = function (btn, host) {
  M.hidePop(); var n = +btn.dataset.n, d = PK.vis(n), dj = PK.vdayObj(n); if (d.past || M.noPop) return; /* wide option B shows the same facts in its side card instead */
  var plans = M.plans(dj), k = state(d), g = PK.guardFor(n); if (k === "open" && !g) return;
  var chip = !d.meals.length && k === "open" ? "Open" : d.meals.length ? (d.off ? (d.off === "usual" ? "Usual day off, cooking this week" : "Off this week only, cooking it") : d.meals.length > 1 ? d.meals.length + " plans" : "Planned") : "Day off, " + kindOff(d);
  var gl = g ? '<p class="pdm-pop-g">' + I.bang + "<span>" + esc(g === "stop" ? "Not for " + P.avoid.who + ": a Hard avoid on " + P.avoid.item + "." : P.avoid.who + " has a Hard avoid on " + P.avoid.item + ": asks first.") + "</span></p>" : "";
  var body = plans.length ? plans.map(function (p) { return "<p><b>" + esc(p.k) + "</b>" + esc(p.v) + "</p>"; }).join("") : '<p class="pdm-pop-q">' + (k === "open" ? "Nothing planned. This night is open." : d.off === "usual" ? "Not cooking. Every week, usual day off." : "Not cooking. This week only.") + "</p>";
  pop = document.createElement("div"); pop.className = "pdm-pop"; pop.setAttribute("role", "tooltip"); pop.id = "pdm-pop";
  pop.innerHTML = '<div class="pdm-pop-h"><b>' + d.full + " " + d.num + " " + d.monFull + '</b><span>' + chip + "</span></div>" + body + gl + '<p class="pdm-pop-f">Read only. Pick the date to plan it.</p>';
  document.body.appendChild(pop);
  var r = btn.getBoundingClientRect(), hr = host.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  var left, top;
  if (M.popOver) { /* wide: the flyout is the whole width, so the popover sits on the date itself (below it, or above when the foot is near) and stays inside the flyout */
    left = Math.max(hr.left + 8, Math.min(hr.right - pw - 8, r.left + r.width / 2 - pw / 2)); top = r.bottom + 6; if (top + ph > innerHeight - 8) top = Math.max(8, r.top - ph - 6);
  } else {
    left = hr.left - pw - 10; if (left < 96) left = Math.min(innerWidth - pw - 8, r.right + 8); /* no room on the left: to the right of the cell */
    top = Math.max(8, Math.min(innerHeight - ph - 8, r.top + r.height / 2 - ph / 2));
  }
  pop.style.left = left + "px"; pop.style.top = top + "px"; btn.setAttribute("aria-describedby", "pdm-pop");
};
})();
