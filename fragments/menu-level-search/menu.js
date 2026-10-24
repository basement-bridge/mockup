/* Menu level search, mockup behaviour (kitchie#1090, #1110). Phone only. Loads after ../settings-shakeup/shake.js and changes the front of that chosen Settings phone into the Menu:
   search at the top, the quick controls, the settings rows once, then History, Install and Download my data as their own items. Nothing else of the chosen design is touched.
   Default path loads: theme.css, theme.js, shared.css, ../settings-shakeup/shake.css, shake.js, this file and menu.css. The search engine and index stay deferred (shake.js loads them on first focus). */
(function () {
  "use strict";
  var S = window.SHAKE; if (!S) return;
  var P = S.Phone.prototype, SH = S.SH;
  /* The engine is the chosen Settings design's own file, fetched on engagement by a path relative to the page; point that one fetch at the sibling folder instead of keeping a second copy. */
  var append = document.head.appendChild;
  document.head.appendChild = function (n) { if (n && n.tagName === "SCRIPT" && n.getAttribute("src") === "shake-search.js") n.src = "../settings-shakeup/shake-search.js"; return append.call(this, n); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var PATHS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    install: '<rect x="7" y="2.500" width="10" height="19" rx="2.500"/><path d="M12 8v6M9.500 12l2.500 2.500 2.500-2.500"/>',
    down: '<path d="M12 4v11M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    out: '<path d="M10 4H5v16h5"/><path d="M15 8l4 4-4 4M19 12H9"/>',
    chev: '<path d="M9 6l6 6-6 6"/>'
  };
  var ico = function (n, s) { return '<svg width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PATHS[n] + "</svg>"; };
  var chev = function () { return '<span class="chev">' + ico("chev", 18) + "</span>"; };
  function row(a, label, v, icon, extra) {
    return '<li class="prow" data-row="' + esc(extra && extra.row || label) + '"><button type="button" class="rb' + (extra && extra.cls ? " " + extra.cls : "") + '" data-a="' + a + '">' + (icon ? '<i class="lead" aria-hidden="true">' + ico(icon) + "</i>" : "") + '<span class="nm">' + esc(label) + "</span>" + (v ? '<span class="val">' + esc(v) + "</span>" : "") + (extra && extra.nochev ? "" : chev()) + "</button></li>";
  }
  function who() {
    var n = SH.me || "Alex";
    return '<li class="prow" data-row="You"><button type="button" class="rb" data-a="pg:you"><i class="who-av" aria-hidden="true">' + esc(n.trim().charAt(0).toUpperCase() || "A") + '</i><span class="nm">' + esc(n) + "</span>" + chev() + "</button></li>";
  }
  /* the Menu: the front of the chosen design, with the settings rows once and the app's own items under them */
  P.frontHtml = function () {
    return this.pinsHtml() +
      '<ul class="list main" data-curated>' + who() + row("pg:household", "Household", SH.hh, "home") + row("pg:preferences", "Preferences", "Quiet 22:00 to 07:00", "sliders") + row("pg:assistants", "Assistants", "Claude", "spark") + "</ul>" +
      '<ul class="list tail">' + row("soon:History", "History", "", "clock") + row("soon:Install", "Install", "", "install", { nochev: true }) + row("soon:Download my data", "Download my data", "", "down", { nochev: true }) + "</ul>" +
      '<ul class="list tail">' + row("soon:Sign out", "Sign out", "", "", { cls: "out", nochev: true }) + "</ul>";
  };
  var pageHtml = P.pageHtml, hhHtml = P.householdHtml;
  /* Kitchen setup lives inside Household (as built since 0.176): one row at the foot of the Household page */
  P.householdHtml = function () { return hhHtml.call(this) + '<ul class="list"><li class="prow" data-row="Kitchen setup"><button type="button" class="rb" data-a="pg:kitchen"><span class="nm">Kitchen setup</span>' + chev() + "</button></li></ul>"; };
  P.pageHtml = function () {
    if (this.page === "kitchen") return this.groupsHtml([["Kitchen", [["cats", "Categories"], ["locs", "Locations and spots"]]]]);
    if (this.page === "assistants") return this.groupsHtml([["Assistants", [["claude", "Claude"], ["chatgpt", "ChatGPT"], ["gemini", "Gemini"]]]]);
    return pageHtml.call(this);
  };
  var chrome = P.chrome;
  P.chrome = function () {
    chrome.call(this);
    var t = this.el.querySelector(".ttl"), b = this.el.querySelector(".bk span"), pg = this.page;
    t.textContent = pg === "front" ? "Menu" : pg === "assistants" ? "Assistants" : t.textContent;
    if (b && pg !== "front" && pg !== "you" && !this.stack.length) b.textContent = "Menu";
    var bk = this.el.querySelector(".bk");
    if (bk && pg !== "front" && pg !== "you" && !this.stack.length) bk.setAttribute("aria-label", "Back to Menu");
  };
  /* the old menu, drawn as it is in uat today (0.177.0), for the before side */
  S.beforeHtml = function () {
    function r(label, extra, chip) { return '<li class="prow"><div class="rline"><span class="nm">' + esc(label) + "</span>" + (chip ? '<span class="val">' + esc(chip) + "</span>" : "") + (extra ? "" : chev()) + "</div></li>"; }
    function g(t, rows) { return '<p class="gh">' + esc(t) + '</p><ul class="list">' + rows + "</ul>"; }
    return '<div class="who" style="display:flex;gap:12px;align-items:center;padding:4px 0 8px"><i class="big-av" aria-hidden="true">A</i><div><b>Alex</b><div class="sub" style="color:var(--muted);font-size:.85em">Head Chef</div></div></div>' +
      g("Get started", r("Link your AI") + r("Invite someone")) +
      g("App", r("Settings") + r("History") + r("Looks") + '<li class="prow"><div class="rline"><span class="nm" style="font-weight:700">Kitchen setup</span></div></li>' + r("Categories") + r("Locations and spots") + r("Install")) +
      g("Preferences", r("Preferences")) +
      g("People", r("Me", false, "Alex") + r("Household", false, "3")) +
      g("My data", r("Download inventory CSV")) +
      '<ul class="list"><li class="prow"><div class="rline" style="color:var(--danger)"><span class="nm">Sign out</span></div></li></ul>';
  };
})();
