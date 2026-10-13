# Receipt scan: bulk add to the Pantry

Status: **revision 2 (live viewfinder) drawn 14 October 2026**, four live directions, phone and desktop; revision 1 (capture then review, 12 October) is archived at `fragments/receipt-scan/v1.html`. Revision 2 supersedes the capture and review decisions marked below; RS-29 to RS-54 are new. **Nothing is built. Nothing is confirmed**: RS-1 to RS-28 are proposals by the design agent and wait for the owner. Mockup: `fragments/receipt-scan/index.html` (live hub; https://basement-bridge.github.io/mockup/fragments/receipt-scan/index.html, not checked from the sandbox). Handover: `../../handover/receipt-scan.md`. How the read works (engine, matching, bands): `edge-ocr.md`.

## Job

Today Pantry add is one item at a time. The person has a receipt and wants everything on it in the Pantry, matched against what they already hold, with the least typing.

Owner, voice, 12 October 2026 (tidied): since client-side OCR is now good, scan an image of a receipt and bulk-add the items. (1) Match each scanned line to an existing Pantry item **exactly** first. (2) An exact match gets a clear visual cue and must show whether the result is **add as new** or **just revise the quantity** of the existing item. (3) Close but not exact: a **confidence rating shown visually** (he floated one, three and five dots; "very acute, compact"; use best judgment), and the person confirms the suggested match or overrides it; an override becomes a new item. (4) Not recognisable: flagged distinctly, and the person must actively confirm it as a new item, "like a visual scan where on a given page they cross it out". Client-side OCR, no server round trip. Mockup first, in `mockup`; UI always lives in Kitchie; same look and feel.

## How we know the person is in this job

They chose it: Add, then a receipt (RS-1). On desktop, a photo dropped or pasted starts it too. Not inferred.

## What leads

The result of the read, not the photo: one review where what is certain is already done and what needs the person is obvious. Nothing is written until the person adds.

## What this job does not need

No account step, no stored photo (the live camera preview is now wanted: see RS-34; the earlier "no live camera preview" is superseded), no AI turn, no price field in the Pantry (shown to check only, RS-18), no barcode.

## Mockup

Four options (A Receipt order, B Sort the pile, C The paper page, D One at a time), each drawn through entry, capture, reading, review, per-line states, override, confirm-as-new, summary, done and undo, plus edge states (dark photo, first-use download, offline, camera blocked, low quality, nothing found, duplicates, quantity parsing, discount and bag lines). Phone, tablet and desktop. Recommended default (a proposal): A.

## Decisions (all proposed, none confirmed; numbered RS-1 on, a separate series so parallel work does not collide with 1 to 155)

| # | Decision | Status |
|---|---|---|
| RS-1 | **Entry lives inside Add.** No new control on the Pantry header (screen space on the list is precious). A: switch in the Add flyout. B: tile. C: caret menu on the Add button. D: camera in the item box, plus drop or paste on desktop. | Proposed |
| RS-2 | **Read on the device, photo thrown away.** Camera or photo picker on phone (the phone's own camera, no live preview); drop, paste or choose on desktop. A long receipt takes up to three photos ("Add the other half"). Nothing is uploaded or stored (owner, 11 Oct 2026; edge-ocr OCR-D1 to OCR-D4). | **Superseded 14 Oct 2026** (RS-34, RS-35: the live viewfinder is the capture) |
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
| RS-19 | **Bad reads have their own states.** Low quality: a banner on the review and a retake link, unclear lines flagged. Dark photo: a warning before reading. Nothing found: an empty state with try again and add by hand. Camera blocked: choose a photo instead. | **Superseded 14 Oct 2026** (RS-46: live prompts) |
| RS-20 | **First use on a metered connection asks before downloading about 16 MB.** Offline with no reader saved: says so and offers add by hand. (edge-ocr section 3.2; Choice 3 there.) | Proposed |
| RS-21 | **Commit is a summary step.** New items, topped up, left out; the lists; a reminder of any unchecked lines with a way back; one button "Add N to the Pantry". Then the Pantry, with the changes marked. | Proposed |
| RS-22 | **Undo.** A toast with Undo for 9 seconds after commit; Undo puts quantities back and removes the new items, with Redo. In the review, every decision has Change. Proposal: also reachable from the Pantry history for 5 minutes (the photos rule). Open question: the window. | Proposed |
| RS-23 | **Where new items go.** A new batch of an existing item takes that item's place. A brand new item lands under "Where do these go?" with no place, to be set later. Open question: does the app have this state. | Proposed |
| RS-24 | **Phone and tablet layout.** The review is a full page with a sticky bar ("10 ready, 4 to check, Review and add 10"); sheets for the Add flyout, capture, summary and (B, C) a line's detail. Tablet is the same, centred and wider. | **Superseded 14 Oct 2026** (RS-48: no review page, the viewfinder is the review) |
| RS-25 | **Desktop layout.** Rail, the 736px column, the 400px right lane. The lane is the Add flyout, then the line inspector, then the summary; with nothing picked it is the summary, never empty (plan-desktop 52). | **Superseded 14 Oct 2026** (amended by RS-44) |
| RS-26 | **Desktop keys.** J or Down, K or Up move; Y yes or add as new; N new item; X not an item; T top up or new item; 1 to 3 pick a candidate; Z undo a line; Shift+Enter add to the Pantry; R scan from the Add flyout. Close is Ctrl or Cmd Enter and the x; Esc only cancels a menu (Pantry rule). | **Superseded 14 Oct 2026** (amended by RS-44) |
| RS-27 | **Viewport code in its own files.** `rs.phone.js` and `rs.desktop.js`, `phone.css`, `tablet.css`, `desktop.css`. Shared files carry no size rules. | Proposed |
| RS-28 | **Provenance and writes.** Source is the existing closed value `receipt`, by is the person, writes go through the same service methods as chat (standing rule). No new field. | Proposed |

## Live revision (14 October 2026)

Owner, voice, 12 to 14 October 2026: rebuild the mockup around a live viewfinder, as Shopping now scans live (Kitchie #695, #697). The matching logic is unchanged (RS-1 to RS-28 stand unless marked). What changes is where and when it is resolved: on the viewfinder, not on a separate review screen. Mockup: `fragments/receipt-scan/index.html`; directions `live-a.html` to `live-d.html`.

Directions: **A Tap the paper** (recommended, RS-43; tap a box, the frame holds and the card opens), **B Freeze and walk** (read-only live boxes, a capture freezes the frame, open lines walked one at a time, cross-off drawn on the photo), **C Cards under the camera** (a dock of cards, the camera never stops), **D Camera and list** (a live list in receipt order under a shorter picture).

| # | Decision | Status |
|---|---|---|
| RS-29 | **The matching logic stands.** Exact, close, none; exact says Top up or New item (RS-5); a close match is never pre-confirmed (RS-8); no match is never added unasked (RS-10); discount, bag and non-food lines are left out with a reason and never matched (RS-14, reconfirmed by the owner 14 Oct). The mockup's rule is the same function as revision 1's. Only where and when it is answered moves. | Proposed |
| RS-30 | **Live boxes keep Shopping's drawings and extend them by sign, word and edge.** Top up: green, up arrow, amount. New item: the same green, layers sign, a doubled edge. Check: amber dashed, wave, suggestion, confidence. New?: grey dotted 2 px, question mark, pulses. Not added: hairline, minus, a one-word reason. A tick in a circle marks a line the person answered. | Proposed |
| RS-31 | **Four counted chips, tappable.** Ready (n top up, n new), Check, New?, Not added. They count everything read on this scan, not only what is in view. Check, New? and Not added open the Last look on those lines; Ready opens the summary. | Proposed |
| RS-32 | **Add N takes the control row's empty right slot** (dashed and disabled at 0 ready). The commit is where the thumb already is. | Proposed |
| RS-33 | **No match is flagged live and answered actively.** "Cross each one off" needs a still page, so: live, a pulsing dotted "?" box and the New? chip; the answer is a tick (Add as new) or a cross-off (Not an item) from the line's card, live in A, C and D, and always available in the Last look, which walks every line left on a held frame. In B the cross-off is drawn on the held photo itself. Unanswered lines are never added; the summary says how many. A wrong guess costs a redraw of where the answer lives. | Proposed |
| RS-34 | **Auto-capture and steadiness are Shopping's, unchanged** (4 looks, 1.2 s, 75% within 0.6 of a line height, none blurry; the ring, the bar, the flash; haptics 15 and 30 ms). What a capture does changes: it banks the screenful (A, C, D) or freezes the frame (B). The manual shutter does the same. In A it waits while a card is open. | Proposed |
| RS-35 | **A long receipt is read in screenfuls, each line counted once.** A line is tracked by its words and place; a line seen again after the paper slides is "Seen again, not counted twice". Two real identical lines combine into one box "x2" (RS-16 stands; Keep separate on the card). This answers Shopping's open "long receipts in several parts" for the Pantry. | Proposed |
| RS-36 | **Cut-off lines are not read.** A line cut by the frame edge gets a dashed open box and "Cut off" with an arrow; it is not matched, counted or tagged until whole. A soft prompt says so. | Proposed |
| RS-37 | **Confidence on a live box.** On Check boxes only (exact lines are certain, no-match has nothing to rate). The three bands of RS-12 on an opaque pill; a band changes after two looks agree; frozen while blurry; lowered 15% in the dark. The card shows the same mark with its word. | Proposed |
| RS-38 | **The card is the line detail, unchanged.** The printed text and price (shown to check, RS-18), how the amount was read (RS-17), Yes or Not this one, Pick another item, the Top up / New item switch, the amount stepper, Combined from 2 lines. Used as a sheet, a lane, a dock card, a walk step or an open list row. | Proposed |
| RS-39 | **Direction A.** Tap a box: the frame holds, the line comes up to the top third of the picture, the card opens (a sheet on a phone, the lane on a desktop). Answering an open line closes it and the camera carries on. Auto-capture waits while a card is open. | Proposed |
| RS-40 | **Direction B.** Live boxes are read-only. A capture freezes the frame (a held photo, a solid outline). The open lines are walked one at a time, the others dimmed. A no-match line is crossed out on the paper by drawing Shopping's scribble over it (danger tone, the five hand-drawn paths). Scan the rest returns to live. | Proposed |
| RS-41 | **Direction C.** The camera never stops. Open lines are cards in a dock above the shutter, Check first. An answered card leaves. Tapping a box finds its card; tapping a Ready box opens a sheet. The Last look is the dock made full size. | Proposed |
| RS-42 | **Direction D.** A live list in receipt order under a shorter picture. Open rows have quick answers; a row opens to the card; tapping a box finds its row. The list is the queue; on desktop it is the lane. | Proposed |
| RS-43 | **Recommended default: A** (a proposal). Fewest new ideas; the answer is where the eye is. Swap to C if a real phone says tapping is too fiddly. | Proposed |
| RS-44 | **Desktop layout and keys.** Rail 88, column 736 with the webcam, lane 400 (RS-25 amended: the lane is per direction). Keys as RS-26 plus Space (take it now), L (Last look), Shift+Enter (add). Escape lets go of a held line only; Ctrl or Cmd+Enter or Done closes (the Pantry's rule). Viewport code in lv.desktop.js and lv.desktop.css. | Proposed |
| RS-45 | **On a desktop a photo is a first-class path.** Webcams are poor at receipts. Drop, paste or choose draws the same boxes on a still (no steadiness ring; a "Photo" read) and a second photo adds the other half (RS-2's rule, kept for photos). | Proposed |
| RS-46 | **Edge prompts.** Blur (confident outline, boxes freeze at the last good read, no capture); not a receipt (soft, dashed, italic; counts kept); too dark (outline, a light button if the phone has one); glare (outline, a hatched patch); cut off (soft); resting after 150 s (Resume); camera refused (one screen, Take or choose a photo). Shopping's wording and tones are kept; a negative prompt needs two looks. | Proposed |
| RS-47 | **Light button.** Appears in the top bar only when it is dark and the phone exposes a torch; otherwise the prompt says what to do. | Proposed |
| RS-48 | **Commit, summary, undo.** Add N opens the RS-21 summary as a sheet (phone) or the lane (desktop), with the unanswered reminder and a Last look link. Add N to the Pantry releases the camera and shows the Pantry with the changes marked and a toast: Undo with a 9 second countdown, 5 minutes in history (RS-22 stands, window open). | Proposed |
| RS-49 | **Done leaves without adding.** It closes the camera and drops the read. Proposal: ask first if any line was answered; the mockup does not. | Proposed |
| RS-50 | **Entry is inside Add (RS-1 stands).** The live revision draws the tile ("Scan a receipt"). Choosing it opens the camera at once; there is no capture sheet between. Revision 1's other entries (switch, caret, camera in the item box) are untouched and still open as presentation. | Proposed |
| RS-51 | **Haptics.** 15 ms the first time a line becomes Ready two looks running (once per line); 30 ms on a capture; 10 ms on an answer. Nothing when a Check or New? line appears (it would buzz all the time). | Proposed |
| RS-52 | **Tag position as built.** At the right end of the line, centred on it, as in #697; the box edge is drawn outside the text so a tight line is not covered. | Proposed |
| RS-53 | **Viewport code in its own files** (RS-27 extended): lv.phone.js and lv.phone.css, lv.tablet.css, lv.desktop.js and lv.desktop.css; the shared lv.css, lv-core.js, lv-run.js carry no size rules. The Pantry shell (phone.css, tablet.css, desktop.css) is revision 1's, reused. | Proposed |
| RS-54 | **For the build.** Reuse the existing worker (the frame message from #695) and the browser's matching.ts; no new engine. Match a tracked line once and again only if its text changes (cost). Class names: Shopping's rl-* for the shared drawings, lv-* for the Pantry's own. The mockup's LV.out equals revision 1's RS.out. --cue here is --added in Kitchie's stylesheet. | Proposed |

Stand unchanged: RS-1, RS-3 to RS-18, RS-20 to RS-23, RS-27 (viewport files, now `lv.phone.js`, `lv.desktop.js`), RS-28.

Superseded or amended: RS-2 (capture), RS-19 (bad reads), RS-24 (review page), RS-25 and RS-26 (amended by RS-44), and "no live camera preview". Revision 1's options are archived, not deleted.

## Open questions

1. Which live direction (A recommended). A wrong guess costs a redraw; nothing is built.
2. Does Kitchie hold separate batches of one item (RS-5)? If not, every exact match is Top up.
3. Is price stored (RS-18)?
4. Where do no-match new items go (RS-23)? Is there a "needs a place" state?
5. Undo window (RS-22; the mockup uses 9 s on screen plus 5 min history, RS-48).
6. Dots, bars or ring (RS-12), and how it renders over live video (opaque pill, RS-37) versus a static card.
7. Combine duplicate lines by default (RS-16)?
8. Keep "Pick another item" beside the owner's override-to-new (RS-8)?

## For the implementation

- What loads by default: nothing for scanning. On choosing a receipt: the option's review script and css; the reader (about 16 MB, `edge-ocr.md` section 3.2) only when a scan starts. Viewport code is in `rs.phone.js`, `rs.desktop.js`, `phone.css`, `tablet.css`, `desktop.css`; the shared files carry no size rules.
- Class names: Pantry's (`.hd .btn .grp .rows .row .panel .ib .kbd .toast .nv .tabbar .rail`) plus `rs-*` shared and `a-* b-* c-* d-*` per option. Tokens only, no new tokens. The scribbles are the Shopping list's five.
- The matching, bands and the write path are in `edge-ocr.md` sections 4 to 6 (`matching.ts` rules in the browser, source `receipt`, same service methods as chat). The mockup's `RS.out` is the one rule for what a line does; it is mockup code, not the build's.
- Check: `node tools/receipt-scan-check.mjs` (360 pages at 390, 768 and 1280, light and dark, plus a click-through of the whole flow in every option).
- Live revision check: `node tools/receipt-scan-live-check.mjs` (456 pages, flows in every direction, the clock). Reuse the worker `frame` message from #695 and `matching.ts` (RS-54).
