# Option C: rail with in-place tabs

Desktop recipe detail page, Kitchie issue #830. Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/option-c/index.html
Switcher: the "Demo" button in the stand-in app rail (or key `` ` ``). Query: `?r=short|typical|long|notes|cooked|nocooked`, `&tab=ing|notes|cooked|pho`, `&theme=dark|light`.

## What it is

A narrow LEFT rail with a tab strip (Ingredients | Notes | Cooked | Photos, Ingredients default) that switches in place, and a wide RIGHT column that is always the Method. The page is exactly one viewport tall and never scrolls. Only the two panes under the fixed header and tab strip can scroll, and only when the recipe is long. Sample data is the brief's (A short, B typical with 3 versions, C 5 notes, D cooks, E long with 3 groups); all invented, groups are drawn but flagged (see "Not solved").

## Width and breakpoint assumption

Desktop bucket only (1024 and up; phone untouched and not drawn). Designed for 1280 to 1920 wide and 720 to 1080 tall. AGENTS.md:181 says no new desktop widths. The owner asked to rethink the big screen, so this option breaks it on purpose, and that is an exception to be recorded in `docs/project-plan.md` and agreed (kitchie AGENTS.md:187):
- The page fills the space right of the 88px app rail, left-anchored, capped at 1344px (so at 1920 the free space goes to the right, as in the existing lane convention).
- Recipe rail = `clamp(340px, 28%, 400px)` (300px under 1280, unchecked below 1100). Method gets the rest: 852px at 1280, 968px at 1920. Step text is capped at about 62ch beside its photo thumbnail.
- Height: one extra file `c-short.css` for `max-height:800px` (spacing only), same idea as `plan.desktop-short.css`. Two height steps (860, 1000) enlarge step thumbnails only.
- The 736px phone column, the 400px lane and the 320px flyout are not used. The Notes flyout is replaced by the Notes tab (decision 4), so no right lane opens from this page except Share, Edit and Plan, which keep their lane (not drawn).

## Decisions (numbered)

1. **Page never scrolls; inner panes do.** Header, row B and the tab strip are fixed. Rail pane and Method scroll on their own only when content exceeds them (edge fade shows there is more). Short case defined as 3 ingredients or fewer and 3 steps or fewer: nothing stretches, text and photo scale go up one step (`data-size=short`), the rest stays empty.
2. **Rail = tab stack, not a long list.** This answers "what if there is more than fits": Notes, Cooked and Photos take the same space as Ingredients, one at a time. Cost in section "Not solved".
3. **Badges on tabs.** Notes 5, Cooked 4, Photos 6 (count of version notes, cooks, gallery plus cook photos). Ingredients has no number; its pane head says "8 of 10 in" and the cart row says "Add all 2 missing". Selected tab fills its badge.
4. **Notes and reactions pill stays in the header and now means "go to Notes tab"** (key N, same key as today). It keeps its thumbs and note counts so reactions are visible at all times. It no longer opens a flyout, which would duplicate the tab and cover the Method. Reactions chips sit at the top of the Notes tab. Cook remarks move from the old flyout to the Cooked tab list (they are cook entries); the Notes tab holds version notes only. **Proposal.**
5. **Keyboard.** 1, 2, 3, 4 switch the rail tabs (Ingredients, Notes, Cooked, Photos; fixed positions, an absent tab ignores its number). N = Notes. S = Share (unchanged), E, comma unchanged. Left and Right arrows move between tabs only while a tab has focus (arrows are not global, they would fight with scrolling the panes). Esc closes an open step photo. Digits are free in the notes' list of registered keys, but `desktop-keys.js` and `desktop-global.js` were not read (recon notes 6), so a clash is unverified. The numbers are in the tab `title` and the demo panel, not drawn on the tabs (a `.kbd` next to a badge read as a second count; try again once the keys list `?` exists).
6. **Tabs are ARIA tabs** (`role=tablist/tab/tabpanel`, roving tabindex). All panels are in the DOM, only the selected one is shown. Photos grid is drawn on tap ("Show N photos (loads on tap)"), keeping the P-D20 load order.
7. **Empty is absent.** Cooked tab is not drawn when there are no cooks (`?r=nocooked`), the row-B proof reads "Not cooked yet" (the "Cook it once and the thumbs and notes start here." line moves into the Notes empty state, which keeps its next action). Photos tab is absent with no photos. Notes tab always stays: "No notes yet." plus Add a note.
8. **Serves stepper + time sit at the top of the rail (row B, left).** The stepper rewrites the Ingredients, so it lives directly above them, and Make it's `n=` follows it. Time next to it.
9. **Versions, History, proof sit in row B right (over the Method).** The version strip is one segmented control here (names truncate at 104px, full name in the tooltip; italic = Trying). History link with `,` hint (hint hidden under 1440). Proof is "Cooked 4x" plus up to 8 dots, a button that opens the Cooked tab. "Last cooked 2 days ago" is in the tooltip and the Cooked tab, not on the row (no room at 1280).
10. **Plan it / Make it: top of the Method column, end of row B, always visible.** Reason: the page does not scroll, so a fixed bottom bar buys nothing and would cost 64px of height at 720; Make it also sits right above the steps it starts. Cost: the build's bottom bar is replaced (kitchie project-plan 1634 kept that bar), and the buttons are far from the bottom-right thumb on a very big screen. "Planned Tue" replaces Plan it when planned (toast only). Hold for Tue lives in the Ingredients pane head.
11. **Header (row A):** back + recipe name (two-line clamp at 1.45rem, tooltip has the full name) + banner thumbnail (button, opens Photos tab; the banner no longer takes a hero) on the left; on the right Notes pill, star, edit pencil, Share pill (with count and S), More. Same elements as today, one row. Share is absent when the household may not share (`?r=short`).
12. **Step photos become 112x63 thumbnails** (160x90 from 860px tall, 208x117 from 1000px) beside the step text instead of a 150px strip. Click expands the whole photo in place under the step, click or Esc returns (matches today's behaviour). "Photo being prepared" keeps a dashed frame.
13. **Ingredient groups** (long recipe): small caps headings in rail and Method. Data gap, see below.
14. **Pantry:** dot, missing outline, cart button on a missing row, quantity right aligned tabular, `amount?` chip, "(optional)", Hold for Tue, "Add all N missing". All kept from the page.
15. **Sources:** "Where it came from" line is at the end of the Method scroll.

## Where the extras go

| Anatomy element | Where in option C | Notes |
|---|---|---|
| Back to Recipes | Row A, far left | same markup `.back`; in-place Back unchanged |
| Top-bar title | h1 in row A, always shown | no scroll-spy title needed |
| Notes and reactions pill (N) | Row A right | now selects the Notes tab (decision 4); `.rb-notesbtn` |
| Star | Row A right | `.ib.bare[data-star]` |
| Edit pencil (E) | Row A right, plus section pencils in each pane head | unchanged |
| Share (S) | Row A right, labelled pill with count | absent if not shareable |
| More | Row A far right | sheet unchanged |
| State band (Trying / Put away) | not drawn. Proposal: a one-line band between row B and the panes would cost 40px, so it replaces the version strip's row only when needed (needs a decision) | cost listed below |
| "An assistant changed this" | red dot on the version button (as in the strip today); the line itself not drawn | gap |
| Banner photo | 44px thumbnail left of the title; full size is the first picture in the Photos tab | no hero |
| Title, version pills | h1 + the segmented version control (single version: one pill "Original . Our usual") | |
| Time, Serves | Row B left over the rail | decision 8 |
| "From parent . History" | History link in row B right (the "From" part is not drawn; the Original/With peas strip shows lineage) | gap |
| Proof band | Row B right: "Cooked 4x" + dots, opens Cooked tab; "Not cooked yet" when empty | decision 9 |
| Version strip | Row B right, segmented, 3 versions fit | 5+ versions will not fit (see below) |
| Jump row (Ingredients / Method / Notes / Cooked / Photos) | replaced by the rail tab strip (Method is always visible, so it has no tab) | R-O2 A (one scroll, anchors) is reversed here |
| Ingredients | Rail tab 1, default | |
| Method | Right column, always | |
| Notes | Rail tab 2, badge | cards, inherited dashed, "changed in this version" |
| Cooked | Rail tab 3, badge | date block, quote, verdict, "N ate"; remarks live here |
| Photos | Rail tab 4, badge | gallery and cook photos on tap |
| Where it came from | End of Method scroll | |
| Plan it / Make it | Row B right, top of Method | decision 10 |
| Notes flyout (right lane) | Not used by this page | replaced by tab; Share, Edit and Plan lanes still open on the right |
| Toasts, sheets | unchanged (toasts shown; sheets/lanes not drawn) | |

## Measured fit (headless Chromium, Playwright; screenshots in `screenshots/`)

Horizontal scroll: none in every state and size. Page-level vertical overflow: 0 px everywhere (the page is a fixed viewport). Inner overflow below is the pane's scrollable excess in px (rail pane / Method pane). Dark and light give identical numbers.

| State | 1280x720 | 1440x900 | 1920x1080 |
|---|---|---|---|
| typical (Ingredients tab) | 0 / 0 | 0 / 0 | 0 / 0 |
| typical, Notes tab (5 notes, `r=notes`) | 0 / 0 | 0 / 0 | 0 / 0 |
| typical, Cooked tab | 0 / 0 | 0 / 0 | 0 / 0 |
| typical, Photos tab (grid opened) | 0 / 0 | 0 / 0 | 0 / 0 |
| not cooked yet (`nocooked`) | 0 / 0 | 0 / 0 | 0 / 0 |
| short | 0 / 0 | 0 / 0 | 0 / 0 |
| long (24 ingredients, 14 steps) | 540 / 445 | 484 / 450 | 304 / 351 |

So the typical recipe fits with nothing scrolling at 1440x900 and 1280x720 (and 1920x1080), also with the Notes, Cooked and Photos tabs open. At 1280x720 the Notes tab with 5 notes fits only because `c-short.css` tightens note padding and the reactions row; a sixth note would scroll that pane. Long recipe: only the two panes scroll, header, row B and tab strip stay. Files: `{typical-ing,long-ing,notes-notes,short-ing,typical-cooked,typical-pho,nocooked-ing}-{1440x900,1280x720,1920x1080}-{dark,light}.png` (42).

## Costs and buys

Buys: no page scroll for ordinary recipes; ingredients column only as wide as it needs (about a third of the width, no wasted white); Method gets the room and reads in one column beside its photo; notes are one key away and counted; no flyout covering the page; the same data and markup as the build.
Costs: the tab strip replaces an owner-decided jump row (R-O2 A); the bottom Plan it / Make it bar moves; step photos are small until clicked; the page is a fixed-height app screen, so browser find-in-page and zoom above 125% will push more into the panes' scroll.

## What is NOT solved (honest)

1. **Notes and Ingredients are never visible at the same time.** The owner said ingredients and notes should live in the same left column; here they share the column, not the view. Someone cooking who wants to check "frozen peas fine?" against the list has to flip tabs. The badge on Notes only tells them notes exist. A note that says "double the rice" cannot sit beside the rice. Mitigation to consider (not drawn): pin the single newest note of this version under the ingredient list when there is room.
2. Long recipes still scroll two panes independently; the ingredient list and its group headings can scroll away from the step being read (no sticky current group).
3. Five or more versions do not fit the version strip (needs a menu); a very long version name truncates at 104px.
4. State band (Trying / Put away, Keep it / Bring back) and the "An assistant changed this" line are not drawn; they need a thin conditional band under row B (about 40px, typical at 1280x720 has about 60px spare in the Method pane, so it would still fit).
5. Per-step ingredient chips (cook mode, kitchie#810) are not drawn; the Method column has width for them.
6. "Last cooked X days ago" and "From <parent>" are demoted to tooltips and the Cooked tab.
7. Below 1280 wide: rail 300px, labels trimmed; only checked that nothing breaks, not designed.
8. Browse in-place swap (`recipes-browse.js openFull`) not tested with this DOM; hooks `#rtab`, `h1`, `.top a.back`, `[data-notes]`, `[data-note]`, `#t-notes-fly` are not all kept (`data-notes` becomes `data-gonotes`).
9. Photos are drawn as colour and emoji placeholders, not images; real image load order was not exercised. Sample numbers are invented.

## Data gaps

- Ingredient and step `group` (Lamb / Beans / Salsa verde) is dropped by `IngredientLine`/`StepLine` (types.ts:58-69) and `client.ts:217`; the long sample draws groups and needs the wire carried through (recon 3.2). Flagged in the Demo panel on `?r=long`.
- Prep vs cook minutes are not shown (only total).
- Photos count in the tab badge needs gallery plus cook photo counts available without fetching the grid.

## Differences from existing recipe mockups and the build

Reused names: `.rtab .top .back .ib .ib.bare .serves .mc .ing .nm .q .dot .miss .mini .ico .hint .stp .nb .timer .psp .pf .note .inh .from .hist .d .t .pgrid .pmore .src .lbl .lblrow .rb-notesbtn .rb-pillcnt .rb-react .rb-rc .rb-av .rb-th .rb-dots .rb-empty .rb-btn .pri .shr-chip .shr-n .kbd`, tokens only from `theme.css`.
Differences: (a) new layout classes `.rd .rail .tabs .pane .meth .bandL .bandR .vstrip .vb .proof .hl .thumb .scroll .grp .pfoot` (a build adds them in a desktop-only file, never `css.ts`); (b) `.top` holds the h1 and the thumbnail instead of title-on-scroll; (c) `.vstrip` is segmented here, not the sticky strip form; (d) jump row `nav.jumps` removed; (e) step photos are thumbnails; (f) `.act` bottom bar removed; (g) Notes pill is a tab link, not `openNotes()`; (h) the page is rendered by `c.js` from sample data (mockup only), the build keeps server-rendered markup.

## Default path loads (AGENTS.md performance rule)

Loads: `theme.css`, `theme.js`, `c.css` (about 14 KB), `c.js` (about 17 KB, includes sample data), `c-short.css` only under 800px tall. Deferred: other themes (on choice), the Photos grid (on tap), banner/step photos in the build (as today, banner last). Nothing fetched on tab switch: all panels are server-rendered in the build; only Photos is lazy.
