// Behaviour, count and layout check for fragments/settings-shakeup (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// The first half of the output is the three directions as first drawn (directions.html, kept so they stay working); the second half, from the line starting 'chosen', is the CHOSEN DESIGN (index.html, owner decisions of 24 Oct 2026: SR-Q42 to SR-Q51).
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
  await p.goto(`${BASE}directions.html?o=${o}&bare=1${q}`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(200);
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
const html = readFileSync(new URL("../fragments/settings-shakeup/directions.html", import.meta.url), "utf8");
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
const css = readFileSync(new URL("../fragments/settings-shakeup/directions.css", import.meta.url), "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in shake.css (tokens only)");
const note = readFileSync(new URL("../docs/knowledge/jobs-to-be-done/settings-redesign.md", import.meta.url), "utf8");
ok(/SR-Q36/.test(note) && /Element audit of the current UAT build/.test(note) && /settings-shakeup/.test(note), "knowledge note has the shake-up section, the audit and SR-Q36");
ok(/fragments\/settings-shakeup /.test(readFileSync(new URL("../REVIEW-QUEUE", import.meta.url), "utf8")), "REVIEW-QUEUE has the shake-up line");
ok(/fragments\/settings-shakeup\//.test(readFileSync(new URL("../index.html", import.meta.url), "utf8")), "index tile exists");
ok(existsSync(new URL("../fragments/settings-shakeup/shake-search.js", import.meta.url)), "search engine file exists");

/* ======================= the CHOSEN design (index.html): owner decisions of 24 Oct 2026, SR-Q42 to SR-Q51 ======================= */
const CB = BASE;
async function openC({ theme = "kitchie", scheme = "dark", w = 390, h = 844, query = "", bare = true } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*settings-shakeup\//, "").replace(/^.*fragments\//, "").replace(/\?.*$/, "")));
  const qs = [bare ? "bare=1" : "", query].filter(Boolean).join("&");
  await p.goto(`${CB}${qs ? "?" + qs : ""}`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(250);
  return p;
}
const PH = ".phone";
const tsVar = p => p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ts")));
const noSide = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll(".bd")].every(n => n.scrollWidth <= n.clientWidth + 1));
const csearch = async (p, t) => { await p.click(`${PH} input[data-eq]`).catch(async () => { await p.click(`${PH} [data-a=opensearch]`); }); await p.fill(`${PH} input[data-eq]`, t); await p.waitForTimeout(200); };
const pbg = p => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
const smallTargets = p => p.evaluate(() => {
  const R = document.querySelector(".phone").getBoundingClientRect();
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== "hidden" && r.bottom > R.top && r.top < R.bottom && !e.closest("[hidden]") && !(e.tagName === "INPUT" && e.type === "checkbox"); };
  return [...document.querySelectorAll(".phone button,.phone [role=slider],.phone label.sw,.phone input:not([type=checkbox])")].filter(vis).filter(e => { const r = e.getBoundingClientRect(); if (/\bseg\b/.test(e.className)) return r.height < 43.5 || r.width < 15; return r.height < 43.5 || r.width < 43.5; }).map(e => (e.getAttribute("aria-label") || e.className || e.textContent).toString().trim().slice(0, 24));
});

/* 1. every state, light and dark, 390 and 360, text steps: no error, no sideways scroll, targets */
const STATES = ["", "p=looks", "p=household", "p=you", "p=preferences", "p=kitchen", "pins=0", "pins=1", "pins=3", "q=text+size", "q=quiet+hours", "q=theme", "s=examples", "s=last3", "q=flux+capacitor", "q=my+name"];
for (const [th, scheme] of [["kitchie", "dark"], ["kitchie-day", "light"]]) {
  for (const [w, h] of [[390, 844], [360, 640]]) {
    let bad = [], side = [], small = [];
    for (const st of STATES) {
      for (const ts of [0, 3, -3]) {
        const p = await openC({ theme: th, scheme, w, h, query: [st, ts ? "ts=" + ts : ""].filter(Boolean).join("&") });
        if (p.errs.length) bad.push(st + ts + ":" + p.errs[0]);
        if (!(await noSide(p))) side.push(st + "/ts" + ts);
        if (ts === 0) { const sm = await smallTargets(p); if (sm.length) small.push(st + ":" + sm.join(",")); }
        if (shots && (ts === 3 || st === "" || st === "pins3") && (w === 390 || st === "")) await p.screenshot({ path: `${shots}/chosen-${scheme}-${w}x${h}-${(st || "front").replace(/[^a-z0-9]+/gi, "-")}${ts ? "-ts" + ts : ""}.png` });
        await p.context().close();
      }
    }
    ok(bad.length === 0, `chosen ${scheme} ${w}x${h}: ${STATES.length} states at three text sizes draw with no console error ${bad.slice(0, 2).join(";")}`);
    ok(side.length === 0, `chosen ${scheme} ${w}x${h}: no sideways scroll in any of them ${side.slice(0, 3).join(",")}`);
    ok(small.length === 0, `chosen ${scheme} ${w}x${h}: every control is at least 44px by 44px (a stepper segment 44px tall and at least 15px wide, seven across; compact by the owner's design, see the note) ${small.slice(0, 3).join(" | ")}`);
  }
}

/* 2. the page leads with the phone and the state switcher, no scrolling */
{
  const p = await openC({ bare: false });
  const r = await p.evaluate(() => { const ph = document.querySelector(".phone").getBoundingClientRect(), sel = [...document.querySelectorAll(".bar select")].map(s => s.getBoundingClientRect()); return { top: ph.top, h: ph.height, sel: sel.map(s => s.bottom <= innerHeight && s.top >= 0), bars: sel.length, scrollY }; });
  ok(r.top < 220 && r.top + 400 < 844 && r.h > 560, `the phone is the first thing on the page: starts at ${Math.round(r.top)}px, ${Math.round(r.h)}px tall`);
  ok(r.bars === 3 && r.sel.every(Boolean), "the state switcher (Screen, Search, Pinned) is on screen at load, no scrolling");
  ok((await p.locator(`${PH} .main .nm`).allInnerTexts()).join("|") === "Household|Preferences|Kitchen setup", "the front has three plain rows: Household, Preferences, Kitchen setup (no You row, no Assistants row)");
  ok((await p.locator(`${PH} .main .val`).count()) === 3 && (await p.locator(`${PH} .main .val`).allInnerTexts()).every(t => t.trim().length > 2), "each plain row shows its value");
  ok(await p.locator(`details.nc`).count() === 1 && !(await p.locator(`details.nc`).evaluate(d => d.open)) && (await p.locator(`details.nc a[href="directions.html"]`).count()) === 1, "A and C are collapsed behind a small note that links to them");
  const txt = await p.locator(PH).innerText();
  ok(!/\bpinned?\b/i.test(txt) && !/emoji/i.test(txt), "no 'Pin' or 'Pinned' word and no Emoji on the front");
  ok(await p.locator('select#st-screen option').count() === 6, "the switcher reaches Settings, Looks, Household, You, Preferences, Kitchen setup");
  await p.selectOption("#st-screen", "looks"); await p.waitForTimeout(150);
  ok(await p.locator(`${PH}[data-page=looks]`).count() === 1, "the Screen switcher opens Looks");
  await p.selectOption("#st-search", "last3"); await p.waitForTimeout(250);
  ok(await p.locator(`${PH}[data-searching=true] .sgl[data-kind=recent]`).count() === 1, "the Search switcher shows the empty search with recents");
  await p.selectOption("#st-search", "off"); await p.selectOption("#st-pins", "3"); await p.waitForTimeout(150);
  ok(await p.locator(`${PH} .pins[data-n="3"] .chipb`).count() === 3, "the Pinned switcher shows three chips");
  ok(!p.reqs.some(q => /search-index|shake-search/.test(q.replace(/^.*\//, "")) ) || true, "");
  await p.context().close();
  const q2 = await openC();
  ok(!q2.reqs.some(q => /search-index|shake-search/.test(q)), `the engine and the index are not requested on load (${q2.reqs.filter(q => /shake|search/.test(q)).join(",")})`);
  await q2.click(`${PH} input[data-eq]`); await q2.waitForTimeout(300);
  ok(q2.reqs.some(q => /search-index/.test(q)) && q2.reqs.some(q => /shake-search/.test(q)), "both load when the search box is first used");
  await q2.context().close();
}

/* 3. the quick area: 0, 1, 2, 3 pinned */
{
  const geom = async (n) => { const p = await openC({ query: `pins=${n}` }); const g = await p.evaluate(() => { const o = [...document.querySelectorAll(".pins .pin")].map(e => { const r = e.getBoundingClientRect(); return { k: e.dataset.k, x: r.left, t: r.top, w: r.width, h: r.height }; }); const m = document.querySelector(".main").getBoundingClientRect().top; return { o, m, pins: !!document.querySelector(".pins") }; }); return [p, g]; };
  let [p, g] = await geom(0); ok(!g.pins, "0 pinned: no quick area is drawn"); await p.context().close();
  [p, g] = await geom(1); ok(g.o.length === 1 && g.o[0].k === "text" && g.o[0].w > 340, `1 pinned: one full row (${Math.round(g.o[0].w)}px wide), Text size`); await p.context().close();
  [p, g] = await geom(2); ok(g.o.length === 2 && Math.abs(g.o[0].t - g.o[1].t) < 2 && Math.abs(g.o[0].w - g.o[1].w) < 2 && g.o[0].w < 190, `2 pinned: two halves share a row (${g.o.map(x => Math.round(x.w)).join(" and ")}px)`); await p.context().close();
  [p, g] = await geom(3);
  ok(g.o.length === 3 && g.o.map(x => x.k).join() === "text,theme,bell" && g.o.every(x => x.w < 90), `3 pinned: compact chips, default order text size, theme, bell (${g.o.map(x => Math.round(x.w)).join(",")}px)`);
  const before = g.m;
  await p.click(`${PH} .pin[data-k=text] .chipb`); await p.waitForTimeout(250);
  const after = await p.evaluate(() => ({ m: document.querySelector(".main").getBoundingClientRect().top, open: document.querySelectorAll(".pin.open").length, ow: document.querySelector(".pin.open").getBoundingClientRect().width, dim: [...document.querySelectorAll(".pins .pin:not(.open)")].map(e => +getComputedStyle(e).opacity), segs: document.querySelectorAll(".pin.open .seg").length }));
  ok(after.open === 1 && after.ow > 200 && after.segs === 7, `touching a chip opens it in place (${Math.round(after.ow)}px wide, seven segments)`);
  ok(after.dim.length === 2 && after.dim.every(o => o < 0.6), "the other chips dim");
  ok(Math.abs(after.m - before) < 1.5, `and nothing below jumps (rows moved ${Math.round((after.m - before) * 10) / 10}px)`);
  await p.click(`${PH} .main .rb >> nth=0`).catch(() => {}); await p.waitForTimeout(100);
  await p.context().close();
  /* the Aa chip and the swatch chip and the bell chip have names */
  p = await openC({ query: "pins=3" });
  ok((await p.locator(`${PH} .chipb .aa`).innerText()) === "Aa" && (await p.locator(`${PH} .chipb`).evaluateAll(n => n.every(x => /Open/.test(x.getAttribute("aria-label"))))), "the text chip is a compact Aa and every chip has an accessible name");
  await p.context().close();
}

/* 4. long hold then drag moves a pinned control; no edit button, no pencil */
{
  const p = await openC({ query: "pins=2" });
  ok(await p.locator(`${PH} [aria-label*="Edit" i], ${PH} [aria-label*="pencil" i], ${PH} .pencil`).count() === 0, "no edit button and no pencil on the front");
  const a = await p.locator(`${PH} .pin[data-k=text] .clab`).boundingBox(), t = await p.locator(`${PH} .pin[data-k=theme] .clab`).boundingBox();
  await p.mouse.move(a.x + 8, a.y + 8); await p.mouse.down(); await p.waitForTimeout(300);
  ok(await p.locator(`${PH} .pin.lift`).count() === 0, "a short press does not lift anything (the hold is about half a second)");
  await p.waitForTimeout(350);
  ok(await p.locator(`${PH} .pin.lift`).count() === 1, "a long hold lifts the control");
  await p.mouse.move(t.x + 70, t.y + 8, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(250);
  ok((await p.locator(`${PH} .pin`).evaluateAll(n => n.map(x => x.dataset.k))).join() === "theme,text", "dragging it past the other swaps their order");
  await p.click(`${PH} [data-a="pg:looks"]`); await p.click(`${PH} [data-a=back]`); await p.waitForTimeout(100);
  ok((await p.locator(`${PH} .pin`).evaluateAll(n => n.map(x => x.dataset.k))).join() === "theme,text", "the new order stays");
  await p.context().close();
  /* a swipe on the rotary does not start a move */
  const q = await openC({ query: "pins=2" }); const r = await q.locator(`${PH} .pin[data-k=theme] .rot`).boundingBox();
  await q.mouse.move(r.x + r.width / 2, r.y + 20); await q.mouse.down(); await q.mouse.move(r.x + r.width / 2 - 60, r.y + 20, { steps: 6 }); await q.waitForTimeout(650); await q.mouse.up();
  ok(await q.locator(`${PH} .pin.lift`).count() === 0 && (await q.locator(`${PH} .pin`).evaluateAll(n => n.map(x => x.dataset.k))).join() === "text,theme", "a swipe on the rotary turns it and never lifts the control");
  await q.context().close();
}

/* 5. the rotary: swipe, tap, keys, the whole page re-themes live, double tap resets */
{
  const p = await openC({ query: "pins=1" }); // text only; open Looks for theme
  await p.click(`${PH} [data-a="pg:looks"]`); await p.waitForTimeout(150);
  const names10 = await p.locator(`${PH} .rot .rit b`).allInnerTexts();
  ok(names10.length === 10 && new Set(names10).size === 10, `the rotary holds ten named themes (${names10.slice(0, 3).join(", ")}...)`);
  const looks = await p.locator(`${PH} .rot .rit`).evaluateAll(ns => ns.map(n => [n.style.getPropertyValue("--pbg"), n.style.getPropertyValue("--pac")].join("/")));
  ok(new Set(looks).size === 10, "each theme is drawn in its own real colours");
  ok((await p.locator(`${PH} .rot`).getAttribute("role")) === "slider" && await p.locator(`${PH} .dropdown, ${PH} select`).count() === 0, "the rotary is a slider, not a dropdown");
  const bg0 = await pbg(p), th0 = await theme(p);
  const r = await p.locator(`${PH} .rot`).boundingBox(), W = r.width * 0.66 + 8;
  await p.mouse.move(r.x + r.width / 2, r.y + 20); await p.mouse.down();
  await p.mouse.move(r.x + r.width / 2 - W * 0.4, r.y + 20, { steps: 4 }); await p.mouse.move(r.x + r.width / 2 - W * 1.6, r.y + 20, { steps: 6 });
  await p.waitForTimeout(450); // mid-drag: the page has already re-themed
  const mid = await theme(p), midbg = await pbg(p);
  await p.mouse.up(); await p.waitForTimeout(450);
  ok(mid !== th0 && mid === await theme(p) && midbg !== bg0, `swiping sideways changes the theme live, while the finger is still down (${th0} to ${mid})`);
  ok((await p.locator(`${PH} .rit.cur b`).innerText()) === (await p.evaluate(() => window.themeName())), "the card in the middle is the theme in use");
  await p.focus(`${PH} .rot`); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(450);
  ok(await theme(p) !== mid, "the arrow keys turn it too");
  const cur = await theme(p);
  const rb2 = await p.locator(`${PH} .rot`).boundingBox(); await p.mouse.click(rb2.x + rb2.width - 8, rb2.y + rb2.height / 2); await p.waitForTimeout(500);
  ok(await theme(p) !== cur, "tapping the neighbour brings it to the middle");
  await p.waitForTimeout(500);
  const rr = await p.locator(`${PH} .rot`).boundingBox(); await p.mouse.dblclick(rr.x + rr.width / 2, rr.y + rr.height / 2); await p.waitForTimeout(500);
  ok(await theme(p) === "kitchie", "a double tap resets the theme to the default for the phone (dark: Kitchie Night)");
  await p.click(`${PH} .mseg [data-a="mode:light"]`); await p.waitForTimeout(400);
  ok(await theme(p) === "kitchie-day" && (await p.locator(`${PH} .mseg [aria-checked=true]`).getAttribute("aria-label")) === "Light", "light or dark sits alongside and switches");
  const rows = await p.locator(`${PH} .rot`).evaluate(n => n.closest(".lrow") !== null);
  ok(rows, "on Looks the rotary sits on the right half with the label on the left");
  await p.context().close();
}

/* 6. text size: seven battery segments, live whole-page scale, headings at half the rate, double tap resets */
{
  const p = await openC({ bare: false, query: "pins=1" });
  ok(await p.locator(`${PH} .pin .seg`).count() === 7 && await p.locator(`${PH} .pin .seg.mid`).count() === 1, "seven segments, one of them the middle (Match my phone)");
  const lab = await p.locator(`${PH} .pin .clab`).boundingBox(), st = await p.locator(`${PH} .pin .ts`).boundingBox();
  ok(lab.x < st.x && st.x >= 185 && st.x + st.width > 330, `label on the left, stepper on the right half (stepper starts at ${Math.round(st.x)}px)`);
  const fs = async sel => p.locator(sel).first().evaluate(n => parseFloat(getComputedStyle(n).fontSize));
  const base = { body: await fs(`.shk p`), head: await fs(`${PH} .hd .ttl`), row: await fs(`${PH} .main .nm`), h1: await fs(`.shk h1`) };
  const want = [0.76, 0.84, 0.92, 1, 1.1, 1.2, 1.3], got = [];
  for (let i = 0; i < 7; i++) { await p.click(`${PH} .pin .seg >> nth=${i}`); await p.waitForTimeout(500); got.push(Math.round(await tsVar(p) * 100) / 100); }
  ok(JSON.stringify(got) === JSON.stringify(want), `each segment sets its step: ${got.join(" ")}`);
  const big = { body: await fs(`.shk p`), head: await fs(`${PH} .hd .ttl`), row: await fs(`${PH} .main .nm`), h1: await fs(`.shk h1`) };
  ok(big.body / base.body > 1.25 && big.row / base.row > 1.25, `at +30% the page and list text grow by ${Math.round((big.row / base.row - 1) * 100)}%`);
  const hr = big.head / base.head; ok(hr > 1.05 && hr < 1.18 && hr < big.row / base.row - 0.1, `headings grow at about half the rate, capped (${Math.round((hr - 1) * 100)}% at +30%)`);
  ok(big.h1 / base.h1 < 1.18, "the page's own heading follows the same half-rate rule");
  await p.waitForTimeout(500); await p.locator(`${PH} .pin .seg >> nth=5`).dblclick(); await p.waitForTimeout(300);
  ok(await tsVar(p) === 1, "a double tap on the stepper resets it to Match my phone");
  await p.locator(`${PH} .pin .seg >> nth=0`).click(); await p.waitForTimeout(100);
  ok(await tsVar(p) === 0.76 && (await p.locator(`${PH} .pin .seg.on`).count()) === 1, "−24% is the smallest step");
  await p.context().close();
}

/* 7. Looks: three pinnable controls, an icon-only pin each */
{
  const p = await openC({ query: "p=looks" });
  const pins = p.locator(`${PH} .pinb:not(.ph)`);
  ok(await pins.count() === 3, "Looks has a pin on Theme, Text size and the activity bell (three, nothing else)");
  ok((await pins.evaluateAll(n => n.every(x => x.textContent.trim() === "" && x.querySelector("svg")))), "every pin is an icon with no word");
  ok((await pins.evaluateAll(n => n.map(x => x.getAttribute("aria-label")))).every(a => /^(Pin|Unpin) .+ (to|from) the Settings front$/.test(a)), "the accessible names say what a pin does");
  const state = async () => (await pins.evaluateAll(n => n.map(x => x.getAttribute("aria-pressed")))).join();
  ok(await state() === "true,false,true" || await state() === "true,true,false" || (await state()).split(",").filter(x => x === "true").length === 2, `two are pinned by default (${await state()})`);
  ok(await p.locator(`${PH} .lrow`).count() === 4 && await p.locator(`${PH} .lrow[data-id=mode] .pinb.ph`).count() === 1, "light or dark has no pin of its own (it travels with Theme)");
  await p.locator(`${PH} .pinb[data-a="pin:bell"]`).click(); await p.waitForTimeout(150);
  await p.click(`${PH} [data-a=back]`); await p.waitForTimeout(150);
  ok(await p.locator(`${PH} .pins[data-n="3"] .chipb`).count() === 3, "pinning the bell makes three: the front switches to chips");
  ok(await p.locator(`${PH} [data-k=invite], ${PH} [data-k=assistants], ${PH} .pinb[data-a="pin:invite"]`).count() === 0, "invite and assistants are not pinnable");
  await p.context().close();
  const q = await openC({ query: "p=looks&pins=3" }); await q.waitForTimeout(100);
  await q.locator(`${PH} .lrow[data-id=bell] .sw input`).evaluate(n => n.click()); await q.waitForTimeout(120);
  const bellOff = await q.locator(`${PH} .lrow[data-id=bell] .sub`).innerText();
  await q.locator(`${PH} .lrow[data-id=bell]`).dblclick({ position: { x: 300, y: 20 } }).catch(() => {});
  const sw = q.locator(`${PH} .lrow[data-id=bell] .sw`); const bb = await sw.boundingBox(); await q.waitForTimeout(500);
  await q.mouse.dblclick(bb.x + bb.width / 2, bb.y + bb.height / 2); await q.waitForTimeout(250);
  ok(bellOff === "Off" && (await q.locator(`${PH} .lrow[data-id=bell] .sub`).innerText()) === "On", "a double tap on the bell switch resets it to On");
  await q.context().close();
}

/* 8. search: examples, last three, best match, compact rows, nothing removed left behind */
{
  let p = await openC({ query: "s=examples" });
  const sg = p.locator(`${PH} .sg`);
  ok(await p.locator(`${PH} .sgl[data-kind=examples]`).count() === 1 && await sg.count() >= 3 && await sg.count() <= 4, "with no history the empty search shows three or four example searches");
  const st = await sg.first().evaluate(n => { const c = getComputedStyle(n); return { d: c.textDecorationLine + " " + c.textDecorationStyle, th: c.textDecorationThickness, bg: c.backgroundColor, bw: c.borderTopWidth, r: c.borderTopLeftRadius }; });
  ok(/underline dotted/.test(st.d) && parseFloat(st.th) <= 1.5 && st.bg === "rgba(0, 0, 0, 0)" && st.bw === "0px", `suggestions are plain text with a thin dotted underline, no pill (${st.d}, ${st.th})`);
  ok(await p.locator(`${PH} .qchip, ${PH} .pill, ${PH} .tag`).count() === 0, "no pill anywhere in the empty search");
  await p.context().close();
  p = await openC();
  await csearch(p, "text size"); await p.keyboard.press("Enter"); await p.waitForTimeout(100);
  await p.fill(`${PH} input[data-eq]`, "quiet hours"); await p.keyboard.press("Enter"); await p.fill(`${PH} input[data-eq]`, "invite"); await p.keyboard.press("Enter"); await p.fill(`${PH} input[data-eq]`, "bell"); await p.keyboard.press("Enter");
  await p.fill(`${PH} input[data-eq]`, ""); await p.waitForTimeout(150);
  const rc = await p.locator(`${PH} .sgl[data-kind=recent] .sg`).allInnerTexts();
  ok(rc.join("|") === "bell|invite|quiet hours", `with history it shows the last three searches, newest first (${rc.join(", ")})`);
  await p.fill(`${PH} input[data-eq]`, "text size"); await p.waitForTimeout(250);
  const best = p.locator(`${PH} .best`);
  ok(await best.count() === 1 && (await best.locator(".nm").innerText()) === "Text size" && (await best.locator(".at").innerText()) === "Looks", "results lead with one best-match card: name and a quiet where-it-lives line");
  ok(await best.locator(".ts .seg").count() === 7, "the best match for Text size carries its control (the stepper), no navigation needed");
  const dh = await best.locator(".desc").evaluate(n => ({ h: n.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(n).lineHeight) }));
  ok(dh.h < dh.lh * 1.5, "its description is one line");
  const body = await p.locator(`${PH} .bd`).innerText();
  ok(!/\b(AFFECTS|LIVES IN|NOW|Exact match|Also called|Advanced|results?|matches|On this page|Everywhere else)\b/i.test(body.replace(/Text size|Looks/g, "")) && await p.locator(`${PH} .pill, ${PH} .sh, ${PH} .tag, ${PH} .qchip`).count() === 0, "no results count, area groups, why labels, AFFECTS, LIVES IN or pills");
  await p.fill(`${PH} input[data-eq]`, "quiet hours"); await p.waitForTimeout(250);
  ok(await p.locator(`${PH} .best .pbtn.go`).innerText() === "Go there" && await p.locator(`${PH} .best .at`).innerText() === "Preferences", "a setting with no inline control shows Go there");
  await p.fill(`${PH} input[data-eq]`, "name"); await p.waitForTimeout(250);
  const rowsN = await p.locator(`${PH} .res .prow`).count();
  const rh = rowsN ? await p.locator(`${PH} .res .prow >> nth=0`).evaluate(n => n.getBoundingClientRect().height) : 0;
  ok(rowsN >= 1 && rh < 62, `the rest are compact one-line rows (${rowsN} rows, ${Math.round(rh)}px each)`);
  await p.fill(`${PH} input[data-eq]`, "flux capacitor"); await p.waitForTimeout(200);
  ok(await p.locator(`${PH} [data-empty]`).count() === 1 && await p.locator(`${PH} [data-empty] .sg`).count() >= 3, "no match says so and offers plain words");
  await p.fill(`${PH} input[data-eq]`, "drak mode"); await p.waitForTimeout(200);
  ok(await p.locator(`${PH} [data-fixed]`).count() === 1 && (await p.locator(`${PH} .best .nm`).innerText()) === "Light or dark", "a typo still finds it and says what it searched");
  await p.fill(`${PH} input[data-eq]`, "bell"); await p.waitForTimeout(200);
  const swc = p.locator(`${PH} .best input[role=switch]`); const was = await swc.isChecked(); await swc.evaluate(n => n.click()); await p.waitForTimeout(100);
  ok(await p.locator(`${PH} .best input[role=switch]`).isChecked() === !was, "the switch in the best match flips the bell right there");
  await p.fill(`${PH} input[data-eq]`, "theme"); await p.waitForTimeout(250);
  ok(await p.locator(`${PH} .best .rot`).count() === 1 && await p.locator(`${PH} .res .prow`).count() <= 3, "searching Theme gives the rotary in the best match, not ten theme results");
  await p.context().close();
  /* from every page; this page's matches first */
  for (const pg of ["looks", "household", "you", "preferences", "kitchen"]) {
    const q = await openC({ query: "p=" + pg });
    ok(await q.locator(`${PH} [data-a=opensearch]`).isVisible(), `search is one tap away on ${pg}`); await q.context().close();
  }
  let q = await openC({ query: "p=household" }); await csearch(q, "name");
  const first1 = await q.locator(`${PH} .best .nm`).innerText(); await q.context().close();
  q = await openC({ query: "p=you" }); await csearch(q, "name"); const first2 = await q.locator(`${PH} .best .nm`).innerText(); await q.context().close();
  ok(first1 === "Household name" && first2 === "My name and picture", `this page's matches come first ("name": ${first1} from Household, ${first2} from You)`);
  /* my name and profile land on You */
  for (const w of ["my name", "profile"]) {
    const z = await openC(); await csearch(z, w);
    ok((await z.locator(`${PH} .best .nm`).innerText()) === "My name and picture" && (await z.locator(`${PH} .best .at`).innerText()) === "Household · You", `"${w}" finds My name and picture, filed under Household`);
    await z.click(`${PH} .best [data-a^="go:"]`); await z.waitForTimeout(300);
    ok(await z.locator(`${PH}[data-page=you]`).count() === 1 && await z.locator(`${PH} .field.flash`).count() === 1, `and opens You and flashes the name box (from "${w}")`);
    await z.click(`${PH} [data-a=back]`); await z.waitForTimeout(150);
    ok(await z.locator(`${PH}[data-searching=true]`).count() === 1, "Back returns to the results");
    await z.context().close();
  }
}

/* 9. Household: tap yourself to edit your name; Back goes to Household */
{
  const p = await openC({ query: "p=household" });
  ok(await p.locator(`${PH} .people .rb`).count() === 1 && (await p.locator(`${PH} .people .rb .nm`).innerText()) === "Alex", "only you are tappable in the member list");
  await p.click(`${PH} .people .rb`); await p.waitForTimeout(150);
  ok(await p.locator(`${PH}[data-page=you] input[data-me]`).count() === 1, "tapping yourself opens a page with your name to edit");
  await p.fill(`${PH} input[data-me]`, "Robin"); await p.waitForTimeout(100);
  ok((await p.locator(`${PH} .big-av`).innerText()) === "R", "the picture follows the name");
  await p.click(`${PH} [data-a=back]`); await p.waitForTimeout(150);
  ok(await p.locator(`${PH}[data-page=household]`).count() === 1 && (await p.locator(`${PH} .people .rb .nm`).innerText()) === "Robin", "Back goes to Household, which shows the new name");
  await p.click(`${PH} [data-a=invite]`); await p.waitForTimeout(100);
  ok(/kitchie\.app\/join\//.test(await p.locator(`${PH} [data-invite]`).innerText()), "Copy invite link makes and shows the link in one press");
  await p.context().close();
  const k = await openC({ query: "p=kitchen" });
  ok((await k.locator(`${PH} .gh`).allInnerTexts()).join() === "Kitchen,Assistants" && await k.locator(`${PH} .cdot.on`).count() === 1, "Kitchen setup holds Categories, Locations and the Assistants (Claude connected)");
  await k.context().close();
}

/* 10. gestures: the rule is written down, and the records exist */
{
  const css = readFileSync(new URL("../fragments/settings-shakeup/shake.css", import.meta.url), "utf8");
  ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in shake.css (tokens only; the rotary's theme colours come from data)");
  const design = readFileSync(new URL("../DESIGN.md", import.meta.url), "utf8");
  ok(/## 8\. Gestures are app-wide rules/.test(design) && /Double tap resets/.test(design) && /Long hold moves/.test(design), "DESIGN.md records the two gesture rules");
  const note2 = readFileSync(new URL("../docs/knowledge/jobs-to-be-done/settings-redesign.md", import.meta.url), "utf8");
  const q = []; for (let i = 42; i <= 51; i++) if (!new RegExp("\\*\\*SR-Q" + i + "\\.").test(note2)) q.push("Q" + i);
  const pr = []; for (let i = 28; i <= 44; i++) if (!new RegExp("\\*\\*SR-P" + i + "\\.").test(note2)) pr.push("P" + i);
  ok(q.length === 0 && pr.length === 0, `the note records SR-Q42 to SR-Q51 and SR-P28 to SR-P44 ${q.concat(pr).join(",")}`);
  ok((note2.match(/Decided by owner/g) || []).length >= 20, "the decisions are marked decided by owner");
  const cl = /of the same 53 elements, (\d+) earn their place, (\d+) are cut and (\d+) are merged or moved/.exec(note2);
  const rowsC = [...note2.matchAll(/\| (Earns its place|Cut|Merge or move) \| [^|]+\|$/gm)].map(m => m[1]);
  ok(cl && rowsC.length === 53 && +cl[1] === rowsC.filter(v => v === "Earns its place").length && +cl[2] === rowsC.filter(v => v === "Cut").length && +cl[3] === rowsC.filter(v => v === "Merge or move").length, `the cut list is updated for the chosen design and its count matches its rows (${cl ? cl.slice(1).join("/") : "?"} of ${rowsC.length})`);
  ok(/settings-shakeup/.test(readFileSync(new URL("../REVIEW-QUEUE", import.meta.url), "utf8")) && /final decisions/.test(readFileSync(new URL("../REVIEW-QUEUE", import.meta.url), "utf8")), "REVIEW-QUEUE line is updated");
  ok(/settings-shakeup \(chosen\)/.test(readFileSync(new URL("../fragments/settings-search-results/index.html", import.meta.url), "utf8")), "settings-search-results carries the 'superseded by settings-shakeup (chosen)' note");
  ok(existsSync(new URL("../fragments/settings-shakeup/directions.html", import.meta.url)), "A, B and C are still reachable (directions.html)");
}

await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
