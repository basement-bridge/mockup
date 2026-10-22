/* Mobile Home view switch: the mockup's own script. Sample data (invented), the five options, the phone frames and the mock-only panel under the live frame.
   Nothing here is for the build: the build lifts home-view.css, home-view.js and (for B, C, E only) gestures.js, plus the markup homeHtml() writes.
   Only the chosen option is drawn (load on engagement); gestures.js is fetched only for the options that use it. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ic = function (d) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; };
  var I = {
    clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    cart: ic('<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>'),
    leaf: ic('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>'),
    chef: ic('<path d="M7 14a3.5 3.5 0 1 1 1-6.8 4 4 0 0 1 8 0A3.5 3.5 0 1 1 17 14v5H7z"/>'),
    jar: ic('<rect x="6" y="6" width="12" height="14" rx="2.5"/><path d="M8 3h8v3H8z"/>'),
    note: ic('<path d="M6 4h12v16H6z"/><path d="M9 9h6M9 13h6"/>'),
    up: ic('<path d="M6 14l6-6 6 6"/>'), dn: ic('<path d="M6 10l6 6 6-6"/>'),
    search: ic('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>')
  };

  /* Sample data, mine. */
  var ME = "sam", GREET = "Good evening, Sam.";
  var LEAD = { e: "🍝", t: "Creamy mushroom pasta", why: "Uses spinach and cream before they go" };
  var ROWS = [{ e: "🍛", t: "Chana masala", why: "Everything is in" }, { e: "🍚", t: "Egg fried rice", why: "Not had for 2 weeks" }];
  var OUT = [["Spinach", "Tomorrow"], ["Mushrooms", "in 2 days"], ["Cream", "in 3 days"]], LOW = [["Milk", "1 L left"], ["Butter", "a little"]];

  /* The five options. `slot` says where the control sits; the markup below is the only difference between them. */
  var OPTS = {
    A: { tab: "Icon", name: "Header icon", short: "One icon in the header row",
      how: "One 44px icon button at the right end of the greeting row. Tap flips the view.",
      find: "A one-time bubble under the icon (“Tap for just tonight’s answer”, five seconds, shown once per person per device) and two soft rings around the icon. With reduced motion: one still ring, no pulse.",
      signal: "The glyph is the layout you are in: three stacked rows when full, one single card when compact. Pressed also draws a ring and fills the button, so it is never colour alone.",
      thumb: "Worst of the five. Top right of a tall phone is the farthest corner from a thumb.", space: "None: it sits in the greeting row, which is already 44px tall.",
      cost: "The cheapest and the most findable. Not very “almost invisible”: it is a button, though a quiet one.",
      hint: { text: "Tap for just tonight’s answer", opt: { pulse: true }, anchor: ".hv-ctl" } },
    B: { tab: "Handle", name: "Pull handle", short: "A handle under the ideas card",
      how: "A small pill handle on the lower edge of the Cooking ideas card. Drag it up and Home folds to the answer; drag it down and everything comes back. A plain tap does either. It starts only on the handle, so it never fights the page scroll.",
      find: "The handle is always there (a pill and a chevron), which is the affordance. Once, it nudges twice and a bubble says “Drag up for just the answer”. With reduced motion: the bubble only, no nudge, and the handle does not follow the finger.",
      signal: "The pill is short with an up chevron when full (“fold”), long with a down chevron when compact (“open”). A shape change, not colour. The page itself changes at once, which is the strongest signal.",
      thumb: "Best of the five: the handle is at the lower edge of the answer card, in the thumb’s natural reach, in both views.", space: "About 36px net in the full view (it replaces the card’s bottom padding), 44px in compact, where there is room.",
      cost: "A drag handle is a known gesture, but it needs a gesture file and a tap fallback, which is built in. Less obviously a “view switch” than an icon.",
      hint: { text: "Drag up for just the answer", opt: { nudge: true, align: "center" }, anchor: ".hv-handle" } },
    C: { tab: "Pinch", name: "Pinch or hold", short: "Pinch Home, or press and hold the heading",
      how: "Pinch in anywhere on Home to fold it to the answer; pinch out to open it. For one finger: press and hold the heading for a beat (a thin ring fills), or Enter on it from a keyboard.",
      find: "A bubble once: “Pinch in, or press and hold this line”. There is no control to see, so this is the hardest to find, and the hint is the only help. No ring pulses.",
      signal: "The heading changes (a greeting when full, the question when compact) and a four-dot mark beside it becomes one dot. Nothing to look at on the screen otherwise: zero chrome.",
      thumb: "Anywhere. A pinch needs two fingers, so one-handed use is poor; the hold is the one-handed path.", space: "None.",
      cost: "Nothing on the screen, and the cost is paid elsewhere: pinch turns off the browser’s own page zoom on Home (a real accessibility cost), pinch is hard one-handed, and few people would ever try it. The hold is a hidden control.",
      hint: { text: "Pinch in, or press and hold this line", opt: { align: "center" }, anchor: ".hbtn" } },
    D: { tab: "Lens", name: "Lens in the search field", short: "A lens at the end of a search field",
      how: "A universal search field sits at the top of Home. Its right end, behind a hairline, is a 44px lens that flips the view. Typing and the lens never overlap.",
      find: "Once, the lens pulses and a bubble says “Focus on tonight’s answer”. Reduced motion: a still ring. It is where the eye already goes to ask a question, which fits the “What are we eating?” ask.",
      signal: "An open ring when full; a ring with a solid dot in the middle when compact (focused). Pressed also draws an accent edge on the hairline.",
      thumb: "Poor: the field is at the top. (It could be drawn at the bottom of the screen like some mobile browsers; not done.)", space: "Adds the whole search field, about 52px, to both views. Mobile Home has no search today (the Pantry’s is tucked under Filters), so the control would pay for a field nobody asked for. Proposal MV-P8.",
      cost: "Elegant if Home gets search anyway; wasteful if not. Treat it as an add-on to a search decision, not a reason for one.",
      hint: { text: "Focus on tonight’s answer", opt: { pulse: true }, anchor: ".hv-ctl" } },
    E: { tab: "Learns", name: "Remembers how you use it", short: "No control: Home learns, and the heading is the way out",
      how: "Home opens in the view you last used it in. If three visits in a row were spent on the answer (Make it, Plan, the lead) it opens compact next time; three spent browsing (scroll past the answer, the tiles, View all) open it full. Tap the heading to flip it at any time; a direct choice wins and resets the count.",
      find: "Nothing to find, which is the point and the risk. The first time Home changes by itself, one note under the answer says why: “Home now opens on just the answer. Tap the heading for everything.” Shown once per change.",
      signal: "The heading and its dot mark (a greeting and four dots when full, the question and one dot when compact). No control is drawn.",
      thumb: "The heading is near the top, but the common path needs no tap at all.", space: "None.",
      cost: "Quiet and clever, but Home can change under someone’s thumb, and there is no obvious way to say “I want compact” until the first learned change. It needs a deliberate escape (the heading tap) and is best as the persistence layer under another option, not a control on its own.",
      hint: { text: "Home now opens on just the answer. Tap the heading for everything.", opt: { align: "center" }, anchor: ".glance" } }
  };

  /* ---------- the phone markup (what the build lifts) ---------- */
  function homeHtml(k) {
    var o = OPTS[k], tile = function (cls, icon, title, items) {
      return '<section class="tilec"><div class="th2"><span class="ric ' + cls + '" aria-hidden="true">' + icon + "</span><h2>" + title + '</h2><a class="va" href="#" data-stub>View all</a></div><div class="minis">' + items.map(function (x) { return "<span><b>" + esc(x[0]) + "</b>" + esc(x[1]) + "</span>"; }).join("") + "</div></section>";
    };
    var heading = '<span class="g">' + esc(GREET) + '</span><span class="ask">What are we eating?</span>';
    var mark = '<svg class="hv-mark" viewBox="0 0 14 14" aria-hidden="true"><g class="m1" fill="currentColor"><circle cx="4" cy="4" r="1.6"/><circle cx="10" cy="4" r="1.6"/><circle cx="4" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/></g><circle class="m2" cx="7" cy="7" r="2.4" fill="currentColor"/></svg>';
    var h1;
    if (k === "C") h1 = '<h1 class="hi hv-hold"><button type="button" class="hbtn" aria-describedby="hvd-' + k + '">' + mark + heading + '</button></h1>';
    else if (k === "E") h1 = '<h1 class="hi"><button type="button" class="hbtn" aria-describedby="hvd-' + k + '">' + mark + heading + "</button></h1>";
    else h1 = '<h1 class="hi">' + heading + "</h1>";
    var btn = function (g) { return '<button type="button" class="hv-ctl" data-hv-switch aria-pressed="false" aria-label="Just tonight’s answer" title="Just tonight’s answer">' + window.HomeView.ICONS[g] + "</button>"; };
    var srch = k === "D" ? '<div class="srch" role="search"><input type="search" placeholder="Search your kitchen" aria-label="Search your kitchen">' + btn("lens") + "</div>" : "";
    var handle = k === "B" ? '<button type="button" class="hv-handle" data-hv-state aria-pressed="false" aria-label="Just tonight’s answer"><i></i><span class="up">' + I.up + '</span><span class="dn">' + I.dn + "</span></button>" : "";
    var desc = (k === "C" || k === "E") ? '<span id="hvd-' + k + '" class="hv-live">' + (k === "C" ? "Press and hold, or press Enter, to switch Home between everything and just tonight’s answer." : "Switches Home between everything and just tonight’s answer.") + "</span>" : "";
    return '<div class="home' + (k === "D" ? " has-srch" : "") + (k === "B" ? " thumb" : "") + '" data-view="full" data-opt="' + k + '">' + srch +
      '<header class="hbar">' + h1 + (k === "A" ? btn("rows") : "") + "</header>" + desc +
      tile("", I.clock, "On the way out", OUT) +
      '<section class="ideas"><div class="th2"><span class="ric t2" aria-hidden="true" style="--c:var(--sage)">' + I.chef + '</span><h2>Cooking ideas</h2></div>' +
      '<div class="idl"><button type="button" class="top2" data-stub><span class="ph" aria-hidden="true">' + LEAD.e + '</span><span class="t"><span class="k">Tonight</span><b>' + esc(LEAD.t) + '</b><span class="why">' + I.leaf + esc(LEAD.why) + '</span></span></button>' +
      '<div class="acts"><button type="button" class="btn" data-stub>Make it</button><button type="button" class="btn ghost" data-stub>Plan</button></div></div>' +
      '<p class="sub">Other ideas</p>' + ROWS.map(function (r) { return '<div class="idr"><button type="button" class="go" data-stub><span class="e" aria-hidden="true">' + r.e + '</span><span class="t"><b>' + esc(r.t) + '</b><span class="why">' + esc(r.why) + "</span></span></button></div>"; }).join("") + handle + "</section>" +
      tile("t3", I.cart, "Running low", LOW) +
      '<p class="glance">Spinach goes off tomorrow. Milk is running low.</p></div>';
  }
  function frameHtml(k, f) {
    return '<figure class="fr" data-opt="' + k + '" data-frame="' + f.id + '"><figcaption><b>' + esc(f.title) + "</b><span>" + esc(f.sub) + '</span></figcaption><div class="pf"><div class="pbody">' + homeHtml(k) + '</div><nav class="bar" aria-label="Main"><a href="#" class="on" aria-current="page" data-stub>' + I.chef + "<span>Home</span></a><a href=\"#\" data-stub>" + I.jar + "<span>Pantry</span></a><a href=\"#\" data-stub>" + I.note + "<span>Recipes</span></a><a href=\"#\" data-stub>" + I.cart + '<span>Shopping</span></a></nav><div class="toast" hidden role="status"></div></div>' +
      (f.id === "live" ? panelHtml(k) : "") + "</figure>";
  }
  function panelHtml(k) {
    return '<div class="panel" data-panel><p class="pt">Stored on this device (mock readout)</p><dl><dt>Key</dt><dd data-r="key"></dd><dt>Value</dt><dd data-r="val"></dd><dt>Hint shown</dt><dd data-r="hint"></dd><dt>Storage</dt><dd data-r="ok"></dd>' + (k === "E" ? '<dt>Learner</dt><dd data-r="learn"></dd>' : "") + "</dl>" +
      '<div class="prow"><button type="button" data-p="reload">Reload frame</button><button type="button" data-p="clear">Forget my choice</button><label><input type="checkbox" data-p="block"> Storage blocked</label></div>' +
      (k === "E" ? '<div class="prow"><button type="button" data-p="answered">I used the answer</button><button type="button" data-p="browsed">I browsed</button><button type="button" data-p="visit">End visit and reload</button></div>' : "") +
      '<p class="pn">Reload re-mounts the frame from storage, as a page reload would. With storage blocked the frame opens in the default (full) view, still switches for this visit, and shows no hint.</p></div>';
  }

  /* ---------- mounting ---------- */
  var FRAMES = [
    { id: "first", title: "Full view, first visit", sub: "Hint showing. Nothing is saved from this frame.", start: "full", hint: "force", persist: false },
    { id: "settled", title: "Compact view, settled", sub: "No hint. Nothing is saved from this frame.", start: "compact", hint: "none", persist: false },
    { id: "live", title: "Live: remembered", sub: "Your choice here is saved on this device.", start: null, hint: "once", persist: true }
  ];
  var CTL = (window.MOCKCTL = {}), LEARN = {}, gp = null;
  var blocked = function () { return !!window.__mockBlocked; };
  var mockStorage = function () { if (blocked()) return null; try { var s = window.localStorage, t = "__hv"; s.setItem(t, "1"); s.removeItem(t); return s; } catch (e) { return null; } };

  function loadGestures() {
    if (window.HomeViewGestures) return Promise.resolve();
    if (gp) return gp;
    gp = new Promise(function (res) { var s = document.createElement("script"); s.src = "gestures.js"; s.onload = res; s.onerror = res; document.head.appendChild(s); });
    return gp;
  }
  function toast(fig, text) { var t = $(".toast", fig); t.textContent = text; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(function () { t.hidden = true; }, 1800); }

  function mountFrame(k, f, fig, again) {
    var home = $(".home", fig), o = OPTS[k];
    var ctl = window.HomeView.mount(home, { base: "mock.homeView." + k + "." + f.id, member: ME, storage: mockStorage, start: f.start, persist: f.persist, hint: (k === "E" && f.id === "settled") ? "force" : f.hint, hintMs: f.hint === "force" ? 1e9 : 5000 });
    CTL[k + "." + f.id] = ctl;
    $$("[data-stub]", fig).forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); toast(fig, "A mock: this would open."); }); });
    var learner = null, G = window.HomeViewGestures;
    if (k === "B") G.handle(ctl, $(".hv-handle", home));
    if (k === "C") { G.pinch(ctl, $(".pbody", fig)); G.hold(ctl, $(".hbtn", home)); }
    if (k === "E") {
      $(".hbtn", home).addEventListener("click", function () { ctl.toggle("tap"); if (learner) learner.manual(); });
      if (f.persist) { learner = G.learn(ctl, { scroller: $(".pbody", fig) }); LEARN[k] = learner; }
    }
    /* the one hint, a moment after paint so it is measured in place */
    var h = o.hint;
    if (k === "E" && f.id === "settled") ctl.hint($(h.anchor, home), h.text, h.opt);
    else if (k !== "E" && f.hint !== "none") setTimeout(function () { ctl.hint($(h.anchor, home), h.text, h.opt); }, 60);
    if (f.id === "live" && !again) bindPanel(k, f, fig, ctl);
    return ctl;
  }
  function readout(k, fig, ctl) {
    var q = function (s) { return $("[data-r=" + s + "]", fig); };
    q("key").textContent = ctl.keys.view; q("val").textContent = ctl.read(ctl.keys.view) || "(nothing stored: default is full)";
    q("hint").textContent = ctl.read(ctl.keys.hint) === "1" ? "yes (will not show again)" : "no"; q("ok").textContent = ctl.ok() ? "available" : "unavailable: default view, no hint";
    if (k === "E") q("learn").textContent = ctl.read(ctl.keys.learn) || "(none yet)";
  }
  function bindPanel(k, f, fig, ctl) {
    var cur = ctl, redraw = function () { readout(k, fig, cur); };
    redraw();
    var wrapSet = function (c) { var s = c.set; c.set = function () { var r = s.apply(c, arguments); redraw(); return r; }; };
    wrapSet(cur);
    fig.addEventListener("click", function (e) { setTimeout(redraw, 0); });
    $("[data-p=block]", fig).addEventListener("change", function (e) { window.__mockBlocked = e.target.checked; redraw(); });
    var remount = function () {
      cur.destroy(); var body = $(".pbody", fig); body.innerHTML = homeHtml(k); body.scrollTop = 0;
      cur = mountFrame(k, f, fig, true); wrapSet(cur); redraw();
    };
    $("[data-p=reload]", fig).addEventListener("click", remount);
    $("[data-p=clear]", fig).addEventListener("click", function () {
      var s = mockStorage(); if (s) { var b = "mock.homeView." + k + "." + f.id; [".sam", ".hint.sam", ".learn.sam"].forEach(function (x) { s.removeItem(b + x); }); }
      remount();
    });
    if (k === "E") {
      $("[data-p=answered]", fig).addEventListener("click", function () { LEARN.E.mark("answer"); });
      $("[data-p=browsed]", fig).addEventListener("click", function () { LEARN.E.mark("browse"); });
      $("[data-p=visit]", fig).addEventListener("click", function () { LEARN.E.endVisit(); remount(); });
    }
  }

  var shownOpt = null;
  function show(k) {
    if (!OPTS[k]) k = "B";
    shownOpt = k; var o = OPTS[k];
    $$("#tabs [role=tab]").forEach(function (t) { var on = t.dataset.o === k; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    var needG = k === "B" || k === "C" || k === "E";
    Object.keys(CTL).forEach(function (x) { try { CTL[x].destroy(); } catch (e) {} }); CTL = window.MOCKCTL = {};
    var rec = k === "B" ? '<span class="badge">Recommended</span>' : "";
    $("#opt").innerHTML = '<h2 id="optname">' + k + " &middot; " + esc(o.name) + rec + '</h2><p class="lede">' + esc(o.short) + '.</p>' +
      '<div class="fr3">' + FRAMES.map(function (f) { return frameHtml(k, f); }).join("") + "</div>" +
      '<dl class="facts"><dt>How it works</dt><dd>' + esc(o.how) + "</dd><dt>First-time discovery</dt><dd>" + esc(o.find) + "</dd><dt>Signals the mode without text</dt><dd>" + esc(o.signal) + "</dd><dt>Thumb reach</dt><dd>" + esc(o.thumb) + "</dd><dt>Screen space</dt><dd>" + esc(o.space) + "</dd><dt>Honest cost</dt><dd>" + esc(o.cost) + "</dd></dl>";
    var go = function () { $$("#opt .fr").forEach(function (fig) { var f = FRAMES.filter(function (x) { return x.id === fig.dataset.frame; })[0]; mountFrame(k, f, fig); }); document.body.dataset.ready = k; };
    document.body.dataset.ready = "";
    if (needG) loadGestures().then(go); else go();
  }
  window.mockShow = show;
  document.addEventListener("DOMContentLoaded", function () {
    var tabs = $("#tabs");
    tabs.innerHTML = Object.keys(OPTS).map(function (k) { return '<button type="button" role="tab" data-o="' + k + '" aria-selected="false">' + k + '<span> ' + esc(OPTS[k].tab) + "</span></button>"; }).join("");
    tabs.addEventListener("click", function (e) { var b = e.target.closest("[role=tab]"); if (b) { show(b.dataset.o); try { history.replaceState(null, "", "?o=" + b.dataset.o); } catch (x) {} } });
    tabs.addEventListener("keydown", function (e) { var ks = Object.keys(OPTS), i = ks.indexOf(shownOpt); if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = ks[(i + (e.key === "ArrowRight" ? 1 : ks.length - 1)) % ks.length]; show(n); $("[data-o=" + n + "]", tabs).focus(); e.preventDefault(); } });
    var q = (location.search.match(/[?&]o=([A-E])/) || [])[1];
    show(q || "B");
  });
})();
