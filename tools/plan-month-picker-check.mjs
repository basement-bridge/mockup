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
    ok(tag + "month grid shows 5 week rows and 7 weekday columns, 35 dates", (await p.locator(".pdm-w").count()) === 5 && (await p.locator(".pdm-dh").count()) === 7 && (await p.locator(".pdm-c[data-n]").count()) === 35);
    ok(tag + "weekdays run horizontally, Mon at the left to Sun at the right, weeks stack as rows", await p.evaluate(() => { const b = n => document.querySelector('.pdm-c[data-n="' + n + '"]').getBoundingClientRect(); const mon = b(7), sun = b(13), nxt = b(14); return mon.left < sun.left && Math.abs(mon.top - sun.top) < 2 && nxt.top > mon.bottom - 1 && Math.abs(nxt.left - mon.left) < 2; }) && /mon/i.test(await p.locator(".pdm-dh").first().innerText()) && /sun/i.test(await p.locator(".pdm-dh").last().innerText()));
    ok(tag + "legend is at the bottom, below the grid, with Open, Planned, Day off, Past", await p.evaluate(() => { const l = document.querySelector(".pdm-lg"), g = document.querySelector(".pdm"); return !!l && l.getBoundingClientRect().top > g.getBoundingClientRect().bottom; }) && /Open/.test(await p.locator(".pdm-lg").innerText()) && /Planned/.test(await p.locator(".pdm-lg").innerText()) && /Day off/.test(await p.locator(".pdm-lg").innerText()) && /Past/.test(await p.locator(".pdm-lg").innerText()));
    ok(tag + "no sideways scroll in the flyout", (await flyScroll(p)) <= 0, await flyScroll(p));
    // states (never colour alone: each has an icon or text and an aria-label)
    ok(tag + "Mon 12 to Fri 16 are past and disabled", (await cls(p, 0)).includes("st-past") && await cell(p, 4).isDisabled());
    ok(tag + "Sat 17 is today with a meal (planned)", /today/.test(await cls(p, 5)) && /st-plan/.test(await cls(p, 5)));
    ok(tag + "Mon 19 is a stacked night (2 plans)", /st-stack/.test(await cls(p, 7)) && /2/.test(await cell(p, 7).innerText()));
    ok(tag + "Tue 20 is a day off (the one muted state)", /st-off/.test(await cls(p, 8)));
    ok(tag + "Thu 22 is a day off, the same state as Tue 20", /st-off/.test(await cls(p, 10)) && !/st-usual|st-week/.test(await cls(p, 10)));
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
    await p.keyboard.press("ArrowRight"); ok(tag + "Right moves a day", (await p.evaluate(() => document.activeElement.dataset.n)) === "12");
    await p.keyboard.press("ArrowDown"); ok(tag + "Down moves a week", (await p.evaluate(() => document.activeElement.dataset.n)) === "19");
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
    for (const [n, sel] of [["open", ".pdm-c[data-n].st-open .pdm-n"], ["plan", ".pdm-c[data-n].st-plan .pdm-n"], ["off", ".pdm-c[data-n].st-off .pdm-n"], ["header", ".pdm-wd"], ["legend", ".pdm-lg li"], ["status", ".pdm-st"]]) {
      const c = await contrast(p, sel); ok(tag + th + " contrast " + n + " >= 4.5", c >= 4.5, c.toFixed(2)); }
    await p.close(); }
  await ctx.close();
}
// wide: Another day widens the flyout to two flyouts' worth of width when the window has room; below that the single width with compact cells; tablet and phone are sheets
const flyW = p => p.evaluate(() => { const e = document.querySelector("#week"); return e ? e.getBoundingClientRect().width : 0; });
const noX = p => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
for (const [w, h] of [[1700, 900], [1440, 900], [1366, 800]]) {
  const tag = "wide w" + w + " ";
  for (const opt of ["a", "b", "c"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const lazy = [];
    const p = await ctx.newPage(); p.on("pageerror", e => errs.push("pageerror " + e.message)); p.on("console", m => { if (m.type() === "error") errs.push("console " + m.text()); }); p.on("request", r => { if (/\/(wide|rich|month)\.(js|css)/.test(r.url())) lazy.push(r.url().split("/").pop()); });
    await p.goto(BASE + "?start=list&wide=" + opt); await sleep(500);
    ok(tag + opt + ": nothing wide is fetched on page load", lazy.length === 0, lazy);
    const w0 = await flyW(p); await p.locator("[data-more]").click(); await sleep(600);
    ok(tag + opt + ": the first press fetches month, rich and wide, once", ["month.css", "month.js", "rich.css", "wide.css", "wide.js"].every(f => lazy.includes(f)) && lazy.length === 5, lazy);
    const w1 = await flyW(p);
    ok(tag + opt + ": the flyout takes two flyouts of width (about 800px, from " + Math.round(w0) + ")", w1 >= 790 && w1 <= 810 && w1 > w0 + 300, [w0, w1]);
    ok(tag + opt + ": the app marks the plan as wide and the recipe pane steps back", (await p.evaluate(() => document.querySelector("#app").dataset.plan)) === "wide" && (await p.evaluate(() => getComputedStyle(document.querySelector("#detail")).display)) === "none");
    ok(tag + opt + ": no sideways scroll on the page or the flyout", (await noX(p)) <= 0 && (await flyScroll(p)) <= 0, [await noX(p), await flyScroll(p)]);
    ok(tag + opt + ": the column is never covered (flyout starts at or after the column's right edge)", await p.evaluate(() => { const c = document.querySelector(".main").getBoundingClientRect(), f = document.querySelector("#week").getBoundingClientRect(); return f.left >= c.right - 1 && c.width >= 440; }));
    ok(tag + opt + ": the week is Mon to Sun across with a meal name in a planned cell", await p.evaluate(() => { const c = document.querySelector('.pdm-c[data-n="12"]'), m = c.querySelector(".pdm-m"); const r = c.getBoundingClientRect(); return !!m && getComputedStyle(m).display !== "none" && /Pizza/.test(m.textContent) && r.width >= (document.querySelector("#week").dataset.wide === "b" ? 52 : 70); }));
    ok(tag + opt + ": every open cell says Plan here and is solid", await p.evaluate(() => [...document.querySelectorAll(".pdm .pdm-c.st-open")].every(c => /Plan here/.test(c.textContent) && getComputedStyle(c).backgroundColor !== "rgba(0, 0, 0, 0)" && getComputedStyle(c.querySelector(".pdm-m")).display !== "none")));
    ok(tag + opt + ": no meal name is cut off by the cell (clamped to 2 lines, no sideways overflow)", await p.evaluate(() => [...document.querySelectorAll(".pdm-c .pdm-m")].every(m => m.scrollWidth <= m.clientWidth + 1)));
    ok(tag + opt + ": the legend and the status line are kept", (await p.locator(".pdm-lg").count()) === 1 && (opt === "b" || (await p.locator("#pdm-st").count()) === 1));
    if (opt === "b") {
      ok(tag + "b: the side card shows the recipe, the date, a Plan button", (await p.locator("#pdw-side").count()) === 1 && /Mandarin/.test(await p.locator("#pdw-side").innerText()) && (await p.locator("#pdw-side .pdw-go").count()) === 1);
      await cell(p, 11).hover(); await sleep(200);
      ok(tag + "b: hovering an open date puts it in the side card with a solid Plan button, and there is no floating popover", /Friday 23 October/.test(await p.locator("#pdw-side").innerText()) && (await p.locator("#pdw-side .pdw-go.is-open").count()) === 1 && (await p.locator(".pdm-pop").count()) === 0);
      await cell(p, 12).hover(); await sleep(200);
      ok(tag + "b: hovering a planned date lists what is planned and whose", /Pizza night/.test(await p.locator("#pdw-side").innerText()) && /household/i.test(await p.locator("#pdw-side").innerText()));
      await p.locator("#pdw-side .pdw-go").hover(); await sleep(150);
      ok(tag + "b: moving to the card's button keeps the date", /Saturday 24 October/.test(await p.locator("#pdw-side").innerText()) || /Pizza night/.test(await p.locator("#pdw-side").innerText()));
      await cell(p, 11).hover(); await sleep(150); await p.locator("#pdw-side .pdw-go").click(); await sleep(300);
      ok(tag + "b: the side card's button plans that date at once", /Planned/.test(await p.locator(".pk-conf").innerText()) && /Fri 23 Oct/.test(await p.locator(".pk-conf").innerText()));
    } else {
      await cell(p, 12).hover(); await sleep(250);
      const pr = await p.evaluate(() => { const o = document.querySelector(".pdm-pop"), f = document.querySelector("#week").getBoundingClientRect(); if (!o) return null; const r = o.getBoundingClientRect(); return r.left >= f.left - 1 && r.right <= f.right + 1; });
      ok(tag + opt + ": the hover popover sits on the date, inside the wide flyout", pr === true, pr);
    }
    if (opt === "c") {
      ok(tag + "c: a shortcut plans the next open night (Fri 23 Oct) and says how many are open", /Fri 23 Oct/.test(await p.locator(".pdm-next-b").innerText()) && /14 open/.test(await p.locator(".pdm-next").innerText()));
      ok(tag + "c: each week row ends with its open count, in words", (await p.locator(".pdm-rs").count()) === 5 && /2/.test(await p.locator(".pdm-rs").nth(1).innerText()));
      await p.locator(".pdm-next-b").click(); await sleep(300);
      ok(tag + "c: the shortcut plans that date at once", /Planned/.test(await p.locator(".pk-conf").innerText()) && /Fri 23 Oct/.test(await p.locator(".pk-conf").innerText()));
    }
    if (opt === "a") {
      await p.locator("[data-back]").click(); await sleep(400);
      ok(tag + "a: Back folds the flyout to one flyout's width and gives the recipe pane back", (await flyW(p)) < 450 && (await p.evaluate(() => getComputedStyle(document.querySelector("#detail")).display)) !== "none" && !(await p.evaluate(() => document.querySelector("#app").dataset.plan)));
      await p.locator("[data-more]").click(); await sleep(400);
      ok(tag + "a: Another day again widens it with no second fetch", (await flyW(p)) >= 790 && lazy.length === 5, lazy);
    }
    await ctx.close();
  }
}
// contrast of the wide texts, light and dark
for (const th of ["kitchie-day", "kitchie"]) for (const opt of ["a", "b", "c"]) {
  const ctx = await browser.newContext({ viewport: { width: 1700, height: 900 } }); const p = await open(ctx, "start=month&wide=" + opt, th);
  const list = [["open meal", ".pdm .st-open .pdm-m"], ["planned meal", ".pdm .st-plan .pdm-m"], ["off meal", ".pdm .st-off .pdm-m"], ["week name", ".pdm-wn"], ["week dates", ".pdm-wd"]];
  if (opt === "b") list.push(["side card", ".pdw-cons"], ["side chip open", ".pdw-chip"], ["side button", ".pdw-go"]);
  if (opt === "c") list.push(["next button", ".pdm-next-b"], ["row count", ".pdm-rs b"]);
  for (const [n, sel] of list) { const c = await contrast(p, sel); ok("wide " + opt + " " + th + " contrast " + n + " >= 4.5", c >= 4.5, c.toFixed(2)); }
  await ctx.close();
}
// compact: a window too narrow for two flyouts keeps the single width and never fetches the wide files
for (const [w, h] of [[1280, 800], [1100, 800]]) {
  const tag = "compact w" + w + " "; const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const lazy = [];
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push("pageerror " + e.message)); p.on("console", m => { if (m.type() === "error") errs.push("console " + m.text()); }); p.on("request", r => { if (/\/(wide|rich)\.(js|css)/.test(r.url())) lazy.push(r.url()); });
  await p.goto(BASE + "?start=month"); await sleep(700);
  ok(tag + "the wide files are never fetched", lazy.length === 0, lazy);
  ok(tag + "the flyout stays one flyout wide (400px)", Math.abs((await flyW(p)) - 400) < 10, await flyW(p));
  const m = await p.evaluate(() => { const cs = [...document.querySelectorAll(".pdm-c[data-n]")].map(c => c.getBoundingClientRect()); return { minW: Math.min(...cs.map(r => r.width)), minH: Math.min(...cs.map(r => r.height)), hidden: [...document.querySelectorAll(".pdm-m")].every(x => getComputedStyle(x).display === "none") }; });
  ok(tag + "seven cells across, each at least 44px wide and tall", m.minW >= 44 && m.minH >= 44, m);
  ok(tag + "the meal name is not drawn in the cell (it is in the popover and the line under the grid)", m.hidden);
  await cell(p, 12).hover(); await sleep(250);
  ok(tag + "hover still shows the popover, outside the flyout", (await p.locator(".pdm-pop").count()) === 1 && /Pizza night/.test(await p.locator(".pdm-pop").innerText()));
  ok(tag + "no sideways scroll", (await noX(p)) <= 0 && (await flyScroll(p)) <= 0);
  await ctx.close();
}
// resize across the wide width while the month is open
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p = await open(ctx, "start=month");
  ok("resize: starts compact at 1280", Math.abs((await flyW(p)) - 400) < 10);
  await p.setViewportSize({ width: 1500, height: 800 }); await sleep(700);
  ok("resize: widens in place at 1500 (no reload, the month stays open)", (await flyW(p)) >= 790 && (await p.locator(".pdm").count()) === 1);
  await p.setViewportSize({ width: 1280, height: 800 }); await sleep(500);
  ok("resize: folds back in place at 1280", Math.abs((await flyW(p)) - 400) < 10 && (await p.locator(".pdm").count()) === 1 && !(await p.evaluate(() => document.querySelector("#app").dataset.plan)));
  await ctx.close(); }
// tablet and phone: a sheet
const SHEET = BASE.replace("home.html", "");
for (const [form, w, h] of [["tablet", 768, 1024], ["tablet", 600, 900], ["phone", 390, 844], ["phone", 360, 740]]) {
  const tag = form + " w" + w + " "; const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push("pageerror " + e.message)); p.on("console", m => { if (m.type() === "error") errs.push("console " + m.text()); }); const lazy = []; p.on("request", r => { if (/\/(wide)\.(js|css)/.test(r.url())) lazy.push(r.url()); });
  await p.goto(SHEET + form + ".html"); await sleep(500);
  ok(tag + "the sheet is closed until Add to plan", (await p.locator("#week:visible").count()) === 0);
  await p.locator("[data-act=plan]").click(); await sleep(400); await p.locator("[data-more]").click(); await sleep(500);
  ok(tag + "35 dates, Monday to Sunday across", (await p.locator(".pdm-c[data-n]").count()) === 35 && await p.evaluate(() => { const b = n => document.querySelector('.pdm-c[data-n="' + n + '"]').getBoundingClientRect(); return b(7).left < b(13).left && Math.abs(b(7).top - b(13).top) < 2 && b(14).top > b(7).bottom - 1; }));
  ok(tag + "the wide files are never fetched", lazy.length === 0, lazy);
  ok(tag + "no sideways scroll", (await noX(p)) <= 0 && (await flyScroll(p)) <= 0, [await noX(p), await flyScroll(p)]);
  const g = await p.evaluate(() => { const cs = [...document.querySelectorAll(".pdm-c[data-n]")].map(c => c.getBoundingClientRect()), sh = document.querySelector("#week").getBoundingClientRect(); return { minW: Math.min(...cs.map(r => r.width)), minH: Math.min(...cs.map(r => r.height)), sw: sh.width, sh: sh.height, vw: innerWidth, vh: innerHeight, names: [...document.querySelectorAll(".pdm-m")].some(x => getComputedStyle(x).display !== "none") }; });
  ok(tag + "every date is at least 44px wide and tall (the touch target)", g.minW >= 44 && g.minH >= 44, g);
  if (form === "phone") ok(tag + "the sheet is the whole screen; cells carry no meal name", g.sw === g.vw && g.sh === g.vh && !g.names, g);
  else ok(tag + "the sheet is a dialog at most 720px wide; cells carry the meal name", g.sw <= 721 && g.sw < g.vw && g.names, g);
  ok(tag + "the open nights lead: a shortcut to Fri 23 Oct above the grid, its height at least 44px", /Fri 23 Oct/.test(await p.locator(".pdm-next-b").innerText()) && (await p.locator(".pdm-next-b").boundingBox()).height >= 44);
  ok(tag + "no keyboard hint line on a touch screen", (await p.locator(".pk-hint").count()) === 0);
  await p.locator(".pdm-c[data-n=\"12\"]").tap(); await sleep(300);
  ok(tag + "first tap on a planned night shows what is on it and plans nothing", /Pizza night/.test(await p.locator(".pdm-full").innerText()) && (await p.locator(".pk-conf").count()) === 0);
  await p.locator(".pdm-c[data-n=\"12\"]").tap(); await sleep(300);
  ok(tag + "second tap plans it (Replaced or Planned, with Undo)", /Planned|Replaced/.test(await p.locator(".pk-conf").innerText()) && (await p.locator("[data-cfundo]").count()) === 1);
  await p.locator("[data-cfundo]").tap(); await sleep(300);
  ok(tag + "Undo reads Undone", /Undone/.test(await p.locator(".pk-conf").innerText()));
  await sleep(1600);
  await p.locator("[data-act=plan]").click(); await sleep(400); await p.locator("[data-more]").click(); await sleep(400);
  await p.locator(".pdm-c[data-n=\"11\"]").tap(); await sleep(300);
  ok(tag + "one tap on an open night plans it at once", /Planned/.test(await p.locator(".pk-conf").innerText()), await p.locator(".pk-conf").count());
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
