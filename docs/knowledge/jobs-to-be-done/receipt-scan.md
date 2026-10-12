# Receipt scan: bulk add to the Pantry

Status: mockup drawn 12 October 2026, four options, phone and desktop. **Nothing is built. Nothing is confirmed**: RS-1 to RS-28 are proposals by the design agent and wait for the owner. Mockup: `fragments/receipt-scan/index.html` (https://basement-bridge.github.io/mockup/fragments/receipt-scan/index.html, not checked from the sandbox). Handover: `../../handover/receipt-scan.md`. How the read works (engine, matching, bands): `edge-ocr.md`.

## Job

Today Pantry add is one item at a time. The person has a receipt and wants everything on it in the Pantry, matched against what they already hold, with the least typing.

Owner, voice, 12 October 2026 (tidied): since client-side OCR is now good, scan an image of a receipt and bulk-add the items. (1) Match each scanned line to an existing Pantry item **exactly** first. (2) An exact match gets a clear visual cue and must show whether the result is **add as new** or **just revise the quantity** of the existing item. (3) Close but not exact: a **confidence rating shown visually** (he floated one, three and five dots; "very acute, compact"; use best judgment), and the person confirms the suggested match or overrides it; an override becomes a new item. (4) Not recognisable: flagged distinctly, and the person must actively confirm it as a new item, "like a visual scan where on a given page they cross it out". Client-side OCR, no server round trip. Mockup first, in `mockup`; UI always lives in Kitchie; same look and feel.

## How we know the person is in this job

They chose it: Add, then a receipt (RS-1). On desktop, a photo dropped or pasted starts it too. Not inferred.

## What leads

The result of the read, not the photo: one review where what is certain is already done and what needs the person is obvious. Nothing is written until the person adds.

## What this job does not need

No account step, no live camera preview, no stored photo, no AI turn, no price field in the Pantry (shown to check only, RS-18), no barcode.

## Mockup

Four options (A Receipt order, B Sort the pile, C The paper page, D One at a time), each drawn through entry, capture, reading, review, per-line states, override, confirm-as-new, summary, done and undo, plus edge states (dark photo, first-use download, offline, camera blocked, low quality, nothing found, duplicates, quantity parsing, discount and bag lines). Phone, tablet and desktop. Recommended default (a proposal): A.

## Decisions (all proposed, none confirmed; numbered RS-1 on, a separate series so parallel work does not collide with 1 to 155)

| # | Decision | Status |
|---|---|---|
| RS-1 | **Entry lives inside Add.** No new control on the Pantry header (screen space on the list is precious). A: switch in the Add flyout. B: tile. C: caret menu on the Add button. D: camera in the item box, plus drop or paste on desktop. | Proposed |
| RS-2 | **Read on the device, photo thrown away.** Camera or photo picker on phone (the phone's own camera, no live preview); drop, paste or choose on desktop. A long receipt takes up to three photos ("Add the other half"). Nothing is uploaded or stored (owner, 11 Oct 2026; edge-ocr OCR-D1 to OCR-D4). | Proposed |
| RS-3 | **Exact first.** Each line is matched to the Pantry in this order: exact name (or a learned alias), then close, then none. The first that hits decides the state. | Proposed |
| RS-4 | **Five line states, one chip each.** Top up (exact, revises an existing item), New item (exact, kept as its own item), Check (close, needs you), New? (no match, needs you), Not added. Every state has a glyph, a word and a colour, so colour is never the only signal. | Proposed |
| RS-5 | **An exact match says which it will do.** Default is Top up. If the existing item has a use-by, the default is New item, because a new carton has its own date and the old one keeps its. One tap flips it (the Top up | New item switch, key T). The line always says the result: "5 kg to 10 kg" or "keeps eggs as it is". | Proposed |
| RS-6 | **Exact match to a used-up item is Back in stock.** Tuna at 0 becomes 3 tin: the same item, its place and minimum kept. | Proposed |
| RS-7 | **Exact lines are ready without a tap.** Nothing is written until the commit step, so the person is not asked to confirm what is certain. They can still open and change any line. | Proposed |
| RS-8 | **A close match is never pre-confirmed.** The person says Yes (the suggestion), or Not this one, which makes a new item (owner). Proposal: a "Pick another item" path is also offered, since the second and third candidates cost nothing. | Proposed |
| RS-9 | **A confirmed close match follows decision 5.** It becomes Top up or New item by the same use-by rule. | Proposed |
| RS-10 | **No match is flagged distinctly and never added by default.** Dashed outline, a question mark, the danger tone, the chip "New?". The person must add it as new (a tick, or "Add as new") or cross it out ("Not an item"). Lines left unchecked are not added, and the summary says how many. | Proposed |
| RS-11 | **A new item's name starts as the cleaned receipt text.** Editable on the spot ("Smoked salmon"). When the text is unclear it starts empty with the prompt "What is it? The text was unclear". | Proposed |
| RS-12 | **One confidence per line, shown as a band.** The recogniser's score times the match score, drawn as three bands (85 and up, 60 to 84, under 60), never a percentage. Default: five dots with 5, 3 or 1 filled (the owner's idea). Rising bars and a ring are drawn as alternatives (B, C) and any option takes any style with `?conf=pips|bars|ring`. The word (Very likely, Likely, Weak guess) shows when a line is open. | Proposed |
| RS-13 | **Confidence is never drawn like the battery.** The Pantry battery means stock level. Dots, bars of rising height and a ring cannot be read as it. Same band colours as the app (sage, amber, red-tone). | Proposed |
| RS-14 | **Discount and non-food lines are never added.** They sit under Not added with the reason (Discount: takes $3.00 off the line above; Not food: a bag charge). "This is an item" rescues one. A discount is attached to the line above it, not treated as an item. | Proposed |
| RS-15 | **Header and totals are ignored but counted.** "6 total and header lines ignored" is on every review, and the lines are listed, so a wrongly dropped item can be found. | Proposed |
| RS-16 | **Duplicate lines are combined by default.** Two MILK 1L lines become one row "2 lines", 2 L, with "Keep separate" to undo. | Proposed |
| RS-17 | **Quantity is parsed and shown.** "4 @ 1.10" is 4 units; "400G" next to it is the tin size and is dropped; a weight line under an item belongs to it; kg and L convert to the Pantry's g and mL. The line says how it was read, and the amount is a stepper the person can change. | Proposed |
| RS-18 | **Price is shown to help check, not saved.** Open question: does Kitchie want to store price at all. | Proposed |
| RS-19 | **Bad reads have their own states.** Low quality: a banner on the review and a retake link, unclear lines flagged. Dark photo: a warning before reading. Nothing found: an empty state with try again and add by hand. Camera blocked: choose a photo instead. | Proposed |
| RS-20 | **First use on a metered connection asks before downloading about 16 MB.** Offline with no reader saved: says so and offers add by hand. (edge-ocr section 3.2; Choice 3 there.) | Proposed |
| RS-21 | **Commit is a summary step.** New items, topped up, left out; the lists; a reminder of any unchecked lines with a way back; one button "Add N to the Pantry". Then the Pantry, with the changes marked. | Proposed |
| RS-22 | **Undo.** A toast with Undo for 9 seconds after commit; Undo puts quantities back and removes the new items, with Redo. In the review, every decision has Change. Proposal: also reachable from the Pantry history for 5 minutes (the photos rule). Open question: the window. | Proposed |
| RS-23 | **Where new items go.** A new batch of an existing item takes that item's place. A brand new item lands under "Where do these go?" with no place, to be set later. Open question: does the app have this state. | Proposed |
| RS-24 | **Phone and tablet layout.** The review is a full page with a sticky bar ("10 ready, 4 to check, Review and add 10"); sheets for the Add flyout, capture, summary and (B, C) a line's detail. Tablet is the same, centred and wider. | Proposed |
| RS-25 | **Desktop layout.** Rail, the 736px column, the 400px right lane. The lane is the Add flyout, then the line inspector, then the summary; with nothing picked it is the summary, never empty (plan-desktop 52). | Proposed |
| RS-26 | **Desktop keys.** J or Down, K or Up move; Y yes or add as new; N new item; X not an item; T top up or new item; 1 to 3 pick a candidate; Z undo a line; Shift+Enter add to the Pantry; R scan from the Add flyout. Close is Ctrl or Cmd Enter and the x; Esc only cancels a menu (Pantry rule). | Proposed |
| RS-27 | **Viewport code in its own files.** `rs.phone.js` and `rs.desktop.js`, `phone.css`, `tablet.css`, `desktop.css`. Shared files carry no size rules. | Proposed |
| RS-28 | **Provenance and writes.** Source is the existing closed value `receipt`, by is the person, writes go through the same service methods as chat (standing rule). No new field. | Proposed |

## Open questions

1. Which option. A wrong guess costs a redraw; nothing is built.
2. Does Kitchie hold separate batches of one item (RS-5)? If not, every exact match is Top up.
3. Is price stored (RS-18)?
4. Where do no-match new items go (RS-23)? Is there a "needs a place" state?
5. Undo window (RS-22).
6. Dots, bars or ring (RS-12).
7. Combine duplicate lines by default (RS-16)?
8. Keep "Pick another item" beside the owner's override-to-new (RS-8)?

## For the implementation

- What loads by default: nothing for scanning. On choosing a receipt: the option's review script and css; the reader (about 16 MB, `edge-ocr.md` section 3.2) only when a scan starts. Viewport code is in `rs.phone.js`, `rs.desktop.js`, `phone.css`, `tablet.css`, `desktop.css`; the shared files carry no size rules.
- Class names: Pantry's (`.hd .btn .grp .rows .row .panel .ib .kbd .toast .nv .tabbar .rail`) plus `rs-*` shared and `a-* b-* c-* d-*` per option. Tokens only, no new tokens. The scribbles are the Shopping list's five.
- The matching, bands and the write path are in `edge-ocr.md` sections 4 to 6 (`matching.ts` rules in the browser, source `receipt`, same service methods as chat). The mockup's `RS.out` is the one rule for what a line does; it is mockup code, not the build's.
- Check: `node tools/receipt-scan-check.mjs` (360 pages at 390, 768 and 1280, light and dark, plus a click-through of the whole flow in every option).
