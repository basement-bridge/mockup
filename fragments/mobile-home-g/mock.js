/* Mobile Home option G: the mockup's own page script. The state switch (time of day, next meal, what the two collapsed cards hold), the phone frames, and the Pantry and Shopping
   frames that show the search button in the same place. Nothing here is for the build: the build lifts home.css, home.js, search.css and search.js. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var MH = window.MobileHome, I = MH.I;
  var TIMES = [["morning", "Morning", "8:10 am"], ["midday", "Mid-day", "12:30 pm"], ["cook", "Cooking time", "5:45 pm"], ["after", "After dinner", "8:45 pm"]];
  var NEXT = [["open", "Not planned"], ["planned", "Planned, all in"], ["missing", "Planned, missing things"], ["nofit", "Nothing fits"]];
  var HAS = [["both", "Both cards"], ["soon", "On the way out only"], ["low", "Running low only"], ["none", "Neither"]];
  var Q = new URLSearchParams(location.search);
  var pick = function (v, list, d) { return list.some(function (x) { return x[0] === v; }) ? v : d; };
  var CTX = { time: pick(Q.get("time"), TIMES, MH.clockWindow()), next: pick(Q.get("next"), NEXT, "open"), has: pick(Q.get("has"), HAS, "both") };
  var TRIG = Q.get("trigger") === "focus" ? "focus" : "idle";
  var FRAMES = [
    { id: "live", title: "Live: try it", sub: "Cooking ideas first. Open a card with its chevron. Tap the magnifier, wait two seconds, or type two letters (try chick, egg, lime).", kind: "home" },
    { id: "rest", title: "At rest: both cards collapsed", sub: "Greeting and search in one row; Cooking ideas, then the cards that have something. Nothing needs a scroll to find search or the lead idea.", kind: "home" },
    { id: "open", title: "At rest: both cards open", sub: "What a chevron opens. It scrolls; the greeting row stays.", kind: "home", expand: "all" },
    { id: "tapped", title: "Magnifier tapped (first 2 seconds)", sub: "The field takes the row, everything else steps aside, no This week strip. Nothing else happens yet.", kind: "home", phase: "tapped" },
    { id: "surfaced", title: "Two seconds later: the one thing", sub: "A single card for this moment, from Cooking ideas' ranking. Not a list. Change the switches above.", kind: "home", phase: "surfaced" },
    { id: "typing", title: "Typing “chick”", sub: "Desktop's contextual dropdown, from two characters.", kind: "home", phase: "typing", q: "chick" },
    { id: "nomatch", title: "Typing “zzz”: no match", sub: "Offers to add it to the shopping list, as the Pantry search does.", kind: "home", phase: "typing", q: "zzz" },
    { id: "pantry", title: "Pantry: the same spot", sub: "The magnifier is the rightmost control of the top row, the same 48px box at the same place as on Home. Drawn to compare; Pantry itself is unchanged.", kind: "pantry" },
    { id: "shopping", title: "Shopping: the same spot", sub: "Same row, same box, same corner. Recipes is parked (owner) and not drawn.", kind: "shopping" }
  ];
  if (Q.get("only")) FRAMES = FRAMES.filter(function (f) { return f.id === Q.get("only"); });   /* mock only: draw one frame, so the default path can be measured on its own */
  var CTL = (window.MOCKCTL = {});

  function kbHtml() {
    var row = function (n, cls) { var h = ""; for (var i = 0; i < n; i++) h += "<span></span>"; return "<div" + (cls ? ' class="' + cls + '"' : "") + ">" + h + "</div>"; };
    return '<div class="kbm" aria-hidden="true" hidden>' + row(10) + row(9) + row(7) + row(1, "w") + "<small>Keyboard (mock stand-in, 291px)</small></div>";
  }
  function barHtml(on) {
    var tabs = [["Home", I.chef], ["Pantry", I.jar], ["Recipes", I.note], ["Shopping", I.cart]];
    return '<nav class="bar" aria-label="Main">' + tabs.map(function (t) { return '<a href="#" data-stub' + (t[0] === on ? ' class="on" aria-current="page"' : "") + ">" + t[1] + "<span>" + t[0] + "</span></a>"; }).join("") + "</nav>";
  }
  function rows(list) { return list.map(function (r) { return '<div class="idr"><button type="button" class="go" data-stub><span class="e" aria-hidden="true">' + r[0] + '</span><span class="t"><b>' + esc(r[1]) + '</b><span class="why">' + esc(r[2]) + "</span></span></button></div>"; }).join(""); }
  function otherHtml(kind) {
    if (kind === "pantry") return '<div class="home other"><header class="hbar"><button type="button" class="ft" data-stub>Filters</button><span class="grp"><button type="button" class="ft sq" aria-label="Add an item" data-stub>+</button><button type="button" class="sbtn" aria-label="Search" data-stub-search>' + I.lens + '</button></span></header><section class="tilec" style="margin-top:var(--sp-2)">' +
      rows([["🍗", "Chicken thighs", "Fridge · 600 g · use by tomorrow"], ["🥒", "Cucumbers", "Fridge · 2 · use by tomorrow"], ["🥬", "Spinach", "Fridge · 1 bag"], ["🍚", "Rice", "Pantry · 2 kg"], ["🥜", "Crunchy peanut butter", "Pantry · a little"]]) + "</section></div>";
    return '<div class="home other"><header class="hbar"><h1 class="tx">Shopping</h1><button type="button" class="sbtn" aria-label="Search" data-stub-search>' + I.lens + '</button></header><section class="tilec" style="margin-top:var(--sp-2)">' +
      rows([["🍗", "Chicken breast", "1 pack"], ["🌿", "Coriander", "1 bunch"], ["🥚", "Eggs", "1 dozen"], ["🍋", "Limes", "2"]]) + "</section></div>";
  }
  function frameHtml(f) {
    return '<figure class="fr" data-frame="' + f.id + '"><figcaption><b>' + esc(f.title) + "</b><span>" + esc(f.sub) + '</span></figcaption><div class="pf"><div class="pbody">' + (f.kind === "home" ? "" : otherHtml(f.kind)) + "</div>" + barHtml(f.kind === "pantry" ? "Pantry" : f.kind === "shopping" ? "Shopping" : "Home") + kbHtml() + '<div class="toast" hidden role="status"></div></div></figure>';
  }
  function toast(fig, text) { var t = $(".toast", fig); t.textContent = text; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(function () { t.hidden = true; }, 1800); }

  function mountFrame(f, fig) {
    var body = $(".pbody", fig);
    if (f.kind !== "home") {
      fig.addEventListener("click", function (e) { if (e.target.closest("[data-stub-search]")) toast(fig, "Same takeover as on Home."); else if (e.target.closest("[data-stub]")) { e.preventDefault(); toast(fig, "A mock: this would open."); } });
      return;
    }
    CTL[f.id] = MH.mount(body, { id: "h-" + f.id, expand: f.expand, ctx: function () { return CTX; }, idleMs: 2000, trigger: TRIG, scroller: body, pf: $(".pf", fig), toast: function (t) { toast(fig, t); }, phase: f.phase, q: f.q });
  }
  function drawFrames() {
    Object.keys(CTL).forEach(function (k) { try { CTL[k].destroy(); } catch (e) {} }); CTL = window.MOCKCTL = {};
    $("#frames").innerHTML = FRAMES.map(frameHtml).join("");
    FRAMES.forEach(function (f) { mountFrame(f, $(".fr[data-frame=" + f.id + "]")); });
    document.body.dataset.ready = "";
    setTimeout(function () { document.body.dataset.ready = CTX.time + "." + CTX.next + "." + CTX.has; }, 60);
  }
  function url() { try { history.replaceState(null, "", "?time=" + CTX.time + "&next=" + CTX.next + "&has=" + CTX.has + (TRIG === "focus" ? "&trigger=focus" : "")); } catch (e) {} }
  function sw(label, key, list, show) {
    return '<span class="lbl">' + label + "</span>" + list.map(function (t) { return '<button type="button" data-' + key + '="' + t[0] + '" aria-pressed="' + (CTX[key] === t[0]) + '">' + t[1] + (show && t[2] ? " <small>" + t[2] + "</small>" : "") + "</button>"; }).join("");
  }
  function drawSwitch() { $("#stateSw").innerHTML = sw("Time", "time", TIMES, 1) + sw("Next meal", "next", NEXT) + sw("Cards with something in", "has", HAS); }
  document.addEventListener("DOMContentLoaded", function () {
    drawSwitch(); drawFrames();
    $("#stateSw").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      ["time", "next", "has"].forEach(function (k) { if (b.dataset[k]) CTX[k] = b.dataset[k]; });
      drawSwitch(); url(); drawFrames();
    });
  });
})();
