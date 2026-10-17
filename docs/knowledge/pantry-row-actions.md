# Pantry item actions on desktop, without swipe

Status: mockup for the owner to review (17 Oct 2026). **Nothing is built in Kitchie.** Kitchie issue #866. Source: the owner's voice request of 17 Oct 2026. Lines marked **Proposal** are choices the mockup made where the owner was silent; **Open** lines are not decided. Merging this mockup settles none of them.

Mockup: `fragments/pantry-row-actions/` (notes page `index.html`, the screen `desktop.html`; shared `rows.css`, `rows.js`, `act.js`, `sample.js`; one small pair per option `opt-a`, `opt-b`, `opt-c`, `opt-d`, and `opt-now` for today). Check: `tools/pantry-row-actions-check.mjs` (541 checks at 1024, 1280 and 1440, light and dark, mouse and touch laptop). Builds on `pantry-swipe.md` (the phone, unchanged), `desktop-layout.md` and `jobs-to-be-done/shopping-desktop.md` (SD-6, hover buttons with key caps).

## What the owner asked and already settled

- **DA-D1** (owner, voice, 17 Oct 2026) Swipe on Pantry items is the phone's way, not the right way on a desktop.
- **DA-D2** (owner, same) Mockups of how a desktop does the same job, as options.
- **DA-D3** (owner, standing, 10 Oct 2026) Anything viewport-specific lives in its own file, never in one the other viewports download.
- **DA-D4** (settled earlier, not asked again) Keys J K U D S Z E , and the panel's Used up and Add to shopping list stay; key caps follow the Shift Space switch; closing uses Ctrl or Cmd Enter and plain Esc only clears the search.

## What swipe does today, and what a desktop has already (read from Kitchie `uat`, not run)

| Action | Phone gesture | Desktop today |
|---|---|---|
| Use one | swipe left past 90 px (counted items; a level-only item is used up) | hover minus (counted rows only), key U, a mouse drag |
| Used up | swipe left past 190 px | hover tick, key D, the panel's Used up, a mouse drag |
| Add to shopping list | swipe right past 90 px | key S, the panel's button, a mouse drag; no row button |
| Undo | the bar, 5 seconds | the same bar, key Z |

One shared file, `server/src/assets/swipe.js`, serves every width, so a left-button mouse drag swipes a row on desktop too. The third used-up inside 5 minutes answers 409 (`REMOVAL_GUARD`); the bar says "Open the item to confirm", but the open item's Used up makes the same call, so nothing in the page confirms it (to investigate).

## The four options

| | Control | One action, mouse | Several items | Build impact |
|---|---|---|---|---|
| A (recommended) | three small buttons with key caps on hover, focus and the current row | 1 click | no | routine |
| B | context menu: right click, Menu key, Shift F10, or three dots on hover | 2 | no | routine |
| C | check box on hover, picks listed in the side lane with the three actions | 2 | yes | guarded |
| D | rows carry nothing; the open item's panel leads with the actions; a keys line | 2 | no | routine |

Every option covers Use one, Add to list, Used up, Undo (bar and Z), keyboard, a touch-laptop fallback, empty, all-used-up and saved-list states, level-only and Out rows, dark and light. The full comparison, stress test and per-option edge states are on the mockup's notes page.

**Recommendation: A, plus Use one added to the open item's panel, and a mouse drag no longer swipes on desktop.** It is the Shopping desktop pattern the owner already approved, adds nothing at rest, is one click, and the only option with all three actions on the row. B waits until there are more than three actions (it takes over right click on a real link). C waits until a real several-at-once job exists (it needs a new write path).

## Touch to pointer

| Phone | Desktop (hover and fine pointer) | Touch laptop or tablet landscape (no hover, desktop layout) |
|---|---|---|
| swipe left a little: Use one | Use one button, key U | the tapped row shows the buttons at 44 px; swipe still works |
| swipe left a long way: Used up | Used up button, key D | same |
| swipe right: Add to shopping list | Add to list button, key S | same |
| Undo bar | same bar, key Z | same |

The control is chosen by the hover capability in CSS, not by width.

## Proposals (the mockup chose; each has an open question)

DA-P1 every swipe action stays reachable on desktop with the same 5 second Undo and Z. DA-P2 one code path: every option calls the swipe's own `act()` and `shop()`. DA-P3 a mouse drag stops swiping on desktop; touch and pen still do. DA-P4 touch laptop: swipe stays and the tapped row shows the controls at 44 px. DA-P5 level-only rows have no Use one, Out rows offer Add to list only. DA-P6 words: Use one, Add to list, Used up on buttons; Add to shopping list in the menu, panel and lane. DA-P7 order: Use one, Add to list, Used up, the tick last. DA-P8 in A the use-by words hide while the buttons show. DA-P9 Add to list from a row behaves like the S key (sends the "How much to buy" words at Running low or Out). DA-P10 the used-up guardrail is asked in place ("Use up peas anyway?" with Use up and Not now). DA-P11 key caps use the shared kbd class and follow the Shift Space switch. DA-P12 in C, once a row is picked a plain click picks or unpicks it. DA-P13 in B the menu closes with the close chord, a click outside or a choice, not plain Esc.

## Open questions (recommended position first)

- **DA-Q1** Which option? Recommended: A with Use one in the panel. Wrong pick costs a mockup edit.
- **DA-Q2** Does a mouse drag stop swiping on desktop? Recommended: yes (it fights text selection and click-to-open).
- **DA-Q3** Touch laptop: keep swipe, show controls on the tapped row? Recommended: yes.
- **DA-Q4** Ask the used-up guardrail in place? Recommended: yes, as its own later slice (it changes a write path).
- **DA-Q5** Add to list on an Out row from the row? Recommended: yes.
- **DA-Q6** Several items at once (C), now or later? Recommended: later, when a real case exists.
- **DA-Q7** A context menu as well as A? Recommended: not now.
- **DA-Q8** Should the row's Add to list ask how much to buy? Recommended: no, as the S key today.
- **DA-Q9** Plain Esc closes a menu or selection? Recommended: no, keep the close chord.
- **DA-Q10** Hiding the use-by words while the buttons show? Recommended: yes; else icons only.
- **DA-Q11** One more Tab stop per row in A? Recommended: leave it.

## Build impact

No migration in any option: no schema, no stored data, no new setting.

- Recommended (A, Use one in the panel, no mouse drag): **routine**. Touches `desktop-pantry.js` (row buttons and key caps, desktop only, fetched only from 64rem), `desktop-css/pantry.ts`, the desktop item panel (one button), `swipe.js` (pointer type, one line, the only shared-file edit), the swipe test and a new desktop browser journey. No deny-list path, no new route.
- B and D: routine.
- C: **guarded**. Several used-ups need a batch route (a new write path in `web-edit.ts` and the store, on the deny list); looping the single call trips the third-in-five-minutes guardrail and the per-member write limit. Needs a risk package.
- The in-place guardrail confirm (DA-P10, DA-Q4): guarded, separate slice; the reduce route accepts one field today.

## What this loads (DESIGN.md section 6)

Default path: `desktop.html`, `rows.css`, `rows.js`, `act.js`, `sample.js` on top of `theme.css`, then only the chosen option's two files; the other three are never requested (checked). In the app nothing new is fetched: the controls are drawn by `desktop-pantry.js`, which a phone never downloads, and actions change in place with the Undo bar.

## Differences between mockup and build

Mockup-only names stay in `sample.js`, `act.js` (the stand-in for `KitchieSwipe.act` and `shop`) and the Prototype bar. The builder copies `rows.css` and the chosen `opt-*.css` and `opt-*.js` markup first; each difference goes in the Kitchie PR.
