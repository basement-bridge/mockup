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
- Home, Pantry, Recipes, Shopping as the bottom bar of one app. Home is a greeting (by time of day) over three tiles: On the way out (opens Pantry on Use by), Running low (opens Pantry on Running low) and Cooking ideas (only if the household has Recipes). Pantry has a three-state toggle: A to Z (default), Use by, Running low. In Running low, swipe a row to add it to the shopping list, or press and hold to pick several and add them together.
- Pantry ribbon: a left toggle switches it between Location and Category; chips scroll sideways, long names truncate, press and hold a chip then drag to reorder. Group headers fold: bold when open, quiet with a count when folded; press and hold one to fold or open them all.
- Filters sheet (button next to the toggle): light Filters and Sort tabs, covers the bottom bar. Status rows (Running low, Expiring soon, Recently added) each have a left toggle and a rotary on the right (drag, scroll or tap to change the window). Location and Category are multi-select chips in two scrolling rows. Clear, Use last filters, and Show N items. After Show the ribbon is replaced by a Custom view strip with Edit and clear. Statuses combine with OR, groups with AND.
-  A section appears only if the household has it
- Pantry mirrors Kitchie's finished list: the A to Z, Use by and Running low toggle, a Location or Category ribbon, collapsible groups with an "added in the last 24 hours" marker, use one, used up, search, add item, copy lists
- Not entitled: Recipes is offered. The person who looks after the plan buys it (fake checkout), others ask them
- Household: anyone can invite. No rank is shown anywhere. Optional playful roles, picked from a grid of icons (six presets, or name your own and choose an icon), shown as a badge on the avatar. Tap a name to read the one-liner
- Home-screen prompt on Today (also as a fragment, see below): nothing until 1 hour of use, then once, twice, once over three weeks, then never. Always dismissable
- Avatar menu: household, role, AI assistant link
- Platform down (saved list, writes "temporarily unavailable"), sign-in ended mid-save, account not in a household

## Shopping (voice spec, 6 Oct)
Its own tab, no headline (the tab says where you are). Flat list. Each row: tick box (in the basket, visual only, hand-drawn scribble, one of five picked per item), what you want in your own words (tap the row; free text, no units), "N left at home" from Pantry, and a softened role avatar with initials only when someone else added it (own items show none). Swipe right = bought now (asks for the amount only if blank), swipe left = remove (Undo toast). "Done shopping" commits every ticked item to Pantry at once. Pantry item detail keeps "Add to shopping list". Not built yet: places to buy (Costco etc.), grouping. Open: whether blank amounts should be asked in the batch path (the mockup assumes 1).

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
