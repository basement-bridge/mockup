# Planning the week, on desktop

Handover for whoever drives this next (status, open questions, next steps, process): [../../handover/plan-desktop.md](../../handover/plan-desktop.md).

Mockup: `fragments/plan-desktop/index.html` (options A to D, each at 1024, 1280, 1366 x 768, 1440, 1920 and 2560). Builds on [plan-week-ai.md](plan-week-ai.md); decisions 1 to 48 there still stand. Everything below is a proposal until the owner confirms (numbers 49 to 62 continue that list).

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
