/* Mobile Home view: the remembered choice and the shared switch. Phone only. This file is the default path (about 7 KB raw, mostly comments): storage, the view attribute, the icon button and the one-time hint.
   The gesture controllers (drag handle, pinch, press and hold, the learner) are in gestures.js and are fetched only when a person is on a surface that uses one (see the page notes).
   Written as the build would have it: HomeView.mount(homeElement, options) returns a small controller. Sample names and the mock's own switches live in mock.js, never here.

   THE RULE (owner): a remembered-choice UI setting is client-side only, never server-side. So the whole of persistence is localStorage, per device, and every read and write is in try/catch:
   - key kitchie.homeView.<memberId>   "full" | "compact"      (per person on a shared device; per device because localStorage is)
   - key kitchie.homeView.hint.<memberId>  "1"                  (the hint has been shown once)
   - storage missing, blocked or throwing (private window, cleared site data, quota): the view is "full" (today's Home), the choice still works for this visit in memory, and the hint is NOT shown
     (it could never be remembered, so it would repeat on every visit). Nothing throws. */
(function () {
  var VIEWS = ["full", "compact"], DEFAULT = "full";
  var ICONS = {
    rows: '<svg class="ic g1" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4.5" width="16" height="4" rx="1.5"/><rect x="4" y="10" width="16" height="4" rx="1.5"/><rect x="4" y="15.5" width="16" height="4" rx="1.5"/></svg><svg class="ic g2" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="10" rx="2.5"/><path d="M8 11h8"/></svg>',
    lens: '<svg class="ic g1" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg><svg class="ic g2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>'
  };

  function realStorage() { try { var s = window.localStorage, t = "__hv"; s.setItem(t, "1"); s.removeItem(t); return s; } catch (e) { return null; } }

  function mount(home, o) {
    o = o || {};
    var base = o.base || "kitchie.homeView", who = o.member || "me", persist = o.persist !== false;
    var getStore = o.storage || realStorage;
    var kView = base + "." + who, kHint = base + ".hint." + who;
    var live = home.querySelector(".hv-live");
    if (!live) { live = document.createElement("p"); live.className = "hv-live"; live.setAttribute("role", "status"); home.appendChild(live); }
    var cur = null, hintEl = null, hintTimer = null;

    function read(k) { try { var s = getStore(); return s ? s.getItem(k) : null; } catch (e) { return null; } }
    function write(k, v) { try { var s = getStore(); if (!s) return false; s.setItem(k, v); return true; } catch (e) { return false; } }
    function ok() { return !!getStore(); }
    function valid(v) { return VIEWS.indexOf(v) > -1 ? v : null; }
    function saved() { return persist ? valid(read(kView)) : null; }

    function paint(v, announce) {
      home.setAttribute("data-view", v);
      var on = v === "compact";
      home.querySelectorAll("[data-hv-switch],[data-hv-state]").forEach(function (b) { b.setAttribute("aria-pressed", String(on)); });
      if (announce) live.textContent = on ? "Home shows just tonight's answer." : "Home shows everything.";
    }
    function set(v, how) {
      if (!valid(v)) return cur;
      var changed = v !== cur; cur = v;
      if (persist) write(kView, v);
      paint(v, true); hideHint();
      if (changed && (how || "") !== "init") { home.classList.remove("swapped"); void home.offsetWidth; home.classList.add("swapped"); }
      if (o.onChange) o.onChange(v, how || "set", changed);
      return cur;
    }
    function toggle(how) { return set(cur === "compact" ? "full" : "compact", how || "toggle"); }

    /* The one quiet hint. Shown once per person on this device, never while storage cannot remember that it was shown. */
    function hideHint() { if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; } if (hintEl) { hintEl.hidden = true; } }
    function place(anchor, align, above) {
      var hr = home.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
      hintEl.className = "hv-hint" + (align === "center" ? " c" : "") + (above ? " below" : "");
      hintEl.style.top = hintEl.style.bottom = hintEl.style.left = hintEl.style.right = "auto";
      if (above) hintEl.style.top = Math.max(4, ar.top - hr.top - hintEl.offsetHeight - 8) + "px"; else hintEl.style.top = (ar.bottom - hr.top + 8) + "px";
      if (align === "center") hintEl.style.left = Math.max(8, Math.min(hr.width - hintEl.offsetWidth - 8, ar.left - hr.left + ar.width / 2 - hintEl.offsetWidth / 2)) + "px";
      else hintEl.style.right = Math.max(8, hr.right - ar.right + ar.width / 2 - 23) + "px";
    }
    function hint(anchor, text, opt) {
      opt = opt || {};
      var force = o.hint === "force";
      if (o.hint === "none" || !anchor) return false;
      if (!force && (!persist || !ok() || (!opt.always && read(kHint) === "1"))) return false;
      if (!force && !opt.always) write(kHint, "1");                                  /* once: marked as shown the moment it shows, not when dismissed */
      if (!hintEl) { hintEl = document.createElement("div"); hintEl.setAttribute("role", "note"); home.appendChild(hintEl); }
      hintEl.textContent = text; hintEl.hidden = false; hintEl.className = "hv-hint";
      place(anchor, opt.align, opt.above);
      if (opt.pulse) { anchor.classList.add("pulse"); }
      if (opt.nudge) { anchor.classList.add("nudge"); }
      var done = function (ev) {
        if (force && ev && ev.target && !home.contains(ev.target)) return;   /* a demo frame keeps its hint until it is touched itself */
        hideHint(); if (opt.pulse) anchor.classList.remove("pulse"); if (opt.nudge) anchor.classList.remove("nudge"); document.removeEventListener("pointerdown", done, true); };
      document.addEventListener("pointerdown", done, true);
      hintTimer = setTimeout(done, o.hintMs || 5000);
      return true;
    }

    /* Start: forced (a mock frame), else the remembered view, else the default. */
    var start = valid(o.start) || saved() || DEFAULT;
    cur = start; paint(start, false);
    home.querySelectorAll("[data-hv-switch]").forEach(function (b) { b.addEventListener("click", function () { toggle("button"); }); });
    /* another tab on this device changed it */
    var onStorage = function (e) { if (persist && e.key === kView && valid(e.newValue) && e.newValue !== cur) { cur = e.newValue; paint(cur, true); } };
    window.addEventListener("storage", onStorage);
    return { view: function () { return cur; }, set: set, toggle: toggle, saved: saved, ok: ok, hint: hint, hideHint: hideHint, keys: { view: kView, hint: kHint, learn: base + ".learn." + who },
      read: read, write: write, home: home, destroy: function () { window.removeEventListener("storage", onStorage); hideHint(); } };
  }

  window.HomeView = { mount: mount, ICONS: ICONS, VIEWS: VIEWS, DEFAULT: DEFAULT };
})();
