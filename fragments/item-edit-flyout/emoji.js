/* The emoji field (owner, by voice 12 Oct 2026, decisions 116 to 119; replaces the picker of 80, 93, 106, 107 and 115): a plain text box with the ONE suggestion strip under it, the same strip as
   Location, Spot and Category (108 to 110: .ef-cats.ef-strip, .ef-chip, .hl, .add). No dropdown, popup, panel or modal. Fetched the first time the tile is tapped, never on page load (DESIGN.md section 6). No size rules here.
   Two homes share this code: "edit" is the box in the Edit and Add form (#ef-emoin, strip #sg-emo, wrapper #ef-emof, tile #ef-emo), saved through IEF.form.saveEmoji; "sheet" is the box the item flyout's header tile shows
   (#ief-emoin, strip #ief-sg-emo, wrapper #ief-emof, tile #ief-emo), saved through IEF.saveEmoji.
   THE TILE IS THE FIELD (decisions 129 to 131, owner by voice and text 12 Oct 2026, after the phone screenshot with a text box under the name while an emoji was set). The emoji is only ever the tappable tile
   (the emoji, or the neutral "+" tile when none): no text box, no strip, in every state of Add, Edit, the standalone edit and the item sheet. Tapping the tile reveals the box and the strip and focuses it
   (an emoji already set is selected, so typing replaces it; a neutral tile opens the same box and strip). The box STAYS open while the person works: clearing it leaves "no emoji" (kept when they leave it or press Enter, 118)
   and the box does not close. It collapses back to the tile when: a pill is chosen; an emoji is typed or pasted (kept at once); Enter; Esc (cancels: the box goes back to what was saved); or the box loses focus (blur keeps a valid emoji,
   or an empty box as "no emoji", and drops words that are no emoji). Blur is also how the phone's keyboard-dismiss lands, so dismissing the keyboard never loses a valid emoji.
   Rules inside the open box (116): an empty box shows one row with one or two pills (Recent, which starts from the household's own emoji) and the chevron for the rest. Typing filters the curated list by name and keyword and
   highlights the best match; any emoji typed or pasted from the device is always accepted (one is kept: the newest one, the first that is not the item's emoji now) and is offered as the outlined first pill. A box holding only an
   emoji saves at once. Words that are not an emoji and were not picked go back to what was there. Shift+Enter is left to the Add form.
   Input hints (decision 132; the research is in docs/knowledge/jobs-to-be-done/item-edit-flyout.md): no web attribute selects the emoji panel, so the box carries only the harmless ones, the same in Kitchie:
   autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="off" enterkeyhint="done", the Search, or type or paste your own emoji placeholder.
   Each entry is [emoji, name, search words]. The name is the accessible label; the words are what the search matches, with the name. 133 foods, drinks, source animals (decision 114) and kitchen things.
   "Recent" is the last 8 the person picked on this device (localStorage, best effort: a private window just has none); with nothing picked yet it starts from the household's own emoji. Sample data only. */
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
/* ---------- reading what was typed: the emoji in it and the words beside them ---------- */
var PICT = /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u;
function graphemes(q) {
  try { if (window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(q), function (x) { return x.segment; }); } catch (e) {}
  return q.match(/(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)|[\s\S]/gu) || [];
}
function isEmoji(g) { return PICT.test(g) && !/^[0-9#*]/.test(g); }
/* { emoji: the one emoji to keep ("" when none), words: the search words } */
function read(q, cur) {
  var all = graphemes(String(q)), es = all.filter(isEmoji), rest = all.filter(function (g) { return !PICT.test(g); }).join("");
  var keep = es.filter(function (g) { return g !== cur; })[0] || es[0] || "";
  return { emoji: keep, words: rest.toLowerCase().split(/\s+/).filter(Boolean) };
}
function load() {
  if (mem) return mem;
  var r = null; try { r = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (!Array.isArray(r) || !r.length) { r = []; IEF.items.forEach(function (i) { if (i.emoji && r.indexOf(i.emoji) < 0 && r.length < 6) r.push(i.emoji); }); }
  mem = r; return mem;
}
function recent() { return load().map(function (ch) { return find(ch) || [ch, "your emoji", ""]; }).slice(0, 8); }
function push(ch) { var r = load().filter(function (x) { return x !== ch; }); r.unshift(ch); mem = r.slice(0, 8); try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }

/* the pills for a box: [{kind: "free" | "opt", e: entry}], the highlighted one and how many list entries matched (the chevron shows when more than two) */
function model(q, cur) {
  var items = [];
  if (!String(q).trim()) {
    var seen = {}, rec = recent();
    rec.concat(LIST).forEach(function (e) { if (!seen[e[0]]) { seen[e[0]] = 1; items.push({ kind: "opt", e: e, glyph: true }); } });
    return { items: items, hl: -1, nopt: items.length, words: [] };
  }
  var r = read(q, cur);
  if (r.emoji) items.push({ kind: "free", e: find(r.emoji) || [r.emoji, "your emoji", ""] });
  var opts = [];
  if (r.words.length) {
    /* every word must be in the name or the search words; the best match first: the name itself, a name that starts with it, a word that starts with it, then anything that contains it */
    var w0 = r.words.join(" ");
    var rank = function (e) { var n = e[1].toLowerCase(), all = (n + " " + e[2]).split(/\s+/); return n === w0 ? 0 : n.indexOf(w0) === 0 ? 1 : all.some(function (x) { return x.indexOf(r.words[0]) === 0; }) ? 2 : 3; };
    opts = LIST.filter(function (e) { var h = (e[1] + " " + e[2]).toLowerCase(); return r.words.every(function (w) { return h.indexOf(w) > -1; }); })
      .map(function (e, n) { return { e: e, n: n }; }).sort(function (a, b) { return rank(a.e) - rank(b.e) || a.n - b.n; }).map(function (x) { return x.e; });
  }
  opts.forEach(function (e) { if (!r.emoji || e[0] !== r.emoji) items.push({ kind: "opt", e: e }); });
  return { items: items, hl: items.length ? 0 : -1, nopt: opts.length, words: r.words, own: r.emoji };
}

/* ---------- one field: its box, its strip and its tile ---------- */
var $ = IEF.$, esc = IEF.esc, sv = IEF.sv, IC = IEF.IC;
var K = {
  edit: { box: "#ef-emoin", strip: "#sg-emo", tile: "#ef-emo", wrap: "#ef-emof", flag: "efEmo", cur: function () { var it = IEF.target(); return it ? it.emoji || "" : ""; }, save: function (e) { return IEF.form.saveEmoji(e); } },
  sheet: { box: "#ief-emoin", strip: "#ief-sg-emo", tile: "#ief-emo", wrap: "#ief-emof", flag: "sheetEmo", cur: function () { var it = IEF.cur(); return it ? it.emoji || "" : ""; }, save: function (e) { return IEF.saveEmoji(e); } }
};
var ST = {};
function st(k) { return ST[k] || (ST[k] = { typed: false, off: false, open: false, hl: -1, items: [] }); }
function kindOf(el) { return el && el.matches && el.matches("[data-emo]") ? el.dataset.emo : null; }
/* the strip is drawn while the field is open (its box is shown) and Esc has not closed it */
function isOn(k) { return !!IEF[K[k].flag]; }
function visible(k) { var i = $(K[k].box), s = st(k); return !!i && isOn(k) && !s.off; }
function hide(k) {
  var box = $(K[k].strip), i = $(K[k].box), s = st(k); s.hl = -1; s.items = [];
  if (box) { box.hidden = true; box.innerHTML = ""; }
  if (i) { i.setAttribute("aria-expanded", "false"); i.removeAttribute("aria-activedescendant"); }
}
function draw(k, keep) {
  var box = $(K[k].strip), i = $(K[k].box); if (!box || !i) return;
  var s = st(k); if (!visible(k)) { hide(k); return; }
  var m = model(s.typed ? i.value : "", K[k].cur());
  s.items = m.items; s.hl = keep ? s.hl : (s.typed ? m.hl : -1); if (s.hl > m.items.length - 1) s.hl = -1;
  var shown = 0, html = "", cur = K[k].cur();
  m.items.forEach(function (x, n) {
    if (x.kind === "opt") { shown++; if (!s.open && shown > 2 && n !== s.hl) return; }
    var on = n === s.hl, mine = x.kind === "free";
    html += '<button type="button" class="ef-chip ef-che' + (x.glyph ? " only" : "") + (mine ? " add" : "") + (on ? " hl" : "") + (x.e[0] === cur ? " on" : "") + '" role="option" id="' + K[k].strip.slice(1) + "-" + n + '" tabindex="-1" aria-selected="' + on + '" data-ef="emopick" data-i="' + n + '" aria-label="' + esc(mine ? "Use " + x.e[0] + ", your own emoji" : x.e[1]) + '" title="' + esc(mine ? "Your own emoji" : x.e[1]) + '"><span class="che" aria-hidden="true">' + x.e[0] + "</span>" + (x.glyph ? "" : esc(mine ? "Use this" : x.e[1])) + "</button>";
  });
  if (!m.items.length) html = '<span class="ef-sgn">No emoji matches. Type or paste your own.</span>';
  box.innerHTML = '<span class="ef-ct" aria-hidden="true">' + sv(IC.smile, "", 20) + '</span><div class="ef-cl" role="listbox" aria-label="Emoji suggestions">' + html + '</div><button type="button" class="ef-cx" data-ef="emomore" aria-expanded="' + s.open + '" aria-label="' + (s.open ? "Show fewer emoji" : "Show all emoji") + '" tabindex="-1"' + (m.nopt > 2 || s.open ? "" : " hidden") + ">" + sv(IC.chevd, "", 18) + "</button>";
  box.dataset.open = s.open; box.dataset.n = m.nopt; box.hidden = false; box.classList.toggle("more", m.nopt > 2 || s.open);
  i.setAttribute("aria-expanded", "true");
  if (s.hl >= 0) i.setAttribute("aria-activedescendant", K[k].strip.slice(1) + "-" + s.hl); else i.removeAttribute("aria-activedescendant");
}
function mark(k, n) {
  var s = st(k); if (!s.items.length) return;
  if (n >= 0 && s.items[n] && s.items[n].kind === "opt" && !s.open) { var c = 0; for (var j = 0; j <= n; j++) if (s.items[j].kind === "opt") c++; if (c > 2) s.open = true; }
  s.hl = n; draw(k, true);
}
/* save v ("" = no emoji); the box shows what is kept */
function commit(k, v, quiet) {
  var i = $(K[k].box), s = st(k), cur = K[k].cur(); s.typed = false; s.open = false; s.off = false;
  if (i) i.value = v;
  if (v === cur) { if (!quiet) draw(k); return true; }
  var ok = K[k].save(v);
  if (ok && v) push(v);
  if (!ok && i) i.value = cur;
  if (!quiet) draw(k); return ok;
}
/* what leaving the box (or Enter with nothing highlighted) keeps: an emoji in it, nothing when it is empty, else what was there */
function settle(k, quiet) {
  var i = $(K[k].box); if (!i) return;
  var r = read(i.value, K[k].cur());
  if (!i.value.trim()) commit(k, "", quiet); else if (r.emoji) commit(k, r.emoji, quiet); else { i.value = K[k].cur(); st(k).typed = false; if (!quiet) draw(k); }
}
function choose(k, x) { if (x) commit(k, x.e[0]); }

/* open or put away a field's box. Open: the box and the strip show and the box is focused (what is set is selected). Away: only the tile shows; focus goes back to the tile when the box had it. */
function show(k, on) {
  var c = K[k], w = $(c.wrap), t = $(c.tile), i = $(c.box); if (!w || !i) return;
  /* the first tap opens and focuses the box before this code has arrived (flyout.js / form.js: IEF.emoNow, so a phone raises its keyboard inside the tap); what was typed in the meantime is kept */
  var early = on && !!IEF[c.flag] && !w.hidden, v0 = i.value;
  IEF[c.flag] = on; var s = st(k); s.typed = false; s.off = false; s.open = false;
  if (on) {
    w.hidden = false; if (t) t.setAttribute("aria-expanded", "true");
    if (early && v0 !== c.cur()) s.typed = true; else i.value = c.cur();
    draw(k);
    /* on a phone the keyboard rises over the lower half: keep the box in view (and the sheet above the keyboard: phone.js) */
    try { w.scrollIntoView({ block: "nearest", behavior: "auto" }); } catch (e) {}
    if (document.activeElement !== i) i.focus({ preventScroll: true });
    if (!s.typed) { try { i.select(); } catch (e) {} }
    return;
  }
  hide(k);
  if (document.activeElement === i && t) t.focus({ preventScroll: true });
  w.hidden = true; if (t) t.setAttribute("aria-expanded", "false");
}
/* a pill, Enter or a typed emoji has been kept: back to the tile */
function away(k) { show(k, false); }

document.addEventListener("pointerdown", function (e) { if (e.target.closest && e.target.closest("#sg-emo, #ief-sg-emo")) e.preventDefault(); });
document.addEventListener("click", function (e) {
  var el = e.target.closest && e.target.closest('[data-ef="emopick"], [data-ef="emomore"]'); if (!el) return;
  var k = el.closest("#ief-sg-emo") ? "sheet" : "edit";
  if (el.dataset.ef === "emomore") { st(k).open = !st(k).open; draw(k, true); return; }
  choose(k, st(k).items[+el.dataset.i]); away(k);
});
document.addEventListener("focusin", function (e) { var k = kindOf(e.target); if (!k) return; var s = st(k); s.off = false; s.hl = -1; draw(k); try { e.target.select(); } catch (x) {} });
/* leaving the box keeps what it holds at once, but the strip and the box go away (back to the tile) only after the tap that took the focus has landed: hiding a row first would move what is under the finger */
var pressed = false;
document.addEventListener("pointerdown", function () { pressed = true; }, true);
document.addEventListener("pointerup", function () { setTimeout(function () { pressed = false; }, 0); }, true);
document.addEventListener("pointercancel", function () { pressed = false; }, true);
document.addEventListener("focusout", function (e) {
  var k = kindOf(e.target); if (!k) return;
  settle(k, true); st(k).open = false;
  var tidy = function () { var i = $(K[k].box); if (i && document.activeElement === i) return; if (isOn(k)) away(k); else draw(k); };
  if (!pressed) { setTimeout(tidy, 0); return; }
  var done = false, once = function () { if (done) return; done = true; document.removeEventListener("click", once); setTimeout(tidy, 0); };
  document.addEventListener("click", once); setTimeout(once, 600);
});
document.addEventListener("input", function (e) {
  var k = kindOf(e.target); if (!k) return;
  e.stopPropagation();
  var s = st(k), i = e.target, r = read(i.value, K[k].cur());
  s.typed = true; s.off = false; s.open = false;
  /* a box that holds only an emoji (typed on the device's keyboard or pasted) is kept at once */
  if (r.emoji && !r.words.length) { commit(k, r.emoji); away(k); return; }
  draw(k);
}, true);
/* Esc cancels: the box goes back to what was saved and only the tile shows. It goes no further (the phone's Esc would close the sheet). */
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  var k = kindOf(e.target); if (!k) return;
  e.preventDefault(); e.stopPropagation();
  var i = $(K[k].box); if (i) i.value = K[k].cur(); st(k).typed = false; away(k);
}, true);
document.addEventListener("keydown", function (e) {
  var k = kindOf(e.target); if (!k) return;
  var s = st(k);
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (!visible(k)) { s.typed = true; s.off = false; draw(k); }
    if (s.items.length) { e.preventDefault(); mark(k, s.hl < 0 ? (e.key === "ArrowDown" ? 0 : s.items.length - 1) : (s.hl + (e.key === "ArrowDown" ? 1 : -1) + s.items.length) % s.items.length); }
    return;
  }
  if (e.key !== "Enter") return;
  /* Shift+Enter belongs to the Add form ("Add and start another"): keep what the box holds, then let it through */
  if (e.shiftKey) { settle(k); return; }
  e.preventDefault(); e.stopImmediatePropagation();
  if (visible(k) && s.hl >= 0 && s.items[s.hl]) choose(k, s.items[s.hl]); else settle(k);
  away(k);
}, true);

IEF.emoji = {
  list: LIST, read: read, model: model, recent: recent, push: push,
  /* a tile tap: open the field's box and strip and focus it, or put it away (a second tap). k = "edit" (Edit and Add) or "sheet" (the item flyout's header). */
  toggle: function (k, on) { show(k, on === undefined ? !isOn(k) : on); },
  sheet: function (on) { show("sheet", on === undefined ? !IEF.sheetEmo : on); },
  isOpen: function () { return IEF.sheetEmo; }
};
})();
