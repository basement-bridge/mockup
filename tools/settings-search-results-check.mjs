// Behaviour and layout check for fragments/settings-search-results (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/settings-search-results-check.mjs [--shots=shots/settings-search-results]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: four options draw with no console error and no sideways scroll at 390x844 and 360x640, light and dark; the search index loads only when search is used; 51 entries and no Emoji entry;
// six or more results on screen at 390x844 for "household" in every option; every result row is 44px or taller; none of the old shouty labels (AFFECTS, LIVES IN, Exact match) and no word "Pin";
// matched words are highlighted; typo, empty, no-match states; pinned rows show an icon only; page-scoped ranking (On this page first, Everywhere else, from Looks, Household and the Settings front);
// tapping a result opens its page and flashes the row, Back returns to the results; text size +30% keeps the list readable with no sideways scroll; no hex colour in the CSS.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/settings-search-results/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function open(qs = "", w = 390, h = 844, scheme = "dark") {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), scheme === "dark" ? "kitchie" : "kitchie-day");
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url()));
  await p.goto(BASE + qs); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(350); return p;
}
const ph = p => p.locator(".phone:visible").first();
const rowsInView = p => ph(p).locator("[data-bd]").evaluate(bd => { const r = bd.getBoundingClientRect(); return [...bd.querySelectorAll(".row")].filter(x => { const q = x.getBoundingClientRect(); return q.top >= r.top - 1 && q.bottom <= r.bottom + 1; }).length; });
const text = p => ph(p).locator("[data-bd]").innerText();

{ // load behaviour
  const p = await open("?o=B");
  ok(!p.reqs.some(u => /search-index\.js/.test(u)), "default path does not fetch the search index");
  ok(p.errs.length === 0, "no console errors on load " + p.errs.join(";"));
  await ph(p).locator("[data-eq]").focus(); await p.waitForTimeout(400);
  ok(p.reqs.some(u => /search-index\.js/.test(u)), "focusing the search box loads the index");
  ok(await p.evaluate(() => SSR_SEARCH.size()) === 51, "51 entries (52 minus Emoji)");
  ok(await p.evaluate(() => !SSR_SEARCH.run("emoji", "front").rest.includes("emoji") && !SSR_SEARCH.run("emoji", "front").on.includes("emoji")), "no Emoji setting in the index");
  await p.context().close();
}
for (const [scheme] of [["dark"], ["light"]]) for (const [w, h] of [[390, 844], [360, 640]]) for (const o of ["A", "B", "C", "D"]) {
  const p = await open(`?o=${o}&q=household`, w, h, scheme);
  const t = await text(p);
  ok(p.errs.length === 0, `${o} ${scheme} ${w}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${o} ${scheme} ${w}: no sideways page scroll`);
  ok(await ph(p).locator("[data-bd]").evaluate(n => n.scrollWidth <= n.clientWidth + 1), `${o} ${scheme} ${w}: no sideways scroll in the results`);
  ok(!/AFFECTS|LIVES IN|Exact match/i.test(t.replace(/Affects every/i, "")), `${o} ${scheme} ${w}: none of the old shouty labels`);
  if (w === 390) ok(await rowsInView(p) >= (o === "C" ? 5 : 6), `${o} ${scheme}: six or more results in view at 390x844 (C: best card plus five)`);
  if (shots) await ph(p).screenshot({ path: `${shots}/${o}-household-${scheme}-${w}x${h}.png` });
  await p.context().close();
}
for (const o of ["A", "B", "C", "D"]) {
  const p = await open(`?o=${o}&q=household`);
  const hs = await ph(p).locator(".row .main").evaluateAll(a => a.map(n => n.getBoundingClientRect().height));
  ok(hs.length >= 6 && hs.every(x => x >= 44), `${o}: every result row is 44px or taller (${hs.map(Math.round).join(",")})`);
  ok(await ph(p).locator("[data-bd] mark").count() > 0, `${o}: matched words are highlighted`);
  await p.context().close();
}
for (const o of ["A", "B", "C", "D"]) { // states
  let p = await open(`?o=${o}&q=drak%20mode`);
  ok(await p.locator(".phone:visible [data-fixed]").count() === 1 && /dark mode/.test(await text(p)), `${o}: typo shows "Showing results for dark mode"`);
  if (shots) await ph(p).screenshot({ path: `${shots}/${o}-typo.png` });
  await p.context().close();
  p = await open(`?o=${o}&q=flux%20capacitor`);
  ok(await p.locator(".phone:visible [data-empty]").count() === 1 && /Nothing matches/.test(await text(p)) && await ph(p).locator("[data-empty] .chip").count() >= 6, `${o}: no match says so and offers suggestions and areas`);
  if (shots) await ph(p).screenshot({ path: `${shots}/${o}-none.png` });
  await p.context().close();
  p = await open(`?o=${o}&p=looks`);
  await ph(p).locator("[data-a=opensearch]").click(); await p.waitForTimeout(300);
  ok(/Recent/.test(await text(p)) && await ph(p).locator(".chip").count() >= 3, `${o}: empty box from Looks has recents and page-specific suggestions`);
  if (shots) await ph(p).screenshot({ path: `${shots}/${o}-empty.png` });
  await p.context().close();
  p = await open(`?o=${o}&q=theme&p=looks`);
  ok(await ph(p).locator(".pinm").count() >= 1 && !/\bpin(ned)?\b/i.test(await text(p)), `${o}: pinned rows show an icon and the word Pin appears nowhere`);
  await p.context().close();
}
{ // page-scoped ranking
  const p = await open("?o=B");
  await p.locator(".phone:visible [data-eq]").focus(); await p.waitForTimeout(400);
  const run = (q, c) => p.evaluate(([q, c]) => SSR_SEARCH.run(q, c), [q, c]);
  const th = await run("theme", "looks"), th2 = await run("theme", "household"), th3 = await run("theme", "front");
  ok(th.on[0] === "theme", "theme from Looks: Theme is the first On this page result");
  ok(th2.on.length === 0 && th2.rest[0] === "theme", "theme from Household: nothing on this page, Theme still found everywhere else");
  ok(th3.on.length === 0, "from the Settings front there is no On this page group");
  const sc = await run("someone changed", "household"), sc2 = await run("someone changed", "looks");
  ok(sc.on.includes("bell") && !sc2.on.includes("bell") && sc2.rest.includes("bell"), "someone changed: the bell is On this page from Household and Everywhere else from Looks");
  const inv = await run("invite", "household"); ok(inv.on[0] === "invite", "invite from Household: Invite someone first");
  await p.context().close();
}
for (const o of ["A", "B", "C", "D"]) { // sections shown, jump and back
  const p = await open(`?o=${o}&p=looks&q=theme`);
  const t = await text(p);
  ok(/On this page/.test(t) && /Looks/.test(t), `${o}: Looks search shows an "On this page Looks" section`);
  await p.close(); const q = await open(`?o=${o}&p=household&q=text%20size`);
  ok(/Everywhere else/.test(await text(q)) && !/On this page/.test(await text(q)) && /Nothing on Household/.test(await text(q)), `${o}: from Household, text size is Everywhere else and says nothing on this page matches`);
  if (o === "A") await ph(q).locator(".row .main").first().click();
  await ph(q).locator(o === "A" ? ".row [data-a^=go]" : ".row .main").first().click(); await q.waitForTimeout(300);
  ok(await ph(q).getAttribute("data-page") === "looks" && await ph(q).locator(".flash").count() === 1, `${o}: tapping the result opens Looks and flashes the row`);
  if (shots) await ph(q).screenshot({ path: `${shots}/${o}-jumped.png` });
  await ph(q).locator("[data-a=back]").click(); await q.waitForTimeout(250);
  ok(await ph(q).getAttribute("data-page") === "household" && await ph(q).locator("[data-eq]").inputValue() === "text size" && await ph(q).locator(".row").count() >= 1, `${o}: Back returns to Household with the same results`);
  await q.context().close();
}
{ // text size +30%
  for (const o of ["A", "B", "C", "D"]) {
    const p = await open(`?o=${o}&q=household&ts=1.3`);
    ok(await ph(p).locator("[data-bd]").evaluate(n => n.scrollWidth <= n.clientWidth + 1) && await ph(p).locator(".row").count() >= 6, `${o}: +30% text, no sideways scroll, rows kept`);
    const f = await ph(p).locator(".row .nm").first().evaluate(n => parseFloat(getComputedStyle(n).fontSize)); ok(f >= 20, `${o}: +30% really scales the name (${f.toFixed(1)}px)`);
    if (shots) await ph(p).screenshot({ path: `${shots}/${o}-plus30.png` });
    await p.context().close();
  }
}
{ // inline control in B, expand in A
  let p = await open("?o=B&q=bell");
  const before = await ph(p).locator(".sw input").first().isChecked(); await ph(p).locator(".sw").first().click(); await p.waitForTimeout(200);
  ok(await ph(p).locator(".sw input").first().isChecked() !== before, "B: the switch in the result changes the setting in place");
  await p.context().close();
  p = await open("?o=A&q=bigger%20text"); await ph(p).locator(".row .main").first().click();
  ok(/Every screen at once/.test(await text(p)) && await ph(p).locator(".seg").count() === 1, "A: tapping a row opens its sentence and control in place");
  await p.context().close();
}
{ const css = readFileSync(new URL("../fragments/settings-search-results/ssr.css", import.meta.url), "utf8"); ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in ssr.css"); }
await b.close();
console.log(fails ? `${fails} FAILED` : "ALL PASSED"); process.exit(fails ? 1 : 0);
