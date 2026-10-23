/* Mobile Home G, revisions, round 2: the model (plan) and the markup (html) for three ways to SHOW urgency on one ranked list of chevron sections, plus the drag-to-reveal gesture and the session memory.
   DEFAULT PATH: this file, revisions.css, and G's home.css (not edited). No search.js: the takeover is G's and is not re-drawn here (the magnifier is drawn, inert).
   plan(opt, ctx) is a pure function: option + phone height + data + countdown window in, an urgency-ranked list of sections and which are open out. Sample names are invented and live in DATA only.
   The numbers in K are the model's guesses of each part's height; tools/mobile-home-g-revisions-check.mjs measures the render against them.
   Every number marked "guess" below is a Proposal in docs/knowledge/jobs-to-be-done/mobile-home-g-revisions.md (MR-P). */
(function () {
"use strict";
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var ic = function (d, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; };
var I = {
  lens: ic('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'), clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'), cart: ic('<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>'),
  leaf: ic('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>'), chef: ic('<path d="M7 14a3.5 3.5 0 1 1 1-6.8 4 4 0 0 1 8 0A3.5 3.5 0 1 1 17 14v5H7z"/>'),
  jar: ic('<rect x="6" y="6" width="12" height="14" rx="2.5"/><path d="M8 3h8v3H8z"/>'), note: ic('<path d="M6 4h12v16H6z"/><path d="M9 9h6M9 13h6"/>'), chev: ic('<path d="M6 9l6 6 6-6"/>', "chv"),
  spark: ic('<path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z"/>'), alert: ic('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.4"/>', "alr")
};

/* ---- constants. Every one is a guess (Proposals in the doc). ---- */
var HEIGHTS = { short: 600, medium: 740, tall: 844 }, NAV = 68, BORDER = 2;
function viewport(h) { return HEIGHTS[h] - NAV - BORDER; }
var NOW = 14;          /* the mock's clock: 14:00 (guess). Hours below are "from now". */
var WIN = 6;           /* the countdown window, hours (guess; a visible control on the page) */
var GAP = 30;          /* minutes away before the manual open and close state is forgotten (guess) */
var URG = 50;          /* a section or item at or above this score is urgent */
var OI = 30;           /* More ideas sits between urgent (50 and up) and background (under 30) */
var NEG = 15, NEGMAX = 3;   /* +15 per day an unplanned item has been ignored, counted up to 3 days (guess) */

/* ---- sample data (mine). soon: [name, hours until it goes off (negative = expired), on a plan, days ignored]. low: [name, words, none left, a planned meal needs it]. hero: the soon item the best idea uses. ---- */
var DATA = {
  calm:     { soon: [["Chicken thighs", 30, 0, 0], ["Cucumbers", 56, 0, 0], ["Spinach", 80, 0, 0]], low: [["Limes", "1 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: "Chicken thighs" },
  window:   { soon: [["Chicken thighs", 9, 0, 0], ["Cucumbers", 16, 0, 0], ["Spinach", 50, 0, 0]], low: [["Limes", "1 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: "Chicken thighs" },
  neglect:  { soon: [["Chicken thighs", 30, 0, 3], ["Cucumbers", 56, 0, 0], ["Spinach", 40, 1, 3]], low: [["Limes", "1 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: "Chicken thighs" },
  today:    { soon: [["Chicken thighs", 3, 0, 0], ["Cucumbers", 20, 0, 0], ["Spinach", 44, 0, 0]], low: [["Limes", "1 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: "Chicken thighs" },
  expired:  { soon: [["Milk", -20, 0, 0], ["Chicken thighs", 3, 0, 0], ["Cucumbers", 5, 0, 0], ["Spinach", 20, 0, 0], ["Yoghurt", 40, 0, 0]], low: [["Limes", "1 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: "Chicken thighs" },
  heroexp:  { soon: [["Milk", -20, 0, 0], ["Yoghurt", 30, 0, 0], ["Spinach", 56, 0, 0]], low: [["Limes", "1 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: "Milk" },
  lowride:  { soon: [["Milk", -20, 0, 0], ["Spinach", 40, 0, 0]], low: [["Limes", "None left", 1, 1], ["Eggs", "2 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: "Spinach" },
  onlylow:  { soon: [], low: [["Limes", "None left", 1, 0], ["Eggs", "2 left", 0, 0], ["Peanut butter", "A little", 0, 0]], hero: null },
  empty:    { soon: [], low: [], hero: null }
};
var IDEA = { "Chicken thighs": ["🍋", "Lemon chicken traybake", "chicken", 1], "Milk": ["🍮", "Rice pudding", "milk", 1], "Cucumbers": ["🥗", "Cucumber and spring onion salad", "cucumbers", 0], "Spinach": ["🍛", "Chickpea and spinach curry", "spinach", 1], "Yoghurt": ["🥣", "Yoghurt flatbreads", "yoghurt", 1] };   /* [emoji, idea, noun, singular verb] */
var BASE_HERO = ["🍛", "Chickpea and spinach curry"], FILL = [["🍚", "Egg fried rice", "15 min"], ["🍝", "Tomato pasta", "20 min"], ["🥪", "Cheese toastie", "10 min"]];

/* ---- time words. The date label is honest: from the calendar day, never from the hour window. ---- */
function pad(n) { return (n < 10 ? "0" : "") + n; }
function dayOf(h) { return Math.floor((NOW + h) / 24); }              /* 0 today, 1 tomorrow, -1 yesterday */
function clock(h) { return pad((((NOW + h) % 24) + 24) % 24) + ":00"; }
function dueText(h) {
  var d = dayOf(h);
  if (h < 0) return d < -1 ? "Expired " + (-d) + " days ago" : d < 0 ? "Expired yesterday" : "Went off today " + clock(h);
  return d === 0 ? "Today " + clock(h) : d === 1 ? "Tomorrow " + clock(h) : "in " + d + " days";
}

/* ---- urgency = consequence + neglect (owner decision 2). Written once here; the check restates it independently. ---- */
function neg(x) { return x.plan ? 0 : Math.min(x.ign, NEGMAX) * NEG; }
function scoreSoon(x, n) { return (x.h < 0 ? 60 : x.h <= n ? 50 : x.h <= 48 ? (x.plan ? 10 : 20) : 5) + neg(x); }   /* expired 60; inside the window 50 (a plan does not remove it); inside 48 h 20 (10 if planned); else 5; plus neglect */
function kindSoon(x, n) { return x.h < 0 ? "expired" : x.h <= n ? "window" : scoreSoon(x, n) >= URG ? "ignored" : ""; }
function scoreLow(x) { return x.rides && x.zero ? 90 : x.rides ? 55 : x.zero ? 50 : 5; }                  /* a planned meal needs it and it is gone 90; needed 55; gone 50; plain low 5 (background) */

/* ---- the height of each part, in px (guesses; measured against the render by the check) ---- */
var K = { top: 56, hero: 236, heroWarn: 14, closed: 57, openHead: 50, ur: 44, va: 44, ol: 49, fbPad: 4, banClosed: 53, banOpenHead: 54, card: 8, xl: 45 };   /* xl: the collapse bar that ends an open More ideas (MR-P26) */

function facts(c) {
  var d = DATA[c.data], n = c.n == null ? WIN : c.n;
  var soon = d.soon.map(function (r) { var x = { n: r[0], h: r[1], plan: r[2], ign: r[3] }; x.s = scoreSoon(x, n); x.k = kindSoon(x, n); return x; }).sort(function (a, b) { return b.s - a.s || a.h - b.h; });
  var low = d.low.map(function (r) { var x = { n: r[0], lv: r[1], zero: r[2], rides: r[3] }; x.s = scoreLow(x); return x; }).sort(function (a, b) { return b.s - a.s; });
  var hi = d.hero ? soon.filter(function (x) { return x.n === d.hero; })[0] : null, hero;
  if (hi) {
    var w = hi.h < 0 ? "expired" : dayOf(hi.h) === 0 ? "today" : "", nm = IDEA[hi.n], d0 = dayOf(hi.h);
    var why = w === "expired" ? "Check this is still OK: uses " + nm[2] + " that " + (d0 < 0 ? "went off " + (d0 < -1 ? (-d0) + " days ago" : "yesterday") : "went off today")
      : w === "today" ? "Uses " + nm[2] + " that " + (nm[3] ? "goes" : "go") + " off today at " + clock(hi.h)
      : "Uses " + nm[2] + " that " + (nm[3] ? "goes" : "go") + " off " + (d0 === 1 ? "tomorrow" : "in " + d0 + " days");
    hero = { e: nm[0], t: nm[1], why: why, warn: w, item: hi.n };
  } else hero = { e: BASE_HERO[0], t: BASE_HERO[1], why: "Everything is in &middot; 30 min", warn: "", item: null };
  var f = { n: n, soon: soon, low: low, hero: hero, capSoon: c.h === "short" ? 1 : 2, nOI: c.h === "short" ? 2 : 3 };
  /* More ideas: expiring stock gets its own idea (decision 4), worst first; then filler. A planned item already has its meal. */
  var ideas = soon.filter(function (x) { return !x.plan && x.h <= 48 && x.n !== hero.item; }).sort(function (a, b) { return a.h - b.h; }).map(function (x) {
    var w = x.h < 0 ? "expired" : dayOf(x.h) === 0 ? "today" : "", id = IDEA[x.n]; return { e: id[0], t: id[1], m: w === "expired" ? "Check first" : w === "today" ? "Off today" : "Uses " + id[2], warn: w };
  }).concat(FILL.map(function (r) { return { e: r[0], t: r[1], m: r[2], warn: "" }; }));
  f.ideas = ideas.slice(0, f.nOI);
  f.score = { soon: soon.length ? soon[0].s : -1, low: low.length ? low[0].s : -1, oi: OI };
  f.rank = ["soon", "low", "oi"].filter(function (k) { return k === "oi" ? f.ideas.length > 0 : f.score[k] >= 0; }).sort(function (a, b) { return f.score[b] - f.score[a]; });
  f.urgent = function (k) { return k !== "oi" && f.score[k] >= URG; };
  return f;
}
function shown(f, k) { return k === "soon" ? Math.min(f.soon.length, f.capSoon) : k === "low" ? f.low.length : f.ideas.length; }
function heroH(f) { return K.hero + (f.hero.warn ? K.heroWarn : 0); }
function cost(f, k, form, open) {
  if (form === "ban") return open ? K.banOpenHead + K.fbPad + shown(f, k) * K.ur + K.va : K.banClosed;
  if (k === "oi") return open ? shown(f, k) * K.ol + K.fbPad + K.xl : K.closed + K.card;   /* open: no header, no card gap; the rows continue the hero (MR-P26) */
  return open ? K.card + K.openHead + K.fbPad + shown(f, k) * K.ur + K.va : K.closed + K.card;
}

/* plan(opt, c): c = { h: short|medium|tall, data, n (hours), drag }. Returns { order, form, open, f, V }.
   Same order and same opening rule in every option (decisions 1, 2, 5); the options differ only in how an urgent section is SHOWN:
   A tinted card with a word badge, B a one-line strip fused to the hero, C a plain chevron with only the word badge.
   form: fold (a chevron section), card (a tinted chevron section), ban (a strip fused to the hero) */
function plan(opt, c) {
  var f = facts(c), V = viewport(c.h);
  var P = { opt: opt, f: f, V: V, c: c, order: ["hero"].concat(f.rank), form: { hero: "hero" }, open: {} };
  f.rank.forEach(function (k, i) { P.form[k] = opt === "b" ? (i === 0 && f.urgent(k) ? "ban" : "fold") : opt === "a" && f.urgent(k) ? "card" : "fold"; });
  var base = K.top + heroH(f) + f.rank.reduce(function (a, k) { return a + cost(f, k, P.form[k], false); }, 0), stop = false;
  f.rank.forEach(function (k) {
    var form = P.form[k], extra = cost(f, k, form, true) - cost(f, k, form, false), op = false;
    if (opt !== "b" && f.urgent(k)) op = true;                            /* the urgent one always opens (A, C) */
    else if (!stop && base + extra <= V) op = true;                       /* the rest open in rank order while the height lasts */
    else stop = true;
    if (op) base += extra; P.open[k] = op;
  });
  return P;
}

/* ---- markup ---- */
var T = { soon: ["On the way out", "clock", ""], low: ["Running low", "cart", "t3"], oi: ["More ideas", "spark", ""] };
function badge(f, k) {
  if (k === "soon") {
    var e = f.soon.filter(function (x) { return x.k === "expired"; }).length, w = f.soon.filter(function (x) { return x.k === "window"; }).length, g = f.soon.filter(function (x) { return x.k === "ignored"; }).length;
    return [e ? e + " expired" : "", w ? w + " in " + f.n + "h" : "", g ? g + " ignored" : ""].filter(Boolean).join(" &middot; ");
  }
  if (k === "low") { var z = f.low.filter(function (x) { return x.zero; }).length, r = f.low.filter(function (x) { return x.rides; }).length; return z ? z + " out" + (r ? " &middot; needed" : "") : r ? r + " needed" : ""; }
  return "";
}
function preview(f, k) {
  if (k === "oi") return f.ideas[0].t + (f.ideas.length > 1 ? " +" + (f.ideas.length - 1) : "");
  var items = k === "soon" ? f.soon : f.low;
  return items.slice(0, 2).map(function (x) { return x.n; }).join(", ") + (items.length > 2 ? " +" + (items.length - 2) : "");
}
function warnMark(w, text) { return w ? I.alert + esc(text) : esc(text); }
function olRows(f) {
  return f.ideas.map(function (r) { return '<div class="ol"' + (r.warn ? ' data-warn="' + r.warn + '"' : "") + '><button type="button" class="go" data-stub><span class="e" aria-hidden="true">' + r.e + "</span><b>" + esc(r.t) + '</b><span class="m' + (r.warn ? " w" : "") + '">' + warnMark(r.warn, r.m) + "</span></button></div>"; }).join("");
}
function rowsOf(f, k) {
  var items = k === "soon" ? f.soon.slice(0, f.capSoon) : f.low;
  return '<ul class="lst">' + items.map(function (x) {
    var urgent = x.s >= URG, txt = k === "soon" ? dueText(x.h) + (x.plan ? " &middot; planned" : x.ign ? " &middot; ignored " + x.ign + "d" : "") : x.lv + (x.rides ? " &middot; needed" : "");
    return '<li class="ur" data-name="' + esc(x.n) + '"' + (k === "soon" ? ' data-h="' + x.h + '" data-kind="' + x.k + '"' : "") + '><span class="nm">' + esc(x.n) + '</span><span class="tg' + (urgent ? (k === "soon" ? " u" : " z") : "") + '">' + txt + "</span></li>";
  }).join("") + "</ul>";
}
function bodyOf(f, k) {
  if (k === "oi") return '<div class="fbi">' + olRows(f) + "</div>";
  var more = k === "soon" && f.soon.length > f.capSoon ? "+" + (f.soon.length - f.capSoon) + " more &middot; View all" : "View all";
  return '<div class="fbi">' + rowsOf(f, k) + '<a class="va" href="#" data-stub>' + more + "</a></div>";
}
function heroHtml(f, fused, ext) {
  var L = f.hero, warn = L.warn;
  return '<section class="ideas hero' + (fused ? " has-ban" : "") + (ext ? " has-ext" : "") + '" data-sec="hero"' + (warn ? ' data-warn="' + warn + '"' : "") + ' aria-label="Cooking ideas"><div class="th2"><span class="ric t2" aria-hidden="true" style="--c:var(--sage)">' + I.chef + '</span><h2>Cooking ideas</h2></div>' +
    '<div class="idl"><button type="button" class="top2" data-stub><span class="ph" aria-hidden="true">' + L.e + '</span><span class="t"><span class="k">Today &middot; <span class="w">Idea for tonight</span></span><b>' + esc(L.t) + '</b><span class="why' + (warn ? " alarm" : "") + '">' + (warn ? I.alert : I.leaf) + L.why + '</span></span></button><div class="acts"><button type="button" class="btn" data-stub>Make it</button><button type="button" class="btn ghost" data-stub>Plan</button></div></div></section>';
}
function foldHtml(id, P, k, open) {
  var f = P.f, form = P.form[k], t = T[k], b = k === "oi" ? "" : badge(f, k), n = k === "soon" ? f.soon.length : k === "low" ? f.low.length : f.ideas.length, fid = id + "-" + k, urg = f.urgent(k);
  var data = ' data-sec="' + k + '" data-form="' + form + '" data-open="' + open + '" data-score="' + f.score[k] + '" data-urgent="' + urg + '"';
  if (k === "oi") {   /* MR-P26: closed it is a chevron header; open it has no label and its rows continue the hero. The same button is the collapse bar (flex order puts it last). */
    var fused = P.f.rank.length && P.form[P.f.rank[0]] === "ban";
    return '<section class="tilec fold' + (open ? " ext" + (fused ? " has-ban" : "") : "") + '"' + data + '><h2 class="th2"><button type="button" class="tog" aria-expanded="' + open + '" aria-controls="' + fid + '"><span class="ric ' + t[2] + '" aria-hidden="true">' + I[t[1]] + '</span><span class="tt"><b>' + t[0] + "</b><small>" + esc(preview(f, k)) + "</small></span>" +
      '<span class="n">' + n + '<span class="sr"> items</span></span><span class="hl">Hide more ideas</span>' + I.chev + '</button></h2><div class="fb" id="' + fid + '"' + (open ? "" : " hidden") + ">" + (open ? bodyOf(f, k) : "") + "</div></section>";
  }
  if (form === "ban") {
    var arr = k === "soon" ? f.soon.filter(function (x) { return x.s >= URG; }) : f.low.filter(function (x) { return x.s >= URG; });
    var names = arr.slice(0, 2).map(function (x) { return x.n; }).join(", ") + (arr.length > 2 ? " +" + (arr.length - 2) : "");
    var lead = k === "soon" ? (arr.some(function (x) { return x.k === "expired"; }) ? "Use now" : arr.some(function (x) { return x.k === "window"; }) ? "Going off in " + f.n + "h" : "Still here") : (arr.some(function (x) { return x.zero && x.rides; }) ? "Out and needed" : arr.some(function (x) { return x.zero; }) ? "Out of stock" : "Needed");
    return '<section class="tilec fold ban ' + k + '"' + data + '><h2 class="th2"><button type="button" class="tog" aria-expanded="' + open + '" aria-controls="' + fid + '" aria-label="' + t[0] + ', ' + n + ' items"><span class="ric ' + t[2] + '" aria-hidden="true">' + I[t[1]] + '</span><span class="bt"><b>' + lead + ":</b> " + esc(names) + "</span>" + I.chev + '</button></h2><div class="fb" id="' + fid + '"' + (open ? "" : " hidden") + ">" + (open ? bodyOf(f, k) : "") + "</div></section>";
  }
  return '<section class="tilec fold' + (form === "card" ? " urgent " + k : "") + '"' + data + '><h2 class="th2"><button type="button" class="tog" aria-expanded="' + open + '" aria-controls="' + fid + '"><span class="ric ' + t[2] + '" aria-hidden="true">' + I[t[1]] + '</span><span class="tt"><b>' + t[0] + "</b><small>" + esc(preview(f, k)) + "</small></span>" +
    (b ? '<span class="bdg ' + (k === "soon" ? "u" : "z") + '">' + b + "</span>" : "") + '<span class="n">' + n + '<span class="sr"> items</span></span>' + I.chev + '</button></h2><div class="fb" id="' + fid + '"' + (open ? "" : " hidden") + ">" + (open ? bodyOf(f, k) : "") + "</div></section>";
}
var GREET = "Good afternoon, Sam.";
/* manual: { sec: bool } the person's own opens and closes kept for the sitting; they win over the computed default */
function homeHtml(id, P, manual) {
  manual = manual || {};
  var eff = {}; P.f.rank.forEach(function (k) { eff[k] = manual[k] != null ? !!manual[k] : P.open[k]; });
  var seq = ["hero"].concat(eff.oi ? ["oi"] : [], P.f.rank.filter(function (k) { return !(k === "oi" && eff.oi); }));   /* an open More ideas sits directly under the hero (MR-P26); data-order stays the rank */
  var parts = seq.map(function (k) { return k === "hero" ? heroHtml(P.f, P.form[P.f.rank[0]] === "ban" && !eff.oi, !!eff.oi) : foldHtml(id, P, k, eff[k]); }).join("");
  return '<div class="home mr" id="' + id + '" data-opt="' + P.opt + '" data-order="' + P.order.join(",") + '" data-drag="' + (P.c.drag === false ? "off" : "on") + '"><header class="hbar"><h1 class="hi">' + GREET + '</h1><button type="button" class="sbtn" aria-label="Search" data-stub>' + I.lens + '</button></header><div class="mr-rest">' + parts + '</div><p class="hv-live" role="status" aria-live="polite"></p></div>';
}

/* ---- open and close one section in place. Height animates (not in reduced motion); the pressed header does not move under the thumb (scroll anchoring kept by hand). ---- */
var LOG = [];
function reduced() { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
/* MR-P26: More ideas is the only section that moves. Open: no label, directly under the hero, the same button is now the collapse bar. Closed: back in its ranked slot as the chevron header. */
function relocate(sec, on, P) {
  var rest = sec.parentNode, hero = rest.querySelector('[data-sec="hero"]'), ban = rest.querySelector(".ban"), act = document.activeElement, had = act && sec.contains(act);
  if (on) rest.insertBefore(sec, hero.nextSibling);
  else {
    var after = null, r = P.f.rank, i = r.indexOf("oi");
    for (var j = i + 1; j < r.length && !after; j++) after = rest.querySelector('[data-sec="' + r[j] + '"]');
    rest.insertBefore(sec, after);
  }
  sec.classList.toggle("ext", on); sec.classList.toggle("has-ban", on && !!ban);
  hero.classList.toggle("has-ext", on); hero.classList.toggle("has-ban", !on && !!ban);
  if (had && document.activeElement !== act) { try { act.focus({ preventScroll: true }); } catch (e) { act.focus(); } }
}
function reveal(el, sc) {   /* bring a moved section wholly into view, nearest edge, only when it is cut */
  if (!sc) return;
  var r = el.getBoundingClientRect(), b = sc.getBoundingClientRect();
  if (r.top < b.top) sc.scrollTop += r.top - b.top - 8; else if (r.bottom > b.bottom) sc.scrollTop += Math.min(r.bottom - b.bottom + 8, r.top - b.top - 8);
}
function setOpen(sec, on, P, o) {
  o = o || {};
  var btn = sec.querySelector(".tog"), body = sec.querySelector(".fb"), k = sec.dataset.sec, was = sec.dataset.open === "true";
  if (on === was) return false;
  if (on && !body.firstChild) body.innerHTML = bodyOf(P.f, k);
  var sc = sec.closest(".pbody"), t0 = btn.getBoundingClientRect().top, via = o.via || "tap", prev = sec.previousElementSibling, pb = prev ? prev.getBoundingClientRect().bottom : 0, moved = false;
  sec.dataset.open = on ? "true" : "false"; btn.setAttribute("aria-expanded", on ? "true" : "false");
  if (k === "oi") { relocate(sec, on, P); moved = sec.previousElementSibling !== prev; }
  LOG.push({ sec: k, on: on, via: via, t: Date.now() });
  var live = sec.closest(".home").querySelector(".hv-live"); if (live) live.textContent = (k === "oi" ? "More ideas" : T[k][0]) + (on ? " opened" : " closed");
  sec.dispatchEvent(new CustomEvent("mr-change", { bubbles: true, detail: { sec: k, on: on, via: via } }));
  /* a pressed header stays under the thumb; More ideas' button moves, so a drag keeps the section above its old slot still instead, and a tap brings the result into view */
  var fix = function () {
    if (k === "oi") { if (moved && via === "drag" && prev && sc) { var d = prev.getBoundingClientRect().bottom - pb; if (Math.abs(d) > 0.5) sc.scrollTop += d; } return; }
    var d = btn.getBoundingClientRect().top - t0; if (sc && Math.abs(d) > 0.5) sc.scrollTop += d;
  };
  var settled = function () { if (k === "oi" && via !== "drag") reveal(sec, sc); sec.dispatchEvent(new CustomEvent("mr-settled", { bubbles: true, detail: { sec: k } })); };
  if (reduced() || o.animate === false) { body.hidden = !on; fix(); settled(); return true; }
  body.hidden = false; body.style.overflow = "hidden";
  var full = body.scrollHeight;
  body.style.height = on ? "0px" : full + "px"; void body.offsetHeight;
  body.style.transition = "height .22s ease"; body.style.height = on ? full + "px" : "0px";
  var frames = 0, tick = function () { fix(); if (++frames < 18) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  var fin = false, end = function () { if (fin) return; fin = true; body.style.cssText = ""; body.hidden = !on; fix(); settled(); };
  body.addEventListener("transitionend", function te(e) { if (e.target === body) { body.removeEventListener("transitionend", te); end(); } });
  setTimeout(end, 300);
  return true;
}
function toggle(btn, P, o) { var sec = btn.closest(".fold"); return setOpen(sec, sec.dataset.open !== "true", P, o); }

/* ---- drag to reveal (decision 7). Pointer events: mouse, touch and pen are one code path.
   Press a chevron header and drag UP: that section opens; keep the same drag moving up over the next closed header(s) above and each opens too, one after the other, bottom to top.
   The opened body grows BELOW the header under the finger, so nothing moves under the thumb. A drag only opens; closing is a tap. Plain scrolling anywhere else is untouched:
   only a header gets touch-action:none (css), and only while the gesture is switched on. A tap on a header, Enter or Space, still toggles it (the button's own click). ---- */
function bindDrag(sc, o) {
  var st = null, sup = false, ARM = 8;
  var heads = function () { return [].slice.call(sc.querySelectorAll(".fold .tog")).filter(function (t) { return t.offsetParent; }); };
  var open = function (tog) { var sec = tog.closest(".fold"); if (sec.dataset.open !== "true") setOpen(sec, true, o.plan(sec), { via: "drag" }); };
  sc.addEventListener("pointerdown", function (e) {
    if (!o.enabled() || (e.pointerType === "mouse" && e.button !== 0)) return;
    var tog = e.target.closest(".fold .tog"); if (!tog) return;
    st = { id: e.pointerId, x: e.clientX, y: e.clientY, tog: tog, armed: false };
    try { tog.setPointerCapture(e.pointerId); } catch (x) { }
  });
  sc.addEventListener("pointermove", function (e) {
    if (!st || e.pointerId !== st.id) return;
    var up = st.y - e.clientY;
    if (!st.armed) { if (up >= ARM && up > Math.abs(e.clientX - st.x)) { st.armed = true; open(st.tog); } else return; }
    heads().forEach(function (t) { if (t === st.tog) return; var r = t.getBoundingClientRect(), c = (r.top + r.bottom) / 2; if (c >= e.clientY && c <= st.y) open(t); });
  });
  var end = function (e) {
    if (!st || e.pointerId !== st.id) return;
    if (st.armed) { sup = true; setTimeout(function () { sup = false; }, 80); }
    try { st.tog.releasePointerCapture(e.pointerId); } catch (x) { }
    st = null;
  };
  sc.addEventListener("pointerup", end); sc.addEventListener("pointercancel", end);
  sc.addEventListener("click", function (e) { if (sup) { e.stopPropagation(); e.preventDefault(); sup = false; } }, true);
}

/* ---- session memory (decision 6): a manual open or close is remembered while the person hops between Home, Pantry and Recipes in one sitting, and forgotten after a real gap away.
   The clock is passed in (minutes), so the build can use Date.now() and the mock can simulate. ---- */
function session(gap) {
  var S = { manual: {}, left: null, gap: gap == null ? GAP : gap };
  return {
    setGap: function (v) { S.gap = v; }, gap: function () { return S.gap; },
    set: function (frame, k, on) { (S.manual[frame] = S.manual[frame] || {})[k] = on; },
    get: function (frame) { return S.manual[frame] || {}; },
    count: function () { return Object.keys(S.manual).reduce(function (a, f) { return a + Object.keys(S.manual[f]).length; }, 0); },
    leave: function (t) { S.left = t; },
    enter: function (t) { var reset = S.left != null && t - S.left >= S.gap; if (reset) S.manual = {}; S.left = null; return reset; },   /* true = the gap was long, state forgotten */
    reset: function () { S.manual = {}; S.left = null; }
  };
}

window.MR = { plan: plan, html: homeHtml, toggle: toggle, setOpen: setOpen, bindDrag: bindDrag, session: session, viewport: viewport, HEIGHTS: HEIGHTS, NAV: NAV, K: K, DATA: DATA, I: I, dueText: dueText, LOG: LOG, C: { NOW: NOW, WIN: WIN, GAP: GAP, URG: URG, OI: OI, NEG: NEG, NEGMAX: NEGMAX } };
})();
