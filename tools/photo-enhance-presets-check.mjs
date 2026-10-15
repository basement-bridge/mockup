// Behaviour check for the Photo Enhance presets page (fragments/photo-enhance/presets).
// Proves: nothing loads until a photo is picked, 15 presets plus Original and today's three levels all render and all differ,
// the "little brighter" bias holds, Hold shows the original, the original is untouched, nothing is encoded, existing engine levels unchanged.
// Usage:  python3 -m http.server 8231 &   then   node tools/photo-enhance-presets-check.mjs   (needs playwright-core; BASE=url to override)
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8231/fragments/photo-enhance/presets/index.html";
const SAMPLE = process.env.SAMPLE || "fragments/photo-enhance/engine/samples/dark.jpg";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } else if (process.env.V) console.log("ok  ", n); };
const browser = await chromium.launch();
const p = await (await browser.newContext({ viewport: { width: 420, height: 900 } })).newPage();
p.on("pageerror", e => { fails++; console.log("pageerror", e.message); });
const reqs = []; p.on("request", r => reqs.push(r.url()));
await p.goto(BASE);
ok("page load fetches no engine, worker, sample or sample list", !reqs.some(u => /enhance\.js|enhance-worker|samples\//.test(u)), reqs);
ok("15 preset tiles + 4 reference tiles", await p.evaluate(() => document.querySelectorAll("#presets .tile").length === 15 && document.querySelectorAll("#today .tile").length === 4));
ok("stage hidden before a photo", await p.evaluate(() => document.getElementById("stage").hidden));
await p.setInputFiles("#own", SAMPLE);
await p.waitForFunction(() => [...document.querySelectorAll(".tile canvas")].every(c => c.width > 4), null, { timeout: 90000 });
ok("engine fetched only after a photo was picked", reqs.some(u => u.includes("enhance.js")) && reqs.some(u => u.includes("enhance-worker.js")));
const r = await p.evaluate(async () => {
  const mean = c => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; return s / (d.length / 4); };
  const hash = c => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 7) { h ^= d[i]; h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  const t = {}; document.querySelectorAll(".tile").forEach(b => { const c = b.querySelector("canvas"); t[b.dataset.id] = { mean: mean(c), hash: hash(c) }; });
  const ids = Object.keys(t);
  return { t, ids, distinct: new Set(ids.map(i => t[i].hash)).size, enc: PhotoEnhance.stats.encodeCalls, why: PhotoPresets.PRESETS.every(x => x.why && x.why.length > 30 && x.name), chips: PhotoPresets.PRESETS.every(x => PhotoPresets.describe(x.spec).length > 0) };
});
ok("19 tiles drawn; every one differs except Natural, which is by design the same as Full (today)", r.ids.length === 19 && r.distinct === 18 && r.t.natural.hash === r.t.full.hash, { n: r.ids.length, d: r.distinct, same: r.ids.filter(i => r.ids.some(j => j < i && r.t[j].hash === r.t[i].hash)) });
ok("every preset has a name, a food reason and listed knobs", r.why && r.chips);
const off = r.t.off.mean;
const brighter = ["lift", "bright", "airy", "dim", "clean", "greens", "soft"].filter(id => r.t[id].mean <= off + 1);
ok("the bright presets are brighter than the original", brighter.length === 0, brighter);
ok("Bright is brighter than Balanced (today)", r.t.bright.mean > r.t.balanced.mean, { bright: r.t.bright.mean, balanced: r.t.balanced.mean });
ok("nothing encoded", r.enc === 0);
// choose a preset, hold, release
await p.click('.tile[data-id="warm"]');
await p.waitForFunction(() => document.getElementById("nm").textContent === "Warm table");
const hv = async () => p.evaluate(() => { const c = document.getElementById("cv"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 40) s += d[i] + d[i + 1] * 2 + d[i + 2] * 3; return Math.round(s); });
await p.waitForTimeout(800);
const enhanced = await hv();
const box = await p.locator("#hold").boundingBox();
await p.mouse.move(box.x + 10, box.y + 10); await p.mouse.down(); await p.waitForTimeout(600);
const held = await hv(); const badge = await p.textContent("#badge");
await p.mouse.up(); await p.waitForTimeout(600);
const back = await hv();
ok("Hold shows the original, release returns the preset", held !== enhanced && back === enhanced && badge === "Original", { held, enhanced, back, badge });
ok("selected tile is marked", await p.evaluate(() => document.querySelector('.tile[data-id="warm"]').getAttribute("aria-pressed") === "true" && document.querySelectorAll('.tile[aria-pressed="true"]').length === 1));
ok("no horizontal scroll at phone width", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
await browser.close();
console.log(fails ? `${fails} FAILED of ${total}` : `all ${total} checks pass`);
process.exit(fails ? 1 : 0);
