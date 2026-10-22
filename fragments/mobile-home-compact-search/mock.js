/* Mobile Home, compact is the search bar: the mockup's own page script. The state switch (time of day, next meal, when the suggestion surfaces), the phone frames,
   and the mock-only panel under the live frame. Nothing here is for the build: the build lifts home.css, home.js, search.css and search.js. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var MH = window.MobileHome, I = MH.I;
  var TIMES = [["morning", "Morning", "8:10 am"], ["midday", "Mid-day", "12:30 pm"], ["cook", "Cooking time", "5:45 pm"], ["after", "After dinner", "8:45 pm"]];
  var NEXT = [["open", "Not planned"], ["planned", "Planned"], ["nofit", "Nothing fits"]];
  var Q = new URLSearchParams(location.search);
  var pick = function (v, list, d) { return list.some(function (x) { return x[0] === v; }) ? v : d; };
  var CTX = { time: pick(Q.get("time"), TIMES, MH.clockWindow()), next: pick(Q.get("next"), NEXT, "open") };
  var TRIG = Q.get("trigger") === "focus" ? "focus" : "idle";
  var ME = "sam";
  var FRAMES = [
    { id: "live", title: "Live: try it", sub: "Tap the bar. Nothing is typed: wait two seconds. Or type two letters (try chick, egg, lime). The start you pick below is saved on this device.", opens: null, persist: true },
    { id: "compact", title: "Home opens compact: at rest", sub: "The bar is Home. This week stays in view. Nothing else is drawn, so nothing else loads.", opens: "compact" },
    { id: "full", title: "Home opens full: at rest", sub: "Today's Home with the bar added at the top. Scroll it.", opens: "full" },
    { id: "tapped", title: "Tapped, nothing typed (first 2 seconds)", sub: "The bar has the screen, the week is a pinned strip, the keyboard is up. Nothing else happens yet.", opens: "compact", phase: "tapped" },
    { id: "surfaced", title: "Two seconds later: the one thing", sub: "A single card for this time of day. Not a list. Change the time and the next meal above.", opens: "compact", phase: "surfaced" },
    { id: "typing", title: "Typing “chick”", sub: "Same dropdown as desktop, after two characters. The week stays.", opens: "compact", phase: "typing", q: "chick" },
    { id: "nomatch", title: "Typing “zzz”: no match", sub: "Offers to add it to the shopping list, as the Pantry search does.", opens: "compact", phase: "typing", q: "zzz" }
  ];
  if (Q.get("only")) FRAMES = FRAMES.filter(function (f) { return f.id === Q.get("only"); });   /* mock only: draw one frame, so the default path can be measured on its own */
  var blocked = function () { return !!window.__mockBlocked; };
  var mockStorage = function () { if (blocked()) return null; try { var s = window.localStorage, t = "__mh"; s.setItem(t, "1"); s.removeItem(t); return s; } catch (e) { return null; } };
  var CTL = (window.MOCKCTL = {});

  function kbHtml() {
    var row = function (n, cls) { var h = ""; for (var i = 0; i < n; i++) h += "<span></span>"; return "<div" + (cls ? ' class="' + cls + '"' : "") + ">" + h + "</div>"; };
    return '<div class="kbm" aria-hidden="true" hidden>' + row(10) + row(9) + row(7) + row(1, "w") + "<small>Keyboard (mock stand-in, 291px)</small></div>";
  }
  function barHtml() {
    return '<nav class="bar" aria-label="Main"><a href="#" class="on" aria-current="page" data-stub>' + I.chef + "<span>Home</span></a><a href=\"#\" data-stub>" + I.jar + "<span>Pantry</span></a><a href=\"#\" data-stub>" + I.note + "<span>Recipes</span></a><a href=\"#\" data-stub>" + I.cart + "<span>Shopping</span></a></nav>";
  }
  function frameHtml(f) {
    return '<figure class="fr" data-frame="' + f.id + '"><figcaption><b>' + esc(f.title) + "</b><span>" + esc(f.sub) + '</span></figcaption><div class="pf"><div class="pbody"></div>' + barHtml() + kbHtml() + '<div class="toast" hidden role="status"></div></div>' + (f.id === "live" ? panelHtml() : "") + "</figure>";
  }
  function panelHtml() {
    return '<div class="panel" data-panel><p class="pt">Settings row, mock: Home opens with</p><div class="prow"><button type="button" data-p="full">Everything</button><button type="button" data-p="compact">Search and the week</button></div>' +
      '<p class="pt">Stored on this device (mock readout)</p><dl><dt>Key</dt><dd data-r="key"></dd><dt>Value</dt><dd data-r="val"></dd><dt>Storage</dt><dd data-r="ok"></dd></dl>' +
      '<div class="prow"><button type="button" data-p="reload">Reload frame</button><button type="button" data-p="clear">Forget my choice</button><label><input type="checkbox" data-p="block"> Storage blocked</label></div>' +
      '<p class="pn">Reload re-mounts the frame from storage, as a page reload would. With storage blocked Home opens full and the choice lasts only this visit. Nothing is ever sent to a server.</p></div>';
  }
  function toast(fig, text) { var t = $(".toast", fig); t.textContent = text; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(function () { t.hidden = true; }, 1800); }

  function mountFrame(f, fig, again) {
    var body = $(".pbody", fig), key = "mock.f." + f.id + ".";
    var ctl = MH.mount(body, { id: "h-" + f.id, member: ME, base: key, storage: mockStorage, opens: f.opens, ctx: function () { return CTX; }, idleMs: 2000, trigger: TRIG,
      scroller: body, pf: $(".pf", fig), toast: function (t) { toast(fig, t); }, phase: f.phase, q: f.q });
    CTL[f.id] = ctl;
    if (f.id === "live" && !again) bindPanel(f, fig);
    return ctl;
  }
  function readout(fig, ctl) {
    var q = function (s) { return $("[data-r=" + s + "]", fig); };
    q("key").textContent = ctl.store.key; q("val").textContent = ctl.store.read() || "(nothing stored: default is full)";
    q("ok").textContent = ctl.store.ok() ? "available" : "unavailable: opens full, lasts this visit only";
  }
  function bindPanel(f, fig) {
    var redraw = function () { readout(fig, CTL.live); };
    redraw();
    $("[data-p=full]", fig).addEventListener("click", function () { CTL.live.setOpens("full"); redraw(); });
    $("[data-p=compact]", fig).addEventListener("click", function () { CTL.live.setOpens("compact"); redraw(); });
    $("[data-p=block]", fig).addEventListener("change", function (e) { window.__mockBlocked = e.target.checked; redraw(); });
    $("[data-p=reload]", fig).addEventListener("click", function () { CTL.live.destroy(); mountFrame(f, fig, true); redraw(); });
    $("[data-p=clear]", fig).addEventListener("click", function () { CTL.live.store.clear(); CTL.live.destroy(); mountFrame(f, fig, true); redraw(); });
  }
  function drawFrames() {
    Object.keys(CTL).forEach(function (k) { try { CTL[k].destroy(); } catch (e) {} }); CTL = window.MOCKCTL = {};
    $("#frames").innerHTML = FRAMES.map(frameHtml).join("");
    FRAMES.forEach(function (f) { mountFrame(f, $(".fr[data-frame=" + f.id + "]")); });
    document.body.dataset.ready = "";
    setTimeout(function () { document.body.dataset.ready = CTX.time + "." + CTX.next; }, 60);
  }
  function url() { try { history.replaceState(null, "", "?time=" + CTX.time + "&next=" + CTX.next + (TRIG === "focus" ? "&trigger=focus" : "")); } catch (e) {} }
  function drawSwitch() {
    $("#stateSw").innerHTML = '<span class="lbl">Time</span>' + TIMES.map(function (t) { return '<button type="button" data-time="' + t[0] + '" aria-pressed="' + (CTX.time === t[0]) + '">' + t[1] + " <small>" + t[2] + "</small></button>"; }).join("") +
      '<span class="lbl">Next meal</span>' + NEXT.map(function (n) { return '<button type="button" data-next="' + n[0] + '" aria-pressed="' + (CTX.next === n[0]) + '">' + n[1] + "</button>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    drawSwitch(); drawFrames();
    $("#stateSw").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.time) CTX.time = b.dataset.time; if (b.dataset.next) CTX.next = b.dataset.next;
      drawSwitch(); url(); drawFrames();
    });
  });
})();
