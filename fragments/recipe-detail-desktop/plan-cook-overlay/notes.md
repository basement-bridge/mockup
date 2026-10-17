# Plan it and Cook it on the banner (variations A, B, C)

Kitchie issue #830. Open decision, owner not yet chosen. Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/plan-cook-overlay/index.html

Owner (voice, 18 October 2026): move Plan it and Cook it so they sit directly on the hero banner image, always visible (not on hover), instead of the second hero row. He wants a few options before locking.

## What changes, and what does not

Each variation loads the recommended page's own `recommended.css`, `recommended-wide.css`, `recommended-data.js` and `recommended.js` unchanged, then adds `overlay.css` / `overlay.js` (shared) and `variant.css` (one per option). `rebase.js` only repoints the sample banner paths. Overlay markup is made by `overlay.js` in the mockup; in the build the hero template would draw it directly (the existing Plan it / Cook it elements move, with their handlers and "Planned Tue" label).

- **Row two** (Serves, time badge, version chip, History icon) stays, left aligned. Hero height at 1280x720 is 190px against 194px; it barely tightens because the Serves button (40px) sets the row height. Row one (title and Share row) is untouched.
- **No banner:** no overlay; Plan it and Cook it stay at the right of row two (the recommended page's own no-banner strip). A tinted placeholder band would only add height.
- **Banner is a click target** (the whole band opens the photo viewer, same viewer as the Photos tab, banner is photo 1), with a 40px glass magnifier as the visible cue, always shown. Esc returns focus to the banner. This did not exist in recommended/.
- **Keyboard order:** rail nav, Enlarge banner photo, Back, Notes and reactions, Like, Edit, Share, More, Serves, version, History, Plan it, Cook it, then the rail tabs. Same as today plus the banner stop. The overlay layer is a later sibling placed over the banner by position, so focus order does not follow the banner's visual top.

## Options

| | Buttons | Backing | Magnifier |
|---|---|---|---|
| A | bottom right, solid (Plan it surface, Cook it accent), 44px | corner scrim, bottom right | top left |
| B | bottom centre, in one dark glass capsule, 40px buttons | glass (blur, 80% dark) plus soft bottom scrim | top right |
| C | top right, stacked (banner 112px and over) or a row (shorter) | corner scrim, top right | bottom left |

## Contrast (WCAG AA, text 4.5:1)

Light theme: Plan it #1D2A24 on #FFFFFF 14.9; Cook it #FFFFFF on #8A5600 6.2. Dark theme: Plan it #F3EEE3 on #172A23 13.0; Cook it #0F1E19 on #F2B84B 9.6. B: white on the glass, worst case over a pure white photo, 10.4. The buttons are opaque in A and C, so the photo never reaches the text. Checked by eye on a near-white, a near-black and a black and white checkerboard banner (`banner-*` screenshots).

## Tests (Playwright Chromium, /opt/pw-browsers/chromium)

1280x720, 1440x900, 1920x1080; short, typical and long recipes; dark and light; all three options: no horizontal or vertical page scroll, buttons and magnifier inside the banner and not overlapping each other, no console errors. Extra: banner forced to 56px and 72px (buttons shrink to 36px at 56; no collision), Notes flyout open (page narrower), 1024x768 fallback (stacked page), no banner, banner opens by Enter and click, Esc returns focus, Plan it still toasts.

Screenshots in each folder: `typical-*-dark.png`, `long-1440x900-light.png`, `banner-{light,dark,checker}-*`, `short-banner-56px-*`, `nobanner-*`, `notes-open-*`, `fallback-1024x768-dark.png`.

## Not verified

Real banner photos (only the three sample crops and synthetic light, dark and checker images); a banner with a very different aspect than 1600x560 is cropped by `object-fit: cover` like today. Touch and the narrow phone layout are out of scope (desktop only).
