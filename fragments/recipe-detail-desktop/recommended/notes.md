# Recommended: hero banner, tabbed rail, balanced method

Desktop recipe detail page, Kitchie issue #830. Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/recommended/index.html
Switcher: the "Demo" button in the stand-in rail (or key `` ` ``). Query: `?r=short|typical|long|notes|cooked|nocooked`, `&tab=ing|notes|cooked|pho`, `&lane=1` (flyout open), `&banner=none`, `&theme=dark|light`.
Decisions, proposals and open questions: `../notes.md` section 7. Width exception: `../../../docs/project-plan.md` (RDD-X1, proposed, awaiting owner).

## What it is

Option C's in-place tabbed left rail under option E's hero strip. The page is one viewport tall and the document never scrolls (wide layout); only the rail pane and the method may scroll inside, and only for long recipes.

- **Hero:** a banner band on top (the photo has its own band, nothing sits on it) and two rows of controls below it on the page surface. Row 1: back and title on the left; Notes and reactions pill, star, edit, Share (S) and More on the right. Row 2: Serves (call to action, opens a stepper), the time badge, the version dropdown and a History icon on the left; Plan it and Cook it on the right. No bottom bar.
- **Rail:** tabs Ingredients, Notes, Cooked, Photos with count badges (keys 1 to 4). Ingredients wrap; Hold, cart buttons and "Add all N missing" as today. Source line pinned at the foot.
- **Method:** balanced columns (two when the area is 42rem or wider). The step time sits under the step number in the gutter. Step photo follows the text directly (no gap); tap it (small magnifier mark) to open it in the photo viewer, arrows stay within the step photos. No ingredient links.
- **Notes and reactions flyout:** sections Reactions (name, thumb and word, date, only people who rated), Cook remarks, Notes on this version; Add a note pinned. Pushes the page.

## Sizes (80rem and 700px or more), measured with Playwright (Chromium) in dark; light checked at 1440x900 and 1920x1080

| Size | short | typical | long |
|---|---|---|---|
| 1280x720 | page 0px; no inner scroll | 0px; none | 0px; ingredient list scrolls (444px) |
| 1440x900 | 0px; none | 0px; none | 0px; ingredient list scrolls (293px) |
| 1920x1080 | 0px; none | 0px; none | 0px; ingredient list scrolls (179px) |
| 1024x768 (fallback) | stacked, no horizontal scroll, nothing clipped | same | same |

Hero height: 150 to 205px (1280x720: 150 to 175). Method width at 1280: 800px. Screenshots: `screenshots/`.

## Reviewer fixes applied (review.md)

No gap between step text and photo; Notes reachable on long recipes (pinned tab strip, inner scroll, pinned Add a note); source line restored; nothing covers the page (the flyout pushes); no clipped actions at 1024 (the stacked fallback wraps); no tab strip over the Method heading (separate grid cells); keys 1 to 4, N, S, E, comma are plain keydown handlers (swallowed while a photo viewer is open) to be gated by `when` in the build (`1` and `2` are History keys); wide layout only from 80rem and 700px high, with a stacked fallback.

## What the default path loads, and what is deferred

Default: `theme.css`, `recommended.css` (base, all components), `recommended-wide.css` (media-gated viewport file), the sample data and one script, the banner (about 8KB WebP here; a real banner is larger) and the step thumbnails. Deferred in the build: the Photos grid (on tap), the Notes flyout (fetched on first N or pill press, as today), Share, Edit and Plan panels (on demand), step photos below the screen. The mockup draws all of it from sample data; nothing is fetched. In the build the wide CSS and script are desktop-only files fetched from 80rem, never folded into `css.ts` or `recipes-page.js`.

## Known weak spots

- A long recipe (24 ingredients) still scrolls its ingredient list inside the rail at every size; the method fits. See open question Q9.
- With two method columns a group label can end one column and its steps continue unlabelled in the next (long recipe, "Beans").
- With the flyout open at 1280 the page is 760px wide: the rail narrows to 19.5rem, hero chips drop, the method is one column and scrolls on a long recipe.
- Below 80rem or 700px the mockup stacks and scrolls; the real fallback is today's page, which is not drawn here.
- The hero scrim hides the left of the photo; with a bright photo the words rely on the scrim. Photos here are drawings; real photos are untested.
- Tab strip at 336px is tight for "Ingredients 24 | Notes | Cooked | Photos".
- The theme button is moved over the stand-in rail so it never covers the page; the Demo panel is mockup-only.
- Share, Edit, More, Plan it and the note sheet are not drawn (toasts).

## New class names (layout only, for the build to adopt or rename)

`.hero .hphoto .hbody .hr1 .hr2 .hmain .tbadge .hmeta .svwrap .svcta .spop .vwrap .vchip .vpop .hico .hicons .hgo .lbx .lbx-f .lbx-n .lbx-x .zm .rbody .rail .tabs .bdg .pane .pscroll .pfoot .src .meth .mscroll .steps .nbw`. Everything else uses the build's names (`.ing .nm .q .dot .stp .nb .timer .psp .note .hist .serves .ib .mini .rb-* .shr-chip .kbd .rfly`).

## Owner decisions log

### 17 Oct 2026 (voice decisions, applied)

- **Hero as two rows** under a banner band. Row 1: title left, share and social actions right. Row 2: Serves first (a call to action: click opens a small stepper, Esc or click outside closes, focus returns), then the time badge (unchanged), then the version dropdown (unchanged). The small branch icon and the "From <parent>" link near the dropdown are gone (the dropdown list still says "From ..." for each version). Plan it and Cook it are unchanged and sit at the right of row 2; the Notes and reactions pill and flyout are unchanged.
- **Removed from the hero, not moved:** "Cooked 4x" with its last-time text and coloured dots, and the thumbs-up reaction summary. The cook count is in the Cooked tab; reactions are in the Notes and reactions pill. The Cooked tab is as it was.
- **History** is now an icon-only button (clock with arrow) with no text, muted, on the right of the version dropdown, tooltip and aria-label "History (,)". The comma key still opens it (it is a `data-key=","` link as before). Nothing else on the page names it.
- **Photos tab:** thumbnails stay a grid (real thumbnails now). Click opens a lightbox: page dimmed and made inert, photo centred, `object-fit: contain`, max size from the viewport, width and height auto so it is never scaled past its natural size. On-screen arrows and Left/Right keys move (wraps first to last), Home/End jump, Esc, the close button or a click on the dim area close; focus returns to the thumbnail of the photo last shown. While open, every other page key (1 to 4, N, S, E, comma, backtick) is ignored and Tab stays inside the viewer.
- **Step photos** use the same lightbox (arrows within the step photos; hidden if a recipe has one). A small magnifier mark on each photo says it enlarges. Steps with no photo, and the "Photo being prepared" stand-in, are unchanged. The old in-place expand is gone.
- **Banner uncovered:** the share and social controls and the title sit in their own band below the photo; the photo is whole-width and unscrimmed. Height clamp(88px, 15vh, 240px), 84px when the window is under 800px high so a typical recipe still fits at 1280x720 with no inner scroll.
