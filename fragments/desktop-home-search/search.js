/* The search brain: sample index, the contextual ranking, the dropdown. Fetched on first focus or keystroke (home.js). Mockup only.
   MOCKED: every number and sentence below. The ranking is written as a pure function (index + context in, groups out) so a build can
   run it where the backend decision says (client on a cached index, or a server call); that decision is not made here (see the PR, Proposal S-P1).
   Today's real search is name matching only (substring, plural folded). Matching an ingredient, and everything in rank(), is new. */
(function () {
"use strict";
var X = window.DHS, $ = X.$, esc = X.esc, S = X.S;

/* ---- context the ranking reads (in the build each line names its source) ---- */
var EAT = ["Sam", "Jo", "Priya"];                                       /* Kitchie: who is eating tonight */
var AVOID = { Priya: { pb: "peanuts" }, Jo: { eggs: "eggs" } };          /* Kitchie food rules, hard avoids only (preferences) */
var PLANNED = { laksa: "Thu" };                                         /* Kitchie: other nights this week */
var TONIGHT = "traybake";                                               /* Kitchie: tonight's plan, only in the planned state */
/* Kitchie stock: key -> [emoji, name, location, quantity, days to use-by or null, running low] */
var PAN = {
  thighs: ["🍗", "Chicken thighs", "Fridge", "600 g", 1, 0], stock: ["🍲", "Chicken stock", "Pantry", "2 cartons", null, 0], chickpeas: ["🫘", "Chickpeas (tin)", "Pantry", "3 tins", null, 0],
  cuc: ["🥒", "Cucumbers", "Fridge", "2", 1, 0], spring: ["🌱", "Spring onions", "Fridge", "1 bunch", 1, 0], spinach: ["🥬", "Spinach", "Fridge", "1 bag", 2, 0],
  limes: ["🍋", "Limes", "Fridge", "1", 6, 1], pb: ["🥜", "Crunchy peanut butter", "Pantry", "a little", null, 1], eggs: ["🥚", "Eggs", "Fridge", "6", 9, 0],
  rice: ["🍚", "Rice", "Pantry", "2 kg", null, 0], lemons: ["🍋", "Lemons", "Fridge", "3", 8, 0], potatoes: ["🥔", "Potatoes", "Pantry", "1.5 kg", null, 0], garlic: ["🧄", "Garlic", "Pantry", "2 heads", null, 0],
  tomatoes: ["🍅", "Tinned tomatoes", "Pantry", "4 tins", null, 0], onions: ["🧅", "Onions", "Pantry", "5", null, 0], cheddar: ["🧀", "Cheddar", "Fridge", "200 g", 12, 0]
};
var LIST = { breast: ["🍗", "Chicken breast", "1 pack"], coriander: ["🌿", "Coriander", "1 bunch"], eggs2: ["🥚", "Eggs", "1 dozen"] };
var MISS = { laksa: "laksa paste", coco: "coconut milk", noodles: "rice noodles", tortillas: "tortillas", coriander: "coriander", avocado: "avocado", feta: "feta" };  /* not in stock */
var ONLIST = { coriander: 1 };
/* recipes: [name, emoji, minutes, ingredient keys] */
var REC = {
  traybake: ["Lemon chicken traybake", "🍋", 45, ["thighs", "lemons", "potatoes", "garlic"]],
  curry: ["Chickpea and spinach curry", "🍛", 30, ["chickpeas", "spinach", "tomatoes", "onions"]],
  salad: ["Cucumber and spring onion salad", "🥗", 10, ["cuc", "spring", "limes"]],
  cfr: ["Chicken fried rice", "🍚", 20, ["thighs", "rice", "eggs", "spring"]],
  laksa: ["Chicken laksa", "🍜", 35, ["thighs", "laksa", "coco", "noodles"]],
  tacos: ["Lime and coriander tacos", "🌮", 25, ["thighs", "limes", "tortillas", "coriander", "avocado"]],
  satay: ["Chicken satay", "🍢", 30, ["thighs", "pb", "limes", "cuc"]],
  pnood: ["Peanut noodles", "🍜", 15, ["pb", "noodles", "spring"]],
  shak: ["Shakshuka", "🍳", 25, ["eggs", "tomatoes", "onions", "feta"]]
};
var NAME = function (k) { return PAN[k] ? PAN[k][1].replace(/ \(tin\)$/, "").toLowerCase() : MISS[k]; };

/* ---- matching: today's rule (substring, case and accents ignored, plural folded) ---- */
function foldW(w) { return w.length > 3 && /ies$/.test(w) ? w.slice(0, -3) + "y" : w.length > 3 && /[^su]s$/.test(w) ? w.slice(0, -1) : w; }
function fold(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).map(foldW).join(" "); }
function has(text, q) { return fold(text).indexOf(q) > -1; }
function mark(text, raw) {
  var i = text.toLowerCase().indexOf(raw.toLowerCase()); if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<span class="mt">' + esc(text.slice(i, i + raw.length)) + "</span>" + esc(text.slice(i + raw.length));
}
function when(d) { return d <= 0 ? "today" : d === 1 ? "tomorrow" : "in " + d + " days"; }

/* ---- the ranking (NEW). Groups in a fixed order; inside a group, context decides. Hard avoids never rank as a candidate, they are listed last, dimmed, with who and why. ---- */
function rank(raw, planned) {
  var q = fold(raw.trim()), out = { plan: [], fits: [], pantry: [], shop: [], list: [], out: [] };
  Object.keys(REC).forEach(function (id) {
    var r = REC[id], byName = has(r[0], q), ing = r[3].filter(function (k) { return has(NAME(k), q); })[0];
    if (!byName && !ing) return;
    var miss = r[3].filter(function (k) { return !PAN[k]; }), hold = [];
    EAT.forEach(function (w) { r[3].forEach(function (k) { if (AVOID[w] && AVOID[w][k]) hold.push([w, AVOID[w][k]]); }); });
    var off = r[3].filter(function (k) { return PAN[k] && PAN[k][4] != null && PAN[k][4] <= 2; });
    var o = { id: id, r: r, miss: miss, off: off, byName: byName, ing: ing, hold: hold, plan: PLANNED[id] };
    if (hold.length) out.out.push(o);
    else if (planned && id === TONIGHT) out.plan.push(o);
    else if (miss.length <= 2) out.fits.push(o);
    else out.shop.push(o);
  });
  /* fits: uses something going off first (use-by pressure), then a name match over an ingredient match, then fewer missing, then quicker */
  var soon = function (o) { return o.off.length ? Math.min.apply(null, o.off.map(function (k) { return PAN[k][4]; })) : 99; };
  out.fits.sort(function (a, b) { return soon(a) - soon(b) || +b.byName - +a.byName || a.miss.length - b.miss.length || a.r[2] - b.r[2]; });
  out.shop.sort(function (a, b) { return a.miss.length - b.miss.length || a.r[2] - b.r[2]; });
  Object.keys(PAN).forEach(function (k) {
    if (!has(PAN[k][1], q)) return; var p = PAN[k];
    out.pantry.push({ id: k, p: p, key: p[4] != null ? p[4] : p[5] ? 50 : 99 });
  });
  out.pantry.sort(function (a, b) { return a.key - b.key; });
  Object.keys(LIST).forEach(function (k) { if (has(LIST[k][1], q)) out.list.push({ id: k, l: LIST[k] }); });
  return out;
}

/* ---- the dropdown: at most 8 rows. One row from each group that has a match first, then the rest by group priority and its own cap ---- */
var GROUPS = [["plan", "On tonight's plan", 1], ["fits", "Fits tonight", 3], ["pantry", "In your pantry", 3], ["shop", "Needs a shop", 2], ["list", "On your shopping list", 2], ["out", "Left out for who is eating", 1]];
var MAXROWS = 8;
function pick(out, planned) {
  var take = {}, used = 0;
  GROUPS.forEach(function (g) { take[g[0]] = 0; if (out[g[0]].length) { take[g[0]] = 1; used++; } });
  GROUPS.forEach(function (g) { while (used < MAXROWS && take[g[0]] < Math.min(g[2], out[g[0]].length)) { take[g[0]]++; used++; } });
  return GROUPS.filter(function (g) { return take[g[0]]; }).map(function (g) {
    return { k: g[0], name: g[0] === "fits" && planned ? "If plans change" : g[1], total: out[g[0]].length, rows: out[g[0]].slice(0, take[g[0]]) };
  });
}
function list2(a) { return a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0] || ""; }
function row(g, o, raw, n) {
  var e, name, sub, rk = "", cls = "", kind = "recipe", id = o.id, x = "";
  if (g === "plan" || g === "fits" || g === "shop" || g === "out") {
    var r = o.r; e = r[1]; name = mark(r[0], raw);
    var missTxt = o.miss.length ? o.miss.map(function (k) { return NAME(k) + (ONLIST[k] ? " (on your list)" : ""); }).join(", ") : "";
    if (g === "plan") { sub = "Planned for tonight &middot; " + r[2] + " min"; rk = "On the plan"; cls = "ok"; }
    else if (g === "out") { sub = list2(o.hold.map(function (h) { return h[0] + " avoids " + h[1]; })) + " &middot; can still be opened"; rk = "Left out"; cls = ""; x = " out"; }
    else if (g === "shop") { sub = missTxt + " &middot; " + r[2] + " min"; rk = "Missing " + o.miss.length; cls = "hot"; }
    else {
      var oo = o.off.slice().sort(function (a, b) { return PAN[a][4] - PAN[b][4]; })[0], why = o.off.length ? "uses the " + NAME(oo) + " going off " + when(PAN[oo][4]) : !o.byName && o.ing ? "has " + NAME(o.ing) : "";
      sub = (o.miss.length ? "needs " + missTxt : why || "everything is in") + " &middot; " + r[2] + " min"; rk = o.miss.length ? "Missing " + o.miss.length : "All in"; cls = o.miss.length ? "hot" : "ok";
      if (o.miss.length && why) sub = why + " &middot; needs " + missTxt;
    }
    if (o.plan && g !== "plan") sub += " &middot; planned " + o.plan;
  } else if (g === "pantry") {
    var p = o.p; kind = "item"; e = p[0]; name = mark(p[1], raw); var d = p[4];
    rk = d != null && d <= 3 ? "Use by " + when(d) : p[5] ? "Running low" : p[3]; cls = (d != null && d <= 2) || p[5] ? "hot" : "";
    sub = p[2] + " &middot; " + p[3] + (X.ST.planned && o.id === "thighs" ? " &middot; in tonight's traybake" : "");
  } else { kind = "list"; e = "🛒"; var l = o.l; name = mark(l[1], raw); sub = "Shopping &middot; " + l[2]; rk = "On the list"; }
  return '<button type="button" class="i' + x + '" role="option" id="r' + n + '" data-kind="' + kind + '" data-id="' + id + '" data-g="' + g + '" aria-selected="false" tabindex="-1"><span class="e s" aria-hidden="true">' + e + '</span><span class="t"><b>' + name + "</b><small>" + sub + '</small></span><span class="rk ' + cls + '">' + rk + "</span></button>";
}

var lastQ = null;
function update() {
  var q = $("#q"), box = $("#sres"), desk = $("#desk"); if (!q || !box) return;
  var raw = q.value.trim(), open = raw.length >= 2 && !S.suppress && !S.dismissed;
  desk.classList.toggle("searching", open); q.setAttribute("aria-expanded", open);
  if (!open) { box.hidden = true; q.removeAttribute("aria-activedescendant"); lastQ = null; return; }
  var pl = X.ST.planned, gs = pick(rank(raw, pl), pl), n = 0, h = "";
  h += '<div class="ctx">Ranked for tonight &middot; ' + list2(EAT) + " eating" + (pl ? " &middot; tonight is planned" : "") + "</div>";
  if (!gs.length) {
    h += '<div class="empt"><b>Nothing matches &ldquo;' + esc(raw) + '&rdquo;</b> in recipes, pantry, shopping or the plan.</div>' +
      '<button type="button" class="i" role="option" id="r0" data-kind="addlist" data-id="' + esc(raw) + '" aria-selected="false" tabindex="-1"><span class="e s" aria-hidden="true">🛒</span><span class="t"><b>Add &ldquo;' + esc(raw) + '&rdquo; to the shopping list</b><small>Same as the Pantry search when nothing is found</small></span></button>';
    n = 1;
  } else gs.forEach(function (g) {
    h += '<div class="g" role="presentation" id="g-' + g.k + '">' + g.name + (g.total > g.rows.length ? " <i>" + g.rows.length + " of " + g.total + "</i>" : "") + "</div>";
    g.rows.forEach(function (o) { h += row(g.k, o, raw, n++); });
  });
  h += '<div class="foot" aria-hidden="true"><span><span class="kbd">&uarr;</span><span class="kbd">&darr;</span> move</span><span><span class="kbd">Enter</span> open</span><span><span class="kbd">Esc</span> clear</span></div>';
  box.innerHTML = h; box.hidden = false; box.dataset.count = n;
  if (lastQ !== raw) S.active = 0; lastQ = raw; S.active = Math.min(S.active, n - 1); mark2();
  var live = $("#live"); if (live) live.textContent = n + (n === 1 ? " result" : " results");
}
function mark2() {
  var q = $("#q"), rows = document.querySelectorAll("#sres .i");
  rows.forEach(function (r, i) { r.setAttribute("aria-selected", i === S.active); if (i === S.active) { q.setAttribute("aria-activedescendant", r.id); r.scrollIntoView({ block: "nearest" }); } });
}
function choose(i) {
  var r = document.querySelectorAll("#sres .i")[i]; if (!r) return; var d = r.dataset;
  S.suppress = true;                                      /* the box keeps what was typed; the list closes, nothing is cleared (decision 291) */
  update();
  if (d.kind === "addlist") X.toast("Added “" + d.id + "” to the shopping list. Undo");
  else if (d.kind === "list") X.toast("Opens Shopping with " + d.id.replace("eggs2", "eggs") + " in view (a Proposal; see the notes).");
  else X.pick({ kind: d.kind, id: d.id, from: "search", g: d.g });
}
X.update = update; X.REC = REC; X.PAN = PAN; X.NAME = NAME; X.AVOID = AVOID; X.EAT = EAT; X.when = when; X.rank = rank;

document.addEventListener("keydown", function (e) {
  var q = $("#q"); if (!q || e.target !== q) return; var box = $("#sres"), n = box && !box.hidden ? +box.dataset.count : 0;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault(); if (!n) { S.dismissed = false; S.suppress = false; update(); return; }
    S.active = (S.active + (e.key === "ArrowDown" ? 1 : -1) + n) % n; mark2();
  } else if (e.key === "Enter") { if (n) { e.preventDefault(); choose(S.active); } }
  else if (e.key === "Escape" && !e.ctrlKey && !e.metaKey) {
    if (q.value || n) { e.preventDefault(); q.value = ""; X.ST.q = ""; $("#us").classList.remove("has"); S.suppress = false; S.dismissed = false; update(); X.syncBar(); }
    else q.blur();
  }
});
document.addEventListener("mousedown", function (e) { if (e.target.closest("#sres")) e.preventDefault(); });
document.addEventListener("click", function (e) { var r = e.target.closest("#sres .i"); if (r) choose([].indexOf.call(document.querySelectorAll("#sres .i"), r)); });
document.addEventListener("mouseover", function (e) { var r = e.target.closest("#sres .i"); if (r) { var i = [].indexOf.call(document.querySelectorAll("#sres .i"), r); if (i !== S.active) { S.active = i; mark2(); } } });
update();
})();
