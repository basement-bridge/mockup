# Recipe detail, desktop: option A, narrow rail + wide method

Mockup only, nothing built. Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/option-a/index.html
Switcher (small "Mockup" button, bottom right): `?r=short|typical|long|notes|cooked|nocooked`, `&t=dark|light`, `&vers=3` (three-version strip). Keys N, S, E, comma are live; close the right lane with its X or Ctrl/Cmd+Enter. Owner's words (issue #830): ingredients and notes in a narrow left column with text wrap, method on the wider side, no scroll if possible. Everything here is **Proposal** unless that sentence applies.

**Phone is unchanged.** This is a desktop-only file (would be a `desktop-css` block, not `recipes.css`).

## Width and breakpoint assumption (AGENTS.md:181)
Owner is explicitly asking to rethink the big-screen layout, so this page uses the whole width beside the 88px app rail instead of the 736px column. Designed for 1280 to 1920, **left-anchored**, free space goes to the right. Tiers: base 1280 (rail 320px, method text 18px, step photo 132x82); 1440 rail 340; from 1600 rail 360, method text 20px, photo 176x108. 1024-1279 is only roughed in (rail 290, smaller photos, reaction counts hidden), not verified. This adds new width tiers for one screen: the exception needs recording in `docs/project-plan.md` and Arjan's yes (kitchie AGENTS.md:187).

## Design decisions
1. **Two columns, one fixed height.** Page is exactly viewport high; header never moves; only `.rscroll` (rail) and `.mcol` (method) may scroll, each inside the page. Document scroll is zero in every state.
2. **Rail 320px, text-wrapping rows**: dot, name (wraps), right-aligned tabular quantity (the settled "quantity is its own column" rule), cart button before it on missing rows. Rows are 30-34px (not 44px): they are not controls; the cart button keeps a 44px hit area via `::after`.
3. **Serves stepper at the top of the rail**, next to the quantities it scales. Same `.serves` control, same 1 to 12 range.
4. **Notes under ingredients in the same rail**: newest two as clamped cards (inherited ones dashed, "from the parent version"), "See all N notes (N)" opens the right lane. Below 780px height only the newest note shows, one line. Add a note stays in the Notes head, so "No notes yet." keeps its action.
5. **Header band is two rows (about 100px).** Row 1: back, small banner thumbnail, title (2 lines max), Notes and reactions pill (counts, N), star, edit, Share (S), more. Row 2: time, versions (only with more than one), History (comma), proof strip.
6. **History + "Not cooked yet" strip go in header row 2**, not the rail and not the method column. Why: they are facts about the recipe's life, not content to cook from; row 2 costs a 44px line instead of rail height, and the rail height is the scarce thing (10 ingredients plus Notes plus buttons has about 30px spare at 720). The strip becomes one button: it opens the right lane on the Cooked tab, so it keeps a next step (and "Not cooked yet" keeps its sentence).
7. **Plan it / Make it sit at the bottom of the rail** (a footer inside the rail), not a fixed bar and not in the header. Why: the job order is check what you have, then cook, and the rail is where you check; the header is already full (8 controls at 1280); a full-width fixed bar costs 64px of height on every screen. The footer follows the content when the rail is short (so the short recipe has no stranded buttons) and pins to the bottom when the rail is full. Cost: Make it is about 300px from the right edge where the old bar centred it; and its position moves with recipe length (it is at the bottom for long, under the notes for short).
8. **Method: 18px text (20px from 1600), step photo beside the text** in a right-hand column, numbered circles, timer chip inline, group labels for long recipes. Click a photo to open it in place (same pattern as today). Under 640px of column (right lane open at 1280) photos shrink to 96x60 beside the text.
9. **Tabs row dropped.** At this width Ingredients, Method and Notes are all on screen at once, so there is nothing to jump to. Replaced by: the right lane (the existing Notes and reactions lane) gets three tabs, Notes and reactions, Cooked, Photos. Entry points: Notes pill or N (Notes), proof strip (Cooked), tab (Photos, lazy "Show N photos" on tap as today). No new controls in the page itself. The lane pushes the page left, never covers it (existing rule).
10. **Banner photo** becomes a 72x44 thumbnail in row 1 (tap to open large in place, Esc closes). Still loaded last. For recipes with 3 or fewer steps and a screen at least 860px high, the method column shows a 520px banner above the steps to use the spare room.
11. **Short recipe (2 ingredients, 2 steps)**: nothing stretches. Rail is content height with the buttons right under the notes; method column is top-left with larger text (+3px) and 230x140 photos (300x180 at 1600), and the hero when the height allows. Empty space is left at the bottom, deliberately.
12. **Long recipe (24 ingredients, 3 groups, 14 steps)**: header, Serves and the Plan/Cook footer stay put; the ingredient list scrolls inside the rail with sticky group labels, the method scrolls on its own. Group labels in the method are drawn from `group` on steps.

## Where the extras go
| Element | Where | Costs / buys |
|---|---|---|
| App rail | 88px stub, unchanged | takes 88px |
| Back | row 1, left, icon with label | none |
| Title | row 1, 2 lines max | long names (70+ chars) clamp to 2 lines |
| Banner photo | 72x44 thumbnail row 1; large banner only on short recipes at 860px+ | loses the hero on typical and long |
| Notes and reactions pill + counts, N | row 1 | none; gives up its label when the lane is open |
| Star, edit, Share (S), More | row 1 | none |
| Time | row 2 | Recipe sends prep/cook minutes; only total shown, as today |
| Serves stepper | top of rail | buys scaling next to quantities |
| Version pills / strip | row 2, only when more than one version | 3 versions: row 2 is full at 1440, reaction chips hidden below 1600 |
| State band (Trying / Put away), review line | pills in row 2 ("To review" drawn); Keep it / Bring back as a small button there | not drawn for every state (only To review) |
| History link (comma) | row 2 | none |
| Proof band ("Not cooked yet" / Cooked N times, dots, chips) | row 2, one button, opens lane at Cooked | chips are smaller; "1 other" thumbs-down chip kept |
| Ingredients | rail | scrolls inside the rail when long |
| Hold, "Add all N missing", section pencil | Ingredients head (Hold only when planned; cart-all icon with count) | the "Talk to your assistant about substitutes" hint is only a tooltip now (**not solved**) |
| Method | wide column | scrolls on its own |
| Step photos | beside each step | expand in place |
| Notes + Add a note | rail, under ingredients | only newest two shown |
| Cooked | right lane tab | one tap deeper than today |
| Photos | right lane tab, lazy | two taps deeper than today |
| Where it came from | not on the page; stays in More | the one-line source is hidden |
| Plan it / Planned Tue, Make it | rail footer | see decision 7 |
| Notes flyout, Share, Edit lanes | right lane, push the page | unchanged pattern |
| Per-step ingredient chips (cook mode work) | not drawn; the step row has room under the text | to design later |

## Measured (headless Chromium, Playwright; `screenshots/measurements.json`)
Horizontal scroll 0 and document vertical overflow 0 in all 32 captures. Inner scroll (px past the box):

| State | 1440x900 | 1280x720 | 1920x1080 |
|---|---|---|---|
| typical | none | none | none |
| notes (5) | none | none | none |
| short | none | none | none |
| nocooked / cooked (lane open) | none | none | n/a |
| long | method 198, rail 526 | method 378, rail 497 | method 102, rail 346 |

1366x768 (extra): typical none; long method 330, rail 449. Long recipe: rail scrolls at every size (24 ingredients cannot fit), as the brief allows.

## Differences from the build / existing mockups
- Reused: `theme.css` tokens, class names `.rtab .top .ttl .back .ib .rb-notesbtn .rb-pillcnt .shr-chip .shr-n .serves .ing .nm .q .dot .unk .mini .note .inh .from .stp .nb .timer .psp .hist .act .btn .rb-band .rb-dots .rb-dot .rb-react .rb-rc .rb-av .pills .st .tg .vstrip .kbd`.
- New layout-only names: `.nav .rd .meta2 .cols .rcol .srv .rscroll .mcol .mhead .stps .sg .grp .cart .hero .hb .rfly-tabs .rfb .more .nlist .few`, `.sw` (mockup switcher). Sample data stays in `a.js`.
- Differences: proof band is inline in row 2 and one button (was a card); ingredient rows 30-34px; `.stp` is a 3-column grid with the photo beside, not under; the right lane gets tabs (build today: Notes only); `.rb-d` hiding is not needed (desktop-only file); no jump row; hero is a thumbnail.
- Build note: the in-place swap (`recipes-browse.js openFull`) needs `#rtab h1`, `.top a.back`, `[data-notes]`, `[data-note]`; those hooks are kept, but not tested here.

## Data gaps
- **Groups need a wire change**: `group` on ingredients and steps is dropped by `IngredientLine`/`StepLine` (types.ts:58-69, client.ts:217). The long recipe's three groups and the step labels are drawn but cannot be rendered today.
- Prep vs cook minutes, equipment, dietary tags: not carried; not drawn.
- Cook remarks are in the lane's Notes tab only (as today).

## Default path loads / deferred
Server-drawn, complete without script. Default path: the page CSS and the small page script. Deferred: the lane's Cooked and Photos tab bodies (photos on tap), share/edit/plan panels, banner (last), step photos by order as today. No new request at page load; one desktop CSS file served at 64rem+ only.

## What is NOT solved
- Make it is no longer a fixed full-width bar; its place moves with recipe length.
- Photos and Cooked are one or two taps deeper; the jump row's quick access is gone.
- Notes show two cards at most in the rail (one under 780px high); full text needs the lane.
- With the lane open at 1280 the method column is about 450px; fits typical, tight for long steps.
- 1024-1279 not verified; 2560 not checked (page would sit left with a wide empty right).
- Bottom bar vs rail footer, and the Plan day picker (#757 flyout) interplay not drawn.
- Not verified in a real Kitchie build; keyboard focus order and the view-transition not tested.
