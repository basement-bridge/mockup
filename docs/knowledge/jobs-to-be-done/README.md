# Jobs to be done

Every screen starts from what the person is here to do right now. Layout, and what leads, follow from the job.

## Convention

- One file per job: `docs/knowledge/jobs-to-be-done/<job>.md`. The slug is the job in plain words, lower case, hyphens.
- Same sections in every file, in this order: **Job**, **How we know the person is in this job**, **What leads**, **What this job does not need**, **Mockup**, **Open questions**, **For the implementation**.
- Write what the owner said, in their terms. Keep proposals out, or label them "Proposal" with a date.
- Not every job touches every aspect of an item. Each file lists only the aspects it needs. Anything else is left out of that view, not shown quietly.
- When a job changes, update its file and the mockup together, and link the mockup.

## Status

| Job | File | State |
|---|---|---|
| Cooking right now | [cooking-right-now.md](cooking-right-now.md) | Captured, mockup drafted |
| About to shop | – | Named, nothing captured yet |
| Shopping without the app | [shopping-without-the-app.md](shopping-without-the-app.md) | Captured (owner, voice, 10 Oct 2026); owner review the same day settled SL-D1 to SL-D16 (live updates, swipe and multi-select, link lifecycle); mockup revised; receipt scan deferred; detected by arriving through the one-off link |
| Scanning things in | [scan-in.md](scan-in.md) | Named, options drafted, nothing else captured |
| Planning the week | [plan-week.md](plan-week.md), [plan-week-ai.md](plan-week-ai.md) | Named; AI-led direction chosen, 16 owner decisions captured (9 Oct 2026) |
| Planning the week, on desktop | [plan-desktop.md](plan-desktop.md) | Four options drawn (10 Oct 2026); decisions 49 to 62 are proposals awaiting the owner |
| Editing one item, in a flyout | [item-edit-flyout.md](item-edit-flyout.md) | Layout A and shown key hints confirmed (11 Oct 2026); battery everywhere, the level rules, increase-only reset, category and unit chips with free text, the buy default and the use-by set confirmed by voice (decisions 94 to 101, 11 Oct 2026); shopping states and emoji picker still proposals (decisions 87 to 93) |
| Using things up | [use-up.md](use-up.md) | Named, options drafted, nothing else captured |
| Recipe tab (find, plan, cook, add, change) | [recipe-tab.md](recipe-tab.md), build handoff [recipe-tab-handoff.md](recipe-tab-handoff.md) | Drafted 10 Oct 2026 in four slices (flow, versions, photos, ideas), reconciled the same day. Owner locked nine decisions by voice that evening (R-O1 to R-O5, R-D29 to R-D32), then a second lot by typing: versions V1 to V6 (grouped by state; a try edits in place, a keeper asks; ask after every cook of a try; the assistant edits a keeper and the household reviews after; frozen revisions; changes only, git-like), six answers (not for us at once with undo, notes per version inherited, no delete and undo any time, dismissed drafts private, stars per member with the household derived, R-V1 approved) and photos P1 to P13 (Recipe owns them behind a blob port, two kept sizes, phone first with a server queue, the assistant uploads itself, 5-minute undo, new-files-only backups, loading order). Third lot by voice on 11 Oct 2026 (T1 to T9): Kitchie draws the UI and Recipe is headless (X16), Recipes a standalone tab (R-O6), notes at recipe or version level (N1), a cook photo a banner only by explicit choice, the favourite rule confirmed, one 4,000-character note cap, the ideas pane stays in Recipes with I-O4 defaulting to Kitchie, agents merge into `uat` and the owner deploys. Still open: the editing screen (assistant hand-off), XR1 to XR3 (Plan owners) and XR4 (preferences chat), infra disk and off-server backup, and the ideas pane review; mockups `recipe/`, `recipe-versions/`, `recipe-photos/`, `recipe-ideas/`; nothing built or filed |
| Cook from one main thing | – | Named, nothing captured yet |
