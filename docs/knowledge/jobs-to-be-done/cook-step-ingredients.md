# Cooking: the ingredients this step uses

Status: owner ask 16 Oct 2026 (voice). Mockup: `fragments/cook-step-ingredients/` (options A to C, A recommended). Data shape and schema: [../../cook-step-ingredients-analysis.md](../../cook-step-ingredients-analysis.md). Nothing built, no schema change made.

## Job

The person is cooking a recipe from the vault, one step at a time, and needs to know which ingredients this step involves and how much of each.

## How we know the person is in this job

Cook mode is open on a step (`?step=n`), as today. Nothing new is inferred.

## What leads

The owner's words: "it is a real inconvenience not to know which ingredients the current step involves". Each step shows the ingredients and the amount that step uses, in a highlighted strip or callout near the step text (for example 2 eggs and 1 cup of flour, although the recipe needs 3 eggs). The full ingredient list stays neutral and dimmed. An ingredient can be split over steps (half the chicken in the marinade, half in the searing), so a link is an ingredient plus the amount for that step. The links are filled in when the recipe is saved, by the assistant, and stored permanently; the cooking view only looks them up.

## What this job does not need

Where the ingredient is stored, freshness, stock levels, history, nutrition. A step with no ingredients shows no strip.

## Mockup

`fragments/cook-step-ingredients/`: A callout under the step (recommended), B chips inside the step card, C dock above the step buttons. Phone 390 and 360, desktop 1280, light and dark. Controls: sample recipe (fried rice, long list, half tagged, not tagged yet) and servings. Screenshots in `docs/screenshots/cook-step-ingredients-*.png`. Check: `tools/cook-step-ingredients-check.mjs`.

## Decisions (all proposals, the owner has not confirmed any)

- **CSI-1** Links read only stored data; no AI at read time (owner).
- **CSI-2** A link is an ingredient id plus one of: a number (in the ingredient's own unit), `all`, `rest`, or unknown. Never a unit of its own. Owner-stated: per-step amounts split an ingredient.
- **CSI-3** A split ingredient reads "1 of 2 chicken breasts" with "1 left for step 2"; an earlier use reads "1 already used in step 1".
- **CSI-4** Amounts scale with servings by the same rule as the ingredients screen; display rounding only, never adjusted to add up.
- **CSI-5** Unknown amount: a dash and "Amount not given". Never "to taste" or "some", which would be invented.
- **CSI-6** A step saved as checked with no ingredients shows one quiet line, "No ingredients in this step". A never-checked step shows nothing.
- **CSI-7** A recipe with no links shows today's screen: no strip, no hint, no nag. The assistant offers to add them when asked.
- **CSI-8** Half-tagged recipe: strips on tagged steps only, and no still-to-come list (it could be wrong).
- **CSI-9** The rest of the list is plain text in two groups, "Still to come" then "Already used", with step numbers in words and a tick; no fill colour, no dimming by opacity (contrast).
- **CSI-10** Not colour alone: heading with count, left bar, tick glyph, words for state.
- **CSI-11** Long list: first five, then "Show n more" in place (A, B); C collapses by default.
- **CSI-12** Order within the strip follows the ingredient list, not the order the assistant wrote.
- **CSI-13** No gesture hint text anywhere on the step screen.
- **CSI-14** Option A is recommended: the strip is read before the cook looks away from the pan, and costs no tap. Wrong guess: more scrolling on 360 for a long list (C avoids it).

## Open questions

Which option; whether the still-to-come list belongs on the step screen; "used in step 1" for an ingredient the cook skipped. Schema questions are in the analysis, section 10.

## For the implementation

Recipe stores `uses` inside the step object (no SQL migration under the recommended option); Kitchie's `recipe-client.ts` parses it and `cook-model.ts` computes the strip; every step section is already rendered up front, so no new request. Default path: no new request, the mockup page is about 32 KB (styles 9, script 17, page 6), the build's part about 2 KB, nothing deferred. Build only after the owner confirms on the issues.
