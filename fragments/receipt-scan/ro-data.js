/* Receipt scan, chosen flow (Option A, Receipt order, live): sample data. Mockup only (DESIGN.md: plain names that exist only for sample data stay in the mockup's own script).
   Synthetic: no real shop, receipt or card digits. Every line is invented to cover one state.
   The scores are what the build's matcher gives for these names (server/src/assets/pantry-receipt-match.js, RS-66): see "How a line is scored" in the job note. */
window.ROD = (function () {
  /* The household's Pantry. place = "Area · Spot". Kitchie keeps ONE record per item (no batches, RS-56): a match tops that record up. */
  var pantry = [
    { id: "eggs", name: "eggs", em: "🥚", q: 12, u: "", place: "Fridge · Door" },
    { id: "milk", name: "milk", em: "🥛", q: 1, u: "L", place: "Fridge · Door" },
    { id: "butter", name: "butter", em: "🧈", q: 250, u: "g", place: "Fridge · Door" },
    { id: "yog", name: "greek yoghurt", em: "", q: 500, u: "g", place: "Fridge · Top shelf" },
    { id: "cheddar", name: "cheddar", em: "🧀", q: 200, u: "g", place: "Fridge · Top shelf" },
    { id: "rice", name: "Basmati rice", em: "🍚", q: 5, u: "kg", place: "Pantry · Bottom shelf" },
    { id: "tom", name: "Chopped tomatoes", em: "🥫", q: 4, u: "tin", place: "Pantry · Top shelf" },
    { id: "oil", name: "Olive oil", em: "", q: 500, u: "mL", place: "Pantry · Cupboard" },
    { id: "pasta", name: "Pasta, penne", em: "🍝", q: 500, u: "g", place: "Pantry · Bottom shelf" },
    { id: "chk", name: "Chicken thighs", em: "🍗", q: 1, u: "kg", place: "Freezer · Drawer 1" },
    { id: "salmon", name: "salmon", em: "🐟", q: 2, u: "pack", place: "Freezer · Drawer 2" },
    { id: "tuna", name: "Tuna", em: "", q: 0, u: "tin", place: "Pantry · Top shelf", out: true },
    { id: "onion", name: "Onions", em: "🧅", q: 6, u: "", place: "Pantry · Baskets" },
    { id: "spin", name: "spinach", em: "🥬", q: 1, u: "bag", place: "Fridge · Crisper" }
  ];
  /* The read. st: exact | check | unsure | left (RS-61, RS-65). m = the matched Pantry id. score = the matcher's score, dots come from it (3, 2, 1; RS-57).
     q/u = the parsed quantity and unit. note = how the quantity was read. cand = other candidates, best first. guess = the cleaned name offered for a new item.
     why = the reason a left-out line is never matched. */
  var lines = [
    { id: "l1", raw: ["BASMATI RICE 5KG"], price: 14.9, st: "exact", m: "rice", q: 5, u: "kg", note: "5KG read as 5 kg" },
    { id: "l2", raw: ["EGGS 12"], price: 7.5, st: "exact", m: "eggs", q: 12, u: "", note: "12 read as a count of 12" },
    { id: "l3", raw: ["MILK 1L", "MILK 1L"], price: 4.2, st: "exact", m: "milk", q: 2, u: "L", from: 2, note: "Two lines read as the same item: 1 L + 1 L = 2 L (combined)" },
    { id: "l4", raw: ["CHOPPED TOMATOES 400G", "4 @ 1.10"], price: 4.4, st: "exact", m: "tom", q: 4, u: "tin", note: "4 @ 1.10 read as 4 units. 400G is the tin size, not the amount, so it is dropped" },
    { id: "l5", raw: ["TUNA 425G", "3 @ 1.15"], price: 3.45, st: "exact", m: "tuna", q: 3, u: "tin", note: "3 @ 1.15 read as 3 tins" },
    { id: "l6", raw: ["SLCD CHEDDAR 500G"], price: 9.8, st: "check", m: "cheddar", score: 0.8, cand: ["butter"], q: 500, u: "g", guess: "Sliced cheddar", note: "500G read as 500 g. The receipt also says sliced" },
    { id: "l7", raw: ["PENNE RIGATE 500G"], price: 1.99, st: "check", m: "pasta", score: 0.5, cand: [], q: 500, u: "g", guess: "Penne rigate", note: "500G read as 500 g. Only the kind of thing matches (pasta)" },
    { id: "l8", raw: ["BTR SLTD 250G"], price: 6.2, st: "check", m: "butter", score: 0.8, cand: ["cheddar"], q: 250, u: "g", guess: "Salted butter", note: "BTR is a short form of butter. The receipt also says salted" },
    { id: "l9", raw: ["GRK YOG 1KG"], price: 5.6, st: "check", m: "yog", score: 0.93, cand: ["milk"], q: 1000, u: "g", guess: "Greek yoghurt", note: "1KG read as 1 kg. The Pantry holds yoghurt in g, so 1 kg becomes 1000 g" },
    { id: "l10", raw: ["GV EVOO 1L"], price: 12.5, st: "check", m: "oil", score: 0.65, cand: [], q: 1000, u: "mL", guess: "Extra virgin olive oil", note: "EVOO is a short form of extra virgin olive oil. 1 L becomes 1000 mL" },
    { id: "l11", raw: ["KS CHKN BRST 2.1KG"], price: 17.3, st: "check", m: "chk", score: 0.5, cand: ["spin"], q: 2.1, u: "kg", guess: "Chicken breast", note: "2.1KG read as 2.1 kg. Only the word chicken matches" },
    { id: "l12", raw: ["ORG BANANAS", "1.204 kg @ 2.90/kg"], price: 3.49, st: "unsure", q: 1.2, u: "kg", guess: "Bananas", note: "The weight line belongs to the item above it: 1.204 kg" },
    { id: "l13", raw: ["KS SMKD SLMN 400G"], price: 11, st: "check", m: "salmon", score: 0.8, cand: [], q: 1, u: "pack", guess: "Smoked salmon", note: "SMKD SLMN read as smoked salmon. 400G is the pack size, so 1 pack" },
    { id: "l14", raw: ["XJ4 B1U 3PK"], price: 6, st: "unsure", q: 3, u: "", guess: "", unclear: true, note: "The text is unclear (blur). 3PK read as 3 in a pack" },
    { id: "s1", raw: ["INSTANT SAVINGS -3.00"], price: -3, st: "left", why: "Discount: takes $3.00 off the chicken line above. Not an item", short: "Discount" },
    { id: "s2", raw: ["PLASTIC BAG 0.15"], price: 0.15, st: "left", why: "Not food: a bag charge", short: "Not food" }
  ];
  var ignored = ["Header and address (5 lines)", "SUBTOTAL 87.43", "GST 3.12", "TOTAL 90.55", "EFTPOS 90.55", "Thank you for shopping"];
  return { pantry: pantry, lines: lines, ignored: ignored };
})();
