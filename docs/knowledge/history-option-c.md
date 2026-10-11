# History, Option C: "History in context"

Owner, by voice, 11 October 2026 (quoted closely): History should be searchable on mobile and on desktop, with separate layouts designed together in one pass so he can lock decisions in one go. It covers both Kitchie (inventory, shopping, plan, cooking, preferences) and Recipe (create, edit, versions, cook, star and vote). Think broadly about what people look for: things they did themselves, things other household members did (and the AI assistants, voice and MCP), specific items or recipes, time ranges, action types, places. Propose options, not decisions. Nothing is built into the real apps.

This file is Option C of four parallel options. Mockup: `history/option-c/index.html` (overview), `mobile.html` (390 wide sheet), `desktop.html` (1440 wide column that grows). Code: `hc.js`, `hc.css`, `scn.js` (the scenario bar is mockup only). Screenshots: `docs/screenshots/history-option-c-*.png`. Everything below marked Proposal is a proposal; the owner has not chosen anything here.

## Idea

History lives where the thing lives. The item, the recipe, the spot, the member and the plan day each get a clock. It opens already scoped to that thing, with its own search box. A breadcrumb widens the scope one step at a time (this item, its place, Everything). A single "Everything" entry in Profile > History opens at the widest scope. Questions come first: a row of questions for the scope ("Where did it go?", "When did we last cook this?", "Who last edited it?") and the answer sits above the list as a sentence, so most people never read the list.

## Jobs this serves (DESIGN.md section 1)

- "Where did the rice go?" (finding out why stock changed; an item's own history).
- "When did we last cook this? Who last edited this recipe?" (recipe page).
- "What did the assistant do while I was out?" (Everything, filter Assistants and voice).
- "Who keeps moving things?" (place or spot).
- "Why did Saturday's dinner change?" (plan day).
- "I did something by mistake" (undo, on the row).

## Field catalogue (Proposal)

One history entry. Every field has a job; nothing is shown that a job does not need. Source: Kitchie's journal (`store.getHistory(id)`, MCP `item_history`) and Recipe's revisions and events (`list_revisions`, `undo_event`, `revert_change`). Fields marked new do not exist in one of the stores yet.

| Field | What it is for |
|---|---|
| `id` | Stable id so an undo can point at its original and a link can open one entry. |
| `at` (date and time) | Day grouping, "when", the time filter, sorting. Shown as a day heading plus a time on the row. |
| `who` | The member whose account made the change. Answers "who". Filter: Anyone, Me, a member. |
| `for` (new) | When `who` is an assistant: the member it acted for. Shown as "Claude (for Priya)". Answers "whose assistant did this". |
| `via` | How it was done: app, voice, assistant, MCP, import. Filter: Assistants and voice. Shown as a small tag only when not "app". Kitchie already stores `source`. |
| `app` (new on Recipe side) | Kitchie or Recipe, so Everything can show both and a filter can split them. Not drawn as a column; it follows from the kind. |
| `kind` | The action: added, used, level, moved, edit, used up, shopping, plan, cooked, recipe created, recipe edited, version, star, vote, preference, place. Grouped into the "What" filter: Stock, Shopping, Plan, Cooking, Recipes, Preferences, Places. |
| `text` | One plain sentence of what happened, with the item and recipe names as links. This is what search matches first. |
| `from` and `to` | The net change for one field (Some to Running low; Door to Top shelf; 1 tbsp to 2 tbsp). Shown as struck old value then new value. Not a diff dump. |
| `detail` | The person's own words or the reason ("We are nearly out of rice", "After Saturday's cook (estimated)", "From a receipt import"). The reason is what people search for. |
| `items[]`, `recipe`, `place`, `spot`, `planDay`, `person` | The things the entry touches. These are the scope keys: an entry shows in every scope that contains one of them. |
| `cook` link (on a stock change) | The id of the cook that caused it. Gives the link between item history and recipe cooking events, both directions. |
| `uses[]` (on a cook) | What the cook took off the shelf (2 cups rice, 3 eggs). Each is a link to that item's history. |
| `undo` | Words for the undo ("Put the stock back"), present only when the entry can be reversed. Absent means no button. |
| `undoOf` (new) | On the entry an undo creates: the id it reverses. The original is never edited or removed. |

## What is searchable (Proposal)

Free text matches `text`, `detail`, from and to values, member names, the via word (voice, assistant), the kind group, place and spot, recipe and item names, the amounts in a cook, and the day words today, yesterday and this week. Words are ANDed. Search only looks inside the current scope; a zero-result state offers one tap to widen and search again.

## Proposals

- **C1. One entry, many doors.** A clock on each of: item (sheet and flyout), spot or place card, recipe page, member card, plan day. Profile > History is the Everything door. Same sheet and the same words everywhere.
- **C2. Open scoped, widen by breadcrumb.** The first crumb is the thing, then its place or parent, then Everything. Item: item, place, Everything. Spot: spot, place, Everything. Recipe: recipe, All recipes, Everything. Member: member, Everything. Plan day: day, the week's plan, Everything. A dashed "Widen to X" button repeats the next step. Desktop key `W` widens, `Shift W` narrows.
- **C3. Questions first.** Each scope type has two or three questions. Choosing one shows a one-sentence answer above the list and filters the list to the entries behind it. The chip toggles off, and the answer card has a close x. The questions are drawn from the jobs above, not generated.
- **C4. Scoped search box.** The placeholder names the scope ("Search Basmati rice"). Esc clears it. `/` focuses it on desktop. Typing does not leave the scope; the zero-result state says what scope was searched and offers "Search Pantry" (the next step) and "Clear search and filters".
- **C5. Three filters, behind one button on phone, beside the list on desktop.** Who (Anyone, Me, Sam, Assistants and voice), What (the seven kind groups), When (Any time, Today, This week). On desktop the Everything layout shows them as a left facet column with counts that follow the search. No custom date range in the first pass (open question C-O5).
- **C6. Item to recipe, both ways.** A cook is one row in recipe, plan and Everything scopes, with its used items as chips. In an item or place scope the same use appears as its own row ("Used 2 cups of Basmati rice, for Egg fried rice, cooked yesterday"). Every name inside a row is a link that moves the scope to that thing (a jump, shown in the breadcrumb). Child rows are hidden outside item and place scopes so Everything is not doubled.
- **C7. Undo on the row.** Rows that can be reversed carry a button in the row's own words ("Take it off the list", "Put the stock back", "Undo this change"). Pressing it adds a new entry ("Undid: ..."), marks the original "Undone", and shows a toast. Nothing is deleted or rewritten, as in the Recipe versions rule (V-D13 and "any change can be undone"). Assistant and voice rows are undoable the same way. Child rows have no button; the undo is on the cook. Desktop: `R` on the focused row.
- **C8. Assistants and voice are people with a tag.** An assistant row has a spark avatar, "Claude (for Priya)" and an "assistant" tag; MCP has a plug avatar and an "MCP" tag; voice has a microphone avatar and "by voice", and keeps the person's words in the row. This matches the "assistant" badge on Recipe revisions.
- **C9. Phone layout.** A bottom sheet from the clock. Header, scope chips that scroll sideways, search with a Filters button, question chips, answer card, then days. Undo sits under the row text so text keeps the width. 44px targets throughout. The sheet is full height; it is not a page.
- **C10. Desktop layout.** The History column that already exists for the item flyout (`,` opens and closes it, Ctrl or Cmd Esc closes it, one parent flyout at a time) with a scope box and questions added. Widening to Everything grows the same column into a wide panel with the facet column; narrowing shrinks it back. Below 1240px the panel overlays the right edge, as Sort does.
- **C11. Shortcuts (shortcut-cues.md rules).** `,` open or close; `/` search; `W` widen; `Shift W` narrow; `J` and `K` move between rows; `R` undo the focused row; Ctrl or Cmd Esc closes (Ctrl or Cmd Enter stays a silent alias); all hints carry the `kbd` class and are hidden when cues are off; Shift+? lists them. Keys are ignored while typing in the search box, except Esc (clears) and the close chord. `R` and `W` could clash with future screen keys (see C-O6).
- **C12. Days load progressively.** The last 3 days that have entries, then 5 more per "Show more" (the existing desktop rule, desktop.md section 5). Quiet days are skipped. The end line says "Nothing is ever deleted."
- **C13. Empty and zero states.** A quiet item or place: a dashed circle, "Green tea has been quiet", one line, and "Look in Pantry" to widen. Zero results: the query and scope named, two buttons. A scope with only filtered-out rows says "Nothing matches these filters in X".
- **C14. Playful, one family.** Dashed widen button and dashed empty circle (same dashed look as zero-count pills); round outline close; the pill and `‹ ›` language is not reused. Tokens from `theme.css` only.

## What I did not draw

No saved searches. No export of history (My data already exports inventory CSV). No cross-household history. No editing of an entry. No restore of a deleted thing, because nothing is deleted. No natural-language box that parses "what did Sam cook last week"; the questions are fixed chips and free text is plain matching (C-O3).

## Open questions (what a wrong guess costs)

- **C-O1. One door or many?** Is a clock on every host right, or should there be one History and a scope picker? Wrong guess: if the owner wants one door, the in-context clocks become shortcuts into it (small); if he wants many and we ship one, every host loses its quick answer (rework of each host, medium).
- **C-O2. Does Everything need its own screen?** Drawn as the same column grown wider on desktop and the same sheet on phone. If a person with a big household lives in Everything, it may want a real page with saved views. Cost: a new screen, not a rewrite of the rows.
- **C-O3. Fixed questions or typed questions?** Drawn: fixed chips plus plain text match. If "ask in words" is wanted, it needs a parser or the assistant; cost is a server call per question and a "history by assistant" privacy rule. Getting it wrong either way is cheap to add later, expensive to remove.
- **C-O4. Who may undo whose change?** Drawn: any member can undo any entry, and the undo is its own entry with their name. If only the author or an admin may undo, the button must hide or ask. Cost: a permission rule in Kitchie and Recipe and a message for refused undos.
- **C-O5. Time range.** Drawn: Today and This week only. If "last month" or a date range is needed, a date control is a new component. Cost: one control, and loading more than the days already fetched.
- **C-O6. Key letters.** `W`, `R`, `J`, `K` inside the History column only. Pantry already uses U, D, S, Z, N, F, E, M. A clash means renaming keys in two places.
- **C-O7. Do assistant "reads" count?** Drawn: only changes are in History. If the owner wants "what did Claude look at", it is a new, very noisy kind (cost: volume and storage, and a "reads" filter off by default).
- **C-O8. Retention.** Drawn: everything is kept ("nothing is deleted"). If old entries age out of Everything, say so in the end line. A wrong guess costs trust more than storage.
- **C-O9. Undoing a cook after the stock was changed again.** Drawn: the undo button always shows. Real behaviour needs a rule (put the stock back by amount, or ask). Cost: a wrong stock count, which Kitchie treats as a correction.

## Load notes (DESIGN.md section 6)

- **Default path:** each host screen as today. The clock is an icon with a key hint; no history data, no History JavaScript and no History CSS is loaded. Nothing is preloaded or refreshed by itself (desktop.md section 1).
- **On first open of a clock:** one lazy chunk (`hc.js` about 33 KB, `hc.css` about 10 KB, unminified in the mockup; icons are inline) and one call for that scope's journal only (`item_history` for an item, the equivalent for a recipe, spot, member or plan day). The first 3 days that have entries are rendered; the rest of the loaded days wait behind "Show more".
- **On engagement only:** Filters (phone) renders when the button is pressed; facet counts are computed from the loaded scope, no call. Questions run on the loaded scope, no call. Searching filters the loaded scope in the browser.
- **Deferred with a reason:** widening to a bigger scope is a new call, made when the person widens, once, and cached for the visit. Everything is paged by day on the server (3 days, then 5 per press), not loaded whole. The facet column and its counts exist only in the wide desktop state. Undo is one write; the new entry is added to the open list from its response, no refetch.
- **Mockup note:** data is a fixed sample of 22 entries (two people, one assistant, one household). The mockup holds it in the script; a build would never ship it.

## Checked

Screenshots at 390 (phone sheet) and 1280 and 1440 (desktop), light (`kitchie-day`) and dark (`kitchie`): `docs/screenshots/history-option-c-*.png`. No sideways scroll. Keys tested in Chromium: `,`, `/`, `W`, `Shift W`, `J`, `K`, `R`, Ctrl Esc.
