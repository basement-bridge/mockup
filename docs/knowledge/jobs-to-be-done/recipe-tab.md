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

---

## Slice: recipe versions and lifecycle

Mockup: [`recipe-versions/`](../../../recipe-versions/index.html) (index with decisions and options, `version.html`, `family.html`, `change.html`, `history.html` (history and compare), `after-cook.html`, `suggestions.html`, backend `spec.html`; shared `versions.css`, `versions.js` on top of the flow slice's `recipe/recipe.css` and `recipe/recipe.js`).

### Job

Owner's brief (10 October 2026, paraphrased): Recipe treats recipes and variations as immutable, and that should be relaxed a lot. People do not know what "the recipe" is. Sometimes they need to update the same version in place, sometimes keep several, sometimes spin one off with a parent. They may not want to lock in a recipe until it is tasty (a draft or trying state). Assistants (AI via MCP) and the UI both create and update. Database changes are fine; everything stays in UAT.

### How we know the person is in this job

They opened a recipe's version chip, Change, History, or reached the end of a cook of a version that is still Trying, or a suggestion from an assistant is waiting on a version they opened. Not detected otherwise; it is part of the Recipe tab job.

### What leads

- On a version: its state, in one slim band with the one action that moves it on; then the recipe.
- On Versions: the household's usual, then what is being tried, then the keepers; put away folded.
- On Change: where the change will land, said before anything is touched.
- At the end of a cook of a try: one question, three big answers.

### What this job does not need

Pantry status beyond the dots, plan and holds, photos, nutrition figures (only that they belong to a revision), the full lineage graph by default.

### Decisions (all Proposal, V-D numbering)

1. **V-D1 Three layers: recipe (family), version, revision.** Immutability moves down to the revision; a version can be fixed in place and nothing it said before is lost.
2. **V-D2 Four version states: Suggested, Trying, Kept, Put away.** Suggested = an assistant made it and no person said yes (out of lists, plans, ideas, search). "Favourite" is not a state; it is each member's star.
3. **V-D3 Transitions:** Suggested to Trying (a person says yes) or dismissed; Trying to Kept (Keep it) or Put away (Not for us); Kept to Trying or Put away; Put away to Kept. Making a try the usual also keeps it. Spin off ends a version here with a link to its new recipe.
4. **V-D4 State shows in one slim band** with its one next action (Keep it, Bring back, Open). Kept and the usual need no band; the "Our usual" pill says it.
5. **V-D5 "The recipe" is the family, named by and opening its usual.** One list row per family. Plan, Cook and Ideas open the usual. Exactly one usual always; the first version until changed. Answers G4.
6. **V-D6 Stars are per member** and never change what the household opens.
7. **V-D7 A version row:** name, what it changed from its parent, who and when, cooked count and revision, usual and state pills. Assistant work shows a dashed ✦ and "Alex's assistant".
8. **V-D8 Versions is a screen,** opened from the R-D20 chip; the flow slice's sheet can stay for a quick switch.
9. **V-D9 All lifecycle actions in the version's ⋯ sheet, only those that apply:** Make it our usual, New version from this, Make it its own recipe, History, Compare with our usual, Keep it, Back to trying, Put away.
10. **V-D10 Three kinds of change in the person's words:** Fix this one (next revision), Keep both (new version, parent = this, starts Trying), It is a different dish now (spin off).
11. **V-D11 Where a change goes: option 2** (recommended C). The top band says where it lands first. Supersedes R-D16.
12. **V-D12 A child is pinned to its parent's revision.** A later parent fix is offered once ("Bring it in"), never applied silently.
13. **V-D13 History:** revisions newest first with kind, who (assistant marked), when, their words, diff in the R-D20 tint; See it as it was; Go back saves a new revision.
14. **V-D14 Compare:** two columns, only what differs, the rest folded into one line; left is always the usual.
15. **V-D15 Kept as audit trail, never changed or deleted:** revisions, cook log (version and revision), journal, nutrition observations (on a revision), suggestions and outcomes, spin-off links.
16. **V-D16 Relaxed:** version name, state, current revision; family name and usual; per-member stars. Each change is a journal event with who and when.
17. **V-D17 The person's words stay required when an assistant acts.** In the app the tap is the intent and "why" is optional. Each revision records which.
18. **V-D18 Promoting a try: option 3** (recommended A: after every cook of a Trying version: Keep it, Needs work, Not for us). Keep it offers "Make it our usual" separately. Sits inside R-D19's single end-of-cook ask.
19. **V-D19 Any cooking member answers; the first answer counts;** a later cook can change it. Followers are not asked.
20. **V-D20 Every revision and state change has an author (member) and a channel (app or assistant).** An assistant acts for one member. Answers G5.
21. **V-D21 Assistant and kept versions: option 4** (recommended A: a kept version or the usual changes only through a suggestion; tries can be created and fixed with the person's words).
22. **V-D22 Suggestions wait quietly** (slim line on the version and Versions, a Suggestions screen; never a pop-up or on Home). Apply, Keep both, Not now, No thanks. A whole new recipe from an assistant is a family whose only version is Suggested: R-D12's draft. Answers G3 (drafts live in Recipe).
23. **V-D23 Who may do what:** any non-follower makes, fixes, keeps and puts away versions; changing the usual and putting away a version others cooked follow the household-admin rule where there are admins (preferences D25 to D30). The usual cannot be put away until another is the usual.
24. **V-D24 Two saves at once never overwrite.** A save names its starting revision; if someone saved first the person sees both and picks Save on top or Keep both.
25. **V-D25 Spin off** makes a new recipe whose first version is Trying, labelled "From Egg fried rice"; the old version stays read-only as "Spun off" with a link.
26. **V-D26 "Version" on screen, never "variation".** The API follows with aliases for a release.
27. **V-D27 Migration without loss:** recipe to family plus "Original" (Kept, usual, revision 1); variation to version (Kept or Put away) whose revision 1 is its resolved content, pinned to the parent's revision 1; old ids keep working.
28. **V-D28 The cook log records version and revision** (extends G2).
29. **V-D29 Nutrition belongs to a revision;** after an ingredient fix, figures show "for an earlier revision" until new ones are recorded. Recipe recomputes nothing.
30. **V-D30 Loading:** the version page loads its head only; Versions, History, Compare and Suggestions are routes; sheets build on tap; one small stylesheet and script on top of the flow slice.

How this changes the flow slice: R-D16 is superseded by V-D10 and V-D11 (a try is fixed in place, a keeper asks). R-D17 stands for Keep both and spin off; a fix asks "what did you fix?". R-D19 gains V-D18's three answers for a try, and "Keep it as a version" makes a Trying version. R-D11 and R-D20: "Make this version the default" is worded "Make it our usual", and the chip opens the Versions screen. Gaps G3, G4, G5 answered (V-D22, V-D5, V-D20); G2 extended (V-D28).

### Options awaiting yay, nay or combine

| # | Question | A | B | C | Recommended |
|---|---|---|---|---|---|
| V1 | Versions screen | Grouped by state (usual, trying, kept, put away folded) | Family tree by parent | – | A |
| V2 | Where a change goes | Ask at save | Ask before editing | By state: a try takes edits in place, a keeper asks at save | C |
| V3 | Promote a try after a cook | Ask every cook | Ask from the 2nd cook | Never ask; version page only | A |
| V4 | Assistant on a kept version or the usual | Suggest only | Edit, review after | Trusted per member | A |
| V5 | How far immutability is relaxed (backend) | Frozen revisions under mutable versions | Mutable rows, journal only | Today's rule plus states and usual | A |
| V6 | What a revision stores (backend) | Whole recipe per revision | Sparse change set vs pinned parent revision | – | A |

### Recipe-side backend rules (to be filed as Recipe issues later; not filed)

Full detail in [`recipe-versions/spec.html`](../../../recipe-versions/spec.html): rules BR1 to BR13, schema v6 (families, versions, revisions, suggestions, cooks, member_prefs, legacy_ids), new tools (`get_family`, `get_version`, `create_version`, `revise_version`, `restore_revision`, `list_revisions`, `compare_versions`, `set_version_state`, `set_usual`, `rename`, `spin_off`, `propose_change`, `list_suggestions`, `resolve_suggestion`, `record_cook`, `list_cooks`), error codes (`stale_base`, `needs_person`, `bad_transition`, `is_usual`, `no_change`, `intent_required`, `not_allowed`, `too_many_open`), today's tools as aliases for a release, HTTP routes for Kitchie, and the v5 to v6 migration. Proposed issues R-V1 to R-V9. R-V1 (relaxing "recipes and variations are immutable" in Recipe's AGENTS.md and brief) is owner-reserved and comes first.

### Open questions

- Options V1 to V6. A wrong guess on V2 or V4 changes what people trust; on V5 or V6 it costs a second migration.
- "Not for us" on the first cook of a try in a household of several cooks: put away at once (mockup, with undo) or wait for a second opinion?
- Do notes and photos sit on the family (R-D24) or on a version? Mockup: notes on the family, cook photos on the cook entry.
- Any real delete (a try made by mistake, no cooks, one revision)? Mockup: no.
- Migration: a disabled root with active variations. Spec proposes the most-used active variation becomes the usual, or the whole family is put away if none is active.
- Member ids in standalone mode: one `legacy` member proposed.

### For the implementation

- Default path: theme, `recipe/recipe.css`, `recipe/recipe.js`, `versions.css`, `versions.js`; one `get_version` call for the head revision. Everything else is a route or a sheet built on tap; history pages older revisions on scroll.
- Classes to lift beside the flow slice's: `.st` (state pills), `.vr` (version row), `.tree`, `.band`, `.rv` (revision), `.df` (diff rows), `.ch` (choice cards), `.sug`, `.verd`, `.cmp`. Sample names only in `versions.js`.

---

## Slice: cooking ideas (the Home pane and its heuristics)

Mockup: [`recipe-ideas/`](../../../recipe-ideas/index.html) (overview with decisions, `home.html` the pane in place on Home, `all.html` the full ranked list and Plan ahead; `ideas.js` holds the ranking and sample signals, `ideas.css` the classes). Reuses `recipe/recipe.css`, `recipe/recipe.js` and `recipe/plan-sheet.js`.

### Job

"What shall we cook next?" answered on Home in one glance, from the household's own recipes and what is actually in, with one tap to cook or plan it. It overlaps with using things up (use-up.md) and planning the week, but is neither: it is the next meal.

### How we know the person is in this job

They are on Home with Recipes in the household, and tonight is not cooked yet. The clock moves it to tomorrow after 8pm. A plan for tonight changes what leads (the plan, then "If plans change"). Not detected beyond that; the pane is always there for a household with Recipes.

### What leads

One idea with Cook now, Plan and Why, then two one-line rows (option 1 A). Each idea carries one line built from its reasons and what is missing.

### What this job does not need

Stock levels, locations, nutrition, the plan grid, version trees, method. Use-by appears only as a reason ("Uses spinach before it goes"), never as dates.

### Signals and sources

What is in and missing: Recipe `what_can_i_cook` / `what_am_i_missing` (stock from Kitchie's capability; "unknown" is never "missing"). Use-by: Kitchie items, joined on `matched_as`. Holds, this week's plan, who is eating, cooking history, freezer portions, food rules (avoid, like, dislike, cap), shopping list: Kitchie. Star, vote, version status, minutes, tags: Recipe. Time of day: the device. Seasonality: not used.

### Decisions (all Proposal, I-D numbering)

1. **I-D1 The pane answers one question: the next meal.** Tonight before 8pm, tomorrow after.
2. **I-D2 Saved recipes and freezer portions only.** Nothing invented in the pane by default.
3. **I-D3 Kitchie ranks; Recipe answers; deterministic,** so Why can say exactly why (option 4 A).
4. **I-D4 Two passes: filter, then score.** Filters never score, scores never exclude.
5. **I-D5 Filters, always listed under "Left out tonight" with the reason:** avoid of anyone eating, cap reached, already planned this week, cooked in the last two days, "Not tonight" today, put away.
6. **I-D6 Score:** ready (all in +3, one missing +1, two ≈0, three or more −2; a missing item already on the list costs less); use it up (+2 due in 3 days, +3 due tomorrow, max +4); rotation (+2 a month, +1 two weeks, −2 within 4 days, +1.5 never cooked); trying a version +1.5 for its maker; favourite +1; quick weeknight +1, over an hour −2; dislike of someone eating −1.5, like +1. Ties: fewer missing, then longest since cooked. Starting numbers, tuned with use. A held item counts as not in.
7. **I-D7 One knob, Lean towards:** Balanced, Use it up, Quick, Favourites, Something different, Batch. Doubles one family of reasons. Per person; the batch cooker starts on Batch.
8. **I-D8 Who is eating** comes from tonight's plan, else everyone; changeable for tonight only. Filters and weights read the people eating, not the viewer.
9. **I-D9 A freezer dish is offered as itself** ("Have it tonight"), and its recipe is not offered again. Needs K2.
10. **I-D10 One line per idea:** strongest reason, then what is missing or a caveat for someone eating, else "all in".
11. **I-D11 See all:** full ranked list, a reason tag per row, the lean as the shared chip strip, "Possible, not a great fit", then "Left out tonight (N)" folded.
12. **I-D12 Why (ⓘ):** a sheet of + and − reasons with their source, and "Nothing here was guessed by an AI". Not tonight (snooze today) and Not for me (a dislike for the viewer in Kitchie food rules, with Undo).
13. **I-D13 Acting uses existing Kitchie tools:** Cook now `start_cooking` (recipe id, resolved ingredients); Plan via the day picker then `plan_meal` and `plan_reserve` (Hold on by default); cart `plan_add_missing_to_list` or `shopping_add`; freezer `plan_meal` leftover; end of cook `cook_meal` and Recipe `record_usage`. Recipe holds no stock.
14. **I-D14 Tonight planned leads,** then two "If plans change" rows (one for a follower).
15. **I-D15 Plan ahead** pairs each empty night this week with the best idea left (use-it-up first), skipping days off and nights with a meal; one Plan per night. Not an auto-planner.
16. **I-D16 States:** no recipes (Add, Ask your assistant); under five recipes (one line "ideas get better with more"); pantry unreadable (ranked on the rest, says so, nothing marked missing); nothing fits (freezer, Plan ahead, Ask your assistant); after 8pm (tomorrow); morning (take a freezer dish out).
17. **I-D17 The assistant** is option 3; either way it reads the same ranking (K1), and anything it makes up is labelled "Made up by your assistant" (plan-week-ai 7c, 26).
18. **I-D18 Three ideas on the pane, all on See all;** no scores or percentages on the face.
19. **I-D19 Seasonality and nutrition left out** for now.
20. **I-D20 Desktop:** the pane is the Home side panel, the lead card with all ideas below it, no carousel. Not drawn.

### Options awaiting yay, nay or combine

| # | Question | A | B | C | Recommended |
|---|---|---|---|---|---|
| I-O1 | The pane on Home | Lead idea and two rows | Swipe cards (today's carousel, richer) | Four rows with reason tags | A |
| I-O2 | Tuning | Sliders icon opens a Tune sheet (lean, who is eating) | Chips on See all only; who is eating only from the plan | – | A |
| I-O3 | Assistant | Opens your AI app; nothing of its own in the pane | It can also pin one idea for today, labelled | – | A |
| I-O4 | Where ranking runs | Kitchie | Recipe "suggest" tool | Only the AI | A |

### Gaps

- **K1 Kitchie:** one ideas read (web route and a read-only MCP tool `cooking_ideas`: for, lean, date) returning ranked ideas, reasons and left-out, so pane and assistant agree.
- **K2 Kitchie:** a freezer item linked to its recipe id (set at the end of a batch cook).
- **K3 Kitchie:** "Not tonight", a one-day per-person snooze.
- **G10 Recipe:** `what_can_i_cook` judges canonical recipes only; ideas need the household default version (G4), via a targets input.
- **G11 Recipe:** star, vote, version status and default version returned in bulk with `list_recipes` or `what_can_i_cook` (today per target, and not a tool).
- **G12 Recipe:** the "trying" version status (recipe-versions slice), readable in bulk.
- **G13 Recipe:** keep `matched_as` on each verdict; Kitchie joins use-by on it.

### Open questions

- I-O1 to I-O4. A wrong I-O4 costs a rewrite across two repos.
- Does Not for me write a dislike at once (person level, ungated) or ask? Mockup: writes, with Undo.
- A household lean set by an admin? Mockup: no, per person.
- Cooked in the last two days: filter, or just a strong negative? Mockup: filter.

### For the implementation

- Default path on Home: one K1 call after the stock tiles, never blocking them; only for a household with Recipes. Sheets (Why, Tune, Ask, day picker) build on tap; See all is its own route.
- Ranking: one pass over at most 100 recipes, cached per household for a few minutes and dropped on any stock, plan or food-rule change.
- Lift `.ideas`, `.idl`, `.idr`, `.why`, `.rtag` and the `rank()` shape from `recipe-ideas/ideas.js`; sample signals live only there.

---

## Slice: recipe photos

Mockup: [`recipe-photos/`](../../../recipe-photos/index.html) (index with the architecture decisions and options, `list.html`, `recipe.html`, `add.html`, `assistant.html`; shared `photos.css`, `photos.js` on top of the flow slice's `recipe/recipe.css` and `recipe/recipe.js`; sample pictures in `img/` at the three proposed sizes). Answers gap G7.

### Job

Seeing what a recipe looks like when choosing it, keeping a picture of what was actually cooked, and adding one with as little effort as possible, from the app or by showing it to the assistant. Owner's brief (10 October 2026, paraphrased): lock the architecture before anything is built (where bytes live, storage on the existing Tencent Lighthouse 2 vCPU / 2 GB server with snap Docker, pay for nothing, backups include photos, sizes and formats, upload from the UI and from AI, limits, per-version vs per-recipe, cooked-it photos, privacy through the Platform household token, caching, deletion); site performance is strict: lazy and progressive, nothing loaded until needed, thumbnails in lists, a tiny placeholder.

### How we know the person is in this job

They opened a recipe (the cover), scrolled to Cooked or Photos, tapped the camera in the top row or Add in Photos, reached the end of a cook (R-D19's optional photo), or tapped an add link from their assistant. Not detected otherwise; it is part of the Recipe tab job.

### What leads

- On the list: the cover thumbnail in the existing 56px tile, or the emoji when there is none.
- On the recipe page: the version's cover (or its parent's, labelled), then the recipe; Photos and Cooked further down.
- On Add: the picture, then one question, "What is it?" (Tonight's cook or Cover of this version).

### What this job does not need

Storage details on screen, file sizes (except the one reassurance line on Add), editing tools beyond a square crop for a cover, sharing outside the household, step photos (later, P-D23).

### Decisions (all Proposal, P-D numbering)

1. **P-D1 Recipe owns recipe photos;** Kitchie stores none and shows them by id. Only ids and the P-D5 contract cross apps. Option P1.
2. **P-D2 Files in `photos/<household>/<id>-<size>.webp` beside `recipes.db`** in Recipe's data folder (today the `recipe-data` volume; a move to a `/home` folder like Kitchie's carries photos with it, since snap Docker only bind-mounts under `/home`). Option P2.
3. **P-D3 Disk budget:** about 350 KB per photo for three sizes (1,000 photos ≈ 350 MB). Check free space on the data folder before switching photos on; the household cap guards the rest.
4. **P-D4 One row per photo:** random 128-bit id, household, family, version or cook, kind (`dish`/`cooked`), author and channel (app/assistant), dimensions, square crop, colour, 24px preview, bytes per size, added, removed, purge-after, source page for a web photo. A version gains one changeable pointer, `cover_photo_id` (fits V-D16).
5. **P-D5 Contract:** replies carry photo ids and colour (preview for the cover only), never bytes. HTTP `GET /recipe/photos/<id>/t|m|l.webp`, `POST /recipe/photos`, remove, restore. MCP `request_photo_upload` and photo ids in recipe and cook replies. No image bytes through MCP.
6. **P-D6 Three WebP sizes, no original:** l 1600px long edge (viewer), m 960px (top of page), t 240px square (every thumbnail); quality about 75; colour and preview stored. Option P3.
7. **P-D7 The phone makes the sizes** (also drops location and camera data); Recipe accepts only WebP of the right dimensions and size. Option P4.
8. **P-D8 Limits (settings):** 6 recipe photos per version, 3 per cook, 1 MB per upload, 2 GB per household (slim warning at 80%), 60 uploads an hour per member. Option P9.
9. **P-D9 A photo belongs to a version or a cook, never a revision.** A fix keeps photos; a new version shows its parent's cover, labelled, until it has its own; a spin-off (V-D25) offers "Bring the cover along" (on by default; files copied). The page's Photos section shows the whole family, this version first. Option P6.
10. **P-D10 Cover:** first recipe photo of a version; any photo, cooked included, can be made the cover in one tap; with none up the line, the newest cooked photo stands in, dated. Option P7.
11. **P-D11 Adding from the app:** camera in the page's top row, Add in Photos, end of a cook. Phone camera or picker; "What is it?" (Tonight's cook by default, or Cover of this version with a square crop); optional line for a cook; up to 3 from one cook; background send with retry.
12. **P-D12 From an assistant:** a one-time add link (15 minutes, one use, bound to household and target) opens Kitchie's add screen already aimed; the person picks the photo. Later, for drafts from a web page, a photo address Recipe fetches (https, public addresses only, 8 MB, images only), shown on Check it so a person keeps or drops it. Option P5.
13. **P-D13 Cooked-it photos are part of the cook entry** (G2, the versions slice's `record_cook`, up to 3 photo ids); thumbnail on that night's Cooked row and in Photos with date and who; not the cover unless chosen or nothing else exists.
14. **P-D14 Nothing jumps, nothing loads early:** every box sized up front and filled with the photo's colour (no request); thumbnails load within 200px of the screen; only the page's cover loads up front, with the inline 24px preview; its siblings on first swipe; the large size only in the viewer; the add screen and its shrinking code are a separate route.
15. **P-D15 Private to the household:** same-site addresses, Platform sign-in cookie and household checked on every request (locally, platform D11); 404 for anyone else; no public URLs, no tokens in addresses. Option P8.
16. **P-D16 Caching:** bytes never change (replace = new id), so `private, max-age=31536000, immutable`; no shared cache.
17. **P-D17 Removing:** by the person who added it or a household admin (no admins: any member but a follower); hidden at once with Undo, restorable 30 days, then files deleted and only the fact kept; "Delete it for good now" skips the wait; a removed cover falls back per P-D10; a household that leaves takes its photos. Option P10.
18. **P-D18 Backups:** the existing data-folder backup includes photos, database first then photos; switch to copying only new files past about 500 MB. Option P11.
19. **P-D19 No photo, no pretend photo:** emoji in the tile and beside the title (R-D9 stands); Photos shows one dashed line "No photos yet: snap it next time you cook it" with one tap to add.
20. **P-D20 Top of the recipe page:** option P12.
21. **P-D21 Lists:** option P13. One 240px square serves every thumbnail in the app.
22. **P-D22 Viewer:** large photo with who and when; Replace cover or Use as cover; Remove only for those allowed (others are told who can).
23. **P-D23 Step photos later:** same mechanism, kind `step` plus a step number.
24. **P-D24 A photo from someone else's site** is kept for the household only, with its source page, never shown outside.

How this changes other slices: R-D9 stands, and gains P-D19's empty line in Photos. R-D19's optional photo is P-D11's add screen with Tonight's cook preselected. R-D26 and G2: a cook carries up to 3 photo ids (P-D13). G7 is answered by P-D1 to P-D18. Versions slice: `record_cook.photo_ref` becomes `photo_ids` (up to 3); a version gains `cover_photo_id`; V-D25 spin-off gains "Bring the cover along"; the open question "notes and photos on the family or a version" is answered for photos by P-D9.

### Options awaiting yay, nay or combine

| # | Question | A | B | C | Recommended | Downside of the pick |
|---|---|---|---|---|---|---|
| P1 | Who owns photos | Recipe | Shared Platform service | Kitchie | A | Recipe gains file serving; Kitchie item photos later would repeat it |
| P2 | Where bytes sit | Files beside `recipes.db` | SQLite blobs | Tencent COS | A | Row and files must be kept in step (files first, nightly sweep) |
| P3 | What is kept | Three WebP sizes, no original | Plus original | Original only, resize on view | A | No full-quality original ever |
| P4 | Who shrinks | Phone | Server library | Phone to 1600, server the rest | A | Server must strictly check bytes; web photos wait for a server library |
| P5 | Assistant upload | One-time add link | Base64 in the tool call | Photo URL fetched by Recipe | A now, C later for drafts | One more tap; assistant never sees the photo |
| P6 | Attached to | Version or cook | Whole recipe | Revision | A | New version shows parent's photo until it has one |
| P7 | No cover | Parent's, then newest cooked | Recipe photos only | Newest of any kind | A | A messy dinner photo can lead unchosen (dated) |
| P8 | Privacy | Same-site cookie check | Signed expiring links | Script-loaded with token | A | Needs one site for Kitchie and Recipe; no sharing out |
| P9 | Limits | Tight (6/3/1 MB/2 GB) | Roomy (20/10/5 GB) | Household total only | A | Stage-by-stage photographers hit 3 per cook |
| P10 | Removing | Hidden, purge after 30 days | Gone at once | Never deleted | A | File lingers 30 days and in backups |
| P11 | Backups | With the database | Database plus new files only | None | A now, B past 500 MB | Every backup copies all photos; still on the same server |
| P12 | Top of page | Full width 195px, swipe | 72px square by title | None | A | Ingredients start lower; biggest download on the page |
| P13 | Lists | Cover in the 56px tile | No photos in lists | 40px thumb, slimmer rows | A | Each visible row downloads ~12 KB |

### Recipe-side work (to file as Recipe issues once directions are picked; not filed)

RP1 photos table and folder with files-then-row writes and a nightly sweep (strays, 30-day purge). RP2 upload, serve, remove, restore, delete-now routes with checks, limits and cache headers. RP3 version cover pointer, fallbacks, photo ids in replies. RP4 Recipe accepts the Platform cookie on photo `GET` (today bearer header only). RP5 `request_photo_upload` and the one-time link. RP6 backup runbook includes the photo folder, database first. RP7 later: web photo for drafts (server image library, private-network fencing). Kitchie: the add route with in-browser shrinking, the frame markup, the ~40-line loader; nothing stored.

### Open questions

- Free disk on the server's data folder (not recorded anywhere readable). A wrong guess fills the server; P-D8's cap is the guard.
- An off-server backup copy at no cost in the current Tencent plan? Infra's call, for all apps.
- P4 A means a web photo for a draft (P5 C) waits for a server image library.
- Can a follower add a cooked photo? Mockup: yes; they cannot remove others'.
- Replacing a cover: keep the old one in Photos (mockup) or remove it?
- P8 A assumes Kitchie and Recipe stay on one site; a separate subdomain later needs P8 B.

### For the implementation

- Default path: the list sends ids and colours; thumbnails load as rows near the screen. The recipe page loads one medium cover with its inline preview; everything else on approach, on swipe, or in the viewer. Add is its own route. The Mockup panel meter counts what each screen fetched (sample pictures are flat drawings, far smaller than real photos).
- Classes to lift beside the flow slice's: `.pf` (frame: `--pc` colour, `--lq` preview, `.in` when loaded), `.hero2`, `.pcap`, `.tthumb`, `.pgal`, `.pempty`, `.pv` (viewer), `.frame`, `.kind`. `tools/shots-photos.mjs` captures every photo screen at three scroll points.
