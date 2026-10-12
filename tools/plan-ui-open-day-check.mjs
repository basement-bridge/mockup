// Behaviour check for the Plan UI phone mockup, open day (Plan UI review 147 to 153), headless Chromium, touch and mouse.
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
  // auto expiry and moving on
  { const p = await open(ctx, "ut=3", errs); const c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(ctx, p, c.x - 60, c.y, 160);
    ok(`${tag} B: blocked`, await blocked(p, "d18")); await sleep(3600);
    ok(`${tag} B: the Undo expires by itself`, (await p.locator("[data-undo]").count()) === 0 && await blocked(p, "d18"));
    await S(p, "window.scrollTo(0, 0)"); await sleep(600); await S(p, "window.__plan.follow(true)"); await sleep(100);
    ok(`${tag} B: the Not cooking tile hides once you move on (92, 96)`, await p.locator("#d-d18.hid").count() === 1);
    await p.close(); }
  // D. the bug: tapping the Not cooking tile
  { const p = await open(ctx, "", errs); const oa = () => p.locator(".oa").count();
    await p.locator('.od[data-od-b="d18"]').scrollIntoViewIfNeeded(); await p.locator('.od[data-od-b="d18"]').tap(); await sleep(300);
    ok(`${tag} D: tapping an open day opens its detail with Ask AI, Surprise me, Not cooking`, (await oa()) === 1 && (await p.locator(".oa button").count()) === 3);
    await p.locator('[data-block="d18"]').tap(); await sleep(300); ok(`${tag} D: Not cooking from the detail`, await blocked(p, "d18"));
    ok(`${tag} D: Mark as open is offered under the Not cooking day`, (await p.locator(".mko").count()) === 1);
    await sleep(500); await p.locator('[data-unblock="d18"]').first().tap(); await sleep(300);
    ok(`${tag} D: tapping the tile reopens the night and shows the options`, !(await blocked(p, "d18")) && (await oa()) === 1);
    // a second touch on the same spot straight away must not toggle it back
    await p.locator('[data-block="d18"]').tap(); await sleep(300);
    ok(`${tag} D: a double tap does not mark it Not cooking again (guard)`, !(await blocked(p, "d18")) && (await oa()) === 1);
    for (let i = 0; i < 6; i++) { await sleep(3000); if ((await oa()) !== 1) break; if (i === 2) { await S(p, "window.dispatchEvent(new Event('resize')); window.scrollBy(0, 40)"); } }
    ok(`${tag} D: the options are still there after 18 s, a resize and a scroll, past the undo expiry`, (await oa()) === 1 && (await S(p, "window.__plan.S.ustk.length")) === 0, await S(p, "window.__plan.S.dday"));
    await p.locator('[data-close]').first().tap(); await sleep(300); ok(`${tag} D: the x closes it`, (await oa()) === 0);
    await p.close(); }
  // D2. from the plain week: swipe, tap the revealed tile
  { const p = await open(ctx, "", errs); let c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(ctx, p, c.x - 60, c.y, 160);
    await sleep(500); await p.locator('#d-d18 [data-unblock]').tap(); await sleep(300);
    ok(`${tag} D: the Not cooking tile in the plain week reopens the night and docks the day with its options`, !(await blocked(p, "d18")) && (await p.locator(".oa").count()) === 1 && (await S(p, "window.__plan.S.dday")) === "d18");
    await sleep(15500); ok(`${tag} D: and they stay`, (await p.locator(".oa").count()) === 1);
    await p.keyboard.press("Shift+X"); await sleep(200); ok(`${tag} D: Shift X from the day's detail sets Not cooking`, await blocked(p, "d18"));
    await p.close(); }
  // reduced motion, long list, past day, view only, ac
  { const c2 = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, reducedMotion: "reduce" }); const p = await open(c2, "long=1", errs);
    const c = await center(p, '.od[data-od-b="d18"]'); await touchSwipe(c2, p, c.x - 60, c.y, 160); ok(`${tag} reduced motion + long=1: swipe works`, await blocked(p, "d18"));
    ok(`${tag} long=1: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await c2.close(); }
  { const p = await open(ctx, "who=priya", errs); ok(`${tag} view only: dashed slot with no swipe or tap`, (await p.locator(".od[data-od-b]").count()) === 0 && (await p.locator(".od.ro, .sw.ro .od").count()) > 0); await p.close(); }
  { const a = await open(ctx, "ac=dull", errs), n = await open(ctx, "ac=normal", errs);
    const v = async p => p.evaluate(() => getComputedStyle(document.body).getPropertyValue("--nc").trim());
    const dv = await v(a), nv = await v(n); ok(`${tag} ac: dull and normal differ`, dv !== nv && dv.includes("color-mix"), [dv, nv]); await a.close(); await n.close(); }
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
