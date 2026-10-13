/* Receipt scan, chosen flow (Option A, Receipt order, live): the engine (what the camera "sees" over time), the actions, the render and the events.
   Mockup only. A clock plays the part of the camera: look, found, steady, take, then the receipt slides up for the rest. Nothing is opened, read or saved.
   Viewport code is in ro.phone.js (the swipe) and ro.desktop.js (the keys, drop and paste), loaded below for the width in use (DESIGN.md section 7). */
(function () {
  "use strict";
  var RO = window.RO, S = RO.S, $ = RO.$, $$ = RO.$$, L = RO.L, out = RO.out, info = RO.info, ic = RO.ic;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, T = { tm: 0, iv: 0, t0: 0, undo: 0 }, lastScroll = 0, root;
  var buzz = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  function clear() { clearTimeout(T.tm); clearInterval(T.iv); T.tm = T.iv = 0; }
  var live = function () { return S.step === "view" && S.cond === "auto" && !S.fixed && S.sheet !== "summary"; };

  /* ---------- lines the camera can see right now ---------- */
  var visibleWhole = function () { return RO.ORDER.filter(function (id) { return RO.cut(id) === "full"; }); };
  var unseen = function () { return RO.ORDER.filter(function (id) { return !S.seen[id]; }); };
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
    var p = Math.min(1, (Date.now() - T.t0) / (RO.HOLD * 1000));
    if (p < 1) { S.p = p; setP(p); return; }
    clear(); capture();
  }
  function setP(p) {
    var i = $(".rl-steady i"), pt = $(".rl-held"), pg = $(".rl-ring-pg"), tr = $(".rl-steady"), C = 2 * Math.PI * 34;
    if (!i) { render(); return; }
    i.style.width = Math.round(p * 100) + "%"; tr.setAttribute("aria-valuenow", Math.round(p * 100)); pt.textContent = "Steady " + Math.min(RO.HOLD, p * RO.HOLD).toFixed(1) + " of " + RO.HOLD.toFixed(1) + " s";
    pg.setAttribute("stroke-dashoffset", (C * (1 - p)).toFixed(1)); $(".rl-prog").removeAttribute("data-idle");
  }
  function flash() { var f = $(".rl-flash"); if (f) { f.classList.add("rl-on"); } }
  function capture() {
    clear(); if (S.cond === "wall" || S.cond === "rest") return;
    var before = RO.tally().total + RO.tally().left; markSeen(); S.banked = RO.tally().total + RO.tally().left - before;
    S.phase = "take"; S.p = 1; render(); flash(); buzz(30);
    T.tm = setTimeout(afterTake, reduce ? 200 : 450);
  }
  function afterTake() {
    if (S.step !== "view") return;
    S.phase = "banked"; render();
    if (unseen().length && S.scroll < RO.maxScroll() - 1 && S.cond === "auto" && !S.fixed) T.tm = setTimeout(pan, reduce ? 500 : 1500); else T.tm = setTimeout(end, reduce ? 300 : 1100);
  }
  var nextScroll = function () { return Math.min(RO.maxScroll(), S.scroll + Math.max(60, S.stageH - 84)); };
  function pan() { if (S.step !== "view") return; S.pos++; S.scroll = nextScroll(); S.phase = "look"; S.p = 0; render(); if (S.cond === "auto" && !S.fixed) T.tm = setTimeout(found, reduce ? 500 : 1400); }
  function end() { if (S.step !== "view") return; S.phase = "end"; render(); }
  RO.clear = clear;

  /* ---------- toast and undo (RS-69: 9 seconds on screen, 5 minutes in the Pantry's history) ---------- */
  function toast(html, ms) { S.toast = html; render(true); clearTimeout(toast.t); if (ms) toast.t = setTimeout(function () { S.toast = null; render(true); }, ms); }
  RO.toastHtml = function () { return S.toast ? '<div class="toast" role="status">' + S.toast + "</div>" : ""; };

  /* ---------- actions ---------- */
  var step = function (u) { return u === "g" || u === "mL" ? 50 : u === "kg" || u === "L" ? .5 : 1; };
  function answered(id, name) { buzz(10); S.last = id; if (S.pick === id) { S.pick = null; S.find = ""; } render(); }
  var recommended = function (l) { var k = out(l).k; return k === "top" || k === "check"; };
  RO.act = function (a, id, v) {
    var l = id && L(id), r, t;
    switch (a) {
      case "add": S.sheet = "add"; render(); break;
      case "closesheet": S.sheet = ""; render(); break;
      case "scan": reset(false); S.sheet = ""; S.step = S.perm === "refused" ? "refused" : "view"; S.cond = "auto"; render(); if (S.step === "view") begin(); break;
      case "leave": clear(); S.step = "entry"; S.sheet = ""; S.sel = null; S.pick = null; if (!S.fixed) reset(true); render(); break;
      case "torch": S.torch = !S.torch; render(); break;
      case "resume": S.cond = "auto"; S.phase = ""; begin(); break;
      case "shutter": capture(); break;
      case "photos": clear(); S.step = "view"; S.cond = "auto"; S.sel = null; S.sheet = ""; if (!S.still) { S.still = true; S.pos = 1; S.scroll = 0; } else if (unseen().length) { S.pos++; S.scroll = nextScroll(); } S.fixed = true; markSeen(); S.phase = "still"; render(); break;
      case "box": S.sel = S.sel === id ? null : id; S.filter = RO.inFilter(l, S.filter) ? S.filter : "all"; render(); break;   /* a tap on a box finds its row */
      case "row": S.sel = S.sel === id ? null : id; if (S.pick && S.pick !== id) S.pick = null; render(); break;
      case "filter": S.filter = v; S.pick = null; render(); break;
      case "accept": if (out(l).k === "check") { S.res[id] = { k: "accept" }; answered(id); } else { buzz(10); render(); } break;
      case "new": S.res[id] = { k: "new" }; answered(id); break;
      case "ignore": S.res[id] = { k: "ignore" }; answered(id); break;
      case "restore": if (l.st === "left") S.res[id] = { k: "restore" }; else delete S.res[id]; answered(id); break;
      case "undo": delete S.res[id]; answered(id); break;
      case "pickopen": S.pick = id; S.find = ""; S.sel = null; render(); t = $("#pk-" + id); if (t) t.focus({ preventScroll: true }); break;
      case "pickclose": S.pick = null; S.find = ""; render(); break;
      case "pick": S.res[id] = { k: "pick", pick: v }; answered(id); break;
      case "qm": S.q[id] = Math.max(step(l.u), Math.round(((S.q[id] != null ? S.q[id] : l.q) - step(l.u)) * 1000) / 1000); render(); break;
      case "qp": S.q[id] = Math.round(((S.q[id] != null ? S.q[id] : l.q) + step(l.u)) * 1000) / 1000; render(); break;
      case "split": S.split[id] = !S.split[id]; render(); break;
      case "summary": S.sheet = "summary"; S.sel = null; render(); break;
      case "showopen": t = RO.tally(); S.sheet = ""; S.filter = t.check ? "check" : "unsure"; render(); break;
      case "done": commit(); break;
      case "undodone": S.undone = true; clearInterval(T.undo); S.toast = 'Undone. The Pantry is as it was. <button type="button" data-act="redo">Redo</button>'; render(); break;
      case "redo": S.undone = false; S.toast = null; startUndo(); render(); break;
    }
  };
  function commit() { clear(); var n = RO.tally().ready; S.step = "done"; S.sheet = ""; S.undone = false; S.sel = null; S.pick = null; startUndo(n); render(); }
  function startUndo(n) {
    n = n || RO.tally().ready; var t0 = Date.now(); clearInterval(T.undo);
    S.toast = "Added " + n + ' to the Pantry. <button type="button" data-act="undodone">Undo</button><span class="lv-cd" aria-hidden="true"><i></i></span>';
    if (!S.fixed) T.undo = setInterval(function () { var p = (Date.now() - t0) / 9000; if (p >= 1) { clearInterval(T.undo); S.toast = null; render(true); return; } var i = $(".lv-cd i"); if (i) i.style.width = (100 - p * 100) + "%"; }, 100);
  }
  function reset(all) { S.res = {}; S.q = {}; S.nm = {}; S.split = {}; S.seen = {}; S.sel = null; S.pick = null; S.find = ""; S.filter = "all"; S.still = false; S.pos = 1; S.scroll = 0; S.phase = ""; S.p = 0; S.toast = null; S.undone = false; if (all) S.fixed = false; }

  /* ---------- the preset states: a page can open at any moment (?pre=, ?phase=, ?pos=) ---------- */
  function preset() {
    var pre = RO.Q.get("pre") || "";
    if (S.step === "view" || S.step === "done") {
      S.scroll = RO.scrollFor(S.pos);
      var all = pre === "all" || pre === "resolved" || pre === "half" || S.step === "done";
      if (all) RO.ORDER.forEach(function (id) { S.seen[id] = true; }); else if (S.phase && S.phase !== "look" && !/wall|rest/.test(S.cond)) { S.vis = true; markSeen(); }
      if (pre === "part" && !all) { S.vis = false; ["l1", "l2", "l3", "l4", "l5", "l6"].forEach(function (i) { S.seen[i] = true; }); }
      if (S.cond === "partial") { S.scroll = RO.scrollFor(3); markSeen(); }
      if (RO.Q.get("scroll") === "max") { S.scrollMax = true; S.scroll = RO.maxScroll(); }
      if (pre === "half") ["l6", "l8", "l9", "l10"].forEach(function (i) { S.res[i] = { k: "accept" }; });
      if (pre === "resolved" || S.step === "done") { ["l6", "l7", "l8", "l9", "l10", "l11", "l13"].forEach(function (i) { S.res[i] = { k: "accept" }; }); S.res.l12 = { k: "new" }; S.nm.l12 = "Bananas"; S.res.l14 = { k: "ignore" }; }
      (RO.Q.get("res") || "").split(";").forEach(function (x) { var a = x.split(":"); if (a[0] && a[1]) S.res[a[0]] = a[1] === "pick" ? { k: "pick", pick: a[2] } : { k: a[1] }; });
      if (S.pick && !S.sel) S.sel = null;
    }
    if (S.step === "done") { startUndo(); if (RO.Q.get("state") === "undone") { S.undone = true; S.toast = 'Undone. The Pantry is as it was. <button type="button" data-act="redo">Redo</button>'; } }
  }

  /* ---------- the screens ---------- */
  function scanCol() {
    var p = RO.parts(), h = p.bar + p.status + p.prog + RO.stageHtml();
    if (!RO.DESK()) h += RO.head() + RO.list();
    return h + '<div class="rl-panel">' + p.actions + "</div>";
  }
  function lane() { var t = RO.tally(); return '<div class="rs-sh"><h2>Lines read</h2><span class="tag">' + (t.total + t.left) + "</span></div>" + RO.head() + RO.list(); }
  function screen() {
    var s = { step: S.step };
    if (S.step === "entry" || S.step === "done") { s.main = RO.pantry(); s.sheet = S.step === "entry" && S.sheet === "add" ? RO.addSheet() : ""; }
    else if (S.step === "refused") s.html = RO.refused();
    else { s.col = scanCol(); s.sheet = S.sheet === "summary" ? RO.summary("commit") : ""; s.lane = S.sheet === "summary" ? RO.summary("commit") : lane(); s.summary = S.sheet === "summary"; }
    s.toast = RO.toastHtml();
    return s;
  }

  /* ---------- render ---------- */
  var once = 0;
  function render(keep) {
    if (!root) return;
    var f = document.activeElement, fk = f && f.dataset && f.dataset.act ? { a: f.dataset.act, i: f.dataset.id, v: f.dataset.v } : null, tx = f && f.matches && f.matches("input") ? { id: f.id, s: f.selectionStart } : null;
    var sc = $$(".lv-keep", root).map(function (e) { return e.scrollTop; });
    var prev = $(".lv-paper", root), from = prev ? lastScroll : S.scroll;
    var s = screen();
    root.innerHTML = RO.vp.compose ? RO.vp.compose(s) : "";
    root.dataset.step = S.step; root.dataset.sheet = s.sheet ? "1" : "0";
    var paper = $(".lv-paper", root);
    if (paper) {
      if (!S.fixed && !reduce && from !== S.scroll) { paper.style.transition = "none"; paper.style.transform = "translateY(" + (-from) + "px)"; paper.offsetHeight; paper.style.transition = ""; paper.style.transform = "translateY(" + (-S.scroll) + "px)"; }
      lastScroll = S.scroll;
      var st = $(".lv-stage", root); if (st && st.clientHeight && Math.abs(st.clientHeight - S.stageH) > 1 && once < 3) { S.stageH = st.clientHeight; once++; if (S.vis) { S.seen = {}; markSeen(); } if (S.scrollMax) S.scroll = RO.maxScroll(); render(); return; }
    }
    if (S.phase === "take") flash();
    $$(".lv-keep", root).forEach(function (e, i) { if (sc[i]) e.scrollTop = sc[i]; });
    var cur = $(".ro-li.on", root); if (cur && cur.scrollIntoView && S.sel) { try { cur.scrollIntoView({ block: "nearest" }); } catch (e) {} }
    if (tx) { var e2 = document.getElementById(tx.id); if (e2) { e2.focus(); try { e2.setSelectionRange(tx.s, tx.s); } catch (e) {} } }
    else if (fk) { var q = '[data-act="' + fk.a + '"]' + (fk.i != null ? '[data-id="' + fk.i + '"]' : "") + (fk.v != null ? '[data-v="' + fk.v + '"]' : ""), e3 = $(q, root); if (e3 && !keep) e3.focus({ preventScroll: true }); }
    syncCtl();
    if (RO.vp.after) RO.vp.after();
  }
  RO.render = render;

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || b.disabled || !root.contains(b)) return;
    if (b.getAttribute("data-act") === "row" && e.target.closest("button,input,.ro-pick")) return;
    if (RO.swiped && Date.now() - RO.swiped < 400) return;
    RO.act(b.getAttribute("data-act"), b.getAttribute("data-id"), b.getAttribute("data-v"));
  });
  document.addEventListener("input", function (e) { var t = e.target; if (t.dataset && t.dataset.nm) S.nm[t.dataset.nm] = t.value; if (t.dataset && t.dataset.find !== undefined) { S.find = t.value; render(); } });
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if ((e.key === "Enter" || e.key === " ") && t.matches && t.matches('.lv-ln[data-act="box"],.ro-row')) { e.preventDefault(); RO.act(t.dataset.act, t.dataset.id); return; }
    if (e.key === "Escape" && S.pick) { S.pick = null; S.find = ""; render(); return; }
    if (RO.vp.key) RO.vp.key(e);
  });

  /* ---------- the prototype controls: added to the size and theme panel (backtick) ---------- */
  var ctl;
  function syncCtl() { if (!ctl) return; $$("[data-cond]", ctl).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.cond === S.cond)); }); $$("[data-perm]", ctl).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.perm === S.perm)); }); }
  function addControls() {
    var p = $(".dvp"); if (!p) return;
    ctl = document.createElement("div");
    ctl.innerHTML = '<h3>What the camera sees</h3><div class="dvc">' + [["auto", "Receipt in view"], ["blur", "Blurry"], ["wall", "Not a receipt"], ["dark", "Too dark"], ["glare", "Glare"], ["partial", "Cut off"], ["rest", "Resting"]].map(function (c) { return '<button type="button" data-cond="' + c[0] + '">' + c[1] + "</button>"; }).join("") + '</div><h3>Camera permission</h3><div class="dvc"><button type="button" data-perm="allowed">Allowed</button><button type="button" data-perm="refused">Refused</button></div><h3>Start</h3><div class="dvc"><button type="button" data-go="entry">Pantry</button><button type="button" data-go="scan">Scan again</button></div>';
    p.insertBefore(ctl, p.firstChild);
    ctl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.cond) { reset(false); S.step = "view"; S.fixed = false; S.sheet = ""; S.cond = b.dataset.cond; if (S.cond === "partial") { S.scroll = RO.scrollFor(3); } if (S.perm === "refused") S.perm = "allowed"; render(); begin(); if (S.cond === "partial") { S.scroll = RO.scrollFor(3); markSeen(); render(); } }
      else if (b.dataset.perm) { S.perm = b.dataset.perm; if (S.step === "view" || S.step === "refused") { reset(false); S.step = S.perm === "refused" ? "refused" : "view"; render(); begin(); } }
      else if (b.dataset.go === "entry") { clear(); reset(true); S.step = "entry"; S.sheet = "add"; render(); }
      else if (b.dataset.go === "scan") RO.act("scan");
      syncCtl();
    });
    syncCtl();
  }

  /* ---------- boot: load the viewport's own file, then draw ---------- */
  function load(src, cb) { var s = document.createElement("script"); s.src = src; s.onload = cb; document.head.appendChild(s); }
  var curVp = "";
  function boot() {
    var want = RO.DESK() ? "desktop" : "phone";
    if (curVp === want) return;
    var first = !curVp; curVp = want;
    load("ro." + want + ".js", function () {
      if (first) { preset(); if (S.step === "entry" && RO.Q.get("sheet") === null) S.sheet = "add"; }
      render(); if (first) { if (S.step === "view") begin(); addControls(); } else if (S.step === "view" && !S.fixed) begin();
    });
  }
  document.addEventListener("DOMContentLoaded", function () { root = document.getElementById("app"); boot(); matchMedia("(min-width:1024px)").addEventListener("change", boot); });
  if (document.readyState !== "loading") { root = document.getElementById("app"); boot(); matchMedia("(min-width:1024px)").addEventListener("change", boot); }
})();
