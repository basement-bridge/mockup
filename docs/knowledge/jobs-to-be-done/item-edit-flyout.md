# Editing one item, in a flyout

Handover for whoever drives this next (status, open questions, next steps, process): [../../handover/item-edit-flyout.md](../../handover/item-edit-flyout.md).

Mockup: `fragments/item-edit-flyout/index.html` (options page) and `fragments/item-edit-flyout/pantry.html` (the live host: Pantry list, item flyout, edit and history flyouts, add mode). Live: <https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html>. Builds on [../item-sheet.md](../item-sheet.md) and [../desktop-layout.md](../desktop-layout.md). Everything below is a proposal until the owner confirms. Numbers 63 to 81 continue the list in [plan-desktop.md](plan-desktop.md) (49 to 62).

## Job

I have an item open in Pantry and something about it is wrong or missing: the name, how much, where it lives, when it goes off, whether it is on the list. I want to fix it where I am, without leaving the item, and, if I wonder how it got this way, see who changed what and when.

Owner (voice, 10 Oct 2026, kept close to the words): replace the full-page "Edit item" form with a flyout in the same pattern as the Pantry item flyout; it opens nested beneath the item flyout that is already open, not as a page. The header gets an edit (pencil) icon in place of the hamburger and a new history (clock) icon, next to the close button, with shortcut hints: E for edit, comma for history. "Mark as used up" and "Add to shopping list" stay exactly as the Pantry item sheet has them.

## How we know the person is in this job

An item flyout (desktop) or item sheet (phone) is open and they press the pencil, press E, or tap a tile. History is the clock or the comma.

## What leads

The thing they came to change. The edit flyout opens with the item's name first (a keyboard user lands in it), or on the exact field when they tapped a tile. Every field of the current form is there, none behind a second tab (proposal 71).

## What this job does not need

No new fields: nothing here is invented beyond the form in Kitchie uat 0.70.0 (read only). No photos (the emoji is the picture). No Save button (77). No history for other items, no undo of history, no filters in History (79). No second copy of "Mark as used up" (76).

## Mockup

Layout options differ only in how the same fields are grouped. All three share the header, hints, child slot, History and Add mode.

| Option | Idea | Verdict |
|---|---|---|
| A. One scroll, five groups | Item, Amount, Where, Use by, Shopping list; then the recipe action | Recommended |
| B. Two tabs kept | Details, and Stock and more, as the app has it | Drawn, parity only |
| C. Tiles | Every field a tile; a tap opens one editor with a way back | Drawn, not recommended |

Hint look: show (default) or reveal. See the options page for each at 390, 768, 1024, 1280, 1440 and 1920.

### Field placement (current form to layout A)

| Field (Kitchie 0.70.0) | Where | What changed |
|---|---|---|
| Name, emoji tile | Item: 56px tile ("+" when none, small picker, no photos) and a large name input | Same |
| Quantity | Amount: stepper and unit, or free text with an "Add unit" button | Same |
| Level ("Level: plenty" chip, and a select) | Amount: a drop. Counted items: worked out, read only. Weighed or worded items: four drops to pick | The word chip is gone (owner 8 Oct: level is a drop with no visible name) |
| Minimum stock | Amount, under Quantity, only when there is a unit or a minimum | Moved from "Stock and more" |
| Location, spot, category | Where: an input with visible suggestion pills each | Pills, not a hidden list |
| Use by | Its own group: date in words, Today to 1 month pills, date input, Clear | Same controls |
| Shopping list | One spaced, ruled-off group at the end, once: status line, "How much to buy (optional, in your own words)", "Update the shopping list" or "Add to shopping list" | Was under both tabs with no space above |
| Use in a recipe | A plain action row at the bottom, outside the fields; hidden without Recipes | An action, not a field |
| Mark as used up | Not in the form; the item flyout above still has it | Removed from the form |

### Touch to pointer and keyboard

| Phone and tablet (also with a mouse) | Desktop |
|---|---|
| Item is a half sheet; Edit or History rises as a second, taller sheet (84%) and the item shrinks to a strip | From 1240 the child slides out from beneath the item as a 360px column; from 1024 it tucks under the item header in the same lane |
| Drag a grab handle or the child title bar down to close that layer (pointer events, so a mouse drags the same) | The x, or Ctrl/Cmd Enter: child first, then item. Plain Esc closes nothing |
| Tap the strip or the dim, or Esc, to step back one layer | Click the lit pencil or clock, or press E or comma again |
| A tile tap lands on that field in Edit, highlighted, no on-screen keyboard | Same, and the input takes focus |
| No key hints | E edit, comma history, U, D, S, Z, N add, M, ? list; cue switch hides hints; letters do nothing while typing |

## Decisions 63 to 81

All proposed by the design agent on 10 Oct 2026. None confirmed.

63. Editing is a flyout nested under the open item flyout, never a page. The item stays open, in front and live.
64. One child slot: Edit and History share it. Pencil/E and clock/comma toggle their child; opening one while the other is open swaps.
65. Desktop from 1240: a 360px column beside the item flyout, sliding out from beneath it. From 1024: tucked under the item's header in the lane. It never covers the list or the item. History's slot goes from 320 to 360.
66. Phone and tablet: a stacked 84% sheet over the half sheet; the item collapses to a strip. Tap the strip or dim, drag a handle or title bar down, or Esc to step back.
67. Header order: pencil, turned-back clock, round x. The open child's icon is filled. The phone sheet keeps the no-x rule of 8 October.
68. Hints: a key cap on each icon (default) or on hover and focus; shortcut line reads "E edit" and ", history"; the cue switch hides all; desktop only.
69. Close is Ctrl/Cmd Enter on desktop, Esc on phone, top layer first. Layout C steps back from a field to its tiles first.
70. A tile tap in the item flyout lands in the edit flyout on that field, highlighted.
71. Layout A recommended; the two tabs do not survive; tiles drawn, not recommended.
72. Level is a drop, never a word. Counted: worked out, not editable here. Weighed or worded: four drops. The "Level: plenty" chip and the separate select are gone.
73. Minimum stock sits under Quantity, shown only when the item has a unit or a minimum.
74. Shopping list is one spaced group at the end, once. Copy is the app's. Used up and Add to shopping in the item flyout are unchanged (owner).
75. "Use in a recipe" is a plain action row at the bottom; label and target belong to the Recipe manifest; hidden without Recipes.
76. "Mark as used up" is not repeated in the form.
77. Autosave with a short "Saved". No Save button. Errors on the field with Try again. A name is needed; a use-by date cannot be in the past.
78. Add item is the same form in add mode, in the item flyout's place, with its own footer (Add item, Add and start another, Cancel). New items are Unplaced. No Back, Used up, Shopping list or recipe link in add mode.
79. History is this item only, newest first by day: what changed, when, who, from where. Last 3 days with entries, then 5 more. Edits made on the page appear under Today. Fetched on open.
80. The emoji is a tile with a small picker of foods and "No emoji". No photos.
81. Viewport code lives in its own files: `phone.css`, `tablet.css`, `desktop.css`, `desktop-1240.css`, and one host script per size (`phone.js` or `desktop.js`).

## Open questions

1. Layout A, B or C?
2. Phone: keep no close x on the item sheet (8 Oct) now the header carries two icons?
3. Hint look: show or reveal?
4. History's column from 320 to 360: acceptable?
5. History on the phone sheet too, or desktop only? Drawn on both.
6. The "Estimated" flag: `item-sheet.md` says All fields holds it; the 0.70.0 form read did not show it. Left out. In or out?
7. Should a tile tap open a small inline editor instead of the edit flyout?
8. Is a counted item's level really read only in the form?
9. Where does "Open the list" go (Shopping tab or the sheet), and where does "Use in a recipe" land? Both are toasts here.
10. Add item: new items default to Unplaced (as the desktop Add panel). Keep?

## For the implementation

- The form is shared with Add through `formFields()` in the app. Keep that: add mode is the same fields with a different footer.
- Same class names as the mockup; new names are prefixed `ef-` (or `ib` for header icon buttons). Tokens come from `theme.css` only.
- Load on engagement (DESIGN.md section 6): the form, History and the viewport host are fetched on first use. The default path loads one host script for the size.
- Level for counted items is derived (above twice the minimum Plenty, above it Some, at or under it Running low, 0 Out); weighed or worded items store a label.
- Not checked: the real app, a real device's soft keyboard and drag, screen readers, the Pages URL from the sandbox.
