/* The index page's frames: each one is the real page, drawn small, at one state (?embed=1 keeps the size and theme control out). Phone frames are 390 x 760; desktop frames are the 1280 page scaled to half.
   Plain names and the state lists stay here (AGENTS.md). Frames load lazily, so the index itself only loads a stylesheet and this file. */
(function () {
  var F = {
    a: [["1 Reading live", "step=view&phase=hold&p=0.6&pre=part"], ["2 Tap a Check box", "step=view&phase=found&pre=half&sel=l9"], ["3 A no match, tapped", "step=view&phase=found&pre=all&sel=l13"], ["4 Last look", "step=view&phase=end&pre=half&walk=1&sel=l13"], ["5 Whole receipt read", "step=view&phase=end&pre=half&scroll=max"], ["6 Add to the Pantry", "step=view&phase=end&pre=resolved&sheet=summary"]],
    b: [["1 Reading live, read-only", "step=view&phase=hold&p=0.6&pre=part"], ["2 Photo held, Check", "step=view&walk=1&pre=half&sel=l9"], ["3 No match, crossed off", "step=view&walk=1&pre=half&sel=l14&res=l14:skip"], ["4 All answered", "step=view&phase=end&pre=resolved&walk=1&sel=l14&res=l14:skip"], ["5 Add to the Pantry", "step=view&phase=end&pre=resolved&sheet=summary"]],
    c: [["1 Dock fills as it reads", "step=view&phase=found&pre=part"], ["2 Card, a no match", "step=view&phase=found&pre=half&res=l6:match"], ["3 Tapped box, Ready line", "step=view&phase=found&pre=half&sel=l1"], ["4 Last look", "step=view&phase=end&pre=half&walk=1&sel=l13"], ["5 Add to the Pantry", "step=view&phase=end&pre=resolved&sheet=summary"]],
    d: [["1 List fills as it reads", "step=view&phase=found&pre=part"], ["2 Quick answers on rows", "step=view&phase=found&pre=half&scroll=max"], ["3 Row opened", "step=view&phase=found&pre=half&sel=l9"], ["4 Whole receipt read", "step=view&phase=end&pre=half&scroll=max"], ["5 Add to the Pantry", "step=view&phase=end&pre=resolved&sheet=summary"]]
  };
  var DESK = { a: "step=view&phase=found&pre=half&sel=l9", b: "step=view&walk=1&pre=half&sel=l9", c: "step=view&phase=found&pre=half", d: "step=view&phase=found&pre=half&sel=l9" };
  var EDGE = [["Looking", "phase=look"], ["Found, steady", "phase=hold&p=0.83&pre=part"], ["Taking the photo", "phase=take&p=1&pre=part"], ["Banked a screenful", "phase=banked&banked=10&pre=part"], ["Seen again", "phase=again&pre=half&pos=2&scroll=max"], ["Blurry", "cond=blur&phase=found&pre=half"], ["Not a receipt", "cond=wall&pre=half"], ["Too dark", "cond=dark&phase=found&pre=half"], ["Glare", "cond=glare&phase=found"], ["Cut off at the edge", "cond=partial&phase=found"], ["Resting", "cond=rest"], ["Camera refused", "step=refused&x=1"], ["A dropped photo (desktop)", "still=1&phase=still&pre=part"], ["Done and undo", "step=done"]];
  var src = function (d, q) { return "live-" + d + ".html?" + (/step=/.test(q) ? "" : "step=view&") + q + "&embed=1"; };
  var build = function (host, d, list) {
    host.innerHTML = list.map(function (x) { return '<figure class="fr"><figcaption>' + x[0] + '</figcaption><div class="ph"><iframe loading="lazy" title="' + x[0] + '" src="' + src(d, x[1]) + '"></iframe></div></figure>'; }).join("");
  };
  document.querySelectorAll("[data-strip]").forEach(function (h) { build(h, h.dataset.strip, F[h.dataset.strip]); });
  document.querySelectorAll("[data-edge]").forEach(function (h) { build(h, "a", EDGE); });
  document.querySelectorAll("[data-desk]").forEach(function (h) { var d = h.dataset.desk; h.innerHTML = '<div class="dfr"><iframe loading="lazy" title="Desktop, direction ' + d.toUpperCase() + '" src="' + src(d, DESK[d]) + '"></iframe></div>'; });
  document.querySelectorAll("[data-conf]").forEach(function (h) {
    h.innerHTML = [["pips", "Dots (5, 3, 1), the owner's idea"], ["bars", "Rising bars (3)"], ["ring", "Ring (thirds)"]].map(function (x) { return '<figure class="fr crop"><figcaption>' + x[1] + '</figcaption><div class="ph"><iframe loading="lazy" title="' + x[1] + '" src="live-a.html?step=view&phase=found&pre=half&scroll=max&conf=' + x[0] + '&embed=1"></iframe></div></figure>'; }).join("");
  });
})();
