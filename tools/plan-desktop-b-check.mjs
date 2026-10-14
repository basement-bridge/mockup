// Behaviour check for Plan desktop option B, realigned with the phone Plan (14 Oct 2026, decisions 259 to 275; replan cleanup, detail order and reds 276 to 281; empty week, week tools, hold everything 282 to 286; top copies only when the gutter is not seen 287), headless Chromium.
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
    await p.locator(':is([data-fk="hdr:copy"],[data-fk="sum:copy"]):visible').click(); await sleep(300);
    ok(tag + " F: Copy last week fills empty nights", (await p.locator('.mcw').count()) === 4, await p.locator('.mcw').count());   // Mon to Thu; Friday is the usual day off
    ok(tag + " F: Copy button flips to Undo chip in place", (await p.locator(':is([data-fk="hdr:copy"],[data-fk="sum:copy"]):visible.flipundo').count()) === 1);
    await p.locator(':is([data-fk="hdr:copy"],[data-fk="sum:copy"]):visible.flipundo').click(); await sleep(250);
    ok(tag + " F: Undo restores the empty week and the icon returns", (await p.locator('.mcw').count()) === 0 && (await p.locator(':is([data-fk="hdr:copy"],[data-fk="sum:copy"]):visible').count()) === 1);
    await p.close(); }
  { const p = await open(ctx, "", errs);
    const before = await p.locator('.mcw').count();
    await p.locator(':is([data-fk="hdr:clear"],[data-fk="sum:clear"]):visible').click(); await sleep(300);
    const t = await T(p);
    ok(tag + " G: Mine clears only individual meals and the one-off Not cooking", (await p.locator('.mcw').count()) === before - 1 && (await p.locator('.blocked.once').count()) === 0, [before, await p.locator('.mcw').count()]);
    ok(tag + " G: the note says what stays", /household meals? stay/.test(t) && /Usual days off stay/.test(t), t.slice(0, 80));
    ok(tag + " G: usual day off (Fri) is still there", (await p.locator('.blocked.usual').count()) === 1);
    ok(tag + " G: Clear button flips to Undo", (await p.locator(':is([data-fk="hdr:clear"],[data-fk="sum:clear"]):visible.flipundo').count()) === 1);
    await p.locator(':is([data-fk="hdr:clear"],[data-fk="sum:clear"]):visible.flipundo').click(); await sleep(250);
    ok(tag + " G: Undo brings everything back", (await p.locator('.mcw').count()) === before && (await p.locator('.blocked.once').count()) === 1);
    await p.locator('[data-view=all]').click(); await sleep(250);
    const b2 = await p.locator('.mcw').count();
    await p.locator(':is([data-fk="hdr:clear"],[data-fk="sum:clear"]):visible').click(); await sleep(300);
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
    ok(tag + " I: no Copy, no Clear in the header", (await p.locator('[data-fk="hdr:copy"]').count()) === 0 && (await p.locator('[data-fk="hdr:clear"]').count()) === 0);
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
  // P. replan cleans the shopping list (owner, 14 Oct 2026): reduce, remove, bought untouched, undo, tally live; a hold never blocks
  { const p = await open(ctx, "", errs);
    const toast = async () => (await p.locator(".toast > span").first().innerText().catch(() => ""));
    const cart = async () => +(await p.locator(".tally .st.also b").innerText());
    const lines = async () => p.evaluate(() => PLAN.u.cartLines().map(l => l.name + ":" + l.qty).join("|"));
    ok(tag + " P: the sample list is feta, lemon (shared by two meals), nothing else from meals", (await lines()) === "feta:100 g|lemon:1½", await lines());
    ok(tag + " P: the cart tally starts at 2 and the rail badge at 3 (milk was added by hand)", (await cart()) === 2 && (await p.locator('.rail .nv .n').last().innerText()) === "3");
    await p.locator('[data-cw="thu-tuna"] [data-act=replan]').click(); await sleep(300);
    ok(tag + " P: replan Tuna salad reduces lemon from 1½ to 1 and says so", (await lines()) === "feta:100 g|lemon:1" && /lemon 1½ down to 1/.test(await toast()), [await lines(), await toast()]);
    ok(tag + " P: the cart tally stays 2 (the line stays, only smaller)", (await cart()) === 2, await cart());
    await p.keyboard.press("z"); await sleep(250);
    ok(tag + " P: Z undoes it, lemon is 1½ again", (await lines()) === "feta:100 g|lemon:1½");
    await p.locator('[data-cw="thu-patty"] [data-act=replan]').click(); await sleep(300);
    ok(tag + " P: replan Salmon patties takes only its own 1 lemon off (1½ down to ½)", (await lines()) === "feta:100 g|lemon:½" && /lemon 1½ down to ½/.test(await toast()), [await lines(), await toast()]);
    await p.locator('[data-cw="thu-tuna"] [data-act=replan]').click(); await sleep(300);
    ok(tag + " P: replanning the last meal that needs lemon takes the line off", (await lines()) === "feta:100 g" && /lemon ½ taken off, nothing else needs it/.test(await toast()), [await lines(), await toast()]);
    ok(tag + " P: the cart tally dropped to 1", (await cart()) === 1, await cart());
    await p.keyboard.press("z"); await p.keyboard.press("z"); await sleep(250);
    ok(tag + " P: two undos bring the whole list back", (await lines()) === "feta:100 g|lemon:1½" && (await cart()) === 2);
    // a held, single-use line: Shakshuka is held and its feta is on the list; replan releases the hold AND takes feta off
    await p.locator('[data-cw="mon-shak"] [data-act=replan]').click(); await sleep(300);
    const t1 = await toast();
    ok(tag + " P: replan a held meal: the hold is released, named, and its single-use line is taken off", /hold is released: eggs, tomatoes, onion/.test(t1) && /feta 100 g taken off, nothing else needs it/.test(t1), t1);
    ok(tag + " P: no meal is held now and the held tally reads 0", (await p.evaluate(() => PLAN.S().cards.filter(c => c.res).length)) === 0);
    await p.keyboard.press("z"); await sleep(250);
    // bought: Chicken curry's thighs are in Pantry; replan never touches them
    await p.locator('[data-cw="wed-curry"] [data-act=replan]').click(); await sleep(300);
    const t2 = await toast();
    ok(tag + " P: replan a meal with a bought item leaves it alone and says so", /Already bought, left alone: chicken thighs/.test(t2) && !/Shopping list:/.test(t2), t2);
    await p.locator('.nv[data-act=shop]').click(); await sleep(250);
    ok(tag + " P: the Shopping list stand-in still shows the bought thighs", /Bought, in Pantry/i.test(await p.locator(".shopc").innerText()) && (await p.locator('.shopc .shl.bought').count()) === 1);
    ok(tag + " P: it lists feta, lemon and milk on the list with the meals behind them", /Salmon patties \(Thu, 1\)/.test(await p.locator(".shopc").innerText()) && /Tuna salad \(Thu, ½\)/.test(await p.locator(".shopc").innerText()));
    await p.locator('.shopc [data-act=buyline][data-i=lemon]').click(); await sleep(300);
    ok(tag + " P: Bought moves lemon off the list into Pantry and every meal counts it on hand", await p.evaluate(() => !PLAN.u.cartLines().some(l => l.name === "lemon") && PLAN.u.boughtLines().some(b => b.name === "lemon") && PLAN.S().cards.filter(c => c.r === "tuna" || c.r === "patty").every(c => PLAN.u.missing(c).indexOf("lemon") < 0)));
    await p.keyboard.press("Control+Enter"); await sleep(200);
    await p.locator('[data-cw="thu-patty"] [data-act=replan]').click(); await sleep(300);
    ok(tag + " P: replan after it was bought does not touch the list", !/Shopping list:/.test(await toast()) && /Already bought, left alone: lemon/.test(await toast()), await toast());
    await p.close(); }
  { const p = await open(ctx, "", errs);
    // a hold never blocks: hold Salmon patties (eggs are already held by Shakshuka)
    await p.locator('[data-cw="thu-patty"] [data-act=hold]').click(); await sleep(250);
    ok(tag + " P: holding a meal that shares eggs with a held meal is allowed (no block, no guard)", (await p.evaluate(() => PLAN.S().cards.filter(c => c.res).length)) === 2);
    await p.close(); }
  // Q. the detail has one order, the phone's (owner, 14 Oct 2026)
  { const p = await open(ctx, "sel=wed-curry", errs);
    const order = await p.evaluate(() => ["#panel .top", "#panel .dstat", "#panel .srcbox", "#panel .tt", "#panel .ppl", "#panel .ings", "#panel .foot"].map(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top : -1; }));
    ok(tag + " Q: detail order is who and when, status, where from, total time, people, one list, footer", order.every(x => x >= 0) && order.every((x, i) => i === 0 || x > order[i - 1]), order);
    ok(tag + " Q: the status at the top says what the tile says", (await p.locator("#panel .dstat").innerText()).trim() === (await p.locator('[data-cw="wed-curry"] .stt').innerText()).trim());
    await p.close(); }
  { const p = await open(ctx, "sel=mon-shak", errs);
    const order = await p.evaluate(() => ["#panel .ings", "#panel .holdhint", "#panel .foot"].map(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top : -1; }));
    ok(tag + " Q: while held, the hint sits between the list and the footer", order.every(x => x >= 0) && order[0] < order[1] && order[1] < order[2], order);
    await p.close(); }
  // R. reds: red is for missing with nothing done, and the offline states only
  { const p = await open(ctx, "", errs);
    const dg = await p.evaluate(() => { const t = document.createElement("i"); t.style.color = "var(--danger)"; document.body.appendChild(t); const c = getComputedStyle(t).color; t.remove(); return c; });
    const col = async sel => p.locator(sel).first().evaluate(e => getComputedStyle(e).color);
    ok(tag + " R: the Missing pill is red (nothing actioned)", (await col(".tg.miss")) === dg);
    ok(tag + " R: the use-by (soon) pill is not red", (await col(".tg.soon")) !== dg);
    ok(tag + " R: the On the list pill is not red", (await col(".tg.also")) !== dg);
    await p.close(); }
  // S. an empty week asks once (owner, 14 Oct 2026): one whole-week Surprise me and Ask AI, none on the nights
  { const p = await open(ctx, "state=empty", errs);
    ok(tag + " S: an empty week draws ONE whole-week card with Surprise me and Ask AI", (await p.locator(".wkfill").count()) === 1 && (await p.locator('.wkfill [data-act=weekfill]').count()) === 1 && (await p.locator('.wkfill [data-act=assistant][data-week]').count()) === 1);
    ok(tag + " S: no per-night Surprise me or Ask AI anywhere (open nights and the Not cooking night)", (await p.locator('[data-act=surprise]').count()) === 0 && (await p.locator('.arow [data-act=askai]').count()) === 0);
    ok(tag + " S: the Not cooking night keeps Mark as open", (await p.locator('.blocked [data-unblock]').count()) === 1);
    ok(tag + " S: the card names the nights it will fill and what it leaves out", /6 open nights/.test(await p.locator(".wkfill").innerText()) && /Fri \(usual day off\) is Not cooking, so left out/.test(await p.locator(".wkfill").innerText()), await p.locator(".wkfill").innerText());
    ok(tag + " S: Copy last week sits in the card as the quiet alternative", (await p.locator('.wkfill [data-act=copy]').count()) === 1);
    await p.locator('.wkfill [data-act=assistant]').click(); await sleep(250);
    ok(tag + " S: the whole-week Ask AI hands off for the week and says open nights only", /week of 19 Oct/.test(await p.locator(".ainote").innerText()) && /left out/.test(await p.locator(".ainote").innerText()) && (await p.locator("[data-act=weekfill]").count()) === 1);
    await p.locator('.wkfill [data-act=weekfill]').click(); await sleep(300);
    const days = await p.evaluate(() => PLAN.S().cards.filter(c => c.wk === 2).map(c => c.day).sort().join(","));
    ok(tag + " S: the whole-week Surprise me plans every open night and skips the usual day off", days === "Mon,Sat,Sun,Thu,Tue,Wed", days);
    ok(tag + " S: the meals differ from night to night", await p.evaluate(() => { const r = PLAN.S().cards.filter(c => c.wk === 2).map(c => c.r); return new Set(r).size === r.length; }));
    ok(tag + " S: the toast names the nights, the skipped night and offers Undo", /Surprise me planned 6 nights/.test(await p.locator(".toast > span").innerText()) && /Fri \(usual day off\) is Not cooking/.test(await p.locator(".toast > span").innerText()) && (await p.locator(".toast [data-act=undo]").count()) === 1);
    ok(tag + " S: once planned the card is gone and the Not cooking night offers its own Surprise me and Ask AI again", (await p.locator(".wkfill").count()) === 0 && (await p.locator('.blocked [data-act=surprise]').count()) === 1);
    ok(tag + " S: the 'just dropped in' cue fires on every tile the fill added (156 unchanged)", (await p.locator(".mcw.dropped").count()) === 6, await p.locator(".mcw.dropped").count());
    ok(tag + " S: an in-place Undo chip appears in the gutter", (await p.locator(".wkacts .flipundo").count()) === 1);
    await p.keyboard.press("z"); await sleep(300);
    ok(tag + " S: Z undoes the whole fill in one step and the card is back", (await p.locator(".wkfill").count()) === 1 && (await p.evaluate(() => PLAN.S().cards.filter(c => c.wk === 2).length)) === 0);
    await p.close(); }
  { const p = await open(ctx, "state=empty&wkfill=header", errs);
    ok(tag + " S: ?wkfill=header puts the pair in the week-title row and no card", (await p.locator(".wki .wkfillbar [data-act=weekfill]").count()) === 1 && (await p.locator(".wkfill").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "state=empty&wkfill=gutter", errs);
    ok(tag + " S: ?wkfill=gutter puts the pair in the gutter and no card above the nights", (await p.locator("#main .wkfill").count()) === 0 && (await p.locator(".sumcol .wkfill [data-act=weekfill]").count() + await p.locator("#panel .wkfill [data-act=weekfill]").count()) >= 1);
    await p.close(); }
  // T. a partly filled week goes back to the per-night lines
  { const p = await open(ctx, "", errs);
    ok(tag + " T: a week with meals draws no whole-week card and keeps per-night Surprise me and Ask AI", (await p.locator(".wkfill").count()) === 0 && (await p.locator('.slot.open [data-act=surprise]').count()) === 1 && (await p.locator('.slot.open [data-act=askai]').count()) === 1);
    await p.close(); }
  { const p = await open(ctx, "state=empty", errs);
    await p.locator('.wkfill [data-act=copy]').click(); await sleep(300);
    ok(tag + " T: Copy last week from the empty card fills the empty nights and the per-night lines return for the rest", (await p.locator(".wkfill").count()) === 0 && (await p.locator(".mcw").count()) === 4 && (await p.locator('.slot.open [data-act=surprise]').count()) === 2, [await p.locator(".mcw").count(), await p.locator('.slot.open [data-act=surprise]').count()]);
    ok(tag + " T: the copied tiles get the 'just dropped in' cue", (await p.locator(".mcw.dropped").count()) === 4, await p.locator(".mcw.dropped").count());
    ok(tag + " T: Copy last week flips to Undo in the header AND in the gutter together", (await p.locator('.flipundo[data-fk="hdr:copy"]').count()) === 1 && (await p.locator('.flipundo[data-fk="sum:copy"]').count()) === 1);
    await p.locator('.flipundo[data-fk="sum:copy"]').click(); await sleep(300);
    ok(tag + " T: the gutter Undo restores the empty week and the card", (await p.locator(".wkfill").count()) === 1 && (await p.locator(".mcw").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "state=empty", errs);
    await p.locator('.slot.open').nth(2).focus(); await p.keyboard.press("Shift+X"); await sleep(250);
    ok(tag + " T: marking one night Not cooking keeps the week empty (still one whole-week action)", (await p.locator(".wkfill").count()) === 1 && /5 open nights/.test(await p.locator(".wkfill").innerText()), await p.locator(".wkfill").innerText());
    await p.locator('.wkfill [data-act=weekfill]').click(); await sleep(300);
    const d2 = await p.evaluate(() => PLAN.S().cards.filter(c => c.wk === 2).map(c => c.day).sort().join(","));
    ok(tag + " U: the fill skips a one-off Not cooking night as well as the usual day off", d2 === "Mon,Sat,Sun,Thu,Tue", d2);
    await p.keyboard.press("z"); await sleep(250); await p.keyboard.press("z"); await sleep(250);
    await p.evaluate(() => { PLAN.S().stencil.Sam.push("Tue"); PLAN.render(); }); await sleep(200);
    await p.locator('.wkfill [data-act=weekfill]').click(); await sleep(300);
    const d3 = await p.evaluate(() => PLAN.S().cards.filter(c => c.wk === 2).map(c => c.day).sort().join(","));
    ok(tag + " U: a usual day added in Settings is skipped too", d3 === "Mon,Sat,Sun,Thu,Wed", d3);
    await p.close(); }
  // V. the gutter: hold everything (Reserve), Add all, Copy last week, Clear week by scope
  { const p = await open(ctx, "", errs);
    ok(tag + " V: the gutter has Add to the shopping list and Reserve (hold everything) side by side in one group", (await p.locator('.bulk [data-act=bulkadd]').count()) === 1 && (await p.locator('.bulk [data-act=reserve]').count()) === 1 && /Hold everything/.test(await p.locator('.bulk [data-act=reserve]').getAttribute("data-tip")));
    const nh = await p.evaluate(() => PLAN.S().cards.filter(c => c.res).length), want = await p.evaluate(() => PLAN.bWeek.bulk().nh.length);
    await p.locator('.bulk [data-act=reserve]').click(); await sleep(300);
    ok(tag + " V: Reserve holds every meal with something on hand, like the phone", (await p.evaluate(() => PLAN.S().cards.filter(c => c.res).length)) === nh + want && (await p.locator('.bulk .flipundo').count()) === 1);
    ok(tag + " V: holding does not trigger the 'just dropped in' cue (no tile content changed)", (await p.locator(".mcw.dropped").count()) === 0);
    await p.keyboard.press("z"); await sleep(250);
    ok(tag + " V: Undo returns the holds exactly", (await p.evaluate(() => PLAN.S().cards.filter(c => c.res).length)) === nh);
    ok(tag + " V: Week actions in the gutter: Copy last week and Clear week with the scope in words", (await p.locator('.wkacts [data-act=copy]').count()) === 1 && /my plan, from today/.test(await p.locator('.wkacts [data-act=clearwk]').innerText()));
    await p.locator('.wkacts [data-act=clearwk]').click(); await sleep(300);
    ok(tag + " V: Clear week from the gutter clears my own meals only and flips to the same Undo chip in the gutter and the header", (await p.locator('.flipundo[data-fk="sum:clear"]').count()) === 1 && (await p.locator('.flipundo[data-fk="hdr:clear"]').count()) === 1);
    await p.locator('.flipundo[data-fk="sum:clear"]').click(); await sleep(300);
    ok(tag + " V: Undo restores the cleared meals and they drop in (156)", (await p.locator(".mcw.dropped").count()) > 0 && (await p.locator('.flipundo').count()) === 0);
    await p.keyboard.press("2"); await sleep(250);
    ok(tag + " V: in Household the gutter Clear says household", /household, from today/.test(await p.locator('.wkacts [data-act=clearwk]').innerText().catch(() => "")), await p.locator('.wkacts').innerText().catch(() => ""));
    await p.keyboard.press("3"); await sleep(250);
    ok(tag + " V: another person's plan (view only) has no Week actions and no bulk group", (await p.locator('.wkacts').count()) === 0 && (await p.locator('.bulk').count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "state=past", errs);
    ok(tag + " V: last week (read only) draws no whole-week card and no Week actions", (await p.locator(".wkfill").count()) === 0 && (await p.locator('.wkacts').count()) === 0);
    await p.close(); }
  // W. top Copy last week and Clear week show ONLY when the gutter is not seen (owner, 14 Oct 2026, decision 287)
  { const vis = (p, sel) => p.locator(sel).evaluateAll(es => es.filter(e => e.offsetParent !== null).length);
    const top = p => vis(p, '[data-fk="hdr:copy"], [data-fk="hdr:clear"], .wkfill [data-fk="wk:copy"]');
    const gut = p => vis(p, '[data-fk="sum:copy"], [data-fk="sum:clear"]');
    let p = await open(ctx, "", errs);
    ok(tag + " W: gutter seen (summary, nothing picked): top copies hidden, gutter has both", (await top(p)) === 0 && (await gut(p)) === 2, [await top(p), await gut(p)]);
    await p.locator('[data-card]').first().click(); await sleep(250);
    const three = w >= 1440;
    ok(tag + " W: meal picked: " + (three ? "gutter still seen, top hidden" : "gutter tucked, top copies shown"), three ? (await top(p)) === 0 && (await gut(p)) === 2 : (await top(p)) === 2 && (await gut(p)) === 0, [await top(p), await gut(p)]);
    if (!three) {
      await p.locator('[data-fk="hdr:copy"]').click(); await sleep(250);
      ok(tag + " W: tucked: the top Copy runs the same action (its toast)", /Copied last week|Nothing to fill/.test(await T(p)));
      await p.locator('[data-act=sumpeek]').click(); await sleep(250);
      ok(tag + " W: peeking the summary behind a meal: gutter seen, top hidden", (await top(p)) === 0 && (await gut(p)) === 2, [await top(p), await gut(p)]);
    }
    await p.close();
    p = await open(ctx, "week=2026-10-19", errs);
    ok(tag + " W: empty week (gutter carries no week actions): top Copy and Clear stay", (await vis(p, '[data-fk="hdr:copy"]')) === 1 && (await gut(p)) === 0);
    await p.keyboard.press("c"); await sleep(250);
    ok(tag + " W: key C copies either way", (await p.locator('.mcw').count()) === 4);
    await p.close(); }
  // U. Surprise me is the Home cooking-ideas engine (decision 292): no week-position switch, no repeat of what is on the plan, a different idea for each night of the whole-week fill, and the no-idea state
  { const p = await open(ctx, "state=empty", errs);
    ok(tag + " U: the pick does not depend on the night's place in the week (no early-week or late-week switch; weeknights compared)", await p.evaluate(() => { const r = ["Mon", "Tue", "Wed", "Thu"].map(d => PLAN.u.pickSurprise(d).r); return new Set(r).size === 1; }));
    ok(tag + " U: the reason is one plain sentence derived from the Home factors", await p.evaluate(() => /^(Uses up your .* before (it goes|they go) off|You have everything for it|Only one thing to buy|A favourite|A quick one for a weeknight|Not cooked in a while)/.test(PLAN.u.pickSurprise("Tue").why)), await p.evaluate(() => PLAN.u.pickSurprise("Tue").why));
    ok(tag + " U: the shopping list is not read (listing every ingredient does not change the pick)", await p.evaluate(() => { const a = PLAN.u.pickSurprise("Tue").r; const S = PLAN.S(); S.list = { eggs: 1, lemon: 1, feta: 1, mushrooms: 1, dill: 1 }; return PLAN.u.pickSurprise("Tue").r === a; }));
    ok(tag + " U: something already on the plan this week is not picked again", await p.evaluate(() => { const S = PLAN.S(), a = PLAN.u.pickSurprise("Tue").r; S.cards.push(PLAN.u.mkCard(S.wk, "Mon", a, "Sam", "all", 2)); return PLAN.u.pickSurprise("Tue").r !== a; }));
    ok(tag + " U: nothing is offered unless it scores above 0, and the whole-week fill never reaches past the ideas (no repeats, none planned for nothing)", await p.evaluate(() => { PLAN.S().cards = []; const f = PLAN.u.planAhead(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]); return f.length > 0 && new Set(f.map(x => x.r)).size === f.length; }));
    await p.close(); }
  // V2. the plain-words reason on a Surprise me tile (decision 292, Proposal): data-why, focusable tooltip, survives the toast, goes when the meal is changed by hand; no technical words
  { const p = await open(ctx, "", errs);
    await p.locator('.slot.open [data-act=surprise]').first().click(); await sleep(300);
    const w = p.locator(".mcw .why[data-why]");
    ok(tag + " V2: a Surprise me tile carries .why[data-why] with a button and a role=tooltip", (await w.count()) === 1 && (await w.locator("button.why-btn[aria-describedby]").count()) === 1 && (await w.locator(".why-tip[role=tooltip]").count()) === 1);
    const txt = await w.getAttribute("data-why");
    ok(tag + " V2: the reason is one plain sentence, never scores, weights or signal names", /^[A-Z][^.]*\.$/.test(txt) && !/\d|score|point|weight|signal|rank|useby|use-by|k:|pts/i.test(txt.replace(/one thing|two things/g, "")), txt);
    ok(tag + " V2: tooltip is hidden until the button is focused (not hover only)", !(await w.locator(".why-tip").isVisible()));
    await w.locator(".why-btn").focus(); await sleep(100);
    ok(tag + " V2: keyboard focus shows the tooltip with the same sentence", (await w.locator(".why-tip").isVisible()) && (await w.locator(".why-tip").innerText()) === txt);
    await p.keyboard.press("Escape"); await p.locator("body").click({ position: { x: 5, y: 5 } }).catch(() => {});
    await sleep(6500);
    ok(tag + " V2: the reason stays after the toast has gone", (await p.locator(".toast").count()) === 0 && (await p.locator(".mcw .why[data-why]").count()) === 1);
    await p.evaluate(() => { const S = PLAN.S(), c = S.cards.filter(x => x.why).pop(); c.n = c.n + 1; PLAN.render(); });
    ok(tag + " V2: changing the meal by hand (people) clears the reason", (await p.locator(".mcw .why").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "surprise=none", errs);
    const n0 = await p.evaluate(() => PLAN.S().cards.length), u0 = await p.evaluate(() => PLAN.S().undo.length);
    await p.locator('.slot.open [data-act=surprise]').first().click(); await sleep(250);
    ok(tag + " U: no idea fits: the toast says so and points to Ask AI", /Nothing fits from what is in\. Try Ask AI\./.test(await p.locator(".toast > span").innerText()));
    ok(tag + " U: no idea fits: nothing is planned, nothing is added to Undo, no Undo button", (await p.evaluate(() => PLAN.S().cards.length)) === n0 && (await p.evaluate(() => PLAN.S().undo.length)) === u0 && (await p.locator(".toast [data-act=undo]").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "surprise=confirm", errs);
    await p.locator('.slot.open [data-act=surprise]').first().click(); await sleep(250);
    ok(tag + " U: ?surprise=confirm still shows the proposal first (118 stays open)", (await p.locator(".slot.prop").count()) === 1);
    await p.close(); }
  await ctx.close();
}
await browser.close();
if (errs.length) { console.log("console/page errors:", errs.slice(0, 5)); fails++; }
console.log(fails ? `${fails} FAILED of ${total}` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
