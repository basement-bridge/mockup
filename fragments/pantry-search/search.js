/* Pantry top row, phone: a magnifier button opens a search bar over the whole row; a shallow pull down opens the same bar; a deep pull still refreshes.
   Mock data and demo hooks are at the bottom (marked MOCK); the row logic above is what the build lifts. Notes: docs/knowledge/pantry-search.md */
(function () {
  "use strict";
  var PULL_SEARCH = 70, PULL_REFRESH = 170, PEEK = 8, PEEK_SLIDE = 22, REFRESH_MS = 2400, REFRESH_MS_REDUCED = 1600;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var ico = function (d, s) { s = s || 22; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var I = {
    search: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
    plus: ico('<path d="M12 5v14M5 12h14"/>'),
    x: ico('<path d="M6 6l12 12M18 6L6 18"/>'),
    mic: ico('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/>'),
    funnel: ico('<path d="M4 5h16l-6 7.500V19l-4-2v-4.500z"/>', 18),
    none: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.500"/><path d="M9.200 9.200a2 2 0 1 1 2.800 1.800c-.6.300-1 .7-1 1.300M11 14.500v.1"/>', 34)
  };
  var reduced = function () { return (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || document.documentElement.hasAttribute("data-motion"); };

  var S = { q: "", open: false, chip: "All", refresh: false };
  var row, front, spill, input, body, msg, list, live, toastT;

  /* ---------- the row's state: rest | search | let | anim (data-state), exactly as Kitchie's .prow ---------- */
  function setRow(st) {
    row.dataset.state = st; row.classList.remove("peek");
    if (st !== "search") row.classList.remove("lock");
    front.style.transition = ""; front.style.transform = ""; front.style.opacity = "";
    spill.style.transition = ""; spill.style.width = ""; $("search-close").style.transition = ""; $("search-close").style.opacity = "";
    var open = st === "search";
    $("search-open").setAttribute("aria-expanded", String(open));
    spill.setAttribute("aria-hidden", open ? "false" : "true");
    $("search-glass").tabIndex = open ? 0 : -1; $("search-close").tabIndex = open ? 0 : -1; input.tabIndex = open ? 0 : -1;
  }
  function openSearch(by) {
    if (S.refresh || S.open) return;
    S.open = true;
    row.classList.toggle("by-tap", by === "tap");
    setRow("search");
    input.focus({ preventScroll: true });                       /* a tap, or the release of a pull: both are gestures, so the keyboard opens */
  }
  function closeSearch() {
    if (!S.open) return;
    S.open = false; S.q = ""; input.value = ""; input.blur();
    setRow(S.refresh ? "anim" : "rest");
    render();
  }

  /* ---------- filtering: item name only, as typed (contains, ignoring case and spaces at the ends) ---------- */
  function render() {
    var q = S.q.trim().toLowerCase();
    var items = ITEMS.filter(function (i) { return (S.chip === "All" || (S.chip === "Unplaced" ? !i.area : i.area === S.chip)) && (!q || i.name.toLowerCase().indexOf(q) > -1); });
    var out = "";
    if (!q) window.PSNoResult.reset();
    if (!items.length) {
      var other = q && S.chip !== "All" && ITEMS.some(function (i) { return i.name.toLowerCase().indexOf(q) > -1; });
      out = window.PSNoResult.html(S.q, S.chip === "All" ? "your pantry" : S.chip, other);   /* noresult.js: the message and, for #807, the two actions */
    } else {
      var groups = ["Fridge", "Pantry", "Freezer", ""].filter(function (g) { return items.some(function (i) { return (i.area || "") === g; }); });
      out = groups.map(function (g) {
        return '<section class="group"><h2>' + esc(g || "Unplaced") + '</h2><ul class="rows">' + items.filter(function (i) { return (i.area || "") === g; }).map(function (i) {
          return '<li class="rowx"><div><div class="name">' + esc(i.name) + '</div><div class="meta">' + esc([i.area || "Unplaced", i.amt].join(" · ")) + "</div></div>" + (i.due ? '<span class="due">' + esc(i.due) + "</span>" : "") + "</li>";
        }).join("") + "</ul></section>";
      }).join("");
    }
    list.innerHTML = out;
    live.textContent = q ? (items.length ? items.length + (items.length === 1 ? " match" : " matches") : "No matches") : "";
    document.querySelectorAll(".rc2").forEach(function (b) { b.classList.toggle("on", b.dataset.chip === S.chip); b.setAttribute("aria-pressed", String(b.dataset.chip === S.chip)); });
  }

  /* ---------- pull: 8-70 peek, 70-170 search, 170+ refresh ---------- */
  var pl = null;
  var stateFor = function (dy) { return dy >= PULL_REFRESH ? "let" : dy >= PULL_SEARCH ? "search" : dy > PEEK ? "peek" : "base"; };
  /* finger-driven: Filters and + (and the front magnifier) slide away in step with the pull while the bar widens from the magnifier to the whole row. At 70 px it is exactly the locked state. */
  function follow(dy) {
    var bar = $("search-close");
    if (reduced()) { front.style.transition = "none"; front.style.transform = "translateY(" + Math.round(Math.min(dy / PULL_SEARCH, 1) * PEEK_SLIDE) + "px)"; return; }
    var p = Math.max(0, Math.min(1, (dy - PEEK) / (PULL_SEARCH - PEEK))), e = p * p * (3 - 2 * p);
    front.style.transition = "none"; front.style.transform = "translateY(" + e * 100 + "%)"; front.style.opacity = String(1 - e);
    spill.style.transition = "none"; spill.style.width = "calc(48px + (100% - 48px) * " + e + ")";
    bar.style.transition = "none"; bar.style.opacity = String(e);
  }
  function show(st, dy) {
    var m = msg;
    if (st === "base") { pl.st = null; setRow(S.open ? "search" : "rest"); m.setAttribute("aria-hidden", "true"); return; }
    if (st === "peek") { row.classList.remove("lock", "by-tap"); setRow("rest"); row.classList.add("peek"); follow(dy); pl.st = "peek"; return; }
    if (pl.st === st) return; pl.st = st; row.classList.remove("by-tap"); setRow(st);
    if (st === "search") { row.classList.remove("lock"); void row.offsetWidth; row.classList.add("lock"); if (navigator.vibrate) { try { navigator.vibrate(10); } catch (e) { /* not supported */ } } }
    if (st === "let") { m.innerHTML = '<div class="rf"><span>Let go to refresh</span></div>'; m.removeAttribute("aria-hidden"); } else m.setAttribute("aria-hidden", "true");
  }
  function pullStart(t, x, y) {
    if (S.open || S.refresh || body.scrollTop > 0 || (t.closest && t.closest("input, button, a, .ribbon"))) return;
    pl = { x: x, y: y, dy: 0, st: null };
  }
  function pullMove(x, y, e) {
    if (!pl) return;
    if (body.scrollTop > 0) { pullCancel(); return; }
    var dy = y - pl.y;
    if (dy <= PEEK) { if (pl.dy) { pl.dy = 0; show("base"); } return; }
    if (!pl.dy && Math.abs(x - pl.x) > dy) { pl = null; return; }
    if (e && e.cancelable) e.preventDefault();
    if (!pl.dy) document.body.classList.add("is-pulling");
    pl.dy = dy; show(stateFor(dy), dy);
  }
  function pullCancel() { if (!pl) return; pl = null; document.body.classList.remove("is-pulling"); setRow(S.open ? "search" : "rest"); }
  function pullEnd() {
    if (!pl) return; var p = pl; pl = null; document.body.classList.remove("is-pulling");
    if (!p.dy) return;
    if (p.dy >= PULL_REFRESH) playRefresh();
    else if (p.dy >= PULL_SEARCH) { S.open = true; setRow("search"); input.focus({ preventScroll: true }); }
    else setRow("rest");
  }
  function playRefresh() {
    S.refresh = true; row.classList.remove("by-tap");
    msg.innerHTML = '<div class="rf" role="status"><span>Stirring the pot. Gently.</span></div>'; msg.removeAttribute("aria-hidden");   /* MOCK: words only; the six drawn scenes are unchanged and not redrawn here */
    setRow("anim");
    setTimeout(function () { S.refresh = false; msg.setAttribute("aria-hidden", "true"); setRow("rest"); toast("Up to date"); }, reduced() ? REFRESH_MS_REDUCED : REFRESH_MS);
  }
  function toast(t) { var el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 1800); }

  /* ---------- wiring ---------- */
  function init() {
    row = $("prow"); front = row.querySelector(".pl-front"); spill = $("spill"); input = $("q"); body = $("body"); msg = $("pmsg"); list = $("plist"); live = $("slive");
    setRow(row.dataset.state || "rest");
    $("search-open").addEventListener("click", function () { openSearch("tap"); });
    $("search-glass").addEventListener("click", function () { closeSearch(); });          /* OPEN: the magnifier again closes (assumed) */
    $("search-close").addEventListener("click", function () { closeSearch(); });          /* OPEN: the X closes (assumed) */
    spill.addEventListener("submit", function (e) { e.preventDefault(); input.blur(); }); /* the keyboard's Search key: keyboard down, the list stays filtered, the bar stays open */
    input.addEventListener("input", function () { S.q = input.value; render(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && S.open) closeSearch(); });
    $("filters-open").addEventListener("click", function () { toast("Filters opens the filter sheet (unchanged)"); });
    $("add-open").addEventListener("click", function () { toast("Add opens the add sheet (unchanged)"); });
    $("mic").addEventListener("click", function () { toast("Listening…"); });
    document.addEventListener("click", function (e) {
      var c = e.target.closest && e.target.closest(".rc2"); if (c) { S.chip = c.dataset.chip; render(); }
      if (e.target.closest && e.target.closest("#all-places")) { S.chip = "All"; render(); }
    });
    document.addEventListener("pointerdown", function (e) { if (e.pointerType !== "touch" && e.button === 0) pullStart(e.target, e.clientX, e.clientY); });
    document.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") pullMove(e.clientX, e.clientY); });
    document.addEventListener("pointerup", function (e) { if (e.pointerType !== "touch") pullEnd(); });
    document.addEventListener("pointercancel", function (e) { if (e.pointerType !== "touch") pullCancel(); });
    document.addEventListener("touchstart", function (e) { if (e.touches.length === 1) pullStart(e.target, e.touches[0].clientX, e.touches[0].clientY); else pullCancel(); }, { passive: true });
    document.addEventListener("touchmove", function (e) { if (e.touches.length !== 1) pullCancel(); else pullMove(e.touches[0].clientX, e.touches[0].clientY, e); }, { passive: false });
    document.addEventListener("touchend", function () { pullEnd(); }, { passive: true });
    document.addEventListener("touchcancel", function () { pullCancel(); }, { passive: true });

    /* the nothing-found block (noresult.js). In the app these three are the existing add sheet and the new list route. */
    window.PSNoResult.init({
      query: function () { return S.q; }, render: render,
      addNew: function (t) { toast("Add opens with “" + t + "” filled in"); },
      addToList: function (t) { return window.PS_SHOP.add(t); },                       /* MOCK: addToShoppingByName */
      undoList: function (t) { window.PS_SHOP.undo(t); }
    });

    /* ---------- MOCK: demo hooks (?state=open|peek|let|anim  ?q=  ?chip=  ?pull=NN  ?theme=kitchie|kitchie-day) ---------- */
    var Q = new URLSearchParams(location.search);
    if (Q.get("chip")) S.chip = Q.get("chip");
    if (Q.get("q")) { S.q = Q.get("q"); input.value = S.q; }
    render();
    var st = Q.get("state");
    if (st === "open" || S.q) { S.open = true; setRow("search"); }
    if (Q.get("pull")) { pl = { x: 0, y: 0, dy: 0, st: null }; var n = +Q.get("pull"); pl.dy = n; show(stateFor(n), n); pl = null; }
    if (st === "anim") playRefresh();
    if (Q.get("list")) { var lb = $("list-q"); if (lb) { lb.click(); document.activeElement.blur(); } }           /* ?list=1 : as if Add to shopping list had just been tapped (for the notes page frames) */
    window.PantrySearch = { open: function () { openSearch("tap"); }, close: closeSearch, pull: function (n) { pl = { x: 0, y: 0, dy: n, st: null }; show(stateFor(n), n); }, release: function (n) { pl = { x: 0, y: 0, dy: n, st: null }; pullEnd(); }, state: function () { return S; } };
  }

  var ITEMS = window.PS_ITEMS;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.PS_ICONS = I;
})();
