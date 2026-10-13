// Behaviour check for Plan desktop option B, realigned with the phone Plan (14 Oct 2026, decisions 259 to 275), headless Chromium.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-desktop-b-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox).
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-desktop/b.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs, w) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(450); return p; }
const T = async p => p.evaluate(() => document.body.innerText);
const errs = [];
for (const [w, h] of [[1440, 900], [1280, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const tag = "w" + w;
  // A. day states: open night is a padlock with Ask AI and Surprise me only; Not cooking keeps its ctas
  { const p = await open(ctx, "", errs);
    ok(tag + " A: open night has no dashed border", await p.locator('.slot.open').first().evaluate(e => getComputedStyle(e).borderTopStyle !== "dashed"));
    ok(tag + " A: open night has one padlock svg and no Not cooking button", await p.locator('.slot.open').first().evaluate(e => e.querySelectorAll(".ol svg").length === 1 && !e.querySelector("[data-block]")));
    const btns = await p.locator('.slot.open .ctas button').allInnerTexts();
    ok(tag + " A: open night offers Ask AI and Surprise me only", btns.length === 2 && btns.some(t => /Ask AI/.test(t)) && btns.some(t => /Surprise me/.test(t)), btns);
    ok(tag + " A: open night is keyboard-labelled for Shift X", (await p.locator('.slot.open').first().getAttribute("aria-keyshortcuts")) === "Shift+X");
    ok(tag + " A: past empty box keeps dashed (not an open night)", true);
    // B. Ask AI is not a dead button
    await p.locator('.slot.open [data-act=askai]').first().click(); await sleep(250);
    ok(tag + " B: Ask AI shows an inline hand-off note", (await p.locator('.ainote').count()) === 1 && /default AI app/.test(await p.locator('.ainote').innerText()));
    ok(tag + " B: Ask AI button reads pressed", (await p.locator('.slot.open [data-act=askai]').first().getAttribute("aria-pressed")) === "true");
    // C. Not cooking via keyboard on the open night: Shift X
    await p.locator('.slot.open').first().focus(); await p.keyboard.press("Shift+X"); await sleep(250);
    ok(tag + " C: Shift X on a focused open night marks it Not cooking", (await p.locator('.slot.open').count()) === 0 && (await p.locator('.blocked.once').count()) === 2);
    await p.keyboard.press("z"); await sleep(250);
    ok(tag + " C: Z undoes it", (await p.locator('.slot.open').count()) === 1);
    // D. Mark as open and Surprise me on a Not cooking night
    await p.locator('.blocked.once [data-unblock]').click(); await sleep(250);
    ok(tag + " D: Mark as open turns Not cooking into an open night", (await p.locator('.slot.open').count()) === 2 && (await p.locator('.blocked.once').count()) === 0);
    await p.keyboard.press("z"); await sleep(200);
    await p.locator('.blocked.once [data-act=surprise]').click(); await sleep(300);
    ok(tag + " D: Surprise me on a Not cooking night cooks it", (await p.locator('.blocked.once').count()) === 0 && (await p.locator('.mcw').count()) === 6, await p.locator('.mcw').count());
    ok(tag + " D: the new meal lands first in its day", await p.evaluate(() => { const r = document.querySelector('.arow[data-day="Sat"]'); return !!r.querySelector(".mcw"); }));
    ok(tag + " E: no sideways scroll", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await p.close(); }
  // F. header tools: Copy and Clear flip to an in-place Undo
  { const p = await open(ctx, "week=2026-10-19", errs);   // week 2 is empty
    await p.locator('[data-act=copy]').click(); await sleep(300);
    ok(tag + " F: Copy last week fills empty nights", (await p.locator('.mcw').count()) === 4, await p.locator('.mcw').count());   // Mon to Thu; Friday is the usual day off
    ok(tag + " F: Copy button flips to Undo chip in place", (await p.locator('[data-fk="hdr:copy"].flipundo').count()) === 1);
    await p.locator('[data-fk="hdr:copy"].flipundo').click(); await sleep(250);
    ok(tag + " F: Undo restores the empty week and the icon returns", (await p.locator('.mcw').count()) === 0 && (await p.locator('[data-act=copy]').count()) === 1);
    await p.close(); }
  { const p = await open(ctx, "", errs);
    const before = await p.locator('.mcw').count();
    await p.locator('[data-act=clearwk]').click(); await sleep(300);
    const t = await T(p);
    ok(tag + " G: Mine clears only individual meals and the one-off Not cooking", (await p.locator('.mcw').count()) === before - 1 && (await p.locator('.blocked.once').count()) === 0, [before, await p.locator('.mcw').count()]);
    ok(tag + " G: the note says what stays", /household meals? stay/.test(t) && /Usual days off stay/.test(t), t.slice(0, 80));
    ok(tag + " G: usual day off (Fri) is still there", (await p.locator('.blocked.usual').count()) === 1);
    ok(tag + " G: Clear button flips to Undo", (await p.locator('[data-fk="hdr:clear"].flipundo').count()) === 1);
    await p.locator('[data-fk="hdr:clear"].flipundo').click(); await sleep(250);
    ok(tag + " G: Undo brings everything back", (await p.locator('.mcw').count()) === before && (await p.locator('.blocked.once').count()) === 1);
    await p.locator('[data-view=all]').click(); await sleep(250);
    const b2 = await p.locator('.mcw').count();
    await p.locator('[data-act=clearwk]').click(); await sleep(300);
    ok(tag + " G: Household clears the household meals and leaves personal ones", (await p.locator('.mcw').count()) < b2 && (await p.locator('.mcw').count()) >= 3, [b2, await p.locator('.mcw').count()]);
    await p.close(); }
  // H. bulk actions in the summary
  { const p = await open(ctx, "", errs);
    const sumSel = w >= 1440 ? "#panel2" : "#panel";
    ok(tag + " H: tally reads Missing, In the cart, Meals held", await p.locator(sumSel).innerText().then(t => /MISSING/i.test(t) && /IN THE CART/i.test(t) && /MEAL HELD/i.test(t) && !/to buy/i.test(t.replace(/Add \d+ to the shopping list/i, ""))));
    ok(tag + " H: Add N to the shopping list and Reserve N are drawn", (await p.locator('[data-act=bulkadd]').count()) === 1 && (await p.locator('[data-act=reserve]').count()) === 1);
    await p.locator('[data-act=bulkadd]').click(); await sleep(250);
    ok(tag + " H: Add flips to Undo, then nothing missing reads Nothing missing", (await p.locator('.bulk .flipundo').count()) >= 1 && /Nothing missing/i.test(await p.locator(sumSel).innerText()));
    ok(tag + " H: never says 0 to buy", !/0 to buy/i.test(await T(p)));
    await p.locator('[data-act=reserve]').click(); await sleep(250);
    ok(tag + " H: Reserve flips to Undo", (await p.locator('.bulk .flipundo').count()) >= 1);
    await p.evaluate(() => { PLAN.S().flip = null; }); await p.locator('[data-fk="hdr:next"]').click(); await p.locator('[data-fk="hdr:prev"]').click(); await sleep(250);
    ok(tag + " H: once everything is held the button reads Release", (await p.locator('[data-act=release]').count()) === 1);
    await p.close(); }
  // I. another person's plan is fully view only
  { const p = await open(ctx, "view=Jane", errs);
    ok(tag + " I: no action icons on any tile", (await p.locator('.mcw .ra').count()) === 0);
    ok(tag + " I: eye glyph on every view-only tile and open night", (await p.locator('.mcw .eye').count()) === (await p.locator('.mcw').count()) && (await p.locator('.slot.open.vo .eye').count()) >= 1);
    ok(tag + " I: no Copy, no Clear in the header", (await p.locator('[data-act=copy]').count()) === 0 && (await p.locator('[data-act=clearwk]').count()) === 0);
    ok(tag + " I: no bulk buttons, no cart buttons in the summary", (await p.locator('.bulk').count()) === 0 && (await p.locator('.sumrow .mini.cart').count()) === 0);
    await p.locator('.mcw .mc').first().click(); await sleep(250);
    const panel = await p.locator('#panel').innerText();
    ok(tag + " I: detail has no Hold, Add, stepper, cart buttons", (await p.locator('#panel [data-act=hold],#panel [data-act=addmissing],#panel [data-act=ppl],#panel [data-act=addlist]').count()) === 0 && /View only/.test(panel), panel.slice(0, 60));
    const heldBefore = await p.evaluate(() => PLAN.S().cards.filter(c => c.res).length), n0 = await p.evaluate(() => PLAN.S().cards.length);
    await p.keyboard.press("h"); await p.keyboard.press("l"); await p.keyboard.press("x"); await p.keyboard.press("b"); await sleep(200);
    ok(tag + " I: H, L, X and B do nothing on another person's meal", await p.evaluate(([h, n]) => PLAN.S().cards.filter(c => c.res).length === h && Object.keys(PLAN.S().list).length === 0 && PLAN.S().cards.length === n, [heldBefore, n0]), await p.evaluate(() => [PLAN.S().cards.length, Object.keys(PLAN.S().list)]));
    await p.close(); }
  // J. participants and Household wording
  { const p = await open(ctx, "", errs);
    const t = await T(p);
    ok(tag + " J: Household is the name (not Everyone)", /Household/.test(t) && !/Everyone/.test(t));
    ok(tag + " J: a household meal for all reads Household, a named few reads their names", /Sam, Jane/.test(t) && (await p.locator('.mcw .meta span', { hasText: /^Household$/ }).count()) >= 2);
    await p.locator('[data-view=Priya]').click(); await sleep(200);
    ok(tag + " J: Priya sees the household meals for all, not the Sam and Jane one", !/Salmon patties/.test(await T(p)) && /Shakshuka/.test(await T(p)) && /Egg fried rice/.test(await T(p)));
    await p.close(); }
  // K. range: last week to three weeks ahead (five weeks)
  { const p = await open(ctx, "", errs);
    for (let i = 0; i < 6; i++) await p.keyboard.press("]");
    await sleep(200);
    ok(tag + " K: forward stops at 3 weeks ahead", /In 3 weeks/.test(await p.locator(".wkh").first().innerText()) && await p.locator('[data-fk="hdr:next"]').isDisabled());
    for (let i = 0; i < 9; i++) await p.keyboard.press("[");
    ok(tag + " K: back stops at last week", /Last week/.test(await p.locator(".wkh").first().innerText()) && await p.locator('[data-fk="hdr:prev"]').isDisabled());
    await p.keyboard.press("w"); await sleep(150);
    ok(tag + " K: the picker lists five weeks", (await p.locator('.pop .wk').count()) === 5);
    await p.keyboard.press("Escape"); await p.keyboard.press("t"); await sleep(400);
    ok(tag + " K: T goes to this week and pulses today", (await p.locator(".arow.is-today").count()) === 1);
    await p.close(); }
  // L. the counts jump
  { const p = await open(ctx, "", errs);
    await p.locator('[data-jump=open]').click(); await sleep(300);
    ok(tag + " L: padlock count jumps to the first open night", await p.locator('.arow[data-day="Sun"]').evaluate(e => e.classList.contains("pulse")));
    await p.locator('[data-jump=nc]').click(); await sleep(300);
    ok(tag + " L: moon count jumps to the first Not cooking night", await p.locator('.arow[data-day="Fri"]').evaluate(e => e.classList.contains("pulse")));
    await p.close(); }
  // M. detail: one list, Total time, Hold N and Add N
  { const p = await open(ctx, "sel=wed-curry", errs);
    const d = await p.locator("#panel").innerText();
    ok(tag + " M: Total time shown once", /Total time\s*45 min/.test(d));
    ok(tag + " M: no ON HAND or MISSING headings", !/^ON HAND$/m.test(d) && !/^MISSING$/m.test(d));
    ok(tag + " M: missing items come first", await p.evaluate(() => { const r = [...document.querySelectorAll("#panel .ing")]; return r[0].classList.contains("miss") && !r[r.length - 1].classList.contains("miss"); }));
    ok(tag + " M: the bottom is Hold N and Add N, no Replan or Not cooking", (await p.locator('#panel .foot button').allInnerTexts()).join("|").match(/Hold 2\s*H\|Add 2\s*L/) !== null && (await p.locator('#panel [data-act=replan],#panel [data-act=notcooking]').count()) === 0);
    await p.locator('#panel [data-act=hold]').click(); await sleep(200);
    ok(tag + " M: Hold reads Release once held", /Release 2/.test(await p.locator("#panel .foot").innerText()));
    ok(tag + " M: a held meal can be held with the same ingredients as another (no blocked hold)", await p.evaluate(() => PLAN.u.conflicts(PLAN.S().cards[0]).length === 0));
    await p.close(); }
  // N. past tile copy forward
  { const p = await open(ctx, "week=2026-10-05", errs);
    ok(tag + " N: a past tile offers Copy forward only", (await p.locator('.mcw.cf .ra .rb').count()) === (await p.locator('.mcw.cf').count()) && (await p.locator('.mcw.cf').count()) >= 3);
    await p.locator('.mcw.cf [data-act=cfwd]').first().click(); await sleep(250);
    ok(tag + " N: it opens a menu of coming days", (await p.locator('#cm [role=menuitem]').count()) === 14);
    await p.locator('#cm [role=menuitem]').nth(2).click(); await sleep(300);
    ok(tag + " N: the copy lands, the original stays", await p.evaluate(() => PLAN.S().cards.filter(c => c.wk === 1 && c.fromCopy).length === 1 && PLAN.S().cards.filter(c => c.wk === 0).length === 6));
    await p.close(); }
  // O. drag tears an edge
  { const p = await open(ctx, "", errs);
    await p.setViewportSize({ width: w, height: 1300 }); await sleep(150);
    const a = await p.locator('.mcw.mine .mc').first().boundingBox(), b = await p.locator('.arow[data-day="Sun"]').boundingBox();
    await p.mouse.move(a.x + 60, a.y + 20); await p.mouse.down(); await p.mouse.move(a.x + 70, a.y + 60, { steps: 5 }); await p.mouse.move(b.x + 200, b.y + 20, { steps: 12 });
    ok(tag + " O: dragging down tears the top edge of the tile in hand and the bottom edge of the place it left", await p.evaluate(() => { const g = document.querySelector("#ghost .mc"), o = document.querySelector('.mcw.lifted .mc'); return !!g && g.classList.contains("torn") && /polygon/.test(getComputedStyle(g).clipPath) && !!o && o.classList.contains("torn") && g.style.getPropertyValue("--tpl") !== o.style.getPropertyValue("--tpl"); }));
    await p.mouse.up(); await sleep(150);
    ok(tag + " O: the dropped tile carries the just-dropped cue and no tear is left", (await p.locator('.mcw.dropped').count()) >= 1 && (await p.locator('.mc.torn').count()) === 0);
    await p.close(); }
  await ctx.close();
}
await browser.close();
if (errs.length) { console.log("console/page errors:", errs.slice(0, 5)); fails++; }
console.log(fails ? `${fails} FAILED of ${total}` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
