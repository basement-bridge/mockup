# Plan it on desktop: how to choose the day (Kitchie #757)

Status: **options only, the owner has not chosen** (15 October 2026). Mockup: `fragments/plan-day-picker/` (hub `index.html`; each option is `home.html?pick=a` to `e`). Check: `tools/plan-day-picker-check.mjs`. Nothing here is built in Kitchie.

## What the owner asked

- 15 Oct 2026, typed, with a screenshot of desktop Home (the Plan it sheet drawn over the bottom of the screen, a strip of seven day buttons): raise an issue about the best way to choose the day of the week to plan on, on the desktop.
- 15 Oct 2026, voice: he wants to choose by looking at working options, not by prose.

## Rules every option keeps (decided earlier)

This week and up to four weeks ahead; past days greyed; a usual day off marked; a day with a meal gets a second meal; Hold on by default; the Hard avoid guard is asked live (SW-74 to SW-82). On the desktop Home card a day with your own meal is replaced (owner, 12 Oct 2026). The phone sheet is unchanged; desktop code lives in its own files.

## Options (PD-O1 to PD-O5)

- **PD-O1, A. Strip plus a keyboard layer.** Today's strip and week arrows. Focus lands on the strip, today is chosen, arrows move, Enter plans, a digit or letter jumps, keys are in the `?` list. Cheapest; weeks past this one still need the arrows.
- **PD-O2, B. Quick picks first.** Tonight, Tomorrow, Another day... (opens the strip). A free day is one click; any other day is a second step.
- **PD-O3, C. Four-week grid.** Four rows by seven days in a panel anchored to the Plan button: today ringed, past greyed, each cell shows the meal, a usual day off says Off. Today preselected; arrows in two directions; Enter plans. Taller panel, new look.
- **PD-O4, D. Choose on the Plan page.** The recipe is carried to the week and dropped on a day. Most context; leaves Home.
- **PD-O5, E. Do nothing.** Today's sheet, drawn as the full-width bottom sheet, for comparison.

**Agent recommendation (not a decision): C with A's keyboard rules** (the owner works with the keyboard; the cap makes the whole choice fit in one view; the meal on each day is what the strip shows least well). Fallback: A alone. The owner decides.

## Proposals the mockup had to make (PD-P1 to PD-P8; all proposals, owner silent)

PD-P1 today preselected unless past, a usual day off or already holding a meal, then the next free day, else nothing. PD-P2 digits 1 to 7 and letters M T W F S jump to a day (T and S cycle). PD-P3 C is four rows, one week short of the strip's four weeks ahead. PD-P4 C and D show meals for all weeks and so need the plan for four weeks (a range read); A, B and E say Free for later weeks as the sheet does today. PD-P5 B plans at once from Tonight on a free day; a day with a meal or a day off waits for Plan. PD-P6 D always adds a second meal; Replace is the Home card only. PD-P7 Esc closes an open picker and focus returns to Add to plan. PD-P8 the bottom sheet's width on a wide screen is a guess (the screenshot was not attached to the issue).

## Open questions

Which option; anchored panel or bottom sheet; today preselected; four rows or five in C (PD-P3); can the plan read take a week offset or range (PD-P4); whether letter jumps stay once the shared shortcut registry exists (Kitchie #594); overlap with a named Selection convention for pill rows (Kitchie #596).

## Loads (DESIGN.md section 6)

Default path: the Home mockup's own files, `picker.css`, `data.js`, `common.js`, and one option file. Desktop only, never in a shared bundle. In the build, fetch the chosen picker on first press of Add to plan.
