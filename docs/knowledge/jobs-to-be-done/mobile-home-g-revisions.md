# Mobile Home G, revisions (round 2): urgency ranking, countdown window, drag to reveal

Mockup: `fragments/mobile-home-g-revisions/` (three options A to C in phone frames; switches for phone height short/medium/tall = 600/740/844, nine pantry states, the countdown window, drag-to-reveal on or off, and a simulated trip away and back). Live: <https://basement-bridge.github.io/mockup/fragments/mobile-home-g-revisions/>. Revises [mobile-home-g.md](mobile-home-g.md); fragment G is unchanged. Issue: kitchie#1055. Round 1: PR #281. **Status: owner decisions of 23 Oct 2026 applied; everything he did not state is a Proposal (MR-P) or a question (MR-Q), each guess labelled; nothing is built.** Series MR.

## Decisions (owner, 23 Oct 2026). Authoritative for the build.

- **D1 Three equal chevron sections,** each absent when empty and optional (space permitting): **More ideas** (the hero's own extension; no longer a separate always-visible block), **On the way out**, **Running low**. The hero (Cooking ideas, Make it, Plan) is always first and never touched.
- **D1b More ideas open is the hero's continuation (owner decision, 23 Oct 2026, MR-P26).** Open, it has no label or header: its rows flow directly under the hero as one card. The chevron header (title, count, preview) exists only when it is closed, as the hint that more is there. Options A, B and C alike. On the way out and Running low keep their labelled headers.
- **D1c The hero reads like a passport profile (owner decision by voice, 23 Oct 2026, MR-P27, kitchie#1095; phone only).** The picture (or the chef-hat placeholder) sits at the left with 14px padding. The eyebrow ("Planned for today · Fri 23" or "Today · Idea for tonight") is the top line, above the picture and the name. The name is beside the picture, two lines at most. The meta line ("25 min · on the plan, nothing to decide") stays the last line of the text block, wording unchanged. Make it and Plan are unchanged. **Why is the app's information icon** (Recipe tab `ICON_PATHS.info`, the Why button on an idea in `recipe-tab/ideas.ts`; also the photo hints and notes), a 44px round button, accessible name "Why this idea", same action as before. The expired or off-today warning stays a full-width note under the head row. Not taller than the build's old hero (the picture no longer has its own row).
- **D2 Urgency is consequence plus neglect,** not raw stock or date. On the way out becomes more urgent the longer it has been ignored (expiring, not on a plan, nobody acted). Running low is urgent only when something rides on it (a planned meal needs it) or it is at zero; "low, nothing riding on it" is background. Running low can take slot 2 ahead of On the way out when its consequence is worse. **The time-of-day chevron order is replaced entirely by urgency ranking.**
- **D3 A global sliding countdown window in hours.** Anything going off within N hours is urgent even if its date is tomorrow. The date label stays honest: tomorrow is never labelled "today". N is a visible control on the page; default 6 h is a **guess**.
- **D4 Expired-ingredient warning.** Any cooking idea (hero included) using an expired or off-today ingredient stays eligible but carries a visible alarming warning: red alert mark plus words ("Check this is still OK", "uses chicken that goes off today"). Expiring stock also surfaces as its own idea in More ideas.
- **D5 Default open or closed = urgency plus fit to height.** Chevrons open in rank order until the phone height is spent; the urgent one always opens; scrolling never changes state. Caps when open: On the way out 1 to 2 items plus "+N more"; Running low uncapped.
- **D6 Session continuity.** A manual open or close is remembered while the person hops between Home, Pantry and Recipes in one sitting; after a real gap away (default 30 min, a **guess**) it resets to the computed default.
- **D7 Drag to reveal.** Pointer or thumb down on a chevron header and dragging UP opens that section; continuing the same drag into the next header opens that one too, one motion, no layout shift under the thumb (height animates, scroll anchoring kept). Plain scrolling elsewhere is untouched; tapping a header also toggles. `aria-expanded` and a non-gesture path; `prefers-reduced-motion` honoured; a switch so it can be compared with tap-only.
- **D8 Kept:** search control in the greeting row, takeover per G, no This week on mobile.

## The rules the mockup implements (the spec)

Scores (all constants are guesses, MR-P13 to P15):

| Thing | Score |
| --- | --- |
| Item expired (hours < 0) | 60 |
| Item inside the window (hours <= N) | 50 |
| Item inside 48 h | 20 (10 if on a plan) |
| Item later | 5 |
| Neglect | + 15 per day ignored, max 3 days, none if on a plan |
| Running low: a planned meal needs it and it is gone | 90 |
| Running low: a planned meal needs it | 55 |
| Running low: gone | 50 |
| Running low: plain low | 5 |
| More ideas | 30 |

A section scores its worst item. **50 and up is urgent** (More ideas never is). Sections rank by score, ties On the way out, Running low, More ideas. The hero is first. Within On the way out, items sort worst first (score, then hours).

Open rule: in rank order a section opens if it fits whole above the fold (height measured once on open); an urgent section always opens (A, C); the first non-urgent section that does not fit stops the rest (so opens are a prefix of the ranking). A taller phone never opens less.

Dates: label from the calendar day: `Today 17:00`, `Tomorrow 06:00`, `in 3 days`, `Expired yesterday`, `Went off today 09:00`. The window only affects urgency and the badge ("2 in 12h"), never the label.

Warning: hero or More ideas row whose ingredient is expired: red alert mark + "Check this is still OK: uses milk that went off yesterday" (row: "Check first"). Goes off today by calendar: same mark + "Uses chicken that goes off today at 17:00" (row: "Off today"). Tomorrow never warns, even inside the window.

More ideas rows: expiring stock (inside 48 h, not on a plan, not the hero's) as its own idea, worst first, then fillers; 3 rows (2 on short).

Session: per-section manual open or close kept until `now - left >= gap` (30 min); then dropped and defaults recomputed. A data refresh does not reset. Clock injected (`MR.session(gap)`; `leave(t)`, `enter(t)` returns true when reset).

Gesture: pointer events (mouse, touch, pen, one path). Arms after 8 px of mostly upward movement. Opens the pressed section, then each closed header whose centre lies between the pointer and the press point. Bodies grow below the header under the finger. A drag only opens; closing is a tap, Enter or Space. After a drag the click is swallowed. Only headers get `touch-action:none`, only while the gesture is on.

## The options (D retired)

All three share the ranking, the open rule and the badge; they differ in how an urgent section is shown.

- **A. Tinted card.** Urgent sections are tinted, carry a word badge, always open. Round 1: promoted card plus other-ideas rows. Now More ideas is a chevron.
- **B. Strip on the hero.** The top-ranked urgent section is a one-line strip fused to the hero; opens in place only if the height allows (the one option where an urgent section may stay closed). Round 1: strip opened if two other ideas fit.
- **C. Plain chevrons.** Three equal sections; urgency is order, word badge and default open; no tint. Round 1: fit to the height.
- **D. Retired.** "Fixed order, nothing moves" contradicts D2 (urgency ranks, time-of-day order dropped) and D5 (open by priority and height). Its word badge lives on in all three.

## Recommendation

**C, plain chevrons.** It is D1 and D5 as written and the least to learn; keep the word badge. Add A's tint only if testing shows an urgent section being missed. B is the fallback if a tall open section above everything is too much on a short phone. Risk to test on a real phone before building: the gesture makes headers dead to a scroll that starts on them (MR-Q9).

## Proposals (MR-P)

Round 1, status now:

| ID | Round 1 | Now |
| --- | --- | --- |
| P1 urgent = today or past | guess | **Replaced** by P13 and D3 |
| P2 low critical = none left | guess | **Replaced** by P14 (or a planned meal needs it) |
| P3 caps 2 (1 short) | guess | Kept (P20) |
| P4 heights 600/740/844; More ideas rows 2/3 | guess | Kept |
| P5 above the fold only if whole | | Kept |
| P6 urgency in words | | Kept |
| P7 other ideas gives way by moving | | **Replaced**: More ideas is a ranked chevron |
| P8 fixed chevron order | | **Replaced** by ranking (D2) |
| P9 defaults computed once; taps kept for the visit only | | **Replaced** by P21 (kept within a sitting) |
| P10 hero never on expired | | **Reversed** by D4 (eligible with warning) |
| P11 B and D fit tests | guess | B rewritten (P23); D retired |
| P12 `K` heights measured, 8 px | | Kept, re-measured (`openHead` 50, `heroWarn` 14) |

New (each a guess unless noted, with the cost of a wrong guess):

- **MR-P13 Item scores and neglect** as in the table. Cost: a section ranks one place off; constants in `scoreSoon()`.
- **MR-P14 Running low scores** 90 / 55 / 50 / 5. Cost: "gone, nothing riding" (50) ties the lowest urgent; it outranks On the way out only at 55 or 90.
- **MR-P15 More ideas = 30; ties On the way out, Running low, More ideas.** Effect: a calm On the way out (under 30) sits below More ideas.
- **MR-P16 Window global, default 6 h, 0 to 48 on the page.** A plan does not remove window urgency (MR-Q7).
- **MR-P17 "Ignored" = days an unplanned item has sat in On the way out.** The app needs a first-listed time and an "acted" event.
- **MR-P18 Warning rules** as above; "off today" gets the same alert mark as expired, with different words (MR-Q12).
- **MR-P19 More ideas content:** use-up ideas first, then fillers, 3 rows (2 on short).
- **MR-P20 Caps** unchanged: On the way out 2 (1 short) plus "+N more", Running low uncapped.
- **MR-P21 Session:** per section, gap 30 min (guess), no reset on data refresh.
- **MR-P22 Drag:** arm at 8 px (guess); opens bottom to top (the next header the finger meets is the one above); a drag never closes.
- **MR-P23 B** is the only option where urgent may stay closed; strip names what is urgent either way.
- **MR-P24 Mock clock** is 14:00 on a Friday, tonight not planned. Guess; sample hours live in `DATA`.
- **MR-P25 Hero choice is data** in the mock (`hero:`); in the app `suggest_meals` chooses and only the warning is derived from the ingredient's date.
- **MR-P26 More ideas open = the hero's continuation, no label (OWNER DECISION, 23 Oct 2026).** Closed: the chevron header stays in its ranked slot (MR-P15) with title, count and preview. Open: the header is gone; the extra idea rows sit directly under the hero in one card (same width, hero's bottom corners squared, a divider between), wherever More ideas ranks, so opening it from a lower slot moves it up under the hero. The collapse control is the SAME button, drawn last as a 44 px chevron-up bar on the card's bottom edge (flex order, so focus, `aria-expanded` and `aria-controls` never leave it; its name is "Hide more ideas"). Tap, Enter, Space and the drag all still work; a drag only opens. After a tap the moved card is scrolled into view; during a drag the sections above its old slot stay put. Row warnings (expired, off today) are unchanged; session memory, urgency ranking, fit-to-height (the open cost is rows + bar, no header or gap) are unchanged. In B the open rows sit between the hero and the strip and the strip fuses to the bottom of that stack. Cost: one section changes place on open; the ranked slot is only the closed position.
- **MR-P27 Hero passport layout (OWNER DECISION, 23 Oct 2026, voice).** Grid: the eyebrow row spans both columns, then picture (64px, `--r-ctl`) and name + meta side by side (name `line-clamp:2`; name and meta centred as one block against the picture), then the warning note full width when there is one, then the buttons. `.t` is `display:contents` so the eyebrow can sit above the picture without changing the markup order the desktop card uses. Why: one `.ib` button with the info glyph. Model heights re-measured: `K.hero` 250 (was 236), `K.heroWarn` 37 (was 14; the mock's note wraps to two lines at 390). The hero view is a page switch (Idea, Idea with photo, Planned today with the long name, Planned with photo), not data. Defaults taken without asking: 64px picture (same as the desktop card), the info button sits right after Plan (not pushed to the edge), the placeholder is the chef-hat the app draws today.

## Questions

Round 1, answered by the owner (23 Oct 2026):

- MR-Q1 Should Running low outrank On the way out for slot 2? **Yes, when its consequence is worse** (D2): drawn in "Running low rides on a plan" (90 vs 60).
- MR-Q2 Which option? Updated: C (see Recommendation).
- MR-Q3 Is tomorrow urgent after 20:00? **No, but the hour window supersedes** (D3): tomorrow 06:00 is urgent at a window of 18 h or more.
- MR-Q4 Does G's moment-based chevron order still apply? **No, dropped** (D2).
- MR-Q5 Remember a manual open? **Yes, within a sitting** (D6).
- MR-Q6 May an expired item feed the hero? **Yes, with a warning** (D4).

Open, with a recommendation and the cost of a wrong answer:

- **MR-Q7 Does a plan neutralise the window?** Drawn: no (literal "anything within N hours"); a plan only removes neglect and lowers the 48 h tier. Recommendation: neutralise it only when the planned meal is before the expiry; needs the plan's date in the data. Cost: a planned item still pushes On the way out up the ranking.
- **MR-Q8 Should dragging down close a section?** Recommendation: no; closing is a tap, so one gesture never undoes another. Cost: closing three takes three taps.
- **MR-Q9 Headers are dead to scrolling** (touch-action none), so a thumb scroll that starts on a 57 px header does not scroll. Recommendation: accept, test on a real phone; the gesture switch is the escape. Cost: occasional "stuck" scroll.
- **MR-Q10 Is 6 h right, and should the window follow dinner time** (for example until bedtime)? Recommendation: fixed N, owner picks (8 h may suit a 17:00 shop). Cost: late-evening items rank late.
- **MR-Q11 What counts as acting on an ignored item?** Recommendation: planned, cooked with, or dismissed; opening Home does not. Cost: neglect resets too easily or never.
- **MR-Q12 Should "off today" (not yet expired) share expired's alert mark?** Drawn: yes, different words. Recommendation: keep; the owner asked for an alarming mark on both. Cost: the hero is flagged most days a meat item is due.
- **MR-Q13 What ends a sitting besides 30 min away?** Recommendation: app killed or sign-out also ends it (store the leave time in memory plus session storage). Cost: an old choice survives a relaunch.
- **MR-Q14 Which option?** Recommendation C; see above.
- **MR-Q15 Should More ideas, when ranked first, visually fuse to the hero?** **Answered by the owner (MR-P26):** yes, whenever it is open, in every rank position; closed it is the chevron header.

## For the implementation

- Lift `facts()`, `plan()` and the score functions (pure), `homeHtml()`, `setOpen()`, `bindDrag()`, `session()`, and `revisions.css` beside G's `home.css`. Measure the fold once with `visualViewport.height` minus the bottom bar. `K` is the model's guess of each part's height, checked within 8 px.
- Loading: default path is the page, `home.css`, `revisions.css`, `revisions.js`; a closed section's body is written on first open; nothing is fetched on scroll or drag. The takeover and `search.js` are G's, not loaded here.
- Accessibility: every header has `aria-expanded`; a polite live region announces opens and closes; touch targets 44 px; reduced motion skips the height animation and all transitions.
- Check: `node tools/mobile-home-g-revisions-check.mjs [--shots=DIR]` (needs a server on :8123). It restates the scores independently and asserts ranking, window, warnings, caps, fit, drag (mouse and touch), session, reduced motion, and MR-P26 (no label when open, directly under the hero, one card, collapse bar, focus and aria kept, B strip, drag, session).
