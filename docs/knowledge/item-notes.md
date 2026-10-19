# Item notes: free text on Pantry items and shopping rows

Status: mockup for the owner to review (19 Oct 2026). Kitchie [#986](https://github.com/basement-bridge/kitchie/issues/986). Not built. Lines marked **Proposal** are mockup choices where the owner's words were silent.

## What the owner asked for

Owner, 19 Oct 2026 (relayed): a shopping row "apples" or "cucumber" lacks detail (crunchy, Pink Lady or Jazz, not floury; Persian or Lebanese, the tasty kind). Kitchie has no comment field, so details get stuffed into change history. Free text, not fixed preference options. The item name stays plain; the note carries the detail.

- IN-D1: the inventory note is carried onto the shopping row when the item is added or runs low, with an optional trip-specific edit.
- IN-D2: a note written on a shopping row becomes the Pantry item's note when bought, even if the item never existed in the Pantry.
- IN-D3: adding an item that already has a Pantry note shows it pre-filled, to keep, tweak or replace. Whatever is on the row when bought becomes the Pantry note, so nothing is overwritten unseen.

## What the mockup does

`fragments/item-notes/`: the add-to-list sheet with three scenarios (Pantry has a note; edited for this trip; never in the Pantry), the shopping list with notes under names, and the Pantry item sheet with a Note row. A live helper line under the box says what buying will do to the Pantry note.

## Proposals

- IN-P1: plain text, about 200 characters.
- IN-P2: one note per item, shared by the household, read-only on the shopper link.
- IN-P3: a note edit is a History entry, so Undo covers it, the bought path included.
- IN-P4: clearing the box and buying clears the Pantry note; the helper line says so first.
- IN-P5: "Use the Pantry note" appears only when the box differs from it.

## Open

- IN-Q1: a running-low row is computed and not stored. Drawn as: reads the Pantry note live, stored only once edited.
- IN-Q2: whether a trip-only edit should ever leave the Pantry note alone on buy. Drawn as no, following IN-D3.

Related: Kitchie #832 (idea: item comments field), overlaps.
