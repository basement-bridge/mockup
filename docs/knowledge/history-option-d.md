# History, Option D: catch-up feed, last five, structured filters

**Revised to the owner's locked decisions H4 to H10 (11 Oct 2026).** The decisions are in `history-options.md` (H1 to H10) and win over anything below. Numbers D1 to D20 are Proposals; those the decisions removed are marked **Superseded**. Nothing is built into Kitchie or Recipe.

Mockup: `history/option-d/index.html` (responsive: phone under 1024px, rail + column + lane from 1024px). `mobile.html` and `desktop.html` frame the same page at 390 and 1440 wide. Code: `option-d.css`, `option-d.js`. Screenshots: `docs/screenshots/history-option-d-*.png`.

Open it with: `?as=arjan|sam` (admin or member), `&tab=mine|house`, `&last=wed|sat` (last visit; Wed is older than the cap), `&view=list` (after the X: the last five), `&filters=1` (desktop lane or phone sheet), `&step=when|who|area|place|app|aff` (phone sheet step), `&range=3d|today|week|month`, `&who=sam&area=Pantry&place=Fridge&app=recipe&aff=1`, `&state=caught|empty|loading`, `&group=time`. A small Preview button bottom right switches person, last visit and state (mockup only).

## The owner's words (voice, 11 Oct 2026)

History should be searchable on mobile and on desktop, with separate layouts designed together in one pass so he can lock decisions in one go. It covers both Kitchie (inventory, shopping, plan, cooking, preferences) and Recipe (create, edit, versions, cook, star and vote). Think broadly about what people look for: things they did themselves, things other household members did (and the AI assistants, voice and MCP), specific items or recipes, time ranges, action types, places. Propose options, not decisions.

Standing owner rules this respects: jobs first (`DESIGN.md` 1), playful empty states (3), one visual family (4), speed and "fetch only when asked" (6, `desktop.md` section 1), close with Ctrl/Cmd+Esc and plain Esc only clears search, Shift+? global (`shortcut-cues.md`), subject control and admin gating (`preferences-principles.md` P1, P2, P3), AI assistants labelled (`settings-window.md` SW-10).

Later locked decisions (owner, voice, 11 Oct 2026, `history-options.md`): H4 catch-up is the entry; H5 a tap opens option C's flyout; H6 three days at most; H7 the X leaves the catch-up; H7a phone uses a filter pick, nothing typed; H7b the last five after the X; H8 desktop follows D; H9 no "ask it" search; H10 no Assistants tab: "Assistance and other people are the same. Like assistant just represents the person."

## What this option is

Job: "I have been away. What happened in our kitchen, who did it, and does it affect me?"

- **Entry (H4, H6, H8):** the "Since you were last here" catch-up, grouped by day, then person. **At most three days** (today and the two before, a Proposal), even if the last visit was longer ago. When the cap cut the window the feed ends with "Showing the last 3 days. Search for older." and a Pick a filter button (Proposal wording from H6).
- **Tabs (H10):** My activity and Household only. An assistant's action is shown as the person it acted for, with no extra mark.
- **The X (H7, H7b):** an X on the catch-up clears it and shows the **last five** entries, newest first, with Show more (five at a time, inside the cap).
- **Phone (H7a):** after the X, a Filters icon and "Pick a filter" open a bottom sheet drawn like Pantry's Filters sheet (`.sheet.tall`, `.strow`, `.mc` classes): first a list of filter groups (When, Who, Area, Where, App, Touches me), then the options of the one picked. Nothing is typed.
- **Desktop (H8):** same catch-up in the column and lane (rail, column, lane kept). The structured filters sit in the lane as a filter panel (Pantry's `.fp` panel classes; Proposal). After the X the column shows the last five and the panel stays open beside it.
- **Tap an entry (H5):** a link into option C's in-context flyout (`history/option-c/mobile.html?scope=item:tea`, `desktop.html` on wide screens), not redrawn here. Where no item, recipe or day fits (preferences, household, whole shopping list) it opens C's Everything.
- **No typed or "ask it" search anywhere (H9):** no search box, typeahead, suggested questions or natural-language chips.

## Field catalogue (what each field is for)

One event record. A field earns its place by a filter, a label or a link; otherwise it is left out. **Actor is a person** (H10): there is no assistant actor category.

| Field | Example | Used for |
|---|---|---|
| `id` | e5 | Row identity |
| `at` (day, time) | Sat 10 Oct, 7:44 pm | Day grouping, When filter, three-day cap, "new since last visit" |
| `actor` | Sam, Arjan, Shopper link | The "person" group, Who filter. An assistant's action is stored under the person it acted for |
| `actor_kind` | person, visitor | Label only for the one-off shopper link ("No sign-in"). Not an assistant category |
| `app` | kitchie, recipe | App filter; one feed for both |
| `area` | Pantry, Shopping, Plan, Cooking, Preferences, Versions, Stars and votes, Household | Area filter and icon |
| `verb` | used up, moved, planned, cooked, edited, saved a try | Action type; closed list so it can be translated |
| `subject` (type, id, name) | item Green tea, recipe Egg fried rice | The bold word in the sentence; the link target in option C (`go`) |
| `place` | Fridge, Freezer | Where filter |
| `scope` | household, admin, personal | Privacy (D6 to D8); the lock chip |
| `owner` / `to` | sam; arjan | Whose personal record it is; who a proposal is for |
| `affects` (people, one line each) | arjan: "Green tea ran out" | The catch-up card and the Affects you chip and filter |
| `needs_review` | true | To review chip, Review button |
| `open_in_c` | item:tea | Which option C flyout a tap opens |

Dropped from this option's catalogue (owner decisions, or owned by option C's flyout): `via` and `on_behalf_of` (assistant, voice, chat: H10), `words`, `change` (from, to), `undoable` and `group_id`/`kids` (the detail and undo live in option C's flyout, H5). Whether the channel is recorded at all is still question 2 in `history-options.md`.

Not stored on purpose: reads and questions ("what can I cook?"). Only changes are history (D17).

## Proposals

Marked **Superseded** where an owner decision removed them. Everything else is a Proposal.

- **D1. Feed first, search second.** **Revised:** the catch-up feed is first; "search" past it is structured filters only (H9). No search field.
- **D2. Three tabs.** **Superseded by H10:** two tabs, My activity and Household. Default Household; keys 1 and 2. Each tab shows a count of changes not seen.
- **D3. The window rule.** **Superseded by H6:** the window is since the last visit, at most three days (today and the two before; a rolling 72 hours is the open alternative). "Show 5 more days" is gone; older is a filter (When: 7 or 30 days).
- **D4. Day, then person.** Inside a day, one card per person (initial, name, count). "By time" is a switch for one flat list. My activity is always flat. **Revised:** assistants are not separate cards (H10).
- **D5. "Since you were last here" is cleared by the X.** **Revised (H7b Proposal):** the X, or key C, counts as caught up, so a dismissed catch-up is the new "last seen". The old "Mark as caught up" button is gone.
- **D6. Privacy: shared by default, personal stays personal.** Unchanged.
- **D7. Others' personal entries are counted, never shown** ("2 private, hidden"), admins included. Unchanged.
- **D8. Admin-only entries** show to admins only. **Revised:** "linking an assistant" is no longer a drawn example; the sample uses a role change.
- **D9. Proposals for another person** show to the person and the proposer, and appear as "Waiting for you". Unchanged.
- **D10. Assistants, voice and the shopper link are labelled.** **Superseded by H10 for assistants and voice** (no chip, no mark). Only the shopper link keeps "No sign-in" because it is a visitor, not a member.
- **D11. Assistants tab.** **Superseded by H10.** Removed, with its card and filter.
- **D12. Affects me.** Unchanged: a chip, the catch-up card (up to 4, then "and n more") and a filter. Computed on the server when the event is written.
- **D13. Search is a typeahead of tokens.** **Superseded by H9.** Removed.
- **D14. One filters set.** **Revised:** When (Last 3 days, Today, 7 days, 30 days), Who (me, the other member, shopper link), Area, Where, App, Touches me. Same type combines with OR, different types with AND. Counts shown; zero is dashed (as Pantry Filters). Phone: bottom sheet in two steps (pick a group, then options). Desktop: panel in the lane.
- **D15. Desktop layout.** Rail, 640px column, 400px lane (360px below 1240px). The lane shows the catch-up card (with its X) or the filter panel (F). Detail is no longer drawn here (H5), so the lane never holds a detail.
- **D16. Phone layout.** One column; catch-up card on top; X on the card; after the X a Filters icon in the header and a Pick a filter button under the list. No key hints on touch.
- **D17. Only changes are history.** Unchanged.
- **D18. Undo.** **Superseded here:** undo lives in option C's flyout (H5).
- **D19. Keys.** `F` filters, `1 2` tabs, `J K` move between entries (Enter opens), `G` group (catch-up), `C` clear the catch-up, `M` show more (last five), Ctrl/Cmd+Esc closes the open panel, Shift+? lists them (`shortcut-cues.md`). Removed: `/` search, `3`, `Z` undo, plain Esc clears search. `,` is left alone (item History in the Pantry).
- **D20. Empty and zero states are playful and honest.** New household: "A quiet kitchen so far". Nothing from me: "Nothing from you in the last 3 days". Nothing since the last visit: "Nothing since you were last here" with Show the last five. Loading: skeleton rows, this tab only. No results: names the filters, "Look back 30 days" and "Clear filters".
- **D21. (new) Last five.** Five newest entries in total across pantry, recipes and shopping, newest first, inside the three-day cap, Show more adds five. Proposal; whether five is per area is open.
- **D22. (new) Catch-up shows everything in the window.** The catch-up feed is not itself limited to five; only the list after the X is.

## Open questions (what a wrong guess costs)

- **O1. Five in total, or five per area (H7b)?** Drawn: in total. Wrong guess: one slice instead of three; no data change.
- **O2. "There's only two things in the mobile."** The owner did not finish. Not guessed: the mockup does not assume two filter groups or two views (the sheet lists six groups).
- **O3. Does a mark show an entry was done through an assistant (voice, chat) (H10)?** None is drawn and none is invented. Wrong guess either way: one chip.
- **O4. Is a plain keyword box that matches only item, recipe and member names still wanted (H9 open)?** Not drawn.
- **O5. Is the three-day cap calendar days or 72 hours?** Drawn: calendar days.
- **O6. Does the catch-up itself stop at five, or only the list after the X?** Drawn: only after the X.
- **O7. Desktop uses a filter panel rather than the phone's sheet, and the last five apply after leaving the catch-up (H8 Proposals to confirm).**
- **O8. Does the X count as caught up?** Drawn: yes (H7b Proposal).
- **O9. Where do entries with no item, recipe or day (preferences, household, shopping lists) open in option C?** Drawn: Everything.
- **O10. Are votes and stars personal (D6), may admins see personal entries (D7), is "last seen" per person on the server or per device, how long is history kept?** As before: shared questions in `history-options.md`.

## What the default path loads, and what waits (`DESIGN.md` section 6)

- **Loads on open:** the page, `option-d.css` (about 15 KB) and `option-d.js` (about 40 KB, includes the sample data that the build replaces with a call), `theme.css`, `shared.css`, `cues.css`. One call: the **active tab only**, for the last 3 days at most, since the last visit, grouped on the server, with the catch-up line fields (`affects` for me) included. The other two tabs show only a count (a small count call, or one number in the same response).
- **Deferred until asked:** the other tab; the last-five list (fetched when the X is pressed; it is inside the window already loaded, so no call is needed unless the catch-up was empty); anything wider than three days (a server window, only when a When filter is picked); filter counts (fetched on opening Filters); the entry itself (option C's flyout loads on tap, never preloaded); the shortcuts list (built on first Shift+?); other themes (theme.js).
- **Never loaded:** other people's personal entries (counted by the server, not sent), admin-only entries for members.
- **Nothing refreshes by itself.** A "new since you opened" pill is a Proposal for later; the mockup does not poll.
