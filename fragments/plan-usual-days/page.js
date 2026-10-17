/* Stand-in for the Plan page around the flyout (mockup only). It draws just enough of the week to show what the flyout changes: seven nights for the person being looked at, the Mine / Household / person strip and
   the moon button that opens Off days. The night tiles use the Plan's own wording ("Not cooking", "Every week, usual day off", "Open night", "Usual day off, cooking this week"). The real Plan screens are
   fragments/plan-desktop and fragments/plan-ui-review; nothing here replaces them. Reads window.UD (usual.js). */
(function () {
  "use strict";
  var UD = window.UD, S = UD.S, WD = UD.WD, FULL = UD.FULL, esc = UD.esc;
  var Q = new URLSearchParams(location.search), dev = document.body.getAttribute("data-dev");
  var DATES = ["26 Oct", "27 Oct", "28 Oct", "29 Oct", "30 Oct", "31 Oct", "1 Nov"];
  var P = { view: "mine", lift: {} };
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/></svg>';
  var OPEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7-2.6"/></svg>';
  /* the trigger is the same moon the Plan already uses for "Not cooking" (and the repo's ic.moon in plan-ui-review/data.js) */
  var TRIG = MOON;
  var RAIL = [["Home", "M3 11l9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"], ["Pantry", "M6 3h12v18H6zM6 9h12"], ["Plan", "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4"], ["Recipes", "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"], ["Shopping", "M4 5h2l2 10h9l2-7H7"]];

  function who() { return P.view === "mine" ? S.me : P.view; }
  function night(d, i) {
    var v = P.view, off, src, own = null;
    if (v === "household") { off = UD.hhOff(d); src = "household"; }  /* the household\u2019s own days are neither inherited nor a person\u2019s own */
    else { var x = UD.eff(who(), d); off = x.off; src = x.src; }
    var ro = v !== "mine", lifted = !ro && off && P.lift[d];
    var tile;
    if (off && !lifted) {
      var sub = src === "inherited" ? "Every week, usual day off (inherited)" : "Every week, usual day off";
      var inner = MOON + '<span class="bt"><b>Not cooking</b><small>' + sub + (ro ? "" : " · tap to cook this week") + "</small></span>";
      tile = ro ? '<div class="pg-blk' + (src === "inherited" ? " inh" : "") + '">' + inner + "</div>" : '<button type="button" class="pg-blk' + (src === "inherited" ? " inh" : "") + '" data-lift="' + d + '" aria-label="Not cooking ' + FULL[i] + ', ' + (src === "inherited" ? "usual day off, inherited" : "usual day off") + '. Tap to cook this week">' + inner + "</button>";
    } else {
      tile = (lifted ? '<p class="pg-ovt">Usual day off, cooking this week</p>' : "") + (lifted ? '<button type="button" class="pg-open" data-lift="' + d + '">' + OPEN + "<span>Open night</span></button>" : '<div class="pg-open">' + OPEN + "<span>Open night</span></div>");
    }
    return '<div class="pg-night" data-d="' + d + '" data-state="' + (off && !lifted ? "off" : "open") + '" data-src="' + src + '"><div class="pg-dl"><b>' + d + "</b><small>" + DATES[i] + "</small></div><div class=\"pg-tl\">" + tile + "</div></div>";
  }
  function strip() {
    var items = [["mine", "Mine"]]; if (UD.showHH()) items.push(["household", "Household"]);
    S.people.forEach(function (p) { if (p.id !== S.me) items.push([p.id, p.name]); });
    if (items.every(function (x) { return x[0] !== P.view; })) P.view = "mine";
    return '<div class="pg-strip" role="group" aria-label="Whose plan">' + items.map(function (x) { return '<button type="button" data-view="' + x[0] + '" aria-pressed="' + (P.view === x[0]) + '">' + esc(x[1]) + "</button>"; }).join("") + "</div>";
  }
  function head() {
    var vl = P.view === "mine" ? "Mine" : P.view === "household" ? "Household" : UD.person(P.view).name + "’s plan, view only";
    return '<div class="pg-hd"><div><h1>Week of 26 Oct</h1><p>Next week · ' + esc(vl) + '</p></div><button type="button" class="pg-trig" id="offtrig" aria-label="Off days" title="Off days (S)">' + TRIG + "</button></div>" + strip();
  }
  function controls() {
    var d = S.data, a = S.admin;
    function b(k, t) { return '<button type="button" data-data="' + k + '" aria-pressed="' + (d === k) + '">' + t + "</button>"; }
    return '<div class="pg-mock" role="group" aria-label="Mockup only"><b>Mockup only</b>' +
      '<div class="pg-mg" role="group" aria-label="Sample household"><span>Household</span><div class="pg-seg">' + b("typical", "Some set") + b("empty", "None yet") + b("everyday", "Sam sets every day") + b("solo", "Only Sam") + b("solohh", "Only Sam, household days left") + b("removed", "Jane removed") + "</div></div>" +
      '<div class="pg-mg" role="group" aria-label="Sam is"><span>Sam is</span><div class="pg-seg"><button type="button" data-admin="1" aria-pressed="' + a + '">An admin</button><button type="button" data-admin="0" aria-pressed="' + !a + '">A member</button></div></div></div>';
  }
  function draw() {
    var h = '<div class="pg-main">' + head() + '<div class="pg-week" id="week">' + WD.map(night).join("") + "</div>" + controls() + "</div>";
    var root = document.getElementById("pg");
    var keep = root.querySelector(".pg-main"), sc = window.scrollY;
    var rl = root.querySelector(".pg-rail");
    if (keep) keep.outerHTML = h; else if (rl) rl.insertAdjacentHTML("afterend", h); else root.insertAdjacentHTML("afterbegin", h);
    window.scrollTo(0, sc);
  }
  function sync() { try { var u = new URL(location.href); u.searchParams.set("data", S.data); u.searchParams.set("as", S.admin ? "admin" : "member"); history.replaceState(null, "", u); } catch (e) { /* not essential */ } }

  var root = document.getElementById("pg");
  if (dev === "desktop") {
    var rail = '<nav class="pg-rail" aria-label="Main"><div class="pg-brand">Our<br>kitchen</div>' + RAIL.map(function (r) { return '<span class="pg-nv' + (r[0] === "Plan" ? " on" : "") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + r[1] + '"/></svg>' + r[0] + "</span>"; }).join("") + "</nav>";
    root.innerHTML = rail + '<aside class="pg-lane" id="lane" aria-label="Side panel"><div class="pg-idle" id="idle"><b>This week at a glance</b><span>Stand-in for the summary lane. Opening Off days swaps it, as Plan it does on Home.</span></div><div class="ud-host" id="ud-host" hidden></div></aside>';
    UD.mount(document.getElementById("ud-host"), Q.get("c") === "dialog" ? "dialog" : "lane");
  } else {
    root.innerHTML = '<div class="pg-scrim" id="scrim" hidden></div><div class="ud-host" id="ud-host" hidden></div>';
    UD.mount(document.getElementById("ud-host"), "sheet");
  }
  draw();
  document.addEventListener("ud:open", function () { var i = document.getElementById("idle"); if (i) i.hidden = true; var s = document.getElementById("scrim"); if (s) s.hidden = false; if (Q.get("c") === "dialog") document.getElementById("lane") && document.getElementById("lane").classList.add("dlg"); });
  document.addEventListener("ud:close", function () { var i = document.getElementById("idle"); if (i) i.hidden = false; var s = document.getElementById("scrim"); if (s) s.hidden = true; var l = document.getElementById("lane"); if (l) l.classList.remove("dlg"); var c = document.getElementById("offtrig"); if (c) c.focus({ preventScroll: true }); /* the page redraws while the flyout is open, so the cog the flyout remembered is gone: focus the new one */ });
  document.addEventListener("ud:change", function () { draw(); });
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("button"); if (!t) return;
    if (t.id === "offtrig") { UD.open(t); return; }
    if (t.id === "scrim" || (t.classList && t.classList.contains("pg-scrim"))) { UD.close(); return; }
    if (t.hasAttribute("data-view")) { P.view = t.getAttribute("data-view"); draw(); return; }
    if (t.hasAttribute("data-lift")) { var d = t.getAttribute("data-lift"); P.lift[d] = !P.lift[d]; draw(); return; }
    if (t.hasAttribute("data-data")) { UD.reset(t.getAttribute("data-data")); P.lift = {}; P.view = "mine"; sync(); draw(); return; }
    if (t.hasAttribute("data-admin")) { UD.setAdmin(t.getAttribute("data-admin") === "1"); sync(); draw(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input,textarea")) return;
    if ((e.key === "s" || e.key === "S") && !e.metaKey && !e.ctrlKey && !e.altKey && !S.open) { e.preventDefault(); UD.open(document.getElementById("offtrig")); }
  });
  /* the flyout is open when the page loads, so the link shows it at once (?open=0 for the page alone) */
  if (Q.get("open") !== "0") UD.open(null);
})();
