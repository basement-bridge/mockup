/* Sample data for this mockup only (the repo is public: invented items, no real household). Names that exist only for the mockup live here, never in the stylesheets. */
window.HDP_DATA = {
  today: "Mon 12 Oct",
  items: [
    { id: "jalapeno", name: "Jalapeño peppers", emoji: "🌶️", qty: "1 jar", area: "Cabinet", spot: "Anywhere", level: "Some", days: 160, useLabel: "14 Mar", cat: "Condiments", unit: "jar", amount: 1, min: null, list: null },
    { id: "lime-juice", name: "Lime juice", emoji: "🧃", qty: "250 ml", area: "Fridge", spot: "Door", level: "Some", days: 40, useLabel: "21 Nov", cat: "Condiments", unit: "ml", amount: 250, min: 100, list: null },
    { id: "cucumbers", name: "Cucumbers", emoji: "🥒", qty: "2", area: "Fridge", spot: "Crisper", level: "Plenty", days: 1, useLabel: "13 Oct", cat: "Vegetables", unit: "", amount: 2, min: 1, counted: true, list: null, pill: "Tomorrow", hot: true },
    { id: "spring-onion", name: "Spring onion stalks", emoji: "🌱", qty: "1 bunch", area: "Fridge", spot: "Crisper", level: "Some", days: 1, useLabel: "13 Oct", cat: "Vegetables", unit: "bunch", amount: 1, min: null, list: null, pill: "Tomorrow", hot: true },
    { id: "bueno", name: "Bueno chocolate", emoji: "🍫", qty: "", area: "Cabinet", spot: "Snacks", level: "Out", days: null, useLabel: "", cat: "Snacks", unit: "bar", amount: 0, min: 1, list: null, pill: "Out" },
    { id: "peanut-butter", name: "Crunchy peanut butter", emoji: "🥜", qty: "1 jar", area: "Cabinet", spot: "Spreads", level: "Running low", days: 90, useLabel: "10 Jan", cat: "Spreads", unit: "jar", amount: 1, min: null, list: 0, pill: "Running low" },
    { id: "limes", name: "Limes", emoji: "🍋", qty: "1", area: "Fridge", spot: "Crisper", level: "Running low", days: 6, useLabel: "18 Oct", cat: "Fruit", unit: "", amount: 1, min: 3, counted: true, list: null, pill: "At or below minimum" }
  ],
  soon: ["cucumbers", "spring-onion"],
  low: ["bueno", "peanut-butter", "limes"],
  /* a recipe's lines: have = in stock, short = some in stock but not enough, miss = none. item = the pantry item it reads from (links to its panel) */
  ideas: [
    { id: "lime-tacos", name: "Lime chicken tacos", emoji: "🌮", mins: 25, serves: 4, why: "uses the limes and the jalapeños", lines: [
      { n: "Chicken thighs", need: "600 g", have: "800 g", s: "have" }, { n: "Limes", need: "2", have: "1", s: "short", item: "limes" }, { n: "Tortillas", need: "8", have: "10", s: "have" },
      { n: "Jalapeño peppers", need: "2 tbsp", have: "1 jar", s: "have", item: "jalapeno" }, { n: "Coriander", need: "1 bunch", have: "", s: "miss" }], uses: ["limes", "jalapeno"] },
    { id: "cuke-salad", name: "Cucumber and spring onion salad", emoji: "🥗", mins: 10, serves: 2, why: "uses the cucumbers and spring onions going off tomorrow", lines: [
      { n: "Cucumbers", need: "2", have: "2", s: "have", item: "cucumbers" }, { n: "Spring onion stalks", need: "3", have: "1 bunch", s: "have", item: "spring-onion" }, { n: "Lime juice", need: "1 tbsp", have: "250 ml", s: "have", item: "lime-juice" },
      { n: "Sesame oil", need: "1 tsp", have: "1 bottle", s: "have" }], uses: ["cucumbers", "spring-onion"] },
    { id: "cornbread", name: "Jalapeño cornbread", emoji: "🌽", mins: 40, serves: 6, why: "uses the jalapeños", lines: [
      { n: "Cornmeal", need: "200 g", have: "", s: "miss" }, { n: "Plain flour", need: "100 g", have: "1 kg", s: "have" }, { n: "Jalapeño peppers", need: "3 tbsp", have: "1 jar", s: "have", item: "jalapeno" },
      { n: "Eggs", need: "2", have: "6", s: "have" }, { n: "Milk", need: "250 ml", have: "1 L", s: "have" }], uses: ["jalapeno"] },
    { id: "peanut-noodles", name: "Peanut noodles", emoji: "🍜", mins: 15, serves: 2, why: "uses up the last of the peanut butter", lines: [
      { n: "Egg noodles", need: "200 g", have: "400 g", s: "have" }, { n: "Crunchy peanut butter", need: "3 tbsp", have: "1 jar, nearly done", s: "short", item: "peanut-butter" }, { n: "Lime juice", need: "1 tbsp", have: "250 ml", s: "have", item: "lime-juice" },
      { n: "Spring onion stalks", need: "2", have: "1 bunch", s: "have", item: "spring-onion" }, { n: "Soy sauce", need: "2 tbsp", have: "1 bottle", s: "have" }], uses: ["peanut-butter", "spring-onion"] }
  ],
  days: ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"],
  planned: { 0: "Cheesy barramundi", 2: "Not cooking", 4: "Egg fried rice" }
};
