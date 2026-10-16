/* Shopping receipt review mockup (Kitchie #797): sample data. Mockup only; plain names for sample data stay here, never in the stylesheet.
   Synthetic trip and receipt. list = what the shopping row says (null = no amount listed). state = what already happened to the row on this trip:
   open (nothing yet), ticked (a browser flag only, nothing in the Pantry), bought (swiped or its Bought form: already in the Pantry), finished (Done shopping: already in the Pantry).
   pantry = what the earlier answer put in the Pantry (a blind swipe puts the listed amount, or 1 when none was listed).
   rcpt = what the receipt says; null = the line did not show a number. exact = the Pantry holds this item in an exact unit (kg, g, L, mL). */
window.SRD = (function () {
  var rows = [
    { id: "milk", name: "Milk", em: "🥛", list: { q: 2, u: "L" }, state: "ticked", rcpt: { q: 2, u: "L" }, raw: ["MILK 2L"], at: "" },
    { id: "eggs", name: "Eggs", em: "🥚", list: null, state: "open", rcpt: { q: 12, u: "" }, raw: ["EGGS 12"] },
    { id: "rice", name: "Basmati rice", em: "🍚", list: { q: 1, u: "kg" }, state: "ticked", rcpt: { q: 2, u: "kg" }, raw: ["BASMATI RICE 1KG", "2 x 1KG"], note: "2 x 1KG read as 2 kg" },
    { id: "chk", name: "Chicken thighs", em: "🍗", list: { q: 1, u: "kg" }, state: "open", exact: true, rcpt: { q: 2, u: "", bare: true }, raw: ["CHKN THIGH", "QTY 2"], note: "QTY 2 has no unit" },
    { id: "yog", name: "Greek yoghurt", em: "", list: { q: 500, u: "g" }, state: "open", rcpt: { q: 1000, u: "g" }, raw: ["GRK YOG 500G", "GRK YOG 500G"], from: 2, note: "Two lines for one item: 500 g + 500 g" },
    { id: "banana", name: "Bananas", em: "🍌", list: null, state: "bought", at: "12:40", pantry: { q: 1, u: "" }, rcpt: { q: 1.204, u: "kg" }, raw: ["ORG BANANAS", "1.204 kg @ 2.90/kg"], note: "The swipe added 1 (no amount was listed)" },
    { id: "butter", name: "Butter", em: "🧈", list: { q: 250, u: "g" }, state: "bought", at: "12:41", pantry: { q: 250, u: "g" }, rcpt: { q: 250, u: "g" }, raw: ["BTR SLTD 250G"] },
    { id: "tuna", name: "Tuna", em: "", list: { q: 2, u: "tin" }, state: "finished", at: "Done shopping", pantry: { q: 2, u: "tin" }, rcpt: { q: 3, u: "tin" }, raw: ["TUNA 425G", "3 @ 1.15"], note: "3 @ 1.15 read as 3 tins" }
  ];
  var extra = [{ id: "salmon", name: "Smoked salmon", em: "", rcpt: { q: 400, u: "g" }, raw: ["KS SMKD SLMN 400G"] }];
  /* order = the order the lines print on the receipt (option A); rows above are in list order (option B) */
  var order = ["milk", "eggs", "rice", "chk", "banana", "yog", "butter", "tuna", "salmon"];
  return { rows: rows, extra: extra, order: order, units: ["kg", "g", "tin", "pack"] };
})();
