"use strict";
/* Category editor. Loaded on the first tap of the category row. */
ITEM_FIELDS.cat = {
  html: (p) => opts("cat", "pick", CATEGORIES.map((c) => [c, `<span aria-hidden="true">${EM[c]}</span> ${c}`]), p.cat, "Category"),
  set: { pick: (p, c) => ({ cat: c }) },
};
