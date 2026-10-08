# Pantry rows: swipe to use, use up, or shop

Status: mockup for the owner to review (8 Oct 2026). Not built in Kitchie. Source: owner's voice spec. Lines marked **Proposal** are mockup choices where the spec was silent.

Code: `flows/household/app.js` (`rowHtml`, `useone`, `markUsedUp`, `DEEP`), `flows/household/{mobile,tablet,desktop}/styles.css` (`.pswipe`).

## What the owner asked for

- No minus, tick or arrow buttons on a pantry row. Gestures only.
- Swipe left a little: take one increment off. For a counted item that is one. For a freeform or level-only amount, zero it and mark it Out.
- Swipe left a long way: always zero the item and mark it Out.
- Swipe right: add to the shopping list.
- Nothing is deleted. A used-up item stays in the pantry showing Out.
- Tapping a row opens the item. The owner wants it as a half-height bottom sheet and chose the tile grid layout; the row now opens that sheet. Spec and proposals: `item-sheet.md`.

## What the mockup does

| Gesture | Counted item | Level-only item |
|---|---|---|
| Left, past 90px | Use one (one off the count; the last one means used up) | Used up |
| Left, past 190px | Used up | Used up |
| Right, past 90px | Add to shopping list | Add to shopping list |

Every action shows a toast with Undo. Used up sets the amount to 0; the row dims and reads "Out".

Visual cue: the row slides off a coloured panel. Right shows a cart and "Add to list". Left shows "Use one" (counted) or "Used up". Past the deep line the panel turns to the danger colour and reads "Used up", with a short vibration where the device allows. Only on level-only items there is no deep stage, since both mean the same.

## Proposals (not from the owner)

- **Counted vs level-only.** Counted means the unit is a count (pack, tin, jar, bottle, bag, box, carton, bunch, roll, or none). Weights and volumes (g, mL, kg, L) are level-only. Open: should weighed items take a step off instead (the code has 50 g / 0.5 kg steps)?
- Thresholds 90px and 190px.
- Press-and-hold to pick several is not on these rows (it stays on the Running low filter).
- Items at 0 stay in the list rather than moving to the end.
