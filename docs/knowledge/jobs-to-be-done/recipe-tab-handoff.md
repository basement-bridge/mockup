# Recipe tab: build handoff

Status: **written 10 October 2026 (Sydney) by the reconciliation agent, after the four Recipe tab slices landed on `main`; updated the same evening with the owner's first lot of locked decisions (voice, about 22:00 to 22:30 Sydney: L1 to L9, recorded as R-O1 to R-O5 and R-D29 to R-D32); updated again on 11 October 2026 with the owner's second lot (typed, late on 10 October: versions picks V1 to V6, six open-item answers including R-V1, and photo options P1 to P13 with limits, removal, backups and loading).** Decisions marked **Locked** are the owner's; everything else is a **Proposal** until the owner says otherwise. **Nothing has been built, and nothing has been filed as an issue** in `recipe`, `kitchie`, `platform` or `infra`. The issue lists in this file (R-V1 to R-V12, RP1 to RP13, slice titles) are drafts for the owner to file or approve; R-V1 is approved and is filed first when the build starts.

**Build rules, whenever building starts:** (1) **the built screen matches the mockup exactly** (markup, classes, tokens; every difference listed in the PR); (2) **performance first, lazy loading** (`DESIGN.md` section 6: load on engagement, routes and sheets on tap; photos by phase, Home never affected); (3) **headless-browser screenshots** at 360, 390, 768 and 1280, light and dark, before a UI change is called done; (4) **never `main`** of `recipe`, `kitchie` or `platform`: slices go to `uat`. Details in section 9.

Who reads this: the owner first (section 3, the yay/nay list), then any agent that builds the Recipe tab in `recipe`, `kitchie` or `infra`. Start at section 7 (slices) and section 9 (rules); use sections 4 and 5 when you hit an open question; read section 6 before touching shared code. Each app repo's own `AGENTS.md` and `docs/project-plan.md` still come first; where this file and an `AGENTS.md` disagree, **`AGENTS.md` wins** (Recipe's immutability rule is changed only by R-V1's own issue and PR, section 7.2).

How it was made: read-only checks on 10 October 2026 of this repo (`main` at 3f99f77 when started), `recipe` (`main` 5cec532: schema v5, `SCHEMA_VERSION = 5`, `basis` observed, inferred, unknown, entered), `kitchie` (`main` 236bbff: bottom bar, hosted Recipes screen R34, `plan_entries.recipe_id`) and `platform`. The second-lot update read this repo at 776e396 (11 October 2026); the slice pages ([`recipe-versions/`](../../../recipe-versions/index.html), [`spec.html`](../../../recipe-versions/spec.html), [`recipe-photos/`](../../../recipe-photos/index.html), [`recipe/`](../../../recipe/index.html)) are the source of truth for wording and ids. Code facts are as of those commits; re-check the file you are about to change.

## Contents

0. Decided since the first handoff
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
11. Cross-feature requests (XR1 to XR4)

---

## 0. Decided since the first handoff

The first handoff (10 October 2026, before 22:00) had every option open. Since then the owner decided, in two lots:

- **Voice, about 22:00 to 22:30 (L1 to L9):** one ranked list; one-scroll recipe page with the jump row docked; versions strip only when several; recipe content only through the person's assistant over a rich MCP surface (the app adds photos and notes); no follower role; a sorted Plan meal taps straight into cook mode; step buttons name the destination step; put away without admin; navigation pattern unchanged. (Section 2.0.)
- **Typed, late (versions):** V1 A grouped by state; V2 C a try edits in place, a keeper asks at save; V3 A ask after every cook of a try; V4 B the assistant edits a kept version or the usual directly and the household reviews after (To review, badge, per-change undo); V5 A frozen revisions under changeable versions; V6 B only the changes are kept, git-like. Answers: "Not for us" puts a try away at once with undo; notes are a field of the version, inherited; no hard delete, undo any time; dismissed drafts only in that member's assistant history; stars per member, household derived; **R-V1 approved**.
- **Typed, late (photos):** P1 A Recipe owns photos; P2 a blob-storage port with a files adapter now; P3 banner large + square, others medium + square, no originals; P4 phone first, server derive queue when free; P5 the assistant uploads itself (not blocking, verified, 3 smaller tries); P6 a version or a cook, never a revision; P7 only recipe photos are banners; P8 household only plus `get_photo` under the same SSO; limits (1 banner, 10 step photos, 3 gallery, 3 per cook, 2 GB with Free up space); removal undo 5 minutes only; backups database plus new files only; page and list loading order.

- **Voice, 11 October 2026, later (T10, section 2.0): editing by hand is allowed.** The assistant-only rule is reversed for editing (it still starts recipes); everything in a version is editable in Kitchie; same model and service methods, so a UI and flow change. Build slices RT-R12, RT-R13, RT-K12, RT-K13 (section 7); options E-O1 to E-O5 for the owner (section 3).
- **Voice, 11 October 2026 (T1 to T9, section 2.0):** Kitchie draws the Recipe UI and Recipe is headless (X16 resolved); Recipes stays a standalone tab, bottom nav on mobile and left menu on desktop (R-O6 closed); Recipe keyboard shortcuts map onto the existing app-level system as built for Pantry; notes live at recipe or version level (N1 closed); a cook photo is a banner only by explicit choice, exactly one banner per version; the household-favourite rule confirmed; one 4,000-character note cap everywhere, the UI enforcing nothing smaller, long notes scrolling in a bounded box; the ideas pane stays in the Recipes tab and I-O4 defaults to A = Kitchie (owner delegated); agents merge into `uat` of any repo, never `main`, never tags, the owner deploys.

What that unblocks: **R-V1 and photo storage are no longer blocking.** Recipe's backend (schema v6, git-like storage, the blob port, the derive queue, the assistant authoring surface) can start as soon as the owner files the issues. What still needs the owner is in section 3.

---

## 1. Status and sources

| # | Source (this repo) | Holds | Status |
|---|---|---|---|
| 1 | [`recipe-tab.md`](recipe-tab.md) | All four slices' decisions, options, gaps, open questions; both lots of the owner's decisions | Mixed: locked marked |
| 2 | [`recipe/`](../../../recipe/index.html) | The flow: list, recipe page, add (hand-off), check it, change (hand-off), cook (R-D1 to R-D32, G1 to G9) | Options 1 to 5 locked, R-D29 to R-D32 locked; R-D8 void; R-D16 superseded; rest Proposal |
| 3 | [`recipe-versions/`](../../../recipe-versions/index.html), [`spec.html`](../../../recipe-versions/spec.html) | Versions and lifecycle (V-D1 to V-D33); backend rules BR1 to BR19, schema v6, git-like storage (section 9), tools, errors, HTTP, migration, assistant authoring (section 10), issues R-V1 to R-V12 | V1 to V6 and six answers locked; R-V1 approved; rest Proposal |
| 4 | [`recipe-photos/`](../../../recipe-photos/index.html) | Photos (P-D1 to P-D31, options P1 to P13 and N1, the blob port, the derive queue, work RP1 to RP13) | P1 to P13 locked; N1 open; rest Proposal; P-D24 and RP7 void by L4 |
| 5 | [`recipe-ideas/`](../../../recipe-ideas/index.html) | Cooking ideas pane (I-D1 to I-D20, options I-O1 to I-O4, gaps G10 to G13, K1 to K3) | Proposal; not reviewed by the owner |
| 6 | `AGENTS.md`, `DESIGN.md`, `docs/knowledge/README.md` | Mockup and build stay close; performance; closed vocabulary | Binding |
| 7 | Other features' notes (read only, never edited here): [`../preferences-build-handoff.md`](../preferences-build-handoff.md), `../user-preferences/` ([`food-preferences.md`](../user-preferences/food-preferences.md), [`boundary-contract.md`](../user-preferences/boundary-contract.md)), [`../preferences-principles.md`](../preferences-principles.md), [`plan-week-ai.md`](plan-week-ai.md), [`plan-desktop.md`](plan-desktop.md), [`shopping-without-the-app.md`](shopping-without-the-app.md), [`../shopper-link.md`](../shopper-link.md) | Decisions that bind or meet the Recipe tab | Theirs |

**Precedence when notes disagree.** (1) An owner decision (this feature's locked R-O1 to R-O5, R-D29 to R-D32, V1 to V6 and the six answers, P1 to P13; plan-week-ai 1 to 48, preferences D1 to D30 and food F1 to F14, shopper-link SL-D1 to SL-D16, the owner's Recipe tab brief of 10 October). (2) The repos' `AGENTS.md`. (3) A later recipe slice that says it supersedes an earlier one (V-D10 and V-D11 over R-D16; V-D31 over R-D24's "on the family"). (4) Proposals. Where a recipe proposal meets another feature's owner decision, the other feature wins and the point is listed in section 4.

**Series names, so nothing clashes.** R-D, V-D, P-D, I-D are this feature's decisions. BR1 to BR19 are Recipe backend rules (spec section 1). P1 to P13 and N1 are photo *options* (not preferences principles P1 to P6). K1 to K3 (and K4, K5 added here) are Kitchie *gaps* (not the preferences handoff's Kitchie slices K0 to K17). G1 to G13 are Recipe gaps. Build slices here are named **RT-R** (Recipe), **RT-K** (Kitchie), **RT-I** (infra). X1 to X16 are cross-feature questions; XR1 to XR3 are cross-feature requests (section 11). R-O1 to R-O6 are the flow slice's options 1 to 6 with the owner's answer; L1 to L9 are the owner's own order in the voice session of 10 October.

---

## 2. Decision index

Status words: **locked** (the owner's: voice or typed, 10 Oct 2026); **proposal** (drawn, owner silent); **open** (an option the owner picks; the recommendation is given); **superseded** or **void** (replaced, kept for history); **narrowed**, **refined** or **reworded** (stands, with scope or words changed by a later decision); **cross** (meets another feature's decision; see section 4).

### 2.0 Locked by the owner

**First lot: voice, 10 October 2026, about 22:00 to 22:30 Sydney.**

| Owner | ID | Locked decision | Supersedes or changes |
|---|---|---|---|
| L1 | R-O1 = A | One ranked list | Options 1 B, 1 C dropped |
| L2 | R-O2 = A | One continuous scroll; jump row docked at the top | Settles R-D7 |
| L3 | R-O3 = B, varied | No versions row for a single-version recipe; a horizontally scrolling strip for several; it docks as its own row above the jump row | Settles R-D20; the chip (3 A) and V-D8's "from the chip" go |
| L4 | R-O4 = redefined | No link paste, no scraping, no photo or link reading, no one box or four doors. Recipe content comes **only** through the person's AI assistant, over a very rich MCP surface. The UI adds extra photos (especially after cooking) and notes | Voids options 4 A and 4 B; narrows R-D4, R-D13, R-D14, R-D15, R-D21, V-D10; drops G8, P-D24, P5 C, RP7, RT-R8; adds RT-R10 |
| L5 | R-O5 = void | Follower-versus-cook distinction dropped: all members equal, same controls; restrictions later if ever needed | Voids option 5 and R-D8; V-D19, V-D23, P-D17 to equal roles; X3 and X6 settled for the Recipe side |
| L6 | R-D29 | On the Plan tab, once a planned meal's items are sorted, tapping it goes straight into cook mode (Plan-tab behaviour) | Cross-feature requests XR1, XR2 (section 11) |
| L7 | R-D30 | Cook-mode step buttons labelled with the destination step's content, not Back and Next | Rewords R-D18 |
| L8 | R-D31 | Putting away needs no admin approval | Changes V-D23, the X3 default, the spec's `not_allowed` admin rule |
| L9 | R-D32 | Navigation pattern unchanged: left gutter (rail) on desktop, bottom nav on mobile | Pattern only; the bar's items stay open (R-O6) |

**Second lot: typed, 10 October 2026, late. Each Locked (owner, typed, 10 Oct 2026).**

| ID | Locked decision | Replaces |
|---|---|---|
| V1 = A | Versions screen grouped by state; opened from the strip's "All versions" and the ⋯ sheet (V-D8) | Open V1 |
| V2 = C | A try takes edits in place; a keeper or the usual asks at save (fix, keep both, different dish); under L4 the assistant asks in the chat (`target_required`) (V-D11) | Open V2; supersedes R-D16 |
| V3 = A | Ask after every cook of a try: Keep it, Needs work, Not for us (V-D18) | Open V3 |
| V4 = B | The assistant edits a kept version or the usual directly; the household reviews afterwards: the **To review** screen, a badge on version, strip, Versions and History, per-change Undo, Looks right accepts all (V-D21, BR9, BR15) | Open V4 (rec was A); removes `propose_change`, `list_suggestions`, `resolve_suggestion`, the `suggestions` table, `assistant_trusted` |
| V5 = A | Frozen revisions under changeable versions and families (BR1, BR2) | Open V5 |
| V6 = B | Only the changes are kept, git-like: content-addressed pieces, change sets by stable item id, a checkpoint every 10th revision, rich-text note blocks with stable ids, images and links by reference (BR14; spec section 9). About 27 MB against 117 MB for whole copies (200 recipes × 5 versions × 20 revisions) | Open V6 (rec was A) |
| Answer 1 | "Not for us" after a try's first cook puts it away at once, with undo (BR17) | At once or after a second cook |
| Answer 2 | Notes are a field of the version, inherited down the lineage, carried as a change only where a version differs (V-D31; spec 9.4; NA live inheritance is the default, Proposal) | Refines R-D24 (notes on the family) |
| Answer 3 | No hard delete; undo at any time as a new revision or event (BR3, BR18, V-D32, `undo_event`) | Hard delete of a mistaken try |
| Answer 4 | A dismissed draft is visible only in that member's assistant history (BR10, `list_my_drafts`) | Shown under Put away |
| Answer 5 | Stars per member; the household level derived; proposed household-favourite rule: more than half of those who ate it liked it, at least 2 (BR19, V-D33, spec 2.1) | Open X5; answered for Recipe's side as "both, derived" |
| Answer 6 | **R-V1 approved**: reverse "immutable" in Recipe's `AGENTS.md` and brief as the first Recipe-repo change when the build starts (issue, build, PR), wording in spec section 8 | Blocking item 1 of the first handoff |
| P1 = A | Recipe owns photos (P-D1) | Open P1 |
| P2 = A + port | Blob-storage port; files adapter now (hash-keyed blobs beside `recipes.db`); online object storage a named future (P-D2, RP9) | Open P2; `photos/<household>/<id>-<size>.webp` |
| P3 = A, varied | Banner large + square (about 260 KB); every other photo medium + square (about 87 KB); no originals (P-D6, P-D3) | Three sizes, about 350 KB a photo |
| P4 = C | Phone shrinks first; the server derive queue runs when resources are free; a third-party seam named; "Photo is being prepared" (P-D7, P-D30, RP10) | Open P4 (rec was A) |
| P5 = A, refined | The assistant uploads itself: not blocking, verified acknowledgement, up to 3 attempts each smaller (P-D12, RP5) | A one-time link the person taps |
| P6 = A | A photo belongs to a version or a cook, never a revision; per-version delete and replace (P-D9) | Open P6 |
| P7 = B | Only recipe photos are banners; an inherited banner shows a small icon (P-D10). Open: may a person explicitly make a cook photo a banner? | Newest cooked photo standing in |
| P8 = A + MCP read | Household only, same-site; the assistant reads through MCP with the same SSO (`get_photo`); expiring public links a named future (P-D15, RP11) | Open P8 |
| P9 | One banner per version; one photo per step up to 10; gallery 3; 3 per cook; 2 GB per household with the search-and-remove Free up space flow (P-D8, RP12, RP13) | 6 per version, 1 MB per upload |
| P10 = B | Removal = undo for 5 minutes only (P-D17) | 30-day restore |
| P11 = B | Backups: database as today, only new photo files copied (P-D18) | Whole folder each time |
| P12 = A | Recipe page: text first, then step photos, then the banner last; others on demand (P-D20) | Open P12 |
| P13 | List: stock placeholder first; planned recipes' photos first; then rows on screen plus 5 in that category; the rest on demand; Home never affected (P-D21) | Cover in the tile only |

**Third lot: voice, 11 October 2026 (T1 to T9).** Each **locked** by the owner.

| # | Decision | Ids | Closes |
|---|---|---|---|
| T1 | Kitchie draws the Recipe UI; Recipe is headless (MCP and API) | R-D3, X16 | **X16** |
| T2 | Recipes is a standalone tab: bottom nav on mobile, left menu on desktop | R-D2, R-D32, option 6 | **R-O6**, X1 |
| T3 | Recipe screens use the existing app-level keyboard shortcut system (as built for Pantry); no Recipe-specific system | desktop | |
| T4 | Notes live at recipe or version level, inherited (V-D31); no "this cook only" question | P-D26, P-D29 | **N1** |
| T5 | A cook photo is a banner only by explicit choice; always exactly one banner per version | P-D10, spec 9.5 | open part of P7 |
| T6 | Household favourite: more than half of those who ate it liked it, and at least 2 | V-D33, spec 2.1 | the rule's "Proposal" |
| T7 | One 4,000-character note cap everywhere; the UI enforces nothing smaller; long notes scroll inside a bounded note box | P-D27, spec 10.6 | the 600-character app limit and the split limits |
| T8 | The ideas pane stays in the Recipes tab; I-O4 defaults to A = Kitchie (delegated; correctable later) | R-D1, I-D3, I-O4 | **I-O4** (as a default) |
| T9 | Agents merge into `uat` of any repo when done; never `main`, never tags; the owner deploys | section 9 | |

**Fourth lot: voice, 11 October 2026 (T10).** **Locked** by the owner. It reverses "assistant-only authoring" for editing.

| # | Decision | Ids | Closes |
|---|---|---|---|
| T10 | Editing by hand is allowed for everything in a version: title, ingredients, steps, notes, tags and other fields, photos (add, replace, remove, make banner, crop, rotate). **The assistant remains the way to start or create a recipe.** Same version, revision and change-set model and the same Recipe service methods: a UI and flow change | L4, R-O4, R-D13, V-D3 | the deferred editing screen; **narrows R-O4** |
| T10a | Version rules unchanged for hand edits: a try edits in place; a keeper asks at save (V2 C); every save a revision with per-change undo; no hard delete; one History for assistant and hand edits, who made each shown | V2, V5, V6, V-D13, V-D32 | |
| T10b | Notes use the single 4,000-character box; photo limits as locked (1 banner per version, 1 per step up to 10, gallery 3); no originals kept so crop and rotate act on the stored large or medium and say so; a pending photo shows "Photo is being prepared" | T7, P3, P7, P9, P-D7 | |

Mockup: `recipe/edit.html` (phone 390 and desktop 1280), options in `recipe/edit-options.html`, ledger T10 in `recipe/index.html`, the record in `recipe-tab.md` ("Fourth lot"). Recipe's own rule text (`AGENTS.md`, the brief) already allows revisions by any caller after R-V1; RT-R12 adds the HTTP routes.

**Still open (owner, after the third and fourth lots):** the editing screen's options E-O1 to E-O5 (the screen is drawn, T10); XR1 to XR3 (Plan owners) and XR4 (preferences chat); infra: free disk on the data folder and an off-server backup copy; the ideas pane as a whole (not reviewed; its place and I-O4 are settled); small defaults (notes NA/NB/NC, disabled-root migration, standalone member ids).

### 2.1 Flow (R-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| R-D1 | The tab opens on the list; ideas live on Home | proposal | Needs a Home tab: X1 |
| R-D2 | Tab bar: Plan, Pantry, Recipes, Shopping | **closed by T2** (standalone Recipes tab; option 6, R-O6) | X1; pattern locked by R-D32 |
| R-D3 | Kitchie renders, Recipe owns; Recipe is headless (MCP and API) | **locked** (T1) | X16 resolved |
| R-D4 | One top row: search and Add | proposal; **narrowed by R-O4** | Add hands off to the person's AI app (Proposal); no in-app form |
| R-D5 | One chip strip (plan-week-ai 48): All, Ready now, Starred, Batch, Under 30, Added by me | proposal | Starred = "Liked by me" (V-D33); Added by me needs V-D20 |
| R-D6 | Swipe right to plan; no swipe left | proposal | |
| R-D7 | Recipe page layout | **locked R-O2 = A** | One scroll, jump row docked at top |
| R-D8 | The follower | **void by R-O5** | All members equal |
| R-D9 | Photos only when there are photos | proposal; **narrowed by P7, P12, P13** | One banner, loaded last; stock tile in lists |
| R-D10 | Serves scales every amount; batches step whole | proposal | plan-week-ai 10 |
| R-D11 | Cook it and Plan it at the bottom; rest in ⋯ | reworded by V-D9 | "Make it our usual" |
| R-D12 | Drafts wait in one slim line on the list | proposal; answered by V-D22, BR10 | Suggested families; a dismissed draft only in that member's assistant history |
| R-D13 | Adding | **narrowed by R-O4** (options 4 A and B void) | Content only through the assistant; the app adds photos and notes |
| R-D14 | One Check it screen; basis shown | proposal; **narrowed by R-O4** | Assistant drafts only; no photo or link reads |
| R-D15 | Save is one tap; Not now or Discard | reworded by V-D22, BR10; narrowed by R-O4 | Save is `accept_suggested` (Trying); Not for us dismisses into the maker's history; Discard drops out |
| R-D16 | Changing always makes a new version | **superseded by V-D10, V-D11 (V2 C, locked)** | |
| R-D17 | Version named from its change; words as `user_intent`; usual is a separate tick | reworded by V-D10, V-D17 | Keep both and spin off only |
| R-D18 | Cook opens on ingredients, one step per screen | proposal; **reworded by R-D30** | Step buttons name the destination step; step photos shown (P-D23) |
| R-D19 | End of a cook asks once | reworded by V-D18 (locked), V-D33, P-D11, P-D13, P-D25 | Order in 5.1 |
| R-D20 | Versions | **locked R-O3 = B, varied** | Strip's last item "All versions" opens Versions (V1 A) |
| R-D21 | Likely duplicate shown, never merged | proposal; narrowed by R-O4 | Assistant drafts only |
| R-D22 | Missing: cart per row, Add all, substitutes hint | proposal | plan-week-ai 11, 29; feeds shopping: X12 |
| R-D23 | Hold only when planned, "Held for Tue" | proposal | plan-week-ai 9, 33 |
| R-D24 | Notes are the household's | proposal; **refined by V-D31 (locked)** | A field of the version, inherited; G1 answered |
| R-D25 | Put away, not delete | reworded by V-D2; **R-D31**; undo any time (BR18) | Family put-away tool: X9; no admin approval |
| R-D26 | Cooked is a short history | proposal; answered by V-D28, P-D13 | Two cook histories: X10 |
| R-D27 | List order: fewest missing, then longest since cooked | proposal | |
| R-D28 | Day picker: this week, up to four ahead, adds never replaces | proposal | plan-week-ai 1 |
| R-D29 | Plan tab: a sorted meal taps straight into cook mode | **locked** (L6) | Plan's behaviour: XR1, XR2 |
| R-D30 | Step buttons labelled with the destination step | **locked** (L7) | |
| R-D31 | Put away needs no admin approval | **locked** (L8) | |
| R-D32 | Navigation pattern unchanged (rail desktop, bottom nav phone) | **locked** (L9) | Items: Recipes standalone (T2) |

### 2.2 Versions (V-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| V-D1 | Three layers: family, version, revision | proposal; **V5 A locked** | R-V1 approved |
| V-D2 | Four states: Suggested, Trying, Kept, Put away | proposal | |
| V-D3 | Transitions | proposal | |
| V-D4 | State in one slim band | proposal | |
| V-D5 | "The recipe" is the family, opening its usual | proposal | Answers G4 |
| V-D6 | Stars per member | **locked** (answer 5) | X5 answered for Recipe's side |
| V-D7 | A version row | proposal | |
| V-D8 | Versions is a screen, grouped by state | **locked V1 A** | Opened from "All versions" and ⋯ |
| V-D9 | Lifecycle actions in the ⋯ sheet | proposal | |
| V-D10 | Three kinds of change: Fix, Keep both, Spin off | proposal; narrowed by R-O4 | `patch_version` `target` |
| V-D11 | Where a change goes | **locked V2 C** | Supersedes R-D16 |
| V-D12 | Child pinned to parent's revision | proposal | |
| V-D13 | History; blame; Go back and Undo save a new revision | proposal | |
| V-D14 | Compare against the usual | proposal | |
| V-D15 | Audit trail kept | proposal | |
| V-D16 | What is changeable | proposal | `cover_photo_id`, notes and photos heads |
| V-D17 | Words required when an assistant acts | proposal | |
| V-D18 | Promote a try after every cook; Not for us at once with undo | **locked V3 A**, answer 1 | BR17 |
| V-D19 | Any cooking member answers; first counts | proposal; **R-O5** | No followers |
| V-D20 | Author, channel and client on every write | proposal | Answers G5 |
| V-D21 | Assistant edits kept versions; review after | **locked V4 B** | BR9, BR15 |
| V-D22 | Reviews and drafts wait quietly; dismissed drafts in the maker's history | proposal; **answer 4 locked** | Answers G3; BR10 |
| V-D23 | Who may do what | **locked L5, L8: equal roles (Recipe side)** | BR16; X3, X6 |
| V-D24 | Two saves never overwrite; non-overlapping saves rebase | proposal | `stale_base` |
| V-D25 | Spin off | proposal | Shares blobs (P-D9) |
| V-D26 | "Version" on screen, never "variation" | proposal | |
| V-D27 | Migration without loss | proposal | Variations map one to one onto change sets |
| V-D28 | Cook log records version and revision | proposal | Extends G2 |
| V-D29 | Nutrition belongs to a revision | proposal | |
| V-D30 | Loading from the head cache | proposal | |
| V-D31 | Notes: a field of the version, inherited | **locked** (answer 2) | Refines R-D24; NA default (Proposal) |
| V-D32 | Nothing deleted; undo any time | **locked** (answer 3) | BR3, BR18 |
| V-D33 | Reactions per member; household derived | **locked** (answer 5); favourite rule Proposal | BR19 |

### 2.3 Photos (P-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| P-D1 | Recipe owns recipe photos | **locked P1 A** | |
| P-D2 | Blob port; files adapter now; object storage named | **locked P2 A + port** | RP9 |
| P-D3 | Disk budget: banner about 260 KB, other photos about 87 KB | proposal | Free disk unknown |
| P-D4 | One row per photo; the version's photos line | proposal | Spec 9.5 aligned |
| P-D5 | Contract: ids, colour, state; never bytes | proposal | |
| P-D6 | Banner large + square; others medium + square; no originals | **locked P3 A, varied** | |
| P-D7 | Phone first; server derive queue when free | **locked P4 C** | RP10 |
| P-D8 | Limits: 1 banner, 10 step, 3 gallery, 3 per cook, 2 GB, Free up space | **locked** (P9) | RP12, RP13 |
| P-D9 | A version or a cook, never a revision | **locked P6 A** | |
| P-D10 | Only recipe photos are banners; inherited with an icon; a cook photo only by explicit choice; exactly one banner per version | **locked P7 B, T5** | |
| P-D11 | Adding from the app | proposal | |
| P-D12 | The assistant uploads itself; not blocking; verified; 3 smaller tries | **locked P5 A, refined** | RP5 |
| P-D13 | Cooked photos on the cook entry, up to 3 | proposal | `record_cook.photo_ids`, `pending_uploads` |
| P-D14 | Nothing jumps, nothing loads early | proposal | |
| P-D15 | Household only; `get_photo` with the same SSO | **locked P8 A + MCP read** | RP4, RP11 |
| P-D16 | Caching: immutable, private | proposal | |
| P-D17 | Removing: any member; undo 5 minutes | **locked P10 B** | |
| P-D18 | Backups: database, then new blobs only | **locked P11 B** | Infra |
| P-D19 | No photo, no pretend photo; stock tile in lists | proposal | |
| P-D20 | Text, then step photos, then the banner | **locked P12 A** | |
| P-D21 | Lists: stock first, planned, on screen + 5; Home untouched | **locked** (P13) | |
| P-D22 | Viewer | proposal | |
| P-D23 | Step photos are in | proposal (owner moved them from "later") | RP12 |
| P-D24 | Web photos | **void by R-O4** | |
| P-D25 | After-cook photos are the star | proposal | |
| P-D26 | Notes are the UI's second job | proposal | Where a note lives: V-D31 |
| P-D27 | Simple rich text, stored as text; one 4,000-character note cap, no smaller UI cap, bounded scrolling note box | proposal; **cap locked** (T7) | |
| P-D28 | Removing a note keeps its photo | proposal | |
| P-D29 | A note after a cook carries the cook's tag | proposal | |
| P-D30 | "Photo is being prepared" | proposal (draws P4) | |
| P-D31 | Notes and the 5-minute removal | proposal | |
| N1 | A note at the end of a cook: no question, or ask | **closed by T4** (no question; recipe or version level) | |

### 2.4 Ideas (I-D)

| ID | Decision | Status | Note |
|---|---|---|---|
| I-D1 | The pane answers the next meal | proposal | Needs Home: X1 |
| I-D2 | Saved recipes and freezer portions only | proposal | |
| I-D3 | Kitchie ranks, deterministic | default A (T8, owner delegated; correctable later) | No longer blocking the ideas slice |
| I-D4 | Filter, then score | proposal | |
| I-D5 | Filters listed with reasons | proposal; **cross** | Avoid and cap from food rules: X4 |
| I-D6 | Score weights | proposal; **cross** | Like/dislike arithmetic: X4; held: X8; favourite now derived (V-D33) |
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

Reordered on 11 October 2026 after the second lot. **Settled and removed from this list:** options 1 to 5, the admin rule (R-D31, R-O5), who reads photos or links (R-O4), **R-V1** (approved), **the assistant authoring surface's shape** (spec section 10, V4 B), **photo storage** (P1 to P13), **V1 to V6**, stars (X5 for Recipe's side), notes, delete and dismissed drafts. For each remaining item: the recommendation, and what a wrong guess costs.

**Blocking a build slice**

1. **Closed (T1, 11 Oct 2026): Kitchie draws the tab; Recipe is headless.** Was: who draws the Recipe tab (X16). The brief says Kitchie renders; today Kitchie hosts Recipe's server fragment (Kitchie R34, Recipe fragment mode), which allows no script. The mockup needs script (swipe, sheets, cook timers, the versions strip, the phased photo loader). Rec: Kitchie renders from Recipe's JSON routes (spec section 6) at the same `<base>/recipes` address, behind a flag, with the hosted fragment as the fallback. Blocks every RT-K screen slice (not RT-K0's client). Cost: the whole Kitchie side.
2. **Closed (T2, 11 Oct 2026): Recipes is a standalone tab, bottom nav on mobile, left menu on desktop.** Was: tab bar items (R-O6: R-D2, option 6; X1). The owner said "moving on" without picking; the "locked as A" said by an assistant in the voice session was wrong. A: Plan, Pantry, Recipes, Shopping. B: Home first, Plan inside Home. The pattern is locked (R-D32). **No recommendation: owner's call.** Until answered, the build leaves production's bar unchanged (Home, Pantry, Plan, Recipes, Shopping), so it blocks only the ideas pane's home (R-D1, I-D1 assume Home).
3. **Where ranking runs (I-O4): default A = Kitchie (T8, owner delegated 11 Oct 2026; correctable later).** Blocks the ideas slice, which the owner has not reviewed yet (I-O1 to I-O3 with it). Cost: a rewrite across two repos.
4. **Filing the issues (RT-R0).** R-V1 is approved; the owner (or an agent on his say) files R-V1 to R-V12 and RP1 to RP13 in `recipe` (RP7 dropped). Recipe's `AGENTS.md` says building starts only after the owner approves it on the issue.

**What people trust (each has a build default; the build does not stop)**

5. **The editing screen: answered in part (T10, 11 Oct 2026): editing by hand is allowed.** Still to say yay, nay or combine, with a recommended default marked and used in the screens (`recipe/edit-options.html`): **E-O1** where you edit (default: one edit screen opened at the section tapped; not edit in place per field; not a sheet per section); **E-O2** typing and reordering on a phone (default: name, amount, unit fields and Reorder mode with arrows; not a row menu, a drag handle or a parsed line); **E-O3** crop and rotate (default: rotate plus a fixed 4-to-3 frame you move and zoom; or rotate only for a smaller build); **E-O4** the keeper question (default: a sheet at Save, a lane on desktop; not inline, not before editing); **E-O5** desktop layout (default: form plus a changes lane; a nested flyout once desktop Recipes exists, X13). Smaller proposals E-D1 to E-D9 are in `recipe-tab.md`. A wrong guess costs one screen's layout, never the model.
6. **Ranking reads the food rules (X4)** and **"Not for me" writes a dislike from a screen (X7).**
7. **Cross-feature requests XR1 and XR2 (section 11):** what "sorted" means before a Plan tap goes straight to cook mode (R-D29).

**Small (build defaults in section 5)**

8. **Closed (T4):** N1, a note at the end of a cook: no question; recipe or version level.
9. **Closed (T5):** a cook photo as a banner by explicit choice only (P-D10, spec 9.5); always exactly one banner per version.
10. **Closed (T6):** the household-favourite rule (spec 2.1): more than half of those who ate it liked it, and at least 2; a household setting.
11. **Notes inheritance NA, NB or NC** (spec 9.4). Default NA, live inheritance.
12. **The preferences chat's items** (X5): their F1, Q1, Q-R8 and whether a member's private "no" may lower a recipe's rank in that member's own Ideas.
13. The open questions in section 5 and X8, X10, X11, X13, X14, X15.

**Facts only the owner or infra can supply:** free disk on the server's data folder (photos stay off until it is recorded); whether an off-server backup copy exists at no cost.

---

## 4. Cross-feature questions

Each names both sides' ids. The other feature's decision is **not** changed by this work; the build default applies only until the owner (or that feature's agent with the owner) answers. Defaults are proposals, listed on the review list (rule 9.9).

| ID | Recipe side | Other side | The tension | Build default (pending owner review) |
|---|---|---|---|---|
| X1 | R-D1, R-D2, I-D1 | Household flow bar (Home, Pantry, Recipes, Shopping); Kitchie `bottom-nav.ts` (Home, Pantry, Plan, Recipes, Shopping); plan-desktop rail (`plan.js`) | Option A drops Home, where the ideas pane lives; four mockups draw three different bars | **Owner's call; not decided.** Build changes no bar. The Recipes slot exists already. |
| X2 | V-D1, BR1 to BR3, BR14, BR18, R-V1 | Recipe `AGENTS.md` ("Recipes and persisted variations are immutable"; "Building starts only after the owner approves it on the issue"; `AGENTS.md` changes via issue, PR, owner) | The whole versions slice needs the rule relaxed | **Answered by the owner (typed, 10 Oct 2026): R-V1 approved.** The edit is the first Recipe-repo change when the build starts (RT-R0: an issue, a branch, a PR to `uat`, under Recipe's own rules), with the replacement wording in spec section 8. Until that PR merges, Recipe's `AGENTS.md` still says "immutable" and wins; no agent edits it from here. |
| X3 | V-D23, `set_usual` `not_allowed`, P-D17, R-D25 | Preferences D25 to D30 (binary admin; D26 founding member always admin), Q-R8 (Recipe stars not gated), option B note ("if a Recipe write is ever gated, the token gets a role claim or Recipe asks Platform live"), preferences handoff PL3 (`admin` on `/api/entitlement`, flag `PLATFORM_HOUSEHOLD_ADMINS`) | Was: should the usual, putting away and removing photos follow the admin role? | **Recipe side settled by the owner (R-D31, R-O5, locked 10 Oct 2026): equal roles for now.** No Recipe write is gated on the admin role: `set_usual`, putting away a version or family (whoever cooked it) and removing any photo are open to every member. Recipe does not call Platform's live write check; `not_allowed` stays only for app-only tools on the assistant channel. **Still the preferences owner's, unchanged:** D25 to D30 themselves, PL3 and its flag, and whether household-level preference writes are gated. If a Recipe restriction is ever wanted, it comes back through PL3 (live check, no session claim). |
| X4 | I-D5, I-D6 (avoid, cap, like, dislike) | Food F1 to F5, F11; Q-F3 (cap counted in Kitchie, rolling 7 days), Q-F4 (like and dislike between eaters cancel), Q-F5 (up or down only), Q-F20, Q-F21; preferences seam `evaluate(subjects[], recipe)` (slice K9) | Ideas would read food rules a second time and net a like and a dislike to −0.5, where food says they cancel | The ranking calls `evaluate(eaters, recipe)` once per recipe and maps one effect: `exclude` and `cap_reached` filter (reason listed), `down` −1.5, `up` +1, `none` 0. Cancelling follows Q-F4 by construction. Missing counts use the recipe as written; swaps from `evaluate` are named in Why, not applied to the count. Until preferences K9 lands, the ranking runs against a fake of that seam. |
| X5 | V-D6, V-D33, BR19, R-V9, R-D5 Starred, I-D6 favourite | Preferences fact F1, Q1, Q-R8 (stars household-wide, drawn unchanged) | Per member vs household-wide; the ideas slice itself reads household-wide | **Answered for Recipe's side by the owner (typed, 10 Oct 2026; answer 5): both, derived.** Each member's own reaction (liked or not for me) is stored; the household view ("liked by 2 of 3", Household favourite by the household's rule, Starred filter) is computed, never stored as a vote (`reactions` table, `react`, R-V9 built). **Left with the preferences chat (their files, not edited here):** F1, Q1, Q-R8 to read Recipe's reactions as per member with the household view derived; and whether a member's private "no" may lower a recipe's rank in that member's own Ideas (nothing ranks on another member's private "no", spec 2.1). |
| X6 | R-D8, V-D19, V-D23, P-D17 ("followers", "except a follower") | D25 (one binary role; finer roles deferred), D30 (kitchen role grants nothing) | "Follower" was a mockup persona, not a stored role | **Settled for the Recipe side by R-O5 (locked):** no follower distinction; all members equal with the same controls; restrictions later if ever needed. No persona setting, no follower view. **Left with the preferences owner:** finer roles (D25 says deferred) stay theirs; nothing here asks for one. |
| X7 | I-D12 "Not for me" | Food F3 (dislike, optional end), F6 (recipes by reference), F10 (one service), Q-F6 default (the UI does not create a category), D29 (person level ungated) | A screen creates a food rule | Allowed as a person-level dislike, no end date, about the **family** by reference, through the same food-rules service method the assistant uses; Undo retires it. No category is created. Needs the preferences owner's yes. |
| X8 | R-D open question (held items, mockup: not counted) | I-D6 ("a held item counts as not in"), plan-week-ai 33 (a hold is a real claim) | The two slices disagree | Held for another meal counts as not in, on the list, the page and ideas. |
| X9 | R-D25 (put away a recipe) | V-D2, BR3 (put away is a version state; `families.put_away` had no tool) | Whole-recipe put away had no call | **Fixed in the spec:** `set_family_put_away` (PATCH `/families/:id`); no admin check (BR16); undo any time (`undo_event`, BR18). |
| X10 | V-D28 `record_cook`, R-D26 Cooked | Preferences Q-F9 (Kitchie counts recency from `plan_entries` and `cooking_sessions`; Recipe not asked); I-D signals (rotation from Kitchie) | Two cook histories that can drift | One end-of-cook write in Kitchie (`cook_meal`) also calls Recipe `record_cook` (with verdict, who ate it, reactions and photo ids) in the same request (gap K5). Caps and ideas count Kitchie's history; the Cooked list reads Recipe's `list_cooks`. A cook recorded only through Recipe's MCP shows in Cooked and not in caps; accepted for v1, on the review list. |
| X11 | V-D5 (Plan opens the usual), R-D28, V-D27 legacy ids | Plan-week-ai 7b (locked substitution on the plan entry), 44 (window); Kitchie `plan_entries.recipe_id` (text) | Which id a plan entry holds after v6 | The plan entry stores the version id that was open when planned (the usual unless another was picked) in the existing `recipe_id` text column (gap K4; no Kitchie schema change). Old `rec_` and `var_` ids resolve through `legacy_ids`. A locked substitution stays on the entry (7b) and is never a revision (BR11). |
| X12 | R-D22, I-D13 (cart to the shopping list) | Shopper link SL-D1 to SL-D16, SL-D11 (swaps go into the Pantry by add-item matching) | Recipes feed shopping lines that a shopper then answers | **No conflict found.** Recipe lines are ordinary list lines; a shopper's swap changes the Pantry, never a recipe or version (BR11). Nothing to build on the shopper side. |
| X13 | I-D20 (desktop pane), R-D3 | Plan-desktop 49 to 62 (inspector "View recipe ›" is a toast in `plan.js`); `docs/handover/desktop.md` ("next desktop screens to draw: Recipes") | Desktop Recipes and the ideas side panel are not drawn | Desktop is not built in v1. "View recipe" on desktop Plan navigates to the Recipes tab's recipe page in the desktop column (phone layout) until desktop Recipes is drawn. No recipe picker exists on desktop Plan. Also XR3 (section 11): the toast should become that navigation, with the notes and photos UI reachable there. |
| X14 | V-D27 (new ids `fam_`, `ver_`), BR3 | Preferences RC2 (`/capability/titles?ref=recipe:<id>&ref=variation:<id>`), food F6, `food_rule_recipes (recipe_kind, recipe_id)` | Preferences builds against schema v5 kinds; v6 renames them | The titles capability accepts `recipe`, `variation`, `family` and `version` and maps through `legacy_ids`. A category attaches a **family** (a rule about a dish covers its versions). Order: whichever lands second adapts; RC2 and RT-R1 both touch Recipe's route table (hotspot, 9.12). |
| X15 | I-D7 (lean remembered per person, "preferences, person level") | Preferences 4.1 (stock_prefs keys are a closed list) | No key exists for a lean | Browser storage per person and device (`rcp-lean-<member>`), like R-D5's chip. No server key. |
| X16 **(resolved by T1, 11 Oct 2026: Kitchie draws, Recipe headless)** | R-D3, owner's brief ("Kitchie renders recipes") | Kitchie R34 and `docs/adr/hosted-screens.md`; Recipe `docs/adr/fragment-mode.md` (fragment: one style, one div, no script) | The built hosted screen cannot carry the mockup's behaviour | Kitchie renders the tab from Recipe JSON (spec section 6, HTTP for Kitchie) behind `KITCHIE_RECIPE_TAB=on|off` (default off); when off, today's hosted fragment stands. Recipe's own pages and fragment mode stay for standalone and fallback. Owner confirms (section 3, item 1). |

---

## 5. Open questions within the Recipe tab, with build defaults

### 5.1 Flow and versions

| Question | Build default (pending owner review) | Wrong guess costs |
|---|---|---|
| Order of the one end-of-cook ask (R-D19, V-D18, V-D33, P-D25) | Take out of the pantry; freezer portions (batch); a swap: Just tonight or Keep it as a version (Trying); for a Trying version: Keep it, Needs work, Not for us; who ate it and each eater's reaction (liked, not for me, skip); Add a photo (up to 3, the primary door) and Add a note. One screen, one Done. | A redraw |
| ~~"Not for us" on the first cook in a household of several cooks~~ | **Locked (answer 1):** put away at once, with undo (BR17) | – |
| ~~Notes on the family or a version~~ | **Locked (answer 2):** a field of the version, inherited (V-D31) | – |
| Notes inheritance NA, NB or NC (spec 9.4) | NA, live inheritance | A re-resolve of every version's notes |
| ~~N1: a note at the end of a cook~~ | **Closed by T4:** no question; on the cooked version with the cook's tag (P-D29) | – |
| ~~Any real delete~~ | **Locked (answer 3):** none; undo any time (BR3, BR18) | – |
| ~~Dismissed suggestions~~ | **Locked (answer 4):** visible only in that member's assistant history (BR10) | – |
| ~~Household-favourite rule (spec 2.1)~~ **Confirmed by T6** | More than half of those who ate it liked it, and at least 2 (1 in a one-member household); a household setting `favourite_rule` (majority, anyone, everyone) | A setting's default |
| Migration of a disabled root with active variations | The most-used active variation becomes the usual; none active: family put away (spec section 7) | Things reappear |
| Member ids in standalone mode | One `legacy` member | A remap |
| Assistant `restore_revision` | Allowed with the person's words (spec section 3 lists it for both channels); `resolve_review` stays app only | A permission |
| ~~G8: who reads a photo or a link on Add~~ | **Closed by R-O4 (locked)** | – |
| G6: step minutes | Optional `minutes` (a Measured value) per step inside the content; never invented; no timer without it | A field |
| G9: batch words | Closed tags `batch` and `freezes` (plus `quick`, `make_ahead`, spec 10.2); portions are `servings` with `basis` | A migration of tags |
| ~~G1: notes~~ | **Answered by V-D31:** the notes line of each version (spec 9.4), `write_notes`; not a family table | – |

### 5.2 Photos

| Question | Build default | Wrong guess costs |
|---|---|---|
| Free disk on the data folder | Unknown. Photos stay off (flag `RECIPE_PHOTOS=off`) until infra records free space (`df -h`); the 2 GB household cap is the guard | A full server |
| Off-server backup copy | Infra's call; none assumed | Lost photos |
| ~~A cook photo as a banner by a person's explicit choice~~ **Locked by T5** | Allowed only as that explicit choice (Replace banner, picking it; one `photo.banner` op naming the same id; the derive queue makes the large size); never by fallback | A rule change in two places |
| A photo for "tonight" when no cook was recorded | Adds a cook with no pantry change (mockup) | A stray cook row |
| An assistant that cannot send a file over HTTP | Hands the person a Kitchie link to the same slot | An extra tap |
| One site for Kitchie and Recipe | Assumed (P8 A); a subdomain later needs another way in | Broken images |
| ~~Replacing a cover~~ | **Closed:** Replace removes the old one with the 5-minute undo (P-D9, P-D17) | – |
| ~~Web photo for drafts (P5 C); a follower adding a cooked photo~~ | **Closed** by R-O4 and R-O5 | – |

### 5.3 Ideas

| Question | Build default | Wrong guess costs |
|---|---|---|
| Household lean set by an admin | No; per person (X15) | A setting |
| Cooked in the last two days: filter or negative | Filter (listed under Left out) | Tuning |
| Pane on the Recipe tab too | No (R-D1, ideas slice agree) | A redraw |
| Favourite in the score (I-D6) | The derived household favourite for the eaters (V-D33); never a private "no" of someone else | Tuning |

---

## 6. Architecture: who owns what

Owner's brief: Recipe is a separate service (MCP and API); Kitchie is the only UI; what Recipe cannot hold yet is solved in Recipe and Kitchie renders it. Standing rules: one service, two surfaces (MCP and UI call the same methods); closed vocabulary where logic acts.

| Area | Owner | What it holds or does | Never |
|---|---|---|---|
| Recipe data | **Recipe** | The **assistant-authoring MCP surface** (R-O4: the only way content enters; spec section 10), families, versions, revisions stored **git-like** (V6 B: content-addressed `objects`, change sets by item id, checkpoints every 10th, `head_cache`), reviews (V4 B), drafts (Suggested), cook log (version, revision, verdict, who ate it, `photo_ids`), notes as each version's inherited notes line (V-D31), **per-member reactions** with the household view derived (V-D33), nutrition per revision, provenance, the journal (undo any time, BR18), `legacy_ids` | Stock, plans, food rules, ranking, substitution reasoning; deleting anything a person made |
| Recipe photos | **Recipe** | Photo rows (kinds banner, step, more, cooked; states pending, ready, removed, failed), bytes only through the **`BlobStore` port** (files adapter now: hash-keyed blobs at `<data>/blobs/<household>/<aa>/<bb>/<hash>` beside `recipes.db`, plus `uploads/`), **two kept sizes** (banner l + t; others m + t; no originals), the **derive queue** (lowest priority, when free; `Deriver` seam), upload, serve, remove with a 5-minute undo, the assistant upload slot with verified acknowledgement, `get_photo`, Free up space usage | Bytes through MCP tool arguments; public URLs; originals |
| Versions logic | **Recipe** | State machine (V-D3), one usual (BR4), pinned parents (BR5), rebase or `stale_base` (BR6), author, channel and client (BR7), assistant scope and review after (BR9, BR15), `target_required` (V2 C), equal roles (BR16) | Choosing a version for anyone, judging a try |
| What can I cook / missing | **Recipe asks Kitchie** | Reads stock from Kitchie's inventory capability; judges the usual's head revision (G10); keeps `matched_as` (G13) | Storing stock |
| Rendering the tab | **Kitchie** (X16 resolved, T1; Recipe is headless) | List (R-O1), recipe page (R-O2) with the versions strip (R-O3), Versions (V1 A), History with undo, Compare, To review (V4 B), cook mode (R-D30) with step photos, the end of a cook (verdict, reactions, photo, note), notes, photo frames and the phased loader, the add route with in-browser shrinking, the viewer, Free up space, the day picker, the ideas pane. **No recipe create or content-edit UI** (R-O4): Add and Change hand off to the person's AI app | Copying recipe content into its own tables; storing photos |
| Stock, plan, holds, shopping | **Kitchie** | `plan_meal`, `plan_reserve`, `plan_add_missing_to_list`, `shopping_add`, `cook_meal`, freezer items linked to a family (K2), plan entries holding a version id (K4) | Writing recipes |
| Ranking ideas | **Kitchie** (I-O4 A, default T8) | One pure function over at most 100 recipes; `cooking_ideas` read (K1); "Not tonight" snooze (K3) | Asking an AI to rank |
| Food rules | **Kitchie** (preferences feature) | `evaluate()`, which the ranking calls (X4) | Recipe reading food rules |
| Write contracts | **Kitchie to Recipe** | Recipe's HTTP routes (spec section 6), channel `app`, the caller's Platform token; the 409 `stale_base` body; photo `POST` with the cookie | Kitchie writing Recipe's database |
| Sign-in, household, entitlement | **Platform** | The token Kitchie and Recipe verify locally (platform D11), also the assistant's MCP session (the same SSO for `get_photo`); entitlement per household | A new session claim (contract change: owner-reserved) |
| Backups, disk | **Infra** (owner merges) | Recipe data-folder backup: the database first (SQLite online backup), then only new blobs (P11 B, RP6); record free disk | Paid storage |

**Hotspots.** Recipe's `mcp.ts` tool registry and its tool-list snapshot test (every RT-R slice that adds a tool, and preferences RC2): add one registration line per slice in a new module, change the snapshot in the same PR. Recipe `schema.ts` migration numbers: **v6 = RT-R1 (families, versions, objects, revisions, reviews, cooks, reactions, legacy_ids), v7 = RT-R6 (photos, derive jobs, upload slots)**; take the next free number at merge if another lands first, never renumber a merged one. Kitchie migration numbers 31 to 33 are reserved by the preferences build; RT-K7's freezer link (K2) takes the next free number at merge. Kitchie `store.ts` is the busiest file: new code in a new `server/src/recipe-tab/` folder.

---

## 7. Build slices, dependency ordered

**Order: Recipe backend first; then Kitchie screens; then photos and ideas.** R-O4 moves all recipe authoring to the assistant, so the assistant-authoring MCP surface (RT-R10) replaces any UI create or edit work, and the backend must exist before a screen has anything real to show. The Kitchie UI scope: **the list (R-O1), the recipe page (R-O2) with the versions strip (R-O3), Versions grouped by state (V1 A), History with undo and To review (V4 B), cook mode (R-D18, R-D30) and the end of a cook (V3 A, V-D33), notes**; then **photos** (the add route, viewer, Free up space) and the **ideas pane**. Add, Check it and Change are hand-offs to the person's AI app (RT-K4 and RT-K5 stay withdrawn). Plan-tab behaviour (R-D29) is the Plan owners' (section 11). **Nothing here is built or filed.**

A slice is one pull request by one agent into `uat` of one repo. "Depends" means cannot merge before; any slice may start earlier against a fake of the interface written here, and says so in its PR. Nothing goes to `main` of `recipe`, `kitchie` or `platform`. Every slice runs its repo's checks and the credential scan, adds a line to the repo's plan and an entry on the review list (9.9).

### 7.1 Waves

| Wave | Slices | Waits for |
|---|---|---|
| Gate | RT-R0 (issues filed; R-V1 first) | The owner files or approves the issues (R-V1 itself is approved) |
| 1 | RT-R0b (R-V1's `AGENTS.md` PR); RT-K0 (client and fake) | R0 (R0b); nothing (K0) |
| 2 | RT-R1 (schema v6, git-like storage, migration) | R0b merged |
| 3 | RT-R2, RT-R3 (parallel) | R1 |
| 4 | RT-R4, RT-R10, RT-R5 | R3 (R4); R3, R4 (R10); R2, R3, R4 (R5) |
| 5 | RT-K1, RT-K2, RT-K3, RT-K7, RT-K6 (built on the fake from wave 1, merge now) | R5; **X16 answered** |
| 6 | RT-R6 (blob port, files adapter, photo rows), RT-R11 (derive queue), RT-I1 (backups, disk) | R1 to R3 (R6); R6 (R11); the disk fact (turning photos on) |
| 7 | RT-R7 (assistant photo upload and `get_photo`), RT-K8 (photos in Kitchie) | R6, R11 (R7); K2, R6 (K8) |
| 8 | RT-K9 (ideas) | R2, K1, K3, preferences K9 (fake until then); **I-O4 and X1 answered** |
| 9 | RT-K11 (pairing in UAT) | Everything above merged to `uat` |
| 10 | RT-R12 (hand-edit routes), RT-R13 (photo transform route), then RT-K12 (edit screens), RT-K13 (crop and rotate) | R3, R5 (R12); R6, R11, R12 (R13); K2, K6, R12 (K12); K8, K12, R13 (K13); **the owner's E-O answers before K12 and K13 start** |
| Later | Desktop Recipes (the edit lane moves into a flyout, E-O5 C) | X13 |

### 7.2 Recipe slices (`recipe`, into `uat`)

**RT-R0. Gate: the issues (owner).** Not an agent slice. The owner files or approves R-V1 to R-V12 and RP1 to RP13 (RP7 dropped by R-O4) (drafts: `recipe-versions/spec.html` section 8, `recipe-photos/index.html`). **R-V1 is approved** (typed, 10 Oct 2026).

**RT-R0b. R-V1: reverse the immutability rule** (spec section 8). The first Recipe-repo change: an issue, a branch, a PR to `uat` that changes Recipe's `AGENTS.md` ("Recipes and persisted variations are immutable…" becomes the section 8 wording: revisions immutable, nothing a person made deleted, every change undoable as a new revision or event), the brief (`docs/requirements/recipe-mcp.md` sections 7, 14 and 20) and the server instructions in `server/src/mcp.ts`, with the tool-description snapshot test in the same PR. Merged under Recipe's own rules (`AGENTS.md` changes need the owner on the PR); never self-merged. Nothing below starts in Recipe before it.

**RT-R1. Schema v6, git-like storage, migration** (R-V2, R-V11 part; V-D1, V-D27; BR1 to BR3, BR14; spec sections 2, 7 and 9). `families`, `versions` (with `cover_photo_id`, `dismissed_by`, `notes_head_id`, `photos_head_id`), `objects` (content-addressed, canonical JSON, immutable), `revisions` (parent pointer, change set, optional `tree_hash` checkpoint every 10th, lines content, notes, photos), `head_cache`, `reviews`, `cooks` (`photo_ids_json`, `ate_json`, verdict), `reactions`, `refs`, `legacy_ids`; `store/objects.ts`; `resolve.ts` grows to about 20 ops with inverses; the word-splice diff; rebase vs `stale_base`; triggers (no update or delete of objects, revisions, cooks; heads only move forward); nightly gc of unreferenced objects. Migration from a real v5 database at every shape (root only, chain of three, disabled root, disabled middle, nutrition attached), run twice; variations map one to one onto change sets; v5 tables left read-only. Accept: property tests (rebuild from any checkpoint equals the head cache; inverse ∘ op = identity; migrated `resolve()` equals today's `resolveChain()`); old ids resolve; no data lost.

**RT-R2. Read tools** (R-V3 part; G10 to G13). `get_family`, `get_version` (head or any revision, from `head_cache`), `list_revisions`, `compare`, `blame`, `list_cooks`, `list_reviews`, `list_my_drafts`, `export_family`; `list_recipes` and `search_recipes` one row per family with state, usual, the member's own reaction and the derived household view (G11, V-D33); `what_can_i_cook` judges the usual's head (G10), returns state (G12), keeps `matched_as` (G13, a test pins it). Depends R1.

**RT-R3. Write tools, authorship, undo** (R-V3, R-V4, R-V6, R-V9, R-V12; BR4 to BR10, BR16 to BR19). **`patch_version`** (`target` fix, new_version, spin_off; `target_required` on a keeper or the usual; idempotency keys; rebase), `restore_revision`, **`revert_change`**, `set_version_state`, `set_usual`, `set_family_put_away`, **`accept_suggested`**, `rename`, `spin_off` (shares blobs once RT-R6 lands), **`write_notes`** (notes line, `scope: every_version`), **`react`**, **`undo_event`**, `record_cook` (verdict `no` puts a try away at once and returns undo, BR17; `ate`, `reactions`, `photo_ids`, `pending_uploads` accepted, no-op until RT-R7). Author from the token, channel from the transport, client from the MCP handshake; `intent_required` on the assistant channel. **No role check** (BR16); `not_allowed` only for app-only tools on the assistant channel. Depends R1.

**RT-R4. Review after and drafts** (R-V5; V-D21, V-D22; BR9, BR10, BR15). An assistant revision on a kept version or the usual opens a `reviews` row; `resolve_review` (app only: accept all, keep or revert per change through `revert_change`); a cook meanwhile is logged and the review stays open. Suggested families hidden from list, search, `what_can_i_cook` unless `include_suggested`; dismissed drafts only in `list_my_drafts`. **No suggestions table, `propose_change`, `resolve_suggestion` or `assistant_trusted`** (removed by V4 B). Depends R3.

**RT-R10. Assistant-authoring MCP surface** (R-V10; R-O4 locked; spec section 10). The only way recipe content enters. `validate_recipe`, the rich `create_recipe` (ingredients with `basis`, steps with optional `minutes` (G6), servings, tags `batch`, `freezes`, `quick`, `make_ahead` (G9), source and provenance text), `import_recipes` (up to 25), `patch_version` with its targeting table (10.4), `write_notes` (Markdown subset, 10.7), `react`, `record_cook`, `undo_event`, `accept_suggested`. Discovery text teaches an assistant to build a recipe from what the person shows it in their own AI app, to mark what it inferred and leave unknowns unknown (BR12), to ask "fix this one, keep both, or a different dish?" on a keeper and say it will show as To review, to show `potential_duplicates` and never merge, and that Recipe itself reads, scrapes and fetches nothing. A tool-list and description snapshot test pins the surface. Depends R3, R4; lands with R5.

**RT-R5. Aliases, discovery text, HTTP for Kitchie** (R-V7, R-V8; spec sections 5 and 6). Today's 21 tools as aliases for one release (`get_resolved_recipe` → `get_version`, `create_variation` → `patch_version` with `target: new_version`, `set_preference` → `react`, `record_usage` → `record_cook`, `set_recipe_status` and `set_variation_status` → state); server instructions rewritten around BR1, BR8 to BR11, BR18; the routes in spec section 6 (JSON only, same limits; the app writes state, usual, put away, notes, reactions, cooks, reviews, undo, never content). Depends R2, R3, R4. **Kitchie's interface is this slice.**

**RT-R6. Photos: blob port, files adapter, photo rows and routes** (RP1, RP2, RP3, RP4, RP9, RP12, RP13; P-D1, P-D2, P-D4 to P-D6, P-D8 to P-D10, P-D15 to P-D18, P-D23). Schema v7 `photos`; the `BlobStore` interface and the files adapter (atomic rename, hash check, conformance tests; `RECIPE_BLOBS=files` only); blob first, then row; the nightly sweep (strays, removals past 5 minutes) in the same job as RT-R1's gc, database first; `POST /photos` (phone sizes, or one unshrunk file), `GET /photos/<id>/t|m|l.webp` (cookie or bearer, household check, 404 for anyone else and for a size not kept, `private, max-age=31536000, immutable`), remove, restore within 5 minutes; strict WebP and size checks; limits as settings (1 banner, 10 step, 3 gallery, 3 per cook, 2 GB, 8 MB, 60 an hour); the version's photos line (banner and step pointers by stable step id, inherited with the "inherited" flag); `GET /photos/usage` and batch remove for Free up space. Flag `RECIPE_PHOTOS=off` by default. Depends R1 to R3.

**RT-R11. The derive queue** (RP10; P-D7, P-D30; new id, 11 Oct 2026). Jobs table, priority order (banner square, other squares, banner large, other mediums), one worker at `nice 19` with one image thread and about 256 MB, load back-off (1-minute load above 1.0 or a request in the last 2 seconds; 30 s doubling to 10 minutes), the local `Deriver` (sharp or libvips: **a new native dependency, owner-reserved, rule 9.10**), failed after three tries, the upload deleted once every kept size exists. The third-party `Deriver` is named, not written. Depends R6.

**RT-R7. Assistant photo upload and read** (RP5, RP11; P-D12 as locked, P-D15; was the one-time add link). `request_photo_upload` (slot: one use, 15 minutes, bound to household, target, declared hash and size; secret in a header; `blocking: false`; the retry ladder 2000/85, 1400/80, 1000/75; attempts a setting, max 3), the `PUT` with its verified acknowledgement (422 `mismatch`), `get_upload`, `record_cook.pending_uploads` resolving into `photo_ids`, and **`get_photo`** (MCP image content, same household check and same SSO as the person). The Kitchie-link fallback reuses RT-K8's add route. Depends R6, R11.

**RT-R12. Hand-edit HTTP routes** (T10, T10a; `recipe/edit.html`). Routes for Kitchie that call the **same service methods** the MCP tools call (`patch_version` with `target` fix, new_version or spin_off; `revert_change`; `rename`; the note ops), with the member as the author (no `on_behalf_of`; History marks the revision "by hand"). `PATCH /versions/:id` takes the base revision and a change set (name, version name, minutes, serves, tags, source text, ingredient rows with `basis`, steps with optional minutes, notes, the order of ingredients and steps), `target` required on a keeper or the usual, an idempotency key, the person's optional words (revision `why`, or `user_intent` for a new version). A stale base returns `stale_base` with the newer head and what changed, so Kitchie can say "Jane saved revision 5 while you were editing" and offer Apply mine on top (a rebase). A hand edit on a keeper opens **no review** (E-D1, Proposal); the validator the assistant surface uses runs here too (limits: 4,000-character notes, 10 step photos, no invented amounts). Depends R3, R5. No new storage; no change to `AGENTS.md` beyond what R-V1 already says.

**RT-R13. Photo transform route** (T10b, E-O3; `recipe/edit-photo.js`). `POST /photos/:id/transform`: Kitchie sends the already-cropped and rotated image (re-encoded in the browser at the stored size: banner large 1600, others medium 960); Recipe replaces the stored large or medium and re-derives the square, keeps the previous stored copy for 5 minutes (the same undo as Remove, P-D17 B), and the photo returns to "being prepared" until its sizes exist (P-D7). A photo that is itself still being prepared refuses with a plain reason. An inherited photo is copied to the version on transform (E-D3, Proposal). Replace and Remove use the existing photo routes (RT-R6). Depends R6, R11.

**Withdrawn or folded.** ~~RT-R8 web photos for drafts~~: withdrawn by R-O4. ~~RT-R9 per-member stars, later~~: folded into RT-R3 (`react`, `reactions`), since V-D33 is locked.

### 7.3 Kitchie slices (`kitchie`, into `uat`)

All behind `KITCHIE_RECIPE_TAB=on|off` (default off; turning it on in UAT or production is the owner's). Build from the mockup's markup, classes and tokens (9.2), against a fake of RT-R5 until it lands. **The screen slices wait for X16.**

**RT-K0. Recipe client, fake, route.** A typed client for spec section 6 (with a fixture fake generated from the spec's shapes), `server/src/recipe-tab/` folder, the flag, `<base>/recipes` serves Kitchie's screen when on and today's hosted fragment when off (X16). No screen yet. Depends nothing.

**RT-K1. List** (R-O1 A; R-D1, R-D4, R-D5, R-D6, R-D12, R-D27; `recipe/list.html`). One ranked list, chip strip (Starred = "Liked by me"), swipe right to plan, drafts line (Suggested families), pills, order. Add opens the person's default AI app (R-O4; Proposal). Tiles start as the stock picture (photos come with RT-K8). Bar unchanged (X1, R-O6 open; pattern R-D32). Depends K0; merges after R5.

**RT-K2. Recipe page and versions strip** (R-O2 A, R-O3 B varied; R-D9 to R-D11, R-D22 to R-D24, R-D26; V-D4, V-D5, V-D9, V-D31, V-D33; `recipe/detail.html`, `recipe-versions/version.html`). One continuous scroll with the jump row docked at the top; no versions row for one version, a scrolling strip for several above the jump row, ending in "All versions"; Serves, pantry dots, cart, Hold, notes (inherited, "From Original", hidden, Add a note through `recipe-photos/note.html`'s route), Cooked with "Liked by 2 of 3", state band, the "To review" line, ⋯ sheet (Put away for every member with Undo, R-D31, BR18). Change opens the person's AI app (R-O4, V2 C). Depends K0; merges after R5.

**RT-K3. Day picker and Plan it** (R-D28, R-D23; `recipe/plan-sheet.js`). `plan_meal` with the version id (K4, X11), `plan_reserve` on by default. Shared by K1, K2, K9. Depends K0.

**RT-K6. Versions, History, Compare, To review** (V1 A, V4 B; V-D8, V-D13, V-D14, V-D21, V-D22, V-D32; `recipe-versions/family.html`, `history.html`, `suggestions.html`). Versions grouped by state; History with blame, See it as it was, Go back, Undo this change, Bring back; Compare against the usual; To review with Looks right and per-change Undo. **No longer deferred:** V1 to V6 are locked. Depends K0; merges after R5.

**RT-K12. Edit screens** (T10, E-O1 to E-O5; `recipe/edit.html`, `edit.css`, `edit.js`, `edit-desktop.css`, `edit-desktop.js`; History's "by hand" mark in `recipe-versions/history.html`). The edit screen for a version: Details (name, version name, time, serves or portions, tags, where it came from), Ingredients (name, amount, unit, "Amount?"), Method (text, optional timer, one photo per step, at most 10), Notes (4,000-character box, a note from above reworded here), Photos; a pencil in the top row (key **E**), a clock (key **comma**), a pencil per section on the recipe page, Ctrl or Cmd plus Enter closes and asks if unsaved (T3, no new keys). Reorder mode with arrows (or the owner's pick); removed saved rows struck through with Put back; a try saves in place with an Undo; a keeper shows the Where-should-this-go sheet (fix, both, different dish) after the list of changes, nothing preselected, optional words; on desktop (1024 px and up) a changes lane holds the list and the question, in its own two files, fetched only there. Calls RT-R12. Depends R12, K2 and K6; **waits for the owner's E-O answers**. Phone and desktop screenshots against `tools/shots-edit.mjs`.

**RT-K13. Photo crop and rotate** (T10b, E-O3; `recipe/edit-photo.js`, `edit-photo.css`). Loaded on the first photo action only. The photo sheet (Make banner, Replace, Crop and rotate, Remove; banner has no Remove, an inherited photo no Remove), the replace path (the phone shrinks it first, "Photo is being prepared"), and the crop and rotate screen: rotate buttons, a fixed 4-to-3 frame, move by drag or arrow keys, a zoom slider, the saved size shown in words, and the plain note that no original is kept. Re-encodes in the browser at the stored size and calls RT-R13. Depends K8, K12, R13.

~~**RT-K4. Add, Check it, duplicates**~~ and ~~**RT-K5. Change**~~: **withdrawn by R-O4 (locked).** Add hands off to the person's AI app (`recipe/add.html`); **Change is no longer only a hand-off after T10 (11 Oct 2026): hand editing is RT-K12**, and `recipe-versions/change.html` stays as the assistant's way in.

**RT-K7. Cook mode and the end of a cook** (R-D18, R-D30; R-D19 as 5.1; V-D18, V-D19, V-D33; `recipe/cook.html`, `recipe-versions/after-cook.html`). Step buttons carry the destination step's content; step photos when RT-K8 is on; the end of a cook: pantry, freezer, swap, Keep it / Needs work / Not for us (Not for us puts it away at once with Undo), who ate it and their reactions, Add a photo and Add a note. Also the entry point for the Plan tab's straight-to-cook tap (R-D29, XR1, XR2): cook mode opens from a plan entry id. One write: `cook_meal` then Recipe `record_cook` (K5, X10); freezer portions linked to the family (K2; Kitchie migration, next free number). Depends K0; merges after R5.

**RT-K8. Photos in Kitchie** (P-D7, P-D11, P-D14, P-D19 to P-D22, P-D25, P-D30; `recipe-photos/*`). The `.pf` frame and the phased loader (`PHO.phase`, `PHO.watch`, `PHO.afterPaint`, about 40 lines: list stock first, planned, on screen + 5; page text, step photos, banner last; Home never imports it), the add route with in-browser shrinking (banner l + t, others m + t; its own route and script), "Photo is being prepared" with three checks, the viewer (Replace, Remove with the 5-minute undo row, Add its own on an inherited photo), Free up space (`recipe-photos/free.html`), the note route (`note.html`, `done.html`), the Kitchie-link fallback for an assistant upload slot. Depends K2, R6 (R11 for unshrunk uploads).

**RT-K9. Cooking ideas** (not reviewed by the owner yet; I-D1 to I-D18; K1, K3; `recipe-ideas/*`). Ranking function (lifted from `ideas.js` `rank()`, favourite from the derived household view), `cooking_ideas` read as web route and read-only MCP tool (one service), "Not tonight" snooze, the Home pane (I-O1 A), See all, Why, Tune (I-O2 A), Plan ahead; food rules through `evaluate()` (X4); "Not for me" per X7. Cached per household a few minutes, dropped on stock, plan or food-rule change. Depends R2, K3, and preferences K9 (fake until then). Needs I-O4 and a Home tab (X1).

**RT-K11. Pairing checks in UAT.** Kitchie against real Recipe v6 and v7 in UAT: every screen, legacy ids, `stale_base` and rebase, review after, undo, photos with the cookie, the derive queue's "being prepared", ideas against real `what_can_i_cook`. Depends everything merged.

### 7.4 Infra

**RT-I1. Backups and disk** (RP6, P-D18 B, P-D3). The data-folder backup runbook: the database first (SQLite online backup), then copy only blobs not yet in the backup; record free disk (`df -h`) on the data folder; the bind mount stays under `/home` (snap Docker). The owner merges infra himself.

---

## 8. Gaps mapped to slices

| Gap | What | Answered by | Slices |
|---|---|---|---|
| G1 | Notes | V-D31 (locked): each version's inherited notes line | R1, R3 (`write_notes`), R10, K2 |
| G2 | Cook history | V-D28, P-D13, V-D33 | R1, R3 (`record_cook`), R2 (`list_cooks`), K7, K2 |
| G3 | Drafts | V-D22, BR10 | R4, R10, K1 |
| G4 | Household default version | V-D5 | R1, R3 (`set_usual`), K2 |
| G5 | Added by | V-D20 | R3, K1 ("Added by me") |
| G6 | Step minutes | Build default 5.1; spec 10.2 | R1, R10, K7 |
| G7 | Photos | P-D1 to P-D31 (P1 to P13 locked) | R6, R7, R8, K8, I1 |
| ~~G8~~ | ~~Reading a photo or link~~ | Dropped by R-O4 (locked) | – |
| G9 | Batch words | Build default 5.1; spec 10.2 | R1, R10, K1, K7 |
| G10 | What can I cook on the usual | Schema v6 | R2 |
| G11 | Reactions, state, usual in bulk | V-D33 (per member, household derived) | R2 |
| G12 | Trying readable in bulk | V-D2 | R2 |
| G13 | Keep `matched_as` | No change | R2 (test) |
| K1 | `cooking_ideas` read | I-D17 | K9 |
| K2 | Freezer item linked to the family | I-D9 | K7 (write), K9 (read) |
| K3 | "Not tonight" snooze | I-D12 | K9 |
| K4 | Plan entry holds a version id | X11 | K3 |
| K5 | One cook writes both apps | X10 | K7 |

---

## 9. Process rules for the build

From this repo's `AGENTS.md` and `DESIGN.md`, the app repos' `AGENTS.md`, and the owner's standing rules. Where this file paraphrases, the source wins.

1. **Mockups go straight to `main` of this repo**; a change to a settled mockup is drawn here first, never built first.
2. **Mockup and build stay close: match exactly** (one of the three build rules the owner restated). The built screen copies the mockup's markup, class names, data attributes and tokens (`.rr`, `.ing`, `.strip`, `.act`, `.sheet`, `.serves`; `.vstrip`; `.st`, `.rvw`, `.vr`, `.band`, `.rv`, `.df`, `.ch`, `.rvc`, `.rvrow`, `.verd`, `.cmp`, `.note.vn`, `.nfrom`, `.nhid`, `.react`, `.ate`; `.pf`, `.pf.stock`, `.pf.prep`, `.pprep`, `.pinh`, `.psp`, `.hero2.one`, `.pundo`, `.qbar`, `.vrow`, `.vpics`, `.pv`, `.aim`, `.addc`; `.ideas`, `.idl`, `.idr`, `.why`, `.rtag`). Sample names stay in the mockup scripts. Every difference is listed in the PR.
3. **Headless-browser screenshots** (a build rule) before reporting a UI change done: at 360, 390, 768 and 1280, light (`kitchie-day`) and dark (`kitchie`), several scroll points, every variant; no script errors, no sideways scroll, controls at least 44px (`tools/screenshots.mjs`; `tools/shots-photos.mjs` and `tools/shots-versions.mjs` for the slices). Say what did not run and what was not checked on a real phone.
4. **Never `main`** of `recipe`, `kitchie` or `platform`; never tags; nothing live. Agents merge their own PRs into `uat` of any repo when done (**T9, owner, voice, 11 Oct 2026**): the PR is agent-authored, the repo's checks pass locally (CI read where it can run), and there is no unresolved comment or conflict. Never `main`, never tags; the owner deploys. Infra: the owner merges.
5. **Performance first, lazy loading** (`DESIGN.md` section 6; a build rule). The list paints text and stock tiles first, then the planned recipes' squares, then rows on screen plus 5 in the chip, the rest on scroll (P-D21); the recipe page paints its text from the head cache, then step photos, then the banner last (P-D20), the versions strip only when there are several versions; Home never imports the photo loader; every sheet builds on tap; Versions, History, Compare, To review, Cook, the photo add route, Note, Free up space and See all are separate routes; ideas never block the stock tiles; a household without Recipes loads none of it. Viewport-specific code lives in its own file.
6. **One service, two surfaces.** Every MCP tool and its screen call the same service method (`cooking_ideas`, `record_cook`, food rules).
7. **Closed vocabulary where logic acts, free text elsewhere.** States, kinds, channels, verdicts, tags `batch` and `freezes` are closed; the person's words are data, never instructions.
8. **Recipe's own rules.** Building starts only after the owner approves it on the issue (RT-R0); `AGENTS.md` changes go through issue, PR, owner (R-V1 is approved and is RT-R0b, the first PR); until RT-R0b merges, Recipe's `AGENTS.md` still says "immutable" and wins; missing stays missing (BR12); reasoning stays with the caller (BR13); temporary substitutions are not persisted (BR11).
9. **Open points: take the default here, list it, carry on.** Each slice adds to one review issue per repo ("Recipe tab build: things to check afterwards") the point, the default taken, where it lives and how to change it. Do not stop to ask the owner.
10. **Reserved decisions stop work:** a session-claim or contract change, a paid service, a new dependency (the derive queue's image library, sharp or libvips, RT-R11, is one: ask in its PR), turning a flag on in UAT or production, server or cloud settings, touching real data.
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

**Updated after the owner's second lot (11 October 2026, docs agent):** section 0 added; section 2.0 gains the typed lot (V1 to V6, answers 1 to 6, P1 to P13); 2.1 to 2.4 statuses; section 3 reordered (R-V1, the authoring surface, photo storage and V1 to V6 no longer blocking; X16, R-O6, I-O4 and the issues remain); X2 and X5 answered for the Recipe side; 5.1 and 5.2 rewritten; section 6 rewritten for git-like storage, the blob port, the derive queue, reactions and reviews; section 7 reordered (Recipe backend first with RT-R0b for R-V1, then Kitchie screens with RT-K6 no longer deferred, then photos RT-R6, RT-R11, RT-R7 and RT-K8, then ideas; RT-R9 folded into RT-R3); section 8 updated. Stale figures removed: 350 KB per photo, P-D12 as a link the person taps, a 30-day purge, `photos/<household>/` with three sizes, V1 to V6 as open, and the old tool names `propose_change`, `resolve_suggestion`, `assistant_trusted`, `revise_version`, `create_version` (now `patch_version`, `list_reviews`, `resolve_review`, `revert_change`, `accept_suggested`). **Nothing has been built, and nothing has been filed.**

---

## 11. Cross-feature requests

Requests from the Recipe tab to features owned by other chats. Their notes and mockups are **not** edited here; each owner picks the request up, draws it in their own files, and marks it done there. Ids XR1 to XR4 (not X: those are questions; these are asks).

| ID | To | Ask | From | Their ids it touches | Build default until they answer |
|---|---|---|---|---|---|
| XR1 | **plan-week-ai owner** (phone Plan: [`plan-week-ai.md`](plan-week-ai.md), `fragments/plan-week-ai/`) | On the Plan tab, once a planned meal's items are sorted, a tap on that meal goes **straight into cook mode** (the Recipe tab's cook mode, R-D18 and R-D30), not into the meal sheet. Before it is sorted, a tap opens the meal sheet as today. | R-D29, **locked** (owner, voice, 10 Oct 2026; L6) | 7(a) ("an unmodified saved recipe: tap through to that recipe"), 9 and 33 (Hold), 11 (missing), 31 (last week read-only), the meal sheet | "Sorted" = every ingredient is on hand or held for this meal (nothing missing and nothing only on the shopping list). The meal sheet stays reachable from ⋯ (or long-press) on the card. A modified meal (7b) opens cook mode with its locked substitutions; a "Made up by your assistant" meal (7c) has no saved recipe, so it keeps opening the sheet; last week (31) stays read-only. |
| XR2 | **plan-desktop owner** ([`plan-desktop.md`](plan-desktop.md), `fragments/plan-desktop/`) | The same rule on desktop Plan: a click or Enter on a sorted meal opens cook mode; before it is sorted, it fills the inspector as today. | R-D29, **locked** (L6) | 49 to 62 (proposals), the inspector (52, 53), keyboard map (55) | Cook mode opens in the main column (phone layout) until desktop Recipes is drawn (X13). The inspector stays one key away (Space or the ⋯ menu). |
| XR3 | **plan-desktop owner** (`fragments/plan-desktop/plan.js`, the "📖 View recipe ›" and "View original recipe ›" buttons, today a toast: "Opens the saved recipe. (Mockup: nothing opens.)") | Replace the toast with navigation to the Recipe tab's recipe page (R-O2: one scroll, jump row at top, versions strip when several), where the **notes and photo UI** (add a note, add a photo, especially after cooking: R-O4, P-D11) is reachable. | R-O2, R-O3, R-O4 (locked); X13 | 49 to 62; `plan.js` `viewrec` | Opens `recipe/detail.html` in the main column (phone layout) with the plan entry's version id (X11). No notes or photo controls are drawn inside the inspector itself. |
| XR4 | **preferences owner** ([`../preferences-build-handoff.md`](../preferences-build-handoff.md), [`../user-preferences/food-preferences.md`](../user-preferences/food-preferences.md)) | Read Recipe stars and votes as **per-member reactions with the household view derived** (Recipe's side of X5, locked): update their F1, Q1 and Q-R8 (today "household-wide, Recipe unchanged"), and decide whether a member's private "no" may lower a recipe's rank in that member's own Ideas. | V-D33, BR19, answer 5 (**locked**, owner, typed, 10 Oct 2026) | Option B facts F1, Q1, Q-R8; the row "Recipe stars and votes" in their handoff | Recipe stores per-member reactions; the preferences screens show nothing new; nobody's private "no" ranks anything (spec 2.1). |

Also for the Plan owners, for information only (no ask): R-D32 (locked) keeps the rail on desktop and the bottom bar on phone; Recipes is a standalone tab in both (T2, R-O6 closed).

**Updated after the owner's fourth lot (11 October 2026, mockup agent):** section 0 and section 2.0 gain T10, T10a and T10b; section 3 item 5 is rewritten with E-O1 to E-O5; section 7 gains RT-R12, RT-R13, RT-K12, RT-K13 and wave 10. Nothing built, nothing filed.

**Updated after the owner's third lot (11 October 2026, docs agent):** section 0 and section 2.0 gain T1 to T9; statuses in 2.1 to 2.4, section 3 items 1, 2, 3, 8, 9, 10, section 4 (X16), 5.1 and 5.2 defaults, section 6 owners, section 9 rule 4 (build authority) and section 11 note updated. The 600-character note limit and the app/assistant split are gone: one 4,000-character cap (T7). **Nothing has been built, and nothing has been filed.**
