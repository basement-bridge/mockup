/* The 400px flyout lane. Fetched on the first result picked (or first row opened). STAND-INS for the real components:
   the recipe flyout is fragments/recipe-browse-full (decision 288 to 291), the item panel is the Pantry's flyout (decision 140/291).
   They are drawn small here so the search behaviour can be judged: where it lands, what gets focus, how it closes. */
(function () {
"use strict";
var X = window.DHS, $ = X.$, esc = X.esc, S = X.S;
function recipe(id, g) {
  var r = X.REC && X.REC[id]; if (!r) { r = { traybake: ["Lemon chicken traybake", "🍋", 45, ["thighs", "lemons", "potatoes", "garlic"]] }.traybake; }
  var miss = r[3].filter(function (k) { return !X.PAN || !X.PAN[k]; }), hold = [];
  if (X.AVOID) X.EAT.forEach(function (w) { r[3].forEach(function (k) { if (X.AVOID[w] && X.AVOID[w][k]) hold.push(w + " avoids " + X.AVOID[w][k]); }); });
  var li = r[3].map(function (k) { var inn = X.PAN && X.PAN[k]; return "<li><span>" + esc(X.NAME ? X.NAME(k) : k) + '</span><span class="' + (inn ? "rok" : "rmiss") + '">' + (inn ? "In stock" : "Missing") + "</span></li>"; }).join("");
  return '<div class="fh"><span class="e" aria-hidden="true">' + r[1] + '</span><div><b>' + esc(r[0]) + "</b><small>" + r[2] + ' min &middot; serves 3 &middot; ' + (miss.length ? miss.length + " missing" : "All in") + '</small></div><button type="button" class="x" aria-label="Close (Ctrl Esc)" data-x="1">&times;</button></div>' +
    (hold.length ? '<p class="blk">Left out tonight: ' + esc(hold.join(", ")) + ". You can still open it, plan it for another night, or change who is eating.</p>" : '<p class="why">Household says first, then the ingredients.</p>') +
    "<ul>" + li + '</ul><div class="sacts"><button type="button" class="btn pri" data-say="Cook now">Cook now</button><button type="button" class="btn" data-say="Plan">Plan</button>' + (miss.length ? '<button type="button" class="btn" data-say="Added the missing things to the list">Add ' + miss.length + " to list</button>" : "") + '</div><p class="phint"><span class="kbd">Ctrl Esc</span> closes. Stand-in for the Recipes browse flyout (<code>fragments/recipe-browse-full</code>).</p>';
}
function item(id) {
  var p = X.PAN[id] || X.PAN.thighs;
  return '<div class="fh"><span class="e" aria-hidden="true">' + p[0] + '</span><div><b>' + esc(p[1]) + "</b><small>" + p[2] + " &middot; " + p[3] + '</small></div><button type="button" class="x" aria-label="Close (Ctrl Esc)" data-x="1">&times;</button></div>' +
    "<ul><li><span>Use by</span><span>" + (p[4] != null ? X.when(p[4]) : "not set") + "</span></li><li><span>Level</span><span>" + (p[5] ? "Running low" : "Some") + "</span></li><li><span>Location</span><span>" + p[2] + '</span></li></ul><div class="sacts"><button type="button" class="btn pri" data-say="Used one">Use one</button><button type="button" class="btn" data-say="Opens Edit">Edit</button></div><p class="phint"><span class="kbd">Ctrl Esc</span> closes. Stand-in for the Pantry item flyout (decision 140).</p>';
}
X.pick = function (r) { X.need("search.js").then(function () { open(r); }); };   /* stand-in data: the real flyout reads its one recipe or item when opened */
function open(r) {
  var f = $("#fly"); if (!f) return;
  f.innerHTML = r.kind === "item" ? item(r.id) : recipe(r.id, r.g); f.hidden = false; f.dataset.kind = r.kind; f.dataset.from = r.from;
  f.querySelectorAll("[data-say]").forEach(function (b) { b.addEventListener("click", function () { X.toast(b.dataset.say + "."); }); });
  f.querySelector(".x").addEventListener("click", function () { X.closeFly(true); });
  var desk = $("#desk"); desk.classList.add("flyopen");
  if (r.from === "search") { S.suppress = true; X.update(); }   /* focus stays where it was; typed words stay in the box */
}
X.closeFly = function (focusBack) {
  var f = $("#fly"); if (!f || f.hidden) return; f.hidden = true; f.innerHTML = ""; $("#desk").classList.remove("flyopen");
  if (focusBack) { var q = $("#q"); if (q && q.value) { S.suppress = true; q.focus(); } }   /* focus back on the box, list not reopened (291) */
};
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); X.closeFly(true); } });
})();
