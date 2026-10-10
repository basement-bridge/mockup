# Item edit flyout: handover

<<<<<<< Updated upstream
**Status: round 2 drawn 11 October 2026 (Sydney), for anyone to pick up cold.** The mockup is drawn and merged to mockup `main` (round 1: PR 72, 10 Oct; round 2: the PR titled "item edit flyout round 2", 11 Oct). Nothing is built in the real app. Confirmed by the owner on 11 Oct: layout A (71) and key hints shown on the icons (68). Everything else, including the round 2 changes (decisions 82 to 93), is a proposal waiting for his look. Read `AGENTS.md` and `DESIGN.md` in this repo first (sections 6, 7, 9 and 10 bite most). Style follows `docs/handover/plan-desktop.md`.
=======
**Status: round 3 drawn 11 October 2026 (Sydney), for anyone to pick up cold.** The mockup is drawn and merged to mockup `main` (round 1: PR 72, 10 Oct; round 2: the PR titled "item edit flyout round 2", PR 74, squash 776e396, 11 Oct; round 3: PR 76, squash 9d7cf7b, 11 Oct). Nothing is built in the real app (a parallel build is in Kitchie `uat`; it must match this mockup exactly). Confirmed by the owner: layout A (71) and key hints shown (68) by typed note; and by voice on 11 Oct (round 3) the battery everywhere (94), the four bands for counted and weighed with a minimum (84), no-minimum rule (95), increase-only reset (96), category and unit chips plus free text (97, 98), the buy default aim (99), the use-by quick set (92), identical look everywhere and no shopping effect (100, 101). Still proposals: the rest of 63 to 93 that is not marked confirmed. Section 10 (new) is what the Kitchie build copies for the battery. Read `AGENTS.md` and `DESIGN.md` in this repo first (sections 6, 7, 9 and 10 bite most). Style follows `docs/handover/plan-desktop.md`.
>>>>>>> Stashed changes

## 1. The ask, in the owner's words

Owner (voice session, 10 October 2026, relayed and kept close to the words): replace the full-page **Edit item** form with a **flyout**, in the same pattern as the Pantry item flyout and sheet. It opens **nested beneath the already-open item flyout**, not as a page. Reuse the existing tokens, classes, motion, close and back behaviour and keyboard handling. In the item flyout header, next to the close button: an **edit (pencil)** icon that replaces the hamburger; a new **history (clock)** icon that opens that item's change history in a nested flyout or panel (who, what, when, plain); shortcut hints, **E** labelled "edit" and **comma** labelled "history", shown or revealed the way the Pantry and desktop mockups do, and the shortcuts must work. **Mark as used up** and **Add to shopping list** stay exactly as the Pantry item sheet has them. Hands off, best judgment, visual options only where there is a real choice, phone and desktop, viewport code in its own files, touch behaviours (swipe or drag to dismiss) also working with a mouse. Cover every field of the current app form (Kitchie uat v0.70.0, read only).

**Round 2 (owner, typed notes, 11 October 2026).** Confirmed: layout A; hints shown on the icons (his note also has the line "LAYOUT OF THE FIELDS: THE REAL CHOICE - Reveal", read as pasted from the options page, open question 1). Changes: (1) level as a battery icon with the same colour bands, always editable by the user, a counted item automatic by default, a weighed or worded item four icons to pick, and an override rule (a pick follows the rules against the minimum; a later quantity revision resets it to automatic until the next pick) with a small "automatic" versus "set by you" cue; (2) the Shopping list group in two states, with a quantity (quantity-based amount, own-words box hidden until the quantity is cleared) and without one (own-words box); (3) Location, Spot and Category as the new-item form in Kitchie `uat` (text inputs with suggestion lists), Category's suggestions possibly as the chip row of his first screenshot, Use by with the same quick pills; (4) the emoji, broken in the real app in both Add and Edit, replaced by the mockup's tile and picker for both.

Known issues round 1 had to resolve: the Shopping list heading had no space above it and showed on both tabs; the "Level: plenty" word chip contradicts the 8 October rule (level is a drop, no visible name); no mockup existed for the two-tab form or the inline shopping block.

## 2. What exists and where

| What | Where |
|---|---|
| Options page (options, field table, decisions, open questions, what loads) | `fragments/item-edit-flyout/index.html`; live (not verified from the sandbox, check it): <https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html> |
| Live host (Pantry list, item flyout, edit, history, add) | `fragments/item-edit-flyout/pantry.html`, with URL options below |
| Job note, decisions 63 to 93 | `docs/knowledge/jobs-to-be-done/item-edit-flyout.md` |
| Item sheet it extends | `docs/knowledge/item-sheet.md`, `fragments/item-sheet/` |
| Pantry desktop rules it copies | `docs/knowledge/desktop-layout.md`, `docs/handover/desktop.md` |
| Screenshot tool entries | `tools/screenshots.mjs` (`item-edit-flyout`, `item-edit-flyout-live`, `-level`, `-shop-qty`, `-shop-words`, `-add`); screenshots are not kept in the repo (`shots/` is gitignored) |
| Behaviour and layout check | `tools/item-edit-flyout-check.mjs`: headless Chromium, 390, 768, 1024 and 1440 wide, light and dark, 560 checks (level override, both shopping states, suggestion lists, chip row, emoji picker in Edit and Add, keys, drag, console, sideways scroll). Run it before changing the fragment |

**Open it and switch size.** Serve the repo (`python3 -m http.server`) and open the options page, or the Pages URL. Any `pantry.html` link accepts `?vp=390|768|1024|1280|1440|1920`, which frames it in an iframe at that width; move the pointer to the top edge or press backtick for a hidden size control.

**URL options** on `pantry.html`: `sel=<id>` (butter, carrots, cheddar, eggs, yog, milk, paneer, spinach, rice, tom, onion, garam, peas, ice), `child=edit|history`, `mode=add`, `hint=show|reveal`, `recipes=0` (no Recipes), `down=1` (a failed save), `field=<name>` (land on a field), `lv=battery|drop` (the level icon), `cat=chips|list` (Category suggestions), `more=` (History pages), `cues=0` (hints off), `help=1` (shortcut list). `opt=` and `tab=` are gone with layouts B and C.

**File layout (viewport code in its own files, DESIGN.md section 7).**

- Shared, no size rules: `flyout.css`, `flyout.js`, `frame.js`; fetched on engagement: `form.js` (first Edit or Add), `emoji.js` (first time the emoji picker opens), `history.js` (first History open).
- Per size: `phone.css` and `tablet.css` (media gated), `desktop.css` (min-width 1024) and `desktop-1240.css` (min-width 1240). One host script per size, fetched on demand: `phone.js` (touch, grab and drag, Esc) or `desktop.js` (rail, keys, shortcut list). A size change reloads the page.
- No images in the default path.

## 3. The options and the recommendation

Layout A, one scroll in five groups, is confirmed; the two tabs and the tiles were dropped and their code removed (git history, PR 72). Key hints shown on the icons is confirmed.

Still a real choice, drawn side by side on the options page: the level icon, **battery (recommended)** or the 8 October drop (`lv=`), and Category as the chip row (assumed) or the plain list (`cat=`). Recommendation for the battery: it reads as "how much is left" for tins and eggs where a drop says liquid, it keeps the same four colours, and it is used in both the form and the item flyout's tile so they agree; the cost is that the item sheet, list rows and Plan still draw drops until the owner says to change them (open question 2).

Nesting: from 1240 the child is a 360px column that slides out from beneath the item flyout; from 1024 it tucks under the item header in the same lane; below 1024 it is a stacked 84% sheet and the item shrinks to a strip. Add mode is the same form in the item flyout's place.

## 4. Decisions 63 to 93

Full wording and statuses in the job note (`docs/knowledge/jobs-to-be-done/item-edit-flyout.md`).

| # | Status | Decision in one line |
|---|---|---|
| 63 | proposed | A flyout nested under the open item, never a page |
| 64 | proposed | One child slot shared by Edit and History; toggle or swap |
| 65 | proposed | Desktop: 360px column from 1240, tucked under the header from 1024; History 320 to 360 |
| 66 | proposed | Phone and tablet: stacked 84% sheet, item as a strip; step back by strip, dim, drag, Esc |
| 67 | proposed | Header order pencil, clock, x; open child's icon filled; phone keeps no x |
| 68 | **confirmed 11 Oct** | Key hints shown on the icons; "E edit", ", history"; cue switch; desktop only |
| 69 | proposed | Close is Ctrl/Cmd Enter (desktop) and Esc (phone), top layer first |
| 70 | proposed | A tile tap lands on that field in Edit |
| 71 | **confirmed 11 Oct** | Layout A; tabs do not survive; tiles dropped |
| 72 | **superseded 11 Oct** by 82 to 86 | (was) level is a drop, counted level read only |
| 73 | proposed | Minimum under Quantity, only with a unit or minimum |
| 74 | proposed (refined by 87 to 89) | Shopping list once, spaced, at the end; Used up and Add to shopping unchanged |
| 75 | proposed | "Use in a recipe" a plain row at the bottom; hidden without Recipes |
| 76 | proposed | Mark as used up not repeated in the form |
| 77 | proposed | Autosave, "Saved", Try again on errors; name needed; no past use-by |
| 78 | proposed | Add item is the same form in add mode, own footer, Unplaced by default |
| 79 | proposed | History: this item only, 3 days then 5 more, fetched on open |
| 80 | **confirmed in substance 11 Oct** (extended by 93) | Emoji tile with picker and "No emoji"; no photos; for Add and Edit |
| 81 | proposed | Viewport code in its own files |
| 82 | proposed (owner-requested) | One picker of four icons for every item; always editable; counted automatic by default |
| 83 | proposed (owner-requested; recommended) | Battery icon, same colour bands, replaces the drop in this flyout and its tile; `lv=drop` kept |
| 84 | proposed | Automatic rules for counted items and numbers with a minimum; weighed with a minimum follows them; others keep the label |
| 85 | proposed (owner's rule as drawn) | A pick wins until the quantity is next revised, then automatic again |
| 86 | proposed | Muted "Automatic" / "Set by you" cue, only where rules apply, with a back-to-automatic icon |
| 87 | proposed | Shopping group: status line, how much to buy, the button |
| 88 | proposed | With a quantity: a number stepper in the item's unit; own-words box hidden |
| 89 | proposed | With no quantity: own-words box; a new Clear beside Quantity brings it back |
| 90 | proposed | Location and Spot: text inputs with suggestion lists, as the Add form |
| 91 | proposed assumption | Category: same input, suggestions as the filter bar's chip row; `cat=list` for the plain list |
| 92 | proposed | Use by: the Add form's +3 days, +5 days, +1 week, Pick date... |
| 93 | proposed | Emoji picker: search, Recent, about 126 foods, "No emoji"; Esc closes it only |

## 5. Open questions

Full text with what a wrong guess costs is in the job note. New on 11 Oct: (1) the pasted "Reveal" line in the note; (2) battery everywhere or only here; (3) weighed with a minimum automatic?; (4) how to read "follows the user's pick relative to the rules against the minimum"; (5) what counts as a revised quantity; (6) does a picked level feed the shopping list; (7) the back-to-automatic icon; (8) the default amount to buy; (9) a "say it in your own words" link; (10) is the chip row what the first screenshot meant; (11) the old Use by pills; (12) any emoji by typing or pasting. Still open from 10 Oct: (13) phone no-x, (14) History column width, (15) History on the phone, (16) the "Estimated" flag, (17) inline tile editor, (18) where Open the list and Use in a recipe land, (19) Add defaults to Unplaced. Answered: layout A, key hints shown, counted level editable.

## 6. What is NOT decided or built

- Nothing is built in Kitchie. No Kitchie issue was created or changed by this work (the owner's rule for this task).
- The override rule, the weighed-with-minimum reading and the shopping amount default are my readings of voice-style notes; they are marked proposed and listed as questions.
- Data and history are sample data. History mirrors the shape of `store.getHistory(id)` and the MCP `item_history` tool; the real field names and sources are to be checked at build time.
- Phone, tablet and desktop were checked with headless Chromium only (`tools/item-edit-flyout-check.mjs`). Not checked: the Pages URL from the sandbox, a real touch device and its soft keyboard (the suggestion lists place themselves above the keyboard by measuring the visible area, untested on a device), screen readers, Safari and Firefox, the native date picker behind "Pick date...", the real app's form code. Kitchie `uat` was read, never run or changed.

## 7. Next steps once the owner confirms

Proposal for slicing, not agreed: settle section 5 here and in the job note (mockup first if anything changes); the nested child slot and header icons; the form in layout A shared with Add through `formFields()`; the level control and override (82 to 86); the Shopping list group states (87 to 89); the Add form's combobox, chip row and use-by pills in the flyout (90 to 92); the emoji picker for Add and Edit (93, which also fixes the broken emoji); History; keyboard layer (E, comma, close); per-size files. Open Kitchie issues for slices from the confirmed decisions only. Build in the mockup-to-UAT order (Kitchie `uat`, never `main`). Screens must match the mockup exactly; list each difference in the PR. Chat tools and the UI call the same service methods. Headless screenshots at the bucket widths before asking the owner to look.

## 8. Process notes

- Mockups merge straight to mockup `main` (owner, 9 October 2026): no `uat`, no approval step. Never merge anything in Kitchie. Do not touch Kitchie or the Kitchie mockup repo from this work.
- `gh pr create` fails from Claude Code sessions (GraphQL 403). Use `gh api repos/basement-bridge/mockup/pulls --input <json>`, then `gh api -X PUT repos/basement-bridge/mockup/pulls/N/merge -f merge_method=squash`.
- Commits and PR descriptions carry the session trailer lines. This repo is public: no secrets, no personal details of real people.
- The Pages URL was not verified from the sandbox; open it once and fix this file if it differs.

## 9. Links

- This handover: [blob](https://github.com/basement-bridge/mockup/blob/main/docs/handover/item-edit-flyout.md).
- Job note: [blob](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/item-edit-flyout.md).
- Options page: [source](https://github.com/basement-bridge/mockup/blob/main/fragments/item-edit-flyout/index.html), [live](https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html).
<<<<<<< Updated upstream
- Round 1: PR 72, squash eb35f8f. Round 2: see `git log --oneline -- fragments/item-edit-flyout` on mockup `main` (the PR titled "item edit flyout round 2").
=======
- Round 1: PR 72, squash eb35f8f. Round 2: PR 74, squash 776e396. Round 3: PR 76, squash 9d7cf7b.
>>>>>>> Stashed changes
- Rules: [`AGENTS.md`](https://github.com/basement-bridge/mockup/blob/main/AGENTS.md), [`DESIGN.md`](https://github.com/basement-bridge/mockup/blob/main/DESIGN.md). Related: [`plan-desktop.md` handover](https://github.com/basement-bridge/mockup/blob/main/docs/handover/plan-desktop.md) (decisions 49 to 62).
