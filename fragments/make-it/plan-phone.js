/* Make it on the Plan meal detail, phone. Markup and classes are Kitchie's (plan.phone.js card, detailBody, ingList, footActions) as in ../plan-start-cooking/.
   Address: plan-phone.html?s=saved|adhoc|held|past|view  &o=a|b|c   (s = which meal state, o = where the button sits, all Proposals). Sample data only.
   Rule drawn (Proposal): Make it shows on today's and future meals in your own or the household's plan; never on a past day or in someone else's view-only plan. */
(function () {
  "use strict";
  var K = window.MK, ic = K.ic, esc = K.esc;
  var S = K.pick("s", ["saved", "adhoc", "held", "missing", "past", "view"], "saved"), O = K.pick("o", ["a", "b", "c"], "a");
  var HAVE = [["Cooked rice", "300 g"], ["Eggs", "3"], ["Spring onions", "2"], ["Soy sauce", "1 tbsp"], ["Frozen peas", "80 g"]];
  var HAVE2 = [["Chicken thighs", "300 g"], ["Rice", "150 g"], ["Malatang soup base", "1 pack"], ["Bok choy", "2"], ["Enoki mushrooms", "100 g"], ["Tofu puffs", "80 g"], ["Glass noodles", "50 g"]];
  var MEALS = {
    saved: { t: "Egg fried rice", em: "\u{1F373}", rid: "efr", held: false, mins: "15 min", have: HAVE, day: "<b>Thursday</b> 15 Oct <em>Today</em>", who: "Everyone · 2" },
    held: { t: "Egg fried rice", em: "\u{1F373}", rid: "efr", held: true, mins: "15 min", have: HAVE, day: "<b>Thursday</b> 15 Oct <em>Today</em>", who: "Everyone · 2" },
    missing: { t: "Egg fried rice", em: "\u{1F373}", rid: "efr", held: false, mins: "15 min", have: HAVE.slice(0, 3), miss: [["Soy sauce", "1 tbsp"], ["Frozen peas", "80 g"]], day: "<b>Thursday</b> 15 Oct <em>Today</em>", who: "Everyone \u00b7 2" },
    adhoc: { t: "Malatang with chicken and rice", em: "\u{1F35C}", rid: null, held: false, have: HAVE2, day: "<b>Thursday</b> 15 Oct <em>Today</em>", who: "Everyone · 2" },
    past: { t: "Egg fried rice", em: "\u{1F373}", rid: "efr", held: false, mins: "15 min", have: HAVE, day: "<b>Tuesday</b> 13 Oct", who: "Everyone · 2", past: true },
    view: { t: "Egg fried rice", em: "\u{1F373}", rid: "efr", held: false, mins: "15 min", have: HAVE, day: "<b>Thursday</b> 15 Oct <em>Today</em>", who: "Priya · 1", ro: "Priya" }
  };
  var m = MEALS[S], n = 2, canMake = !m.past && !m.ro;
  var SW = [["saved", "Saved recipe"], ["adhoc", "Made up"], ["held", "Held"], ["missing", "2 missing"], ["past", "Past day"], ["view", "View only"]];

  function sig() { var b = !!m.miss; return '<span class="sig ' + (b ? "bad" : "ok") + '" role="img" aria-label="' + (b ? "Something is missing" : "Dealt with") + '">' + (b ? ic.bang : ic.check) + "</span>"; }
  function makeBtn(cls, label) { return '<button type="button" class="mkbtn ' + cls + '" data-make aria-label="Make it: ' + esc(m.t) + '">' + ic.pan + (label || "Make it") + "</button>"; }
  function card() {
    return '<div class="sw"><article class="mc lite sel' + (m.past ? " past" : "") + '" tabindex="0" aria-label="' + esc(m.t) + '"><span class="em">' + m.em + '</span><div class="tx"><h3>' + esc(m.t) + "</h3><p>" + esc(m.who) + "</p>" +
      (O === "c" && canMake ? makeBtn("pill") : "") + "</div>" + sig() + '<button class="more" aria-label="Actions for ' + esc(m.t) + '">' + ic.more + "</button></article></div>";
  }
  function body() {
    var h = "";
    if (m.ro) h += '<p class="rol">' + ic.eye + "<span>View only, " + m.ro + "'s plan. You can look, not change.</span></p>";
    else if (m.past) h += '<p class="rol">' + ic.eye + "<span>This night has passed. You can look, not change.</span></p>";
    if (!m.rid) h += '<p class="srcl">' + ic.spark + " <b>Made up by your AI</b> · not saved as a recipe</p>";
    if (m.mins) h += '<p class="tt">Total time <b>' + m.mins + "</b></p>";
    if (!m.ro && !m.past) h += '<div class="ppl"><span class="lbl">People</span><button class="ib" data-n="-1" aria-label="Fewer people">−</button><b>' + n + '</b><button class="ib" data-n="1" aria-label="More people">+</button></div>';
    h += '<ul class="ing one">' + (m.miss || []).map(function (x) { return '<li class="m red"><span class="in">' + esc(x[0]) + '</span><span class="qy">' + esc(x[1]) + '</span><button class="ib" aria-label="Add ' + esc(x[0]) + ' to the shopping list">' + ic.cart + "</button></li>"; }).join("") + m.have.map(function (r) { return '<li><span class="in">' + esc(r[0]) + '</span><span class="qy">' + esc(r[1]) + "</span></li>"; }).join("") + "</ul>";
    return h;
  }
  function foot() {
    if (m.ro || m.past) return "";   /* view only: no Hold, no Add, no Make it (decisions 190, 206) */
    var hv = m.have.length, o = '<button class="b2 hold' + (m.held ? " on" : "") + '" data-hold aria-pressed="' + m.held + '" aria-label="' + (m.held ? "Release the hold on " : "Hold all ") + hv + ' on-hand ingredients">' + ic.mark + (m.held ? " Release" : " Hold") + ' <b class="ct">' + hv + "</b></button>";
    if (m.miss) o += '<button class="b2 add" aria-label="Add ' + m.miss.length + ' missing ingredients to the shopping list">' + ic.cart + ' Add <b class="ct">' + m.miss.length + "</b></button>";
    if (O === "a") o += makeBtn("b2 make", "Make it");
    return o;
  }
  function render() {
    var f = foot(), chip = O === "b" && canMake ? makeBtn("chip") : "";
    document.getElementById("pw").innerHTML =
      '<section class="stackw pw hdl-none noin" role="region" aria-labelledby="stt"><div class="dpiece"><div class="dkh"><h2 id="stt">' + m.day + "</h2>" + chip + '<button class="ib" aria-label="Close detail">' + ic.x + '</button></div><div class="pw-stack">' + card() + '</div><button class="tongue" aria-label="Drag down to close"><i></i></button></div>' +
      '<div class="spiece"><div class="sbody">' + body() + "</div>" + (f ? '<footer class="sfoot' + (O === "a" && canMake ? " hasmake" : "") + '">' + f + "</footer>" : "") + "</div></section>";
  }
  document.addEventListener("click", function (e) {
    var t = e.target instanceof Element ? e.target : null; if (!t) return;
    if (t.closest("[data-make]")) { K.go(m.rid ? "recipe" : "cooking", location.pathname.split("/").pop() + location.search); return; }
    if (t.closest("[data-hold]")) { m.held = !m.held; render(); return; }
    var p = t.closest("[data-n]"); if (p) { n = Math.max(1, n + +p.getAttribute("data-n")); render(); }
  });
  if (window.top === window) { var sw = document.getElementById("sw"); sw.hidden = false; sw.innerHTML = K.switcher("sw", "s", SW, S) + K.switcher("sw", "o", [["a", "A footer"], ["b", "B header"], ["c", "C row"]], O); }
  render();
})();
