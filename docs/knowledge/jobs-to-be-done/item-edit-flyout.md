# Editing one item, in a flyout

Handover for whoever drives this next (status, open questions, next steps, process): [../../handover/item-edit-flyout.md](../../handover/item-edit-flyout.md).

Mockup: `fragments/item-edit-flyout/index.html` (options page) and `fragments/item-edit-flyout/pantry.html` (the live host: Pantry list, item flyout, edit and history flyouts, add mode). Live: <https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html>. Builds on [../item-sheet.md](../item-sheet.md) and [../desktop-layout.md](../desktop-layout.md). Everything below is a proposal until the owner confirms. Numbers 63 to 81 continue the list in [plan-desktop.md](plan-desktop.md) (49 to 62).

## Job

I have an item open in Pantry and something about it is wrong or missing: the name, how much, where it lives, when it goes off, whether it is on the list. I want to fix it where I am, without leaving the item, and, if I wonder how it got this way, see who changed what and when.

Owner (voice, 10 Oct 2026, kept close to the words): replace the full-page "Edit item" form with a flyout in the same pattern as the Pantry item flyout; it opens nested beneath the item flyout that is already open, not as a page. The header gets an edit (pencil) icon in place of the hamburger and a new history (clock) icon, next to the close button, with shortcut hints: E for edit, comma for history. "Mark as used up" and "Add to shopping list" stay exactly as the Pantry item sheet has them.

## How we know the person is in this job

An item flyout (desktop) or item sheet (phone) is open and they press the pencil, press E, or tap a tile. History is the clock or the comma.

## What leads

The thing they came to change. The edit flyout opens with the item's name first (a keyboard user lands in it), or on the exact field when they tapped a tile. Every field of the current form is there, none behind a second tab (confirmed 71).

## What this job does not need

No new fields: nothing here is invented beyond the form in Kitchie uat (read only; 0.70.0 on 10 Oct, the 11 Oct state of `uat` for round 2). No photos (the emoji is the picture). No Save button (77). No history for other items, no undo of history, no filters in History (79). No second copy of "Mark as used up" (76).

## Mockup

Layout A is confirmed (decision 71). The two tabs (B) and the tiles (C) were drawn on 10 Oct and dropped by the owner on 11 Oct; their code is removed from the fragment and is in the git history (PR 72, squash eb35f8f). The hint look is "shown on the icons" (confirmed 68); the reveal look is still reachable with `hint=reveal` for reference only. See the options page for each at 390, 768, 1024, 1280, 1440 and 1920.

| Option | Idea | Verdict |
|---|---|---|
| A. One scroll, five groups | Item, Amount, Where, Use by, Shopping list; then the recipe action | Confirmed 11 Oct 2026 |
| B. Two tabs kept | Details, and Stock and more, as the app has it | Dropped by the owner |
| C. Tiles | Every field a tile; a tap opens one editor | Dropped by the owner |

### Field placement (current form to layout A)

| Field (Kitchie uat) | Where | What changed |
|---|---|---|
| Name, emoji tile | Item: 56px tile ("+" when none) and a large name input; the picker opens under them | Picker has search, Recent and "No emoji" (80, 93); the same in Add |
| Quantity | Amount: stepper and unit, or free text with an "Add unit" button; a small Clear beside the label | Clear is new, so a quantity can be removed (89) |
| Level ("Level: plenty" chip, and a select) | Amount: four battery icons, the current one picked, with a muted "Automatic" or "Set by you" cue where rules apply | Always editable; the override rule (82 to 86). The word chip is gone (owner 8 Oct) |
| Minimum stock | Amount, under Quantity, only when there is a unit or a minimum | Moved from "Stock and more" |
| Location, spot | Where: text inputs with a suggestion list, as the Add form | Not pills (90) |
| Category | Where: the same input, its suggestions drawn as the chip row of the Pantry filter bar | Proposed (91); `cat=list` for the plain list |
| Use by | Its own group: date in words, Clear, and +3 days, +5 days, +1 week, Pick date... | The Add form's quick choices (92) |
| Shopping list | One spaced, ruled-off group at the end, once: status line, how much to buy (a number in the item's unit when the item has a quantity, else the own-words box), "Update the shopping list" or "Add to shopping list" | Two states (87 to 89) |
| Use in a recipe | A plain action row at the bottom, outside the fields; hidden without Recipes | An action, not a field |
| Mark as used up | Not in the form; the item flyout above still has it | Removed from the form |

### Touch to pointer and keyboard

| Phone and tablet (also with a mouse) | Desktop |
|---|---|
| Item is a half sheet; Edit or History rises as a second, taller sheet (84%) and the item shrinks to a strip | From 1240 the child slides out from beneath the item as a 360px column; from 1024 it tucks under the item header in the same lane |
| Drag a grab handle or the child title bar down to close that layer (pointer events, so a mouse drags the same) | The x, or Ctrl/Cmd Enter: child first, then item. Plain Esc closes nothing |
| Tap the strip or the dim, or Esc, to step back one layer (an open suggestion list or emoji picker closes first) | Click the lit pencil or clock, or press E or comma again |
| A tile tap lands on that field in Edit, highlighted, no on-screen keyboard | Same, and the input takes focus |
| No key hints | E edit, comma history, U, D, S, Z, N add, M, ? list; cue switch hides hints; letters do nothing while typing |

## Round 2 (owner, typed, 11 Oct 2026)

Confirmed: layout A (71); key hints shown on the icons (68). One line in the owner's note, "LAYOUT OF THE FIELDS: THE REAL CHOICE - Reveal", looks pasted from the options page's labels; it is read as a heading, not a vote, and is open question 1.

Requested changes, all drawn and all proposed until he looks: (1) level as a battery with the same colour bands, always editable, with the override rule (82 to 86); (2) the Shopping list group in two states (87 to 89); (3) Location, Spot and Category as the Add form's controls, Use by with its quick choices (90 to 92); (4) one working emoji picker for Edit and Add (93, extending 80).

Where the owner's wording was ambiguous the most plausible reading was drawn and marked proposed (open questions 3 to 12).

**Source for round 2.** Kitchie `uat` was read, not run and not changed: `server/src/add-form.ts` (`formFields()`, the fields and the `list=` datalists), `server/src/assets/form.js` (the combobox, the spot-belongs-to-a-location rules, the use-by pills, the emoji) and the `uat` category code (`categories.ts`: starter list, folding onto the household's own spelling). The owner's two screenshots show the Pantry filter bar (a tag icon, chips, a chevron: the shared curtain in `curtain.js`) and the Add form (small-caps labels, text inputs, `Optional`, `+3 days +5 days +1 week Pick date...`). A third screenshot of the old Edit page (11 Oct) shows the "Level: plenty · said by you" chip this replaces; "said by you" is the app's `by: "user"` provenance, which is what "Set by you" below maps to.

## Decisions 63 to 93

Status in brackets. Confirmed means the owner, 11 Oct 2026.

63. (proposed) Editing is a flyout nested under the open item flyout, never a page. The item stays open, in front and live.
64. (proposed) One child slot: Edit and History share it. Pencil/E and clock/comma toggle their child; opening one while the other is open swaps.
65. (proposed) Desktop from 1240: a 360px column beside the item flyout, sliding out from beneath it. From 1024: tucked under the item's header in the lane. It never covers the list or the item. History's slot goes from 320 to 360.
66. (proposed) Phone and tablet: a stacked 84% sheet over the half sheet; the item collapses to a strip. Tap the strip or dim, drag a handle or title bar down, or Esc to step back.
67. (proposed) Header order: pencil, turned-back clock, round x. The open child's icon is filled. The phone sheet keeps the no-x rule of 8 October.
68. (**confirmed 11 Oct 2026**, owner: key hints shown on the icons) A key cap on each icon; shortcut line reads "E edit" and ", history"; the cue switch hides all; desktop only. The reveal look is no longer the plan.
69. (proposed) Close is Ctrl/Cmd Enter on desktop, Esc on phone, top layer first. (The "step back from a field to its tiles" clause went with the tiles layout.)
70. (proposed) A tile tap in the item flyout lands in the edit flyout on that field, highlighted.
71. (**confirmed 11 Oct 2026**, owner) Layout A: one scroll in five groups. The two tabs do not survive; the tiles layout (C) is dropped.
72. (**superseded 11 Oct 2026** by 82 to 86; kept as history) Level is a drop, never a word. Counted: worked out, not editable here. Weighed or worded: four drops. The "Level: plenty" chip and the separate select are gone. The parts that stand: no level word on screen, no chip and select.
73. (proposed) Minimum stock sits under Quantity, shown only when the item has a unit or a minimum.
74. (proposed; restated by the owner 11 Oct and refined by 87 to 89) Shopping list is one spaced group at the end, once. Used up and Add to shopping in the item flyout are unchanged (owner).
75. (proposed) "Use in a recipe" is a plain action row at the bottom; label and target belong to the Recipe manifest; hidden without Recipes.
76. (proposed) "Mark as used up" is not repeated in the form.
77. (proposed) Autosave with a short "Saved". No Save button. Errors on the field with Try again. A name is needed; a use-by date cannot be in the past.
78. (proposed) Add item is the same form in add mode, in the item flyout's place, with its own footer (Add item, Add and start another, Cancel). New items are Unplaced (an empty Location box). No Back, Used up, Level, Shopping list or recipe link in add mode.
79. (proposed) History is this item only, newest first by day: what changed, when, who, from where. Last 3 days with entries, then 5 more. Edits made on the page appear under Today. Fetched on open.
80. (**confirmed in substance 11 Oct 2026**: the owner asked for this tile and picker in both Add and Edit because the real app's emoji is broken; extended by 93) The emoji is a tile with a picker and "No emoji". No photos.
81. (proposed) Viewport code lives in its own files: `phone.css`, `tablet.css`, `desktop.css`, `desktop-1240.css`, and one host script per size (`phone.js` or `desktop.js`).
82. (proposed; owner-requested 11 Oct; supersedes 72) Level is one picker of four icons for every item (counted, weighed, worded). The current level is always the picked one. The level is always editable by the person. A counted item's level is worked out (automatic) by default; a weighed or worded item's is picked.
83. (proposed; owner-requested 11 Oct; recommended) The level icon is a battery, four cells, in the same colour bands as the drop and the existing level colours (`--cue` green Plenty, `--accent` amber Some, `--danger` red Running low, `--out` black Out): 4, 2, 1 and 0 cells filled. It replaces the drop in this flyout's form and in the item flyout's level tile so the two agree. The 8 October drop rule makes this a real choice, so the drop stays reachable (`lv=drop`) and every other screen keeps the drop until the owner says otherwise. No level word on screen either way (screen-reader text only).
84. (proposed) Automatic rules: a counted item, or any item with a number and a minimum, has its level worked out: more than twice the minimum is Plenty, more than the minimum and up to twice it is Some, at or under it is Running low, 0 is Out; counted with no minimum is Plenty until 0. A weighed item with a minimum follows the same rules (a reading of the owner's note, open question 3). A worded item, or a weighed one with no minimum, keeps the label the person picked and has no automatic mode.
85. (proposed; the owner's rule as drawn) Override: when the person picks a level on an item that has automatic rules, the pick wins over the rules and shows everywhere (item flyout tile, header). When the quantity is next revised (stepper, typed number, unit change, use one, used up, clear) the pick is dropped and the rules take over again, until the next pick. Changing the minimum or any other field keeps the pick. Out is the amount at 0; picking another level restores the amount from before; adding stock after Out hands the level back to the rules. If a change leaves no rules to apply (the minimum cleared on a weighed item, a counted item turned into a weighed one), the level that was showing is kept as the stored label so it never jumps.
86. (proposed) A small muted cue under the picker: "Automatic" or "Set by you", only where rules apply, with a small back-to-automatic icon beside "Set by you". No chip, no sentence; a tooltip explains. Maps to the app's `by` provenance (`user` is "Set by you").
87. (proposed; refines 74) The Shopping list group starts with a status line: "Not on the shopping list." or "On the shopping list: 2 L." with Open the list; then how much to buy; then the button "Add to shopping list" or "Update the shopping list".
88. (proposed) When the item has a weighed or counted quantity, "How much to buy" is a number stepper in the item's own unit, starting from what the household has (the amount, else the amount before it ran out, else 1). The own-words box is not shown; a one-line note says to clear the quantity to use it. The list stores the words ("2 L").
89. (proposed) When the item has no weighed or counted quantity (nothing, or words such as "a big handful"), the own-words box shows. Clearing the quantity (a new Clear beside the Quantity label) brings it back, so a person with a quantity can still update with free text.
90. (proposed; owner: match the Add form) Location and Spot are text inputs with a suggestion list that opens on focus or click, filters as you type, takes a new word, and closes with Esc without closing the sheet (arrow keys and Enter pick). The spot list is the location's spots, or every spot with its location named when there is no location; choosing one fills the location in; changing the location clears the spot; typed words take the household's own spelling when they match. Replaces the suggestion pills of 10 Oct. Same in Add.
91. (proposed assumption) Category is the same input with its suggestions drawn as the chip row of the Pantry filter bar: tag icon, bare chips, the chosen one outlined, a chevron showing the rest. No "All" chip; tapping the chosen chip clears it; typing filters the chips and Enter adds a new category. `cat=list` draws the plain list instead. The first screenshot is the Pantry's filter bar, so this is a guess at what was meant.
92. (proposed) Use by keeps the date in words and Clear, and takes the Add form's quick choices: +3 days, +5 days, +1 week, Pick date.... The 10 Oct Today, Tomorrow, 2 weeks and 1 month pills are dropped.
93. (proposed; extends 80) The emoji picker, in Edit and Add, has a search box, a Recent row (the last 8 picked on this device, starting from the emoji already on the household's items), a grid of about 126 foods and kitchen things, and "No emoji" once one is set. Esc closes the picker only. Its list (`emoji.js`) is fetched on the first open.

## Open questions

New (11 Oct 2026):

1. The line "LAYOUT OF THE FIELDS: THE REAL CHOICE - Reveal" in the owner's note: read as pasted from the options page. Decision 68 is "shown on the icons". Confirm, or say if reveal was meant.
2. Battery everywhere the level icon is drawn (item sheet, list rows, Plan), or only in this flyout? Recommended: everywhere, so no screen disagrees. Today only this flyout and its item-flyout tile use it.
3. Should a weighed item with a minimum also have its level worked out (84)? Wrong guess: weighed items are pick-only again, with no cue.
4. "The level then follows the user's pick relative to the rules against the minimum level when a minimum is set": read as the pick wins and shows until the quantity changes. Other reading: the pick is judged against the minimum. Which?
5. What counts as the quantity being revised (stepper, typed, unit, use one, used up, clear) and that a minimum change keeps the pick.
6. Does a picked level feed the shopping list (running low or out), or is it display only? Drawn as display only.
7. The small back-to-automatic icon: wanted?
8. The default amount to buy is what you have now. Top up to twice the minimum, or the gap to the minimum, instead?
9. The own-words box shows only after the quantity is cleared, as asked. A small "say it in your own words" link would avoid clearing the stock quantity. Add it?
10. Category chip row: is that what the first screenshot meant? No "All" chip and no drag bar are drawn.
11. Use by: the Add form's pills replaced Today, Tomorrow, 2 weeks, 1 month. Keep the old ones as well?
12. Emoji: only the picker's foods and kitchen things are offered; the phone's own emoji keyboard used to allow any emoji. Allow typing or pasting any emoji too?

Still open from 10 Oct:

13. Phone: keep no close x on the item sheet (8 Oct) now the header carries two icons?
14. History's column from 320 to 360: acceptable?
15. History on the phone sheet too, or desktop only? Drawn on both.
16. The "Estimated" flag: `item-sheet.md` says All fields holds it; the form read did not show it. Left out. In or out?
17. Should a tile tap open a small inline editor instead of the edit flyout?
18. Where does "Open the list" go (Shopping tab or the sheet), and where does "Use in a recipe" land? Both are toasts here.
19. Add item: new items default to Unplaced (an empty Location box). Keep?

Answered on 11 Oct: layout A, B or C (was 1: A); hint look (was 3: shown); a counted item's level read only (was 8: no, it is editable).

## For the implementation

- The form is shared with Add through `formFields()` in the app. Keep that: add mode is the same fields with a different footer.
- Same class names as the mockup; new names are prefixed `ef-` (or `ib` for header icon buttons). Tokens come from `theme.css` only.
- Load on engagement (DESIGN.md section 6): the form, History and the viewport host are fetched on first use. The default path loads one host script for the size.
- Level: see 84 and 85. The mockup keeps the pick as `lvSet` on the item and drops it on a quantity revision; in the app this is the level's `by` (`user` = "Set by you") plus the existing rule that a new quantity resets it. Chat tools and the UI must call the same service method for the level and for the quantity (standing rule).
- Location, Spot and Category: reuse the Add form's `combo()` in `assets/form.js`; the mockup's classes (`combo-wrap`, `combo`, `hint`) are the app's. The chip row is new markup (`ef-cats`, `ef-chip`); the app's Pantry filter curtain (`curtain.js`) could be reused instead of a second implementation (one code path per feature).
- Emoji: replace the app's emoji box with the tile and picker (80, 93) for Add and Edit through the shared `formFields()`; the app's emoji box (a one-character input with a datalist) is what is broken.
- The shopping list stores words (`quantity_text`), so the stepper's "2 L" is written as words; the status line and the button use the existing shopping service.
- Not checked: the real app, a real device's soft keyboard and drag, screen readers, Safari and Firefox, the Pages URL from the sandbox. Checked in headless Chromium: `tools/item-edit-flyout-check.mjs`.
