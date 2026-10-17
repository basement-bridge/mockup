# Recipe detail, desktop: independent design review of options A to E

Advisory review (governance factory station 3) for Kitchie issue #830. Reviewer did not draw any of the options and did not read the authors' notes before opening the pages. Written 17 October 2026 against mockup `main` (options A to E merged), Kitchie `uat` at `cf031d48` (the code the build lands in), `AGENTS.md` (the width rule is the "Desktop layout: rail, column, side panel" bullet, line 181, and the tokens and viewport-file bullets just below it), `docs/design-principles.md`, mockup `DESIGN.md`, and the owner's words in #830 (Original problem statement).

Method: every option opened in headless Chromium (Playwright), 1440x900, 1280x720, 1920x1080, states `?r=typical|short|long|notes|cooked|nocooked`, dark for all, light for typical and long (130 captures), plus 1366x768, 1024x768 and 1280x600. For each capture: document scroll (both axes), every inner scroll box, ellipsis or hidden-overflow text, text under 11.5px, anything past the right edge. Then every screenshot family was looked at. Nothing from the authors' measurements was reused; where mine differs it is listed under "Claims that are wrong".

## 1. Summary

| | A rail + wide method | B three zones | C rail with tabs | D step stage | E hero strip + balanced columns |
|---|---|---|---|---|---|
| Owner goal 1: no scroll (typical, 1280x720) | Yes, 0 px | Yes, 0 px | Yes, 0 px | Almost: ingredients 11 px, notes 7 px | Yes, 0 px |
| Long recipe (24 ing, 14 steps, 1280x720) | Rail 497 and method 378 scroll inside | Ingredients 581 and method 557 scroll inside | Rail 540 and method 445 scroll inside | Rail 308 and notes 84 scroll inside (steps list fits) | Fits, 0 px (ingredients in two columns, notes shrink to one line) |
| Ingredients and notes together in a narrow left column | Yes (notes: 2 cards, 1 under 780 px tall, none visible on long) | No: notes are in the right rail | No: Notes is a tab, never seen with the ingredients | Yes (notes get up to 40% of the rail) | Yes (notes get what is left, about 1 card at 1280x720) |
| Method gets the room (width at 1280) | 872 px, one column, photo beside | 554 px | 852 px | list 315 px plus one big step 460 px (not the whole method) | 776 px in two balanced columns |
| History, serves, proof, versions | Header row 2 and rail top | Header, rail top, History strip in right rail | Row B, rail top | Row 2 | Hero row 2 plus view bar |
| Fidelity to the real page and code | High: same DOM order can be placed by CSS grid areas | Medium: 3 zones, notes flyout retired, server flags | Medium: new tab script, jump row reversed | Low: new interaction model, needs per-step data | Medium-low: new view bar script, multi-column flow, density classes |
| Build blast radius | Medium (one desktop CSS file, small script, lane tabs) | Medium-high | Medium | High | Medium-high |
| Honest weakness | Gap between step text and photo; Notes scroll away on long | Method narrow; busy header; 19 px horizontal scroll at 1024 | Breaks owner's ingredients-with-notes ask; breaks at 1024 | Hides the method behind one step at a time; duplicates Cook it | Hero is 166 px of chrome; reading order across columns; rail 105 px not 88 |
| Rank | 1 | 3 | 4 | 5 | 2 |

Ranking reasoning in one line: A is the owner's sentence drawn cleanly and is the cheapest to build; E is the only one that makes the long recipe fit and uses big screens well, but it pays for that with chrome height, multi-column reading order and several visible defects; B is the best "everything on one screen" design but moves notes away from the ingredients, which is the one thing the owner said; C hides what he asked to see together; D changes what the method is.

## 2. What the owner asked for (the test used)

From #830: on desktop he does not want to scroll if he can; ingredients are a short list and wrap, so "it's not really necessary for the first main column to be that wide"; the method needs more real estate; notes and ingredients, if they fit, go in the same left column; and "pay attention to how you're going to deal with additional things like the history, the serves, and other bits". Phone does not change (constraint already recorded on the issue).

## 3. Rules and code the options are measured against

- **Width rule (`AGENTS.md:181`, with the tokens bullet below it).** Desktop is "a rail, a column and a side panel", widths are settled, "do not add other desktop widths", never add a width literal to a rule, and "a screen does not get its own layout per bucket; if it truly needs one, record the exception in `docs/project-plan.md` and ask the owner". All five options break this and all five say so. All five also use width literals (A 320/340/360 px rail, B and E `clamp()` with px ends, C `clamp(340px,28%,400px)` and a 1344 px cap, D 316 to 380 px and a 1840 cap with container queries at 1330/1150/960). If approved, the widths must become tokens (for example `--rec-rail`, `--rec-cap`) and the exception goes in `docs/project-plan.md`. D's claim that container queries mean "no new width buckets" does not hold: three new width tiers are still three new tiers.
- **Lane rule.** Today the Notes lane (400 px) pushes the page and never covers it; free space collects on the right. A and D push. B (at 1280) and E (below 1500) let the lane cover the page. That is a regression against the rule and should not be built.
- **Viewport-specific files (`AGENTS.md`, 10 October 2026).** The recipe page has no desktop layout file today; the one precedent is `desktop-css/recipes.ts` inside the single 64rem block, plus `recipes-desktop.js` and `recipes-browse.js` fetched at 64rem. A redesign must be one new desktop-only CSS file and, where needed, one desktop-only script; nothing may go into `css.ts` or `recipes-page.js`. All five authors state this; A, B and E could do it largely with CSS grid areas over the existing DOM order (Ingredients, Method, Notes, Cooked, Photos), so the server markup need not change. C and D need new script.
- **Principles.** Empty is absent (B and C apply it fully; A and D keep "No notes yet." with its Add a note action, which the principle allows). Desktop and mobile parity: dropping the jump row on desktop only is the owner's explicit request for a different desktop layout, but it should be written down as a decision, not an accident. Lazy by section: all five keep photos, Cooked and gallery lazy; D stores its "show all steps" choice in `localStorage` (the build would need member preferences).
- **Keys.** Registered on the recipe page today: `S`, `E`, `,`, `N`, `O`, `/`, `J`, `K`, Alt+Left, `?`/`H`, Ctrl/Cmd+Esc. `1` and `2` are registered for the History screen (gated by `when`), and Up/Down are registered as "Previous or next item". C adds `1` to `4`; D adds Left, Right, Up, Down, Home, End and `A`. None of these clash with the recipe page's own keys, but C's digits and D's arrows share keys with History and the list, so each needs a `when` gate and an entry in the `?` list. Not verifiable from a static mockup; flagged for the build.
- **Data on the wire.** The page types drop ingredient and step `group` (types.ts:58-69, client.ts:217), prep and cook minutes, and per-step ingredient links. Real UAT data has groups (Berry Pavlova). Every option draws groups on the long sample; D also draws "used in this step" highlighting that needs per-step links.

## 4. Per-option findings

Severity: **High** blocks the owner's goal or breaks a rule; **Medium** a visible defect or build risk; **Low** polish.

### Option A, narrow rail + wide method

What it is: left rail (320/340/360 px) holding Serves, wrapping ingredients, newest notes, and the Plan it / Cook it footer; wide method with the photo beside each step; two-row header (title, Notes pill, star, edit, Share, more; then time, History, proof); Cooked and Photos become tabs in the existing right lane; the jump row and bottom bar are dropped.

Delivers: the owner's sentence almost word for word. Typical, short, notes and nocooked fit at every size with 0 px scroll; method is 872 px wide at 1280 and the line length stays readable. The header is the lowest of the five (96 px), leaving 624 px of height for content at 720. The lane keeps the existing push rule and the existing key set (`N`, `S`, `E`, `,`). Everything in the anatomy has a home except the source line.

Findings:
- **Medium: dead gap between step text and photo.** At 1440 and 1920 the text ends near 570 px and the photo is pinned to the right edge, leaving 250 px or more of empty row on every step (typical 1440x900 shows it clearly). Fix: cap the step row (about 62ch text, photo directly after) or put the photo under the text; C and B both avoid the gap.
- **Medium: on a long recipe the Notes block is not visible.** The rail scroller holds ingredients and notes; at 1280x720 the Notes sit beyond the scroll, so the owner's "notes with ingredients" is only true for short and typical recipes. Fix: pin Notes (one line plus Add a note) with the Plan/Cook footer and let only the ingredient list scroll.
- **Medium: Cook it moves.** It is at the foot of the rail, about 300 px from where the bottom bar centred it, and its position depends on recipe length (stranded buttons are avoided, but the spot is not constant). This is an owner call (question 3).
- **Low: "Where it came from" is gone from the page** (More only); the "talk to your assistant about substitutes" hint is a tooltip only. Heading "INGREDIENTS 8 OF 10 IN" wraps next to Hold at 1280.
- **Low:** Cooked and Photos are one and two taps deeper (lane tabs) than today's jump row. Keeps lazy loading. Acceptable if the owner agrees.
- Missing from the live anatomy: source line; state band (only a "To review" pill; Keep it / Bring back as a small button); jump row (replaced by lane tabs).
- Verified: no horizontal or document scroll anywhere; 1024x768 and 1366x768 also clean (the author says 1024 to 1279 is unverified; it holds in my capture).

### Option B, three zones

What it is: ingredients card left (Serves on top), method centre, and a right "us and this recipe" rail (Notes, Cooked with remarks, Photos strip, History strip with version chips); Plan it / Cook it in the header; the Notes flyout is retired at 1200+; an empty right rail collapses.

Delivers: the richest single-screen page. Notes, cooked history, reactions, photos and versions are all visible with no tabs and no lane; typical, short, nocooked and cooked fit at every size. "Empty is absent" is applied best here, with the empty rail collapsing into one dashed foot bar. Cook remarks now show next to each cook.

Findings:
- **High: not what the owner said.** Notes are on the right, not with the ingredients; the method gets only 554 px at 1280 (steps wrap to two or three lines, 15.5 px type). The owner's words ask for the opposite proportions.
- **High: breaks below 1280.** At 1024x768 the document scrolls horizontally by 19 px and Cook it is clipped at the right edge, although 1024 is inside today's desktop bucket (64rem). The notes' "folds below 1200" is not true at 1024.
- **Medium: the page rearranges when data arrives.** The rail disappears with no notes and no cooks, so the first note or first cook changes the layout shape. Defensible under "empty is absent" but surprising; the method also jumps from 554 to about 780 px.
- **Medium: the Notes and reactions pill has no `N` hint at 1440** (and none at 1280), although the page claims key N; the pill drops its words below 1440. The Plan it / Cook it / Share / More / pill header is 11 controls in one 64 px row.
- **Medium: version chips clip** ("Less soy, m" cut at the card edge) and "3 versions" wraps onto two lines at 1280 in the History head.
- **Medium: lane covers the right rail at 1280** (the notes admit it pushes nothing). Against the lane rule.
- **Low:** the retired flyout means `recipes-browse.js openNotes()` and `#t-notes-fly` need a desktop code path; three independent scroll regions on long recipes (ingredients 581, method 557 at 1280x720); the right rail and ingredients cards leave dead space under their content (about 70 px at 1280, 130 at 900 tall).
- Missing from the anatomy: banner as a hero (it is a Photos tile), the "photo of X until this version has its own" line, N hint, Hold only on `?planned=1`.

### Option C, rail with in-place tabs

What it is: left rail with a tab strip (Ingredients, Notes, Cooked, Photos), method always on the right, Serves and time over the rail, versions, History and proof over the method, Plan it / Cook it at the top of the method column.

Delivers: the cleanest fit numbers (0 px typical in every tab at all three sizes, including the Notes tab with 5 notes), a wide 852 px method, and an honest "not solved" list. ARIA tabs are well specified. The ingredient column is only as wide as it needs.

Findings:
- **High: ingredients and notes are never visible together.** The owner's central ask is for them in the same column; C puts them in the same column but different tabs, and its own notes admit that a note that says "double the rice" cannot sit beside the rice. Not recommended as drawn.
- **High: breaks at 1024.** The tab strip runs into the METHOD heading and the Plan it button is clipped ("Planned T"), at a width the app already treats as desktop.
- **Medium: dead space.** In the method column the step photo sits at the middle of the row with 140 px empty to its right (typical 1440); the left rail leaves 100 px or more empty at the bottom of the Ingredients tab, the exact "wasted white space" he complained about.
- **Medium: the jump row reversed** (R-O2 A), the bottom bar moved, and the state band, "An assistant changed this" line and "From parent" are not drawn (the notes list them as gaps).
- **Medium: version strip truncates** names at 104 px; five versions will not fit.
- **Low:** digit keys `1` to `4` share keys with History (needs `when` gating); the `N` pill now means "go to Notes tab"; the badge for Photos needs a count that is not on the page without fetching.

### Option D, step stage

What it is: ingredients and notes in a left rail (so far the owner's idea); the method becomes a compact list plus one large current step with a big photo, moved by clicking, arrows or Previous/Next; "Show all steps" returns the plain list; Plan it / Cook it in a second header row.

Delivers: the only option that fully respects "ingredients and notes together" while also using height (nothing scrolls on typical at 1440x900 and 1920x1080), and the step list is excellent on a long recipe (all 14 steps and 3 group labels visible without scrolling). The author's note on how the stage overlaps Cook it mode is the most honest piece of analysis in the set.

Findings:
- **High: it redefines the method.** The owner asked for the method to get "more real estate", not for a different reading model. By default the person sees one step; reading the whole method means opening "Show all steps" (default-hidden control). A new interaction model for a recipe page is far bigger than a layout option.
- **High: overlaps Cook it.** The stage steps like cook mode (arrows, one step, progress bar) but records nothing, which the author concedes will leave cooks unrecorded and thin the proof band. Building both is duplication; replacing Cook it is a separate owner decision (#810 territory).
- **Medium: dead space.** Step 1 of the long recipe shows a dashed "Up next" box covering about 350 px of empty area; a typical step with a photo is one huge cropped egg. The list truncates every step with an ellipsis.
- **Medium: needs data Kitchie does not carry.** "Used in this step" highlighting needs per-step ingredient links; without them the rail is a plain list that scrolls 308 px on the long recipe.
- **Medium: keys.** Up/Down and arrows share keys with "Previous or next item"; `A` is new; the choice is stored in `localStorage` (the build needs preferences).
- **Medium: the Next button is covered by the mockup's Theme button in every normal capture** (`?shot=1` removes it). A mockup artefact, but the actual Next control sits in the corner a fab can occupy; fix the position when reviewing.
- **Low:** Hold, the state band and the "assistant changed this" line are not drawn; the banner is dropped from the page; typical at 1280x720 scrolls the ingredients by 11 px and notes by 7 px (so it does not fully meet its own claim of fitting).
- At 1280 with the lane open the stage is about 490 px and the list collapses to numbers (works, but the list is the point of the option).

### Option E, hero strip + balanced columns

What it is: a two-row hero (photo thumbnail, title, time, Serves, History, proof, star, edit, Share, More, Notes pill, Plan it, Cook it), a view bar (Recipe, Cooked, Photos in place; version strip and To review on the right), ingredients left, method in CSS columns right, Notes under the ingredients; density classes chosen from counts (roomy, normal, tight); the lane docks open at 1700+.

Delivers: the only option where the long recipe fits with no scrolling at all three sizes (ingredients in two columns on "tight", step photos shrink to thumbnails). Short recipes get big photos rather than white. Anatomy coverage is broad (versions, review pill, proof dots, thumbs chips, Hold).

Findings:
- **High: chrome cost.** Hero 113 to 123 px plus a 53 to 61 px view bar plus the 105 px rail is 166 px of 720 at 1280 (23%), against 96 for A and 64 for B; the author reports the view bar as 44 to 48 px, I measure 53 and 61. Method height is 554 px, the lowest of the five.
- **High: the nav rail is 105 px wide, not 88.** `nav.bar` is `width:88px` plus padding and border in content-box, so every width in E is 17 px smaller than it says, and the page does not sit on the same grid as the other four or the real app (`--rail` 88 px). Fix before anything is compared.
- **Medium: clipped proof text.** "last 2 days ago" is cut to "last 2 da..." in the hero at 1280 and 1440 (typical and long); the notes say 1280 fits "with no wrap", which is true but hides that the text is clipped. At 1024 the title becomes "Egg frie..." and Cooked is cut.
- **Medium: multi-column method reading order.** Steps 1 to 2 sit in the left column and 3 to 6 in the right, leaving 100 px empty under step 2 on typical; steps 7 and 8 straddle the column break on long. The author names this; it is a real cost for someone cooking from the screen.
- **Medium: notes are not really beside the ingredients on a busy page.** With 5 notes at 1280x720 about one card is visible and its lower edge fades behind the source line; on a long recipe Notes shrink to one line.
- **Medium: long recipe ingredient columns split a group.** The Beans group continues at the top of the second column with no repeated heading; the rail also widens to about 400 px on tight recipes, so the page shape changes between recipes.
- **Medium: Cooked and Photos replace the whole body.** The Cooked view hides ingredients and method (and leaves the page about half empty); it changes R-O2 A for those two sections and must be confirmed.
- **Medium: lane overlays below 1500 px**, against the lane rule; the Notes pill and More dots sit in an odd order (star, edit, Share, More, then Notes) and the More dots have weak contrast.
- **Low:** state band actions (Keep it / Bring back) and the More sheet are not drawn; the source line is a 12 px muted line at the foot.

## 5. Claims in the authors' notes that are wrong or overstated

| Option | Claim | What I found |
|---|---|---|
| A | None materially wrong. Measurements match mine (long: method 378, rail 497 at 1280x720). "1024 to 1279 not verified" is cautious: it holds in my 1024x768 capture. | |
| B | "Three zones survive at 1280; they fold below 1200." | At 1024x768 the page has 19 px horizontal scroll and Cook it is clipped; the fold does not work at 1024. |
| B | Notes pill carries key N (anatomy table row 4). | No N hint is drawn at 1440 or 1280. |
| B | "Page area ... right of the 88px rail" and rail clamps need no width literals. | Width literals (256/340/288/420 px clamps) are present; these need tokens. |
| C | "Below 1280 wide: rail 300px, labels trimmed; only checked that nothing breaks." | At 1024x768 the tab strip overlaps the Method heading and Plan it is clipped. |
| C | "The ingredient column only as wide as it needs (no wasted white)." | The Ingredients tab leaves 100+ px empty above its footer, and the method row has 140 px empty beside the photo. |
| D | "One CSS rule set ... so no new width buckets in the build's sense." | Three container-query tiers at 1330, 1150 and 960 px are new width tiers; the rule is about not adding widths. |
| D | "Up next shows the next step's words instead of a hole." | On long step 1 it is a roughly 350 px dashed box that reads as a hole. |
| D | Typical fits with no scrolling at 1280x720. | Ingredients scroll 11 px and notes 7 px. |
| E | "The rail stays 88px." | Measured 105 px. |
| E | "View bar 44 to 48 px" and "Hero 113 to 123 px". | View bar is 53 to 61 px; chrome is 166 px at 1280x720. |
| E | "1280 fits one line with no wrap." | Text is clipped ("last 2 da..."), which the measurement of wrap does not catch. |

## 6. Missing elements against the live anatomy

Present in all five: back, title, Notes and reactions pill with counts, star, edit pencil, Share with S hint, More, time, Serves stepper, History with comma hint, proof, Ingredients, Method, Notes, Plan it / Cook it. Not present or not drawn:

| Element | A | B | C | D | E |
|---|---|---|---|---|---|
| N hint on the Notes pill | yes | missing | yes | yes | yes |
| State band (Trying, Keep it / Bring back) | small, partial | 40 px band, drawn | missing | missing | missing (tag only) |
| "An assistant changed this" | To review pill | To review tag | red dot only | missing | pill |
| Banner / hero photo | thumbnail (hero on short) | Photos tile | thumbnail | dropped | thumbnail |
| "From parent / History" | yes | History strip | History only | yes | yes (hidden under 1400) |
| Hold for the week | in ingredients head | `?planned=1` only | yes | not drawn | yes |
| Source line | More only | History strip | end of method | More only | foot of rail |
| Jump row | lane tabs | deleted | rail tabs | deleted | view bar |
| Cooked | lane tab | right rail | rail tab | lane | view |
| Photos | lane tab | right rail strip | rail tab | lane | view |
| Notes flyout | kept (lane) | retired at 1200+ | replaced by tab | kept (lane) | kept (lane, overlays) |
| Where Plan it / Cook it | rail footer | header | row B | row 2 | hero |

## 7. Recommended position

**Take A as the base, with specific parts borrowed, and drop the rest.**

Keep from A: the left rail with Serves, wrapping ingredients and Notes; the wide single-column method with the photo beside the step; the two-row header; the existing right lane with Cooked and Photos added as tabs (reuses the lane and its push rule, no new overlay); the jump row dropped on desktop only.

Take from other options:
- From B: "empty is absent" for the rail items that have no action (no Cooked tab when there are no cooks; Photos tab absent when none); the server-chosen `data-` flags from counts; cook remarks shown under each cook in the lane tab; the History strip idea only as the proof button A already has.
- From E: the three density classes chosen by the server from counts (roomy up to 5 ingredients and 4 steps, normal, tight above 16 ingredients or 10 steps) for spending spare space on short recipes; for tight recipes show the ingredients in two columns **only if the owner wants the long recipe to avoid scrolling**, otherwise accept an inner scroll (question 5).
- From C: the ARIA pattern for the lane tabs; the "Cooked 4x plus dots opens the Cooked tab" proof button.

Drop: C's tab rail (breaks the owner's ingredients-with-notes ask); D's stage (a different method model that overlaps Cook it; if wanted, it belongs under the Cook-it-on-desktop discussion in #810, not here); B's three zones and retiring the flyout (fine design, wrong proportions); E's view bar that replaces the page body, multi-column method flow and overlay lane.

Fixes A needs before it is shown to the owner: close the step-row gap; keep Notes visible on long recipes by pinning Notes and the footer and scrolling only the ingredient list; put the source line back (rail foot or lane); the key hints (`S`, `N`, `,`) are 11 px in every option, which is small; test at 1024 and 2560.

Build size: one new desktop-only stylesheet (placed by grid areas over the current DOM order, so the server markup keeps its order and the page stays complete without script), one small desktop-only script for lane tabs and the rail footer (fetched from 64rem like `recipes-desktop.js`), no new request at page load, the Notes flyout reused. Estimated blast radius medium: `desktop-css/recipes.ts`, `recipes-browse.js` (Notes flyout tabs), `recipes-page.js` (jump-row spy only needs to stand down on desktop), the existing recipe-page browser test at 1280 and 1440, plus new width tokens in `desktop-layout.ts`.

## 8. Questions that genuinely need the owner

1. **Relax the desktop width rule for this page?** Options: (a) make the recipe page a recorded exception: full width beside the rail, left-anchored, capped near 1600 px, widths held as tokens, exception written in `docs/project-plan.md` (this is what A, B, C, D and E all assume); (b) keep the 736 px column and put the two-column layout inside it (cannot hold a rail plus a method; does not meet the goal); (c) widen the column token only for this page (smaller change but it is the same exception in disguise, and everything else on the page then drifts). Trade-off: (a) adds a second desktop layout; (b) is rule-clean but fails the goal. Recommend (a), with the exception recorded and the widths as tokens, not literals.
2. **Which breakpoint?** Today desktop begins at 64rem (1024 px), and four of the five options break at 1024 (B clips, C overlaps, E truncates, D collapses). Options: (a) apply the new layout from 80rem (1280 px) and at least 700 px high, keep today's single-column page between 64rem and 80rem and on short windows; (b) apply from 64rem and design 1024 to 1279 properly (more mockup work, narrower method). Trade-off: (a) is one more breakpoint but no new broken states; (b) matches the three-bucket rule but needs a second mockup round. Recommend (a), because a fixed-height page without a scroll fallback also fails under browser zoom of 125% and above and under find-in-page; the fallback is today's page.
3. **Where do Plan it and Cook it live?** Options: (a) rail footer (A): follows the check-what-you-have then cook order, no bar cost, but moves with recipe length; (b) header (B, C, D, E): constant place, but the busiest row and far from the method; (c) keep today's fixed bottom bar: familiar, costs 64 px of height. Recommend (a) for the mockup; ask him to look at it on a 27 inch screen.
4. **Cooked and Photos one tap deeper.** Accept lane tabs (A), or keep them visible (B)? Recommend accepting the tabs; the proof button and N already reach them in one key.
5. **Long recipes: accept inner scroll, or restructure the page for them?** Options: (a) accept inner scroll in the rail and the method (A, B, C); (b) E's tight mode (two-column ingredients, thumbnails) so nothing scrolls, at the cost of a rail that changes width and a smaller, harder to read method. Recommend (a): the brief says "where possible", and most recipes are not 24 ingredients; keep Notes and the footer pinned.
6. **Data additions: ingredient and step `group` on the wire.** Yes, as its own small change before the build: carry `group` through `IngredientLine`, `StepLine` and the mapper (no store, no write path), because all five options draw groups on long recipes and real data already has them (Berry Pavlova). No, for now: prep and cook minutes, equipment, tags, and per-step ingredient links (only D needs the last, and cook mode owns that under #810). A wrong guess costs a build with group labels that cannot be filled.
7. **Is the stage idea (D) worth its own issue?** It is a cook-along view and overlaps Cook it. Options: drop; park under #810 as "Cook it on desktop"; build now. Recommend park under #810 and do not build it as part of this layout.

## 9. Method notes and limits

- Measured with Playwright against the committed pages served from a local static server; screenshots were not committed (they are in the reviewer's scratch area). Numbers can be re-run by loading `?r=<state>` at the sizes above.
- Photos are colour blocks in all five mockups, so how step thumbnails crop with `focus_y` is not seen in any option.
- Nothing here was tested against the real server HTML, `recipes-browse.js` in-place swap, or focus order in the scroll regions; those remain build-time checks. 2560 wide and phone were not checked.
