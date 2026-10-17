# Unit conversion: switching a unit converts the quantity and the minimum together

Status: mockup for the owner to review (17 Oct 2026). Not built in Kitchie. Source: Kitchie #800 (owner, voice, 16 Oct 2026, and the owner decisions recorded on that issue). Lines marked **Proposal** are choices the mockup made where the owner was silent; **Open** lines are not decided. Merging this mockup settles none of them.

Mockup: `fragments/unit-conversion/` (notes page `index.html`; the live page `app.html`, the Edit item flyout at phone, tablet and desktop widths; `convert.js` is the conversion helper written the way the build's `assets/quantity.js` is; `uc.js` builds the page; `sample.js` is mock data; `uc.css` holds only the new #800 pieces). Check: `tools/unit-conversion-check.mjs` (380 checks at 390, 360 and 1280 px, light and dark). The page reuses `fragments/item-edit-flyout/` stylesheets and markup unchanged; see `item-sheet.md` and `docs/handover/item-edit-flyout.md` for the flyout itself.

## What the owner decided (voice, 16 Oct 2026, from the #800 issue comment)

- **UC-D1** Option A: one shared conversion service, used wherever quantity or minimum math happens. Quantity and minimum convert together, in lockstep. Not convert-only-on-switch, not relabel-and-warn.
- **UC-D2** Known relationships (g and kg, mL and L, mm and cm "and the like") convert automatically.
- **UC-D3** No known rate between two units (tin, pack, any pair the table does not cover): ask the person for the real count in the new unit. Not a silent relabel, not a refusal.
- **UC-D4** Rounding: precision comes from the conversion factor (1000 gives three decimals, 100 gives two), not a fixed rule.
- **UC-D5** A value that rounds to zero (the example was 1 g to 0.001 kg): warn. Not a silent refusal, not a silent keep of the old unit.
- **UC-D6** History: not needed. No dedicated journal record for a conversion.
- **UC-D7** Mixed units under one name (a kg row and a g row with their own minimums): combine and show in the smaller, more granular unit.
- **UC-D8** MCP: no new "change unit" tool; the system infers it (only the unit changed means convert; the amount changed means a correction through the existing `correct_item`). Provisional until the owner confirms the wording.
- **UC-D9** No UI is built without a mockup first; the ask and the warning are user-facing.
- **UC-D10** Sequencing satisfied: #799 (decimal minimum) is merged.
- Not yet answered: which units beyond g, kg, mL, L (UC-Q1); density cases such as cup to gram (UC-Q2).

## What the mockup does

The prompts live in place in the Quantity group of the Edit flyout, under the unit chips (DESIGN.md 6a). Nothing opens over the form. The card has one of three looks, set by `data-conv`:

| `data-conv` | When | What it says and offers |
|---|---|---|
| `done` (`.ef-conv.done`, `role=status`) | A switch converted | "Converted 500 g to 0.5 kg. Minimum 250 g to 0.25 kg." and **Undo**. The unit box, the minimum's unit label, the list row and the level icon follow in place; the level does not change. |
| `ask` (`.ef-conv.ask`, `role=group`) | No known rate (tin to kg, g to mL, a typed unit the table lacks) | "There is no fixed rate between tin and kg. How many kg is your 4 tin?", one number field with the new unit, a live line "Minimum 4 tin becomes 1.6 kg at the same rate", **Convert** (off until a number is valid) and **Keep tin**. The field takes focus; Enter converts. The unit box keeps the old unit, the tapped chip is outlined and dashed, the quantity and minimum controls are disabled. Nothing is stored. |
| `warn` (`.ef-conv.warn`, `role=alert`) | A converted quantity or minimum would round to zero | "The minimum 0.4 g is 0.0004 kg, and kg is kept to 3 decimals, so it would become 0 (no minimum)." with **Keep g** (filled, takes focus) and **Switch to kg anyway**. |
| `also` (`.ef-also`) | Another row has the same name | "Also held: 1 kg in Pantry (minimum 0.5 kg). Together 1250 g (shown in the smaller unit). The level uses the total and the larger minimum, 500 g." |

Rules the page applies (all in `convert.js`):

- Table: g (mass, 1), kg (mass, 1000), mL (volume, 1), L (volume, 1000); count units have no size. Same as `server/config/unit-rules.json`. A pair is "known" only inside one family.
- Decimals come from the factor between the two units (`decimals`): 1000 is three, 100 is two, 10 is one, the same count in both directions. 1 g to kg is exactly 0.001; the zero case starts below half a gram.
- A switch converts the quantity (if there is a number) and the minimum (if there is one). A quantity of 0 converts to 0. A hand-set level's recorded minimum (`level_json.override.minimum`) must be rewritten in the same operation (not visible on the page; the build tests it).
- Typing or stepping the quantity or the minimum is a correction and is never converted.
- Rows of one name combine in the smallest unit among the rows; the minimum used is the largest of the rows' minimums, converted; the level reads from that total and minimum. Rows that cannot be added (a count unit, or two families) are not combined and the block is not drawn.

The states are links (`?item=ID&to=UNIT&n=NUMBER&m=NUMBER&go=1&ask=two&theme=kitchie`), listed on the notes page.

## Proposals (owner was silent)

- **UC-P1** In place in the Quantity group, no modal, sheet or toast. The Add form uses the same component (not drawn). Wrong guess costs: a different host for the same card.
- **UC-P2** A known switch applies at once with no confirmation; the done line stays until the next change; **Undo** is held in the open form and writes no history (UC-D6).
- **UC-P3** While a question is open nothing is stored; the quantity and minimum are disabled; Keep returns to the old unit.
- **UC-P4** The ask is one number, the minimum following at the same ratio. The two-number form is drawn at `?ask=two` and can change the level across the switch.
- **UC-P5** With a quantity of 0 only the minimum is asked.
- **UC-P6** The warning says exactly what would happen; Keep is the default; Switch anyway stores 0 (a minimum of 0 means none, a quantity of 0 means used up) and the done line says so. The quantity and the minimum are checked separately.
- **UC-P7** Only a unit change converts.
- **UC-P8** A switch to or from No unit is a relabel (nothing to convert by) and the line says the number stays.
- **UC-P9** A typed unit takes the household's spelling first ("kilos" is kg), then converts.
- **UC-P10** Rows of one name: the dashed block, the total in the smaller unit, the largest minimum (today's low-stock rule), and one level for the name.
- **UC-P11** An ask answer applies to this item only; the rate is not remembered.
- **UC-P12** For a rate the person gave, the minimum is rounded to three decimals (the cap `convertAmount` uses today).

## Open questions (recommended position first)

- **UC-Q1** (owner, unanswered) Which units besides g, kg, mL, L? Recommended: none now; mg only if a household uses it. oz, lb, tsp, tbsp and cup are not power-of-ten relationships (UC-D4 gives no clean decimals) and a tablespoon is 20 mL in Australia, 15 mL in the US. Cost: a line per unit in `unit-rules.json`.
- **UC-Q2** (owner, unanswered) Density (cup to gram). Recommended: out of scope; a cross-kind switch uses the same ask (drawn: g to mL).
- **UC-Q3** The rounding example. With UC-D4, 1 g to kg is 0.001, not zero. Recommended: store as many decimals as the factor gives (three for kg and L). The issue's "3 decimals while converting, 2 stored" would turn 1 g into 0 and make the warning fire on values the person can still write. Cost if wrong: lost precision in storage.
- **UC-Q4** One number or two when asking. Recommended: one.
- **UC-Q5** What Switch anyway does to a minimum that rounds to zero. Recommended: none, said in words, Keep the default. Alternative: the smallest step (0.001 kg).
- **UC-Q6** MCP wording (UC-D8, provisional). Recommended: unit only converts; amount only is a correction; unit and amount together is a correction for the amount and the minimum converts from the old unit (it has no unit of its own). With no known rate the MCP answers with its existing `needs_confirmation` asking the same question as the card. Cost if wrong: a minimum left in the old unit.
- **UC-Q7** Mixed units across the app. `shopping-receipt` SR-21 and SR-25 show a combined row in the unit the Pantry holds it in (500 g + 1 kg = 1.5 kg); UC-D7 says the smaller unit. Recommended: UC-D7 wins and SR-25 is shown changed in that fragment first (not changed here). Also largest minimum (recommended) versus the sum.
- **UC-Q8** Keep Undo on the done line. Recommended: yes.
- **UC-Q9** The recorded minimum of a hand-set level converts in the same operation. Stated so the build tests it.

## What each caller does (for the build; no Kitchie code is changed here)

| Call | Result |
|---|---|
| Web or MCP, only the unit changes, known rate | Quantity and minimum (and the hand-set level's recorded minimum) convert in one operation. |
| Only the unit changes, no known rate | Web: the ask card. MCP: `needs_confirmation`; nothing changes until answered. |
| Only the amount or the minimum changes | A correction as given. |
| Unit and amount both change | A correction for the amount; the minimum converts from the old unit (UC-Q6, to confirm). |
| A converted value would be 0 | The warning; nothing changes until Keep or Switch anyway. |
| Readers (low-stock rule, receipt reconcile, shopping amounts, cook) | The same helper; rows of one name combine in the smaller unit. |

## For the build

Copy `uc.css` (new classes `.ef-conv`, `.ef-convh`, `.ef-convt`, `.ef-convb`, `.ef-convin`, `.ef-conv2`, `.ef-also`, and the `.ef-chip.pend` state) and the card markup in `uc.js` (`convCard`, `alsoBlock`), and match `convert.js` to `server/src/quantity.ts` and `server/src/assets/quantity.js` (`decimals` from the factor, `losesAll`, `together`); extend `test/quantity-parity.test.ts` with the cases in `tools/unit-conversion-check.mjs` section 0. The browser shows the preview from the unit table already in the page; the server converts again with the same rules and wins. Differences from the live app to list in the Kitchie pull request: `form.js` `pickUnit` stops converting only the quantity and calls the one operation (`changeItemUnit`) that converts both; the Edit form's Quantity group gains the card slot; the minimum's unit label (`#ef-minunit`) follows the unit.

## What the default path loads, and what is deferred (DESIGN.md section 6)

Nothing new on the default path in the build: the Edit flyout already carries the unit table for its quantity editor. The mockup page loads `theme.css`, the item-edit-flyout stylesheets, `uc.css` (about 2 KB), `convert.js` (about 4 KB), `sample.js` and `uc.js`. The conversion and the card are worked out in the page, in place (section 6a); there is no request until the person confirms, then one write. The ask and warning cards are drawn only when needed.
