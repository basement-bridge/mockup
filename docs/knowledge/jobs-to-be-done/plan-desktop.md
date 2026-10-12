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
