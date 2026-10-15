/* Make it on Home: the cooking idea card and This week. The card knows whether the idea is planned for TODAY (owner, 15 Oct 2026).
   Address: home.html?p=today|none|other  &w=phone|desk  &mu=1  (p = the lead idea's plan state; mu = also offer Make it on an unplanned idea, the owner's half-finished sentence).
   today: just Make it. none: the existing Plan (add-to-plan) path. other (planned for another day): Proposal, Move to today (the Plan's own move, no second plan). Sample data only. */
(function () {
  "use strict";
  var K = window.MK, ic = K.ic, esc = K.esc;
  var P = K.pick("p", ["today", "none", "other"], "today"), W = K.pick("w", ["phone", "desk"], "phone"), MU = K.Q.get("mu") === "1";
  var SWP = [["today", "Planned today"], ["none", "Not planned"], ["other", "Planned Saturday"]];
  function mk(cls, label) { return '<button type="button" class="mkbtn ' + (cls || "") + '" data-make aria-label="Make it: Egg fried rice">' + ic.pan + (label || "Make it") + "</button>"; }
  function tag() {
    return P === "today" ? '<span class="tg today">' + ic.check + " Planned for today</span>" : P === "other" ? '<span class="tg mute">' + ic.cal + " Planned Saturday</span>" : '<span class="tg">' + ic.check + " All in</span>";
  }
  function acts() {
    if (P === "today") return '<div class="acts">' + mk() + "</div>";
    if (P === "other") return '<div class="acts"><button type="button" class="btn pri" data-toast="Moves Saturday’s Egg fried rice to today. The Plan’s own move, no second plan.">' + ic.cal + "Move to today</button></div>";
    return '<div class="acts"><button type="button" class="btn pri" data-toast="Opens the existing day picker to plan it (fragments/plan-day-picker).">Plan</button>' + (MU ? mk("out", "Make it") : "") + "</div>";
  }
  function ideas() {
    return '<section class="card" aria-label="Cooking ideas"><div class="th"><h2>Cooking ideas</h2><a href="#" data-toast="Opens all ideas.">See all</a></div><div class="lead"><span class="e" aria-hidden="true">\u{1F373}</span><span class="t"><b>Egg fried rice</b><small>15 min · serves 2 · uses the rice going off</small>' + tag() + "</span></div>" + acts() +
      (MU && P === "none" ? '<p class="mkq"><span class="mk-prop">Proposal</span> Make it on an unplanned idea: the owner’s sentence stopped here. Off by default.</p>' : "") + "</section>";
  }
  function week() {
    var thu = P === "today" ? ["Egg fried rice", "Dinner · Everyone", true] : P === "other" ? ["Lentil soup", "Dinner · Everyone", true] : null;
    var rows = [["Thu", "15", thu, true], ["Fri", "16", ["Fish tacos", "Dinner · Everyone", false]], ["Sat", "17", P === "other" ? ["Egg fried rice", "Dinner · Everyone", false] : null], ["Sun", "18", null]];
    return '<section class="card" aria-label="This week"><div class="th"><h2>This week</h2><a href="#" data-toast="Opens the Plan.">Open plan</a></div><ul class="wk">' + rows.map(function (r) {
      var m = r[2];
      return '<li' + (r[3] ? ' class="today"' : "") + '><span class="d">' + r[0] + "<b>" + r[1] + "</b></span>" + (m ? '<span class="m">' + esc(m[0]) + "<small>" + m[1] + "</small></span>" + (m[2] ? mk("pill") : "") : '<span class="m none">Nothing planned</span>') + "</li>";
    }).join("") + "</ul>" + '<p class="mkq"><span class="mk-prop">Proposal</span> Make it only on today’s planned meals here. Later days stay a plain row; open the Plan to make one ahead.</p></section>';
  }
  function others() {
    return '<section class="card" aria-label="More ideas"><div class="th"><h2>More ideas</h2></div><ul class="wk"><li><span class="e" aria-hidden="true">\u{1F35D}</span><span class="m">Spaghetti aglio e olio<small>20 min · serves 2</small></span><span class="tg">' + ic.check + ' All in</span></li><li><span class="e" aria-hidden="true">\u{1F957}</span><span class="m">Cucumber salad<small>10 min · serves 2</small></span><span class="tg today">Planned Fri</span></li></ul></section>';
  }
  function render() {
    var root = document.getElementById("root");
    if (W === "desk") root.innerHTML = '<div class="desk"><nav class="rail" aria-label="Main"><span class="on">Home</span><span>Pantry</span><span>Plan</span><span>Recipes</span><span>Shop</span></nav><main class="col"><h1>Good evening</h1>' + ideas() + others() + '</main><div class="side">' + week() + "</div></div>";
    else root.innerHTML = '<main class="hm"><h1>Good evening</h1>' + ideas() + week() + '</main><div class="mk-bar" aria-hidden="true"><span><b>Home</b></span><span>Pantry</span><span>Plan</span><span>Recipes</span><span>Shopping</span></div>';
  }
  document.addEventListener("click", function (e) {
    var t = e.target instanceof Element ? e.target : null; if (!t) return;
    var tt = t.closest("[data-toast]"); if (tt) { e.preventDefault(); K.toast(esc(tt.getAttribute("data-toast"))); return; }
    var b = t.closest("[data-make]"); if (!b) return;
    /* ideas are saved recipes: the existing cook page. A This week row with a made-up meal would open Cooking now (see Plan, made up). */
    K.go("recipe", location.pathname.split("/").pop() + location.search);
  });
  if (window.top === window) { var h = document.createElement("div"); h.className = "sw2"; h.style.cssText = "position:sticky;top:0;z-index:50;background:var(--bg);padding:8px 8px 0;margin:0"; h.innerHTML = K.switcher("", "p", SWP, P) + K.switcher("", "w", [["phone", "Phone"], ["desk", "Desktop"]], W); document.body.insertBefore(h, document.body.firstChild); }
  render();
})();
