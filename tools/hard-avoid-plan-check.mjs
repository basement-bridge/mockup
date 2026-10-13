// Behaviour and layout check for fragments/plan-hard-avoid (headless Chromium). Prints PASS or FAIL per check.
// Usage:  python3 -m http.server 8123 &   then   node tools/hard-avoid-plan-check.mjs [--shots=docs/screenshots]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers (owner, 12 Oct 2026, SW-O30): a Hard avoid guards a hand-planned meal only when the person is in the meal. A meal for that person
// alone is a hard stop (name and avoid, never the Reason, SW-O48) and no way past it; a household meal warns, names everyone affected, and offers one action,
// "Leave <names> out of this meal"; a meal for other people, a meal without the item and a Soft avoid are not guarded (the Soft line never quotes another person's Reason, SW-84). After leaving
// someone out the meal says who it is for and not for, and Undo returns to the guard. Desktop (1280, 1024) and phone (390, 360), both themes.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-hard-avoid/frame.html";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function page(w, h, q = "", theme = "kitchie") {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await ctx.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  await p.goto(BASE + (q ? "?" + q : "")); await p.waitForTimeout(250); return p;
}
const txt = (p, s) => p.locator(s).first().innerText();
const mode = p => p.evaluate(() => document.getElementById("guard") && document.getElementById("guard").dataset.mode);
const n = (p, s) => p.locator(s).count();
const snap = async (p, name) => { if (shots) await p.screenshot({ path: `${shots}/hard-avoid-plan-${name}.png` }); };
const noScroll = p => p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
const small = p => p.evaluate(() => [...document.querySelectorAll(".panel button, .toast button")].filter(e => e.offsetParent && (e.getBoundingClientRect().height < 43.5 || e.getBoundingClientRect().width < 43.5)).map(e => e.textContent.trim()));

for (const theme of ["kitchie", "kitchie-day"]) for (const [w, h] of [[1280, 800], [1024, 768], [390, 844], [360, 740]]) {
  const tag = ` (${w}, ${theme})`, wide = w >= 1024;
  // 1. single person with their own Hard avoid: a hard stop
  let p = await page(w, h, "state=stop", theme);
  ok(await mode(p) === "stop", "stop: a meal for Jane alone with her Hard avoid is a hard stop" + tag);
  let g = await txt(p, "#guard");
  ok(/Not for Jane/.test(g) && /Mushroom pasta has mushrooms in it/.test(g) && /hard avoid on mushrooms/.test(g), "stop: says who, what and why in plain words" + tag);
  ok(!/Allergic|reason/i.test(g), "stop: name and avoid only, no Reason text (SW-O48)" + tag);
  ok(await n(p, "[data-plan]") === 0 && await n(p, "[data-leave]") === 0, "stop: no Plan button and no Leave out button, nothing to press to get past it" + tag);
  ok(!/anyway|override|ignore|skip|continue|allow/i.test(await txt(p, "#panel")), "stop: no override wording anywhere in the panel" + tag);
  ok(await n(p, "[data-other]") === 1 && await n(p, ".acts [data-cancel]") === 1, "stop: Choose another meal and Cancel are the two ways out" + tag);
  ok(await n(p, "#panel .ingl2 em") === 1 && /mushrooms/.test(await txt(p, "#panel .ingl2 em")), "stop: the ingredient that matched is marked in the recipe line" + tag);
  ok(await noScroll(p), "stop: no sideways scroll" + tag);
  ok((await small(p)).length === 0, "stop: every control in the panel is 44px by 44px or bigger" + tag + " " + (await small(p)).join(","));
  await snap(p, `stop-${w}-${theme}`);
  // switching who it is for re-checks in place, no navigation
  await p.click('[data-for="Sam"]'); ok(await mode(p) === "ok" && await n(p, "[data-plan]") === 1, "stop: pick Sam instead, the stop clears and Plan appears (a meal for other people is not guarded)" + tag);
  await p.click('[data-for="Jane"]'); ok(await mode(p) === "stop", "stop: pick Jane again, the stop returns" + tag);
  await p.click('[data-for="all"]'); ok(await mode(p) === "warn", "stop: pick Everyone, it becomes the household warning" + tag);
  ok(p.errs.length === 0, "no console errors" + tag + " " + p.errs.join("|"));

  // 2. household meal: warn, one action
  p = await page(w, h, "state=warn", theme);
  ok(await mode(p) === "warn", "warn: a household meal that includes Jane warns" + tag);
  g = await txt(p, "#guard");
  ok(/Jane is part of this meal/.test(g) && /This meal is for everyone, so it includes Jane/.test(g) && !/Allergic|reason/i.test(g), "warn: names the person and why she is in it, no Reason (SW-O48)" + tag);
  ok(await txt(p, "[data-leave]") === "Leave Jane out of this meal", "warn: the one action reads exactly 'Leave Jane out of this meal'" + tag);
  ok(await n(p, "[data-plan]") === 0, "warn: no way to plan it with Jane in it" + tag);
  ok(/Plans Saturday for Sam only and marks it not for Jane/.test(g), "warn: says what the action does before it is pressed" + tag);
  ok(await n(p, "[data-other]") === 1 && await n(p, ".acts [data-cancel]") === 1, "warn: Choose another meal and Cancel are there" + tag);
  ok((await small(p)).length === 0, "warn: controls are 44px or taller" + tag);
  await p.locator("[data-leave]").scrollIntoViewIfNeeded();
  ok(await p.locator("[data-leave]").isVisible(), "warn: the action can be reached (visible after scrolling the sheet)" + tag);
  await snap(p, `warn-${w}-${theme}`);
  await p.click("[data-leave]"); await p.waitForTimeout(100);
  ok(await n(p, '.day[data-day="Sat"] [data-notfor]') === 1 && /Not for Jane/.test(await txt(p, '.day[data-day="Sat"] [data-notfor]')), "excluded: the planned meal on Saturday carries 'Not for Jane'" + tag);
  ok(/Sam/.test(await txt(p, '.day[data-day="Sat"] .mc small')) && !/Everyone/.test(await txt(p, '.day[data-day="Sat"] .mc small')), "excluded: the meal says who it is for (Sam), not Everyone" + tag);
  ok(/Jane left out/.test(await txt(p, ".toast")) && await n(p, "[data-undo]") === 1, "excluded: toast says Jane is left out and offers Undo" + tag);
  if (wide) {
    ok(await n(p, "#panel.planned .whorow.out") === 1 && /Left out: hard avoid on mushrooms/.test(await txt(p, ".whorow.out")), "excluded: the lane shows who it is not for, and why" + tag);
    ok(!/Allergic/.test(await txt(p, "#panel")), "excluded: her Reason is not repeated on the planned meal" + tag);
  } else ok(await p.locator("#panel").isHidden().catch(() => true), "excluded: on a phone the sheet closes and the week shows the meal" + tag);
  await snap(p, `excluded-${w}-${theme}`);
  await p.click("[data-undo]"); await p.waitForTimeout(100);
  ok(await mode(p) === "warn" && await n(p, '.day[data-day="Sat"] .mcw') === 0, "undo: the meal is removed and the guard is asked again (Jane is not quietly put back in)" + tag);

  // 3. two people affected
  p = await page(w, h, "state=warn2", theme);
  ok(await txt(p, "[data-leave]") === "Leave Jane and Kai out of this meal", "warn2: one action names both" + tag);
  g = await txt(p, "#guard");
  ok(/Jane and Kai are part of this meal/.test(g) && /mushrooms/.test(g) && /cream/.test(g) && !/Can't have dairy|Allergic|reason/i.test(g), "warn2: each person and each avoid, no Reason (SW-O48)" + tag);
  await snap(p, `warn2-${w}-${theme}`);
  await p.click("[data-leave]"); await p.waitForTimeout(100);
  ok(/Not for Jane and Kai/.test(await txt(p, '.day[data-day="Sat"] [data-notfor]')), "warn2: planned as not for Jane and Kai" + tag);
  await snap(p, `excluded2-${w}-${theme}`);
  p = await page(w, h, "state=warn2&for=Kai", theme);
  ok(await mode(p) === "stop" && /Not for Kai/.test(await txt(p, "#guard")) && !/Can't have dairy|reason/i.test(await txt(p, "#guard")), "warn2: a meal for Kai alone is his own hard stop, no Reason" + tag);

  // 4. not guarded
  p = await page(w, h, "state=clear", theme);
  ok(await mode(p) === "ok" && await n(p, "[data-plan]") === 1 && await n(p, ".guard") === 0, "clear: a meal without the avoided item has no warning and a Plan button" + tag);
  await snap(p, `clear-${w}-${theme}`);
  await p.click("[data-plan]"); await p.waitForTimeout(100);
  ok(await n(p, '.day[data-day="Sat"] .mcw') === 1 && await n(p, "[data-notfor]") === 0, "clear: plans normally, no 'Not for' tag" + tag);
  p = await page(w, h, "state=others", theme);
  ok(await mode(p) === "ok" && await n(p, "[data-plan]") === 1 && await n(p, ".guard") === 0, "others: Mushroom pasta for Sam alone is not guarded by Jane's Hard avoid" + tag);
  await snap(p, `others-${w}-${theme}`);
  p = await page(w, h, "state=soft", theme);
  ok(await mode(p) === "soft" && await n(p, "[data-plan]") === 1 && await n(p, "[data-leave]") === 0 && await n(p, ".guard") === 0, "soft: a Soft avoid does not block: Plan is there, no guard, no leave out" + tag);
  ok(/Jane would rather avoid onion/.test(await txt(p, "#guard")) && /does not stop the meal/.test(await txt(p, "#guard")), "soft: one quiet line, says it does not stop the meal" + tag);
  ok((await txt(p, "#guard")).replace(/\s+/g, " ").trim() === "Jane would rather avoid onion (soft). Shakshuka has it, and that does not stop the meal." && !/don't like it|reason/i.test(await txt(p, "#guard")), "soft: no quoted Reason: Sam is not Jane (SW-O61, SW-84)" + tag);
  await snap(p, `soft-${w}-${theme}`);
  ok(await noScroll(p), "soft: no sideways scroll" + tag);
  // household of two: Kai absent, so his avoid does not apply
  p = await page(w, h, "state=warn&r=pasta&for=all&hh=2", theme);
  ok(!/Kai/.test(await txt(p, "#guard")), "a member who is not in the household is not named" + tag);
}

// layout: the lane never covers the week (desktop), the sheet stays inside the screen (phone)
{
  let p = await page(1280, 800, "state=warn");
  const m = await p.evaluate(() => ({ main: document.getElementById("main").getBoundingClientRect().right, panel: document.getElementById("panel").getBoundingClientRect().left, pw: document.getElementById("panel").getBoundingClientRect().width }));
  ok(m.main <= m.panel + 1 && Math.abs(m.pw - 400) < 2, `desktop: the lane is 400 wide and starts where the column ends (${m.main.toFixed(0)} <= ${m.panel.toFixed(0)}, ${m.pw})`);
  await p.keyboard.press("Escape"); ok(await n(p, "#panel") === 1, "plain Esc closes nothing (Pantry rule)");
  await p.keyboard.press("Control+Enter"); ok(await n(p, "#panel") === 0, "Ctrl+Enter closes the panel; nothing was planned");
  ok(/Nothing was planned/.test(await txt(p, ".toast")), "closing says nothing was planned");
  await p.click("[data-reopen]"); ok(await n(p, "#panel") === 1 && await mode(p) === "warn", "Plan a meal opens it again, guard still asked");
  p = await page(390, 844, "state=warn2");
  const s = await p.evaluate(() => { const r = document.getElementById("panel").getBoundingClientRect(); return { b: r.bottom, t: r.top, h: innerHeight }; });
  ok(s.b <= s.h + 1 && s.t >= 0.07 * s.h - 2, `phone: the sheet sits at the bottom, inside the screen (top ${s.t.toFixed(0)}, bottom ${s.b.toFixed(0)}, screen ${s.h})`);
  await p.click(".acts [data-cancel]"); ok(await n(p, "#panel") === 0 && await n(p, '.day[data-day="Sat"] .mcw') === 0, "phone: Cancel plans nothing");
  p = await page(768, 1024, "state=warn"); ok(await noScroll(p) && await mode(p) === "warn", "tablet 768: same sheet as the phone, no sideways scroll");
  await snap(p, "warn-768-kitchie");
}
await b.close();
console.log(fails ? `${fails} FAILED` : "all passed");
process.exit(fails ? 1 : 0);
