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

### Decided by the owner (voice, 8 Oct 2026)

- The sheet sits **over** the tab bar, so the tabs are covered while it is open ("it's gonna be over").
- Tapping the dimmed background closes it. There is no X: the top-right button is the All fields icon, which opens the whole item editor.
- Quantity steps are whole numbers ("it's one. It's whole numbers") for counted items, the same one as a left swipe. Weighed and measured units use the reference steps already in the mockup: g and mL by 50, kg and L by 0.5, anything else by 1 (`STEP` in `app.js`).
- Heard but not placed: "grow to full height", "drag the handle down", and "confirm on use of none". The mockup keeps drag-handle-down to close and does not grow to full height. Open, below.

### What the sheet shows

- Header: name; quantity line (number plus unit, "Out" at zero); location in bold with the spot after it (Fridge · Door). The All fields icon sits at the top right.
- Tiles, one row of four: Level (the drop), Use by, Minimum, Category.
- Buttons: Used up, and Add to shopping (or On your list).
- Height follows the content (about 244px on a 390px-wide phone), capped at 54% of the screen. **Proposal.**

### Scenarios (what each missing field does)

Status: **Owner** follows from something the owner said; **Proposal** is the mockup's choice and needs sign-off.

| Situation | Header | Tiles | Status |
|---|---|---|---|
| Number and unit, e.g. 12 or 250 g | quantity line shows it | Level drop reflects it | Owner |
| No number (or no unit) | no quantity line; nothing invented | Level tile only | Owner ("Don't make it up") |
| Zero | quantity reads "Out" | empty outline drop; Used up disabled ("Marked Out") | Proposal |
| No location | location line omitted | no tile for it | Proposal |
| Location, no spot (or spot "Anywhere") | location in bold alone | n/a | Proposal |
| Location and spot | **Fridge** · Door | n/a | Owner |
| No use-by | n/a | dashed "Add use-by" | Proposal |
| No minimum | n/a | dashed "Add minimum" | Proposal |
| Minimum set | n/a | shows the value, caption Minimum | Owner (minimum is a tile) |
| No category | n/a | dashed "Add category" | Proposal |
| Counted item, tap Level | n/a | quantity stepper (step 1) and unit chooser | Proposal (step 1 is Owner) |
| Weighed or level-only item, tap Level | n/a | four level choices | Proposal |
| Many fields missing at once | name only, plus whatever exists | up to three dashed tiles; row stays four wide | Proposal |
| Long name, spot or category | wrap or truncate with ellipsis | tiles truncate the value | Proposal |

- **Proposal:** the Level tile opens the quantity editor on a counted item and the level choices otherwise; Minimum is its own editor for every item; the Category tile shows the value alone.
- The quantity line also shows for weighed items. **Proposal** (the owner said "anything that's got a unit").

### Still open

- Grow to full height, and what dragging the handle up should do (the owner said something about full height and then decided on "over").
- "Confirm on use of none": not understood; what is to be confirmed?
- The rule for "Some" between Plenty and Running low on a counted item. The owner said "we'll work out rules".
- Whether an item with no number can get a quantity from the sheet (today only All fields).
- The Undo toast sits 260px up, above the sheet, as a fixed offset.

## Level rules (owner, voice, 8 Oct 2026)

Owner's words: "Level on a counted item is derived. Level on running low is stored as a label. Out is amount always zero." And: "We're not going to have six tiles."

- **Out** means the amount is zero, always, for every item. An item at zero reads Out; marking Out sets the amount to zero (Used up).
- **Counted item** (a count unit such as pack, tin, jar, bag, or no unit): the level is derived from the quantity and the minimum. It is never stored. Any stored label is ignored for these items.
- **Level-only item** (weighed or measured, or anything where a number does not make sense): the level is a stored label (Plenty, Some, Running low), set by the person.
- The mockup now follows this in `level()` in `app.js`. Before, a stored label could override the derived level on a counted item.
- **Proposal:** the derived rule for a counted item is Running low at or under the minimum (or when the use-by is within a week), Some at up to twice the minimum, otherwise Plenty. The owner said rules are still to be worked out.
- **Settled (owner):** "All fields" opens the existing full item screen, not a bigger sheet.
- **Resolved by the level rules above:** an item with both a quantity and a stored label. A counted item always derives its level; a stored label only matters for level-only items.
- **Not understood:** "follow up and load". Left out.
