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
   - Desktop and laptop is the same single-column flow, capped at a max-width and centred (Twitter-classic-feed or Basecamp style). Deliberately not the full width of a laptop screen: leave breathing room on both sides.
3. **One shared responsive system.** The spacing scale and the content max-width per bucket are shared tokens (section 2), applied by default to every screen. Do not hand-craft layouts per screen or feature. A screen that earns an exception says so in its notes.
4. **JS is CSS-first.** The default is one shared JS bundle for all form factors, because most responsive differences are CSS only. Split into per-form-factor bundles only for the rare screen whose interaction behaviour (not just layout) genuinely diverges by device. That is an explicit exception, not the default.
5. **Where splitting is used.** Server-rendered first, with the small deferred vanilla JS already practised. The server reads a viewport or device hint from the request and serves the pre-built, already-minified bundle for that bucket. Bundling, minification and splitting happen at build or deploy time, never per request, so the only runtime cost is a cheap lookup.
6. **Decision record: no framework.** No JS framework is adopted for this (not Next.js, Astro or similar). It stays hand-rolled and vanilla while the number of genuinely divergent screens is small. Revisit only if that number grows enough to become its own maintenance burden.
7. **Verification.** UI changes are checked with screenshots at the bucket widths (360 and 390 phone, 768 tablet, 1280 desktop), in light (`kitchie-day`) and dark (`kitchie`). The script is `tools/screenshots.mjs` (see below).

### Responsive tokens (built 8 October 2026)

Defined once, at the top of `theme.css`, so every page that loads the theme has them. Themes never override them. Breakpoints are literals (`600px`, `1024px`) because media queries cannot read variables.

| Token | Phone (<600) | Tablet (600-1023) | Desktop (1024+) |
|---|---|---|---|
| `--content-max` | 100% | 720px | 840px |
| `--gutter` | 16px | 24px | 32px |

Shared in every bucket: spacing scale `--sp-1..--sp-7` (4, 8, 12, 16, 24, 32, 48px) and `--tap` (44px, minimum height of any control). `.wrap` in `shared.css` uses them, so every index and fragment page gets the three buckets with no per-page CSS. A page that needs side by side options uses the shared `.grid` / `.opts.two` rule: one column on phone, two from 600px up.

**Proposal** (owner was silent on the numbers): 720 and 840 for the tablet and desktop caps, and 16, 24, 32 for the gutters. Tablet is 720 so it reads as the phone column relaxed, desktop 840 so the cap stays well inside a laptop width and the two option cards still fit side by side. Change the two `--content-max` values in `theme.css` to retune every screen at once.

### Screen exceptions

- `flows/household/`: this screen is the phone app itself, so it keeps a phone frame instead of a flowing column. It is split by form factor, see "Household flow by form factor" below.
- Fragment pages draw their phone mockups at fixed widths (300 to 390px). That is the content being compared, not the page layout.

### Household flow by form factor (built 9 October 2026)

Owner decision, voice session, 9 October 2026. `flows/household/` was the start-to-finish household flow and was in effect the phone version. It is now explicit, one folder per form factor:

| Folder | Behaviour | Controls panel |
|---|---|---|
| `flows/household/mobile/` | The original. Phone: full bleed. 600px and up: the 390px phone frame, centred. | Behind the Controls button; beside the frame from 1024px |
| `flows/household/tablet/` | **Only tablet relaxes wider.** 600px and up: a centred column of `--content-max` (720px, 24px gutter; 840px, 32px gutter above 1024px), as tall as the window. Phone widths: full bleed. | Behind the Controls button |
| `flows/household/desktop/` | The phone-width (390px) frame stays, centred. Phone widths: full bleed. 600 to 1023px: framed, Controls behind the button. | Always open beside the frame from 1024px |

Kitchie app decision: the phone frame stays on phone and on desktop; only tablet is wider.

- **One shared script.** `flows/household/app.js` (and its deferred `flows/household/fields/*.js`) is referenced by all three `index.html` files. No logic is copied. The script finds its `fields/` folder from its own URL, so it works from any variant folder. A variant tells the script which form factor it is with `data-form="mobile|tablet|desktop"` on `<body>`; the script reads that only for behaviour that genuinely differs (none yet).
- **Own folder, own `styles.css`.** Each variant has its own `index.html` and `styles.css`. Today `mobile/styles.css` and `desktop/styles.css` match apart from their header comments (same frame, same Controls behaviour) and `tablet/styles.css` differs in the form-factor block at the top. They are copies on purpose: the owner expects each form factor may EVOLVE DIFFERENTLY later. Change a variant's file when only that form factor should change; if a change should apply to all three, make it in all three (or move the rule to a shared file when the three have settled).
- **Shared tokens.** All three load `theme.css` for `--content-max`, `--gutter`, spacing and `--tap`, so the buckets above stay the single source for widths.
- **Old address.** `flows/household/index.html` is a tiny redirect to `mobile/` (query string and hash kept), with links to all three, so older links keep working.
- **Scope.** The household flow only. A global per-form-factor toggle is a separate, later idea and is not built.

### Desktop pantry: docked search and refresh on tab focus (mock built 9 October 2026)

Owner decision, voice session, 9 October 2026. Mock only (`flows/household/desktop/`), not built in Kitchie. Proposals are marked; the owner has not approved them. Phone and tablet are unchanged: search stays tucked under Filters (`docs/knowledge/pantry-pull-row.md`).

**Search bar.** Above 1024px only, the Pantry top row (56px, unchanged height) has a permanent, always-visible search bar docked on the left, next to the Filters and Add (+) controls: `[ search ] [ Filters ] [ + ]`. It filters the list as you type, exactly as the tucked search does (same query, same fields), and Escape clears it.
- There is no pull gesture on desktop: the pull-for-search layer is off and a mouse drag at the top of the list does nothing. Below 1024px the desktop page behaves like the others (tucked search, pull).
- **Proposal:** the visible "16 items" count is dropped on desktop. The 390px frame leaves about 176px for the bar beside Filters (105px) and Add (48px), and the count would squeeze it to nothing. The count stays in the page for screen readers. Wrong guess costs: the person cannot see the item total on desktop; fix is a count inside the bar or above the list.
- **Proposal:** no microphone button in the docked bar (no room, and a desktop is less likely to want voice). The browser's own clear (x) shows while there is text.
- With a custom view active (Filters button absent, as on phone) the bar simply takes the space.

**Refresh on tab focus.** When the browser tab regains focus on desktop, the existing mobile refresh animation plays over the search bar (the mock reuses the pull-to-refresh scenes `RF` and styles `.rf`, and the same refresh state, timing and "Up to date" toast; nothing new was drawn).
- The bar dims and the scene (smaller: 52 x 36px icon, 12px text, up to three lines) plays on top of it for 2400ms (1600ms with reduced motion, icon omitted). Filters and Add stay put and usable; on phone the whole row slides away instead.
- A query being typed is left alone and returns when the animation ends; typing focus is kept.
- It runs only on Pantry, never under an open sheet, never while a refresh is already playing.
- **Proposal:** a real focus or tab-visible event is ignored if the last refresh was under 10 seconds ago, so alt-tabbing back and forth does not flicker. Wrong guess costs: a quick return to the tab shows stale data for up to 10s; tune `FOCUS_GAP_MS` in `app.js`.
- **To see it in the mock:** open `flows/household/desktop/` in a window wider than 1024px, go to Pantry (Controls > Jump to > Pantry), then either switch to another tab and come back, or press Controls > Desktop pantry > "Simulate tab focus". The button is only on the desktop page.
- Where the code is: one shared script, `flows/household/app.js` (`isDesk`, `deskSearchHtml`, `playRefresh`, `tabFocusRefresh`; the refresh scenes already existed for the pull), styles in `flows/household/desktop/styles.css` (end of file). The script reads `<body data-form="desktop">` to render the bar, so mobile and tablet pages contain none of it.
- Default path and deferred (section 6): no new request, no new file. The bar is part of the Pantry row markup on the desktop page only; the refresh scenes are the same inline SVG as the pull.

### Screenshot script

`tools/screenshots.mjs`: captures every screen in the list (the household flow as its three variants, `household-mobile`, `household-tablet`, `household-desktop`) at 360, 390, 768 and 1280, in both themes, full page, and prints checks (sideways scroll, controls under 44px, `.wrap` wider than `--content-max`, theme not applied). Inline text links are exempt from the 44px check. Run:

    python3 -m http.server 8123 &
    npm i --no-save playwright-core@1.56.0
    PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/screenshots.mjs shots   # optional: --only=plan-week

A new screen is added to the `SCREENS` list in the script. Output in `shots/` is git-ignored.

**Keep in sync:** this file is the canonical copy of sections 6 and 7 while the mockup is the working copy. Kitchie carries a derived copy of the section 6 rules in its `AGENTS.md` ("Performance and regression guard", 7 October 2026), and this repo's `AGENTS.md` points here. Platform, Recipe and infra carry no copy yet (the section 6 migration TODO is still open). Section 7 has not been propagated to any repo yet. Propagate it with section 6 when the migration happens (issue #34).
