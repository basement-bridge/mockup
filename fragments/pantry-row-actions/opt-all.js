/* The decided view (Kitchie #866, owner 17 Oct 2026): A + B + C together. In the app: desktop-pantry.js draws the strip, the menu and the selection bar; every action calls KitchieSwipe.act / shop like a key.
   A  hover buttons (Use one, Add to list, Used up) on the right of a row, each with its key cap.
   B  right click on a row opens the menu (Use one only where valid, Add to shopping list, Used up, then Open), unless the pointer is over the strip: then the page opens nothing and the browser's own menu is left alone.
      There is NO three-dot button. Shift right click keeps the browser's menu; the Menu key and Shift F10 open it on the current row.
   C  Ctrl or Cmd click toggles a row into a selection, Shift click picks a range. The bar shows the count with Add to shopping list and Used up only. Use one is absent whenever more than one row is picked.
      Esc, Clear or Ctrl or Cmd Enter empties it. One Undo reverses the whole batch.
   Reads ?pick=<id,id> (a selection, for stills) and ?menu=<id> or ?menu=pick (the menu open, for stills). */
(function () {
  "use strict";
  var P = window.PRA, S = P.state, $ = function (id) { return document.getElementById(id); };
  var menu, tgt = null, restore = null, openedAt = 0, pick = [], anchor = null, bar;
  P.pick = function () { return pick.slice(); };

  /* what is valid for these rows: Use one for exactly one counted row; Add to list always; Used up when at least one is in stock */
  function acts(ids) {
    var its = ids.map(P.item).filter(Boolean);
    return { one: its.length === 1 && P.counted(its[0]), shop: its.length > 0, all: its.some(function (i) { return !i.out; }), out: its.filter(function (i) { return i.out; }).length };
  }

  /* ---- A: the strip */
  function btn(kind, cls, icon, label, key, id, name, aria) {
    return '<button type="button" class="rb ' + cls + '" data-do="' + kind + '" data-id="' + id + '" aria-label="' + aria + P.esc(name) + '" title="' + label + " (" + key + ')">' + P.icon(icon) + '<span class="lbl">' + label + "</span>" + P.kbd(key) + "</button>";
  }
  P.opt.extra = function (i) {
    return '<div class="ract" role="group" aria-label="' + P.esc(i.name) + ' actions">' +
      (i.kind ? btn("one", "one", "minus", "Use one", "U", i.id, i.name, "Use one of ") : "") +
      btn("shop", "shop", "cart", "Add to list", "S", i.id, i.name, "Add to shopping list: ") +
      btn("all", "all", "check", "Used up", "D", i.id, i.name, "Mark as used up: ") + "</div>" +
      '<span class="rpick">' + P.icon("check") + '<span class="vh">Selected</span></span>';
  };

  /* ---- C: the selection */
  function rowIds() { return P.rows().map(function (r) { return r.dataset.id; }); }
  function toggle(id, on) {
    var at = pick.indexOf(id); if (on === undefined) on = at < 0;
    if (on && at < 0) pick.push(id); if (!on && at > -1) pick.splice(at, 1);
    anchor = id; S.cur = id; close(true); P.render();
  }
  function range(to) {
    var all = rowIds(), from = anchor || S.open || S.cur, a = all.indexOf(from), b = all.indexOf(to);
    if (a < 0 || b < 0) { toggle(to, true); return; }
    all.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(function (x) { if (pick.indexOf(x) < 0) pick.push(x); });
    anchor = to; S.cur = to; close(true); P.render();
  }
  function clear() { pick = []; anchor = null; close(true); P.render(); }
  P.opt.rowClick = function (id, e) {
    if (e.ctrlKey || e.metaKey) { toggle(id); return true; }          /* the row is a real link: Ctrl or Cmd click no longer opens a new tab (DA-P17) */
    if (e.shiftKey) { range(id); return true; }
    if (pick.length) { toggle(id); return true; }                     /* while rows are picked a plain click picks or unpicks (DA-P12); with none it opens the item as today */
    return false;
  };
  function sync() {
    var vis = P.visible().map(function (i) { return i.id; });
    pick = pick.filter(function (id) { return vis.indexOf(id) > -1; });
    var l = $("plist"), col = $("col"); if (!l) return;
    if (pick.length) { l.setAttribute("data-selecting", ""); col.setAttribute("data-selecting", ""); } else { l.removeAttribute("data-selecting"); col.removeAttribute("data-selecting"); }
    pick.forEach(function (id) { var li = l.querySelector('li[data-id="' + id + '"]'); if (li) li.setAttribute("data-picked", ""); });
    var n = pick.length; bar.hidden = !n; if (!n) { bar.innerHTML = ""; return; }
    var a = acts(pick), sub = n === 1 ? P.mod + " click adds more rows" : a.out ? "Used up applies to " + (n - a.out) + " of " + n + " (the rest are out)" : "Use one is off for several rows";
    bar.innerHTML = '<div class="cnt" title="' + P.esc(sub) + '"><b role="status">' + n + " selected</b><span>" + P.esc(sub) + "</span></div>" +
      (a.one ? '<button type="button" class="btn" data-bulk="one">Use one ' + P.kbd("U") + "</button>" : "") +
      '<button type="button" class="btn" data-bulk="shop">Add to shopping list ' + P.kbd("S") + "</button>" +
      (a.all ? '<button type="button" class="btn dng" data-bulk="all">Used up ' + P.kbd("D") + "</button>" : "") +
      '<button type="button" class="btn clr" data-bulk="clear" title="Clear the selection (Esc)" aria-label="Clear the selection">' + P.icon("x") + '<span class="t">Clear</span> ' + P.kbd("Esc") + "</button>";
  }
  /* one call per batch; a batch of several counts as ONE deliberate used-up for the guardrail (opts.batch, act.js) and the sentence names how many were done; one Undo reverses it all */
  function doNow(kind, ids) {
    var many = ids.length > 1, r = P.do(kind, many ? ids : ids[0], { batch: many });
    if (r.ids && pick.length) { pick = []; anchor = null; P.render(); }
    return r;
  }
  function bulk(kind) {
    if (!pick.length) return;
    if (kind === "clear") { clear(); return; }
    doNow(kind, pick.slice());
  }

  /* ---- B: the context menu */
  function mi(act, icon, label, key) { return '<button type="button" role="menuitem" class="mi ' + act + '" data-m="' + act + '">' + P.icon(icon) + '<span class="lb">' + label + "</span>" + P.kbd(key) + "</button>"; }
  function open(ids, x, y) {
    var its = ids.map(P.item).filter(Boolean); if (!its.length) return;
    close(true); tgt = ids.slice(); restore = document.activeElement;
    ids.forEach(function (id) { var li = document.querySelector('li[data-id="' + id + '"]'); if (li) li.setAttribute("data-menu", ""); });
    var a = acts(ids), many = ids.length > 1;
    menu.innerHTML = '<div class="mh">' + P.esc(many ? ids.length + " selected" : its[0].name) + "</div>" +
      (a.one ? mi("one", "minus", "Use one", "U") : "") + mi("shop", "cart", "Add to shopping list", "S") + (a.all ? mi("all", "check", "Used up", "D") : "") +
      (many ? "" : "<hr>" + mi("open", "open", "Open", "Enter")) + '<div class="mf">' + P.mod + " Enter closes</div>";
    menu.hidden = false; openedAt = Date.now();
    var w = menu.offsetWidth, h = menu.offsetHeight;
    menu.style.left = Math.max(8, Math.min(x, innerWidth - w - 8)) + "px"; menu.style.top = Math.max(8, Math.min(y, innerHeight - h - 8)) + "px";
    var first = menu.querySelector(".mi"); if (first) first.focus();
  }
  function close(silent) {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    document.querySelectorAll("li[data-menu]").forEach(function (l) { l.removeAttribute("data-menu"); });
    if (!silent && restore && restore.focus && document.contains(restore)) restore.focus();
    tgt = null;
  }
  function run(m) {
    var ids = tgt; close(true);
    if (m === "open") { P.setCur(ids[0], true); return; }
    doNow(m, ids);
    var back = document.querySelector("#plist li[data-row] .rowlink"); if (back) back.focus({ preventScroll: true });
  }
  function openOnRow(ids) { var li = document.querySelector('li[data-id="' + ids[0] + '"]'); if (!li) return; var r = li.getBoundingClientRect(); open(ids, r.left + 120, r.top + 30); }

  P.opt.mount = function () {
    bar = document.createElement("div"); bar.className = "selbar"; bar.id = "selbar"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Selection"); bar.hidden = true; $("col").appendChild(bar);
    menu = document.createElement("div"); menu.className = "rmenu"; menu.setAttribute("role", "menu"); menu.setAttribute("aria-label", "Item actions"); menu.hidden = true; document.body.appendChild(menu);
    document.addEventListener("contextmenu", function (e) {
      var li = e.target.closest && e.target.closest("#plist li[data-row]"); if (!li || e.shiftKey) return; /* Shift right click: the browser's own menu */
      if (e.target.closest(".ract")) return;      /* over the hover buttons: the page opens no menu (the person is driving from the buttons) */
      e.preventDefault();
      open(pick.length ? pick.slice() : [li.dataset.id], e.clientX, e.clientY);
    });
    document.addEventListener("click", function (e) {
      var m = e.target.closest && e.target.closest(".rmenu .mi"); if (m) { e.preventDefault(); run(m.dataset.m); return; }
      var b = e.target.closest && e.target.closest("[data-bulk]"); if (b) { e.preventDefault(); bulk(b.dataset.bulk); return; }
      if (!menu.hidden && !(e.target.closest && e.target.closest(".rmenu"))) close(true);
    }, true);
    window.addEventListener("scroll", function () { if (Date.now() - openedAt > 400) close(true); }, true);
    (P.Q.get("pick") || "").split(",").filter(function (x) { return P.item(x); }).forEach(function (x) { pick.push(x); });
    var mq = P.Q.get("menu");
    if (mq) setTimeout(function () { if (mq === "pick" && pick.length) openOnRow(pick); else if (P.item(mq)) openOnRow([mq]); }, 0);
  };

  P.opt.key = function (e) {
    var k = e.key;
    if (menu && !menu.hidden) {
      var items = Array.prototype.slice.call(menu.querySelectorAll(".mi")), at = items.indexOf(document.activeElement);
      if ((e.ctrlKey || e.metaKey) && k === "Enter") { e.preventDefault(); close(); return true; }
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") { e.preventDefault(); var n = k === "Home" ? 0 : k === "End" ? items.length - 1 : (at + (k === "ArrowDown" ? 1 : -1) + items.length) % items.length; items[n].focus(); return true; }
      if (k === "Enter" || k === " ") { e.preventDefault(); if (document.activeElement.dataset.m) run(document.activeElement.dataset.m); return true; }
      var map = { u: "one", d: "all", s: "shop" }, key = k.toLowerCase();
      if (map[key] && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (menu.querySelector('[data-m="' + map[key] + '"]')) run(map[key]); else P.say(map[key] === "one" ? "Use one is not offered here" : "Not offered here", false); return true; }
      if (k === "Tab") { e.preventDefault(); return true; }
      return true; /* every other key is swallowed while the menu is open */
    }
    if (k === "ContextMenu" || (k === "F10" && e.shiftKey)) {
      var it = P.target(); var ids = pick.length ? pick.slice() : it ? [it.id] : []; if (!ids.length) return false; e.preventDefault(); openOnRow(ids); return true;
    }
    if (pick.length) {
      if ((e.ctrlKey || e.metaKey) && k === "Enter") { e.preventDefault(); clear(); return true; }
      if (k === "Escape") { e.preventDefault(); clear(); return true; }
      if (!e.ctrlKey && !e.metaKey) {
        var lk = k.toLowerCase();
        if (lk === "u") { e.preventDefault(); if (pick.length > 1) P.say("Use one is only for a single row. Several rows can be added to the list or used up.", false); else if (!P.counted(P.item(pick[0]))) P.say(P.item(pick[0]).name + " is not counted, so there is no Use one. Change its level instead.", false); else doNow("one", pick.slice()); return true; }
        if (lk === "d" || lk === "s") { e.preventDefault(); doNow(lk === "d" ? "all" : "shop", pick.slice()); return true; }
      }
    }
    return false;
  };

  /* ---- the open item's panel: Use one is added beside Add to shopping list and Used up (the item sheet's words), each with its key cap */
  P.opt.panelBottom = function (i) {
    var gone = i.out, counted = P.counted(i);
    return '<div class="pbtns caps"><button type="button" class="btn one" data-do="one" data-id="' + i.id + '"' + (!counted ? ' aria-disabled="true"' : "") + '><span class="l">' + P.icon("minus") + "Use one</span>" + P.kbd("U") + "</button>" +
      (!counted && !gone ? '<p class="why">Not counted, so no Use one. Change its level instead.</p>' : "") +
      '<button type="button" class="btn shop" data-do="shop" data-id="' + i.id + '"><span class="l">' + P.icon("cart") + "Add to shopping list</span>" + P.kbd("S") + "</button>" +
      '<button type="button" class="btn all dng" data-do="all" data-id="' + i.id + '"' + (gone ? ' aria-disabled="true"' : "") + '><span class="l">' + P.icon("check") + "Used up</span>" + P.kbd("D") + "</button></div>";
  };
  P.opt.after = function () {
    sync();
    if (tgt && menu && !menu.hidden && !tgt.every(function (id) { return document.querySelector('li[data-id="' + id + '"]'); })) close(true);
  };
})();
