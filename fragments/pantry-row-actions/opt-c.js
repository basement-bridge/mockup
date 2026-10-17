/* Option C: select rows, act from the panel lane (Kitchie #866). Pick with the check box, Shift click for a range, X on the current row, Shift J / K to extend, Ctrl or Cmd A for every row on screen; U D S act on the
   whole selection when there is one. A used-up of three or more asks ONCE, in the lane, instead of the 409 on the third (bulk is the one case that needs a new write path or a confirm field, see Build impact).
   Clearing uses the owner's close chord, Ctrl or Cmd Enter, or the Clear button (open question DA-Q9). */
(function () {
  "use strict";
  var P = window.PRA, S = P.state, pick = [], asking = false, anchor = null;
  P.pick = function () { return pick.slice(); };
  function ids() { return P.rows().map(function (r) { return r.dataset.id; }).filter(function (id) { return !P.item(id).out; }); }
  function toggle(id, on) {
    var at = pick.indexOf(id); if (on === undefined) on = at < 0;
    if (on && at < 0) pick.push(id); if (!on && at > -1) pick.splice(at, 1);
    anchor = id; S.cur = id; asking = false; refresh();
  }
  function range(to) {
    var all = ids(), a = all.indexOf(anchor), b = all.indexOf(to); if (a < 0) { toggle(to, true); return; }
    all.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(function (x) { if (pick.indexOf(x) < 0) pick.push(x); }); asking = false; refresh();
  }
  function clear() { pick = []; asking = false; anchor = null; refresh(); }
  function refresh() { pick = pick.filter(function (id) { var i = P.item(id); return i && !i.out; }); P.render(); }
  P.opt.extra = function (i) {
    return '<button type="button" class="rsel" role="checkbox" aria-checked="' + (pick.indexOf(i.id) > -1) + '" data-sel="' + i.id + '" aria-label="Select ' + P.esc(i.name) + '" title="Select (X)">' + P.icon("check") + "</button>";
  };
  P.opt.after = function () {
    var l = document.getElementById("plist"); if (!l) return;
    if (pick.length) l.setAttribute("data-selecting", ""); else l.removeAttribute("data-selecting");
    pick.forEach(function (id) { var li = l.querySelector('li[data-id="' + id + '"]'); if (li) li.setAttribute("data-picked", ""); });
  };
  P.opt.panelCustom = function () {
    if (!pick.length) return "";
    var items = pick.map(P.item), nOne = items.filter(P.counted).length, n = items.length;
    var chips = items.map(function (i) { return '<span class="chip">' + i.emoji + " " + P.esc(i.name.length > 18 ? i.name.slice(0, 17) + "…" : i.name) + '<button type="button" data-unpick="' + i.id + '" aria-label="Remove ' + P.esc(i.name) + ' from the selection">' + P.icon("x") + "</button></span>"; }).join("");
    var ask = asking ? '<div class="ask" role="alertdialog" aria-label="Confirm used up"><b>Use up ' + n + " items?</b><p>They leave the list and keep their history. Undo brings them back together.</p><div class=\"row\"><button type=\"button\" class=\"btn dng\" data-bulk=\"confirm\">Use up " + n + '</button><button type="button" class="btn" data-bulk="back">Back</button></div></div>' : "";
    return '<div class="sellane"><h2>' + n + " selected</h2><p class=\"sub\">Pick more with the boxes, or Shift click for a range.</p><div class=\"chips\">" + chips + "</div>" + (asking ? ask :
      '<div class="pbtns"><button type="button" class="btn" data-bulk="one"' + (nOne ? "" : ' aria-disabled="true"') + '><span class="l">' + P.icon("minus") + "Use one</span>" + P.kbd("U") + '</button><button type="button" class="btn" data-bulk="shop"><span class="l">' + P.icon("cart") + "Add to shopping list</span>" + P.kbd("S") + '</button><button type="button" class="btn dng" data-bulk="all"><span class="l">' + P.icon("check") + "Used up</span>" + P.kbd("D") + "</button></div>" +
      (nOne && nOne < n ? '<p class="note">Use one applies to ' + nOne + " of " + n + ": the others are not counted.</p>" : nOne ? "" : '<p class="note">None of these are counted, so there is no Use one.</p>')) +
      '<button type="button" class="btn clear" data-bulk="clear">Clear ' + P.kbd(P.mod + " Enter") + '</button></div>';
  };
  function bulk(kind, confirmed) {
    if (!pick.length) return false;
    if (kind === "clear") { clear(); return true; }
    if (kind === "back") { asking = false; P.render(); return true; }
    if (kind === "all" && pick.length >= 3 && !confirmed) { asking = true; P.render(); var b = document.querySelector('[data-bulk=confirm]'); if (b) b.focus(); return true; }
    if (kind === "one" && !pick.some(function (id) { return P.counted(P.item(id)); })) { P.say("None of these are counted, so there is no Use one.", false); return true; }
    var which = pick.slice(); var r = P.do(kind, which, { confirmed: !!confirmed || (kind === "all" && which.length >= 3) });
    if (r.result !== "none" && r.result !== "down") { pick = kind === "shop" || kind === "one" ? pick : []; asking = false; refresh(); }
    return true;
  }
  P.opt.rowClick = function (id, e) { /* with a selection, a plain click on a row adds or removes it; with none, it opens the item as today */
    if (e.shiftKey) { range(id); return true; }
    if (pick.length) { toggle(id); return true; }
    return false;
  };
  P.opt.mount = function () {
    document.addEventListener("click", function (e) {
      var s = e.target.closest && e.target.closest("[data-sel]");
      if (s) { e.preventDefault(); e.stopPropagation(); if (e.shiftKey) range(s.dataset.sel); else toggle(s.dataset.sel); return; }
      var u = e.target.closest && e.target.closest("[data-unpick]"); if (u) { toggle(u.dataset.unpick, false); return; }
      var b = e.target.closest && e.target.closest("[data-bulk]"); if (b) { if (b.getAttribute("aria-disabled") === "true") return; if (b.dataset.bulk === "confirm") { P.do("all", pick.slice(), { confirmed: true }); pick = []; asking = false; refresh(); } else bulk(b.dataset.bulk); }
    }, true);
    (P.Q.get("pick") || "").split(",").filter(function (x) { return P.item(x); }).forEach(function (x) { pick.push(x); });
    if (P.Q.get("ask") && pick.length >= 3) asking = true;
  };
  P.opt.key = function (e) {
    var cur = P.target(), k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === "enter") { if (pick.length) { e.preventDefault(); clear(); return true; } return false; }
    if ((e.ctrlKey || e.metaKey) && k === "a") { e.preventDefault(); pick = ids(); asking = false; refresh(); return true; }
    if (e.ctrlKey || e.metaKey) return false;
    if (k === "x" && cur && !cur.out) { e.preventDefault(); toggle(cur.id); return true; }
    if (e.shiftKey && (k === "j" || k === "k")) { e.preventDefault(); var all = ids(), at = all.indexOf(cur ? cur.id : null), to = all[at + (k === "j" ? 1 : -1)]; if (to) { if (pick.indexOf(cur.id) < 0) pick.push(cur.id); anchor = anchor || cur.id; if (pick.indexOf(to) < 0) pick.push(to); P.setCur(to, false); S.open = null; refresh(); var a = document.querySelector('li[data-id="' + to + '"] .rowlink'); if (a) a.focus({ preventScroll: true }); } return true; }
    if (pick.length && (k === "u" || k === "d" || k === "s")) { e.preventDefault(); bulk(k === "u" ? "one" : k === "d" ? "all" : "shop"); return true; }
    return false;
  };
})();
