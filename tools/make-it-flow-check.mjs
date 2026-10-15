// Behaviour check + screenshots for Make it: chat and screen, one flow (Kitchie #781), headless Chromium. Mockup only.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/make-it-flow-check.mjs [shotsDir]
// Env: BASE=... to point elsewhere; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/make-it-flow/index.html";
const OUT = process.argv[2] || "";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await chromium.launch();
const errs = [];
async function open(w, h, theme) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme || "kitchie-day");
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(BASE); await sleep(250); return p;
}
const ph = (p, n) => p.locator(`#flow${n} .fp`);
const txt = (p, n) => ph(p, n).innerText();
const click = (p, n, sel) => p.locator(`#flow${n} ${sel}`).first().click();
const sess = (p, n) => p.evaluate(n => window.__flow[n - 1].live().map(x => x.k + ":" + x.via), n);
const page = (p, n) => p.evaluate(n => window.__flow[n - 1].s.page, n);

{ const p = await open(1280, 900);
  // chat starts the rice with a recipe id: all three get a banner
  await p.click('[data-all="crice"]'); await sleep(100);
  for (const n of [1, 2, 3]) ok(`o${n}: chat start puts Egg fried rice on the banner`, (await ph(p, n).locator(".cookbn").count()) === 1 && (await sess(p, n)).join() === "rice:chat");
  // the banner opens the cook page in 1 and 3, the ingredients screen in 2
  for (const n of [1, 2, 3]) { await click(p, n, ".cookbn-open"); await sleep(50); }
  ok("o1: banner opens the cook page", (await page(p, 1)) === "cook"); ok("o3: banner opens the cook page", (await page(p, 3)) === "cook"); ok("o2: banner opens the ingredients screen", (await page(p, 2)) === "cooking");
  ok("o2: the ingredients screen has a row to the cook page", (await txt(p, 2)).includes("Browse the recipe"));
  ok("o1: the cook page has an Ingredients row", (await txt(p, 1)).includes("Ingredients"));
  // the chat panel shows the call in plain words
  ok("o1: chat shows the tool call in plain words and Kitchie's answer", /assistant uses kitchie: start cooking/i.test(await p.locator("#flow1 .chat").innerText()) && /Kitchie answers/.test(await p.locator("#flow1 .chat").innerText()));
  ok("o1: chat call mentions the linked recipe", (await p.locator("#flow1 .chat").innerText()).includes("linked to your recipe"));
  // a 2nd start of the same dish from the screen: 1 and 3 join it, 2 opens the cook page with no new session
  await p.click('[data-all="mrice"]'); await sleep(50);
  for (const n of [1, 3]) ok(`o${n}: Make it on a live dish joins it (one session)`, (await sess(p, n)).length === 1);
  ok("o2: Make it opens the cook page", (await page(p, 2)) === "cook"); ok("o2: still one session", (await sess(p, 2)).length === 1);
  // Done on the cook page: walk to the last step
  for (const n of [1, 2, 3]) { await p.evaluate(n => { const f = window.__flow[n - 1]; f.s.page = "cook"; f.s.cur = { k: "rice", sid: f.live()[0].id }; f.s.step = 4; f.render(); }, n); await click(p, n, '[data-a="next"]'); await sleep(50); }
  ok("o1: Done on the cook page ends the session", (await sess(p, 1)).length === 0); ok("o3: Done ends the making state", (await sess(p, 3)).length === 0);
  ok("o2: Done leaves the session on the banner", (await sess(p, 2)).length === 1 && (await ph(p, 2).locator(".cookbn").count()) === 1);
  ok("o3: Done marks the lunch as made", (await txt(p, 3)).includes("Lunch marked as made"));
  // made up dish from the screen (Plan)
  await p.click('[data-all="reset"]'); await p.click('[data-all="mnood"]'); await sleep(50);
  ok("o1: Make it on a made-up meal starts a session and opens the ingredients screen", (await sess(p, 1)).join() === "noodles:screen" && (await page(p, 1)) === "cooking");
  ok("o3: same for option 3", (await sess(p, 3)).join() === "noodles:screen" && (await page(p, 3)) === "cooking");
  ok("o2: no session and no Make it on a made-up meal", (await sess(p, 2)).length === 0 && (await ph(p, 2).locator('.meal:has-text("Garlic") [data-a="make"]').count()) === 0);
  ok("o1: made-up dish has no cook-page row", (await ph(p, 1).locator('[data-a="tocook"]').count()) === 0);
  // two at once
  await p.click('[data-all="reset"]'); await p.click('[data-all="crice"]'); await p.click('[data-all="cnood"]'); await sleep(50);
  for (const n of [1, 2, 3]) { ok(`o${n}: two sessions, banner says 1 of 2`, (await sess(p, n)).length === 2 && (await ph(p, n).locator(".cookbn").innerText()).toLowerCase().includes("1 of 2")); }
  await click(p, 1, ".cookbn-go"); ok("o1: tap the name brings the other dish forward", (await ph(p, 1).locator(".cookbn").innerText()).toLowerCase().includes("2 of 2"));
  // stop from chat
  await click(p, 1, '.qr [data-a="cstop"][data-k="rice"]'); ok("o1: the assistant's stop ends only that session", (await sess(p, 1)).join() === "noodles:chat");
  await click(p, 1, '.qr [data-a="ccheck"][data-k="rice"]'); ok("o1: a check-in after the stop says it ended", /already ended/.test(await p.locator("#flow1 .chat").innerText()));
  // dismiss on screen then check in: closed
  await click(p, 2, ".cookbn-x"); await click(p, 2, '.qr [data-a="ccheck"][data-k="rice"]').catch(() => {});
  ok("o2: banner X dismisses, the assistant is told it stays closed", /stays closed|already ended/.test(await p.locator("#flow2 .chat").innerText()));
  // 45 minutes
  await p.click('[data-all="reset"]'); await p.click('[data-all="crice"]'); await p.click('[data-all="t10"]');
  for (const n of [1, 2, 3]) ok(`o${n}: still there after 10 min`, (await sess(p, n)).length === 1);
  await p.click('[data-all="t45"]');
  for (const n of [1, 2, 3]) ok(`o${n}: cleared by itself after 45 minutes`, (await sess(p, n)).length === 0 && (await ph(p, n).locator(".cookbn").count()) === 0);
  // screen start survives past 45 min only with activity (1, 3)
  await p.click('[data-all="reset"]'); await p.evaluate(() => window.__flow.forEach(f => { f.s.page = "recipes"; f.makeIt("rice"); f.clock(30); f.s.step = 0; f.advance(1); f.clock(30); }));
  ok("o1: screen activity keeps a screen-started session alive past 45 min", (await sess(p, 1)).length === 1);
  ok("o3: same for option 3", (await sess(p, 3)).length === 1);
  ok("no sideways scroll at 1280", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await p.context().close();
}
for (const [w, h] of [[360, 740], [390, 844]]) for (const theme of ["kitchie-day", "kitchie"]) {
  const p = await open(w, h, theme), tag = `${w} ${theme}`;
  ok(`${tag}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  ok(`${tag}: theme applied`, (await p.evaluate(() => document.documentElement.getAttribute("data-theme"))) === theme);
  ok(`${tag}: phone fits the width`, await p.evaluate(() => [...document.querySelectorAll(".fp")].every(e => e.getBoundingClientRect().width <= innerWidth + 1)));
  const small = await p.evaluate(() => [...document.querySelectorAll("button")].filter(b => b.offsetParent && !b.closest(".fp") && b.getBoundingClientRect().height < 44).map(b => b.textContent.trim()));
  ok(`${tag}: page buttons are 44px tall`, small.length === 0, small);
  const smallPh = await p.evaluate(() => [...document.querySelectorAll(".fp button")].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44 && b.getBoundingClientRect().height > 0).map(b => b.className + ":" + b.textContent.trim()));
  ok(`${tag}: phone buttons are 44px tall`, smallPh.length === 0, smallPh);
  if (OUT) {
    await p.evaluate(() => { window.__flow.forEach(f => { f.chatStart("rice"); f.chatStart("noodles"); }); });
    await p.locator("#o1").scrollIntoViewIfNeeded(); await sleep(200);
    await p.locator("#o1").screenshot({ path: `${OUT}/o1-banner-${w}-${theme}.png` });
    await p.evaluate(() => window.__flow.forEach(f => { const x = f.live()[0]; f.banner(x, true); }));
    await p.locator("#o1").screenshot({ path: `${OUT}/o1-open-${w}-${theme}.png` });
    await p.locator("#o2").screenshot({ path: `${OUT}/o2-open-${w}-${theme}.png` });
    await p.locator("#o3").screenshot({ path: `${OUT}/o3-open-${w}-${theme}.png` });
    if (w === 390 && theme === "kitchie-day") await p.screenshot({ path: `${OUT}/page-${w}-${theme}.png`, fullPage: true });
  }
  await p.context().close();
}
ok("no console or page errors", errs.length === 0, errs);
await browser.close();
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} passed`);
process.exit(fails ? 1 : 0);
