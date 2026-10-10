# Item edit flyout: handover

**Status: drawn 10 October 2026 (Sydney), for anyone to pick up cold.** The mockup is drawn and merged to mockup `main`. Nothing is built in the real app. Nothing is approved: decisions 63 to 81 are proposals by the design agent and wait for the owner. Read `AGENTS.md` and `DESIGN.md` in this repo first (sections 6, 7, 9 and 10 bite most). Style follows `docs/handover/plan-desktop.md`.

## 1. The ask, in the owner's words

Owner (voice session, 10 October 2026, relayed and kept close to the words): replace the full-page **Edit item** form with a **flyout**, in the same pattern as the Pantry item flyout and sheet. It opens **nested beneath the already-open item flyout**, not as a page. Reuse the existing tokens, classes, motion, close and back behaviour and keyboard handling. In the item flyout header, next to the close button: an **edit (pencil)** icon that replaces the hamburger; a new **history (clock)** icon that opens that item's change history in a nested flyout or panel (who, what, when, plain); shortcut hints, **E** labelled "edit" and **comma** labelled "history", shown or revealed the way the Pantry and desktop mockups do, and the shortcuts must work. **Mark as used up** and **Add to shopping list** stay exactly as the Pantry item sheet has them. Hands off, best judgment, visual options only where there is a real choice, phone and desktop, viewport code in its own files, touch behaviours (swipe or drag to dismiss) also working with a mouse. Cover every field of the current app form (Kitchie uat v0.70.0, read only).

Known issues it had to resolve: the Shopping list heading had no space above it and showed on both tabs; the "Level: plenty" word chip contradicts the 8 October rule (level is a drop, no visible name); no mockup existed for the two-tab form or the inline shopping block.

## 2. What exists and where

| What | Where |
|---|---|
| Options page (options, field table, decisions, open questions, what loads) | `fragments/item-edit-flyout/index.html`; live (not verified from the sandbox, check it): <https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html> |
| Live host (Pantry list, item flyout, edit, history, add) | `fragments/item-edit-flyout/pantry.html`, with URL options below |
| Job note, decisions 63 to 81 | `docs/knowledge/jobs-to-be-done/item-edit-flyout.md` |
| Item sheet it extends | `docs/knowledge/item-sheet.md`, `fragments/item-sheet/` |
| Pantry desktop rules it copies | `docs/knowledge/desktop-layout.md`, `docs/handover/desktop.md` |
| Screenshot tool entries | `tools/screenshots.mjs` (`item-edit-flyout`, `item-edit-flyout-live`); screenshots are not kept in the repo (`shots/` is gitignored) |

**Open it and switch size.** Serve the repo (`python3 -m http.server`) and open the options page, or the Pages URL. Any `pantry.html` link accepts `?vp=390|768|1024|1280|1440|1920`, which frames it in an iframe at that width; move the pointer to the top edge or press backtick for a hidden size control.

**URL options** on `pantry.html`: `sel=<id>` (butter, carrots, cheddar, eggs, yog, milk, paneer, spinach, rice, tom, onion, garam, peas, ice), `opt=a|b|c` (layout), `child=edit|history`, `mode=add`, `hint=show|reveal`, `recipes=0` (no Recipes), `down=1` (a failed save), `field=<name>` (land on a field), `tab=` and `more=` (layout B tab, History pages), `cues=0` (hints off), `help=1` (shortcut list).

**File layout (viewport code in its own files, DESIGN.md section 7).**

- Shared, no size rules: `flyout.css`, `flyout.js`, `frame.js`; fetched on engagement: `form.js` (first Edit or Add), `history.js` (first History open).
- Per size: `phone.css` and `tablet.css` (media gated), `desktop.css` (min-width 1024) and `desktop-1240.css` (min-width 1240). One host script per size, fetched on demand: `phone.js` (touch, grab and drag, Esc) or `desktop.js` (rail, keys, shortcut list). A size change reloads the page.
- No images in the default path.

## 3. The options and the recommendation

Layout A (recommended): one scroll in five groups, Item, Amount, Where, Use by, Shopping list, then the recipe action. Layout B: the app's two tabs kept (Details, Stock and more). Layout C: tiles, one field at a time. Hint look: show (default) or reveal. A and the "show" caps are the design agent's recommendation only.

Nesting: from 1240 the child is a 360px column that slides out from beneath the item flyout; from 1024 it tucks under the item header in the same lane; below 1024 it is a stacked 84% sheet and the item shrinks to a strip. Add mode is the same form in the item flyout's place.

## 4. Decisions 63 to 81

All **proposed, not confirmed**. Full wording in the job note (`docs/knowledge/jobs-to-be-done/item-edit-flyout.md`).

| # | Decision in one line |
|---|---|
| 63 | A flyout nested under the open item, never a page |
| 64 | One child slot shared by Edit and History; toggle or swap |
| 65 | Desktop: 360px column from 1240, tucked under the header from 1024; History 320 to 360 |
| 66 | Phone and tablet: stacked 84% sheet, item as a strip; step back by strip, dim, drag, Esc |
| 67 | Header order pencil, clock, x; open child's icon filled; phone keeps no x |
| 68 | Key caps on icons (show) or revealed; "E edit", ", history"; cue switch; desktop only |
| 69 | Close is Ctrl/Cmd Enter (desktop) and Esc (phone), top layer first |
| 70 | A tile tap lands on that field in Edit |
| 71 | Layout A recommended; tabs do not survive; tiles not recommended |
| 72 | Level is a drop, never a word; counted level worked out |
| 73 | Minimum under Quantity, only with a unit or minimum |
| 74 | Shopping list once, spaced, at the end; Used up and Add to shopping unchanged |
| 75 | "Use in a recipe" a plain row at the bottom; hidden without Recipes |
| 76 | Mark as used up not repeated in the form |
| 77 | Autosave, "Saved", Try again on errors; name needed; no past use-by |
| 78 | Add item is the same form in add mode, own footer, Unplaced by default |
| 79 | History: this item only, 3 days then 5 more, fetched on open |
| 80 | Emoji tile with picker and "No emoji"; no photos |
| 81 | Viewport code in its own files |

## 5. Open questions

1. Layout A, B or C?
2. Phone: keep no close x on the item sheet, now it has two icons?
3. Hint look: show or reveal?
4. History column 320 to 360?
5. History on phone too?
6. The "Estimated" flag: not seen in the 0.70.0 form read, left out. In or out?
7. Should a tile tap open an inline editor instead?
8. Counted item's level read only in the form?
9. Where "Open the list" and "Use in a recipe" land.
10. Add: new items default to Unplaced?

## 6. What is NOT decided or built

- Nothing is built in Kitchie. No Kitchie issue was created or changed by this work (the owner's rule for this task).
- Data and history are sample data. History mirrors the shape of `store.getHistory(id)` and the MCP `item_history` tool; the real field names and sources are to be checked at build time.
- Phone, tablet and desktop were checked with headless Chromium only. Not checked: the Pages URL from the sandbox, a real touch device and its soft keyboard, screen readers, Safari and Firefox, the real app's form code.

## 7. Next steps once the owner confirms

Proposal for slicing, not agreed: settle section 5 here and in the job note (mockup first if anything changes); the nested child slot and header icons; the form in the chosen layout shared with Add through `formFields()`; History; keyboard layer (E, comma, close); per-size files. Open Kitchie issues for slices from the confirmed decisions only. Build in the mockup-to-UAT order (Kitchie `uat`, never `main`). Screens must match the mockup exactly; list each difference in the PR. Chat tools and the UI call the same service methods. Headless screenshots at the bucket widths before asking the owner to look.

## 8. Process notes

- Mockups merge straight to mockup `main` (owner, 9 October 2026): no `uat`, no approval step. Never merge anything in Kitchie. Do not touch Kitchie or the Kitchie mockup repo from this work.
- `gh pr create` fails from Claude Code sessions (GraphQL 403). Use `gh api repos/basement-bridge/mockup/pulls --input <json>`, then `gh api -X PUT repos/basement-bridge/mockup/pulls/N/merge -f merge_method=squash`.
- Commits and PR descriptions carry the session trailer lines. This repo is public: no secrets, no personal details of real people.
- The Pages URL was not verified from the sandbox; open it once and fix this file if it differs.

## 9. Links

- This handover: [blob](https://github.com/basement-bridge/mockup/blob/main/docs/handover/item-edit-flyout.md).
- Job note: [blob](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/item-edit-flyout.md).
- Options page: [source](https://github.com/basement-bridge/mockup/blob/main/fragments/item-edit-flyout/index.html), [live](https://basement-bridge.github.io/mockup/fragments/item-edit-flyout/index.html).
- The PR and squash commit are the ones titled "item edit flyout" on mockup `main` (`git log --oneline -- fragments/item-edit-flyout`).
- Rules: [`AGENTS.md`](https://github.com/basement-bridge/mockup/blob/main/AGENTS.md), [`DESIGN.md`](https://github.com/basement-bridge/mockup/blob/main/DESIGN.md). Related: [`plan-desktop.md` handover](https://github.com/basement-bridge/mockup/blob/main/docs/handover/plan-desktop.md) (decisions 49 to 62).
