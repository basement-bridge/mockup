/* The relabelled "Cook now" -> "Make it" on the Recipe side: the recipe flyout footer (sheet on phone, side panel on desktop) and the cooking idea card.
   Address: recipe.html?v=sheet|card|desk  &p=none|today   (p = is the recipe planned for today; Proposal: the same rule as Home, so a planned recipe drops Plan). Sample data only. */
(function () {
  "use strict";
  var K = window.MK, ic = K.ic, esc = K.esc;
  var V = K.pick("v", ["sheet", "card", "desk"], "sheet"), P = K.pick("p", ["none", "today"], "none");
  var ING = [["Cooked rice", "300 g", 1], ["Eggs", "3", 1], ["Spring onions", "2", 1], ["Soy sauce", "1 tbsp", 1], ["Frozen peas", "80 g", 0]];
  function mk(cls) { return '<button type="button" class="mkbtn ' + (cls || "") + '" data-make aria-label="Make it: Egg fried rice">' + ic.pan + "Make it</button>"; }
  function footer() {
    return '<div class="acts">' + mk() + (P === "today" ? "" : '<button type="button" class="btn" data-toast="Opens the existing day picker to plan it.">Plan</button>') + '</div><p style="margin:8px 0 0"><a class="btn" style="border:0;background:none;color:var(--accent);min-height:44px" href="../../recipe/detail.html?id=efr">Open full recipe</a></p>';
  }
  function tag() { return P === "today" ? '<span class="tg today">' + ic.check + " Planned for today</span>" : '<span class="tg">' + ic.check + " All in</span>"; }
  function body() {
    return '<div class="lead"><span class="e" aria-hidden="true">\u{1F373}</span><span class="t"><b>Egg fried rice</b><small>15 min · serves 2</small>' + tag() + '</span></div><h4 class="dayh">Ingredients</h4><ul class="ing2">' +
      ING.map(function (r) { return '<li' + (r[2] ? "" : ' class="no"') + "><span>" + (r[2] ? "✓ " : "✗ ") + esc(r[0]) + "</span><b>" + r[1] + "</b></li>"; }).join("") + "</ul>";
  }
  function render() {
    var r = document.getElementById("root");
    if (V === "sheet") r.innerHTML = '<main class="hm"><h1>Recipes</h1><div class="card"><div class="lead"><span class="e">\u{1F35D}</span><span class="t"><b>Spaghetti aglio e olio</b><small>20 min</small></span></div></div></main><div class="scrim3"></div><section class="sheet2" role="dialog" aria-label="Recipe summary">' + body() + footer() + "</section>";
    else if (V === "card") r.innerHTML = '<main class="hm"><h1>Recipes</h1><section class="card" aria-label="Cooking idea"><div class="th"><h2>Cooking idea</h2><a href="#" data-toast="Opens all ideas.">See all</a></div><div class="lead"><span class="e" aria-hidden="true">\u{1F373}</span><span class="t"><b>Egg fried rice</b><small>15 min · serves 2 · uses the rice going off</small>' + tag() + "</span></div>" + footer().split('<p style')[0] + '</section><p class="mkq">The Recipe land no longer carries ideas (decided 11 Oct 2026, ideas live on Home). The card is drawn here because the build still has it (<code>recipe-tab/ideas-card.ts</code>); the rename applies wherever it is drawn.</p></main><div class="mk-bar" aria-hidden="true"><span>Home</span><span>Pantry</span><span>Plan</span><span><b>Recipes</b></span><span>Shopping</span></div>';
    else r.innerHTML = '<div class="desk"><nav class="rail" aria-label="Main"><span>Home</span><span>Pantry</span><span>Plan</span><span class="on">Recipes</span><span>Shop</span></nav><main class="col"><h1>Recipes</h1><div class="tile2 sel"><span class="e">\u{1F373}</span><span class="t">Egg fried rice<small>15 min · serves 2</small></span></div><div class="tile2"><span class="e">\u{1F35D}</span><span class="t">Spaghetti aglio e olio<small>20 min · serves 2</small></span></div></main><div class="side"><aside class="dpanel" aria-label="Recipe summary">' + body() + footer() + "</aside></div></div>";
  }
  document.addEventListener("click", function (e) {
    var t = e.target instanceof Element ? e.target : null; if (!t) return;
    var tt = t.closest("[data-toast]"); if (tt) { e.preventDefault(); K.toast(esc(tt.getAttribute("data-toast"))); return; }
    if (t.closest("[data-make]")) K.go("recipe", location.pathname.split("/").pop() + location.search);
  });
  if (window.top === window) { var h = document.createElement("div"); h.className = "sw2"; h.style.cssText = "position:sticky;top:0;z-index:50;background:var(--bg);padding:8px 8px 0;margin:0"; h.innerHTML = K.switcher("", "v", [["sheet", "Phone sheet"], ["card", "Idea card"], ["desk", "Desktop"]], V) + K.switcher("", "p", [["none", "Not planned"], ["today", "Planned today"]], P); document.body.insertBefore(h, document.body.firstChild); }
  render();
})();
