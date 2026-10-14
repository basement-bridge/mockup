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
118. **Unplanned day: "Surprise me" and "Ask AI"** (owner). The app proposes a meal from heuristics (94). On a planned meal these are not persistent buttons: Replan clears the meal, then the open night offers both ("Meal cleared. Fill this night?"). Ask AI follows 95's wording and is scoped to the night; Proposal: B drops the header "Open your assistant" button (95 votes against a persistent assistant control) and keeps key A scoped to the day in view. **Open question: does Surprise me lock the proposal in, or show it to confirm first?** Both are drawn (`?surprise=confirm`); lock-in with undo is the default. **The picking rule is the Home cooking-ideas engine (292), not 94's own heuristics.**
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
- Chat tools and the UI call the same service methods (`plan_remove_meal` Replan and release hold, `plan_block_day`, `plan_reserve`, `plan_add_missing_to_list`); Surprise me needs a service method that does not exist yet: it is the Home ranking (`rank()`, decision 292), not separate heuristics.
- Drop-in cue (156): CSS-only animation on `.mcw.dropped` plus a few lines in `b.js`. Default path adds no files, no images and no timers until a tile changes; the one timeout (1.5s) runs only while a cue shows. Deferred: nothing needed.
- Default path: `theme.css`, `plan.css`, `b.css`, `plan.js`, `b.js` plus the matching size files; `b-three-1440.js` only at 1440 and up. No images.


## Option B realigned with the phone Plan (14 October 2026, decisions 259 to 275)

Owner, 14 Oct 2026, typed: "given the changes to mobile ... realign the web now based on the key decisions and overall desktop design language". Kept from desktop: agenda | detail | week at a glance, persistent right-hand icons, one status per tile, Pantry master-detail, desktop breakpoints, key shortcuts. Not copied: swipe, bottom sheet, long hold (translated per the touch-to-pointer table, or marked not applicable). Options A, C and D are untouched; every B-only behaviour sits behind `layout` flags and hooks in `plan.js` or in B's own files.

### Carry-over audit (phone decisions 153 to 215)

Counts: **14 carry over, 9 translate, 6 not applicable, 2 conflict** (31 rows). **Corrected 14 Oct 2026 (owner, same day): row 31 was a misread, not a conflict, so the count is 14, 9, 6, 1 conflict and 1 misread; row 2 (blocked hold) is settled by decision 276.** The rows below are kept as they were recorded.

| # | Phone decision | Class | On desktop B |
|---|---|---|---|
| 1 | Who can act; another person's plan fully view only (190, 205, 206) | Carry over | Eye glyph, tiles dimmed, no icons, no Hold, Add or stepper, no week buttons (260) |
| 2 | Blocked hold dropped (207, 213) | Carry over | Hold never shows a blocked state (261). **Settled 14 Oct 2026 (owner): phone wins, a hold never blocks; decision 276** |
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
| 31 | Not cooking in muted grey (156) | ~~Conflict~~ **Misread** | Desktop 119 (owner): filled accent block with moon. Kept desktop. **Corrected 14 Oct 2026 (owner): plain grey is for past days only, not for Not cooking; there was no conflict (decision 280)** |

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

1. ~~Blocked hold (261)~~ **Resolved 14 Oct 2026 (owner): the phone behaviour wins, a hold never blocks (276).** The flag `noBlockedHold` stays on for B; A, C and D, not the chosen base, still carry the old guard.
2. 121 and 122 vs 115 and 116: the phone draws a plain red or green circle; desktop says "Missing feta". Kept desktop. A wrong guess costs retiring the words from the tiles and the headline rules.
3. ~~156 vs 119~~ **Closed 14 Oct 2026: a misread, not a conflict (owner: plain grey is for past days only). The look is unchanged (280).**
4. The only pointer route from an open night to Not cooking is now the right-click menu and keys (no button, 189). Is that discoverable enough? Cost: a quiet button back is one line.
5. ~~Should B fold Not cooking days away as the phone does?~~ **Closed 14 Oct 2026 (owner: "desktop is fine as is"): Not cooking days stay full size, no collapse (281).**
6. Subset-meal visibility (210) is only a Proposal on the phone; B follows it.
7. Reds (275): which of the changed items does the owner want red again? **Still open for the owner; 14 Oct 2026 the same logic was applied to the phone (278), so the question now covers both.**

### What loads (DESIGN.md section 6)

Default path: `theme.css`, `plan.css`, `b.css`, `plan.js`, `b-week.js`, `b-detail.js`, `b-hand.js`, `b.js`, the matching size file; `b-three-1440.js` only at 1440 and up. No images. The Copy forward menu, the tear, the Ask AI note and the jump pulse are built only on use (event handlers, one 9 s timer while a note shows, a 14 s flip timer after an action). Deferred: nothing beyond what was already deferred. Check script: `tools/plan-desktop-b-check.mjs` (108 checks, headless).


## Replan cleanup, one detail order, less red on both platforms (14 October 2026, decisions 276 to 281)

Owner, by voice, 14 Oct 2026 (six decisions, each **owner, 14 Oct 2026**). Mockup-first, applied to desktop option B and to the phone Plan (`fragments/plan-ui-review/phone.html`, same decisions in [plan-ui-review.md](plan-ui-review.md)). A, C and D are untouched. Kitchie is not modified. Screenshots: `docs/screenshots/plan-replan-cleanup-14oct/` (before and after, light and dark, 1024 to 2560 and 390).

276. **A hold never blocks, and Replan lets it go (owner).** The phone behaviour wins. Replanning a held meal removes the hold entirely and releases the held ingredients; no guard-rail, no confirm step (undo exists, 59). This drops desktop decision 92's blocking guard (and plan-week-ai 33) for B and the phone, and settles open question 1 of the realign. B keeps the flag `noBlockedHold` on, so no blocked state is reachable; A, C and D (not the chosen base) still draw the old guard behind the shared flag. The undo toast names what was released ("Its hold is released: eggs, tomatoes, onion back in free stock."); the detail says "Replan or Not cooking also releases this hold." under the list, only while held. Two meals may hold the same ingredient; replanning one releases only that meal's hold.
277. **Replan also undoes that meal's own footprint on the shopping list, while it is unbought (owner).** For each ingredient the meal caused to be added, only that meal's amount comes off the line. A line that reaches zero is removed; if other meals still need some it stays at the reduced amount (owner: "it stays on the list, but whatever your automatic amount would have been for what got removed is the one that gets dealt with"). Once bought (in Pantry), replanning never touches the list. Shown in the existing undo toast, so Z undoes it, and the "In the cart" tally stays live. Sample on desktop: **feta** is on the list for Shakshuka alone (replan: "feta 100 g taken off, nothing else needs it"); **lemon** is on the list for both Thursday meals, 1 for Salmon patties plus ½ for Tuna salad (replan Tuna salad: "lemon 1½ down to 1"; replan Salmon patties: "1½ down to ½"; replan both: taken off); **chicken thighs** were bought Fri 9 Oct for Chicken curry (replan: "Already bought, left alone: chicken thighs"); **milk** was added by hand and nothing touches it. Proposals where the owner was silent: (a) a line is derived, not stored: the sum of each meal's automatic amount (desktop: quantity per person times people, decision 10; phone: the meal's own quantity), for items missing, not bought, and added for that meal; (b) the same cleanup runs for Not cooking on a meal (Shift X, swipe), a Not cooking day with meals, and Clear week, because they remove meals the same way (he said Replan); (c) a copied meal does not copy its list flags; (d) a need that was never added stays Missing, so if lemon was added for one meal only, replanning it removes the line even if another meal still needs lemon unactioned; (e) a stand-in "Shopping list" (rail Shopping button on desktop, nav Shopping on the phone, `?shop=1`) shows every line with the meals behind it and a Bought button that moves a line into Pantry, so the cases can be tried; the rail and nav badge is the number of lines. Open: if a person hand-edited a line's amount, only the automatic amount of the removed meal is taken off (not drawn; the mockup has no editable amounts).
278. **Red only for urgent or blocking, on both platforms (owner).** Same logic as 275, now also on the phone. **Desktop, unchanged from 275 and still red:** Missing with nothing actioned (tile pill, red names in the detail list, the Missing figure above 0), the offline sync pill and bar. **Desktop, went back to red:** a refused drop ("not allowed"), which is blocking (class `dh-hint no`; "after use-by" stays accent as a warning). **Phone, changed from red:** the swipe-left Replan reveal (routine, one tap to undo; now the accent), the filled "use by today" chip and the "use first" text in the alternate status modes (now accent, as desktop). **Phone, deliberately left red:** the missing dot under a date and in the day ribbon (121), the tile's status circle (122), the missing ingredient name (123), all owner-stated; the red outline of a refused drop; the missing markers of the alternate status modes (`?st=`). Use-by in the list was already accent. Open: which items the owner wants red again (275's question), now for both.
279. **One order in the meal detail, the phone's (owner direction; the choice of order is the design agent's).** Order: (1) who and when, with close, and on the phone the tile (the meal, who, status glyph, the ... menu); (2) the one status, the phone's glyph and desktop's words, in the same place; (3) where it comes from (made up, Surprise me, modified, leftovers) and Open recipe (the phone's ... menu, a link in this block on desktop); (4) Total time, then the meal's note (phone sample data only); (5) a view-only or past line; (6) who is eating (People); (7) one ingredient list, missing first (red until on the list), a hairline, then on hand with use-by; (8) the hold hint, only while held; (9) the footer, Hold N and Add N (past: Copy forward). Why the phone's: owner decisions 123 (one list), 124 (Total time at the top), 126 (the footer is Hold and Add; Replan and Not cooking not in the detail) and 127 (Open recipe in the menu) fixed most of it there. Audit: the phone already matched; desktop changed in three places: it had no status in the detail (added), it put Total time before the source block (now after) and the view-only line before Total time (now after), and its hold hint sat below the buttons (now above them). Touch-to-pointer: the tile's status glyph and ... menu become the status words and the Open recipe link; the bottom-pinned footer stays a footer; the swipe and long-hold gestures stay out of the detail. **Not reordered because an owner decision fixes it:** Open recipe stays in the phone's menu (127); the footer stays last (126); the phone's red or green circle and desktop's words stay as they are (121, 122 vs 115, 116, open question 2). Open: Open recipe as a link in the top block on desktop; "Made up by your AI" (phone) and "Made up by your assistant" (desktop, decision 42) are still two wordings.
280. **Not cooking colour: plain grey is for past days only (owner clarified).** The PR #180 audit row 31 (phone 156 against desktop 119) was a misread, not an open conflict. Desktop keeps the filled accent block with the moon (119). The look is unchanged on both platforms. Open, not decided here: phone 156's text still says Not cooking uses the past-day grey; whether the phone's Not cooking should now follow desktop's accent is not asked and not changed. A wrong guess costs one token swap in `phone.css`.
281. **Not cooking days stay full size on desktop (owner: "desktop is fine as is").** No fold-away; closes open question 5. The phone's folding (178 to 182) is unchanged.

**Still open, not decided here:** how a mouse user reaches Not cooking from an open night (only right-click and keys today, realign question 4; a quiet button back costs one line).

### What loads (DESIGN.md section 6), 14 Oct, replan cleanup
Same default files as before. Desktop B (`theme.css`, `plan.css`, `b.css`, `plan.js`, `b-week.js`, `b-detail.js`, `b-hand.js`, `b.js`), concatenated, gzip -9, KB = 1000 bytes: main (a051384) 157.09 KB raw, 47.18 KB gzipped; this branch 166.50 KB, 50.14 KB (up 9.4 raw, 3.0 gzipped). No new files, no images. The Shopping list stand-in is built only when the rail button is pressed (`?shop=1` opens it); the list lines are derived on use; nothing new runs on load.

### For the implementation
- The list is derived from the meals (their per-meal added flags and automatic amounts), not stored separately; Replan, Not cooking and Clear then take their amounts off by construction. In the real app the shopping list needs to remember which meal caused each line amount. Chat tools and the UI call the same service methods (`plan_remove_meal` must release the hold and take the meal's amounts off unbought lines; bought lines are never touched).
- Checks: `tools/plan-desktop-b-check.mjs` (154), `tools/plan-ui-replan-cleanup-check.mjs` (66, phone).


## An empty week asks once; hold everything and the week tools in the gutter (14 October 2026, later, decisions 282 to 286)

Owner (Arjan), by voice, 14 Oct 2026, relayed by the coordinating agent. **Owner, 14 Oct 2026** marks his words; **Proposal** marks the design agent's choices where he was silent. Desktop option B only; A, C and D are untouched. Mockup: `fragments/plan-desktop/b.html` (`?state=empty` is the empty week, 19 Oct; `?wkfill=card|header|gutter` switches the placement). Screenshots: `docs/screenshots/plan-whole-week-14oct/`. Check: `tools/plan-desktop-b-check.mjs` (220 checks, sections S to V).

282. **Hold everything for the week, in the permanent right-hand gutter, same as the phone (owner: "same behavior as what we have in mobile, it's just done in that permanent right-hand side gutter").** The phone's week-wide hold is **Reserve N** (Plan UI review 159 to 161, 172 to 177, 180): it holds every on-hand ingredient of every meal from today on that is not already held, as the same Held state the per-meal Hold sets; it reads **Release N** once everything on hand is held (a mixed week stays Reserve, 180); it flips in place to the Undo chip for 14 s (decision 214), then becomes Release. **Desktop B already drew exactly this** in the gutter, directly under "Add N to the shopping list" (269), so no new button is added; this decision confirms it is the action he asked for. Changes: its tooltip and screen reader label now say "hold everything" ("Hold everything on hand this week, same as the phone's Reserve"). **Not held back for another person's plan** (view only, no bulk group) and not for last week. Open: the label. The phone says Reserve and he said "hold everything"; the label stays Reserve until he says (copy only).
283. **An empty week asks once, for the whole week (owner: "too much repetition").** When the week has **no meal at all** as the person filter shows it (a week with only Not cooking nights counts as empty, as the phone's curtain does, 96), the per-night **Surprise me** and **Ask AI** are not drawn on any night. One whole-week **Surprise me** and **Ask AI** are drawn instead (284). **As soon as even one night has a meal, by any route** (a drop, Surprise me, Copy last week, a Replan that leaves another meal, an Undo), **the per-night pair returns on the nights still open**, and the whole-week action is gone. The whole-week **Surprise me plans every open night from today on** in one step (a meal each, none repeated, the same picking rule as the per-night button: the Home engine, 292, and its Plan ahead lens for the whole week) with one Undo (toast, Z, and an Undo chip in the gutter for 14 s). It **never includes a Not cooking night** (a one-off mark, or a usual day off from Settings: both read as "blocked") **nor a past night**, and says so in the card ("Fri (usual day off) is Not cooking, so left out.") and in the toast. The whole-week **Ask AI** hands off to the default AI app for the week (decisions 42, 45: nothing happens inside Kitchie) and its note says "Open nights only" and names the nights left out. Proposals: (a) the night that was just cleared by Replan keeps its own "Meal cleared. Fill this night?" with its own two buttons even when the week is otherwise empty, because that is the next step for that night; (b) in `?surprise=confirm` mode the whole-week fill still plants meals directly (with Undo) rather than showing seven proposals; (c) the Not cooking night keeps Mark as open in an empty week (not Surprise me or Ask AI); (d) an empty week with nothing left to fill (every night past or Not cooking) draws no card and keeps the per-night lines on the Not cooking nights; (e) another person's plan and last week never show the card.
284. **Placement of the whole-week pair: three drawn, recommendation: the card (Proposal; he left it to me).** (1) **`?wkfill=card` (default, recommended): an empty-state card at the top of the agenda**, under the week title and indicators and above Monday: "Nothing planned this week", the open nights and what is left out, then Surprise me, Ask AI and a quiet Copy last week. Why: it sits where the eyes are on an empty week, it works at every width (the gutter tucks behind a meal below 1440 and the card does not), and it is the one place that can name the nights. (2) `?wkfill=header`: the two buttons on the indicator row next to "0 of 7 nights"; compact, always visible, but no room to say what is left out and it crowds at 1024. (3) `?wkfill=gutter`: a "Plan the whole week" block in the gutter in place of the empty hint; consistent with the other week actions but out of sight when a meal is open at 1280 and below. In every placement the gutter hint says where the buttons are. **Copy last week and the empty week:** it is offered inside the card as the quiet third action (a copy is the likelier wish after a normal week), fills open nights only and never overwrites, skips Not cooking and past nights (99), then the week is partly filled and the per-night lines return for the nights it did not fill. Cost of a wrong guess: one switch value.
285. **Copy last week, its Undo and Clear week are also in the gutter, carried over from the phone (owner: surfaced in the right-hand gutter).** A "Week actions" group in the gutter holds labelled **Copy last week** ("open nights only", decision 99) and **Clear week** (the scope in words, "my plan, from today" or "household, from today": 203, 211, so a destructive action names its scope). Each flips in place to the same small Undo chip (214, 14 s, 130) and, because it is one state, the header icon flips at the same time; Z and the toast work as before. Clear is not drawn when nothing is left to clear (168's rule: drawn only when it applies); neither group is drawn for another person's plan (190) or last week (113). Translations: touch to pointer: the phone's header icons stay in the header (263), the gutter adds the labelled versions, keys C and Shift C unchanged. Proposal: the header icons stay (they are the only copy when the gutter tucks behind an open meal below 1440, and the checks and key hints rely on them); if he wants one place, delete one (cost: one call in `headTools` or `weekToolsHtml`). **Open, not invented: he mentioned "a cog for selecting which of the ..." and trailed off.** Not drawn. The existing cog is Settings, usual days (S). What the cog should select is a question for him (which week to copy from? which people's meals to clear or copy? which of the gutter actions to show?). Cost of a wrong guess if guessed: a control with no meaning.
286. **The "just dropped in" cue (156) is confirmed as it is; nothing changed, and the new actions were checked against it (owner).** Whole-week Surprise me, Copy last week (card or gutter), Undo of a Clear and Undo of a fill all add or restore tiles, so every such tile drops in and washes (1.5 s, reduced motion: a static wash); verified for 6 tiles after the fill and 4 after the copy. Reserve and Release change no tile's content (only the hold), so they trigger nothing, as the per-meal Hold does not. Undo of a fill removes tiles, so nothing drops.

### Open questions (new)
- What the cog does (285): not drawn.
- Reserve or "Hold everything" as the word (282): copy only.
- Placement (284): card recommended, header and gutter drawn.
- Header icons and gutter buttons both draw Copy and Clear (285); keep both or one place.
- The just-cleared night keeps its own pair in an empty week (283a).
- Confirm mode for the whole-week fill (283b).

### What loads (DESIGN.md section 6)
Same files as before; no new file. Raw size up about 4 KB (about 1.2 KB gzipped) on the branch: the empty-week helpers, the week tools and 14 CSS rules in `b-week.js`, `b.js`, `b.css`. Nothing is fetched or deferred; the card and the gutter block are built only when the week is empty or the gutter is drawn.

## Copy last week and Clear week at the top only when the gutter is not seen (14 October 2026, owner, decision 287)

Owner (Arjan), by voice, 14 Oct 2026: "we don't need the top copy the week and clear, because that's already in the gutter ... only if the gutter is not seen, then those two things are at the top." Status: **owner, 14 Oct 2026**. Desktop option B only. Mockup: `fragments/plan-desktop/b.html`. Check: `tools/plan-desktop-b-check.mjs` (230 checks, section W).

287. **One set of Copy last week and Clear week on screen, never two (owner).** They live in the right-hand gutter (285). The copies at the top (the two header icons, and the quiet Copy last week in the empty-week card) are drawn **only while the gutter is not on screen with the Week actions in it**. Same Undo chip, same behaviour, same keys (C, Shift C, Z): one code path (`copyWeek`, `clearWeek` in `b-week.js`), only visibility changes. How: `lanes()` in `b.js` adds `gut-on` or `gut-off` to `.app`, from what it actually rendered (the Week actions group is in the glance body); one rule in `b.css` hides `.wktop` under `.gut-on`. No size rule in shared code: the width where the gutter is beside the agenda comes from the existing size files (`b-1440.css`, `b-three-1440.js`). Results: 1440 and up, the gutter is always beside the agenda, top hidden, also with a meal open. 1024 to 1439, nothing picked or the summary peeked from behind a meal: the summary is the lane, top hidden; a meal open: the summary is tucked behind the detail, top icons shown. Where the gutter does not carry the actions (an empty week, whose gutter points at the card; last week and another person's plan, where the gutter has none), the top copies stay, so the action is never lost. **Dismissed gutter:** B has no dismiss control for the gutter today; the rule reads the rendered state, so any future dismiss shows the top copies with no further change. **Proposal:** the empty-week card's quiet Copy last week follows the same rule (it is a top copy). Cost of a wrong guess: one class.
292. **Surprise me is the Home cooking-ideas engine, not its own heuristics (owner, voice, 14 Oct 2026; settles and clarifies 94, 118 and 283).** Owner: Surprise me must not hand off to an AI assistant (only Ask AI does); it uses the same rule-based heuristics as the Home cooking-ideas pane, "so the same logic holds everywhere". **The Home engine (Kitchie `server/src/recipe-tab/ideas.ts` `rank()`, signals from `ideas-signals.ts` `gather()`) is the single source of truth. The mock pool (`POOL`, `SIG` in `plan.js`; `SUR` on the phone) is sample data only.** Read side by side, 94 and Home **agree** on: plan in app, no AI, prefer what is in the house, never an obvious repeat. They **conflict** in four ways that changed what is drawn, and Home wins each: (a) **the shopping list is not a signal.** 94 let Surprise me use items already on the list; Home gathers the list (`onList`) and never scores it (readiness is Recipe's missing count against stock). The phone's "the lemons are already on your shopping list" line and its on-list lemon are gone. (b) **There is no early-week or late-week switch.** 94 suggested something new early in the week and reused stock late (mock: today, tomorrow or Fri to Sun = on hand); Home scores readiness the same every day (all in +3, needs 1 +1, needs 2 +0.01, 3 or more -2), so on-hand meals lead on any night unless another signal outweighs them. (c) **Recency is Home's, not 7 days either side.** Filtered out: already on the plan from today on in the week in view; cooked 2 days ago or less. Scored: 4 days or less -2; 2 weeks +1; a month +2. (d) **More signals than 94 named:** use-by of 3 days or less (+3 at 1 day or less, else +2 per ingredient, capped at 4), star +1, weeknight minutes (30 or less +1, over 60 -2). Only ideas scoring above 0 are offered; the pick is the top one (ties: fewer missing, then longest since cooked). Not drawn (no sample for them): food rules (avoid and cap filter, like and dislike weigh), the Lean towards setting, and the Not tonight snooze; the real build reads them from the same service as Home. **The whole-week Surprise me (283) is Home's Plan ahead lens:** one ranked pool, a different idea for each open night, ideas that use something due go on the earliest nights, and a night with no idea left stays open (the toast names it). **Unchanged and kept:** lock in with an Undo (toast, Z, chip) and the drop-in cue (156) is the default; `?surprise=confirm` still shows the proposal first (Another / No thanks) and **the lock-in or confirm question (118) stays open**; Ask AI is the only hand-off (42, 45). **The no-idea state (Proposal):** when nothing scores above 0 the night stays open, nothing is planned, nothing is pushed to Undo, and a toast says "Nothing fits from what is in. Try Ask AI." (Home's wording; `?surprise=none` draws it). Proposals: (i) a proposal's one-line reason is Home's own line (strongest positive reason, then "all in" or what is missing), for example "Uses chicken thighs before it goes · all in"; (ii) in confirm mode, Another past the last idea says "No other idea fits from what is in. Try Ask AI." and keeps the current proposal; (iii) weeknight is the night's own weekday (Home uses tonight), Mon to Fri; (iv) readiness is read against stock today, not projected to the night. **Open (not asked):** (1) whether to keep 94's stricter "nothing from the last 7 days" on top of Home's filters; a meal cooked 5 to 7 days ago can now come back, and a wrong guess costs a repeat within a week; (2) whether Surprise me follows the person's Lean towards (Tune) or always Balanced; (3) whether a night's pick should reserve what the week's other meals already hold (Home does not), a wrong guess costs a pick that shortens another meal; (4) 118, lock in or confirm. Files: `plan.js` (`rankIdeas`, `pickSurprise`, `planAhead`, `SIG`), `b-week.js` (`fillWeek`), `b.js` (`?surprise=none`). Supersedes in part 94 (shopping list, timing) and the "mock heuristic is 94's" sentences in 118 and 283.

**Tile audit (owner's worry that tile buttons went missing).** Decision 115 lists four persistent icons: Hold or Release, Replan, Remove and not cooking, Add missing to list (drawn only when something is missing, 116). Checked headless at 1440 on the 12 Oct build (decisions 110 to 120) and on this build: every tile has Hold or Release, Replan and Remove and not cooking; Add missing is on every tile that has a missing item not yet on the list. Nothing was dropped; the only change since 12 Oct is that Salmon patties and Tuna salad show lemon as On the list (276 sample), so their Add missing counts are lower.

