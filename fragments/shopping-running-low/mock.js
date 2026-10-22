// MOCKUP ONLY. NOT FOR THE BUILD. (fragments/shopping-running-low)
// Draws the member's Shopping screen at phone width as the server draws it (web-shopping.ts renderPage), from sample data, with ONE placement of the "Running low" link.
// The markup and class names of the page are the app's. The link's own markup (.rl-*) is the proposal: the build lifts it and options.css for the chosen option only.
//   ?o=a  in the hint line   ?o=b  beside the hand-off card   ?o=c  a pill on the hint line   ?o=d  the end of the list   ?o=e  an icon in the app bar
//   ?s=handoff (default) the card only   ?s=links the card and two links out   ?s=empty nothing on the list (the existing "See what's running low" button carries it; no new link)
// The link goes to <base>/pantry?show=low, the same view Home's tile opens. N is the number of entries the Pantry preset keeps (home.ts lowKeys); sample value only.
(function () {
  "use strict";
  var root = document.getElementById("app");
  if (!root) return;
  var Q = new URLSearchParams(location.search), S = Q.get("s") || "handoff", O = /^[a-e]$/.test(Q.get("o") || "") ? Q.get("o") : "a", RL = 3;
  document.body.setAttribute("data-o", O);
  var P = {
    tick: "M5 12.5l4.5 4.5L19 7.5", bag: "M6 8h12l-1 12H7zM9 8V6.5a3 3 0 0 1 6 0V8", chev: "M9 6l6 6-6 6", clock: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    pen: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4", close: "M6 6l12 12M18 6L6 18", basket: "M4 9h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7zM8 9l3-5M16 9l-3-5",
    home: "M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-3.5v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19.5z", cart: "M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2",
    pantry: "M7 7.5h10a2 2 0 0 1 2 2V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V9.5a2 2 0 0 1 2-2z", plan: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.5V7M16 3.5V7"
  };
  function ico(d, n, extra) { return '<svg width="' + n + '" height="' + n + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + (extra || "") + '><path d="' + d + '"/></svg>'; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // [name, quantity, home, emoji ("" = none)] : made-up groceries only
  var LINES = [["Eggs", "a dozen", "", "🥚"], ["Milk", "2 L", "1 left at home", "🥛"], ["Rice", "1 kg", "", "🍚"], ["chives", "", "", ""], ["dill", "", "15 g, old left at home", ""], ["chilli sauce, hot", "", "", ""], ["Cendol", "", "5 left at home", ""], ["blend - sambar powder", "", "", ""]];
  var N = S === "empty" ? 0 : LINES.length, HREF = "#running-low";
  function row(L, i) {
    var np = L[3] === "", em = np ? "🍽️" : L[3], n = esc(L[0]);
    return '<li class="shoprow" data-shop-row data-id="s' + i + '" data-name="' + n + '">\n<div class="swrow"><div class="swbg two" aria-hidden="true"><span class="l">' + ico(P.tick, 22) + 'Bought</span><span class="r">Remove' + ico(P.close, 22) + '</span></div>\n' +
      '<div class="swfg"><button type="button" class="tick" role="checkbox" aria-checked="false" aria-label="In the basket: ' + n + '"><span aria-hidden="true">' + ico(P.tick, 22) + '</span></button>\n' +
      '<div class="rlink" tabindex="0"><span class="em' + (np ? " np" : "") + '" aria-hidden="true">' + em + '</span><div class="smain"><div class="sname"><span>' + n + '</span>' + (L[1] ? ' <b class="want">' + esc(L[1]) + "</b>" : "") + '</div>' + (L[2] ? '<div class="shome">' + esc(L[2]) + "</div>" : "") + '</div></div></div></div>\n</li>';
  }
  function linkRow(n, name, left, line2, state) {
    return '<li class="sl-lrow" data-sl-link="l' + n + '" data-sl-state="' + state + '"><div class="sl-lrow-a"><span class="sl-lk" data-n="' + n + '" aria-hidden="true">' + n + '</span><span class="sl-lrow-t"><span class="sl-lrow-1"><b class="sl-name"><span class="sl-name-t">' + name + '</span>' + ico(P.pen, 14, ' class="sl-pen"') + '</b><span class="sl-left">' + ico(P.clock, 16) + left + '</span></span><span class="sl-lrow-2">' + line2 + '</span></span><a class="sl-go" href="#" aria-label="Open ' + name + '">' + ico(P.chev, 20, ' class="sl-chev"') + '</a></div>\n<form method="post" action="#"><button type="submit" class="sl-quiet" aria-label="Cancel ' + name + '">Cancel</button></form></li>';
  }
  var showLink = RL > 0 && N > 0;   // Proposal: empty is absent. Nothing running low, or nothing on the list (the empty card has its own button): no link.
  var CAP = RL + " running low";
  var card = '<form class="sl-share" method="post" action="#"><button class="sl-handoff" type="submit">' + ico(P.bag, 26) + '<span class="sl-handoff-t"><b>Is someone else shopping?</b><span>Send the list via a link. No sign-in needed.</span></span>' + ico(P.chev, 20) + '</button></form>';
  var slot = "";
  if (N > 0) {
    var pair = O === "b" && showLink ? '<div class="rl-pair">' + card + '<a class="rl-tile" href="' + HREF + '" aria-label="Running low, ' + RL + ' items">' + ico(P.basket, 24) + '<span>Running low</span><i class="rl-n" aria-hidden="true">' + RL + '</i></a></div>' : card;
    slot = '<div class="sl-top" id="sl-top">\n' + pair;
    if (S === "links") slot += '\n<ul class="sl-links" aria-label="Links that are out">' + linkRow(1, "Mum", "36 h left", "3 of 8 lines answered", "active") + linkRow(2, "Link 2", "48 h left", "Not opened yet", "unopened") + "</ul>";
    slot += "\n</div>";
  }
  var HINT = "Tick as you drop things in the basket. Swipe right when you've bought it, left to take it off.";
  var hint = "";
  if (N > 0) {
    if (O === "a" && showLink) hint = '<p id="shop-hint" class="hint">' + HINT + ' <a class="rl-inline" href="' + HREF + '" aria-label="Running low, ' + RL + ' items">Running low (' + RL + ') &rsaquo;</a></p>';
    else if (O === "c" && showLink) hint = '<div class="rl-hintrow"><p id="shop-hint" class="hint">' + HINT + '</p><a class="rl-pill" href="' + HREF + '" aria-label="Running low, ' + RL + ' items">' + ico(P.basket, 20) + '<i class="rl-n" aria-hidden="true">' + RL + '</i></a></div>';
    else hint = '<p id="shop-hint" class="hint">' + HINT + '</p>';
  }
  var empty = '<div id="shop-empty" class="shop-empty"' + (N ? " hidden" : "") + '><span class="ric" style="width:64px;height:64px">' + ico(P.cart, 32) + '</span><b>Nothing on the list yet</b><p>Swipe a running-low item to put it here.</p><a class="btn go sm" href="' + HREF + '">See what\'s running low</a></div>';
  var tail = O === "d" && showLink ? '<a class="rl-end" href="' + HREF + '" aria-label="Running low, ' + RL + ' items">' + ico(P.basket, 22) + '<span class="rl-end-t"><b>See what\'s running low</b><span>' + CAP + ' at home</span></span>' + ico(P.chev, 20) + '</a>' : "";
  var navs = [["Home", P.home, 0, ""], ["Pantry", P.pantry, 0, ""], ["Plan", P.plan, 0, ""], ["Shopping", P.cart, N, "page"]];
  var bar = '<nav class="bar" aria-label="Main">' + navs.map(function (n) { return '<a href="#"' + (n[3] ? ' aria-current="page"' : "") + ">" + ico(n[1], 24) + "<span>" + n[0] + "</span>" + (n[2] ? '<i class="badge" aria-hidden="true">' + n[2] + "</i>" : "") + "</a>"; }).join("") + "</nav>";
  var appIcon = O === "e" && showLink ? '<a class="icon rl-ic" href="' + HREF + '" aria-label="Running low, ' + RL + ' items" title="Running low">' + ico(P.basket, 22) + '<i class="rl-n" aria-hidden="true">' + RL + '</i></a>' : "";
  var head = '<header class="appbar"><a class="brandbar" href="#" title="Our kitchen"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="2.5" width="12" height="19" rx="2.5"></rect><path d="M6 10h12M9 6v1.5M9 13v3"></path></svg><span>Our kitchen</span></a><div class="hdr">' + appIcon + '<a class="icon pmav" href="#" aria-label="Profile" title="Profile"><span class="pmi">A</span></a></div></header>';
  root.innerHTML = head + '<h1 class="sr-only">Shopping</h1>\n<div id="sl-root">\n' + slot + '\n' + hint + '\n' + empty + '\n<ul class="rows shop" id="shop">\n' + LINES.slice(0, N).map(row).join("\n") + "\n</ul>\n" + tail + "\n</div>\n" + bar;
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[href^='#']"); if (a) e.preventDefault(); });
})();
