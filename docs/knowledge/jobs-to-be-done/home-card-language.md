# Phone Home: one card language (kitchie#1112)

Mockup: `fragments/home-card-language/` (three options A to C, phone 390 wide, light and dark). Live: <https://basement-bridge.github.io/mockup/fragments/home-card-language/>. Builds on `mobile-home-g-revisions.md` (the three chevron sections and the passport hero). Issue: kitchie#1112. Status: **option A chosen** (HC-D3, owner, 25 Oct 2026); the regression fixes are already on UAT.

## Owner (24 Oct 2026, typed, with a phone screenshot of Home on UAT 0.169.0)

"The visual language of this is very disjointed compared to what it was before... because it's a damn home screen, I want the visual appeal sorted out at the same time, consistent."

## Audit: UAT against the mockup and against earlier UAT

Before #1070 (15f8233a, 23 Oct) every Home card was one white surface with a hairline. #1070 added: tinted, coloured-border urgent sections; a pill under the title; a lead with the desktop card's 2px accent outline.

| # | UAT 0.169.0 | Mockup | Introduced by | Kind | Now |
| --- | --- | --- | --- | --- | --- |
| 1 | Lead: 2px accent outline | Hairline on the page tone | `.lead.hl` (1cc07144, 12 Oct, desktop); on the phone since 15f8233a | Regression | Fixed (`mobile-home.css`) |
| 2 | Urgent sections tinted, coloured border | Option C plain is the recommendation; A tint one of three unpicked options (MR-Q14) | 15f8233a built A (6% / 50%) with no recorded pick | Undecided | Plain A shipped; B and C in the mockup |
| 3 | Pill under the title, count beside it | Pill is the title's sibling at the right; count hidden | 15f8233a | Regression | Fixed (`mobile-section.ts`, css) |
| 4 | Pill at body size (about 16px) | 11px | `font` shorthand with `var(--body,inherit)` is invalid when `--body` is unset | Bug | Fixed |
| 5 | "20 min · 20 minutes" | Minutes once | Reason "N minutes" (`recipe-tab/ideas.ts`) beside meta "N min" (`ideas-card.ts`) | Bug | Fixed (reason skips `time`) |
| 6 | Cooking ideas: no icon, larger title | Sage chef icon, section title size | 15f8233a | Regression | Fixed, phone only |
| 7 | Plan white on beige; bold urgent rows; divider above View all, no underline | `.btn.ghost`; rows 600; plain link | 15f8233a | Regression | Fixed |
| 8 | Blurred greeting under the status bar | Solid greeting row | Not reproduced headless | Unverified | Needs the owner's phone (HC-Q3) |
| 9 | "bueno" in Running low | n/a | Looks like test data in the pantry | Data | Reported, not deleted |

## Decisions

- **HC-D1 (built).** One card surface for the hero and the three sections: `var(--surface)`, 1px `var(--border)`, `var(--r-card)`; the lead a hairline on `var(--bg)`.
- **HC-D2 (built).** Word pill at the right of the title row, 11px, the bare count hidden while it shows.
- **HC-D3 (owner, 25 Oct 2026, approved; resolves HC-Q1).** Home card language is **option A, one surface**: every card, urgent sections included, is the same `var(--surface)` with a hairline; urgency is order, the word pill and default open. B (tint) and C (edge bar) are not taken; C remains the fallback only if a later pick reopens it. Already on UAT, so the build needs no new CSS.

## Options for an urgent section (HC-Q1, resolved: A chosen, HC-D3)

- **A. One surface (CHOSEN, HC-D3; on UAT).** No extra mark; urgency is order, pill and default open. Calmest; only as loud as its pill.
- **B. Tinted.** Tint plus coloured border. Seen at a glance, but a second surface and colour-led. Not recommended.
- **C. Edge bar.** Same surface; a 4px leading-edge bar (a shape) plus the pill. Recommended if A proves too quiet.

Shape plus colour in every option: the pill carries words; C adds a shape.

## Open

- **HC-Q1** Resolved by HC-D3: A.
- **HC-Q2** Keep "See all" on the hero (the build has it, the mockup hero does not). Recommendation: keep.
- **HC-Q3** The blurred header: the installed app's translucent status bar? Needs a real phone.

## What loads

The fragment: `theme.css`, `theme.js`, the two Home stylesheets (not edited), `options.css`. No script but the theme switch. The build needs only the chosen option's few lines in `mobile-home.css`.
