# Pantry top row on the phone: a magnifier that opens search over the whole row

Status: mockup for the owner to review (17 Oct 2026). Not built in Kitchie. Phone first; the no-results actions of Kitchie #807 are also drawn on the desktop (see the last section). Source: owner's voice request of 17 Oct 2026. Lines marked **Proposal** are choices the mockup made where the owner was silent; **Open** lines are not decided. Merging this mockup settles none of them.

Mockup: `fragments/pantry-search/` (notes page `index.html`, the phone `app.html`, the desktop `desktop.html`; code `search.css`, `search.js`, and for the no-results block `noresult.css`, `noresult.js`; `sample.js` and `desktop.js` are mock only). Check: `tools/pantry-search-check.mjs` (198 checks at 390px, 360px and 1280px, light and dark). Builds on `pantry-pull-row.md` (the row, the pull thresholds, the refresh), which still holds unless this file says otherwise.

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
- **Decided (owner, by voice, 18 October 2026: "No, clear."):** the X at the left of the bar, the glass at the right (tapping it again), and Escape on a keyboard all close the bar; the query is cleared, the list shows everything again, Filters and + return (fade in as the bar shrinks back into the glass). Tapping or scrolling the list does not close it (the existing rule, `pantry-pull-row.md`).

## Proposals (owner was silent)

- **PS-P1 (decided 18 October 2026)** Close by X (left), by the glass (right) and by Escape; closing clears the query, for the glass-opened bar and the shallow pull-down bar alike (one `closeSearch`). The owner chose clear over keep.
- **PS-P2** The X replaces the live word "Cancel" (`#search-close`). Wrong guess costs: a word is clearer than an icon for some people; the old markup has both (`.ic-cancel`, `.ic-x`), so it is a one-line switch.
- **PS-P3** Tap flies out over a fading row; the pull keeps its curtain. Wrong guess costs: two entry animations to maintain; making the tap use the curtain too is the cheaper build.
- **PS-P4** The glass is a real button in both layers (open and close), so it never moves and tapping it twice toggles. Wrong guess costs: an accidental double tap opens then closes; the query is empty then, so nothing is lost.
- **PS-P5** Matches the item name only (the owner said "by item name"). The household flow mock also matches the category; the live app is what the build should follow. Wrong guess costs: someone typing "dairy" finds nothing.
- **PS-P6** The mic stays inside the bar, beside the glass, as today (shown only where the browser has speech recognition in the live app; always drawn here).
- **PS-P7** The chip strip below the row does not change while searching and keeps filtering with the search. Wrong guess costs: "not found in Freezer" when it is in the Fridge; softened by the "Search all places" button.
- **PS-P8** Filters is the same button as today, moved out of the right group to the left. The row has no visible item count (the live phone CSS already hides it).

## Open questions

- **PS-Q1 (answered 18 October 2026)** Closing clears the query (PS-P1). The built app matches for the X, the magnifier, the search icon and Escape. One difference stays: in the build the Search key closes the bar and keeps the results in the banner (the search applied); in this mockup it only puts the keyboard away and the bar stays open (PS-D5).
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
7. No-results block (`.empty`) in the list area, with the Add button wired to the existing add sheet with the text. (Kitchie #807 adds a second button to this block: see the last section.)

## Add to shopping list from no results (Kitchie #807, mockup 17 Oct 2026)

Mockup: `fragments/pantry-search/` (phone `app.html?state=open&q=zzq`, desktop `desktop.html?q=zzq`; the confirmed states are `&list=1`). Code to lift: `noresult.css`, `noresult.js` (the block and its two actions; the app passes in the add sheet and the new list route). Kitchie issue #807 (enhancement, not approved for build). Nothing is built. Lines marked **owner** are the owner's words or ask; **Proposal** lines are choices the mockup made where the owner was silent; merging this mockup settles none of them.

### What the owner asked

- Owner, by text in chat, 16 Oct 2026 (as written into #807): when a search finds nothing, there is a button to add it as a new item, but there should also be a button next to it that says "Add to shopping list".
- Issue's change wanted (from that ask): tapping it puts the searched words on the shopping list as a hand-added entry and confirms in place, without leaving the search. The wording is to be settled in the mockup.
- Stays the same: the "Add as a new item" button and its behaviour, the empty-search message and its way out, the Shopping screen and how hand-added entries look there (#281).
- Owner, 17 Oct 2026, typed: "sweep all the issues ... and start mocking" (the reason this was drawn now; it does not approve the build).

### Decisions (PS-S1 to PS-S15)

- **PS-S1 (owner)** In the no-results state a second button, "Add to shopping list", sits next to "Add as a new item".
- **PS-S2 (owner, via #807)** Tapping it puts the words on the shopping list and confirms where the person is looking: the search stays open, nothing navigates, nothing reloads (DESIGN.md 6a).
- **PS-S3 (owner)** Unchanged: the headline `No "xyz" in your pantry`, "Check the spelling, or add it.", the Add button's behaviour (opens Add with the text filled in), "Search all places", the Shopping screen. "Add it" now covers both actions, so the line is left as it was.
- **PS-S4 (Proposal)** The two labels are the owner's words, short: **Add as a new item** and **Add to shopping list**. The typed words are in the headline right above and in each button's accessible name ("Add "xyz" to the shopping list"). This replaces the first mockup's `Add "xyz"` and the live `Add "xyz" as a new item`. The other reading, the words in each label, is drawn and kept: `app.html?state=open&q=zzq&layout=stack`. Wrong guess costs: a person who wants the words on the button sees them only in the headline; switch the layout attribute.
- **PS-S5 (Proposal)** On a phone the pair sits side by side, equal width, each 44px or taller, a label may take two lines at 390px. Under 380px (and on a very narrow window) they stack at full width. On the desktop each is one line. Wrong guess costs: two-line labels read as cramped; the stacked layout is one attribute away.
- **PS-S6 (Proposal)** Order and weight: Add as a new item first and filled (it already exists and the owner said it stays); Add to shopping list second, an accent outline. See PS-SQ1.
- **PS-S7 (Proposal)** The tap result, in place: the button turns into `✓ On your list` (the item sheet's own words, a label not a control, `aria-disabled`), and a line under the pair says `"xyz" is on your shopping list.` with **Undo**. No toast: a toast would disappear while the person is still reading. The line stays until the text is edited or the bar is closed. Undo takes the words off the list again, puts the button back and returns focus to it. Announced to screen readers ("xyz added to your shopping list", "xyz taken off your shopping list").
- **PS-S8 (Proposal)** The typed text is kept and the bar stays open, so the person can keep going. The keyboard goes down on its own, because tapping a button takes the focus from the field. See PS-SQ2.
- **PS-S9 (Proposal; the issue's inferred edge 1)** Already on the list: the tap decides (the store answers `already: true`), no check on every keystroke. The button turns to `✓ On your list` and the line says `"xyz" is already on your shopping list. Nothing changed.` No Undo, since nothing changed. The match ignores case and extra spaces. Try `q=chives`.
- **PS-S10 (Proposal; the issue's inferred edge 2)** The words match a tracked item that is used up (the Pantry search hides used-up items, so "No item matches" can still mean one exists): link the entry to that item, as chat does (`needs_link`), and say so: `Tahini, which you used up, is on your shopping list.` with Undo. Try `q=tahini`. See PS-SQ4.
- **PS-S11 (Proposal; edge 3)** No quantity is asked. It can be set on the Shopping screen, as with chat. Nothing in the block is a field or a sheet.
- **PS-S12 (Proposal; edge 4)** The name goes on as typed, trimmed. It is not rewritten to the "type, variant" format (same as Add as a new item).
- **PS-S13 (Proposal)** Where it shows: every no-results with something typed, including with a place chip on (`No "xyz" in Freezer`). Not in the "It is in another place" state (the item is in the pantry; the only action is Search all places) and not when the field is empty.
- **PS-S14 (Proposal; edge 6)** Desktop: the same block in the 640px column under the docked search bar, the pair on one line. The rail's Shopping badge goes up by one and back down on Undo, which shows where the name went. The desktop Pantry mock (`flows/household/desktop/`) only says "Nothing matches." today, so `desktop.html` draws the whole desktop Pantry minimally (rail, docked bar `[search] [Filters] [+]`, chips, side-panel lane) and the block inside it. Keyboard: no shortcut cue for the pair (S is for a selected row).
- **PS-S15 (Proposal; edge 5)** The new entry shows on the shopper link (#479) like any hand-added entry. Not drawn; no change to that screen.

### Open questions (recommended positions)

- **PS-SQ1 Button order and weight.** Recommended: Add as a new item first and filled, Add to shopping list second and outlined (PS-S6). The other reading: "we need to buy it" is the likelier reason for a miss (the issue's own words), so the list button could lead or both be filled. Wrong guess costs: a CSS swap of two rules and the order in `noresult.js`.
- **PS-SQ2 Is the typed text kept after the tap?** Recommended: kept, bar open (PS-S8). Alternative: clear the field and close the bar, with a toast "Added to your shopping list" and Undo. Wrong guess costs: with the alternative the person cannot see what they just added and the Undo window is short.
- **PS-SQ3 Wording.** Recommended: the owner's "Add to shopping list" and the item sheet's "On your list". Alternatives: "Add to list" (the swipe's word), "Put on the list". Wrong guess costs: labels in two places (`noresult.js` strings).
- **PS-SQ4 A used-up match: link silently or ask?** Recommended: link and say so in the line, with Undo (PS-S10). The issue asks the owner if the two readings differ. Wrong guess costs: an entry linked to an item the person did not mean; Undo is one tap.
- **PS-SQ5 Show "On your list" before the tap?** Recommended: no, the tap decides (PS-S9): no list lookup while typing. Alternative: mark the button as soon as the words match a list line. Wrong guess costs: a person taps and is told "already" instead of seeing it first.
- **PS-SQ6 How long does Undo last?** Recommended: until the text changes or the bar closes (PS-S7). Alternative: a few seconds, as a toast. After that the way back is the Shopping screen's Remove.
- **PS-SQ7 A link to the Shopping screen in the confirmation?** Recommended: not now; the person stays in the search ("without leaving the search"). Wrong guess costs: one more tap to check the list.
- **PS-SQ8 Side by side or stacked on the phone?** Recommended: side by side (the owner said "next to"), stacked only under 380px (PS-S5). If two-line labels feel crowded, the stacked layout with the words in each label is drawn and one attribute away.
- **PS-SQ9 Order of work.** The Pantry search mockup (this file, above) is not built either. In the live app today (issue evidence, v0.126.0 phone) the add button sits under the search box and "No item matches" below the chips. Recommended: build the pair in whichever place the add button is when #807 is built: the `.eacts` wrapper holds both buttons, so it moves with it. Wrong guess costs: none to the design; a builder deciding alone which screen carries it.

### What the default path loads, and what is deferred (DESIGN.md section 6)

Default path: nothing new. The block is part of the no-results markup that is only drawn when a search finds nothing; `noresult.css` (about 3 KB) and `noresult.js` (about 5 KB) are small, and in the app they are the existing empty-state CSS and `list.js`. Deferred: the call to the new list route happens on the tap, never while typing, and nothing is fetched to draw the buttons. The result lands in place (section 6a): the button and the line are swapped, the field and the list are not touched. `sample.js` and `desktop.js` are mock only.

### For the build

Each difference from the live app is to be listed in the Kitchie pull request.

1. A new web route in `server/src/web-shopping.ts` over `addToShoppingByName` (`server/src/store.ts`), the same call chat (`shopping-mcp.ts`) and the meal plan make. It answers `{ added }`, `{ already }` or `{ linked: "<item name>" }`, and for added and linked the id of the entry, so Undo removes exactly that entry (the Shopping screen's Remove already does this for hand-added entries; the builder checks the route and its permission).
2. The two buttons share one wrapper (`.eacts`) in the no-results block, ids `add-q` (today `#add-from-search`) and `list-q`. The block's markup, class names and CSS are `noresult.js` and `noresult.css`; the mock's `sample.js` is not lifted.
3. The tap does not navigate: the click handler posts, swaps the button and the line, and moves focus. A failed request leaves the pair as it was and shows the app's usual error line; this is not drawn.
4. `aria-disabled` (not `disabled`) on `On your list`, so it keeps its place in the reading order. The live region (`#slive`) announces added, already and taken off.
5. Light and dark use the same tokens (`--accent`, `--surface`, `--border`, `--muted`); nothing new in `theme.css`.
