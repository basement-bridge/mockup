# platform-mockup

Clickable prototype of the household experience across the ecosystem: one kitchen app, access by entitlement.

Static files, no build, no backend, fake data. Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

The side panel (Controls button on a phone) switches who you are (owner or member), whether the household has Recipes, whether the platform is down, and whether the sign-in ends on the next save.

## What it shows

- Invite link, Google sign-in, first arrival with an optional playful kitchen role
- Today, Pantry, Recipes as sections of one app. A section appears only if the household has it
- Pantry mirrors Kitchie's finished list: sort, Recent, area tabs, collapsible areas with an "added in the last 24 hours" marker, use one, used up, search, add item, copy lists
- Not entitled: Recipes is offered. The person who looks after the plan buys it (fake checkout), others ask them
- Welcome: two paths. Joining someone's kitchen ("Arjan and Priya would be thrilled to have you in their kitchen", two names at most) or starting their own (a kitchen of your own, empty). Both end in an optional role picker
- Household: anyone can invite, anyone can cancel an invite. No rank is shown anywhere. Optional playful roles: pick one of ten presets, then tap the icon (28 to choose from), the name or the tagline to change it. Shown next to the name, tap a name to read the tagline
- Home-screen prompt on Today: nothing until 1 hour of use, then once, twice, once over three weeks, then never. Always dismissable
- Avatar menu: household, role, AI assistant link
- Platform down (saved list, writes "temporarily unavailable"), sign-in ended mid-save, account not in a household

## Open decisions this prototype assumes

- The word "Owner" is never shown, but one person still looks after the plan (billing). Only they can buy Recipes.
- Any member can invite and any member can cancel a pending invite (decided).
- Role icons are plain emoji (no files to ship). They look slightly different on each phone.
- The copy for the "own kitchen" welcome is a first draft.
- Install prompt schedule: weeks are counted from the first time the person passes 1 hour of use. "Not now" counts as a showing.
- The $4.99 price is an example.
- Platform owns sign-in, household and entitlements. Kitchie and Recipe stay in their own repos. Who hosts the shell is not decided.

## Look

Colours borrowed from the Kitchie mockups' theme. No font files are bundled, so text falls back to system fonts.
