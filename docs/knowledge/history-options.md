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

## Decisions (owner, voice, 11 Oct 2026)
- **H1. Option B (faceted filters) is out.** "Too complicated"; "faceted filters is definitely not."
- **H2. History stays in context and covers pantry, recipes and shopping.** Pantry already has it (the item flyout's History); recipes already have a versions/history screen and a To review screen with per-change undo. The owner: "we're only going to do history for pantry and recipes... and also one for shopping." Keep pantry as it is. Shopping is new and follows the same pattern. Each is its own concern, not a unified cross-service list.
- **H3. If a search box is used, it reads typed text by fixed rules only, no assistant.** Known time phrases, item and member names from the household's own data, and a set list of action words, matched locally. Answers open question 6 below.
- **H4. Phone entry is option D's "Since you were last here" feed (owner, voice, 11 Oct 2026: "we'll lock in since you were last here").** It is the default view on phone, grouped by day and person (D's layout), with a short recent window only. A standalone search-first page (option A) is not the phone's primary entry.
- **H5. The detail view is the same whichever way you arrive.** The owner: the detail flyout is pretty much the same between A and D. Tapping an entry opens option C's in-context flyout for that item, recipe or shopping entry (H2).
- **H6. Load only a short recent window by default** ("so that we are efficient on how much data we are pulling"). Going further back or looking for something specific is a search, a secondary action. **Cap (owner, voice, 11 Oct 2026): the feed keeps three days of data at most**, even if it has been longer since the last visit. Within that, the window is since the last visit. Anything older is found through the search (H7). **Proposal:** show a line such as "Showing the last 3 days. Search for older." when the cap cut the window.
- **H7. A close (X) on the catch-up feed leads into a search of the history: option A's search interface (one box, phrases become chips), used here as the way to dig past the three-day window, not as the phone's front door.
- **H7a. On phone the search is a filter pick, not typing (owner, voice, 11 Oct 2026).** The X clears the catch-up and brings in the search part of History. There you pick one of the filters "from the bottom", and it should be very much like the existing filter sheet and panel (Pantry's Filters): you come to it with a pick-a-filter step. This replaces the free-text box on phone: **no typed or "ask it" search at all on phone, filter sheet only** (owner, voice, 11 Oct 2026: "there is no ask it like you would say it part"). The typed, fixed-rules search (H3) applies only where a search box exists, which is desktop if it keeps one.
- **H7b. After the X, phone shows the last five recent entries** (owner, voice, 11 Oct 2026: "when they exit out of it, it shows the first five recent. Last five recent"), with the filter pick under them for anything else. **Proposal:** five newest entries across pantry, recipes and shopping, newest first, within the three-day cap; the filter sheet narrows or replaces them. Open: whether "five" is per area or in total. **Open (owner said "there's only two things in the mobile" and did not finish):** which two things are meant, for example two filter groups or two views. Not guessed here.** The owner: when the feed is showing, "there's an X out to go into a search of the history." Search uses fixed rules (H3). **Proposal:** a dismissed catch-up counts as caught up for "last seen".
- **H8. Desktop entry is still undecided.** The owner started on desktop and did not finish.
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
