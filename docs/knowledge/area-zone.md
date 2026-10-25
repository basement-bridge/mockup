# Area and Zone: renaming Location and Spot (Kitchie #1137)

**Status: drawn 25 October 2026, nothing decided, nothing built, not approved for build.** Mockup `fragments/area-zone/` (index, `screen.html#add|sheet|filters|history`). Drawn from Kitchie `uat` code reading, not run on a device.

## What the owner said (voice, 24 October 2026, closely paraphrased)
Change "Location" to "Area" and "Spot" to "Zone". Labels only first; a deeper rename (code, MCP, docs) can be a later issue. Goes to `uat` first. (He called the second level "spot" a word he does not like; options he heard: Section, Compartment, Nook, Zone; he chose Zone.)

## What changes (read from code; same list as the mockup table)
- Add and Edit form labels (`add-form.ts`, `assets/form.js`, `web-edit.ts`); strip screen-reader labels (not visible).
- Filters group chip, summary, heading (`assets/filters-panel.js`, `filters.js`); sort names and "Show the spot" switch (`settings.js`, `app.ts`).
- Pantry ribbon, title fallback, aria-labels (`list.js`, `app.ts`, `desktop-pantry.js`).
- History lines (`web-item-history.ts`, `history-wording.ts`); Menu and Settings row "Locations and spots" (`profile-menu.ts`, `profile-settings.js`, `preferences/web-page.ts`).
- Rules words (`rules-draw.ts`, `rules-pick.ts`); validation messages (`store.ts`) and starter text (`web-starters.ts`).
- Open, not drawn: Settings manager screens (`web-locations.ts`, `locations-win.ts`), about 45 strings.
- Must not change: "Grab your spot" (invite), "Bright spots calmed" (photo), `location.href`, code comments.

## What does not change
Stored fields (`area`, `place`), URLs, MCP tool names and descriptions, code, docs, layout, tap sizes.

## Proposals (mockup's own; owner silent)
- AZ-P1 All screens change in one release, so no screen mixes old and new words.
- AZ-P2 Articles follow the word ("an area", "a zone").
- AZ-P3 Field-change history lines are labelled when read, so old ones read Area and Zone. Batch messages stored as text keep the old words. Nothing stored is rewritten.
- AZ-P4 Assistants (MCP) keep saying "location" and "spot" until the follow-up issue.

## Open questions (cost of a wrong guess)
- Include the Settings manager screens (about 45 strings)? A wrong guess: the Menu row says Areas and zones, the screen says locations and spots.
- Accept the MCP wording gap? A wrong guess: assistants and screens use different words for one release.

## Performance
Mockup default path: page, shared theme, one small script and stylesheet per frame, no images. Build: string change only, no new request or file.

## Design review (DESIGN.md 9.8)
Separate reviewer agent, 25 Oct 2026: **Pass with changes**, all four changes applied (Sort row, History frame redrawn to real line shapes, word table completed, doc caveats). Not re-reviewed after the changes. Checked in headless Chromium at 390 and 360, light and dark: no sideways scroll, every tap 44px or more. +30% text size checked by reading CSS only. Not seen on a real phone.
