# DESIGN.md

How design work in this repo is done. Read before changing any mockup. Principles, not specifics: details are derived as we go.

## 1. Start from the job to be done

Every screen begins with: what is this person here to do right now? Layout, and what leads, follow from that answer, never from a fixed template.

Jobs we design for (not exhaustive):
- cooking right now
- about to go shopping
- scanning things from the physical world into the app
- planning meals for a week
- finding what will go off and making the most of it
- cooking something led by one main ingredient

It is not always obvious which job someone is in. Design as if the job matters, and leave room to infer it or ask. Do not default to one static view and call it done. Information architecture is part of the design, not only the look.

Don't bake in detail we have not derived yet (for example how freshness or amounts are ranked). Leave those open.

## 2. One token set drives everything

- All colour, radius, and type come from `theme.css` tokens. No per-page or per-component overrides, no raw colours in page CSS.
- A theme is only different values for the same tokens. Never a different structure.
- Controls, widgets and spacing must look like one family on every page, in every theme. If a new page needs a new control, add it to the shared styles first.
- `kitchie` and `kitchie-day` are production's palette exactly (Kitchie `server/src/layout.ts`). Any new theme must still read as the same family, and is checked against production, not invented in a vacuum.
- Themes shipped: Kitchie Night, Kitchie Day, Marmalade, Blueberry, Herb Garden. Every page offers the picker. Check new work in at least one dark and one light theme.

## 3. Playful over clinical

- Anything human-facing (roles, empty states, prompts) leans playful: an icon, a shape, a short line.
- Avoid the title-plus-description list. That is the "1990s web form" failure mode. Icon first, words short, detail on demand.
- Playful never costs clarity or accessibility: 44px touch targets, labels on icon-only buttons, contrast in every theme.

## 4. One visual family

Kitchie, Recipe, platform and their mockups are one product to the person using them. Check a new mockup against the others' theme before introducing anything new.

## 5. Options, not a single take-it-or-leave-it

- When a decision is genuinely open, show options side by side.
- Mockups are drafts until the owner says a piece is settled.
- **Fragments** are single items still in deliberation. **Flows** are complete or significant end-to-end parts. A settled fragment graduates into a flow. The index separates the two.
- Open questions are written on the fragment, not buried.
