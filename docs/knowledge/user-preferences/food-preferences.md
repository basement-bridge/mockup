# Food preferences: ingredient rules, category rules, end dates, frequency limits and substitutions

Status: owner direction by voice, 10 October 2026 (review of the preferences mockups). Option B (`option-b-mine-and-household.md`) is the chosen direction. The statements F1 to F14 below are what the owner said clearly and are **recorded as decided** (F11 to F14 are the later voice review the same day: "usually" becomes substitutions). The data shape and the operations are a **proposal awaiting approval** (the substitution shape has its own section below), and the unclear points are open questions Q-F1 and on. Mockup: the Food card of `fragments/preferences-mine-household/` (Option B only; Option A is unchanged).

Numbering: this file has its own series. **F1 to F14 are food decisions, not the data-model facts F1 to F10 in Option B's notes.** Cite them as "food F3" when both are near. Open questions are Q-F1, Q-F2, ... and are separate from Option B's Q1 to Q7 and the D series (D1 to D19 are decisions about stock checks, household editing and proposals).

## What the owner said (decided)

- **F1. Two levels, both feed what the planning AI reads for a particular person.** Ingredient level ("avoid peanuts": any recipe containing it is left out of that person's planning). Recipe or category level (for example "spicy": a rule over recipes whatever their ingredients). The two levels are **not** headings in the UI; a row is just a rule.
- **F2. Avoid is permanent.** No end date, a hard exclusion. "Never suggest" is the same thing, so it is **dropped as a separate category**.
- **F3. Likes and dislikes are soft weighting** (up or down). A dislike is **not** a hard exclusion. They take an **optional end date**; with none they stand for good. Example: "dislike spicy noodles for the next two weeks": it lapses to neutral by itself.
- **F4. A frequency rule is a new kind of rule.** "No more than twice a week" caps how often something may be suggested or planned, and is checked against recent meals.
- **F5. A category holds three things:** the rule (avoid, like, dislike or a frequency cap), a free-text note of what the person actually said, and attached recipes.
- **F6. Recipes are attached by reference.** Their titles are pulled live from the Recipe service and never copied, so a rename stays fresh.
- **F7. The AI offers matches.** When a person creates a category through the AI, the AI notices existing recipes that look like a match and offers to attach them ("these recipes seem to match, do you want them excluded?"). It asks; it does not attach on its own.
- **F8. The time window comes from natural phrasing** ("for the next two weeks", "only once"), not from start and end date fields in the UI.
- **F9. The category is a check, not a list.** The recipes served back are not the point; the category is what Kitchie consults before suggesting a recipe.
- **F10. One service, two surfaces.** The chat tools and the UI call the same service methods (the owner asked for both to be shown). The owner asked for the data shape and the operations to be worked out, kept small; see the proposal.

- **F11. "Usually" becomes substitutions.** There is no new category beside avoid, like, dislike and the frequency cap; the "usually" kind is redefined. A substitution says: when ingredient X appears in a recipe, swap in Y, optionally with a reason (for example texture). Avoid, like, dislike and category rules (F1 to F10) are unchanged. As with every food rule (F1), the planning AI reads substitutions as signal for a particular person.
- **F12. The same two tiers as the other food preferences.** A household substitution and a person substitution; the person's overrides the household's. Nothing more is said here about who edits household values.
- **F13. No end date.** A substitution is a standing rule until someone changes or removes it. Unlike a like or a dislike (F3), it takes no end, and the UI has no date or "keep it for good" control for it.
- **F14. The owner's three examples are to be captured.** Wherever there is frozen food, he wants it blanched so it is not rubbery. Wherever there is gluten-based pasta he is happy to replace it with sourdough bread. Wherever there is white bread his preference is sourdough or seeded sourdough. The owner asked for the shape of a substitution to be defined; the blanching example is a cooking instruction rather than a swap, so how one shape covers both is **proposed** below, not decided.

## What the code holds today (read only, 10 October 2026)

Checked on the default branches of `basement-bridge/kitchie` and `basement-bridge/recipe`. Option B's notes carry the same facts under "Food statements, today and what would change".

- **Kitchie** (`context.ts`, `context-mcp.ts`, `store.ts`). One table, `context_claims`: member (null = household), `statement` (likes, dislikes, avoids, usually, fact, and `stop`), `subject` plus a normalised `subject_key` (word match), `about_type` (item, ingredient, recipe, cuisine, other), `severity` (hard or soft, avoids only), `reason` (safety or other, avoids only), `rationale`, optional `meal_time` and `day_type`, the person's `said` words, `support`, `status` (active or retired). Tools: `get_context` (reads; avoids always returned; `do_not_suggest` lists the stops) and `give_feedback` (writes; a stop is `rejected` with `stop: true`). Weakening a safety avoid needs one confirmation. Personal link only, no web page.
- **No end date, no frequency, no recipe link.** Nothing expires. A claim names a subject by words only; it cannot hold recipes. The planner (`plan.ts`: `plan_entries` with date, title, `recipe_id`, ingredients as words, who it is for) does not read claims at all today; the AI reads `get_context` and is trusted to respect it. `plan_entries` and (for cooked meals) `cook_meal` are where "recent meals" would be read.
- **"Usually" today** (Kitchie `context.ts`, `context-mcp.ts`). It is one of the five stated statements (`STATEMENTS`: likes, dislikes, avoids, usually, fact). It means a **habit**, a thing the person tends to do ("we usually do pancakes at the weekend"), with an optional meal time and day type, and the same subject, scope and said-words as a like. Nothing acts on it except: it is returned by `get_context`, and a stop on the same subject retires it together with a like. It has no swap, no ingredient pair and no instruction, so it cannot say "replace X with Y". The Option B mockup drew it as a row word "Usually" with the sample "pancakes, at the weekend", and Option A and Option C still do (they are not changed; Option B is the chosen direction).
- **Substitutions already exist as a one-off, never as a rule.** Kitchie keeps a substitute on a planned meal (`plan_update_meal` with the ingredient list and `replaced` naming what the new ingredient stands in for; locked to that meal, it does not change the saved recipe) and on a cooking session (`start_cooking` `substitutions`, shown struck through on the screen). `plan_substitute_context` reads what a meal has and lacks, and its own text says to reason about substitutes yourself. Nothing remembers "always swap X for Y".
- **Recipe** (`schema.ts`, `domain.ts`, `preferences.ts`). Recipes and variations are immutable and household-scoped; only `status` (active or disabled) changes. Metadata holds `cuisine`, `flavour`, `primary_protein` and free `tags`. A recipe is addressed by (`kind`: recipe or variation, `id`). `search_recipes` finds by text. Recipe stores no per-person food statement, only one household-wide star, vote and usage count per recipe (`times_used`, `last_used`); the journal (`events`) holds each use with a time but no tool reads it by date. Recipe's own rules say the caller does the reasoning (substitutes, matching, planning) and that a temporary substitution is not persisted: `create_variation` only after the person explicitly says to keep it (provenance `promoted_substitution`).

## What the code would change (not built)

Kitchie only; Recipe changes nothing unless Q-F9 is answered the other way.

- Replace the `stop` statement by `avoids` (reason other) and migrate the existing stops; `severity soft` has no place under F2 (Q-F1).
- Add to a claim: a `rule` (the four of F3 to F5), `ends_on` (like and dislike only, F3), a cap (`max`, `per`), and a category kind with attached recipe references. A new small table `food_rule_recipes (rule_id, recipe_kind, recipe_id)`; no title column (F6).
- Lapse on read: a rule past `ends_on` is ignored, and a sweep marks it `lapsed` so history stays.
- One service module (`FoodRules`) behind `InventoryPort`, as plan and stock checks already are, so the web routes and the MCP tools cannot disagree.
- Make the planner (and `plan_meal`) call `evaluate` before it accepts a recipe, so exclusion does not rest on the AI remembering.
- Web: a Food card on Preferences (drawn in Option B). Today there is no page.
- Substitutions (food F11 to F14, proposal below): replace the `usually` statement by `substitute` in `STATEMENTS` (migrating any existing `usually` claims, Q-F10); give a stated claim of that kind `swap` or `instruction` and an optional `why` (no `ends_on`, no cap); have `get_context` return substitutions already resolved for the tiers (the person's rule over the household's, same ingredient) in their own list; drop `usually` from the stop rule that retires a like and a habit together; give a planned meal a place for cooking instructions (today the ingredient list has `replaced` but no per-meal "how" text); add the Substitution row to the Food card. **Recipe changes nothing:** substitutions are applied on the plan and the cooking session, never on a recipe. Platform changes nothing.

## Proposal: the shape (awaiting approval, not decided)

One record per rule. Ingredient level and category level are the same record; `kind` says how it is matched.

```json
{
  "id": "fr_01",
  "who": "me",                      // me | household  (member_id null = household, as today)
  "kind": "category",               // ingredient | category
  "subject": "Spicy",               // an ingredient word, or the category's name
  "rule": "cap",                    // avoid | like | dislike | cap
  "reason": "other",                // avoid only: safety | other (the closed vocabulary already used)
  "cap": { "max": 2, "per": "week" },  // cap only
  "ends_on": null,                  // like and dislike only; an ISO date the AI worked out from the person's words
  "said": "Spicy is fine, just no more than twice a week.",
  "recipes": [ { "kind": "recipe", "id": "rec_8f2" } ],   // category only; references, never titles
  "status": "active"                // active | lapsed | retired
}
```

Matching: `ingredient` matches the words in a recipe's ingredients (today's `subject_key` word match); `category` matches the recipes in `recipes`, whatever they contain. Titles are never stored: whoever draws a category asks Recipe for each title when it draws.

## Proposal: the operations

Each is a method on one service. The chat surface is a tool (or an extra field on `give_feedback` / `get_context`); the UI calls the same method through a web route. Nothing new is invented for the UI.

| Operation | Service call | Chat | UI (Option B Food card) |
|---|---|---|---|
| Create a rule or category | `create(rule)` | `give_feedback` stated item gains `rule`, `cap`, `ends_on`, `about.type: category` | not here: made by talking to the assistant (F7) |
| Attach recipes | `attach(id, refs[])` | the AI passes the ones the person said yes to | Attach, Attach all on the assistant's suggestion |
| Detach recipes | `detach(id, refs[])` | the same, on request | Take out |
| Set the frequency | `setCap(id, {max, per})` | stated again | Most per week field |
| Set or change the end | `setEnd(id, ends_on)` | the AI turns "for two more weeks" into a date | none: no date field (F8) |
| Clear the end | `clearEnd(id)` | "keep that for good" | Keep it for good |
| Expire | `expire(today)` | automatic, on read and by a sweep | automatic; a line says what ended |
| Retire | `retire(id)` | existing `corrected` | Stop remembering this (safety avoids still ask once) |
| Evaluate against a recipe | `evaluate(person, recipe, date)` | new read-only tool `check_food_rules` | not on this screen; the planning screen would say why a recipe was left out |

`evaluate` returns the effects that apply, for example `{ "verdict": "excluded" | "allowed", "effects": [ { "rule_id": "fr_01", "effect": "exclude" | "down" | "up" | "cap_reached", "why": "..." } ] }`. Avoid gives `exclude`. Dislike and like give `down` and `up`, soft: they weigh, they do not exclude. A cap gives `cap_reached` when the recipe is in the category and the matching meals planned or cooked in the last seven days already equal `max`. For a person, the rules read are their own plus the household's (added together, as today).

Matching a new category to existing recipes (F7) is the AI's reasoning, not Kitchie's or Recipe's (Recipe's rule: the caller reasons). The AI searches Recipe, shows the candidates, and calls `attach` for the ones the person accepts. In the mockup the same list is shown as a suggestion on the category.

## Proposal: substitutions (awaiting approval, not decided)

What is decided is F11 to F14. Everything in this section is proposed, including the field names.

**One record, one shape for a swap and a cooking instruction.** A substitution is the same kind of record as the other food rules (ingredient level, `subject` kept as words and matched by words, `who` me or household, `said`, `status`). It has a trigger and exactly one of two actions:

```json
{ "id": "fr_31", "who": "me", "kind": "ingredient", "rule": "substitute",
  "subject": "white bread",                       // the trigger: an ingredient (or a kind of one) as words
  "swap": ["sourdough", "seeded sourdough"],      // action 1: swap in one of these (first is the preferred one)
  "why": null,                                    // optional, short free text shown to the person ("texture")
  "said": "Wherever there is white bread, I would rather have sourdough or seeded sourdough.",
  "status": "active" }                            // active | retired; no ends_on and no cap (F13)

{ "id": "fr_32", "who": "household", "kind": "ingredient", "rule": "substitute",
  "subject": "frozen food",
  "instruction": "Blanch it first",               // action 2: do this to it; nothing is swapped
  "why": "Texture", "said": "Wherever there is frozen food, blanch it first, otherwise it comes out rubbery.", "status": "active" }
```

- **When X, then Y or then Z.** `swap` replaces an ingredient with another; `instruction` keeps the ingredient and adds a step to how it is handled. A record carries one of the two, never both and never neither. The blanching example fits as an instruction, so it needs no second category (Q-F18 asks the owner whether he agrees or wants techniques kept apart).
- **The reason is display text.** `why` is not read by any logic, so it stays free text with a small limit (the closed-vocabulary rule is for values Kitchie acts on; Q-F23).
- **The trigger is words, not a recipe list.** Unlike a category, a substitution attaches no recipes: it fires wherever a recipe's ingredient matches (Q-F16).
- **Examples of the owner's three** (sample placement of tiers is the mockup's, the owner did not say): frozen food, instruction "Blanch it first", why "Texture"; gluten-based pasta, swap sourdough bread; white bread, swap sourdough or seeded sourdough.

**Operations** (methods on the same `FoodRules` service as the other rules; the chat tools and the Food card call the same ones, F10):

| Operation | Service call | Chat | UI (Option B Food card) |
|---|---|---|---|
| Create | `create(rule)` | `give_feedback` stated item gains `swap` or `instruction`, `why`; `who` me or household | not here: said to the assistant |
| Edit | `create` again with `corrected` retiring the old row (as every statement works today) | the person says it again | "To change the rule itself, tell your assistant" |
| Remove | `retire(id)` | existing `corrected` | Stop remembering this |
| Resolve for a person | `substitutionsFor(person, date)` | returned in `get_context` as its own list, already resolved | none |
| Apply to a recipe or plan | the AI matches each ingredient line to a trigger (reasoning, so the caller's); Kitchie writes the adjusted list | `plan_update_meal` with `replaced` (exists), a per-meal `how` text for instructions (new) | not on this screen; the plan would show what was swapped |
| Check the result | `evaluate(person, adjusted recipe, date)` (existing proposal) | `check_food_rules` | not on this screen |

**Person over household (F12).** `substitutionsFor` resolves the two tiers before the AI sees them: for a person, the household's rules plus their own, and where both have the same trigger (same words, case and spacing ignored) only the person's applies to that person. The household's still applies to everyone else, and the screen never says how many members have overridden it. The person's own list shows a household row as "Not used for you, yours comes first" when that happens. A household rule cannot be edited by a person's override; the person adds their own.

**Conflicts when two rules match** (proposal, Q-F17). (1) The person's rule over the household's, as above. (2) Between two different triggers matching the same ingredient line (for example "bread" and "white bread"), the narrower trigger wins. (3) If still tied, the most recently said wins. (4) A swap and an instruction on the same ingredient can both apply (swap to sourdough, and an instruction on frozen food that was also in the recipe): swaps first, then instructions. (5) One pass only: the replacement is not matched again by other substitution rules (no chains, Q-F15).

**Applying a substitution without editing a recipe.** Recipes and variations are immutable in Recipe and temporary substitutions are not persisted there. So a substitution is applied at the moment a recipe is placed on a person's plan or cooked, on Kitchie's side: the AI reads the resolved recipe from Recipe (read only), matches ingredient lines to the person's resolved substitutions, and asks Kitchie to hold the adjusted ingredient list on that planned meal (`plan_update_meal`, `replaced` naming the original ingredient; this already exists and already leaves the saved recipe alone). Shopping, stock holds and the cooking screen then follow the plan entry, not the recipe. An instruction needs a per-meal "how" note (a new field). The person can say "keep this version" and only then does the AI call Recipe's `create_variation` (Recipe's own rule: explicit approval, user words in `user_intent`, provenance `promoted_substitution`); a rule firing never does that on its own. If the rule is later changed or removed, plans already made keep what they had (P6), and later plans use the new rule.

**How it meets avoid.** Avoid always wins (P4, safety first). Reading taken (Q-F20): the avoid check is run on the recipe after the swap as well as before; a swap is not applied if its replacement is something anyone eating avoids, and a swap never lifts an avoid on the original (a rule "pasta to rice" does not rescue a recipe from someone's avoid on pasta). Likes, dislikes and caps are checked on the adjusted recipe, since that is what is cooked.

**How the AI explains it.** One short line whenever it swaps or adds an instruction, saying whose rule it was: "I used sourdough bread instead of the pasta, as you like (your rule)." or "Frozen peas: blanch them first, as the household likes (texture)." The person can say "not this time", which skips it for that meal and stores nothing (Q-F19).

**Not proposed:** quantities. A rule stores no amounts; the AI works out how much sourdough replaces how much pasta (Recipe stores no equivalence, and says reasoning about substitutes is the caller's).

## Open questions (for the owner)

A wrong guess costs a redraw of the Food card and a field name, unless noted.

- **Q-F1. Soft avoids and the avoid reason.** Today an avoid can be soft ("fine as a garnish") and carries a reason (safety or other) that changes how carefully it is treated. F2 says avoid is a hard exclusion. Reading taken: the soft kind becomes a dislike (the mockup does this for coriander), and `reason` stays on avoid because the "ask once before weakening a safety avoid" rule depends on it. Wrong guess: a migration of existing claims.
- **Q-F2. Does a frequency cap take an end date?** F3 gives end dates to likes and dislikes only. Reading taken: no, a cap stands until stopped. "Only once" in F8 is read as a one-time window ("just this once"), which needs a rule shape the owner did not describe: is it a cap of one, or an end date after one occasion?
- **Q-F3. What is counted, and over what time.** Reading taken: meals planned or cooked in the last seven days, per person, for the recipes attached to the category (and, for an ingredient cap, recipes containing it). Rolling seven days or the calendar week? Is "a meal for everyone" counted against each person's cap? Are `per` day and month allowed?
- **Q-F4. Whose rules apply to a shared meal?** A meal for everyone is checked against every person eating it, plus the household's (reading taken). A like for one person and a dislike for another cancel out to no effect (reading taken).
- **Q-F5. Like and dislike weight.** Up or down only (reading taken), or a strength? A like never outweighs an avoid (reading taken).
- **Q-F6. Can the UI create a category, or only change one?** Reading taken: the assistant creates it (F7); the screen can change the cap, take recipes out, clear an end and stop it. Should the screen also offer duration choices ("a week", "two weeks") to set an end, or is saying it to the assistant enough? (F8 forbids date fields, not choices.)
- **Q-F7. A dismissed suggestion.** "Not these" clears the offer in the mockup. Is that remembered so the same recipes are not offered again?
- **Q-F8. What happens to a category when an attached recipe is disabled in Recipe, or the reference no longer resolves?** The mockup shows "Recipe not found in Recipe". Reading proposed: a disabled recipe stays attached and keeps counting; a missing one is shown and can be taken out. Note that recipes are immutable in Recipe today, so a title changes only through a new variation; a live title still matters for status and for variations.
- **Q-F9. Where the recent-meals history lives.** Kitchie has plan entries and cooked meals; Recipe has usage events with times that no tool reads by date. Reading taken: Kitchie checks its own history. A wrong guess costs a Recipe tool.
- **Q-F10. Old "usually" statements, and "fact".** Answered in part by F11: "usually" is now substitutions, which is a different meaning from today's habit ("we usually do pancakes at the weekend"). Reading taken: an existing habit claim is not a substitution and is kept as a **like** with its meal time or day type (the mockup draws pancakes this way), and "fact" is unchanged. Open: is that the right home for habits, and should Option C's list of statements a member may propose (which still says "usually") say substitution instead? A wrong guess costs a migration of existing claims.
- **Q-F11. Ended rules.** The mockup shows one line ("Ended on its own and back to neutral: lamb, 5 Oct") so the person can see what lapsed. The owner did not ask for it; remove it if it is noise.
- **Q-F12. Who may make a household category or rule.** Household food statements are open to any member (D8). Reading taken: the same for categories and caps, with no gate.
- **Q-F13. Can a swap be partial?** Reading taken: a rule swaps the whole ingredient in a recipe. "Half the pasta, half the bread" is said in the moment and not stored. A rule stores no amounts.
- **Q-F14. More than one replacement.** `swap` is a list. Reading taken: any of them is acceptable and the first is preferred (white bread: sourdough, or seeded sourdough). Or are they equal, or "this one, otherwise that one if the first is not in stock"? A wrong guess costs one field.
- **Q-F15. Do rules chain?** Reading taken: no. One pass; a replacement is checked against avoid, dislikes and caps but is not itself matched by another substitution rule, so there are no loops.
- **Q-F16. How wide is a trigger.** "Gluten-based pasta" and "frozen food" name kinds of ingredient, not one word. Reading taken: Kitchie stores the words; the AI decides whether an ingredient line (penne, frozen peas) is one of them, as it does for categories (F7). A wrong guess costs misses or wrong swaps until a reviewable list of matches is added.
- **Q-F17. Conflicts.** Is the order in the proposal right (person over household, then the narrower trigger, then the latest said)?
- **Q-F18. Do cooking instructions belong in this shape?** Proposed: yes, as `instruction` on the same record, so "usually" stays one kind and one list. Alternative: a separate kind such as "How I like it prepared". Wrong guess costs a field and one row word.
- **Q-F19. Explaining and skipping.** One line per swap naming whose rule it was, and "not this time" for one meal that stores nothing. Does the owner want the line every time, or only the first time a rule fires in a plan?
- **Q-F20. Swaps and avoids.** Avoid wins and a swap never lifts one (reading taken, above). Should a swap be allowed to rescue a recipe from a dislike or a cap?
- **Q-F21. Meals for more than one person.** A meal for everyone is checked against every person eating it (Q-F4). Reading taken: for a shared dish the household's rules apply; a rule only some eaters have is mentioned ("Arjan would use sourdough here") rather than changing the shared dish, unless the meal is for that person alone.
- **Q-F22. Keeping a swapped result.** Reading taken: a rule firing never creates a Recipe variation. Only an explicit "keep this version" does (Recipe's rule).
- **Q-F23. Reason as text.** Reading taken: `why` is free text for display, short, never read by logic. If the owner wants the reason to change behaviour (for example "health" outranks "texture"), it would need a closed list.

## Principles this touches

P1 (a person's own rules are theirs; nobody else's proposal becomes final over them; a person's substitution comes before the household's for that person), P4 (an avoid takes effect at once, a swap never lifts one, and a safety avoid still asks once before it is removed), P6 (changing or removing a substitution applies from then on, plans already made keep what they had). F6 and F8 are in the spirit of the closed-vocabulary rule in the knowledge README: the AI works the window out from words, the stored value is a date.

## Mockup: what it does and loads

The Food card in Option B: one row per rule (word, subject, one line of detail, chip Just you or Everyone), opened in place with the person's words, the rule's own controls, and for a category the suggestion and the attached recipes. Sample "today" is 10 October 2026. Substitutions are rows with the word "Substitution" (what used to be "Usually"): frozen food (blanch it first, texture), white bread, gluten-based pasta; opened, a row shows when a recipe has X, the swap or instruction, the reason if any, that it has no end date, and the tier note. Open them from the page's links: a swap, a cooking instruction, yours over the household's (Arjan's white bread over the household's), and a "No substitutions" data choice for the empty state (a line under the list with an example to say). States to open: Spicy (cap, assistant suggestion, three recipes), Spicy noodles (a dislike that ends on 24 October), peanuts (avoid, no end), the household's Deep-fried (a cap), and nothing set. Loads: the same three files as before (`mine-household.css` about 11 KB, `mine-household.js` about 40 KB), no images, no requests; the recipe titles in the mockup are sample data inside the script and stand in for a call to Recipe.
