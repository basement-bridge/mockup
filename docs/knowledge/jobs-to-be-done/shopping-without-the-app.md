# Shopping without the app

Status: owner direction by voice, 10 October 2026. Captured; mockup drafted: `fragments/shopper-link/`. Phase one is Kitchie issue `basement-bridge/kitchie#479`. The job's name is a Proposal (10 Oct 2026, from Claude): the owner described the person, not a title.

## Job

Shopping for the household without being in the app. Someone is handed the list where the family already talks, gets those things in the house, and says what came home.

The owner: "Find people where they already naturally live." "Give me the list, I'm going to get those things in the house. And that's the extent of how engaged they're willing to be."

## How we know the person is in this job

They arrived by the link. The one-off link made when a member shares the shopping list is the only way onto this page, so opening it is the whole signal: no sign-in, no guess, nothing to infer. The owner: "that link is just unique for that person."

The link also bounds the job: it lasts 48 hours ("That's good enough"), and once the person has confirmed, it has finished.

## What leads

The list itself: what to get, and how much. Then one way to say "got it" per line, a way to say what was got instead, and one button to send it back.

The owner: "we can just get that person to tick off what they bought, and make any substitutes that they made decisions on, and if they don't tick it off, we kind of know that. Get a confirmation, of course."

Two modes in the end, ticking first: "One is that they just tick off what's on the list and do the substitutes. Let's start with it as an MVP." The second, scanning the receipt, is a later phase. The person "may choose neither" and that is accepted.

## What this job does not need

- An account, a sign-in, an install. The owner: "not force people to be in the system".
- The rest of the app: no header, no bottom bar, no Pantry.
- Proposal (10 Oct 2026, kitchie#479 P6): the household's name and its members' names.
- Proposal (10 Oct 2026, from Claude): what is left at home, who added a line, swipes.

## Mockup

`fragments/shopper-link/`: the whole loop as phones. Part B is this job (the list, the swap field, the confirm step, sent, "That link has finished"); Part A is the member's side of the same loop; Part C is the receipt mode, phase two, not built.

Proposal (10 Oct 2026, from Claude and kitchie#479): everything the owner did not say is marked **Proposal** on the fragment page and in `docs/knowledge/shopper-link.md`.

## Open questions

Listed with what a wrong guess costs in `docs/knowledge/shopper-link.md` and on the fragment page. The ones that shape this job most:

- Should the shopper's confirm put the items into the Pantry straight away, with no member tap?
- Things bought that were not on the list: a free-text "also got" box, or wait for the receipt phase?
- Should a finished link be reopenable for a second shop the same day?
- 48 hours from sharing or from first opening?

## For the implementation

- Detection is the route: `GET <base>/list/<token>` is this job and nothing else. An unknown, cancelled or finished token gets one neutral page, "That link has finished".
- The page works as a plain form with no script; script adds keeping the ticks on the phone until Send, and the confirm step in place. Field names and line keys are in `docs/knowledge/shopper-link.md`.
- What the page loads and what waits (the receipt code, the camera input and the WebSocket load nothing until that mode is chosen) is on the fragment page (DESIGN.md section 6).
