# Desktop layout: rail, off-centre column, side panel

What the owner decided, and the proposals the mockup had to make. Mockup: `fragments/desktop/`. Built in Kitchie v0.49.0 and v0.49.1.

## What the owner said

- 9 October 2026, voice: desktop today is "a big phone version". The main page should sit slightly off-centre. Clicking an item should open a side panel instead of the bottom sheet mobile uses. Start with Pantry and Home.
- 9 October 2026, chat: rail + side panel is the way forward; the top bar + drawer option is dropped. Fix the prototype to match what was built.
- 9 October 2026, chat, on seeing the built version on a wide window: too much gap between the centre lane and the right lane. There should be a defined amount of space between the two, and the left should be oriented to that rather than latching to the right gutter.

## What the mockup does

- Desktop (1024px and up): the bottom bar becomes a left rail. The main column sits beside the rail. The detail opens in a panel on the right and stays open.
- The rail, column and panel are one group anchored on the left. The panel starts where the column ends, so the space between the list and the panel is always one 48px gutter, on any window. Free space collects to the right of the panel.
- Pantry: the panel shows the same four tiles as the phone item sheet. Home: the panel lane holds Cooking ideas.
- Phone and tablet are unchanged. The household flow keeps its phone frame.

## Proposals (the owner was silent)

- Widths: rail 88px, column 640px plus a 48px gutter each side, panel 400px.
- Esc closes the panel; click or Enter on a row opens it; the first item is not auto-opened; an empty panel says "Pick an item to see it here".
- Below about 1224px the column is the lane that gives up width, so at 1024 the panel never covers it.
- On very wide windows the group stays left-anchored beside the rail rather than being centred as a whole.

## Open questions

- Very wide windows: keep left-anchored, centre the group, or grow a left inset (the earlier "14vw" idea)? A wrong guess costs a visible empty band on the right of big monitors.
- Tablet widths (not drawn): the bottom bar and the relaxed single column stay.
- Swipe gestures versus hover buttons on rows at desktop.
- What the Home panel holds once Cooking ideas has real recipe data.
- Kitchie's `AGENTS.md` still describes one 840px desktop column; it needs the owner's edit.

## Desktop interaction (9 October 2026, owner, chat; mockup first)

Mockup: `fragments/desktop/pantry.html` (press `?`), `fragments/desktop-profile/`. The locked list is `fragments/desktop/index.html`.

- Owner: desktop should have shortcuts "as its the way desktops work", sensible ones from the rest of the web, listed in an opaque block opened with `?` (or `h`). Proposal: ? or H help, Esc back, / search, J K or arrows move, Enter or E edit, U use one, D used up, S shopping list, Z undo, G then H/P/R/S go to, N add, F filters. Never fire while typing or with Ctrl/Cmd/Alt.
- Owner: the selected item must look different from the rest. Drawn: lighter fill, outline, accent bar, accent name.
- Owner: tapping any field shows the full field list below the quick edit in the panel; Used up and Add to shopping list need not be buttons there. Drawn: all fields expand below the tiles, saved as you go. Use one, Used up and Add to shopping list move to hover buttons on the row plus U, D, S with Undo; the other options (panel toolbar, right-click menu, multi-select) are on the fragment page.
- Owner: search stays on the page, dimmed, right of Filters and Add; click or `/` brightens it.
- Owner: location pills are a resizable area (drag down, or double-click the top right corner to show all), scroll when shorter than the content, Ctrl/Cmd click picks several; after 5 seconds or when the list is used, picked pills move left and the rest follow.
- Owner: Filters and Profile are windows that block everything behind them; three options each to choose from.
- **Decided (owner, chat, 9 October 2026): Filters and Sort on desktop is a side panel, not a blocking window.** Option C controls (Sort, Status, Location, Category pills; click picks one, Ctrl/Cmd click adds) sit in the right lane where the item panel is, and update the Pantry centre list on every click. Done or Esc closes the panel with the picks kept, and the item panel returns. A count ("N items") is at the top, Clear and Use last filters at the bottom; the preview list is dropped and counts stay on pills and rows. Drawn in `fragments/desktop/pantry.html` (press F, or `?filters=1&pre=1`). Kitchie issue #408.
- Open: weighed items have no "use one" (drawn: opens Quantity); plain click vs Ctrl/Cmd click for several pills; Esc discarding unsaved filter changes; whether a non-blocking menu is acceptable in Profile option C.

## Decisions and tooling (9 October 2026)

- **Decided (owner, chat): Profile on desktop is Option B**, the two-pane settings-style window (`fragments/desktop-profile/`, the only version now; A and C were removed). Options A and C are kept until the owner says they are dropped. Kitchie issue #409.
- **Owner (chat, 9 October 2026): mockup and build HTML, CSS and JS should be very close where possible.** See AGENTS.md "Mockup and build stay close".

## Locked (owner, chat, 9 October 2026: "lock in the desktop decision, remove redundant options")

- The open desktop questions are settled as drawn and the rejected options are removed: the old Filters window options (the page `fragments/desktop-filters/` is deleted), Profile options A and C, and the decisions-picker page. `fragments/desktop/index.html` is now the list of locked decisions.
- **Device mode.** Desktop is a mode of the household flow, not a separate fragment. `fragments/device.js` (replaces `viewport.js`) is loaded by the flow and the desktop screens. It is hidden: move to the top edge or press the backtick key. It lists Full window, Phone 390 × 844, Tablet 768 × 1024 and desktop 1024 × 768, 1280 × 800, 1440 × 900, 1920 × 1080, 2560 × 1440, plus Shortcuts, the prototype controls and the theme. A chosen size loads the page in a frame of exactly that size, scaled to fit (`?vp=<width>`). Phone and Tablet show the household flow; desktop sizes show the desktop Pantry. The flow's Controls panel is hidden at every size (open it from the Device control). The top bar on the desktop screens is gone.
- **Header.** No "Pantry" title; count, Filters and Add on the left, Search on the right; focusing Search hides Add.
- **Location / Category.** The pills switch with a pin and tag button, as in Kitchie (issue #134, #330). Plain click picks one, Ctrl/Cmd adds.
- **Filters in use.** Chosen filters replace the pill strip with removable tiles and Clear all.
- **Use one only on counted items.** Weights, volumes and free text are level-only, with no Use one (button and U); counted items show a worked-out level, the rest a level set by hand. Matches `docs/adr/pantry-item-sheet.md` in Kitchie.
- **History** opens as a fourth column to the right of the item panel, for that item only, closed with the x or Esc. Below 1240px it lays over the right edge. Real data would come from `item_history` / `store.getHistory(id)`; the mockup uses sample events plus what you do in the page.
- **Shortcut cues.** A switch in the shortcuts list shows or hides the key hints on buttons and hints. It is kept in the browser only.
- **Profile** opens from the avatar in the rail (loaded on first use).

