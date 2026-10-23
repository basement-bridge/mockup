# Plan it on desktop: how to choose the day (Kitchie #757)

Status: **owner chose F on 16 October 2026 (voice: "option F it is")**; A to E and G are kept as not chosen. Mockup: `fragments/plan-day-picker/` (hub `index.html`; each option is `home.html?pick=a` to `e`). Check: `tools/plan-day-picker-check.mjs`. Nothing here is built in Kitchie.

## What the owner asked

- 15 Oct 2026, typed, with a screenshot of desktop Home (the Plan it sheet drawn over the bottom of the screen, a strip of seven day buttons): raise an issue about the best way to choose the day of the week to plan on, on the desktop.
- 15 Oct 2026, voice: he wants to choose by looking at working options, not by prose.

## Owner-stated rule (PD-R1, decided by the owner, voice, 16 October 2026)

Under Home's Cooking ideas, when the primary recommendation is the meal already planned for tonight (the "Planned for today" card) there is **no Plan button**, on the card or in the right-hand flyout/pane for that meal: the person has already made that plan, so it is redundant. If nothing is planned for tonight the primary recommendation does have Plan. The Other ideas rows always keep Plan, so a person can override what they planned (Replace as today). Drawn in every option; open `home.html?pick=x` (nothing planned) and `home.html?pick=x&night=planned` (planned). This is an owner statement, not an option and not a proposal.

## Rules every option keeps (decided earlier)

This week and up to four weeks ahead; past days greyed; a usual day off marked; a day with a meal gets a second meal; Hold on by default; the Hard avoid guard is asked live (SW-74 to SW-82). On the desktop Home card a day with your own meal is replaced (owner, 12 Oct 2026). The phone sheet is unchanged; desktop code lives in its own files.

## Options (PD-O1 to PD-O5)

- **PD-O1, A. Strip plus a keyboard layer.** Today's strip and week arrows. Focus lands on the strip, today is chosen, arrows move, Enter plans, a digit or letter jumps, keys are in the `?` list. Cheapest; weeks past this one still need the arrows.
- **PD-O2, B. Quick picks first.** Tonight, Tomorrow, Another day... (opens the strip). A free day is one click; any other day is a second step.
- **PD-O3, C. Four-week grid.** Four rows by seven days in a panel anchored to the Plan button: today ringed, past greyed, each cell shows the meal, a usual day off says Off. Today preselected; arrows in two directions; Enter plans. Taller panel, new look.
- **PD-O4, D. Choose on the Plan page.** The recipe is carried to the week and dropped on a day. Most context; leaves Home.
- **PD-O5, E. Do nothing.** Today's sheet, drawn as the full-width bottom sheet, for comparison.
- **PD-O6, F. Right-side flyout, CHOSEN** (final shape, owner, voice, 16 Oct 2026). Swaps into the This week slot and hands it back. Who is it for pills on top; a plain rolling vertical list of the next seven real days from today (not Monday to Sunday); each row has a square label with only the day name on the left and the planned text in full on the right, read only. Selecting a row plans at once: no Plan, Confirm or Cancel anywhere in F; Esc or X closes. A wrong pick is fixed by picking again (Undo chip). Replace applies to the person's own meal on the Home card. Keys: arrows, Enter, Esc, in the `?` list. The mockup adds Right/Left to open and fold a night, Home and End.
- **PD-O7, G. Cooking ideas curtain** (owner ask, voice, 15 to 16 Oct 2026; the owner said G is most likely not something we will do). Add to plan is removed from the detail pane entirely; it lives only on each card under Cooking ideas. It drops a curtain directly under the Cooking ideas card with Today / Tomorrow / Other. How Other is shown is the owner's open design question, so two variants: a compact week strip and a small four-week grid (`other=strip|grid`, switchable in the curtain). Proposal: in G the card button keeps its label, Plan.

**Recommendation: F** (the owner chose it, 16 Oct 2026). It replaces the earlier agent recommendation of C with A's keys.

## Owner scenario rulings (decided by the owner, voice, 16 October 2026)

1. A usual day off is not locked: it can be planned.
2. A household plan on a night that already has a household meal is a Replace.
3. A household plan on a night where one person has their own plan is planned for everybody except that person; their meal is left alone, and the row says whose meal stays.
4. One person replanning just for themselves takes only themselves out of the household meal.
5. Under Everyone a row shows only the household plan, with a subtle peek behind it if anyone has their own plan. Interacting expands that night only (household plan plus each person's plan), then collapses.

## PD-R2 (decided by the owner, voice, 16 October 2026): Start cooking, now a modal (supersedes the quiet "Cooking now" tag)

In every option A to G, when the primary Cooking ideas card is the meal planned for today it carries a **Start cooking** button (still no Plan). First decision: a status tag. **Superseded the same day by the owner:** one click on Start cooking opens a floating modal, an overlay front and centre, that takes the person straight into cooking, with no extra confirm step. Visual only in the mockup; nothing is sent.

What is real (read from Kitchie `server/src`: `cooking-mcp.ts`, `cooking-banner.ts`, `docs/adr/cooking-session.md`) and what is only the mockup's picture:

- Real: the capability is the MCP tools `start_cooking` (title, ingredients as `{name, amount}`, optional `recipe_id`, optional `substitutions`, `session_id`, `by`; personal link only) and `stop_cooking` (`session_id`, returns `ended`), and the household banner they drive ("Cooking now", the dish name, a dismiss X, a chevron to `GET <base>/cooking?session=<id>`). The ingredients-first view (ADR decision 11) shows the dish as the heading and an ingredient list with the tick on the left, the name, the quantity on the right; ingredients only (no stock, places, freshness or history); Done and the banner's dismiss end the session (`POST <base>/cooking/dismiss`); with a `recipe_id` there is a secondary link to the saved recipe. Two dishes show; a third is kept but not shown; a session clears 45 minutes after the last `start_cooking` (config `server/config/cooking-session.json`). Steps of a recipe are NOT part of this build (ADR consequences).
- The mockup's picture: the modal holds the dish, the ticking ingredient list with amounts, Done (stop), Open saved recipe (shown because this is a saved recipe) and a close X that leaves cooking on (as leaving the real view does, the banner stays). Esc closes the modal; the card button reopens it. No steps are drawn because the capability has none.
- Not real today, so a build needs it: there is no web way to start a session (only the MCP tools), so the button needs a new POST route (server-side change) that calls the same `startCooking`; the modal is a new UI surface (the real view is a page, not a dialog).

## PD-R3 (decided by the owner, voice, 16 October 2026): F's confirmation, off days, stacked nights

1. **Confirmation hold.** After a pick commits (fresh plan or replace) the flyout stays open for about 3 seconds showing "Planned" or "Replaced" plus the new meal name (and the day), then slides out to the right, the side it came in from. The Home Undo chip stays. Esc or the X during the hold closes it at once. For a stacked night the hold starts after the second click, the one that commits.
2. **Usual day off: the weekly Plan's own wording, no new copy** (from Kitchie `recipes-plan-sheet.js`, `plan.desktop.js`, `plan.js`, `plan.phone.js`): before a pick the row shows a "Not cooking" pill and "Every week, usual day off" (a one-week block says "This week only"); picking it shows the sheet's note "<Day> is a usual day off. Planning it cooks this week only."; after the pick the row says "Usual day off, cooking this week"; the confirmation reuses "<Day>: cooking this week. The usual day off stays." The day is neither locked nor refused. The mockup's "Off days refuse (today's code)" switch keeps the refusal for comparison.
3. **Two steps only for a stacked night** (the household plan with one or more individual carve-outs, the peek state): the first click or Enter on that row does not commit; it expands the row in place, showing the household plan and each person's own plan, with "Pick the row again to plan it." Only the second pick commits. A night with one plan or none commits on the first click. In the mockup the second pick is the row again.

## PD-R4 (decided by the owner, voice, 17 October 2026): seven days only; inline Undo

1. **Seven days only.** The rolling seven-day list is all F needs. F (the flyout and the standalone day-rows page) has no "pick a date" or "Another day" path to a day beyond seven days from today. This **supersedes the review's blocker 1 suggestion** (reaching further out): seven days is the decision. The server's four-week cap on planning stays as it is and is not part of F. (B's "Another day" and C's four-week grid remain only as the not-chosen options.)
2. **Inline Undo during the hold.** While the flyout shows the confirmation (Planned or Replaced plus the meal), an Undo button sits inside that confirmation, because the pointer is already there; one click undoes on the spot. If the flyout slides away first, the Home Undo chip is the fallback (the mockup gives the chip its own time again after the slide-out). Shown for a fresh plan, a replace and a stacked-night second-click commit. The inline Undo is the Home chip's own undo, so the same plan is restored (a replaced meal comes back, a carve-out is reversed).
3. **Agent defaults for the owner to confirm (not owner statements):** the 3-second countdown pauses while the pointer is over the confirmation or focus is on Undo, and resumes (at least one second left) when both are gone; after Undo the confirmation reads "Undone" (and "Back as it was") for about 1.1 seconds, then the flyout closes; Undo is a real button, reachable by Tab from the X, with the accessible name "Undo: planned <meal>" or "Undo: replaced <meal>"; reduced motion is respected (no slide, the same timing); Z still undoes. Wrong guess: pausing could leave the flyout open if the pointer rests on it.

## Scenario table (what today's code does versus the proposal)

Read from Kitchie `uat`: `recipes-plan-sheet.js`, `docs/plan-week-api.md`.

| Scenario | Today | Status |
|---|---|---|
| Usual day off (stencil) | Sheet shows Off (the row wording and notes above are the sheet's and Plan page's own); POST has no `override_block`, server answers 409 `day_blocked`; toast "<Day> is off for you. Pick another day." Effectively locked. | Ruling 1 is a proposal; API already supports `override_block:true`, likely client only |
| Day off this week only (`source:week`) | Same refusal; the sheet does not tell it apart from a usual day off. | Proposal (distinguish in the row) |
| Meal planned by the person driving, desktop Home card | Replaced: new meal planned first, old deleted, Undo restores it (`o.replace`, `view=mine`). | Matches today's behaviour |
| Meal planned by another person | Sheet reads `view=mine`, so it neither sees nor replaces it; other people's meals are never touched. | Matches today (untouched); showing it in the row is a proposal |
| Household (Everyone) on a household-meal night | Only a household meal you planned yourself is seen and replaced. | Partly today; a household-wide read is a proposal |
| Household plan on a night where one person has their own plan | Plans for Everyone without leaving that person out. | Ruling 3 is a proposal |
| One person replans for themselves on a household night | Plans their own meal; does not change the household meal's participants. | Ruling 4 is a proposal |
| Everyone with a Hard avoid | `GET /api/plan/guard`: stop for a meal for that person alone; warning with "Leave <name> out of this meal" (`excluded_member_ids`, Hard avoid only). | Matches today's behaviour |

Data model, stated plainly: a per-person plan distinct from the household plan on the same night already exists (entries carry `for_whom` everyone or member, `planner_member_id`, and `participants`, 0.110.0, schema 44). A carve-out is already representable through `participants`. So the mockup shows no new data concept. The new part is the automatic rule (ruling 3 and 4). Server side: `excluded_member_ids` is validated as Hard-avoid only (400 `excluded_not_needed`), so the "everyone but that person" rule may need a server-side change unless the client sets `participants` directly; unconfirmed.

## Proposals the mockup had to make (PD-P1 to PD-P8; all proposals, owner silent)

PD-P1 today preselected unless past, a usual day off or already holding a meal, then the next free day, else nothing. PD-P2 digits 1 to 7 and letters M T W F S jump to a day (T and S cycle). PD-P3 C is four rows, one week short of the strip's four weeks ahead. PD-P4 C and D show meals for all weeks and so need the plan for four weeks (a range read); A, B and E say Free for later weeks as the sheet does today. PD-P5 B plans at once from Tonight on a free day; a day with a meal or a day off waits for Plan. PD-P6 D always adds a second meal; Replace is the Home card only. PD-P7 Esc closes an open picker and focus returns to Add to plan. PD-P8 the bottom sheet's width on a wide screen is a guess (the screenshot was not attached to the issue).

## Open questions

Which option (answered: F); anchored panel or bottom sheet (moot for F); today preselected; four rows or five in C (PD-P3); can the plan read take a week offset or range (PD-P4); whether letter jumps stay once the shared shortcut registry exists (Kitchie #594); overlap with a named Selection convention for pill rows (Kitchie #596).

## Loads (DESIGN.md section 6)

Default path: the Home mockup's own files, `picker.css`, `data.js`, `common.js`, and one option file. Desktop only, never in a shared bundle. In the build, fetch the chosen picker on first press of Add to plan.

## Open, 24 October 2026: the stacked-night cue

The peek (a sliver card under a night with more than one meal) reads as a stray border on both themes (owner). Four alternative cues are drawn, none chosen: `docs/knowledge/plan-stacked-night-cue.md`, `fragments/plan-day-picker/stacked-cue/`.
