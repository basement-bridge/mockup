// Option D (split slider) check: node tools/photo-enhance-d-check.mjs   (server on BASE, default http://localhost:8104/)
// Proves, against the real engine: (1) the original is unchanged after switching levels, (2) hold shows the whole original and release goes back (pointer, keyboard, tap-latch),
// (3) nothing is encoded before Use photo (and Skip never calls encode), (4) levels are not cumulative (Balanced, Light, Full, Balanced: identical pixels).
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8104/";
const URL = BASE + "fragments/photo-enhance/d/index.html?open=banner";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function fresh(sample) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage();
  p.on("pageerror", e => console.log("pageerror", e.message));
  await p.goto(URL); await p.waitForSelector("#smp button"); await p.waitForFunction(() => window.PhotoEnhance && window.EnhanceSplit);
  await p.evaluate(() => { const o = PhotoEnhance.open; window.__enc = 0; PhotoEnhance.open = function () { return o.apply(this, arguments).then(s => { const e = s.encode; s.encode = function () { window.__enc++; return e.apply(s, arguments); }; return s; }); }; });
  await p.click(`#smp button[data-s="${sample}"]`); await p.waitForSelector(".enhv[data-ready=yes]");
  await p.waitForFunction(() => document.querySelector("#ev").dataset.shown === "balanced", null, { timeout: 20000 });
  return { ctx, p };
}
const hash = (p, sel) => p.evaluate(s => { const c = document.querySelector(s), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 7) { h ^= d[i]; h = Math.imul(h, 16777619); } return c.width + "x" + c.height + ":" + (h >>> 0); }, sel);
const setLevel = async (p, i) => { await p.evaluate(i => { const r = document.querySelector("#el"); r.value = i; r.dispatchEvent(new Event("input", { bubbles: true })); }, i); await p.waitForFunction(i => document.querySelector("#ev").dataset.shown === ["off", "light", "balanced", "full"][i], i, { timeout: 20000 }); await p.waitForTimeout(100); };
const origHash = p => p.evaluate(() => { const s = PEDemo.session, c = document.createElement("canvas"); c.width = s.width; c.height = s.height; c.getContext("2d").drawImage(s.original, 0, 0); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 13) { h ^= d[i]; h = Math.imul(h, 16777619); } return h >>> 0; });

{ // 1, 3, 4: levels, original, encode
  const { ctx, p } = await fresh(0);
  const o0 = await hash(p, ".enha"), s0 = await origHash(p), b1 = (await setLevel(p, 2), await hash(p, ".enhb"));
  await setLevel(p, 1); const l1 = await hash(p, ".enhb"); await setLevel(p, 3); const f1 = await hash(p, ".enhb"); await setLevel(p, 2); const b2 = await hash(p, ".enhb");
  ok(l1 !== b1 && f1 !== b1, "levels differ from each other (Light, Balanced, Full)");
  ok(b1 === b2, "non-cumulative: Balanced, Light, Full, Balanced again gives identical pixels");
  await setLevel(p, 0); const off = await hash(p, ".enhb");
  ok(off === o0, "level Original draws the same pixels as the original layer");
  ok(o0 === await hash(p, ".enha"), "original layer unchanged after switching levels");
  ok(s0 === await origHash(p), "session.original bitmap unchanged after switching levels");
  ok(await p.evaluate(() => window.__enc) === 0, "no encode call while previewing (0 so far)");
  // 2: hold with the pointer, anywhere on the photo
  await setLevel(p, 2);
  const vb = await p.locator("#ev").boundingBox(), shown = () => p.evaluate(() => getComputedStyle(document.querySelector("#ev")).getPropertyValue("--shown").trim());
  const x = vb.x + vb.width * 0.8, y = vb.y + vb.height * 0.3;
  ok(await shown() === "50%" || /^5\d(\.\d+)?%$/.test(await shown()), "split shows half and half before the hold");
  await p.mouse.move(x, y); await p.mouse.down();
  ok(await p.evaluate(() => document.querySelector("#ev").dataset.view) === "orig" && await shown() === "100%", "press-and-hold on the photo shows the whole original");
  await p.mouse.up();
  ok(await p.evaluate(() => document.querySelector("#ev").dataset.view) === "split", "release goes back to the chosen level");
  // keyboard on the Hold button: Space held, then released
  await p.focus("#eh"); await p.keyboard.down("Space"); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.querySelector("#ev").dataset.view) === "orig", "Space held on the button shows the original");
  await p.keyboard.up("Space");
  ok(await p.evaluate(() => document.querySelector("#ev").dataset.view) === "split", "Space released goes back");
  // a quick tap latches (for people who cannot hold) and a second tap releases
  await p.click("#eh"); ok(await p.evaluate(() => document.querySelector("#eh").getAttribute("aria-pressed")) === "true" && await p.evaluate(() => document.querySelector("#ev").dataset.view) === "orig", "a quick tap pins the original on");
  await p.click("#eh"); ok(await p.evaluate(() => document.querySelector("#ev").dataset.view) === "split", "a second tap turns it off");
  // divider keys
  await p.focus("#ed"); await p.keyboard.press("ArrowLeft"); ok(await p.evaluate(() => document.querySelector("#ed").getAttribute("aria-valuenow")) === "45", "divider moves with the arrow keys");
  const css = await p.evaluate(() => { const c = getComputedStyle(document.querySelector("#ev")); return [c.touchAction, c.userSelect, c.webkitTouchCallout || c.getPropertyValue("-webkit-touch-callout")].join(); });
  ok(/^none,none/.test(css), "photo has touch-action none and user-select none (" + css + ")");
  // 3: Use photo is the only encode
  ok(await p.evaluate(() => window.__enc) === 0, "still no encode before Use photo");
  await p.click("#euse"); await p.waitForSelector(".enhmade b .ic", { timeout: 20000 });
  ok(await p.evaluate(() => window.__enc) === 1, "Use photo made exactly one encode call");
  ok(/KB/.test(await p.textContent(".enhmade")) && /px long edge/.test(await p.textContent(".enhmade")), "result shows size in KB and the long edge");
  await p.waitForSelector(".pq[data-q=done]", { timeout: 20000 }); ok(true, "hand-off to the queue tile reached Done");
  ok(await p.evaluate(() => window.__enc) === 1, "no second encode for the square or the queue");
  await ctx.close();
}
{ // Skip and cancel never encode
  const { ctx, p } = await fresh(1);
  await p.click("#eskip"); await p.waitForSelector(".pq", { timeout: 10000 });
  ok(await p.evaluate(() => window.__enc) === 0, "Skip uploads the original as today: zero encode calls");
  await ctx.close();
  const c2 = await fresh(1); await c2.p.keyboard.press("Escape"); await c2.p.waitForTimeout(300);
  ok(await c2.p.locator(".sheet").count() === 0 && await c2.p.evaluate(() => window.__enc) === 0 && await c2.p.locator(".pq").count() === 0, "Cancel closes with nothing encoded or sent");
  await c2.ctx.close();
}
await b.close(); console.log(fails ? fails + " FAILED" : "ALL PASSED"); process.exit(fails ? 1 : 0);
