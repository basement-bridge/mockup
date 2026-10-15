/* Make it on the desktop Plan: the agenda column and the meal panel (side panel, 400px, DESIGN.md section 7). Markup modelled on ../plan-desktop/ option B (b-detail.js: .top, .srcbox, .ings, .foot); copied small, tokens only.
   Address: plan-desk.html?s=saved|adhoc|held|missing|past|view  &o=a|b|c  (a footer, b panel header, c agenda tile). Same visibility rule as the phone (Proposal). */
(function () {
  "use strict";
  var K = window.MK, ic = K.ic, esc = K.esc;
  var S = K.pick("s", ["saved", "adhoc", "held", "missing", "past", "view"], "saved"), O = K.pick("o", ["a", "b", "c"], "a");
  var HAVE = [["Cooked rice", "300 g"], ["Eggs", "3"], ["Spring onions", "2"], ["Soy sauce", "1 tbsp"], ["Frozen peas", "80 g"]];
  var HAVE2 = [["Chicken thighs", "300 g"], ["Rice", "150 g"], ["Malatang soup base", "1 pack"], ["Bok choy", "2"], ["Enoki mushrooms", "100 g"], ["Tofu puffs", "80 g"], ["Glass noodles", "50 g"]];
  var base = { t: "Egg fried rice", em: "\u{1F373}", rid: "efr", held: false, mins: "15 min", have: HAVE, when: "Thu 15 Oct" };
  var M = {
    saved: base, held: Object.assign({}, base, { held: true }), missing: Object.assign({}, base, { have: HAVE.slice(0, 3), miss: [["Soy sauce", "1 tbsp"], ["Frozen peas", "80 g"]] }),
    adhoc: { t: "Malatang with chicken and rice", em: "\u{1F35C}", rid: null, held: false, have: HAVE2, when: "Thu 15 Oct" },
    past: Object.assign({}, base, { when: "Tue 13 Oct", past: true }), view: Object.assign({}, base, { ro: "Priya" })
  };
  var m = M[S], canMake = !m.past && !m.ro, today = !m.past;
  var SW = [["saved", "Saved recipe"], ["adhoc", "Made up"], ["held", "Held"], ["missing", "2 missing"], ["past", "Past day"], ["view", "View only"]];
  function mk(cls, kbd) { return '<button type="button" class="mkbtn ' + cls + '" data-make aria-label="Make it: ' + esc(m.t) + '">' + ic.pan + "Make it" + (kbd ? ' <span class="kbd">M</span>' : "") + "</button>"; }
  function tile(t, em, sub, sel, extra) { return '<div class="tile2' + (sel ? " sel" : "") + '" tabindex="0"><span class="e" aria-hidden="true">' + em + '</span><span class="t">' + esc(t) + "<small>" + esc(sub) + "</small></span>" + (extra || "") + "</div>"; }
  function agenda() {
    var sel = tile(m.t, m.em, (m.ro ? m.ro + " · " : "Everyone · ") + "2", true, O === "c" && canMake ? mk("pill") : "");
    return '<h1>Plan</h1><p class="hint" style="margin:0 0 4px">' + (m.ro ? "Priya’s plan (view only)" : "Your week") + "</p>" +
      (m.past ? '<div class="dayh">Tuesday 13 Oct</div>' + sel + '<div class="dayh">Thursday 15 Oct · Today</div>' + tile("Lentil soup", "\u{1F372}", "Everyone · 2") :
        '<div class="dayh">Tuesday 13 Oct</div>' + tile("Pasta bake", "\u{1F35D}", "Everyone · 2") + '<div class="dayh">Thursday 15 Oct · Today</div>' + sel) +
      '<div class="dayh">Friday 16 Oct</div>' + tile("Fish tacos", "\u{1F32E}", "Everyone · 2");
  }
  function panel() {
    var h = '<aside class="dpanel" aria-label="Meal"><div class="top"><span class="e" aria-hidden="true">' + m.em + '</span><div><h2>' + esc(m.t) + "</h2><p>" + m.when + " · " + (m.ro ? m.ro : "Everyone") + " · 2 people</p></div>" + (O === "b" && canMake ? mk("chip", true) : "") + '<button class="x" aria-label="Close (Ctrl Enter)">×</button></div>';
    h += '<div class="dstat">' + (m.miss ? '<span class="tg" style="border-color:var(--danger);color:var(--danger)">2 missing</span>' : '<span class="tg">' + ic.check + " Dealt with</span>") + (m.held ? '<span class="tg">Held</span>' : "") + "</div>";
    h += m.rid ? '<div class="srcbox"><a class="btn" style="min-height:44px" href="../../recipe/detail.html?id=efr">Open recipe</a></div>' : '<div class="srcbox"><span class="tg">' + ic.spark + " Made up by your assistant</span><span>Not a saved recipe.</span></div>";
    if (m.mins) h += '<div class="tt"><span>Total time</span><b>' + m.mins + "</b></div>";
    if (!canMake) h += '<div class="vo">' + ic.eye + "<span>" + (m.ro ? "View only, " + m.ro + "’s plan. You can look, not change." : "This night has passed. You can look, not change.") + "</span></div>";
    h += '<div class="ings" role="list" aria-label="Ingredients">' + (m.miss || []).map(function (x) { return '<div class="ing" role="listitem" style="color:var(--danger)"><span>' + esc(x[0]) + '</span><span class="q">' + esc(x[1]) + "</span></div>"; }).join("") + m.have.map(function (x) { return '<div class="ing" role="listitem"><span>' + esc(x[0]) + '</span><span class="q">' + esc(x[1]) + "</span></div>"; }).join("") + "</div>";
    if (canMake) {
      h += '<div class="foot"><button class="btn' + (m.held ? " held" : "") + '" data-hold aria-pressed="' + m.held + '">' + ic.mark + (m.held ? "Release " : "Hold ") + m.have.length + "</button>" +
        (m.miss ? '<button class="btn">' + ic.cart + " Add " + m.miss.length + "</button>" : "") + (O === "a" ? mk("", true) : "") + "</div>";
      if (m.held) h += '<p class="hint">Held. Make it uses the held items; the hold ends when you finish. <span class="mk-prop">Proposal</span></p>';
    }
    return h + "</aside>";
  }
  function render() {
    document.getElementById("root").innerHTML = '<nav class="rail" aria-label="Main"><span>Home</span><span>Pantry</span><span class="on">Plan</span><span>Recipes</span><span>Shop</span></nav><main class="col">' + agenda() + '</main><div class="side">' + panel() + "</div>";
  }
  document.addEventListener("click", function (e) {
    var t = e.target instanceof Element ? e.target : null; if (!t) return;
    if (t.closest("[data-make]")) { K.go(m.rid ? "recipe" : "cooking", location.pathname.split("/").pop() + location.search); return; }
    if (t.closest("[data-hold]")) { m.held = !m.held; render(); }
  });
  document.addEventListener("keydown", function (e) { if ((e.key === "m" || e.key === "M") && canMake && !e.ctrlKey && !e.metaKey && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || "")) K.go(m.rid ? "recipe" : "cooking", location.pathname.split("/").pop() + location.search); });
  if (window.top === window) { var h = document.createElement("div"); h.className = "sw2"; h.style.cssText = "position:fixed;left:104px;bottom:8px;z-index:50;background:var(--bg);padding:4px"; h.innerHTML = K.switcher("", "s", SW, S) + K.switcher("", "o", [["a", "A footer"], ["b", "B header"], ["c", "C tile"]], O); document.body.appendChild(h); }
  render();
})();
