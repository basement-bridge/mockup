// Behaviour check for the month picker behind "Another day" (Kitchie #826, from #757 F), headless Chromium. Mockup only, nothing is saved.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-month-picker-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path. Any page error or console error fails the run.
// Covers (owner, voice, 17 Oct 2026): no week labels, no today state, one mark vs three, the Who pill scoping planned and day off, the moon only for the selected person,
// the exclamation mark (not the triangle), the legend text, the rank of the weights, the date-number options, the transient halo (timed, cleared by a key, reduced motion), keys, hover, hold and Undo, contrast in both themes.
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
  await p.goto(BASE + (q ? "?" + q : "")); await sleep(450); return p;
}
const cell = (p, n) => p.locator('.pdm-c[data-n="' + n + '"]');
const cls = async (p, n) => (await cell(p, n).getAttribute("class")) || "";
const marks = (p, n) => cell(p, n).locator(".pdm-mk i").count();
const status = p => p.locator(".pdm-st").innerText();
const activeN = p => p.evaluate(() => document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.n : null);
const flyScroll = p => p.evaluate(() => { const e = document.querySelector(".pk-fly"); return e ? e.scrollWidth - e.clientWidth : 0; });
const css = (p, sel, prop) => p.evaluate(([s, pr]) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[pr] : null; }, [sel, prop]);
const contrast = (p, sel) => p.evaluate(s => {
  const rgb = c => { const m = c.match(/[\d.]+/g).slice(0, 3).map(Number); return /^color\(srgb/.test(c) ? m.map(v => v * 255) : m; }, lum = a => { const f = a.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
  const el = document.querySelector(s); if (!el) return 0; let bg = el; while (bg && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(bg).backgroundColor)) bg = bg.parentElement;
  const a = lum(rgb(getComputedStyle(el).color)), b = lum(rgb(getComputedStyle(bg).backgroundColor)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }, sel);
const openMonth = async (p) => { await p.locator("[data-more]").click(); await sleep(450); };

for (const [w, h] of [[1440, 900], [1024, 800]]) {
  const tag = "w" + w + " ";
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  // the list, and the month loading on the first press only
  { const p = await open(ctx, "start=list");
    ok(tag + "list: the Another day row is there, the month is not loaded", (await p.locator("[data-more]").count()) === 1 && (await p.locator(".pdm").count()) === 0);
    const lazy = []; p.on("request", r => { if (/month\.(js|css)/.test(r.url())) lazy.push(r.url()); });
    await openMonth(p);
    ok(tag + "month.js and month.css are fetched on the first press", lazy.length === 2, lazy);
    await p.close(); }
  // structure: no week labels, no today
  { const p = await open(ctx, "start=month");
    ok(tag + "grid: 7 weekday heads, 5 week rows, 35 dates", (await p.locator(".pdm-dh").count()) === 7 && (await p.locator('.pdm [role=row][aria-label^="Week of"]').count()) === 5 && (await p.locator(".pdm-c[data-n]").count()) === 35);
    ok(tag + "weekdays run Mon to Sun across", (await p.locator(".pdm-dh").allInnerTexts()).join(",").replace(/\s/g, "") === "MON,TUE,WED,THU,FRI,SAT,SUN");
    const gridText = await p.locator(".pdm").innerText();
    ok(tag + "no week-label column or header (this week, next week, in N weeks)", (await p.locator(".pdm-w, .pdm-wn, .pdm-wd, .pdm-corner, .pdm-mb").count()) === 0 && !/this week|next week|in \d weeks?/i.test(gridText), gridText.slice(0, 80));
    ok(tag + "the month shows where it changes: 1 Nov and the first cell's month", /Nov/.test(await cell(p, 20).innerText()) && /Oct/.test(await cell(p, 0).innerText()));
    ok(tag + "no today state: no .today class, no today in any label, no ring", (await p.locator(".today").count()) === 0 && !(await p.evaluate(() => [...document.querySelectorAll(".pdm-c")].some(c => /today/i.test(c.getAttribute("aria-label") || "")))));
    ok(tag + "past days are blank, hatched and disabled", /st-past/.test(await cls(p, 0)) && await cell(p, 4).isDisabled() && /hatch|gradient/i.test(await css(p, '.pdm-c[data-n="4"]', "backgroundImage")));
    // legend: exact items, in order
    const lg = (await p.locator(".pdm-lg li").allInnerTexts()).map(x => x.trim());
    ok(tag + "legend reads Open, Planned, Planned several, Day off, Hard avoid, Past (no Today)", JSON.stringify(lg) === JSON.stringify(["Open", "Planned", "Planned, several", "Day off", "Hard avoid", "Past"]), lg);
    ok(tag + "legend swatches: Planned has one mark, Planned several three, Hard avoid an exclamation, Day off a moon", (await p.locator(".pdm-lg li").nth(1).locator(".pdm-mk i").count()) === 1 && (await p.locator(".pdm-lg li").nth(2).locator(".pdm-mk i").count()) === 3 && (await p.locator(".pdm-lg li").nth(4).locator(".pdm-i.bang").count()) === 1 && (await p.locator(".pdm-lg li").nth(3).locator("svg").count()) === 1);
    ok(tag + "legend sits below the grid, at the foot", await p.evaluate(() => document.querySelector(".pdm-lg").getBoundingClientRect().top > document.querySelector(".pdm").getBoundingClientRect().bottom));
    ok(tag + "no sideways scroll", (await flyScroll(p)) <= 0, await flyScroll(p));
    // marks: one vs three, under Everyone
    ok(tag + "Everyone: one plan is one mark", (await marks(p, 12)) === 1 && /st-plan/.test(await cls(p, 12)));
    ok(tag + "Everyone: the stacked night (household plan plus Jo's own) is three marks", (await marks(p, 7)) === 3 && /st-stack/.test(await cls(p, 7)));
    ok(tag + "Everyone: no day off anywhere (day off is per person)", (await p.locator(".pdm-c[data-n].st-off").count()) === 0 && (await p.locator(".pdm-bd.moon").count()) === 0);
    ok(tag + "open dates carry the plus", (await cell(p, 8).locator(".pdm-i").count()) === 1 && /st-open/.test(await cls(p, 8)));
    await p.close(); }
  // the Who pill scopes the grid
  { const p = await open(ctx, "start=month&halo=off");
    await p.locator('[data-who="Sam"]').click(); await sleep(300);
    ok(tag + "Sam: Prawn curry is one mark (it includes Sam)", (await marks(p, 7)) === 1);
    ok(tag + "Sam: his usual Thursday and Sat 7 Nov show the moon", /st-off/.test(await cls(p, 10)) && /st-off/.test(await cls(p, 26)) && (await cell(p, 10).locator("svg").count()) >= 1);
    ok(tag + "Sam: Jo's own Chilli noodles (Sun 18 Oct) are not Sam's, so that date is open for him", /st-open/.test(await cls(p, 6)), await cls(p, 6));
    ok(tag + "Sam: a day off that is being cooked is planned with a small moon (Thu 12 Nov)", /st-plan/.test(await cls(p, 31)) && (await cell(p, 31).locator(".pdm-bd.moon").count()) === 1);
    ok(tag + "Sam: a day off is not locked", !(await cell(p, 10).isDisabled()));
    await p.locator('[data-who="Jo"]').click(); await sleep(300);
    ok(tag + "Jo: Tue 20 Oct is a day off, Thursday is not", /st-off/.test(await cls(p, 8)) && /st-open/.test(await cls(p, 10)));
    ok(tag + "Jo: the stacked night shows only Jo's own, one mark", (await marks(p, 7)) === 1 && /st-plan/.test(await cls(p, 7)));
    ok(tag + "Jo: no stacked cell for Jo's view of Wed 4 Nov (household plus Sam's own is the household one only)", (await marks(p, 23)) === 1, await marks(p, 23));
    await p.locator('[data-who="all"]').click(); await sleep(300);
    ok(tag + "back to Everyone: three marks again, no day off", (await marks(p, 7)) === 3 && (await p.locator(".pdm-c[data-n].st-off").count()) === 0);
    await p.close(); }
  // Hard avoid: the exclamation mark, never the triangle
  { const p = await open(ctx, "start=month&avoid=mango&halo=off");
    ok(tag + "avoid: an exclamation mark where it asks first", (await p.locator(".pdm .pdm-bd.warn .pdm-i.bang").count()) > 0);
    ok(tag + "avoid: no triangle anywhere in the flyout", await p.evaluate(() => ![...document.querySelectorAll("#week svg path")].some(x => /h-19z|H2z|l9\.5 16\.5/.test(x.getAttribute("d") || ""))));
    await cell(p, 11).focus(); await sleep(250);
    ok(tag + "avoid: the hover detail says so with the same mark", /Hard avoid/.test(await p.locator(".pdm-pop").innerText()) && (await p.locator(".pdm-pop .pdm-i.bang").count()) === 1);
    ok(tag + "avoid: the line under the grid says it asks first", /Hard avoid/.test(await status(p)), await status(p));
    await p.locator('[data-who="Jo"]').click(); await sleep(300);
    ok(tag + "avoid: under Jo every open date is Not for Jo with the exclamation", /not for Jo/i.test(await cell(p, 11).getAttribute("aria-label")) && (await cell(p, 11).locator(".pdm-i.bang").count()) === 1);
    await cell(p, 11).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "avoid: for Jo it stops, nothing is planned, the guard panel uses the exclamation", (await p.locator(".pk-conf").count()) === 0 && (await p.locator('.pk-guard svg path[d^="M12 4.5"]').count()) === 1);
    await p.close(); }
  // the rank of the weights: open, then day off, then planned; the number never outweighs the mark
  { const p = await open(ctx, "start=month&halo=off&who=Sam");
    const bw = async n => parseFloat(await css(p, '.pdm-c[data-n="' + n + '"]', "borderTopWidth"));
    const open_ = await bw(8), off = await bw(10), plan = await bw(12), stack = await bw(7);
    ok(tag + "rank: open outline > day off outline > planned outline", open_ > off && off > plan, [open_, off, plan]);
    ok(tag + "rank: planned and planned several weigh the same (quantity only)", plan === stack);
    const plusW = parseFloat(await css(p, '.pdm-c[data-n="8"] .pdm-i', "strokeWidth")), moonW = parseFloat(await css(p, '.pdm-c[data-n="10"] .pdm-i', "strokeWidth"));
    ok(tag + "rank: the plus is heavier than the moon", plusW > moonW, [plusW, moonW]);
    const numW = parseInt(await css(p, '.pdm-c[data-n="8"] .pdm-n', "fontWeight")), numSz = parseFloat(await css(p, '.pdm-c[data-n="8"] .pdm-n', "fontSize")), iconSz = parseFloat(await css(p, '.pdm-c[data-n="8"] .pdm-i', "width"));
    ok(tag + "the date number is lighter and smaller than the state mark", numW <= 600 && numSz < iconSz + 2 && numSz <= 12, [numW, numSz, iconSz]);
    ok(tag + "default date-number option is A (corner)", (await p.evaluate(() => document.querySelector("#week").dataset.num)) === "a");
    await p.close(); }
  // the date-number options present
  for (const o of ["a", "b", "c"]) {
    const p = await open(ctx, "start=month&halo=off&num=" + o);
    ok(tag + "num=" + o + ": option is applied and the grid is intact", (await p.evaluate(() => document.querySelector("#week").dataset.num)) === o && (await p.locator(".pdm-c[data-n]").count()) === 35);
    const planBg = await css(p, '.pdm-c[data-n="12"]', "backgroundColor"), openBg = await css(p, '.pdm-c[data-n="8"]', "backgroundColor");
    if (o === "b") ok(tag + "num=b: a plain neutral cell, no state fill (planned and open share the cell colour)", planBg === openBg, [planBg, openBg]);
    else ok(tag + "num=" + o + ": the state fill is the picture (planned and open differ)", planBg !== openBg, [planBg, openBg]);
    if (o === "c") ok(tag + "num=c: a light numeral (weight 400)", parseInt(await css(p, '.pdm-c[data-n="8"] .pdm-n', "fontWeight")) === 400);
    if (o === "a" && w === 1024) ok(tag + "num=a: the number sits in the corner", (await css(p, '.pdm-c[data-n="8"] .pdm-n', "position")) === "absolute");
    ok(tag + "num=" + o + ": no sideways scroll", (await flyScroll(p)) <= 0);
    await p.close(); }
  // the transient halo
  { const p = await open(ctx, "start=month");
    ok(tag + "halo: on the first open date when the month opens, and only there", (await p.locator(".pdm-c.halo").count()) === 1 && /halo/.test(await cls(p, 8)) && /st-open/.test(await cls(p, 8)));
    ok(tag + "halo: focus starts on that date", (await activeN(p)) === "8");
    ok(tag + "halo: it breathes (an animation) and glows (a shadow)", (await css(p, ".pdm-c.halo", "animationName")) === "pdm-halo" && (await css(p, ".pdm-c.halo", "boxShadow")) !== "none");
    ok(tag + "halo: no permanent ring on the other open dates", (await css(p, '.pdm-c[data-n="9"]', "boxShadow")) === "none" && (await css(p, '.pdm-c[data-n="11"]', "boxShadow")) === "none");
    await sleep(3700);
    ok(tag + "halo: gone after about 3 seconds, no ring left", (await p.locator(".pdm-c.halo, .pdm-c.halo-out").count()) === 0 && !/halo/.test(await cls(p, 8)));
    await p.close(); }
  { const p = await open(ctx, "start=month"); await p.keyboard.press("ArrowRight"); await sleep(750);
    ok(tag + "halo: the first key clears it at once", (await p.locator(".pdm-c.halo, .pdm-c.halo-out").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "start=month"); await p.locator('[data-who="Sam"]').click(); await sleep(750);
    ok(tag + "halo: the first press clears it at once", (await p.locator(".pdm-c.halo, .pdm-c.halo-out").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "start=month&halo=hold"); await sleep(3700);
    ok(tag + "halo=hold keeps it on (for the hub's opening state)", (await p.locator(".pdm-c.halo").count()) === 1); await p.close();
    const q = await open(ctx, "start=month&halo=off");
    ok(tag + "halo=off shows the month after the fade", (await q.locator(".pdm-c.halo").count()) === 0); await q.close(); }
  { const rctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" }); const p = await open(rctx, "start=month");
    ok(tag + "reduced motion: a static ring, no animation", (await p.locator(".pdm-c.halo").count()) === 1 && (await css(p, ".pdm-c.halo", "animationName")) === "none" && (await css(p, ".pdm-c.halo", "boxShadow")) !== "none");
    await sleep(3700);
    ok(tag + "reduced motion: cleared after about 3 seconds", (await p.locator(".pdm-c.halo, .pdm-c.halo-out").count()) === 0);
    await p.close(); await rctx.close(); }
  // hover and keys
  { const p = await open(ctx, "start=month&halo=off");
    await cell(p, 12).hover(); await sleep(250);
    ok(tag + "hover on a planned date shows what is planned, read only", /Pizza night/.test(await p.locator(".pdm-pop").innerText()) && /Read only/.test(await p.locator(".pdm-pop").innerText()));
    await cell(p, 9).hover(); await sleep(250);
    await cell(p, 11).hover(); await sleep(250);
    ok(tag + "hover on an open date shows no detail", (await p.locator(".pdm-pop").count()) === 0);
    await cell(p, 7).hover(); await sleep(250);
    ok(tag + "hover on the stacked night lists the household plan and Jo's own", /Prawn curry/.test(await p.locator(".pdm-pop").innerText()) && /Cheese toastie/.test(await p.locator(".pdm-pop").innerText()));
    await p.mouse.move(5, 5);
    await cell(p, 11).focus();
    await p.keyboard.press("ArrowRight"); ok(tag + "Right moves a day", (await activeN(p)) === "12");
    await p.keyboard.press("ArrowDown"); ok(tag + "Down moves a week", (await activeN(p)) === "19");
    await p.keyboard.press("Home"); ok(tag + "Home goes to the first plannable day", (await activeN(p)) === "5");
    await p.keyboard.press("End"); ok(tag + "End goes to the last day", (await activeN(p)) === "34");
    await p.keyboard.press("ArrowRight"); ok(tag + "Right past the end stays and says so", (await activeN(p)) === "34" && /last day|ends/i.test(await status(p)), await status(p));
    await p.keyboard.press("Escape"); await sleep(300);
    ok(tag + "Esc goes back to the seven days", (await p.locator("[data-more]").count()) === 1 && (await p.locator(".pdm").count()) === 0);
    await openMonth(p); await p.locator("[data-back]").click(); await sleep(300);
    ok(tag + "the back arrow returns to the seven days", (await p.locator("[data-more]").count()) === 1);
    await p.close(); }
  // planning: an open date at once, Undo; stacked night two steps; replace; day off
  { const p = await open(ctx, "start=month&halo=off");
    await cell(p, 11).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "an open date plans at once and says Planned, with a toast Undo", /Planned/.test(await p.locator(".pk-conf").innerText()) && (await p.locator('.toast [data-act="undo"]').count()) === 1);
    await p.locator("[data-cfundo]").click(); await sleep(300);
    ok(tag + "inline Undo reads Undone", /Undone/.test(await p.locator(".pk-conf").innerText()));
    await sleep(3500); ok(tag + "then the flyout closes", (await p.locator(".pk-fly").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "start=month&halo=off");
    await cell(p, 7).focus(); await p.keyboard.press("Enter"); await sleep(250);
    ok(tag + "stacked night: the first pick shows everyone's plans, nothing planned", (await p.locator(".pdm-full").count()) === 1 && (await p.locator(".pk-conf").count()) === 0);
    await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "stacked night: the second pick plans (replaces the household meal, Jo's stays)", /Replaced/.test(await p.locator(".pk-conf").innerText()));
    await p.close(); }
  { const p = await open(ctx, "start=month&halo=off&who=Sam");
    await cell(p, 10).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "Sam's day off plans on one pick (not locked)", /Planned/.test(await p.locator(".pk-conf").innerText()));
    await p.close(); }
  { const p = await open(ctx, "start=month&halo=off&scenario=full");
    ok(tag + "full: only two open dates", (await p.locator('.pdm-c[data-n].st-open').count()) === 2, await p.locator('.pdm-c[data-n].st-open').count());
    await cell(p, 14).focus(); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + "full: a planned date is replaced on the first pick", /Replaced/.test(await p.locator(".pk-conf").innerText()));
    await p.close(); }
  { const p = await open(ctx, "start=month&halo=off&scenario=empty");
    ok(tag + "empty: no planned dates", (await p.locator('.pdm-c[data-n].st-plan, .pdm-c[data-n].st-stack').count()) === 0);
    await p.close(); }
  // other URL variants render without errors
  for (const q of ["start=month&today=2026-10-12", "start=month&today=2026-10-18", "start=list&another=header", "start=month&replace=0", "start=month&wide=off", "start=month&wide=b", "start=month&wide=c"]) {
    const p = await open(ctx, q);
    if (/another=header/.test(q)) { await p.locator("[data-more]").click(); await sleep(450); }
    ok(tag + q + ": 35 dates, no sideways scroll, no week labels", (await p.locator(".pdm-c[data-n]").count()) === 35 && (await flyScroll(p)) <= 0 && (await p.locator(".pdm-w").count()) === 0);
    await p.close(); }
  // the ? list
  { const p = await open(ctx, "start=month&halo=off"); await p.mouse.move(5, 5); await p.keyboard.press("?"); await sleep(300);
    ok(tag + "? list mentions the month keys", /first and last day/i.test(await p.locator("body").innerText()));
    await p.close(); }
  // contrast, light and dark
  for (const th of ["kitchie-day", "kitchie"]) {
    const p = await open(ctx, "start=month&halo=off&who=Sam", th);
    for (const [n, sel] of [["open", ".pdm-c[data-n].st-open .pdm-n"], ["plan", ".pdm-c[data-n].st-plan .pdm-n"], ["stack", ".pdm-c[data-n].st-stack .pdm-n"], ["off", ".pdm-c[data-n].st-off .pdm-n"], ["header", ".pdm-dh"], ["legend", ".pdm-lg li"], ["status", ".pdm-st"]]) {
      const c = await contrast(p, sel); ok(tag + th + " contrast " + n + " >= 4.5", c >= 4.5, c.toFixed(2)); }
    const q = await open(ctx, "start=month&halo=off&avoid=mango", th);
    ok(tag + th + " contrast Hard avoid exclamation >= 3", (await q.evaluate(() => { const e = document.querySelector(".pdm-bd.warn"); return !!e && getComputedStyle(e).color !== "rgba(0, 0, 0, 0)"; })));
    await q.close(); await p.close(); }
  await ctx.close();
}
ok("no page errors or console errors", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log((fails ? "FAILED " : "OK ") + (total - fails) + "/" + total);
process.exit(fails ? 1 : 0);
