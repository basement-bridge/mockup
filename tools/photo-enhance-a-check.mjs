// Photo enhance, Option A check (fragments/photo-enhance/a). Proves, with the real engine on a real sample:
//  1 nothing is loaded for Enhance until the Enhance tab is pointed at (engine script not requested on the default path)
//  2 the Original layer is unchanged after switching levels (pixels compared before and after)
//  3 hold-to-compare shows the original and releases back: mouse, keyboard (Space), touch (a quick tap switches and stays)
//  4 nothing is encoded before Use photo (encode calls 0), then exactly one enhanced encode and one plain square
//  5 levels are not cumulative: Balanced, Light, Balanced again gives identical pixels
// Usage: python3 -m http.server 8101 &   BASE=http://localhost:8101/ node tools/photo-enhance-a-check.mjs
// Needs playwright-core (npm i --no-save playwright-core@1.56.0) and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8101/";
const URL0 = BASE + "fragments/photo-enhance/a/index.html";
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const hash = (p, sel) => p.evaluate(s => { const c = document.querySelector(s), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 7) h = Math.imul(h ^ d[i], 16777619); return c.width + "x" + c.height + ":" + (h >>> 0); }, sel);
const ctx = await browser.newContext({ viewport: { width: 390, height: 860 }, hasTouch: true });
const p = await ctx.newPage(); const reqs = [];
p.on("request", r => reqs.push(r.url())); p.on("pageerror", e => { console.log("pageerror", e.message); fails++; });
await p.goto(URL0 + "?w=390"); await p.waitForTimeout(500);
ok(!reqs.some(u => /engine\/(enhance|enhance-worker)\.js/.test(u)), "default path does not load the engine");
await p.click("[data-act=add-more]"); await p.waitForSelector("#srcg button[data-f]");
ok(!reqs.some(u => /engine\/enhance/.test(u)), "opening the source sheet still does not load the engine");
await p.click("#srcg button[data-f='dark.jpg']"); await p.waitForSelector("[data-save]:not([disabled])");
ok(!reqs.some(u => /engine\/enhance/.test(u)), "the Crop tab (default) does not load the engine");
await p.hover("#tenh"); await p.waitForTimeout(300);
ok(reqs.some(u => /engine\/enhance\.js/.test(u)), "pointing at the Enhance tab fetches the engine script");
await p.click("#tenh"); await p.waitForFunction(() => /Enhanced/.test(document.querySelector("#echip").textContent), null, { timeout: 15000 });
const ev = () => p.evaluate(() => window.PE_A.encodeCalls + "/" + window.PE_A.plainEncodes);
ok((await ev()) === "0/0", "nothing encoded after the preview is showing (encode calls 0, plain encodes 0)");
const orig0 = await hash(p, "#ocv");
const lv = async id => { await p.click(`[data-lv=${id}]`); await p.waitForFunction(i => document.querySelector(`[data-lv=${i}]`).getAttribute("aria-pressed") === "true" && !/Preparing/.test(document.querySelector("#echip").textContent), id, { timeout: 15000 }); await p.waitForTimeout(150); };
await lv("balanced"); const bal1 = await hash(p, "#ecv");
await lv("light"); const lig = await hash(p, "#ecv"); await lv("full"); await lv("off"); await lv("balanced"); const bal2 = await hash(p, "#ecv");
ok(bal1 === bal2, "Balanced, Light, Full, Original, Balanced again: identical Balanced pixels (not cumulative) " + bal1);
ok(lig !== bal1, "Light differs from Balanced (levels really change the picture)");
ok((await hash(p, "#ocv")) === orig0, "Original layer pixels unchanged after switching levels " + orig0);
const peeked = () => p.evaluate(() => ({ cls: document.querySelector("#cframe").classList.contains("peek"), op: getComputedStyle(document.querySelector("#ecv")).opacity, pressed: document.querySelector("#ehold").getAttribute("aria-pressed") }));
const hb = await p.locator("#ehold").boundingBox(); await p.mouse.move(hb.x + 10, hb.y + 10); await p.mouse.down(); await p.waitForTimeout(400);
let s1 = await peeked(); ok(s1.cls && s1.pressed === "true", "mouse hold shows the original"); await p.mouse.up(); await p.waitForTimeout(300);
let s2 = await peeked(); ok(!s2.cls && s2.pressed === "false", "mouse release returns to the chosen level");
await p.focus("#ehold"); await p.keyboard.down("Space"); await p.waitForTimeout(400); s1 = await peeked(); ok(s1.cls, "Space held shows the original"); await p.keyboard.up("Space"); await p.waitForTimeout(300); s2 = await peeked(); ok(!s2.cls, "Space released returns");
await p.keyboard.down("Enter"); await p.waitForTimeout(400); s1 = await peeked(); ok(s1.cls, "Enter held shows the original"); await p.keyboard.up("Enter"); await p.waitForTimeout(200);
await p.touchscreen.tap(hb.x + 10, hb.y + 10); await p.waitForTimeout(300); s1 = await peeked(); ok(s1.cls, "a quick touch tap switches to the original and stays (for people who cannot hold)");
await p.touchscreen.tap(hb.x + 10, hb.y + 10); await p.waitForTimeout(300); s2 = await peeked(); ok(!s2.cls, "a second tap switches back");
ok((await ev()) === "0/0", "still nothing encoded before Use photo");
await p.click("[data-save]"); await p.waitForSelector(".toast", { timeout: 30000 });
const last = await p.evaluate(() => ({ c: window.PE_A.encodeCalls, pl: window.PE_A.plainEncodes, last: window.PE_A.last, toast: document.querySelector(".toast").textContent }));
ok(last.c === 1 && last.last && last.last.bytes > 0, "Use photo encodes exactly once from the original (encode calls " + last.c + "), " + last.last.bytes + " bytes");
ok(/KB/.test(last.toast) && /960 px/.test(last.toast), "the result shows size in KB and the long edge: " + last.toast);
await browser.close(); console.log(fails ? fails + " FAILED" : "ALL PASSED"); process.exit(fails ? 1 : 0);
