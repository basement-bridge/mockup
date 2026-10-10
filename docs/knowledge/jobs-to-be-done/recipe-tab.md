# Recipe tab

Status: drafted 10 October 2026 by four parallel agents, one slice each, then reconciled the same day. **The owner locked nine decisions by voice the same evening (about 22:00 to 22:30 Sydney): see "Owner's locked decisions" below.** Everything not marked **Locked** is still a **Proposal** until the owner says otherwise. Each slice keeps its own heading; append yours, do not edit another's. Reconciliation marks (**Superseded**, **Reworded**, **Answered**, **Open**) are inline and summarised under "Reconciliation" at the end. **Build handoff: [recipe-tab-handoff.md](recipe-tab-handoff.md)** (decision index, the owner's yay/nay list, open questions with build defaults, architecture, build slices, cross-feature requests). **Nothing has been built, and nothing has been filed as an issue.** When it is built, three rules hold: the built screen matches the mockup exactly; performance first, with lazy loading (`DESIGN.md` section 6); headless-browser screenshots before a UI change is called done.

Owner's brief (10 October 2026, paraphrased): a dedicated Recipe tab experience for Kitchie. Recipe is a separate service (MCP and API); Kitchie is the only UI. Kitchie renders recipes; information Recipe cannot read or write yet must be solved in Recipe, and Kitchie renders it. Today tapping a recipe idea shows only ingredients. Kitchie's other tabs (Plan, Pantry, Shopping) set the design language: reuse it. Screen space on list screens is precious: every control must earn its place.


## Owner's locked decisions (voice, 10 October 2026)

Said by the owner by voice on 10 October 2026, roughly 22:00 to 22:30 Sydney. Each is **Locked (owner, voice, 10 Oct 2026)**. The ids on the left are the owner's order in that session (L1 to L9); the ids in the second column are the ones used everywhere else in these notes.

| Owner | Id | Locked decision | Replaces or changes |
|---|---|---|---|
| L1 | **R-O1 = A** | The list is one ranked list (option 1 A). | R-D27 stands; options 1 B and 1 C dropped. |
| L2 | **R-O2 = A** | The recipe page is one continuous scroll with the jump row docked at the top (option 2 A). | Settles R-D7. Option 2 B (tabs) dropped. |
| L3 | **R-O3 = B, varied** | Versions: no versions row at all for a recipe with one version; a horizontally scrolling strip when there are several; the strip docks as its own row above the jump row. | Settles R-D20 (the chip, option 3 A, is dropped). V-D8's "opened from the R-D20 chip" loses its chip; where the Versions screen is reached from is the versions slice's to redraw (option V1 is still open). |
| L4 | **R-O4 = redefined** | Adding recipes is redefined: no link paste, no scraping, no reading of photos or links, no "one box" and no "four doors". Recipe content comes **only** through the person's own AI assistant, over a very rich MCP surface. The UI adds extra photos (especially after cooking) and notes. | Voids both option 4 A and 4 B. Narrows R-D4 (Add), R-D13, R-D14, R-D15, R-D21; drops gap G8; drops P-D12's later part (a photo address fetched by Recipe), P-D24 and option P5 C; closes the open question "who reads photos or links". |
| L5 | **R-O5 = void** | The follower-versus-cook distinction is dropped. All household members are equal and have the same controls; restrictions come later, if ever needed. | Voids option 5 and R-D8. Changes V-D19, V-D23, P-D17 and the spec's admin rule to equal roles for the Recipe side (handoff X3, X6). Closes "can a follower change a recipe". |
| L6 | **R-D29** | On the Plan tab, once a planned meal's items are sorted, tapping it goes straight into cook mode. This is Plan-tab behaviour. | Cross-feature request XR1 and XR2 to the Plan owners (handoff section 11). Meets plan-week-ai 7(a) ("tap through to that recipe"). |
| L7 | **R-D30** | Cook-mode step buttons are labelled with the destination step's content, not "Back" and "Next". | Rewords R-D18. |
| L8 | **R-D31** | Putting away needs no admin approval. | Changes V-D23 and the X3 build default; closes "does Put away need admin agreement". |
| L9 | **R-D32** | The navigation pattern is unchanged: left gutter (rail) on desktop, bottom nav on mobile. | Leaves which items are in the bar open (R-O6 below). |

**Not locked, still open exactly as before:**

- **R-O6, the tab bar items (option 6, R-D2, handoff X1).** The owner said "moving on" without picking. In the same voice session an assistant said "locked as A". **That was wrong: nothing was picked, and option 6 is still open.** L9 (R-D32) locks only the pattern (rail on desktop, bottom bar on phone), not which items are in it.
- V2 (V-D11), where a change goes.
- The editing screen: the owner said "we'll do that later". R-O4 says content comes only through the assistant; whether a later editing screen in the app may change recipe content is part of that later conversation.
- The cooking-ideas pane (the ideas slice): not reviewed yet.
- Photo storage options P1 to P13 (P5 C is dropped by R-O4; the rest open).
- Versions options V1 and V3 to V6.
- Where ranking runs (I-O4).
- R-V1, the relaxing of Recipe's immutability rule.
- Who draws the tab (handoff X16).

---

## Slice: the end-to-end Recipe tab flow

Mockup: [`recipe/`](../../../recipe/index.html) (index, `list.html`, `detail.html`, `add.html`, `review.html`, `edit.html`, `cook.html`, shared `recipe.css`, `recipe.js`, `plan-sheet.js`).

### Job

Anyone arriving in recipe land: find a recipe, see what it needs against the pantry, plan it, cook it, add a new one (by hand or via the assistant), change it as a new version, move between versions. **Changed by R-O4 (locked):** a new recipe and its content come only through the person's AI assistant; in the app a person adds photos and notes. Four personas drive what leads (**the follower persona is void, R-O5 locked**: every member has the same controls):

- **Weeknight cook** (sample: Sam): dinner in 30 minutes from what is in. Leads with Ready now and time.
- **Batch cooker** (Priya): cooks big, freezes portions. Starts on the Batch chip; servings step in whole batches; the end of a cook offers to put portions in the freezer.
- **Improviser** (Alex): changes things as they go. Swaps tonight are not saved unless they say so; Change it and versions are close at hand.
- ~~**Household member who only follows** (Jane): cooks what someone else planned. Tonight's meal leads; no Plan, Change it or drafts.~~ **Void by R-O5 (locked):** Jane is an ordinary member with the same controls.

### How we know the person is in this job

They tapped the Recipes tab, a recipe idea on Home, or a meal on Plan. The persona is not detected: it is the mockup's switch. For the build, signals already exist: a household with batch-tagged recipes and freezer portions suggests the batch cooker. Do not build a persona setting; let the screens serve all three remaining personas at once (Proposal). The follower signal is dropped with R-O5.

### What leads

- The list: what you can cook now (fewest missing first), then what you have not cooked for a while.
- The recipe page: the ingredients, with what is in and what is missing, sized by Serves. Then the method.
- Cook it: the ingredients first, then one step per screen (cooking-right-now.md).

### What this job does not need

Where things are stored in the kitchen, use-by dates, stock levels beyond in or missing, nutrition (not drawn; another decision), the plan grid itself (Plan owns it).

### Decisions (Proposal unless marked Locked; R-D numbering)

1. **R-D1 The tab opens on the list.** No dashboard above it. Ideas live on Home (cooking-ideas pane, another slice).
2. **R-D2 Tab bar: Plan, Pantry, Recipes, Shopping.** Same bar component as the household flow. **Open, owner's call (option 6, R-O6); not decided.** The owner said "moving on" without picking; an assistant's "locked as A" in the voice session was wrong. The pattern (rail on desktop, bottom bar on phone) is locked by R-D32. The household flow and the ideas slice draw Home, Pantry, Recipes, Shopping; production Kitchie and the plan-desktop rail have five (Home, Pantry, Plan, Recipes, Shopping). Option A has no Home, where R-D1 and I-D1 put the ideas pane (handoff X1).
3. **R-D3 Kitchie renders, Recipe owns.** Every value comes from a Recipe tool or from Kitchie's own plan and stock. Missing capability is listed under Recipe-side gaps, not faked in Kitchie.
4. **R-D4 One top row on the list: search and Add.** No heading. Search matches names and ingredients. **Narrowed by R-O4 (locked):** Add no longer opens an in-app form or reader; a new recipe comes through the person's AI app. How the top row is drawn now is the flow screens' to redraw (Proposal: the button opens the person's default AI app, plan-week-ai 45).
5. **R-D5 One chip strip, the plan-week-ai strip (its decision 48):** All, Ready now, Starred, Batch, Under 30, Added by me. Tap the chosen chip again for All. Remembered per person in localStorage (`rcp-chip-<persona>` in the mockup). The batch cooker starts on Batch.
6. **R-D6 Swipe a list row right to plan it** (opens the day picker). No swipe left: Recipe never deletes.
7. **R-D7 Recipe page layout:** option 2. **Locked as R-O2 = A** (owner, voice, 10 Oct 2026): one continuous scroll, jump row docked at the top.
8. ~~**R-D8 The follower:** option 5 (A tonight leads; B straight to cook). Either way no Plan, Change it or drafts line; star, notes and photos stay.~~ **Void by R-O5 (locked, owner, voice, 10 Oct 2026):** no follower distinction; all members equal, same controls.
9. **R-D9 Photos only when there are photos.** Hero swipes sideways with dots; no photo means no hero and no placeholder. Step pictures only when the recipe has them.
10. **R-D10 Serves is the quantity control.** Scales every amount (plan-week-ai decision 10). Batch recipes step in whole batches. An unknown amount stays "amount?" at every size.
11. **R-D11 Two actions at the bottom: Cook it (leads) and Plan it.** Star in the top row. In ⋯: Change it, Make this version the default, Ask your assistant about it (opens the person's default AI app, plan-week-ai decision 45), Where it came from, Put away. **Reworded by V-D9:** "Make this version the default" reads "Make it our usual"; Change it asks where the change goes (V-D10); Put away is refused on the usual (V-D23, BR4).
12. **R-D12 Assistant drafts wait in one slim line at the top of the list.** Never a pop-up, never on Home. Needs gap G3.
13. ~~**R-D13 Adding:** option 4 (A one box; B four doors).~~ Ask your assistant opens the person's own AI app (plan-week-ai decision 42: no in-app agent); its result comes back as a draft. **Narrowed by R-O4 (locked):** no one box, no four doors, no link paste, no scraping, no photo or link reading. Recipe content comes only through the assistant over Recipe's MCP surface; the app adds photos and notes.
14. **R-D14 One Check it screen for every new recipe.** **Narrowed by R-O4 (locked):** the only source is now an assistant draft (a Suggested family, V-D22); "read from a photo" and "read from a link" are gone, and `entered` (typed by hand in the app) does not arise while there is no in-app form. Whether a person confirms the draft on a Check it screen or through the assistant is the flow screens' to redraw (Proposal). Badge says where it came from. Plain = read from the source; *guess* = inferred; *?* = the source did not say, saved as unknown (Recipe `basis`: observed, inferred, unknown; Recipe also has `entered` for a value typed by hand, shown plain). Never invented.
15. **R-D15 Save is one tap.** The other button is Not now for an assistant draft (stays a draft) and Discard for your own. **Reworded by V-D22:** an assistant draft is a Suggested family; Save makes it Trying, and No thanks (dismiss) sits beside Not now. Discard applies only to unsaved work of your own (nothing was stored). **Narrowed by R-O4:** with no in-app form there is no unsaved work of your own, so Discard drops out.
16. ~~**R-D16 Changing a recipe always makes a new version.** Said before you start; changes are counted; only what changed is saved (Recipe variation change set).~~ **Superseded by V-D10 and V-D11** (a try is fixed in place, a keeper asks; still said before you start). What a revision stores is V6 (backend option).
17. **R-D17 A new version is named from its change**; the optional "why keep it" is stored as the person's words (`user_intent`). Default for the household is a separate explicit tick. **Reworded by V-D10/V-D17:** applies to Keep both and spin off; a fix asks "what did you fix?"; the tick reads "Also make it our usual".
18. **R-D18 Cook it opens on the ingredients,** then one step per screen with its timer. Tap to tick; press and hold to say you used something else tonight. **Reworded by R-D30 (locked):** the step buttons carry the destination step's content (for example "‹ Beat the eggs" and "Fry the rice ›"), never "Back" and "Next".
19. **R-D19 The end of a cook asks once:** what leaves the pantry; for a batch, portions to the freezer; only if something was swapped, Just tonight or Keep it as a version (asks for their words; Recipe rejects a version without them). Optional photo or line into Cooked. **Reworded by V-D18 and P-D11/P-D13:** "Keep it as a version" makes a Trying version; a cook of a Trying version adds Keep it, Needs work, Not for us; the photo is up to 3 photo ids on the cook. One ask, order in the handoff (section 6).
20. **R-D20 Versions:** option 3. **Locked as R-O3 = B, varied** (owner, voice, 10 Oct 2026): no versions row for a recipe with one version; a horizontally scrolling strip when there are several, docked as its own row above the jump row. Changed rows are tinted; what they replaced is struck through in brackets (plan-week-ai decision 30). ~~**Reworded by V-D8:** the chip opens the Versions screen; the sheet stays for a quick switch.~~ The chip is gone with option 3 A.
21. **R-D21 A likely duplicate is shown, never merged:** Open that one, Save as a version of it, Keep both (`potential_duplicates`). **Narrowed by R-O4:** applies to an assistant's draft only.
22. **R-D22 Missing items:** a cart icon per row, "Add all N missing to shopping", and the hint "Talk to your assistant about substitutes" (plan-week-ai decisions 11 and 29).
23. **R-D23 Hold shows only when the recipe is planned,** beside the Ingredients heading, "Held for Tue" (plan-week-ai decisions 9 and 33). On by default in the day picker.
24. **R-D24 Notes are the household's, on the recipe, on every version.** A note never changes the recipe. Needs gap G1. (Versions slice keeps notes on the family; photos are per version or cook, P-D9.)
25. **R-D25 Put away, not delete** (Recipe disabled status). **Reworded by V-D2/BR3:** Put away is a version state and a family flag; the backend spec gains a family put-away call (handoff X9). **R-D31 (locked):** no admin approval; any member may put away (the usual still cannot be put away until another version is the usual, BR4).
26. **R-D26 Cooked is a short history:** date, who, version, their line, the night's photo. Needs gap G2. (Answered by V-D28 `record_cook` with revision and verdict, and P-D13: up to 3 `photo_ids`.)
27. **R-D27 List order:** fewest missing first, then longest since cooked. Pills are symbol plus number: all in, N missing, starred, freezes, versions.
28. **R-D28 The day picker** shows this week (Monday first) with what is planned, past days greyed, usual day off marked, up to four weeks ahead (plan-week-ai decision 1). A day that already has a meal gets a second meal; nothing is replaced.
29. **R-D29 Plan tab: a sorted meal taps straight into cook mode.** **Locked (owner, voice, 10 Oct 2026; L6).** Plan-tab behaviour, owned by the Plan features: recorded as cross-feature requests XR1 and XR2 in the handoff. What "sorted" means is open (build default in the handoff).
30. **R-D30 Cook-mode step buttons name where they go.** **Locked (owner, voice, 10 Oct 2026; L7).** The buttons carry the destination step's content, not Back and Next.
31. **R-D31 Putting away needs no admin approval.** **Locked (owner, voice, 10 Oct 2026; L8).**
32. **R-D32 Navigation pattern unchanged.** **Locked (owner, voice, 10 Oct 2026; L9):** left gutter (rail) on desktop, bottom nav on mobile. The items in the bar stay open (R-O6).

### Options (five locked, one open)

| # | Question | A | B | C | Status |
|---|---|---|---|---|---|
| 1 | The list | One ranked list | Shelves (Ready now, Not cooked lately, A to Z) | Photo grid | **Locked R-O1 = A** (owner, voice, 10 Oct 2026) |
| 2 | Recipe page | One scroll, sticky jump row | Tabs on the same row | – | **Locked R-O2 = A**, jump row docked at the top |
| 3 | Versions | Chip in the meta row, tree in a sheet | Strip under the title | – | **Locked R-O3 = B varied**: no row for one version, scrolling strip for several, docked above the jump row |
| 4 | Adding | One box (paste, type, link; camera and mic on it) | Four doors | – | **Locked R-O4 = redefined**: neither; content only through the assistant's MCP surface; the app adds photos and notes |
| 5 | Follower | Tonight leads, opens the recipe | Tonight opens cook mode | – | **Locked R-O5 = void**: no follower distinction (R-D8 void) |
| 6 | Tab bar | Plan, Pantry, Recipes, Shopping | Home first, Plan inside Home | – | **Open (R-O6)**: owner said "moving on" without picking; "locked as A" in the voice session was an assistant's error |

### Recipe-side gaps (solve in Recipe; Kitchie renders)

- **G1 Notes:** append-only note list per recipe family (text, member, when).
- **G2 Cook history:** one entry per cook (when, member, recipe or variation id, servings, optional line, optional photo ref). Today `record_usage` keeps only a count and last date. **Answered:** V-D28 (version and revision), P-D13 (`photo_ids`, up to 3).
- **G3 Drafts:** a draft status that lists, search and ideas skip, so the assistant writes once and a person confirms. Today only active and disabled. **Answered by V-D22** (a Suggested family, in Recipe).
- **G4 Household default version** per family. **Answered by V-D5** (the usual).
- **G5 Added by:** a member id, not only free text in `source.description`. **Answered by V-D20.**
- **G6 Step minutes:** optional per step, never invented, to drive timers.
- **G7 Photos:** dish, step and cook photos (photo-storage slice). **Answered by P-D1 to P-D18** (step photos later, P-D23).
- ~~**G8 Reading a photo or link:** Recipe has no parser; the reading is the AI's. Open: which side runs it and how Kitchie hands it the photo or link.~~ **Dropped by R-O4 (locked):** nothing reads photos or links; recipe content comes only through the person's assistant.
- **G9 Batch facts:** agree closed tag words for freezes and portions (closed vocabulary where logic acts).

### Open questions

- Tab bar order (option 6). Wrong guess costs every tab's bar.
- ~~G3: draft status in Recipe, or held in Kitchie until saved?~~ Answered by V-D22: in Recipe.
- ~~G8: who reads photos and links.~~ **Closed by R-O4 (locked):** nobody; no photo or link reading, no scraping, no link paste.
- ~~Can a follower change a recipe, or only add notes?~~ **Closed by R-O5 (locked):** there are no followers; every member has the same controls.
- Should Ready now treat items held for another meal as unavailable? Mockup: no. **Conflicts with I-D6** (a held item counts as not in). Build default: held counts as not in, in both places (plan-week-ai 33: a hold is a real claim). Handoff X8.
- ~~Does Put away need agreement in a household with admins (preferences D25 to D30)?~~ **Closed by R-D31 (locked):** no admin approval.
- Still open (unchanged): the tab bar items (R-O6), the editing screen (owner: "we'll do that later"), what "sorted" means for R-D29.

### For the implementation

- Default path loads the list only: theme, `recipe.css`, one shared script. Day picker, version tree, note and photo sheets are built on tap; Add, Check it, Change it and Cook are separate routes. On the recipe page load the first photo only; Cooked and Photos below the fold can be fetched as they near the viewport.
- Class names (`.rr`, `.ing`, `.strip`, `.act`, `.sheet`, `.serves`) and tokens are meant to be lifted. Sample names are only in `recipe/recipe.js`.
- Recipe tools used: `list_recipes` / `search_recipes` (list), `get_resolved_recipe` and `list_variations` / `get_lineage` (page and versions), `what_am_i_missing` (pantry dots), `create_recipe` with `basis` and `potential_duplicates` (assistant only after R-O4), `create_variation` with `user_intent` (assistant, and the end of a cook's "Keep it as a version"), `record_usage` (end of cook), `set_preference` (star), `set_recipe_status` (Put away). Plan entries, holds and shopping belong to Kitchie.

---

## Slice: recipe versions and lifecycle

Mockup: [`recipe-versions/`](../../../recipe-versions/index.html) (index with decisions and options, `version.html`, `family.html`, `change.html`, `history.html` (history and compare), `after-cook.html`, `suggestions.html`, backend `spec.html`; shared `versions.css`, `versions.js` on top of the flow slice's `recipe/recipe.css` and `recipe/recipe.js`).

### Job

Owner's brief (10 October 2026, paraphrased): Recipe treats recipes and variations as immutable, and that should be relaxed a lot. People do not know what "the recipe" is. Sometimes they need to update the same version in place, sometimes keep several, sometimes spin one off with a parent. They may not want to lock in a recipe until it is tasty (a draft or trying state). Assistants (AI via MCP) and the UI both create and update. **Changed later the same evening by R-O4 (locked):** recipe content comes only through the assistant over MCP; the UI adds photos and notes. What the UI may still do to versions (state, the usual, put away) stands; whether the UI edits content waits for the editing-screen conversation ("we'll do that later"). Database changes are fine; everything stays in UAT.

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
6. **V-D6 Stars are per member** and never change what the household opens. **Open, cross-feature X5:** the preferences notes keep Recipe stars household-wide (fact F1, Q1, Q-R8).
7. **V-D7 A version row:** name, what it changed from its parent, who and when, cooked count and revision, usual and state pills. Assistant work shows a dashed ✦ and "Alex's assistant".
8. **V-D8 Versions is a screen,** opened from the R-D20 chip; the flow slice's sheet can stay for a quick switch. **Changed by R-O3 (locked):** there is no chip; the strip (several versions only) is the quick switch. Where the Versions screen is opened from is the versions slice's to redraw (V1 still open).
9. **V-D9 All lifecycle actions in the version's ⋯ sheet, only those that apply:** Make it our usual, New version from this, Make it its own recipe, History, Compare with our usual, Keep it, Back to trying, Put away.
10. **V-D10 Three kinds of change in the person's words:** Fix this one (next revision), Keep both (new version, parent = this, starts Trying), It is a different dish now (spin off). **R-O4 (locked):** content changes arrive through the assistant; in the app they appear only where the end of a cook keeps a swap as a version, until the editing screen is decided.
11. **V-D11 Where a change goes: option 2** (recommended C). The top band says where it lands first. Supersedes R-D16.
12. **V-D12 A child is pinned to its parent's revision.** A later parent fix is offered once ("Bring it in"), never applied silently.
13. **V-D13 History:** revisions newest first with kind, who (assistant marked), when, their words, diff in the R-D20 tint; See it as it was; Go back saves a new revision.
14. **V-D14 Compare:** two columns, only what differs, the rest folded into one line; left is always the usual.
15. **V-D15 Kept as audit trail, never changed or deleted:** revisions, cook log (version and revision), journal, nutrition observations (on a revision), suggestions and outcomes, spin-off links.
16. **V-D16 Relaxed:** version name, state, current revision, `cover_photo_id` (P-D4); family name and usual; per-member stars. Each change is a journal event with who and when.
17. **V-D17 The person's words stay required when an assistant acts.** In the app the tap is the intent and "why" is optional. Each revision records which.
18. **V-D18 Promoting a try: option 3** (recommended A: after every cook of a Trying version: Keep it, Needs work, Not for us). Keep it offers "Make it our usual" separately. Sits inside R-D19's single end-of-cook ask.
19. **V-D19 Any cooking member answers; the first answer counts;** a later cook can change it. ~~Followers are not asked.~~ **R-O5 (locked):** no followers; any member who cooks it is asked.
20. **V-D20 Every revision and state change has an author (member) and a channel (app or assistant).** An assistant acts for one member. Answers G5.
21. **V-D21 Assistant and kept versions: option 4** (recommended A: a kept version or the usual changes only through a suggestion; tries can be created and fixed with the person's words).
22. **V-D22 Suggestions wait quietly** (slim line on the version and Versions, a Suggestions screen; never a pop-up or on Home). Apply, Keep both, Not now, No thanks. A whole new recipe from an assistant is a family whose only version is Suggested: R-D12's draft. Answers G3 (drafts live in Recipe).
23. **V-D23 Who may do what:** ~~any non-follower makes, fixes, keeps and puts away versions; changing the usual and putting away a version others cooked follow the household-admin rule where there are admins (preferences D25 to D30).~~ **Changed by R-O5 and R-D31 (locked): equal roles for now, Recipe side.** Every member may make, fix, keep, put away versions and families and change the usual; no admin check on any Recipe write. The usual cannot be put away until another is the usual (BR4, unchanged). What stays with the preferences owner is in handoff X3.
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

**R-O5 and R-D31 (locked):** the spec's admin check on `set_usual`, `set_family_put_away` and putting away a version others cooked (`not_allowed` for the admin rule) is not built for now; `not_allowed` stays only for app-only tools on the assistant channel. **R-O4 (locked):** the MCP surface becomes the only way recipe content enters, so it must be rich (handoff RT-R10). Full detail in [`recipe-versions/spec.html`](../../../recipe-versions/spec.html): rules BR1 to BR13, schema v6 (families, versions, revisions, suggestions, cooks, member_prefs, legacy_ids), new tools (`get_family`, `get_version`, `create_version`, `revise_version`, `restore_revision`, `list_revisions`, `compare_versions`, `set_version_state`, `set_usual`, `rename`, `spin_off`, `propose_change`, `list_suggestions`, `resolve_suggestion`, `record_cook`, `list_cooks`), error codes (`stale_base`, `needs_person`, `bad_transition`, `is_usual`, `no_change`, `intent_required`, `not_allowed`, `too_many_open`), today's tools as aliases for a release, HTTP routes for Kitchie, and the v5 to v6 migration. Proposed issues R-V1 to R-V9. R-V1 (relaxing "recipes and variations are immutable" in Recipe's AGENTS.md and brief) is owner-reserved and comes first.

### Open questions

- Options V1 to V6, all still open (owner, 10 Oct 2026: not locked). A wrong guess on V2 or V4 changes what people trust; on V5 or V6 it costs a second migration.
- Options V1 and V3 to V6 (V2 is listed above).
- "Not for us" on the first cook of a try in a household of several cooks: put away at once (mockup, with undo) or wait for a second opinion?
- Do notes and photos sit on the family (R-D24) or on a version? Mockup: notes on the family, cook photos on the cook entry. **Answered for photos by P-D9** (version or cook).
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

### Decisions (all Proposal, I-D numbering; the owner has not reviewed this pane yet)

1. **I-D1 The pane answers one question: the next meal.** Tonight before 8pm, tomorrow after.
2. **I-D2 Saved recipes and freezer portions only.** Nothing invented in the pane by default.
3. **I-D3 Kitchie ranks; Recipe answers; deterministic,** so Why can say exactly why (option 4 A).
4. **I-D4 Two passes: filter, then score.** Filters never score, scores never exclude.
5. **I-D5 Filters, always listed under "Left out tonight" with the reason** (avoid and cap from the food rules' `evaluate()`, cap counted as food Q-F3): avoid of anyone eating, cap reached, already planned this week, cooked in the last two days, "Not tonight" today, put away.
6. **I-D6 Score** (likes, dislikes, avoids and caps come from the preferences service's `evaluate()`, not a second reading of food rules; handoff X4): ready (all in +3, one missing +1, two ≈0, three or more −2; a missing item already on the list costs less); use it up (+2 due in 3 days, +3 due tomorrow, max +4); rotation (+2 a month, +1 two weeks, −2 within 4 days, +1.5 never cooked); trying a version +1.5 for its maker; favourite +1; quick weeknight +1, over an hour −2; dislike of someone eating −1.5, like +1. Ties: fewer missing, then longest since cooked. Starting numbers, tuned with use. A held item counts as not in.
7. **I-D7 One knob, Lean towards:** Balanced, Use it up, Quick, Favourites, Something different, Batch. Doubles one family of reasons. Per person; the batch cooker starts on Batch.
8. **I-D8 Who is eating** comes from tonight's plan, else everyone; changeable for tonight only. Filters and weights read the people eating, not the viewer.
9. **I-D9 A freezer dish is offered as itself** ("Have it tonight"), and its recipe is not offered again. Needs K2.
10. **I-D10 One line per idea:** strongest reason, then what is missing or a caveat for someone eating, else "all in".
11. **I-D11 See all:** full ranked list, a reason tag per row, the lean as the shared chip strip, "Possible, not a great fit", then "Left out tonight (N)" folded.
12. **I-D12 Why (ⓘ):** a sheet of + and − reasons with their source, and "Nothing here was guessed by an AI". Not tonight (snooze today) and Not for me (a dislike for the viewer in Kitchie food rules, with Undo). **Open, cross-feature X7** (food Q-F6: rules are made through the assistant).
13. **I-D13 Acting uses existing Kitchie tools:** Cook now `start_cooking` (recipe id, resolved ingredients); Plan via the day picker then `plan_meal` and `plan_reserve` (Hold on by default); cart `plan_add_missing_to_list` or `shopping_add`; freezer `plan_meal` leftover; end of cook `cook_meal` and Recipe `record_usage`. Recipe holds no stock. **Reworded:** after schema v6 the id is the usual's version id (V-D5) and the end of a cook is `record_cook` (`record_usage` stays as its alias, V-D28).
14. **I-D14 Tonight planned leads,** then two "If plans change" rows ~~(one for a follower)~~ (R-O5: no followers). The ideas slice as a whole is not reviewed yet.
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

Seeing what a recipe looks like when choosing it, keeping a picture of what was actually cooked, and adding one with as little effort as possible, from the app or by showing it to the assistant. **R-O4 (locked) puts photos at the centre of what the app adds:** extra photos, especially after cooking, and notes. No photo is ever read for recipe content. Owner's brief (10 October 2026, paraphrased): lock the architecture before anything is built (where bytes live, storage on the existing Tencent Lighthouse 2 vCPU / 2 GB server with snap Docker, pay for nothing, backups include photos, sizes and formats, upload from the UI and from AI, limits, per-version vs per-recipe, cooked-it photos, privacy through the Platform household token, caching, deletion); site performance is strict: lazy and progressive, nothing loaded until needed, thumbnails in lists, a tiny placeholder.

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
12. **P-D12 From an assistant:** a one-time add link (15 minutes, one use, bound to household and target) opens Kitchie's add screen already aimed; the person picks the photo. ~~Later, for drafts from a web page, a photo address Recipe fetches (https, public addresses only, 8 MB, images only), shown on Check it so a person keeps or drops it.~~ **Later part dropped by R-O4 (locked):** no scraping and no web fetch; Recipe never fetches a photo address. The one-time add link stands as a proposal. Option P5 (C dropped).
13. **P-D13 Cooked-it photos are part of the cook entry** (G2, the versions slice's `record_cook`, up to 3 photo ids); thumbnail on that night's Cooked row and in Photos with date and who; not the cover unless chosen or nothing else exists.
14. **P-D14 Nothing jumps, nothing loads early:** every box sized up front and filled with the photo's colour (no request); thumbnails load within 200px of the screen; only the page's cover loads up front, with the inline 24px preview; its siblings on first swipe; the large size only in the viewer; the add screen and its shrinking code are a separate route.
15. **P-D15 Private to the household:** same-site addresses, Platform sign-in cookie and household checked on every request (locally, platform D11); 404 for anyone else; no public URLs, no tokens in addresses. Option P8.
16. **P-D16 Caching:** bytes never change (replace = new id), so `private, max-age=31536000, immutable`; no shared cache.
17. **P-D17 Removing:** ~~by the person who added it or a household admin (no admins: any member but a follower);~~ **R-O5 (locked): equal roles for now, any member may remove any photo;** hidden at once with Undo, restorable 30 days, then files deleted and only the fact kept; "Delete it for good now" skips the wait; a removed cover falls back per P-D10; a household that leaves takes its photos. Option P10 (still open). Roles: X3 and X6 settled for the Recipe side by R-O5.
18. **P-D18 Backups:** the existing data-folder backup includes photos, database first then photos; switch to copying only new files past about 500 MB. Option P11.
19. **P-D19 No photo, no pretend photo:** emoji in the tile and beside the title (R-D9 stands); Photos shows one dashed line "No photos yet: snap it next time you cook it" with one tap to add.
20. **P-D20 Top of the recipe page:** option P12.
21. **P-D21 Lists:** option P13. One 240px square serves every thumbnail in the app.
22. **P-D22 Viewer:** large photo with who and when; Replace cover or Use as cover; Remove only for those allowed (others are told who can).
23. **P-D23 Step photos later:** same mechanism, kind `step` plus a step number.
24. ~~**P-D24 A photo from someone else's site** is kept for the household only, with its source page, never shown outside.~~ **Void by R-O4 (locked):** no web photos at all.

How this changes other slices: R-D9 stands, and gains P-D19's empty line in Photos. R-D19's optional photo is P-D11's add screen with Tonight's cook preselected. R-D26 and G2: a cook carries up to 3 photo ids (P-D13). G7 is answered by P-D1 to P-D18. Versions slice: `record_cook.photo_ref` becomes `photo_ids` (up to 3); a version gains `cover_photo_id`; V-D25 spin-off gains "Bring the cover along"; the open question "notes and photos on the family or a version" is answered for photos by P-D9.

### Options awaiting yay, nay or combine (P1 to P13 not locked)

| # | Question | A | B | C | Recommended | Downside of the pick |
|---|---|---|---|---|---|---|
| P1 | Who owns photos | Recipe | Shared Platform service | Kitchie | A | Recipe gains file serving; Kitchie item photos later would repeat it |
| P2 | Where bytes sit | Files beside `recipes.db` | SQLite blobs | Tencent COS | A | Row and files must be kept in step (files first, nightly sweep) |
| P3 | What is kept | Three WebP sizes, no original | Plus original | Original only, resize on view | A | No full-quality original ever |
| P4 | Who shrinks | Phone | Server library | Phone to 1600, server the rest | A | Server must strictly check bytes; web photos wait for a server library |
| P5 | Assistant upload | One-time add link | Base64 in the tool call | ~~Photo URL fetched by Recipe~~ (dropped by R-O4) | A (open) | One more tap; assistant never sees the photo |
| P6 | Attached to | Version or cook | Whole recipe | Revision | A | New version shows parent's photo until it has one |
| P7 | No cover | Parent's, then newest cooked | Recipe photos only | Newest of any kind | A | A messy dinner photo can lead unchosen (dated) |
| P8 | Privacy | Same-site cookie check | Signed expiring links | Script-loaded with token | A | Needs one site for Kitchie and Recipe; no sharing out |
| P9 | Limits | Tight (6/3/1 MB/2 GB) | Roomy (20/10/5 GB) | Household total only | A | Stage-by-stage photographers hit 3 per cook |
| P10 | Removing | Hidden, purge after 30 days | Gone at once | Never deleted | A | File lingers 30 days and in backups |
| P11 | Backups | With the database | Database plus new files only | None | A now, B past 500 MB | Every backup copies all photos; still on the same server |
| P12 | Top of page | Full width 195px, swipe | 72px square by title | None | A | Ingredients start lower; biggest download on the page |
| P13 | Lists | Cover in the 56px tile | No photos in lists | 40px thumb, slimmer rows | A | Each visible row downloads ~12 KB |

### Recipe-side work (to file as Recipe issues once directions are picked; not filed)

RP1 photos table and folder with files-then-row writes and a nightly sweep (strays, 30-day purge). RP2 upload, serve, remove, restore, delete-now routes with checks, limits and cache headers. RP3 version cover pointer, fallbacks, photo ids in replies. RP4 Recipe accepts the Platform cookie on photo `GET` (today bearer header only). RP5 `request_photo_upload` and the one-time link. RP6 backup runbook includes the photo folder, database first. ~~RP7 later: web photo for drafts (server image library, private-network fencing).~~ RP7 dropped by R-O4 (locked). Kitchie: the add route with in-browser shrinking, the frame markup, the ~40-line loader; nothing stored.

### Open questions

- Free disk on the server's data folder (not recorded anywhere readable). A wrong guess fills the server; P-D8's cap is the guard.
- An off-server backup copy at no cost in the current Tencent plan? Infra's call, for all apps.
- ~~P4 A means a web photo for a draft (P5 C) waits for a server image library.~~ Closed: R-O4 drops web photos.
- ~~Can a follower add a cooked photo?~~ Closed by R-O5: every member adds and removes alike.
- Replacing a cover: keep the old one in Photos (mockup) or remove it?
- P8 A assumes Kitchie and Recipe stay on one site; a separate subdomain later needs P8 B.

### For the implementation

- Default path: the list sends ids and colours; thumbnails load as rows near the screen. The recipe page loads one medium cover with its inline preview; everything else on approach, on swipe, or in the viewer. Add is its own route. The Mockup panel meter counts what each screen fetched (sample pictures are flat drawings, far smaller than real photos).
- Classes to lift beside the flow slice's: `.pf` (frame: `--pc` colour, `--lq` preview, `.in` when loaded), `.hero2`, `.pcap`, `.tthumb`, `.pgal`, `.pempty`, `.pv` (viewer), `.frame`, `.kind`. `tools/shots-photos.mjs` captures every photo screen at three scroll points.

---

## Reconciliation (10 October 2026)

Done by a reconciliation agent after the four slices landed. Full detail, with build defaults, in [recipe-tab-handoff.md](recipe-tab-handoff.md). Only the recipe slices' own files were changed; where a conflict touches another feature's decision, it is recorded there as a cross-feature question (X1 to X14) and the other feature's notes are untouched.

- **Superseded:** R-D16 (by V-D10, V-D11).
- **Reworded:** R-D11, R-D15, R-D17, R-D19, R-D20, R-D25, R-D26, I-D13 (by V-D, P-D decisions as marked above). The flow mockup's screens now say "our usual" and "Fix this one or keep both".
- **Field names aligned:** `record_cook.photo_ref` is now `photo_ids` (up to 3, P-D13); versions gain `cover_photo_id` (P-D4) in the backend spec; the spec gains a family put-away call for R-D25.
- **Answered gaps:** G2 (V-D28, P-D13), G3 (V-D22), G4 (V-D5), G5 (V-D20), G7 (P-D1 to P-D18), G10 and G12 (schema v6 reads the usual's head and returns state), G13 (no change). Still open: G1, G6, G8, G9, G11 (stars per member, X5), K1 to K3, and the new Kitchie gaps K4 (plan entry carries a version id) and K5 (one cook writes both apps).
- **Open, owner's call, not decided:** the tab bar (option 6, R-D2).
- **Numbering clash to watch:** the ideas slice's K1 to K3 are gaps, not the preferences handoff's Kitchie slices K0 to K17; photo options P1 to P13 are not preferences principles P1 to P6. The handoff names its own build slices RT-R and RT-K.

## Owner's locked decisions applied (10 October 2026, evening)

Applied by the docs agent after the owner's voice session (L1 to L9, recorded at the top as R-O1 to R-O5 and R-D29 to R-D32). Only this feature's notes were changed; the Plan features' notes are untouched and get cross-feature requests instead (handoff section 11).

- **Settled:** R-D7 (R-O2 A), R-D20 (R-O3 B varied), options 1 to 5.
- **Void:** R-D8 and option 5 (R-O5); P-D24, P-D12's later part, P5 C and RP7 (R-O4); gap G8 (R-O4).
- **Narrowed:** R-D4, R-D13, R-D14, R-D15, R-D21 (R-O4); R-D18 (R-D30); R-D25 (R-D31); V-D8 (R-O3); V-D10 (R-O4); V-D19, V-D23, P-D17 (R-O5, equal roles); I-D14 (R-O5).
- **Closed open questions:** who reads photos or links (nobody); can followers change recipes (no followers); does Put away need admin agreement (no).
- **Still open, exactly as before:** the tab bar items (R-O6; the voice session's "locked as A" was an assistant's error), V2, the editing screen, the cooking-ideas pane, P1 to P13, V1 and V3 to V6, I-O4, R-V1, X16.
- **The flow mockup screens** (`recipe/list.html`, `detail.html`, `add.html`, `review.html`, `edit.html`, `cook.html`) and the versions and photos screens are being redrawn by their own agents in parallel; these notes record the decisions, the screens show them.
- **Nothing has been built, and nothing has been filed.**
