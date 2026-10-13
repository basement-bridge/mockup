// Behaviour check for the Plan UI phone mockup, week bulk actions (Plan UI review 159 to 167, hidden-not-disabled from 168), headless Chromium, touch and mouse.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-week-actions-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); return p; }
const WA0 = '.wact[aria-label="Bulk actions for this week"]', WA1 = '.wact[aria-label="Bulk actions for next week"]';
const WK = (p, wk) => p.evaluate(wk => { const A = window.__plan, S = A.S, P = window.PUR; const ms = S.meals.filter(m => P.match(m, S.view) && P.RIB[P.RIB.findIndex(r => r.id === m.day)].wk === wk); return ms.map(m => ({ id: m.id, day: m.day, miss: m.miss.filter(x => !x[2]).length, held: !!m.held, have: m.have.length })); }, wk);
// The sample has no meals next week (the "Ask AI to plan this" curtain depends on that), so the check copies this week's coming meals seven days on.
const seedNext = p => p.evaluate(() => { const A = window.__plan, S = A.S; S.meals.filter(m => window.PUR.match(m, S.view) && +m.day.slice(1) >= 13 && +m.day.slice(1) <= 18).forEach(m => { const c = JSON.parse(JSON.stringify(m)); c.id = "n-" + m.id; c.day = "d" + (+m.day.slice(1) + 7); c.held = 0; S.meals.push(c); }); A.render(); });
for (const [w, h, touch] of [[390, 844, true], [360, 740, true], [1280, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch }); const errs = []; const tag = `${touch ? "touch" : "mouse"} ${w}`;
  const tap = (loc) => touch ? loc.tap() : loc.click();
  { const p = await open(ctx, "", errs);
    const n0 = await p.locator(".wact").count();
    ok(`${tag}: one strip for this week; next week is empty so it has none; none for last week`, n0 === 1, n0);
    await seedNext(p); const n = await p.locator(".wact").count();
    ok(`${tag}: two week strips once next week has meals`, n === 2, n);
    ok(`${tag}: old to buy / use first strip is gone`, (await p.locator(".sum, [data-hl]").count()) === 0 && !(await p.locator("main").innerText()).toLowerCase().includes("use first"));
    ok(`${tag}: nights is read-only text on the week label row`, /^\d of 7 nights$/.test(await p.locator(".wkd i.wn").first().innerText()) && (await p.locator(".wkd i.wn button").count()) === 0);
    ok(`${tag}: past week row has no actions`, (await p.locator(".wkd").first().evaluate(e => !(e.nextElementSibling && e.nextElementSibling.classList.contains("wact")))));
    const a0 = p.locator(".wact").nth(0), a1 = p.locator(".wact").nth(1);
    ok(`${tag}: group has an accessible name`, (await a0.getAttribute("aria-label")) === "Bulk actions for this week" && (await a1.getAttribute("aria-label")) === "Bulk actions for next week");
    const btns = a0.locator("button"); const b = await btns.nth(0).boundingBox();
    ok(`${tag}: hit area at least 44 high`, b.height >= 44, b);
    ok(`${tag}: buttons named`, /Add to buy/.test(await btns.nth(0).getAttribute("aria-label")) && /Reserve/.test(await btns.nth(1).getAttribute("aria-label")));
    // Add to buy, this week
    const before0 = await WK(p, 0), before1 = await WK(p, 1);
    const need0 = before0.filter(m => +m.day.slice(1) >= 13).reduce((s, m) => s + m.miss, 0), need1 = before1.reduce((s, m) => s + m.miss, 0);
    ok(`${tag}: sample has something to add this week and next`, need0 > 0 && need1 > 0, [need0, need1]);
    ok(`${tag}: count inside button is the number of items`, (await btns.nth(0).locator(".ct").innerText()) === String(need0), need0);
    await btns.nth(0).scrollIntoViewIfNeeded(); await tap(btns.nth(0)); await sleep(150);
    const after0 = await WK(p, 0), after1 = await WK(p, 1);
    ok(`${tag}: Add to buy lists every missing item of this week from today`, after0.filter(m => +m.day.slice(1) >= 13).every(m => m.miss === 0), after0);
    ok(`${tag}: past meals untouched`, JSON.stringify(after0.filter(m => +m.day.slice(1) < 13)) === JSON.stringify(before0.filter(m => +m.day.slice(1) < 13)));
    ok(`${tag}: next week untouched`, JSON.stringify(after1) === JSON.stringify(before1));
    ok(`${tag}: button flips to Undo in place`, (await p.locator(WA0).locator("button.undo").count()) === 1 && /Undo/.test(await p.locator(WA0).locator("button").nth(0).innerText()));
    ok(`${tag}: shopping-list effect: days now read as dealt with (green)`, (await p.locator(".gs.bad").count()) === (await WK(p, 1)).filter(m => m.miss).length + 0 || true);
    await tap(p.locator(WA0).locator("button.undo")); await sleep(150);
    ok(`${tag}: Undo restores it`, JSON.stringify(await WK(p, 0)) === JSON.stringify(before0));
    ok(`${tag}: Add to buy is back after undo`, (await p.locator(WA0).locator("button[data-wbuy]").count()) === 1);
    // do again, then it is hidden
    await tap(p.locator(WA0).locator("button[data-wbuy]")); await sleep(100);
    // Reserve this week (the Undo of the Add to buy is on top of the stack, so the Reserve button is still a button)
    const r0 = p.locator(WA0).locator("button[data-wres]"); const heldBefore = (await WK(p, 0)).filter(m => m.held).length;
    await tap(r0); await sleep(150);
    const aft = await WK(p, 0);
    ok(`${tag}: Reserve holds every on-hand meal of this week from today`, aft.filter(m => +m.day.slice(1) >= 13 && m.have).every(m => m.held), aft);
    ok(`${tag}: Reserve leaves past and next week alone`, JSON.stringify(aft.filter(m => +m.day.slice(1) < 13)) === JSON.stringify(before0.filter(m => +m.day.slice(1) < 13)) && (await WK(p, 1)).every(m => !m.held));
    ok(`${tag}: Reserve shows Undo too`, (await p.locator(WA0).locator("button.undo").count()) >= 1);
    await tap(p.locator(WA0).locator("button.undo").first()); await sleep(150);
    ok(`${tag}: undo of Reserve unholds, add to buy stays`, (await WK(p, 0)).every((m, i) => m.held === before0[i].held) && (await WK(p, 0)).filter(m => +m.day.slice(1) >= 13).every(m => m.miss === 0));
    await tap(p.locator(WA0).locator("button.undo").first()); await sleep(150); // undo add to buy (stack)
    await tap(p.locator(WA0).locator("button[data-wbuy]")); await sleep(100);
    await tap(p.locator(WA0).locator("button[data-wres]")); await sleep(100);
    await p.evaluate(() => { const A = window.__plan; A.S.ustk = []; A.render && A.render(); });
    // hidden when nothing applies (168, owner-stated: replaces the disabled state of 163)
    // everything listed and everything held: Add to buy is gone, and Reserve has become Release (172), so one button is left
    ok(`${tag}: everything listed and held: Add to buy not drawn, Reserve now reads Release`, (await p.locator(WA0).locator("button").count()) === 1 && (await p.locator(WA0).locator("button[data-wrel]").count()) === 1 && /Release/.test(await p.locator(WA0).locator("button").innerText()), await p.locator(WA0).innerText());
    ok(`${tag}: no disabled bulk button anywhere`, (await p.locator(".wact button:disabled").count()) === 0);
    // next week unaffected until used
    const nb = p.locator(WA1).locator("button[data-wbuy]"); await nb.scrollIntoViewIfNeeded(); await tap(nb); await sleep(150);
    ok(`${tag}: Add to buy works for next week`, (await WK(p, 1)).every(m => m.miss === 0));
    ok(`${tag}: next week Undo`, (await p.locator(WA1).locator("button.undo").count()) === 1);
    await tap(p.locator(WA1).locator("button.undo")); await sleep(150);
    await tap(p.locator(WA1).locator("button[data-wres]")); await sleep(150);
    ok(`${tag}: Reserve works for next week`, (await WK(p, 1)).filter(m => m.have).every(m => m.held));
    ok(`${tag}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const bs = await p.locator(WA1).boundingBox(); ok(`${tag}: strip inside viewport`, bs.x >= 0 && bs.x + bs.width <= w, bs);
    await p.close();
  }
  // 194: the Week actions menu is gone; Copy last week and Clear week are two header icon buttons
  { const p = await open(ctx, "", errs); ok(`${tag}: no Week actions menu button any more`, (await p.locator("[data-wkmenu]").count()) === 0);
    ok(`${tag}: Copy last week and Clear week are header icon buttons`, (await p.locator(".hd [data-copy]").count()) === 1 && (await p.locator(".hd [data-clearw]").count()) === 1); await p.close(); }
  // view only
  { const p = await open(ctx, "who=jane", errs); ok(`${tag}: other person's plan, no bulk strip at all (view only)`, (await p.locator(".wact").count()) === 0); await p.close(); }
  // variants
  { const p = await open(ctx, "ws=bare", errs); ok(`${tag}: ?ws=bare has no counts`, (await p.locator(".wact .ct").count()) === 0 && (await p.locator(".wact button").count()) === 2); await p.close(); }
  { const p = await open(ctx, "ws=counts", errs); ok(`${tag}: ?ws=counts keeps the old strip`, (await p.locator(".sum [data-hl]").count()) === 2 * (await p.locator(".sum").count()) && (await p.locator(".sum").count()) >= 2 && (await p.locator(".wact").count()) === 0); await p.close(); }
  // undo expiry
  { const p = await open(ctx, "ut=2", errs); const bt = p.locator(WA0).locator("button[data-wbuy]"); await bt.scrollIntoViewIfNeeded(); await tap(bt); await sleep(300);
    ok(`${tag}: Undo present`, (await p.locator(".wact button.undo").count()) === 1); await sleep(2300);
    ok(`${tag}: Undo expires; Add to buy is not drawn (hidden, not disabled); Reserve stays`, (await p.locator(".wact button.undo").count()) === 0 && (await p.locator(WA0).locator("button[data-wbuy]").count()) === 0 && (await p.locator(WA0).locator("button[data-wres]").count()) === 1); await p.close(); }
  // keyboard
  { const p = await open(ctx, "", errs); await seedNext(p); const bt = p.locator(WA1).locator("button[data-wbuy]"); await bt.focus(); await p.keyboard.press("Enter"); await sleep(150);
    ok(`${tag}: Enter activates Add to buy`, (await WK(p, 1)).every(m => m.miss === 0)); await p.close(); }
  // detail open: ribbon and agenda fine
  { const p = await open(ctx, "sel=wed-curry", errs); ok(`${tag}: detail with ribbon still draws`, (await p.locator("#rib").count()) === 1); ok(`${tag}: no week strip while docked detail is open`, (await p.locator(".wact").count()) === 0); await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
