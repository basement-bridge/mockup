# Recipe detail, desktop: no banner photo, Plan it and Make it swap rows with the socials (Kitchie #898)

Status: DECIDED by the owner (typed approval, 24 October 2026); mockup drawn, not built. Follows `fragments/recipe-detail-desktop/notes.md` 7.4 (option C chosen, 18 October 2026) and 7.5 (label "Make it"). Fragment: `fragments/recipe-detail-desktop/plan-cook-overlay/` (`c/index.html?banner=none`). Check: `tools/plan-cook-overlay-adaptive-check.mjs`.

## Owner decisions

- **With a banner:** option C, top-right stack, adaptive contrast, label "Make it" (unchanged; 18 October 2026).
- **RD-NB1 (owner, 24 October 2026). With NO banner photo,** Plan it and Make it swap rows with the Share / Like (socials) row: the two action buttons are on top and the socials drop to the row below.

## Agent defaults (reversible)

- **RD-NB2.** Elements are moved, not copied (handlers and "Planned Tue" stay). Row one: back, title | Plan it, Make it. Row two: Serves, time, version, History | pill, Like, Edit, Share, More. Keyboard order follows the new visual order; the two groups carry aria-labels.
- **RD-NB3.** Same two rows, so the hero keeps its height (116 to 118px at 1280x720 and 1440x900); buttons keep their own style and 44px height; no adaptive sampling or scrim (the card surface is behind them).
- **RD-NB4.** Reached by `?banner=none` (or a recipe without a photo). Under 1280px the page stacks as before and is not drawn.

## Evidence

Both themes at 1440x900 and 1280x720: `plan-cook-overlay/c/adaptive/nobanner-swap-{1440x900,1280x720}-{dark,light}.png`. Check: 247 checks, including: buttons in row one right aligned beside the title, socials in row two right aligned, Serves left of the socials, 44px buttons, tab order, no page scroll, typical and long recipe, both themes, both sizes, with-banner state unchanged. Checked locally only; no live Pages URL was opened.

## Open

Whether a recipe that gains a photo later should animate the swap back (not drawn); real recipes without photos were not sampled beyond the sample data's `?banner=none`.
