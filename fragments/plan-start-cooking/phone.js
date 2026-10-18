/* Plan: start cooking from a planned meal (Kitchie issue, 15 October 2026). Phone, the open meal detail (the docked day card plus its detail sheet),
   drawn with the app's own markup and classes from Kitchie uat 0.122.2 (server/src/assets/plan.phone.js: card, detailBody, ingList, footActions, actionSheet).
   app.css is Kitchie's plan.phone.css copied unchanged; cook.css holds the only new rules. Sample data only; nothing is saved or sent.
   Address: phone.html?o=a|b|c|d&m=adhoc|saved|missing  (o = option, m = which meal is open). */
(function () {
  "use strict";
  var q = new URLSearchParams(location.search), O = (q.get("o") || "b").toLowerCase(), M = (q.get("m") || "adhoc").toLowerCase();
  if (!/^[abcd]$/.test(O)) O = "b";
  if (!/^(adhoc|saved|missing)$/.test(M)) M = "adhoc";
  var I = function (d) { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var ic = {
    cart: I('<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>'),
    mark: I('<path d="M6 3h12v18l-6-4-6 4V3z"/>'), x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    more: I('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
    right: I('<path d="M9 5l7 7-7 7"/>'), book: I('<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4z"/><path d="M5 16a4 4 0 0 1 4-4h10"/>'),
    check: I('<path d="M5 12l5 5 9-10"/>'), bang: I('<path d="M12 6v7M12 17.5v.01"/>'),
    spark: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>'),
    cal: I('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
    swap: I('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'), moon: I('<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>'),
    /* new: the pan, for Start cooking (Proposal SC-P3) */
    pan: I('<path d="M3 12h13a0 0 0 0 1 0 0 5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M16 12h5"/><path d="M8 8c0-1.5 1-1.5 1-3M12 8c0-1.5 1-1.5 1-3"/>')
  };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };

  /* Sample meals (mockup names only). have = on hand [name, amount]; miss = [name, amount, on the shopping list?] */
  var MEALS = {
    adhoc: { id: "e-1", t: "Malatang with chicken and rice", em: "\u{1F35C}", src: "made", rid: null, who: "Everyone · 2", n: 2, held: true,
      have: [["Chicken thighs", "300 g"], ["Rice", "150 g"], ["Malatang soup base", "1 pack"], ["Bok choy", "2"], ["Enoki mushrooms", "100 g"], ["Tofu puffs", "80 g"], ["Glass noodles", "50 g"]], miss: [] },
    saved: { id: "e-2", t: "Lemon pepper soy chicken thighs", em: "\u{1F357}", src: "saved", rid: "lemon-pepper", who: "Everyone · 2", n: 2, held: true, mins: "35 min",
      have: [["Chicken thighs", "4"], ["Soy sauce", "2 tbsp"], ["Lemon", "1"], ["Black pepper", "1 tsp"], ["Garlic", "3 cloves"]], miss: [] },
    missing: { id: "e-3", t: "Lemon pepper soy chicken thighs", em: "\u{1F357}", src: "saved", rid: "lemon-pepper", who: "Everyone · 2", n: 2, held: true, mins: "35 min",
      have: [["Chicken thighs", "4"], ["Soy sauce", "2 tbsp"], ["Black pepper", "1 tsp"]], miss: [["Lemon", "1", false], ["Garlic", "3 cloves", false]] }
  };
  var m = MEALS[M];
  var DAY = "<b>Thursday</b> 15 Oct <em>Today</em>";

  /* Today's rule (plan.phone.js cookable): the cook link needs cook mode on (Recipe), a saved recipe, nothing missing, not read only, not past. */
  var cookableToday = !!(m.rid && !m.miss.length);
  /* What each option offers on THIS meal: "mode" = cook mode (Recipe tab), "session" = the household's Cooking now view, "ai" = hand to the person's AI app, null = nothing. */
  function action() {
    if (O === "d") return null;                                  // unchanged: footer has no cook button
    if (m.rid) return cookableToday ? "mode" : (O === "a" || O === "b" || O === "c") ? "mode-missing" : null;
    return O === "b" ? "session" : O === "c" ? "ai" : null;      // a made-up meal: A has nothing, B starts the session, C asks the AI
  }
  var act = action();

  function sig(bad) { var t = bad ? "Something is missing" : "Dealt with"; return '<span class="sig ' + (bad ? "bad" : "ok") + '" role="img" aria-label="' + t + '" title="' + t + '">' + (bad ? ic.bang : ic.check) + "</span>"; }
  function card() {
    return '<div class="sw"><article class="mc lite sel" tabindex="0" data-id="' + m.id + '" data-ro="edit" aria-label="' + esc(m.t) + ', Thursday 15 October."><span class="em">' + m.em + '</span><div class="tx"><h3>' + esc(m.t) + "</h3><p>" + esc(m.who) + "</p></div>" + sig(m.miss.length > 0) + '<button class="more" data-more aria-label="Actions for ' + esc(m.t) + '">' + ic.more + "</button></article></div>";
  }
  function ingList() {
    var rows = m.miss.map(function (x) { return '<li class="m red"><span class="in">' + esc(x[0]) + '</span><span class="qy">' + esc(x[1]) + '</span><button class="ib" aria-label="Add ' + esc(x[0]) + ' to the shopping list">' + ic.cart + "</button></li>"; }).join("");
    return '<ul class="ing one">' + rows + m.have.map(function (r) { return '<li><span class="in">' + esc(r[0]) + '</span><span class="qy">' + esc(r[1]) + "</span></li>"; }).join("") + "</ul>";
  }
  function detailBody() {
    var src = m.src === "made" ? '<p class="srcl">' + ic.spark + " <b>Made up by your AI</b> · not saved as a recipe</p>" : "";
    return src + (m.mins ? '<p class="tt">Total time <b>' + m.mins + "</b></p>" : "") + '<div class="ppl"><span class="lbl">People</span><button class="ib" aria-label="Fewer people">−</button><b>' + m.n + '</b><button class="ib" aria-label="More people">+</button></div>' + ingList();
  }
  /* Decision 126 (Hold, Add) unchanged; Start cooking joins the same row (Proposals SC-P1 to SC-P4). */
  function foot() {
    var hv = m.have.length, un = m.miss.length, o = "";
    var cook = "";
    if (act) {
      var three = un > 0, lead = !three;
      var label = three ? "Cook" : "Start cooking";
      var aria = act === "ai" ? "Start cooking with your AI app: " + m.t : "Start cooking " + m.t;
      cook = '<button class="b2 cook' + (lead ? " lead" : "") + '" data-cook="' + act + '" aria-label="' + esc(aria) + '">' + ic.pan + " " + label + (act === "ai" ? '<span class="via">' + ic.spark + "</span>" : "") + "</button>";
    }
    if (hv) o += '<button class="b2 hold' + (m.held ? " on" : "") + '" aria-label="' + (m.held ? "Release the hold on " : "Hold all ") + hv + ' on-hand ingredients">' + ic.mark + (m.held ? " Release" : " Hold") + ' <b class="ct">' + hv + "</b></button>";
    if (un) o += '<button class="b2 add" aria-label="Add ' + un + ' missing ingredients to the shopping list">' + ic.cart + ' Add <b class="ct">' + un + "</b></button>";
    return o + cook;
  }
  function menu() {
    var items = "";
    if (m.rid) items += '<button class="it" role="menuitem">' + ic.book + "Open recipe</button>";
    if (m.rid && cookableToday) items += '<button class="it" role="menuitem" data-cook="mode">' + ic.right + "Make it</button>";
    items += '<button class="it" role="menuitem">' + ic.swap + 'Replan</button><button class="it" role="menuitem">' + ic.cal + 'Move to another day</button><button class="it" role="menuitem">' + ic.moon + "Not cooking</button>";
    return '<div class="scrim2" data-closea></div><div class="asheet" role="menu" aria-label="Actions for ' + esc(m.t) + '"><h2>' + esc(m.t) + "</h2>" + items + "</div>";
  }
  function render(withMenu) {
    var f = foot();
    document.getElementById("pw").innerHTML =
      '<section class="stackw pw hdl-none noin" role="region" aria-labelledby="stt"><div class="dpiece"><div class="dkh"><h2 id="stt">' + DAY + '</h2><button class="ib" aria-label="Close detail">' + ic.x + '</button></div><div class="pw-stack">' + card() + '</div><button class="tongue" aria-label="Drag down to close, or press Enter"><i></i></button></div>' +
      '<div class="spiece"><div class="sbody" id="sbody">' + detailBody() + "</div>" + (f ? '<footer class="sfoot">' + f + "</footer>" : "") + "</div></section>" +
      '<div id="aw">' + (withMenu ? menu() : "") + "</div>";
  }
  function toast(html) {
    var t = document.getElementById("toast"); t.innerHTML = html; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 4200);
  }
  function aiSheet() {
    var prompt = "I'm cooking " + m.t + " now, from my Kitchie meal plan for tonight. Start cooking it in Kitchie so I can see the ingredients.";
    document.getElementById("aw").innerHTML = '<div class="scrim2" data-closea></div><div class="asheet ai" role="dialog" aria-label="Opening your AI app"><h2>Opening your AI app</h2><p class="hint2">Kitchie hands this to your AI app. When it has started the cook, the Cooking now banner shows here.</p><blockquote>' + esc(prompt) + '</blockquote><button class="b2 lead" data-closea>OK</button></div>';
  }
  document.addEventListener("click", function (e) {
    var t = e.target instanceof Element ? e.target : null; if (!t) return;
    if (t.closest("[data-closea]")) { render(false); return; }
    if (t.closest("[data-more]")) { render(true); return; }
    var c = t.closest("[data-cook]"); if (!c) return;
    var k = c.getAttribute("data-cook");
    if (k === "session") { location.href = "cooking.html?o=" + O; return; }
    if (k === "ai") { aiSheet(); return; }
    if (k === "mode" || k === "mode-missing") { render(false); toast("<b>Cook mode</b> opens here: the Recipe tab's ingredients-first screen, then the steps (<code>/recipes/cook?entry=&hellip;&amp;from=plan</code>)." + (k === "mode-missing" ? " Two things are still missing; cook mode lists them." : "")); }
  });
  document.documentElement.setAttribute("data-opt", O);
  render(false);
})();
