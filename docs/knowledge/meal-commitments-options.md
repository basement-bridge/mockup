# Meal commitments: three options for one live table behind holds and shopping-list shares

**Status: options awaiting the owner's decision (14 Oct 2026). Design pass only: nothing is built, no schema is changed, no mockup screen changes.** Schema changes are reserved to the owner. Read with `jobs-to-be-done/plan-ui-review.md` decisions 206, 207, 213, 276 and 277, and `jobs-to-be-done/plan-desktop.md` ("Replan cleanup", 276 to 281).

## Owner direction (Arjan, voice, 14 Oct 2026)
Today the Kitchie server keeps ONE overwritten free-text quantity per shopping name and no record of which meal contributed what, so Replan cannot subtract a meal's share from the shopping list. Holds have the same shape of problem (which meal holds how much of an ingredient). Look at it feature-agnostic: ONE general "meal commitments" concept that serves both holds and shopping-list contributions, not two one-off tables. It is a live table of CURRENT contributions (one row per meal + ingredient + type [hold | shopping] + amount), NOT a history log. Replanning or clearing a meal removes its rows. The shopping line total and the hold state are derived from the remaining rows. Nothing grows or needs pruning.

Rules to carry in its bones (MC-D1 to MC-D5, all owner, same direction):
- **MC-D1. All or nothing per meal.** A meal's ingredients are one unit: either held because everything is in stock, or the shortfall goes on the shopping list. Never hold one ingredient while another is missing: no per-ingredient hold. Substitution/swap is not built; when swap arrives, hold and shopping may collapse into one. We never tell the person not to cook a meal without an ingredient; that is up to them.
- **MC-D2. A hold is real and never blocks the person.** The server's `reserve` returns 409 `hold_conflict` today when another meal dated today or later holds the ingredient; how that is resolved under the new shape is left to us (for example, a visible shortfall instead of a refusal).
- **MC-D3. Only the person whose plan it is places or releases commitments.** Never someone merely viewing another member's plan (a read-only view must not reserve on their behalf). Matches decisions 206 and 213 (14 Oct, earlier).
- **MC-D4. Respect household scoping and the existing acting/permission code.**
- **MC-D5. Replan removes the meal's own cart contribution only if unbought:** subtract its quantity, remove the line at zero, bought items stay. This is decision 277 (drawn in the mockup, built nowhere yet).

Related earlier owner words: "a hold never blocks; Replan releases it entirely" (276); "keep [the shopping lists] separate ... because they might change their mind and we don't want to go and buy things" (206); "x keeps the person's own words" (Kitchie PR #739, owner typed 13/14 Oct).

## What the code does today (checked in `basement-bridge/kitchie` `uat` at 9d02400, read only)
| Thing | Where | Shape today |
|---|---|---|
| Hold | `plan.ts` `reserve`/`unreserve`, `plan_entries.reserved` + `reserved_keys_json` | A flag and a JSON list of ingredient KEYS. No amounts. It holds the on-hand ingredients and ignores the missing ones, so partial holds exist today (breaks MC-D1). |
| Hold conflict | `plan.ts` `claims()`, `holdConflicts()` | Another meal with `reserved = 1`, dated today or later, holding the same key. `reserve` refuses with 409 `hold_conflict`. Editing a held meal's ingredients lifts the whole hold on a conflict. |
| "In stock" | `plan.ts` `Stock.has(name)` | Presence only, by name-token overlap. No amount compare. So a hold is "I have some", never "I have enough". |
| Shopping share | `plan.ts` `addMissingToShopping`, `plan_entries.listed_json` | A JSON list of keys the meal has put on the list. The amount goes through `shopByName`/`shopLink` as free text (`scaledAmount`) and **overwrites** `shopping_entries.quantity_text` (one row per household + name). Nothing records whose amount it was. |
| Shopping line | `shopping.ts`, `store.ts` (`shopping_entries`, `shopping_dismissals`, `shopping_bought`) | One free-text `quantity_text` per name; `added_by`; computed rows (low/out) merged by name. Bought deletes the entry (and Undo of Bought restores it from `shopping_bought`). |
| Replan | `plan.ts` `deleteEntry` (`plan_remove_meal`) | Deletes the `plan_entries` row, so the hold and `listed_json` go. The shopping line is untouched. The desktop code says so out loud (`plan.desktop.js`, "Not built, on purpose ... M56"). |
| Permission | `plan.ts` `canChange`/`ownRow` | Planner always, **or anyone when the meal is for Everyone**. So `reserve` and `shopping` on another planner's Everyone meal are allowed server-side today. The screens hide it (decision 206); the server does not. |
| Undo | `plan.phone-data.js` `persist` (snapshot diff) | Replan undone by re-POSTing the meal (new id) and a soft re-reserve; "the list keeps what was added: there is no call to take a line off again". |
| Week actions | `weekHold`, `weekAddToBuy` | Loop over the shown meals calling reserve/shopping; the Household view includes other planners' meals and relies on the server's `not_your_plan`. |
| MCP | `plan-mcp.ts`, `acting.ts` | `plan_reserve`, `plan_add_missing_to_list`, `plan_remove_meal` are "personal link only" (refused on a shared link). `shopping_set_quantity` writes the line's words. |

Schema is at version 44 (`SCHEMA_VERSION`); the next free number is 45, but numbers get claimed in parallel (32/33 collided once), so the number is confirmed at build time.

## Shared design pieces (apply to all three options)
These come from the rules above, not from an option. All are **Proposals** unless they quote a rule.

**S1. A commitment is `(household, meal, ingredient key, type, amount)`.** `type` is `hold` or `shopping`. The key is the plan's normalised ingredient key (`keyOf`) and, for shopping, the same `shoppingKey` the list uses (trimmed, lower case). The amount is stored as the words the meal produced (`scaledAmount`, a snapshot at the time) plus, when it parses, `amount REAL` and `unit TEXT` using the existing `splitAmountUnit`/`parseStructuredText` (`quantity.ts`).

**S2. Meal state is derived from its rows, per meal, all or nothing (MC-D1).** `held` (hold rows for every ingredient; nothing missing), `short` (shopping rows for the missing ones) or `open` (neither). A meal never has both hold rows and shopping rows for the same set. Hold is offered only when nothing is missing; with a gap the one action is Add (the shortfall). The on-hand part of a meal with a gap is simply not claimed: that is the visible cost of "never hold one while another is missing". The footer (decision 126: Hold N, Add N) keeps its two buttons; Hold is absent while something is missing.

**S3. A hold never blocks (MC-D2): the shortfall is visible, not refused.** Hold rows are additive, so two meals can hold the same chicken. The detail shows a derived line: "Chicken: 300 g at home, 400 g held for 2 meals, 100 g short for Sat". Served in date order (earliest first, then created order) so the later meal is the one shown short; computed on read, nothing stored. When units do not compare (S5) it falls back to today's presence rule and the "also held for X" line the server already has (`also`, `held_by`). `plan_reserve` stops returning 409 `hold_conflict`; it returns the hold plus `short: [...]`, and the `hold_conflict` code is retired (an MCP and `docs/plan-week-api.md` contract change). A shortfall never adds itself to the shopping list ("never push purchases"); the person taps Add.

**S4. Permission (MC-D3).** A commitment is written only when `plan_entries.planner_member_id` equals the acting member. This is stricter than today's `canChange` (anyone may edit an Everyone meal) and applies to commitments only; editing a household meal stays as it is. The row carries `member_id` (the planner). Replan, Clear week, the week actions and Undo all go through the same check. It closes the loophole in the table above. Household scoping (MC-D4): every row has `household_id` and every query filters on it, as `PlanBook` does with `this.hh`. The acting layer (`actingAs`) already stamps the member; no new identity path, and "personal link only" is unchanged.

**S5. Units and amounts.** A line total is the sum of parts grouped by unit: the same unit (or convertible by the Pantry's `convertAmount`) adds; bare counts add; anything else stays a separate part: "3 lemons, 1 bag". Replan subtracts from its own unit group, never across groups. Words that do not parse ("a bunch", "to taste") are carried as a part with no number, removed whole on Replan and never summed. Free text stays free; nothing is guessed.

**S6. The person's own words and hand-added items (PR #739, "x keeps the person's own words").** Three sources can share one list line: a meal (commitment rows), the person's own words typed in the Quantity sheet (today's `shopping_entries.quantity_text`), and a hand-added item (the Pantry's "Add to shopping list", no meal behind it). The person's own words and hand additions are one more part of the line with no meal behind it ("own"). Replan only removes the meal's part and never changes the own part. If the person edits a line total by hand, what they typed is the whole truth: the line is **pinned** (meal rows stay so the screen can still say which meals are behind it, but Replan does not touch the words and says "Your amount was left as you set it"). This is the cautious reading of "x keeps the person's own words". Decision 277 already notes "Open: hand-edited line amounts (not drawn)": this is that case.

**S7. Bought lines (MC-D5).** When a line is bought (Done shopping, shopper-link "Got it"), its shopping rows are deleted in the same transaction, because the shortfall no longer exists; the bought snapshot (`shopping_bought`) keeps them so Undo of Bought puts the line and its rows back. A later Replan finds no rows and no line: bought items stay. Whether the meal then becomes held is Q-MC3.

**S8. Recipe boundary.** A commitment stores key + amount snapshot, never a Recipe id, a version or any Recipe field, so a later Recipe edit cannot move a commitment and Recipe is untouched. Ingredients come from the plan's own snapshot (`ingredients_json`, and for a Recipe-backed meal the existing `RecipeReader` port, empty in production today). No new Recipe call, tool or contract in any option.

## Option A: one new table, `meal_commitments`
**Idea.** The owner's concept, literally: a live table, one row per meal + ingredient + type, nothing else. Hold state and the shopping line's meal parts are both read from it.

**Schema sketch (not to be built without the owner).**
```
meal_commitments (
  household_id  TEXT NOT NULL,
  entry_id      TEXT NOT NULL,      -- plan_entries.id, deleted with the meal in the same transaction
  ing_key       TEXT NOT NULL,      -- keyOf(name); for shopping rows = shoppingKey(name)
  type          TEXT NOT NULL CHECK (type IN ('hold','shopping')),
  member_id     TEXT NOT NULL,      -- the planner (S4)
  amount_text   TEXT NOT NULL DEFAULT '',   -- the words the meal produced
  amount        REAL,               -- parsed, nullable (S1, S5)
  unit          TEXT,               -- parsed, nullable
  created_at    TEXT NOT NULL,
  PRIMARY KEY (household_id, entry_id, ing_key, type)
)
INDEX (household_id, ing_key, type)   -- "who holds / who has put this on the list"
```
Plus, for S6, one additive column `shopping_entries.pinned INTEGER NOT NULL DEFAULT 0`. `plan_entries.reserved`, `reserved_keys_json` and `listed_json` stay for one release as write-only mirrors, then are dropped in a later step.

**Read path.** Plan week/detail: hold state = the meal has `hold` rows (replaces `reserved`); per-ingredient claim and shortfall = the sum of other meals' hold rows for the key dated today or later (replaces `claims()`), compared with the Pantry amount when units compare (S3). Shopping: `mergeRows` gets a `parts(name_key)` lookup: meal parts from `shopping` rows + own words (`quantity_text` as the "own" part) = the line's displayed total; `source` (computed / manual / both) and `at_home` are untouched.

**Write path.** `reserve`: planner check (S4), all-on-hand check (S2), insert hold rows; no 409. `unreserve`: delete the meal's hold rows. `addMissingToShopping`: insert shopping rows for the missing ingredients, then call the existing list writers so the line exists; the displayed total is derived, so the overwrite disappears. `shopping_set_quantity` (manual edit): sets `quantity_text` and sets `pinned = 1` if the line has meal rows. `deleteEntry` (Replan): one transaction deletes the meal's rows; for each shopping row, if the line is unbought and not pinned, the total is recomputed and the `shopping_entries` row is deleted when no meal part and no own words are left (a computed row cannot vanish: only its words clear, as the dismissal rule already says). It returns what changed ("lemon 3 down to 2", "Already bought, left alone: chicken thighs") for the day note (decision 277).

**Replan, Clear week, Undo, Copy last week.**
- Replan: as above, in the same transaction as the meal delete.
- Clear week: Replan for each of the person's own meals from today on, never the past, respecting named participants (210, 213); one transaction; one summary.
- Undo: the screen re-creates the meal (new id) as today; the server then re-applies commitments through the same `reserve`/`addMissing` calls, so amounts are recomputed from the meal and the current stock rather than restored. Alternative: `plan_remove_meal` returns the removed rows so Undo can POST them back for an exact restore (Q-MC6).
- Copy last week: copies meals only, with no commitments (it already creates `reserved = 0`, `listed = '[]'`). Unchanged.
- Move: rows follow `entry_id`; rank by date is derived, so nothing to rewrite.
- Past meals: hold rows of a meal dated before today are ignored by every read and deleted by a sweep in the next plan write (no growth). Shopping rows follow the meal's life.

**Migration (additive, safe to re-run).** Create the table. Backfill from `plan_entries`: each `reserved = 1` meal gets hold rows for its `reserved_keys_json` keys with the amount from its `ingredients_json` (`scaledAmount`); each key in `listed_json` gets a shopping row. Existing `shopping_entries.quantity_text` is left as it is and the line is marked `pinned = 1` unless the text equals the sum of the backfilled parts. So the first day after the change no list line changes by a character, and Replan on an old line says it was left alone. Partial holds that exist today (against MC-D1) are kept and normalised the next time the person touches the meal (Q-MC10).

**Risk.** Additive schema on live data, but real behaviour changes: Hold no longer partial, no 409, and the server stops allowing commitments on another planner's Everyone meal. Drift between the table and the mirror columns during the one-release overlap; mitigated by writing rows first and reading rows only.
**Effort.** Largest: a new store module (about the size of `shopping.ts`), changes in `plan.ts` (reserve, unreserve, addMissing, deleteEntry, updateEntry, copy, detail, claims), `store.ts` (Bought, Undo of Bought), `web-plan-api.ts`, `plan-mcp.ts`, the `docs/plan-week-api.md` contract, and the Plan data files in the client. Roughly 4 to 6 build slices.
**What a wrong guess costs.** Wrong table shape (for example the amount model): a second additive migration; rows are small and derivable from the meals, so low. Wrong permission reading: a one-line check. Wrong "pinned" default: over-protecting leaves a number too big after Replan; under-protecting changes words the person typed; the first is the safe failure.

## Option B: amounts on the rows that already exist (no new table)
**Idea.** The two JSON columns `plan_entries` already has become the commitments: `reserved_keys_json` and `listed_json` change from a list of keys to a list of `{key, amount}`. One concept in the code (a `Commitments` type with `type`), two columns in the database.

**Schema sketch.** No new table, no new column. `reserved_keys_json`: `[{"key":"chicken","amount_text":"500 g","amount":500,"unit":"g"}]`. `listed_json`: same shape. `reserved` stays as the flag. Readers accept both shapes (a bare key string means "no amount known"). Optionally the additive `shopping_entries.pinned`.

**Read path.** Hold claims: scan the household's `reserved = 1` rows (what `claims()` already does), now with amounts. Shopping parts for a name: scan `listed_json` of meals dated today or later for the key (a small in-memory scan; a household has tens of meals). Line total = parts + own words, as in A.

**Write path.** Same calls as A, writing into the JSON of the one meal row. Replan = delete the row, so the parts vanish by themselves (the appeal); the line total is recomputed on read; the one explicit step is clearing the line's words when it was the only part and unbought.

**Replan, Clear week, Undo, Copy last week.** Replan and Clear week are the same row deletes as today plus the list recompute; Undo re-creates the meal (the client already does) and re-applies; Copy last week is unchanged (it already writes `listed_json = '[]'`).

**Migration.** A data-shape change only: lazy upgrade on read, no DDL, nothing to roll back at the schema level. Existing hold and list behaviour continues; amounts appear as meals are touched. Backfill is optional because `ingredients_json` already holds every amount. Existing list lines are pinned as in A.

**Risk.** Lowest schema risk, but the concept is not general: a third consumer (a cook-time deduction, a leftovers claim) needs a third JSON column, and "everything committed on chicken" means scanning every meal row. A bought line cannot drop its parts without rewriting the meal's JSON (S7), the awkward case and the main reason A beats B. The data-shape change is also reserved to the owner.
**Effort.** About half of A (no new module); the bought path (S7) and the JSON helpers are the work. Roughly 2 to 3 slices.
**What a wrong guess costs.** If the owner later wants the general table (A), B's JSON is migrated into it with the same mechanical backfill A uses, so B is a deferral, not a throwaway; the cost is one extra migration and a release carrying two shapes.

## Option C: derive at read time, store nothing new
**Idea.** The plan already knows, per meal, which ingredients it asked for (`ingredients_json`, with amounts and people) and which keys it has put on the list (`listed_json`) and held (`reserved_keys_json`). Derive each meal's share on read from the live meal; no stored amounts.

**Schema sketch.** None. At most the additive `pinned` (S6).

**Read path.** For a list line: parts = for every meal dated today or later that lists the key and whose ingredient is still missing from the Pantry, `scaledAmount(i, people)` recomputed now + own words. A bought line leaves the list; its meals then see the ingredient on hand, so their share derives to zero (this is how "bought stays" falls out). Holds: derived from `reserved_keys_json` and the meals' scaled amounts.

**Write path.** Writes only mark the key on the meal (as today). Replan deletes the row and the share goes with it. The overwrite problem is solved on read, not on write.

**Replan, Clear week, Undo, Copy last week.** Replan and Clear week: the share leaves automatically. Undo: re-create the meal and the share returns exactly. Copy last week: unchanged.

**Migration.** None, apart from treating today's overwritten `quantity_text` as the "own words" part, pinned.

**Risk.** Highest behavioural risk. (1) A share changes by itself when the meal is edited after it was put on the list (portions 2 to 4 and the list grows while the person is in the shop). (2) "Missing" is `Stock.has`, a name-token match, so a bought "cheddar" can make "cheese" look on hand and make a share vanish early, and the same match can hide a real shortfall. (3) A partial purchase ("bought 1 of 3 lemons") cannot be told from a full one. (4) A hold with a shortfall (S3) needs the amount at the time, which is not stored. (5) It is not what the owner described ("a live table of current contributions"). It remains the cheapest way to find out whether the extra table is needed at all.
**Effort.** Smallest: read side plus the Replan list recompute; 1 to 2 slices.
**What a wrong guess costs.** Low in schema terms, high in trust: a shopping list that changes under the person's feet is what decisions 206 and 277 rule out.

## Side by side
| | A: new table | B: JSON on existing rows | C: derive on read |
|---|---|---|---|
| Matches owner's description | Yes, literally | Logically, physically two columns | No (nothing stored) |
| Schema | New table (+ optional `pinned`) | No DDL (data shape) | None (+ optional `pinned`) |
| Third consumer | Add a `type` | New JSON column | Re-derive |
| Bought (S7) | Delete rows in the same transaction | Rewrite meal JSON | Falls out, but fuzzy (`Stock.has`) |
| Amount stability | Snapshot at commit | Snapshot at commit | Follows live meal edits |
| Effort | 4 to 6 slices | 2 to 3 | 1 to 2 |
| Main risk | Overlap release, behaviour changes | Not general, awkward Bought | List changes under the person |

## Interaction with kitchie PR #739 and the safest order
PR #739 (open, "Shopping quantity sheet: a quiet Pantry-unit pill; x keeps the person's own words", 0.114.0) touches `server/src/shopping.ts` (+18), `store.ts` (+3/-2), `inventory-port.ts`, `acting.ts`, `web-shopping.ts`, `assets/shopping.js` and adds `as_typed` to `POST /shopping/quantity`/`setShoppingQuantity` and a `pantryUnits` function. It is about how one quantity is typed and saved on one line. Commitments read and write the same line, so they sit ON TOP of it: the typed words (`as_typed`) are the "own" part and the pinned trigger (S6), and the Pantry-unit pill is the unit a typed number gets, which feeds S5. **Nothing in this proposal edits or duplicates a #739 file.** Safest order:
1. Land #739 first (no schema, UI only).
2. Slice 1 of the chosen option: the commitments store and a **shadow write**: rows are written by `reserve`/`addMissing`/Replan beside today's behaviour and nothing reads them. No visible change; rows can be compared with the list and the holds in UAT.
3. Slice 2: Replan subtracts (MC-D5); the Replan note and Undo text (decision 277) go live; line totals read from the rows.
4. Slice 3: hold reads (shortfall, no 409), retired `hold_conflict`, the MCP contract change.
5. Slice 4: drop the mirror columns.
Each slice merges on its own and is reversible until slice 4. Changes to #739's files after it lands are additive (a `parts` lookup in `mergeRows`).

## Collision check (14 Oct 2026, GitHub REST API, both repos)
- **Kitchie open PRs:** only **#739** (`feat/shopping-unit-pill`). Overlap as above; not touched.
- **Kitchie issues:** **#704** (open, "Plan: clicking a planned recipe shows Not found", the cook route cannot read a family id) touches the Plan recipe link, not holds or the list. **#576** (open, "Recipe tab, Ideas (RT-K9)") is the Recipe tab; the only contact is the Recipe boundary, and S8 adds no Recipe call.
- **Kitchie branches:** none found by name for commitments, holds or shopping contributions (docs/chore branches only).
- **Mockup:** no open pull requests. The branch `design/plan-replan-cleanup-reds-14oct` is merged in `main` (decisions 276 to 281 are present); 277 is the screen-side statement of MC-D5.
- **Kitchie `docs/project-plan.md` row M56** records "Not built, on purpose: taking a meal's own quantity off the unbought shopping lines it caused ... owner decision needed". This design is that decision.

## Mockup and handover notes
- **Mockup screens:** no screen changes in this PR. The screen-side pieces are already drawn: 277 (Replan note and Undo), 276 (hold never blocks), 206/213 (nothing on another person's plan), the Hold N / Add N footer (126). New to draw if S2 is accepted: a meal with a gap shows no Hold, only Add, and the derived shortfall line of S3. These are shown here first, then built (AGENTS.md).
- **Client files that change on build (Kitchie):** `plan.phone-data.js` (`persist` removal step and soft re-reserve, `weekHold`, `weekAddToBuy`), `plan.desktop-data.js`, `plan.desktop.js` (the "Not built" note and the undo toast).
- **Performance (DESIGN.md section 6).** Default path: nothing new loads. The commitments read is server side and part of the existing Plan week and meal-detail calls; the line total is part of the existing shopping read. Deferred: per-ingredient claims and shortfall are read with the meal detail, on engagement, as the held-by data is today; "the meals behind this line" is read when the line is opened, not with the list.

## Open questions (what a wrong guess costs)
- **Q-MC1. Which option?** Recommendation below. A when C would do: an unused table, small. C when A was meant: lists that move under people, high.
- **Q-MC2. Hold only when everything is on hand (S2).** A meal with a gap shows no Hold, only Add, and its on-hand ingredients are then not claimed. Holding the on-hand part instead breaks MC-D1. Cost: a rule and a screen.
- **Q-MC3. After the shortfall is bought, does the meal become held by itself?** Proposal: no, the person taps Hold (MC-D3). Cost: one tap versus an unrequested hold.
- **Q-MC4. Order for a visible shortfall (S3).** Earliest meal served first; alternative "wanted by 2 meals, 100 g short" with no order. Cost: wording.
- **Q-MC5. Hand-edited line (S6).** Typed total pinned (proposed), or Replan subtracts the meal parts from what was typed when it parses. Cost: a Replan that changes words the person typed, versus a number left too big.
- **Q-MC6. Undo of Replan:** recompute (cheaper) or restore exactly (the delete returns the rows). Cost: a different amount after Undo if the stock moved.
- **Q-MC7. Narrowing who may place a commitment (S4).** Today anyone can hold or list on another planner's Everyone meal; this closes it for commitments only. Cost: a housemate can no longer hold an Everyone meal someone else planned; matches 206 and 213 but is a server behaviour change.
- **Q-MC8. MCP contract.** `plan_reserve` stops returning `hold_conflict` and returns `short`; `plan_add_missing_to_list`, `plan_remove_meal` and `shopping_set_quantity` gain a "left alone" note. Closed-vocabulary rule (Kitchie `docs/adr/closed-vocabulary-for-ai.md`): confirm the new fields. Cost: a tool change assistants read.
- **Q-MC9. Past meals.** Hold rows end at the meal's date; shopping rows stay until bought or Replanned. Alternative: shopping rows end with the date too. Cost: a list line staying for a meal already eaten.
- **Q-MC10. Partial holds that exist today.** Kept until touched (proposed) or released at migration. Cost: a one-time visible change to existing holds.
- **Q-MC11. Computed lines (low or out in the Pantry) that a meal also lists.** The line stays when the meal part leaves, because the Pantry still says it is short (the dismissal rule); only the meal's amount comes off. Confirm.

## Recommendation (the design agent's, a Proposal)
**Option A, in the slice order above, starting with the shadow write.** It is what you described, the only one that answers "which meal holds or listed how much" independently of the meal row, it makes Bought and Undo of Bought exact, and a third consumer (swap, a cooking deduction) reuses it by adding a `type`. B is the fallback if you want no new table this release; its data migrates into A mechanically. C is not recommended as the source of a shopping total (it may suit the read-only "who else wants this" line). Slice 1 changes nothing the person sees, so the schema decision can be taken separately from the behaviour decision.

## Not decided here
Schema number and exact column names (owner); whether the mirror columns are dropped; the wording of the notes; what counts as convertible units beyond the Pantry's own rules.
