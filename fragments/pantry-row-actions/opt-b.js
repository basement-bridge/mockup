/* Option B: a context menu on the row (Kitchie #866). One menu element for the whole list, filled for the row it opens on. Right click (the browser's own menu stays on Shift right click), the Menu key
   or Shift F10 on the current row, or the three-dot button. Arrow keys, Home, End and Enter work inside; the letters U D S E and comma are the same keys as outside. The owner's close rule (Ctrl or Cmd Enter,
   DESIGN handover section 1) closes it, as does a click outside or choosing an entry; plain Escape is NOT used (open question DA-Q9). Every entry calls KitchieSwipe.act / shop like a key. */
(function () {
  "use strict";
  var P = window.PRA, menu, tgt = null, restore = null, openedAt = 0;
  function mi(act, icon, label, key, i, extra) {
    var dis = act === "one" && !i.kind || i.out && (act === "one" || act === "all");
    return '<button type="button" role="menuitem" class="mi ' + act + '" data-m="' + act + '"' + (dis ? ' aria-disabled="true"' : "") + ">" + P.icon(icon) + '<span class="lb">' + label + (dis && act === "one" ? ' <span class="why">not counted</span>' : dis ? ' <span class="why">already out</span>' : "") + "</span>" + P.kbd(key) + "</button>";
  }
  function open(id, x, y, viaKey) {
    var i = P.item(id); if (!i) return;
    close(true); tgt = id; restore = document.activeElement;
    var li = document.querySelector('li[data-id="' + id + '"]'); if (li) li.setAttribute("data-menu", "");
    menu.innerHTML = '<div class="mh">' + P.esc(i.name) + "</div>" + mi("one", "minus", "Use one", "U", i) + mi("shop", "cart", "Add to shopping list", "S", i) + mi("all", "check", "Used up", "D", i) + "<hr>" +
      '<button type="button" role="menuitem" class="mi" data-m="edit">' + P.icon("pencil") + '<span class="lb">Edit</span>' + P.kbd("E") + '</button><button type="button" role="menuitem" class="mi" data-m="hist">' + P.icon("hist") + '<span class="lb">History</span>' + P.kbd(",") + '</button><div class="mf">' + P.mod + ' Enter closes</div>';
    menu.hidden = false; openedAt = Date.now();
    var w = menu.offsetWidth, h = menu.offsetHeight;
    menu.style.left = Math.max(8, Math.min(x, innerWidth - w - 8)) + "px"; menu.style.top = Math.max(8, Math.min(y, innerHeight - h - 8)) + "px";
    var b = li && li.querySelector(".rmore"); if (b) b.setAttribute("aria-expanded", "true");
    var first = menu.querySelector(".mi:not([aria-disabled=true])"); if (first) first.focus();
  }
  function close(silent) {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    document.querySelectorAll("li[data-menu]").forEach(function (l) { l.removeAttribute("data-menu"); var b = l.querySelector(".rmore"); if (b) b.setAttribute("aria-expanded", "false"); });
    if (!silent && restore && restore.focus && document.contains(restore)) restore.focus();
    tgt = null;
  }
  function run(m) {
    var id = tgt, i = P.item(id); close(true);
    if (m === "edit" || m === "hist") { P.say((m === "edit" ? "Edit" : "History") + " opens for " + i.name.toLowerCase() + " (unchanged)", false); return; }
    P.do(m, id);
    var back = document.querySelector("#plist li[data-row] .rowlink"); if (back) back.focus({ preventScroll: true });
  }
  P.opt.extra = function (i) {
    return '<button type="button" class="rmore" data-more="' + i.id + '" aria-haspopup="menu" aria-expanded="false" aria-label="Actions for ' + P.esc(i.name) + '" title="Actions (right click)">' + P.icon("more") + "</button>";
  };
  P.opt.mount = function () {
    menu = document.createElement("div"); menu.className = "rmenu"; menu.setAttribute("role", "menu"); menu.setAttribute("aria-label", "Item actions"); menu.hidden = true; document.body.appendChild(menu);
    document.addEventListener("contextmenu", function (e) {
      var li = e.target.closest && e.target.closest("#plist li[data-row]"); if (!li || e.shiftKey) return; /* Shift right click: the browser's own menu */
      e.preventDefault(); open(li.dataset.id, e.clientX, e.clientY);
    });
    document.addEventListener("click", function (e) {
      var more = e.target.closest && e.target.closest(".rmore");
      if (more) { e.preventDefault(); e.stopPropagation(); if (tgt === more.dataset.more && !menu.hidden) { close(); return; } var r = more.getBoundingClientRect(); open(more.dataset.more, r.left - 232, r.bottom + 4); return; }
      var m = e.target.closest && e.target.closest(".rmenu .mi"); if (m) { e.preventDefault(); if (m.getAttribute("aria-disabled") !== "true") run(m.dataset.m); return; }
      if (!menu.hidden && !(e.target.closest && e.target.closest(".rmenu"))) close(true);
    }, true);
    window.addEventListener("scroll", function () { if (Date.now() - openedAt > 400) close(true); }, true); /* a scroll that the opening click itself caused is not a reason to close */
    if (P.Q.get("menu") && P.item(P.Q.get("menu"))) { setTimeout(function () { var li = document.querySelector('li[data-id="' + P.Q.get("menu") + '"]'); if (li) { var r = li.getBoundingClientRect(); open(li.dataset.id, r.left + 240, r.top + 26); } }, 0); }
  };
  P.opt.key = function (e) {
    var inMenu = menu && !menu.hidden;
    if (inMenu) {
      var items = Array.prototype.slice.call(menu.querySelectorAll(".mi:not([aria-disabled=true])")), at = items.indexOf(document.activeElement), k = e.key;
      if ((e.ctrlKey || e.metaKey) && k === "Enter") { e.preventDefault(); close(); return true; }
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") { e.preventDefault(); var n = k === "Home" ? 0 : k === "End" ? items.length - 1 : (at + (k === "ArrowDown" ? 1 : -1) + items.length) % items.length; items[n].focus(); return true; }
      if (k === "Enter" || k === " ") { e.preventDefault(); if (document.activeElement.dataset.m) run(document.activeElement.dataset.m); return true; }
      var map = { u: "one", d: "all", s: "shop", e: "edit", ",": "hist" }; var key = k.toLowerCase();
      if (map[key] && !e.ctrlKey && !e.metaKey) { e.preventDefault(); var el = menu.querySelector('[data-m="' + map[key] + '"]'); if (el && el.getAttribute("aria-disabled") !== "true") run(map[key]); else P.say("Not here: " + (el && el.textContent.trim()), false); return true; }
      if (k === "Tab") { e.preventDefault(); return true; }
      return true; /* every other key is swallowed while the menu is open */
    }
    if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) {
      var it = P.target(); if (!it) return false; e.preventDefault();
      var li = document.querySelector('li[data-id="' + it.id + '"]'); var r = li.getBoundingClientRect(); open(it.id, r.left + 240, r.top + 30, true); return true;
    }
    return false;
  };
  P.opt.after = function () { if (tgt && menu && !menu.hidden && !document.querySelector('li[data-id="' + tgt + '"]')) close(true); };
})();
