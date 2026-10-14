/* Receipt scan, chosen flow: Option A "Receipt order", built out on the live camera (RS-55 on). Shared logic and shared parts: the one rule for what a line does, the stage with its boxes, the prompt and controls,
   the receipt-order list (Pantry rows), the picker, the summary and the Pantry behind. Revision 1's other options and live directions A to D are archived (v1.html, live-a.html to live-d.html).
   No size rules here: anything that depends on the viewport is in ro.phone.js or ro.desktop.js (DESIGN.md section 7). The engine, the actions and the events are in ro-run.js.
   Class names: `rl-*` are the Shopping live viewfinder's own (kitchie receipt-scan.css, PR #695 and #697), `ro-*` are new here (the build keeps them), the Pantry's (.row .rmain .nm .mt) and `rs-*` are from rs.css.
   Mockup only: no camera is opened, nothing is read, nothing is saved. Sample data is ro-data.js. */
(function () {
  "use strict";
  var D = window.ROD, Q = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var P = function (id) { return D.pantry.filter(function (p) { return p.id === id; })[0]; };
  var L = function (id) { return D.lines.filter(function (l) { return l.id === id; })[0]; };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var DESK = function () { return matchMedia("(min-width:1024px)").matches; };
  var RO = window.RO = { D: D, Q: Q, vp: {}, $: $, $$: $$, P: P, L: L, esc: esc, DESK: DESK, HOLD: 1.2 };
  /* Revision 4 (two steps): the page ro2.html (body data-flow="two") on a phone or tablet. opt a = Read, then sort only what needs you; b = Read, then the whole list; c = the paper stays above the list, bigger. Empty everywhere else: the chosen flow is untouched. */
  RO.opt = document.body.getAttribute("data-flow") === "two" && !DESK() ? (Q.get("opt") || "a") : "";

  /* ---------- state ---------- */
  var S = RO.S = {
    step: Q.get("step") || "entry",            /* entry | view | done | refused */
    cond: Q.get("cond") || "auto",             /* auto | blur | wall | dark | glare | rest | partial */
    perm: Q.get("perm") || "allowed",
    phase: Q.get("phase") || "", p: parseFloat(Q.get("p") || "0") || 0, fixed: !!Q.get("phase") || Q.get("fixed") === "1",
    pos: parseInt(Q.get("pos") || "1", 10), scroll: 0, stageH: 200, banked: parseInt(Q.get("banked") || "0", 10) || 0,
    res: {}, q: {}, nm: {}, split: {}, seen: {}, sel: Q.get("sel") || null, pick: Q.get("pick") || null, find: "", filter: Q.get("filter") || "all",
    sheet: Q.get("sheet") || "", still: Q.get("still") === "1", toast: null, undone: false, torch: false, keys: true, last: null
  };

  /* ---------- icons: the Shopping viewfinder's own paths, plus the Pantry's ---------- */
  var IC = {
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', camoff: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><path d="M3 3l18 18"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M5 18l5-5 4 4 2-2 3 3"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', up: '<path d="M12 19V6M6 11l6-6 6 6"/>',
    q: '<path d="M9.5 9.5a2.5 2.5 0 115 0c0 2-2.5 2.2-2.5 4.2"/><path d="M12 17.3v.4"/>', approx: '<path d="M5 9c2-2 4-2 7 0s5 2 7 0M5 15c2-2 4-2 7 0s5 2 7 0"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', undo: '<path d="M9 7L5 11l4 4"/><path d="M5 11h9a5 5 0 010 10h-3"/>', chev: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>', layers: '<path d="M12 4l8 4-8 4-8-4zM4 12l8 4 8-4"/>', warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    minus: '<path d="M5 12h14"/>', home: '<path d="M4 11l8-7 8 7v9H4z"/>', pantry: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6"/>',
    cook: '<path d="M6 14a4 4 0 114-5 4 4 0 118 1 4 4 0 01-2 4v4H8v-4z"/>', cart: '<path d="M4 5h2l2 10h9l2-7H8"/><circle cx="10" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    eye: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>', hold: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 9v6M21 9v6"/>', pause: '<path d="M9 6v12M15 6v12"/>',
    list: '<path d="M8 7h11M8 12h11M8 17h11M4.5 7h.1M4.5 12h.1M4.5 17h.1"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>', swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>'
  };
  var ic = function (n, s) { s = s || 18; return '<svg class="ic rl-i" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>"; };
  RO.ic = ic;
  /* the Shopping list's five hand-drawn scribbles, one picked per line (an Ignored line is crossed off the way Shopping crosses one off) */
  var SCR = ["M2 8 C20 3 40 11 60 5 S90 9 98 4", "M2 5 L98 9 M4 9 L96 4 M2 7 L98 6", "M1 7 C15 2 25 12 40 6 S70 2 99 8", "M2 4 C30 10 50 2 98 7 M3 9 C40 3 70 11 97 5", "M2 6 L10 3 L18 9 L28 3 L38 9 L50 3 L62 9 L74 3 L86 9 L98 5"];
  var scrib = function (id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return SCR[h % SCR.length]; };
  RO.scrSvg = function (id) { return '<svg class="lv-scr" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="' + scrib(id) + '" pathLength="100"/></svg>'; };

  /* ---------- quantities (RS-17 unchanged) ---------- */
  var fmtN = function (n) { return String(Math.round(n * 1000) / 1000); };
  var fmt = function (n, u) { return fmtN(n) + (u ? " " + u : ""); };
  /* STAND-IN ONLY (RS-74): the build has no unit table here. The screen's add-up preview and its outcome text use KitchieQuantity (quantity.js) and the same rule as the server's inUnit; this four-entry table only lets the sample data show a figure. */
  var toU = function (q, u, to) { if (!to || u === to) return q; var m = { "kg>g": 1000, "L>mL": 1000, "g>kg": .001, "mL>L": .001 }[u + ">" + to]; return m ? q * m : q; };
  var qOf = function (l) { return S.q[l.id] != null ? S.q[l.id] : l.q; };
  var money = function (n) { return (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2); };
  var cap = function (n) { return n.charAt(0).toUpperCase() + n.slice(1); };
  RO.fmt = fmt; RO.qOf = qOf; RO.money = money;

  /* ---------- confidence: three dots, 3 high, 2 medium, 1 low (RS-57). The thresholds are the matcher's: 0.85 and up, 0.65 to 0.84, 0.45 to 0.64. Under 0.45 a line is Unsure and has no dots. ---------- */
  var scoreOf = function (l) { return (l.score || 0) * (S.cond === "dark" && !S.torch ? .85 : 1); };
  var dotsOf = function (l) { var s = Math.round(scoreOf(l) * 100) / 100; return s >= .85 ? 3 : s >= .65 ? 2 : 1; };
  var BW = { 3: "High", 2: "Medium", 1: "Low" };
  RO.dotsOf = dotsOf; RO.BW = BW;
  RO.conf = function (l) {
    var n = dotsOf(l), lab = "Match confidence: " + BW[n].toLowerCase() + ", " + n + " of 3 dots";
    return '<span class="cf pips" data-n="' + n + '" role="img" aria-label="' + lab + '">' + [1, 2, 3].map(function (i) { return "<i" + (i <= n ? ' class="on"' : "") + "></i>"; }).join("") + "</span>";
  };

  /* ---------- the one rule for what a line does (RS-3, RS-56, RS-61 to RS-63, RS-65). k: top (updates the existing item) | new | check | unsure | ignored ---------- */
  function out(l) {
    var r = S.res[l.id];
    if (l.st === "left") return r && r.k === "restore" ? { k: "unsure", restored: true } : { k: "ignored", auto: true };
    if (r && r.k === "ignore") return { k: "ignored" };
    if (r && r.k === "new") return { k: "new" };
    if (r && r.k === "pick") return { k: "top", m: r.pick, picked: true };
    if (l.st === "exact") return { k: "top", m: l.m };
    if (r && r.k === "accept") return { k: "top", m: l.m, accepted: true };
    return { k: l.st === "check" ? "check" : "unsure", m: l.m };
  }
  RO.out = out;
  function info(l) {
    var o = out(l), p = o.m && P(o.m), q = qOf(l), nm = S.nm[l.id] != null ? S.nm[l.id] : l.guess;
    var x = { k: o.k, m: o.m, name: p ? p.name : nm || l.raw[0], st: l.st };
    if (o.k === "top" || o.k === "check") {
      var add = toU(q, l.u, p.u), tu = p.u || l.u;
      x.add = add; x.outcome = "Updates existing (" + fmt(p.q, p.u) + " to " + fmt(p.q + add, p.u) + ")"; x.back = !!p.out;
      x.g = o.k === "check" ? "approx" : "up";
      x.label = o.k === "check" ? "Check" : o.picked ? "Matched" : o.accepted ? "Accepted" : "Exact";
      x.tag = o.k === "check" ? cap(p.name) + "?" : p.name + " +" + fmt(add, tu) + (l.from && !S.split[l.id] ? " ×" + l.from : "");
    } else if (o.k === "new") {
      x.outcome = "New item"; x.g = "plus"; x.label = "New item"; x.name = nm || "Unnamed"; x.tag = "New: " + (nm || "unnamed");
    } else if (o.k === "ignored") {
      x.outcome = l.st === "left" ? "Ignored. " + l.why : "Ignored. It will not be added"; x.g = "x"; x.label = "Ignored"; x.tag = l.st === "left" ? l.short : "Ignored"; x.name = l.raw[0];
    } else {
      x.outcome = l.unclear ? "No recommendation. The text was unclear" : "No recommendation. Nothing in your Pantry looks like it"; x.g = "q"; x.label = "Unsure"; x.tag = l.unclear ? "Unsure, unclear" : "Unsure: " + (l.guess || ""); x.name = nm || l.raw[0];
    }
    return x;
  }
  RO.info = info;
  var seenLines = function () { return D.lines.filter(function (l) { return S.seen[l.id]; }); };
  var isItem = function (l) { return l.st !== "left"; };
  /* resolved = the person (or the matcher, for an Exact line) has settled it. Left-out lines are not items, so they are not counted. */
  function tally() {
    var t = { top: 0, new: 0, check: 0, unsure: 0, ignored: 0, left: 0, total: 0, resolved: 0, exact: 0 };
    seenLines().forEach(function (l) {
      var o = out(l), k = o.k; t[k]++;
      if (!isItem(l)) { if (k === "ignored") t.left++; return; }
      t.total++; if (k === "top" && l.st === "exact" && !o.picked) t.exact++;
      if (k === "top" || k === "new" || (k === "ignored" && !o.auto)) t.resolved++;
    });
    t.ready = t.top + t.new; return t;
  }
  RO.tally = tally; RO.seenLines = seenLines;
  var order = function () { return seenLines().sort(function (a, b) { return RO.ORDER.indexOf(a.id) - RO.ORDER.indexOf(b.id); }); };
  RO.inFilter = function (l, f) {
    var k = out(l).k;
    return f === "all" || (f === "check" && k === "check") || (f === "unsure" && k === "unsure") || (f === "ignored" && k === "ignored") || (f === "todo" && (k === "check" || k === "unsure")) || (f === "ready" && (k === "top" || k === "new"));
  };
  RO.visible = function () { return order().filter(function (l) { return RO.inFilter(l, S.filter); }); };

  /* ---------- the paper: where each line sits ---------- */
  var ORDER = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "s1", "l12", "l13", "l14", "s2"];
  var ROW = 24, GAP = 12, HEAD = 70, GEO = {}, y = HEAD;
  ORDER.forEach(function (id) { var n = L(id).raw.length; GEO[id] = { top: y, h: n * ROW, n: n }; y += n * ROW + GAP; });
  var FOOT = y, FOOTROWS = ["SUBTOTAL 87.43", "GST 3.12", "TOTAL 90.55", "EFTPOS 90.55", "Thank you for shopping"], PH = FOOT + FOOTROWS.length * 22 + 28;
  RO.ORDER = ORDER; RO.GEO = GEO; RO.PH = PH;
  RO.cut = function (id) { var g = GEO[id], t = g.top - S.scroll, b = t + g.h; if (b <= 0 || t >= S.stageH) return "out"; return t >= 2 && b <= S.stageH - 2 ? "full" : "cut"; };
  RO.scrollFor = function (pos) { return pos === 2 ? Math.max(0, GEO.l8.top - 22) : pos === 3 ? Math.max(0, GEO.l12.top - 22) : 0; };
  RO.maxScroll = function () { return Math.max(0, PH - S.stageH); };

  /* ---------- the boxes: Shopping's drawings, by the new state names (RS-30, RS-61) ---------- */
  function kindOf(l) {
    var k = out(l).k;
    return k === "top" ? "rl-direct lv-top" : k === "new" ? "rl-direct lv-newb" : k === "ignored" ? "rl-quiet lv-skip" : k === "check" ? "rl-swap lv-check lv-need" : "rl-other lv-none lv-need";
  }
  function tagHtml(l) {
    var x = info(l), k = x.k;
    return '<i class="rl-tag" data-k="' + k + '">' + ic(x.g, 12) + '<span class="lv-tt">' + esc(x.tag) + "</span>" + (k === "check" ? RO.conf(l) : "") + "</i>";
  }
  function lineHtml(id) {
    var l = L(id), g = GEO[id], on = S.seen[id] && S.cond !== "wall" && S.cond !== "rest", cls = "lv-ln", x = on ? info(l) : null, r = S.res[id], tag = "", extra = "";
    if (on) { cls += " " + kindOf(l); tag = tagHtml(l); if (r && r.k !== "restore") { cls += " lv-you"; extra += '<i class="lv-yo" title="You answered this">' + ic("check", 12) + "</i>"; } if (out(l).k === "ignored") extra += RO.scrSvg(id); }
    else if (S.phase && S.phase !== "look" && S.cond !== "wall" && RO.cut(id) === "cut") { cls += " lv-edge"; tag = '<i class="rl-tag lv-cutt">' + ic(GEO[id].top < S.scroll ? "up" : "down", 12) + '<span class="lv-tt">Cut off</span></i>'; }
    if (S.sel === id) cls += " lv-sel";
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
  RO.stageHtml = function () {
    /* No webcam on the desktop (RS-76): until a photo is given the stage is a drop zone; after, the photo (the paper) as before. The conditions of a live camera (blur, dark, glare, rest) do not exist there. */
    if (RO.vp.noCamera && !S.still) return '<div class="rl-stage lv-stage rl-drop" data-act="photos" data-over="0" data-busy="0"><div class="rl-drop-in"><span class="ic" aria-hidden="true">' + ic("image", 34) + '</span><h2>Drop a photo of the receipt here</h2><p>Or paste it, or choose a file. A flat, sharp, well-lit photo reads best. Lines collect in the list as they are read.</p><button type="button" class="rs-b pri big" data-act="photos">' + ic("image", 20) + "<span>Choose a photo</span></button></div></div>";
    var c = RO.vp.noCamera ? "auto" : S.cond, cl = "rl-stage lv-stage lv-live" + (RO.opt && S.step === "view" ? " lv-tall" : RO.opt === "c" ? " lv-mid" : " lv-short");
    if (c === "blur") cl += " lv-blur"; if (c === "dark" && !S.torch) cl += " lv-dark"; if (c === "glare") cl += " lv-glare";
    var h = '<div class="' + cl + '" data-cond="' + c + '">';
    h += c === "wall" ? '<div class="lv-wall"><i></i></div>' : paperHtml();
    if (c === "glare") h += '<div class="lv-gl" aria-hidden="true"></div>';
    h += '<div class="rl-flash" aria-hidden="true"></div>';
    if (RO.opt && S.step === "view" && (S.phase === "end" || S.still)) h += '<div class="ro2-stamp" role="status">' + ic("check", 22) + "<b>Read</b><span>" + (RO.tally().total + RO.tally().left) + " lines</span></div>";
    if (S.cond === "rest" && !RO.vp.noCamera) h += '<div class="rl-rest"><p>Looking has stopped to save battery.</p><button type="button" class="rl-go" data-act="resume">' + ic("camera", 18) + "Resume</button></div>";
    return h + "</div>";
  };

  /* ---------- the prompt, as Shopping's (CS-D4) ---------- */
  function promptFor() {
    var c = RO.vp.noCamera ? "auto" : S.cond, t = tally(), n = t.total + t.left, ph = S.phase, need = t.check + t.unsure;
    if (c === "rest") return { tone: "info", ic: "pause", text: "Camera resting", sub: "Stopped after 150 s without a photo" };
    if (c === "blur") return { tone: "warn", ic: "warn", text: "Hold steady, the image is blurry." };
    if (c === "wall") return { tone: "soft", ic: "eye", text: "Can't find a receipt (best guess): very little text.", sub: n ? n + " lines already read are kept" : "" };
    if (c === "dark" && !S.torch) return { tone: "warn", ic: "sun", text: "Too dark to read well.", sub: "Turn on the light, or move nearer a window" };
    if (c === "glare") return { tone: "warn", ic: "sun", text: "Glare on the paper.", sub: "Tilt the receipt a little" };
    if (c === "partial") return { tone: "soft", ic: "hold", text: "Some lines are cut off at the edge.", sub: "Slide the receipt so whole lines show" };
    if (ph === "take") return { tone: "take", ic: "camera", text: "Steady. Taking the photo..." };
    if (ph === "banked") return { tone: "ok", ic: "check", text: "Got " + S.banked + " lines.", sub: S.pos < 2 ? "Slide the receipt up for the rest" : "" };
    if (ph === "end") return { tone: "ok", ic: "check", text: "That is the whole receipt: " + n + " lines.", sub: RO.opt ? (need ? need + " to settle in the next step" : "Everything is settled") : need ? need + " to settle, in the list below" : "Everything is settled" };
    if (ph === "again") return { tone: "info", ic: "eye", text: "Seen again: Butter. Not counted twice." };
    if (ph === "found" || ph === "hold") return { tone: "ok", ic: "hold", text: "Receipt found. Hold steady...", sub: n + " lines read" + (need ? ", " + need + " to settle" : "") };
    if (S.still) return { tone: "ok", ic: "image", text: "Photo read: " + n + " lines.", sub: need ? need + " to settle" : "" };
    if (RO.vp.noCamera) return { tone: "info", ic: "image", text: "No photo yet", sub: "Drop, paste or choose a photo of the receipt" };
    return { tone: "info", ic: "eye", text: "Looking for a receipt...", sub: "Point the camera at it" };
  }
  function promptHtml() { var s = promptFor(); return '<p class="rl-status" data-tone="' + s.tone + '" role="status" aria-live="polite"><span class="rl-sign" aria-hidden="true">' + ic(s.ic, 20) + '</span><span class="rl-say">' + s.text + (s.sub ? "<small>" + s.sub + "</small>" : "") + "</span></p>"; }
  function progHtml() {
    if (RO.vp.noCamera) return "";
    var on = (S.phase === "found" || S.phase === "hold" || S.phase === "take") && !/blur|wall|dark|glare|rest|partial/.test(S.cond) && !S.still, p = on ? (S.phase === "take" ? 1 : S.p) : 0;
    return '<div class="rl-prog"' + (on ? "" : " data-idle") + '><span class="rl-steady" role="progressbar" aria-label="Steady" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(p * 100) + '"><i style="width:' + Math.round(p * 100) + '%"></i></span><span class="rl-held">' + (on ? "Steady " + Math.min(RO.HOLD, p * RO.HOLD).toFixed(1) + " of " + RO.HOLD.toFixed(1) + " s" : "") + "</span></div>";
  }
  var RING = 2 * Math.PI * 34;
  function shutterHtml() {
    var p = (S.phase === "found" || S.phase === "hold" || S.phase === "take") ? (S.phase === "take" ? 1 : S.p) : 0;
    return '<button type="button" class="rl-shutter" data-act="shutter" aria-label="Take the photo now"><svg class="rl-ring" viewBox="0 0 76 76" aria-hidden="true"><circle class="rl-ring-bg" cx="38" cy="38" r="34"/><circle class="rl-ring-pg" cx="38" cy="38" r="34" stroke-dasharray="' + RING.toFixed(1) + '" stroke-dashoffset="' + (RING * (1 - p)).toFixed(1) + '"/></svg><span class="rl-core"></span></button>';
  }
  function actionsHtml() {
    if (RO.opt && S.step === "view") return twoActions();
    return actionsHtml0();
  }
  /* Revision 4, step 1: the right-hand button is Sort, not Add. It wakes when the receipt has been read (the whole receipt, or a photo). */
  function twoActions() {
    var t = tally(), ready = S.phase === "end" || S.still || S.fixed, n = t.total + t.left, w = RO.vp.words || {};
    return '<div class="rl-actions"><button type="button" class="rl-side" data-act="photos">' + ic("image", 18) + (w.photo || "Choose a photo") + '</button>' + shutterHtml() +
      '<button type="button" class="rl-side lv-add ro2-sort" data-act="sort"' + (ready ? "" : " disabled") + ' aria-label="Sort the ' + n + ' lines read">' + ic("list", 18) + "Sort " + (ready ? n : "") + (ready ? " lines" : "") + "</button></div>";
  }
  function actionsHtml0() {
    var t = tally(), w = RO.vp.words || {}, key = DESK() && S.keys;
    return '<div class="rl-actions"' + (RO.vp.noCamera ? ' data-nocam="1"' : "") + '><button type="button" class="rl-side" data-act="photos">' + ic("image", 18) + (w.photo || "Choose a photo") + "</button>" + (RO.vp.noCamera ? "" : shutterHtml()) +
      '<button type="button" class="rl-side lv-add" data-act="summary"' + (t.ready ? "" : " disabled") + ' aria-label="Add ' + t.ready + ' to the Pantry">' + ic("check", 18) + "Add " + t.ready + (key ? '<span class="kbd">⇧↵</span>' : "") + "</button></div>";
  }
  function barHtml() { return '<div class="rl-bar"><button type="button" class="rl-done" data-act="leave" aria-label="Done, close the camera">' + ic("x", 18) + "Done</button><h2 id=\"rl-title\">Scan receipt</h2>" + (S.cond === "dark" && !RO.vp.noCamera ? '<button type="button" class="rl-torch" data-act="torch" aria-pressed="' + S.torch + '" aria-label="Light on">' + ic("sun", 18) + "</button>" : '<span class="rl-bar-gap" aria-hidden="true"></span>') + "</div>"; }
  /* Revision 4, step 1: what was read, counted, under the picture. Large, one line, the same four words as the list. */
  RO.readout = function () {
    var t = tally(), n = t.total + t.left, chip = function (k, g, w, c) { return '<span class="ro-chip ro2-c" data-k="' + k + '">' + ic(g, 14) + "<b>" + c + "</b><span>" + w + "</span></span>"; };
    if (!n) return '<p class="ro2-read ro2-none">' + ic("receipt", 18) + "Lines appear here as they are read.</p>";
    return '<div class="ro2-read" role="status"><b class="ro2-n">' + n + " lines read</b><span class=\"ro2-chips\">" + chip("top", "check", "sure", t.exact) + chip("check", "approx", "check", t.check) + chip("unsure", "q", "unsure", t.unsure) + chip("ignored", "x", "left out", t.ignored) + "</span></div>";
  };
  /* Revision 4, step 2: its own top bar. Back goes to the receipt (the paper as it was read), not to the camera. */
  RO.sortBar = function () { return '<div class="rl-bar"><button type="button" class="rl-done" data-act="seepaper" aria-label="Back to the receipt">' + ic("up", 18) + 'Receipt</button><h2 id="rl-title">Sort the lines</h2></div>'; };
  RO.sortActions = function () {
    var t = tally();
    return '<div class="rl-actions ro2-sortbar"><button type="button" class="rl-side" data-act="seepaper">' + ic("receipt", 18) + 'See the receipt</button><button type="button" class="rl-side lv-add" data-act="summary"' + (t.ready ? "" : " disabled") + ' aria-label="Add ' + t.ready + ' to the Pantry">' + ic("check", 18) + "Add " + t.ready + "</button></div>";
  };
  RO.parts = function () { return { bar: barHtml(), status: promptHtml(), prog: progHtml(), actions: actionsHtml() }; };

  /* ---------- the progress readout and the filter (RS-64) ---------- */
  RO.head = function () {
    var t = tally(), pct = t.total ? Math.round(t.resolved / t.total * 100) : 0, f = S.filter;
    var tab = function (k, w, n) { return '<button type="button" class="ro-f" role="tab" aria-selected="' + (f === k) + '" data-act="filter" data-v="' + k + '"' + (k !== "all" && !n ? ' data-zero="1"' : "") + "><span>" + w + "</span><b>" + n + "</b></button>"; };
    return '<div class="ro-head"><div class="ro-prog"><b class="ro-pn" aria-live="polite">' + t.resolved + " of " + t.total + ' resolved</b><span class="ro-pb" role="progressbar" aria-valuemin="0" aria-valuemax="' + t.total + '" aria-valuenow="' + t.resolved + '" aria-label="Lines resolved"><i style="width:' + pct + '%"></i></span></div>' +
      '<div class="ro-fs" role="tablist" aria-label="Show"' + (RO.opt === "a" ? ' data-n="3"' : "") + ">" + (RO.opt === "a" ? tab("todo", "To settle", t.check + t.unsure) + tab("ignored", "Left out", t.ignored) + tab("ready", "Ready", t.ready) : tab("all", "All", t.total + t.left) + tab("check", "Check", t.check) + tab("unsure", "Unsure", t.unsure) + tab("ignored", "Ignored", t.ignored)) + "</div></div>";
  };

  /* ---------- the receipt-order list: Pantry rows (RS-55, RS-58 to RS-63) ---------- */
  var btn = function (act, id, label, cls, g, key, v) { return '<button type="button" class="rs-b ' + (cls || "") + '" data-act="' + act + '" data-id="' + id + '"' + (v != null ? ' data-v="' + v + '"' : "") + ">" + (g ? ic(g, 18) : "") + "<span>" + label + "</span>" + (key ? '<span class="kbd cap">' + key + "</span>" : "") + "</button>"; };
  RO.acts = function (l) {
    var o = out(l), k = o.k, id = l.id, key = DESK() && S.keys;
    if (k === "ignored") return btn("restore", id, "Put back", "sm", "undo", key && "Z");
    if (k === "unsure") return btn("new", id, "Add as new", "pri sm", "plus", key && "N") + btn("pickopen", id, "Match to existing", "sm", "search", key && "M") + btn("ignore", id, "Ignore", "sm", "x", key && "X");
    // a recommended line (Exact or Check) the person sent to New keeps its way back: Pick another item (RS-74); a New line that began as Unsure keeps Match to existing
    if (k === "new") { var recd = l.st === "exact" || l.st === "check"; return btn("pickopen", id, recd ? "Pick another item" : "Match to existing", "sm", recd ? "swap" : "search", key && (recd ? "P" : "M")) + btn("ignore", id, "Ignore", "sm", "x", key && "X"); }
    return (k === "check" ? btn("accept", id, "Accept", "pri sm", "check", key && "Y") : "") + btn("pickopen", id, "Pick another item", "sm", "swap", key && "P") + btn("new", id, "New", "sm", "plus", key && "N");
  };
  function itemTile(p) { return '<span class="rs-itile"><span class="rs-em">' + (p.em || ic("pantry", 20)) + '</span><span class="rs-itx"><b>' + esc(p.name) + "</b><small>" + (p.out ? "Out, " : "") + fmt(p.q, p.u) + " · " + p.place + "</small></span></span>"; }
  /* the picker: search the Pantry and pick an existing item. Candidates first (RS-8, RS-62). Used for Pick another item and Match to existing. */
  function picker(l) {
    var o = out(l), cs = [l.m].concat(l.cand || []).filter(function (c) { return c && c !== o.m; }), term = (S.find || "").toLowerCase();
    var all = D.pantry.filter(function (p) { return p.id !== o.m; }), rest = all.filter(function (p) { return cs.indexOf(p.id) < 0; }).sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
    var list = cs.map(P).concat(rest).filter(function (p) { return !term || p.name.toLowerCase().indexOf(term) >= 0; });
    var h = '<div class="ro-pick" role="group" aria-label="Pick an existing item"><label class="rs-lbl" for="pk-' + l.id + '">' + (l.st === "unsure" ? "Match to an existing item" : "Pick another item") + '</label><div class="ro-pk-in">' + ic("search", 18) + '<input id="pk-' + l.id + '" class="rs-in" data-find value="' + esc(S.find) + '" placeholder="Search your Pantry" autocomplete="off"><button type="button" class="ib" data-act="pickclose" aria-label="Close the search">' + ic("x", 18) + '</button></div><ul class="ro-pk-l">';
    h += list.length ? list.slice(0, 7).map(function (p, i) { return '<li><button type="button" class="ro-pk-b" data-act="pick" data-id="' + l.id + '" data-v="' + p.id + '">' + itemTile(p) + (i === 0 && !term && cs.length ? '<span class="tag">Closest</span>' : "") + "</button></li>"; }).join("") : '<li class="ro-pk-none">Nothing in your Pantry matches “' + esc(S.find) + "”.</li>";
    return h + "</ul></div>";
  }
  var stepper = function (l) { return '<span class="rs-step" role="group" aria-label="Quantity"><button type="button" class="rs-sb" data-act="qm" data-id="' + l.id + '" aria-label="Less">' + ic("minus", 16) + "</button><output>" + fmt(qOf(l), l.u) + '</output><button type="button" class="rs-sb" data-act="qp" data-id="' + l.id + '" aria-label="More">' + ic("plus", 16) + "</button></span>"; };
  /* the opened row: what was printed, how the amount was read, the amount, the name of a new item (RS-38, RS-17) */
  function more(l) {
    var o = out(l), id = l.id, h = '<div class="ro-more">';
    h += '<div class="rs-read"><span class="rs-lbl">On the receipt</span><div class="rs-print">' + l.raw.map(function (r) { return "<div>" + esc(r) + "</div>"; }).join("") + '</div><span class="rs-price">' + money(l.price) + "</span></div>";
    h += '<p class="rs-how">' + ic("receipt", 14) + "<span>" + esc(l.note || l.why || "") + "</span></p>";
    if (l.st !== "left" && o.k !== "ignored") {
      if (o.k === "new" || o.k === "unsure") h += '<label class="rs-lbl" for="nm-' + id + '">New item name</label><input id="nm-' + id + '" class="rs-in" data-nm="' + id + '" value="' + esc(S.nm[id] != null ? S.nm[id] : l.guess || "") + '" placeholder="' + (l.unclear ? "What is it? The text was unclear" : "Name") + '" autocomplete="off">';
      h += '<div class="rs-qrow"><span class="rs-lbl">Amount bought</span>' + stepper(l) + '<span class="rs-un">' + (l.from ? '<button type="button" class="rs-lk" data-act="split" data-id="' + id + '">' + ic("layers", 14) + (S.split[id] ? " Kept separate. Combine again" : " Combined from " + l.from + " lines. Keep separate") + "</button>" : "") + "</span></div>";
      if (o.k === "new") h += '<p class="rs-fine">' + ic("pantry", 14) + "<span>A new item has no place yet: it goes under Unplaced until you give it one (the same as Add item with Location left blank).</span></p>";
    }
    return h + "</div>";
  }
  RO.row = function (l) {
    var x = info(l), o = out(l), id = l.id, k = o.k, p = o.m && P(o.m), on = S.sel === id, rec = k === "top" || k === "check";
    var right = '<span class="ro-chip" data-k="' + k + '" data-st="' + l.st + '">' + ic(k === "top" && l.st === "exact" && !o.picked ? "check" : x.g, 14) + "<b>" + x.label + "</b></span>" + (k === "check" ? RO.conf(l) : "");
    var h = '<li class="ro-li' + (on ? " on" : "") + '" data-id="' + id + '" data-k="' + k + '" data-st="' + l.st + '"' + (S.res[id] ? ' data-you="1"' : "") + ">";
    if (rec || k === "unsure") h += '<div class="ro-sw" aria-hidden="true"><span class="ro-swr">' + (rec ? ic("check", 20) + "Accept" : "") + '</span><span class="ro-swl">' + (rec ? ic("plus", 20) + "New" : ic("x", 20) + "Ignore") + "</span></div>";
    h += '<div class="row ro-row" tabindex="0" role="button" aria-expanded="' + on + '" data-act="row" data-id="' + id + '" aria-label="' + esc(l.raw[0] + ". " + x.label + ". " + x.outcome) + '">';
    h += '<span class="rs-g" data-k="' + k + '" data-st="' + l.st + '">' + ic(x.g, 18) + '</span><span class="rmain"><span class="nm">' + (p && p.em ? p.em + " " : "") + esc(cap(x.name)) + '</span><span class="mt">' + esc(l.raw[0]) + (l.raw.length > 1 ? " +" + (l.raw.length - 1) : "") + " · " + money(l.price) + '</span><span class="ro-out" data-k="' + k + '">' + (k === "ignored" ? ic("x", 14) : "") + esc(x.outcome) + (x.back ? ". Back in stock" : "") + "</span></span>";
    h += '<span class="ro-st">' + right + "</span></div>";
    if (k === "ignored") h += RO.scrSvg(id).replace('class="lv-scr"', 'class="lv-scr ro-scr"');
    h += '<div class="ro-acts">' + RO.acts(l) + "</div>";
    if (S.pick === id) h += picker(l);
    if (on) h += more(l);
    return h + "</li>";
  };
  RO.list = function () {
    var ls = RO.visible();
    if (!seenLines().length) return '<div class="lv-list ro-list lv-keep" role="list"><p class="lv-empty">' + ic("receipt", 18) + "Lines appear here as they are read, in receipt order.</p></div>";
    if (!ls.length) return '<div class="lv-list ro-list lv-keep" role="list"><p class="lv-empty">' + ic("check", 18) + (S.filter === "todo" ? "Nothing left to settle. Everything is ready to add." : S.filter === "ready" ? "Nothing is ready yet." : S.filter === "check" ? "Nothing left to check." : S.filter === "unsure" ? "Nothing unsure." : "Nothing ignored.") + ' <button type="button" class="rs-lk" data-act="filter" data-v="all">Show all</button></p></div>';
    return '<ul class="rows lv-list ro-list lv-keep" role="list" aria-label="Lines read, in receipt order">' + ls.map(RO.row).join("") + "</ul>";
  };

  /* ---------- the summary: the commit step (RS-21, RS-48) ---------- */
  function entries() {
    var e = { top: [], news: [], ignored: [], left: [], open: [] };
    seenLines().forEach(function (l) {
      var o = out(l), x = info(l);
      if (o.k === "top") e.top.push([l, x]); else if (o.k === "new") { if (l.from && S.split[l.id]) { e.news.push([l, x, 1]); e.news.push([l, x, 2]); } else e.news.push([l, x]); }
      else if (o.k === "ignored") (l.st === "left" ? e.left : e.ignored).push([l, x]); else e.open.push([l, x]);
    });
    return e;
  }
  RO.entries = entries;
  RO.summary = function (mode) {
    var e = entries(), n = e.top.length + e.news.length, h = "", key = DESK() && S.keys;
    h += '<div class="rs-sh"><h2>' + (mode === "commit" ? "Add to your Pantry" : "So far") + "</h2>" + (mode === "commit" ? '<button type="button" class="x ib" data-act="closesheet" aria-label="Back to the camera">' + ic("x", 20) + "</button>" : "") + "</div>";
    h += '<div class="rs-counts"><div data-k="new"><b>' + e.news.length + "</b><span>new items</span></div><div data-k=\"top\"><b>" + e.top.length + "</b><span>updated</span></div><div data-k=\"skip\"><b>" + (e.ignored.length + e.left.length) + "</b><span>ignored</span></div></div>";
    if (e.open.length) h += '<div class="rs-note warn"><span class="rs-ni">' + ic("q", 22) + "</span><div><b>" + e.open.length + " still to settle</b><p>They will not be added unless you settle them.</p><button type=\"button\" class=\"rs-lk\" data-act=\"showopen\">" + ic("list", 14) + " Show " + e.open.length + "</button></div></div>";
    if (mode === "commit") {
      var grp = function (t, arr, f) { return arr.length ? '<div class="rs-sg"><h3>' + t + " (" + arr.length + ")</h3><ul>" + arr.map(f).join("") + "</ul></div>" : ""; };
      h += grp("Updated", e.top, function (a) { return '<li><span class="rs-sn">' + esc(cap(a[1].name)) + '</span><span class="rs-sd">' + a[1].outcome.replace("Updates existing ", "") + "</span></li>"; });
      h += grp("New items", e.news, function (a) { return '<li><span class="rs-sn">' + esc(cap(a[1].name)) + '</span><span class="rs-sd">' + fmt(a[2] ? a[0].q / 2 : qOf(a[0]), a[0].u) + "</span></li>"; });
      h += grp("Ignored", e.ignored.concat(e.left), function (a) { return '<li class="mute"><span class="rs-sn">' + esc(a[0].raw[0]) + '</span><span class="rs-sd">' + (a[0].st === "left" ? a[0].short : "Ignored") + "</span></li>"; });
      h += '<p class="rs-sumline">' + ic("receipt", 16) + "<span>" + D.ignored.length + " header and total lines were not read as items. Prices are shown to check, not saved.</span></p>";
      h += '<div class="rs-acts col stick"><button type="button" class="rs-b pri big" data-act="done"' + (n ? "" : " disabled") + ">" + ic("check", 20) + "<span>Add " + n + " to the Pantry</span>" + (key ? '<span class="kbd cap">⇧↵</span>' : "") + '</button><button type="button" class="rs-b" data-act="closesheet"><span>Back to the camera</span></button></div><p class="rs-fine">You can undo this for 9 seconds here, then for 5 minutes from the Pantry’s history.</p>';
    } else h += '<div class="rs-acts col stick"><button type="button" class="rs-b pri big" data-act="summary"' + (n ? "" : " disabled") + ">" + ic("check", 20) + "<span>Review and add " + n + "</span></button></div>";
    return h;
  };

  /* ---------- the Pantry behind (the page the flow starts from and ends on) ---------- */
  RO.pantry = function () {
    var rows = {}, fresh = S.step === "done" && !S.undone, ov = {}, ls = seenLines();
    if (fresh) ls.forEach(function (l) { var o = out(l), x = info(l); if (o.k === "top") ov[o.m] = x.outcome.replace(/^Updates existing \(|\)$/g, "").replace(" to ", " → "); });
    D.pantry.filter(function (p) { return !p.out || ov[p.id]; }).forEach(function (p) { var a = p.place.split(" · ")[0]; (rows[a] = rows[a] || []).push(p); });
    var news = fresh ? ls.filter(function (l) { return out(l).k === "new"; }) : [];
    var cnt = D.pantry.filter(function (p) { return !p.out; }).length + news.length;
    var h = '<div class="hd"><span class="count">' + cnt + ' items</span><button type="button" class="btn pri" data-act="add" aria-haspopup="dialog">+ Add' + (DESK() ? '<span class="kbd cap">+</span>' : "") + "</button></div>";
    ["Fridge", "Pantry", "Freezer"].forEach(function (a) {
      if (!rows[a]) return;
      h += '<div class="grp"><b>' + a + '</b><span class="tag">' + rows[a].length + '</span></div><ul class="rows">';
      rows[a].forEach(function (p) { h += '<li><div class="row"><span class="rmain"><span class="nm">' + (p.em ? p.em + " " : "") + esc(p.name) + '</span><span class="mt">' + (ov[p.id] ? "" : p.place + " · ") + (ov[p.id] ? '<b class="rs-new">' + ov[p.id] + "</b>" : fmt(p.q, p.u)) + "</span></span>" + (ov[p.id] ? '<span class="rs-just">Updated</span>' : "") + "</div></li>"; });
      h += "</ul>";
    });
    if (news.length) { h += '<div class="grp"><b>Unplaced</b><span class="tag">' + news.length + '</span></div><ul class="rows">'; news.forEach(function (l) { var x = info(l); h += '<li><div class="row"><span class="rmain"><span class="nm">' + esc(cap(x.name)) + '</span><span class="mt">' + fmt(qOf(l), l.u) + ' · no place yet</span></span><span class="rs-just">Added</span></div></li>'; }); h += "</ul>"; }
    return h;
  };
  RO.addSheet = function () {
    var d = DESK(), w = RO.vp.words || {};
    return '<div class="rs-sh"><h2>Add an item</h2><button type="button" class="x ib" data-act="closesheet" aria-label="Close">' + ic("x", 20) + '</button></div><button type="button" class="rs-scan-tile" data-act="scan"><span class="rs-st-ic">' + ic(RO.vp.noCamera ? "image" : "camera", 26) + '</span><span class="rs-st-tx"><b>Scan a receipt</b><small>' + (w.entry || "Point the camera at it. Lines collect in a list as they are read") + "</small></span>" + (d ? '<span class="kbd">R</span>' : ic("chev", 18)) + '</button><p class="rs-or">or add one item</p><div class="rs-form" aria-hidden="true"><span class="rs-lbl">Item</span><div class="rs-frow"><span class="rs-emt">+</span><span class="rs-fld">What is it?</span></div><span class="rs-lbl">Amount</span><span class="rs-fld">In your own words, e.g. a handful</span></div>';
  };
  RO.nav = function () { return [["home", "Home"], ["pantry", "Pantry"], ["cook", "Recipes"], ["cart", "Shopping"]].map(function (n) { return '<a class="nv' + (n[0] === "pantry" ? " on" : "") + '" href="#" tabindex="-1">' + ic(n[0], 24) + "<span>" + n[1] + "</span></a>"; }).join(""); };
  RO.refused = function () {
    var w = RO.vp.words || {};
    return '<div class="rl-bar"><button type="button" class="rl-done" data-act="leave">' + ic("x", 18) + 'Done</button><h2>Scan receipt</h2><span class="rl-bar-gap"></span></div><div class="lv-ref"><span class="ic">' + ic("camoff", 34) + "</span><h2>" + (w.noCam || "No camera here") + "</h2><p>" + (w.noCamWhy || "The camera is blocked or missing. You can still scan: take a photo, or choose one you already have.") + '</p><button type="button" class="rs-b pri big" data-act="photos">' + ic("image", 20) + "<span>" + (w.noCamBtn || "Take or choose a photo") + '</span></button><button type="button" class="rs-b" data-act="leave"><span>Back to the Pantry</span></button></div>';
  };
})();
