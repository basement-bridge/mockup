# Plan day flyout: four fixes (replace call-out, usual day off, named confirmation, 3 second hold)

Status: mockup built, awaiting the owner's look (17 October 2026). The real change is being built into Kitchie `uat` by a separate agent; this is the picture to build to. Mockup: `fragments/plan-day-flyout-replace/` (live frames, phone and desktop). Check: `tools/plan-day-flyout-replace-check.mjs`. Builds on the Plan it flyout (Kitchie #757 option F, day rows in `fragments/plan-day-picker/rows.js`).

## What the owner asked (voice, 17 Oct 2026, relayed)

"It's a bug that Sunday here is shown as not cooking. It was a not-cooking usual day, but somebody chose to cook anyway. So they're still cooking; we don't refer to the not-cooking part unless that actually gets removed. The whole point of plan here is not to remove anything. If you're going to replace something for either yourself or everybody, because you're part of that everybody, give a visual, some sort of warning. Not to confirm it, but the visual needs to call out that you're about to do something destructive because there's already something in there. I don't want two-step confirmation because you can always undo it. Plan for everyone is fine because that's non-destructive. If I fancy it for everyone but somebody else already has something, say that we've now added something: UAT-AL continues to have their plan, the others will have this meal. Maybe call out who the others are in the confirmation. And the three-second thing: if somebody clicks on that, don't act on the three seconds until they let go of the flyout."

## Decisions (PDR-D1 to PDR-D4, owner-stated unless marked)

- **PDR-D1 (owner-stated).** A usual day off is "Not cooking" only while nothing at all is planned for it. Once anyone has a meal that night, the row shows the meal like any other night and says nothing about the day off: no chip, no "Every week, usual day off", and the "Usual day off, cooking this week" line is dropped. The chip returns only if the meal is removed. **(agent default)** Under Everyone the row now lists your own meal too (marked "(yours)"), because it is what Everyone would replace; before, it listed only household meals, which is why Sunday fell through to Not cooking.
- **PDR-D2 (owner-stated).** A row that would replace a meal, for you or for Everyone (you are part of Everyone), carries a destructive call-out; planning is one tap with no confirm step, because Undo is always there. **(agent default for the look)** a "Replaces" tag with a swap icon, a danger-toned border and left edge, and the meal that would go struck through, so tone, icon, wording and strike all say it (DESIGN.md: never colour alone). Variants of the tag: "Replaces for everyone" (household meal), "Replaces yours" (your own meal), "Replaces for you" (a household meal you are in, planned only for yourself). A plain Open row, and a row where someone else's meal simply stays, have no warning.
- **PDR-D3 (owner-stated, wording agent default).** Planning for Everyone where someone keeps their own meal says so in the confirmation and names the people: "Planned" headline, then "For Green Slander and you. UAT-AL keeps their meal." A replace also says what went: "Japanese golden curry is out." No keepers: "For everyone." You are named last, as "you". The owner's example was "Planned for Brown Bogan, Green Slander and you. UAT-AL keeps their meal."; the sample household here has you as Brown Bogan, so the shape is the same. Undo is on every confirmation.
- **PDR-D4 (owner-stated, details agent default).** After a pick the confirmation stays 3 seconds, then slides out. A press (mouse down or finger down) anywhere in the flyout stops the count; it carries on only after the press is released, with what was left but never under 1 second. The release can happen outside the flyout. Keyboard focus on Undo also pauses it. Hover no longer pauses (the earlier agent default in `rows.js`). Esc still ends it at once.

## Open questions (recommended answer first)

1. Does hovering still pause? Recommended: no.
2. After release, what was left (at least 1 second), or the full 3 seconds again? Recommended: what was left, at least 1 second.
3. Same call-out for "Replaces for you" (takes you out of a household meal, everyone else keeps it)? Recommended: yes.
4. Long households: name everyone in the confirmation? Recommended: up to four names, then "and 3 others".

## Build notes

- Markup and class names are the flyout's own (`row-d`, `dl`, `dt`, `ln`, `cons`, `fors`, `pk-pt`, `pk-conf`); new: `row-d.replace`, `ln.rp`, `ln.gone`. Tokens only (`--danger`, `--surface`, `--added-bg`). The `view()` and `plan()` functions in `fragments/plan-day-flyout-replace/flyout.js` are the rules in code; the mockup frames, captions, Reset buttons and the timer annotation are scaffolding.
- Not redrawn: the peek card behind a stacked night and the Hard avoid guard; both are unchanged.
- Performance: the page loads `theme.css`, `shared.css`, one 8 KB stylesheet and one script; nothing is deferred because nothing is heavy. No network calls, nothing is stored.
- A replace of a meal by the same recipe (Monday in the real screenshot) is a no-op and is not specially handled here.

## How checked

`tools/plan-day-flyout-replace-check.mjs` (headless Chromium): the Sunday states, the call-out on every replace row (tag, icon, strike, danger border, aria-label) and its absence on Open and keeps-theirs rows, one-tap plan with Undo, the named confirmations, the timer (untouched closes, press holds past the hold time with no time spent, release resumes, the 1 second least, press on Undo, hover does not pause, Esc), contrast of the tag in both themes and no horizontal scroll at 390px.
