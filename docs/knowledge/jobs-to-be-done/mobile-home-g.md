# Mobile Home, option G: cooking ideas first, search in the greeting row

Mockup: `fragments/mobile-home-g/` (nine phone frames at 390 x 844: live, rest, both cards open, tapped, surfaced, typing, no match, plus Pantry and Shopping to show the search button in the same place; switches for time of day, next meal, and which collapsed cards have content). Live: <https://basement-bridge.github.io/mockup/fragments/mobile-home-g/>. Follows [mobile-home-compact-search.md](mobile-home-compact-search.md) (F, unchanged), [mobile-home-view.md](mobile-home-view.md) (A to E, unchanged), [home-search.md](home-search.md) (desktop) and `recipe-ideas/`. **Status: owner direction 22 Oct 2026 (voice, after viewing F on his phone); every choice he did not state is a Proposal (MG-P) or an open question (MG-Q); nothing is built.** Series MG.

## Owner direction

1. First slot is always Cooking ideas, right under the greeting, permanently, no reordering ("we probably don't want this to be too jumpy"); Make it and Plan stay on the lead idea; labelled by when it applies (today, or coming up: the day or the next day).
2. On the way out and Running low sit underneath, collapsed by default behind a chevron ("by default it should not steal all the space"). Nothing in it means the card does not exist, no empty chevron. When both exist their order follows the same situational logic as the idle search card (time of day, moment).
3. Search is small and quiet, thumb-reachable, in the greeting row on the right, matching Pantry's button, in the same place on all screens. Full takeover only on tap; everything recedes with the same weight; no pinned This week on mobile. About 2 s idle: the single most context-relevant card (no running low around cooking time; mid-morning with a plan but nothing bought, what needs buying). Two characters: desktop's contextual dropdown.
4. Recipes tab is parked ("we want to drive recipes through AI"); not changed here.
5. Out of scope: behaviour-pattern intent detection ("about to go shopping", "a day into planning"). Not built; an open item.

## Job

Same as Home: decide what to cook now and act on it, or find the thing you came for. Cooking ideas answers the first; the magnifier the second; the two cards are glanceable context one tap away.

## Order of the two cards (`order()`)

Morning or mid-day with a plan missing things: Running low, then On the way out. Morning or mid-day otherwise: On the way out, then Running low. Cooking time (16:30 to 19:59): Running low, then On the way out (on the way out is pointless when about to cook). After dinner: On the way out, then Running low. A card with nothing in it is never returned, so never drawn.

## What surfaces in the takeover (`surface()`)

As F, plus: a plan that is missing things at morning and mid-day brings up what needs buying; mid-day planned shows running low only if something is low; morning unplanned shows what goes off only if something is going off. Cooking time never shows running low or going off. After dinner means tomorrow.

## Decisions (owner's)

MG-D1 Cooking ideas always first, never reordered; MG-D2 labelled today or coming up; MG-D3 the two cards collapsed by default, a chevron; MG-D4 absent when empty; MG-D5 their order follows the moment; MG-D6 search a small control in the greeting row, right, Pantry's spot, same on all screens; MG-D7 takeover on tap only, everything recedes equally; MG-D8 no pinned This week on mobile; MG-D9 one card after about 2 s idle, time and moment aware; MG-D10 typing shows desktop's dropdown from 2 characters; MG-D11 Recipes parked.

## Proposals (MG-P) and open questions (MG-Q)

Proposals MG-P1 to MG-P19 and questions MG-Q1 to MG-Q8, each with the cost of a wrong guess, are on the fragment page and in the PR. Headlines: windows 11:00 / 16:30 / 20:00 (P1); collapsed every visit, not remembered (P8, Q3); a collapsed card shows title, two names and a count (P9); two Other ideas kept (P10, Q6); greeting row sticky (P12); This week not drawn on mobile (P14, Q2); F's remembered start dropped (P17). Recommendations: Q1 yes, Q2 none for now, Q3 no, Q4 keep both collapsed, Q5 two seconds then test, Q6 keep two, Q7 keep the owner's corner.

## For the implementation

- Lift `home.css` and `homeHtml()`: `.home[data-mode=rest|search]`; existing names kept; new `.hbar .sbtn .srch .cx .fold .tog .chv .n .fb .sg`. `.hbar .sbtn` should be one component with Pantry's row. `order()`, `lead()`, `surface()` are pure functions; share `rank()` with desktop rather than copy.
- Loading: default path is the page, `home.css`, `home.js`; a collapsed card's body is written on first open; `search.css` and `search.js` and their one read are fetched on the first tap on the magnifier. Nothing on scroll.
- Check: `node tools/mobile-home-g-check.mjs [--shots=DIR]`.
