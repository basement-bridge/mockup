# Plan UI review: desktop and phone

Owner ask, 12 October 2026 (voice or text): "Analyse the plan UI for desktop and mobile and amend with better UI choices/options, in mockup first." Everything below the owner's words is a **proposal** by the design agent. Nothing is built in Kitchie and nothing is confirmed. Decisions 63 to 84 continue the Plan list after 49 to 62 (other job notes reuse some of these numbers for their own lists, so always cite them with this file name).

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
