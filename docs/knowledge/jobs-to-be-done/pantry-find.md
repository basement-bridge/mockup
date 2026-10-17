# Finding something in the Pantry (phone)

Owner ask 17 Oct 2026 (voice). Notes and decisions: [../pantry-search.md](../pantry-search.md). Mockup: `fragments/pantry-search/`.

## Job

"Is there any X, and where?" Someone is looking at the Pantry and wants one thing: to check it is there, or to find where it is, before deciding to buy or cook.

## How we know the person is in this job

They reach for the magnifier (a tap) or pull the list down a little (a shallow pull). Nothing else is inferred: search is always one deliberate action away, never opened for them.

## What leads

One button at the far right of the top row, next to Add, and a bar that takes the whole row so there is room to type. The list narrows as they type. The keyboard's Search key puts the keyboard away so the result can be read.

## What this job does not need

Filters and Add (hidden while the bar is open), the sort, the chips' counts, the item count.

## Mockup

`fragments/pantry-search/app.html` (phone), `desktop.html` (desktop, no-results only). States: closed, flyout, open, typing, no results, shallow pull, deep pull (refresh, unchanged); and, for #807, the no-results pair, added, already on the list, a used-up item.

## When nothing is found (Kitchie #807)

Not finding it usually means "we need to buy it" or "I am putting it away now". The block offers both, next to each other: **Add as a new item** (unchanged) and **Add to shopping list**. The second puts the typed words on the list in place, says so, and offers Undo; the search stays open and the words are kept. No quantity is asked. Decisions PS-S1 to PS-S15 and open questions PS-SQ1 to PS-SQ9 are in `../pantry-search.md`.

## Open questions

How the bar closes and whether closing keeps the query (PS-Q1); Filters at the left versus today's row (PS-Q2); the custom-view row (PS-Q3).

## For the implementation

The row is the existing `.prow`; the bar is the existing `.spill`, now the whole row. Build differences are listed in `../pantry-search.md`, "For the build".
