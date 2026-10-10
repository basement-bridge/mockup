/* The emoji list for the item's emoji picker (Edit and Add). Fetched the first time the picker opens, never on page load (DESIGN.md section 6). No size rules here.
   Each entry is [emoji, name, search words]. The name is the accessible label; the words are what the search matches, with the name. About 120 foods, drinks and kitchen things: not the whole emoji set (no photos, no flags, no faces).
   "Recent" is the last 8 the person picked on this device (localStorage, best effort: a private window just has none). With nothing picked yet it starts from the emoji already on the household's items, so the row is never empty. Sample data only. */
(function () {
"use strict";
var IEF = window.IEF, KEY = "ief.emoji.recent", mem = null;
var LIST = [
  ["🧈", "butter", "dairy spread fat"], ["🥛", "milk", "dairy glass cow"], ["🧀", "cheese", "dairy cheddar wedge"], ["🥚", "egg", "eggs dairy breakfast"], ["🍳", "fried egg", "cooking breakfast pan"], ["🍦", "soft ice cream", "dessert cone frozen"], ["🍨", "ice cream", "dessert frozen sundae"], ["🍧", "shaved ice", "dessert frozen"],
  ["🥕", "carrot", "vegetable veg orange root"], ["🥬", "leafy green", "spinach lettuce kale vegetable salad cabbage"], ["🥦", "broccoli", "vegetable veg green"], ["🧅", "onion", "vegetable veg"], ["🧄", "garlic", "vegetable veg clove"], ["🍅", "tomato", "vegetable fruit red tomatoes"], ["🥔", "potato", "vegetable veg spud"], ["🍠", "sweet potato", "vegetable veg yam kumara"],
  ["🌽", "corn", "sweetcorn maize vegetable cob"], ["🥒", "cucumber", "vegetable veg salad pickle"], ["🫑", "bell pepper", "capsicum vegetable veg"], ["🌶️", "chilli", "chili hot pepper spicy spice"], ["🍆", "aubergine", "eggplant brinjal vegetable veg"], ["🥑", "avocado", "fruit green guacamole"], ["🍄", "mushroom", "vegetable fungus"], ["🫛", "peas", "pea pod vegetable green frozen"],
  ["🌿", "herb", "herbs coriander cilantro parsley basil mint green"], ["🫚", "ginger", "root spice"], ["🥜", "peanuts", "nuts snack legume"], ["🌰", "chestnut", "nuts"], ["🫘", "beans", "legume lentils chickpeas dal pulses kidney"], ["🥗", "salad", "green bowl vegetable"], ["🫒", "olive", "oil green"], ["🥥", "coconut", "fruit milk tropical"],
  ["🍎", "apple", "fruit red"], ["🍏", "green apple", "fruit"], ["🍐", "pear", "fruit"], ["🍊", "orange", "fruit citrus tangerine mandarin"], ["🍋", "lemon", "fruit citrus sour lime"], ["🍌", "banana", "fruit"], ["🍉", "watermelon", "fruit melon summer"], ["🍇", "grapes", "fruit vine"],
  ["🍓", "strawberry", "fruit berry berries"], ["🫐", "blueberries", "fruit berry berries"], ["🍒", "cherries", "fruit cherry"], ["🍑", "peach", "fruit stone"], ["🥭", "mango", "fruit tropical"], ["🍍", "pineapple", "fruit tropical"], ["🥝", "kiwi", "fruit green"], ["🍈", "melon", "fruit"],
  ["🍞", "bread", "loaf toast bakery roti"], ["🥖", "baguette", "bread french bakery"], ["🥐", "croissant", "bakery pastry breakfast"], ["🫓", "flatbread", "naan roti chapati pita wrap tortilla"], ["🥯", "bagel", "bread bakery"], ["🥞", "pancakes", "breakfast batter"], ["🧇", "waffle", "breakfast"], ["🥨", "pretzel", "snack bakery"],
  ["🍚", "rice", "grain cooked bowl basmati"], ["🍙", "rice ball", "onigiri sushi"], ["🍝", "pasta", "spaghetti noodles italian"], ["🍜", "noodles", "ramen soup bowl"], ["🌾", "grain", "wheat flour oats dry goods cereal"], ["🥣", "cereal bowl", "oats porridge breakfast muesli"], ["🥡", "takeaway", "leftovers box noodles"], ["🍲", "stew pot", "curry soup casserole leftovers"],
  ["🥩", "steak", "meat beef red protein cut"], ["🍗", "chicken leg", "poultry meat drumstick protein"], ["🍖", "meat on bone", "ribs lamb protein"], ["🥓", "bacon", "pork meat breakfast"], ["🌭", "sausage", "hot dog meat"], ["🍔", "burger", "hamburger fast food"], ["🍕", "pizza", "slice italian"], ["🥪", "sandwich", "lunch bread"],
  ["🌮", "taco", "mexican wrap"], ["🌯", "burrito", "wrap mexican"], ["🧆", "falafel", "chickpea ball"], ["🥘", "paella pan", "curry dish stew shallow"], ["🍛", "curry rice", "dal curry plate"], ["🥟", "dumpling", "gyoza momo samosa"], ["🍤", "prawn", "shrimp seafood fried"], ["🦐", "shrimp", "prawn seafood"],
  ["🐟", "fish", "seafood protein"], ["🍣", "sushi", "fish rice japanese"], ["🦀", "crab", "seafood shellfish"], ["🦞", "lobster", "seafood shellfish"], ["🦑", "squid", "calamari seafood"], ["🐙", "octopus", "seafood"], ["🦪", "oyster", "seafood shellfish"], ["🍢", "skewer", "kebab oden"],
  ["🧂", "salt", "seasoning spice shaker pepper"], ["🍯", "honey", "jar sweet sticky syrup"], ["🫙", "jar", "jam pickle preserve pantry spice container"], ["🥫", "tin", "can canned tomatoes beans tinned"], ["🍬", "sweets", "candy lolly"], ["🍫", "chocolate", "bar sweet snack"], ["🍪", "biscuit", "cookie snack"], ["🍰", "cake", "slice dessert sweet"],
  ["🧁", "cupcake", "baking dessert muffin"], ["🍩", "doughnut", "donut dessert"], ["🥧", "pie", "pastry dessert"], ["🍿", "popcorn", "snack corn"], ["🍘", "rice cracker", "snack"], ["🥠", "fortune cookie", "snack"], ["🍮", "custard", "pudding dessert flan"], ["🍡", "dango", "sweet dessert"],
  ["☕", "coffee", "hot drink beans"], ["🫖", "teapot", "tea hot drink"], ["🍵", "green tea", "tea cup matcha"], ["🧃", "juice box", "drink juice"], ["🥤", "soft drink", "soda cup straw cola"], ["🧋", "bubble tea", "boba drink"], ["🍺", "beer", "drink alcohol"], ["🍷", "wine", "drink alcohol glass"],
  ["🥂", "sparkling", "drink champagne glasses"], ["🍶", "sake", "drink bottle"], ["🍾", "bottle", "drink fizz"], ["💧", "water", "drink drop"], ["🧊", "ice", "frozen cube freezer"], ["🥶", "frozen", "freezer cold"],
  ["🍽️", "plate", "meal dinner dish"], ["🥄", "spoon", "cutlery"], ["🍴", "fork and knife", "cutlery meal"], ["🔪", "knife", "kitchen cutting"], ["🧽", "sponge", "cleaning kitchen washing"], ["🧴", "bottle (soap)", "cleaning dish soap lotion"], ["🧻", "paper towel", "kitchen roll tissue"], ["🛒", "shopping", "groceries cart trolley"]
];
function find(ch) { for (var i = 0; i < LIST.length; i++) if (LIST[i][0] === ch) return LIST[i]; return null; }
function load() {
  if (mem) return mem;
  var r = null; try { r = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (!Array.isArray(r) || !r.length) { r = []; IEF.items.forEach(function (i) { if (i.emoji && r.indexOf(i.emoji) < 0 && r.length < 6) r.push(i.emoji); }); }
  mem = r; return mem;
}
IEF.emoji = {
  list: LIST,
  /* the recent emoji as list entries (an emoji that is not in the list is left out) */
  recent: function () { return load().map(find).filter(Boolean).slice(0, 8); },
  push: function (ch) { var r = load().filter(function (x) { return x !== ch; }); r.unshift(ch); mem = r.slice(0, 8); try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
};
})();
