/* (A, B and C as first drawn; B was chosen and refined in shake.js. Kept for the record.) Settings shake-up: three phone directions, all playable. Phone only. Mockup only: nothing here is built.
     A  Just the list          one flat list with the current value on every row; the three looks controls sit in the list itself
     B  Search is the front door  a big search, two quick-control rows (theme, light or dark, text size) and three plain rows
     C  Control strip + short list  a thin strip of the same controls that stays on every Settings page, then four plain rows
   All three share the real search index (../settings-redesign/search-index.js, loaded on engagement) and the page-scoped ranking of settings-search-results.
   Theme and light or dark act on the whole mockup page (theme.js tokens); text size scales the phone (--ts), as the built Text size will scale the app.
   Class names are plain so the CSS (shake.css) can be lifted into the app. Everything drawn from the index is escaped. */
(function () {
  "use strict";
  /* the search engine (shake-search.js) is fetched on engagement: first focus of a search box, a typed letter, or a sub page that needs the index */
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
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- icons (stroke, currentColor) ---------- */
  var P = {
    back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>', chevd: '<path d="M6 9l6 6 6-6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>', auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 010 16z" fill="currentColor"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function ic(n, s) { return '<svg class="i" width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>"; }

  /* ---------- the ten themes: name, background, card, accent, text (the same five colours the Settings option E tiles draw) ---------- */
  var LOOKS = { "kitchie": ["Kitchie Night", "#0F1E19", "#172A23", "#F2B84B", "#F3EEE3"], "kitchie-day": ["Kitchie Day", "#F6F1E6", "#FFFFFF", "#8A5600", "#1D2A24"], "marmalade": ["Marmalade", "#FBF1E3", "#FFFFFF", "#C2410C", "#3A2412"], "blueberry": ["Blueberry", "#14142B", "#1D1D3D", "#F48FB1", "#EEEBFF"], "herb": ["Herb Garden", "#EEF4E6", "#FFFFFF", "#2F7D32", "#1B2E1B"], "cappuccino": ["Cappuccino", "#F3E9DD", "#FFFFFF", "#8B5A2B", "#33261B"], "tokyo-midnight": ["Tokyo Midnight", "#0B0F1E", "#141A30", "#5CE1E6", "#E8ECFF"], "paprika": ["Paprika", "#1F1410", "#2B1D17", "#FF8A4C", "#F7E9DD"], "sea-salt": ["Sea Salt", "#EAF2F4", "#FFFFFF", "#0F766E", "#12313A"], "lavender-fog": ["Lavender Fog", "#F1EEF7", "#FFFFFF", "#6D28D9", "#2A2340"] };
  var THEME_IDS = Object.keys(LOOKS);

  /* ---------- text size: seven steps centred on "Match my phone" (owner, 24 Oct): -8, -16, -24 and +10, +20, +30 percent of the phone's own size ---------- */
  var TS_PCT = { "-3": -24, "-2": -16, "-1": -8, "0": 0, "1": 10, "2": 20, "3": 30 };
  function tsLabel(n) { return n === 0 ? "Match my phone" : (n < 0 ? "Smaller " : "Larger ") + (n > 0 ? "+" : "−") + Math.abs(TS_PCT[n]) + "%"; }
  function tsShort(n) { return n === 0 ? "Match my phone" : (n > 0 ? "+" : "−") + Math.abs(TS_PCT[n]) + "%"; }
  var MODES = [["system", "System", "auto"], ["light", "Light", "sun"], ["dark", "Dark", "moon"]];

  /* ---------- state shared by every phone on the page (they stand for one device) ---------- */
  var SH = { mode: "system", ts: 0, names: false, motion: false, bell: true, checks: true, hh: "Henderson kitchen", invite: null, recents: ["bigger text", "invite someone"] };
  var VALS = { me: "Alex", role: "Sous chef", members: "3 people", invite: "", cats: "12", locs: "4", gemini: "Not connected", quiet: "22:00 to 06:00", cap: "3 a day", rules: "2 custom", stops: "2 switched off", avoids: "1 hard, 2 soft", likes: "4 likes", subs: "3 saved", notes: "2 notes", props: "1 waiting", tz: "From your phone", units: "None", install: "Not installed", sort: "Name", planoff: "Sat, Sun", history: "Last 7 days", claude: "Connected", chatgpt: "Not connected", defassist: "Claude", samples: "4 left" };
  var SCOPE = { device: "this phone", member: "just you", household: "everyone", account: "your account", info: "not a setting" };
  var PAGES = { front: "Settings", household: "Household", kitchen: "Kitchen setup", preferences: "Preferences", assistants: "Assistants" };
  var SUGGEST = { front: ["bigger text", "dark mode", "invite someone", "stop the questions"], household: ["invite someone", "remove someone", "someone changed", "household name"], kitchen: ["categories", "locations", "sample items"], preferences: ["quiet hours", "stop the questions", "food rules"], assistants: ["connect Claude", "disconnect", "which assistant"] };

  /* ---------- the device's looks ---------- */
  function curTheme() { return document.documentElement.getAttribute("data-theme") || "kitchie"; }
  function themeName(id) { return (LOOKS[id || curTheme()] || LOOKS.kitchie)[0]; }
  function pickTheme(id) {
    var b = document.createElement("button"); b.hidden = true; b.setAttribute("data-theme-pick", id); document.body.appendChild(b); b.click(); b.remove();
  }
  function applyMode() {
    var m = SH.mode; if (m === "system") m = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    pickTheme(m === "light" ? "kitchie-day" : "kitchie");
  }
  function dot(id) { var l = LOOKS[id] || LOOKS.kitchie; return '<i class="swdot" style="--pbg:' + l[1] + ';--pac:' + l[3] + '" aria-hidden="true"></i>'; }
  function tile(id) {
    var l = LOOKS[id], on = id === curTheme();
    return '<button type="button" class="tp" role="radio" aria-checked="' + on + '" data-a="theme:' + id + '" aria-label="' + esc(l[0]) + '"><i class="tprev" style="--pbg:' + l[1] + ";--pcd:" + l[2] + ";--pac:" + l[3] + ";--pfg:" + l[4] + '" aria-hidden="true"><b></b><s></s><u></u></i><span class="tname" aria-hidden="true">' + esc(l[0]) + "</span></button>";
  }
  function themePanel() { return '<div class="tpanel" role="radiogroup" aria-label="Theme">' + THEME_IDS.map(tile).join("") + "</div>"; }
  function themeStrip() { return '<div class="tscroll" role="radiogroup" aria-label="Theme, swipe sideways for more">' + THEME_IDS.map(tile).join("") + "</div>"; }

  /* ---------- controls ---------- */
  function modeSeg() {
    return '<div class="mseg" role="radiogroup" aria-label="Light or dark">' + MODES.map(function (m) {
      return '<button type="button" role="radio" aria-checked="' + (SH.mode === m[0]) + '" data-a="mode:' + m[0] + '" aria-label="' + m[1] + '" title="' + m[1] + '">' + ic(m[2], 22) + "</button>";
    }).join("") + "</div>";
  }
  function modeCycle() {
    var i = MODES.map(function (m) { return m[0]; }).indexOf(SH.mode), nx = MODES[(i + 1) % 3], cu = MODES[i];
    return '<button type="button" class="ibtn" data-a="mode:' + nx[0] + '" aria-label="Light or dark: ' + cu[1] + ". Tap for " + nx[1] + '" title="' + cu[1] + '">' + ic(cu[2], 24) + "</button>";
  }
  function tbtn(d) {
    var dis = (d < 0 && SH.ts <= -3) || (d > 0 && SH.ts >= 3);
    return '<button type="button" class="tbtn" data-a="ts:' + d + '" aria-label="' + (d < 0 ? "Smaller text" : "Larger text") + '" aria-disabled="' + dis + '"><span class="ta' + (d > 0 ? " big" : "") + '" aria-hidden="true">A</span><span class="tpm" aria-hidden="true">' + (d < 0 ? "−" : "+") + "</span></button>";
  }
  function tpair() { return '<span class="tpair" role="group" aria-label="Text size">' + tbtn(-1) + tbtn(1) + "</span>"; }
  function tstep() {
    var dots = ""; for (var i = -3; i <= 3; i++) dots += '<i class="tdot' + (i === SH.ts ? " on" : "") + (i === 0 ? " mid" : "") + '"></i>';
    return '<div class="tstep" role="group" aria-label="Text size">' + tbtn(-1) + '<div class="tmid" role="status" aria-label="' + esc(tsLabel(SH.ts)) + '"><b class="tlab" aria-hidden="true">' + esc(tsLabel(SH.ts)) + '</b><span class="tdots" aria-hidden="true">' + dots + "</span></div>" + tbtn(1) + "</div>";
  }
  function sw(key, on, label) { return '<label class="sw"><input type="checkbox" role="switch" data-a="tog:' + key + '"' + (on ? " checked" : "") + ' aria-label="' + esc(label) + '"><i class="swt" aria-hidden="true"></i></label>'; }
  function val(e) {
    switch (e.val) {
      case "theme": return themeName();
      case "mode": return { system: "System", light: "Light", dark: "Dark" }[SH.mode];
      case "text": return tsShort(SH.ts);
      case "rows": return SH.names ? "Names only" : "Standard";
      case "motion": return SH.motion ? "Reduced" : "Follows phone";
      case "bell": return SH.bell ? "On" : "Off";
      case "checks": return SH.checks ? "On" : "Off";
      case "hh": return SH.hh;
      default: return VALS[e.val] || "";
    }
  }
  /* the inline control of a result or page row; "line" controls sit under the name */
  function ctl(e) {
    switch (e.ctl) {
      case "mode": return { c: modeSeg() };
      case "text": return { c: tpair() };
      case "bell": return { c: sw("bell", SH.bell, e.t) };
      case "motion": return { c: sw("motion", SH.motion, e.t) };
      case "rows": return { c: sw("names", SH.names, "Names only") };
      case "checks": return { c: sw("checks", SH.checks, e.t) };
      case "reset": return { c: '<button type="button" class="pbtn" data-a="reset">Reset</button>' };
      case "theme": return { line: themeStrip() };
      case "themepick": return { line: '<div class="tscroll one" role="radiogroup" aria-label="' + esc(e.t) + '">' + tile(e.tid) + "</div>" };
    }
    return {};
  }

  /* ---------- where things live in each direction ---------- */
  function pageOf(e, opt) {
    var g = e.g;
    if (e.id === "history" || e.id === "bell") return "household";
    if (g === "Looks" || g === "Text and rows" || g === "Theme names") return opt === "C" ? "*" : "front";
    if (g === "Household") return "household";
    if (g === "Kitchen setup") return opt === "B" ? "household" : "kitchen";
    if (g === "Preferences" || g === "Food") return "preferences";
    if (g === "Assistants") return "assistants";
    return "app";
  }
  var FRONT = {
    A: [[["pg", "preferences", "Preferences"], ["pg", "household", "Household", "hh"], ["pg", "kitchen", "Kitchen setup"], ["pg", "assistants", "Assistants", "claude"]]],
    B: [[["pg", "household", "Household", "hh"], ["pg", "preferences", "Preferences"], ["pg", "assistants", "Assistants", "claude"]]],
    C: [[["pg", "preferences", "Preferences"], ["pg", "assistants", "Assistants", "claude"]], [["pg", "household", "Household", "hh"], ["pg", "kitchen", "Kitchen setup"]]]
  };
  function crumb(e, opt) {
    var w = e.where.replace(/Settings › Looks( › Theme)?/, "Settings").replace(/^Search only$/, "Search only");
    if (opt === "B") w = w.replace(/^Kitchen setup/, "Household");
    return w.replace(/ ?\(search only\)/, "");
  }

  /* ---------- the phone ---------- */
  var phones = [];
  function Phone(host, opt) {
    var ph = this; ph.opt = opt; ph.page = "front"; ph.q = ""; ph.searching = false; ph.stack = []; ph.panel = null; ph.flash = null; ph.limit = 8; ph.opened = null;
    ph.el = document.createElement("div"); ph.el.className = "phone"; ph.el.setAttribute("data-opt", opt);
    ph.el.innerHTML =
      '<header class="hd"><button type="button" class="bk" data-a="back"></button><h3 class="ttl"></h3><button type="button" class="ibtn" data-a="opensearch" aria-label="Search settings">' + ic("search", 22) + "</button></header>" +
      '<div class="strip" role="toolbar" aria-label="Quick controls" hidden></div>' +
      '<div class="sb"><label class="find">' + ic("search", 20) + '<input type="search" data-eq placeholder="Search settings" aria-label="Search settings" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="clr" data-a="clear" aria-label="Clear search">' + ic("x", 18) + '</button></label><button type="button" class="cancel" data-a="cancel">Cancel</button></div>' +
      '<div class="bd" data-bd></div><div class="toast" role="status" aria-live="polite" hidden></div>';
    host.appendChild(ph.el); phones.push(ph);
    ph.inp = $("[data-eq]", ph.el); ph.bd = $("[data-bd]", ph.el);
    ph.inp.addEventListener("focus", function () { if (!ph.searching) ph.begin(); S.load(function () { ph.draw(); }); });
    ph.inp.addEventListener("input", function () { ph.q = ph.inp.value; ph.limit = 8; S.load(function () { ph.draw(); }); ph.draw(); ph.chrome(); });
    ph.inp.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { if (ph.q) ph.set(""); else ph.end(); } });
    ph.el.addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-a]"); if (!t || !ph.el.contains(t) || t.type === "checkbox") return;
      if (t.getAttribute("aria-disabled") === "true") return;
      ph.act(t.getAttribute("data-a"), t);
    });
    ph.el.addEventListener("change", function (ev) {
      var t = ev.target.closest("[data-a]"); if (!t || t.type !== "checkbox") return;
      var k = t.getAttribute("data-a").slice(4); SH[k] = t.checked; syncAll();
    });
    ph.el.addEventListener("input", function (ev) { if (ev.target.hasAttribute("data-hh")) SH.hh = ev.target.value || "Our kitchen"; });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && ph.panel && ph.el.contains(document.activeElement)) { ph.panel = null; ph.draw(); } });
    ph.chrome(); ph.draw();
  }
  var Pp = Phone.prototype;
  Pp.toast = function (m) { var t = $(".toast", this.el); t.textContent = m; t.hidden = false; clearTimeout(this._t); this._t = setTimeout(function () { t.hidden = true; }, 2600); };
  Pp.begin = function () { this.searching = true; this.ctx = this.page; this.panel = null; this.chrome(); };
  Pp.end = function () { this.searching = false; this.q = ""; this.inp.value = ""; this.stack = []; this.inp.blur(); this.chrome(); this.draw(); };
  Pp.set = function (q, focus) { var ph = this; if (!ph.searching) ph.begin(); ph.q = q; ph.inp.value = q; ph.limit = 8; S.load(function () { ph.draw(); }); ph.chrome(); ph.draw(); if (focus) ph.inp.focus({ preventScroll: true }); };
  Pp.goPage = function (p, flashId) { this.page = p; this.searching = false; this.flash = flashId || null; this.panel = null; this.opened = flashId || null; this.chrome(); this.draw(); this.bd.scrollTop = 0; var ph = this; if (p !== "front") S.load(function () { ph.draw(); }); };
  Pp.chrome = function () {
    var ph = this, front = ph.page === "front", s = ph.searching, o = ph.opt;
    ph.el.setAttribute("data-page", ph.page); ph.el.setAttribute("data-searching", String(s));
    $(".hd", ph.el).hidden = s;
    var fieldOnFront = o !== "C" && front;
    $(".sb", ph.el).hidden = !(s || fieldOnFront);
    $(".sb", ph.el).classList.toggle("on", s);
    $(".ttl", ph.el).textContent = PAGES[ph.page];
    var bk = $(".bk", ph.el); bk.hidden = false;
    bk.innerHTML = ic("back", 20) + "<span>" + (front ? "Back" : ph.stack.length ? "Results" : "Settings") + "</span>";
    bk.setAttribute("aria-label", front ? "Back to the app" : ph.stack.length ? "Back to search results" : "Back to Settings");
    $("[data-a=opensearch]", ph.el).hidden = fieldOnFront;
    $(".clr", ph.el).hidden = !ph.q;
    var strip = $(".strip", ph.el); strip.hidden = o !== "C";
    ph.el.style.setProperty("--ts", 1 + TS_PCT[SH.ts] / 100);
  };
  Pp.act = function (a, el) {
    var ph = this, m;
    if (a === "back") {
      if (ph.page === "front" && !ph.stack.length) { ph.toast("Back to the app (mockup)."); return; }
      if (ph.stack.length) { var s = ph.stack.pop(); ph.page = s.ctx; ph.searching = true; ph.ctx = s.ctx; ph.q = s.q; ph.inp.value = s.q; ph.flash = null; ph.chrome(); ph.draw(); }
      else { ph.page = "front"; ph.chrome(); ph.draw(); }
      return;
    }
    if (a === "opensearch") { ph.begin(); ph.chrome(); ph.inp.focus(); S.load(function () { ph.draw(); }); ph.draw(); return; }
    if (a === "cancel") { ph.end(); return; }
    if (a === "clear") { ph.set("", true); return; }
    if (a === "reset") { SH.mode = "system"; SH.ts = 0; SH.names = false; SH.motion = false; SH.bell = true; applyMode(); syncAll(); ph.toast("This phone's looks are back to normal. Household and Preferences are untouched."); return; }
    if (a === "more") { ph.limit += 100; ph.draw(); return; }
    if (a === "panel") { var k = el.getAttribute("data-k"); ph.panel = ph.panel === k ? null : k; ph.draw(); var f = $(".tpanel [aria-checked=true]", ph.bd) || $(".tpanel [aria-checked=true]", ph.el); if (ph.panel && f && f.scrollIntoView) f.scrollIntoView({ block: "nearest" }); return; }
    if (a === "invite") { SH.invite = "kitchie.app/join/K7QX-2M9P"; try { if (navigator.clipboard) navigator.clipboard.writeText("https://" + SH.invite).catch(function () { /* the link is still shown */ }); } catch (e) { /* the link is still shown */ } syncAll(); ph.toast("Invite link copied."); return; }
    if (a === "clear-recents") { SH.recents = []; syncAll(); return; }
    if ((m = /^q:(.*)$/.exec(a))) { ph.set(m[1], false); return; }
    if ((m = /^pg:(.*)$/.exec(a))) { ph.goPage(m[1]); return; }
    if ((m = /^theme:(.*)$/.exec(a))) { pickTheme(m[1]); if (ph.opt === "C" && ph.panel) ph.panel = null; return; }
    if ((m = /^mode:(.*)$/.exec(a))) { SH.mode = m[1]; applyMode(); syncAll(); return; }
    if ((m = /^ts:(-?1)$/.exec(a))) { SH.ts = Math.max(-3, Math.min(3, SH.ts + parseInt(m[1], 10))); syncAll(); ph.say(tsLabel(SH.ts)); return; }
    if ((m = /^go:(.*)$/.exec(a))) { ph.jump(m[1]); return; }
    if ((m = /^soon:(.*)$/.exec(a))) { ph.toast(m[1] + " opens its own screen in the app (not part of this mockup)."); return; }
  };
  Pp.say = function (t) { if (this.opt === "C") this.toast(t); };
  Pp.jump = function (id) {
    var ph = this, e = S.entry(id); if (!e) return;
    var pg = pageOf(e, ph.opt);
    if (pg === "app") { ph.toast(e.t + " lives in " + crumb(e, ph.opt).replace(/ ›.*/, "") + " in the app (not part of this mockup)."); return; }
    if (ph.q.trim()) SH.recents = [ph.q.trim()].concat(SH.recents.filter(function (r) { return r !== ph.q.trim(); })).slice(0, 3);
    ph.stack.push({ ctx: ph.ctx, q: ph.q }); ph.goPage(pg === "*" ? "front" : pg, id);
  };

  /* ---------- rows ---------- */
  function chev() { return '<span class="chev">' + ic("chev", 18) + "</span>"; }
  function navRow(pg, label, v) { return '<li class="prow"><button type="button" class="rb" data-a="pg:' + pg + '"><span class="nm">' + esc(label) + "</span>" + (v ? '<span class="val">' + esc(v) + "</span>" : "") + chev() + "</button></li>"; }
  /* a row on a page: tapping a plain row says where it goes (nothing deeper is mocked) */
  function pageRow(e, ph) {
    var c = ctl(e), v = val(e), flash = ph.flash === e.id;
    if (c.c) return '<li class="prow' + (flash ? " flash" : "") + '" data-id="' + e.id + '"><div class="rline"><span class="rm"><span class="nm">' + esc(e.t) + "</span>" + (v ? '<span class="sub">' + esc(v) + "</span>" : "") + '</span><span class="rc">' + c.c + "</span></div></li>";
    return '<li class="prow' + (flash ? " flash" : "") + '" data-id="' + e.id + '"><button type="button" class="rb" data-a="soon:' + esc(e.t) + '"><span class="nm">' + esc(e.t) + "</span>" + (v ? '<span class="val">' + esc(v) + "</span>" : "") + chev() + "</button></li>";
  }

  /* ---------- the front, per direction ---------- */
  Pp.frontHtml = function () {
    var ph = this, o = ph.opt, hh = SH.hh, vals = { hh: hh, claude: "Claude" };
    function list(rows) { return '<ul class="list">' + rows.map(function (r) { return navRow(r[1], r[2], r[3] ? vals[r[3]] : ""); }).join("") + "</ul>"; }
    var groups = FRONT[o].map(list).join("");
    if (o === "A") {
      var th = ph.panel === "theme";
      var looks = '<ul class="list"><li class="prow" data-id="theme"><button type="button" class="rb" data-a="panel" data-k="theme" aria-expanded="' + th + '"><span class="nm">Theme</span><span class="val">' + dot(curTheme()) + esc(themeName()) + '</span><span class="chev' + (th ? " up" : "") + '">' + ic("chevd", 18) + "</span></button>" + (th ? themePanel() : "") + "</li>" +
        '<li class="prow" data-id="mode"><div class="rline"><span class="rm"><span class="nm">Light or dark</span></span><span class="rc">' + modeSeg() + "</span></div></li>" +
        '<li class="prow" data-id="text"><div class="rline"><span class="rm"><span class="nm">Text size</span><span class="sub">' + esc(tsShort(SH.ts)) + '</span></span><span class="rc">' + tpair() + "</span></div></li></ul>";
      return looks + groups;
    }
    if (o === "B") {
      var thb = ph.panel === "theme";
      return '<div class="quick"><div class="qrow"><button type="button" class="chip" data-a="panel" data-k="theme" aria-expanded="' + thb + '" aria-label="Theme: ' + esc(themeName()) + '">' + dot(curTheme()) + '<span class="cn">' + esc(themeName()) + '</span><span class="chev' + (thb ? " up" : "") + '">' + ic("chevd", 18) + "</span></button>" + modeSeg() + "</div>" + (thb ? themePanel() : "") + tstep() + "</div>" + groups;
    }
    return groups;
  };
  Pp.stripHtml = function () {
    var ph = this, th = ph.panel === "theme";
    return '<button type="button" class="chip" data-a="panel" data-k="theme" aria-expanded="' + th + '" aria-label="Theme: ' + esc(themeName()) + '">' + dot(curTheme()) + '<span class="cn">' + esc(themeName()) + '</span><span class="chev' + (th ? " up" : "") + '">' + ic("chevd", 18) + "</span></button>" + modeCycle() + tpair();
  };

  /* ---------- pages ---------- */
  function ents(ph, pg) {
    return S.all().filter(function (e) { return pageOf(e, ph.opt) === pg && !e.adv && !e.info && e.ctl !== "themepick" && e.id !== "prefs" && e.ctl !== "mode" && e.ctl !== "text" && e.ctl !== "theme" && e.id !== "hh" && e.id !== "members" && e.id !== "invite" && e.id !== "history"; });
  }
  Pp.householdHtml = function () {
    var ph = this, hhid = ph.opened === "hh", inv = SH.invite;
    var people = [["Alex", "You, admin"], ["Sam", "Admin"], ["Jo", "Member"]].map(function (p) { return '<li class="prow person"><div class="rline"><i class="av" aria-hidden="true">' + p[0][0] + '</i><span class="rm"><span class="nm">' + p[0] + '</span><span class="sub">' + p[1] + "</span></span></div></li>"; }).join("");
    var html = '<label class="field' + (hhid ? " flash" : "") + '"><span class="fl">Household name</span><input class="in" data-hh value="' + esc(SH.hh) + '" maxlength="40" autocomplete="off"></label>' +
      '<ul class="list people">' + people + "</ul>" +
      '<div class="invite' + (ph.opened === "invite" ? " flash" : "") + '"><button type="button" class="pbtn go" data-a="invite">' + ic("copy", 20) + "<span>Copy invite link</span></button>" + (inv ? '<p class="link" data-invite><b>' + esc(inv) + '</b><span class="sub">Works for 7 days. Anyone with it can join.</span></p>' : "") + "</div>";
    var rows = '<ul class="list">' + '<li class="prow' + (ph.flash === "history" ? " flash" : "") + '"><button type="button" class="rb" data-a="soon:History"><span class="nm">History</span><span class="val">Last 7 days</span>' + chev() + "</button></li>";
    if (ph.opt === "B") rows += ents(ph, "household").filter(function (e) { return e.g === "Kitchen setup"; }).map(function (e) { return pageRow(e, ph); }).join("");
    return html + rows + "</ul>";
  };
  Pp.pageHtml = function () {
    var ph = this, p = ph.page;
    if (p === "front") return ph.frontHtml();
    if (!S.ready()) return '<p class="hint" data-loading>Loading…</p>';
    if (p === "household") return ph.householdHtml() + ph.extraHtml();
    var rows = ents(ph, p);
    return '<ul class="list">' + rows.map(function (e) { return pageRow(e, ph); }).join("") + "</ul>" + ph.extraHtml();
  };
  /* a search-only setting opened from search is shown under the page's own rows, with one honest line */
  Pp.extraHtml = function () {
    var ph = this, id = ph.opened, e = id && S.entry(id);
    if (!e || !e.adv) return "";
    return '<p class="lbl">Opened from search</p><ul class="list">' + pageRow(e, ph).replace("flash", "flash") + '</ul><p class="hint">No page lists this one. Only search finds it.</p>';
  };

  /* ---------- search ---------- */
  function hl(text, use) {
    if (!use || !use.length) return esc(text);
    return String(text).split(/([A-Za-z0-9’']+)/).map(function (p, i) {
      if (i % 2 === 0) return esc(p);
      var lw = S.words(p)[0] || "";
      return lw && use.some(function (u) { return u.length >= 2 && (lw === u || lw.indexOf(u) === 0 || u.indexOf(lw) === 0 && lw.length >= 3); }) ? "<mark>" + esc(p) + "</mark>" : esc(p);
    }).join("");
  }
  Pp.resRow = function (x, use) {
    var ph = this, e = x.e, c = ctl(e), v = val(e);
    var sub = crumb(e, ph.opt) + " · " + SCOPE[e.sc];
    var nm = '<span class="nm">' + hl(e.t, use) + "</span>";
    var body = '<span class="rm">' + nm + '<span class="sub">' + esc(sub) + "</span></span>";
    if (c.c) return '<li class="prow" data-id="' + e.id + '"><div class="rline">' + body + '<span class="rc">' + (c.c.indexOf("tpair") > -1 ? '<span class="val">' + esc(v) + "</span>" : "") + c.c + "</span></div></li>";
    if (c.line) return '<li class="prow" data-id="' + e.id + '"><div class="rline">' + body + '<span class="rc val">' + esc(v) + "</span></div>" + c.line + "</li>";
    if (e.info) return '<li class="prow" data-id="' + e.id + '"><div class="rline">' + '<span class="rm">' + nm + '<span class="sub">' + esc(e.info) + "</span></span></div></li>";
    return '<li class="prow" data-id="' + e.id + '"><button type="button" class="rb" data-a="go:' + e.id + '">' + body + (v ? '<span class="val">' + esc(v) + "</span>" : "") + chev() + "</button></li>";
  };
  Pp.searchHtml = function () {
    var ph = this, q = ph.q.trim();
    if (!q) {
      var sug = SUGGEST[ph.ctx] || SUGGEST.front, rc = SH.recents;
      return '<div class="emp">' + (rc.length ? '<p class="lbl">Recent<button type="button" class="plnk" data-a="clear-recents">Clear</button></p><ul class="list recent">' + rc.map(function (r) { return '<li class="prow"><button type="button" class="rb" data-a="q:' + esc(r) + '">' + ic("clock", 18) + '<span class="nm">' + esc(r) + "</span></button></li>"; }).join("") + "</ul>" : "") +
        '<p class="lbl">' + (ph.ctx === "front" ? "Try" : "Try, from " + esc(PAGES[ph.ctx])) + '</p><div class="qchips">' + sug.map(function (r) { return '<button type="button" class="qchip" data-a="q:' + esc(r) + '">' + esc(r) + "</button>"; }).join("") + "</div></div>";
    }
    if (!S.ready()) return '<p class="hint" data-loading>Loading…</p>';
    var r = S.run(q, ph.ctx, function (e) { return pageOf(e, ph.opt); }), use = r.use, html = "", shown = 0;
    if (!r.on.length && !r.rest.length) {
      return '<div class="none" data-empty><p class="big">Nothing matches “' + esc(q) + '”</p><p class="hint">Try a simpler word:</p><div class="qchips">' + ["theme", "text size", "household", "quiet hours"].map(function (s) { return '<button type="button" class="qchip" data-a="q:' + s + '">' + s + "</button>"; }).join("") + "</div></div>";
    }
    if (r.fixed) html += '<p class="fix" data-fixed>Showing results for <b>' + esc(r.fixed) + "</b></p>";
    function list(items, label) {
      var left = ph.limit - shown; if (left <= 0 || !items.length) return "";
      var take = items.slice(0, left); shown += take.length;
      return (label ? '<p class="sh" data-section="' + (label === "On this page" ? "on" : "rest") + '">' + label + "</p>" : "") + '<ul class="list res">' + take.map(function (x) { return ph.resRow(x, use); }).join("") + "</ul>";
    }
    /* the Theme result already carries every theme tile, so the ten theme-name results stay out of its way (a search for a theme's own name still finds that theme) */
    var hasTheme = r.on.concat(r.rest).some(function (x) { return x.e.id === "theme"; });
    if (hasTheme) { var nt = function (x) { return x.e.ctl !== "themepick"; }; r.on = r.on.filter(nt); r.rest = r.rest.filter(nt); }
    var both = r.on.length > 0;
    html += list(r.on, both ? "On this page" : "") + list(r.rest, both ? "Everywhere else" : "");
    var total = r.on.length + r.rest.length;
    if (total > shown) html += '<button type="button" class="more" data-a="more">Show ' + (total - shown) + " more</button>";
    return html;
  };

  Pp.draw = function () {
    var ph = this, top = ph.bd.scrollTop, strip = $(".strip", ph.el);
    if (ph.opt === "C") strip.innerHTML = ph.stripHtml();
    var panelOverlay = "";
    if (ph.opt === "C" && ph.panel === "theme") panelOverlay = '<div class="scrim" data-a="panel" data-k="theme"></div><div class="pop">' + themePanel() + "</div>";
    var body = ph.searching ? ph.searchHtml() : ph.pageHtml();
    ph.bd.innerHTML = body;
    var old = $(".pop", ph.el), oldScrim = $(".scrim", ph.el); if (old) old.remove(); if (oldScrim) oldScrim.remove();
    if (panelOverlay) { var w = document.createElement("div"); w.innerHTML = panelOverlay; while (w.firstChild) { ph.el.insertBefore(w.firstChild, $(".bd", ph.el)); } }
    ph.bd.scrollTop = top;
    if (ph.flash) { var f = $(".flash", ph.bd); if (f && f.scrollIntoView) f.scrollIntoView({ block: "center" }); var fl = ph.flash; setTimeout(function () { if (ph.flash === fl) ph.flash = null; }, 2400); }
    ph.chrome();
  };
  function syncAll() { phones.forEach(function (p) { p.chrome(); p.draw(); }); $$("[data-theme-name]").forEach(function (n) { n.textContent = themeName(); }); }

  new MutationObserver(function () { syncAll(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.SHAKE = { Phone: Phone, phones: phones, SH: SH, syncAll: syncAll, pageOf: pageOf, PAGES: PAGES, TS_PCT: TS_PCT, applyMode: applyMode };
})();
