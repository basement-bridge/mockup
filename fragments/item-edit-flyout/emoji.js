/* The emoji picker (Edit, Add and the item flyout's header tile): its list of emoji and its code. Fetched the first time any picker opens, never on page load (DESIGN.md section 6). No size rules here.
   One picker, two homes (decision 106): "edit" is the tile in the edit form (#ef-emo, picker #ef-emojis); "sheet" is the tile in the item flyout's header (#ief-emo, picker #ief-emojis). Both draw the same markup (.ef-ep) and save through their own host: IEF.form.saveEmoji or IEF.saveEmoji.
   Each entry is [emoji, name, search words]. The name is the accessible label; the words are what the search matches, with the name. About 130 foods, drinks and kitchen things, with a few source animals beside the meat (cow, pig, chicken, sheep, duck, turkey, goat; decision 114) so "beef" can wear a cow: not the whole emoji set (no photos, no flags, no faces).
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
  ["🐄", "cow", "beef cattle veal meat protein"], ["🐖", "pig", "pork ham meat protein"], ["🐔", "chicken", "poultry hen chook meat protein"], ["🐑", "sheep", "lamb mutton meat protein"], ["🦆", "duck", "poultry meat protein"], ["🦃", "turkey", "poultry meat protein"], ["🐐", "goat", "mutton chevon meat protein"],
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

var $ = IEF.$, esc = IEF.esc, sv = IEF.sv, IC = IEF.IC;
var K = { edit: { box: "#ef-emojis", tile: "#ef-emo", on: false }, sheet: { box: "#ief-emojis", tile: "#ief-emo", on: false } };
function kindOf(el) { var b = el && el.closest && el.closest(".ef-ep"); return b ? (b.id === "ief-emojis" ? "sheet" : "edit") : null; }
function curEmoji(kind) { var it = kind === "sheet" ? IEF.cur() : IEF.target(); return it ? it.emoji : ""; }
function eb(e, cur) { return '<button type="button" class="ef-e' + (e[0] === cur ? " on" : "") + '" data-ef="setemoji" data-e="' + e[0] + '" aria-label="' + esc(e[1]) + '" title="' + esc(e[1]) + '" aria-pressed="' + (e[0] === cur) + '">' + e[0] + "</button>"; }
function fillGrid(kind, q) {
  var p = $(K[kind].box); if (!p) return;
  var words = q.toLowerCase().split(/\s+/).filter(Boolean), cur = curEmoji(kind);
  var hit = LIST.filter(function (e) { var h = (e[1] + " " + e[2]).toLowerCase(); return words.every(function (w) { return h.indexOf(w) > -1; }); });
  var rec = p.querySelector(".ef-epr"), g = p.querySelector(".ef-epa .ef-eg"), n = p.querySelector(".ef-epn"), t = p.querySelector(".ef-ept"), r = words.length ? [] : IEF.emoji.recent();
  rec.hidden = !r.length; rec.innerHTML = r.length ? '<span class="ef-l">Recent</span><div class="ef-eg" role="group" aria-label="Recent emoji">' + r.map(function (e) { return eb(e, cur); }).join("") + "</div>" : "";
  g.innerHTML = hit.map(function (e) { return eb(e, cur); }).join(""); n.hidden = hit.length > 0; t.textContent = words.length ? (hit.length ? "Matches" : "") : "Foods and kitchen";
}
function draw(kind) {
  var p = $(K[kind].box); if (!p) return;
  p.innerHTML = '<label class="ef-eps">' + sv(IC.search, "", 18) + '<span class="sr-only">Search emoji</span><input type="search" class="ef-epi" data-epi placeholder="Search, e.g. cheese or herb" autocomplete="off" autocapitalize="none" enterkeyhint="search"></label>'
    + '<div class="ef-epr" hidden></div><div class="ef-epa"><span class="ef-l ef-ept">Foods and kitchen</span><div class="ef-eg" role="group" aria-label="Emoji"></div><p class="ef-note ef-epn" hidden>No emoji matches. Try another word.</p></div>'
    + (curEmoji(kind) ? '<button type="button" class="ef-eno" data-ef="setemoji" data-e="">No emoji</button>' : "");
  fillGrid(kind, "");
}
/* open or close one picker; on omitted, toggle. The sheet's picker takes the place of its tiles and buttons (data-emoji on the panel). */
function open(kind, on) {
  var k = K[kind], p = $(k.box), t = $(k.tile); if (!p || !t) return;
  if (on === undefined) on = p.hidden;
  k.on = on; t.setAttribute("aria-expanded", on);
  if (kind === "sheet") { IEF.sheetEmo = on; var pn = $("#ief-panel"); if (pn) { if (on) pn.setAttribute("data-emoji", "1"); else pn.removeAttribute("data-emoji"); } }
  if (!on) { p.hidden = true; return; }
  p.hidden = false; draw(kind);
  /* a keyboard user lands in the search box; on a phone it is not focused, so the on-screen keyboard does not cover the grid */
  var s = $(k.box + " [data-epi]"); if (s && IEF.host.keys) s.focus({ preventScroll: true });
  if (kind === "edit") p.scrollIntoView({ block: "nearest", behavior: "auto" });
}
function pick(kind, e) {
  var ok = kind === "sheet" ? IEF.saveEmoji(e) : IEF.form.saveEmoji(e);
  if (ok) { if (e) IEF.emoji.push(e); open(kind, false); var t = $(K[kind].tile); if (t) t.focus({ preventScroll: true }); }
}
/* arrows move through the recent row and the grid; up from the first row goes back to the search box */
function nav(e, kind) {
  var t = e.target, all = Array.prototype.slice.call(document.querySelectorAll(K[kind].box + " .ef-e")), i = all.indexOf(t); if (i < 0) return;
  var k = e.key, to = null;
  if (k === "ArrowRight") to = all[i + 1]; else if (k === "ArrowLeft") to = all[i - 1];
  else if (k === "ArrowDown" || k === "ArrowUp") {
    var r = t.getBoundingClientRect(), cx = r.left + r.width / 2, best = 1e9;
    all.forEach(function (b) { var q = b.getBoundingClientRect(), dy = k === "ArrowDown" ? q.top - r.top : r.top - q.top; if (dy > 4) { var d = dy * 1000 + Math.abs(q.left + q.width / 2 - cx); if (d < best) { best = d; to = b; } } });
    if (!to && k === "ArrowUp") to = $(K[kind].box + " [data-epi]");
  } else return;
  e.preventDefault(); if (to) to.focus();
}
document.addEventListener("click", function (e) { var el = e.target.closest && e.target.closest('[data-ef="setemoji"]'); if (!el) return; var kind = kindOf(el); if (kind) pick(kind, el.dataset.e); });
document.addEventListener("input", function (e) { var s = e.target.closest && e.target.closest("[data-epi]"); if (s) fillGrid(kindOf(s) || "edit", s.value); });
/* Esc closes an open picker first and goes no further (the phone's Esc would close the sheet, and a box's Esc would leave it) */
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  var kind = K.sheet.on ? "sheet" : K.edit.on ? "edit" : null; if (!kind) return;
  var p = $(K[kind].box); if (!p || p.hidden) return;
  e.preventDefault(); e.stopPropagation(); open(kind, false); var t = $(K[kind].tile); if (t) t.focus({ preventScroll: true });
}, true);
document.addEventListener("keydown", function (e) {
  var t = e.target, kind = kindOf(t); if (!kind) return;
  if (t.matches("[data-epi]")) {
    if (e.key === "ArrowDown") { e.preventDefault(); var f1 = $(K[kind].box + " .ef-epr:not([hidden]) .ef-e, " + K[kind].box + " .ef-eg .ef-e"); if (f1) f1.focus(); }
    else if (e.key === "Enter") { e.preventDefault(); var first = $(K[kind].box + " .ef-epa .ef-e"); if (first) pick(kind, first.dataset.e); }
    return;
  }
  if (t.matches(".ef-e") && /^Arrow/.test(e.key)) nav(e, kind);
});
IEF.emoji = {
  list: LIST, open: open, toggle: function (kind) { open(kind); },
  isOpen: function (kind) { return K[kind].on; }, reset: function (kind) { K[kind].on = false; },
  /* the recent emoji as list entries (an emoji that is not in the list is left out) */
  recent: function () { return load().map(find).filter(Boolean).slice(0, 8); },
  push: function (ch) { var r = load().filter(function (x) { return x !== ch; }); r.unshift(ch); mem = r.slice(0, 8); try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
};
})();
