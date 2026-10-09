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
- **History** opens as a fourth column to the right of the item panel, for that item only, closed with the x or Esc. Below 1240px it lays over the right edge. The mockup's History follows the real journal shape (checked against UAT `item_history`, 9 October 2026): one entry per write with an action, the item before and after, a source (item sheet, assistant, import) and a note. Real entries come in bursts (a stepper tapped several times), so entries from one source within two minutes are shown as one item with the net change per field and an "N edits" count. The data in the mockup is synthetic: the repo is public, so no real household items are committed. The build reads `store.getHistory(id)`.
- **History loading (owner, chat, 9 October 2026).** Not shown or loaded by default, to save performance. When opened it shows the last 3 days that have entries (not calendar days: a quiet month is not padded), then loads 5 more days at a time with a "Show 5 more days" button. Long text is truncated with the full text in a tooltip (`title`). Build: fetch `getHistory` only on open and page it by day.
- **Add form (owner asked for options, 9 October 2026; not chosen yet).** Drawn three ways in `fragments/desktop/pantry.html` (`?add=a|b|c&open=add`; N or the Add button): A side panel in the right lane, B a quick-add bar above the list that understands "2 kg chicken thighs in the freezer" and shows it as chips (More fields opens A), C a centred window. Same fields (name, quantity, location, spot, category, use-by, minimum) and keys (Enter adds, Shift Enter adds and starts another, Esc cancels) in all three; new items default to Unplaced.
- **Shortcut cues.** A switch in the shortcuts list shows or hides the key hints on buttons and hints. It is kept in the browser only.
- **Profile** opens from the avatar in the rail (loaded on first use).
- **Filters panel contents (owner, chat, 9 October 2026): "i want this on the right".** The side panel carries old Option C's controls, not simple chips: Status rows (check circle, label, sub-line such as "in 1 week · 4 items", number key 1 to 4, − / + stepper on Expiring soon for 3 days, 1 week, 2 weeks, 1 month), Location pills with icons and counts, Category pills with ticks and counts (zero is dim and dashed), Sort with a Reversed toggle, footer Clear and Use last filters. It stays in the right lane and updates the centre list live. Statuses combine with OR, groups with AND.
- **Filter statuses (owner, voice, 10 October 2026): functionality parity, exactly three.** Running low, Expiring soon (3 days, 1 week, 2 weeks, 1 month) and Recently added (last 24 hours, 3 days, week), each shown as a status row with check circle, sub-line, number key 1 to 3 and a stepper where it has a window. "On your list" and "No use-by set" are removed. Statuses still combine with OR.
- **Status windows and stepper (owner, voice, 10 October 2026).** Recently added windows are last 24 hours, 3 days, 5 days, last week (default 3 days); Expiring soon stays 3 days, 1 week, 2 weeks, 1 month (default 1 week); Running low has no window. The − / + buttons are replaced by one pill with left and right angle arrows around a short value (`‹ 1 wk ›`). Keyboard: `Shift <` and `Shift >` step the status row you are on (or the last one used). The shortcut is not shown on the control because the row is crowded; it is listed in the `?` shortcuts help only. Clear resets windows to the defaults.
- **Location and Category in Filters are a curtain (owner, voice, 10 October 2026).** Same handle as the pills on the Pantry face: one row by default, a grip under it to drag down for more rows, double-click the grip (or the arrow) to show all or fold back, Arrow keys resize and Enter toggles when the grip is focused. Picks stay when the curtain is moved.
- **Curtain size (owner, voice, 10 October 2026).** Opened with the arrow or a double-click it grows to fit the pills, but never past five lines; beyond five lines the section scrolls inside. Dashed outlines for zero-count options are liked and kept: pills, and now Status rows with no items.
- **Sort is a tab (owner, voice, 10 October 2026): "a tab idea similar to how we do it on mobile".** The Filters panel header is two tabs, Filters and Sort, as on the mobile Filters sheet. Filters holds Status, Location and Category; Sort holds the sort choice and the direction button. A dot on Sort shows a sort is in use. The panel opens on Filters; Left and Right arrows move between the tabs.
- **Sort is a flyout, not a tab; Done becomes a tick (owner, voice, 10 October 2026, replaces the Sort tab above).** Filters stays as one panel. A Sort row at the top of it (showing the current sort) pushes a second panel out to its right, in the same slot as History (overlay below 1240px). Both panels end in a round tick instead of the word Done. The tick on Sort closes only Sort; the tick on Filters closes both. Esc closes Sort first, then Filters. Sort changes the list live.
- **Closing is Ctrl or Cmd plus Esc (owner, voice, 10 October 2026).** Plain Esc takes a browser out of full screen, so every desktop close (Filters and Sort, History, the item and its edit, the Add form, the shortcuts list, the Profile window) now needs Ctrl (Windows, Linux) or Cmd (Mac) held with Esc. Plain Esc no longer closes anything; it only clears the search box. The shortcuts help, the hints and the tick's tooltip show the platform's own key. Every earlier line above that says "Esc closes" now means this.
- **Requirement for the real build: History is on demand, never preloaded (owner, voice, 10 October 2026).** Opening the column, and each "show more" (5 more days), is a separate lazy call to the server for that one item only. Nothing is fetched upfront with the Pantry list or with the item, and nothing refreshes by itself, to be thrifty with bandwidth. This is the owner's rule for all desktop work, not only History: fetch only when the person asks.
- **History shortcut (answer, 10 October 2026):** there is none yet. History opens from the History button on the item panel; `H` is the shortcuts list. Not changed, as the owner said it does not matter for the mockup.

