/* MOCK: Pantry search on the desktop (Kitchie #807). Filters the sample list from the docked bar; the nothing-found block is noresult.js, the same code as the phone.
   Demo hooks: ?q=zzq  ?list=1 (as if Add to shopping list had been tapped)  ?chip=Freezer  ?layout=stack  ?theme=kitchie|kitchie-day */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var ITEMS = window.PS_ITEMS, S = { q: "", chip: "All" }, toastT;
  function badge() { var n = window.PS_SHOP.count(); $("badge").textContent = n; $("nv-shop").setAttribute("aria-label", "Shopping, " + n + " to get"); }
  function toast(t) { var el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 1800); }
  function render() {
    var q = S.q.trim().toLowerCase();
    var items = ITEMS.filter(function (i) { return (S.chip === "All" || (S.chip === "Unplaced" ? !i.area : i.area === S.chip)) && (!q || i.name.toLowerCase().indexOf(q) > -1); });
    var out = "";
    if (!q) window.PSNoResult.reset();
    if (!items.length) {
      var other = q && S.chip !== "All" && ITEMS.some(function (i) { return i.name.toLowerCase().indexOf(q) > -1; });
      out = window.PSNoResult.html(S.q, S.chip === "All" ? "your pantry" : S.chip, other);
    } else {
      out = ["Fridge", "Pantry", "Freezer", ""].filter(function (g) { return items.some(function (i) { return (i.area || "") === g; }); }).map(function (g) {
        return '<section class="group"><h2>' + esc(g || "Unplaced") + '</h2><ul class="rows">' + items.filter(function (i) { return (i.area || "") === g; }).map(function (i) {
          return '<li class="rowx"><div><div class="name">' + esc(i.name) + '</div><div class="meta">' + esc([i.area || "Unplaced", i.amt].join(" · ")) + "</div></div>" + (i.due ? '<span class="due">' + esc(i.due) + "</span>" : "") + "</li>";
        }).join("") + "</ul></section>";
      }).join("");
    }
    $("plist").innerHTML = out;
    $("slive").textContent = q ? (items.length ? items.length + (items.length === 1 ? " match" : " matches") : "No matches") : "";
    document.querySelectorAll(".rc2").forEach(function (b) { b.classList.toggle("on", b.dataset.chip === S.chip); b.setAttribute("aria-pressed", String(b.dataset.chip === S.chip)); });
    badge();
  }
  function init() {
    $("q").addEventListener("input", function () { S.q = $("q").value; render(); });
    $("q").closest("form").addEventListener("submit", function (e) { e.preventDefault(); $("q").blur(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.activeElement === $("q")) { $("q").value = ""; S.q = ""; render(); } });
    document.addEventListener("click", function (e) {
      var c = e.target.closest && e.target.closest(".rc2"); if (c) { S.chip = c.dataset.chip; render(); }
      if (e.target.closest && e.target.closest("#all-places")) { S.chip = "All"; render(); }
    });
    $("filters-open").addEventListener("click", function () { toast("Filters opens the side panel (unchanged)"); });
    $("add-open").addEventListener("click", function () { toast("Add opens the add panel (unchanged)"); });
    window.PSNoResult.init({
      query: function () { return S.q; }, render: render,
      addNew: function (t) { toast("Add opens with “" + t + "” filled in"); },
      addToList: function (t) { return window.PS_SHOP.add(t); },
      undoList: function (t) { window.PS_SHOP.undo(t); }
    });
    var Q = new URLSearchParams(location.search);
    if (Q.get("chip")) S.chip = Q.get("chip");
    if (Q.get("q")) { S.q = Q.get("q"); $("q").value = S.q; }
    render();
    if (Q.get("list")) { var lb = $("list-q"); if (lb) { lb.click(); document.activeElement.blur(); } }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
