# Plan UI review: desktop and phone

Owner ask, 12 October 2026 (voice or text): "Analyse the plan UI for desktop and mobile and amend with better UI choices/options, in mockup first." Everything below the owner's words is a **proposal** by the design agent. Nothing is built in Kitchie and nothing is confirmed. Decisions 63 to 84 continue the Plan list after 49 to 62 (proposals by the design agent). Decisions 85 to 106 (12 Oct 2026 revision, below) are mostly **owner-stated, 12 Oct 2026, by voice**, and 107 to 109 (second revision, at the end of this file) are **owner-stated, 12 Oct 2026**, typed late that evening. Other job notes reuse these numbers for their own lists (`item-edit-flyout.md` uses 85 to 104 and more), so always cite them as "Plan UI review 85" with this file name.

Mockups: [`fragments/plan-ui-review/index.html`](../../../fragments/plan-ui-review/index.html) (links [`desktop.html`](../../../fragments/plan-ui-review/desktop.html) and [`phone.html`](../../../fragments/plan-ui-review/phone.html)). Builds on [plan-week-ai.md](plan-week-ai.md) (1 to 48, phone) and [plan-desktop.md](plan-desktop.md) (49 to 62, options A to D, still as drawn; the review layouts are refinements, not replacements).

## Job

Same as before: see the week, fix it, know what to buy and what to cook first. Seen with a culinary lens, a week plan is a **rhythm** (which nights we cook, which nights are leftovers or off, which night is the big cook), a **stock question** (what is on hand, what is missing, what is going off first) and a **who question** (who is eating). The screen should answer those three at a glance and let the person fix one night without losing the week.

## What was reviewed

- The current desktop Plan page (owner's screenshot, about 1920 wide, dark, household "Crazy Zoo"): an agenda of day rows, a person filter, a meal detail flyout.
- Mockup layouts A to D of `fragments/plan-desktop/` (PR #69), the phone Plan of `fragments/plan-week-ai/` (decisions 1 to 48). There is no separate current mobile mockup file besides that fragment.

## Desktop: what works

- The rail, dark look, colour language (warning red for missing, accent for list and Today, sage for held and all clear) is right and kept.
- A day row per day with several meals, the card as the unit, "Hold" and the cart per missing item, undo for every removal.
- Detail beside the list is the right idea (Pantry master and detail).

## Desktop: what is wrong, and the fix

| # | Problem (from the screenshot) | Fix drawn | Decision |
|---|---|---|---|
| 1 | Content stops near 1300px, left aligned; the right third is dead; the header rule stops short | Main column is fluid between the rail and the inspector; the sticky header, filter row, summary and plan span it all; spare width becomes more cards per row, and from 1760px day columns | 63, 64 |
| 2 | Meal flyout anchored low, covers Fri to Sun, runs off the bottom, On hand is cut off, no obvious close | Inspector is `position: fixed`, full height, header and footer pinned, only the middle scrolls (`overscroll-behavior: contain`); close x is 44px and always in view; docked it pushes the page, as a flyout it overlays only below 1440 (with scrim) and pushes from 1440 | 65, 66 |
| 3 | "Held" floats at the far right, detached from ON HAND, over the divider | Held sits in the On hand heading row; one divider under the whole row; Add all in Missing follows the same pattern | 67 |
| 4 | Filter tabs: uneven dividers, unclear selected state, test labels, no overflow | Mine and Everyone as a segmented pair (selected is filled with a check), one thin divider, a chip with an initial per member, "+N more" popover with search; two alternates (one menu, segment plus People) | 68 |
| 5 | Dashed boxes are heavy with no add affordance; Not cooking as loud as a meal; small low-contrast day label; far, small ... menu | Day label is the largest text in the row (1.4rem in rows); open night is quiet text with "Ask assistant" always visible and the other actions on hover or focus; Not cooking is a short block with an accent bar; the ... button sits inside the card at 40px and right-click opens the same menu | 69 to 71, 74 |
| 6 | Chips "1", cart "1", bookmark are cryptic; "Made up by your assistant" chip plus "Not a saved recipe." is clunky; long titles truncate | Chips carry words ("Missing 2", "On list 1", "Held", "Use by Tue 13", "All on hand"); source is one plain line in the inspector; titles wrap, never truncate | 72, 73, 74 |
| 7 | No today marker, no week summary, no keyboard hints | Today pill and border; summary strip (nights cooking with seven rhythm dots, to buy, use first, leftover nights) whose tiles highlight cards; `?` opens the keyboard list, hints show on the buttons | 75, 76, 78 |

### Layout options (desktop)

1. **Week board + docked inspector** (recommended). Seven columns from 1760px (the docked inspector leaves about 1150px), the agenda rows below that, same cards. Best at a glance: the whole rhythm of the week in one view.
2. **Agenda rows + docked inspector.** Works from 1024. A card that spans a row reads as a line (who and what left, status right), a row can hold two cards (Thu). Easiest to read and to build; shows less of the week on a tall page.
3. **Day focus.** Seven day tabs (meal count each), one day large, "Before this night" (buy, use first). Good for a quiet household; weakest at a glance.

Inspector: **docked** (recommended) or **flyout**. Open night: **ghost** (recommended) or **slim row**. Status: **labelled chips** (recommended), icons with tooltips, or one status line.

## Mobile: what works

- Decision 48's single compact strip for the people filter, decision 13 swipes (left Replan, right Not cooking), the sheet detail, the idle curtain (15).
- A card per meal; dashed open nights.

## Mobile: what is wrong, and the fix

| Area | Issue | Fix drawn | Decision |
|---|---|---|---|
| Thumb reach | Everything that matters (header, filter, ...) is at the top; "Open your assistant" far from the thumb | Replan and Not cooking pinned at the bottom of the sheet; "Open your assistant" pill above the nav; ... button 44px | 79, 82 |
| Swipe | Gesture only; no feedback word until late; no mouse or keyboard way | Tinted reveal with the word (Not cooking or Replan), commit at 88px, undo toast; mouse drag works (pointer events); focus a card then X or Shift X; ... button opens an action sheet; a "buttons stay open" variant is drawn | 80 |
| Bottom sheet | Half or full is unclear; drag only | Two stops (half 62%, full 92%), handle that drags or is pressed (Enter, Up, Down), x at top right, Esc, scrim tap; selected card scrolled above the sheet | 81 |
| Sticky week header | Week context scrolls away | Sticky stack: week header, people strip, **day strip** (state dots, today ringed, follows scroll, tap jumps); summary row scrolls away | 79 |
| Filter chips | Scroll with no hint | Fade at the edge, chevron expands rows (48); one-menu variant with search for big households | 84 |
| Consistency with desktop | Different vocabulary | Same cards, chips with words, summary numbers (to buy, use first), same keys and menu items | 72, 75 |
| Day change | Sideways swipe would clash with card swipe | M2 (one day at a time) changes day by the strip or two bottom buttons, never a page swipe | 83 |

Phone options: **M1 agenda + day strip** (recommended; opens on today, past days above) and **M2 one day at a time**; swipe **tint** (recommended) or **buttons**; people **strip** (recommended) or **menu**.

## Culinary lens, in the design

- **Cooking-night rhythm.** The summary shows nights cooking as seven dots (cooking, not cooking, open, today ringed) and the day strip repeats it; a quiet week is visible before reading any card.
- **On hand versus missing.** Every card says either "All on hand" (sage tick) or "Missing" with the names; the summary counts to buy across meals and how many are already on the list; the Missing section adds one item or all.
- **Use first.** The summary names what goes off first; the tile highlights those meals; the inspector's idle view lists use-by with the meal that uses it.
- **Leftovers.** The big cook says "Cooks double: Friday leftovers"; the leftover night says "Leftovers from Wed 14"; the summary counts leftover nights. This needs the plan entries to know they are linked (follow-up, inside the decision 44 window).
- **Who is eating.** "Everyone, 4 people" or the named person stays on the card; the filter is first-class; the stepper in the inspector changes people and the quantities follow (decision 10).

## Prioritised fixes

1. Inspector: fixed, own scroll, close x, pinned footer (2). Cheapest, biggest relief.
2. Full-width layout and agenda rows (1, 5).
3. Words on chips; Held in the heading row (3, 6).
4. Filter redesign with overflow (4).
5. Summary strip and today marker (7).
6. Open night and Not cooking treatment (5).
7. Phone: sticky day strip, sheet stops, swipe labels and mouse or keyboard equivalents.
8. Leftover chain data (needs a data link between plan entries).

## Decisions (proposals, 12 October 2026, by the design agent; owner to confirm or overturn)

63. The desktop Plan fills the window beside the rail: the main column is fluid, and the header rule, filter row, summary and plan span it all. (Revisits "left-anchored, free space on the right", decision 56 and `DESIGN.md` section 7 item 2, for Plan; the group is anchored left, the docked inspector flush right, nothing is capped in between.)
64. The Week board draws seven columns only from 1760px (main column about 1150px or more with the docked inspector); below that the same cards draw as agenda rows. Refines 49 and 56.
65. The inspector is `position: fixed`, full height, with its own scroll. Docked (recommended) or flyout. Under 1440 it opens on demand and pushes the page; a flyout overlays with a scrim only under 1440. It never covers the day it is about at 1440 and up. Refines 50 and 51 (widths 380, 400, 440).
66. Inspector header: the close x is 44px and always in view. Replan (X) and Not cooking (Shift X) are pinned in a footer. Close is Ctrl or Cmd Enter or the x (53 stands); Esc closes only a flyout, menus and popovers; the docked inspector ignores Esc.
67. Hold (with H) sits in the On hand heading row, right aligned on the heading's baseline, one divider under the row; Add all N (L) sits in the Missing heading row. Refines 9 and 11.
68. People filter: Mine and Everyone as a segmented pair with a check on the selected one, a thin divider, one chip with an initial per other member, "+N more" with a popover and search when more than five; the +N button stays lit when the picked person is folded away. Alternates: one menu, or segment plus People. Supersedes the look of 48 on desktop only; the phone keeps 48.
69. A day row has a large day label, a Today pill and an accent border on today, and dimmed past days that say "Nothing was planned" instead of an empty box.
70. Open night has no dashed box. "Ask assistant" (opens the default AI app, 45) is always visible; "Add by hand" (the Plan it panel) and "Not cooking" appear on hover or focus (always visible on phone). Tap on an open night row on phone still marks Not cooking (23). The Plan has no add control of its own (assistant-led), as before.
71. Not cooking is a short, quiet block with an accent bar (this week only) or a plain bar (usual day off), "click to cook" below; no filled tile. Revisits the fill in 35 and 36.
72. Status chips carry words (Missing N, On list N, Held, Use by <day>, All on hand) on desktop and phone; icon-only with tooltips and one status line are alternates. Revises 27 (symbolic pills); every icon keeps an accessible label.
73. The source line ("Made up by your assistant", "not saved as a recipe") is one plain line with a spark icon in the inspector or sheet, not a chip; still not on the card face (26).
74. Card titles wrap and never truncate. The ... button is 40px on desktop (44 on phone) and sits inside the card; right-click opens the same menu (Open, Replan, Not cooking, Hold, Add missing).
75. A week summary strip sits above the plan: nights cooking n of 7 with seven rhythm dots, to buy (items, meals, already on list), use first, leftover nights. The to-buy and use-first tiles toggle a highlight that dims other cards.
76. A today marker everywhere: pill, accent border, ringed date in the day strip.
77. A big cook says "Cooks double: <day> leftovers" and a leftover night says "Leftovers from <day>". Needs plan entries linked to each other (data-model follow-up inside the decision 44 window).
78. Keys: arrows between cards, E or Enter opens, Ctrl or Cmd Enter closes, X, Shift X, H, L (add missing to list), Z undo, A assistant, T today, M main, ? list. Extends 55.
79. Phone: a sticky stack of the week header, the people strip and a day strip (seven days, state dots, today ringed). In the agenda layout the strip follows the scroll and a tap jumps to the day.
80. Phone swipe: a tinted reveal with the word, commit at 88px, undo toast; works with a mouse and with X or Shift X on a focused card, plus the ... action sheet. Decision 13 stands (left remove, right Not cooking); 25 and 38 wording (Replan) is kept.
81. Phone detail is a two-stop bottom sheet (half, full). Handle drag or press, Up and Down on the handle, x, Esc, scrim tap; Replan and Not cooking pinned at the bottom; the selected card is scrolled above the sheet.
82. Phone: "Open your assistant" (43, 45) moves to a pill above the nav, in the thumb zone. Same action.
83. Phone, one-day layout: no sideways page swipe between days (it collides with the card swipe); the day changes by the strip or two bottom buttons. Week change stays the arrows and the title long-press (2).
84. Phone people strip stays as decision 48; a searchable menu is the alternate for large households.

## Open questions

- Which desktop layout and inspector style the owner picks. A wrong guess costs a redraw only.
- Does Plan on desktop fill the window (63), replacing the left-anchored rule for this page?
- Does the quiet Not cooking block replace the filled one (71, revisits 35, 36)?
- Words on the chips (72) versus the symbols decided in 27.
- Esc closing a flyout inspector (66), given Pantry's Esc rule.
- Does the leftover link (77) become real data, and where is it stored?
- Board only from 1760px (64): acceptable that 1440 and 1920 windows with the inspector open show rows at 1440?

## For the implementation

- Same service methods as the chat tools: `plan_view`, `plan_update_meal`, `plan_remove_meal` (Replan), `plan_block_day` (Not cooking), `plan_reserve` (Hold), `plan_add_missing_to_list`, `plan_move_meal`. The UI never reimplements them.
- Viewport code in its own files: `d-1024.css`, `d-1280.css`, `d-1440.css`, `d-1760.css`, `d-1920.css`, `d-short.css` (desktop, linked with `media=`), `phone.css` and `phone.js` (phone only). `d.css`, `desktop.js`, `data.js` carry no size rules. Default path loads about 40 KB of shared code and only the matching size files; no images.
- Class names follow the Plan and Pantry mockups where the thing is the same (`.mc .tg .blk .rail .nv .kbd .toast`); the mockup's sample data stays in `data.js`.
- Touch and pointer: swipes use pointer events (touch and mouse alike), `touch-action: pan-y` on cards; the sheet handle uses pointer capture. Respect reduced motion when built.
- Accessibility: radiogroup on the people filter, `role="dialog"` on the sheet, labels on every icon-only button, 44px targets except the dense desktop chips (26px, not primary controls).
- Verification done in this mockup: headless screenshots at 1024, 1280, 1440, 1920 (desktop) and 390, 360 (phone), in `kitchie` and `kitchie-day`; no sideways scroll; no page errors; keyboard and swipe paths exercised. Pages URL: <https://basement-bridge.github.io/mockup/fragments/plan-ui-review/index.html> (not checked from the sandbox).


---

# Revision, 12 October 2026: owner voice review (decisions 85 to 106)

Owner opened the review page and gave feedback by voice. **Owner-stated, 12 Oct 2026** marks his words; **Proposal** marks the design agent filling a gap. Phone first, desktop equivalents are proposals. Nothing is built in Kitchie.

Mockups: [index](../../../fragments/plan-ui-review/index.html), [phone.html](../../../fragments/plan-ui-review/phone.html) (rewritten: day ribbon), [desktop.html](../../../fragments/plan-ui-review/desktop.html) (ribbon, dropdown filter, Ask AI, copy and undo). Earlier options A to D are in [plan-desktop](../../../fragments/plan-desktop/index.html) and now linked from the review index.

## Page fixes (same day)

- **Images were missing** because the repo `.gitignore` contains `shots/`, so every `shots/` folder (review and plan-desktop PR #69) was never committed and the Pages site had no files to serve. Images now live in `img/` folders (not ignored) and every `img` on both index pages was checked to load.
- "The bulb icon top right" is **Plan settings**, drawn as a sun-like cog. It is now a recognisable gear, labelled "Plan settings" on the page. The mockup-only **Options** button (now "Mockup options") is not part of the app.
- "Bottom sheet, two stops" is the phone meal detail as a sheet that stops at half and full height. It is now explained on the page and kept as the comparison option.

## Decisions

Navigation (owner-stated, 12 Oct 2026)

85. Replace discrete week jumps with a **continuous day ribbon**: scroll day by day, not week-snapped ("Sunday to Monday is one nudge, not a work calendar"). Desktop equivalent: Proposal, a 21-day ribbon in the header; the board stays one Monday-to-Sunday window.
86. The ribbon is **bounded: last week, this week, next week**. AMBIGUOUS, see open questions (he first said "four weeks forward", then "last week, this week, next week, that's enough"). Three weeks drawn.
87. The **"Week of" label stays** and follows the selected or centred day ("Week of <that week's Monday>"). "Last week / This week / Next week" shows under it when it applies. No fortnight wording.
88. **Today is always highlighted** (filled date). A **jump to today** shortcut (assistant-proposed, owner accepted the ribbon direction) appears whenever the selected day is not today (phone pill in the header; desktop pill and key T).
89. The **soft rectangle selection marker** that glides as you scroll the agenda: "fantastic", kept. Tapping a day in the ribbon brings it into focus in the agenda, whatever dots or leftover markers it carries (a hidden Not cooking day is revealed).
90. **Space at the top is too expensive.** Person filter collapsed by default (97), prev/next week buttons replaced by the ribbon, Week-of label compact (one line plus the relative word).
91. Header: **collapsible sticky header that shrinks on scroll down and returns on scroll up** (Proposal, recommended) versus **fixed**. Both in Options. Drawn as a fixed bar with an in-flow spacer so shrinking never moves the page.

Open and Not cooking nights (owner-stated unless marked)

92. An undecided day reads **"Open night"** (quiet text, no dashed box). Tapping "Open night" turns it into **Not cooking**, which then hides once you move on.
93. **Not cooking is hidden by default** (phone). A hidden day scrolling into view **peeks** at the edge it passes (arrives from the bottom edge, leaves under the top edge), then is gone. Peek is a slim strip clipped by the header or nav. Tapping a ribbon day reveals it. Desktop: Proposal, a slim "Not cooking" line instead of the block (no scroll peek needed); "always shown" kept as an option.
94. Open night offers **"Ask AI"** and **"Surprise me"**, scoped to that day. **Surprise me heuristics (owner-confirmed):** timing aware, early in the week or with room to shop it may suggest something new and may use items already on the shopping list or already being bought for planned meals; late in the week or when eating mostly from the house it favours reusing on-hand stock; always non-repetitive against recent meals. Explainer only, not UI copy. Mock rule (Proposal for the thresholds): on-hand if the night is today or tomorrow, or Fri to Sun of this week; otherwise new; "recent" is any planned meal within 7 days.
95. Wording is **"Ask AI"**, not "Open your assistant". Owner votes against that wording and **against any floating or persistent assistant control**: the floating pill (phone) and the header button (desktop) are removed. Ask AI lives on open nights, in the curtain (96) and on key A (scoped to the day in view). Supersedes 82 and 70's "Ask assistant" wording of this note, and the "button stays" decision 43 of `plan-week-ai.md`. Not found anywhere in this repo: the existing "Ask AI" wording in the app; Kitchie was not reachable to copy it (open question).
96. **Week-level "Ask AI to plan this" curtain** when everything in view is empty or Not cooking, dropping under the ribbon (same drop and push as the idle nudge, decisions 15, 19, 20 of `plan-week-ai.md`, desktop `plan.css` `.curtain`). Dismisses on any interaction. Trigger: owner first said idle-triggered, then that people look at the start of the week anyway, so "start with the start of the week and play with it". **Prototype, NOT locked**, two variants: (a) **start**: shows immediately when the first three non-past nights of the selected week are empty (default); (b) **idle**: the whole selected week empty and 5 s of no interaction. Off is also offered.

People and filter

97. The person filter must stop eating space: **collapsed by default into a dropdown** ("Showing Mine v"; Mine, Everyone, then other members, view only, with search). The "Everyone" part is kept as is for now with visual options for him to judge once built: (1) one dropdown (recommended), (2) Mine / Everyone segment plus a People dropdown, (3) earlier chips behind a chevron. AMBIGUOUS, see 98.
98. AMBIGUOUS: he also said the "number of people / various different people" control should be a dropdown ("if we do it, that's a drop down"). Mocked both ways for the **people count in the meal detail**: stepper (current) or dropdown. See open questions.

Copy, undo, drop

99. **Copy last week** fills **only empty days and never overwrites** (no confirm). It acts on the plan of the **active pill**: Mine copies my last week into mine; Everyone (household) copies the household plan; **other members' plans are read only** and cannot be planned for (Copy disabled, banner "Jane's plan: view only"). Proposal details: Not cooking days count as decided and are not filled; past days are never filled; it copies the week before the selected week into it ("last week" when viewing this week, this week when viewing next week).
100. **Phone, past is read only**: past meals have no delete, move or Not cooking. **Swipe right on a past meal = copy forward**: a date picker (today onward, this and next week) takes you to a date, then the meal is **in hand**, a floating bar above the nav, until you tap a day to drop it (or Cancel). While carrying, **all days show, including hidden Not cooking days**, each marked "Tap to drop here". Past days cannot be dropped on. The ... menu and the detail of a past meal offer the same "Copy forward".
101. **Undo is a hard requirement everywhere something is copied, dropped or removed.** Desktop (owner): the Copy button **flips to Undo with the curly-arrow icon**; other changes keep the undo toast and Z. Phone: he did **not** like the snackbar ("give me options"). Four patterns drawn, **no bottom snackbar**: (1) **anchored on the changed day** (recommended), (2) the **Copy button flips to Undo** in the header, (3) **banner under the ribbon**, (4) **pill under the ribbon**. Recommendation (Proposal): pattern 1 for everything, plus pattern 2 for Copy last week, because Copy changes several days and the button is where the thumb already is. Undo is one level (latest change), Z on a keyboard, notes clear after 14 s.
102. **Drop rules (owner-stated)**: dropping on a Not cooking day makes it a cooking day. Dropping on a day that already has a meal **replaces it with no confirm, because undo exists, but never silently**: the day says "Replaced <meal> with <meal>" and the changed day **pulses** (his chosen feedback, option 1; he will ask for another if he dislikes it). Proposal: with several meals on the day, the first is replaced. **Where the dropped meal lands in the day is AMBIGUOUS** ("start of the day" then "week"); verbatim in open questions; mock puts it first in the day.
103. **Phone meal detail docks directly below the ribbon**, inline in the flow, not an overlay; **that day becomes the heading of the detail**; other days recede. What stays visible is deliberately OPEN (he does not want the cook-sheet "full" locked). Three variants plus the sheet: (1) **neighbours peek** (yesterday and tomorrow as one line each; Proposal, recommended: the ribbon already maps the week, neighbours add leftover and shopping context), (2) other days of the week as one line each, (3) all other days hidden, (4) the **two-stop bottom sheet** kept as the comparison. Close with x or Esc; the page returns to that day. **Refined by 107** (below): the stack is now the default; this entry's variants stay as options.
104. **Missing and Use-by language is not landed.** Four options on both surfaces, each shown on a meal with missing items and a use-by warning (Wed curry: 2 missing, 5 of 7 ready, chicken by Tue 13): (a) labelled text chips ("Missing 2", "Use by Tue 13") coloured by urgency (use-by: today or overdue red, within two days amber, later quiet); on list and held become a quiet line; (b) icon plus count badge; (c) one edge strip and a status dot per card, specifics only in the detail; (d) progress, "5 of 7 ingredients ready" with a bar and one use-by line. **Recommendation (Proposal): (a)**, it is the only one that reads without learning anything and it carries the use-by day; (d) is the runner-up for phone.
105. Desktop equivalents (all **Proposals**): ribbon of 21 days with week group labels and the gliding marker; the board and agenda show the Monday-to-Sunday week of the selected day; dropdown filter inline in the title row (the Keyboard link moves to the rail's Keys); Copy last week button with the flip; Ask AI and Surprise me on open nights; the curtain under the ribbon; slim Not cooking; past is read only; no copy-forward or in-hand on desktop (moving by drag stays as decisions 6 and 54, not redrawn). Continuous scrolling of agenda rows across weeks on desktop is not drawn.
106. Supersessions: 103 is refined by 107 (the day card and the detail now dock as one stack; the four variants stay as options); 72 (words on chips) is reopened by 104; 70 and 82 "Ask assistant" wording and the persistent button by 95; 79 and 83 week change by arrows and title long-press by 85; 71 (Not cooking block) by 93 for phone; 68 chips by 97 as the default.

## Open questions (owner)

Still unanswered from the first review:
- Which desktop layout (board, agenda, day focus) and inspector style (docked, flyout). Options A to D of PR #69 are now linked from the index (note B).
- Fill the window beside the rail (63) or left-anchored (`DESIGN.md` section 7 item 2, decision 56)?
- Not cooking block replacement (71): partly answered by 93 (hidden on phone); desktop proposal is the slim line.
- Chips versus symbols: now four options (104).
- Esc closing a flyout inspector (66).
- Leftover link as real data (77), and where it is stored.
- Board only from 1760px (64).

New from the voice review (record, do not guess):
- **Weeks shown (86):** "four weeks forward" or "last week, this week, next week, that's enough"? Three weeks drawn; four forward would need a longer ribbon and more data (decision 44 window).
- **Who control (97, 98):** is the dropdown the person filter (many people), the people-count in a meal, or both? Both mocked.
- **Where a dropped meal lands (102):** verbatim, "start of the day" then "week". Probably day-start versus a week-level slot; mock puts it first in the day.
- **Curtain trigger (96):** immediate at the start of an empty week or idle-delayed; or both; not locked.
- **Surprise me (94):** thresholds for "late in the week" and "recent" are Proposals.
- **Ask AI wording (95):** the existing app wording could not be checked (Kitchie not reachable); match it when built. Keep the header and floating controls off on desktop too?
- **Undo pattern (101):** pick one of four; also whether undo is one level or a history.
- **Detail on phone (103):** which of three docked variants (or the sheet). Superseded as the default by 107; still selectable.
- **Status (104):** pick one of a to d.
- **Header (91):** shrink or fixed.

## Not done and blockers

- `basement-bridge/kitchie` was not reachable from this session, so no Kitchie issue was filed. Issue text to file when reachable (kept up to date for decisions 107 to 109): **"Plan UI review: choose layout and confirm decisions 63 to 84 and 85 to 109"**, body: links to the review index, `plan-ui-review.md` (this file), phone.html and desktop.html, the open questions above and those of the second revision below, "owner-stated 12 Oct 2026" for 85 to 99 and 107 to 109 except Proposal parts, and the standing rule that nothing is built before the owner picks. Cite the numbers as "Plan UI review 107" because `item-edit-flyout.md` reuses 85 and up.

## What loads (DESIGN.md section 6)

phone.html: theme.css, phone.css, data.js, status.js, phone.js (about 60 KB); no images, no fonts beyond the theme. desktop.html: theme.css, d.css, data.js, status.js, desktop.js plus only the size files that match. Deferred: none needed; the curtain, peek and date picker render on engagement. `status.js` and `data.js` have no viewport rules.


---

# Second revision, 12 October 2026 (late): the stack, the way back, Clear week (decisions 107 to 109)

Owner, typed 12 Oct 2026 about 23:29 to 23:32 Sydney, after reviewing `phone.html?sel=wed-curry`. **Owner-stated, 12 Oct 2026** marks his words; **Proposal** marks the design agent filling a gap. Mockup first only; nothing is built in Kitchie. Cite as "Plan UI review 107" (this file), never bare, because `item-edit-flyout.md` also uses 85 and up.

His words, verbatim:

1. "when the user clicks a given day with meal, that day docks to the top and the sheet like idea docks to the bottom but still continues one vertical puzzles locked together"
2. "when the user either closes the sheet view or starts dragging the recipe tile then the week plan view kicks back in"
3. "next to copy last week is clear the week icon (like) .. like copy last week, clear also can be undone by clicking again (the in place transformed button)"

Mockups: [index](../../../fragments/plan-ui-review/index.html) (sections "the stack" and "Clear week"), [phone.html](../../../fragments/plan-ui-review/phone.html) (`?sel=wed-curry` opens the stack, `?demo=1` plays the sequence, `?long=1` the long list, `?cw=menu|pair`, `?cl=meals|all`), [desktop.html](../../../fragments/plan-ui-review/desktop.html). Screenshots in `fragments/plan-ui-review/img/` (`p-stack-*`, `p-seq-*`, `p-clear-*`, `d-clear-*`).

## Decisions

107. **Phone: the day and its detail dock as one stack (owner-stated; refines 103).** Tapping a day that has a meal docks that day (its heading and the meal tile) at the top, directly under the ribbon, and the detail at the bottom, as ONE continuous vertical stack locked together like puzzle pieces: no gap, a shared edge, no overlay floating over other days, the other days out of the stack while it is open. Drawn (Proposal for the look): two pieces with an accent outline, a tongue under the day card that fits into the top of the detail and is the drag handle. The day card is pinned; **the detail is the only thing that scrolls**, inside the height that is left (long ingredient list: pinned day card, soft scroll shadow, Replan and Not cooking pinned at the bottom). A day with two meals shows the other meals as one quiet "Also" line (Proposal). Status chips move into the top of the detail so the day card stays short (Proposal). The header is forced compact while the stack is open (Proposal). **Recommended phone detail default**; the four earlier variants (neighbours peek, other days one line each, others hidden, two-stop sheet) stay as options (`dt=peek|strip|hide|sheet`). `?sel=wed-curry` opens it. Cooking (Replan, Not cooking, Hold, add to list, people) is unchanged.
108. **Leaving the focus state returns to the full week plan (owner-stated).** (a) Closing the stack: the x, Esc, the handle dragged down more than 90 px (or Enter on the handle), a swipe down on the detail when it is at the top of its scroll. The week is back, scrolled to that day. (b) **Starting to drag the meal tile** out of the stack (about 8 px, mouse or touch, `touch-action: none` on the tile): the week plan is back **immediately under the finger**, with the tile in hand (a lifted ghost; the original shows dashed). Proposals: the week draws compact while you drag (chips and summary hidden so all days fit), every day below today is a drop target including a hidden Not cooking day, the edge of the screen scrolls the week, a drop on a meal replaces it and on Not cooking makes a cooking day (decision 102, same wording and pulse, Undo on the day), a drop outside a day, on the origin day, Esc or a cancelled pointer moves nothing and says so, and the week stays (the stack does not reopen). Keyboard and menu: "Move to another day" in the card menu runs the same in-hand flow as copy forward. Shown as a five-frame scripted sequence (`?demo=1`, auto-play, Prev, Pause, Next): 1 week, 2 tap, 3 drag, 4 drop, 5 close instead.
109. **Clear week, next to Copy last week (owner-stated), with in-place Undo.** An icon button with a label or tooltip, the icon an **eraser** (Proposal: not a bin, which implies permanent delete). Like Copy last week (99, 101) it transforms in place into **Undo** (curly arrow) and a click on it restores the cleared meals. Desktop: both buttons side by side in the title row; at 1024 icons with a tooltip, the label from 1280. Phone, two placements drawn (Proposal): **(1) Week actions menu, recommended**: one button where Copy was opens a menu with Copy last week and Clear week, each with its scope in words and the reason it is disabled; after use the button splits into "Undo clear" (or "Undo copy") plus the menu button, so a second action stays reachable; **(2) two icon buttons** next to each other (no room for Plan settings while the Today pill shows, no tooltip on touch). Recommendation (1): header stays slim, labels carry the scope of a destructive action, Clear then Copy works.
    - **Scope (Proposal, owner-aligned with 99):** acts on the active pill's own plan for the selected week only; other people's plans are read only so it is disabled with the reason; past weeks are read only so it is disabled; past nights stay (it clears from today on). It uses the same set of meals Copy last week would use for that pill (on Mine that includes household meals the user eats).
    - **Not cooking (open question):** recommended default clears meals only; this-week-only marks stay (a day off is a decision, not a meal) and a usual day off is a rule so it always stays. `cl=all` shows meals plus this-week marks.
    - **No confirm** because Undo is one tap, **never silent**: the first cleared day says what went ("Cleared 5 meals, Tue 13 to Fri 16 (my plan). Not cooking days stay.") and the cleared days pulse (decision 102's feedback). Clearing leaves the week empty, so the "Ask AI to plan this" curtain (96) can drop under the ribbon: clear, then ask AI.
    - **Undo names the action it reverses**: "Undo clear", "Undo copy" (visible label on the flipped button; also the accessible name). It lasts 14 s like the other undo notes.
    - **Clear, then Copy (open question):** recommended is a **short stack**, not one level: the latest action's button shows Undo ("Undo copy", with "+1 more" under the week title on phone); undo it and the earlier action's button shows Undo again ("Undo clear"); each step expires 14 s after it happened; Z on a keyboard does the same. This revises decision 101's "one level (latest change)" for these week-level actions and, in the mock, for every change. Alternative: one level, where the second action commits the first.

## Supersession notes

- **103 is refined by 107**, not removed: the stack is the default, and 103's three docked variants and the sheet stay as comparison options. 81 (two-stop sheet) stays as the comparison option it already was.
- **101** (undo is one level) is revised for discussion by 109's stack (open). The undo patterns and the Copy flip stand.
- **99** (Copy last week) is unchanged; 109 reuses its scope rules.
- **105** (desktop equivalents): 107 and 108 are phone only. Desktop keeps the docked inspector (decision 65) and drag to move (6, 54); only 109 applies to desktop.

## Open questions (new)

- **Not cooking marks (109):** keep (recommended) or clear with the meals?
- **Mine and household meals (109):** clearing on Mine removes household meals the user eats for everyone (the same set Copy uses; recommended for consistency), or only takes the user out of them?
- **Today (109):** is today included (drawn: yes)? Past nights are not.
- **Undo depth (109, 101):** short stack (recommended) or one level?
- **Clear week placement on phone (109):** menu (recommended) or two icons.
- **A drag that lands nowhere (108):** stay on the week (drawn) or reopen the stack on that day?
- **Moving a big cook (108):** Wed curry has linked Friday leftovers (77). Does the leftover follow, ask, or stay? Drawn: it stays and its "Leftovers from Wed 14" is not updated (mock gap).
- **Ribbon as a drop target (108):** dropping a tile on a ribbon day would reach other weeks without scrolling; not drawn.
- **Short phones (107):** at 360 x 640 the detail window shows about two lines before it scrolls; acceptable, or collapse the day card to the tile only?
- **Clear week shortcut (109):** none drawn (Z undoes it); a key would need the owner's pick.

## What loads (DESIGN.md section 6)

Default phone path is unchanged (theme.css, phone.css, data.js, status.js, phone.js, about 75 KB): the stack, drag, tongue and Clear week code are in `phone.js` and `phone.css` (phone only). `demo.js` (about 3 KB) loads only when the URL has `?demo=`; the week actions menu, the hand ghost and the drag listeners render or attach on engagement. Desktop: `desktop.js` and `d.css` only gain Clear week and the undo stack; viewport differences are in `d-1024.css`, `d-1280.css`, `d-1440.css`, `d-1760.css` (icons at 1024, Live dot hidden from 1440 to 1759).

## Verification done

Headless Chromium: phone 390 x 844 and 360 x 640 or 740, desktop 1024, 1280, 1440, 1920, dark theme. Scripted: open the stack by tapping a card and by `?sel=`; the day card stays pinned while a 21-line detail scrolls; Esc, x, handle drag (long drags close, short drags snap back), handle Enter, a touch swipe down close it; a mouse drag and a touch drag (CDP touch events) past the slop bring the week back under the pointer, hover marks the drop day, a drop on Not cooking, on a meal, outside a day, Esc and cancel behave as written, Undo restores; Clear week, Copy last week, the flip, clear then copy then Undo twice, expiry after 14 s, Jane and last week disabled with the reason; all earlier variants (`dt`, `st`, `hd`, `lay`, `pick`, `carry`, `u=flip`) load with no page errors and no sideways scroll. Not verified: a real phone (touch feel, momentum scroll) and the Pages URL from the sandbox.
