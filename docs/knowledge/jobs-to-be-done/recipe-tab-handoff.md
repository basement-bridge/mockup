# Recipe tab: build handoff

Status: **written 10 October 2026 (Sydney) by the reconciliation agent, after the four Recipe tab slices landed on `main`; updated the same evening with the owner's locked decisions (voice, about 22:00 to 22:30 Sydney: L1 to L9, recorded as R-O1 to R-O5 and R-D29 to R-D32, section 2.0).** Decisions marked **Locked** are the owner's; everything else is a **Proposal** until the owner says otherwise. **Nothing has been built, and nothing has been filed as an issue** in `recipe`, `kitchie`, `platform` or `infra`. The issue lists in this file (R-V1 to R-V9, RP1 to RP6, slice titles) are drafts for the owner to file or approve.

**Build rules, whenever building starts:** (1) the built screen matches the mockup exactly (markup, classes, tokens; every difference listed in the PR); (2) performance first, lazy loading (`DESIGN.md` section 6: load on engagement, routes and sheets on tap); (3) headless-browser screenshots at 360, 390, 768 and 1280, light and dark, before a UI change is called done. Details in section 9.

Who reads this: the owner first (section 3, the yay/nay list), then any agent that builds the Recipe tab in `recipe`, `kitchie` or `infra`. Start at section 7 (slices) and section 9 (rules); use sections 4 and 5 when you hit an open question; read section 6 before touching shared code. Each app repo's own `AGENTS.md` and `docs/project-plan.md` still come first; where this file and an `AGENTS.md` disagree, **`AGENTS.md` wins**.

How it was made: read-only checks on 10 October 2026 of this repo (`main` at 3f99f77 when started), `recipe` (`main` 5cec532: schema v5, `SCHEMA_VERSION = 5`, `basis` observed, inferred, unknown, entered), `kitchie` (`main` 236bbff: bottom bar, hosted Recipes screen R34, `plan_entries.recipe_id`) and `platform`. Code facts are as of those commits; re-check the file you are about to change.

## Contents

1. Status and sources
2. Decision index (locked first, then R, V, P, I)
3. The owner's yay/nay list, in the order to decide
4. Cross-feature questions (X1 to X16)
5. Open questions within the Recipe tab, with build defaults
6. Architecture: who owns what
7. Build slices, dependency ordered
8. Gaps mapped to slices
9. Process rules for the build
10. What the reconciliation changed, and what it left alone
11. Cross-feature requests (XR1 to XR3)

---

## 1. Status and sources

| # | Source (this repo) | Holds | Status |
|---|---|---|---|
| 1 | [`recipe-tab.md`](recipe-tab.md) | All four slices' decisions, options, gaps, open questions; reconciliation marks inline | Proposal |
| 2 | [`recipe/`](../../../recipe/index.html) | The flow: list, recipe page, add, check it, change, cook (R-D1 to R-D32, G1 to G9) | Options 1 to 5 locked (R-O1 to R-O5), R-D29 to R-D32 locked; R-D8 void; R-D16 superseded; rest Proposal |
| 3 | [`recipe-versions/`](../../../recipe-versions/index.html), [`spec.html`](../../../recipe-versions/spec.html) | Versions and lifecycle (V-D1 to V-D30); backend rules BR1 to BR13, schema v6, tools, errors, HTTP, migration, issues R-V1 to R-V9 | Proposal |
| 4 | [`recipe-photos/`](../../../recipe-photos/index.html) | Photos (P-D1 to P-D24, options P1 to P13, work RP1 to RP7) | Proposal; P-D12 later part, P-D24, P5 C, RP7 void by R-O4 |
| 5 | [`recipe-ideas/`](../../../recipe-ideas/index.html) | Cooking ideas pane (I-D1 to I-D20, options I-O1 to I-O4, gaps G10 to G13, K1 to K3) | Proposal |
| 6 | `AGENTS.md`, `DESIGN.md`, `docs/knowledge/README.md` | Mockup and build stay close; performance; closed vocabulary | Binding |
| 7 | Other features' notes (read only, never edited here): [`../preferences-build-handoff.md`](../preferences-build-handoff.md), `../user-preferences/` ([`food-preferences.md`](../user-preferences/food-preferences.md), [`boundary-contract.md`](../user-preferences/boundary-contract.md)), [`../preferences-principles.md`](../preferences-principles.md), [`plan-week-ai.md`](plan-week-ai.md), [`plan-desktop.md`](plan-desktop.md), [`shopping-without-the-app.md`](shopping-without-the-app.md), [`../shopper-link.md`](../shopper-link.md) | Decisions that bind or meet the Recipe tab | Theirs |

**Precedence when notes disagree.** (1) An owner decision (this feature's locked R-O1 to R-O5 and R-D29 to R-D32, plan-week-ai 1 to 48, preferences D1 to D30 and food F1 to F14, shopper-link SL-D1 to SL-D16, the owner's Recipe tab brief of 10 October). (2) The repos' `AGENTS.md`. (3) A later recipe slice that says it supersedes an earlier one (V-D10 and V-D11 over R-D16). (4) Proposals. Where a recipe proposal meets another feature's owner decision, the other feature wins and the point is listed in section 4.

**Series names, so nothing clashes.** R-D, V-D, P-D, I-D are this feature's decisions. P1 to P13 are photo *options* (not preferences principles P1 to P6). K1 to K3 (and K4, K5 added here) are Kitchie *gaps* (not the preferences handoff's Kitchie slices K0 to K17). G1 to G13 are Recipe gaps. Build slices here are named **RT-R** (Recipe), **RT-K** (Kitchie), **RT-I** (infra). X1 to X16 are cross-feature questions; XR1 to XR3 are cross-feature requests (section 11). R-O1 to R-O6 are the flow slice's options 1 to 6 with the owner's answer; L1 to L9 are the owner's own order in the voice session of 10 October.

---

## 2. Decision index

Status words: **locked** (the owner's, voice, 10 Oct 2026); **proposal** (drawn, owner silent); **open** (an option the owner picks; the recommendation is given); **superseded** or **void** (replaced, kept for history); **narrowed** or **reworded** (stands, with scope or words changed by a later decision); **cross** (meets another feature's decision; see section 4).

### 2.0 Locked by the owner (voice, 10 October 2026, about 22:00 to 22:30 Sydney)

| Owner | ID | Locked decision | Supersedes or changes |
|---|---|---|---|
| L1 | R-O1 = A | One ranked list | Options 1 B, 1 C dropped |
| L2 | R-O2 = A | One continuous scroll; jump row docked at the top | Settles R-D7 |
| L3 | R-O3 = B, varied | No versions row for a single-version recipe; a horizontally scrolling strip for several; it docks as its own row above the jump row | Settles R-D20; the chip (3 A) and V-D8's "from the chip" go |
| L4 | R-O4 = redefined | No link paste, no scraping, no photo or link reading, no one box or four doors. Recipe content comes **only** through the person's AI assistant, over a very rich MCP surface. The UI adds extra photos (especially after cooking) and notes | Voids options 4 A and 4 B; narrows R-D4, R-D13, R-D14, R-D15, R-D21, V-D10; drops G8, P-D12's later part, P-D24, P5 C, RP7, RT-R8; adds RT-R10 |
| L5 | R-O5 = void | Follower-versus-cook distinction dropped: all members equal, same controls; restrictions later if ever needed | Voids option 5 and R-D8; V-D19, V-D23, P-D17 to equal roles; X3 and X6 settled for the Recipe side |
| L6 | R-D29 | On the Plan tab, once a planned meal's items are sorted, tapping it goes straight into cook mode (Plan-tab behaviour) | Cross-feature requests XR1, XR2 (section 11) |
| L7 | R-D30 | Cook-mode step buttons labelled with the destination step's content, not Back and Next | Rewords R-D18 |
| L8 | R-D31 | Putting away needs no admin approval | Changes V-D23, the X3 default, the spec's `not_allowed` admin rule |
| L9 | R-D32 | Navigation pattern unchanged: left gutter (rail) on desktop, bottom nav on mobile | Pattern only; the bar's items stay open (R-O6) |

**Not locked; open exactly as before.** R-O6, the tab bar items (option 6, R-D2, X1): the owner said "moving on" without picking. **An assistant said "locked as A" in the voice session; that was wrong, nothing was picked.** Also open: V2 (where a change goes); the editing screen (owner: "we'll do that later"); the cooking-ideas pane (not reviewed yet); photo storage options P1 to P13 (P5 C dropped by R-O4, the rest open); versions options V1 and V3 to V6; where ranking runs (I-O4); R-V1 (relaxing immutability); who draws the tab (X16).

### 2.1 Flow (R-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| R-D1 | The tab opens on the list; ideas live on Home | proposal | Needs a Home tab: X1 |
| R-D2 | Tab bar: Plan, Pantry, Recipes, Shopping | **open, owner's call** (option 6, R-O6) | X1; not decided (the voice session's "locked as A" was an assistant's error). Pattern locked by R-D32 |
| R-D3 | Kitchie renders, Recipe owns | proposal (owner's brief) | Meets Kitchie R34 hosted fragment: X16 |
| R-D4 | One top row: search and Add | proposal; **narrowed by R-O4** | Add hands off to the person's AI app (Proposal); no in-app form |
| R-D5 | One chip strip (plan-week-ai 48): All, Ready now, Starred, Batch, Under 30, Added by me | proposal | Starred: X5; Added by me needs V-D20 |
| R-D6 | Swipe right to plan; no swipe left | proposal | |
| R-D7 | Recipe page layout | **locked R-O2 = A** | One scroll, jump row docked at top |
| R-D8 | The follower | **void by R-O5** | All members equal |
| R-D9 | Photos only when there are photos | proposal | P-D19 adds the empty line |
| R-D10 | Serves scales every amount; batches step whole | proposal | plan-week-ai 10 |
| R-D11 | Cook it and Plan it at the bottom; rest in ⋯ | reworded by V-D9 | "Make it our usual" |
| R-D12 | Drafts wait in one slim line on the list | proposal | Drafts are V-D22 Suggested families |
| R-D13 | Adding | **narrowed by R-O4** (options 4 A and B void) | Content only through the assistant; the app adds photos and notes |
| R-D14 | One Check it screen; basis shown | proposal; **narrowed by R-O4** | Assistant drafts only; no photo or link reads |
| R-D15 | Save is one tap; Not now or Discard | reworded by V-D22; narrowed by R-O4 | Save makes a Suggested draft Trying; Discard drops out |
| R-D16 | Changing always makes a new version | **superseded by V-D10, V-D11** | |
| R-D17 | Version named from its change; words as `user_intent`; usual is a separate tick | reworded by V-D10, V-D17 | Keep both and spin off only |
| R-D18 | Cook opens on ingredients, one step per screen | proposal; **reworded by R-D30** | Step buttons name the destination step |
| R-D19 | End of a cook asks once | reworded by V-D18, P-D11, P-D13 | Order in 5.1 |
| R-D20 | Versions | **locked R-O3 = B, varied** | No row for one version; scrolling strip above the jump row |
| R-D21 | Likely duplicate shown, never merged | proposal; narrowed by R-O4 | Assistant drafts only |
| R-D22 | Missing: cart per row, Add all, substitutes hint | proposal | plan-week-ai 11, 29; feeds shopping: X12 |
| R-D23 | Hold only when planned, "Held for Tue" | proposal | plan-week-ai 9, 33 |
| R-D24 | Notes are the household's, on the family | proposal | G1 |
| R-D25 | Put away, not delete | reworded by V-D2; **R-D31** | Family put-away tool added: X9; no admin approval |
| R-D26 | Cooked is a short history | proposal; answered by V-D28, P-D13 | Two cook histories: X10 |
| R-D27 | List order: fewest missing, then longest since cooked | proposal | |
| R-D28 | Day picker: this week, up to four ahead, adds never replaces | proposal | plan-week-ai 1 |
| R-D29 | Plan tab: a sorted meal taps straight into cook mode | **locked** (L6) | Plan's behaviour: XR1, XR2 |
| R-D30 | Step buttons labelled with the destination step | **locked** (L7) | |
| R-D31 | Put away needs no admin approval | **locked** (L8) | |
| R-D32 | Navigation pattern unchanged (rail desktop, bottom nav phone) | **locked** (L9) | Items: R-O6 open |

### 2.2 Versions (V-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| V-D1 | Three layers: family, version, revision | proposal | Needs R-V1 |
| V-D2 | Four states: Suggested, Trying, Kept, Put away | proposal | |
| V-D3 | Transitions | proposal | |
| V-D4 | State in one slim band | proposal | |
| V-D5 | "The recipe" is the family, opening its usual | proposal | Answers G4 |
| V-D6 | Stars per member | **cross** | X5 |
| V-D7 | A version row | proposal | |
| V-D8 | Versions is a screen | open (V1, rec A by state); **changed by R-O3** | No chip; entry point to redraw |
| V-D9 | Lifecycle actions in the ⋯ sheet | proposal | |
| V-D10 | Three kinds of change: Fix, Keep both, Spin off | proposal; narrowed by R-O4 | Content through the assistant; editing screen later |
| V-D11 | Where a change goes | open (V2, rec C by state) | Supersedes R-D16 |
| V-D12 | Child pinned to parent's revision | proposal | |
| V-D13 | History; Go back saves a new revision | proposal | |
| V-D14 | Compare against the usual | proposal | |
| V-D15 | Audit trail kept | proposal | |
| V-D16 | What is mutable | proposal | `cover_photo_id` added (P-D4) |
| V-D17 | Words required when an assistant acts | proposal | |
| V-D18 | Promote a try after a cook | open (V3, rec A) | |
| V-D19 | Any cooking member answers; first counts | proposal; **R-O5** | No followers: every cook is asked |
| V-D20 | Author and channel on every write | proposal | Answers G5 |
| V-D21 | Assistant and kept versions | open (V4, rec A suggest only) | |
| V-D22 | Suggestions wait quietly; drafts in Recipe | proposal | Answers G3 |
| V-D23 | Who may do what | **changed by R-O5, R-D31: equal roles for now (Recipe side)** | X3, X6 |
| V-D24 | Two saves never overwrite | proposal | `stale_base` |
| V-D25 | Spin off | proposal | P-D9 "Bring the cover along" |
| V-D26 | "Version" on screen, never "variation" | proposal | |
| V-D27 | Migration without loss | proposal | |
| V-D28 | Cook log records version and revision | proposal | Extends G2 |
| V-D29 | Nutrition belongs to a revision | proposal | |
| V-D30 | Loading | proposal | |
| V5, V6 | How far immutability relaxes; what a revision stores | open (rec A, A) | Blocking, with R-V1 |

### 2.3 Photos (P-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| P-D1 | Recipe owns recipe photos | open (P1, rec A) | Blocking |
| P-D2 | Files beside `recipes.db` | open (P2, rec A) | Blocking |
| P-D3 | Disk budget about 350 KB a photo | proposal | Free disk unknown |
| P-D4 | One row per photo; `cover_photo_id` on a version | proposal | Spec aligned |
| P-D5 | Contract: ids and colour, never bytes | proposal | |
| P-D6 | Three WebP sizes, no original | open (P3, rec A) | Blocking |
| P-D7 | The phone makes the sizes | open (P4, rec A) | Blocking |
| P-D8 | Limits 6/3/1 MB/2 GB/60 an hour | open (P9, rec A) | |
| P-D9 | A photo belongs to a version or a cook | open (P6, rec A) | |
| P-D10 | Cover and fallbacks | open (P7, rec A) | |
| P-D11 | Adding from the app | proposal | |
| P-D12 | From an assistant: one-time add link | open (P5, rec A); **later part void by R-O4** | No web fetch |
| P-D13 | Cooked photos on the cook entry, up to 3 | proposal | `record_cook.photo_ids` |
| P-D14 | Nothing jumps, nothing loads early | proposal | |
| P-D15 | Private to the household, same-site cookie | open (P8, rec A) | Blocking; RP4 |
| P-D16 | Caching: immutable, private | proposal | |
| P-D17 | Removing | open (P10, rec A); **R-O5: any member** | X3, X6 settled for Recipe |
| P-D18 | Backups | open (P11, rec A now) | Infra |
| P-D19 | No photo, no pretend photo | proposal | |
| P-D20 | Top of the recipe page | open (P12, rec A) | |
| P-D21 | Lists | open (P13, rec A) | |
| P-D22 | Viewer | proposal | |
| P-D23 | Step photos later | proposal | |
| P-D24 | Web photos stay in the household | **void by R-O4** | No web photos |

### 2.4 Ideas (I-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| I-D1 | The pane answers the next meal | proposal | Needs Home: X1 |
| I-D2 | Saved recipes and freezer portions only | proposal | |
| I-D3 | Kitchie ranks, deterministic | open (I-O4, rec A) | Blocking |
| I-D4 | Filter, then score | proposal | |
| I-D5 | Filters listed with reasons | proposal; **cross** | Avoid and cap from food rules: X4 |
| I-D6 | Score weights | proposal; **cross** | Like/dislike arithmetic: X4; held: X8 |
| I-D7 | One knob: Lean towards | proposal | Where it is stored: X15 |
| I-D8 | Who is eating | proposal | |
| I-D9 | Freezer dish offered as itself | proposal | K2 |
| I-D10 | One line per idea | proposal | |
| I-D11 | See all | proposal | |
| I-D12 | Why; Not tonight; Not for me | proposal; **cross** | X7 |
| I-D13 | Acting through Kitchie tools | reworded | Version id after v6; `record_cook` |
| I-D14 | Tonight planned leads | proposal | "One row for a follower" void (R-O5) |
| I-D15 | Plan ahead | proposal | |
| I-D16 | States | proposal | |
| I-D17 | The assistant | open (I-O3, rec A) | K1 |
| I-D18 | Three on the pane, all on See all | proposal | |
| I-D19 | Seasonality and nutrition left out | proposal | |
| I-D20 | Desktop: the Home side panel | proposal, not drawn | X13 |
| I-O1, I-O2 | Pane shape; tuning | open (rec A, A) | |

---

## 3. The owner's yay/nay list, in the order to decide

Reordered on 10 October 2026 (evening) after the owner's locked decisions (section 2.0). Settled and removed from this list: options 1 to 5 (R-O1 to R-O5), the admin rule for putting away and removing photos (R-D31, R-O5), who reads photos or links (R-O4: nobody). Blocking items first: each one stops a build slice until answered. Then the choices that change what people trust, then layout picks, then small ones. For each: the recommendation, and what a wrong guess costs.

**Blocking**

1. **R-V1: relax "recipes and variations are immutable" in Recipe's `AGENTS.md` and brief** (spec section 8; options V5 and V6, rec A and A: frozen revisions under mutable versions, whole content per revision). Recipe's `AGENTS.md` makes recipes immutable, says building starts only after the owner approves it on the issue, and routes any `AGENTS.md` change through an issue, a PR and the owner. Blocks schema v6, every RT-R slice and the assistant-authoring surface (RT-R10), which R-O4 makes the **only** way recipe content enters. Cost of a wrong V5 or V6: a second migration.
2. **The assistant-authoring MCP surface (RT-R10, from R-O4).** Rec: everything a recipe holds (content, steps with optional minutes, servings and `basis`, tags `batch` and `freezes`, versions, fixes, state, the usual, put away, notes, cook entries, nutrition, the one-time photo add link) can be written and read through MCP with the person's words (BR8), and the tool descriptions teach an assistant to build a recipe from what the person shows it in their own AI app. Cost of a thin surface: people cannot add recipes at all, since the app no longer can.
3. **Who draws the Recipe tab (X16).** The brief says Kitchie renders; today Kitchie hosts Recipe's server fragment (Kitchie R34, Recipe fragment mode), which allows no script. The mockup needs script (swipe, sheets, cook timers, the versions strip). Rec: Kitchie renders from Recipe's JSON routes (spec section 6) at the same `<base>/recipes` address, behind a flag, with the hosted fragment as the fallback. Cost: the whole Kitchie side.
4. **Photo storage (P1, P2, P3, P4, P8).** Moved up: under R-O4, adding photos (especially after cooking) is one of the two things the app writes. Rec A for each: Recipe owns photos, files beside `recipes.db`, three WebP sizes and no original, the phone shrinks, same-site cookie. Plus one fact only the owner or infra can supply: **free disk on the server's data folder.** Blocks RT-R6, RT-K8, RT-I1. Cost: storage moved later, or a full server.
5. **Tab bar items (R-O6: R-D2, option 6; X1). Still open.** The owner said "moving on" without picking; the "locked as A" said by an assistant in the voice session was wrong. A: Plan, Pantry, Recipes, Shopping. B: Home first, Plan inside Home. The pattern is locked (R-D32: rail on desktop, bottom bar on phone). **No recommendation: owner's call.** Until answered, the build leaves production's bar unchanged (Home, Pantry, Plan, Recipes, Shopping), so it blocks only the ideas pane's home (R-D1, I-D1 assume Home).
6. **Where ranking runs (I-O4).** Rec A: Kitchie. Blocks the ideas slice, which the owner has not reviewed yet. Cost: a rewrite across two repos.

**What people trust**

7. **Where a change goes (V2 / V-D11)** and **the editing screen** (owner: "we'll do that later"). Rec C for V2: a try takes edits in place; a keeper asks at save. Under R-O4 content changes come through the assistant until the editing screen is decided, so V2 applies to the assistant's writes first.
8. **The assistant on a kept version or the usual (V4 / V-D21).** Rec A: suggest only. Weighs more now: the assistant is the only author of content.
9. **Stars: per member (V-D6) or household-wide (preferences Q1, Q-R8) (X5).** Rec: keep household-wide until the owner wants per member.
10. **Ranking reads the food rules (X4)** and **"Not for me" writes a dislike from a screen (X7).**
11. **Promote a try after a cook (V3 / V-D18).** Rec A: ask every cook.
12. **Cross-feature requests XR1 and XR2 (section 11):** what "sorted" means before a Plan tap goes straight to cook mode (R-D29).

**Layout picks (all built, flip them in the mockups)**

13. V1 (versions screen A, and where it is opened from now that the chip is gone); I-O1 (pane A), I-O2 (tune A), I-O3 (assistant A); P5 (one-time add link, A; C dropped by R-O4), P6, P7, P9 to P13 (all A).

**Small**

14. The open questions in section 5 and X8, X10, X11, X13, X14, X15. Each has a build default; nothing stops for them.

---

## 4. Cross-feature questions

Each names both sides' ids. The other feature's decision is **not** changed by this work; the build default applies only until the owner (or that feature's agent with the owner) answers. Defaults are proposals, listed on the review list (rule 9.9).

| ID | Recipe side | Other side | The tension | Build default (pending owner review) |
|---|---|---|---|---|
| X1 | R-D1, R-D2, I-D1 | Household flow bar (Home, Pantry, Recipes, Shopping); Kitchie `bottom-nav.ts` (Home, Pantry, Plan, Recipes, Shopping); plan-desktop rail (`plan.js`) | Option A drops Home, where the ideas pane lives; four mockups draw three different bars | **Owner's call; not decided.** Build changes no bar. The Recipes slot exists already. |
| X2 | V-D1, BR1 to BR3, R-V1 | Recipe `AGENTS.md` ("Recipes and persisted variations are immutable"; "Building starts only after the owner approves it on the issue"; `AGENTS.md` changes via issue, PR, owner) | The whole versions slice needs the rule relaxed | **Blocked** until the owner says yes on R-V1. No agent edits Recipe's `AGENTS.md`. |
| X3 | V-D23, `set_usual` `not_allowed`, P-D17, R-D25 | Preferences D25 to D30 (binary admin; D26 founding member always admin), Q-R8 (Recipe stars not gated), option B note ("if a Recipe write is ever gated, the token gets a role claim or Recipe asks Platform live"), preferences handoff PL3 (`admin` on `/api/entitlement`, flag `PLATFORM_HOUSEHOLD_ADMINS`) | Was: should the usual, putting away and removing photos follow the admin role? | **Recipe side settled by the owner (R-D31, R-O5, locked 10 Oct 2026): equal roles for now.** No Recipe write is gated on the admin role: `set_usual`, putting away a version or family (whoever cooked it) and removing any photo are open to every member. Recipe does not call Platform's live write check; `not_allowed` stays only for app-only tools on the assistant channel. **Still the preferences owner's, unchanged:** D25 to D30 themselves, PL3 and its flag, and whether household-level preference writes are gated. If a Recipe restriction is ever wanted, it comes back through PL3 (live check, no session claim). |
| X4 | I-D5, I-D6 (avoid, cap, like, dislike) | Food F1 to F5, F11; Q-F3 (cap counted in Kitchie, rolling 7 days), Q-F4 (like and dislike between eaters cancel), Q-F5 (up or down only), Q-F20, Q-F21; preferences seam `evaluate(subjects[], recipe)` (slice K9) | Ideas would read food rules a second time and net a like and a dislike to −0.5, where food says they cancel | The ranking calls `evaluate(eaters, recipe)` once per recipe and maps one effect: `exclude` and `cap_reached` filter (reason listed), `down` −1.5, `up` +1, `none` 0. Cancelling follows Q-F4 by construction. Missing counts use the recipe as written; swaps from `evaluate` are named in Why, not applied to the count. Until preferences K9 lands, the ranking runs against a fake of that seam. |
| X5 | V-D6, R-V9, R-D5 Starred, I-D6 favourite | Preferences fact F1, Q1, Q-R8 (stars household-wide, drawn unchanged) | Per member vs household-wide; the ideas slice itself reads household-wide | Household-wide, as today. `member_prefs` and R-V9 are not built. |
| X6 | R-D8, V-D19, V-D23, P-D17 ("followers", "except a follower") | D25 (one binary role; finer roles deferred), D30 (kitchen role grants nothing) | "Follower" was a mockup persona, not a stored role | **Settled for the Recipe side by R-O5 (locked):** no follower distinction; all members equal with the same controls; restrictions later if ever needed. No persona setting, no follower view. **Left with the preferences owner:** finer roles (D25 says deferred) stay theirs; nothing here asks for one. |
| X7 | I-D12 "Not for me" | Food F3 (dislike, optional end), F6 (recipes by reference), F10 (one service), Q-F6 default (the UI does not create a category), D29 (person level ungated) | A screen creates a food rule | Allowed as a person-level dislike, no end date, about the **family** by reference, through the same food-rules service method the assistant uses; Undo retires it. No category is created. Needs the preferences owner's yes. |
| X8 | R-D open question (held items, mockup: not counted) | I-D6 ("a held item counts as not in"), plan-week-ai 33 (a hold is a real claim) | The two slices disagree | Held for another meal counts as not in, on the list, the page and ideas. |
| X9 | R-D25 (put away a recipe) | V-D2, BR3 (put away is a version state; `families.put_away` had no tool) | Whole-recipe put away had no call | **Fixed in the spec:** `set_family_put_away` (PATCH `/families/:id`). Admin rule as X3. |
| X10 | V-D28 `record_cook`, R-D26 Cooked | Preferences Q-F9 (Kitchie counts recency from `plan_entries` and `cooking_sessions`; Recipe not asked); I-D signals (rotation from Kitchie) | Two cook histories that can drift | One end-of-cook write in Kitchie (`cook_meal`) also calls Recipe `record_cook` in the same request (gap K5). Caps and ideas count Kitchie's history; the Cooked list reads Recipe's `list_cooks`. A cook recorded only through Recipe's MCP shows in Cooked and not in caps; accepted for v1, on the review list. |
| X11 | V-D5 (Plan opens the usual), R-D28, V-D27 legacy ids | Plan-week-ai 7b (locked substitution on the plan entry), 44 (window); Kitchie `plan_entries.recipe_id` (text) | Which id a plan entry holds after v6 | The plan entry stores the version id that was open when planned (the usual unless another was picked) in the existing `recipe_id` text column (gap K4; no Kitchie schema change). Old `rec_` and `var_` ids resolve through `legacy_ids`. A locked substitution stays on the entry (7b) and is never a revision (BR11). |
| X12 | R-D22, I-D13 (cart to the shopping list) | Shopper link SL-D1 to SL-D16, SL-D11 (swaps go into the Pantry by add-item matching) | Recipes feed shopping lines that a shopper then answers | **No conflict found.** Recipe lines are ordinary list lines; a shopper's swap changes the Pantry, never a recipe or version (BR11). Nothing to build on the shopper side. |
| X13 | I-D20 (desktop pane), R-D3 | Plan-desktop 49 to 62 (inspector "View recipe ›" is a toast in `plan.js`); `docs/handover/desktop.md` ("next desktop screens to draw: Recipes") | Desktop Recipes and the ideas side panel are not drawn | Desktop is not built in v1. "View recipe" on desktop Plan navigates to the Recipes tab's recipe page in the desktop column (phone layout) until desktop Recipes is drawn. No recipe picker exists on desktop Plan. Also XR3 (section 11): the toast should become that navigation, with the notes and photos UI reachable there. |
| X14 | V-D27 (new ids `fam_`, `ver_`), BR3 | Preferences RC2 (`/capability/titles?ref=recipe:<id>&ref=variation:<id>`), food F6, `food_rule_recipes (recipe_kind, recipe_id)` | Preferences builds against schema v5 kinds; v6 renames them | The titles capability accepts `recipe`, `variation`, `family` and `version` and maps through `legacy_ids`. A category attaches a **family** (a rule about a dish covers its versions). Order: whichever lands second adapts; RC2 and RT-R1 both touch Recipe's route table (hotspot, 9.12). |
| X15 | I-D7 (lean remembered per person, "preferences, person level") | Preferences 4.1 (stock_prefs keys are a closed list) | No key exists for a lean | Browser storage per person and device (`rcp-lean-<member>`), like R-D5's chip. No server key. |
| X16 | R-D3, owner's brief ("Kitchie renders recipes") | Kitchie R34 and `docs/adr/hosted-screens.md`; Recipe `docs/adr/fragment-mode.md` (fragment: one style, one div, no script) | The built hosted screen cannot carry the mockup's behaviour | Kitchie renders the tab from Recipe JSON (spec section 6, HTTP for Kitchie) behind `KITCHIE_RECIPE_TAB=on|off` (default off); when off, today's hosted fragment stands. Recipe's own pages and fragment mode stay for standalone and fallback. Owner confirms (section 3, item 3). |

---

## 5. Open questions within the Recipe tab, with build defaults

### 5.1 Flow and versions

| Question | Build default (pending owner review) | Wrong guess costs |
|---|---|---|
| Order of the one end-of-cook ask (R-D19, V-D18, P-D11) | Take out of the pantry; freezer portions (batch); a swap: Just tonight or Keep it as a version (Trying); for a Trying version: Keep it, Needs work, Not for us; optional photo (up to 3) or a line. One screen, one Done. | A redraw |
| ~~A follower changing a recipe~~ | **Closed by R-O5 (locked):** no followers; all members equal | – |
| "Not for us" on the first cook in a household of several cooks | Put away at once, Undo in the toast (mockup) | Lost tries |
| Notes on the family or a version | Family (R-D24); photos per version or cook (P-D9) | A column |
| Any real delete | None; Put away only | A tool later |
| Migration of a disabled root with active variations | The most-used active variation becomes the usual; none active: family put away (spec) | Things reappear |
| Member ids in standalone mode | One `legacy` member | A remap |
| Dismissed suggestions | Visible in the maker's assistant history only | A list |
| Assistant `restore_revision` | No (app only) | A permission |
| ~~G8: who reads a photo or a link on Add~~ | **Closed by R-O4 (locked):** nothing reads photos or links; no link paste, no scraping. Recipe content comes only through the person's AI assistant over MCP (RT-R10); Add hands off to the person's default AI app (plan-week-ai 45) | – |
| G6: step minutes | Optional `minutes` per step inside the revision's content; never invented; no timer without it | A field |
| G9: batch words | Closed tags `batch` and `freezes`; portions are `servings` with `basis` | A migration of tags |
| G1: notes | Append-only `notes (id, family_id, household_id, member_id, text ≤ 600, created_at)` in schema v6; `add_note`, `list_notes` | A table |

### 5.2 Photos

| Question | Build default | Wrong guess costs |
|---|---|---|
| Free disk on the data folder | Unknown. Photos stay off (flag `RECIPE_PHOTOS=off`) until infra records free space; the 2 GB household cap is the guard | A full server |
| Off-server backup copy | Infra's call; none assumed | Lost photos |
| ~~Web photo for drafts (P5 C)~~ | **Dropped by R-O4 (locked):** no web fetch; RP7 and RT-R8 removed | – |
| ~~A follower adding a cooked photo~~ | **Closed by R-O5:** every member adds and removes alike | – |
| Replacing a cover | Old one stays in Photos | A purge |
| One site for Kitchie and Recipe | Assumed (P8 A); a subdomain later needs P8 B | Broken images |

### 5.3 Ideas

| Question | Build default | Wrong guess costs |
|---|---|---|
| Household lean set by an admin | No; per person (X15) | A setting |
| Cooked in the last two days: filter or negative | Filter (listed under Left out) | Tuning |
| Pane on the Recipe tab too | No (R-D1, ideas slice agree) | A redraw |

---

## 6. Architecture: who owns what

Owner's brief: Recipe is a separate service (MCP and API); Kitchie is the only UI; what Recipe cannot hold yet is solved in Recipe and Kitchie renders it. Standing rules: one service, two surfaces (MCP and UI call the same methods); closed vocabulary where logic acts.

| Area | Owner | What it holds or does | Never |
|---|---|---|---|
| Recipe data | **Recipe** | The **assistant-authoring MCP surface** (R-O4: the only way content enters), families, versions, revisions (immutable), suggestions and drafts, cook log (version, revision, verdict, `photo_ids`), notes, stars and votes (household-wide, X5), nutrition per revision, provenance, the journal, `legacy_ids` | Stock, plans, food rules, ranking, substitution reasoning |
| Recipe photos | **Recipe** | Photo rows, files in `photos/<household>/`, the three sizes, upload, serve, remove, restore, purge, `cover_photo_id`, one-time add link | Bytes through MCP; public URLs |
| Versions logic | **Recipe** | State machine (V-D3), one usual (BR4), pinned parents (BR5), `stale_base` (BR6), author and channel (BR7), assistant scope (BR9) | Choosing a version for anyone, merging, judging a try |
| What can I cook / missing | **Recipe asks Kitchie** | Reads stock from Kitchie's inventory capability; judges the usual's head revision (G10); keeps `matched_as` (G13) | Storing stock |
| Rendering the tab | **Kitchie** | List (R-O1), recipe page (R-O2) with the versions strip (R-O3), versions, history, compare, suggestions, cook mode (R-D30), the end-of-cook photo and note, notes, photo frames and loader, the add route with in-browser shrinking, the day picker, the ideas pane (X16). **No recipe create or content-edit UI** (R-O4) | Copying recipe content into its own tables |
| Stock, plan, holds, shopping | **Kitchie** | `plan_meal`, `plan_reserve`, `plan_add_missing_to_list`, `shopping_add`, `cook_meal`, freezer items linked to a family (K2), plan entries holding a version id (K4) | Writing recipes |
| Ranking ideas | **Kitchie** (I-O4 A) | One pure function over at most 100 recipes; `cooking_ideas` read (K1); "Not tonight" snooze (K3) | Asking an AI to rank |
| Food rules | **Kitchie** (preferences feature) | `evaluate()`, which the ranking calls (X4) | Recipe reading food rules |
| Write contracts | **Kitchie to Recipe** | Recipe's HTTP routes (spec section 6), channel `app`, the caller's Platform token; the 409 `stale_base` body; photo `POST` with the cookie | Kitchie writing Recipe's database |
| Sign-in, household, entitlement | **Platform** | The token Kitchie and Recipe verify locally (platform D11); entitlement per household; the live write check with `admin` (preferences PL3) for X3 | A new session claim (contract change: owner-reserved) |
| Backups, disk | **Infra** (owner merges) | Recipe data-folder backup includes photos, database first (RP6) | Paid storage |

**Hotspots.** Recipe's `mcp.ts` tool registry and its tool-list snapshot test (RT-R2, R3, R4, R5, R6, R7 and preferences RC2): add one registration line per slice in a new module, change the snapshot in the same PR. Recipe `schema.ts` migration numbers: **v6 = RT-R1, v7 = RT-R6**; take the next free number at merge if another lands first, never renumber a merged one. Kitchie migration numbers 31 to 33 are reserved by the preferences build; RT-K7's freezer link (K2) takes the next free number at merge. Kitchie `store.ts` is the busiest file: new code in a new `server/src/recipe-tab/` folder.

---

## 7. Build slices, dependency ordered

**Scope after the owner's locked decisions (10 Oct 2026).** R-O4 moves all recipe authoring to the assistant: a rich **assistant-authoring MCP surface (RT-R10) replaces any UI create or edit work.** The Kitchie UI scope for the Recipe tab is: **the list (R-O1), the recipe page (R-O2), the versions strip (R-O3), cook mode (R-D18, R-D30), and the end-of-cook photo and note** (R-D19, P-D11, P-D13), with notes and extra photos on the recipe page. Add, Check it and Change screens are not built (RT-K4 and RT-K5 withdrawn); the Versions, History, Compare and Suggestions screens wait for the open versions options (RT-K6 deferred). Plan-tab behaviour (R-D29) is the Plan owners' (section 11). Nothing here is built or filed.

A slice is one pull request by one agent into `uat` of one repo. "Depends" means cannot merge before; any slice may start earlier against a fake of the interface written here, and says so in its PR. Nothing goes to `main` of `recipe`, `kitchie` or `platform`. Every slice runs its repo's checks and the credential scan, adds a line to the repo's plan and an entry on the review list (9.9).

### 7.1 Waves

| Wave | Slices | Waits for |
|---|---|---|
| Gate | RT-R0 | The owner's yes on R-V1 (and on the issues he files from this file) |
| 1 | RT-R1; RT-K0 (fake) | R0 (R1); nothing (K0) |
| 2 | RT-R2, RT-R3 (parallel) | R1 |
| 3 | RT-R4, RT-R5, RT-R10; RT-K1, RT-K2, RT-K3, RT-K7 (built on the fake from wave 1, merge now) | R3 (R4); R2, R3, R4 (R5); R3, R4 (R10); R5 (K1, K2, K3, K7 merge) |
| 4 | RT-R6, RT-I1 (photos, after the owner's photo yes and the disk fact); RT-K9 (ideas) | R1 to R3 (R6); R2 and K1, K3, preferences K9 (K9) |
| 5 | RT-R7, RT-K8 | R6, K2 |
| 6 | RT-K11 (pairing in UAT) | Everything above merged to `uat` |
| Later | RT-K6 (versions screens), RT-R9 (per-member stars), an editing screen, desktop | Owner decisions (V1, V3 to V6; X5; "we'll do that later"; X13). RT-R8 (web photos) and RT-K4, RT-K5 are withdrawn by R-O4 |

### 7.2 Recipe slices (`recipe`, into `uat`)

**RT-R0. Gate: R-V1 and the issues (owner).** Not an agent slice. The owner files or approves R-V1 to R-V9 and RP1 to RP6 (RP7 dropped by R-O4) (drafts: `recipe-versions/spec.html` section 8, `recipe-photos/index.html`); the `AGENTS.md` change goes through Recipe's own issue, PR and owner approval and is never self-merged. Nothing below starts in Recipe before it.

**RT-R1. Schema v6 and migration** (R-V2; V-D1, V-D27; spec sections 2 and 7). Families, versions (with nullable `cover_photo_id`), revisions (whole content, V6 A; step `minutes` optional, G6), suggestions, cooks (`photo_ids_json`, 0 to 3), notes (G1), `legacy_ids`; triggers (revisions, cooks, notes: no update or delete); journal events. `member_prefs` is **not** created (X5). Migration from a real v5 database at every shape (root only, chain of three, disabled root, disabled middle, nutrition attached), run twice; v5 tables left read-only. Accept: old ids resolve; no data lost; refusal of a newer database still works.

**RT-R2. Read tools** (R-V3 part, G10 to G13). `get_family`, `get_version`, `list_revisions`, `compare_versions`, `list_cooks`, `list_notes`, `list_suggestions` (read); `list_recipes` and `search_recipes` one row per family with state, usual, household star and vote (G11); `what_can_i_cook` judges the usual's head (G10), returns state (G12), keeps `matched_as` (G13, a test pins it). Depends R1.

**RT-R3. Write tools and authorship** (R-V3, R-V4, R-V6; BR4 to BR9). `create_recipe` (changed), `create_version`, `revise_version` (`stale_base`, `no_change`), `restore_revision` (app only), `set_version_state`, `set_usual`, `set_family_put_away`, `rename`, `spin_off` (`bring_cover` accepted, no-op until RT-R6), `record_cook` (verdict moves a try), `add_note`. Author from the token, channel from the transport; assistant scope (`needs_person`, `intent_required`). **No admin check** (R-D31, R-O5 locked: equal roles for now; X3); `not_allowed` only for app-only tools on the assistant channel. Depends R1.

**RT-R4. Suggestions and drafts** (R-V5; V-D22, BR10). `propose_change` (max 5 open), `resolve_suggestion` (app only); Suggested families hidden from list, search, `what_can_i_cook` unless `include_suggested`. Depends R3.

**RT-R5. Aliases, discovery text, HTTP for Kitchie** (R-V7, R-V8; spec sections 5 and 6). Today's 21 tools as aliases for one release; server instructions rewritten around BR1, BR8 to BR11; the routes in spec section 6 (JSON only, same limits). Tool snapshot and description tests change here. Depends R2, R3, R4. **Kitchie's interface is this slice.**

**RT-R6. Photos** (RP1 to RP4; P-D1 to P-D10, P-D13 to P-D18). Schema v7 `photos`; files-then-row writes; nightly sweep (strays, 30-day purge); `POST /photos`, `GET /photos/<id>/t|m|l.webp` (cookie or bearer, household check, 404 for anyone else, `private, max-age=31536000, immutable`), remove, restore, delete now; strict WebP and size checks; limits as settings; cover fallbacks; photo ids and colour in replies; `spin_off` copies the cover. Flag `RECIPE_PHOTOS=off` by default. Depends R1 to R3 and the owner's photo yes (section 3, item 4).

**RT-R7. Assistant add link** (RP5; P-D12 A). `request_photo_upload`: one use, 15 minutes, bound to household and target; returns Kitchie's add-screen address. Depends R6 and RT-K8's add route.

**RT-R10. Assistant-authoring MCP surface** (R-O4 locked; owner: "a very rich MCP surface"). The only way recipe content enters. Every field a recipe, version and revision holds is writable and readable through MCP with the person's words (BR8): `create_recipe` with full content (ingredients with `basis`, steps with optional `minutes` (G6), servings, tags `batch` and `freezes` (G9), source), `create_version`, `revise_version`, `propose_change`, `set_version_state`, `set_usual`, `set_family_put_away`, `rename`, `spin_off`, `add_note`, `record_cook`, nutrition, and `request_photo_upload` (RT-R7) for a photo the person picks in Kitchie. Discovery text teaches an assistant to turn what the person shows it in their own AI app into a recipe, to mark what it inferred (`inferred`) and leave unknowns unknown (BR12), to show `potential_duplicates` and never merge, and that Recipe itself reads, scrapes and fetches nothing. A tool-list and description snapshot test pins the surface. Depends R3, R4; lands with R5. Which of these writes an assistant may make on a kept version is V4 (open).

**Later.** RT-R9 per-member stars (R-V9; only if X5 goes that way). ~~RT-R8 web photos for drafts (RP7; P5 C)~~: withdrawn by R-O4 (no web fetch).

### 7.3 Kitchie slices (`kitchie`, into `uat`)

All behind `KITCHIE_RECIPE_TAB=on|off` (default off; turning it on in UAT or production is the owner's). Build from the mockup's markup, classes and tokens (9.2), against a fake of RT-R5 until it lands.

**RT-K0. Recipe client, fake, route.** A typed client for spec section 6 (with a fixture fake generated from the spec's shapes), `server/src/recipe-tab/` folder, the flag, `<base>/recipes` serves Kitchie's screen when on and today's hosted fragment when off (X16). No screen yet. Depends nothing.

**RT-K1. List** (R-O1 A locked; R-D1, R-D4, R-D5, R-D6, R-D12, R-D27; mockup `recipe/list.html`). One ranked list, chip strip, swipe right to plan, drafts line (Suggested families, RT-R4), pills, order. Add opens the person's default AI app (R-O4; Proposal). Bar unchanged (X1, R-O6 open; pattern R-D32). Depends K0; merges after R5.

**RT-K2. Recipe page and versions strip** (R-O2 A and R-O3 B varied, locked; R-D9, R-D10, R-D11, R-D22, R-D23, R-D24, R-D26; V-D4, V-D5, V-D9; `recipe/detail.html`, `recipe-versions/version.html`). One continuous scroll with the jump row docked at the top; no versions row for one version, a horizontally scrolling strip for several, docked as its own row above the jump row. Serves, pantry dots, cart, Hold, notes (add a note), Cooked, state band, ⋯ sheet (Put away open to every member, R-D31). No Change it into an in-app editor (R-O4; editing screen later). Depends K0; merges after R5.

**RT-K3. Day picker and Plan it** (R-D28, R-D23; `recipe/plan-sheet.js`). `plan_meal` with the version id (K4, X11), `plan_reserve` on by default. Shared by K1, K2, K9. Depends K0.

~~**RT-K4. Add, Check it, duplicates**~~ **Withdrawn by R-O4 (locked):** no in-app adding, no reader. Recipe content arrives through RT-R10.

~~**RT-K5. Change**~~ **Withdrawn by R-O4 (locked):** content changes come through the assistant; an editing screen is "later" (owner).

**RT-K6. Versions, history, compare, suggestions** (V-D8, V-D13, V-D14, V-D22; `family.html`, `history.html`, `suggestions.html`). **Deferred:** outside the locked UI scope until V1 and V3 to V6 are decided.

**RT-K7. Cook mode and the end of a cook** (R-D18, R-D30 locked: step buttons carry the destination step's content; R-D19 as 5.1, V-D18, V-D19 (every member who cooks is asked, R-O5); the end-of-cook photo and note; `recipe/cook.html`, `recipe-versions/after-cook.html`). Also the entry point for the Plan tab's straight-to-cook tap (R-D29, XR1, XR2): cook mode must open from a plan entry id. One write: `cook_meal` then Recipe `record_cook` (K5, X10); freezer portions linked to the family (K2; Kitchie migration, next free number). Photo slot shows only when RT-K8 is on. Depends K0; merges after R5.

**RT-K8. Photos in Kitchie** (P-D7, P-D11, P-D14, P-D19 to P-D22; `recipe-photos/*`). The `.pf` frame and the ~40-line loader, the add route with in-browser shrinking (its own route and script), viewer, remove with Undo (any member, R-O5). Under R-O4 this is one of the two things the app writes (extra photos, especially after cooking). Depends K2, R6.

**RT-K9. Cooking ideas** (not reviewed by the owner yet; I-D1 to I-D18; K1, K3; `recipe-ideas/*`). Ranking function (lifted from `ideas.js` `rank()`), `cooking_ideas` read as web route and read-only MCP tool (one service), "Not tonight" snooze, the Home pane (I-O1 A), See all, Why, Tune (I-O2 A), Plan ahead; food rules through `evaluate()` (X4); "Not for me" per X7. Cached per household a few minutes, dropped on stock, plan or food-rule change. Depends R2, K3, and preferences K9 (fake until then). Needs a Home tab (X1).

**RT-K11. Pairing checks in UAT.** Kitchie against real Recipe v6 in UAT: every screen, legacy ids, `stale_base`, photos with the cookie, ideas against real `what_can_i_cook`. Depends everything merged.

### 7.4 Infra

**RT-I1. Backups and disk** (RP6, P-D18, P-D3). The data-folder backup runbook names the photo folder, database first; record free disk. The owner merges infra himself.

---

## 8. Gaps mapped to slices

| Gap | What | Answered by | Slices |
|---|---|---|---|
| G1 | Notes on the family | Build default 5.1 | R1, R2, R3, K2 |
| G2 | Cook history | V-D28, P-D13 | R1, R3 (`record_cook`), R2 (`list_cooks`), K7, K2 |
| G3 | Drafts | V-D22 | R4, R10, K1 |
| G4 | Household default version | V-D5 | R1, R3 (`set_usual`), K2 |
| G5 | Added by | V-D20 | R3, K1 ("Added by me") |
| G6 | Step minutes | Build default 5.1 | R1, R10, K7 |
| G7 | Photos | P-D1 to P-D18 | R6, R7, K8, I1 |
| ~~G8~~ | ~~Reading a photo or link~~ | Dropped by R-O4 (locked) | – |
| G9 | Batch words | Build default 5.1 | R1, K1, K7 |
| G10 | What can I cook on the usual | Schema v6 | R2 |
| G11 | Stars, state, usual in bulk | X5 (household-wide) | R2 |
| G12 | Trying readable in bulk | V-D2 | R2 |
| G13 | Keep `matched_as` | No change | R2 (test) |
| K1 | `cooking_ideas` read | I-D17 | K9 |
| K2 | Freezer item linked to the family | I-D9 | K7 (write), K9 (read) |
| K3 | "Not tonight" snooze | I-D12 | K9 |
| K4 (new) | Plan entry holds a version id | X11 | K3 |
| K5 (new) | One cook writes both apps | X10 | K7 |

---

## 9. Process rules for the build

From this repo's `AGENTS.md` and `DESIGN.md`, the app repos' `AGENTS.md`, and the owner's standing rules. Where this file paraphrases, the source wins.

1. **Mockups go straight to `main` of this repo**; a change to a settled mockup is drawn here first, never built first.
2. **Mockup and build stay close: match exactly** (one of the three build rules the owner restated). The built screen copies the mockup's markup, class names, data attributes and tokens (`.rr`, `.ing`, `.strip`, `.act`, `.sheet`, `.serves`; `.st`, `.vr`, `.band`, `.rv`, `.df`, `.ch`, `.sug`, `.verd`, `.cmp`; `.pf`, `.hero2`, `.pgal`, `.pempty`, `.pv`, `.kind`; `.ideas`, `.idl`, `.idr`, `.why`, `.rtag`). Sample names stay in the mockup scripts. Every difference is listed in the PR.
3. **Headless-browser screenshots** (a build rule) before reporting a UI change done: at 360, 390, 768 and 1280, light (`kitchie-day`) and dark (`kitchie`), several scroll points, every variant; no script errors, no sideways scroll, controls at least 44px (`tools/screenshots.mjs`; `tools/shots-photos.mjs` for photos). Say what did not run and what was not checked on a real phone.
4. **Never `main`** of `recipe`, `kitchie` or `platform`; never tags; nothing live. Agents merge their own PRs into `uat` when the PR is agent-authored, the repo's checks pass locally (CI read where it can run), there is no unresolved comment or conflict, and no owner-reserved decision is needed. Infra: the owner merges.
5. **Performance first, lazy loading** (`DESIGN.md` section 6; a build rule). The list loads its data and the thumbnails near the screen; the recipe page loads one medium cover and its head revision (the versions strip only when there are several versions); every sheet builds on tap; Versions, History, Compare, Suggestions, Cook, the photo add route and See all are separate routes; ideas never block the stock tiles; a household without Recipes loads none of it. Viewport-specific code lives in its own file.
6. **One service, two surfaces.** Every MCP tool and its screen call the same service method (`cooking_ideas`, `record_cook`, food rules).
7. **Closed vocabulary where logic acts, free text elsewhere.** States, kinds, channels, verdicts, tags `batch` and `freezes` are closed; the person's words are data, never instructions.
8. **Recipe's own rules.** Building starts only after the owner approves it on the issue (RT-R0); `AGENTS.md` changes go through issue, PR, owner; missing stays missing (BR12); reasoning stays with the caller (BR13); temporary substitutions are not persisted (BR11).
9. **Open points: take the default here, list it, carry on.** Each slice adds to one review issue per repo ("Recipe tab build: things to check afterwards") the point, the default taken, where it lives and how to change it. Do not stop to ask the owner.
10. **Reserved decisions stop work:** a session-claim or contract change, a paid service, a new dependency, turning a flag on in UAT or production, server or cloud settings, touching real data.
11. **Conflicts.** App repos: merge the base into the branch, never rebase a pushed branch, never force-push; keep both sides of append-only docs; never drop someone else's work. This repo: `git pull --rebase` before every push.
12. **Parallel agents, hotspots** (section 6): Recipe's tool registry and snapshot, Recipe migration numbers v6 and v7, Kitchie migration numbers after 33, the preferences RC2 titles route (X14).
13. **Secrets.** Never print, log or commit a secret value; credential scan before every push; sample names only.
14. **Commit and PR text** end with the session's attribution lines, as each repo's rules say.

---

## 10. What the reconciliation changed, and what it left alone

**Changed (recipe slices only):**

- `recipe-tab.md`: inline marks (R-D16 struck and superseded; R-D11, R-D15, R-D17, R-D19, R-D20, R-D25, R-D26, I-D13 reworded; G2 to G5, G7 answered; cross-feature marks on V-D6, V-D23, P-D17, I-D5, I-D6, I-D12; held-items conflict noted; R-D2 marked open, owner's call) and a Reconciliation section.
- `recipe/index.html`: a link to this handoff; status marks on the same decisions and gaps; open questions updated.
- `recipe/detail.html`, `recipe/edit.html`, `recipe/cook.html`: wording follows V-D9 to V-D11 and V-D18 ("Make it our usual", "Also make it our usual", Change it asks Fix this one or Keep both, Keep it as a version makes a try).
- `recipe-versions/spec.html`: `cooks.photo_ref` → `photo_ids_json` and `record_cook.photo_ids` (up to 3, P-D13); `versions.cover_photo_id` (P-D4) and BR2's mutable list; `families.put_away` mutable and a `set_family_put_away` tool and route (X9); `spin_off` gains `bring_cover` (P-D9); X3 and X5 marks.
- `recipe-versions/index.html`, `recipe-photos/index.html`, `recipe-ideas/index.html`: a reconciliation note and cross-feature marks.

**Left alone (other features' files, read only):** the preferences notes and handoff, `preferences-principles.md`, plan-week-ai, plan-desktop (and `fragments/plan-desktop/`), shopper link (`fragments/shopper-link/`), `flows/household/`, platform pages, `docs/handover/`. Where they meet the Recipe tab, section 4 records it.

**Nothing has been built or filed.**

**Updated after the owner's locked decisions (10 October 2026, evening, docs agent):** section 2.0 added; status marks in 2.1 to 2.4; section 3 reordered (options 1 to 5 and the admin and reader questions settled); X3 and X6 settled for the Recipe side; G8 and the web-photo work dropped; section 7 rescoped (RT-R10 added; RT-K4 and RT-K5 withdrawn; RT-K6 deferred; RT-R8 withdrawn); section 11 added. The flow, versions and photos screens are redrawn by their own agents. **Nothing has been built, and nothing has been filed.**

---

## 11. Cross-feature requests

Requests from the Recipe tab to features owned by other chats. Their notes and mockups are **not** edited here; each owner picks the request up, draws it in their own files, and marks it done there. Ids XR1 to XR3 (not X: those are questions; these are asks).

| ID | To | Ask | From | Their ids it touches | Build default until they answer |
|---|---|---|---|---|---|
| XR1 | **plan-week-ai owner** (phone Plan: [`plan-week-ai.md`](plan-week-ai.md), `fragments/plan-week-ai/`) | On the Plan tab, once a planned meal's items are sorted, a tap on that meal goes **straight into cook mode** (the Recipe tab's cook mode, R-D18 and R-D30), not into the meal sheet. Before it is sorted, a tap opens the meal sheet as today. | R-D29, **locked** (owner, voice, 10 Oct 2026; L6) | 7(a) ("an unmodified saved recipe: tap through to that recipe"), 9 and 33 (Hold), 11 (missing), 31 (last week read-only), the meal sheet | "Sorted" = every ingredient is on hand or held for this meal (nothing missing and nothing only on the shopping list). The meal sheet stays reachable from ⋯ (or long-press) on the card. A modified meal (7b) opens cook mode with its locked substitutions; a "Made up by your assistant" meal (7c) has no saved recipe, so it keeps opening the sheet; last week (31) stays read-only. |
| XR2 | **plan-desktop owner** ([`plan-desktop.md`](plan-desktop.md), `fragments/plan-desktop/`) | The same rule on desktop Plan: a click or Enter on a sorted meal opens cook mode; before it is sorted, it fills the inspector as today. | R-D29, **locked** (L6) | 49 to 62 (proposals), the inspector (52, 53), keyboard map (55) | Cook mode opens in the main column (phone layout) until desktop Recipes is drawn (X13). The inspector stays one key away (Space or the ⋯ menu). |
| XR3 | **plan-desktop owner** (`fragments/plan-desktop/plan.js`, the "📖 View recipe ›" and "View original recipe ›" buttons, today a toast: "Opens the saved recipe. (Mockup: nothing opens.)") | Replace the toast with navigation to the Recipe tab's recipe page (R-O2: one scroll, jump row at top, versions strip when several), where the **notes and photo UI** (add a note, add a photo, especially after cooking: R-O4, P-D11) is reachable. | R-O2, R-O3, R-O4 (locked); X13 | 49 to 62; `plan.js` `viewrec` | Opens `recipe/detail.html` in the main column (phone layout) with the plan entry's version id (X11). No notes or photo controls are drawn inside the inspector itself. |

Also for the Plan owners, for information only (no ask): R-D32 (locked) keeps the rail on desktop and the bottom bar on phone; the bar's items (R-O6) are still open.
