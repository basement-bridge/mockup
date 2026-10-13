// Behaviour check for the Plan UI phone mockup, who can act and the view-only look (Plan UI review 190, owner-stated 13 Oct 2026), headless Chromium, touch and mouse, dark and light.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-scope-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); return p; }
const S = (p, f) => p.evaluate(f);
const snap = p => S(p, "JSON.stringify([window.__plan.S.meals.map(m => m.id + m.day), window.__plan.S.blocked])");
async function swipe(ctx, p, touch, x, y, dx) { if (!touch) { await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(x + dx * i / 8, y); await sleep(15); } await p.mouse.up(); return; }
  const c = await ctx.newCDPSession(p); const t = (type, xx) => c.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: xx, y, id: 1 }] }); await t("touchStart", x); for (let i = 1; i <= 8; i++) { await t("touchMove", x + dx * i / 8); await sleep(15); } await t("touchEnd", x + dx); }
async function hold(ctx, p, touch, x, y, ms) { if (!touch) { await p.mouse.move(x, y); await p.mouse.down(); await sleep(ms); await p.mouse.up(); return; } const c = await ctx.newCDPSession(p); await c.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] }); await sleep(ms); await c.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); }
const center = async (p, sel) => { await p.locator(sel).first().scrollIntoViewIfNeeded(); const b = await p.locator(sel).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
// WCAG contrast of an element's text or icon colour against what is behind it, with the element's own and its parents' opacity applied
const contrast = (p, sel) => p.evaluate(sel => {
  const el = document.querySelector(sel); const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  let op = 1, n = el; while (n && n.nodeType === 1) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
  let bgEl = el.parentElement, bg = { r: 0, g: 0, b: 0, a: 0 }; while (bgEl) { const c = parse(getComputedStyle(bgEl).backgroundColor); if (c.a > 0) { bg = c; break; } bgEl = bgEl.parentElement; }
  const pg = parse(getComputedStyle(document.body).backgroundColor); const base = pg.a > 0 ? pg : { r: 255, g: 255, b: 255 };
  const under = bg.a > 0 ? bg : base; const f = parse(getComputedStyle(el).color), mix = (a, b, k) => a * k + b * (1 - k);
  const fg = { r: mix(f.r, under.r, op * f.a), g: mix(f.g, under.g, op * f.a), b: mix(f.b, under.b, op * f.a) }, L = c => { const u = [c.r, c.g, c.b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * u[0] + .7152 * u[1] + .0722 * u[2]; };
  const a = L(fg), b = L(under); return +((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2); }, sel);

for (const scheme of ["dark", "light"]) for (const [w, h, touch] of scheme === "dark" ? [[390, 844, true], [360, 740, true], [1280, 900, false]] : [[390, 844, true], [1280, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme }); const errs = []; const tag = `${scheme} ${touch ? "touch" : "mouse"} ${w}`;
  const tap = loc => touch ? loc.tap() : loc.click();
  // Mine and Everyone (the household plan): open nights and Not cooking nights are interactive
  for (const who of ["mine", "everyone"]) {
    const p = await open(ctx, who === "mine" ? "" : "who=everyone", errs);
    ok(`${tag} ${who}: no eye, no dim on the person's own or the household plan`, (await p.locator(".vo, .vonly").count()) === 0);
    const od = p.locator('.od[data-od-b="d18"]'); await od.scrollIntoViewIfNeeded(); await tap(od); await sleep(450);
    ok(`${tag} ${who}: an open night opens the light card (Ask AI and Surprise me)`, (await p.locator("#lite [data-ask]").count()) === 1 && (await p.locator("#lite [data-surprise]").count()) === 1);
    await p.keyboard.press("Escape"); await sleep(200);
    const c = await center(p, '.od[data-od-b="d18"]'); await swipe(ctx, p, touch, c.x - 60, c.y, 160); await sleep(250);
    ok(`${tag} ${who}: the right swipe marks an open night Not cooking`, await S(p, "!!window.__plan.S.blocked.d18"));
    await p.keyboard.press("z"); await sleep(150);
    await p.close(); const p2 = await open(ctx, "nc=show" + (who === "mine" ? "" : "&who=everyone"), errs); const blk = p2.locator('.blk[data-openday="d17"]'); await blk.scrollIntoViewIfNeeded(); await tap(blk); await sleep(450);
    ok(`${tag} ${who}: a Not cooking night opens the light card too (same rule)`, (await p2.locator("#lite .mko").count()) === 1);
    ok(`${tag} ${who}: Copy last week and Clear week are offered`, (await p2.locator(".hd [data-copy]").count()) === 1 && (await p2.locator(".hd [data-clearw]").count()) === 1);
    ok(`${tag} ${who}: no sideways scroll`, await S(p2, "document.documentElement.scrollWidth <= innerWidth")); await p2.close();
  }
  // Another person's view: view only, eye and dim
  for (const who of ["priya", "jane"]) {
    const p = await open(ctx, "who=" + who, errs); const name = who[0].toUpperCase() + who.slice(1); const before = await snap(p);
    const eyes = await p.locator(".vo").count(), vtiles = await p.locator(".pw-day:not(.past) .mc.vonly").count(), vboxes = await p.locator(".pw-day:not(.past) .od.vonly, .pw-day:not(.past) .nite.vonly, .pw-day:not(.past) .blk.vonly").count();
    ok(`${tag} ${who}: every non-past tile and box has exactly one eye`, eyes === vtiles + vboxes && eyes > 5, { eyes, vtiles, vboxes });
    ok(`${tag} ${who}: the eye is an svg drawn like the moon (24 grid, stroke 2, round caps), not an emoji`, await p.locator(".vo").first().evaluate(e => { const s = e.querySelector("svg"), m = document.querySelector(".wnc svg"); return !!s && e.textContent.trim() === "" && s.getAttribute("viewBox") === "0 0 24 24" && s.getAttribute("stroke-width") === "2" && s.getAttribute("stroke-linecap") === "round" && s.getAttribute("stroke-linejoin") === "round" && (!m || (m.getAttribute("stroke-width") === "2" && m.getAttribute("stroke-linecap") === "round")); }));
    ok(`${tag} ${who}: the eye is not the moon and the week counts are unchanged in look`, await S(p, "(function () { var e = document.querySelector('.vo svg path'), m = document.querySelector('.wnc svg path'); return !!e && !!m && e.getAttribute('d') !== m.getAttribute('d') && !document.querySelector('.wkd .vo'); })()"));
    ok(`${tag} ${who}: the tile is dimmed a little (0.7 to 0.9)`, await p.locator(".pw-day:not(.past) .mc.vonly").first().evaluate(e => { const o = parseFloat(getComputedStyle(e).opacity); return o >= .7 && o <= .9; }));
    ok(`${tag} ${who}: the box and the Not cooking tile are dimmed the same way`, await p.locator(".od.vonly").first().evaluate(e => { const o = parseFloat(getComputedStyle(e).opacity); return o >= .7 && o <= .9; }));
    ok(`${tag} ${who}: accessible label says view only and whose plan`, (await p.locator(".od.vonly").first().getAttribute("aria-label")).toLowerCase().includes(`view only, ${who}'s plan`) && (await p.locator(".pw-day:not(.past) .mc.vonly").first().getAttribute("aria-label")).toLowerCase().includes(`view only, ${who}'s plan`), [await p.locator(".od.vonly").first().getAttribute("aria-label")]);
    ok(`${tag} ${who}: the eye itself is hidden from screen readers (the tile says it), with a tooltip`, await p.locator(".vo").first().evaluate(e => e.getAttribute("aria-hidden") === "true" && /View only/.test(e.title)));
    ok(`${tag} ${who}: past days keep their grey and have no eye`, (await p.locator(".pw-day.past .vo").count()) === 0 && (await p.locator(".pw-day.past .mc").count()) > 0 && await p.locator(".pw-day.past .mc").first().evaluate(e => getComputedStyle(e).filter.includes("grayscale")));
    ok(`${tag} ${who}: the eye is 3:1 or better against its tile (non-text contrast)`, (await contrast(p, ".pw-day:not(.past) .mc.vonly .vo")) >= 3, await contrast(p, ".pw-day:not(.past) .mc.vonly .vo"));
    ok(`${tag} ${who}: the dimmed title is 4.5:1 or better`, (await contrast(p, ".pw-day:not(.past) .mc.vonly h3")) >= 4.5, await contrast(p, ".pw-day:not(.past) .mc.vonly h3"));
    ok(`${tag} ${who}: the eye over an open box is 3:1 or better`, (await contrast(p, ".od.vonly .vo")) >= 3, await contrast(p, ".od.vonly .vo"));
    // no action of any kind
    ok(`${tag} ${who}: no card, no swipe slot, no open-night button, no Not cooking button`, (await p.locator("[data-od-b], [data-openday], [data-unblock], [data-block]").count()) === 0 && (await p.locator(".blk:not([disabled])").count()) === 0 && (await p.locator("#lite").count()) === 0);
    const od = p.locator(".od.vonly").first(); await od.scrollIntoViewIfNeeded(); await tap(od).catch(() => { }); await sleep(300);
    ok(`${tag} ${who}: tapping an open box opens nothing`, (await p.locator("#lite").count()) === 0 && (await S(p, "window.__plan.S.dday")) === null);
    let c = await center(p, ".od.vonly"); await swipe(ctx, p, touch, c.x - 60, c.y, 160); await sleep(250);
    ok(`${tag} ${who}: a swipe on an open box does nothing`, (await snap(p)) === before);
    const tl = p.locator(".pw-day:not(.past) .mc.vonly").first(); await tl.scrollIntoViewIfNeeded(); c = await center(p, ".pw-day:not(.past) .mc.vonly");
    await swipe(ctx, p, touch, c.x - 60, c.y, 160); await sleep(250); await swipe(ctx, p, touch, c.x + 60, c.y, -160); await sleep(250);
    ok(`${tag} ${who}: swipes right and left on a tile do nothing`, (await snap(p)) === before && (await p.locator(".mc.drag").count()) === 0);
    await p.keyboard.press("Escape"); await sleep(250); /* a mouse drag ends in a click, which only opens the view-only detail */ await tl.scrollIntoViewIfNeeded(); c = await center(p, ".pw-day:not(.past) .mc.vonly");
    await hold(ctx, p, touch, c.x, c.y, 700); await sleep(200);
    ok(`${tag} ${who}: press and hold does not lift the tile`, (await p.locator(".mc.hold, .hand, .lifted").count()) === 0 && (await S(p, "!window.__plan.S.carry")) && (await snap(p)) === before);
    await p.keyboard.press("Escape"); await sleep(250); await tl.scrollIntoViewIfNeeded();
    await tl.focus(); await p.keyboard.press("Shift+X"); await p.keyboard.press("x"); await p.keyboard.press("h"); await sleep(200);
    ok(`${tag} ${who}: X, Shift X and H on a tile do nothing`, (await snap(p)) === before);
    ok(`${tag} ${who}: Copy last week, Clear week and the bulk strip are not drawn`, (await p.locator(".hd [data-copy], .hd [data-clearw], .hd .cpy, .wact").count()) === 0);
    ok(`${tag} ${who}: the view-only banner is still there`, (await p.locator(".rol").innerText()).includes(`${name}'s plan: view only`));
    const eyeBox = await p.locator(".pw-day:not(.past) .mc.vonly .vo").first().boundingBox(), tb = await tl.boundingBox(); ok(`${tag} ${who}: the eye sits inside its tile and is at least 14 px`, eyeBox.x >= tb.x && eyeBox.x + eyeBox.width <= tb.x + tb.width && eyeBox.y >= tb.y && eyeBox.width >= 14, [eyeBox, tb]);
    ok(`${tag} ${who}: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await p.close();
  }
  // Past nights are never interactive
  { const p = await open(ctx, "", errs); const before = await snap(p);
    ok(`${tag} past: no open box, no Not cooking button, no card trigger on any past day`, (await p.locator(".pw-day.past .od, .pw-day.past [data-openday], .pw-day.past [data-od-b], .pw-day.past [data-unblock], .pw-day.past .blk").count()) === 0 && (await p.locator(".pw-day.past .empty.past").count()) >= 1);
    const c = await center(p, ".pw-day.past .mc"); await swipe(ctx, p, touch, c.x + 60, c.y, -160); await sleep(250);
    ok(`${tag} past: a left swipe (replan) does nothing on a past tile`, (await snap(p)) === before);
    const tl = p.locator(".pw-day.past .mc").first(); await tl.focus(); await p.keyboard.press("Shift+X"); await p.keyboard.press("x"); await sleep(200);
    ok(`${tag} past: X and Shift X do nothing on a past tile`, (await snap(p)) === before);
    await p.keyboard.press("Shift+X"); ok(`${tag} past: nothing was changed`, (await snap(p)) === before);
    // copy forward from a past tile is the one thing kept: it makes a new meal on a coming day, it does not change the past
    ok(`${tag} past: past tiles keep the grey and the copy-forward hint only`, (await tl.getAttribute("aria-label")).includes("Past, read only. Swipe right: copy forward."));
    await p.close(); }
  // the filter: Mine, Everyone (the household plan) and named members; there is no option called Household
  { const p = await open(ctx, "", errs); await tap(p.locator("[data-fmenu]")); await sleep(250); const items = await p.locator(".dd .it").allInnerTexts();
    ok(`${tag} filter: Mine and Everyone (sub-label "the household plan") exist; no option is literally called Household`, items.some(t => /^Mine/.test(t)) && items.some(t => /^Everyone/.test(t) && /household plan/.test(t)) && !items.some(t => /^Household/.test(t)), items);
    ok(`${tag} filter: named members are labelled view only`, /other members: view only/i.test(await p.locator(".dd").innerText())); await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
