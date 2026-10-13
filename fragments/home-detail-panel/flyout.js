/* The Recipes summary flyout, as Home draws it for a RECIPE SEARCH RESULT (decisions 187 to 190). Fetched on the first recipe result chosen, never on page load (DESIGN.md section 6).
   Same markup and classes as ../recipe-browse-full option A (the build's recipe-tab/flyout.ts): header, "Household says" first, Ingredients with All in or N missing, Cook now and Plan, Open full recipe.
   Sample proof below is for this mockup only. No size rules. */
(function () {
"use strict";
var H = window.HDP, esc = H.esc, D = window.HDP_DATA;
var css = document.createElement("link"); css.rel = "stylesheet"; css.href = "flyout.css"; document.head.appendChild(css);   /* the styles come with the script, on first use */
var THUMB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11v9H4v-9zM7 11l4-8c1.6 0 2.6 1.2 2.2 2.8L12.6 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/></svg>';
/* sample proof: times cooked, last cooked, and a reaction per member (up, dn or none); an idea with no entry reads "Not cooked yet" */
var PROOF = {
  "lime-tacos": { n: 5, last: "2 weeks ago", on: "Mon 28 Sep", who: { me: "up", jo: "up", priya: "dn" }, notes: [["Jo", "3 weeks ago", "Double the limes."], ["Sam", "2 months ago", "Good with the jalapeños in the sauce."]] },
  "cuke-salad": { n: 2, last: "6 weeks ago", on: "Mon 31 Aug", who: { me: "up", jo: "up", priya: "up" }, notes: [] }
};
var MEM = ["me", "jo", "priya"];
function mem(k, v, n) {
  var p = D.people[k], lab = v === "up" ? "Liked it" : v === "dn" ? "Not for me" : "Not rated", cls = v || "no";
  return '<div class="rb-mem"><span class="rb-av m' + (n + 1) + '" aria-hidden="true">' + p.initial + "</span><b>" + esc(p.name) + '</b><span class="rb-lbl">' + lab + '</span><span class="rb-th ' + cls + '" role="img" aria-label="' + lab + '">' + (v ? '<svg viewBox="0 0 24 24" aria-hidden="true"' + (v === "dn" ? ' style="transform:rotate(180deg)"' : "") + ">" + THUMB.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "") + "</svg>" : "") + "</span></div>";
}
H.flyHtml = function (r) {
  var pr = PROOF[r.id], need = r.lines.filter(function (l) { return l.s === "miss"; }), n = need.length;
  var meta = (r.mins ? r.mins + " min · " : "") + "serves " + r.serves;
  var tag = n ? '<span class="rb-tg miss">' + n + " missing</span>" : '<span class="rb-tg">&#10003; All in</span>';
  var says = pr
    ? '<div class="rb-cooked"><div><b class="rb-big">' + pr.n + '&times;</b><small>times cooked</small></div><div><b class="rb-big s">' + esc(pr.last) + "</b><small>last cooked, " + esc(pr.on) + '</small></div></div><div class="rb-mems">' + MEM.map(function (k, i) { return mem(k, pr.who[k], i); }).join("") + "</div>"
      + (pr.notes.length ? '<h4 class="rb-h4 sub">Notes <span class="n">' + pr.notes.length + "</span></h4>" + pr.notes.map(function (q, i) { return '<blockquote class="rb-q"><span class="rb-av m' + (i + 1) + '" aria-hidden="true">' + q[0][0] + "</span><div><b>" + q[0] + "</b> <small>" + q[1] + "</small><p>" + esc(q[2]) + "</p></div></blockquote>"; }).join("") : "")
    : '<div class="rb-empty"><span class="rb-e" aria-hidden="true">🍽️</span><div><b>Not cooked yet</b><small>Nobody has rated it. Cook it once and the thumbs and notes start here.</small></div></div><div class="rb-mems">' + MEM.map(function (k, i) { return mem(k, "", i); }).join("") + "</div>";
  var lines = r.lines.slice().sort(function (a, b) { return (b.s === "miss") - (a.s === "miss"); }).map(function (l) {
    var no = l.s === "miss";
    return '<li' + (no ? ' class="no"' : "") + "><span>" + (no ? "&#10007;" : "&#10003;") + "</span><span>" + esc(l.n) + "</span><b>" + esc(l.need) + "</b>" + (no ? "<em>Missing</em>" : "") + "</li>";
  }).join("");
  return '<aside class="rb-fly" aria-label="Recipe summary"><header class="rb-fh"><span class="rb-e big" aria-hidden="true">' + r.emoji + '</span><div class="rb-ft"><h3 id="d-title" tabindex="-1">' + esc(r.name) + "</h3><small>" + esc(meta) + '</small></div><button type="button" class="rb-x" data-act="close" aria-label="Close" title="Close (' + H.MOD + ' Esc)">&times;</button></header>'
    + '<div class="rb-fb"><section class="rb-sec"><h4 class="rb-h4">Household says</h4>' + says + '</section><section class="rb-sec" aria-label="Ingredients"><h4 class="rb-h4">Ingredients ' + tag + '</h4><ul class="rb-ing two">' + lines + "</ul></section></div>"
    + '<footer class="rb-ff"><div class="rb-acts"><button type="button" class="rb-btn pri" data-act="cook">Cook now</button><button type="button" class="rb-btn pri" data-act="planlink">Plan</button></div><a class="rb-open c" href="#" data-act="openrecipe">Open full recipe <span class="kbd">O</span></a>'
    + '<p class="phint hint"><span class="kbd">' + H.MOD + " Esc</span> to close, <span class=\"kbd\">?</span> for all shortcuts</p></footer></aside>";
};
})();
