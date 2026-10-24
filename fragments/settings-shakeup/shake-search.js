/* Settings shake-up: the search engine. Loaded on engagement only (first focus of a search box, a typed letter, or a sub page that needs the index), never on page load.
   It is the engine of fragments/settings-redesign and settings-search-results, unchanged in how it scores (exact label, old name, synonym, phrase, words, typos; search-only entries score 4 lower;
   page-scoped ranking SR-P23), so the owner's earlier search decisions stand. Only the data wrapper is new: the index is ../settings-redesign/search-index.js (Emoji dropped: no such setting). */
(function () {
  "use strict";
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
      e._n = n; e._lab = { tok: words(e.t), text: e.t }; e._aka = (e.aka || []).map(function (a) { return { tok: words(a), text: a }; });
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
  /* page-scoped ranking (SR-P23): "on this page" = lives on the page the person is on AND scores at least a fifth of the best score (and 20); the rest are "everywhere else". */
  function run(q, ctx, pageOf) {
    var qt = words(q); if (!qt.length || !String(q).trim()) return { on: [], rest: [], qt: qt, use: qt };
    var fix = correct(qt), use = fix || qt, items = [];
    IDX.forEach(function (e) { var r = scoreEntry(e, use); if (r.s >= 10) items.push({ e: e, s: r.s, why: r.why }); });
    items.sort(function (a, b) { return b.s - a.s || a.e.pri - b.e.pri || a.e._n - b.e._n; });
    var top = items.length ? items[0].s : 0, on = [], rest = [];
    items.forEach(function (x) { var pg = pageOf(x.e); if (!x.e.adv && (pg === ctx || pg === "*") && x.s >= Math.max(20, top / 5)) on.push(x); else rest.push(x); });
    return { on: on, rest: rest, n: items.length, qt: qt, use: use, fixed: fix ? fix.map(function (w) { return V[w] || w; }).join(" ") : null };
  }
  /* owner decisions of 24 Oct 2026, applied on load without touching the shared index: your own name and profile live under Household (tap yourself), so those words find "My name and picture";
     the activity bell is pinnable and sits on the Looks page, so it is no longer search-only */
  function patch(I) {
    I.forEach(function (e) {
      if (e.id === "me") e.aka = (e.aka || []).concat(["my name", "my profile", "profile", "edit my name"]);
      if (e.id === "me") e.syn += "|profile|my profile|edit my name|change my name|rename myself|my account|who am i|my details";
      if (e.id === "bell") e.adv = false;
      if (e.id === "text") e.aka = (e.aka || []).filter(function (a) { return !/name/i.test(a); });
    });
  }
  function load(cb) {
    if (IDX) { cb(); return; }
    waiters.push(cb); if (loading) return; loading = true;
    var s = document.createElement("script"); s.src = "../settings-redesign/search-index.js";
    s.onload = function () { IDX = (window.SR_E_INDEX || []).filter(function (e) { return e.id !== "emoji"; }); patch(IDX); prep(); waiters.splice(0).forEach(function (f) { f(); }); };
    s.onerror = function () { loading = false; };
    document.head.appendChild(s);
  }
  window.ShakeSearch = { load: load, run: run, words: words, entry: function (id) { return IDX && IDX.filter(function (e) { return e.id === id; })[0]; }, all: function () { return IDX || []; }, ready: function () { return !!IDX; } };
})();
