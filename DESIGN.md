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

Each job touches only the aspects it needs. A job does not have to show everything we know about an item just because we know it. What a job does not need is left out of that view, not just made quieter.

Jobs are written up under `docs/knowledge/jobs-to-be-done/` (one file per job, same sections, see its README). Update the job's file and its mockup together. Mockups don't need to solve how a job is detected, but the knowledge of how it will be detected must be in the job's file, ready for the implementation.

Don't bake in detail we have not derived yet (for example how freshness or amounts are ranked). Leave those open.

## 2. One token set drives everything

- All colour, radius, and type come from `theme.css` tokens. No per-page or per-component overrides, no raw colours in page CSS.
- A theme is only different values for the same tokens. Never a different structure.
- Controls, widgets and spacing must look like one family on every page, in every theme. If a new page needs a new control, add it to the shared styles first.
- `kitchie` and `kitchie-day` are production's palette exactly (Kitchie `server/src/layout.ts`). Any new theme must still read as the same family, and is checked against production, not invented in a vacuum.
- Ten themes are shipped to pick from, to be narrowed to three or five later. The picker is tucked behind one small button, bottom right, in the same place on every page (inside Controls in the household flow). It must not take space from the mockup itself. Check new work in at least one dark and one light theme.

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

## 6. Performance: load only what this person needs now

Owner direction, 6 October 2026. Speed is a design constraint. Every screen is designed together with what it loads. Tracked in [platform issue #34](https://github.com/basement-bridge/platform/issues/34).

Asset loading (icons, images, bundles) is lazy and progressive, decided in three layers:

1. **Product boundary (structural).** Platform knows which assets belong to which product (Kitchie, Recipe). Code-splitting follows those lines.
2. **Entitlement, fine-grained.** Not only "does this household have the product" but "does this member have this feature". Check at whatever granularity a feature boundary exists, and prune assets and bundles at the same granularity. A feature the person is not entitled to inside an entitled product does not load its assets either, even if they click into it. This is our own architecture (server-known membership and entitlement decide what is fetchable), not an off-the-shelf pattern.
3. **Interaction timing (progressive, on demand).** Within what is entitled, load on engagement, not on page load.
   - Sign-in or sign-up does not load the ~20 role icons: most people take the default. Fetch them asynchronously only when the person engages the role picker (focus or first interaction).
   - A second-page post-login step loads only if the person reaches it.
   - Past the picker, the icon set is not needed again.

Standard patterns this maps to: route-based code-splitting with dynamic imports (do not load the next screen until it is reached) and intent-based, interaction-triggered prefetching (hover, focus, first interaction).

In the mockup the themes are the first worked example: the default path loads only the two default themes, any other theme is a separate file fetched on choice, and the picker warms the rest the first time it is engaged (`theme.js`, `themes/`).

For a mockup screen, say in its notes what the default path loads and what is deferred, and why that is reasonable at this stage.

**Migration TODO (do not lose):** this section lives here only while the mockup is the working copy. When the mockup is migrated into the real repos, copy it into every repo's own design doc (platform, Kitchie, Recipe). Tracked in issue #34.

## 7. Form factors and responsive loading

Owner decision, voice session, 8 October 2026. Extends section 6: the same "load only what this person needs now" rule, applied to screen size.

1. **Three form-factor buckets.** Phone (under ~600px), tablet (~600 to 1024px), desktop (above ~1024px). Pure CSS width-based breakpoints. No touch or pointer detection.
2. **Layout per bucket.**
   - Phone is the baseline: a single-column flow at its natural width.
   - Tablet is the same single-column flow, relaxed wider to use more of the screen. Not two-pane, not a redesign.
   - Desktop and laptop (1024px and up) is a left rail, an off-centre column and a side panel (owner decision, chat, 9 October 2026, after voice direction the same day that desktop was "a big phone version"; replaces the earlier centred single column). The bottom bar becomes a rail down the left edge. The main column sits beside the rail, not centred. Where a screen has a detail (Pantry: the item; Home: Cooking ideas) it opens in a side panel instead of the phone's bottom sheet. The rail, the column and the panel are one group anchored on the left: the panel starts where the column ends, so the space between the list and the panel is always one gutter (48px), on any window; free space collects to the right of the panel, never between the lanes (owner, 9 October 2026). Below about 1224px the column gives up width so the panel never covers it. The top-bar-and-drawer alternative was dropped. See `fragments/desktop/` and `docs/knowledge/desktop-layout.md`.
3. **One shared responsive system.** The spacing scale and the content max-width per bucket are shared tokens (section 2), applied by default to every screen. Do not hand-craft layouts per screen or feature. A screen that earns an exception says so in its notes.
4. **JS is CSS-first.** The default is one shared JS bundle for all form factors, because most responsive differences are CSS only. Split into per-form-factor bundles only for the rare screen whose interaction behaviour (not just layout) genuinely diverges by device. That is an explicit exception, not the default.
5. **Where splitting is used.** Server-rendered first, with the small deferred vanilla JS already practised. The server reads a viewport or device hint from the request and serves the pre-built, already-minified bundle for that bucket. Bundling, minification and splitting happen at build or deploy time, never per request, so the only runtime cost is a cheap lookup.
6. **Decision record: no framework.** No JS framework is adopted for this (not Next.js, Astro or similar). It stays hand-rolled and vanilla while the number of genuinely divergent screens is small. Revisit only if that number grows enough to become its own maintenance burden.
7. **Verification.** UI changes are checked with screenshots at the bucket widths (360 and 390 phone, 768 tablet, 1280 desktop), in light (`kitchie-day`) and dark (`kitchie`). The script is `tools/screenshots.mjs` (see below).

### Responsive tokens (built 8 October 2026)

Defined once, at the top of `theme.css`, so every page that loads the theme has them. Themes never override them. Breakpoints are literals (`600px`, `1024px`) because media queries cannot read variables.

| Token | Phone (<600) | Tablet (600-1023) | Desktop (1024+) |
|---|---|---|---|
| `--content-max` | 100% | 720px | 840px (pages without the rail layout) |
| `--gutter` | 16px | 24px | 32px |

Desktop rail layout tokens (settled 9 October 2026; widths are proposals the owner did not object to): rail 88px, column 640px plus a 48px gutter each side (a 736px lane), panel 400px. They apply to screens with the rail; the gap rule is in section 7, item 2.

Shared in every bucket: spacing scale `--sp-1..--sp-7` (4, 8, 12, 16, 24, 32, 48px) and `--tap` (44px, minimum height of any control). `.wrap` in `shared.css` uses them, so every index and fragment page gets the three buckets with no per-page CSS. A page that needs side by side options uses the shared `.grid` / `.opts.two` rule: one column on phone, two from 600px up.

**Proposal** (owner was silent on the numbers): 720 and 840 for the tablet and desktop caps, and 16, 24, 32 for the gutters. Tablet is 720 so it reads as the phone column relaxed, desktop 840 so the cap stays well inside a laptop width and the two option cards still fit side by side. Change the two `--content-max` values in `theme.css` to retune every screen at once.

### Screen exceptions

- Desktop rail layout (1024px and up): not an exception any more, it is the desktop layout (item 2 above). The household flow below still keeps its phone frame.

- `flows/household/`: this screen is the phone app itself, so it keeps a phone frame instead of a flowing column. Phone: full bleed. Tablet: the app as a centred 390px frame. Desktop sizes (1024px and up) are the desktop screens in `fragments/desktop/`, reached as a mode with the hidden Device control (`fragments/device.js`: move to the top edge or press the backtick key; it lists Phone 390 × 844, Tablet 768 × 1024 and desktop 1024 × 768 up to 2560 × 1440). The prototype Controls panel is hidden at every size and opens from the Device control. Layout code is in the flow's `styles.css`.
- Fragment pages draw their phone mockups at fixed widths (300 to 390px). That is the content being compared, not the page layout.

### Screenshot script

`tools/screenshots.mjs`: captures every screen in the list at 360, 390, 768 and 1280, in both themes, full page, and prints checks (sideways scroll, controls under 44px, `.wrap` wider than `--content-max`, theme not applied). Inline text links are exempt from the 44px check. Run:

    python3 -m http.server 8123 &
    npm i --no-save playwright-core@1.56.0
    PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/screenshots.mjs shots   # optional: --only=plan-week

A new screen is added to the `SCREENS` list in the script. Output in `shots/` is git-ignored.

**Keep in sync:** this file is the canonical copy of sections 6 and 7 while the mockup is the working copy. Kitchie carries a derived copy of the section 6 rules in its `AGENTS.md` ("Performance and regression guard", 7 October 2026), and this repo's `AGENTS.md` points here. Platform, Recipe and infra carry no copy yet (the section 6 migration TODO is still open). Section 7 has not been propagated to any repo yet, and Kitchie's `AGENTS.md` "Form factors and responsive layout" still says desktop is one 840px column; it needs the owner's edit to match the desktop layout in item 2. Propagate it with section 6 when the migration happens (issue #34).
