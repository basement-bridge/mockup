# Recipe tags: the household's own

**Status: idea only, not for build.** Kitchie issue #834 (label `idea`). Mockup in `fragments/recipe-tags/`. Drawn so the Kitchie collaborators can discuss it; drawing it approves nothing, and nothing here is a decision.

## What the owner said

Typed, 17 October 2026 (issue #834): recipes carry `metadata.tags`, but these are set automatically when a recipe is saved or imported (e.g. "HelloFresh", "rice bowl", "quick"). The household cannot add its own tags, or filter, suggest or plan by them. The idea: let the household add their own tags, for example a meal type ("breakfast"), a calorie band ("300 cals"), an occasion ("treat") or a focus ("protein"), then use them to find recipes, to steer suggestions, and in weekly planning ("pick a breakfast", "one treat a week"). To be decided in conversation between the Kitchie collaborators.

Voice, the same day: "create mockups for that and follow our standard governance mode."

## What the mockup draws

Phone only. Two jobs, each with two options side by side.

- **Finding recipes by tag.** A: the household's tags as a second strip under the Recipes strip, toggled in place (agent recommends). B: one Tags chip opening a sheet grouped by kind, with counts; picked tags stay on a slim row with an ×.
- **Tagging a recipe.** 1: a tag row on the recipe page under time and serves, opening a picker sheet that saves on each tap and can make a new tag (agent recommends). 2: no new control; tags are set in Edit (already in `recipe/edit.html`) and listed read only at the foot of the page.

Not drawn: planning, suggestions, desktop, curating the tag list.

## Proposals (the idea was silent; none approved)

- **RT-P1** One tag list per household, reused on any recipe; every member sees the same tags.
- **RT-P2** A tag can sit in a group: Meal, Occasion, Focus, Calories (the owner's four kinds), or Other.
- **RT-P3** Any member can tag and make a new tag (Recipes gives every member the same controls, R-O5).
- **RT-P4** Tags set at save or import are kept apart, shown lighter as "From the source", hideable per recipe, never deleted, and not in the household's find list.
- **RT-P5** A list row shows up to two household tags, a picked one first, the rest as +n.
- **RT-P6** The same word is one tag whatever its case; a new tag is up to 24 characters.
- **RT-P7** Matching: within a group any picked tag matches; across groups all must.
- **RT-P8** A tag sits on the recipe, not on a version.

## Open questions

- **RT-Q1** Calorie band as a hand tag or derived from Recipe's stored per-serving kcal (nutrition is already recorded with a source)? Two figures could disagree.
- **RT-Q2** Recipe or version? The Edit mockup treats a tag change as part of a version; RT-P8 puts tags on the recipe.
- **RT-Q3** Planning: "pick a breakfast" is a filter; "one treat a week" is a rule, which needs a closed vocabulary (Kitchie `docs/adr/closed-vocabulary-for-ai.md`). The household's tag list could be that vocabulary, and the food-preferences frequency cap (F-series, `user-preferences/food-preferences.md`) could take a tag as its target.
- **RT-Q4** Should Cooking ideas and the assistant read the tags, and is a tag a hint or a hard filter?
- **RT-Q5** Who renames, merges and removes tags, and where.
- **RT-Q6** Desktop placement, drawn only if the idea goes ahead.

## Loading (DESIGN.md section 6)

The tag list would come with the recipe list (a few short words), so filtering happens in place with no new request (section 6a). Sheets are built on tap. Mockup files: `tags.css`, `tags.js`, both small, on top of the Recipe tab's own.
