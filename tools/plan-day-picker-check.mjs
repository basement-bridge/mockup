// Behaviour check for Plan it, choosing the day on desktop (Kitchie #757), options A to G, headless Chromium. Mockup only, nothing is saved.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-day-picker-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox).
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-day-picker/home.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await chromium.launch();
const errs = [];
async function open(ctx, q) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + "?" + q); await sleep(400); return p; }
const weekText = p => p.locator("#week").innerText();
const toast = p => p.locator(".toast").innerText().catch(() => "");
const focusedLabel = p => p.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute("aria-label") || a.textContent || "").trim() : ""; });
for (const [w, h] of [[1440, 900], [1280, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }), tag = "w" + w;
  // E: the current sheet, unchanged
  { const p = await open(ctx, "pick=e");
    ok(tag + " E: no picker before Plan", (await p.locator(".pk-sheet").count()) === 0);
    await p.locator('#detail [data-act="plan"]').click(); await sleep(200);
    ok(tag + " E: bottom sheet opens", (await p.locator(".pk-sheet .days button").count()) === 7);
    ok(tag + " E: nothing preselected, confirm reads Pick a day and is disabled", (await p.locator('.days [aria-pressed=true]').count()) === 0 && (await p.locator("[data-ok]").innerText()) === "Pick a day" && await p.locator("[data-ok]").isDisabled());
    ok(tag + " E: Mon and Tue are past and disabled", await p.locator('.days button').nth(0).isDisabled() && await p.locator('.days button').nth(1).isDisabled());
    ok(tag + " E: a day with a meal shows its first word, a usual day off says Off", /Salmon/.test(await p.locator('.days button').nth(4).innerText()) && /Off/.test(await p.locator('.days button').nth(3).innerText()));
    ok(tag + " E: Hold is on by default", (await p.locator("[data-hold]").getAttribute("aria-pressed")) === "true");
    await p.locator('.days button').nth(5).click();
    ok(tag + " E: a day with someone else's meal gets a second meal", /adds a second meal/.test(await p.locator(".pk-note").innerText()) && (await p.locator("[data-ok]").innerText()) === "Plan for Sat");
    await p.locator('.days button').nth(4).click();
    ok(tag + " E: Home card replaces your own meal, button says Replace Fri's meal", (await p.locator("[data-ok]").innerText()).startsWith("Replace Fri") && /replaces it/.test(await p.locator(".pk-note").innerText()));
    await p.locator("[data-ok]").click(); await sleep(250);
    ok(tag + " E: sheet closes, toast with Undo, Home week shows the new meal", (await p.locator(".pk-sheet").count()) === 0 && /Mandarin Mango Yogurt Bowl replaces your meal on Fri 16 Oct, what is in is held/.test(await toast(p)) && /Mandarin/.test(await weekText(p)) && !/Salmon/.test(await weekText(p)));
    await p.keyboard.press("z"); await sleep(250);
    ok(tag + " E: Undo puts the replaced meal back", /Salmon/.test(await weekText(p)));
    await p.close(); }
  // A: strip plus keyboard layer
  { const p = await open(ctx, "pick=a");
    await p.keyboard.press("p"); await sleep(200);
    ok(tag + " A: P opens the sheet, today (Wed) is preselected and focused", (await p.locator('.days [aria-pressed=true]').getAttribute("aria-label")).startsWith("Wed") && (await focusedLabel(p)).startsWith("Wed"), await focusedLabel(p));
    ok(tag + " A: confirm already reads Plan for Wed", (await p.locator("[data-ok]").innerText()) === "Plan for Wed");
    await p.keyboard.press("ArrowLeft"); ok(tag + " A: Left stops at the first day that is not past", (await focusedLabel(p)).startsWith("Wed"));
    await p.keyboard.press("ArrowRight"); ok(tag + " A: Right moves to Thu (usual day off) and says so", (await focusedLabel(p)).startsWith("Thu") && /usual day off/.test(await p.locator(".pk-note").innerText()));
    await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight");
    ok(tag + " A: Right again reaches Sat, then Sun is the end", (await focusedLabel(p)).startsWith("Sat"));
    await p.keyboard.press("End"); ok(tag + " A: End goes to Sun", (await focusedLabel(p)).startsWith("Sun"));
    await p.keyboard.press("5"); ok(tag + " A: digit 5 jumps to Fri, which replaces your meal", (await focusedLabel(p)).startsWith("Fri") && (await p.locator("[data-ok]").innerText()).startsWith("Replace Fri"));
    await p.keyboard.press("t"); ok(tag + " A: letter T jumps to Thu (Tue is past)", (await focusedLabel(p)).startsWith("Thu"));
    await p.keyboard.press("s"); await p.keyboard.press("s"); ok(tag + " A: S then S again cycles Sat to Sun", (await focusedLabel(p)).startsWith("Sun"));
    await p.keyboard.press("j"); ok(tag + " A: other keys do not leak to Home while open (J does not move the row)", /recipe:mandarin-bowl/.test(decodeURIComponent(p.url())));
    await p.keyboard.press("?"); await sleep(250);
    ok(tag + " A: ? list carries the day keys", /Choosing a day \(Plan it, option A\)/.test(await p.locator("#kb").textContent()) && /Jump to a day/.test(await p.locator("#kb").textContent()));
    await p.keyboard.press("?"); await sleep(200);
    await p.keyboard.press("Escape"); await sleep(200);
    ok(tag + " A: Esc closes and focus returns to Plan", (await p.locator(".pk-sheet").count()) === 0 && /Add to plan/.test(await focusedLabel(p)));
    await p.keyboard.press("p"); await sleep(200); await p.keyboard.press("Enter"); await sleep(250);
    ok(tag + " A: Enter on today plans it (one key)", /is planned for Wed 14 Oct, what is in is held/.test(await toast(p)) && /Mandarin/.test(await weekText(p)), await toast(p));
    await p.keyboard.press("p"); await sleep(200);
    ok(tag + " A: this week has no free day left, so nothing is preselected (never a second meal by accident)", (await p.locator('.days [aria-pressed=true]').count()) === 0);
    await p.locator('.days button').nth(4).click(); await p.locator('[data-wk="1"]').click(); await sleep(100);
    ok(tag + " A: next week keeps the weekday chosen", (await p.locator('.days [aria-pressed=true]').getAttribute("aria-label")).startsWith("Fri"));
    await p.close(); }
  // B: quick picks
  { const p = await open(ctx, "pick=b");
    await p.locator('#detail [data-act="plan"]').click(); await sleep(200);
    const q = await p.locator(".pk-quick button").allInnerTexts();
    ok(tag + " B: Tonight, Tomorrow, Another day", /Tonight/.test(q[0]) && /Tomorrow/.test(q[1]) && /Another day/.test(q[2]), q);
    ok(tag + " B: no strip until asked", (await p.locator(".days").count()) === 0);
    await p.locator('[data-quick]').nth(1).click(); await sleep(150);
    ok(tag + " B: Tomorrow is a usual day off, so it waits for Plan with the note and the strip", (await p.locator(".pk-sheet").count()) === 1 && /usual day off/.test(await p.locator(".pk-note").innerText()) && (await p.locator('.days [aria-pressed=true]').count()) === 1);
    await p.locator("[data-less]").click(); await sleep(100);
    await p.locator('[data-quick]').nth(0).click(); await sleep(250);
    ok(tag + " B: Tonight on a free day is one click", (await p.locator(".pk-sheet").count()) === 0 && /is planned for Wed 14 Oct/.test(await toast(p)));
    await p.locator('#detail [data-act="plan"]').click(); await sleep(150);
    await p.locator("[data-more]").click(); await sleep(150);
    ok(tag + " B: Another day opens the strip with week arrows", (await p.locator(".days button").count()) === 7 && (await p.locator('[data-wk="1"]').count()) === 1);
    await p.locator('.days button').nth(6).click(); await p.locator("[data-ok]").click(); await sleep(250);
    ok(tag + " B: a day from the strip plans it", /is planned for Sun 18 Oct/.test(await toast(p)));
    await p.close(); }
  // C: four-week grid, anchored
  { const p = await open(ctx, "pick=c");
    await p.keyboard.press("p"); await sleep(250);
    ok(tag + " C: 28 cells, four rows", (await p.locator(".pkc").count()) === 28);
    ok(tag + " C: today is marked, two past days are greyed and disabled", (await p.locator(".pkc.today").count()) === 1 && await p.locator(".pkc").nth(0).isDisabled() && await p.locator(".pkc").nth(1).isDisabled() && !(await p.locator(".pkc").nth(2).isDisabled()));
    ok(tag + " C: each cell shows the meal there, in all four weeks", /Salmon/.test(await p.locator('.pkc[data-n="4"]').innerText()) && /Lamb/.test(await p.locator('.pkc[data-n="15"]').innerText()) && /Off/.test(await p.locator('.pkc[data-n="24"]').innerText()));
    ok(tag + " C: today preselected and focused", (await p.locator('.pkc[aria-selected=true]').getAttribute("data-n")) === "2" && (await p.evaluate(() => document.activeElement.dataset.n)) === "2");
    const box = await p.locator(".pk-pop").boundingBox(), pane = await p.locator("#detail").boundingBox(), btn = await p.locator('#detail [data-act="plan"]').boundingBox();
    ok(tag + " C: panel is anchored beside the Plan button, level with it, not over the page edge", box.x + box.width <= pane.x + 1 && box.y <= btn.y + btn.height && box.y + box.height >= btn.y && box.x >= 0 && box.y >= 0 && box.y + box.height <= h, { box, btn });
    await p.keyboard.press("ArrowDown"); ok(tag + " C: Down moves a week", (await p.evaluate(() => document.activeElement.dataset.n)) === "9" && /replaces it/.test(await p.locator(".pk-note").innerText()));
    await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowUp"); ok(tag + " C: Up cannot go into the past", (await p.evaluate(() => document.activeElement.dataset.n)) === "2");
    await p.keyboard.press("ArrowLeft"); ok(tag + " C: Left cannot go into the past", (await p.evaluate(() => document.activeElement.dataset.n)) === "2");
    await p.keyboard.press("End"); await p.keyboard.press("ArrowRight"); ok(tag + " C: Right past Sun goes to next Monday", (await p.evaluate(() => document.activeElement.dataset.n)) === "7");
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown");
    ok(tag + " C: Down stops at the fourth row", (await p.evaluate(() => document.activeElement.dataset.n)) === "21", await p.evaluate(() => document.activeElement.dataset.n));
    await p.keyboard.press("2"); ok(tag + " C: digit jumps within that week", (await p.evaluate(() => document.activeElement.dataset.n)) === "22");
    await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + " C: Enter plans a day three weeks ahead; panel closes; Undo in the message", (await p.locator(".pk-pop").count()) === 0 && /is planned for Tue 3 Nov/.test(await toast(p)), await toast(p));
    await p.keyboard.press("p"); await sleep(250);
    ok(tag + " C: reopened, that day now shows the meal", /Mandarin/.test(await p.locator('.pkc[data-n="22"]').innerText()));
    await p.mouse.click(300, 600); await sleep(200);
    ok(tag + " C: a click outside closes it", (await p.locator(".pk-pop").count()) === 0);
    await p.keyboard.press("p"); await sleep(250); await p.keyboard.press("?"); await sleep(250);
    ok(tag + " C: ? list carries the grid keys", /Choosing a day \(Plan it, option C\)/.test(await p.locator("#kb").textContent()) && /Move between days and weeks/.test(await p.locator("#kb").textContent()));
    await p.keyboard.press("?"); await sleep(200); await p.keyboard.press("Escape"); await sleep(200);
    ok(tag + " C: Esc closes", (await p.locator(".pk-pop").count()) === 0);
    await p.close(); }
  // C with a Hard avoid: stop for the person, warn for the household, leave out plans for the others
  { const p = await open(ctx, "pick=c&avoid=mango");
    await p.keyboard.press("p"); await sleep(250);
    ok(tag + " C guard: household meal warns, no Plan, one action", (await p.locator('[data-guard=warn]').count()) === 1 && await p.locator("[data-ok]").isDisabled() && /Leave Jo out of this meal/.test(await p.locator("[data-leave]").innerText()));
    await p.locator('[data-who="Jo"]').click(); await sleep(100);
    ok(tag + " C guard: a meal for Jo alone is a hard stop with no way past", (await p.locator('[data-guard=stop]').count()) === 1 && (await p.locator("[data-leave]").count()) === 0 && await p.locator("[data-ok]").isDisabled());
    await p.locator('[data-who="Sam"]').click(); await sleep(100);
    ok(tag + " C guard: a meal for Sam alone is not touched", (await p.locator('[data-guard]').count()) === 0 && !(await p.locator("[data-ok]").isDisabled()));
    await p.locator('[data-who="all"]').click(); await sleep(100); await p.locator("[data-leave]").click(); await sleep(250);
    ok(tag + " C guard: Leave Jo out plans it for Sam only, with Undo", /for Sam only/.test(await toast(p)) && /Undo/.test(await toast(p)));
    await p.close(); }
  // D: choose on the Plan page, drag and drop
  { const p = await open(ctx, "pick=d");
    await p.locator('#detail [data-act="plan"]').click(); await sleep(250);
    ok(tag + " D: opens the Plan page week in place, no sheet", (await p.locator(".pk-plan").count()) === 1 && (await p.locator(".pk-sheet").count()) === 0 && (await p.locator(".pk-dr").count()) === 7);
    ok(tag + " D: past days greyed and not a drop target", (await p.locator('.pk-dr.past').count()) === 2);
    await p.locator("[data-carry]").dragTo(p.locator('.pk-dr[data-n="5"]')); await sleep(300);
    ok(tag + " D: dropping the meal on Sat adds a second meal there and shows it", (await p.locator('.pk-dr[data-n="5"] .pk-m').count()) === 2 && /is planned for Sat 17 Oct/.test(await toast(p)), await toast(p));
    await p.locator("[data-back]").click(); await sleep(200);
    ok(tag + " D: back to Home, This week shows it", (await p.locator(".pk-plan").count()) === 0 && /Mandarin/.test(await weekText(p)));
    await p.locator('#detail [data-act="plan"]').click(); await sleep(250);
    await p.locator('.pk-dr[data-n="4"]').click(); await sleep(250);
    ok(tag + " D: a drop on a day with your own meal adds a second meal, it does not replace (Replace is the Home card only)", (await p.locator('.pk-dr[data-n="4"] .pk-m').count()) === 2);
    await p.close(); }
  // F (the owner's choice): flyout in the This week slot, who pills, a rolling seven-day list that is the picker, picking commits, no Cancel or Confirm
  { const p = await open(ctx, "pick=f");
    const slot0 = await p.locator("#week").boundingBox(); const wk0 = await p.locator("#week .wd").count();
    await p.keyboard.press("p"); await sleep(300);
    const slot1 = await p.locator("#week").boundingBox();
    ok(tag + " F: opens in the This week slot (same element, same place), its content swapped", (await p.locator("#week.pk-fly").count()) === 1 && Math.abs(slot0.x - slot1.x) < 2 && Math.abs(slot0.width - slot1.width) < 8 && wk0 === 7 && (await p.locator("#week .wd").count()) === 0, { slot0, slot1 });
    ok(tag + " F: no sheet, popover, curtain, grid, week arrows, quick picks", (await p.locator(".pk-sheet,.pk-pop,.pk-curtain,.pk-grid,.pk-quick,.pkc,[data-wk]").count()) === 0);
    const pills = await p.locator("#week [data-who]").allInnerTexts();
    ok(tag + " F: Who is it for pills at the top (Everyone, Sam, Jo), Everyone on", pills.join() === "Everyone,Sam,Jo" && (await p.locator('#week [data-who="all"]').getAttribute("aria-pressed")) === "true", pills);
    const dl = await p.locator("#week .row-d .dl").allInnerTexts();
    ok(tag + " F: seven rows, rolling from today (Wed first, Tue last, not Monday first), day name only", dl.join() === "Wed,Thu,Fri,Sat,Sun,Mon,Tue" && (await p.locator("#week .row-d.today").count()) === 1 && dl.every(x => /^[A-Za-z]{3}$/.test(x)), dl);
    const txt = i => p.locator("#week .row-d").nth(i).innerText();
    ok(tag + " F: each row shows what is planned that night, in full", /Open/.test(await txt(0)) && /Not cooking/.test(await txt(1)) && /Every week, usual day off/.test(await txt(1)) && /Salmon patties/.test(await txt(2)) && /Veg stir-fry/.test(await txt(3)) && /Prawn curry/.test(await txt(5)) && /Not cooking/.test(await txt(6)) && /This week only/.test(await txt(6)));
    const btns = await p.locator("#week button").allInnerTexts();
    ok(tag + " F: no Cancel, Confirm, Plan for or Pick a day button; the X is the only close button", !btns.some(t => /^(Cancel|Confirm|Plan for|Pick a day|Replace)/i.test(t.trim())) && (await p.locator("#week [data-close]").count()) === 1 && (await p.locator("#week [data-ok]").count()) === 0, btns);
    ok(tag + " F: Everyone shows only the household plan in the row (not Jo's carve-out), with a peek behind Fri, Sun and Mon, none on Wed", !/Cheese toastie/.test(await txt(5)) && (await p.locator("#week .peek-b").count()) === 3 && (await p.locator('#week [data-w="0"] .peek-b').count()) === 0 && (await p.locator('#week [data-w="5"] .peek-b').count()) === 1);
    ok(tag + " F: at rest only the peek, no full picture", (await p.locator("#week .row-full").count()) === 0);
    await p.locator('#week [data-w="5"] .peek-b').click(); await sleep(120);
    const full = await p.locator("#week .row-full").allInnerTexts();
    ok(tag + " F: opening Mon shows that night in full (household and Jo's own plan), only that day", full.length === 1 && /Household/.test(full[0]) && /Prawn curry/.test(full[0]) && /without Jo/.test(full[0]) && /Jo/.test(full[0]) && /Cheese toastie/.test(full[0]) && (await p.locator('#week [data-w="5"].open').count()) === 1, full);
    await p.locator('#week [data-w="4"] .peek-b').click(); await sleep(120);
    ok(tag + " F: opening Sun folds Mon (one night at a time)", (await p.locator("#week .row-full").count()) === 1 && (await p.locator('#week [data-w="4"].open').count()) === 1 && (await p.locator('#week [data-w="5"].open').count()) === 0 && /Chilli noodles/.test(await p.locator("#week .row-full").innerText()));
    await p.locator('#week [data-w="4"] .peek-b').click(); await sleep(120);
    ok(tag + " F: Hide folds it back to the peek", (await p.locator("#week .row-full").count()) === 0 && (await p.locator('#week [data-w="4"] .peek-b').count()) === 1);
    await p.locator('#week .row-d').nth(5).focus(); await p.keyboard.press("ArrowRight"); await sleep(100);
    ok(tag + " F: Right opens the full picture, Left folds it", (await p.locator("#week .row-full").count()) === 1);
    await p.locator('#week .row-d').nth(5).focus(); await p.keyboard.press("ArrowLeft"); await sleep(100);
    ok(tag + " F: Left folds it", (await p.locator("#week .row-full").count()) === 0);
    await p.keyboard.press("?"); await sleep(250);
    ok(tag + " F: ? list carries the flyout keys", /Choosing a night \(Plan it, option F\)/.test(await p.locator("#kb").textContent()));
    await p.keyboard.press("?"); await sleep(200);
    await p.keyboard.press("Escape"); await sleep(250);
    ok(tag + " F: Esc closes, This week is handed back, focus returns to Add to plan", (await p.locator("#week.pk-fly").count()) === 0 && (await p.locator("#week .wd").count()) === 7 && /Add to plan/.test(await focusedLabel(p)));
    await p.keyboard.press("p"); await sleep(250); await p.locator("#week [data-close]").click(); await sleep(200);
    ok(tag + " F: the X closes it", (await p.locator("#week.pk-fly").count()) === 0 && (await p.locator("#week .wd").count()) === 7);
    await p.keyboard.press("p"); await sleep(250);
    ok(tag + " F: focus lands on the first row, arrows move, Enter is the pick", /^Wed/.test(await focusedLabel(p)));
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown"); ok(tag + " F: Down moves along the nights", /^Fri/.test(await focusedLabel(p)));
    await p.keyboard.press("End"); ok(tag + " F: End goes to the last night", /^Tue/.test(await focusedLabel(p))); await p.keyboard.press("Home");
    await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + " F: Enter on Wed plans it at once: the toast with Undo is up and the flyout stays open with the confirmation", /is planned for Wed 14 Oct, what is in is held/.test(await toast(p)) && (await p.locator("#week.pk-fly .pk-conf").count()) === 1 && (await p.locator("#week .row-d").count()) === 0, await toast(p));
    await p.keyboard.press("Escape"); await sleep(120);
    ok(tag + " F: Esc ends the hold early: the slot is handed back with the meal in This week", (await p.locator("#week.pk-fly").count()) === 0 && /Mandarin/.test(await weekText(p)));
    await p.close(); }
  { const p = await open(ctx, "pick=f"); await p.keyboard.press("p"); await sleep(250);
    await p.locator("#week .row-d").nth(3).click(); await sleep(300);
    ok(tag + " F: clicking Sat (a household meal) is a Replace, with Undo", /replaces Veg stir-fry on Sat 17 Oct/.test(await toast(p)) && /Undo/.test(await toast(p)) && /Replaced/.test(await p.locator("#week .pk-conf").innerText()), await toast(p));
    await p.keyboard.press("z"); await sleep(250); await p.keyboard.press("p"); await sleep(250);
    ok(tag + " F: Undo puts the household meal back", /Veg stir-fry/.test(await p.locator("#week .row-d").nth(3).innerText()));
    await p.locator("#week .row-d").nth(1).click(); await sleep(300);
    ok(tag + " F: a usual day off is not locked: Thu takes a meal", /is planned for Thu 15 Oct/.test(await toast(p)), await toast(p));
    ok(tag + " F off day: the confirmation reuses the Plan's wording, no new copy", /Thu: cooking this week\. The usual day off stays\./.test(await p.locator("#week .pk-conf").innerText()), await p.locator("#week .pk-conf").innerText());
    await p.keyboard.press("Escape"); await sleep(60); await p.keyboard.press("p"); await sleep(250);
    ok(tag + " F off day: after the pick the row says Usual day off, cooking this week", /Usual day off, cooking this week/.test(await p.locator("#week .row-d").nth(1).innerText()) && /Mandarin/.test(await p.locator("#week .row-d").nth(1).innerText()));
    await p.keyboard.press("Escape"); await sleep(60); await p.keyboard.press("p"); await sleep(250);
    await p.locator("#week .row-d").nth(4).click(); await sleep(200);
    ok(tag + " F two-step: first pick on a stacked night (Sun: household open plus Jo's own) only expands it in place, nothing planned", (await p.locator('#week [data-w="4"].open').count()) === 1 && (await p.locator("#week .row-full").count()) === 1 && /Chilli noodles/.test(await p.locator("#week .row-full").innerText()) && /Pick the row again/.test(await p.locator("#week .row-full").innerText()) && !/Sun 18 Oct/.test(await toast(p)));
    ok(tag + " F two-step: the flyout is still open on the list, no confirmation yet", (await p.locator("#week .pk-conf").count()) === 0 && (await p.locator("#week.pk-fly .row-d").count()) === 7);
    await p.locator("#week .row-d").nth(4).click(); await sleep(300);
    ok(tag + " F two-step: the second pick commits, and the confirmation hold starts then", (await p.locator("#week .pk-conf").count()) === 1);
    ok(tag + " F: Everyone on a night where Jo has her own plan: planned for everyone but Jo, Jo's meal stays", /is planned for Sun 18 Oct, for everyone but Jo\. Jo’s meal stays\./.test(await toast(p)), await toast(p));
    await p.keyboard.press("Escape"); await sleep(60); await p.keyboard.press("p"); await sleep(250);
    ok(tag + " F: Jo's own meal is still there under the peek", (await p.locator('#week [data-w="4"] .peek-b').count()) === 1);
    await p.locator('#week [data-w="4"] .peek-b').click(); await sleep(100);
    ok(tag + " F: the full picture shows both", /Chilli noodles/.test(await p.locator("#week .row-full").innerText()) && /Mandarin/.test(await p.locator("#week .row-full").innerText()));
    await p.locator('#week [data-w="5"] .peek-b').click(); await sleep(100); await p.locator("#week .row-d").nth(5).click(); await sleep(300);
    ok(tag + " F: Everyone on Mon (household meal, Jo has her own): replaces the household meal, Jo's stays", /replaces Prawn curry with Mandarin|replaces Prawn curry on Mon 19 Oct, for everyone but Jo/.test(await toast(p)) && /Jo’s meal stays/.test(await toast(p)), await toast(p));
    await p.close(); }
  { const p = await open(ctx, "pick=f"); await p.keyboard.press("p"); await sleep(250);
    await p.locator('#week [data-who="Sam"]').click(); await sleep(100);
    ok(tag + " F: Sam only: the Sat row says it takes Sam out of the household meal; Fri replaces his own", /Takes you out of Veg stir-fry/.test(await p.locator("#week .row-d").nth(3).innerText()) && /Replaces Salmon patties/.test(await p.locator("#week .row-d").nth(2).innerText()) && /Open/.test(await p.locator("#week .row-d").nth(4).innerText()));
    ok(tag + " F: Sam only: no peek (only Everyone shows it)", (await p.locator("#week .peek-b").count()) === 0);
    await p.locator("#week .row-d").nth(3).click(); await sleep(300);
    ok(tag + " F: Sam only on a household night plans his own and takes only him out of that meal", /is planned for Sat 17 Oct/.test(await toast(p)));
    await p.keyboard.press("Escape"); await sleep(60); await p.keyboard.press("p"); await sleep(250);
    ok(tag + " F: Everyone's row for Sat now has a peek (Sam has his own plan) and the household meal is untouched", (await p.locator('#week [data-w="3"] .peek-b').count()) === 1 && /Veg stir-fry/.test(await p.locator("#week .row-d").nth(3).innerText()));
    await p.locator('#week [data-who="Jo"]').click(); await sleep(100);
    ok(tag + " F: Jo: Jo's own night says her meal stays", /Jo’s meal stays/.test(await p.locator("#week .row-d").nth(4).innerText()));
    await p.close(); }
  { const p = await open(ctx, "pick=f"); await p.keyboard.press("p"); await sleep(250);
    await p.locator("[data-avoid]").click(); await sleep(100);
    ok(tag + " F guard: Everyone asks first (warning), nothing planned by picking", /Hard avoid on mango/.test(await p.locator("#week .row-d").nth(3).innerText()));
    await p.locator("#week .row-d").nth(3).click(); await sleep(200);
    ok(tag + " F guard: picking shows the warning with Leave Jo out and plans nothing", (await p.locator('[data-guard=warn]').count()) === 1 && (await toast(p)) === "" && (await p.locator("#week.pk-fly").count()) === 1);
    await p.locator("[data-leave]").click(); await sleep(300);
    ok(tag + " F guard: Leave Jo out plans it for the others", /for everyone but Jo/.test(await toast(p)), await toast(p));
    await p.keyboard.press("Escape"); await sleep(60); await p.keyboard.press("p"); await sleep(250); await p.locator('#week [data-who="Jo"]').click(); await sleep(100);
    await p.locator("#week .row-d").nth(0).click({force:true}); await sleep(200);
    ok(tag + " F guard: a meal for Jo alone is a hard stop: no way past, nothing planned", (await p.locator('[data-guard=stop]').count()) === 1 && (await p.locator("[data-leave]").count()) === 0 && (await p.locator("#week.pk-fly").count()) === 1);
    await p.close(); }
  { const p = await open(ctx, "pick=f&off=refuse"); await p.keyboard.press("p"); await sleep(250);
    ok(tag + " F off rule (today's code): off days say what the code answers", /Thu is off for you\. Pick another day\./.test(await p.locator("#week .row-d").nth(1).innerText()));
    await p.locator("#week .row-d").nth(1).click({force:true}); await sleep(200);
    ok(tag + " F off rule: picking an off day is refused, with the code's wording, and nothing is planned", /Thu is off for you\. Pick another day\./.test(await toast(p)) && (await p.locator("#week.pk-fly").count()) === 1);
    await p.close(); }
  { const p = await open(ctx, "pick=f"); await p.keyboard.press("p"); await sleep(250);
    const t0 = Date.now(); await p.locator("#week .row-d").nth(0).click(); await sleep(150);
    ok(tag + " F hold: a fresh plan (empty day) says Planned plus the meal and the day", /^planned/i.test((await p.locator("#week .pk-conf-v").innerText()).trim()) && /Mandarin Mango Yogurt Bowl/.test(await p.locator("#week .pk-conf-n").innerText()) && /Wed 14 Oct/.test(await p.locator("#week .pk-conf-d").innerText()));
    await sleep(2200);
    ok(tag + " F hold: still open and not sliding at about 2.4 seconds", (await p.locator("#week.pk-fly .pk-conf").count()) === 1 && (await p.locator("#week.pk-out").count()) === 0);
    await p.waitForSelector("#week.pk-out", { timeout: 2000 });
    const tOut = Date.now() - t0;
    ok(tag + " F hold: the slide-out starts after about 3 seconds", tOut >= 2800 && tOut <= 3700, tOut);
    const dir = await p.evaluate(() => new Promise(r => { const e = document.querySelector("#week"); const a = e.getAnimations()[0]; const kf = a ? a.effect.getKeyframes() : []; r({ name: a && a.animationName, to: kf.length ? kf[kf.length - 1].transform : null }); }));
    ok(tag + " F hold: it slides out to the right (the side it came in from)", dir.name === "pk-slide-out" && /translateX\(\s*32px/.test(dir.to || ""), dir);
    await sleep(500);
    ok(tag + " F hold: after the slide-out the slot is handed back with the meal in This week; the Undo chip stays", (await p.locator("#week.pk-fly").count()) === 0 && (await p.locator("#week .wd").count()) === 7 && /Mandarin/.test(await weekText(p)) && /Undo/.test(await toast(p)));
    await p.keyboard.press("p"); await sleep(250); await p.locator("#week .row-d").nth(3).click(); await sleep(150);
    ok(tag + " F hold: a replace says Replaced plus the new meal", /^replaced/i.test((await p.locator("#week .pk-conf-v").innerText()).trim()) && /Mandarin Mango Yogurt Bowl/.test(await p.locator("#week .pk-conf-n").innerText()));
    await p.keyboard.press("Escape"); await sleep(100);
    ok(tag + " F hold: Esc during the hold closes it at once (well before 3 seconds), no one is trapped", (await p.locator("#week.pk-fly").count()) === 0 && (await p.locator("#week .wd").count()) === 7);
    await p.keyboard.press("p"); await sleep(250); await p.locator("#week .row-d").nth(5).click(); await sleep(150); await p.locator("#week [data-close]").click(); await sleep(100);
    ok(tag + " F hold: the X during the hold closes it too", (await p.locator("#week.pk-fly").count()) === 0);
    await p.close(); }
  { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); await p.goto(BASE.replace("home.html", "day-rows.html")); await sleep(400);
    await p.locator("#demo .row-d").nth(0).click(); await sleep(150);
    ok(tag + " day rows: a pick shows Planned plus the meal, then the panel slides out to the right after about 3 seconds", /^planned/i.test((await p.locator("#demo .pk-conf-v").innerText()).trim()) && /Mandarin/.test(await p.locator("#demo .pk-conf-n").innerText()));
    await p.waitForFunction(() => document.querySelector("#demo").classList.contains("pk-out"), null, { timeout: 4500, polling: 15 });
    ok(tag + " day rows: slide-out is the right-hand one", (await p.evaluate(() => document.querySelector("#demo").getAnimations()[0].animationName)) === "pk-slide-out");
    await sleep(450);
    ok(tag + " day rows: the list is back afterwards", (await p.locator("#demo .row-d").count()) === 7 && (await p.locator("#demo .pk-conf").count()) === 0);
    await p.locator("#demo .row-d").nth(3).click(); await sleep(120);
    ok(tag + " day rows: a replace says Replaced", /^replaced/i.test((await p.locator("#demo .pk-conf-v").innerText()).trim()));
    await p.keyboard.press("Escape"); await sleep(100);
    ok(tag + " day rows: Esc ends the hold early", (await p.locator("#demo .row-d").count()) === 7);
    await p.locator("#demo .row-d").nth(5).click(); await sleep(150);
    ok(tag + " day rows two-step: a stacked night (Mon) first expands, shows both, nothing planned", (await p.locator("#demo .pk-conf").count()) === 0 && (await p.locator("#demo .row-full").count()) === 1);
    await p.locator("#demo .row-d").nth(5).click(); await sleep(150);
    ok(tag + " day rows two-step: the second pick commits and the confirmation starts", (await p.locator("#demo .pk-conf").count()) === 1);
    await p.keyboard.press("Escape"); await sleep(100);
    await p.locator("#demo .row-d").nth(1).click(); await sleep(150);
    ok(tag + " day rows: a usual day off shows the Plan's own wording after the pick", /Thu: cooking this week\. The usual day off stays\./.test(await p.locator("#demo .pk-conf").innerText()));
    await p.keyboard.press("Escape"); await sleep(100);
    await p.close(); }
  // G: curtain under Cooking ideas, Add to plan only on the cards
  { const p = await open(ctx, "pick=g");
    ok(tag + " G: no Add to plan button in the recipe detail, and no P hint for it", (await p.locator('#detail [data-act="plan"]').count()) === 0 && !/add to plan/i.test(await p.locator("#detail").innerText()) && /Open recipe/.test(await p.locator("#detail").innerText()));
    await p.keyboard.press("p"); await sleep(200);
    ok(tag + " G: P does nothing in the detail (no curtain, no plan)", (await p.locator(".pk-curtain").count()) === 0 && (await toast(p)) === "");
    ok(tag + " G: each card under Cooking ideas has Plan (Tonight and Other ideas)", (await p.locator('#ideas [data-act="quickplan"]').count()) === 5);
    await p.locator('#ideas [data-act="quickplan"]').first().click(); await sleep(250);
    ok(tag + " G: a curtain drops directly under the Cooking ideas card, in place", await p.evaluate(() => { const c = document.querySelector(".pk-curtain"); return !!c && c.previousElementSibling && c.previousElementSibling.id === "ideas"; }) && (await p.locator(".pk-sheet,.pk-pop,#week.pk-fly").count()) === 0);
    const bt = await p.locator(".pk-quick button").allInnerTexts();
    ok(tag + " G: Today, Tomorrow, Other", /Today/.test(bt[0]) && /Tomorrow/.test(bt[1]) && /Other/.test(bt[2]), bt);
    ok(tag + " G: focus lands on Today", /Today/.test(await p.evaluate(() => document.activeElement.textContent)));
    await p.keyboard.press("Escape"); await sleep(200);
    ok(tag + " G: Esc closes the curtain and focus returns to the card's Plan", (await p.locator(".pk-curtain").count()) === 0 && await p.evaluate(() => document.activeElement.matches('#ideas [data-act="quickplan"]')));
    await p.locator('#ideas [data-act="quickplan"]').nth(1).click(); await sleep(250);
    ok(tag + " G: an Other ideas card opens the curtain for that recipe", /Plan Lime chicken tacos/.test(await p.locator(".pk-curtain h3").innerText()));
    await p.locator('[data-quick]').nth(1).click(); await sleep(150);
    ok(tag + " G: Tomorrow (a usual day off) waits for Plan with the note", (await p.locator(".pk-curtain").count()) === 1 && /usual day off/.test(await p.locator(".pk-note").innerText()));
    await p.locator("[data-close]").first().click(); await sleep(150);
    await p.locator('#ideas [data-act="quickplan"]').first().click(); await sleep(200);
    await p.locator('[data-quick]').nth(0).click(); await sleep(300);
    ok(tag + " G: Today on a free day is one click; the curtain closes, This week shows it", (await p.locator(".pk-curtain").count()) === 0 && /is planned for Wed 14 Oct/.test(await toast(p)) && /Mandarin/.test(await weekText(p)));
    await p.close(); }
  { const p = await open(ctx, "pick=g");
    await p.locator('#ideas [data-act="quickplan"]').first().click(); await sleep(200); await p.locator("[data-other]").click(); await sleep(200);
    ok(tag + " G Other as a week strip: seven days with week arrows, no grid", (await p.locator(".pk-curtain .days button").count()) === 7 && (await p.locator('.pk-curtain [data-wk="1"]').count()) === 1 && (await p.locator(".pk-curtain .pkc").count()) === 0);
    ok(tag + " G strip: today is preselected and focused", (await p.evaluate(() => document.activeElement.getAttribute("aria-label") || "")).startsWith("Wed"));
    await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight");
    ok(tag + " G strip: arrows move along the days", (await p.evaluate(() => document.activeElement.getAttribute("aria-label"))).startsWith("Sat"));
    await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + " G strip: Enter plans it", /is planned for Sat 17 Oct/.test(await toast(p)) && (await p.locator(".pk-curtain").count()) === 0);
    await p.locator('#ideas [data-act="quickplan"]').first().click(); await sleep(200); await p.locator("[data-other]").click(); await sleep(150);
    await p.locator('[data-variant="grid"]').click(); await sleep(150);
    ok(tag + " G: the Mockup only toggle switches Other to the small grid", (await p.locator(".pk-curtain .pkc").count()) === 28 && (await p.locator(".pk-curtain .days").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "pick=g&other=grid");
    await p.locator('#ideas [data-act="quickplan"]').first().click(); await sleep(200); await p.locator("[data-other]").click(); await sleep(200);
    ok(tag + " G ?other=grid: Other opens the small four-week grid, today preselected", (await p.locator(".pk-curtain .pkc").count()) === 28 && (await p.locator('.pk-curtain .pkc[aria-selected=true]').getAttribute("data-n")) === "2");
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowRight"); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + " G grid: arrows and Enter plan a day two weeks ahead", /is planned for Fri 30 Oct/.test(await toast(p)) || /is planned for Thu 29 Oct/.test(await toast(p)), await toast(p));
    await p.keyboard.press("?"); await sleep(250);
    ok(tag + " G: ? list has the curtain keys and no longer says P adds to plan", /option G/.test(await p.locator("#kb").textContent()) && !/Add to plan, Open recipe/.test(await p.locator("#kb").textContent()));
    await p.close(); }
  // Owner rule, 16 Oct 2026: no Plan on the primary card (or in its pane) when it is the meal already planned for tonight; Plan when nothing is planned; Other ideas always keep Plan
  for (const o of ["a", "b", "c", "d", "e", "f", "g"]) {
    { const p = await open(ctx, "pick=" + o);
      ok(tag + " rule " + o + ": nothing planned tonight, the primary card has Plan and no Start cooking", (await p.locator('#ideas .lead [data-act="quickplan"]').count()) === 1 && !/Start cooking/.test(await p.locator("#ideas").innerText()));
      if (o !== "g") ok(tag + " rule " + o + ": nothing planned tonight, the pane has Add to plan", (await p.locator('#detail [data-act="plan"]').count()) === 1);
      ok(tag + " rule " + o + ": Other ideas have Plan", (await p.locator('#ideas .ir [data-act="quickplan"]').count()) === 4);
      await p.close(); }
    { const p = await open(ctx, "pick=" + o + "&night=planned");
      ok(tag + " rule " + o + ": planned tonight, the primary card says Planned for today and has no Plan", /Planned for today/i.test(await p.locator("#ideas .lead").innerText()) && (await p.locator('#ideas .lead [data-act="quickplan"], #ideas .lead [data-act="planlink"], #ideas .lead [data-act="plan"]').count()) === 0 && !/^Plan$/m.test(await p.locator("#ideas .lead").innerText()), await p.locator("#ideas .lead").innerText());
      ok(tag + " rule " + o + ": planned tonight, the primary card has Start cooking", (await p.locator("#ideas .lead button.btn").allInnerTexts()).join() === "Start cooking");
      await p.locator("#ideas .lead button.btn").click(); await sleep(200);
      const md = p.locator(".cookmd-d");
      ok(tag + " rule " + o + ": one click on Start cooking opens a modal (dialog, overlay), no confirm step", (await md.count()) === 1 && (await md.getAttribute("role")) === "dialog" && (await md.getAttribute("aria-modal")) === "true");
      const ov = await p.evaluate(() => { const m = document.querySelector(".cookmd"), r = m.getBoundingClientRect(); return { pos: getComputedStyle(m).position, w: r.width, h: r.height, inLead: !!m.closest("#ideas"), vw: innerWidth, vh: innerHeight }; });
      ok(tag + " rule " + o + ": it is a floating overlay over the page, not an inline tag in the card", ov.pos === "fixed" && ov.w >= ov.vw - 2 && ov.h >= ov.vh - 2 && !ov.inLead, ov);
      const box = await md.boundingBox();
      ok(tag + " rule " + o + ": front and centre", Math.abs(box.x + box.width / 2 - 720 * (await p.evaluate(() => innerWidth)) / 720 / 2) < 4 && Math.abs(box.y + box.height / 2 - (await p.evaluate(() => innerHeight)) / 2) < 40, box);
      const mt = await md.innerText();
      ok(tag + " rule " + o + ": it shows cooking content: the dish, an ingredients list with amounts, Done, Open saved recipe; no steps invented", /Mandarin Mango Yogurt Bowl/.test(mt) && (await p.locator(".cookmd-l li").count()) >= 3 && (await p.locator(".cookmd-l li b").first().innerText()).length > 0 && /Done/.test(mt) && /Open saved recipe/.test(mt) && !/\bsteps?\b|method/i.test(mt), mt);
      ok(tag + " rule " + o + ": the session is live at once (banner shows Cooking now), and the page behind is not marked as the status tag", /cooking now/i.test(await p.locator(".cookbn").innerText()));
      await p.locator(".cookmd-l button").first().click();
      ok(tag + " rule " + o + ": an ingredient can be ticked", (await p.locator(".cookmd-l button").first().getAttribute("aria-checked")) === "true");
      await p.keyboard.press("Escape"); await sleep(100);
      ok(tag + " rule " + o + ": Esc closes the modal and cooking carries on (banner stays)", (await p.locator(".cookmd").count()) === 0 && (await p.locator(".cookbn").count()) === 1);
      await p.locator("#ideas .lead button.btn").click(); await sleep(150);
      ok(tag + " rule " + o + ": the card button reopens it (ticks kept)", (await p.locator(".cookmd").count()) === 1 && (await p.locator(".cookmd-l button").first().getAttribute("aria-checked")) === "true");
      await p.locator("[data-cookdone]").click(); await sleep(150);
      ok(tag + " rule " + o + ": Done stops cooking: modal and banner gone, the button is back to Start cooking", (await p.locator(".cookmd").count()) === 0 && (await p.locator(".cookbn").count()) === 0 && (await p.locator("#ideas .lead button.btn").innerText()) === "Start cooking");
      ok(tag + " rule " + o + ": planned tonight, the pane has no Add to plan and no P hint for it", (await p.locator('#detail [data-act="plan"]').count()) === 0 && !/add to plan/i.test(await p.locator("#detail").innerText()));
      ok(tag + " rule " + o + ": Other ideas keep Plan", (await p.locator('#ideas .ir [data-act="quickplan"]').count()) === 2);
      await p.keyboard.press("p"); await sleep(200);
      ok(tag + " rule " + o + ": P on the planned meal opens nothing", (await p.locator(".pk-sheet,.pk-pop,.pk-plan,.pk-curtain,#week.pk-fly").count()) === 0);
      await p.locator('#ideas .ir [data-act="quickplan"]').first().click(); await sleep(300);
      ok(tag + " rule " + o + ": an Other idea still opens the picker", (await p.locator(".pk-sheet,.pk-pop,.pk-plan,.pk-curtain,#week.pk-fly").count()) >= 1);
      await p.close(); }
  }
  { const p = await open(ctx, "pick=e&night=planned");
    await p.locator('#ideas .ir [data-act="quickplan"]').first().click(); await sleep(250); await p.locator('.days button').nth(2).click();
    ok(tag + " rule: an Other idea can override tonight (Replace, as the Home card does)", (await p.locator("[data-ok]").innerText()).startsWith("Replace Wed"), await p.locator("[data-ok]").innerText());
    await p.close(); }
  { const p = await open(ctx, "pick=c&night=planned");
    ok(tag + " rule: the planned state is the same page; the Tonight switch in the rail says Planned and the option links keep it", (await p.locator('.pk-sw a.w[aria-current]').innerText()) === "Planned" && /night=planned/.test(await p.locator('.pk-sw a[href*="pick=a"]').getAttribute("href")));
    await p.close(); }
  // layout and errors
  for (const o of ["a", "b", "c", "d", "e", "f"]) { const p = await open(ctx, "pick=" + o); await p.keyboard.press("p"); await sleep(250);
    ok(tag + " " + o + ": no horizontal scroll with the picker open", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (o !== "f") ok(tag + " " + o + ": the picker is a dialog with a name", (await p.locator('[role=dialog][aria-labelledby=pk-t], [role=dialog][aria-label="Plan page"]').count()) >= 1);
    await p.close(); }
  await ctx.close();
}
ok("no console or page errors", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log(fails ? fails + " of " + total + " checks FAILED" : "all " + total + " checks passed"); process.exit(fails ? 1 : 0);
