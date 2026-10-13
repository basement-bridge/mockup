// Regenerates the Plan UI review phone screenshots for decisions 154 to 188 (13 Oct 2026) into fragments/plan-ui-review/img/.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-shots.mjs [--only=substring]
// Dark theme (the default), headless Chromium, 390 x 844 and 360 x 740, JPEG. The ECG strip freezes the beat with the Web Animations API, so it is deterministic.
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
import { copyFileSync, writeFileSync, mkdirSync } from "node:fs";
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html", OUT = "fragments/plan-ui-review/img/";
const only = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SZ = { 390: [390, 844], 360: [360, 740] };
const cases = [];
for (const w of [390, 360]) {
  for (let n = 1; n <= 12; n++) cases.push([`p-wk-${n}-${w}`, `demo=week&frame=${n}&cap=0`, w, 700]);
  for (let n = 1; n <= 8; n++) cases.push([`p-nc-${n}-${w}`, `demo=nc&frame=${n}&cap=0`, w, n === 8 ? 3800 : n <= 2 ? 1000 : 600]);
  for (let n = 1; n <= 7; n++) { cases.push([`p-ag-${n}-${w}`, `demo=agenda&frame=${n}&cap=0`, w, 600]); cases.push([`p-seq-${n}-${w}`, `demo=1&frame=${n}&cap=0`, w, 600]); }
  cases.push([`p-od-${w}`, "demo=open&frame=1&cap=0", w, 700], [`p-od-swipe-${w}`, "demo=open&frame=2&cap=0", w, 700], [`p-od-nc-${w}`, "demo=open&frame=3&cap=0", w, 700], [`p-od-detail-${w}`, "demo=open&frame=4&cap=0", w, 700], [`p-grid-${w}`, "", w, 900]);
}
cases.push(["p-od-text-390", "od=text&demo=open&frame=1&cap=0", 390, 700], ["p-st-plain-390", "", 390, 900], ["p-tear-detail-390", "demo=1&frame=4&cap=0", 390, 600], ["p-tear-all-390", "demo=agenda&frame=3&cap=0", 390, 600]);
// 183, 187, 188: an open night opens the same light card as a Not cooking day, with Ask AI and Surprise me only (frame 5 of ?demo=open); frame 6 is now the night after a right swipe (p-open-swipe-*, was p-open-card-nc-*, the old after-Not-cooking-from-the-card picture); p-swap-open-* and p-open-day-390 were the old big empty detail and are regenerated (dock=d19 is Mon 19, an open night)
for (const w of [390, 360]) cases.push([`p-open-card-${w}`, "demo=open&frame=5&cap=0", w, 700], [`p-open-swipe-${w}`, "demo=open&frame=6&cap=0", w, 700], [`p-swap-open-${w}`, "dock=d19", w, 700]);
cases.push(["p-open-card-light-390", "demo=open&frame=5&cap=0", 390, 700, "light"], ["p-open-swipe-light-390", "demo=open&frame=6&cap=0", 390, 700, "light"], ["p-open-day-390", "dock=d19", 390, 700]);
cases.push(["p-wk-light-1-390", "demo=week&frame=1&cap=0", 390, 700, "light"], ["p-wk-light-5-390", "demo=week&frame=5&cap=0", 390, 700, "light"], ["p-wk-light-9-390", "demo=week&frame=9&cap=0", 390, 700, "light"]);
cases.push(["p-nc-light-1-390", "demo=nc&frame=1&cap=0", 390, 1000, "light"], ["p-nc-light-5-390", "demo=nc&frame=5&cap=0", 390, 600, "light"], ["p-nc-light-4-390", "demo=nc&frame=4&cap=0", 390, 600, "light"]);
const browser = await chromium.launch();
for (const [name, q, w, wait, scheme] of cases) {
  if (only && !name.includes(only)) continue;
  const ctx = await browser.newContext({ viewport: { width: SZ[w][0], height: SZ[w][1] }, hasTouch: true, isMobile: true, colorScheme: scheme || "dark" }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message)); await p.goto(BASE + (q ? "?" + q : "")); await sleep(wait);
  await p.screenshot({ path: OUT + name + ".jpg", type: "jpeg", quality: 80 }); if (errs.length) console.log(name, errs); await ctx.close();
}
// 172 to 175: the Release word on the per-meal Hold (detail footer and in-list), the mixed week with ?rs=both (three buttons wrap at 360), and last week (read only, no strip, no indicators)
if (!only || only.includes("rel") || only.includes("last")) {
  const hold = "const A = window.__plan; A.S.meals.forEach(function (m) { if (m.id === 'thu-salmon') m.held = 1; }); A.render();";
  for (const w of [390, 360]) {
    const ctx = await browser.newContext({ viewport: { width: SZ[w][0], height: SZ[w][1] }, hasTouch: true, isMobile: true, colorScheme: "dark" });
    for (const [name, q, js] of [[`p-rel-detail-${w}`, "sel=thu-salmon", hold], [`p-rel-list-${w}`, "sel=thu-salmon&ba=list", hold], [`p-rel-both-${w}`, "rs=both", hold + "window.scrollTo(0, document.querySelectorAll('.wkd')[1].getBoundingClientRect().top + scrollY - 70);"], [`p-wk-last-${w}`, "", "window.scrollTo(0, 0);"]]) {
      const p = await ctx.newPage(); await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); await p.evaluate(js); await sleep(500);
      await p.screenshot({ path: OUT + name + ".jpg", type: "jpeg", quality: 80 }); await p.close();
    }
    await ctx.close();
  }
}
// the tear when dragging UP (bottom edge) in the plain agenda
if (!only || "p-tear-up".includes(only) || only.includes("tear")) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: "dark" }); const p = await ctx.newPage(); await p.goto(BASE + "?demo=agenda&frame=1&cap=0"); await sleep(500);
  await p.evaluate(() => { const A = window.__plan, t = document.querySelector('.pw-day .mc[data-id="thu-salmon"]').getBoundingClientRect(), x = t.left + t.width / 2, y = t.top + t.height / 2; A.beginDrag("thu-salmon", x, y, 99, { src: "agenda" }); A.moveHand(x + 4, y - 40); });
  await sleep(300); await p.screenshot({ path: OUT + "p-tear-agenda-up-390.jpg", type: "jpeg", quality: 80 }); await ctx.close();
}
// the ECG beat, frozen at five moments and stitched side by side
if (!only || only.includes("ecg")) {
  const times = [0, 330, 700, 1200, 2400], tiles = [];
  for (const t of times) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: "dark", deviceScaleFactor: 3 }); const p = await ctx.newPage(); await p.goto(BASE + "?day=d16"); await sleep(300);
    await p.evaluate(ms => { document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }); }, t);
    const b = await p.locator('.ecg[data-ecg="d17"]').boundingBox(); await p.screenshot({ path: `/tmp/ecg-${t}.png`, clip: { x: 0, y: b.y - 6, width: 120, height: 44 } }); tiles.push(`/tmp/ecg-${t}.png`); await ctx.close();
  }
  writeFileSync("/tmp/ecg-list.txt", tiles.join("\n"));
}
await browser.close(); console.log("done");
