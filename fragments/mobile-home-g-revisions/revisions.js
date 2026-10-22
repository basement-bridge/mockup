/* Mobile Home G, revisions: the model (plan) and the markup (html) for four ways to hand urgency to the privileged second slot.
   DEFAULT PATH: this file, revisions.css, and G's home.css (not edited). No search.js: the takeover is G's and is not re-drawn here (the magnifier is drawn, inert).
   plan(opt, ctx) is a pure function: option + phone height + data in, an ordered list of sections and which are open out. Sample names are invented and live in DATA only.
   The numbers in K are the model's guesses of each part's height; tools/mobile-home-g-revisions-check.mjs measures the render against them. */
(function () {
"use strict";
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var ic = function (d, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; };
var I = {
  lens: ic('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'), clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'), cart: ic('<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>'),
  leaf: ic('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>'), chef: ic('<path d="M7 14a3.5 3.5 0 1 1 1-6.8 4 4 0 0 1 8 0A3.5 3.5 0 1 1 17 14v5H7z"/>'),
  jar: ic('<rect x="6" y="6" width="12" height="14" rx="2.5"/><path d="M8 3h8v3H8z"/>'), note: ic('<path d="M6 4h12v16H6z"/><path d="M9 9h6M9 13h6"/>'), chev: ic('<path d="M6 9l6 6 6-6"/>', "chv"),
  spark: ic('<path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z"/>')
};

/* ---- phone heights (Proposal MR-P4): a small phone or a phone with the browser bars showing, the same phone with fewer bars, and the owner's 390 x 844. The viewport for Home is the frame minus the 68px bottom bar and the frame's 2px of border. ---- */
var HEIGHTS = { short: 600, medium: 740, tall: 844 }, NAV = 68, BORDER = 2;
function viewport(h) { return HEIGHTS[h] - NAV - BORDER; }

/* ---- sample data (mine). due: days from today, -1 = expired yesterday. low: 0 = none left, 1 = running low. Names follow fragments/mobile-home-g ---- */
var DATA = {
  calm:    { soon: [["Chicken thighs", 1], ["Cucumbers", 2], ["Spinach", 3]], low: [["Limes", "1 left", 1], ["Peanut butter", "A little", 1]], hero: "tomorrow" },
  today:   { soon: [["Chicken thighs", 0], ["Cucumbers", 1], ["Spinach", 2]], low: [["Limes", "1 left", 1], ["Peanut butter", "A little", 1]], hero: "today" },
  expired: { soon: [["Milk", -1], ["Chicken thighs", 0], ["Cucumbers", 0], ["Spinach", 1], ["Yoghurt", 2]], low: [["Limes", "1 left", 1], ["Peanut butter", "A little", 1]], hero: "today" },
  empty:   { soon: [], low: [], hero: "none" },
  low:     { soon: [], low: [["Limes", "None left", 0], ["Eggs", "2 left", 1], ["Peanut butter", "A little", 1]], hero: "none" }
};
var HERO = {
  tomorrow: { e: "🍋", t: "Lemon chicken traybake", why: "Uses the chicken thighs going off tomorrow" },
  today: { e: "🍋", t: "Lemon chicken traybake", why: "Uses the chicken thighs that go off today" },
  none: { e: "🍛", t: "Chickpea and spinach curry", why: "Everything is in &middot; 30 min" }
};
var OTHER = [["🥗", "Cucumber and spring onion salad", "10 min"], ["🍛", "Chickpea and spinach curry", "30 min"], ["🍚", "Egg fried rice", "15 min"]];
function dueText(d) { return d < -1 ? "Expired " + (-d) + " days ago" : d === -1 ? "Expired yesterday" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : "in " + d + " days"; }

/* ---- the model's guess of each part's height, in px (Proposal MR-P4; measured against the render by the check) ---- */
var K = { top: 56, hero: 236, oiHead: 32, ol: 49, oiPad: 4, closed: 57, openHead: 58, ur: 44, va: 44, fbPad: 4, banClosed: 53, banOpenHead: 54, card: 8 };

/* ---- the facts every option shares ---- */
function facts(c) {
  var d = DATA[c.data], soon = d.soon.slice().sort(function (a, b) { return a[1] - b[1]; });
  var urgent = soon.filter(function (x) { return x[1] <= 0; }), zero = d.low.filter(function (x) { return x[2] === 0; });
  var slot2 = urgent.length ? "soon" : (c.lr && zero.length ? "low" : null);   /* MR-Q1: Running low earns the slot only when nothing is urgent and something is at zero */
  return { soon: soon, low: d.low, urgent: urgent, zero: zero, slot2: slot2, capSoon: c.h === "short" ? 1 : 2, nOI: c.h === "short" ? 2 : 3, hero: HERO[d.hero] };
}
function has(f, k) { return k === "soon" ? f.soon.length > 0 : k === "low" ? f.low.length > 0 : true; }
function shown(f, k) { return k === "soon" ? Math.min(f.soon.length, f.capSoon) : f.low.length; }
function costClosed(k) { return K.closed + K.card; }
function costOpen(f, k) { var n = k === "oi" ? f.nOI : shown(f, k); return K.card + K.openHead + K.fbPad + (k === "oi" ? n * K.ol : n * K.ur + K.va); }
function costRows(f) { return K.card + K.oiHead + f.nOI * K.ol + K.oiPad; }
function costBan(f, k, open) { return open ? K.banOpenHead + K.fbPad + shown(f, k) * K.ur + K.va : K.banClosed; }

/* plan(opt, c): c = { h: short|medium|tall, data, lr }. Returns { order, form, open, f, slot2 }.
   form: rows (a plain card of line items), fold (a chevron section), card (a promoted, tinted chevron section), ban (a strip fused to the hero) */
function plan(opt, c) {
  var f = facts(c), V = viewport(c.h), s2 = f.slot2, rest = ["soon", "low"].filter(function (k) { return has(f, k) && k !== s2; });
  var P = { opt: opt, f: f, V: V, slot2: s2, order: ["hero"], form: { hero: "hero" }, open: {} };
  var add = function (k, form, open) { P.order.push(k); P.form[k] = form; P.open[k] = !!open; };
  if (opt === "a") {                                   /* A: the urgent section is promoted into slot 2 as an expanded, tinted card. Other ideas follow as rows, wherever they land. */
    if (s2) add(s2, "card", true);
    add("oi", "rows"); rest.forEach(function (k) { add(k, "fold", false); });
  } else if (opt === "b") {                            /* B: a strip fused to the hero. Opens in place only if two other ideas still fit above the fold. */
    var used = K.top + K.hero;
    if (s2) { var o = used + costBan(f, s2, true) + costRows(f) <= V; add(s2, "ban", o); }
    add("oi", "rows"); rest.forEach(function (k) { add(k, "fold", false); });
  } else if (opt === "c") {                            /* C: every part is a chevron section; they open in priority order until the height is spent. The urgent one always opens. */
    var pri = (s2 ? [s2] : []).concat(["oi"], rest), seq = (s2 ? [s2] : []).concat(["oi"], rest);
    var base = K.top + K.hero + seq.reduce(function (a, k) { return a + costClosed(k); }, 0), stop = false;
    seq.forEach(function (k) {
      var extra = costOpen(f, k) - costClosed(k), op = false;
      if (!stop) { if (k === s2) op = true; else if (base + extra <= V) op = true; else stop = true; }
      if (op) base += extra; add(k, "fold", op);
    });
  } else {                                             /* D: nothing moves. Chevrons carry a badge; only the top urgent one opens, and only if it fits whole. */
    add("oi", "rows"); rest.concat(s2 ? [s2] : []).sort(function (a, b) { return (a === "soon" ? 0 : 1) - (b === "soon" ? 0 : 1); }).forEach(function (k) { add(k, "fold", false); });
    if (s2) { var used2 = K.top + K.hero + costRows(f) + ["soon", "low"].filter(function (k) { return has(f, k); }).reduce(function (a, k) { return a + (k === s2 ? costOpen(f, k) : costClosed(k)); }, 0); P.open[s2] = used2 <= V; }
  }
  return P;
}

/* ---- markup ---- */
var T = { soon: ["On the way out", "clock", ""], low: ["Running low", "cart", "t3"], oi: ["Other ideas", "spark", ""] };
function badge(f, k) {
  if (k === "soon" && f.urgent.length) { var e = f.urgent.filter(function (x) { return x[1] < 0; }).length, t = f.urgent.length - e; return [e ? e + " expired" : "", t ? t + " today" : ""].filter(Boolean).join(" &middot; "); }
  if (k === "low" && f.zero.length) return f.zero.length + " out";
  return "";
}
function preview(f, k) {
  if (k === "oi") return OTHER[0][1] + (f.nOI > 1 ? " +" + (f.nOI - 1) : "");
  var items = k === "soon" ? f.soon : f.low;
  return items.slice(0, 2).map(function (x) { return x[0]; }).join(", ") + (items.length > 2 ? " +" + (items.length - 2) : "");
}
function rowsOf(f, k) {
  var items = k === "soon" ? f.soon.slice(0, f.capSoon) : f.low;
  return '<ul class="lst">' + items.map(function (x) {
    var urgent = k === "soon" ? x[1] <= 0 : x[2] === 0, txt = k === "soon" ? dueText(x[1]) : x[1];
    return '<li class="ur"><span class="nm">' + esc(x[0]) + '</span><span class="tg' + (urgent ? (k === "soon" ? " u" : " z") : "") + '">' + esc(txt) + "</span></li>";
  }).join("") + "</ul>";
}
function bodyOf(f, k) {
  if (k === "oi") return olRows(f);
  var more = k === "soon" && f.soon.length > f.capSoon ? "+" + (f.soon.length - f.capSoon) + " more &middot; View all" : "View all";
  return rowsOf(f, k) + '<a class="va" href="#" data-stub>' + more + "</a>";
}
function olRows(f) { return OTHER.slice(0, f.nOI).map(function (r) { return '<div class="ol"><button type="button" class="go" data-stub><span class="e" aria-hidden="true">' + r[0] + '</span><b>' + esc(r[1]) + '</b><span class="m">' + r[2] + "</span></button></div>"; }).join(""); }

function heroHtml(f, fused) {
  var L = f.hero;
  return '<section class="ideas hero' + (fused ? " has-ban" : "") + '" data-sec="hero" aria-label="Cooking ideas"><div class="th2"><span class="ric t2" aria-hidden="true" style="--c:var(--sage)">' + I.chef + '</span><h2>Cooking ideas</h2></div>' +
    '<div class="idl"><button type="button" class="top2" data-stub><span class="ph" aria-hidden="true">' + L.e + '</span><span class="t"><span class="k">Today &middot; <span class="w">Idea for tonight</span></span><b>' + esc(L.t) + '</b><span class="why">' + I.leaf + L.why + '</span></span></button><div class="acts"><button type="button" class="btn" data-stub>Make it</button><button type="button" class="btn ghost" data-stub>Plan</button></div></div></section>';
}
function foldHtml(id, f, k, form, open) {
  var t = T[k], b = k === "oi" ? "" : badge(f, k), n = k === "oi" ? f.nOI : (k === "soon" ? f.soon.length : f.low.length), cls = k === "soon" ? "u" : "z";
  var fid = id + "-" + k;
  if (form === "ban") {
    var urg = k === "soon", names = (urg ? f.urgent : f.zero).slice(0, 2).map(function (x) { return x[0]; }).join(", ") + ((urg ? f.urgent : f.zero).length > 2 ? " +" + ((urg ? f.urgent : f.zero).length - 2) : "");
    var lead = urg ? (f.urgent.some(function (x) { return x[1] < 0; }) ? "Use now" : "Going off today") : "Out of stock";
    return '<section class="tilec fold ban ' + k + '" data-sec="' + k + '" data-form="ban" data-open="' + open + '"><h2 class="th2"><button type="button" class="tog" aria-expanded="' + open + '" aria-controls="' + fid + '" aria-label="' + t[0] + ', ' + n + ' items"><span class="ric ' + t[2] + '" aria-hidden="true">' + I[t[1]] + '</span><span class="bt"><b>' + lead + ":</b> " + esc(names) + "</span>" + I.chev + '</button></h2><div class="fb" id="' + fid + '"' + (open ? "" : " hidden") + ">" + (open ? bodyOf(f, k) : "") + "</div></section>";
  }
  return '<section class="tilec fold' + (form === "card" ? " urgent " + k : "") + '" data-sec="' + k + '" data-form="' + form + '" data-open="' + open + '"><h2 class="th2"><button type="button" class="tog" aria-expanded="' + open + '" aria-controls="' + fid + '"><span class="ric ' + t[2] + '" aria-hidden="true">' + I[t[1]] + '</span><span class="tt"><b>' + t[0] + "</b><small>" + esc(preview(f, k)) + "</small></span>" +
    (b ? '<span class="bdg ' + cls + '">' + b + "</span>" : "") + '<span class="n">' + n + '<span class="sr"> items</span></span>' + I.chev + '</button></h2><div class="fb" id="' + fid + '"' + (open ? "" : " hidden") + ">" + (open ? bodyOf(f, k) : "") + "</div></section>";
}
function rowsCard(f) { return '<section class="tilec oi" data-sec="oi" data-form="rows"><p class="sub">Other ideas</p>' + olRows(f) + "</section>"; }
var GREET = "Good afternoon, Sam.";
function homeHtml(id, P) {
  var parts = P.order.map(function (k) {
    if (k === "hero") return heroHtml(P.f, P.form[P.slot2] === "ban");
    if (P.form[k] === "rows") return rowsCard(P.f);
    return foldHtml(id, P.f, k, P.form[k], P.open[k]);
  }).join("");
  return '<div class="home mr" id="' + id + '" data-opt="' + P.opt + '" data-order="' + P.order.join(",") + '"><header class="hbar"><h1 class="hi">' + GREET + '</h1><button type="button" class="sbtn" aria-label="Search" data-stub>' + I.lens + '</button></header><div class="mr-rest">' + parts + "</div></div>";
}
/* toggle one section in place; the body is written on its first open */
function toggle(btn, P) {
  var sec = btn.closest(".fold"), k = sec.dataset.sec, on = sec.dataset.open !== "true", body = sec.querySelector(".fb");
  if (on && !body.firstChild) body.innerHTML = bodyOf(P.f, k);
  sec.dataset.open = on ? "true" : "false"; btn.setAttribute("aria-expanded", on ? "true" : "false"); body.hidden = !on;
}
window.MR = { plan: plan, html: homeHtml, toggle: toggle, viewport: viewport, HEIGHTS: HEIGHTS, NAV: NAV, K: K, DATA: DATA, I: I, dueText: dueText };
})();
