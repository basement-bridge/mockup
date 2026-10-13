# Photo enhance (client side)

Status: four options drawn 14 Oct 2026, **mockup only, nothing built, owner picks first**. Everything not quoted from the owner is a **Proposal**.

## Job
Owner ask (typed, 14 Oct 2026): "Implement recipe-photo enhancement entirely client-side in the browser. Keep the original image unchanged in memory. Apply conservative auto-enhancement in the preview: exposure, white balance, highlights/shadows, vibrance, noise reduction and mild sharpening. Provide an instant Original / Enhanced comparison, preferably with press-and-hold to view the original. Enhancement levels may be stepped, but each level should render from the original rather than cumulatively modifying the previous result. Perform processing in Canvas/WebGL/WASM/Web Worker as appropriate; consider OpenCV.js and Pica. Only encode/compress and upload the selected result once the user confirms. No server-side image processing should be required." Then: "get it mocked up first".

## How we know the person is in this job
They just picked or took a photo for a recipe (Add / Replace, or after cooking).

## What leads
The photo, then a way to compare Original and Enhanced without thinking.

## What this job does not need
Server processing, a paid service, the original kept on the server (locked earlier: no originals), any engine download before the person engages Enhance.

## Mockup
Hub tile "Recipe photo enhance, four options" in `index.html`. All four use one real engine in `fragments/photo-enhance/engine/` (Web Worker, own typed-array code; try your own photo on each page).
- A: a tab inside Crop and rotate (PR #190).
- B: its own step with level chips and a Hold for original button (PR #189).
- C: auto-on, "Enhanced" pill, Undo (PR #192).
- D: split slider plus strength slider (PR #191).
Engine: PR #188. Checks: `tools/photo-enhance-*-check.mjs`.

## Engine (Proposal, numbers in engine/NOTES.md)
Own code in one Worker. OpenCV.js rejected (13.3 MB). Pica rejected (1400 ms vs 65 ms for canvas drawImage, 4800 to 1600 px). WebGL not worth it for stepped levels. Levels Original / Light / Balanced / Full, each rendered from the untouched original; encode only on Use photo; the 240 px square is cut from the same enhanced result.

## Open questions (all four options raise them)
1. No originals on the server, so "remove enhancement" later is impossible. Proposal: keep that and say so on screen. Cost of a wrong guess: a bad enhance on a photo nobody checked can't be reverted.
2. Default on (C) or opt-in (A, B, D)? Cost: C processes every photo; opt-in hides the feature.
3. Does the level persist between photos, including Original?
4. Cook mode "add a photo after cooking": Skip by default, or auto (C)?
5. Should a very dark photo be allowed more than the +0.7 stop cap?
6. Which option leads (the real choice is where it sits: in Crop, a step, automatic, or a slider).

## Not verified
Real phones (iOS long-press, Safari WebP, older Safari lacks support and falls back silently), real photographs (samples are the repo illustrations with flaws added), screen readers, speed on a mid phone.

## For the implementation
Build only after the owner picks. Goes before the existing shrink and upload in `recipes-edit-photo.js`; engine files lazy-loaded on engagement; version bump, plan row and tests per Kitchie rules.
