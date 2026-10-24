// The Text size control, one reusable component for the PHONE (Kitchie #1118, slice 2 of the phone Settings rework #1110; owner decisions 24 October 2026).
// Phone file: it is loaded by the phone Settings pages (and by whatever else places the control), never by the desktop Settings window.
//
//   KitchieTextSize.mount(el, { mode: "expanded" | "compact", label: "Text size" })   -> { set(n), get(), open(), close(), destroy() }
//   <div data-tsz="expanded" data-tsz-label="Text size" data-fk="..."></div>           -> mounted automatically (and by KitchieTextSize.mountAll(root))
//
// One canonical setting: seven steps, the middle is "Match my phone" (the phone's own size, step 0). Three smaller (-8, -16, -24%), three larger (+10, +20, +30%), all relative to the phone's size.
// Tap a step to jump, or drag along the bar; the whole app resizes live. A double tap on the bar or the label snaps back to Match my phone (Home, "0", Delete and Backspace do the keyboard's
// version). Per device: the choice is the cookie kitchie_ts (named by environment slug outside production, theme.ts `deviceCookieName`) and data-ts on <html>; nothing goes to the server.
// The bar is a slider (role=slider, arrows, Home/End), with a polite live region. Compact mode is an "Aa" chip that opens in place (for the pinned area, where room is short).
// The step table below mirrors theme.ts TEXT_SIZE_STEPS and TEXT_SIZE_RULES (test/text-size-scale.test.ts keeps them equal). No framework.
(function () {
  "use strict";
  if (window.KitchieTextSize) return;
  var html = document.documentElement;
  var PCT = { "-3": -24, "-2": -16, "-1": -8, "0": 0, "1": 10, "2": 20, "3": 30 };
  // The all-steps rule text (theme.ts TEXT_SIZE_CSS_ALL): a page ships only the rule its cookie asks for, so a page that lets the person change the size carries every rule (Settings does already).
  var RULES = "html[data-ts=s3]{font-size:76%;--hs:1.1579}html[data-ts=s2]{font-size:84%;--hs:1.0952}html[data-ts=s1]{font-size:92%;--hs:1.0435}html[data-ts=l1]{font-size:110%;--hs:0.9545}html[data-ts=l2]{font-size:120%;--hs:0.9167}html[data-ts=l3]{font-size:130%;--hs:0.8846}";
  var DOUBLE_MS = 320, DOUBLE_PX = 14, IDLE_MS = 6000;
  var instances = [], quietUntil = 0;
  document.addEventListener("click", function (e) { if (Date.now() < quietUntil) { e.stopPropagation(); e.preventDefault(); } }, true);

  function clamp(n) { n = Math.round(Number(n)); return isFinite(n) ? Math.max(-3, Math.min(3, n)) : 0; }
  function idOf(n) { return n === 0 ? "" : (n < 0 ? "s" : "l") + Math.abs(n); }
  function current() { var m = /^([sl])([1-3])$/.exec(html.getAttribute("data-ts") || ""); return m ? (m[1] === "s" ? -1 : 1) * Number(m[2]) : 0; }
  function word(n) { return n === 0 ? "Match my phone" : (n < 0 ? "Smaller" : "Larger") + ", " + (n > 0 ? "+" : "−") + Math.abs(PCT[n]) + "%"; }
  function spoken(n) { return n === 0 ? "Match my phone, your phone’s own size" : (n < 0 ? "Smaller" : "Larger") + " by " + Math.abs(PCT[n]) + " percent, step " + Math.abs(n) + " of 3"; }
  function cname() { return "kitchie_ts" + (window.KITCHIE_ENV ? "_" + window.KITCHIE_ENV : ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function ensureRules() {
    if (document.getElementById("kts-all")) return;
    var st = document.createElement("style"); st.id = "kts-all"; st.textContent = RULES; document.head.appendChild(st);
    var one = document.getElementById("kts"); if (one) one.parentNode.removeChild(one); // the single rule the page came with is inside the full set now
  }
  function writeCookie(n) {
    var name = cname(), id = idOf(n), base = window.KITCHIE_BASE || (document.querySelector("[data-base]") ? document.querySelector("[data-base]").getAttribute("data-base") : "") || "";
    try {
      if (base) document.cookie = name + "=; Max-Age=0; Path=" + base + "; SameSite=Lax; Secure"; // the older prefix-scoped cookie would shadow the origin-wide one
      document.cookie = id ? name + "=" + id + "; Max-Age=31536000; Path=/; SameSite=Lax; Secure" : name + "=; Max-Age=0; Path=/; SameSite=Lax; Secure";
    } catch (e) { /* cookies blocked: the choice holds for this page view */ }
  }
  function set(n) {
    n = clamp(n);
    ensureRules();
    var id = idOf(n);
    if (id) html.setAttribute("data-ts", id); else html.removeAttribute("data-ts");
    writeCookie(n);
    document.dispatchEvent(new CustomEvent("kitchie:textsize", { detail: { step: n } }));
    return n;
  }

  function bar() {
    var s = "";
    for (var i = -3; i <= 3; i++) s += '<i class="tsz-seg' + (i === 0 ? " mid" : "") + '" data-i="' + i + '"></i>';
    return s;
  }

  function mount(el, opts) {
    opts = opts || {};
    if (!el || el.__tsz) return el && el.__tsz;
    var mode = (opts.mode || el.getAttribute("data-tsz") || "expanded") === "compact" ? "compact" : "expanded";
    var label = opts.label !== undefined ? opts.label : el.getAttribute("data-tsz-label") || "";
    var fk = el.getAttribute("data-fk") || "";
    var n = current();
    var open = mode === "expanded";
    el.classList.add("tsz"); el.setAttribute("data-mode", mode);
    var chip = mode === "compact" ? '<button type="button" class="tsz-chip" aria-expanded="false" data-tsz-chip><span class="tsz-a" aria-hidden="true">A<small>a</small></span><span class="vh" data-tsz-chiplab></span></button>' : "";
    el.innerHTML = chip +
      '<div class="tsz-body"' + (open ? "" : " hidden") + ">" +
      '<div class="tsz-l" data-tsz-l>' + (label ? '<span class="tsz-name">' + esc(label) + "</span>" : "") + '<b class="tsz-val" aria-hidden="true"></b></div>' +
      '<div class="tsz-bar" role="slider" tabindex="0" aria-label="' + esc(label || "Text size") + '" aria-orientation="horizontal" aria-valuemin="-3" aria-valuemax="3"' + (fk ? ' data-fk="' + esc(fk) + '"' : "") + ">" + bar() + "</div>" +
      "</div>" +
      '<span class="vh" role="status" aria-live="polite" data-tsz-live></span>';
    var body = el.querySelector(".tsz-body"), track = el.querySelector(".tsz-bar"), val = el.querySelector(".tsz-val"), live = el.querySelector("[data-tsz-live]");
    var chipEl = el.querySelector("[data-tsz-chip]"), chipLab = el.querySelector("[data-tsz-chiplab]");
    var lab = el.querySelector("[data-tsz-l]");
    var segs = [].slice.call(track.querySelectorAll(".tsz-seg"));
    var liveTimer = 0, idleTimer = 0, lastTap = { t: 0, x: 0 }, drag = null;

    function paint(announce) {
      n = current();
      track.setAttribute("aria-valuenow", String(n));
      track.setAttribute("aria-valuetext", spoken(n));
      val.textContent = word(n);
      el.setAttribute("data-n", String(n));
      segs.forEach(function (s, k) { s.classList.toggle("on", k - 3 <= n); s.classList.toggle("cur", k - 3 === n); });
      if (chipEl) { chipLab.textContent = "Text size, " + word(n); chipEl.setAttribute("aria-label", "Text size: " + spoken(n) + ". " + (open ? "Close" : "Open") + " the control"); }
      if (announce) { clearTimeout(liveTimer); liveTimer = setTimeout(function () { live.textContent = "Text size: " + spoken(n); }, 120); }
    }
    function stepAt(x) {
      var r = track.getBoundingClientRect();
      return clamp(Math.floor(((x - r.left) / Math.max(1, r.width)) * 7) - 3);
    }
    function touchIdle() { if (mode !== "compact" || !open) return; clearTimeout(idleTimer); idleTimer = setTimeout(close, IDLE_MS); }
    // The page above the bar grows and shrinks with the size, which would carry the bar out from under the finger (and a second tap of a double tap would miss it): after each change the page
    // is scrolled by the amount the bar moved, so it stays where it was on the screen.
    function go(m, announce) {
      if (m !== current()) {
        var y0 = track.getBoundingClientRect().top;
        set(m);
        var dy = track.getBoundingClientRect().top - y0;
        if (Math.abs(dy) > 0.5 && !fixedAncestor(el)) window.scrollBy(0, dy);
      }
      paint(announce !== false); touchIdle();
    }
    function fixedAncestor(n) { for (; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === "fixed") return true; return false; }
    function reset() { go(0); }

    function onDown(e) {
      if (e.button !== undefined && e.button > 0) return;
      var now = Date.now();
      if (now - lastTap.t < DOUBLE_MS && Math.abs(e.clientX - lastTap.x) < DOUBLE_PX) { lastTap.t = 0; drag = null; reset(); e.preventDefault(); return; }
      drag = { x0: e.clientX, moved: false, id: e.pointerId };
      try { track.setPointerCapture(e.pointerId); } catch (x) { /* synthetic events */ }
      track.focus({ preventScroll: true });
      go(stepAt(e.clientX));
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (Math.abs(e.clientX - drag.x0) > 6) drag.moved = true;
      go(stepAt(e.clientX));
    }
    function onUp(e) {
      quietUntil = Date.now() + 350;
      if (!drag) return;
      if (!drag.moved) lastTap = { t: Date.now(), x: e.clientX }; // a still tap may be the first of a double tap
      drag = null;
    }
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", function () { drag = null; });
    // The page resizes under the finger, so the click a tap ends with would land on whatever moved there (a pin button, a link). Touch ends on the bar and label make no click, and a click that
    // follows a bar gesture within a moment is swallowed wherever it lands.
    [track, lab].forEach(function (n) { n.addEventListener("touchend", function (e) { if (e.cancelable) e.preventDefault(); }); });
    // Double tap on the label (and on the bar, for a mouse: dblclick) is the same snap back.
    lab.addEventListener("pointerdown", function (e) {
      var now = Date.now();
      if (now - lastTap.t < DOUBLE_MS) { lastTap.t = 0; reset(); e.preventDefault(); } else lastTap = { t: now, x: e.clientX };
    });
    lab.addEventListener("dblclick", function (e) { e.preventDefault(); reset(); });
    track.addEventListener("dblclick", function (e) { e.preventDefault(); reset(); });
    track.addEventListener("keydown", function (e) {
      var k = e.key, m = null;
      if (k === "ArrowLeft" || k === "ArrowDown") m = current() - 1;
      else if (k === "ArrowRight" || k === "ArrowUp") m = current() + 1;
      else if (k === "PageDown") m = current() - 2;
      else if (k === "PageUp") m = current() + 2;
      else if (k === "Home") m = -3;
      else if (k === "End") m = 3;
      else if (k === "0" || k === "Delete" || k === "Backspace") m = 0;
      else if (k === "Escape" && mode === "compact" && open) { e.preventDefault(); close(); chipEl.focus(); return; }
      if (m === null) return;
      e.preventDefault(); go(clamp(m));
    });
    function openIt() { if (mode !== "compact") return; open = true; body.hidden = false; el.setAttribute("data-open", "1"); chipEl.setAttribute("aria-expanded", "true"); paint(false); touchIdle(); }
    function close() { if (mode !== "compact") return; open = false; clearTimeout(idleTimer); body.hidden = true; el.removeAttribute("data-open"); chipEl.setAttribute("aria-expanded", "false"); paint(false); }
    if (chipEl) {
      chipEl.addEventListener("click", function () { if (open) close(); else { openIt(); track.focus({ preventScroll: true }); } });
      document.addEventListener("pointerdown", function (e) { if (open && el.isConnected && !el.contains(e.target)) close(); });
    }
    var inst = { el: el, mode: mode, get: current, set: function (m) { go(clamp(m)); }, reset: reset, open: openIt, close: close, repaint: function () { paint(false); }, destroy: function () { el.innerHTML = ""; delete el.__tsz; } };
    el.__tsz = inst; instances.push(inst);
    paint(false);
    return inst;
  }

  function mountAll(root) {
    [].forEach.call((root || document).querySelectorAll("[data-tsz]"), function (el) { if (!el.__tsz) mount(el); });
  }
  // Every mounted control follows a change made by another (the pinned card and the Looks page can both show one); a control that has left the page is dropped.
  document.addEventListener("kitchie:textsize", function () {
    instances = instances.filter(function (i) { return i.el.isConnected; });
    instances.forEach(function (i) { i.repaint(); });
  });
  function auto() {
    mountAll(document);
    try { new MutationObserver(function () { mountAll(document); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* no observer: callers use mountAll */ }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();

  window.KitchieTextSize = { mount: mount, mountAll: mountAll, get: current, set: set, reset: function () { return set(0); }, word: word, spoken: spoken, PCT: PCT, RULES: RULES };
})();
