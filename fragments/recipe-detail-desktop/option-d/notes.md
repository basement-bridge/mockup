# Recipe page, desktop: option D, "Step stage"

Mockup only, nothing built. Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/option-d/index.html
Switcher (bottom left, "Samples") or URL: `?r=short|typical|long|notes|cooked|nocooked`, `&t=light|dark`, `&step=N`, `&show=all|step`, `&fly=1`, `&shot=1` (hides prototype controls). Context: Kitchie issue #830, owner's words in its body, brief in `../notes.md`. Sample data is invented (shapes from `recipe-tab/types.ts`).

## The idea

Left rail (about 22% of the page, 316 to 380 px): Ingredients (text wraps) with Notes beneath, always visible. Right: the stage. Left of the stage the whole method as a compact numbered list (one line per step, ellipsis, minutes, camera dot); right of it the current step large with its photo. The person moves by clicking a step, `Left`/`Right` (also `Up`/`Down`, `Home`, `End`) or the Previous/Next buttons. Nothing scrolls the page: the page is always exactly the viewport. A "Show all steps" toggle (key `A`) turns the stage into the plain list.

## Numbered decisions (all **Proposal**; the owner was silent on every one)

1. **Width.** Designed for 1280 to 1920 wide, 720 or more tall, fluid between. Page area is the viewport minus the 88 px nav rail, capped at 1840 so a 2560 screen leaves free space on the right (left-anchored, as the lane rule says). This breaks `AGENTS.md:181` ("no new desktop widths"): the 640 px column is gone. The owner asked to rethink big screens (issue #830), so I treated that as permission and flag it as the first thing to confirm; `kitchie:AGENTS.md:187` says record the exception in `docs/project-plan.md`. One CSS rule set, no per-width files; three container queries (page under 1330, 1150, 960 px; stage under 660 px; current step 760 px and over) do the adapting, so no new width buckets in the build's sense. Under 1280 it degrades (list shrinks to numbers) but is not designed or screenshotted. Height: under 800 tall the rows tighten.
2. **Two rows of chrome, no bottom bar.** Row 1 (60 px): Back, title (two lines max), Notes and reactions pill, star, edit, Share (S), more. Row 2 (56 px): time, Serves stepper, History strip, Plan it, Make it. The fixed bottom bar is removed (it cost 64 px of height on a screen that is meant not to scroll). Plan it / Make it move up beside the facts they act on (Serves feeds Cook it's `n=`).
3. **Rail, then stage, because the owner's own sentence says so.** Ingredients and Notes left (his idea), Method gets the wide area. Notes sit under ingredients, not in a tab, so they are never hidden; they get at most 40% of the rail height and scroll inside it.
4. **Stage = browse and prepare, Cook it = commit** (see "Stage vs Cook it" below).
5. **The step list is the progress, the current step is the reading.** Current step text is 20 to 30 px (scales with width). Photo fills the rest (cropped, as `focus_y` already does); a step with no photo shows "Up next" (the next step's words) instead of a hole. A photo being prepared shows today's "Photo is being prepared" frame. At 760 px of step width and up (1440 with the lane closed gives about 640, 1920 gives about 1070) text and photo sit side by side; below that, text above photo.
6. **Show all steps** = the plain list (same `.stp` markup as today: number, words, timer, 150 px photo strip), scrolling inside the stage; the page chrome stays. It is the escape for people who want to read the whole method. The choice is remembered per browser here (`localStorage`); in the build it belongs with member preferences (open question 3). The current step stays marked in both views, so switching never loses your place.
7. **Short case, defined:** 3 steps or fewer. Stepping a 2-step method is silly, so the stage draws every step as a card side by side (photo, words, timer), no list, no toggle, no keys. The rail is just short (2 ingredients) and the rest is empty. That empty space is accepted, not filled.
8. **Ingredients "used in this step" highlight.** The rail highlights the rows the current step uses and scrolls them into view. This is what makes the rail's internal scroll bearable on the long recipe. It needs per-step ingredient links (see data gaps); with none, nothing highlights and nothing else changes. It shows no amounts: amounts per step stay cook mode (CSI decisions, kitchie#810).
9. **Notes and reactions lane** stays a 400 px right lane that pushes the page (`.rtab.fly` pads right 400). At 1280 the stage then is about 490 wide, so the step list collapses to numbers (container query). The lane also takes the things the page has no room for: Cooked list (who, when, verdict, remark), reactions per member, all notes, and Photos ("Show 6 photos, loads on tap"). History is still the full History page (comma).
10. **Keys.** Left/Right step, Home/End, `A` all steps, N notes lane, S share, E edit, comma history, Esc closes More, Ctrl/Cmd+Esc closes the lane (the repo rule). `A` and the arrows are not checked against `desktop-keys.js` (not verifiable from here).

## Where the extras go (every anatomy element in `../notes.md` section 1)

| # | Element | Where in D | Why |
|---|---|---|---|
| 1 | App header / nav rail | unchanged 88 px rail | not recipe code |
| 2 | Back to Recipes | row 1, far left, icon plus "Recipes" (label drops under 1330 px) | same place as today |
| 3 | Top-bar title | h1 lives in row 1 all the time (two lines max, 21 px); the page never scrolls it away so no `.ttl` swap | one fewer observer |
| 4 | Notes and reactions pill (N) | row 1, right cluster, left of star; says "Notes" under 1330 px; counts stay | it is the lane's opener, keeps its home |
| 5 | Star | row 1, bare icon | unchanged |
| 6 | Edit pencil (E) | row 1; plus small pencils on Ingredients and Method headers (section pencils) | unchanged |
| 7 | Share pill with S | row 1, between edit and more, count badge when links out | pill kept on desktop, as decided |
| 8 | More menu | row 1, far right; a popover under the button here, a sheet in the build today (not drawn as a sheet) | desktop needs no bottom sheet; **difference** |
| 9 | State band (Trying / Put away) | NOT DRAWN. Proposal: a pill beside the title plus Keep it in row 2, replacing the History strip's right end | the samples are all Kept; see not solved |
| 10 | "An assistant changed this" line | NOT DRAWN. Proposal: dot on the version button in the rail plus a "To review" tag | not in any state asked for |
| 11 | Banner photo | DROPPED from the page: the stage's step photo is the only hero. Proposal: the banner stays in the browse flyout and shows in the lane's Photos | a full-width hero costs about 300 px; step photos still load first, as today |
| 12 | Title h1 | row 1 | |
| 13 | Version pills | one button at the top of the rail ("With peas", "Our usual" tag, list on click), only drawn when more than one version | replaces strip plus pills; one control not two rows |
| 14 | Meta: time, Serves stepper | row 2, left | Serves scales the rail's quantities in place, as today |
| 15 | From parent, History (comma) | the right end of the History strip in row 2 | "From Original . History" is one link, as today |
| 16 | Proof band (Not cooked yet, or Cooked N times, dots, chips) | row 2, one line inside a pill-shaped link to History: count, last cooked, up to 8 dots, a chip per member who answered | one row, not a band; "last cooked" and thumbs drop under 1330 px, dots and chips under 1150/960 |
| 17 | Version strip | see 13 | |
| 18 | Jump row (Ingredients, Method, Notes, Cooked, Photos) | REMOVED. Nothing to jump to: ingredients, method and notes are all in view; Cooked and Photos are in the lane | this is the trade: it was a scroll aid and there is no scroll |
| 19 | INGREDIENTS | left rail top; "N of M in", cart button per missing row, "Add N" (count only), section pencil, substitutes hint | Hold button (planned week) not drawn: Proposal, a second mini button beside "Add N" |
| 20 | METHOD | the stage | the point of the option |
| 21 | NOTES | left rail under ingredients, always shown (empty: "No notes yet." plus Add a note, which keeps its action) | the owner's idea |
| 22 | COOKED | lane (N): list of cooks; summary is the row 2 strip | |
| 23 | PHOTOS | lane (N), "Show 6 photos" on tap | on-demand rule kept |
| 24 | "Where it came from" | More menu only | there was no room; it was already reachable there |
| 25 | Plan it / Make it bar | row 2, right; bottom bar removed | see decision 2 |
| 26 | Notes and reactions flyout | right lane, 400 px, pushes | |
| 27 | Share panel | same lane, one parent flyout at a time (stub: toast) | not drawn |
| 28 | Edit panel | same lane (stub: toast) | not drawn |
| 29 | Toasts, sheets, scrim | toast kept; sheets not drawn | note: the 736 px sheet width is wrong on a wide page |
| 30 | Noscript line | n/a, mockup is script-drawn | the build keeps server markup |

## Stage vs Cook it

What Cook it does today (`recipe/cook.html`, `web-cook.ts`, owner decisions L5 to L7): a separate, phone-framed page that opens on the ingredients, shows one step per screen with buttons named for their destination step, swipe or arrow keys, per-step ingredients with amounts (kitchie#810), timers, the end-of-cook asks (photo, note, Keep it / Needs work / Not for us, reactions), it records the cook, and Stop/Done return to the recipe or Plan.

The stage overlaps the stepping (and the arrow keys). It does not do the rest: it records nothing, runs no timers (it shows "20 min", it does not count), shows no amounts per step, asks nothing, and writes nothing to the household. So: **stage = read, prepare, follow along; Cook it = commit** (start a cook, deduct from the pantry, timers, finish with proof). The risk is real: if the stage is good, many people will cook straight from it and never press Cook it, so cooks go unrecorded and the proof band, "Cooked N times", the Kept-it verdicts and Trying promotion get thinner. Honest answer to "does Cook it still earn its place on desktop": yes for the record and the end-of-cook asks, **no as a separate phone-shaped page**. Recommendation (not drawn, owner call): on desktop, Cook it should not navigate away but put this same stage into a "cooking" state (timers live, per-step amounts, a Finish step) so there is one step view, not two. That is more build, and it removes the duplicate. Until then the mockup's Cook it links to today's cook page.

## Fit, measured (headless Chromium, Playwright 1440x900, 1280x720, 1920x1080, light and dark, 60 screenshots, `screenshots/`; numbers in `screenshots/measurements.txt`)

Horizontal scroll: none in any of the 60. Page vertical overflow: 0 px in all 60 (the page itself never scrolls; `html, body {overflow:hidden}`). Things that scroll inside their own box (px beyond the box, dark theme):

| State | 1440x900 | 1280x720 | 1920x1080 |
|---|---|---|---|
| short (2 ingredients, 2 steps) | none | none | none |
| typical (10 ingredients, 6 steps, 2 notes) | none | ingredients 11, notes 7 (a few px) | none |
| notes (typical, 5 notes) | notes 267 | ingredients 24, notes 285 | notes 139 |
| long (24 in 3 groups, 14 steps) | ingredients 270, notes 72 | ingredients 308, notes 84 | ingredients 127, notes 35 |
| show all, typical | stage list 222 | stage list 402 | stage list 42 |
| show all, long | stage list 808 | stage list 982 | stage list 628 |

The step list (14 steps, 3 group labels) fits without scrolling at 1280x720. The long recipe does NOT fit its rail at 1280x720: about 300 px of ingredients are off screen (of about 700), which is why the "used in this step" highlight scrolls the rail to the right rows. That is the brief's allowed exception, and it is the weak spot of this option. Only stage and rail scroll; nothing else. Lane open at 1280x720 (typical): the page still fits; the lane's own body scrolls 96 px.

## Costs and buys

- **Buys:** nothing scrolls on the page; the method is the large, calm centre; the step you are on is big enough to read from a metre away; rail text wraps so no wasted white (his point); one version of the layout from 1280 to 1920 and the list never needs a page scroll however long the recipe.
- **Cost, honest: you cannot read the whole method at once** unless you press "Show all steps". The list shows one line per step, ellipsised ("Tip in the cold rice and break up ..."), so the detail of step 5 is not visible while you are on step 2. People who skim a recipe to judge it ("is this a lot of work?") get less than today; the minutes column and step count help a little. A recipe reader who prefers a page gets "show all", which is today's list in a smaller box.
- Photos: one big photo per step only when that step has one; a recipe with no step photos (R-D9 allows it) shows "Up next" text instead, a plainer stage.
- Banner and jump row are gone; the cook page and this stage overlap (see above).
- Height budget: 116 px of chrome plus a 56 px stage header. At 720 tall that leaves about 490 px for the current step, which is why the long title and notes are the pressure points.

## What is NOT solved

- Long recipes still scroll the rail (above). A smarter rail (collapse the other groups, show only the groups for the current step) was not drawn.
- State band (Trying / Put away, Keep it, Bring back) and the assistant review line: only reasoned, not drawn (rows 9 and 10).
- Hold button, planned state ("Planned Tue"), batch ("N portions"), stock unknown, share absent: not given a state in the switcher; the markup has places for them (rows 19, 25, 14, 7).
- The 400 px lane at 1280 leaves a narrow stage (numbers-only list); usable, not pretty.
- Very long titles use two lines; a 70+ character title at 1280 with the lane open was not tested.
- Under 1280 wide and under 720 tall, and 2560: not designed. Phone and tablet untouched (this page is desktop only; the build keeps the phone markup and rules).
- Key conflicts with `desktop-keys.js` / `desktop-global.js` (arrows, A) not verified; the in-place list-to-page swap (`recipes-browse.js openFull`) was not tested against this markup (it needs `#rtab h1`, `.top a.back`, `[data-notes]`, `[data-note]`, `#t-notes-fly`).
- Touch and screen-reader behaviour of the list and stage not tested (the list is real buttons with `aria-current=step`; the stage region is `aria-live=polite`).
- Not checked with real photos or real long step text (a step over about 150 characters drops to a smaller size; a 400-character step would scroll inside its box).

## Data gaps flagged

- **Ingredient groups and step groups are not on the page today** (`IngredientLine` and `StepLine` drop `group`, `../notes.md` 3.2). D draws group labels in the rail, in the step list and on the current step (the long sample). Needs the wire carried through.
- **Per-step ingredient links** (`uses`) are cook-mode data, AI-tagged at save, no backfill (recipe#127, kitchie#810). The highlight in D reads them; an untagged recipe shows no highlight. Sample links are invented.
- **Minutes per step** exist (`minutes`); prep versus cook time does not reach the page. Row 2 shows total only. The long sample shows "4 h 30 min".
- Cook list entries have no "ate" in the strip (kept in the lane list only); the 8-dot cap is respected.

## Mockup and build stay close: reused and different

Reused from the build's markup (class names the same): `.rtab .top .ib .ib.bare .rb-notesbtn.re-a .rb-pillcnt .shr-chip .shr-n .kbd .mc .mc.ro .serves .btn .btn.ghost .lblrow .lbl .mini .mini.ico .ing .nm .q .q.unk .dot .dot.no .hint .stp .nb .timer .note .note.inh .from .hist .d .t .rb-av .rb-th .rb-rc .rb-react .rb-h4 .rb-mem .rfly .rfly-notes .x .pop`, data hooks `data-notes`, `data-note`, `data-more`, `data-star`, `data-cartall`, `data-key=e`. CSS rules copied from `recipe/recipe.css`, `fragments/recipe-browse-full/styles.css` and `fragments/recipe-share/placement/share.css` are marked "copy" in `option-d.css`; tokens only, no raw colours except the sample photo stand-ins (`--pc`).

Differences the build would list:
1. New layout classes `od-*` (frame, rail, sub row) and `sg-*` (stage, list, current step, cards) in one new desktop-only file, per `kitchie:AGENTS.md:188`; none in `recipes.css`.
2. `.rtab` is a flex column filling the viewport with `overflow:hidden`; today it is a block that scrolls. This is the whole structural change and it conflicts with the sticky jump row and version strip rules (`css.ts:571-574`), which D deletes at 64rem.
3. The page is one `<form method=get>` today; the stage steps in place with script. Without script the build should draw the "show all" list (the server HTML is already that), so the page stays complete with no script.
4. Ingredient rows are about 28 px, not 44 px (rows are not controls; the cart button keeps a 44 px hit area via padding).
5. `.ing.use`, `.od-proof` (the band in one line), `.vsel` (version popover), `.sg-*` are new; the `.rb-dots` timeline became `.od-dots`.
6. Plan it and Make it are in the page header, not the fixed `.act` bar; the Plan it picker becomes the Kitchie #757 flyout (stubbed with a toast).
7. Share, Edit and Photos panels are stubs.

## Performance (DESIGN.md section 6)

Default path loads: `theme.css`, `option-d.css` (about 22 KB), `theme.js`, `option-d.js` (about 35 KB, mostly the sample data), no images (photos are gradients with emoji, standing in for real ones). In the build: step photos load after the words, the current step's photo first (P-D20 order kept; the banner is not drawn). Deferred until asked: the notes lane body and gallery (drawn on N), the More list, the version list, Share, Edit and Plan panels. Show-all draws the same markup the server already has. No new request at page load.
