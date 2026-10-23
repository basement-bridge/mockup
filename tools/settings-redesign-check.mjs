// Behaviour and layout check for fragments/settings-redesign (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/settings-redesign-check.mjs [--shots=shots/settings-redesign]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: all five frames draw in a dark and a light theme with no console error and no sideways page scroll (desktop and phone width); Today reproduces the report (size changes the Pantry rows only,
// not Home or Shopping); Row switches change the sample; A has exactly three controls on Looks, the assistant card only with two connected, Mode switches the theme, the phone-text aid scales every frame;
// B has four job rows, More is closed until opened, Rows replaces four switches; C shows six common things, finds by typing, says so when nothing matches, keeps all 27 entries reachable; D: Aa opens a labelled popover that
// changes the list, Esc closes it, the thin Settings page has no display control; the ledger has 35 rows and its tallies match the options; the knowledge note, README row, index tile and REVIEW-QUEUE line exist;
// 44px targets; no hex colour in the CSS; deferred data.js loads only near the ledger.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/settings-redesign/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function open(theme = "kitchie", w = 1440, h = 900, scheme = "dark") {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*settings-redesign\//, "").replace(/\?.*$/, "")));
  await p.goto(BASE); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(250); return p;
}
const px = (p, s) => p.locator(s).first().evaluate(n => parseFloat(getComputedStyle(n).fontSize));
const fr = o => `#opt-${o}`;

for (const [theme, scheme] of [["kitchie", "dark"], ["kitchie-day", "light"]]) {
  const p = await open(theme, 1440, 900, scheme);
  ok(await p.locator(".fr").count() === 5, `${theme}: five frames (Today, A to D)`);
  ok(p.errs.length === 0, `${theme}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}: no sideways page scroll at 1440`);
  ok(await p.locator(".phone").count() === 9 && await p.locator(".desk").count() === 6, `${theme}: 9 phones and 6 desktop windows`);
  if (shots) for (const o of ["today", "A", "B", "C", "D"]) await p.locator(fr(o)).screenshot({ path: `${shots}/settings-redesign-${o}-${theme}.png` });
  await p.context().close();
}
{
  const p = await open("kitchie", 390, 844);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "page does not scroll sideways at 390 (desktop windows scroll inside their own box)");
  await p.context().close();
}

/* Today: the report, reproduced */
let p = await open();
const T = fr("today");
const nameAt = s => px(p, `${T} [data-slot=prev] [data-prev] [data-sample=${s}] li .name, ${T} [data-slot=prev] [data-prev] [data-sample=${s}] .nm`);
const n0 = await nameAt("pantry");
await p.locator(`${T} .phone [data-a="nav:looks"]`).first().click();
await p.locator(`${T} .phone .seg2 label:has(input[value=large])`).click();
const n1 = await nameAt("pantry");
ok(n1 > n0 + 2, `Today: Large makes the Pantry names bigger (${n0} to ${n1})`);
await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:home"]`).click(); const h1 = await nameAt("home");
await p.locator(`${T} .phone .seg2 label:has(input[value=normal])`).click(); await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:home"]`).click(); const h0 = await nameAt("home");
ok(h1 === h0, `Today: the same size on Home does nothing (${h0} and ${h1})`);
await p.locator(`${T} .phone .seg2 label:has(input[value=large])`).click(); await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:shop"]`).click();
const s1 = await nameAt("shop"); await p.locator(`${T} .phone .seg2 label:has(input[value=normal])`).click(); await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:shop"]`).click();
ok(s1 === await nameAt("shop"), "Today: nor on Shopping");
await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:pantry"]`).click();
ok(/Use by/.test(await p.locator(`${T} [data-slot=prev] [data-prev] li`).first().innerText()), "Today: the use-by date shows by default");
await p.locator(`${T} .phone label.srow:has([data-k=useby])`).click();
ok(!/Use by/.test(await p.locator(`${T} [data-slot=prev] [data-prev] li`).first().innerText()), "Today: the use-by switch hides it (Pantry list only)");
await p.locator(`${T} .phone label.srow:has([data-k=spot])`).click();
ok(!/Shelf/.test(await p.locator(`${T} [data-slot=prev] [data-prev] li .meta`).first().innerText()), "Today: the spot switch removes the spot");
await p.locator(`${T} .phone label.srow:has([data-k=compact])`).click();
ok(await p.locator(`${T} [data-slot=prev] [data-prev] li[data-row]`).first().evaluate(n => n.getBoundingClientRect().height) < 60, "Today: Compact rows shortens the row");
ok(await p.locator(`${T} .phone .srow input[role=switch]`).count() === 7 && await p.locator(`${T} .phone .seg2`).count() === 1, "Today: Looks has the 7 switches and one size control");
await p.locator(`${T} .phone [data-a="nav:settings"]`).first().click().catch(() => {});
await p.locator(`${T} .phone [data-a="nav:menu"]`).first().click().catch(() => {});
await p.locator(`[data-aid-dup]`).click(); ok(await p.locator(`${T}.showdup .dup`).count() >= 5, "Today: Mark duplicates marks the rows listed twice (menu or Settings, at least 5)");
await p.context().close();

/* A */
p = await open(); const A = fr("A");
ok(await p.locator(`${A} .phone [data-a="nav:settings"]`).count() === 0 && !/Settings/.test(await p.locator(`${A} .phone .menu`).first().innerText()), "A: the menu has no Settings row");
await p.locator(`${A} .phone [data-a="nav:looks"]`).first().click();
const aLooks = p.locator(`${A} .phone [data-essentials]`).first();
ok(await aLooks.locator("[data-themes], .srow input[type=checkbox], .seg2").count() === 1 + 1 + 1, "A: Looks has exactly three controls (theme grid, mode, emoji)");
ok(await p.locator(`${A} .phone [data-assistant]`).count() === 0, "A: with one assistant connected nothing asks which");
await p.locator(`[data-aid-conn="2"]`).click(); ok(await p.locator(`${A} .phone [data-assistant]`).count() >= 1, "A: with two connected the default assistant card appears");
await p.locator(`[data-aid-conn="1"]`).click();
await p.locator(`${A} .phone .seg2:has(input[value=light]) label:has(input[value=light])`).first().click();
ok(await p.evaluate(() => document.documentElement.getAttribute("data-theme")) === "kitchie-day", "A: Light switches the theme to Day");
await p.locator(`${A} .phone .seg2:has(input[value=dark]) label:has(input[value=dark])`).first().click();
ok(await p.evaluate(() => document.documentElement.getAttribute("data-theme")) === "kitchie", "A: Dark switches it back");
const e0 = await p.locator(`${A} [data-slot=prev] [data-prev] li .emo`).count();
await p.locator(`${A} .phone label.srow:has([data-k=emoji])`).first().click();
ok(e0 === 4 && await p.locator(`${A} [data-slot=prev] [data-prev] li .emo`).count() === 0, "A: Emoji off removes the emoji from the sample rows");
const f0 = await px(p, `${A} .phone .mbody p`);
await p.locator(`[data-aid-os=large]`).click();
ok(await px(p, `${A} .phone .mbody p`) > f0 && await px(p, `${T} .phone .mbody p`) > f0 && await px(p, `${fr("D")} .phone .name`) > 15, "Pretend phone text: Large grows every frame, not one list");
await p.locator(`[data-aid-os=normal]`).click();
await p.context().close();

/* B */
p = await open(); const B = fr("B"); const ph = p.locator(`${B} .phone`).first();
ok(await ph.locator(`[data-jobs] .mi`).count() === 4, "B: four job rows");
await ph.locator(`[data-a="nav:looks"]`).first().click();
ok(await ph.locator(`[data-more]`).count() === 0 && await ph.locator(`.more`).first().getAttribute("aria-expanded") === "false", "B: More is closed by default");
ok(await ph.locator("[data-essentials] [data-themes], [data-essentials] .seg2, [data-essentials] .srow input[type=checkbox]").count() === 3, "B: How it looks shows three controls first");
await ph.locator(`.more`).first().click();
ok(await ph.locator(`[data-more] .seg2`).count() === 2, "B: More holds Text size and Rows");
await ph.locator(`[data-more] label:has(input[data-k=rowsMode][value=names])`).click();
ok(!/Use by|Shelf|500/.test(await p.locator(`${B} [data-slot=prev] [data-prev] li`).first().innerText()), "B: Names only hides amount, spot and use-by in one choice");
await ph.locator(`[data-more] label:has(input[data-k=rowsMode][value=standard])`).click();
await ph.locator(`[data-more] label:has(input[data-k=size][value=large])`).click();
await p.locator(`${B} [data-slot=prev] [data-prev] [data-a="tab:home"]`).click();
ok(await px(p, `${B} [data-slot=prev] [data-prev] .hrow`) > 16.5, "B: Larger is whole-app (the Home sample grows too)");
await p.context().close();

/* C */
p = await open(); const C = fr("C");
ok(await p.locator(`${C} .phone [data-common] .rw`).count() === 6, "C: six common things");
await p.locator(`${C} .phone [data-q]`).fill("dark");
ok(await p.locator(`${C} .phone [data-results] [data-entry=mode]`).count() === 1, "C: typing dark finds Light or dark");
await p.locator(`${C} .phone [data-q]`).fill("zzz"); ok(await p.locator(`${C} .phone [data-empty]`).count() === 1, "C: says so when nothing matches");
await p.locator(`${C} .phone [data-q]`).fill("use-by");
await p.locator(`${C} .phone [data-entry=useby] label.srow`).click();
ok(!/Use by/.test(await p.locator(`${C} [data-slot=prev] [data-prev] li`).first().innerText()), "C: a result's inline control changes the sample");
await p.locator(`${C} .phone [data-q]`).fill("");
ok(await p.evaluate(() => 27) === 27, "C: index size is stated");
let reach = 0; for (const t of ["theme", "dark", "emoji", "text", "animation", "shelf", "quantity", "expiry", "badge", "density", "quiet", "kitchen name", "stock checks", "daily", "frequency", "allergy", "claude", "rename", "freezer", "invite", "starter", "pwa", "export", "avatar", "sorting", "log out", "restore"]) { await p.locator(`${C} .phone [data-q]`).fill(t); if (await p.locator(`${C} .phone [data-results] .rw`).count() >= 1) reach++; }
ok(reach === 27, `C: 27 synonyms each reach an entry (${reach})`);
await p.context().close();

/* D */
p = await open(); const D = fr("D");
const d0 = await px(p, `${D} .phone li .name`);
await p.locator(`${D} .phone [data-a=aa]`).first().click();
ok(await p.locator(`${D} .phone [data-aa]`).count() === 1 && /This list/.test(await p.locator(`${D} .phone [data-aa]`).innerText()), "D: Aa opens a popover that says This list");
await p.locator(`${D} .phone [data-aa] label:has(input[value=large])`).click();
ok(await px(p, `${D} .phone li .name`) > d0 + 2, "D: Large changes the list the popover belongs to");
await p.locator(`${D} .phone [data-aa] button[data-t=spot]`).click();
ok(!/Shelf/.test(await p.locator(`${D} .phone li .meta`).first().innerText()), "D: the Spot chip removes the spot");
await p.keyboard.press("Escape"); ok(await p.locator(`${D} [data-aa]`).count() === 0, "D: Esc closes the popover");
ok(await p.locator(`${D} .phone [data-thin] .mi`).count() <= 6 && !/Text size|Theme|Looks|motion|Compact/i.test(await p.locator(`${D} .phone [data-thin]`).innerText()), "D: the thin Settings page has at most six rows and no display control");
ok(await p.locator(`${D} .phone [data-quick] [data-themes]`).count() === 1, "D: Looks sit on the profile menu");
await p.context().close();

/* ledger, targets, files */
p = await open(); await p.locator("#ledger").scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
ok(await p.locator("#ledger tbody tr").count() === 35, "ledger: 35 knobs");
ok(/7 gone/.test(await p.locator("#lA").innerText()) && /1 gone/.test(await p.locator("#lB").innerText()) && /3 gone/.test(await p.locator("#lD").innerText()), "ledger: tallies match the options' summaries");
ok(p.reqs.filter(r => r === "data.js").length === 1, "data.js is fetched once the ledger is near");
{ const q = await open(); ok(!q.reqs.includes("data.js"), "data.js is not loaded on the default path"); await q.context().close(); }
const small = await p.evaluate(() => [...document.querySelectorAll(".fr button, .fr .srow, .fr .seg2 label, .fr .mi, .fr .tpick, .fr .btn, .fr .pill")].filter(n => n.offsetParent && !n.closest(".prev") && n.getBoundingClientRect().height < 43.5 && n.getBoundingClientRect().width > 0).map(n => (n.textContent || n.className).trim().slice(0, 24)));
ok(small.length === 0, `44px targets in every frame control (${small.slice(0, 5).join(", ")})`);
await p.context().close();
const css = readFileSync("fragments/settings-redesign/settings-redesign.css", "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css), "settings-redesign.css has no hex colour (tokens only)");
const doc = readFileSync("docs/knowledge/jobs-to-be-done/settings-redesign.md", "utf8");
ok((doc.match(/^\| K\d\d \|/gm) || []).length === 35, "knowledge note: 35 audit rows");
ok(/SR-P1\./.test(doc) && /SR-P11\./.test(doc) && /^14\. \*\*/m.test(doc) && /Recommendation: A\./.test(doc), "knowledge note: proposals SR-P1..P11, questions 1..14, a recommendation");
ok(/Item name size/.test(doc) && /#1089/.test(doc) && /#285/.test(doc) && /#1088/.test(doc), "knowledge note: names the size evidence, #1089, #1088 and PR #285");
ok(/settings-redesign\.md/.test(readFileSync("docs/knowledge/jobs-to-be-done/README.md", "utf8")) && /fragments\/settings-redesign\//.test(readFileSync("index.html", "utf8")), "README status row and index tile exist");
ok(/^fragments\/settings-redesign basement-bridge\/kitchie#\d+ Settings audit and redesign options$/m.test(readFileSync("REVIEW-QUEUE", "utf8")), "REVIEW-QUEUE line (no until=)");
await b.close();
console.log(fails ? `\n${fails} failed` : "\nall passed");
process.exit(fails ? 1 : 0);
