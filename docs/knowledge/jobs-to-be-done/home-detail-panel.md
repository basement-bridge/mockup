# Home: the detail panel (item or Cooking idea), on desktop

Handover for whoever drives this next: [../../handover/home-detail-panel.md](../../handover/home-detail-panel.md).

Mockup: `fragments/home-detail-panel/index.html` (options, a width slider, states, notes) and `fragments/home-detail-panel/home.html` (the live Home screen). Live: <https://basement-bridge.github.io/mockup/fragments/home-detail-panel/index.html>. Builds on [../desktop-layout.md](../desktop-layout.md), [item-edit-flyout.md](item-edit-flyout.md) (the item flyout, numbers 63 to 132) and [plan-desktop.md](plan-desktop.md) (the lane rules). **Status: the owner confirmed all eight open decisions by voice on 12 Oct 2026**; they are written in below as CONFIRMED. Numbers 133 to 153 continue the list after [item-edit-flyout.md](item-edit-flyout.md) (the highest before was 132). 133 to 148 were drawn as proposals and are confirmed as amended by 149 to 153; where a line below says "superseded", the later number wins.

## Job

Same job as Home itself: a glance at what to cook and what is going off, then a look at one thing in detail without leaving the page. The owner's ask (12 Oct 2026, close to verbatim): when the person, on the desktop Home screen, (1) selects an item from the search dropdown (for example jalapeño peppers or lime juice), (2) clicks something in Cooking ideas, (3) clicks an item under "On the way out" (Cucumbers, Spring onion stalks) or (4) clicks an item under "Running low" (Bueno chocolate, crunchy peanut butter, limes), the detail should **displace the "This week" column to the right if there is room**. If there is not enough room, it should **stack on top of the This week column, leaving This week peeking out from behind by about 1 to 2 mm** (a thin visible edge) so it is still discoverable. What is shown is the **simple view, consistent with the other Pantry item flyouts**, plus a **recipe-specific view** (a Cooking idea) as a variant, like the Pantry item panel in the owner's reference screenshot. Mockup first; the owner confirms before anything is built. Repo for this: `mockup`, not `kitchie` and not `kitchie-mockup`.

## How we know the person is in this job

They are on Home at 1024px or wider and pick something on the page (a row, an idea, a search result). Phone and tablet keep the bottom sheet and are not drawn here.

## What leads

The page they were on. The panel is a place to look and do one quick thing, then go back; it never replaces the page and never reflows it (option A). For an item: what the Pantry flyout shows, nothing more. For an idea: whether you can cook it (in stock, missing), and what it would use up.

## What this job does not need

No edit form of its own (Edit and History are the item edit flyout's, tucked in under the header). No recipe steps in the panel (the recipe page has them). No "why" or reasoning beyond one line. Nothing is fetched until it is opened (the owner's rule for desktop).

## Mockup

| Piece | What it shows |
|---|---|
| `index.html` | Layout choice (A, B, C), a width slider and presets with a live reading of which mode applies, the four ways in, the states, the breakpoint table, the three layouts as small diagrams, keys, open questions |
| `home.html` | The Home screen: search with a grouped dropdown (Pantry, Recipes), Cooking ideas (with loading and "not available" states), On the way out, Running low, This week, the panel |
| Panel, item | The Pantry item flyout's markup and classes: header (emoji tile, name, quantity, location, edit, history, close), the four tiles, How much to buy (Running low or Out only), Used up and Add to shopping, the key hint line |
| Panel, idea | Header (tile, name, time and serves, status), tiles (Time, Serves, In stock, Uses up), Add to plan and Open recipe, then Missing or short lines with "+ List", then In your pantry lines, then Uses up chips |
| Viewport code | `stack.css`, `displace.css`, `push.css`: one file per rule, linked with `media=` so a size loads only its own. `home.css`, `home.js`, `data.js` have no size rules |

## Decisions 133 to 153 (all CONFIRMED by the owner, voice, 12 Oct 2026)

133. (CONFIRMED 12 Oct 2026) One panel, four ways in. A search result, a Cooking idea, a row under On the way out and a row under Running low all open the same panel in the same place. An item shows the item view; an idea shows the recipe view. The row that opened it is marked (`.hrow.sel`: lighter fill, accent bar, accent name, as the Pantry's selected row).
134. (CONFIRMED 12 Oct 2026) **Displace if there is room, otherwise stack.** If all four pieces fit side by side (rail, column, panel, This week) the panel takes the lane next to the column and This week shifts one lane right, fully visible. If not, the panel stacks on top of This week.
135. (CONFIRMED 12 Oct 2026) **Breakpoint 1624px** (option A, the default): rail 88 + column 736 (640 plus a 48 gutter each side) + panel 400 + This week 400. Assumptions: panel 400 as the Pantry's flyout; This week 400 as the lane today; the column at its full width; left-anchored with free space on the right (desktop-layout); the media query reads the width including any scrollbar. Media queries cannot read variables, so 1624 is a literal in the two files that use it (`layout.js` for the mockup; the build writes it in its own CSS). A change to any of the four widths changes the breakpoint. Effect: a 1440 or 1536 laptop always stacks; 1680 and up displace.
136. (CONFIRMED 12 Oct 2026) **The peek is 6px** (about 1.6 mm at 96 dpi; the owner's 1 to 2 mm is 4 to 8 CSS pixels, and real millimetres depend on the screen). It is the edge of the This week card, tinted so it reads as another card, with a short accent grip. The lane keeps its 400px and the column never moves: the front card is `--peek` narrower than the lane, the card behind is full width.
137. (CONFIRMED 12 Oct 2026) **The peek is a button.** Click it, press W, or focus it: This week comes to the front and the panel waits behind it, peeking 6px on the right (and the same click or W brings the panel back). Nothing is closed and nothing is lost: the panel keeps its item, its scroll and its open Edit or History. Hover or focus widens the strip by 8px. The hit area is 14px wide (the 6 shown plus 8 over the panel's padding).
138. (CONFIRMED 12 Oct 2026) **Switching without closing.** Clicking another row, idea, chip or search result replaces the panel's content in place (no close, no lane change). ArrowDown and ArrowUp (or J and K) move through the rows in page order and open each, as the Pantry's list does. Choosing a row brings the panel to the front if This week was in front.
139. (CONFIRMED 12 Oct 2026) **Close** is the X or Ctrl or Cmd plus Escape (superseded in part by 149: it was drawn as Ctrl or Cmd plus Enter). Plain Esc closes nothing (it only leaves the search box and its list). Closing puts focus back on the row that opened it.
140. (CONFIRMED 12 Oct 2026) **The simple view is the Pantry item flyout, verbatim**: same markup and classes (`.shead`, `.ib`, `.tiles4`, `.tl`, `.sbuy`, `.sacts`, `.phint`, `.kbd`), the same tiles (level battery, Use by, Minimum, Category, or the dashed Add tiles), the same two buttons and the same keys (E edit, comma history, U use one on counted items, D, S, Z). Nothing is added for Home.
141. (CONFIRMED 12 Oct 2026) **Edit and History open tucked under the header, inside the same panel**, at every width: the item's tiles and buttons are replaced by the child with a back arrow, and pressing the key again or the back arrow returns. Home never opens a fourth column (the item edit flyout does that from 1240px in the Pantry). Reason: Home's lane budget is already four pieces. The Edit and History bodies in the mockup are stand-ins; the real forms are in `fragments/item-edit-flyout/`.
142. (CONFIRMED 12 Oct 2026) **The recipe view** (Cooking idea): header with the idea's tile, name, "time · serves" and a status ("All in" or "n missing"); the four tiles (Time, Serves, In stock, Uses up n); a short "Why this fits" blurb (150); Add to plan (P, primary) and Open recipe (O); then "Missing" (151), each line with "+ List" and an "Add all to list" (S); then "In your pantry"; then "Uses up" chips. An ingredient or a chip that is a pantry item is a button that switches the panel to that item. Steps are not shown (confirmed).
143. (CONFIRMED 12 Oct 2026) **Add to plan** puts the idea on the first empty day from today and says so in an undo toast; if This week is behind the panel its peek pulses once so the person sees something changed behind it. Choosing another day is the plan's job (Plan opens from the day buttons in This week). "Plan" on a row in Cooking ideas does the same without opening the panel.
144. (CONFIRMED 12 Oct 2026) **Search.** The dropdown is inside the column, so the panel never sits over it. Choosing a result closes the dropdown, opens the panel, and keeps what was typed in the box. Results are grouped Pantry then Recipes (Shopping is not drawn). Accents and case are ignored (jalapeno finds Jalapeño). Enter takes the highlighted result, or the first.
145. (CONFIRMED 12 Oct 2026) **States.** Cooking ideas: loading (three placeholder rows), "Ideas are not available right now" with Try again (what the owner sees today; the pantry rows still open), ok. Panel: loading (placeholders), could not load with Try again (nothing was changed), ok. This week: "Nothing planned" for each day, or the planned days; "Tap a day to open the plan." is the footer in both. A panel that is open when the idea list goes unavailable stays open.
146. (CONFIRMED 12 Oct 2026) **Crossing the breakpoint** while the panel is open (a window resize, a monitor change) switches between displace and stack at once; the open item, scroll and which card is in front are kept (in displace there is no "front"; the choice returns when the window narrows again).
147. (CONFIRMED 12 Oct 2026) **Phone and tablet are unchanged** (bottom sheet). This note and the mockup are desktop only (1024px and up). Below 1224px the column gives up width as in the Pantry; the lane stays 400px.
148. (CONFIRMED 12 Oct 2026) **Loading.** Default path of Home: `theme.css`, `flyout.css`, `home.css`, `data.js`, `home.js`, plus one size file by media query. No images. Deferred: the recipe view (`recipe.js`) on the first idea opened and Edit or History (`child.js`) on the first E or comma. The build fetches an item's or an idea's detail only when it is opened, never with the list. `layout.js` exists only so one page can show three options.

149. (CONFIRMED 12 Oct 2026, owner by voice; replaces the Ctrl or Cmd plus Enter close of 139) **Close is Ctrl or Cmd plus Escape**, the same shortcut as the item edit flyout. **Plain Escape stays reserved for leaving full screen and does NOT close the panel** (it still leaves the search box and its list). The X closes too. Shown on the X's tooltip and in the `?` list.
150. (CONFIRMED 12 Oct 2026) **The recipe panel carries a short "Why this fits" blurb** (one or two sentences, e.g. what it uses up and what is out) and no recipe steps. Steps stay on the recipe page behind Open recipe.
151. (CONFIRMED 12 Oct 2026) **"Missing" means completely out of stock only.** A line that is running low is NOT missing: it is listed under "In your pantry" with "(running low)", is not counted in "n missing", and is not added by "Add all to list". The section is called "Missing", not "Missing or short". The In stock tile counts everything that is not missing.
152. (CONFIRMED 12 Oct 2026, confirms 141) **Edit and History swap the same panel's content in place**: the panel keeps the This week slot and its width, and its header; the item's tiles and buttons give way to the form or the history. Not a fourth column, at any width.
153. (CONFIRMED 12 Oct 2026, owner by voice; scoped as stated) **"Used in" line on the item panel (format amended by the owner, same day: weekday first).** It lists only ideas actually **planned within the rolling next 7 days** (today and the six days after) that use this item. If none, the line is omitted. It names the **day of the week, never a date**: **weekday first, then the recipe name**, full weekday names: "Used in: Tuesday, prawn curry" (several, in day order within the rolling 7 days, separated by a middle dot: "Used in: Tuesday, prawn curry · Friday, egg fried rice"). Owner by voice, 12 Oct 2026: "Day, Tuesday, mango curry"; this replaces the first wording "prawn curry Tuesday". A rolling 7-day window can never hold two of the same weekday, so the weekday alone is unambiguous. It sits under the two buttons and above the key hints. In the mockup it reads the planned days of This week; adding an idea to the plan adds it. It is not shown on the recipe view (the idea itself is the subject). Sample: Spring onion stalks with a planned week shows it; Jalapeño peppers does not.

## Options (the layout is genuinely open; recommend A)

| Option | Rule | Files | Cost |
|---|---|---|---|
| A. Displace, then stack (**chosen, default**) | Displace from 1624px, stack below | `displace.css` (min 1624), `stack.css` (max 1623.98) | A 1440 or 1536 laptop never sees This week beside the panel |
| B. Always stack (not chosen) | Stack at every width, with the peek | `stack.css` | Wide monitors waste room; This week hidden when it could be shown |
| C. Narrow the column, then stack (not chosen) | Displace from 1448px by letting the column shrink from 736 to 560 while the panel is open; stack below | `displace.css` and `push.css` (min 1448), `stack.css` (max 1447.98) | The lists reflow on every open and close; the search box gets short |

**Chosen: A** (owner, 12 Oct 2026). B and C stay in the mockup as shown alternatives, not chosen. A was recommended because it is the owner's rule as written, it keeps the page still, and the stack is the same component as the displaced one with one rule changed. If the owner wants the week beside the panel on a 1440 laptop, C is the way; its cost is the reflow.

## Keyboard

`/` search; Arrow keys or J and K move and open; M first row; E edit; comma history; U D S Z as the Pantry; P O S for ideas (add to plan, open recipe, add the missing to the list); W bring This week forward or back (stack only); Ctrl or Cmd plus Escape close; ? or H the list. None fires while typing or with Ctrl, Cmd or Alt held (except the close).

## Open questions

All eight questions of the first round are answered (CONFIRMED, 12 Oct 2026): 1 breakpoint 1624px; 2 peek 6px; 3 the dropdown closes on select and the panel opens (144); 4 recipe view content (150, 151); 5 Escape (149); 6 W stays for This week on Home (a different page from the plan's week picker, so no conflict); 7 Edit and History swap in place (152); 8 the "Used in" line (153). Still not drawn, not asked: Shopping results in the search dropdown; the real Edit and History forms (stand-ins here, the real ones are in the item edit flyout mockup); how an idea's ingredient stock is fetched (Recipe's `what_am_i_missing`, asked on open).

## For the implementation

- Build the markup and CSS from `fragments/home-detail-panel/` and `fragments/item-edit-flyout/flyout.css` (the item flyout is the same markup); list each difference in the pull request (AGENTS.md "Mockup and build stay close").
- Class names new to this fragment: `.detail`, `.week`, `.peek`, `.hrow` (plus `.rl`, `.rsec`, `.chip`, `.chips`, `.child`, `.away`). Everything else is the desktop Home's or the item flyout's.
- `data-open` on `.app` is `none`, `item` or `recipe`; `data-front` is `detail` or `week`; `data-mode` (set by script) is `stack` or `displace` and is informational only: the media queries decide.
- State is in the URL in the mockup (`open`, `front`, `child`, `q`, `ideas`, `week`, `detail`, `opt`, `peek`); the build can keep `open` in the URL as the plan does.
- Real data: the panel reads the same item and idea records the rows already have; the idea's ingredient list and its stock match come from Recipe's `what_am_i_missing`, asked on open.
- Check: `node tools/home-detail-panel-check.mjs` (54 checks: behaviour, breakpoints, states, no console errors, no sideways scroll). DESIGN.md learnings applied: 1 start from the job, 2 one token set, 4 one visual family, 5 options, 6 load only what is needed now, 7 form factors.
