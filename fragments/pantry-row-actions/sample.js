/* MOCK ONLY, not for the build: the sample Pantry and a stand-in for the shopping list (fragments/pantry-row-actions, Kitchie #866).
   kind 1 = counted (Use one exists), 0 = level-only (it does not: the Pantry's data-sheet first character, docs/adr/pantry-item-sheet.md in Kitchie).
   out = already used up (Out): hidden in the default view, reachable by the Out chip or a search. */
(function () {
  "use strict";
  window.PRA_ITEMS = [
    { id: "milk", emoji: "🥛", name: "Milk", kind: 0, amt: "1 litre", area: "Fridge", spot: "Door", due: 3 },
    { id: "butter", emoji: "🧈", name: "Butter", kind: 0, amt: "250 g", area: "Fridge", spot: "Top shelf" },
    { id: "eggs", emoji: "🥚", name: "Eggs", kind: 1, n: 10, unit: "", area: "Fridge", spot: "Top shelf", due: 9 },
    { id: "carrots", emoji: "🥕", name: "Carrots", kind: 1, n: 6, unit: "", area: "Fridge", spot: "Crisper" },
    { id: "cheddar", emoji: "🧀", name: "Cheddar", kind: 0, amt: "400 g", area: "Fridge", spot: "Middle shelf", due: 9 },
    { id: "rice", emoji: "🍚", name: "Rice", kind: 0, amt: "2 kg", area: "Pantry", spot: "Shelf 2" },
    { id: "tomatoes", emoji: "🥫", name: "Tinned tomatoes", kind: 1, n: 4, unit: "cans", area: "Pantry", spot: "Shelf 1" },
    { id: "pasta", emoji: "🍝", name: "Pasta", kind: 1, n: 3, unit: "packs", area: "Pantry", spot: "Shelf 1" },
    { id: "oil", emoji: "🫒", name: "Olive oil", kind: 0, amt: "Plenty", area: "Pantry", spot: "Shelf 2" },
    { id: "peas", emoji: "🟢", name: "Peas", kind: 1, n: 1, unit: "bag", area: "Freezer", spot: "Drawer 1" },
    { id: "thighs", emoji: "🍗", name: "Chicken thighs, free range, skinless, family pack", kind: 1, n: 6, unit: "", area: "Freezer", spot: "Drawer 2", due: 40 },
    { id: "icecream", emoji: "🍨", name: "Ice cream", kind: 1, n: 1, unit: "tub", area: "Freezer", spot: "Drawer 1" },
    { id: "tahini", emoji: "🫙", name: "Tahini", kind: 0, amt: "Out", area: "Pantry", spot: "Shelf 2", out: true }
  ];
  /* The shopping list: 8 lines to get, as in fragments/desktop-shopping. Carrots are already on it, so Add to list can say so (the app answers "already"). */
  window.PRA_SHOP = { count: 8, on: { carrots: true } };
})();
