"use strict";
/* Single use and Level editors: two plain choices each. Loaded on the first tap of either row. */
ITEM_FIELDS.single = {
  html: (p) => opts("single", "on", [["1", "Yes"], ["0", "No"]], p.single ? "1" : "0", "Single use"),
  set: { on: (p, v) => ({ single: v === "1" }) },
};
ITEM_FIELDS.level = {
  html: (p) => opts("level", "est", [["0", "Counted"], ["1", "Estimated"]], p.est ? "1" : "0", "How the amount was worked out"),
  set: { est: (p, v) => ({ est: v === "1" }) },
};
