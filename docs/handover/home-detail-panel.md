# Home detail panel: handover

**Status: drawn 12 October 2026 (Sydney) and merged to mockup `main`. Nothing is built. Nothing is approved:** decisions 133 to 148 are proposals by the design agent and wait for the owner. Style follows [plan-desktop.md](plan-desktop.md). Read `AGENTS.md` and `DESIGN.md` first.

## 1. The ask, in the owner's words (12 Oct 2026, from his message)

On the Kitchie desktop **Home** screen, when the user selects an item from the search dropdown (jalapeño peppers, lime juice), clicks something in Cooking ideas, clicks an item in "On the way out" (Cucumbers, Spring onion stalks) or in "Running low" (Bueno chocolate, crunchy peanut butter, lime), the detail should **displace the "This week" column to the right if there is room**, or, if there is not enough room, **stack on top of This week, leaving it peeking out from behind by about 1 to 2 mm** (a thin visible edge, about 4 to 8px) so it is still discoverable. It shows the **simple view**, consistent with the other Pantry item flyouts, plus a **recipe-specific view** (for a Cooking idea) as a variant. **Mockup first; the owner confirms before anything is built.** The repo is `mockup` (basement-bridge/mockup), **not `kitchie` and not `kitchie-mockup`**.

## 2. What exists and where

| What | Where |
|---|---|
| Options page, width slider, states, notes | `fragments/home-detail-panel/index.html`; live <https://basement-bridge.github.io/mockup/fragments/home-detail-panel/index.html> |
| The live Home screen | `fragments/home-detail-panel/home.html` (add `?opt=a|b|c`, `?open=item:cucumbers`, `?open=recipe:lime-tacos`, `?front=week`, `?child=edit|history`, `?q=lime&sres=1`, `?ideas=ok|loading|unavailable`, `?week=empty|planned`, `?detail=ok|loading|error`, `?peek=6`) |
| Job note, decisions 133 to 148, options, open questions | `docs/knowledge/jobs-to-be-done/home-detail-panel.md` |
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

All four open the same panel. An item shows the Pantry flyout, byte for byte in markup and classes. An idea shows the recipe view. Clicking another row replaces the content in place. Close is the X or Ctrl or Cmd plus Enter. Keys: `/`, arrows or J K, M, E, comma, U D S Z, P O S, W, `?`.

## 5. Decisions 133 to 148 in one line each

| # | Decision | Status |
|---|---|---|
| 133 | One panel, four ways in; item view or recipe view | Proposed, not confirmed |
| 134 | Displace if there is room, else stack | Proposed, not confirmed |
| 135 | Breakpoint 1624px (88 + 736 + 400 + 400) | Proposed, not confirmed |
| 136 | Peek 6px, tinted edge with a grip; lane stays 400px | Proposed, not confirmed |
| 137 | The peek is a button (click, W, hover widens); week and panel swap, nothing closed | Proposed, not confirmed |
| 138 | Switch without closing; arrows move and open | Proposed, not confirmed |
| 139 | Close: X or Ctrl or Cmd plus Enter; plain Esc closes nothing | Proposed, not confirmed |
| 140 | Simple view is the Pantry item flyout verbatim | Proposed, not confirmed |
| 141 | Edit and History tucked under the header in the panel, never a fourth column | Proposed, not confirmed |
| 142 | Recipe view content | Proposed, not confirmed |
| 143 | Add to plan: first empty day, undo toast, peek pulses | Proposed, not confirmed |
| 144 | Search: dropdown inside the column; choosing closes it, opens the panel | Proposed, not confirmed |
| 145 | States: loading, ideas unavailable, panel could not load, nothing planned | Proposed, not confirmed |
| 146 | Crossing the breakpoint keeps the selection | Proposed, not confirmed |
| 147 | Phone and tablet unchanged | Proposed, not confirmed |
| 148 | What loads by default and what is deferred | Proposed, not confirmed |

## 6. Open questions

1. Breakpoint: 1624 (A) or 1448 (C, column narrows). 2. Peek width: 6px, range 4 to 8. 3. Panel versus the search dropdown (proposed: never overlap; choosing closes the dropdown). 4. Recipe view content. 5. Esc: keep Ctrl or Cmd plus Enter, or plain Esc on Home. 6. The W key. 7. Edit and History tucked in, not a fourth column. 8. A "Used in" line on an item (not drawn).

## 7. Next steps

1. Owner opens the live page, picks A, B or C, answers the open questions.
2. Update the job note's decisions from proposed to confirmed (or overturn them), and the PR description.
3. Only then does the owner convert this into Kitchie issues (AGENTS.md: a PR is not an issue yet). Draft issue text, **not filed** (Kitchie was not touched):

> **Home (desktop): detail panel for items and Cooking ideas**
> On desktop Home, selecting a search result, a Cooking idea, an item under On the way out or one under Running low opens a detail panel. If the window is at least 1624px wide (rail 88 + column 736 + panel 400 + This week 400) the panel takes the lane next to the column and This week shifts right. Below that the panel stacks over This week and leaves a 6px strip of This week showing; the strip is a button (and W) that swaps which one is in front. Items show the Pantry item flyout; Cooking ideas show a recipe view (time, serves, in stock, uses up, Add to plan, Open recipe, missing or short lines, in your pantry). Close is the X or Ctrl or Cmd plus Enter. Spec and decisions 133 to 148: `docs/knowledge/jobs-to-be-done/home-detail-panel.md` in basement-bridge/mockup. Live: <https://basement-bridge.github.io/mockup/fragments/home-detail-panel/index.html>. Owner has not confirmed the layout, breakpoint or peek width yet.

## 8. Process notes

Mockups merge straight to mockup `main` (AGENTS.md); `gh pr create` can 403 from sessions, so the PR is made with `gh api repos/basement-bridge/mockup/pulls --input <json>` and squashed with `PUT .../pulls/N/merge`. Never merge anything but mockups, never tag.
