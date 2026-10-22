/* Mobile Home, compact is the search bar (option F). DEFAULT PATH: the Home markup, the bar, the week, the remembered start, and the lazy load of search.css + search.js.
   Nothing about results or the contextual suggestion is here: search.js (+ search.css) is fetched on the first tap on the bar and not before. Mockup only; no server read or write.
   The build lifts this file's markup (homeHtml) and mount(); the mockup's own frames and panel are in mock.js. Sample names are invented. */
(function () {
"use strict";
var BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var ic = function (d) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; };
var I = {
  lens: ic('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'), clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'), cart: ic('<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>'),
  leaf: ic('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>'), chef: ic('<path d="M7 14a3.5 3.5 0 1 1 1-6.8 4 4 0 0 1 8 0A3.5 3.5 0 1 1 17 14v5H7z"/>'),
  jar: ic('<rect x="6" y="6" width="12" height="14" rx="2.5"/><path d="M8 3h8v3H8z"/>'), note: ic('<path d="M6 4h12v16H6z"/><path d="M9 9h6M9 13h6"/>')
};

/* ---- time windows (Proposals MS-P1, MS-P2). morning (before 11:00) and after dinner (from 20:00) are the cut-offs recipe-ideas/ideas.js already uses; 16:30 is new. ---- */
var WINDOWS = [["morning", 0, 11 * 60], ["midday", 11 * 60, 16 * 60 + 30], ["cook", 16 * 60 + 30, 20 * 60], ["after", 20 * 60, 24 * 60]];
function windowAt(min) { for (var i = 0; i < WINDOWS.length; i++) if (min >= WINDOWS[i][1] && min < WINDOWS[i][2]) return WINDOWS[i][0]; return "after"; }
function clockWindow() { var d = new Date(); return windowAt(d.getHours() * 60 + d.getMinutes()); }
var GREET = { morning: "Good morning, Sam.", midday: "Good afternoon, Sam.", cook: "Good evening, Sam.", after: "Good evening, Sam." };

/* ---- what Home already has (sample data, mine) ---- */
var D = {
  soon: [["Chicken thighs", "Tomorrow"], ["Cucumbers", "Tomorrow"], ["Spinach", "in 2 days"]], low: [["Limes", "1 left"], ["Peanut butter", "a little"]],
  lead: { e: "🍋", t: "Lemon chicken traybake", why: "Uses the chicken thighs going off tomorrow" },
  rows: [{ e: "🍛", t: "Chickpea and spinach curry", why: "All in &middot; 30 min" }, { e: "🥗", t: "Cucumber and spring onion salad", why: "All in &middot; 10 min" }],
  week: ["Thu 22", "Fri 23", "Sat 24", "Sun 25", "Mon 26", "Tue 27", "Wed 28"], plan: { 3: "Chicken laksa", 4: "Egg fried rice", 5: "Not cooking" }
};
function tile(cls, icon, title, items) {
  return '<section class="tilec"><div class="th2"><span class="ric ' + cls + '" aria-hidden="true">' + icon + "</span><h2>" + title + '</h2><a class="va" href="#" data-stub>View all</a></div><div class="minis">' + items.map(function (x) { return "<span><b>" + esc(x[0]) + "</b>" + esc(x[1]) + "</span>"; }).join("") + "</div></section>";
}
function weekHtml(c) {
  var pl = {}; for (var k in D.plan) pl[k] = D.plan[k];
  if (c.next === "planned") { if (c.time === "after") pl[1] = "Chickpea and spinach curry"; else pl[0] = "Lemon chicken traybake"; }
  return '<section class="tilec wk" aria-label="This week"><div class="th2"><span class="ric t3" aria-hidden="true" style="--c:var(--sage)">' + I.note + '</span><h2>This week</h2></div><div class="wl">' +
    D.week.map(function (d, i) { return '<button type="button" class="wd' + (i === 0 ? " now" : "") + (pl[i] ? " set" : "") + '" data-day="' + i + '" aria-label="' + esc(d + ", " + (pl[i] || "nothing planned")) + '"><b>' + d + "</b><span>" + esc(pl[i] || "Nothing planned") + "</span><i aria-hidden=\"true\"></i></button>"; }).join("") + "</div></section>";
}
/* the markup the build lifts. data-opens is the remembered start (full | compact); data-mode is rest | search. */
function homeHtml(id, opens, c) {
  var L = D.lead;
  var rest = '<div class="rest">' + tile("", I.clock, "On the way out", D.soon) +
    '<section class="ideas"><div class="th2"><span class="ric t2" aria-hidden="true" style="--c:var(--sage)">' + I.chef + '</span><h2>Cooking ideas</h2></div>' +
    '<div class="idl"><button type="button" class="top2" data-stub><span class="ph" aria-hidden="true">' + L.e + '</span><span class="t"><span class="k">' + (c.next === "planned" ? "Planned for tonight" : "Tonight") + "</span><b>" + esc(L.t) + '</b><span class="why">' + I.leaf + esc(L.why) + '</span></span></button><div class="acts"><button type="button" class="btn" data-stub>Make it</button><button type="button" class="btn ghost" data-stub>Plan</button></div></div>' +
    '<p class="sub">Other ideas</p>' + D.rows.map(function (r) { return '<div class="idr"><button type="button" class="go" data-stub><span class="e" aria-hidden="true">' + r.e + '</span><span class="t"><b>' + esc(r.t) + '</b><span class="why">' + r.why + "</span></span></button></div>"; }).join("") + "</section>" +
    tile("t3", I.cart, "Running low", D.low) + "</div>";
  if (opens === "compact") rest = "";   /* compact at rest: the cards are not drawn at all, so nothing for them is built or loaded */
  return '<div class="home" id="' + id + '" data-opens="' + opens + '" data-mode="rest" data-phase="rest">' +
    '<header class="hbar"><h1 class="hi">' + esc(GREET[c.time]) + "</h1></header>" +
    '<div class="srch" role="search" id="' + id + '-bar">' + I.lens + '<input type="search" role="combobox" aria-expanded="false" aria-controls="' + id + '-res" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="Search, or what&rsquo;s for tonight" aria-label="Search recipes, pantry, shopping and the plan"><button type="button" class="cx" aria-label="Cancel search">Cancel</button></div>' +
    '<div class="sg-host" hidden></div><div class="sres" id="' + id + '-res" role="listbox" aria-label="Search results" hidden></div>' +
    rest + weekHtml(c) + '<p class="hv-live" role="status" aria-live="polite"></p></div>';
}

/* ---- the remembered start (Proposal MS-P7). Client-side only, never the server. Key kitchie.homeStart.<memberId> = full | compact. ---- */
function store(opts) {
  var key = (opts.base || "kitchie.") + "homeStart." + opts.member;
  var s = function () { try { if (opts.storage) return opts.storage(); var t = window.localStorage; t.setItem("__hs", "1"); t.removeItem("__hs"); return t; } catch (e) { return null; } };
  return {
    key: key, ok: function () { return !!s(); },
    read: function () { try { var v = s() && s().getItem(key); return v === "full" || v === "compact" ? v : null; } catch (e) { return null; } },
    write: function (v) { try { var t = s(); if (t) t.setItem(key, v); } catch (e) {} },
    clear: function () { try { var t = s(); if (t) t.removeItem(key); } catch (e) {} }
  };
}

/* ---- lazy loading: search.css + search.js on the first tap on the bar (or the first key), never on page load ---- */
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

/* mount(el, opts): opts = { id, member, base, storage, persist, opens, ctx(), idleMs, trigger, scroller, pf, toast(text), phase, q } */
function mount(host, opts) {
  var st = store(opts), c0 = opts.ctx();
  var opens = opts.opens || st.read() || "full";
  host.innerHTML = homeHtml(opts.id, opens, c0);
  var el = host.firstChild, input = el.querySelector("input"), live = el.querySelector(".hv-live"), pf = opts.pf, kb = pf && pf.querySelector(".kbm"), scroller = opts.scroller;
  var H = { el: el, ctx: opts.ctx, opts: { idleMs: opts.idleMs == null ? 2000 : opts.idleMs, trigger: opts.trigger || "idle" }, say: function (t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }, toast: function (t) { if (opts.toast) opts.toast(t); } };
  var saved = 0, ctl = { el: el, H: H, store: st, opens: function () { return el.dataset.opens; } };
  var kbOn = function (on) { if (pf) { if (on) pf.setAttribute("data-kb", ""); else pf.removeAttribute("data-kb"); } if (kb) kb.hidden = !on; };
  var run = function (fn) { return deferred().then(function () { if (window.MHS && MHS.ready) fn(); }); };

  function enter() {
    if (el.dataset.mode === "search") return;
    saved = scroller ? scroller.scrollTop : 0;
    el.dataset.mode = "search"; el.querySelector(".srch").classList.add("is-focus"); kbOn(true);
    if (scroller) scroller.scrollTop = 0;
  }
  function exit() {
    if (el.dataset.mode !== "search") return;
    if (window.MHS && MHS.ready) MHS.reset(H);
    input.value = ""; el.dataset.mode = "rest"; el.dataset.phase = "rest"; el.querySelector(".srch").classList.remove("is-focus"); kbOn(false);
    if (document.activeElement === input) input.blur();
    if (scroller) scroller.scrollTop = saved;   /* Home comes back exactly where it was (Proposal MS-P5) */
    el.classList.add("swapped"); setTimeout(function () { el.classList.remove("swapped"); }, 220);
  }
  input.addEventListener("focus", function () { enter(); kbOn(true); run(function () { MHS.tapped(H); }); });
  input.addEventListener("input", function () { enter(); run(function () { MHS.typed(H); }); });
  input.addEventListener("blur", function () {
    setTimeout(function () {
      if (opts.phase) return;                                      /* a drawn frame stays as drawn */
      if (document.activeElement === input || el.dataset.mode !== "search") return;
      if (!input.value.trim()) exit(); else kbOn(false);           /* words are kept, the keyboard goes (Proposal MS-P8) */
    }, 0);
  });
  input.addEventListener("keydown", function (e) {
    if (!window.MHS || !MHS.ready) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); MHS.move(H, e.key === "ArrowDown" ? 1 : -1); }
    else if (e.key === "Enter") { if (H.count && H.phase === "typing") { e.preventDefault(); MHS.choose(H, H.active); } }
    else if (e.key === "Escape") { e.preventDefault(); if (input.value) { input.value = ""; MHS.tapped(H); } else exit(); }
  });
  el.querySelector(".cx").addEventListener("click", exit);
  el.addEventListener("mousedown", function (e) { if (e.target.closest(".sg-host, .sres, .wk, .cx")) e.preventDefault(); });   /* a tap on the card, a row or the week never drops the keyboard */
  el.addEventListener("click", function (e) {
    var t = e.target;
    var r = t.closest(".sres .i"); if (r) return MHS.choose(H, [].indexOf.call(el.querySelectorAll(".sres .i"), r));
    var a = t.closest(".sg-host [data-act]"); if (a) return H.toast("A mock: “" + a.dataset.act + "” would happen here.");
    var d = t.closest(".wd"); if (d) return H.toast("A mock: opens " + D.week[+d.dataset.day] + " in the Plan.");
    var s = t.closest("[data-stub]"); if (s) { e.preventDefault(); H.toast("A mock: this would open."); }
  });
  el.querySelector(".srch").addEventListener("click", function (e) { if (e.target !== input && !e.target.closest(".cx")) input.focus(); });

  /* a drawn frame (mock only): put the bar in the state the label says, without a real focus */
  if (opts.phase && opts.phase !== "rest") {
    enter(); kbOn(true);
    run(function () {
      if (opts.phase === "surfaced") MHS.showSurface(H);
      else if (opts.phase === "typing") { input.value = opts.q || ""; MHS.typed(H); }
      else { H.phase = "tapped"; el.dataset.phase = "tapped"; }
    });
  }
  ctl.setOpens = function (v) { st.write(v); el.dataset.opens = v; };
  ctl.exit = exit; ctl.destroy = function () { try { if (window.MHS && MHS.ready) MHS.reset(H); } catch (e) {} kbOn(false); };
  return ctl;
}
window.MobileHome = { mount: mount, windowAt: windowAt, clockWindow: clockWindow, WINDOWS: WINDOWS, html: homeHtml, store: store, I: I, D: D };
})();
