# Pantry, Recipes and Home in variant D (the table), locked

Status: **drawn for the owner to try on his phone (25 Oct 2026). Nothing is built in Kitchie and nothing here is confirmed beyond what is marked Decided.** Phone only (390 wide, checked at 360). Source: owner, voice, 25 Oct 2026, while trying the four variants of `list-language.md` on his phone; the voice session wrote the first handoff, this text session baselined UAT and drew it.

Mockup: `fragments/pantry-d/` (`index.html`, one phone: `?s=pantry|recipes|home`; engine `pd.js`, skin `pd.css`, sample data `pd-data.js`; it sits on `fragments/list-language/ll.css` and `ll-data.js`, which are unchanged so the four-way comparison stays as reviewed). Options row at the top of the page switches the Home basis style, the Home plan state and the Home hero layout. The chip look is fixed to tabs (round two).

## Governing rule (owner)

D is locked. **Anything not explicitly changed below stays exactly as UAT behaves today.** Filters, search and its toast are untouched (the Filters sheet and the search bar are the ones in `list-language`). Mockup first: the built app matches this exactly.

## UAT baseline read before drawing (kitchie `d14049a`, 25 Oct 2026)

| Thing | UAT today | In this mockup |
|---|---|---|
| Swipe (`server/src/assets/swipe.js`) | right 90px = add to shopping list; left 90px = use one (used up when it cannot step down); left 190px = used up; Undo bar 5 s | the same numbers and meanings; toast with Undo for 5 s |
| Use-by wording (`useby.js`) | "Past use by N days", "Use today", "Use within N days" up to 7, then "More than a week"; red past, amber 3 days or less | **changed by the owner**: short counts (see D-9) |
| Lean (Home "Tune ideas", `home-ideas.js`) | six chips in a cookie: Balanced, Use it up, Quick, Favourites, Something different, Batch | the same six names, now behind Swap and called "Based on" (D-19) |
| Home cooking card | Plan, Make it, Why, Tune ideas, Not tonight, Ask your assistant | Plan becomes Add to plan; Swap added; **Why and Not tonight are not drawn here (unchanged in UAT, to be placed in the build)** |
| Home hero swap/replace | none: a planned meal cannot be changed from Home | Swap (new, owner asked for it) |

Not read, so not claimed: how UAT's Home Running low section ranks and collapses (the owner said keep it), how History's catch-up clears in code (the mockup follows the divider spec in `history-search.md`).

## Decisions (owner, voice, 25 Oct 2026) and how they are drawn

| # | Decision | Drawn as |
|---|---|---|
| D-1 | Selection stays after an action. Clears only on Done or Cancel. | Copy and Add to list toast and leave the picks. Tick button = Done. The header cell turns into an X = Cancel. A folded group shows how many picked items it holds. |
| D-2 | Long hold on a group heading, any group open: collapse everything. A tap still opens or closes one. | 480 ms hold, short buzz where the device allows, toast "All collapsed". |
| D-3 | All collapsed: a long hold lifts the heading, drag it to reorder. Reason: collapse, drag the two or three categories wanted together, open just those, pick across them, act in one flow. | A grip appears on each band only while all are collapsed; the held band lifts and follows the finger; the order is kept for the page (**open: does it persist between visits**). |
| D-4 | The Amount column is sortable; it holds amount and level together, stacked on two lines. Level is a symbol, never a word. | Head "Amount": level lowest first, then amount (**Proposal, the order is not confirmed**). A level-only item shows only the squares. |
| D-5 | Catch-up view: one flat list of what changed since the person last looked, no category grouping, clears the way History's catch-up does. | A quiet divider in the list ("You were here on Saturday evening", with a count) opens the flat list; its band has Clear, which marks everything seen. **Open: window (since last visit or 24 h), whether removals count.** |
| D-6 | The second line: category when grouped by location, location (the spot) when grouped by category. | As said; in a custom (flat) view it shows both. |
| D-7 | Bottom bar while picking takes the tab bar's place, icons only: cart, copy, tick. | As said, with the count on the left. **Open: the tick means Done (drawn). The owner asked if a tick is right for "used up"; Used up stays a swipe.** |
| D-8 | Left and right swipe still work while picking. | Yes. |
| D-9 | Use-by in short counts: 1D, 5D, ... , 1W, 2W, 3W, 1M; red pill for anything past. | Today reads "Today". Past is a red pill with a minus sign (−1D), so the state is not colour alone. 1 to 3 days left is amber text; later is grey. **Proposal: 7 to 13 days = 1W, 14 to 20 = 2W, 21 to 27 = 3W, 28 and over = 1M (then 2M by 30-day months).** |
| D-10 | Keep the right-hand columns narrow so names get the room. | Amount 56 px and Use by 54 px (110 px together; the earlier D used 176 px). Names wrap to two lines then end in "…". |
| D-11 | Category and location chips: tabs. **Decided (owner, round two):** words in a row, a line under the one that is on, on Pantry and Recipes. The other four looks are gone. | Tabs only. |

### Recipes (same table)

| # | Decision | Drawn as |
|---|---|---|
| D-12 | One fixed square tile in both lists (emoji or letter on Pantry, photo on Recipes), because Pantry is icons and Recipes has pictures. | A 34 px rounded tile in both. The mockup has emoji stand-ins for photos. **Proposal; the owner wanted to see it on his phone before deciding.** |
| D-13 | A small star right after the recipe name, in a fixed slot so a long name shortens first. The Starred chip stays as the filter. | As said. |
| D-14 | No servings control or count on the list. | The "serves N" text is gone from the row. **Open: the owner said "a label right under the title"; it was taken as this one. UAT's Recipes list was not read, so whether UAT has a servings control there is unconfirmed.** |
| D-15 | The label under the title is bold and too loud. | The line under the title is now one quiet "cooked 4d ago"; the ready and missing labels are regular weight. **Open: which label he meant.** |

### Home

| # | Decision | Drawn as |
|---|---|---|
| D-16 | Home takes B's hero card, card style A (one surface). The alternate ideas keep working as in UAT. | A bold hero card for tonight's idea. The alternate ideas are reached through Swap's basis (below); their ranking is not redrawn. |
| D-17 | Button accent follows the plan: planned for today = Make it; planned for another day = Swap; nothing planned = Add to plan. Width follows the room: Make it shrinks first, then becomes a cooking symbol; Swap becomes a swap-arrows symbol. | `?plan=today|other|none`. Labels drop at container widths 250 px and 170 px; every icon-only button keeps its name for assistive tech. |
| D-18 | Swap: try something else on the planned meal, from Home. Not in UAT today. | Swap turns the button row into the recommendation basis, **"Based on"**, with the six real lean names. Turning the strip changes the hero idea live. |
| D-19 | Nothing locks in on its own. After 3 seconds without movement a Confirm button lights up as the accent; the plan changes only when it is tapped. If the idea is for today, Make it stays and tapping it also confirms. First week only: a quick left-to-right jiggle hints there is more. | Confirm is present but dim until the 3 seconds pass, then accented. Confirm shows an Undo toast (**UAT uses 5 s; the Plan screen's chip uses 14 s: open**). The jiggle plays once when Swap opens (`?hint=0` turns it off); the build must keep a first-seen date so it stops after a week. |
| D-20 | Show other ways than a carousel. | `?basis=carousel` (peeking, default), `dial` (one centred option, like the Settings rotary), `chips` (all six visible). |
| D-21 | On the way out: a carousel of one-line cards; location matters, quantity does not; same short use-by words; if the level is automatic show the quantity, if it was set by hand show the level symbol, never both. | Cards of 54 px: icon, name over the spot, then quantity or level, then use-by. Turmeric has a hand-set level. |
| D-22 | Running low stays a list, collapsing by UAT's rules. Rows: icon, name, quantity, one cart icon. No low marker, no level, no use-by. The cart is information only (filled = already on the list). Swipe right adds, swipe left removes. | As said. **Open: whether the spot shows on these rows; whether a swipe hint is needed.** |

## Open questions for the owner

1. Sort order for Amount (level first, then amount) and what happens on a tie.
2. The tick on the picking bar: Done (drawn) or something else.
3. Catch-up: window, whether removals count.
4. Does the custom group order persist between visits, per person or per household.
5. Which chip look.
6. Home: which basis style; Confirm Undo length (5 s or 14 s); whether the hero shows a different night's idea as "Planned Saturday" (drawn so for `?plan=other`).
7. Recipes: which label was too loud; whether UAT's list has the servings count he wants gone.
8. How Swap treats a Not cooking mark or a hold on that night.
9. See all links on the Home strips (not drawn).

## What loads (DESIGN.md section 6)

Default path: `theme.css`, `ll.css`, `pd.css`, then `ll-data.js`, `pd-data.js`, `pd.js` (about 40 KB together, one screen). Built when opened, never on first paint: the Filters sheet, and on Home the basis strip. No fonts or images beyond the theme's. Nothing is fetched or saved.

## Checks

Phone widths 390 and 360, light and dark; long names (olive oil, flour) and long spots; swipe, hold, lift, picking, catch-up and the Swap flow driven with a script. 
## Design review (separate senior-mobile-UX agent, 25 Oct 2026): Pass with changes, changes done

Checklist 9.8, evidence: 1 Jobs pass; 2 Accent pass with changes (accent also sits on the sort head, chip, "N new", 1D to 3D and the cart: several things compete, owner to judge on his phone); 3 Presentation pass; 4 Words minor fail ("You were here on Saturday evening" is the History wording, kept); 5 Duplication pass with changes (a chip and its band both show a count); 6 Targets pass (header cells 44, chips 44, rows 54 to 60, bar buttons 56x48, hero buttons 48); 7 Text +30% was a fail because the CSS had no rem; **now sizes are rem and the page does not scroll sideways at 130% (checked at 360)**, long Amount text still ends in "..." at 130%; 8 Dark pass; 9 Warmth pass with changes (Pantry and Recipes tiles are letters and emoji only).

Fixed after the review: keyboard focus kept across redraws, the Filters sheet takes focus and returns it, Escape works from anywhere; `?theme=` honoured; header, level and tab text enlarged (level squares 10 px, heads 12 px); the hero reads "Trying" while a different idea is previewed; the Add to list swipe has a real Undo and says "Already on the list"; "Use one" no longer turns 30 g into 29 g; the basis strip is a radio group with arrow keys and the jiggle plays only in the first week (kept per browser here) and never with reduced motion; a sort tap leaves the catch-up; the chosen chip scrolls into view; the second line under a category group now reads "Pantry · Spice bin" (location and spot); the two hold gestures have keyboard routes (Shift+Enter on a band folds or opens all; Alt+Up or Alt+Down moves a band when all are folded).

Still open from the review: swipe has no visible hint on Pantry rows or Running low (tap opens the item, where Add to list also lives, as in UAT); Add to plan, Make it and Swap are never all shown together (`plan=none` has no Swap because there is nothing to swap, `plan=other` has no Make it because the owner said Make it only for the same day): confirm; "N missing" on Recipes is still red text; the star sits straight after the name and the name shortens first, which is the fixed slot as drawn; the Based on dial gives no sign that more options sit beside it.

## Round two (owner, voice, 25 Oct 2026, after trying it on his phone): applied

| # | Decision | Drawn as |
|---|---|---|
| R2-1 | Chips are tabs everywhere, for consistency. | Default and only look. The `?chips=` switch is removed. |
| R2-2 | On the way out: two rows, tighter, fill the width. Row 1 name and use-by; row 2 where it lives and the quantity or the level; level and quantity in the same place at the same size, never both. Past use-by is red writing, not a pill. | Cards are 47 px tall (44 minimum) and about 322 px wide at 390, so the next card peeks in. Past use-by is red text with the minus sign (not colour alone). **Open: the table rows on Pantry still use the red pill from D-9; say if they should match.** |
| R2-3 | Swipes copy UAT exactly as it is today (kitchie `d14049a`), no restyle, no invented icons. | The panel under the row is UAT's `.swipe-under`: accent "− Use one", danger "✓ Used up", the added-green cart and "Add to list", fading in with the drag, the label growing when armed, the row lifting with a shadow and springing back (`.22s`), the row sliding off for Used up, 90 px and 190 px, a short buzz at each stage. The Undo bar is UAT's: at the top, accent, "Undo" button, 5 s. Messages use UAT's words ("X added to your list", "x: 1 left", "x used up", "X is already on your list"). UAT's nudge (a small move each way once per visit, at most four visits, never after three swipes) is drawn too; `?hint=0` turns it off. The two colours UAT calls `--added` are copied into the fragment. The cart icon is the one the app already has. |
| R2-4 | Running low: left swipe (remove) only when the item is on the list (filled cart); nothing when it is not. Right swipe adds when it is not on the list. | Done. A right swipe on one already on the list does nothing (**proposal, as suggested; open**). |
| R2-5 | Running low: a long pull right = "don't remind me", like the one Pantry has for a low-stock nudge. | Drawn from the design in `design-867-low-stock-dismiss`: past 190 px the panel changes from "Add to list" to "Don\u2019t remind me", the row leaves, the bar says "X hidden until it changes" with Undo. **Proposal, not confirmed with the owner:** in UAT that dismissal is the same mechanism as removing a computed entry from the shopping list (a fingerprint that falls away when the item changes, household-wide, no time cap), so a left swipe "remove" on an item that is on the list and this one are close cousins. Panel colour is a neutral grey, not one UAT has. If all are hidden the section disappears (empty is absent). |
| R2-6 | The hero had more content, so it had a bigger picture. | Picture 88 px (beside) or a 116 px banner (top), plus the time, what is missing by name and one line on why it was picked. **Open: the owner's answer on top versus beside was not heard; `?hero=left` (default) or `?hero=top`, he picks.** The "why" lines are sample text. |
| R2-7 | Recipes pictures read differently from Pantry's icons. | Recipes tiles are a filled, ringed square with slightly tighter corners (40 px, a stand-in for a real photo); Pantry tiles stay the outlined icon tile. **Proposal; open until he sees real photos.** |

Not done, still open from before: which Home basis style; Amount sort order; what the tick means; catch-up window; group order across visits; Confirm Undo 5 s or 14 s (the swipe Undo is UAT's 5 s); Recipes servings label; the plan none/other buttons; See all links; Why and Not tonight not drawn.

### Design review of round two (separate senior-mobile-UX agent, 25 Oct 2026): Pass with changes, changes done

Swipe checked against UAT's code: thresholds, colours in light and dark, labels, spring, slide-off and Undo bar match. Fixed after the review: swipe actions now also have buttons for keyboard and screen reader (hidden until focused, as UAT keeps its row buttons), including Add to list, Remove and Don\u2019t remind me on Running low; the On the way out position is kept when Home redraws; the Recipes tile is 36 px with a neutral fill (it was crowding the edge and adding a second accent); the Remove panel word is shorter; a blocked swipe on Running low gives a small give instead of nothing.

Still open (suggestions): "Don\u2019t remind me" is household-wide in UAT's mechanism, no list to unhide from after the 5 s Undo, and 160 to 190 px looks the same as the Add stage (easy to overshoot); no swipe hint on Running low; the red pill on Pantry rows versus red writing on the cards; hero "top" at +30% text pushes Running low down (beside is the safer default); UAT draws a coloured edge bar on all three swipe stages (mockup only on Used up); the mock theme\u2019s light `--on-accent` is white where the app\u2019s is cream.

### Left swipe, UAT\u2019s rule (owner, 25 Oct 2026)

Short left = use a bit, long left (190 px) = used up, as UAT. "Use one" takes off one configured step (`server/config/unit-rules.json`: g and mL 50, kg and L 0.25, pack, jar, bag and the like 1); when that is all there is, it is used up (so 50 g or less, and a single jar, go to Used up). Free text such as "3 tubs" goes down by one. The panel label follows: "\u2212 Use one" when it will step down, "\u2713 Used up" when it cannot. Not separately re-reviewed (a one-function change to match UAT).
