# Photo Enhance engine (shared by options A to D)

Files: `enhance.js` (main-thread API, 13.8 KB, 4.6 KB gzip est.), `enhance-worker.js` (the pixel work, 15.3 KB, 5.7 KB gzip), `samples/` + `samples.json` (6 test photos, 2.1 MB), `make-samples.py` (rebuilds them, deterministic), `index.html` (a bare demo: pick a sample, press a level), `../../tools/photo-enhance-engine-check.mjs` (27 checks, all pass).
Contract: as in the brief (`PhotoEnhance.open / session.render / prefetch / ready / encode / close`). Additions, all optional: `session.notesFor(levelId)`, `session.good`, `session.small`, `session.megapixels`, `session.encodeSet(level, {maxEdge, square, onProgress, ...})` (returns `{blob, width, height, square}`, the 240 square is cut from the SAME enhanced pixels, so it is never enhanced twice), `opts.crop` `{x,y,w,h}` as fractions of the original for render and encode (lets an option crop before enhancing without a second engine), `PhotoEnhance.stats` (counters the check tool reads: encodeCalls, workerStarted, dropped).
`open()` resolves after decode plus analysis (about 0.2 to 0.3 s), so `session.notes` is always filled. The UI can draw `session.original` itself the moment the file is picked, then call `open`.

## Decisions (Proposals: the owner made none of these)
- **PE-E-O1 Own typed-array code in one Worker. Proposal.** No OpenCV.js, no Pica, no WebGL.
- **PE-E-O2 Previews 1280 px long edge, encode at most 1600 (banner) or 960 (other), so the heavy work is never on more than 1.9 MP.** A 12 or 48 MP photo costs decode plus one downscale, not 48 MP of filtering.
- **PE-E-O3 The worker works on its own copy of the photo, capped at 3200 px long edge** (one high-quality downscale). `session.original` stays the full-size untouched bitmap on the main thread. Peak memory for a 48 MP photo is the decoded bitmap (about 190 MB) plus the 3200 px copy (about 41 MB). Open question: on a low-memory phone, decode with `resizeWidth` straight to 3200 instead and let `original` be that (changes "original is the full decode" slightly; probably fine because the app already shrinks to 1600 or 960).
- **PE-E-O4 Level strength = analysis value times k** (Light 0.4, Balanced 0.7, Full 1); white balance gains scale as gain^k. Every level starts from the original pixels; nothing reads another level's output.
- **PE-E-O5 One job in the worker at a time, user renders before prefetch, a render nobody waits for any more is dropped before it starts.** Latest call per canvas wins; a stale result is still cached (useful for the next switch) but never painted.
- **PE-E-O6 "Looks good already"**: when the analysis finds nothing worth doing, `session.good` is true and the notes are the single line "Looks good already". Balanced is then a near no-op (good.jpg: mean change 0.7 of 255) but not literally zero, because a little sharpening still runs.

## Pipeline (all clamped; thresholds are the tuning surface)
Analysis runs once on a 1280 px working copy (percentiles on a sample of about 120k pixels). Order of work per render: noise, then light (white balance, exposure, highlights and shadows in linear light), then vibrance, then unsharp mask.
- **Exposure**: median luma moves 60 % of the way to 0.46 (sRGB). Range -0.4 to +0.7 stop (darkening is also damped by 0.6), dead band under 0.15 stop, and brightening is limited so the 99th percentile does not clip.
- **White balance**: only from near-neutral bright pixels (saturation < 0.3, luma 0.45 to 0.97, at least 8 % of the picture); acts only when the measured cast is above 0.22 stop; gains 0.72 to 1.4. Food scenes dominated by one colour have too few neutral pixels and are left alone (the dark sample is a case: no change).
- **Highlights**: share of pixels above 0.985 (over 2 %) drives it; a smooth blurred-luminance mask (radius 3.5 % of the long edge, two box passes) plus a soft shoulder on the brightest channel, hue kept. **Shadows**: share below 0.12 and the 10th percentile and a low median; lift up to about +1.1 stop in the darkest smooth regions. Known artefact: a faint halo around a bright subject on a dark area at Full (see blown.jpg). Radius 3.5 % is the knob.
- **Vibrance**: only when mid-tone saturation is below 0.45; strength scales with (1 - saturation); reds and oranges are protected 80 %, yellow-olive 50 %, magenta-reds 55 %, so tomatoes, meat and skin stay put. Up to about +50 % chroma on grey-ish pixels at Full.
- **Noise**: sigma measured from a median Laplacian on luma (robust to texture). Denoise only starts above about 1.2 levels sigma. 5x5 bilateral, chroma first and smoothed harder than luma, stronger in the shadows; range weights scale with the measured sigma so edges stay.
- **Sharpen**: unsharp on luma, radius from output size (1 px per 1600 px of long edge, three box passes), amount 0.8 x k, reduced when the photo is noisy, with coring so grain is not sharpened.

## Library decision (numbers measured today, 14 Oct 2026, headless Chromium (Playwright 1.56 build) on a software-rendered VM; phones will differ, a mid phone is typically 2 to 4 times slower on this kind of loop)
| Option | Cost | Verdict |
|---|---|---|
| Own code in a Worker (chosen) | 29 KB of JS in two files (about 10 KB gzip), no wasm, no CDN, no new dependency; loaded only when a person engages Enhance | chosen |
| OpenCV.js (`@techstark/opencv-js` 5.0.0) | `dist/opencv.js` is **13.3 MB** (3.8 MB gzip), the wasm is inlined; init is seconds. For a pipeline of curves, a blur and a bilateral filter we use about 1 % of it | rejected: 450 times our code, and against DESIGN.md section 6 |
| Pica 10.0.3 | `pica.min.js` 54 KB (15 KB gzip). Resize 4800 to 1600 px: **1400 ms** (js+wasm+ww features) vs **65 ms** for `drawImage` with `imageSmoothingQuality="high"`. PSNR against a PIL Lanczos reference: Pica 57.1 dB, canvas high 49.8 dB (canvas low 46.3) | rejected: 22 times slower here, and 49.8 dB is already invisible on a 1600 px recipe photo. Revisit only if a visible aliasing complaint appears on very large photos |
| WebGL | Would make the per-pixel steps (tone, vibrance, unsharp) take a few ms instead of 100 to 300 ms and give a live slider. Costs: no OffscreenCanvas WebGL on older Safari, context-loss handling, a second implementation of the noise filter, and byte-identical output across GPUs is not guaranteed (the "balanced twice is identical" guarantee would weaken) | not worth it for stepped levels cached after the first render; revisit if the owner wants a continuous slider |

## Real size and speed (this machine; `node tools/photo-enhance-engine-check.mjs`)
Open (decode, 3200 px copy, analysis) 290 to 410 ms for 1.9 MP, 810 ms for the 17.3 MP large.jpg (analysis itself about 200 to 320 ms, always on a 1280 px copy, so it does not grow with photo size).
Preview render at 1280 px, per level, from cold: 215 to 510 ms for normal photos, **about 1.0 s for noisy.jpg** (the bilateral filter is the slow step). Cached level: same frame (a putImageData). `prefetch(["light","balanced","full"])` therefore costs 1 to 3 s of background work in the worker, off the main thread; the main thread kept 10 ms timer ticks throughout (check passes).
Encode on confirm (1600 px, full pipeline, WebP q 0.82, plus 240 square): 0.6 to 2.0 s; large.jpg (17.3 MP in, 1600 out) 0.8 s. Output sizes: 46 to 120 KB, noisy.jpg 477 KB (grain compresses badly, so a noisy photo is a big file even after smoothing). The same cost applies at 48 MP apart from decode.
Memory: a 1280 px preview is 4.9 MB of pixels per cached level, at most 8 cached, so under 40 MB.

## Samples
`dark.jpg` (about 1.4 stops under, flat), `warm.jpg` (yellow bulb cast), `blown.jpg` (plate clipped), `noisy.jpg` (low light, luma plus colour noise), `good.jpg` (nothing to fix), `large.jpg` (4800 x 3600, 17.3 MP, 609 KB at q 55). They are made from the repo's food illustrations plus procedural grain, vignette and the flaw, because no real photo exists in the repo and nothing can be downloaded. They are flat vector art with texture added, so they exercise the maths but real photographs will behave differently (more texture, so Light and Balanced noise and sharpen effects will look more natural). Treat tuning as provisional until real phone photos are tried (use "Try your own photo").
Honest limit: the exposure cap (+0.7 stop) means very dark photos get better but not fixed; dark.jpg is about 1.4 stops under and ends roughly 0.7 stop under at Full. That is the brief's conservative setting, an easy knob.

## What loads, what is deferred (DESIGN.md section 6)
Default path (page load): nothing. Not `enhance.js`, not the worker. A mockup option that includes `enhance.js` by `<script>` pays 13.8 KB; in the app, load the script (not the worker) only when the person opens the photo sheet's Enhance step, and the worker is created inside `open()`. Deferred until engagement: worker, decode, analysis, previews. Deferred until Use photo: encoding (verified by the `encodeCalls` counter).

## Known gaps and open questions
- No HEIC decode (the browser decides; `open` rejects with code `decode`, UIs keep today's behaviour).
- iOS Safari: OffscreenCanvas 2D and `convertToBlob` need 16.4 or later; older versions get `supported:false` and no Enhance. Unverified on a real phone.
- WebP encode in Safari: `convertToBlob` with image/webp falls back to PNG on older Safari; the app's existing shrink step has the same limit (check the type of the returned blob).
- Tuning (all thresholds) is by eye on synthetic samples. Wrong-guess cost: Balanced applying a wrong colour shift to a real photo; mitigated by the clamp, the "only if neutral pixels exist" rule and one-tap Original.
