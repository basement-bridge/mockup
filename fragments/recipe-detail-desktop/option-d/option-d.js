/* Recipe page, desktop, option D "Step stage". Sample data and behaviour for the mockup only.
   Samples: ?r=short|typical|long|notes|cooked|nocooked  ?t=light|dark  ?step=N (1-based)  ?show=all  ?fly=1 (notes lane open)  ?shot=1 (hides prototype controls)
   Performance: no request beyond theme.css, option-d.css, theme.js and this file. Step photos are drawn from the data (stand-ins); in the build they load after the
   text, as today (P-D20). The notes lane, the More list and the photo gallery draw only when opened. */
(function () {
  "use strict";
  var Q = new URLSearchParams(location.search);
  var KEY = Q.get("r") || "typical";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  if (Q.get("shot")) document.body.classList.add("shot");

  var IC = {
    back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',
    dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    note: '<path d="M5 4h14v12H9l-4 4z"/>',
    thumb: '<path d="M7 11v9H4v-9zM7 11l4-8c1.6 0 2.6 1.2 2.2 2.8L12.6 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>', cart: '<circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M3 4h2l2.4 11h10.2L20 8H6.2"/>',
    plan: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M8 14h3"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .2 1.5 1 2 2 2-1-3 0-5 1-8z"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', cam: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 3-4 3-8 5"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', left: '<path d="M19 12H5M11 6l-6 6 6 6"/>', right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    away: '<path d="M4 7h16v4H4zM6 11v8h12v-8M10 15h4"/>', info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>', home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    pantry: '<path d="M5 8h14v12H5zM8 8V5h8v3"/>', book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/>', shop: '<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>'
  };
  var ic = function (n, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || "") + "</svg>"; };

  /* ---------- sample data (shapes follow recipe-tab/types.ts; groups and "uses" are NOT on the wire today, see notes.md) ---------- */
  var ING = function (id, name, amt, unit, o) { o = o || {}; return { id: id, name: name, amt: amt, unit: unit || "", prep: o.prep || "", opt: !!o.opt, grp: o.grp || "", miss: !!o.miss }; };
  var ST = function (text, min, o) { o = o || {}; return { text: text, min: min || null, grp: o.grp || "", ph: o.ph || null, uses: o.uses || [] }; };

  var DATA = {
    short: {
      name: "Garlic toast eggs", min: 10, serves: 2, emoji: "🍳", versions: [{ n: "Original", usual: true, state: "kept" }], v: 0, parent: "",
      ing: [ING("a", "Eggs", 4), ING("b", "Sourdough", 4, "slices")],
      steps: [ST("Toast the bread and rub it with a cut garlic clove.", 3, { ph: { c: "#bfa98c", e: "🍞" }, uses: ["b"] }), ST("Fry the eggs in butter until the whites are set; lay on the toast.", 4, { ph: { c: "#d8c8c8", e: "🍳" }, uses: ["a"] })],
      notes: [], cooks: [], likes: [], share: null, source: "Our own, from a Saturday brunch."
    },
    typical: {
      name: "Egg fried rice", min: 20, serves: 2, emoji: "🍚",
      versions: [{ n: "Original", state: "kept" }, { n: "With peas", usual: true, state: "kept" }, { n: "Less soy, more garlic", state: "trying" }], v: 1, parent: "Original",
      ing: [ING("e", "Eggs", 3), ING("r", "Basmati rice", 300, "g", { prep: "cooked and cooled" }), ING("o", "Onion", 1), ING("s", "Spring onions", 2, "", { miss: 1 }), ING("y", "Soy sauce", 2, "tbsp"),
        ING("l", "Oil", 1, "tbsp"), ING("p", "Frozen peas", 80, "g"), ING("g", "Garlic cloves", 2), ING("z", "Sesame oil", 1, "tsp", { opt: 1, miss: 1 }), ING("c", "Chilli flakes", null)],
      steps: [ST("Beat the eggs with a pinch of salt.", null, { ph: { c: "#d9bf7a", e: "🥚" }, uses: ["e"] }),
        ST("Chop the onion and fry it in the oil until soft.", 3, { ph: { c: "#c9a45c", e: "🧅" }, uses: ["o", "l"] }),
        ST("Push the onion aside, pour in the eggs and stir until just set.", 1, { ph: "prep", uses: ["e"] }),
        ST("Tip in the cold rice and break up any lumps. Keep the heat high.", 4, { ph: { c: "#e3d3a8", e: "🍚" }, uses: ["r"] }),
        ST("Splash in the soy sauce and add the peas.", 2, { uses: ["y", "p"] }),
        ST("Toss through the spring onions and serve.", null, { uses: ["s", "z"] })],
      notes: "two", cooks: "four", share: null, source: "Sam's version of a Hong Kong takeaway classic."
    },
    long: {
      name: "Slow lamb shoulder with white beans and salsa verde", min: 270, serves: 8, emoji: "🍖", versions: [{ n: "Original", usual: true, state: "kept" }], v: 0, parent: "",
      ing: [ING("a1", "Lamb shoulder, bone in", 2.2, "kg", { grp: "Lamb" }), ING("a2", "Garlic cloves", 8, "", { grp: "Lamb" }), ING("a3", "Rosemary sprigs", 4, "", { grp: "Lamb", miss: 1 }), ING("a4", "Anchovy fillets", 6, "", { grp: "Lamb", opt: 1, miss: 1 }),
        ING("a5", "Olive oil", 3, "tbsp", { grp: "Lamb" }), ING("a6", "Salt", 2, "tsp", { grp: "Lamb" }), ING("a7", "Black pepper", 1, "tsp", { grp: "Lamb" }), ING("a8", "White wine", 250, "ml", { grp: "Lamb" }),
        ING("b1", "Cannellini beans", 3, "tins", { grp: "Beans" }), ING("b2", "Onion", 2, "", { grp: "Beans", prep: "finely sliced" }), ING("b3", "Celery sticks", 2, "", { grp: "Beans" }), ING("b4", "Carrot", 2, "", { grp: "Beans" }),
        ING("b5", "Tomato paste", 2, "tbsp", { grp: "Beans" }), ING("b6", "Chicken stock", 500, "ml", { grp: "Beans" }), ING("b7", "Bay leaves", 2, "", { grp: "Beans" }), ING("b8", "Lemon", 1, "", { grp: "Beans", prep: "zest of" }), ING("b9", "Chilli flakes", null, "", { grp: "Beans" }),
        ING("c1", "Flat-leaf parsley", 1, "large bunch", { grp: "Salsa verde", miss: 1 }), ING("c2", "Mint leaves", 20, "g", { grp: "Salsa verde", miss: 1 }), ING("c3", "Capers", 2, "tbsp", { grp: "Salsa verde", miss: 1 }),
        ING("c4", "Garlic cloves", 1, "", { grp: "Salsa verde" }), ING("c5", "Red wine vinegar", 2, "tbsp", { grp: "Salsa verde" }), ING("c6", "Olive oil", 120, "ml", { grp: "Salsa verde" }), ING("c7", "Sea salt", 1, "pinch", { grp: "Salsa verde" })],
      steps: [ST("Heat the oven to 160C.", 5, { grp: "Lamb" }),
        ST("Pound the garlic, rosemary and anchovies to a rough paste with the oil.", null, { grp: "Lamb", uses: ["a2", "a3", "a4", "a5"] }),
        ST("Score the lamb and rub the paste in; season well.", null, { grp: "Lamb", uses: ["a1", "a6", "a7"] }),
        ST("Brown the lamb on all sides in a heavy pot.", 15, { grp: "Lamb", ph: { c: "#8a5a3c", e: "🍖" }, uses: ["a1"] }),
        ST("Deglaze with the wine and let it bubble down by half.", 5, { grp: "Lamb", uses: ["a8"] }),
        ST("Cover tightly and roast.", 180, { grp: "Lamb" }),
        ST("Meanwhile soften onion, celery and carrot in a pan.", 12, { grp: "Beans", uses: ["b2", "b3", "b4"] }),
        ST("Add paste, stock, bay and beans; simmer.", 20, { grp: "Beans", uses: ["b5", "b6", "b7", "b1"] }),
        ST("Lift the lamb out, rest it under foil.", 20, { grp: "Beans", ph: { c: "#a07a58", e: "🥩" }, uses: ["a1"] }),
        ST("Tip the beans into the pot and return to the oven, lid off.", 30, { grp: "Beans", uses: ["b1", "b8", "b9"] }),
        ST("Chop herbs, capers and garlic together.", 8, { grp: "Salsa verde", uses: ["c1", "c2", "c3", "c4"] }),
        ST("Stir in vinegar and oil; season with the salt.", null, { grp: "Salsa verde", uses: ["c5", "c6", "c7"] }),
        ST("Pull the lamb into large pieces over the beans.", 5, { ph: { c: "#9a7a52", e: "🍽️" }, uses: ["a1"] }),
        ST("Spoon salsa verde over and serve with lemon wedges.", null, { uses: ["c6", "b8"] })],
      notes: "lamb", cooks: "two", share: 1, source: "Adapted from a slow-roast we saw in a weekend paper."
    }
  };
  DATA.long.versions = [{ n: "Original", usual: true, state: "kept" }];

  var NOTES = {
    n1: { on: "Original", by: "Sam", at: "12 Sep", inh: 1, ps: ["Day-old rice really is better. Fresh rice goes mushy."] },
    n2: { on: "With peas", by: "Jane", at: "20 Sep", ps: ["Kids like it with <b>frozen peas</b> thrown in at step 5."] },
    n3: { on: "With peas", by: "Alex", at: "28 Sep", re: 1, ps: ["Peas straight from frozen is fine, no need to thaw."] },
    n4: { on: "Original", by: "Priya", at: "2 Oct", inh: 1, ps: ["Things that go well on the side:"], li: ["Cucumber in rice vinegar", "A soft-boiled egg on top", "Kimchi"] },
    n5: { on: "With peas", by: "You", at: "14 Oct", ps: ["Doubled for 4 people in the big pan and had to fry the rice in two batches. Do not crowd the pan."] }
  };
  var COOKS = {
    four: [{ d: "9", m: "Oct", who: "Jane", v: "With peas", line: "used leftover rice", ate: 3, ago: "2 days ago" }, { d: "28", m: "Sep", who: "Sam", v: "Less soy, more garlic", verdict: "Kept it", ate: 3 }, { d: "20", m: "Sep", who: "You", v: "Original", line: "too salty first time", verdict: "Needed work", ate: 2 }, { d: "", m: "Earlier", who: "Sam", v: "Original" }],
    two: [{ d: "4", m: "Oct", who: "Sam", v: "Original", verdict: "Kept it", ate: 6, ago: "13 days ago" }, { d: "6", m: "Sep", who: "Jane", v: "Original", line: "needed another half hour", ate: 7 }]
  };
  var LIKES = { four: [["J", "Jane", "up", "m1"], ["S", "Sam", "up", "m2"], ["Y", "You", "up", "m3"]], two: [["S", "Sam", "up", "m2"], ["J", "Jane", "up", "m1"]] };

  /* the six ?r= states are views of three recipes */
  var rec, noteIds, cooks, fly = false;
  var base = KEY === "short" ? "short" : KEY === "long" ? "long" : "typical";
  rec = DATA[base];
  noteIds = [];
  if (KEY === "notes") noteIds = ["n5", "n3", "n2", "n4", "n1"];
  else if (base === "typical") noteIds = KEY === "nocooked" ? [] : ["n5", "n1"];
  else if (base === "long") noteIds = ["lamb2", "lamb1"];
  NOTES.lamb1 = { on: "Original", by: "Sam", at: "6 Sep", inh: 1, ps: ["Resting it under foil for 20 minutes really matters. Do not skip it."] };
  NOTES.lamb2 = { on: "Original", by: "Priya", at: "4 Oct", ps: ["Salsa verde keeps a day in the fridge, so make it ahead."] };
  cooks = base === "typical" ? (KEY === "nocooked" ? [] : COOKS.four) : base === "long" ? COOKS.two : [];
  var likes = base === "typical" ? (KEY === "nocooked" ? [] : LIKES.four) : base === "long" ? LIKES.two : [];
  if (KEY === "cooked") fly = true;
  if (Q.get("fly")) fly = Q.get("fly") === "1";

  var steps = rec.steps, nSteps = steps.length;
  var SHORT = nSteps <= 3;
  var state = { n: rec.serves, i: Math.max(0, Math.min(nSteps - 1, (+Q.get("step") || 1) - 1)), all: false, v: rec.v };
  try { if (localStorage.getItem("od-all") === "1") state.all = true; } catch (e) {}
  if (Q.get("show") === "all") state.all = true;
  if (Q.get("show") === "step") state.all = false;

  /* ---------- helpers ---------- */
  var FR = { 0.25: "¼", 0.5: "½", 0.75: "¾" };
  var fmtQ = function (a) {
    if (a == null) return "";
    var v = a * state.n / rec.serves, w = Math.floor(v + 1e-9), f = Math.round((v - w) * 100) / 100;
    if (FR[f] && v < 20) return (w ? w : "") + FR[f];
    return String(Math.round(v * 100) / 100).replace(/\.00$/, "");
  };
  var fmtMin = function (m) { if (m < 60) return m + " min"; var h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + r + " min" : ""); };
  var fmtMinS = function (m) { if (m < 60) return m + "m"; var h = Math.floor(m / 60), r = m % 60; return h + "h" + (r ? r : ""); };
  var missing = rec.ing.filter(function (x) { return x.miss; });
  var toastT;
  var toast = function (t) { var e = $("#toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove("on"); }, 2600); };
  var photo = function (p, cls) {
    if (p === "prep") return '<div class="' + cls + ' prep">Photo is being prepared</div>';
    return '<div class="' + cls + '" style="--pc:' + p.c + '"><div class="pi" aria-hidden="true">' + p.e + "</div></div>";
  };

  /* ---------- markup ---------- */
  var ingHtml = function () {
    var out = "", last = null, groups = {};
    rec.ing.forEach(function (x) { groups[x.grp] = 1; });
    var useG = Object.keys(groups).length > 1;
    rec.ing.forEach(function (x) {
      if (useG && x.grp !== last) { out += '<div class="grp">' + esc(x.grp) + "</div>"; last = x.grp; }
      out += '<div class="ing' + (x.miss ? " miss" : "") + '" data-ing="' + x.id + '"><span class="dot' + (x.miss ? " no" : "") + '"></span>' +
        '<span class="nm">' + esc(x.name) + (x.prep ? ", <em>" + esc(x.prep) + "</em>" : "") + (x.opt ? " <em>(optional)</em>" : "") + "</span>" +
        (x.miss ? '<button class="cart" type="button" data-cart aria-label="Add ' + esc(x.name) + ' to shopping">' + ic("cart") + "</button>" : "") +
        '<span class="q' + (x.amt == null ? " unk" : "") + '" data-a="' + (x.amt == null ? "" : x.amt) + '">' + (x.amt == null ? "amount?" : fmtQ(x.amt) + (x.unit ? " " + esc(x.unit) : "")) + "</span></div>";
    });
    return out;
  };
  var noteHtml = function (id) {
    var n = NOTES[id];
    return '<div class="note' + (n.inh ? " inh" : "") + '">' + n.ps.map(function (p) { return "<p>" + p + "</p>"; }).join("") + (n.li ? "<ul>" + n.li.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>" : "") +
      "<small>" + esc(n.by) + ", " + esc(n.at) + (n.inh ? '<span class="from">' + ic("branch", "xs") + "from the parent version</span>" : "") + (n.re ? '<span class="from">changed in this version</span>' : "") + "</small></div>";
  };
  var cooksUp = function () { return likes.filter(function (l) { return l[2] === "up"; }).length; };
  var proofHtml = function () {
    if (!cooks.length) return '<a class="od-proof empty" href="#history" data-act="history" title="History"><span>Not cooked yet</span><span class="hl">' + (rec.parent ? '<span class="par">From ' + esc(rec.parent) + " &middot; </span>" : "") + ic("clock", "xs") + '<span class="t">History</span> <span class="kbd">,</span></span></a>';
    var dated = cooks.length, dots = "";
    for (var k = 0; k < Math.min(8, dated); k++) dots += '<i' + (k === Math.min(8, dated) - 1 ? ' class="last"' : "") + "></i>";
    var chips = likes.map(function (l) { return '<span class="rb-rc"><i class="rb-av ' + l[3] + '">' + l[0] + '</i><span class="rb-th ' + l[2] + '">' + ic("thumb") + "</span></span>"; }).join("");
    return '<a class="od-proof" href="#history" data-act="history" aria-label="Cooked ' + dated + ' times, open history"><b>Cooked ' + dated + (dated === 1 ? " time" : " times") + "</b><small>last cooked " + (cooks[0].ago || "") + '</small><span class="od-dots">' + dots + '</span><span class="rb-react">' + chips +
      '</span><span class="hl">' + (rec.parent ? '<span class="par">From ' + esc(rec.parent) + " &middot; </span>" : "") + ic("clock", "xs") + '<span class="t">History</span> <span class="kbd">,</span></span></a>';
  };
  var vselHtml = function () {
    if (rec.versions.length < 2) return "";
    var v = rec.versions[state.v];
    return '<div class="vsel"><button type="button" data-vsel aria-haspopup="listbox" aria-expanded="false">' + ic("branch", "s") + "<span>" + esc(v.n) + "</span>" +
      (v.usual ? '<span class="tg">Our usual</span>' : v.state === "trying" ? '<span class="tg">Trying</span>' : "") + ic("down", "xs") + "</button>" +
      '<div class="pop" hidden role="listbox">' + rec.versions.map(function (x, k) { return '<button type="button" role="option" data-v="' + k + '" aria-selected="' + (k === state.v) + '"><span style="flex:1">' + esc(x.n) + "</span>" + (x.usual ? '<span class="tg">Our usual</span>' : x.state === "trying" ? '<span class="tg">Trying</span>' : "") + "</button>"; }).join("") + "</div></div>";
  };
  var stepLi = function (s, k) {
    var o = "";
    if (s.grp && (k === 0 || steps[k - 1].grp !== s.grp)) o += '<li class="grp" aria-hidden="true">' + esc(s.grp) + "</li>";
    return o + '<li><button type="button" class="sg-li" data-i="' + k + '" title="' + esc(s.text) + '"><span class="nb">' + (k + 1) + '</span><span class="t">' + esc(s.text) + "</span>" +
      (s.ph ? ic("cam") : "") + (s.min ? '<span class="mn">' + fmtMinS(s.min) + "</span>" : "") + "</button></li>";
  };
  var stepAll = function (s, k) {
    var o = "";
    if (s.grp && (k === 0 || steps[k - 1].grp !== s.grp)) o += '<li class="grp" style="padding-left:10px">' + esc(s.grp) + "</li>";
    return o + '<li class="stp" data-i="' + k + '"><span class="nb">' + (k + 1) + '</span><div style="flex:1;min-width:0"><p>' + esc(s.text) + "</p>" + (s.min ? '<div class="timer">' + ic("clock") + fmtMin(s.min) + "</div>" : "") + (s.ph ? photo(s.ph, "psp") : "") + "</div></li>";
  };
  var cardHtml = function (s, k) {
    return '<li class="sg-card"><div class="sg-ch"><span class="nb">' + (k + 1) + '</span><span class="of">Step ' + (k + 1) + " of " + nSteps + "</span>" + (s.min ? '<span class="timer">' + ic("clock") + fmtMin(s.min) + "</span>" : "") + '</div><p class="sg-tx">' + esc(s.text) + "</p>" + (s.ph ? photo(s.ph, "sg-ph") : "") + "</li>";
  };

  var render = function () {
    var v = rec.versions[state.v];
    var cnt = noteIds.length;
    $("#app").innerHTML =
      '<nav class="rb-rail" aria-label="Main"><div class="rb-brand">Our<br>kitchen</div>' +
      '<span class="rb-nv"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC.home + "</svg>Home</span><span class=\"rb-nv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\">" + IC.pantry + "</svg>Pantry</span>" +
      '<span class="rb-nv on"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC.book + "</svg>Recipes</span><span class=\"rb-nv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\">" + IC.shop + "</svg>Shopping</span></nav>" +
      '<div class="rtab' + (fly ? " fly" : "") + '" id="rtab" data-screen="recipe">' +
      /* top row */
      '<header class="top"><a class="back" href="#" data-act="back" aria-label="Back to Recipes">' + ic("back") + '<span class="bl">Recipes</span></a>' +
      "<h1 data-vt=\"title\">" + esc(rec.name) + "</h1>" +
      '<button class="rb-notesbtn re-a" type="button" data-notes aria-pressed="' + fly + '" aria-label="Notes and reactions">' + ic("note") + '<span class="od-long">Notes and reactions</span><span class="od-short">Notes</span>' +
      (cooks.length || cnt ? '<span class="rb-pillcnt">' + (cooksUp() ? '<i class="u">' + ic("thumb") + cooksUp() + "</i>" : "") + (cooks.length ? '<i class="d">' + '<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(180deg)">' + IC.thumb + "</svg>1</i>" : "") + "<i>" + cnt + "</i></span>" : "") + '<span class="kbd">N</span></button>' +
      '<button class="ib bare" type="button" data-star aria-pressed="false" aria-label="Like this version" title="Like this version">' + ic("star") + "</button>" +
      '<a class="ib bare" href="#edit" data-act="edit" data-key="e" aria-label="Edit" title="Edit (E)">' + ic("pen") + "</a>" +
      '<button class="shr-chip" type="button" data-act="share" aria-label="Share">' + ic("share") + "<span>Share</span>" + (rec.share ? '<span class="shr-n">' + rec.share + "</span>" : "") + '<span class="kbd">S</span></button>' +
      '<button class="ib bare" type="button" data-more aria-haspopup="menu" aria-expanded="false" aria-label="More">' + ic("dots") + "</button>" +
      '<div class="pop" id="more" hidden role="menu" style="top:56px;right:20px">' +
      [["pen", "Edit", "edit"], ["spark", "Change it with your assistant", "ai"], v.usual ? "" : ["check", "Make it our usual", "usual"], ["spark", "Ask your assistant about it", "ai"], ["info", "Where it came from", "src"], ["away", "Put this version away", "away"]].map(function (r) { return r ? '<button type="button" role="menuitem" data-m="' + r[2] + '">' + ic(r[0]) + "<span>" + r[1] + "</span></button>" : ""; }).join("") + "</div></header>" +
      /* second row */
      '<div class="od-sub"><span class="mc ro">' + ic("clock") + fmtMin(rec.min) + "</span>" +
      '<div class="serves" data-n="' + state.n + '"><button type="button" data-sv="-1" aria-label="Fewer servings">&minus;</button><span>Serves ' + state.n + '</span><button type="button" data-sv="1" aria-label="More servings">+</button></div>' +
      proofHtml() +
      '<button class="btn ghost" type="button" data-plan>' + ic("plan", "s") + "Plan it</button>" +
      '<a class="btn" href="../../../recipe/cook.html" data-cook>' + ic("flame", "s") + "Make it</a></div>" +
      /* main */
      '<div class="od-main"><aside class="od-rail" aria-label="Ingredients and notes">' + vselHtml() +
      '<section class="od-ing" id="ing"><div class="lblrow"><span class="lbl">Ingredients <b data-instock>' + (missing.length ? (rec.ing.length - missing.length) + " of " + rec.ing.length + " in" : "all in") + '</b></span><span class="sp"></span>' +
      (missing.length > 1 ? '<button class="mini" type="button" data-cartall aria-label="Add ' + missing.length + ' missing to shopping" title="Add all missing to shopping">' + ic("cart") + missing.length + "</button>" : "") +
      '<a class="mini ico" href="#edit" data-act="edit" aria-label="Edit ingredients">' + ic("pen") + '</a></div><div class="od-sc" id="ingsc">' + ingHtml() + (missing.length ? '<p class="hint" style="margin-top:8px">Talk to your assistant about substitutes</p>' : "") + "</div></section>" +
      '<section class="od-notes" id="not"><div class="lblrow"><span class="lbl">Notes' + (cnt ? " <b>" + cnt + "</b>" : "") + '</span><span class="sp"></span><button class="mini" type="button" data-note>' + ic("note") + "Add a note</button></div>" +
      '<div class="od-sc" id="notesc">' + (cnt ? noteIds.map(noteHtml).join("") : '<p class="none">No notes yet.</p>') + "</div></section></aside>" +
      /* stage */
      '<section class="sg" id="met"' + (SHORT ? " data-short" : "") + (state.all && !SHORT ? " data-all" : "") + ' style="--n:' + nSteps + '"><div class="sg-head"><span class="lbl">Method</span>' +
      '<span class="cnt" data-cnt></span><span class="sp"></span>' +
      (SHORT ? "" : '<button class="mini" type="button" data-all aria-pressed="' + state.all + '">' + ic("list") + 'Show all steps <span class="kbd">A</span></button>') +
      '<a class="mini ico" href="#edit" data-act="edit" aria-label="Edit method">' + ic("pen") + "</a></div>" +
      '<div class="sg-body"><ol class="sg-list" id="sglist" aria-label="Steps">' + steps.map(stepLi).join("") + "</ol>" +
      '<div class="sg-cur" id="sgcur" aria-live="polite"></div>' +
      '<ol class="sg-all" id="sgall">' + steps.map(stepAll).join("") + '</ol><ol class="sg-cards" style="margin:0;padding:0;list-style:none">' + (SHORT ? steps.map(cardHtml).join("") : "") + "</ol></div></section></div>" +
      /* lane */
      '<aside class="rfly rfly-notes" id="fly" aria-label="Notes and reactions"><header><h2>Notes and reactions</h2><button class="x" type="button" data-notes aria-label="Close notes and reactions">' + ic("x") + "</button></header><div class=\"fb\" id=\"flybody\"></div></aside></div>";
    afterRender();
  };

  /* the stage's current step */
  var showStep = function () {
    var s = steps[state.i], k = state.i, nx = steps[k + 1];
    $("#sgcur").innerHTML =
      '<div class="sg-ch"><span class="nb">' + (k + 1) + '</span><span class="of">Step ' + (k + 1) + " of " + nSteps + "</span>" + (s.grp ? '<span class="tg">' + esc(s.grp) + "</span>" : "") +
      (s.min ? '<span class="timer">' + ic("clock") + fmtMin(s.min) + "</span>" : "") + "</div>" +
      '<div class="sg-mid"><p class="sg-tx' + (s.text.length > 150 ? " long" : "") + '">' + esc(s.text) + "</p>" +
      (s.ph ? photo(s.ph, "sg-ph") : (nx ? '<div class="sg-next"><b>Up next</b><p>' + esc(nx.text) + "</p></div>" : "")) + "</div>" +
      '<div class="sg-nav"><button class="btn ghost" type="button" data-go="-1"' + (k === 0 ? " disabled" : "") + ">" + ic("left", "s") + 'Previous <span class="kbd">&larr;</span></button>' +
      '<span class="bar" aria-hidden="true"><i style="width:' + Math.round((k + 1) / nSteps * 100) + '%"></i></span>' +
      '<button class="btn" type="button" data-go="1"' + (k === nSteps - 1 ? " disabled" : "") + ">Next " + ic("right", "s") + ' <span class="kbd" style="border-color:var(--on-accent);color:var(--on-accent);background:none">&rarr;</span></button></div>';
    var cnt = $("[data-cnt]");
    if (cnt) cnt.textContent = state.all ? nSteps + " steps" : "Step " + (k + 1) + " of " + nSteps;
    document.querySelectorAll(".sg-li").forEach(function (b) { var i = +b.getAttribute("data-i"); b.classList.toggle("on", i === k); b.classList.toggle("done", i < k); if (i === k) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    document.querySelectorAll(".stp").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-i") === k); });
    /* ingredients this step uses */
    document.querySelectorAll(".ing").forEach(function (r) { r.classList.toggle("use", s.uses.indexOf(r.getAttribute("data-ing")) >= 0); });
    var first = $(".ing.use"), sc = $("#ingsc");
    if (first && sc && !SHORT) { var top = first.offsetTop - sc.offsetTop; if (top < sc.scrollTop || top + first.offsetHeight > sc.scrollTop + sc.clientHeight) sc.scrollTop = Math.max(0, top - 24); }
    var lst = $(".sg-li.on"), ls = $("#sglist");
    if (lst && ls) { var t2 = lst.offsetTop - ls.offsetTop; if (t2 < ls.scrollTop + 8 || t2 + lst.offsetHeight > ls.scrollTop + ls.clientHeight - 8) ls.scrollTop = Math.max(0, t2 - ls.clientHeight / 2); }
    scrollCues();
  };
  var scrollCues = function () {
    document.querySelectorAll(".od-sc").forEach(function (e) {
      var more = e.scrollHeight > e.clientHeight + 2;
      e.classList.toggle("more", more); e.classList.toggle("atend", e.scrollTop + e.clientHeight >= e.scrollHeight - 2);
    });
  };

  var flyHtml = function () {
    var h = "";
    h += '<div class="rb-h4">Reactions</div>';
    if (!likes.length) h += '<p class="hint">No thumbs yet. Cook it once and they start here.</p>';
    else h += likes.map(function (l) { return '<div class="rb-mem"><i class="rb-av ' + l[3] + '">' + l[0] + "</i><b>" + l[1] + '</b><span class="rb-th ' + l[2] + '">' + ic("thumb") + "</span></div>"; }).join("") + '<div class="rb-mem"><i class="rb-av m3">?</i><b style="color:var(--muted);font-weight:600">1 other, private</b></div>';
    if (cooks.length) {
      h += '<div class="rb-h4">Cooked <span>' + cooks.length + "</span></div>" + cooks.map(function (c) { return '<div class="hist"><div class="d"><b>' + (c.d || "&middot;") + "</b>" + c.m + '</div><div class="t">' + c.who + " cooked " + esc(c.v) + (c.line ? "<small>&ldquo;" + esc(c.line) + "&rdquo;</small>" : "") + "</div>" + (c.verdict ? '<span class="tg">' + c.verdict + "</span>" : "") + "</div>"; }).join("");
    }
    h += '<div class="rb-h4">Notes <span>' + noteIds.length + "</span></div>" + (noteIds.length ? noteIds.map(noteHtml).join("") : '<p class="hint">No notes yet.</p>');
    h += '<div class="rb-h4">Photos</div><button class="btn ghost" type="button" data-photos style="width:100%">Show 6 photos <small style="font-weight:600;opacity:.7">(loads on tap)</small></button><div id="pg" style="margin-top:8px"></div>';
    return h;
  };

  /* ---------- behaviour ---------- */
  var closePops = function () { document.querySelectorAll(".pop").forEach(function (p) { if (!p.closest(".od-sw")) p.hidden = true; }); document.querySelectorAll("[aria-haspopup]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); }); };
  var go = function (d) { var j = Math.max(0, Math.min(nSteps - 1, state.i + d)); if (j === state.i) return; state.i = j; showStep(); if (state.all) { var r = $('.stp[data-i="' + j + '"]'); if (r) r.scrollIntoView({ block: "nearest" }); } };
  var setAll = function (on) {
    state.all = on; var sg = $("#met"); if (on) sg.setAttribute("data-all", ""); else sg.removeAttribute("data-all");
    var b = $("[data-all]"); if (b) b.setAttribute("aria-pressed", on);
    try { localStorage.setItem("od-all", on ? "1" : "0"); } catch (e) {}
    showStep(); if (on) { var r = $('.stp[data-i="' + state.i + '"]'); if (r) r.scrollIntoView({ block: "nearest" }); }
  };
  var setFly = function (on) {
    fly = on; var t = $("#rtab"); t.classList.toggle("fly", on); document.querySelectorAll("[data-notes][aria-pressed]").forEach(function (b) { b.setAttribute("aria-pressed", on); });
    if (on) $("#flybody").innerHTML = flyHtml();
    setTimeout(scrollCues, 0);
  };
  var rescale = function () {
    document.querySelectorAll(".ing .q[data-a]").forEach(function (q) { var a = q.getAttribute("data-a"); if (a === "") return; var x = rec.ing.filter(function (i) { return i.id === q.parentNode.getAttribute("data-ing"); })[0]; q.textContent = fmtQ(+a) + (x.unit ? " " + x.unit : ""); });
    var sv = $(".serves"); sv.querySelector("span").textContent = "Serves " + state.n;
  };

  var afterRender = function () {
    showStep(); if (fly) setFly(true);
    var sc = document.querySelectorAll(".od-sc"); sc.forEach(function (e) { e.addEventListener("scroll", scrollCues, { passive: true }); });
  };

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button,a,.stp,[data-i]"); if (!t) { closePops(); return; }
    var pop = e.target.closest(".pop");
    if (t.hasAttribute("data-more")) { var m = $("#more"), w = m.hidden; closePops(); m.hidden = !w; t.setAttribute("aria-expanded", w); return; }
    if (t.hasAttribute("data-vsel")) { var p = t.nextElementSibling, w2 = p.hidden; closePops(); p.hidden = !w2; t.setAttribute("aria-expanded", w2); return; }
    if (t.hasAttribute("data-v")) { state.v = +t.getAttribute("data-v"); var sv0 = state.i; render(); state.i = sv0; showStep(); toast("Switched to " + rec.versions[state.v].n + ". The sample keeps the same steps; the real page reloads the version."); return; }
    if (t.hasAttribute("data-m")) { closePops(); var k = t.getAttribute("data-m"); toast(k === "edit" ? "Edit opens as a right-lane panel (E)." : k === "src" ? "Source: " + rec.source : k === "away" ? "Put away, with Undo (not drawn)." : "Opens your assistant (not drawn)."); return; }
    if (t.hasAttribute("data-notes")) { closePops(); setFly(!fly); return; }
    if (t.hasAttribute("data-sv")) { var n = state.n + (+t.getAttribute("data-sv")); if (n >= 1 && n <= 12) { state.n = n; rescale(); } return; }
    if (t.hasAttribute("data-all")) { setAll(!state.all); return; }
    if (t.hasAttribute("data-go")) { go(+t.getAttribute("data-go")); return; }
    if (t.classList.contains("sg-li")) { state.i = +t.getAttribute("data-i"); showStep(); return; }
    if (t.classList.contains("stp")) { state.i = +t.getAttribute("data-i"); showStep(); return; }
    if (t.hasAttribute("data-star")) { var on = t.getAttribute("aria-pressed") !== "true"; t.setAttribute("aria-pressed", on); toast(on ? "Liked. This is your own thumb on this version." : "Like removed."); return; }
    if (t.hasAttribute("data-plan")) { toast("Plan it: the day picker opens as a right flyout (Kitchie #757), not drawn here."); return; }
    if (t.hasAttribute("data-cart")) { toast("Added to the shopping list."); t.remove(); return; }
    if (t.hasAttribute("data-cartall")) { toast("Added " + missing.length + " missing to the shopping list."); return; }
    if (t.hasAttribute("data-note")) { toast("Add a note opens the note sheet."); return; }
    if (t.hasAttribute("data-photos")) { $("#pg").innerHTML = '<div class="pgrid">' + ["#d9bf7a", "#c9a45c", "#e3d3a8", "#bfa98c", "#d8c8c8", "#8a6a4a"].map(function (c, k) { return '<span style="--pc:' + c + '">' + ["🥚", "🧅", "🍚", "🍞", "🍳", "🍽️"][k] + "</span>"; }).join("") + "</div>"; t.remove(); return; }
    var a = t.getAttribute("data-act");
    if (a) { e.preventDefault(); closePops(); toast(a === "edit" ? "Edit opens as a right-lane panel (E)." : a === "share" ? "Share panel opens in the right lane (S)." : a === "history" ? "History: full page, as today (comma)." : "Back to the Recipes list, in place (Alt+Left)."); return; }
    if (!pop) closePops();
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest("input,textarea") || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === "Escape" && e.ctrlKey) { if (fly) setFly(false); return; }
    if (k === "Escape") { closePops(); return; }
    if (e.ctrlKey) return;
    if (k === "ArrowRight" || k === "ArrowDown" && !e.target.closest(".sg-list,.od-sc")) { if (SHORT) return; e.preventDefault(); go(1); }
    else if (k === "ArrowLeft" || k === "ArrowUp" && !e.target.closest(".od-sc")) { if (SHORT) return; e.preventDefault(); go(-1); }
    else if (k === "Home") { if (!SHORT) { state.i = 0; showStep(); } }
    else if (k === "End") { if (!SHORT) { state.i = nSteps - 1; showStep(); } }
    else if (k === "a" || k === "A") { if (!SHORT) setAll(!state.all); }
    else if (k === "n" || k === "N") setFly(!fly);
    else if (k === "s" || k === "S") toast("Share panel opens in the right lane (S).");
    else if (k === "e" || k === "E") toast("Edit opens as a right-lane panel (E).");
    else if (k === ",") toast("History: full page, as today (comma).");
  });
  addEventListener("resize", scrollCues);

  /* prototype sample switcher */
  var sw = $("#sw");
  var S = [["typical", "Typical: 10 ingredients, 6 steps"], ["short", "Short: 2 ingredients, 2 steps"], ["long", "Long: 24 in 3 groups, 14 steps"], ["notes", "Typical with 5 notes"], ["cooked", "Cooked: lane open on history"], ["nocooked", "Not cooked, no notes"]];
  sw.innerHTML = '<button type="button" id="swb">Samples</button><div class="pop" hidden><h3>Sample</h3>' + S.map(function (x) { return '<button type="button" data-r="' + x[0] + '"' + (x[0] === KEY ? ' aria-selected="true"' : "") + ">" + x[1] + "</button>"; }).join("") + '<h3>Theme</h3><button type="button" data-t="dark">Dark</button><button type="button" data-t="light">Light</button><h3>Stage</h3><button type="button" data-sh="step">Step by step</button><button type="button" data-sh="all">Show all steps</button></div>';
  sw.addEventListener("click", function (e) {
    e.stopPropagation(); var b = e.target.closest("button"); if (!b) return; var p = sw.querySelector(".pop");
    if (b.id === "swb") { p.hidden = !p.hidden; return; }
    var u = new URL(location.href);
    if (b.dataset.r) u.searchParams.set("r", b.dataset.r); else if (b.dataset.t) u.searchParams.set("t", b.dataset.t); else if (b.dataset.sh) u.searchParams.set("show", b.dataset.sh);
    location.href = u.toString();
  });
  render();
})();
