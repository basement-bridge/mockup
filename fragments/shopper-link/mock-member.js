// MOCKUP ONLY. NOT FOR THE BUILD. (fragments/shopper-link)
// Draws the household's side of the owner's second round (voice, 11 October 2026, SL-D21 on) from mock.js's pretend server: member-list.html (the Shopping list with promised lines grouped under
// their link, the links that are out, and lines nobody has) and link.html (one link, tapped into). The server would draw this markup itself; here it is built in the browser so one set of
// frames can show every state. The markup and the class names are the point: member.css styles them, and the build lifts both. Names that only exist for the sample data stay in this file.
//   Line states the household sees (SL-D25): needed (nothing yet), claimed ("Someone's getting this", grouped under the link that promised it), bought (crossed out, as today),
//   plus what the shopper could not get: "Not bought" with what to do about it (SL-D28). Nobody is ever named; a link is only "Link 1", "Link 2" or "Link 3" (SL-D26, SL-J33).
(function () {
  "use strict";
  var M = window.KitchieMock;
  if (!M) return;
  var q = new URLSearchParams(location.search), s = q.get("s") || "";
  var page = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var root = document.getElementById("sl-root");
  if (!root) return;
  var EMO = ["🍌", "🍞", "🧀", "🧼", "🥚", "🥛", "🫒", "🧅", "🍝", "🍚", "🥬", "🍅"];
  var HOME = ["None at home", "None at home", "None at home", "", "2 left at home", "None at home", "None at home", "1 left at home", "None at home", "None at home", "None at home", "None at home"];
  var P = {
    tick: "M5 12.5l4.5 4.5L19 7.5", swap: "M5 9h12l-3-3M19 15H7l3 3", bag: "M6 8h12l-1 12H7zM9 8V6.5a3 3 0 0 1 6 0V8", chev: "M9 6l6 6-6 6", alert: "M12 7.5v5.5M12 16.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    eye: "M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z", dash: "M7 12h10", back: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
    link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1", clock: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"
  };
  function ico(d, n, cls) { return '<svg width="' + n + '" height="' + n + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + (cls ? ' class="' + cls + '"' : "") + '><path d="' + d + '"/></svg>'; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  // How much time is left (SL-J31): whole hours, rounded up, from two hours; minutes under that; "ending" in the last minute.
  function left(h) { if (h >= 1) return Math.ceil(h) + " h left"; var m = Math.round(h * 60); return m < 1 ? "Ending now" : m + " min left"; }
  function pantryNote(txt) {
    var key = txt.toLowerCase().replace(/,.*$/, "").replace(/^\d+\s*(cans? of |x )?/, "").trim();
    return M.pantry.some(function (p) { return key.indexOf(p) === 0 || p.indexOf(key) === 0; }) ? "Topped up your " + key.split(" ")[0] + " in the Pantry" : "Added to the Pantry as new";
  }

  // ---- what the server knows, in the words the screens use
  function model() {
    var srv = M.srv(), N = M.names;
    var lines = N.map(function (n, i) {
      var k = "l" + i, r = srv.lines[k] || { state: "open", words: "", by: "" }, c = r.state === "open" ? M.claimOf(k) : "";
      var st = r.state === "open" ? (c ? "claimed" : "needed") : r.state === "got" ? "got" : r.state === "swapped" ? "swapped" : "notbought";
      return { i: i, k: k, name: n, qty: M.qty[i], emoji: EMO[i], home: HOME[i], st: st, words: r.words, by: r.by, link: c, gone: !!(srv.removed || {})[k] };
    });
    var order = (srv.order || []).slice();
    Object.keys(srv.links || {}).forEach(function (l) { if (order.indexOf(l) === -1) order.push(l); });
    var links = order.map(function (id, ix) {
      var l = srv.links[id] || {}, alive = M.live(id), mine = lines.filter(function (L) { return L.by === id || L.link === id; });
      var promised = Object.keys(srv.claims).filter(function (k) { return srv.claims[k] === id; }).length;
      var o = {
        id: id, slot: l.slot || (ix + 1), alive: alive, dead: !!l.dead, ended: !!l.ended, opened: l.opened === undefined ? "just now" : l.opened, hours: l.left === undefined ? 48 : l.left,
        deadAgo: l.deadAgo || "just now", endedAgo: l.endedAgo || "just now", back: l.back || 0, promised: promised,
        pending: lines.filter(function (L) { return L.link === id; }),
        got: lines.filter(function (L) { return L.by === id && L.st === "got"; }),
        swapped: lines.filter(function (L) { return L.by === id && L.st === "swapped"; }),
        notfound: lines.filter(function (L) { return L.by === id && L.st === "notbought"; })
      };
      o.state = o.dead ? "dead" : o.ended ? "ended" : o.opened ? "active" : "unopened";
      o.mine = mine;
      return o;
    }).filter(function (o) { return o.state !== "ended" || page === "member-list"; });
    return { lines: lines, links: links, extras: srv.extras || [] };
  }
  function badge(n, cls) { return '<span class="sl-lk' + (cls ? " " + cls : "") + '" data-n="' + n + '" aria-hidden="true">' + n + "</span>"; }

  // ---- one line, as the Shopping screen draws it (the same li, the same parts; only the status row differs)
  function lineLi(L, ctx) {
    var tickOn = L.st === "got", sl = L.st === "needed" ? "" : L.st;
    var label = (tickOn ? "Bought: " : L.st === "claimed" ? "Someone is getting " : "In the basket: ") + L.name;
    var extra = "";
    if (L.st === "claimed") extra = '<div class="shome sl-claim">' + ico(P.bag, 16) + "Someone's getting this</div>";
    if (L.st === "got") extra = '<div class="shome sl-pantry">' + ico(P.tick, 16) + "Got · in the Pantry</div>";
    if (L.st === "swapped") extra = '<div class="shome sl-instead">' + ico(P.swap, 16) + "Got instead: " + esc(L.words) + '</div><div class="shome sl-pantry">' + ico(P.tick, 16) + esc(pantryNote(L.words)) + "</div>";
    if (L.st === "notbought") extra = '<div class="shome sl-sort">' + ico(P.alert, 16) + (ctx === "main" ? "Not bought · nobody has it" : "Couldn't find") + "</div>";
    var cta = "";
    if (L.st === "notbought" && ctx === "main") {
      cta = '<div class="sl-cta"><form method="post" action="shopping/sort" data-sl-sort><input type="hidden" name="line" value="' + L.k + '"><input type="hidden" name="do" value="need"><button type="submit" class="btn sl-cta-need">Still need it</button></form>' +
        '<form method="post" action="shopping/sort" data-sl-sort><input type="hidden" name="line" value="' + L.k + '"><input type="hidden" name="do" value="drop"><button type="submit" class="btn sl-cta-drop">Take it off the list</button></form></div>';
    }
    return '<li class="shoprow" data-shop-row data-id="' + L.k + '" data-name="' + esc(L.name) + '" data-qty="' + esc(L.qty) + '"' + (sl ? ' data-sl="' + sl + '"' : "") + (L.st === "claimed" ? ' data-link="' + L.slot + '"' : "") + ">" +
      '<div class="swrow"><div class="swfg"><button type="button" class="tick" role="checkbox" aria-checked="' + tickOn + '"' + (L.st === "got" ? ' aria-disabled="true"' : "") + ' aria-label="' + esc(label) + '"><span aria-hidden="true">' + ico(P.tick, 22) + "</span></button>" +
      '<div class="rlink"><span class="em' + (L.i === 3 ? " ph" : "") + '" aria-hidden="true">' + L.emoji + '</span><div class="smain"><div class="sname"><span data-scribble>' + esc(L.name) + "</span>" + (L.qty ? ' <b class="want">' + esc(L.qty) + "</b>" : "") + "</div>" +
      (L.home && ctx !== "container" ? '<div class="shome">' + esc(L.home) + "</div>" : L.i === 3 && ctx !== "container" ? '<div class="shome"><span class="ptag">Not tracked</span></div>' : "") + extra + "</div></div></div></div>" + cta + "</li>";
  }

  // ---- the links that are out: one row each, tap in (SL-D29). Time left is on the row, once.
  function linkRow(o) {
    var href = "link.html?s=" + (o.state === "dead" ? "dead" : o.state === "unopened" ? "unopened" : o.promised ? "active" : "opened") + (q.get("g") ? "&g=" + encodeURIComponent(q.get("g")) + "&as=" + encodeURIComponent(o.id) : "");
    if (o.state === "dead" || o.state === "ended") {
      var what = o.state === "dead" ? "Turned down " + o.deadAgo + (o.promised ? "" : "") : "Ended " + o.endedAgo;
      var sub = o.state === "dead" ? "The shopper said no. The link is dead." : (o.back ? plural(o.back, "line") + " went back on the list." : "It ran out of time.");
      return '<li class="sl-lrow" data-sl-link="' + o.id + '" data-sl-state="' + o.state + '"><a class="sl-lrow-a" href="' + (o.state === "dead" ? href : "#") + '"><span class="sl-lk" data-n="x" aria-hidden="true">' + ico(P.link, 16) + '</span><span class="sl-lrow-t"><span class="sl-lrow-1"><b>' + what + '</b></span><span class="sl-lrow-2">' + sub + "</span></span>" + (o.state === "dead" ? ico(P.chev, 20, "sl-chev") : "") + "</a>" +
        '<form method="post" action="shopping/share/dismiss" data-sl-dismiss><input type="hidden" name="link" value="' + o.id + '"><button type="submit" class="sl-quiet">Dismiss</button></form></li>';
    }
    var line2 = o.state === "unopened" ? "Not opened yet" : "Opened " + o.opened + " · " + (o.promised ? plural(o.promised, "line") + " promised" : "nothing promised yet");
    return '<li class="sl-lrow" data-sl-link="' + o.id + '" data-sl-state="' + o.state + '"><a class="sl-lrow-a" href="' + href + '">' + badge(o.slot) + '<span class="sl-lrow-t"><span class="sl-lrow-1"><b>Link ' + o.slot + '</b><span class="sl-left">' + ico(P.clock, 16) + left(o.hours) + '</span></span><span class="sl-lrow-2">' + esc(line2) + "</span></span>" + ico(P.chev, 20, "sl-chev") + "</a>" +
      '<form method="post" action="shopping/share/cancel" data-sl-cancel><input type="hidden" name="link" value="' + o.id + '"><button type="submit" class="sl-quiet" aria-label="Cancel Link ' + o.slot + '">Cancel</button></form></li>';
  }

  // ================================================================ member-list.html
  function drawList() {
    var m = model(), liveLinks = m.links.filter(function (o) { return o.alive; });
    m.links.forEach(function (o) { o.mine.forEach(function (L) { if (L.link === o.id) L.slot = o.slot; }); });
    var sorting = m.lines.filter(function (L) { return L.st === "notbought" && !L.gone; });
    var main = m.lines.filter(function (L) { return (L.st === "needed" || L.st === "got" || L.st === "swapped") && !L.gone; });
    var html = "";
    // the slot above the list: the hand-off control (or why it steps aside), the links that are out, and the nudge
    var top = '<div class="sl-top" id="sl-top">';
    top += liveLinks.length >= 3 ? '<p class="note sl-full">3 links are out, the most at once, counting any not sent. Cancel or withdraw one to hand over again.</p>' :
      '<form class="sl-share" method="post" action="shopping/share" data-sl-share><button class="sl-handoff" type="submit">' + ico(P.bag, 26) + '<span class="sl-handoff-t"><b>Someone else is shopping</b><span>Send them the list and a link. No sign-in.</span></span>' + ico(P.chev, 20) + "</button></form>";
    if (m.links.length) top += '<ul class="sl-links" aria-label="Links that are out">' + m.links.map(linkRow).join("") + "</ul>";
    if (sorting.length) top += '<a class="sl-nudge" href="#sl-sorting">' + ico(P.alert, 22) + '<span class="sl-nudge-t"><b>' + plural(sorting.length, "line") + " still " + (sorting.length === 1 ? "needs" : "need") + " sorting</b><span>Nobody has " + (sorting.length === 1 ? "it" : "them") + ". Your call.</span></span>" + ico(P.chev, 20) + "</a>";
    top += "</div>";
    html += top;
    html += '<p id="shop-hint" class="hint">Tick as you drop things in the basket. Swipe right when you\'ve bought it, left to take it off.</p>';
    if (sorting.length) html += '<section class="sl-sorting" id="sl-sorting" aria-labelledby="sl-sorting-t"><header class="sl-gh sl-gh-sort">' + ico(P.alert, 20) + '<span class="sl-gh-t"><b id="sl-sorting-t">Still needs sorting</b><span>' + plural(sorting.length, "line") + ", nobody has " + (sorting.length === 1 ? "it" : "them") + "</span></span></header><ul class=\"rows shop\">" + sorting.map(function (L) { return lineLi(L, "main"); }).join("") + "</ul></section>";
    html += '<ul class="rows shop" id="shop" data-scope="demo" data-writes="1">' + main.map(function (L) { return lineLi(L, "main"); }).join("") + "</ul>";
    // claimed lines, grouped under the link that promised them (SL-D25): one group per link, kept apart by number, shape, edge and colour
    liveLinks.slice().sort(function (a, b) { return a.slot - b.slot; }).forEach(function (o) {
      if (!o.pending.length) return;
      html += '<section class="sl-group" data-sl-group data-n="' + o.slot + '" aria-labelledby="sl-g' + o.slot + '"><header class="sl-gh">' + badge(o.slot) + '<span class="sl-gh-t"><b id="sl-g' + o.slot + '">Link ' + o.slot + "</b><span>" + o.pending.length + ' still to get</span></span><a class="sl-gh-a" href="link.html?s=active">Details</a></header><ul class="rows shop">' + o.pending.map(function (L) { return lineLi(L, "group"); }).join("") + "</ul></section>";
    });
    if (m.extras.length) html += '<section class="sl-also-m" aria-labelledby="sl-also-m-t"><h2 id="sl-also-m-t">Also got</h2><ul>' + m.extras.map(function (x) { return "<li>" + ico(P.bag, 22) + "<span>" + esc(x.text) + "<small>" + esc(pantryNote(x.text)) + "</small></span></li>"; }).join("") + "</ul></section>";
    root.innerHTML = html;
    var badgeEl = document.querySelector("nav.bar .badge");
    if (badgeEl) badgeEl.textContent = m.lines.filter(function (L) { return L.st === "needed" || L.st === "notbought"; }).length;
  }

  // ================================================================ link.html
  var STATS = [["pending", "promised", "Promised"], ["got", "got", "Got"], ["swapped", "swapped", "Swapped"], ["notfound", "notfound", "Not found"]];
  function drawLink() {
    var m = model(), o = m.links.filter(function (l) { return l.id === (q.get("as") || "A"); })[0] || m.links[0];
    if (!o) { root.innerHTML = '<p class="note">No link here.</p>'; return; }
    var html = '<a class="sl-back" href="member-list.html?s=' + (o.state === "dead" ? "dead" : "states") + '">' + ico("M15 6l-6 6 6 6", 18) + "<span>Shopping</span></a>";
    if (o.state === "dead") {
      html += '<section class="sl-lc" data-sl-state="dead" aria-labelledby="sl-lc-t"><header class="sl-lc-h"><span class="sl-lk" data-n="x" aria-hidden="true">' + ico(P.link, 18) + '</span><span class="sl-lc-t"><b id="sl-lc-t">Turned down</b><span>' + o.deadAgo + '</span></span></header>' +
        '<p class="sl-lc-p">The shopper said they won\'t do it. This link doesn\'t work any more, and its slot is free. Anything it had promised went back on the list.</p>' +
        '<p class="note">It clears itself a day after it was turned down, or sooner when you dismiss it.</p>' +
        '<form method="post" action="shopping/share/dismiss" data-sl-dismiss><input type="hidden" name="link" value="' + o.id + '"><button type="submit" class="btn sl-dismiss">Dismiss</button></form></section>';
      root.innerHTML = html; return;
    }
    var facts = "";
    var open = o.state !== "unopened";
    html += '<section class="sl-lc" data-n="' + o.slot + '" data-sl-state="' + o.state + '" aria-labelledby="sl-lc-t">';
    html += '<header class="sl-lc-h">' + badge(o.slot) + '<span class="sl-lc-t"><b id="sl-lc-t">Link ' + o.slot + "</b><span>" + (open ? "Active" : "Not opened yet") + "</span></span></header>";
    var hrs = o.hours >= 1 ? Math.ceil(o.hours) : Math.max(1, Math.round(o.hours * 60)), unit = o.hours >= 1 ? (hrs === 1 ? "hour" : "hours") : (hrs === 1 ? "minute" : "minutes");
    html += '<div class="sl-time"><span class="sl-time-l">Time left to act</span><b class="sl-time-v">' + hrs + '</b><span class="sl-time-u">' + unit + " left</span></div>";
    if (open) {
      var total = o.pending.length + o.got.length + o.swapped.length + o.notfound.length;
      facts = '<ul class="sl-facts"><li>' + ico(P.eye, 18) + "<span>Opened " + o.opened + "</span></li><li>" + ico(P.bag, 18) + "<span>" + (o.promised ? "Promised " + plural(o.promised, "line") : "Nothing promised yet") + "</span></li></ul>";
      html += facts;
      if (total) {
        html += '<div class="sl-stats" role="group" aria-label="What this link has done">' + STATS.map(function (S) {
          var n = o[S[0]].length; if (!n) return "";
          return '<button type="button" class="sl-stat" data-sl-stat="' + S[1] + '" aria-expanded="false" aria-controls="sl-d-' + S[1] + '"><b>' + n + "</b><span>" + S[2].toLowerCase() + "</span></button>";
        }).join("") + "</div>";
        html += STATS.map(function (S) {
          var arr = o[S[0]]; if (!arr.length) return "";
          return '<div class="sl-drill" id="sl-d-' + S[1] + '" data-sl-drill="' + S[1] + '" role="region" aria-label="' + S[2] + '" hidden><ul>' + arr.map(function (L) { return '<li><span class="em" aria-hidden="true">' + L.emoji + "</span><span><b>" + esc(L.name) + "</b>" + (S[1] === "swapped" ? "<small>Got instead: " + esc(L.words) + "</small>" : "") + "</span></li>"; }).join("") + "</ul></div>";
        }).join("");
        // the lines it touched, with the same status look as the Shopping list (promised, got, swapped, not found); nothing that was never promised or answered is listed
        var shown = m.lines.filter(function (L) { return (L.link === o.id) || (L.by === o.id && L.st !== "needed"); });
        shown.forEach(function (L) { L.slot = o.slot; });
        html += '<h2 class="sl-lc-h2">Lines on this link</h2><ul class="rows shop sl-lc-lines">' + shown.map(function (L) { return lineLi(L, "container"); }).join("") + "</ul>";
      } else {
        html += '<p class="sl-lc-p">Nothing promised yet. When the shopper promises or answers lines, they show up here.</p>';
      }
    }
    html += "</section>";
    html += '<form class="sl-lc-cancel" method="post" action="shopping/share/cancel" data-sl-cancel><input type="hidden" name="link" value="' + o.id + '"><button type="submit" class="btn">Cancel this link</button></form>';
    root.innerHTML = html;
    // the drill-downs: tap a count and the names are listed; tap it again and they close. Only the lines that are promised or answered are ever counted (SL-D31).
    var want = s === "got" || s === "swapped" || s === "notfound" ? s : "";
    Array.prototype.forEach.call(root.querySelectorAll("[data-sl-stat]"), function (b) {
      var panel = root.querySelector('[data-sl-drill="' + b.getAttribute("data-sl-stat") + '"]');
      function setOpen(on) { b.setAttribute("aria-expanded", String(on)); panel.hidden = !on; }
      if (want && b.getAttribute("data-sl-stat") === want) setOpen(true);
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-expanded") !== "true";
        Array.prototype.forEach.call(root.querySelectorAll("[data-sl-stat]"), function (x) { x.setAttribute("aria-expanded", "false"); root.querySelector('[data-sl-drill="' + x.getAttribute("data-sl-stat") + '"]').hidden = true; });
        setOpen(on);
      });
    });
  }

  var draw = page === "link" ? drawLink : drawList;
  draw();
  // The household's own actions on a not-bought line (SL-D28), and Cancel / Dismiss, act on the pretend server.
  document.addEventListener("submit", function (e) {
    var f = e.target, srv = M.srv();
    if (f.matches("[data-sl-sort]")) {
      e.preventDefault();
      var k = f.querySelector('[name="line"]').value, how = f.querySelector('[name="do"]').value;
      if (how === "need") { M.put(k, { state: "open", words: "", by: "" }); delete srv.claims[k]; } else { srv.removed = srv.removed || {}; srv.removed[k] = 1; }
      M.save(); draw();
    } else if (f.matches("[data-sl-cancel]")) {
      e.preventDefault();
      var id = f.querySelector('[name="link"]').value; M.endLink(id, "cancelled"); delete srv.links[id]; srv.order = (srv.order || []).filter(function (x) { return x !== id; }); M.save();
      if (page === "link") location.href = "member-list.html?s=states"; else draw();
    } else if (f.matches("[data-sl-dismiss]")) {
      e.preventDefault();
      var id2 = f.querySelector('[name="link"]').value; delete srv.links[id2]; srv.order = (srv.order || []).filter(function (x) { return x !== id2; }); M.save();
      if (page === "link") location.href = "member-list.html?s=states"; else draw();
    } else if (f.matches("[data-sl-share]")) {
      e.preventDefault();
    }
  });
  // Following a group live (the fragment's try-it): the shoppers' phones change the pretend server and this page redraws.
  if (M.group && q.get("g")) {
    var again = function () { M.reload(); draw(); };
    if (M.chan) M.chan.addEventListener("message", again);
    window.addEventListener("storage", function (e) { if (e.key === M.key) again(); });
  }


})();
