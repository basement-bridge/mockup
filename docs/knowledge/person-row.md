# The person row on the phone Menu (warm again) — kitchie #1110

Fragment: `fragments/person-row/`. Check: `tools/person-row-check.mjs`. Phone Menu only; the desktop Profile window and every `?win=1` page are untouched. Rule behind it: `DESIGN.md` 9.10 (lean does not mean mean).

## Owner (25 Oct 2026)

The person row (first row under the pinned controls, opens /me) is "too boring" after the lean pass flattened it. "Lean doesn't mean mean": lean cuts words and noise, never warmth or identity.

- The person row shows the person's NAME big and EDITABLE IN PLACE: tap to edit, name field only, picture untouched there, save on blur or Enter, Escape cancels, errors inline.
- Under it the KITCHEN ROLE is a horizontal swipeable set of the real roles (like the theme rotary: snaps to exactly one, no peeking neighbours, swipe only, applies when it settles).
- ASSISTANTS belong under the person row; the separate Assistants menu item goes. Each shows its brand logo and name; state is a symbol (connected: linked icon, in colour; not connected: plain add icon, greyed; disconnect: small unlink icon, confirm in place); a STAR marks the default; only connected ones show, with one "add an assistant" control for the rest.
- Character: a big round picture or bold initial in the person's colour, a warm detail line (household name); playful but calm; no added words.
- Keep search ids that land on name, role and assistants working; `/settings/assistants` redirects or anchors into the new place. History, Install and Download my data unchanged.

## Job to be done

Open the Menu and know it is *my* kitchen; fix my name, set my role, see and switch my assistants without leaving.

## Decided by the owner's words

Everything in the list above. Options A, B and C differ only in presentation of the same parts.

## Options

- **A card (recommended).** One warm card for the person (picture left, big name, household under it, role rotary inside), the assistants a list card under it. Best at +30% and with long names.
- **B hero.** Centred, large picture, name under it. Warmest, tallest.
- **C open.** No card, rounded-square picture, outlined role pill, hairline assistant rows. Calmest.

## Proposals (the mockup chose where the owner was silent)

PR-1 the round picture opens the profile page (picture, Admin, Leave household live there); no chevron or extra row. PR-2 the star shows from two connected. PR-3 a person with no role sees "Pick a role" first; a role cannot be cleared here. PR-4 brand marks are monograms (below). PR-5 clients Kitchie knows only by name are listed as connected with a neutral monogram and no unlink. PR-6 the person's hue comes from their name. PR-7 the Household row no longer repeats the household's name as its value (it is now the detail line under the name); the first-days nudge ("Invite") stays as its value.

## Brand marks

Monograms in each brand's tint (Claude C, ChatGPT GPT, Gemini G), not the official logos: the usage rules of Anthropic, OpenAI and Google could not be confirmed from the build environment. One table in the build (`menu-person.ts` `MARKS`) is the swap point.

## Open

PR-Q1 which option. PR-Q2 official logos, where allowed. PR-Q3 picture change from the Menu (the owner said no).

## Loads

`theme.css`, `theme.js`, `shared.css`, `person.css`, `person.js`. No image, font or network call.
