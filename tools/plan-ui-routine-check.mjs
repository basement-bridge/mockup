// Behaviour check for the Plan UI phone mockup: Clear week and the routine (Plan UI review 195, 196) and the five-week range (197), headless Chromium, touch and mouse, dark and light; also that desktop still draws its three weeks.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-routine-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html", DESK = BASE.replace("phone.html", "desktop.html");
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs, base) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto((base || BASE) + (q ? "?" + q : "")); await sleep(500); return p; }
const S = (p, f) => p.evaluate(f);
const state = p => S(p, "JSON.stringify({ m: window.__plan.S.meals.map(function (m) { return m.id + '@' + m.day; }), b: window.__plan.S.blocked })");
const blocked = p => S(p, "JSON.parse(JSON.stringify(window.__plan.S.blocked))");
const mealDays = p => S(p, "window.__plan.S.meals.map(function (m) { return m.day; })");

for (const [scheme, w, h, touch] of [["dark", 390, 844, true], ["dark", 360, 740, true], ["dark", 1280, 900, false], ["light", 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme }); const errs = []; const tag = `${scheme} ${touch ? "touch" : "mouse"} ${w}`;
  const tap = loc => touch ? loc.tap() : loc.click();
  // ---------- C. the two layers ----------
  { const p = await open(ctx, "ut=2", errs); const b0 = await blocked(p);
    ok(`${tag} C: the routine is Fri and Sun; routine days from today on start Not cooking every week, except the ones opened for their week`, b0.d25 === "usual" && b0.d30 === "usual" && b0.n01 === "usual" && b0.n06 === "usual" && b0.n08 === "usual" && !b0.d16 && !b0.d18 && !b0.d23 && b0.d17 === "once" && b0.d22 === "once", b0);
    ok(`${tag} C: a one-off mark and a usual day read differently (tile and card words)`, await S(p, "(function () { window.__plan.S.nc = 'show'; window.__plan.render(false); var a = document.querySelector('#d-d17 .blk span').textContent, b = document.querySelector('#d-d25 .blk span').textContent; return /This week only/.test(a) && /Every week, usual day off/.test(b); })()"));
    const pre = await state(p); const mealsBefore = await mealDays(p);
    await S(p, "window.__plan.showWeek('d13')"); await sleep(600);
    await tap(p.locator(".hd [data-clearw]")); await sleep(500);
    const b1 = await blocked(p), md = await mealDays(p);
    ok(`${tag} C: Clear week with Mine removes my own planned meals from today on (Thu 15 Tuna salad, Fri 16 leftovers), keeps the household's dinners (Tue 13, Wed 14, Thu 15) and the past (Mon 12) (203)`, md.filter(d => d === "d16").length === 0 && md.filter(d => d === "d15").length === 1 && md.includes("d13") && md.includes("d14") && md.includes("d12") && md.filter(d => d < "d12").length === mealsBefore.filter(d => d < "d12").length, md);
    ok(`${tag} C: Mine leaves a household mark alone (Sat 17 stays Not cooking)`, b1.d17 === "once", b1);
    ok(`${tag} C: a usual day opened this week goes back to Not cooking every week (Fri 16, Sun 18)`, b1.d16 === "usual" && b1.d18 === "usual", b1);
    ok(`${tag} C: next week and the routine itself are untouched (Thu 22 one-off, Sun 25 usual, later usual days)`, b1.d22 === "once" && b1.d25 === "usual" && b1.d30 === "usual" && b1.n01 === "usual" && b1.n08 === "usual" && !b1.d23, b1);
    const msg = await S(p, "window.__plan.S.note && window.__plan.S.note.msg"); ok(`${tag} C: the day says what went (my plan), that usual days stay and that household meals stay`, /Cleared 2 meals and 2 Not cooking changes/.test(msg) && /my plan/.test(msg) && /Usual days off stay/.test(msg) && /3 household meals stay/.test(msg), msg);
    ok(`${tag} C: the Clear icon is Undo in place for the window`, (await p.locator(".hd .flipundo").count()) === 1 && /clear, mine/i.test(await p.locator(".hd .flipundo").innerText()));
    await tap(p.locator(".hd .flipundo")); await sleep(400);
    ok(`${tag} C: Undo restores meals and Not cooking exactly`, (await state(p)) === pre);
    await tap(p.locator(".hd [data-clearw]")); await sleep(2800);
    ok(`${tag} C: after the window nothing of mine is left to clear: the icon is dimmed and says so`, (await p.locator(".hd [data-clearw]").isDisabled()) && /Nothing of mine to clear/.test(await p.locator(".hd [data-clearw]").getAttribute("title")));
    ok(`${tag} C: no page errors`, errs.length === 0, errs); await p.close(); }
  // next week: one-off removed, the opened Friday goes back, the usual Sunday stays
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.showWeek('d19')"); await sleep(700);
    await S(p, "(function () { var A = window.__plan, S = A.S; var c = JSON.parse(JSON.stringify(S.meals[4])); c.id = 'n-x'; c.day = 'd20'; S.meals.push(c); A.render(false); })()");
    await tap(p.locator(".hd [data-clearw]")); await sleep(500); const b = await blocked(p), md = await mealDays(p);
    ok(`${tag} C: next week: meal gone, Thu 22 one-off gone, opened Fri 23 back to usual, Sun 25 stays usual`, !md.includes("d20") && !b.d22 && b.d23 === "usual" && b.d25 === "usual", [md, b]);
    ok(`${tag} C: this week was not touched by clearing next week`, md.includes("d14") && b.d17 === "once"); await p.close(); }
  // Mark as open on a usual day opens this week only; Clear brings the usual day back
  { const p = await open(ctx, "nc=show", errs); await S(p, "window.__plan.showWeek('d19')"); await sleep(700);
    const t = p.locator('.blk[data-openday="d25"]'); await t.scrollIntoViewIfNeeded(); await tap(t); await sleep(450);
    ok(`${tag} C: the usual day's card says "Not cooking, every week (usual day off)"`, /Not cooking, every week \(usual day off\)/.test(await p.locator("#lite .lnote").innerText()));
    await tap(p.locator("#lite .mko")); await sleep(500); ok(`${tag} C: Mark as open opens it for this week only and says the usual day off stays`, !(await blocked(p)).d25 && /usual day off stays/.test(await S(p, "window.__plan.S.note.msg")));
    await tap(p.locator('.od[data-od-b="d25"]')); await sleep(450); ok(`${tag} C: an opened usual day's card says so`, /usual day off opened this week/.test(await p.locator("#lite .lnote").innerText()));
    await p.keyboard.press("Escape"); await sleep(300); await tap(p.locator(".hd [data-clearw]")); await sleep(500);
    ok(`${tag} C: Clear week returns the opened usual day to Not cooking every week`, (await blocked(p)).d25 === "usual", await blocked(p)); await p.close(); }
  // a one-off on a routine day, then Clear
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.block('d16'); ");
    ok(`${tag} C: a one-off mark on a routine day shows as This week only`, (await blocked(p)).d16 === "once");
    await S(p, "window.__plan.showWeek('d13')"); await sleep(600); await tap(p.locator(".hd [data-clearw]")); await sleep(400); ok(`${tag} C: Clear week resets it to the routine (usual)`, (await blocked(p)).d16 === "usual"); await p.close(); }
  // the tip under a routine day that has a meal is derived, not stored
  { const p = await open(ctx, "", errs); ok(`${tag} C: Fri 16 (usual day off, cooking this week) keeps its line, and only in Mine`, /Usual day off, cooking this week/.test(await p.locator("#d-d16").innerText())); await p.close();
    const q = await open(ctx, "who=household", errs); ok(`${tag} C: not shown in Household`, !/Usual day off, cooking this week/.test(await q.locator("#d-d16").innerText())); await q.close(); }
  // Copy last week respects the routine
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.showWeek('d19')"); await sleep(700); await tap(p.locator(".hd [data-copy]")); await sleep(500); const md = await mealDays(p), b = await blocked(p);
    ok(`${tag} C: Copy last week fills open nights only: not Thu 22 (one-off), not Sun 25 (usual day off)`, !md.includes("d22") && !md.includes("d25") && b.d25 === "usual" && md.includes("d20"), md);
    await p.close(); }
  // ---------- F. five weeks ----------
  { const p = await open(ctx, "", errs);
    const g = await S(p, "(function () { var R = window.PUR.RIB; return { n: R.length, wks: [R[0].wk, R[R.length - 1].wk], first: R[0].id, last: R[R.length - 1].id, ids: new Set(R.map(function (r) { return r.id; })).size, nov2: window.PUR.dinfo('n02'), pad: R[27].id }; })()");
    ok(`${tag} F: the range is last week to three weeks ahead: 35 days, weeks -1 to 3, d05 to n08`, g.n === 35 && g.wks[0] === -1 && g.wks[1] === 3 && g.first === "d05" && g.last === "n08" && g.ids === 35, g);
    ok(`${tag} F: November days are Nov (Mon 2 Nov)`, g.nov2.dow === "Mon" && g.nov2.mo === "Nov" && g.nov2.n === 2 && g.nov2.wk === 3, g.nov2);
    const labs = await p.locator(".wkd").allInnerTexts(); ok(`${tag} F: five week rows with the right words`, labs.length === 5 && /Week of 5 Oct\s+Last week · read only/i.test(labs[0].replace(/\n/g, " ")) && /Week of 26 Oct\s+In 2 weeks/i.test(labs[3].replace(/\n/g, " ")) && /Week of 2 Nov\s+In 3 weeks/i.test(labs[4].replace(/\n/g, " ")) && !labs.join(" ").includes("9 Nov"), labs);
    ok(`${tag} F: 35 day rows, the last is Sun 8 Nov, nothing after it`, (await p.locator(".pw-day").count()) === 35 && (await p.locator(".pw-day").last().getAttribute("data-d")) === "n08" && /Sun 8 Nov/.test(await p.locator(".pw-day").last().locator(".pw-dn").getAttribute("aria-label").then(t => t.replace("Sunday", "Sun"))), await p.locator(".pw-day").last().locator(".pw-dn").getAttribute("aria-label"));
    ok(`${tag} F: far weeks are empty of meals; their usual days off are Not cooking`, await S(p, "window.__plan.S.meals.every(function (m) { return m.day <= 'd25'; }) && window.__plan.S.blocked.n06 === 'usual'"));
    await S(p, "window.__plan.showWeek('n02')"); await sleep(900); ok(`${tag} F: the header says Week of 2 Nov, In 3 weeks`, (await p.locator("#wkt").innerText()) === "Week of 2 Nov" && (await p.locator("#wks").innerText()) === "In 3 weeks");
    await S(p, "window.scrollTo(0, document.body.scrollHeight)"); await sleep(700); ok(`${tag} F: the end of the agenda is reachable and ends on the last week`, await S(p, "window.__plan.S.cur >= 'n04' && window.__plan.S.cur[0] === 'n'"), await S(p, "window.__plan.S.cur"));
    ok(`${tag} F: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await p.close(); }
  // far weeks behave like next week: Surprise me, the strip's name, counts
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.showWeek('d26')"); await sleep(700); const o = p.locator('.od[data-od-b="d27"]'); await o.scrollIntoViewIfNeeded(); await tap(o); await sleep(450); await tap(p.locator("#lite [data-surprise]")); await sleep(700);
    ok(`${tag} F: Surprise me works on a night three weeks out`, (await mealDays(p)).includes("d27"));
    await p.keyboard.press("Escape"); await sleep(300); await S(p, "window.__plan.closeDetail && window.__plan.closeDetail()"); await sleep(300);
    const strip = await p.locator(".wact").evaluateAll(es => es.map(e => e.getAttribute("aria-label"))); ok(`${tag} F: the bulk strip for the week of 26 Oct is named for that week, not "next week"`, strip.some(l => l === "Bulk actions for the week of 26 Oct"), strip);
    ok(`${tag} F: its label row counts 1 of 7 nights`, /1 of 7 nights/.test(await p.locator(".wkd").nth(3).innerText())); await p.close(); }
  // the ribbon and the date picker reach the new weeks
  { const p = await open(ctx, "sel=wed-curry", errs);
    ok(`${tag} F: the ribbon has 35 days, 4 week separators and a Nov marker on Sun 1 Nov`, (await p.locator("#rib .dy").count()) === 35 && (await p.locator("#rib .wsep").count()) === 4 && (await p.locator('#rib .dy[data-dy="n01"] .mo').textContent()) === "Nov" && /Sun 1 Nov/.test(await p.locator('#rib .dy[data-dy="n01"]').getAttribute("aria-label")));
    await S(p, "window.__plan.goDay('n04')"); await sleep(500); ok(`${tag} F: a ribbon day in November swaps the docked day`, (await S(p, "window.__plan.S.cur")) === "n04" && /Wednesday 4 Nov/.test(await p.locator("#stt").innerText()), await p.locator("#stt").innerText()); await p.close();
    const q = await open(ctx, "", errs); await S(q, "window.__plan.act('copyfwd', 'l-mon')"); await sleep(300);
    const cells = await q.locator("[data-pickday]").count(), dis = await q.locator("[data-pickday]:disabled").count(); ok(`${tag} F: the date picker offers four weeks (28 days), with the days before today disabled`, cells === 28 && dis === 1, [cells, dis]);
    ok(`${tag} F: the picker's week headings reach Week of 2 Nov`, /Week of 2 Nov · In 3 weeks/.test(await q.locator(".asheet").innerText()));
    await S(q, "window.__plan.startCarry('l-mon', 'n04')"); await sleep(600); await S(q, "window.__plan.drop('n04')"); await sleep(500); ok(`${tag} F: copy forward onto a November day lands there`, (await mealDays(q)).includes("n04")); await q.close(); }
  // Copy last week bounds across the range
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.showWeek('n02')"); await sleep(700); await tap(p.locator(".hd [data-copy]")); await sleep(400);
    ok(`${tag} F: Copy last week in the last week (source: an empty week) says there is nothing to fill`, /Nothing to fill/.test(await S(p, "window.__plan.S.note && window.__plan.S.note.msg")));
    await S(p, "window.__plan.showWeek('d26')"); await sleep(700); ok(`${tag} F: Clear week in an untouched far week is dimmed (only usual days off there)`, await p.locator(".hd [data-clearw]").isDisabled()); await p.close(); }
  // size and speed of the default path
  { const p = await open(ctx, "", errs); const m = await S(p, "(function () { var A = window.__plan, t = []; for (var i = 0; i < 15; i++) { var a = performance.now(); A.render(false); t.push(performance.now() - a); } t.sort(function (x, y) { return x - y; }); return { nodes: document.getElementsByTagName('*').length, days: document.querySelectorAll('.pw-day').length, median: +t[7].toFixed(1) }; })()");
    ok(`${tag} F: performance: ${m.nodes} nodes for 35 day rows, a full render in about ${m.median} ms (under 60)`, m.nodes < 900 && m.median < 60, m); await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
// desktop is untouched: still three weeks, no errors
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const errs = []; const p = await open(ctx, "", errs, DESK);
  ok(`desktop: still draws its three weeks (the range change is phone-only), no errors`, (await S(p, "window.PUR.RIB.length")) === 21 && (await S(p, "window.PUR.RIB[20].id")) === "d25" && errs.length === 0, errs); await ctx.close(); }
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
