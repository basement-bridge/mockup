/* Make it mockup helpers: icons, escaping, the toast, the segmented state switch. Sample data lives in each page's own script. */
window.MK = (function () {
  var I = function (d, s) { return '<svg viewBox="0 0 24 24" width="' + (s || 16) + '" height="' + (s || 16) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var ic = {
    pan: I('<path d="M3 12h13a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M16 12h5"/><path d="M8 8c0-1.5 1-1.5 1-3M12 8c0-1.5 1-1.5 1-3"/>'),
    mark: I('<path d="M6 3h12v18l-6-4-6 4V3z"/>'), x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    cart: I('<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>'),
    more: I('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
    check: I('<path d="M5 12l5 5 9-10"/>'), bang: I('<path d="M12 6v7M12 17.5v.01"/>'),
    spark: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>'),
    eye: I('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    cal: I('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>')
  };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var Q = new URLSearchParams(location.search);
  function pick(k, ok, d) { var v = (Q.get(k) || d).toLowerCase(); return ok.indexOf(v) > -1 ? v : d; }
  function toast(html, ms) { var t = document.getElementById("toast"); if (!t) return; t.innerHTML = html; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, ms || 4200); }
  /* the tap result. saved recipe: the existing cook page (recipe/cook.html). made-up meal: the existing Cooking now screen. Proposal (#781 option 1): the tap starts a session, then opens the same page. */
  function go(kind, back) {
    var u = kind === "recipe" ? "../../recipe/cook.html?id=efr&from=plan" : "cooking.html?back=" + encodeURIComponent(back || "");
    toast("<b>Making it.</b> <span class=\"mk-prop\">Proposal</span> starts a Cooking now session, then opens " + (kind === "recipe" ? "the existing cook page" : "the existing Cooking now screen") + ".", 900);
    setTimeout(function () { location.href = u; }, 650);
  }
  function switcher(id, key, items, cur) {
    var h = items.map(function (it) { var u = new URL(location.href); u.searchParams.set(key, it[0]); return '<a href="' + u.search + '"' + (it[0] === cur ? ' aria-current="true"' : "") + ">" + it[1] + "</a>"; }).join("");
    return h;
  }
  return { ic: ic, esc: esc, Q: Q, pick: pick, toast: toast, go: go, switcher: switcher };
})();
