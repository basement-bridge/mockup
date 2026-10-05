# Cooking right now

Status: captured from the owner, 5 Oct 2026. Mockup drafted: `fragments/mid-cook/`.

## Job

The person is in the middle of cooking.

## How we know the person is in this job

- The conversational API should drive it. If the person is talking to the AI, the conversation should give enough to infer they are mid-cook.
- If the information is not available today, it has to be surfaced as part of the tooling offered to the AI. This is an open requirement for the implementation. The mockup does not need to solve it.
- Intent matters most.
- The mockup does not model inference. The knowledge is carried into the implementation from here.

## What leads

- With the app or browser open next to a conversation with the AI, the default place is **the ingredients** of the recipe being cooked. Ingredients are what people cannot keep in their head for long.
- The AI should be able to tell the app which recipe is being cooked, and its ingredients, through the tooling. That should be easy, because the app can ask the AI.
- The recipe being cooked is not necessarily one in the vault. People sometimes wing a recipe with AI, and that is fine. Do not overreach to control that behaviour.
- From the tooling side: when the AI asks the app for a list of things, based on some search criteria or otherwise, it may just ask for everything.
- If the recipe also exists in the vault and the person has not altered it, browsing the saved recipe is allowed as a **secondary** action.

## What this job does not need

Left out of this view, not just quieter: where things are stored, freshness, exact stock levels, history. Only the aspects needed to cook are shown. (Principle from the owner: each job touches only the aspects it needs.)

## Mockup

`fragments/mid-cook/`: the ingredients-first view in two states, a recipe made up with the AI, and a saved recipe left unchanged.

## Open questions

- How the conversational API tells us the person is mid-cook, and which recipe. Owner: figure out how to surface it in the tools if it is not there.
- Whether the AI's recipe is ever saved to the vault from here. Not discussed.

## For the implementation

- The MCP tooling must carry: the recipe in play, and its ingredients.
- The default mobile view while mid-cook is ingredients, whether or not the recipe is in the vault.
- Saved-recipe browsing appears only when the recipe is in the vault and unaltered, and only as a secondary action.
