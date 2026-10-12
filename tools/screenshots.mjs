// Reusable screenshot + layout check script (DESIGN.md section 7).
// Usage:  python3 -m http.server 8123 &   then   node tools/screenshots.mjs [outDir] [--only=substring]
// Needs playwright-core (npm i --no-save playwright-core@1.56.0) and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// The three household variants (mobile, tablet, desktop) are listed separately; --only=household runs all six household entries.
// Captures every screen at 360, 390 (phone), 768 (tablet), 1280 (desktop) in kitchie-day (light) and kitchie (dark),
// and prints automatic checks: sideways scroll, tap targets under 44px, content edge-to-edge on desktop.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:8123/";
const out = process.argv.find((a, i) => i > 1 && !a.startsWith("--")) || "shots";
const only = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7);
const SCREENS = [
  ["index", "index.html"],
  ["household-mobile", "flows/household/mobile/index.html"],
  ["household-tablet", "flows/household/tablet/index.html"],
  ["household-desktop", "flows/household/desktop/index.html"],
  /* third item: a household Controls "Jump to" screen to open before the capture (the flow starts on the invite link) */
  ["household-mobile-pantry", "flows/household/mobile/index.html", "pantry"],
  ["household-tablet-pantry", "flows/household/tablet/index.html", "pantry"],
  ["household-desktop-pantry", "flows/household/desktop/index.html", "pantry"],
  /* fourth item: a Controls button to press after the jump. Desktop only: "Simulate tab focus" plays the refresh animation over the docked search bar (above 1024px; below it the button says so). */
  ["household-desktop-pantry-refresh", "flows/household/desktop/index.html", "pantry", "tabfocus"],
  ["inventory-home", "fragments/inventory-home/index.html"],
  ["item-row-axes", "fragments/item-row-axes/index.html"],
  ["item-sheet", "fragments/item-sheet/index.html"],
  ["locations-spots", "fragments/locations-spots/index.html"],
  ["mid-cook", "fragments/mid-cook/index.html"],
  ["plan-week", "fragments/plan-week/index.html"],
  ["pwa-cta", "fragments/pwa-cta/index.html"],
  ["recipe-page", "fragments/recipe-page/index.html"],
  ["recipe-search", "fragments/recipe-search/index.html"],
  ["scan-in", "fragments/scan-in/index.html"],
  ["use-up", "fragments/use-up/index.html"],
].filter(s => !only || s[0].includes(only));
const WIDTHS = [[360, 800, "phone"], [390, 844, "phone"], [768, 1024, "tablet"], [1280, 900, "desktop"]];
const THEMES = [["kitchie-day", "light"], ["kitchie", "dark"]];

const browser = await chromium.launch();
mkdirSync(out, { recursive: true });
const problems = [];
for (const [name, path, jump, press] of SCREENS) {
  for (const [w, h, bucket] of WIDTHS) {
    for (const [theme, mode] of THEMES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
      await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      if (jump) await page.evaluate(j => document.querySelector(`[data-act=jump][data-p=${j}]`).click(), jump);
      if (press) { await page.evaluate(a => document.querySelector(`[data-act=${a}]`).click(), press); await page.waitForTimeout(600); }
      await page.waitForTimeout(250);
      const r = await page.evaluate(([w]) => {
        const de = document.documentElement;
        const small = [...document.querySelectorAll("a,button,input,select,textarea,[role=button]")].filter(el => {
          const lab = el.closest("label"); const b = (lab && lab !== el ? lab : el).getBoundingClientRect(), cs = getComputedStyle(el);
          return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && !(el.tagName === "A" && cs.display === "inline") && (b.height < 43.5 || b.width < 43.5);
        }).slice(0, 6).map(el => (el.tagName + "." + (el.className || "").toString().slice(0, 24) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)));
        const wrap = document.querySelector(".wrap");
        const max = parseFloat(getComputedStyle(de).getPropertyValue("--content-max")) || 100000; return { max, sw: de.scrollWidth, cw: de.clientWidth, theme: de.getAttribute("data-theme"), small, wrapW: wrap ? Math.round(wrap.getBoundingClientRect().width) : null };
      }, [w]);
      const file = `${out}/${name}__${w}-${mode}.png`;
      await page.screenshot({ path: file, fullPage: true });
      const flags = [];
      if (r.sw > r.cw) flags.push(`SIDEWAYS SCROLL ${r.sw}>${r.cw}`);
      if (r.theme !== theme) flags.push(`theme ${r.theme}`);
      if (bucket === "desktop" && r.wrapW && r.wrapW > r.max) flags.push(`wide ${r.wrapW}`);
      if (r.small.length) flags.push(`small targets: ${r.small.join("; ")}`);
      if (flags.length) problems.push(`${name} @${w} ${mode}: ${flags.join(" | ")}`);
      await ctx.close();
    }
  }
}
await browser.close();
console.log(problems.length ? "CHECKS:\n" + problems.join("\n") : "CHECKS: clean");
console.log(`${SCREENS.length * WIDTHS.length * THEMES.length} screenshots in ${out}/`);
