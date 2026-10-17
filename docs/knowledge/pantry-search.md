# Pantry top row on the phone: a magnifier that opens search over the whole row

Status: mockup for the owner to review (17 Oct 2026). Not built in Kitchie. Phone only. Source: owner's voice request of 17 Oct 2026. Lines marked **Proposal** are choices the mockup made where the owner was silent; **Open** lines are not decided. Merging this mockup settles none of them.

Mockup: `fragments/pantry-search/` (notes page `index.html`, the phone `app.html`; code `search.css`, `search.js`). Check: `tools/pantry-search-check.mjs` (106 checks at 390px, light and dark). Builds on `pantry-pull-row.md` (the row, the pull thresholds, the refresh), which still holds unless this file says otherwise.

## What the owner asked (voice, 17 Oct 2026, relayed)

On the phone the Pantry top row today has Filters and a blue + above the location chips (All, Unplaced, Freezer ...). New layout:

- **PS-D1** Filters stays anchored to the left border.
- **PS-D2** On the right border a magnifying-glass button is the rightmost item, with + immediately to its left (so Filters ... + glass, glass at the far right edge).
- **PS-D3** Tapping the glass makes a search bar fly out from right to left over the whole row. While it is open, Filters and + are hidden.
- **PS-D4** The existing shallow pull-down (pull the Pantry list down a little) keeps working, and now opens the same full-row search bar. The shallow pull and the flyout share the "takes over the entire row" behaviour. Existing pull behaviour is preserved (deep pull still refreshes, thresholds unchanged).
- **PS-D5** The bar is a text field that filters the pantry list by item name; there is a sensible empty and no-results state; the keyboard's Search key submits (puts the keyboard away).
- Desktop is out of scope (its docked search bar, owner 9 Oct 2026, is unchanged).

## What the mockup does

Row (56px, never changes height, same `.prow` layers as the live app and the household mock):

| State (`data-state`) | Row shows |
|---|---|
| `rest` | `[Filters]` at the left border; `[+] [glass]` at the right border, 8px apart, glass flush to the right border |
| `search` | one bar across the whole row: `[X] [field] [mic] [glass]`; Filters and + hidden |
| `let`, `anim` | unchanged from `pantry-pull-row.md` ("Let go to refresh", then the refresh scene and "Up to date") |

Ways into `search`:
- **Tap the glass.** The bar grows out from under the glass, right to left, to the row's full width (320 ms, `cubic-bezier(.2,.8,.2,1)`, the live `--slide`). Filters, + and the front glass fade out at the same time (about 160 ms); there is no curtain. The field is focused at once (the tap is the gesture that opens the keyboard).
- **Shallow pull** (70 px to 170 px, thresholds unchanged). Finger-driven as today: from 8 px the front slides down and fades, the bar widens from the glass to the full row in step with the finger, at 70 px it is exactly the locked state (accent border, glass pop, lock cue, 10 ms buzz). Release between 70 and 170 px: stays open, field focused. Release below 70: springs back. Dragging back above 170 shows the bar again, as today. A pull below 8 px does nothing.
- **Deep pull** (170 px and more): refresh, exactly as today. Search and refresh stay mutually exclusive: a pull that starts while the bar is open does nothing.

The end state is the same whichever way in (one `data-state=search`); only the entry animation differs (curtain for the finger, fly-out for the tap).

Searching:
- Filters the list as you type. Matches the item **name** only, contains, ignoring case and spaces at the ends. The location chip stays in force (a search inside Freezer finds only Freezer items).
- Keyboard Search key (`enterkeyhint="search"`, the bar is a `<form role="search">`): the keyboard goes away, the bar stays open, the list stays filtered.
- No results: the list area shows a dashed circle with a magnifier and a question mark, "No "xyz" in your pantry" (or "in Freezer" when a chip is on), "Check the spelling, or add it." and an **Add "xyz"** button that opens Add with the text filled in. If the item exists under another chip it says "It is in another place." with **Search all places**.
- Empty field while open: the full list, no message.
- A visually hidden live region says "3 matches" or "No matches" for screen readers; the row has no visible count (as in the live phone app, where `.prow .count` is hidden).

Closing:
- **Open (assumed, not decided):** the X at the left of the bar, the glass at the right (tapping it again), and Escape on a keyboard all close the bar; the query is cleared, the list shows everything again, Filters and + return (fade in as the bar shrinks back into the glass). Tapping or scrolling the list does not close it (the existing rule, `pantry-pull-row.md`).

## Proposals (owner was silent)

- **PS-P1** Close by X (left), by the glass (right) and by Escape; closing clears the query. Wrong guess costs: if the owner wants the query kept after closing, the list stays filtered with no visible bar, which reads as a bug, so it would need a "filtered by ..." chip.
- **PS-P2** The X replaces the live word "Cancel" (`#search-close`). Wrong guess costs: a word is clearer than an icon for some people; the old markup has both (`.ic-cancel`, `.ic-x`), so it is a one-line switch.
- **PS-P3** Tap flies out over a fading row; the pull keeps its curtain. Wrong guess costs: two entry animations to maintain; making the tap use the curtain too is the cheaper build.
- **PS-P4** The glass is a real button in both layers (open and close), so it never moves and tapping it twice toggles. Wrong guess costs: an accidental double tap opens then closes; the query is empty then, so nothing is lost.
- **PS-P5** Matches the item name only (the owner said "by item name"). The household flow mock also matches the category; the live app is what the build should follow. Wrong guess costs: someone typing "dairy" finds nothing.
- **PS-P6** The mic stays inside the bar, beside the glass, as today (shown only where the browser has speech recognition in the live app; always drawn here).
- **PS-P7** The chip strip below the row does not change while searching and keeps filtering with the search. Wrong guess costs: "not found in Freezer" when it is in the Fridge; softened by the "Search all places" button.
- **PS-P8** Filters is the same button as today, moved out of the right group to the left. The row has no visible item count (the live phone CSS already hides it).

## Open questions

- **PS-Q1** How does the bar close, and does closing keep the query? (PS-P1, PS-P2.) This is the one the owner flagged as assumed.
- **PS-Q2** The owner described the row today as Filters at the left and + at the right. In the live phone app Filters and + both sit together at the right (`.pl-front{justify-content:flex-end}`, Filters inside `.pact`); in the household mock the item count sits at the left. Is the move of Filters to the left border the intended change, or was the row already like that on the owner's phone? Wrong guess costs: if Filters was already at the left on a build the mockup has not seen, the markup diff below is larger than needed.
- **PS-Q3** When a custom view is active the live app has no Filters button (the strip's Edit replaces it). The mockup does not draw that state: the row would be `[+] [glass]` at the right with nothing at the left. Fine, or should the view's name sit there?
- **PS-Q4** Does the glass need a keyboard shortcut cue (`/`), as the live bar carries `.kbd`? That is desktop-keyboard only and out of scope here.

## What the default path loads, and what is deferred (DESIGN.md section 6)

Default path: `search.css` (about 8 KB) and `search.js` (about 13 KB) on top of `theme.css`; nothing else. In the build the row's CSS lives in the existing layout stylesheet and the pull code is the existing `pull.js`; nothing new is fetched for this. Deferred as today: the six refresh scenes (`refresh-scenes.js`) load when the first refresh plays; the mockup shows the words only and does not redraw them. The match runs on the list already in the page, in place (section 6a): no request, no navigation.

## For the build

Copy PART 1 of `fragments/pantry-search/search.css` and the row markup in `app.html`. Differences from the live app (`server/src/app.ts` `searchBar` and the `.prow` string, `server/src/layout.ts`), each to be listed in the Kitchie pull request:

1. `.pl-front` children: Filters (`#filters-open`) moves out of `.pact` to be a direct left child; `.pact` holds `a.icon.addbtn` then the new `button.icon.sbtn#search-open` (aria-label "Search", `aria-expanded`, `aria-controls`). `.pl-front` becomes `justify-content:space-between` (was `flex-end`). `.count` stays hidden.
2. The `.spill` is now the `<form role="search">` and contains, in order: `button.icon.sclose#search-close` (X), `input[type=search]#q` (add `enterkeyhint="search"`), the mic button, and the glass as `button.mg#search-glass` (was `span.mg[aria-hidden]`). `#search-close` moves from the `.searchbar` wrapper's left edge into the bar. `.spill` gets `justify-content:flex-end` so the glass never moves while the width animates.
3. `.prow[data-state=search] .spill{width:100%}` (was `calc(100% - 84px)`, leaving room for Cancel).
4. New class `by-tap` on `.prow` before `data-state=search` when the open came from the glass; its two rules (front fades instead of the curtain). `header.js` `KitchieSearch.open()` sets it; `pull.js` clears it.
5. `pull.js` `show()` and the finger-follow interpolate the bar from 48px to `100%` (was to `100% - 132px`) and the X fades in with it.
6. Hidden layer controls (`#q`, `#search-close`, `#search-glass`) get `tabindex=-1` and `aria-hidden` on the form while closed (the live CSS already uses `visibility:hidden` on the layer, which does the same job; keep whichever it uses).
7. No-results block (`.empty`) in the list area, with the Add button wired to the existing add sheet with the text.
