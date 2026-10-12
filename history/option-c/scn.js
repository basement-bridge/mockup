/* Mockup-only scenario bar: jumps to a scope or state. Not part of the app.
   Revised to the owner's locked decisions H2, H5, H9, H10 (11 Oct 2026): three concerns (shopping drawn, pantry and recipes linked). */
window.SCN = [
 ["shop:rice", "Shopping entry", "Basmati rice on the list (voice, amount change, receipt)"], ["shop:tea", "Taken off", "Green tea, added then removed"], ["list:", "Whole list", "The shopping list"],
 ["pantry:rice", "Pantry", "Existing item flyout History (linked)"], ["recipes:fried-rice", "Recipes", "Existing version history and To review (linked)"]
];
/* [scope, state, label]. state: catchup = opened from the catch-up (option D); nomatch = filters with no match */
window.SCN_STATES = [["shop:rice", "catchup", "Opened from the catch-up"], ["pantry:rice", "catchup", "Catch-up, Pantry entry"], ["recipes:fried-rice", "catchup", "Catch-up, Recipe entry"], ["shop:rice", "nomatch", "No match"]];
window.HOST = {
 shop: ["🍚", "Basmati rice", "On the shopping list", ["2 kg", "Added today by Sam, by voice", "Amount changed by You"]],
 tea: ["🍵", "Green tea", "Taken off the shopping list", ["Added Sat by Sam", "Taken off yesterday by You"]],
 list: ["🛒", "Shopping list", "Our kitchen · 4 lines", ["Basmati rice, 2 kg", "Eggs", "Frozen peas"]],
 pantry: ["🍚", "Basmati rice", "Pantry · Top shelf", ["About 3 cups", "Level: Running low", "On the shopping list"]],
 recipes: ["🍳", "Egg fried rice", "Our usual · revision 6 · starred", ["4 servings", "20 min", "Edited yesterday by Sam"]],
 catchup: ["🔔", "Since you were last here", "Catch-up · last 3 days", ["Sam added Basmati rice to the shopping list", "Sam moved Egg fried rice to 7:30 pm", "Priya moved Basmati rice to the Top shelf"]]
};
window.SCN_FOCUS = { "shop:rice": "r1" };
window.CATCH_ROW = { shop: 0, recipes: 1, pantry: 2 };
