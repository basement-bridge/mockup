# Item edit flyout: handover

**Status: round 3 drawn 11 October 2026 (Sydney), for anyone to pick up cold.** The mockup is drawn and merged to mockup `main` (round 1: PR 72, 10 Oct; round 2: the PR titled "item edit flyout round 2", PR 74, squash 776e396, 11 Oct; round 3: PR 76, squash 9d7cf7b, 11 Oct). Nothing is built in the real app (a parallel build is in Kitchie `uat`; it must match this mockup exactly). Confirmed by the owner: layout A (71) and key hints shown (68) by typed note; and by voice on 11 Oct (round 3) the battery everywhere (94), the four bands for counted and weighed with a minimum (84), no-minimum rule (95), increase-only reset (96), category and unit chips plus free text (97, 98), the buy default aim (99), the use-by quick set (92), identical look everywhere and no shopping effect (100, 101). Still proposals: the rest of 63 to 93 that is not marked confirmed. Section 10 (new) is what the Kitchie build copies for the battery. Read `AGENTS.md` and `DESIGN.md` in this repo first (sections 6, 7, 9 and 10 bite most). Style follows `docs/handover/plan-desktop.md`.

## 1. The ask, in the owner's words

Owner (voice session, 10 October 2026, relayed and kept close to the words): replace the full-page **Edit item** form with a **flyout**, in the same pattern as the Pantry item flyout and sheet. It opens **nested beneath the already-open item flyout**, not as a page. Reuse the existing tokens, classes, motion, close and back behaviour and keyboard handling. In the item flyout header, next to the close button: an **edit (pencil)** icon that replaces the hamburger; a new **history (clock)** icon that opens that item's change history in a nested flyout or panel (who, what, when, plain); shortcut hints, **E** labelled "edit" and **comma** labelled "history", shown or revealed the way the Pantry and desktop mockups do, and the shortcuts must work. **Mark as used up** and **Add to shopping list** stay exactly as the Pantry item sheet has them. Hands off, best judgment, visual options only where there is a real choice, phone and desktop, viewport code in its own files, touch behaviours (swipe or drag to dismiss) also working with a mouse. Cover every field of the current app form (Kitchie uat v0.70.0, read only).

**Round 2 (owner, typed notes, 11 October 2026).** Confirmed: layout A; hints shown on the icons (his note also has the line "LAYOUT OF THE FIELDS: THE REAL CHOICE - Reveal", read as pasted from the options page, open question 1). Changes: (1) level as a battery icon with the same colour bands, always editable by the user, a counted item automatic by default, a weighed or worded item four icons to pick, and an override rule (a pick follows the rules against the minimum; a later quantity revision resets it to automatic until the next pick) with a small "automatic" versus "set by you" cue; (2) the Shopping list group in two states, with a quantity (quantity-based amount, own-words box hidden until the quantity is cleared) and without one (own-words box); (3) Location, Spot and Category as the new-item form in Kitchie `uat` (text inputs with suggestion lists), Category's suggestions possibly as the chip row of his first screenshot, Use by with the same quick pills; (4) the emoji, broken in the real app in both Add and Edit, replaced by the mockup's tile and picker for both.

**Round 3 (owner, voice, 11 October 2026).** Nine confirmations and refinements, in the job note under "Round 3" and decisions 94 to 101: (1) battery everywhere, replaces the drop; (2) four bands for counted and weighed with a minimum; (3) no minimum is Plenty until 0, hand-set Some or Running low allowed; (4) a hand-set level clears only when the quantity increases; (5) shopping default aims at double the minimum; (6) Category and Unit are chips plus free text; (7) the use-by quick set of the `uat` Add form; (8) a hand-set level looks identical everywhere, never feeds the shopping list; (9) key hints shown, unchanged.

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
| Behaviour and layout check | `tools/item-edit-flyout-check.mjs`: headless Chromium, 390, 768, 1024 and 1440 wide, light and dark, 1056 checks (the level bands as a table, increase-only reset, no-minimum bands, weighed with a minimum, the buy default, category and unit free text, the battery drawings and no drop anywhere, hand-set looks the same as calculated, no automatic shopping, level override, both shopping states, suggestion lists, chip rows, emoji picker in Edit and Add, keys, drag, console, sideways scroll). Run it before changing the fragment |

**Open it and switch size.** Serve the repo (`python3 -m http.server`) and open the options page, or the Pages URL. Any `pantry.html` link accepts `?vp=390|768|1024|1280|1440|1920`, which frames it in an iframe at that width; move the pointer to the top edge or press backtick for a hidden size control.

**URL options** on `pantry.html`: `sel=<id>` (butter, carrots, cheddar, eggs, yog, milk, paneer, spinach, rice, tom, onion, garam, peas, ice), `child=edit|history`, `mode=add`, `hint=show|reveal`, `recipes=0` (no Recipes), `down=1` (a failed save), `field=<name>` (land on a field), `cat=chips|list` (Category suggestions; `list` is reference only now), `more=` (History pages), `cues=0` (hints off), `help=1` (shortcut list). `opt=` and `tab=` are gone with layouts B and C.

**File layout (viewport code in its own files, DESIGN.md section 7).**

- Shared, no size rules: `flyout.css`, `flyout.js`, `frame.js`; fetched on engagement: `form.js` (first Edit or Add), `emoji.js` (first time the emoji picker opens), `history.js` (first History open).
- Per size: `phone.css` and `tablet.css` (media gated), `desktop.css` (min-width 1024) and `desktop-1240.css` (min-width 1240). One host script per size, fetched on demand: `phone.js` (touch, grab and drag, Esc) or `desktop.js` (rail, keys, shortcut list). A size change reloads the page.
- No images in the default path.

## 3. The options and the recommendation

Layout A, one scroll in five groups, is confirmed; the two tabs and the tiles were dropped and their code removed (git history, PR 72). Key hints shown on the icons is confirmed.

The level icon is a battery everywhere (94, confirmed): the drop and the `lv=` option are gone. Category is the chip row plus free text (91, 97, confirmed); `cat=list` still draws the plain list for reference.

Nesting: from 1240 the child is a 360px column that slides out from beneath the item flyout; from 1024 it tucks under the item header in the same lane; below 1024 it is a stacked 84% sheet and the item shrinks to a strip. Add mode is the same form in the item flyout's place.

## 4. Decisions 63 to 101

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
| 72 | **superseded 11 Oct** by 82 to 86, drop by 94 | (was) level is a drop, counted level read only |
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
| 83 | **confirmed 11 Oct (voice)**; "here only" replaced by 94 | Battery icon, same colour bands |
| 84 | **confirmed 11 Oct (voice)**, no-minimum part refined by 95 | Four bands for counted and weighed with a minimum |
| 85 | **superseded 11 Oct by 96** | (was) any quantity change drops the pick |
| 86 | **confirmed 11 Oct (voice)**, inside the flyout only (100) | Muted "Automatic" / "Set by you" cue, with a back-to-automatic icon |
| 87 | proposed | Shopping group: status line, how much to buy, the button |
| 88 | proposed; default superseded by 99 | With a quantity: a number stepper in the item's unit; own-words box hidden |
| 89 | proposed | With no quantity: own-words box; a new Clear beside Quantity brings it back |
| 90 | proposed | Location and Spot: text inputs with suggestion lists, as the Add form |
| 91 | **confirmed 11 Oct (voice)**, extended by 97 | Category: input with the filter bar's chip row |
| 92 | **confirmed 11 Oct (voice)** | Use by: the Add form's +3 days, +5 days, +1 week, Pick date... in Edit and Add |
| 93 | proposed | Emoji picker: search, Recent, about 126 foods, "No emoji"; Esc closes it only |
| 94 | **confirmed 11 Oct (voice)** | Battery is the level icon everywhere; replaces the drop (confirms 83) |
| 95 | **confirmed 11 Oct (voice)** | No minimum: Plenty above 0, Out at 0, no bands; Some or Running low by hand (refines 84) |
| 96 | **confirmed 11 Oct (voice)** | A hand-set level clears only when the quantity next increases; a decrease never clears it (replaces 85) |
| 97 | **confirmed 11 Oct (voice)** | Category: chips plus free text (extends 91) |
| 98 | **confirmed 11 Oct (voice)** | Unit: quick-pick chips plus free text |
| 99 | **confirmed 11 Oct (voice)**; delta is a judgment call | Buy default aims at twice the minimum, drawn as the delta (replaces 88's default) |
| 100 | **confirmed 11 Oct (voice)** | A hand-set level looks identical everywhere; the cue stays inside the edit flyout |
| 101 | **confirmed 11 Oct (voice)** | A level never adds an item to the list and is not fed to the shopping logic |

## 5. Open questions

Full text with what a wrong guess costs is in the job note. Answered by voice on 11 Oct: 1 (shown), 2 (battery everywhere), 3 (weighed with a minimum: automatic), 4 and 5 (a pick clears only on an increase), 6 (display only), 7 (the cue as built stays; the back-to-automatic icon is kept, not separately asked), 8 (aim at twice the minimum), 10 (chip row, with free text), 11 (the Add form's set only). Still open: 9 (a "say it in your own words" link), 12 (any emoji by typing or pasting), 13 (phone no-x), 14 (History column width), 15 (History on the phone), 16 (the "Estimated" flag), 17 (inline tile editor), 18 (where Open the list and Use in a recipe land), 19 (Add defaults to Unplaced); new: 20 (delta or target for the buy default), 21 (a typed unit with no way to remove its chip), 22 (any screen outside this repo that draws a level icon).

## 6. What is NOT decided or built

- Nothing is built in Kitchie. No Kitchie issue was created or changed by this work (the owner's rule for this task).
- Judgment calls in round 3: the buy default is drawn as the delta to twice the minimum (target shown in a note under it) (99); the unit chip row and the category chip row share one component; a unit typed once stays as a chip. Nothing else was left to guess.
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
