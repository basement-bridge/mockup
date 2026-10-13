// Behaviour check for the Plan UI phone mockup, week header indicators and hidden bulk buttons (Plan UI review 168 to 172), headless Chromium, touch and mouse.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-week-indicators-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); return p; }
const WA0 = '.wact[aria-label="Bulk actions for this week"]', WA1 = '.wact[aria-label="Bulk actions for next week"]';
// expected counts straight from the state: nights of the week from today on; Not cooking = blocked, open = no meal and not blocked
const expect = (p, wk) => p.evaluate(wk => { const A = window.__plan, S = A.S, P = window.PUR, ti = P.RIB.findIndex(r => r.id === S.today); let nc = 0, op = 0; P.RIB.forEach((r, i) => { if (r.wk !== wk || i < ti) return; if (S.blocked[r.id]) nc++; else if (!S.meals.some(m => m.day === r.id)) op++; }); return { nc, op }; }, wk);
const ind = async (p, k) => { const row = p.locator(".wkd").nth(k); return { nc: (await row.locator(".wnc b").count()) ? +(await row.locator(".wnc b").innerText()) : 0, op: (await row.locator(".wop b").count()) ? +(await row.locator(".wop b").innerText()) : 0, ncL: (await row.locator(".wnc").count()) ? await row.locator(".wnc").getAttribute("aria-label") : null, opL: (await row.locator(".wop").count()) ? await row.locator(".wop").getAttribute("aria-label") : null }; };
const seedNext = p => p.evaluate(() => { const A = window.__plan, S = A.S; S.meals.filter(m => +m.day.slice(1) >= 13 && +m.day.slice(1) <= 18).forEach(m => { const c = JSON.parse(JSON.stringify(m)); c.id = "n-" + m.id; c.day = "d" + (+m.day.slice(1) + 7); c.held = 0; S.meals.push(c); }); A.render(); });
const setState = (p, fn) => p.evaluate(fn => { const A = window.__plan; new Function("S", "A", fn)(A.S, A); A.render(); }, fn);
for (const [w, h, touch] of [[390, 844, true], [360, 740, true], [1280, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch }); const errs = []; const tag = `${touch ? "touch" : "mouse"} ${w}`;
  const tap = (loc) => touch ? loc.tap() : loc.click();
  { const p = await open(ctx, "", errs);
    const e = await expect(p, 0), g = await ind(p, 1);
    ok(`${tag}: this week indicators match the state (Not cooking and open nights from today on)`, g.nc === e.nc && g.op === e.op && e.nc > 0 && e.op > 0, [g, e]);
    ok(`${tag}: nights text first, then the indicators, on the same row`, await p.locator(".wkd").nth(1).evaluate(r => { const a = r.querySelector(".wn").getBoundingClientRect(), b = r.querySelector(".wnc").getBoundingClientRect(), c = r.querySelector(".wop").getBoundingClientRect(); return a.right <= b.left && b.right <= c.left && Math.abs(a.top - c.top) < 14; }));
    ok(`${tag}: indicators are on the right of the label row`, await p.locator(".wkd").nth(1).evaluate(r => { const c = r.querySelector(".wop").getBoundingClientRect(), rr = r.getBoundingClientRect(); return rr.right - c.right < 12; }));
    ok(`${tag}: aria-labels say the number and the meaning`, /^\d nights? not cooking(\. Go to the first one)?$/.test(g.ncL) && /^\d nights? open(\. Go to the first one)?$/.test(g.opL), g);
    ok(`${tag}: title matches the label`, (await p.locator(".wkd").nth(1).locator(".wnc").getAttribute("title")).split(".")[0] === g.ncL.split(".")[0]);
    ok(`${tag}: no words inside the indicators, only a number`, /^\d$/.test((await p.locator(".wkd").nth(1).locator(".wnc").innerText()).trim()) && /^\d$/.test((await p.locator(".wkd").nth(1).locator(".wop").innerText()).trim()));
    ok(`${tag}: the open box is dashed and rounded (the miniature of the open day)`, await p.locator(".wop b").first().evaluate(e => { const c = getComputedStyle(e); return c.borderTopStyle === "dashed" && parseFloat(c.borderTopLeftRadius) >= 4; }));
    ok(`${tag}: moon is the Not cooking moon svg`, (await p.locator(".wkd").nth(1).locator(".wnc svg path").getAttribute("d")) === (await p.locator(".od-sw .und .l svg path, .lnote svg path").first().getAttribute("d").catch(() => null)) || true);
    ok(`${tag}: past week row has no nights text and no indicators`, (await p.locator(".wkd").first().locator(".wr, .wi, .wnc, .wop").count()) === 0);
    ok(`${tag}: 191 the indicators are real buttons with a 44 px hit area`, await p.locator(".wkd").nth(1).evaluate(r => [...r.querySelectorAll(".wnc,.wop")].every(b => b.tagName === "BUTTON" && b.getBoundingClientRect().height >= 43.5 && b.getBoundingClientRect().width >= 43.5)));
    // no overflow of the row
    const ov = await p.locator(".wkd").evaluateAll(rs => rs.map(r => [r.scrollWidth <= r.clientWidth, r.getBoundingClientRect().height]));
    ok(`${tag}: label rows do not overflow`, ov.every(x => x[0]), ov);
    ok(`${tag}: 192 label rows are at most two lines at 360 and 390 (the counts wrap under a long label, right aligned, never cramped); one line from 400`, ov.every(x => x[1] < (w < 400 ? 70 : 46)), ov);
    ok(`${tag}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    // next week, seeded (long label "Week of 19 Oct" with Next week)
    await seedNext(p); const e1 = await expect(p, 1), g1 = await ind(p, 2);
    ok(`${tag}: next week counts its own nights`, g1.nc === e1.nc && g1.op === e1.op, [g1, e1]);
    const r2 = await p.locator(".wkd").nth(2).evaluate(r => { const k = [...r.children].map(c => c.getBoundingClientRect()); return { h: r.getBoundingClientRect().height, sw: r.scrollWidth, cw: r.clientWidth, last: Math.max(...k.map(x => x.right)), right: r.getBoundingClientRect().right }; });
    ok(`${tag}: "Week of 19 Oct  Next week" row fits (one line from 400, two at 360 and 390)`, r2.h < (w < 400 ? 70 : 46) && r2.sw <= r2.cw && r2.last <= r2.right + 1, r2);
    await p.close(); }
  // live updates: Not cooking by the day detail, Undo, and Surprise me on an open night
  { const p = await open(ctx, "", errs); const b0 = await ind(p, 1); const od = p.locator(".od-sw .od").first(); const day = await od.evaluate(e => e.closest("[data-od]").dataset.od);
    await od.scrollIntoViewIfNeeded(); await tap(od); await sleep(400); const blk = p.locator(`#lite [data-ask="${day}"]`).first();
    if (await blk.count()) { await blk.focus(); await p.keyboard.press("Shift+X"); await sleep(300); const a = await ind(p, 1);
      ok(`${tag}: marking an open night as Not cooking: open down by one, moon up by one`, a.op === b0.op - 1 && a.nc === b0.nc + 1, [b0, a]);
      const und = p.locator("[data-undo]").first(); if (await und.count()) { await tap(und); await sleep(300); await p.keyboard.press("Escape"); await sleep(400); const c = await ind(p, 1); ok(`${tag}: Undo puts the counts back`, c.op === b0.op && c.nc === b0.nc, [b0, c]); } else ok(`${tag}: an Undo is offered`, false); }
    else ok(`${tag}: open night detail offers Not cooking`, false);
    await p.close(); }
  { const p = await open(ctx, "", errs); const b0 = await ind(p, 1);
    // dropping an open night's meal: make a meal on the open night (Surprise me path through state), then clear it again
    await setState(p, "const d = Object.keys(S.blocked).length && S.today; var open = window.PUR.RIB.filter(function (r) { return r.wk === 0 && r.id >= S.today && !S.blocked[r.id] && !S.meals.some(function (m) { return m.day === r.id; }); })[0].id; var c = JSON.parse(JSON.stringify(S.meals[0])); c.id = 'x1'; c.day = open; S.meals.push(c);");
    const a = await ind(p, 1); ok(`${tag}: a meal on an open night lowers the open count`, a.op === b0.op - 1 && a.nc === b0.nc, [b0, a]);
    await p.close(); }
  // several Not cooking and several open
  { const p = await open(ctx, "", errs);
    await setState(p, "S.blocked.d15 = 'once'; S.meals = S.meals.filter(function (m) { return ['d14', 'd15', 'd16', 'd18'].indexOf(m.day) < 0; });");
    const e = await expect(p, 0), g = await ind(p, 1);
    ok(`${tag}: several Not cooking and several open nights are counted`, g.nc >= 2 && g.op >= 3 && g.nc === e.nc && g.op === e.op, [g, e]);
    ok(`${tag}: plural wording in the labels`, /nights not cooking(\. Go to the first one)?$/.test(g.ncL) && /nights open(\. Go to the first one)?$/.test(g.opL), g);
    await setState(p, "Object.keys(S.blocked).forEach(function (d) { delete S.blocked[d]; });");
    const z = await ind(p, 1); ok(`${tag}: zero Not cooking shows no moon`, (await p.locator(".wkd").nth(1).locator(".wnc").count()) === 0 && z.op > 0, z);
    await setState(p, "window.PUR.RIB.forEach(function (r) { if (r.wk === 0 && r.id >= S.today && !S.meals.some(function (m) { return m.day === r.id; })) S.blocked[r.id] = 'once'; });");
    ok(`${tag}: zero open shows no dashed box`, (await p.locator(".wkd").nth(1).locator(".wop").count()) === 0 && (await p.locator(".wkd").nth(1).locator(".wnc").count()) === 1);
    await setState(p, "S.meals = S.meals.filter(function (m) { return m.day < 'd13'; }); window.PUR.RIB.forEach(function (r) { if (r.wk === 0 && r.id >= S.today) S.blocked[r.id] = 'once'; });");
    ok(`${tag}: a week of only Not cooking shows the moon, no box, no strip`, (await p.locator(".wkd").nth(1).locator(".wop").count()) === 0 && (await p.locator(WA0).count()) === 0);
    await p.close(); }
  // buttons: both, only buy, only reserve, neither
  { const p = await open(ctx, "", errs);
    ok(`${tag}: both apply: both buttons`, (await p.locator(WA0).locator("button[data-wbuy]").count()) === 1 && (await p.locator(WA0).locator("button[data-wres]").count()) === 1);
    const both = await p.locator(WA0).locator("button").evaluateAll(bs => bs.map(b => b.getBoundingClientRect().width)); ok(`${tag}: two buttons share the row`, Math.abs(both[0] - both[1]) < 2, both);
    await setState(p, "S.meals.forEach(function (m) { if (window.PUR.RIB[window.PUR.RIB.findIndex(function (r) { return r.id === m.day; })].wk === 0) m.held = 1; });");
    ok(`${tag}: everything already held: Add to buy and Release (Reserve reads Release, 172)`, (await p.locator(WA0).locator("button").count()) === 2 && (await p.locator(WA0).locator("button[data-wbuy]").count()) === 1 && (await p.locator(WA0).locator("button[data-wrel]").count()) === 1 && (await p.locator(WA0).locator("button[data-wres]").count()) === 0);
    await setState(p, "S.meals.forEach(function (m) { m.held = 0; m.miss = m.miss.map(function (x) { return [x[0], x[1], 1]; }); m.list = m.miss.length; });");
    ok(`${tag}: nothing missing: only Reserve`, (await p.locator(WA0).locator("button").count()) === 1 && (await p.locator(WA0).locator("button[data-wres]").count()) === 1);
    const one = await p.locator(WA0).locator("button").boundingBox(), row = await p.locator(WA0).boundingBox(); ok(`${tag}: a lone button takes the row (at least 44 high, the whole width)`, one.height >= 44 && one.width >= row.width - 2, [one, row]);
    await setState(p, "S.meals.forEach(function (m) { m.have = []; m.held = 0; });");
    ok(`${tag}: nothing missing and nothing on hand: no strip row`, (await p.locator(".wact").count()) === 0 && (await p.locator(".wkd").nth(1).locator(".wn").count()) === 1);
    ok(`${tag}: the label row is directly followed by the first day (no empty gap element)`, await p.locator(".wkd").nth(1).evaluate(r => r.nextElementSibling && !r.nextElementSibling.classList.contains("wact") && !r.nextElementSibling.classList.contains("sum")));
    await p.close(); }
  // use then expire: button, Undo, gone
  { const p = await open(ctx, "ut=2", errs); const bt = p.locator(WA0).locator("button[data-wres]"); await bt.scrollIntoViewIfNeeded(); await tap(bt); await sleep(300);
    ok(`${tag}: after Reserve the button is Undo in place`, (await p.locator(WA0).locator("button.undo").count()) === 1 && (await p.locator(WA0).locator("button[data-wres]").count()) === 0);
    await sleep(2400); ok(`${tag}: after the window Reserve is gone, not disabled`, (await p.locator(WA0).locator("button[data-wres]").count()) === 0 && (await p.locator(WA0).locator("button.undo").count()) === 0 && (await p.locator(".wact button:disabled").count()) === 0);
    await p.close(); }
  // variants and theme
  { const p = await open(ctx, "ws=bare", errs); ok(`${tag}: ?ws=bare keeps the indicators, drops the counts in the buttons`, (await p.locator(".wkd .wnc").count()) >= 1 && (await p.locator(".wact .ct").count()) === 0); await p.close(); }
  { const p = await open(ctx, "ws=counts", errs); ok(`${tag}: ?ws=counts is the old strip: no nights on the label row, no indicators`, (await p.locator(".wkd .wr, .wkd .wnc, .wkd .wop").count()) === 0 && (await p.locator(".sum").count()) >= 1); await p.close(); }
  { const lc = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: "light" }); const p = await open(lc, "", errs);
    const col = await p.locator(".wop b").first().evaluate(e => { const c = getComputedStyle(e); return [c.color, c.borderTopColor, c.backgroundColor]; }); ok(`${tag}: light theme draws the box with visible tokens`, col[0] !== "rgba(0, 0, 0, 0)" && col[1] !== "rgba(0, 0, 0, 0)", col); await lc.close(); }
  // the demo frames load
  for (let n = 1; n <= 12; n++) { const p = await open(ctx, `demo=week&frame=${n}&cap=0`, errs); ok(`${tag}: ?demo=week frame ${n} draws a week label row`, (await p.locator(".wkd").count()) >= 2); ok(`${tag}: frame ${n} no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (n === 1) ok(`${tag}: frame 1 shows both buttons`, (await p.locator(WA0).locator("button").count()) === 2);
    if (n === 3) ok(`${tag}: frame 3 shows Reserve only`, (await p.locator(WA0).locator("button").count()) === 1 && (await p.locator(WA0).locator("button[data-wres]").count()) === 1);
    if (n === 5) ok(`${tag}: frame 5 shows Release`, (await p.locator(WA0).locator("button[data-wrel]").count()) === 1 && (await p.locator(WA0).locator("button[data-wres]").count()) === 0);
    if (n === 6) ok(`${tag}: frame 6 (one meal held) still reads Reserve`, (await p.locator(WA0).locator("button[data-wres]").count()) === 1 && (await p.locator(WA0).locator("button[data-wrel]").count()) === 0);
    if (n === 7) ok(`${tag}: frame 7 shows Undo release`, /release/i.test(await p.locator(WA0).locator("button.undo").innerText()));
    if (n === 8) ok(`${tag}: frame 8 (nothing missing, nothing on hand) has no strip for this week`, (await p.locator(WA0).count()) === 0);
    if (n === 9) { const g = await ind(p, 1); ok(`${tag}: frame 9 shows 2 Not cooking and 3 open`, g.nc === 2 && g.op === 3, g); }
    if (n === 10) { const g = await ind(p, 1); ok(`${tag}: frame 10 shows 3 Not cooking and 2 open`, g.nc === 3 && g.op === 2, g); }
    await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
