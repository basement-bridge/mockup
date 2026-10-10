# Editing one item, in a flyout

Handover for whoever drives this next (status, open questions, next steps, process): [../../handover/item-edit-flyout.md](../../handover/item-edit-flyout.md).

Mockup: `fragments/item-edit-flyout/index.html` (options page) and `fragments/item-edit-flyout/pantry.html` (the live host: Pantry list, item flyout, edit and history flyouts, add mode). Live: <https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html>. Builds on [../item-sheet.md](../item-sheet.md) and [../desktop-layout.md](../desktop-layout.md). Everything below is a proposal unless marked confirmed. Numbers 63 to 101 continue the list in [plan-desktop.md](plan-desktop.md) (49 to 62). 94 to 101 are new on 11 Oct 2026 (round 3, the owner's voice answers).

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
| Quantity, unit | Amount: stepper, a Unit box, and a row of unit quick-pick chips under it (g, kg, mL, L, the count units, No unit, any unit already used); or free text with an "Add unit" button; a small Clear beside the label | Clear is new, so a quantity can be removed (89). Unit is a chip row plus free text (98) |
| Level ("Level: plenty" chip, and a select) | Amount: four battery icons, the current one picked, with a muted "Automatic" or "Set by you" cue on every item that has a number | Always editable; the override rule (82 to 86, 95, 96). The word chip is gone (owner 8 Oct). The battery is the level icon everywhere (94) |
| Minimum stock | Amount, under Quantity, only when there is a unit or a minimum | Moved from "Stock and more" |
| Location, spot | Where: text inputs with a suggestion list, as the Add form | Not pills (90) |
| Category | Where: a text box with the chip row of the Pantry filter bar under it; any word not in the list is typed | Confirmed 11 Oct (91), extended with free text (97); `cat=list` stays for reference |
| Use by | Its own group: date in words, Clear, and +3 days, +5 days, +1 week, Pick date... (the same set in Edit and Add) | The Add form's quick choices (92, confirmed 11 Oct) |
| Shopping list | One spaced, ruled-off group at the end, once: status line, how much to buy (a number in the item's unit when the item has a quantity, starting at the top-up to twice the minimum when there is one; else the own-words box), "Update the shopping list" or "Add to shopping list" | Two states (87 to 89); default amount (99) |
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

## Round 3 (owner, voice, 11 Oct 2026)

The owner answered the round 2 questions by voice. Quoted closely; each is confirmed ("confirmed, owner voice 11 Oct 2026") and is drawn in the mockup. Where an earlier decision is replaced it is named, and its text below stays as history.

1. The battery replaces the drop everywhere the level is drawn (item list rows, Pantry and item sheet, Plan, filters, the flyout). A visual swap: same colour bands, text and aria labels kept. Confirms 83, replaces its "battery here only" recommendation (94).
2. The four-band rule applies to counted and weighed items that have a minimum. Confirms 84.
3. An item with no minimum, counted or weighed, is Plenty above zero and Out at zero, with no bands between; the person can hand-set Some or Running low. Refines 84 (95).
4. A hand-set level goes back to automatic only when the quantity next increases. A decrease never clears it. Replaces 85's "any quantity change drops the pick" (96).
5. Shopping list default buy amount: with a minimum, aim for double the minimum. Replaces 88's default and open question 8 (99).
6. Category: chip row plus free text for anything not in the list. Confirms 91, extends it (97). Unit: quick-pick plus free text (98). Location and Spot unchanged.
7. Use by quick buttons in Edit and Add: the exact set of the current `uat` Add form (+3 days, +5 days, +1 week, Pick date...). Confirms 92.
8. A hand-set level looks identical to a calculated one everywhere; the "Automatic / Set by you" cue stays only inside the edit flyout. It never adds the item to the shopping list; the manual add stays an explicit action; the level is not fed into shopping logic. Confirms the display-only answer to open questions 6 and 7 (100, 101).
9. Hint style "shown" on the icons: decision 68, confirmed; checked in the fragment, left as it is.

**Where the battery is, in this repo.** Drawn as a level icon in `fragments/item-edit-flyout/` (flyout tile, picker), `flows/household/` (item sheet tile and level picker; the full item screen's Level row icon) and `fragments/item-sheet/` (the four reference layouts; their symbol only). Changed mechanically in all three. The item list rows, the Plan screens and the filters do not draw a level icon in any mockup here (rows show text and a use-by hint; Plan draws no level), so there was nothing to swap; the build should use the one battery wherever it draws a level. Left as they are, because they draw a word, not a drop: `fragments/desktop/` (the older desktop Pantry's Level tile says "Plenty" in words; it is superseded by `fragments/item-edit-flyout/` as the live host), and the text pills in `fragments/item-row-axes/`, `fragments/multi-location/` and `fragments/shopper-link/` (words on option sketches).

## Decisions 63 to 101

Status in brackets. Confirmed means the owner, 11 Oct 2026 (the first lot by typed note, the 94 to 101 lot by voice). History is kept: a replaced decision stays, marked superseded, with the number that replaces it.

63. (proposed) Editing is a flyout nested under the open item flyout, never a page. The item stays open, in front and live.
64. (proposed) One child slot: Edit and History share it. Pencil/E and clock/comma toggle their child; opening one while the other is open swaps.
65. (proposed) Desktop from 1240: a 360px column beside the item flyout, sliding out from beneath it. From 1024: tucked under the item's header in the lane. It never covers the list or the item. History's slot goes from 320 to 360.
66. (proposed) Phone and tablet: a stacked 84% sheet over the half sheet; the item collapses to a strip. Tap the strip or dim, drag a handle or title bar down, or Esc to step back.
67. (proposed) Header order: pencil, turned-back clock, round x. The open child's icon is filled. The phone sheet keeps the no-x rule of 8 October.
68. (**confirmed 11 Oct 2026**, owner: key hints shown on the icons; re-confirmed by voice the same day, checked in the fragment: `data-hint="show"`, E and the comma on the icons, desktop only) A key cap on each icon; shortcut line reads "E edit" and ", history"; the cue switch hides all; desktop only. The reveal look is no longer the plan.
69. (proposed) Close is Ctrl/Cmd Enter on desktop, Esc on phone, top layer first. (The "step back from a field to its tiles" clause went with the tiles layout.)
70. (proposed) A tile tap in the item flyout lands in the edit flyout on that field, highlighted.
71. (**confirmed 11 Oct 2026**, owner) Layout A: one scroll in five groups. The two tabs do not survive; the tiles layout (C) is dropped.
72. (**superseded 11 Oct 2026** by 82 to 86, and the drop itself by 94; kept as history) Level is a drop, never a word. Counted: worked out, not editable here. Weighed or worded: four drops. The "Level: plenty" chip and the separate select are gone. The parts that stand: no level word on screen, no chip and select.
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
83. (**confirmed, owner voice 11 Oct 2026**; its "battery here only" recommendation is superseded by 94; kept as history) The level icon is a battery, four cells, in the same colour bands as the drop and the existing level colours (`--cue` green Plenty, `--accent` amber Some, `--danger` red Running low, `--out` black Out): 4, 2, 1 and 0 cells filled. It replaces the drop in this flyout's form and in the item flyout's level tile so the two agree. The 8 October drop rule makes this a real choice, so the drop stays reachable (`lv=drop`) and every other screen keeps the drop until the owner says otherwise. No level word on screen either way (screen-reader text only).
84. (**confirmed, owner voice 11 Oct 2026**, for counted and weighed items that have a minimum; the part about items with no minimum is refined by 95) Automatic rules: a counted item, or any item with a number and a minimum, has its level worked out: more than twice the minimum is Plenty, more than the minimum and up to twice it is Some, at or under it is Running low, 0 is Out; counted with no minimum is Plenty until 0. A weighed item with a minimum follows the same rules (a reading of the owner's note, open question 3). A worded item, or a weighed one with no minimum, keeps the label the person picked and has no automatic mode.
85. (**superseded 11 Oct 2026 by 96**; kept as history) Override: when the person picks a level on an item that has automatic rules, the pick wins over the rules and shows everywhere (item flyout tile, header). When the quantity is next revised (stepper, typed number, unit change, use one, used up, clear) the pick is dropped and the rules take over again, until the next pick. Changing the minimum or any other field keeps the pick. Out is the amount at 0; picking another level restores the amount from before; adding stock after Out hands the level back to the rules. If a change leaves no rules to apply (the minimum cleared on a weighed item, a counted item turned into a weighed one), the level that was showing is kept as the stored label so it never jumps.
86. (**confirmed, owner voice 11 Oct 2026**, the cue stays inside the edit flyout only, see 100) A small muted cue under the picker: "Automatic" or "Set by you", only where rules apply, with a small back-to-automatic icon beside "Set by you". No chip, no sentence; a tooltip explains. Maps to the app's `by` provenance (`user` is "Set by you").
87. (proposed; refines 74) The Shopping list group starts with a status line: "Not on the shopping list." or "On the shopping list: 2 L." with Open the list; then how much to buy; then the button "Add to shopping list" or "Update the shopping list".
88. (proposed; its "starting from what the household has" default is **superseded 11 Oct 2026 by 99**, the rest stands) When the item has a weighed or counted quantity, "How much to buy" is a number stepper in the item's own unit, starting from what the household has (the amount, else the amount before it ran out, else 1). The own-words box is not shown; a one-line note says to clear the quantity to use it. The list stores the words ("2 L").
89. (proposed) When the item has no weighed or counted quantity (nothing, or words such as "a big handful"), the own-words box shows. Clearing the quantity (a new Clear beside the Quantity label) brings it back, so a person with a quantity can still update with free text.
90. (proposed; owner: match the Add form) Location and Spot are text inputs with a suggestion list that opens on focus or click, filters as you type, takes a new word, and closes with Esc without closing the sheet (arrow keys and Enter pick). The spot list is the location's spots, or every spot with its location named when there is no location; choosing one fills the location in; changing the location clears the spot; typed words take the household's own spelling when they match. Replaces the suggestion pills of 10 Oct. Same in Add.
91. (**confirmed, owner voice 11 Oct 2026**; extended by 97) Category is the same input with its suggestions drawn as the chip row of the Pantry filter bar: tag icon, bare chips, the chosen one outlined, a chevron showing the rest. No "All" chip; tapping the chosen chip clears it; typing filters the chips and Enter adds a new category. `cat=list` draws the plain list instead. The first screenshot is the Pantry's filter bar, so this is a guess at what was meant.
92. (**confirmed, owner voice 11 Oct 2026**: Edit and Add use exactly the quick set of the current `uat` Add form) Use by keeps the date in words and Clear, and takes the Add form's quick choices: +3 days, +5 days, +1 week, Pick date.... The 10 Oct Today, Tomorrow, 2 weeks and 1 month pills are dropped.
93. (proposed; extends 80) The emoji picker, in Edit and Add, has a search box, a Recent row (the last 8 picked on this device, starting from the emoji already on the household's items), a grid of about 126 foods and kitchen things, and "No emoji" once one is set. Esc closes the picker only. Its list (`emoji.js`) is fetched on the first open.

94. (**confirmed, owner voice 11 Oct 2026**; confirms 83 and replaces its "here only" recommendation) The level icon is the battery everywhere the level is drawn in the app: the item list rows, the Pantry and item sheet, Plan, filters, and the flyout. A visual swap only: the same four colour bands (`--cue` Plenty, `--accent` Some, `--danger` Running low, `--out` Out), the level name stays as screen-reader text (`.sr-only`) and in `aria-label`s, and no level word is drawn. The drop is gone (the `lv=drop` option is removed). Cells: Plenty 4, Some 2, Running low 1, Out 0. This drops the drop of the 8 October item-sheet note (`../item-sheet.md`); the no-visible-word rule and the colours of that note stand.
95. (**confirmed, owner voice 11 Oct 2026**; refines 84) An item with no minimum, counted or weighed, is Plenty while the amount is above zero and Out at zero, with no intermediate automatic bands. The person can hand-set Some or Running low (the cue then says "Set by you"). A worded item or one with no number has no rules; the level is the label the person picked, as before.
96. (**confirmed, owner voice 11 Oct 2026**; supersedes 85's "any quantity change drops the pick") A hand-set level goes back to automatic only when the quantity next INCREASES (a restock: the stepper's plus, a typed higher number, or any change that raises the amount). A decrease (the stepper's minus, Use one, a lower typed number, Used up) never clears it. A unit change, a minimum change and any other field keep the pick. Out is still the amount at 0, always; picking another level restores the amount from before; adding stock after Out is an increase, so it hands the level back to the rules. Clearing the quantity leaves no rules to apply, so the level that was showing is kept as the stored label (unchanged from 85).
97. (**confirmed, owner voice 11 Oct 2026**; confirms 91 and extends it) Category is a text box with the chip row under it. The chips are quick picks; anything not in the list is typed, kept with Enter or when the box is left, takes the household's own spelling when it matches one, and is offered as a chip from then on. Typing filters the chips and says "Enter adds ... as a new category". Same in Add.
98. (**confirmed, owner voice 11 Oct 2026**; same pattern as 97) Unit is a short box with a row of quick-pick chips under it: g, kg, mL, L, the count units (pack, tin, jar, bottle, bag, box, carton, bunch, roll), any unit the household already uses, and "No unit". A unit not in the list is typed and kept the same way (Enter or leaving the box), is offered as a chip from then on, and takes the household's spelling when it matches ("ML" becomes "mL"). A typed unit counts in whole steps, like a count unit. Location and Spot are unchanged (90).
99. (**confirmed, owner voice 11 Oct 2026**, the target; supersedes 88's default and open question 8) The shopping list default buy amount, when the item has a minimum, aims at double the minimum. **Judgment call:** the box starts at the DELTA to reach that target (twice the minimum, less what is held: 4 tin held with a minimum of 4 starts at 4), because the field is "how much to buy" and a number to add reads naturally next to the stepper; the target itself would be read as the amount to buy on top of what is held. A one-line note under the field says "Starts at what tops you up to twice your minimum (8 tin)." so the target is visible. At or over the target nothing is needed, so it starts at one step ("You already have twice your minimum, so it starts at one step."). An item that is out starts at the whole target. With no minimum the earlier fallback stays: what you have now (the amount, else the amount before it ran out, else 1). The stepper steps as the item steps (whole numbers for counted, 50 for g and mL, 0.5 for kg and L). The list still stores the words ("4 tin").
100. (**confirmed, owner voice 11 Oct 2026**; confirms the display-only reading of open question 6) A hand-set level looks identical to a calculated one everywhere: the same battery, no origin cue, in the item list, the item flyout and sheet, Plan and filters. The "Automatic" / "Set by you" cue stays only inside the edit flyout under the picker, as built (86), with its back-to-automatic icon. No conflict found: the cue is not on any other surface, so nothing else needs to tell the two apart. In the sample data, milk (hand-set Running low) and chopped tomatoes (calculated Running low) draw the same battery, and the check asserts it.
101. (**confirmed, owner voice 11 Oct 2026**) A level never adds the item to the shopping list, whether calculated or hand-set, and is not an input to the shopping logic (nor to the default buy amount of 99). The manual "Add to shopping" in the item flyout and "Add to shopping list" in the form stay explicit actions by the person. Nothing in the mockup reads the level to decide what is on the list; if the build's existing Running low filter or shopping marker looks at the level, a hand-set level must not move an item onto the list, and that is for the builder to confirm in the code.

## Open questions

Answered by voice on 11 Oct 2026 (round 3), kept for the record: 1 (hint look: shown, 68); 2 (battery everywhere: yes, 94); 3 (weighed with a minimum automatic: yes, 84 confirmed); 4 and 5 (the pick wins until the quantity next increases, and only an increase counts: 96); 6 (a hand-set level feeds the shopping list: no, display only, 101); 7 (the back-to-automatic icon: the cue "as already built" stays inside the edit flyout, so the icon stays; not separately asked, say if it should go); 8 (default amount to buy: twice the minimum, drawn as the delta, 99); 10 (category chip row: yes, with free text, 97); 11 (the old Use by pills: no, the Add form's set only, 92).

Still open:

9. The own-words box shows only after the quantity is cleared. A small "say it in your own words" link would avoid clearing the stock quantity. Add it?
12. Emoji: only the picker's foods and kitchen things are offered; the phone's own emoji keyboard used to allow any emoji. Allow typing or pasting any emoji too?
13. Phone: keep no close x on the item sheet (8 Oct) now the header carries two icons?
14. History's column from 320 to 360: acceptable?
15. History on the phone sheet too, or desktop only? Drawn on both.
16. The "Estimated" flag: `item-sheet.md` says All fields holds it; the form read did not show it. Left out. In or out?
17. Should a tile tap open a small inline editor instead of the edit flyout?
18. Where does "Open the list" go (Shopping tab or the sheet), and where does "Use in a recipe" land? Both are toasts here.
19. Add item: new items default to Unplaced (an empty Location box). Keep?
20. (new) The default buy amount is the delta to twice the minimum (99). If the owner meant the target itself (8 tin, not 4 more) the number in the box changes and the note under it; the stepper and the stored words do not.
21. (new) A unit typed in the free-text box is offered as a chip for the rest of the session, and in the build would join the household's own units. Is a typo then a permanent chip? Drawn without a way to remove one.
22. (new) Plan, the list rows and the filters draw no level icon in these mockups, so the battery is only seen on the item sheet and flyout here. Is there a screen the owner has in mind that draws a level icon that is not in this repo?

## For the implementation

- The form is shared with Add through `formFields()` in the app. Keep that: add mode is the same fields with a different footer.
- Same class names as the mockup; new names are prefixed `ef-` (or `ib` for header icon buttons). Tokens come from `theme.css` only.
- Load on engagement (DESIGN.md section 6): the form, History and the viewport host are fetched on first use. The default path loads one host script for the size.
- Level: see 84, 95 and 96. The mockup keeps the pick as `lvSet` on the item and clears it only when the quantity next increases (`IEF.qtyChanged(it, was)`: `it.amount > was`); in the app this is the level's `by` (`user` = "Set by you"), cleared by the same service method that raises the quantity, from the UI and from the chat tools alike (standing rule). A decrease, a unit change and a minimum change never clear it. Out (amount 0) still wins over any pick.
- The battery (94): one icon, same markup and classes everywhere (see the handover, section 10, for the exact SVG, classes and tokens). No level word is drawn; the name is `.sr-only` text and the `aria-label` of the control.
- Category and Unit (97, 98): a text box plus a chip row that folds to one line with a chevron (`ef-cats`, `ef-ct`, `ef-cl`, `ef-chip`, `ef-cx`, with `data-kind="cat"` or `"unit"`). Typed values are kept on Enter or blur, take the household's spelling, and are offered as chips.
- Shopping default (99): `buyVal` in `form.js`; the target is twice the minimum, the box starts at target minus held (one step when held is at or over the target); no minimum keeps the fallback. The level is never an input.
- Location, Spot and Category: reuse the Add form's `combo()` in `assets/form.js`; the mockup's classes (`combo-wrap`, `combo`, `hint`) are the app's. The chip row is new markup (`ef-cats`, `ef-chip`); the app's Pantry filter curtain (`curtain.js`) could be reused instead of a second implementation (one code path per feature).
- Emoji: replace the app's emoji box with the tile and picker (80, 93) for Add and Edit through the shared `formFields()`; the app's emoji box (a one-character input with a datalist) is what is broken.
- The shopping list stores words (`quantity_text`), so the stepper's "2 L" is written as words; the status line and the button use the existing shopping service.
- Not checked: the real app, a real device's soft keyboard and drag, screen readers, Safari and Firefox, the Pages URL from the sandbox. Checked in headless Chromium: `tools/item-edit-flyout-check.mjs` (1056 checks at 390, 768, 1024 and 1440, light and dark).
