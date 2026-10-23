/* Settings search RESULTS, four phone options (A to D), mockup only. Kitchie #1090.
   Reads the SAME 52-entry index as fragments/settings-redesign (../settings-redesign/search-index.js, deferred: it loads when search is first used).
   The engine below is a copy of the one in settings-redesign-e.js (tokenise, fold plurals, correct typos, score) plus ONE new rule: page-scoped ranking (SR-P23).
   Search is reachable from every page (front, Looks, Household, ...); results list "On this page" first, then "Everywhere else".
   No storage, no network except theme.js's own files. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- icons (stroke, currentColor) ---------- */
  var P = {
    chev: '<path d="M9 6l6 6-6 6"/>', chevd: '<path d="M6 9l6 6 6-6"/>', back: '<path d="M15 6l-6 6 6 6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', adv: '<circle cx="11" cy="11" r="7" stroke-dasharray="3.2 3"/><path d="M20 20l-4-4"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    house: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    palette: '<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-6-4-11-8-11z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>',
    sparkle: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>', sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>', bell: '<path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    sort: '<path d="M7 5v14M7 19l-3-3M7 19l3-3M17 19V5M17 5l-3 3M17 5l3 3"/>', cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    dl: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>'
  };
  function ic(n, s, extra) { return '<svg class="i" width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || "") + '>' + P[n] + '</svg>'; }
  var AA = '<svg class="i" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><text x="1" y="18" font-size="16" font-weight="800" fill="currentColor" font-family="inherit">Aa</text></svg>';
  var PINI = '<svg class="i" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z"/><path d="M12 14v7" fill="none"/></svg>';

  var SC = { device: ["This device", "phone", "Only this phone"], member: ["You", "person", "Only you, on any phone"], household: ["Whole household", "house", "Everyone in the household"], account: ["Your account", "key", "Your sign-in"], info: ["Not a setting", "info", "Explained here, nothing to change"] };

  /* ---------- pages: which page of Settings a result lives on ---------- */
  var PAGES = { front: "Settings", looks: "Looks", household: "Household", kitchen: "Kitchen setup", preferences: "Preferences", assistants: "Assistants", profile: "Profile", notifs: "Notifications", lists: "Lists", plan: "Plan", app: "App" };
  var PG_ICON = { looks: "palette", household: "house", kitchen: "grid", preferences: "sliders", assistants: "sparkle", profile: "person", notifs: "bell", lists: "sort", plan: "cal", app: "phone" };
  var G2P = { "Looks": "looks", "Text and rows": "looks", "Theme names": "looks", "Household": "household", "Kitchen setup": "kitchen", "Preferences": "preferences", "Food": "preferences", "Assistants": "assistants", "You": "profile", "Account": "profile", "Your data": "profile", "Notifications": "notifs", "Lists": "lists", "Plan": "plan", "App": "app" };
  var OVER = { bell: "household", history: "household" }; /* Proposal: the activity bell and History are about what the household did, so they live under Household */
  var FRONT = ["looks", "household", "kitchen", "assistants", "preferences"];
  var START = [["front", "Settings"], ["looks", "Looks"], ["household", "Household"], ["preferences", "Preferences"], ["kitchen", "Kitchen setup"]];
  var pageOf = function (e) { return OVER[e.id] || G2P[e.g] || "app"; };

  /* ---------- state shared by every phone on the page ---------- */
  var SH = { ts: 1, mode: "system", rows: "standard", motion: false, bell: true, checks: true, pins: ["looks", "text"], recents: ["bigger text", "invite someone", "quiet hours"] };
  var TS = [[1, "Auto"], [1.15, "+15%"], [1.3, "+30%"]];
  var VALS = { me: "Alex", role: "Sous chef", hh: "Henderson kitchen", members: "3 people", invite: "1 pending", cats: "12", locs: "4", gemini: "Not connected", quiet: "22:00 to 06:00", cap: "3 a day", rules: "2 custom", stops: "2 switched off", avoids: "1 hard, 2 soft", likes: "4 likes", subs: "3 saved", notes: "2 notes", props: "1 waiting", tz: "From your phone", units: "None", install: "Not installed", sort: "Name", planoff: "Sat, Sun", prefs: "", csv: "", signout: "", leave: "", disconnect: "", history: "Last 7 days", notif: "", claude: "Connected", chatgpt: "Not connected", defassist: "Claude", samples: "4 left" };
  function val(e) {
    switch (e.val) {
      case "theme": return window.themeName ? window.themeName() : "";
      case "mode": return SH.mode === "system" ? "Auto" : SH.mode === "light" ? "Light" : "Dark";
      case "text": return TS.filter(function (t) { return t[0] === SH.ts; })[0][1];
      case "rows": return SH.rows === "names" ? "Names only" : "Standard";
      case "motion": return SH.motion ? "Reduced" : "Auto";
      case "bell": return SH.bell ? "On" : "Off";
      case "checks": return SH.checks ? "On" : "Off";
      default: return VALS[e.val] || "";
    }
  }
  function applyMode() { var m = SH.mode; if (m === "system") m = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; if (window.__ssrThemeLock) return; document.documentElement.setAttribute("data-theme", m === "light" ? "kitchie-day" : "kitchie"); try { localStorage.setItem("theme", m === "light" ? "kitchie-day" : "kitchie"); } catch (e) {} }

  /* ---------- search engine (copy of settings-redesign-e.js) ---------- */
  var IDX = null, V = null, F = {}, loading = false, waiters = [];
  var STOP = {}; "the a an my to of for in on i it is me how do can want change make set turn show find where what please setting settings and or this that are be get need would there off".split(" ").forEach(function (w) { STOP[w] = 1; });
  function stem(w) { if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + "y"; if (w.length > 4 && /(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2); if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1); return w; }
  function words(s) { var t = String(s).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean); var k = t.filter(function (w) { return !STOP[w]; }); return (k.length ? k : t).map(stem); }
  function dist(a, b) { var m = a.length, n = b.length, d = [], i, j; for (i = 0; i <= m; i++) d[i] = [i]; for (j = 0; j <= n; j++) d[0][j] = j; for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) { var c = a[i - 1] === b[j - 1] ? 0 : 1; d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c); if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); } return d[m][n]; }
  function fuzzy(q, w) { if (q.length < 4 || w.length < 4 || q[0] !== w[0]) return false; var t = q.length >= 7 ? 2 : 1; return Math.abs(q.length - w.length) <= t && dist(q, w) <= t; }
  function eq(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function has(h, n) { if (!n.length || n.length > h.length) return false; for (var i = 0; i + n.length <= h.length; i++) { var ok = true; for (var j = 0; j < n.length; j++) if (h[i + j] !== n[j]) { ok = false; break; } if (ok) return true; } return false; }
  function prep() {
    V = {};
    IDX.forEach(function (e, n) {
      e._n = n; e._pg = pageOf(e); e._lab = { tok: words(e.t), text: e.t }; e._aka = (e.aka || []).map(function (a) { return { tok: words(a), text: a }; });
      e._syn = e.syn.split("|").map(function (p) { return { tok: words(p), text: p }; });
      e._aff = {}; words(e.aff + " " + e.where + " " + e.g).forEach(function (w) { e._aff[w] = 1; });
      [e._lab].concat(e._aka, e._syn).forEach(function (p) { p.tok.forEach(function (w, i) { var raw = p.text.toLowerCase().replace(/['’]/g, "").split(/[^a-z0-9]+/).filter(function (x) { return !STOP[x]; })[i]; F[w] = (F[w] || 0) + 1; if (!V[w]) V[w] = raw && stem(raw) === w ? raw : w; }); });
    });
  }
  function known(t) { if (V[t]) return true; if (t.length < 2) return false; for (var w in V) if (w.indexOf(t) === 0) return true; return false; }
  function correct(qt) { var out = [], changed = false; qt.forEach(function (t) { if (known(t) || t.length < 4) { out.push(t); return; } var best = null, bd = 9; for (var w in V) if (fuzzy(t, w)) { var d = dist(t, w) + (w.length === t.length ? 0 : 0.5); if (d < bd || (d === bd && (F[w] || 0) > (F[best] || 0))) { best = w; bd = d; } } if (best) { out.push(best); changed = true; } else out.push(t); }); return changed ? out : null; }
  function scoreEntry(e, qt) {
    var best = 0, why = null, n = qt.length;
    function up(s, w) { if (s > best) { best = s; why = w; } }
    [e._lab].concat(e._aka).forEach(function (l, li) {
      var w = li === 0 ? { t: "exact" } : { t: "aka", text: l.text }, cap = e.ctl === "themepick" ? 70 : 100;
      if (eq(l.tok, qt)) up(100, w); else if (qt.every(function (q) { return l.tok.indexOf(q) > -1; })) up(Math.min(92, cap), li === 0 ? { t: "label" } : w); else if (qt.every(function (q) { return q.length >= 2 && l.tok.some(function (x) { return x.indexOf(q) === 0; }); })) up(Math.min(80, cap), li === 0 ? { t: "label" } : w);
    });
    e._syn.forEach(function (p) { if (eq(p.tok, qt)) up(90, { t: "syn", text: p.text }); else if (p.tok.length >= 2 && has(qt, p.tok)) up(72, { t: "syn", text: p.text }); else if (n >= 2 && has(p.tok, qt)) up(66, { t: "syn", text: p.text }); });
    var sum = 0, hit = 0, sw = null;
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
  /* SR-P23: page-scoped ranking. Score every entry as before (global relevance). Then split: an entry is "On this page" when it lives on the page the
     person is on AND its score is at least half the best score (so a weak partial hit on this page never outranks a strong answer elsewhere).
     On this page comes first; inside each list the order is global relevance. From the front page there is no "this page". */
  function search(q, ctx) {
    var qt = words(q); if (!qt.length || !q.trim()) return { on: [], rest: [], qt: qt, use: qt };
    var fix = correct(qt), use = fix || qt, items = [];
    IDX.forEach(function (e) { var r = scoreEntry(e, use); if (r.s >= 10) items.push({ e: e, s: r.s, why: r.why }); });
    items.sort(function (a, b) { return b.s - a.s || a.e.pri - b.e.pri || a.e._n - b.e._n; });
    var top = items.length ? items[0].s : 0, on = [], rest = [];
    items.forEach(function (x) { if (ctx !== "front" && x.e._pg === ctx && x.s >= Math.max(20, top / 5)) on.push(x); else rest.push(x); });
    return { on: on, rest: rest, n: items.length, qt: qt, use: use, fixed: fix ? fix.map(function (w) { return V[w] || w; }).join(" ") : null, all: items };
  }
  window.SSR_SEARCH = { run: function (q, ctx) { if (!IDX) return null; var r = search(q, ctx || "front"); return { on: r.on.map(function (x) { return x.e.id; }), rest: r.rest.map(function (x) { return x.e.id; }), fixed: r.fixed, top: r.all && r.all[0] && r.all[0].why }; }, size: function () { return IDX ? IDX.length : 0; }, ready: function () { return !!IDX; } };

  function ensureIndex(cb) {
    if (IDX) { cb(); return; }
    waiters.push(cb); if (loading) return; loading = true;
    var s = document.createElement("script"); s.src = "../settings-redesign/search-index.js";
    s.onload = function () { /* Owner decision (24 Oct 2026): there is no Emoji setting. Dropped here so the mockup shows what the index will hold. */ IDX = (window.SR_E_INDEX || []).filter(function (e) { return e.id !== "emoji"; }); prep(); waiters.splice(0).forEach(function (f) { f(); }); };
    s.onerror = function () { loading = false; };
    document.head.appendChild(s);
  }

  /* ---------- highlight: matched words in a piece of text ---------- */
  function hl(text, use) {
    if (!use || !use.length) return esc(text);
    return String(text).split(/([A-Za-z0-9’']+)/).map(function (p, i) {
      if (i % 2 === 0) return esc(p);
      var w = stem(p.toLowerCase().replace(/['’]/g, "")), hit = use.some(function (q) { return w === q || (q.length >= 2 && w.indexOf(q) === 0) || fuzzy(q, w); });
      return hit ? "<mark>" + esc(p) + "</mark>" : esc(p);
    }).join("");
  }
  function crumb(e) { return e.where.replace(/ ?\(search only\)/, "").replace(/^Search only$/, "Search only"); }
  /* the evidence line ("matches 'x'") is only shown when the name and the place do not already carry the match */
  function evid(x, U) {
    var w = x.why || {}; if (w.t !== "syn" && w.t !== "aka") return null;
    if (U && U.length) { var own = words(x.e.t + " " + crumb(x.e)); if (U.every(function (q) { return own.some(function (o) { return o === q || (q.length >= 2 && o.indexOf(q) === 0) || fuzzy(q, o); }); })) return null; }
    return { k: w.t, text: w.text };
  }
  var pinned = function (e) { return e.pin && SH.pins.indexOf(e.pin) > -1; };
  var pinMark = function (e) { return pinned(e) ? '<span class="pinm" role="img" aria-label="Shortcut on Settings" title="Shortcut on Settings">' + PINI + '</span>' : ""; };
  var advMark = function (e) { return e.adv ? '<span class="advm" role="img" aria-label="Only found by search" title="Only found by search">' + ic("adv", 15) + '</span>' : ""; };
  var scMark = function (e, sz) { var s = SC[e.sc]; return '<span class="scp" data-sc="' + e.sc + '" data-lp="' + esc(s[0] + ": " + s[2]) + '" role="img" aria-label="' + esc(s[0]) + '" title="' + esc(s[0]) + '">' + ic(s[1], sz || 18) + '</span>'; };

  /* ---------- controls ---------- */
  function sw(key, on, label) { return '<label class="sw"><input type="checkbox" data-a="tog:' + key + '"' + (on ? " checked" : "") + '><i class="swt"></i><span class="sro">' + esc(label) + '</span></label>'; }
  function seg(key, opts, cur, label) { return '<div class="seg" role="radiogroup" aria-label="' + esc(label) + '">' + opts.map(function (o) { return '<button type="button" role="radio" aria-checked="' + (String(o[0]) === String(cur)) + '" data-a="set:' + key + ':' + o[0] + '">' + esc(o[1]) + '</button>'; }).join("") + '</div>'; }
  function ctlFull(e) {
    switch (e.ctl) {
      case "theme": return '<div class="sws" role="group" aria-label="Theme">' + (window.themeHtml ? window.themeHtml(null, true) : "") + '</div>';
      case "mode": return seg("mode", [["system", "Auto"], ["light", "Light"], ["dark", "Dark"]], SH.mode, "Light or dark");
      case "text": return seg("ts", TS, SH.ts, "Text size");
      case "rows": return seg("rows", [["standard", "Standard"], ["names", "Names only"]], SH.rows, "Rows");
      case "motion": return '<div class="swrow"><span>Always reduce motion</span>' + sw("motion", SH.motion, "Reduce motion") + '</div>';
      case "bell": return '<div class="swrow"><span>Show the bell</span>' + sw("bell", SH.bell, "Household activity bell") + '</div>';
      case "checks": return '<div class="swrow"><span>Ask me to check</span>' + sw("checks", SH.checks, "Ask me to check amounts") + '</div>';
      case "reset": return '<button type="button" class="btn" data-a="reset">Reset display choices</button>';
      case "themepick": return '<button type="button" class="btn" data-a="use:' + e.id.slice(3) + '">Use ' + esc(e.t) + '</button>';
    }
    return "";
  }
  function stepper(e) { var i = TS.map(function (t) { return t[0]; }).indexOf(SH.ts); return '<span class="step" role="group" aria-label="Text size"><button type="button" data-a="step:-1" aria-label="Smaller text"' + (i <= 0 ? " disabled" : "") + '>' + ic("minus", 18) + '</button><b>' + TS[i][1] + '</b><button type="button" data-a="step:1" aria-label="Larger text"' + (i >= TS.length - 1 ? " disabled" : "") + '>' + ic("plus", 18) + '</button></span>'; }
  function inlineCtl(e) {
    if (e.ctl === "bell") return sw("bell", SH.bell, e.t);
    if (e.ctl === "checks") return sw("checks", SH.checks, e.t);
    if (e.ctl === "motion") return sw("motion", SH.motion, e.t);
    if (e.ctl === "text") return stepper(e);
    return "";
  }

  /* ---------- the four row styles ---------- */
  function nameHtml(e, U) { return hl(e.t, U); }
  function rowA(x, U, ph) {
    var e = x.e, ev = evid(x, U), open = ph.open === e.id;
    var l2 = ev ? '<span class="ev">' + (ev.k === "aka" ? "was " : "") + '“' + hl(ev.text, U) + '” · ' + esc(e.g) + '</span>' : hl(crumb(e), U);
    var det = open ? '<div class="det"><p>' + esc(e.aff) + '</p><p class="meta">' + scMark(e, 16) + ' <span>' + esc(SC[e.sc][0]) + '</span>' + (val(e) && !e.info ? ' <span class="dot">·</span> <span>Now: <b>' + esc(val(e)) + '</b></span>' : "") + '</p>' + (e.adv ? '<p class="meta">' + ic("adv", 16) + ' <span>No page shows this. Only search finds it.</span></p>' : "") +
      (e.ctl ? '<div class="dctl">' + ctlFull(e) + '</div>' : e.info ? '<p class="meta">' + esc(e.info) + '</p>' : "") + (e.ctl ? '<button type="button" class="lnk" data-a="go:' + e.id + '">Go to ' + esc(PAGES[e._pg]) + ic("chev", 16) + '</button>' : '<button type="button" class="btn" data-a="go:' + e.id + '">Open ' + esc(e.go || PAGES[e._pg]) + '</button>') + '</div>' : "";
    return '<li class="row rA' + (open ? " open" : "") + '" data-id="' + e.id + '"><button type="button" class="main" data-a="exp:' + e.id + '" aria-expanded="' + open + '"><span class="tx"><span class="nm">' + nameHtml(e, U) + pinMark(e) + '</span><span class="l2">' + l2 + '</span></span><span class="rt">' + ic(open ? "chevd" : "chev", 20).replace('class="i"', 'class="i cv' + (open ? " up" : "") + '"') + '</span></button>' + det + '</li>';
  }
  function rowB(x, U) {
    var e = x.e, ev = evid(x, U), c = inlineCtl(e), v = val(e);
    var l2 = '<span class="l2">' + scMark(e, 14) + '<span class="ev">' + (ev ? '“' + hl(ev.text, U) + '” · ' + esc(e.g) : hl(crumb(e), U)) + '</span></span>';
    var right = c ? '<span class="rt ctl">' + c + '</span>' : '<span class="rt">' + (v && !e.info ? '<span class="val">' + esc(v) + '</span>' : "") + ic("chev", 20) + '</span>';
    return '<li class="row rB' + (c ? " hasctl" : "") + '" data-id="' + e.id + '"><button type="button" class="main" data-a="go:' + e.id + '"><span class="tx"><span class="nm">' + nameHtml(e, U) + pinMark(e) + advMark(e) + '</span>' + l2 + '</span>' + (c ? "" : right) + '</button>' + (c ? right : "") + '</li>';
  }
  function rowC(x, U) {
    var e = x.e;
    return '<li class="row rC" data-id="' + e.id + '"><button type="button" class="main" data-a="go:' + e.id + '"><span class="nm">' + nameHtml(e, U) + pinMark(e) + advMark(e) + '</span><span class="rt">' + scMark(e, 18) + ic("chev", 20) + '</span></button></li>';
  }
  function bestC(x, U, ph) {
    var e = x.e, ev = evid(x, U), c = e.ctl && e.ctl !== "themepick" && e.ctl !== "reset" ? ctlFull(e) : "";
    return '<li class="row best" data-id="' + e.id + '"><button type="button" class="main" data-a="go:' + e.id + '"><span class="nm">' + nameHtml(e, U) + pinMark(e) + advMark(e) + '</span>' + (ev ? '<span class="ev">matches “' + hl(ev.text, U) + '”</span>' : '<span class="ev">' + hl(crumb(e), U) + '</span>') + '</button><p class="aff">' + esc(e.aff) + '</p><p class="meta">' + scMark(e, 16) + ' <span>' + esc(SC[e.sc][0]) + '</span></p>' + (c ? '<div class="dctl">' + c + '</div>' : '<button type="button" class="btn" data-a="go:' + e.id + '">Open ' + esc(e.go || PAGES[e._pg]) + '</button>') + '</li>';
  }
  var AIC = { looks: AA, household: ic("house", 22), kitchen: ic("grid", 22), preferences: ic("sliders", 22), assistants: ic("sparkle", 22), profile: ic("person", 22), notifs: ic("bell", 22), lists: ic("sort", 22), plan: ic("cal", 22), app: ic("phone", 22) };
  function areaIcon(e) { if (e.id === "text") return AA; if (e.g === "Theme names" || e.id === "theme") return ic("palette", 22); if (e.g === "Food") return ic("leaf", 22); if (e.id === "history") return ic("clock", 22); if (e.id === "csv") return ic("dl", 22); return AIC[e._pg] || ic("sliders", 22); }
  function rowD(x, U) {
    var e = x.e, ev = evid(x, U);
    var l2 = ev ? 'matches “' + hl(ev.text, U) + '”' : hl(crumb(e), U);
    return '<li class="row rD" data-id="' + e.id + '"><button type="button" class="main" data-a="go:' + e.id + '"><span class="tile">' + areaIcon(e) + '</span><span class="tx"><span class="nm">' + nameHtml(e, U) + '</span><span class="l2' + (ev ? " ev" : "") + '">' + l2 + '</span></span><span class="rt">' + pinMark(e) + advMark(e) + scMark(e, 20) + ic("chev", 20) + '</span></button></li>';
  }

  /* ---------- phone ---------- */
  var phones = [];
  function Phone(host, opt) {
    var ph = this; ph.opt = opt; ph.page = "front"; ph.q = ""; ph.searching = false; ph.ctx = "front"; ph.stack = []; ph.open = null; ph.limit = 9; ph.legend = false; ph.literal = false; ph.flash = null; ph.browse = false;
    ph.el = document.createElement("div"); ph.el.className = "phone"; ph.el.setAttribute("data-opt", opt);
    ph.el.innerHTML = '<header class="hd"><button type="button" class="bk" data-a="back"></button><h3 class="ttl"></h3><button type="button" class="ib" data-a="opensearch" aria-label="Search Settings">' + ic("search", 22) + '</button></header>' +
      '<div class="sb"><label class="find">' + ic("search", 20) + '<input type="search" data-eq placeholder="Search Settings" aria-label="Search Settings" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="clr" data-a="clear" aria-label="Clear search">' + ic("x", 18) + '</button></label><button type="button" class="cancel" data-a="cancel">Cancel</button></div>' +
      '<div class="bd" data-bd></div><div class="toast" role="status" aria-live="polite" hidden></div>';
    host.appendChild(ph.el); phones.push(ph);
    ph.inp = $("[data-eq]", ph.el); ph.bd = $("[data-bd]", ph.el);
    ph.inp.addEventListener("focus", function () { if (!ph.searching) { ph.begin(); } ensureIndex(function () { ph.draw(); }); });
    ph.inp.addEventListener("input", function () { ph.q = ph.inp.value; ph.limit = 9; ph.literal = false; ph.open = null; ensureIndex(function () { ph.draw(); }); ph.draw(); ph.chrome(); });
    ph.inp.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { if (ph.q) ph.set(""); else ph.end(); } if (ev.key === "Enter") { var f = $(".row .main", ph.bd); if (f && ph.q) f.click(); } });
    ph.el.addEventListener("click", function (ev) { var t = ev.target.closest("[data-a]"); if (t && ph.el.contains(t) && t.type !== "checkbox") ph.act(t.getAttribute("data-a"), ev); });
    ph.el.addEventListener("change", function (ev) { var t = ev.target.closest("[data-a]"); if (t && t.type === "checkbox") { SH[t.getAttribute("data-a").slice(4)] = t.checked; syncAll(); } });
    var lp; ph.el.addEventListener("pointerdown", function (ev) { var s = ev.target.closest("[data-lp]"); if (!s) return; lp = setTimeout(function () { ph.toast(s.getAttribute("data-lp")); }, 450); });
    ["pointerup", "pointerleave", "pointercancel", "scroll"].forEach(function (n) { ph.el.addEventListener(n, function () { clearTimeout(lp); }, true); });
    ph.chrome(); ph.draw();
  }
  var Pp = Phone.prototype;
  Pp.toast = function (m) { var t = $(".toast", this.el); t.textContent = m; t.hidden = false; clearTimeout(this._t); this._t = setTimeout(function () { t.hidden = true; }, 2600); };
  Pp.begin = function () { this.searching = true; this.ctx = this.page; this.chrome(); };
  Pp.end = function () { this.searching = false; this.q = ""; this.inp.value = ""; this.open = null; this.legend = false; this.stack = []; this.inp.blur(); this.chrome(); this.draw(); };
  Pp.set = function (q, focus) { var ph = this; if (!ph.searching) ph.begin(); ph.q = q; ph.inp.value = q; ph.limit = 9; ph.literal = false; ph.open = null; ensureIndex(function () { ph.draw(); }); ph.chrome(); ph.draw(); if (focus) ph.inp.focus({ preventScroll: true }); };
  Pp.goPage = function (p, flashId) { this.page = p; this.searching = false; this.flash = flashId || null; this.chrome(); this.draw(); };
  Pp.chrome = function () {
    var ph = this, front = ph.page === "front", s = ph.searching;
    ph.el.setAttribute("data-page", ph.page); ph.el.setAttribute("data-searching", String(s));
    $(".hd", ph.el).hidden = s;
    $(".sb", ph.el).hidden = !(s || front);
    $(".sb", ph.el).classList.toggle("on", s);
    $(".ttl", ph.el).textContent = PAGES[ph.page];
    var bk = $(".bk", ph.el); bk.hidden = front; bk.innerHTML = front ? "" : ic("back", 20) + '<span>' + (ph.stack.length ? "Results" : "Settings") + '</span>'; bk.setAttribute("aria-label", ph.stack.length ? "Back to search results" : "Back to Settings");
    $(".ib", ph.el).hidden = front;
    $(".clr", ph.el).hidden = !ph.q;
    ph.el.style.setProperty("--ts", SH.ts);
  };
  Pp.act = function (a, ev) {
    var ph = this, m;
    if (a === "back") { if (ph.stack.length) { var s = ph.stack.pop(); ph.page = s.ctx; ph.searching = true; ph.ctx = s.ctx; ph.q = s.q; ph.inp.value = s.q; ph.flash = null; ph.chrome(); ph.draw(); } else { ph.page = "front"; ph.chrome(); ph.draw(); } return; }
    if (a === "opensearch") { ph.begin(); ph.chrome(); ph.inp.focus(); ensureIndex(function () { ph.draw(); }); ph.draw(); return; }
    if (a === "cancel") { ph.end(); return; }
    if (a === "clear") { ph.set("", true); return; }
    if (a === "reset") { SH.mode = "system"; SH.rows = "standard"; SH.motion = false; SH.bell = true; SH.ts = 1; applyMode(); syncAll(); ph.toast("Display choices are back to normal. Pins and household data are untouched."); return; }
    if (a === "legend") { ph.legend = !ph.legend; ph.draw(); return; }
    if (a === "more") { ph.limit += 100; ph.draw(); return; }
    if (a === "literal") { ph.literal = true; ph.draw(); return; }
    if (a === "browse") { ph.browse = !ph.browse; ph.draw(); return; }
    if (a === "feedback") { ph.toast("Thanks. This sends only the words you typed, and only if you agree."); return; }
    if (a === "clear-recents") { SH.recents = []; syncAll(); return; }
    if (a === "keep") { ph.set(ph.q, true); return; }
    if ((m = /^q:(.*)$/.exec(a))) { ph.set(m[1], false); return; }
    if ((m = /^pg:(.*)$/.exec(a))) { ph.goPage(m[1]); return; }
    if ((m = /^exp:(.*)$/.exec(a))) { ph.open = ph.open === m[1] ? null : m[1]; ph.draw(); return; }
    if ((m = /^set:([a-z]+):(.*)$/.exec(a))) { if (m[1] === "ts") SH.ts = parseFloat(m[2]); else SH[m[1]] = m[2]; if (m[1] === "mode") applyMode(); syncAll(); return; }
    if ((m = /^step:(-?1)$/.exec(a))) { var arr = TS.map(function (t) { return t[0]; }), i = Math.max(0, Math.min(arr.length - 1, arr.indexOf(SH.ts) + parseInt(m[1], 10))); SH.ts = arr[i]; syncAll(); return; }
    if ((m = /^use:(.*)$/.exec(a))) { if (window.themeName) { var b = document.querySelector('[data-theme-pick="' + m[1] + '"]'); } ph.toast("Theme changed to " + m[1].replace(/-/g, " ") + " (mockup: use the picker, bottom right)."); return; }
    if ((m = /^go:(.*)$/.exec(a))) { ph.jump(m[1]); return; }
  };
  Pp.jump = function (id) {
    var ph = this, e = IDX.filter(function (x) { return x.id === (id === "th-all" ? "theme" : id); })[0]; if (!e) return; id = e.id;
    if (ph.q.trim()) { SH.recents = [ph.q.trim()].concat(SH.recents.filter(function (r) { return r !== ph.q.trim(); })).slice(0, 4); }
    ph.stack.push({ ctx: ph.ctx, q: ph.q }); ph.goPage(e._pg, id);
  };
  Pp.pageHtml = function () {
    var ph = this, p = ph.page;
    if (p === "front") {
      var pins = IDX ? IDX.filter(function (e) { return e.id === "theme" || e.id === "text"; }) : [];
      return '<div class="pg"><p class="lbl">Shortcuts</p><ul class="plist">' + [["looks", "Looks", "palette"], ["text", "Text size", "aa"]].map(function (r) { return '<li class="prow"><button type="button" class="main" ' + (r[0] === "text" ? 'data-a="pg:looks"' : 'data-a="pg:looks"') + '><span class="tile">' + (r[2] === "aa" ? AA : ic("palette", 22)) + '</span><span class="nm">' + r[1] + pinMark({ pin: r[0] }) + '</span><span class="rt"><span class="val">' + (r[0] === "text" ? TS.filter(function (t) { return t[0] === SH.ts; })[0][1] : (window.themeName ? window.themeName() : "")) + '</span>' + ic("chev", 20) + '</span></button></li>'; }).join("") + '</ul>' +
        '<p class="lbl">Settings</p><ul class="plist">' + FRONT.map(function (k) { return '<li class="prow"><button type="button" class="main" data-a="pg:' + k + '"><span class="tile">' + AIC[k] + '</span><span class="nm">' + PAGES[k] + '</span><span class="rt">' + ic("chev", 20) + '</span></button></li>'; }).join("") + '</ul><p class="hint">Everything else is one search away, from any page.</p></div>';
    }
    if (!IDX) return '<div class="pg"><p class="hint" data-loading>Loading…</p></div>';
    var rows = IDX.filter(function (e) { return e._pg === p && !e.adv && e.ctl !== "themepick" && !e.info; });
    var tgt = ph.flash && IDX.filter(function (e) { return e.id === ph.flash; })[0], extra = tgt && rows.indexOf(tgt) < 0 ? tgt : null;
    function prow(e) { var c = inlineCtl(e), v = val(e); return '<li class="prow' + (ph.flash === e.id ? " flash" : "") + '" data-id="' + e.id + '"><div class="main"><span class="nm">' + esc(e.t) + pinMark(e) + '</span>' + (c ? '<span class="rt">' + c + '</span>' : '<span class="rt">' + (v ? '<span class="val">' + esc(v) + '</span>' : "") + ic("chev", 20) + '</span>') + '</div></li>'; }
    return '<div class="pg"><ul class="plist">' + rows.map(prow).join("") + '</ul>' + (extra ? '<p class="lbl">Opened from search</p><ul class="plist">' + prow(extra) + '</ul><p class="hint">' + (extra.adv ? "No page lists this one. Only search finds it." : esc(extra.aff)) + '</p>' : "") + '</div>';
  };
  Pp.emptyHtml = function () {
    var ph = this, sug = { front: ["bigger text", "dark mode", "invite someone", "stop the questions", "quiet hours"], looks: ["theme", "bigger text", "dark mode", "hard to see"], household: ["invite someone", "remove someone", "someone changed", "household name"], preferences: ["quiet hours", "stop the questions", "food rules"], kitchen: ["categories", "locations", "sample items"] }[ph.page] || ["bigger text", "dark mode"];
    var rc = SH.recents;
    return '<div class="emp">' + (rc.length ? '<p class="lbl">Recent <button type="button" class="lnk sm" data-a="clear-recents">Clear</button></p><ul class="recent">' + rc.map(function (r) { return '<li><button type="button" class="main" data-a="q:' + esc(r) + '">' + ic("clock", 18) + '<span>' + esc(r) + '</span></button></li>'; }).join("") + '</ul>' : "") +
      '<p class="lbl">' + (ph.page === "front" ? "Try" : "Try, from " + esc(PAGES[ph.page])) + '</p><div class="chips">' + sug.map(function (r) { return '<button type="button" class="chip" data-a="q:' + esc(r) + '">' + esc(r) + '</button>'; }).join("") + '</div>' +
      '<p class="hint">' + (IDX ? IDX.length : 51) + ' things to find, including ones no page shows. Plain words and typos are fine.</p></div>';
  };
  Pp.noneHtml = function (q) {
    var areas = FRONT.concat(["profile"]);
    return '<div class="none" data-empty><p class="big">Nothing matches “' + esc(q) + '”</p><p class="hint">Try a simpler word, or one of these:</p><div class="chips">' + ["theme", "text size", "household", "quiet hours"].map(function (r) { return '<button type="button" class="chip" data-a="q:' + r + '">' + r + '</button>'; }).join("") + '</div>' +
      '<p class="lbl">Browse by area</p><div class="chips">' + areas.map(function (k) { return '<button type="button" class="chip" data-a="q:' + PAGES[k] + '">' + PAGES[k] + '</button>'; }).join("") + '</div><button type="button" class="lnk" data-a="feedback">Tell us what you were looking for</button></div>';
  };
  var LEGEND = [["phone", "This device"], ["person", "You"], ["house", "Whole household"], ["key", "Your account"], ["adv", "Only found by search"]];
  Pp.legendHtml = function () { return '<ul class="legend" data-legend>' + LEGEND.map(function (l) { return '<li>' + ic(l[0], 18) + '<span>' + l[1] + '</span></li>'; }).join("") + '<li>' + PINI + '<span>A shortcut on Settings</span></li></ul>'; };
  /* ten theme names would flood the list: three or more collapse into one row */
  function collapse(list) {
    var th = list.filter(function (x) { return x.e.ctl === "themepick"; }); if (th.length < 3) return list.slice();
    var names = th.map(function (x) { return x.e.t; }), at = list.indexOf(th[0]), out = [], done = false;
    list.forEach(function (x, i) { if (x.e.ctl === "themepick") { if (!done) { done = true; out.push({ e: { id: "th-all", t: "Theme names", g: "Looks", sc: "device", where: names.join(", "), aff: "Ten named looks for the whole app. Pick one on Looks.", _pg: "looks", go: "Looks", val: "", syn: "", _n: 0 }, s: th[0].s, why: { t: "label" } }); } } else out.push(x); });
    return out;
  }
  Pp.draw = function () {
    var ph = this, bd = ph.bd, o = ph.opt;
    bd.setAttribute("data-opt", o);
    if (!ph.searching) { bd.innerHTML = ph.pageHtml(); ph.afterDraw(); return; }
    if (!ph.q.trim()) { bd.innerHTML = ph.emptyHtml(); return; }
    if (!IDX) { bd.innerHTML = '<p class="hint" data-loading>Loading the search index…</p>'; return; }
    var r = search(ph.q, ph.ctx), U = ph.literal ? words(ph.q) : r.use;
    if (ph.literal) { r = (function () { var qt = words(ph.q), items = []; IDX.forEach(function (e) { var s = scoreEntry(e, qt); if (s.s >= 10) items.push({ e: e, s: s.s, why: s.why }); }); items.sort(function (a, b) { return b.s - a.s || a.e.pri - b.e.pri; }); var top = items.length ? items[0].s : 0, on = [], rest = []; items.forEach(function (x) { if (ph.ctx !== "front" && x.e._pg === ph.ctx && x.s >= Math.max(20, top / 5)) on.push(x); else rest.push(x); }); return { on: on, rest: rest, n: items.length }; })(); }
    if (!r.n) { bd.innerHTML = ph.noneHtml(ph.q); return; }
    var h = "";
    if (r.fixed && !ph.literal) h += '<p class="fix" data-fixed>Showing results for <b>“' + esc(r.fixed) + '”</b> · <button type="button" class="lnk sm" data-a="literal">Use “' + esc(ph.q) + '”</button></p>';
    var best = null, on = collapse(r.on), rest = collapse(r.rest);
    if (o === "C") { if (on.length) best = on.shift(); else best = rest.shift(); }
    var shown = 0, lim = ph.limit, rowFn = { A: function (x) { return rowA(x, U, ph); }, B: function (x) { return rowB(x, U); }, C: function (x) { return rowC(x, U); }, D: function (x) { return rowD(x, U); } }[o];
    var total = on.length + rest.length;
    function take(list) { var out = list.slice(0, Math.max(0, lim - shown)); shown += out.length; return out; }
    var head = function (label, sub, first) { return '<div class="sh" data-section="' + (sub ? "on" : "else") + '"><span class="shl">' + label + (sub ? ' <b>' + esc(sub) + '</b>' : "") + '</span>' + (first ? '<button type="button" class="ib sm" data-a="legend" aria-label="What the icons mean" aria-expanded="' + ph.legend + '">' + ic("info", 20) + '</button>' : "") + '</div>'; };
    var list = "", first = true;
    var hadOn = r.on.length > 0;
    var restHead = false;
    if (best) { if (hadOn) { h += head("On this page", PAGES[ph.ctx], true); } else { if (ph.ctx !== "front") h += '<p class="nopage">Nothing on ' + esc(PAGES[ph.ctx]) + ' matches.</p>'; h += head(ph.ctx === "front" ? "Best match" : "Everywhere else", null, true); restHead = true; } first = false; h += '<ul class="rows bestwrap">' + bestC(best, U, ph) + '</ul>'; }
    if (ph.ctx !== "front") {
      if (on.length) { list += (best && hadOn ? "" : head("On this page", PAGES[ph.ctx], first)); first = false; list += '<ul class="rows" role="list">' + take(on).map(rowFn).join("") + '</ul>'; }
      else if (!hadOn && !best) list += '<p class="nopage">Nothing on ' + esc(PAGES[ph.ctx]) + ' matches.</p>';
    }
    if (rest.length) {
      if (!restHead) list += head(ph.ctx === "front" ? (best ? "Other results" : "Results") : "Everywhere else", null, first);
      if (o === "C") {
        var groups = {}, order = [];
        take(rest).forEach(function (x) { var k = PAGES[x.e._pg]; if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(x); });
        order.forEach(function (k) { list += '<p class="gh">' + esc(k) + '</p><ul class="rows">' + groups[k].map(rowFn).join("") + '</ul>'; });
      } else list += '<ul class="rows" role="list">' + take(rest).map(rowFn).join("") + '</ul>';
    }
    var left = total - shown;
    h += list + (left > 0 ? '<button type="button" class="more" data-a="more">Show ' + left + ' more</button>' : "");
    if (ph.legend) h = h.replace(/(<div class="sh"[^>]*>.*?<\/div>)/, "$1" + ph.legendHtml());
    bd.innerHTML = h;
  };
  Pp.afterDraw = function () {
    var ph = this; if (!ph.flash) return; var el = $('[data-id="' + ph.flash + '"]', ph.bd); if (!el) return;
    el.scrollIntoView({ block: "center" }); var id = ph.flash; setTimeout(function () { el.classList.remove("flash"); if (ph.flash === id) ph.flash = null; }, 2200);
  };
  function syncAll() { phones.forEach(function (p) { p.el.style.setProperty("--ts", SH.ts); p.chrome(); p.draw(); }); var s = $("[data-ts-aid]"); if (s) $$("[data-ts-aid] button").forEach(function (b) { b.setAttribute("aria-pressed", String(parseFloat(b.dataset.ts) === SH.ts)); }); }

  /* ---------- page controller ---------- */
  window.SSR = { Phone: Phone, phones: phones, SH: SH, syncAll: syncAll, ensureIndex: ensureIndex, PAGES: PAGES, applyMode: applyMode, START: START };
})();
