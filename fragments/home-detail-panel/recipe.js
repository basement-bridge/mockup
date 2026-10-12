/* The recipe view of the detail panel: what a Cooking idea shows. Fetched on the first idea opened, never on page load (DESIGN.md section 6). No size rules.
   Same header, tiles, buttons and hint line as the item panel (flyout.css), so a switch between an item and an idea changes content, not shape. */
(function () {
"use strict";
var H = window.HDP, esc = H.esc, sv = H.sv, IC = H.IC, kbd = H.kbd;
function tile(ic, val, cap) { return '<div class="tl">' + ic + "<b>" + val + "</b><span>" + cap + "</span></div>"; }
H.recipeHtml = function (r) {
  var have = r.lines.filter(function (l) { return l.s !== "miss"; }), need = r.lines.filter(function (l) { return l.s === "miss"; });
  var allIn = !need.length;
  var head = '<div class="top shead"><span class="ph" aria-hidden="true">' + r.emoji + '</span><div class="sid"><h2 class="nm2" id="d-title" tabindex="-1" title="' + esc(r.name) + '">' + esc(r.name) + '</h2><span class="shq">' + (r.mins ? r.mins + " min &middot; " : "") + "serves " + r.serves + '</span><span class="shw">' + (allIn ? '<b class="rok">&#10003; All in</b>' : '<b class="rmiss">' + need.length + " missing</b>") + " &middot; " + esc(r.why) + '</span></div><div class="hacts" role="group" aria-label="Idea actions">' + H.ib("openrecipe", r.planned ? "Open plan" : "Open recipe", IC.ext, "O") + H.closeBtn() + "</div></div>";
  var tiles = '<div class="tiles tiles4">' + tile(sv(IC.clock, 20), r.mins ? r.mins + " min" : "?", "Time") + tile(sv(IC.serves, 20), r.serves, "Serves") + tile(sv(IC.tick, 20), have.length + " of " + r.lines.length, "In stock") + tile(sv(IC.basket, 20), r.uses.length, "Uses up") + "</div>";
  function line(l, n) {
    var nm = l.item ? '<button type="button" data-chip="item:' + l.item + '">' + esc(l.n) + "</button>" : esc(l.n);
    var sub = l.s === "have" ? "need " + esc(l.need) + " &middot; have " + esc(l.have) : l.s === "short" ? "need " + esc(l.need) + " &middot; have " + esc(l.have) + " <em>(running low)</em>" : "need " + esc(l.need) + " &middot; none in stock";
    var mk = l.s === "miss" ? "" : sv(IC.tick, 14);
    var go = l.s === "miss" ? (l.added ? '<span class="rok">On your list</span>' : '<button type="button" class="go" data-act="addline" data-n="' + n + '" aria-label="Add ' + esc(l.n) + ' to the list">+ List</button>') : "";
    return '<li class="rl ' + l.s + '"><span class="mk">' + mk + '</span><span class="t"><b>' + nm + "</b><small>" + sub + "</small></span>" + go + "</li>";
  }
  var all = r.lines;
  var stock = '<div class="rsec"><div class="sh2" style="margin:0">In your pantry</div></div><ul class="rlines">' + all.map(function (l, n) { return l.s !== "miss" ? line(l, n) : ""; }).join("") + "</ul>";
  var miss = need.length ? '<div class="rsec"><div class="sh2" style="margin:0">Missing</div>' + (r.added ? '<span class="rok">All on your list</span>' : '<button type="button" class="link" data-act="addmissing">Add all to list ' + kbd("S") + "</button>") + '</div><ul class="rlines">' + all.map(function (l, n) { return l.s === "miss" ? line(l, n) : ""; }).join("") + "</ul>" : "";
  var uses = r.uses.length ? '<div class="sh2" style="margin:0">Uses up</div><div class="chips">' + r.uses.map(function (id) { var it = H.item(id); return '<button type="button" class="chip" data-chip="item:' + id + '"><span aria-hidden="true">' + it.emoji + "</span>" + esc(it.name) + "</button>"; }).join("") + "</div>" : "";
  /* a meal already on today's plan (decision 158, PROPOSED): "Planned today" instead of Add to plan, which would plan it twice; P says so in words; Open recipe is kept (Open plan when it has no recipe page) */
  var pb = r.planned ? '<button type="button" class="btn pri" data-act="planned" aria-disabled="true">' + sv(IC.tick) + "<span>Planned today</span></button>" : '<button type="button" class="btn pri" data-act="plan">' + sv(IC.cal) + "<span>Add to plan</span>" + kbd("P") + "</button>";
  var ol = r.planned ? "Open plan" : "Open recipe";
  var acts = '<div class="sacts">' + pb + '<button type="button" class="btn ghost" data-act="openrecipe">' + sv(IC.ext) + "<span>" + ol + "</span>" + kbd("O") + "</button></div>";
  var hint = '<p class="phint hint">' + (r.planned ? "" : kbd("P") + " add to plan ") + kbd("O") + " " + ol.toLowerCase() + " " + kbd("S") + " add missing to list</p>";
  var fit = '<p class="fit"><b>Why this fits</b>' + (r.planned ? "On the plan for today, so there is nothing to decide. " : "") + esc(r.fit) + "</p>";
  return head + tiles + fit + acts + hint + miss + stock + uses;
};
})();
