# Receipt scan: handover

**Status: revision 3 (Receipt order, live) drawn 14 October 2026 (Sydney); owner chose Option A on the live camera flow. Revisions 1 and 2 are archived, not chosen. For anyone to pick up cold.** The build into Kitchie `uat` follows this page (tracking issue #674). Start here; the durable links are in section 3.

## 1. The ask, in the owner's words

Owner (Arjan), voice, 12 October 2026, tidied: mockup first in `basement-bridge/mockup` (not `kitchie`, not `kitchie-mockup`): a receipt scan to bulk-add Pantry items. Match each line to an existing item exactly first; show for an exact match whether it will add a new item or revise the quantity; show confidence for close matches (he floated dots: one, three, five; compact) with confirm or override (override makes a new item); flag unrecognised lines distinctly and require the person to confirm each as new ("cross it out"). Client-side OCR. Hands-off: decisions are proposals. Owner reviews and picks, then confirms before any build.

## 1b. Revision 3, 14 October 2026: the chosen flow

Owner, voice: Option A, Receipt order, a plain list in print order in the Pantry's row style, on the live camera flow. Decisions RS-55 to RS-73 in the job note (several earlier ones marked superseded). In short: an exact match tops up the single latest record, no batches (RS-56); no use-by exception; confidence is dots 3-2-1 (RS-57); every line says its outcome, "New item" or "Updates existing (5 kg to 10 kg)" (RS-58); swipe right accepts a recommended line, "Pick another item" and "New" always visible, swipe left is the override, desktop has equivalents (RS-59, RS-60); states Exact, Check, Unsure, and Ignored; an Unsure line has Add as new, Match to existing, Ignore (RS-61 to RS-63); filter and a progress readout "9 of 14" at the top (RS-64); discount, bag and non-food lines stay out with a reason, one tap to put back (RS-65); no AI calls, deterministic scoring with thresholds and examples in the job note (RS-66); reuse of the Add/Edit unit parsing and the Shopping reader, chat tools and UI on the same service methods (RS-67); price and store are not captured because no such fields exist (RS-68); undo 9 seconds on screen and 5 minutes in history, duplicate lines combined (RS-69). **Proposed, not decided:** new items with no place go to Unplaced (RS-70); Exact lines start accepted (RS-71). Hub: `fragments/receipt-scan/index.html`; flow `ro.html` (`?step=entry|view|done|refused`, `&phase=`, `&cond=`, `&pre=half|all|resolved|part`, `&filter=`, `&sel=`, `&pick=`, `&sheet=summary`, `&vp=`); code `ro-core.js` (`RO.out`), `ro-run.js`, `ro.phone.js`, `ro.desktop.js`, css `ro.css`, `ro.phone.css`, `ro.desktop.css`; check `tools/receipt-scan-ro-check.mjs`. The old hub is `archive.html`; directions `live-a.html` to `live-d.html` are archived.

## 1c. Standing constraint, 14 October 2026 (RS-74)

Owner (Arjan), standing instruction: the receipt scan must REUSE Kitchie's Add/Edit item quantity and unit logic and keep the code DRY. In the build (Kitchie `uat`, v0.106.3, PR #718, `docs/adr/pantry-receipt-scan.md` decision 8) the add-up preview, the words sent to the server and the stepper come from `KitchieQuantity`, held equal to the server's `inUnit` and `commitQuantity` by `test/quantity-parity.test.ts`. In this mockup `toU` in `ro-core.js` is a stand-in for sample data only: do not copy it. An amount that cannot be added to an exact amount is kept as a separate item (the job note's data-fields table is corrected to say so). A recommended line (Exact or Check) sent to New now shows Pick another item on the line (RS-74); `tools/receipt-scan-ro-check.mjs` asserts the on-line controls per state. Open for the owner: `lb`, `lbs` and `oz` are not household units (the build keeps them as text and as a separate item when they cannot be added); adding them to the household unit table is his decision.

## 1d. HARD CONSTRAINT, 14 October 2026 (RS-75)

Owner (Arjan): receipt-scan item matching must be DETERMINISTIC and LOCAL. No AI or LLM call, no model tokens, no network call per line, now or later. Allowed: fuzzy string and word overlap, normalisation (units, plurals, brands, abbreviations), category and food-family hints, arithmetic. The techniques actually in use are listed in RS-75 and the scoring section of the job note (normalisation, word-coverage scorer, extra-word penalty, food-family floor, reader-confidence factor, Exact / Check / Unsure thresholds, dot bands). OCR is the existing client-side worker. Any change that would add a model call needs the owner's explicit approval first. In the build this is Kitchie `docs/adr/pantry-receipt-scan.md` decision 9 and the static test `server/test/receipt-scan-no-model.test.ts` (fails on an AI or model client, `fetch`, `XMLHttpRequest`, a socket, `import()` or `Math.random` in the receipt-scan files). The mockup's `ro-*.js` matching is fixed sample data with the build matcher's own scores (`ro-data.js`), so it is deterministic and local.

## 1e. Desktop has no webcam, 14 October 2026 (RS-76)

Owner (Arjan), by voice: receipt scan on a DESKTOP must NOT offer a live webcam. A desktop person drops an image of the receipt on the page (or clicks to choose a file); it is read by the same client-side OCR path as a captured photo. The phone keeps the live viewfinder unchanged. Job note: RS-76 (amends RS-44, RS-45, RS-72). Built in Kitchie 0.109.1 (PR #724) (ADR decision 10). The mockup fragments are redrawn to match (`ro.desktop.js` sets `RO.vp.noCamera`; `ro-core.js`, `ro-run.js` and `ro.desktop.css` draw the drop zone and drop the webcam pill, shutter, steadiness bar and camera/permission states on a desktop; the phone is untouched), checked by `tools/receipt-scan-ro-check.mjs`. Kitchie's source guard is `server/test/pantry-receipt-no-desktop-camera.test.ts` (0.110.1, PR #731).

## 1f. Chat can bulk-add a receipt, 14 October 2026 (RS-77)

Owner (Arjan), by voice: expose receipt bulk-add through MCP so an AI assistant can bulk-add Pantry items from a receipt. No image reaches MCP; the assistant sends text lines. Job note: RS-77. Kitchie: `receipt_add` (Exact written at once; Check and Unsure returned for the person; discount, bag and non-food returned Ignored, recoverable) and `receipt_resolve` (the person's answers: accept, pick, new, ignore), stateless between the two calls, repeat-safe for 24 hours, Undo from History, amounts `model_inference` unless the person said them. One implementation: the server runs the page's own matcher files and `pantryReceiptCommit` (ADR decision 11, built in Kitchie 0.110.0 as pull request #726 into `uat`, NOT merged: an MCP contract change, which the owner reserves). No mockup screen changed: there is no new screen, so no genuine UX decision was open (the assistant asks in its own chat). Follow RS-77 for anything the mockup says about chat.

## 1h. Revision 3, 15 October 2026 (RS-92 to RS-97)

Same fragment (`quantity-unit.html`, `qu.js`, `qu.css`; check `tools/receipt-scan-qu-check.mjs`). First pill Exact in place of All, terse reason text, long-press Exact to accept all exact lines, the whole-receipt viewer, a draggable receipt/list handle (remembered per device), and a bottom row tight to the edge. Small hooks added to the shared `ro-core.js` (`RO.adjTally`, `RO.adjEntries`) and the terse reason text applies to the chosen flow too. Decisions in the job note.

## 1g. A quantity with a unit, 15 October 2026 (RS-78 to RS-86)

Kitchie #754. Owner (voice, 14 October 2026): a scanned quantity may carry a unit read by the shopping list's reader; `MILK 2L` is in scope, weight lines are out. Mockup first: `fragments/receipt-scan/quantity-unit.html` (hub, options A and B, states, decisions, open questions), `qu-a.html`, `qu-b.html`, `qu.js`, `qu.css`, `qu-data.js`; check `tools/receipt-scan-qu-check.mjs`. Revised 15 October 2026 after the owner's live review: A chosen (RS-87), blank amount (RS-88), the photo tracks the list (RS-89), slim header (RS-90), free-text editing as on the shopping list (RS-91). Open items are listed at the foot of the hub. Findings: the Pantry flow never sees the shopping list (the "receipt versus list words" state is Shopping's review); a unit already reaches the Pantry write today (weight lines send "1.2 kg" as quantity words); chat shares the reader and its "5KG is not an amount" rule (RS-77).

## 1h. Revision 4, 15 October 2026 (proposed, awaiting the owner): Read, then Sort

Owner (Arjan), by voice, on Kitchie #750: the phone scan crams the receipt into a thin slice (150 px of the screen), so what was read cannot be read; he wants the receipt shown large and called "read" once steady, and a second step to sort the Check, Unsure and Ignored lines. Three options on the same engine: **A** Read then sort only what needs you (recommended), **B** Read then the whole list, **C** the paper stays above the list. Page `fragments/receipt-scan/ro2.html`, decisions RS-87 to RS-96 in the job note, check `tools/receipt-scan-two-step-check.mjs`. Phone and tablet only; the desktop is unchanged. Nothing is built from this until the owner picks; the matcher and everything under it is unchanged.

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
| Check script | `tools/receipt-scan-check.mjs`; revision 4: `tools/receipt-scan-two-step-check.mjs` |
| Revision 4 (Read, then Sort) | `fragments/receipt-scan/ro2.html` (`?opt=a|b|c&step=view|sort`), `ro2.css`; hub section at the top of `index.html` |

File layout: shared `rs.css`, `rs-core.js` (state, the one line rule `RS.out`, shared screens), `rs-data.js` (invented sample receipt); per option `x.css`, `view-x.js`, `x.html`; per viewport `phone.css`, `tablet.css`, `desktop.css`, `rs.phone.js`, `rs.desktop.js`. Sample data is synthetic: no real shop, receipt or card digits.

## 4. Not decided

Whether Exact lines start accepted (RS-71); purchase date to use-by (no rule exists). Where brand-new items go is decided: Unplaced (RS-70). Chat bulk add (RS-77): only the merge of the MCP contract change is open; a line with no clear amount asks for it (owner confirmed). The rest of the earlier list is settled by RS-55 onward. See the job note's open questions.

## 5. Not done

- The build is in progress in Kitchie `uat` (PRs listed on #674). The engine, matching and hosting slices are in `edge-ocr.md` section 7.
- Kitchie tracking issue #674 is updated with the revision 2 links (comment).

## 6. Next steps once the owner confirms

1. Settle the open questions in the job note first; change the mockup before anything is built.
2. Build to Kitchie `uat` only, never `main`, never tags; the built screen matches the mockup (copy markup and css first, list each difference).
3. Chat tools and the UI call the same service methods. Headless screenshots first. Viewport code in its own files.

## 7. Process notes

Mockups merge straight to mockup `main`. `gh pr create` can fail (GraphQL 403): use `gh api repos/basement-bridge/mockup/pulls --input <json>`, then `PUT .../pulls/N/merge` with squash. Serve with `python3 -m http.server`.
