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

## PD-R2 (decided by the owner, voice, 16 October 2026): Start cooking

In every option A to G, when the primary Cooking ideas card is the meal planned for today it carries a **Start cooking** button (still no Plan). The mockup is visual only: the button turns to "Cooking now" and a "Cooking now" card with the dish name and a dismiss X appears, matching the banner. Semantics to match (ADR cooking-session; MCP tools `start_cooking` and `stop_cooking`): a session has a title, ingredients, optional `recipe_id`, substitutions; two dishes show on the banner (a third is kept but not shown); it clears 45 minutes after the last start (config `server/config/cooking-session.json`); it ends by the dismiss X (`POST /cooking/dismiss`) or `stop_cooking`; the banner opens `GET <base>/cooking?session=<id>`. Today only the MCP tools start a session and there is no web start route, so a Start cooking button probably needs a new POST route: a server-side change.

## Scenario table (what today's code does versus the proposal)

Read from Kitchie `uat`: `recipes-plan-sheet.js`, `docs/plan-week-api.md`.

| Scenario | Today | Status |
|---|---|---|
| Usual day off (stencil) | Sheet shows Off; POST has no `override_block`, server answers 409 `day_blocked`; toast "<Day> is off for you. Pick another day." Effectively locked. | Ruling 1 is a proposal; API already supports `override_block:true`, likely client only |
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
