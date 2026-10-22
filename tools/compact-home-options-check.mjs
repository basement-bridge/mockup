// Behaviour and layout check for fragments/compact-home-options (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/compact-home-options-check.mjs [--shots=docs/screenshots]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: every option draws in all four states with no console error, in a dark and a light theme; the Today frame reproduces the dead end; A near-misses (fewest missing first, never fewer than 3 missing, one-tap add toggles);
// B strip is buttons, tray, Add both, Plan tonight prefilled only when there is no lead; C reasons split (blocked apart from missing, nothing blocked: no blocked group); D lens re-ranks, chips below the answer, zero chips dim and dashed;
// E needs no scroll in any state; F has no view toggle and Compact rows tightens it; Surprise me is never drawn; no hex colour in compact.css.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/compact-home-options/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function page(q = "", theme = "kitchie", w = 1440, h = 900) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await ctx.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  await p.goto(BASE + (q ? "?" + q : "")); await p.waitForTimeout(250); await p.addStyleTag({ content: ".bar{position:static!important}" }); return p;
}
const txt = (p, s) => p.locator(s).allTextContents().then(a => a.join(" | "));
const S = ["fits", "planned", "none", "excl"];

for (const theme of ["kitchie", "kitchie-day"]) for (const s of S) {
  const p = await page("s=" + s, theme);
  ok(await p.locator(".dw").count() === 7, `${theme} ${s}: seven frames (Today, A to F)`);
  ok(p.errs.length === 0, `${theme} ${s}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} ${s}: no sideways page scroll at 1440`);
  if (shots) for (const o of "TABCDEF") await p.locator(`#opt-${o} .desk`).screenshot({ path: `${shots}/compact-home-options-${s}-${o}-${theme}.png` });
  await p.context().close();
}

let p = await page("s=none&o=T");
ok((await p.locator("#opt-T .empt .btn").count()) === 1 && /Plan ahead/.test(await txt(p, "#opt-T .empt .btn")), "Today, nothing fits: the dead end, one Plan ahead button");
ok(/Every recipe needs three or more things you do not have, or is left out for someone eating/.test(await txt(p, "#opt-T .empt")), "Today: the one sentence for two causes");
ok(await p.locator("#opt-T .glance a").count() === 2, "Today, nothing fits: two pills (2 running low, Nothing planned today), no going off");
await p.context().close();

p = await page("s=none&o=A");
const rowsA = await p.locator("#opt-A .nrow").count();
ok(rowsA === 4, "A, nothing fits: freezer row plus the closest three");
ok((await p.locator("#opt-A .nrow .rmiss").allTextContents()).every(t => +t.match(/Missing (\d+)/)[1] >= 3), "A: every near-miss misses 3 or more (a recipe missing 2 fits)");
await p.click('#opt-A [data-f="list-Achilli"]'); ok(/On the list/.test(await txt(p, '#opt-A [data-f="list-Achilli"]')) && await p.locator("#toast:not([hidden])").count() === 1, "A: one tap adds the missing things (button shows On the list, toast says so)");
await p.click('#opt-A [data-f="list-Achilli"]'); ok(/Add 3 to list/.test(await txt(p, '#opt-A [data-f="list-Achilli"]')), "A: a second tap takes them off again");
await p.context().close();
p = await page("s=excl&o=A");
ok(await p.locator("#opt-A .nrow").count() === 3 && /Every recipe needs three/.test(await txt(p, "#opt-A .empt")), "A, exclusions: two near-misses, the conflated sentence is still there (A alone does not split)");
await p.context().close();

p = await page("s=none&o=B");
ok(await p.locator("#opt-B .glance a").count() === 0 && await p.locator("#opt-B .glance .gp").count() === 3, "B: the pills are buttons (running low, Plan tonight, Plan ahead)");
ok(await p.locator("#opt-B .empt .btn").count() === 0, "B: Plan ahead leaves the empty card");
ok(/Plan tonight: Chilli noodles/.test(await txt(p, "#opt-B [data-act=plantonight]")), "B: Plan tonight prefilled with the top near-miss");
await p.click("#opt-B [data-act=tray][data-t=low]"); ok(await p.locator("#opt-B .tray .or").count() === 2, "B: running low opens a tray with its two items");
const y0 = await p.locator("#opt-B .glance").boundingBox();
await p.click("#opt-B [data-act=lowall]"); ok((await p.locator("#opt-B .tray .or .btn.on").count()) === 2, "B: Add both marks both");
await p.click("#opt-B [data-act=plantonight]"); ok(/Planned: Chilli noodles/.test(await txt(p, "#opt-B .gp.hot")), "B: Plan tonight plans it (and says so)");
await p.context().close();
p = await page("s=fits&o=B");
ok(await p.locator("#opt-B [data-act=plantonight]").count() === 0 && await p.locator("#opt-B .glance .gp").count() === 3, "B, with a lead: no Plan tonight pill (the lead's own Plan does it); going off, running low, Plan ahead");
await p.context().close();

p = await page("s=none&o=C");
ok(await p.locator("#opt-C .rg").count() === 1 && /need 3 or more things/.test(await txt(p, "#opt-C .rsn")), "C, nothing fits: only the shopping reason");
await p.context().close();
p = await page("s=excl&o=C");
ok(await p.locator("#opt-C .rg").count() === 2 && /left out for Priya and Jo/.test(await txt(p, "#opt-C .rsn")) && /Shopping cannot fix this/.test(await txt(p, "#opt-C .rsn")), "C, exclusions: the blocked reason apart from the missing one, and it says shopping cannot fix it");
ok(/blocked for Priya \(peanut butter\)/.test(await txt(p, "#opt-C .rg ul")) && await p.locator("#opt-C [data-act=eaters]").count() === 1, "C: each blocked recipe reads blocked for <person> (<ingredient>); Change who is eating is offered");
await p.context().close();

p = await page("s=fits&o=D");
const order = await p.evaluate(() => { const c = document.querySelector("#opt-D .compact"); const k = [...c.children].map(e => e.className.split(" ")[0] || e.tagName); return k; });
ok(order.indexOf("lead") < order.indexOf("lean") && order.indexOf("rows") < order.indexOf("lean"), "D: the chips sit below the answer " + order.join(","));
ok(await p.locator("#opt-D .lean button.zero").count() === 1 && /Something new/.test(await txt(p, "#opt-D .lean button.zero")), "D: a chip with no match is dim and dashed (Something new)");
ok(/Cucumber/.test(await txt(p, "#opt-D .lead b")), "D: default lead is the use-up salad");
await p.click('#opt-D [data-f="lens-Dcomfort"]'); ok(/Jalape/.test(await txt(p, "#opt-D .lead b")) && /leaning comfort/.test(await txt(p, "#opt-D .lead .k")), "D: Comfort re-ranks, the cornbread leads");
ok(await p.locator("#opt-D .rows .ir").count() === 2, "D: re-rank never hides a result (two rows still shown)");
await p.click('#opt-D [data-f="lens-Dcomfort"]'); ok(/Cucumber/.test(await txt(p, "#opt-D .lead b")), "D: tapping the chip again clears the lens");
await p.context().close();
p = await page("s=none&o=D");
ok(await p.locator("#opt-D .lean button.zero").count() === 4, "D alone, nothing fits: every chip is dashed (the dead end remains)");
await p.context().close();

for (const s of S) {
  p = await page("s=" + s + "&o=E", "kitchie", 1440, 900);
  const m = await p.evaluate(() => { const e = document.querySelector("#opt-E .main"); return [e.scrollHeight, e.clientHeight]; });
  ok(m[0] <= m[1], `E, ${s}: fits the 680px window without scrolling (${m[0]} <= ${m[1]})`);
  ok(await p.locator("#opt-E .seg").count() === 1, `E, ${s}: keeps the Dashboard / Compact toggle`);
  await p.context().close();
}
p = await page("s=none&o=E");
await p.click("#opt-E [data-act=tray][data-t=low]");
const mm = await p.evaluate(() => { const e = document.querySelector("#opt-E .main"); const t = document.querySelector("#opt-E .tray").getBoundingClientRect(), r = e.getBoundingClientRect(); return [e.scrollHeight <= e.clientHeight, t.top >= r.top, t.bottom <= r.bottom]; });
ok(mm[0] && mm[1] && mm[2], "E: the open tray is a popover inside the window and moves nothing");
ok(/Ask AI/.test(await txt(p, "#opt-E [data-act=askai]")), "E, nothing fits: Ask AI is the one hand-off");
await p.context().close();
p = await page("s=fits&o=E"); ok(await p.locator("#opt-E [data-act=askai]").count() === 0, "E, with fits: no Ask AI"); 
await p.click("#opt-E [data-act=why]"); ok(/blocked for Priya \(peanut butter\)/.test(await txt(p, "#opt-E .rsn")), "E: the '1 left out' chip opens who and what");
await p.context().close();

for (const s of S) { p = await page("s=" + s + "&o=F");
  ok(await p.locator("#opt-F .seg").count() === 0, `F, ${s}: no Dashboard / Compact toggle`);
  const h1 = await p.evaluate(() => document.querySelector("#opt-F .col").getBoundingClientRect().height);
  await p.click("#opt-F [data-act=dense]");
  const h2 = await p.evaluate(() => document.querySelector("#opt-F .col").getBoundingClientRect().height);
  ok(h2 < h1, `F, ${s}: Compact rows tightens Home (${Math.round(h1)} to ${Math.round(h2)}px)`);
  await p.context().close(); }

p = await page("s=none");
const all = await p.locator("#frames").innerText();
ok(!/Surprise me/i.test(all), "Surprise me is not drawn on Home (it never hands off to an AI; it is the Plan's in-app engine)");
ok((await p.locator("#frames [data-act=askai]").count()) === 1, "Ask AI appears once in the whole page (E, nothing fits)");
await p.context().close();
const css = readFileSync(new URL("../fragments/compact-home-options/compact.css", import.meta.url), "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "compact.css has no hex colour (tokens only)");
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nall passed"); process.exit(fails ? 1 : 0);
