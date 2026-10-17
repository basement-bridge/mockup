/* The "nothing found" block of the Pantry search, with its two actions: Add as a new item (as before) and Add to shopping list (Kitchie #807).
   Used by the phone (app.html) and the desktop (desktop.html). Notes: docs/knowledge/pantry-search.md, section "Add to shopping list from no results".
   This file is what the build lifts. The two things the app owns are passed in through PSNoResult.init: addNew(text) opens the existing add sheet with the text;
   addToList(text) calls the new web route and answers { added } | { already } | { linked: "<item name>" } (addToShoppingByName); undoList(text, answer) takes it off again. */
(function () {
  "use strict";
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var ico = function (d, s) { return '<svg width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var I = {
    plus: ico('<path d="M12 5v14M5 12h14"/>'),
    cart: ico('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 .98.8h8.8a1 1 0 0 0 1-.8L20 8H6.2"/>'),
    tick: ico('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    none: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/><path d="M9.2 9.2a2 2 0 1 1 2.8 1.8c-.6.3-1 .7-1 1.3M11 14.5v.1"/>', 34)
  };
  var H = null, done = null, lastKey = null, layout = "row";
  var key = function (q) { return String(q).trim().replace(/\s+/g, " ").toLowerCase(); };

  /* where: "your pantry" or a place chip ("Freezer"); other: the item exists under another chip */
  function html(rawQ, where, other) {
    var q = String(rawQ).trim();
    if (!q) return '<div class="empty" id="noresult"><span class="eic" aria-hidden="true">' + I.none + "</span><b>Nothing here yet</b><p>Add what you have.</p></div>";
    var k = key(q);
    if (k !== lastKey) { done = null; lastKey = k; }                       /* a different search clears the confirmation */
    var head = '<div class="empty" id="noresult" data-layout="' + layout + '"><span class="eic" aria-hidden="true">' + I.none + "</span><b>No &ldquo;" + esc(q) + "&rdquo; in " + esc(where) + "</b>";
    if (other) return head + '<p>It is in another place.</p><button type="button" class="btn" id="all-places">Search all places</button></div>';
    var stack = layout === "stack", qq = "&ldquo;" + esc(q) + "&rdquo;";
    var newLbl = stack ? "Add " + qq + " as a new item" : "Add as a new item", listLbl = stack ? "Add " + qq + " to shopping list" : "Add to shopping list";
    var listBtn = done
      ? '<button type="button" class="btn on" id="list-q" aria-disabled="true">' + I.tick + "<span>On your list</span></button>"
      : '<button type="button" class="btn sec" id="list-q" aria-label="Add &ldquo;' + esc(q) + '&rdquo; to the shopping list">' + I.cart + "<span>" + listLbl + "</span></button>";
    var msg = "";
    if (done) {
      var t = done.already ? qq + " is already on your shopping list. Nothing changed."
        : done.linked ? esc(done.linked) + ", which you used up, is on your shopping list."
        : qq + " is on your shopping list.";
      msg = '<p class="edone" id="edone">' + I.tick + "<span>" + t + "</span>" + (done.already ? "" : '<button type="button" class="undo" id="list-undo">Undo</button>') + "</p>";
    }
    return head + "<p>Check the spelling, or add it.</p>" +
      '<div class="eacts"><button type="button" class="btn pri" id="add-q" aria-label="Add &ldquo;' + esc(q) + '&rdquo; as a new item">' + I.plus + "<span>" + newLbl + "</span></button>" + listBtn + "</div>" + msg + "</div>";
  }
  function say(t) { var l = document.getElementById("slive"); if (l) l.textContent = t; }

  function init(hooks) {
    H = hooks; layout = new URLSearchParams(location.search).get("layout") === "stack" ? "stack" : "row";
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("#add-q, #list-q, #list-undo"); if (!t) return;
      var q = H.query().trim();
      if (t.id === "add-q") { H.addNew(q); return; }
      if (t.id === "list-q") {
        if (done) return;                                                  /* already confirmed: the button is only a label now */
        done = H.addToList(q); H.render(); var b = document.getElementById("list-q"); if (b) b.focus({ preventScroll: true });
        say(done.already ? q + " is already on your shopping list" : q + " added to your shopping list");
        return;
      }
      if (t.id === "list-undo") {
        H.undoList(q, done); done = null; H.render(); var r = document.getElementById("list-q"); if (r) r.focus({ preventScroll: true });
        say(q + " taken off your shopping list");
      }
    });
  }
  function reset() { done = null; lastKey = null; }
  window.PSNoResult = { init: init, html: html, reset: reset, icons: I };
})();
