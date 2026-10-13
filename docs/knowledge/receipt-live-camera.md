# Live camera receipt scan, phone

Status: mockup drawn 14 October 2026 to show what is **already built** (Kitchie PR #695, v0.103.0, merged) so the owner can see how it behaves. Mockup only, phone only, nothing new is built from it. Owner direction, voice, 12 October 2026, quoted in the PR: "best effort, sensible decisions, I'll check before productionization". The owner has not yet reviewed the built behaviour; CS-D1 to CS-D9 record what was built, not what was confirmed.

Code: `fragments/receipt-live/` (`index.html`, `cam.css`, `cam.js`). Job: `jobs-to-be-done/receipt-scan.md` (the review it ends in) and `shopper-link.md` (phase two, scan the receipt). Live: <https://basement-bridge.github.io/mockup/fragments/receipt-live/>.

## What the page shows

A clickable phone: Basket, Viewfinder (conditions: receipt in view with auto-capture, blurry, held at a wall, resting), Review, Camera refused, Photo picker. Below it, the three overlay treatments and a strip of eleven frames, one state each.

## Decisions (as built)

- **CS-D1** Entry: a camera button (icon and the word Scan) in the basket bar next to Done shopping.
- **CS-D2** Live viewfinder, rear camera preferred. Boxes on read lines: on your list = solid thick filled box, tick, list name; usual swap = dashed, arrows, "Swap for X?"; other things bought = dotted, plus, "Other"; non-item lines = hairline.
- **CS-D3** Three counted chips repeat the signs and words. Colour is never the only cue.
- **CS-D4** Prompts: "Hold steady, the image is blurry." (confident); "Can't find a receipt (best guess): ..." (softer: little text, flat view, text that is not items and prices); "Receipt found. Hold steady..." with a progress bar; "Steady. Taking the photo...". A negative prompt needs two looks in a row.
- **CS-D5** Auto-capture: last 4 looks read as a receipt (an item and two prices, or a price and a total), same words in nearly the same places (75% of boxes within 0.6 line height), none blurry, over at least 1.2 s. Then a full-size frame (max 2200 px a side) goes into the unchanged review. Manual shutter always there.
- **CS-D6** Haptics: 15 ms the first time a list line is a direct match two looks running (once per line per viewfinder); 30 ms on the photo.
- **CS-D7** Review unchanged: matches ticked, doubtful need a Confirm, leftovers answered (add as bought, substitute, skip), one write.
- **CS-D8** Fallbacks: no camera API gives the old one-tap picker; refused or missing camera gives a "Take or choose a photo" screen (the picker opens by itself if the refusal came within 2.5 s of the tap, otherwise on a button); Choose a photo is on the viewfinder at all times.
- **CS-D9** Looking is capped at about 3 a second, one at a time, nothing while the page is hidden, and after 150 s without a photo the camera and looking stop until Resume. The stream is released on Done, Escape, a photo, an error or that rest. On a slow or metered connection with the engine not downloaded, the viewfinder is a plain camera and the download question comes after the photo.

**Proposal** (mockup's own, owner silent): sample receipt and list, where the prompt, steadiness bar and chips sit, review and refused-screen wording, the resting overlay, the sample picker.

## Not verified without a real phone

Focus, exposure, noise, rotation, frame rate, iOS Safari playsinline and autoplay; how the blur number and steady tolerance feel in a shaking hand on a real printed receipt; speed, battery and heat on a phone CPU; the vibration motor and the real permission prompt; the usual-swap list on real receipts.

## Still open

- Blur threshold: 0.10 on a synthetic receipt at a 720 px frame; needs a real phone.
- Steady tolerance (4 looks, 1.2 s, 75% within 0.6 line height) and the hold time.
- Swap list: a built-in short guess; the household's own substitution rules are not used. Who owns it, whether the household edits it.
- A low-confidence match is not drawn as a direct hit; the review still says Check.
- Haptics: direct matches only, or swaps too, and whether there is a setting.
- Whether a live swap should prefill the review's "Instead of...".
- Long receipts in several parts.

## Default path and deferred

The page loads `theme.css`, `shared.css`, `theme.js`, `cam.css`, `cam.js` and nothing else; it never opens a camera. In the build, nothing loads on page load; the camera, the looking and the reader's worker start when the person taps Scan.
