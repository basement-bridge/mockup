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
        { text: "Slice part of the chicken thin. Toss it with some of the soy sauce and crushed garlic and leave it for 10 minutes.", uses: [["i1", 1], ["i2", 1], ["i3", 2]] },
        { text: "Rub the rest of the chicken with salt and sear it whole in a little oil, 6 minutes a side. Rest it, then slice.", uses: [["i1", "rest"], ["i4", 1], ["i8", null]] },
        { text: "Wipe the pan, heat more oil and stir-fry the marinated chicken until cooked through.", uses: [["i4", 2]] },
        { text: "Add the remaining garlic and the rice. Toss in the rest of the soy sauce until the rice is hot.", uses: [["i3", "rest"], ["i5", "all"], ["i2", "rest"]] },
        { text: "Take the pan off the heat and let it sit for two minutes.", uses: [] },
        { text: "Scramble some of the eggs in a corner of the pan, then fold them through the rice.", uses: [["i6", 2]] },
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
        { text: "Heat the oven to 220 degrees. Cut the potato, carrot, onion and capsicum into chunks and toss on the tray with some of the oil, the paprika and thyme.", uses: [["i2", "all"], ["i3", "all"], ["i4", "all"], ["i5", "all"], ["i6", 3], ["i7", "all"], ["i8", "all"]] },
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

  var S = { rec: "rice", sv: 4, step: { a: 1, b: 0, c: 3 }, dock: false, more: { a: false, b: false }, all: false, room: "roomy", rest: false, used: false, dk: "", stc: "1", nx: false, sm: false, amt: false };
  /* CSI-22..26: phone-only treatments of "Still to come". 0 = before (open list), 1 = Next line (recommended default), 2 = summary row, 3 = inline names. ?stc=0..3 */
  try { var q = new URLSearchParams(location.search).get("stc"); if (/^[0-3]$/.test(q || "")) S.stc = q; } catch (e) {}
  var LONG = " Keep the heat high and do not crowd the pan, or it will steam instead of sear; give it room and leave it alone until it lifts."; /* sample sentence for the Long text room */
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
    arrow: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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

  /* ---- Option A, revised 17 Oct 2026 (owner decisions CSI-15..19). Pure parts first, then markup. ---- */
  /* CSI-16: tight when the step competes for room: a step photo, long step text, or a small viewport. */
  function isTight(o) { return !!(o.photo || o.textLen > 160 || o.vh < 600); }
  function chipText(ks, arrow) { /* "step 7", "4, 7", "4, 7, 9 +2": compact, never a sentence */
    var n = ks.map(function (x) { return x + 1; }), shown = n.slice(0, 3).join(", "), extra = n.length > 3 ? " +" + (n.length - 3) : "";
    return (arrow ? "→ " : "") + (n.length === 1 ? "step " + n[0] : shown + extra);
  }
  function chipHtml(ks, arrow, sr) {
    if (!ks.length) return '<span class="go"></span>';
    return '<span class="go"><span aria-hidden="true">' + chipText(ks, arrow) + '</span><span class="sr-only">' + sr + (ks.length === 1 ? " step " : " steps ") + ks.map(function (x) { return x + 1; }).join(", ") + "</span></span>";
  }
  function qtyHtml(i, a) { return '<span class="qt">' + (a === null || a <= 0.0001 ? "" : esc(fmt(a) + unitText(i))) + "</span>"; } /* CSI-18: no amount, nothing on the right */
  function calloutA(r, P, k, key, openAll) {
    var us = usesOf(r, k).slice().sort(function (x, y) { return r.ings.findIndex(function (i) { return i.id === x[0]; }) - r.ings.findIndex(function (i) { return i.id === y[0]; }); });
    var cap = 5, show = openAll || us.length <= cap + 1 ? us : us.slice(0, cap);
    var rows = show.map(function (u) {
      var i = P.by[u[0]], a = P.amountOf(u), later = whereUsed(r, u[0]).filter(function (w) { return w.k > k; }).map(function (w) { return w.k; });
      return '<li><span class="nm">' + esc(nameOf(i, a)) + "</span>" + qtyHtml(i, a) + chipHtml(later, true, "rest used in") + "</li>"; /* CSI-19: chip only when a later step uses the rest */
    }).join("");
    var more = us.length > show.length ? '<button type="button" class="more" data-more="' + key + '" aria-expanded="false">+' + (us.length - show.length) + " more</button>"
      : (openAll && us.length > cap + 1 ? '<button type="button" class="more" data-more="' + key + '" aria-expanded="true">Show fewer</button>' : "");
    return '<section class="cu" aria-labelledby="h-' + key + '"><p class="lbl" id="h-' + key + '">' + IC.tick + 'In this step<span class="n">' + us.length + '</span></p><ul class="cl">' + rows + "</ul>" + more + "</section>";
  }
  function restModel(r, P, k) { /* { todo, done } for a fully tagged recipe; CSI-16 order */
    var now = {}; usesOf(r, k).forEach(function (u) { now[u[0]] = 1; });
    var todo = [], done = [];
    r.ings.forEach(function (i, idx) {
      if (now[i.id]) return;
      var used = whereUsed(r, i.id), later = used.filter(function (w) { return w.k > k; }), earlier = used.filter(function (w) { return w.k < k; });
      if (!used.length) { todo.push({ i: i, a: P.tot[i.id], ks: [], first: 999, idx: idx }); return; }
      if (later.length) {
        var left = 0, known = false; later.forEach(function (w) { var x = P.amountOf(w.u); if (x !== null) { left += x; known = true; } });
        todo.push({ i: i, a: known ? left : null, ks: later.map(function (w) { return w.k; }), first: later[0].k, idx: idx });
      } else done.push({ i: i, a: P.tot[i.id], ks: earlier.map(function (w) { return w.k; }), idx: idx });
    });
    todo.sort(function (x, y) { return x.first - y.first || x.idx - y.idx; });
    return { todo: todo, done: done };
  }
  function rowLi(x) { return '<li><span class="nm">' + esc(nameOf(x.i, x.a)) + "</span>" + qtyHtml(x.i, x.a) + chipHtml(x.ks, false, "used in") + "</li>"; }
  /* Phone "Still to come" (CSI-22..26): the callout leads, this stays secondary. Same data in every treatment. */
  function stcCap(todo, tight) { var cap = tight ? 3 : 6, open = S.rest && todo.length > cap; return { cap: cap, open: open, shown: open || todo.length <= cap ? todo : todo.slice(0, cap) }; }
  function moreBtn(todo, c) { return todo.length > c.cap ? '<button type="button" class="more" data-rest aria-expanded="' + c.open + '">' + (c.open ? "Show fewer" : "+" + (todo.length - c.shown.length) + " more") + "</button>" : ""; }
  function nextStepOf(r, k) { for (var j = k + 1; j < r.steps.length; j++) if ((r.steps[j].uses || []).length) return j; return -1; } /* CSI-26 */
  function namesOf(r, P, uses, cap) { /* names only, list order, "+n" past the cap */
    var us = uses.slice().sort(function (x, y) { return r.ings.findIndex(function (i) { return i.id === x[0]; }) - r.ings.findIndex(function (i) { return i.id === y[0]; }); });
    var n = us.map(function (u) { return nameOf(P.by[u[0]], P.amountOf(u)); });
    return n.slice(0, cap).join(", ") + (n.length > cap ? ", +" + (n.length - cap) : "");
  }
  function restA(r, P, k, key, tight) { /* phone */
    if (!r.tagged) return ""; /* only a fully tagged recipe (CSI-8) */
    var m = restModel(r, P, k), todo = m.todo, done = m.done, v = S.stc, c = stcCap(todo, tight);
    var listH = '<ul class="cl">' + c.shown.map(rowLi).join("") + "</ul>" + moreBtn(todo, c);
    var h = '<div class="rsA" data-stc="' + v + '">';
    if (todo.length) {
      if (v === "0") h += '<span class="lbl">Still to come</span>' + listH;
      else if (v === "1") { /* one quiet line naming the next step's ingredients; opens to the list */
        var nk = nextStepOf(r, k), kk = nk < 0 ? "Still to come" : "Next \u00b7 step " + (nk + 1), nm = nk < 0 ? todo.map(function (x) { return [x.i.id, "all"]; }) : r.steps[nk].uses;
        h += '<button type="button" class="stcrow" data-nx aria-expanded="' + S.nx + '"' + (S.nx ? ' aria-controls="stc-' + key + '"' : "") + ">" + IC.arrow + '<span class="k">' + kk + '</span><span class="v">' + esc(namesOf(r, P, nm, 3)) + "</span>" + IC.chev + "</button>";
        if (S.nx) h += '<div class="stcp" id="stc-' + key + '"><span class="lbl">Still to come</span>' + listH + "</div>";
      } else if (v === "2") { /* a fold like Already used */
        h += '<details class="fold stc"' + (S.sm ? " open" : "") + "><summary>" + IC.chev + "Still to come (" + todo.length + ')</summary><div class="stcp">' + listH + "</div></details>";
      } else { /* 3: a lighter inline run of names; amounts on demand */
        var run = c.shown.map(function (x) { return "<li>" + esc(nameOf(x.i, null)) + (x.ks.length ? '<span class="st" aria-hidden="true">\u2192 ' + x.ks.slice(0, 3).map(function (z) { return z + 1; }).join(", ") + (x.ks.length > 3 ? " +" + (x.ks.length - 3) : "") + '</span><span class="sr-only"> used in ' + list(x.ks) + "</span>" : "") + "</li>"; }).join("");
        h += '<div class="stc3"><div class="hd"><span class="lbl">Still to come \u00b7 ' + todo.length + '</span><button type="button" class="amt" data-amt aria-expanded="' + S.amt + '">Amounts' + IC.chev + "</button></div>" + (S.amt ? listH : '<ul class="run">' + run + "</ul>" + moreBtn(todo, c)) + "</div>";
      }
    }
    if (done.length) h += '<details class="used"' + (S.used ? " open" : "") + "><summary>" + IC.chev + "Already used (" + done.length + ")</summary><ul class=\"cl\">" + done.map(rowLi).join("") + "</ul></details>"; /* CSI-15 */
    return h + "</div>";
  }
  /* Desktop composition (CSI-20): chips inside the step card, the rest in a dock that opens in place. */
  function chipsA(r, P, k, key) {
    var us = usesOf(r, k).slice().sort(function (x, y) { return r.ings.findIndex(function (i) { return i.id === x[0]; }) - r.ings.findIndex(function (i) { return i.id === y[0]; }); });
    var chips = us.map(function (u) {
      var i = P.by[u[0]], a = P.amountOf(u), later = whereUsed(r, u[0]).filter(function (w) { return w.k > k; }).map(function (w) { return w.k; });
      return '<li><span class="nm">' + esc(nameOf(i, a)) + "</span>" + qtyHtml(i, a) + chipHtml(later, true, "rest used in") + "</li>";
    }).join("");
    return '<div class="lbl chiphead" id="h-' + key + '">' + IC.tick + 'In this step<span class="n">' + us.length + '</span></div><ul class="chipsA" aria-labelledby="h-' + key + '">' + chips + "</ul>";
  }
  function dockA(r, P, k, key) {
    if (!r.tagged) return "";
    var m = restModel(r, P, k), cur = S.dk === "todo" && m.todo.length ? "todo" : (S.dk === "used" && m.done.length ? "used" : "");
    if (!m.todo.length && !m.done.length) return "";
    var panel = cur ? '<div class="dkp ' + cur + '" id="dkp-' + key + '" role="region" aria-label="' + (cur === "todo" ? "Still to come" : "Already used") + '"><ul class="cl">' + (cur === "todo" ? m.todo : m.done).map(rowLi).join("") + "</ul></div>" : "";
    function tab(id, txt, n, ic) { return n ? '<button type="button" class="tb ' + id + '" data-dk="' + id + '" aria-expanded="' + (cur === id) + '"' + (cur === id ? ' aria-controls="dkp-' + key + '"' : "") + ">" + ic + '<span class="t">' + txt + '</span><span class="n">' + n + "</span>" + IC.chev + "</button>" : ""; }
    var arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<div class="dkA">' + panel + '<div class="tabs">' + tab("todo", "Still to come", m.todo.length, arrow) + tab("used", "Already used", m.done.length, IC.tick) + "</div></div>";
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
    var room = opt === "a" ? S.room : "roomy", photo = room === "photo", text = s.text + (room === "long" ? LONG : "");
    var vh = room === "small" ? (form === "phone" ? 520 : 440) : (form === "phone" ? 700 : 640);
    var tight = opt === "a" && (isTight({ photo: photo && form === "phone", textLen: form === "phone" ? text.length : 0, vh: vh }));
    var big = function (extra) { return '<div class="bigstep">' + (opt === "a" && photo ? '<div class="sphoto" role="img" aria-label="Step photo (sample)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l1.5-2h7L17 7h3v12H4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></div>' : "") + '<span class="lbl">Step ' + (k + 1) + " of " + r.steps.length + '</span><p tabindex="-1">' + esc(text) + "</p>" + (extra || "") + "</div>"; };
    var key = opt + form[0], body;
    if (opt === "a" && form === "desk") return head + '<div class="body">' + big(has ? chipsA(r, P, k, key) : (tagged ? '<p class="noings" style="margin:12px 0 0">No ingredients in this step.</p>' : "")) + "</div>" + dockA(r, P, k, key) + nav(r, k);
    if (opt === "a") body = big() + (has ? calloutA(r, P, k, key, S.more.a) : (tagged ? '<p class="noings">No ingredients in this step.</p>' : "")) + restA(r, P, k, key, tight);
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
        var el = $(f[0]); el.setAttribute("data-opt", o[0]); if (o[0] === "a") el.setAttribute("data-room", S.room); el.innerHTML = frame(o[0], f[1]);
        if (focus === o[0] + f[1][0]) { var p = el.querySelector(".bigstep p"); if (p) p.focus({ preventScroll: true }); }
      });
    });
    document.querySelectorAll("[data-room]").forEach(function (b) { if (b.tagName === "BUTTON") b.setAttribute("aria-pressed", String(b.getAttribute("data-room") === S.room)); });
    document.querySelectorAll("[data-stc]").forEach(function (b) { if (b.tagName === "BUTTON") b.setAttribute("aria-pressed", String(b.getAttribute("data-stc") === S.stc)); });
    document.querySelectorAll("[data-rec]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-rec") === S.rec)); });
    $("sv").textContent = S.sv;
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    var fr = t.closest("[data-opt]"), opt = fr && fr.getAttribute("data-opt"), form = fr && fr.id.charAt(0) === "d" ? "desk" : "phone";
    if (t.hasAttribute("data-rec")) { S.rec = t.getAttribute("data-rec"); S.step = { a: Math.min(1, RECIPES[S.rec].steps.length - 1), b: 0, c: Math.min(3, RECIPES[S.rec].steps.length - 1) }; S.dock = false; S.more = { a: false, b: false }; S.rest = false; S.used = false; S.dk = ""; S.nx = S.sm = S.amt = false; draw(); }
    else if (t.hasAttribute("data-room") && t.tagName === "BUTTON" && !fr) { S.room = t.getAttribute("data-room"); S.rest = false; draw(); }
    else if (t.hasAttribute("data-dk")) { var d = t.getAttribute("data-dk"); S.dk = S.dk === d ? "" : d; draw(); var nb = document.querySelector('#da [data-dk="' + d + '"]'); if (nb) nb.focus({ preventScroll: true }); }
    else if (t.hasAttribute("data-rest")) { S.rest = !S.rest; draw(); }
    else if (t.hasAttribute("data-stc") && !fr) { S.stc = t.getAttribute("data-stc"); S.rest = false; try { var u = new URL(location.href); u.searchParams.set("stc", S.stc); history.replaceState(null, "", u); } catch (er) {} draw(); }
    else if (t.hasAttribute("data-nx")) { S.nx = !S.nx; draw(); var b1 = document.querySelector("#pa [data-nx]"); if (b1) b1.focus({ preventScroll: true }); }
    else if (t.hasAttribute("data-amt")) { S.amt = !S.amt; draw(); var b2 = document.querySelector("#pa [data-amt]"); if (b2) b2.focus({ preventScroll: true }); }
    else if (t.hasAttribute("data-sv")) { S.sv = Math.max(2, Math.min(12, S.sv + Number(t.getAttribute("data-sv")))); draw(); }
    else if (t.hasAttribute("data-go")) { S.step[opt] = Number(t.getAttribute("data-go")); if (opt === "c") S.dock = false; draw(opt + form[0]); }
    else if (t.hasAttribute("data-more")) { var kk = t.getAttribute("data-more").charAt(0); S.more[kk] = !S.more[kk]; draw(); }
    else if (t.hasAttribute("data-dock")) { S.dock = !S.dock; draw(); }
  });
  document.addEventListener("toggle", function (e) { if (e.target.classList && e.target.classList.contains("all")) S.all = e.target.open; if (e.target.classList && e.target.classList.contains("stc")) S.sm = e.target.open; else if (e.target.classList && e.target.classList.contains("used")) S.used = e.target.open; }, true);
  draw();
})();
