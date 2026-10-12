# Recipe: browse flyout to the full page (desktop)

Mockup: `fragments/recipe-browse-full/`. Owner (Arjan), voice, 12 October 2026. Mockup only, nothing built. Replaces the flyout content confirmed earlier that day in `fragments/recipe-list-ideas/`.

## Decisions recorded (owner words, closely paraphrased)

- **RB-D1** The browse flyout (opened from a recipe row, or from a Home search result) is for casual browsing. Social proof first: times cooked, last cooked, a thumb up or down per household member, notes. Then ingredients with All in or N missing.
- **RB-D2** Two primary actions, Cook now and Plan. Open full recipe is a secondary link.
- **RB-D3** Open full recipe is a full-page view that takes over the whole recipe lane (main area). Entered with a smooth transition, no reload. The owner is fine with a full takeover.
- **RB-D4** On the full page the notes and reactions flyout can be reached again: right-lane position, same flyout conventions (one flyout at a time, Ctrl/Cmd Esc closes).
- **RB-D5** Mobile has no flyouts; a row opens the full page.

## Options drawn (all awaiting the owner's pick)

- Browse flyout: **A** stacked report (counts, member rows, notes, ingredients; link under the buttons) or **B** scoreboard tiles plus one voice card per person (thumb and note together), ingredient chips, link in the header.
- Re-open notes on the page: **A** a labelled "Notes and reactions" button in the page header with thumb and note counts and key N, or **B** a tab docked on the right edge that rides the flyout edge when open.
- Page top: **1** proof band then actions (one 640px column, left-anchored, flyout fills the free lane), or **2** hero card and two columns (uses the whole main area, narrows to the 736px column when the flyout opens so it pushes and never covers).

## Proposals (the owner was silent)

- Lane is 400px (the owner named 400px for this flow; the earlier flyout used 380px).
- Open full recipe closes the browse flyout; Back restores the list, selected row, scroll and reopens it. One flyout slot, notes use it.
- Transition (about 260 ms): flyout slides 24px right and fades in 140 ms, list fades while the page fades in and rises 8px, parts staggered 40 ms, the emoji tile and title are shared elements, rail never moves. View Transitions API in the build where available, 150 ms cross-fade otherwise, instant under reduced motion. URL changes, no reload.
- Keys O (open full), N (notes), Alt Left (back). A person changes only their own thumb. Not-rated members show an empty dashed thumb and the words "Not rated". Missing ingredients are listed first and marked with words as well as colour.
- Mobile: row pushes the full page in from the right (240 ms); notes are an inline section on the page, not a sheet.

## Open questions

See RB-O1 to RB-O9 in the fragment: the pick, who may edit a thumb or note, what Cook now and Plan do from the flyout, whether the flyout closes on Open full recipe, the close key (the owner said Ctrl/Cmd Esc; `docs/handover/desktop.md` records Ctrl/Cmd Enter as replacing it), members who have not rated and large households, versions and photo slots, widths under 1224px, the three Proposal keys.

## Default path and deferred (DESIGN.md section 6)

Fragment loads theme.css, theme.js (two default themes), a small styles.css and app.js; no images or requests. In the build the list rows already carry readiness, cooked count and last cooked; the flyout fetches reactions, first notes and ingredient stock on engagement (row click or Home search-result tap); the full page reuses that data and defers steps and photo; the notes flyout loads the full list on first open only.
