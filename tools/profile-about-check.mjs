// Checks and screenshots for fragments/profile-about (decision SW-83, PROPOSED).
// Usage:  python3 -m http.server 8123 &   then   node tools/profile-about-check.mjs [outDir]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:8123/";
const out = process.argv[2] || "shots/profile-about";
mkdirSync(out, { recursive: true });
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } else console.log("ok  ", m); };

const browser = await chromium.launch();
for (const [vw, vh] of [[360, 900], [390, 900], [1280, 900], [1024, 900]]) {
  for (const theme of ["kitchie-day", "kitchie"]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    await ctx.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch {} document.documentElement.setAttribute("data-theme", t); }, theme);
    const page = await ctx.newPage();
    await page.goto(`${BASE}fragments/profile-about/index.html`);
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    const tag = `${vw}-${theme}`;
    const abouts = await page.$$eval("[data-about]", (els) => els.map((e) => ({ text: e.textContent, fs: getComputedStyle(e).fontSize, op: getComputedStyle(e).opacity, color: getComputedStyle(e).color, tab: e.tabIndex, link: !!e.closest("a,button") })));
    ok(abouts.length === 4, `${tag}: four About lines drawn (the two production frames draw none)`);
    ok(abouts.every((a) => a.fs === "11px" && a.op === "0.7" && a.tab === -1 && !a.link), `${tag}: 11px, 70% opacity, not focusable, not a link`);
    ok(abouts[0].text === "Kitchie v0.101.0Platform v0.1.7Recipe v1.1.0", `${tag}: UAT line names all three`);
    ok(!abouts.some((a) => /unknown|undefined|null|error/i.test(a.text)), `${tag}: never says unknown`);
    const sx = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(sx <= 0, `${tag}: no sideways scroll`);
    const prodPhone = await page.$$eval(".pa-phone", (els) => els[1].querySelectorAll("[data-about]").length);
    ok(prodPhone === 0, `${tag}: production phone frame has no element`);
    if (vw >= 1024) {
      const dir = await page.$eval(".pa-rail .about", (e) => getComputedStyle(e).flexDirection);
      ok(dir === "column", `${tag}: rail line is one release per line at ${vw}px`);
    }
    if (theme === "kitchie-day" || vw === 390) await page.screenshot({ path: `${out}/${tag}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
console.log(fails === 0 ? "ALL OK" : `${fails} FAILED`);
process.exit(fails ? 1 : 0);
