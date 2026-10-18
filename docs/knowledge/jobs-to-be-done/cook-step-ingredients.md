# Cooking: the ingredients this step uses

Status: owner ask 16 Oct 2026 (voice); **owner chose option A on 17 Oct 2026** and gave decisions CSI-15 to CSI-21 (below, marked owner-stated). Later the same day he asked for the phone "Still to come" to be quieter (CSI-22, owner-stated; CSI-23 to CSI-26 are proposals, three treatments to compare). Mockup: `fragments/cook-step-ingredients/` (options A to C, A chosen; phone Still to come treatments 1 to 3). Data shape and schema: [../../cook-step-ingredients-analysis.md](../../cook-step-ingredients-analysis.md). Nothing built, no schema change made.

## Job

The person is cooking a recipe from the vault, one step at a time, and needs to know which ingredients this step involves and how much of each.

## How we know the person is in this job

Cook mode is open on a step (`?step=n`), as today. Nothing new is inferred.

## What leads

The owner's words: "it is a real inconvenience not to know which ingredients the current step involves". Each step shows the ingredients and the amount that step uses, in a highlighted strip or callout near the step text (for example 2 eggs and 1 cup of flour, although the recipe needs 3 eggs). The full ingredient list stays neutral and dimmed. An ingredient can be split over steps (half the chicken in the marinade, half in the searing), so a link is an ingredient plus the amount for that step. The links are filled in when the recipe is saved, by the assistant, and stored permanently; the cooking view only looks them up.

## What this job does not need

Where the ingredient is stored, freshness, stock levels, history, nutrition. A step with no ingredients shows no strip.

## Mockup

`fragments/cook-step-ingredients/`: A callout under the step (chosen, revised 17 Oct), B chips inside the step card and C dock above the step buttons (left as drawn, not revised). Phone 390 and 360, desktop 1280 and 1024, light and dark. Controls: sample recipe (fried rice, long list, half tagged, not tagged yet), servings, and Room (roomy, step photo, long text, small screen) for option A. On desktop option A is a mix: chips inside the step card (from B) and a dock for the lists (from C). Screenshots in `docs/screenshots/cook-step-ingredients-*.png`. Check: `tools/cook-step-ingredients-check.mjs` (extended for CSI-22 to CSI-26).

## Decisions (CSI-1 to CSI-14 are proposals; CSI-15 to CSI-21 are owner-stated, 17 Oct 2026; CSI-34 onward 18 Oct 2026)

- **CSI-1** Links read only stored data; no AI at read time (owner).
- **CSI-2** A link is an ingredient id plus one of: a number (in the ingredient's own unit), `all`, `rest`, or unknown. Never a unit of its own. Owner-stated: per-step amounts split an ingredient.
- **CSI-3** (superseded for option A by CSI-19; still applies to B and C) A split ingredient reads "1 of 2 chicken breasts" with "1 left for step 2"; an earlier use reads "1 already used in step 1".
- **CSI-4** Amounts scale with servings by the same rule as the ingredients screen; display rounding only, never adjusted to add up.
- **CSI-5** (superseded for option A by CSI-18; still applies to B and C) Unknown amount: a dash and "Amount not given". Never "to taste" or "some", which would be invented.
- **CSI-6** A step saved as checked with no ingredients shows one quiet line, "No ingredients in this step". A never-checked step shows nothing.
- **CSI-7** A recipe with no links shows today's screen: no strip, no hint, no nag. The assistant offers to add them when asked.
- **CSI-8** Half-tagged recipe: strips on tagged steps only, and no still-to-come list (it could be wrong).
- **CSI-9** (superseded for option A by CSI-15 and CSI-16: Already used is folded, Still to come is re-ordered and capped by room) The rest of the list is plain text in two groups, "Still to come" then "Already used", with step numbers in words and a tick; no fill colour, no dimming by opacity (contrast).
- **CSI-10** Not colour alone: heading with count, left bar, tick glyph, words for state.
- **CSI-11** (callout cap still holds; the Still to come cap is now CSI-16) Long list: first five, then "Show n more" in place (A, B); C collapses by default.
- **CSI-12** Order within the strip follows the ingredient list, not the order the assistant wrote.
- **CSI-13** No gesture hint text anywhere on the step screen.
- **CSI-14** (settled: the owner chose A on 17 Oct 2026) Option A is recommended: the strip is read before the cook looks away from the pan, and costs no tap. Wrong guess: more scrolling on 360 for a long list (C avoids it).

### Owner decisions, voice, 17 Oct 2026 (option A)

- **CSI-15** (owner-stated 17 Oct 2026; supersedes CSI-9 for the "Already used" list on A) "Already used" is not a section in the default view. It is one quiet collapsed row, "Already used (N)", that opens on tap. No space or attention by default.
- **CSI-16** (owner-stated 17 Oct 2026; supersedes CSI-9 order and CSI-11 for the rest list on A) "Still to come" is ordered by what the next step or two needs (first later step that uses each ingredient, then list order), showing the amount still to be used. It is capped at three with "+N more" only when real estate is tight (a step photo, step text over 160 characters, or a viewport under 600 px high); with room it shows up to six. The 160 and 600 thresholds and the six are **Proposals**. The mockup has a Room control to show both.
- **CSI-17** (owner-stated 17 Oct 2026) The current-step callout is economical: content-sized, no fixed height, no padding or decoration beyond what is useful, rows as dense as stays legible; 44px only where something is tappable (the "+N more" button and the "Already used" row, never the rows).
- **CSI-18** (owner-stated 17 Oct 2026; supersedes CSI-5 on A) Each callout line has the ingredient name left in heavier weight and the quantity right-aligned in lighter weight. No quantity (to taste, null amount): nothing on the right, no dash, no filler text.
- **CSI-19** (owner-stated 17 Oct 2026; supersedes CSI-3 on A) A split ingredient shows this step's portion and a small chip pointing to where the rest is used: "\u2192 step 7", "\u2192 4, 7" for several (first three, then "+n"). The final use has no chip. The owner picked the chip over the sentence "1 left for step 7". The "of 2" total is dropped from the line (**Proposal**: the total stays on the ingredients screen).
- **CSI-20** (owner-stated 17 Oct 2026, mix and match) Phone keeps option A as revised. Desktop is a different composition of the same three blocks: "In this step" as chips inside the step card (from B, no separate callout); "Still to come" and "Already used" in a dock that opens in place (from C), one open at a time. Accents: a present accent for still to come, a dull grey for already used; colour only reinforces, label, icon and position differ too. Same line rules (CSI-18, CSI-19) inside chips and dock. Checked at 1280 and 1024. **Proposal:** the desktop dock is not capped (it scrolls), because it opens on demand.
- **CSI-21** (owner-stated 17 Oct 2026) Step text must not contain quantities. Any amount a step shows comes only from its per-step link, which scales with servings like the main list: one source of truth, two numbers can never drift apart. The MCP guidance is prescriptive: when the assistant creates or patches a recipe, step text is written without quantities ("add the flour", not "add 2 cups flour"); quantities live only in the ingredients list and the per-step links. The sample recipes here carry no quantities in step text. Existing recipes whose steps already contain quantities keep them; the strip never rewrites them. Warning idea `step_text_quantity` and tool wording are in the analysis, section 5.

### Phone: Still to come, quieter (owner, voice, 17 Oct 2026)

The owner: on the phone "Still to come" is too attention-grabbing; the current step and its callout must lead, and "Still to come" must read clearly as secondary. He asked for a couple of visuals to compare. Desktop and options B and C stay as they are. The mockup has a phone-only switch, **Still to come (phone)** in the page controls, or `?stc=0` (before) `1`, `2`, `3`. Screenshots: `docs/screenshots/cook-step-ingredients-stc{0..3}-*`.

- **CSI-22** (owner-stated 17 Oct 2026) On the phone the current step and its callout lead; "Still to come" is visibly secondary (less fill, less weight, less size, less space than the callout). Desktop view and options B and C do not change.
- **CSI-23** (Proposal) Three phone treatments of the same data, switchable with `?stc=`: **1 Next line**, one muted 44px row "Next · step 3 oil" naming only the next step that uses ingredients, tap to open the full list in place; **2 Summary row**, a fold "Still to come (5)" like Already used, closed until tapped; **3 Inline names**, a small muted run of names with a tiny step pointer ("soy sauce → 4"), no amounts, an "Amounts" toggle (44px) switches to the list with quantities.
- **CSI-24** (Proposal, recommended default) Treatment 1. Quietest thing that still answers "what do I get ready next?" without a tap: no fill, no outline, no amounts, no chips until opened, so the callout is the only coloured block. Treatment 2 hides that answer; 3 keeps a three-line block on screen that competes with the step words. A wrong guess costs one tap per step for a cook who wants the whole list always visible (then pick 3).
- **CSI-25** (Proposal, all three) The rest block has no fill, no accent bar and no accent-outlined chips (chips use the plain border and muted text); type is 13px muted next to 16px callout names, contrast at least 4.5:1; tappable summaries are 44px; the CSI-16 cap (three when tight, six with room, "+N more") still applies wherever the list shows, in the opened panel of 1 and 2 and in the names run and amounts list of 3; Already used (CSI-15) is unchanged and always last; not colour alone (arrow glyph and words, counts, chevrons); a recipe that is not fully tagged shows none of it (CSI-7, CSI-8).
- **CSI-26** (Proposal, treatment 1 only) The Next line names the literal next step that has ingredients (a step with none is skipped, so step 4 can read "Next · step 6"), up to three names then "+n", and includes an ingredient the callout also shows (it says what to have ready). When nothing later uses ingredients but some are in no step, it reads "Still to come" with their names. On the last step there is no row.

### Phone option 4, the amalgam, and web display swaps (owner, voice, 17 Oct 2026, evening)

The owner asked for one new, distinct phone option gathering his refinements, without removing treatments 0 to 3 or the existing callout styles, so he can cherry-pick. Switch `?stc=4` ("4 Amalgam" in the controls). Separately `?disp=check|table|pills|bullets|cards` swaps only the phone "In this step" callout. The `?disp` swaps were dropped on 18 Oct 2026 (CSI-35) and the ?stc=4 rows and dock were reworked (CSI-34 to CSI-38, next section); the old `-disp-compare-*` screenshots are removed. Current screenshots: `docs/screenshots/cook-step-ingredients-stc4-*`.

- **CSI-27** (owner-stated) Callout: ingredient name left (heavier), quantity right (lighter); no quantity, nothing shown (quantity-first rejected). The overall count badge is removed. **Scope (Proposal):** removed in `?stc=4` and in the `?disp` swaps only; treatments 0 to 3, desktop chips, B and C keep it so nothing the owner asked to leave alone changes (one span per renderer to remove it everywhere).
- **CSI-28** (owner-stated, wording Proposal) A split ingredient shows the step's own plain amount ("1 chicken breast", never "1 of 2 chicken breasts") plus a small line "1 left for step 2". Several later steps: "3 tbsp left for steps 3, 7" (first three, then "+n"); amount unknown later: "Some left for step 7". Replaces the "→ step 7" chip in option 4 only. Same wording in the dock: "left for step 4" when an earlier step already used some, "for step 4" otherwise, "used in step 1" for Already used.
- **CSI-29** (owner-stated) A heading that opens only the remainder is called "Still to come", not "All ingredients". Audit: only option B's disclosure was wrong; fixed (reads "Already used" on a last step where nothing is left). A half-tagged recipe lists every ingredient and keeps "All ingredients". Treatments 1 to 3, C and desktop were already right. The recipe-page fragment's "All ingredients" is a true full list and is unchanged.
- **CSI-30** (owner-stated; Already used preview is a Proposal) Default on the phone in option 4: two quiet rows (no fill, 13px muted, 44px), names only, no quantities, one line cut with a trailing "…" when space runs out; no "+N more", no count. Still to come previews the next step that uses ingredients; Already used previews what finished most recently.
- **CSI-31** (owner-stated) Tapping either row opens a dock above the step buttons, in place (same pattern as option C and the desktop dock), with full detail including quantities; two tabs, tap the open tab to close. The Amounts toggle from treatment 3 is not carried over (the dock already shows amounts).
- **CSI-32** (Proposal) The rows keep the words "Still to come" and "Already used" (not "Next · step 3"), so the step number is only in the dock. Wrong guess: a cook reads "Still to come: oil" as everything left and taps once.
- **CSI-33** (Proposal) Five web patterns as callout swaps, phone option A only: checklist (44px rows, tick strikes the name), two-column table, pills, bulleted list with bold quantity first ("1 chicken breast"; shown for comparison, quantity-first stays rejected for the callout), cards grouped by type (Produce, Meat, Dairy and eggs, Pantry; sample grouping). Same rules in each: plain amount, "left for" line, no count, no quantities in step text. The owner may send a sample of what is not landing.

### Phone option 4 locked by the owner (voice, 17-18 Oct 2026; `?stc=4`)

The owner reviewed the amalgam and decided. `?stc=4` is now his locked phone design. Treatments 0 to 3, the old callout, options B and C and desktop are unchanged and still reachable. CSI-30, CSI-31 and CSI-33 are superseded by the entries below where they differ.

- **CSI-34** (owner-stated) In-step display is ONE merged style: a compact table, amount on the LEFT, then a checkbox, then the ingredient name. No header row, so no column header "Ingredient". Rows keep 44px targets; ticking strikes the name (not colour alone). The tick is purely visual: no state beyond the screen, no semantics. No count badge. Nothing shown for the amount when there is none, and the amount column stays so names line up. A split ingredient shows the step's own plain amount ("1" chicken breast) plus "1 left for step 2" under the name. Proposal inside it: amount in heavy type, name in medium weight; tapping the name toggles the box too.
- **CSI-35** (owner-stated) The other display options are DROPPED: standalone checklist, pills, bullets, grouped cards, and the old two-column table (CSI-33 is withdrawn). They are removed from the controls, the code and the check script; `?disp=` is ignored.
- **CSI-36** (owner-stated; arrow direction is a Proposal) "Already used" is the earlier quiet GREY accordion that opens in place directly under the "In this step" block. Its header is greyed in accent too (grey bar, grey tint, grey icon and text), not only the content. The chevron points DOWN when closed and rotates UP when open (the owner said the earlier direction was wrong). Same on every phone width. Keeps its count "Already used (2)".
- **CSI-37** (owner-stated) "Still to come" is a BOTTOM-DOCKED bar above the step buttons that shows only the immediate next step's ingredient names, no quantities, with a trailing "…" when space runs out (no "+N more", no count). Tap opens the dock as a flyout upward from the bar (like desktop option C) with full detail including quantities. Proposal inside it: the bar's chevron points UP when closed and DOWN when open (it opens upward); the flyout lists amount, name and "left for step 4" / "for steps 6, 7", scrolls inside 240px (150px on a small screen); the bar has an accent left bar and Already used a grey one, so the two differ by position and wording too.
- **CSI-38** (owner-stated) Either-or: only one of the dock and the Already used accordion is open at a time. Opening one closes the other. One piece of state drives both.
- **CSI-39** (owner-stated, standing) Desktop untouched. No per-step links means a plain list and no callout, no accordion, no dock. No quantities in step text. Economical real estate. No gesture hint text.
- **CSI-40** (Proposal) The read-only lists (flyout, accordion) reuse the same amount-then-name columns without the tick, so the screen reads as one pattern. Wrong guess: the owner may want name-first lists in the flyout.
- **CSI-41** (Proposal) The tick does not persist across steps or reloads. Wrong guess: a cook who wants ticks to follow them needs state, which the owner ruled out for now.
- **CSI-42** (Proposal) The accordion's "Already used" lists every ingredient fully used before this step (name, total amount, where used); the dock's "Still to come" bar previews only the next step that has ingredients, as before.

## Open questions

Which phone Still to come treatment (1 recommended); whether the still-to-come list belongs on the step screen; "used in step 1" for an ingredient the cook skipped. Schema questions are in the analysis, section 10.

## For the implementation

Recipe stores `uses` inside the step object (no SQL migration under the recommended option); Kitchie's `recipe-client.ts` parses it and `cook-model.ts` computes the strip; every step section is already rendered up front, so no new request. Default path: no new request, the mockup page is about 58 KB (styles 16.9, script 29.4, page 12.0; was 48.9 before the phone treatments, +9.3 KB raw and +2.5 KB gzipped; 31.7 on 16 Oct), the build's part about 4 KB plus about 1 KB for the chosen treatment (pure functions plus phone and desktop markup), nothing deferred. Build only after the owner confirms on the issues.
