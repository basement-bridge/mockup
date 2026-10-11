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

## Questions that every option raises (decide once)
1. **Is there a household-wide event feed today?** Kitchie history is per item and Recipe has version history; a single feed across both is a new service (B, D). Cost of a wrong guess: the whole feature changes from a screen to a backend.
2. **Is the channel recorded** (app, voice, assistant, shopper link)? If not, "Source" and "what did Claude do" are empty for old rows (A, B, D).
3. **Who sees whose entries?** Personal Preferences changes, stars and "no" votes: drawn as private by A and D; wrong guess leaks private data (A, B, D).
4. **Undo:** which entries can really be undone, and by whom? Kitchie has no undo tool today; drawn as a new entry, not a deletion (A, C).
5. **How long is history kept**, and is 30 days searchable enough (D)?
6. **Phrase reading:** fixed rules versus an assistant that reads typed questions (A, C). An assistant costs money, latency and a privacy call.
7. **"Last week":** Monday to Sunday or rolling 7 days (A).
8. **"Last seen" for catch-up:** stored per person on the server or per device (D).

## Proposal (marked as such): how to choose
Pick the entry (A search box or B filter panel), then decide whether C's in-context doors and D's catch-up feed are wanted in addition. Answers to the eight questions apply to all options, so settle them first.
