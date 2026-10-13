// Behaviour check for the Plan UI phone mockup, the follow-up of 13 Oct 2026 (Plan UI review 201 to 205, owner-stated, typed): the person filter option is "Household" (201), the long hold on "Week of ..." moves the LIST to today (202),
// Clear week acts on the current filter scope and never on the past (203), another person's meal opens a read-only detail where Hold and Add still work (204, 205). Headless Chromium, touch and mouse, dark and light, reduced motion.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-household-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); return p; }
const S = (p, f) => p.evaluate(f);
const snapAll = p => S(p, "JSON.stringify([window.__plan.S.meals, window.__plan.S.blocked, window.__plan.S.bown])");
const snapPlan = p => S(p, "JSON.stringify([window.__plan.S.meals.map(function (m) { return [m.id, m.day, m.n, m.t]; }), window.__plan.S.blocked])");
const ids = p => S(p, "window.__plan.S.meals.map(function (m) { return m.id; })");
async function holdAt(ctx, p, touch, x, y, ms) { if (!touch) { await p.mouse.move(x, y); await p.mouse.down(); await sleep(ms); await p.mouse.up(); return; } const c = await ctx.newCDPSession(p); await c.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] }); await sleep(ms); await c.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await c.detach(); }
async function swipe(ctx, p, touch, x, y, dx) { if (!touch) { await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(x + dx * i / 8, y); await sleep(15); } await p.mouse.up(); return; }
  const c = await ctx.newCDPSession(p); const t = (type, xx) => c.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: xx, y, id: 1 }] }); await t("touchStart", x); for (let i = 1; i <= 8; i++) { await t("touchMove", x + dx * i / 8); await sleep(15); } await t("touchEnd"); await c.detach(); }
const labelHold = async (ctx, p, touch, ms) => { const b = await p.locator("#wkt").boundingBox(); await holdAt(ctx, p, touch, b.x + 24, b.y + b.height / 2, ms || 700); };
const todayGap = p => S(p, "(function () { var e = document.getElementById('d-d13'), s = document.getElementById('stk'); return e ? Math.round(e.getBoundingClientRect().top - s.getBoundingClientRect().bottom) : null; })()");
const noSide = p => S(p, "document.documentElement.scrollWidth <= innerWidth");
const FRAGILE = /data-act="(replan|nocook|moveto|copyfwd)"|data-replan|data-nocook|data-moveto|data-copy\b|data-clearw|data-block|data-openday|data-unblock|data-od-b/;
const fits = p => S(p, "(function () { var h = document.querySelector('.hd'); return h.scrollWidth <= h.clientWidth + 1 && [...h.querySelectorAll('button, h1, small')].every(function (b) { var q = b.getBoundingClientRect(); return q.width === 0 || (q.left >= -0.5 && q.right <= innerWidth + 0.5 && q.right <= h.getBoundingClientRect().right + 0.5); }) && document.documentElement.scrollWidth <= innerWidth; })()");
const norm = t => t.replace(/\s+/g, " ").trim();

for (const [scheme, reduced, w, h, touch] of [["dark", false, 390, 844, true], ["dark", false, 360, 740, true], ["dark", false, 1280, 900, false], ["light", false, 390, 844, true], ["dark", true, 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme, reducedMotion: reduced ? "reduce" : "no-preference" }); const errs = []; const tag = `${scheme}${reduced ? " reduced" : ""} ${touch ? "touch" : "mouse"} ${w}`;
  const tap = loc => touch ? loc.tap() : loc.click();
  // ---------- A. Household (201) ----------
  { const p = await open(ctx, "opts=1", errs); await tap(p.locator("[data-fmenu]")); await sleep(250); const items = await p.locator(".dd .it").allInnerTexts();
    ok(`${tag} A: the dropdown lists Mine, Household (sub-label "the household plan: you can change it") and the other members; nothing says Everyone`, items.some(t => /^Mine/.test(t)) && items.some(t => /^Household/.test(t) && /the household plan: you can change it/.test(t)) && !items.some(t => /Everyone/.test(t)), items);
    await tap(p.locator('.dd [data-view="household"]')); await sleep(300);
    ok(`${tag} A: choosing it shows Household on the filter button and as the view id`, /Household/.test(await p.locator(".fmenu").innerText()) && (await S(p, "window.__plan.S.view")) === "household");
    ok(`${tag} A: a shared meal reads "Household · 4 people" in its tile`, /Household · 4 people/.test(await p.locator(".pw-day .mc").first().innerText()));
    const txt = await S(p, "document.body.innerText + ' ' + [].map.call(document.querySelectorAll('[aria-label],[title]'), function (e) { return (e.getAttribute('aria-label') || '') + ' ' + (e.title || ''); }).join(' ')");
    ok(`${tag} A: no text, aria-label or title anywhere on the page says Everyone`, !/Everyone/i.test(txt));
    await tap(p.locator("[data-opts]")); await sleep(250); ok(`${tag} A: the Options panel does not say Everyone`, !/Everyone/.test(await p.locator(".optpanel").innerText()));
    ok(`${tag} A: no page errors`, errs.length === 0, errs); await p.close(); }
  { const p = await open(ctx, "who=everyone", errs); ok(`${tag} A: an old link (?who=everyone) still opens the household plan, called Household`, (await S(p, "window.__plan.S.view")) === "household" && /Household/.test(await p.locator(".fmenu").innerText())); await p.close(); }
  for (const f of ["seg", "strip"]) { const p = await open(ctx, "f=" + f + "&expand=1&who=household", errs); const t = await S(p, "(document.querySelector('.pstrip, .fseg') || { innerText: '' }).innerText"); ok(`${tag} A: the ${f} variant says Household, not Everyone`, /Household/.test(t) && !/Everyone/.test(t), t); await p.close(); }

  // ---------- B. the long hold moves the LIST to today (202) ----------
  { const ys = reduced || w !== 390 ? [0, 1500, 99999] : [0, 400, 1500, 2500, 99999];
    const p = await open(ctx, "", errs);
    for (const y of ys) {
      await S(p, `window.scrollTo(0, ${y})`); await sleep(650); const before = await todayGap(p);
      await labelHold(ctx, p, touch); await sleep(2600); const g = await todayGap(p), cur = await S(p, "window.__plan.S.cur");
      ok(`${tag} B: from scroll ${y} (today was ${before}px from the header) a long hold lands the list on today, just under the header`, cur === "d13" && g !== null && g >= -2 && g <= 16, { g, cur, before });
    }
    ok(`${tag} B: no toast was shown`, !(await S(p, "!!window.__plan.S.note")));
    await S(p, "window.scrollTo(0, 1500)"); await sleep(600); const y1 = await S(p, "scrollY"), cur1 = await S(p, "window.__plan.S.cur");
    { const lb = await p.locator("#wkt").boundingBox(); /* by coordinates: Playwright's own locator tap scrolls the element into view first */ if (touch) await p.touchscreen.tap(lb.x + 24, lb.y + lb.height / 2); else await p.mouse.click(lb.x + 24, lb.y + lb.height / 2); } await sleep(1200);
    ok(`${tag} B: a plain tap on the label means nothing (the list does not move, the week does not change)`, Math.abs((await S(p, "scrollY")) - y1) <= 60 /* the header may change height under a touch, as on main */ && (await S(p, "window.__plan.S.cur")) === cur1 && (await todayGap(p)) < -300, [y1, cur1]);
    await S(p, "window.scrollTo(0, 2500)"); await sleep(600); await p.keyboard.press("t"); await sleep(1800); const g2 = await todayGap(p); ok(`${tag} B: the T key does the same`, g2 >= -2 && g2 <= 16, g2);
    await S(p, "window.scrollTo(0, 2500)"); await sleep(600); await p.locator("#wkt").focus(); await p.keyboard.press("Enter"); await sleep(1800); const g3 = await todayGap(p); ok(`${tag} B: Enter on the focused label does the same`, g3 >= -2 && g3 <= 16, g3);
    ok(`${tag} B: no sideways scroll, no page errors`, (await noSide(p)) && errs.length === 0, errs); await p.close(); }
  { // the ribbon always on, the two-stop sheet, a gliding list, and the Ask AI curtain showing far away
    for (const [q, name] of [["rb=always", "with the ribbon always on (superseded variant)"], ["sel=thu-salmon&dt=sheet", "with the two-stop sheet open"]]) {
      const p = await open(ctx, q, errs); await S(p, "window.scrollTo(0, 2500)"); await sleep(700); if (/dt=sheet/.test(q)) await p.keyboard.press("t"); /* the open sheet is modal: its scrim covers the label, so the key is the way */ else await labelHold(ctx, p, touch); await sleep(2800); const g = await todayGap(p), st = await S(p, "({ cur: window.__plan.S.cur, sel: window.__plan.S.sel })");
      ok(`${tag} B: ${name}: the long hold from far away lands on today`, st.cur === "d13" && g >= -2 && g <= 26 && st.sel === null, { g, st }); await p.close(); }
    const p = await open(ctx, "", errs); await S(p, "window.scrollTo({ top: 2500, behavior: 'smooth' })"); await sleep(220); await labelHold(ctx, p, touch); await sleep(2800); const g = await todayGap(p); ok(`${tag} B: a hold while the list is still gliding lands on today`, g >= -2 && g <= 16, g);
    await S(p, "window.scrollTo(0, 2500)"); await sleep(700); ok(`${tag} B: far away the Ask AI curtain shows`, await S(p, "window.__plan.S.cuShown")); await labelHold(ctx, p, touch); await sleep(2800);
    ok(`${tag} B: leaving the empty far week, the curtain goes and today is still under the header`, !(await S(p, "window.__plan.S.cuShown")) && (await todayGap(p)) >= -2 && (await todayGap(p)) <= 16, await todayGap(p)); await p.close(); }
  { // a detail docked: the docked day swaps to today; closing it leaves the list on today
    for (const q of ["sel=thu-salmon", "dock=n05", "dock=d22"]) {
      const p = await open(ctx, q, errs); await labelHold(ctx, p, touch); await sleep(1600);
      const st = await S(p, "({ cur: window.__plan.S.cur, sel: window.__plan.S.sel, dday: window.__plan.S.dday })");
      ok(`${tag} B: detail docked (${q}): the long hold swaps the docked day to today (Tue 13)`, st.cur === "d13" && (st.sel === "tue-pasta" || st.dday === "d13"), st);
      ok(`${tag} B: detail docked (${q}): it is the docked day with the Today tag`, /today/i.test(await p.locator(".dkh").first().innerText()));
      await tap(p.locator("[data-close]").first()); await sleep(1400); const g = await todayGap(p);
      ok(`${tag} B: detail docked (${q}): closing it leaves the list on today, just under the header`, g >= -2 && g <= 16 && (await S(p, "window.__plan.S.sel")) === null, g); await p.close(); } }

  // ---------- C. Clear week acts on the current filter scope, never on the past (203) ----------
  { const p = await open(ctx, "", errs); const pre = await snapAll(p); await S(p, "window.__plan.showWeek('d13')"); await sleep(600);
    ok(`${tag} C: Mine: the Clear button names its scope`, /Clear week, mine/.test(await p.locator(".hd [data-clearw]").getAttribute("aria-label")) && /Clear week, mine/.test(await p.locator(".hd [data-clearw]").getAttribute("title")));
    await tap(p.locator(".hd [data-clearw]")); await sleep(500);
    const after = await ids(p), b = await S(p, "window.__plan.S.blocked"), msg = await S(p, "window.__plan.S.note.msg");
    ok(`${tag} C: Mine clears only my own planned meals (Mushroom pasta, the curry and Salmon patties stay; Tuna salad and the Fri 16 leftovers go)`, !after.includes("thu-tuna") && !after.includes("fri-left") && ["tue-pasta", "wed-curry", "thu-salmon"].every(i => after.includes(i)), after);
    ok(`${tag} C: Mine clears my changes (Fri 16 and Sun 18 back to Not cooking every week) and leaves the household's Sat 17 mark`, b.d16 === "usual" && b.d18 === "usual" && b.d17 === "once", b);
    ok(`${tag} C: the past is untouched (Mon 12 and all of last week)`, ["mon-shak", "l-mon", "l-tue", "l-wed", "l-thu", "l-thu2", "l-fri", "l-sun"].every(i => after.includes(i)) && b.d10 === "once", after);
    ok(`${tag} C: the day says it was my plan, how many household meals stayed, and that usual days stay`, /\(my plan\)/.test(msg) && /3 household meals stay/.test(msg) && /Usual days off stay/.test(msg) && /Cleared 2 meals and 2 Not cooking changes/.test(msg), msg);
    ok(`${tag} C: the Undo flip names the scope (clear, mine) and the sub line starts with Mine`, /clear, mine/i.test(await p.locator(".hd .flipundo").innerText()) && /^Mine: cleared 2 meals and 2 changes/.test(await p.locator("#wks").innerText()), [await p.locator(".hd .flipundo").innerText(), await p.locator("#wks").innerText()]);
    ok(`${tag} C: the header fits with the Undo showing, and no sideways scroll`, await fits(p));
    await tap(p.locator(".hd .flipundo")); await sleep(400); ok(`${tag} C: Undo restores exactly what Mine cleared (meals, Not cooking and owners)`, (await snapAll(p)) === pre);
    await tap(p.locator(".hd [data-clearw]")); await sleep(2800 + (reduced ? 0 : 0)); await p.close(); }
  { const p = await open(ctx, "who=household", errs); const pre = await snapAll(p); await S(p, "window.__plan.showWeek('d13')"); await sleep(600);
    ok(`${tag} C: Household: the Clear button names its scope`, /Clear week, household/.test(await p.locator(".hd [data-clearw]").getAttribute("aria-label")));
    await tap(p.locator(".hd [data-clearw]")); await sleep(500);
    const after = await ids(p), b = await S(p, "window.__plan.S.blocked"), msg = await S(p, "window.__plan.S.note.msg");
    ok(`${tag} C: Household clears the household's planned meals, today included (Tue 13, Wed 14, Thu 15 Salmon)`, ["tue-pasta", "wed-curry", "thu-salmon"].every(i => !after.includes(i)), after);
    ok(`${tag} C: it leaves the meals that are only in my own plan (Tuna salad, Fri 16 leftovers) and the changes I made (Fri 16, Sun 18 stay opened)`, after.includes("thu-tuna") && after.includes("fri-left") && !b.d16 && !b.d18, [after, b]);
    ok(`${tag} C: it clears the household's own mark (Sat 17 is open again)`, !b.d17, b);
    ok(`${tag} C: today is cleared, the past is not (Mon 12 Shakshuka and last week stay)`, ["mon-shak", "l-mon", "l-tue", "l-wed", "l-fri", "l-sun"].every(i => after.includes(i)) && b.d10 === "once", after);
    ok(`${tag} C: next week is untouched (Thu 22 mark, Fri 23 opened, Sun 25 usual)`, b.d22 === "once" && !b.d23 && b.d25 === "usual", b);
    ok(`${tag} C: the day says it was the household plan and that 2 personal meals stay`, /\(household plan\)/.test(msg) && /2 personal meals stay/.test(msg) && /Cleared 3 meals and 1 Not cooking change/.test(msg), msg);
    ok(`${tag} C: the Undo flip names the scope (clear, household) and the sub line starts with Household`, /clear, household/i.test(await p.locator(".hd .flipundo").innerText()) && /^Household: cleared 3 meals and 1 change/.test(await p.locator("#wks").innerText()));
    ok(`${tag} C: the header fits with the Undo showing, and no sideways scroll`, await fits(p));
    await tap(p.locator(".hd .flipundo")); await sleep(400); ok(`${tag} C: Undo restores exactly what Household cleared`, (await snapAll(p)) === pre); await p.close(); }
  { const p = await open(ctx, "who=priya", errs); const pre = await snapAll(p); ok(`${tag} C: another person's plan: no Clear button at all`, (await p.locator(".hd [data-clearw]").count()) === 0);
    await S(p, "window.__plan.clearWeek()"); await sleep(200); ok(`${tag} C: calling Clear there anyway changes nothing`, (await snapAll(p)) === pre); await p.close(); }
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.showWeek('d19')"); await S(p, "window.__plan.block('d19')"); await sleep(500);
    ok(`${tag} C: a Not cooking mark made in Mine is recorded as mine`, (await S(p, "window.__plan.S.bown.d19")) === "mine");
    await tap(p.locator("[data-fmenu]")); await sleep(250); await tap(p.locator('.dd [data-view="household"]')); await sleep(300); await S(p, "window.__plan.block('d20')"); await sleep(500);
    ok(`${tag} C: and one made in Household as the household's`, (await S(p, "window.__plan.S.bown.d20")) === "household");
    await tap(p.locator(".hd [data-clearw]")); await sleep(500); const b = await S(p, "window.__plan.S.blocked");
    ok(`${tag} C: Household's Clear removes its own mark (Tue 20) and not mine (Mon 19)`, !b.d20 && b.d19 === "once", b);
    await tap(p.locator(".hd .flipundo")); await sleep(300); await tap(p.locator("[data-fmenu]")); await sleep(250); await tap(p.locator('.dd [data-view="mine"]')); await sleep(300); await S(p, "window.__plan.showWeek('d19')"); await sleep(500); await tap(p.locator(".hd [data-clearw]")); await sleep(500);
    const b2 = await S(p, "window.__plan.S.blocked"); ok(`${tag} C: Mine's Clear removes my mark (Mon 19) and not the household's (Tue 20)`, !b2.d19 && b2.d20 === "once", b2); await p.close(); }
  { const p = await open(ctx, "cs=visible", errs); await S(p, "window.__plan.showWeek('d13')"); await sleep(500); await tap(p.locator(".hd [data-clearw]")); await sleep(500); const after = await ids(p);
    ok(`${tag} C: the other reading (?cs=visible): Mine clears every meal it shows from today on, shared ones too, and still not the past`, ["tue-pasta", "wed-curry", "thu-salmon", "thu-tuna", "fri-left"].every(i => !after.includes(i)) && after.includes("mon-shak") && after.includes("l-fri"), after); await p.close(); }
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.showWeek('d05')"); await sleep(600); ok(`${tag} C: last week (past): Clear is disabled in Mine`, await p.locator(".hd [data-clearw]").isDisabled()); await p.close();
    const q = await open(ctx, "who=household", errs); await S(q, "window.__plan.showWeek('d05')"); await sleep(600); ok(`${tag} C: last week (past): Clear is disabled in Household too`, await q.locator(".hd [data-clearw]").isDisabled()); await q.close(); }

  // ---------- D. another person's meal: read only, but Hold and Add work (204) ----------
  { const p = await open(ctx, "who=priya", errs); await S(p, "window.__plan.showWeek('d14')"); await sleep(500);
    const tile = p.locator('.mc[data-id="wed-curry"]'); await tile.scrollIntoViewIfNeeded(); await tap(tile); await sleep(900);
    const planBefore = await snapPlan(p);
    ok(`${tag} D: tapping their meal opens the detail`, (await S(p, "window.__plan.S.sel")) === "wed-curry");
    ok(`${tag} D: it says so with the eye and "View only, Priya's plan" (no other words)`, norm(await p.locator(".ronote").innerText()) === "View only, Priya's plan" && (await p.locator(".ronote svg").count()) === 1 && (await p.locator(".ronote svg path").first().getAttribute("d")) === (await p.locator(".vo svg path").first().getAttribute("d")));
    const html = await p.locator("main").innerHTML(); ok(`${tag} D: no plan-changing control is in the detail or the tiles (no replan, Not cooking, move, copy forward)`, !FRAGILE.test(html), (html.match(FRAGILE) || [])[0]);
    ok(`${tag} D: the people stepper is disabled`, await p.locator(".dkb [data-n], .sbody [data-n]").evaluateAll(es => es.length === 2 && es.every(e => e.disabled)));
    const foot = (await p.locator(".sfoot button").allInnerTexts()).map(norm); ok(`${tag} D: the footer has Hold 5 and Add 1, nothing else`, foot.length === 2 && foot[0] === "Hold 5" && foot[1] === "Add 1", foot);
    ok(`${tag} D: the missing ingredient has its cart (1), the other missing one is already on the list`, (await p.locator(".ing [data-addone]").count()) === 1 && (await p.locator(".ing .onl").count()) === 1);
    const hb = await p.locator(".sfoot [data-hold]").boundingBox(), ab = await p.locator(".sfoot [data-addall]").boundingBox(); ok(`${tag} D: Hold and Add are 44 px targets`, hb.height >= 43.5 && ab.height >= 43.5, [hb, ab]);
    await tap(p.locator("[data-more]").first()); await sleep(300); const items = (await p.locator(".asheet .it").allInnerTexts()).map(norm);
    ok(`${tag} D: the ... menu offers Open recipe only`, items.length === 1 && /Open recipe/.test(items[0]), items); await p.keyboard.press("Escape"); await sleep(300);
    await S(p, "document.activeElement && document.activeElement.blur()"); await p.keyboard.press("x"); await p.keyboard.press("Shift+X"); await sleep(250); ok(`${tag} D: X and Shift X change nothing and the detail stays`, (await snapPlan(p)) === planBefore && (await S(p, "window.__plan.S.sel")) === "wed-curry");
    const c = await p.locator(".mc").first().boundingBox(); await swipe(ctx, p, touch, c.x + c.width / 2 - 50, c.y + c.height / 2, 150); await sleep(250); await swipe(ctx, p, touch, c.x + c.width / 2 + 50, c.y + c.height / 2, -150); await sleep(250);
    await holdAt(ctx, p, touch, c.x + c.width / 2, c.y + c.height / 2, 750); await sleep(250); ok(`${tag} D: swipes and a long press on the tile do nothing (no lift, no drag)`, (await snapPlan(p)) === planBefore && (await S(p, "!window.__plan.S.carry")) && (await p.locator(".mc.hold, .hand, .lifted, .mc.drag").count()) === 0);
    await S(p, "window.__plan.S.note = null; window.__plan.render(false)"); const ctl = await p.locator("main button, main select, main [tabindex='0']").evaluateAll(es => es.filter(e => !e.disabled && e.offsetParent !== null).map(e => [...e.attributes].map(a => a.name).join(" ")));
    ok(`${tag} D: no control reachable by touch, mouse or Tab is a plan-changing one`, ctl.length > 3 && !ctl.some(t => /data-(act|replan|nocook|moveto|copy|n|pcsel|block|openday|unblock|od-b)\b/.test(t)), ctl.slice(0, 14));
    const held0 = await S(p, "window.__plan.find('wed-curry').held");
    await tap(p.locator(".sfoot [data-hold]")); await sleep(350); ok(`${tag} D: Hold works in their plan: it sets my hold on that meal and the button reads Release 5`, (await S(p, "window.__plan.find('wed-curry').held")) === 1 - held0 && norm(await p.locator(".sfoot [data-hold]").innerText()) === "Release 5", await p.locator(".sfoot [data-hold]").innerText());
    ok(`${tag} D: Hold says what it did`, /Holding the ingredients/.test(await S(p, "window.__plan.S.note.msg")));
    await tap(p.locator(".sfoot [data-hold]")); await sleep(350); ok(`${tag} D: Release works too (back to Hold 5)`, (await S(p, "window.__plan.find('wed-curry').held")) === held0 && norm(await p.locator(".sfoot [data-hold]").innerText()) === "Hold 5");
    const listed0 = await S(p, "window.__plan.find('wed-curry').miss.filter(function (x) { return x[2]; }).length");
    await tap(p.locator(".ing [data-addone]").first()); await sleep(350);
    ok(`${tag} D: the cart on one ingredient adds it to MY shopping list (listed ${listed0} to ${listed0 + 1}), and Add 1 is gone from the footer`, (await S(p, "window.__plan.find('wed-curry').miss.filter(function (x) { return x[2]; }).length")) === listed0 + 1 && (await p.locator(".sfoot [data-addall]").count()) === 0 && (await p.locator(".ing .onl").count()) === 2);
    ok(`${tag} D: the plan itself did not change (meals, days, people, Not cooking)`, (await snapPlan(p)) === planBefore); await p.close(); }
  { const p = await open(ctx, "who=priya", errs); await S(p, "window.__plan.showWeek('d15')"); await sleep(400); await S(p, "window.__plan.openDetail('thu-salmon')"); await sleep(800);
    const un = await S(p, "window.__plan.find('thu-salmon').miss.filter(function (x) { return !x[2]; }).length"); await tap(p.locator(".sfoot [data-addall]")); await sleep(400);
    const m = await S(p, "window.__plan.find('thu-salmon')"); ok(`${tag} D: Add all adds every missing ingredient (${un}) to my list, the note says so, with Undo`, m.miss.every(x => x[2]) && /Added \d items? to the shopping list/.test(await S(p, "window.__plan.S.note.msg")) && (await S(p, "window.__plan.S.note.undo")), m.miss);
    await p.keyboard.press("z"); await sleep(350); ok(`${tag} D: Undo takes the Add back`, (await S(p, "window.__plan.find('thu-salmon').miss.filter(function (x) { return !x[2]; }).length")) === un);
    await S(p, "window.__plan.closeDetail()"); await sleep(500);
    const tile = p.locator('.mc[data-id="thu-salmon"]'); await tile.scrollIntoViewIfNeeded(); await tile.focus(); await p.keyboard.press("h"); await sleep(300); ok(`${tag} D: the H key on a focused tile holds it (my hold)`, (await S(p, "window.__plan.find('thu-salmon').held")) === 1);
    const tile2 = p.locator('.mc[data-id="thu-salmon"]'); await tile2.focus(); await p.keyboard.press("l"); await sleep(300); ok(`${tag} D: the L key adds its missing items to my list`, await S(p, "window.__plan.find('thu-salmon').miss.every(function (x) { return x[2]; })")); await p.close(); }
  { // a hold is one shared state: what I hold in their plan is held in mine
    const p = await open(ctx, "who=priya", errs); await S(p, "window.__plan.act('hold', 'wed-curry')"); await sleep(200); const heldIn = await S(p, "window.__plan.find('wed-curry').held");
    await tap(p.locator("[data-fmenu]")); await sleep(250); await tap(p.locator('.dd [data-view="mine"]')); await sleep(350); await S(p, "window.__plan.openDetail('wed-curry')"); await sleep(800);
    ok(`${tag} D: switching to Mine, the meal I held in Priya's plan reads Release (one hold state, 176) and there is no view-only note`, heldIn === 1 && /^Release/.test(norm(await p.locator(".sfoot [data-hold]").innerText())) && (await p.locator(".ronote").count()) === 0, heldIn); await p.close(); }
  { // a past meal in their plan: read only, nothing to hold or add (Proposal)
    const q = await open(ctx, "who=priya&sel=l-wed", errs); await sleep(400);
    ok(`${tag} D: a past meal in their plan: the detail opens, says view only, and offers no Hold, Add, cart or Copy forward`, (await S(q, "window.__plan.S.sel")) === "l-wed" && /View only, Priya's plan/.test(await q.locator(".ronote").innerText()) && (await q.locator(".sfoot button, .sfoot button, .ing [data-addone], [data-hold], [data-addall], [data-act=copyfwd]").count()) === 0);
    await S(q, "window.__plan.act('hold', 'l-wed'); window.__plan.act('list', 'l-wed')"); ok(`${tag} D: and a hold or add sent to it anyway changes nothing`, (await S(q, "window.__plan.find('l-wed').held")) === 0); await q.close(); }
  { // the in-list variant (?ba=list) works the same way in their plan
    const p = await open(ctx, "who=priya&sel=wed-curry&ba=list", errs); await sleep(500); ok(`${tag} D: ?ba=list: Add all and Hold all are in the list in their plan, and there is no footer`, (await p.locator(".ing .ga-add [data-addall], .ing .ga-hold [data-hold]").count()) === 2 && (await p.locator(".sfoot").count()) === 0); await p.close(); }
  { // Mine is unchanged: the plan controls are all there
    const p = await open(ctx, "sel=wed-curry", errs); await sleep(500); ok(`${tag} D: in Mine the detail still has the stepper, Hold, Add and the ... menu, and no view-only note`, (await p.locator(".dkb [data-n], .sbody [data-n]").count()) === 2 && (await p.locator(".sfoot [data-hold]").count()) === 1 && (await p.locator(".ronote").count()) === 0 && (await p.locator("[data-more]").count()) >= 1);
    await tap(p.locator("[data-more]").first()); await sleep(300); const items = (await p.locator(".asheet .it").allInnerTexts()).map(norm); ok(`${tag} D: and its ... menu still has Open recipe, Replan, Move and Not cooking`, items.length === 4, items); await p.close(); }

  // ---------- E. the week buttons on another person's plan (205, Proposal) ----------
  { const p = await open(ctx, "who=priya", errs); ok(`${tag} E: another person's plan: the week buttons are not drawn (default, simplest)`, (await p.locator(".wact").count()) === 0); await p.close();
    const q = await open(ctx, "who=priya&wo=show", errs); ok(`${tag} E: ?wo=show draws them (Add to buy, Reserve) for comparison`, (await q.locator(".wact [data-wbuy], .wact [data-wres], .wact [data-wrel]").count()) >= 1);
    const before = await snapPlan(q); await tap(q.locator(".wact [data-wbuy]").first()); await sleep(400); ok(`${tag} E: and Add to buy there adds to my list without changing the plan`, (await snapPlan(q)) === before && /Added \d+ items?/.test(await S(q, "window.__plan.S.note.msg"))); await q.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
