# Recipe detail, desktop: Option E, "Hero strip + balanced columns"

Mockup, not built, nothing here is settled. Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/option-e/index.html
States: `?r=short|typical|long|notes|cooked|nocooked` (dark and light from the small Theme button; the States button, bottom right, lists them too). `?lane=1|0` forces the Notes lane. `?n=` sets Serves.
Brief and anatomy numbers (#1 to #30) refer to `../notes.md` section 1. Owner's words: Kitchie issue #830 (single page scroll today; ingredients short, method needs room; notes with ingredients on the left; do not waste white space; handle history, serves and the other bits).

## Width and breakpoint assumption (Proposal)
Designed for 1280 to 1920 wide and 720 to 1080 tall, desktop only (64rem and up, the rail layout). The rail stays 88px. The page takes all the width beside the rail (no 736px cap) and the Notes lane (400px) pushes it from 1500px up, covers it below. `AGENTS.md:181` says no new desktop widths; the owner is explicitly asking to rethink big screens, so this uses the width, but it needs the owner's yes and a line in `docs/project-plan.md` (kitchie `AGENTS.md:187`). Wrong guess costs: the whole page is a different layout path from phone, see "Costs". Phone and tablet are not drawn and are unchanged.
Three CSS-only size rules, all in the one desktop file: `max-height:800px` (laptop, tighter rows), `min-height:960px` (spend slack on photos and type), `max-width:1399px` (drop the dot strip and "From Original" in the hero).

## Measured fit (headless Chromium, Playwright, light and dark identical)
Horizontal scroll: none in every state and size (36 runs). Vertical overflow is measured on the one scroll region (`.rbody`); the page itself never scrolls (hero and view bar stay put).

| State | 1440x900 | 1280x720 | 1920x1080 |
|---|---|---|---|
| typical (10 ing, 6 steps, 3 versions, 1 note, planned) | 0 px | 0 px | 0 px |
| long (24 ing in 3 groups, 14 steps) | 0 px | 0 px | 0 px |
| notes (typical + 5 notes) | 0 px page; the notes block scrolls inside, 212 px hidden | 0 px page; notes block scrolls, 319 px hidden | 0 px page; notes block scrolls, 90 px hidden |
| short (2 ing, 2 steps) | 0 px | 0 px | 0 px |
| cooked / nocooked | 0 px | 0 px | 0 px |

So: typical and long fit with no scrolling at both required sizes. The one place that scrolls is the Notes block when there are more notes than the space left under the ingredients (decision 6); the lane always shows them all. Hero is 113 to 123 px (long title: up to 145 px), view bar 44 to 48 px.
Screenshots are in `screenshots/` (typical, long, notes, short at 1440x900, 1280x720, 1920x1080, dark and light; cooked and nocooked at 1440x900 dark). The measuring script was a throwaway in the scratchpad, not committed.

## Decisions
1. **One hero strip is the only "about" and "do" place.** Back, photo thumbnail (96px; 84px under 800 tall), title (2 lines max), time, Serves stepper, "History" (key `,`), the proof line, and the actions: star, edit, Share pill with S, More, Notes and reactions pill with N, Planned/Plan it, Cook it. Two rows, about 120px. Nothing about the recipe or what to do with it appears elsewhere on the page, so there is one place to look.
2. **Photo.** The recipe photo, else the first step photo with a small branch badge ("until this recipe has its own"), else a plain tile. Thumbnail only; the big banner is gone (it was loaded last and cost 16:9 of height). Click opens it larger (not drawn).
3. **Fixed bottom bar removed.** On the rail layout it sits at the viewport bottom and costs about 64px of the scarcest axis. The hero is always on screen (the body is the only scroll region), so Plan it and Cook it are always reachable, nearer the title, and the bar's job moves up with nothing lost. Cost: the two primary buttons are at the top right, away from where a thumb or the eyes finish reading the method; on a 27 inch screen that is a longer mouse trip. A pinned copy in the lane footer is possible and not drawn.
4. **Anchor row becomes a view bar.** Ingredients and Method are visible together, so their anchors are dead. The row now holds real in-place views: Recipe (default), Cooked N, Photos N (swap in place, no reload, DESIGN.md 6a), and on the right the version strip and "To review". Each part appears only when it has something: no cooks means no Cooked view, no gallery means no Photos, one version and one view means the whole row is not drawn (the short recipe gets 48px back). This changes R-O2 (one continuous scroll, anchors only) for Cooked and Photos; **Proposal**, the owner should confirm.
5. **Body = ingredients left, method right.** Left column is clamp(280px, 23%, 340px): ingredients wrap, no wasted width (owner's point). Method gets the rest as CSS multi-column (`column-count 2` for 4 to 8 steps, `column-width 340px` for more, 1 column for up to 3 steps). Columns balance by default, so a 14-step recipe is 7 + 7.
6. **Notes under ingredients, sized to the space left.** The Notes block is the flexible part of the left column: it takes what is left under the ingredients, cards clamp to 3 lines, the list scrolls inside with a fade, and "Add a note" is in its header. With no notes only a small "Add a note" button is drawn (empty is absent, with its action). With a tight (long) recipe it shrinks to one summary line (count plus the newest note) that opens the lane. Everything is always in the lane (the Notes pill, N).
7. **Three densities, chosen by the server from counts** (so it can be a class on `.rtab`): `roomy` (up to 5 ingredients and 4 steps), `normal`, `tight` (more than 16 ingredients or more than 10 steps).
   - tight: ingredient column widens to 400 to 470px and flows into two balanced columns (24 rows cost 12), rows 24 to 25px, step photos shrink to 56px thumbnails beside the text, method columns 290px.
   - roomy: see "Short case" below.
8. **Short case defined: up to 5 ingredients and up to 4 steps.** No tab row if there is nothing to switch. Steps become big rows (number, 20px text, a photo 200 to 340px tall at the right), ingredients get 46px rows. The spare space goes to the photos, not to white. It still leaves empty space under the content at 1080 tall (about 40% of the body); I did not invent filler. Honest cost.
9. **1920x1080 answer.** Three things use the width and height instead of white space: (a) the Notes lane docks open by default from 1700px up, but only if there is something in it (notes, reactions or cook remarks); an empty lane stays shut. It takes the 400px that would otherwise be empty, and the page keeps 1432px. (b) From 960px tall, normal recipes get step photos 150px (200px from 1700 wide), 16.5px type and 38px ingredient rows; tight recipes get 31px rows and 15.5px type. (c) The method still stops at 2 columns, never 3 (3 columns of 2 steps looks broken). What remains: typical leaves about 200px at the bottom, long about 280px, short about 400px. Left anchored, as in desktop-layout.md: free space collects at the right, not between lanes.
10. **Hero proof line.** "Cooked 4 times, last 2 days ago", a dot strip (hidden under 1400px), and two thumb chips with counts. "Not cooked yet" plus the one-line prompt when there are no cooks (the prompt is cut by the strip's width at 1280). Per-member chips live in the lane.
11. **Under 1400px the strip drops two things** ("From <parent> ·" before History, and the dot strip) because the second row will not fit; with those, 1280 fits one line with no wrap (measured: no row overflow). Cost: parent lineage is invisible at 1280 (still in the version strip's usual star and in History).
12. **Lane is overlay below 1500px, push from 1500px.** At 1280 the lane covers the right third of the page; I did not shrink the hero to make room.

## Where the extras go (every anatomy element)
| # | Element | Where in Option E | Note |
|---|---|---|---|
| 1 | App rail | Same 88px rail | unchanged |
| 2 | Back to Recipes | Round button at the left of the hero | icon only, labelled; in-place Back from `recipes-browse.js` unchanged |
| 3 | Top-bar title that appears on scroll | Dropped | the hero never scrolls away, so it is always visible |
| 4 | Notes and reactions pill (counts, N) | Hero row 1, far right | opens the right lane; docks open at 1700+ |
| 5 | Star | Hero row 1 | |
| 6 | Edit pencil (E) | Hero row 1; section pencils kept on Ingredients and Method | |
| 7 | Share pill (S) | Hero row 1, labelled with count | not drawn when Recipe says no sharing |
| 8 | More menu | Hero row 1 (dots) | still a bottom sheet; not drawn here |
| 9 | State band (Trying, Put away) | "Trying" tag on the version pill; Keep it / Bring back not drawn | needs a place: proposed in the view bar on the right, costs 0 rows. Not drawn |
| 10 | "An assistant changed this" line | "To review · 2" pill, view bar right | plus the dot on the version pill |
| 11 | Banner photo | Hero thumbnail 96px | the full banner is gone from this page |
| 12 | Title and "Photo of X" line | Hero title (2 lines max, full name in tooltip); inherited badge on the thumb | a 70-character title shows 2 lines, then cut |
| 13 | Version pills | View bar right | |
| 14 | Time and Serves stepper | Hero row 2 | scales quantities in place (working in the mockup, 1 to 12) |
| 15 | From parent, History | Hero row 2 ("History" with `,`; the parent prefix from 1400px) | History is still a full navigation |
| 16 | Proof band | Hero row 2, one line | see decision 10; dots hidden under 1400px |
| 17 | Version strip | View bar right (not sticky: it never scrolls) | |
| 18 | Anchor tabs | View bar left: Recipe / Cooked / Photos (in place) | decision 4 |
| 19 | Ingredients (pantry dots, cart, Hold, Add all missing) | Left column; Hold and pencil in its header; "Add all N missing" under the list | "Talk to your assistant about substitutes" hint is not drawn (cost: 20px); it stays in More |
| 20 | Method (timers, step photos) | Right, balanced columns; timer inline after the step text; photo strip (normal), thumbnail (tight), big (roomy); click enlarges in place | per-step ingredient chips from cook mode would need a line per step; not drawn |
| 21 | Notes | Left column under ingredients; full list in the lane | decision 6 |
| 22 | Cooked list | "Cooked N" view in the view bar | |
| 23 | Photos (loads on tap) | "Photos N" view, same button, same on-demand behaviour | |
| 24 | Where it came from | One muted 12px line at the foot of the left column | |
| 25 | Fixed Plan it / Cook it bar | Hero row 2, right ("Planned Tue" when planned) | decision 3 |
| 26 | Notes and reactions flyout | Right lane, same content, header only changed to use `.x` | |
| 27 | Share panel | Same right lane, not drawn | |
| 28 | Edit panel | Same right lane, not drawn | |
| 29 | Toasts, sheets, scrim | Unchanged, not drawn | Plan it still opens the same bottom-sheet day picker at 736px wide; option F (the right flyout) would suit this page better |
| 30 | Noscript line | Not drawn | the mockup needs script; the build stays server-drawn |

## Differences from the shared vocabulary
Reused as is: `.rtab`, `.meta`, `.mc`, `.serves`, `.ib`, `.ib.bare`, `.jumps`, `.slim`, `.ing` (`.nm .q .dot .miss .unk`), `.mini` (`.ico`), `.stp` (`.nb .timer .psp`), `.note` (`.inh .from`), `.hist` (`.d .t`), `.pgrid`, `.pmore`, `.src`, `.rb-notesbtn`, `.rb-pillcnt`, `.rb-th`, `.rb-dots`, `.rb-react`, `.rb-rc`, `.rb-av`, `.rb-h4`, `.shr-chip`, `.shr-n`, `.rfly(.rfly-notes)`, `.x`, `.kbd`, `.btn`, `.lblrow`, `.lbl`, `.grp`-less (groups are new). Theme/tokens: `theme.css` and `theme.js` only, no raw colours (the photo fills in `data.js` are sample data).
New names, mockup-vs-build to decide: `.rhero`, `.hb`, `.hmain`, `.hrow`, `.hact`, `.hgo`, `.proof`, `.vline`, `.vbar`, `.tabs`, `.vstrip`, `.vp`, `.rbody`, `.rl`, `.rm`, `.stps`, `.grp`, `.notesec`, `.nlist`, `.notesum`, `.viewsec`, `.histgrid`, plus `data-dens`. Hooks kept for `recipes-page.js` / `recipes-browse.js`: `#rtab`, `h1`, `a.back`, `[data-notes]`, `[data-note]`, `[data-star]`, `[data-more]`, `[data-plan]`, `[data-cart]`, `[data-cartall]`, `[data-holdall]`, `.serves [data-n]`. Not tested against the real scripts.
Sample markup is drawn by `app.js` from `data.js` (mockup-only); the build draws it on the server.

## Default path and deferred (AGENTS.md, DESIGN.md section 6)
Loads: `theme.css`, `theme.js` (two default themes only), `styles.css` (about 17 KB), `data.js`, `app.js`. No images, no fonts beyond the theme's. Deferred as today: step photos, the banner thumbnail (should load after text, P-D20), the Photos grid (on tap), the Notes lane markup and its script (on first open or docking), Share and Edit panels. Other themes load only when chosen.

## Costs and buys
- Buys: nothing scrolls for the two main sizes; actions and "about" are in one strip; Ingredients, Method and the version strip are all visible together; the Notes lane docks on big screens instead of white space.
- Cost: this is a new layout path, not a CSS tweak. The recipe page has no desktop file today, so this is a new desktop-only stylesheet and a restructured DOM (or a second render path), and the in-place swap in `recipes-browse.js` and the sticky/scroll-spy code (`.docked`, `scroll-margin-top`) change. The anchors go away.
- Cost: the title is capped at two lines and the hero can reach 145px with a long title.
- Cost: at 1280 the lane covers the method.
- Cost: reaction thumbs show as counts in the hero, so the per-person view is one click away.
- Cost: step photos shrink to thumbnails on long recipes.

## What is NOT solved
- **Reading order of multi-column steps.** Steps run down column 1 then column 2. Someone cooking with eyes jumping between pan and screen can lose their place at the column break (step 7 to 8 sits at the top of the next column). Numbers help; a "you are here" highlight or a tap-to-mark is not drawn. Cook mode is still the real cooking screen.
- Ingredient and step groups are drawn but are **not on the page today** (gap, `../notes.md` section 3.2: `group` dropped by `types.ts`/`client.ts`). The long sample needs that data change; the step groups are labels only.
- Prep versus cook time, equipment, dietary tags: not on the wire, not drawn.
- Per-step ingredient chips (cook mode, kitchie#810): no room in 290px columns; they would push long recipes over the fit.
- State band actions (Keep it, Bring back), More sheet, Share/Edit panels, step photo "open large" beyond a click toggle: not drawn.
- Short recipes at 1920x1080 are still about 40% empty (decision 8).
- No keyboard path for the view bar and no `J/K` scroll; focus order untested.
- Only dark (`kitchie`) and light (`kitchie-day`) checked; the other eight themes were not.
- Not tested with the real server HTML or scripts; widths and heights are the Chromium screenshots above only. Not tested at 1024, 1366x768, 2560, or on phone.
- The "typical" sample has 1 note, one version set and the "Planned Tue" state; a typical with 3 notes would overflow the notes block (it scrolls inside, by design).
