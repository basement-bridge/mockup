# Add item: an amount or a level (Kitchie #1047)

**Status: options drawn 22 October 2026, nothing decided, nothing built.** Mockup `fragments/add-amount-or-level/`, check `tools/add-amount-or-level-check.mjs`. Drawn from Kitchie `uat` at `83180cc` (v0.159.0). Revisits mockup decisions 78 and 128 ("Add has no Level control"), which were the owner's reading of Add on 11 and 12 October.

## What the owner said (voice, 22 October 2026, closely paraphrased)
When someone adds an item they are asked for a number of units. Some people, in some cases, will want to give a level instead (the level idea already exists). They might choose between the two, or be given one or the other. Choosing is preferred; how it looks is not known. Investigate, draw mockups, follow governance.

## What the code does today (read, not run)
- Add draws Item, Amount (Quantity editor, then Minimum stock once there is a unit), Where, Use by. No Level (`add-form.ts`, `levelPickHtml` only when `edit`).
- **The web Add route already accepts `level`** and stores it as the person's own (`web-edit.ts`, add branch). A build is a control, not a new field or route.
- Level and quantity are two stored objects that never overwrite each other (R25).
- **The shopping list reads a level only when there is no exact amount** (`store.ts`, loose-level pass): a level-only item, or one with free words, at Running low or Out is listed as "running low" or "out" with no minimum; a level next to an exact amount is ignored (the amount decides, only against a minimum). Mockup decision 101 ("a level never adds an item") is about the exact-amount case and the buy default; it does not contradict this.

## Options (all drawn; A recommended)
| | What it is | Taps to a level | Cost |
|---|---|---|---|
| A | Two-way switch Quantity / Level at the top of Amount | 2 | One more row |
| B | Quantity and level together, joined by "or" | 1 | Tallest form; invites a level beside an exact amount, which the list ignores |
| C | Add unchanged; a ghost "Set a level" beside "Add unit", swapped in place | 2 | Level is easy to miss |
| D | A device setting decides; Add shows only that one | 1 after setup | One rule for every item; counting moves to Edit |

Not drawn: choosing by pattern-matching the name or location. #192 rules that out (category and location are the household's free text).

## Proposals (mockup's own; owner silent)
- AL-P1 Recommend A; C is the runner-up if Add must stay as quiet as today. D drawn because the owner floated "one or the other", not recommended.
- AL-P2 Default Quantity (as Add is today).
- AL-P3 Only the side showing is saved; the other side's typing stays in the form while it is open.
- AL-P4 The last choice is remembered on this device only (design principle: preferences are client-side).
- AL-P5 No square preselected. Level showing and no square saves the name only; the cue reads "Automatic".
- AL-P6 No Minimum stock on the Level side.
- AL-P7 Tapping the picked square again, or the circular arrow, takes it back (decisions 111, 112 pattern). Words: Quantity, Level.
- AL-P8 Same control in the quick-add sheet and the desktop Add flyout (one form); not drawn separately at 1280.
- AL-P9 No script: both fields are plain inputs (radios named `level`), so A and C read as B; the server's existing rules apply.

## Open (and what a wrong guess costs)
- AL-Q1 Which option. Wrong A: an extra row for people who only count. Wrong C: Level hard to find. Wrong D: a mixed household is stuck.
- AL-Q2 Default Quantity or open on the last choice. Wrong "last": opens on Level for someone counting milk (one tap). Wrong "always Quantity": a Level person flips every add.
- AL-Q3 May a person give both (B)? If yes the form should say a level beside an exact amount is not read by the list.
- AL-Q4 Preselect Plenty? Wrong "no": one extra tap. Wrong "yes": a state the person never gave.
- AL-Q5 Quick-add: offer it, or only on the full Add?

## Build impact (for the issue, not decided)
`add-form.ts` gates the Level picker on `edit`; `levelPickHtml` (`web-stock.ts`) is reused as is. The switch is a few lines in the form script that already loads, with the markup server-rendered so Add works without script. No schema, no route, no tool change. Tests that assert Add has no Level will change (not searched). Default path: no new request on page load.

## Loads (DESIGN.md section 6)
Mockup: each frame loads `theme.css`, the Edit flyout's `flyout.css`, `ael.css` (about 3 KB) and `ael.js`, cached after the first; frames load on scroll; nothing deferred because the page is the mock. Build: see above.
