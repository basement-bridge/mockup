"use strict";
/* Use by editor: quick pills, a date picker (built only when Pick date is tapped) and a clear control. Loaded on the first tap of the row. */
const DAY = 864e5, today = () => new Date(new Date().toDateString());
const isoOf = (days) => { const d = new Date(today().getTime() + days * DAY); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
ITEM_FIELDS.useby = {
  html: (p) => {
    const quick = [[3, "+3 days"], [5, "+5 days"], [7, "+1 week"]];
    return `<div class="opts" role="group" aria-label="Use by">${quick.map(([d, l]) => `<button class="opt${p.days === d ? " on" : ""}" aria-pressed="${p.days === d}" data-act="fset" data-p="useby|days|${d}">${l}</button>`).join("")}<button class="opt${S.ed.picking ? " on" : ""}" aria-pressed="${S.ed.picking}" data-act="picker">Pick date</button>${p.days === null ? "" : `<button class="opt clr" data-act="fset" data-p="useby|clear">${I.x}<span>Clear</span></button>`}</div>
      ${S.ed.picking ? `<input class="field" type="date" data-fin="useby|date" min="${isoOf(0)}" ${p.days === null ? "" : `value="${isoOf(p.days)}"`} aria-label="Use by date">` : ""}`;
  },
  set: {
    days: (p, d) => ({ days: Number(d) }),
    clear: () => ({ days: null }),
    date: (p, v) => { if (!v) return { days: null }; const d = Math.round((new Date(v + "T00:00:00") - today()) / DAY); return d < 0 ? "That date has passed." : { days: d }; },
  },
};
