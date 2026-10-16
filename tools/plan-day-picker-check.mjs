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
  // F: right-side flyout in the This week slot, roomy grid or tight two-step
  { const p = await open(ctx, "pick=f&fit=roomy");
    const slot0 = await p.locator("#week").boundingBox(); const wk0 = await p.locator("#week .wd").count();
    await p.keyboard.press("p"); await sleep(300);
    const slot1 = await p.locator("#week").boundingBox();
    ok(tag + " F: roomy shows the four-week grid in the This week slot (same element, same place)", (await p.locator("#week.pk-fly .pkc").count()) === 28 && (await p.locator(".pk-fly").count()) === 1 && Math.abs(slot0.x - slot1.x) < 2 && Math.abs(slot0.width - slot1.width) < 8, { slot0, slot1 });
    ok(tag + " F: the normal This week content is swapped out while picking; no sheet, no popover", wk0 === 7 && (await p.locator("#week .wd").count()) === 0 && (await p.locator(".pk-sheet,.pk-pop,.pk-curtain").count()) === 0);
    ok(tag + " F: today preselected and focused; past greyed", (await p.evaluate(() => document.activeElement.dataset.n)) === "2" && await p.locator(".pkc").nth(0).isDisabled());
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowRight");
    ok(tag + " F: arrows move in two directions", (await p.evaluate(() => document.activeElement.dataset.n)) === "10");
    await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowLeft"); await p.keyboard.press("Escape"); await sleep(250);
    ok(tag + " F: Esc hands the slot back to This week and focus returns to Add to plan", (await p.locator("#week.pk-fly").count()) === 0 && (await p.locator("#week .wd").count()) === 7 && /Add to plan/.test(await focusedLabel(p)));
    await p.keyboard.press("p"); await sleep(250); await p.keyboard.press("Enter"); await sleep(300);
    ok(tag + " F: Enter plans today, the slot is handed back with the meal in This week", /is planned for Wed 14 Oct/.test(await toast(p)) && (await p.locator("#week.pk-fly").count()) === 0 && /Mandarin/.test(await weekText(p)));
    await p.keyboard.press("p"); await sleep(250); await p.keyboard.press("?"); await sleep(250);
    ok(tag + " F: ? list carries the flyout keys", /Choosing a day \(Plan it, option F\)/.test(await p.locator("#kb").textContent()));
    await p.keyboard.press("?"); await sleep(200); await p.locator("[data-close]").first().click(); await sleep(200);
    ok(tag + " F: Cancel hands the slot back", (await p.locator("#week .wd").count()) === 7);
    await p.close(); }
  { const p = await open(ctx, "pick=f&fit=tight");
    await p.keyboard.press("p"); await sleep(300);
    const q = await p.locator(".pk-quick button").allInnerTexts();
    ok(tag + " F tight: step one is Tonight, Tomorrow, Pick a day, and no grid", /Tonight/.test(q[0]) && /Tomorrow/.test(q[1]) && /Pick a day/.test(q[2]) && (await p.locator(".pkc").count()) === 0, q);
    await p.keyboard.press("ArrowRight"); ok(tag + " F tight: Right moves along the three buttons", /Tomorrow/.test(await focusedLabel(p)));
    await p.locator("[data-pick]").click(); await sleep(200);
    ok(tag + " F tight: Pick a day opens the grid in the same slot, with a way back", (await p.locator(".pkc").count()) === 28 && (await p.locator("[data-less]").count()) === 1);
    await p.keyboard.press("ArrowRight"); ok(tag + " F tight: the grid keys work after Pick a day", (await p.evaluate(() => document.activeElement.dataset.n)) === "3");
    await p.locator("[data-less]").click(); await sleep(150);
    await p.locator("[data-quick]").nth(1).click(); await sleep(200);
    ok(tag + " F tight: Tomorrow (a usual day off) waits for Plan, with the note, on the grid", (await p.locator("#week.pk-fly").count()) === 1 && /usual day off/.test(await p.locator(".pk-note").innerText()) && (await p.locator("[data-ok]").innerText()) === "Plan for Thu");
    await p.locator("[data-less]").click(); await sleep(150);
    await p.locator("[data-quick]").nth(0).click(); await sleep(250);
    ok(tag + " F tight: Tonight on a free day is one click and hands the slot back", /is planned for Wed 14 Oct/.test(await toast(p)) && (await p.locator("#week .wd").count()) === 7 && /Mandarin/.test(await weekText(p)));
    await p.keyboard.press("p"); await sleep(250);
    await p.locator('[data-fit="roomy"]').click(); await sleep(150);
    ok(tag + " F: the Mockup only Roomy button shows the grid", (await p.locator(".pkc").count()) === 28);
    await p.locator('[data-fit="tight"]').click(); await sleep(150);
    ok(tag + " F: the Mockup only Tight button shows the quick picks", (await p.locator(".pk-quick").count()) === 1 && (await p.locator(".pkc").count()) === 0);
    await p.close(); }
  { const p = await open(ctx, "pick=f"); await p.keyboard.press("p"); await sleep(250);
    ok(tag + " F auto: " + (w >= 1440 ? "roomy grid" : "tight quick picks") + " at this width", w >= 1440 ? (await p.locator(".pkc").count()) === 28 : (await p.locator(".pk-quick").count()) === 1);
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
      ok(tag + " rule " + o + ": nothing planned tonight, the primary card has Plan", (await p.locator('#ideas .lead [data-act="quickplan"]').count()) === 1);
      if (o !== "g") ok(tag + " rule " + o + ": nothing planned tonight, the pane has Add to plan", (await p.locator('#detail [data-act="plan"]').count()) === 1);
      ok(tag + " rule " + o + ": Other ideas have Plan", (await p.locator('#ideas .ir [data-act="quickplan"]').count()) === 4);
      await p.close(); }
    { const p = await open(ctx, "pick=" + o + "&night=planned");
      ok(tag + " rule " + o + ": planned tonight, the primary card says Planned for today and has no Plan", /Planned for today/i.test(await p.locator("#ideas .lead").innerText()) && (await p.locator("#ideas .lead .btn, #ideas .lead [data-act]").count()) === 0, await p.locator("#ideas .lead").innerText());
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
