# Food preferences: ingredient rules, category rules, end dates and frequency limits

Status: owner direction by voice, 10 October 2026 (review of the preferences mockups). Option B (`option-b-mine-and-household.md`) is the chosen direction. The statements F1 to F10 below are what the owner said clearly and are **recorded as decided**. The data shape and the operations are a **proposal awaiting approval**, and the unclear points are open questions Q-F1 and on. Mockup: the Food card of `fragments/preferences-mine-household/` (Option B only; Option A is unchanged).

Numbering: this file has its own series. **F1 to F10 are food decisions, not the data-model facts F1 to F10 in Option B's notes.** Cite them as "food F3" when both are near. Open questions are Q-F1, Q-F2, ... and are separate from Option B's Q1 to Q7 and the D series (D1 to D19 are decisions about stock checks, household editing and proposals).

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

## What the code holds today (read only, 10 October 2026)

Checked on the default branches of `basement-bridge/kitchie` and `basement-bridge/recipe`. Option B's notes carry the same facts under "Food statements, today and what would change".

- **Kitchie** (`context.ts`, `context-mcp.ts`, `store.ts`). One table, `context_claims`: member (null = household), `statement` (likes, dislikes, avoids, usually, fact, and `stop`), `subject` plus a normalised `subject_key` (word match), `about_type` (item, ingredient, recipe, cuisine, other), `severity` (hard or soft, avoids only), `reason` (safety or other, avoids only), `rationale`, optional `meal_time` and `day_type`, the person's `said` words, `support`, `status` (active or retired). Tools: `get_context` (reads; avoids always returned; `do_not_suggest` lists the stops) and `give_feedback` (writes; a stop is `rejected` with `stop: true`). Weakening a safety avoid needs one confirmation. Personal link only, no web page.
- **No end date, no frequency, no recipe link.** Nothing expires. A claim names a subject by words only; it cannot hold recipes. The planner (`plan.ts`: `plan_entries` with date, title, `recipe_id`, ingredients as words, who it is for) does not read claims at all today; the AI reads `get_context` and is trusted to respect it. `plan_entries` and (for cooked meals) `cook_meal` are where "recent meals" would be read.
- **Recipe** (`schema.ts`, `domain.ts`, `preferences.ts`). Recipes and variations are immutable and household-scoped; only `status` (active or disabled) changes. Metadata holds `cuisine`, `flavour`, `primary_protein` and free `tags`. A recipe is addressed by (`kind`: recipe or variation, `id`). `search_recipes` finds by text. Recipe stores no per-person food statement, only one household-wide star, vote and usage count per recipe (`times_used`, `last_used`); the journal (`events`) holds each use with a time but no tool reads it by date. Recipe's own rules say the caller does the reasoning (substitutes, matching, planning).

## What the code would change (not built)

Kitchie only; Recipe changes nothing unless Q-F9 is answered the other way.

- Replace the `stop` statement by `avoids` (reason other) and migrate the existing stops; `severity soft` has no place under F2 (Q-F1).
- Add to a claim: a `rule` (the four of F3 to F5), `ends_on` (like and dislike only, F3), a cap (`max`, `per`), and a category kind with attached recipe references. A new small table `food_rule_recipes (rule_id, recipe_kind, recipe_id)`; no title column (F6).
- Lapse on read: a rule past `ends_on` is ignored, and a sweep marks it `lapsed` so history stays.
- One service module (`FoodRules`) behind `InventoryPort`, as plan and stock checks already are, so the web routes and the MCP tools cannot disagree.
- Make the planner (and `plan_meal`) call `evaluate` before it accepts a recipe, so exclusion does not rest on the AI remembering.
- Web: a Food card on Preferences (drawn in Option B). Today there is no page.

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
- **Q-F10. "Usually" and "fact".** The owner did not mention them. Reading taken: unchanged. Does "we usually do pancakes at the weekend" become a like with a cap, or stay as it is?
- **Q-F11. Ended rules.** The mockup shows one line ("Ended on its own and back to neutral: lamb, 5 Oct") so the person can see what lapsed. The owner did not ask for it; remove it if it is noise.
- **Q-F12. Who may make a household category or rule.** Household food statements are open to any member (D8). Reading taken: the same for categories and caps, with no gate.

## Principles this touches

P1 (a person's own rules are theirs; nobody else's proposal becomes final over them), P2 (no gate at either level for now), P4 (an avoid takes effect at once, and a safety avoid still asks once before it is removed). F6 and F8 are in the spirit of the closed-vocabulary rule in the knowledge README: the AI works the window out from words, the stored value is a date.

## Mockup: what it does and loads

The Food card in Option B: one row per rule (word, subject, one line of detail, chip Just you or Everyone), opened in place with the person's words, the rule's own controls, and for a category the suggestion and the attached recipes. Sample "today" is 10 October 2026. States to open: Spicy (cap, assistant suggestion, three recipes), Spicy noodles (a dislike that ends on 24 October), peanuts (avoid, no end), the household's Deep-fried (a cap), and nothing set. Loads: the same three files as before (`mine-household.css` about 11 KB, `mine-household.js` about 40 KB), no images, no requests; the recipe titles in the mockup are sample data inside the script and stand in for a call to Recipe.
