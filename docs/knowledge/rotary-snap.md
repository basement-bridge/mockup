# Quick controls: rotary snap, one-time wiggle, wide Text size (phone) — kitchie #1110

Fragment: `fragments/rotary-snap/`. Check: `tools/rotary-snap-check.mjs`. Phone only; the desktop window and every `?win=1` page are untouched. Built into UAT in the same session.

## Owner (Arjan, low vision), 25 Oct 2026

Decisions for the phone Settings quick controls (rotary built in Kitchie 0.176, Text size in 0.174). Said once; never to be asked again.

## Decided

- **Theme rotary**: always rests on exactly ONE theme, centred, never between two. Each theme fills the row (mandatory scroll-snap, one stop per swipe); the neighbours do not peek in from either side. No arrows, no dots, completely clean.
- **Swipe only changes the theme.** A tap on the visible theme does nothing (more intentional). Kept: `touch-action` that lets a finger pan sideways, double tap resets to Kitchie's own look, arrow keys choose, radiogroup for assistive tech.
- **One-time wiggle** (the hint that it swipes): the first time this area is in view on this device the strip eases a few pixels left, then right, and settles centred on the current theme, once. Remembered per device (`localStorage` `kitchie.rotary.hint`, every access guarded). Never again after it ran or after a swipe. Skipped for reduced motion (the phone's or Kitchie's own). It must not change the theme or fire the apply handler, and does not run while the search has focus or during a drag.
- **Text size**: one label, "Text size", and nothing else. No "smaller" / "larger" end words, no value line. The seven steps get the full row: as wide as the phone allows, aiming at 44px at 360. Match my phone stays in the middle (the dot), double tap resets, keyboard unchanged, compact chip mode kept.

## How it was drawn

- The wiggle is a transform (about 1.3 seconds, 12px each way), not a scroll, so it fires no scroll event and cannot be read as a swipe. The browser re-snaps to a snap area that has moved, so the snap is switched off for the length of the wiggle and back on at rest (found in the first run of the check: otherwise the strip scrolls against the transform and nothing seems to move).
- A short drag that does not pass the middle springs back to the same theme: that is what mandatory snap means; a flick or a drag past the middle moves on by one.
- The pin leaves the right-hand column of the Text size tile and hangs in its top corner on the label's line; the bar is a row of its own, edge to edge inside 5px of tile padding.

## Measured (Text size step, the finger's target; drawn bar is 2px narrower)

| Phone width | Bar | Step |
|---|---|---|
| 430 | 378 | 54.0 |
| 390 | 338 | 48.3 |
| 375 | 323 | 46.1 |
| 360 | 308 | 44.0 |
| 320 | 268 | 38.3 |

Seven steps of 44px are 308px; a 360px phone has 320px inside its gutters, so 44px is exact at 360 and the most it can be. Below 360 the steps are under 44px tall-by-wide (they stay 44px tall). **Fallback if 44px is ever needed at 320**: let the bar take the tile's full width by dropping the 5px side padding (steps 40px), or show five steps (a larger decision for the owner; not proposed now).

## Open

- Three or four pinned controls (chips): an opened Text size chip shares its row with the other chips; its steps are 25px at 390. Proposal: opening the Text size chip takes the whole row and the others drop under it, which makes the row taller when it opens (the owner earlier said nothing should jump). Needs the owner.
- Not tried: a real phone (the feel of the snap under a thumb, the wiggle's pace), VoiceOver and TalkBack activating a theme (a click with no pointer still chooses it).
