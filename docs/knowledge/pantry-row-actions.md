# Pantry item actions on desktop, without swipe

Status: **decided by the owner (voice, 17 Oct 2026): A + B + C together, each with its own drive mode.** The mockup shows the decision; the earlier four-option material below is kept as context (superseded where marked). Kitchie issue #866. Lines marked **Proposal** are choices the mockup made where the owner was silent; **Open** lines are not decided. Merging this mockup settles none of the open ones.

Mockup: `fragments/pantry-row-actions/` (notes page `index.html` with two tabs: Decided, and the earlier options; the screen `desktop.html`, default view `opt-all`; shared `rows.css`, `rows.js`, `act.js`, `sample.js`; the decided view is `opt-all.css` and `opt-all.js`; the earlier options `opt-a` to `opt-d` and `opt-now` are kept). Check: `tools/pantry-row-actions-check.mjs` (the decided view at 1024, 1280 and 1440, light and dark, mouse and touch laptop; the earlier options at 1280). Builds on `pantry-swipe.md` (the phone, unchanged), `desktop-layout.md` and `jobs-to-be-done/shopping-desktop.md` (SD-6, hover buttons with key caps).

## The decision

Owner, voice, 17 Oct 2026 (relayed, lightly cleaned): "I really like this. If somebody presses Command or Control and clicks, I want that multi-action idea (option C), in addition to the other option I want. When I do multi-select, you cannot do Use one; the only options are going to be Add to shopping list or Used up. The quantities in the shopping list are not a concern here. In addition: if the person does not hover over the right side where the buttons show when they hover, I want them to be able to right click and get the context menu (option B), but I do not want the three dots. If they are hovering over the right side of the row where the buttons show, I am happy for them to drive it from there (option A). So I am going for all three options, with specific drive modes."

| | A: buttons | B: right-click menu | C: select several |
|---|---|---|---|
| Drive it by | hover a row, click a button at its right | right click on the row away from the buttons; Menu key or Shift F10 on the current row | Ctrl or Cmd click toggles a row; Shift click picks a range |
| Offers | Use one (counted rows only), Add to list, Used up; key caps U S D; Use one also in the open item's panel | Use one (counted rows only), Add to shopping list, Used up (not on Out rows), then Open; entries that cannot apply are absent | Add to shopping list and Used up only; Use one absent whenever more than one row is picked |
| Does not | open a menu on right click over the buttons | open a menu over the buttons; no three-dot button anywhere | offer hover buttons while rows are picked |
| Keys | U S D, Z | arrows, Enter, U S D inside; Ctrl or Cmd Enter, click outside or a choice closes | S, D act on the picks (U only for one row); Esc, Clear or Ctrl or Cmd Enter empties |
| Undo | bar, 5 s, Z | same | one Undo reverses the whole batch |
| Touch laptop | tapped row shows the buttons (44 px); swipe stays | browser's context event only, not relied on | none by touch alone (no Ctrl or Cmd) |

## Decisions taken

- **DA-D1 to DA-D4** as before (below).
- **DA-D5** (owner, 17 Oct) The option is all three, each with its own drive mode. Answers DA-Q1, DA-Q7.
- **DA-D6** (owner, same) With several rows picked the only actions are Add to shopping list and Used up; no Use one. Shopping quantities are not a concern here. Answers DA-Q6 (now).
- **DA-D7** (owner, same) The context menu has no three-dot button; over the hover-button area no menu opens.
- **DA-D8** (taken with the recommendation the owner said they like) A mouse drag no longer swipes a row on desktop; touch and pen still do. Answers DA-Q2.
- **DA-D9** (same) Touch laptops keep swipe; the tapped row shows the buttons at 44 px. Answers DA-Q3.
- **DA-D10** (same) Add to list is allowed on an Out row, from the row, the menu and the panel. Answers DA-Q5.
- **DA-D11** (same) Use one is also in the open item's panel.

## Proposals for the decided view (the mockup chose; wrong-guess cost on the notes page)

DA-P1, P2, P5 to P11 stand (see below). DA-P3 and DA-P4 are now DA-D8 and DA-D9; DA-P12 is replaced by DA-P18. DA-P13 a menu closes with the close chord, a click outside or a choice (not plain Esc). DA-P14 one more Tab stop per row. DA-P15 the menu hides what cannot apply (no greyed entries), order Use one, Add to shopping list, Used up, then Open. DA-P16 right click over the buttons or the gaps between them: the page does nothing, the browser's own menu shows; the strip's fade takes no clicks. DA-P17 the row is a real link, so Ctrl or Cmd click and right click no longer give "Open in new tab" from the page (Shift right click and middle click still do); Shift click picks a range; on a Mac Cmd click is the pick (Ctrl click is a right click there). DA-P18 while rows are picked: plain click picks or unpicks, hover buttons step aside, right click opens the menu for the selection (Add to shopping list, Used up), S and D act on it, U says Use one is for a single row, Esc, Clear, Ctrl or Cmd Enter or a successful action empties it. DA-P19 the bar takes the header row's place (same 48 px, nothing moves); at 1024 it drops the hint line and key caps. DA-P20 one counted row picked can still Use one. DA-P21 Out rows can be picked; sentences name the rest ("2 items added to your list, 1 already on it", "1 item used up, 1 already out"). DA-P22 no keyboard multi-select in this slice. DA-P23 the panel greys Use one with a reason on a level-only item. DA-P24 no multi-select by touch alone. DA-P25 Esc empties a selection and nothing else.

## Open questions (only these two)

- **DA-Q4** How does a batch Used up meet the third-used-up-in-five-minutes guardrail? Recommended (shown in the mockup): a batch counts as one deliberate action, is not asked again, has one Undo, and the sentence names how many were done ("3 items used up"). A single row keeps DA-P10 (asked in place, its own later slice). Wrong pick costs: if the guardrail should bite on batches, the batch asks once; no data change.
- **DA-Q8** Shopping quantity behaviour. Owner: not a concern. Recommended: today's add behaviour for row, menu, panel and batch alike (no "How much to buy" question, as the S key, DA-P9).

## Build impact (the decision)

No migration: no schema, no stored data, no new setting. Three slices, in order.

1. A, the panel's Use one and no mouse drag: **routine.** `desktop-pantry.js`, `desktop-css/pantry.ts`, the desktop item panel, `swipe.js` (pointer type, one line, the only shared-file edit), the swipe test, a desktop browser journey. No new route.
2. The right-click menu, no three dots: **routine.** A `contextmenu` handler and one menu element in `desktop-pantry.js`, made on first use; nothing over the strip. Cost: DA-P17.
3. Ctrl or Cmd click multi-select: **guarded.** A batch Used up needs a batch route (a new write path in `web-edit.ts` and the store, on the deny list); looping the single call trips the third-in-five-minutes guardrail and the per-member write limit, and one Undo for the batch needs the same path. A batch Add to list shares the write limit and the one-Undo need. Needs a risk package; DA-Q4 is decided there.
- The single-row in-place guardrail confirm (DA-P10): guarded, separate slice, unchanged.

## What this loads (DESIGN.md section 6)

Default path: `desktop.html`, `rows.css`, `rows.js`, `act.js`, `sample.js` on top of `theme.css`, then `opt-all.css` and `opt-all.js` only; the earlier options' files are requested only when that view is opened (checked). In the app nothing new is fetched: the strip, menu and bar are drawn by `desktop-pantry.js`, which a phone never downloads; the menu and bar are made on first use.

---

# Earlier material (context): the four options, 17 Oct 2026 morning

Everything below is the four-option comparison as first drawn. It is superseded by the decision above where marked.

## What the owner asked and already settled (earlier)

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

**Earlier recommendation (the owner went further and chose all three): A, plus Use one added to the open item's panel, and a mouse drag no longer swipes on desktop.** It is the Shopping desktop pattern the owner already approved, adds nothing at rest, is one click, and the only option with all three actions on the row. B waits until there are more than three actions (it takes over right click on a real link). C waits until a real several-at-once job exists (it needs a new write path).

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

## Open questions as they stood that morning (status: DA-Q1 answered DA-D5; Q2 DA-D8; Q3 DA-D9; Q4 open for batches; Q5 DA-D10; Q6 DA-D6; Q7 DA-D5; Q8 open; Q9 DA-P13; Q10 DA-P8; Q11 DA-P14)

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

## Build impact of the four options (earlier)

No migration in any option: no schema, no stored data, no new setting.

- Recommended (A, Use one in the panel, no mouse drag): **routine**. Touches `desktop-pantry.js` (row buttons and key caps, desktop only, fetched only from 64rem), `desktop-css/pantry.ts`, the desktop item panel (one button), `swipe.js` (pointer type, one line, the only shared-file edit), the swipe test and a new desktop browser journey. No deny-list path, no new route.
- B and D: routine.
- C: **guarded**. Several used-ups need a batch route (a new write path in `web-edit.ts` and the store, on the deny list); looping the single call trips the third-in-five-minutes guardrail and the per-member write limit. Needs a risk package.
- The in-place guardrail confirm (DA-P10, DA-Q4): guarded, separate slice; the reduce route accepts one field today.

## What the earlier four-option page loaded

Default path: `desktop.html`, `rows.css`, `rows.js`, `act.js`, `sample.js` on top of `theme.css`, then only the chosen option's two files; the other three are never requested (checked). In the app nothing new is fetched: the controls are drawn by `desktop-pantry.js`, which a phone never downloads, and actions change in place with the Undo bar.

## Differences between mockup and build

Mockup-only names stay in `sample.js`, `act.js` (the stand-in for `KitchieSwipe.act` and `shop`) and the Prototype bar. The builder copies `rows.css` and the chosen `opt-*.css` and `opt-*.js` markup first; each difference goes in the Kitchie PR.
