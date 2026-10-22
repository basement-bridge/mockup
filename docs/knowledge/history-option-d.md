**Field catalogue superseded 23 Oct 2026 by the canonical event model (`history-event-model.md`, section 6 lists every change) and drawn again on it in `history/search/` (`history-search.md`). The locked structure (H1 to H15) stands.**

# History, Option D: catch-up feed, recent history, structured filters

**Revised to the owner's locked decisions H4 to H10 (11 Oct 2026) and H11 to H15 (12 Oct 2026: tick and X, person link, second tab, "recent" wording, day-at-a-time loading).** The decisions are in `history-options.md` (H1 to H15) and win over anything below. Numbers D1 to D27 are Proposals; those the decisions removed are marked **Superseded**. Nothing is built into Kitchie or Recipe.

Mockup: `history/option-d/index.html` (responsive: phone under 1024px, rail + column + lane from 1024px). `mobile.html` and `desktop.html` frame the same page at 390 and 1440 wide. Code: `option-d.css`, `option-d.js`. Screenshots: `docs/screenshots/history-option-d-*.png`.

Open it with: `?as=arjan|sam` (admin or member), `&household=two|more` (H13: two people names the tab "Sam"; three people names it "Others"), `&tab=mine|other`, `&person=sam|arjan|priya|visitor` (H12: catch-up scoped to one person), `&last=wed|sat` (last visit; Wed is older than the cap), `&view=list` (after the X: recent history, a day at a time), `&filters=1` (desktop lane or phone sheet), `&step=when|who|area|place|app|aff` (phone sheet step), `&range=any|today|week|month`, `&who=sam&area=Pantry&place=Fridge&app=recipe&aff=1`, `&state=caught|ticked|empty|loading`, `&group=time`. A small Preview button bottom right switches person, last visit and state (mockup only).

## The owner's words (voice, 11 Oct 2026)

History should be searchable on mobile and on desktop, with separate layouts designed together in one pass so he can lock decisions in one go. It covers both Kitchie (inventory, shopping, plan, cooking, preferences) and Recipe (create, edit, versions, cook, star and vote). Think broadly about what people look for: things they did themselves, things other household members did (and the AI assistants, voice and MCP), specific items or recipes, time ranges, action types, places. Propose options, not decisions.

Standing owner rules this respects: jobs first (`DESIGN.md` 1), playful empty states (3), one visual family (4), speed and "fetch only when asked" (6, `desktop.md` section 1), close with Ctrl/Cmd+Esc and plain Esc only clears search, Shift+? global (`shortcut-cues.md`), subject control and admin gating (`preferences-principles.md` P1, P2, P3), AI assistants labelled (`settings-window.md` SW-10).

Later locked decisions (owner, voice, 11 Oct 2026, `history-options.md`): H4 catch-up is the entry; H5 a tap opens option C's flyout; H6 three days at most; H7 the X leaves the catch-up; H7a phone uses a filter pick, nothing typed; H7b (the last five) is superseded by H15; H8 desktop follows D; H9 no "ask it" search; H10 no Assistants tab: "Assistance and other people are the same. Like assistant just represents the person."

## What this option is

Job: "I have been away. What happened in our kitchen, who did it, and does it affect me?"

- **Entry (H4, H6, H8):** the "Since you were last here" catch-up, grouped by day, then person. **At most three calendar days that each had a change** (owner, voice, 12 Oct 2026: "calendar days, so long as there was a change"): quiet days are skipped when counting, and the feed looks back until it has three active days, even if the last visit was longer ago. Not a rolling 72 hours, not simply the last three calendar days. When the cap cut the window the feed ends with "Showing the last 3 days with activity. Search for older." and a Pick a filter button (Proposal wording from H6).
- **Tabs (H10, H13):** My activity, and a second tab named for the other person when the household is exactly two people (for example "Sam"), or "Others" when there are more. An assistant's action is shown as the person it acted for, with no extra mark. The shopper link is counted with the others (Proposal).
- **Tick and X (H11):** beside each other on the catch-up. The **tick** marks it caught up (the next visit starts fresh from that point) and shows "You're caught up". The **X** only leaves the catch-up (it does not mark it caught up) and opens the filter search: on phone the filter sheet over the recent list, on desktop the filter panel already beside it.
- **Person link (H12):** the avatar and name on each person's group, and the names in the card summary, open that person's changes in the window with "Back to the full catch-up". "Show only these / Show all changes" stays. Placement is a Proposal.
- **Recent (H15):** after leaving the catch-up the list is recent history, one calendar day with activity at a time, no ceiling. Scrolling loads the next day (quiet days skipped); there is no Show more button. The three-day cap is only the initial catch-up.
- **Phone (H7a):** after the X, a Filters icon and "Pick a filter" open a bottom sheet drawn like Pantry's Filters sheet (`.sheet.tall`, `.strow`, `.mc` classes): first a list of filter groups (When, Who, Area, Where, App, Touches me), then the options of the one picked. Nothing is typed.
- **Desktop (H8):** same catch-up in the column and lane (rail, column, lane kept). The structured filters sit in the lane as a filter panel (Pantry's `.fp` panel classes; Proposal). After the X the column shows recent history (a day at a time, scroll or the `M` key) and the panel stays open beside it.
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
- **D2. Three tabs.** **Superseded by H10 and H13:** two tabs, My activity and the other person's name ("Others" when more than one other person). Default the second tab; keys 1 and 2. Each tab shows a count of changes not seen.
- **D3. The window rule.** **Superseded by H6:** the window is since the last visit, at most the three most recent calendar days that each had a change (quiet days skipped; not a rolling 72 hours). "Show more days" is gone, and H15 now limits the three days to the catch-up only; older is a filter (When: 7 or 30 days).
- **D4. Day, then person.** Inside a day, one card per person (initial, name, count). "By time" is a switch for one flat list. My activity is always flat. **Revised:** assistants are not separate cards (H10).
- **D5. "Since you were last here" is cleared by the tick.** **Revised (H11):** the tick, or key T, marks it caught up and the next visit starts fresh from that point. The X, or key C, only leaves it and does not mark it caught up (the earlier Proposal, "a dismissed catch-up counts as caught up", is answered NO).
- **D6. Privacy: shared by default, personal stays personal.** Unchanged.
- **D7. Others' personal entries are counted, never shown** ("2 private, hidden"), admins included. Unchanged.
- **D8. Admin-only entries** show to admins only. **Revised:** "linking an assistant" is no longer a drawn example; the sample uses a role change.
- **D9. Proposals for another person** show to the person and the proposer, and appear as "Waiting for you". Unchanged.
- **D10. Assistants, voice and the shopper link are labelled.** **Superseded by H10 for assistants and voice** (no chip, no mark). Only the shopper link keeps "No sign-in" because it is a visitor, not a member.
- **D11. Assistants tab.** **Superseded by H10.** Removed, with its card and filter.
- **D12. Affects me.** Unchanged: a chip, the catch-up card (up to 4, then "and n more") and a filter. Computed on the server when the event is written.
- **D13. Search is a typeahead of tokens.** **Superseded by H9.** Removed.
- **D14. One filters set.** **Revised:** When (Any time, Today, 7 days, 30 days), Who (me, each other member, shopper link), Area, Where, App, Touches me. Same type combines with OR, different types with AND. Counts shown; zero is dashed (as Pantry Filters). Phone: bottom sheet in two steps (pick a group, then options). Desktop: panel in the lane.
- **D15. Desktop layout.** Rail, 640px column, 400px lane (360px below 1240px). The lane shows the catch-up card (with its X) or the filter panel (F). Detail is no longer drawn here (H5), so the lane never holds a detail.
- **D16. Phone layout.** One column; catch-up card on top; X on the card; after the X a Filters icon in the header and a Pick a filter button under the list. No key hints on touch.
- **D17. Only changes are history.** Unchanged.
- **D18. Undo.** **Superseded here:** undo lives in option C's flyout (H5).
- **D19. Keys.** `F` filters, `1 2` tabs, `J K` move between entries (Enter opens), `G` group (catch-up), `C` leave the catch-up (not marked caught up), `T` mark it caught up, `M` load one more day (recent), Ctrl/Cmd+Esc closes the open panel, Shift+? lists them (`shortcut-cues.md`). Removed: `/` search, `3`, `Z` undo, plain Esc clears search. `,` is left alone (item History in the Pantry).
- **D20. Empty and zero states are playful and honest.** New household: "A quiet kitchen so far". Nothing from me: "Nothing from you recently". Nothing since the last visit: "Nothing since you were last here" with See what is recent. After the tick: "You're caught up". Loading: skeleton rows, this tab only. No results: names the filters, "Look back 30 days" and "Clear filters".
- **D21. Superseded by H15.** (Was: the last five, five in total, Show more adds five.) Replaced by D26.
- **D22. Catch-up shows everything in the window.** The catch-up feed is the three days with activity since the last visit, nothing more counted or trimmed.
- **D23. (H11) Tick and X.** Tick (accent colour, check icon) and X sit in the catch-up header, both 44 px targets with their own labels ("Mark as caught up", "Leave the catch-up and pick a filter. Does not mark it caught up"). Tick: `S.seen` becomes now. X: `S.seen` is untouched. Same on desktop (Proposal).
- **D24. (H12) Person link.** Avatar and name on each person group in the catch-up, and names in the summary line, are buttons. The scoped view keeps the window, shows a bar ("Only changes by Sam in this catch-up", with "Back to the full catch-up"), and on phone shrinks the card to its header. Proposal on placement; not on rows (they open option C).
- **D25. (H13) Second tab.** Named for the other person (two-person household) or "Others". Shows what they did, plus the shopper link (Proposal), never their private entries. The Who filter lists each other person by name.
- **D26. (H14, H15) Recent, a day at a time.** After the X the list is grouped by calendar day with activity, newest day first, one day loaded at a time by an end-of-list sentinel ("Loading one more day with activity"), quiet days skipped, no ceiling, end line "That is everything on record". Filtered results load the same way. Desktop: same scroll plus `M`. The sample has about 40 active days beyond the typed ones, generated in `option-d.js` (`DEEP`).
- **D27. Wording.** No counted number in UI text: "Recent" replaces "newest first", "the last five" and "Five at a time".

## Open questions (what a wrong guess costs)

- **O1. (Closed by H15.)** The five-in-total question is gone with the number.
- **O2. "There's only two things in the mobile."** The owner did not finish. Not guessed: the mockup does not assume two filter groups or two views (the sheet lists six groups).
- **O3. Does a mark show an entry was done through an assistant (voice, chat) (H10)?** None is drawn and none is invented. Wrong guess either way: one chip.
- **O4. Is a plain keyword box that matches only item, recipe and member names still wanted (H9 open)?** Not drawn.
- **O5. Is the three-day cap calendar days or 72 hours?** Settled by the owner (12 Oct 2026): calendar days with a change; quiet days are skipped. Drawn.
- **O6. (Closed by H15.)** The catch-up shows the three days with activity; recent history after the X has no ceiling.
- **O7. Desktop uses a filter panel rather than the phone's sheet, and recent history (H15) applies after leaving the catch-up (H8 Proposals to confirm).**
- **O8. Does the X count as caught up?** Answered NO (H11): the tick does. **Open:** where the person link sits (H12), whether desktop mirrors the tick, whether the phone X should open the sheet over the list (drawn: yes), and no way back to the catch-up after the X.
- **O9. Where do entries with no item, recipe or day (preferences, household, shopping lists) open in option C?** Drawn: Everything.
- **O10. Are votes and stars personal (D6), may admins see personal entries (D7), is "last seen" per person on the server or per device, how long is history kept?** As before: shared questions in `history-options.md`.

**Mockup note (cap, H6):** the sample (Sun 11 Oct) now demonstrates the rule: Today (Sun 11) and Yesterday (Sat 10) are active, Fri 9 Oct has no entries and is skipped, Thu 8 Oct is the third active day, and the entries on Wed 7 Oct and earlier do not show. The code counts active days (`capD()` in `option-d.js`), not calendar offsets.

## What the default path loads, and what waits (`DESIGN.md` section 6)

- **Loads on open:** the page, `option-d.css` (about 15 KB) and `option-d.js` (about 40 KB, includes the sample data that the build replaces with a call), `theme.css`, `shared.css`, `cues.css`. One call: the **active tab only**, for the catch-up: the 3 days with activity at most, since the last visit, grouped on the server, with the catch-up line fields (`affects` for me) included. The other two tabs show only a count (a small count call, or one number in the same response).
- **Deferred until asked:** the other tab; recent history (nothing is fetched until the X or "See what is recent"; then one calendar day with activity per call, the next day only when the end of the list scrolls into view, no ceiling); a person's view (filtered from the catch-up already loaded); filter counts (fetched on opening Filters); the entry itself (option C's flyout loads on tap, never preloaded); the shortcuts list (built on first Shift+?); other themes (theme.js).
- **Never loaded:** other people's personal entries (counted by the server, not sent), admin-only entries for members.
- **Nothing refreshes by itself.** A "new since you opened" pill is a Proposal for later; the mockup does not poll.
