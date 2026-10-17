// Behaviour check for the Plan day flyout fixes (replace call-out, usual day off with a meal, named confirmation, 3 second hold that holds while hovered), headless Chromium. Mockup only, nothing is saved.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-day-flyout-replace-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox). Any page or console error fails the run.
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-day-flyout-replace/";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await pw.chromium.launch();
const errs = [];
async function open(ctx, q, theme, vp) {
  const p = await ctx.newPage();
  p.on("pageerror", e => errs.push("pageerror " + e.message));
  p.on("console", m => { if (m.type() === "error") errs.push("console " + m.text()); });
  p.on("requestfailed", r => errs.push("requestfailed " + r.url()));
  if (theme) await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  await p.goto(BASE + (q ? "?" + q : "")); await sleep(350); return p;
}
const rows = (p, id) => p.locator("#" + id + " .row-d");
const txt = (p, sel) => p.locator(sel).innerText();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
{
  const p = await open(ctx, "");
  ok("nine frames and the timer frame are drawn", (await p.locator(".fr").count()) === 10, await p.locator(".fr").count());
  ok("default hold is 3 seconds", await p.evaluate(() => PDFR.HOLD === 3000));

  // 1. usual day off with a meal
  for (const id of ["s1-phone", "s1-desk"]) {
    const r = rows(p, id);
    ok(id + ": today's row (the bug) still shows the Not cooking chip", /Not cooking/.test(await r.nth(0).innerText()) && (await r.nth(0).locator(".pill").count()) === 1);
    for (const i of [1, 2]) {
      const t = await r.nth(i).innerText();
      ok(id + ": usual day off with a meal #" + i + " shows the meal, no Not cooking chip, no usual-day-off line", !/Not cooking|usual day off|Usual day off/i.test(t) && (await r.nth(i).locator(".pill").count()) === 0, t);
    }
    ok(id + ": the own meal is shown by name", /Ginger-Soy Chicken Stir-Fry with Rice/.test(await r.nth(1).innerText()));
    const t3 = await r.nth(3).innerText();
    ok(id + ": usual day off with nothing planned keeps Not cooking and the usual-day-off line", /Not cooking/.test(t3) && /Every week, usual day off/.test(t3) && (await r.nth(3).locator(".pill").count()) === 1, t3);
    ok(id + ": the empty usual day off has no replace call-out", (await r.nth(3).locator(".rp").count()) === 0);
  }

  // 2. replace call-out
  for (const id of ["s2-phone-me", "s2-phone-all", "s2-desk-me", "s2-desk-all"]) {
    const r = rows(p, id);
    ok(id + ": the Open row has no call-out", (await r.nth(0).locator(".rp").count()) === 0 && (await r.nth(0).getAttribute("data-kind")) === "plan" && !/Replaces|Takes you out/.test(await r.nth(0).innerText()));
    const w = r.nth(1);
    const tag = w.locator(".rp");
    ok(id + ": replace row has the tag with wording and an icon", (await tag.count()) === 1 && /^Replaces/.test(await tag.innerText()) && (await tag.locator("svg").count()) === 1);
    ok(id + ": the meal that would go is struck through (not colour alone)", await w.locator(".ln.gone").first().evaluate(e => getComputedStyle(e).textDecorationLine.includes("line-through")));
    ok(id + ": replace row has a danger border and a danger tag", await w.evaluate(e => { const d = getComputedStyle(document.documentElement).getPropertyValue("--danger").trim(); const probe = document.createElement("i"); probe.style.color = d; document.body.appendChild(probe); const c = getComputedStyle(probe).color; probe.remove(); return getComputedStyle(e).borderTopColor === c && getComputedStyle(e.querySelector(".rp")).color === c; }));
    ok(id + ": the aria-label warns", /Warning, replaces/.test(await w.getAttribute("aria-label")));
    ok(id + ": there is no confirm button or second step in the flyout", (await p.locator("#" + id + " [data-confirm], #" + id + " .confirm").count()) === 0);
  }
  ok("Everyone: a night where UAT-AL keeps theirs is plain (nothing is lost)", (await rows(p, "s2-desk-all").nth(2).locator(".rp").count()) === 0 && /UAT-AL’s meal stays/.test(await rows(p, "s2-desk-all").nth(2).innerText()));
  ok("Everyone: your own meal replaced while UAT-AL keeps theirs still gets the call-out", (await rows(p, "s2-desk-all").nth(3).locator(".rp").count()) === 1);
  // one tap plans, Undo available
  {
    const id = "s2-desk-all", before = await rows(p, id).count();
    await rows(p, id).nth(1).click();
    ok("one tap plans at once (no confirm step), the confirmation says Replaced and has Undo", /Replaced/.test(await txt(p, "#" + id + " .pk-conf-v")) && (await p.locator("#" + id + " [data-undo]").count()) === 1 && /Japanese golden curry is out/.test(await txt(p, "#" + id + " .pk-conf-x")), await txt(p, "#" + id + " .pk-conf-x"));
    await p.locator("#" + id + " [data-undo]").click();
    ok("Undo reads Undone", /Undone/.test(await txt(p, "#" + id + " .pk-conf-v")));
    await sleep(1300);
    ok("after Undo the replaced meal is back and the call-out with it", (await rows(p, id).count()) === before && (await rows(p, id).nth(1).locator(".rp").count()) === 1 && /Japanese golden curry/.test(await rows(p, id).nth(1).innerText()));
    // an Open row plans with no warning wording
    await rows(p, id).nth(0).click();
    ok("an Open row for Everyone plans, says Planned, names everyone", /Planned/.test(await txt(p, "#" + id + " .pk-conf-v")) && /For everyone\./.test(await txt(p, "#" + id + " .pk-conf-x")), await txt(p, "#" + id + " .pk-conf-x"));
    await p.locator("#" + id + " [data-undo]").click(); await sleep(1300);
  }
  {
    const id = "s2-phone-me";
    await rows(p, id).nth(2).click();
    ok("for yourself on a household meal: Replaced, the household meal is out for you", /Replaced/.test(await txt(p, "#" + id + " .pk-conf-v")) && /Salmon traybake is out for you\. For you\./.test(await txt(p, "#" + id + " .pk-conf-x")), await txt(p, "#" + id + " .pk-conf-x"));
    await p.locator("#" + id + " [data-close]").click();
    ok("Close ends the hold at once", (await p.locator("#" + id + " .pk-conf").count()) === 0 && (await p.locator("#" + id + " [data-reopen]").count()) === 1);
    await p.locator("#" + id).locator("xpath=..").locator("[data-reset]").click();
  }
  // 3. named confirmation
  for (const id of ["s3-phone", "s3-desk"]) {
    ok(id + ": the confirmation names the people and who keeps theirs", /Planned/.test(await txt(p, "#" + id + " .pk-conf-v")) && (await txt(p, "#" + id + " .pk-conf-x")) === "For Green Slander and you. UAT-AL keeps their meal.", await txt(p, "#" + id + " .pk-conf-x"));
    ok(id + ": Undo is there", (await p.locator("#" + id + " [data-undo]").count()) === 1);
  }
  ok("s3 replace with two keepers says what went and who keep theirs", (await txt(p, "#s3-phone-b .pk-conf-x")) === "Japanese golden curry is out. For you. UAT-AL and Green Slander keep their meals.", await txt(p, "#s3-phone-b .pk-conf-x"));
  await p.locator("#s3-phone [data-undo]").click();
  ok("s3 Undo reads Undone", /Undone/.test(await txt(p, "#s3-phone .pk-conf-v")));
  ok("no horizontal scroll at 1200", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await p.close();
}
// 4. the timer, with a short hold so the run is quick (hold 900, slide-out 240). Mouse on the flyout holds it; leaving restarts the full hold; no run bar; a finger down holds it on touch.
{
  const p = await open(ctx, "hold=900");
  ok("hold override applied", await p.evaluate(() => PDFR.HOLD === 900 && PDFR.MIN === undefined));
  ok("no run bar markup anywhere", (await p.locator(".tm, .tm-bar").count()) === 0);
  const st = () => p.locator("#s4-timer").getAttribute("data-hold");
  const reset = () => p.locator("#s4-timer").locator("xpath=..").locator("[data-reset]").click();
  const plan = async () => { await rows(p, "s4-timer").nth(0).click(); await sleep(120); };   // the click leaves the mouse on the flyout; the pause lets the browser settle its own hover events
  const closed = async () => (await p.locator("#s4-timer [data-reopen]").count()) === 1 && (await p.locator("#s4-timer .pk-conf").count()) === 0;
  // control: mouse moved away straight after the pick, it closes after the hold
  await plan(); await p.mouse.move(5, 5); await sleep(60);
  ok("mouse away: counting", (await st()) === "run", await st());
  ok("no countdown text or bar in the confirmation", (await p.locator("#s4-timer .pk-conf-d, #s4-timer .pk-conf").count()) >= 1 && !/Closing in|Paused/.test(await txt(p, "#s4-timer")));
  await sleep(900 + 240 + 250);
  ok("mouse away: slides out and is gone after the hold", await closed());
  await reset();
  // mouse on the flyout: holds well past the hold time, indefinitely
  await plan();
  ok("mouse on the flyout straight after the pick: held", (await st()) === "held", await st());
  await sleep(900 * 3);
  ok("hovered for three times the hold: still there, still held", (await p.locator("#s4-timer .pk-conf").count()) === 1 && (await st()) === "held", await st());
  // leave: the full hold restarts (not what was left)
  await p.mouse.move(5, 5);
  ok("pointer left: counting again", (await st()) === "run", await st());
  await sleep(600);
  ok("600ms after leaving (of 900): not closed yet, restarted from the top", (await p.locator("#s4-timer .pk-conf").count()) === 1);
  await sleep(300 + 240 + 250);
  ok("closes a full hold after leaving", await closed());
  await reset();
  // leave and come back mid-count: held again, then a fresh full hold
  await plan(); await p.mouse.move(5, 5); await sleep(500);
  const bx = await p.locator("#s4-timer .pk-conf").boundingBox(); await p.mouse.move(bx.x + 40, bx.y + 40);
  ok("pointer back mid-count: held", (await st()) === "held", await st());
  await sleep(1500);
  ok("held after coming back", (await p.locator("#s4-timer .pk-conf").count()) === 1);
  await p.mouse.move(5, 5); await sleep(600);
  ok("second leave restarts the full hold too", (await p.locator("#s4-timer .pk-conf").count()) === 1 && (await st()) === "run");
  await sleep(300 + 240 + 250);
  ok("then closes", await closed());
  await reset();
  // pressing does not change anything now: a press outside while the mouse is away, the count runs on
  await plan(); await p.mouse.move(5, 5); await p.mouse.down(); await sleep(900 + 240 + 250); await p.mouse.up();
  ok("a press elsewhere does not hold it", await closed());
  await reset();
  // hovering Undo then clicking undoes it
  await plan(); const u = await p.locator("#s4-timer [data-undo]").boundingBox(); await p.mouse.move(u.x + 10, u.y + 10); await p.mouse.click(u.x + 10, u.y + 10);
  ok("Undo works while hovering", /Undone/.test(await txt(p, "#s4-timer .pk-conf-v")));
  await reset();
  // keyboard: focus on Undo holds, blur restarts the full hold
  await plan(); await p.mouse.move(5, 5); await sleep(50);
  await p.locator("#s4-timer [data-undo]").focus();
  ok("focus on Undo: held", (await st()) === "held", await st());
  await sleep(1200);
  ok("focus on Undo: still there after longer than the hold", (await p.locator("#s4-timer .pk-conf").count()) === 1);
  await p.locator("#s4-timer [data-undo]").blur();
  ok("blur: counting again", (await st()) === "run", await st());
  await sleep(900 + 240 + 250);
  ok("blur: closes after a full hold", await closed());
  await reset();
  // Esc closes at once, even while hovered
  await plan(); await p.keyboard.press("Escape"); await sleep(50);
  ok("Esc ends the hold at once", (await p.locator("#s4-timer [data-reopen]").count()) === 1);
  await p.close();
}
// 4b. touch: finger down holds it, lifting restarts the full hold
{
  const tctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await open(tctx, "hold=900");
  const st = () => p.locator("#s4-timer").getAttribute("data-hold");
  const fire = (type) => p.evaluate(t => { const f = document.querySelector("#s4-timer"); f.dispatchEvent(new PointerEvent(t, { pointerType: "touch", bubbles: true, pointerId: 7 })); }, type);
  await rows(p, "s4-timer").nth(0).tap();
  ok("touch: counting from display", (await st()) === "run", await st());
  await fire("pointerdown"); await sleep(300);
  ok("touch: finger down holds", (await st()) === "held", await st());
  await sleep(900 + 400);
  ok("touch: still open after longer than the hold", (await p.locator("#s4-timer .pk-conf").count()) === 1 && (await st()) === "held");
  await fire("pointerup"); await sleep(450);
  ok("touch: lifting restarts the full hold (not closed at once)", (await p.locator("#s4-timer .pk-conf").count()) === 1 && (await st()) === "run", await st());
  await sleep(900 + 240 + 300);
  ok("touch: closes a full hold after the lift", (await p.locator("#s4-timer [data-reopen]").count()) === 1 && (await p.locator("#s4-timer .pk-conf").count()) === 0);
  await p.close(); await tctx.close();
}
// contrast of the call-out in both themes, and no horizontal scroll on a phone
for (const th of ["kitchie", "kitchie-day"]) {
  const c2 = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const p = await open(c2, "", th);
  const ratio = await p.evaluate(() => {
    const e = document.querySelector("#s2-phone-all .row-d.replace .rp"), cs = getComputedStyle(e);
    const parse = s => s.match(/[\d.]+/g).map(Number);
    const fg = parse(cs.color), surf = parse(getComputedStyle(document.querySelector("#s2-phone-all")).backgroundColor);
    const bg = parse(cs.backgroundColor), a = bg.length > 3 ? bg[3] : 1, mix = [0, 1, 2].map(i => bg[i] * a + surf[i] * (1 - a));
    const L = c => { const f = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; };
    const l1 = L(fg), l2 = L(mix); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
  });
  ok(th + ": the Replaces tag reads at 4.5:1 or better", ratio >= 4.5, ratio);
  ok(th + ": no horizontal scroll at 390", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), await p.evaluate(() => document.documentElement.scrollWidth));
  await c2.close();
}
await browser.close();
ok("no page or console errors", errs.length === 0, errs);
console.log(fails ? fails + " of " + total + " checks FAILED" : "all " + total + " checks passed");
process.exit(fails ? 1 : 0);
