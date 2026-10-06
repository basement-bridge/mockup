"use strict";
/* Location and spot editors. Spots are scoped to the chosen location. Loaded on the first tap of either row. */
const SPOTS = { Fridge: ["Door", "Top shelf", "Crisper", "Bottom shelf"], Pantry: ["Top shelf", "Bottom shelf", "Baskets", "Spice rack"], Freezer: ["Top drawer", "Bottom drawer"] };
ITEM_FIELDS.loc = {
  html: (p) => opts("loc", "pick", AREAS.map((a) => [a, `<span aria-hidden="true">${EM[a]}</span> ${a}`]), p.area, "Location"),
  set: { pick: (p, a) => ({ area: a, spot: SPOTS[a].includes(p.spot) ? p.spot : "Anywhere" }) },
};
ITEM_FIELDS.spot = {
  html: (p) => {
    const list = ["Anywhere", ...SPOTS[p.area]]; if (!list.includes(p.spot)) list.push(p.spot);
    return `${opts("spot", "pick", list.map((s) => [s, esc(s)]), p.spot, "Spot in " + p.area)}<input class="field" data-fin="spot|own" placeholder="Somewhere else" maxlength="30" aria-label="Another spot in ${esc(p.area)}" autocomplete="off">`;
  },
  set: { pick: (p, s) => ({ spot: s }), own: (p, s) => ({ spot: s.trim() || p.spot }) },
};
