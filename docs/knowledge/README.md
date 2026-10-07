# Knowledge

What we have learned and decided about the product, written so it can be carried from the mockups into the real implementation. Mockups are drafts; this folder is the reasoning behind them.

- `jobs-to-be-done/`: one file per job. See its README for the convention and the status of each job.
- `pantry-pull-row.md`: the Pantry top row (Filters and Add, pull for search, pull further to refresh): thresholds, timings, animations.
- `people-settings.md`: Settings > People split into Me and Household: what is on each, removing people, leaving with a typed name.
- `user-preferences/`: how the system learns about people and decides what to act on (evidence grades, thresholds). Start with `evidence-grading.md`; the tool contract is in `boundary-contract.md`.

Capture what the owner says. Do not add proposals of your own here. If something is a proposal, mark it as one and say who asked for it.

## Principle for every AI interaction

Closed vocabulary where the logic acts, free text everywhere else, and every decision-critical value surfaced explicitly to the AI (owner, 5 Oct 2026). Kitchie only needs the one or two values its logic acts on (for example an avoidance's reason: safety or other), and the person's own words stay free text. The full record and a checklist for new fields: Kitchie `docs/adr/closed-vocabulary-for-ai.md` (issue #238).

This repo is public. Keep personal details of real people out of it.
