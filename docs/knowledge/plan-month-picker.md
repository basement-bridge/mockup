# Plan it on desktop: a month behind "Another day" (Kitchie #826)

Status: mockup built, awaiting the owner's look (17 October 2026). Follow-up to #757 option F (slice 1 shipped in Kitchie 0.129.0, PR #817, with a native date field behind "Another day" as an agent default). Mockup: `fragments/plan-month-picker/` (hub `index.html`, host `home.html?start=month`). Check: `tools/plan-month-picker-check.mjs`. Nothing is built in Kitchie `uat`.

## What the owner asked (voice, 17 Oct 2026)

"Another day" opens a monthly view that replaces the current flyout. Weekday names run down the side, the weeks are stacked as columns ("or whatever the number of columns to cover enough month"). Colour code open, closed, and already planned. Hover shows what is planned. The legend is at the bottom. Mock it up first.

## Where the earlier month widgets were found

- Mockup option C, the four-week grid (`fragments/plan-day-picker/grid.js`, `pick-c.js`, PD-O3, PR #208): weeks as rows, weekdays across. This is the reverse of what the owner now asks.
- The phone Copy-forward calendar (Kitchie `plan.phone.js`, `.cal`).
- The weekly Plan's own wording for weeks (`weekRel`, `wkLabel`), reused for the column heads.

## Decisions (PM-D1 to PM-D12)

Mark: owner-stated, or agent default (reversible).

- **PM-D1 (owner-stated).** The month replaces the seven-day list in the same flyout and slot; a back arrow returns.
- **PM-D2 (owner-stated, reversed 17 Oct 2026, typed).** Monday to Sunday run horizontally, left to right; weeks stack as rows. (The first cut had weekdays down the side; owner: "it's not how humans work".) Supersedes the voice instruction quoted above.
- **PM-D3 (agent default).** Five columns, 35 dates: the server's window is this week plus four (`docs/plan-week-api.md`, "Week window"), so today is always in the first column and the last day is a Sunday (15 Nov in the sample).
- **PM-D4 (owner-stated).** Open, planned and closed are told apart by colour; **(agent default)** each also has a shape or word (DESIGN.md section 3): open dashed plus; planned solid with a plate; stacked night a stack icon and count; usual day off an outline moon; off this week a filled moon; past hatched and struck; today ringed and underlined.
- **PM-D5 (owner-stated).** Hover shows what is planned; **(agent default)** the same on keyboard focus, read only, to the left of the flyout, for planned and closed dates only. A line under the grid says what picking the date would do.
- **PM-D6 (owner-stated).** The legend is the last thing in the flyout; **(agent default)** it adds a Hard avoid item only when that guard applies.
- **PM-D7 (earlier owner rules, kept).** A pick plans at once; 3-second Planned or Replaced hold then slide-out; two steps only for a stacked night; a usual day off is not locked; Replace applies to the person's own meal; the Hard avoid guard is asked live per date.
- **PM-D8 (agent default).** Keys: Left and Right a day, Up and Down a week (follows the new orientation), Home today, End the last day, Enter plans, Esc or the back arrow returns; in the `?` list. At the end of the cap the move stops and says so.
- **PM-D9 (agent default).** Another day is a labelled row under the seven days (variant A: a header icon).
- **PM-D10 (agent default).** Week columns are headed by the week name over the Monday's date (variant L: date only); the month change is a step-rule and "1 Nov" on the first cell (variant M: a month band).
- **PM-D11 (agent default).** The inline Undo, the pause on hover and "Undone" follow F's hold as it is changing in the day-picker branch; keep them in step when that merges.
- **PM-D12 (agent default).** The month's files load on the first press of Another day (DESIGN.md section 6). Desktop only.

## Blast radius and cost

- Reads: five `GET /api/plan/week?view=everyone&start=` calls (one per week) when the month opens. Within the 60 a minute read limit. Needs a change (slice 1 reads one week at a time).
- Writes: unchanged, `POST /api/plan/entries` with `override_block` for a usual day off. Matches today.
- Files: all inside the release policy's allow list (`server/src/assets/*`, `server/browser/*`, `server/test/*`, `docs/*`); lane routine.

## Open questions

1. Row heads (were column heads): week name over the dates (recommended) or dates only.
2. Month change: step-rule and "1 Nov" (recommended) or a month band.
3. Another day: a labelled row (recommended) or a header icon.

## How checked

Rendered in headless Chromium at 1440x900 and 1024x800, light and dark, served with `python3 -m http.server`, and the screenshots were looked at. `tools/plan-month-picker-check.mjs` covers the states, keys, hover popover, stacked two-step, hold and inline Undo, Esc and back, the Hard avoid guard, the full and empty weeks, the cap end, the URL variants, the `?` list and contrast in both themes, and fails on any page error. Checked locally; live Pages was not reachable, so the live link was not opened. At 1024x800 with the Hard avoid line showing, the flyout scrolls a little (about 46px).

## Not done

The plan-day-picker hub is not linked to this fragment (another agent is editing `fragments/plan-day-picker/`); link it later.

## Update 17 October 2026 (owner, typed): across, two flyouts wide, open as the call to action

Owner: Monday to Sunday horizontally; when Another day is chosen the flyout takes two flyouts' worth of width if there is space; "come up with a plan" for when there is not; more visuals. Earlier (voice): the open day is the primary call to action; all days off look the same.

- **PM-D13 (owner-stated).** Open is the only solid, filled state (green, bold plus, "Plan here" where there is room); planned and day off recede.
- **PM-D14 (owner-stated, look awaiting confirmation).** One muted grey Day off state with a moon for every kind; the kind is said in the hover detail and aria-label. Trade-off: usual vs this-week-only is not visible at a glance.
- **PM-D15 (agent default, three layouts shown).** Wide = 800px, from a 1360px window (88 rail + 472 column + 800). From 1624px the column keeps 736px; between, it gives up width, never covered. The recipe pane steps back while open. Layouts: A roomy calendar (recommended), B side card, C open nights first (`?wide=a|b|c`). Files: `wide.css`, `rich.css`, `wide.js`, fetched only by a wide window.
- **PM-D16 (agent default, the narrow-space plan).** 1024 to 1359px: single flyout width, compact cells (>=44px), week caption above each row. Tablet: centred sheet <=720px with rich cells. Phone: full-screen sheet, 7 cells >=44px, shortcut to the first open night. On touch a planned night or a day off shows what is on it first; the second tap plans (an open night plans on the first). Files: `tablet.html/css`, `phone.html/css`, `touch.js`, `sheet-host.js` (scaffolding).
- **PM-D17 (agent default).** Contrast pairing: open uses `--on-accent` on `--cue` (5.35 light, 10.2 dark; lavender-fog 4.06, under 4.5: a build may add an `--on-cue` token).
- Open: wide layout A/B/C; Day off single look; wide threshold 1360 or 1624; narrow desktop compact vs wider flyout; touch two-tap vs one-tap with Undo; row head style; month change; Another day row vs icon. Wrong guess costs a CSS or markup tweak each.
- Checked: `tools/plan-month-picker-check.mjs` (359 checks) at 1700, 1440, 1366, 1280, 1100, 1024, tablet 768 and 600, phone 390 and 360, light and dark.
