# Mobile Home G, revisions: urgency-driven slot 2, fit-to-height chevrons

Mockup: `fragments/mobile-home-g-revisions/` (four options A to D in phone frames; switches for phone height short/medium/tall = 600/740/844 and data: nothing urgent, one expires today, expired and several, nothing at all, only running low; a switch for the Running low rule; a report under each frame measured from the drawn frame). Live: <https://basement-bridge.github.io/mockup/fragments/mobile-home-g-revisions/>. Revises [mobile-home-g.md](mobile-home-g.md); fragment G is unchanged. Issue: kitchie#1055. **Status: owner direction 23 Oct 2026; every choice he did not state is a Proposal (MR-P) or a question (MR-Q); nothing is built.** Series MR.

## Owner direction

1. Cooking ideas has two tiers: a hero card (single best idea, Make it and Plan) always first and never touched, then other ideas as compact line items (2 or 3).
2. Smart defaults replace "always collapsed". Ladder: hero always; the most time-critical thing earns the privileged second slot above the fold, expanded. On the way out items expiring today or already expired take it, ahead of other ideas and ahead of Running low. If that content needs the room, other ideas gives way. Nothing urgent: the slot goes to other ideas (or stays absent).
3. Below the reserved top section everything is normal scrolling content (not a failure): other ideas rows, then both chevrons, each opening and closing by tap. Open caps: On the way out 1 or 2 items with "+N more"; Running low everything, uncapped.
4. The default open or closed state is driven by what fits above the fold on the phone's height and by urgency: taller phone, more open; short phone, hero and urgent only.
5. Locked (unchanged): cooking ideas first under the greeting; chevron sections absent when empty; small right-aligned search control in the greeting row (takeover drops pinned This week); no This week on mobile Home; Recipes parked.

## The four options

- **A. Promote.** The urgent section moves into slot 2 as an open, tinted card with a word badge. Other ideas follow as rows and fall below the fold when the card needs the room. Only the cap and the number of other ideas change with height.
- **B. Strip on the hero.** A one-line strip fused to the hero's bottom edge; tap opens it in place. It opens by itself only if two other ideas still fit above the fold, otherwise stays one line (53px).
- **C. Fit to the height.** Every part is a chevron section (Other ideas too). They open in priority order until the height is spent; the urgent one always opens.
- **D. Badge, nothing moves.** Fixed order; a word badge on the chevron; only the top urgent section opens, and only if it fits whole. Does not promote, so it departs from direction 2 by design.

## Recommendation

**A, with C's height rule on the chevrons below it.** A is the owner's rule as stated. B is the fallback if a 190px card on a short phone is too much. C is worth trying for tall phones. D is the calmest (nothing moves) and the least like what he asked for.

## Proposals (MR-P), with what a wrong guess costs

- MR-P1 Urgent = due today or already past (days <= 0); tomorrow is not urgent. **Guess.** Cost: a household wanting a day's notice sees no promotion until the day; one constant.
- MR-P2 Running low "critical" = none left (level or quantity zero). **Guess.**
- MR-P3 Caps: On the way out 2 items when open, 1 on the short phone, most urgent first (expired, today, then date), "+N more . View all"; Running low uncapped. **The 1 and the 2 are guesses.**
- MR-P4 Phone heights 600 / 740 / 844 (small phone or browser bars showing / fewer bars / the owner's 390 x 844). **Guesses.** The fold is the frame minus the 68px bottom bar and 2px border. Other ideas shows 2 rows on short, 3 otherwise. **Guess.**
- MR-P5 A part is above the fold only if all of it is; the model never opens a section the fold would cut (except A's and C's urgent section, which always opens).
- MR-P6 Urgency is in words (badge, "Expired yesterday", "Today"), never colour alone.
- MR-P7 Other ideas gives way by moving: rows below the fold in A, B, D; a chevron section in C.
- MR-P8 The chevrons below slot 2 stay in fixed order (On the way out, Running low); G's time-of-day `order()` is not redrawn (MR-Q4). The mock is fixed at mid-day, tonight not planned.
- MR-P9 Smart defaults are worked out once when Home opens and not re-worked while it is on screen (no jumping); taps are kept for the visit only.
- MR-P10 The hero is never built on an expired item (food safety); `suggest_meals` must enforce it.
- MR-P11 B's rule (two other ideas still fit) and D's rule (the whole open section fits) are guesses.
- MR-P12 Height numbers in `K` (hero 236, other-idea row 49, closed chevron 57 plus 8 margin, item row 44, ...) are measured from this render and checked by `tools/mobile-home-g-revisions-check.mjs` within 8px; in the app they are measured, not constants.

## Questions (MR-Q), with a recommendation

- **MR-Q1 Should Running low ever outrank On the way out for the second slot?** Recommendation: only if nothing in On the way out is urgent and Running low has something at zero. Drawn with the switch (Zero outranks / Never outranks). Cost: on such a day Other ideas is one row lower.
- MR-Q2 Which option? A with C's fit rule on the chevrons.
- MR-Q3 Is tomorrow urgent after 20:00? Recommendation: no.
- MR-Q4 Does G's moment-based chevron order still apply below slot 2? Recommendation: yes.
- MR-Q5 Remember a manual open or close? Recommendation: no.
- MR-Q6 May an expired item feed the hero? Recommendation: never.

## For the implementation

- Lift `plan()` and `facts()` (pure), the markup in `homeHtml()`, `revisions.css` beside G's `home.css`. Measure the fold once with `visualViewport.height` minus the bottom bar.
- Loading: default path is the page, `home.css`, `revisions.css`, `revisions.js`; a closed section's body is written on first open; nothing on scroll. The takeover and `search.js` are G's, not loaded here.
- Check: `node tools/mobile-home-g-revisions-check.mjs [--shots=DIR]`.
