// Behaviour check for the month picker behind "Another day" (Kitchie #826, from #757 F), headless Chromium. Mockup only, nothing is saved.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-month-picker-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path. Any page error or console error fails the run.
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-month-picker/home.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await pw.chromium.launch();
const errs = [];
async function open(ctx, q, theme) {
  const p = await ctx.newPage();
  p.on("pageerror", e => errs.push("pageerror " + e.message));
  p.on("console", m => { if (m.type() === "error") errs.push("console " + m.text()); });
  p.on("requestfailed", r => errs.push("requestfailed " + r.url()));
  if (theme) await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); return p;
}
const cell = (p, n) => p.locator('.pdm-c[data-n="' + n + '"]');
const cls = async (p, n) => (await cell(p, n).getAttribute("class")) || "";
const status = p => p.locator(".pdm-st").innerText();
const flyScroll = p => p.evaluate(() => { const e = document.querySelector(".pk-fly"); return e ? e.scrollWidth - e.clientWidth : 0; });
const contrast = (p, sel) => p.evaluate(s => {
  const rgb = c => { const m = c.match(/[\d.]+/g).slice(0, 3).map(Number); return /^color\(srgb/.test(c) ? m.map(v => v * 255) : m; }, lum = a => { const f = a.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
  const el = document.querySelector(s); if (!el) return 0; let bg = el; while (bg && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(bg).backgroundColor)) bg = bg.parentElement;
  const a = lum(rgb(getComputedStyle(el).color)), b = lum(rgb(getComputedStyle(bg).backgroundColor)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }, sel);

for (const [w, h] of [[1440, 900], [1024, 800]]) {
  const tag = "w" + w + " ";
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  // list view: the Another day row opens the month lazily
  { const p = await open(ctx, "start=list");
    ok(tag + "list: Another day row is there, the month is not loaded yet", (await p.locator("[data-more]").count()) === 1 && (await p.locator(".pdm").count()) === 0);
    const lazy = []; p.on("request", r => { if (/month\.(js|css)/.test(r.url())) lazy.push(r.url()); });
    await p.locator("[data-more]").click(); await sleep(500);
    ok(tag + "month files are fetched on the first press only", lazy.length === 2, lazy);
    ok(tag + "month grid shows 5 week columns and 7 weekday rows, 35 dates", (await p.locator(".pdm-h").count()) === 5 && (await p.locator(".pdm-d").count()) === 7 && (await p.locator(".pdm-c[data-n]").count()) === 35);
    ok(tag + "weekdays are rows down the left (Mon first), not a header across", /Mon/.test(await p.locator(".pdm-d").first().innerText()) && /Sun/.test(await p.locator(".pdm-d").last().innerText()));
    ok(tag + "legend is at the bottom, below the grid, with Open, Planned, Usual day off, Past", await p.evaluate(() => { const l = document.querySelector(".pdm-lg"), g = document.querySelector(".pdm"); return !!l && l.getBoundingClientRect().top > g.getBoundingClientRect().bottom; }) && /Open/.test(await p.locator(".pdm-lg").innerText()) && /Planned/.test(await p.locator(".pdm-lg").innerText()) && /Usual day off/.test(await p.locator(".pdm-lg").innerText()) && /Past/.test(await p.locator(".pdm-lg").innerText()));
    ok(tag + "no sideways scroll in the flyout", (await flyScroll(p)) <= 0, await flyScroll(p));
    // states (never colour alone: each has an icon or text and an aria-label)
    ok(tag + "Mon 12 to Fri 16 are past and disabled", (await cls(p, 0)).includes("st-past") && await cell(p, 4).isDisabled());
    ok(tag + "Sat 17 is today with a meal (planned)", /today/.test(await cls(p, 5)) && /st-plan/.test(await cls(p, 5)));
    ok(tag + "Mon 19 is a stacked night (2 plans)", /st-stack/.test(await cls(p, 7)) && /2/.test(await cell(p, 7).innerText()));
    ok(tag + "Tue 20 is off this week only", /st-week/.test(await cls(p, 8)));
    ok(tag + "Thu 22 is a usual day off", /st-usual/.test(await cls(p, 10)));
    ok(tag + "Thu 12 Nov is a usual day off that is being cooked, shown as planned", /st-plan/.test(await cls(p, 31)));
    ok(tag + "Fri 23 is open", /st-open/.test(await cls(p, 11)));
    ok(tag + "every cell has an aria-label", await p.evaluate(() => [...document.querySelectorAll(".pdm-c[data-n]")].every(c => c.getAttribute("aria-label"))));
    ok(tag + "month step shows 1 Nov with its month name", /Nov/.test(await cell(p, 20).innerText()));
    // hover shows what is planned
    await cell(p, 12).hover(); await sleep(250);
    ok(tag + "hover on a planned day shows a read-only popover with the meal", /Pizza night/.test(await p.locator(".pdm-pop").innerText()) && /Read only/.test(await p.locator(".pdm-pop").innerText()));
    await cell(p, 11).hover(); await sleep(250);
    ok(tag + "hover on an open day shows no popover", (await p.locator(".pdm-pop:visible").count()) === 0);
    await cell(p, 7).hover(); await sleep(250);
    ok(tag + "hover on the stacked night lists the household plan and Jo's own", /Prawn curry/.test(await p.locator(".pdm-pop").innerText()) && /Cheese toastie/.test(await p.locator(".pdm-pop").innerText()));
    await p.mouse.move(5, 5);
    // keys
    await p.evaluate(() => document.querySelector('.pdm-c[data-n="11"]').focus());
    await p.keyboard.press("ArrowRight"); ok(tag + "Right moves a week", (await p.evaluate(() => document.activeElement.dataset.n)) === "18");
    await p.keyboard.press("ArrowDown"); ok(tag + "Down moves a day", (await p.evaluate(() => document.activeElement.dataset.n)) === "19");
    await p.keyboard.press("Home"); ok(tag + "Home goes to today", (await p.evaluate(() => document.activeElement.dataset.n)) === "5");
    await p.keyboard.press("End"); ok(tag + "End goes to the last plannable day", (await p.evaluate(() => document.activeElement.dataset.n)) === "34");
    await p.keyboard.press("ArrowRight"); ok(tag + "Right past the end stays and says so", (await p.evaluate(() => document.activeElement.dataset.n)) === "34" && /ends|last|four weeks/i.test(await status(p)), await status(p));
    // Esc and back
    await p.keyboard.press("Escape"); await sleep(300);
    ok(tag + "Esc goes back to the list, not out", (await p.locator("[data-more]").count()) === 1 && (await p.locator(".pdm").count()) === 0);
    await p.locator("[data-more]").click(); await sleep(300); await p.locator("[data-back]").click(); await sleep(300);
    ok(tag + "the back button returns to the list", (await p.locator("[data-more]").count()) === 1);
    await p.close(); }
  // plan on an open day: at once, a hold, then slide out; Undo within the hold
  { const p = await open(ctx, "start=month");
    await cell(p, 11).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "open day: one pick plans it at once and says Planned", /Planned/.test(await p.locator(".pk-conf").innerText()), await p.locator(".pk-conf").count());
    ok(tag + "a toast with Undo shows", (await p.locator('.toast [data-act="undo"]').count()) === 1);
    await p.locator("[data-cfundo]").click(); await sleep(300);
    ok(tag + "inline Undo reads Undone", /Undone/.test(await p.locator(".pk-conf").innerText()));
    await sleep(3500);
    ok(tag + "then the flyout closes and the day is open again in Home's week", (await p.locator(".pk-fly").count()) === 0);
    await p.close(); }
  // a stacked night takes two steps; a usual day off is not locked; replace on own meal
  { const p = await open(ctx, "start=month");
    await cell(p, 7).focus(); await p.keyboard.press("Enter"); await sleep(250);
    ok(tag + "stacked night: first pick opens everyone's plans, nothing is planned yet", (await p.locator(".pdm-full").count()) === 1 && (await p.locator(".pk-conf").count()) === 0);
    await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "stacked night: the second pick plans, replacing the household meal for everyone but Jo", /Replaced/.test(await p.locator(".pk-conf").innerText()));
    await p.close(); }
  { const p = await open(ctx, "start=month");
    await cell(p, 10).focus(); await sleep(150);
    ok(tag + "usual day off: the line says it can still be planned, no lock", !(await cell(p, 10).isDisabled()) && /usual|day off|this week only/i.test(await status(p)), await status(p));
    await cell(p, 10).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "usual day off: one pick plans it", /Planned/.test(await p.locator(".pk-conf").innerText()));
    await p.close(); }
  // full week scenario: the open count shrinks, replace still allowed
  { const p = await open(ctx, "start=month&scenario=full");
    ok(tag + "full: only two open days in the window", (await p.locator('.pdm-c[data-n].st-open').count()) === 2, await p.locator('.pdm-c[data-n].st-open').count());
    await cell(p, 14).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "full: a planned day is replaced on the first pick", /Replaced/.test(await p.locator(".pk-conf").innerText()));
    await p.close(); }
  { const p = await open(ctx, "start=month&scenario=empty");
    ok(tag + "empty: no planned days", (await p.locator('.pdm-c[data-n].st-plan, .pdm-c[data-n].st-stack').count()) === 0);
    await p.close(); }
  // Hard avoid: asked live per date, only where the avoided person is part of it
  { const p = await open(ctx, "start=month&avoid=mango");
    ok(tag + "avoid: legend adds the Hard avoid item", /Hard avoid/.test(await p.locator(".pdm-lg").innerText()));
    await cell(p, 11).focus(); await sleep(150);
    ok(tag + "avoid: an open day under Everyone asks first (the line says so)", /Hard avoid/.test(await status(p)), await status(p));
    await p.locator('[data-who="Jo"]').click(); await sleep(200);
    await cell(p, 11).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "avoid: for Jo it stops, nothing is planned", (await p.locator(".pk-conf").count()) === 0);
    await p.close(); }
  // other URL variants render without errors and keep the grid
  for (const q of ["start=month&cols=dates", "start=month&month=band", "start=list&another=header", "start=month&today=2026-10-12", "start=month&today=2026-10-18", "start=month&replace=0"]) {
    const p = await open(ctx, q);
    if (/another=header/.test(q)) { await p.locator("[data-more]").click(); await sleep(400); }
    ok(tag + q + ": 35 cells", (await p.locator(".pdm-c[data-n]").count()) === 35);
    ok(tag + q + ": no sideways scroll", (await flyScroll(p)) <= 0);
    await p.close(); }
  // `?` list has the month keys
  { const p = await open(ctx, "start=month"); await p.mouse.move(5, 5); await p.keyboard.press("?"); await sleep(300);
    ok(tag + "? list mentions the month keys", /week/i.test(await p.locator("body").innerText()) && /Home/.test(await p.locator("body").innerText()));
    await p.close(); }
  // contrast, light and dark themes
  for (const th of ["kitchie-day", "kitchie"]) {
    const p = await open(ctx, "start=month", th);
    for (const [n, sel] of [["open", ".pdm-c[data-n].st-open .pdm-n"], ["plan", ".pdm-c[data-n].st-plan .pdm-n"], ["usual", ".pdm-c[data-n].st-usual .pdm-n"], ["week", ".pdm-c[data-n].st-week .pdm-n"], ["header", ".pdm-hd"], ["legend", ".pdm-lg li"], ["status", ".pdm-st"]]) {
      const c = await contrast(p, sel); ok(tag + th + " contrast " + n + " >= 4.5", c >= 4.5, c.toFixed(2)); }
    await p.close(); }
  await ctx.close();
}
// narrow: the layout holds
{ const ctx = await browser.newContext({ viewport: { width: 1024, height: 700 } }); const p = await open(ctx, "start=month&avoid=mango");
  ok("narrow: grid width fits the flyout", await p.evaluate(() => { const g = document.querySelector(".pdm").getBoundingClientRect(), f = document.querySelector(".pk-fly").getBoundingClientRect(); return g.right <= f.right + 1 && g.left >= f.left - 1; }));
  await ctx.close(); }
ok("no page errors or console errors", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log((fails ? "FAILED " : "OK ") + (total - fails) + "/" + total);
process.exit(fails ? 1 : 0);
