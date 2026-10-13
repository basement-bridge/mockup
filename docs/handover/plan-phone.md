# Plan on the phone: handover

Short status file; the full decision history is `docs/knowledge/jobs-to-be-done/plan-ui-review.md` (decisions 63 to 281, cite as "Plan UI review N"). Mockup: `fragments/plan-ui-review/phone.html`. Read `AGENTS.md` and `DESIGN.md` first. Desktop counterpart: [plan-desktop.md](plan-desktop.md).

## Status, 14 October 2026
Mockup only; nothing is built in Kitchie. Latest revision (PR open, not merged, for the owner): decisions 276 to 281 (nineteenth revision).

## What changed in this revision
- A hold never blocks; Replan removes the hold and releases the held ingredients, named in the note (276).
- Replan, Not cooking and Clear week take the meal's own amounts off the unbought shopping list: a reduced line, a removed line, bought items untouched; shown in the day note with Undo (277). A stand-in Shopping list opens from the nav button, with a badge and a Bought button.
- Red is only for urgent or blocking states: the Replan swipe reveal and use-by chips are no longer red (278).
- The detail order is the phone's and desktop now matches it (279).
- Plain grey is for past days only; desktop folds nothing (280, 281).

## Open questions
1. Hand-edited line amounts: only the removed meal's automatic amount comes off (not drawn).
2. Should the phone's Not cooking follow desktop's accent block (156 vs 119)? Not asked, not changed.
3. Which reds does the owner want back (275, 278)?
4. Open recipe: the ... menu on the phone (127), a link on desktop.
5. Carried from earlier revisions: see the job note.

## Next steps
Owner reads the PR; the build copies the mockup's CSS and markup first; the real service must remember which meal caused each shopping amount, and `plan_remove_meal` must release the hold and take unbought amounts off.

## Check
`tools/plan-ui-replan-cleanup-check.mjs` (66) and the other `tools/plan-ui-*-check.mjs`, run one at a time.
