# Receipt scan: handover

**Status: revision 3 (Receipt order, live) drawn 14 October 2026 (Sydney); owner chose Option A on the live camera flow. Revisions 1 and 2 are archived, not chosen. For anyone to pick up cold.** The build into Kitchie `uat` follows this page (tracking issue #674). Start here; the durable links are in section 3.

## 1. The ask, in the owner's words

Owner (Arjan), voice, 12 October 2026, tidied: mockup first in `basement-bridge/mockup` (not `kitchie`, not `kitchie-mockup`): a receipt scan to bulk-add Pantry items. Match each line to an existing item exactly first; show for an exact match whether it will add a new item or revise the quantity; show confidence for close matches (he floated dots: one, three, five; compact) with confirm or override (override makes a new item); flag unrecognised lines distinctly and require the person to confirm each as new ("cross it out"). Client-side OCR. Hands-off: decisions are proposals. Owner reviews and picks, then confirms before any build.

## 1b. Revision 3, 14 October 2026: the chosen flow

Owner, voice: Option A, Receipt order, a plain list in print order in the Pantry's row style, on the live camera flow. Decisions RS-55 to RS-73 in the job note (several earlier ones marked superseded). In short: an exact match tops up the single latest record, no batches (RS-56); no use-by exception; confidence is dots 3-2-1 (RS-57); every line says its outcome, "New item" or "Updates existing (5 kg to 10 kg)" (RS-58); swipe right accepts a recommended line, "Pick another item" and "New" always visible, swipe left is the override, desktop has equivalents (RS-59, RS-60); states Exact, Check, Unsure, and Ignored; an Unsure line has Add as new, Match to existing, Ignore (RS-61 to RS-63); filter and a progress readout "9 of 14" at the top (RS-64); discount, bag and non-food lines stay out with a reason, one tap to put back (RS-65); no AI calls, deterministic scoring with thresholds and examples in the job note (RS-66); reuse of the Add/Edit unit parsing and the Shopping reader, chat tools and UI on the same service methods (RS-67); price and store are not captured because no such fields exist (RS-68); undo 9 seconds on screen and 5 minutes in history, duplicate lines combined (RS-69). **Proposed, not decided:** new items with no place go to Unplaced (RS-70); Exact lines start accepted (RS-71). Hub: `fragments/receipt-scan/index.html`; flow `ro.html` (`?step=entry|view|done|refused`, `&phase=`, `&cond=`, `&pre=half|all|resolved|part`, `&filter=`, `&sel=`, `&pick=`, `&sheet=summary`, `&vp=`); code `ro-core.js` (`RO.out`), `ro-run.js`, `ro.phone.js`, `ro.desktop.js`, css `ro.css`, `ro.phone.css`, `ro.desktop.css`; check `tools/receipt-scan-ro-check.mjs`. The old hub is `archive.html`; directions `live-a.html` to `live-d.html` are archived.

## 1c. Standing constraint, 14 October 2026 (RS-74)

Owner (Arjan), standing instruction: the receipt scan must REUSE Kitchie's Add/Edit item quantity and unit logic and keep the code DRY. In the build (Kitchie `uat`, v0.106.3, PR #718, `docs/adr/pantry-receipt-scan.md` decision 8) the add-up preview, the words sent to the server and the stepper come from `KitchieQuantity`, held equal to the server's `inUnit` and `commitQuantity` by `test/quantity-parity.test.ts`. In this mockup `toU` in `ro-core.js` is a stand-in for sample data only: do not copy it. An amount that cannot be added to an exact amount is kept as a separate item (the job note's data-fields table is corrected to say so). A recommended line (Exact or Check) sent to New now shows Pick another item on the line (RS-74); `tools/receipt-scan-ro-check.mjs` asserts the on-line controls per state. Open for the owner: `lb`, `lbs` and `oz` are not household units (the build keeps them as text and as a separate item when they cannot be added); adding them to the household unit table is his decision.

## 1a. Revision 2, 14 October 2026 (archived)

Owner, voice: rebuild around a live viewfinder like Shopping's (Kitchie #695, #697). Matching logic unchanged; resolution moves onto the live view. Four live directions: **A Tap the paper** (recommended), **B Freeze and walk**, **C Cards under the camera**, **D Camera and list**. Decisions RS-29 to RS-54 in the job note; RS-2, RS-19, RS-24 superseded, RS-25 and RS-26 amended. Hub: `fragments/receipt-scan/index.html`; directions `live-a.html` to `live-d.html` (`?step=entry|view|done|refused`, `&phase=`, `&cond=`, `&pre=`, `&sel=`, `&walk=1`, `&sheet=summary`, `&conf=`, `&vp=`); check `tools/receipt-scan-live-check.mjs`; viewport code `lv.phone.js`, `lv.desktop.js`. Revision 1 is at `v1.html`. Sections 2 to 4 below describe revision 1 and the open questions still stand.

## 2. What was made (revision 1)

Four options for the whole flow, phone, tablet and desktop: **A Receipt order** (recommended default), **B Sort the pile**, **C The paper page**, **D One at a time**. States and decisions RS-1 to RS-28 are in the job note.

## 3. Where it lives

| What | Where |
|---|---|
| Hub (the chosen flow, states, decisions, scoring, open questions) | `fragments/receipt-scan/index.html`; flow `ro.html`; https://basement-bridge.github.io/mockup/fragments/receipt-scan/index.html (not verified from the sandbox) |
| Archived revision 1 hub and options | `archive.html` (live revision), `v1.html`, `a.html`, `b.html`, `c.html`, `d.html` (`?step=entry|capture|reading|review|summary|done`, `&state=`, `&pre=half|resolved`, `&sel=`, `&open=`, `&filter=`, `&conf=pips|bars|ring`, `&vp=`) |
| Job note and decisions | `docs/knowledge/jobs-to-be-done/receipt-scan.md` |
| How the read works | `docs/knowledge/jobs-to-be-done/edge-ocr.md` |
| Check script | `tools/receipt-scan-check.mjs` |

File layout: shared `rs.css`, `rs-core.js` (state, the one line rule `RS.out`, shared screens), `rs-data.js` (invented sample receipt); per option `x.css`, `view-x.js`, `x.html`; per viewport `phone.css`, `tablet.css`, `desktop.css`, `rs.phone.js`, `rs.desktop.js`. Sample data is synthetic: no real shop, receipt or card digits.

## 4. Not decided

Where brand-new items go (RS-70, proposed Unplaced); whether Exact lines start accepted (RS-71); purchase date to use-by (no rule exists). The rest of the earlier list is settled by RS-55 onward. See the job note's open questions.

## 5. Not done

- The build is in progress in Kitchie `uat` (PRs listed on #674). The engine, matching and hosting slices are in `edge-ocr.md` section 7.
- Kitchie tracking issue #674 is updated with the revision 2 links (comment).

## 6. Next steps once the owner confirms

1. Settle the open questions in the job note first; change the mockup before anything is built.
2. Build to Kitchie `uat` only, never `main`, never tags; the built screen matches the mockup (copy markup and css first, list each difference).
3. Chat tools and the UI call the same service methods. Headless screenshots first. Viewport code in its own files.

## 7. Process notes

Mockups merge straight to mockup `main`. `gh pr create` can fail (GraphQL 403): use `gh api repos/basement-bridge/mockup/pulls --input <json>`, then `PUT .../pulls/N/merge` with squash. Serve with `python3 -m http.server`.
