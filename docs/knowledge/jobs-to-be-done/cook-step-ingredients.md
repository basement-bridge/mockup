# Cooking: the ingredients this step uses

Status: owner ask 16 Oct 2026 (voice); **owner chose option A on 17 Oct 2026** and gave decisions CSI-15 to CSI-21 (below, marked owner-stated). Mockup: `fragments/cook-step-ingredients/` (options A to C, A recommended). Data shape and schema: [../../cook-step-ingredients-analysis.md](../../cook-step-ingredients-analysis.md). Nothing built, no schema change made.

## Job

The person is cooking a recipe from the vault, one step at a time, and needs to know which ingredients this step involves and how much of each.

## How we know the person is in this job

Cook mode is open on a step (`?step=n`), as today. Nothing new is inferred.

## What leads

The owner's words: "it is a real inconvenience not to know which ingredients the current step involves". Each step shows the ingredients and the amount that step uses, in a highlighted strip or callout near the step text (for example 2 eggs and 1 cup of flour, although the recipe needs 3 eggs). The full ingredient list stays neutral and dimmed. An ingredient can be split over steps (half the chicken in the marinade, half in the searing), so a link is an ingredient plus the amount for that step. The links are filled in when the recipe is saved, by the assistant, and stored permanently; the cooking view only looks them up.

## What this job does not need

Where the ingredient is stored, freshness, stock levels, history, nutrition. A step with no ingredients shows no strip.

## Mockup

`fragments/cook-step-ingredients/`: A callout under the step (chosen, revised 17 Oct), B chips inside the step card and C dock above the step buttons (left as drawn, not revised). Phone 390 and 360, desktop 1280 and 1024, light and dark. Controls: sample recipe (fried rice, long list, half tagged, not tagged yet), servings, and Room (roomy, step photo, long text, small screen) for option A. On desktop option A is a mix: chips inside the step card (from B) and a dock for the lists (from C). Screenshots in `docs/screenshots/cook-step-ingredients-*.png`. Check: `tools/cook-step-ingredients-check.mjs`.

## Decisions (CSI-1 to CSI-14 are proposals; CSI-15 to CSI-21 are owner-stated, 17 Oct 2026)

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

## Open questions

Which option; whether the still-to-come list belongs on the step screen; "used in step 1" for an ingredient the cook skipped. Schema questions are in the analysis, section 10.

## For the implementation

Recipe stores `uses` inside the step object (no SQL migration under the recommended option); Kitchie's `recipe-client.ts` parses it and `cook-model.ts` computes the strip; every step section is already rendered up front, so no new request. Default path: no new request, the mockup page is about 48 KB (styles 14.6, script 25.4, page 7.9; was 31.7 on 16 Oct, +16 KB raw, mostly the second composition, the Room control and sample text, with B and C unchanged), the build's part about 4 KB (pure functions plus phone and desktop markup), nothing deferred. Build only after the owner confirms on the issues.
