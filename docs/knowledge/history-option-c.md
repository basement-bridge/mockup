Revised to the owner's locked decisions H2, H5, H9, H10 (11 Oct 2026).

# History, Option C: "History in context"

Owner, by voice, 11 October 2026 (quoted closely): History should be searchable on mobile and on desktop, with separate layouts designed together in one pass so he can lock decisions in one go. It covers both Kitchie (inventory, shopping, plan, cooking, preferences) and Recipe (create, edit, versions, cook, star and vote). Think broadly about what people look for. Propose options, not decisions. Nothing is built into the real apps.

Locked decisions that apply here (`history-options.md`, owner by voice, 11 Oct 2026):
- **H2.** "We're only going to do history for pantry and recipes... and also one for shopping." History stays in context. Pantry already has it (the item flyout's History) and stays as it is. Recipes already have a versions/history screen and a To review screen with per-change undo. Shopping is new and follows the same pattern. Each is its own concern, not a unified list.
- **H5.** The detail view is the same whichever way you arrive. This flyout is what the catch-up feed (option D) opens.
- **H9.** No "ask it" search anywhere. No typed question, no suggested questions, no natural-language entry.
- **H10.** No Assistants category. "Assistant just represents the person": an assistant's action is shown as the person it acted for.

Mockup: `history/option-c/index.html` (overview), `mobile.html` (390 wide sheet), `desktop.html` (the History column beside the list entry). Code: `hc.js`, `hc.css`, `scn.js` (the scenario bar is mockup only). Open with `?scope=shop:rice|shop:tea|list:|pantry:rice|recipes:fried-rice`, `&state=catchup|nomatch`, `&filters=1`, `&widen=1`. Screenshots: `docs/screenshots/history-option-c-*.png`.

## What changed in this revision

| Before | Now | Why |
|---|---|---|
| Doors on item, spot, recipe, member, plan day and Everything | Three concerns: Shopping (drawn), Pantry and Recipes (linked) | H2 |
| Item history drawn in this option | A card linking to the Pantry item flyout's History (`fragments/item-edit-flyout/pantry.html?sel=rice&child=history`) | H2: keep pantry as it is |
| Recipe and cooking rows drawn | A card linking to `recipe-versions/history.html` and `recipe-versions/suggestions.html` (To review, per-change undo) | H2 |
| Scoped search box, `/` key, "Search Pantry" zero state | Removed | H9 |
| Question chips and answer cards | Removed | H9 |
| Who filter "Assistants and voice", spark and plug avatars, "Claude (for Priya)" | Removed. An assistant's row shows the person | H10 |
| Widen to Pantry, then Everything, with a facet column | One widen: entry to the whole shopping list, a button | H2, H9 (Proposal) |
| (none) | "Opened from the catch-up" state | H5 |

## Idea

History lives where the thing lives. A shopping list entry gets a clock. It opens already scoped to that entry: who added it, bought it, changed its amount or took it off, and when. One button widens it to the whole shopping list. The same flyout opens when someone taps a shopping entry in the catch-up feed (option D). Pantry and recipes keep the history they already have.

## Jobs this serves (DESIGN.md section 1)

- "Who put this on the list, and why?" (a list entry's own history).
- "Did someone already buy it?" (about to go shopping).
- "I did something by mistake" (undo, on the row).
- "I have been away; what happened to the list?" (arrive from the catch-up, land on the same detail).

## Superseded proposals

Each is marked; the original text is kept in git history, not repeated here.

- **C1 (one entry, many doors): superseded by H2.** Doors on spot, member and plan day are dropped; Profile > History (Everything) is dropped. Pantry and recipes keep their own doors.
- **C2 (breadcrumb to Everything): superseded.** Replaced by C16.
- **C3 (questions first): superseded by H9.**
- **C4 (scoped search box): superseded by H9.**
- **C5 (three filters): kept, changed.** Still picks, no typing. Values are now those of C21. The facet column is dropped with Everything.
- **C6 (item to recipe, both ways): superseded by H2.** Cook rows and their used-item chips belong to the existing recipe screens. The one cross-link kept is C24.
- **C8 (assistants and voice are people with a tag): superseded by H10.** See C19.
- **C10 desktop "grows into a wide panel": superseded.** The column stays a column (C10's first half is kept: the existing History column, `,` opens and closes it).
- **C11 (shortcuts): `/` removed (H9).** `,`, `W`, `Shift W`, `J`, `K`, `R`, Ctrl or Cmd Esc stay.
- **C13 (empty and zero states): changed.** The quiet-item state goes. The zero state is now "Nothing matches these filters".
- **C-O3 (fixed or typed questions): answered by H9.**
- **Kept as they were:** C7 (undo on the row, an undo is a new entry), C9 (phone sheet layout), C12 (days load 3, then 5 per press), C14 (playful, one family).

## Proposals for shopping history (all Proposals, marked; the owner was silent on each)

- **C15. One clock per shopping list entry.** Phone: a clock in the entry sheet's header, opening a bottom sheet. Desktop: a clock beside the entry in the same place as Pantry's, key `,` opens and closes the History column (Ctrl or Cmd Esc closes; one parent flyout at a time). Same style as Pantry's History: this thing only, newest first by day.
- **C16. Opens scoped to the entry, one pick widens to the whole list.** Crumbs: the entry, then "The shopping list". A dashed "Widen to The shopping list" button repeats the step. Desktop `W` widens, `Shift W` narrows. A pick, never typed (H9).
- **C17. In the whole-list view an item's name is a link back to that entry's own history.**
- **C18. What a shopping entry's history shows.** Four things only: added, amount changed, bought (ticked off), removed. Each row says what, who, when, and carries the net change (1 kg to 2 kg; on the list to bought). The person's own words stay in the row when there are some ("We are nearly out of rice").
- **C19. An assistant's action shows as the person it acted for (H10).** The row carries that person's initial and name. A small tag "via assistant" is drawn next to the time, as "by voice" and "receipt import" already are. **Open (H10 left it open): whether any mark is wanted.** It is one tag, so removing it costs one line.
- **C20. A tick-off on the shopper link shows as "Someone shopping"** with a link icon and a "shopper link" tag, matching option D's wording. No sign-in, so no name.
- **C21. Filters are picks.** Who: Anyone, Me, Sam (a member per household member). What: Anything, Added, Amount, Bought, Removed. When: Any time, Today, This week. Behind one Filters button on phone and desktop. No custom date range.
- **C22. Pantry and recipes are hand-offs.** Jumping to either shows a card with the existing screens' links and nothing redrawn. Pantry: the item flyout's History. Recipes: version history and To review.
- **C23. "Opened from the catch-up".** The flyout is the same one (H5). Two additions only: a "Back to the catch-up" button above the crumbs (it returns to the feed; the X on desktop closes the flyout the same way), and the entry that was tapped outlined in the list. On a Pantry or Recipe entry the card in C22 opens in the same place with the same back button. The catch-up feed itself is option D and is not drawn here.
- **C24. A shopping row that came from a recipe or plan says so** ("for Egg fried rice, on the plan") and the recipe name jumps to the Recipes hand-off.
- **C25. Undo in the row's own words** (kept from C7): "Take it off the list", "Put it back on the list", "Set it back to 1 kg". Bought undoes to "on the list". An undo adds an entry "Undid: ..." and marks the original "Undone". Nothing is deleted.

## Field catalogue for shopping events (Proposal)

One shopping history entry. Source: the Kitchie journal and the MCP tools `shopping_add`, `shopping_remove`, `shopping_set_quantity`. Whether bought and the shopper link are journalled today has not been checked (C-O12).

| Field | What it is for |
|---|---|
| `id` | Stable id so an undo can point at its original, and so the catch-up can open this entry (H5). |
| `at` (day, time) | Day grouping, "when", the When filter, sorting. |
| `who` | The member whose account made the change, or "Someone shopping" for a shopper link. For an assistant, the member it acted for (H10). |
| `via` | app, voice, assistant, receipt import, shopper link. Shown as a small tag only when not "app". |
| `kind` | `shop-add`, `shop-qty`, `shop-buy`, `shop-rem`. Drives the What filter. |
| `items[]` | The list entry (the item). The scope key: an entry shows in its own history and in the whole list's. |
| `text` | One plain sentence with the item name as a link in the whole-list view. |
| `from` and `to` | Net change: 1 kg to 2 kg; on the list to bought. |
| `detail` | The person's own words or the reason ("Already have some", "Ticked off from a receipt import"). |
| `recipe` | When the line came from a recipe or the plan; drives C24. |
| `undo` | Words for the undo, present only when it can be reversed. |
| `undoOf` (new) | On the entry an undo creates: the id it reverses. |

Not in the shopping history: reads, and edits to a pantry item or a recipe (they have their own).

## Open questions (what a wrong guess costs)

- **C-O1. One door or many?** Now narrowed by H2 to: is a clock on every shopping entry right, or is there also a door on the shopping list as a whole? Wrong guess: small, the whole-list view already exists as the widened step.
- **C-O4. Who may undo whose change?** Drawn: any member. If only the author or an admin may, the button must hide or ask. Cost: a permission rule and a message for refused undos.
- **C-O6. Key letters.** `W`, `R`, `J`, `K` inside the History column only. Pantry already uses U, D, S, Z, N, F, E, M. A clash means renaming keys in two places.
- **C-O8. Retention.** Drawn: everything kept. If entries age out, the end line must say so.
- **C-O9. Undoing a bought entry after the stock changed again.** Drawn: the button always shows. Real behaviour needs a rule. Cost: a wrong stock count.
- **C-O10. Is a mark wanted when an assistant did it (H10, open)?** Drawn: the tag "via assistant". Cost of a wrong guess: one tag.
- **C-O11. Is an entry the same entry after it is taken off and added again?** Drawn: one history per item name on the list. If each add is a new line, the entry history restarts and the whole-list view carries the story. Cost: the data model of a list line.
- **C-O12. Does Kitchie record bought, removed and the shopper link today?** Not checked. If not, those rows are new events in the journal. Cost: backend work, and old entries would lack them.
- **C-O13. Where does the shopping clock sit on a phone list row** (the entry sheet header, as drawn, or a swipe or long press)? Cost: the host screen, not the History sheet.
- **C-O14. Is the whole-list view enough, or should shopping list history also show list-level actions** (cleared the bought lines, shared the shopper link)? Not drawn. Cost: two more kinds.
- **C-O15. Five recent entries after the catch-up closes (H7b, "five" per area or in total)** is an option D and H7b question, not drawn here. The owner's unfinished "there's only two things in the mobile" is a phone question for option D, not for this option, and is not guessed here.
- **Dropped with the Everything scope:** C-O2, C-O5 and C-O7 (a bigger Everything screen, a date range, reads). They return only if the owner brings an Everything view back.

## Load notes (DESIGN.md section 6)

- **Default path:** each host screen as today. The clock is an icon with a key hint; no history data, no History JavaScript and no History CSS is loaded. Nothing is preloaded.
- **On first open of a clock:** one lazy chunk (`hc.js` about 19 KB and `hc.css` about 9 KB, unminified; icons inline) and one call for that entry's journal. The first 3 days that have entries are rendered; the rest wait behind "Show more".
- **On engagement only:** Filters render when the button is pressed. Filtering runs on the loaded entries, no call. Opened from the catch-up, the same chunk and the same call load; the catch-up passes the entry id so the entry can be outlined.
- **Deferred with a reason:** widening to the whole list is one new call, once, cached for the visit. Pantry and recipe hand-offs load nothing: they are links.
- **Mockup note:** data is a fixed sample of 10 shopping events in the script; a build would never ship it.

## Checked

Chromium at 390 (phone sheet), 1280 and 1440 (desktop), light (`kitchie-day`) and dark (`kitchie`). No console errors, no sideways scroll. Keys tested: `W`, `Shift W`, `J`, `R`, `,`. Screenshots: `docs/screenshots/history-option-c-*.png` (obsolete item, recipe, question, quiet and Everything shots removed).
