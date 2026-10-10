/* The Edit item form (and Add item, same fields). Fetched on the first Edit or Add, never on page load (DESIGN.md section 6). No size rules here.
   Every change autosaves with the short "Saved" line; there is no Save button. A failed save (?down=1) or a bad value shows an error on that field.
   One layout (confirmed by the owner, 11 Oct 2026, decision 71): one scroll in five groups. The two tabs (B) and the tiles (C) were dropped and their code removed; they are in the git history (mockup PR 72).
   Each field is built once (INNER) and the layout only arranges them.
   11 Oct 2026 round: Location, Spot and Category are the same text-input-with-suggestions controls as the Add form in Kitchie uat (a list opens on focus, type to filter or add a new one); Category's suggestions are drawn as the chip row (proposed).
   The emoji picker (search, recent, "No emoji") is the same for Edit and Add; its list of emoji is in emoji.js, fetched when the picker is first opened. Level is four battery icons, with an "Automatic" / "Set by you" cue (decisions 82 to 86, refined by 94 to 101).
   Round 3 (owner's voice answers of 11 Oct 2026, decisions 94 to 101): Category and Unit are a text box plus a row of quick-pick chips, free text for anything not in the list; a hand-set level goes back to automatic only when stock is added; with no minimum the level is Plenty until 0; the shopping amount starts at the top-up to twice the minimum. */
(function () {
"use strict";
var IEF = window.IEF, $ = IEF.$, esc = IEF.esc, sv = IEF.sv, IC = IEF.IC, S = IEF.S, F = IEF.form = {};
var counted = IEF.counted, level = IEF.level, qtyText = IEF.qtyText, round2 = IEF.round2;
var LABEL = { name: "Name", emoji: "Emoji", buy: "Shopping list", amount: "Quantity", unit: "Quantity", text: "Quantity", qclear: "Quantity", level: "Level", min: "Minimum", area: "Location", spot: "Spot", cat: "Category", useby: "Use by", shop: "Shopping list" };
var GROUP = { name: "name", emoji: "name", amount: "qty", unit: "qty", text: "qty", level: "level", min: "min", area: "area", spot: "spot", cat: "cat", useby: "useby", shop: "shop" };

function add() { return S.mode === "add"; }
function L(t) { return '<span class="ef-l">' + t + "</span>"; }
function err(k) { return '<p class="ef-err" data-err="' + k + '" role="alert" hidden></p>'; }
function wrap(id, inner) { return '<div class="ef-w" id="ef-s-' + id + '" data-field="' + id + '">' + inner + "</div>"; }
function stepBtn(d, label, ic, key) { return '<button type="button" data-ef="step" data-d="' + d + '" data-key="' + (key || "amount") + '" aria-label="' + label + '">' + sv(ic, "", 20) + "</button>"; }
function hasMin(it) { return !!(it.unit || it.min) || counted(it); }

/* ---------- the field builders: the inner of each field's wrapper, rebuilt on its own when something it depends on changes ---------- */
var emoOpen = false, catsOpen = false, unitsOpen = false;
function emoTile(it) {
  return '<button type="button" class="ef-emo" id="ef-emo" data-ef="emoji" aria-expanded="' + emoOpen + '" aria-controls="ef-emojis" aria-label="' + (it.emoji ? "Emoji " + it.emoji + ". Change it" : "Add an emoji") + '" title="' + (it.emoji ? "Change the emoji" : "Add an emoji") + '">' + (it.emoji ? it.emoji : sv(IC.plus, "", 22)) + "</button>";
}
/* a Location, Spot or Category box: a text input with a list of suggestions that opens on focus, filters as you type and takes a new word (the Add form in Kitchie uat: form.js combo) */
function combo(key, lab, val, ph) {
  return L(lab) + '<div class="combo-wrap"><input class="ef-in" data-f="' + key + '" data-cb="' + key + '" value="' + esc(val) + '" placeholder="' + ph + '" maxlength="60" autocomplete="off" autocapitalize="none" enterkeyhint="next" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="cb-' + key + '" aria-label="' + lab + '"><ul class="combo" id="cb-' + key + '" role="listbox" aria-label="' + lab + ' suggestions" hidden></ul></div>';
}
/* Category suggestions as the chip row of the Pantry's filter bar (tag icon, chips, a chevron that shows the rest). Confirmed by the owner 11 Oct 2026 (decision 91, extended by 97): the chips are quick picks and the text box takes anything not in the list. ?cat=list gives the plain list instead. */
function chipItems(it, q) {
  var qq = (q || "").toLowerCase().trim();
  var cur = String(it.cat).toLowerCase(), all = IEF.cats(); if (it.cat && all.map(function (c) { return c.toLowerCase(); }).indexOf(cur) < 0) all.push(it.cat);
  /* the chosen one leads, so it is always in the first line when the row is folded */
  return all.filter(function (c) { return !qq || c.toLowerCase().indexOf(qq) > -1; }).sort(function (a, b) { return (b.toLowerCase() === cur) - (a.toLowerCase() === cur); }).map(function (c) { var on = c.toLowerCase() === String(it.cat).toLowerCase(); return '<button type="button" class="ef-chip' + (on ? " on" : "") + '" data-ef="catchip" data-v="' + esc(c) + '" aria-pressed="' + on + '">' + esc(c) + "</button>"; }).join("");
}
/* Unit: the same pattern (decision 98). A short box that shows the unit, with the quick-pick chips under it (weight and volume, the count units, any unit already used, then "No unit"). Anything not in the list is typed; Enter or leaving the box keeps it, and it is offered as a chip from then on. */
function unitItems(it, q) {
  var qq = (q || "").toLowerCase().trim(), cur = String(it.unit).toLowerCase(), all = IEF.units();
  if (it.unit && all.map(function (c) { return c.toLowerCase(); }).indexOf(cur) < 0) all.push(it.unit);
  var ch = function (v, label, on) { return '<button type="button" class="ef-chip' + (on ? " on" : "") + '" data-ef="unitchip" data-v="' + esc(v) + '" aria-pressed="' + on + '">' + esc(label) + "</button>"; };
  var list = all.filter(function (c) { return !qq || c.toLowerCase().indexOf(qq) > -1; }).sort(function (a, b) { return (b.toLowerCase() === cur) - (a.toLowerCase() === cur); }).map(function (c) { return ch(c, c, c.toLowerCase() === cur); });
  var none = ch("", "No unit", cur === ""); if (!qq || "no unit".indexOf(qq) > -1) { if (cur === "") list.unshift(none); else list.push(none); }
  return list.join("");
}
/* a row of quick-pick chips, folded to one line with a chevron for the rest (the Pantry filter bar's pattern). kind = "cat" or "unit". */
function chipsRow(kind, icon, label, plural, chips, open) {
  return '<div class="ef-cats" data-kind="' + kind + '" data-open="' + open + '"><span class="ef-ct" aria-hidden="true">' + sv(icon, "", 20) + '</span><div class="ef-cl" role="group" aria-label="' + label + ' suggestions">' + chips + '</div><button type="button" class="ef-cx" data-ef="chipsmore" aria-expanded="' + open + '" aria-label="' + (open ? "Show fewer " : "Show all ") + plural + '" hidden>' + sv(IC.chevd, "", 18) + "</button></div>";
}
function chipRow(it) { return chipsRow("cat", IC.tag, "Category", "categories", chipItems(it, ""), catsOpen); }
/* Decision 99 (owner, 11 Oct 2026; supersedes 88's default): with a minimum, the target is TWICE the minimum and "how much to buy" starts at the DELTA to reach it (what you need to buy, which is what a "buy" stepper means; the target itself would read as the amount to buy on top of what you have). At or over the target there is nothing to top up, so it starts at one step.
   No minimum: the earlier fallback, what you have now (the amount, else the amount before it ran out, else 1). The level is never an input (decision 101): a hand-set level does not change this. */
function stepOf(it) { return counted(it) ? 1 : (IEF.STEP[it.unit] || 1); }
function target(it) { var m = minOf(it); return m > 0 ? round2(2 * m) : 0; }
function buyVal(it) {
  if (it.buy != null) return it.buy;
  var t = target(it); if (t > 0) { var d = round2(t - (it.amount > 0 ? it.amount : 0)); return d > 0 ? d : stepOf(it); }
  return it.amount > 0 ? it.amount : it.prev > 0 ? it.prev : 1;
}
function buyText(it) { return round2(buyVal(it)) + (it.unit ? " " + it.unit : ""); }
function buyNote(it) {
  var t = target(it), u = it.unit ? " " + esc(it.unit) : "";
  return (t > 0 ? (t > (it.amount > 0 ? it.amount : 0) ? "Starts at what tops you up to twice your minimum (" + t + u + ")." : "You already have twice your minimum, so it starts at one step.") : "Starts from what you have.") + " Clear the quantity above to say it in your own words.";
}
function lvCue(it) {
  var src = IEF.lvSource(it); if (!src) return "";
  return '<p class="ef-lvm">' + (src === "set"
    ? '<span class="ef-src set" title="You picked this. It goes back to automatic when you add stock.">Set by you</span><button type="button" class="ef-auto" data-ef="lvauto" aria-label="Go back to automatic" title="Go back to automatic">' + sv(IC.undo, "", 18) + "</button>"
    : '<span class="ef-src" title="' + (minOf(it) > 0 ? "Worked out from the amount and the minimum." : "Plenty while some is left, Out at zero.") + ' Pick one to set it yourself.">Automatic</span>') + "</p>";
}
function minOf(it) { return parseFloat(it.min) || 0; }
var INNER = {
  name: function (it) {
    return '<div class="ef-nrow">' + emoTile(it)
      + '<label class="ef-big"><span class="sr-only">Name</span><input data-f="name" value="' + esc(it.name) + '" maxlength="60" autocomplete="off" placeholder="What is it?"></label></div>'
      + '<div class="ef-ep" id="ef-emojis" role="group" aria-label="Pick an emoji" hidden></div>' + err("name");
  },
  qty: function (it) {
    if (it.amount === null) return L("Quantity") + '<div class="ef-row"><input class="ef-in" data-f="text" value="' + esc(it.text) + '" placeholder="In your own words, e.g. a handful" autocomplete="off" aria-label="Quantity"><button type="button" class="btn ghost sm" data-ef="addunit">Add unit</button></div>' + err("qty");
    return '<div class="ef-lh">' + L("Quantity") + '<button type="button" class="ef-clear" data-ef="qclear" title="No quantity. The shopping list can then take your own words.">Clear</button></div><div class="ef-row"><div class="ef-step" role="group" aria-label="Quantity">' + stepBtn(-1, "Less", IC.minus) + '<input class="ef-num" data-f="amount" inputmode="decimal" value="' + round2(it.amount) + '" aria-label="Quantity" autocomplete="off">' + stepBtn(1, "More", IC.plus) + "</div>"
      + '<input class="ef-in ef-unitin" data-f="unit" data-cbq="unit" value="' + esc(it.unit) + '" placeholder="Unit" maxlength="20" autocomplete="off" autocapitalize="none" enterkeyhint="done" aria-label="Unit"></div>'
      + chipsRow("unit", IC.ruler, "Unit", "units", unitItems(it, ""), unitsOpen) + '<p class="ef-note ef-newunit" hidden></p>' + err("qty");
  },
  /* Level (decisions 82 to 86): four icons for every item, the current level always picked, never a word on screen. Where rules can work it out (a counted item, or a number with a minimum) it is "Automatic" until you pick one ("Set by you"); a new quantity hands it back to the rules. */
  level: function (it) {
    var lv = level(it);
    return L("Level") + '<div class="opts lvpick" role="radiogroup" aria-label="Level">' + IEF.LEVELS.map(function (l) { return '<button type="button" class="opt' + (l === lv ? " on" : "") + '" role="radio" aria-checked="' + (l === lv) + '" data-ef="lvl" data-v="' + l + '">' + IEF.lvIcon(l, 28) + IEF.sr(l) + "</button>"; }).join("") + "</div>" + lvCue(it) + err("level");
  },
  min: function (it) {
    if (!hasMin(it)) return "";
    var u = it.unit ? " " + esc(it.unit) : "";
    return L("Minimum stock") + '<div class="ef-row"><div class="ef-step" role="group" aria-label="Minimum stock">' + stepBtn(-1, "Lower the minimum", IC.minus, "min") + '<input class="ef-num" data-f="min" inputmode="decimal" value="' + esc(it.min) + '" placeholder="None" aria-label="Minimum stock" autocomplete="off">' + stepBtn(1, "Raise the minimum", IC.plus, "min") + "</div>" + (it.unit ? '<span class="ef-unit">' + esc(it.unit) + "</span>" : "") + (it.min ? '<button type="button" class="ef-clear" data-ef="clearmin">Clear</button>' : "") + '</div><p class="ef-note">' + (it.min ? "Running low is at or under this. Plenty is over twice it." : "No minimum: the level is Plenty until it is gone. You can set Some or Running low yourself.") + "</p>" + err("min");
  },
  area: function (it) { return combo("area", "Location", it.area === "Unplaced" ? "" : it.area, "Pick or type") + err("area"); },
  spot: function (it) { return combo("spot", "Spot", it.spot, "Pick or type") + err("spot"); },
  cat: function (it) {
    if (S.cat === "list") return combo("cat", "Category", it.cat, "Optional") + err("cat");
    return L("Category") + '<input class="ef-in" data-f="cat" data-cbq="cat" value="' + esc(it.cat) + '" placeholder="Pick one, or type your own" maxlength="60" autocomplete="off" autocapitalize="none" enterkeyhint="done" aria-label="Category">' + chipRow(it) + '<p class="ef-note ef-newcat" hidden></p>' + err("cat");
  },
  /* Use by: the date in words with Clear, and the quick choices of the Add form in Kitchie uat (+3 days, +5 days, +1 week, Pick date...). Decision 92. */
  useby: function (it) {
    var d = IEF.daysTo(it.useby), q = [["+3 days", 3], ["+5 days", 5], ["+1 week", 7]];
    return L("Use by") + '<div class="ef-ubl"><output class="ef-ub' + (it.useby ? "" : " none") + '">' + (it.useby ? esc(IEF.dayName(it.useby)) + " · " + IEF.rel(d) : "Not set") + "</output>" + (it.useby ? '<button type="button" class="ef-clear" data-ef="clearuse">Clear</button>' : "") + "</div>"
      + '<div class="ef-sug" role="group" aria-label="Quick use-by choices">' + q.map(function (x) { var iso = IEF.isoIn(x[1]), on = it.useby === iso; return '<button type="button" class="pill' + (on ? " on" : "") + '" data-ef="useq" data-n="' + x[1] + '" aria-pressed="' + on + '">' + x[0] + "</button>"; }).join("")
      + '<button type="button" class="pill" data-ef="pickdate">Pick date\u2026</button></div>'
      + '<input type="date" class="ef-datein" data-f="useby" value="' + it.useby + '" min="' + IEF.todayIso + '" aria-label="Pick a use-by date" tabindex="-1">' + err("useby");
  },
  /* the Shopping list group (decisions 87 to 89): one heading, spaced and ruled off, once; a status line; how much to buy; the button.
     The item has a weighed or counted quantity: "how much to buy" is a number in the item's own unit, starting from what the household has, and the own-words box stays out of the way.
     The item has none (nothing, or words like "a big handful"): the own-words box is the way in. Clearing the quantity brings it back. */
  shop: function (it) {
    var on = it.list !== null, hasQ = it.amount !== null;
    var status = on ? '<p class="ef-onlist">' + sv(IC.tick, "", 16) + "<span>On the shopping list" + (it.list ? ": <b>" + esc(it.list) + "</b>" : "") + '.</span><button type="button" class="link" data-ef="openlist">Open the list</button></p>' : '<p class="ef-onlist off"><span>Not on the shopping list.</span></p>';
    var how = hasQ
      ? '<div class="ef-f2"><span class="ef-l">How much to buy</span><div class="ef-row"><div class="ef-step" role="group" aria-label="How much to buy">' + stepBtn(-1, "Buy less", IC.minus, "buy") + '<input class="ef-num" data-f="buy" inputmode="decimal" value="' + round2(buyVal(it)) + '" aria-label="How much to buy" autocomplete="off">' + stepBtn(1, "Buy more", IC.plus, "buy") + "</div>" + (it.unit ? '<span class="ef-unit">' + esc(it.unit) + "</span>" : "") + '</div><p class="ef-note">' + buyNote(it) + "</p></div>"
      : '<label class="ef-f2"><span class="ef-l">How much to buy (optional, in your own words)</span><input class="ef-in" data-f="shop" value="' + esc(it.list || "") + '" placeholder="1 kg, a packet, 3" autocomplete="off"></label>';
    return '<h3 class="ef-h">Shopping list</h3>' + status + how
      + '<button type="button" class="btn ' + (on ? "ghost" : "pri") + ' ef-shopb" data-ef="shopsave">' + sv(IC.cart, "", 20) + "<span>" + (on ? "Update the shopping list" : "Add to shopping list") + "</span></button>" + err("shop");
  }
};
function field(k, it) { var h = k === "shop" ? INNER.shop(it) : INNER[k](it); return k === "shop" ? '<div class="ef-w ef-shop" id="ef-s-shop" data-field="shop">' + h + "</div>" : wrap(k, h); }
function sec(h, body) { return '<section class="ef-sec">' + (h ? '<h3 class="ef-h">' + h + "</h3>" : "") + body + "</section>"; }
function recipe() {
  if (!S.recipes || add()) return "";
  /* the label and the target belong to the Recipe manifest; hidden when the household has no Recipes */
  return '<button type="button" class="ef-go" data-ef="recipe" data-from="recipe-manifest">' + sv(IC.pot, "", 22) + '<span class="ef-gol">Use in a recipe</span>' + sv(IC.chev, "", 18) + "</button>";
}

/* ---------- the layout: one scroll, five groups (Item, Amount, Where, Use by, Shopping list), then the recipe action ---------- */
function layout(it) {
  if (add()) return sec("Item", field("name", it)) + sec("Amount", field("qty", it) + field("min", it)) + sec("Where", field("area", it) + field("spot", it) + field("cat", it)) + sec(null, field("useby", it));
  return sec("Item", field("name", it)) + sec("Amount", field("qty", it) + field("level", it) + field("min", it)) + sec("Where", field("area", it) + field("spot", it) + field("cat", it)) + sec(null, field("useby", it)) + field("shop", it) + recipe();
}
F.fill = function (it) { var b = $("#ief-cbody"); if (!b) return; emoOpen = false; catsOpen = false; unitsOpen = false; b.innerHTML = '<div class="ef">' + layout(it) + "</div>"; var t = $("#ief-ctitle h2"); if (t) t.textContent = "Edit item"; fitCats(); };
F.fillAdd = function () {
  var b = $("#ief-cbody"), it = IEF.draft, k = IEF.host.keys ? IEF.host : null; emoOpen = false; catsOpen = false; unitsOpen = false;
  b.innerHTML = '<div class="ef" data-mode="add">' + layout(it) + "</div>";
  fitCats();
  $("#ief-cft").innerHTML = '<button type="button" class="btn pri" data-ef="addgo">Add item ' + IEF.kbd("enter", "keep") + '</button><button type="button" class="btn" data-ef="addmore">Add and start another ' + (k ? '<kbd class="kbd">&#8679; Enter</kbd>' : "") + '</button><button type="button" class="btn ghost" data-ief="addcancel">Cancel ' + (k ? '<kbd class="kbd">' + k.closeLabel + "</kbd>" : "") + "</button>";
};
F.nameError = function () { showErr("name", "A name is needed."); var i = $('[data-f="name"]'); if (i) i.focus(); };
F.refreshShop = function () { var it = IEF.cur(), w = $("#ef-s-shop"); if (w && it) w.innerHTML = INNER.shop(it); };

/* ---------- landing on a field (a tile in the item flyout was tapped, or ?field=) ---------- */
var FWRAP = { qty: "qty", level: "level", min: "min", useby: "useby", cat: "cat", name: "name", area: "area", spot: "spot", shop: "shop" };
var quiet = false;
F.focusField = function (k, inputs) {
  var it = IEF.target(); if (!it) return;
  quiet = true;
  if (!k) { if (inputs) { var n = $('.ef [data-f="name"]'); if (n) n.focus({ preventScroll: true }); } quiet = false; return; }
  var w = $("#ef-s-" + FWRAP[k]); if (!w) { quiet = false; return; }
  w.scrollIntoView({ block: "nearest", behavior: "auto" }); w.classList.remove("hl"); void w.offsetWidth; w.classList.add("hl");
  var c = inputs ? w.querySelector("input:not([type=date]),select") : w.querySelector("button.pill,button.opt,button");
  if (c) c.focus({ preventScroll: true });
  quiet = false;
};

/* ---------- saving ---------- */
function get(it, f) { return f === "shop" ? it.list : it[f]; }
function fmt(it, f) {
  if (f === "amount" || f === "unit" || f === "text" || f === "qclear") return qtyText(it) || "not set";
  if (f === "useby") return it.useby ? IEF.dayName(it.useby) : "not set";
  if (f === "level") return level(it);
  var v = get(it, f); return v === null || v === "" || v === undefined ? "not set" : String(v);
}
function showErr(g, msg, retry) {
  var e = $('[data-err="' + (GROUP[g] || g) + '"]'); if (!e) return;
  e.innerHTML = sv(IC.alert, "", 18) + "<span>" + esc(msg) + "</span>" + (retry ? '<button type="button" class="link" data-ef="retry">Try again</button>' : ""); e.hidden = false;
  var w = e.closest(".ef-w"); if (w) w.classList.add("bad");
}
function clearErr(g) { var e = $('[data-err="' + (GROUP[g] || g) + '"]'); if (e) { e.hidden = true; e.innerHTML = ""; var w = e.closest(".ef-w"); if (w) w.classList.remove("bad"); } }
function validate(f, v, it) {
  if (f === "name" && !String(v).trim() && !add()) return "A name is needed.";
  if ((f === "amount" || f === "min") && v !== "" && !(typeof v === "number" && v >= 0)) return f === "min" ? "Use a number, or clear it." : "Use a number from 0 up.";
  if (f === "useby" && v && IEF.daysTo(v) < 0) return "Pick today or later.";
  return "";
}
/* a typed word takes the household's own spelling when it matches one (the same folding Kitchie does for categories), else it is new */
function canon(list, v) { v = String(v).trim(); var m = list.filter(function (x) { return x.toLowerCase() === v.toLowerCase(); })[0]; return m || v; }
function apply(it, f, v) {
  var was = level(it);
  if (f === "name") it.name = String(v).trim() || it.name;
  else if (f === "amount") { var w0 = it.amount; it.amount = round2(v); if (it.amount === 0 && w0 > 0) it.prev = w0; IEF.qtyChanged(it, w0); }
  /* a unit change is not a restock: the pick stays (decision 96). A typed unit takes the household's own spelling when it matches one. */
  else if (f === "unit") it.unit = canon(IEF.units(), String(v).replace(/\s+/g, " "));
  else if (f === "qclear") { it.amount = null; it.text = ""; it.unit = ""; it.prev = null; it.buy = undefined; it.lvSet = null; }
  else if (f === "level") {
    /* a pick. Out is zero, always. Any other level brings back the amount from before it was Out, then is the person's: kept as the pick where rules can work the level out (until the quantity changes), or as the stored label where they cannot. */
    if (v === "Out") { if (it.amount !== null) { if (it.amount > 0) it.prev = it.amount; it.amount = 0; } else it.level = "Out"; }
    else { if (it.amount === 0 && it.prev) { it.amount = it.prev; it.prev = null; } if (IEF.auto(it)) it.lvSet = v; else it.level = v; }
  } else if (f === "min") it.min = v === "" ? "" : String(v);
  else if (f === "area") {
    var na = canon(IEF.AREAS, v) || "Unplaced";
    if (na !== it.area) { it.area = na; it.spot = ""; }
    if (na !== "Unplaced" && IEF.AREAS.indexOf(na) < 0) { IEF.AREAS.splice(IEF.AREAS.indexOf("Unplaced"), 0, na); IEF.SPOTS[na] = []; }
  } else if (f === "spot") {
    var sl = IEF.SPOTS[it.area] || []; it.spot = canon(sl, v);
    if (it.spot && it.area !== "Unplaced" && sl.indexOf(it.spot) < 0) { sl.push(it.spot); IEF.SPOTS[it.area] = sl; }
  } else if (f === "cat") it.cat = canon(IEF.cats(), v);
  else if (f === "shop") it.list = String(v);
  else it[f] = v;
  /* the level never jumps: when the quantity is cleared there are no rules to work it out, so what was showing is kept as the stored label */
  if (f === "qclear") it.level = was;
}
var lastTry = null;
function save(f, v) {
  var it = IEF.target(); if (!it) return false;
  var m = validate(f, v, it); if (m) { showErr(f, m); return false; }
  if (!add() && S.down) { lastTry = [f, v]; showErr(f, "Not saved. We can't reach the platform.", true); return false; }
  var before = fmt(it, f); apply(it, f, v); clearErr(f);
  if (!add()) { IEF.log(it, LABEL[f], before, fmt(it, f)); IEF.say("Saved"); IEF.syncParent(); }
  after(f, it); return true;
}
/* redraw only the wrappers a change touches; keep focus where the person was */
function redraw(ids, it) {
  ids.forEach(function (id) {
    var w = $("#ef-s-" + id); if (!w) return;
    var a = document.activeElement, fk = a && w.contains(a) ? (a.dataset.f ? '[data-f="' + a.dataset.f + '"]' : a.dataset.ef ? '[data-ef="' + a.dataset.ef + '"]' : "") : "";
    w.innerHTML = id === "shop" ? INNER.shop(it) : INNER[id](it);
    if (fk) { var n = id === "level" && fk.indexOf("lvl") > -1 ? w.querySelector('[aria-checked="true"]') : w.querySelector(fk); if (n) n.focus({ preventScroll: true }); }
  });
}
/* Location, Spot and Category are not rebuilt (a rebuild would drop a click that is on its way to the next box); their text and the chips are set in place */
function syncWhere(it) {
  [["area", it.area === "Unplaced" ? "" : it.area], ["spot", it.spot], ["cat", it.cat]].forEach(function (p) { var i = $('.ef [data-f="' + p[0] + '"]'); if (i && i.value !== p[1]) i.value = p[1]; });
  var cl = $("#ef-s-cat .ef-cl"); if (cl) { cl.innerHTML = chipItems(it, ""); fitCats(); var n = $(".ef-newcat"); if (n) n.hidden = true; }
}
/* the Unit box and its chips are set in place, like Category (a rebuild would drop a click on its way to the next box) */
function syncUnits(it) {
  var i = $('.ef [data-f="unit"]'); if (i && i.value !== it.unit) i.value = it.unit;
  var cl = $("#ef-s-qty .ef-cl"); if (cl) { cl.innerHTML = unitItems(it, ""); fitCats(); var n = $(".ef-newunit"); if (n) n.hidden = true; }
}
function refreshEmoji(it) { var t = $("#ef-emo"); if (t) t.outerHTML = emoTile(it); }
function after(f, it) {
  if (f === "amount") redraw(["level", "min", "shop"], it);
  else if (f === "min") redraw(["level", "min", "shop"], it);
  else if (f === "unit") { syncUnits(it); redraw(["level", "min", "shop"], it); }
  else if (f === "qclear") redraw(["qty", "level", "min", "shop"], it);
  else if (f === "level") redraw(["qty", "level", "shop"], it);
  else if (f === "area" || f === "spot" || f === "cat") syncWhere(it);
  else if (f === "useby") redraw([f], it);
  else if (f === "emoji") refreshEmoji(it);
}
function num(s) { s = String(s).trim().replace(",", "."); return s === "" ? "" : (isFinite(s) ? parseFloat(s) : NaN); }
function step(it, key, d) {
  var u = it.unit, st = counted(it) ? 1 : (IEF.STEP[u] || 1), cur = key === "min" ? (parseFloat(it.min) || 0) : key === "buy" ? buyVal(it) : (it.amount || 0), n = Math.max(0, round2(cur + d * st));
  if (key === "buy") { it.buy = n; var bi = $('[data-f="buy"]'); if (bi) bi.value = n; return; }
  save(key, key === "min" && n === 0 ? "" : n);
  var i = $('[data-f="' + key + '"]'); if (i) i.value = key === "min" && n === 0 ? "" : n;
}

/* ---------- the emoji picker (Edit and Add): the tile opens it; search, recent, a grid of foods, "No emoji". The emoji list is emoji.js, fetched the first time the picker opens. ---------- */
function eb(e, cur) { return '<button type="button" class="ef-e' + (e[0] === cur ? " on" : "") + '" data-ef="setemoji" data-e="' + e[0] + '" aria-label="' + esc(e[1]) + '" title="' + esc(e[1]) + '" aria-pressed="' + (e[0] === cur) + '">' + e[0] + "</button>"; }
function fillGrid(q) {
  var it = IEF.target(), p = $("#ef-emojis"); if (!p || !IEF.emoji) return;
  var E = IEF.emoji, words = q.toLowerCase().split(/\s+/).filter(Boolean), cur = it ? it.emoji : "";
  var hit = E.list.filter(function (e) { var h = (e[1] + " " + e[2]).toLowerCase(); return words.every(function (w) { return h.indexOf(w) > -1; }); });
  var rec = p.querySelector(".ef-epr"), g = p.querySelector(".ef-epa .ef-eg"), n = p.querySelector(".ef-epn"), t = p.querySelector(".ef-ept"), r = words.length ? [] : E.recent();
  rec.hidden = !r.length; rec.innerHTML = r.length ? '<span class="ef-l">Recent</span><div class="ef-eg" role="group" aria-label="Recent emoji">' + r.map(function (e) { return eb(e, cur); }).join("") + "</div>" : "";
  g.innerHTML = hit.map(function (e) { return eb(e, cur); }).join(""); n.hidden = hit.length > 0; t.textContent = words.length ? (hit.length ? "Matches" : "") : "Foods and kitchen";
}
function drawPicker() {
  var it = IEF.target(), p = $("#ef-emojis"); if (!p) return;
  p.innerHTML = '<label class="ef-eps">' + sv(IC.search, "", 18) + '<span class="sr-only">Search emoji</span><input type="search" class="ef-epi" data-epi placeholder="Search, e.g. cheese or herb" autocomplete="off" autocapitalize="none" enterkeyhint="search"></label>'
    + '<div class="ef-epr" hidden></div><div class="ef-epa"><span class="ef-l ef-ept">Foods and kitchen</span><div class="ef-eg" role="group" aria-label="Emoji"></div><p class="ef-note ef-epn" hidden>No emoji matches. Try another word.</p></div>'
    + (it && it.emoji ? '<button type="button" class="ef-eno" data-ef="setemoji" data-e="">No emoji</button>' : "");
  fillGrid("");
}
function openEmoji(on) {
  var p = $("#ef-emojis"), t = $("#ef-emo"); if (!p || !t) return;
  if (on === undefined) on = p.hidden;
  emoOpen = on; t.setAttribute("aria-expanded", on);
  if (!on) { p.hidden = true; return; }
  p.hidden = false; p.innerHTML = '<p class="ef-note">One moment.</p>';
  IEF.need("emoji.js", function () {
    if (!emoOpen) return; drawPicker();
    /* a keyboard user lands in the search box; on a phone it is not focused, so the on-screen keyboard does not cover the grid */
    var s = $("#ef-emojis [data-epi]"); if (s && IEF.host.keys) s.focus({ preventScroll: true });
    p.scrollIntoView({ block: "nearest", behavior: "auto" });
  });
}
function pickEmoji(e) {
  if (save("emoji", e)) { if (e && IEF.emoji) IEF.emoji.push(e); openEmoji(false); var t = $("#ef-emo"); if (t) t.focus({ preventScroll: true }); }
}
/* arrows move through the recent row and the grid; up from the first row goes back to the search box */
function emoNav(e) {
  var t = e.target, all = Array.prototype.slice.call(document.querySelectorAll("#ef-emojis .ef-e")), i = all.indexOf(t); if (i < 0) return;
  var k = e.key, to = null;
  if (k === "ArrowRight") to = all[i + 1]; else if (k === "ArrowLeft") to = all[i - 1];
  else if (k === "ArrowDown" || k === "ArrowUp") {
    var r = t.getBoundingClientRect(), cx = r.left + r.width / 2, best = 1e9;
    all.forEach(function (b) { var q = b.getBoundingClientRect(), dy = k === "ArrowDown" ? q.top - r.top : r.top - q.top; if (dy > 4) { var d = dy * 1000 + Math.abs(q.left + q.width / 2 - cx); if (d < best) { best = d; to = b; } } });
    if (!to && k === "ArrowUp") to = $("#ef-emojis [data-epi]");
  } else return;
  e.preventDefault(); if (to) to.focus();
}

/* ---------- suggestion lists for Location, Spot and Category (the Add form's behaviour in Kitchie uat): opens on focus or click, filters as you type, Arrow keys and Enter pick, Esc closes the list only, a new word is allowed ---------- */
var CB = { el: null, list: null, shown: [], active: -1, typed: false };
function cbEntries(key) {
  var it = IEF.target();
  if (key === "area") return IEF.AREAS.filter(function (a) { return a !== "Unplaced"; }).map(function (a) { return { text: a }; });
  if (key === "cat") return IEF.cats().map(function (c) { return { text: c }; });
  var ai = $('.ef [data-f="area"]'), av = ai ? canon(IEF.AREAS, ai.value) : (it.area === "Unplaced" ? "" : it.area);
  if (!av || av === "Unplaced") { var all = []; IEF.AREAS.forEach(function (a) { (IEF.SPOTS[a] || []).forEach(function (s) { all.push({ text: s, hint: a, area: a }); }); }); return all; }
  return (IEF.SPOTS[av] || []).map(function (s) { return { text: s, area: av }; });
}
function cbPlace(input, list) {
  list.classList.remove("is-up"); list.style.maxHeight = "224px";
  var need = Math.min(list.scrollHeight + 10, 224), cb = $("#ief-cbody"), b = cb ? cb.getBoundingClientRect() : { top: 0, bottom: innerHeight }, vv = window.visualViewport;
  var top = Math.max(b.top, vv ? vv.offsetTop : 0), bottom = Math.min(b.bottom, vv ? vv.offsetTop + vv.height : innerHeight), r = input.getBoundingClientRect(), below = bottom - r.bottom - 8, above = r.top - top - 8, up = below < need && above > below;
  list.classList.toggle("is-up", up); list.style.maxHeight = Math.max(88, Math.min(224, up ? above : below)) + "px";
}
function cbClose() { if (!CB.el) return; CB.list.hidden = true; CB.el.setAttribute("aria-expanded", "false"); CB.el.removeAttribute("aria-activedescendant"); CB.el = CB.list = null; CB.active = -1; }
function cbOpen(input) {
  if (CB.el && CB.el !== input) cbClose();
  var list = input.nextElementSibling; if (!list || !list.classList.contains("combo")) return;
  var q = CB.typed ? input.value.trim().toLowerCase() : "";
  CB.shown = cbEntries(input.dataset.cb).filter(function (e) { return !q || e.text.toLowerCase().indexOf(q) > -1; }).slice(0, 80);
  list.textContent = "";
  if (!CB.shown.length) { CB.el = input; CB.list = list; cbClose(); return; }
  CB.shown.forEach(function (e, n) {
    var li = document.createElement("li"); li.id = "cb-" + input.dataset.cb + "-" + n; li.setAttribute("role", "option"); li.setAttribute("aria-selected", "false"); li.dataset.i = n; li.appendChild(document.createTextNode(e.text));
    if (e.hint) { var h = document.createElement("span"); h.className = "hint"; h.textContent = e.hint; li.appendChild(h); }
    list.appendChild(li);
  });
  CB.el = input; CB.list = list; CB.active = -1; list.hidden = false; input.setAttribute("aria-expanded", "true"); cbPlace(input, list);
}
function cbMark(i) {
  CB.active = i; Array.prototype.forEach.call(CB.list.children, function (li, n) { li.setAttribute("aria-selected", n === i ? "true" : "false"); if (n === i) { CB.el.setAttribute("aria-activedescendant", li.id); li.scrollIntoView({ block: "nearest" }); } });
}
function cbChoose(e) {
  var input = CB.el, key = input.dataset.cb, it = IEF.target(); cbClose(); CB.typed = false;
  /* a spot picked with no location yet fills the location in (as in the Add form) */
  if (key === "spot" && e.area) { var ai = $('.ef [data-f="area"]'); if (it.area === "Unplaced" || (ai && !ai.value.trim())) save("area", e.area); }
  input.value = e.text; save(key, e.text);
}
document.addEventListener("focusin", function (e) { var i = e.target; if (i.matches && i.matches("[data-cb]") && !quiet && i.closest("#ief-cbody")) { CB.typed = false; cbOpen(i); } });
document.addEventListener("click", function (e) { var i = e.target; if (i.matches && i.matches("[data-cb]") && !CB.el) { CB.typed = false; cbOpen(i); } });
document.addEventListener("focusout", function (e) { if (e.target.matches && e.target.matches("[data-cb]")) cbClose(); });
document.addEventListener("pointerdown", function (e) { var li = e.target.closest && e.target.closest(".combo li"); if (li && CB.el) { e.preventDefault(); cbChoose(CB.shown[+li.dataset.i]); } });
/* the chip rows (Category, Unit): the chevron shows when the chips need more than one line */
function fitCats() {
  requestAnimationFrame(function () {
    Array.prototype.forEach.call(document.querySelectorAll(".ef-cats"), function (c) {
      var cl = c.querySelector(".ef-cl"), x = c.querySelector(".ef-cx"); if (!cl || !x) return;
      var o = c.dataset.open === "true"; c.dataset.open = "false"; var more = cl.scrollHeight > cl.clientHeight + 4; c.dataset.open = o ? "true" : "false";
      x.hidden = !(more || o); c.classList.toggle("more", more || o);
    });
  });
}
window.addEventListener("resize", function () { fitCats(); });

/* ---------- events ---------- */
var deb = null;
document.addEventListener("click", function (e) {
  var el = e.target.closest && e.target.closest("[data-ef]"); if (!el || !$("#ief-cbody")) return;
  var it = IEF.target(); if (!it) return;
  var k = el.dataset.ef;
  if (k === "step") step(it, el.dataset.key, +el.dataset.d);
  else if (k === "useq") save("useby", IEF.isoIn(+el.dataset.n));
  else if (k === "clearuse") save("useby", "");
  else if (k === "pickdate") { var di = $('#ef-s-useby [data-f="useby"]'); if (di) { try { di.showPicker(); } catch (x) { di.focus(); di.click(); } } }
  else if (k === "clearmin") { save("min", ""); redraw(["min"], it); }
  else if (k === "lvl") save("level", el.dataset.v);
  else if (k === "lvauto") { var l0 = level(it); IEF.autoAgain(it); if (!add()) { IEF.log(it, "Level", l0, level(it)); IEF.say("Saved"); IEF.syncParent(); } redraw(["level"], it); var ra = $('#ef-s-level [aria-checked="true"]'); if (ra) ra.focus({ preventScroll: true }); }
  else if (k === "qclear") save("qclear", "");
  else if (k === "addunit") { var t = parseFloat(it.text); it.amount = isFinite(t) ? t : 1; it.unit = ""; var tx = it.text; it.text = ""; if (it.level && it.level !== "Out" && it.level !== IEF.autoLevel(it)) it.lvSet = it.level; /* the label the person picked stays, as a hand-set level, so the level does not jump */ if (!add()) { IEF.log(it, "Quantity", tx || "not set", qtyText(it)); IEF.say("Saved"); IEF.syncParent(); } redraw(["qty", "level", "min", "shop"], it); var s = $('#ef-s-qty .ef-unitin'); if (s) s.focus(); }
  else if (k === "emoji") openEmoji();
  else if (k === "setemoji") pickEmoji(el.dataset.e);
  else if (k === "catchip") { var on = el.getAttribute("aria-pressed") === "true"; save("cat", on ? "" : el.dataset.v); }
  else if (k === "unitchip") { var onu = el.getAttribute("aria-pressed") === "true"; save("unit", onu ? "" : el.dataset.v); }
  else if (k === "chipsmore") { var c = el.closest(".ef-cats"), nowOpen = c.dataset.open !== "true", kind = c.dataset.kind; if (kind === "unit") unitsOpen = nowOpen; else catsOpen = nowOpen; c.dataset.open = nowOpen; el.setAttribute("aria-expanded", nowOpen); el.setAttribute("aria-label", (nowOpen ? "Show fewer " : "Show all ") + (kind === "unit" ? "units" : "categories")); }
  else if (k === "shopsave") {
    var inp = $('[data-f="shop"]'), val = it.amount !== null ? buyText(it) : (inp ? inp.value.trim() : ""), was = it.list !== null, sn = IEF.snap();
    if (!add() && S.down) { lastTry = ["shop", val]; showErr("shop", "Not saved. We can't reach the platform.", true); return; }
    it.list = val; IEF.log(it, "Shopping list", was ? (it.list || "on it") : "not on it", val || "on it"); IEF.say("Saved"); IEF.syncParent(); redraw(["shop"], it);
    IEF.toast(esc(it.name) + (was ? " is updated on your shopping list." : " is on your shopping list."), sn);
  }
  else if (k === "openlist") IEF.toast("Opens the Shopping list. Not drawn here.");
  else if (k === "recipe") IEF.toast("Opens Recipes with " + esc(it.name) + " as the ingredient. The label and the target come from the Recipe manifest. Not drawn here.");
  else if (k === "retry") { if (lastTry) { save(lastTry[0], lastTry[1]); } }
  else if (k === "addgo") IEF.commitAdd(false);
  else if (k === "addmore") IEF.commitAdd(true);
});
function onField(e, final) {
  var i = e.target.closest && e.target.closest("[data-f]"); if (!i || !i.isConnected || !i.closest(".ef")) return;
  var it = IEF.target(), f = i.dataset.f, v = i.value;
  if (f === "buy") { var bn = num(v); if (bn !== bn || bn === "" || bn < 0) { showErr("shop", "Use a number from 0 up."); return; } clearErr("shop"); it.buy = bn; return; }
  if (f === "amount" || f === "min") { var n = num(v); if (f === "min" && n === "") { save("min", ""); return; } if (f === "amount" && n === "") { showErr("amount", "Use a number from 0 up."); return; } v = n; if (n !== n) { showErr(f, f === "min" ? "Use a number, or clear it." : "Use a number from 0 up."); return; } }
  if (f === "shop") { return; }
  if (f === "text") { var b = it.text; it.text = v; if (!add()) { IEF.log(it, "Quantity", b || "not set", v || "not set"); IEF.say("Saved"); IEF.syncParent(); } return; }
  if (f === "name" && !add() && !String(v).trim()) { showErr("name", "A name is needed."); return; }
  if (f === "name" && add()) { it.name = v; clearErr("name"); return; }
  if (f === "area" || f === "spot" || f === "cat" || f === "unit") { if (String(v).trim() === String(f === "area" && it.area === "Unplaced" ? "" : it[f]).trim()) return; }
  save(f, v);
}
document.addEventListener("input", function (e) {
  var i = e.target.closest && e.target.closest(".ef [data-f]"); if (i) {
    var f = i.dataset.f; if (i.type === "date" || i.tagName === "SELECT") return;
    /* a box with a list of suggestions commits when you leave it or pick one, never while you are typing (half a word must not become a location) */
    if (i.dataset.cb) { if (e.isTrusted) { CB.typed = true; cbOpen(i); } return; }
    /* Category and Unit: typing filters the quick-pick chips; a word that is not in the list is kept when you press Enter or leave the box */
    if (i.dataset.cbq) { var kq = i.dataset.cbq, w = i.closest(".ef-w"), cl = w && w.querySelector(".ef-cl"), it0 = IEF.target(); if (cl) { cl.innerHTML = kq === "unit" ? unitItems(it0, i.value) : chipItems(it0, i.value); fitCats(); } var nn = w && w.querySelector(kq === "unit" ? ".ef-newunit" : ".ef-newcat"), tv = i.value.trim(); if (nn) { var known = (kq === "unit" ? IEF.units() : IEF.cats()).some(function (c) { return c.toLowerCase() === tv.toLowerCase(); }); nn.hidden = !tv || known; nn.textContent = "Enter adds “" + tv + "” as a new " + (kq === "unit" ? "unit" : "category") + "."; } return; }
    clearTimeout(deb); deb = setTimeout(function () { onField(e); }, 600); return;
  }
  var s = e.target.closest && e.target.closest("[data-epi]"); if (s) fillGrid(s.value);
});
document.addEventListener("change", function (e) { clearTimeout(deb); onField(e, true); });
/* Esc closes the open suggestion list or the emoji picker first and goes no further (the phone's Esc would close the sheet, and a box's Esc would leave it) */
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  if (CB.el) { e.preventDefault(); e.stopPropagation(); cbClose(); return; }
  var p = $("#ef-emojis"); if (p && !p.hidden) { e.preventDefault(); e.stopPropagation(); openEmoji(false); var t = $("#ef-emo"); if (t) t.focus({ preventScroll: true }); }
}, true);
document.addEventListener("keydown", function (e) {
  var t = e.target;
  if (t.matches && t.matches("[data-epi]")) {
    if (e.key === "ArrowDown") { e.preventDefault(); var f1 = $("#ef-emojis .ef-epr:not([hidden]) .ef-e, #ef-emojis .ef-eg .ef-e"); if (f1) f1.focus(); }
    else if (e.key === "Enter") { e.preventDefault(); var first = $("#ef-emojis .ef-epa .ef-e"); if (first) pickEmoji(first.dataset.e); }
    return;
  }
  if (t.matches && t.matches("#ef-emojis .ef-e") && /^Arrow/.test(e.key)) { emoNav(e); return; }
  if (t.matches && t.matches("[data-cb]") && CB.el) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { if (CB.shown.length) { e.preventDefault(); cbMark((CB.active + (e.key === "ArrowDown" ? 1 : -1) + CB.shown.length) % CB.shown.length); } return; }
    if (e.key === "Enter" && CB.active >= 0) { e.preventDefault(); e.stopImmediatePropagation(); cbChoose(CB.shown[CB.active]); return; }
  } else if (t.matches && t.matches("[data-cb]") && (e.key === "ArrowDown" || e.key === "ArrowUp")) { CB.typed = false; cbOpen(t); if (CB.shown.length) { e.preventDefault(); cbMark(e.key === "ArrowDown" ? 0 : CB.shown.length - 1); } return; }
  if (e.key === "Enter" && t.matches && t.matches('.ef input[type="text"], .ef input:not([type]), .ef .ef-num') && !(e.ctrlKey || e.metaKey)) {
    cbClose();
    if (add()) { e.preventDefault(); clearTimeout(deb); onField(e, true); IEF.commitAdd(e.shiftKey); }
    else { e.preventDefault(); clearTimeout(deb); onField(e, true); t.blur(); }
  }
});
})();
