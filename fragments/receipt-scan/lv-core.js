/* Receipt scan, live revision (RS-29 on). Shared logic and shared parts: the matching rule, the stage with its boxes, the prompt, legend and controls, the resolve card, the summary and the Pantry behind.
   The matching LOGIC is RS-1 to RS-28 unchanged (it is `out` and `info` below, ported from rs-core.js). What moved is WHERE it is answered: on the viewfinder.
   No size rules here: anything that depends on the viewport is in lv.phone.js or lv.desktop.js (DESIGN.md section 7). Direction code is in lv-a.js to lv-d.js. The engine and the events are in lv-run.js.
   Class names: `rl-*` are the Shopping live viewfinder's own (kitchie receipt-scan.css, PR #695 and #697), `lv-*` are new here, `rs-*` and the Pantry's are from rs.css. Mockup only: no camera is opened, nothing is read, nothing is saved. Sample data is rs-data.js. */
(function () {
  "use strict";
  var D = window.RSD, Q = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var P = function (id) { return D.pantry.filter(function (p) { return p.id === id; })[0]; };
  var L = function (id) { return D.lines.filter(function (l) { return l.id === id; })[0]; };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var DESK = function () { return matchMedia("(min-width:1024px)").matches; };
  var dir = document.body.dataset.dir || "a";
  var DEFCONF = { a: "pips", b: "bars", c: "ring", d: "pips" };
  var LV = window.LV = { D: D, Q: Q, dir: dir, dirs: {}, vp: {}, $: $, $$: $$, P: P, L: L, esc: esc, DESK: DESK, HOLD: 1.2 };

  /* ---------- state ---------- */
  var S = LV.S = {
    step: Q.get("step") || "entry",            /* entry | view | last | done | refused */
    cond: Q.get("cond") || "auto",             /* auto | blur | wall | dark | glare | rest | partial */
    perm: Q.get("perm") || "allowed", from: Q.get("from") || "camera",
    phase: Q.get("phase") || "", p: parseFloat(Q.get("p") || "0") || 0, fixed: !!Q.get("phase") || Q.get("fixed") === "1",
    pos: parseInt(Q.get("pos") || "1", 10), scroll: 0, stageH: 380, back: null,
    conf: Q.get("conf") || DEFCONF[dir], res: {}, q: {}, nm: {}, split: {}, seen: {}, sel: Q.get("sel") || null, hold: false, exp: {},
    sheet: Q.get("sheet") || "", walk: Q.get("walk") === "1" ? { q: null, i: 0 } : null, still: Q.get("still") === "1", frozen: false,
    qi: 0, qf: Q.get("qf") || "", toast: null, undone: false, just: null, torch: false, fresh: {}, keys: true, menu: false, ans: 0, banked: parseInt(Q.get("banked") || "0", 10) || 0
  };

  /* ---------- icons: the Shopping viewfinder's own paths, plus the Pantry's ---------- */
  var IC = {
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', camoff: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><path d="M3 3l18 18"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M5 18l5-5 4 4 2-2 3 3"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', up: '<path d="M12 19V6M6 11l6-6 6 6"/>',
    q: '<path d="M9.5 9.5a2.5 2.5 0 115 0c0 2-2.5 2.2-2.5 4.2"/><path d="M12 17.3v.4"/>', approx: '<path d="M5 9c2-2 4-2 7 0s5 2 7 0M5 15c2-2 4-2 7 0s5 2 7 0"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', undo: '<path d="M9 7L5 11l4 4"/><path d="M5 11h9a5 5 0 010 10h-3"/>', chev: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>', pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>', layers: '<path d="M12 4l8 4-8 4-8-4zM4 12l8 4 8-4"/>', warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    minus: '<path d="M5 12h14"/>', home: '<path d="M4 11l8-7 8 7v9H4z"/>', pantry: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/>',
    cook: '<path d="M6 14a4 4 0 114-5 4 4 0 118 1 4 4 0 01-2 4v4H8v-4z"/>', cart: '<path d="M4 5h2l2 10h9l2-7H8"/><circle cx="10" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    eye: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>', hold: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 9v6M21 9v6"/>', pause: '<path d="M9 6v12M15 6v12"/>',
    hand: '<path d="M8 12V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v7a6 6 0 01-6 6 5 5 0 01-4-2l-3-4a1.5 1.5 0 012.2-2L8 14"/>',
    list: '<path d="M8 7h11M8 12h11M8 17h11M4.5 7h.1M4.5 12h.1M4.5 17h.1"/>', drop: '<path d="M12 4v11M7 10l5 5 5-5M5 19h14"/>', lock: '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/>',
    skip: '<path d="M5 12h14"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>'
  };
  var ic = function (n, s) { s = s || 18; return '<svg class="ic rl-i" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>"; };
  LV.ic = ic; LV.IC = IC;
  /* the Shopping list's five hand-drawn scribbles, one picked per line */
  var SCR = ["M2 8 C20 3 40 11 60 5 S90 9 98 4", "M2 5 L98 9 M4 9 L96 4 M2 7 L98 6", "M1 7 C15 2 25 12 40 6 S70 2 99 8", "M2 4 C30 10 50 2 98 7 M3 9 C40 3 70 11 97 5", "M2 6 L10 3 L18 9 L28 3 L38 9 L50 3 L62 9 L74 3 L86 9 L98 5"];
  var scrib = function (id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return SCR[h % SCR.length]; };
  var scrSvg = function (id, draw) { return '<svg class="lv-scr' + (draw ? " lv-draw" : "") + '" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="' + scrib(id) + '" pathLength="100"/></svg>'; };
  LV.scrSvg = scrSvg;

  /* ---------- quantities (RS-17 unchanged) ---------- */
  var fmtN = function (n) { return String(Math.round(n * 1000) / 1000); };
  var fmt = function (n, u) { return fmtN(n) + (u ? " " + u : ""); };
  var toU = function (q, u, to) { if (!to || u === to) return q; var m = { "kg>g": 1000, "L>mL": 1000, "g>kg": .001, "mL>L": .001 }[u + ">" + to]; return m ? q * m : q; };
  var qOf = function (l) { return S.q[l.id] != null ? S.q[l.id] : l.q; };
  var money = function (n) { return (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2); };
  var cap = function (n) { return n.charAt(0).toUpperCase() + n.slice(1); };
  var lc = function (n) { return /^[A-Z][a-z]/.test(n) ? n.charAt(0).toLowerCase() + n.slice(1) : n; };
  LV.fmt = fmt; LV.qOf = qOf; LV.money = money;

  /* ---------- the one rule for what a line does: RS-3 to RS-10, RS-14, as in rs-core.js. Unchanged. ---------- */
  var band = function (s) { return s >= .85 ? "hi" : s >= .6 ? "mid" : "lo"; };
  var BW = { hi: "Very likely", mid: "Likely", lo: "Weak guess" };
  var defMode = function (id) { var p = P(id); return p && p.use ? "newb" : "top"; };
  function out(l) {
    var r = S.res[l.id];
    if (l.st === "skip") return r && r.k === "add" ? { k: "new", own: true } : { k: "skip" };
    if (r && r.k === "skip") return { k: "skip" };
    if (r && r.k === "new") return { k: "new", own: true };
    if (l.st === "exact" || (r && (r.k === "match" || r.k === "pick"))) {
      var m = r && r.k === "pick" ? r.pick : l.m, mode = (r && r.mode) || defMode(m);
      return { k: mode === "top" ? "top" : "newb", m: m, picked: r && r.k === "pick" };
    }
    return { k: "open" };
  }
  LV.out = out;
  /* live, the score also drops a band in the dark (the reader is less sure); the rule itself is not changed */
  var scoreOf = function (l) { return (l.score || 0) * (S.cond === "dark" && !S.torch ? .85 : 1); };
  function info(l) {
    var o = out(l), p = o.m && P(o.m), q = qOf(l), nm = S.nm[l.id] != null ? S.nm[l.id] : l.guess;
    var x = { k: o.k, m: o.m, name: p ? p.name : nm, ex: l.st === "exact" };
    var two = l.from && !S.split[l.id] ? " ×" + l.from : "";
    if (o.k === "top") { var add = toU(q, l.u, p.u), tu = p.u || l.u; x.label = p.out ? "Back in stock" : "Top up"; x.g = "up"; x.detail = fmt(p.q, p.u) + " → " + fmt(p.q + add, p.u); x.add = add; x.tag = p.out ? cap(x.name) + " back, " + fmt(q, l.u) : x.name + " +" + fmt(add, tu) + two; }
    else if (o.k === "newb") { x.label = "New item"; x.g = "layers"; x.detail = fmt(q, l.u) + ", keeps " + p.name + " as it is"; x.tag = "New " + lc(x.name) + two; }
    else if (o.k === "new") { x.label = "New item"; x.g = "plus"; x.detail = (nm || "Unnamed") + ", " + fmt(q, l.u); x.tag = "New: " + (nm || "unnamed"); }
    else if (o.k === "skip") { x.label = "Not added"; x.g = "x"; x.detail = l.st === "skip" ? l.short : "Crossed off"; x.tag = l.st === "skip" ? l.short : "Crossed off"; }
    else if (l.st === "fuzzy") { x.label = "Check"; x.g = "approx"; x.detail = BW[band(scoreOf(l))]; x.name = P(l.m).name; x.tag = cap(P(l.m).name) + "?"; }
    else { x.label = "New?"; x.g = "q"; x.detail = l.unclear ? "Unclear text" : "Not in your Pantry"; x.tag = l.unclear ? "New? unclear" : "New? " + (l.guess || ""); }
    return x;
  }
  LV.info = info;
  var seenLines = function () { return D.lines.filter(function (l) { return S.seen[l.id]; }); };
  function tally() {
    var t = { top: 0, newb: 0, new: 0, open: 0, skip: 0, check: 0, newq: 0, seen: 0 };
    seenLines().forEach(function (l) { var k = out(l).k; t[k]++; t.seen++; if (k === "open") { if (l.st === "fuzzy") t.check++; else t.newq++; } });
    t.ready = t.top + t.newb + t.new; return t;
  }
  LV.tally = tally; LV.seenLines = seenLines;
  var openLines = function () { return seenLines().filter(function (l) { return out(l).k === "open"; }).sort(function (a, b) { return (a.st === "fuzzy" ? 0 : 1) - (b.st === "fuzzy" ? 0 : 1); }); };
  LV.openLines = openLines;

  /* ---------- confidence: one band per line (RS-12, RS-13). Live, a band changes only after two looks agree (RS-37), so it does not flicker. ---------- */
  LV.conf = function (l, style) {
    var b = band(scoreOf(l)), n5 = { hi: 5, mid: 3, lo: 1 }[b], n3 = { hi: 3, mid: 2, lo: 1 }[b], lab = "Match: " + BW[b] + (style === "bars" ? ", " + n3 + " of 3 bars" : style === "ring" ? "" : ", " + n5 + " of 5 dots");
    style = style || S.conf;
    if (style === "bars") return '<span class="cf bars" data-b="' + b + '" role="img" aria-label="' + lab + '">' + [1, 2, 3].map(function (i) { return "<i" + (i <= n3 ? ' class="on"' : "") + "></i>"; }).join("") + "</span>";
    if (style === "ring") { var c = 2 * Math.PI * 8, f = { hi: 1, mid: .66, lo: .33 }[b]; return '<span class="cf ring" data-b="' + b + '" role="img" aria-label="' + lab + '"><svg width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" class="t"/><circle cx="11" cy="11" r="8" class="v" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 11 11)"/></svg></span>'; }
    return '<span class="cf pips" data-b="' + b + '" role="img" aria-label="' + lab + '">' + [1, 2, 3, 4, 5].map(function (i) { return "<i" + (i <= n5 ? ' class="on"' : "") + "></i>"; }).join("") + "</span>";
  };
  LV.band = function (l) { return band(scoreOf(l)); }; LV.BW = BW;

  /* ---------- the paper: where each line sits (numbers, so the engine can tell what is whole and what is cut) ---------- */
  var ORDER = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "s1", "l12", "l13", "l14", "s2"];
  var ROW = 24, GAP = 12, HEAD = 70, GEO = {}, y = HEAD;
  ORDER.forEach(function (id) { var n = L(id).raw.length; GEO[id] = { top: y, h: n * ROW, n: n }; y += n * ROW + GAP; });
  var FOOT = y, FOOTROWS = ["SUBTOTAL 87.43", "GST 3.12", "TOTAL 90.55", "EFTPOS 90.55", "Thank you for shopping"], PH = FOOT + FOOTROWS.length * 22 + 28;
  LV.ORDER = ORDER; LV.GEO = GEO; LV.PH = PH;
  LV.cut = function (id) { var g = GEO[id], t = g.top - S.scroll, b = t + g.h; if (b <= 0 || t >= S.stageH) return "out"; return t >= 2 && b <= S.stageH - 2 ? "full" : "cut"; };
  LV.scrollFor = function (pos) { return pos === 2 ? Math.max(0, GEO.l8.top - 22) : pos === 3 ? Math.max(0, GEO.l6.top + 14) : 0; };
  LV.maxScroll = function () { return Math.max(0, PH - S.stageH); };
  LV.focusScroll = function (id) { return Math.max(0, Math.min(LV.maxScroll(), GEO[id].top - S.stageH * .22)); };

  /* ---------- the boxes: Shopping's three kinds, plus the Pantry's own two (RS-29 to RS-33) ---------- */
  function kindOf(l) {
    var o = out(l);
    if (o.k === "top") return "rl-direct lv-top";
    if (o.k === "newb") return "rl-direct lv-newb";
    if (o.k === "new") return "rl-direct lv-newb";
    if (o.k === "skip") return "rl-quiet lv-skip";
    return l.st === "fuzzy" ? "rl-swap lv-check lv-need" : "rl-other lv-none lv-need";
  }
  function tagHtml(l) {
    var x = info(l), o = out(l), g = o.k === "open" && l.st === "fuzzy" ? "approx" : x.g;
    return '<i class="rl-tag" data-k="' + x.k + '">' + ic(g, 12) + '<span class="lv-tt">' + esc(x.tag) + "</span>" + (o.k === "open" && l.st === "fuzzy" ? LV.conf(l) : "") + "</i>";
  }
  LV.tagHtml = tagHtml;
  function lineHtml(id) {
    var l = L(id), g = GEO[id], on = S.seen[id] && S.cond !== "wall" && S.cond !== "rest", cls = "lv-ln", x = on ? info(l) : null, r = S.res[id], tag = "", extra = "";
    if (on) { cls += " " + kindOf(l); tag = tagHtml(l); if (r) { cls += " lv-you"; extra += '<i class="lv-yo" title="You answered this">' + ic("check", 12) + "</i>"; } if (r && r.k === "skip" || (l.st === "skip" && out(l).k === "skip" && false)) extra += scrSvg(id, S.just === id); }
    else if (S.phase && S.phase !== "look" && S.cond !== "wall" && LV.cut(id) === "cut") { cls += " lv-edge"; tag = '<i class="rl-tag lv-cutt">' + ic(GEO[id].top < S.scroll ? "up" : "down", 12) + '<span class="lv-tt">Cut off</span></i>'; }
    if (S.sel === id) cls += " lv-sel";
    if (S.walk && S.walk.cur === id) cls += " lv-cur";
    var rows = l.raw.map(function (rw, i) { return '<span class="lv-row"><span class="lv-tx">' + esc(rw) + "</span>" + (i === 0 ? '<span class="lv-pr">' + (l.price < 0 ? "-" : "") + Math.abs(l.price).toFixed(2) + "</span>" : "") + "</span>"; }).join("");
    var attrs = on ? ' role="button" tabindex="0" data-act="box" data-id="' + id + '" aria-label="' + esc(l.raw[0] + ": " + x.label + (x.name ? ", " + x.name : "")) + '"' : "";
    return '<div class="' + cls + '" data-id="' + id + '" style="top:' + g.top + "px;height:" + g.h + 'px"' + attrs + ">" + rows + tag + extra + (on ? '<i class="lv-hit" aria-hidden="true"></i>' : "") + "</div>";
  }
  function paperHtml() {
    var h = '<div class="lv-paper' + (S.phase && S.phase !== "look" ? " lv-boxes" : "") + '" style="height:' + PH + "px;transform:translateY(" + (-S.scroll) + 'px)"><div class="lv-ph lv-ig"><span>FRESH MART</span><span>14/10 10:42</span></div><div class="lv-ph2 lv-ig">12 SAMPLE ST</div>';
    ORDER.forEach(function (id) { h += lineHtml(id); });
    FOOTROWS.forEach(function (t, i) { h += '<div class="lv-ig lv-ft" style="top:' + (FOOT + i * 22) + 'px"><span>' + t.replace(/ ([\d.]+)$/, "</span><span>$1") + "</span></div>"; });
    return h + "</div>";
  }
  function stageHtml(extraCls) {
    var c = S.cond, cl = "rl-stage lv-stage " + (extraCls || "");
    if (c === "blur") cl += " lv-blur"; if (c === "dark" && !S.torch) cl += " lv-dark"; if (c === "glare") cl += " lv-glare"; if (S.frozen || S.hold) cl += " lv-frozen"; if (S.walk) cl += " lv-walking";
    var h = '<div class="' + cl + '" data-cond="' + c + '">';
    h += c === "wall" ? '<div class="lv-wall"><i></i></div>' : paperHtml();
    if (c === "glare") h += '<div class="lv-gl" aria-hidden="true"></div>';
    h += '<div class="rl-flash" aria-hidden="true"></div>';
    if (DESK() && !S.still && !S.frozen && !S.hold && S.cond !== "rest") h += '<span class="lv-pill lv-cam">' + ic("camera", 14) + "Webcam</span>";
    if (S.cond === "rest") h += '<div class="rl-rest"><p>Looking has stopped to save battery.</p><button type="button" class="rl-go" data-act="resume">' + ic("camera", 18) + "Resume</button></div>";
    return h + "</div>";
  }
  LV.stageHtml = stageHtml;

  /* ---------- the prompt, as Shopping's (CS-D4), with the Pantry's extra ones ---------- */
  function promptFor() {
    var c = S.cond, t = tally(), n = t.seen, ph = S.phase, open = t.open;
    if (S.hold && !S.walk) return { tone: "info", ic: "hand", text: "Held. Answer, and it carries on.", sub: "Auto-capture waits while you answer" };
    if (S.frozen && ph === "frozen") return { tone: "ok", ic: "lock", text: "Photo held. " + open + " to answer.", sub: open ? "Go through them, or scan the rest" : "All answered" };
    if (c === "rest") return { tone: "info", ic: "pause", text: "Camera resting", sub: "Stopped after 150 s without a photo" };
    if (c === "blur") return { tone: "warn", ic: "warn", text: "Hold steady, the image is blurry." };
    if (c === "wall") return { tone: "soft", ic: "eye", text: "Can't find a receipt (best guess): very little text.", sub: n ? n + " lines already read are kept" : "" };
    if (c === "dark" && !S.torch) return { tone: "warn", ic: "sun", text: "Too dark to read well.", sub: "Turn on the light, or move nearer a window" };
    if (c === "glare") return { tone: "warn", ic: "sun", text: "Glare on the paper.", sub: "Tilt the receipt a little" };
    if (c === "partial") return { tone: "soft", ic: "hold", text: "Some lines are cut off at the edge.", sub: "Slide the receipt so whole lines show" };
    if (ph === "take") return { tone: "take", ic: "camera", text: "Steady. Taking the photo..." };
    if (ph === "banked") return { tone: "ok", ic: "check", text: "Got " + S.banked + " lines.", sub: S.pos < 2 ? "Slide the receipt up for the rest" : "" };
    if (ph === "end") return { tone: "ok", ic: "check", text: "That is the whole receipt: " + n + " lines.", sub: open ? open + " to answer. Last look when you are ready" : "Everything is answered" };
    if (ph === "again") return { tone: "info", ic: "eye", text: "Seen again: Butter. Not counted twice." };
    if (ph === "found" || ph === "hold") return { tone: "ok", ic: "hold", text: "Receipt found. Hold steady...", sub: n + " lines read" + (open ? ", " + open + " to answer" : "") };
    if (S.still) return { tone: "ok", ic: "image", text: "Photo read: " + n + " lines.", sub: open ? open + " to answer" : "" };
    return { tone: "info", ic: "eye", text: "Looking for a receipt...", sub: "Point the camera at it" };
  }
  function promptHtml() { var s = promptFor(); return '<p class="rl-status" data-tone="' + s.tone + '" role="status" aria-live="polite"><span class="rl-sign" aria-hidden="true">' + ic(s.ic, 20) + '</span><span class="rl-say">' + s.text + (s.sub ? "<small>" + s.sub + "</small>" : "") + "</span></p>"; }
  function progHtml() {
    var on = (S.phase === "found" || S.phase === "hold" || S.phase === "take") && !S.hold && !/blur|wall|dark|glare|rest|partial/.test(S.cond) && !S.still, p = on ? (S.phase === "take" ? 1 : S.p) : 0;
    return '<div class="rl-prog"' + (on ? "" : " data-idle") + '><span class="rl-steady" role="progressbar" aria-label="Steady" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(p * 100) + '"><i style="width:' + Math.round(p * 100) + '%"></i></span><span class="rl-held">' + (on ? "Steady " + Math.min(LV.HOLD, p * LV.HOLD).toFixed(1) + " of " + LV.HOLD.toFixed(1) + " s" : "") + "</span></div>";
  }
  function legendHtml() {
    var t = tally(), ch = function (k, cl, ic_, w, n, sub) { return '<button type="button" class="rl-chip ' + cl + '" data-act="chip" data-v="' + k + '"><span class="rl-chip-w">' + ic(ic_, 14) + "<span>" + w + "</span></span><b>" + n + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + "</button>"; };
    return '<div class="rl-legend" role="group" aria-label="What has been read so far">' + ch("ready", "rl-direct", "check", "Ready", t.ready, t.top + " top up, " + (t.newb + t.new) + " new") + ch("check", "rl-swap", "approx", "Check", t.check) + ch("none", "rl-other", "q", "New?", t.newq) + ch("skip", "rl-quiet", "minus", "Not added", t.skip) + "</div>";
  }
  var RING = 2 * Math.PI * 34;
  function shutterHtml() {
    var p = (S.phase === "found" || S.phase === "hold" || S.phase === "take") ? (S.phase === "take" ? 1 : S.p) : 0;
    return '<button type="button" class="rl-shutter" data-act="shutter" aria-label="Take the photo now"><svg class="rl-ring" viewBox="0 0 76 76" aria-hidden="true"><circle class="rl-ring-bg" cx="38" cy="38" r="34"/><circle class="rl-ring-pg" cx="38" cy="38" r="34" stroke-dasharray="' + RING.toFixed(1) + '" stroke-dashoffset="' + (RING * (1 - p)).toFixed(1) + '"/></svg><span class="rl-core"></span></button>';
  }
  function actionsHtml() {
    var t = tally(), w = LV.vp.words || {};
    return '<div class="rl-actions"><button type="button" class="rl-side" data-act="photos">' + ic("image", 18) + (w.photo || "Choose a photo") + "</button>" + shutterHtml() +
      '<button type="button" class="rl-side lv-add" data-act="summary"' + (t.ready ? "" : " disabled") + ' aria-label="Add ' + t.ready + ' to the Pantry">' + ic("check", 18) + "Add " + t.ready + "</button></div>";
  }
  function barHtml() { return '<div class="rl-bar"><button type="button" class="rl-done" data-act="leave" aria-label="Done, close the camera">' + ic("x", 18) + "Done</button><h2 id=\"rl-title\">Scan receipt</h2>" + (S.cond === "dark" ? '<button type="button" class="rl-torch" data-act="torch" aria-pressed="' + S.torch + '" aria-label="Light on">' + ic("sun", 18) + "</button>" : '<span class="rl-bar-gap" aria-hidden="true"></span>') + "</div>"; }
  LV.parts = function () {
    return { bar: barHtml(), status: promptHtml(), prog: progHtml(), legend: legendHtml(), actions: actionsHtml() };
  };

  /* ---------- the resolve card: one card, used by the sheet, the lane, the dock, the step page and the list row ---------- */
  function itemTile(p) { return '<span class="rs-itile"><span class="rs-em">' + (p.em || ic("pantry", 20)) + '</span><span class="rs-itx"><b>' + esc(p.name) + "</b><small>" + (p.out ? "Out, " : "") + fmt(p.q, p.u) + " · " + p.place + (p.use ? " · use by " + p.use + (p.use === 1 ? " day" : " days") : "") + "</small></span></span>"; }
  var btn = function (act, id, label, cls, g, key, v) { return '<button type="button" class="rs-b ' + (cls || "") + '" data-act="' + act + '" data-id="' + id + '"' + (v != null ? ' data-v="' + v + '"' : "") + ">" + (g ? ic(g, 18) : "") + "<span>" + label + "</span>" + (key ? '<span class="kbd cap">' + key + "</span>" : "") + "</button>"; };
  var stepper = function (l) { return '<span class="rs-step" role="group" aria-label="Quantity"><button type="button" class="rs-sb" data-act="qm" data-id="' + l.id + '" aria-label="Less">' + ic("minus", 16) + "</button><output>" + fmt(qOf(l), l.u) + '</output><button type="button" class="rs-sb" data-act="qp" data-id="' + l.id + '" aria-label="More">' + ic("plus", 16) + "</button></span>"; };
  LV.acts = function (l, o) {
    o = o || {}; var k = out(l).k, p = l.m && P(l.m), id = l.id, key = DESK() && S.keys;
    if (l.st === "skip") return k === "skip" ? btn("add", id, "This is an item", "ghost sm", "plus") : btn("undo", id, "Leave it out", "ghost sm", "undo");
    if (k === "open" && l.st === "fuzzy") return btn("match", id, o.short ? "Yes" : "Yes, it’s " + p.name, "pri sm", "check", key && "Y") + btn("new", id, o.short ? "New" : "Not this, new item", "sm", "plus", key && "N");
    if (k === "open") return btn("new", id, "Add as new", "pri sm", "check", key && "Y") + btn("skip", id, "Not an item", "sm", "x", key && "X");
    return btn("undo", id, "Change my answer", "ghost sm", "undo", key && "Z");
  };
  /* mode: full | compact. The compact card is for a dock or a row; "More" opens the full card in place. */
  LV.card = function (l, mode) {
    var x = info(l), o = out(l), p = l.m && P(l.m), id = l.id, key = DESK() && S.keys, compact = mode === "compact" && !S.exp[id], h = "";
    h += '<div class="rs-det lv-card" data-id="' + id + '" data-k="' + o.k + '">';
    h += '<div class="rs-read"><span class="rs-lbl">On the receipt</span><div class="rs-print">' + l.raw.map(function (r) { return "<div>" + esc(r) + "</div>"; }).join("") + '</div><span class="rs-price">' + money(l.price) + "</span>" + (S.res[id] && S.res[id].k === "skip" ? scrSvg(id, S.just === id) : "") + (l.st === "none" && o.k === "open" ? '<span class="lv-hint">Swipe across the line to cross it off</span>' : "") + "</div>";
    if (l.st === "skip") { h += '<p class="rs-why">' + esc(l.why) + "</p>"; h += '<div class="rs-acts">' + LV.acts(l) + "</div></div>"; return h; }
    if (!compact) h += '<p class="rs-how">' + ic("receipt", 14) + "<span>" + esc(l.note) + "</span></p>";
    if (l.st === "fuzzy" && o.k === "open") { var b = LV.band(l); h += '<div class="rs-sug" data-b="' + b + '"><span class="rs-lbl">Closest in your Pantry</span><div class="rs-it">' + itemTile(p) + '<span class="rs-cw">' + LV.conf(l) + "<em>" + BW[b] + "</em></span></div></div>"; }
    if (o.k === "top" || o.k === "newb") {
      var m = P(o.m);
      h += '<div class="rs-sug rs-res"><span class="rs-lbl">' + (l.st === "exact" ? "Exact match" : "You chose") + '</span><div class="rs-it">' + itemTile(m) + '</div><div class="rs-seg" role="radiogroup" aria-label="What happens"><button type="button" role="radio" aria-checked="' + (o.k === "top") + '" data-act="mode" data-id="' + id + '" data-v="top">' + ic("up", 16) + "<span>Top up</span>" + (key ? '<span class="kbd cap">T</span>' : "") + '</button><button type="button" role="radio" aria-checked="' + (o.k === "newb") + '" data-act="mode" data-id="' + id + '" data-v="newb">' + ic("layers", 16) + "<span>New item</span></button></div>";
      h += '<p class="rs-eff">' + (o.k === "top" ? "<b>" + esc(m.name) + "</b> goes " + x.detail + "." : "A new <b>" + esc(m.name) + "</b> of " + fmt(qOf(l), l.u) + " is added with its own use by. The one you have stays " + fmt(m.q, m.u) + ".") + "</p></div>";
    }
    if (o.k === "new" || (o.k === "open" && l.st === "none")) h += '<label class="rs-lbl" for="nm-' + id + '">New item name</label><input id="nm-' + id + '" class="rs-in" data-nm="' + id + '" value="' + esc(S.nm[id] != null ? S.nm[id] : l.guess || "") + '" placeholder="' + (l.unclear ? "What is it? The text was unclear" : "Name") + '" autocomplete="off">';
    if (l.st === "fuzzy" && o.k !== "new" && !compact) {
      var cs = [l.m].concat(l.cand || []).filter(function (c) { return c !== o.m; });
      h += '<div class="rs-cands"><span class="rs-lbl">' + (o.k === "open" ? "Or pick another item" : "Pick another item") + '</span><div class="rs-cl">' + cs.map(function (c) { return '<button type="button" class="rs-cc" data-act="pick" data-id="' + id + '" data-v="' + c + '">' + (P(c).em || "•") + " " + esc(P(c).name) + "</button>"; }).join("") + "</div></div>";
    }
    if (!compact) h += '<div class="rs-qrow"><span class="rs-lbl">Amount bought</span>' + stepper(l) + '<span class="rs-un">' + (l.from ? '<button type="button" class="rs-lk" data-act="split" data-id="' + id + '">' + ic("layers", 14) + (S.split[id] ? " Kept separate. Combine again" : " Combined from " + l.from + " lines. Keep separate") + "</button>" : "") + "</span></div>";
    h += '<div class="rs-acts">' + LV.acts(l, { short: compact }) + (compact && !S.exp[id] ? btn("more", id, "More", "ghost sm", "chev") : "") + "</div>";
    if (l.st === "fuzzy" && o.k === "open" && !compact) h += '<p class="rs-fine">Not this one makes a new item called “' + esc(l.guess) + "”. Nothing changes until you add to the Pantry.</p>";
    return h + "</div>";
  };
  LV.itemTile = itemTile;

  /* ---------- the summary: the commit step (RS-21). Counts, the lists, the open ones, the ignored ones, one button. ---------- */
  function entries() {
    var e = { top: [], news: [], skip: [], open: [] };
    seenLines().forEach(function (l) { var o = out(l), x = info(l); if (o.k === "top") e.top.push([l, x]); else if (o.k === "new" || o.k === "newb") { if (l.from && S.split[l.id]) { e.news.push([l, x, 1]); e.news.push([l, x, 2]); } else e.news.push([l, x]); } else if (o.k === "skip") e.skip.push([l, x]); else e.open.push([l, x]); });
    return e;
  }
  LV.entries = entries;
  LV.summary = function (mode) {
    var e = entries(), n = e.top.length + e.news.length, h = "", key = DESK() && S.keys;
    h += '<div class="rs-sh"><h2>' + (mode === "commit" ? "Add to your Pantry" : "So far") + "</h2>" + (mode === "commit" ? '<button type="button" class="x ib" data-act="closesheet" aria-label="Back to the camera">' + ic("x", 20) + "</button>" : "") + "</div>";
    h += '<div class="rs-counts"><div data-k="new"><b>' + e.news.length + "</b><span>new items</span></div><div data-k=\"top\"><b>" + e.top.length + "</b><span>topped up</span></div><div data-k=\"skip\"><b>" + e.skip.length + "</b><span>left out</span></div></div>";
    if (e.open.length) h += '<div class="rs-note warn"><span class="rs-ni">' + ic("q", 22) + "</span><div><b>" + e.open.length + " still to answer</b><p>They will not be added unless you answer them.</p><button type=\"button\" class=\"rs-lk\" data-act=\"last\">" + ic("list", 14) + " Last look at " + e.open.length + "</button></div></div>";
    if (mode === "commit" || (DESK() && mode !== "slim")) {
      var grp = function (t, arr, f) { return arr.length ? '<div class="rs-sg"><h3>' + t + " (" + arr.length + ")</h3><ul>" + arr.map(f).join("") + "</ul></div>" : ""; };
      h += grp("Topped up", e.top, function (a) { return '<li><span class="rs-sn">' + esc(a[1].name) + '</span><span class="rs-sd">' + a[1].detail + "</span></li>"; });
      h += grp("New items", e.news, function (a) { return '<li><span class="rs-sn">' + esc(a[1].name) + '</span><span class="rs-sd">' + fmt(a[2] ? a[0].q / 2 : qOf(a[0]), a[0].u) + "</span></li>"; });
      h += grp("Left out", e.skip, function (a) { return '<li class="mute"><span class="rs-sn">' + esc(a[0].raw[0]) + '</span><span class="rs-sd">' + (a[0].st === "skip" ? a[0].short : "Crossed off") + "</span></li>"; });
      h += '<p class="rs-sumline">' + ic("receipt", 16) + "<span>" + D.ignored.length + " header and total lines ignored. Prices are shown to check, not saved.</span></p>";
    }
    if (mode === "commit") h += '<div class="rs-acts col stick"><button type="button" class="rs-b pri big" data-act="done"' + (n ? "" : " disabled") + ">" + ic("check", 20) + "<span>Add " + n + " to the Pantry</span>" + (key ? '<span class="kbd cap">⇧↵</span>' : "") + '</button><button type="button" class="rs-b" data-act="closesheet"><span>Back to the camera</span></button></div><p class="rs-fine">You can undo this for a few minutes from the Pantry’s history.</p>';
    else h += '<div class="rs-acts col stick"><button type="button" class="rs-b pri big" data-act="summary"' + (n ? "" : " disabled") + ">" + ic("check", 20) + "<span>Review and add " + n + "</span></button></div>";
    return h;
  };

  /* ---------- the Pantry behind (the page the flow starts from and ends on) ---------- */
  LV.pantry = function () {
    var rows = {}, fresh = S.step === "done" && !S.undone, ov = {}, ls = seenLines();
    if (fresh) ls.forEach(function (l) { var o = out(l), x = info(l); if (o.k === "top") ov[o.m] = x.detail; });
    D.pantry.filter(function (p) { return !p.out || ov[p.id]; }).forEach(function (p) { var a = p.place.split(" · ")[0]; (rows[a] = rows[a] || []).push(p); });
    var news = fresh ? ls.filter(function (l) { var k = out(l).k; return k === "new" || k === "newb"; }) : [], own = news.filter(function (l) { return out(l).k === "new"; });
    news = news.filter(function (l) { return out(l).k === "newb"; });
    var cnt = D.pantry.filter(function (p) { return !p.out; }).length + (fresh ? news.length + own.length : 0);
    var h = '<div class="hd"><span class="count">' + cnt + ' items</span><button type="button" class="btn pri" data-act="add" aria-haspopup="dialog">+ Add' + (DESK() ? '<span class="kbd cap">+</span>' : "") + "</button></div>";
    ["Fridge", "Pantry", "Freezer"].forEach(function (a) {
      if (!rows[a]) return;
      h += '<div class="grp"><b>' + a + '</b><span class="tag">' + rows[a].length + '</span></div><ul class="rows">';
      rows[a].forEach(function (p) { h += '<li><div class="row"><span class="rmain"><span class="nm">' + (p.em ? p.em + " " : "") + esc(p.name) + '</span><span class="mt">' + (ov[p.id] ? "" : p.place + " · ") + (ov[p.id] ? '<b class="rs-new">' + ov[p.id] + "</b>" : fmt(p.q, p.u)) + "</span></span>" + (ov[p.id] ? '<span class="rs-just">Topped up</span>' : p.use ? '<span class="due">Use within<br>' + p.use + (p.use === 1 ? " day" : " days") + "</span>" : "") + "</div></li>"; });
      if (fresh) news.filter(function (l) { return P(out(l).m).place.split(" · ")[0] === a; }).forEach(function (l) { var x = info(l), p = P(out(l).m); h += '<li><div class="row"><span class="rmain"><span class="nm">' + (p.em ? p.em + " " : "") + esc(x.name) + '</span><span class="mt">' + fmt(qOf(l), l.u) + " · " + p.place + '</span></span><span class="rs-just">Added</span></div></li>'; });
      h += "</ul>";
    });
    if (own.length) { h += '<div class="grp"><b>Where do these go?</b><span class="tag">' + own.length + '</span></div><ul class="rows">'; own.forEach(function (l) { var x = info(l); h += '<li><div class="row"><span class="rmain"><span class="nm">' + esc(x.name) + '</span><span class="mt">' + fmt(qOf(l), l.u) + ' · no place yet</span></span><span class="rs-just">Added</span></div></li>'; }); h += "</ul>"; }
    return h;
  };
  LV.addSheet = function () {
    var d = DESK(), w = LV.vp.words || {};
    return '<div class="rs-sh"><h2>Add an item</h2><button type="button" class="x ib" data-act="closesheet" aria-label="Close">' + ic("x", 20) + '</button></div><button type="button" class="rs-scan-tile" data-act="scan"><span class="rs-st-ic">' + ic("camera", 26) + '</span><span class="rs-st-tx"><b>Scan a receipt</b><small>' + (w.entry || "Point the camera at it. Answers appear on the picture") + "</small></span>" + (d ? '<span class="kbd">R</span>' : ic("chev", 18)) + '</button><p class="rs-or">or add one item</p><div class="rs-form" aria-hidden="true"><span class="rs-lbl">Item</span><div class="rs-frow"><span class="rs-emt">+</span><span class="rs-fld">What is it?</span></div><span class="rs-lbl">Amount</span><span class="rs-fld">In your own words, e.g. a handful</span></div>';
  };
  LV.nav = function () { return [["home", "Home"], ["pantry", "Pantry"], ["cook", "Recipes"], ["cart", "Shopping"]].map(function (n) { return '<a class="nv' + (n[0] === "pantry" ? " on" : "") + '" href="#" tabindex="-1">' + ic(n[0], 24) + "<span>" + n[1] + "</span></a>"; }).join(""); };
  LV.refused = function () {
    var w = LV.vp.words || {};
    return '<div class="rl-bar"><button type="button" class="rl-done" data-act="leave">' + ic("x", 18) + 'Done</button><h2>Scan receipt</h2><span class="rl-bar-gap"></span></div><div class="lv-ref"><span class="ic">' + ic("camoff", 34) + "</span><h2>" + (w.noCam || "No camera here") + "</h2><p>" + (w.noCamWhy || "The camera is blocked or missing. You can still scan: take a photo, or choose one you already have.") + '</p><button type="button" class="rs-b pri big" data-act="photos">' + ic("image", 20) + "<span>" + (w.noCamBtn || "Take or choose a photo") + '</span></button><button type="button" class="rs-b" data-act="leave"><span>Back to the Pantry</span></button></div>';
  };
  /* the row in the list order (D) and the queue (C, last look) are built by their direction; the shared pieces are above */
})();
