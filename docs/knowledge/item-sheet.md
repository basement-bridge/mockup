# Item sheet: tapping a pantry row

Status: mockup for the owner to review (8 Oct 2026). Not built in Kitchie. Lines marked **Proposal** are mockup choices where the owner's words were silent; none of them is settled.

Code: `flows/household/app.js` (`itemSheetHtml`, `acts.isheet`, `acts.itile`, `acts.sheetused`, `acts.sheetshop`, `acts.lvl`), `flows/household/styles.css` (`.sheet.half`, `.tiles3`, `.tl`). Options she chose from: `fragments/item-sheet/`.

## What the owner asked for

- Tapping a pantry row opens the item as a half-height bottom sheet that pops up from the bottom, not the full item screen (owner's voice request, 7 Oct 2026).
- Of the four layouts, the owner chose the tile grid (option 2, 8 Oct 2026): icon tiles each showing their value, and tapping a tile gives that editor the sheet, with a back arrow.
- Counted items and level-only items differ (see the fragment): a counted item has an amount that steps; a level-only item has a level you set.
- Used up zeroes the amount and shows Out; nothing is deleted (swipe spec, `pantry-swipe.md`). The sheet's Used up and amount steps behave like the swipe, with the same Undo toast.
- The full item screen stays reachable so no edit is lost.
- Follow-up (8 Oct 2026, owner's voice): "the drop icon should take the shape of the level, fuller or emptier; plenty is one colour, some is amber, running low is red, out is black; no visible level name, only hidden screen-reader text; counted items keep the quantity number visible; a tile with data looks filled, a tile with no data, for example no use-by, looks empty, a dashed outline and a quiet prompt, and its action is what drives it." Weighed items stay level-only.

## What the mockup does

| | Counted (unit is a count) | Level-only (weighed or measured) |
|---|---|---|
| Tiles | Amount (with the level drop), Where, Use by, Category, All fields | Level (the drop alone), Where, Use by, Category, All fields |
| Amount | Stepper (one per tap, the swipe's step) plus unit chooser | no tile |
| Level | Drop beside the number; the Amount editor also sets "Running low at or under" | Four drops to pick: Out, Running low, Some, Plenty |
| Used up | Amount to 0, row shows Out, sheet closes, Undo toast | same |

Where opens Location and Spot. Use by, Category, Minimum and Unit reuse the editors the full item screen uses (`fields/*.js`). Every change autosaves with the short Saved line; a failed save (platform down) shows the same error and Try again. Add to shopping adds the item to the list and closes the sheet; if it is already on the list the button reads "On your list". All fields closes the sheet and opens the full item screen (Back returns to Pantry). Name, Single use and the Estimated flag are edited there.

The minus on the Amount stepper is the left swipe: one off with an Undo toast, and the last one means used up. Plus adds one (or the item's own step).

## Level drop and tiles (owner's follow-up)

| Level | Drop | Colour token |
|---|---|---|
| Plenty | full | `--cue` (green) |
| Some | about half | `--accent` (amber) |
| Running low | about a quarter | `--danger` (red) |
| Out | empty outline | `--out` (new, see Proposals) |

No level word is drawn anywhere in the sheet. Each level's name is screen-reader text only (`.sr-only`, now in `shared.css` and `flows/household/styles.css`). A counted item keeps its quantity ("2 bag") visible beside the drop. A level-only item shows the drop alone.

A tile with data is filled (tinted surface, accent border) and shows its value with a small label. A tile with no data (no use-by, no category) is empty: dashed outline, a plus and a quiet prompt ("Add use-by"). Tapping it opens the editor, which is how it gets filled. "All fields" is a plain tile (it is an action, not data).

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
- **Level on a counted item** is derived: Out at 0, Running low at or under the minimum (or the existing running-low rule), Some at up to twice the minimum, otherwise Plenty. There is no separate Level tile for counted items: the drop sits in the Amount tile beside the number, and the Amount editor holds the minimum ("Running low at or under"). This drops the fragment's separate Level tile for counted items.
- **Level on a level-only item**: Out sets the amount to 0 (same as Used up). Running low, Some and Plenty are a stored label that overrides the derived one; coming back from Out restores the amount from before. How they relate to a real amount is open.
- **`--out` token** (new in `theme.css`): the owner said Out is black. Black vanishes on the dark theme, so Kitchie Night uses a mid grey (#8A9A91) and Kitchie Day near-black (#111815). Themes that do not define it fall back to the text colour. Open: is grey acceptable on dark, or should Out get a filled disc behind it?
- **Hidden level picker**: the four-way picker shows only drops (no words), the chosen one ringed.
- **Some** is a fourth level the owner named; it did not exist before. Its amber is the same as the accent.
- **Counted vs level-only** uses the swipe's rule (count units are counted, weights and volumes are level-only), so a 250 g block of butter has no Amount tile in the sheet. Open: should weighed items keep an Amount tile with a step (50 g, 0.5 kg)? Today the amount is in All fields.
- **Last tile reads "More / All fields"** (the fragment's tile said Name / More). The emoji and name sit in the sheet header.
- **Used up item**: its Used up button becomes a disabled "Marked Out"; the Amount tile reads Out in the accent colour. Bringing it back is Undo, or Amount.

## Header, tiles and the way into All fields (owner, voice, 8 Oct 2026)

Owner's words, in the order he said them, last word wins:
- The quantity goes just under the item name, "only if there is quantity mentioned. Don't make it up." It is "anything that's got a unit", not only counted items.
- Location and spot go "under the quantity" in the header (an earlier moment had location as its own tile; the later statement replaces it).
- "I want to reduce the tiles to only important things. Level is fine. Use by is fine. And the minimum level is fine." Category stays (confirmed by voice with "that's fine").
- "All fields" is not a big tile: "I would find an icon that would look like more fields", the same full editor that already exists. Tapping outside the sheet closes it.
- The sheet should "be economic about how much space we are using". Whether it sits over or above the tab bar stays open.
- The owner asked for the scenarios to be thought through so the handover for build is clear (table below).

### What the sheet shows

- Header: name; quantity line (number plus unit, "Out" at zero); location in bold with the spot after it (Fridge · Door). A small list icon (All fields) and the close button sit at the right.
- Tiles, one row of four: Level (the drop), Use by, Minimum, Category.
- Buttons: Used up, and Add to shopping (or On your list).
- Height follows the content (about 244px on a 390px-wide phone), capped at 54% of the screen. **Proposal.**

### Scenarios (what each missing field does)

| Situation | Header | Tiles |
|---|---|---|
| Number and unit, e.g. 12 or 250 g | quantity line shows it | Level drop reflects it |
| No number (or no unit) | no quantity line; nothing invented | Level tile only |
| Zero | quantity reads "Out" | drop is the empty outline; Used up disabled ("Marked Out") |
| No location | location line omitted | no tile for it |
| Location, no spot (or spot "Anywhere") | location bold alone | n/a |
| Location and spot | **Fridge** · Door | n/a |
| No use-by | n/a | Use by tile is dashed: "Add use-by" |
| No minimum | n/a | Minimum tile is dashed: "Add minimum" |
| Minimum set | n/a | Minimum tile shows value, e.g. 4 with caption Minimum |
| No category | n/a | Category tile is dashed: "Add category" |
| Counted item, tap Level | n/a | opens the quantity stepper and unit chooser |
| Weighed or level-only item, tap Level | n/a | opens the four level choices (Plenty, Some, Running low, Out) |
| Many fields missing at once | name only, plus whatever exists | up to three dashed tiles; the row stays four wide |
| Long name, spot or category | name and location wrap or truncate with ellipsis; no overflow | tiles truncate their value |

- **Proposal:** the Level tile opens the quantity editor on a counted item (the quantity is the data; the level follows from it) and the level choices otherwise.
- **Proposal:** Minimum is its own editor (the existing running-low stepper) for every item, including weighed ones, which no longer need All fields for it.
- **Proposal:** the Category tile shows the value alone, with no caption. An empty one reads "Add category".

### Still open

- Over or above the tab bar, and whether dragging the sheet up reaches the full screen.
- What the Level tile should do when an item has both a quantity and a manual level (today the quantity wins).
- Which rule makes "Some" (between Plenty and Running low) for a counted item. The owner said "we'll work out rules".
- Whether a missing-number item should offer a way to add a quantity from the sheet (today only All fields does).
