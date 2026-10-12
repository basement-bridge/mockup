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

- `basement-bridge/kitchie` was not reachable from this session, so no Kitchie issue was filed. Issue text to file when reachable (kept up to date for decisions 63 to 133; 13 Oct 2026: the owner converts the PRs to issues, so none is filed from here): **"Plan UI review: choose layout and confirm decisions 63 to 84, 85 to 109, 110 to 119 and 120 to 133"**, body (add: the third and fourth revisions below, with their open lists; "owner-stated 13 Oct 2026" for 110 to 133 except Proposal parts): links to the review index, `plan-ui-review.md` (this file), phone.html and desktop.html, the open questions above and those of the second revision below, "owner-stated 12 Oct 2026" for 85 to 99 and 107 to 109 except Proposal parts, and the standing rule that nothing is built before the owner picks. Cite the numbers as "Plan UI review 107" because `item-edit-flyout.md` reuses 85 and up.

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

See also: Plan desktop decisions 110 to 120 (option B refined, owner voice 12 Oct 2026) in `plan-desktop.md`.

# Third revision, 13 October 2026: batch 1 of the live phone test (decisions 110 to 119)

Owner, by voice on 13 October 2026, after using the phone mockup on his own phone ("All right, update."). This is **batch 1** (the look of the shell, the ribbon, the detail behaviour, the lift and the tear). Batch 2 (his items 7 to 14 and the open questions) follows separately and will continue the numbering from 120. Cite these as "Plan UI review 110" and so on: `plan-desktop.md` also uses 110 to 120 for its own list.

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (`?sel=wed-curry` the stack; tap another ribbon day to see the swap; `?dock=d19` opens the stack on an open night; `?demo=1` plays the 7-frame sequence; `?demo=1&frame=4` the tear). Screenshots in `fragments/plan-ui-review/img/` (`p-grid-*`, `p-grid-past-390`, `p-lift-390`, `p-ribbon-pipes-*`, `p-swap-*`, `p-tear-*`, `p-seq-1..7-*`, `p-stack-*`).

## Decisions

110. **The shell is rebuilt on Kitchie UAT's calendar grid (owner-stated, 13 Oct 2026).** Owner: "the current UI [UAT] is better than what you're showing me now"; "get the stencil of that calendar from UAT". UAT's grid (a clear left gutter, clear margins separating each day, Outlook-like) reads better than the looser agenda cards. The new interactions stay (day ribbon, docked detail, swipe, inline undo); only the visual shell changes. **How the stencil was obtained: verified, not derived.** The Kitchie repository was reachable this time (`basement-bridge/kitchie`, branch `uat`, commit f2e03f5, 12 Oct 2026). Source read: `server/src/web-plan.ts` (the `PLAN_CSS` block and the page shell) and `server/src/assets/plan.js` (`dayHtml`, `cardHtml`, `headHtml`). What UAT draws, and what the mockup now uses **with the same class names**: `.pw` (the screen's scope), `.pw-day` (one row per day: `display:flex; gap:10px; padding:8px 0; border-top:1px solid var(--border)`, no line above the first), `.pw-dn` (the gutter: `width:38px; font-weight:800; font-size:13px; color:var(--muted); padding-top:12px`, the weekday, then `<small>` with the date such as "13 Oct"), `.pw-stack` (the day's meals: `flex:1; min-width:0; display:flex; flex-direction:column; gap:6px`), and the page gutter `var(--gutter)`. Those five rules are copied as written. The mockup's JS now uses `.pw-day` where it used `.dsec`, and `.pw-stack` where it used `.cl`.
    - **Differences from UAT, to list in the build PR:** (a) the day card face is still the mockup's (`.mc` with an emoji tile, the status chips of decision 104, the `...` button), not UAT's `.pw-mc` (a 48 px photo thumbnail `.pw-th`, title and one-line sub, `.pw-chips`, an avatar); the radius (`--r-ctl`) and minimum height (60 px) were matched, nothing else. The built app keeps its own `.pw-mc` markup and takes the mockup's lift, grey and tear rules (117, 114, 118). (b) UAT's week header (previous and next arrows, "Week of", Copy last week, Settings, the person strip) is not drawn here; the mockup's ribbon header (decisions 85 to 91) replaces it, as the owner asked on 12 Oct. (c) UAT draws one week at a time; the mockup scrolls three weeks (86) with a week header and summary between them. (d) UAT's empty night is a dashed `.pw-slot` button and its Not cooking day a `.pw-blocked` block; the mockup keeps the owner-stated quiet "Open night" text (93) and its own `.blk`. (e) UAT has no Today or past marking in the grid (111).
    - **Check at build time (nothing here is assumed):** the `--gutter` value on a phone (16 px in `theme.css`; UAT's page may add its own), the real width of the 38 px gutter with a longer date such as "30 Sep", the thumbnail size next to the narrower card (the card is about 280 px at 360 wide), and that the `.pw` scope is on the element the build wraps the grid in.
111. **Today and past in the grid (Proposal).** UAT's grid has no Today or past marking, so these are the mockup's: today's weekday and date are in the accent colour with a small filled "Today" pill under the date in the gutter (the ribbon's filled circle already says it); past days dim the gutter label. Wrong guess costs: low (CSS only).
112. **A bigger gap between Sunday and Monday, so the week boundary reads in the continuous scroll (owner-stated).** Ribbon: a 22 px spacer between Sunday and Monday carrying a 2 px pipe, stronger than the day pipes (a plain 1 px line at the same spot read as a day divider and did not say "new week"). Agenda: the new week's header ("Week of 19 Oct") gets 14 px more space above it and a 2 px line (**Proposal** for the agenda part; he spoke about the boundary, the ribbon is the explicit one).
113. **The divider pipes stay visible when a day is selected (owner-stated).** Before: the soft selection marker covered the pipe on either side of the selected day, so on Sunday or Monday the week pipe vanished. Now the marker is drawn 3 px inside the day's cell and the pipes sit outside it, so they show on both sides of the marker. **Proposal / open:** he said "pipes between days", plural. Drawn: a faint 1 px pipe between **every** pair of days plus the strong week pipe. If he meant only the week boundary, delete one rule (`.dy+.dy::before`). See the open questions.
114. **Past dates stay grey, and past meal tiles are grey too (owner-stated).** The ribbon keeps its dimmed past days. The meal tiles on past days (agenda and docked) are drawn in greyscale; in the agenda they are also dimmed to 62 per cent, in the docked day only greyscale (**Proposal**: the docked past tile is the one thing being read, so it keeps full strength). Past stays read only; swipe right still copies forward (99, 100). The blocked past day and "Nothing was planned" were already quiet.
115. **With a detail open, a tap on another ribbon day swaps the contents; the slot stays (owner-stated; revises 108 for ribbon taps only).** Owner: "keep the detail view in place; it's just that a different day's plan replaces it." With the stack open, the ribbon stays docked and visible at the top, fully scrollable (dots, today highlight, dashes, week pipes) and live: every tap on it keeps the stack open and fixed in place, and only what is inside changes (the day heading, the day piece's tile, the detail below it). The contents change with a short fade (no movement of the slot). A day with two meals shows the first with the second as "Also". If the tapped day is the day already open, the open meal stays. **Closing is unchanged and still returns to the week (108):** the x, Esc, the handle dragged down, a swipe down on the detail, and starting to drag the tile out. Only the **ribbon tap** no longer closes. The "Today" button and the week label update with the swap.
116. **What the slot shows for a day with no meal (Proposal; applies to the stack variant only).** An **open night** shows the same quiet "Open night" with Ask AI and Surprise me in the day piece, and a line in the detail piece ("Nothing planned yet. Ask AI or Surprise me above, or tap Open night if you are not cooking."); Surprise me fills the night and the slot turns straight into that meal's detail. A **Not cooking** day shows its block (tap to cook) and "Not cooking, this week only" or "Usual day off"; a **past empty** day "Nothing was planned on this day."; another member's plan "view only". The other detail variants (peek, strip, hide, sheet) are comparison options and keep closing on a ribbon tap; wrong guess costs: low.
117. **The tactile lift applies to every tile, before any detail is open (owner-stated).** Owner: the lift shown when picking a tile up in detail should also be on the tiles in the plain agenda. Drawn (**Proposal** for the values): on press the tile rises 2 px and grows 2.5 per cent with a soft drop shadow (`scale`, `translate` and `filter` are used instead of `transform` and `box-shadow`, so the swipe's own movement and the edge-strip status variant are untouched), and it stays lifted while it is being swiped; it is the same weight as the tile in hand (`.hand`), a little lighter. It shows on the agenda tiles and on the docked day tile. The row clips its swipe reveal, so while only pressed (not swiped) the clip is lifted to let the shadow out. Reduced motion: the state still shows, with no animation.
118. **The tear: a torn-paper edge where a tile leaves the stack (owner-stated; the opacity fade stays).** Owner: "two bits of paper, a rugged edge, like it's being torn off." In addition to the existing fade, the tile in hand and the piece left behind (the dashed place-holder at its home day in the week) both get a ragged edge on the side they came apart. **Proposal (how):** one `clip-path: polygon()` per edge, generated once in `phone.js` from a fixed row of tooth depths (up to 7 px), no images, no SVG, no deferred file. The tile in hand carries a paler fibre fringe along its torn edge (a second clipped layer behind it) and keeps its shadow through `filter: drop-shadow` on a wrapper; the left-behind piece shows the same teeth and a paler fibre band. The teeth grow over the first 36 px of the drag (a CSS variable, `--tz`, 0 to 1). The torn edge is the one facing where the tile came from (drag down: the tile's top edge and the place-holder's bottom edge; up, left and right likewise; the edge only switches when the direction is clearly different). `prefers-reduced-motion`: full teeth at once, no growth. It is shown mid-drag in the demo (`?demo=1`, frames 4 and 5) and in `img/p-tear-*`. Wrong guess costs: low (it is cosmetic; the drag, drop and fade logic are untouched).
119. **Explicitly kept, unchanged (owner-stated):** left and right swipe on cards; inline undo (the button flips in place, no toast); the docked in-frame detail opening under the ribbon (not an overlay); the opacity fade as a tile is dragged out; the tilt of the dragged tile; the existing "Surprise me" drop and suggestion visual.

## Supersession notes (13 Oct)

- **108** is revised for ribbon taps only (115). Closing and dragging out are as before.
- **Phone layout of 12 Oct** (a loose agenda card per day with a bold day heading above it, 85 to 94) is replaced by UAT's day row for the **agenda** (110); the ribbon, the stack, the swipe and the undo are unchanged. The day heading with a "Today" pill and the carry labels move: Today into the gutter (111), "Drop here", "Lifted from here" and "Not cooking" labels stay as a small line at the top of the day's stack.
- Earlier screenshots in `img/` that are not listed above still show the 12 Oct shell; the pages are the source of truth.

## Open questions (new, 13 Oct)

- **Pipes (113):** between every pair of days (drawn) or only the week boundary? Cost of a wrong guess: one CSS rule.
- **Card face (110):** UAT's cards carry a photo thumbnail and an avatar; the mockup's carry an emoji tile and the status chips (104, still open). Is the mockup card meant to become UAT's `.pw-mc` with the status language added? Cost: the build copies the lift, grey and tear rules either way; the markup differs.
- **Today in the gutter (111):** a pill under the date (drawn), or the accent colour only?
- **Swap in the other detail variants (115, 116):** only the stack swaps (drawn); the comparison variants still close on a ribbon tap.
- **After "Not cooking" or "Replan" from the docked detail (115):** the stack still closes to the week, where the day shows its undo (as in 108). Alternative: stay docked and show that day's new state. Not drawn.
- **Tear on a sideways drag (118):** drawn as the left or right edge; confirm it feels right, or tear only top and bottom.
- **Tear on the swipe (118):** not drawn (the swipe has its own tinted reveal); say if the swipe should tear too.
- **Past tile strength (114):** 62 per cent in the agenda, full strength greyscale in the docked day: confirm.

## What loads (DESIGN.md section 6), 13 Oct

Default path unchanged: `theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js` (about 130 KB uncompressed together, up about 11 KB from 12 Oct: 6 KB of script, 4.5 KB of CSS; the 12 Oct note's "about 75 KB" undercounted). The tear polygons are built on the first drag only (not on page load); there are no images, fonts or SVG; `demo.js` still loads only with `?demo=`. Nothing is deferred that was not before; the lift and the grey are CSS only.

## Verification done (13 Oct)

Headless Chromium, dark theme, phone 390 x 844 and 360 x 740, and a desktop-width window (the centred 430 px column). Scripted: no page errors and no sideways scroll; tap a ribbon day with a meal, an open night, a Not cooking day, a past day with a meal and a past empty day while the stack is open (the slot stays, the contents swap, the title follows); Surprise me from the docked open night opens the new meal's detail; Esc and the x close to the week; a mouse drag from the docked tile after a swap brings the week back under the finger, the tear edge is set (down, up, right) and a drop replaces a meal; press shows the lift; a past tile is grey; pipes are visible beside a selected Sunday and Monday.


# Fourth revision, 13 October 2026: batch 2 of the live phone test (decisions 120 to 135)

Owner, by voice on 13 October 2026, same phone test as batch 1 ("get it out" for all batches). **Owner-stated, 13 Oct 2026** marks his words; **Proposal** marks the design agent filling a gap. Cite as "Plan UI review 121": `item-edit-flyout.md` reuses 120 to 128, `home-detail-panel.md` 133 and `plan-desktop.md` 110 to 120, so a bare number is ambiguous. Phone only; the desktop page got only the Total time line (124).

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (`?sel=wed-curry`, `?sel=tue-pasta` no missing, `?sel=l-wed&day=wed` past, `?dock=d19` open night, `?sel=wed-curry&long=1`, `?gr=hand`, `?hdl=light`, `?jig=1|0|reset`, `?ut=4`, `?ba=bar|list|both`), [index](../../../fragments/plan-ui-review/index.html#b2). Screenshots in `fragments/plan-ui-review/img/` (`p-stack-*`, `p-green-*`, `p-open-day-390`, `p-menu-390`, `p-stack-nomiss-390`, `p-stack-past-390`, `p-handle-light-390`, `p-ba-*` (134), `p-seq-*`, `p-swap-*`, `p-st-*`).

## Decisions

120. **The instructional line is gone (owner-stated).** "Drag the tile to move it to another day" is removed from the detail. His reason: "for the first week, this is part of training the user. For a few days, you can kind of make it jiggle so that people know." Replaced by 129.
121. **Status is one plain signal: green or red (owner-stated; supersedes the four options of 104 on the phone).** "green means it's been dealt with"; "when I add something to shopping, I know that number in the shopping means it's something that has to be bought, so I don't need the additional count." Removed: "Missing N" and "On list N" counts, the labelled chips, the "Missing: names" line, the heavy red use-by pill, and the "Missing 1/2" pills at the top of the detail. Drawn (Proposal for the look): a 24 px circle on the tile, tinted green with a tick or tinted red with a mark (shape as well as colour), no words; the same rule drives the dots under each date in the ribbon and a small dot under the date in the agenda gutter (Proposal: "gutter" was read as both places; delete `.gs` if only the ribbon was meant), and the red names in the list. Options a to d stay in the Options panel and the index as **rejected**; the desktop page still draws them (not asked for).
122. **What green means (Proposal, open).** Owner: "green means it's been dealt with". Drawn: green when every missing item is already on the shopping list (or nothing is missing); red when any missing item is not on the list yet. The loop is then: red tile, open, Add, green. The other reading is green only when everything is on hand (`?gr=hand`; then a tile stays red after Add until it is bought). Cost of a wrong guess: one function (`isRed`).
123. **One combined ingredient list (owner-stated, voice).** "rather than the split of on hand and missing, I just want to see the missing ingredient in red at the top." No ON HAND or MISSING headings or boxes. Missing items first as plain red text, the only visual distinction (no pill, no badge), then on hand. A missing item that is on the list is no longer red under 122 and shows a small cart tick; a missing item not yet on the list has a cart button to add just that one. A hairline sits between the groups. Dropped with the headings (Proposal; one line each to restore): "Ask AI about substitutes" and "Everything for this meal is on hand". Use-by in the list is plain text ("use by Tue 13", accent for today or soon, muted later), not a pill and not red, so red stays "missing" only.
124. **One Total time on every meal's detail (owner-stated).** "it's just total time"; "track the time". One figure (for example "45 min", "1 h 30 min"), no prep and cook split. It was only in the free-text note of one meal ("Quick night: 25 min"); now a `mins` field on every sample meal, shown at the top of the detail for past days, saved, made-up and Surprise me meals alike, and copied with a copied meal. The desktop inspector shows it too. An open night has no meal, so no time until Surprise me fills it.
125. **Open night is quiet text; Ask AI and Surprise me appear inside that day (owner-stated).** "when I click an empty day, I don't mind then seeing Ask AI and Surprise me show up." On the week an open night is only "Open night". Tapping it opens that day's own detail (the docked stack): Ask AI, Surprise me and a Not cooking action; Surprise me turns the slot into that meal's detail; Not cooking stays docked and shows its Undo under the day tile (Proposal). **Reconciles with 92 and 94 (owner-stated 12 Oct):** tapping Open night used to mark Not cooking, and the buttons sat on every open night. Now tapping opens the day and Not cooking is one explicit button. The ribbon still brings an open day into focus without opening it (89). The week-level "Ask AI to plan this" curtain is unchanged. The other detail variants have no per-day detail, so they keep the old row with buttons.
126. **The bottom of the detail is Hold and Add (owner-stated).** "why do I need not cooking and replan in the detail?" Replaced by Hold with a number and a cart Add with a number. Proposal: the number is how many items the button will touch (on-hand items to hold, missing items not yet on the list), not a second status count, so it does not break the rule that the shopping list is the only count (132). No missing items to add means no Add; held shows "Held" in sage; on a past day only Copy forward (100 to 102); another member's plan has no footer. These are also the group bulk actions asked for in the batch text ("Add all" for missing, "Hold all" for on hand): the footer is where he put them, so there are no group headings to carry them. Replan and Not cooking stay in the ... menu and in dragging the tile out.
127. **The ... menu (owner-stated).** Open detail becomes **Open recipe**, a real action: it opens that meal's recipe page in Recipes (`recipe/detail.html?id=...&from=plan` for the sample meals that have a page: Shakshuka, Mushroom pasta, Egg fried rice); a made-up meal or a sample with no page shows a marked stub line (open question). Kept: Move to another day, Replan, Not cooking (past: Copy forward). Removed: Hold and Add missing (now 126). "I don't want your stuff in the bracket like swipe left, swipe right. People know how to do it." Every bracketed gesture hint and key badge is removed from the phone menu and labels ("Replan (swipe left)", "Close detail (Esc)", "or drag" and so on). Desktop menus are unchanged (they keep key badges, which suit a keyboard).
128. **The grey bar on the tab (owner-stated: "that lip is a distraction").** Two drawn: **removed (recommended)** and **much lighter** (`?hdl=light`). The tab under the day card stays the drag target and still closes on Enter; the x, Esc and a swipe down on the detail also close, so closing stays discoverable.
129. **First-run wiggle (owner-stated intent; the rule is a Proposal).** His wording ("first week", "for a few days") was loose. Recommended rule: wiggle once, about 1.3 s after the detail opens, on the first 3 opens within 7 days of the first one, and never again after the first successful drag to another day. Stored in the browser (`localStorage`, if blocked it shows 3 times per page load). Only for a tile that can be dragged (not past, not view only). Reduced motion: no movement, a still lift for the same moment. `?jig=1` forces it, `?jig=0` turns it off, `?jig=reset` clears the count. Wrong guess costs: three numbers.
130. **Undo expires (owner-stated: "not indefinitely, maybe"; the time is a judgement call).** Every in-place undo (the day note, the header flip for Copy and Clear, the banner and pill variants, the drop and move undo, and the new undo under the docked day) expires and the button returns to its normal state. 14 s was already the value for Clear and Copy and is now one constant for all; recommended range 10 to 15 s; `?ut=4` shortens it for review. This answers the earlier "mobile undo pattern" question: an auto-expiring in-place flip, no snackbar. No countdown is drawn (option: a thin shrinking line).
131. **Kept, unchanged (owner-stated):** the "Surprise me" drop and suggestion visual.
132. **Owner notes recorded (no extra work):** the ribbon stays durable and docked while a detail is open (115); the gutter shows red or green under each date (121); the shopping list is the single source of truth for counts (so no count is repeated on tiles, 121 and 126).
133. **Other proposals in this batch:** a Not cooking undo and notes show under the docked day tile; Open recipe on a made-up meal says so instead of failing.

## Batch 2 follow-up, 13 October 2026: where the bulk actions live (decisions 134 and 135)

Cite as "Plan UI review 134" (`home-detail-panel.md` also numbers from 133 on; the file name tells them apart).

134. **Proposal: three placements of the bulk actions, switch `?ba=bar|list|both`, default `bar` (the PR #142 build).** The owner said "I'm just wondering if there's a way to do an add all or hold all" (13 Oct, voice) and later asked for the sheet bottom to be "Hold" with a number and a cart "Add" with a number. The coordinating brief asks for group-level "Add all" and "Hold all" in the list as well. The two readings conflict (see 126 and the conflict note below), so all three are drawn and the owner picks. (a) `bar`: the bottom bar only (Hold N, cart Add N), as built. (b) `list`: no bottom bar; a quiet "Add all" text action ends the missing group (right-aligned, with a small cart, no pill, no heading, no box; the missing group's closing line sits under it), and a quiet "Hold all" ends the on-hand group (bookmark mark; reads "Held" in green when held). (c) `both`. The owner was silent on which of the three.
135. **Proposal: how the in-list actions behave.** Same handlers as the bar (`data-addall`, `data-hold`), so the same note, the same Undo flip and the same single expiry constant (14 s, `?ut=`) apply. "Add all" is hidden when nothing is missing or everything missing is already on the list; "Hold all" is hidden when nothing is on hand. They count the same items as the bar's numbers (the visible text has no number: it sits in the accessible name, for example "Add all 2 missing ingredients"). Past days and view-only plans show neither (Copy forward only on a past day, as before). Missing first in plain red, no headings or boxes, the cart tick for listed items: unchanged. Placement choice: both actions sit at the end of their group (not the first row), so Add all and Hold all are never adjacent and the per-row cart buttons stay in the right-hand column. Class names the build will use: `.ing.one.bulk`, `li.ga.ga-add`, `li.ga.ga-hold`, `button.gbtn` (`.on` when held).

## Conflicts between the batch text and the owner's voice, and how they were resolved

- Batch item 9 asks for group-level "Add all" and "Hold all"; his later words remove the groups and put "Hold" and "Add" with a number in the bottom bar. First resolved as: the bottom bar is the bulk action (126). The coordinating brief then asked for the group actions as well, so both are drawn behind `?ba=bar|list|both` (134, 135) and the owner chooses.
- Batch item 8 says the status "supersedes 104", while the week summary strip still says "N to buy". Kept and flagged (open question below).
- "Gutter under each date" was in the ribbon in the batch text and in the agenda column in the owner note; both drawn.

## Supersession notes (13 Oct, batch 2)

- 104 (status options a to d) is superseded on the phone by 121. 72 (words on chips) already reopened by 104; now closed on the phone.
- 92 (tap Open night marks Not cooking) and the always-visible buttons of 94 are revised by 125. 70 and 116 (open night in the docked slot keeps both buttons) are revised: the day now carries the buttons and Not cooking.
- 81 and 107 (Replan and Not cooking pinned at the bottom) are replaced by 126.
- 9, 11, 67 (Hold and Add all in section headings) are replaced on the phone by 123 and 126; desktop keeps them.
- 101 (undo notes clear after 14 s) is confirmed and extended by 130.

## Open questions (everything still open, one list)

New from batch 2:
- **Where the bulk actions live (134, 135):** bottom bar only (current), in-list "Add all" and "Hold all" only, or both? Cost of a wrong guess: low, a redraw (the handlers are shared; it is one switch in `ingList` and `footActions`). Also: should the in-list Hold all sit at the end or the start of the on-hand group (end drawn)?
- **What green means (122):** dealt with (on the list, drawn) or all on hand? Cost: one function.
- **Open night tap (125):** tapping now opens the day with Ask AI, Surprise me and Not cooking, instead of marking Not cooking. Confirm; cost of a wrong guess: the row's handler and one button. Also: after Not cooking from that day the stack stays docked (drawn); close instead?
- **Counts on the bottom buttons (126):** are Hold 5 and Add 2 the right numbers (items touched) or should they read "Hold all" and "Add all"? They are not a second status count.
- **Open recipe (127):** where a meal has no saved recipe (made up, Surprise me), hide the action, show a stub (drawn), or offer to save it? In the mockup only three sample meals have a recipe page.
- **Week summary "to buy" (121, 132):** the strip still shows "N to buy" and "N use first" per week; the owner said the shopping list is the source of counts. Remove or keep?
- **Use-by (123):** shown as plain text in the list only; is that enough, or also on the tile?
- **Wiggle rule (129)** and **undo time (130)**: confirm 3 opens, 7 days, stop after a drag; confirm 14 s.
- **Handle (128):** removed (recommended) or lighter.
- **Desktop:** the same status, list, footer and open-night changes are not drawn on desktop.

Carried forward from earlier revisions (not lost):
- Which of desktop layouts A to D; fill the window (63) or left-anchored (56); Esc closing the flyout (66); leftover link as real data (77).
- 3 weeks or 4 weeks forward in the ribbon (86).
- Where a copied-forward or dropped meal lands: start of the day or of the week (102).
- Person filter dropdown or people-count dropdown: both mocked, no pick (97, 98).
- Curtain trigger for the week-level Ask AI: idle or start of the view (96).
- Whether Clear week also clears Not cooking marks (109); undo depth (109, 101).
- Batch 1: pipes between every pair of days or only the week boundary (113); UAT thumbnail and avatar or the mockup's emoji tile (110); Today pill or colour only (111); whether the other detail variants swap on a ribbon tap (115); after Not cooking or Replan from a docked meal, stay docked or close (115); tear on a sideways drag, and a tear on the swipe (118); past tile strength (114).

## What loads (DESIGN.md section 6), batch 2

Default path is the same five files: `theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js`. Size now: about 80 KB script plus 40 KB CSS plus 20 KB data and status, about 140 KB uncompressed (batch 1's note said about 130 KB; batch 2 adds about 8 KB of script and 3 KB of CSS and removes some markup). `demo.js` still loads only with `?demo=`. The wiggle is CSS plus a few `localStorage` reads on opening a detail; nothing is fetched. The recipe page loads only if Open recipe is used.

## Verification done (batch 2)

Headless Chromium, 390 x 844 and 360 x 740, a 1280 window (phone page and the desktop page), dark theme. No page errors and no sideways scroll on the phone page at both widths across ten variants, on index.html and on desktop.html. Scripted: open night on the week (label only) and its day (Ask AI, Surprise me, Not cooking; Not cooking stays docked with Undo; Surprise me gives a meal with its time); Total time on every sample meal including past; the menu items and Open recipe (navigates for Shakshuka, stub for the made-up curry); long list (`?long=1`) scrolls with the footer pinned; a day with nothing missing (Hold only); a past day (Copy forward only); Add turns the tile green, removes the red names and the Add button, and `?gr=hand` keeps it red; Hold toggles; undo expiry for all four patterns and for a dragged drop (`?ut=3`); the wiggle on 3 opens then not, `?jig=1`, `?jig=0`, `?jig=reset`, none on a past tile, a still cue under reduced motion, the done flag after a drag; ribbon swaps to five kinds of day. Not verified: a real phone (touch feel of the wiggle), and the Pages URL from the sandbox.

## What loads and verification (134, 135)

Load: unchanged, the same five files; the in-list actions are a few lines in `ingList` and 10 lines of CSS, nothing deferred or fetched. Verified in headless Chromium at 390 x 844 and 360 x 740 for `ba=bar|list|both` on the Wednesday curry, `?long=1`, Tuesday pasta (nothing missing: Hold all only, no Add all), and a past day (Copy forward only): no page errors, no sideways scroll. Scripted: Add all flips to Undo and the buttons that no longer apply disappear, Undo restores, Hold all toggles to Held, the Undo expires on its own (`?ut=3`). Not verified: a real phone; the Pages URL from the sandbox.

# Fifth revision, 13 October 2026 (later): the day ribbon only while a detail is open (decisions 136 to 141)

Owner, 13 October 2026, 01:43 Sydney, after testing the live phone mockup on his own phone. He sent a screenshot of the week view with a red line scribbled across the horizontal date ribbon (T 8, F 9, S 10 ... under the header) and typed: **"Horizontal date slide only during the detail view."** **Owner-stated, 13 Oct 2026** marks that rule; **Proposal** marks how the design agent solved it. Cite as "Plan UI review 136": other job notes reuse these numbers.

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (week view: no ribbon; `?sel=wed-curry`, `?dock=d19` open night, `?dock=d17` Not cooking, `?sel=wed-curry&long=1`, `?demo=1`; `?rb=always` the old ribbon, superseded), [index](../../../fragments/plan-ui-review/index.html#rib136). Screenshots in `fragments/plan-ui-review/img/` (`p-grid-*`, `p-seq-*`, `p-ribbon-*`, `p-st-*`, `p-clear-*`, `p-curtain-390`, `p-filter-390`, `p-picker-390`, `p-carry-390`, `p-readonly-390`, `p-lift-390` regenerated; `p-undo-*`, `p-clear-both-390`, `p-sheet-390` still show the old week-view ribbon and are faded and outlined on the index).

## Decisions

136. **The horizontal date ribbon shows only while a meal detail is open (owner-stated, 13 Oct 2026).** In the plain week and agenda view there is no ribbon. Kept there: the UAT-style vertical day rows with the left gutter, the week summary strip, the week headers inside the agenda, the Today pill in the gutter, the red and green dots in the gutter, past days greyed.
137. **The ribbon comes and goes with the detail (Proposal; the docked behaviour itself is owner-stated, 115 and 116).** While a detail is open (the stack, and the peek, strip and hide dock variants) the ribbon is docked at the top under the compact header, durable, scrollable with its dots, today highlight, dashes and week pipes, and a tap on another day swaps the contents of the stack without moving the slot. It fades in over 0.2 s when a detail opens; a copy of it fades out over 0.18 s when the detail closes by x, Esc, the handle, a swipe down, or dragging the tile out, and the agenda returns scrolled to that day. The stack's slot is placed for the final header height from the first frame, so the stack does not jump; the ribbon only changes opacity and moves 8 px. Reduced motion: no fade, no copy.
138. **The gliding selection marker only exists with the ribbon, so now only while a detail is open (stated).** The owner said he loves it (89, "fantastic"); it is still drawn, on the open day in the detail ribbon, and it glides as the day swaps (115). In the week view the day in focus is shown only by the header label.
139. **Moving across last, this and next week without a ribbon (Proposal).** The agenda is one continuous scroll over the three weeks, each with its header ("WEEK OF 19 OCT, Next week", then the summary strip); the Sunday to Monday separation of 112 stays as the week header's gap and heavier line, now the only week-boundary signal in the week view. The header's "Week of" label and its This, Next or Last week word follow the day nearest the top as you scroll (87, unchanged code). **Today** (88) jumps to today and shows whenever the day nearest the top is not today. The page opens with today at the top. The gutter keeps the red or green dot under each date (121). The agenda is read only for last week (99).
140. **The header is one slim row in the week view (Proposal; the owner earlier said top space is too expensive, 90).** Title with the relative week under it, Today, the Mine dropdown, the week actions "..." and settings: **53 px, was 120 px** at 390 and at 360 (measured), a gain of 67 px for the agenda. It no longer collapses on scroll in the week view (there is no ribbon to collapse); the sticky-header option (91) now acts only while a detail is open (compact, 104 px with the ribbon, or full size). **Mockup option `?rb=detail|always`** (default `detail`, recommended): `always` draws the old always-on ribbon in the week view for comparison, marked "superseded by owner 13 Oct"; it is a few lines (`ribOn()` in `phone.js`) and is kept because it is cheap. The two-stop sheet (a comparison variant, an overlay on the week) has no ribbon; the one-day-at-a-time layout (`?lay=focus`, comparison) keeps it because it is that layout's day picker. Every other parameter still works (`sel`, `dock`, `day`, `who`, `demo`, `frame`, `long`, `ba`, `ut`, `jig`, `st`, `gr`, `cw`, ...). The `?demo=1` frames are updated: frame 1 and 7 have no ribbon, frames 2 and 3 have it.
141. **Revises earlier decisions that assume an always-visible ribbon (supersedes).** 85 (continuous ribbon replaces week jumps): the continuous day-by-day scroll is now the agenda itself; the ribbon exists for detail only. 86 (bounded: three weeks): three weeks in the agenda and in the detail ribbon, still ambiguous (open). 87 and 88 (Week of label, Today): unchanged, now driven by the agenda scroll. 89 (marker): moved to the detail ribbon (138). 90 (top space): met further, by 140. 91 (sticky collapse): detail only. 112 (week gap): the ribbon's 22 px spacer and pipe exist in the detail ribbon only; the agenda header gap stays and is now the only one in the week view. 113 (pipes stay visible beside the marker) and 114 (past days grey in the ribbon): apply to the detail ribbon only; past tiles stay grey in the agenda. 96 and 101 (curtain, banner and pill "under the ribbon"): under the header now in the week view. 103 and 107 (detail docks under the ribbon): unchanged, the ribbon arrives with it.

## Open questions (new, 13 Oct later)

- **Finding today without the ribbon (88):** is the Today button enough, or should the gutter's Today pill also scroll into view on load? Drawn: the page opens with today at the top, and Today shows when the day nearest the top is not today. Cost of a wrong guess: low, one scroll rule.
- **Jumping to a week through the "Week of" label (a date picker):** with the ribbon gone, the only way across weeks is scrolling the three-week agenda, and nothing reaches beyond it. Cost: low to medium, one control and a sheet; wrong guess either way is a redraw of the header.
- **How many weeks in the detail ribbon:** all three (drawn) or the current week plus its neighbours? Cost: low, a filter on the 21 days; wrong guess means a swap to a day in another week needs closing first (too few) or a long strip to scroll (too many). This sits beside the older three-or-four-weeks question (86).
- **Desktop:** does it follow the same rule? Not changed here: the desktop week board and its 21-day ribbon are a different surface (105), and the board has no other way to move across weeks. Cost: medium, a navigation redesign for the board.
- **Sheet variant and one-day layout:** no ribbon for the comparison sheet (an overlay), ribbon kept for `?lay=focus`. Confirm or drop those comparison options. Cost: trivial.

Carried forward, untouched (the one list from batch 2 and earlier, copied):

New from batch 2:
- **Where the bulk actions live (134, 135):** bottom bar only (current), in-list "Add all" and "Hold all" only, or both? Cost of a wrong guess: low, a redraw (the handlers are shared; it is one switch in `ingList` and `footActions`). Also: should the in-list Hold all sit at the end or the start of the on-hand group (end drawn)?
- **What green means (122):** dealt with (on the list, drawn) or all on hand? Cost: one function.
- **Open night tap (125):** tapping now opens the day with Ask AI, Surprise me and Not cooking, instead of marking Not cooking. Confirm; cost of a wrong guess: the row's handler and one button. Also: after Not cooking from that day the stack stays docked (drawn); close instead?
- **Counts on the bottom buttons (126):** are Hold 5 and Add 2 the right numbers (items touched) or should they read "Hold all" and "Add all"? They are not a second status count.
- **Open recipe (127):** where a meal has no saved recipe (made up, Surprise me), hide the action, show a stub (drawn), or offer to save it? In the mockup only three sample meals have a recipe page.
- **Week summary "to buy" (121, 132):** the strip still shows "N to buy" and "N use first" per week; the owner said the shopping list is the source of counts. Remove or keep?
- **Use-by (123):** shown as plain text in the list only; is that enough, or also on the tile?
- **Wiggle rule (129)** and **undo time (130)**: confirm 3 opens, 7 days, stop after a drag; confirm 14 s.
- **Handle (128):** removed (recommended) or lighter.
- **Desktop:** the same status, list, footer and open-night changes are not drawn on desktop.

Carried forward from earlier revisions (not lost):
- Which of desktop layouts A to D; fill the window (63) or left-anchored (56); Esc closing the flyout (66); leftover link as real data (77).
- 3 weeks or 4 weeks forward in the ribbon (86).
- Where a copied-forward or dropped meal lands: start of the day or of the week (102).
- Person filter dropdown or people-count dropdown: both mocked, no pick (97, 98).
- Curtain trigger for the week-level Ask AI: idle or start of the view (96).
- Whether Clear week also clears Not cooking marks (109); undo depth (109, 101).
- Batch 1: pipes between every pair of days or only the week boundary (113); UAT thumbnail and avatar or the mockup's emoji tile (110); Today pill or colour only (111); whether the other detail variants swap on a ribbon tap (115); after Not cooking or Replan from a docked meal, stay docked or close (115); tear on a sideways drag, and a tear on the swipe (118); past tile strength (114).

## What loads (DESIGN.md section 6), 13 Oct later

Default path is the same five files (`theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js`); about 1 KB more script, 0.5 KB more CSS, and the week view now builds 21 fewer buttons because the ribbon is only rendered with a detail. The ribbon's fade is CSS, its fade-out copy is one cloned node removed after 230 ms; nothing is fetched. `demo.js` still loads only with `?demo=`.

## Verification done (13 Oct later)

Headless Chromium, 390 x 844, 360 x 740 and a 1280 window (the centred column), dark theme (some regenerated screenshots in the light theme to match their originals). No page errors and no sideways scroll on any variant tried. Week view: no ribbon, header 53 px; scrolling to next week changes the label to "Week of 19 Oct, Next week" and shows Today; Today returns. Detail: opening `?sel=wed-curry` or tapping a tile brings the ribbon in, the stack top does not move; ribbon taps swap to a two-meal day, an open night, a Not cooking day and a past day (the slot stays); x, Esc and the handle (Enter) close, the ribbon fades out (one copy, removed) and the agenda is back on that day; reduced motion: no fade and no copy. `?dock=d19`, `?dock=d17`, `?sel=wed-curry&long=1`, `?sel=wed-curry&dt=sheet` (no ribbon), `?dt=peek`, `?lay=focus`, `?rb=always` (old behaviour, with and without a detail), `?demo=1&frame=1..7`. Not verified: a real phone (touch feel and the fade), and the Pages URL from the sandbox.


# Sixth revision, 13 October 2026 (01:44 Sydney): the tear only for the detail, lift and shift from the plain week (decisions 142 to 146)

Owner, typed on his phone while testing, with a screenshot of the docked stack for Wed 14 Oct "Japanese golden curry" (ribbon, day card, tongue, sheet): **"Torn page behaviour is [on]ly for this. Now lifting and shifting the menu itself. Prior visual was Better. Also want that to be available even in Agenda view."** The word before "ly" was cut off in his message; read as "only". The note is terse, so every reading below is flagged and listed as an open question. **Owner-stated, 13 Oct 2026** marks his words; **Proposal** marks the design agent's choices. Cite as "Plan UI review 142".

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (`?tear=detail|all`, default `detail`; `?demo=agenda` the seven-frame sequence, `?demo=agenda&frame=N`; `?demo=1` frame 4 is still the detail tear), [index](../../../fragments/plan-ui-review/index.html#lift142). Screenshots in `fragments/plan-ui-review/img/` (`p-ag-*`, `p-tear-detail-390`, `p-tear-all-390`, `p-gap-before-390`, `p-gap-after-390`).

## Decisions

142. **The tear is only for the tile pulled out of the docked detail (owner-stated, reading open).** "Torn page behaviour is [on]ly for this", "this" being the screenshot: the docked stack. The ragged edge (118) is drawn for that drag-out and nowhere else. Mockup option `?tear=detail|all` (default `detail`; `all` is the 118 behaviour on every drag, for comparison). Narrows 118; the opacity fade and the tilt stay on the detail drag-out too (119, which he repeated earlier).
143. **Lifting and shifting a tile uses the prior visual (owner-stated "prior visual was better", reading open).** Read as: picking a meal tile up and moving it to another day, in every context except the detail drag-out (the tile in hand from a past day or from the week, whether it is dragged or carried). The look is the one before 118: a plain card in hand, the soft shadow (`0 16px 36px`), the -1.5 degree tilt, and the place-holder where it came from faded to 0.4 with a dashed outline. No ragged edge, no fibre fringe, no left-behind teeth. **Proposal (restoration details):** the press lift of 117 stays on press; a held tile goes further (scale 1.05, rotate -1.5 degrees, rise 4 px, deeper shadow, `.mc.hold`) so the hold reads as the pick-up; the tilt is one constant (`HAND_TILT`). The copy-forward bar ("In hand. Tap a day to drop it here", 100) was never torn and is unchanged.
144. **Lift and shift works directly in the plain agenda, no detail first (owner-stated: "available even in Agenda view"; the gesture is a Proposal).** Before, the agenda only raised a pressed tile (117) and swipe was left and right for quick actions. Now: **press and hold** a tile `HOLD_MS` = 350 ms without moving more than `HOLD_SLOP` = 8 px and it lifts (a short buzz where the device has one); then a move of `DRAG_START` = 6 px picks it up and the same carry as the detail drag-out runs (108b: the tile in hand, the week compact under the finger, every day a drop target including hidden Not cooking days, a drop on a meal replaces it with "Replaced <meal> with <meal>", the day pulses, Undo on the day with the 14 s expiry, Esc or a cancelled touch moves nothing and says so). **Swipe and drag do not fight:** moving more than 8 px before the hold ends the hold, so a quick sideways swipe goes to the existing swipe code untouched (it commits at 10 px and horizontal dominance) and a vertical move scrolls; once the hold fires, the page is held still (`touchmove` is cancelled on the held tile) so the finger moves the tile, not the page. **Mouse:** a vertical press-and-drag lifts at once (a mouse has no scroll to protect), a sideways one is the swipe, press-and-hold works as on touch. Tiles in an other person's plan, tiles with their swipe actions open, buttons and the docked tile do not start a hold (the docked tile keeps its 8 px drag, 108b). The long-press menu and text selection are off on tiles. The viewport does not jump: the week is scrolled so the place-holder stays where the tile was.
145. **Past days and past tiles (owner-stated rules 100 to 102, applied here).** Past days are read-only drop targets: a tile over one shows a red outline and a drop there is refused with "Past days are read only, nothing can be dropped on <day>. Not moved". A past tile can be lifted only to copy forward: the hand says "copy from <day>", the original stays (no fade), and the drop is the copy-forward drop (102: replaces a meal with "Replaced", or makes a Not cooking day a cooking day).
146. **Carrying across the weeks (Proposal).** There is no ribbon in the week view (136), so the agenda scroll is the way across weeks: within `AUTO_TOP` = 56 px under the header or `AUTO_BOT` = 64 px above the nav the week scrolls, faster the deeper into the zone (up to `AUTO_MAX` = 18 px a frame, about 1000 px a second), over the three weeks and no further (last week's Monday to next week's Sunday). All days show while carrying, including hidden Not cooking days. Desktop week board: not changed.

## Fix: the gap under the day card (found in the screenshot)

The screenshot shows about 90 px between the tongue and the detail. It is a defect, not the tear and not the viewport: the detail follows a pull-down (a swipe down at the top of its scroll) through an offset, and iOS Safari ends such a gesture with `touchcancel` (edge gesture, rubber band, the bottom bar), which was not handled, so the offset and the fade stayed. Reproduced in Chromium (a cancelled pull leaves 83 px) and fixed: `touchcancel`, a new touch, `pagehide`, `blur` and returning to the page all reset it, and the detail has `overscroll-behavior-y: contain`. The static layout has no gap at 390 x 844, 390 x 760, 360 x 640 and with the long list (it is fixed between the header and the nav and uses no viewport-height units, so the 100vh quirk does not apply). Not verified on a real iPhone.

## Supersession notes (13 Oct, 01:44)

- **118** is narrowed by 142: the tear (hand fringe, left-behind teeth, growth over 36 px) exists for the detail drag-out only; the code is unchanged and `?tear=all` restores it everywhere.
- **117** stands (press lifts); 143 adds the hold step. **119** (tilt and fade kept) stands for every carry.
- **108b** (drag the docked tile out) is the same carry as 144, with `src: detail`.
- **100** (copy forward by swipe right, picker, in-hand bar) is unchanged; 145 adds the direct lift.

## Open questions (new, 13 Oct 01:44)

- **Tear scope (142):** detail-only (drawn) or any drag-out, for example the tile in hand after "Move to another day"? Cost of a wrong guess: one flag; `?tear=all` already draws the other.
- **Hold or handle (144):** hold-to-lift (drawn) or a drag handle on each tile in the week? Cost: medium (a handle changes every tile's face; hold costs discoverability, which the 129 wiggle could teach).
- **Desktop week board:** does it follow? Not changed here. Cost: medium.
- **Thresholds (144, 146):** hold 350 ms and 8 px, drag 6 px, edge zones 56 and 64 px, 18 px a frame. Cost: low, constants.
- **The reading of the note as a whole (142, 143):** especially "this", "the menu itself" and what "prior visual" covers. Cost: low to medium, mostly CSS.

Carried forward, untouched (the one list from 136 to 141, batch 2 and earlier, copied):

From 136 to 141: Today button or the gutter Today pill scrolling into view on load (88); a date picker from the "Week of" label; how many weeks in the detail ribbon (all three drawn); desktop following the no-ribbon rule (not changed); sheet variant without a ribbon and `?lay=focus` with one.

New from batch 2:
- **Where the bulk actions live (134, 135):** bottom bar only (current), in-list "Add all" and "Hold all" only, or both? Cost of a wrong guess: low, a redraw (the handlers are shared; it is one switch in `ingList` and `footActions`). Also: should the in-list Hold all sit at the end or the start of the on-hand group (end drawn)?
- **What green means (122):** dealt with (on the list, drawn) or all on hand? Cost: one function.
- **Open night tap (125):** tapping now opens the day with Ask AI, Surprise me and Not cooking, instead of marking Not cooking. Confirm; cost of a wrong guess: the row's handler and one button. Also: after Not cooking from that day the stack stays docked (drawn); close instead?
- **Counts on the bottom buttons (126):** are Hold 5 and Add 2 the right numbers (items touched) or should they read "Hold all" and "Add all"? They are not a second status count.
- **Open recipe (127):** where a meal has no saved recipe (made up, Surprise me), hide the action, show a stub (drawn), or offer to save it? In the mockup only three sample meals have a recipe page.
- **Week summary "to buy" (121, 132):** the strip still shows "N to buy" and "N use first" per week; the owner said the shopping list is the source of counts. Remove or keep?
- **Use-by (123):** shown as plain text in the list only; is that enough, or also on the tile?
- **Wiggle rule (129)** and **undo time (130)**: confirm 3 opens, 7 days, stop after a drag; confirm 14 s.
- **Handle (128):** removed (recommended) or lighter.
- **Desktop:** the same status, list, footer and open-night changes are not drawn on desktop.

Carried forward from earlier revisions (not lost):
- Which of desktop layouts A to D; fill the window (63) or left-anchored (56); Esc closing the flyout (66); leftover link as real data (77).
- 3 weeks or 4 weeks forward in the ribbon (86).
- Where a copied-forward or dropped meal lands: start of the day or of the week (102).
- Person filter dropdown or people-count dropdown: both mocked, no pick (97, 98).
- Curtain trigger for the week-level Ask AI: idle or start of the view (96).
- Whether Clear week also clears Not cooking marks (109); undo depth (109, 101).
- Batch 1: pipes between every pair of days or only the week boundary (113); UAT thumbnail and avatar or the mockup's emoji tile (110); Today pill or colour only (111); whether the other detail variants swap on a ribbon tap (115); after Not cooking or Replan from a docked meal, stay docked or close (115); tear on a sideways drag, and a tear on the swipe (118, now moot for the agenda: nothing there is torn unless `?tear=all`); past tile strength (114).

## What loads (DESIGN.md section 6), 13 Oct 01:44

Default path is the same five files (`theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js`): measured 153.9 KB uncompressed, 44 KB gzipped, **up 7.3 KB** on #144 (about 6.8 KB script, 0.5 KB CSS). The earlier notes ("about 130 KB", "about 140 KB") undercounted: 146.6 KB was the real figure before this change. The hold-to-lift listeners are small and always on (the plain week has to be liftable without a detail); the tear polygons are still built on the first torn drag and not at all otherwise; no images, fonts or SVG. `demo.js` (8.4 KB) loads only with `?demo=`. Nothing is fetched.

## Verification done (13 Oct 01:44)

Headless Chromium with touch (CDP touch events) and mouse, 390 x 844, 360 x 740 and a 1280 x 900 window, dark theme, and a reduced-motion run. Scripted: hold lifts at 450 ms and not at 150 ms; hold then drag carries a plain hand; drop on a day with a meal ("Replaced", day highlighted, Undo restores); drop on a hidden Not cooking day (it shows while carrying, becomes a cooking day, the undo expires by itself with `?ut=4`); drop on a past day (red outline, refused with a note); Esc cancels; a quick sideways swipe reveals the swipe actions and never lifts; a vertical drag scrolls and never lifts; a past tile lifts to copy and the original stays, undo; mouse vertical drag lifts at once, mouse horizontal is the swipe, mouse hold then drag lifts; `?tear=all` tears the agenda drag; the detail drag-out is torn with the fringe; edge scroll runs to the end of the three weeks and back; `?long=1`; no page errors; no sideways scroll; the gap reproduced before and gone after. Not verified: a real phone (iOS Safari touch feel, the long-press callout, the buzz) and the Pages URL from the sandbox.


# Seventh revision, 13 October 2026 (01:53 and 01:55 Sydney): the open day, the right swipe, a duller accent, the vanishing options (decisions 147 to 153)

Owner, typed on his phone, with a screenshot of the live (UAT, terracotta) Plan page: Mon 12 and Tue 13 as filled "Not cooking" blocks, Wed with Salmon patties, and a red outline round Thu 15 and Fri 16 (the open days, drawn as faint dashed empty boxes with the day label in the left gutter) continuing round Sat's meal cards. Note 1 (01:53): **"The open day with this visual is great... Right swipe to making not cooking. Slightly dull accent"**. Note 2 (01:55): **"Clicking on the not clicking temp brings up surprise me and ask ai options which then disappears"**. The notes are terse, so every reading below is flagged and listed as an open question; the cost of a wrong guess is low (mostly CSS and one gesture). **Owner-stated, 13 Oct 2026** marks his words; **Proposal** marks the design agent filling a gap. Cite as "Plan UI review 147" (`home-detail-panel.md` and `item-edit-flyout.md` also use numbers from 147 on, so a bare number is ambiguous).

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (`?od=dash|text`, default `dash`; `?ac=dull|normal`, default `dull`; `?demo=open` four frames, `?demo=open&frame=N`), [index](../../../fragments/plan-ui-review/index.html#open147). Screenshots in `fragments/plan-ui-review/img/` (`p-od-*`, `p-ac-*`). Scripted check: `tools/plan-ui-open-day-check.mjs`.

## Decisions

147. **An open day is UAT's dashed box (owner-stated: "The open day with this visual is great").** Read as the look he outlined, Thu 15 and Fri 16 on the live page: a faint dashed rounded empty box in the stack beside the day label in the gutter, no words. It replaces the plain "Open night" text row of 92 and 125 on the plain week. Copied from Kitchie UAT (`server/src/web-plan.ts`, `.pw-slot`: min-height 56 px, `1px dashed var(--border)`, radius `--r-ctl`, muted; `assets/plan.js` draws it as an empty `.pw-slot` button per open day); Kitchie was only read. `?od=text` keeps the quiet words for comparison. Reading open (see questions): it could also mean only the dashed outline with the words kept inside.
148. **Right swipe on an open day sets Not cooking (owner-stated: "Right swipe to making not cooking").** The same tinted reveal with the words "Not cooking" as a meal tile (98, 119: the swipe language is unchanged). On a meal tile a right swipe is already Not cooking (past tile: Copy forward) and a left swipe is Replan, so there is no conflict; on an open day left does nothing (no reveal). Commit past 88 px, as on a tile; `?sw=buttons` leaves the reveal open as a button. In place: the day says "Sun 18 Oct is Not cooking (this week only)" with Undo, which expires by itself (130), and the Not cooking tile then hides once you move on (92, 96). Not on a past day (past days show "Nothing was planned", never a slot) and not in another person's plan (the box is drawn, view only). **Key and mouse equivalents (Proposal, from 98 and 99):** Shift X on a focused open day, or in an open day's detail, sets Not cooking, as it does on a meal; Enter or Space opens the day; a mouse drags the box like a finger. Hold-to-lift (144) is for meal tiles only, so it cannot fight the swipe on an open day; a quick sideways swipe never opens the day.
149. **Details of the open day (Proposal).** No visible words and no buttons on the box (125: no repeated Ask AI and Surprise me on every open day); a screen-reader label "Open night, Sun 18 Oct. Tap to plan it. Swipe right or press Shift X for Not cooking". Tapping it opens that day's detail with Ask AI, Surprise me and Not cooking (125 stays). Pressing or focusing it tints the border with the accent token (150). The other detail variants (`?dt=peek|strip|hide|sheet`) have no per-day detail and keep the old row with buttons.
150. **"Slightly dull accent" (owner-stated words; the reading is a Proposal and ambiguous).** He may mean the green/gold accent of the mockup, UAT's terracotta, or the Not cooking tint. Drawn narrowly: one token, `--nc` (= `--accent-dull`, the accent mixed 68 per cent with the muted grey), used by the Not cooking tile edge, the Not cooking swipe reveal (and Copy forward on a past tile, which shares it), the peeking Not cooking strip, the open-day press and focus, the selected-day marker in the ribbon, the docked day and detail frames and tab (`.dpiece`, `.spiece`, `.tongue`), and `.mc.sel`. `?ac=normal` puts every one back on `--accent`. The global theme tokens (`theme.css`, `themes/`) are unchanged and nothing outside this fragment reads `--nc`. Contrast of the reveal text on the duller fill checked in both themes (light 6.4:1, dark 9.1:1, about the same as the normal accent).
151. **Bug: the options vanish after tapping the Not cooking tile (owner-stated: "Clicking on the not clicking temp brings up surprise me and ask ai options which then disappears"). Read as the Not cooking (this week only) tile.** Cause, reproduced in headless Chromium at 390 on the build before this change: (a) in the docked day the tile and the three options (Ask AI, Surprise me, Not cooking) sit in the same spot, Not cooking being the third button, so a second touch landing there (a double tap, a bounce) marked the night Not cooking again 50 ms later and the options went with it; (b) in the plain week the tile reopened the night but drew only a quiet "Open night", so the options existed in the detail and not in the week. A timed vanish (the 14 s undo expiry, `?ut`, a scroll, a resize) was tried and does **not** happen: with the day docked nothing on a timer or a scroll closes it. If the owner saw a vanish with no second tap, the cause is not found (see questions).
152. **Intended behaviour and fix (owner-stated bug; the values are Proposals).** A day's detail, once open, stays until the person closes it (x, Esc, the tab, a pull down, 108a), taps another day or acts. A tap on the Not cooking tile, in the week or in the detail, reopens the night and docks that day's detail with Ask AI, Surprise me and Not cooking, and Undo restores the Not cooking state. The opposite toggle on the same day is ignored for `TOGGLE_GUARD` = 450 ms, so a double tap cannot flip it back. Hidden Not cooking days still hide only once you move on (92, 96), never while their detail is open.
153. **"Mark as open" (Proposal).** The detail of a Not cooking day has an explicit "Mark as open" button under the tile (the tile's tap does the same), plus the existing Undo, so turning Not cooking back into an open day does not depend on guessing that the tile is tappable. Before, only the tile did it.

## Supersession notes (13 Oct, 01:55)

- **92 and 125** (open night as quiet words on the week) are superseded in look by 147; the tap, the detail and the buttons-in-the-detail of 125 stand. `?od=text` draws the old words.
- **93, 96** (peek, hide once you move on) stand; 148 and 152 use them.
- **98, 119** (swipe language) stand; 148 adds the right swipe on an open day in the same language.
- **130** (undo expiry) stands for the new Undo.
- Screenshots in `img/` from before this change that show open nights as words are regenerated, or drawn faded and captioned "drawn before 147" in the index (`p-undo-*`, `p-ag-press|hold|carry|dropped`, `p-tear-all|detail`).

## Open questions (new, 13 Oct 01:55)

- **The reading of "The open day with this visual is great" (147):** the dashed box with no words (drawn), or the dashed box with the words "Open night" inside? Cost of a wrong guess: low, CSS (`?od=text` already draws the words, a label inside the box is one line).
- **Right swipe (148):** read as Not cooking on an open day, in the same direction as on a meal tile. If he meant a different direction or a different action (for example Surprise me), cost: one gesture. Should a left swipe on an open day do something (Ask AI)? Nothing drawn.
- **"Slightly dull accent" (150):** which accent is meant (the mockup's green/gold, UAT's terracotta, or the Not cooking tint)? Drawn: the elements listed in 150 only, one token. Cost: low, one token or the `?ac` switch; if he meant the global accent it is a theme change, a different and larger decision.
- **The vanishing options (151, 152):** is the reading right (the Not cooking tile, then the options), and did they disappear after a second tap or by themselves? If by themselves, the cause is not found and the exact steps are needed. Should a tap on the tile open the day (drawn) or only reopen the night? Cost: one handler.
- **Guard time (152):** 450 ms. Cost: one constant.

Carried forward, untouched (copied from the 01:44 section, which copied the earlier ones):

- **Tear scope (142):** detail-only (drawn) or any drag-out, for example the tile in hand after "Move to another day"? Cost of a wrong guess: one flag; `?tear=all` already draws the other.
- **Hold or handle (144):** hold-to-lift (drawn) or a drag handle on each tile in the week? Cost: medium (a handle changes every tile's face; hold costs discoverability, which the 129 wiggle could teach).
- **Desktop week board:** does it follow? Not changed here. Cost: medium.
- **Thresholds (144, 146):** hold 350 ms and 8 px, drag 6 px, edge zones 56 and 64 px, 18 px a frame. Cost: low, constants.
- **The reading of the note as a whole (142, 143):** especially "this", "the menu itself" and what "prior visual" covers. Cost: low to medium, mostly CSS.

Carried forward, untouched (the one list from 136 to 141, batch 2 and earlier, copied):

From 136 to 141: Today button or the gutter Today pill scrolling into view on load (88); a date picker from the "Week of" label; how many weeks in the detail ribbon (all three drawn); desktop following the no-ribbon rule (not changed); sheet variant without a ribbon and `?lay=focus` with one.

New from batch 2:
- **Where the bulk actions live (134, 135):** bottom bar only (current), in-list "Add all" and "Hold all" only, or both? Cost of a wrong guess: low, a redraw (the handlers are shared; it is one switch in `ingList` and `footActions`). Also: should the in-list Hold all sit at the end or the start of the on-hand group (end drawn)?
- **What green means (122):** dealt with (on the list, drawn) or all on hand? Cost: one function.
- **Open night tap (125):** tapping now opens the day with Ask AI, Surprise me and Not cooking, instead of marking Not cooking. Confirm; cost of a wrong guess: the row's handler and one button. Also: after Not cooking from that day the stack stays docked (drawn); close instead?
- **Counts on the bottom buttons (126):** are Hold 5 and Add 2 the right numbers (items touched) or should they read "Hold all" and "Add all"? They are not a second status count.
- **Open recipe (127):** where a meal has no saved recipe (made up, Surprise me), hide the action, show a stub (drawn), or offer to save it? In the mockup only three sample meals have a recipe page.
- **Week summary "to buy" (121, 132):** the strip still shows "N to buy" and "N use first" per week; the owner said the shopping list is the source of counts. Remove or keep?
- **Use-by (123):** shown as plain text in the list only; is that enough, or also on the tile?
- **Wiggle rule (129)** and **undo time (130)**: confirm 3 opens, 7 days, stop after a drag; confirm 14 s.
- **Handle (128):** removed (recommended) or lighter.
- **Desktop:** the same status, list, footer and open-night changes are not drawn on desktop.

Carried forward from earlier revisions (not lost):
- Which of desktop layouts A to D; fill the window (63) or left-anchored (56); Esc closing the flyout (66); leftover link as real data (77).
- 3 weeks or 4 weeks forward in the ribbon (86).
- Where a copied-forward or dropped meal lands: start of the day or of the week (102).
- Person filter dropdown or people-count dropdown: both mocked, no pick (97, 98).
- Curtain trigger for the week-level Ask AI: idle or start of the view (96).
- Whether Clear week also clears Not cooking marks (109); undo depth (109, 101).
- Batch 1: pipes between every pair of days or only the week boundary (113); UAT thumbnail and avatar or the mockup's emoji tile (110); Today pill or colour only (111); whether the other detail variants swap on a ribbon tap (115); after Not cooking or Replan from a docked meal, stay docked or close (115); tear on a sideways drag, and a tear on the swipe (118, now moot for the agenda: nothing there is torn unless `?tear=all`); past tile strength (114).

## What loads (DESIGN.md section 6), 13 Oct 01:55

Default path is the same five files (`theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js`): measured **160.0 KB uncompressed, 47.0 KB gzipped, up 6.1 KB (1.8 KB gzipped)** on #145's 153.9 KB (about 4.6 KB script, 1.5 KB CSS; the dashed box, the swipe branch, the guard and the accent token are always on because the plain week must show and swipe an open day). `demo.js` grew from 8.4 KB to 10.2 KB and still loads only with `?demo=`. No images, fonts or SVG added; nothing is fetched. Deferred: the `?demo=open` frames, the Mockup options panel, the tools check.

## Verification done (13 Oct 01:55)

Headless Chromium, touch (CDP touch events) at 390 x 844 and 360 x 740, mouse at 1280 x 900, a reduced-motion run and `?long=1`. `tools/plan-ui-open-day-check.mjs` (68 checks, all passing): the open day is dashed, wordless and buttonless, with an aria label; no slot on past days; a right swipe sets Not cooking with Undo; Undo restores; a left swipe and a short swipe do nothing; a swipe does not open the day; the Undo expires by itself and the tile hides once you move on; hold-to-lift still lifts a meal tile and does nothing on an open day; a right swipe on a meal tile is still Not cooking; tap an open day shows the three options; Not cooking from the detail; Mark as open present; tile tap reopens the night with the options; a double tap does not flip it back; the options are still there after 18 s, a resize, a scroll and the undo expiry; the plain-week tile docks the day with the options and they stay 15 s; Shift X; view-only plan is a box with no swipe; `?ac=dull` and `?ac=normal` differ; mouse drag, Shift X on focus and click at 1280; no page errors; no sideways scroll. The first run of the double-tap case was run against the build before the change to confirm the cause (options 1 then 0, blocked true). Not verified on a real iPhone.

# Eighth revision, 13 October 2026 (live phone test, spoken): the light Not cooking panel, the 3 second Undo, the grey, the ECG marker, the tear on every drag (decisions 154 to 158)

Owner (Arjan), spoken on his phone on 13 October 2026, verbatim fragments (voice, so the intent is read carefully; **Owner-stated, 13 Oct 2026** marks his words, **Proposal** marks the design agent's choices where he was silent). Cite as "Plan UI review 154" to "Plan UI review 158" (`home-detail-panel.md` and `item-edit-flyout.md` also use numbers from 147 on, so a bare number is ambiguous).

- "it's actually opening that detailed view that blocks the, you know, if I open an existing recipe." (Tapping a Not cooking day opens the full recipe-style detail; he expects only the Ask AI and Surprise me options.)
- Undo after the swipe right to Not cooking: "keep that undo the same behavior ... on top of the tile is fine. But limit that to just three seconds. Let's keep three seconds as an undo target." (He first said it should be inline within that box, not a different host.)
- Colour: "Not cooking could just be the same color as ... last week, which is that shade." And: "the graying out previous week is great ... nothing to change."
- Peek: "we'll keep that peek. No, it's working as it is. All I need is, if something is collapsed, an open/close of the Not cooking tile by clicking something on the bar." Then the first bit of the horizontal divider line should carry "a squiggle ... like flatlining someone's heart ... starts beating, ECG kind of idea, and then goes flat." Tapping it opens what is hidden in that gap: "if it's one day between Friday and Sunday it just opens up Saturday, but if multiple days between Thursday and Sunday it should open up all of them."
- Tear: "I want the same tear behavior ... when I'm in the agenda mode, I want it there too, rather than limited to the detail view ... only for the top edge and the bottom edge, not the side edge ... wherever we're doing it."
- Also: "dashed box look is fine", "right swipe not cooking ... that's cool" (both stay as in #148).

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (`?demo=nc` seven frames, `?demo=nc&frame=N`; `?gap=ecg|off` default `ecg`; `?tear=all|detail` default `all`, was `detail`; `?ac=` removed), [index](../../../fragments/plan-ui-review/index.html#nc154). Screenshots in `fragments/plan-ui-review/img/` (`p-nc-*`, `p-ecg-beat-390`, `p-tear-*`, regenerated `p-ag-*`, `p-seq-*`, `p-od-*`, `p-grid-*`). Scripted checks: `tools/plan-ui-not-cooking-check.mjs` (137 checks), `tools/plan-ui-open-day-check.mjs` (70, updated), screenshots `tools/plan-ui-shots.mjs`.

## Decisions

154. **Tapping a Not cooking day opens a light panel, never the full detail (owner-stated; the look is a Proposal).** "It's actually opening that detailed view that blocks." **Cause found:** a tap on the Not cooking tile ran `unblock`, which reopened the night and docked `stackEmptyHtml`, the full two-piece stack (day piece with the tile, handle, sheet body, the same chrome as an existing recipe) over the week; #148 (151 to 153) had made that the intended behaviour. Now the tile opens `liteHtml`: one small card docked under the ribbon (107): the day heading, a quiet line ("Not cooking, this week only" or "Usual day off"), **Ask AI**, **Surprise me**, **Mark as open**. No tile, no people stepper, no ingredient list, no total time, no sheet, no tongue, no footer. The week stays under it. The day stays Not cooking until Mark as open (the panel closes, the day is an open night again, Undo in place) or Surprise me (the night becomes a cooking day and opens that meal's detail). A ribbon tap on another day swaps what the panel or the stack shows, as in 115. x, Esc and the ribbon close or swap it; nothing on a timer or a scroll closes it (152 stands). **Corrects 151 to 153**: the 450 ms toggle guard stays (it still protects the open-day detail's Not cooking button); "Mark as open" (153) is now in the panel. **Proposal:** a grey frame (156), a soft shadow, the panel pinned and not stretched to the nav, it fits in a row at 390 and wraps at 360. Variants other than the stack (`?dt=peek|strip|hide|sheet`) have no per-day detail and keep the tap-to-reopen of the old row; `?lay=focus` draws the panel in flow above the day.
155. **The Undo after the right swipe on an open day lasts 3 seconds (owner-stated: "limit that to just three seconds").** The Undo renders exactly as before, in place on the day (130, 148: "on top of the tile is fine"). A separate named constant `UNDO_NC_MS` = 3000 ms is used for this swipe; every other undo keeps the 14 s of 130 (`UW`). The entry carries its own duration, so the pruning, the note and the expiry render all use it. `?ut=N` still shortens both for review. **Proposal:** it also covers Shift X on a focused open day (the keyboard equivalent of the swipe, 148) and the `?sw=buttons` commit; it does not cover the Not cooking button inside an open day's detail, nor the right swipe on a meal tile (which removes a meal, so a 3 s window would lose it quickly); both keep 14 s.
156. **Not cooking is the muted grey of last week (owner-stated; one shared tone).** "The same color as last week, which is that shade", the muted tone of past days (113, 114: past dates and names `--muted`, past tiles greyscale at 62 per cent). The Not cooking tile's edge, the Not cooking swipe reveal, the peeking Not cooking strip and the light panel's frame now use `--muted`. **Removed (supersedes 150):** #148's `--nc` and `--accent-dull` tokens and the `?ac=dull|normal` switch (and the Options panel group); the ribbon's selected-day marker, `.mc.sel`, the docked day and detail frames and tab, and the open-day press and focus are back on the normal accent, which is how they were before #148. No new colour. The Copy forward reveal on a past tile shares the reveal element and keeps the accent it had before #148 (`.und .l.cf`). The past-week treatment is untouched. Contrast of the reveal text on the grey: 6.2:1 light, 8.3:1 dark.
157. **An ECG marker on the divider line opens and closes the collapsed Not cooking days (owner-stated; the look, timing and closing form are Proposals).** Additive to 96: the peek at the scroll edge is unchanged. Wherever one or more Not cooking days are collapsed (hidden, 93), a small marker sits at the START of the divider line above the next shown day: no label. Tap or Enter or Space opens EVERY hidden day in that gap at once ("if multiple days ... it should open up all of them"); a gap of one opens just that day. **Proposal (look):** a 44 x 16 px glyph, a 2 px flat stub in `--muted` at the start of the line; when its gap first appears one heartbeat (P wave, QRS, T wave) draws in over about 0.8 s, holds, and fades by 2.2 s, leaving the flat stub ("starts beating, and then goes flat"). It is played once per gap and not again on a re-draw. **Proposal (hit area and access):** a real button, 56 x 44 px with only 10 px above the line (so it does not overlap the row above), focus ring, `aria-expanded`, and a label that names what it opens ("Show 2 hidden Not cooking days: Mon 19 Oct, Tue 20 Oct"); the gap's own days are not interactive while hidden. **Proposal (closing, "open/close"):** days opened this way stay open (a scroll does not re-hide them, unlike the edge peek) and carry the same marker above the first of them, drawn as one settled beat; tapping it closes them again. Marker rebuilt from the DOM after a re-draw, a scroll hide or a peek tap; never drawn while a tile is carried. Reduced motion: flat at once, no animation, still tappable. `?gap=off` draws no marker (the peek only), for comparison.
158. **The tear is on every lift-and-drag, on the top and bottom edges only (owner-stated; reverses 142).** "The same tear behavior ... in the agenda mode ... only for the top edge and the bottom edge, not the side edge ... wherever we're doing it." Every drag of a tile now tears: the detail drag-out, a held tile in the plain agenda, and a past tile lifted to copy forward (the hand only; the original stays). Dragging down tears the hand's top edge (and the left-behind place-holder's bottom edge), dragging up the bottom edge (the place-holder's top edge); a sideways move never tears a side and keeps the edge it had; the side-edge polygons are removed. The opacity fade on the place-holder (0.4, dashed), the tilt (-1.5 degrees), the press and hold lifts and the soft shadow are unchanged (99, 117, 119): the tear is a clip-path on the tile and a fibre band behind it, so it does not fight them (checked: fade 0.4 and the tilt are present while torn). `?tear=all|detail`, default **`all`** (was `detail`); `detail` is the 142 scoping, for comparison. **Proposal:** one edge at a time (the one the tile leaves by); both top and bottom torn together is the other reading.

## Supersession notes (13 Oct, live test)

- **151 to 153** are corrected by 154: tapping the Not cooking tile no longer reopens the night and docks the full detail; it opens the light panel and the day stays Not cooking. The toggle guard (450 ms) and Mark as open (153, now in the panel) stand.
- **150** (the duller accent, `--nc`, `?ac=`) is superseded and removed by 156.
- **96** (peek) stands unchanged; 157 is additive to it.
- **130** (undo 14 s) stands for every undo except the open-day swipe's, which is 3 s (155).
- **142** (tear only for the detail drag-out) is reversed by 158; **143** (the plain lifted card in the agenda) is replaced by the torn one there; **118** is narrowed to top and bottom edges. 117, 119, 144 to 146 stand.
- **147 to 149** (dashed box, right swipe) stand as in #148 ("dashed box look is fine", "right swipe not cooking ... that's cool").
- **113, 114** (past grey) are untouched and now also the Not cooking tone.
- Screenshots: those not regenerated were drawn before 154 to 158 (no ECG marker; docked frames in the duller accent). The index says so; `p-ac-*` is faded.

## Open questions (new, 13 Oct, live test)

- **Panel after Mark as open (154):** the panel closes (drawn), or it switches to the open night's own Ask AI, Surprise me and Not cooking? And Surprise me on a Not cooking day opens the new meal's detail (drawn). Cost of a wrong guess: one handler.
- **Where 3 seconds applies (155):** the open-day swipe and its Shift X (drawn) or also the Not cooking button, or a swipe on a meal tile (which removes a meal)? Cost: one argument per call; a wrong "yes" on the meal tile loses a meal after 3 s.
- **How far the grey goes (156):** the tile edge, the reveal and the peek (drawn), or the whole Not cooking tile faded like a past day? Is the accent back on the selection and docked frames what he wants (it is the pre-#148 state)? Cost: CSS.
- **The marker (157):** the look (a flat stub with one beat), once per gap, the closing form (the same marker as one settled beat above the opened days), and whether opened days stay open until closed (drawn) or re-collapse on scroll like the peek. Cost: CSS and one rule; the closing form could be a different control (for example a tap on the opened tile).
- **Tear edges (158):** one edge at a time (drawn) or top and bottom together; does the past tile's copy drag tear too (drawn: yes)? Cost: one polygon pair.

Carried forward, untouched (the 147 to 153 questions and everything beneath them, copied from the 01:55 section):

- **The reading of "The open day with this visual is great" (147):** the dashed box with no words (drawn), or the dashed box with the words "Open night" inside? Cost of a wrong guess: low, CSS (`?od=text` already draws the words, a label inside the box is one line).
- **Right swipe (148):** read as Not cooking on an open day, in the same direction as on a meal tile. If he meant a different direction or a different action (for example Surprise me), cost: one gesture. Should a left swipe on an open day do something (Ask AI)? Nothing drawn.
- **"Slightly dull accent" (150):** which accent is meant (the mockup's green/gold, UAT's terracotta, or the Not cooking tint)? Drawn: the elements listed in 150 only, one token. Cost: low, one token or the `?ac` switch; if he meant the global accent it is a theme change, a different and larger decision.
- **The vanishing options (151, 152):** is the reading right (the Not cooking tile, then the options), and did they disappear after a second tap or by themselves? If by themselves, the cause is not found and the exact steps are needed. Should a tap on the tile open the day (drawn) or only reopen the night? Cost: one handler.
- **Guard time (152):** 450 ms. Cost: one constant.

Carried forward, untouched (copied from the 01:44 section, which copied the earlier ones):

- **Tear scope (142):** detail-only (drawn) or any drag-out, for example the tile in hand after "Move to another day"? Cost of a wrong guess: one flag; `?tear=all` already draws the other.
- **Hold or handle (144):** hold-to-lift (drawn) or a drag handle on each tile in the week? Cost: medium (a handle changes every tile's face; hold costs discoverability, which the 129 wiggle could teach).
- **Desktop week board:** does it follow? Not changed here. Cost: medium.
- **Thresholds (144, 146):** hold 350 ms and 8 px, drag 6 px, edge zones 56 and 64 px, 18 px a frame. Cost: low, constants.
- **The reading of the note as a whole (142, 143):** especially "this", "the menu itself" and what "prior visual" covers. Cost: low to medium, mostly CSS.

Carried forward, untouched (the one list from 136 to 141, batch 2 and earlier, copied):

From 136 to 141: Today button or the gutter Today pill scrolling into view on load (88); a date picker from the "Week of" label; how many weeks in the detail ribbon (all three drawn); desktop following the no-ribbon rule (not changed); sheet variant without a ribbon and `?lay=focus` with one.

New from batch 2:
- **Where the bulk actions live (134, 135):** bottom bar only (current), in-list "Add all" and "Hold all" only, or both? Cost of a wrong guess: low, a redraw (the handlers are shared; it is one switch in `ingList` and `footActions`). Also: should the in-list Hold all sit at the end or the start of the on-hand group (end drawn)?
- **What green means (122):** dealt with (on the list, drawn) or all on hand? Cost: one function.
- **Open night tap (125):** tapping now opens the day with Ask AI, Surprise me and Not cooking, instead of marking Not cooking. Confirm; cost of a wrong guess: the row's handler and one button. Also: after Not cooking from that day the stack stays docked (drawn); close instead?
- **Counts on the bottom buttons (126):** are Hold 5 and Add 2 the right numbers (items touched) or should they read "Hold all" and "Add all"? They are not a second status count.
- **Open recipe (127):** where a meal has no saved recipe (made up, Surprise me), hide the action, show a stub (drawn), or offer to save it? In the mockup only three sample meals have a recipe page.
- **Week summary "to buy" (121, 132):** the strip still shows "N to buy" and "N use first" per week; the owner said the shopping list is the source of counts. Remove or keep?
- **Use-by (123):** shown as plain text in the list only; is that enough, or also on the tile?
- **Wiggle rule (129)** and **undo time (130)**: confirm 3 opens, 7 days, stop after a drag; confirm 14 s.
- **Handle (128):** removed (recommended) or lighter.
- **Desktop:** the same status, list, footer and open-night changes are not drawn on desktop.

Carried forward from earlier revisions (not lost):
- Which of desktop layouts A to D; fill the window (63) or left-anchored (56); Esc closing the flyout (66); leftover link as real data (77).
- 3 weeks or 4 weeks forward in the ribbon (86).
- Where a copied-forward or dropped meal lands: start of the day or of the week (102).
- Person filter dropdown or people-count dropdown: both mocked, no pick (97, 98).
- Curtain trigger for the week-level Ask AI: idle or start of the view (96).
- Whether Clear week also clears Not cooking marks (109); undo depth (109, 101).
- Batch 1: pipes between every pair of days or only the week boundary (113); UAT thumbnail and avatar or the mockup's emoji tile (110); Today pill or colour only (111); whether the other detail variants swap on a ribbon tap (115); after Not cooking or Replan from a docked meal, stay docked or close (115); tear on a sideways drag, and a tear on the swipe (118, now moot for the agenda: nothing there is torn unless `?tear=all`); past tile strength (114).

## What loads (DESIGN.md section 6), 13 Oct live test

Default path is the same five files (`theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js`): measured **169.9 KB uncompressed, 50.0 KB gzipped, up 9.7 KB (3.0 KB gzipped)** on main (c7d98f3: 160.2 KB, 47.0 KB gzipped): about 7.2 KB script and 2.5 KB CSS. The light panel, the ECG marker (an inline SVG path built per gap, no asset) and the top and bottom tear (it replaced the four-edge code, which shrank) are always on because the plain week must show them; the tear polygons are still built on the first drag. `demo.js` is 13.2 KB (was 10.2 KB) and loads only with `?demo=`. No images, fonts or files added to the default path, nothing fetched. Deferred: the demo frames (`?demo=nc`), the Mockup options panel, the tools checks, the `img/` screenshots (lazy in the index).

## Verification done (13 Oct live test)

Headless Chromium, touch (CDP touch events) at 390 x 844 and 360 x 740, mouse at 1280 x 900, a reduced-motion run per width. `tools/plan-ui-not-cooking-check.mjs` (137 checks, all passing): the light panel shows Ask AI, Surprise me and Mark as open only, is under 200 px tall, has none of the recipe chrome (stepper, ingredients, total time, day piece, sheet, tongue, footer), keeps the day Not cooking and the week under it, swaps with a ribbon tap and closes with Esc; the open-day swipe sets Not cooking with the inline Undo, the entry carries 3000 ms, it is there at 2.4 s and gone at 3.7 s, the button in the day's detail keeps the longer undo; the Not cooking edge and the reveal equal `--muted`, no `--nc`, no `data-ac`, past tiles still greyscale at 0.62; a gap of one hidden day has one marker and a tap opens only that day, a gap of two has one marker and a tap opens both, they stay open after a scroll, the open marker closes both, Enter opens and Space closes from the keyboard, `?gap=off` draws none, the beat plays once and settles flat (the beat path is visible early and at 0 opacity later) and a re-draw does not replay it, the hit area is at least 44 px tall, the peek at the edge still shows; reduced motion: no beat class, beat path at 0 opacity, still tappable; the tear: a held tile dragged down in the plain agenda tears the top edge and the place-holder's bottom edge (the fade 0.4 with the dashed border and the -1.5 degree tilt still present), a sideways move never tears a side, dragging up tears the bottom edge, `?tear=detail` keeps the old scoping, the detail drag-out still tears the top, a mouse drag at 1280 tears top and bottom only; no page errors, no sideways scroll at 390, 360 and 1280. `tools/plan-ui-open-day-check.mjs` (70 checks) was updated for the light panel and passes (it includes hold-to-lift lifting a meal tile and doing nothing on an open day, a quick swipe not lifting, meal-tile swipe unchanged, and the double-tap guard). All demo frames (`?demo=1`, `agenda`, `open`, `nc`) load with no page errors at both widths. Light theme checked for the panel, the grey and the marker. Not verified: a real iPhone (touch feel, the beat on a real display), and the Pages URL from the sandbox (see the PR).

# Ninth revision, 13 October 2026 (spoken, later): the week summary strip becomes two week-level bulk actions, Add to buy and Reserve (decisions 159 to 167)

Owner (Arjan), spoken on 13 October 2026, verbatim fragments (voice, relayed by the voice session, so the intent is read carefully; **Owner-stated, 13 Oct 2026** marks his words, **Proposal** marks the design agent's choices where he was silent). Cite as "Plan UI review 159" to "Plan UI review 167" (`item-edit-flyout.md` also has a 159, so a bare number is ambiguous).

- "where do I do a bulk action of hold everything that I have?" (Only the per-meal Hold all existed; there was no week-level action.)
- "it says four out of seven nights" (the week summary strip) ... "that week summary does not have those dials for the current week ... that's fine."
- "when I click on that 'use first' or whatever ... it's more like a filter ... but what I want, those two buttons ... there's no need for that, 'use first' or whatever, it's silly. ... I want that to be a bulk of anything that's missing."
- "Add to buy as a bulk, is what I need. And the other one is, reserve." He confirmed ("Yeah") the reading: the strip becomes two meaningful week-level bulk actions instead of passive counts. **Add to buy** adds everything missing across the whole week to the shopping list in one tap. **Reserve** holds everything currently on hand across the whole week in one tap. "Use first" is dropped as a concept.
- Last, a trailing sentence that may be cut off: "And the read-only labels there would be at the same level as this week, like week of whatever, this week, next week you have." (Read as: the remaining read-only text sits on the same row as the week label; see 165, a Proposal and an open question.)

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (`?demo=week` seven frames, `?demo=week&frame=N`; `?ws=actions|bare|counts`, default `actions`), [index](../../../fragments/plan-ui-review/index.html#wk159). Screenshots `img/p-wk-*`. Scripted check: `tools/plan-ui-week-actions-check.mjs` (117 checks). Desktop is not changed (see the supersession notes).

## Decisions

159. **The week summary strip's passive "to buy" and "use first" counts are replaced by two week-level bulk actions (owner-stated, 13 Oct 2026).** The tiles, their counts and the highlight filter they drove ("more like a filter ... there's no need for that") are gone from the default view; **use first is dropped as a concept** on the phone strip. It stays reachable only as `?ws=counts`, the old strip, superseded, for comparison. This resolves the open question "Week summary 'to buy' (121, 132)".
160. **Add to buy (owner-stated).** One tap puts every missing ingredient of the week that is not yet on the shopping list onto it. It uses the model the per-meal Add already has (each missing item gets its list flag, the meal's list count follows, the day dots turn green under 122 because the item is on the list), so the shopping-list effect is the same, just for the whole week. The note and the Undo name what happened ("Added 4 items for this week to the shopping list, across 3 meals").
161. **Reserve (owner-stated).** One tap holds every on-hand ingredient of the week: each meal with something on hand that is not already held becomes Held, the same state the per-meal Hold sets (126), so the meal's detail then shows Held and releases it as before. Meals already held are left alone.
162. **Past weeks and past days (owner-stated: past weeks need nothing changed; the drawing is a Proposal).** Last week has no actions drawn (it is grey and read only, 113, 114), and in this week the actions skip days before today (past tiles stay as they are, 114). Only the label row ("Week of 5 Oct, Last week, read only") shows for a past week.
163. **Counts inside the buttons, disabled state, empty week (Proposal).** "Add to buy 4" and "Reserve 14": the number is what the button will touch (missing items not yet listed; on-hand items of meals not yet held), the same meaning as 126's counts, small and muted so the label leads. Counts are not a second status count, and `?ws=bare` removes them. **(Disabled state superseded by 168: hidden, not disabled.)** When nothing applies the button is dimmed and disabled with no count and says why in its tooltip and its screen reader label ("Everything missing this week is already on the shopping list", "Everything on hand this week is already reserved", "Nothing on hand to reserve this week"). A week with no meals from today on (an empty next week) shows no strip at all rather than two dead buttons. Another person's plan (view only): disabled.
164. **Scope of the week (Proposal).** Each strip acts on the week it sits under, the week named in the row just above it. When the header and the strip disagree during a scroll (the header changes week when the new week's first day passes), the strip wins, because it is what the finger is on. Nothing is applied to a week that is out of view. Meals shown depend on the person filter (Mine, Everyone), the same as every other action; Everyone acts on the household's meals.
165. **The read-only text sits on the week label row (Proposal; the owner's last sentence may be cut off).** "5 of 7 nights" (was the "5/7 nights" tile, no dials) is quiet text at the right end of the row "WEEK OF 12 OCT  This week". It is not a button. The two actions sit on the line directly under it, full width, equal weight. If he meant the actions on the same line as the label, it is a flex change (open question).
166. **Undo (Proposal; 130, 155).** Each action flips in place, in the strip, into an Undo button that names what it reverses ("Undo add to buy", "Undo reserve"), the same pattern as Copy last week and Clear week (99, 109), on the same short stack. It lives **14 s** (130), not 3 s: the 3 s of 155 was the owner's number for one specific gesture (the Not cooking swipe on an open day), and a week-wide action reverses many meals, so it deserves the longer window that Copy last week and Clear week have. `?ut=N` shortens it for review. After expiry the button is simply disabled with its reason (163) **(superseded by 168 and 172: after expiry it is hidden, or, for Reserve, it becomes Release)**. Recommendation: keep 14 s; if he wants one number for everything bulk, change the argument in `weekBulk`.
167. **Screen reader and keyboard (Proposal).** The pair is a group named "Bulk actions for this week" (or "next week"); each is a real button, at least 44 px tall, with a focus ring. The label states the effect and the number ("Add to buy: put the 4 missing items for this week on the shopping list"); a disabled one says why. The Undo button's label names the action and repeats the note. There is no new keyboard shortcut. The strip does not collide with the Week actions menu in the header (Copy last week, Clear week), which is unchanged, nor with the day ribbon or the docked detail (the strip belongs to the plain week and agenda; the ribbon is there only with a detail open, 136).

## Supersession notes (13 Oct, bulk actions)

- **75** (week summary strip with nights, to buy and use first, tiles that toggle a highlight) is superseded on the phone by 159 to 161; **121** and **132** (the strip's "N to buy" count and its source of truth) are resolved by 159.
- **126** (Hold and Add at the bottom of one meal) and **134** (bulk actions in the list itself) stand for one meal; 160 and 161 are the same two actions at week scope.
- **130** (undo 14 s) stands and is the window for 166; **155** (3 s) stays for the open-day swipe only.
- **Desktop is not changed.** `desktop.js` still draws the four-tile week strip ("to buy", "use first", the highlight) and the inspector's idle view still has "Buy by day" with Add all, and "Use first"; the new strip is **not yet drawn on desktop**. Cost of a wrong guess about whether desktop follows: one redraw of `.sumstrip`.
- The per-meal Hold all and Add all (126, 134), the ECG markers (157), the Not cooking panel (154), the swipes (147 to 149, 155) and the tear (158) are unchanged.
- Screenshots: the plain-week pictures were regenerated, so the old strip is gone from them; those not regenerated were drawn before 159 and can still show it. The index says so.

## Open questions (new, 13 Oct, bulk actions)

- **Week summary "to buy" (121, 132): resolved by 159.** Removed.
- **Where the nights text and the buttons sit (165):** label row text plus buttons on the line under it (drawn), or the buttons on the label row itself? Cost of a wrong guess: low, flex and one row's width at 360 px.
- **What Reserve means (161):** it sets the same Held state as the per-meal Hold (drawn). If "reserve" is a stronger idea than hold (for example it blocks substitution or cooking from stock), or if he wants a different word on the per-meal button, that is a copy change and a model question. Cost: low for copy, medium for the model (Kitchie `plan_reserve`).
- **Add to buy when the same ingredient is missing in two meals (160):** drawn as each meal's own line, the count adds them (the list is not merged in the mockup). In the app it should merge into one list line with the larger quantity. Cost: the count in the button would read lower than the sum.
- **Undo window (166):** 14 s (drawn) or the 3 s of 155 for all bulk actions? Cost: one constant; a 3 s window on a week-wide change is short.
- **Counts inside the buttons (163):** keep, or plain words? `?ws=bare` shows the plain words. Cost: nothing.
- **A week with no meals from today on (163):** the strip is hidden (drawn); or two disabled buttons? Cost: one condition.
- **Scope when scrolling across a boundary (164):** the week the strip sits under (drawn) or the week the header shows? Cost: low; the header lags by a few rows.
- **Past days in this week (162):** skipped (drawn); should Add to buy also cover a missing item for a meal already past (no)? Cost: one filter.
- **Desktop:** does the strip follow? Not drawn.

Carried forward, untouched (every earlier open question, copied from the live-test section, with only the week summary item removed because 159 resolved it):

- **Panel after Mark as open (154):** the panel closes (drawn), or it switches to the open night's own Ask AI, Surprise me and Not cooking? And Surprise me on a Not cooking day opens the new meal's detail (drawn). Cost of a wrong guess: one handler.
- **Where 3 seconds applies (155):** the open-day swipe and its Shift X (drawn) or also the Not cooking button, or a swipe on a meal tile (which removes a meal)? Cost: one argument per call; a wrong "yes" on the meal tile loses a meal after 3 s.
- **How far the grey goes (156):** the tile edge, the reveal and the peek (drawn), or the whole Not cooking tile faded like a past day? Is the accent back on the selection and docked frames what he wants (it is the pre-#148 state)? Cost: CSS.
- **The marker (157):** the look (a flat stub with one beat), once per gap, the closing form (the same marker as one settled beat above the opened days), and whether opened days stay open until closed (drawn) or re-collapse on scroll like the peek. Cost: CSS and one rule; the closing form could be a different control (for example a tap on the opened tile).
- **Tear edges (158):** one edge at a time (drawn) or top and bottom together; does the past tile's copy drag tear too (drawn: yes)? Cost: one polygon pair.

Carried forward, untouched (the 147 to 153 questions and everything beneath them, copied from the 01:55 section):

- **The reading of "The open day with this visual is great" (147):** the dashed box with no words (drawn), or the dashed box with the words "Open night" inside? Cost of a wrong guess: low, CSS (`?od=text` already draws the words, a label inside the box is one line).
- **Right swipe (148):** read as Not cooking on an open day, in the same direction as on a meal tile. If he meant a different direction or a different action (for example Surprise me), cost: one gesture. Should a left swipe on an open day do something (Ask AI)? Nothing drawn.
- **"Slightly dull accent" (150):** which accent is meant (the mockup's green/gold, UAT's terracotta, or the Not cooking tint)? Drawn: the elements listed in 150 only, one token. Cost: low, one token or the `?ac` switch; if he meant the global accent it is a theme change, a different and larger decision.
- **The vanishing options (151, 152):** is the reading right (the Not cooking tile, then the options), and did they disappear after a second tap or by themselves? If by themselves, the cause is not found and the exact steps are needed. Should a tap on the tile open the day (drawn) or only reopen the night? Cost: one handler.
- **Guard time (152):** 450 ms. Cost: one constant.

Carried forward, untouched (copied from the 01:44 section, which copied the earlier ones):

- **Tear scope (142):** detail-only (drawn) or any drag-out, for example the tile in hand after "Move to another day"? Cost of a wrong guess: one flag; `?tear=all` already draws the other.
- **Hold or handle (144):** hold-to-lift (drawn) or a drag handle on each tile in the week? Cost: medium (a handle changes every tile's face; hold costs discoverability, which the 129 wiggle could teach).
- **Desktop week board:** does it follow? Not changed here. Cost: medium.
- **Thresholds (144, 146):** hold 350 ms and 8 px, drag 6 px, edge zones 56 and 64 px, 18 px a frame. Cost: low, constants.
- **The reading of the note as a whole (142, 143):** especially "this", "the menu itself" and what "prior visual" covers. Cost: low to medium, mostly CSS.

Carried forward, untouched (the one list from 136 to 141, batch 2 and earlier, copied):

From 136 to 141: Today button or the gutter Today pill scrolling into view on load (88); a date picker from the "Week of" label; how many weeks in the detail ribbon (all three drawn); desktop following the no-ribbon rule (not changed); sheet variant without a ribbon and `?lay=focus` with one.

New from batch 2:
- **Where the bulk actions live (134, 135):** bottom bar only (current), in-list "Add all" and "Hold all" only, or both? Cost of a wrong guess: low, a redraw (the handlers are shared; it is one switch in `ingList` and `footActions`). Also: should the in-list Hold all sit at the end or the start of the on-hand group (end drawn)?
- **What green means (122):** dealt with (on the list, drawn) or all on hand? Cost: one function.
- **Open night tap (125):** tapping now opens the day with Ask AI, Surprise me and Not cooking, instead of marking Not cooking. Confirm; cost of a wrong guess: the row's handler and one button. Also: after Not cooking from that day the stack stays docked (drawn); close instead?
- **Counts on the bottom buttons (126):** are Hold 5 and Add 2 the right numbers (items touched) or should they read "Hold all" and "Add all"? They are not a second status count.
- **Open recipe (127):** where a meal has no saved recipe (made up, Surprise me), hide the action, show a stub (drawn), or offer to save it? In the mockup only three sample meals have a recipe page.
- **Use-by (123):** shown as plain text in the list only; is that enough, or also on the tile?
- **Wiggle rule (129)** and **undo time (130)**: confirm 3 opens, 7 days, stop after a drag; confirm 14 s.
- **Handle (128):** removed (recommended) or lighter.
- **Desktop:** the same status, list, footer and open-night changes are not drawn on desktop.

Carried forward from earlier revisions (not lost):
- Which of desktop layouts A to D; fill the window (63) or left-anchored (56); Esc closing the flyout (66); leftover link as real data (77).
- 3 weeks or 4 weeks forward in the ribbon (86).
- Where a copied-forward or dropped meal lands: start of the day or of the week (102).
- Person filter dropdown or people-count dropdown: both mocked, no pick (97, 98).
- Curtain trigger for the week-level Ask AI: idle or start of the view (96).
- Whether Clear week also clears Not cooking marks (109); undo depth (109, 101).
- Batch 1: pipes between every pair of days or only the week boundary (113); UAT thumbnail and avatar or the mockup's emoji tile (110); Today pill or colour only (111); whether the other detail variants swap on a ribbon tap (115); after Not cooking or Replan from a docked meal, stay docked or close (115); tear on a sideways drag, and a tear on the swipe (118, now moot for the agenda: nothing there is torn unless `?tear=all`); past tile strength (114).

## What loads (DESIGN.md section 6), 13 Oct bulk actions

Default path is the same five files (`theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js`). Measured on this branch against main (795fd9a), concatenated as served: **176.1 KB uncompressed, 49.7 KB gzipped, up 5.9 KB (1.4 KB gzipped)** on main's 170.2 KB, 48.3 KB gzipped (about 5.1 KB script, 0.8 KB CSS). It stays in the default path because the plain week must show the strip; the old strip's code is kept only for `?ws=counts`. No images, fonts or files added to the default path, nothing fetched. `demo.js` is 16.4 KB (was 13.2 KB) and loads only with `?demo=`. Deferred: the demo frames (`?demo=week`), the Mockup options panel, the tools checks, the `img/` screenshots (lazy in the index).

## Verification done (13 Oct, bulk actions)

Headless Chromium, touch at 390 x 844 and 360 x 740, mouse at 1280 x 900. `tools/plan-ui-week-actions-check.mjs` (117 checks, all passing) per width: one strip for this week (next week is empty in the sample, so it has none; none for last week); the old tiles and "use first" are gone; "n of 7 nights" is text on the label row; the group is named and the buttons are at least 44 px tall; Add to buy lists every missing item of this week from today on and nothing in last week or next week, flips in place to Undo, Undo restores exactly, the button returns; Reserve holds every on-hand meal from today on, leaves past meals and next week alone, shows Undo, undo unholds and leaves the list as it was; both are disabled, count-free and explain themselves once everything is listed and held; with copies of this week seeded into next week, both actions work there and are undoable; a Week actions menu still opens with its two items; Jane's plan (view only) has both disabled; `?ws=bare` has no counts; `?ws=counts` keeps the old strip; with `?ut=2` the Undo expires and the button goes disabled; Enter activates a focused button; a docked detail shows the ribbon and no strip; no page errors; no sideways scroll; the strip sits inside the viewport. `tools/plan-ui-not-cooking-check.mjs` (137) and `tools/plan-ui-open-day-check.mjs` (70) still pass, so the ECG markers, the Not cooking panel, the swipes and the tear are unaffected. All seven `?demo=week` frames load with no page errors at both widths. Light theme checked. Not verified: a real iPhone, and the Pages URL from the sandbox (see the PR).


# Tenth revision, 13 October 2026 (voice and typed, later again): buttons only when they apply, the week label row's Not cooking and open counts, Reserve becomes Release (decisions 168 to 177)

Owner (Arjan), 13 October 2026. Items 1 and 2 are voice fragments relayed by the voice session (read carefully); item 3 he typed himself (genuine). **Owner-stated, 13 Oct 2026** marks his words; **Proposal** marks the design agent's choices where he was silent. Cite as "Plan UI review 168" to "Plan UI review 177" (`item-edit-flyout.md` has numbers in this range too, so a bare number is ambiguous).

1. Voice: "Buttons are underneath only if there are things that are missing. They need to be there."
2. Voice: "the four out of seven nights ... put the not cooking, that moon sign ... right after where it says week, this week, next week. On the right side of that, a number and then the moon sign if there are not cooking days. And maybe a dotted box, like a tiny version of the open day/night tile, with a number within it, because that's just telling how many days are open."
3. Typed, verbatim: "So when something is already held, whether at the item level or wholesale, we want to mark that button as reserve. Oh, sorry, release items. So it's like hold. No, let's just say release."

Mockups: [phone.html](../../../fragments/plan-ui-review/phone.html) (`?demo=week`, now 12 frames, `?demo=week&frame=N`; `?ws=actions|bare|counts`; new `?rs=all|both|any`), [index](../../../fragments/plan-ui-review/index.html#wk168). Screenshots `img/p-wk-*` (regenerated, 12 frames x 2 widths, 3 light), `img/p-rel-*`, `img/p-wk-last-*`. Scripted checks: `tools/plan-ui-week-indicators-check.mjs` (204), `tools/plan-ui-week-release-check.mjs` (126), `tools/plan-ui-week-actions-check.mjs` (114, updated). Desktop is not changed.

## Decisions

168. **A bulk button is drawn only when it applies; the disabled state is replaced by hidden (owner-stated, 13 Oct 2026).** "Buttons are underneath only if there are things that are missing." Add to buy is drawn only when something is missing this week from today on and not yet on the shopping list. Reserve is drawn only when something on hand can be reserved that week (and its twin Release only when something is held, 173). If neither applies there is **no strip row at all**: no empty gap, no dimmed buttons; the label row is followed directly by the first day. A view-only plan (another person's) draws none (Proposal; before it drew two disabled ones). **Supersedes** the dimmed and disabled state with reasons in 163, and "after expiry the button is disabled" in 166. Counts live in the buttons as before (163, `?ws=bare` removes them).
169. **Not cooking count on the week label row (owner-stated; the look is a Proposal).** On the right of the row "WEEK OF 12 OCT  This week", after "5 of 7 nights" (165, unchanged), a number then the moon: the existing Not cooking moon icon (the one in the light panel and the Not cooking tile), the number first as he said ("a number and then the moon sign"). Only when the count is above 0. No words; `role="img"`, `aria-label` and `title` say "2 nights not cooking" ("1 night not cooking"). Quiet: the muted grey, 12 px bold, tabular figures, the icon 13 px; not a button (a tap does nothing; an option for later is a tap that scrolls to the first Not cooking day).
170. **Open-nights box (owner: "maybe"; including it is a Proposal, recommended yes).** After the moon, a number inside a tiny dashed rounded box: a miniature of the dashed open-night box (`.od`, UAT `.pw-slot`): 1 px dashed `--border`, 6 px radius, at least 20 x 18 px, the number centred, the page background inside. Only when above 0. No words; `aria-label` and `title` "3 nights open" ("1 night open"). If he did not want it, delete one span (`wop` in `wkInd`).
171. **Counting rules, live updates, past weeks, long labels (Proposal).** (a) Both counts are nights of that week **from today on**; a past day of this week is not counted (the same scope as the bulk buttons, 162, and #151's strip skipped days before today). "5 of 7 nights" is unchanged from #151: it counts every night with a visible meal in the whole week, including past days, so the nights text and the two indicators have different scopes (open question). (b) **Not cooking** counts any Not cooking mark, one-off or usual, hidden (collapsed, 93) or open. **Open** = no meal visible under the current person filter and not Not cooking. Not cooking marks are household-wide; meals and so the open count follow the Mine or Everyone filter, as the nights text already does. (c) Recomputed on every render, so a right swipe to Not cooking, Mark as open, Undo, a drop, Surprise me, Copy last week and Clear week all update the numbers at once. (d) **Past weeks keep #151: label row only** ("Week of 5 Oct, Last week, read only"), no nights text, no indicators, no strip. (e) **This week and next week** get the indicators; an empty next week reads "0 of 7 nights", its Not cooking count and an open count of the rest, and no strip (nothing to act on). (f) Layout: one flex row (`.wr`, `margin-left:auto`, no wrap) after the week label and "This week" or "Next week"; checked at 360 px with "Week of 19 Oct  Next week" and both indicators: one line, no overflow, no sideways scroll. (g) `?ws=counts` (the old strip) draws no indicators; `?ws=actions` and `?ws=bare` draw them. (h) While a tile is being dragged the row's text and indicators are hidden with the rest of the chrome (same rule as the nights text).
172. **After an action (Proposal; the owner asked for exactly this to be stated).** Add to buy: tap, the button flips in place to **Undo** (14 s, 166); after the window nothing is missing, so it is **not drawn**, not disabled. If Undo is used, Add to buy is back. Reserve or Release: never goes away while anything on hand exists that week; after Reserve it flips to Undo for 14 s and then reads **Release**; after Release it flips to Undo and then reads **Reserve**. It disappears only when nothing on hand is left in that week (everything used up or no on-hand items). When both buttons are gone the strip row goes too (168).
173. **Reserve becomes Release (owner-stated words, typed; the state rule is a Proposal).** "When something is already held, whether at the item level or wholesale, ... release." The week button reads **Reserve** while any on-hand item this week (from today on) is not yet held, with the count of not-yet-held items; when **everything on hand this week is held** it reads **Release**, with the count of held items, and releases every held meal from today on. It is in the held sage colour, like the per-meal button. **Mixed state (some held, some not): three readings, `?rs=all|both|any`.** `all` (default, recommended): Reserve with the not-yet-held count, Release only when all are held (finish the job; Release is rare in a mixed week). `both`: Reserve and Release side by side (the row wraps, Release on its own line at 360). `any`: Release as soon as anything is held (the literal reading of his sentence; reserving the rest then needs the per-meal Hold). Cost of a wrong guess: one condition in `weekAct`. **Item level counts:** the week state is read from the same per-meal `held` flag the per-meal Hold sets, so holding single meals by hand moves the week's count and, when every meal on hand is held, flips the button to Release (checked).
174. **The per-meal Hold button says Release when held (owner-stated word; the scope is a Proposal after checking what existed).** Before: the detail footer button read "Hold 5" and, when held, **"Held"** (a state noun, tapping released it); the in-list variant (`?ba=list|both`) read "Hold all" and "Held". Now both read **Release** when the meal is held and **Hold** (footer) or **Hold all** (list) when not; the sage colour still marks it as held; the aria label says "Release the hold on 5 on-hand ingredients" or "Hold all 5 ...". **Proposal:** `aria-pressed` is removed from these two buttons because the visible name changes with the state (a toggle that renames itself should not also announce pressed). The notes ("Holding the ingredients", "Hold released") and the H shortcut are unchanged. Past meals have no Hold (Copy forward), as before.
175. **Release and Undo co-exist (Proposal).** **Undo** is the in-place reversal of the last action and lives 14 s in the slot of the button that did it ("Undo reserve", "Undo release", "Undo add to buy"). **Release** is a real state of the week that stays as long as something is held; it is not an undo. Sequence for one tap of Reserve: Reserve, then Undo reserve (14 s), then Release. Undo of Reserve returns Reserve exactly; Undo of Release holds the same meals again, exactly. This replaces #151's "Undo reserve flip then disabled" and does not clash with it: the flip is still there, what follows it is now Release instead of nothing.
176. **Resolved: week Reserve is the same Held as the per-meal Hold (owner question closed).** One flag, one state: the week Reserve sets every meal with on-hand items to held, the per-meal Hold toggles the same flag, and a held meal shows Release in its detail and in the week. "Item level" in the mockup means a whole meal's on-hand items (there is no single-ingredient hold in the mockup); if the app gets single-ingredient holds, the week counts should be items, which is what the mockup already counts. This closes the open question "What Reserve means (161)" for the copy and the state; the Kitchie model side (`plan_reserve` and per-meal Hold being one record) is for the build.
177. **Accessibility and keyboard (Proposal).** The row's indicators are `role="img"` with text labels, not focusable. The group is still "Bulk actions for this week"; it is not rendered when empty. Release is a real button (at least 44 px, focus ring) with the label "Release: let go of the 14 held on-hand items for this week"; Enter activates it. No new shortcut.

## Supersession notes (13 Oct, indicators and Release)

- **163** (dimmed disabled buttons, reasons in the tooltip) and **166**'s "disabled after expiry" are superseded by **168** and **172**. The old disabled copy ("Everything missing this week is already on the shopping list" and the other two reasons) is no longer drawn anywhere.
- **165**'s "5 of 7 nights" stays exactly as it was; the indicators are added after it (169, 170). The open question about nights and buttons on one line is resolved below.
- **126, 134** (per-meal Hold, Hold all) keep their layout and counts; only the held word changed (174).
- **161**'s "held meals show Held in their detail" is now "show Release" (174).
- Desktop is not changed: it still has the four-tile `.sumstrip` and the inspector's idle "Use first" and "Buy by day".
- Screenshots: `p-wk-*` (12 frames at 390 and 360, `p-wk-light-1|5|9`), `p-rel-*`, `p-wk-last-*` are new or regenerated; `p-wk-light-2-390` was removed (it showed the old Undo-then-disabled strip). Plain-week pictures regenerated by `tools/plan-ui-shots.mjs` show the new label row; any `img/` picture it does not regenerate was drawn earlier and may show #151's strip with no indicators or an older footer; the pages are the source of truth.

## Open questions (new, 13 Oct, indicators and Release)

- **Resolved by his words (168): "nights and buttons on one line or separate".** The nights text and the indicators are on the label row, the buttons are below, and only when they apply. Closed.
- **Resolved (176): does reserve mean the same Held as the per-meal Hold?** Yes, the same Held state.
- **Resolved (168): an empty week, hide the strip or two disabled buttons?** Hidden; disabled buttons are gone everywhere.
- **Include the open-nights box (170)?** He said "maybe"; drawn, recommended. Cost of a wrong guess: delete one span, no layout change.
- **Mixed held state (173):** Reserve with the not-yet-held count (default), both buttons, or Release as soon as anything is held? Cost: one condition in `weekAct` (`?rs=` already draws all three). A wrong "any" strands the not-held meals without a week-level way to reserve them; a wrong "all" means Release is only reachable after reserving the rest.
- **Scope of the counts (171):** nights from today on (drawn) while "5 of 7 nights" counts the whole week including past days. Make the nights text "from today" too, or the indicators whole-week? Cost: one filter, and "2 of 7 nights" would read oddly on a Sunday.
- **Does a Not cooking night that also has a meal count (171)?** The mockup cannot produce one (the swipe removes the meal), so the rule (Not cooking wins) is untested. Cost: low.
- **Should the indicators be tappable (169)?** Drawn as read-only icons, as he described; a tap to jump to the first Not cooking or open night is a small add. Cost: one handler.
- **Release wording on the per-meal button (174):** "Release" with no noun, as he said. The in-list text is "Release" where it was "Held" (the unheld "Hold all" is unchanged); confirm no longer label ("Release all"). Cost: copy.
- **Is the sage colour right for a held state (173, 174)?** Kept from the per-meal Held look. Cost: CSS.
- **Item-level hold (176):** the mockup holds whole meals. Does he want holding a single ingredient? Not drawn. Cost: medium (a per-ingredient flag and the count by items).
- **Desktop follows?** Not drawn. One redraw of `.sumstrip` and the inspector's idle view.
- **(Resolved by 168, see above) Where the nights text and the buttons sit (165):** label row text plus buttons on the line under it (drawn), or the buttons on the label row itself? Cost of a wrong guess: low, flex and one row's width at 360 px.
- **(Resolved by 176 for the state; copy question closed by 174) What Reserve means (161):** it sets the same Held state as the per-meal Hold (drawn). If "reserve" is a stronger idea than hold (for example it blocks substitution or cooking from stock), or if he wants a different word on the per-meal button, that is a copy change and a model question. Cost: low for copy, medium for the model (Kitchie `plan_reserve`).
- **Add to buy when the same ingredient is missing in two meals (160):** drawn as each meal's own line, the count adds them (the list is not merged in the mockup). In the app it should merge into one list line with the larger quantity. Cost: the count in the button would read lower than the sum.
- **Undo window (166):** 14 s (drawn) or the 3 s of 155 for all bulk actions? Cost: one constant; a 3 s window on a week-wide change is short.
- **Counts inside the buttons (163):** keep, or plain words? `?ws=bare` shows the plain words. Cost: nothing.
- **(Resolved by 168) A week with no meals from today on (163):** the strip is hidden (drawn); or two disabled buttons? Cost: one condition.
- **Scope when scrolling across a boundary (164):** the week the strip sits under (drawn) or the week the header shows? Cost: low; the header lags by a few rows.
- **Past days in this week (162):** skipped (drawn); should Add to buy also cover a missing item for a meal already past (no)? Cost: one filter.
- **Desktop:** does the strip follow? Not drawn.

Carried forward, untouched (every earlier open question, copied from the bulk-actions section, which copied the live-test section; the week summary item was removed by 159):

- **Panel after Mark as open (154):** the panel closes (drawn), or it switches to the open night's own Ask AI, Surprise me and Not cooking? And Surprise me on a Not cooking day opens the new meal's detail (drawn). Cost of a wrong guess: one handler.
- **Where 3 seconds applies (155):** the open-day swipe and its Shift X (drawn) or also the Not cooking button, or a swipe on a meal tile (which removes a meal)? Cost: one argument per call; a wrong "yes" on the meal tile loses a meal after 3 s.
- **How far the grey goes (156):** the tile edge, the reveal and the peek (drawn), or the whole Not cooking tile faded like a past day? Is the accent back on the selection and docked frames what he wants (it is the pre-#148 state)? Cost: CSS.
- **The marker (157):** the look (a flat stub with one beat), once per gap, the closing form (the same marker as one settled beat above the opened days), and whether opened days stay open until closed (drawn) or re-collapse on scroll like the peek. Cost: CSS and one rule; the closing form could be a different control (for example a tap on the opened tile).
- **Tear edges (158):** one edge at a time (drawn) or top and bottom together; does the past tile's copy drag tear too (drawn: yes)? Cost: one polygon pair.

Carried forward, untouched (the 147 to 153 questions and everything beneath them, copied from the 01:55 section):

- **The reading of "The open day with this visual is great" (147):** the dashed box with no words (drawn), or the dashed box with the words "Open night" inside? Cost of a wrong guess: low, CSS (`?od=text` already draws the words, a label inside the box is one line).
- **Right swipe (148):** read as Not cooking on an open day, in the same direction as on a meal tile. If he meant a different direction or a different action (for example Surprise me), cost: one gesture. Should a left swipe on an open day do something (Ask AI)? Nothing drawn.
- **"Slightly dull accent" (150):** which accent is meant (the mockup's green/gold, UAT's terracotta, or the Not cooking tint)? Drawn: the elements listed in 150 only, one token. Cost: low, one token or the `?ac` switch; if he meant the global accent it is a theme change, a different and larger decision.
- **The vanishing options (151, 152):** is the reading right (the Not cooking tile, then the options), and did they disappear after a second tap or by themselves? If by themselves, the cause is not found and the exact steps are needed. Should a tap on the tile open the day (drawn) or only reopen the night? Cost: one handler.
- **Guard time (152):** 450 ms. Cost: one constant.

Carried forward, untouched (copied from the 01:44 section, which copied the earlier ones):

- **Tear scope (142):** detail-only (drawn) or any drag-out, for example the tile in hand after "Move to another day"? Cost of a wrong guess: one flag; `?tear=all` already draws the other.
- **Hold or handle (144):** hold-to-lift (drawn) or a drag handle on each tile in the week? Cost: medium (a handle changes every tile's face; hold costs discoverability, which the 129 wiggle could teach).
- **Desktop week board:** does it follow? Not changed here. Cost: medium.
- **Thresholds (144, 146):** hold 350 ms and 8 px, drag 6 px, edge zones 56 and 64 px, 18 px a frame. Cost: low, constants.
- **The reading of the note as a whole (142, 143):** especially "this", "the menu itself" and what "prior visual" covers. Cost: low to medium, mostly CSS.

Carried forward, untouched (the one list from 136 to 141, batch 2 and earlier, copied):

From 136 to 141: Today button or the gutter Today pill scrolling into view on load (88); a date picker from the "Week of" label; how many weeks in the detail ribbon (all three drawn); desktop following the no-ribbon rule (not changed); sheet variant without a ribbon and `?lay=focus` with one.

New from batch 2:
- **Where the bulk actions live (134, 135):** bottom bar only (current), in-list "Add all" and "Hold all" only, or both? Cost of a wrong guess: low, a redraw (the handlers are shared; it is one switch in `ingList` and `footActions`). Also: should the in-list Hold all sit at the end or the start of the on-hand group (end drawn)?
- **What green means (122):** dealt with (on the list, drawn) or all on hand? Cost: one function.
- **Open night tap (125):** tapping now opens the day with Ask AI, Surprise me and Not cooking, instead of marking Not cooking. Confirm; cost of a wrong guess: the row's handler and one button. Also: after Not cooking from that day the stack stays docked (drawn); close instead?
- **Counts on the bottom buttons (126):** are Hold 5 and Add 2 the right numbers (items touched) or should they read "Hold all" and "Add all"? They are not a second status count.
- **Open recipe (127):** where a meal has no saved recipe (made up, Surprise me), hide the action, show a stub (drawn), or offer to save it? In the mockup only three sample meals have a recipe page.
- **Use-by (123):** shown as plain text in the list only; is that enough, or also on the tile?
- **Wiggle rule (129)** and **undo time (130)**: confirm 3 opens, 7 days, stop after a drag; confirm 14 s.
- **Handle (128):** removed (recommended) or lighter.
- **Desktop:** the same status, list, footer and open-night changes are not drawn on desktop.

Carried forward from earlier revisions (not lost):
- Which of desktop layouts A to D; fill the window (63) or left-anchored (56); Esc closing the flyout (66); leftover link as real data (77).
- 3 weeks or 4 weeks forward in the ribbon (86).
- Where a copied-forward or dropped meal lands: start of the day or of the week (102).
- Person filter dropdown or people-count dropdown: both mocked, no pick (97, 98).
- Curtain trigger for the week-level Ask AI: idle or start of the view (96).
- Whether Clear week also clears Not cooking marks (109); undo depth (109, 101).
- Batch 1: pipes between every pair of days or only the week boundary (113); UAT thumbnail and avatar or the mockup's emoji tile (110); Today pill or colour only (111); whether the other detail variants swap on a ribbon tap (115); after Not cooking or Replan from a docked meal, stay docked or close (115); tear on a sideways drag, and a tear on the swipe (118, now moot for the agenda: nothing there is torn unless `?tear=all`); past tile strength (114).

## What loads (DESIGN.md section 6), 13 Oct indicators and Release

Default path is the same five files (`theme.css`, `phone.css`, `data.js`, `status.js`, `phone.js`). Measured the same way on main (8e40d54) and on this branch, concatenated as served (`cat | wc -c`, `gzip -9`): main 176.3 KB uncompressed, 49.8 KB gzipped; this branch **180.8 KB, 51.1 KB gzipped, up 4.5 KB (1.3 KB gzipped)** (about 3.7 KB script, 0.8 KB CSS). Always on because the plain week must show the label row, the indicators and the buttons. No images, fonts or files added to the default path, nothing fetched. `demo.js` is 18.8 KB (was 16.5 KB) and loads only with `?demo=`. Deferred: the demo frames, the Mockup options panel (one `?rs=` group added), the tools checks, the `img/` screenshots (lazy in the index).

## Verification done (13 Oct, indicators and Release)

Headless Chromium, touch at 390 x 844 and 360 x 740, mouse at 1280 x 900, dark and light. `tools/plan-ui-week-indicators-check.mjs` (204 checks, all passing): the indicators match the state (Not cooking and open nights from today on), nights text then moon then box on one row at the right, aria-labels and titles say number and meaning, no words, the box is dashed and rounded, the past week has no nights text or indicators, indicators are not buttons, label rows do not overflow or wrap (including "Week of 19 Oct  Next week" with both indicators at 360), no sideways scroll; marking an open night Not cooking moves one from the box to the moon and Undo restores it; a meal on an open night lowers the open count; several Not cooking and several open nights, plural wording, zero hides each indicator; both buttons, everything held (Add to buy and Release), only Reserve (nothing missing), a lone button takes the row, nothing missing and nothing on hand: no strip row and no gap; after use the button is Undo and then gone, not disabled; `?ws=bare` and `?ws=counts`; light theme; all 12 `?demo=week` frames load, assert their state and do not scroll sideways. `tools/plan-ui-week-release-check.mjs` (126): Reserve, Undo reserve, then Release with the held count; Release lets go of every held meal from today on, leaves a past held meal alone, shows Undo release, Undo holds exactly the same meals, then Reserve returns; the per-meal Hold reads Hold then Release (never Held), labels and no aria-pressed, in the footer and in `?ba=list` and `?ba=both`; one meal held by itself moves the week count and the button stays Reserve (mixed, default); all meals held one by one flips it to Release; `?rs=all|both|any` give Reserve, Reserve + Release, Release; the strip stays in the viewport at all three widths with 44 px buttons; nothing on hand shows neither; another person's plan shows neither; next week acts on its own meals; Enter on Release; light theme; `?ws=bare` has no count on Release. `tools/plan-ui-week-actions-check.mjs` (114, updated for hidden instead of disabled and Release at the end), `plan-ui-not-cooking-check.mjs` (137) and `plan-ui-open-day-check.mjs` (70) pass, so #150's ECG markers, Not cooking panel, swipes and tear are unaffected. No page errors, no sideways scroll. Screenshots viewed and checked. Not verified: a real iPhone, and the Pages URL from the sandbox (see the PR).
