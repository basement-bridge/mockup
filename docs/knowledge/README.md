# Knowledge

What we have learned and decided about the product, written so it can be carried from the mockups into the real implementation. Mockups are drafts; this folder is the reasoning behind them.

- `jobs-to-be-done/`: one file per job. See its README for the convention and the status of each job.
- `pantry-pull-row.md`: the Pantry top row (Filters and Add, pull for search, pull further to refresh): thresholds, timings, animations.
- `pantry-swipe.md`: swipe gestures on pantry rows (use one, used up, add to shopping list); counted vs level-only is a proposal.
- `item-sheet.md`: the half-height bottom sheet a pantry row opens (tile grid, owner's choice); counted vs level-only, Used up, All fields, and the proposals it had to make.
- `people-settings.md`: Settings > People split into Me and Household: what is on each, removing people, leaving with a typed name.
- `locations-spots.md`: Settings > Kitchen locations (parents) and spots (children): three management options, proposals, open questions.
- `shopper-link.md`: the one-off link that lets someone who is not in the app tick off the shared shopping list (48 hours, no sign-in): the owner's words and decisions, the proposals from Kitchie issue #479 and from the drawing, thresholds, open questions; phase two (scan the receipt) is drawn only.
- `desktop-layout.md`: desktop (1024px and up) as a left rail, an off-centre column and a side panel that sits one gutter from the list; settled direction, proposals, open questions.
- `preferences-option-a.md`: what the code holds for person and household preferences, and option A (one list, a You / Household switch per row); awaiting approval, A-1 to A-10 are proposals.
- `user-preferences/`: how the system learns about people and decides what to act on (evidence grades, thresholds). Start with `evidence-grading.md`; the tool contract is in `boundary-contract.md`.
- `user-preferences/option-b-mine-and-household.md`: what the code records at person and household level (checked in Recipe, Kitchie and platform), open questions, and Option B (Mine and Household as two sections), awaiting approval.
- `user-preferences/option-c-propose-for-another-member.md`: the owner's shape (10 Oct 2026) for a member proposing a preference for another member (written on the subject's own list, effective at once, courtesy notice, accept, edit or reject), what the code holds and would need, drawn on option B's layout; option C and its open questions are awaiting approval.
- `preferences-principles.md`: the owner's six standing principles for preference and notification design (subject control, gating by level, propose is not finalise, safety first, acknowledgment on the subject's terms, forward-looking changes); check new preference work against it.

Capture what the owner says. Do not add proposals of your own here. If something is a proposal, mark it as one and say who asked for it.

## Principle for every AI interaction

Closed vocabulary where the logic acts, free text everywhere else, and every decision-critical value surfaced explicitly to the AI (owner, 5 Oct 2026). Kitchie only needs the one or two values its logic acts on (for example an avoidance's reason: safety or other), and the person's own words stay free text. The full record and a checklist for new fields: Kitchie `docs/adr/closed-vocabulary-for-ai.md` (issue #238).

This repo is public. Keep personal details of real people out of it.
