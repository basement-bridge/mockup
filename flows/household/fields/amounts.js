"use strict";
/* Quantity (stepper plus unit chooser) and minimum stock editors. Loaded on the first tap of either row. */
const UNIT_CHOICES = ["g", "kg", "mL", "L", ...COUNT_UNITS.filter(Boolean), ""];
const CONVERT = { "g>kg": 0.001, "kg>g": 1000, "mL>L": 0.001, "L>mL": 1000 };
const round2 = (n) => Math.round(n * 100) / 100;
const stepped = (v, p, d) => Math.max(0, round2(v + (d === "-1" ? -1 : 1) * (STEP[p.unit] || 1)));
ITEM_FIELDS.qty = {
  html: (p) => `${stepper("qty", p, esc(fmtAmt(p)))}${opts("qty", "unit", UNIT_CHOICES.map((u) => [u, u || "items"]), p.unit, "Unit")}`,
  set: {
    step: (p, d) => ({ n: stepped(p.n, p, d), est: false }),
    unit: (p, u) => { const f = CONVERT[p.unit + ">" + u] || 1; return { unit: u, n: round2(p.n * f), min: round2(p.min * f) }; },
  },
};
ITEM_FIELDS.min = {
  html: (p) => stepper("min", p, esc(VAL.min(p))),
  set: { step: (p, d) => ({ min: stepped(p.min, p, d) }) },
};
