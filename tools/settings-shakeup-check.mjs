// Behaviour, count and layout check for fragments/settings-shakeup (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/settings-shakeup-check.mjs [--shots=shots/settings-shakeup]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: the three phones (A just the list, B search is the front door, C control strip) draw in light and dark at 390 and 360 wide with no console error and no sideways scroll, at every
// text step to +30%; the front's element counts (controls, text items) are the numbers the page prints, counted by one rule; the audit table has 53 rows (17 earn, 22 cut, 14 merge) and the
// summary says so; every control on a front is at least 44px by 44px; theme tiles are ten distinct looks with names and change the page theme; Light or dark switches; the text stepper has
// seven steps, is disabled at both ends and scales the phone (0.76 to 1.3); search is deferred (the index is not requested until a search box is used), finds by name, plain phrase and typo,
// says nothing matches, ranks the current page first ("On this page" then "Everywhere else"), changes a setting right in the result (stepper, switch), opens a sub page from a result and
// Back returns to the results; the tap counts of the five common jobs on the page are what the phones really need; Household has the one-press invite link; no hex colour in the CSS;
// the knowledge note, REVIEW-QUEUE and index tile exist.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/settings-shakeup/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function open(o, { theme = "kitchie", scheme = "dark", w = 390, h = 844, ts = 0, q = "" } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*settings-shakeup\//, "").replace(/^.*fragments\//, "").replace(/\?.*$/, "")));
  await p.goto(`${BASE}?o=${o}&bare=1${q}`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(200);
  p.ph = `.phone[data-opt=${o}]`; p.o = o;
  for (let i = 0; i < ts; i++) await p.click(`${p.ph} [data-a="ts:1"]`);
  return p;
}
const theme = p => p.evaluate(() => document.documentElement.getAttribute("data-theme"));
const openSearch = async p => { if (await p.locator(`${p.ph} input[data-eq]`).isVisible()) await p.click(`${p.ph} input[data-eq]`); else await p.click(`${p.ph} [data-a=opensearch]`); };
const ask = async (p, t) => { await openSearch(p); await p.fill(`${p.ph} input[data-eq]`, t); await p.waitForTimeout(150); };
const cancel = async p => { await p.click(`${p.ph} [data-a=cancel]`); };
const rows = p => p.locator(`${p.ph} .res .prow`);
const names = async p => (await p.locator(`${p.ph} .res .prow .nm`).allInnerTexts()).map(s => s.trim());
const scale = p => p.locator(p.ph).evaluate(n => parseFloat(getComputedStyle(n).getPropertyValue("--ts")));
// the one counting rule: visible controls and text-bearing elements on the first screen, no scrolling
const COUNT = ph => {
  const el0 = document.querySelector(ph), R = el0.getBoundingClientRect();
  const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return false; return r.bottom > R.top && r.top < R.bottom; };
  const ctl = [...el0.querySelectorAll("button,a[href],input,select,textarea,[role=button],[role=radio],[role=switch]")].filter(e => { if (e.type === "radio" || e.type === "checkbox") { const l = e.closest("label"); return l ? vis(l) : vis(e); } return vis(e); });
  const uniq = ctl.filter(e => !(e.tagName === "INPUT" && ctl.includes(e.closest("label"))));
  const texts = [...el0.querySelectorAll("*")].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length));
  const small = uniq.filter(e => { const r = (e.tagName === "INPUT" && e.closest("label") ? e.closest("label") : e).getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map(e => (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 20));
  return { controls: uniq.length, texts: texts.length, small };
};

/* the page: counts, no errors, no sideways scroll, every direction, light and dark, 390 and 360, text steps */
const html = readFileSync(new URL("../fragments/settings-shakeup/index.html", import.meta.url), "utf8");
const audit = [...html.matchAll(/<span class="v (keep|cut|merge)">/g)].map(m => m[1]);
ok(audit.length === 53 && audit.filter(v => v === "keep").length === 17 && audit.filter(v => v === "cut").length === 22 && audit.filter(v => v === "merge").length === 14, `audit table: ${audit.length} rows, ${audit.filter(v => v === "keep").length} earn, ${audit.filter(v => v === "cut").length} cut, ${audit.filter(v => v === "merge").length} merge (page says 53, 17, 22, 14)`);
const EXPECT = { A: [12, 17], B: [11, 13], C: [10, 13] };
for (const [th, scheme] of [["kitchie", "dark"], ["kitchie-day", "light"]]) {
  for (const o of ["A", "B", "C"]) {
    for (const [w, h] of [[390, 844], [360, 640]]) {
      const p = await open(o, { theme: th, scheme, w, h });
      ok(p.errs.length === 0, `${o} ${th} ${w}: no console errors ${p.errs.join(";")}`);
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1) && await p.locator(`${p.ph} .bd`).evaluate(n => n.scrollWidth <= n.clientWidth + 1), `${o} ${th} ${w}: no sideways scroll`);
      if (w === 390) {
        const c = await p.evaluate(COUNT, p.ph);
        ok(c.controls === EXPECT[o][0] && c.texts === EXPECT[o][1], `${o} ${th}: front has ${c.controls} controls and ${c.texts} text items (page says ${EXPECT[o][0]} and ${EXPECT[o][1]})`);
        ok(c.small.length === 0, `${o} ${th}: every control on the front is at least 44px by 44px ${c.small.join(",")}`);
      }
      if (shots) {
        await p.screenshot({ path: `${shots}/${o}-${scheme}-${w}x${h}-front.png` });
        await p.close();
        for (const [name, steps] of [["ts30", 3]]) {
          const p2 = await open(o, { theme: th, scheme, w, h, ts: steps });
          ok(p2.errs.length === 0 && await p2.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1) && await p2.locator(`${p2.ph} .bd`).evaluate(n => n.scrollWidth <= n.clientWidth + 1), `${o} ${th} ${w}: +30% text, no error, no sideways scroll`);
          await p2.screenshot({ path: `${shots}/${o}-${scheme}-${w}x${h}-front-${name}.png` });
          await p2.click(`${p2.ph} [data-a=panel]`, { timeout: 3000 }).catch(() => {});
          await p2.screenshot({ path: `${shots}/${o}-${scheme}-${w}x${h}-theme-${name}.png` });
          await p2.context().close();
        }
      } else await p.context().close();
    }
  }
}
/* text steps: seven, disabled at both ends, scale the phone */
for (const o of ["A", "B", "C"]) {
  const p = await open(o);
  const want = [0.76, 0.84, 0.92, 1, 1.1, 1.2, 1.3], got = [];
  for (let i = 0; i < 3; i++) await p.click(`${p.ph} [data-a="ts:-1"]`);
  got.push(await scale(p));
  ok(await p.locator(`${p.ph} [data-a="ts:-1"]`).first().getAttribute("aria-disabled") === "true", `${o}: smaller is disabled at -24%`);
  for (let i = 0; i < 6; i++) { await p.click(`${p.ph} [data-a="ts:1"]`); got.push(await scale(p)); }
  ok(JSON.stringify(got.map(x => Math.round(x * 100) / 100)) === JSON.stringify([0.76, 0.84, 0.92, 1, 1.1, 1.2, 1.3]), `${o}: seven steps scale the phone ${got.map(x => x.toFixed(2)).join(" ")}`);
  ok(await p.locator(`${p.ph} [data-a="ts:1"]`).first().getAttribute("aria-disabled") === "true", `${o}: larger is disabled at +30%`);
  await p.context().close();
}
/* theme tiles and Light or dark */
{
  const tp = { A: async p => { await p.click(`${p.ph} [data-a=panel]`); }, B: async p => { await p.click(`${p.ph} [data-a=panel]`); }, C: async p => { await p.click(`${p.ph} [data-a=panel]`); } };
  for (const o of ["A", "B", "C"]) {
    const p = await open(o); await tp[o](p);
    ok(await p.locator(`${p.ph} .tpanel .tp`).count() === 10, `${o}: ten theme tiles in the panel`);
    const looks = await p.locator(`${p.ph} .tpanel .tprev`).evaluateAll(ns => ns.map(n => [n.style.getPropertyValue("--pbg"), n.style.getPropertyValue("--pac")].join("/")));
    ok(new Set(looks).size === 10, `${o}: ten distinct looks (background and accent)`);
    const nm = await p.locator(`${p.ph} .tpanel .tname`).allInnerTexts();
    ok(nm.length === 10 && nm.every(s => s.trim().length > 2), `${o}: every tile has a name (${nm.slice(0, 3).join(", ")}...)`);
    await p.click(`${p.ph} .tpanel .tp[aria-label=Marmalade]`); await p.waitForTimeout(300);
    ok(await theme(p) === "marmalade", `${o}: a tile changes the theme`);
    await p.context().close();
  }
  for (const o of ["A", "B"]) { const p = await open(o); await p.click(`${p.ph} .mseg [data-a="mode:light"]`); await p.waitForTimeout(250); ok(await theme(p) === "kitchie-day", `${o}: sun switches to light`); await p.click(`${p.ph} .mseg [data-a="mode:dark"]`); await p.waitForTimeout(250); ok(await theme(p) === "kitchie", `${o}: moon switches to dark`); await p.context().close(); }
  { const p = await open("C"); await p.click(`${p.ph} .strip [data-a^="mode:"]`); await p.waitForTimeout(250); ok(await theme(p) === "kitchie-day", "C: the icon cycles System to Light"); await p.click(`${p.ph} .strip [data-a^="mode:"]`); await p.waitForTimeout(250); ok(await theme(p) === "kitchie", "C: then Dark"); await p.context().close(); }
}
/* the strip stays on every Settings page (C only); the others do not carry it */
{
  const p = await open("C"); await p.click(`${p.ph} [data-a="pg:household"]`);
  ok(await p.locator(`${p.ph} .strip`).isVisible() && await p.locator(`${p.ph} .strip [data-a="ts:1"]`).isVisible(), "C: the strip is still there on Household");
  await p.click(`${p.ph} [data-a=opensearch]`); ok(await p.locator(`${p.ph} .strip`).isVisible(), "C: and while searching"); await p.context().close();
  const pa = await open("A"); await pa.click(`${pa.ph} [data-a="pg:household"]`); ok(!(await pa.locator(`${pa.ph} .strip`).isVisible()), "A: no strip on Household"); await pa.context().close();
}
/* search: deferred, finds, ranks, changes in place, opens a page, Back returns */
for (const o of ["A", "B", "C"]) {
  const p = await open(o);
  ok(!p.reqs.some(r => /search-index|shake-search/.test(r)), `${o}: neither the engine nor the index is requested on load (${p.reqs.filter(r => /shake|search|settings-redesign/.test(r)).join(",")})`);
  await openSearch(p); await p.waitForTimeout(250);
  ok(p.reqs.some(r => /search-index/.test(r)) && p.reqs.some(r => /shake-search/.test(r)), `${o}: both load when the search box is first used`);
  ok(await p.locator(`${p.ph} .qchip`).count() >= 3 && await p.locator(`${p.ph} .qchip`).count() <= 4, `${o}: empty box shows three or four example chips, not eight`);
  await p.fill(`${p.ph} input[data-eq]`, "bigger text"); await p.waitForTimeout(150);
  ok((await names(p))[0] === "Text size", `${o}: "bigger text" finds Text size first`);
  const before = await scale(p); await p.click(`${p.ph} .res [data-a="ts:1"]`); ok(await scale(p) > before, `${o}: the stepper in the result makes the text bigger`);
  await p.fill(`${p.ph} input[data-eq]`, "turn off the bell"); await p.waitForTimeout(150);
  ok((await names(p))[0] === "Household activity bell", `${o}: "turn off the bell" finds the bell`);
  const sw = p.locator(`${p.ph} .res input[role=switch]`).first(); const was = await sw.isChecked(); await sw.evaluate(n => n.click()); await p.waitForTimeout(100);
  ok(await p.locator(`${p.ph} .res input[role=switch]`).first().isChecked() === !was, `${o}: the switch in the result flips the bell`);
  await p.fill(`${p.ph} input[data-eq]`, "drak mode"); await p.waitForTimeout(150);
  ok(await p.locator(`${p.ph} [data-fixed]`).count() === 1 && (await names(p))[0] === "Light or dark", `${o}: the typo "drak mode" finds Light or dark and says so`);
  await p.fill(`${p.ph} input[data-eq]`, "flux capacitor"); await p.waitForTimeout(150);
  ok(await p.locator(`${p.ph} [data-empty]`).count() === 1, `${o}: no match says so and offers words`);
  await p.fill(`${p.ph} input[data-eq]`, "theme"); await p.waitForTimeout(150);
  ok(await p.locator(`${p.ph} .res .tscroll .tp`).count() === 10 && (await names(p))[0] === "Theme", `${o}: "theme" gives one Theme result with the ten tiles, not eleven results`);
  await p.fill(`${p.ph} input[data-eq]`, "invite"); await p.waitForTimeout(150);
  ok((await names(p))[0] === "Invite someone", `${o}: "invite" finds Invite someone`);
  await p.click(`${p.ph} .res .prow:has-text("Invite someone") [data-a^="go:"]`); await p.waitForTimeout(250);
  ok(await p.locator(`${p.ph}[data-page=household]`).count() === 1 && await p.locator(`${p.ph} .invite.flash`).count() === 1, `${o}: the result opens Household and flashes the invite`);
  await p.click(`${p.ph} [data-a=back]`); await p.waitForTimeout(150);
  ok(await p.locator(`${p.ph}[data-searching=true]`).count() === 1 && (await p.locator(`${p.ph} input[data-eq]`).inputValue()) === "invite", `${o}: Back returns to the results`);
  await p.context().close();
}
/* page-scoped ranking: from Household, "invite" is on this page; from the front, theme is on this page in A and B, and everywhere in C */
for (const o of ["A", "B", "C"]) {
  const p = await open(o); await p.click(`${p.ph} [data-a="pg:household"]`); await ask(p, "invite");
  ok(await p.locator(`${p.ph} .sh[data-section=on]`).count() === 1 && /On this page/.test(await p.locator(`${p.ph} .sh[data-section=on]`).innerText()), `${o}: from Household "invite" is listed under On this page`);
  await cancel(p); await p.click(`${p.ph} [data-a=back]`); await ask(p, "invite");
  ok(await p.locator(`${p.ph} .sh[data-section=on]`).count() === 0, `${o}: from the front the same word has no On this page heading (nothing there matches)`);
  await cancel(p); await ask(p, "text size");
  ok(await p.locator(`${p.ph} .sh[data-section=on]`).count() === 1, `${o}: from the front "text size" is On this page (its control is on the front)`);
  await p.context().close();
}
{
  const p = await open("C"); await p.click(`${p.ph} [data-a="pg:household"]`); await ask(p, "text size");
  ok(/On this page/.test(await p.locator(`${p.ph} .sh[data-section=on]`).innerText()), "C: on Household, Text size is still On this page (the strip is on screen)");
  await p.context().close();
  const pb = await open("B"); await pb.click(`${pb.ph} [data-a="pg:household"]`); await ask(pb, "categories");
  ok((await names(pb))[0] === "Categories" && await pb.locator(`${pb.ph} .sh[data-section=on]`).count() === 1, "B: Categories lives on Household (Kitchen setup is folded in)");
  await pb.context().close();
}
/* Household: the one-press invite link */
for (const o of ["A", "B", "C"]) {
  const p = await open(o); await p.click(`${p.ph} [data-a="pg:household"]`);
  ok(await p.locator(`${p.ph} [data-invite]`).count() === 0, `${o}: no link until asked`);
  await p.click(`${p.ph} [data-a=invite]`); await p.waitForTimeout(120);
  ok(/kitchie\.app\/join\//.test(await p.locator(`${p.ph} [data-invite]`).innerText()), `${o}: one press makes the link and shows it`);
  ok(await p.locator(`${p.ph} .prow .rb`).count() >= (o === "B" ? 3 : 1), `${o}: Household has its plain rows`);
  await p.context().close();
}
/* the tap counts printed on the page: run each job and count actions (a tap or typing is one) */
{
  const jobs = {
    theme: { A: 2, B: 2, C: 2 }, text: { A: 1, B: 1, C: 1 }, dark: { A: 1, B: 1, C: 2 }, invite: { A: 2, B: 2, C: 2 }, bell: { A: 3, B: 3, C: 3 }
  };
  for (const o of ["A", "B", "C"]) {
    let n, p;
    p = await open(o); n = 0; await p.click(`${p.ph} [data-a=panel]`); n++; await p.click(`${p.ph} .tpanel .tp[aria-label=Marmalade]`); n++; await p.waitForTimeout(300);
    ok(await theme(p) === "marmalade" && n === jobs.theme[o], `${o}: change the theme in ${n} taps (page says ${jobs.theme[o]})`); await p.context().close();
    p = await open(o); n = 0; await p.click(`${p.ph} [data-a="ts:1"]`); n++; ok(await scale(p) === 1.1 && n === jobs.text[o], `${o}: text one step bigger in ${n} tap (page says ${jobs.text[o]})`); await p.context().close();
    p = await open(o, { theme: "kitchie-day", scheme: "light" }); n = 0;
    if (o === "C") { await p.click(`${p.ph} .strip [data-a^="mode:"]`); n++; await p.click(`${p.ph} .strip [data-a^="mode:"]`); n++; } else { await p.click(`${p.ph} .mseg [data-a="mode:dark"]`); n++; }
    await p.waitForTimeout(250); ok(await theme(p) === "kitchie" && n === jobs.dark[o], `${o}: dark in ${n} taps (page says ${jobs.dark[o]})`); await p.context().close();
    p = await open(o); n = 0; await p.click(`${p.ph} [data-a="pg:household"]`); n++; await p.click(`${p.ph} [data-a=invite]`); n++;
    ok(await p.locator(`${p.ph} [data-invite]`).count() === 1 && n === jobs.invite[o], `${o}: invite link in ${n} taps (page says ${jobs.invite[o]})`); await p.context().close();
    p = await open(o); n = 0; await openSearch(p); n++; await p.fill(`${p.ph} input[data-eq]`, "bell"); n++; await p.locator(`${p.ph} .res input[role=switch]`).first().evaluate(x => x.click()); n++;
    ok(n === jobs.bell[o] && await p.locator(`${p.ph} .res input[role=switch]`).first().isChecked() === false, `${o}: bell off in ${n} actions (page says ${jobs.bell[o]})`); await p.context().close();
  }
}
/* the shared page rules */
const css = readFileSync(new URL("../fragments/settings-shakeup/shake.css", import.meta.url), "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in shake.css (tokens only)");
const note = readFileSync(new URL("../docs/knowledge/jobs-to-be-done/settings-redesign.md", import.meta.url), "utf8");
ok(/SR-Q36/.test(note) && /Element audit of the current UAT build/.test(note) && /settings-shakeup/.test(note), "knowledge note has the shake-up section, the audit and SR-Q36");
ok(/fragments\/settings-shakeup /.test(readFileSync(new URL("../REVIEW-QUEUE", import.meta.url), "utf8")), "REVIEW-QUEUE has the shake-up line");
ok(/fragments\/settings-shakeup\//.test(readFileSync(new URL("../index.html", import.meta.url), "utf8")), "index tile exists");
ok(existsSync(new URL("../fragments/settings-shakeup/shake-search.js", import.meta.url)), "search engine file exists");
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
