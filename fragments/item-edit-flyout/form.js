/* The Edit item form (and Add item, same fields). Fetched on the first Edit or Add, never on page load (DESIGN.md section 6). No size rules here.
   Every change autosaves with the short "Saved" line; there is no Save button. A failed save (?down=1) or a bad value shows an error on that field.
   Three layouts of the same fields (?opt=): a = one scroll in four groups (recommended), b = the two tabs kept, c = tiles that open one field at a time.
   Each field is built once (FIELDS) and every layout only arranges them. */
(function () {
"use strict";
var IEF = window.IEF, $ = IEF.$, esc = IEF.esc, sv = IEF.sv, IC = IEF.IC, S = IEF.S, F = IEF.form = {};
var counted = IEF.counted, level = IEF.level, qtyText = IEF.qtyText, round2 = IEF.round2;
var EMO = ["🧈", "🥕", "🧀", "🥚", "🥛", "🥬", "🍚", "🥫", "🧅", "🧄", "🍅", "🥔", "🌶️", "🍋", "🍎", "🍌", "🍞", "🥩", "🍗", "🐟", "🍝", "🫘", "🧂", "🍯"];
var LABEL = { name: "Name", emoji: "Emoji", amount: "Quantity", unit: "Quantity", text: "Quantity", level: "Level", min: "Minimum", area: "Location", spot: "Spot", cat: "Category", useby: "Use by", shop: "Shopping list" };
var GROUP = { name: "name", emoji: "name", amount: "qty", unit: "qty", text: "qty", level: "level", min: "min", area: "area", spot: "spot", cat: "cat", useby: "useby", shop: "shop" };

function add() { return S.mode === "add"; }
function L(t) { return '<span class="ef-l">' + t + "</span>"; }
function err(k) { return '<p class="ef-err" data-err="' + k + '" role="alert" hidden></p>'; }
function wrap(id, inner) { return '<div class="ef-w" id="ef-s-' + id + '" data-field="' + id + '">' + inner + "</div>"; }
function pills(key, list, cur, label) {
  return '<div class="ef-sug" role="group" aria-label="' + label + '">' + list.map(function (s) { var on = s === cur; return '<button type="button" class="pill' + (on ? " on" : "") + '" data-ef="sug" data-key="' + key + '" data-v="' + esc(s) + '" aria-pressed="' + on + '">' + esc(s) + "</button>"; }).join("") + "</div>";
}
function stepBtn(d, label, ic, key) { return '<button type="button" data-ef="step" data-d="' + d + '" data-key="' + (key || "amount") + '" aria-label="' + label + '">' + sv(ic, "", 20) + "</button>"; }
function hasMin(it) { return !!(it.unit || it.min) || counted(it); }

/* ---------- the field builders: the inner of each field's wrapper, rebuilt on its own when something it depends on changes ---------- */
var INNER = {
  name: function (it) {
    return '<div class="ef-nrow"><button type="button" class="ef-emo" data-ef="emoji" aria-expanded="false" aria-controls="ef-emojis" aria-label="' + (it.emoji ? "Emoji " + it.emoji + ". Change it" : "Add an emoji") + '" title="' + (it.emoji ? "Change the emoji" : "Add an emoji") + '">' + (it.emoji ? it.emoji : sv(IC.plus, "", 22)) + '</button>'
      + '<label class="ef-big"><span class="sr-only">Name</span><input data-f="name" value="' + esc(it.name) + '" maxlength="60" autocomplete="off" placeholder="What is it?"></label></div>'
      + '<div class="ef-emojis" id="ef-emojis" role="group" aria-label="Pick an emoji" hidden>' + EMO.map(function (e) { return '<button type="button" class="ef-e' + (e === it.emoji ? " on" : "") + '" data-ef="setemoji" data-e="' + e + '" aria-label="' + e + '">' + e + "</button>"; }).join("") + (it.emoji ? '<button type="button" class="ef-eno" data-ef="setemoji" data-e="">No emoji</button>' : "") + "</div>" + err("name");
  },
  qty: function (it) {
    if (it.amount === null) return L("Quantity") + '<div class="ef-row"><input class="ef-in" data-f="text" value="' + esc(it.text) + '" placeholder="In your own words, e.g. a handful" autocomplete="off" aria-label="Quantity"><button type="button" class="btn ghost sm" data-ef="addunit">Add unit</button></div>' + err("qty");
    var cu = counted(it) ? IEF.COUNT.filter(Boolean) : [];
    return L("Quantity") + '<div class="ef-row"><div class="ef-step" role="group" aria-label="Quantity">' + stepBtn(-1, "Less", IC.minus) + '<input class="ef-num" data-f="amount" inputmode="decimal" value="' + round2(it.amount) + '" aria-label="Quantity" autocomplete="off">' + stepBtn(1, "More", IC.plus) + "</div>"
      + '<select class="ef-sel" data-f="unit" aria-label="Unit"><optgroup label="Weight and volume">' + ["g", "kg", "mL", "L"].map(function (u) { return '<option value="' + u + '"' + (u === it.unit ? " selected" : "") + ">" + u + "</option>"; }).join("") + '</optgroup><optgroup label="Count">' + IEF.COUNT.map(function (u) { return '<option value="' + u + '"' + (u === it.unit ? " selected" : "") + ">" + (u || "none, just a number") + "</option>"; }).join("") + "</optgroup></select></div>" + err("qty");
  },
  /* the level is a drop and never a word (owner, 8 Oct 2026). A counted item's is worked out and cannot be set here; a weighed or worded item's is picked from four drops. */
  level: function (it) {
    var lv = level(it);
    if (counted(it)) return L("Level") + '<div class="ef-lvl">' + IEF.drop(lv, 30) + IEF.sr("Level, " + lv) + '<span>Worked out from the amount' + (hasMin(it) ? " and the minimum" : "") + ".</span></div>" + err("level");
    return L("Level") + '<div class="opts lvpick" role="radiogroup" aria-label="Level">' + ["Plenty", "Some", "Running low", "Out"].map(function (l) { return '<button type="button" class="opt' + (l === lv ? " on" : "") + '" role="radio" aria-checked="' + (l === lv) + '" data-ef="lvl" data-v="' + l + '">' + IEF.drop(l, 34) + IEF.sr(l) + "</button>"; }).join("") + '</div><p class="ef-note">The drop empties as it runs down. An empty drop means none left; nothing is deleted.</p>' + err("level");
  },
  min: function (it) {
    if (!hasMin(it)) return "";
    var u = it.unit ? " " + esc(it.unit) : "";
    return L("Minimum stock") + '<div class="ef-row"><div class="ef-step" role="group" aria-label="Minimum stock">' + stepBtn(-1, "Lower the minimum", IC.minus, "min") + '<input class="ef-num" data-f="min" inputmode="decimal" value="' + esc(it.min) + '" placeholder="None" aria-label="Minimum stock" autocomplete="off">' + stepBtn(1, "Raise the minimum", IC.plus, "min") + "</div>" + (it.unit ? '<span class="ef-unit">' + esc(it.unit) + "</span>" : "") + (it.min ? '<button type="button" class="ef-clear" data-ef="clearmin">Clear</button>' : "") + '</div><p class="ef-note">Running low is at or under this.</p>' + err("min");
  },
  area: function (it) { return L("Location") + '<input class="ef-in" data-f="area" value="' + esc(it.area) + '" placeholder="Fridge, Pantry, Freezer" autocomplete="off" aria-label="Location">' + pills("area", IEF.AREAS.filter(function (a) { return a !== "Unplaced"; }), it.area, "Location suggestions") + err("area"); },
  spot: function (it) { var sp = (IEF.SPOTS[it.area] || []).concat(IEF.SPOTS[it.area] && IEF.SPOTS[it.area].length ? ["Anywhere"] : []); return L("Spot") + '<input class="ef-in" data-f="spot" value="' + esc(it.spot) + '" placeholder="Pick or type" autocomplete="off" aria-label="Spot">' + (sp.length ? pills("spot", sp, it.spot, "Spot suggestions") : "") + err("spot"); },
  cat: function (it) { return L("Category") + '<input class="ef-in" data-f="cat" value="' + esc(it.cat) + '" placeholder="Pick or type" autocomplete="off" aria-label="Category">' + pills("cat", IEF.cats(), it.cat, "Category suggestions") + err("cat"); },
  useby: function (it) {
    var d = IEF.daysTo(it.useby), q = [["Today", 0], ["Tomorrow", 1], ["3 days", 3], ["1 week", 7], ["2 weeks", 14], ["1 month", 30]];
    return L("Use by") + '<div class="ef-ubl"><output class="ef-ub' + (it.useby ? "" : " none") + '">' + (it.useby ? esc(IEF.dayName(it.useby)) + " · " + IEF.rel(d) : "Not set") + "</output>" + (it.useby ? '<button type="button" class="ef-clear" data-ef="clearuse">Clear</button>' : "") + "</div>"
      + '<div class="ef-sug" role="group" aria-label="Quick choices">' + q.map(function (x) { var iso = IEF.isoIn(x[1]), on = it.useby === iso; return '<button type="button" class="pill' + (on ? " on" : "") + '" data-ef="useq" data-n="' + x[1] + '" aria-pressed="' + on + '">' + x[0] + "</button>"; }).join("") + "</div>"
      + '<label class="ef-date"><span class="sr-only">Pick a date</span><input type="date" data-f="useby" value="' + it.useby + '"></label>' + err("useby");
  },
  /* the Shopping list block: one heading, spaced and ruled off from the fields above, and only once (it used to sit under both tabs with no space above it) */
  shop: function (it) {
    var on = it.list !== null;
    return '<h3 class="ef-h">Shopping list</h3>' + (on ? '<p class="ef-onlist">' + sv(IC.tick, "", 16) + '<span>This is on the shopping list.</span><button type="button" class="link" data-ef="openlist">Open the list</button></p>' : "")
      + '<label class="ef-f2"><span class="ef-l">How much to buy (optional, in your own words)</span><input class="ef-in" data-f="shop" value="' + esc(it.list || "") + '" placeholder="1 kg, a packet, 3" autocomplete="off"></label>'
      + '<button type="button" class="btn ' + (on ? "ghost" : "pri") + ' ef-shopb" data-ef="shopsave">' + sv(IC.cart, "", 20) + "<span>" + (on ? "Update the shopping list" : "Add to shopping list") + "</span></button>" + err("shop");
  }
};
/* what a tile in layout c shows for a field: [value, caption] ; null value = empty and dashed */
var SUM = {
  name: function (it) { return [(it.emoji ? it.emoji + " " : "") + esc(it.name || "Unnamed"), "Name"]; },
  qty: function (it) { var q = qtyText(it); return q ? [esc(q), "Quantity"] : [null, "Add quantity"]; },
  level: function (it) { return ["", "Level", IEF.drop(level(it), 28) + IEF.sr("Level, " + level(it))]; },
  min: function (it) { return it.min ? [esc(it.min + (it.unit ? " " + it.unit : "")), "Minimum stock"] : [null, "Add minimum"]; },
  area: function (it) { return it.area ? [esc(it.area), "Location"] : [null, "Add location"]; },
  spot: function (it) { return it.spot ? [esc(it.spot), "Spot"] : [null, "Add spot"]; },
  cat: function (it) { return it.cat ? [esc(it.cat), "Category"] : [null, "Add category"]; },
  useby: function (it) { var d = IEF.daysTo(it.useby); return it.useby ? [esc(IEF.dayName(it.useby)), "Use by · " + IEF.rel(d)] : [null, "Add use-by"]; },
  shop: function (it) { return it.list !== null ? [esc(it.list || "On the list"), "Shopping list"] : [null, "Add to shopping list"]; }
};
var TITLE = { name: "Name and emoji", qty: "Quantity", level: "Level", min: "Minimum stock", area: "Location", spot: "Spot", cat: "Category", useby: "Use by", shop: "Shopping list" };
function field(k, it) { var h = k === "shop" ? INNER.shop(it) : INNER[k](it); return k === "shop" ? '<div class="ef-w ef-shop" id="ef-s-shop" data-field="shop">' + h + "</div>" : wrap(k, h); }
function sec(h, body) { return '<section class="ef-sec">' + (h ? '<h3 class="ef-h">' + h + "</h3>" : "") + body + "</section>"; }
function recipe() {
  if (!S.recipes || add()) return "";
  /* the label and the target belong to the Recipe manifest; hidden when the household has no Recipes */
  return '<button type="button" class="ef-go" data-ef="recipe" data-from="recipe-manifest">' + sv(IC.pot, "", 22) + '<span class="ef-gol">Use in a recipe</span>' + sv(IC.chev, "", 18) + "</button>";
}

/* ---------- the three layouts ---------- */
var LAYOUT = {
  a: function (it) {
    if (add()) return sec("Item", field("name", it)) + sec("Amount", field("qty", it) + field("min", it)) + sec("Where", field("area", it) + field("spot", it) + field("cat", it)) + sec(null, field("useby", it));
    return sec("Item", field("name", it)) + sec("Amount", field("qty", it) + field("level", it) + field("min", it)) + sec("Where", field("area", it) + field("spot", it) + field("cat", it)) + sec(null, field("useby", it)) + field("shop", it) + recipe();
  },
  b: function (it) {
    var det = sec(null, field("name", it)) + sec(null, field("qty", it)) + sec("Where", field("area", it) + field("spot", it) + field("cat", it));
    var stk = (add() ? "" : sec(null, field("level", it))) + sec(null, field("min", it) + field("useby", it)) + (add() ? "" : field("shop", it));
    var t = S.tab === "stock";
    return '<div class="ef-tabs" role="tablist" aria-label="Edit sections"><button type="button" role="tab" id="eft-details" aria-selected="' + !t + '" aria-controls="eftp" data-ef="tab" data-t="details" tabindex="' + (t ? -1 : 0) + '">Details</button><button type="button" role="tab" id="eft-stock" aria-selected="' + t + '" aria-controls="eftp" data-ef="tab" data-t="stock" tabindex="' + (t ? 0 : -1) + '">Stock &amp; more</button></div>'
      + '<div class="ef-tp" id="eftp" role="tabpanel" aria-labelledby="eft-' + (t ? "stock" : "details") + '">' + (t ? stk : det) + "</div>" + recipe();
  },
  c: function (it) {
    var ks = add() ? ["name", "qty", "min", "area", "spot", "cat", "useby"] : ["name", "qty", "level", "min", "area", "spot", "cat", "useby", "shop"];
    if (S.field && ks.indexOf(S.field) > -1) return '<button type="button" class="ef-back" data-ef="backtiles">' + sv(IC.back, "", 20) + "<span>All fields</span></button>" + (S.field === "name" ? '<h3 class="ef-h ef-h1">' + TITLE[S.field] + "</h3>" : "") + field(S.field, it);
    return '<div class="tiles ef-tiles" role="group" aria-label="All fields">' + ks.filter(function (k) { return k !== "min" || hasMin(it); }).map(function (k) {
      var v = SUM[k](it); return v[0] === null ? '<button type="button" class="tl empty" data-ef="ftile" data-k="' + k + '">' + sv(IC.plus, "", 20) + "<span>" + v[1] + "</span></button>"
        : '<button type="button" class="tl" data-ef="ftile" data-k="' + k + '">' + (v[2] || "") + (v[0] ? "<b>" + v[0] + "</b>" : "") + "<span>" + v[1] + "</span></button>";
    }).join("") + "</div>" + recipe();
  }
};
F.fill = function (it) { var b = $("#ief-cbody"); if (!b) return; b.innerHTML = '<div class="ef" data-opt="' + S.opt + '">' + LAYOUT[S.opt](it) + "</div>"; var t = $("#ief-ctitle h2"); if (t) t.textContent = "Edit item"; };
F.fillAdd = function () {
  var b = $("#ief-cbody"), it = IEF.draft, k = IEF.host.keys ? IEF.host : null;
  b.innerHTML = '<div class="ef" data-opt="a" data-mode="add">' + LAYOUT.a(it) + "</div>";
  $("#ief-cft").innerHTML = '<button type="button" class="btn pri" data-ef="addgo">Add item ' + IEF.kbd("enter", "keep") + '</button><button type="button" class="btn" data-ef="addmore">Add and start another ' + (k ? '<kbd class="kbd">&#8679; Enter</kbd>' : "") + '</button><button type="button" class="btn ghost" data-ief="addcancel">Cancel ' + (k ? '<kbd class="kbd">' + k.closeLabel + "</kbd>" : "") + "</button>";
};
F.nameError = function () { showErr("name", "A name is needed."); var i = $('[data-f="name"]'); if (i) i.focus(); };
/* layout c: one field at a time with a way back to the tiles. Returns true when it took the back step (Esc on a phone, Ctrl or Cmd Enter on desktop step back before they close). */
F.back = function () { if (S.opt === "c" && S.field && !add()) { S.field = ""; F.fill(IEF.cur()); IEF.url(); var t = $('.ef-tiles [data-ef="ftile"]'); if (t) t.focus(); return true; } return false; };
F.refreshShop = function () { var it = IEF.cur(), w = $("#ef-s-shop"); if (w && it) w.innerHTML = INNER.shop(it); };

/* ---------- landing on a field (a tile in the item flyout was tapped, or ?field=) ---------- */
var FWRAP = { qty: "qty", level: "level", min: "min", useby: "useby", cat: "cat", name: "name", area: "area", spot: "spot", shop: "shop" };
F.focusField = function (k, inputs) {
  var it = IEF.target(); if (!it) return;
  if (!k) { if (inputs) { var n = $('.ef [data-f="name"]'); if (n) n.focus({ preventScroll: true }); } return; }
  if (S.opt === "b") { var tab = (k === "name" || k === "qty" || k === "area" || k === "spot" || k === "cat") ? "details" : "stock"; if (S.tab !== tab) { S.tab = tab; F.fill(it); } }
  if (S.opt === "c" && !S.field) { S.field = k; F.fill(it); }
  var w = $("#ef-s-" + FWRAP[k]); if (!w) return;
  w.scrollIntoView({ block: "nearest", behavior: "auto" }); w.classList.remove("hl"); void w.offsetWidth; w.classList.add("hl");
  var c = inputs ? w.querySelector("input:not([type=date]),select") : w.querySelector("button.pill,button.opt,button");
  if (c) c.focus({ preventScroll: true });
};

/* ---------- saving ---------- */
function get(it, f) { return f === "shop" ? it.list : it[f]; }
function fmt(it, f) {
  if (f === "amount" || f === "unit" || f === "text") return qtyText(it) || "not set";
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
function apply(it, f, v) {
  if (f === "name") it.name = String(v).trim() || it.name;
  else if (f === "amount") { it.amount = round2(v); if (it.amount === 0) it.prev = it.prev || null; }
  else if (f === "level") {
    if (v === "Out") { if (it.amount !== null) { it.prev = it.amount; it.amount = 0; } else it.level = "Out"; }
    else { it.level = v; if (it.amount === 0 && it.prev) { it.amount = it.prev; it.prev = null; } }
  } else if (f === "min") it.min = v === "" ? "" : String(v);
  else if (f === "area") { it.area = String(v); if ((IEF.SPOTS[it.area] || []).indexOf(it.spot) < 0) it.spot = ""; }
  else if (f === "shop") it.list = String(v);
  else it[f] = v;
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
    if (fk) { var n = w.querySelector(fk); if (n) n.focus({ preventScroll: true }); }
  });
}
function after(f, it) {
  if (f === "amount" || f === "min") redraw(["level"], it);
  else if (f === "unit") redraw(["level", "min"], it);
  else if (f === "level") redraw(["qty", "level"], it);
  else if (f === "area") redraw(["area", "spot"], it);
  else if (f === "spot" || f === "cat" || f === "useby") redraw([f], it);
  else if (f === "emoji") redraw(["name"], it);
}
function num(s) { s = String(s).trim().replace(",", "."); return s === "" ? "" : (isFinite(s) ? parseFloat(s) : NaN); }
function step(it, key, d) {
  var u = it.unit, st = counted(it) ? 1 : (IEF.STEP[u] || 1), cur = key === "min" ? (parseFloat(it.min) || 0) : (it.amount || 0), n = Math.max(0, round2(cur + d * st));
  save(key, key === "min" && n === 0 ? "" : n);
  var i = $('[data-f="' + key + '"]'); if (i) i.value = key === "min" && n === 0 ? "" : n;
}

/* ---------- events ---------- */
var deb = null;
document.addEventListener("click", function (e) {
  var el = e.target.closest && e.target.closest("[data-ef]"); if (!el || !$("#ief-cbody")) return;
  var it = IEF.target(); if (!it) return;
  var k = el.dataset.ef;
  if (k === "step") step(it, el.dataset.key, +el.dataset.d);
  else if (k === "sug") { save(el.dataset.key, el.dataset.v); var i = $('[data-f="' + el.dataset.key + '"]'); if (i) i.value = el.dataset.v; }
  else if (k === "useq") save("useby", IEF.isoIn(+el.dataset.n));
  else if (k === "clearuse") save("useby", "");
  else if (k === "clearmin") { save("min", ""); redraw(["min"], it); }
  else if (k === "lvl") save("level", el.dataset.v);
  else if (k === "addunit") { var t = parseFloat(it.text); it.amount = isFinite(t) ? t : 1; it.unit = ""; var tx = it.text; it.text = ""; if (!add()) { IEF.log(it, "Quantity", tx || "not set", qtyText(it)); IEF.say("Saved"); IEF.syncParent(); } redraw(["qty", "level", "min"], it); var s = $('#ef-s-qty select'); if (s) s.focus(); }
  else if (k === "emoji") { var p = $("#ef-emojis"), open = p.hidden; p.hidden = !open; el.setAttribute("aria-expanded", open); }
  else if (k === "setemoji") { save("emoji", el.dataset.e); }
  else if (k === "shopsave") {
    var inp = $('[data-f="shop"]'), val = inp ? inp.value.trim() : "", was = it.list !== null, sn = IEF.snap();
    if (!add() && S.down) { lastTry = ["shop", val]; showErr("shop", "Not saved. We can't reach the platform.", true); return; }
    it.list = val; IEF.log(it, "Shopping list", was ? (it.list || "on it") : "not on it", val || "on it"); IEF.say("Saved"); IEF.syncParent(); redraw(["shop"], it);
    IEF.toast(esc(it.name) + (was ? " is updated on your shopping list." : " is on your shopping list."), sn);
  }
  else if (k === "openlist") IEF.toast("Opens the Shopping list. Not drawn here.");
  else if (k === "recipe") IEF.toast("Opens Recipes with " + esc(it.name) + " as the ingredient. The label and the target come from the Recipe manifest. Not drawn here.");
  else if (k === "retry") { if (lastTry) { save(lastTry[0], lastTry[1]); } }
  else if (k === "tab") { S.tab = el.dataset.t; F.fill(it); var tb = $("#eft-" + S.tab); if (tb) tb.focus(); }
  else if (k === "ftile") { S.field = el.dataset.k; F.fill(it); IEF.url(); var w = $("#ef-s-" + FWRAP[S.field]); if (w) { var c = w.querySelector(IEF.host.keys ? "input:not([type=date]),select,button" : "button") ; if (c) c.focus({ preventScroll: true }); } }
  else if (k === "backtiles") F.back();
  else if (k === "addgo") IEF.commitAdd(false);
  else if (k === "addmore") IEF.commitAdd(true);
});
function onField(e, final) {
  var i = e.target.closest && e.target.closest("[data-f]"); if (!i || !i.isConnected || !i.closest(".ef")) return;
  var it = IEF.target(), f = i.dataset.f, v = i.value;
  if (f === "amount" || f === "min") { var n = num(v); if (f === "min" && n === "") { save("min", ""); return; } if (f === "amount" && n === "") { showErr("amount", "Use a number from 0 up."); return; } v = n; if (n !== n) { showErr(f, f === "min" ? "Use a number, or clear it." : "Use a number from 0 up."); return; } }
  if (f === "shop") { return; }
  if (f === "text") { var b = it.text; it.text = v; if (!add()) { IEF.log(it, "Quantity", b || "not set", v || "not set"); IEF.say("Saved"); IEF.syncParent(); } return; }
  if (f === "name" && !add() && !String(v).trim()) { showErr("name", "A name is needed."); return; }
  if (f === "name" && add()) { it.name = v; clearErr("name"); return; }
  save(f, v);
}
document.addEventListener("input", function (e) {
  var i = e.target.closest && e.target.closest(".ef [data-f]"); if (!i) return;
  var f = i.dataset.f; if (i.type === "date" || i.tagName === "SELECT") return;
  clearTimeout(deb); deb = setTimeout(function () { onField(e); }, 600);
});
document.addEventListener("change", function (e) { clearTimeout(deb); onField(e, true); });
document.addEventListener("keydown", function (e) {
  var t = e.target;
  if (e.key === "Enter" && t.matches && t.matches('.ef input[type="text"], .ef input:not([type]), .ef .ef-num') && !(e.ctrlKey || e.metaKey)) {
    if (add()) { e.preventDefault(); clearTimeout(deb); onField(e, true); IEF.commitAdd(e.shiftKey); }
    else { e.preventDefault(); clearTimeout(deb); onField(e, true); t.blur(); }
  }
  if (t.matches && t.matches('.ef-tabs [role="tab"]') && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); S.tab = S.tab === "stock" ? "details" : "stock"; F.fill(IEF.target()); var tb = $("#eft-" + S.tab); if (tb) tb.focus(); }
});
})();
