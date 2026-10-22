/* Mobile Home view: gesture controllers, fetched only when a surface needs one (drag handle B, pinch and press-and-hold C, the learner E).
   The icon-button options (A, D) never load this file. Each controller gets the HomeView controller from home-view.js and calls ctl.set / ctl.toggle, so storage stays in one place.
   Every gesture has a single-finger, no-timing alternative for people who cannot do it (WCAG 2.5.1, 2.5.4): a keyboard or switch press on the same element. */
(function () {
  var reduce = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var G = {};

  /* B: a handle you drag. Up folds Home to the answer, down opens it, a tap does either. Starts only on the handle, so it never fights the page's own vertical scroll. */
  G.handle = function (ctl, el) {
    var y0 = null, id = null, THRESH = 32;
    el.addEventListener("pointerdown", function (e) { y0 = e.clientY; id = e.pointerId; try { el.setPointerCapture(id); } catch (x) {} el.classList.add("drag"); });
    el.addEventListener("pointermove", function (e) {
      if (y0 == null || e.pointerId !== id) return;
      if (!reduce()) el.style.transform = "translateY(" + Math.max(-20, Math.min(20, e.clientY - y0)) + "px)";   /* the handle follows the finger; with reduced motion it stays put */
    });
    var end = function (e) {
      if (y0 == null || e.pointerId !== id) return;
      var dy = e.clientY - y0; y0 = null; el.classList.remove("drag"); el.style.transform = "";
      if (e.type === "pointercancel") return;
      if (Math.abs(dy) < 6) ctl.toggle("handle-tap");
      else if (dy <= -THRESH) ctl.set("compact", "handle-drag");
      else if (dy >= THRESH) ctl.set("full", "handle-drag");
    };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("click", function (e) { if (e.detail === 0) ctl.toggle("key"); });   /* keyboard, switch, screen reader */
  };

  /* C: pinch in on Home to fold it, pinch out to open it. The area gets touch-action:pan-y, which keeps scrolling and turns off the browser's own page zoom there. */
  G.pinch = function (ctl, area) {
    var P = {}, d0 = null, fired = false;
    area.style.touchAction = "pan-y";
    var dist = function () { var k = Object.keys(P); if (k.length < 2) return null; var a = P[k[0]], b = P[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); };
    area.addEventListener("pointerdown", function (e) { P[e.pointerId] = { x: e.clientX, y: e.clientY }; if (Object.keys(P).length === 2) { d0 = dist(); fired = false; } });
    area.addEventListener("pointermove", function (e) {
      if (!P[e.pointerId]) return; P[e.pointerId] = { x: e.clientX, y: e.clientY };
      var d = dist(); if (d == null || !d0 || fired) return;
      if (d / d0 < 0.75 && ctl.view() === "full") { fired = true; ctl.set("compact", "pinch"); }
      else if (d / d0 > 1.33 && ctl.view() === "compact") { fired = true; ctl.set("full", "pinch"); }
    });
    var up = function (e) { delete P[e.pointerId]; if (Object.keys(P).length < 2) { d0 = null; } };
    area.addEventListener("pointerup", up); area.addEventListener("pointercancel", up);
  };

  /* C: the single-finger alternative. Press and hold the heading for 450 ms (a thin ring fills while you hold). Keyboard: Enter or Space on the heading. */
  G.hold = function (ctl, btn) {
    var wrap = btn.closest(".hv-hold") || btn, timer = null, x0 = 0, y0 = 0, fired = false;
    var cancel = function () { if (timer) { clearTimeout(timer); timer = null; } wrap.classList.remove("holding"); };
    btn.addEventListener("pointerdown", function (e) {
      x0 = e.clientX; y0 = e.clientY; fired = false; wrap.classList.add("holding");
      timer = setTimeout(function () { timer = null; fired = true; wrap.classList.remove("holding"); try { navigator.vibrate && navigator.vibrate(12); } catch (x) {} ctl.toggle("hold"); }, 450);
    });
    btn.addEventListener("pointermove", function (e) { if (timer && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) cancel(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { btn.addEventListener(t, function () { if (!fired) cancel(); }); });
    btn.addEventListener("click", function (e) { if (e.detail === 0) ctl.toggle("key"); });
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });   /* a long press must not open the browser's menu */
  };

  /* E: Home remembers how you used it. Three visits in a row spent on the answer open the next one compact; three spent browsing open it full. A direct choice (tap the heading) wins and resets the count. */
  G.learn = function (ctl, o) {
    var home = ctl.home, scroller = o.scroller, key = ctl.keys.learn;
    var RUN = o.run || 3, answered = false, browsed = false;
    var load = function () { try { return JSON.parse(ctl.read(key)) || { kind: null, n: 0 }; } catch (e) { return { kind: null, n: 0 }; } };
    var save = function (s) { ctl.write(key, JSON.stringify(s)); };
    home.addEventListener("click", function (e) {
      if (e.target.closest(".idl .btn, .idl .top2")) answered = true;
      if (e.target.closest(".tilec, .idr, .va")) browsed = true;
    });
    if (scroller) scroller.addEventListener("scroll", function () { if (scroller.scrollTop > 140) browsed = true; }, { passive: true });
    var s0 = load();
    if (s0.note) { var h = s0.note === "compact" ? home.querySelector(".glance") : home.querySelector(".hi .hbtn");   /* under the answer in compact, so the note never covers it */
      ctl.hint(h, s0.note === "compact" ? "Home now opens on just the answer. Tap the heading for everything." : "Home now opens on everything. Tap the heading for just the answer.", { always: true, align: "center" }); s0.note = null; save(s0); }
    return {
      state: load,
      mark: function (k) { if (k === "answer") answered = true; else browsed = true; },
      manual: function () { save({ kind: null, n: 0 }); },       /* a direct choice resets the run */
      endVisit: function () {
        var kind = browsed ? "browse" : answered ? "answer" : null, s = load();
        if (kind) { s = s.kind === kind ? { kind: kind, n: s.n + 1 } : { kind: kind, n: 1 }; }
        if (s.n >= RUN) {
          var target = s.kind === "answer" ? "compact" : "full";
          if (ctl.saved() !== target && !(target === "full" && !ctl.saved())) { ctl.write(ctl.keys.view, target); s.note = target; }
          s = { kind: s.kind, n: 0, note: s.note };
        }
        save(s); answered = browsed = false; return s;
      }
    };
  };

  window.HomeViewGestures = G;
})();
