/* Mobile Home, option G: cooking ideas first, search a small control in the greeting row. DEFAULT PATH: the Home markup, the order rule, the folds, and the lazy load of search.css + search.js.
   Nothing about the takeover, the dropdown or the surfaced card is here: search.js (+ search.css) is fetched on the first tap on the search button and not before. Mockup only; no server read or write.
   The build lifts this file's markup (homeHtml), order() and mount(); the mockup's own frames and switches are in mock.js. Sample names are invented. */
(function () {
"use strict";
var BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var ic = function (d, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; };
var I = {
  lens: ic('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'), clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'), cart: ic('<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>'),
  leaf: ic('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>'), chef: ic('<path d="M7 14a3.5 3.5 0 1 1 1-6.8 4 4 0 0 1 8 0A3.5 3.5 0 1 1 17 14v5H7z"/>'),
  jar: ic('<rect x="6" y="6" width="12" height="14" rx="2.5"/><path d="M8 3h8v3H8z"/>'), note: ic('<path d="M6 4h12v16H6z"/><path d="M9 9h6M9 13h6"/>'), chev: ic('<path d="M6 9l6 6 6-6"/>', "chv")
};

/* ---- time windows (Proposals MG-P1, MG-P2; same as option F). morning (before 11:00) and after dinner (from 20:00) are the cut-offs recipe-ideas/ideas.js already uses; 16:30 is new. ---- */
var WINDOWS = [["morning", 0, 11 * 60], ["midday", 11 * 60, 16 * 60 + 30], ["cook", 16 * 60 + 30, 20 * 60], ["after", 20 * 60, 24 * 60]];
function windowAt(min) { for (var i = 0; i < WINDOWS.length; i++) if (min >= WINDOWS[i][1] && min < WINDOWS[i][2]) return WINDOWS[i][0]; return "after"; }
function clockWindow() { var d = new Date(); return windowAt(d.getHours() * 60 + d.getMinutes()); }
var GREET = { morning: "Good morning, Sam.", midday: "Good afternoon, Sam.", cook: "Good evening, Sam.", after: "Good evening, Sam." };

/* ---- what Home already has (sample data, mine). Which of the two cards has content is the state switch's "has" ---- */
var D = {
  soon: [["Chicken thighs", "Tomorrow"], ["Cucumbers", "Tomorrow"], ["Spinach", "in 2 days"]], low: [["Limes", "1 left"], ["Peanut butter", "a little"]],
  rows: [{ e: "🍛", t: "Chickpea and spinach curry", why: "All in &middot; 30 min" }, { e: "🥗", t: "Cucumber and spring onion salad", why: "All in &middot; 10 min" }]
};
function hasOf(v) { return { soon: v === "both" || v === "soon", low: v === "both" || v === "low" }; }

/* ---- ORDER of the two collapsed cards (owner: driven by the same situational logic as the idle search card). A pure function: context in, the keys to draw out, in order.
   A card with nothing in it is never in the list, so it is never drawn (no empty section, no empty chevron).
   - cooking time: on the way out is pointless when you are about to cook, so it goes last.
   - mid-morning and mid-day with a plan that is missing things: what needs buying (running low) comes first.
   - otherwise (morning or mid-day with nothing missing, after dinner): what is going off comes first, because it decides what to cook or plan next. ---- */
function order(c) {
  var pref = c.time === "cook" ? ["low", "soon"] : (c.time === "morning" || c.time === "midday") && c.next === "missing" ? ["low", "soon"] : ["soon", "low"];
  var h = hasOf(c.has); return pref.filter(function (k) { return h[k]; });
}

/* ---- the lead idea in the Cooking ideas card: always the first card. The kicker says WHEN it applies: today (tonight) or coming up (tomorrow, after dinner). ---- */
function lead(c) {
  var up = c.time === "after", day = up ? "tomorrow" : "tonight";
  if (c.next === "planned") return up ? { e: "🍛", t: "Chickpea and spinach curry", why: "All in &middot; 30 min", k: "Planned for tomorrow", up: 1 } : { e: "🍋", t: "Lemon chicken traybake", why: "Everything is in &middot; uses the chicken thighs going off tomorrow", k: "Planned for tonight" };
  if (c.next === "missing") return up ? { e: "🍛", t: "Chickpea and spinach curry", why: "All in &middot; 30 min", k: "Planned for tomorrow", up: 1 } : { e: "🍜", t: "Chicken laksa", why: "Missing laksa paste, coconut milk and rice noodles", k: "Planned for tonight" };
  if (c.next === "nofit") return { e: "❄️", t: "Beef curry, in the freezer", why: "Nothing in the pantry fits " + day + ". 3 portions", k: "Nothing fits " + day, up: up ? 1 : 0, none: 1 };
  return up ? { e: "🍛", t: "Chickpea and spinach curry", why: "Uses the spinach before it goes &middot; all in &middot; 30 min", k: "Idea for tomorrow", up: 1 } : { e: "🍋", t: "Lemon chicken traybake", why: "Uses the chicken thighs going off tomorrow", k: "Idea for tonight" };
}
function ideasHtml(c) {
  var L = lead(c);
  var kick = '<span class="k' + (L.up ? " up" : "") + '">' + (L.up ? "Coming up &middot; " : "Today &middot; ") + '<span class="w">' + esc(L.k) + "</span></span>";
  var acts = L.none ? '<button type="button" class="btn" data-stub>Make it</button><button type="button" class="btn ghost" data-stub>Ask your assistant</button>' : '<button type="button" class="btn" data-stub>Make it</button><button type="button" class="btn ghost" data-stub>Plan</button>';
  return '<section class="ideas" aria-label="Cooking ideas"><div class="th2"><span class="ric t2" aria-hidden="true" style="--c:var(--sage)">' + I.chef + '</span><h2>Cooking ideas</h2></div>' +
    '<div class="idl"><button type="button" class="top2" data-stub><span class="ph" aria-hidden="true">' + L.e + '</span><span class="t">' + kick + "<b>" + esc(L.t) + '</b><span class="why">' + I.leaf + L.why + '</span></span></button><div class="acts">' + acts + "</div></div>" +
    (L.none ? "" : '<p class="sub">Other ideas</p>' + D.rows.map(function (r) { return '<div class="idr"><button type="button" class="go" data-stub><span class="e" aria-hidden="true">' + r.e + '</span><span class="t"><b>' + esc(r.t) + '</b><span class="why">' + r.why + "</span></span></button></div>"; }).join("")) + "</section>";
}
/* a collapsed card. The body is written on the first open, so a closed card costs one row of markup. */
var FOLD = { soon: ["On the way out", "clock", "", "soon"], low: ["Running low", "cart", "t3", "low"] };
function foldHtml(id, key, open) {
  var f = FOLD[key], items = D[f[3]], prev = items.slice(0, 2).map(function (x) { return x[0]; }).join(", ") + (items.length > 2 ? " +" + (items.length - 2) : "");
  return '<section class="tilec fold" data-fold="' + key + '" data-open="' + (open ? "true" : "false") + '"><h2 class="th2"><button type="button" class="tog" aria-expanded="' + (open ? "true" : "false") + '" aria-controls="' + id + "-" + key + '"><span class="ric ' + f[2] + '" aria-hidden="true">' + I[f[1]] + '</span><span class="tt"><b>' + f[0] + "</b><small>" + esc(prev) + '</small></span><span class="n">' + items.length + '<span class="sr"> items</span></span>' + I.chev + "</button></h2>" +
    '<div class="fb" id="' + id + "-" + key + '"' + (open ? "" : " hidden") + ">" + (open ? foldBody(items) : "") + "</div></section>";
}
function foldBody(items) { return '<div class="minis">' + items.map(function (x) { return "<span><b>" + esc(x[0]) + "</b>" + esc(x[1]) + "</span>"; }).join("") + '</div><a class="va" href="#" data-stub>View all</a>'; }

/* the markup the build lifts. data-mode is rest | search. Cooking ideas is ALWAYS first in .rest. */
function homeHtml(id, c, expand) {
  var rest = '<div class="rest">' + ideasHtml(c) + order(c).map(function (k) { return foldHtml(id, k, expand === "all"); }).join("") + "</div>";
  return '<div class="home" id="' + id + '" data-mode="rest" data-phase="rest" data-order="' + order(c).join(",") + '">' +
    '<header class="hbar"><h1 class="hi">' + esc(GREET[c.time]) + '</h1><button type="button" class="sbtn" aria-label="Search" aria-haspopup="dialog" data-open-search>' + I.lens + "</button></header>" +
    '<div class="srch" role="search" id="' + id + '-bar">' + I.lens + '<input type="search" role="combobox" aria-expanded="false" aria-controls="' + id + '-res" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="Search, or what&rsquo;s for tonight" aria-label="Search recipes, pantry, shopping and the plan"><button type="button" class="cx" aria-label="Cancel search">Cancel</button></div>' +
    '<div class="sg-host" hidden></div><div class="sres" id="' + id + '-res" role="listbox" aria-label="Search results" hidden></div>' +
    rest + '<p class="hv-live" role="status" aria-live="polite"></p></div>';
}

/* ---- lazy loading: search.css + search.js on the first tap on the search button, never on page load ---- */
var loaded = {};
function need(file) {
  if (loaded[file]) return loaded[file];
  loaded[file] = new Promise(function (ok) {
    if (/\.css$/.test(file)) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + file; l.onload = ok; l.onerror = ok; document.head.appendChild(l); }
    else { var s = document.createElement("script"); s.src = BASE + file; s.onload = ok; s.onerror = ok; document.head.appendChild(s); }
  });
  return loaded[file];
}
function deferred() { return Promise.all([need("search.css"), need("search.js")]); }

/* mount(el, opts): opts = { id, ctx(), idleMs, trigger, scroller, pf, toast(text), phase, q, expand } */
function mount(host, opts) {
  var c0 = opts.ctx();
  host.innerHTML = homeHtml(opts.id, c0, opts.expand);
  var el = host.firstChild, input = el.querySelector("input"), live = el.querySelector(".hv-live"), pf = opts.pf, kb = pf && pf.querySelector(".kbm"), scroller = opts.scroller;
  var H = { el: el, ctx: opts.ctx, opts: { idleMs: opts.idleMs == null ? 2000 : opts.idleMs, trigger: opts.trigger || "idle" }, say: function (t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }, toast: function (t) { if (opts.toast) opts.toast(t); } };
  var saved = 0, ctl = { el: el, H: H };
  var kbOn = function (on) { if (pf) { if (on) pf.setAttribute("data-kb", ""); else pf.removeAttribute("data-kb"); } if (kb) kb.hidden = !on; };
  var run = function (fn) { return deferred().then(function () { if (window.MHS && MHS.ready) fn(); }); };

  function enter() {
    if (el.dataset.mode === "search") return;
    saved = scroller ? scroller.scrollTop : 0;
    el.dataset.mode = "search"; kbOn(true);
    if (scroller) scroller.scrollTop = 0;
  }
  function exit() {
    if (el.dataset.mode !== "search") return;
    if (window.MHS && MHS.ready) MHS.reset(H);
    input.value = ""; el.dataset.mode = "rest"; el.dataset.phase = "rest"; kbOn(false);
    if (document.activeElement === input) input.blur();
    if (scroller) scroller.scrollTop = saved;   /* Home comes back exactly where it was (Proposal MG-P5) */
    el.classList.add("swapped"); setTimeout(function () { el.classList.remove("swapped"); }, 220);
    var b = el.querySelector(".sbtn"); if (b && !opts.phase) b.focus({ preventScroll: true });   /* focus goes back to the button that opened it */
  }
  function open() { enter(); deferred(); input.focus(); }
  input.addEventListener("focus", function () { enter(); kbOn(true); run(function () { MHS.tapped(H); }); });
  input.addEventListener("input", function () { enter(); run(function () { MHS.typed(H); }); });
  input.addEventListener("blur", function () {
    setTimeout(function () {
      if (opts.phase) return;                                      /* a drawn frame stays as drawn */
      if (document.activeElement === input || el.dataset.mode !== "search") return;
      if (!input.value.trim()) exit(); else kbOn(false);           /* words are kept, the keyboard goes (Proposal MG-P8) */
    }, 0);
  });
  input.addEventListener("keydown", function (e) {
    if (!window.MHS || !MHS.ready) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); MHS.move(H, e.key === "ArrowDown" ? 1 : -1); }
    else if (e.key === "Enter") { if (H.count && H.phase === "typing") { e.preventDefault(); MHS.choose(H, H.active); } }
    else if (e.key === "Escape") { e.preventDefault(); if (input.value) { input.value = ""; MHS.tapped(H); } else exit(); }
  });
  el.querySelector(".cx").addEventListener("click", exit);
  el.addEventListener("mousedown", function (e) { if (e.target.closest(".sg-host, .sres, .cx")) e.preventDefault(); });   /* a tap on the card or a row never drops the keyboard */
  el.addEventListener("click", function (e) {
    var t = e.target;
    var sb = t.closest("[data-open-search]"); if (sb) return open();
    var tg = t.closest(".tog"); if (tg) return toggle(tg);
    var r = t.closest(".sres .i"); if (r) return MHS.choose(H, [].indexOf.call(el.querySelectorAll(".sres .i"), r));
    var a = t.closest(".sg-host [data-act]"); if (a) return H.toast("A mock: “" + a.dataset.act + "” would happen here.");
    var s = t.closest("[data-stub]"); if (s) { e.preventDefault(); H.toast("A mock: this would open."); }
  });
  function toggle(btn) {
    var card = btn.closest(".fold"), on = card.dataset.open !== "true", body = card.querySelector(".fb");
    if (on && !body.firstChild) body.innerHTML = foldBody(D[FOLD[card.dataset.fold][3]]);   /* the body is written on the first open */
    card.dataset.open = on ? "true" : "false"; btn.setAttribute("aria-expanded", on ? "true" : "false"); body.hidden = !on;
  }

  /* a drawn frame (mock only): put the takeover in the state the label says, without a real focus */
  if (opts.phase && opts.phase !== "rest") {
    enter(); kbOn(true);
    run(function () {
      if (opts.phase === "surfaced") MHS.showSurface(H);
      else if (opts.phase === "typing") { input.value = opts.q || ""; MHS.typed(H); }
      else { H.phase = "tapped"; el.dataset.phase = "tapped"; }
    });
  }
  ctl.exit = exit; ctl.destroy = function () { try { if (window.MHS && MHS.ready) MHS.reset(H); } catch (e) {} kbOn(false); };
  return ctl;
}
window.MobileHome = { mount: mount, windowAt: windowAt, clockWindow: clockWindow, WINDOWS: WINDOWS, html: homeHtml, order: order, lead: lead, I: I, D: D };
})();
