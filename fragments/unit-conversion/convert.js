/* Unit conversion for the Kitchie #800 mockup. This is the SAME logic the build will use, written the way server/src/assets/quantity.js writes it (the browser copy held equal to
   server/src/quantity.ts by test/quantity-parity.test.ts): ONE table of units (server/config/unit-rules.json: a family and a size per unit, count units have none), one convert(),
   one answer to "is there a known rate between these two units".
   Owner decisions this file carries (Kitchie #800, 16 Oct 2026): a known relationship converts automatically (UC-D2); precision comes from the conversion factor, 1000 gives three
   decimals, 100 gives two (UC-D4); a value that would round to zero is reported, never silently changed (UC-D5); no known rate means the person is asked (UC-D3).
   Only g, kg, mL and L are in the table today. Which units to add is the owner's open question 1 (UC-Q1); adding one is a line in RULES, nothing else. */
(function () {
  var RULES = { g: { family: "mass", size: 1 }, kg: { family: "mass", size: 1000 }, mL: { family: "volume", size: 1 }, L: { family: "volume", size: 1000 } };
  var COUNT = ["pack", "tin", "jar", "bottle", "bag", "box", "carton", "bunch", "roll"];
  function rule(u) { return RULES[u] || null; }
  /* the multiplier from one unit to another, or null when the table has no relationship (a count unit, another family, a unit it does not know) */
  function factor(from, to) { var a = RULES[from], b = RULES[to]; if (!a || !b || a.family !== b.family) return null; return a.size / b.size; }
  /* decimals from the factor between the two units: 1000 -> 3, 100 -> 2, 10 -> 1 (UC-D4). The same count in both directions. */
  function decimals(from, to) { var a = RULES[from], b = RULES[to]; return Math.max(0, Math.round(Math.log10(Math.max(a.size, b.size) / Math.min(a.size, b.size)))); }
  function round(n, d) { var m = Math.pow(10, d); return Math.round(n * m + (n >= 0 ? 1e-9 : -1e-9)) / m; }
  /* the number in the new unit, rounded to the factor's decimals; null when there is no known rate */
  function convert(amount, from, to) { if (from === to) return amount; var f = factor(from, to); return f === null ? null : round(amount * f, decimals(from, to)); }
  /* true when a real, non-zero value would come out as 0: the thing the person is warned about (UC-D5) */
  function losesAll(amount, from, to) { var c = convert(amount, from, to); return c === 0 && amount !== 0; }
  /* how a number reads: no trailing zeros, no exponent ("0.5", "1500", "0.25") */
  function fmt(n) { return String(+(+n).toFixed(6)); }
  /* a number and its unit never break across a line: they are joined with a no-break space */
  function say(n, u) { return fmt(n) + (u ? "\u00a0" + u : ""); }
  /* a typed or picked unit, spelled the way the household's table spells it ("kilos" is kg, "ml" is mL); anything else is kept as typed */
  var ALIAS = { g: "g", gram: "g", grams: "g", kg: "kg", kilo: "kg", kilos: "kg", kilogram: "kg", kilograms: "kg", ml: "mL", millilitre: "mL", millilitres: "mL", l: "L", litre: "L", litres: "L", liter: "L", liters: "L" };
  function match(t) { var k = String(t || "").trim().toLowerCase().replace(/\.$/, ""); if (!k) return ""; if (ALIAS[k]) return ALIAS[k]; for (var i = 0; i < COUNT.length; i++) if (COUNT[i] === k || COUNT[i] + "s" === k || (COUNT[i] + "es") === k) return COUNT[i]; return String(t).trim(); }
  /* Rows of one name, combined (UC-D7, owner: "combine and show in the smaller, more granular unit"): the unit is the smallest one among the rows, the amount is the sum, the minimum is the
     largest minimum among the rows (today's low-stock rule, now compared like with like). Returns null when the rows cannot be added (a count unit, or two families). */
  function together(rows) {
    if (rows.length < 2) return null;
    var fam = null, t = null, i;
    for (i = 0; i < rows.length; i++) { var r = RULES[rows[i].unit]; if (!r) return null; if (fam && fam !== r.family) return null; fam = r.family; if (!t || r.size < RULES[t].size) t = rows[i].unit; }
    var amt = 0, min = 0;
    rows.forEach(function (x) { amt += convert(x.amount || 0, x.unit, t); if (x.min) min = Math.max(min, convert(x.min, x.unit, t)); });
    return { unit: t, amount: round(amt, 3), min: min, rows: rows };
  }
  /* the level rules (item-edit-flyout decisions 84, 95 and 96): more than twice the minimum Plenty, above it Some, at or under it Running low, nothing Out; no minimum is Plenty until it is gone */
  function level(amount, min) { if (!amount) return "Out"; if (!min) return "Plenty"; return amount > 2 * min ? "Plenty" : amount > min ? "Some" : "Running low"; }
  window.UCV = { RULES: RULES, COUNT: COUNT, rule: rule, factor: factor, decimals: decimals, convert: convert, losesAll: losesAll, fmt: fmt, say: say, match: match, together: together, level: level };
})();
