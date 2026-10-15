// MOCKUP ONLY. NOT FOR THE BUILD. (fragments/desktop-shopping)
// Draws the member's Shopping screen as the server draws it (web-shopping.ts renderPage), from sample data, so every state can be framed at every desktop size. The markup and the class names are
// the point: desktop-shopping.css styles them and the build lifts that file. Names that only exist for the sample data stay here.
//   ?s=links (default) a hand-off card and two links out   ?s=handoff only the card   ?s=sorting adds the "still needs sorting" nudge   ?s=empty nothing on the list (no panel, no count)
//   ?cur=3  the third line is the current line (what J K or a click makes it)   ?o=b  option B (no panel lane)   ?vp=1440  a frame of that window size (frame.js)
// Clicking Bought or Remove takes the line off and keeps the count and the rail's badge equal, as desktop-shopping.js does in the build.
(function () {
  "use strict";
  var root = document.getElementById("app");
  if (!root) return;
  var Q = new URLSearchParams(location.search), S = Q.get("s") || "links", CUR = parseInt(Q.get("cur") || "0", 10) || 0, OPT = Q.get("o") === "b" ? "b" : "a";
  if (OPT === "b") { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "option-b.css"; document.head.appendChild(l); }
  var P = {
    tick: "M5 12.5l4.5 4.5L19 7.5", bag: "M6 8h12l-1 12H7zM9 8V6.5a3 3 0 0 1 6 0V8", chev: "M9 6l6 6-6 6", alert: "M12 7.5v5.5M12 16.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    clock: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", pen: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4", close: "M6 6l12 12M18 6L6 18",
    home: "M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-3.5v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19.5z", cart: "M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2",
    pantry: "M7 7.5h10a2 2 0 0 1 2 2V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V9.5a2 2 0 0 1 2-2z", plan: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.5V7M16 3.5V7"
  };
  function ico(d, n, extra) { return '<svg width="' + n + '" height="' + n + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + (extra || "") + '><path d="' + d + '"' + (d === P.tick ? ' pathLength="1"' : "") + '/></svg>'; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // [name, quantity, home, emoji ("" = none found, the plate the app draws today)] : made-up groceries only
  var LINES = [["blend - sambar powder", "", "", ""], ["Cendol", "", "5 left at home", ""], ["chilli sauce, hot", "", "", ""], ["chives", "", "", ""], ["dill", "", "15 g, old left at home", ""], ["Eggs", "a dozen", "", "🥚"], ["Milk", "2 L", "1 left at home", "🥛"], ["Rice", "1 kg", "", "🍚"]];
  var N = S === "empty" ? 0 : LINES.length;
  function row(L, i) {
    var np = L[3] === "", em = np ? "🍽️" : L[3], n = esc(L[0]);
    return '<li class="shoprow" data-shop-row data-id="s' + i + '" data-name="' + n + '"' + (CUR === i + 1 ? " data-cur" : "") + '>\n<div class="swrow"><div class="swbg two" aria-hidden="true"><span class="l">' + ico(P.tick, 22) + 'Bought</span><span class="r">Remove' + ico(P.close, 22) + '</span></div>\n' +
      '<div class="swfg"><button type="button" class="tick" role="checkbox" aria-checked="false" aria-label="In the basket: ' + n + '"><span aria-hidden="true">' + ico(P.tick, 22) + '</span></button>\n' +
      '<div class="rlink" tabindex="0"><span class="em' + (np ? " np" : "") + '" aria-hidden="true">' + em + '</span><div class="smain"><div class="sname"><span>' + n + '</span>' + (L[1] ? ' <b class="want">' + esc(L[1]) + "</b>" : "") + '</div>' + (L[2] ? '<div class="shome">' + esc(L[2]) + "</div>" : "") + '</div></div></div>\n' +
      '<button type="button" class="more" aria-expanded="false" aria-label="Actions for ' + n + '" hidden>' + ico("M5.5 12h.01M12 12h.01M18.5 12h.01", 22) + '</button></div>\n' +
      '<div class="acts" data-acts hidden><form method="post" action="#"><button class="btn" type="submit" data-shop-buy aria-label="Bought: ' + n + '">Bought</button></form><form method="post" action="#"><button class="btn" type="submit" data-shop-remove aria-label="Remove: ' + n + '">Remove</button></form></div>\n</li>';
  }
  function linkRow(n, name, left, line2, state) {
    return '<li class="sl-lrow" data-sl-link="l' + n + '" data-sl-state="' + state + '"><div class="sl-lrow-a"><span class="sl-lk" data-n="' + n + '" aria-hidden="true">' + n + '</span><span class="sl-lrow-t"><span class="sl-lrow-1"><b class="sl-name"><span class="sl-name-t">' + name + '</span>' + ico(P.pen, 14, ' class="sl-pen"') + '</b><span class="sl-left">' + ico(P.clock, 16) + left + '</span></span><span class="sl-lrow-2">' + line2 + '</span></span><a class="sl-go" href="#" aria-label="Open ' + name + '">' + ico(P.chev, 20, ' class="sl-chev"') + '</a></div>\n<form method="post" action="#"><button type="submit" class="sl-quiet" aria-label="Cancel ' + name + '">Cancel</button></form></li>';
  }
  var slot = "";
  if (N > 0) {
    slot = '<div class="sl-top" id="sl-top">\n<form class="sl-share" method="post" action="#"><button class="sl-handoff" type="submit">' + ico(P.bag, 26) + '<span class="sl-handoff-t"><b>Someone else is shopping</b><span>Send them the list and a link. No sign-in.</span></span>' + ico(P.chev, 20) + '</button></form>';
    if (S !== "handoff") slot += '\n<ul class="sl-links" aria-label="Links that are out">' + linkRow(1, "Mum", "36 h left", "3 of 8 lines answered", "active") + linkRow(2, "Link 2", "48 h left", "Not opened yet", "unopened") + "</ul>";
    if (S === "sorting") slot += '\n<a class="sl-nudge" href="#sl-sorting">' + ico(P.alert, 22) + '<span class="sl-nudge-t"><b>1 line still needs sorting</b><span>Nobody has it. Your call.</span></span>' + ico(P.chev, 20) + "</a>";
    slot += "\n</div>";
  }
  var navs = [["Home", P.home, 0, ""], ["Pantry", P.pantry, 0, ""], ["Plan", P.plan, 0, ""], ["Shopping", P.cart, N, "page"]];
  var bar = '<nav class="bar" aria-label="Main">' + navs.map(function (n) { return '<a href="#"' + (n[3] ? ' aria-current="page"' : "") + ">" + ico(n[1], 24) + "<span>" + n[0] + "</span>" + (n[2] ? '<i class="badge" aria-hidden="true">' + n[2] + "</i>" : "") + "</a>"; }).join("") + "</nav>";
  var head = '<header class="appbar"><a class="brandbar" href="#" title="Our kitchen"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="2.5" width="12" height="19" rx="2.5"></rect><path d="M6 10h12M9 6v1.5M9 13v3"></path></svg><span>Our kitchen</span></a><div class="hdr"><a class="icon pmav" href="#" aria-label="Profile" title="Profile"><span class="pmi">A</span></a></div></header>';
  root.innerHTML = head + '<h1 class="sr-only">Shopping</h1>\n<div id="sl-root">\n' + slot + '\n<div class="shop-hd dh-s" id="shop-hd"' + (N ? "" : " hidden") + '><span class="count" id="shop-count">' + N + ' to get</span></div>\n' +
    '<p id="shop-hint" class="hint"' + (N ? "" : " hidden") + '>Tick as you drop things in the basket. Swipe right when you\'ve bought it, left to take it off.</p>\n' +
    '<div id="shop-empty" class="shop-empty"' + (N ? " hidden" : "") + '><span class="ric" style="width:64px;height:64px">' + ico(P.cart, 32) + '</span><b>Nothing on the list yet</b><p>Swipe a running-low item to put it here.</p><a class="btn go sm" href="#">See what\'s running low</a></div>\n' +
    '<ul class="rows shop" id="shop">\n' + LINES.slice(0, N).map(row).join("\n") + "\n</ul>\n</div>\n" + bar;
  // desktop-shopping.js in the build: the header count follows the rail's badge. Here a click on Bought or Remove takes the line off first, as shopping.js does.
  function sync() {
    var left = document.querySelectorAll("#shop li.shoprow:not([hidden])").length, b = document.querySelector("nav.bar i.badge"), c = document.getElementById("shop-count"), hd = document.getElementById("shop-hd");
    if (b) { if (left) b.textContent = left; else b.remove(); }
    if (c) c.textContent = left + " to get";
    if (hd) hd.hidden = left === 0;
    var h = document.getElementById("shop-hint"); if (h) h.hidden = left === 0;
    var e = document.getElementById("shop-empty"); if (e) e.hidden = left !== 0;
    var t = document.getElementById("sl-top"); if (t && left === 0) t.hidden = true;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-shop-buy],[data-shop-remove]");
    if (!b) return;
    e.preventDefault();
    var li = b.closest("li.shoprow"); li.hidden = true; sync();
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("button.tick");
    if (!t) return;
    var on = t.getAttribute("aria-checked") !== "true"; t.setAttribute("aria-checked", on ? "true" : "false");
  });
  document.addEventListener("click", function (e) { var li = e.target.closest && e.target.closest("li.shoprow"); if (li && !e.target.closest("button,a,form")) { var c = document.querySelector("li.shoprow[data-cur]"); if (c) c.removeAttribute("data-cur"); li.setAttribute("data-cur", ""); } });
  var keys = { j: 1, k: -1, ArrowDown: 1, ArrowUp: -1 };
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var rows = Array.prototype.slice.call(document.querySelectorAll("#shop li.shoprow:not([hidden])")), c = document.querySelector("li.shoprow[data-cur]"), i = rows.indexOf(c);
    if (keys[e.key]) { e.preventDefault(); if (c) c.removeAttribute("data-cur"); var n = rows[i < 0 ? (keys[e.key] > 0 ? 0 : rows.length - 1) : Math.max(0, Math.min(rows.length - 1, i + keys[e.key]))]; if (n) n.setAttribute("data-cur", ""); }
    else if ((e.key === "d" || e.key === "s") && c) { c.hidden = true; c.removeAttribute("data-cur"); var nx = rows[i + 1] || rows[i - 1]; if (nx) nx.setAttribute("data-cur", ""); sync(); }
  });
})();
