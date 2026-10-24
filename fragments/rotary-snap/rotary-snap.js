/* Phone Settings quick controls, mockup behaviour (Kitchie #1110; owner 25 Oct 2026). Phone only.
   Same logic as the build's settings-front.js (theme rotary: exactly one theme, centred, swipe only; one-time wiggle) and the build's own text-size.js (copied beside this file).
   Loads: theme.css, theme.js, shared.css, text-size.css, rotary-snap.css, text-size.js, this file. Nothing else; no network at all. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var HINT_KEY = "kitchie.rotary.hint";
  var LOOKS = [["auto", "Kitchie", null], ["marmalade", "Marmalade", ["#FBF1E3", "#FFFFFF", "#C2410C", "#3A2412"]], ["blueberry", "Blueberry", ["#14142B", "#1D1D3D", "#F48FB1", "#EEEBFF"]], ["herb", "Herb Garden", ["#EEF4E6", "#FFFFFF", "#2F7D32", "#1B2E1B"]], ["cappuccino", "Cappuccino", ["#F3E9DD", "#FFFFFF", "#8B5A2B", "#33261B"]], ["tokyo-midnight", "Tokyo Midnight", ["#0B0F1E", "#141A30", "#5CE1E6", "#E8ECFF"]], ["paprika", "Paprika", ["#1F1410", "#2B1D17", "#FF8A4C", "#F7E9DD"]], ["sea-salt", "Sea Salt", ["#EAF2F4", "#FFFFFF", "#0F766E", "#12313A"]], ["lavender-fog", "Lavender Fog", ["#F1EEF7", "#FFFFFF", "#6D28D9", "#2A2340"]]];
  var KITCHIE = { night: ["#0F1E19", "#172A23", "#F2B84B", "#F3EEE3"], day: ["#F6F1E6", "#FFFFFF", "#8A5600", "#1D2A24"] };
  var isLight = function () { return matchMedia("(prefers-color-scheme: light)").matches; };
  var look = function (l) { var c = l[2] || (isLight() ? KITCHIE.day : KITCHIE.night); return "--pbg:" + c[0] + ";--pcd:" + c[1] + ";--pac:" + c[2] + ";--pfg:" + c[3]; };
  var PIN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z"/><path d="M12 14v7"/></svg>';
  var MODEI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 010 16z" fill="currentColor"/></svg>';

  var themeNow = "auto";
  function applyPage(id) {
    themeNow = id;
    var map = { auto: isLight() ? "kitchie-day" : "kitchie" };
    var b = document.createElement("button"); b.hidden = true; b.setAttribute("data-theme-pick", map[id] || id); document.body.appendChild(b); b.click(); b.remove();
  }

  function tileHtml(kind) {
    if (kind === "text") return '<div class="qc" data-q="text" role="group" aria-label="Text size"><div class="qc-ctl"><div class="qc-text" data-ts-mount><div data-tsz="expanded" data-tsz-label="Text size"></div></div></div><button type="button" class="pinb qc-pin" aria-pressed="true" aria-label="Unpin Text size from the menu">' + PIN + "</button></div>";
    return '<div class="qc" data-q="theme" role="group" aria-label="Theme"><div class="qc-ctl"><div class="qc-th"><div class="rot" role="radiogroup" aria-label="Theme, swipe sideways for more" data-rot>' + LOOKS.map(function (l) {
      return '<button type="button" class="rot-i" role="radio" aria-checked="false" tabindex="-1" data-theme="' + l[0] + '" aria-label="' + l[1] + '"><i class="tprev" style="' + look(l) + '" aria-hidden="true"><b></b><s></s><u></u></i><span class="tname" aria-hidden="true">' + l[1] + "</span></button>";
    }).join("") + '</div><button type="button" class="qc-mcyc" aria-label="Light or dark: System">' + MODEI + '</button><div class="qc-mode" role="radiogroup" aria-label="Light or dark"><button type="button" role="radio" aria-checked="true" aria-label="System">' + MODEI + '</button></div></div></div><button type="button" class="pinb qc-pin" aria-pressed="true" aria-label="Unpin Theme from the menu">' + PIN + "</button></div>";
  }

  /* ---------- the rotary ---------- */
  function Rotary(tile, o) {
    o = o || {};
    var rot = $("[data-rot]", tile), items = $$(".rot-i", tile), timer = 0, fingerDown = false, hintTimer = 0, lastScroll = 0, progUntil = 0, pending = null, anims = [];
    var self = { rot: rot, items: items, hintRuns: 0, applied: [] };
    function nearest() {
      var mid = rot.scrollLeft + rot.clientWidth / 2, best = null, bd = 1e9;
      items.forEach(function (it) { var d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = it; } });
      return best;
    }
    function centerOn(id, smooth) {
      var it = items.filter(function (x) { return x.getAttribute("data-theme") === id; })[0]; if (!it || !rot.clientWidth) return;
      var left = it.offsetLeft - (rot.clientWidth - it.offsetWidth) / 2; progUntil = Date.now() + 700;
      if (smooth && rot.scrollTo && !reduced()) rot.scrollTo({ left: left, behavior: "smooth" }); else rot.scrollLeft = left;
    }
    function mark(id) { items.forEach(function (it, i) { var on = it.getAttribute("data-theme") === id; it.setAttribute("aria-checked", String(on)); it.tabIndex = on ? 0 : -1; }); }
    function select(id, how) {
      hintDone(); pending = id; mark(id); self.applied.push(id + ":" + how);
      if (how === "key") centerOn(id, true);
      if (!o.fixed) applyPage(id);
    }
    function settle() {
      if (!rot.clientWidth) return;
      if (Date.now() < progUntil) { timer = setTimeout(settle, 120); return; }
      if (fingerDown && Date.now() - lastScroll < 2500) { timer = setTimeout(settle, 120); return; }
      fingerDown = false;
      var it = nearest(); if (!it) return;
      var want = it.offsetLeft - (rot.clientWidth - it.offsetWidth) / 2;
      if (Math.abs(rot.scrollLeft - want) > 1) { progUntil = Date.now() + 400; rot.scrollLeft = want; }
      var id = it.getAttribute("data-theme");
      if (id !== (pending || themeNow)) select(id, "swipe");
    }
    if (!o.fixed) {
      rot.addEventListener("scroll", function () { lastScroll = Date.now(); clearTimeout(timer); timer = setTimeout(settle, 110); }, { passive: true });
      ["pointerdown", "touchstart", "wheel"].forEach(function (ev) { rot.addEventListener(ev, function () { progUntil = 0; hintStop(); }, { passive: true }); });
      rot.addEventListener("touchstart", function () { fingerDown = true; }, { passive: true });
      ["touchend", "touchcancel"].forEach(function (ev) { rot.addEventListener(ev, function () { fingerDown = false; clearTimeout(timer); timer = setTimeout(settle, 110); }, { passive: true }); });
      /* swipe only: a tap on the theme you see does nothing; a click with no pointer (screen reader, Enter, Space) still chooses */
      rot.addEventListener("click", function (e) { var it = e.target.closest(".rot-i"); if (it && e.detail === 0) select(it.getAttribute("data-theme"), "key"); });
      rot.addEventListener("keydown", function (e) {
        var i = items.indexOf(document.activeElement), j = -1; if (i < 0) return;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") j = Math.min(items.length - 1, i + 1); else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = Math.max(0, i - 1); else if (e.key === "Home") j = 0; else if (e.key === "End") j = items.length - 1;
        if (j < 0) return; e.preventDefault(); hintDone();
        if (j !== i) { items[j].focus({ preventScroll: true }); select(items[j].getAttribute("data-theme"), "key"); }
      });
    }
    mark(themeNow); requestAnimationFrame(function () { centerOn(themeNow, false); });

    /* ---------- the one-time wiggle ---------- */
    function reduced() { return matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "reduce"; }
    function seen() { try { return localStorage.getItem(HINT_KEY) !== null; } catch (e) { return true; } }
    function markSeen() { try { localStorage.setItem(HINT_KEY, "1"); return localStorage.getItem(HINT_KEY) === "1"; } catch (e) { return false; } }
    /* The browser re-snaps to a moved snap area, which would scroll the strip back against the transform; so the snap is switched off for the 1.3 seconds and back on at rest. */
    function snapBack() { rot.style.scrollSnapType = ""; }
    function hintStop() { clearTimeout(hintTimer); var a = anims; anims = []; snapBack(); a.forEach(function (x) { try { x.cancel(); } catch (e) { /* over */ } }); }
    function hintDone() { hintStop(); if (!seen()) markSeen(); }
    function ready() {
      if (!rot.clientWidth || !rot.getClientRects().length || !rot.animate || anims.length || fingerDown || seen() || reduced()) return false;
      if (document.visibilityState === "hidden") return false;
      var a = document.activeElement; if (a && a !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false;
      var r = rot.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight;
    }
    function run(force) {
      if (force) { try { localStorage.removeItem(HINT_KEY); } catch (e) { /* none */ } }
      if (!ready() || !markSeen()) return false;
      var kf = [{ transform: "translateX(0)", easing: "ease-in-out" }, { transform: "translateX(-12px)", offset: .3, easing: "ease-in-out" }, { transform: "translateX(12px)", offset: .7, easing: "ease-in-out" }, { transform: "translateX(0)" }];
      rot.style.scrollSnapType = "none";
      anims = items.map(function (el) { return el.animate(kf, { duration: 1300 }); }); anims[0].onfinish = function () { anims = []; snapBack(); }; self.hintRuns++; return true;
    }
    self.replay = function () { hintStop(); run(true); };
    if (!o.fixed && !o.noHint) {
      var later = function () { clearTimeout(hintTimer); hintTimer = setTimeout(function () { run(false); }, 650); };
      if (window.IntersectionObserver) new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) later(); else hintStop(); }, { threshold: .6 }).observe(rot); else later();
      document.addEventListener("focusout", function () { if (!seen()) later(); });
      document.addEventListener("focusin", function (e) { if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) hintStop(); });
    }
    return self;
  }

  function mount(host, o) {
    host.innerHTML = '<div class="qk" data-quick data-n="2" data-layout="rows" data-text="1">' + tileHtml("text") + tileHtml("theme") + "</div>";
    if (window.KitchieTextSize) window.KitchieTextSize.mountAll(host);
    return Rotary($('.qc[data-q="theme"]', host), o);
  }

  var q = new URLSearchParams(location.search);
  if (q.get("bare")) document.body.classList.add("bare");
  var w = parseInt(q.get("w") || "390", 10); document.documentElement.style.setProperty("--fw", w + "px");
  var ts = parseInt(q.get("ts") || "0", 10);
  if (q.get("hint") === "fresh") { try { localStorage.removeItem(HINT_KEY); } catch (e) { /* none */ } }
  if (q.get("hint") === "seen") { try { localStorage.setItem(HINT_KEY, "1"); } catch (e) { /* none */ } }

  var live = mount($("#live"), {});
  window.RS = { live: live };
  if (ts && window.KitchieTextSize) window.KitchieTextSize.set(ts);

  /* the wiggle, frame by frame: the same strip frozen at four moments */
  $$("[data-film]").forEach(function (h) {
    var r = mount(h, { fixed: true }); var dx = parseFloat(h.getAttribute("data-film"));
    r.items.forEach(function (it) { it.style.transform = "translateX(" + dx + "px)"; });
  });

  /* the aids */
  var sel = $("#st-w"); if (sel) { sel.value = String(w); sel.addEventListener("change", function () { var u = new URL(location.href); u.searchParams.set("w", sel.value); u.searchParams.set("hint", "seen"); location.href = u.href; }); }
  var st = $("#st-ts"); if (st) { st.value = String(ts); st.addEventListener("change", function () { window.KitchieTextSize.set(+st.value); measure(); }); }
  var rp = $("#replay"); if (rp) rp.addEventListener("click", function () { live.replay(); });

  /* measured widths of a text step at the common phone widths (the page gutter is 20px a side; the tile border and padding are the build's) */
  function measure() {
    var tb = $("#widths tbody"); if (!tb) return; tb.innerHTML = "";
    [[430, "Large phone"], [390, "Phone"], [375, "Small phone"], [360, "Narrow phone"], [320, "Smallest"]].forEach(function (p) {
      var m = document.createElement("div"); m.className = "sp meter"; m.style.width = p[0] + "px"; m.style.padding = "0 20px"; m.style.boxSizing = "border-box";
      m.innerHTML = '<div data-front><div class="qk" data-n="1">' + tileHtml("text") + "</div></div>"; document.body.appendChild(m);
      if (window.KitchieTextSize) window.KitchieTextSize.mountAll(m);
      var segs = $$(".tsz-seg", m), bar = $(".tsz-bar", m).getBoundingClientRect();
      var pitch = segs[0].getBoundingClientRect().width, fill = pitch - 2;
      var tr = document.createElement("tr"); tr.innerHTML = "<td>" + p[0] + "</td><td>" + p[1] + '</td><td class="n">' + bar.width.toFixed(0) + 'px</td><td class="n" data-pitch>' + pitch.toFixed(1) + 'px</td><td class="n">' + fill.toFixed(1) + "px</td>";
      tb.appendChild(tr); m.remove();
    });
  }
  window.addEventListener("load", function () { measure(); });
  setTimeout(function () { document.body.setAttribute("data-ready", "1"); }, 60);
})();
