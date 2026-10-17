# Pantry and Recipes on desktop: what the side panel shows when nothing is picked

Kitchie #867. Owner, voice, 17 October 2026 (Arjan): "Under Pantry and Recipe there is a flyout that is blank. Under Recipe it says 'pick a recipe to see it here'; under Pantry it says 'pick an item to see it here'. That seems pretty ordinary, but what are your design options for that space when something is not picked?"

**Decided on 17 October 2026 (below). Not built.** Mockup `fragments/empty-pane/` (live: https://basement-bridge.github.io/mockup/fragments/empty-pane/), data and timing page `fragments/empty-pane/loading.html`, check `tools/empty-pane-check.mjs` (1231 checks), screenshots `tools/empty-pane-shots.mjs`.

## Decided (owner, voice, 17 October 2026, relayed, lightly cleaned)

Pantry: "Let's go with Use soon and Running low, which should essentially be the same tiles you would borrow from the Home, or at least the information. Because the person is likely to have come straight to Home, you should use that information straight from that rather than reloading it. If they came straight to Pantry, this widget is lazy loaded. You can do what Facebook used to do, some sort of tiny animation of things rolling, although there is no real information to show until it surfaces. If you are loading it for the first time in the Pantry, surface a count first, and then do the spinny animation, a non-item-specific one. Because they are all the same widget shapes, reuse them across all the categories: Use soon, Running low and Out. As soon as the information pops up, just replace that. Count first, the information later. With Use soon, find a way to show if the item is already in a plan. If it is in a plan beyond the use-by date, we need to differentiate that. If it is already in a plan before the use-by date, that is pretty cool; we have to differentiate that too. If it is getting close to its use-by but there is no plan, the idea is to search for a recipe to plan: that is one click. I would rather have things be icons as much as possible. Under Running low, prioritise anything that is not on the shopping list; the call to action is Add to shopping list, and anything already on the shopping list is bumped to the bottom. Out is the same idea."

Recipes: "The flyout of the recipes, Ready now, is perfectly fine. The same lazy-loading behaviour we mentioned for Pantry applies. If you can reuse things, that will be fantastic: the dummy widget, pretty much. Planned this week is great. I would like to have something around newly added recipes. Recently cooked is fantastic."

What that means (EP-D1 to EP-D3):

- Pantry sections: Use soon, Running low, Out. Recipes sections: Ready now, Planned this week, Newly added recipes, Recently cooked. One shared tile and row shape for every section on both screens.
- From Home: use what Home already loaded, no reload, no shimmer for those sections. Straight to the screen: lazy loaded. Each section shows its count first (a grey pill until then), then non-item-specific grey rows (one per row to come, so nothing jumps), then the real rows replace the grey rows the moment they arrive. Reduced motion: the grey rows stand still.
- Use soon plan state, as icons with accessible names and tooltips: planned before the use-by (calendar with a tick, names the meal and the night), planned after the use-by (a different icon, tooltip says so), not planned (a one-click find-a-recipe button that opens the Recipes search with the item typed in; drawn as a sketch).
- Running low and Out: anything not on the shopping list first, each with an Add to shopping list icon button; anything already on the list last, with an on-the-list icon and no add button.
- Icons over words, a small key under the blocks.
- Recipes: "Cooked lately" is now "Recently cooked"; "One thing short" was not chosen and is kept only inside option A as superseded. Newly added: recipe row, a sparkle icon, "Added 3 days ago" as tooltip and sub-line, last 14 days, newest first, two rows; nothing added means one quiet line that offers the assistant.
- Kept from before: shared shell, key line at the foot, today's one line when nothing needs attention, "last opened" (option C) not now.

## Order of Use soon (recommendation)

Closest use-by first, but items already planned in time go to the bottom, because they need nothing from the person. Unplanned and planned-too-late rows stay on top, soonest first (planned-too-late still needs them).

## Data source and timing (mock numbers; a build shows each section the moment its data lands)

| Arrived | 0 ms | about 250 ms | about 900 ms on |
|---|---|---|---|
| From Home | sections Home holds are drawn at once | the others show count, then grey rows | their rows replace the grey |
| Straight here | heads with a grey pill each | counts, one grey row per row to come | rows replace the grey, each when its data is in |

Counts always come from the server in the same query as the list, or from Home's handed-over data; never from the rows loaded so far. No request of any kind is made when it came from Home for the sections Home holds. An empty household needs no shimmer; zero counts everywhere settle on today's one line.

## Today

From 1024px, the Pantry and Recipes keep a 400px lane that is empty until a row is picked. The only content is one muted line drawn by CSS (`::after` in `server/src/desktop-layout.ts` and `server/src/desktop-css/recipes.ts`). No JavaScript, no request.

## The six options (A to E were not chosen; F is decided)

| | Pantry | Recipes | Weak |
|---|---|---|---|
| A At a glance | Your kitchen, Use soon, Running low, Out | Ready now, One thing short (superseded), Planned this week, Recently cooked | tallest (838px in a large household) |
| B Things to do | Add, Scan a receipt, going off, running low | Ask assistant, Plan, Ready now, Review | repeats + and Filters |
| C Pick up where you left off | last items opened | last recipes | empty on first visit and a new device |
| D Keys and search | search, key list | search, key list | a one-off lesson; no use on touch |
| E No pane until needed | lane hidden until a pick | same | no width gain at 1280px |
| F Decided | Use soon, Running low, Out (shared tile), key line | Ready now, Planned this week, Newly added, Recently cooked, key line | numbers must equal the list (tested) |

## Proposals (not the owner's words)

EP-P1 same 400px lane, same tokens and padding as the item panel. EP-P2 a head with a filter applies the same filter Home's tiles do (Use soon, Running low, Out, Ready now); Planned this week, Newly added and Recently cooked are labels (no chip exists). EP-P3 a name opens the item in the lane; closing returns the pane and focus to the row. EP-P4 three rows for Use soon, Running low, Ready now, two for the rest, "and N more" is the filter. EP-P5 Use soon window is Home's. EP-P6 a count always equals the rows its filter shows. EP-P7 an empty household gets prompts, never a summary. EP-P8 superseded: Out is now shown (owner). EP-P9 pantry unreadable: Recipes says so and claims nothing is ready. EP-P10 key line on a keyboard device, "Tap an item to open it." on touch. EP-P11 re-count from the rows when the list changes. EP-P12 the first two sections are at most 768px from the top. EP-P13 Use soon order above. EP-P14 three plan states, three icons, each named; only not-planned is a button. EP-P15 Add to shopping list changes the row at once, the count stays, a short toast says so; no new write. EP-P16 Newly added is 14 days, newest first, two rows, one quiet line when empty. EP-P17 grey rows keep the pane's height (within 12px), static with reduced motion. EP-P18 a one-line icon key.

## Open questions (recommended answer first)

- EP-Q1 What is "Running low and not on the list"? Home's Running low rows are the shopping list's own low entries (`LOW_REASONS`, `home.ts`), so all are on the list, and an entry the household took off drops out. Recommended: the pane's Running low and Out come from the item's stock level and are then marked on-the-list by name. Wrong guess: Add never appears.
- EP-Q2 How much does Home hand over? Three rows per tile, no plan state, no whole-list count. Recommended: Home's page also embeds each section's full count and, for Use soon, each row's plan state and list state (same queries, no schema); anything missing falls back to the lazy path.
- EP-Q3 Newly added needs an added-at date. Recipe's `list_families` (authoring contract 3.6) returns families newest first with no date per row; `get_family` has `family.created_at`; Kitchie's reader of the list takes none. Recommended: ask Recipe to add `created_at` to each list entry (additive; no Kitchie schema change); until then show the newest two by order with no date and no 14-day window.
- EP-Q4 What does the find-a-recipe icon open? Recommended: the Recipes search in the lane with the item as the first search word (sketched); Plan opens the existing Plan it flyout. Alternative: Plan it with suggestions.
- EP-Q5 Bring "One thing short" back? Recommended: no.

## Build impact

No migration, no Kitchie schema change, no new table, no new MCP tool. Reuses from Home: the on-the-way-out query and window (`SOON_WITHIN_DAYS`), the shopping-list low entries and `lowKeys`, the row look (`lrow`), the filters Home's heads already open (`?show=useby`, `?show=low`), and the shared lazy loader and "taking too long" toast (Kitchie #868). Adds: one small read for the lazy path after first paint (counts and rows per section), the plan state per Use soon row (plan night against use-by, from the plan the server already holds), a list state per low or out row, and an Out head filter. Recipes: Newly added needs `created_at` on Recipe's list entries (EP-Q3); Recently cooked uses `last_cooked_days`, already returned. Replaces the CSS-only text in `desktop-layout.ts` and `desktop-css/recipes.ts`; the build copies the mockup's markup and CSS first (`.ip`, `.ip-blk`, `.ip-bh`, `.or`, `.ip-ib`, `.ip-n`, `.sk-r`, `.ip-leg`).

## Wide tablet

1024px keeps the 400px lane; with touch the key line becomes "Tap an item to open it." Below 1024px the lane is not drawn.
