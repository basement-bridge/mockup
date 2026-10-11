# History: four options, one decision sheet

Owner (voice, 11 Oct 2026): History should be searchable on mobile and desktop, in separate layouts, designed together in one pass so decisions lock in one go; it covers Kitchie and Recipe ("our history is for both"); think about what people look for (what they did, what others did) and propose a number of options in the mockup repo. Nothing is built in the real apps.

Landing page: `history/index.html`. Each option has its own spec with a field catalogue, numbered proposals and open questions.

| Option | Idea | Spec | Mockup |
|---|---|---|---|
| A | Search first: one box, phrases become chips, grouped timeline | `history-option-a.md` (Q-A1 on) | `history/option-a/` |
| B | Faceted filters: nine explicit fields, counts, saved views | `history-option-b.md` (B1 to B22, B-Q1 to B-Q10) | `history/option-b/` |
| C | In context: history on each item, recipe, spot, member, plan day; scope widens | `history-option-c.md` (C1 to C14, C-O1 to C-O9) | `history/option-c/` |
| D | People and catch-up feed: since you were last here, day and person | `history-option-d.md` (D1 to D20) | `history/option-d/` |

The options are not exclusive. A and B are two ways into one results list; C is where the entry points live; D is a different job (catch up) that could sit beside any of them.

## Owner direction (voice, 11 Oct 2026): Recipe history is pulled by Kitchie
Kitchie, the main app, pulls Recipe's history when it needs to. That is not built now: "just plan for it". So every option keeps the door open: one event shape (who, area, action, subject, when, source) that Recipe can supply and Kitchie can merge into its own list, and Recipe rows that can be absent without the screen breaking. **Proposal:** screens show Recipe events in the same list when present and show nothing special when absent.

## What is locked (owner, voice, 11 Oct 2026)
**Locked:**
- History stays in context on pantry, recipes and shopping; pantry as it is, shopping new (H2, H5).
- Entry on phone and desktop is the "Since you were last here" catch-up, grouped by day and person, three calendar days with a change at most (H4, H6, H8).
- Default shows the last five activities in total across pantry, recipes and shopping, with Show more (H7b; desktop the same).
- The X on the catch-up leaves it; on phone, search is a filter sheet like the existing one, on desktop a filter panel (H7, H7a, H8).
- No "ask it" or typed natural-language search anywhere (H9). No Assistants tab; an assistant shows as the person it acted for (H10).
- Faceted filters as a standalone page (B), search-first (A) and the standalone feed-plus-search page are not used (H1, H4).

**Still open:** the "two things" on phone; a plain name keyword box; a mark for "done through an assistant"; whether Kitchie records bought, removed and shopper-link events today; the eight shared questions below.

Mockups revised to match: `history/option-d/` (entry, phone and desktop) and `history/option-c/` (in-context flyouts incl. shopping). Options A and B carry a "superseded" banner.

## Decisions (owner, voice, 11 Oct 2026)
- **H1. Option B (faceted filters) is out.** "Too complicated"; "faceted filters is definitely not."
- **H2. History stays in context and covers pantry, recipes and shopping.** Pantry already has it (the item flyout's History); recipes already have a versions/history screen and a To review screen with per-change undo. The owner: "we're only going to do history for pantry and recipes... and also one for shopping." Keep pantry as it is. Shopping is new and follows the same pattern. Each is its own concern, not a unified cross-service list.
- **H3. (Narrowed by H9.) If a search box is used, it reads typed text by fixed rules only, no assistant.** Known time phrases, item and member names from the household's own data, and a set list of action words, matched locally. Answers open question 6 below.
- **H4. Phone entry is option D's "Since you were last here" feed (owner, voice, 11 Oct 2026: "we'll lock in since you were last here").** It is the default view on phone, grouped by day and person (D's layout), with a short recent window only. A standalone search-first page (option A) is not the phone's primary entry.
- **H5. The detail view is the same whichever way you arrive.** The owner: the detail flyout is pretty much the same between A and D. Tapping an entry opens option C's in-context flyout for that item, recipe or shopping entry (H2).
- **H6. Load only a short recent window by default** ("so that we are efficient on how much data we are pulling"). Going further back or looking for something specific is a search, a secondary action. **Cap (owner, voice, 11 Oct 2026): the feed keeps three days of data at most**, even if it has been longer since the last visit. **The three days are calendar days that had a change (owner, voice, 12 Oct 2026: "calendar days, so long as there was a change")**: not a rolling 72 hours, and not simply the last three calendar days. Quiet days with nothing in them are skipped; the feed looks back until it has three distinct calendar days that each have at least one change, then stops. The "Showing the last 3 days" line should read as three days with activity. **Mockup note:** option D still draws "today and the two days before" (see `CAP` in `history/option-d/option-d.js`); it does not yet show quiet days being skipped. The rule above is what the build follows. Within that, the window is since the last visit. Anything older is found through the search (H7). **Proposal:** show a line such as "Showing the last 3 days. Search for older." when the cap cut the window.
- **H7. An X on the catch-up feed leaves it and opens a search of the history** (owner, voice, 11 Oct 2026: "when that's showing, there's an X out to go into a search of the history"). It is the way to dig past the three-day window, not the front door. **What the search is: structured filters (H7a, H9), not typing.** **Proposal:** a dismissed catch-up counts as caught up for "last seen".
- **H7a. On phone the search is a filter pick, not typing (owner, voice, 11 Oct 2026).** The X clears the catch-up and brings in the search part of History. There you pick one of the filters "from the bottom", and it should be very much like the existing filter sheet and panel (Pantry's Filters): you come to it with a pick-a-filter step. This replaces the free-text box on phone: **no typed or "ask it" search at all on phone, filter sheet only** (owner, voice, 11 Oct 2026: "there is no ask it like you would say it part"). The typed, fixed-rules search (H3) applies only where a search box exists, which is desktop if it keeps one.
- **H7b. After the X, phone shows the last five recent entries, five in total (LOCKED, owner, typed, 12 Oct 2026: "five in total").** Voice, 11 Oct 2026: "when they exit out of it, it shows the first five recent. Last five recent." Five newest entries across pantry, recipes and shopping combined, newest first, within the three-day cap, with Show more and the filter pick under them for anything else. Applies on desktop too (H8). **Open (owner said "there's only two things in the mobile" and did not finish):** which two things are meant, for example two filter groups or two views. Not guessed here.
- **H8. Desktop entry follows option D (owner, voice, 11 Oct 2026: "I really like mockup D").** The "Since you were last here" catch-up, grouped by day and person, with the same three-day cap as phone (owner: "I do like the since you were here last up to three days part"). Search past it is by structured filters (H9), as on phone. **Proposal, to confirm:** desktop uses the filter panel pattern rather than the phone's bottom sheet, and the five-recent list after leaving the catch-up (H7b) applies here too.
- **H9. No "ask it" natural-language search anywhere, desktop included (owner, voice, 11 Oct 2026: "it's not going to be considered").** Options A's phrase-to-chips box is not used. Search is structured filters. **Open:** whether a plain keyword box that only matches item, recipe and member names is still wanted; H3's fixed rules would apply only if so.
- **H10. No separate Assistants tab (owner, voice, 11 Oct 2026).** "Assistance and other people are the same. Like assistant just represents the person." An assistant's action is shown as the person it acted for, like any household member. Option D's tabs become My activity and Household. **Open:** whether a small mark shows it was done through an assistant (voice, chat) rather than by hand; the owner did not say. Option D's mockup has been revised to two tabs.

- **Note (Proposal to confirm):** H2 said each area is its own concern, and H4 gives phone one feed across pantry, recipes and shopping. Read together: one catch-up feed on the way in, in-context history on the thing itself. If the owner wants separate feeds per area, say so.

## Questions that every option raises (decide once)
1. **Is there a household-wide event feed today?** Kitchie history is per item and Recipe has version history; a single feed across both is a new service (B, D). Cost of a wrong guess: the whole feature changes from a screen to a backend.
2. **Is the channel recorded** (app, voice, assistant, shopper link)? If not, "Source" and "what did Claude do" are empty for old rows (A, B, D).
3. **Who sees whose entries?** Personal Preferences changes, stars and "no" votes: drawn as private by A and D; wrong guess leaks private data (A, B, D).
4. **Undo:** which entries can really be undone, and by whom? Kitchie has no undo tool today; drawn as a new entry, not a deletion (A, C).
5. **How long is history kept**, and is 30 days searchable enough (D)?
6. **Phrase reading:** fixed rules versus an assistant that reads typed questions (A, C). An assistant costs money, latency and a privacy call. **Answered (H3): fixed rules, no assistant.**
7. **"Last week":** Monday to Sunday or rolling 7 days (A).
8. **"Last seen" for catch-up:** stored per person on the server or per device (D).

## Proposal (marked as such): how to choose
Pick the entry (A search box or B filter panel), then decide whether C's in-context doors and D's catch-up feed are wanted in addition. Answers to the eight questions apply to all options, so settle them first.
