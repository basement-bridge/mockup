/* Pantry D (fragment): sample data added on top of ../list-language/ll-data.js. Mock only, never in a stylesheet.
   Adds: the long-name stress cases the owner asked for (25 Oct 2026), a level on every item (the Amount column shows amount and level together),
   use-by spread (1D ... 1 month), what changed since the person last looked (catch-up), and the Home bits (lean -> idea, plan state).
   The six lean names are the real ones UAT has today (server/src/recipe LEANS: Balanced, Use it up, Quick, Favourites, Something different, Batch). */
(function () {
  "use strict";
  const D = window.LL_DATA;
  const add = [
    { id: "evoo", e: "🫒", name: "Extra virgin cold pressed Australian olive oil, family size bottle", amt: "1 bottle", spot: "Top shelf, inside the pantry cupboard next to the laundry", cat: "Condiments", loc: "Pantry", days: 41, upd: 19, lvl: "some", chg: true },
    { id: "flour", e: "", name: "Wholemeal self-raising flour with added wheat germ and fibre", amt: "2 kg", spot: "Left hand shelf of the back garage chest freezer", cat: "Dry goods", loc: "Freezer", days: 9, upd: 20, lvl: "plenty", chg: true },
    { id: "peas", e: "", name: "Frozen peas", amt: "2 bags", spot: "Bottom drawer", cat: "Veggies", loc: "Freezer", days: 63, upd: 1, lvl: "plenty" },
    { id: "tahini", e: "", name: "Tahini", amt: "1 jar", spot: "Door", cat: "Condiments", loc: "Fridge", days: 15, upd: 21, lvl: "some" }
  ];
  D.pantry = D.pantry.concat(add);
  D.catOrder = D.catOrder.slice();
  D.pantry.forEach((i) => {
    if (!i.lvl) i.lvl = i.low ? "low" : "plenty";
    if (i.recent) i.chg = true;
    if (i.id === "turmeric") i.days = -1;
    if (i.id === "yoghurt") i.days = 7;
    if (i.id === "soy") i.days = 28;
  });
  D.lastSeen = "Saturday evening";
  /* Home */
  D.leans = [["balanced", "Balanced"], ["use", "Use it up"], ["quick", "Quick"], ["fav", "Favourites"], ["new", "Something different"], ["batch", "Batch"]];
  D.leanIdea = { balanced: "omelette", use: "saag", quick: "toastie", fav: "dal", new: "pancakes", batch: "soup" };
  D.home.out = ["turmeric", "spinach", "milk", "mushrooms", "paneer", "flour"];
  D.home.low = ["milk", "tomatopaste", "garam", "paneer"];
  D.home.onList = ["milk"];       /* already on the shopping list: filled cart */
  D.home.override = ["turmeric"]; /* level set by hand: the level symbol shows instead of the quantity (never both) */
})();
