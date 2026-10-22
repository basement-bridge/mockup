# Shopping: a link to what's running low

Status: mockup for the owner to review (22 Oct 2026). Not built. No Kitchie issue yet (the owner converts the PR once a direction is chosen). Lines marked **Proposal** are mockup choices where the owner's words were silent. Fragment: `fragments/shopping-running-low/`.

## What the owner said

Owner, by voice, 22 Oct 2026: asked for "a link to running low pantry items from the shopping list". On the laptop he could see the desktop header row ("N to get"); on the phone there is none. Then: "We'd still need the is someone else shopping option. We need the tick as you drop things in the basket small instruction. And we're going to need a way that's just a link to items running low. I don't know. Mock up some options for me and try to maintain as much screen space as we can on the mobile."

## Drawn from kitchie `main` (commit `130945e`, v. 22 Oct 2026; `uat` has no difference in `web-shopping.ts`)

- The Shopping screen on phone and tablet has no header row: `.shop-hd.dh-s` is `display:none` below 64rem (`SHOPPING_CSS`), and the "N to get" count is desktop only.
- Top of the phone screen: app bar, the `.sl-top` slot (the "Is someone else shopping?" card, then any links out), the `#shop-hint` line, the list.
- The empty list already has a "See what's running low" button (`#shop-empty`, `<base>/pantry?show=low`; project plan, Shopping empty-state row).
- "Running low" on Home and in the Pantry preset is the shopping list's `low`, `running_low` and `out` entries by name (`home.ts` `LOW_REASONS`, `lowKeys`), so those items are already on the list.

## Options (phone, 390 px)

| Option | Placement | Height above the list |
|---|---|---|
| A (recommended) | "Running low (3) ›" at the end of the hint line | 0 |
| B | square tile beside the hand-off card | about 12 px |
| C | basket-and-count pill right of the hint | about 20 px |
| D | card after the last line | 0 (56 px below the list) |
| E | basket icon with count in the app bar | 0 |

## Proposals

- **RL-2** Label "Running low", count in brackets (A) or as a badge.
- **RL-3** Count = entries the Pantry preset keeps. Open: is that the wanted meaning?
- **RL-4** Empty is absent: nothing running low, or nothing on the list, draws no link (the empty list keeps its own button).
- **RL-5** A plain link to `<base>/pantry?show=low`; no script.
- **RL-6** Desktop: the same link at the right end of the `.shop-hd` row. Phone placements hidden from 64rem up.
- **RL-7** Tablet takes the phone placement.

## What loads

Nothing new on load: an anchor and a few CSS lines in the existing Shopping block. No script, request or file.

## Checked

Rendered at 390 and 360 px, light (`kitchie-day`) and dark (`kitchie`), states handoff, links and empty: no horizontal scroll, no console errors. Not checked on a real phone.
