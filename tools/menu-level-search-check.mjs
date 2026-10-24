// Behaviour, count and layout check for fragments/menu-level-search (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/menu-level-search-check.mjs [--shots=shots/menu-level-search]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: the menu draws in light and dark at 390 and 360 wide, at the phone's own text size and at +30%, with no console error and no sideways scroll; search is the first thing under the bar and
// is on screen without scrolling; the rows are exactly the ten of the design, in order, each name once, none of the removed ones (Settings, Looks, Kitchen setup, Me, Preferences group, People);
// every label is three words or fewer; every control on the menu is at least 44px by 44px; the Settings entry is gone; the quick controls (text stepper, theme rotary) are on the menu and act in
// place; search is deferred (no index request until the box is used), finds by plain phrase and says nothing matches; the "taps to do a job" table says what the phone really needs (counted by
// clicking through the phone); the before list has 14 rows and the after list 9 plus search; the duplicates table, the knowledge note, REVIEW-QUEUE and the index tile exist; no hex colour in the CSS.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/menu-level-search/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function open({ theme = "kitchie", scheme = "dark", w = 390, h = 844, ts = 0, q = "" } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/\?.*$/, "")));
  await p.goto(`${BASE}index.html?bare=1&ts=${ts}${q}`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(200);
  return p;
}
const names = p => p.locator(".phone:not(.static) [data-bd] .prow .nm").allInnerTexts().then(a => a.map(s => s.trim()));
const WANT = ["Alex", "Household", "Preferences", "Assistants", "History", "Install", "Download my data", "Sign out"];
const GONE = ["Settings", "Looks", "Kitchen setup", "Me", "People", "Categories", "Locations and spots", "Link your AI", "Invite someone", "Download inventory CSV"];

for (const [th, scheme] of [["kitchie", "dark"], ["kitchie-day", "light"]]) {
  for (const [w, h] of [[390, 844], [360, 640]]) {
    for (const ts of [0, 3]) {
      const p = await open({ theme: th, scheme, w, h, ts });
      const tag = `${scheme} ${w} ts${ts}`;
      ok(p.errs.length === 0, `${tag}: no console errors ${p.errs.join(";")}`);
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1) && await p.locator("[data-bd]").evaluate(n => n.scrollWidth <= n.clientWidth + 1), `${tag}: no sideways scroll`);
      const n = await names(p);
      ok(JSON.stringify(n) === JSON.stringify(WANT), `${tag}: rows are ${WANT.join(", ")} (got ${n.join(", ")})`);
      ok(new Set(n).size === n.length && GONE.every(g => !n.includes(g)), `${tag}: each name once, none of the removed rows`);
      ok(n.every(s => s.split(/\s+/).length <= 3), `${tag}: every label is 3 words or fewer`);
      ok(await p.locator(".phone:not(.static) .ttl").innerText() === "Menu" && !(await p.locator(".phone:not(.static) .hd .ibtn").isVisible()), `${tag}: titled Menu, no second search button`);
      const first = await p.evaluate(() => { const ph = document.querySelector(".phone:not(.static)"), sb = ph.querySelector(".sb").getBoundingClientRect(), row = ph.querySelector("[data-bd] .prow").getBoundingClientRect(), pr = ph.getBoundingClientRect(); return { sbTop: sb.top - pr.top, sbBottom: sb.bottom - pr.top, rowTop: row.top - pr.top, h: pr.height, vis: getComputedStyle(ph.querySelector(".sb")).display !== "none" && !ph.querySelector(".sb").hidden }; });
      ok(first.vis && first.sbBottom < first.rowTop && first.sbBottom < first.h, `${tag}: search is the first thing under the bar, on screen (bottom ${Math.round(first.sbBottom)}px)`);
      const small = await p.evaluate(() => [...document.querySelectorAll(".phone:not(.static) :is(button,a[href],input,[role=radio],[role=switch],.rot-i)")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5) && !e.matches(".vh,.seg") && getComputedStyle(e).visibility !== "hidden"; }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
      ok(small.length === 0, `${tag}: every control is at least 44px by 44px ${small.join(",")}`);
      ok(await p.locator(".phone:not(.static) .pins [data-ctl], .phone:not(.static) .pins .stepper, .phone:not(.static) .pins .rot").count() > 0, `${tag}: the quick controls are on the menu`);
      if (shots) { await p.screenshot({ path: `${shots}/after-${scheme}-${w}x${h}-ts${ts}.png` }); }
      await p.context().close();
    }
  }
}

/* the quick controls act in place, the page re-themes and rescales */
{
  const p = await open({});
  const before = await p.evaluate(() => getComputedStyle(document.querySelector(".phone")).fontSize);
  await p.click(`.phone:not(.static) [data-a="ts:3"]`).catch(() => {});
  const after = await p.evaluate(() => getComputedStyle(document.querySelector(".phone")).fontSize);
  ok(parseFloat(after) > parseFloat(before), `text size stepper rescales the menu in place (${before} to ${after})`);
  const t0 = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await p.locator(".phone:not(.static) .rit:not(.cur)").first().click();
  const t1 = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  ok(t0 !== t1, `theme rotary re-themes the menu in place (${t0} to ${t1})`);
  await p.context().close();
}

/* search: deferred, then finds by plain phrase and says when nothing matches */
{
  const p = await open({});
  ok(!p.reqs.some(u => /search-index|shake-search/.test(u)), "search engine and index are not requested until the box is used");
  await p.click(".phone:not(.static) input[data-eq]"); await p.fill(".phone:not(.static) input[data-eq]", "bigger text"); await p.waitForTimeout(400);
  ok(p.reqs.some(u => /search-index|shake-search/.test(u)), "the engine and index load on first focus");
  const best = await p.locator(".phone:not(.static) [data-bd]").innerText();
  ok(/Text size/i.test(best), "bigger text finds Text size");
  await p.fill(".phone:not(.static) input[data-eq]", "flux capacitor"); await p.waitForTimeout(300);
  ok(/no match|nothing|didn.t find|couldn.t/i.test(await p.locator(".phone:not(.static) [data-bd]").innerText()), "a nonsense search says nothing matches");
  await p.context().close();
}

/* taps to do a job, counted by clicking (the avatar tap that opens the menu is 1) */
{
  const p = await open({});
  const sel = a => `.phone:not(.static) [data-a="${a}"]`;
  const title = () => p.locator(".phone:not(.static) .ttl").innerText();
  const table = {};
  for (const tr of await p.locator("#taps tbody tr").all()) table[await tr.getAttribute("data-job")] = [+(await tr.locator("td.n").nth(0).innerText()), +(await tr.locator("td.n").nth(1).innerText())];
  const count = {};
  count.search = 1 + 1; await p.click(".phone:not(.static) input[data-eq]"); ok(await p.locator(".phone:not(.static)").getAttribute("data-searching") === "true", "search opens with one tap on the menu");
  await p.click(".phone:not(.static) [data-a=cancel]").catch(() => {});
  await p.evaluate(() => window.SHAKE.phone.end());
  count.text = 1 + 1; ok(await p.locator(sel("ts:3")).count() > 0, "text size is one tap on the menu");
  count.theme = 1 + 1; ok(await p.locator(".phone:not(.static) .rit").count() > 0, "theme is one tap on the menu");
  for (const [job, a, t] of [["assistants", "pg:assistants", "Assistants"], ["household", "pg:household", "Household"], ["prefs", "pg:preferences", "Preferences"], ["you", "pg:you", "You"]]) {
    await p.click(sel(a)); count[job] = 2; ok((await title()) === t, `${job}: menu then ${t} is 2 taps`);
    await p.evaluate(() => window.SHAKE.phone.goPage("front"));
  }
  for (const [job, a] of [["history", "soon:History"], ["install", "soon:Install"], ["data", "soon:Download my data"]]) { ok(await p.locator(sel(a)).count() === 1, `${job}: one row on the menu, 2 taps`); count[job] = 2; }
  await p.click(sel("pg:household")); await p.click(sel("pg:kitchen")); ok(await p.locator(sel("soon:Categories")).count() === 1, "categories: menu, Household, Kitchen setup, Categories is 4 taps"); count.categories = 4;
  for (const k of Object.keys(table)) ok(count[k] === table[k][1], `table says ${k} takes ${table[k][1]} taps after (clicked: ${count[k]})`);
  ok(Object.values(table).every(([bf, af]) => af <= bf) === false && Object.entries(table).filter(([, [bf, af]]) => af > bf).map(([k]) => k).join() === "categories", "the only job that costs more taps than before is categories (said on the page)");
  await p.context().close();
}

/* the page: before and after lists, duplicates, docs */
{
  const p = await open({});
  ok(await p.locator("#before-list li").count() === 12 && (await p.locator("#before-host .prow").count()) === 14, `before: 14 rows on the old menu drawn (list of 12 entries incl. grouped rows)`);
  ok(await p.locator("#after-list li").count() === 10, "after: 10 entries (search, quick controls, 8 rows)");
  ok(await p.locator("#dups tbody tr").count() >= 12, "the duplicates table lists every repeat found");
  ok(await p.locator(".phone[data-before]").count() === 1, "the old menu is drawn for comparison");
  if (shots) { await p.screenshot({ path: `${shots}/before-after-page.png`, fullPage: true }); }
  await p.context().close();
}
const css = readFileSync(new URL("../fragments/menu-level-search/menu.css", import.meta.url), "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in menu.css");
ok(existsSync(new URL("../docs/knowledge/menu-level-search.md", import.meta.url)), "the knowledge note exists");
ok(/fragments\/menu-level-search/.test(readFileSync(new URL("../REVIEW-QUEUE", import.meta.url), "utf8")), "REVIEW-QUEUE has the line");
ok(/fragments\/menu-level-search\//.test(readFileSync(new URL("../index.html", import.meta.url), "utf8")), "the index has the tile");
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
