# Per-step ingredients: data shape and schema analysis

Owner ask, 16 Oct 2026 (voice): while cooking, show on each step the ingredients that step uses and the amount it uses. This is the analysis he asked for ("how the data shape is going to be, because it's going to be a database schema change"). Verified against `basement-bridge/recipe` at `6dc9a1e` (uat, SCHEMA_VERSION 11), `basement-bridge/kitchie` at `c6a7dbbf` (uat, schema 47), this repo at `27c7920`. Nothing is built and no schema change is made. Revised 17 Oct 2026 for the owner's voice decisions (section 0). Mockup: `fragments/cook-step-ingredients/`. Job note: `docs/knowledge/jobs-to-be-done/cook-step-ingredients.md`.

## 0. Owner decisions, 17 Oct 2026 (voice) and the one design

1. **No backfill.** A recipe with no per-step links shows the plain full ingredient list as today: no callout, no error, no hint. Backward compatibility matters. Links are written only going forward, at create or edit time.
2. **Tagging is always AI-derived** (the calling assistant, never manual entry), so there is no "read from text or inferred" flag on a link. In one pass at save time the assistant supplies, per step, which ingredient id(s) and what quantity that step uses. It does **not** declare a split; the reader (the cooking view, or any `get_version` consumer) groups links by ingredient id across steps to find splits and compute "rest at step N".
3. **Open, not decided:** Q1 (A or A+) and Q4 (id minting), section 10. Both have a recommendation; neither is resolved.
4. **Step text carries no quantities** (CSI-21). Amounts come only from per-step links and scale with servings like the ingredient list.
5. **Is this NoSQL? No.** It is not a database-engine change. Recipe content is already JSON documents inside SQLite (content-addressed `objects` plus `revisions`); the new field lives inside the step's JSON, so there is no new table, column or engine.

**The design in ten lines.** (1) `steps[].uses?: [{ing, amount}]`, stored inside the step object. (2) `ing` = ingredient item id. (3) `amount` = number | `"all"` | `"rest"` | `null`, in the ingredient's own unit and `per` basis, never converted. (4) Absent `uses` = untagged (plain list); `[]` = checked, uses nothing. (5) Scaling: Kitchie multiplies the number by the same factor as the ingredient (`scaledAmount`), so a step amount is always the same share of the scaled total. (6) Validation on the final content of each write: structural and arithmetic errors, advisory warnings, no AI on the server. (7) The write tools take `uses` as an optional field, so old callers work. (8) `get_version` already passes it through; no server-side `split` view, the consumer groups by id. (9) `ing.remove` cascades link removal; step edits warn when text changes without links. (10) Links exist in the v6 store only; no schema change, no migration, no backfill, `SCHEMA_VERSION` stays 11.

## 1. Prior art check

Searched issues, PRs and branches of recipe, kitchie and mockup for step, ingredient, cooking. Nothing covers per-step ingredients. Related only: recipe#123 (draft recipes), kitchie#560 (cook mode, built: ingredients screen then one step per screen, no link between them), recipe#126 (see 2.6).

## 2. The current shape, as verified

1. **No link exists today.** A step is `{id, text, minutes?, group?}`; an ingredient is `{id, name, quantity?, unit?, prep_note?, optional?, group?}` (`server/src/authoring/normalise.ts` `stepItem`, `ingredientItem`; `schemas.ts` `StepIn` and `IngredientIn` are `.strict()`). The earlier voice claim is confirmed.
2. **Storage is schemaless JSON, not columns.** Since schema v6 (ADR `docs/adr/revisions-storage.md`) a version's content lives in content-addressed `objects` rows (`kind` ingredient / step / tree, sha256 of canonical JSON). A tree is two ordered lists of `[item id, object hash]`. Revisions (`revisions.change_set`) store ops by item id; every 10th revision also stores the whole tree. `head_cache.resolved_json` is derived and safe to drop. A new field inside a step object needs no SQL change. `schema.ts` is at `SCHEMA_VERSION = 11`; `migrate()` throws if the file is newer than the code.
3. **Ids.** Ingredient `i1, i2...` and step `s1, s2...` are minted by the server per version when the caller omits them (`assignIds`, and `freshId` for `ing.add`/`step.add`), or the caller supplies them (1 to 64 of `A-Za-z0-9_.-`). Version ids are `ver_<uuid>`, families `fam_<uuid>`. **`freshId` picks the lowest free number, so removing `i2` and adding a new ingredient reuses `i2`.** That is the one hazard for links (section 4).
4. **Ids are already the durable key.** The item id is the tree's key ("the same line"); an edit changes the object hash and keeps the id; reorder is `ing.move`/`step.move`; a new version pins its parent's head and inherits ids; step photos are already keyed by step id (`photos-contract.md`). Ids never change after creation (`ing.update` refuses `id`).
5. **Kitchie does not match inventory by id.** Pantry matching is by name (`recipe-tab/pantry.ts` `bestItem(name, ...)`, `pantryLines`); `what_am_i_missing` / `what_can_i_cook` (`recipe/server/src/cross/advisor.ts`) judge ingredient names against Kitchie stock. The id is only the line's identity inside Recipe. Kitchie stores no recipes at all: it reads `get_version` through `recipe-tab/recipe-client.ts` (a bounded sanitiser that whitelists fields, so a new field must be added there).
6. **Two worlds still live (Q39, recipe#126).** The new tools (`create_recipe` new form, `patch_version`, `validate_recipe`, `get_version`, `get_family`) write the v6 store. The legacy tools (`create_variation`, `get_variation`, `get_resolved_recipe`, `get_recipe`, `list_recipes`, `what_can_i_cook`, `what_am_i_missing`) still read the v5 tables `recipes` and `variations` (`ingredients_json`, `steps_json`, `changes_json`). The legacy `StepSchema` is a non-strict zod object, so it would strip a new field. Per-step links are therefore a v6-only feature; legacy rows get none. The voice description named `create_variation` and `get_resolved_recipe`; the live equivalents are `patch_version` (target `new_version` or `spin_off`) and `get_version`.
7. **Variations in v6** are versions: a version has a pinned parent revision and a line of revisions, each a small op list by item id (`ing.add/update/move/remove`, `step.add/update/text/move/remove`, ...). The legacy sparse change set has 7 ops (`replace_ingredient`, `add_ingredient`, `remove_ingredient`, `replace_step`, `add_step`, `remove_step`, `set_field`) applied by `resolve.ts`.
8. **Immutability and undo.** Triggers abort UPDATE and DELETE on revisions and objects. Undo, restore and revert are new revisions (BR18). A save names its base revision; disjoint item ids rebase, overlapping ones fail `stale_base` (BR6); conflict keys are `ing:<id>` and `step:<id>`.
9. **Where scaling happens.** Kitchie only: `cook-model.ts` `scaledAmount(ingredient, cookServes, recipeServes)`: factor is cook servings over recipe servings, or cook servings when `quantity.per = "serving"`; fractions to quarters and thirds. Recipe never scales. Nutrition is stored per serving as observations, never computed from ingredients, so per-step amounts do not touch it.
10. **Unknown amounts.** `quantity: {value: null, basis: "unknown"}` or absent. There is no "to taste" value; it is an unknown amount. The stored unit sits on the ingredient (`unit`), `quantity` keeps `value`, `basis`, `per`, `range_max`.
11. **Cook view today.** Ingredients screen first (checklist, scaled amounts, missing tags), then one screen per step showing only the step words (plus a timer). Kitchie renders every step section on the server and shows one, so moving between steps makes no request.

## 3. Shape (final)

A step gains an optional `uses`, stored inside the step's JSON object (hashed and versioned with the text):

```
step: { text, minutes?, group?, uses?: [ { ing: "i1", amount: 2 | "all" | "rest" | null } ] }
```

| Field | Type | Meaning |
|---|---|---|
| `ing` | string | the ingredient's item id in the same version; the durable key (section 4) |
| `amount` | positive finite number | this step uses that much, in the **ingredient's own unit and `per` basis** (`2` of `3` eggs; `1` of `2` cups) |
| | `"all"` | the whole listed amount (follows later edits to the total) |
| | `"rest"` | the listed amount minus the explicit numbers of the other steps; at most one per ingredient |
| | `null` | used here, amount not given |

How each case is represented, nothing invented:
- **No unit** (3 eggs): the ingredient has no `unit`; `amount` is a count of the same thing. A link never has a unit of its own, so units cannot disagree and are never converted.
- **"To taste", "as needed", unreadable:** the ingredient's quantity is unknown (`{value: null, basis: "unknown"}`), and the link is `amount: null`. The assistant writes a number only if the step source states one.
- **Unknown total, number stated:** accepted as stated (warning `uses_amount_without_total`, no sum check; `"all"`/`"rest"` resolve to unknown).
- **Range ingredient** (`range_max`): numbers refer to the low end `value`; no sum check against `range_max`.
- **Absent vs empty:** `uses` absent = never tagged (untagged recipe, plain list, no error); `[]` = checked, uses nothing (a rest or wait step).

**Scaling decision: store the number, scale it with the ingredient's factor.** Kitchie multiplies each link number by exactly the factor it uses for the ingredient (`cookServes / recipeServes`, or `cookServes` when `per = "serving"`), through the same `scaledAmount` rounding. That equals taking a fixed share of the scaled total, so a step amount can never drift from the list. A stored fraction/share was rejected: it is awkward for the assistant to write (0.6667), it hides the amount people actually read in a recipe ("2 of 3 eggs"), and it makes rounding worse. Sum rules (stored values, before scaling): explicit numbers of one ingredient across steps must not exceed the total (0.1% tolerance for decimals); `rest` = total - explicit sum and must be above zero; `all` stands alone. After scaling, only the display is rounded (quarters and thirds); `rest` is computed from unrounded values and then rounded, so displayed parts may be a quarter off the displayed total, and nothing is adjusted silently.

**Split detection is the reader's job.** The assistant just lists, per step, the ingredient and its amount. The reader groups all links by `ing` across steps: more than one step means a split; the "->" chips, "still to come" and "rest at step N" are computed from that grouping. No `split` flag is stored.

### Options considered

| | Option | Verdict |
|---|---|---|
| **A (recommended)** | `uses` inside the step object. No DDL, `SCHEMA_VERSION` stays 11, no migration. History, undo, rebase, content-addressing work unchanged. | Chosen |
| B | New table `step_ingredients`. Sits outside revisions (own history, undo, rebase; breaks BR1/BR3/BR14); would be schema 12. | Rejected |
| C | Links on the ingredient (`ingredient.steps[]`). Every step edit touches ingredients; read is per step. | Rejected |
| A+ | A plus an empty schema-12 bump as a rollback guard. | Open, Q1 |

## 4. Durable key, edits, reorder, versions, variations

- **Key = the ingredient's item id**, already stable across edit, reorder, new versions and spin-offs (2.4).
- **Reorder** (`ing.move`, `step.move`): nothing to do; links name ids.
- **Edit an ingredient** (`ing.update`): id kept, links follow. A swap (pork for chicken) keeps id and amounts, right when the unit is the same. If the total changes, the sum check runs on the final content (partial/over warnings or errors).
- **Remove an ingredient** (`ing.remove`): the server cascades in the same revision, adding `step.update` ops that drop that id from every step's `uses` (visible in the diff, undone with the removal). **Remove a step:** its links go with it.
- **Step text changed, `uses` unchanged:** warning `uses_maybe_stale` (never blocks, never rewrites). `step.text` and `step.update` keep unrelated fields (generic `patchItem` merges, `ops.ts:56`).
- **A step's `uses` is replaced whole** (`step.update set uses`), the same "arrays replaced, not merged" rule as variation metadata. No element-level edit.
- **Variations and versions (v6).** A variation is a version with a pinned parent revision and its own op line, so it **inherits the parent's steps and therefore its links**, and any op it applies is by id. A child that changes an ingredient amount or adds an ingredient is validated on the resolved child; the assistant fixes the links in the same call. A child that adds an ingredient adds links to its steps (`step.update set uses`) or leaves it untagged (warning `ingredient_unused`).
- **Revisions, undo, restore, revert:** unchanged and immutable. `uses` is part of the step object, so restore returns text and links together; `revert_change` of one op reverts that op.
- **Rebase:** an ingredient edit (`ing:i1`) and a links edit (`step:s2`) are disjoint, so they rebase silently and could break a sum. Rule: re-run link validation on the rebased result; on failure return `stale_base` naming the step ids.
- **The two data worlds (recipe#126):** links are **v6-only**. Legacy tools (`create_variation`, `get_variation`, `get_resolved_recipe`, `get_recipe`) read the v5 tables, whose non-strict `StepSchema` would strip `uses`; they stay unchanged, return no links, and `create_variation` is still live (legacy) with no `uses` input. `migrateV5Data` copies steps as they are and never invents links. Result: a legacy-only recipe shows the plain list.

## 5. MCP tool contract

**Who tags.** The calling assistant, in the same call that creates or edits the steps. The server never reads prose with AI (AGENTS.md); it checks structure and arithmetic only, in `normaliseRecipe` and `prepareInputOps`, on the **final** content of the call.

| Tool | Change |
|---|---|
| `create_recipe`, `import_recipes` | `recipe.steps[].uses` optional (`StepIn` stays `.strict()`; old callers never send it) |
| `patch_version` (`new_version` and `spin_off`) | `step.add` takes `uses`; `step.update set.uses` / `unset: ["uses"]`; `step.replace` accepts it. Same validation on the final content |
| `validate_recipe` | same checks as `create_recipe` (dry run), returns the same errors and warnings |
| `create_variation` (legacy, v5) | unchanged, no links |
| `get_version`, `get_family` | no change; `readShape` spreads item fields, so `content.steps[].uses` appears (verified, `revisions/content.ts` `toResolvedJson`) |
| `get_resolved_recipe` (legacy) | unchanged, no links |
| `list_families` | **no `step_links` field.** It existed only to drive a backfill; with no backfill it is dropped. Can be added later if wanted |

**Read side.** Return the stored `uses` raw; **no server-side `split` view** (recommended). Recipe never scales and does not render; the grouping depends on servings and the current step, so it belongs in Kitchie's pure `stepIngredients`, where it is tested once. Any other `get_version` consumer groups by `ing` the same way (one paragraph in the authoring contract).

**Validation.** Errors block the save; warnings are returned and never block. No silent guessing, no rewriting.

| Rule | Level |
|---|---|
| `ing` not an ingredient id in the version | error `invalid` |
| same ingredient twice in one step | error `invalid` |
| `amount` not a positive finite number, `"all"`, `"rest"` or null; more than 30 links in a step | error `invalid` |
| two `"rest"` for one ingredient; `"all"` combined with another link to it; `"rest"` with nothing left | error `invalid` |
| explicit numbers across steps exceed the total (0.1%) | error `uses_over_total`, names the steps |
| number given when the ingredient total is unknown | warning `uses_amount_without_total` |
| numbers sum below the total with no `rest`/`all` | warning `uses_partial` |
| ingredient used in no step | warning `ingredient_unused` (garnish, serve with) |
| some steps tagged, some not | warning `steps_untagged`, lists ids |
| step text changed, `uses` unchanged | warning `uses_maybe_stale` |
| step text has a number plus a unit or a counted ingredient ("2 cups flour", "3 cloves"; durations and temperatures excluded) | warning `step_text_quantity`, names the steps. Plain pattern, never blocks, never rewrites |

**Wording (tool descriptions of `create_recipe`, `import_recipes`, `patch_version`, `validate_recipe`, and the MCP server instructions).** One block, same text everywhere: "For every step, list in `uses` the ingredient ids that step uses and the amount it uses, in the ingredient's own unit. Use `\"all\"` for the whole amount, `\"rest\"` for what is left, `null` when the amount is not stated or the ingredient is 'to taste'. Never guess an amount and never convert units. Write step text without quantities: say 'add the flour', not 'add 2 cups flour'; amounts live only in the ingredient list and in `uses`." Applied to the field descriptions too (the `mcp-descriptions.test.ts` walk covers them). **Existing recipes with quantities in step text keep them**; the rule applies to text the assistant writes from now on.

## 6. Kitchie side

- **Pass-through.** `recipe-client.ts` is a field-whitelisting sanitiser, so it must read `steps[].uses` explicitly (bounded: 30 per step; `ing` matched against the ingredient list; unknown ids dropped, never an error; `amount` accepted only as a positive number, `"all"`, `"rest"` or null, anything else treated as null). The `RecipeStep` type gains `uses`. Nothing else is whitelisted by accident.
- **Cooking view.** `cook-model.ts` gets a pure `stepIngredients(content, step, servings)`: groups links by `ing` across steps, then number x factor, `all` = scaled total, `rest` = scaled total minus the others, null = no amount (nothing shown on the right, no placeholder). It returns this step's lines, the chips (`-> step 7`, none on the final use), still-to-come and already-used groups as in the mockup.
- **No links, no change.** A recipe with no `uses` anywhere renders exactly today's markup. No callout, no hint, no error. Half tagged: strips only on tagged steps, no still-to-come list.
- **Platform mode.** Verified read-only in `basement-bridge/platform`: it issues tokens and routes by path prefix (`recipe-uat` with `strip_prefix`); it does not parse or rewrite MCP tool payloads, and no platform code references `get_version`. Kitchie reads Recipe with the member's token directly, so `uses` reaches Kitchie unchanged. Re-check by one live `get_version` on uat once built.
- No Kitchie schema change (`SCHEMA_VERSION` stays 47), no new request, no AI at read time.

## 7. Compatibility matrix

| Case | Result |
|---|---|
| Old recipe (no `uses`), new Recipe | unchanged; no warnings except those about steps the call touches |
| Old recipe, new Kitchie | plain list, today's markup |
| New recipe (has `uses`), old Recipe build | reads and returns `uses` untouched; `step.text` and `step.update` preserve it (`patchItem` merges); new `uses` input refused by `.strict()`; `ing.remove` has no cascade, so a dangling `ing` may remain (Kitchie drops it) |
| New recipe, old Kitchie | the whitelist drops `uses`; plain list |
| Old Kitchie, new Recipe | same as above |
| Legacy-only (v5) recipe | no links, plain list |

**Rollout.** (1) Recipe to uat (contract, validation, cascade, tool descriptions, tests). Promotion to main migrates nothing. (2) Kitchie to uat (reads; harmless without links). (3) Verify platform passthrough with one live `get_version`. (4) New and edited recipes then carry links as the assistant writes them. Rollback: either side can be reverted alone; with A no restore is needed.

## 8. Risks

Tagging quality is the whole feature: mitigated by arithmetic checks, `null` when unsure, warnings, dry run, and the diff row showing links so the person can revert. Id reuse (Q4). Text edited, links stale (warning only). A rebase breaking a sum (re-validate). Two worlds (legacy gets none). Strip clutter on long lists (the mockup caps and folds). A recipe whose steps still hold quantities and whose strip shows a different number (only when old text is kept; the warning is the nudge).

## 9. Test plan

Recipe: normalise/zod tests for every row of section 5; `ops` round trip with `step.update uses`; checkpoint rebuild with links; `ing.remove` cascade; id minting (per Q4); revert and restore of a links change; rebase breaking a sum; new version inherits links and validates a changed total; `validate_recipe` parity with `create_recipe`; old-build fixture (a step with `uses` read, text-edited and replaced by the previous build); contract and description tests; untagged recipe fixture unchanged byte for byte. Kitchie: `stepIngredients` pure tests (all, rest, explicit, null, no unit, scale 2/4/6, per serving, rounding, split, dangling id, untagged, tagged-empty, partial); untagged recipe renders today's markup; sanitiser drops bad `uses`; screenshots at 360 and 390, light and dark.

## 10. Open questions for the owner

**Q1 (open). Option A (no SQL change) or A+ (empty schema-12 bump as a rollback guard)?** Re-verified with no backfill: **A still holds.** Nothing writes to existing recipes on deploy, promotion migrates nothing, and old Recipe code opening a database with links reads them, keeps them through text edits, and only refuses new `uses` input. A+ would make old code refuse the file, but old code is harmless on it, and a rollback would then need a backup restore (as with v6 and Kitchie 44). **Recommendation: A.**

**Q4 (open, not answered by the owner). How are new ingredient ids minted?** Today `freshId` takes the lowest free number, so removing `i2` and adding an ingredient recycles `i2`. With the cascade, links inside one version cannot go to the wrong ingredient. The remaining hazard is a stale or concurrent writer (an assistant still holding `i2` from an earlier read, or a rebase) whose link to `i2` now silently names a different ingredient, and history rows that read "i2" with two meanings. Options:
- (a) keep lowest-free plus cascade: zero change; hazard above stays;
- (b) highest existing + 1 (the owner's phrasing): small change to `freshId`/`assignIds`; but removing the **highest** id and adding one still reuses it;
- (c) highest id ever used in that version's revision history + 1: closes the gap fully, no schema change (ids are already in the ops), costs one scan of op ids per `ing.add`.
**Recommendation: (c)**, or (b) if (c) proves costly. Not resolved here; existing ids never change either way.

Closed: Q2 v6-only (confirmed by the owner's no-backfill rule, legacy recipes get none). Q3 per-link basis: no (decision 2, always assistant-derived). Backfill question: dropped (decision 1). Mockup choice: option A, desktop mix (17 Oct). Step text without quantities: rule confirmed; `step_text_quantity` stays a warning, never an error.
