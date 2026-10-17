# Recipe detail, desktop: Option B, "Three zones"

Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/option-b/index.html
Issue: basement-bridge/kitchie#830. Brief and anatomy: `../notes.md`. Everything below marked **Proposal** is a choice the owner was silent on.

Owner's words this answers: "ingredients you can text wrap, it's a lot of white space wasted" / "notes are also important" / "I don't want to scroll if I can" / "pay attention to ... the history, the serves, and other bits".

## What is drawn

A compact header band, then three zones side by side, nothing else (no bottom bar, no jump row):

| Zone | Contents | Width |
|---|---|---|
| Left rail (card) | Ingredients: Serves stepper on top, then text-wrapping rows (pantry dot, name, quantity flush right, cart on missing rows), "Add all N missing" foot | `clamp(256px, 20vw, 340px)` |
| Centre | Method: numbered steps, timers, step photo thumbnail beside the text (click opens it in place, Esc closes) | the rest |
| Right rail (card) | Everything about us and this recipe: Notes, Cooked (dates, thumbs, remarks), Photos strip, History strip (versions, review, source) | `clamp(288px, 23vw, 420px)` |

Header (64px, one row): back, title (two lines max, full name on hover), time, Notes and reactions pill (counts; label spelled out from 1440), star, edit, Share (S), more, then **Plan it** and **Make it**.

State switcher: the gear button at the foot of the app rail (hidden in screenshots) or the URL: `?r=short|typical|long|notes|cooked|nocooked`, `&t=dark|light`, `&v=kept|trying|away`, `&empty=collapse|keep`, `&sv=unknown`, `&planned=1`.

## Width and breakpoint assumption

`AGENTS.md:181` says no new desktop widths. The owner is asking to rethink the big-screen layout, so this option **is** the request for an exception (to be recorded in `docs/project-plan.md` per `kitchie:AGENTS.md:187`). **Proposal**: the page area is everything right of the 88px app rail, designed for viewports 1280 to 1920, left-anchored and capped at 1600px (free space collects on the right, as the lane rule says). No literal widths beyond the rail: rails are `vw` clamps. Breakpoint: three zones from 1200px up, one fold below (decision 9).

## Design decisions

1. **Plan it / Make it live in the header, right-aligned, Make it primary.** The phone's fixed bottom bar is a thumb-reach device and costs 64px of the height this layout is trying to save. They are the page's two primary actions (RB-D1), so they stay as buttons, never in More. Plan it becomes "Planned Tue" when planned (`?planned=1` and click). Cost: the header is the busiest row (11 controls); see decision 8. A wrong guess costs: the owner wants the actions near the method; the alternative is a 56px strip at the foot of the centre zone (costs method height).
2. **The anchor row is deleted on desktop.** Nothing is hidden and the three zones are always visible, so there is nothing to jump to. This supersedes R-O2 A for desktop only (phone keeps it). Cost: the scroll-spy, the sticky offsets and `scroll-margin-top` rules are not needed in the desktop file; the Photos and Cooked anchors become right-rail blocks.
3. **Serves stepper sits at the top of the Ingredients rail**, above the rows it scales, in the same 44px pill as today. Batch recipes keep "N portions" and the same stepping rule.
4. **The right rail is "us and this recipe".** Notes first (the owner's "notes are important", readable without leaving the page), then Cooked, Photos, History. Notes get the flexible block, so when space is short only the notes list scrolls inside, with the rest pinned. Cook remarks now show under each cook row (today they are only in the Notes flyout).
5. **Notes and reactions pill stays and changes job.** Today it opens a 400px flyout that would now duplicate the rail. At 1200+ the pill is a summary plus a "look here" pulse on the rail (key N). Below 1200 it opens the rail as a lane over the page (the flyout's behaviour). **Proposal**: retire the flyout at 1200+; owner call, see open questions.
6. **Empty right rail collapses (default).** With 0 notes and 0 cooks the rail is not drawn at all (empty is absent), the Method zone takes the width, and what carried a next action moves into one dashed bar at the foot of the centre zone: "Not cooked yet. Cook it once and the thumbs and notes start here" + Add a note + Photos N + History (n versions). Source line moves to the foot of the ingredients rail. The method is capped at 780px so lines and photos do not drift apart: free space goes right. `?empty=keep` draws the alternative (rail kept, compact empty rows) so the cost is visible: about 440px of an empty card.
   Partial emptiness: 0 notes but cooked, the Notes block shrinks to one line plus Add a note (`?r=cooked`); not cooked but notes exist, the Cooked block shrinks to one sentence.
7. **Short recipe (roomy mode).** Defined as 5 or fewer ingredients and 3 or fewer steps (server-known at render time). The ingredients card hugs its content and the banner photo fills below it; step photos go full width under each step (height 19vh, 96 to 220px). With no history the rail collapses as in decision 6. Cards hug their content on every recipe so a card never shows an empty lower half.
8. **Header at 1280.** The pill drops its words below 1440 (counts and an accessible name stay), the back arrow drops "Recipes" below 1440, the title takes two lines. At 1280 the title still has about 300px.
9. **Three zones survive at 1280; they fold below 1200.** At 1280 the centre is about 550px (method text 15.5px, 64ch max). Below 1200 (1024 to 1199): Ingredients left (244px), Method centre, and the right rail becomes a 360px lane over the page, opened by the pill, closed by an x or Ctrl/Cmd+Enter (the Notes flyout pattern). Phone and tablet are untouched.
10. **Long recipe: only inner columns scroll.** Page and header never scroll. Ingredients and Method scroll independently (group headings stick inside the ingredients column), fade cues show more above or below; the Serves stepper, the Add-all foot and the section heads stay put. Measured below.
11. **Versions and state.** The version strip is the History strip's chips (horizontal, own scroll), with the usual star and the review dot. Trying and Put away draw a 40px band under the header with Keep it / Bring back (`?v=trying|away`); the review line is the "To review" tag in History, not a red band.
12. **Photos.** Banner is not a hero. It is the first tile of the Photos strip; "loaded last" still holds (it is the last thing in the DOM order after text and step photos). In roomy mode (7) it is drawn once, in the left card. "Show all" swaps the rail body to a 3-column grid in place (Back returns). Cook photos stay on demand.

## Where the extras go

| Anatomy element (notes.md section 1) | Where in Option B |
|---|---|
| 1 App rail | unchanged, 88px |
| 2 Back | header, left; label from 1440 |
| 3 Title | header h1, 2-line clamp, replaces the "title appears on scroll" behaviour (always visible) |
| 4 Notes and reactions pill | header; summary and focus at 1200+, opens lane below 1200 |
| 5 Star | header |
| 6 Edit pencil | header (E); section pencils kept in the Ingredients and Method heads |
| 7 Share | header, pill with S |
| 8 More | header |
| 9 State band | 40px band under header (only when not Kept) |
| 10 "Assistant changed this" | "To review" tag in History strip |
| 11 Banner | first Photos tile; left card in roomy mode |
| 12 h1 and "photo of X" line | header; the inherited-photo line is not drawn (not solved) |
| 13 Version pills | History strip chips |
| 14 Meta: time, Serves | time in header; Serves top of Ingredients |
| 15 "From parent . History" | History strip footer line and "Open ," link |
| 16 Proof band | Cooked block (dots, favourite tag, member chips); collapses to the foot bar when empty |
| 17 Version strip | History strip chips (no longer sticky, no longer 48px of header) |
| 18 Anchor "tabs" | deleted (decision 2) |
| 19 Ingredients | left rail |
| 20 Method | centre |
| 21 Notes | right rail, top, flexible |
| 22 Cooked | right rail, with remarks and verdict thumbs |
| 23 Photos | right rail strip, grid in place |
| 24 Where it came from | History strip line; left rail foot when the rail is collapsed |
| 25 Plan it / Make it | header (decision 1) |
| 26 Notes flyout | retired at 1200+ (proposal); lane below 1200 |
| 27 Share panel, 28 Edit panel | unchanged (right lane, one flyout at a time). At 1280 a 400px lane covers the right rail; the lane pushes nothing |
| 29 Toasts and sheets | unchanged |

## Measured (Playwright, headless Chromium, `screenshots/measure.py`)

Horizontal scroll: 0px in every state and size. Page vertical overflow: 0px in every state and size (the layout is viewport height by design, so the page itself never scrolls; below 560px tall it falls back to a page scroll). Inner scroll, in px of hidden content, dark and light identical:

| State | 1440x900 | 1280x720 | 1920x1080 |
|---|---|---|---|
| typical (10 ing, 6 steps, 2 notes, 3 cooks) | none | none | none |
| long (24 ing in 3 groups, 14 steps) | ingredients 372, method 360 | ingredients 581, method 557 | ingredients 223, method 376 |
| notes (5 notes, 4 cooks) | notes list 186 | notes list 280 | none |
| short | none | none | none |
| not cooked, 0 notes (rail collapsed) | none | none | none |
| cooked, 0 notes | none | none | none |

So "typical fits with nothing scrolling" holds at 1280x720 and up. The five-notes case scrolls inside the Notes block only (about three notes visible at 1280x720). At 1920x1080 type and photos step up a notch (`min-width:1700 and min-height:1000`).

## Costs and buys

Buys: one glance shows ingredients, method and the whole history (the owner's notes concern); no jump row, no sticky stack, no bottom bar; ingredient white space gone; short and typical recipes never scroll.
Costs: the header is busy; the centre is only about 550px at 1280 (steps wrap, thumbnails are 136px); three independent scroll regions on long recipes (wheel scrolls the one under the pointer); the right rail pushes History, Cooked and Photos to small type and small thumbs; a collapsing rail means the layout changes shape after the first cook (the page rearranges when notes or a cook are added), which may surprise; at 1280 an open Share/Edit lane (400px) covers the right rail.

## What the default path loads and what is deferred

Server-drawn and complete without script (the mockup draws from a data file only because it is static; the build keeps the server page). Default path: page markup, `theme.css` (two default themes), the mockup's `rd.css` (about 20KB, would be the desktop-only recipe file) and, in the mockup only, `rd.js` and `rd-data.js`. Deferred as today: photos (text first, step photos, banner last, gallery and cook photos only on "Show all"), Share, Edit and Plan panels on first use. No new request at load; no new script for desktop beyond what `recipes-desktop.js` does. Build rule `kitchie:AGENTS.md:188`: this CSS goes in a desktop-only file, not `css.ts`.

## Differences from the build's markup and class names

Class names reused: `.rtab .top .back .ib .bare .mc .ro .serves .ing .nm .q .dot .miss .unk .stp .nb .timer .psp .pf .prep .pprep .note .inh .from .hist .d .t .pgrid .pmore .src .band .mini .ico .hint .tg .lbl .rb-notesbtn .rb-pillcnt .rb-react .rb-rc .rb-av .rb-th .rb-dots .rb-dot .shr-chip .shr-n .kbd .btn .ghost .sm .x`.
Differences (the build would add or change):
- New: `.rd` wrapper with `data-right="on|none"`, `data-fit="std|roomy"`, `data-open`; zones `.rd-zones .rd-z .rd-l .rd-r .rd-c`, blocks `.rd-nb .rd-cb .rd-pb .rd-hb .rd-foot .rd-banner .rd-pgrid`, `.zh .zs .zb .zf .grp .cnt`. The server decides `data-right` (0 notes and 0 cooks) and `data-fit` (5 ingredients and 3 steps or fewer).
- The page is one `<form method=get>` today; here the Serves stepper and version chips are buttons, the form wrapper is unchanged in intent.
- `.top` is one row with title, time, pill and Plan/Cook (today Plan/Cook is `.act`, a bar). The `.jumps` nav and `#vstrip` sticky strip are not drawn on desktop.
- Hooks the in-place swap needs (`#rtab h1`, `.top a.back`, `[data-notes]`, `[data-note]`, `#t-notes-fly`, `.sheet`) are all present except `#t-notes-fly`, which a 1200+ build would not need under decision 5. Not tested against `recipes-browse.js`.
- Mockup-only: the gear control, `rd-data.js`, colour blocks for photos.

## What is NOT solved or only reasoned

- **Data gap: ingredient groups and step groups** (Lamb, Beans, Salsa verde) are dropped by `types.ts` and `client.ts` today; the long state draws them as the wire could carry them (`../notes.md` 3.2). Without the data change the long recipe is one 24-row list with no group heads, and the sticky heads in decision 10 disappear. Also not carried: prep vs cook minutes, equipment, dietary tags.
- Cook remarks beside each cook row need no data change (already in `cooks[].line`), but "N ate" and verdicts are shown from the same fields.
- Real photos: all photos are colour blocks, so how thumbnails crop (`focus_y`) at 136x76 is not seen. The "photo of X until this version has its own" line is not drawn.
- Not tested: keys N, S, E, comma against `desktop-keys.js` (N is wired in the mockup only); the in-place browse swap; screen reader order of the three zones (DOM order is Ingredients, Method, History); the Plan it day-picker flyout (#757) beside this header; stock unknown (`?sv=unknown` hides dots and cart buttons, not screenshotted).
- Heights: tested 720, 900, 1080 only. 768 and 800 tall (1366x768, 1280x800), 2560 and 1024 wide were not screenshotted. 1100x760 (fold below 1200) was looked at once.
- Very long titles (70+ characters) clamp to two lines in the header (checked with the 51-character lamb title only).
- A recipe with 10 ingredients but 12 short steps, or 30 ingredients, would scroll inner columns; the rule for "typical" is the two samples above.
- Wheel and keyboard scrolling on three inner regions was not tried with real devices; focus order inside scroll regions is untested.
- Phone layout is untouched; not re-checked (no file outside this folder changed).
