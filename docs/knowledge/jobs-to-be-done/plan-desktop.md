# Planning the week, on desktop

Handover for whoever drives this next (status, open questions, next steps, process): [../../handover/plan-desktop.md](../../handover/plan-desktop.md).

Mockup: `fragments/plan-desktop/index.html` (options A to D, each at 1024, 1280, 1366 x 768, 1440, 1920 and 2560). Builds on [plan-week-ai.md](plan-week-ai.md); decisions 1 to 48 there still stand. Everything below is a proposal until the owner confirms (numbers 49 to 62 continue that list).

Follow-up review (12 Oct 2026): [plan-ui-review.md](plan-ui-review.md) refines these options (decisions 63 to 84, proposals).

## Job

Same job as the phone: see the week, fix it, know what to buy and what to cook first. On a wide screen the person also wants the whole week at a glance, and a meal's detail beside the week, not on top of it.

Owner's complaint (owner screenshot, 10 Oct 2026, dark, about 1440 wide): the page is the phone layout stretched into a 60% column; the right half is wasted; the meal panel is pinned bottom-right, covers the list it relates to and is clipped at the bottom; it assumes touch; no keyboard; no use of the width.

## How we know the person is in this job

They opened Plan on a screen 1024 wide or more. Pantry's desktop rules apply (rail 88, column, side panel, left-anchored with a 48px gutter; [desktop-layout.md](../desktop-layout.md)).

## What leads

Seven days with their meals, each card showing what is wrong (missing, use-by, shopping). Beside it, the inspector: the picked meal, or, when nothing is picked, the week summary (to buy by day, use-by pressure, cook order).

## What this job does not need

No in-app agent (42). "Open your assistant" opens the person's default AI app (45). No data-model work outside last week to four weeks ahead (44). No Move button (6): moving is dragging, with a keyboard way to drag. AI-made meals say "Made up by your assistant" and are not saved recipes.

## Mockup

Four options, same cards, pills and states; only the layout differs.

| Option | Idea | Size rules |
|---|---|---|
| A | Seven-column week board plus docked inspector | Agenda under 1280; board from 1280 (inspector summoned, 360); inspector always docked from 1440 (400); 440 at 1920; board max 1760 and a separate summary lane from 2200 |
| B | Agenda plus detail pane (Pantry master-detail) | One layout from 1024; list max 760 (820 at 1920); pane 340, 380, 400, 440 |
| C | Week strip, one focused day, Pantry-style flyout | Column 736 plus flyout 340 to 440; second column (Mise en place) at 1920 |
| D | Cook sheet: ingredients by day, use first, to buy, shared, leftovers chain | Lane overlays under 1440, docks from 1440; sheet max 1500; second lane at 2200 |

Recommendation: A as the default, B as its narrow form and as the fallback, D later as a second view of the same week, C's Mise en place as a summary section.

Viewport code: `plan.css` and `plan.js` have no size rules. Each option has `<opt>-1280.css`, `-1440.css`, `-1920.css`, `-2560.css` (min-width 2200) and `-short.css` (max-height 800), linked with `media=` so a size loads only its own file. Per-size scripts (`lane-summary-2200.js`, `d-overlay.js`, `d-2560.js`) are fetched only when their query matches.

### Touch to pointer and keyboard

| Phone | Desktop |
|---|---|
| Swipe a meal | Hover or focus buttons (Hold, Replan, More); right-click menu with keys; X Replan, Shift X remove and not cooking, H hold, L add missing, Z undo |
| Drag a meal | Mouse drag with ghost and drop targets; Alt copies; keyboard: Space lift, arrows carry, Space drop, Esc cancel |
| Tap opens a bottom sheet | Click or Enter fills the side inspector; Ctrl or Cmd Enter or the x closes it; Esc does not |
| Swipe between weeks | Arrows, [ and ], Page Up and Down, trackpad sideways, week picker (W), T for this week |
| Pull to refresh | Refresh control, R, and the sync pill (Live, Syncing, Offline, Updated by your assistant) |
| Long-press | Right-click or hover |
| Any removal | Undo toast, Z; no confirm dialogs |

## Decisions (proposals, 10 Oct 2026, by the design agent; owner to confirm or overturn)

49. Desktop Plan is its own layout, not the phone column stretched. Recommended: option A.
50. The inspector never covers the week it is about: it docks and pushes. Only option D overlays, below 1440.
51. Inspector widths 340, 380, 400, 440 (400 at 1440, as Pantry).
52. With nothing picked the inspector is the week summary: to buy by day, use-by pressure, cook order. Never empty.
53. Close is Ctrl or Cmd Enter and the x; Esc only cancels a drag, lift, menu or picker (Pantry's rule). The lane is resizable (320 to 560), dismissible, and a picked meal is in the URL.
54. No Move key. Decision 6 stands; desktop adds Space to lift and carry. M stays "focus the main column", as in Pantry.
55. X is Replan, Shift X is remove and not cooking, H is Hold (carry 13, 25, 38 and 9 to the keyboard).
56. Breakpoints and caps as in the table above; left-anchored, free space on the right.
57. Two-finger sideways scroll steps a week; the title opens a picker of last week to four weeks ahead (44).
58. Sync indicator in the header; offline pauses edits and says so, it does not queue them.
59. Undo toast for every removal, replan, move and copy.
60. Use-by is a drop hint ("fixes use-by", "after use-by"); it never blocks a move.
61. Hover buttons are also reachable by focus, so keyboards and touch laptops get them.
62. Day-state looks (34 to 36), the stable week title (46) and last week read-only (31) carry over unchanged.

## Open questions

- Which option the owner picks; whether D becomes a second view.
- Whether the sheet in D should be reachable on phone (not drawn).
- Decision 47 (week remembered) and 48 (people strip) are carried by reuse only; the strip is not redrawn for desktop.
- 1366 x 768: the board's day columns keep a full-height drop area only from 1280 up; confirm that is acceptable at 1024.

## For the implementation

- Shared component code carries no size rules; each size's CSS lives in its own file (DESIGN.md section 6). The default path loads two shared files plus the size files that match. No images.
- Keep one set of class names with the phone Plan and Pantry (`.mc .tg .blocked .slot`, `.rail .panel .toast .kbd`) so the built app matches the mockup.
- Realtime: the sync pill reads the same stream the phone uses; offline shows the last saved plan with its time.
- DESIGN.md learnings applied: 1 (start from the job), 2 (one token set), 4 (one visual family), 5 (options), 6 (load only what is needed now), 7 (form factors).
- Hand-planned meals and Hard avoids (owner, 12 October 2026): a Hard avoid blocks a meal planned by hand only when that person is in the meal; the guard is drawn in the Plan it panel in `fragments/plan-hard-avoid/` (decisions SW-74 to SW-82 in `docs/knowledge/settings-window.md`). The Plan options above draw no add control (the Plan is assistant-led); the panel is the hand-add path.


See also: Plan UI review decisions 85 to 106 (owner voice review, 12 Oct 2026) in `plan-ui-review.md`; options A to D here are linked from that review page.

## Option B refined (12 Oct 2026, owner by voice): decisions 110 to 120, and 156 (drop-in cue)

Owner chose option B (agenda + detail pane) as the base to refine and gave the points below by voice. **owner, 12 Oct 2026** marks his words; **Proposal** marks a gap the design agent filled. Numbers continue after 109 in [plan-ui-review.md](plan-ui-review.md). Other job notes (`item-edit-flyout.md`, `home-detail-panel.md`) reuse 107 and up for their own lists (and 107 to 109 are Plan UI review phone decisions), so cite these as "Plan desktop 110" with this file name. Nothing is built in Kitchie.

Mockup: `fragments/plan-desktop/b.html?sel=wed-curry` (links for every state on `fragments/plan-desktop/index.html`). Options A, C, D are untouched (the tile and summary changes are B only, through hooks in `plan.js`).

110. **B is the base** (owner, 12 Oct 2026). Supersedes the recommendation of A in 49 for now; A, C, D stay drawn. Whether ideas from A or C (for example a week strip for at-a-glance) are folded in is **not decided** (open question).
111. **Nothing picked: "This week at a glance"** (owner): what to buy, by day, and use-by pressure. **Cook order is removed** (the agenda shows it). "Add all N to the shopping list" stays in the summary (owner: "amazing"). Supersedes the cook-order part of 52.
112. **The summary looks and feels different from the meal detail** (owner): overview versus drill-down; the agenda is the main swim lane, unchanged. Proposal for how: tinted ground and dashed left edge, no emoji header and no close button, a three-figure tally, a by-day ledger with day tags, dated use-by badges; the detail stays the flush surface panel with the emoji header, close x and ingredient rows.
113. **Picking a meal does not replace the summary when there is room** (owner): agenda | detail | summary, the summary shifts right. With no room it tucks behind the detail: reachable, never both visible (Proposal for the mechanism: a "This week at a glance" bar at the top of the detail, "Back to <meal>" in the summary, key G, Ctrl or Cmd Enter returns). Widths (Proposal, existing breakpoints, size files own the numbers):

| Viewport | State | Agenda | Detail | Summary |
|---|---|---|---|---|
| 1024 | tucked | fluid, about 596 | 340 | 340 (same lane) |
| 1280 | tucked | fluid, cap 760 | 380 | 380 (same lane) |
| 1366 x 768 | tucked, short rules | fluid, cap 760 | 380 | 380 (same lane) |
| 1440 | three columns | 632 | 400 | 320 (88 + 632 + 400 + 320 = 1440) |
| 1920 | three columns | cap 820 | 440 | 360 |
| 2560 | three columns | cap 820 | 440 | 400 |

   Nothing picked at 1440 and up: agenda | summary (320), the detail slot closed, free space to the right. Files: `b.css` (base, tucked), `b-1280.css`, `b-1440.css` (the `.three` grid), `b-1920.css`, `b-2560.css`, `b-short.css`; `b-three-1440.js` is fetched only at 1440 and up. Replaces the 2200 summary lane (`lane-summary-2200.js` stays for A and C). The header "to buy / use-by" chips are hidden when the summary is visible (Proposal).
114. **The summary is a rolling tally** (owner): actions in the detail or on a tile (add missing via the cart, hold, replan and so on) update it live. Proposal: To buy, On the list and Meals held figures, the changed figure bumps once (not with reduced motion) and the change is announced politely.
115. **Tile: status left, actions right** (owner). Left is one recognised status at a time; right are persistent action icons, no hover-only reveal: Hold or Release (toggle), Replan, Remove and not cooking, Add missing to list. Keys stay (X, Shift X, H, L, Z) and the icons are reachable by focus. Refines 55 and 61 (hover reveal is gone in B). Proposal for the icons: bookmark (Hold, filled when held), circular arrows (Replan), moon (Not cooking), cart (Add missing). A slot with nothing to do keeps its place, empty, so the icons line up down the list.
116. **Missing splits in two** (owner): Missing (nothing actioned) and On the shopping list (actioned); a tile never shows both. The tile names the item ("Missing feta"). Use-by stays visible. A fully stocked tile (Mushroom pasta) stays quiet (a plain "All on hand", no chip). **Headline priority missing > use-by > all on hand is a PROPOSAL.** Proposal details: On the list ranks just above all on hand (once every missing item is actioned the tile drops to use-by or quiet); with some items actioned the tile shows Missing for the rest; when Missing is the headline a use-by line stays beside the who chip. Icon audit (Proposal): meal emoji (what), who chip with "Everyone · 2 people" on the meta line (who), one status chip (state), use-by clock line (time), action icons on the right (do). Revisits 72 and 104 for B.
117. **Hold and Replan** (owner): Hold is a toggle. Replan (X) respects hold state, and replanning or releasing also releases the ingredients held for that meal. Proposal for wording: the undo toast names the ingredients released; the detail says "Replan also releases the hold on this meal". No confirm (undo exists, 59).
118. **Unplanned day: "Surprise me" and "Ask AI"** (owner). The app proposes a meal from heuristics (94). On a planned meal these are not persistent buttons: Replan clears the meal, then the open night offers both ("Meal cleared. Fill this night?"). Ask AI follows 95's wording and is scoped to the night; Proposal: B drops the header "Open your assistant" button (95 votes against a persistent assistant control) and keeps key A scoped to the day in view. **Open question: does Surprise me lock the proposal in, or show it to confirm first?** Both are drawn (`?surprise=confirm`); lock-in with undo is the default. The mock heuristic is 94's (Proposal thresholds).
119. **Four day states, each distinct** (owner). Unplanned: dashed outline (35) with Open night, Surprise me, Ask AI and a quiet Not cooking. Planned: tiles. Not cooking: one week only, set from the grid, no "just this week or every Wednesday" choice (4, 9 Oct decision), filled accent block with the **moon** (owner named the moon; revisits 24 "no moon") and "This week only". Usual day: the Settings stencil, plain outline without fill, a repeat glyph (Proposal) and "From Settings, every week"; a one-week override from the grid cooks it and keeps 34's line "Usual day off, cooking this week" (`?fri=cook`). Looks reuse 34 to 36. Dashed Open night revisits 92 and 70 (no dashed box) for desktop B because the owner said to reuse 34 to 36 (Proposal).
120. **Wording** (Proposal): Ask AI replaces "Open your assistant" and "Plan with your AI assistant" in B's menus, curtain and key list.
156. **"Just dropped in" cue on every tile that changes** (owner, 12 Oct 2026, by voice: "it just needs to say something's just dropped in place. I thought we wanted that ritual." Asked whether this is only Surprise me or any meal landing: "everything. Like if something is kind of replaced, I want the visual to know something's just dropped in."). Whenever a meal tile's content changes, by any route (drag-drop, Replan then a fill, Surprise me, Ask AI, Use this on a proposal, undo, copy, or one meal replacing another), the tile shows a brief cue so it reads as freshly placed, never as a silent swap. **Option B only.** Numbered 156 because 121 to 155 are taken in other job notes on main (item edit flyout, Home detail panel). Proposals where the owner was silent: the cue is visual plus a polite screen-reader line ("Dropped in: Shakshuka on Mon"), no visible words; the tile drops about 14px into place with a small settle (0.45s) while its card washes in the accent (22% mix) with a soft ring, fading over 1.5s; with reduced motion there is no movement, a still accent wash and ring for the same 1.5s, then it clears; a tile counts as new when its card, day or meal was not in the last render of the same week and tab (so changing week or tab, and the first load, do not cue); the drag ghost does not carry it; it sits on the tile only, so "Made up by your assistant" (in the detail, not on the tile) and the Hold and Replan icons are untouched, and it ends on the existing Surprise "fresh" ring if there is one. Code: `b.css` and `b.js` (`.dropped`, `--age` so a re-render mid-cue does not restart it); no size rules, no new files. Follow-up, **not built**: should A, C and D carry the same cue? Should the phone Plan?

### Open questions (Plan desktop, B refined)

- Fold ideas from A or C (for example a week strip) into B? Not decided (owner).
- Surprise me: lock in (undo) or show to confirm first? (118)
- Headline priority missing > use-by > on the list > all on hand is a proposal (116); partial actioning rule too.
- Three columns from 1440 (113): is 632 for the agenda enough, or should three columns start later or earlier? Tucked below 1440 incl. 1366 x 768.
- Moon on Not cooking (119) revisits 24; dashed Open night (119) revisits 92.
- Does Replan on a held meal need to say more than the undo toast (117)?
- Drop-in cue (156): is a still, wordless visual enough, or should a short word ("Just dropped in") show? Is 1.5s right? Should A, C and D (and phone) carry it? When many tiles land at once (Copy last week) should they stagger?
- Summary with nothing picked sits beside the agenda and leaves free space on the right at 1440 and up (113); acceptable?

### For the implementation (B refined)

- Shared `plan.js` has hooks (`layout.card`, `layout.lanes`, `layout.peek`, `layout.glance`, `layout.words`); B's tile, day states and summary are in `b.js`. No size rules in shared files; `b.css` has none.
- Chat tools and the UI call the same service methods (`plan_remove_meal` Replan and release hold, `plan_block_day`, `plan_reserve`, `plan_add_missing_to_list`); Surprise me needs a service method (heuristics in 94) that does not exist yet.
- Drop-in cue (156): CSS-only animation on `.mcw.dropped` plus a few lines in `b.js`. Default path adds no files, no images and no timers until a tile changes; the one timeout (1.5s) runs only while a cue shows. Deferred: nothing needed.
- Default path: `theme.css`, `plan.css`, `b.css`, `plan.js`, `b.js` plus the matching size files; `b-three-1440.js` only at 1440 and up. No images.


## Option B realigned with the phone Plan (14 October 2026, decisions 259 to 275)

Owner, 14 Oct 2026, typed: "given the changes to mobile ... realign the web now based on the key decisions and overall desktop design language". Kept from desktop: agenda | detail | week at a glance, persistent right-hand icons, one status per tile, Pantry master-detail, desktop breakpoints, key shortcuts. Not copied: swipe, bottom sheet, long hold (translated per the touch-to-pointer table, or marked not applicable). Options A, C and D are untouched; every B-only behaviour sits behind `layout` flags and hooks in `plan.js` or in B's own files.

### Carry-over audit (phone decisions 153 to 215)

Counts: **14 carry over, 9 translate, 6 not applicable, 2 conflict** (31 rows).

| # | Phone decision | Class | On desktop B |
|---|---|---|---|
| 1 | Who can act; another person's plan fully view only (190, 205, 206) | Carry over | Eye glyph, tiles dimmed, no icons, no Hold, Add or stepper, no week buttons (260) |
| 2 | Blocked hold dropped (207, 213) | Carry over | Hold never shows a blocked state (261); open question 1 |
| 3 | Household meals can name participants (208 to 211) | Carry over | `part` field; audience line says Household or the names; third member Priya (262) |
| 4 | "Household" replaces "Everyone" (201) | Carry over | Tab, tiles, picker (262) |
| 5 | Count buttons and labelled hold: Hold N, Add N, Release once held (126, 163, 174) | Carry over | Detail footer (268) |
| 6 | One combined ingredient list, Total time, Open recipe real (123, 124, 127) | Carry over | Detail (268) |
| 7 | Five weeks visible: last week and the next four (197, 200; owner confirmed) | Carry over | WMAX 3 (265) |
| 8 | Open night is an open padlock, not a dashed box (215) | Carry over | Supersedes 92 and the dashed outline B drew (266) |
| 9 | Open night offers only Ask AI and Surprise me, no Not cooking button (187 to 189) | Carry over | Shift X and the menu reach Not cooking (266) |
| 10 | Week-level Add / Reserve / Release (159 to 161, 172 to 177) | Carry over | Summary buttons, in-place Undo (269) |
| 11 | Week indicators: moon and padlock counts jump to the first night (169 to 171, 181, 191) | Carry over | `N of 7 nights`, moon and padlock counts (269) |
| 12 | Meal lands first in its day (198) | Carry over | Move, Surprise me, proposal (269) |
| 13 | Not cooking toast lasts 3 s (155) | Carry over | `ncMs` 3000 (267) |
| 14 | Bulk buttons hidden when they do not apply (168) | Carry over | (269) |
| 15 | Header icons Copy and Clear, one tidy row (194) | Translate | Icons with tooltips, no sheet (263) |
| 16 | In-place Undo chip after a header or bulk action (214) | Translate | Button flips to Undo for 14 s or until the next change (263) |
| 17 | Routine and usual days: Clear keeps them, wording (195, 196) | Translate | "Usual days off stay" (264) |
| 18 | Clear week by scope (203) | Translate | Mine clears own meals, Household clears household meals, never the past or another's plan (264) |
| 19 | Copy last week (99, 194) | Translate | Header icon; fills only empty future nights (263) |
| 20 | Right swipe to Not cooking (148) | Translate | Right-click menu, B, Shift X (266) |
| 21 | Light card opened from an open night or Not cooking day (154, 183 to 186) | Translate | Inline strip: Not cooking day gets Surprise me, Ask AI, Mark as open (267) |
| 22 | Long hold on "Household" / "Week of" moves the list (193, 202) | Translate | T key and "This week" in the picker, today row pulses (270) |
| 23 | Copy forward from a past meal (100 to 102, 190a) | Translate | Persistent icon on past tiles, menu of the coming 14 days (271) |
| 24 | Tear on lift and drag (118, 142, 158) | Translate | Ghost and placeholder get torn top and bottom edges (271) |
| 25 | ECG marker over hidden Not cooking days; opened days fold back (178 to 182) | Not applicable | B draws all 7 days of one week; nothing is hidden |
| 26 | Grey lip, date ribbon, auto-scroll across weeks (128, 136 to 141, 146) | Not applicable | One week at a time |
| 27 | `?ba=` switches, touch vanish bug (134, 135, 151 to 153) | Not applicable | Phone only |
| 28 | Read-only meals can be held and added (204) | Not applicable | Withdrawn by 206 the same night |
| 29 | Fragments (212), phone-width wrap (192) | Not applicable | No equivalent |
| 30 | Plain red or green circle with no words (121, 122) | Conflict | Desktop 115, 116 (owner): "Missing feta", Missing vs On the list, headline priority. Kept desktop; open question 2 |
| 31 | Not cooking in muted grey (156) | Conflict | Desktop 119 (owner): filled accent block with moon. Kept desktop; open question 3 |

Judged not a conflict: 187 (no Not cooking button on an open night). The quiet Not cooking button was a design-agent Proposal in 119; the owner confirmed only Surprise me and Ask AI (118).

### Decisions

259. **Realign B with the phone Plan** (owner, 14 Oct 2026). The audit above; rows 1 to 24 applied, 25 to 29 not applicable, 30 and 31 left as they were.
260. **Another person's plan is fully view only** (owner on phone 190, 205, 206; carried). In a person tab every tile is read-only even for household meals planned by Sam; eye glyph, dimmed to 0.8, no lock emoji; Add, Hold, cart, stepper, Copy and Clear are not drawn; the cart and bulk figures count only the viewer's own meals.
261. **No blocked hold** (owner on phone 207, 213; carried). A held meal no longer shows a "blocked" state because another meal wants the same ingredient. Desktop's blocked hold came from plan-week-ai 33 (same person). Open question 1.
262. **Household and participants** (owner on phone 201, 208 to 211; carried). Household meals can name who eats them (Salmon patties: Sam, Jane); the audience line reads Household or the names. Proposal: visibility of subset meals (Priya does not see Salmon patties); phone 210 is itself a Proposal.
263. **Header: Copy last week and Clear week as icons, and an in-place Undo chip** (translated from 194, 214; owner on phone). After Copy, Clear, Add or Reserve the button flips to Undo for 14 s, or until something else changes. Proposal: the 14 s.
264. **Clear week by scope** (translated from 195, 196, 203). Mine clears individual meals and one-off Not cooking nights; Household clears household meals. Usual days off stay. Never the past, never another person's plan. Undo.
265. **Five weeks** (owner confirmed on phone, 200). Last week, this week, then three more (next week is where the page opens).
266. **Open night is an open padlock with Ask AI and Surprise me** (owner on phone 187 to 189, 215; carried). Supersedes decision 92 and the dashed outline in 119; only past empty boxes stay dashed. Not cooking is reached by right-click, B or Shift X on the focused night (`aria-keyshortcuts`).
267. **Not cooking day** (translated from 183 to 186). Stays the filled accent block with moon (119, owner). It now also offers Surprise me and Ask AI; Mark as open turns it back into an open night. Surprise me on it cooks the night and removes the block. The Not cooking toast lasts 3 s (155).
268. **Detail, as the phone** (owner on phone 123, 124, 126, 127, 174). One ingredient list (missing first, then on hand), Total time once, Replan and Not cooking not repeated, footer Hold N and Add N with H and L badges, Release once held, Open recipe opens the recipe for the three sample meals. Desktop keeps its key badges.
269. **Week-level actions and indicators** (owner on phone 159 to 161, 168 to 177, 181, 191, 198). Summary: Add N to the shopping list, Reserve N, Release N, each hidden when it does not apply. Under the week title: N of 7 nights, moon count, padlock count; each jumps to its first night and pulses it. A meal that lands in a day lands first.
270. **Today** (translated from 193, 202). T key and "This week" in the week picker scroll to today and pulse it once.
271. **Copy forward and the tear** (translated from 100 to 102, 190a, 118, 158). Past own tiles show one Copy forward icon that opens a menu of the coming 14 days (the original stays). A lifted tile tears its top edge when pulled down and bottom when pulled up; the place it left has the matching edge; reduced motion keeps a fixed tear.
272. **The count is what is in the cart** (owner, 12 to 13 Oct 2026: "it's pretty much what's in the shopping cart"). Tally: Missing (nothing actioned), In the cart, Meals held. Zero missing reads "Nothing missing", never "0 to buy".
273. **One palette for the glance column** (owner, 12 to 13 Oct 2026: the second palette felt jarring). Same tokens as the page, set apart by a border and a 3 px accent top rule. Decision 111 still stands (it reads as a different kind of thing). Proposal: the accent rule.
274. **Ask AI visibly does something** (owner, 12 to 13 Oct 2026: "does nothing when clicked"). A click shows an inline note in the day (or the week slot) that it opens the default AI app and nothing happens inside Kitchie, for 9 s, with a live-region line; the button reads pressed. Proposal: the wording and 9 s. Supersedes the bottom toast.
275. **Less red** (Proposal; owner: "too many reds"). Red now means only: Missing with nothing actioned (tile pill, red names in the detail list, the Missing figure when above 0), the offline sync pill and offline bar. Changed from red to the accent token: tile use-by line, the soon pill, summary use-by badges, "use by ... before Wed" text, drop hints and the soon chip. Summary numerals are neutral; only Missing is red. A missing item already on the list is not red (muted, tick).

### Open questions (realign)

1. Blocked hold (261): desktop's came from plan-week-ai 33. If it should stay on desktop, one flag brings it back (`noBlockedHold`). A wrong guess costs a real double-hold of the same ingredient with no warning.
2. 121 and 122 vs 115 and 116: the phone draws a plain red or green circle; desktop says "Missing feta". Kept desktop. A wrong guess costs retiring the words from the tiles and the headline rules.
3. 156 vs 119: phone Not cooking is muted grey; desktop is the accent block with moon. Kept desktop. Cost: one token swap in `b.css`.
4. The only pointer route from an open night to Not cooking is now the right-click menu and keys (no button, 189). Is that discoverable enough? Cost: a quiet button back is one line.
5. Should B fold Not cooking days away as the phone does (178 to 182)? B draws seven days, so not applied. Cost: a rework of the day stack.
6. Subset-meal visibility (210) is only a Proposal on the phone; B follows it.
7. Reds (275): which of the changed items does the owner want red again?

### What loads (DESIGN.md section 6)

Default path: `theme.css`, `plan.css`, `b.css`, `plan.js`, `b-week.js`, `b-detail.js`, `b-hand.js`, `b.js`, the matching size file; `b-three-1440.js` only at 1440 and up. No images. The Copy forward menu, the tear, the Ask AI note and the jump pulse are built only on use (event handlers, one 9 s timer while a note shows, a 14 s flip timer after an action). Deferred: nothing beyond what was already deferred. Check script: `tools/plan-desktop-b-check.mjs` (108 checks, headless).
