// Behaviour and layout check for fragments/home-detail-panel (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/home-detail-panel-check.mjs [--shots=docs/screenshots]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers (owner confirmed 12 Oct 2026): close is Ctrl or Cmd plus Escape, plain Escape closes nothing; the dropdown closes on select; missing = out of stock only; Why this fits; the Used in line (weekday, rolling 7 days, absent when none).
// Covers: the four entry points open one panel; wide = panel in the lane and This week shifted right and fully visible; narrow = panel over This week with the peek (default 6 px) showing and clickable;
// the breakpoints of options A (1624), B (never), C (1448); switching item to item without closing; close by X and Ctrl+Escape, plain Esc closes nothing; E, comma, W, P keys; recipe view; states; no console errors; no sideways scroll.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/home-detail-panel/home.html";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function page(w, h, q = "", theme = "kitchie") {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await ctx.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  await p.goto(BASE + (q ? "?" + q : "")); await p.waitForTimeout(400); return p;
}
const box = (p, s) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { l: r.left, r: r.right, w: r.width, t: r.top }; }, s);
const snap = async (p, n) => { if (shots) await p.screenshot({ path: `${shots}/home-detail-panel-${n}.png` }); };

// 1. the four entry points, narrow (1440, option A: stack)
let p = await page(1440, 800);
await p.click("#q"); await p.keyboard.type("jalap"); await p.waitForTimeout(200);
ok(await p.locator("#sres .i").count() === 2 && await p.locator("#sres .g").count() === 2, "search: jalap finds the item and a recipe, grouped Pantry and Recipes (accent folded)");
await snap(p, "1440-search-dropdown");
await p.click("#sres .i"); await p.waitForTimeout(300);
ok(await p.locator("#sres[hidden]").count() === 1 && await p.locator("#detail[hidden]").count() === 0, "selecting a result closes the dropdown and opens the panel at once");
ok(await p.locator("#d-title").textContent() === "Jalapeño peppers", "entry 1 (search result) opens the item");
ok(await p.evaluate(() => document.getElementById("app").dataset.mode) === "stack", "1440 is stack in option A");
let wk = await box(p, "#week"), dt = await box(p, "#detail");
ok(Math.abs(dt.l - wk.l - 6) < 1.5, "stack: the panel starts 6 px in, so 6 px of This week shows (" + (dt.l - wk.l).toFixed(1) + ")");
ok(Math.abs(dt.r - wk.r) < 1.5, "stack: the panel ends where the lane ends (lane stays 400)");
const pk = await box(p, "#peek"); ok(pk.w >= 12 && Math.abs(pk.l - wk.l) < 1.5, "peek button covers the visible edge (" + pk.w + " px wide)");
await snap(p, "1440-stacked-item");
await p.click("[data-open='recipe:cuke-salad']"); await p.waitForTimeout(300);
ok(await p.locator("#d-title").textContent() === "Cucumber and spring onion salad", "entry 2 (Cooking idea) opens the recipe view, without closing");
ok(await p.locator("#detail .sacts .btn.pri").textContent().then(t => /Add to plan/.test(t)), "recipe view has Add to plan");
await p.click("[data-open='item:cucumbers']"); ok(await p.locator("#d-title").textContent() === "Cucumbers", "entry 3 (On the way out) switches in place");
await p.click("[data-open='item:bueno']"); ok(await p.locator("#d-title").textContent() === "Bueno chocolate", "entry 4 (Running low) switches in place");
ok(await p.locator("#detail[hidden]").count() === 0, "never closed while switching");
// keys
await p.keyboard.press("e"); ok(await p.locator("#ief-child h3").first().textContent().then(t => /Edit/.test(t)), "E opens Edit under the header");
await p.keyboard.press(","); ok(await p.locator("#ief-child h3").first().textContent().then(t => /History/.test(t)), "comma switches to History");
await p.keyboard.press(","); ok(await p.locator("#ief-child").count() === 0, "comma again returns to the item");
await p.keyboard.press("w"); await p.waitForTimeout(300);
ok(await p.evaluate(() => document.getElementById("app").dataset.front) === "week", "W brings This week forward");
wk = await box(p, "#week"); dt = await box(p, "#detail");
ok(wk.w < dt.w && Math.abs(dt.r - wk.r - 6) < 1.5, "week in front: it is 6 px narrower, the panel peeks 6 px on the right");
await snap(p, "1440-week-in-front");
await p.click("#peek"); await p.waitForTimeout(300);
ok(await p.evaluate(() => document.getElementById("app").dataset.front) === "detail", "clicking the peek sends it back");
await p.keyboard.press("Escape"); ok(await p.locator("#detail[hidden]").count() === 0, "plain Escape closes nothing (kept for leaving full screen)");
await p.keyboard.press("Control+Escape"); await p.waitForTimeout(200);
ok(await p.locator("#detail[hidden]").count() === 1, "Ctrl+Escape closes the panel");
await p.click("[data-open='item:limes']"); await p.click("#detail .x"); ok(await p.locator("#detail[hidden]").count() === 1, "the X closes the panel");
ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no sideways scroll at 1440");
ok(p.errs.length === 0, "no console errors (" + p.errs.join("|") + ")");
// plan from the recipe view pulses the peek and fills the first empty day
await p.click("[data-open='recipe:lime-tacos']"); await p.keyboard.press("p"); await p.waitForTimeout(200);
ok(await p.locator(".toast").textContent().then(t => /Mon 12/.test(t)), "P adds the idea to the first empty day (Mon 12 when nothing is planned) with an Undo toast");
await p.keyboard.press("z"); ok(await p.locator("#week .wd").nth(0).textContent().then(t => /Nothing planned/.test(t)), "Z undoes it");
await p.context().close();


// 1b. confirmed 12 Oct: Meta+Escape too, missing means out of stock only, why-this-fits, Used in
p = await page(1440, 800, "open=recipe:lime-tacos");
await p.keyboard.press("Meta+Escape"); await p.waitForTimeout(200);
ok(await p.locator("#detail[hidden]").count() === 1, "Cmd+Escape closes the panel too");
await p.click("#q"); await p.keyboard.press("Escape"); await p.click("[data-open='item:limes']"); await p.keyboard.press("Escape");
ok(await p.locator("#detail[hidden]").count() === 0, "plain Escape (outside the box) leaves the panel open");
await p.keyboard.press("Control+Escape"); ok(await p.locator("#detail[hidden]").count() === 1, "Ctrl+Escape closes an item panel");
await p.click("[data-open='recipe:lime-tacos']"); await p.waitForTimeout(300);
ok(await p.locator("#ideas").textContent().then(t => /1 missing/.test(t)), "lime tacos: 1 missing (coriander); the running-low limes do not count");
ok(await p.locator("#detail .rl.miss").count() === 1 && await p.locator("#detail .rl.short").count() === 1, "recipe panel: one missing line, the limes line is in stock and marked running low");
ok(await p.locator("#detail .rsec").first().textContent().then(t => /Missing/.test(t) && !/short/i.test(t)), "section is called Missing, not Missing or short");
ok(await p.locator("#detail .fit").textContent().then(t => /Why this fits/.test(t) && t.length < 260), "short Why this fits blurb");
ok(await p.locator("#detail").textContent().then(t => !/Step 1|Method|Instructions/.test(t)), "no recipe steps in the panel");
await p.keyboard.press("s"); ok(await p.locator(".toast").textContent().then(t => /1 missing item is/.test(t)), "S adds only the missing line to the list");
await p.context().close();
p = await page(1440, 800, "open=item:spring-onion&week=planned");
ok(await p.locator("#d-usedin").textContent().then(t => t === "Used in: prawn curry Tuesday, egg fried rice Friday"), "Used in line by weekday for a planned item: " + await p.locator("#d-usedin").textContent());
ok(await p.locator("#d-usedin").textContent().then(t => !/\d/.test(t)), "Used in has no dates");
await snap(p, "1440-used-in"); 
await p.evaluate(() => window.HDP.open("item:jalapeno")); ok(await p.locator("#d-usedin").count() === 0, "no Used in line for an item no planned meal uses");
await p.click("[data-open='item:cucumbers']"); ok(await p.locator("#d-usedin").count() === 0, "no Used in line for cucumbers (only an unplanned idea uses them)");
await p.context().close();
p = await page(1440, 800, "open=item:spring-onion");
ok(await p.locator("#d-usedin").count() === 0, "nothing planned: no Used in line");
await p.click("[data-open='recipe:cuke-salad']"); await p.keyboard.press("p"); await p.click("[data-open='item:spring-onion']"); await p.waitForTimeout(200);
ok(await p.locator("#d-usedin").textContent().then(t => /cucumber and spring onion salad Monday/.test(t)), "planning an idea adds it to Used in (Monday)");
await p.keyboard.press("e"); await p.waitForTimeout(400); ok(await p.locator("#detail #ief-child").count() === 1 && await p.locator("#detail").count() === 1, "Edit swaps in the same panel (same slot)");
await p.context().close();

// 2. wide: displace
p = await page(1920, 900, "open=item:limes");
ok(await p.evaluate(() => document.getElementById("app").dataset.mode) === "displace", "1920 is displace in option A");
wk = await box(p, "#week"); dt = await box(p, "#detail");
ok(Math.abs(wk.l - dt.r) < 1.5 && wk.w > 395 && dt.w > 395, "displace: This week is the lane to the right of the panel, both about 400 wide, nothing covered");
ok(await p.evaluate(() => getComputedStyle(document.getElementById("peek")).display) === "none", "displace: no peek");
await snap(p, "1920-displaced-item");
await p.context().close();
p = await page(1920, 900, "open=recipe:lime-tacos"); await snap(p, "1920-displaced-recipe"); await p.context().close();

// 3. breakpoints
for (const [opt, w, want] of [["a", 1623, "stack"], ["a", 1624, "displace"], ["b", 2560, "stack"], ["c", 1447, "stack"], ["c", 1448, "displace"]]) {
  p = await page(w, 800, "opt=" + opt + "&open=item:limes");
  const m = await p.evaluate(() => document.getElementById("app").dataset.mode);
  const cols = await p.evaluate(() => getComputedStyle(document.getElementById("app")).gridTemplateColumns.split(" ").length);
  ok(m === want && (want === "displace" ? cols === 4 : cols === 3), `option ${opt.toUpperCase()} at ${w}: ${want} (${cols} columns)`);
  if (opt === "c" && w === 1448) { const mc = await box(p, "#main"); ok(Math.abs(mc.w - 560) < 2, "option C: the column gives up width to 560 (" + mc.w + ")"); await snap(p, "1500-option-c-pushed"); }
  await p.context().close();
}
// 4. states, light theme, narrow desktop
p = await page(1024, 768, "ideas=unavailable", "kitchie-day");
ok(await p.locator("#ideas").textContent().then(t => /Ideas are not available right now/.test(t)), "ideas unavailable message");
ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no sideways scroll at 1024");
await snap(p, "1024-ideas-unavailable-light"); await p.context().close();
p = await page(1280, 800, "ideas=loading&week=planned&open=item:cucumbers&detail=loading");
ok(await p.locator("#ideas .sk").count() > 0 && await p.locator("#detail .sk").count() > 0, "loading skeletons in ideas and in the panel");
await snap(p, "1280-loading"); await p.context().close();
p = await page(1280, 800, "open=recipe:lime-tacos&detail=error");
ok(await p.locator("#detail [data-act=retry]").count() === 1, "panel error has Try again"); await snap(p, "1280-panel-error"); await p.context().close();
p = await page(1280, 800, "open=item:limes&child=history"); await snap(p, "1280-history-tucked"); await p.context().close();
p = await page(1440, 800, "open=recipe:lime-tacos", "kitchie-day"); await snap(p, "1440-stacked-recipe-light"); await p.context().close();
await b.close();
console.log(fails ? fails + " FAILED" : "ALL PASSED"); process.exit(fails ? 1 : 0);
