/* Cooking: the ingredients this step uses. Mockup data and rendering only; nothing is saved.
   The data mirrors the proposed stored shape (docs/cook-step-ingredients-analysis.md): a step carries
   uses: [{ ing: <ingredient id>, amount: <number> | "all" | "rest" | null }], or has no `uses` at all (never tagged).
   null = used here, amount not given. Amounts are in the ingredient's own unit; nothing converts. */
(function () {
  "use strict";
  var RECIPES = {
    rice: {
      name: "Garlic chicken fried rice", serves: 4, tagged: true,
      ings: [
        { id: "i1", name: "chicken breast", pl: "chicken breasts", q: 2, u: "" },
        { id: "i2", name: "soy sauce", q: 3, u: "tbsp" },
        { id: "i3", name: "garlic", pl: "garlic cloves", sg: "garlic clove", q: 3, u: "" },
        { id: "i4", name: "oil", q: 4, u: "tbsp" },
        { id: "i5", name: "cooked rice", q: 3, u: "cup" },
        { id: "i6", name: "egg", pl: "eggs", q: 3, u: "" },
        { id: "i7", name: "spring onion", pl: "spring onions", q: 2, u: "" },
        { id: "i8", name: "salt", q: null, u: "" }
      ],
      steps: [
        { text: "Slice one chicken breast thin. Toss it with 1 tbsp of the soy sauce and 2 cloves of crushed garlic and leave it for 10 minutes.", uses: [["i1", 1], ["i2", 1], ["i3", 2]] },
        { text: "Rub the other breast with salt and sear it whole in 1 tbsp oil, 6 minutes a side. Rest it, then slice.", uses: [["i1", "rest"], ["i4", 1], ["i8", null]] },
        { text: "Wipe the pan, heat 2 tbsp oil and stir-fry the marinated chicken until cooked through.", uses: [["i4", 2]] },
        { text: "Add the last garlic clove and the rice. Toss in the rest of the soy sauce until the rice is hot.", uses: [["i3", "rest"], ["i5", "all"], ["i2", "rest"]] },
        { text: "Take the pan off the heat and let it sit for two minutes.", uses: [] },
        { text: "Scramble 2 eggs in a corner of the pan, then fold them through the rice.", uses: [["i6", 2]] },
        { text: "Fry the last egg in the last of the oil. Top the bowls with the egg, the sliced chicken and the spring onion.", uses: [["i6", "rest"], ["i4", "rest"], ["i7", "all"]] }
      ]
    },
    tray: {
      name: "Sheet-pan sausages and veg", serves: 4, tagged: true,
      ings: [
        { id: "i1", name: "sausage", pl: "sausages", q: 8, u: "" }, { id: "i2", name: "potato", pl: "potatoes", q: 600, u: "g" },
        { id: "i3", name: "carrot", pl: "carrots", q: 3, u: "" }, { id: "i4", name: "red onion", pl: "red onions", q: 2, u: "" },
        { id: "i5", name: "capsicum", q: 2, u: "" }, { id: "i6", name: "olive oil", q: 4, u: "tbsp" },
        { id: "i7", name: "smoked paprika", q: 2, u: "tsp" }, { id: "i8", name: "dried thyme", q: 1, u: "tsp" },
        { id: "i9", name: "honey", q: 2, u: "tbsp" }, { id: "i10", name: "mustard", q: 2, u: "tbsp" }
      ],
      steps: [
        { text: "Heat the oven to 220 degrees. Cut the potato, carrot, onion and capsicum into chunks and toss on the tray with the oil, paprika and thyme.", uses: [["i2", "all"], ["i3", "all"], ["i4", "all"], ["i5", "all"], ["i6", 3], ["i7", "all"], ["i8", "all"]] },
        { text: "Nestle the sausages in among the veg and roast for 25 minutes.", uses: [["i1", "all"]] },
        { text: "Stir the honey, mustard and the last of the oil together, brush it over, and roast 10 minutes more.", uses: [["i9", "all"], ["i10", "all"], ["i6", "rest"]] }
      ]
    }
  };
  /* Half tagged: only the first three steps were tagged. Not tagged yet: no step has uses. */
  RECIPES.half = JSON.parse(JSON.stringify(RECIPES.rice));
  RECIPES.half.name = "Garlic chicken fried rice";
  RECIPES.half.steps.forEach(function (s, k) { if (k > 2) delete s.uses; }); RECIPES.half.tagged = false;
  RECIPES.none = JSON.parse(JSON.stringify(RECIPES.rice));
  RECIPES.none.steps.forEach(function (s) { delete s.uses; }); RECIPES.none.tagged = false;

  var S = { rec: "rice", sv: 4, step: { a: 1, b: 0, c: 3 }, dock: false, more: { a: false, b: false }, all: false };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var FR = [[0.25, "¼"], [0.333, "⅓"], [0.5, "½"], [0.667, "⅔"], [0.75, "¾"]];
  function fmt(v) { /* same rounding as Kitchie's scaledAmount */
    var w = Math.floor(v + 1e-9), f = v - w;
    if (f < 0.05) return String(w);
    var h = FR.filter(function (x) { return Math.abs(f - x[0]) < 0.04; })[0];
    if (h) return (w === 0 ? "" : w) + h[1];
    return String(Math.round(v * 10) / 10);
  }
  var IC = {
    tick: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.6 8.2l2.3 2.3 4.5-4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg class="ch" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* The pure part: what the build's cook-model.ts would do with the stored links. */
  function plan(r) {
    var f = S.sv / r.serves, by = {}, tot = {};
    r.ings.forEach(function (i) { by[i.id] = i; tot[i.id] = i.q === null ? null : i.q * f; });
    var explicit = {}; /* ingredient id -> sum of explicit numbers over all steps */
    r.steps.forEach(function (s) { (s.uses || []).forEach(function (u) { if (typeof u[1] === "number") explicit[u[0]] = (explicit[u[0]] || 0) + u[1] * f; }); });
    function amountOf(u) { /* number in scaled units, or null (not given) */
      var t = tot[u[0]];
      if (typeof u[1] === "number") return u[1] * f;
      if (u[1] === "all") return t;
      if (u[1] === "rest") return t === null ? null : Math.max(0, t - (explicit[u[0]] || 0));
      return null;
    }
    return { f: f, by: by, tot: tot, amountOf: amountOf };
  }
  function unitText(i, v) { return i.u ? " " + i.u : ""; }
  function nameOf(i, v) { return v !== null && v > 1.0001 && i.pl ? i.pl : (i.sg && v !== null && v <= 1.0001 ? i.sg : i.name); }
  function usesOf(r, k) { return (r.steps[k].uses || []); }
  function whereUsed(r, id) { /* [{k, u}] in step order */
    var out = []; r.steps.forEach(function (s, k) { (s.uses || []).forEach(function (u) { if (u[0] === id) out.push({ k: k, u: u }); }); }); return out;
  }
  function list(ks) { return ks.length === 1 ? "step " + (ks[0] + 1) : "steps " + ks.map(function (k) { return k + 1; }).join(", "); }

  function rowFor(r, P, k, u) {
    var i = P.by[u[0]], a = P.amountOf(u), t = P.tot[u[0]], used = whereUsed(r, u[0]);
    var whole = u[1] === "all" || (used.length === 1 && a !== null && t !== null && Math.abs(a - t) < 1e-6);
    var amt, sub = "";
    if (a === null) amt = '<span aria-hidden="true">–</span><span class="sr-only">amount not given</span>', sub = "Amount not given";
    else if (whole || t === null) amt = fmt(a) + unitText(i);
    else amt = fmt(a) + " of " + fmt(t) + unitText(i);
    var before = 0, after = 0, bk = [], ak = [];
    if (a !== null) used.forEach(function (w) {
      if (w.k === k) return; var x = P.amountOf(w.u); if (x === null) return;
      if (w.k < k) { before += x; bk.push(w.k); } else { after += x; ak.push(w.k); }
    });
    var bits = [];
    if (before > 0.0001) bits.push(fmt(before) + " already used in " + list(bk));
    if (after > 0.0001) bits.push(fmt(after) + " left for " + list(ak));
    if (bits.length) sub = bits.join(", ");
    return '<li><span class="amt">' + amt + '</span><span class="nm">' + esc(nameOf(i, a)) + (sub ? "<em>" + esc(sub) + "</em>" : "") + "</span></li>";
  }
  function stripHtml(r, P, k, key, openAll) {
    var us = usesOf(r, k).slice().sort(function (x, y) { return r.ings.findIndex(function (i) { return i.id === x[0]; }) - r.ings.findIndex(function (i) { return i.id === y[0]; }); });
    var cap = 5, show = openAll || us.length <= cap + 1 ? us : us.slice(0, cap);
    var rows = show.map(function (u) { return rowFor(r, P, k, u); }).join("");
    var more = us.length > show.length ? '<button type="button" class="more" data-more="' + key + '" aria-expanded="false">Show ' + (us.length - show.length) + " more</button>"
      : (openAll && us.length > cap + 1 ? '<button type="button" class="more" data-more="' + key + '" aria-expanded="true">Show fewer</button>' : "");
    return '<section class="stepuse" aria-labelledby="h-' + key + '"><p class="lbl" id="h-' + key + '">' + IC.tick + 'In this step<span class="n">' + us.length + '</span></p><ul class="su">' + rows + "</ul>" + more + "</section>";
  }
  function restHtml(r, P, k) {
    if (!r.tagged) return ""; /* only when every step is tagged: otherwise "done" could be wrong */
    var now = {}; usesOf(r, k).forEach(function (u) { now[u[0]] = 1; });
    var todo = [], done = [];
    r.ings.forEach(function (i) {
      if (now[i.id]) return;
      var used = whereUsed(r, i.id), ks = used.map(function (w) { return w.k; });
      var later = ks.filter(function (x) { return x > k; }), earlier = ks.filter(function (x) { return x < k; });
      var q = P.tot[i.id], amt = q === null ? "–" : fmt(q) + unitText(i);
      var row = { i: i, amt: amt, q: q };
      if (!ks.length) { row.st = "Not in a step"; todo.push(row); }
      else if (later.length) { row.st = earlier.length ? "Steps " + earlier.concat(later).map(function (x) { return x + 1; }).join(", ") : (later.length === 1 ? "Step " : "Steps ") + later.map(function (x) { return x + 1; }).join(", "); todo.push(row); }
      else { row.st = "Used in " + list(earlier); row.done = 1; done.push(row); }
    });
    function li(x) { return '<li' + (x.done ? ' class="done"' : "") + '><span class="amt">' + esc(x.amt) + '</span><span class="nm">' + esc(x.i.name) + '</span><span class="st">' + esc(x.st) + "</span></li>"; }
    return '<div class="rest">' + (todo.length ? '<span class="lbl">Still to come</span><ul>' + todo.map(li).join("") + "</ul>" : "") + (done.length ? '<span class="lbl">Already used</span><ul>' + done.map(li).join("") + "</ul>" : "") + "</div>";
  }
  function chipsHtml(r, P, k, key, openAll) {
    var us = usesOf(r, k).slice(), cap = 5, show = openAll || us.length <= cap + 1 ? us : us.slice(0, cap);
    var chips = show.map(function (u) {
      var i = P.by[u[0]], a = P.amountOf(u), t = P.tot[u[0]], used = whereUsed(r, u[0]);
      var whole = u[1] === "all" || (used.length === 1 && a !== null && t !== null && Math.abs(a - t) < 1e-6);
      var left = 0, lk = []; used.forEach(function (w) { if (w.k > k) { var x = P.amountOf(w.u); if (x) { left += x; lk.push(w.k); } } });
      var txt = '<span class="c1">' + (a === null ? "<b>\u2013</b> " + esc(i.name) + '<span class="sr-only"> amount not given</span>' : "<b>" + fmt(a) + (whole || t === null ? "" : " of " + fmt(t)) + esc(unitText(i)) + "</b> " + esc(nameOf(i, a))) + "</span>";
      return "<li>" + txt + (left > 0.0001 ? "<small>" + fmt(left) + " left for " + list(lk) + "</small>" : "") + "</li>";
    }).join("");
    var more = us.length > show.length ? '<button type="button" class="more" data-more="' + key + '" aria-expanded="false">Show ' + (us.length - show.length) + " more</button>"
      : (openAll && us.length > cap + 1 ? '<button type="button" class="more" data-more="' + key + '" aria-expanded="true">Show fewer</button>' : "");
    return '<div class="lbl chiphead" id="h-' + key + '">' + IC.tick + "In this step" + '<span class="n">' + us.length + '</span></div><ul class="chipset" aria-labelledby="h-' + key + '">' + chips + "</ul>" + more;
  }
  function label(t) { var s = (String(t).match(/^[^.!?]*/) || [""])[0].trim(), c = s.split(/[,;:]\s/)[0]; if (c.length > 30) c = c.split(/\s(?:and|then)\s/)[0]; return c || s; }
  function nav(r, k) {
    var n = r.steps.length, p = k > 0 ? '<button type="button" class="nb" data-go="' + (k - 1) + '"><small>Step ' + k + "</small><b>" + esc(label(r.steps[k - 1].text)) + "</b></button>" : '<button type="button" class="nb" disabled><small>Before you start</small><b>Ingredients</b></button>';
    var x = k < n - 1 ? '<button type="button" class="nb next" data-go="' + (k + 1) + '"><small>Step ' + (k + 2) + "</small><b>" + esc(label(r.steps[k + 1].text)) + "</b></button>" : '<button type="button" class="nb next" disabled><small>All cooked</small><b>Finish up</b></button>';
    return '<div class="act">' + p + x + "</div>";
  }
  function frame(opt, form) {
    var r = RECIPES[S.rec], P = plan(r), k = Math.min(S.step[opt], r.steps.length - 1), s = r.steps[k], tagged = !!s.uses, has = tagged && s.uses.length > 0;
    var head = '<div class="top"><span class="stop">✕ Stop</span><span class="ttl">' + esc(r.name) + '</span><span class="sp"></span></div>';
    var big = function (extra) { return '<div class="bigstep"><span class="lbl">Step ' + (k + 1) + " of " + r.steps.length + '</span><p tabindex="-1">' + esc(s.text) + "</p>" + (extra || "") + "</div>"; };
    var key = opt + form[0], body;
    if (opt === "a") body = big() + (has ? stripHtml(r, P, k, key, S.more.a) : (tagged ? '<p class="noings">No ingredients in this step.</p>' : "")) + restHtml(r, P, k);
    else if (opt === "b") body = big(has ? chipsHtml(r, P, k, key, S.more.b) : (tagged ? '<p class="noings" style="margin:12px 0 0">No ingredients in this step.</p>' : "")) + (r.tagged || r.steps.some(function (x) { return x.uses; }) ? '<details class="all"' + (S.all ? " open" : "") + '><summary>All ingredients</summary>' + (r.tagged ? restHtml(r, P, k) : '<div class="rest"><ul>' + r.ings.map(function (i) { var q = P.tot[i.id]; return '<li><span class="amt">' + (q === null ? "–" : fmt(q) + unitText(i)) + '</span><span class="nm">' + esc(i.name) + "</span></li>"; }).join("") + "</ul></div>") + "</details>" : "");
    else {
      if (form === "desk") body = big() + (has ? stripHtml(r, P, k, key, true) : (tagged ? '<p class="noings">No ingredients in this step.</p>' : "")) + restHtml(r, P, k);
      else {
        var names = has ? s.uses.map(function (u) { var i = P.by[u[0]], a = P.amountOf(u); return (a === null ? "" : fmt(a) + unitText(i) + " ") + nameOf(i, a); }).join(", ") : "";
        var dock = has ? '<div class="dock"><button type="button" data-dock aria-expanded="' + S.dock + '" aria-controls="dk-' + key + '">' + IC.tick + '<span class="sum"><span class="lbl" style="color:var(--fg)">This step · ' + s.uses.length + "</span> " + esc(names) + "</span>" + IC.chev + '</button><div id="dk-' + key + '"' + (S.dock ? "" : " hidden") + ">" + stripHtml(r, P, k, key, true) + "</div></div>" : (tagged ? '<div class="dock"><p class="noings" style="margin:8px var(--sp-4)">No ingredients in this step.</p></div>' : "");
        return head + '<div class="body">' + big() + "</div>" + dock + nav(r, k);
      }
    }
    return head + '<div class="body">' + body + "</div>" + nav(r, k);
  }
  var live;
  function draw(focus) {
    var r = RECIPES[S.rec];
    [["a", "pa", "da"], ["b", "pb", "db"], ["c", "pc", "dc"]].forEach(function (o) {
      [[o[1], "phone"], [o[2], "desk"]].forEach(function (f) {
        var el = $(f[0]); el.setAttribute("data-opt", o[0]); el.innerHTML = frame(o[0], f[1]);
        if (focus === o[0] + f[1][0]) { var p = el.querySelector(".bigstep p"); if (p) p.focus({ preventScroll: true }); }
      });
    });
    document.querySelectorAll("[data-rec]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-rec") === S.rec)); });
    $("sv").textContent = S.sv;
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    var fr = t.closest("[data-opt]"), opt = fr && fr.getAttribute("data-opt"), form = fr && fr.id.charAt(0) === "d" ? "desk" : "phone";
    if (t.hasAttribute("data-rec")) { S.rec = t.getAttribute("data-rec"); S.step = { a: Math.min(1, RECIPES[S.rec].steps.length - 1), b: 0, c: Math.min(3, RECIPES[S.rec].steps.length - 1) }; S.dock = false; S.more = { a: false, b: false }; draw(); }
    else if (t.hasAttribute("data-sv")) { S.sv = Math.max(2, Math.min(12, S.sv + Number(t.getAttribute("data-sv")))); draw(); }
    else if (t.hasAttribute("data-go")) { S.step[opt] = Number(t.getAttribute("data-go")); if (opt === "c") S.dock = false; draw(opt + form[0]); }
    else if (t.hasAttribute("data-more")) { var kk = t.getAttribute("data-more").charAt(0); S.more[kk] = !S.more[kk]; draw(); }
    else if (t.hasAttribute("data-dock")) { S.dock = !S.dock; draw(); }
  });
  document.addEventListener("toggle", function (e) { if (e.target.classList && e.target.classList.contains("all")) S.all = e.target.open; }, true);
  draw();
})();
