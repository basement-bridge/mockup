/* MOCK ONLY, not for the build: sample households for the empty-pane options (Kitchie, Pantry and Recipes desktop, owner voice 17 Oct 2026).
   Three sizes per screen: empty (nothing yet), typical (a family kitchen), large (a big household: 420 items, 180 recipes). The repo is public, so every name is invented.
   Shapes follow what the real list pages already carry per row, so nothing here needs a request in the app:
   Pantry row  = name, emoji (em), place, use-by date (days from today), level, quantity, added (days ago), low (the Running low list), gone (Out). [server/src/app.ts renderRow: data-name, data-area, data-useby, data-low, data-gone, data-recent]
   Recipe row  = name, minutes, serves, missing (null when the pantry cannot be read), cooked (days ago), starred, planned. [server/src/recipe-tab/list.ts row: data-ready, data-cd, data-star, data-planned, data-quick] */
(function () {
  "use strict";
  var seed = 7;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }

  /* ---------- Pantry ---------- */
  var P_TYPICAL = [
    ["Milk", "Fridge", 1, "some", "1 litre"], ["Spinach", "Fridge", 0, "some", "1 bag"], ["Yoghurt", "Fridge", 2, "some", "500 g"], ["Cheddar", "Fridge", 9, "plenty", "400 g"],
    ["Butter", "Fridge", 30, "plenty", "250 g"], ["Eggs", "Fridge", 12, "some", "6"], ["Carrots", "Fridge", 6, "plenty", "6"], ["Leftover dahl", "Fridge", -1, "some", "1 tub"],
    ["Chicken thighs", "Freezer", 40, "some", "6"], ["Peas", "Freezer", 120, "plenty", "1 bag"], ["Ice cream", "Freezer", null, "low", "1 tub"], ["Bread", "Freezer", 30, "some", "1 loaf"],
    ["Rice", "Pantry", null, "plenty", "2 kg"], ["Pasta", "Pantry", null, "plenty", "3 packs"], ["Tinned tomatoes", "Pantry", 400, "low", "1 can"], ["Olive oil", "Pantry", null, "plenty", "Plenty"],
    ["Lentils", "Pantry", null, "plenty", "1 kg"], ["Flour", "Pantry", 200, "some", "1 kg"], ["Honey", "Pantry", null, "plenty", "Plenty"], ["Coffee beans", "Pantry", 60, "low", "Some"],
    ["Cumin", "Spice rack", null, "some", "Some"], ["Paprika", "Spice rack", null, "low", "A little"], ["Salt", "Spice rack", null, "plenty", "Plenty"], ["Tahini", "Pantry", null, "out", "Out"],
    ["Basil", "Fridge", 3, "some", "1 pot"], ["Oats", "Pantry", null, "plenty", "1 kg"], ["Garlic", "Pantry", 14, "plenty", "3 heads"], ["Onions", "Pantry", 20, "plenty", "6"]
  ].map(function (r, i) { return { id: "p" + i, n: r[0], loc: r[1], ub: r[2], lvl: r[3], qty: r[4], added: (i * 3) % 19 }; });

  var BASE = ["Milk", "Eggs", "Butter", "Yoghurt", "Cheddar", "Parmesan", "Mozzarella", "Cream", "Spinach", "Kale", "Lettuce", "Tomatoes", "Cucumber", "Capsicum", "Broccoli", "Cauliflower", "Zucchini", "Mushrooms", "Carrots", "Potatoes",
    "Sweet potato", "Pumpkin", "Onions", "Garlic", "Ginger", "Lemons", "Limes", "Apples", "Bananas", "Berries", "Chicken thighs", "Chicken breast", "Beef mince", "Sausages", "Bacon", "Salmon", "Prawns", "Tofu", "Tempeh", "Hummus",
    "Rice", "Basmati rice", "Pasta", "Noodles", "Couscous", "Oats", "Flour", "Sugar", "Lentils", "Chickpeas", "Black beans", "Tinned tomatoes", "Coconut milk", "Stock", "Soy sauce", "Fish sauce", "Olive oil", "Vinegar", "Mustard", "Tahini",
    "Cumin", "Paprika", "Turmeric", "Coriander", "Oregano", "Cinnamon", "Pepper", "Salt", "Coffee beans", "Tea", "Honey", "Jam", "Peanut butter", "Bread", "Tortillas", "Peas", "Corn", "Ice cream", "Frozen berries", "Dumplings"];
  var PLACES = ["Fridge", "Freezer", "Pantry", "Spice rack", "Garage fridge", "Cellar", "Cupboard 1", "Cupboard 2"];
  var QUAL = ["", " (organic)", " (big)", " (small)", " (spare)", " (open)"];
  var P_LARGE = [];
  for (var i = 0; i < 420; i++) {
    var n = BASE[i % BASE.length] + (i >= BASE.length ? QUAL[1 + (Math.floor(i / BASE.length) + i) % (QUAL.length - 1)] : "");
    var r = rnd(), lvl = r < 0.05 ? "out" : r < 0.13 ? "low" : r < 0.4 ? "some" : "plenty";
    var ub = rnd() < 0.42 ? Math.floor(rnd() * 90) - (rnd() < 0.05 ? 3 : 0) : null;
    if (i < 6) ub = i - 1; /* a few overdue or today, so the top of "use soon" is stable */
    P_LARGE.push({ id: "L" + i, n: n, loc: pick(PLACES), ub: ub, lvl: lvl, qty: lvl === "out" ? "Out" : lvl === "low" ? pick(["1 left", "A little", "Almost out"]) : pick(["1", "2", "3 packs", "500 g", "1 kg", "Some", "Plenty"]), added: Math.floor(rnd() * 60) });
  }

  /* ---------- Recipes ---------- */
  var R_TYPICAL = [
    ["Lentil dahl", 35, 4, 0, 2, true, true], ["Roast chicken", 90, 4, 1, 12, true, false], ["Pasta al limone", 20, 2, 0, 6, false, true], ["Veg curry", 40, 4, 2, 25, false, false],
    ["Banana pancakes", 25, 3, 0, 3, true, false], ["Fish tacos", 30, 4, 3, null, false, false], ["Mushroom risotto", 45, 4, 1, 30, false, false], ["Shakshuka", 25, 2, 0, 9, true, false],
    ["Tomato soup", 30, 4, 0, 1, false, false], ["Chickpea salad", 15, 2, 0, 18, false, false], ["Beef stew", 150, 6, 4, 40, false, false], ["Fried rice", 20, 3, 0, 4, false, true],
    ["Greek salad", 15, 2, 1, null, false, false], ["Banana bread", 70, 8, 2, 14, true, false]
  ].map(function (r, i) { return { id: "r" + i, n: r[0], min: r[1], serves: r[2], miss: r[3], cd: r[4], star: r[5], planned: r[6] }; });

  /* Revised 17 Oct 2026 (owner decided both panes): Pantry rows also carry what Home already holds or can hand over (em, plan = the meal and night it is planned for, onList = on the shopping list);
     Recipe rows carry added (days since the recipe was added; the Recipe service lists newest first but does not send a date today) and night (the planned night). */
  var EM = { "Milk": "\u{1F95B}", "Spinach": "\u{1F96C}", "Yoghurt": "\u{1F963}", "Leftover dahl": "\u{1F372}", "Basil": "\u{1F33F}", "Carrots": "\u{1F955}", "Ice cream": "\u{1F368}", "Tinned tomatoes": "\u{1F96B}", "Coffee beans": "\u2615", "Paprika": "\u{1F336}\uFE0F", "Tahini": "\u{1FAD9}", "Eggs": "\u{1F95A}", "Cheddar": "\u{1F9C0}", "Bread": "\u{1F35E}" };
  var PLAN_T = { "Milk": { meal: "Banana pancakes", night: "Tomorrow", d: 1 }, "Basil": { meal: "Pasta al limone", night: "Thursday", d: 3 }, "Yoghurt": { meal: "Banana bread", night: "Saturday", d: 5 } };
  var ON_T = { "Tinned tomatoes": 1, "Coffee beans": 1 };
  P_TYPICAL.forEach(function (it) { if (EM[it.n]) it.em = EM[it.n]; it.plan = PLAN_T[it.n] || null; it.onList = !!ON_T[it.n]; });
  var MEALS = ["Lentil dahl", "Veg curry", "Shakshuka", "Tomato soup", "Fried rice", "Fish tacos"], NIGHTS = ["Tonight", "Tomorrow", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  P_LARGE.forEach(function (it, ix) {
    if (it.ub !== null && it.ub <= 7 && ix % 3 !== 0) { var d = ix % 2 ? Math.max(0, it.ub) : Math.max(0, it.ub) + 2; it.plan = { meal: MEALS[ix % MEALS.length], night: NIGHTS[Math.min(d, 6)], d: d }; } else it.plan = null;
    it.onList = (it.lvl === "low" || it.lvl === "out") && ix % 3 === 0;
  });

  var DISH = ["Curry", "Soup", "Salad", "Stew", "Bake", "Stir fry", "Tacos", "Risotto", "Noodles", "Pie", "Frittata", "Dumplings", "Pancakes", "Roast", "Chilli"];
  var MAIN = ["Chicken", "Lentil", "Mushroom", "Pumpkin", "Salmon", "Beef", "Chickpea", "Spinach", "Tofu", "Potato", "Egg", "Prawn", "Cauliflower", "Sausage", "Zucchini", "Bean"];
  var STYLE = ["", "Smoky ", "Lemon ", "Garlic ", "Spicy ", "Creamy ", "Sticky ", "Herby ", "One pan "];
  var R_LARGE = [];
  for (var j = 0; j < 180; j++) {
    var m = rnd(), miss = m < 0.34 ? 0 : m < 0.5 ? 1 : m < 0.62 ? 2 : m < 0.75 ? 3 + Math.floor(rnd() * 4) : 4 + Math.floor(rnd() * 7);
    var c = rnd();
    R_LARGE.push({ id: "R" + j, n: pick(STYLE) + pick(MAIN) + " " + pick(DISH).toLowerCase(), min: 10 + Math.floor(rnd() * 12) * 10, serves: 2 + Math.floor(rnd() * 5), miss: miss,
      cd: c < 0.1 ? Math.floor(rnd() * 7) : c < 0.5 ? 7 + Math.floor(rnd() * 90) : null, star: rnd() < 0.15, planned: j < 5 });
  }
  /* a stable, readable top of the "ready now" list in the large household */
  [["Lentil dahl", 0], ["Pasta al limone", 0], ["Tomato soup", 0]].forEach(function (x, k) { R_LARGE[10 + k].n = x[0]; R_LARGE[10 + k].miss = x[1]; R_LARGE[10 + k].cd = 40 + k; });

  /* "calm": nothing needs attention (no use-by within a week, nothing low or out; no recipe ready, planned or cooked this week), so a pane built on "what needs you" has nothing to say */
  var R_ADDED = { "Fish tacos": 3, "Greek salad": 6, "Banana bread": 11, "Mushroom risotto": 40, "Veg curry": 70 }, R_NIGHT = { "Lentil dahl": "Thursday", "Pasta al limone": "Saturday", "Fried rice": "Sunday" };
  R_TYPICAL.forEach(function (r) { r.added = R_ADDED[r.n] === undefined ? null : R_ADDED[r.n]; r.night = R_NIGHT[r.n] || ""; });
  R_LARGE.forEach(function (r, j) { r.added = j < 4 ? j * 3 + 1 : (j * 13) % 300 + 15; r.night = r.planned ? NIGHTS[j % 7] : ""; });
  var P_CALM = P_TYPICAL.filter(function (i) { return (i.ub === null || i.ub > 7) && i.lvl !== "low" && i.lvl !== "out"; });
  var R_CALM = R_TYPICAL.filter(function (r) { return r.miss >= 2 && !r.planned && (r.cd === null || r.cd > 7) && (r.added === null || r.added > 14); }).map(function (r, i) { var o = {}; for (var k in r) o[k] = r[k]; o.id = "c" + i; return o; });

  window.EP_DATA = {
    pantry: { empty: [], typical: P_TYPICAL, large: P_LARGE, calm: P_CALM },
    recipes: { empty: [], typical: R_TYPICAL, large: R_LARGE, calm: R_CALM, nostock: R_TYPICAL.map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; o.miss = null; return o; }) },
    household: { empty: "the Anders household", typical: "the Adeyemi household", large: "the Okonkwo-Reyes household" }
  };
})();
