/* Option E: a curated Settings front, one pinnable shortcuts area, and search for everything. Mockup only: no storage, no network beyond theme.js's own theme files and the deferred search-index.js.
   One shared state object (ST) feeds every phone, the desktop window, the sample screens and the gallery, so a control changes what is drawn next to it.
   Search is the product (owner, 23 Oct 2026): the index is loaded when search is first used (focus, typing, an example chip, or the gallery nearing the viewport). */
(function () {
  "use strict";
  var root = document.getElementById("opt-E"); if (!root) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var CH = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var CHS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var SEARCH = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
  var PIN = function (on) { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (on ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z"/><path d="M12 14v7"/></svg>'; };
  var BELL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/></svg>';

  var ITEMS = [
    { n: "beef mince", e: "🥩", amt: "500 g", spot: "Fridge · Shelf 2", by: "Use by Sun 25 Oct", sm: "goes off Sunday" },
    { n: "milk", e: "🥛", amt: "2 L", spot: "Fridge · Door", by: "Use by Sat 24 Oct", sm: "goes off tomorrow" },
    { n: "basmati rice", e: "🍚", amt: "1 kg", spot: "Pantry · Shelf 1", by: "", sm: "plenty" },
    { n: "basil", e: "🌿", amt: "1 bunch", spot: "Fridge · Drawer", by: "", sm: "plenty" }
  ];
  /* Text size is a seven-step stepper relative to the phone's own size (owner, 24 Oct 2026): step 0 is Match my phone, three steps smaller and three larger. Percentages are the root font size. */
  var TS_PCT = { "-3": -24, "-2": -16, "-1": -8, "0": 0, "1": 10, "2": 20, "3": 30 };
  var tsId = function (n) { return n === 0 ? "" : (n < 0 ? "s" : "l") + Math.abs(n); };
  var tsWord = function (n) { return n === 0 ? "Match my phone" : n < 0 ? "Smaller" : "Larger"; };
  /* The ten themes' real looks (background, card, accent, text), read from theme.css and themes/*.css; the swatch draws all four together. */
  var LOOKS = { "kitchie": ["Kitchie Night", "#0F1E19", "#172A23", "#F2B84B", "#F3EEE3"], "kitchie-day": ["Kitchie Day", "#F6F1E6", "#FFFFFF", "#8A5600", "#1D2A24"], "marmalade": ["Marmalade", "#FBF1E3", "#FFFFFF", "#C2410C", "#3A2412"], "blueberry": ["Blueberry", "#14142B", "#1D1D3D", "#F48FB1", "#EEEBFF"], "herb": ["Herb Garden", "#EEF4E6", "#FFFFFF", "#2F7D32", "#1B2E1B"], "cappuccino": ["Cappuccino", "#F3E9DD", "#FFFFFF", "#8B5A2B", "#33261B"], "tokyo-midnight": ["Tokyo Midnight", "#0B0F1E", "#141A30", "#5CE1E6", "#E8ECFF"], "paprika": ["Paprika", "#1F1410", "#2B1D17", "#FF8A4C", "#F7E9DD"], "sea-salt": ["Sea Salt", "#EAF2F4", "#FFFFFF", "#0F766E", "#12313A"], "lavender-fog": ["Lavender Fog", "#F1EEF7", "#FFFFFF", "#6D28D9", "#2A2340"] };
  var MODE = [["system", "System"], ["light", "Light"], ["dark", "Dark"]];
  var PINNABLE = [{ id: "looks", t: "Looks", sub: "Theme, light or dark" }, { id: "text", t: "Text size", sub: "Every screen" }];
  var SC = { device: "This device", member: "You", household: "Whole household", account: "Your account", info: "Not a setting" };
  var STOP = {}; "the a an my to of for in on i it is me how do can want change make set turn show find where what please setting settings and or this that are be get need would there off".split(" ").forEach(function (w) { STOP[w] = 1; });
  var EXAMPLES = [["Exact", "text size"], ["Synonym", "bigger text"], ["Typo", "drak mode"], ["Vague", "too small"], ["Vague, several", "hard to see"], ["Advanced", "animations"], ["Colour word", "orange"], ["Jumps to a screen", "food rules"], ["Many results", "household"], ["Old name", "item name size"], ["Not a setting", "time zone"], ["No match", "flux capacitor"]];
  var SUGGEST = ["bigger text", "dark mode", "stop the questions", "invite someone", "connect Claude", "text too small", "food rules", "undo changes"];

  var ST = { mode: "system", ts: 0, rows: "standard", motion: "phone", bell: true, checks: true, conn: 1, samples: true, pins: ["looks", "text"], recents: [], toast: "", toastDev: 0 };
  var devs = [], uid = 0, IDX = null, V = null, F = {}, loading = false, waiters = [], lastDev = null;
  var VALS = { me: "Alex", role: "Sous chef", hh: "Henderson kitchen", members: "3 people, 1 admin", invite: "1 pending", cats: "12", locs: "4", gemini: "Not connected", quiet: "22:00 to 06:00", cap: "3 a day", rules: "2 custom rules", stops: "2 switched off", avoids: "1 hard, 2 soft", likes: "4 likes, 3 dislikes", subs: "3 saved", notes: "2 notes", props: "1 waiting", tz: "Australia/Sydney, from your phone", units: "No setting", install: "Not installed", sort: "Name", planoff: "Sat, Sun", prefs: "", csv: "", signout: "", leave: "", disconnect: "", history: "", notif: "" };
  function osLabel() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--os") || "1") > 1.01 ? "Large" : "Default"; }
  function val(key) {
    switch (key) {
      case "theme": return window.themeName ? window.themeName() : "";
      case "mode": return ST.mode === "system" ? "Follows my phone" : ST.mode === "light" ? "Light" : "Dark";
      case "text": return ST.ts === 0 ? "Match my phone" : tsWord(ST.ts) + " (" + (ST.ts > 0 ? "+" : "") + TS_PCT[ST.ts] + "%)";
      case "rows": return ST.rows === "names" ? "Names only" : "Standard";
      case "motion": return ST.motion === "reduce" ? "Always reduced" : "Follows my phone";
      case "bell": return ST.bell ? "On" : "Off";
      case "checks": return ST.checks ? "On" : "Off";
      case "samples": return ST.samples ? "4 left" : "None left";
      case "claude": return ST.conn >= 1 ? "Connected" : "Not connected";
      case "chatgpt": return ST.conn >= 2 ? "Connected" : "Not connected";
      case "defassist": return ST.conn >= 2 ? "Claude" : ST.conn === 1 ? "Automatic: Claude" : "None connected";
      case "reset": return "";
      default: return VALS[key] || "";
    }
  }
  var pins = function (d) { return d && d.pins ? d.pins : ST.pins; };

  /* ---------- search engine: the part that must be 'super, super good' ---------- */
  function words(s) {
    var t = String(s).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
    var k = t.filter(function (w) { return !STOP[w]; });
    return (k.length ? k : t).map(stem);
  }
  function stem(w) {
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + "y";
    if (w.length > 4 && /(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function dist(a, b) { /* optimal string alignment: one swap counts as one edit */
    var m = a.length, n = b.length, d = [], i, j; for (i = 0; i <= m; i++) { d[i] = [i]; } for (j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      var c = a[i - 1] === b[j - 1] ? 0 : 1; d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[m][n];
  }
  function fuzzy(q, w) { if (q.length < 4 || w.length < 4 || q[0] !== w[0]) return false; var t = q.length >= 7 ? 2 : 1; return Math.abs(q.length - w.length) <= t && dist(q, w) <= t; }
  function eq(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function has(h, n) { if (!n.length || n.length > h.length) return false; for (var i = 0; i + n.length <= h.length; i++) { var ok = true; for (var j = 0; j < n.length; j++) if (h[i + j] !== n[j]) { ok = false; break; } if (ok) return true; } return false; }
  function prep() {
    V = {}; /* vocabulary: stem -> a readable word, used to correct typos */
    IDX.forEach(function (e, n) {
      e._n = n; e._lab = { tok: words(e.t), text: e.t }; e._aka = (e.aka || []).map(function (a) { return { tok: words(a), text: a }; });
      e._syn = e.syn.split("|").map(function (p) { return { tok: words(p), text: p }; });
      e._aff = {}; words(e.aff + " " + e.where + " " + e.g).forEach(function (w) { e._aff[w] = 1; });
      [e._lab].concat(e._aka, e._syn).forEach(function (p) { p.tok.forEach(function (w, i) { var raw = p.text.toLowerCase().replace(/['’]/g, "").split(/[^a-z0-9]+/).filter(function (x) { return !STOP[x]; })[i]; F[w] = (F[w] || 0) + 1; if (!V[w]) V[w] = raw && stem(raw) === w ? raw : w; }); });
    });
  }
  function known(t) { if (V[t]) return true; if (t.length < 2) return false; for (var w in V) if (w.indexOf(t) === 0) return true; return false; }
  function correct(qt) { /* replace words nobody has ever used with the closest word that someone has */
    var out = [], changed = false;
    qt.forEach(function (t) {
      if (known(t) || t.length < 4) { out.push(t); return; }
      var best = null, bd = 9; for (var w in V) if (fuzzy(t, w)) { var d = dist(t, w) + (w.length === t.length ? 0 : 0.5); if (d < bd || (d === bd && (F[w] || 0) > (F[best] || 0))) { best = w; bd = d; } }
      if (best) { out.push(best); changed = true; } else out.push(t);
    });
    return changed ? out : null;
  }
  function scoreEntry(e, qt) {
    var best = 0, why = null, n = qt.length;
    function up(s, w) { if (s > best) { best = s; why = w; } }
    [e._lab].concat(e._aka).forEach(function (l, li) {
      var w = li === 0 ? { t: "exact" } : { t: "aka", text: l.text }, cap = e.ctl === "themepick" ? 70 : 100; /* a theme called Night must not outrank Light or dark for "night" */
      if (eq(l.tok, qt)) up(100, w);
      else if (qt.every(function (q) { return l.tok.indexOf(q) > -1; })) up(Math.min(92, cap), li === 0 ? { t: "label" } : w);
      else if (qt.every(function (q) { return q.length >= 2 && l.tok.some(function (x) { return x.indexOf(q) === 0; }); })) up(Math.min(80, cap), li === 0 ? { t: "label" } : w);
    });
    e._syn.forEach(function (p) {
      if (eq(p.tok, qt)) up(90, { t: "syn", text: p.text });
      else if (p.tok.length >= 2 && has(qt, p.tok)) up(72, { t: "syn", text: p.text });
      else if (n >= 2 && has(p.tok, qt)) up(66, { t: "syn", text: p.text });
    });
    var sum = 0, hit = 0, fz = false, sw = null;
    qt.forEach(function (q) {
      var s = 0;
      [e._lab].concat(e._aka).forEach(function (l) { l.tok.forEach(function (w) { var v = w === q ? 30 : (q.length >= 2 && w.indexOf(q) === 0) ? 24 : fuzzy(q, w) ? 15 : 0; if (v > s) s = v; }); });
      e._syn.forEach(function (p) { p.tok.forEach(function (w) { var v = w === q ? 22 : (q.length >= 3 && w.indexOf(q) === 0) ? 16 : fuzzy(q, w) ? 11 : 0; if (v > s) { s = v; sw = p.text; } }); });
      if (!s && e._aff[q]) s = 6;
      if (s) hit++; sum += s;
    });
    var tok = hit * 2 >= n ? (sum / n) * (hit / n) : 0;
    if (tok > best) { best = tok; why = sw ? { t: "syn", text: sw } : { t: "rel" }; }
    return { s: best - (e.adv ? 4 : 0), why: why };
  }
  function search(q, literal) {
    var qt = words(q); if (!qt.length || !q.trim()) return { items: [], qt: qt };
    var fix = literal ? null : correct(qt), use = fix || qt, items = [];
    IDX.forEach(function (e) { var r = scoreEntry(e, use); if (r.s >= 10) items.push({ e: e, s: r.s, why: r.why }); });
    items.sort(function (a, b) { return b.s - a.s || a.e.pri - b.e.pri || a.e._n - b.e._n; });
    return { items: items, qt: qt, fixed: fix ? fix.map(function (w) { return V[w] || w; }).join(" ") : null };
  }
  window.SR_SEARCH = { run: function (q, literal) { var r = search(q, literal); return { ids: r.items.map(function (x) { return x.e.id; }), fixed: r.fixed, top: r.items[0] && r.items[0].why }; }, size: function () { return IDX ? IDX.length : 0; } };

  /* ---------- controls ---------- */
  var fk = function (d, c, k, v) { return "e" + d.i + c + k + (v ? "-" + v : ""); };
  function seg(d, c, k, label, opts, v, cls) {
    var nm = fk(d, c, k);
    return '<div class="seg2 wide eseg ' + (cls || "") + '" role="radiogroup" aria-label="' + esc(label) + '" data-seg="' + k + '">' + opts.map(function (o) { return '<label><input type="radio" name="' + nm + '" data-ek="' + k + '" data-fk="' + nm + "-" + o[0] + '" value="' + o[0] + '"' + (o[0] === v ? " checked" : "") + '><span>' + esc(o[1]) + '</span></label>'; }).join("") + '</div>';
  }
  function sw(d, c, k, label, on, sub) { var f = fk(d, c, k); return '<label class="srow"><span>' + esc(label) + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</span><input type="checkbox" role="switch" data-ek="' + k + '" data-fk="' + f + '"' + (on ? " checked" : "") + '><span class="swt" aria-hidden="true"></span></label>'; }
  /* One tile per theme: a mini preview of its real look with the name underneath (the build's `phoneThemeTile`, with a button where the build has a radio). */
  function themeTile(id) {
    var l = LOOKS[id], cur = document.documentElement.getAttribute("data-theme");
    return '<button type="button" class="tpick tbare tmini" data-theme-pick="' + id + '" aria-pressed="' + (id === cur) + '" aria-label="' + esc(l[0]) + '" title="' + esc(l[0]) + '"><i class="tsw tprev" style="--pbg:' + l[1] + ';--pcd:' + l[2] + ';--pac:' + l[3] + ';--pfg:' + l[4] + '" aria-hidden="true"><b></b><s></s><u></u></i><span class="tname" aria-hidden="true">' + esc(l[0]) + '</span></button>';
  }
  function themeTiles(ids) { return Object.keys(LOOKS).filter(function (id) { return !ids || ids.indexOf(id) > -1; }).map(themeTile).join(""); }
  /* rotary: the pinned card keeps ONE row; everything when it fits, else a row that swipes sideways */
  function themeBlock(rotary) {
    if (rotary) return '<div class="trot" data-rotary data-edge="none"><div class="tgrid swatches trow" data-themes role="group" aria-label="Theme, swipe sideways for more">' + themeTiles() + '</div></div>';
    return '<div class="tgrid swatches" data-themes role="group" aria-label="Theme">' + themeTiles() + '</div>';
  }
  /* Text size: one line, smaller | the phone's own size | larger. The middle is in em, so it shows the size now applied. */
  function stepper(d, c) {
    var n = ST.ts, dots = "", f = fk(d, c, "ts");
    for (var i = -3; i <= 3; i++) dots += '<i class="tdot' + (i === n ? " on" : "") + (i === 0 ? " mid" : "") + '"></i>';
    var say = n === 0 ? "Match my phone, your phone's own size" : tsWord(n) + ", step " + Math.abs(n) + " of 3, " + Math.abs(TS_PCT[n]) + "% " + (n < 0 ? "smaller" : "larger") + " than your phone";
    return '<div class="tstep" role="group" aria-label="Text size" data-step="' + n + '" data-seg="ts">' +
      '<button type="button" class="tbtn" data-ea="ts:-1" data-fk="' + f + '-down" aria-label="Smaller text" aria-disabled="' + (n <= -3) + '"><span class="ta" aria-hidden="true">A</span><span class="tpm" aria-hidden="true">−</span></button>' +
      '<div class="tmid" role="status" aria-label="' + esc(say) + '"><b class="tlab" aria-hidden="true">' + tsWord(n) + '</b><span class="tdots" aria-hidden="true">' + dots + '</span></div>' +
      '<button type="button" class="tbtn" data-ea="ts:1" data-fk="' + f + '-up" aria-label="Larger text" aria-disabled="' + (n >= 3) + '"><span class="ta big" aria-hidden="true">A</span><span class="tpm" aria-hidden="true">+</span></button></div>';
  }
  function say(k) {
    if (k === "mode") return ST.mode === "system" ? "Following your phone (it is " + (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") + " now), including its night schedule." : "Always " + ST.mode + ", whatever the phone says.";
    if (k === "text") return ST.ts === 0 ? "Your phone's own text size (" + osLabel().toLowerCase() + " now). Kitchie adds nothing. Tap A− or A+ to go smaller or larger." : "Your phone's size, " + Math.abs(TS_PCT[ST.ts]) + "% " + (ST.ts < 0 ? "smaller" : "larger") + ". Every screen below follows.";
    return "";
  }
  function ctlHtml(d, c, e) {
    switch (e.ctl) {
      case "theme": return themeBlock(false);
      case "mode": return seg(d, c, "mode", "Light or dark", MODE, ST.mode) + '<p class="small" data-say="mode">' + esc(say("mode")) + '</p>';
      case "text": return stepper(d, c) + '<p class="small" data-say="text">' + esc(say("text")) + '</p>';
      case "rows": return seg(d, c, "rows", "Rows", [["standard", "Standard"], ["names", "Names only"]], ST.rows);
      case "motion": return seg(d, c, "motion", "Reduce motion", [["phone", "Follow my phone"], ["reduce", "Always reduce"]], ST.motion);
      case "bell": return sw(d, c, "bell", "Show the bell", ST.bell);
      case "checks": return sw(d, c, "checks", "Ask me to check amounts", ST.checks);
      case "reset": return '<button type="button" class="btn ghost" data-ea="reset" data-fk="' + fk(d, c, "reset") + '">Reset to defaults</button>';
      case "themepick": return '<div class="tgrid swatches">' + themeTiles([e.tid]) + '</div>';
      default: return "";
    }
  }
  /* the pin is only an icon: filled when pinned, outline when not; the words live in the accessible name */
  function pinBtn(d, id, c) {
    var on = pins(d).indexOf(id) > -1, nm = PINNABLE.filter(function (p) { return p.id === id; })[0].t;
    return '<button type="button" class="pinb" data-ea="pin:' + id + '" data-fk="' + fk(d, c, "pin", id) + '" aria-pressed="' + on + '" aria-label="' + (on ? "Unpin " + nm + " from Shortcuts" : "Pin " + nm + " to Shortcuts") + '">' + PIN(on) + '</button>';
  }
  function mi(label, o) { o = o || {}; return '<button type="button" class="mi" data-ea="' + (o.a || "go:" + label) + '"><span>' + esc(label) + '</span><span style="display:inline-flex;align-items:center">' + (o.val ? '<span class="val">' + esc(o.val) + '</span>' : "") + '<span class="chev">' + CH + '</span></span></button>'; }
  function mtop(back, title, d) { return '<div class="mtop">' + (back ? '<button type="button" class="bk" data-ea="nav:' + back[1] + '">&lsaquo; ' + esc(back[0]) + '</button>' : '<span style="width:64px"></span>') + '<h1 class="ttl">' + esc(title) + '</h1><span style="width:64px"></span></div>'; }

  /* ---------- the front: shortcuts and the curated list ---------- */
  function tile(d, id) {
    var p = PINNABLE.filter(function (x) { return x.id === id; })[0];
    var inner = id === "looks" ? themeBlock(true) + seg(d, "tile", "mode", "Light or dark", MODE, ST.mode) : stepper(d, "tile");
    return '<article class="etile" data-pinned="' + id + '"><header><b>' + esc(p.t) + '</b>' + pinBtn(d, id, "tile") + '</header>' + inner + '</article>';
  }
  function shortcuts(d) {
    var P = pins(d), un = PINNABLE.filter(function (p) { return P.indexOf(p.id) < 0; });
    var adds = un.map(function (p) { return '<button type="button" class="eadd" data-ea="pin:' + p.id + '" data-fk="' + fk(d, "add", "pin", p.id) + '" aria-label="Pin ' + esc(p.t) + ' to Shortcuts">' + PIN(false) + '<span>' + esc(p.t) + '</span></button>'; }).join("");
    var body = P.length ? '<div class="etiles">' + P.map(function (id) { return tile(d, id); }).join("") + '</div>' : '<div class="eempty" data-empty-pins><b>Nothing pinned</b><p class="small">Pin Looks or Text size and they sit here, one tap from Settings. Pinning only adds a shortcut: the setting stays in its own place and in search, and unpinning loses nothing.</p></div>';
    return '<section class="eshort" data-shortcuts aria-label="Shortcuts"><div class="eshort-h"><span class="lbl">Shortcuts</span><span class="small">' + P.length + " of " + PINNABLE.length + ' pinned</span></div>' + body + (adds ? '<div class="eadds">' + adds + '</div>' : "") + '</section>';
  }
  function front(d) {
    var two = ST.conn >= 2;
    return shortcuts(d) +
      (two ? '<section class="card" data-assistant><span class="lbl">Default assistant</span><p class="small">You have two connected, so Kitchie asks once which one the Plan button opens.</p>' + seg(d, "front", "assistant", "Default assistant", [["claude", "Claude"], ["chatgpt", "ChatGPT"]], "claude") + '</section>' : "") +
      '<div class="ecur"><span class="lbl">Settings</span><div class="menu card" data-curated>' + mi("Looks", { a: "nav:looks", val: val("theme") + " · " + (ST.mode === "system" ? "follows phone" : ST.mode) }) + mi("Preferences", { a: "go:Preferences", val: "Checks " + (ST.checks ? "on" : "off") }) + mi("Household", { val: VALS.hh }) + mi("Kitchen setup", { val: "12 categories, 4 locations" }) + mi("Assistants", { val: ST.conn === 0 ? "None" : ST.conn === 1 ? "Claude" : "Claude, ChatGPT" }) + '</div></div>' +
      '<p class="small" data-more-hint>Five things here, on purpose. <b>Everything else is one search away</b>' + (IDX ? ": " + IDX.length + " things you can look up, " + IDX.filter(function (e) { return e.adv; }).length + " of them only by search." : ".") + '</p>';
  }
  function looksPage(d) {
    return '<section class="card sgroup" data-looks><div class="ecard-h"><b>Looks</b>' + pinBtn(d, "looks", "page") + '</div>' + themeBlock(false) + '<div class="srow plain" role="group"><span>Light or dark</span>' + seg(d, "page", "mode", "Light or dark", MODE, ST.mode) + '</div><p class="small" data-say="mode">' + esc(say("mode")) + '</p></section>' +
      '<section class="card sgroup" data-textcard><div class="ecard-h"><b>Text size</b>' + pinBtn(d, "text", "page") + '</div>' + stepper(d, "page") + '<p class="small" data-say="text">' + esc(say("text")) + '</p></section>' +
      '<p class="small">Rows, motion, the bell and Reset are not on this page on purpose. <b>Search finds them:</b></p><div class="chips">' + ["rows", "animations", "bell", "undo changes"].map(function (q) { return '<button type="button" class="echip" data-ea="q:' + q + '">' + esc(q) + '</button>'; }).join("") + '</div>';
  }
  function menuPage(d) {
    return '<div style="display:flex;gap:12px;align-items:center"><span class="av" style="width:56px;height:56px;font-size:20px">A</span><div><b style="font-size:1.25em">Alex</b><p class="small" style="margin-top:2px">Henderson kitchen</p></div></div>' +
      '<div><span class="lbl">App</span><div class="menu card" data-menu>' + mi("Settings", { a: "nav:front" }) + mi("Looks", { a: "nav:looks", val: val("theme") }) + mi("History") + mi("Preferences") + mi("Install") + '</div></div>' +
      '<div><span class="lbl">People</span><div class="menu card">' + mi("Me", { val: "Alex" }) + mi("Household", { val: "3" }) + '</div></div><div><span class="lbl">My data</span><div class="menu card">' + mi("Download inventory CSV") + '</div></div><button type="button" class="danger" data-ea="go:Sign out">Sign out</button>' +
      '<p class="small">Looks is here whether or not it is pinned. Categories, Locations, a second Install and a second Sign out are no longer repeated on the Settings page.</p>';
  }

  /* ---------- search results ---------- */
  function whyHtml(r, q) {
    var w = r.why || {};
    if (w.t === "exact") return "Exact match";
    if (w.t === "label") return "Matches the name";
    if (w.t === "aka") return 'Was <b>“' + esc(w.text) + '”</b>, now part of ' + esc(r.e.t);
    if (w.t === "syn") return 'Also called <b>“' + esc(w.text) + '”</b>';
    return "Related to what you typed";
  }
  function resRow(d, r, idx) {
    var e = r.e, act = d.act === idx, v = val(e.val), c = "r";
    var ctl = e.ctl ? ctlHtml(d, c, e) : e.info ? '<p class="small sr-info">' + esc(e.info) + '</p>' : '<button type="button" class="btn ghost sr-go" data-ea="go:' + esc(e.go) + '" data-fk="' + fk(d, c, "go", e.id) + '">Open ' + esc(e.go) + ' ' + CHS + '</button>';
    var more = e.ctl && !e.adv && /Looks/.test(e.where) ? '<button type="button" class="more sr-look" data-ea="nav:looks" data-fk="' + fk(d, c, "looks", e.id) + '">Go to Looks ' + CHS + '</button>' : "";
    var pin = e.pin ? pinBtn(d, e.pin, "r" + e.id) : "";
    return '<li class="sr' + (act ? " is-active" : "") + '" role="option" id="sr-' + d.i + "-" + e.id + '" aria-selected="' + act + '" data-entry="' + e.id + '" data-adv="' + !!e.adv + '" data-idx="' + idx + '"><div class="sr-l">' +
      '<div class="sr-h"><b class="sr-t">' + esc(e.t) + '</b>' + (e.adv ? '<span class="sr-adv" title="Not on any page: found only by search">Advanced · search only</span>' : "") + '<span class="sr-sc" data-sc="' + e.sc + '">' + SC[e.sc] + '</span></div>' +
      '<div class="sr-why">' + whyHtml(r) + '</div><p class="sr-aff"><span class="sr-k">Affects</span> ' + esc(e.aff) + '</p>' +
      '<div class="sr-loc"><span class="sr-k">Lives in</span> ' + esc(e.where) + (v ? ' <span class="sr-k">Now</span> <b class="sr-val">' + esc(v) + '</b>' : "") + '</div></div>' +
      '<div class="sr-ctl">' + ctl + more + pin + '</div></li>';
  }
  function chipsHtml(list) { return '<div class="chips">' + list.map(function (q) { return '<button type="button" class="echip" data-ea="q:' + esc(q) + '">' + esc(q) + '</button>'; }).join("") + '</div>'; }
  function emptyHtml(d, recents) {
    var rc = recents || ST.recents;
    return '<div class="sr-empty" data-suggest><span class="lbl">Try typing</span>' + chipsHtml(SUGGEST) + (rc.length ? '<div class="sr-rc" data-recents><span class="lbl">Recent searches' + (d.gal ? "" : ' <button type="button" class="more" data-ea="clear-recents">Clear</button>') + '</span>' + chipsHtml(rc) + '</div>' : "") +
      '<p class="small">Search reads names, plain phrases, colours and typos. It covers ' + (IDX ? IDX.length : "every") + ' things you can change or look up, including advanced ones that no page shows.</p></div>';
  }
  function browseHtml(d) {
    var g = {}; IDX.forEach(function (e) { (g[e.g] = g[e.g] || []).push(e); });
    return '<div class="sr-browse" data-browse>' + Object.keys(g).map(function (k) { return '<span class="lbl">' + esc(k) + '</span>' + chipsHtml(g[k].map(function (e) { return e.t; })); }).join("") + '</div>';
  }
  function resultsHtml(d, q, recents) {
    if (!q.trim()) return emptyHtml(d, recents);
    if (!IDX) return '<p class="small" data-loading>Loading the search index…</p>';
    var r = search(q, d.literal), n = r.items.length; d.cur = r.items;
    if (d.act >= n) d.act = 0;
    var head = '';
    if (r.fixed) head += '<p class="sr-fix" data-fixed>Showing results for <b>“' + esc(r.fixed) + '”</b>. <button type="button" class="more" data-ea="literal">Search for “' + esc(q) + '” instead</button></p>';
    if (d.literal) head += '<p class="sr-fix">Searching exactly for <b>“' + esc(q) + '”</b>. <button type="button" class="more" data-ea="unliteral">Use suggestions again</button></p>';
    if (!n) return head + '<div class="sr-none" data-empty><p><b>Nothing matches “' + esc(q) + '”.</b></p><p class="small">Search reads names, plain phrases and typos, and found none. Closest ideas:</p>' + chipsHtml(["theme", "text size", "household", "quiet hours"]) + '<div class="sr-fb"><button type="button" class="btn ghost" data-ea="browse">Browse all ' + IDX.length + ' by group</button><button type="button" class="btn ghost" data-ea="feedback">Tell us what you were looking for</button></div>' + (d.browse ? browseHtml(d) : "") + '</div>';
    var shown = d.all || d.gal ? n : Math.min(n, 6);
    return head + '<p class="small sr-count" aria-live="polite" data-count="' + n + '">' + n + (n === 1 ? " result" : " results") + '</p><ul class="sr-list" role="listbox" id="sr-list-' + d.i + '" aria-label="Search results" data-results>' + d.cur.slice(0, shown).map(function (x, i) { return resRow(d, x, i); }).join("") + '</ul>' + (shown < n ? '<button type="button" class="more" data-ea="all">Show ' + (n - shown) + ' more ' + CHS + '</button>' : "");
  }
  function searchField(d) {
    var list = d.q.trim() && IDX ? "sr-list-" + d.i : "", act = d.q.trim() && IDX && d.cur && d.cur[d.act] ? "sr-" + d.i + "-" + d.cur[d.act].e.id : "";
    return '<label class="find esearch">' + SEARCH + '<input type="search" role="combobox" aria-expanded="' + !!list + '" aria-autocomplete="list"' + (list ? ' aria-controls="' + list + '"' : "") + (act ? ' aria-activedescendant="' + act + '"' : "") + ' data-eq data-fk="e' + d.i + 'q" placeholder="Search every setting: try “bigger text”" aria-label="Search settings" value="' + esc(d.q) + '" autocomplete="off" autocapitalize="off" spellcheck="false">' + (d.kind === "desk" ? '<kbd class="kbd">/</kbd>' : "") + '</label>';
  }
  function bodyHtml(d) {
    if (d.q.trim() || d.focus) return '<div class="sr-body" data-ebody-in>' + resultsHtml(d, d.q, d.recents) + '</div>';
    return front(d);
  }

  /* ---------- frames ---------- */
  function sampleHtml(cls) {
    var rows = ST.rows, e = true; /* no Emoji setting: an item shows its emoji when it has one */
    var home = ITEMS.slice(0, 3).map(function (i) { return '<div class="hrow"><span class="ic" aria-hidden="true">' + (e ? i.e : "·") + '</span><span class="nm">' + esc(i.n) + '</span><span class="sm">' + esc(i.sm) + '</span></div>'; }).join("");
    var pan = '<ul class="rows">' + ITEMS.slice(0, 3).map(function (i) { return '<li data-row><a class="rowlink" href="#" tabindex="-1"><div class="main"><div class="name">' + (e ? '<span class="emo" aria-hidden="true">' + i.e + '</span> ' : "") + esc(i.n) + '</div><div class="meta">' + esc(i.amt + " · " + i.spot) + '</div></div>' + (i.by ? '<span class="due">' + esc(i.by) + '</span>' : "") + '<span class="chev">' + CHS + '</span></a></li>'; }).join("") + '</ul>';
    var shop = ITEMS.slice(1, 4).map(function (i) { return '<div class="hrow"><span class="ic" aria-hidden="true">○</span><span class="nm">' + (e ? i.e + " " : "") + esc(i.n) + '</span><span class="sm">' + esc(i.amt) + '</span></div>'; }).join("");
    return '<div class="eprev ' + (cls || "") + '" data-eprev role="group" aria-label="Sample screens, not part of the app"><p class="lbl eprev-h"><span>Whole-app preview, not part of the app</span><span class="small">Text size: <b data-say-ts>' + esc(val("text")) + '</b></span></p><div class="escrs">' +
      '<section class="escr" data-s="home" aria-label="Home sample"><h4 class="escr-t">Home<span class="ebell" aria-label="2 changes by others">' + BELL + ' 2</span></h4>' + home + '</section>' +
      '<section class="escr" data-s="pantry" aria-label="Pantry sample"><h4 class="escr-t">Pantry</h4>' + pan + '</section>' +
      '<section class="escr" data-s="shop" aria-label="Shopping sample"><h4 class="escr-t">Shopping</h4>' + shop + '</section></div>' +
      '<p class="cap small">One Text size, three screens, all moving together. Rows reaches the two lists; the bell shows on Home.</p></div>';
  }
  function phoneHtml(d) {
    var top, body;
    if (d.page === "looks") { top = mtop(["Settings", "front"], "Looks"); body = looksPage(d); }
    else if (d.page === "menu") { top = mtop(null, ""); body = menuPage(d); }
    else { top = mtop(null, "Settings"); body = searchField(d) + '<div data-ebody>' + bodyHtml(d) + '</div>'; }
    return top + '<div class="mbody" style="padding-top:18px">' + body + '</div>';
  }
  function deskHtml(d) {
    var gut = ["Profile", "Settings", "Preferences", "History", "Household", "My data"].map(function (r, i) { return '<button type="button" class="gi" ' + (r === "Settings" ? 'aria-current="true"' : "") + ' data-ea="' + (r === "Settings" ? "nav:front" : "go:" + r) + '">' + r + '<span class="kbd">' + (i + 1) + '</span></button>'; }).join("");
    var main = d.page === "looks" ? '<div class="ebar"><button type="button" class="bk" style="background:none;border:0;color:var(--accent);font:600 1em var(--body);min-height:44px;cursor:pointer" data-ea="nav:front">&lsaquo; Settings</button></div><h3 class="ph">Looks</h3><div style="max-width:560px;display:flex;flex-direction:column;gap:14px">' + looksPage(d) + '</div>'
      : '<h3 class="ph">Settings</h3><div style="max-width:720px;display:flex;flex-direction:column;gap:14px">' + searchField(d) + '<div data-ebody>' + bodyHtml(d) + '</div><p class="small ekeys">Keys: <kbd class="kbd">/</kbd> search · <kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> move · <kbd class="kbd">Enter</kbd> use · <kbd class="kbd">Esc</kbd> clear</p></div>';
    return '<nav class="gut" aria-label="Settings sections"><div class="who"><span class="av">A</span><b>Alex</b></div>' + gut + '</nav><div class="pane"><div class="main">' + main + '</div><aside class="side">' + sampleHtml("side") + '</aside></div>';
  }
  function galHtml(d) {
    if (d.mode === "front") return '<div class="mbody" style="padding-top:6px">' + front(d) + '</div>';
    if (d.mode === "empty") return '<div class="mbody" style="padding-top:6px">' + searchField(d) + '<div data-ebody>' + emptyHtml(d, d.recents) + '</div></div>';
    return '<div class="mbody" style="padding-top:6px">' + searchField(d) + '<div data-ebody>' + (IDX ? resultsHtml(d, d.q) : '<p class="small" data-loading>The index loads when you reach this part of the page.</p>') + '</div></div>';
  }

  var GALLERY = [
    ["Exact match", "text size", "The name itself. One result, the control right there, and a pin."],
    ["Synonym", "bigger text", "Not a name anywhere in Settings. Found by what people say; the row says what it is also called."],
    ["Typo", "drak mode", "Corrected to “dark mode”, said out loud, with a way back to exactly what was typed."],
    ["Vague phrase", "too small", "No setting is called this. The most likely answer comes first."],
    ["Vague, several answers", "hard to see", "Text size, light or dark and theme can each fix it, in that order."],
    ["Advanced, search only", "animations", "No page shows this. The badge says so, and the control still works inline."],
    ["A colour word", "orange", "Two themes qualify. Press one to try it; the whole page changes."],
    ["Jumps to a screen", "food rules", "Too big to edit inline, so the row says where it lives and opens it."],
    ["Many results", "household", "Six at a time, ranked by how well each fits; the rest behind “Show more”."],
    ["An old name", "item name size", "The audited knob that moved only the Pantry list. Its name still finds the new, whole-app control."],
    ["A merged switch", "use-by date", "One of four row switches, now part of Rows."],
    ["Reset", "undo changes", "Where Reset to defaults lives: found by what you mean, never on a page."],
    ["Not a setting", "time zone", "There is nothing to change, so the row explains instead of leaving a dead end."],
    ["No match", "flux capacitor", "Says so, offers the closest ideas, a browse-by-group and a way to tell us."],
    ["Empty box", "", "Suggestions to try, written as people would say them.", "empty", []],
    ["Empty box, with recent searches", "", "The last searches come back as chips.", "empty", ["bigger text", "invite", "quiet hours"]],
    ["Front, nothing pinned", "", "The empty state of the shortcuts area: what pinning does, and two ways to start.", "front", null, []]
  ];

  /* ---------- assembly ---------- */
  function build() {
    var pair = $(".pair", root), html = "";
    var spec = [["phone", "front", "<b>E, Settings.</b> Search first, then Shortcuts (the one pinnable area), then five curated rows. Type, press a chip or press <kbd class=\"kbd\">/</kbd>."], ["phone", "looks", "<b>E, Looks.</b> Two pinnable segments, each with a pin. Rows, motion, the bell and Reset are not here: search finds them."], ["phone", "menu", "<b>E, the profile menu.</b> Looks lives here whether or not it is pinned."], ["prev"], ["desk", "front", "<b>E, desktop.</b> The Settings window: search on top, the sample screens at the right so a change is seen at once."]];
    spec.forEach(function (s) {
      if (s[0] === "prev") { html += '<div data-slot="prev"></div>'; return; }
      var d = { kind: s[0], page: s[1], i: ++uid, q: "", act: 0, all: false, literal: false, browse: false, cap: s[2] }; devs.push(d);
      html += s[0] === "phone" ? '<figure class="fig"><figcaption>' + s[2] + '</figcaption><div class="phone" data-edev="' + d.i + '"><div class="scr"></div></div></figure>' : '<figure class="fig deskfig" style="flex-basis:100%"><figcaption>' + s[2] + '</figcaption><div class="deskwrap"><div class="desk" data-edev="' + d.i + '"></div></div></figure>';
    });
    pair.innerHTML = html;
    var g = $("[data-egal]", root), gh = "";
    GALLERY.forEach(function (x, n) {
      var d = { kind: "gal", gal: true, page: "front", i: ++uid, q: x[1], act: 0, all: true, literal: false, mode: x[3] || "results", recents: x[4] || null, pins: x[5] || null }; devs.push(d);
      gh += '<figure class="gcard" data-state="' + n + '"><figcaption><b>' + esc(x[0]) + '</b>' + (x[1] ? ' <code>' + esc(x[1]) + '</code>' : "") + '</figcaption><p class="small">' + esc(x[2]) + '</p><div class="gbody" data-edev="' + d.i + '"></div></figure>';
    });
    if (g) g.innerHTML = gh;
    var ex = $("[data-examples]", root); if (ex) ex.innerHTML = EXAMPLES.map(function (x) { return '<button type="button" class="echip ex" data-ea="try:' + esc(x[1]) + '"><small>' + esc(x[0]) + '</small>' + esc(x[1]) + '</button>'; }).join("");
  }
  function applyAttrs() {
    if (ST.ts === 0) root.removeAttribute("data-ts"); else root.setAttribute("data-ts", tsId(ST.ts)); root.setAttribute("data-rows", ST.rows); root.setAttribute("data-bell", ST.bell ? "on" : "off");
    if (ST.motion === "reduce") root.setAttribute("data-motion", "reduce"); else root.removeAttribute("data-motion");
  }
  /* the pinned Looks card's theme row: keeps its scroll across a re-draw, shows the chosen theme the first time, and fades an edge that has more */
  function edgeOf(row) { var host = row.parentNode, max = row.scrollWidth - row.clientWidth; host.setAttribute("data-edge", max <= 1 ? "none" : row.scrollLeft <= 1 ? "end" : row.scrollLeft >= max - 1 ? "start" : "both"); }
  function rotaries(el, keep) {
    $$(".trow", el).forEach(function (row, i) {
      if (keep && keep[i] !== undefined && keep[i] > 0) row.scrollLeft = keep[i];
      else { var on = $("[aria-pressed=true]", row); if (on && !keep.length) row.scrollLeft = Math.max(0, on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2); }
      edgeOf(row); row.addEventListener("scroll", function () { edgeOf(row); }, { passive: true });
    });
  }
  function drawDev(d) {
    var el = $('[data-edev="' + d.i + '"]', root); if (!el) return;
    var keep = $$(".trow", el).map(function (r) { return r.scrollLeft; });
    if (d.kind === "phone") $(".scr", el).innerHTML = phoneHtml(d); else if (d.kind === "desk") el.innerHTML = deskHtml(d); else el.innerHTML = galHtml(d);
    rotaries(el, keep);
    if (ST.toast && ST.toastDev === d.i && (d.kind === "phone" || d.kind === "desk")) { var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = ST.toast; el.appendChild(t); }
  }
  function keepFocus() { var a = document.activeElement; if (!a || !root.contains(a)) return null; var k = { fk: a.getAttribute("data-fk"), eq: a.hasAttribute("data-eq"), dev: (a.closest("[data-edev]") || {}).dataset ? a.closest("[data-edev]").dataset.edev : null }; if (k.eq) { k.s = a.selectionStart; k.e = a.selectionEnd; } return k; }
  function restoreFocus(k) {
    if (!k || !k.fk) return; var scope = k.dev ? $('[data-edev="' + k.dev + '"]', root) : root, n = scope && $('[data-fk="' + k.fk + '"]', scope);
    if (n) { n.focus({ preventScroll: true }); if (k.eq && n.setSelectionRange) try { n.setSelectionRange(k.s, k.e); } catch (e) {} }
  }
  function renderAll() {
    var k = keepFocus(), sc = {}; $$("[data-edev]", root).forEach(function (n) { var s = n.querySelector(".scr") || n.querySelector(".main"); if (s) sc[n.dataset.edev] = s.scrollTop; });
    applyAttrs(); devs.forEach(drawDev);
    $$("[data-edev]", root).forEach(function (n) { var s = n.querySelector(".scr") || n.querySelector(".main"); if (s && sc[n.dataset.edev] != null) s.scrollTop = sc[n.dataset.edev]; });
    var slot = $('[data-slot="prev"]', root); if (slot) slot.innerHTML = sampleHtml("strip");
    restoreFocus(k);
    clearTimeout(ST.tt); if (ST.toast) ST.tt = setTimeout(function () { ST.toast = ""; $$(".toast", root).forEach(function (t) { t.remove(); }); }, 2400);
  }
  function refreshBody(d) { /* typing redraws only the results, so the box keeps focus, caret and text */
    var el = $('[data-edev="' + d.i + '"]', root), b = el && $("[data-ebody]", el); if (!b) return;
    b.innerHTML = bodyHtml(d);
    var inp = $("[data-eq]", el); if (inp) { var list = d.q.trim() && IDX && d.cur && d.cur.length; inp.setAttribute("aria-expanded", String(!!list)); if (list) { inp.setAttribute("aria-controls", "sr-list-" + d.i); inp.setAttribute("aria-activedescendant", "sr-" + d.i + "-" + d.cur[d.act].e.id); } else { inp.removeAttribute("aria-controls"); inp.removeAttribute("aria-activedescendant"); } }
  }

  /* ---------- the index loads on engagement ---------- */
  function ensureIndex(cb) {
    if (IDX) { if (cb) cb(); return; }
    if (cb) waiters.push(cb); if (loading) return; loading = true;
    var s = document.createElement("script"); s.src = "search-index.js";
    s.onload = function () { IDX = window.SR_E_INDEX; prep(); document.body.setAttribute("data-e-index", String(IDX.length)); renderAll(); waiters.splice(0).forEach(function (f) { f(); }); };
    document.head.appendChild(s);
  }

  /* ---------- actions ---------- */
  function setMode(m) {
    ST.mode = m; var cur = document.documentElement.getAttribute("data-theme"); if (cur !== "kitchie" && cur !== "kitchie-day") return;
    pickTheme(m === "light" ? "kitchie-day" : m === "dark" ? "kitchie" : (matchMedia("(prefers-color-scheme: light)").matches ? "kitchie-day" : "kitchie"));
  }
  function pickTheme(id) { var b = document.createElement("button"); b.setAttribute("data-theme-pick", id); b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); }
  function toast(d, msg) { ST.toast = msg; ST.toastDev = d && (d.kind === "phone" || d.kind === "desk") ? d.i : devs[0].i; }
  function devOf(n) { var el = n.closest("[data-edev]"); return el ? devs.filter(function (d) { return String(d.i) === el.dataset.edev; })[0] : null; }
  function commit(d) { var q = (d && d.q || "").trim().toLowerCase(); if (q.length < 2) return; ST.recents = [q].concat(ST.recents.filter(function (x) { return x !== q; })).slice(0, 5); }
  function setQ(d, q, focus) {
    d.q = q; d.act = 0; d.all = false; d.literal = false; d.browse = false;
    ensureIndex(function () { refreshBody(d); }); renderDevSearch(d, focus);
  }
  function renderDevSearch(d, focus) { drawDev(d); if (focus) { var el = $('[data-edev="' + d.i + '"] [data-eq]', root); if (el) { el.focus({ preventScroll: true }); var L = el.value.length; el.setSelectionRange(L, L); } } }
  function doReset() { ST.ts = 0; ST.rows = "standard"; ST.motion = "phone"; ST.bell = true; ST.mode = "system"; pickTheme(matchMedia("(prefers-color-scheme: light)").matches ? "kitchie-day" : "kitchie"); }
  function onChange(e) {
    var n = e.target; if (!n.hasAttribute || !n.hasAttribute("data-ek") || !root.contains(n)) return; var k = n.getAttribute("data-ek"), d = devOf(n), v = n.type === "checkbox" ? n.checked : n.value;
    if (k === "mode") setMode(v); else if (k === "assistant") { /* drawn only */ } else ST[k] = v;
    if (d && d.q) commit(d);
    renderAll();
  }
  function onClick(e) {
    var b = e.target.closest("[data-ea]"); if (!b || !root.contains(b)) return; var a = b.getAttribute("data-ea"), d = devOf(b);
    if (a.indexOf("pin:") === 0) { var id = a.slice(4), P = d && d.pins ? d.pins : ST.pins, on = P.indexOf(id) > -1, nm = PINNABLE.filter(function (p) { return p.id === id; })[0].t; if (on) P.splice(P.indexOf(id), 1); else P.push(id); if (d && d.q) commit(d); toast(d, on ? "Unpinned " + nm + ". It is still in " + (id === "looks" ? "Settings › Looks, the profile menu" : "Settings › Looks") + " and in search." : "Pinned " + nm + ". A shortcut only: it stays where it was."); renderAll(); var pf = $('[data-edev="' + (d ? d.i : 0) + '"] [data-ea="pin:' + id + '"]', root); if (pf && !root.contains(document.activeElement)) pf.focus({ preventScroll: true }); return; }
    if (a.indexOf("ts:") === 0) { ST.ts = Math.max(-3, Math.min(3, ST.ts + Number(a.slice(3)))); if (d && d.q) commit(d); renderAll(); return; }
    if (a.indexOf("nav:") === 0) { var pg = a.slice(4); if (d && d.kind === "gal") { toast(null, "Opens " + pg + "."); renderAll(); return; } if (d) { d.page = pg; if (pg === "front") { d.q = d.kind === "desk" ? d.q : ""; } } renderAll(); return; }
    if (a.indexOf("go:") === 0) { if (d) commit(d); toast(d || devs[0], "Opens " + a.slice(3) + ", unchanged. (Mockup: nothing is built.)"); renderAll(); return; }
    if (a.indexOf("q:") === 0) { var t = d || devs[0]; if (t.kind === "gal") { t = devs[0]; } if (t.page !== "front") t.page = "front"; ensureIndex(); t.q = a.slice(2); t.act = 0; t.all = false; t.literal = false; t.browse = false; commit(t); renderAll(); var el = $('[data-edev="' + t.i + '"] [data-eq]', root); if (el) el.focus({ preventScroll: true }); return; }
    if (a.indexOf("try:") === 0) { ensureIndex(); var q = a.slice(4); [devs[0], devs[3]].forEach(function (x) { x.page = "front"; x.q = q; x.act = 0; x.all = false; x.literal = false; x.browse = false; }); lastDev = devs[0]; renderAll(); return; }
    if (a === "reset") { doReset(); if (d && d.q) commit(d); toast(d, "Looks, text size, rows, motion and the bell are back to normal. Pinned shortcuts and household settings were not touched."); renderAll(); return; }
    if (a === "all") { d.all = true; refreshBody(d); return; }
    if (a === "literal") { d.literal = true; refreshBody(d); return; }
    if (a === "unliteral") { d.literal = false; refreshBody(d); return; }
    if (a === "browse") { d.browse = !d.browse; refreshBody(d); return; }
    if (a === "feedback") { toast(d, "Thanks. In the app this sends what you typed to the team (mockup: nothing is sent)."); renderAll(); return; }
    if (a === "clear-recents") { ST.recents = []; renderAll(); return; }
  }
  function onInput(e) { var n = e.target; if (!n.hasAttribute || !n.hasAttribute("data-eq") || !root.contains(n)) return; var d = devOf(n); d.q = n.value; d.act = 0; d.all = false; d.literal = false; d.browse = false; lastDev = d; ensureIndex(function () { refreshBody(d); }); refreshBody(d); }
  function move(d, delta) {
    if (!d.cur || !d.cur.length) return; var max = Math.min(d.cur.length, d.all || d.gal ? d.cur.length : 6) - 1; d.act = Math.max(0, Math.min(max, d.act + delta));
    var el = $('[data-edev="' + d.i + '"]', root); $$(".sr", el).forEach(function (r) { var on = +r.getAttribute("data-idx") === d.act; r.classList.toggle("is-active", on); r.setAttribute("aria-selected", String(on)); if (on) { r.scrollIntoView({ block: "nearest" }); $("[data-eq]", el).setAttribute("aria-activedescendant", r.id); } });
  }
  function activate(d) {
    if (!d.cur || !d.cur.length) return; var e = d.cur[d.act].e; commit(d); var row = $("#sr-" + d.i + "-" + e.id, root), c = e.ctl;
    if (c === "bell" || c === "checks") { var k = c; ST[k] = !ST[k]; renderAll(); return; }
    if (c === "reset") { doReset(); toast(d, "Looks, text size, rows, motion and the bell are back to normal. Pinned shortcuts and household settings were not touched."); renderAll(); return; }
    if (c === "themepick") { pickTheme(e.tid); return; }
    if (c === "text") { var tb = $(".tbtn", row); if (tb) tb.focus(); return; }
    if (c === "mode" || c === "rows" || c === "motion") { var r = $("input:checked", row); if (r) r.focus(); return; }
    if (c === "theme") { var t = $("[data-theme-pick][aria-pressed=true]", row) || $("[data-theme-pick]", row); if (t) t.focus(); return; }
    toast(d, e.info ? "Nothing to change here." : "Opens " + e.go + ", unchanged. (Mockup: nothing is built.)"); renderAll();
  }
  function onKeyDown(e) {
    var n = e.target;
    if (n.hasAttribute && n.hasAttribute("data-eq") && root.contains(n)) {
      var d = devOf(n);
      if (e.key === "ArrowDown") { e.preventDefault(); move(d, 1); } else if (e.key === "ArrowUp") { e.preventDefault(); move(d, -1); }
      else if (e.key === "Enter") { e.preventDefault(); activate(d); }
      else if (e.key === "Escape") { e.preventDefault(); if (n.value) { d.q = ""; d.act = 0; n.value = ""; refreshBody(d); } else n.blur(); }
      return;
    }
    var st = n.closest && n.closest(".tstep");
    if (st && root.contains(n) && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { e.preventDefault(); var f = n.getAttribute("data-fk"), dv = devOf(n); ST.ts = Math.max(-3, Math.min(3, ST.ts + (e.key === "ArrowLeft" ? -1 : 1))); renderAll(); var nn = f && $('[data-fk="' + f + '"]', dv ? $('[data-edev="' + dv.i + '"]', root) : root); if (nn) nn.focus({ preventScroll: true }); return; }
    if (e.key === "/" && window.SR_ACTIVE_OPT === "E" && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) {
      var t = lastDev && $('[data-edev="' + lastDev.i + '"] [data-eq]', root) || $("[data-eq]", root); if (t) { e.preventDefault(); ensureIndex(); t.focus(); }
    }
  }
  function mark(e) { var f = e.target.closest && e.target.closest(".fr"); if (f) { window.SR_ACTIVE_OPT = f.dataset.opt; if (f === root) { var d = devOf(e.target); if (d && d.kind !== "gal") lastDev = d; } } }

  function aids() {
    $$("[data-aid-conn]").forEach(function (b) { b.addEventListener("click", function () { ST.conn = +b.dataset.aidConn; renderAll(); }); });
    $$("[data-aid-samples]").forEach(function (b) { b.addEventListener("click", function () { ST.samples = b.getAttribute("aria-pressed") === "true"; renderAll(); }); });
    $$("[data-aid-os]").forEach(function (b) { b.addEventListener("click", function () { setTimeout(renderAll, 0); }); });
  }
  function init() {
    build(); applyAttrs(); renderAll(); aids();
    root.addEventListener("change", onChange); root.addEventListener("click", onClick); root.addEventListener("input", onInput); document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", mark, true); document.addEventListener("focusin", mark, true);
    root.addEventListener("focusin", function (e) { if (e.target.hasAttribute && e.target.hasAttribute("data-eq")) { ensureIndex(); var d = devOf(e.target); if (d && !d.focus) { d.focus = true; if (!d.q.trim()) refreshBody(d); } } });
    root.addEventListener("focusout", function (e) { if (!(e.target.hasAttribute && e.target.hasAttribute("data-eq"))) return; var d = devOf(e.target), to = e.relatedTarget; if (!d || (to && to.closest && to.closest("[data-ebody]"))) return; d.focus = false; if (!d.q.trim()) refreshBody(d); });
    root.addEventListener("mousedown", function (e) { var c = e.target.closest && e.target.closest("[data-ebody] .echip"); if (c && c.closest("[data-edev]") && c.closest("[data-edev]").querySelector("[data-eq]") === document.activeElement) e.preventDefault(); });
    root.addEventListener("pointerenter", function () { if (window.themeWarm) window.themeWarm(); }, { once: true });
    var g = $("[data-egal]", root);
    if (g) { if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); ensureIndex(); } }, { rootMargin: "500px" }); io.observe(g); } else ensureIndex(); }
    document.body.setAttribute("data-e-ready", "1");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
