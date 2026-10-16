# Per-step ingredients: data shape and schema analysis

Owner ask, 16 Oct 2026 (voice): while cooking, show on each step the ingredients that step uses and the amount it uses. This is the analysis he asked for ("how the data shape is going to be, because it's going to be a database schema change"). Verified against `basement-bridge/recipe` at `6dc9a1e` (uat, SCHEMA_VERSION 11), `basement-bridge/kitchie` at `c6a7dbbf` (uat, schema 47), this repo at `27c7920`. Nothing is built and no schema change is made. Mockup: `fragments/cook-step-ingredients/`. Job note: `docs/knowledge/jobs-to-be-done/cook-step-ingredients.md`.

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

## 3. Proposed shape

A step gains an optional `uses` array. Stored inside the step's JSON object (so inside the existing step object, hashed and versioned like the text):

```
step: { text, minutes?, group?, uses?: [ { ing: "i1", amount: 1 | "all" | "rest" | null } ] }
```

- `ing`: the ingredient's item id in the same version. This is the durable key (section 4).
- `amount` is in the ingredient's own unit and its own `per` basis. Never a unit of its own, never converted.
  - a positive number: that much goes in this step (`0.5` allowed: half a breast);
  - `"all"`: the ingredient's whole listed amount (follows later edits to the total);
  - `"rest"`: the listed amount minus the explicit numbers in the other steps (at most one per ingredient);
  - `null`: used here, amount not given (shown by name with "Amount not given").
- `uses` absent = never checked. `uses: []` = checked, no ingredients (a deliberate "let it rest"). The reader treats these differently.
- Basis is not stored per link; a number the assistant read off the step text is the same kind of fact as the step text. Open question 3.

Output: `get_version` already passes stored item fields through (`readShape`), so `content.steps[].uses` appears with no read-side change. Kitchie's sanitiser (`recipe-client.ts`) and `RecipeStep` type gain `uses`.

### Options considered

| | Option | Verdict |
|---|---|---|
| **A (recommended)** | `uses` inside the step object. No DDL, `SCHEMA_VERSION` stays 11, no migration, no backfill. History, undo, rebase, content-addressing all work unchanged. | Chosen |
| B | New table `step_ingredients(version, step, ing, amount)`. It is the "schema change" the owner expected, but it sits outside revisions: links would need their own history, undo and rebase, breaking BR1/BR3/BR14. Migration would be v12. | Rejected |
| C | Links on the ingredient side (`ingredient.steps[]`). Makes the sum check trivial but every step edit or reorder touches ingredients, tagging is per step in practice, and the read is per step. | Rejected |
| A+ | A, plus bump `SCHEMA_VERSION` to 12 with an empty migration, purely so old code refuses the file. | Not recommended: costs a backup-restore rollback for no data need; see rollout. |

So the honest answer to "will it be a database schema change": the database schema does not change; the **content shape** (the JSON inside step objects) does, and the authoring contract and zod schemas do. If the owner wants a hard guard anyway, A+ is a one-line addition.

## 4. Durable key, edits, reorder, versions

- **Key = the ingredient's item id.** It is already stable across edit, reorder, new versions, variations and spin-offs (2.4). No second key is needed. A parallel key would only add a second thing to keep in step.
- **Reorder** (`ing.move`, `step.move`): nothing to do; links name ids, not positions.
- **Edit an ingredient** (`ing.update`, `ing.replace`): id kept, links follow. A swap (pork for chicken) keeps the id and the amounts, which is right when the unit stays the same.
- **Remove an ingredient** (`ing.remove`): the server cascades in the same revision, adding `step.update` ops that drop the dangling links, visible in the diff. Without this, `freshId` reuse would silently attach old links to a new ingredient. Proposal: also mint `max+1` instead of lowest free, so ids are not recycled within a line at all (small, safe change to `freshId` and `assignIds`).
- **Remove a step**: its links go with it (they live in the step).
- **Split or merge steps**: the assistant re-tags in the same call (`step.add` / `step.update` with `uses`).
- **Replace step text** (`step.replace`/`step.text`): warning `uses_maybe_stale` when a step with `uses` changes text and `uses` is not in the same call. Never blocks, never rewrites.
- **New version / variation:** inherits the parent's steps, so their links. Child ops are by id, so a changed ingredient amount or an added ingredient is validated on the resolved child (section 5). A link set is replaced as a whole per step (`step.update set uses`), the same "arrays replaced, not merged" rule as variation metadata; no element-level merge.
- **Revisions, undo, restore, revert:** unchanged. `uses` is part of the step object, so a restore returns links and text together; `revert_change` of one op reverts that op.
- **Rebase:** an ingredient edit (`ing:i1`) and a step links edit (`step:s2`) are disjoint, so they would rebase silently and could break a sum. Rule: re-run link validation on the rebased result; on failure return `stale_base` naming the step ids.
- **Legacy world:** no links; `migrateV5Data` copies steps as they are and never invents links.

## 5. Validation and who tags

**Who tags.** The calling assistant, at save time, in the same call: `create_recipe` (`recipe.steps[].uses`), `import_recipes`, `patch_version` (`step.add` with `uses`, `step.replace`/`step.update` with `uses`). `validate_recipe` runs the same checks (dry run). The server never reads step prose with AI (AGENTS.md: reasoning belongs to the caller). It checks only structure and arithmetic, in `normaliseRecipe` and `prepareInputOps`, on the **final** content of the call (so one call can edit an ingredient and fix the links).

| Rule | Level |
|---|---|
| `ing` must exist in the version | error `invalid` |
| one ingredient at most once per step | error |
| `amount` is a positive finite number, `"all"`, `"rest"` or null; at most 30 links per step | error |
| at most one `"rest"` per ingredient; `"all"` cannot be combined with any other link to the same ingredient | error |
| explicit numbers over all steps exceed the ingredient total (tolerance 0.1%) | error `uses_over_total` naming steps |
| ingredient total unknown or absent: numbers are accepted as stated, no sum check, `"all"`/`"rest"` resolve to unknown | accepted |
| explicit numbers sum below the total with no `"rest"`/`"all"` | warning `uses_partial` (the remainder shows nowhere) |
| ingredient used in no step | warning `ingredient_unused` (garnish, serve-with) |
| some steps tagged, some not | warning `steps_untagged` listing ids |
| step text changed, `uses` unchanged | warning `uses_maybe_stale` |
| a number not read from the step text or source | caller rule: use `null`. Never invent (BR12) |
| step text contains a quantity (number plus a unit, or a counted ingredient: "2 cups flour", "3 cloves") | warning `step_text_quantity` naming the step ids. Proposal, owner-stated rule CSI-21. Durations and temperatures ("10 minutes", "220 degrees") do not count. Never blocks, never rewrites |

**No quantities in step text (owner rule, 17 Oct 2026, CSI-21).** Step text names ingredients without amounts ("add the flour", not "add 2 cups flour"). Any amount a step shows comes only from its `uses` link, which scales with servings exactly like the main ingredient list, so one source of truth and two numbers can never drift apart (a step saying "2 cups" while the strip says "4 cups" at double servings). The rule is prescriptive for the assistant: when it creates or patches a recipe it writes step text without quantities, and quantities live only in `ingredients[]` and in `uses`. Enforcement is guidance plus the soft `step_text_quantity` warning above; the server still never reads prose with AI, so the check is a plain pattern (number followed by a known unit word, or a leading count before an ingredient name). Tool description wording (proposal, for `create_recipe`, `patch_version` and the MCP server instructions): "Write step text without quantities. Say 'add the flour', not 'add 2 cups flour'. Amounts live only in the ingredient list and in each step's `uses` links." **Existing recipes whose steps already contain quantities keep them:** the strip does not rewrite step text, the warning appears only when a step is edited or created, and a backfill pass may offer to remove quantities from a step's words in the same `patch_version` as it adds the link, as a normal undoable revision, never automatically.

**Rounding.** Totals and parts are stored as given (decimals allowed, `0.5`); only Kitchie rounds, for display, with the existing quarter/third rule. Parts are scaled with the same factor as totals, so `"rest"` stays consistent at any serving size. Display rounding may not add up (`⅓ + ⅓ + ⅓`); nothing is adjusted silently.

**Existing recipes without links.** No `uses` on any step: Kitchie shows today's screen, no strip, no hint. Backfill is an assistant pass through `patch_version` (`target: fix`, user intent, dry run first), one recipe at a time, each a normal undoable revision. To find them cheaply, `list_families` rows gain `step_links: "none" | "partial" | "full"` (derived from `head_cache`, no new table). No auto-backfill, no server guess. Partly tagged: strips only on tagged steps; the "still to come" list only when every step is tagged.

## 6. Contract and MCP changes (all optional fields, backward compatible)

- `StepIn` gains `uses` (still `.strict()`; an old client simply never sends it). `OpIn` `step.update.set` gains `uses`; `step.add` and `step.replace` accept it; `step.update.unset` may list `uses`.
- `stepItem` stores `uses` (normalised: sorted keys, numbers as numbers); `ops.ts` generic `patchItem` already carries it; `diffrows.ts` renders a "step links" row.
- Tool and field descriptions (test `mcp-descriptions.test.ts` walks them) and `docs/recipe-authoring-contract.md` sections 2 and 3.4 updated; MCP server instructions get one line: tag each step with the ingredients and amounts it uses, null when unsure, never guess.
- `list_families` gains `step_links`. No change to `get_version`'s envelope.
- `get_resolved_recipe`, `create_variation` (legacy): unchanged, no links.

## 7. Kitchie consumption (read only, deterministic)

- `recipe-client.ts`: parse `uses` with bounds (30 per step, ids matched against the ingredient list, anything unknown dropped, never an error).
- `cook-model.ts`: a pure `stepIngredients(content, step, servings)` using `scaledAmount`: number x factor, `"all"` = scaled total, `"rest"` = scaled total minus the others, null = no amount. Also the later-steps chip data (`"\u2192 step 7"`, `"\u2192 4, 7"`, none on the final use; replaces the earlier "left for step n" sentence, owner decision 17 Oct 2026) and the still-to-come / already-used groups: still to come ordered by the first later step that uses each ingredient, with the remaining amount; already used folded behind a collapsed "Already used (n)" row on the phone. A quantity is omitted entirely when the link has no amount (no placeholder text). Phone: option A callout (name left, quantity right) with a tight/roomy rule (step photo, step text over 160 characters, or viewport height under 600 px caps still-to-come at three behind "+n more"). Desktop: chips inside the step card plus a dock for the two lists (accent for still to come, grey for already used).
- `cook-html.ts` `stepScreen`: adds the strip next to the step words. All step sections are already rendered up front, so no extra request and no AI. Nothing on the ingredients screen, pantry matching, `cook_meal`, end-of-cook or ideas changes.
- Kitchie schema: no change (it stores no recipes). Kitchie `SCHEMA_VERSION` stays 47.

## 8. Rollout, rollback, risks

1. **Recipe first** (uat): contract + validation + `list_families.step_links` + tests; deploy to uat. Because `SCHEMA_VERSION` is unchanged, promoting uat to main migrates nothing in production. Old Recipe code on a database holding links still opens it, returns `uses` untouched, and `.strict()` refuses new `uses` input; the only gap is that old code has no cascade on `ing.remove`, so Kitchie must (and will) ignore a dangling `ing` rather than fail.
2. **Kitchie** (uat) reads and shows: needs the Recipe field to exist, but is harmless without it (no links, no strip).
3. **Platform mode:** confirm platform's proxy passes `get_version` content through untouched (not verified here; it is a proxy of the Recipe routes).
4. **Assistant behaviour:** tagging quality is the whole feature. Mitigation: arithmetic checks, `null` when unsure, warnings, dry run, and the diff row showing links so the person can revert.
5. **Risks:** recycled ids (fixed by cascade and max+1); text edited but links stale (warning only); a rebase that breaks a sum (re-validate); two worlds (#126) so legacy recipes never get links until the alias slice; strip clutter on long lists (callout caps at five, still to come caps at three only when room is tight).

## 9. Test plan

Recipe: zod and normalise unit tests for every row of section 5; `ops` round-trip with `step.update uses`; checkpoint rebuild with links; `ing.remove` cascade and id minting; revert and restore of a links change; rebase breaking a sum; new version inherits links and validates a changed total; `validate_recipe` parity with `create_recipe`; old-code compatibility fixture (a step with `uses` read by the previous build); contract and MCP description tests; `list_families.step_links`. Kitchie: `stepIngredients` pure tests (all, rest, explicit, null, scale 2/4/6, rounding, split text, dangling id, untagged, tagged-empty, partial); HTML test that an untagged recipe renders exactly today's markup; screenshot checks at 360 and 390, light and dark.

## 10. Open questions for the owner

1. Option A (no SQL change, content shape only) or A+ (also bump to schema 12 as a guard)? Cost of A+: rollback needs a backup restore, as with v6 and Kitchie 44.
2. Confirm v6-only: legacy recipes get no links until the alias slice (#126). Cost of a wrong guess: a legacy-only recipe shows no strip.
3. Per-link basis (observed or inferred) like quantities have? Proposal no. Cost: no way to tell a read amount from a guessed one.
4. Backfill: one recipe at a time on request, or a batch pass with one approval? Cost of batch: many revisions the person has not looked at (each undoable).
5. `max+1` id minting: acceptable change to existing behaviour?
6. ~~Mockup choice A, B or C~~: owner chose A on 17 Oct 2026 (phone), with a desktop composition mixing B (chips) and C (dock). Whether "still to come / already used" belongs on the step screen at all is settled for now: yes, still to come in view, already used folded away.
7. Step text without quantities (CSI-21, owner-stated 17 Oct 2026): confirmed as a rule. Open: should the warning `step_text_quantity` ever become an error? Proposal no.
