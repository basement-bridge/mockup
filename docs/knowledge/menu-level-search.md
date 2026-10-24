# Menu with search at the top (phone) — kitchie #1090, #1110

Fragment: `fragments/menu-level-search/`. Check: `tools/menu-level-search-check.mjs`. Phone only; the desktop window and every `?win=1` page are untouched.

## Owner (24 Oct 2026)

"everything other than Install, History and Download my data is basically settings, so why haven't you elevated settings search to the menu level instead of hiding it under the Settings entry? And there's a lot of duplication of the same thing."

## Job to be done

Open the menu, do one thing: find or change a setting, or reach History, Install, Download my data, Sign out. Each element either changes a decision or is cut.

## Decided by the owner's words

- Search is the menu's first item; it is the Settings search (best match, rows, last three searches).
- The settings rows sit directly under it; the Settings entry as a separate drill-in disappears.
- Install, History and Download my data stay their own items.
- Nothing appears twice.

## The menu now (top to bottom)

Search settings; quick controls as pinned; your name; Household; Preferences; Assistants; History; Install; Download my data; Sign out.

## Duplicates found in uat 0.177.0 and what became of each

See the table on the page. Short: Settings entry (gone), Looks row (gone; quick controls and search), Kitchen setup with Categories and Locations on the menu (gone; inside Household and search), the Preferences group heading plus row (one row), People group Me and Household (one name row, one Household row), the Get started strip (becomes the value on Assistants and Household), a second search box on the Settings front (the front is for a visitor with no account only).

## Proposals (mockup chose where the owner was silent)

SR-M1 your name is the first row (replaces Me and the avatar header). SR-M2 the Get started nudges become row values (`Link yours`, `Invite`). SR-M3 order: settings block, History, Install, Download my data, Sign out. SR-M4 `/settings` for a signed-in person lands on the menu, keeping `?from`. SR-M5 pages behind the menu say Menu on Back. SR-M6 `Download inventory CSV` becomes `Download my data`.

## Open

SR-Q58 Categories and Locations cost 4 taps by browsing (2 by search); keep, or a Kitchen setup row on the menu (recommended: keep). SR-Q59 keep your own row on the Household page as well as the name row (recommended: keep). SR-Q60 the You page repeats Install, Download my data and Sign out; remove them there (recommended).

## Loads

Default path: theme and shared CSS, `../settings-shakeup/shake.css`, `shake.js`, `menu.js`, `menu.css`. Search engine and index deferred to first focus.

## History count (owner, 25 October 2026)

The History row carries a quiet count: how many changes by others, that this person may see, since History was last opened. Placement: on the menu row (the owner answered "on the menu row"; a Proposal default). A plain number beside the chevron in the row's value place, not a filled or red badge; hidden at 0; "99+" past 99; a screen reader hears "New 3". It clears when History is opened. Install and Download my data are untouched. Mockup state switch: "History count" in the bar, or `?hist=N`. The History page gets the standard Back to Menu (the mockup has no History screen). Checked at 390 and 360, light and dark, text +30% (`tools/menu-level-search-check.mjs`).
