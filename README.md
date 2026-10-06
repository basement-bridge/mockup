# platform-mockup

Clickable prototype of the household experience across the ecosystem: one kitchen app, access by entitlement.

Static files, no build, no backend, fake data. Open `index.html` (the index) in a browser, or serve the folder:

    python3 -m http.server 8000

The side panel (Controls button on a phone) switches who you are (owner or member), whether the household has Recipes, whether the platform is down, and whether the sign-in ends on the next save.

## Layout

- `index.html`: the index. **Flows** are complete or significant end-to-end parts. **Fragments** are single items still in deliberation; once clear they fold into a flow.
- `flows/household/`: the clickable household prototype (below).
- `fragments/`: `mid-cook`, `pwa-cta`, `item-row-axes`, `inventory-home`.
- `theme.css` + `theme.js` + `themes/`: the single token set and the theme picker (ten themes) used by every page. Only the two default themes (Kitchie Night and Day) live in `theme.css`; every other theme is one small file in `themes/`, loaded when chosen and warmed in the background once the person engages the picker (DESIGN.md section 6). `shared.css`: layout for the index and fragments.
- `docs/knowledge/`: what we've learned, per job to be done, for carrying into the implementation.
- `DESIGN.md`: the design brief. Read it before changing anything.

## What the household flow shows

- Invite link, Google sign-in, first arrival with an optional playful kitchen role
- Home, Pantry, Recipes, Shopping as the bottom bar of one app. Home is a greeting (by time of day) over three tiles: On the way out (opens Pantry on Use by), Running low (opens Pantry with the Running low status filter applied, as a Custom view) and Cooking ideas (only if the household has Recipes). Pantry has no toggle on its face: it is the A to Z list grouped by location or category until a sort or filter is chosen in the Filters sheet (Sort tab: Name, Use by, Added). Home's On the way out tile opens Pantry sorted by Use by as a Custom view. Status filters (Running low, Expiring soon, Recently added) live only in the Filters sheet. With Running low on, swipe a row to add it to the shopping list, or press and hold to pick several and add them together.
- Pantry ribbon: a left toggle switches it between Location and Category; chips scroll sideways, long names truncate, press and hold a chip then drag to reorder. Group headers fold: bold when open, quiet with a count when folded; press and hold one to fold or open them all.
- Profile and Settings (match Kitchie's prod pages): the avatar opens the profile menu (Household, History, Settings, Create invite link, your kitchen role, AI assistant, Plan and billing, Download CSV, JSON, Sign out; History, CSV, JSON and renaming only show a prototype note). Settings has the five-theme picker (Kitchie Night, Kitchie Day, Marmalade, Blueberry, Herb Garden), Item name size, seven switches (Show emoji, Reduce motion, Show the spot, Show the amount, Show the use-by date, Show household activity, Compact rows; most change the Pantry rows), Reset to defaults, then Stock checks, Categories (the household's), Your kitchen role, Sample items, Back and Sign out. Not yet entitlement-aware per setting.
- Filters sheet, first version for feedback (not final): each Status is one long pill with its checkbox on the left (tap it, or the name, to turn the status on or off). The rotary on the right is plain text with its arrows, not a second pill, and sets the window; while you drag it the pill's label shows the window value live, and on release the label returns to the status name while the rotary keeps the chosen value. A light vibration ticks on each step where the device allows it (Vibration API; unreliable on iOS Safari). Location and Category rows are one line when everything fits and two scrolling lines only when it does not.
- Pantry: the Filters button sits right next to the Add (plus) button in the header row, so the list has one row less. While a custom view is active the strip's Edit replaces it. First version for feedback.
- Shopping quantity entry (first version for feedback): Save ("Bought it" when buying) is the only button; tapping outside the sheet dismisses it without saving. On Save, a quantity that is exactly an amount and a unit has the unit written in its short form (2 litres, 2 liters or 2 L I T R E S become 2 L; 500 grams becomes 500 g; also mL, kg, lb, oz). Anything else, such as 2 litres of milk or a packet, is kept exactly as typed.
- Custom view strip, three layouts for feedback (switch under the strip, prototype only): A one line, funnel then the active conditions as scrolling pills, then Edit, with the count beneath; B a header line (Custom view, count, Edit, clear) with the pills in a scrolling row below; C the tightest: a funnel button carrying the count, then the pills, then clear. Every pill is remove-only (tap to drop that one condition and refresh the list); adding something back means opening Filters. Removing a pill does not touch the remembered last filters; removing the last one leaves the custom view.
- Sort tab (owner chose option B): the three sort keys (Name, Use by, Added) as one row, and a single button that flips the order, e.g. A to Z / Z to A. Show N items is disabled and reads No items match when the filters would match nothing.
- Profile menu is grouped by job (option A): Get started (timed), Look and kitchen (Settings, kitchen role), People (Household, invite, plan), Connect (AI assistant), My data (History, CSV, JSON), then Sign out. The Get started strip shows Link your AI for the first 2 days and Invite someone for the first 5 days of membership, each dropping off once done; after that they live only in Connect and People. The prototype switch "Member for" at the bottom of the menu previews Day 1, 3 and 6. Settings is split into Look and Kitchen.
- Filters sheet (button next to the toggle): light Filters and Sort tabs, covers the bottom bar. Status rows (Running low, Expiring soon, Recently added) each have a left toggle and a rotary on the right (drag, scroll or tap to change the window). Location and Category are multi-select chips in two scrolling rows. Clear, Use last filters, and Show N items. After Show the ribbon is replaced by a Custom view strip with Edit and clear. Statuses combine with OR, groups with AND.
-  A section appears only if the household has it
- Pantry mirrors Kitchie's finished list: no toggle on its face (sort and Status filters live in the Filters sheet), a Location or Category ribbon, collapsible groups with an "added in the last 24 hours" marker, use one, used up, search, add item, copy lists
- Not entitled: Recipes is offered. The person who looks after the plan buys it (fake checkout), others ask them
- Household: anyone can invite. No rank is shown anywhere. Optional playful roles, picked from a grid of icons (six presets, or name your own and choose an icon), shown as a badge on the avatar. Tap a name to read the one-liner
- Home-screen prompt on Today (also as a fragment, see below): nothing until 1 hour of use, then once, twice, once over three weeks, then never. Always dismissable
- Avatar menu: household, role, AI assistant link
- Platform down (saved list, writes "temporarily unavailable"), sign-in ended mid-save, account not in a household

## Shopping (voice spec, 6 Oct)
Its own tab, no headline (the tab says where you are). Flat list. Each row: tick box (in the basket, visual only, hand-drawn scribble, one of five picked per item), what you want in your own words (tap the row; free text, no units), "N left at home" from Pantry, and a softened role avatar with initials only when someone else added it (own items show none). Swipe right = bought now (asks for the amount only if blank), swipe left = remove (Undo toast). "Done shopping" commits every ticked item to Pantry at once. Pantry item detail keeps "Add to shopping list". Not built yet: places to buy (Costco etc.), grouping. Open: whether blank amounts should be asked in the batch path (the mockup assumes 1).

## Pantry, Shopping, profile menu and Settings (performance, DESIGN.md section 6)

- Default path loads: the household flow's one script and stylesheet, the two default themes, and the screen's own markup. The Pantry list renders only the rows for the current tab; the Filters sheet and Sort tab are built when opened.
- Deferred: the other themes (fetched on choice, warmed when the picker is first engaged), the role icons (only when the role picker is opened), item field editors (first tap of a field), and Stock checks and Categories (built only when you open them from Settings).
- Profile menu: the Get started strip is computed from the member's age and costs nothing extra; it adds no request. In the real app it would come from the member's created date already on the page.
- Settings: every display switch is a browser-only value, so nothing is fetched to show or change them. Entitlement per setting is not modelled yet (open).
- Why this is reasonable at this stage: it is a static mockup. The notes say what the real build must keep: no per-screen bundle for the menu or Settings, and no fetch to open them.

## Item detail (performance, DESIGN.md section 6)

Read first, tap to edit per field: every field production edits is a plain row (name and emoji, quantity, level, location, spot, category, use by, single use, minimum). Tapping a row opens its editor under it and every change autosaves with a short Saved line. There is no Save button. A failed save (platform down, or a bad value such as an empty name or a past date) shows an error on that field with Try again. Mark as used up opens a confirm (with a guard line when two or more items were used up in the last 5 minutes) and ends in an Undo toast; the tick on the pantry list uses the same Undo.

- Default path (opening the screen): only the read rows, built from state already in memory. No editor markup, no option lists, no extra requests.
- Deferred to the first tap of a field: that field's editor and its data, in `flows/household/fields/` (`name.js` has the emoji set, `amounts.js` the unit list, `place.js` the spots per location, `category.js`, `useby.js` the quick pills and date picker, `flags.js`). One file is fetched once, on the first tap of one of its rows, then cached. The date input is built only when Pick date is tapped. The used-up confirm is built only when opened.
- Why this split: the read rows are what the job needs on arrival (look, glance, leave). Editors are needed by a minority of visits, and each is small, so a first tap costs one tiny fetch. Not done yet: prefetching a file on hover or focus of its row.

## Open decisions this prototype assumes

- The word "Owner" is never shown, but one person still looks after the plan (billing). Only they can buy Recipes.
- Any member can invite and any member can cancel a pending invite. Who may cancel is not decided.
- Install prompt schedule: weeks are counted from the first time the person passes 1 hour of use. "Not now" counts as a showing.
- The $4.99 price is an example.
- Platform owns sign-in, household and entitlements. Kitchie and Recipe stay in their own repos. Who hosts the shell is not decided.

## Look

Ten themes drive every page from one token set; the five core ones are Kitchie Night, Kitchie Day, Marmalade, Blueberry and Herb Garden, and none is removed. To add a theme: one `themes/<id>.css` block plus one line in the list in `theme.js`. Two are production's palette exactly. No font files are bundled, so text falls back to system fonts.

### Pantry top row: pull for search, pull further to refresh (for feedback)
At rest the row shows Filters and Add. Pulling the list down 70 px slides them away like a curtain and shows the full search bar (field, mic, Cancel) in the same row. Pulling on to 170 px closes that bar and reads "Let go to refresh"; releasing there plays one of six little kitchen animations (pot, toast, juggling veg, kettle, egg, timer) with its own line, then the row settles back to Filters and Add. Releasing between 70 and 170 px keeps the search bar open until Cancel. Reduced motion shows the text only. Full behaviour, px thresholds and timings: `docs/knowledge/pantry-pull-row.md`. Mockup only, not in Kitchie.
