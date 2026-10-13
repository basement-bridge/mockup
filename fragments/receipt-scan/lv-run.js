/* Receipt scan, live revision: the engine (what the camera "sees" over time), the actions, the render and the events.
   Mockup only. A clock plays the part of the camera: look, found, steady, take, then the receipt slides up for the rest. Nothing is opened, read or saved.
   Viewport code is in lv.phone.js and lv.desktop.js, loaded below for the width in use (DESIGN.md section 7). */
(function () {
  "use strict";
  var LV = window.LV, S = LV.S, D = LV.D, $ = LV.$, $$ = LV.$$, L = LV.L, P = LV.P, out = LV.out, info = LV.info, ic = LV.ic, fmt = LV.fmt, esc = LV.esc;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, T = { tm: 0, iv: 0, t0: 0, undo: 0 }, lastScroll = 0, root;
  var DIR = function () { return LV.dirs[LV.dir]; };
  var buzz = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  function clear() { clearTimeout(T.tm); clearInterval(T.iv); T.tm = T.iv = 0; }
  var live = function () { return S.step === "view" && S.cond === "auto" && !S.fixed && !S.walk && S.sheet !== "summary"; };

  /* ---------- lines the camera can see right now ---------- */
  var visibleWhole = function () { return LV.ORDER.filter(function (id) { return LV.cut(id) === "full"; }); };
  var unseen = function () { return LV.ORDER.filter(function (id) { return !S.seen[id]; }); };
  function markSeen() { var n = 0; visibleWhole().forEach(function (id) { if (!S.seen[id]) { S.seen[id] = true; n++; } }); return n; }

  /* ---------- the clock that plays the camera ---------- */
  function begin() {
    clear(); if (S.step !== "view" || S.fixed) return;
    if (S.cond !== "auto") { S.phase = S.cond === "partial" || S.cond === "blur" || S.cond === "dark" || S.cond === "glare" ? "found" : "look"; render(); return; }
    look();
  }
  function look() { if (!live()) return; S.phase = "look"; S.p = 0; render(); T.tm = setTimeout(found, reduce ? 300 : 800); }
  function found() {
    if (!live()) return;
    var again = S.pos > 1 && visibleWhole().some(function (id) { return S.seen[id]; });
    markSeen(); S.p = 0; buzz(15);
    if (again) { S.phase = "again"; render(); T.tm = setTimeout(function () { S.phase = "found"; if (live()) { render(); T.t0 = Date.now(); T.iv = setInterval(tick, 60); } }, reduce ? 300 : 1000); return; }
    S.phase = "found"; render(); T.t0 = Date.now(); T.iv = setInterval(tick, 60);
  }
  function tick() {
    if (!live()) { clear(); return; }
    if (S.hold || S.sel && DIR().holds) { T.t0 = Date.now() - S.p * LV.HOLD * 1000; return; }
    var p = Math.min(1, (Date.now() - T.t0) / (LV.HOLD * 1000));
    if (p < 1) { S.p = p; setP(p); return; }
    clear(); capture(false);
  }
  function setP(p) {
    var i = $(".rl-steady i"), pt = $(".rl-held"), pg = $(".rl-ring-pg"), tr = $(".rl-steady"), C = 2 * Math.PI * 34;
    if (!i) { render(); return; }
    i.style.width = Math.round(p * 100) + "%"; tr.setAttribute("aria-valuenow", Math.round(p * 100)); pt.textContent = "Steady " + Math.min(LV.HOLD, p * LV.HOLD).toFixed(1) + " of " + LV.HOLD.toFixed(1) + " s";
    pg.setAttribute("stroke-dashoffset", (C * (1 - p)).toFixed(1)); $(".rl-prog").removeAttribute("data-idle");
  }
  function flash() { var f = $(".rl-flash"); if (f) { f.classList.add("rl-on"); } }
  function capture(manual) {
    clear(); if (S.cond === "wall" || S.cond === "rest") return;
    var before = LV.tally().seen; markSeen(); S.banked = LV.tally().seen - before;
    if (manual && S.frozen) { rescan(); return; }
    S.phase = "take"; S.p = 1; render(); flash(); buzz(30);
    T.tm = setTimeout(afterTake, reduce ? 200 : 450);
  }
  function afterTake() {
    if (S.step !== "view") return;
    var d = DIR();
    if (d.afterCapture && d.afterCapture()) return;
    S.phase = "banked"; render();
    if (unseen().length && S.scroll < LV.maxScroll() - 1 && S.cond === "auto" && !S.fixed) T.tm = setTimeout(pan, reduce ? 500 : 1500); else T.tm = setTimeout(end, reduce ? 300 : 1100);
  }
  var nextScroll = function () { return Math.min(LV.maxScroll(), S.scroll + Math.max(60, S.stageH - 84)); };
  function pan() { if (S.step !== "view" || S.sheet || S.walk) return; S.pos++; S.scroll = nextScroll(); S.phase = "look"; S.p = 0; render(); if (S.cond === "auto" && !S.fixed) T.tm = setTimeout(found, reduce ? 500 : 1400); }
  function end() { if (S.step !== "view") return; S.phase = "end"; render(); }
  function rescan() { S.walk = null; S.frozen = false; S.hold = false; S.sel = null; if (unseen().length) { pan(); } else { S.phase = "end"; render(); } }
  LV.clear = clear; LV.afterTake = afterTake; LV.end = end; LV.pan = pan;

  /* ---------- selecting a line: A and C hold the frame under the finger and pan it so the line is easy to reach ---------- */
  function select(id) {
    if (S.sel === id) return;
    if (S.sel === null) S.back = S.scroll;
    S.sel = id; S.hold = !!DIR().holds && !S.walk; if (!S.walk) S.scroll = LV.focusScroll(id);
    render();
  }
  function deselect() { if (S.sel === null) return; S.sel = null; S.hold = false; if (!S.walk && S.back != null) S.scroll = S.back; S.back = null; render(); }
  LV.select = select; LV.deselect = deselect;

  /* ---------- the walk (last look): the frozen frame, one open line at a time, the others dimmed ---------- */
  function startWalk(kind) {
    var ids = kind === "skip" ? LV.seenLines().filter(function (l) { return out(l).k === "skip"; }) : kind === "check" ? LV.openLines().filter(function (l) { return l.st === "fuzzy"; }) : kind === "none" ? LV.openLines().filter(function (l) { return l.st !== "fuzzy"; }) : LV.openLines();
    ids = ids.map(function (l) { return l.id; });
    if (!ids.length) { toast("Nothing to answer. Everything read is in order."); return; }
    clear(); S.sheet = ""; S.sel = null; S.hold = false; S.frozen = true; S.walk = { q: ids, i: 0, cur: ids[0], kind: kind || "open" }; S.phase = "frozen"; S.scroll = LV.focusScroll(ids[0]); render();
  }
  LV.startWalk = startWalk;
  function walkTo(i) { var w = S.walk; if (!w) return; w.i = Math.max(0, Math.min(w.q.length - 1, i)); w.cur = w.q[w.i]; S.scroll = LV.focusScroll(w.cur); render(); }
  function nextOpen(from) { var w = S.walk, n = w.q.length; for (var k = 1; k <= n; k++) { var j = (from + k) % n; if (out(L(w.q[j])).k === "open") return j; } return -1; }
  LV.walkPanel = function () {
    var w = S.walk, n = w.q.length, l = L(w.cur), t = LV.tally(), left = w.q.filter(function (id) { return out(L(id)).k === "open"; }).length, more = unseen().length;
    var h = '<div class="lv-walk" role="region" aria-label="Last look"><div class="lv-wh"><b>' + (w.kind === "skip" ? "Left out" : "Last look") + "</b><span>" + (w.i + 1) + " of " + n + "</span><span class=\"lv-dots\" aria-hidden=\"true\">" + w.q.map(function (id, i) { var a = out(L(id)).k !== "open"; return "<i" + (a ? ' class="on"' : "") + (i === w.i ? ' data-cur="1"' : "") + "></i>"; }).join("") + "</span></div>";
    h += LV.card(l, LV.DESK() ? "full" : "compact");
    h += '<div class="lv-wn"><button type="button" class="rs-b" data-act="wprev"' + (w.i ? "" : " disabled") + ">" + ic("back", 18) + "<span>Back</span></button>";
    if (!left) h += '<button type="button" class="rs-b pri" data-act="summary"' + (t.ready ? "" : " disabled") + ">" + ic("check", 18) + "<span>Add " + t.ready + "</span></button>";
    else h += '<button type="button" class="rs-b pri" data-act="wnext">' + "<span>" + (w.i < n - 1 ? "Next" : "Skip for now") + "</span>" + ic("chev", 18) + "</button>";
    h += "</div>";
    h += '<div class="lv-wf"><button type="button" class="rs-lk" data-act="rescan">' + ic("camera", 14) + (more ? "Scan the rest of the receipt" : "Back to the camera") + "</button></div></div>";
    return h;
  };

  /* ---------- toast and undo (RS-21, RS-22) ---------- */
  function toast(html, ms) { S.toast = html; render(true); clearTimeout(toast.t); if (ms) toast.t = setTimeout(function () { S.toast = null; render(true); }, ms); }
  function toastHtml() {
    if (!S.toast) return "";
    return '<div class="toast" role="status">' + S.toast + "</div>";
  }
  LV.toastHtml = toastHtml;

  /* ---------- actions ---------- */
  var step = function (u) { return u === "g" || u === "mL" ? 50 : u === "kg" || u === "L" ? .5 : 1; };
  function answered(id) {
    buzz(10); var d = DIR();
    if (S.walk) { var w = S.walk, j = nextOpen(w.i); if (j >= 0) { w.i = j; w.cur = w.q[j]; S.scroll = LV.focusScroll(w.cur); } render(); return; }
    if (d.afterAnswer) { d.afterAnswer(id); return; }
    render();
  }
  LV.act = function (a, id, v) {
    var l = id && L(id), r;
    switch (a) {
      case "add": S.sheet = "add"; render(); break;
      case "closesheet": S.sheet = ""; render(); break;
      case "scan": reset(false); S.sheet = ""; S.step = S.perm === "refused" ? "refused" : "view"; S.cond = "auto"; render(); if (S.step === "view") begin(); break;
      case "leave": clear(); S.step = "entry"; S.sheet = ""; S.walk = null; S.sel = null; S.hold = false; S.frozen = false; if (!S.fixed) reset(true); render(); break;
      case "torch": S.torch = !S.torch; render(); break;
      case "resume": S.cond = "auto"; S.phase = ""; begin(); break;
      case "shutter": if (S.walk) { rescan(); break; } capture(true); break;
      case "photos": clear(); S.step = "view"; S.cond = "auto"; S.hold = false; S.walk = null; S.frozen = false; S.sel = null; S.sheet = ""; if (!S.still) { S.still = true; S.pos = 1; S.scroll = 0; } else if (unseen().length) { S.pos++; S.scroll = nextScroll(); } S.fixed = true; markSeen(); S.phase = "still"; render(); break;
      case "box": if (S.walk) { var wi = S.walk.q.indexOf(id); if (wi >= 0) walkTo(wi); } else DIR().tap(id); break;
      case "deselect": deselect(); break;
      case "chip": if (v === "ready") { S.sheet = "summary"; render(); } else startWalk(v === "skip" ? "skip" : v === "check" ? "check" : "none"); break;
      case "last": startWalk("open"); break;
      case "rescan": rescan(); break;
      case "wprev": walkTo(S.walk.i - 1); break;
      case "wnext": { var j = nextOpen(S.walk.i); walkTo(j >= 0 ? j : Math.min(S.walk.q.length - 1, S.walk.i + 1)); break; }
      case "summary": S.sheet = "summary"; S.sel = null; S.hold = false; render(); break;
      case "match": S.res[id] = { k: "match" }; answered(id); break;
      case "new": S.res[id] = { k: "new" }; answered(id); break;
      case "skip": S.res[id] = { k: "skip" }; S.just = id; answered(id); break;
      case "add2": S.res[id] = { k: "add" }; render(); break;
      case "pick": S.res[id] = { k: "pick", pick: v }; answered(id); break;
      case "mode": r = S.res[id] || { k: "match" }; S.res[id] = { k: r.k, pick: r.pick, mode: v }; render(); break;
      case "undo": delete S.res[id]; render(); break;
      case "qm": S.q[id] = Math.max(step(l.u), Math.round(((S.q[id] != null ? S.q[id] : l.q) - step(l.u)) * 1000) / 1000); render(); break;
      case "qp": S.q[id] = Math.round(((S.q[id] != null ? S.q[id] : l.q) + step(l.u)) * 1000) / 1000; render(); break;
      case "split": S.split[id] = !S.split[id]; render(); break;
      case "more": S.exp[id] = true; render(); break;
      case "done": commit(); break;
      case "undodone": S.undone = true; clearInterval(T.undo); S.toast = 'Undone. The Pantry is as it was. <button type="button" data-act="redo">Redo</button>'; render(); break;
      case "redo": S.undone = false; S.toast = null; startUndo(); render(); break;
    }
  };
  function commit() {
    clear(); var n = LV.tally().ready; S.step = "done"; S.sheet = ""; S.undone = false; S.walk = null; S.sel = null; S.frozen = false; startUndo(n); render();
  }
  function startUndo(n) {
    n = n || LV.tally().ready; var t0 = Date.now(); clearInterval(T.undo);
    S.toast = 'Added ' + n + ' to the Pantry. <button type="button" data-act="undodone">Undo</button><span class="lv-cd" aria-hidden="true"><i></i></span>';
    if (!S.fixed) T.undo = setInterval(function () { var p = (Date.now() - t0) / 9000; if (p >= 1) { clearInterval(T.undo); S.toast = null; render(true); return; } var i = $(".lv-cd i"); if (i) i.style.width = (100 - p * 100) + "%"; }, 100);
  }
  function reset(all) { S.res = {}; S.q = {}; S.nm = {}; S.split = {}; S.seen = {}; S.exp = {}; S.sel = null; S.hold = false; S.walk = null; S.frozen = false; S.still = false; S.pos = 1; S.scroll = 0; S.back = null; S.phase = ""; S.p = 0; S.toast = null; S.undone = false; S.just = null; if (all) { S.fixed = false; } }

  /* ---------- the preset states: a page can open at any moment (?pre=, ?phase=, ?pos=) ---------- */
  function preset() {
    var pre = LV.Q.get("pre") || "";
    if (S.step === "view" || S.step === "done") {
      S.scroll = LV.scrollFor(S.pos);
      if (S.fixed || pre) { ensureStage(); }
      var all = pre === "all" || pre === "resolved" || pre === "half" || S.step === "done";
      if (all) LV.ORDER.forEach(function (id) { S.seen[id] = true; }); else if (S.phase && S.phase !== "look" && !/wall|rest/.test(S.cond)) { S.vis = true; markSeen(); }
      if (S.cond === "partial") { S.scroll = LV.scrollFor(3); markSeen(); }
      if (LV.Q.get("scroll") === "max") { S.scrollMax = true; S.scroll = LV.maxScroll(); }
      if (pre === "half") { S.res.l6 = { k: "match" }; S.res.l8 = { k: "match" }; S.res.l12 = { k: "new" }; S.res.s1 = undefined; delete S.res.s1; }
      if (pre === "resolved" || S.step === "done") { ["l6", "l7", "l8", "l9", "l10"].forEach(function (i) { S.res[i] = { k: "match" }; }); S.res.l11 = { k: "new" }; S.nm.l11 = "Chicken breast"; S.res.l12 = { k: "new" }; S.res.l13 = { k: "new" }; S.res.l14 = { k: "skip" }; }
      (LV.Q.get("res") || "").split(";").forEach(function (x) { var a = x.split(":"); if (a[0] && a[1]) S.res[a[0]] = { k: a[1] }; });
      if (S.step === "done") { S.sheet = ""; }
      if (S.sel && S.step === "view") { S.back = S.scroll; S.hold = !!DIR().holds; if (!S.walk) S.scroll = LV.focusScroll(S.sel); }
      if (S.walk) { var ids = LV.openLines().map(function (l) { return l.id; }); if (!ids.length) ids = LV.ORDER.filter(function (i) { return L(i).st === "none"; }); if (S.sel && ids.indexOf(S.sel) < 0) ids = [S.sel].concat(ids); S.walk = { q: ids, i: Math.max(0, ids.indexOf(S.sel)), cur: S.sel && ids.indexOf(S.sel) >= 0 ? S.sel : ids[0], kind: "open" }; S.frozen = true; S.phase = S.phase || "frozen"; S.scroll = LV.focusScroll(S.walk.cur); S.sel = null; }
      if (S.still && S.phase === "") S.phase = "still";
    }
    if (S.step === "done") { startUndo(); if (LV.Q.get("state") === "undone") { S.undone = true; S.toast = 'Undone. The Pantry is as it was. <button type="button" data-act="redo">Redo</button>'; } }
  }
  function ensureStage() { /* a static page needs the stage height before it can say which lines are whole: draw once, measure, draw again */
    var h = LV.DESK() ? 460 : 380; S.stageH = h;
  }

  /* ---------- the screens ---------- */
  function scanCol() {
    var p = LV.parts(), d = DIR(), walking = !!S.walk, inline = walking && !LV.DESK(), h = "";
    h += p.bar + p.status + (inline ? "" : p.prog) + LV.stageHtml(d.stageCls ? d.stageCls() : "");
    if (inline) h += LV.walkPanel(); else { h += walking ? "" : (d.extra ? d.extra() : ""); h += '<div class="rl-panel">' + p.legend + p.actions + "</div>"; }
    return h;
  }
  LV.scanCol = scanCol;
  function screen() {
    var s = { step: S.step };
    if (S.step === "entry" || S.step === "done") { s.main = LV.pantry(); s.sheet = S.step === "entry" && S.sheet === "add" ? LV.addSheet() : ""; }
    else if (S.step === "refused") s.html = LV.refused();
    else { s.col = scanCol(); s.sheet = S.sheet === "summary" ? LV.summary("commit") : (DIR().sheet ? DIR().sheet() : ""); s.lane = S.sheet === "summary" ? LV.summary("commit") : S.walk ? LV.walkPanel() : (DIR().lane ? DIR().lane() : LV.summary("lane")); s.summary = S.sheet === "summary"; }
    s.toast = LV.toastHtml();
    return s;
  }

  /* ---------- render ---------- */
  var once = 0;
  function render(keep) {
    if (!root) return;
    var f = document.activeElement, fk = f && f.dataset && f.dataset.act ? { a: f.dataset.act, i: f.dataset.id, v: f.dataset.v } : null, tx = f && f.matches && f.matches("input") ? { id: f.id, s: f.selectionStart } : null;
    var sc = $$(".lv-keep", root).map(function (e) { return e.scrollTop; }), lsx = $(".lv-dscroll", root), lsl = lsx ? lsx.scrollLeft : 0;
    var prev = $(".lv-paper", root), from = prev ? lastScroll : S.scroll;
    var j = S.just; S.just = null; var s = screen(); S.just = j;
    root.innerHTML = LV.vp.compose ? LV.vp.compose(s) : "";
    S.just = null;
    root.dataset.step = S.step; root.dataset.dir = LV.dir; root.dataset.sheet = s.sheet ? "1" : "0"; root.dataset.walk = S.walk ? "1" : "0";
    var paper = $(".lv-paper", root);
    if (paper) {
      if (!S.fixed && !reduce && from !== S.scroll) { paper.style.transition = "none"; paper.style.transform = "translateY(" + (-from) + "px)"; paper.offsetHeight; paper.style.transition = ""; paper.style.transform = "translateY(" + (-S.scroll) + "px)"; }
      lastScroll = S.scroll;
      var st = $(".lv-stage", root); if (st && st.clientHeight && Math.abs(st.clientHeight - S.stageH) > 1 && once < 3) { S.stageH = st.clientHeight; once++; if (S.vis) { S.seen = {}; markSeen(); } if (S.scrollMax) S.scroll = LV.maxScroll(); render(); return; }
    }
    if (S.phase === "take") flash();
    $$(".lv-keep", root).forEach(function (e, i) { if (sc[i]) e.scrollTop = sc[i]; });
    var ns = $(".lv-dscroll", root); if (ns && lsl) ns.scrollLeft = lsl;
    var cur = $(".lv-lr.on, .lv-dc.on", root); if (cur && cur.scrollIntoView && S.sel) { try { cur.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) {} }
    if (tx) { var e2 = document.getElementById(tx.id); if (e2) { e2.focus(); try { e2.setSelectionRange(tx.s, tx.s); } catch (e) {} } }
    else if (fk) { var q = '[data-act="' + fk.a + '"]' + (fk.i != null ? '[data-id="' + fk.i + '"]' : "") + (fk.v != null ? '[data-v="' + fk.v + '"]' : ""), e3 = $(q, root); if (e3 && !keep) e3.focus({ preventScroll: true }); }
    syncCtl();
    if (DIR().after) DIR().after();
    if (LV.vp.after) LV.vp.after();
  }
  LV.render = render;

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || b.disabled || !root.contains(b)) return;
    if (b.getAttribute("data-act") === "box" && e.target.closest(".lv-ro")) return;
    LV.act(b.getAttribute("data-act"), b.getAttribute("data-id"), b.getAttribute("data-v"));
  });
  document.addEventListener("input", function (e) { var t = e.target; if (t.dataset && t.dataset.nm) S.nm[t.dataset.nm] = t.value; });
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if ((e.key === "Enter" || e.key === " ") && t.matches && t.matches('.lv-ln[data-act="box"]')) { e.preventDefault(); LV.act("box", t.dataset.id); return; }
    if (LV.vp.key) LV.vp.key(e);
  });

  /* ---------- the prototype controls: added to the size and theme panel (backtick) ---------- */
  var ctl;
  function syncCtl() { if (!ctl) return; $$("[data-cond]", ctl).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.cond === S.cond)); }); $$("[data-perm]", ctl).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.perm === S.perm)); }); $$("[data-cf]", ctl).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.cf === S.conf)); }); }
  function addControls() {
    var p = $(".dvp"); if (!p) return;
    ctl = document.createElement("div");
    ctl.innerHTML = '<h3>What the camera sees</h3><div class="dvc">' + [["auto", "Receipt in view"], ["blur", "Blurry"], ["wall", "Not a receipt"], ["dark", "Too dark"], ["glare", "Glare"], ["partial", "Cut off"], ["rest", "Resting"]].map(function (c) { return '<button type="button" data-cond="' + c[0] + '">' + c[1] + "</button>"; }).join("") + '</div><h3>Camera permission</h3><div class="dvc"><button type="button" data-perm="allowed">Allowed</button><button type="button" data-perm="refused">Refused</button></div><h3>Confidence look</h3><div class="dvc"><button type="button" data-cf="pips">Dots</button><button type="button" data-cf="bars">Bars</button><button type="button" data-cf="ring">Ring</button></div><h3>Start</h3><div class="dvc"><button type="button" data-go="entry">Pantry</button><button type="button" data-go="scan">Scan again</button></div>';
    p.insertBefore(ctl, p.firstChild);
    ctl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.cond) { reset(false); S.step = "view"; S.fixed = false; S.sheet = ""; S.cond = b.dataset.cond; if (S.cond === "partial") { S.scroll = LV.scrollFor(3); } if (S.perm === "refused") S.perm = "allowed"; render(); begin(); if (S.cond === "partial") { S.scroll = LV.scrollFor(3); markSeen(); render(); } }
      else if (b.dataset.perm) { S.perm = b.dataset.perm; if (S.step === "view" || S.step === "refused") { reset(false); S.step = S.perm === "refused" ? "refused" : "view"; render(); begin(); } }
      else if (b.dataset.cf) { S.conf = b.dataset.cf; render(); }
      else if (b.dataset.go === "entry") { clear(); reset(true); S.step = "entry"; S.sheet = "add"; render(); }
      else if (b.dataset.go === "scan") LV.act("scan");
      syncCtl();
    });
    syncCtl();
  }

  /* ---------- boot: load the viewport's own file, then draw ---------- */
  function load(src, cb) { var s = document.createElement("script"); s.src = src; s.onload = cb; document.head.appendChild(s); }
  var curVp = "";
  function boot() {
    var want = LV.DESK() ? "desktop" : "phone";
    if (curVp === want) return;
    var first = !curVp; curVp = want;
    load("lv." + want + ".js", function () {
      if (first) { preset(); if (S.step === "entry" && LV.Q.get("sheet") === null) S.sheet = "add"; }
      if (S.step === "done" && !S.fixed) { }
      render(); if (first) { if (S.step === "view") begin(); addControls(); } else if (S.step === "view" && !S.fixed) begin();
    });
  }
  document.addEventListener("DOMContentLoaded", function () { root = document.getElementById("app"); boot(); matchMedia("(min-width:1024px)").addEventListener("change", boot); });
  if (document.readyState !== "loading") { root = document.getElementById("app"); boot(); matchMedia("(min-width:1024px)").addEventListener("change", boot); }
})();
