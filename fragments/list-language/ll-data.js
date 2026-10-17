/* One list language, four visual systems (fragment). Sample data only: it lives in the mockup, never in a stylesheet.
   Pantry rows follow the owner's screenshot of Kitchie Pantry on a phone (Category view: Spices++, Veggies ...).
   days: use-by in days from today (negative = past use by). lvl: level-only items ("Level: plenty") have no number.
   upd: higher = added more recently. recent: added in the last 24 hours (the green up cue). */
window.LL_DATA = {
  me: "Arjan",
  badge: 3,
  catOrder: ["Spices++", "Veggies", "Condiments", "Dairy", "Dry goods"],
  locOrder: ["Fridge", "Pantry", "Spice bin", "Drawer", "Freezer"],
  pantry: [
    { id: "cumin", e: "", name: "Cumin seeds", amt: "100 g", spot: "Spice bin", cat: "Spices++", loc: "Pantry", days: null, upd: 3 },
    { id: "paprika", e: "🌶️", name: "Smoked paprika", amt: "1 bag", spot: "Drawer", cat: "Spices++", loc: "Pantry", days: null, upd: 15, recent: true },
    { id: "chilli", e: "", name: "Chilli flakes", amt: "Level: plenty", lvl: "plenty", spot: "Spice bin", cat: "Spices++", loc: "Pantry", days: null, upd: 4 },
    { id: "turmeric", e: "", name: "Turmeric", amt: "200 g, old", spot: "Spice bin", cat: "Spices++", loc: "Pantry", days: -1, upd: 1 },
    { id: "garam", e: "", name: "Garam masala", amt: "1 jar", lvl: "low", spot: "Spice rack", cat: "Spices++", loc: "Pantry", days: null, upd: 2, low: true },
    { id: "cardamom", e: "", name: "Cardamom pods", amt: "30 g", spot: "Spice bin", cat: "Spices++", loc: "Pantry", days: null, upd: 5 },
    { id: "spinach", e: "🥬", name: "Spinach", amt: "50 g", spot: "Crisper", cat: "Veggies", loc: "Fridge", days: 1, upd: 14, recent: true, low: true, lvl: "low" },
    { id: "mushrooms", e: "🍄", name: "Mushrooms", amt: "250 g", spot: "Crisper", cat: "Veggies", loc: "Fridge", days: 2, upd: 9 },
    { id: "carrots", e: "🥕", name: "Carrots", amt: "1 bag", spot: "Crisper", cat: "Veggies", loc: "Fridge", days: null, upd: 6 },
    { id: "onions", e: "🧅", name: "Onions", amt: "6", spot: "Baskets", cat: "Veggies", loc: "Pantry", days: null, upd: 7 },
    { id: "garlic", e: "", name: "Garlic", amt: "Level: some", lvl: "some", spot: "Baskets", cat: "Veggies", loc: "Pantry", days: null, upd: 8 },
    { id: "soy", e: "", name: "Soy sauce", amt: "1 bottle", spot: "Door", cat: "Condiments", loc: "Fridge", days: null, upd: 10 },
    { id: "tomatopaste", e: "", name: "Tomato paste", amt: "2 tubes", lvl: "low", spot: "Top shelf", cat: "Condiments", loc: "Pantry", days: null, upd: 11, low: true },
    { id: "milk", e: "🥛", name: "Milk", amt: "1 L", lvl: "low", spot: "Door", cat: "Dairy", loc: "Fridge", days: 0, upd: 12, low: true },
    { id: "paneer", e: "", name: "Paneer", amt: "50 g", lvl: "low", spot: "Top shelf", cat: "Dairy", loc: "Fridge", days: 3, upd: 13, low: true },
    { id: "yoghurt", e: "", name: "Greek yoghurt", amt: "500 g", spot: "Top shelf", cat: "Dairy", loc: "Fridge", days: 7, upd: 16 },
    { id: "rice", e: "🍚", name: "Basmati rice", amt: "5 kg", spot: "Bottom shelf", cat: "Dry goods", loc: "Pantry", days: null, upd: 17 },
    { id: "lentils", e: "", name: "Red lentils", amt: "1 kg", spot: "Bottom shelf", cat: "Dry goods", loc: "Pantry", days: null, upd: 18 }
  ],
  /* Recipes: miss = ingredients missing from the pantry; ban = has a banner (R-O1: a thumbnail only where there is one);
     last = days since cooked; ver = number of versions; star, freeze, batch, mine as in the Recipes chips. */
  recipes: [
    { id: "omelette", e: "🍳", name: "Spinach omelette", min: 10, serves: 2, last: 4, miss: 0, ban: true, star: true, ver: 1, mine: true },
    { id: "toastie", e: "🥪", name: "Cheese and onion toastie", min: 8, serves: 1, last: 12, miss: 0, ban: false, ver: 1 },
    { id: "friedrice", e: "🍚", name: "Egg fried rice", min: 20, serves: 3, last: 9, miss: 0, ban: true, ver: 2, mine: true },
    { id: "saag", e: "🥬", name: "Saag paneer", min: 35, serves: 4, last: 6, miss: 1, ban: true, star: true, ver: 3 },
    { id: "mushroom", e: "🍄", name: "Mushroom risotto", min: 45, serves: 4, last: 30, miss: 1, ban: false, ver: 1 },
    { id: "dal", e: "🫘", name: "Dal tadka", min: 40, serves: 6, last: 16, miss: 2, ban: true, star: true, ver: 2, batch: true, freeze: true },
    { id: "soup", e: "🍅", name: "Tomato soup", min: 30, serves: 6, last: 21, miss: 2, ban: false, ver: 1, batch: true, freeze: true },
    { id: "pancakes", e: "🥞", name: "Pancakes", min: 25, serves: 4, last: 40, miss: 3, ban: true, ver: 1, mine: true }
  ],
  /* Home (curated, may drift in layout): the three tiles of the household flow. */
  home: {
    out: ["turmeric", "spinach", "milk", "mushrooms"],
    low: ["milk", "tomatopaste", "garam"],
    idea: "omelette", alts: ["friedrice", "toastie"]
  }
};
