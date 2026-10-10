# Reading text from a photo, on the phone (edge OCR)

Status: owner direction by voice and typing, 11 October 2026 (decisions **OCR-D1 to OCR-D4**, below). Survey and proposal only: nothing is built and no screen is drawn yet (mockup screens are a follow-up). Everything marked **Proposal** is from Claude, dated 11 October 2026, and is not a decision. Facts about code were read on the `uat` branch of kitchie (`8af54b0`, v0.71.5), recipe (`f491328`) and platform (`496da74`) on 11 October 2026. The older local clones under `/home/claude/` are behind `uat` and do not contain the shopper link; do not survey from them.

## Job

Anywhere a photo has to be turned into text, the phone does it, in the browser, with no AI model and no server step. The first place is the receipt: while shopping, or just after, take one photo and have what was bought lined up against the shopping list. Labels (use-by dates, nutrition panels) are the next place the same engine can serve.

The owner (voice and typing, 11 October 2026): do OCR "on the edge", in the browser with WebAssembly, wherever a photo needs text read out. There is no AI fallback and no server AI step. "The fallback is a human": the person updates quantities and confirms the items that were bought. The owner is "open to anything more performant or lightweight than Tesseract.js", as long as it runs in the browser (WebAssembly or WebGPU is fine).

## Owner decisions (11 October 2026)

| Id | Decision |
|---|---|
| OCR-D1 | OCR runs in the browser (WebAssembly), on the person's device, wherever a photo needs text read: receipts while shopping, labels, and so on. |
| OCR-D2 | No AI fallback and no server AI step. |
| OCR-D3 | The fallback when the read is poor is a human: the person updates quantities and confirms the items that were bought, over what OCR matched. |
| OCR-D4 | Tesseract.js is not required. Anything more performant or lightweight is welcome if it runs in the browser (WASM or WebGPU). |

This changes two things the owner said on 10 October 2026 (see `../shopper-link.md`, phase two): the receipt is no longer sent to the Kitchie server over a WebSocket and read there, and the "no tokens" rule becomes "no model at all". His thresholds (80% of the list's lines found, one more try, then the fallback message that steers to ticking) were not withdrawn; section 5 keeps them as the proposal and lists the choice.

## How we know the person is in this job

Not captured as a separate trigger. The receipt read belongs to Shopping without the app (the shopper link, "Snap the receipt") and to the signed-in member's Shopping screen ("Done shopping"). The engine loads only when the person opens a scan, never before (section 3).

## What leads

The photo, then one screen that says what was found and asks the person to check it. Never a blank wait, and never a write to the household's real list or Pantry before the person has pressed the confirming button (OCR-D3).

## What this job does not need

No account, no server upload of the image, no stored photo, no AI turn, no live camera preview (a plain camera picker is enough), no barcode (a different feature), no language choice (English first).

## 1. Current state: where a photo becomes text today

### 1.1 Short answer

There is no OCR and no model call anywhere in kitchie, recipe or platform. The reading happens in the member's **own AI app** (Claude, ChatGPT or Gemini, chosen under "My assistant"), which is connected to Kitchie through MCP. The photo goes from the person's phone to that AI company, never to Kitchie. The assistant then calls Kitchie's tools with structured items. So today's "AI does the OCR" is real, but it is not Kitchie's call, endpoint or bill.

### 1.2 Evidence

| Question | What the code and docs show |
|---|---|
| Does any repo call a model? | No. `kitchie/server/package.json` has two runtime dependencies, `@modelcontextprotocol/sdk` and `zod`. A search of all three repos for model SDKs, vision, `input_image`, `image_url`, `FileReader`, `getUserMedia`, multipart upload and `capture=` found nothing outside tests and prose. No API key, model name, endpoint or price is configured anywhere. |
| Is that on purpose? | Yes. `docs/project-plan.md`, Phase 1 direction (29 September 2026): "Kitchie does no image, video or audio processing. ChatGPT performs vision and voice interpretation and calls Kitchie through MCP hooks with structured data." Media intake was removed from scope the same day. |
| What does the assistant send? | The MCP `add_item` tool (`server/src/mcp.ts`) takes a free-text `source` ("Who or what is making this change, e.g. 'chatgpt-voice'. Defaults to 'chatgpt'"). A receipt add carries something like "receipt photo". It also uses `shopping_remove` and `correct_item`. |
| Where does "receipt" show up in the data? | Stock and quantity provenance have a closed `source` list that includes `receipt` (`server/src/stock.ts` `SOURCES`; the item column `level_source` allows it; `web-stock.ts` words it "from the receipt"). `server/src/telemetry.ts` (lines 91 to 93) maps any free-text source matching `/receipt/i` to the analytics value `receipt`, otherwise `assistant`; the platform contract allows `manual`, `receipt`, `assistant` (`packages/contract/src/telemetry-events.ts`, `docs/telemetry-events.md`). One event is sent per add action with a `count` (1 to 1000), not one per line. |
| Is there a documented receipt path? | `docs/ideas/low-friction-loop.md` in kitchie: **L4** "The receipt goes to the member's own assistant" (works today: the tools exist; "this has been done in practice from a warehouse-shop receipt in the owner's own assistant chats"), and **L9** "Receipt read on the server", the owner's phase two, issue #509, deferred by him on 10 October 2026. L9 lists its own costs: a new OCR dependency, server CPU per photo, an image upload by someone who is not signed in, and the point that "the 80% bar is hard for a reason that is not image quality" because till receipts abbreviate ("GV MLK 2%"). |
| Model, cost, usage? | Kitchie's own AI cost is nil: no call, no token counter, no spend line. The cost of an assistant receipt read is the member's own AI plan (one image input plus one tool call per line; `server/bench/add-item.bench.ts` models a receipt as 30 adds). It is not measured anywhere. The only usage signal is the `item.added` analytics event with `source: receipt` and its `count`. |

### 1.3 Every photo-to-text flow found

| Flow | Where | Who reads the photo today | Status |
|---|---|---|---|
| Receipt, shopper link (phase two) | Kitchie `server/src/assets/shopper.js` (header: "the receipt loader (phase two) is left out: scanning a receipt is not built"); `docs/adr/shopper-link.md` ("not built. It needs an image upload by an unsigned-in caller and a new dependency"). Mockup stand-in: `fragments/shopper-link/receipt.js`, which assumes a WebSocket and server OCR. | Nobody. Not built. | Deferred. The mockup stand-in is now out of date (OCR-D1). |
| Receipt, member | Kitchie Shopping screen "Done shopping" (`assets/shopping.js`, `web-shopping.ts`, route `POST /shopping/bought` with up to 50 `entry` and `quantity` pairs, and the "How much did you buy?" question). No photo input. | The member's assistant, outside the app (L4). | Works through the assistant only. |
| Receipt, shopper's chat | The shopper replies to the family chat with a photo (L4). | The household member's assistant. | Works by hand. |
| Product label, nutrition panel | Recipe `record_nutrition` (tier `label`, "user photographs a HelloFresh card showing 650 kcal"); stock `product_label` source. | The assistant reads, then calls the tool. | Works through the assistant. |
| Use-by date on a label | `set_use_by` tool. | The assistant. | Works through the assistant. |
| Recipe card photo | Recipe `create_recipe` with `source.kind` `photo_card` or `scan` (`server/src/domain.ts`); `docs/project-plan.md` M9: "No image/OCR pipeline: the caller extracts and submits". | The assistant. | Works through the assistant. Partial recipes with unknown quantities are accepted on purpose. |
| Fridge or shelf photo | Idea I5 (`docs/ideas/backlog.md`): the assistant sees the photo and calls a read-only compare tool. Not built. | The assistant. | Idea only. |
| Scan in (camera, pile, talk and show) | Mockup `fragments/scan-in/`; job file `scan-in.md` says how anything is recognised "is deliberately not shown or decided". | n/a | Mockup only. |
| Platform | Nothing reads images. It only carries the `receipt` analytics value. | n/a | n/a |

### 1.4 Facts about the app that shape the build

These were read in the code and are the constraints the proposal has to respect.

- **Content Security Policy** (`server/src/app.ts` `SECURITY_HEADERS`): `default-src 'none'; script-src 'self'; connect-src 'self'; worker-src 'self'; img-src 'self'; ...`. WebAssembly needs `'wasm-unsafe-eval'` in `script-src`, which is not there today. Everything the engine loads must be served from Kitchie's own origin, which is also what the owner wants (nothing leaves the device, no third-party CDN).
- **Static files**: scripts and the stylesheet come from a fixed table (`ASSET_FILES`) with content type `text/javascript` or `text/css` and a versioned URL (`?v=`) cached for a year as immutable; fonts come from a second allow-list. There is no route for `.wasm`, `.onnx` or `.txt` files.
- **Service worker** (`server/src/pwa.ts`): on activation it deletes every cache whose name is not the shell cache or `kitchie-list`, and its `/assets/` handler copies every versioned asset into the shell cache. A separate OCR cache would be deleted at the next release unless it is let through, and tens of megabytes of model files must not be copied into the shell cache. The shopper page does not register the service worker (no `pwa` reference in `shopper-page.ts`), so it relies on the browser's HTTP cache plus its own use of Cache Storage.
- **No cross-origin isolation**: there are no COOP/COEP headers, so multi-threaded WebAssembly is off. Single-thread WebAssembly runs everywhere.
- **Shopper link boundary**: `server/test/shopper-link-boundary.test.ts` holds that an unsigned-in caller reaches only the link's own shopping-list actions. Edge OCR keeps that: the image never leaves the phone, so no upload route is needed, and the result is sent through the routes that already exist (`line`, `extra`, `batch` with `got`, `swap_<key>`, `also`, `confirm`). This removes the L9 and ADR objection about an image upload by someone who is not signed in.
- **What the shopper page holds**: each list line has `data-key`, `data-name`, its quantity text and emoji (`shopper-page.ts`); the household's Pantry names are not on that page, and by design they should not be. Receipt lines that match no list line therefore go to the existing free-text "also got" box, and the server's add-item matching decides what the Pantry does with them (already built, SL-D10 and issue 546). The signed-in Shopping screen can match against the Pantry too.
- **Matching exists already**: `server/src/matching.ts` (`nameTokens`, `compareNames`: `same_words`, `more_specific`, `less_specific`, `none`; filler words and sizes dropped; plurals folded). It is TypeScript on the server. The browser needs the same rules in plain JavaScript (section 4).

## 2. In-browser engines compared

Verified on 11 October 2026 by web search, by fetching the vendors' own pages, and by downloading the npm packages and measuring the files. "Measured" means I measured it; "reported" means a third party or the vendor says so; "estimate" is mine and is to be replaced by the slice 1 benchmark.

### 2.1 Table

| | Tesseract.js 7.0.0 | tesseract-wasm 0.11.0 | PP-OCR via ONNX Runtime Web (PaddleOCR models) | Others |
|---|---|---|---|---|
| What it is | Emscripten port of Tesseract 5 (LSTM) with a worker wrapper. Dec 2025 release. | Smaller Tesseract build by the Hypothesis team (Oct 2025), LSTM only. | Text **detector** (finds line boxes) plus text **recogniser** (CTC), run by onnxruntime-web (ORT, 1.30.0, Sept 2026, MIT). PP-OCRv5 (2025) and PP-OCRv6 (June 2026; tiny, small, medium). | See 2.3. |
| Licence | Apache-2.0 | BSD-2-Clause | Models and PaddleOCR code Apache-2.0; ORT MIT; wrappers MIT or Apache-2.0 | Scribe.js is AGPL-3.0 (a problem). |
| Download, first use (measured) | `tesseract-core-simd-lstm.wasm` 2.87 MB raw, **1.06 MB gzip**; English data `4.0.0_best_int` **2.95 MB** (the default float `4.0.0` file is 10.9 MB gzip). About **4 MB** on the wire plus about 70 KB of JavaScript (estimate). | `tesseract-core.wasm` 1.84 MB raw, **0.73 MB gzip**; plus a model of about 2 to 3 MB (not measured). About **3 to 4 MB**. | ORT `ort-wasm-simd-threaded.wasm` 14.2 MB raw, **3.66 MB gzip** (the WebGPU build is 28.3 MB raw, 6.6 MB gzip). Models (reported, ONNX): PP-OCRv5 mobile detector **4.6 MiB**, English-only recogniser **7.5 MiB** (the multi-script v5 recogniser is 15.8 MiB). Models do not compress. About **16 MB on the wire** with the English recogniser; about 24 MB with the multi-script one. PP-OCRv6 tiny and small file sizes were not found; v6 is smaller and faster by the vendor's account (tiny 6.1x faster than v5 mobile on Apple M4, reported). | Transformers.js with TrOCR or a vision model: hundreds of MB (reported), and a vision-language model is an AI model, which OCR-D2 rules out. |
| Cached after first load | Yes. The library keeps language data in IndexedDB by default (`cacheMethod`); the core wasm relies on the HTTP cache. | Same idea, you wire the cache. | You wire the cache (HTTP immutable cache plus Cache Storage). The wrappers fetch on every page load and lean on the HTTP cache; one suggests a service worker or IndexedDB for offline. | n/a |
| Speed | The library's own guide says setup can dominate run time, and to keep one worker alive. No published mid-phone numbers found. Vendor-run SROIE test, native CPU, Tesseract 5.3.4: median 671 ms a page, 95th percentile 1.5 s. | Similar engine, lighter build; no numbers found. | Native CPU reference: PP-OCRv5 mobile 1.75 s a page on a server Xeon (PaddleOCR). Roboflow, Apple CPU, PP-OCRv6: detector tiny 63 ms and small 104 ms (640x480), recogniser tiny 17.6 ms and small 96.7 ms (batch of 8). A maintainer's receipt benchmark (M1, Bun, canvas-native) is about 200 ms a page. **Estimate for a mid-range phone in the browser (single-thread WASM): roughly 2 to 7 s for a 30-line receipt.** WebGPU is 2 to 5x faster on Chrome and Edge by one maintainer's claim, not measured here. | n/a |
| Receipt accuracy (reported, vendor-run, so treat with care) | SROIE receipts: character error 0.335, word error 0.559. Faded thermal receipts (748 Korean receipts, flatbed scans): word accuracy 64.7%. Struggles with skewed, curled, photographed paper because it segments a whole page first. | As Tesseract. | SROIE: character error **0.205**, word error 0.326, and a higher field-level F1 (0.33 against 0.23 with plain pattern matching, which is what we would use; 0.58 against 0.44 with a language model on top, which we do not). Faded thermal: **73.3%**. A maintainer's English receipt benchmark: 96.6 to 98.4% (his own set, on M1). The detector finds each line separately, which suits a photographed, slightly skewed receipt. | n/a |
| Confidence per line | Yes: words and lines carry a confidence. | Yes. | Yes: the recogniser's per-character probabilities give a line score. | n/a |
| Maintenance | Active; v7 in Dec 2025; large user base. | Single team, last release Oct 2025. | PaddleOCR is very active (v6 in June 2026). Official browser SDK `@paddleocr/paddleocr-js` is 0.4.x (June 2026) and still young; it bundles OpenCV.js (an 11 MB worker) and by default downloads models from Baidu's storage and ORT from a public CDN, which we would replace with our own files. `ppu-paddle-ocr` 6.6.1 (Oct 2026, MIT, 287 KB) is a thin canvas-only wrapper with a browser entry, one maintainer. | n/a |
| Fit to our CSP and hosting | Core, worker and data are self-hostable; needs `wasm-unsafe-eval`. | Same. | Same, plus ORT `wasmPaths` pointed at our files. Multi-threading needs COOP/COEP, which we do not set, so single thread. | n/a |

### 2.2 Why detection matters more than the numbers

A photographed receipt is narrow, tall, slightly skewed and often curled. Tesseract looks for a page layout and then reads it; skew and curl break the line finding before recognition even starts, and it wants clean binarised input. A PP-OCR detector finds each text line's box wherever it is, and the recogniser reads one line at a time, which is the shape of the data we want (one line per receipt row). That mechanism, more than any one benchmark number, is why the PaddleOCR family is expected to beat Tesseract on phone photos of receipts. All published figures above come from vendors or third parties with their own data and cannot be taken as ours. The slice 1 benchmark is the gate.

Accuracy of the read is also not the main risk. Till text abbreviates; the matching and the human check (sections 4 and 5) carry the result either way.

### 2.3 Others looked at and set aside

| Candidate | Why not |
|---|---|
| Browser built-in `TextDetector` (Shape Detection API) | Behind a flag since Chrome 83, launch status "In Progress", recognised text only "on some platforms", and not standardised. Not shippable. |
| Scribe.js | AGPL-3.0 and a 46 MB package. |
| TrOCR, Florence-2 and other transformer or vision-language models in Transformers.js | Hundreds of MB, WebGPU-hungry, slow, and a vision-language model is the AI step OCR-D2 rules out. |
| Native text recognition (iOS Live Text, Android ML Kit) | Not reachable from a web page. Only an option if Kitchie ever became a wrapped native app. |
| `@gutenye/ocr-browser` | MIT and works, but ships PP-OCRv4 Chinese-and-English models (detector 4.7 MB, recogniser 10.8 MB measured). Same ORT cost with older models. Useful as a fallback source of files, not as the pick. |
| Old pure-JS OCR (ocrad.js and kin) | Not accurate enough for photos. |

## 3. Recommended engine and loading strategy

**Proposal (11 October 2026, from Claude).**

### 3.1 Engine

Use **PP-OCR (the PaddleOCR family) on onnxruntime-web, WebAssembly backend by default**, with the model files self-hosted:

- Detector: PP-OCRv5 mobile detector (4.6 MiB) to start; PP-OCRv6 tiny or small as a drop-in swap when slice 1 measures them smaller or faster on the owner's phone.
- Recogniser: the **English-only** PP-OCRv5 mobile recogniser (7.5 MiB) to start. The multi-script one (15.8 MiB) is not needed for English receipts. This is a choice for the owner (see Options needing a pick).
- Runtime: onnxruntime-web 1.30.0 plain WebAssembly (3.66 MB gzip). WebGPU as a progressive extra on Chrome and Edge only (its larger runtime is a second file loaded only when the browser reports WebGPU and the person has used scan before; ORT's own page lists WebGPU for Chrome and Edge on Windows, Android and macOS and not for iOS, Safari or Firefox, so check again at build time).
- Our own thin pipeline (decode, resize, detect, sort boxes, crop, batch recognise, CTC decode, score) of a few hundred lines in one file, using `ppu-paddle-ocr/web` or `@paddleocr/paddleocr-js` as the reference rather than a dependency. Reason: Kitchie has two runtime dependencies and no build step; a wrapper that bundles OpenCV or fetches from a third-party CDN is the wrong shape, and the wrappers are 0.x or single-maintainer.

Expected first download: about **16 MB** on the wire (ORT 3.7 MB, detector 4.8 MB, recogniser 7.9 MB), cached after that. Estimate for a warm read on a mid-range phone: 2 to 7 s, to be measured.

**Fallback engine if slice 1 fails its gate**: Tesseract.js 7 (or tesseract-wasm), about 4 MB, pointed at self-hosted files and the `4.0.0_best_int` English data. It is lighter to download and the safer choice for very old phones, at the cost of expected worse reads on photographed receipts. The matching and confirm screen are identical for either, so this is a swap of one file.

### 3.2 Loading strategy (performance first; DESIGN.md section 6)

What the default path loads: **nothing**. The Shopping screen and the shopper page carry no OCR code, no camera input and no extra header. This matches the rule already written for the receipt mode ("the receipt code, the camera input and the WebSocket load nothing until that mode is chosen").

| Step | What happens | Notes |
|---|---|---|
| 1. Intent | The person picks "Snap the receipt" (shopper page) or "Scan receipt" (Shopping screen). Only now is `receipt-scan.js` fetched (small; shell and states only). | Same as the loader in the existing mockup (`receipt.js`), minus the socket. |
| 2. Camera | A hidden `<input type="file" accept="image/*" capture="environment">` opens the phone's own camera. No `getUserMedia`, no live preview, no CSP change, full-resolution photo. On desktop the same input opens a file picker; drop and paste are added by the desktop file. | |
| 3. Warm-up while the camera is open | In parallel with taking the photo (which takes the person at least several seconds), a module worker is started and the engine files are fetched and the ORT sessions created. | If everything is already cached the worker is ready before the photo is. |
| 4. First download on a phone | If the files are not cached and the connection looks metered (`navigator.connection.saveData`, or effective type below 4g, where the browser exposes it), the screen first says "Reading receipts needs a one-time download of about 16 MB. Download now, or tick the list instead", and the tick-list path is one tap away. On Wi-Fi or an unknown connection it just starts. | Proposal. Choice 3 in Options. |
| 5. Read | Decode with `createImageBitmap` (honouring photo orientation), downscale so the longer side is about 1600 px, split a tall receipt into overlapping strips, detect, crop, recognise in batches, all in the worker and an `OffscreenCanvas`. Progress messages go to the page ("Reading... 14 of about 30 lines"). The main thread never blocks. | Abort on page hide or Cancel. |
| 6. Discard | The image bitmap and canvases are closed after the read. The photo is never uploaded and never stored; only text lines and their scores remain, in memory, until Send or Cancel. | Receipt contains shop, time, part of a card number. A real privacy gain over the assistant route, where the photo goes to a third party. |

Where the files live and how they are cached:

- A new allow-listed route, for example `/assets/ocr/<name>`, for a fixed list of files (engine module, worker, ORT loader and wasm, detector, recogniser, dictionary). Content types `application/wasm`, `text/javascript`, `application/octet-stream`, `text/plain`; versioned URL with `cache-control: public, max-age=31536000, immutable`; the version is the model version, not the app release, so a normal release does not re-download 16 MB. Caddy already compresses with zstd and gzip, which helps the wasm and does nothing for the models.
- Content Security Policy: add `'wasm-unsafe-eval'` to `script-src` **only on the responses that offer scanning** (the shopper page and the Shopping screen), not to the shared constant. `worker-src 'self'` is already there. No `blob:` is needed if the preview is drawn on a canvas.
- Cache: the page (not the service worker) saves the files in Cache Storage under `kitchie-ocr-<model version>` and also relies on the HTTP cache. This works on the shopper page, which has no service worker. The service worker needs two changes: let the `kitchie-ocr-` prefix through its activation clean-up, and keep `/assets/ocr/` out of its own asset caching (otherwise the files are stored twice). Ask the browser for persistent storage only for signed-in members.
- Browsers can evict stored files (Safari clears script-written storage for sites not used for about a week unless the app is added to the Home Screen; this is Apple's policy as I know it, verify in the slice). If evicted, the next scan downloads again and the screen above explains it.
- Threads: stay single-thread. Setting COOP/COEP to enable threads is a site-wide change and is not proposed.

Viewport-specific code goes in its own files (DESIGN.md section 6):

| File | Loaded when | Holds |
|---|---|---|
| `ocr-engine.js` and `ocr-worker.js` | A scan is opened, any viewport | Engine only: no DOM, no layout, no viewport logic. |
| `receipt-lines.js`, `receipt-match.js` | A read finishes | Pure functions: rows from boxes, noise filter, quantity parse, matching (section 4). Unit-tested in Node. |
| `receipt-review.js` | A read finishes | The review/confirm screen's behaviour, shared. |
| `receipt-scan.phone.js` | Narrow, touch viewport | Camera capture, one-hand layout, bottom sheet, haptics. |
| `receipt-scan.desktop.js` | 64rem and up | Choose file, drop, paste an image, side-panel placement. |

The build copies the mockup's markup and CSS first, as the repo rule says; nothing viewport-specific goes in a shared file.

## 4. From recognised text to items, without AI

**Proposal (11 October 2026, from Claude).** All of this is deterministic JavaScript in the browser, in pure functions so Node tests can run the same code the phone runs. It uses no model.

### 4.1 Steps

1. **Rows.** Cluster the detector's boxes by vertical centre into rows; within a row sort left to right. A row's right-most price-shaped token (`12.50`, `$3.99`, `3,99`) is split off as the price; the rest is the line text. Receipt columns are what make this reliable: name on the left, price on the right.
2. **Drop the lines that are not items.** Header, address, phone, tax number, date and time, "SUBTOTAL", "TOTAL", "GST", "CHANGE", "CASH", "CARD", "EFTPOS", "SAVINGS", loyalty and rewards lines, thank-you text, barcodes and long digit strings. Method: a short list of stop phrases plus position (items sit between the first price line and the first subtotal or total line). Everything dropped is still shown under "Other lines on the receipt" in the review, so a wrongly dropped item can be rescued with one tap.
3. **Quantities.** `2 x`, `2 @ $3.50`, `QTY 2`, and the weight pattern that sits on the line after an item (`0.512 kg @ $4.99/kg`) are attached to the item above. A quantity found on the receipt is kept as a suggestion with its source ("from the receipt"); it never silently replaces the list's quantity.
4. **Clean.** Lower case, strip item codes and leading digits, fold plurals, and repair the usual OCR slips only inside letter-words (0 for O, 1 for l, 5 for S, rn for m). Sizes and filler words are dropped by the same rule `matching.ts` already uses.
5. **Abbreviations.** Two small tables: a shipped list of common shop abbreviations (MLK, CHKN, BRST, ORG, PKT, FRZ, SLCD, GRND, BTR, WHL, SKM, YOG, and house-brand prefixes such as GV), and the household's **learned aliases** (receipt text mapped to an item, saved when a person confirms a match; members only, a schema change that needs the owner's approval, slice 7). Without aliases the first receipt from a new shop will match less; with them each correction helps every later receipt.
6. **Match** each cleaned line to candidates: first the list lines (always available, also on the shopper page), then, for a signed-in member, the Pantry's item names. Score with: exact or alias hit (1.0); token overlap using the shared `nameTokens` rules; abbreviation match (a short token that is a prefix or an in-order subsequence of a longer one, at least 3 letters); edit distance of at most 1 per 5 letters for OCR noise. At least one content word must match. Result per receipt line: the best candidate, the next two, and a score.
7. **Reconcile.** Each list line gets zero or more receipt lines; each receipt line goes to at most one list line (the better score wins; a tie is marked ambiguous). Receipt lines left over are offered as extra items ("on the receipt, not on the list"), as free text on the shopper page (the existing "also got" path) and as a Pantry suggestion for a signed-in member.

### 4.2 One confidence per line

Combine the recogniser's line confidence (how sure it is of the characters) with the match score (how sure the match is):

| Band | Rule (Proposal, thresholds to tune on the slice 1 data) | Shown as |
|---|---|---|
| Sure | recogniser at least 0.90 and match score at least 0.85, unambiguous | Ticked, no flag |
| Check | either number between the Sure and Low limits, or two candidates close | Ticked, amber "Check" tag, receipt text shown under the name |
| Low | recogniser below 0.70, or match score below 0.60, or ambiguous | Not ticked, amber "Not sure" tag, three candidates offered |
| No match | no candidate | In "On the receipt, not on the list", not ticked |

A wrong tick is worse than a missed tick (it marks something bought and writes to the Pantry), so Low is never pre-ticked. A missed tick costs one tap.

### 4.3 The 80% bar

The owner's rule from 10 October stays the default: when 80% or more of the list's lines are matched at Sure or Check, the read is "decent"; under that, one more photo is offered; after a second miss the owner's fallback message steers to ticking the list. Under edge OCR the "fallback" also has a second meaning, the human review (OCR-D3), so the screen always shows what was found and lets the person correct it. Whether the 80% gate still belongs is Choice 5 in Options.

### 4.4 Matching code shared with the server

`matching.ts` is server TypeScript. The browser needs the same token rules, or the receipt's "Milk" and the server's add-item "Milk" will disagree. Proposal: a plain-JavaScript `matching.js` served as a static asset and imported by the server, or a mirrored copy pinned by a shared golden fixture (the way the shopper page's mockup is pinned in `server/test/fixtures/mockup/`). Either keeps one set of rules and a test that fails if they drift.

## 5. The human confirm screen (OCR-D3)

The same rules for every option:

- Nothing is written until the person presses the confirming button (Send on the shopper page, Done shopping on the Shopping screen). Undo for the Pantry step stays as it is today.
- Every tick the machine made is a proposal, and the screen says so ("From the receipt").
- Low-confidence lines are flagged in amber and are not pre-ticked.
- Quantity is a stepper on each ticked line. Default: the quantity the list wanted, or the receipt quantity when one was read (shown as "receipt says 2"). Units that differ are shown as text and left for the person.
- Every ticked line shows what the receipt said under its name, so a mismatch is visible at a glance.
- The photo is gone by now, so the screen never says "look at the photo"; it shows the text that was read.
- The result goes through the routes that exist: `batch` on the shopper link (`got`, `swap_<key>`, `also`, `confirm`) and `POST /shopping/bought` for a member. No new write route, no new field an unsigned caller can reach.
- Provenance: items come from the person's confirmation, so `by` is the person, the `source` is the closed value `receipt` that already exists, and the change source stays `web-shopper` or the web screen. No new source value is needed.

### Option A: ticked for you (the list page, pre-ticked)

The page returns to the existing list in multi-select (the shopper page's SL-J16 already anticipates this: "a good read arrives as a batch, which is what multi-select is"). Sure and Check lines arrive ticked with a quantity stepper; Check lines carry an amber tag and the receipt text; Low lines are unticked with an amber tag. At the foot, "On the receipt, not on the list (3)" lists leftover receipt lines, each with an "Add as also got" tap. Send shows the usual counts.

- Good: least new UI and least new code; reuses the page and the batch route; familiar to anyone who has used the list.
- Poor: the person has to scan the whole list to find the amber lines; the extras are below the fold; a long list is slow to check in a shop.

### Option B: receipt review sheet (the receipt, line by line)

A new screen lists the lines in **receipt order**: the text read, an arrow, the matched item as a chip (tap to change among three candidates, pick from the whole list, or "Not an item"), a quantity stepper, and a yay/nay toggle. A strip at the top, "Check these (4)", holds the amber lines; "Looks right (11)" is collapsed below. A summary ("Got 9 of 12, 3 extra") feeds the existing confirm step.

- Good: handles extras and wrong matches cleanly; the person sees exactly what was read; best for a member at a kitchen table.
- Poor: a second screen and a whole new component; slower with one hand in a shop.

### Option C: triage (only the doubtful lines get attention)

One top card says "9 sure matches. Accept them." (one tap, quantities as defaults). Below it, only the Check and Low lines appear one at a time as cards: yay (match is right), nay (not this), or pick another candidate, with a quantity stepper. Extras come last as cards ("Add Olive oil to the Pantry?").

- Good: fastest when the read is good, which is the case you want to make common; very little reading.
- Poor: hides the 9 accepted lines (trust gap, especially for the first few uses); card-by-card feels slow when many lines are doubtful; a new interaction pattern.

### Recommendation: A as the base, with B's "Check these" group as its first block (A+)

The list page is the screen shoppers already know (A), and the amber lines are lifted into a "Check these (4)" block at the top of it, each with its candidates and the receipt text (the useful part of B and C). No second screen. Extras sit under "On the receipt, not on the list". "Looks right (11)" stays as the ticked rows in the list. If the owner wants the receipt-order view for members at a table, B can be added later on the member Shopping screen only, since the engine and matching do not change.

Mockup states to draw in the follow-up, for whichever option wins: offer (with the one-time download question), reading with progress, good read, doubtful read, under 80% (one more photo), second miss (the owner's fallback message), and the offline/no-download case.

## 6. Effect on the current AI call, cost and the way to migrate

### 6.1 What changes

| | Today | With edge OCR |
|---|---|---|
| Who reads the photo | The member's own AI app (third party) | The phone's browser |
| Where the photo goes | To the AI company | Nowhere (discarded after the read) |
| Kitchie server cost | None | None. No new dependency, endpoint, image upload, server CPU or environment variable. |
| Member's AI cost | One image input and about one tool call per line, on their own plan (not measured) | None for the shopping flow |
| Kitchie hosting cost | n/a | About 16 MB of static files per device on first use, cached after. Bandwidth is the thing to watch on the Lighthouse plan: four devices at 16 MB is about 64 MB once. |
| Device cost | n/a | A few seconds of CPU, tens to low hundreds of MB of memory during a read, 16 MB of storage |
| Unsigned image upload (the L9 and ADR objection) | n/a | Not needed: the image never leaves the phone |
| Shopper link boundary | Unchanged | Unchanged: no new route; result goes through `batch` |

### 6.2 What does not change

- The assistant route (L4) keeps working and needs no code change. It stays the way for a member who prefers to send a photo to their own assistant, and for anything the edge read cannot do (it can read a crumpled photo and reason about it; this cannot). The owner's rule is about the app's own flow.
- The server stays image-free. The 29 September 2026 line in `docs/project-plan.md` ("Kitchie does no image, video or audio processing. ChatGPT performs vision and voice interpretation") should be reworded to: "Kitchie's server does no image processing; reading a photo is done by the person's own assistant or, in the app, by the browser on the device". That wording is for the owner to approve.

### 6.3 Analytics

`item.added` already has the value `receipt`, but it is currently sent when an assistant's free-text source says "receipt"; a web add is `manual`. To tell the two receipt paths apart without personal data, Proposal: a new platform-contract event `receipt.scanned` with closed values only (`outcome`: ok, retry, fallback; `matched_band`: under 50, 50 to 79, 80 or more; `lines_band`), and map the confirmed add to `receipt`. A change to the platform contract is the owner's and needs a platform pull request to `uat` first (Choice 7).

### 6.4 Migration path

1. **Spike and gate** (slice 1): measure engines on synthetic receipts and on the owner's own receipts on his own phone (not committed).
2. **Quiet build, flag off**: the engine, matching, hosting and CSP slices land on `uat` with the feature switched off and no visible change.
3. **Member first**: Shopping screen "Scan receipt", signed in, Pantry names known, aliases learnable. Lower risk: one trusted person, wide screen of review.
4. **Shopper link second**: the "Snap the receipt" mode on the shopper page, which is the owner's phase two.
5. **Labels third**: use-by date and nutrition panel prefill, with the same human confirmation. No new engine.
6. **Judge by the numbers**: share of receipts read above the 80% bar, retries, fallbacks, and the `receipt` share of `item.added`. If the shopper link's own numbers show few links opened, the answer is the link wording (L3), not more OCR.

## 7. Build slices for agents

Every slice is a branch off `uat` named `feat/edge-ocr-<slice>` in its repo, with a pull request against `uat` (Kitchie's rule; `main` is reached only by the owner's promotion). Read kitchie `AGENTS.md` and `docs/adr/shopper-link.md` first; this file and `../shopper-link.md` are the spec. The mockup screens are a follow-up and slices 5 and 6 wait for them and for the owner's pick on the confirm screen. The kitchie repo is public: **no real receipts, shop names or card digits in fixtures**; fixtures are synthetic.

| # | Slice | Repo and branch | Depends on | Done when |
|---|---|---|---|---|
| 1 | **Spike and gate.** A static benchmark page and a generator of synthetic receipt images (thermal font, noise, skew, curl, photo blur), run by Node-driven browser tests for repeatability and by hand on a phone. Compares Tesseract.js 7, PP-OCRv5 mobile, and PP-OCRv6 tiny and small on ORT-web WASM, and WebGPU where present. Reports bytes on the wire, cold start, warm read time, character and line recall, confidence calibration. | kitchie, `feat/edge-ocr-bench` from `uat` | none | A table of results in the PR, and a pass/fail on the gate: warm read of a 30-line receipt in 7 s or less on a mid-range phone, at least 90% of item lines recovered on the synthetic set, first download at most 25 MB. If PP-OCR fails and Tesseract passes, slice 4 uses Tesseract. |
| 2 | **Lines and matching core.** `receipt-lines.js` and `receipt-match.js` as pure functions (sections 4.1 to 4.4), with the shared `matching.js` rules and golden fixtures that fail when browser and server drift. No DOM. | kitchie, `feat/edge-ocr-match` from `uat` | none (runs in parallel with 1) | `node --test` passes on fixtures covering abbreviations, weights, multi-line items, noise lines, ties, OCR slips; confidence bands as in 4.2. |
| 3 | **Hosting, CSP and cache.** `/assets/ocr/` allow-listed route with MIME types and immutable caching; per-response CSP with `'wasm-unsafe-eval'` only on scanning pages; service-worker changes (let `kitchie-ocr-` through, skip `/assets/ocr/`); boundary test that an unsigned caller can fetch only these static files and nothing else new. Placeholder files until slice 1 picks the engine. | kitchie, `feat/edge-ocr-hosting` from `uat` | none | Tests prove the other pages' CSP is byte-identical, the shopper boundary test still passes unchanged, and a release does not clear the OCR cache. |
| 4 | **Engine worker.** `ocr-engine.js` and `ocr-worker.js`: lazy load, warm-up, progress, abort, tiling, orientation, line confidence; discards the image. No UI. | kitchie, `feat/edge-ocr-engine` from `uat` | 1, 3 | A browser test reads the synthetic set through the real served files and meets slice 1's numbers; main thread stays responsive (long-task check). |
| 5 | **Member scan.** "Scan receipt" on the Shopping screen, behind a flag (default off): `receipt-scan.phone.js`, `receipt-scan.desktop.js`, the shared `receipt-review.js` for the chosen option, writing through `POST /shopping/bought`. | kitchie, `feat/edge-ocr-member` from `uat` | 2, 4, mockup screens, owner's pick (A, B or C) | Matches the mockup; nothing OCR loads on a normal Shopping page; flag off changes nothing; a test proves no new write route exists. |
| 6 | **Shopper link scan.** The "Snap the receipt" mode on the shopper page (the owner's phase two), result through `batch`. | kitchie, `feat/edge-ocr-shopper` from `uat` | 5 | `shopper-link-boundary.test.ts` passes unchanged; no upload route; the 80% rule, one retry and the fallback message behave as in section 4.3. |
| 7 | **Learned aliases** (member only): save a confirmed receipt text against an item, use it in matching. A small schema change. | kitchie, `feat/edge-ocr-aliases` from `uat` | 5, owner's approval of the schema bump | Alias saved, used on the next read, listed and removable; migration test. |
| 8 | **Analytics and docs.** `receipt.scanned` event and the `receipt` mapping for confirmed adds; `docs/project-plan.md` and `docs/telemetry-events.md` updated; reword the "no image processing" line (6.2) once the owner approves. | platform, `feat/edge-ocr-telemetry` from `uat` (contract first), then kitchie, `feat/edge-ocr-telemetry` from `uat` | owner's approval | Contract tests pass in both repos; no property can carry text. |
| 9 | **Label reads** (later): use-by date and nutrition panel prefill, reusing slice 4. | kitchie, `feat/edge-ocr-labels` from `uat`; recipe untouched | 4 | Separate mockup first. |

Mockup follow-up (this repo, straight to `main`): rewrite the phase-two receipt part of `fragments/shopper-link/` without the WebSocket assumption, draw the states listed in section 5 for the option the owner picks, and add a Scan receipt entry to the Shopping screen mockup; update `../shopper-link.md` phase-two lines to point here (not done in this change, to avoid a conflict with the other agents who edit that file).

## Options needing the owner's pick

Each has a default that is used if the owner says nothing.

| # | Choice | Options | Default |
|---|---|---|---|
| 1 | Engine | (a) PP-OCR on ORT-Web, about 16 MB first load; (b) Tesseract.js, about 4 MB first load, weaker on photos; (c) decide after the slice 1 numbers | (c), with (a) expected to win |
| 2 | Confirm screen | A, B, C, or A+ (A with the "Check these" block) | A+ |
| 3 | First download on a phone | (a) ask first when the connection looks metered; (b) always start quietly; (c) fetch ahead on Wi-Fi when the shopper page opens | (a) |
| 4 | Where first | (a) member Shopping screen then shopper link; (b) shopper link first; (c) both together | (a) |
| 5 | The 80% gate and one retry | (a) keep as the owner said; (b) drop the gate because the human review is always shown; (c) keep the 80% only as a "good read" label | (a) |
| 6 | Learned aliases | (a) members only, a schema change; (b) none, shipped list only | (a), in a later slice |
| 7 | Analytics | (a) new `receipt.scanned` event (platform contract change); (b) reuse `item.added: receipt` only | (b) until the owner wants the split |
| 8 | Recogniser language | (a) English only (7.5 MiB); (b) multi-script (15.8 MiB) | (a) |
| 9 | Threads and COOP/COEP | (a) stay single-thread; (b) turn on cross-origin isolation later for threads | (a) |

## Open questions

- The real mid-phone speed and the real receipt accuracy of every engine. Only slice 1 answers these; the numbers in section 2 are other people's and my estimates, and are marked as such.
- PP-OCRv6 tiny and small file sizes (not found) and whether the v6 recogniser's larger dictionary is worth its size for English.
- How abbreviated the household's usual shops' receipts are. This decides the match rate more than the engine does (L9); a ten-receipt sample on the owner's phone, never committed, would answer it.
- Whether the browser on the owner's phones keeps 16 MB of stored files between shopping trips.

## For the implementation

- What loads by default: nothing. Deferred on engagement: the scan shell, then the worker, ORT, models and dictionary, and for WebGPU only a second runtime on supported browsers. Viewport-specific code is in `receipt-scan.phone.js` and `receipt-scan.desktop.js`; the engine, matching and review files carry no viewport logic.
- Reuse over new: `matching.ts` rules, the shopper `batch` and Shopping `bought` routes, the closed `receipt` source, the existing multi-select and confirm step.
- Privacy: the photo is never uploaded or stored; the text lines live in memory until Send or Cancel; aliases (if allowed) hold the shop's abbreviation and an item, not a receipt.

## Sources (checked 11 October 2026)

- Tesseract.js performance guide: https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/docs/performance.md
- npm registry entries and tarballs for `tesseract.js` 7.0.0, `tesseract.js-core` 6.1.2, `tesseract-wasm` 0.11.0, `onnxruntime-web` 1.30.0, `@paddleocr/paddleocr-js` 0.4.2, `ppu-paddle-ocr` 6.6.1, `@gutenye/ocr-browser` 1.4.9, `@gutenye/ocr-models`, `@tesseract.js-data/eng` 1.0.0, `scribe.js-ocr` 0.16.1 (file sizes measured; gzip -9)
- PaddleOCR browser SDK page: https://www.paddleocr.ai/latest/en/version3.x/inference_deployment/cross_platform/browser.html
- PP-OCRv5 introduction (accuracy and CPU time): https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5.html
- Model file sizes (third-party list): https://docs.rs/crate/oar-ocr/0.8.1/source/docs/models.md
- `ppu-paddle-ocr` README (browser entry, WebGPU, receipt benchmark): https://cdn.jsdelivr.net/npm/ppu-paddle-ocr@6.0.0/README.md and https://dev.to/awalariansyah/deterministic-ocr-in-javascript-paddleocr-for-node-bun-deno-and-the-browser-2bgn
- PP-OCRv6 variants and latency: https://inference-models.roboflow.com/models/pp-ocrv6/ and https://aiweekly.co/alerts/paddlepaddles-pp-ocrv6-beats-billion-scale-vlms-at-ocr
- Receipt benchmark, Tesseract vs PaddleOCR (vendor-run, SROIE and CORD): https://imagetotable.ai/references/tesseract-vs-paddleocr-receipt-benchmark
- Thermal receipt accuracy (vendor-run, Korean receipts): https://imagetotable.ai/references/receipt-ocr-accuracy
- ONNX Runtime Web backends and browser support: https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/README.md
- Shape Detection API status: https://developer.chrome.com/docs/capabilities/shape-detection
- On-device OCR overview (qualitative): https://lofttools.com/blog/on-device-ocr-reviewed/
- RapidOCR (Apache-2.0, converted PaddleOCR models): https://github.com/RapidAI/RapidOCR
- Code read on `uat`: kitchie `server/src/{app.ts,pwa.ts,mcp.ts,stock.ts,telemetry.ts,matching.ts,shopper-page.ts,web-shopper.ts,web-shopping.ts,assets/shopper.js}`, `docs/adr/shopper-link.md`, `docs/ideas/low-friction-loop.md`, `docs/project-plan.md`; recipe `server/src/domain.ts`, `docs/project-plan.md`; platform `packages/contract/src/telemetry-events.ts`.
