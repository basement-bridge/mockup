# Mobile Home, full and compact: the quiet switch between them

Mockup: `fragments/mobile-home-view-switch/` (options A to E, each in a phone frame with the full view, the compact view and a live remembered frame). Live: <https://basement-bridge.github.io/mockup/fragments/mobile-home-view-switch/>. Builds on [compact-home.md](compact-home.md) (the desktop Compact view; desktop now drops it), [home-detail-panel.md](home-detail-panel.md) (decisions 133 and 290) and `recipe-ideas/` (the Cooking ideas pane). **Status: owner direction 22 Oct 2026 (voice); five options drawn; every decision below is a Proposal (MV-P) or an open question (MV-Q); nothing is decided and nothing is built.** Series MV so the numbers do not clash with CH, 133 to 292 or the other series.

## Job

Same as Home: decide what to cook now and act on it. Compact is the ask-first version: one question, one answer, nothing else (133). Full is Home as it stands (On the way out, Cooking ideas, Running low).

## Owner direction (voice, 22 October 2026: "build, build, build")

Desktop drops the Compact toggle entirely. Compact lives on mobile: mobile Home can be viewed compact (ask-first, "What are we eating?") or in the fuller view. A few options for the control that switches the view. Not a plainly labelled toggle, not a "Dashboard / Compact view" segmented control, not chunky widget-style pills, no pins that expand on mobile. A very intuitive, almost invisible control, icon-level or gesture-level, not a widget sitting on the page. Each option shows how a first-time person finds it (one quiet hint, shown once, no coachmark spam) and how it signals the current mode without text. The choice is persisted per person, client-side only (a remembered-choice UI setting is never server-side). Screen space is precious and a new control must earn its place and be thumb-reachable. Respect reduced motion; icon-only controls have accessible names; state never relies on colour alone.

## How we know the person is in this job

They are on Home at phone width (under 600px). Which view they want is the person's choice, remembered on the device; Home does not infer it (except option E, which is not recommended on its own).

## What leads

Full: the greeting, then the three cards as today. Compact: the greeting becomes "What are we eating?", then the lead idea (the planned meal, else the top idea) with Make it and Plan, then one plain line of text about what is going off or running low.

## What this job does not need

In compact: no tiles, no other ideas, no pills, no pins that expand, no search. The line under the answer is text, not a control.

## The options

| | Control | First-time discovery | Mode without text | Thumb | Space |
|---|---|---|---|---|---|
| A Header icon | 44px icon button, right of the greeting | Bubble + soft rings, once | Glyph (rows or one card), ring and fill when compact | Poor | 0 |
| **B Pull handle (recommended)** | Handle on the lower edge of the ideas card: drag up, drag down, or tap | Always visible; two nudges and a bubble, once | Short pill + up chevron, or long pill + down chevron | Best | about 36px net |
| C Pinch or hold | Pinch Home, or press and hold the heading (Enter on a keyboard) | Bubble, once; nothing visible | Heading text and a four-dot or one-dot mark | Anywhere, two fingers | 0 |
| D Lens in the search field | Lens at the end of a search field | Pulse and bubble, once | Open ring, or ring with a solid dot | Poor | about 52px (the field) |
| E Home learns | None; tap the heading to override | One note under the answer when Home first changes itself | Heading text and the dot mark | Usually no tap | 0 |

Why B: the only option that costs no distance for the thumb (in compact it moves down with the answer, so the answer, Make it, Plan and the handle are all at thumb height), earns its space, shows its state by shape, has a visible affordance even if the hint is missed, and has a one-tap fallback. Fallback: A (cheapest, most findable, farthest from the thumb). E belongs under another option, never alone. C is not recommended: it turns off the browser's own page zoom on Home and nobody finds it. D is worth it only if mobile Home gets search anyway.

## The remembered choice (all options)

- `localStorage`, client-side only, per device. Key `kitchie.homeView.<memberId>` = `full` or `compact`; `kitchie.homeView.hint.<memberId>` = `1` once the hint has shown; E also keeps `kitchie.homeView.learn.<memberId>`.
- Every read and write is in `try/catch`. Survives reload; another device or browser profile starts at the default; another tab on the device updates this one.
- **Storage unavailable** (private window, cleared site data, blocked, quota): Home opens **full**, the control still works for this visit in memory, the hint is **not** shown (it could never be remembered, so it would repeat), nothing throws. A bad stored value is ignored.

## Proposals (the owner was silent)

- **MV-P1** Default view is Full when nothing is stored or storage is unavailable.
- **MV-P2** The key carries the member id, so a shared device remembers each person.
- **MV-P3** Compact on mobile is the question, the lead idea with Make it and Plan, and one plain text line; no tiles, no other ideas, no pills, no search.
- **MV-P4** The hint shows once per person per device, five seconds, goes on any touch, is marked shown when it appears, and never shows when storage is unavailable.
- **MV-P5** A and D: the glyph shows the layout you are in; pressed also draws a ring and fills the button; the accessible name is constant ("Just tonight's answer") with `aria-pressed` and a polite live region.
- **MV-P6** Thresholds: B drag 32px (tap under 6px, Enter or Space); C pinch below 0.75 or above 1.33, hold 450ms; E three visits in a row.
- **MV-P7** B starts only on the handle (no fight with page scroll); C scopes pinch to the Home scroller with `touch-action: pan-y`.
- **MV-P8** D adds a search field to mobile Home (about 52px, both views); not asked for.
- **MV-P9** The choice changes Home only; it is not synced to a second device.
- **MV-P10** Motion: one 180ms fade of the changed parts, the hint's fade, A and D two rings, B two nudges. Reduced motion: none; a still ring for A and D, a bubble only for B, and the handle does not follow the finger.
- **MV-P11** Every gesture has a single-finger, no-timing alternative (B tap, C Enter or Space, E tap on the heading).
- **MV-P12** Phone width only (under 600px); at 600px and over Home is full and the stored choice is ignored.
- **MV-P13** In B only, compact sits at the bottom of the screen so the answer and the handle are in the thumb zone; in A, C, D, E it stays at the top, where their control or heading is.

## Open questions, with the cost of a wrong guess

- **MV-Q1** Which control? Recommendation B, fallback A. Cost: one small component; the keys and the compact content are the same for every option.
- **MV-Q2** Default for a new person: Full (drawn) or Compact? Full changes nothing for anyone; Compact makes the ask-first screen everyone's first view. Cost: most people see the other view first.
- **MV-Q3** Does a tablet get the switch? Cost: a few lines of CSS.
- **MV-Q4** What compact shows when nothing fits or nothing is planned. Only the "there is a lead idea" state is drawn; the phone pane's empty state (freezer meal, Ask your assistant) is the likely answer. Cost: a half-empty compact screen in those states.
- **MV-Q5** Should Home ever change the view itself (E)? Recommendation: no. Cost: a surprised person and a support question.
- **MV-Q6** Per person on a shared device (drawn) or per device? Cost: the key suffix.
- **MV-Q7** Does mobile Home get search? If yes, D costs only the field.

## For the implementation

- Lift `home-view.css` and the markup that `homeHtml()` in `mock.js` writes. One attribute drives everything: `.home[data-view=full|compact]`; compact is CSS hiding `.tilec`, `.th2` in the ideas card, `.sub` and `.idr`. One render path; no second layout.
- Lift `home-view.js` (`HomeView.mount`). The icon switch ships in the Home bundle; `gestures.js` (drag handle, pinch, hold, learner) loads only for a surface that uses a gesture.
- Default path and deferred: see the page notes. No network call at any point; no server read or write of the choice.
- Check: `node tools/mobile-home-view-switch-check.mjs` (138 checks: every option, frame and theme; behaviour; persistence; storage blocked and throwing; reduced motion; tap targets; phone-only, tokens-only).
