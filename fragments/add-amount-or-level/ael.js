/* Add item: an amount or a level (Kitchie #1047). One phone-width Add sheet; the hash picks the option: #a switch, #b both, #c quiet link, #d one by a setting, #dp the setting.
   Add "-level" to start on the level (#a-level, #c-level). Markup and class names are the edit flyout's own (form.js INNER.qty / INNER.level, handover section 10), so the build lifts them.
   Nothing here is fetched: no request after this file, no image, no font. */
(function () {
  "use strict";
  var H = (location.hash || "#a").slice(1), OPT = H === "dp" ? "dp" : H.charAt(0);
  if (["a", "b", "c", "d", "dp"].indexOf(OPT) < 0) OPT = "a";
  var LEVELS = ["Plenty", "Some", "Running low", "Out"], FILL = { "Plenty": 3, "Some": 2, "Running low": 1, "Out": 0 }, CLS = { "Plenty": "lv-plenty", "Some": "lv-some", "Running low": "lv-low", "Out": "lv-out" };
  var UNITS = ["jar", "g", "kg", "mL", "L", "pack"];
  var S = { mode: (OPT === "d" || /-level$/.test(H)) ? "level" : "qty", words: "", amount: null, unit: "", min: "", level: "", pref: "level" };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var IC = { plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M6 12h12"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', ruler: '<path d="M3.5 15.5l12-12 5 5-12 12z"/><path d="M7 12l2.2 2.2M10 9l1.6 1.6M13 6l2.2 2.2"/>', rotate: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>' };
  var sv = function (p, sz) { return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" aria-hidden="true" focusable="false">' + p + "</svg>"; };
  /* the three rounded squares, exactly handover section 10 (decision 133): width w, height round(w * 16 / 52) */
  function bat(l, w) {
    var n = FILL[l], r = "";
    for (var i = 0; i < 3; i++) r += '<rect x="' + (1 + 18 * i) + '" y="1" width="14" height="14" rx="3.2" fill="' + (i < n ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8"/>';
    return '<svg class="bat ' + CLS[l] + '" width="' + w + '" height="' + Math.round(w * 16 / 52) + '" viewBox="0 0 52 16" aria-hidden="true" focusable="false">' + r + "</svg>";
  }
  var L = function (t) { return '<span class="ef-l">' + t + "</span>"; };
  var step = function (d, label, ic) { return '<button type="button" data-ael="step" data-d="' + d + '" aria-label="' + label + '">' + sv(ic, 20) + "</button>"; };

  /* ---- the Quantity editor (form.js INNER.qty): free words first, "Add unit" opens the number and unit ---- */
  function qtyHtml(extra) {
    if (S.amount === null) {
      return '<div class="ef-w" id="ael-q">' + L("Quantity") + '<div class="ef-row"><input class="ef-in" data-in="words" value="' + esc(S.words) + '" placeholder="In your own words, e.g. a handful" autocomplete="off" aria-label="Quantity"></div>'
        + '<div class="ael-row2"><button type="button" class="btn ghost sm" data-ael="addunit">Add unit</button>' + (extra || "") + "</div></div>";
    }
    var chips = UNITS.map(function (u) { var on = u === S.unit; return '<button type="button" class="ef-chip' + (on ? " on" : "") + '" data-ael="unit" data-v="' + u + '" aria-pressed="' + on + '">' + u + "</button>"; }).join("");
    return '<div class="ef-w" id="ael-q"><div class="ef-lh">' + L("Quantity") + '<button type="button" class="ef-clear" data-ael="qclear">Clear</button></div>'
      + '<div class="ef-row"><div class="ef-step" role="group" aria-label="Quantity">' + step(-1, "Less", IC.minus) + '<input class="ef-num" data-in="amount" inputmode="decimal" value="' + S.amount + '" aria-label="Quantity" autocomplete="off">' + step(1, "More", IC.plus) + "</div>"
      + '<input class="ef-in ef-unitin" data-in="unit" value="' + esc(S.unit) + '" placeholder="Unit" maxlength="20" autocomplete="off" aria-label="Unit"></div>'
      + '<div class="ef-cats" data-kind="unit" data-open="false"><span class="ef-ct" aria-hidden="true">' + sv(IC.ruler, 20) + '</span><div class="ef-cl" role="group" aria-label="Unit suggestions">' + chips + "</div></div>"
      + (extra ? '<div class="ael-row2">' + extra + "</div>" : "") + "</div>";
  }
  /* Minimum stock stays as in Add today: only once there is a unit (decision 73). It has nothing to compare with when the person gives a level. */
  function minHtml() {
    if (S.amount === null || !S.unit) return "";
    return '<div class="ef-w" id="ael-m">' + L("Minimum stock") + '<div class="ef-row"><div class="ef-step" role="group" aria-label="Minimum stock">' + step(-1, "Lower the minimum", IC.minus).replace('data-ael="step"', 'data-ael="mstep"') + '<input class="ef-num" data-in="min" inputmode="decimal" value="' + esc(S.min) + '" placeholder="None" aria-label="Minimum stock" autocomplete="off">' + step(1, "Raise the minimum", IC.plus).replace('data-ael="step"', 'data-ael="mstep"') + '</div><span class="ef-unit">' + esc(S.unit) + '</span></div><p class="ef-note">Used to decide when this item goes on the shopping list.</p></div>';
  }
  /* ---- the Level picker (form.js INNER.level, handover section 10): four squares, the name only for a screen reader, the cue on the label's row ---- */
  function lvlHtml(extra) {
    var set = S.level !== "";
    var cue = '<p class="ef-lvm ael-lvnote" id="ael-cue"><span class="ef-src' + (set ? " set" : "") + '">' + (set ? "Set by you" : "Automatic") + "</span>" + (set ? '<button type="button" class="ef-auto" data-ael="lvback" aria-label="Back to automatic" title="Back to automatic">' + sv(IC.rotate, 20) + "</button>" : "") + "</p>";
    var pick = LEVELS.map(function (l) { var on = l === S.level; return '<button type="button" class="opt' + (on ? " on" : "") + '" role="radio" aria-checked="' + on + '" data-ael="lvl" data-v="' + l + '">' + bat(l, 44) + '<span class="sr-only">' + l + "</span></button>"; }).join("");
    return '<div class="ef-w" id="ael-l"><div class="ef-lh">' + L("Level") + cue + '</div><div class="opts lvpick" role="radiogroup" aria-label="Level">' + pick + "</div>"
      + '<p class="ef-note">Say how much is left. You can count it later.</p>' + (extra ? '<div class="ael-row2">' + extra + "</div>" : "") + "</div>";
  }
  var segIcon = {
    qty: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5 9h14M5 15h14M9.5 4l-1.4 16M15.9 4l-1.4 16"/></svg>',
    level: bat("Some", 26)
  };
  function segHtml(label) {
    var sg = function (v, t) { var on = S.mode === v; return '<button type="button" class="sg' + (on ? " on" : "") + '" role="radio" aria-checked="' + on + '" data-ael="seg" data-v="' + v + '">' + segIcon[v] + "<span>" + t + "</span></button>"; };
    return '<div class="ael-seg" role="radiogroup" aria-label="' + label + '">' + sg("qty", "Quantity") + sg("level", "Level") + "</div>";
  }

  /* ---- the Amount group per option ---- */
  function amountHtml() {
    if (OPT === "a") return segHtml("How much do you have?") + (S.mode === "qty" ? qtyHtml() + minHtml() : lvlHtml());
    if (OPT === "b") return qtyHtml() + minHtml() + '<div class="ael-or" aria-hidden="true">or</div>' + lvlHtml();
    if (OPT === "c") return S.mode === "qty"
      ? qtyHtml('<button type="button" class="btn ghost sm" data-ael="tolevel">Set a level</button>') + minHtml()
      : lvlHtml('<button type="button" class="btn ghost sm" data-ael="toqty">Use a quantity</button>');
    return lvlHtml(); /* d: the setting says Level, so Add draws only the level */
  }

  /* ---- what Add would store: a mock aid, not part of the product. Read from the rules in the code (store.ts shopping list, web-edit.ts add). Plain text only. ---- */
  function readout() {
    var useQ = OPT === "b" || (OPT !== "d" && S.mode === "qty"), useL = OPT === "b" || OPT === "d" || S.mode === "level";
    var exact = useQ && S.amount !== null, words = useQ && S.amount === null && S.words.trim() !== "", lv = useL ? S.level : "";
    var q = exact ? S.amount + (S.unit ? " " + S.unit : "") + " (an exact amount)" : words ? S.words.trim() + " (your words)" : "none";
    var l = lv ? lv + ", set by you" : exact ? "automatic" : "none (no level until you pick one)";
    var list;
    if (exact && lv) list = "the level is not read: the amount decides, and only against a minimum";
    else if (exact) list = S.min ? "listed when the amount is at or under the minimum" : "not listed (no minimum)";
    else if (lv === "Running low" || lv === "Out") list = "listed as " + (lv === "Out" ? "out" : "running low") + ", no minimum needed";
    else if (lv) list = "not listed";
    else list = words ? "not listed (words are not read as a number)" : "not listed";
    var held = [];
    if (OPT !== "b" && OPT !== "d") {
      if (S.mode === "level" && (S.words.trim() || S.amount !== null)) held.push("the quantity you typed");
      if (S.mode === "qty" && S.level) held.push("the level " + S.level);
    }
    var lines = ["Quantity: " + q, "Level: " + l, "Shopping list: " + list];
    if (held.length) lines.push("Kept in the form, not saved: " + held.join(", "));
    return { title: "Mock: what Add would store", lines: lines };
  }
  var FRAMED = window.parent !== window;
  function fill(o, r) {
    o.textContent = ""; var b = document.createElement("b"); b.textContent = r.title; o.appendChild(b);
    r.lines.forEach(function (t) { var p = document.createElement("p"); p.textContent = t; o.appendChild(p); });
  }
  /* inside the options page the readout is drawn under the frame (index.html listens); on its own the page draws it under the sheet */
  function paint() {
    var r = readout();
    if (FRAMED) { try { window.parent.postMessage({ ael: "out", v: r }, location.origin === "null" ? "*" : location.origin); } catch (e) {} return; }
    var o = $("#ael-out"); if (o) fill(o, r);
  }

  function sheetHtml() {
    return '<div class="ael-sheet"><span class="grab" aria-hidden="true"></span><div class="chd"><div><h2>Add an item</h2></div><button type="button" class="x ib" aria-label="Cancel adding" title="Cancel adding">' + sv(IC.x, 20) + "</button></div>"
      + '<div class="cbody"><section class="ef-sec"><h3 class="ef-h">Item</h3><div class="ef-w"><div class="ef-nrow"><button type="button" class="ef-emo" aria-label="Emoji, none yet">' + sv(IC.plus, 24) + '</button><label class="ef-big"><span class="sr-only">Name</span><input value="Garam masala" maxlength="60" autocomplete="off" placeholder="What is it?"></label></div></div></section>'
      + '<section class="ef-sec" id="ael-amount"><h3 class="ef-h">Amount</h3><div id="ael-body"></div></section>'
      + '<section class="ef-sec ael-dim" aria-label="Where and Use by, unchanged"><h3 class="ef-h">Where</h3><p class="ef-note">Location, Spot, Category and Use by follow, unchanged.</p></section></div>'
      + '<div class="cft"><button type="button" class="btn pri">Add item</button><button type="button" class="btn">Add and start another</button><button type="button" class="btn">Cancel</button></div></div>';
  }
  function prefHtml() {
    var sg = function (v, t) { var on = S.pref === v; return '<button type="button" class="sg' + (on ? " on" : "") + '" role="radio" aria-checked="' + on + '" data-ael="pref" data-v="' + v + '">' + segIcon[v] + "<span>" + t + "</span></button>"; };
    return '<div class="ael-pref"><h2>Preferences</h2><div class="ael-prow"><span class="ef-l">When I add an item, I say</span><div class="ael-seg" role="radiogroup" aria-label="When I add an item, I say">' + sg("qty", "Quantity") + sg("level", "Level") + '</div><p class="ef-note">Remembered on this device only. Add then shows just this one.</p></div>'
      + '<div class="ael-prow ael-dim"><span class="ef-l">Stock level checks, Home, and the rest</span><p class="ef-note">Unchanged.</p></div></div>';
  }

  function draw() {
    var b = $("#ael-body"); if (b) b.innerHTML = amountHtml();
    paint();
  }
  function root() {
    var r = $("#ael-root");
    if (OPT === "dp") { r.innerHTML = '<div class="ael-page"><div style="flex:1">' + prefHtml() + "</div></div>"; return; }
    r.innerHTML = '<div class="ael-page"><div class="ael-behind">Pantry</div>' + sheetHtml() + (FRAMED ? "" : '<div class="ael-out" id="ael-out" role="note"></div>') + "</div>";
    draw();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-ael]"); if (!t) return;
    var a = t.dataset.ael, v = t.dataset.v;
    if (a === "seg") S.mode = v;
    else if (a === "tolevel") S.mode = "level";
    else if (a === "toqty") S.mode = "qty";
    else if (a === "addunit") { var n = parseFloat(S.words); S.amount = isFinite(n) ? n : 1; S.unit = ""; S.words = ""; }
    else if (a === "qclear") { S.amount = null; S.unit = ""; S.min = ""; }
    else if (a === "unit") S.unit = v;
    else if (a === "step") { S.amount = Math.max(0, Math.round(((S.amount || 0) + Number(t.dataset.d)) * 100) / 100); }
    else if (a === "mstep") { S.min = String(Math.max(0, Math.round(((parseFloat(S.min) || 0) + Number(t.dataset.d)) * 100) / 100)); if (S.min === "0") S.min = ""; }
    else if (a === "lvl") S.level = S.level === v ? "" : v; /* tapping the picked square again takes it back */
    else if (a === "lvback") S.level = "";
    else if (a === "pref") S.pref = v;
    OPT === "dp" ? root() : draw();
  });
  document.addEventListener("input", function (e) {
    var k = e.target.dataset && e.target.dataset.in; if (!k) return;
    if (k === "amount") { var n = parseFloat(e.target.value); S.amount = isFinite(n) ? n : S.amount; }
    else S[k === "words" ? "words" : k] = e.target.value;
    paint();
  });
  /* arrow keys move the choice inside a radiogroup, as the level picker does */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var g = e.target.closest && e.target.closest('[role="radiogroup"]'); if (!g) return;
    var r = [].slice.call(g.querySelectorAll('[role="radio"]')), i = r.indexOf(e.target); if (i < 0) return;
    var gs = [].slice.call(document.querySelectorAll('[role="radiogroup"]')), gi = gs.indexOf(g);
    e.preventDefault(); r[(i + (e.key === "ArrowRight" ? 1 : r.length - 1)) % r.length].click();
    /* the group is redrawn by the click; put focus back on the chosen radio of the same group */
    var again = document.querySelectorAll('[role="radiogroup"]')[gi], on = again && again.querySelector('[aria-checked="true"]'); if (on) on.focus();
  });
  window.addEventListener("hashchange", function () { location.reload(); });
  root();
})();
