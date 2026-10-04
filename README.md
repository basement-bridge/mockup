# platform-mockup

Clickable prototype of the household experience across the ecosystem: one kitchen app, access by entitlement.

Static files, no build, no backend, fake data. Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

The side panel (Controls button on a phone) switches who you are (owner or member), whether the household has Recipes, whether the platform is down, and whether the sign-in ends on the next save.

## What it shows

- Invite link, Google sign-in, first arrival, "Add to home screen"
- Today, Pantry, Recipes as sections of one app. A section appears only if the household has it
- Not entitled: Recipes is offered. An owner buys it (fake checkout), a member asks the owner
- Avatar menu: household, invite, AI assistant link
- Platform down (saved list, writes "temporarily unavailable"), sign-in ended mid-save, account not in a household

## Open decisions this prototype assumes

- Only owners can buy. The $4.99 price is an example.
- Platform owns sign-in, household and entitlements. Kitchie and Recipe stay in their own repos.
- Who hosts the shell (platform portal or a product front end) is not decided.
