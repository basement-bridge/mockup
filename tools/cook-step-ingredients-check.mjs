// Behaviour and layout check for the per-step ingredients fragment, headless Chromium. Mockup only.
// Usage:  python3 -m http.server 8123 &   then   node tools/cook-step-ingredients-check.mjs   (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const BASE = process.env.BASE || "http://localhost:8123/fragments/cook-step-ingredients/";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await pw.chromium.launch(); const errs = [];
for (const [w, mode] of [[360, "light"], [390, "dark"], [1280, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: mode });
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); await p.goto(BASE, { waitUntil: "networkidle" }); const t = "w" + w + " ";
  const txt = id => p.locator(id).innerText();
  ok(t + "no sideways scroll", await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  // A starts on step 2: split chicken, explicit oil, unknown salt
  let a = await txt("#pa .stepuse");
  ok(t + "A split: 1 of 2 chicken breast and already used in step 1", /1 of 2\s+chicken breast/.test(a) && /1 already used in step 1/.test(a), a);
  ok(t + "A oil: 1 of 4 tbsp, 3 left for steps 3, 7", /1 of 4 tbsp/.test(a) && /3 left for steps 3, 7/.test(a), a);
  ok(t + "A unknown amount says so, no invented amount", /Amount not given/.test(a) && !/to taste/i.test(a));
  ok(t + "A shows only this step's items (no rice)", !/rice/.test(a));
  // scaling 4 -> 8 doubles, rest recomputed
  await p.click('[data-sv="2"]'); await p.click('[data-sv="2"]'); await p.click('#pa [data-go="2"]'); await p.click('#pa [data-go="3"]');
  a = await txt("#pa .stepuse"); ok(t + "scale 8: soy rest is 4 of 6 tbsp", /4 of 6 tbsp/.test(a), a);
  await p.click('[data-sv="-2"]'); await p.click('[data-sv="-2"]');
  // done / remaining
  let rest = await txt("#pa .rest"); ok(t + "A rest list has Still to come and Already used with step numbers", /Still to come/i.test(rest) && /Already used/i.test(rest) && /Used in step/.test(rest), rest);
  // no-ingredients step
  await p.click('#pa [data-go="4"]'); ok(t + "tagged-empty step says so", /No ingredients in this step/.test(await txt("#pa .body")));
  ok(t + "no strip on that step", (await p.locator("#pa .stepuse").count()) === 0);
  // untagged
  await p.click('[data-rec="none"]'); const body = await txt("#pa .body");
  ok(t + "untagged: no strip, no list, no hint", (await p.locator("#pa .stepuse, #pa .rest, #pa .noings").count()) === 0 && !/tagged/i.test(body));
  await p.click('[data-rec="half"]'); await p.click('#pa [data-go="2"]'); await p.click('#pa [data-go="3"]');
  ok(t + "half tagged: untagged step shows nothing, no rest list", (await p.locator("#pa .stepuse, #pa .rest, #pa .noings").count()) === 0);
  // long list caps at five and expands in place
  await p.click('[data-rec="tray"]'); await p.click('#pa [data-go="0"]');
  ok(t + "long list caps at five", (await p.locator("#pa .su li").count()) === 5);
  await p.click("#pa [data-more]"); ok(t + "show more expands in place to seven", (await p.locator("#pa .su li").count()) === 7);
  // C dock opens in place
  await p.click('#pc [data-go="0"]').catch(() => {}); ok(t + "C dock is collapsed by default", (await p.locator("#pc [data-dock]").getAttribute("aria-expanded")) === "false");
  await p.click("#pc [data-dock]"); ok(t + "C dock opens the callout", (await p.locator("#pc .stepuse:visible").count()) === 1);
  // no gesture hints
  ok(t + "no gesture hint text", !/swipe|arrow key/i.test(await txt("#opts")));
  // tap targets
  const small = await p.evaluate(() => [...document.querySelectorAll("button")].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); }).map(b => b.className + b.textContent.slice(0, 14)));
  ok(t + "controls at least 44px", small.length === 0, small);
  await ctx.close();
}
await browser.close();
ok("no page errors", errs.length === 0, errs);
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} checks passed`); process.exit(fails ? 1 : 0);
