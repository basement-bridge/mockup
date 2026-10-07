# Item sheet: tapping a pantry row

Status: mockup for the owner to review (8 Oct 2026). Not built in Kitchie. Lines marked **Proposal** are mockup choices where the owner's words were silent; none of them is settled.

Code: `flows/household/app.js` (`itemSheetHtml`, `acts.isheet`, `acts.itile`, `acts.sheetused`, `acts.sheetshop`, `acts.lvl`), `flows/household/styles.css` (`.sheet.half`, `.tiles3`, `.tl`). Options she chose from: `fragments/item-sheet/`.

## What the owner asked for

- Tapping a pantry row opens the item as a half-height bottom sheet that pops up from the bottom, not the full item screen (owner's voice request, 7 Oct 2026).
- Of the four layouts, the owner chose the tile grid (option 2, 8 Oct 2026): icon tiles each showing their value, and tapping a tile gives that editor the sheet, with a back arrow.
- Counted items and level-only items differ (see the fragment): a counted item has an amount that steps; a level-only item has a level you set.
- Used up zeroes the amount and shows Out; nothing is deleted (swipe spec, `pantry-swipe.md`). The sheet's Used up and amount steps behave like the swipe, with the same Undo toast.
- The full item screen stays reachable so no edit is lost.

## What the mockup does

| | Counted (unit is a count) | Level-only (weighed or measured) |
|---|---|---|
| Tiles | Amount, Level, Where, Use by, Category, All fields | Level, Where, Use by, Category, All fields |
| Amount | Stepper (one per tap, the swipe's step) plus unit chooser | no tile |
| Level | Read-only value; tap sets the minimum (Low at or under it) | Out / Low / Plenty |
| Used up | Amount to 0, row shows Out, sheet closes, Undo toast | same |

Where opens Location and Spot. Use by, Category, Minimum and Unit reuse the editors the full item screen uses (`fields/*.js`). Every change autosaves with the short Saved line; a failed save (platform down) shows the same error and Try again. Add to shopping adds the item to the list and closes the sheet; if it is already on the list the button reads "On your list". All fields closes the sheet and opens the full item screen (Back returns to Pantry). Name, Single use and the Estimated flag are edited there.

The minus on the Amount stepper is the left swipe: one off with an Undo toast, and the last one means used up. Plus adds one (or the item's own step).

## Performance (DESIGN.md section 6)

- Default path (tap a row): the sheet is built from state already in memory. No new request, no editor markup.
- Deferred: each tile's editor is its `fields/*.js` file, fetched on the first tap of that tile and cached (Where fetches `place.js`; Amount and Level on a counted item fetch `amounts.js`). Level-only Level needs no file.
- Why this is reasonable: the glance (tiles with values) is what most taps need; editors are a minority, and each file is small.

## Proposals (not from the owner)

- **Above the tab bar.** The sheet and its dim sit above the tab bar so the tabs stay reachable (the fragment drew it that way; the question was left open). Tapping a tab closes the sheet and goes there.
- **Half height, no growing.** Fixed at about half the screen. Dragging the handle down, tapping the dim area, the close button or Escape closes it. Dragging up does nothing: "All fields" is the way to the full screen.
- **Step size.** Counted items step by one, the same as the left swipe (the fragment's proposal).
- **No confirm on Used up.** It matches the swipe (zero, Out, Undo toast). The full screen's confirm and its "you used up several items" guard are not repeated here. Open: does the sheet need the guard?
- **All fields opens today's full item screen**, not the sheet grown to full height.
- **Level on a counted item** is derived (Out at 0, Low at or under the minimum), so its tile edits the minimum rather than the level itself.
- **Level on a level-only item**: Out sets the amount to 0 (same as Used up). Low and Plenty are a stored label that overrides the derived one; coming back from Out restores the amount from before. How Low and Plenty relate to a real amount is open.
- **Counted vs level-only** uses the swipe's rule (count units are counted, weights and volumes are level-only), so a 250 g block of butter has no Amount tile in the sheet. Open: should weighed items keep an Amount tile with a step (50 g, 0.5 kg)? Today the amount is in All fields.
- **Sixth tile reads "More / All fields"** (the fragment's tile said Name / More). The emoji and name sit in the sheet header.
- **Used up item**: its Used up button becomes a disabled "Marked Out"; the Amount tile reads Out in the accent colour. Bringing it back is Undo, or Amount.
