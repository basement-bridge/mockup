# Home detail panel: handover

**Status: drawn and merged 12 October 2026 (Sydney); the owner then confirmed all eight open decisions by voice the same day (decisions 133 to 154 are CONFIRMED, 155 is a proposal). Nothing is built yet** and no Kitchie issues are filed. Style follows [plan-desktop.md](plan-desktop.md). Read `AGENTS.md` and `DESIGN.md` first.

## 1. The ask, in the owner's words (12 Oct 2026, from his message)

On the Kitchie desktop **Home** screen, when the user selects an item from the search dropdown (jalapeño peppers, lime juice), clicks something in Cooking ideas, clicks an item in "On the way out" (Cucumbers, Spring onion stalks) or in "Running low" (Bueno chocolate, crunchy peanut butter, lime), the detail should **displace the "This week" column to the right if there is room**, or, if there is not enough room, **stack on top of This week, leaving it peeking out from behind by about 1 to 2 mm** (a thin visible edge, about 4 to 8px) so it is still discoverable. It shows the **simple view**, consistent with the other Pantry item flyouts, plus a **recipe-specific view** (for a Cooking idea) as a variant. **Mockup first; the owner confirms before anything is built.** The repo is `mockup` (basement-bridge/mockup), **not `kitchie` and not `kitchie-mockup`**.

## 2. What exists and where

| What | Where |
|---|---|
| Options page, width slider, states, notes | `fragments/home-detail-panel/index.html`; live <https://basement-bridge.github.io/mockup/fragments/home-detail-panel/index.html> |
| The live Home screen | `fragments/home-detail-panel/home.html` (add `?opt=a|b|c`, `?open=item:cucumbers`, `?open=recipe:lime-tacos`, `?front=week`, `?child=edit|history`, `?q=lime&sres=1`, `?ideas=ok|loading|unavailable`, `?week=empty|planned`, `?detail=ok|loading|error`, `?peek=6`) |
| Job note, decisions 133 to 155, options, open questions | `docs/knowledge/jobs-to-be-done/home-detail-panel.md` |
| Behaviour check | `node tools/home-detail-panel-check.mjs [--shots=dir]` |
| Screenshots | `docs/screenshots/home-detail-panel-*.png` |
| What it builds on | `fragments/desktop-home/` (the Home screen), `fragments/item-edit-flyout/` (the item flyout, its CSS is linked, not copied), `docs/knowledge/desktop-layout.md` |

## 3. Files, and where the viewport code is

| File | Role |
|---|---|
| `home.html`, `home.css`, `home.js`, `data.js` | The screen, shared styles with no size rules, the behaviour, sample data for the mockup only |
| `stack.css` | The panel stacks on This week with a peek. Linked with `media=` (A: max 1623.98px, B: always, C: max 1447.98px) |
| `displace.css` | The panel takes the lane, This week shifts right (A: min 1624px, C: min 1448px) |
| `push.css` | Option C only, min 1448px: the column shrinks 736 to 560 |
| `layout.js` | Chooses which of the three files to link from `?opt=`. Mockup-only; the build drops it |
| `recipe.js`, `child.js` | The recipe view and Edit or History, fetched on first use |
| `index.html` | The options page |

## 4. The four entry points and the panel

All four open the same panel. An item shows the Pantry flyout, byte for byte in markup and classes. An idea shows the recipe view. Clicking another row replaces the content in place. Close is the X or Ctrl or Cmd plus Escape. Keys: `/`, arrows or J K, M, E, comma, U D S Z, P O S, W, `?`.

## 5. Decisions 133 to 190 in one line each

| # | Decision | Status |
|---|---|---|
| 133 | One panel, four ways in; item view or recipe view | Confirmed |
| 134 | Displace if there is room, else stack | Confirmed |
| 135 | Breakpoint 1624px (88 + 736 + 400 + 400) | Confirmed |
| 136 | Peek 6px, tinted edge with a grip; lane stays 400px | Confirmed |
| 137 | The peek is a button (click, W, hover widens); week and panel swap, nothing closed | Confirmed |
| 138 | Switch without closing; arrows move and open | Confirmed |
| 139 | Close: the X, or Ctrl or Cmd plus Escape (changed by 149); plain Esc closes nothing | Confirmed |
| 140 | Simple view is the Pantry item flyout verbatim | Confirmed |
| 141 | Edit and History tucked under the header in the panel, never a fourth column | Confirmed |
| 142 | Recipe view content | Confirmed |
| 143 | Add to plan: first empty day, undo toast, peek pulses | Confirmed |
| 144 | Search: dropdown inside the column; choosing closes it, opens the panel | Confirmed |
| 145 | States: loading, ideas unavailable, panel could not load, nothing planned | Confirmed |
| 146 | Crossing the breakpoint keeps the selection | Confirmed |
| 147 | Phone and tablet unchanged | Confirmed |
| 148 | What loads by default and what is deferred | Confirmed |
| 149 | Close is Ctrl or Cmd plus Escape (the item edit flyout's shortcut); plain Escape stays for leaving full screen. Replaces Ctrl or Cmd plus Enter | Confirmed 12 Oct |
| 150 | Recipe panel: a short "Why this fits" blurb, no steps | Confirmed 12 Oct |
| 151 | "Missing" = completely out of stock; running low is not missing | Confirmed 12 Oct |
| 152 | Edit and History swap the same panel's content in place | Confirmed 12 Oct |
| 153 | "Used in" line on the item panel: ideas planned in the rolling next 7 days, by weekday first, then recipe ("Used in: Tuesday, prawn curry"), omitted if none | Confirmed 12 Oct |
| 187 | A recipe SEARCH result opens the Recipes summary flyout (recipe-browse-full option A), not the idea view; Cooking ideas keep the recipe view | Confirmed 12 Oct |
| 188 | Dashboard: the flyout covers This week in the lane (no peek, no displace); closing shows This week | Proposed (as built) |
| 189 | Compact gets the flyout for a recipe search result; the page reserves the lane while open; rest of Compact unchanged | Confirmed 12 Oct |
| 190 | One flyout at a time, Ctrl or Cmd plus Escape and X close, focus back to the box, lazy; item results keep the Pantry flyout (no light item view) | Confirmed 12 Oct |
| 154 | "Used in": household and own-plan meals plain; someone else's individual plan gets their initial and avatar in brackets ("Tuesday, prawn curry (J)") | Confirmed 12 Oct |
| 155 | Several meals the same day are grouped under one weekday: "Tuesday, prawn curry (J), lamb curry · Friday, egg fried rice" | **Proposal** |
| 157 | A long item name has its own full-width row (3 lines, then an ellipsis) under a slim top row of tile and E, comma and x buttons; the key caps stay on their buttons; "quantity | place" right under the name; desktop only | **Proposal** (owner: "the title is buggered .. sort out the clash with item names and the E, , X buttons", 13 Oct 2026) |

## 6. Open questions

None from the first round: all eight were answered on 12 Oct 2026 (see the job note, "Open questions"). Not drawn and not asked: Shopping results in the search dropdown; the real Edit and History forms (stand-ins; use the item edit flyout's).

## 7. Next steps

1. Owner reviews the updated live page (the Used in line is under `?open=item:spring-onion&week=planned`).
2. Option A is the default; B and C stay as alternatives that were not chosen.
3. When the owner is ready, he converts this into Kitchie issues (AGENTS.md: a PR is not an issue yet). Draft issue text, **not filed** (Kitchie was not touched):

> **Home (desktop): detail panel for items and Cooking ideas**
> On desktop Home, selecting a search result, a Cooking idea, an item under On the way out or one under Running low opens a detail panel. If the window is at least 1624px wide (rail 88 + column 736 + panel 400 + This week 400) the panel takes the lane next to the column and This week shifts right. Below that the panel stacks over This week and leaves a 6px strip of This week showing; the strip is a button (and W) that swaps which one is in front. Items show the Pantry item flyout; Cooking ideas show a recipe view (time, serves, in stock, uses up, Add to plan, Open recipe, missing or short lines, in your pantry). Close is the X or Ctrl or Cmd plus Escape. Spec and decisions 133 to 155: `docs/knowledge/jobs-to-be-done/home-detail-panel.md` in basement-bridge/mockup. Live: <https://basement-bridge.github.io/mockup/fragments/home-detail-panel/index.html>. Layout A, 1624px and a 6px peek are confirmed. Close is Ctrl or Cmd plus Escape; plain Escape does not close. Missing means out of stock only; the recipe panel has a Why this fits blurb; the item panel has a Used in line (planned in the next 7 days, by weekday).

## 8. Process notes

Mockups merge straight to mockup `main` (AGENTS.md); `gh pr create` can 403 from sessions, so the PR is made with `gh api repos/basement-bridge/mockup/pulls --input <json>` and squashed with `PUT .../pulls/N/merge`. Never merge anything but mockups, never tag.
