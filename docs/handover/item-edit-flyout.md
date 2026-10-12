# Item edit flyout: handover

**Status: round 7 drawn 12 October 2026 (Sydney), for anyone to pick up cold.** Round 7 (owner, by voice and text, after a phone screenshot of the item sheet with 🥶 set and the emoji text box permanently under the name): the Level control is only ever Automatic or Set by you with a 44px Back to automatic, never "Not set" (128); the emoji is only the tappable tile until tapped, in Add, Edit and the item sheet, and the box opens and closes by one set of rules (129, 130); on the phone the field stays in view above the keyboard and dismissing it never loses a valid emoji (131); the input hints are the real ones only, and the research says no attribute selects the emoji panel (132). The build in Kitchie `uat` matches. **Round 6 (before it):** Round 6 (owner, by voice, relayed): the emoji is a plain text box with the same suggestion strip as Location, Spot and Category, no dropdown, popup, panel or modal; any emoji typed or pasted is accepted; clearing it saves no emoji; the tiles stay and focus the box (116 to 119, supersede the picker of 80, 93, 107 and 115's search box); a unit can always be cleared, a typed unit folds onto the household's own ("kilos", "Kg" are kg; "boxes" is box) and "2kg" splits into 2 and kg when unambiguous (120, 121). See section 13. Earlier: round 5. Round 5 (owner, typed, after reviewing the built Category field): ONE suggestion strip for Location, Spot and Category, hidden while the box has a value, one or two pills when empty, typed text highlights the match, free text kept as the outlined pill (108 to 110, supersedes 90); and the level override cue "Set by you" with a labelled "Back to automatic" button (111, 112, refines 86). See section 12. Earlier: round 4 (below). Round 4 (owner, typed, after reviewing the built flyout in Kitchie `uat` PRs 556, 603 and 604): no shopping group in Edit (102); "How much to buy" with Add to shopping in the item flyout only at Running low or Out, stepper or own words by quantity kind (103 to 105); the item flyout header gets the emoji tile and picker (106, 107). See section 11. Earlier status: round 3 drawn 11 October 2026. The mockup is drawn and merged to mockup `main` (round 1: PR 72, 10 Oct; round 2: the PR titled "item edit flyout round 2", PR 74, squash 776e396, 11 Oct; round 3: PR 76, squash 9d7cf7b, 11 Oct). The build is in Kitchie `uat` (PRs 556, 603, 604, and the round 4 PR); it must match this mockup exactly. Confirmed by the owner: layout A (71) and key hints shown (68) by typed note; and by voice on 11 Oct (round 3) the battery everywhere (94), the four bands for counted and weighed with a minimum (84), no-minimum rule (95), increase-only reset (96), category and unit chips plus free text (97, 98), the buy default aim (99), the use-by quick set (92), identical look everywhere and no shopping effect (100, 101). Still proposals: the rest of 63 to 93 that is not marked confirmed. Section 10 (new) is what the Kitchie build copies for the battery. Read `AGENTS.md` and `DESIGN.md` in this repo first (sections 6, 7, 9 and 10 bite most). Style follows `docs/handover/plan-desktop.md`.

## 1. The ask, in the owner's words

Owner (voice session, 10 October 2026, relayed and kept close to the words): replace the full-page **Edit item** form with a **flyout**, in the same pattern as the Pantry item flyout and sheet. It opens **nested beneath the already-open item flyout**, not as a page. Reuse the existing tokens, classes, motion, close and back behaviour and keyboard handling. In the item flyout header, next to the close button: an **edit (pencil)** icon that replaces the hamburger; a new **history (clock)** icon that opens that item's change history in a nested flyout or panel (who, what, when, plain); shortcut hints, **E** labelled "edit" and **comma** labelled "history", shown or revealed the way the Pantry and desktop mockups do, and the shortcuts must work. **Mark as used up** and **Add to shopping list** stay exactly as the Pantry item sheet has them. Hands off, best judgment, visual options only where there is a real choice, phone and desktop, viewport code in its own files, touch behaviours (swipe or drag to dismiss) also working with a mouse. Cover every field of the current app form (Kitchie uat v0.70.0, read only).

**Round 2 (owner, typed notes, 11 October 2026).** Confirmed: layout A; hints shown on the icons (his note also has the line "LAYOUT OF THE FIELDS: THE REAL CHOICE - Reveal", read as pasted from the options page, open question 1). Changes: (1) level as a battery icon with the same colour bands, always editable by the user, a counted item automatic by default, a weighed or worded item four icons to pick, and an override rule (a pick follows the rules against the minimum; a later quantity revision resets it to automatic until the next pick) with a small "automatic" versus "set by you" cue; (2) the Shopping list group in two states, with a quantity (quantity-based amount, own-words box hidden until the quantity is cleared) and without one (own-words box); (3) Location, Spot and Category as the new-item form in Kitchie `uat` (text inputs with suggestion lists), Category's suggestions possibly as the chip row of his first screenshot, Use by with the same quick pills; (4) the emoji, broken in the real app in both Add and Edit, replaced by the mockup's tile and picker for both.

**Round 3 (owner, voice, 11 October 2026).** Nine confirmations and refinements, in the job note under "Round 3" and decisions 94 to 101: (1) battery everywhere, replaces the drop; (2) four bands for counted and weighed with a minimum; (3) no minimum is Plenty until 0, hand-set Some or Running low allowed; (4) a hand-set level clears only when the quantity increases; (5) shopping default aims at double the minimum; (6) Category and Unit are chips plus free text; (7) the use-by quick set of the `uat` Add form; (8) a hand-set level looks identical everywhere, never feeds the shopping list; (9) key hints shown, unchanged.

Known issues round 1 had to resolve: the Shopping list heading had no space above it and showed on both tabs; the "Level: plenty" word chip contradicts the 8 October rule (level is a drop, no visible name); no mockup existed for the two-tab form or the inline shopping block.

**Round 4 (owner, typed, 12 October 2026).** Reviewed the built flyout: "this is good. The shopping list is not needed in the edit. How much to buy is conditional, with the add to shopping, only when the level is low. How much to buy is based on whether there is a weighed or counted quantity." And approved the item flyout's emoji tile ("this fine"). Detail in section 11 and decisions 102 to 107.

## 2. What exists and where

| What | Where |
|---|---|
| Options page (options, field table, decisions, open questions, what loads) | `fragments/item-edit-flyout/index.html`; live (not verified from the sandbox, check it): <https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html> |
| Live host (Pantry list, item flyout, edit, history, add) | `fragments/item-edit-flyout/pantry.html`, with URL options below |
| Job note, decisions 63 to 132 (and the emoji-keyboard research) | `docs/knowledge/jobs-to-be-done/item-edit-flyout.md` |
| Item sheet it extends | `docs/knowledge/item-sheet.md`, `fragments/item-sheet/` |
| Pantry desktop rules it copies | `docs/knowledge/desktop-layout.md`, `docs/handover/desktop.md` |
| Screenshot tool entries | `tools/screenshots.mjs` (`item-edit-flyout`, `item-edit-flyout-live`, `-level`, `-shop-qty`, `-shop-words`, `-add`); screenshots are not kept in the repo (`shots/` is gitignored) |
| Behaviour and layout check | `tools/item-edit-flyout-check.mjs`: headless Chromium, 390, 768, 1024 and 1440 wide, light and dark, 2376 checks, with a 360 pass (the level bands as a table, increase-only reset, no-minimum bands, weighed with a minimum, no shopping group in Edit or Add, the how-much control by level and quantity kind with the default amounts and the plain add unchanged, no automatic shopping, category and unit free text, the battery drawings and no drop anywhere, hand-set looks the same as calculated, level override, suggestion lists, chip rows, emoji picker in Edit, Add and the item flyout header, keys, drag, console, sideways scroll). Run it before changing the fragment; `W=390,1440` limits the widths |

**Open it and switch size.** Serve the repo (`python3 -m http.server`) and open the options page, or the Pages URL. Any `pantry.html` link accepts `?vp=390|768|1024|1280|1440|1920`, which frames it in an iframe at that width; move the pointer to the top edge or press backtick for a hidden size control.

**URL options** on `pantry.html`: `sel=<id>` (butter, carrots, cheddar, eggs, yog, milk, paneer, spinach, rice, tom, onion, garam, peas, ice), `child=edit|history`, `mode=add`, `hint=show|reveal`, `recipes=0` (no Recipes), `down=1` (a failed save), `field=<name>` (land on a field: name, qty, level, min, area, spot, cat, useby), `lv=Plenty|Some|Running low|Out` (set that level on the selected item, to link to every state), `more=` (History pages), `cues=0` (hints off), `help=1` (shortcut list). `opt=` and `tab=` are gone with layouts B and C.

**File layout (viewport code in its own files, DESIGN.md section 7).**

- Shared, no size rules: `flyout.css`, `flyout.js` (also holds "How much to buy" and the header emoji tile, round 4), `frame.js`; fetched on engagement: `form.js` (first Edit or Add), `emoji.js` (the emoji list and the picker's code, on the first tap of an emoji tile in the form or the item flyout header), `history.js` (first History open).
- Per size: `phone.css` and `tablet.css` (media gated), `desktop.css` (min-width 1024; `desktop-1240.css` was removed by decision 159). One host script per size, fetched on demand: `phone.js` (touch, grab and drag, Esc) or `desktop.js` (rail, keys, shortcut list). A size change reloads the page.
- No images in the default path.

## 3. The options and the recommendation

Layout A, one scroll in five groups, is confirmed; the two tabs and the tiles were dropped and their code removed (git history, PR 72). Key hints shown on the icons is confirmed.

The level icon is a battery everywhere (94, confirmed): the drop and the `lv=` option are gone. Location, Spot and Category share one suggestion strip, hidden while the box has a value (108 to 110, round 5); Category's chips plus free text (91, 97) now follow that rule, and `cat=list` is gone.

Nesting: from 1240 the child is a 360px column that slides out from beneath the item flyout; from 1024 it tucks under the item header in the same lane; below 1024 it is a stacked 84% sheet and the item shrinks to a strip. Add mode is the same form in the item flyout's place.

## 4. Decisions 63 to 132

Full wording and statuses in the job note (`docs/knowledge/jobs-to-be-done/item-edit-flyout.md`).

| # | Status | Decision in one line |
|---|---|---|
| 63 | proposed | A flyout nested under the open item, never a page |
| 64 | proposed | One child slot shared by Edit and History; toggle or swap |
| 65 | proposed, desktop superseded by 159 | Desktop: 360px column from 1240, tucked under the header from 1024; History 320 to 360 |
| 159 | proposed | Desktop: Edit and History replace the simple view in the same lane at every width (no column, no tuck); phone and tablet unchanged |
| 66 | proposed | Phone and tablet: stacked 84% sheet, item as a strip; step back by strip, dim, drag, Esc |
| 67 | proposed | Header order pencil, clock, x; open child's icon filled; phone keeps no x |
| 68 | **confirmed 11 Oct** | Key hints shown on the icons; "E edit", ", history"; cue switch; desktop only |
| 69 | proposed | Close is Ctrl/Cmd Enter (desktop) and Esc (phone), top layer first |
| 70 | proposed | A tile tap lands on that field in Edit |
| 71 | **confirmed 11 Oct** | Layout A; tabs do not survive; tiles dropped |
| 72 | **superseded 11 Oct** by 82 to 86, drop by 94 | (was) level is a drop, counted level read only |
| 73 | proposed | Minimum under Quantity, only with a unit or minimum |
| 74 | **superseded 12 Oct by 102** (its "Used up and Add to shopping unchanged" stands, 105) | (was) Shopping list once, spaced, at the end |
| 75 | proposed | "Use in a recipe" a plain row at the bottom; hidden without Recipes |
| 76 | proposed | Mark as used up not repeated in the form |
| 77 | proposed | Autosave, "Saved", Try again on errors; name needed; no past use-by |
| 78 | proposed | Add item is the same form in add mode, own footer, Unplaced by default |
| 79 | proposed | History: this item only, 3 days then 5 more, fetched on open |
| 80 | **confirmed in substance 11 Oct** (extended by 93) | Emoji tile with picker and "No emoji"; no photos; for Add and Edit |
| 81 | proposed | Viewport code in its own files |
| 82 | proposed (owner-requested) | One picker of four icons for every item; always editable; counted automatic by default |
| 83 | **confirmed 11 Oct (voice)**; "here only" replaced by 94 | Battery icon, same colour bands |
| 84 | **confirmed 11 Oct (voice)**, no-minimum part refined by 95 | Four bands for counted and weighed with a minimum |
| 85 | **superseded 11 Oct by 96** | (was) any quantity change drops the pick |
| 86 | **confirmed 11 Oct (voice)**, inside the flyout only (100) | Muted "Automatic" / "Set by you" cue, with a back-to-automatic icon |
| 87 | **superseded 12 Oct by 102** | (was) Shopping group: status line, how much to buy, the button |
| 88 | **superseded 12 Oct by 102 and 104**; default was superseded by 99 | (was) With a quantity: a number stepper in the item's unit; own-words box hidden |
| 89 | **superseded 12 Oct by 102 and 104** (the Clear beside Quantity stays) | (was) With no quantity: own-words box; a new Clear beside Quantity brings it back |
| 90 | proposed | Location and Spot: text inputs with suggestion lists, as the Add form |
| 91 | **confirmed 11 Oct (voice)**, extended by 97 | Category: input with the filter bar's chip row |
| 92 | **confirmed 11 Oct (voice)** | Use by: the Add form's +3 days, +5 days, +1 week, Pick date... in Edit and Add |
| 93 | proposed | Emoji picker: search, Recent, about 133 foods, "No emoji"; Esc closes it only |
| 94 | **confirmed 11 Oct (voice)** | Battery is the level icon everywhere; replaces the drop (confirms 83) |
| 95 | **confirmed 11 Oct (voice)** | No minimum: Plenty above 0, Out at 0, no bands; Some or Running low by hand (refines 84) |
| 96 | **confirmed 11 Oct (voice)** | A hand-set level clears only when the quantity next increases; a decrease never clears it (replaces 85) |
| 97 | **confirmed 11 Oct (voice)** | Category: chips plus free text (extends 91) |
| 98 | **confirmed 11 Oct (voice)** | Unit: quick-pick chips plus free text |
| 99 | **confirmed 11 Oct (voice)**; delta is a judgment call; applies to the item flyout since 12 Oct (104) | Buy default aims at twice the minimum, drawn as the delta (replaces 88's default) |
| 100 | **confirmed 11 Oct (voice)** | A hand-set level looks identical everywhere; the cue stays inside the edit flyout |
| 101 | **confirmed 11 Oct (voice)** | A level never adds an item to the list and is not fed to the shopping logic |
| 102 | **owner, typed 12 Oct**; supersedes 74, 87, 89 | No Shopping list group in Edit or the standalone edit page; Edit ends after Use by (and the recipe row) |
| 103 | owner, typed 12 Oct; reading **proposed** | The item flyout shows "How much to buy" with Add to shopping only at Running low or Out (calculated or hand-set); at Plenty or Some the button adds as today. Proposed: hides once on the list |
| 104 | owner, typed 12 Oct; reading **proposed** | Weighed or counted quantity: stepper in the unit, default per 99. No exact quantity: own-words box ("1 kg, a packet, 3"). Proposed: the amount resets to its default when quantity, minimum or unit changes |
| 105 | owner, typed 12 Oct (unchanged buttons); rest **proposed**; confirms 101 | Used up and Add to shopping unchanged; adding is always an explicit tap; a hand-set level never adds |
| 106 | **owner, 12 Oct ("this fine")**; refines 80, 93 | Tappable emoji tile in the item flyout header, same picker, same save path; widens the sheet's one-field save allow-list (build) |
| 107 | **proposed** | The picker replaces the tiles and buttons while open; Esc closes it only; opening a child closes it |
| 108 | **owner, typed 12 Oct**; supersedes 90; extends 91, 97; pill count **proposed** | Location, Spot and Category share one suggestion strip under the box: nothing while the box has a value; one row, one or two pills and a chevron while empty; pops in on typing or clearing |
| 109 | owner, typed 12 Oct; key rules **proposed** | Typing filters and highlights the best match; tap, Enter or arrows take it; the typed text is the outlined "add this" pill; Esc closes the strip only; combobox and listbox ARIA, 44px pills |
| 110 | owner, typed 12 Oct | Spot follows the location (all spots with their location when none; a spot fills the location; a new location clears the spot); one implementation for every surface |
| 111 | owner, typed 12 Oct; refines 86; place **proposed** | "Set by you" plus a circular-arrow "Back to automatic" button on the Level label row, only while a hand-set level exists on an item with a number; "Automatic" with no control otherwise |
| 112 | owner, typed 12 Oct | The button clears the override at once and the battery redraws; in the build the same service and route as the sheet's "Back to automatic" |
| 113 | **proposed** | Interpretations of round 5 (pill count, strip under the box, arrow keys reveal, order of the first two) |
| 114 | owner, voice 12 Oct; wording **proposed** | Emoji picker gains seven source animals beside the meat (cow, pig, chicken, sheep, duck, turkey, goat; fish was already there), searchable by beef, pork, lamb, mutton, poultry, goat, duck; same set and keywords in Kitchie `uat` |
| 115 | owner, voice 12 Oct; wording **proposed** | Emoji picker shows one hint line, "Search, or type or paste your own emoji"; a typed or pasted emoji becomes the first tile ("Your emoji"), Enter or tap sets it; same wording in Kitchie `uat` |
| 116 | owner, voice 12 Oct; details **proposed** | Emoji is a plain text box plus the Location strip (one row, 1 or 2 pills when empty, nothing when set, typing filters and highlights); placeholder is 115's wording at #614's size; no picker, panel or popup |
| 117 | owner, voice 12 Oct; which one kept **proposed** | Any emoji typed or pasted is accepted; only emoji in the box keeps one at once (the newest); with words it is the outlined first pill |
| 118 | owner, voice 12 Oct | Clearing the box saves no emoji (on leaving or Enter), neutral tile, one History line; "No emoji" button gone |
| 119 | owner, voice 12 Oct; placement **proposed** | Tiles stay and focus the box; the item flyout's box shows under the header and goes away after the tap that left it lands |
| 120 | owner, voice 12 Oct; seed **proposed** | Unit can always be cleared; ONE matcher folds case, plurals and variants onto the household's own units (more used, then singular) |
| 121 | owner, voice 12 Oct; test **proposed** | "2kg" in the quantity, unit or own-words box splits into 2 and kg only when unambiguous |
| 122 | owner, voice 12 Oct; forms **proposed** | Add: + (also =, numpad +); N kept |
| 123 | owner, voice 12 Oct; guards as said | + and = stay out of typing and Ctrl, Cmd, Alt chords |
| 124 | owner, voice 12 Oct; chip **proposed** | Add button shows a "+" key cap; list row "+ or N" |
| 125 | owner, voice 12 Oct; reading checked | Current cue look is shown (not hover); it stays the default |
| 126 | owner, voice 12 Oct; storage **proposed** | Shift+Space toggles key hints; kept per device; status line |
| 127 | owner, voice 12 Oct; set **proposed** | Shift+Space stays out of typing, buttons, links and chords; desktop only |
| 128 | owner, voice and text 12 Oct; reading **proposed** | Level is Automatic or Set by you on every item (worded quantity included), Back to automatic a 44px button at every width, never "Not set"; Add has no Level control |
| 129 | owner, voice 12 Oct; details **proposed** | The emoji is only the tappable tile until tapped (set or neutral); a tap reveals box and strip and focuses it; Add, Edit, item sheet; placeholder and size rule unchanged |
| 130 | owner, voice 12 Oct; list **proposed** | Clearing leaves the box open; a pill, a typed or pasted emoji, Enter, Esc (cancels) or blur collapses to the tile; focus back on the tile |
| 131 | owner, voice 12 Oct; mechanism **proposed** | Phone: the sheet lifts above the keyboard (visualViewport, --kb) and the box scrolls into view; blur keeps a valid emoji, so dismissing the keyboard never loses it |
| 132 | owner, voice 12 Oct; set **proposed** | Real hints only: autocapitalize none, autocorrect off, spellcheck false, enterkeyhint done; no inputmode, lang or VirtualKeyboard claim; research in the job note |

## 5. Open questions

Full text with what a wrong guess costs is in the job note. Answered by voice on 11 Oct: 1 (shown), 2 (battery everywhere), 3 (weighed with a minimum: automatic), 4 and 5 (a pick clears only on an increase), 6 (display only), 7 (the cue as built stays; the back-to-automatic icon is kept, not separately asked), 8 (aim at twice the minimum), 10 (chip row, with free text), 11 (the Add form's set only). Round 4 adds 23 ("low" is Running low or Out; should Some show it?), 24 (no way to update the amount once on the list), 25 (own words optional when empty), 26 (picker replaces the tiles vs over the sheet), 27 (the household flow's older item sheet was not redrawn). Still open: 9 (a "say it in your own words" link; reworded for round 4), 12 (any emoji by typing or pasting), 13 (phone no-x), 14 (History column width), 15 (History on the phone), 16 (the "Estimated" flag), 17 (inline tile editor), 18 (where Use in a recipe lands; Open the list went with the group), 19 (Add defaults to Unplaced); new: 20 (delta or target for the buy default), 21 (a typed unit with no way to remove its chip), 22 (any screen outside this repo that draws a level icon).

## 6. What is NOT decided or built

- Nothing is built in Kitchie. No Kitchie issue was created or changed by this work (the owner's rule for this task).
- Judgment calls in round 4: "low" is Running low or Out; the control hides once the item is on the list; the amount starts again from the default when the quantity, minimum or unit changes; the own-words box is optional; the picker replaces the tiles and buttons while open (all marked proposed in 103, 104, 107). The household flow's older item sheet was not redrawn.
- Judgment calls in round 3: the buy default is drawn as the delta to twice the minimum (target shown in a note under it) (99); the unit chip row and the category chip row share one component; a unit typed once stays as a chip. Nothing else was left to guess.
- Data and history are sample data. History mirrors the shape of `store.getHistory(id)` and the MCP `item_history` tool; the real field names and sources are to be checked at build time.
- Phone, tablet and desktop were checked with headless Chromium only (`tools/item-edit-flyout-check.mjs`). Not checked: the Pages URL from the sandbox, a real touch device and its soft keyboard (the suggestion lists place themselves above the keyboard by measuring the visible area, untested on a device), screen readers, Safari and Firefox, the native date picker behind "Pick date...", the real app's form code. Kitchie `uat` was read, never run or changed.

## 7. Next steps once the owner confirms

Proposal for slicing, not agreed: settle section 5 here and in the job note (mockup first if anything changes); the nested child slot and header icons; the form in layout A shared with Add through `formFields()`; the level control and override (82 to 86); the item flyout's how-much-to-buy control (103 to 105, the Shopping list group is gone, 102) and header emoji tile (106, 107); the Add form's combobox, chip row and use-by pills in the flyout (90 to 92); the emoji picker for Add and Edit (93, which also fixes the broken emoji); History; keyboard layer (E, comma, close); per-size files. Open Kitchie issues for slices from the confirmed decisions only. Build in the mockup-to-UAT order (Kitchie `uat`, never `main`). Screens must match the mockup exactly; list each difference in the PR. Chat tools and the UI call the same service methods. Headless screenshots at the bucket widths before asking the owner to look.

## 8. Process notes

- Mockups merge straight to mockup `main` (owner, 9 October 2026): no `uat`, no approval step. Never merge anything in Kitchie. Do not touch Kitchie or the Kitchie mockup repo from this work.
- `gh pr create` fails from Claude Code sessions (GraphQL 403). Use `gh api repos/basement-bridge/mockup/pulls --input <json>`, then `gh api -X PUT repos/basement-bridge/mockup/pulls/N/merge -f merge_method=squash`.
- Commits and PR descriptions carry the session trailer lines. This repo is public: no secrets, no personal details of real people.
- The Pages URL was not verified from the sandbox; open it once and fix this file if it differs.

## 9. Links

- This handover: [blob](https://github.com/basement-bridge/mockup/blob/main/docs/handover/item-edit-flyout.md).
- Job note: [blob](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/item-edit-flyout.md).
- Options page: [source](https://github.com/basement-bridge/mockup/blob/main/fragments/item-edit-flyout/index.html), [live](https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html).
- Round 1: PR 72, squash eb35f8f. Round 2: PR 74, squash 776e396. Round 3: PR 76, squash 9d7cf7b.
- Rules: [`AGENTS.md`](https://github.com/basement-bridge/mockup/blob/main/AGENTS.md), [`DESIGN.md`](https://github.com/basement-bridge/mockup/blob/main/DESIGN.md). Related: [`plan-desktop.md` handover](https://github.com/basement-bridge/mockup/blob/main/docs/handover/plan-desktop.md) (decisions 49 to 62).

## 10. The battery: exactly what the build copies (decision 94)

One icon, drawn the same everywhere the level is shown. Source of truth: `IEF.battery` in `fragments/item-edit-flyout/flyout.js`, the same function as `levelBattery` in `flows/household/app.js`, and the CSS block headed "the level battery" in `fragments/item-edit-flyout/flyout.css` and `flows/household/styles.css`.

**Markup** (`l` is the level, `width` in px; height is `round(width * 20 / 34)`). Plenty has 4 cells, Some 2, Running low 1, Out 0:

```html
<svg class="bat lv-plenty" width="38" height="22" viewBox="0 0 34 20" aria-hidden="true" focusable="false">
  <rect x="1" y="2" width="29" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <path d="M31.4 7.5h.8a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-.8z" fill="currentColor" stroke="none"/>
  <!-- one cell per filled level, i = 0..n-1 -->
  <rect x="4" y="5" width="5.2" height="10" rx="1.2" fill="currentColor" stroke="none"/>
  <rect x="10" y="5" .../> <rect x="16" y="5" .../> <rect x="22" y="5" .../>
</svg>
```

Cell `i` is `x = 4 + 6 * i`, `y = 5`, `width = 5.2`, `height = 10`, `rx = 1.2`. The class is `bat` plus `lv-plenty`, `lv-some`, `lv-low` or `lv-out`.

**CSS** (the colour is the level; `currentColor` draws the outline and the cells):

```css
.bat{flex:none}
.bat.lv-plenty{color:var(--cue)}
.bat.lv-some{color:var(--accent)}
.bat.lv-low{color:var(--danger)}
.bat.lv-out{color:var(--out,var(--fg))}
```

**Sizes:** the item flyout and sheet level tile `.tl .bat{width:38px;height:22px;margin:6px 0}` (draw it at width 38); each button of the level picker `.lvpick .opt` holds one at width 35 (`.lvpick .opt .bat{width:35px;height:21px}` in the household flow). Anywhere else, pick a width and keep the 34:20 ratio.

**Tokens:** `--cue` (Plenty, green), `--accent` (Some, amber), `--danger` (Running low, red), `--out` (Out; black on Kitchie Day, a mid grey on Kitchie Night; falls back to `--fg`). No new tokens. All from `theme.css`.

**Words:** never drawn. The name goes in `<span class="sr-only">Running low</span>` inside the control that holds the icon (the picker's `role="radio"` button), or in the `aria-label` of the tile ("Level, Running low. Opens the edit flyout"). The svg itself is `aria-hidden`.

**Level picker:** `<div class="opts lvpick" role="radiogroup" aria-label="Level">` with four `<button class="opt" role="radio" aria-checked data-v="Plenty|Some|Running low|Out">`, order Plenty, Some, Running low, Out in the flyout; the household sheet's picker lists Out first, as built. The chosen one has class `on` (a 2px `--accent` border on `--surface`).

**A hand-set level is drawn exactly like a calculated one.** The only place that says which it is, is the muted cue under the picker inside the edit flyout (`.ef-lvm`, `.ef-src`: "Automatic" or "Set by you", and `.ef-auto`, the back-to-automatic icon beside "Set by you").

**Rules to implement with it** (all in the job note, 84 and 95 to 101): bands with a minimum (more than twice Plenty, above the minimum up to twice Some, at or under it above 0 Running low, 0 Out) for counted and weighed; no minimum is Plenty above 0 and Out at 0; a hand-set level (`by: user`) is cleared only by a quantity increase, from the UI and the chat tools through the same service call; it never adds the item to the shopping list; the buy default is the delta to twice the minimum (`buyVal` in `form.js`).

## 11. Round 4 (12 October 2026): what changed and what the build copies

Owner (typed, 12 Oct 2026): "this is good. The shopping list is not needed in the edit. How much to buy is conditional, with the add to shopping, only when the level is low. How much to buy is based on whether there is a weighed or counted quantity." And the item flyout's emoji tile: "this fine".

| Change | Mockup | Files |
|---|---|---|
| No shopping group in Edit or the standalone edit page (102) | Groups are Item, Amount, Where, then Use by, then the "Use in a recipe" row. The status line, "How much to buy" and the button are gone; `?field=shop` is no longer a field | `form.js` (INNER.shop, the layout, `buyVal`, `step` for buy, the click and field handlers removed), `flyout.css` (`.ef-shop`, `.ef-f2`, `.ef-onlist`, `.ef-shopb` removed) |
| "How much to buy" in the item flyout, only at Running low or Out (103 to 105) | `IEF.buyShows(it)`: level is Running low or Out and the item is not on the list. `IEF.buyHtml(it)`: stepper (`data-buy="num"`) for a number, own words (`data-buy="words"`) otherwise. `IEF.buyVal` is decision 99 moved. `shopQuick` adds with the amount only when the control shows; otherwise exactly as before | `flyout.js`, `flyout.css` (`.sbuyw`, `.sbuy`, `.sb-f`), the three size stylesheets (the control is hidden with the tiles and buttons when a child is open) |
| Emoji tile in the item flyout header (106, 107) | `button.ph#ief-emo` (dashed "+" when none) opens `.ef-ep#ief-emojis` under the header; `IEF.saveEmoji(e)` saves, logs "Emoji", toasts with Undo. The picker's code moved from `form.js` to `emoji.js` so both homes share it | `flyout.js`, `emoji.js`, `form.js` (`F.saveEmoji`), `flyout.css`, `phone.css` (taller sheet while open, tile is part of the strip with a child open), `desktop.js` (keys ignored while the grid is focused) |

**For the build.** The add-to-list service and route stay (the item flyout and the shopping page call them); Edit stops calling them. The default amount reuses the existing buy-amount logic and the one level function. The emoji from the item flyout is one more field the one-field save allow-list accepts: validate server-side (empty, or one emoji, else a friendly 400), keep every other field's rule, and test that the others are still rejected. Pinned MCP tool descriptions and `test/fixtures/shopping-contract.golden.json` are not touched by this round; changing them needs the owner's approval.


## 12. Round 5 (12 October 2026): what changed and what the build copies

Owner (typed, 12 Oct 2026, from screenshots of the built Category field; closely paraphrased): a suggestion strip for Location, Spot and Category with the same behaviour in Edit and Add; empty means a single row of one or two suggested pills and the chevron; typing filters and highlights the match, which can be taken by tap, Enter or the arrow keys; free-typed values can still be added (the outlined chip); with a value already there (Location "Pantry") no strip and none of the dark visual until the person types or clears; spot suggestions follow the location. And: when the level is overridden the Edit form shows "Set by you" with a small undo arrow to go back to automatic, as a clearer, better-placed control.

| Change | Mockup | Files |
|---|---|---|
| One suggestion strip (108 to 110) | `div.ef-cats.ef-strip#sg-<area|spot|cat>[data-kind][data-open][data-n]` under the box: `.ef-ct` icon (pin for Location and Spot, tag for Category), `.ef-cl[role=listbox]` of `button.ef-chip[role=option]` (`.add` = typed text, outlined; `.hl` = highlighted match; `.hint` = a spot's location), `.ef-cx` chevron. Box: `role=combobox`, `aria-controls`, `aria-expanded`, `aria-activedescendant`. State per box: typed, force (arrow keys), off (Esc), open (chevron), hl | `form.js` (`stripBox`, `stripDraw`, `stripChoose`, `sgModel`), `flyout.css` |
| Level cue (111, 112) | `p.ef-lvm#ef-lvm` in the Level label row (`.ef-lh`): `span.ef-src.set` "Set by you" + `button.ef-auto[data-ef=lvauto][aria-label="Back to automatic"]` with the circular-arrow icon (`IC.rotate`); `span.ef-src` "Automatic" alone while the rules decide; nothing for a worded quantity | `form.js` (`lvCue`), `flyout.js` (`IC.rotate`), `flyout.css` |

**Removed:** the dropdown list (`.combo`) for Location and Spot, the always-drawn Category chip row and `?cat=list`. **Kept:** Unit chips (98), free-text rules (91, 97), the household's spelling, Esc order.

**For the build.** `assets/form.js` already has `combo()` and `chipRow()`; replace both for Location, Spot and Category with one strip function (same markup, same classes) so the Add form, the flyout, the standalone edit page, quick-add and the desktop Add panel share it. The Pantry filter curtain (`curtain.js`) and the chips of PR 556 supply the row's look and fold. The level button calls the service method and route the item sheet's "Back to automatic" uses; the sheet's level editor must show the same words and icon.

## 13. Round 6 (12 October 2026): what changed and what the build copies

Owner (by voice, 12 Oct 2026, relayed; closely paraphrased): the emoji field becomes an inline suggestion strip like Location, Spot and Category. No dropdown, popup, slide-in or slide-over panel or modal. A plain text field with the strip underneath: when empty one or two pills in a single row; typing filters the curated list by name or keyword and highlights the match; free typing or pasting of any emoji from the device keyboard is always accepted (one emoji kept); clearing the field leaves the item with no emoji. With an existing emoji the strip shows nothing until the person types or clears. Keep the curated list and the hint wording as the placeholder. Keep the tappable tile on the item sheet; tapping it focuses the inline field. 44px targets, no layout shift, keys like the existing strip. Units: clearing the unit must always be allowed; "kg", "kilo", "kilos", "kilogram(s)", "2kg" are recognised and matched to the household's existing unit; plurals and near-variants fold into the one existing unit; case folds; "2kg" splits into 2 and kg only when unambiguous.

| Change | Mockup | Files |
|---|---|---|
| Emoji box and strip (116 to 118) | `div.ef-emof > input#ef-emoin.ef-in.ef-emoin[data-emo=edit][role=combobox][aria-controls=sg-emo]` + `div.ef-cats.ef-strip#sg-emo[data-kind=emo]` under the name row; pills `button.ef-chip.ef-che[role=option]` with `span.che` (the emoji) and the name; `.add` = the person's own emoji ("Use this"), `.hl` = highlighted, `.on` = the item's emoji now; `.ef-sgn` = no match line; `.ef-ct` holds `IC.smile`. Same in Add | `emoji.js` (`model`, `draw`, `commit`, `settle`, `read`), `form.js` (`emoBox`, `emoReady`), `flyout.css` |
| The tiles (119) | `#ef-emo` focuses `#ef-emoin`; `#ief-emo` shows `div.ef-emof#ief-emof` (with `#ief-emoin`, `#ief-sg-emo`) under `.shead` and focuses it; `aria-expanded` on the header tile follows it | `flyout.js` (`parentInner`, `sheetemoji`), `emoji.js` (`sheetShow`) |
| Units (120, 121) | `unitOf` / `IEF.unitMatch` (seed table `SEED`, fold `ukey`, plural `singular`, counts from the items) and `IEF.splitQty`; used by the Unit box, the quantity box and the own-words box (`setQty`: one History line). The note under the Unit box says what Enter keeps | `form.js` |

**Removed:** the picker (`.ef-ep`, `.ef-eps`, `.ef-epi`, `.ef-eph`, `.ef-epr`, `.ef-epa`, `.ef-eg`, `.ef-e`, `.ef-eno`), `.panel[data-emoji]` and the phone's taller sheet for it. **Kept:** the 133-entry list (114), the placeholder wording (115), the tiles (106), Recent on this device.

**For the build.** The hidden `emoji` and `emoji_none` fields stay the posted values; the visible box is not posted. The strip's keys are the Location strip's; the box's Esc is answered on the box so the sheet's or the Add panel's Esc does not fire. The unit matcher is one server function used by every path that takes a unit (form, item sheet, chat tools) with a browser mirror held to the same table by tests.

