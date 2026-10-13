# Receipt scan: handover

**Status: revision 2 (live viewfinder) drawn 14 October 2026 (Sydney); revision 1 (12 October) archived. For anyone to pick up cold.** Nothing is built in the real app. Nothing is approved. Start here; the durable links are in section 3.

## 1. The ask, in the owner's words

Owner (Arjan), voice, 12 October 2026, tidied: mockup first in `basement-bridge/mockup` (not `kitchie`, not `kitchie-mockup`): a receipt scan to bulk-add Pantry items. Match each line to an existing item exactly first; show for an exact match whether it will add a new item or revise the quantity; show confidence for close matches (he floated dots: one, three, five; compact) with confirm or override (override makes a new item); flag unrecognised lines distinctly and require the person to confirm each as new ("cross it out"). Client-side OCR. Hands-off: decisions are proposals. Owner reviews and picks, then confirms before any build.

## 1a. Revision 2, 14 October 2026

Owner, voice: rebuild around a live viewfinder like Shopping's (Kitchie #695, #697). Matching logic unchanged; resolution moves onto the live view. Four live directions: **A Tap the paper** (recommended), **B Freeze and walk**, **C Cards under the camera**, **D Camera and list**. Decisions RS-29 to RS-54 in the job note; RS-2, RS-19, RS-24 superseded, RS-25 and RS-26 amended. Hub: `fragments/receipt-scan/index.html`; directions `live-a.html` to `live-d.html` (`?step=entry|view|done|refused`, `&phase=`, `&cond=`, `&pre=`, `&sel=`, `&walk=1`, `&sheet=summary`, `&conf=`, `&vp=`); check `tools/receipt-scan-live-check.mjs`; viewport code `lv.phone.js`, `lv.desktop.js`. Revision 1 is at `v1.html`. Sections 2 to 4 below describe revision 1 and the open questions still stand.

## 2. What was made (revision 1)

Four options for the whole flow, phone, tablet and desktop: **A Receipt order** (recommended default), **B Sort the pile**, **C The paper page**, **D One at a time**. States and decisions RS-1 to RS-28 are in the job note.

## 3. Where it lives

| What | Where |
|---|---|
| Index (options, states, sizes, decisions, open questions) | `fragments/receipt-scan/index.html`; https://basement-bridge.github.io/mockup/fragments/receipt-scan/index.html (not verified from the sandbox) |
| Options | `a.html`, `b.html`, `c.html`, `d.html` (`?step=entry|capture|reading|review|summary|done`, `&state=`, `&pre=half|resolved`, `&sel=`, `&open=`, `&filter=`, `&conf=pips|bars|ring`, `&vp=`) |
| Job note and decisions | `docs/knowledge/jobs-to-be-done/receipt-scan.md` |
| How the read works | `docs/knowledge/jobs-to-be-done/edge-ocr.md` |
| Check script | `tools/receipt-scan-check.mjs` |

File layout: shared `rs.css`, `rs-core.js` (state, the one line rule `RS.out`, shared screens), `rs-data.js` (invented sample receipt); per option `x.css`, `view-x.js`, `x.html`; per viewport `phone.css`, `tablet.css`, `desktop.css`, `rs.phone.js`, `rs.desktop.js`. Sample data is synthetic: no real shop, receipt or card digits.

## 4. Not decided

Which live direction; RS-5 (batches), RS-18 (price), RS-22 (undo window), RS-23 (where new items go), the confidence look. See the job note's open questions.

## 5. Not done

- Nothing is built. The engine, matching and hosting slices are in `edge-ocr.md` section 7.
- Kitchie tracking issue #674 is updated with the revision 2 links (comment).

## 6. Next steps once the owner confirms

1. Settle the open questions in the job note first; change the mockup before anything is built.
2. Build to Kitchie `uat` only, never `main`, never tags; the built screen matches the mockup (copy markup and css first, list each difference).
3. Chat tools and the UI call the same service methods. Headless screenshots first. Viewport code in its own files.

## 7. Process notes

Mockups merge straight to mockup `main`. `gh pr create` can fail (GraphQL 403): use `gh api repos/basement-bridge/mockup/pulls --input <json>`, then `PUT .../pulls/N/merge` with squash. Serve with `python3 -m http.server`.
