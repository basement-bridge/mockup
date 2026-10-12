/* Recipe tab mockup: sample data, icons, tab bar and the prototype controls, shared by every screen in recipe/.
   Sample names live here only (AGENTS.md: mockup-only data stays in the mockup's own script).
   Performance note: this file is the only shared script. Each screen adds its own small inline script. */
(function () {
  /* The recipe/ folder's own URL, from this script's src, so links and images work from any page that loads recipe.js
     (recipe-versions/, recipe-ideas/, recipe-photos/ reuse it and its Mockup panel). */
  var BASE = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, "") : ""; })();
  var Q = new URLSearchParams(location.search);
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("rcp-" + k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("rcp-" + k, v); } catch (e) {} }
  };
  /* A URL parameter wins over the remembered choice, so a link or screenshot can pin a state. */
  var pick = function (k, d) { var v = Q.get(k); if (v) { store.set(k, v); return v; } return store.get(k, d); };

  /* Locked by the owner (voice, 10 Oct 2026): list = one ranked list (R-O1 A), recipe page = one scroll (R-O2 A),
     versions = strip only when there are several (R-O3 B). Those are no longer switches, so they are not in P. */
  var P = {
    persona: pick("persona", "weeknight"),
    photos: pick("photos", "on")
  };

  /* Who is using it. A persona is a habit that changes what leads, never what a person may do:
     every member has the same controls (R-O5, locked). Jane's key stays "follower" so links and the
     other slices' scripts keep working; it carries no permission. */
  var PERSONAS = [
    ["weeknight", "Sam", "Sam", "Weeknight cook: wants dinner in 30 minutes from what is in."],
    ["batch", "Priya", "Priya", "Batch cooker: cooks big on Sunday, eats it through the week."],
    ["improviser", "Alex", "Alex", "Improviser: uses a recipe as a starting point, changes things."],
    ["follower", "Jane", "Jane", "Often cooks what is on the plan. Same controls as everyone."]
  ];
  var me = PERSONAS.filter(function (p) { return p[0] === P.persona; })[0] || PERSONAS[0];

  /* Pantry keys that are in stock. Kitchie owns stock; Recipe asks it (what_am_i_missing). */
  var PANTRY = { eggs: 1, rice: 1, onion: 1, soy: 1, oil: 1, peas: 1, garlic: 1, chickpeas: 1, tomatoes: 1, spinach: 1, pasta: 1, mushrooms: 1, cream: 1, cheese: 1, mince: 1, carrot: 1, lentils: 1, stock: 1, butter: 1, cumin: 1 };
  var HELD = { rice: "Tue" };

  /* Every recipe came in through someone's own AI assistant over Recipe's MCP tools (R-O4, locked): the app never
     reads a link, a page or a photo. The assistant may have; src says what it worked from.
     Egg fried rice has three versions (the versions strip shows); every other recipe has one (no versions row).
     Ingredients: [key, name, quantity per serving or null when the source did not say, unit]. Quantities scale with Serves. */
  var R = [
    { id: "efr", name: "Egg fried rice", e: "🍚", min: 20, serves: 2, star: 1, cooked: 6, last: 2, tags: ["Quick"],
      src: "Sam's assistant, from Sam's kitchen notes, 3 Sep", srcKind: "conversation",
      ings: [["eggs", "Eggs", 1.5, ""], ["rice", "Basmati rice, cooked and cooled", 150, "g"], ["onion", "Onion", .5, ""], ["spring", "Spring onions", 1, ""], ["soy", "Soy sauce", 1, "tbsp"], ["oil", "Oil", .5, "tbsp"]],
      steps: [["Beat the eggs with a pinch of salt.", "🥚"], ["Chop the onion and fry it in the oil until soft.", "🧅", 3], ["Push the onion aside, pour in the eggs and stir until just set.", "🍳", 1], ["Tip in the cold rice and break up any lumps. Keep the heat high.", "🍚", 4], ["Splash in the soy sauce, toss in the spring onions and serve.", "🥢"]],
      notes: [["Day-old rice really is better. Fresh rice goes mushy.", "Sam", "12 Sep", "v0"], ["Kids like it with frozen peas thrown in at step 4.", "Jane", "20 Sep", "v1", "n2"], ["Kids like the peas. They pick the garlic out, so slice it big.", "Alex", "8 Oct", "v2", "n2"]],
      photos: ["🍚", "🍳", "🥢"],
      hist: [["8 Oct", "Sam", "With peas", "Used brown rice, fine.", "🍚", { Sam: "liked", Jane: "liked", Alex: "no", Priya: "skip" }], ["29 Sep", "Jane", "With peas", "", "", { Jane: "liked", Sam: "liked" }], ["21 Sep", "Sam", "Original", "Doubled it for lunches.", "🍳"], ["12 Sep", "Sam", "Original", "", ""]],
      vers: [
        { id: "v0", name: "Original", by: "Sam", when: "3 Sep", cooked: 2, depth: 0 },
        { id: "v1", name: "With peas", by: "Jane", when: "20 Sep", cooked: 4, depth: 1, def: 1, chg: { add: [["peas", "Frozen peas", 40, "g"]], swap: {} }, why: "Kids like the peas. Jane: \"keep that one\"." },
        { id: "v2", name: "Less soy, more garlic", by: "Alex", when: "5 Oct", cooked: 0, depth: 2, state: "trying", chg: { add: [["garlic", "Garlic cloves", 1, ""]], swap: { soy: ["soy", "Soy sauce", .5, "tbsp"] } }, why: "Alex: \"save this, less salty\"." }
      ] },
    { id: "cur", name: "Chickpea and spinach curry", e: "🍛", min: 40, serves: 8, batch: 1, freezes: 1, cooked: 3, last: 9, tags: ["Batch", "Freezes"],
      src: "Priya's assistant, from a magazine page Priya showed it, 14 Aug", srcKind: "conversation",
      ings: [["chickpeas", "Tinned chickpeas", .5, "tin"], ["tomatoes", "Tinned tomatoes", .25, "tin"], ["coconut", "Coconut milk", .25, "tin"], ["spinach", "Spinach", 30, "g"], ["onion", "Onion", .25, ""], ["garlic", "Garlic cloves", .5, ""], ["cumin", "Cumin", null, ""]],
      steps: [["Soften the onion and garlic in a big pot.", "🧅", 6], ["Add the spices and fry for a minute.", "🌶️", 1], ["Add chickpeas, tomatoes and coconut milk. Simmer.", "🍛", 20], ["Stir the spinach through until it wilts.", "🥬", 2], ["Cool, then portion into tubs. Freezes for 3 months.", "🧊"]],
      notes: [["Portions: 8 tubs from one pot. Label the lids.", "Priya", "14 Aug"]],
      photos: ["🍛"], hist: [["28 Sep", "Priya", "Original", "8 tubs, 3 into the freezer.", "🍛"], ["7 Sep", "Priya", "Original", "", ""]],
      vers: [{ id: "v0", name: "Original", by: "Priya", when: "14 Aug", cooked: 3, depth: 0, def: 1 }] },
    { id: "pas", name: "Creamy mushroom pasta", e: "🍝", min: 25, serves: 2, cooked: 4, last: 14, tags: ["Quick"],
      src: "Alex's assistant, from a web page Alex sent it, 1 Sep", srcKind: "conversation",
      ings: [["pasta", "Pasta", 100, "g"], ["mushrooms", "Mushrooms", 125, "g"], ["cream", "Cream", 75, "ml"], ["garlic", "Garlic cloves", 1, ""], ["cheese", "Parmesan", 15, "g"]],
      steps: [["Boil the pasta.", "🍝", 10], ["Fry the mushrooms and garlic.", "🍄", 6], ["Add cream, then the pasta and cheese.", "🧀", 2]],
      notes: [], photos: [], hist: [["26 Sep", "Alex", "Original", "Added chilli.", ""]],
      vers: [{ id: "v0", name: "Original", by: "Alex", when: "1 Sep", cooked: 4, depth: 0, def: 1 }] },
    { id: "sha", name: "Shakshuka", e: "🍳", min: 25, serves: 2, star: 1, cooked: 5, last: 20, tags: ["Quick"],
      src: "Your assistant, from a chat with Alex, 2 Sep", srcKind: "conversation",
      ings: [["eggs", "Eggs", 2, ""], ["tomatoes", "Tinned tomatoes", .5, "tin"], ["onion", "Onion", .5, ""], ["cumin", "Cumin", .5, "tsp"]],
      steps: [["Soften the onion.", "🧅", 5], ["Add tomatoes and cumin, simmer.", "🍅", 8], ["Make wells, crack in the eggs, cover.", "🍳", 6]],
      notes: [], photos: ["🍳"], hist: [], vers: [{ id: "v0", name: "Original", by: "Alex", when: "2 Sep", cooked: 5, depth: 0, def: 1 }] },
    { id: "fri", name: "Spinach frittata", e: "🥬", min: 25, serves: 4, cooked: 1, last: 30, tags: [],
      src: "Sam's assistant, from a recipe book (page 112)", srcKind: "conversation",
      ings: [["eggs", "Eggs", 1.5, ""], ["spinach", "Spinach", 40, "g"], ["feta", "Feta", 25, "g"], ["onion", "Onion", .25, ""]],
      steps: [["Wilt the spinach.", "🥬", 3], ["Beat the eggs, add spinach and feta.", "🥚"], ["Bake until set.", "🔥", 18]],
      notes: [], photos: [], hist: [], vers: [{ id: "v0", name: "Original", by: "Sam", when: "1 Sep", cooked: 1, depth: 0, def: 1 }] },
    { id: "rag", name: "Beef ragù", e: "🥘", min: 150, serves: 10, batch: 1, freezes: 1, cooked: 2, last: 40, tags: ["Batch", "Freezes"],
      src: "Priya's assistant, from a handwritten card", srcKind: "conversation",
      ings: [["mince", "Beef mince", 100, "g"], ["tomatoes", "Tinned tomatoes", .3, "tin"], ["carrot", "Carrot", .2, ""], ["celery", "Celery", .2, "stick"], ["wine", "Red wine", 25, "ml"], ["onion", "Onion", .2, ""]],
      steps: [["Brown the mince in batches.", "🥩", 12], ["Soften the vegetables.", "🥕", 10], ["Add wine, tomatoes; simmer low.", "🥘", 120]],
      notes: [["Card says \"a glug\" of wine. We use about 250 ml.", "Priya", "2 Sep"]], photos: ["🥘"], hist: [["5 Sep", "Priya", "Original", "10 portions.", "🥘"]],
      vers: [{ id: "v0", name: "Original", by: "Priya", when: "2 Sep", cooked: 2, depth: 0, def: 1 }] },
    { id: "oml", name: "Cheese omelette", e: "🧀", min: 10, serves: 1, cooked: 9, last: 4, tags: ["Quick"],
      src: "Jane's assistant, from a chat with Jane", srcKind: "conversation",
      ings: [["eggs", "Eggs", 3, ""], ["cheese", "Cheese", 30, "g"], ["butter", "Butter", 1, "tsp"]],
      steps: [["Beat the eggs.", "🥚"], ["Melt butter, pour in eggs, stir gently.", "🍳", 2], ["Add cheese, fold.", "🧀", 1]],
      notes: [], photos: [], hist: [], vers: [{ id: "v0", name: "Original", by: "Jane", when: "1 Aug", cooked: 9, depth: 0, def: 1 }] }
  ];
  /* Photos (owner, 10 Oct 2026; the photos slice's sample files in ../recipe-photos/img, <id>-t|m|l.webp, are reused here).
     banner: one per version. A version without its own shows its nearest ancestor's, with a small icon, until it has one.
     steps: per version, at most one photo per step and at most 10 per version; a step need not have one; inherited the same way.
     A value { id, prep: 1 } is a photo still being prepared (uploaded, sizes not made yet). more: the recipe's other photos;
     cooks: the photos on each cook (up to 3). There is NO "newest cooked photo as cover" fallback: no banner means no banner.
     PC: each photo's dominant colour, sent with the recipe so the placeholder paints with no request (P-D5). Sample data only. */
  var PC = { "efr-s1": "#bfa98c", "efr-s2": "#5e5855", "efr-s4": "#736b62", "efr-1": "#ba976b", "efr-2": "#cba772", "efr-3": "#a67e62", "efr-c1": "#9aa87f", "efr-c2": "#8aad7b", "efr-c3": "#bc8b6c", "cur-1": "#c18e5b", "sha-1": "#b76f60", "rag-1": "#9e6452" };
  var PHOTOS = {
    efr: { banner: { v0: "efr-2", v1: "efr-1" }, steps: { v0: { 0: "efr-s1", 1: "efr-s2" }, v1: { 3: "efr-s4" }, v2: { 2: { id: "efr-c2", prep: 1 } } },
      more: ["efr-3"], cooks: { "8 Oct": ["efr-c1"], "29 Sep": ["efr-c2"], "21 Sep": ["efr-c3"] } },
    cur: { banner: { v0: "cur-1" }, steps: {}, more: [], cooks: {} },
    sha: { banner: { v0: "sha-1" }, steps: {}, more: [], cooks: {} },
    rag: { banner: {}, steps: {}, more: [], cooks: { "5 Sep": ["rag-1"] } }
  };

  /* A draft the assistant wrote, waiting for a person to check it. Recipe has no draft state today (see notes, Recipe-side gap). */
  var DRAFTS = [{ id: "len", name: "Red lentil soup", e: "🍲", from: "Your assistant, from a chat with Alex this morning", min: 35, serves: 4 }];

  /* This week, Monday first. Kitchie's plan owns this; Recipe never stores it. */
  var WEEK = [["Mon", 6, "Cheese omelette"], ["Tue", 7, "Egg fried rice"], ["Wed", 8, null], ["Thu", 9, null, "off"], ["Fri", 10, null], ["Sat", 11, null], ["Sun", 12, "Chickpea and spinach curry"]];
  var TODAY = 1; /* Tuesday */

  var byId = function (id) { return R.filter(function (r) { return r.id === id; })[0]; };
  var has = function (k) { return !!PANTRY[k]; };
  var resolve = function (r, vid) {
    var v = r.vers.filter(function (x) { return x.id === vid; })[0] || r.vers.filter(function (x) { return x.def; })[0] || r.vers[0];
    var chain = [], cur = v;
    /* a version inherits from the one above it (depth - 1) */
    for (var d = v.depth; d >= 0; d--) chain.unshift(r.vers.filter(function (x) { return x.depth === d; })[0]);
    var ings = r.ings.map(function (i) { return { i: i, was: null, added: false }; });
    chain.forEach(function (c) {
      if (!c || !c.chg) return;
      ings = ings.map(function (row) { var s = c.chg.swap[row.i[0]]; return s ? { i: s, was: row.was || row.i, added: row.added } : row; });
      c.chg.add.forEach(function (a) { ings.push({ i: a, was: null, added: true }); });
    });
    return { v: v, ings: ings };
  };
  var missing = function (ings) { return ings.filter(function (x) { return !has(x.i[0]); }); };
  var fmt = function (q, u, n) {
    if (q == null) return null;
    var v = q * n; var s = v >= 10 ? Math.round(v) : Math.round(v * 4) / 4;
    var f = String(s).replace(/\.25$/, "¼").replace(/\.5$/, "½").replace(/\.75$/, "¾").replace(/^0(?=[¼½¾])/, "");
    return f + (u ? (u === "g" || u === "ml" ? " " + u : " " + u + (s > 1 && /tin|stick/.test(u) ? "s" : "")) : "");
  };
  /* Ask your assistant: opens the person's own default AI app and does nothing else (plan-week-ai decisions 42 and 45:
     no in-app agent). Recipe content only ever arrives that way, over Recipe's MCP tools (R-O4, locked).
     The mockup cannot open an app, so it says what would happen. */
  var askAssistant = function (about) {
    toast("Opening your AI app" + (about ? " with " + about : "") + ". It adds recipes through Recipe's tools.");
  };
  /* ---- Photos: frames, the load order and the loaded counter (owner, 10 Oct 2026) ----
     The page paints text first. Every photo box is sized before any byte arrives (no layout jump) and filled with the
     photo's dominant colour, or a stock placeholder in lists. Then images load by phase, never all at once:
       recipe page: "step" (step photos) first, "banner" last; "more" (other photos, cook photos, a note's photo) only on demand.
       list: planned recipes first (if the week's plan exists), then rows on screen plus the next 5 in the shown chip; the rest
       as they come on screen. The list's loader is the Recipe tab's own: the home screen never runs it and never waits for it.
     A photo still being prepared (uploaded, its sizes not made yet) shows its colour and "Photo is being prepared", no spinner. */
  var IMG = BASE + "../recipe-photos/img/"; /* the photos slice's sample files, used read-only */
  var photosOn = function () { return P.photos !== "off"; };
  var chainOf = function (r, vid) {
    var v = r.vers.filter(function (x) { return x.id === vid; })[0] || r.vers.filter(function (x) { return x.def; })[0] || r.vers[0];
    var c = []; for (var d = 0; d <= v.depth; d++) c.push(d === v.depth ? v : r.vers.filter(function (x) { return x.depth === d; })[0]);
    return c;
  };
  /* nearest in the lineage: this version's own, else its parent's, and so on (marked inherited until it has its own) */
  var inherit = function (r, vid, get) {
    var c = chainOf(r, vid);
    for (var i = c.length - 1; i >= 0; i--) { var x = get(c[i].id); if (x) return { p: typeof x === "string" ? { id: x } : x, inherited: i < c.length - 1, from: c[i] }; }
    return null;
  };
  /* Make banner (owner, 11 Oct 2026): a cook photo or any recipe photo becomes a version's banner only by that explicit action. One banner per
     version, always: setting one replaces the old (the old stays in Photos), and there is no way back to no banner. Kept per browser here
     as { "<recipe>:<version>": "<photo id>" }; in the build it is the version's single banner reference. */
  var bannerOv = function () { try { var o = JSON.parse(store.get("banner", "{}")); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } };
  var setBanner = function (r, vid, id) { var o = bannerOv(), k = r.id + ":" + vid, prev = o[k] || null; if (id) o[k] = id; else delete o[k]; store.set("banner", JSON.stringify(o)); return prev; };
  var banner = function (r, vid) { var d = PHOTOS[r.id], o = bannerOv(); return photosOn() && d ? inherit(r, vid, function (id) { return o[r.id + ":" + id] || d.banner[id]; }) : null; };
  /* one per step at most; at most 10 per version (Recipe refuses the 11th); a step need not have one */
  var stepPhoto = function (r, vid, k) { var d = PHOTOS[r.id]; return photosOn() && d ? inherit(r, vid, function (id) { return d.steps[id] && d.steps[id][k]; }) : null; };
  var morePhotos = function (r) {
    var d = PHOTOS[r.id]; if (!photosOn() || !d) return [];
    var out = d.more.slice(); Object.keys(d.cooks).forEach(function (k) { d.cooks[k].forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); }); });
    return out;
  };
  var cookPhotos = function (r, when) { var d = PHOTOS[r.id]; return photosOn() && d ? (d.cooks[when] || []) : []; };
  var got = {}, meterN = 0, meterKB = 0;
  /* Kept sizes (owner, P3, typed 10 Oct 2026; P-D6): the banner keeps large (l, 1600px) + square (t, 240px); every other photo
     keeps medium (m, 960px) + square. Shown: banner at l, step and other photos at m, list tiles at t. The counter uses the
     photos slice's figures for real food photos (P-D3): l about 250 KB, m about 75, t about 12 (so 260 KB stored per banner, 87 per
     other photo). The sample files themselves are much smaller. */
  var KB = { t: 12, m: 75, l: 250 };
  var meter = function () { var m = document.getElementById("rmeter"); if (m) m.innerHTML = "<b>" + meterN + "</b> photo file" + (meterN === 1 ? "" : "s") + " loaded, about <b>" + Math.round(meterKB) + " KB</b> for real photos (banner large 250, medium 75, square 12). Placeholders cost no request."; };
  /* o: { phase: step | banner | more | list, inh: version the photo is inherited from, alt, stock: list placeholder } */
  var frame = function (p, size, o) {
    o = o || {}; var id = p.id, key = id + "-" + size, ok = !!got[key];
    var inh = o.inh ? '<span class="rph-inh" title="Photo of ' + esc(o.inh) + ' until this version has its own"><svg class="ic xs" viewBox="0 0 24 24" aria-hidden="true">' + IC.branch + '</svg><span class="vh">Photo of ' + esc(o.inh) + ", until this version has its own</span></span>" : "";
    if (p.prep) return '<span class="rph prep" style="--pc:' + (PC[id] || "") + '" role="img" aria-label="Photo is being prepared"><span class="rph-prep">Photo is being prepared</span>' + inh + "</span>";
    return '<span class="rph' + (o.stock ? " stock" : "") + (ok ? " in" : "") + '" style="--pc:' + (PC[id] || "") + '" data-pid="' + id + '" data-size="' + size + '" data-phase="' + (o.phase || "more") + '"' + (ok ? ' data-go="1"' : "") + ">" +
      (o.stock ? '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + IC.chef + "</svg>" : "") +
      '<img alt="' + esc(o.alt || "") + '" decoding="async"' + (ok ? ' src="' + IMG + key + '.webp"' : "") + (size === "t" ? ' width="240" height="240"' : size === "l" ? ' width="1600" height="1200"' : ' width="960" height="720"') + ">" + inh + "</span>";
  };
  var fetchPhoto = function (el) {
    if (!el || el.dataset.go) return Promise.resolve(); el.dataset.go = "1";
    var key = el.dataset.pid + "-" + el.dataset.size, img = el.querySelector("img");
    return new Promise(function (done) {
      img.onload = function () { el.classList.add("in"); if (!got[key]) { got[key] = 1; meterN++; meterKB += KB[el.dataset.size]; meter(); } done(); };
      img.onerror = function () { done(); };
      setTimeout(function () { img.src = IMG + key + ".webp"; }, P.photos === "slow" ? 1500 : 0);
    });
  };
  var loadPhase = function (root, phase) { return Promise.all([].map.call((root || document).querySelectorAll('.rph[data-phase="' + phase + '"]:not([data-go])'), fetchPhoto)); };
  /* after the text has painted: two frames later, so the text is on screen before the first image request */
  var afterPaint = function (fn) { requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(fn, 0); }); }); };

  /* ---- Notes: inherited down the lineage (owner, 10 Oct 2026). A note is written on a version and shows on that version and every
     version below it; a version carries notes of its own only where they differ. Viewing a child, a note from above is marked. ----
     Saved notes come back from ../recipe-photos/note.html (key rcp-notes-<recipe id>, or ?noted= on return). */
  var savedNotes = function (r) {
    var out = [];
    try { out = JSON.parse(localStorage.getItem("rcp-notes-" + r.id) || "[]") || []; } catch (e) {}
    var q = Q.get("noted"); if (q) out.push({ body: q, by: me[2], when: "today", v: Q.get("v") || null, cook: Q.get("cook") || null });
    return out;
  };
  var notesFor = function (r, vid) {
    var c = chainOf(r, vid), ids = c.map(function (x) { return x.id; }), cur = c[c.length - 1];
    /* n[4]: the note's id. A later entry with the same id on a child version is that child's own wording of an inherited note
       (the versions slice's "update" op); it replaces the parent's on that child and below, marked "changed here". */
    var all = r.notes.map(function (n) { return { body: n[0], by: n[1], when: n[2], v: n[3] || r.vers[0].id, id: n[4] }; }).concat(savedNotes(r));
    var out = [], byId = {};
    all.filter(function (n) { return ids.indexOf(n.v || cur.id) > -1; }).sort(function (a, b) { return ids.indexOf(a.v || cur.id) - ids.indexOf(b.v || cur.id); }).forEach(function (n) {
      var v = n.v || cur.id, k = ids.indexOf(v);
      var o = { body: n.body, by: n.by, when: n.when, cook: n.cook, from: v === cur.id ? null : c[k], parent: k === ids.length - 2 };
      if (n.id && byId[n.id]) { o.changed = true; out[out.indexOf(byId[n.id])] = o; } else out.push(o);
      if (n.id) byId[n.id] = o;
    });
    return out;
  };
  /* the note body: a tiny Markdown subset (bold, "- " lines), the same one the photos slice uses; a photo reference loads on demand */
  var noteHtml = function (body) {
    var out = [], li = [];
    var flush = function () { if (li.length) { out.push("<ul>" + li.join("") + "</ul>"); li = []; } };
    String(body).split("\n").forEach(function (ln) {
      var m = ln.match(/^\[photo:([\w-]+)\]$/);
      if (m) { flush(); if (photosOn() && PC[m[1]]) out.push('<button type="button" class="nph" data-load aria-label="Photo in this note, tap to load">' + frame({ id: m[1] }, "t", { phase: "more" }) + "</button>"); return; }
      var t = esc(ln).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
      if (/^- /.test(ln)) { li.push("<li>" + t.slice(2) + "</li>"); return; }
      flush(); if (ln.trim()) out.push("<p>" + t + "</p>");
    });
    flush(); return out.join("");
  };

  /* ---- Reactions after a cook (owner, 10 Oct 2026; same model as recipe-versions/versions.js): each member who ate says liked or
     not for me; skip is no answer and is not stored. The household line is derived ("Liked by 2 of 3"), never a separate vote. ---- */
  var REACT = { liked: ["😋", "liked it"], no: ["🙅", "not for me"] };
  var reactLine = function (rx) {
    if (!rx) return "";
    var k = Object.keys(rx), said = k.filter(function (m) { return rx[m] && rx[m] !== "skip"; }), liked = k.filter(function (m) { return rx[m] === "liked"; });
    if (!said.length) return "";
    return "Liked by " + liked.length + " of " + said.length;
  };

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var IC = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>',
    dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    chev: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M15 6l-6 6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><path d="M16 5.5a3 3 0 0 1 0 5.5M18 14c2 .8 3 2.5 3 5"/>',
    cart: '<circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M3 4h2l2.4 11h10.2L20 8H6.2"/>',
    hold: '<path d="M7 4h10v16l-5-3.5L7 20z"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .2 1.5 1 2 2 2-1-3 0-5 1-8z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    cam: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    type: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 3-4 3-8 5"/>',
    note: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M8 9h8M8 13h5"/>',
    img: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 18l5-5 4 4 2-2 3 3"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    plan: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M8 14h3"/>',
    jar: '<rect x="6" y="4" width="12" height="3.5" rx="1.5"/><path d="M7 7.5h10a2 2 0 0 1 2 2V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V9.5a2 2 0 0 1 2-2z"/>',
    chef: '<path d="M7 14a4 4 0 0 1-1-7.7 4.5 4.5 0 0 1 8.6-1.3 4 4 0 0 1 3.4 5.5A4 4 0 0 1 17 14v5H7z"/><path d="M7 17h10"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', snow: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>'
  };
  var ic = function (n, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || "") + "</svg>"; };

  /* Bottom bar. Order is the brief's: Plan, Pantry, Recipes, Shopping (Proposal, see notes D2). */
  var bar = function () {
    return '<nav class="bar" aria-label="Main">' +
      '<a href="' + BASE + '../fragments/plan-week-ai/">' + ic("plan") + "<span>Plan</span></a>" +
      '<a href="' + BASE + '../flows/household/">' + ic("jar") + "<span>Pantry</span></a>" +
      '<a href="' + BASE + 'list.html" class="on" aria-current="page">' + ic("chef") + "<span>Recipes</span></a>" +
      '<a href="' + BASE + '../flows/household/">' + ic("cart") + "<span>Shopping</span></a></nav>";
  };

  var toastT;
  var toast = function (msg, undo) {
    var ph = document.querySelector(".phone"); var old = ph.querySelector(".toast"); if (old) old.remove();
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
    t.innerHTML = "<span>" + msg + "</span>" + (undo ? '<button type="button">Undo</button>' : "");
    ph.appendChild(t); if (undo) t.querySelector("button").onclick = function () { t.remove(); undo(); };
    clearTimeout(toastT); toastT = setTimeout(function () { t.remove(); }, 4000);
  };
  var sheet = function (html, onReady) {
    var ph = document.querySelector(".phone");
    var s = document.createElement("div"); s.innerHTML = '<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + "</div>";
    ph.appendChild(s);
    var close = function () { s.remove(); };
    s.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) close(); });
    if (onReady) onReady(s.querySelector(".sheet"), close);
    return close;
  };

  /* Prototype controls: persona and the open options. Hidden behind one small button, like the theme picker. */
  var controls = function (extra) {
    var seg = function (k, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-set="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (P[k] === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>"; };
    var b = document.createElement("button"); b.type = "button"; b.className = "mockb"; b.textContent = "Mockup"; b.setAttribute("aria-expanded", "false");
    var p = document.createElement("div"); p.className = "mockp"; p.hidden = true;
    p.innerHTML = "<h4>Who is using it</h4>" + seg("persona", PERSONAS.map(function (x) { return [x[0], x[1]]; })) +
      '<p style="margin-top:6px;font-size:12px">' + esc(me[3]) + " Everyone in the household has the same controls (R-O5).</p>" +
      "<h4>Photos</h4>" + seg("photos", [["on", "Has photos"], ["slow", "Slow network"], ["off", "No photos"]]) +
      '<h4>What this screen loaded</h4><p id="rmeter" style="font-size:12px"></p>' +
      '<h4>Versions</h4><p><a href="' + BASE + 'detail.html?id=efr">Several versions (Egg fried rice)</a> · <a href="' + BASE + 'detail.html?id=cur">One version (Chickpea curry)</a></p>' +
      (extra || "") +
      '<h4>Theme</h4><div class="tgrid swatches">' + (window.themeHtml ? themeHtml(null, true) : "") + "</div>" +
      '<h4>Screens</h4><p><a href="' + BASE + 'index.html">Overview and decisions</a> · <a href="' + BASE + 'list.html">List</a> · <a href="' + BASE + 'detail.html?id=efr">Recipe</a> · <a href="' + BASE + 'add.html">Add</a> · <a href="' + BASE + 'review.html">Review</a> · <a href="' + BASE + 'edit.html?id=efr">Change it</a> · <a href="' + BASE + 'cook.html?id=efr">Cook</a></p>';
    document.body.appendChild(p); document.body.appendChild(b); meter();
    b.addEventListener("click", function () { p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden)); if (window.themeWarm) themeWarm(); });
    p.addEventListener("click", function (e) { var x = e.target.closest("[data-set]"); if (!x) return; store.set(x.dataset.set, x.dataset.v); var u = new URL(location.href); u.searchParams.delete(x.dataset.set); location.href = u.toString(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") p.hidden = true; });
  };

  /* Note box (owner, 11 Oct 2026): one cap, 4,000 characters, no other limit in the UI. The box is bounded in height and scrolls inside
     itself, so the page never grows into a notebook. A quiet counter shows only near the cap (from 3,500); at the cap typing stops.
     Markup the build uses: <textarea class="field nbox" maxlength="4000"> then <p class="ncount" data-ncount hidden>. */
  var NOTE_MAX = 4000, NOTE_NEAR = 3500;
  var noteCap = function (ta, out, after) {
    var sync = function () {
      var n = ta.value.length; if (after) after(n);
      if (n >= NOTE_NEAR) { out.hidden = false; out.classList.toggle("full", n >= NOTE_MAX); out.textContent = n >= NOTE_MAX ? "4,000 of 4,000. That is the most a note holds." : n.toLocaleString("en-US") + " of 4,000"; }
      else out.hidden = true;
    };
    ta.addEventListener("input", sync); sync();
  };


  /* Keys (owner, 11 Oct 2026): the app's own shortcuts on Recipe screens, keyboard devices only; fetched on engagement, never on a phone. */
  if (window.matchMedia && matchMedia("(min-width:1024px) and (hover:hover)").matches) document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector(".phone")) return;
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "keys.css"; document.head.appendChild(l);
    var j = document.createElement("script"); j.src = BASE + "keys.js"; document.head.appendChild(j);
  });

  window.RCP = { bannerOv: bannerOv, setBanner: setBanner, noteCap: noteCap, NOTE_MAX: NOTE_MAX, PHOTOS: PHOTOS, PC: PC, chainOf: chainOf, banner: banner, stepPhoto: stepPhoto, morePhotos: morePhotos, cookPhotos: cookPhotos, frame: frame, fetchPhoto: fetchPhoto, loadPhase: loadPhase, afterPaint: afterPaint, photosOn: photosOn, notesFor: notesFor, noteHtml: noteHtml, REACT: REACT, reactLine: reactLine, P: P, Q: Q, me: me, PERSONAS: PERSONAS, R: R, DRAFTS: DRAFTS, WEEK: WEEK, TODAY: TODAY, HELD: HELD, byId: byId, has: has, resolve: resolve, missing: missing, fmt: fmt, esc: esc, ic: ic, bar: bar, toast: toast, sheet: sheet, controls: controls, store: store, askAssistant: askAssistant };
})();
