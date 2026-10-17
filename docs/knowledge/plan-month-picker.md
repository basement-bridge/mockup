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

- **PM-D13 (owner-stated).** Open is the only solid, filled state (green, bold plus; the "Plan here" caption was removed later, PM-D29); planned and day off recede.
- **PM-D14 (owner-stated, look awaiting confirmation).** One muted grey Day off state with a moon for every kind; the kind is said in the hover detail and aria-label. Trade-off: usual vs this-week-only is not visible at a glance.
- **PM-D15 (agent default, three layouts shown).** Wide = 800px, from a 1360px window (88 rail + 472 column + 800). From 1624px the column keeps 736px; between, it gives up width, never covered. The recipe pane steps back while open. Layouts: A roomy calendar (recommended), B side card, C open nights first (`?wide=a|b|c`). Files: `wide.css`, `rich.css`, `wide.js`, fetched only by a wide window.
- **PM-D16 (agent default, the narrow-space plan).** 1024 to 1359px: single flyout width, compact cells (>=44px), week caption above each row. Tablet: centred sheet <=720px with rich cells. Phone: full-screen sheet, 7 cells >=44px, shortcut to the first open night. On touch a planned night or a day off shows what is on it first; the second tap plans (an open night plans on the first). Files: `tablet.html/css`, `phone.html/css`, `touch.js`, `sheet-host.js` (scaffolding).
- **PM-D17 (agent default).** Contrast pairing: open uses `--on-accent` on `--cue` (5.35 light, 10.2 dark; lavender-fog 4.06, under 4.5: a build may add an `--on-cue` token).
- Open: Day off single look; wide threshold 1360 or 1624; narrow desktop compact vs wider flyout; touch two-tap vs one-tap with Undo; row head style; month change; Another day row vs icon. Wrong guess costs a CSS or markup tweak each.
- Checked: `tools/plan-month-picker-check.mjs` (359 checks) at 1700, 1440, 1366, 1280, 1100, 1024, tablet 768 and 600, phone 390 and 360, light and dark.

## Update 17 October 2026 (owner, voice, visual review): marks, scope, no labels, halo

Mockup only. Changes in `fragments/plan-month-picker/`; check `tools/plan-month-picker-check.mjs`.

- **PM-D18 (owner-stated).** Past days stay blanked out (hatched, not clickable).
- **PM-D19 (owner-stated).** Planned versus planned several is a quantity cue in the same yellow: one mark for a night with one plan, three marks for a stacked night (the household plan plus someone's own). The count of marks is itself the non-colour cue (this replaces the plate icon, the stack icon and the numeric count). **Agent default:** under Everyone, a night with two or more entries is three marks; a night with only one person's own plan is one mark.
- **PM-D20 (owner-stated).** The Who pill scopes the grid: planned and day-off marks show what the pill selects. Under Everyone the cell shows the household plan, three marks when anyone has their own plan too (F ruling 5); under a person it shows that person's plans (the household plan unless it leaves them out, and their own). **Agent default:** a date with nothing for the selected person is open for them, even if someone else has a plan.
- **PM-D21 (owner-stated, Everyone part owner agreed).** Day off is per person: the moon shows for the person the pill selects. Under Everyone no day-off marker (agent default the owner agreed to: "yeah"). Day off keeps the moon, stays clickable (not locked) and is distinct from the hatched past look and the yellow marks. Sample data: Sam has Thursdays and Sat 7 Nov off, Jo has Tue 20 Oct off.
- **PM-D22 (owner-stated).** Hard avoid is a plain exclamation mark, not the triangle (the triangle read as see-through), everywhere in the month picker: the grid (a small mark where it asks first, and on every date where the meal is not for that person), the legend, the hover detail, and the guard panel. Checked in light and dark.
- **PM-D23 (owner-stated, agent default on the ring).** No today state, badge or label; today is the natural first cell of the grid and reads like any other date. No ring was added (past days are hatched and the grid starts at today's week, so the first live date is plain). Focus now starts on the first open date, not on today, so there is no ring-like mark on today.
- **PM-D24 (owner-stated).** The point of the grid is where the meal can be dropped; open is the primary action. Rank of the pickable states: 1 open, 2 day off, 3 planned and planned several. Weight follows rank: open a 3px green outline, a green tint and a heavy plus; day off a 2px grey outline, a grey fill and a moon; planned a 1px amber hairline and a barely-there tint. Past and Hard avoid sit outside the scale. (Chromium snaps borders to whole pixels, so the steps are 3, 2, 1.)
- **PM-D25 (owner-stated).** The week-label column and header (this week, next week, in N weeks) are removed entirely. **Agent default (the month marker):** the heavy step-rule where the month changes plus the month spelled on the cell, "1 Nov" and the grid's first cell "12 Oct". The earlier column-heads variant (L) and the month band (M) are dropped. Each week row keeps an aria-label ("Week of 19 October") for screen readers.
- **PM-D26 (owner-stated need, three options drawn, agent recommends A).** The date number carried the weight of the state: it is "just a calendar day". Options on the hub, side by side (`?num=a|b|c`): **A** a small quiet number in the cell corner with the state fill and icon as the picture (default, recommended: the state is what is being chosen, so it gets the centre; the date sits where a calendar reader looks and cannot compete); **B** a plain neutral cell, only a small icon or dots for state (quietest, but loses the fill that says "drop it here" at a glance); **C** the number stays put but is a lighter, smaller numeral (keeps the reading order, still busier than A).
- **PM-D27 (owner-stated: a transient halo on open days; the trigger is an agent default for him to confirm).** Open does not need the heaviest fill because a halo says "start here". It is not a permanent ring on every open cell. Proposed behaviour: when the month opens, the first open date glows and breathes for about 3 seconds (the family of F's 3-second hold) and fades over half a second; focus starts on that date; the first press or key clears it at once; any open date under the pointer or keyboard focus gets the glow while it is there. `prefers-reduced-motion`: no breathing, a static thinner ring, cleared the same way. Hub scenarios: opening (`halo=hold`) and after the fade (`halo=off`).
- **PM-D28 (agent default).** The legend, bottom of the flyout, reads exactly: Open, Planned (one yellow), Planned several (three yellows), Day off (moon), Hard avoid (exclamation), Past (blank); no Today. Always six items.

Judgment calls to confirm: the halo trigger (PM-D27), the recommended date-number option A (PM-D26), the month marker (PM-D25), the Everyone-with-only-an-own-plan rule (PM-D19), and that a date with only someone else's plan is open for the selected person (PM-D20).

How checked: rendered in headless Chromium at 1440x900 and 1024x800, light and dark, screenshots viewed; the check script covers marks 1 versus 3, pill scoping, the moon for the selected person only, the exclamation (no triangle), the legend text, no week labels or today state, the weight rank, the three date-number options, the halo (appears on the first open date, clears after about 3 seconds, on a key, on a press, held and off scenarios, reduced motion) and contrast in both themes. Checked locally; live Pages was not reachable.

## Update 17 October 2026 (owner, voice, second review of the live picker)

Mockup only. Files in `fragments/plan-month-picker/`; check `tools/plan-month-picker-check.mjs` (asserts every item below, in light and dark, at 1440, 1024, 1700, tablet and phone).

- **PM-D29 (owner-stated).** An open day shows only a plus: no "Plan here" text, not even a small caption, in the cell, legend or hub copy. It stays clickable (44px or more), visually primary (green outline, tint, heavy plus) and keeps the transient halo. The aria-label still says "open".
- **PM-D30 (owner-stated).** Planned and planned several are neutral dark grey, not yellow (the yellow read as red, and red means alarming). Derived from `--fg` toward the cell, so near-black on light and a light grey on dark. One mark versus three marks is kept. The legend swatches use the same colour (same CSS). Red is reserved for the Hard avoid exclamation.
- **PM-D31 (owner-stated).** An already planned day is not bold: the date number and the meal name are regular weight (400), the outline is a 1px neutral hairline with a barely-there tint. Priority stays open > day off > planned, so planned reads calmer than open.
- **PM-D32 (owner-stated).** The Hard avoid exclamation is always red (`--danger`), in light and dark, and a modest step larger than before (corner badge 18px, the stop mark 24px, legend 18px, against 9px planned marks). The cell and its 44px target are unchanged. Cause of the green: `.st-open .pdm-i` set the open cell's green on every icon, the corner badge included, so the badge showed green on open dates; the red now has higher specificity. No dashed border on the stop cell either: it is a plain solid neutral cell with the red exclamation (PM-D36).
- **PM-D33 (owner-stated ruling).** The exclamation is relative to the recipe being planned. A mark shows on a date only when the recipe in context has an ingredient that conflicts with a Hard avoid of the people the Who pill selects (Everyone is the whole household), the same rule as F (`docs/knowledge/plan-day-picker.md`, Hard avoid guard). A recipe that does not touch anyone's Hard avoid shows nothing, and so does no recipe in context; a member's standing Hard avoid is never surfaced for its own sake. Previous behaviour, stated plainly: the guard already tested the recipe's ingredients for the avoided item (`PK.guardFor`), so it was recipe-scoped in code, but the mockup had only one recipe (the Mandarin Mango Yogurt Bowl, which has mango), so with `?avoid=mango` every open date showed the mark and the owner could not see the no-conflict case. Now both exist: `?avoid=mango` (recipe with mango, conflict) and `?avoid=mango&recipe=clear` (the Cucumber and spring onion salad, no mango, no marks). Under Everyone a conflict asks first (corner mark); under Jo it is the stop; under Sam nothing. Mockup controls: "Recipe being planned".
- **PM-D34 (owner-stated, agent default on the timing).** The halo goes on EVERY open date at once, fires by itself the moment the month view opens (when Another day is pressed, or on load for `?start=month`) with no hover or focus needed, holds about 3 seconds (the same as the Planned hold), and ends together on all dates; the first press or key ends it at once. Stop-mark dates (not plannable for the selected person) get none. Today stays the default selected and focused cell (not the first open date). Hover and keyboard focus keep their own glow on top. Reduced motion: a static ring, cleared the same way. State before this change: present and working, but only on the first open date and fairly subtle; now on every open date and stronger.
- **PM-D35 (agent default).** Mockup control Flyout width: Normal = two flyouts wide when the window is 1360px or more (the wide layout, PM-D15); Narrow = the single-flyout width with compact cells at any window size (the look of `?wide=off` and of a 1024 to 1359px window). It used to set only a padding class that the wide layout overrode, so nothing changed.
- **PM-D36 (owner-stated).** No dashed or dotted lines on the grid. The long broken dark lines on top of dates were the month step-rule (a 3px `--fg` bar drawn on the top of every cell whose date above is in another month, so each cell had its own black segment). It is now a thin (2px), solid, continuous rule in `--muted` that sits only in the gap, with the "1 Nov" label on the cell kept (PM-D25). The Hard avoid stop cell lost its dashed red border, and the line under the grid its dashed border. Focus keeps a solid 3px ring; today has no ring of its own.
- **PM-D37 (owner-stated, voice, 17 Oct 2026).** Wide layout = B, the side card ("a side card is just a replacement for the hover; I actually like that rather than a pop-up"): the card replaces the hover and pop-up detail. Layouts A and C stay on the hub as "not chosen" historical options. B is not yet the default for windows of 1360px or more: the owner pushed back that an always-docked card takes room from the grid (below).
- **Open sub-question (PM-D37).** How the side card's width trade-off against grid space is resolved. Candidates, mockup-first: docked B as now; a card collapsed until a date is selected (grid full width by default); an overlay over part of the grid only while open; a horizontal detail strip below the weeks above the legend. The default stays as it is until he picks.

Judgment calls to confirm: the grey marks (PM-D30), the 3 second shared halo (PM-D34), the thin muted step-rule in place of the heavy one (PM-D36).

## Update 17 October 2026 (owner open sub-question): how much grid the side card costs

Mockup only, hub section 5. Owner: the always-docked side card takes real estate from the grid. `?wide=b` stays the docked card and **B is not the default** (no `?wide` is still layout A). `?card=` shows the alternatives (it implies layout B): `slim`, `collapsed`, `overlay`, `strip`; the mockup controls have a "Side card (layout B)" group. Same card content in every option.

- **PM-D38 (agent default, shown for the owner to compare).** Measured (headless Chromium, flyout 800px at every window of 1360px and more, so 1360, 1624 and 1920 give the same numbers): A grid 751, cell 102 x 70, 12px names, needs 785px height. B docked grid 491 (-35%), card 244 x 284, cell 66 x 60, 10.5px names (one clipped). Slim grid 563 (-25%), card 176 x 204, cell 76 x 60. Collapsed grid 751 at rest, 491 once a date is on (a 260px reflow). Overlay grid 751 always, the 244px card covers up to 2.4 columns while open and closes when the pointer leaves. Bottom strip grid 751, cell 103 x 60, strip 751 x 66, needs 750px height (scrolls 30px in a 720px-high window, fits 800). At 720px high all but A and the strip fit without scrolling. Below 1360px (1280x720, 1024x800) there is no card: the compact 394px flyout with 46 x 44 cells fits both heights and the line under the grid carries the detail.
- **Recommendation, not a decision (agent):** the bottom strip as the default for layout B, with the slim docked card as the runner-up. It keeps A's roomy grid, replaces the hover like the card does, never moves or covers a date; its cost is 66px of height. Collapsed jumps the grid under the pointer; overlay hides the dates it covers; docked and slim cost 25 to 35 percent of the grid and shrink the names.
- **Open sub-question (PM-D37), still open:** how the side card's width trade-off against grid space is resolved. Wrong guess costs a default flip.
- Checked: `tools/plan-month-picker-check.mjs` (413 checks) asserts the default is not B, the card widths, the collapsed reflow, the overlay's unchanged grid and close, and the strip below the weeks inside the flyout.
