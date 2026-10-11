# History, Option D: people and catch-up feed

Status: **mockup for the owner to review (11 Oct 2026). Options, not decisions.** One of four parallel directions for a searchable History, drawn in one pass so the owner can lock decisions together. Nothing is built into Kitchie or Recipe. Numbers D1 to D20 are Proposals (the owner has decided none of them). Q-D1 and up are open questions.

Mockup: `history/option-d/index.html` (responsive: phone under 1024px, rail + column + lane from 1024px). `mobile.html` and `desktop.html` frame the same page at 390 and 1440 wide. Code: `option-d.css`, `option-d.js`. Screenshots: `docs/screenshots/history-option-d-*.png`.

Open it with: `?as=arjan|sam` (admin or member), `&tab=mine|house|ai`, `&q=saffron`, `&who=sam&area=Pantry&place=Fridge`, `&range=since|today|week|month`, `&filters=1`, `&sel=e5` (open entry), `&state=caught|empty`, `&group=time`. A small Preview button bottom right switches person and state (mockup only, not part of the app).

## The owner's words (voice, 11 Oct 2026)

History should be searchable on mobile and on desktop, with separate layouts designed together in one pass so he can lock decisions in one go. It covers both Kitchie (inventory, shopping, plan, cooking, preferences) and Recipe (create, edit, versions, cook, star and vote). Think broadly about what people look for: things they did themselves, things other household members did (and the AI assistants, voice and MCP), specific items or recipes, time ranges, action types, places. Propose options, not decisions.

Standing owner rules this respects: jobs first (`DESIGN.md` 1), playful empty states (3), one visual family (4), speed and "fetch only when asked" (6, `desktop.md` section 1), close with Ctrl/Cmd+Esc and plain Esc only clears search, Shift+? global (`shortcut-cues.md`), subject control and admin gating (`preferences-principles.md` P1, P2, P3), AI assistants labelled (`settings-window.md` SW-10).

## What this option is

Job: "I have been away. What happened in our kitchen, who did it, and does it affect me?" Search is the secondary tool, for "where did that go" and "who changed that".

- A **catch-up card**: "Since you were last here", with the changes that **affect me** first, each with one button (Open list, Review, Look).
- Three **tabs**: My activity, Household, Assistants.
- The feed is **grouped by day, then by person** (a "By time" switch flattens it). Assistants are their own "person", always labelled.
- **Search and filters** sit under the feed's header: a typeahead that turns a word into a person, area, place or plain text token; one Filters panel with the same tokens.
- Tapping an entry opens a **detail**: what changed (from, to), their own words, how, where, who sees it, Undo.

## Field catalogue (what each field is for)

One event record. A field earns its place by a search, a filter, a label or an undo; otherwise it is left out.

| Field | Example | Used for |
|---|---|---|
| `id` | e5 | Open one entry (deep link `?sel=`), undo target |
| `at` (day, time) | Sat 10 Oct, 7:44 pm | Day grouping, time-range filter, "new since last visit" |
| `actor` | Sam, Claude for Sam, Shopper link | The "person" group, Who filter, attribution |
| `actor_kind` | person, assistant, visitor | Labels (Assistant chip), Assistants tab, privacy rules |
| `on_behalf_of` | sam | Names whose link an assistant used ("Claude, for Sam") |
| `via` | app, voice, claude, shopper-link | How it was done: Voice and No sign-in chips, By voice filter |
| `app` | kitchie, recipe | App filter; one feed for both |
| `area` | Pantry, Shopping, Plan, Cooking, Preferences, Versions, Stars and votes, Household | Area filter and icon |
| `verb` | used up, moved, planned, cooked, edited, saved a try, voted | Action type; kept as a closed list so it can be filtered and translated |
| `subject` (type, id, name) | item butter, recipe Egg fried rice | The bold word in the sentence; "All history of this" |
| `place` | Fridge, Crisper | Where filter (location or spot) |
| `change` (field, from, to) | Use-by: 10 Oct to 14 Oct | The from and to line in the detail |
| `words` | "that worked well, save it" | The person's own words to an assistant or voice (see the Recipe rule: user_intent) |
| `scope` | household, admin, personal | Privacy (D6 to D9); the lock chip |
| `owner` / `to` | sam; arjan | Whose personal record it is; who a proposal is for |
| `affects` (people, one line each) | arjan: "Milk ran out" | The catch-up card and the Affects you chip |
| `needs_review` | true | To review chip, Review button (an assistant's try on a kept recipe) |
| `undoable` | true | Undo button; an undo is a new entry |
| `group_id` / `kids` | cook session, 5 items | One cook is one row that lists its items |

Not stored on purpose: reads and questions ("what can I cook?"). Only changes are history (D17).

## Proposals

- **D1. Feed first, search second.** The default view is the feed with the catch-up card above it. Search is one field and one Filters panel, the same tokens in both. Why: the owner's list is mostly "who did what", which a feed answers without typing.
- **D2. Three tabs, Household first.** My activity, Household, Assistants. Default Household; the last tab used is remembered on this device. 1, 2, 3 switch tabs. Each tab shows a count of changes you have not seen.
- **D3. The window rule is the existing one.** Default shows the last 3 days that have entries (quiet days skipped), then 5 more days per "Show 5 more days" (`desktop.md` section 5). Search or a wider range asks the server for its own window.
- **D4. Day, then person.** Inside a day, one card per person (initial, name, count). Assistants are separate cards ("Claude, Sam's link"), never folded into the person. "By time" is a switch for one flat list. My activity is always flat.
- **D5. "Since you were last here" is explicit.** Last visit is stored when you press Mark as caught up (key C), not on opening, so a glance on the way to something else loses nothing. New rows carry a dot and the day header counts them.
- **D6. Privacy: shared by default, personal stays personal.** Household entries (stock, shopping, plan, cooking, recipes, household settings) are visible to every member. Entries about one person's own preferences, stars and votes are **personal**: only that person sees them (P1).
- **D7. Others' personal entries are counted, never shown.** A card says "2 private, hidden" so nothing looks missing, with no content. Admins are included: being admin does not open another person's personal records.
- **D8. Admin-only entries.** Members joining, leaving, links to AI assistants, role changes show to admins only (P2). A member sees one line saying admin items are not shown to them. The same line is in the right lane.
- **D9. Proposals for another person** (Option C of the preferences work) show to the person and to the proposer, marked "For you", and appear in the catch-up card as "Waiting for you".
- **D10. Assistants, voice and the shopper link are labelled.** Assistant chip with the spark icon; Voice chip with the mic; "No sign-in" for the one-off shopper link. "Claude, for you" when it used your link. The detail shows the words that were said ("that worked well, save it").
- **D11. Assistants tab.** Every assistant change on household data, with whose link it used, plus a card listing the linked assistants. A person's assistant changes on **personal** data show only to that person. Links are managed in Settings, not here.
- **D12. Affects me.** An entry affects you when it touches something that is yours (your list line, your plan day, your recipe, a household default over your own, a proposal for you). It is marked with a chip, listed in the catch-up card (up to 4, then "and n more") and filterable. Rules for "affects" are computed on the server when the event is written (field `affects`), never guessed in the browser.
- **D13. Search is a typeahead of tokens.** Typing "sa" offers Sam (Person), Spice rack (Place), Stars and votes (Area) and "sa" (Text). A pick becomes a removable token; Enter searches the words. Matches subject, place, person, via, their words and a cook's items.
- **D14. One Filters panel.** When (Recent, Since last visit, Today, 7 days, 30 days), Who, Area, App, Where, Touches me. Pills with counts; zero is dim and dashed (as Pantry Filters). On desktop it is the right lane, on phone a bottom sheet.
- **D15. Desktop layout.** Rail, a 640px column, a 400px lane (`desktop-layout.md`). The lane shows the catch-up card by default, an entry's detail when one is picked, or Filters (F). One parent flyout at a time. Below 1240px the lane is 360px.
- **D16. Phone layout.** One column; the catch-up card on top (shortened to 3 lines each), search behind the magnifier, Filters and Detail as bottom sheets with the grab bar and the x. No key hints are drawn on touch.
- **D17. Only changes are history.** Reads, questions and searches by an assistant are not logged here.
- **D18. Undo.** Anyone in the household may undo a household change; the original person is told. Personal entries only by their owner. An undo is a new entry, never a rewrite (the Recipe rule).
- **D19. Keys.** `/` search, `F` Filters, `1 2 3` tabs, `J K` move and open, `G` group, `C` caught up, `Z` undo the open entry, Ctrl/Cmd+Esc closes the panel, plain Esc clears the search, Shift+? lists them. `,` is left alone because it means item History in the Pantry. Cues use the `kbd` class.
- **D20. Empty and zero states are playful and honest.** New household: "A quiet kitchen so far". Nothing for me: "Nothing from you yet this week". All caught up: "You are all caught up. Enjoy the quiet." No results: names what was searched ("Searched: Household, the last 3 days with entries, 1 filters. Private changes are never searched.") with "Search 30 days" and "Clear filters".

## Open questions (what a wrong guess costs)

- **Q-D1. Are votes and stars personal (private) or household-visible?** Drawn as personal (D6). Wrong guess: a data-scope change on one record type and one copy line; no migration if the scope is a stored field.
- **Q-D2. May an admin see another member's personal entries?** Drawn: no, even admins (D7). Wrong guess either way is a trust issue, not a code one: if the owner wants it, one filter in the server query changes; if we show it and he did not want it, it cannot be taken back from people who saw it. Safer default is no.
- **Q-D3. Is the catch-up card per person per device, or per person everywhere?** Drawn: stored on the server per person (D5). Wrong guess: a phone and a laptop disagree about what is new; cheap to move to the browser, costs one write per "caught up".
- **Q-D4. How long is history kept, and does "30 days" suffice?** Drawn: 30 days searchable by default, older by a later call. Wrong guess: the retention and storage design of the journal; this is the question most worth answering before building.
- **Q-D5. Should a member who did a change be told when someone undoes it?** Drawn: yes, one line in their catch-up (D18). Wrong guess: noise, or a quiet fight over an undo.
- **Q-D6. Should assistant reads be visible somewhere for transparency?** Drawn: no (D17). Wrong guess: a log that grows without telling anyone anything.
- **Q-D7. Does Mark as caught up also clear the dots and the tab counts?** Drawn: yes, all together.
- **Q-D8. Should History leave the Settings window and become a screen on the rail?** Drawn as a rail screen with the Settings row linking to it (the other options may differ). Wrong guess: moving a screen once.

## What the default path loads, and what waits (`DESIGN.md` section 6)

- **Loads on open:** the page, `option-d.css` (about 15 KB) and `option-d.js` (about 40 KB, includes the sample data that the build replaces with a call), `theme.css`, `shared.css`, `cues.css`. One call: the **active tab only**, for the last 3 days that have entries, grouped on the server, with the catch-up line fields (`affects` for me) included. The other two tabs show only a count (a small count call, or one number in the same response).
- **Deferred until asked:** the other two tabs; older days (5 per press); anything wider than Recent (a server window); text search beyond the loaded window; the typeahead's lists of people, places and areas (fetched on first focus of the search box); Filter panel counts (fetched on opening Filters); the detail of an entry (one call per tap, never preloaded); the shortcuts list (built on first Shift+?); other themes (theme.js).
- **Never loaded:** other people's personal entries (counted by the server, not sent), admin-only entries for members, assistant reads.
- **Nothing refreshes by itself.** A "new since you opened" pill is a Proposal for later; the mockup does not poll.
