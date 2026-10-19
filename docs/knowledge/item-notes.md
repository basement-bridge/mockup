# Item notes: free text on Pantry items and shopping rows

Status: mockup for the owner to review (19 Oct 2026). Kitchie [#986](https://github.com/basement-bridge/kitchie/issues/986). Not built. Lines marked **Proposal** are mockup choices where the owner's words were silent.

## Drawn from kitchie `uat`

Redrawn 19 Oct 2026 from kitchie `uat` commit `dd0267c25f67ab3d227cba297765caaeb224907d` (merge of PR #985): the Shopping row (`server/src/web-shopping.ts`, `li.shoprow`, `.shome`) and the shopper link page (`server/src/shopper-page.ts`, `server/src/assets/shopper.js`). Re-check `uat` before revising.

Owner concern (19 Oct): the list will look too cluttered once notes exist. Redraw: no chip, icon or pill per row; a note is one muted line in the row's existing `.shome` slot (two lines at most), only where a note exists; the household row shows the note in place of the location line (Proposal); the shopper link shows the note under the name, read-only, two lines at most. The "this trip" pill is dropped from rows and stays only as a small word on the add sheet. The earlier fake list layout is gone; list.html and shopper.html use the app's own CSS.

Shopper link wording change (owner, 19 Oct): "Got something else" becomes "Got substitution?" (mockup updated in fragments/shopper-link). The build would change `server/src/shopper-page.ts:333`, `server/src/assets/shopper.js` lines 103, 315, 498 (and comments at 4, 333, 493, `inventory-port.ts:265`, `store.ts:3669`, `server/browser/shopper-link.browser.ts:99`). Not built; needs owner approval.

## What the owner asked for

Owner, 19 Oct 2026 (relayed): a shopping row "apples" or "cucumber" lacks detail (crunchy, Pink Lady or Jazz, not floury; Persian or Lebanese, the tasty kind). Kitchie has no comment field, so details get stuffed into change history. Free text, not fixed preference options. The item name stays plain; the note carries the detail.

- IN-D1: the inventory note is carried onto the shopping row when the item is added or runs low, with an optional trip-specific edit.
- IN-D2: a note written on a shopping row becomes the Pantry item's note when bought, even if the item never existed in the Pantry.
- IN-D3: adding an item that already has a Pantry note shows it pre-filled, to keep, tweak or replace. Whatever is on the row when bought becomes the Pantry note, so nothing is overwritten unseen.

## What the mockup does

(Superseded by the redraw above.) `fragments/item-notes/`: the add-to-list sheet with three scenarios (Pantry has a note; edited for this trip; never in the Pantry), the shopping list with notes under names, and the Pantry item sheet with a Note row. Revised 19 Oct after owner feedback (less text, more visual): no note shows nothing (no empty box, no reserved space); the add sheet has only a quiet "+ Note" chip, or the note as a tap-to-edit line; the two-way sync is one small icon with "Pantry" or "This trip"; a trip-only edit shows a "this trip" pill on the row; the history line and helper text are gone.

## Proposals

- IN-P1: plain text, about 200 characters.
- IN-P2: one note per item, shared by the household, read-only on the shopper link.
- IN-P3: a note edit is a History entry, so Undo covers it, the bought path included.
- IN-P4: clearing the box and buying clears the Pantry note; the helper line says so first.
- IN-P5: the "Pantry" reset chip appears only while editing and only when the note differs from the Pantry's.
- IN-P6: notes are optional everywhere; nothing prompts for one except the quiet chip on the add sheet.
- IN-P3 still holds (a note edit is a History entry) but is no longer drawn.

## Open

- IN-Q1: a running-low row is computed and not stored. Drawn as: reads the Pantry note live, stored only once edited.
- IN-Q2: whether a trip-only edit should ever leave the Pantry note alone on buy. Drawn as no, following IN-D3.

Related: Kitchie #832 (idea: item comments field), overlaps.
