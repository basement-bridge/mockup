// Behaviour check for the Photo Enhance engine (fragments/photo-enhance/engine). Proves: lazy load, original unchanged, non-cumulative levels,
// worker off the main thread, latest-wins, nothing encoded before confirm, plus size/speed numbers.
// Usage:  python3 -m http.server 8231 &   then   node tools/photo-enhance-engine-check.mjs   (needs playwright-core; BASE=url to override)
import { chromium } from "playwright-core";
import { spawnSync } from "child_process";
import fs from "fs";
const BASE = process.env.BASE || "http://localhost:8231/fragments/photo-enhance/engine/index.html";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } else if (process.env.V) console.log("ok  ", n); };
const browser = await chromium.launch();

// ---- 1. lazy: nothing is fetched or started until a person engages (checked below on a bare page that only loads enhance.js)
const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage(); p.on("pageerror", e => { fails++; console.log("pageerror", e.message); });
await p.route("**/engine/bare.html", r => r.fulfill({ contentType: "text/html", body: `<!doctype html><script src="enhance.js"></script><body>bare` }));
const reqs = []; p.on("request", r => reqs.push(r.url()));
await p.goto(BASE.replace("index.html", "bare.html"));
ok("lazy: bare page with enhance.js loaded starts no worker", await p.evaluate(() => PhotoEnhance.stats.workerStarted === false) && !reqs.some(u => u.includes("enhance-worker.js")));
ok("supported", await p.evaluate(() => PhotoEnhance.supported === true));
ok("contract: LEVELS and DEFAULT", await p.evaluate(() => PhotoEnhance.LEVELS.map(l => l.id + ":" + l.k).join() === "off:0,light:0.4,balanced:0.7,full:1" && PhotoEnhance.DEFAULT === "balanced"));

// helpers inside the page
await p.evaluate(() => {
  window.hash = c => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ":" + c.width + "x" + c.height; };
  window.cv = () => document.createElement("canvas");
  window.origHash = s => { const c = cv(); c.width = s.width; c.height = s.height; c.getContext("2d").drawImage(s.original, 0, 0); return hash(c); };
});

// ---- 2. original unchanged, off = original pixels, non-cumulative, encode counter
const r2 = await p.evaluate(async () => {
  const s = await PhotoEnhance.open("samples/dark.jpg"), o = {};
  o.workerAfterOpen = PhotoEnhance.stats.workerStarted;
  o.origBefore = origHash(s);
  const a = cv(); await s.render("off", a); o.offBefore = hash(a);
  const ref = cv(); ref.width = a.width; ref.height = a.height; const rx = ref.getContext("2d"); rx.imageSmoothingQuality = "high"; rx.drawImage(s.original, 0, 0, a.width, a.height); o.offIsPlainDraw = hash(ref) === o.offBefore;
  const h = {};
  for (const id of ["balanced", "light", "full"]) { const c = cv(); await s.render(id, c); h[id] = hash(c); }
  o.levelsDiffer = new Set([o.offBefore, h.light, h.balanced, h.full]).size === 4;
  const a2 = cv(); await s.render("off", a2); o.offAfter = hash(a2);
  o.origAfter = origHash(s);
  o.encodeCallsBefore = PhotoEnhance.stats.encodeCalls;
  await s.prefetch(["light", "balanced", "full"]);
  o.encodeAfterPrefetch = PhotoEnhance.stats.encodeCalls;
  o.readyBalanced = s.ready("balanced"); o.readyOff = s.ready("off");
  // non-cumulative: a FRESH session (empty cache) renders full, light, then balanced; balanced must equal the first session's balanced
  const s2 = await PhotoEnhance.open("samples/dark.jpg"), h2 = {};
  for (const id of ["full", "light", "full", "balanced"]) { const c = cv(); await s2.render(id, c); h2[id] = hash(c); }
  o.balancedAfterOthersEqual = h2.balanced === h.balanced; o.lightEqual = h2.light === h.light; o.fullEqual = h2.full === h.full;
  // same session, cache bypassed by a different maxEdge then back to the default: still identical
  const c3 = cv(); await s.render("balanced", c3, { maxEdge: 700 }); const c4 = cv(); await s.render("balanced", c4); o.sameAfterOtherSize = hash(c4) === h.balanced;
  s.close(); s2.close();
  return o;
});
ok("worker created on first open, not before", r2.workerAfterOpen === true);
ok("original untouched: pixels identical before and after all levels", r2.origBefore === r2.origAfter, r2);
ok("Original level == plain drawImage of the original", r2.offIsPlainDraw);
ok("Original level identical before and after levels", r2.offBefore === r2.offAfter);
ok("four levels give four different pictures", r2.levelsDiffer);
ok("non-cumulative: balanced after full, light, full is byte-identical to balanced rendered first (fresh session, no cache)", r2.balancedAfterOthersEqual, r2);
ok("non-cumulative: light and full also identical across sessions", r2.lightEqual && r2.fullEqual);
ok("balanced identical after another size was rendered in between", r2.sameAfterOtherSize);
ok("nothing encoded by open, render or prefetch", r2.encodeCallsBefore === 0 && r2.encodeAfterPrefetch === 0);
ok("ready(): cached level true, off true", r2.readyBalanced && r2.readyOff);

// ---- 3. worker off the main thread: environment proof + main thread stays responsive during a slow render
const r3 = await p.evaluate(async () => {
  const s = await PhotoEnhance.open("samples/noisy.jpg"), o = {};
  o.scope = PhotoEnhance.stats.workerScope; o.hasDocument = PhotoEnhance.stats.workerHasDocument;
  let ticks = 0, maxGap = 0, last = performance.now(); const iv = setInterval(() => { const n = performance.now(); maxGap = Math.max(maxGap, n - last); last = n; ticks++; }, 10);
  let longMs = 0; const po = new PerformanceObserver(l => l.getEntries().forEach(e => longMs += e.duration)); try { po.observe({ entryTypes: ["longtask"] }); } catch (e) {}
  const t = performance.now(), c = cv(); await s.render("full", c); o.renderWallMs = performance.now() - t; o.workerMs = PhotoEnhance.stats.lastRenderMs;
  clearInterval(iv); await new Promise(r => setTimeout(r, 60)); po.disconnect();
  o.ticks = ticks; o.expectedTicks = o.renderWallMs / 10; o.maxGap = maxGap; o.longMs = longMs; s.close(); return o;
});
ok("worker global is DedicatedWorkerGlobalScope with no document", r3.scope === "DedicatedWorkerGlobalScope" && r3.hasDocument === false, r3);
ok("main thread stays responsive while the worker renders (timer ticks kept coming, no long block)", r3.workerMs > 150 && r3.ticks > 0.5 * r3.expectedTicks && r3.maxGap < 120, r3);

// ---- 4. latest wins
const r4 = await p.evaluate(async () => {
  const s = await PhotoEnhance.open("samples/noisy.jpg"), o = {};
  const ref = cv(); await s.render("light", ref); const refH = hash(ref);
  const s2 = await PhotoEnhance.open("samples/noisy.jpg");      // empty cache: every request is real work
  const c = cv(), d0 = PhotoEnhance.stats.dropped;
  const ps = [s2.render("full", c)]; await new Promise(r => setTimeout(r, 20));       // full is now running in the worker
  const gap = () => new Promise(r => setTimeout(r, 4)); ps.push(s2.render("balanced", c)); await gap(); ps.push(s2.render("off", c)); await gap(); ps.push(s2.render("full", c)); await gap(); ps.push(s2.render("light", c));
  await Promise.all(ps); await new Promise(r => setTimeout(r, 50));
  o.finalIsLight = hash(c) === refH; o.dropped = PhotoEnhance.stats.dropped - d0;
  // stale result must not paint after a later call even when the later call is the fast, cached one
  const s3 = await PhotoEnhance.open("samples/dark.jpg"); await s3.prefetch(["light"]);
  const c2 = cv(); const slow = s3.render("full", c2), fast = s3.render("light", c2); await Promise.all([slow, fast]); await new Promise(r => setTimeout(r, 30));
  const rr = cv(); await s3.render("light", rr); o.cachedWinsOverSlow = hash(c2) === hash(rr);
  s.close(); s2.close(); s3.close(); return o;
});
ok("latest wins: after 5 rapid calls (one running, the rest queued) the canvas holds the last one (light)", r4.finalIsLight, r4);
ok("latest wins: stale queued jobs were dropped before the worker started them", r4.dropped >= 1, r4);
ok("latest wins: a slow earlier render does not overwrite a later instant one", r4.cachedWinsOverSlow);

// ---- 5. encode: only on confirm; capped; square from the same result
const r5 = await p.evaluate(async () => {
  const s = await PhotoEnhance.open("samples/good.jpg"), o = {}; const before = PhotoEnhance.stats.encodeCalls;
  await s.render("balanced", cv()); o.before = PhotoEnhance.stats.encodeCalls - before;
  const prog = []; const r = await s.encodeSet("balanced", { maxEdge: 960, square: 240, type: "image/webp", quality: 0.82, onProgress: m => prog.push(m.phase) });
  o.after = PhotoEnhance.stats.encodeCalls - before; o.type = r.blob.type; o.kb = +(r.blob.size / 1024).toFixed(1); o.w = r.width; o.h = r.height;
  const sq = await createImageBitmap(r.square); o.sq = [sq.width, sq.height]; o.sqKb = +(r.square.size / 1024).toFixed(1); o.phases = [...new Set(prog)];
  const bn = await createImageBitmap(r.blob); o.decoded = [bn.width, bn.height];
  const off = await s.encode("off", { maxEdge: 960 }); o.offKb = +(off.size / 1024).toFixed(1);
  s.close(); return o;
});
ok("no encode before confirm, one after", r5.before === 0 && r5.after === 1, r5);
ok("encode: WebP, long edge capped at 960, 240 square from the same pixels", r5.type === "image/webp" && r5.w === 960 && r5.h === 720 && r5.sq.join() === "240,240" && r5.decoded.join() === "960,720", r5);
console.log("  encode good.jpg @960 webp q.82:", r5.kb, "KB, square", r5.sqKb, "KB, progress phases", r5.phases.join(">"));

// ---- 6. good photo, notes, edge cases, decode error, EXIF
const r6 = await p.evaluate(async () => {
  const s = await PhotoEnhance.open("samples/good.jpg"), o = {};
  o.notes = s.notes.map(n => n.text); o.good = s.good;
  const a = cv(), b = cv(); await s.render("off", a); await s.render("balanced", b);
  const da = a.getContext("2d").getImageData(0, 0, a.width, a.height).data, db = b.getContext("2d").getImageData(0, 0, b.width, b.height).data; let sum = 0, mx = 0; for (let i = 0; i < da.length; i += 4) for (let k = 0; k < 3; k++) { const d = Math.abs(da[i + k] - db[i + k]); sum += d; if (d > mx) mx = d; }
  o.meanDiff = sum / (da.length / 4 * 3); o.maxDiff = mx;
  const d = await PhotoEnhance.open("samples/dark.jpg"); o.darkNotes = d.notes.map(n => n.key + ":" + n.value + n.unit); o.keys = Object.keys(d.notes[0]).sort().join();
  let code = null; try { await PhotoEnhance.open(new Blob(["not an image"], { type: "image/heic" })); } catch (e) { code = e.code; } o.decodeCode = code;
  const tiny = cv(); tiny.width = 120; tiny.height = 90; const tb = await new Promise(r => tiny.toBlob(r)); const ts = await PhotoEnhance.open(tb); o.small = ts.small; ts.close();
  s.close(); d.close(); return o;
});
ok("good photo: notes say 'Looks good already'", r6.good && r6.notes.join() === "Looks good already", r6);
ok("good photo: Balanced is nearly a no-op (mean change < 2 levels of 255)", r6.meanDiff < 2, r6);
ok("notes shape {key,label,value,unit,text}", r6.keys === "key,label,text,unit,value", r6.keys);
ok("undecodable file rejects with code 'decode'", r6.decodeCode === "decode", r6.decodeCode);
ok("too-small photo flagged (session.small)", r6.small === true);
console.log("  dark.jpg notes:", r6.darkNotes.join(" | "), "; good.jpg Balanced mean change", r6.meanDiff.toFixed(2), "max", r6.maxDiff);

// EXIF orientation 6 (rotate 90 cw): a 200x100 picture must open as 100 wide, 200 tall
fs.mkdirSync(process.env.TMPDIR || "/tmp", { recursive: true });
const ex = (process.env.TMPDIR || "/tmp") + "/pe-exif.jpg";
const py = spawnSync("python3", ["-c", `from PIL import Image\nim=Image.new('RGB',(200,100),(200,40,40)); e=Image.Exif(); e[274]=6; im.save('${ex}',exif=e)`]);
if (py.status === 0) {
  const b64 = fs.readFileSync(ex).toString("base64");
  const dims = await p.evaluate(async b => { const bl = await (await fetch("data:image/jpeg;base64," + b)).blob(); const s = await PhotoEnhance.open(bl); const r = [s.width, s.height]; s.close(); return r; }, b64);
  ok("EXIF orientation honoured (200x100 with orientation 6 opens as 100x200)", dims.join() === "100,200", dims);
} else console.log("  (skipped EXIF: PIL not available)");

// ---- 7. speed table (this machine, headless Chromium, software rendering; phones differ)
const rows = await p.evaluate(async () => {
  const out = [];
  for (const f of ["dark", "warm", "blown", "noisy", "good", "large"]) {
    const t0 = performance.now(), s = await PhotoEnhance.open("samples/" + f + ".jpg"), tOpen = performance.now() - t0, row = { f, mp: s.megapixels, open: Math.round(tOpen), analysis: Math.round(PhotoEnhance.stats.lastAnalysisMs) };
    for (const id of ["light", "balanced", "full"]) { const c = document.createElement("canvas"), t = performance.now(); await s.render(id, c); row[id] = Math.round(performance.now() - t); }
    const t = performance.now(), r = await s.encodeSet("balanced", { maxEdge: 1600, square: 240, quality: 0.82 }); row.enc = Math.round(performance.now() - t); row.kb = Math.round(r.blob.size / 1024); row.dim = r.width + "x" + r.height;
    s.close(); out.push(row);
  }
  return out;
});
console.log("  speed (ms): file, MP, open+decode+analysis, preview light/balanced/full @1280, encode balanced @1600 + 240 square, KB");
for (const r of rows) console.log("   ", r.f.padEnd(6), String(r.mp).padStart(5), String(r.open).padStart(5), "(an " + r.analysis + ")", String(r.light).padStart(5), String(r.balanced).padStart(5), String(r.full).padStart(5), String(r.enc).padStart(6), String(r.kb).padStart(5) + " KB", r.dim);

// ---- 8. unsupported browser: open() rejects with code "unsupported"
{
  const c2 = await browser.newContext(); await c2.addInitScript(() => { delete window.OffscreenCanvas; });
  const q = await c2.newPage(); await q.route("**/engine/bare.html", r => r.fulfill({ contentType: "text/html", body: `<!doctype html><script src="enhance.js"></script><body>bare` }));
  await q.goto(BASE.replace("index.html", "bare.html"));
  const u = await q.evaluate(async () => { let code = null; try { await PhotoEnhance.open("samples/good.jpg"); } catch (e) { code = e.code; } return { sup: PhotoEnhance.supported, code, started: PhotoEnhance.stats.workerStarted }; });
  ok("unsupported browser: supported false, open() rejects 'unsupported', no worker started", u.sup === false && u.code === "unsupported" && u.started === false, u);
  await c2.close();
}
await browser.close();
console.log(fails ? `FAILED ${fails} of ${total}` : `PASS ${total} checks`);
process.exit(fails ? 1 : 0);
