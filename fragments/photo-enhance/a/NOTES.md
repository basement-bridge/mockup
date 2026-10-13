# Photo enhance, Option A: Enhance lives inside Crop and rotate

Owner request (14 Oct 2026, typed): enhance recipe photos entirely in the browser, original kept unchanged in memory, conservative auto-enhancement, instant Original / Enhanced comparison (press and hold preferred), stepped levels that each render from the original, Canvas/Worker processing, encode and upload only after the user confirms, no server-side processing. Follow-up: mock it up first. This folder is mockup only. Nothing is built in Kitchie.

Open `index.html` (serve the repo, `python3 -m http.server 8101`). Real engine (`../engine/enhance.js`), real sample photos (`../engine/samples/`), plus "Try your own photo" (pure client side). Chips above the phone: width 360/390, start with Add / Crop a saved photo / After cooking, kind (banner 1600 px, step 960, more 960), a sample opened straight on the Enhance tab, and edge states (engine unsupported, HEIC it cannot read). On a phone the chips sit behind the small Mockup button.

## What the option is

One sheet, two tabs. The existing Crop and rotate sheet (`.cstage .cframe` canvas, rotate buttons, zoom, `.cinfo`, `.cnote`, `.cbar`) gets a tab row: **Crop** (today's sheet, unchanged) and **Enhance**. Enhance works on the cropped result: the engine session is opened on the cropped picture, and is re-opened if the crop changes. After picking a photo for Add or Replace, this sheet opens (today the pick goes straight to the queue).

## Decisions (PE-A-O*; every one is a Proposal unless the owner is quoted)

- **PE-A-O1 Where in the flow: inside Crop and rotate, after the crop. Proposal.** Add and Replace now open the sheet after the pick; "Upload as is" (top right) is exactly today's path (shrink, re-draw, WebP, square, queue). Cancel uploads nothing. Cost of a wrong guess: one extra tap on every add for people who never want Enhance; if the owner dislikes it, Option B/C/D are the alternatives.
- **PE-A-O2 Default off. Proposal.** The sheet opens on the Crop tab. Enhance is applied only if the person opened the Enhance tab and left a level other than Original; the Crop tab then says "Enhance: Balanced" so it is never a surprise. A small dot on the tab is the only nudge. Cost of a wrong guess: most people never find it (the main weakness of this option); fix is opening on Enhance for Add, which is a one-line change.
- **PE-A-O3 Level default and memory. Proposal.** First open of Enhance shows Balanced. The last level is remembered for this visit only (`sessionStorage`), not across visits, so a Full picked for one photo does not follow a person for ever. A new photo always opens on Crop.
- **PE-A-O4 Original / Enhanced control. Proposal.** An eye pill on the picture ("Hold: original"). Press and hold shows the original and release returns; pressing and holding the picture itself does the same. One quick press (under 220 ms) on the pill switches and stays, for people who cannot hold; Space or Enter held works the same; a screen reader's activation toggles. The Original level in the levels row is the plain toggle too. Two stacked canvases (`.ocv` original, `.ecv` enhanced) so the swap is a CSS opacity change, never a re-render. Touch: `touch-action:none`, `-webkit-touch-callout:none`, `user-select:none`, pointer capture, no context menu. `prefers-reduced-motion` removes the fade.
- **PE-A-O5 Cost of a wrong guess. Proposal.** Levels are conservative and Original is one tap; Undo works 5 minutes. After that the stored photo is the enhanced one.
- **PE-A-O6 Output sizes. Proposal.** The crop is painted at the target size (1600 x 1200 banner, 960 x 720 other, from the full-resolution decoded picture, so zooming in loses nothing the original had), and that crop is what the engine sees. Enhanced WebP comes from `session.encode(level, {maxEdge})`; the 240 px square is cut from that SAME finished picture, so it is never enhanced twice.
- **PE-A-O7 Cook-photo path ("add a photo after cooking"). Proposal.** No sheet, no Enhance: straight to the queue at 960 px as today. Dirty hands, one tap. Cost: dinner photos are never enhanced (Option A cannot reach them without adding a step to cook mode).
- **PE-A-O8 Crop a saved photo. Proposal.** Enhance is available there too, on the stored copy; that re-encodes an already lossy copy (a second WebP generation) and the sheet says "Works on the saved copy". Alternative: hide Enhance for saved photos. Cost of a wrong guess: slightly softer result than enhancing a fresh pick.
- **PE-A-O9 Large photos. Proposal.** A 12 to 48 MP pick is decoded once; "Reading a big photo" with an indeterminate bar while it decodes; the engine only ever sees the crop (at most 1600 px), so previews are fast. Use photo shows "Making the full-size photo" with the bar while encoding.
- **PE-A-O10 Already-good photo. Proposal.** When the engine's notes say "Looks good already" the notes row reads "Nothing needed" and one line says Balanced barely changes it and Original may be all you need. Nothing pretends.
- **PE-A-O11 Failure. Proposal.** Engine unsupported or not loadable: the tab row is not drawn, silently; the sheet is today's Crop and rotate. HEIC the browser cannot decode: today's message ("Use a JPEG, PNG or WebP picture"). Small photo: the existing "that is small, it will look soft" line.

## Open questions (need the owner)

1. **After Use photo, the original is gone (locked: "no originals").** A later "remove enhancement" is impossible. Proposal: keep it that way and say so in the sheet (it does). Wrong guess costs: a person who regrets Enhance has only the 5 minute Undo, then must re-add the photo. Alternative: keep the original in the phone's IndexedDB for the undo window only (still no server copy).
2. Should Add open the sheet at all (PE-A-O1)? This is the real choice between Option A and the others.
3. Should the Enhance dot nudge be stronger, or Add open on Enhance (PE-A-O2)?

## Loading (DESIGN.md section 6)

Default path: `index.html`, `a.css`, `a.js` (about 30 KB of script, no library). Deferred: the engine script is injected on the first point, focus or touch on the Enhance tab (`enhance.js` is small; its Worker starts only on `PhotoEnhance.open()`); the sample list and sample photos load when the source sheet opens; nothing is encoded until Use photo. `tools/photo-enhance-a-check.mjs` asserts the engine is not requested before the Enhance tab is pointed at.

## Lifting into the app

Same class names as `recipes-edit-photo.css` (`.cstage .cframe .crow .cinfo .cnote .cerr .cbar .pbar`; prefix with `.rtab`). New: `.etabs`, `.ocv`, `.ecv`, `.echip`, `.ehold`, `.elev`, `.enotes`, `.egood`. Differences from the app today: tab row; "Save" is "Use photo"; "Upload as is" added; the Add path opens this sheet; the crop canvas output is the target size painted from the full-resolution decode rather than from the stored copy. The side log, sample picker and fake recipe screen are mockup-only (in `a.js`). `.pq` and `.pqpill` are copied from `photo-queue.css` so the queue looks as it does today.

## Engine contract wishes

`PhotoEnhance.open()` takes a Blob, so the crop goes through a PNG round trip (`canvas.toBlob`, about 100 to 300 ms at 1600 px). Accepting a canvas or ImageBitmap would skip it. Not required.
