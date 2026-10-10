# Shopping without the app

Status: owner direction by voice, 10 October 2026, and owner review of the mockup the same day (decisions SL-D1 to SL-D16 in `../shopper-link.md`). Captured; mockup drafted and revised: `fragments/shopper-link/`. Phase one is Kitchie issue `basement-bridge/kitchie#479`; phase two (the receipt) is deferred. The job's name is a Proposal (10 Oct 2026, from Claude): the owner described the person, not a title.

## Job

Shopping for the household without being in the app. Someone is handed the list where the family already talks, gets those things in the house, and says what came home.

The owner: "Find people where they already naturally live." "Give me the list, I'm going to get those things in the house. And that's the extent of how engaged they're willing to be."

## How we know the person is in this job

They arrived by the link. The one-off link made when a member says someone else is shopping is the only way onto this page, so opening it is the whole signal: no sign-in, no guess, nothing to infer. The owner: "that link is just unique for that person."

The link also bounds the job: it lasts 48 hours ("That's good enough"), plus a fresh 48 from the first open if that gives more time (SL-D13). It does not finish when the person sends: one link stays usable for its whole window however many times it is opened, and each open shows the current state, so a second trip the same day reuses it (SL-D12).

## What leads

The list itself: what to get, and how much. Then one way to say "got it" per line (swipe right; left for "couldn't find it"), a small button to say what was got instead, a box for what was got that was not on the list, Undo always on screen, and one bottom button for the lines that cannot be bought (SL-D5 to SL-D10). Every action syncs at once; the household's list and Pantry follow as the shopper goes (SL-D2), and a second shopper on another link sees each answer, so nothing is bought twice (SL-D3). A long-press turns the list into checkboxes for the person who would rather tick everything and send once, with a confirm first (SL-D8).

The owner: "we can just get that person to tick off what they bought, and make any substitutes that they made decisions on, and if they don't tick it off, we kind of know that. Get a confirmation, of course."

Two modes in the end, ticking first: "One is that they just tick off what's on the list and do the substitutes. Let's start with it as an MVP." The second, scanning the receipt, is a later phase. The person "may choose neither" and that is accepted.

## What this job does not need

- An account, a sign-in, an install. The owner: "not force people to be in the system".
- The rest of the app: no header, no bottom bar, no Pantry.
- Proposal (10 Oct 2026, kitchie#479 P6): the household's name and its members' names.
- Proposal (10 Oct 2026, from Claude): what is left at home, who added a line.
- (Swipes were on this list. The owner's review put them on the shopper's page: SL-D5.)

## Mockup

`fragments/shopper-link/`: the whole loop as phones, with a live try-it of two shoppers and the member's screen. Part B is this job (swipe mode, the swap field, also got, multi-select and its confirm, "Won't be able to buy these", a line another shopper got, the link opened again, sent, "That link has finished"); Part A is the member's side of the same loop; Part C is the receipt mode, phase two, deferred.

Judgement call (10 Oct 2026, from Claude): everything the owner did not say is marked **Judgement call** (SL-J1 on) on the fragment page and in `docs/knowledge/shopper-link.md`.

## Open questions

Answered by the owner's review (10 Oct 2026), with the rest in `docs/knowledge/shopper-link.md`:

- Should the shopper's confirm put the items into the Pantry straight away, with no member tap? Yes, as they go (SL-D2); swaps by the add-item matching (SL-D11).
- Things bought that were not on the list: a free-text "also got" box, or wait for the receipt phase? The box, built now (SL-D10).
- Should a finished link be reopenable for a second shop the same day? Yes; one link, reused (SL-D12).
- 48 hours from sharing or from first opening? From sharing, plus a fresh 48 from first open if that gives more (SL-D13).

Answered by the owner on 10 Oct 2026 (typed): a "got" reaches the Pantry by itself at the listed amount (SL-J2, confirmed). Still open: SL-J3, SL-J11 and SL-J13, and the phase-two questions (see `docs/knowledge/shopper-link.md`, "Owner confirmations").

## For the implementation

- Detection is the route: `GET <base>/list/<token>` is this job and nothing else. An unknown, cancelled, withdrawn or ended token gets one neutral page, "That link has finished".
- The page works as a plain form with no script (that is multi-select: a checkbox per line, one Send); script adds swiping, instant sync, Undo and the live view. Requests, field names and line keys are in `docs/knowledge/shopper-link.md`.
- What the page loads and what waits (the receipt code, the camera input and the WebSocket load nothing until that mode is chosen) is on the fragment page (DESIGN.md section 6).
