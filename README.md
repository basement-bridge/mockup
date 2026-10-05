# platform-mockup

Clickable prototype of the household experience across the ecosystem: one kitchen app, access by entitlement.

Static files, no build, no backend, fake data. Open `index.html` (the index) in a browser, or serve the folder:

    python3 -m http.server 8000

The side panel (Controls button on a phone) switches who you are (owner or member), whether the household has Recipes, whether the platform is down, and whether the sign-in ends on the next save.

## Layout

- `index.html`: the index. **Flows** are complete or significant end-to-end parts. **Fragments** are single items still in deliberation; once clear they fold into a flow.
- `flows/household/`: the clickable household prototype (below).
- `fragments/`: `mid-cook`, `pwa-cta`, `item-row-axes`, `inventory-home`.
- `theme.css` + `theme.js`: the single token set and the theme picker (ten themes) used by every page. `shared.css`: layout for the index and fragments.
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

## Open decisions this prototype assumes

- The word "Owner" is never shown, but one person still looks after the plan (billing). Only they can buy Recipes.
- Any member can invite and any member can cancel a pending invite. Who may cancel is not decided.
- Install prompt schedule: weeks are counted from the first time the person passes 1 hour of use. "Not now" counts as a showing.
- The $4.99 price is an example.
- Platform owns sign-in, household and entitlements. Kitchie and Recipe stay in their own repos. Who hosts the shell is not decided.

## Look

Ten themes drive every page from one token set. Two are production's palette exactly. No font files are bundled, so text falls back to system fonts.
