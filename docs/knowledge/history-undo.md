# History: undo a Used up (kitchie #1102)

Mockup: `history/undo-used-up/index.html` (phone first). Issue: basement-bridge/kitchie#1102. Status: awaiting owner review; design review by a separate agent not yet done.

## Owner's words

Owner, by voice, 23 October 2026: a pop-up offers Undo for a short time after an item is marked used up. After it goes there is no way back. History is where he sees an item was used up, so there should be an Undo there.

Edge cases settled by the owner, by voice, 25 October 2026 (also posted on #1102): item changed since gets no button; already undone keeps today's server rule (undoing an undo is a redo, shown on History); same name re-added is allowed; last 50 steps stays; every step the server marks undoable gets the same control; sample items leave no history; level Out (#1048) is checked when that is built.

## Job to be done (DESIGN.md 9.2)

Get a wrongly used-up item back, after the 5-second bar has gone, from the place that shows it was used up.

## What the mockup draws

| Row | Shows | Why |
|---|---|---|
| Newest step for its item (yogurt) | Undo pill under the line | the one action on that row |
| Item changed since (cottage cheese) | nothing | the server refuses it (409); no dead control |
| Already undone (oats, used up) | name struck, Undone chip | state as glyph and word, not colour alone |
| The step that did the undo (oats, put back) | Redo pill | undoing an undo is a redo (today's server rule) |
| Any other undoable step (milk, used one) | same Undo pill | same control, same rule |

Press: the row flips to Undone, and the existing top-of-screen Undo bar returns for 5 seconds ("Put back: <name>" with Undo). In the mockup the bar sits at the bottom with the shared toast; the build keeps its existing bar.

## Presentation choices (DESIGN.md 9.4)

- A pill in the row's meta line (`.meta.hds`), not a swipe and not a second screen: one action per row, 44px target, row markup and avatar unchanged from `history/search`.
- State is glyph plus word (the undo arrow, "Undone"), not colour alone.
- One accent: the Undo and Redo pills. Only rows that can act carry one, so the screen has a few, never a column of them.

## Proposals (owner was silent; marked)

- **Proposal:** the pill label on the step that did the undo is "Redo". The server calls it an undo. Alternative: "Undo". Try both with `?mode=redo-word`. Wrong guess costs a copy change only.
- **Proposal:** the line for that step reads "put back <item>", matching the existing History title "Put back".
- **Proposal:** the pill sits in the meta line rather than at the row's right edge, so long item names keep the full width.

## Open questions

- Redo versus Undo wording (above).
- Is Undo also wanted inside the row's detail (the dialog a tap opens)? Not drawn.
- Desktop: History opens in the Settings window from 64rem. Same row, same pill; not drawn separately.

## Checks run (local, headless Chromium; not a real phone)

- Widths 360 and 390, light and dark; no sideways scroll; every Undo, Redo and toast Undo target 44px or more.
- Text size 130% at 390: no clipping.
- Not run: tablet, desktop window, a real phone, the separate design review (DESIGN.md 9.8).

## 9.8 checklist, author's answers (not the required independent review)

1. Jobs: named above; each row shows one action or none.
2. Accent: the Undo pill; rows without an action carry none.
3. Presentation: pill in the row; reason above.
4. Words: Undo, Redo, Undone, one word each; no repeated state.
5. Duplication: none; the Undo bar is the same one the Pantry already uses.
6. Targets: 44px measured.
7. Text size: 130% checked at 390, light.
8. Dark: checked; glyph plus word.
9. Warmth: the person's avatar and name lead each row, unchanged from History.

## Default path loads (DESIGN.md section 6)

`undo.css` (about 1 KB) and `undo.js` (about 1 KB) on top of the History files. The real build needs no new script: a plain form post to the existing `POST /history/<seq>/undo`.
