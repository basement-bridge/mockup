// Option B (dedicated Enhance step) check. Proves, with the real engine on a real sample photo:
//  1 the Original pixels are identical before and after switching levels (original never modified)
//  2 hold-to-compare shows the original with a pointer and with Space / Enter, and releases back to the chosen level
//  3 nothing is encoded before Use photo (encode() call count), and exactly the confirm encodes
//  4 levels are not cumulative: Balanced, Light, Full, Balanced again gives byte-identical Balanced pixels
//  5 sideways scroll and tap targets under 44 px at 360 and 390
// Usage: python3 -m http.server 8102 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/photo-enhance-b-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8102/fragments/photo-enhance/b/index.html";
const b = await chromium.launch(); let bad = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) bad++; };
for (const w of [360, 390]) for (const th of ["kitchie-day", "kitchie"]) {
  const p = await b.newPage({ viewport: { width: w, height: 780 } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(BASE + "?kind=banner"); await p.click('[data-s="0"]'); await p.waitForSelector("#next:not([disabled])");
  const enc0 = await p.evaluate(() => window.__encodeCalls);
  await p.click("#next"); await p.waitForSelector('#eprev[data-ready="1"]', { timeout: 20000 }); await p.waitForSelector("#eorig.in");
  const hash = id => p.evaluate(id => document.querySelector(id).toDataURL(), "#" + id);
  const settle = () => p.waitForFunction(() => !document.querySelector("#eprep") || document.querySelector("#eprep").hidden);
  const lvl = async id => { await p.click(`[data-l="${id}"]`); await settle(); await p.waitForTimeout(150); };
  const tag = `${w} ${th}: `;
  const o1 = await hash("eorig"), b1 = await hash("ecv");
  await lvl("light"); const l1 = await hash("ecv"); await lvl("full"); const f1 = await hash("ecv"); await lvl("balanced"); const b2 = await hash("ecv"); await lvl("off"); const off = await hash("ecv"); await lvl("balanced");
  const o2 = await hash("eorig");
  ok(o1 === o2, tag + "Original pixels unchanged after switching levels");
  ok(off === o1, tag + "level Original equals the untouched original");
  ok(b1 === b2 && b1 !== l1 && l1 !== f1, tag + "Balanced is identical before and after Light/Full/Original (not cumulative), and levels differ");
  const state = () => p.evaluate(() => ({ h: document.querySelector("#eprev").classList.contains("holding"), o: +getComputedStyle(document.querySelector("#eorig")).opacity, c: +getComputedStyle(document.querySelector("#ecv")).opacity, tag: document.querySelector("#etag").textContent }));
  const bb = await p.locator("#ehold").boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); const s1 = await state(); await p.mouse.up(); const s2 = await state();
  ok(s1.h && s1.o === 1 && s1.c === 0 && s1.tag === "Original", tag + "pointer hold shows the original");
  ok(!s2.h && s2.o === 0 && s2.c === 1 && s2.tag === "Balanced", tag + "release returns to the chosen level");
  for (const key of ["Space", "Enter"]) { await p.focus("#ehold"); await p.keyboard.down(key); const k1 = await state(); await p.keyboard.up(key); const k2 = await state(); ok(k1.h && k1.o === 1 && !k2.h && k2.c === 1, tag + key + " held on the button shows the original, release returns"); }
  await p.click("#latch"); const t1 = await state(); await p.click("#latch"); const t2 = await state(); ok(t1.o === 1 && t2.o === 0, tag + "plain toggle for people who cannot hold");
  const css = await p.evaluate(async () => { const g = getComputedStyle(document.querySelector("#ehold")); const t = await (await fetch("b.css")).text(); return [g.touchAction, g.userSelect, /\.ehold\{[^}]*-webkit-touch-callout:none/.test(t)].join(","); });
  ok(css === "none,none,true", tag + "touch-action none, user-select none, -webkit-touch-callout none on the hold button (" + css + ")");
  ok((await p.evaluate(() => window.__encodeCalls)) === enc0, tag + "no encode() before Use photo");
  const small = await p.evaluate(() => [...document.querySelectorAll("button,summary,input,label")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent && (r.height < 43.5 || r.width < 43.5) && !e.closest("#mockp"); }).map(e => (e.id || e.textContent.trim().slice(0, 14)) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
  ok(!small.length, tag + "tap targets at least 44 px " + small.join(" "));
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), tag + "no sideways scroll");
  await p.click("#use"); await p.waitForSelector("#pqchip", { timeout: 20000 });
  const enc1 = await p.evaluate(() => window.__encodeCalls); ok(enc1 === enc0 + 1, tag + "exactly one encode() on Use photo (" + enc1 + ")");
  const txt = await p.textContent(".eout"); ok(/\d+ × \d+ px, \d+ (KB|MB)/.test(txt) && /Square/.test(txt), tag + "result size and long edge shown: " + txt.replace(/\s+/g, " ").slice(0, 90));
  ok(!errs.length, tag + "no page errors " + errs.join("|")); await p.close();
}
const f = await b.newPage({ viewport: { width: 390, height: 780 } }); await f.goto(BASE + "?force=unsupported"); await f.click('[data-s="0"]'); await f.waitForSelector("#next:not([disabled])"); await f.click("#next"); await f.waitForSelector("#pqchip");
ok(!(await f.$("#ehold")), "unsupported browser: no Enhance UI, upload as today");
await b.close(); console.log(bad ? bad + " FAILED" : "all passed"); process.exit(bad ? 1 : 0);
