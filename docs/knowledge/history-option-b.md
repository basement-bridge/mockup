# History, Option B: faceted filters (mockup, 11 October 2026)

Mockup only, in `history/option-b/` (`index.html`, `hist.css`, `hist.js`; static, sample data, nothing saved or sent). Nothing is built in Kitchie or Recipe. One of four parallel options for a searchable History; this is the "structured filter panel with explicit fields" one. Every line marked **Proposal** is a choice the owner did not make. Screenshots: `docs/screenshots/history-option-b-*.png`.

Open it: `history/option-b/index.html` (it is one page, two layouts by width: under 1024 phone and tablet, 1024 and up desktop). States by link: `?demo=loading`, `?demo=empty`, `?demo=error`, `?who=guest&area=Recipes` (zero results), `?view=sam-week`, `?view=review&sel=10` (detail), `?sheet=1` (filters open).

## Owner's words (voice, 11 October 2026, closely paraphrased from the brief)

- History should be searchable, on mobile and on desktop.
- Mobile and desktop are separate layouts, designed together in one pass so the owner can lock the decisions in one go.
- It covers both Kitchie (inventory, shopping, plan, cooking, preferences) and Recipe (create, edit, versions, cook, star and vote).
- Think broadly about what people look for: things they did themselves, things other household members did (and the AI assistants, voice and MCP), a specific item or recipe, a time range, an action type, a place.
- Propose options, not decisions.

## The job

"I know something happened and I want to find it." Four sub-jobs, which decide what leads:

1. **What did Sam change?** (a person, a week). Who and When lead.
2. **What happened to the butter?** (an item or recipe). Item or recipe leads, everything else off.
3. **Did the assistant do that, or did I?** Who and Source lead.
4. **Go back.** Find it, then undo it. The detail pane's Undo.

Option B answers all four with one structure: explicit fields, a live count, saved views for the repeat questions. Its cost is that it is a form: more to look at than one search box. The playful part is kept to the empty, zero and error states, the assistant marks and the "Find more like this" chips.

## Field catalogue (Proposal B2)

Nine fields. Each is optional and they combine with AND; inside a field, picks combine with OR (Sam OR You).

| # | Field | Values | What it is for | Where it comes from |
|---|---|---|---|---|
| 1 | **Words** (the search box, always on screen) | free text | "I remember a word." Matches item and recipe names, people, place, spot, the old and new value, and what was said out loud. Highlights the match. | Search over the same event text |
| 2 | **Who** | Anyone, You, Sam (each member), Guests, Assistants, Automatic | Whose decision it was. **Assistants** means the assistant decided it itself and no person had agreed (Kitchie's `by: model_inference`). **Guests** is someone using a one-off shopper link (no sign-in). **Automatic** is the app itself (a level worked out from a cook). | `by` on the event, plus member id |
| 3 | **Area** | Pantry, Shopping, Plan, Cooking, Recipes, Preferences | Which part of the product. Kitchie and Recipe are one product to the person, so one list. | Event type |
| 4 | **Action** | Added, Used, Moved, Changed, Removed, Checked, Bought, Planned, Cooked, Created, Edited, Rated, Undone, Suggested | What kind of thing happened. One short shared vocabulary so "Moved" means the same in Pantry and Plan. The list shown follows Area (Pantry has 7, Cooking 2). | Event type, normalised |
| 5 | **Item or recipe** | typeahead, several allowed | One thing's story. A recipe name also finds every version and revision (the family). | Item id, recipe family id |
| 6 | **Place and spot** | Anywhere, a place, a place and spot | "What went into the freezer?" Pantry changes only; disabled, with a line saying why, when Area excludes Pantry. | Item location and spot at the time |
| 7 | **When** | Any time, Today, Yesterday, This week, Last week, Last 30 days, Custom range | Time. Weeks start Monday. | Event time |
| 8 | **Source** | App, Voice, Assistant (MCP), Shopper link, Automatic | The channel it came through. Different from Who: when Sam asks Claude to add paneer it is Who: Sam, Source: Assistant. | Where the call came in |
| 9 | **State** | Any, Undone, Waiting for review | Two special cases: things since undone, and assistant ideas nobody has accepted yet (Recipe's "To review"). | Event state |

Result controls (not fields): **sort** (Newest, Oldest, Item or recipe A to Z, Person then newest), **result count**, **saved views**, **active-filter chips**, **Clear all**.

## What is drawn

**Desktop (1024 and up)**: a rail, then (1240 and up) the filter panel docked, the results table, and the detail panel; all anchored left with free space to the right, per `desktop-layout.md`. The table has Time, Who, What (with place and source underneath) and an Area icon; from 1700 wide Where and Source get their own columns. Rows group under day headings when sorted by time. Selecting a row (click, or J and K) fills the detail panel: who and through what, when, where, what changed as before/after rows, what was said, "Undo this", "Open the item", and **Find more like this** (same item, person, day, source: it replaces the filters with that one, so it is a one-tap pivot). Between 1024 and 1239 the filter panel is a left flyout over the table (opened with F, like the Pantry's Filters); the detail panel stays.

**Phone and tablet (under 1024)**: search on top; a Filters button with a count of filter fields in use, and sort; a strip of saved views; active chips; cards grouped by day. Tapping a card opens its detail as a bottom sheet. The Filters button opens a bottom sheet with the same nine fields as collapsible rows (each row says its current value on the right, so a closed field still reads), and a sticky footer: Save view and **Show 23 changes** (the live count is the button). Tablet is the same column, wider.

**One markup, three presentations** for the filter form (sheet, flyout, docked) and for the detail (sheet, panel): the build renders one markup and CSS decides. The results are cards on phone and a real table on desktop; the mockup draws whichever fits and redraws on resize, the build should render one per width bucket (`DESIGN.md` section 7, item 5).

**States**: loading (six skeleton rows; the filters stay usable), nothing yet (a quiet kitchen, with a way to add something), zero results (names the filters that block it and offers "Drop Who: Guests +8" buttons showing how many each would bring back, plus Clear all), error (filters kept, "Try again"), busy (rows dim for a moment while a search runs), and "Reset" and "Save view" are disabled when no filter is on.

## Proposals

Numbered, all **Proposal** unless the owner has said otherwise.

- **B1. One History screen, in the rail**, replacing the Profile window's History pane (today: All, Mine, Sam chips over a day list). Mockup draws the screen; the Profile pane would become a link to it, or keep a short "recent" list. Reached by the rail and by G then Y (the key the Profile pane already uses).
- **B2. The nine fields above**, in that order of weight: Who, Area and When open by default, the rest closed but showing their value.
- **B3. Who is the decision, Source is the channel.** Two fields, because the owner named both "other members" and "assistants / voice / MCP" and they are different questions. "Assistants" in Who is narrow (the assistant's own conclusions); "Through Assistant" in Source is wide (anything arriving over MCP, including things a person asked for).
- **B4. A short shared action vocabulary** (14 verbs) shown as chips and narrowed by Area. The event keeps its exact words ("used up the Milk"); the verb is only for filtering.
- **B5. Default state: no filters, newest first, any time**, 20 rows then "Show 20 more". Not "this week": a default that hides things causes false "it never happened".
- **B6. Combination rule**: AND between fields, OR inside a field. Shown as chips so it is visible; no AND/OR switch.
- **B7. Search box is separate from the fields** and always on screen. It narrows with the fields (it is just the Words field), so "milk" plus "Who: Sam" works. Plain Esc clears it.
- **B8. Saved views**: a strip of chips; the one equal to the current filters is pressed; "Save this view" appears only when the current filters match none. Each view is Mine or Shared with the household (a person icon marks shared). Starter views drawn: What Sam changed this week (shared), What I cooked, Assistant ideas to review, Recipe edits, Said out loud. Tapping a pressed view clears it. Not stored in the mockup.
- **B9. Result count is live**, "38 changes", on the page and on the phone sheet's button. The count is exact for the first page's sake; see open question B-Q4 for large households.
- **B10. Sort** has four orders. Day headings only for the two time orders.
- **B11. Zero results explain themselves**: the three filters whose removal brings back the most rows, each with its count.
- **B12. Find more like this** (detail pane): same item or recipe, same person, same day, same source. Replaces the filters (it is a pivot, not an addition).
- **B13. Undo from History** is the existing rule (a new event, never a rewind; the undo is itself in History). Shown only where an undo exists. An assistant idea waiting for review shows "Review it" instead of Undo.
- **B14. Assistants are marked the same way as in Recipe versions** (`.st.ai` look: dashed pill, "assistant's own idea" or "via assistant"), the avatar gets a dashed border. Automatic changes get a gear avatar. Guests a dotted one.
- **B15. Guests (shopper link) are a Who value**, because those changes have no member behind them and "who bought the paneer?" is a real question.
- **B16. Place and spot only for Pantry changes**, and disabled with an explanation otherwise, so a person is not left wondering why it matches nothing.
- **B17. Voice rows keep the words said** (shown in the detail, quoted). Open question B-Q7 on how long.
- **B18. Share and export, cheap only**: "Copy link" (the filters are in the address, so a view is a link; the other member must be signed in) and, on desktop, "Download CSV" of the current results, matching My data's CSV. Nothing else (no PDF, no email).
- **B19. Preferences changes are listed** (Yours and Household, as a scope tag), including assistant suggestions waiting for a person. Whether other members' personal preference changes show at all is open (B-Q5).
- **B20. Keyboard**, per `shortcut-cues.md` (the global Shift+? list and H are not redrawn here; this screen registers its own keys for that list): `/` search, `F` filters (opens the sheet or flyout; on a docked panel it focuses it), `J` `K` or arrows move through the results (the detail follows on desktop), `Enter` opens the detail, `Z` undo, `V` saved views, `O` sort, `X` clear all filters, Ctrl Esc or Cmd Esc closes the top layer (save dialog, then sheet or flyout, then detail), plain Esc only clears the search box. Nothing fires while typing in a box. Chips are hidden on phone and tablet, and by the "Show shortcut cues" switch.
- **B21. Phone is tap-first**: no key chips; 44px targets; the filter sheet is closed by its x, the scrim, or "Show N changes".
- **B22. Accessibility**: every chip is a toggle button with `aria-pressed`; the filter fields are `details` rows; the count is a live region; the table is a real table; the zero state is a status; colour never carries meaning alone (assistants are dashed, undone is struck through and says Undone).

## Open questions (and what a wrong guess costs)

- **B-Q1. Is "Assistants" in Who (B3) worth keeping beside Source?** Drawn: yes, because Kitchie marks an assistant's own conclusions differently from things a person said (`by`). A wrong guess costs a chip and some explanation text, no data; if dropped, "Assistant ideas to review" still works through State.
- **B-Q2. Does the event record the channel (app, voice, assistant, link) today?** Not checked in code (I only saw the MCP tool names `item_history`, `list_revisions`, `undo_event`, `list_reviews` and Kitchie's `by` rule). If Source is not recorded, the field cannot be filled for history before the day it starts. Cost of guessing wrong: a Source field that is empty for old rows (draw them as "Unknown") or a new column and a backfill. Ask before any build.
- **B-Q3. Is there one household-wide feed to query?** Today's History is per item (`store.getHistory(id)`) and the Profile pane is sample data. A cross-product feed (Kitchie plus Recipe) needs an owner (platform?). Cost: this whole option is a new service if wrong; the screen is the cheap part.
- **B-Q4. Exact count, or "about"?** Drawn: exact. For a very large history an exact count on every filter change is the slow part (see load notes). Wrong guess costs one line of wording ("200+ changes") and one query.
- **B-Q5. Do members see each other's personal Preferences changes?** Drawn: yes, Household and Yours are tagged and Sam's are visible. If preferences are private, the Who field must hide them and the count must not leak them. Cost of a wrong guess: a privacy leak, so decide before build.
- **B-Q6. Default filter.** Drawn: none (B5). The alternative is "This week" with a visible chip. Cost: how often a person thinks something did not happen.
- **B-Q7. How long are the words said by voice kept?** Drawn: shown in the detail, with a note that says the retention is open. Cost: a privacy and storage rule; the mockup invents no period.
- **B-Q8. Saved views: yours or the household's, and who can edit a shared one?** Drawn: either, any member edits (nothing drawn for editing). Cost: small, but a shared view that anyone can change can surprise people.
- **B-Q9. Does the Profile window's History pane go away (B1)?** Cost: two History places if not; the pane's data is the same.
- **B-Q10. Does a person need a "my own" shortcut ("Mine")?** Drawn: Who: You. Wrong guess costs one chip.

## What the default path loads and what is deferred (`DESIGN.md` section 6)

**Default path (page load)**: the page, `theme.css`, `hist.css` (about 20 KB) and `hist.js` (about 45 KB here, about a third of it sample data; the build's script is smaller), and from the server: the first 20 rows (summary fields only: time, who, channel, area, verb, the one-line text, place) and one count for the current filters. The nine field option lists are small and known (areas, verbs, sources, the member list, locations); saved-view names and filters are a few lines. Icons are inline.

**Deferred until the person engages**:
- **Item and recipe suggestions**: fetched on first focus of the field, then per keystroke (debounced, from 2 characters), server side. Never the full item and recipe list up front.
- **One change's detail** (the before and after rows, what was said, the version): fetched when it is selected, one call for that event. J and K held down debounce it. Nothing is prefetched.
- **"Show 20 more"**: the next page, on press. No infinite scroll.
- **CSV**: generated when pressed.
- **Facet counts** ("Pantry 14") are not drawn; they would need a grouped count per field on every change. If the owner wants them, they load only when a field is opened.
- The filter form for the other width bucket, and the table or card markup of the other bucket, are not rendered (server picks one per `DESIGN.md` section 7).
- Voice words and assistant notes come with the detail, not the list.
- Nothing refreshes by itself; a "New changes, tap to refresh" line is the only live idea and is not drawn.

**Why this is reasonable at this stage**: the list is cheap (a page of short rows); the one expensive thing is the count over a large range. Counting is deferred only in the sense that it runs after the rows are returned, so the rows paint first.

## What this option is not good at (so the owner can judge)

It needs a person to know the field names. A person who only remembers "that thing Sam said to the speaker on Tuesday" has to use Words plus Source plus When; a free-text or natural-language option would do that in one box. The saved views and "Find more like this" are Option B's answer, and are cheap.
