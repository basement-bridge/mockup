/* Settings, the chosen design (owner's final decisions, 24 Oct 2026). Phone only. Mockup only: nothing here is built.
   Base is shake-up option B: a big search front door, a quick (pinned) area, three plain rows (Household, Preferences, Kitchen setup) with the values shown in the rows.
   Looks is a small page that holds the three pinnable controls (Text size, Theme, Household activity bell) with an icon-only pin each.
   App-wide gesture rules (DESIGN.md, "Gestures"): double tap resets a control to its default; long hold then drag moves a thing. There is no edit button and no pencil.
   Search: layout C, a best-match card then compact one-line rows, reachable from every page, this page's matches first, last three searches (or examples) when the box is empty.
   Theme is an in-place rotary (swipe sideways); text size is a seven-segment stepper (middle = Match my phone) that rescales this whole page live, headings at half the rate with a cap.
   The engine (shake-search.js) and the index (../settings-redesign/search-index.js) are fetched on engagement only. Class names are plain so the CSS can be lifted into the app. Everything drawn from the index is escaped. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- the search engine, fetched on engagement ---------- */
  var E = null, engineLoading = false, engineWaiters = [];
  var S = {
    ready: function () { return !!(E && E.ready()); },
    all: function () { return E ? E.all() : []; }, entry: function (id) { return E ? E.entry(id) : null; },
    words: function (t) { return E ? E.words(t) : []; }, run: function (q, c, f) { return E.run(q, c, f); },
    load: function (cb) {
      function ready() { window.ShakeSearch.load(cb); }
      if (E) { ready(); return; }
      if (window.ShakeSearch) { E = window.ShakeSearch; ready(); return; }
      engineWaiters.push(cb); if (engineLoading) return; engineLoading = true;
      var sc = document.createElement("script"); sc.src = "shake-search.js";
      sc.onload = function () { E = window.ShakeSearch; engineWaiters.splice(0).forEach(function (f) { E.load(f); }); };
      sc.onerror = function () { engineLoading = false; };
      document.head.appendChild(sc);
    }
  };

  /* ---------- icons (stroke, currentColor) ---------- */
  var P = {
    back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>', auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 010 16z" fill="currentColor"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    pin: '<path d="M9 3h6l-1 6 3 4H7l3-4zM12 13v8"/>', bell: '<path d="M6 16v-5a6 6 0 1112 0v5l2 2H4zM10 21h4"/>', bellx: '<path d="M6 16v-5a6 6 0 1112 0v5l2 2H4zM10 21h4M4 4l16 16"/>',
    home: '<path d="M4 11l8-7 8 7v9H4zM10 20v-6h4v6"/>', sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    pot: '<path d="M4 10h16v7a3 3 0 01-3 3H7a3 3 0 01-3-3zM2 10h2M20 10h2M9 6c0-2 2-2 2-4M14 6c0-2 2-2 2-4"/>', looks: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18z" fill="currentColor"/>'
  };
  function ic(n, s, fill) { return '<svg class="i" width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="' + (fill ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>"; }

  /* ---------- the ten themes: name, background, card, accent, text (real colours; the same five the earlier tiles drew) ---------- */
  var LOOKS = { "kitchie": ["Kitchie Night", "#0F1E19", "#172A23", "#F2B84B", "#F3EEE3"], "kitchie-day": ["Kitchie Day", "#F6F1E6", "#FFFFFF", "#8A5600", "#1D2A24"], "marmalade": ["Marmalade", "#FBF1E3", "#FFFFFF", "#C2410C", "#3A2412"], "blueberry": ["Blueberry", "#14142B", "#1D1D3D", "#F48FB1", "#EEEBFF"], "herb": ["Herb Garden", "#EEF4E6", "#FFFFFF", "#2F7D32", "#1B2E1B"], "cappuccino": ["Cappuccino", "#F3E9DD", "#FFFFFF", "#8B5A2B", "#33261B"], "tokyo-midnight": ["Tokyo Midnight", "#0B0F1E", "#141A30", "#5CE1E6", "#E8ECFF"], "paprika": ["Paprika", "#1F1410", "#2B1D17", "#FF8A4C", "#F7E9DD"], "sea-salt": ["Sea Salt", "#EAF2F4", "#FFFFFF", "#0F766E", "#12313A"], "lavender-fog": ["Lavender Fog", "#F1EEF7", "#FFFFFF", "#6D28D9", "#2A2340"] };
  var THEME_IDS = Object.keys(LOOKS);
  function isLight(id) { var h = (LOOKS[id] || LOOKS.kitchie)[1]; return (parseInt(h.slice(1, 3), 16) * 299 + parseInt(h.slice(3, 5), 16) * 587 + parseInt(h.slice(5, 7), 16) * 114) / 1000 > 140; }

  /* ---------- text size: seven steps, middle = Match my phone (owner, 24 Oct): -8, -16, -24 and +10, +20, +30 percent of the phone's own size ---------- */
  var TS_PCT = { "-3": -24, "-2": -16, "-1": -8, "0": 0, "1": 10, "2": 20, "3": 30 };
  function tsLabel(n) { return n === 0 ? "Match my phone" : (n > 0 ? "+" : "−") + Math.abs(TS_PCT[n]) + "%"; }
  function tsSpoken(n) { return n === 0 ? "Match my phone" : (n < 0 ? "Smaller, minus " : "Larger, plus ") + Math.abs(TS_PCT[n]) + " percent"; }
  var MODES = [["system", "System", "auto"], ["light", "Light", "sun"], ["dark", "Dark", "moon"]];
  var CTLS = { text: "Text size", theme: "Theme", bell: "Household activity bell" };
  var DEFAULT_ORDER = ["text", "theme", "bell"];

  /* ---------- state: one device ---------- */
  var SH = { mode: "system", ts: 0, names: false, motion: false, bell: true, checks: true, hh: "Henderson kitchen", me: "Alex", invite: null, recents: [], pins: ["text", "theme"], order: DEFAULT_ORDER.slice(), open: null };
  var VALS = { role: "Sous chef", members: "3 people", cats: "12", locs: "4", gemini: "Not connected", quiet: "22:00 to 06:00", cap: "3 a day", rules: "2 custom", stops: "2 switched off", avoids: "1 hard, 2 soft", likes: "4 likes", subs: "3 saved", notes: "2 notes", props: "1 waiting", tz: "From your phone", units: "None", install: "Not installed", sort: "Name", planoff: "Sat, Sun", history: "Last 7 days", claude: "Connected", chatgpt: "Not connected", defassist: "Claude", samples: "4 left" };
  var PAGES = { front: "Settings", looks: "Looks", household: "Household", you: "You", preferences: "Preferences", kitchen: "Kitchen setup" };
  var SUGGEST = { front: ["bigger text", "dark mode", "invite someone", "my name"], looks: ["bigger text", "dark mode", "turn off the bell"], household: ["invite someone", "my name", "someone changed", "household name"], you: ["my name", "kitchen role", "profile"], preferences: ["quiet hours", "stop the questions", "food rules"], kitchen: ["categories", "connect Claude", "locations"] };
  var LAST3 = ["bigger text", "invite someone", "dark mode"];
  /* one plain line per setting, shown on the best match (the index's own sentences are longer) */
  var DESC = { theme: "The colours on every screen.", mode: "Light, dark, or follow your phone.", text: "Makes words bigger or smaller everywhere.", rows: "What each Pantry row shows.", motion: "Fewer animations.", bell: "Shows when someone changes something.", reset: "Puts this phone's looks back to normal.", sort: "Set on the Pantry list itself.", me: "How the household sees you.", role: "The title shown instead of your initial.", tz: "Taken from your phone.", units: "No setting today.", install: "Adds Kitchie to your home screen.", csv: "Downloads everything in the Pantry.", signout: "Ends your session on this phone.", hh: "The name shown at the top of screens.", members: "Who is in and who can manage.", invite: "Makes a link so someone can join.", leave: "Takes you out of this household.", cats: "Groups for items, like Dairy.", locs: "Where things live, like the Fridge.", samples: "Clears the starter items.", claude: "Lets Claude read your Pantry and recipes.", chatgpt: "Lets ChatGPT read your Pantry and recipes.", gemini: "Lets Gemini read your Pantry and recipes.", defassist: "Which assistant Plan's Ask button opens.", disconnect: "Stops an assistant reading your Pantry.", prefs: "Stock checks, quiet hours, food rules.", checks: "Whether the assistant asks how much is left.", quiet: "No questions between these times.", cap: "The most stock checks it may raise a day.", rules: "How often to check, by place.", stops: "Items you told it to stop asking about.", avoids: "Foods never to suggest.", likes: "Foods you like or dislike.", subs: "Swaps you accept.", notes: "Free text the assistant reads.", props: "Avoids a housemate suggested.", history: "What changed, who did it, and when.", notif: "Two signals: the bell and stock checks.", planoff: "Days Plan leaves out." };
  var PLACE_OVERRIDE = { rows: "Looks", motion: "Looks", reset: "Looks" };

  /* ---------- the device's looks ---------- */
  var root = document.documentElement;
  function curTheme() { return root.getAttribute("data-theme") || "kitchie"; }
  function themeName(id) { return (LOOKS[id || curTheme()] || LOOKS.kitchie)[0]; }
  function pickTheme(id) {
    var b = document.createElement("button"); b.hidden = true; b.setAttribute("data-theme-pick", id); document.body.appendChild(b); b.click(); b.remove();
  }
  function systemLight() { return matchMedia("(prefers-color-scheme: light)").matches; }
  function applyMode() {
    var m = SH.mode; if (m === "system") m = systemLight() ? "light" : "dark";
    pickTheme(m === "light" ? "kitchie-day" : "kitchie");
  }
  function applyScale() {
    var s = 1 + TS_PCT[SH.ts] / 100, h = Math.max(0.88, Math.min(1.15, 1 + (s - 1) / 2));
    root.style.setProperty("--ts", s); root.style.setProperty("--hs", h); root.style.setProperty("--hk", h / s);
    document.body.setAttribute("data-ts", String(SH.ts));
  }

  /* ---------- controls ---------- */
  function lookStyle(id) { var l = LOOKS[id]; return "--pbg:" + l[1] + ";--pcd:" + l[2] + ";--pac:" + l[3] + ";--pfg:" + l[4]; }
  function dot(id) { return '<i class="swdot" style="' + lookStyle(id || curTheme()) + '" aria-hidden="true"></i>'; }
  /* the rotary: a window on the ten themes; swipe sideways, the neighbours peek, the page re-themes as it turns */
  function rotary() {
    var cur = curTheme(), idx = Math.max(0, THEME_IDS.indexOf(cur));
    return '<div class="rot" role="slider" tabindex="0" aria-label="Theme" aria-orientation="horizontal" aria-valuemin="1" aria-valuemax="10" aria-valuenow="' + (idx + 1) + '" aria-valuetext="' + esc(themeName(cur)) + '. Swipe sideways for more." data-ctl="theme"><div class="rtrack">' +
      THEME_IDS.map(function (id, i) { return '<div class="rit' + (i === idx ? " cur" : "") + '" data-i="' + i + '" data-id="' + id + '" style="' + lookStyle(id) + '"><span class="rcard"><b>' + esc(LOOKS[id][0]) + '</b><i aria-hidden="true"></i></span></div>'; }).join("") + "</div></div>";
  }
  function modeSeg() {
    return '<div class="mseg" role="radiogroup" aria-label="Light or dark">' + MODES.map(function (m) {
      return '<button type="button" role="radio" aria-checked="' + (SH.mode === m[0]) + '" data-a="mode:' + m[0] + '" aria-label="' + m[1] + '" title="' + m[1] + '">' + ic(m[2], 20) + "</button>";
    }).join("") + "</div>";
  }
  function modeCycle() {
    var i = MODES.map(function (m) { return m[0]; }).indexOf(SH.mode), nx = MODES[(i + 1) % 3], cu = MODES[i];
    return '<button type="button" class="ibtn cyc" data-a="mode:' + nx[0] + '" aria-label="Light or dark: ' + cu[1] + ". Tap for " + nx[1] + '" title="' + cu[1] + '">' + ic(cu[2], 22) + "</button>";
  }
  /* the stepper: seven battery segments, filled from the middle (Match my phone) out to the chosen step */
  function stepper() {
    var segs = ""; for (var i = -3; i <= 3; i++) {
      var lo = Math.min(0, SH.ts), hi = Math.max(0, SH.ts), cls = "seg" + (i === SH.ts ? " on" : i >= lo && i <= hi ? " fill" : "") + (i === 0 ? " mid" : "");
      segs += '<button type="button" class="' + cls + '" data-a="ts:' + i + '" aria-pressed="' + (i === SH.ts) + '" aria-label="' + esc(tsSpoken(i)) + '"><i></i></button>';
    }
    return '<div class="ts" role="group" aria-label="Text size" data-ctl="text"><div class="bat">' + segs + "</div></div>";
  }
  function sw(key, on, label) { return '<label class="sw"><input type="checkbox" role="switch" data-a="tog:' + key + '"' + (on ? " checked" : "") + ' aria-label="' + esc(label) + '"><i class="swt" aria-hidden="true"></i></label>'; }
  function val(e) {
    switch (e.val) {
      case "theme": return themeName();
      case "mode": return { system: "System", light: "Light", dark: "Dark" }[SH.mode];
      case "text": return tsLabel(SH.ts);
      case "rows": return SH.names ? "Names only" : "Standard";
      case "motion": return SH.motion ? "Reduced" : "Follows phone";
      case "bell": return SH.bell ? "On" : "Off";
      case "checks": return SH.checks ? "On" : "Off";
      case "hh": return SH.hh;
      case "me": return SH.me;
      default: return VALS[e.val] || "";
    }
  }
  /* the inline control of a search result */
  function ctlHtml(e) {
    switch (e.ctl) {
      case "mode": return modeSeg();
      case "text": return stepper();
      case "theme": return '<div class="tline">' + rotary() + modeCycle() + "</div>";
      case "bell": return sw("bell", SH.bell, e.t);
      case "motion": return sw("motion", SH.motion, e.t);
      case "rows": return sw("names", SH.names, "Names only");
      case "checks": return sw("checks", SH.checks, e.t);
      case "reset": return '<button type="button" class="pbtn" data-a="reset">Reset</button>';
      case "themepick": return '<button type="button" class="pbtn go" data-a="theme:' + e.id.slice(3) + '">Use ' + esc(e.t) + "</button>";
    }
    return "";
  }

  /* ---------- where things live ---------- */
  function pinned(k) { return SH.pins.indexOf(k) > -1; }
  /* the page a setting is ranked under (search: this page first) */
  function pageOf(e) {
    var g = e.g, id = e.id;
    if (id === "theme" || id === "mode") return pinned("theme") ? "front" : "looks";
    if (id === "text") return pinned("text") ? "front" : "looks";
    if (id === "bell") return pinned("bell") ? "front" : "looks";
    if (id === "history") return "household";
    if (id === "me" || id === "role") return "you";
    if (g === "Looks" || g === "Text and rows" || g === "Theme names") return "looks";
    if (g === "Household") return "household";
    if (g === "Kitchen setup" || g === "Assistants") return "kitchen";
    if (g === "Preferences" || g === "Food") return "preferences";
    return "app";
  }
  /* where a tap on a result goes: the page that lists it */
  function landing(e) {
    var id = e.id;
    if (id === "theme" || id === "mode" || id === "text" || id === "bell") return "looks";
    return pageOf(e);
  }
  function placeOf(e) {
    if (PLACE_OVERRIDE[e.id]) return PLACE_OVERRIDE[e.id];
    var p = pageOf(e); if (e.id === "theme" || e.id === "mode" || e.id === "text" || e.id === "bell") p = "looks";
    if (p === "you") return "Household · You";
    if (p === "app") return e.where.replace(/ ?\(.*\)$/, "").replace(/ ›.*/, "").replace(/^No setting.*/, "Not a setting");
    return PAGES[p];
  }

  var phone = null, last = {}, noClick = 0, dragging = false;
  function Phone(host) {
    var ph = this; phone = ph; ph.page = "front"; ph.q = ""; ph.searching = false; ph.ctx = "front"; ph.stack = []; ph.flash = null; ph.limit = 8; ph.opened = null; ph.counted = null;
    ph.el = document.createElement("div"); ph.el.className = "phone";
    ph.el.innerHTML =
      '<header class="hd"><button type="button" class="bk" data-a="back"></button><h2 class="ttl"></h2><button type="button" class="ibtn" data-a="opensearch" aria-label="Search settings">' + ic("search", 22) + "</button></header>" +
      '<div class="sb"><label class="find">' + ic("search", 20) + '<input type="search" data-eq placeholder="Search settings" aria-label="Search settings" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"><button type="button" class="clr" data-a="clear" aria-label="Clear search">' + ic("x", 18) + '</button></label><button type="button" class="cancel" data-a="cancel">Cancel</button></div>' +
      '<div class="bd" data-bd></div><div class="toast" role="status" aria-live="polite" hidden></div>';
    host.appendChild(ph.el);
    ph.inp = $("[data-eq]", ph.el); ph.bd = $("[data-bd]", ph.el);
    ph.inp.addEventListener("focus", function () { if (!ph.searching) ph.begin(); S.load(function () { ph.draw(); }); });
    ph.inp.addEventListener("input", function () { ph.q = ph.inp.value; ph.limit = 8; ph.counted = null; S.load(function () { ph.draw(); }); ph.draw(); ph.chrome(); });
    ph.inp.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { if (ph.q) ph.set(""); else ph.end(); } if (ev.key === "Enter") { ph.record(); ph.inp.blur(); } });
    /* a double tap resets the control it lands on; a tap straight after a hold or a drag is ignored */
    ph.el.addEventListener("click", function (ev) {
      if (Date.now() < noClick) { ev.stopPropagation(); ev.preventDefault(); return; }
      var c = ev.target.closest("[data-ctl]"), now = Date.now(), L = last.tap;
      /* the layout can shift under the finger when the text size changes, so the second tap is judged by time and nearness, not by what it landed on */
      if (L && now - L.t < 340 && Math.abs(ev.clientX - L.x) < 26 && Math.abs(ev.clientY - L.y) < 52) { last.tap = null; ev.stopPropagation(); ev.preventDefault(); ph.resetCtl(L.k); return; }
      last.tap = c && ph.el.contains(c) ? { k: c.getAttribute("data-ctl"), t: now, x: ev.clientX, y: ev.clientY } : null;
    }, true);
    ph.el.addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-a]");
      if (SH.open && !ev.target.closest(".pin.open")) { SH.open = null; ph.drawPins(); }
      if (!t || !ph.el.contains(t) || t.type === "checkbox") return;
      ph.act(t.getAttribute("data-a"), t);
    });
    ph.el.addEventListener("change", function (ev) {
      var t = ev.target.closest("[data-a]"); if (!t || t.type !== "checkbox") return;
      var k = t.getAttribute("data-a").slice(4); SH[k] = t.checked; if (ph.searching) ph.record(); syncAll();
    });
    ph.el.addEventListener("input", function (ev) {
      if (ev.target.hasAttribute("data-hh")) { SH.hh = ev.target.value || "Our kitchen"; }
      if (ev.target.hasAttribute("data-me")) { SH.me = ev.target.value || "Alex"; var a = $(".big-av", ph.el); if (a) a.textContent = SH.me.trim().charAt(0).toUpperCase() || "A"; }
    });
    gestures(ph);
    ph.chrome(); ph.draw();
  }
  var Pp = Phone.prototype;
  Pp.toast = function (m) { var t = $(".toast", this.el); t.textContent = m; t.hidden = false; clearTimeout(this._t); this._t = setTimeout(function () { t.hidden = true; }, 2400); };
  Pp.begin = function () { this.searching = true; this.ctx = this.page; SH.open = null; this.chrome(); };
  Pp.end = function () { this.searching = false; this.q = ""; this.inp.value = ""; this.stack = []; this.inp.blur(); this.chrome(); this.draw(); syncBar(); };
  Pp.set = function (q, focus) { var ph = this; if (!ph.searching) ph.begin(); ph.q = q; ph.inp.value = q; ph.limit = 8; ph.counted = null; S.load(function () { ph.draw(); }); ph.chrome(); ph.draw(); if (focus) ph.inp.focus({ preventScroll: true }); syncBar(); };
  Pp.goPage = function (p, flashId) { this.page = p; this.searching = false; this.q = ""; this.inp.value = ""; this.flash = flashId || null; this.opened = flashId || null; SH.open = null; this.chrome(); this.draw(); this.bd.scrollTop = 0; var ph = this; if (flashId) S.load(function () { ph.draw(); }); syncBar(); };
  Pp.record = function () {
    var q = this.q.trim(); if (!q || this.counted === q) return; this.counted = q;
    SH.recents = [q].concat(SH.recents.filter(function (r) { return r !== q; })).slice(0, 3);
  };
  Pp.chrome = function () {
    var ph = this, front = ph.page === "front", s = ph.searching;
    ph.el.setAttribute("data-page", ph.page); ph.el.setAttribute("data-searching", String(s));
    $(".hd", ph.el).hidden = s;
    $(".sb", ph.el).hidden = !(s || front);
    $(".sb", ph.el).classList.toggle("on", s);
    $(".ttl", ph.el).textContent = PAGES[ph.page];
    var bk = $(".bk", ph.el), back = ph.page === "you" ? "Household" : "Settings";
    bk.innerHTML = ic("back", 22) + "<span>" + (front ? "Back" : ph.stack.length ? "Results" : back) + "</span>";
    bk.setAttribute("aria-label", front ? "Back to the app" : ph.stack.length ? "Back to search results" : "Back to " + back);
    $("[data-a=opensearch]", ph.el).hidden = front;
    $(".clr", ph.el).hidden = !ph.q;
  };
  Pp.resetCtl = function (k) {
    var ph = this;
    if (k === "text") { SH.ts = 0; applyScale(); ph.toast("Text size is back to Match my phone."); }
    else if (k === "theme") { SH.mode = "system"; applyMode(); ph.toast("Theme is back to the default."); }
    else if (k === "bell") { SH.bell = true; ph.toast("The activity bell is back to On."); }
    syncAll();
  };
  Pp.act = function (a, el) {
    var ph = this, m;
    if (a === "back") {
      if (ph.page === "front" && !ph.stack.length && !ph.searching) { ph.toast("Back to the app (mockup)."); return; }
      if (ph.stack.length) { var s = ph.stack.pop(); ph.page = s.page; ph.searching = true; ph.ctx = s.ctx; ph.q = s.q; ph.inp.value = s.q; ph.flash = null; ph.chrome(); ph.draw(); syncBar(); }
      else if (ph.page === "you") ph.goPage("household");
      else ph.goPage("front");
      return;
    }
    if (a === "opensearch") { ph.begin(); ph.chrome(); ph.inp.focus(); S.load(function () { ph.draw(); }); ph.draw(); syncBar(); return; }
    if (a === "cancel") { ph.end(); return; }
    if (a === "clear") { ph.set("", true); return; }
    if (a === "reset") { SH.mode = "system"; SH.ts = 0; SH.names = false; SH.motion = false; SH.bell = true; applyMode(); applyScale(); syncAll(); ph.toast("This phone's looks are back to normal. Household and Preferences are untouched."); return; }
    if (a === "more") { ph.limit += 100; ph.draw(); return; }
    if (a === "invite") { SH.invite = "kitchie.app/join/K7QX-2M9P"; try { if (navigator.clipboard) navigator.clipboard.writeText("https://" + SH.invite).catch(function () { /* the link is still shown */ }); } catch (e) { /* the link is still shown */ } syncAll(); ph.toast("Invite link copied."); return; }
    if ((m = /^open:(.*)$/.exec(a))) { SH.open = SH.open === m[1] ? null : m[1]; ph.drawPins(); return; }
    if ((m = /^pin:(.*)$/.exec(a))) { var k = m[1], i = SH.pins.indexOf(k); if (i > -1) SH.pins.splice(i, 1); else SH.pins.push(k); SH.pins.sort(function (x, y) { return SH.order.indexOf(x) - SH.order.indexOf(y); }); SH.open = null; ph.toast(i > -1 ? CTLS[k] + " is off the Settings front." : CTLS[k] + " is on the Settings front."); ph.draw(); syncBar(); return; }
    if ((m = /^q:(.*)$/.exec(a))) { ph.set(m[1], false); return; }
    if ((m = /^pg:(.*)$/.exec(a))) { ph.goPage(m[1]); return; }
    if ((m = /^theme:(.*)$/.exec(a))) { if (ph.searching) ph.record(); pickTheme(m[1]); SH.mode = isLight(m[1]) ? "light" : "dark"; return; }
    if ((m = /^mode:(.*)$/.exec(a))) { if (ph.searching) ph.record(); SH.mode = m[1]; applyMode(); syncAll(); return; }
    if ((m = /^ts:(-?\d)$/.exec(a))) { if (ph.searching) ph.record(); SH.ts = Math.max(-3, Math.min(3, parseInt(m[1], 10))); applyScale(); syncAll(); return; }
    if ((m = /^go:(.*)$/.exec(a))) { ph.jump(m[1]); return; }
    if ((m = /^soon:(.*)$/.exec(a))) { ph.toast(m[1] + " opens its own screen in the app (not part of this mockup)."); return; }
  };
  Pp.jump = function (id) {
    var ph = this, e = S.entry(id); if (!e) return;
    var pg = landing(e);
    if (pg === "app") { ph.toast(e.t + " lives in " + placeOf(e) + " in the app (not part of this mockup)."); return; }
    ph.record();
    ph.stack.push({ page: ph.page, ctx: ph.ctx, q: ph.q }); ph.goPage(pg, id);
  };

  /* ---------- the front ---------- */
  function chev() { return '<span class="chev">' + ic("chev", 18) + "</span>"; }
  function navRow(pg, label, v, icon) { return '<li class="prow"><button type="button" class="rb" data-a="pg:' + pg + '"><i class="lead" aria-hidden="true">' + ic(icon, 20) + '</i><span class="nm">' + esc(label) + "</span>" + (v ? '<span class="val">' + esc(v) + "</span>" : "") + chev() + "</button></li>"; }
  function orderedPins() { return SH.order.filter(pinned); }
  /* one pinned control, drawn for the room it has: full row (1), half row (2), compact chip that opens in place (3 or more) */
  function pinHtml(k, n) {
    var open = SH.open === k, body = "";
    if (n >= 3 && !open) {
      var face = k === "text" ? '<span class="aa" aria-hidden="true">Aa</span>' : k === "theme" ? dot() : ic(SH.bell ? "bell" : "bellx", 22);
      var nm = k === "text" ? "Text size: " + tsLabel(SH.ts) : k === "theme" ? "Theme: " + themeName() : "Household activity bell: " + (SH.bell ? "On" : "Off");
      body = '<button type="button" class="chipb" data-a="open:' + k + '" aria-expanded="false" aria-label="' + esc(nm) + '. Open.">' + face + "</button>";
    } else {
      var small = n >= 2;
      if (k === "text") body = '<div class="ctrl text' + (small ? " small" : "") + '"><span class="clab"><b>Text size</b><span class="cval">' + esc(tsLabel(SH.ts)) + "</span></span>" + stepper() + "</div>";
      else if (k === "theme") body = '<div class="ctrl theme' + (small && !open ? " small" : "") + '">' + (small && !open ? '<span class="clab"><b>Theme</b>' + modeCycle() + "</span>" : "") + '<div class="tline">' + rotary() + (small ? (open ? modeCycle() : "") : modeSeg()) + "</div></div>";
      else body = '<div class="ctrl bell' + (small ? " small" : "") + '" data-ctl="bell"><span class="clab"><b>Household activity bell</b><span class="cval">' + (SH.bell ? "On" : "Off") + "</span></span>" + sw("bell", SH.bell, "Household activity bell") + "</div>";
    }
    return '<div class="pin' + (open ? " open" : "") + '" data-k="' + k + '">' + body + "</div>";
  }
  Pp.pinsHtml = function () {
    var list = orderedPins(), n = list.length;
    if (!n) return "";
    return '<div class="pins' + (SH.open ? " hasopen" : "") + '" data-n="' + n + '" role="group" aria-label="Quick controls">' + list.map(function (k) { return pinHtml(k, n); }).join("") + "</div>";
  };
  Pp.drawPins = function () { var old = $(".pins", this.bd), nw = this.pinsHtml(); if (!old) { this.draw(); return; } var w = document.createElement("div"); w.innerHTML = nw; old.replaceWith(w.firstChild); placeRotaries(this.el); };
  Pp.frontHtml = function () {
    var looksV = themeName();
    return '<button type="button" class="looksrow" data-a="pg:looks"><i class="lead" aria-hidden="true">' + ic("looks", 20) + '</i><span class="nm">Looks</span><span class="val">' + esc(looksV) + "</span>" + chev() + "</button>" + this.pinsHtml() +
      '<ul class="list main">' + navRow("household", "Household", SH.hh, "home") + navRow("preferences", "Preferences", VALS.avoids, "sliders") + navRow("kitchen", "Kitchen setup", "Claude connected", "pot") + "</ul>";
  };

  /* ---------- Looks: the three pinnable controls, each with an icon-only pin ---------- */
  function pinBtn(k) {
    var on = pinned(k);
    return '<button type="button" class="pinb" data-a="pin:' + k + '" aria-pressed="' + on + '" aria-label="' + (on ? "Unpin " : "Pin ") + CTLS[k] + (on ? " from" : " to") + ' the Settings front" title="' + (on ? "Pinned" : "Pin") + '">' + ic("pin", 22, on) + "</button>";
  }
  Pp.looksHtml = function () {
    var ph = this;
    function fl(id) { return ph.flash === id ? " flash" : ""; }
    return '<ul class="list looks">' +
      '<li class="prow lrow' + fl("theme") + '" data-id="theme"><span class="lc"><b class="nm">Theme</b><span class="sub">' + esc(themeName()) + '</span></span><span class="lx">' + rotary() + "</span>" + pinBtn("theme") + "</li>" +
      '<li class="prow lrow' + fl("mode") + '" data-id="mode"><span class="lc"><b class="nm">Light or dark</b></span><span class="lx">' + modeSeg() + '</span><span class="pinb ph" aria-hidden="true"></span></li>' +
      '<li class="prow lrow' + fl("text") + '" data-id="text"><span class="lc"><b class="nm">Text size</b><span class="sub">' + esc(tsLabel(SH.ts)) + '</span></span><span class="lx">' + stepper() + "</span>" + pinBtn("text") + "</li>" +
      '<li class="prow lrow' + fl("bell") + '" data-id="bell" data-ctl="bell"><span class="lc"><b class="nm">Household activity bell</b><span class="sub">' + (SH.bell ? "On" : "Off") + '</span></span><span class="lx sx">' + sw("bell", SH.bell, "Household activity bell") + "</span>" + pinBtn("bell") + "</li></ul>" + ph.extraHtml();
  };

  /* ---------- other pages (static lists, so no search engine is needed to open them) ---------- */
  var PREF = [["Stock checks", [["checks", "Ask me to check amounts", "sw"], ["quiet", "Quiet hours"], ["cap", "Most suggestions per day"]]], ["Food", [["avoids", "Food avoids"], ["likes", "Dislikes and likes"], ["subs", "Substitutions"], ["notes", "Notes for the assistant"], ["props", "Housemate proposals"]]]];
  var KITCHEN = [["Kitchen", [["cats", "Categories"], ["locs", "Locations and spots"]]], ["Assistants", [["claude", "Claude"], ["chatgpt", "ChatGPT"], ["gemini", "Gemini"]]]];
  function valOf(id) { return val({ val: id }); }
  Pp.listRow = function (r) {
    var ph = this, id = r[0], v = valOf(id), flash = ph.flash === id ? " flash" : "";
    if (r[2] === "sw") return '<li class="prow' + flash + '" data-id="' + id + '"><div class="rline"><span class="rm"><span class="nm">' + esc(r[1]) + '</span></span><span class="rc">' + sw("checks", SH.checks, r[1]) + "</span></div></li>";
    var conn = (id === "claude" || id === "chatgpt" || id === "gemini") ? '<i class="cdot' + (v === "Connected" ? " on" : "") + '" aria-hidden="true"></i>' : "";
    return '<li class="prow' + flash + '" data-id="' + id + '"><button type="button" class="rb" data-a="soon:' + esc(r[1]) + '"><span class="nm">' + esc(r[1]) + '</span><span class="val">' + conn + esc(v) + "</span>" + chev() + "</button></li>";
  };
  Pp.groupsHtml = function (groups) {
    var ph = this;
    return groups.map(function (g) { return '<p class="gh">' + esc(g[0]) + '</p><ul class="list">' + g[1].map(function (r) { return ph.listRow(r); }).join("") + "</ul>"; }).join("") + ph.extraHtml();
  };
  Pp.householdHtml = function () {
    var ph = this, inv = SH.invite;
    var me = '<li class="prow person" data-id="me"><button type="button" class="rb" data-a="pg:you"><i class="av" aria-hidden="true">' + esc(SH.me.trim().charAt(0).toUpperCase() || "A") + '</i><span class="rm"><span class="nm">' + esc(SH.me) + '</span><span class="sub">You, admin</span></span>' + chev() + "</button></li>";
    var others = [["Sam", "Admin"], ["Jo", "Member"]].map(function (p) { return '<li class="prow person"><div class="rline"><i class="av" aria-hidden="true">' + p[0][0] + '</i><span class="rm"><span class="nm">' + p[0] + '</span><span class="sub">' + p[1] + "</span></span></div></li>"; }).join("");
    return '<label class="field' + (ph.flash === "hh" ? " flash" : "") + '"><span class="fl">Household name</span><input class="in" data-hh value="' + esc(SH.hh) + '" maxlength="40" autocomplete="off"></label>' +
      '<ul class="list people">' + me + others + "</ul>" +
      '<div class="invite' + (ph.flash === "invite" ? " flash" : "") + '" data-id="invite"><button type="button" class="pbtn go" data-a="invite">' + ic("copy", 20) + "<span>Copy invite link</span></button>" + (inv ? '<p class="link" data-invite><b>' + esc(inv) + '</b><span class="sub">Works for 7 days. Anyone with it can join.</span></p>' : "") + "</div>" +
      '<ul class="list"><li class="prow' + (ph.flash === "history" ? " flash" : "") + '" data-id="history"><button type="button" class="rb" data-a="soon:History"><span class="nm">History</span><span class="val">Last 7 days</span>' + chev() + "</button></li></ul>" + ph.extraHtml();
  };
  Pp.youHtml = function () {
    var ph = this;
    return '<div class="who"><i class="big-av" aria-hidden="true">' + esc(SH.me.trim().charAt(0).toUpperCase() || "A") + '</i></div>' +
      '<label class="field' + (ph.flash === "me" ? " flash" : "") + '" data-id="me"><span class="fl">Your name</span><input class="in" data-me value="' + esc(SH.me) + '" maxlength="30" autocomplete="off" autocapitalize="words"></label>' +
      '<ul class="list"><li class="prow' + (ph.flash === "role" ? " flash" : "") + '" data-id="role"><button type="button" class="rb" data-a="soon:Kitchen role"><span class="nm">Kitchen role</span><span class="val">' + VALS.role + "</span>" + chev() + '</button></li>' +
      '<li class="prow"><button type="button" class="rb" data-a="soon:Picture"><span class="nm">Picture</span><span class="val">Your initial</span>' + chev() + "</button></li></ul>" + ph.extraHtml();
  };
  /* a setting that no page lists (search only) is shown under the page it belongs to, with one honest line */
  var LISTED = { looks: ["theme", "mode", "text", "bell"], household: ["hh", "members", "invite", "history"], you: ["me", "role"], preferences: ["checks", "quiet", "cap", "avoids", "likes", "subs", "notes", "props", "prefs"], kitchen: ["cats", "locs", "claude", "chatgpt", "gemini"] };
  Pp.extraHtml = function () {
    var ph = this, id = ph.opened, e = id && S.entry(id);
    if (!e || LISTED[ph.page].indexOf(id) > -1 || landing(e) !== ph.page) return "";
    var c = ctlHtml(e);
    return '<p class="gh">Opened from search</p><ul class="list"><li class="prow flash" data-id="' + e.id + '"><div class="rline"><span class="rm"><span class="nm">' + esc(e.t) + '</span><span class="sub">Only search finds this one.</span></span>' + (c ? '<span class="rc">' + c + "</span>" : "") + "</div></li></ul>";
  };
  Pp.pageHtml = function () {
    var p = this.page;
    if (p === "front") return this.frontHtml();
    if (p === "looks") return this.looksHtml();
    if (p === "household") return this.householdHtml();
    if (p === "you") return this.youHtml();
    if (p === "preferences") return this.groupsHtml(PREF);
    return this.groupsHtml(KITCHEN);
  };

  /* ---------- search: layout C ---------- */
  function hl(text, use) {
    if (!use || !use.length) return esc(text);
    return String(text).split(/([A-Za-z0-9’']+)/).map(function (p, i) {
      if (i % 2 === 0) return esc(p);
      var lw = S.words(p)[0] || "";
      return lw && use.some(function (u) { return u.length >= 2 && (lw === u || lw.indexOf(u) === 0 || u.indexOf(lw) === 0 && lw.length >= 3); }) ? "<mark>" + esc(p) + "</mark>" : esc(p);
    }).join("");
  }
  /* plain text with a thin dotted underline, the history-search suggestion style: no pill */
  function sg(t) { return '<button type="button" class="sg" data-a="q:' + esc(t) + '">' + esc(t) + "</button>"; }
  Pp.emptyHtml = function () {
    var ph = this, rc = SH.recents.slice(0, 3), ex = SUGGEST[ph.ctx] || SUGGEST.front;
    return '<div class="emp" data-empty-search>' + (rc.length ? '<p class="lead2">Recent</p><div class="sgl" data-kind="recent">' + rc.map(sg).join("") + "</div>" : '<p class="lead2">Try</p><div class="sgl" data-kind="examples">' + ex.map(sg).join("") + "</div>") + "</div>";
  };
  function bestCard(e, use) {
    var c = ctlHtml(e), go = !c && !e.info && landing(e) !== "app" ? '<button type="button" class="pbtn go" data-a="go:' + e.id + '">Go there</button>' : "";
    var desc = DESC[e.id] || String(e.aff).split(/[.:]/)[0] + ".";
    return '<section class="best" data-id="' + e.id + '" aria-label="Best match"><h3 class="nm">' + hl(e.t, use) + '</h3><p class="at">' + esc(placeOf(e)) + '</p><p class="desc">' + esc(desc) + "</p>" + (c ? '<div class="bctl">' + c + "</div>" : go ? '<div class="bctl">' + go + "</div>" : "") + "</section>";
  }
  Pp.resRow = function (e, use) {
    var v = val(e), at = '<span class="at">' + esc(placeOf(e)) + "</span>", nm = '<span class="nm">' + hl(e.t, use) + "</span>", ln = '<span class="ln">' + nm + at + "</span>";
    if (e.ctl === "bell" || e.ctl === "motion" || e.ctl === "rows" || e.ctl === "checks") return '<li class="prow" data-id="' + e.id + '"><div class="rline">' + ln + '<span class="rc">' + ctlHtml(e) + "</span></div></li>";
    if (e.ctl === "themepick") return '<li class="prow" data-id="' + e.id + '"><button type="button" class="rb" data-a="theme:' + e.id.slice(3) + '">' + dot(e.id.slice(3)) + ln + (e.id.slice(3) === curTheme() ? '<span class="val">' + ic("check", 18) + "</span>" : "") + "</button></li>";
    if (e.info) return '<li class="prow" data-id="' + e.id + '"><div class="rline">' + ln + "</div></li>";
    return '<li class="prow" data-id="' + e.id + '"><button type="button" class="rb" data-a="go:' + e.id + '">' + ln + (v ? '<span class="val">' + esc(v) + "</span>" : "") + chev() + "</button></li>";
  };
  Pp.searchHtml = function () {
    var ph = this, q = ph.q.trim();
    if (!q) return ph.emptyHtml();
    if (!S.ready()) return '<p class="hint" data-loading>Loading…</p>';
    var r = S.run(q, ph.ctx, pageOf), use = r.use;
    /* this page's matches come first, but only real ones: a weak match (under half the best score) does not jump the queue */
    var all = r.on.concat(r.rest), top = all.reduce(function (m, x) { return Math.max(m, x.s); }, 0);
    var strong = r.on.filter(function (x) { return x.s >= top * 0.5; }), others = all.filter(function (x) { return strong.indexOf(x) < 0; }).sort(function (a, b) { return b.s - a.s; });
    var list = strong.concat(others);
    if (!list.length) return '<div class="none" data-empty><p class="big">Nothing matches “' + esc(q) + '”</p><div class="sgl">' + ["theme", "text size", "household", "quiet hours"].map(sg).join("") + "</div></div>";
    /* the Theme result already carries the rotary, so the ten theme-name results stay out of its way (a search for a theme's own name still finds that theme) */
    if (list.some(function (x) { return x.e.id === "theme"; })) list = list.filter(function (x) { return x.e.ctl !== "themepick"; });
    var html = r.fixed ? '<p class="fix" data-fixed>Showing results for <b>' + esc(r.fixed) + "</b></p>" : "";
    html += bestCard(list[0].e, use);
    var rest = list.slice(1), take = rest.slice(0, ph.limit - 1);
    if (take.length) html += '<ul class="list res">' + take.map(function (x) { return ph.resRow(x.e, use); }).join("") + "</ul>";
    if (rest.length > take.length) html += '<button type="button" class="more" data-a="more">More</button>';
    return html;
  };

  Pp.draw = function () {
    var ph = this, top = ph.bd.scrollTop;
    ph.bd.innerHTML = ph.searching ? ph.searchHtml() : ph.pageHtml();
    ph.bd.scrollTop = top;
    placeRotaries(ph.el);
    if (ph.flash) { var f = $(".flash", ph.bd); if (f && f.scrollIntoView) f.scrollIntoView({ block: "center" }); var fl = ph.flash; setTimeout(function () { if (ph.flash === fl) ph.flash = null; }, 2400); }
    ph.chrome();
  };

  /* ---------- the rotary: position, drag, keys ---------- */
  function placeRotary(r, animate) {
    var tr = $(".rtrack", r), items = $$(".rit", r), i = Math.max(0, THEME_IDS.indexOf(curTheme()));
    if (!items.length) return;
    var W = items[0].offsetWidth, gap = 8, x = r.clientWidth / 2 - (i * (W + gap) + W / 2);
    if (!animate) tr.classList.add("snap"); tr.style.transform = "translateX(" + x + "px)"; tr.setAttribute("data-x", x);
    if (!animate) { void tr.offsetWidth; tr.classList.remove("snap"); }
    items.forEach(function (it, n) { it.classList.toggle("cur", n === i); });
    r.setAttribute("aria-valuenow", String(i + 1)); r.setAttribute("aria-valuetext", themeName() + ". Swipe sideways for more.");
  }
  function placeRotaries(el) { $$(".rot", el).forEach(function (r) { placeRotary(r, false); }); }

  /* long hold, then drag, moves a pinned control; swipe sideways spins the rotary; neither has a button */
  function gestures(ph) {
    var rd = null, hold = null, mv = null, warmed = false;
    function cancelHold() { clearTimeout(hold); hold = null; }
    ph.el.addEventListener("contextmenu", function (ev) { if (ev.target.closest(".pins")) ev.preventDefault(); });
    ph.el.addEventListener("pointerdown", function (ev) {
      if (ev.button) return;
      var r = ev.target.closest(".rot");
      if (r) {
        if (!warmed && window.themeWarm) { warmed = true; window.themeWarm(); }
        var items = $$(".rit", r), W = items[0].offsetWidth;
        rd = { el: r, tr: $(".rtrack", r), x0: ev.clientX, x: parseFloat($(".rtrack", r).getAttribute("data-x")) || 0, W: W + 8, idx: Math.max(0, THEME_IDS.indexOf(curTheme())), moved: false, id: ev.pointerId };
        rd.cur = rd.idx;
      }
      var pin = ev.target.closest(".pin"), pins = pin && pin.parentNode;
      if (pin && pins.classList.contains("pins") && pins.children.length > 1 && !ev.target.closest(".sw")) {
        var sx = ev.clientX, sy = ev.clientY;
        cancelHold();
        hold = setTimeout(function () {
          hold = null; rd = null;
          var rect = pin.getBoundingClientRect();
          mv = { pin: pin, pins: pins, grab: sx - rect.left, id: ev.pointerId };
          pins.classList.add("moving"); pin.classList.add("lift");
          try { pins.setPointerCapture(ev.pointerId); } catch (e) { /* pointer may be gone */ }
          if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) { /* not available */ } }
          dragging = true; place(sx);
        }, 480);
        pin._hx = sx; pin._hy = sy;
      }
    });
    function place(clientX) {
      var p = mv.pin; p.style.transform = "translateX(0)";
      var base = p.getBoundingClientRect().left, want = clientX - mv.grab;
      p.style.transform = "translateX(" + (want - base) + "px)";
      var c = want + p.offsetWidth / 2, sibs = Array.prototype.slice.call(mv.pins.children), me = sibs.indexOf(p);
      var nx = sibs[me + 1], pv = sibs[me - 1];
      if (nx) { var nr = nx.getBoundingClientRect(); if (c > nr.left + nr.width / 2) { mv.pins.insertBefore(nx, p); place(clientX); return; } }
      if (pv) { var pr = pv.getBoundingClientRect(); if (c < pr.left + pr.width / 2) { mv.pins.insertBefore(p, pv); place(clientX); return; } }
    }
    ph.el.addEventListener("pointermove", function (ev) {
      if (mv) { ev.preventDefault(); place(ev.clientX); return; }
      var pin = ev.target.closest && ev.target.closest(".pin");
      if (hold && pin && (Math.abs(ev.clientX - (pin._hx || 0)) > 8 || Math.abs(ev.clientY - (pin._hy || 0)) > 8)) cancelHold();
      if (!rd) return;
      var dx = ev.clientX - rd.x0;
      if (!rd.moved) { if (Math.abs(dx) < 8) return; rd.moved = true; cancelHold(); dragging = true; try { rd.el.setPointerCapture(rd.id); } catch (e) { /* pointer may be gone */ } rd.tr.classList.add("snap"); }
      rd.tr.style.transform = "translateX(" + (rd.x + dx) + "px)";
      var n = Math.max(0, Math.min(THEME_IDS.length - 1, Math.round(rd.idx - dx / rd.W)));
      if (n !== rd.cur) { rd.cur = n; var id = THEME_IDS[n]; pickTheme(id); SH.mode = isLight(id) ? "light" : "dark"; $$(".rit", rd.el).forEach(function (it, k) { it.classList.toggle("cur", k === n); }); rd.el.setAttribute("aria-valuenow", String(n + 1)); rd.el.setAttribute("aria-valuetext", LOOKS[id][0]); if (navigator.vibrate) { try { navigator.vibrate(4); } catch (e) { /* not available */ } } }
    });
    function end() {
      cancelHold();
      if (mv) {
        var pins = mv.pins; mv.pin.classList.remove("lift"); mv.pin.style.transform = ""; pins.classList.remove("moving");
        var ks = Array.prototype.slice.call(pins.children).map(function (c) { return c.getAttribute("data-k"); });
        var rest = SH.order.filter(function (k) { return ks.indexOf(k) < 0; });
        SH.order = ks.concat(rest); SH.pins = ks.slice();
        noClick = Date.now() + 350; mv = null; dragging = false; ph.toast("Moved."); ph.draw(); return;
      }
      if (rd) {
        var was = rd; rd = null;
        if (was.moved) { was.tr.classList.remove("snap"); noClick = Date.now() + 120; dragging = false; syncAll(); }
      }
    }
    ph.el.addEventListener("pointerup", end);
    ph.el.addEventListener("pointercancel", end);
    /* tap a neighbour to bring it to the middle; keys for access */
    ph.el.addEventListener("click", function (ev) {
      var it = ev.target.closest(".rit"); if (!it || it.classList.contains("cur") || !ph.el.contains(it)) return;
      var id = it.getAttribute("data-id"); if (ph.searching) ph.record(); pickTheme(id); SH.mode = isLight(id) ? "light" : "dark"; syncAll();
    });
    ph.el.addEventListener("keydown", function (ev) {
      var r = ev.target.closest && ev.target.closest(".rot"); if (!r) return;
      var d = ev.key === "ArrowRight" || ev.key === "ArrowUp" ? 1 : ev.key === "ArrowLeft" || ev.key === "ArrowDown" ? -1 : 0; if (!d) return;
      ev.preventDefault(); var n = Math.max(0, Math.min(9, THEME_IDS.indexOf(curTheme()) + d)); pickTheme(THEME_IDS[n]); SH.mode = isLight(THEME_IDS[n]) ? "light" : "dark"; syncAll(); var again = $(".rot", ph.el); if (again) again.focus();
    });
  }

  function syncAll() { if (!phone || dragging) return; phone.chrome(); phone.draw(); syncBar(); }
  new MutationObserver(function () { if (dragging) { /* keep the rotary in the finger's hand; it redraws on release */ return; } syncAll(); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- the state switcher at the top of the page ---------- */
  var PRESETS = { results: "text size", goto: "quiet hours", nomatch: "flux capacitor" };
  function syncBar() {
    var s = $("#st-screen"), sr = $("#st-search"), pn = $("#st-pins"); if (!s || !phone) return;
    s.value = phone.page; pn.value = String(SH.pins.length);
    var v = "off";
    if (phone.searching) { v = "custom"; if (!phone.q) v = SH.recents.length ? "last3" : "examples"; else Object.keys(PRESETS).forEach(function (k) { if (PRESETS[k] === phone.q) v = k; }); }
    sr.value = v;
  }
  function bindBar() {
    var s = $("#st-screen"), sr = $("#st-search"), pn = $("#st-pins"); if (!s) return;
    s.addEventListener("change", function () { SH.open = null; if (phone.searching) phone.end(); phone.stack = []; phone.goPage(s.value); });
    pn.addEventListener("change", function () { var n = parseInt(pn.value, 10); SH.pins = DEFAULT_ORDER.slice(0, n); SH.order = DEFAULT_ORDER.slice(); SH.open = null; if (phone.searching) phone.end(); phone.goPage("front"); });
    sr.addEventListener("change", function () {
      var v = sr.value; phone.stack = [];
      if (v === "off") { if (phone.searching) phone.end(); return; }
      if (v === "examples") { SH.recents = []; phone.q = ""; phone.begin(); phone.set("", false); return; }
      if (v === "last3") { SH.recents = LAST3.slice(); phone.q = ""; phone.begin(); phone.set("", false); return; }
      if (PRESETS[v]) { phone.set(PRESETS[v], false); }
    });
  }

  window.SHAKE = { Phone: Phone, SH: SH, S: S, syncAll: syncAll, pageOf: pageOf, PAGES: PAGES, TS_PCT: TS_PCT, applyMode: applyMode, applyScale: applyScale, bindBar: bindBar, syncBar: syncBar, PRESETS: PRESETS, get phone() { return phone; } };
})();
