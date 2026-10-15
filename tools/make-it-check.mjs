// Checks and screenshots for fragments/make-it (Make it, Kitchie #779/#781). Headless Chromium via playwright-core.
// Usage: python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/make-it-check.mjs [shots]    (ORIGIN=... to point elsewhere)
// Looks at: no sideways scroll, no console errors, 44px targets, the visibility rule (Make it present/absent per state), the tap result, dark and light, phone 360/390 and desktop 1280.
import { createRequire } from "module";
import fs from "fs";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const ORIGIN = process.env.ORIGIN || "http://localhost:8123", B = ORIGIN + "/fragments/make-it/", OUT = process.argv[2] === "shots" ? "shots/make-it" : null;
if (OUT) fs.mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await pw.chromium.launch();
const makeCount = p => p.locator('[data-make]:visible').count();
// [page, query, expected Make it buttons, label]
const CASES = [
  ["plan-phone.html", "s=saved&o=a", 1], ["plan-phone.html", "s=saved&o=b", 1], ["plan-phone.html", "s=saved&o=c", 1],
  ["plan-phone.html", "s=adhoc&o=a", 1], ["plan-phone.html", "s=held&o=a", 1], ["plan-phone.html", "s=missing&o=a", 1],
  ["plan-phone.html", "s=past&o=a", 0], ["plan-phone.html", "s=past&o=b", 0], ["plan-phone.html", "s=past&o=c", 0],
  ["plan-phone.html", "s=view&o=a", 0], ["plan-phone.html", "s=view&o=b", 0], ["plan-phone.html", "s=view&o=c", 0],
  ["plan-desk.html", "s=saved&o=a", 1], ["plan-desk.html", "s=adhoc&o=b", 1], ["plan-desk.html", "s=held&o=c", 1], ["plan-desk.html", "s=past&o=a", 0], ["plan-desk.html", "s=view&o=a", 0],
  ["home.html", "p=today", 2], ["home.html", "p=none", 0], ["home.html", "p=none&mu=1", 1], ["home.html", "p=other", 1],
  ["home.html", "p=today&w=desk", 2], ["home.html", "p=none&w=desk", 0], ["home.html", "p=other&w=desk", 1],
  ["index.html", "", 0], ["recipe.html", "v=sheet", 1], ["recipe.html", "v=card", 1], ["recipe.html", "v=desk", 1],
];
for (const [scheme, w, h, touch, theme] of [["dark", 390, 844, true, "kitchie"], ["dark", 360, 740, true, "kitchie"], ["light", 390, 844, true, "kitchie-day"], ["light", 360, 740, true, "kitchie-day"], ["dark", 1280, 800, false, "kitchie"], ["light", 1280, 800, false, "kitchie-day"]]) {
  const tag = `[${scheme} ${w}]`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  for (const [page, q, want] of CASES) {
    const desk = (/desk/.test(page) || /w=desk|v=desk/.test(q)) ;
    if (desk !== (w >= 1024)) continue;
    const errs = [], p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    await p.goto(`${B}${page}?${q}`); await p.waitForTimeout(250);
    const name = `${tag} ${page}?${q}`;
    ok(`${name}: Make it buttons = ${want}`, (await makeCount(p)) === want, await makeCount(p));
    ok(`${name}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${name}: no console errors`, !errs.length, errs);
    const small = await p.evaluate(() => [...document.querySelectorAll("button:not(.tongue),a.btn,a.mkbtn,.mkbtn")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && (r.height < 43.5 || r.width < 43.5) && getComputedStyle(e).visibility !== "hidden"; }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
    ok(`${name}: controls at least 44px`, !small.length, small);
    const bad = await p.evaluate(() => [...document.querySelectorAll(".mkbtn")].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent));
    ok(`${name}: Make it label not clipped`, !bad.length, bad);
    ok(`${name}: the word Cook now is gone`, page === "index.html" || !/Cook now/i.test(await p.evaluate(() => document.body.innerText)));
    if (OUT) await p.screenshot({ path: `${OUT}/${page.replace(".html", "")}-${q.replace(/[=&]/g, "_")}-${scheme}-${w}.png`, fullPage: false });
    await p.close();
  }
  if (w === 390 && scheme === "dark") {
    // taps: saved recipe lands on the existing cook page, made-up meal on the Cooking now screen
    let p = await ctx.newPage(); await p.goto(`${B}plan-phone.html?s=saved&o=a`); await p.locator("[data-make]").first().tap(); await p.waitForURL(/recipe\/cook\.html/, { timeout: 4000 }).catch(() => {});
    ok(`${tag} tap Make it on a saved recipe opens the existing cook page`, /recipe\/cook\.html\?id=efr/.test(p.url()), p.url()); await p.close();
    p = await ctx.newPage(); await p.goto(`${B}plan-phone.html?s=adhoc&o=b`); await p.locator("[data-make]").first().tap(); await p.waitForURL(/cooking\.html/, { timeout: 4000 }).catch(() => {});
    ok(`${tag} tap Make it on a made-up meal opens Cooking now`, /make-it\/cooking\.html/.test(p.url()), p.url());
    ok(`${tag} Cooking now shows the ingredients and a way back`, (await p.locator(".cv .ci").count()) === 7 && (await p.locator("a.back").count()) === 1); await p.close();
    // Hold / Release is a real toggle and Make it stays
    p = await ctx.newPage(); await p.goto(`${B}plan-phone.html?s=saved&o=a`); await p.locator("[data-hold]").tap();
    ok(`${tag} Hold becomes Release, Make it stays`, /Release/.test(await p.locator("[data-hold]").innerText()) && (await makeCount(p)) === 1); await p.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`${total - fails}/${total} checks passed`); process.exit(fails ? 1 : 0);
