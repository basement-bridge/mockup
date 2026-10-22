# Mobile Home, option F: compact is the search bar

Mockup: `fragments/mobile-home-compact-search/` (seven phone frames at 390 x 844: live, compact at rest, full at rest, tapped, surfaced, typing, no match; a state switch for the time of day and the next meal). Live: <https://basement-bridge.github.io/mockup/fragments/mobile-home-compact-search/>. Follows [mobile-home-view.md](mobile-home-view.md) (options A to E, merged and unchanged; F is a sixth answer, not a replacement of them), [home-search.md](home-search.md) (desktop: the same pattern) and `recipe-ideas/` (the ranking). **Superseded in part by [option G](mobile-home-g.md) (23 Oct 2026): the pinned This week strip while the bar has the screen is dropped on mobile, the always-visible bar becomes a small button in the greeting row, and the remembered start goes.** F itself stays drawn and unchanged. **Status: owner direction 22 Oct 2026 (voice) after seeing A to E; every choice he did not state is a Proposal (MS-P) or an open question (MS-Q); nothing is decided beyond his words and nothing is built ("I don't want to build anything yet").** Series MS.

## Owner direction (voice, 22 October 2026)

Confused by the pull handle; he expected mobile compact to be a different, leaner thing, with the existing mobile Home (on the way out, running low, cooking ideas, This week) behind it. Compact is for mobile only (desktop is search-first, no toggle). **Compact is the search bar.** Tapping it expands and takes over, as on desktop; This week stays visible and active and everything else recedes ("I still like to see the week in focus... everything else behind that needs to go"). Tapped and idle (nothing typed, about 2 seconds): nothing happens beyond that, then the single most context-relevant thing surfaces on its own, not a list and not an empty box: "whatever is on the screen based on the time: around cooking time we don't want to show running low and whatnot". Typing: the same contextual dropdown as desktop (fits tonight, needs a shop, pantry items, shopping list), after 2 characters. The bar is always there, so no switch control and no hint.

## Job

Same as Home: decide what to cook now and act on it, or find the thing you came for. The bar serves both: tapped and quiet it answers "what now", typed it finds.

## What leads, and what is not drawn

At rest, compact: greeting, the bar, This week. Nothing else is drawn (not hidden: not built). At rest, full: today's Home with the bar added at the top and pinned. Bar tapped: the bar sticks to the top with Cancel, the greeting and cards are hidden, This week becomes a pinned seven-day strip (dot = planned, ring = today), the keyboard is up. Not needed: no switch, handle, icon or hint, no labelled toggle, no pills, no pins that expand, no microphone.

## States

Rest -> tapped (nothing yet) -> surfaced (one card, after the idle time) -> typing (dropdown from 2 characters; 1 character shows nothing). Emptying the field returns to tapped and the wait. Cancel, Esc, or tapping away with nothing typed returns Home exactly as it was, scroll included. Tapping away with words typed keeps the dropdown and drops the keyboard.

## What surfaces (one card, by window and next meal)

| Window | Not planned | Planned | Nothing fits | Hidden |
|---|---|---|---|---|
| Morning, before 11:00 | what goes off, with the recipe that uses it | tonight's meal | freezer meal, take it out | running low |
| Mid-day, 11:00 to 16:29 | the idea for tonight | the one thing running low | freezer meal | going off once tonight is settled |
| Cooking time, 16:30 to 19:59 | the idea that fits tonight | tonight's planned meal | freezer meal | running low and going off, always |
| After dinner, from 20:00 | an idea for tomorrow | tomorrow's planned meal | nothing fits tomorrow, Ask your assistant | running low and going off |

After dinner, "next meal" means tomorrow (`recipe-ideas/ideas.js` already says "Ideas for tomorrow" after 8 pm).

## Decisions

Owner's: MS-D1 compact is the search bar; MS-D2 tap takes it over, This week stays visible and active, the rest recedes; MS-D3 tapped and idle does nothing, then one most-context-relevant thing surfaces (time-based, not a list, not empty); MS-D4 no running low at cooking time; MS-D5 typing is desktop's contextual dropdown after 2 characters; MS-D6 no switch control, no hint; MS-D7 compact on mobile only; MS-D8 client-side only for any remembered choice.

## Proposals (MS-P, the owner was silent)

MS-P1 the windows (morning and after-dinner cut-offs exist in ideas.js; 11:00 and 16:30 are new); MS-P2 device local time; MS-P3 two seconds from the tap, restarted when the field empties; MS-P4 announce once per tap through a polite live region, never move focus, no animation under reduced motion; MS-P5 takeover (hide), not dim, Home restored where it was; MS-P6 one card by the ladder above; MS-P7 remembered start `kitchie.homeStart.<memberId>` = `full` | `compact`, default full, chosen in a Settings row, not on Home; MS-P8 Cancel text button, Esc, tap-away rules; MS-P9 six rows and smaller group caps; MS-P10 the week list becomes a strip, each day opens the Plan day; MS-P11 mid-day planned leads with running low (a purchase nudge); MS-P12 no mic, hint or coachmark, the placeholder teaches; MS-P13 typed results hide only hard avoids, the card uses the full ideas rules; MS-P14 phone width only; MS-P15 the bar pinned while Home scrolls. Each is explained, with the cost of a wrong guess, on the page and in the PR.

## Open questions

MS-Q1 is F instead of A to E (recommend yes); MS-Q2 default start (recommend Full); MS-Q3 two seconds idle or on tap (`?trigger=focus` compares; recommend the owner's two seconds, test on a phone, fall back to immediate); MS-Q4 fixed windows or the household's own cooking time (recommend fixed now); MS-Q5 should compact at rest show the card without a tap (owner's words say no); MS-Q6 mid-day planned: running low or tonight again; MS-Q7 where the start is chosen (Settings row, no choice at all, long-press); MS-Q8 Make it and Plan in place (recommend yes, DESIGN.md 6a); MS-Q9 what a day in the strip does; MS-Q10 after dinner, tomorrow or nothing.

## For the implementation

- Lift `home.css` and the markup `homeHtml()` writes: `.home[data-opens=full|compact][data-mode=rest|search]`. Existing names are kept (`.hi .tilec .th2 .ric .va .minis .ideas .idl .top2 .ph .why .k .acts .btn .idr .go .e .sub .bar`); new: `.srch .cx .sg .wk .wd`; the dropdown uses desktop's `.sres .g .i .e .t .rk .mt`. `.kbm` (keyboard stand-in) is mock only. Use `100dvh`, not a fixed frame height.
- `surface()` and `rank()` are pure functions in `search.js`. `rank()` is a copy in shape of desktop Home search's, itself the shape of `ideas.js` and `suggest_meals`; build one shared function, not two. `surface()` is new; its inputs are the clock window, tonight's plan, use-by and the freezer.
- The remembered start is `localStorage`, every call in `try/catch`; unavailable means full for this visit. No server read or write.
- Loading: default path is the page, `home.css`, `home.js` (compact at rest draws only the bar and the week). `search.css` and `search.js`, and the one read they need, are fetched on the first tap on the bar, during the two-second wait. Nothing on scroll. Results land in place.
- Check: `node tools/mobile-home-compact-search-check.mjs [--shots=DIR]`.
