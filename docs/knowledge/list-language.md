# One list language: Pantry, Recipes and Home, four visual systems

Status: mockup for the owner to review (18 Oct 2026). **Draft. Nothing is built in Kitchie and nothing here is decided.** Phone only (390 wide, checked at 360). Lines marked **Proposal** are choices the mockup made where the owner was silent; **Open** lines are not decided. Merging this mockup settles none of them.

**Update, 25 Oct 2026: the owner locked D.** It is drawn in full, with his decisions, in `pantry-d.md` and `fragments/pantry-d/`. This comparison page stays as reviewed.

Mockup: `fragments/list-language/` (comparison page `index.html`; one phone `app.html?v=a|b|c|d&s=pantry|recipes|home&state=...`; engine `ll.js`, base `ll.css`, one skin per variant `v-a.css` to `v-d.css`, sample data `ll-data.js`, mock only). Check: `tools/list-language-check.mjs` (520 checks at 390 and 360, light and dark, plus behaviour, the shared drive, the comparison page and a no-raw-colour scan).

## What the owner asked

(Relayed.) A screenshot of Kitchie Pantry on a phone at 390 wide: a top row with Filters, a blue +, and search; a category chip row (a tag icon, All selected, Spices++, Veggies, C...); a collapsible group header "Spices++"; plain rows, each with a big bold name and a grey line ("100 g · Spice bin · Spices++", "1 bag · Drawer · Spices++", "Level: plenty", "200 g, old"), a red "Past use by 1 day" flag, a chevron; a floating copy or multi-select button bottom right; a tab bar (Home, Pantry, Plan, Recipes, Shopping with a badge). He is not comfortable with how it looks.

The ask: four genuinely different mobile directions for the Pantry list, the same four visual systems on the Recipes list so he can judge them on both, and a Home per variant. Rules: Pantry and Recipes share one list language (the same drive for sort, filter, group and search, the same row anatomy, density, chips, flags, selection and add); Home may drift but shares palette, type and components; every existing function stays visible; the app's tokens only; light and dark.

## The shared language (what every variant keeps)

| Function | Pantry | Recipes | Same in both |
|---|---|---|---|
| Top row | Filters at the left; + then the magnifier at the right border | Filters at the left; the assistant icon where + is; the magnifier at the right border | position, size, behaviour (the search bar flies over the whole row) |
| Sort | Name, Use by, Added | Best match, Name, Time, Last cooked | the control, where it lives, direction flip, Custom view |
| Filter | Filters sheet: Running low, Expiring soon, Recently added | Filters sheet: Ready now, Starred, Freezes, Has versions | the sheet, the count on the button, Clear, "Show N" |
| Chips | tag or pin toggle, All, the category or location values | layers toggle, All, Ready now, Starred, Batch, Under 30, Added by me | the strip, counts, one pressed at a time |
| Group | Location or Category (C also Use by); fold; "added in 24 hours" count when folded | one ranked list; optionally by readiness | the fold, the header |
| Row | name, grey line, flags, level squares | name, grey line, flags, thumbnail only where there is a banner | the DOM and class names |
| Flags | Past use by N days, Use today, tomorrow, within N days, Running low | All in, N missing, Starred, Freezes, versions | one flag component, four tones |
| Pick several | per variant | per variant | the same entry, the same bar |
| Add | + (receipt scan inside) | the assistant icon (no in-app add, locked) | place and shape |

**Interpretation of "similar sort drive"** (stated, not confirmed): the same controls, positions and behaviour for sort, filter, group, search, add and pick several on Pantry and Recipes, not the same sort keys.

## The four variants

- **A, Dense and sticky.** One sticky head of two rows (Filters, Sort, +, magnifier; then the chips). Two-line rows of 52px, flags tinted at the right. 11 rows on 390 x 844, 97px above the list.
- **B, Cards and thumbnails.** A card per item with a picture tile (emoji or first letter on Pantry, the banner on Recipes), flags as pills underneath, a red edge on a past-use-by card, big group headings, a floating tab bar and the floating pick button. 6 rows, 144px above the list.
- **C, Sections, segmented control, bottom sheet.** A segmented control sets the grouping, each group is an inset card, sort and Status filters live only in the Filters sheet, "Select" sits in the top row. 8 rows, 144px above the list.
- **D, Table.** Column heads are the sort (tap Name, Use by or Ready, Time), the first column is the picture or the tick box, one status chip per row, groups are full-width bands. 11 rows, 138px above the list.

Recommendation: **A** for Pantry and Recipes (space rule, sort one tap away, recipes keep their banner thumbnails, lowest build risk). Home is a separate choice: B's Home (hero card for tonight's idea, two sideways strips) is the one place a card earns its space. Full reasons on the comparison page.

## Home per variant

The three tiles of today's Home (On the way out, Cooking ideas for you, Running low), the lead idea with Plan and Make it, the alternates, Tune ideas. A: the same dense rows in three short lists. B: the idea as a hero card first, then two sideways strips of small cards. C: one inset card per tile. D: three small tables with the same bands and chips. Same components everywhere; layout differs.

## Locked decisions respected

Pantry: Filters left, + and the magnifier right (pantry-search PS-D1 to D5); grouped A to Z by default until a sort or filter is chosen; Out items hidden; Use by stays a sort and filter; groups fold with the 24-hour marker; the Custom view strip; the three-square level; swipe; the half-height item sheet; receipt scan behind +. Recipes: one ranked list; the chips; a thumbnail only where a recipe has a banner; no in-app add; versions shown; nothing deleted; the cooking-ideas pane on Home; "Make it". App: tab order, the production palette, 44px targets.

## Proposals (the owner was silent)

- **LL-P1** Recipes gets Pantry's top row. The always-open Recipes search field (R-D4, 10 Oct) becomes the magnifier. Wrong guess: one more tap to search recipes.
- **LL-P2** Recipes gets a Filters sheet with Sort and Show. Best match is the locked ranking (ready first, then cooked most recently). Another sort or a Show filter makes a Custom view, as on Pantry.
- **LL-P3** Recipes stays one ranked list by default; a button in Pantry's group slot can group it by readiness (same order, with headers). C opens on that.
- **LL-P4** The grey line drops the group the list is grouped by. It shows the category when grouped by location, and in a Custom view.
- **LL-P5** C offers Use by as a third grouping: Past use by, Use soon (up to 3 days), Later, No date.
- **LL-P6** The chevron goes in A and D.
- **LL-P7** Picking several: each variant has its own way in; a bar replaces the tab bar while picking (Pantry: Add to list, Copy, Used up; Recipes: Plan, Add missing, Copy). Wrong guess: the Shopping badge is hidden meanwhile.
- **LL-P8** One flag component, four tones (danger past use by and missing; accent soon, low, starred; sage all in; muted information); wording as in the screenshot; D uses short forms.
- **LL-P9** Level squares only where an item has a level; one primary flag per row; D shows its chip or, with none, the squares.
- **LL-P10** Chips carry counts; the All chip is the total; B alone keeps an "N items" line.

## Open questions

- **LL-Q1** Is Recipes losing its always-open search acceptable? Cost: an extra tap on a screen searched often.
- **LL-Q2** Does Recipes want a Sort at all? Cost: an unused control; one button to remove.
- **LL-Q3** Should Home follow the list variant or be chosen separately? Costs nothing now.
- **LL-Q4** Is red right for "N missing"? It is today's tone; here quiet, with only Past use by loud (B, D).

## Not redrawn (unchanged)

Swipe on rows, the item sheet and recipe page a row opens, the shallow pull to search, receipt scan inside Add, the Out rule, the Custom view strip logic, the three-square level icons themselves, desktop and tablet.

## Build impact if a variant is chosen (not started)

Presentation only for A: the row, flag, chip and top-row markup and CSS; one new sticky head; the Recipes list gains Filters and Sort that today's Recipes list lacks (a small state addition, no Recipe contract change). B and C add new row and section markup; D adds a column-head sort. No data, MCP or contract change in any variant. The same service methods back the controls on both screens (the standing chat-and-UI rule).

## Performance (DESIGN.md section 6)

Default path of one phone: `theme.css`, `ll.css`, one variant stylesheet, `ll-data.js` (mock only), `ll.js`. No image: tiles are emoji or a letter on a gradient; a recipe banner would load by the Recipes list's existing order (planned first, rows on screen plus 5), unchanged. The Filters sheet, the sort menu and the picking bar are built when opened. The comparison page loads all four stylesheets because it shows all four, and draws each phone when it scrolls near.
