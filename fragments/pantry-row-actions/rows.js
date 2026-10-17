/* MOCK: the desktop Pantry list, the open item's panel and the keys the app already has (J K, Enter or E, comma, U, D, S, Z, Shift Space), with ONE option from the four (and "Today") added on top.
   ?opt=now|a|b|c|d   ?theme=kitchie|kitchie-day   ?input=touch (a touch laptop: no hover)   ?sel=<id> (open item)   ?hover=<id> (draw that row as hovered, for a still)   ?chip=out
   ?state=empty|allout   ?keep=<id,id> (all others used up)   ?down=1 (the "saved list" banner)   ?guard=today   ?cues=0   ?menu=<id> (B)   ?pick=<id,id> (C).
   Only the chosen option's two files are fetched (DESIGN.md section 6): the page loads this file, act.js, sample.js and rows.css, then opt-<x>.css and opt-<x>.js. */
(function () {
  "use strict";
  var P = window.PRA, S = P.state, Q = new URLSearchParams(location.search);
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var OPT = (Q.get("opt") || "a").toLowerCase(); if (["now", "a", "b", "c", "d"].indexOf(OPT) < 0) OPT = "a";
  var th = Q.get("theme"); if (th === "kitchie" || th === "kitchie-day") document.documentElement.setAttribute("data-theme", th);
  var touch = Q.get("input") === "touch" || (window.matchMedia && matchMedia("(hover: none)").matches);
  if (touch) document.documentElement.setAttribute("data-input", "touch");
  if (Q.get("cues") === "0") document.documentElement.setAttribute("data-cues", "off");
  if (Q.get("down")) S.down = true;
  if (Q.get("guard") === "today") S.guard = "today";
  if (Q.get("state") === "empty") S.items = [];
  if (Q.get("state") === "allout") S.items.forEach(function (i) { i.out = true; });
  if (Q.get("keep")) S.items.forEach(function (i) { i.out = Q.get("keep").split(",").indexOf(i.id) < 0; }); /* ?keep=peas: everything else is used up, to show the last item going */
  if (Q.get("guard") === "2" || Q.get("guard") === "today") { S.usedAt = [Date.now() - 1000, Date.now() - 2000]; } /* two used-up just now: the next one hits the guardrail */

  /* line icons on the app's 24px grid */
  var D = { minus: "M5 12h14", check: "M5 12.500l4.200 4.200L19 7", pencil: "M4 20h4L18.500 9.500a2.100 2.100 0 0 0-3-3L5 17z", more: "", cart: "M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2", x: "M6 6l12 12M18 6L6 18", hist: "M12 7v5l3 2" };
  P.icon = function (name) {
    var inner = name === "cart" ? '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="' + D.cart + '"/>' : name === "more" ? '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>' : name === "hist" ? '<circle cx="12" cy="12" r="8"/><path d="' + D.hist + '"/>' : '<path d="' + D[name] + '"/>';
    return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + inner + "</svg>";
  };
  P.mod = /Mac|iPhone|iPad/.test(navigator.platform || "") ? "\u2318" : "Ctrl";
  P.esc = esc; P.Q = Q; P.touch = touch; P.OPT = OPT;
  P.kbd = function (k) { return '<kbd class="kbd">' + esc(k) + "</kbd>"; };

  S.cur = null; S.open = null; S.chip = Q.get("chip") || "All"; S.q = "";
  P.opt = { extra: function () { return ""; }, panelTop: function () { return ""; }, panelBottom: null, key: function () { return false; }, after: function () {}, mount: function () {} };

  P.visible = function () {
    var q = S.q.trim().toLowerCase();
    return S.items.filter(function (i) {
      if (S.chip === "Out") return i.out;
      if (S.chip !== "All" && i.area !== S.chip) return false;
      if (q) return i.name.toLowerCase().indexOf(q) > -1;
      return !i.out;
    });
  };
  function due(i) {
    if (i.out) return '<span class="due">Out</span>';
    if (i.due === undefined) return "";
    return '<span class="due' + (i.due <= 3 ? " hot" : "") + '">Use within<br>' + i.due + " days</span>";
  }
  function rowHtml(i) {
    var hov = Q.get("hover") === i.id ? " is-hover" : "";
    return '<li data-row data-id="' + i.id + '" data-sheet="' + (i.kind ? "1" : "0") + '"' + (i.out ? " data-gone" : "") + (S.cur === i.id ? " data-cur" : "") + ' class="' + hov.trim() + '">' +
      '<a class="rowlink" href="#" draggable="false" data-open="' + i.id + '"' + (S.open === i.id ? ' aria-current="true"' : "") + '><span class="emo" aria-hidden="true">' + i.emoji + '</span><span class="rtxt"><span class="name">' + esc(i.name) + '</span><span class="meta">' + esc(P.left(i) + " · " + i.spot) + "</span></span>" + due(i) + "</a>" +
      P.opt.extra(i) + "</li>";
  }
  function focusKey() { /* where the focus is inside the list, so a redraw can put it back (the app redraws rows in place and keeps focus) */
    var a = document.activeElement, row = a && a.closest ? a.closest("#plist li[data-row]") : null; if (!row) return null;
    return { id: row.dataset.id, sel: a.matches(".rowlink") ? ".rowlink" : a.dataset.do ? '[data-do="' + a.dataset.do + '"]' : a.dataset.sel ? "[data-sel]" : a.classList.contains("rmore") ? ".rmore" : null };
  }
  P.render = function () {
    var fk = focusKey(), items = P.visible(), out = "";
    if (!S.items.length) out = '<div class="emptystate"><b>Nothing here yet.</b><p>Add what is in the kitchen, or scan a receipt.</p><button type="button" class="btn pri" data-toast="Add opens the add panel (unchanged)">Add an item</button></div>';
    else if (!items.length) {
      var outs = S.items.filter(function (i) { return i.out; }).length;
      out = '<div class="emptystate"><b>' + (S.q ? "Nothing matches." : S.chip === "Out" ? "Nothing is used up." : "Nothing in stock.") + "</b><p>" + (S.chip !== "Out" && outs && !S.q ? outs + (outs === 1 ? " item is" : " items are") + " used up. They keep their history." : "Try another place or clear the search.") + '</p>' + (S.chip !== "Out" && outs && !S.q ? '<button type="button" class="btn" data-chip="Out">Show used-up items</button>' : "") + "</div>";
    } else out = ["Fridge", "Pantry", "Freezer"].filter(function (g) { return items.some(function (i) { return i.area === g; }); }).map(function (g) {
      return '<section class="group"><h2>' + g + '</h2><ul class="rows" id="rows-' + g + '">' + items.filter(function (i) { return i.area === g; }).map(rowHtml).join("") + "</ul></section>";
    }).join("");
    $("plist").innerHTML = out;
    var n = P.visible().length;
    $("count").textContent = S.items.length ? n + (n === 1 ? " item" : " items") : "";
    $("slive").textContent = "";
    document.querySelectorAll(".rc2").forEach(function (b) { b.classList.toggle("on", b.dataset.chip === S.chip); b.setAttribute("aria-pressed", String(b.dataset.chip === S.chip)); });
    $("badge").textContent = S.shop.count; $("nv-shop").setAttribute("aria-label", "Shopping, " + S.shop.count + " to get");
    var o = S.items.filter(function (i) { return i.out; }).length; var oc = document.querySelector('[data-chip="Out"] .ct'); if (oc) oc.textContent = o;
    renderPanel(); P.opt.after();
    if (fk && fk.sel) { var again = document.querySelector('#plist li[data-id="' + fk.id + '"] ' + fk.sel); if (again) again.focus({ preventScroll: true }); }
  };
  function renderPanel() {
    var it = S.open && P.item(S.open), el = $("panel");
    var custom = P.opt.panelCustom && P.opt.panelCustom();
    if (custom) { el.innerHTML = custom; return; }
    if (!it) { el.innerHTML = '<div class="pempty"><b>Pick an item to see it here</b><p>Nothing is open.</p></div>'; return; }
    var bottom = P.opt.panelBottom ? P.opt.panelBottom(it) : '<div class="pbtns"><button type="button" class="btn dng" data-do="all" data-id="' + it.id + '"' + (it.out ? ' aria-disabled="true"' : "") + ">" + P.icon("check") + 'Used up</button><button type="button" class="btn" data-do="shop" data-id="' + it.id + '">' + P.icon("cart") + "Add to shopping list</button></div>";
    el.innerHTML = '<div class="ph"><span class="emo" aria-hidden="true">' + it.emoji + "</span><div><h2>" + esc(it.name) + "</h2><p>" + esc(P.left(it)) + " · " + esc(it.area) + " · " + esc(it.spot) + '</p></div><div class="hi"><button type="button" class="pic" data-toast="Edit opens under the item (unchanged)" aria-label="Edit ' + esc(it.name) + '">' + P.icon("pencil") + P.kbd("E") + '</button><button type="button" class="pic" data-toast="History opens beside the item (unchanged)" aria-label="History of ' + esc(it.name) + '">' + P.icon("hist") + P.kbd(",") + "</button></div></div>" +
      P.opt.panelTop(it) +
      '<div class="tiles"><div class="tile2"><b>Level</b><span>' + (it.out ? "Out" : it.kind ? "Plenty" : esc(it.amt)) + '</span></div><div class="tile2"><b>Use by</b><span>' + (it.due ? "in " + it.due + " days" : "Not set") + '</span></div><div class="tile2"><b>Minimum</b><span>' + (it.kind ? "2" : "Not set") + '</span></div><div class="tile2"><b>Category</b><span>' + esc(it.area) + "</span></div></div>" + bottom;
  }
  P.setCur = function (id, open) {
    S.cur = id; if (open !== false) S.open = id; P.render();
    var a = document.querySelector('li[data-id="' + id + '"] .rowlink'); if (a) a.focus({ preventScroll: true });
  };
  P.rows = function () { return Array.prototype.filter.call(document.querySelectorAll("#plist li[data-row]"), function (li) { return li.offsetParent !== null; }); };
  P.target = function () { /* the open row, else the focused row (desktop-pantry.js targetRow) */
    var a = document.activeElement, li = a && a.closest ? a.closest("#plist li[data-row]") : null;
    var id = S.open || (li && li.dataset.id) || S.cur; return id ? P.item(id) : null;
  };
  function move(d) {
    var rows = P.rows(); if (!rows.length) return;
    var ids = rows.map(function (r) { return r.dataset.id; }), i = ids.indexOf(S.open || S.cur);
    i = i < 0 ? (d > 0 ? 0 : ids.length - 1) : Math.max(0, Math.min(ids.length - 1, i + d));
    P.setCur(ids[i], true);
  }
  P.move = move;
  function keyAct(kind) {
    var it = P.target(); if (!it) { P.say("Pick an item first.", false); return; }
    if (kind === "one" && !P.counted(it)) { P.say(it.name + " is not counted, so there is no Use one. Change its level instead.", false); return; }
    var rows = P.rows().map(function (r) { return r.dataset.id; }), at = rows.indexOf(it.id), next = rows[at + 1] || rows[at - 1];
    var r = P.do(kind, it.id);
    if (kind === "all" && r.result === "all") { S.open = S.open === it.id ? next || null : S.open; if (next) P.setCur(next, !!S.open); }
  }
  P.keyAct = keyAct;

  document.addEventListener("keydown", function (e) {
    var t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (e.key === " " && e.shiftKey && !typing && !(t && t.closest && t.closest("button,a"))) { e.preventDefault(); var off = document.documentElement.getAttribute("data-cues") === "off"; if (off) document.documentElement.removeAttribute("data-cues"); else document.documentElement.setAttribute("data-cues", "off"); return; }
    if (typing || e.altKey) return;
    if (P.opt.key(e)) return;
    if (e.ctrlKey || e.metaKey) return;
    var k = e.key.toLowerCase();
    if (k === "j" || k === "arrowdown") { if (t && t.closest && t.closest('[role="menu"]')) return; e.preventDefault(); move(1); }
    else if (k === "k" || k === "arrowup") { if (t && t.closest && t.closest('[role="menu"]')) return; e.preventDefault(); move(-1); }
    else if (k === "u") { e.preventDefault(); keyAct("one"); }
    else if (k === "d") { e.preventDefault(); keyAct("all"); }
    else if (k === "s") { e.preventDefault(); keyAct("shop"); }
    else if (k === "z") { e.preventDefault(); if (!P.undo()) P.say("Nothing to undo.", false); }
    else if (k === "e" || k === ",") { var it = P.target(); if (it && !(t && t.closest && t.closest("button,a") && k === "e" && e.target.tagName === "BUTTON")) { e.preventDefault(); P.say((k === "e" ? "Edit" : "History") + " opens for " + it.name.toLowerCase() + " (unchanged)", false); } }
  });
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-open],[data-do],[data-chip],[data-toast]") : null; if (!el) return;
    if (el.dataset.open) { e.preventDefault(); if (P.opt.rowClick && P.opt.rowClick(el.dataset.open, e)) return; P.setCur(el.dataset.open, true); return; }
    if (el.dataset.do) { e.preventDefault(); if (el.getAttribute("aria-disabled") === "true") return; P.do(el.dataset.do, el.dataset.id); return; }
    if (el.dataset.chip) { S.chip = el.dataset.chip; P.render(); return; }
    if (el.dataset.toast) { P.say(el.dataset.toast, false); }
  });

  function boot() {
    document.querySelectorAll(".mockbar a[data-opt]").forEach(function (a) { var u = new URL(location.href); u.searchParams.set("opt", a.dataset.opt); a.href = u.search; if (a.dataset.opt === OPT) a.setAttribute("aria-current", "true"); });
    var tl = document.querySelector(".mockbar a[data-toggle=input]"); if (tl) { var u2 = new URL(location.href); if (touch) u2.searchParams.delete("input"); else u2.searchParams.set("input", "touch"); tl.href = u2.search; tl.textContent = touch ? "Touch laptop: on" : "Touch laptop: off"; tl.setAttribute("aria-current", String(touch)); }
    var tm = document.querySelector(".mockbar a[data-toggle=theme]"); if (tm) { var u3 = new URL(location.href); var dark = (document.documentElement.getAttribute("data-theme") || "kitchie") === "kitchie"; u3.searchParams.set("theme", dark ? "kitchie-day" : "kitchie"); tm.href = u3.search; tm.textContent = dark ? "Dark" : "Light"; }
    $("q").addEventListener("input", function () { S.q = $("q").value; P.render(); });
    document.querySelectorAll(".rc2").forEach(function (b) { b.addEventListener("click", function () { S.chip = b.dataset.chip; P.render(); }); });
    var sel = Q.get("sel"); if (sel && P.item(sel)) { S.open = sel; S.cur = sel; }
    P.opt.mount(); P.render();
    if (S.down) { var bn = document.createElement("div"); bn.className = "banner"; bn.setAttribute("role", "status"); bn.textContent = "Showing your saved list. Changes will work again shortly."; $("plist").parentNode.insertBefore(bn, $("plist")); }
    document.documentElement.setAttribute("data-ready", "1");
  }
  /* the option's two files, fetched now (and only these) */
  var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "opt-" + OPT + ".css"; document.head.appendChild(l);
  var s = document.createElement("script"); s.src = "opt-" + OPT + ".js";
  s.onload = function () { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot(); };
  s.onerror = boot;
  document.head.appendChild(s);
})();
