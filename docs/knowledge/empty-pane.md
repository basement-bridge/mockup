# Pantry and Recipes on desktop: what the side panel shows when nothing is picked

Kitchie #867. Owner, voice, 17 October 2026 (Arjan): "Under Pantry and Recipe there is a flyout that is blank. Under Recipe it says 'pick a recipe to see it here'; under Pantry it says 'pick an item to see it here'. That seems pretty ordinary, but what are your design options for that space when something is not picked?"

**Options to choose from. Nothing built, nothing decided.** Mockup `fragments/empty-pane/` (live: https://basement-bridge.github.io/mockup/fragments/empty-pane/), check `tools/empty-pane-check.mjs` (1005 checks), screenshots `tools/empty-pane-shots.mjs`.

## Today

From 1024px, the Pantry and Recipes keep a 400px lane that is empty until a row is picked. The only content is one muted line drawn by CSS (`::after` in `server/src/desktop-layout.ts` and `server/src/desktop-css/recipes.ts`). No JavaScript, no request.

## What the page already holds (no extra load)

Pantry rows: `data-name`, `data-area`, `data-useby`, `data-low`, `data-gone`, `data-recent`. Recipe rows: `data-ready`, `data-cd` (days since cooked), `data-star`, `data-planned`, `data-quick`. Every option is worked out from these. A missing-ingredient count per recipe is not on the row today.

## The six options (each for Pantry and Recipes; dark and light; empty, typical, large households)

| | Pantry | Recipes | Fetch cost | Weak |
|---|---|---|---|---|
| A At a glance | Your kitchen, Use soon, Running low, Out | Ready now, One thing short, Planned this week, Cooked lately | none | tallest (838px in a large household); shows Out the list hides |
| B Things to do | Add, Scan a receipt, going off, running low | Ask assistant, Plan, Ready now, Review | none | repeats + and Filters; nothing to read |
| C Pick up where you left off | last items opened | last recipes, Cooked lately | none from the server; browser storage | empty on first visit and a new device |
| D Keys and search | search, key list | search, key list | none | a one-off lesson; no use on touch; Shift+? exists |
| E No pane until needed | lane hidden until a pick | same | none | no width gain at 1280px (list capped at 640px); below about 1224px the list moves on every pick |
| F Recommended: A trimmed + one hint line | Use soon, Running low (2 names each), key line | Ready now (3), Planned (2), Cooked lately (2), key line | none | numbers must equal the list (tested) |

## Recommendation

F for both screens, one shared shell. When nothing needs attention it says today's one line, so no household sees an empty summary. A and B are not the pick (tall, repeating), C can be added under F later, D is covered by Shift+?, E gives nothing on desktop.

## Decisions for the owner

EP-1 direction (recommended F). EP-2 one shared shell (recommended yes). EP-3 calm state: today's line (recommended) or an all-clear sentence. EP-4 key line at the foot (recommended yes). EP-5 "last opened" now (recommended not now).

## Proposals (not the owner's words)

EP-P1 same 400px lane, same tokens and padding as the item panel. EP-P2 block heads apply the same filter Home's tiles do; Planned this week and Cooked lately are labels (no chip exists). EP-P3 a name opens the item in the lane; closing returns the pane and focus to the row. EP-P4 two names per block, three for Ready now, "and N more" is the filter; Use soon sorted by date. EP-P5 Use soon is 7 days or overdue, Running low is the existing low flag (confirm against Home). EP-P6 a count always equals the rows its filter shows. EP-P7 an empty household gets prompts, never a summary. EP-P8 Out items are left out of F (the default list hides them, #329). EP-P9 pantry unreadable: Recipes says so and claims nothing is ready. EP-P10 key line on a keyboard device, "Tap an item to open it." on touch. EP-P11 re-count from the rows when the list changes, no request. EP-P12 F is at most 768px tall at any household size.

## Open questions (recommendation first)

EP-Q1 lazy loading: counts must not come from rows loaded so far; recommended: the server writes the numbers in the same query as the list. Wrong guess: pane and list disagree until you scroll. Settle before building. EP-Q2 One thing short needs a missing count on the row; recommended: leave out of F. EP-Q3 chips for Planned and Cooked lately; recommended: not now. EP-Q4 Use soon window equals Home's. EP-Q5 long panes for large households; recommended: no, "and N more" opens the filter. EP-Q6 C per browser (recommended, no migration) or per person (a table).

## Build impact

No migration, no schema, no new endpoint, no new MCP tool. Replaces the CSS-only text with a small pane in `desktop-layout.ts`, `desktop-css/recipes.ts`, `assets/desktop-pantry.js` and `assets/recipes-desktop.js`. Nothing extra on the default path. The build copies the mockup's markup and CSS first (`.ip`, `.ip-blk`, `.ip-bh`, `.ip-li`, `.ip-act`, `.ip-keys`, `.ip-foot`, `.ip-quiet`).

## Wide tablet

1024px keeps the 400px lane; with touch the key line becomes "Tap an item to open it." and D drops its key list. Below 1024px the lane is not drawn.
