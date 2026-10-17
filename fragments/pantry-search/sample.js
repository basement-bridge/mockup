/* MOCK ONLY, not for the build: the sample Pantry and a stand-in for the Shopping list "server" (fragments/pantry-search, Kitchie #807).
   In the app the Pantry rows are on the page already and the list call is a new web route over addToShoppingByName (server/src/store.ts). */
(function () {
  "use strict";
  window.PS_ITEMS = [
    { name: "Milk", area: "Fridge", amt: "1 litre", due: "Use within 3 days" },
    { name: "Butter", area: "Fridge", amt: "250 g" },
    { name: "Carrots", area: "Fridge", amt: "6" },
    { name: "Cheddar", area: "Fridge", amt: "400 g", due: "Use within 9 days" },
    { name: "Eggs", area: "Fridge", amt: "10" },
    { name: "Rice", area: "Pantry", amt: "2 kg" },
    { name: "Tinned tomatoes", area: "Pantry", amt: "4 cans" },
    { name: "Pasta", area: "Pantry", amt: "3 packs" },
    { name: "Olive oil", area: "Pantry", amt: "Plenty" },
    { name: "Peas", area: "Freezer", amt: "1 bag" },
    { name: "Chicken thighs", area: "Freezer", amt: "6", due: "Use within 40 days" },
    { name: "Bread", area: "Freezer", amt: "1 loaf" },
    { name: "Ice cream", area: "Freezer", amt: "1 tub" },
    { name: "Coffee beans", area: "", amt: "Some" },
    { name: "Honey", area: "", amt: "Plenty" }
  ];

  /* The shopping list, as in fragments/desktop-shopping (8 lines). Names are lower-case keys.
     USED = tracked items that are used up: the Pantry search hides them, so "No item matches" can still mean a tracked item exists (issue #807 edge 2). */
  var LIST = ["blend - sambar powder", "cendol", "chilli sauce, hot", "chives", "dill", "eggs", "milk", "rice"];
  var USED = { tahini: "Tahini" };
  var key = function (q) { return String(q).trim().replace(/\s+/g, " ").toLowerCase(); };
  window.PS_SHOP = {
    count: function () { return LIST.length; },
    /* what addToShoppingByName answers: { already:true } | { linked:"Tahini" } | { added:true } */
    add: function (name) {
      var k = key(name);
      if (LIST.indexOf(k) > -1) return { already: true };
      LIST.push(k);
      return USED[k] ? { linked: USED[k] } : { added: true };
    },
    undo: function (name) { var i = LIST.indexOf(key(name)); if (i > -1) LIST.splice(i, 1); }
  };
})();
