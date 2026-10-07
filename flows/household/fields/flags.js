"use strict";
/* Level editor: two plain choices. Loaded on the first tap of the row. */
ITEM_FIELDS.level = {
  html: (p) => opts("level", "est", [["0", "Counted"], ["1", "Estimated"]], p.est ? "1" : "0", "How the amount was worked out"),
  set: { est: (p, v) => ({ est: v === "1" }) },
};
