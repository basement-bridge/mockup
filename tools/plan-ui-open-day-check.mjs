// Behaviour check for the Plan UI phone mockup, open day (Plan UI review 147 to 153, updated for 154 to 156), headless Chromium, touch and mouse.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-ui-open-day-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox).
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); return p; }
async function touchSwipe(ctx, p, x, y, dx, steps = 8) { const c = await ctx.newCDPSession(p); const t = (type, xx) => c.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: xx, y, id: 1 }] }); await t("touchStart", x); for (let i = 1; i <= steps; i++) { await t("touchMove", x + dx * i / steps); await sleep(12); } await t("touchEnd", x + dx); await c.detach(); await sleep(250); }
const S = (p, f) => p.evaluate(f);
const blocked = (p, d) => S(p, `!!window.__plan.S.blocked.${d}`);
const center = async (p, sel) => { await p.locator(sel).scrollIntoViewIfNeeded(); const b = await p.locator(sel).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width }; };

for (const [w, h] of [[390, 844], [360, 740]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const errs = []; const tag = `touch ${w}`;
  // A. the dashed open day
  { const p = await open(ctx, "", errs); const od = p.locator('.od[data-od-b="d18"]');
    ok(`${tag} A: open day is the dashed slot`, await od.evaluate(e => getComputedStyle(e).borderTopStyle === "dashed"));
    ok(`${tag} A: no visible words and no buttons on an open day in the week`, (await od.evaluate(e => [...e.children].every(c => c.classList.contains("sr")))) && (await p.locator(".pw-day .oa").count()) === 0);
    ok(`${tag} A: open day is labelled for screen readers`, (await od.getAttribute("aria-label")).includes("Open night"));
    ok(`${tag} A: past days have no swipe slot`, (await p.locator('.pw-day.past .od').count()) === 0);
    ok(`${tag} A: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth"));
    // B. swipe right sets Not cooking, undo, auto expiry
    let c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(ctx, p, c.x - 60, c.y, 160);
    ok(`${tag} B: right swipe on an open day sets Not cooking`, await blocked(p, "d18"));
    ok(`${tag} B: with an Undo in place`, (await p.locator('#d-d18 .unote [data-undo]').count()) === 1);
    await p.keyboard.press("z"); await sleep(150); ok(`${tag} B: undo restores the open day`, !(await blocked(p, "d18")));
    c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(ctx, p, c.x + 60, c.y, -140);
    ok(`${tag} B: a left swipe does nothing on an open day`, !(await blocked(p, "d18")));
    await touchSwipe(ctx, p, c.x - 40, c.y, 40);
    ok(`${tag} B: a short swipe does nothing and springs back`, !(await blocked(p, "d18")) && (await p.locator('.od[data-od-b="d18"]').evaluate(e => e.style.transform)) === "");
    ok(`${tag} B: a swipe did not open the day`, (await S(p, "window.__plan.S.dday")) === null);
    // hold-to-lift of 145 still works on a meal tile, and is not on the open day
    c = await center(p, '.mc[data-id="wed-curry"]'); const cd = await ctx.newCDPSession(p);
    await cd.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(450);
    ok(`${tag} B: hold still lifts a meal tile`, await p.locator('.mc[data-id="wed-curry"].hold').count() === 1);
    await cd.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(500); await p.keyboard.press("Escape");
    c = await center(p, '.od[data-od-b="d18"]'); await cd.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(450);
    ok(`${tag} B: hold does nothing on the open day`, (await p.locator(".hold").count()) === 0 && !(await S(p, "!!window.__plan.S.carry")));
    await cd.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(500); await S(p, "window.__plan.S.dday = null; window.__plan.render(false)");
    // swipe on a meal tile still sets Not cooking (the same direction), nothing fights
    c = await center(p, '.mc[data-id="fri-left"]'); await touchSwipe(ctx, p, c.x - 60, c.y, 170);
    ok(`${tag} B: right swipe on a meal tile is still Not cooking`, await blocked(p, "d16"));
    await p.close(); }
  // auto expiry (155: 3 s for this swipe) and moving on
  { const p = await open(ctx, "", errs); const c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(ctx, p, c.x - 60, c.y, 160);
    ok(`${tag} B: blocked`, await blocked(p, "d18")); await sleep(2300);
    ok(`${tag} B: the Undo is still there at 2.3 s`, (await p.locator("#d-d18 [data-undo]").count()) === 1); await sleep(1400);
    ok(`${tag} B: the Undo expires by itself at 3 s`, (await p.locator("[data-undo]").count()) === 0 && await blocked(p, "d18"));
    await S(p, "window.scrollTo(0, 0)"); await sleep(600); await S(p, "window.__plan.follow(true)"); await sleep(100);
    ok(`${tag} B: the Not cooking tile hides once you move on (92, 96)`, await p.locator("#d-d18.hid").count() === 1);
    await p.close(); }
  // D. tapping a Not cooking day opens the LIGHT panel only (154), the day stays Not cooking
  { const p = await open(ctx, "", errs); const oa = () => p.locator("#lite .oa button").count();
    await p.locator('.od[data-od-b="d18"]').scrollIntoViewIfNeeded(); await p.locator('.od[data-od-b="d18"]').tap(); await sleep(300);
    ok(`${tag} D: tapping an open day opens its detail with Ask AI, Surprise me, Not cooking`, (await p.locator(".oa").count()) === 1 && (await p.locator(".oa button").count()) === 3);
    await p.locator('[data-block="d18"]').tap(); await sleep(300); ok(`${tag} D: Not cooking from the detail`, await blocked(p, "d18"));
    ok(`${tag} D: it is the light panel with Ask AI, Surprise me, Mark as open`, (await p.locator("#lite").count()) === 1 && (await oa()) === 3 && (await p.locator("#lite .mko").count()) === 1);
    ok(`${tag} D: no recipe chrome: no stepper, ingredients, total time, day piece, sheet or tongue`, (await p.locator(".ppl, .ing, .tt, .dpiece, .spiece, .tongue, .sfoot").count()) === 0);
    await sleep(500); await p.locator('#lite [data-unblock="d18"]').tap(); await sleep(300);
    ok(`${tag} D: Mark as open turns it into an open night and closes the panel`, !(await blocked(p, "d18")) && (await p.locator("#lite").count()) === 0 && (await p.locator("[data-undo]").count()) >= 1);
    await p.close(); }
  // D2. from the plain week: swipe, tap the revealed Not cooking tile
  { const p = await open(ctx, "", errs); let c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(ctx, p, c.x - 60, c.y, 160);
    await sleep(500); await p.locator('#d-d18 .blk').tap(); await sleep(300);
    ok(`${tag} D: tapping the Not cooking tile opens the light panel and the day stays Not cooking`, (await blocked(p, "d18")) && (await p.locator("#lite").count()) === 1 && (await S(p, "window.__plan.S.dday")) === "d18");
    ok(`${tag} D: and no full detail: nothing of the recipe stack`, (await p.locator(".stackw:not(.lite), .dpiece, .spiece, .ing").count()) === 0);
    await sleep(500); await p.locator('#lite [data-surprise]').tap(); await sleep(300);
    ok(`${tag} D: Surprise me on a Not cooking day makes it a cooking day`, !(await blocked(p, "d18")) && (await S(p, "window.__plan.S.meals.some(m => m.day === 'd18')")));
    await p.close(); }
  { const p = await open(ctx, "", errs); let c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(ctx, p, c.x - 60, c.y, 160); await sleep(500); await p.locator('#d-d18 .blk').tap(); await sleep(300);
    await sleep(15500); ok(`${tag} D: the panel stays 15 s (nothing on a timer closes it)`, (await p.locator("#lite .oa button").count()) === 3);
    await p.locator('#lite [data-close]').tap(); await sleep(300); ok(`${tag} D: the x closes it`, (await p.locator("#lite").count()) === 0); await p.close(); }

  // reduced motion, long list, past day, view only, ac
  { const c2 = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, reducedMotion: "reduce" }); const p = await open(c2, "long=1", errs);
    const c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(c2, p, c.x - 60, c.y, 160); ok(`${tag} reduced motion + long=1: swipe works`, await blocked(p, "d18"));
    ok(`${tag} long=1: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await c2.close(); }
  { const p = await open(ctx, "who=priya", errs); ok(`${tag} view only: dashed slot with no swipe or tap`, (await p.locator(".od[data-od-b]").count()) === 0 && (await p.locator(".od.ro, .sw.ro .od").count()) > 0); await p.close(); }
  { const p = await open(ctx, "ac=dull", errs); ok(`${tag} colour (156): the ?ac= switch and --nc are gone, the Not cooking edge is the muted grey of past days`, await p.evaluate(() => !document.body.dataset.ac && getComputedStyle(document.body).getPropertyValue("--nc").trim() === "" && (() => { const t = document.createElement("i"); t.style.color = "var(--muted)"; document.body.appendChild(t); const m = getComputedStyle(t).color; t.remove(); return [...document.querySelectorAll(".blk, .peek button")].length ? getComputedStyle(document.querySelector(".blk")).borderLeftColor === m : false; })())); await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
// mouse at 1280
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const errs = []; const p = await open(ctx, "", errs);
  await p.locator('.od[data-od-b="d18"]').scrollIntoViewIfNeeded(); const b = await p.locator('.od[data-od-b="d18"]').boundingBox();
  await p.mouse.move(b.x + 40, b.y + 20); await p.mouse.down(); await p.mouse.move(b.x + 120, b.y + 22, { steps: 6 }); await p.mouse.move(b.x + 220, b.y + 22, { steps: 6 }); await p.mouse.up(); await sleep(300);
  ok("mouse 1280: drag right on the open day sets Not cooking", await blocked(p, "d18")); await p.keyboard.press("z"); await sleep(150);
  await p.locator('.od[data-od-b="d18"]').focus(); await p.keyboard.press("Shift+X"); await sleep(200); ok("mouse 1280: Shift X on the focused open day", await blocked(p, "d18")); await p.keyboard.press("z"); await sleep(150);
  await p.locator('.od[data-od-b="d18"]').click(); await sleep(250); ok("mouse 1280: click opens the day with options", (await p.locator(".oa").count()) === 1);
  ok("mouse 1280: no page errors, no sideways scroll", errs.length === 0 && await S(p, "document.documentElement.scrollWidth <= innerWidth"), errs); await ctx.close(); }
await browser.close();
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} checks passed`); process.exit(fails ? 1 : 0);
