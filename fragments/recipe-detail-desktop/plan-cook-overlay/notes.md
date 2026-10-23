# Plan it and Make it on the banner (variations A, B, C)

Kitchie issues #830 and #898. **Decided by the owner, 18 October 2026: C (top-right stack), with adaptive contrast. A rejected ("insensible"), B rejected ("yucky"). Button renamed Make it. Mockup stage, not approved for build.** Decisions log: `../notes.md` 7.4 and 7.5. Live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/plan-cook-overlay/index.html

Owner (voice, 18 October 2026): move Plan it and Make it so they sit directly on the hero banner image, always visible (not on hover), instead of the second hero row. He wants a few options before locking.

## What changes, and what does not

Each variation loads the recommended page's own `recommended.css`, `recommended-wide.css`, `recommended-data.js` and `recommended.js` unchanged, then adds `overlay.css` / `overlay.js` (shared) and `variant.css` (one per option). `rebase.js` only repoints the sample banner paths. Overlay markup is made by `overlay.js` in the mockup; in the build the hero template would draw it directly (the existing Plan it / Make it elements move, with their handlers and "Planned Tue" label).

- **Row two** (Serves, time badge, version chip, History icon) stays, left aligned. Hero height at 1280x720 is 190px against 194px; it barely tightens because the Serves button (40px) sets the row height. Row one (title and Share row) is untouched.
- **No banner (decided by the owner, 24 October 2026, RD-NB1 to RD-NB4, `../notes.md` 7.6):** no overlay, and Plan it and Make it **swap rows with the socials** (pill, Like, Edit, Share, More): row one is back, title, Plan it, Make it; row two is Serves, time, version, History and the socials at the right. Same two rows, same hero height. Drawn in both themes at 1440x900 and 1280x720: `c/adaptive/nobanner-swap-*.png`. Before this the buttons stayed at the right of row two. A tinted placeholder band would only add height.
- **Banner is a click target** (the whole band opens the photo viewer, same viewer as the Photos tab, banner is photo 1), with a 40px glass magnifier as the visible cue, always shown. Esc returns focus to the banner. This did not exist in recommended/.
- **Keyboard order:** rail nav, Enlarge banner photo, Back, Notes and reactions, Like, Edit, Share, More, Serves, version, History, Plan it, Make it, then the rail tabs. Same as today plus the banner stop. The overlay layer is a later sibling placed over the banner by position, so focus order does not follow the banner's visual top.

## Options

| | Buttons | Backing | Magnifier |
|---|---|---|---|
| A (rejected) | bottom right, solid (Plan it surface, Make it accent), 44px | corner scrim, bottom right | top left |
| B (rejected) | bottom centre, in one dark glass capsule, 40px buttons | glass (blur, 80% dark) plus soft bottom scrim | top right |
| C (chosen) | top right, stacked (banner 112px and over) or a row (shorter) | corner scrim, top right | bottom left |

## C: adaptive contrast (owner requirement, 18 October 2026)

`c/adaptive.js` (after `overlay.js`), `c/variant.css`. It samples the banner behind the stack and switches the button style; the header comment of the script is the spec. Summary:

- **Sample:** `drawImage` of just the region behind the stack (+8px), mapped through the img's object-fit and object-position (so cropping and resize are right), onto a 32px canvas; mean, p10 and p90 relative luminance.
- **Style:** dark region, light buttons (`on-dark`: cream Plan it, amber Make it, white edge); light region, dark buttons (`on-light`: ink Plan it #14231D, deep amber Make it #6B4200, near-black edge). Break-even about 0.19; hysteresis: to `on-light` above 0.24, back to `on-dark` below 0.15.
- **Scrim:** 0 on a flat extreme; 30% (50% if the edge is still under 3:1) in the opposite tone when the region is mid-tone (mean 0.08 to 0.4) or busy (p90 minus p10 over 0.35). Steps down only when the lower step clears 3.3:1.
- **Contrast:** label text 9.6 (on-dark) and 8.7 (on-light) at worst; button edge at least 3:1 against the p10/p90 pixel behind it after the scrim.
- **Triggers:** image load, `src` change, banner or stack resize (ResizeObserver, so viewport, label length and 112px row/column switch are covered), theme change.
- **Fallback:** a tainted canvas (cross-origin image without CORS), an unloaded image or no size: `data-ov-adapt="fallback"`, the fixed look (theme buttons on the fixed dark corner scrim). `?adaptive=off` forces it. Without script the page is also the fixed look.
- **Motion:** .28s transitions on colours and the scrim; none under prefers-reduced-motion.
- **Not adaptive:** the magnifier (own dark glass, white icon, bottom left).

Test banners (synthetic 1600x560, `test-banners/`, selected with `?banner=very-light|very-dark|mid-busy|split-light-dark|split-dark-light`) carry opposite-tone bands in the top and bottom 12%, which the banner crops away, so a wrong crop mapping fails. `adaptive-test.html` shows each with the fixed look on the left and adaptive on the right, with live readouts. Screenshots: `c/adaptive/`.

## Contrast of the original fixed buttons (WCAG AA, text 4.5:1)

Light theme: Plan it #1D2A24 on #FFFFFF 14.9; Make it #FFFFFF on #8A5600 6.2. Dark theme: Plan it #F3EEE3 on #172A23 13.0; Make it #0F1E19 on #F2B84B 9.6. B: white on the glass, worst case over a pure white photo, 10.4. The buttons are opaque in A and C, so the photo never reaches the text. Checked by eye on a near-white, a near-black and a black and white checkerboard banner (`banner-*` screenshots).

## Tests (Playwright Chromium, /opt/pw-browsers/chromium)

`tools/plan-cook-overlay-adaptive-check.mjs` (247 checks, 43 new for the no-banner swap): five test banners at 1280x720, 1440x900 and 1920x1080 judged against the real rendered pixels behind the stack (screenshot with the overlay hidden, then the real buttons' computed colours and scrim); real typical, short and long banners in both themes; A, B, recommended and inline-edit read Make it and do not scroll; hysteresis ramp; src change; resize; tainted canvas fallback; no-banner; reduced motion; no console errors. The older checks below were done by hand for the first version.

1280x720, 1440x900, 1920x1080; short, typical and long recipes; dark and light; all three options: no horizontal or vertical page scroll, buttons and magnifier inside the banner and not overlapping each other, no console errors. Extra: banner forced to 56px and 72px (buttons shrink to 36px at 56; no collision), Notes flyout open (page narrower), 1024x768 fallback (stacked page), no banner, banner opens by Enter and click, Esc returns focus, Plan it still toasts.

Screenshots in each folder: `typical-*-dark.png`, `long-1440x900-light.png`, `banner-{light,dark,checker}-*`, `short-banner-56px-*`, `nobanner-*`, `notes-open-*`, `fallback-1024x768-dark.png`.

## Not verified

Real banner photos (only the three sample crops and synthetic light, dark and checker images); a banner with a very different aspect than 1600x560 is cropped by `object-fit: cover` like today. Touch and the narrow phone layout are out of scope (desktop only).
