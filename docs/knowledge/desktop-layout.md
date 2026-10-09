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

Mockup: `fragments/desktop/pantry.html` (press `?`), `fragments/desktop-filters/`, `fragments/desktop-profile/`.

- Owner: desktop should have shortcuts "as its the way desktops work", sensible ones from the rest of the web, listed in an opaque block opened with `?` (or `h`). Proposal: ? or H help, Esc back, / search, J K or arrows move, Enter or E edit, U use one, D used up, S shopping list, Z undo, G then H/P/R/S go to, N add, F filters. Never fire while typing or with Ctrl/Cmd/Alt.
- Owner: the selected item must look different from the rest. Drawn: lighter fill, outline, accent bar, accent name.
- Owner: tapping any field shows the full field list below the quick edit in the panel; Used up and Add to shopping list need not be buttons there. Drawn: all fields expand below the tiles, saved as you go. Use one, Used up and Add to shopping list move to hover buttons on the row plus U, D, S with Undo; the other options (panel toolbar, right-click menu, multi-select) are on the fragment page.
- Owner: search stays on the page, dimmed, right of Filters and Add; click or `/` brightens it.
- Owner: location pills are a resizable area (drag down, or double-click the top right corner to show all), scroll when shorter than the content, Ctrl/Cmd click picks several; after 5 seconds or when the list is used, picked pills move left and the rest follow.
- Owner: Filters and Profile are windows that block everything behind them; three options each to choose from.
- Open: weighed items have no "use one" (drawn: opens Quantity); plain click vs Ctrl/Cmd click for several pills; Esc discarding unsaved filter changes; whether a non-blocking menu is acceptable in Profile option C.

## Decisions and tooling (9 October 2026)

- **Decided (owner, chat): Profile on desktop is Option B**, the two-pane settings-style window (`fragments/desktop-profile/?o=b`). Options A and C are kept until the owner says they are dropped. Kitchie issue #409.
- `fragments/desktop/decisions.html` lists every open desktop question with options, a recommendation and the cost of a wrong guess; picks are kept in the browser and can be copied. Still open: Filters option, pill click rule, row actions, use-one for weighed items, save behaviour, help key, very wide windows, tablet.
- `fragments/viewport.js` adds a viewport picker (Fit, 1024, 1280, 1440, 1920, 2560) to the desktop pages. A chosen width loads the page in a frame of that width, scaled to fit, so its own width rules run for that size. The choice is in the address (`?vp=1440`).
- **Owner (chat, 9 October 2026): mockup and build HTML, CSS and JS should be very close where possible.** See AGENTS.md "Mockup and build stay close".
