# Recipe detail page, desktop: recon notes

Recon only, for a desktop redesign of Kitchie's full recipe page. No layout proposals, no mockup, no issue touched. Written 17 October 2026 from Kitchie `uat` (tip `e486c50a`, 0.131.1), mockup `main` (`59127ef`), governance `main` (`7a8d999`). Owner's goal (Arjan): options for the detailed recipe page on a big desktop screen, without scrolling where possible.

Paths are relative to `kitchie/server/src/` unless they start with `mockup:` (the mockup repo root), `kitchie:` (repo root) or `gov:`. Line numbers are `uat` at the tip above.

---

## 1. Anatomy: every element and where it lives

Page renderer: `recipe-tab/page.ts` `renderRecipePage` (page.ts:211-268). Server-drawn, complete without script; `recipes-page.js` adds behaviour. Wrapper `div.rtab#rtab[data-screen=recipe]` carrying all `data-*` the script needs (page.ts:244-251). The whole page is ONE `<form method=get>` (page.ts:252) so the stepper and version strip work with no script.

| # | Element (what the person sees) | Markup / function | Class / hook | Behaviour (script) |
|---|---|---|---|---|
| 1 | App header ("Our kitchen"), left rail | `layoutPage` (`layout.ts`), `nav.bar` | `nav.bar` becomes rail at 64rem (`desktop-layout.ts:88-93`) | not recipe code |
| 2 | Top bar: Back to Recipes | page.ts:253 | `.top a.back > .bl` | plain link to `<base>/recipes`; at 64rem with the browse script, `recipes-browse.js:back()` restores the list in place if the page was opened from it (recipes-browse.js:~112, ~190) |
| 3 | Top-bar title (recipe name, appears after the h1 scrolls under) | page.ts:253 | `.top .ttl`, `.top.named` | IntersectionObserver on `h1` (recipes-page.js:163-169) |
| 4 | "Notes and reactions" pill with thumbs-up / thumbs-down / note counts, key hint N | `proof.ts notesButton` (proof.ts:147-152), drawn by page.ts:254 | `.rb-notesbtn.re-a.rb-d[data-notes]`, `.rb-pillcnt` | hidden below 64rem (`.rtab .rb-d{display:none}`, css.ts:547); at 64rem opens the Notes flyout (see 21). Gives up its N hint and padding when Share is drawn (desktop-css/recipes.ts:97-99) and below 1224px (recipes.ts:148) |
| 5 | Star | page.ts:221-223, 254 | `.ib.bare[data-star]` | the member's OWN "liked" on this version, `PUT /versions/:id/reaction` (recipes-page.js:231-243). Not a favourite flag for the household |
| 6 | Edit pencil (top bar) | page.ts:255 | `a.ib.bare[data-key=e]` -> `editHref()` = `/recipes/edit?id=&v=` | click intercepted: opens the editor as a right-lane panel (64rem+) or stacked sheet (recipes-page.js:222-229, `recipes-edit.js`). Key E |
| 7 | Share button: round icon + count under 64rem, labelled pill "Share" + count + S hint from 64rem | `share.ts shareIcon / sharePill` (share.ts:204-211), `shareButtons()` page.ts:205-209 | `.shr-ic` (phone), `.shr-chip` (desktop; display:none below 64rem, css.ts:553) | not drawn at all when Recipe says the household may not share (`shareStateOf` -> null). Opens share panel (see 22). Key S |
| 8 | More menu (dots) | page.ts:256, sheet body `moreSheet()` page.ts:178-191 | `button[data-more]`, template `#t-more` | bottom sheet at every width. Rows: Edit, Change it with your assistant, Make it our usual (hidden if already), Ask your assistant about it, Where it came from (toast), Put this version away (only if another version is in use), Put away / Put the whole recipe away |
| 9 | State band (Trying / Put away; none for Kept) | page.ts:229-232 | `.band` / `.band.mut` | "Keep it" (`[data-keep]`) and "Bring back" (`[data-back]`) handled by `recipes-versions.js` (script tag only emitted when a band exists, page.ts:267) |
| 10 | "An assistant changed this" review line | page.ts:234-235 | `a.slim` | link to `/recipes/review?r=` |
| 11 | Banner photo (full width, 16:9-ish) | `banner()` page.ts:68-74, `photoFrame` view.ts:127 | `.hero2.one > .hb > .pf[data-phase=banner]` | loaded LAST (recipes-page.js:66-71). No banner means no hero at all (R-D9) |
| 12 | Title h1, "Photo of X until this version has its own" line | page.ts:258 | `h1[data-vt=title]` | view-transition name `rb-title` |
| 13 | Version pills (Our usual, state, To review, version name) | page.ts:236 | `.pills > .st / .tg.mut` | only drawn when >1 version, or state is not Kept, or a review is open |
| 14 | Meta row: time ("20 min") + Serves stepper (minus / "Serves 2" / plus; "N portions" for batch) | page.ts:238, `servesStepper` page.ts:76-82 | `.meta > .mc.ro`, `.serves` with `[data-n]` | scales every `.q[data-a]` in place (recipes-page.js:181-204). Range 1 to 12 (batch: serves to 3x serves, in steps of serves). Not drawn when `serves` is null. Time is `minutes` only (Recipe also sends prep and cook minutes, not shown) |
| 15 | "From <parent> . History" line | page.ts:224-226 | `a[data-key=","]` | History is a full navigation to `/recipes/history?id=&v=` (versions.ts). Key `,` |
| 16 | Proof band: "Not cooked yet" strip, or "Cooked N times / last cooked X" + a dot per cook (max 8, oldest to newest) + a chip per member who answered | `proof.ts proofBand` (proof.ts:155-172) | `.rb-band.rb-d`, `.rb-dots`, `.rb-react` | 64rem+ only (`.rb-d`). Empty strip says "Cook it once and the thumbs and notes start here." |
| 17 | Version strip (horizontal buttons + "All versions") | `versionStrip` page.ts:61-66 | `#vstrip.strip.vstrip`, sticky | only when >1 version; GET form (`v`), full page load per switch; star marks the usual, dot marks "has a change to review" |
| 18 | "Tabs": Ingredients, Method, Notes, Cooked, Photos | page.ts:239-240 | `nav.jumps > a[href=#ing|#met|#not|#his|#pho]` | NOT tabs: anchor jump row, one continuous scroll (R-O2 A). Sticky under the top bar (`top:var(--rtop)`=61px, +48px if version strip). Scroll-spy toggles `.on` and `.docked` (recipes-page.js:146-179); click smooth-scrolls |
| 19 | INGREDIENTS section | `ingredients()` page.ts:89-109 | `section#ing`, `.ing`, `.nm`, `.q`, `.dot`, `.vh` | head text is "Ingredients" / "Ingredients . N of M in" / "Ingredients . all in" (pantry-aware). Each row: pantry dot (in / missing outline / held filled; none if stock unknown), name + ", prep" + "(optional)", cart button only on a missing row (`[data-cart]`), right-aligned quantity (tabular figures, `amount?` chip if unknown). Section pencil `a.mini.ico` -> `editHref("ing")`. Hold button (`[data-holdall]`) only when this recipe is on this week's plan. "Add all N missing to shopping" (`[data-cartall]`) only when >1 missing. Hint "Talk to your assistant about substitutes" when any missing. NO ingredient groups drawn (see 3) |
| 20 | METHOD section | `method()` page.ts:111-125 | `section#met`, `.stp > .nb`, `.timer`, `button.psp` | numbered step, text, optional "N min" timer, optional step photo strip (150px tall, object-position from `focus_y`); click expands to the whole photo in place, click or Esc returns (recipes-page.js:73-125). Section pencil -> `editHref("met")`. Steps carry no ingredient links here (per-step ingredients are cook mode only) |
| 21 | NOTES section | `notes()` page.ts:128-147 | `section#not`, `.note`, `.note.inh`, `.from` | cards grouped by (writtenOn, by, at, reworded); inherited card says "from the parent version / from <name>", reworded says "changed in this version". "No notes yet." + "Add a note" (`[data-note]`) -> bottom sheet `#t-note` (4,000 char cap, scope: this version or every version, `PUT /versions/:id/notes`, then page reload). Pencil -> `editHref("not")` |
| 22 | COOKED section | `cooked()` page.ts:151-163 | `section#his`, `.hist` | "Liked by N of M . a household favourite" line; list of cooks (date block, "<who> cooked <version>", quoted remark, verdict word Kept it / Needed work / Not for us, "N ate"); "Not cooked yet." / "The list of cooks isn't available right now." No pencil |
| 23 | PHOTOS section | `photos()` page.ts:172-176 | `section#pho`, `button.pmore`, `#pgrid`, `template#t-photos` | "Show N photos (loads on tap)" -> 3-column grid of gallery + cook photos, fetched on demand; "No other photos yet." No pencil |
| 24 | "Where it came from" line | page.ts:242 | `p.src` | static; also reachable from More |
| 25 | Fixed bottom bar: Plan it (or "Planned Tue") + Cook it | page.ts:243 | `.act` sticky at `bottom:var(--barh)` (css.ts:586); `button[data-plan]`, `a.btn` -> `cookHref` | Plan it: opens the day-picker bottom sheet (`recipes-plan-sheet.js`, fetched on first tap); if already planned it only toasts "On the plan for Tue. Change it in Plan." Cook it: plain link to `/recipes/cook?id=&v=&n=` (navigates away to cook mode). The stepper rewrites the `n=` in this href |
| 26 | Notes and reactions flyout (right lane) | `flyout.ts renderNotesFlyout` (flyout.ts:86-92), template `#t-notes-fly` (page.ts:263) | `aside.rfly.rfly-notes` built by `recipes-browse.js openNotes()` | 400px lane; thumbs per member (private "not for me" shown by name only for the caller), every note (cook remarks newest first, then version notes), footer "Add a note" which clicks the page's `[data-note]`. Registered as panel "recipe-notes" |
| 27 | Share panel (right lane / phone sheet) | `assets/recipes-share*.js/.css`, fetched on first Share press | `aside.rfly.rfly-share` | one parent flyout at a time; nothing about sharing loads with the page (recipes.js:191) |
| 28 | Edit panel (right lane / phone sheet) | `edit.ts`, `assets/recipes-edit*.js`, `desktop-css/recipe-edit.ts` | panel "recipe-edit", `.redit` | fetched on first pencil / E. Same markup as the `/recipes/edit` page; sections det, ing, met, not, pho |
| 29 | Toasts, sheets, scrim | css.ts:561-566 | `.toast`, `.sheet`, `.scrim` | `position:fixed`, clamped to `--content-max`. NOTE `.sheet` is `max-width:var(--content-max)` centred, so on desktop the Plan it / Note / More sheets are the 736px column-wide, not lane-wide |
| 30 | Noscript line | page.ts:262 | `<noscript>` | "Planning, the shopping list, notes and Put away need script" |

### Code map by file

| File | Role |
|---|---|
| `recipe-tab/page.ts` | the page (all sections, sheets as `<template>`s) |
| `recipe-tab/proof.ts` | social-proof pieces (band, notes button, thumbs, notes list); `rb-` classes |
| `recipe-tab/flyout.ts` | browse-flyout body (list-side summary) and the page's notes flyout |
| `recipe-tab/share.ts` | Share button markup (icon + pill) |
| `recipe-tab/view.ts` | `ic()`, `photoFrame()`, state pills |
| `recipe-tab/css.ts` | `/assets/recipes.css`, the whole mockup stylesheet prefixed `.rtab`, plus "Differences from the mockup" block at css.ts:541+ |
| `desktop-css/recipes.ts` | desktop-only rules (64rem), `.rfly` lanes, proof band, notes button, Share pill |
| `desktop-layout.ts` | rail / column / panel tokens, assembles `/assets/desktop.css` |
| `assets/recipes.js` | shared Recipes loader: `KitchieRecipes` (toast, sheet, once, sibling), photo loader, decides whether to fetch desktop files (recipes.js:217-229) |
| `assets/recipes-page.js` | page behaviour (photos order, jump-row spy, stepper, star, sheets, note save, Plan it, Hold, cart) |
| `assets/recipes-desktop.js` | 64rem+ keys: S, E, comma, / , J, K |
| `assets/recipes-browse.js` | 64rem+ list-to-page swap, Back, notes flyout, keys N, O, Alt+Left |
| `assets/recipes-versions.js` | Keep it / Bring back on the state band |
| `assets/recipes-edit*.js`, `recipes-share*.js`, `recipes-plan-sheet.js` | on-demand panels |
| `recipe-tab/routes.ts` | `GET /recipes/recipe` handler (routes.ts:~275-290), `cookPath`, `editPath`, `plannedEntry` |
| `recipe-tab/fake.ts` | the fixture household (7 recipes) used by tests and screenshots |

### Viewport-specific split today (standing rule: own file)

- The recipe page has NO desktop-specific layout file. Phone, tablet and desktop render the same single column (`.rtab` + `body:has(.rtab)` token reset, css.ts:543). Desktop adds only: proof band, Notes button, Share pill, lanes (desktop-css/recipes.ts) and three script files fetched at 64rem+ (recipes-desktop.js, recipes-browse.js, plus on-demand panels).
- A redesigned desktop page therefore needs its own markup path or its own stylesheet and script. A rule that lands in `css.ts`/`recipes.css` is downloaded by phones (AGENTS.md:188). The only precedent for desktop-only rules is `desktop-css/recipes.ts` (inside the single `@media (min-width:64rem)` block assembled by `desktop-layout.ts`).
- The server draws one HTML for all widths (no viewport hint on the server, AGENTS.md:188), so elements the desktop layout does not want must be hidden by CSS (as `.rb-d` / `.shr-chip` / `.shr-ic` already are) or the desktop must restructure the same DOM with CSS grid.

---

## 2. Entry points and what is passed

Route: `GET <base>/recipes/recipe?id=<familyId>[&v=<versionId>][&n=<servings 1-99>]` (routes.ts handler; `id`/`v` must match `^[A-Za-z0-9_-]{1,64}$`; bad id falls through to a hosted-fragment fallback then 404; Recipe unavailable gives a calm 503 page). The page takes NO return/back parameter. `v` empty means the family's usual version. `n` only comes from the stepper form and Cook it link.

| Entry | Source | Link target | Notes |
|---|---|---|---|
| Recipes list row (phone / tablet) | `recipe-tab/list.ts:101` (`rowHref`, routes.ts) | `/recipes/recipe?id=` | plain link, full page load |
| Recipes list row (desktop) | `assets/recipes-flyout.js` | opens a summary flyout first (`GET /recipes/flyout?id=&cd=`); "Open full recipe" / key O | `recipes-browse.js openFull()` fetches the page, swaps `#rtab` in place, `history.pushState`, View Transition (150 ms) or 75+75 ms fade, instant under reduced motion; any failure is the plain link. Stashes the list (scroll, selected row, flyout words) so Back restores it with no refetch. The notes flyout can open straight away (`data-notes-open`, "See all N notes") |
| Home cooking ideas card (lead and alternates) | `recipe-tab/ideas-card.ts:91,100,106` (`data-open="recipe:<id>"`) via `home-ideas.ts:101` | `/recipes/recipe?id=` | plain link from the card. Home's own desktop detail panel has a recipe view (`home-panel.ts:153,334`: "Open full recipe", `data-act="openrecipe"`) |
| Home universal search result (desktop) | `assets/desktop-home.js` -> `KitchieRecipeFlyout.open` | summary flyout, then "Open full recipe" | the flyout's Plan button carries its own data (flyout.ts:14) |
| Home "This week" day flyout / Home detail panel for a planned meal | `home-panel.ts:307,334` | "Open full recipe" link | only when the entry is a Recipe family |
| Plan meal sheet "View recipe" (phone) and Plan desktop lane "Open recipe" (`ACT.viewrec`) | `assets/plan-sheet.js:42-71`, `assets/plan.desktop.js:1138,1155,1218` (`data-recipe` template with `__ID__` = `recipe_id`) | `location.href = /recipes/recipe?id=<recipe_id>` | full navigation; no `v`, no `n`. Shown only for sources `recipe` / `recipe_modified`; the Recipes screen must exist |
| Cooking-now banner / Cooking screen secondary action | `app.ts:1785` (`recipeHref`) | `/recipes/recipe?id=` | |
| Cook mode exit and end-of-cook pages | `recipe-tab/web-cook.ts:169,325...` (`exit`, `sameSite()`) | back to recipe page, or `/plan` when `from=plan` | cook mode is a separate, phone-framed page (`cook-html.ts`, `.phone#ph`) |
| Versions / History / Review pages | `recipe-tab/versions.ts:52` `recipeHref(s, fam, ver)` | `/recipes/recipe?id=&v=` | each has its own back link |
| Edit page "back" | `recipe-tab/edit.ts:112` | `/recipes/recipe?id=&v=` | |
| Version strip, "From <parent>" | page.ts:64, 226 | `/recipes/recipe?id=&v=` | strip is a GET form; `n` is kept as a hidden field |
| Share panel "open" | `assets/recipe-share.js:113` (older Recipe-hosted screen), and the Share panel builds `/recipe?id=` for the public side only | | recipient pages are separate: `/r/<link>` (`recipe-tab/share.ts:163`), not this page |

Back behaviour summary: the top-bar Back is always `<base>/recipes` (page.ts:253); only the desktop list-to-page path (recipes-browse.js) gives a true in-place Back, and only when the page was entered through it. Alt+Left does the same there. Arriving from Home, Plan, Cooking, Versions etc. leaves Back as a plain link to the Recipes list (it does NOT return to the origin). `popstate` handling is in recipes-browse.js:139-147.

---

## 3. States and data shapes the mockups must cover

### 3.1 Data shape (what the page can know)

`RecipeDetail` (`recipe-tab/types.ts:141-171`), rendered by one version at a time:

- family: `familyId`, `recipeId`, `name`, `putAway` (family flag; NOT read by the page, only `version.state` is), `versions[]`, `version`
- `minutes` (total only), `serves`, `batch`, `tags[]` (not rendered on the page)
- `ingredients[]`: `{id, name, amount|null, unit, perServing, prep, optional}`; `steps[]`: `{id, text, minutes|null}`
- `notes[]`: blocks `{type p|h3|li|oli|quote|img, indent, markdown, writtenOn, rewordedHere, hidden, by, at}`, `notesRevisionId`
- `reaction`: `{mine liked|no|null, likedBy, of, favourite, likedIds[], notKeen}`; "not for me" is a COUNT only (V-D33, private)
- `photos`: `{banner|null, steps: Map<stepId, PhotoRef>, gallery[], cooked[]}` or null (no photo service); `PhotoRef` `{id, colour #rrggbb, prep, inheritedFrom, focus 0..1|null}`
- `cooks[] | null`: `{versionName, by, day, mon, daysAgo, line, verdict keep|work|no|null, ate}`, newest first, read at most 40 ("40+")
- `source` (one line), `openChanges`, `revisionId/N`
- `Pantry`: `{known:false}` (stock unreadable: no dots, no counts, never "everything missing") or `{known:true, has: Map<id|lower name, boolean>}`
- `ShareState`: `null` (button absent) | `{count: number|null}` (null = no number)
- `planned`: `{id, weekday, held}` or null

### 3.2 GAP to surface: ingredient groups and step groups are not on the page

Recipe's wire DOES carry `group` on ingredients and steps (`recipe-tab/recipe-client.ts:30,32,287,290`), and live UAT data uses it: family `fam_c7680357-abc2-4d43-9fc4-6cbd131fd7e6` (Berry Pavlova, prep 25 + cook 90 + total 175 min) groups its ingredients "Meringue" (5) and "Topping" (6), read via `get_version` on 17 October 2026. But `IngredientLine` and `StepLine` (types.ts:58-69) drop `group`, the mapper at `recipe-tab/client.ts:217` does not copy it, and nothing renders it (grep `group` in `recipe-tab/*.ts` finds only recipe-client.ts). Also dropped: `prep_minutes` / `cook_minutes` / `yield_note`, `metadata` (cuisine, dietary, equipment, flavour_profile), `source.description` beyond the one line. Any desktop design that shows groups, prep vs cook time, equipment or dietary chips needs a data change first (types.ts + client.ts + fake.ts + the edit panel, which also ignores groups). The long-recipe sample below includes groups so the mockup can show them, marked as "needs the wire to be carried through".

### 3.3 States matrix (each must be reachable in the mockup)

| State | Driver | What changes on the page today |
|---|---|---|
| Recipe with one version | `versions.length === 1` | no strip, no version pills (if Kept) |
| Several versions | `versions.length > 1` | strip above jump row (sticky), version pills, notes can be inherited |
| Version state Kept / Trying / Put away / Suggested | `version.state` | Trying: band "Trying since .. . cooked N x" + Keep it; Put away: muted band + Bring back; Kept: nothing. The Share pill excludes put away and suggested versions |
| Usual vs not | `version.isUsual` | "Our usual" pill; "Make it our usual" row in More only if not usual |
| Open assistant review | `version.review` | red-bordered slim line, "To review" pill, dot on the strip button |
| No banner / banner own / banner inherited / banner "being prepared" | `photos.banner`, `prep`, `inheritedFrom` | hero absent / 16:9 hero / small branch badge + "Photo of X until this version has its own" / "Photo is being prepared" line, rechecked at 30 s, 1 min, 2 min |
| No photos service at all | `photos === null` | no hero, no step photos, "No other photos yet." |
| Step with / without photo; step photo inherited; step photo preparing | `photos.steps.get(stepId)` | strip, strip with badge, non-button frame with the preparing line |
| Few vs many ingredients | `ingredients.length` | page just gets taller; qty column is fixed width |
| Ingredient with unknown amount, optional, prep note, per-serving amount | line fields | "amount?" dashed chip; "(optional)"; ", chopped"; scales by n not n/serves |
| Stock known / unknown | `pantry.known` | dots + "N of M in" + hint + cart buttons vs none of them |
| All in / 1 missing / many missing | pantry | "all in"; one cart button; plus "Add all N missing" when >1 |
| Planned this week / not | `planned` | Hold button in the Ingredients header; bar says "Planned Tue" instead of "Plan it" |
| Held | `planned.held` | dots filled, "Held for Tue" |
| Serves null | | no stepper |
| Batch recipe | `batch` | "N portions", steps of `serves`, range serves to 3x |
| Stepper value | `n` | quantities scale in place; Cook it href carries `n` |
| Not cooked yet / cooked N times / cook log unavailable / 40+ | `cooks` | proof band head text; Cooked section text; only 8 dots shown |
| Reactions: none / liked by some / mine liked / mine "no" / others "not for me" / quiet members | `reaction` | chips in band; "Liked by X of Y . a household favourite" |
| No notes / 1 note / many notes / inherited / reworded / image block | `notes` | "No notes yet." + Add a note; cards; branch-icon provenance |
| Cook remarks | `cooks[].line` | appear only in the Notes FLYOUT (proof.ts `noteItems`), not in the page's Notes section |
| Gallery / cook photos present or not | `gallery`, `cooked` | "Show N photos" on-demand vs "No other photos yet." |
| Share: absent / count 0 / count N / count unknown | `share` | no button / pill without badge / badge / pill without badge |
| Recipe unavailable | Recipe down | 503 page (`unavailable()`), not this page |
| Not found | | falls through (hosted fragment, then 404) |
| Read-only vs editable | | there is NO read-only mode of this page: every household member sees every control (edit, put away, note, star). The public recipient page is a different surface (`/r/<link>`, `recipe-share` fragment). A Plan entry owned by someone else only matters for Hold (`plannedEntry` filters to `!read_only && editable`) |
| Sheets open (More, Note, Plan it) | taps | bottom sheets, fixed, 736px max; Esc closes; keys S/E/comma are ignored while a `.sheet` is open (`modalOpen`, recipes-desktop.js:17) |
| Flyouts open (Notes, Share, Edit) | N, S, E | one parent flyout at a time; Ctrl/Cmd+Esc or Ctrl/Cmd+Enter closes |
| Dark / light | theme cookie | tokens only |
| Reduced motion | media query | transitions off |
| No script | | page complete; stepper/strip/jumps work; Plan, Hold, note, star, put away, cart do not |

### 3.4 Realistic sample data to reuse

Shapes follow `types.ts`. Names/quantities are invented (household names match `recipe-tab/fake.ts`: Sam, Jane, Alex, Priya; "You" is the caller). Dates are 2026.

**A. Short recipe: 2 ingredients, 2 steps, with photos** ("Barramundi with Capers" is the live UAT example, `fam_34824ea9-5ead-4ff0-8e73-e9daa010b41d`: 20 min, serves 2, kept, no banner; ingredients "fish, barramundi", "capers"; use it for the no-photo variant). With photos:

- Name "Garlic toast eggs", 10 min, serves 2, one version "Original" (Kept, usual), banner colour `#c8a86b` (1600x900), pantry known, all in.
- Ingredients: Eggs 4; Sourdough 4 slices ("slices" unit); (the 2-ingredient case: keep exactly these two, salt not listed)
- Steps: (1) "Toast the bread and rub it with a cut garlic clove." 3 min, step photo colour `#bfa98c` 960x540. (2) "Fry the eggs in butter until the whites are set; lay on the toast." 4 min, step photo `#d8c8c8`, `focus_y` 0.4.
- Notes: none. Cooks: `[]` (Not cooked yet). Reaction `{mine:null, likedBy:0, of:0, ...}`. Share count null.

**B. Typical: 10 ingredients, 6 steps** (Egg fried rice, from the fixture, extended; single version for this sample, or 3 versions for the strip):

- "Egg fried rice", 20 min, serves 2. Versions: Original (kept), With peas (kept, usual, open review with 2 changes), Less soy, more garlic (trying). Banner `#ba976b`.
- Ingredients: Eggs 3; Basmati rice, cooked and cooled 300 g; Onion 1; Spring onions 2; Soy sauce 2 tbsp; Oil 1 tbsp; Frozen peas 80 g; Garlic cloves 2; Sesame oil 1 tsp (optional); Chilli flakes `amount?` (unknown). Pantry: all in except Spring onions (missing) and Sesame oil (missing) to show the cart column.
- Steps (min): 1 Beat the eggs with a pinch of salt. 2 Chop the onion and fry it in the oil until soft. (3) 3 Push the onion aside, pour in the eggs and stir until just set. (1) 4 Tip in the cold rice and break up any lumps. Keep the heat high. (4) 5 Splash in the soy sauce and add the peas. (2) 6 Toss through the spring onions and serve. Photos on steps 1, 2 and 4 only (3 has one being prepared).
- Cooks (see D). Notes: see C. Planned this week "Tue", not held.

**C. Recipe with 5 notes** (versions notes as `NoteBlock`s, grouped into cards by writtenOn/by/at). On "With peas":

1. writtenOn Original, by Sam, 12 Sep: "Day-old rice really is better. Fresh rice goes mushy."
2. writtenOn With peas, by Jane, 20 Sep: "Kids like it with **frozen peas** thrown in at step 5."
3. writtenOn With peas, by Alex, 28 Sep (reworded here): "Peas straight from frozen is fine, no need to thaw."
4. writtenOn Original, by Priya, 2 Oct, two blocks (one card, a list): "Things that go well on the side:" then list items "Cucumber in rice vinegar", "A soft-boiled egg on top", "Kimchi".
5. writtenOn With peas, by You, 14 Oct: "Doubled for 4 people in the big pan and had to fry the rice in two batches. Do not crowd the pan."
Also 3 cook remarks (Notes flyout only): "used leftover rice" (Jane, 9 Oct), "Alex ate two portions" (Sam, 28 Sep), "too salty first time, halved the soy" (You, 20 Sep). Inherited cards (1, 4) carry the "from the parent version" line.

**D. Cooked history, with and without**

- With (newest first; from `fake.ts` plus more): `9 Oct, Jane, With peas, "used leftover rice", ate 3`; `28 Sep, Sam, Less soy, more garlic, verdict keep, ate 3`; `20 Sep, You, Original, "too salty first time", verdict work, ate 2`; `Earlier` (copied from the old world, day/mon empty): `Sam, Original`. daysAgo 2 / 15 / 27 / null. Reaction: likedBy 2 of 3, favourite true, likedIds [jane, sam], notKeen 1, mine liked. Proof band: "Cooked 4 times, last cooked 2 days ago", 3 dated dots, chips Jane/Sam/You up, "1 other" down.
- Without: `cooks: []`, reaction all zero: band "Not cooked yet". Also the unavailable state: `cooks: null`.
- Heavy: 40 cooks ("40+", still 8 dots).

**E. Long recipe: 24 ingredients in 3 groups, 14 steps** ("Slow lamb shoulder with white beans and salsa verde", 4 h 30, serves 8, one version Kept, banner `#8a6a4a`; groups need the wire change in 3.2):

- Group "Lamb": Lamb shoulder, bone in 2.2 kg; Garlic cloves 8; Rosemary sprigs 4; Anchovy fillets 6 (optional); Olive oil 3 tbsp; Salt 2 tsp; Black pepper 1 tsp; White wine 250 ml.
- Group "Beans": Cannellini beans 3 tins; Onion 2 (finely sliced); Celery sticks 2; Carrot 2; Tomato paste 2 tbsp; Chicken stock 500 ml; Bay leaves 2; Lemon, zest of 1; Chilli flakes `amount?`.
- Group "Salsa verde": Flat-leaf parsley 1 large bunch; Mint leaves 20 g; Capers 2 tbsp; Garlic cloves 1; Red wine vinegar 2 tbsp; Olive oil 120 ml; Sea salt 1 pinch.
(8 + 9 + 7 = 24. Pantry: 5 missing, shown as `Add all 5 missing`.)
- Steps (group in brackets, minutes in brackets): 1 [Lamb] Heat the oven to 160C. (5) 2 [Lamb] Pound the garlic, rosemary and anchovies to a rough paste with the oil. 3 [Lamb] Score the lamb and rub the paste in; season well. 4 [Lamb] Brown the lamb on all sides in a heavy pot. (15) 5 [Lamb] Deglaze with the wine and let it bubble down by half. (5) 6 [Lamb] Cover tightly and roast. (180) 7 [Beans] Meanwhile soften onion, celery and carrot in a pan. (12) 8 [Beans] Add paste, stock, bay and beans; simmer. (20) 9 [Beans] Lift the lamb out, rest it under foil. (20) 10 [Beans] Tip the beans into the pot and return to the oven, lid off. (30) 11 [Salsa verde] Chop herbs, capers and garlic together. (8) 12 [Salsa verde] Stir in vinegar and oil; season with the salt. 13 Pull the lamb into large pieces over the beans. (5) 14 Spoon salsa verde over and serve with lemon wedges. Step photos on steps 4, 9 and 13 only; step 6 has a 180 min timer, to test long timers.
- Notes: 2 (one inherited). Cooked: 2 cooks. Share count 1.

**F. Other combos worth a state each:** a put-away version; a Trying version with band; recipe with no banner and no step photos (Beef ragu, `fake.ts`); a batch recipe (Chickpea and spinach curry, serves 8, "8 portions", `fake.ts`); a very long name (the live "Homestyle Paprika Beef & Veggie Stew with Mash Potato & Red Wine Jus" and "Tex-Mex Chicken Fajita & Charred Veg Feast with Zingy Tomatoes & Sour Cream" are real titles of 70+ characters); stock unknown; a 4:3 or portrait step photo (shape-capped at 80% viewport height when expanded).

---

## 4. Constraints from DESIGN.md, principles and earlier decisions

Citations are file:line at the tips above.

**Mockup repo**
- Mockups straight to `main`, no PR, rebase before pushing: `mockup:AGENTS.md:13-15`. Say in the notes what the default path loads and what is deferred: `mockup:AGENTS.md:9-11`, `mockup:DESIGN.md:67`.
- Mockup and build stay close: same markup, class names, data attributes, tokens; CSS and JS liftable: `mockup:AGENTS.md:17-19`; Kitchie side `kitchie:AGENTS.md:168`. Settled mockup is matched exactly; a change is shown in the mockup first: `kitchie:AGENTS.md:169`.
- Options, not a take-it-or-leave-it; open questions written on the fragment: `mockup:DESIGN.md:43-48`. PR text is the working spec, proposals marked **Proposal**: `mockup:AGENTS.md:21-28`.
- Start from the job to be done; a job does not have to show everything we know; what a job does not need is left out, not made quieter: `mockup:DESIGN.md:5-23`.
- One token set, themes only change values; check one dark and one light theme: `mockup:DESIGN.md:25-31`. Playful, icon first, 44px targets, labels on icon-only buttons: `mockup:DESIGN.md:33-37`.
- Performance: load on engagement, product / entitlement / interaction-timing layers: `mockup:DESIGN.md:50-69`. Kitchie restates it: `kitchie:AGENTS.md:155-166` (server-rendered first and complete without script; nothing extra on load; small deferred versioned files; one shared stylesheet; do not add a script to a page that does not use it; never remove a lazy-load to make a change easier).
- In place, not a refresh (owner 13 Oct 2026): a panel/flyout/list is filled or swapped in place, full navigation is the fallback: `mockup:DESIGN.md:71-78`. The existing implementation of this for recipes is `recipes-browse.js` (list to page swap).
- Form factors: phone <600, tablet 600-1024, desktop >1024; CSS width only, no pointer/UA detection; desktop = rail + off-centre column + side panel; one shared token system; per-form-factor JS only as an explicit exception: `mockup:DESIGN.md:80-93`; widths `rail 88, column 640 + 48 gutters = 736, panel 400, flyout 320`: `mockup:DESIGN.md:104`, `kitchie:AGENTS.md:181`. Tablet is not drawn for the rail layout: `kitchie:AGENTS.md:182`. "Do not add other desktop widths" `kitchie:AGENTS.md:181`; a screen needing its own layout per bucket records the exception in `docs/project-plan.md` and asks the owner: `kitchie:AGENTS.md:187`.
- Anything viewport-specific lives in its own file, never folded into a shared file (owner 10 Oct 2026): `kitchie:AGENTS.md:188`. A viewport rule in a shared file is a defect in review.
- Verify at 360, 390, 768, 1280 (light and dark); desktop work also at 1023, 1024, 1440, 1920, 2560: `kitchie:AGENTS.md:190`; `mockup:DESIGN.md:93`. Visual check with screenshots at several scroll points before reporting: `kitchie:AGENTS.md:213-220`.
- Empty is absent: a section with nothing to show is not drawn unless it carries a next action; same rule on every width: `kitchie:docs/design-principles.md:5-31`. Relevance to this page: Notes ("No notes yet." keeps its Add a note action), Cooked ("Not cooked yet." / "No other photos yet." are sentences with no action; the proof band's "Not cooked yet" strip has a next step in its words), Photos. The Recipes screens were audited as exceptions (`design-principles.md:30`).
- Lazy by section: the server draws every row, what waits is what a row costs beyond markup (photo, script, extra data); IntersectionObserver for "near the screen": `kitchie:docs/design-principles.md:33-39`. Photo order on this page is already an owner decision (P-D20): text first, then step photos (within two screens), banner LAST, anything lower as it scrolls near, gallery and cook photos only on tap: `kitchie:docs/project-plan.md:641`; `recipes-page.js:66-71`.
- Screen real estate is precious, new controls must earn their place (owner preference, memory) and key hints use the shared `.kbd` class and can be switched off: `mockup:docs/handover/desktop.md:14`.
- Desktop interaction rules: close = Ctrl/Cmd+Enter (alias Ctrl/Cmd+Esc), plain Esc closes nothing except page-level things like a step photo; one parent flyout at a time; a child never closes its parent; M focuses the first item of the main column; `?` / Shift+? is the global shortcuts list; lanes anchored left, panel starts where the column ends (one 48px gutter), free space goes to the right of the panel; below ~1224px the column gives up width; History/Sort column overlays below 1240px: `mockup:docs/knowledge/desktop-layout.md:11-22,71-77`; `mockup:docs/handover/desktop.md:13,22-23`. "Fetch only when asked", nothing refreshes by itself: `desktop.md:12`.
- One control, one treatment (round outline x close 44px; same `kbd`; same pills): `mockup:docs/handover/desktop.md:109-115`.
- Chat tools and UI call the same service methods (standing check, memory).

**Earlier recipe decisions (owner)**
- R-O2 A: recipe page is one continuous scroll with the section jump row docked (not real tabs); R-O3 B: versions strip only when >1 version, own row above the jump row, both dock: `kitchie:docs/project-plan.md:641`, memory recipe-tab (10 Oct).
- Social proof leads on the browse flyout; Cook now and Plan are the two primary actions; Open full recipe is a secondary link (RB-D1/D2); full page takes over the whole recipe lane, entered without reload (RB-D3); notes and reactions flyout re-openable on the page in the right lane, one flyout at a time (RB-D4); phones have no flyouts (RB-D5): `mockup:docs/knowledge/recipe-browse-full.md:7-11`. Defaults chosen by the build with the owner NOT having picked among the options: flyout A, page layout 1 (proof band, one column), Re-open A (labelled header button with counts and key N); build keeps the bottom Plan it / Cook it bar (a difference from the mockup); thumbs-down named only for the caller: `kitchie:docs/project-plan.md:1634`. Page-top option 2 ("hero card and two columns, narrows to the 736px column when the flyout opens so it pushes and never covers") was DRAWN and not chosen: `mockup:docs/knowledge/recipe-browse-full.md:17`, CSS `mockup:fragments/recipe-browse-full/styles.css:119-122` (`.rb-hero`, `.rb-two` 5fr/6fr grid, `.rb-hacts`). It is the nearest existing vocabulary for a wide page.
- "Recipes land" pane / cooking-ideas pane: moved entirely to Home; Recipes tab is the library only; desktop row tap opens a summary flyout in the Pantry panel's right lane, "Open full recipe" goes to the full page (owner 11-12 Oct, memory recipe-tab; `kitchie:docs/project-plan.md:1536`).
- Photos: banner large, step photos medium, one photo per step (max 10 per version), gallery max 3 (`limits` in the wire, observed in `get_version`), cook photos on demand (memory, `kitchie:docs/project-plan.md:641`).
- Share: placement A on phone (icon with count) and on the desktop full page (labelled pill with S); desktop summary flyout also gets a Share button beside Open full recipe, opening the panel in the same lane; panel is a bottom sheet on phone and a side panel on desktop: `kitchie:docs/project-plan.md:664`, `recipe-tab/share.ts:157,203-211`; `mockup:docs/handover/recipe-share.md`, `mockup:fragments/recipe-share/placement/notes.md`.
- Edit by hand: pencil in the top bar, a section pencil, More > Edit and E all open the editor as a Pantry-style right-lane panel at 64rem (stacked sheet below) without leaving the page (RT-K12, E-O5): `edit.ts:15-16`; `kitchie:docs/project-plan.md:1593`.
- Recipe page tweaks (owner 12 Oct): quantity is its own right-aligned tabular column, flush right on every row, cart button before it; the top bar names the recipe once the h1 scrolls away, 16px, two lines max: `kitchie:docs/project-plan.md:1579`; css.ts:577-585.
- Per-step ingredients in cook mode (owner 16-17 Oct, recipe#127, kitchie#810, mockup `fragments/cook-step-ingredients`): chips in the step card plus a flyout on desktop; step text carries no quantities; links are AI-tagged at save, no backfill, a recipe without links shows the plain list. This is cook mode, not the detail page, but any desktop method column should leave room for it (memory recipe-tab).
- Plan day picker on desktop (Kitchie #757, owner 16-17 Oct): option F, a right flyout in the "This week" slot listing the next seven days, picking plans at once, then holds ~3 s with Undo; desktop only, phone untouched. The recipe page's Plan it today is still the bottom-sheet day picker at every width (css.ts "Plan it" comment, line ~594) (memory plan-desktop).
- Factory / governance: anything with a screen is drawn in `mockup` first; the issue body carries the live Pages link at the top; a second agent reviews against `DESIGN.md` and principles; mockups stay in step with what is live and unchosen options are kept: `gov:docs/factory/README.md:27-28`, `gov:docs/factory/guardrails.md:311-330`. Seed / test data must cover the real shapes and say when something was only reasoned: `gov:docs/factory/guardrails.md:86-100`.

---

## 5. Shared CSS, tokens, classes and paths to copy; breakpoints

### 5.1 Base theme (mockup)

Every mockup page links, in this order (paths from `fragments/recipe-detail-desktop/`):

```html
<link rel="stylesheet" href="../../theme.css">
<link rel="stylesheet" href="../../shared.css">   <!-- optional: .wrap, .btn, .tile, .pill; fragments such as recipe-browse-full skip it -->
<script src="../../theme.js"></script>
```

- `mockup:theme.css` (23 lines): spacing `--sp-1..--sp-7` (4,8,12,16,24,32,48), `--tap:44px`, `--gutter`, `--content-max`, fonts `--head` (Bricolage Grotesque) and `--body` (DM Sans), `--r-pill:99px`, and the two production palettes: `kitchie` (dark: `--bg #0F1E19 --surface #172A23 --border #24403A --fg #F3EEE3 --muted #A9B8AE --accent #F2B84B --on-accent --danger #FF9A8F --sage #9CCBA8 --cue #86D99B --out`) and `kitchie-day` (light). Also `--r-ctl:14px --r-card:18px --dim`. `mockup:themes/*.css` hold the other eight themes, fetched on choice by `mockup:theme.js` (two defaults only on the default path). No raw colours in page CSS (DESIGN.md:27).
- `mockup:shared.css` (45 lines): `*{box-sizing}`, body, `.wrap` (uses `--content-max`), `.back`, `.btn`, `.pill`, `.tag`, `:focus-visible` (3px accent outline, 2px offset), `.sr-only`.
- Desktop frame helper: `mockup:fragments/plan-desktop/frame.js` (`?vp=<width>` renders the page in an iframe of exactly 1024x768, 1280x800, 1366x768, 1440x900, 1920x1080 or 2560x1440, hidden control at the top edge or backtick) and `mockup:fragments/device.js` (Pantry-tied equivalent). Reuse `frame.js` so size-specific CSS runs for real.
- Keys cue helper: `mockup:fragments/shortcut-cues/cue-key.js` (used by `plan-desktop/b.html`), shared `.kbd` rule: `font:600 11px var(--body);border:1px solid var(--border);border-radius:6px;padding:1px 6px;color:var(--muted);background:var(--bg)`.

### 5.2 Recipe vocabulary to copy (mockup and build are meant to share names)

Recipe page (phone) stylesheet, the source of the build's `recipes.css`: `mockup:recipe/recipe.css`, `mockup:recipe-photos/photos.css`, `mockup:recipe-versions/versions.css` (the build prefixes every selector with `.rtab`, header of `recipe-tab/css.ts:1-9`). Desktop recipe vocabulary: `mockup:fragments/recipe-browse-full/styles.css` and `app.js`, `mockup:fragments/recipe-share/{placement,flyout,manage,sheet}/*.css`, `mockup:recipe/edit-desktop.css`.

Class names already in the build and in the mockup (reuse these, do not rename):

| Group | Classes |
|---|---|
| Frame | `.rtab`, `.top` (`.back`, `.ttl`, `.ib`, `.ib.bare`), `.body`, `.pad`, `.sec`, `.lblrow`, `.lbl`, `.jumps`, `.strip`, `.vstrip`, `.act`, `.band`, `.slim`, `.pills`, `.st`, `.tg`, `.meta`, `.mc`, `.serves` |
| Content rows | `.ing` (`.nm`, `.q`, `.dot`, `.unk`, `.miss`, `.vh`), `.mini` (`.ico`), `.hint`, `.stp` (`.nb`, `.timer`), `.psp` (step photo strip), `.note` (`.inh`, `.from`), `.hist` (`.d`, `.t`), `.pgrid`, `.pmore`, `.src`, `.back` (as button) |
| Photo | `.pf` (`.stock`, `.prep`, `.in`), `.pi`, `.pprep`, `.pinh`, `.hero2 .hb`, data attributes `data-pid`, `data-size t|m|l`, `data-phase banner|step|scroll|demand` |
| Social proof (`rb-`) | `.rb-band`, `.rb-bh`, `.rb-dots`, `.rb-dot`, `.rb-react`, `.rb-rc`, `.rb-av.m1-m3`, `.rb-th.up|dn|no`, `.rb-notesbtn.re-a`, `.rb-pillcnt`, `.rb-mem`, `.rb-q`, `.rb-h4`, `.rb-cooked`, `.rb-big`, `.rb-empty`, `.rb-tg`, `.rb-ing.two`, `.rb-btn.pri`, `.rb-fh .rb-ft .rb-fb .rb-ff` (flyout header/body/footer) |
| Lanes | `aside.rfly` (+ `.rfly-notes`, `.rfly-share`), `.x` round close, `.phint`, `.kbd` |
| Share | `.shr-chip(.on)`, `.shr-ic`, `.shr-n` |
| Alternative wide-page names in the mockup only | `.rb-hero`, `.rb-hm`, `.rb-hacts`, `.rb-two`, `.rb-page`, `.rb-pin` |

Build-side CSS locations to mirror: `recipe-tab/css.ts` (phone + shared base), `desktop-css/recipes.ts` (desktop-only rules, no `@media` wrapper), `assets/recipes-share-desktop.css` (on-demand lane CSS). Photo frame rules are written once in `photoFrameCss` (css.ts:15-24).

### 5.3 Tokens to use for geometry (build)

`desktop-layout.ts:55`: `:root{--rail:88px; --panel:400px; --col:640px; --dgut:48px; --flyout:320px; --pl:min(calc(var(--rail) + var(--col) + 2*var(--dgut)), calc(100% - var(--panel)))}`. `--pl` is where the right lane starts; `--pr` is the right margin the page reserves (set to `var(--panel)` while a lane is open, recipes.ts:13,148). Rail pages: `body:has(nav.bar):not(:has(.pm,.sp))` (`desktop-css/scope.ts`, exported `HAS_RAIL`). Lane rule: `.rfly{position:fixed; top:0; bottom:0; left:var(--pl); width:var(--panel); z-index:8; background:var(--surface); border-left:1px solid var(--border)}` (recipes.ts:16). Tokens `--rtop` (61px top-bar height used by sticky offsets), `--cue`, `--r-ctl/--r-card/--r-pill` are set on `.rtab` (css.ts:542). Do not add width literals outside the desktop-layout block (`kitchie:AGENTS.md:187`, enforced by `test/layout-tokens.test.ts`).

### 5.4 Breakpoint convention

- Build: `rem` media queries, CSS width only. Phone <37.5rem (600px), tablet 37.5rem to <64rem, DESKTOP `min-width:64rem` (1024px). Desktop CSS is the served file `/assets/desktop.css`, linked with `media="(min-width:64rem)"` (`desktop-layout.ts:43`), packages inside one `@media (min-width:64rem)` block. Scripts decide with `matchMedia("(min-width: 64rem)")` before fetching (recipes.js:218-229).
- Desktop group widths: rail 88 + column 640 (+2x48 = 736) + lane 400, left-anchored, free space to the right of the lane. Below ~1224px the column shrinks so the lane never covers it (`desktop-layout.ts:17`, recipes.ts:148 uses `max-width:1223px`). History/Sort column overlays below 1240px (`mockup:docs/handover/desktop.md:23`).
- Wider tiers exist only for Plan desktop: `plan.desktop-1280.css (min-width:80rem)`, `-1440 (90rem)`, `-1920 (120rem)`, `-2560 (137.5rem)`, plus `plan.desktop-short.css` (max-height:800px), linked per `web-plan.ts:34`; mockup equivalents `mockup:fragments/plan-desktop/{b-1280,b-1440,b-1920,b-2560,b-short}.css` with `media="(min-width:1280px)"`, `1440`, `1920`, `2200`, `(max-height:800px)`. Plan uses lane tokens `--lane:400px; --sum:320px; --main-max:632px` at 1440 (`88 + 632 + 400 + 320 = 1440`), 440 at 1920. That is the precedent for a screen that earns tiers above 64rem; `kitchie:AGENTS.md:187` says such an exception is recorded in the plan and agreed with the owner.
- Mockup files use px literals in `media` attributes (media queries cannot read variables, `mockup:theme.css` header); the build converts to rem (1280 = 80rem).
- Sizes to screenshot: 1024, 1280 (800 tall), 1366x768 (short), 1440, 1920, 2560; plus 390 and 768 to prove the phone is unchanged.

---

## 6. What could only be reasoned, not verified

- The rendered width of the page on a wide screen. The task brief says about 1060px pinned left; the code points to the 736px column (`--content-max` = 640 + 2x48 from the rail rules) with `.rtab{margin:0 calc(-1*var(--gutter))}` (css.ts:542) and `body:has(.rtab)` setting `--content-max:var(--phone-max)` (44rem = 704px, layout.ts:27) at 64rem (css.ts:543). Which of the two cascades wins on the live page (the rail selector `body:has(nav.bar):not(:has(...))` is more specific, so 736 is my reading), and what the extra width in the 1060 figure is (rail 88 + column + gutters + scrollbar?), was not measured; I did not load the page in a browser. The comment in `desktop-css/recipes.ts:97` says "the 736px column", and the 12 Oct plan row says "the same 640px phone column" (`project-plan.md:1579`).
- The live UAT page itself (https://43-134-239-163.sslip.io/kitchie-uat/recipes/recipe?id=fam_34824ea9-...) was not opened: no signed-in browser here. Every anatomy claim is from the code and from the Recipe UAT data (read-only `list_families` and `get_version` through the MCP on 17 Oct). The UAT example recipe (Barramundi with Capers) has 2 ingredients, minutes 20, serves 2, one kept version, no banner; its steps, notes and cooks were not read.
- Exact pixel heights of the page's fixed and sticky chrome at desktop (top bar 61px per `--rtop`; version strip 48px; jump row 40px + padding; bottom bar height with `--barh`, which is `0px` on rail pages per `desktop-layout.ts:92`, so the Plan it / Cook it bar sticks to the viewport bottom with no bottom nav under it). Needed for any "fits without scrolling" claim; measure in the mockup at 1280x800 and 1366x768.
- How many rows a 10-ingredient / 6-step recipe actually occupies in a given column width, so which sample recipes fit one screen without scrolling is not known. The three sample sets in 3.4 are meant to answer exactly that.
- Whether the browse-to-page in-place swap (`recipes-browse.js openFull`) works when the page is rebuilt with a different DOM: it replaces the whole `#rtab` node by id, re-runs the page's `/assets/recipes*.js` scripts, relies on `#rtab h1`, `#rtab .top a.back`, `[data-notes]`, `[data-note]`, `#t-notes-fly` and `.rtab .sheet`. A new desktop markup must keep those hooks or the script changes with it. Not tested.
- Whether `window.KitchieRecipes` state survives a swap when new desktop scripts are added (the swap nulls `KitchieRecipes` and `KitchieRecipeFlyout`, then re-runs scripts in order).
- Key conflicts: N, S, E, comma, O, J/K, M, `/`, Alt+Left, Ctrl/Cmd+Esc and Ctrl/Cmd+Enter are registered through `KitchieDesktop.registerKey`; S is special-cased with a capture-phase listener because the app's S means "add to shopping list" (recipes-desktop.js:42-50). Other candidate keys (for tab switching, step navigation) were not checked against `desktop-keys.js` or `desktop-global.js`.
- Whether the page is ever opened inside the Pantry "item panel" lane for non-Recipe households; Home's panel has its own recipe view (`home-panel.ts`) that was read only for its link.
- Which owner decision (if any) covers a wider-than-736px recipe page: `AGENTS.md:181` says "do not add other desktop widths" and "a screen does not get its own layout per bucket" (187). No recorded decision allows the page to use the free space right of the lane. Page layout option 2 of RB was drawn, not picked. This is a decision for Arjan, not something to assume in the mockups.
- Sample data in 3.4 is invented, not read from a live household (except the Berry Pavlova groups, Barramundi example and long real titles from UAT, and the fixtures from `recipe-tab/fake.ts`). The 24 ingredient count and 14 steps in sample E should be re-counted when the mockup data is written.
- The project docs listed in the session (`claude/plan-desktop-handoff.md`, `claude/platform-context.md`, etc.) were not readable in this agent (no project tool); decisions here come from the repos and the account memory only.

---

## 7. Owner decisions on the recommended layout

Added 17 October 2026 with the sixth layout, `recommended/` (live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/recommended/index.html). It merges option C's tabbed rail with option E's hero strip and method columns, as the owner asked. Notes for the page itself: `recommended/notes.md`.

### 7.1 Decided by the owner (by voice, 17 October 2026; locked until he overrides)

1. **Hybrid.** Option C's in-place tabbed left rail (Ingredients, Notes, Cooked, Photos, count badges, keys 1 to 4 and N) plus option E's hero strip and balanced multi-column method on the right. Option D is dropped.
2. **The banner image is a real hero.** A proper banner photo across the hero strip, not a thumbnail. None of options A to E did this.
3. **The time badge ("20 min") sits directly under the title.**
4. **Per-step time is shown beside each step number**, only where a step has a time.
5. **No ingredient-to-step linkage on this page.** Cook it mode owns that (recipe#127, Kitchie #810).
6. **The "ingredients and notes in one zone" constraint is lifted.** This is the recipe's detail page. The hero strip is the one place that shows everything: title, time badge, Serves, History and proof, the version and lineage line ("From <parent>") and every action including Plan it and Cook it. There is no bottom bar.
7. **The "Notes and reactions" pill loses its text label** (the thumbs and note icons say it). Its flyout is better organised and shows the user's NAME against each rating, only for people who actually rated.
8. **Avoid scrolling on desktop.** Ingredients are a short, wrapping list; the method gets the room.

### 7.2 Recommended by Claude (proposals; the owner was silent)

9. **Wide layout only from 80rem wide and 700px high.** Below that the same page stacks and the document scrolls (a stand-in for today's single column, which the build keeps). Separate viewport file `recommended-wide.css`, linked with a `media` attribute (the repo's viewport rule).
10. **Keys.** 1 to 4 switch the rail tabs; N keeps its app meaning (open or close the Notes and reactions flyout) and is shown on the pill; the Notes tab is key 2. All gated to the recipe page in the build (`1` and `2` are also History keys, Up and Down are "previous or next item"). Ctrl or Cmd with Enter or Esc closes the flyout; plain Esc closes only a step photo or the version menu.
11. **Version and lineage.** One version chip in the hero ("With peas", star for Our usual, red dot for a change to review) opens a small menu (every version, its parent, Trying, To review, All versions); "From Original" sits beside it. This handles five versions without the truncation the review found in C.
12. **Density classes from the counts** (E's idea): roomy up to 5 ingredients and 4 steps (one column, large photos), normal, tight above 16 ingredients or 10 steps (smaller text and thumbnails). Chosen by the server in the build.
13. **Long recipes keep Notes reachable.** The tab strip never scrolls, so Notes is one tap or key 2 away; inside a tab only the list scrolls, with "Add a note" and the source line pinned under it.
14. **The source line is back,** pinned at the foot of the rail.
15. **No gap between step text and photo.** The text track is capped at 40 characters and the photo follows it directly; a tapped photo opens large under the step.
16. **The Notes flyout pushes the page and never covers it** (the app's lane rule). While it is open the page is narrower, so the rail drops to 19.5rem, hero hint chips go and the method drops to one column.
17. **Empty is absent.** No Cooked tab until there is a cook, no Photos tab without photos; Notes always stays ("No notes yet." plus Add a note). With no banner there is no photo hero (R-D9): a plain, shorter strip.
18. **Photos in the sample are mockup-only:** banners are wide crops composed from the repo's sample plates (`recommended/img/`), step thumbnails reuse `recipe-photos/img/`.

### 7.3 Open questions for the owner

Q1. **Width-rule exception, and the breakpoint.** `kitchie AGENTS.md:181` says desktop is a rail, a 640px column and a side panel and "do not add other desktop widths"; line 187 says a screen needing its own layout records the exception in `docs/project-plan.md` and asks the owner. The owner is explicitly rethinking the big-screen layout, so the recommended page uses the space right of the 88px rail, left-anchored, capped at 105rem, with the rail width held as a token (`--rec-rail`, `--rec-max`, `--rec-lane`). This is recorded as **proposed, awaiting owner** in `docs/project-plan.md`; nothing is settled. Breakpoint proposal: apply from 80rem and 700px high, keep today's page from 64rem to 80rem and on short windows (also covers browser zoom above 125%). Alternative: design 1024 to 1279 properly. A wrong guess costs a second desktop layout that is not wanted, or four broken widths.
Q2. **Where do Plan it and Cook it live?** Recommended: hero, top right, no bottom bar (constant place, no 64px height cost). Alternatives: rail footer (option A), keep today's fixed bar.
Q3. **Cooked and Photos one tap deeper** than today's jump row (tabs, keys 3 and 4, and a "Cooked 4x" proof button). Accept, or keep them visible?
Q4. **Carry `group` through the wire** (`IngredientLine`, `StepLine`, `client.ts:217`, `fake.ts`): the long sample draws group labels that the app cannot fill today. Recommended: yes, as its own small change first. Not asked for: prep and cook minutes, equipment, tags.
Q5. **Park option D** (the step stage) under Kitchie #810 as "Cook it on desktop", rather than discarding it.
Q6. **How is lineage and version shown?** Proposal 11 (one chip with a menu plus a "From <parent>" line). Alternative: a version strip as in C and E.
Q7. **What does N do?** Proposal 10 keeps N as the Notes and reactions flyout and gives the Notes tab key 2. The owner's wording ("keys 1-4/N") could also mean N goes to the Notes tab; then the pill opens the flyout by click only.
Q8. **Names against thumbs-down.** The owner asked for the user's NAME against each rating. Today "not for me" is private: a count, named only for the caller (V-D33). The mockup shows the name for every rating, so it draws Alex's "Not for me". Confirm that V-D33 is lifted.
Q9. **A long recipe still scrolls its ingredient list inside the rail** (24 ingredients does not fit 1280x720; the method does fit). Accept, or show ingredients in two columns on tight recipes (E's way, at the cost of a rail that changes width)?
Q10. **Method reading order across two columns.** Steps run down the left column, then the right; a group label can end a column and its steps continue unlabelled in the next. Accept, or one column with the lane open only?

### 7.4 Open decision: Plan it / Cook it overlay placement (18 October 2026)

**Status: OPEN.** Owner direction by voice, 18 October 2026: move Plan it and Cook it so they are overlaid directly on the hero banner image, always visible (not hover), instead of the right side of row two. He has not chosen the placement and wants a few options first. Mockup: `plan-cook-overlay/` (live: https://basement-bridge.github.io/mockup/fragments/recipe-detail-desktop/plan-cook-overlay/index.html), variations A (bottom-right solid pair), B (floating glass bar, bottom centre), C (top-right stack).

- This supersedes proposal 7.3 Q2 (hero, top right of row two) once an option is picked; until then the recommended page is unchanged.
- **Proposal (Claude, advice only):** A. Not locked.
- Proposals made where he was silent: row two stays and left aligns (the hero is 4px shorter); no banner means no overlay and the buttons stay in row two; the banner becomes a click-to-enlarge target (new); magnifier always visible; keyboard order unchanged plus one banner stop.
- Open: which placement (A, B or C); whether the banner focus point should choose the button corner; whether the banner click-to-enlarge is wanted at all.
