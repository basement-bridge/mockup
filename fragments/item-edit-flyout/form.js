/* The Edit item form (and Add item, same fields). Fetched on the first Edit or Add, never on page load (DESIGN.md section 6). No size rules here.
   Every change autosaves with the short "Saved" line; there is no Save button. A failed save (?down=1) or a bad value shows an error on that field.
   One layout (confirmed by the owner, 11 Oct 2026, decision 71): one scroll in five groups. The two tabs (B) and the tiles (C) were dropped and their code removed; they are in the git history (mockup PR 72).
   Each field is built once (INNER) and the layout only arranges them.
   11 Oct 2026 round: Location, Spot and Category are the same text-input-with-suggestions controls as the Add form in Kitchie uat (a list opens on focus, type to filter or add a new one); Category's suggestions are drawn as the chip row (proposed).
   The emoji picker (search, recent, "No emoji") is the same for Edit and Add; its list of emoji is in emoji.js, fetched when the picker is first opened. Level is four battery icons, with an "Automatic" / "Set by you" cue (decisions 82 to 86, refined by 94 to 101).
   Round 3 (owner's voice answers of 11 Oct 2026, decisions 94 to 101): Category and Unit are a text box plus a row of quick-pick chips, free text for anything not in the list; a hand-set level goes back to automatic only when stock is added; with no minimum the level is Plenty until 0.
   Round 5 (owner, typed, 12 Oct 2026, decisions 108 to 113): Location, Spot and Category share ONE suggestion strip (strip* below; the Pantry filter bar's chips): a single row under the field, hidden while the field has a value, shown when it is empty or the person types or clears it; the level's "Set by you" cue gets a labelled "Back to automatic" button.
   Round 4 (owner, typed, 12 Oct 2026, decisions 102 to 107): there is NO shopping group in Edit. "How much to buy" and the button live in the item flyout and show only at Running low or Out (flyout.js). The emoji picker's code moved to emoji.js so the item flyout's header tile shares it. */
(function () {
"use strict";
var IEF = window.IEF, $ = IEF.$, esc = IEF.esc, sv = IEF.sv, IC = IEF.IC, S = IEF.S, F = IEF.form = {};
var counted = IEF.counted, level = IEF.level, qtyText = IEF.qtyText, round2 = IEF.round2;
var LABEL = { name: "Name", emoji: "Emoji", amount: "Quantity", unit: "Quantity", text: "Quantity", qclear: "Quantity", level: "Level", min: "Minimum", area: "Location", spot: "Spot", cat: "Category", useby: "Use by" };
var GROUP = { name: "name", emoji: "name", amount: "qty", unit: "qty", text: "qty", level: "level", min: "min", area: "area", spot: "spot", cat: "cat", useby: "useby" };

function add() { return S.mode === "add"; }
function L(t) { return '<span class="ef-l">' + t + "</span>"; }
function err(k) { return '<p class="ef-err" data-err="' + k + '" role="alert" hidden></p>'; }
function wrap(id, inner) { return '<div class="ef-w" id="ef-s-' + id + '" data-field="' + id + '">' + inner + "</div>"; }
function stepBtn(d, label, ic, key) { return '<button type="button" data-ef="step" data-d="' + d + '" data-key="' + (key || "amount") + '" aria-label="' + label + '">' + sv(ic, "", 20) + "</button>"; }
function hasMin(it) { return !!(it.unit || it.min) || counted(it); }

/* ---------- the field builders: the inner of each field's wrapper, rebuilt on its own when something it depends on changes ---------- */
var unitsOpen = false;
function emoTile(it) {
  return '<button type="button" class="ef-emo" id="ef-emo" data-ef="emoji" aria-expanded="' + !!(IEF.emoji && IEF.emoji.isOpen("edit")) + '" aria-controls="ef-emojis" aria-label="' + (it.emoji ? "Emoji " + it.emoji + ". Change it" : "Add an emoji") + '" title="' + (it.emoji ? "Change the emoji" : "Add an emoji") + '">' + (it.emoji ? it.emoji : sv(IC.plus, "", 22)) + "</button>";
}
/* a Location, Spot or Category box (decisions 108 to 110, owner 12 Oct 2026): the text box, and under it the ONE suggestion strip (stripBox) that all three share. The box is the combobox, the strip is its listbox. */
function combo(key, lab, val, ph) {
  return L(lab) + '<input class="ef-in" data-f="' + key + '" data-cb="' + key + '" value="' + esc(val) + '" placeholder="' + ph + '" maxlength="60" autocomplete="off" autocapitalize="none" enterkeyhint="' + (key === "cat" ? "done" : "next") + '" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="sg-' + key + '" aria-label="' + lab + '">' + stripBox(key);
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
/* The default for "how much to buy" (decision 99) moved with the control to the item flyout (flyout.js: IEF.buyVal) in round 4. */
/* The level cue (decisions 111 to 113, owner 12 Oct 2026; refines 86): on the Level label's row, right-aligned. "Set by you" + a labelled, circular-arrow "Back to automatic" button (44px, focusable) only while a hand-set level exists on an item with a number; "Automatic" (muted, no control) while the rules decide; nothing where no rules apply. */
function lvCue(it) {
  var src = IEF.lvSource(it); if (!src) return "";
  return '<p class="ef-lvm" id="ef-lvm">' + (src === "set"
    ? '<span class="ef-src set" title="You picked this. It goes back to automatic when you add stock.">Set by you</span><button type="button" class="ef-auto" data-ef="lvauto" aria-label="Back to automatic" title="Back to automatic">' + sv(IC.rotate, "", 20) + "</button>"
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
    return '<div class="ef-lh">' + L("Quantity") + '<button type="button" class="ef-clear" data-ef="qclear" title="No quantity. How much to buy can then be in your own words.">Clear</button></div><div class="ef-row"><div class="ef-step" role="group" aria-label="Quantity">' + stepBtn(-1, "Less", IC.minus) + '<input class="ef-num" data-f="amount" inputmode="decimal" value="' + round2(it.amount) + '" aria-label="Quantity" autocomplete="off">' + stepBtn(1, "More", IC.plus) + "</div>"
      + '<input class="ef-in ef-unitin" data-f="unit" data-cbq="unit" value="' + esc(it.unit) + '" placeholder="Unit" maxlength="20" autocomplete="off" autocapitalize="none" enterkeyhint="done" aria-label="Unit"></div>'
      + chipsRow("unit", IC.ruler, "Unit", "units", unitItems(it, ""), unitsOpen) + '<p class="ef-note ef-newunit" hidden></p>' + err("qty");
  },
  /* Level (decisions 82 to 86): four icons for every item, the current level always picked, never a word on screen. Where rules can work it out (a counted item, or a number with a minimum) it is "Automatic" until you pick one ("Set by you"); a new quantity hands it back to the rules. */
  level: function (it) {
    var lv = level(it);
    return '<div class="ef-lh">' + L("Level") + lvCue(it) + '</div><div class="opts lvpick" role="radiogroup" aria-label="Level">' + IEF.LEVELS.map(function (l) { return '<button type="button" class="opt' + (l === lv ? " on" : "") + '" role="radio" aria-checked="' + (l === lv) + '" data-ef="lvl" data-v="' + l + '">' + IEF.lvIcon(l, 28) + IEF.sr(l) + "</button>"; }).join("") + "</div>" + err("level");
  },
  min: function (it) {
    if (!hasMin(it)) return "";
    var u = it.unit ? " " + esc(it.unit) : "";
    return L("Minimum stock") + '<div class="ef-row"><div class="ef-step" role="group" aria-label="Minimum stock">' + stepBtn(-1, "Lower the minimum", IC.minus, "min") + '<input class="ef-num" data-f="min" inputmode="decimal" value="' + esc(it.min) + '" placeholder="None" aria-label="Minimum stock" autocomplete="off">' + stepBtn(1, "Raise the minimum", IC.plus, "min") + "</div>" + (it.unit ? '<span class="ef-unit">' + esc(it.unit) + "</span>" : "") + (it.min ? '<button type="button" class="ef-clear" data-ef="clearmin">Clear</button>' : "") + '</div><p class="ef-note">' + (it.min ? "Running low is at or under this. Plenty is over twice it." : "No minimum: the level is Plenty until it is gone. You can set Some or Running low yourself.") + "</p>" + err("min");
  },
  area: function (it) { return combo("area", "Location", it.area === "Unplaced" ? "" : it.area, "Pick or type") + err("area"); },
  spot: function (it) { return combo("spot", "Spot", it.spot, "Pick or type") + err("spot"); },
  cat: function (it) { return combo("cat", "Category", it.cat, "Pick one, or type your own") + err("cat"); },
  /* Use by: the date in words with Clear, and the quick choices of the Add form in Kitchie uat (+3 days, +5 days, +1 week, Pick date...). Decision 92. */
  useby: function (it) {
    var d = IEF.daysTo(it.useby), q = [["+3 days", 3], ["+5 days", 5], ["+1 week", 7]];
    return L("Use by") + '<div class="ef-ubl"><output class="ef-ub' + (it.useby ? "" : " none") + '">' + (it.useby ? esc(IEF.dayName(it.useby)) + " · " + IEF.rel(d) : "Not set") + "</output>" + (it.useby ? '<button type="button" class="ef-clear" data-ef="clearuse">Clear</button>' : "") + "</div>"
      + '<div class="ef-sug" role="group" aria-label="Quick use-by choices">' + q.map(function (x) { var iso = IEF.isoIn(x[1]), on = it.useby === iso; return '<button type="button" class="pill' + (on ? " on" : "") + '" data-ef="useq" data-n="' + x[1] + '" aria-pressed="' + on + '">' + x[0] + "</button>"; }).join("")
      + '<button type="button" class="pill" data-ef="pickdate">Pick date\u2026</button></div>'
      + '<input type="date" class="ef-datein" data-f="useby" value="' + it.useby + '" min="' + IEF.todayIso + '" aria-label="Pick a use-by date" tabindex="-1">' + err("useby");
  },
  /* there is no Shopping list group in Edit any more (decision 102, owner 12 Oct 2026); see flyout.js for "How much to buy" */
};
function field(k, it) { return wrap(k, INNER[k](it)); }
function sec(h, body) { return '<section class="ef-sec">' + (h ? '<h3 class="ef-h">' + h + "</h3>" : "") + body + "</section>"; }
function recipe() {
  if (!S.recipes || add()) return "";
  /* the label and the target belong to the Recipe manifest; hidden when the household has no Recipes */
  return '<button type="button" class="ef-go" data-ef="recipe" data-from="recipe-manifest">' + sv(IC.pot, "", 22) + '<span class="ef-gol">Use in a recipe</span>' + sv(IC.chev, "", 18) + "</button>";
}

/* ---------- the layout: one scroll, four groups (Item, Amount, Where, Use by), then the recipe action (decision 102) ---------- */
function layout(it) {
  if (add()) return sec("Item", field("name", it)) + sec("Amount", field("qty", it) + field("min", it)) + sec("Where", field("area", it) + field("spot", it) + field("cat", it)) + sec(null, field("useby", it));
  return sec("Item", field("name", it)) + sec("Amount", field("qty", it) + field("level", it) + field("min", it)) + sec("Where", field("area", it) + field("spot", it) + field("cat", it)) + sec(null, field("useby", it)) + recipe();
}
F.fill = function (it) { var b = $("#ief-cbody"); if (!b) return; if (IEF.emoji) IEF.emoji.reset("edit"); unitsOpen = false; STRIPS.forEach(function (k) { ST[k] = null; }); b.innerHTML = '<div class="ef">' + layout(it) + "</div>"; var t = $("#ief-ctitle h2"); if (t) t.textContent = "Edit item"; STRIPS.forEach(stripDraw); fitCats(); };
F.fillAdd = function () {
  var b = $("#ief-cbody"), it = IEF.draft, k = IEF.host.keys ? IEF.host : null; if (IEF.emoji) IEF.emoji.reset("edit"); unitsOpen = false; STRIPS.forEach(function (k) { ST[k] = null; });
  b.innerHTML = '<div class="ef" data-mode="add">' + layout(it) + "</div>";
  STRIPS.forEach(stripDraw); fitCats();
  $("#ief-cft").innerHTML = '<button type="button" class="btn pri" data-ef="addgo">Add item ' + IEF.kbd("enter", "keep") + '</button><button type="button" class="btn" data-ef="addmore">Add and start another ' + (k ? '<kbd class="kbd">&#8679; Enter</kbd>' : "") + '</button><button type="button" class="btn ghost" data-ief="addcancel">Cancel ' + (k ? '<kbd class="kbd">' + k.closeLabel + "</kbd>" : "") + "</button>";
};
F.nameError = function () { showErr("name", "A name is needed."); var i = $('[data-f="name"]'); if (i) i.focus(); };
F.saveEmoji = function (e) { return save("emoji", e); };

/* ---------- landing on a field (a tile in the item flyout was tapped, or ?field=) ---------- */
var FWRAP = { qty: "qty", level: "level", min: "min", useby: "useby", cat: "cat", name: "name", area: "area", spot: "spot" };
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
function get(it, f) { return it[f]; }
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
  else if (f === "qclear") { it.amount = null; it.text = ""; it.unit = ""; it.prev = null; it.lvSet = null; }
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
    w.innerHTML = INNER[id](it);
    if (fk) { var n = id === "level" && fk.indexOf("lvl") > -1 ? w.querySelector('[aria-checked="true"]') : w.querySelector(fk); if (n) n.focus({ preventScroll: true }); }
  });
}
/* Location, Spot and Category are not rebuilt (a rebuild would drop a click that is on its way to the next box); their text is set in place and their strips are redrawn */
function syncWhere(it) {
  [["area", it.area === "Unplaced" ? "" : it.area], ["spot", it.spot], ["cat", it.cat]].forEach(function (p) { var i = $('.ef [data-f="' + p[0] + '"]'); if (i && i.value !== p[1]) i.value = p[1]; });
  STRIPS.forEach(function (k) { st(k).typed = false; st(k).force = false; stripDraw(k); });
}
/* the Unit box and its chips are set in place, like Category (a rebuild would drop a click on its way to the next box) */
function syncUnits(it) {
  var i = $('.ef [data-f="unit"]'); if (i && i.value !== it.unit) i.value = it.unit;
  var cl = $("#ef-s-qty .ef-cl"); if (cl) { cl.innerHTML = unitItems(it, ""); fitCats(); var n = $(".ef-newunit"); if (n) n.hidden = true; }
}
function after(f, it) {
  if (f === "amount") redraw(["level", "min"], it);
  else if (f === "min") redraw(["level", "min"], it);
  else if (f === "unit") { syncUnits(it); redraw(["level", "min"], it); }
  else if (f === "qclear") redraw(["qty", "level", "min"], it);
  else if (f === "level") redraw(["qty", "level"], it);
  else if (f === "area" || f === "spot" || f === "cat") syncWhere(it);
  else if (f === "useby") redraw([f], it);
  else if (f === "emoji") refreshEmoji(it);
}
function num(s) { s = String(s).trim().replace(",", "."); return s === "" ? "" : (isFinite(s) ? parseFloat(s) : NaN); }
function step(it, key, d) {
  var u = it.unit, st = counted(it) ? 1 : (IEF.STEP[u] || 1), cur = key === "min" ? (parseFloat(it.min) || 0) : (it.amount || 0), n = Math.max(0, round2(cur + d * st));
  save(key, key === "min" && n === 0 ? "" : n);
  var i = $('[data-f="' + key + '"]'); if (i) i.value = key === "min" && n === 0 ? "" : n;
}

/* ---------- the emoji picker: its code is in emoji.js (shared with the item flyout's header tile), fetched the first time a picker opens. The tile here only asks for it. ---------- */
function refreshEmoji(it) { var t = $("#ef-emo"); if (t) t.outerHTML = emoTile(it); }

/* ---------- the suggestion strip: Location, Spot and Category, one implementation (decisions 108 to 110, owner, typed 12 Oct 2026) ----------
   The strip is the Pantry filter bar's row (tag or pin icon, pills, a chevron for the rest), drawn UNDER the box. Rules:
   - the box has a value: no strip, nothing extra drawn. It pops in when the person types in the box or clears it (or presses an arrow key to browse).
   - the box is empty: a single row with one or two suggested pills (the first two of the list) and the chevron to show the rest.
   - typing filters the pills and HIGHLIGHTS the best match (exact, then starts with, then contains). Tap it, or press Enter or the arrow keys, to take it.
   - the typed text is always offered as the outlined "add this" pill first (free text, the existing rule), unless it is exactly an existing word. Leaving the box also keeps it, as before.
   - the spot list follows the location above it; with no location it lists every spot with its location, and taking one fills the location in. Changing the location clears the spot (apply()).
   - Esc closes the strip only. The box is the combobox, the pills are its listbox options, the highlighted pill is aria-activedescendant. Pills are 44px. */
var STRIPS = ["area", "spot", "cat"], ST = {};
var SG = { area: { icon: "pin", noun: "location", plural: "locations", label: "Location" }, spot: { icon: "pin", noun: "spot", plural: "spots", label: "Spot" }, cat: { icon: "tag", noun: "category", plural: "categories", label: "Category" } };
function st(k) { return ST[k] || (ST[k] = { typed: false, force: false, off: false, open: false, hl: -1, items: [] }); }
function sgEntries(key) {
  var it = IEF.target();
  if (key === "area") return IEF.AREAS.filter(function (a) { return a !== "Unplaced"; }).map(function (a) { return { text: a }; });
  if (key === "cat") return IEF.cats().map(function (c) { return { text: c }; });
  var ai = $('.ef [data-f="area"]'), av = ai ? canon(IEF.AREAS, ai.value) : (it && it.area === "Unplaced" ? "" : it && it.area);
  if (!av || av === "Unplaced") { var all = []; IEF.AREAS.forEach(function (a) { (IEF.SPOTS[a] || []).forEach(function (s) { all.push({ text: s, hint: a, area: a }); }); }); return all; }
  return (IEF.SPOTS[av] || []).map(function (s) { return { text: s, area: av }; });
}
/* the pills for a box: [{kind: "free" | "opt", text, hint?, area?}] and the index of the highlighted one */
function sgModel(key, q) {
  var qq = q.trim().toLowerCase(), all = sgEntries(key), items = [], hl = -1;
  if (!qq) { all.forEach(function (e) { items.push({ kind: "opt", text: e.text, hint: e.hint, area: e.area }); }); return { items: items, hl: -1, nopt: items.length }; }
  var rank = function (e) { var t = e.text.toLowerCase(); return t === qq ? 0 : t.indexOf(qq) === 0 ? 1 : 2; };
  var opts = all.filter(function (e) { return e.text.toLowerCase().indexOf(qq) > -1; }).map(function (e, n) { return { e: e, n: n }; }).sort(function (a, b) { return rank(a.e) - rank(b.e) || a.n - b.n; }).map(function (x) { return x.e; });
  var exact = opts.length && opts[0].text.toLowerCase() === qq;
  if (!exact) items.push({ kind: "free", text: q.trim().replace(/\s+/g, " ") });
  opts.forEach(function (e) { items.push({ kind: "opt", text: e.text, hint: e.hint, area: e.area }); });
  hl = opts.length ? (exact ? 0 : 1) : 0;   /* the best match; with none, the typed text itself */
  return { items: items, hl: hl, nopt: opts.length };
}
function sgInput(k) { return $('.ef [data-f="' + k + '"]'); }
function sgVisible(k) { var i = sgInput(k), s = st(k); return !!i && !s.off && (s.typed || s.force || i.value.trim() === ""); }
function stripBox(k) {
  /* first draw: the box's value is known to the caller as the field text; the strip is filled in by stripDraw right after the field is placed (F.fill / redraw) */
  return '<div class="ef-cats ef-strip" id="sg-' + k + '" data-kind="' + k + '" data-open="false" data-n="0" hidden></div>';
}
function stripDraw(k, keep) {
  var box = $("#sg-" + k), i = sgInput(k); if (!box || !i) return;
  var s = st(k), vis = sgVisible(k), def = SG[k];
  if (!vis) { box.hidden = true; box.innerHTML = ""; i.setAttribute("aria-expanded", "false"); i.removeAttribute("aria-activedescendant"); s.hl = -1; s.items = []; return; }
  var m = sgModel(k, s.typed ? i.value : "");
  if (!m.items.length) { s.items = []; s.hl = -1; box.hidden = true; box.innerHTML = ""; i.setAttribute("aria-expanded", "false"); i.removeAttribute("aria-activedescendant"); return; }   /* nothing to suggest (a spot under a location that has no spots yet): no empty strip */
  s.items = m.items; s.hl = keep ? s.hl : (s.typed ? m.hl : -1); if (s.hl > m.items.length - 1) s.hl = -1;
  var shownOpts = 0, html = "";
  /* collapsed: the typed pill and the first two options; expanded: all of them. The highlighted pill is always among the first two (best match first). */
  m.items.forEach(function (x, n) {
    if (x.kind === "opt") { shownOpts++; if (!s.open && shownOpts > 2 && n !== s.hl) return; }
    var id = "sg-" + k + "-" + n, on = n === s.hl;
    html += '<button type="button" class="ef-chip' + (x.kind === "free" ? " add" : "") + (on ? " hl" : "") + '" role="option" id="' + id + '" tabindex="-1" aria-selected="' + on + '" data-ef="sgpick" data-i="' + n + '"' + (x.kind === "free" ? ' aria-label="Add ' + esc("“" + x.text + "”") + " as a new " + def.noun + '"' : "") + ">" + esc(x.text) + (x.hint ? '<span class="hint">' + esc(x.hint) + "</span>" : "") + "</button>";
  });
  box.innerHTML = '<span class="ef-ct" aria-hidden="true">' + sv(IC[def.icon], "", 20) + '</span><div class="ef-cl" role="listbox" aria-label="' + def.label + ' suggestions">' + html + '</div><button type="button" class="ef-cx" data-ef="sgmore" aria-expanded="' + s.open + '" aria-label="' + (s.open ? "Show fewer " : "Show all ") + def.plural + '" tabindex="-1"' + (m.nopt > 2 || s.open ? "" : " hidden") + ">" + sv(IC.chevd, "", 18) + "</button>";
  box.dataset.open = s.open; box.dataset.n = m.nopt; box.hidden = false; box.classList.toggle("more", m.nopt > 2 || s.open);
  i.setAttribute("aria-expanded", "true");
  if (s.hl >= 0) i.setAttribute("aria-activedescendant", "sg-" + k + "-" + s.hl); else i.removeAttribute("aria-activedescendant");
  fitCats();
}
function stripMark(k, n) {
  var s = st(k); if (!s.items.length) return;
  if (n >= 0 && s.items[n] && s.items[n].kind === "opt" && !s.open) { var c = 0; for (var j = 0; j <= n; j++) if (s.items[j].kind === "opt") c++; if (c > 2) s.open = true; }
  s.hl = n; stripDraw(k, true);
}
function stripChoose(k, x) {
  var it = IEF.target(), i = sgInput(k), s = st(k); if (!it || !i || !x) return;
  s.typed = false; s.force = false; s.open = false; s.off = false;
  /* a spot picked with no location yet fills the location in (as in the Add form) */
  if (k === "spot" && x.area) { var ai = sgInput("area"); if (it.area === "Unplaced" || (ai && !ai.value.trim())) save("area", x.area); }
  i.value = x.text; if (!save(k, x.text)) { /* a refused save keeps the strip open */ s.force = true; }
  syncWhere(IEF.target() || it);
}
/* a pill is tapped without the box losing focus (so nothing is saved half-typed first) */
document.addEventListener("pointerdown", function (e) { if (e.target.closest && e.target.closest(".ef-strip")) e.preventDefault(); });
document.addEventListener("focusin", function (e) { var i = e.target; if (i.matches && i.matches("[data-cb]") && i.closest("#ief-cbody")) { var s = st(i.dataset.cb); s.off = false; s.hl = -1; stripDraw(i.dataset.cb); } });
document.addEventListener("focusout", function (e) { var i = e.target; if (i.matches && i.matches("[data-cb]")) { var s = st(i.dataset.cb); s.typed = false; s.force = false; s.open = false; setTimeout(function () { if (i.isConnected) stripDraw(i.dataset.cb); }, 0); } });
/* the chip rows (Category, Unit): the chevron shows when the chips need more than one line */
function fitCats() {
  requestAnimationFrame(function () {
    Array.prototype.forEach.call(document.querySelectorAll(".ef-cats"), function (c) {
      var cl = c.querySelector(".ef-cl"), x = c.querySelector(".ef-cx"); if (!cl || !x) return;
      var o = c.dataset.open === "true"; c.dataset.open = "false"; var more = cl.scrollHeight > cl.clientHeight + 4; c.dataset.open = o ? "true" : "false";
      var big = c.classList.contains("ef-strip") && +c.dataset.n > 2; x.hidden = !(more || o || big); c.classList.toggle("more", more || o || big);
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
  else if (k === "addunit") { var t = parseFloat(it.text); it.amount = isFinite(t) ? t : 1; it.unit = ""; var tx = it.text; it.text = ""; if (it.level && it.level !== "Out" && it.level !== IEF.autoLevel(it)) it.lvSet = it.level; /* the label the person picked stays, as a hand-set level, so the level does not jump */ if (!add()) { IEF.log(it, "Quantity", tx || "not set", qtyText(it)); IEF.say("Saved"); IEF.syncParent(); } redraw(["qty", "level", "min"], it); var s = $('#ef-s-qty .ef-unitin'); if (s) s.focus(); }
  else if (k === "emoji") IEF.need("emoji.js", function () { IEF.emoji.toggle("edit"); });
  else if (k === "sgpick") { var sk = el.closest(".ef-strip").dataset.kind; stripChoose(sk, st(sk).items[+el.dataset.i]); }
  else if (k === "sgmore") { var mk = el.closest(".ef-strip").dataset.kind; st(mk).open = !st(mk).open; stripDraw(mk, true); }
  else if (k === "unitchip") { var onu = el.getAttribute("aria-pressed") === "true"; save("unit", onu ? "" : el.dataset.v); }
  else if (k === "chipsmore") { var c = el.closest(".ef-cats"), nowOpen = c.dataset.open !== "true"; unitsOpen = nowOpen; c.dataset.open = nowOpen; el.setAttribute("aria-expanded", nowOpen); el.setAttribute("aria-label", (nowOpen ? "Show fewer " : "Show all ") + "units"); }
  else if (k === "recipe") IEF.toast("Opens Recipes with " + esc(it.name) + " as the ingredient. The label and the target come from the Recipe manifest. Not drawn here.");
  else if (k === "retry") { if (lastTry) { save(lastTry[0], lastTry[1]); } }
  else if (k === "addgo") IEF.commitAdd(false);
  else if (k === "addmore") IEF.commitAdd(true);
});
function onField(e, final) {
  var i = e.target.closest && e.target.closest("[data-f]"); if (!i || !i.isConnected || !i.closest(".ef")) return;
  var it = IEF.target(), f = i.dataset.f, v = i.value;
  if (f === "amount" || f === "min") { var n = num(v); if (f === "min" && n === "") { save("min", ""); return; } if (f === "amount" && n === "") { showErr("amount", "Use a number from 0 up."); return; } v = n; if (n !== n) { showErr(f, f === "min" ? "Use a number, or clear it." : "Use a number from 0 up."); return; } }
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
    if (i.dataset.cb) { if (e.isTrusted) { var sk = i.dataset.cb, ss = st(sk); ss.typed = true; ss.off = false; ss.force = false; ss.open = false; stripDraw(sk); } return; }
    /* Category and Unit: typing filters the quick-pick chips; a word that is not in the list is kept when you press Enter or leave the box */
    if (i.dataset.cbq) { var kq = i.dataset.cbq, w = i.closest(".ef-w"), cl = w && w.querySelector(".ef-cl"), it0 = IEF.target(); if (cl) { cl.innerHTML = unitItems(it0, i.value); fitCats(); } var nn = w && w.querySelector(".ef-newunit"), tv = i.value.trim(); if (nn) { var known = IEF.units().some(function (c) { return c.toLowerCase() === tv.toLowerCase(); }); nn.hidden = !tv || known; nn.textContent = "Enter adds “" + tv + "” as a new unit."; } return; }
    clearTimeout(deb); deb = setTimeout(function () { onField(e); }, 600); return;
  }
});
document.addEventListener("change", function (e) { clearTimeout(deb); onField(e, true); });
/* Esc closes the strip first and goes no further (the phone's Esc would close the sheet, and a box's Esc would leave it). An open emoji picker does the same (emoji.js). */
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  var t = e.target, k = t && t.matches && t.matches("[data-cb]") ? t.dataset.cb : null;
  if (k && sgVisible(k)) { e.preventDefault(); e.stopPropagation(); st(k).off = true; stripDraw(k); }
}, true);
document.addEventListener("keydown", function (e) {
  var t = e.target, k = t.matches && t.matches("[data-cb]") ? t.dataset.cb : null;
  if (k) {
    var s = st(k);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!sgVisible(k)) { s.force = true; s.off = false; stripDraw(k); }
      if (s.items.length) { e.preventDefault(); stripMark(k, s.hl < 0 ? (e.key === "ArrowDown" ? 0 : s.items.length - 1) : (s.hl + (e.key === "ArrowDown" ? 1 : -1) + s.items.length) % s.items.length); }
      return;
    }
    if (e.key === "Enter" && sgVisible(k) && s.hl >= 0 && s.items[s.hl]) { e.preventDefault(); e.stopImmediatePropagation(); stripChoose(k, s.items[s.hl]); return; }
  }
  if (e.key === "Enter" && t.matches && t.matches('.ef input[type="text"], .ef input:not([type]), .ef .ef-num') && !(e.ctrlKey || e.metaKey)) {
    if (add()) { e.preventDefault(); clearTimeout(deb); onField(e, true); IEF.commitAdd(e.shiftKey); }
    else { e.preventDefault(); clearTimeout(deb); onField(e, true); t.blur(); }
  }
});
})();
