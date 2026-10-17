/* Household activity badge (Kitchie #110, Level 1 in the app; this mock draws what a tap shows, the settings row, and Level 2 as an idea).
   PART A (activity()) is what the build derives on the server and sends with the list refresh (/changes): total and one row per person burst. Mock only: PART B (page wiring).
   Demo hooks: ?scene=none|one|few|many  ?option=a|b (tap goes to History, or opens the peek first)  ?open=peek|settings (desktop) ?screen=settings (phone)  ?push=off|on|blocked|ios  ?pref=0 (Show household activity off)  ?theme=kitchie|kitchie-day */
(function () {
  "use strict";
  var Q = new URLSearchParams(location.search);
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var I = function (d) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var ICON = {
    bell: I('<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/>'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    link: I('<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>')
  };
  var HISTORY = "../../history/option-d/index.html"; // the catch-up (H4, H8); in the app: /history
  var GAP = 30, CAP = 4; // minutes: one burst while the gap between changes is at most this; rows shown in the peek before "and n more"

  /* ---- PART A: what the server derives (build: activityFor + the /changes reply) ---- */
  function clock(m) { var t = ((m % 1440) + 1440) % 1440, h = Math.floor(t / 60), mm = t % 60; return { h12: (h % 12) || 12, mm: (mm < 10 ? "0" : "") + mm, ap: h < 12 ? "am" : "pm" }; }
  function fmt(m) { var c = clock(m); return c.h12 + ":" + c.mm + " " + c.ap; }
  function when(from, to) {
    var day = to >= 0 ? "Today" : "Yesterday";
    if (from === to) return day + ", " + fmt(to);
    var a = clock(from), b = clock(to);
    return day + ", " + a.h12 + ":" + a.mm + (a.ap === b.ap ? "" : " " + a.ap) + " to " + fmt(to);
  }
  function activity(events, me, now) {
    var counted = events.filter(function (e) { return e.who !== me && (e.kind === "added" || e.kind === "used") && e.at > now - 1440; })
      .sort(function (a, b) { return a.at - b.at; });
    var bursts = [];
    counted.forEach(function (e) {
      var b = bursts.filter(function (x) { return x.who === e.who && x.kind === e.kind && e.at - x.to <= GAP; })[0];
      if (b) { b.n++; b.to = e.at; } else bursts.push({ who: e.who, kind: e.kind, n: 1, from: e.at, to: e.at });
    });
    bursts.sort(function (a, b) { return b.to - a.to; });
    var total = counted.length;
    return { total: total, rows: bursts };
  }
  function name(w) { return window.HA_PEOPLE[w] || "Someone"; }
  function items(n) { return n + " item" + (n === 1 ? "" : "s"); }
  function sentence(r) { return name(r.who) + " " + (r.kind === "added" ? "added " : "used up ") + items(r.n); }
  function label(a) { return a.total > 0 ? a.total + " new: " + a.rows.map(sentence).join("; ") : "No new changes"; }

  /* ---- markup shared by phone and desktop ---- */
  function peekHtml(a, lane) {
    var shown = a.rows.slice(0, CAP), more = a.rows.length - shown.length;
    var rows = shown.map(function (r) {
      var av = r.who ? '<span class="ap-av" aria-hidden="true">' + esc(name(r.who).charAt(0)) + "</span>" : '<span class="ap-av ap-link" aria-hidden="true">' + ICON.link + "</span>";
      return '<li class="ap-row" data-kind="' + r.kind + '">' + av + '<div class="ap-tx"><b>' + esc(name(r.who)) + "</b> " + (r.kind === "added" ? "added " : "used up ") + items(r.n) +
        "<small>" + when(r.from, r.to) + (r.who ? "" : " · through the shared AI link") + "</small></div></li>";
    }).join("");
    return '<section class="act-peek' + (lane ? " in-lane" : "") + '" id="actpeek" role="dialog" aria-labelledby="ap-title">' +
      '<header class="ap-head"><span class="ap-ic" aria-hidden="true">' + ICON.bell + '</span><div class="ap-hd"><h2 id="ap-title" tabindex="-1">Since you last looked</h2><p class="ap-sub">What others added or used up in the last 24 hours. Your own changes are not counted.</p></div>' +
      '<button type="button" class="icon ap-x" id="ap-close" aria-label="Close" title="Close' + (lane ? " (Ctrl Enter)" : "") + '">' + ICON.close + "</button></header>" +
      '<ul class="ap-list">' + rows + "</ul>" +
      (more > 0 ? '<p class="ap-more">and ' + more + " more in History</p>" : "") +
      '<footer class="ap-foot"><a class="ap-go" id="ap-history" href="' + HISTORY + '">Open History</a><a class="ap-set" id="ap-settings" href="' + (lane ? "desktop.html" : "app.html") + "?screen=settings&open=settings" + '">Settings</a></footer></section>';
  }
  function pushState() { return Q.get("push") || "off"; }
  function settingsHtml(on) {
    var ps = pushState(), pushOk = on;
    var body = {
      off: ["Get a notification on this device when others add or use up things.", '<button type="button" class="ha-btn" id="push-on">Turn on</button>'],
      on: ["On for this device. One notification per burst, counts only.", '<button type="button" class="ha-btn alt" id="push-off">Turn off</button>'],
      blocked: ["Blocked in this browser. Turn notifications back on for Kitchie in the browser’s site settings, then come back.", ""],
      ios: ["On iPhone this works once Kitchie is added to the Home Screen (iOS 16.4 or later).", '<button type="button" class="ha-btn alt" id="push-how">How to add it</button>']
    }[ps] || ["", ""];
    var card = '<div class="pushcard" aria-label="What a notification looks like"><span class="pc-ic" aria-hidden="true">K</span><div><small>Kitchie · now</small><b>Our kitchen</b><span>Sam added 5 items</span></div></div>';
    return '<section class="card" id="settings-card" aria-label="Settings">' +
      '<label class="check"><input type="checkbox" checked disabled><span>Show emoji</span></label>' +
      '<label class="check"><input type="checkbox" checked disabled><span>Show the spot</span></label>' +
      '<label class="check"><input type="checkbox" id="s-activity"' + (on ? " checked" : "") + '><span>Show household activity<small>A bell appears when others add or use up things. Saved on this device only.</small></span></label>' +
      '<label class="check"><input type="checkbox" disabled><span>Compact rows</span></label></section>' +
      '<section class="card later" id="push-card" aria-labelledby="push-h" data-push="' + ps + '"' + (pushOk ? "" : ' data-off="1"') + ">" +
      '<div class="later-h"><h2 id="push-h">Notify this device</h2><span class="idea">Later, not approved</span></div>' +
      (pushOk ? "<p>" + body[0] + "</p>" + (ps === "on" ? card : "") + (body[1] ? '<div class="later-a">' + body[1] + "</div>" : "")
        : "<p>Off while Show household activity is off. Turn that on first.</p>") + "</section>";
  }

  /* ---- PART B: page wiring (mock only) ---- */
  var scene = Q.get("scene") || "few", option = Q.get("option") === "a" ? "a" : "b", pref = Q.get("pref") !== "0";
  var A = activity(window.HA_EVENTS.filter(function (e) { return (window.HA_SCENES[scene] || window.HA_SCENES.few).indexOf(e.group) > -1; }), window.HA_ME, window.HA_NOW);
  var desk = document.body.dataset.form === "desktop";
  var bell = $("activity"), peekOpen = false, seen = false;

  function paintBell() {
    var show = pref && A.total > 0 && !seen;
    var n = bell.querySelector(".n");
    if (n) n.textContent = A.total > 9 ? "9+" : String(A.total);
    var l = label(A);
    bell.setAttribute("aria-label", pref ? l : "No new changes"); bell.setAttribute("title", bell.getAttribute("aria-label"));
    bell.hidden = !(show || peekOpen);
    if (peekOpen && n) n.hidden = true; else if (n) n.hidden = false;
    document.documentElement.toggleAttribute("data-hide-activity", !pref);
  }
  function host() { return desk ? $("lane") : $("phone"); }
  function openPeek() {
    if (peekOpen) return;
    peekOpen = true; seen = true; // the cursor moves on open (activity_seen); the bell stays until the peek closes
    var h = host();
    if (desk) { h.innerHTML = peekHtml(A, true); h.classList.add("open"); }
    else { h.insertAdjacentHTML("beforeend", '<div class="act-scrim" id="actscrim"></div>' + peekHtml(A, false)); }
    bell.setAttribute("aria-expanded", "true"); bell.classList.add("on");
    paintBell();
    var t = $("ap-title"); if (t) t.focus({ preventScroll: true });
  }
  function closePeek() {
    if (!peekOpen) return;
    peekOpen = false;
    var p = $("actpeek"), s = $("actscrim");
    if (desk) { $("lane").innerHTML = '<div class="pempty"><b>Pick an item to see it here</b><p>Nothing is open.</p></div>'; $("lane").classList.remove("open"); }
    else { if (p) p.remove(); if (s) s.remove(); }
    bell.setAttribute("aria-expanded", "false"); bell.classList.remove("on");
    paintBell();
    var next = bell.hidden ? ($("profile") || document.body) : bell; if (next.focus) next.focus();
  }
  function showSettings() {
    var h = desk ? $("lane") : $("body"); if (!h) return;
    var s = pref;
    var box = '<div class="set-wrap">' + (desk ? '<h2 class="set-h">Settings</h2>' : "") + '<div id="set-inner">' + settingsHtml(s) + "</div></div>";
    h.innerHTML = box; if (desk) h.classList.add("open"); else { var t = $("toptitle"); if (t) t.textContent = "Settings"; }
    var inner = h.querySelector("#set-inner");
    inner.addEventListener("change", function (e) { if (e.target.id === "s-activity") { pref = e.target.checked; inner.innerHTML = settingsHtml(pref); document.documentElement.toggleAttribute("data-hide-activity", !pref); paintBell(); var c = $("s-activity"); if (c) c.focus(); } });
    inner.addEventListener("click", function (e) {
      var id = e.target.id, to = { "push-on": "on", "push-off": "off" }[id];
      if (to) { Q.set("push", to); inner.innerHTML = settingsHtml(pref); var f = $(to === "on" ? "push-off" : "push-on"); if (f) f.focus(); }
      if (id === "push-how") e.target.textContent = "Share, then Add to Home Screen";
    });
  }
  function init() {
    if (!bell) return;
    if (option === "b") {
      bell.setAttribute("role", "button"); bell.setAttribute("aria-haspopup", "dialog"); bell.setAttribute("aria-expanded", "false"); bell.setAttribute("aria-controls", "actpeek");
      bell.addEventListener("click", function (e) { e.preventDefault(); peekOpen ? closePeek() : openPeek(); });
    }
    document.addEventListener("click", function (e) {
      if (e.target.closest && (e.target.closest("#ap-close") || e.target.id === "actscrim")) closePeek();
      var set = e.target.closest && e.target.closest("#ap-settings"); if (set) { e.preventDefault(); closePeek(); showSettings(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && peekOpen && !desk) closePeek();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && peekOpen) { e.preventDefault(); closePeek(); }
    });
    paintBell();
    if (Q.get("screen") === "settings" || Q.get("open") === "settings") showSettings();
    else if (Q.get("open") === "peek" && option === "b" && A.total > 0 && pref) openPeek();
  }
  window.HA = { activity: activity, label: label, sentence: sentence };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
