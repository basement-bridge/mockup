# Recipe tab

Status: drafted 10 October 2026 by four parallel agents, one slice each, then reconciled the same day. **The owner locked nine decisions by voice the same evening (about 22:00 to 22:30 Sydney, L1 to L9), then a second lot by typing later that night: versions picks V1 to V6 and six open-item answers, and photo options P1 to P13 with the limits, removal, backups and loading order.** Both lots are under "Owner's locked decisions" below; the slice pages ([`recipe-versions/`](../../../recipe-versions/index.html), [`spec.html`](../../../recipe-versions/spec.html), [`recipe-photos/`](../../../recipe-photos/index.html)) are the source of truth for wording and ids. Everything not marked **Locked** is still a **Proposal** until the owner says otherwise. Each slice keeps its own heading; append yours, do not edit another's. Reconciliation marks (**Superseded**, **Reworded**, **Answered**, **Open**) are inline and summarised under "Reconciliation" at the end. **Build handoff: [recipe-tab-handoff.md](recipe-tab-handoff.md)** (decision index, the owner's yay/nay list, open questions with build defaults, architecture, build slices, cross-feature requests). **Nothing has been built, and nothing has been filed as an issue.** When it is built, three rules hold: the built screen matches the mockup exactly; performance first, with lazy loading (`DESIGN.md` section 6); headless-browser screenshots before a UI change is called done.

Owner's brief (10 October 2026, paraphrased): a dedicated Recipe tab experience for Kitchie. Recipe is a separate service (MCP and API); Kitchie is the only UI. Kitchie renders recipes; information Recipe cannot read or write yet must be solved in Recipe, and Kitchie renders it. Today tapping a recipe idea shows only ingredients. Kitchie's other tabs (Plan, Pantry, Shopping) set the design language: reuse it. Screen space on list screens is precious: every control must earn its place.


## Owner's locked decisions (voice and typed, 10 October 2026)

### First lot: voice (L1 to L9)

Said by the owner by voice on 10 October 2026, roughly 22:00 to 22:30 Sydney. Each is **Locked (owner, voice, 10 Oct 2026)**. The ids on the left are the owner's order in that session (L1 to L9); the ids in the second column are the ones used everywhere else in these notes.

| Owner | Id | Locked decision | Replaces or changes |
|---|---|---|---|
| L1 | **R-O1 = A** | The list is one ranked list (option 1 A). | R-D27 stands; options 1 B and 1 C dropped. |
| L2 | **R-O2 = A** | The recipe page is one continuous scroll with the jump row docked at the top (option 2 A). | Settles R-D7. Option 2 B (tabs) dropped. |
| L3 | **R-O3 = B, varied** | Versions: no versions row at all for a recipe with one version; a horizontally scrolling strip when there are several; the strip docks as its own row above the jump row. | Settles R-D20 (the chip, option 3 A, is dropped). V-D8's "opened from the R-D20 chip" loses its chip; where the Versions screen is reached from is the versions slice's to redraw (option V1 was still open; **since locked as V1 = A**: the strip's last item, "All versions", opens it). |
| L4 | **R-O4 = redefined** | Adding recipes is redefined: no link paste, no scraping, no reading of photos or links, no "one box" and no "four doors". Recipe content comes **only** through the person's own AI assistant, over a very rich MCP surface. The UI adds extra photos (especially after cooking) and notes. | Voids both option 4 A and 4 B. Narrows R-D4 (Add), R-D13, R-D14, R-D15, R-D21; drops gap G8; drops P-D12's later part (a photo address fetched by Recipe), P-D24 and option P5 C; closes the open question "who reads photos or links". |
| L5 | **R-O5 = void** | The follower-versus-cook distinction is dropped. All household members are equal and have the same controls; restrictions come later, if ever needed. | Voids option 5 and R-D8. Changes V-D19, V-D23, P-D17 and the spec's admin rule to equal roles for the Recipe side (handoff X3, X6). Closes "can a follower change a recipe". |
| L6 | **R-D29** | On the Plan tab, once a planned meal's items are sorted, tapping it goes straight into cook mode. This is Plan-tab behaviour. | Cross-feature request XR1 and XR2 to the Plan owners (handoff section 11). Meets plan-week-ai 7(a) ("tap through to that recipe"). |
| L7 | **R-D30** | Cook-mode step buttons are labelled with the destination step's content, not "Back" and "Next". | Rewords R-D18. |
| L8 | **R-D31** | Putting away needs no admin approval. | Changes V-D23 and the X3 build default; closes "does Put away need admin agreement". |
| L9 | **R-D32** | The navigation pattern is unchanged: left gutter (rail) on desktop, bottom nav on mobile. | Which items are in the bar: closed by T2 (third lot). |

### Second lot: versions (typed, 10 October 2026, late)

Each is **Locked (owner, typed, 10 Oct 2026)**. Source: [`recipe-versions/index.html`](../../../recipe-versions/index.html) and [`spec.html`](../../../recipe-versions/spec.html) sections 1, 2.1, 8, 9 and 11.

| Pick | Locked decision | Replaces |
|---|---|---|
| **V1 = A** | The Versions screen is grouped by state: our usual, Trying, Kept; put away and spun off folded; "To review" on a version with an assistant change. Opened from the strip's last item, "All versions" (L3), and from the version's ⋯ sheet (V-D8). | Open V1; V-D8's "opened from the R-D20 chip" (the chip went with L3). Not chosen: B family tree. |
| **V2 = C** | By state: a try takes edits in place; a keeper or our usual asks at save: Fix this one, Keep both, or It is a different dish now. Under L4 "asks at save" is the assistant asking in the chat before it writes (`patch_version` refuses a keeper without a `target`: `target_required`) (V-D11). | Open V2; supersedes R-D16. Not chosen: A always ask at save, B ask before editing. |
| **V3 = A** | Every cook of a Trying version ends with Keep it, Needs work, Not for us; any member who cooks it answers, the first answer counts; kept versions are never asked (V-D18, V-D19). | Open V3. Not chosen: B from the 2nd cook, C never ask. |
| **V4 = B** | Edit, review after: the assistant may change a kept version or the usual directly (after asking where the change goes, V2). Live at once; a **To review** badge on the version, its strip item, Versions and History for every member until any member reviews; the review shows what changed (one row per change), which assistant for whom, their words; **Looks right** accepts all, **Undo** reverts one change as a new revision. A cook meanwhile is logged against the revision it used and the review stays open. Tries are never reviewed (V-D21, V-D22, BR9, BR15). | Open V4 (recommendation was A, suggest only). Removes the suggestion cards, `propose_change`, `list_suggestions`, `resolve_suggestion`, the `suggestions` table and `member_settings.assistant_trusted`. Not chosen: A suggest only, C trusted per member. |
| **V5 = A** | Frozen revisions under changeable versions and families (BR1, BR2). | Open V5. Not chosen: B mutable rows with the journal only, C today's rule plus states. |
| **V6 = B** | Changes only, git-like (owner: "only the change / diff is kept… rich text, notes, images, links… storage efficient"). Content-addressed immutable pieces (one ingredient, one step, one note block, stored once under its hash); a change set per revision by stable item id; a checkpoint every 10th revision (K10), so any rebuild applies at most 9 change sets; rich-text note blocks with stable ids; photos and links by reference only. Spec section 9. Sizes: about 27 MB for 200 recipes × 5 versions × 20 revisions, against about 117 MB for whole copies (6 A); a mistaken try kept with undo costs about 1.8 KB (spec 9.10) (BR14). | Open V6 (recommendation was A, whole recipe per revision). Not chosen: A. |

**Open-item answers (same message):**

| # | Answer | Ids | Replaces |
|---|---|---|---|
| 1 | "Not for us" after a try's first cook puts it away **at once, with undo**. | BR17, V-D18 | "At once or wait for a second cook" |
| 2 | **Notes are a field of the version**, inherited down the lineage, carried as a change only where a version's notes differ (diffed per block). Default sub-option NA, live inheritance (Proposal). | V-D31, spec 9.4; **refines R-D24** (still the household's; "every version" becomes every version below the one it was written on, with "Every version of this recipe" one tap away) | "Notes on the family only, or also per version" |
| 3 | **No hard delete; undo at any time** as a new revision or journal event; a mistaken try is put away, with undo. | BR3, BR18, V-D32, `undo_event`, `revert_change`, `restore_revision` | "Hard delete of a try made by mistake; default none" |
| 4 | A **dismissed draft is visible only in that member's assistant history**. | BR10, `list_my_drafts` | "Dismissed drafts show under Put away" |
| 5 | **Stars and reactions are per member; the household level is derived** ("Liked by Sam and Jane · 2 of 3 who ate it"). Household-favourite rule (confirmed, T6): more than half of those who ate it liked it, and at least 2 (a household setting, default majority). A "not for me" is shown by name only to its giver. Nothing is stored as a household vote. | BR19, V-D6, V-D33, spec 2.1, `react`; **answers preferences X5 for Recipe's side as "both, derived"** | V-D6's "Open, cross-feature X5"; R-V9's "household-wide until X5" |
| 6 | **R-V1 approved**: reverse "recipes and variations are immutable" in Recipe's `AGENTS.md` and brief, as the **first Recipe-repo change when the build starts** (an issue, a branch, a PR to `uat`, under Recipe's own rules), with the replacement wording in spec section 8. No agent edits Recipe's `AGENTS.md` before then. | R-V1, spec section 8 | "The owner's call; nothing is built until he says yes" |

**Left with the preferences chat (their files, not edited here):** their F1, Q1 and Q-R8 still draw Recipe stars household-wide; they should read Recipe's reactions as per member with the household view derived, and decide whether a member's private "no" may lower a recipe's rank in that member's own Ideas.

### Second lot: photos (typed, 10 October 2026, late)

Each is **Locked (owner, typed, 10 Oct 2026)**. Source: [`recipe-photos/index.html`](../../../recipe-photos/index.html).

| Option | Locked decision | Ids | Replaces |
|---|---|---|---|
| **P1 = A** | Recipe owns the photos; Kitchie stores none and shows them by id. | P-D1 | Open P1 |
| **P2 = A + port** | Bytes stored only through a **blob-storage port** (`BlobStore`); the **files adapter** is built now (hash-keyed blobs at `<data>/blobs/<household>/<aa>/<bb>/<hash>` beside `recipes.db`, plus `uploads/<slot id>`); an online object-storage adapter is a named future, not built (`RECIPE_BLOBS=files`). | P-D2, RP9 | Open P2; the old `photos/<household>/<id>-<size>.webp` layout |
| **P3 = A, varied** | The **banner keeps large (1600px) + square (240px)**, about 260 KB; **every other photo (step, cook, gallery) keeps medium (960px) + square**, about 87 KB. **No originals.** | P-D6, P-D3 | Three sizes for every photo, about 350 KB each |
| **P4 = C** | **The phone shrinks first**; an unshrunk upload is derived by a **server derive queue that runs only when resources are free** (lowest priority, backs off under load; banner square first, then other squares, then larger sizes); a **third-party image service seam** (`Deriver`) is named, not built; until a photo's sizes exist the UI says **"Photo is being prepared"**. | P-D7, P-D30, RP10 | Phone only |
| **P5 = A, refined** | **The assistant uploads the photo itself**: its MCP call gets a one-time upload slot (the person is not involved); **not blocking**; a **verified acknowledgement** (received hash, bytes, dimensions, the sizes it will keep); **up to 3 attempts, each smaller** (2000px q85, 1400 q80, 1000 q75), then stop and tell the person. Fallback for an assistant that cannot send files: a Kitchie link to the same slot. | P-D12, RP5, `request_photo_upload`, `get_upload` | P-D12 as "a one-time add link the person taps" |
| **P6 = A** | A photo belongs to **a version or a cook, never a revision**; any member can delete or replace a version's photos (Replace adds the new one and removes the old with the 5-minute undo). | P-D9 | Open P6 |
| **P7 = B** | **Only recipe photos are banners**; a cooked photo never stands in. A version showing an ancestor's banner or step photo carries a small branch icon until it has its own. **Closed by T5:** a cook photo may become the banner only by explicit choice, never automatic; always exactly one banner per version. | P-D10, spec 9.5 | P-D10's "newest cooked photo stands in" |
| **P8 = A + MCP read** | Household only: same-site, Platform sign-in and household checked on every request. Plus **the assistant reads a photo through MCP** (`get_photo`) under **the same SSO** as the person on Kitchie. Expiring public share links are a named future. | P-D15, RP4, RP11 | Open P8 |
| **P9** | Limits: **one banner per version; one photo per step, up to 10 per version; gallery up to 3; 3 per cook; 2 GB per household** with the **search-and-remove "Free up space" flow** (versions listed by photo bytes, unused first); 8 MB per upload; 60 uploads an hour per member. | P-D8, RP12, RP13 | 6 per version, 1 MB per upload |
| **P10 = B** | Removal = **undo for 5 minutes only**, then the blobs are deleted (unless the same hash is used elsewhere in the household). | P-D17 | A 30-day restore and "Delete it for good now" |
| **P11 = B** | Backups: **the database as today, then only new photo files copied** (a blob's name is its hash and never changes). | P-D18, RP6 | Whole photo folder each time, B only past 500 MB |
| **P12 = A** | Recipe page top: full-width banner; **text first, then step photos, then the banner last**; other photos on demand; the banner's box is there from the first paint. | P-D20 | Open P12 |
| **P13** | List: **a stock placeholder first** in every tile; then **the planned recipes' photos** (if this week's plan exists); then **rows on screen plus 5 more in that category**; the rest on demand. **Home is never affected.** | P-D21 | "Cover in the 56px tile" as the only rule |

Also recorded on the photos page (Proposal unless it says Locked): **P-D25** after-cook photos are the primary add door, **P-D26** notes are the UI's second job (`recipe-photos/note.html`), **P-D27** simple rich text stored as text, **P-D28** removing a note keeps its photo, **P-D29** a note after a cook carries that cook's tag, **P-D30** the "being prepared" state, **P-D31** notes and the 5-minute removal. **N1** (does the end of a cook ask "this cook only" or "for next time") **was closed by T4:** no question; notes live at recipe or version level. Recipe-side work RP1 to RP13 (RP7 dropped by L4).

### Third lot: voice (T1 to T9, 11 October 2026)

Spoken by the owner after the second lot. Each is **Locked (owner, voice, 11 Oct 2026)**. They close X16, R-O6, N1 and the small items; any older line that still says "open" for them is superseded.

| # | Decision | Ids touched | Replaces or closes |
|---|---|---|---|
| T1 | **Kitchie draws the Recipe UI; Recipe is headless** (MCP and API only). | R-D3, handoff X16 | **Resolves X16** (the hosted-fragment question) |
| T2 | **Recipes stays a standalone tab:** bottom nav on mobile, left menu on desktop. | R-D2, R-D32, option 6 | **Closes R-O6** |
| T3 | **Keyboard shortcuts:** Recipe screens map onto the existing app-level shortcut system, as built for Pantry (`desktop-layout.md`). No Recipe-specific shortcut system. | desktop only | A per-tab shortcut set |
| T4 | **Notes live at recipe or version level,** inherited down the lineage (V-D31). No "this cook only" question at the end of a cook. | V-D31, P-D26, P-D29 | **Closes N1** (option B not taken) |
| T5 | **A cook photo may become the banner only by explicit choice; there is always exactly one banner per version.** Never automatic, never by fallback. (Reading used: a version never has two banners; with none of its own or inherited, the one banner slot shows the stock picture, P-D19. To confirm with the owner.) | P-D10, spec 9.5 | The open part of P7 |
| T6 | **Household favourite rule confirmed:** more than half of those who ate it liked it, and at least 2. | V-D33, BR19, spec 2.1 | "Proposal" on the rule |
| T7 | **Note limit: one 4,000-character cap everywhere** (app and assistant). The UI must **not** enforce a smaller cap; a long note scrolls inside a bounded note box and does not grow the page. | P-D27, spec 10.6 | The 600-character app limit and the app/assistant split |
| T8 | **The ideas pane stays in the Recipes tab.** Where ranking runs (I-O4) defaults to **A = Kitchie** (owner delegated; correctable later). | R-D1, I-D3, I-O4 | "Ideas live on Home"; I-O4 open |
| T9 | **Build authority:** agents merge into `uat` of any repo when done; never `main`, never tags; the owner deploys. | handoff section 9 | Per-slice "owner merges" wording, except infra's note |

**Still open after the third lot:**

- The editing screen: **reversed and drawn on 11 Oct 2026 (T10, fourth lot, above).** Only its options E-O1 to E-O5 are open.
- Cross-feature requests XR1 to XR3 (the Plan owners: what "sorted" means for R-D29, the desktop rule, the View recipe link) and XR4 (the preferences chat, with its F1, Q1, Q-R8 and the private "no" in Ideas).
- Infra: free disk on the server's data folder (P-D3) and an off-server backup copy.
- The cooking-ideas pane as a whole is still not reviewed by the owner (only its place, T8, and I-O4 are settled).
- Smaller leftovers with build defaults: notes sub-option NA, NB or NC (default NA); migration of a disabled root with active variations; member ids in standalone mode.

**Now settled (were open after the first lot):** V1 to V6, P1 to P13, R-V1.

### Fourth lot: voice (T10, 11 October 2026): editing by hand

Spoken by the owner after the third lot. **Locked (owner, voice, 11 Oct 2026).** It **reverses** the "assistant-only authoring" rule (L4, R-O4, "we'll do that later" for the editing screen) **for editing only**: the AI assistant remains the way to **start or create** a recipe, but **everything must be editable by hand in Kitchie**: title (recipe and version name), ingredients, steps, notes, tags and other fields (time, serves, where it came from), and photos (add, replace, remove, make banner, crop, rotate). It does not change the data model: the same version, revision and change-set model and the same Recipe service methods (so a hand edit is `patch_version` with a member as the author), which makes this a UI and flow mockup.

| # | Decision | Ids touched | Replaces or closes |
|---|---|---|---|
| T10 | **Editing by hand is allowed for every part of a version; the assistant remains the way to start a recipe.** | L4, R-O4, R-D13, V-D3 (authorship) | "assistant-only authoring" for editing; the deferred editing screen; RT-K5 stays withdrawn, its place is RT-K12 |
| T10a | **The version rules apply to hand edits unchanged:** a try edits in place; a keeper asks at save (fix this one / keep both / different dish, V2 C); every save is a revision with per-change undo; no hard delete, undo only; an assistant edit and a hand edit land in the same History with who did it shown. | V2, V5, V6, V-D13, V-D32 | |
| T10b | **Notes use the single 4,000-character scrolling box (T7).** Photo rules as locked: one banner per version, one photo per step (at most 10), gallery 3; no originals kept, so crop and rotate act on the stored large (banner) or medium (others) and the screen says so; a pending photo shows the calm "Photo is being prepared" state. | T7, P3, P7, P9, P-D7 | |
| T10c | **New build slices:** RT-R12 (Recipe HTTP routes for hand editing), RT-R13 (photo transform route), RT-K12 (Kitchie edit screens, phone and desktop), RT-K13 (photo crop and rotate screen). See `recipe-tab-handoff.md` 7.2 and 7.3. | handoff 7 | |

**What the mockup drew** (`recipe/edit.html`, replacing the hand-off to the assistant; `recipe/edit-options.html` for the choices): one edit screen for the version with Details, Ingredients, Method, Notes and Photos, opened at the section tapped (a pencil in the recipe page's top row, key **E**, and one beside each section); ingredients as name, amount, unit and an "Amount?" switch (never guessed); steps with an optional timer and one photo each; Reorder mode with move arrows; removed saved rows struck through with Put back; notes in the 4,000-character box (a note from higher up is reworded here for this version and below); tags; photos with their own sheet and a crop and rotate screen (rotate, plus a fixed 4-to-3 frame you move and zoom, with the size it will save at); the keeper question as a sheet at Save; a changes lane on desktop (1280) that also holds the keeper question. Phone first (390), desktop where the layout differs (`edit-desktop.css` and `.js`, fetched only at 1024 px and up). History shows a "by hand" mark next to the "assistant" mark.

**Options awaiting the owner's yay, nay or combine (recommended default marked, and used in the screens).** Details in `recipe/edit-options.html`.

| # | Choice | Recommended default (used) | Other options |
|---|---|---|---|
| E-O1 | Where you edit | **A. One edit screen for the version, opened at the section tapped** (one change set, one revision, one keeper question) | B edit in place per field (a revision or a hidden pending state per field, a keeper question per field); C a sheet per section (two saves for a change that spans sections) |
| E-O2 | Typing and reordering on a phone | **Three fields per ingredient (name, amount, unit, "Amount?"); Reorder mode with move arrows** | B a row menu; C a drag handle (fights scrolling, needs arrows anyway); D one parsed line per ingredient (nay: a parser, and it invents amounts) |
| E-O3 | Crop and rotate | **Rotate plus a fixed 4-to-3 frame you move and zoom, with the saved size shown** | A rotate only (the smaller build); C a free crop (stored photos are all 4 to 3: nay) |
| E-O4 | How the keeper question appears | **A sheet at Save** (change list, three cards, nothing preselected, optional words); on desktop it sits in the lane | B inline above the Save bar; C choose before editing (not "asks at save") |
| E-O5 | Desktop layout | **Form plus a changes lane** (a plain wide window, since the Recipes tab is not drawn on desktop yet, X13) | B the phone column centred; C a nested flyout like the Pantry item edit (once desktop Recipes exists) |

**Smaller choices made where the owner was silent (all Proposal):** E-D1 a hand edit on a keeper opens no "To review" (a person made it with the change list in front of them; wrong guess: noise on every hand edit); E-D2 the banner can be replaced or swapped, not removed (existing photos-slice rule; alternative: remove falls back to the parent's or the stock picture); E-D3 photos apply at once, are not part of Save, undo for 5 minutes, and an inherited photo gets its own copy on Replace or crop (the parent keeps its photo; no Remove for an inherited one); E-D4 Save does nothing until something changed, leaving with changes asks, Ctrl or Cmd plus Enter closes and never saves silently; E-D5 amounts are typed for the recipe's own serving count and stored per serving (the build converts); E-D6 editing a note written higher up rewords it for this version and below, taking a note off is a change in the revision; E-D7 two people editing at once is handled by the base revision (`stale_base`: "Jane saved revision 5 while you were editing", Apply mine on top or Start again), not drawn; E-D8 one History, hand edits marked "by hand", assistant edits marked "assistant" with the on-behalf-of name; E-D9 keys: E edit, comma History, Ctrl or Cmd plus Enter close (T3, no Recipe-specific keys).

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
2. **R-D2 Tab bar: Plan, Pantry, Recipes, Shopping.** Same bar component as the household flow. **Closed by T2 (owner, voice, 11 Oct 2026): Recipes stays a standalone tab** (bottom nav on mobile, left menu on desktop); R-O6 is closed. The pattern (rail on desktop, bottom bar on phone) is locked by R-D32. The household flow and the ideas slice draw Home, Pantry, Recipes, Shopping; production Kitchie and the plan-desktop rail have five (Home, Pantry, Plan, Recipes, Shopping). The ideas pane stays in the Recipes tab (T8), so the missing Home no longer matters (handoff X1).
3. **R-D3 Kitchie renders, Recipe owns.** Every value comes from a Recipe tool or from Kitchie's own plan and stock. Missing capability is listed under Recipe-side gaps, not faked in Kitchie.
4. **R-D4 One top row on the list: search and Add.** No heading. Search matches names and ingredients. **Narrowed by R-O4 (locked):** Add no longer opens an in-app form or reader; a new recipe comes through the person's AI app. How the top row is drawn now is the flow screens' to redraw (Proposal: the button opens the person's default AI app, plan-week-ai 45).
5. **R-D5 One chip strip, the plan-week-ai strip (its decision 48):** All, Ready now, Starred, Batch, Under 30, Added by me. Tap the chosen chip again for All. Remembered per person in localStorage (`rcp-chip-<persona>` in the mockup). The batch cooker starts on Batch.
6. **R-D6 Swipe a list row right to plan it** (opens the day picker). No swipe left: Recipe never deletes.
7. **R-D7 Recipe page layout:** option 2. **Locked as R-O2 = A** (owner, voice, 10 Oct 2026): one continuous scroll, jump row docked at the top.
8. ~~**R-D8 The follower:** option 5 (A tonight leads; B straight to cook). Either way no Plan, Change it or drafts line; star, notes and photos stay.~~ **Void by R-O5 (locked, owner, voice, 10 Oct 2026):** no follower distinction; all members equal, same controls.
9. **R-D9 Photos only when there are photos.** Hero swipes sideways with dots; no photo means no hero and no placeholder. Step pictures only when the recipe has them. **Narrowed by P7 = B and P12 = A (locked):** one banner per version (no swipe of several heroes), loaded after the text and the step photos; a cooked photo never stands in; list tiles start as a stock picture (P-D19, P-D21).
10. **R-D10 Serves is the quantity control.** Scales every amount (plan-week-ai decision 10). Batch recipes step in whole batches. An unknown amount stays "amount?" at every size.
11. **R-D11 Two actions at the bottom: Cook it (leads) and Plan it.** Star in the top row. In ⋯: Change it, Make this version the default, Ask your assistant about it (opens the person's default AI app, plan-week-ai decision 45), Where it came from, Put away. **Reworded by V-D9:** "Make this version the default" reads "Make it our usual"; Change it asks where the change goes (V-D10); Put away is refused on the usual (V-D23, BR4).
12. **R-D12 Assistant drafts wait in one slim line at the top of the list.** Never a pop-up, never on Home. Needs gap G3. **Answered by V-D22 and BR10:** a draft is a Suggested family; Add to Recipes (`accept_suggested`) or Not for us; a dismissed draft shows only in that member's assistant history (answer 4, locked).
13. ~~**R-D13 Adding:** option 4 (A one box; B four doors).~~ Ask your assistant opens the person's own AI app (plan-week-ai decision 42: no in-app agent); its result comes back as a draft. **Narrowed by R-O4 (locked):** no one box, no four doors, no link paste, no scraping, no photo or link reading. Recipe content comes only through the assistant over Recipe's MCP surface; the app adds photos and notes.
14. **R-D14 One Check it screen for every new recipe.** **Narrowed by R-O4 (locked):** the only source is now an assistant draft (a Suggested family, V-D22); "read from a photo" and "read from a link" are gone, and `entered` (typed by hand in the app) does not arise while there is no in-app form. Whether a person confirms the draft on a Check it screen or through the assistant is the flow screens' to redraw (Proposal). Badge says where it came from. Plain = read from the source; *guess* = inferred; *?* = the source did not say, saved as unknown (Recipe `basis`: observed, inferred, unknown; Recipe also has `entered` for a value typed by hand, shown plain). Never invented.
15. **R-D15 Save is one tap.** The other button is Not now for an assistant draft (stays a draft) and Discard for your own. **Reworded by V-D22:** an assistant draft is a Suggested family; Save makes it Trying (`accept_suggested`); Not for us dismisses it into that member's assistant history only (BR10, locked answer 4). The old suggestion answers (Apply, Keep both, Not now, No thanks) went with V4 = B. Discard applies only to unsaved work of your own (nothing was stored). **Narrowed by R-O4:** with no in-app form there is no unsaved work of your own, so Discard drops out.
16. ~~**R-D16 Changing a recipe always makes a new version.** Said before you start; changes are counted; only what changed is saved (Recipe variation change set).~~ **Superseded by V-D10 and V-D11 (V2 = C, locked):** a try is fixed in place, a keeper or our usual asks Fix this one, Keep both or a different dish; under L4 the assistant asks in the chat. A revision stores only its change set (V6 = B, locked).
17. **R-D17 A new version is named from its change**; the optional "why keep it" is stored as the person's words (`user_intent`). Default for the household is a separate explicit tick. **Reworded by V-D10/V-D17:** applies to Keep both and spin off; a fix asks "what did you fix?"; the tick reads "Also make it our usual".
18. **R-D18 Cook it opens on the ingredients,** then one step per screen with its timer. Tap to tick; press and hold to say you used something else tonight. **Reworded by R-D30 (locked):** the step buttons carry the destination step's content (for example "‹ Beat the eggs" and "Fry the rice ›"), never "Back" and "Next".
19. **R-D19 The end of a cook asks once:** what leaves the pantry; for a batch, portions to the freezer; only if something was swapped, Just tonight or Keep it as a version (asks for their words; Recipe rejects a version without them). Optional photo or line into Cooked. **Reworded by V-D18 (V3 = A, locked) and P-D11, P-D13, P-D25:** "Keep it as a version" makes a Trying version; every cook of a Trying version adds Keep it, Needs work, Not for us ("Not for us" puts it away at once, with undo: BR17, locked); each member who ate it may react (V-D33); the photo is up to 3 photo ids on the cook and is the primary add door (P-D25); a note after a cook carries the cook's tag (P-D29). One ask, order in the handoff (section 5.1).
20. **R-D20 Versions:** option 3. **Locked as R-O3 = B, varied** (owner, voice, 10 Oct 2026): no versions row for a recipe with one version; a horizontally scrolling strip when there are several, docked as its own row above the jump row. Changed rows are tinted; what they replaced is struck through in brackets (plan-week-ai decision 30). ~~**Reworded by V-D8:** the chip opens the Versions screen; the sheet stays for a quick switch.~~ The chip is gone with option 3 A; the strip's last item, "All versions", opens the Versions screen (V1 = A, locked).
21. **R-D21 A likely duplicate is shown, never merged:** Open that one, Save as a version of it, Keep both (`potential_duplicates`). **Narrowed by R-O4:** applies to an assistant's draft only.
22. **R-D22 Missing items:** a cart icon per row, "Add all N missing to shopping", and the hint "Talk to your assistant about substitutes" (plan-week-ai decisions 11 and 29).
23. **R-D23 Hold shows only when the recipe is planned,** beside the Ingredients heading, "Held for Tue" (plan-week-ai decisions 9 and 33). On by default in the day picker.
24. **R-D24 Notes are the household's, on the recipe, on every version.** A note never changes the recipe. Needs gap G1. **Refined by V-D31 (locked answer 2):** a note is a field of the version, shown on the version it was written on and every version made from it, stored as a change only where a version's notes differ; "Every version of this recipe" is one tap away. Still the household's (any member writes, every member sees). Photos are per version or cook (P-D9, locked).
25. **R-D25 Put away, not delete** (Recipe disabled status). **Reworded by V-D2/BR3:** Put away is a version state and a family flag; the backend spec gains a family put-away call (handoff X9). **R-D31 (locked):** no admin approval; any member may put away (the usual still cannot be put away until another version is the usual, BR4).
26. **R-D26 Cooked is a short history:** date, who, version, their line, the night's photo. Needs gap G2. (Answered by V-D28 `record_cook` with revision, verdict, who ate it and their reactions, and P-D13: up to 3 `photo_ids`, pending upload slots resolving into them.)
27. **R-D27 List order:** fewest missing first, then longest since cooked. Pills are symbol plus number: all in, N missing, starred, freezes, versions.
28. **R-D28 The day picker** shows this week (Monday first) with what is planned, past days greyed, usual day off marked, up to four weeks ahead (plan-week-ai decision 1). A day that already has a meal gets a second meal; nothing is replaced.
29. **R-D29 Plan tab: a sorted meal taps straight into cook mode.** **Locked (owner, voice, 10 Oct 2026; L6).** Plan-tab behaviour, owned by the Plan features: recorded as cross-feature requests XR1 and XR2 in the handoff. What "sorted" means is open (build default in the handoff).
30. **R-D30 Cook-mode step buttons name where they go.** **Locked (owner, voice, 10 Oct 2026; L7).** The buttons carry the destination step's content, not Back and Next.
31. **R-D31 Putting away needs no admin approval.** **Locked (owner, voice, 10 Oct 2026; L8).**
32. **R-D32 Navigation pattern unchanged.** **Locked (owner, voice, 10 Oct 2026; L9):** left gutter (rail) on desktop, bottom nav on mobile. The items: Recipes is a standalone tab (T2, closes R-O6).

### Options (five locked, one open)

| # | Question | A | B | C | Status |
|---|---|---|---|---|---|
| 1 | The list | One ranked list | Shelves (Ready now, Not cooked lately, A to Z) | Photo grid | **Locked R-O1 = A** (owner, voice, 10 Oct 2026) |
| 2 | Recipe page | One scroll, sticky jump row | Tabs on the same row | – | **Locked R-O2 = A**, jump row docked at the top |
| 3 | Versions | Chip in the meta row, tree in a sheet | Strip under the title | – | **Locked R-O3 = B varied**: no row for one version, scrolling strip for several, docked above the jump row |
| 4 | Adding | One box (paste, type, link; camera and mic on it) | Four doors | – | **Locked R-O4 = redefined**: neither; content only through the assistant's MCP surface; the app adds photos and notes |
| 5 | Follower | Tonight leads, opens the recipe | Tonight opens cook mode | – | **Locked R-O5 = void**: no follower distinction (R-D8 void) |
| 6 | Tab bar | Plan, Pantry, Recipes, Shopping | Home first, Plan inside Home | – | **Closed (T2, 11 Oct 2026)**: Recipes is a standalone tab; the voice session's earlier "locked as A" was an assistant's error, this is the owner's own answer |

### Recipe-side gaps (solve in Recipe; Kitchie renders)

- **G1 Notes:** ~~append-only note list per recipe family (text, member, when).~~ **Answered by V-D31 (locked answer 2):** notes are a line of the version, inherited, rich-text blocks with stable ids, changes only (spec 9.4; `write_notes`).
- **G2 Cook history:** one entry per cook (when, member, recipe or variation id, servings, optional line, optional photo ref). Today `record_usage` keeps only a count and last date. **Answered:** V-D28 (version and revision), P-D13 (`photo_ids`, up to 3).
- **G3 Drafts:** a draft status that lists, search and ideas skip, so the assistant writes once and a person confirms. Today only active and disabled. **Answered by V-D22** (a Suggested family, in Recipe).
- **G4 Household default version** per family. **Answered by V-D5** (the usual).
- **G5 Added by:** a member id, not only free text in `source.description`. **Answered by V-D20.**
- **G6 Step minutes:** optional per step, never invented, to drive timers. (Spec 10.2: `Step.minutes`, a Measured value.)
- **G7 Photos:** dish, step and cook photos (photo-storage slice). **Answered by P-D1 to P-D31** (P1 to P13 locked; step photos are in, P-D23).
- ~~**G8 Reading a photo or link:** Recipe has no parser; the reading is the AI's. Open: which side runs it and how Kitchie hands it the photo or link.~~ **Dropped by R-O4 (locked):** nothing reads photos or links; recipe content comes only through the person's assistant.
- **G9 Batch facts:** agree closed tag words for freezes and portions (closed vocabulary where logic acts).

### Open questions

- Tab bar order (option 6). Wrong guess costs every tab's bar.
- ~~G3: draft status in Recipe, or held in Kitchie until saved?~~ Answered by V-D22: in Recipe.
- ~~Notes on the family or a version?~~ Answered by V-D31 (locked): a field of the version, inherited.
- ~~G8: who reads photos and links.~~ **Closed by R-O4 (locked):** nobody; no photo or link reading, no scraping, no link paste.
- ~~Can a follower change a recipe, or only add notes?~~ **Closed by R-O5 (locked):** there are no followers; every member has the same controls.
- Should Ready now treat items held for another meal as unavailable? Mockup: no. **Conflicts with I-D6** (a held item counts as not in). Build default: held counts as not in, in both places (plan-week-ai 33: a hold is a real claim). Handoff X8.
- ~~Does Put away need agreement in a household with admins (preferences D25 to D30)?~~ **Closed by R-D31 (locked):** no admin approval.
- Closed 11 Oct 2026: the tab bar items (R-O6, T2) and who draws the tab (X16, T1). Still open: the editing screen (owner: "we'll do that later"), what "sorted" means for R-D29.

### For the implementation

- Default path loads the list only: theme, `recipe.css`, one shared script. Day picker, Versions sheet, note and photo screens are built on tap or are their own routes; Cook is a separate route (Add, Check it and Change it hand off to the person's AI app under L4). Photos load by phase (P-D20, P-D21): text first, then step photos, the banner last; list tiles start as a stock picture; Home is never affected.
- Class names (`.rr`, `.ing`, `.strip`, `.act`, `.sheet`, `.serves`) and tokens are meant to be lifted. Sample names are only in `recipe/recipe.js`.
- Recipe tools used, after schema v6 (spec sections 3 and 5; today's names stay as aliases for a release): `list_recipes` / `search_recipes` (list, one row per family), `get_family` and `get_version` (page, strip and Versions; `get_resolved_recipe` is an alias), `what_am_i_missing` (pantry dots), `create_recipe` and `patch_version` with `user_intent` (assistant only, L4; `create_variation` is an alias of `patch_version` with `target: new_version`), `record_cook` (end of cook; `record_usage` is an alias), `react` (this member's liked or not for me; `set_preference` is an alias), `set_version_state` / `set_family_put_away` (Put away; `set_recipe_status` is an alias), `undo_event`, `write_notes`, `list_reviews` / `resolve_review` (To review, app only). Plan entries, holds and shopping belong to Kitchie.

---

## Slice: recipe versions and lifecycle

Mockup: [`recipe-versions/`](../../../recipe-versions/index.html) (index with decisions and options, `version.html`, `family.html` (Versions, grouped by state), `change.html`, `history.html` (history, undo and compare), `after-cook.html`, `suggestions.html` (To review), backend [`spec.html`](../../../recipe-versions/spec.html); shared `versions.css`, `versions.js` on top of the flow slice's `recipe/recipe.css` and `recipe/recipe.js`). The slice page is the source of truth for the wording below.

### Job

Owner's brief (10 October 2026, paraphrased): Recipe treats recipes and variations as immutable, and that should be relaxed a lot. People do not know what "the recipe" is. Sometimes they need to update the same version in place, sometimes keep several, sometimes spin one off with a parent. They may not want to lock in a recipe until it is tasty (a draft or trying state). Assistants (AI via MCP) and the UI both create and update. **Changed later the same evening by R-O4 (locked):** recipe content comes only through the assistant over MCP; the UI adds photos and notes. What the UI may still do to versions (state, the usual, put away, review an assistant's change, undo) stands; whether the UI edits content waits for the editing-screen conversation ("we'll do that later"). Database changes are fine; everything stays in UAT. Owner, typed, on storage (V6): "something like git in concept where only the change / diff is kept… rich text, notes, images, links… storage efficient." On undo: "UNDO is needed, this is why I want you to be efficient in storage of diffs."

### How we know the person is in this job

They opened the versions strip's "All versions", a version's ⋯ sheet, Change, History, a "To review" badge, or reached the end of a cook of a version that is still Trying. Not detected otherwise; it is part of the Recipe tab job.

### What leads

- On a version: its state, in one slim band with the one action that moves it on, or the "To review" line; then the recipe.
- On Versions: the household's usual, then what is being tried, then the keepers; put away and spun off folded.
- On Change: where the change will land, said before anything is touched; then the hand-off to the person's AI app (L4).
- At the end of a cook of a try: one question, three big answers; then each eater's reaction.

### What this job does not need

Pantry status beyond the dots, plan and holds, photo management (the photos slice), nutrition figures (only that they belong to a revision), the full lineage graph by default.

### Decisions (V-D numbering; Proposal unless marked Locked)

1. **V-D1 Three layers: recipe (family), version, revision.** Immutability moves down to the revision; a version can be fixed in place and nothing it said before is lost. (V5 = A, locked.)
2. **V-D2 Four version states: Suggested, Trying, Kept, Put away** (plus Spun off). Suggested = an assistant made it and no person said yes (out of lists, plans, ideas, search). "Favourite" is not a state.
3. **V-D3 Transitions:** Suggested to Trying (a person says yes) or dismissed; Trying to Kept (Keep it) or Put away (Not for us); Kept to Trying or Put away; Put away to Kept (Bring back). Making a try the usual also keeps it. Spin off ends a version here with a link to its new recipe.
4. **V-D4 State shows in one slim band** with its one next action (Keep it, Bring back, Open). Kept and the usual need no band; the "Our usual" pill says it.
5. **V-D5 "The recipe" is the family, named by and opening its usual.** One list row per family. Plan, Cook and Ideas open the usual. Exactly one usual always. Answers G4.
6. **V-D6 Stars are per member** and never change what the household opens; a star is the member's own "liked" (V-D33). **Locked (owner, typed, 10 Oct 2026; answer 5).** Replaces "Open, cross-feature X5". X5 answered for Recipe's side as both, derived.
7. **V-D7 A version row:** name, what it changed from its parent, who and when, cooked count and revision, usual and state pills. Assistant work shows a dashed ✦ and "Alex's assistant".
8. **V-D8 Versions is a screen, grouped by state (V1 = A).** No chip (L3): a recipe with one version has no versions row; with several, the strip is the quick switch and its last item, "All versions", opens this screen; the ⋯ sheet opens it too. Holds states, put-away versions, "To review" and compare. **Locked (owner, typed, 10 Oct 2026).**
9. **V-D9 All lifecycle actions in the version's ⋯ sheet, only those that apply:** Make it our usual, New version from this, Make it its own recipe, History, Compare with our usual, Keep it, Back to trying, Put away.
10. **V-D10 Three kinds of change in the person's words:** Fix this one (next revision), Keep both (new version, parent = this, starts Trying), It is a different dish now (spin off). **Narrowed by L4:** the person says them to their assistant, which writes them through `patch_version`'s `target`.
11. **V-D11 Where a change goes: V2 = C.** A try takes edits in place; a keeper or our usual asks: fix this one, keep both, or a different dish. Change in Recipes says where it will land, then opens the person's AI app (L4). Supersedes R-D16. **Locked (owner, typed, 10 Oct 2026).**
12. **V-D12 A child is pinned to its parent's revision.** A later parent fix is offered once ("Bring it in"), never applied silently.
13. **V-D13 History:** revisions newest first (plus "Who changed what", a per-line blame, from V6 B) with kind, who (assistant marked), when, their words, diff in the R-D20 tint; See it as it was; Go back to this; Undo this change. Every undo saves a new revision; nothing is rewound.
14. **V-D14 Compare:** two columns, only what differs, the rest folded into one line; left is always the usual.
15. **V-D15 Kept as audit trail, never changed or deleted:** revisions, cook log (version and revision), journal, nutrition observations (on a revision), reviews and their outcome, spin-off links.
16. **V-D16 Relaxed:** version name, state, current revision and parent label; family name and usual; per-member stars; `cover_photo_id` (P-D4); each version's notes and photos heads (their own revision lines, spec 9.4 and 9.5). Each change is a journal event with who and when.
17. **V-D17 The person's words stay required when an assistant acts** (every content or state write; an assistant never resolves a review or accepts its own draft without the person's yes). In the app the tap is the intent and "why" is optional.
18. **V-D18 Promoting a try: V3 = A**, ask after every cook of a Trying version: Keep it, Needs work, Not for us. Keep it offers "Make it our usual" as a separate tick; Needs work can hand the change to the assistant; **Not for us puts it away at once, from the first cook, with undo** (answer 1, BR17). Sits inside R-D19's single end-of-cook ask. **Locked (owner, typed, 10 Oct 2026).**
19. **V-D19 Any member who cooks it answers; the first answer counts;** a later cook can change it. **Locked L5:** no followers; every member is asked alike.
20. **V-D20 Every revision and state change has an author (member), a channel (app or assistant) and, for an assistant, its client name** ("Alex's assistant (Claude)"). Kept for attribution though all members are equal. Answers G5.
21. **V-D21 The assistant and kept versions: V4 = B, edit and review after.** An assistant may change any version, a keeper or the usual included, with the person's words. A change to a keeper or the usual is live at once and opens a review: a "To review" badge on the version, its strip item, Versions and History for every member; the review shows what changed, which assistant for whom, their words; Looks right accepts all, Undo reverts one change as a new revision. A cook meanwhile is logged against the revision it used and does not close the review. Tries are never reviewed. **Locked (owner, typed, 10 Oct 2026).**
22. **V-D22 Reviews and drafts wait quietly:** one slim line on the version and on Versions, and a To review screen. Never a pop-up, never on Home (R-D12). The old suggestion answers (Apply, Keep both, Not now, No thanks) are void with V4 B. A whole new recipe from an assistant is still a family whose only version is Suggested (R-D12's draft, gap G3): Add to Recipes or Not for us. **A dismissed draft is visible only in that member's assistant history** (answer 4, locked; replaces "a put-away draft shows under Put away").
23. **V-D23 Who may do what: everyone, equally (L5, L8).** Every member may keep, put away (whoever cooked it, no approval), change the usual, review an assistant's change and remove photos; content comes through each member's assistant (L4). The usual cannot be put away until another is the usual (BR4). Authorship is still recorded. Replaced by spec BR16. **Locked L5, L8.** Stays with the preferences owner: D25 to D30, PL3 and its flag, finer roles (X3, X6 closed for the Recipe side only).
24. **V-D24 Two saves at once never overwrite.** A save names its starting revision. If someone saved first and the two touched different lines, the server applies the new change on top (V6 B: changes are by line id); if the same line, nothing is saved and the person (or their assistant) is told who changed what (`stale_base`).
25. **V-D25 Spin off** makes a new recipe whose first version is Trying, labelled "From Egg fried rice"; the old version stays read-only as "Spun off" with a link.
26. **V-D26 "Version" on screen, never "variation".** The API follows with aliases for a release.
27. **V-D27 Migration without loss:** recipe to family plus "Original" (Kept, usual) at revision 1; variation to version (Kept or Put away) whose revision 1 is its existing change set (variations are already sparse, so V6 B maps them one to one), pinned to the parent's revision 1; old ids keep working; authors are "before members".
28. **V-D28 The cook log records version and revision** (extends G2).
29. **V-D29 Nutrition belongs to a revision;** after an ingredient fix, figures show "for an earlier revision" until new ones are recorded. Recipe recomputes nothing.
30. **V-D30 Loading:** the version page loads its head only (from a head cache, so no change sets are applied); Versions, History, Compare and To review are routes; sheets build on tap; one small stylesheet and script on top of the flow slice.
31. **V-D31 Notes are a field of the version, inherited.** A note shows on the version it was written on and every version made from it; a version stores a notes change only where its notes differ (per block). Inherited notes say "From Original"; reworded ones "Reworded here"; hidden ones fold into one line with Show again. Add a note goes on the version in front of you, with "Every version of this recipe" offered. Live inheritance (spec 9.4, sub-option NA, Proposal). Refines R-D24. A note after a cook goes on the cooked version with its tag. **Locked (owner, typed, 10 Oct 2026; answer 2).** Replaces "notes on the family only, or also per version".
32. **V-D32 Nothing is deleted; anything can be undone, any time.** No delete for a try made by mistake: put it away, with undo. History has "Undo this change" on each revision and "Bring back" on a put-away; each undo is a new revision or event, so it can be undone too. Keeping a mistake costs about 1.8 KB (spec 9.10). Only photo files are ever removed (photos slice). **Locked (owner, typed, 10 Oct 2026; answer 3).**
33. **V-D33 Each member reacts; the household's view is derived.** After a cook each member who ate it can say liked or not for me, or skip; anyone can change theirs later. The household sees "Liked by Sam and Jane · 2 of 3 who ate it" and a Household favourite pill when its rule says so (Proposal: more than half of those who ate it, at least 2). A "not for me" is shown by name only to its giver; others see a count. Nothing is stored as a household vote. **Locked (owner, typed, 10 Oct 2026; answer 5; the rule is a Proposal).**

How this changes the flow slice: R-D16 is superseded by V-D10 and V-D11 (V2 C). R-D17 stands for Keep both and spin off; a fix asks "what did you fix?". R-D19 gains V-D18's three answers for a try and V-D33's reactions; "Keep it as a version" makes a Trying version. R-D11: "Make it our usual". R-D20: the strip's last item opens Versions (V1 A). R-D24 is refined by V-D31. Gaps G1, G3, G4, G5 answered (V-D31, V-D22, V-D5, V-D20); G2 extended (V-D28).

### Options (all six locked, owner, typed, 10 Oct 2026)

| # | Question | Locked | Not chosen |
|---|---|---|---|
| V1 | Versions screen | **A** grouped by state | B family tree |
| V2 | Where a change goes | **C** by state: a try takes edits in place, a keeper asks at save | A ask at save; B ask before editing |
| V3 | Promote a try after a cook | **A** ask every cook | B from the 2nd cook; C never ask |
| V4 | Assistant on a kept version or the usual | **B** edit, review after | A suggest only; C trusted per member |
| V5 | How far immutability is relaxed (backend) | **A** frozen revisions under changeable versions | B mutable rows, journal only; C today's rule plus states and usual |
| V6 | What a revision stores (backend) | **B** changes only, git-like (spec section 9) | A whole recipe per revision |

### Recipe-side backend rules (to be filed as Recipe issues later; not filed)

Full detail in [`recipe-versions/spec.html`](../../../recipe-versions/spec.html):

- **Rules BR1 to BR19.** BR1 revisions immutable; BR2 versions and families are changeable pointers; BR3 nothing a person made is deleted (locked); BR4 one usual; BR5 parent pinned; BR6 optimistic concurrency with rebase; BR7 author, channel and client; BR8 the person's words on assistant writes; BR9 assistant scope (4 B); BR10 Suggested invisible, dismissed drafts only in that member's history (locked); BR11 temporary substitutions not persisted; BR12 missing stays missing; BR13 reasoning stays with the caller; BR14 changes only, git-like (6 B); BR15 review after, for kept versions (4 B); BR16 everyone is equal (L5, L8); BR17 "Not for us" puts a try away at once (locked); BR18 undo any time, never a rewind (locked); BR19 reactions per member, household derived (locked).
- **Schema v6** (section 2): `families`, `versions` (with `cover_photo_id`, `dismissed_by`, `notes_head_id`, `photos_head_id`), `objects` (content-addressed, immutable), `revisions` (parent pointer, change set, optional checkpoint `tree_hash`, three lines: content, notes, photos), `head_cache`, `reviews`, `cooks` (`photo_ids_json`, `ate_json`, verdict), `reactions`, `refs`, `legacy_ids`.
- **Storage** (section 9): content-addressed pieces, change sets by stable item id, checkpoint every 10th revision (K10), word splices in step text, rich-text note blocks with stable ids (9.4), photos only by id on a version's photos line (9.5), revert and restore as new revisions (9.6), rebase of non-overlapping saves (9.8), nightly gc of unreferenced objects only (9.9). Real numbers (9.10): about **27 MB** (22 MB without the head cache) for 200 recipes × 5 versions × 20 revisions, against about **117 MB** for whole copies; a mistaken try kept with undo about **1.8 KB**; undoing one change about 1.0 KB.
- **MCP tools** (section 3, detail in section 10): `validate_recipe`, `create_recipe` (changed), `import_recipes`, `get_family`, `get_version`, **`patch_version`** (the one content-edit tool, with `target` fix, new_version or spin_off; replaces `revise_version` and `create_version`), `restore_revision`, **`revert_change`**, `list_revisions`, `compare`, `blame`, `set_version_state`, `set_usual`, `set_family_put_away`, **`accept_suggested`**, `rename`, `write_notes`, **`react`**, **`undo_event`**, `list_my_drafts`, **`list_reviews`**, **`resolve_review`** (app only), `record_cook`, `list_cooks`, `request_photo_upload`, `get_upload`, **`get_photo`**, `export_family`. **Removed with 4 B:** `propose_change`, `list_suggestions`, `resolve_suggestion`, the `suggestions` table, `member_settings.assistant_trusted`.
- **Errors** (section 4): `stale_base`, `bad_transition`, `is_usual`, `no_change`, `intent_required`, `target_required`, `invented_value`, `duplicate_key`, `not_allowed` (only an app-only tool on the assistant channel, never a role check), `too_large`, `invalid_change`.
- **Today's tools as aliases for a release** (section 5), **HTTP for Kitchie** (section 6: under L4 the app writes state, usual, put away, notes, cooks, reviews and photos, never recipe content), **migration v5 to v6** (section 7).
- **Issues R-V1 to R-V12** (section 8). **R-V1 is approved by the owner** (typed, 10 Oct 2026): reverse "recipes and variations are immutable" in Recipe's `AGENTS.md` and brief, as the first Recipe-repo change when the build starts (issue, build, PR), with the replacement wording in section 8. R-V9 (reactions) is locked as BR19; R-V10 is the assistant authoring surface (RT-R10); R-V11 compaction and export; R-V12 notes per version and `undo_event`.

### Open questions

- ~~V1 to V6.~~ All locked (owner, typed, 10 Oct 2026).
- ~~"Not for us" on the first cook of a try: at once or wait?~~ At once, with undo (locked answer 1, BR17).
- ~~Notes on the family or a version?~~ A field of the version, inherited (locked answer 2, V-D31).
- ~~Any real delete?~~ No; undo any time (locked answer 3, V-D32).
- ~~How long dismissed drafts stay visible?~~ Only in that member's assistant history (locked answer 4, BR10).
- ~~Stars per member or household-wide (X5)?~~ Per member, household derived (locked answer 5, V-D33); X5 answered for Recipe's side.
- ~~R-V1.~~ Approved (locked answer 6).
- **Still open:** notes sub-option NA (live, default) vs NB (pinned) vs NC (two levels) (spec 9.4); the household-favourite rule is confirmed (T6; spec 2.1); migration of a disabled root with active variations (default: the most-used active variation becomes the usual, none active: family put away); member ids in standalone mode (default one `legacy` member); a cook photo as a banner by explicit choice is locked (T5, spec 9.5).
- **For the preferences feature (their files, not edited here):** F1, Q1, Q-R8 to read Recipe's reactions as per member with the household view derived; whether a member's private "no" may lower a recipe's rank in that member's own Ideas.

### For the implementation

- Default path: theme, `recipe/recipe.css`, `recipe/recipe.js`, `versions.css`, `versions.js`; one `get_version` call served from the head cache. Everything else is a route or a sheet built on tap; history pages older revisions on scroll (each rebuilt from a checkpoint on the server).
- Classes to lift beside the flow slice's: `.st` (with `.rvw`), `.vr`, `.band`, `.rv`, `.df`, `.ch`, `.rvc`, `.rvrow`, `.verd`, `.cmp`, the notes and reactions classes `.note.vn`, `.nfrom`, `.nhid`, `.react`, `.ate`, and the flow slice's `.vstrip`. Sample names only in `versions.js`.

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
6. **I-D6 Score** (likes, dislikes, avoids and caps come from the preferences service's `evaluate()`, not a second reading of food rules; handoff X4): ready (all in +3, one missing +1, two ≈0, three or more −2; a missing item already on the list costs less); use it up (+2 due in 3 days, +3 due tomorrow, max +4); rotation (+2 a month, +1 two weeks, −2 within 4 days, +1.5 never cooked); trying a version +1.5 for its maker; favourite +1 (**after V-D33, locked:** "favourite" reads the derived household favourite or the eaters' own likes, never a stored household vote; whether a member's private "no" may lower a rank in that member's own Ideas is the preferences chat's question); quick weeknight +1, over an hour −2; dislike of someone eating −1.5, like +1. Ties: fewer missing, then longest since cooked. Starting numbers, tuned with use. A held item counts as not in.
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
- **G11 Recipe:** star, vote, version status and default version returned in bulk with `list_recipes` or `what_can_i_cook` (today per target, and not a tool). **After V-D33 (locked):** reactions per member with the household view derived, in bulk.
- **G12 Recipe:** the "trying" version status (recipe-versions slice), readable in bulk.
- **G13 Recipe:** keep `matched_as` on each verdict; Kitchie joins use-by on it.

### Open questions

- I-O1 to I-O3. I-O4 defaults to A = Kitchie (T8, owner delegated 11 Oct 2026; correctable later; a wrong I-O4 would cost a rewrite across two repos).
- Does Not for me write a dislike at once (person level, ungated) or ask? Mockup: writes, with Undo.
- A household lean set by an admin? Mockup: no, per person.
- Cooked in the last two days: filter, or just a strong negative? Mockup: filter.

### For the implementation

- Default path on Home: one K1 call after the stock tiles, never blocking them; only for a household with Recipes. Sheets (Why, Tune, Ask, day picker) build on tap; See all is its own route.
- Ranking: one pass over at most 100 recipes, cached per household for a few minutes and dropped on any stock, plan or food-rule change.
- Lift `.ideas`, `.idl`, `.idr`, `.why`, `.rtag` and the `rank()` shape from `recipe-ideas/ideas.js`; sample signals live only there.

---

## Slice: recipe photos

Mockup: [`recipe-photos/`](../../../recipe-photos/index.html) (index with the architecture decisions, options and the blob port, derive queue and MCP tools; `list.html`, `recipe.html`, `add.html`, `assistant.html`, `free.html` (Free up space), `note.html`, `done.html`; shared `photos.css`, `photos.js` on top of the flow slice's `recipe/recipe.css` and `recipe/recipe.js`; sample pictures in `img/`). Answers gap G7. The slice page is the source of truth for the wording below.

### Job

Seeing what a recipe looks like when choosing it, keeping a picture of what was actually cooked, and adding one with as little effort as possible, from the app or by showing it to the assistant. **R-O4 (locked) puts photos and notes at the centre of what the app adds:** extra photos, especially after cooking, and notes. No photo is ever read for recipe content. Owner's brief (10 October 2026, paraphrased): lock the architecture before anything is built (where bytes live, storage on the existing Tencent Lighthouse 2 vCPU / 2 GB server with snap Docker, pay for nothing, backups include photos, sizes and formats, upload from the UI and from AI, limits, per-version vs per-recipe, cooked-it photos, privacy through the Platform household token, caching, deletion); site performance is strict: lazy and progressive, nothing loaded until needed, a stock placeholder first, and Home never affected.

### How we know the person is in this job

They reached the end of a cook ("Add a photo"), tapped the camera on a Cooked row or "Made it tonight?", opened a recipe (the banner and step photos), tapped Add a note, opened Free up space from the 80% line, or showed a photo to their assistant. Not detected otherwise; it is part of the Recipe tab job.

### What leads

- On the list: a stock picture in every tile first, then the banner's square (planned recipes first).
- On the recipe page: the text, then the step photos, then the banner (P-D20); gallery and cook photos on a tap.
- At the end of a cook: Add a photo, already aimed at tonight's cook; then the note (P-D25, P-D26).

### What this job does not need

Storage details on screen, file sizes (except Free up space), editing tools beyond a square crop for a banner, sharing outside the household, web photos (L4).

### Decisions (P-D numbering; Proposal unless marked Locked)

1. **P-D1 Recipe owns recipe photos;** Kitchie stores none and shows them by id. **Locked P1 = A.**
2. **P-D2 Blob port, files adapter now:** photo bytes only through a `BlobStore` port (put, get, read, exists, stat, delete, listByOwner); the files adapter keeps content-addressed blobs at `<data>/blobs/<household>/<aa>/<bb>/<hash>` beside `recipes.db`, plus `uploads/<slot id>` for unshrunk uploads; online object storage is a named future adapter; rows hold content hashes, never paths. **Locked P2 = A + port.**
3. **P-D3 Disk budget:** banner (large + square) about 260 KB; any other photo (medium + square) about 87 KB (was 350 KB for every photo). 2 GB holds about 23,000 photos of the second kind or about 8,000 banners. Check free space (`df -h`) on the data folder before turning photos on: the disk size is not recorded anywhere readable. Proposal.
4. **P-D4 One row per photo:** random id, household, family, version or cook, kind (banner, step with the step's stable item id, more, cooked), author and channel, dimensions, square crop, colour, 24px preview, the content hash and bytes of each kept size, state (pending, ready, removed, failed), added, removed at. A revision never holds a photo; the version's photos line (versions spec 9.5) points at ids; `cover_photo_id` is its banner, cached for lists. Proposal.
5. **P-D5 Contract:** replies carry photo ids, colour, state and the preview (banner only), never bytes. HTTP `GET /recipe/photos/<id>/t|m|l.webp` (404 for a size the photo does not keep), `POST /recipe/photos`, `DELETE`, `POST …/restore` (within 5 minutes). For assistants: `request_photo_upload`, the upload slot, `get_upload`, `get_photo`. No tool takes a link or an image address. Proposal.
6. **P-D6 Kept sizes, no originals:** the banner keeps l 1600px and t 240px square; every other photo keeps m 960px and t; WebP about quality 75. **Locked P3 = A, varied.**
7. **P-D7 The phone shrinks first; the server derives when it is free:** an unshrunk upload is stored, the row is pending, and the derive queue makes the sizes at lowest priority with load back-off (banner square, other squares, banner large, other mediums); a third-party `Deriver` is a named seam. **Locked P4 = C.**
8. **P-D8 Limits (settings):** 1 banner per version; 1 photo per step, at most 10 step photos per version; up to 3 gallery photos per version; 3 per cook; 2 GB per household (a slim line at 80% links to Free up space); 8 MB per upload; 60 uploads an hour per member. Free up space lists versions by photo bytes, unused first, with search; only photos go, text and history stay. **Locked.**
9. **P-D9 Photos belong to a version or a cook, never a revision.** A fix keeps photos; a new version shows its parent's, marked; Replace adds the new one and removes the old with the 5-minute undo; a spin-off can point at the same blobs (nothing copied). **Locked P6 = A.**
10. **P-D10 Banner: only a recipe photo can be a banner;** a cooked photo never stands in. A version with no banner of its own shows its nearest ancestor's with a small branch icon; no banner up the line means no banner. **Locked P7 = B.** Closed by T5: a cook photo may be the banner by explicit choice only; always exactly one banner per version.
11. **P-D11 Adding from the app:** every add door opens the phone's camera or picker on the first tap, aimed; secondary paths: the banner, Step photo beside Method, Replace in the viewer; a banner gets a square crop; up to 3 at once from one cook; background send with retry; any member (L5). Proposal.
12. **P-D12 From an assistant:** the assistant's MCP call gets a one-time upload slot itself (15 minutes, bound to household, target, declared hash and size; secret in a header); not blocking; verified acknowledgement; at most 3 attempts, each smaller (2000px q85, 1400 q80, 1000 q75), then it stops and tells the person; fallback a Kitchie link to the same slot. **Locked P5 = A, refined.** Replaces the link the person taps.
13. **P-D13 Cooked-it photos are part of the cook entry** (`record_cook`, up to 3 `photo_ids`; an assistant may pass pending upload slots). Shown on that night's Cooked row and under Photos, on demand. Never the banner. Proposal.
14. **P-D14 Nothing jumps, nothing loads early:** every box sized first and filled with the photo's colour; loading by phase; the add screen and its shrinking code are a separate route. Proposal.
15. **P-D15 Private to the household:** same-site addresses checked against the Platform sign-in and household; 404 for anyone else; the assistant reads with `get_photo` under the same SSO as the person. Expiring public share links: a named future. **Locked P8 = A + MCP read.**
16. **P-D16 Caching:** a size's bytes never change, so `private, max-age=31536000, immutable`; a pending size answers 404, not cached. Proposal.
17. **P-D17 Removing:** any member (L5); hidden for everyone at once with Undo for 5 minutes (a slim row counts down); then the blobs are deleted unless the same hash is used elsewhere in the household; the row keeps only that a photo was removed, by whom and when. **Locked P10 = B, 5 minutes.** Replaces the 30-day restore and "Delete it for good now".
18. **P-D18 Backups:** the database as today, then only new blobs. **Locked P11 = B.**
19. **P-D19 No photo, no pretend photo:** no banner means no photo box on the page (the emoji by the title); list tiles start as a stock picture and keep it when there is no banner; Photos shows "No photos yet: snap it next time you cook it". Proposal.
20. **P-D20 Top of the recipe page:** full-width banner, 200px tall, the large size; text first, then step photos in the first two screens, then the banner, further step photos as they near; gallery and cook photos only on a tap. **Locked P12 = A.**
21. **P-D21 Lists:** the banner's 240px square in the 56px tile; stock picture first; then this week's planned recipes; then rows on screen plus 5 more in the shown category; the rest as they scroll in; Home never affected. **Locked (P13).**
22. **P-D22 Viewer:** the kept big size with who, when and what it is kept as; Replace and Remove for every member; an inherited photo offers "Add its own". Proposal.
23. **P-D23 Step photos are in:** kind step, keyed by the step's stable item id; dropped from the resolved view (not removed) when a revision removes the step, back with that revision's undo. Proposal (owner decision, 10 Oct 2026, moved them from "later").
24. ~~**P-D24 A photo from someone else's website.**~~ **Void by L4.**
25. **P-D25 After-cook photos are the star:** the end of a cook and each Cooked row are the primary add doors; one tap opens the camera already aimed at that cook. Proposal.
26. **P-D26 Notes are the UI's second job:** `note.html`, its own route, from Notes on the recipe page and the end of a cook; where a note lives is V-D31 (locked). Proposal.
27. **P-D27 Simple rich text, stored as text:** bold and list lines and at most one photo reference `[photo:<id>]`; never HTML. **Note limit (T7, locked 11 Oct 2026): one 4,000-character cap for the app and the assistant; the UI enforces nothing smaller; a long note scrolls inside a bounded note box.** Replaces the 600-character app limit.
28. **P-D28 Removing a note keeps its photo;** removing a photo a note points to drops the picture from the note. Proposal.
29. **P-D29 A note written after a cook carries that cook's tag** ("After the 8 Oct cook"). Proposal.
30. **P-D30 "Photo is being prepared":** a pending photo draws its box at final size in its own colour with one quiet line; Kitchie checks three times, then "Photo will appear later". Proposal (draws P-D7).
31. **P-D31 Notes and the 5-minute removal:** a note pointing at a removed photo renders nothing for it; the note's text never changes. Proposal.

How this changes other slices: R-D9 is narrowed (one banner, loaded last, stock tile in lists). R-D19's photo is P-D25's primary door. R-D26 and G2: a cook carries up to 3 photo ids, pending slots resolve into them. G7 is answered by P-D1 to P-D31. The versions spec (9.5, 9.9, 10.3, 10.8) was aligned on 11 October 2026: blobs behind the port, two kept sizes, the assistant uploading itself, `get_photo`, 5-minute removal.

### Options (P1 to P13 locked, owner, typed, 10 Oct 2026; N1 open)

| # | Question | Locked | Not chosen | Downside of the pick |
|---|---|---|---|---|
| P1 | Who owns photos | **A** Recipe | B Platform service; C Kitchie | Recipe gains file routes and a growing store |
| P2 | Where bytes sit | **A + port**, files adapter now; object storage a named future | B SQLite blobs; C object storage today | One more layer; row and blob kept in step (blob first, nightly sweep) |
| P3 | What is kept | **A, varied**: banner large + square; others medium + square; no originals | B plus original; C original only | A step or cook photo never shows bigger than 960px |
| P4 | Who shrinks | **C** phone first, server derive queue when free | A phone only; B server only | An image library on the server; "being prepared" on a busy day |
| P5 | Assistant upload | **A, refined**: the assistant uploads itself, not blocking, verified, 3 smaller tries | B base64 in the call; C web address (L4) | An assistant that cannot send files falls back to a Kitchie link |
| P6 | Attached to | **A** version or cook | B whole recipe; C revision | A new version shows its parent's photos until it has its own |
| P7 | No banner | **B** recipe photos only, inherited with an icon | A newest cooked stands in; C newest of any kind | A recipe with only cooked photos has no banner |
| P8 | Privacy | **A + MCP read** (`get_photo`, same SSO) | B signed links; C script-loaded with token | No sharing outside the household yet |
| P9 | Limits | **The owner's set** (above) | A 6/1 MB; B roomy; C household total only | Free up space is how a household stays under 2 GB |
| P10 | Removing | **B** undo 5 minutes | A 30-day restore; C never deleted | A removal noticed after 5 minutes is gone (backups only) |
| P11 | Backups | **B** database, then new blobs only | A whole folder; C none | Both copies still on one server (infra's question) |
| P12 | Top of page | **A** full width, loaded last | B square by title; C none | The banner is the last thing to appear |
| P13 | Lists | **The owner's order** (stock first, planned, on screen + 5) | B no photos; C 40px rows | Every row shows the stock picture for a moment |
| N1 | A note at the end of a cook | **Closed (T4, 11 Oct 2026):** A, no question; notes live at recipe or version level, inherited | B ask "this cook only" or "for next time" | A one-night note sits among the lasting ones |

### Recipe-side work (to file as Recipe issues on the owner's say; not filed)

RP1 photos table (kinds, states, hashes per kept size), blob first then row, nightly sweep for strays and removals past 5 minutes. RP2 photo routes (upload, serve through `BlobStore.read` with the household check and cache headers, remove, restore within 5 minutes). RP3 banner and step pointers through the versions spec's photos line with the parent fallback. RP4 the Platform cookie on photo `GET`. RP5 `request_photo_upload`, the slot, the verified acknowledgement, `get_upload`, the retry ladder. RP6 backups: database first, then only new blobs. ~~RP7 web photo~~ dropped by L4. RP8 notes body and photo references (with the versions spec's notes). RP9 the blob-storage port and files adapter with conformance tests. RP10 the background derive queue and local `Deriver`. RP11 `get_photo`. RP12 step photos (10 per version, `limit: step_10`). RP13 Free up space (`GET /recipe/photos/usage`, batch remove with one undo). Kitchie: the add route with in-browser shrinking, the phased loader, frames, the "being prepared" checks, the free-space route, the viewer, the note route; nothing stored.

### Open questions

- N1: closed by T4 (above).
- Cook photo as a banner: closed by T5 (explicit choice only; exactly one banner per version).
- Free disk on the server's data folder (P-D3). The 2 GB household cap is the guard.
- An off-server backup copy: infra's call, for all apps.
- A photo for "tonight" when no cook was recorded: the mockup adds a cook with no pantry change.
- Can every assistant the household uses send a file over HTTP? If not, the Kitchie-link fallback.
- Are Recipe and Kitchie always served from one site? P-D15's cookie check depends on it.
- ~~Replacing a cover: keep the old one?~~ Closed: Replace removes the old one with the 5-minute undo.

### For the implementation

- Default path: the list sends ids, colours and states; tiles start as the stock picture; squares load by phase. The recipe page paints its text first, then step photos, then the banner. Add, Note, Saved and Free up space are their own routes. Nothing in this slice runs on Home or delays it.
- Classes to lift beside the flow slice's: `.pf` (with `.stock`, `.prep`), `.pprep`, `.pinh`, `.psp`, `.hero2.one`, `.pundo`, `.qbar`, `.vrow`, `.vpics`, `.pv`, `.aim`, `.addc`, the note classes; and `PHO.phase`, `PHO.watch`, `PHO.afterPaint` (the phased loader, about 40 lines). `tools/shots-photos.mjs` captures every photo screen at three scroll points.

---

## Reconciliation (10 October 2026)

Done by a reconciliation agent after the four slices landed. Full detail, with build defaults, in [recipe-tab-handoff.md](recipe-tab-handoff.md). Only the recipe slices' own files were changed; where a conflict touches another feature's decision, it is recorded there as a cross-feature question (X1 to X14) and the other feature's notes are untouched.

- **Superseded:** R-D16 (by V-D10, V-D11).
- **Reworded:** R-D11, R-D15, R-D17, R-D19, R-D20, R-D25, R-D26, I-D13 (by V-D, P-D decisions as marked above). The flow mockup's screens now say "our usual" and "Fix this one or keep both".
- **Field names aligned:** `record_cook.photo_ref` is now `photo_ids` (up to 3, P-D13); versions gain `cover_photo_id` (P-D4) in the backend spec; the spec gains a family put-away call for R-D25.
- **Answered gaps:** G2 (V-D28, P-D13), G3 (V-D22), G4 (V-D5), G5 (V-D20), G7 (P-D1 to P-D18), G10 and G12 (schema v6 reads the usual's head and returns state), G13 (no change). Still open at the time: G1, G6, G8, G9, G11 (stars per member, X5), K1 to K3 (since then G8 was dropped by L4, G1 and X5 answered by the second lot), and the new Kitchie gaps K4 (plan entry carries a version id) and K5 (one cook writes both apps).
- **Open, owner's call, not decided:** the tab bar (option 6, R-D2).
- **Numbering clash to watch:** the ideas slice's K1 to K3 are gaps, not the preferences handoff's Kitchie slices K0 to K17; photo options P1 to P13 are not preferences principles P1 to P6. The handoff names its own build slices RT-R and RT-K.

## Owner's locked decisions applied (10 October 2026, evening)

Applied by the docs agent after the owner's voice session (L1 to L9, recorded at the top as R-O1 to R-O5 and R-D29 to R-D32). Only this feature's notes were changed; the Plan features' notes are untouched and get cross-feature requests instead (handoff section 11).

- **Settled:** R-D7 (R-O2 A), R-D20 (R-O3 B varied), options 1 to 5.
- **Void:** R-D8 and option 5 (R-O5); P-D24, P-D12's later part, P5 C and RP7 (R-O4); gap G8 (R-O4).
- **Narrowed:** R-D4, R-D13, R-D14, R-D15, R-D21 (R-O4); R-D18 (R-D30); R-D25 (R-D31); V-D8 (R-O3); V-D10 (R-O4); V-D19, V-D23, P-D17 (R-O5, equal roles); I-D14 (R-O5).
- **Closed open questions:** who reads photos or links (nobody); can followers change recipes (no followers); does Put away need admin agreement (no).
- **Still open after the first lot:** the tab bar items (R-O6; the voice session's "locked as A" was an assistant's error), V2, the editing screen, the cooking-ideas pane, P1 to P13, V1 and V3 to V6, I-O4, R-V1, X16. (V1 to V6, P1 to P13 and R-V1 were locked by the second lot: see below.)
- **The flow mockup screens** (`recipe/list.html`, `detail.html`, `add.html`, `review.html`, `edit.html`, `cook.html`) and the versions and photos screens are being redrawn by their own agents in parallel; these notes record the decisions, the screens show them.
- **Nothing has been built, and nothing has been filed.**

## Owner's second lot applied (10 to 11 October 2026)

Applied by the docs agent after the three slice agents redrew their pages (versions `recipe-versions/` and `spec.html`; photos `recipe-photos/`; flow `recipe/`). Only this feature's notes were changed; other features' notes are untouched.

- **Locked:** V1 A, V2 C, V3 A, V4 B, V5 A, V6 B; open-item answers 1 to 6 (BR17, V-D31, V-D32 with BR3 and BR18, BR10, V-D33 with BR19, R-V1 approved); P1 to P13 (P-D1, P-D2, P-D6, P-D7, P-D8, P-D9, P-D10, P-D12, P-D15, P-D17, P-D18, P-D20, P-D21).
- **Superseded or void:** the suggestion model (`propose_change`, `list_suggestions`, `resolve_suggestion`, the `suggestions` table, `assistant_trusted`) by V4 B's review after; `revise_version` and `create_version` by `patch_version`; the whole-recipe revision (V6 A); the 30-day photo restore and "Delete it for good now" (P10 B); `photos/<household>/<id>-<size>.webp` with three sizes (P2 port, P3 varied); 350 KB per photo (P-D3 now about 260 KB for a banner, 87 KB otherwise); P-D12 as a link the person taps (P5 refined); the newest-cooked-photo cover fallback (P7 B); notes on the family only (V-D31).
- **Refined:** R-D24 by V-D31; R-D9 by P7 and P12; R-D12 and R-D15 by BR10; R-D19 by BR17 and V-D33; I-D6's favourite and G11 by V-D33.
- **Answered:** X5 for Recipe's side (both, derived); gap G1 (V-D31); the stars, notes, delete and draft questions; R-V1.
- **Still open (as of 11 Oct 2026, after the third lot T1 to T9):** the editing screen (assistant hand-off, deferred); XR1 to XR3 (Plan owners) and XR4 (preferences chat); infra free disk and off-server backup; the ideas pane as a whole is not reviewed (its place, T8, and I-O4 are settled); small defaults NA/NB/NC. Closed by the third lot: R-O6, X16, N1, the cook-photo banner, the favourite rule, the note limit.
- **Nothing has been built, and nothing has been filed.**

## Owner's third lot applied (11 October 2026)

Recorded by the docs agent from the owner's voice decisions: T1 to T9 (see "Third lot" above). Files updated: `recipe/index.html` (ledger), `recipe-versions/spec.html` (10.6 rewritten to one 4,000-character cap; 2.1, 9.5 and the open list), `recipe-photos/index.html` (N1 closed, P-D10, P-D27), this file and `recipe-tab-handoff.md`. Nothing has been built, and nothing has been filed.


---

## Owner's fourth lot applied (11 October 2026)

Recorded by the mockup agent from the owner's voice decision T10 (see "Fourth lot" above). Files: `recipe/edit.html` (replaced: the hand-off to the assistant became the edit screen), `recipe/edit.css`, `edit.js`, `edit-photo.css`, `edit-photo.js`, `edit-desktop.css`, `edit-desktop.js`, `recipe/edit-options.html` (the options), `recipe/index.html` (ledger, T10), `recipe/detail.html` (pencils, E and comma), `recipe-versions/` (History marks "by hand"; Change hands off to either way), `tools/shots-edit.mjs`, this file and `recipe-tab-handoff.md`. Nothing has been built, and nothing has been filed.
