# Home, search first (desktop): one view, a live contextual answer

Mockup: `fragments/desktop-home-search/` (idle, typing, no match, a person-blocked recipe, tonight planned or not, dim or collapse behind the list). Live: <https://basement-bridge.github.io/mockup/fragments/desktop-home-search/>. Builds on [home-detail-panel.md](home-detail-panel.md) (decisions 133 to 155, 288 to 291), [compact-home.md](compact-home.md) (this replaces its question), `fragments/desktop-home/` (the settled Dashboard) and `recipe-ideas/` (the ranking source). **Status: owner direction 22 Oct 2026 (voice, "build, build, build"); every choice below the owner did not state is a Proposal (HS-P) or an open question (HS-Q); nothing is decided beyond his words and nothing is built.** Series HS.

## Job

Same as Home: decide what to cook now and act on it, or find the thing you came for. The owner, voice, 22 Oct 2026: no Dashboard / Compact toggle on desktop, one Home view; the page is about **search being the focus**; the universal search bar drives it in two states. Idle: the curated answer to "what is worth your attention tonight" ("what grabs attention"). Typing: a live dropdown directly beneath the bar, no Enter, no separate results page, results **contextually relevant, not just name matches** (recipes you can make tonight, recipes that need a shop and what is missing, pantry items including going off and running low, shopping-list items, what is planned), grouped and ranked by context (fits tonight first; use-by pressure; who is eating and hard avoids; what is already planned). Everything behind the dropdown recedes: "otherwise it's widget on top of widget." Chips, status pills, near-miss cards and the Plan tonight button are dropped from the compact-style idea; every control earns its place.

## How we know the person is in this job

They are on Home at 1024px or wider. There is nothing to detect: the toggle is gone. Typing in the bar (or `/`, `Ctrl K`) is the signal that they want to find something rather than read the answer.

## What leads

Idle: the settled Dashboard, unchanged (the lead is today's plan, else the top idea; Other ideas; On the way out and Running low; This week). Searching: the dropdown, and nothing else. The first row is highlighted and Enter opens it.

## What this job does not need

No toggle, no remembered view per browser, no chips, no status pills, no near-miss cards, no Plan tonight button, no results page, no Enter to search, no Add buttons on result rows (the flyout has Add all to list), no Surprise me (it belongs to the Plan).

## Mockup

| Piece | What it shows |
|---|---|
| `index.html` | The frame, a state switch (idle, "chick", no match, person-blocked, "egg"; tonight planned or not; dim or collapse), notes, proposals, open questions, what loads |
| `home.css`, `home.js` | Default path: idle Home and the search field. Desktop-home's class names |
| `search.css`, `search.js` | On first focus or keystroke: the dropdown, the sample index, `rank()` (pure), keyboard |
| `flyout.js` | On the first result picked: the 400px lane, stand-ins for the recipe flyout and the item panel |
| `tools/desktop-home-search-check.mjs` | 97 checks: one Home, no dropped controls, what loads when, groups and ranking, recede and restore, keyboard, flyout lane, both themes, no hex colour |

## States and groups

Two states (idle, searching) and one transition: from the second character the list opens, the cards, This week, the rail and any open flyout fade to 14% and stop taking clicks; Esc or clearing the field puts idle back exactly as it was. Groups, in this order: On tonight's plan, Fits tonight (If plans change when tonight is planned), In your pantry, Needs a shop, On your shopping list, Left out for who is eating. At most 8 rows, one per matching group first.

## Decisions

Owner's (22 Oct 2026): HS-D1 one Home view, no toggle; HS-D2 two states, idle and typing; HS-D3 live dropdown under the bar, no Enter, no results page; HS-D4 contextual, grouped and ranked results as listed above; HS-D5 everything behind recedes; HS-D6 chips, status pills, near-miss cards and Plan tonight dropped from this idea; the Dashboard's cards stay as the idle content as they are; HS-D7 `/` or `Ctrl K` focuses, arrows move, Enter opens, Esc closes; HS-D8 picking keeps existing behaviours (a recipe opens the 400px lane, 290; an item opens the detail panel, 291); HS-D9 the contextual ranking is new, Recipe ideas ranking is the source for "fits tonight", no backend decisions here.

Proposals (silent): HS-P1 the Dashboard as it stands is the one Home; HS-P2 the list opens at 2 characters; HS-P3 dim to 14% plus inert, not collapse; HS-P4 fixed group order; HS-P5 at most 8 rows, "n of m" on a cut group; HS-P6 fits is at most 2 missing, three or more is Needs a shop; HS-P7 a recipe left out for a person still shows, last, dimmed, with who and why; HS-P8 tonight planned pins the meal first and renames Fits; HS-P9 only hard avoids remove a recipe, not the ideas pane's recent, snoozed or capped rules; HS-P10 first row highlighted, arrows wrap; HS-P11 Esc clears and returns to idle, a second Esc leaves the field, blur keeps the words; HS-P12 a quiet "ranked for tonight, who is eating" line; HS-P13 a shopping-list result goes to Shopping; HS-P14 no match offers Add to the shopping list (#807); HS-P15 both results land in the 400px lane over This week; HS-P16 `/` cue in the bar; HS-P17 matched letters accent-bold. Each is explained, with the cost of a wrong guess, on the page and in the PR.

## Open questions

HS-Q1 should the single Home be leaner (candidate: drop Other ideas; recommendation: keep for now); HS-Q2 dim or collapse (recommendation: dim); HS-Q3 where the ranking runs (client index, server per keystroke, or hybrid: not decided); HS-Q4 what a shopping-list result does; HS-Q5 one or two characters; HS-Q6 shown, hidden or named-only for a left-out recipe (and CH-Q5 for who may be left out); HS-Q7 eight rows.

## For the implementation

- Copy `home.css`, `search.css` and the markup the two scripts write; list each difference in the PR (AGENTS.md). Sample names stay in the scripts.
- Mocked vs real: today's search is name matching only (substring, plural folded; Pantry and Recipes). Ingredient matching and the whole of `rank()` are new. "Fits tonight" is the Cooking ideas ranking (`recipe-ideas/ideas.js` `rank()`, the shape of `suggest_meals`), which needs a stock match for every recipe that matches the words, not only the top idea. Use-by, low, list, plan, who is eating and hard avoids are Kitchie's, all already used by the Dashboard and the Plan. Recipe's `list_families` already matches `q` against title, ingredients and tags.
- Differences from the ideas pane: `rank()` hides recipes already planned, cooked in the last two days, snoozed or capped, because they are poor suggestions; search must not hide them (HS-P9).
- Loading: default Home loads nothing about search. Focus or first keystroke: the search script, its styles and the one search read. First pick: the flyout script and the one recipe or item read. Nothing on page load or scroll.
- Desktop only (1024px and up). Phone and tablet Home are unchanged and share no file with this folder; the phone search is `fragments/pantry-search/`.
- Check: `node tools/desktop-home-search-check.mjs [--shots=DIR]`.
