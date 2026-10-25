/* Home cards (kitchie #1238), mockup engine. Phone only. Three ways to do the same job; ?way=a|b|c &state=... (see index.html).
   The saved shape is the proposal for the build and is DEVICE ONLY (design-principles "Preferences are client-side"): {v:1, order:[ids], hidden:[ids]} under localStorage key kitchie.home.cards.
   This page keeps it in memory so a reviewer's taps never leak between visits; the build writes the same shape, every access guarded.
   Gestures follow DESIGN.md section 8: long hold = 480 ms and moves; double tap resets; every move also has buttons (keyboard) and a switch (tap). */
(function () {
  "use strict";
  var Q = new URLSearchParams(location.search), way = /^[abc]$/.test(Q.get("way") || "") ? Q.get("way") : "a", state = Q.get("state") || "";
  var HOLD = 480, MOVE_CANCEL = 10, UNDO_MS = 5000;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var P = {
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', basket: '<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>',
    chef: '<path d="M7 14.5a4 4 0 1 1 1.2-7.8 4.2 4.2 0 0 1 7.6 0A4 4 0 1 1 17 14.5V19H7z"/><path d="M7 16.5h10"/>', plan: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    grip: '<circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>',
    eyeoff: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.6"/><path d="M4 4l16 16"/>', undo: '<path d="M9 7L4.5 11.5 9 16M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', alert: '<path d="M12 3.5 22 20.5H2z"/><path d="M12 10v5M12 17.6v.4"/>',
    home: '<path d="M4 11l8-7 8 7v8.5a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>', jar: '<path d="M8 4h8v3H8zM7 7h10v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19z"/><path d="M7 12h10"/>',
    book: '<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>', cart: '<path d="M3.5 4.5h2.4l2 10.5h9.6l1.8-7.5H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>',
    swap: '<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>', chev: '<path d="M9 5l7 7-7 7"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5.8 2.2 1.5 2.2C10.5 8 11 5.5 12 3z"/>'
  };
  function ic(n, extra) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"' + (extra || "") + ">" + P[n] + "</svg>"; }

  /* ---------- the cards. Phone Home draws three today (kitchie origin/uat cd7fdb6): the Cooking ideas hero (More ideas is part of it), On the way out, Running low. The greeting row is not a card. ---------- */
  var CARDS = [
    { id: "ideas", name: "Cooking ideas", icon: "chef", needs: "recipe" },
    { id: "soon", name: "On the way out", icon: "clock" },
    { id: "low", name: "Running low", icon: "basket" },
    { id: "week", name: "This week", icon: "plan", future: true } /* an EXAMPLE of a card a later release adds; not in the app today */
  ];
  var DEFAULT = ["ideas", "soon", "low", "week"];
  var S = { order: DEFAULT.slice(), hidden: [], recipe: true, hasFuture: false, newSeen: true, soon: [["Milk", "Fridge", "1 L", -2], ["Spinach", "Fridge", "1 bag", 1], ["Yoghurt", "Fridge", "2 pots", 3], ["Cheddar", "Fridge", "200 g", 6]], low: [["Eggs", "🥚", "2 left", 1], ["Olive oil", "🫒", "Low", 0], ["Rice", "🍚", "300 g", 0]], sheet: false, edit: false, toast: null, resetNote: false };
  var SC = {
    moved: { order: ["soon", "low", "ideas", "week"] }, hidden: { hidden: ["low"] }, hold: { fold: "ideas" }, urgent: { hidden: ["soon"] }, empty: { order: ["low", "ideas", "soon", "week"], low: [] },
    sheet: { sheet: true }, sheetmoved: { sheet: true, order: ["soon", "low", "ideas", "week"], hidden: ["low"] }, "new": { sheet: true, hasFuture: true, newSeen: false, order: ["soon", "low", "ideas"] }, norecipe: { sheet: true, recipe: false }, reset: { sheet: true, resetNote: true },
    edit: { edit: true }, edithidden: { edit: true, hidden: ["soon"], order: ["low", "ideas", "soon", "week"] }, entry: {}
  };
  if (SC[state]) Object.keys(SC[state]).forEach(function (k) { S[k] = SC[state][k]; });
  if (state === "urgent") { /* the urgent-flag case needs a past use-by in the data; Milk is -2D above */ }
  if (state === "quiet") { S.hidden = ["soon"]; S.soon = [["Yoghurt", "Fridge", "2 pots", 3]]; }

  function known() { return CARDS.filter(function (c) { return (c.future ? S.hasFuture : true) && (c.needs !== "recipe" || S.recipe); }); }
  function has(id) { return id === "ideas" ? S.recipe : id === "soon" ? S.soon.some(function (r) { return r[3] <= 7; }) : id === "low" ? S.low.length > 0 : id === "week" ? S.hasFuture : false; }
  /* A card a stored order does not know yet (a later release) goes in its DEFAULT place: right after the card that precedes it by default. */
  function orderNow() {
    var ids = known().map(function (c) { return c.id; }), out = S.order.filter(function (i) { return ids.indexOf(i) > -1; });
    ids.forEach(function (i) {
      if (out.indexOf(i) > -1) return;
      var d = DEFAULT.indexOf(i), prev = null; for (var k = d - 1; k >= 0; k--) if (out.indexOf(DEFAULT[k]) > -1) { prev = DEFAULT[k]; break; }
      out.splice(prev === null ? 0 : out.indexOf(prev) + 1, 0, i);
    });
    return out;
  }
  function card(id) { return CARDS.filter(function (c) { return c.id === id; })[0]; }
  function isHidden(id) { return S.hidden.indexOf(id) > -1; }
  function urgentOut() { return S.soon.filter(function (r) { return r[3] <= 0; }); }
  function customised() { return S.hidden.length > 0 || orderNow().join() !== known().map(function (c) { return c.id; }).join(); }

  /* ---------- sample markup in the app's own classes ---------- */
  function ub(d) { var t = d < 0 ? "−" + (-d) + "D" : d === 0 ? "Today" : d < 7 ? d + "D" : "1W", tone = d < 0 ? "danger" : d <= 3 ? "accent" : "mut"; return '<span class="ub ub-' + tone + '" role="img" aria-label="' + (d < 0 ? -d + " days past use by" : d === 0 ? "Use today" : "Use within " + d + " days") + '">' + t + "</span>"; }
  function kb(c) { return '<span class="hc-kb" role="group" aria-label="Move or hide ' + c.name + '"><button type="button" data-k="up">Move up</button><button type="button" data-k="down">Move down</button><button type="button" data-k="hide">Hide</button></span>'; }
  function band(c) { return '<div class="hc-band">' + '<span class="hc-grip" aria-hidden="true">' + ic("grip") + '</span><span class="hc-bi" aria-hidden="true">' + ic(c.icon) + "</span><b>" + c.name + "</b></div>"; }
  function edbar(c) {
    return '<div class="hc-ed"><span class="hc-grip" data-grip aria-label="Move ' + c.name + '" role="button" tabindex="0">' + ic("grip") + "</span><b>" + c.name + '</b><label class="sw"><input type="checkbox" role="switch" data-sw="' + c.id + '"' + (isHidden(c.id) ? "" : " checked") + ' aria-label="Show ' + c.name + '"><i class="swt" aria-hidden="true"></i></label></div>';
  }
  function body(id) {
    if (id === "ideas") return '<div class="hm-top hc-hold" data-hold><span class="r-lead th" aria-hidden="true">🍄</span><div class="hm-it"><span class="hm-k">Tonight</span><b><a href="#">Mushroom omelette</a></b><small>20 min · uses spinach</small></div></div><div class="hm-acts"><button type="button" class="hb mk acc">' + ic("flame") + '<span class="hb-l">Make it</span></button><button type="button" class="hb sw">' + ic("swap") + '<span class="hb-l">Swap</span></button></div>'
      + '<ul class="hm-more mi-rows" id="hm-more"><li><a class="mi-b" href="#"><span class="mi-e">🍝</span><span class="mi-t"><b>Lemon pasta</b><small>25 min</small></span></a></li><li><a class="mi-b" href="#"><span class="mi-e">🥘</span><span class="mi-t"><b>Chickpea stew</b><small>35 min</small></span></a></li></ul>';
    var c = card(id), h = '<div class="hm-h hc-hold" data-hold><span class="hm-i">' + ic(c.icon) + "</span><h2>" + c.name + "</h2></div>";
    if (id === "soon") return h + '<ul class="oc-track">' + S.soon.filter(function (r) { return r[3] <= 7; }).map(function (r) { return '<li class="oc"><a class="oc-b" href="#"><span class="oc-t"><span class="oc-1"><b>' + r[0] + "</b>" + ub(r[3]) + '</span><span class="oc-2"><small>' + r[1] + '</small><span class="oc-q">' + r[2] + "</span></span></span></a></li>"; }).join("") + "</ul>";
    if (id === "low") return h + '<ul class="rows hm-low-rows">' + S.low.map(function (r, i) { return '<li class="r lw"><a class="r-main" href="#" aria-label="' + r[0] + ", " + r[2] + '"><span class="r-lead" aria-hidden="true"><span>' + r[1] + '</span></span><span class="r-text"><b class="r-name"><span class="nm">' + r[0] + '</span></b></span><span class="lw-q">' + r[2] + '</span><span class="lw-c' + (i === 0 ? " on" : "") + '" role="img" aria-label="' + (i === 0 ? "On the shopping list" : "Not on the list") + '">' + '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 4.5h2.4l2 10.5h9.6l1.8-7.5H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/></svg></span></a></li>'; }).join("") + "</ul>";
    return h + '<ul class="oc-track"><li class="oc"><a class="oc-b" href="#"><span class="oc-t"><span class="oc-1"><b>Thu</b></span><span class="oc-2"><small>Lentil dal</small></span></span></a></li><li class="oc"><a class="oc-b" href="#"><span class="oc-t"><span class="oc-1"><b>Fri</b></span><span class="oc-2"><small>Pizza night</small></span></span></a></li></ul>';
  }

  /* ---------- Home ---------- */
  function homeHtml() {
    var h = '<div class="mh-bar"><h1 class="greeting">' + (way === "c" && S.edit ? "Home cards" : "Good evening, Sam.") + "</h1>";
    if (way === "c" && S.edit) h += '<button type="button" class="hc-eb" data-a="reset" aria-label="Reset to default"' + (customised() ? "" : " disabled") + ">" + ic("undo") + '</button><button type="button" class="hc-eb acc" data-a="done">Done</button>';
    else { if (way === "c") h += '<button type="button" class="hc-eb" data-a="edit">Edit</button>'; h += '<button type="button" class="icon mh-sb" aria-label="Search">' + ic("search") + "</button>"; }
    h += "</div>";
    var ord = orderNow(), shown = ord.filter(function (id) { return S.edit ? true : !isHidden(id) && has(id); }), n = 0, flagged = false;
    shown.forEach(function (id) {
      var c = card(id), off = isHidden(id), cls = id === "ideas" ? "hm-hero" : "hm-sec hm-" + (id === "soon" ? "out" : id);
      h += '<section class="' + cls + " hc-card" + '" data-card="' + id + '"' + (off ? " data-off" : "") + (S.fold === id ? " data-lift" : "") + ' aria-label="' + c.name + '">' + band(c) + (way === "c" ? edbar(c) : "") + body(id) + (way === "a" ? kb(c) : "") + "</section>";
      n++;
    });
    if (!S.edit && isHidden("soon") && urgentOut().length) {
      var u = urgentOut().length; flagged = true;
      h += '<a class="hc-flag" href="#" data-flag>' + ic("alert") + "<span>On the way out</span><em>−" + Math.max.apply(null, urgentOut().map(function (r) { return -r[3]; })) + "D · " + u + "</em></a>";
    }
    if (!S.edit && way !== "c" && (way === "a" || false) && S.hidden.length) h += '<div class="hc-foot"><button type="button" class="hc-chip" data-a="sheet">' + ic("eyeoff") + S.hidden.length + " hidden</button></div>";
    if (!S.edit && way === "c" && S.hidden.length) h += '<div class="hc-foot"><button type="button" class="hc-chip" data-a="edit">' + ic("eyeoff") + S.hidden.length + " hidden</button></div>";
    return h;
  }
  function sheetHtml() {
    var ord = orderNow();
    return '<div class="hc-dim" data-a="close"></div><div class="hc-sheet hc" role="dialog" aria-label="Home cards"><div class="hc-sh"><h2>Home cards</h2>' + (customised() ? '<button type="button" class="hc-btn" data-a="reset">' + ic("undo") + "Reset</button>" : "") + '<button type="button" class="hc-btn" data-a="close">Done</button></div><ul class="hc-list" id="hc-list">'
      + ord.map(function (id) {
        var c = card(id), off = isHidden(id), emp = !has(id) && id !== "ideas", fresh = c.future && !S.newSeen;
        return '<li class="hc-row" data-card="' + id + '"' + (off ? " data-off" : "") + ' tabindex="0"><span class="hc-grip" aria-hidden="true">' + ic("grip") + '</span><span class="hc-bi" aria-hidden="true">' + ic(c.icon) + '</span><span class="hc-t"><b>' + c.name + "</b>" + (emp || fresh ? "<small>" + (fresh ? '<span class="hc-new">New</span>' : "Empty now") + "</small>" : "") + "</span>"
          + '<label class="sw"><input type="checkbox" role="switch" data-sw="' + id + '"' + (off ? "" : " checked") + ' aria-label="Show ' + c.name + '"><i class="swt" aria-hidden="true"></i></label>' + kb(c).replace("hc-kb", "hc-kb") + "</li>";
      }).join("") + '</ul><div class="hc-sf"><span class="dev">' + ic("phone") + "This phone only</span></div></div>";
  }
  function entryHtml() {
    return '<div class="mh-bar"><h1 class="greeting">Looks</h1></div><ul class="hc-set hc"><li><span>Theme</span><small>Kitchie</small></li><li><span>Text size</span><small>Match my phone</small></li><li class="me" data-a="sheet" tabindex="0" role="button"><span class="hc-bi" aria-hidden="true" style="display:inline-flex;width:2.125rem;height:2.125rem;align-items:center;justify-content:center">' + ic("sliders") + "</span><span>Home cards</span><small>" + (known().length - S.hidden.length) + " of " + known().length + "</small>" + ic("chev") + "</li></ul>";
  }

  /* ---------- draw ---------- */
  var ph, bodyEl, hm;
  function draw() {
    var top = bodyEl ? bodyEl.scrollTop : 0;
    var entry = state === "entry" && !S.sheet;
    bodyEl.innerHTML = '<div class="hm hc" id="hm"' + (S.fold ? " data-fold" : "") + (S.edit ? " data-edit" : "") + (entry ? "" : "") + ">" + (entry ? entryHtml() : homeHtml()) + "</div>";
    hm = $("#hm"); bodyEl.scrollTop = top;
    var old = $(".hc-dim", ph); if (old) { old.remove(); $(".hc-sheet", ph).remove(); }
    if (S.sheet) { var w = document.createElement("div"); w.innerHTML = sheetHtml(); while (w.firstChild) ph.appendChild(w.firstChild); S.newSeen = true; }
    if (S.sheet) ph.setAttribute("data-sheet", ""); else ph.removeAttribute("data-sheet");
    var hd = $(".hc-hide", ph); if (hd) hd.removeAttribute("data-on");
    if (S.fold) hd && hd.setAttribute("data-on", "1");
    var t = $(".hc-undo", ph);
    if (S.resetNote) { toast("Back to default", false); S.resetNote = false; }
    if (state === "hold" && S.fold) { var lc = $('[data-card="ideas"]', ph), lo = $('[data-card="low"]', ph); if (lc) { lc.style.transform = "translateY(150px)"; lo && lo.classList.add("dz-end"); } }
    if (!S.toast && t) t.hidden = true;
  }
  var tt = 0, undoFn = null;
  function toast(text, undo, fn) {
    var t = $(".hc-undo", ph); t.querySelector("span").textContent = text; undoFn = fn || null; t.querySelector("button").hidden = !undo; t.hidden = false; S.toast = text;
    clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; S.toast = null; undoFn = null; }, UNDO_MS);
  }
  function snap() { return JSON.stringify({ o: S.order.slice(), h: S.hidden.slice() }); }
  function restore(s) { var v = JSON.parse(s); S.order = v.o; S.hidden = v.h; draw(); }
  function change(text, fn) { var before = snap(); fn(); draw(); toast(text, true, function () { restore(before); }); }
  function buzz() { try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) { /* no buzz */ } }

  /* ---------- the drag engine: hold (A bands, B rows) or grip (C) lifts one item; the others stay put; a line shows where it will land ---------- */
  function drag(container, selector, startEl, e, opts) {
    var items = $$(selector, container), me = startEl, y0 = e.clientY, id = e.pointerId, lifted = false, timer = 0, moved = false, over = false, hide = $(".hc-hide", ph);
    function lift() { lifted = true; me.setAttribute("data-lift", ""); buzz(); if (opts.onLift) opts.onLift(); items = $$(selector, container); var rr = me.getBoundingClientRect(); if (opts.onLift) y0 = rr.top + rr.height / 2; try { container.setPointerCapture(id); } catch (x) { /* ok */ } bodyEl.setAttribute("data-lock", ""); }
    function target(cy) { var others = items.filter(function (i) { return i !== me; }), idx = 0; others.forEach(function (i, k) { var r = i.getBoundingClientRect(); if (cy > r.top + r.height / 2) idx = k + 1; }); return { idx: idx, others: others }; }
    function mark(cy) { var t = target(cy); items.forEach(function (i) { i.classList.remove("dz-before", "dz-end"); }); if (t.idx < t.others.length) t.others[t.idx].classList.add("dz-before"); else if (t.others.length) t.others[t.others.length - 1].classList.add("dz-end"); return t; }
    function move(ev) {
      if (ev.pointerId !== id) return;
      var dy = ev.clientY - y0;
      if (!lifted) { if (Math.abs(dy) > MOVE_CANCEL || Math.abs(ev.clientX - e.clientX) > MOVE_CANCEL) { if (opts.delay) cancel(); else lift(); } else return; }
      if (!lifted) return;
      moved = true; me.style.transform = "translateY(" + dy + "px)"; me.style.pointerEvents = "none";
      var r = hide && hide.hasAttribute("data-on") ? hide.getBoundingClientRect() : null;
      over = !!r && ev.clientY > r.top && ev.clientY < r.bottom; if (hide) { over ? hide.setAttribute("data-over", "") : hide.removeAttribute("data-over"); }
      mark(me.getBoundingClientRect().top + me.getBoundingClientRect().height / 2);
      if (ev.cancelable) ev.preventDefault();
    }
    function tm(ev) { if (lifted && ev.cancelable) ev.preventDefault(); }
    function end(ev) {
      if (ev && ev.pointerId !== id) return;
      clearTimeout(timer); cleanup();
      if (!lifted) return;
      var cy = me.getBoundingClientRect().top + me.getBoundingClientRect().height / 2, t = target(cy), ids = t.others.map(function (i) { return i.getAttribute("data-card"); });
      ids.splice(t.idx, 0, me.getAttribute("data-card"));
      me.style.transform = ""; me.style.pointerEvents = ""; me.removeAttribute("data-lift"); items.forEach(function (i) { i.classList.remove("dz-before", "dz-end"); });
      swallow = Date.now() + 350;
      opts.onDrop(moved ? ids : null, over && moved);
    }
    function cancel() { clearTimeout(timer); cleanup(); }
    function cleanup() { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); window.removeEventListener("touchmove", tm); bodyEl.removeAttribute("data-lock"); if (hide) hide.removeAttribute("data-over"); }
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end); window.addEventListener("touchmove", tm, { passive: false });
    if (opts.delay) timer = setTimeout(lift, HOLD);
  }
  var swallow = 0;
  /* put the dragged visible order into the slots the visible cards held; hidden or empty cards keep theirs */
  function applyVisible(ids) { var full = orderNow(), vis = ids.filter(function (i) { return full.indexOf(i) > -1; }), k = 0, rest = full.map(function (i) { return ids.indexOf(i) > -1 ? vis[k++] : i; }); S.order = rest; }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) { if (Date.now() < swallow) { e.preventDefault(); e.stopPropagation(); } }, true);
  function bind() {
    ph.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      var h = e.target.closest("[data-hold]");
      if (way === "a" && h && hm && !S.edit && !S.sheet) { /* hold a card: all fold to bands, drag, drop on Hide */
        var c = h.closest("[data-card]");
        drag(hm, ".hc-card", c, e, { delay: true, onLift: function () { S.fold = c.getAttribute("data-card"); hm.setAttribute("data-fold", ""); $(".hc-hide", ph).setAttribute("data-on", "1"); },
          onDrop: function (ids, hid) { S.fold = null; var before = snap(); if (!ids) { draw(); return; } var id = c.getAttribute("data-card"); if (hid) { S.hidden.push(id); } else applyVisible(ids); draw(); toast(hid ? "Hidden" : "Moved", true, function () { restore(before); }); } });
      }
      var g = e.target.closest("[data-grip]");
      if (way === "c" && S.edit && g) { var cd = g.closest("[data-card]"); e.preventDefault(); drag(hm, ".hc-card", cd, e, { delay: false, onDrop: function (ids) { if (!ids) { draw(); return; } var before = snap(); S.order = ids; draw(); toast("Moved", true, function () { restore(before); }); } }); }
      var row = e.target.closest(".hc-row");
      if (S.sheet && row && !e.target.closest(".sw")) { var list = $("#hc-list"); drag(list, ".hc-row", row, e, { delay: true, onDrop: function (ids) { if (!ids) { draw(); return; } var before = snap(); S.order = ids; draw(); toast("Moved", true, function () { restore(before); }); } }); }
    });
    ph.addEventListener("contextmenu", function (e) { if (e.target.closest("[data-hold],.hc-row")) e.preventDefault(); });
    ph.addEventListener("change", function (e) {
      var s = e.target.closest("[data-sw]"); if (!s) return; var id = s.getAttribute("data-sw"), on = s.checked;
      change(on ? "Shown" : "Hidden", function () { var i = S.hidden.indexOf(id); if (on && i > -1) S.hidden.splice(i, 1); if (!on && i < 0) S.hidden.push(id); });
    });
    var lastTap = 0, lastRow = null;
    ph.addEventListener("click", function (e) {
      var a = e.target.closest("[data-a]"), k = e.target.closest("[data-k]");
      if (k) { var cd = k.closest("[data-card]"), id = cd.getAttribute("data-card"), kk = k.getAttribute("data-k"), ord = orderNow().filter(function (i) { return S.sheet ? true : !isHidden(i) && has(i); }), ix = ord.indexOf(id);
        change(kk === "hide" ? "Hidden" : "Moved", function () { if (kk === "hide") S.hidden.push(id); else { var j = ix + (kk === "up" ? -1 : 1); if (j < 0 || j >= ord.length) return; ord.splice(ix, 1); ord.splice(j, 0, id); applyVisible(ord); } }); return; }
      var row = e.target.closest(".hc-row");
      if (row && !e.target.closest(".sw") && !e.target.closest(".hc-kb")) { /* double tap resets this card: back on, back in its default place */
        var now = Date.now(), id2 = row.getAttribute("data-card");
        if (lastRow === id2 && now - lastTap < 340) { change("Back to default", function () { var i = S.hidden.indexOf(id2); if (i > -1) S.hidden.splice(i, 1); var d = DEFAULT.filter(function (x) { return orderNow().indexOf(x) > -1; }), cur = orderNow().filter(function (x) { return x !== id2; }), pos = d.indexOf(id2), prev = null; for (var q = pos - 1; q >= 0; q--) if (cur.indexOf(d[q]) > -1) { prev = d[q]; break; } cur.splice(prev === null ? 0 : cur.indexOf(prev) + 1, 0, id2); S.order = cur; }); lastRow = null; return; }
        lastRow = id2; lastTap = now;
      }
      if (!a) return;
      var act = a.getAttribute("data-a");
      if (act === "sheet") { S.sheet = true; draw(); }
      else if (act === "close") { S.sheet = false; if (state === "entry") { } draw(); }
      else if (act === "edit") { S.edit = true; draw(); }
      else if (act === "done") { S.edit = false; draw(); }
      else if (act === "reset") { change("Back to default", function () { S.order = DEFAULT.slice(); S.hidden = []; }); }
    });
    ph.addEventListener("keydown", function (e) {
      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { var c = e.target.closest("[data-card]"); if (!c) return; e.preventDefault(); var b = c.querySelector('[data-k="' + (e.key === "ArrowUp" ? "up" : "down") + '"]'); if (b) b.click(); }
      if (e.key === "Escape" && S.sheet) { S.sheet = false; draw(); }
    });
    $(".hc-undo button", ph).addEventListener("click", function () { var f = undoFn; $(".hc-undo", ph).hidden = true; undoFn = null; if (f) f(); });
  }

  /* ---------- mount ---------- */
  var TABS = [["Home", "home"], ["Pantry", "jar"], ["Plan", "plan"], ["Recipes", "book"], ["Shopping", "cart"]];
  function mount() {
    ph = $("#ph");
    ph.innerHTML = '<div class="hw-body" id="hwb"></div><nav class="hw-tabs" aria-label="Main">' + TABS.map(function (t) { return '<a href="#" class="' + (t[0] === "Home" && state !== "entry" ? "on" : t[0] === "Home" ? "" : "") + '"' + (t[0] === "Home" && state !== "entry" ? ' aria-current="page"' : "") + ">" + ic(t[1]) + "<span>" + t[0] + "</span></a>"; }).join("") + '</nav><div class="hc-hide" aria-hidden="true">' + ic("eyeoff") + 'Hide</div><div class="hc-undo" role="status" hidden><span></span><button type="button">Undo</button></div>';
    bodyEl = $("#hwb"); bind(); draw();
  }
  window.HW = { mount: mount };
})();
