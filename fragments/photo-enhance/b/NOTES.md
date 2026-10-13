# Option B: Enhance as its own step

Flow: Pick -> Crop and rotate (today's, unchanged) -> **Enhance** -> Use photo / Skip -> the existing upload queue. Real engine (`../engine/enhance.js`), real sample photos, plus "Try your own photo" (stays on the phone). Serve the repo root, open `fragments/photo-enhance/b/index.html`. Check: `tools/photo-enhance-b-check.mjs`.

Owner's words: "Keep the original image unchanged in memory. Apply conservative auto-enhancement in the preview ... Provide an instant Original / Enhanced comparison, preferably with press-and-hold ... levels may be stepped ... render from the original ... Only encode/compress and upload the selected result once the user confirms."

## Decisions (everything not owner-made is a **Proposal**)
- **PE-B-O1 Where in the flow.** **Proposal:** after Crop and rotate, before Use photo. Enhance then only sees pixels that are kept, and the 240 px square is cut from the same enhanced result (never enhanced twice). Cost of a wrong guess: low; the step is one screen and moves.
- **PE-B-O2 A separate step, not a toggle.** **Proposal.** The full-size preview and the hold button get the whole screen on a 360 px phone; the cost is one extra tap on every photo (Skip is one tap, top right and bottom left).
- **PE-B-O3 Default.** **Proposal:** the step is always shown and Balanced is selected. If the engine says the photo is fine ("Looks good already") the screen says so plainly and Skip is the obvious choice; Balanced is not hidden or faked.
- **PE-B-O4 Level persists.** **Proposal:** the last chosen level is remembered for the tab (sessionStorage), but Original is never remembered (it would silently turn Enhance off). Not stored on the server.
- **PE-B-O5 Original / Enhanced control.** **Proposal:** a wide "Hold for original" button (pointer capture; Space or Enter held), the preview itself also holds, and a round eye button toggles for people who cannot hold (`aria-pressed`). Chip on the photo says Original or the level. Live region announces "Showing the original / Showing Balanced". `touch-action:none`, `-webkit-touch-callout:none`, `user-select:none`, reduced motion respected. The original canvas is already drawn, so the swap is an opacity change, never a render.
- **PE-B-O6 Levels.** Stepped chips Original / Light / Balanced / Full (radiogroup, arrow keys). Each renders from the original (checked: Balanced before and after Light, Full, Original is byte-identical).
- **PE-B-O7 What changed.** Collapsed; the engine's notes in plain words plus "Balanced uses 70% of each change". Original level says "Nothing changed".
- **PE-B-O8 Confirm.** "Use photo" is the only place `encode()` runs (counted in the check). It shows "Making it at 1600 px" (indeterminate bar; for 12 MP and up "Making the full size (17 MP). This takes a few seconds."), then the result: long edge, KB, the square's KB, location removed. Skip uploads the original as today (also via `encode("off")`, the phone's usual shrink).
- **PE-B-O9 Sizes.** Banner 1600 px, every other kind 960 px, plus a 240 px square cut from the same result. The kind is shown at the top of the pick screen and in the Mockup panel (Banner / Step / Photo / What you made).
- **PE-B-O10 Cost of a wrong guess.** The person sees the result before it is made and can hold, step down a level or Skip. The residual risk is "Full" on a photo that did not need it; the notes say what moved.
- **PE-B-O11 Accessibility.** 44 px targets (checked), labelled icon buttons, no colour-only state, keyboard hold, toggle alternative, canvases have labels, the original is never hidden from screen readers.
- **PE-B-O12 Cook photo path.** Same step, same default. `?from=cook` changes only the exit ("Back to the cook"). Proposal: nothing is faster there; if cooking-mode taps feel heavy the owner may want default Skip in cook mode (open question).
- **PE-B-O13 Queue.** Hand-off uses the queue's own chip states and wording (Waiting, Uploading n%, Done); leaving the screen is the queue's pill, unchanged.

## Edge states (all in the mockup)
Engine unsupported (`?force=unsupported`): the Enhance step never appears, upload as today, no message. Open failure after the screen starts: the same silent fallback. Big photo: notice on the step, preview at 1280, full size on confirm. Already good: dashed "Looks good already" line. Small photo (400 px sample): below 640 px a soft warning, below 240 px "too small", Next disabled. HEIC the browser cannot open: Enhance skipped, "goes as it is", shows "Photo is being prepared" (existing behaviour). Preparing: a quiet chip only when a level is not cached.

## Open questions for the owner
1. **PE-B-Q1 No originals on the server** (locked). The stored photo is the enhanced one; "remove enhancement" later is impossible. The mockup says so after saving and the 5-minute Undo only removes the photo. **Proposal:** keep this; the preview-before-confirm is the safety net. Wrong guess: someone is unhappy with a stored photo and must re-add it from their own library.
2. Is one extra step on every photo acceptable, or should it be skippable by default after the first Skip (remembering "Skip" per tab)? Wrong guess: either nagging or silently skipping.
3. After a crop the person might expect to crop again after seeing the enhanced photo: Back returns to Crop and drops the session (the engine decodes again).

## Loading (DESIGN.md section 6)
Default path: `index.html`, `b.css`, `b.js`, the shared theme and recipe CSS, and the sample list fetch. **Deferred:** `../engine/enhance.js` and its worker load only when the person taps Next on the Crop step (shown in the Mockup panel, "What this page loaded"); the sample thumbnails load lazily on the pick screen; previews for the other levels prefetch in the background after the first render. Nothing is encoded or uploaded before Use photo.

## Not verified
Real phones (touch hold, iOS long-press callout), real upload, WebGL (not used). The Crop step is a stand-in with no gesture.
