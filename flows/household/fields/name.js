"use strict";
/* Name and emoji editor. Loaded on the first tap of the name row. The emoji set is fetched with it and not before. */
const EMOJIS = ["🥛", "🥚", "🧈", "🧀", "🍞", "🥖", "🍚", "🍝", "🥕", "🧅", "🥔", "🍅", "🥦", "🥬", "🍎", "🍌", "🍋", "🍗", "🥩", "🐟", "🥫", "🫙", "🧂", "🍫", "🍪", "🥜", "🍯", "🥶"];
ITEM_FIELDS.name = {
  html: (p) => `<input class="field" data-fin="name|name" value="${esc(p.name)}" maxlength="40" aria-label="Name" autocomplete="off">
    <div class="irow" role="radiogroup" aria-label="Emoji">${["", ...EMOJIS].map((e) => `<button class="ipick${p.emoji === e ? " on" : ""}" role="radio" aria-checked="${p.emoji === e}" data-act="fset" data-p="name|emoji|${e}" ${e ? "" : 'aria-label="No emoji"'}>${e || I.x}</button>`).join("")}</div>`,
  set: {
    name: (p, v) => (v.trim() ? { name: v.trim() } : "Name can't be empty."),
    emoji: (p, v) => ({ emoji: v }),
  },
};
