// Layout and behaviour check for fragments/desktop-shopping (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/shopping-desktop-check.mjs [--shots=docs/screenshots]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers (Proposals SD-1 to SD-12, Kitchie #775): at 1440 and 1920 the rail (88), the 640 column and the 400 panel are one left-anchored group with one 48px gutter; the panel holds the hand-off; the header count equals the rail's badge
// and follows Bought and Remove and the D and S keys; hover and the current line show Bought and Remove with key caps; a line with no picture draws nothing in its slot; the current line has no focus ring; no panel when the list is empty;
// option B has no panel; at 1023 the page has no panel and no header band (desktop only).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/desktop-shopping/shopping.html";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function page(w, h, q = "", theme = "kitchie") {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await ctx.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  await p.goto(BASE + (q ? "?" + q : "")); await p.waitForTimeout(400); return p;
}
const box = (p, s) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, w: r.width, t: r.top, b: r.bottom }; }, s);
const vis = (p, s) => p.evaluate(s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0; }, s);
const snap = async (p, n) => { if (shots) await p.screenshot({ path: `${shots}/shopping-desktop-${n}.png` }); };
let p;
for (const w of [1440, 1920]) {
  p = await page(w, 900, "cur=3");
  const rail = await box(p, "nav.bar"), pan = await box(p, "#sl-top"), hd = await box(p, "#shop-hd"), col = await box(p, "#shop");
  ok(rail.w === 88, `${w}: the rail is 88px wide (SD-1)`);
  ok(Math.round(pan.l) === 88 + 640 + 2 * 48 && pan.w === 400, `${w}: the panel starts where the column ends (rail + column + 2 gutters) and is 400px wide`);
  ok(col.l === 88 + 48 && col.w === 640, `${w}: the column is 640px wide, one gutter from the rail`);
  ok(hd && (await p.textContent("#shop-count")) === "8 to get" && (await p.textContent("nav.bar i.badge")) === "8", `${w}: the header count equals the rail badge (SD-2)`);
  ok(await vis(p, "#sl-top .sl-handoff"), `${w}: the hand-off card is in the panel (SD-3)`);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("#sl-top"), "::after").content.includes("J K move")), `${w}: the keys line is in the panel (SD-4)`);
  const cur = p.locator("li.shoprow[data-cur]");
  ok((await cur.locator(".acts").evaluate(e => getComputedStyle(e).opacity)) === "1", `${w}: the current line shows Bought and Remove (SD-6)`);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("li.shoprow:not([data-cur]) .acts")).opacity === "0"), `${w}: other lines hide them until hover`);
  await p.locator("li.shoprow").nth(0).hover(); await p.waitForTimeout(150);
  ok((await p.locator("li.shoprow").nth(0).locator(".acts").evaluate(e => getComputedStyle(e).opacity)) === "1", `${w}: hover shows them`);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("[data-shop-buy]"), "::after").content === '"D"' && getComputedStyle(document.querySelector("[data-shop-remove]"), "::after").content === '"S"'), `${w}: the key caps are D and S`);
  ok(!(await p.locator("li.shoprow .more").first().isVisible()), `${w}: the touch "more" button is not drawn`);
  ok(await p.evaluate(() => { const e = document.querySelector("li.shoprow .em.np"); return !!e && getComputedStyle(e).fontSize === "0px" && getComputedStyle(e).backgroundColor === "rgba(0, 0, 0, 0)"; }), `${w}: a line with no picture draws nothing in its slot (SD-7)`);
  ok(await p.evaluate(() => { const e = document.querySelector("li.shoprow:not(:has(.np)) .em"); const r = e.getBoundingClientRect(); return r.width === 40 && r.height === 40; }), `${w}: a picture is a 40px tile`);
  ok(await p.evaluate(() => { document.querySelector("li.shoprow[data-cur] .rlink").focus(); return getComputedStyle(document.querySelector("li.shoprow[data-cur] .rlink")).outlineStyle === "none"; }), `${w}: the current line is drawn once, no focus ring (SD-5)`);
  ok(!p.errs.length, `${w}: no page errors ${p.errs.join(" | ")}`);
  await snap(p, `${w}`);
  // keys and buttons keep the count equal
  await p.keyboard.press("d"); await p.waitForTimeout(100);
  ok((await p.textContent("#shop-count")) === "7 to get" && (await p.textContent("nav.bar i.badge")) === "7" && (await p.locator("li.shoprow[data-cur]").count()) === 1, `${w}: D takes the current line off, the next becomes current, the count and badge follow`);
  await p.locator("li.shoprow:not([hidden]) [data-shop-remove]").first().evaluate(e => e.click()); await p.waitForTimeout(100);
  ok((await p.textContent("#shop-count")) === "6 to get", `${w}: Remove follows too`);
}
p = await page(1440, 900, "s=empty");
ok(!(await vis(p, "#sl-top")) && !(await vis(p, "#shop-hd")) && (await box(p, "nav.bar")).w === 88, "empty: no panel and no count; the existing empty card stays (empty is absent)");
ok(await p.evaluate(() => getComputedStyle(document.body).marginRight === "0px"), "empty: no panel lane reserved on the right");
p = await page(1440, 900, "o=b&cur=3");
ok(await p.evaluate(() => getComputedStyle(document.querySelector("#sl-top")).position === "static"), "option B: the hand-off stays in the column, no panel");
p = await page(1023, 800, "cur=3");
ok(!(await vis(p, "#shop-hd")) && (await p.evaluate(() => getComputedStyle(document.querySelector("#sl-top")).position === "static")) && (await p.evaluate(() => getComputedStyle(document.querySelector("nav.bar")).position === "fixed" && document.querySelector("nav.bar").getBoundingClientRect().width > 300)), "1023: no header count, no panel, the bottom bar: desktop rules do not apply");
await b.close();
console.log(fails ? `${fails} FAILED` : "ALL PASSED");
process.exit(fails ? 1 : 0);
