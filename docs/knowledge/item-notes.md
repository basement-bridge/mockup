# Item notes: free text on Pantry items and shopping rows

Status: mockup for the owner to review (19 Oct 2026). Kitchie [#986](https://github.com/basement-bridge/kitchie/issues/986). Not built. Lines marked **Proposal** are mockup choices where the owner's words were silent.

## What the owner asked for

Owner, 19 Oct 2026 (relayed): a shopping row "apples" or "cucumber" lacks detail (crunchy, Pink Lady or Jazz, not floury; Persian or Lebanese, the tasty kind). Kitchie has no comment field, so details get stuffed into change history. Free text, not fixed preference options. The item name stays plain; the note carries the detail.

- IN-D1: the inventory note is carried onto the shopping row when the item is added or runs low, with an optional trip-specific edit.
- IN-D2: a note written on a shopping row becomes the Pantry item's note when bought, even if the item never existed in the Pantry.
- IN-D3: adding an item that already has a Pantry note shows it pre-filled, to keep, tweak or replace. Whatever is on the row when bought becomes the Pantry note, so nothing is overwritten unseen.

## What the mockup does

`fragments/item-notes/`: two shopper-link phones side by side, then the add-to-list sheet and the Pantry item sheet.

- **UAT today** is an iframe of `fragments/shopper-link/list.html` — the page a shopper actually opens in UAT (brand, Undo, promise, the 12 lines, empty Also got, 46-hour line). No notes, no extra items.
- **With notes** is `fragments/shopper-link/list-notes.html` — the same 12 lines. Eggs, Milk and Tomatoes get a quiet `.sl-note` subline; every other line is identical to UAT. The shopper cannot edit a note (IN-P2).
- Add-to-list and Pantry use those same UAT names (Milk, Eggs, Rice), not a second invented list.

Revised 19 Oct after owner feedback (less text, more visual), then again the same day to baseline on UAT: the earlier shopping column invented extra groceries (cucumber, apples, sourdough, butter) and a note on most rows, which is not what the shopper link shows.

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
