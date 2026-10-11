/* Mockup-only scenario bar: jumps to a scope or state. Not part of the app. */
window.SCN = [
 ["item:rice", "Item", "Basmati rice (item flyout)"], ["spot:Pantry|Top shelf", "Spot", "Top shelf (location card)"], ["recipe:fried-rice", "Recipe", "Egg fried rice (recipe page)"],
 ["person:sam", "Member", "Sam (member card)"], ["day:Sat", "Plan day", "Saturday (plan)"], ["all:", "Everything", "Profile > History"]
];
window.SCN_STATES = [["item:tea", "", "Quiet item"], ["item:rice", "ramen", "No results"]];
window.HOST = {
 item: ["🍚", "Basmati rice", "Pantry · Top shelf", ["About 3 cups", "Level: Running low", "Use by: not set", "On the shopping list"], "clock"],
 spot: ["🗄️", "Top shelf", "in Pantry", ["Basmati rice", "Soy sauce", "Sesame oil", "3 items"], "clock"],
 recipe: ["🍳", "Egg fried rice", "Our usual · revision 6 · starred", ["4 servings", "20 min", "Cooked Sat by You", "Edited Sat by Sam"], "clock"],
 person: ["🧑‍🍳", "Sam", "Member · Sous chef", ["No peanuts", "Linked: Claude", "Last seen today"], "clock"],
 day: ["📅", "Saturday", "Dinner: Egg fried rice, 7:30 pm", ["Planned by Claude, for Sam", "Time moved by Sam"], "clock"],
 all: ["🏠", "Our kitchen", "Profile · History", ["2 members", "1 assistant linked"], "clock"],
 place: ["🧊", "Pantry", "Location", ["14 items"], "clock"]
};
