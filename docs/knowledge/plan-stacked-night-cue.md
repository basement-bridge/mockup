# Plan it flyout (option F): how to show "more than one meal on this night" (open, options only)

Status: OPEN, awaiting the owner's pick (24 October 2026). Nothing is built. Mockup: `fragments/plan-day-picker/stacked-cue/` (hub `index.html`, live host `home.html?pick=f&cue=0|1|2|3|4`). Check: `tools/plan-stacked-cue-check.mjs` (271 checks). Option F is `docs/knowledge/plan-day-picker.md` (PD-R3: the peek, two steps for a stacked night).

## What the owner said (24 October 2026)

The thin sliver card that peeks under the day row when there is more than one meal on a day "reads as a stray border" on the dark and the light theme. He wants a different visual language.

## Options (OPEN decisions, SC-O1 to SC-O4)

All four keep F's behaviour exactly (the cue is F's peek button: the first pick opens the night, the second plans, Right opens the full picture, Left folds it, "Hide" when open), use shared tokens, shape plus words or letters (never colour alone), text 4.5:1 and cue edges 3:1 in both themes (asserted).

- **SC-O1 Count badge.** A pill at the row's top right with a two-cards glyph and "2 meals" or "3 meals". Trade-off: clearest and cheapest, says how many but not whose; narrows the row text by about 90px. **Recommended.**
- **SC-O2 Stacked cards.** A real pile: the front row 12px narrower, one or two whole rounded cards behind it, lower and further right. Trade-off: closest to the original idea, no words; shape-only so it leans on screen-reader text, and the front card is narrower than its neighbours.
- **SC-O3 Who dots.** Overlapping circles with an initial and a ring for each person with their own plan (S, J). Trade-off: shows whose without opening; the initial-in-a-ring needs learning, and many people need a cap.
- **SC-O4 Second mini row.** A 28px attached row per person with their own plan (two at most): elbow connector, name, meal. Trade-off: nothing to decode or open; costs about 28px per person (measured +54px for Sat and Mon together at both sizes; F's list already scrolls the page at 1280x720).

Measured cost against today's sliver, last night's row bottom: badge +10px, cards -10px, dots +10px, mini rows +54px.

## Agent proposals (marked, reversible)

- **SC-P1.** The count includes the household meal ("3 meals" = household plus Jo plus Sam). Alternative: "+2".
- **SC-P2.** A night with exactly one meal (someone's own plan on an otherwise open night: Fri and Sun in the sample) gets no cue in any option; F still opens it in two steps. Today these nights also show the sliver.
- **SC-P3.** The badge and dots are 24 to 26px tall inside a 56px row; the whole row is the tap target for opening the night.
- Sample data only in `stacked-cue/cue-data.js` (Sat 2 meals, Mon 3); `?sample=base` keeps F's data.

## Open questions for the owner

1. Which cue (1 to 4)? 2. Count including the household meal, or only the extra plans? 3. No cue on a one-meal own-plan night? 4. Does the badge need a 44px target of its own?

## What loads

New fragment only; no existing page changes. `cue.css` about 5 KB and `cue.js` about 3 KB decorate the flyout after it draws. Build cost per option: one render change in the day rows (`rows.js`) plus one CSS block, shipped with the flyout. Checked locally in headless Chromium at 1440x900 and 1280x720 in both themes; no live Pages URL was opened.
