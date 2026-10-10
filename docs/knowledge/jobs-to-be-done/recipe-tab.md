# Recipe tab

Status: drafted 10 October 2026 by four parallel agents, one slice each. Every section below is a **Proposal** until the owner says otherwise. Each slice keeps its own heading; append yours, do not edit another's.

Owner's brief (10 October 2026, paraphrased): a dedicated Recipe tab experience for Kitchie. Recipe is a separate service (MCP and API); Kitchie is the only UI. Kitchie renders recipes; information Recipe cannot read or write yet must be solved in Recipe, and Kitchie renders it. Today tapping a recipe idea shows only ingredients. Kitchie's other tabs (Plan, Pantry, Shopping) set the design language: reuse it. Screen space on list screens is precious: every control must earn its place.

---

## Slice: the end-to-end Recipe tab flow

Mockup: [`recipe/`](../../../recipe/index.html) (index, `list.html`, `detail.html`, `add.html`, `review.html`, `edit.html`, `cook.html`, shared `recipe.css`, `recipe.js`, `plan-sheet.js`).

### Job

Anyone arriving in recipe land: find a recipe, see what it needs against the pantry, plan it, cook it, add a new one (by hand or via the assistant), change it as a new version, move between versions. Four personas drive what leads:

- **Weeknight cook** (sample: Sam): dinner in 30 minutes from what is in. Leads with Ready now and time.
- **Batch cooker** (Priya): cooks big, freezes portions. Starts on the Batch chip; servings step in whole batches; the end of a cook offers to put portions in the freezer.
- **Improviser** (Alex): changes things as they go. Swaps tonight are not saved unless they say so; Change it and versions are close at hand.
- **Household member who only follows** (Jane): cooks what someone else planned. Tonight's meal leads; no Plan, Change it or drafts.

### How we know the person is in this job

They tapped the Recipes tab, a recipe idea on Home, or a meal on Plan. The persona is not detected: it is the mockup's switch. For the build, signals already exist: a member who never plans and only opens planned meals behaves as a follower; a household with batch-tagged recipes and freezer portions suggests the batch cooker. Do not build a persona setting; let the screens serve all four at once (Proposal).

### What leads

- The list: what you can cook now (fewest missing first), then what you have not cooked for a while.
- The recipe page: the ingredients, with what is in and what is missing, sized by Serves. Then the method.
- Cook it: the ingredients first, then one step per screen (cooking-right-now.md).

### What this job does not need

Where things are stored in the kitchen, use-by dates, stock levels beyond in or missing, nutrition (not drawn; another decision), the plan grid itself (Plan owns it).

### Decisions (all Proposal, R-D numbering)

1. **R-D1 The tab opens on the list.** No dashboard above it. Ideas live on Home (cooking-ideas pane, another slice).
2. **R-D2 Tab bar: Plan, Pantry, Recipes, Shopping.** Same bar component as the household flow. Open, see option 6.
3. **R-D3 Kitchie renders, Recipe owns.** Every value comes from a Recipe tool or from Kitchie's own plan and stock. Missing capability is listed under Recipe-side gaps, not faked in Kitchie.
4. **R-D4 One top row on the list: search and Add.** No heading. Search matches names and ingredients.
5. **R-D5 One chip strip, the plan-week-ai strip (its decision 48):** All, Ready now, Starred, Batch, Under 30, Added by me. Tap the chosen chip again for All. Remembered per person in localStorage (`rcp-chip-<persona>` in the mockup). The batch cooker starts on Batch.
6. **R-D6 Swipe a list row right to plan it** (opens the day picker). No swipe left: Recipe never deletes.
7. **R-D7 Recipe page layout:** option 2 (A one scroll with a sticky jump row; B tabs).
8. **R-D8 The follower:** option 5 (A tonight leads; B straight to cook). Either way no Plan, Change it or drafts line; star, notes and photos stay.
9. **R-D9 Photos only when there are photos.** Hero swipes sideways with dots; no photo means no hero and no placeholder. Step pictures only when the recipe has them.
10. **R-D10 Serves is the quantity control.** Scales every amount (plan-week-ai decision 10). Batch recipes step in whole batches. An unknown amount stays "amount?" at every size.
11. **R-D11 Two actions at the bottom: Cook it (leads) and Plan it.** Star in the top row. In ⋯: Change it, Make this version the default, Ask your assistant about it (opens the person's default AI app, plan-week-ai decision 45), Where it came from, Put away.
12. **R-D12 Assistant drafts wait in one slim line at the top of the list.** Never a pop-up, never on Home. Needs gap G3.
13. **R-D13 Adding:** option 4 (A one box; B four doors). Ask your assistant opens the person's own AI app (plan-week-ai decision 42: no in-app agent); its result comes back as a draft.
14. **R-D14 One Check it screen for every new recipe.** Badge says where it came from. Plain = read from the source; *guess* = inferred; *?* = the source did not say, saved as unknown (Recipe `basis`: observed, inferred, unknown). Never invented.
15. **R-D15 Save is one tap.** The other button is Not now for an assistant draft (stays a draft) and Discard for your own.
16. **R-D16 Changing a recipe always makes a new version.** Said before you start; changes are counted; only what changed is saved (Recipe variation change set).
17. **R-D17 A new version is named from its change**; the optional "why keep it" is stored as the person's words (`user_intent`). Default for the household is a separate explicit tick.
18. **R-D18 Cook it opens on the ingredients,** then one step per screen with its timer. Tap to tick; press and hold to say you used something else tonight.
19. **R-D19 The end of a cook asks once:** what leaves the pantry; for a batch, portions to the freezer; only if something was swapped, Just tonight or Keep it as a version (asks for their words; Recipe rejects a version without them). Optional photo or line into Cooked.
20. **R-D20 Versions:** option 3 (A chip and sheet; B strip). Changed rows are tinted; what they replaced is struck through in brackets (plan-week-ai decision 30).
21. **R-D21 A likely duplicate is shown, never merged:** Open that one, Save as a version of it, Keep both (`potential_duplicates`).
22. **R-D22 Missing items:** a cart icon per row, "Add all N missing to shopping", and the hint "Talk to your assistant about substitutes" (plan-week-ai decisions 11 and 29).
23. **R-D23 Hold shows only when the recipe is planned,** beside the Ingredients heading, "Held for Tue" (plan-week-ai decisions 9 and 33). On by default in the day picker.
24. **R-D24 Notes are the household's, on the recipe, on every version.** A note never changes the recipe. Needs gap G1.
25. **R-D25 Put away, not delete** (Recipe disabled status).
26. **R-D26 Cooked is a short history:** date, who, version, their line, the night's photo. Needs gap G2.
27. **R-D27 List order:** fewest missing first, then longest since cooked. Pills are symbol plus number: all in, N missing, starred, freezes, versions.
28. **R-D28 The day picker** shows this week (Monday first) with what is planned, past days greyed, usual day off marked, up to four weeks ahead (plan-week-ai decision 1). A day that already has a meal gets a second meal; nothing is replaced.

### Options awaiting yay, nay or combine

| # | Question | A | B | C | Recommended |
|---|---|---|---|---|---|
| 1 | The list | One ranked list | Shelves (Ready now, Not cooked lately, A to Z) | Photo grid | A |
| 2 | Recipe page | One scroll, sticky jump row | Tabs on the same row | – | A |
| 3 | Versions | Chip in the meta row, tree in a sheet | Strip under the title | – | A |
| 4 | Adding | One box (paste, type, link; camera and mic on it) | Four doors | – | A |
| 5 | Follower | Tonight leads, opens the recipe | Tonight opens cook mode | – | A |
| 6 | Tab bar | Plan, Pantry, Recipes, Shopping | Home first, Plan inside Home | – | owner |

### Recipe-side gaps (solve in Recipe; Kitchie renders)

- **G1 Notes:** append-only note list per recipe family (text, member, when).
- **G2 Cook history:** one entry per cook (when, member, recipe or variation id, servings, optional line, optional photo ref). Today `record_usage` keeps only a count and last date.
- **G3 Drafts:** a draft status that lists, search and ideas skip, so the assistant writes once and a person confirms. Today only active and disabled.
- **G4 Household default version** per family.
- **G5 Added by:** a member id, not only free text in `source.description`.
- **G6 Step minutes:** optional per step, never invented, to drive timers.
- **G7 Photos:** dish, step and cook photos (photo-storage slice).
- **G8 Reading a photo or link:** Recipe has no parser; the reading is the AI's. Open: which side runs it and how Kitchie hands it the photo or link.
- **G9 Batch facts:** agree closed tag words for freezes and portions (closed vocabulary where logic acts).

### Open questions

- Tab bar order (option 6). Wrong guess costs every tab's bar.
- G3: draft status in Recipe, or held in Kitchie until saved? Wrong guess: a migration.
- G8: who reads photos and links. Wrong guess: Add promises something nothing does.
- Can a follower change a recipe, or only add notes? Mockup: notes only.
- Should Ready now treat items held for another meal as unavailable? Mockup: no.
- Does Put away need agreement in a household with admins (preferences D25 to D30)?

### For the implementation

- Default path loads the list only: theme, `recipe.css`, one shared script. Day picker, version tree, note and photo sheets are built on tap; Add, Check it, Change it and Cook are separate routes. On the recipe page load the first photo only; Cooked and Photos below the fold can be fetched as they near the viewport.
- Class names (`.rr`, `.ing`, `.strip`, `.act`, `.sheet`, `.serves`) and tokens are meant to be lifted. Sample names are only in `recipe/recipe.js`.
- Recipe tools used: `list_recipes` / `search_recipes` (list), `get_resolved_recipe` and `list_variations` / `get_lineage` (page and versions), `what_am_i_missing` (pantry dots), `create_recipe` with `basis` and `potential_duplicates` (Check it), `create_variation` with `user_intent` (Change it, end of cook), `record_usage` (end of cook), `set_preference` (star), `set_recipe_status` (Put away). Plan entries, holds and shopping belong to Kitchie.
