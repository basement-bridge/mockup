// Behaviour check for the Plan UI phone mockup, Reserve and Release (Plan UI review 172 to 175), headless Chromium, touch and mouse.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-week-release-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await p.addStyleTag({ content: ".optfab{display:none!important}" }); await sleep(500); return p; }
const WA0 = '.wact[aria-label="Bulk actions for this week"]', WA1 = '.wact[aria-label="Bulk actions for next week"]';
const held = p => p.evaluate(() => window.__plan.S.meals.filter(m => +m.day.slice(1) >= 12 && +m.day.slice(1) <= 18).map(m => [m.id, !!m.held]));
const ct = async (loc) => loc.locator(".ct").count() ? +(await loc.locator(".ct").innerText()) : null;
const setState = (p, fn) => p.evaluate(fn => { const A = window.__plan; new Function("S", "A", fn)(A.S, A); A.render(); }, fn);
const names = async (p) => (await p.locator(WA0).locator("button").evaluateAll(bs => bs.map(b => b.querySelector("span") ? b.querySelector("span").textContent : b.textContent)));
// on-hand items of this week from today, held and not held
const sums = p => p.evaluate(() => { const S = window.__plan.S; let h = 0, n = 0; S.meals.filter(m => +m.day.slice(1) >= 13 && +m.day.slice(1) <= 18).forEach(m => { if (m.held) h += m.have.length; else n += m.have.length; }); return { held: h, free: n }; });
for (const [w, h, touch] of [[390, 844, true], [360, 740, true], [1280, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch }); const errs = []; const tag = `${touch ? "touch" : "mouse"} ${w}`;
  const tap = (loc) => touch ? loc.tap() : loc.click();
  // Reserve, Undo, then Release
  { const p = await open(ctx, "ut=2", errs); const s0 = await sums(p);
    ok(`${tag}: starts with something not held: Reserve, count = not-held items`, (await names(p)).includes("Reserve") && (await ct(p.locator(`${WA0} [data-wres]`))) === s0.free, [await names(p), s0]);
    await tap(p.locator(`${WA0} [data-wres]`)); await sleep(200);
    ok(`${tag}: Reserve flips to Undo (reserve) in place`, (await p.locator(`${WA0} button.undo`).count()) === 1 && /reserve/.test(await p.locator(`${WA0} button.undo`).innerText()));
    await sleep(2300);
    ok(`${tag}: after the window, everything held, the button reads Release (not Undo, not Reserve)`, (await p.locator(`${WA0} [data-wrel]`).count()) === 1 && (await p.locator(`${WA0} [data-wres]`).count()) === 0 && (await p.locator(`${WA0} button.undo`).count()) === 0, await names(p));
    const s1 = await sums(p); ok(`${tag}: Release count = held items`, (await ct(p.locator(`${WA0} [data-wrel]`))) === s1.held && s1.free === 0, s1);
    ok(`${tag}: Release is a real button, labelled`, /^Release: /.test(await p.locator(`${WA0} [data-wrel]`).getAttribute("aria-label")));
    const hb = await held(p); await tap(p.locator(`${WA0} [data-wrel]`)); await sleep(200);
    const ha = await held(p);
    ok(`${tag}: Release lets go of every held meal from today on`, ha.filter(x => +x[0].length >= 0).every(([id, v]) => id === "mon-shak" ? v : !v), ha);
    ok(`${tag}: Release leaves the past (Mon 12) held and other weeks alone`, ha.find(x => x[0] === "mon-shak")[1] === true);
    ok(`${tag}: Release shows Undo (release) in place`, (await p.locator(`${WA0} button.undo`).count()) === 1 && /release/.test(await p.locator(`${WA0} button.undo`).innerText()));
    await tap(p.locator(`${WA0} button.undo`).first()); await sleep(200);
    ok(`${tag}: Undo of Release holds them again, exactly`, JSON.stringify(await held(p)) === JSON.stringify(hb));
    await tap(p.locator(`${WA0} [data-wrel]`)); await sleep(100); await sleep(2400);
    ok(`${tag}: after Release and its window, Reserve is back`, (await p.locator(`${WA0} [data-wres]`).count()) === 1 && (await p.locator(`${WA0} [data-wrel]`).count()) === 0, await names(p));
    await p.close(); }
  // item-level hold counts toward the week state (the per-meal Hold, in the docked detail)
  { const p = await open(ctx, "sel=thu-salmon", errs);
    const before = await sums(p); const hb = p.locator(".sfoot .b2.hold"); ok(`${tag}: per-meal button says Hold when not held`, /Hold/.test(await hb.innerText()) && !/Release/.test(await hb.innerText()), await hb.innerText());
    await tap(hb); await sleep(200);
    ok(`${tag}: per-meal button says Release once held (not "Held")`, /Release/.test(await hb.innerText()) && !/Held/.test(await hb.innerText()), await hb.innerText());
    ok(`${tag}: its label says what a tap does`, /^Release the hold/.test(await hb.getAttribute("aria-label")) && (await hb.getAttribute("aria-pressed")) === null);
    await tap(hb); await sleep(200); ok(`${tag}: tapping Release releases (back to Hold)`, /Hold/.test(await hb.innerText()) && !/Release/.test(await hb.innerText()));
    await tap(hb); await sleep(200);
    await p.keyboard.press("Escape"); await sleep(500);
    const mid = await sums(p); ok(`${tag}: one meal held by itself moved its items to held`, mid.held === before.held + 3 && mid.free === before.free - 3, [before, mid]);
    ok(`${tag}: week button still Reserve, with the smaller count (mixed state, default rule)`, (await names(p)).includes("Reserve") && !(await names(p)).includes("Release") && (await ct(p.locator(`${WA0} [data-wres]`))) === mid.free, [await names(p), mid]);
    await tap(p.locator(`${WA0} [data-wres]`)); await sleep(200); await setState(p, "S.ustk = [];");
    ok(`${tag}: Reserve finishes the job: now Release`, (await p.locator(`${WA0} [data-wrel]`).count()) === 1);
    await p.close(); }
  // every meal held one by one at item level makes the week read Release
  { const p = await open(ctx, "", errs);
    await setState(p, "S.meals.forEach(function (m) { if (+m.day.slice(1) >= 13) m.held = 1; });");
    ok(`${tag}: all meals held at item level: the week button reads Release`, (await names(p)).includes("Release") && !(await names(p)).includes("Reserve"), await names(p));
    await p.close(); }
  // the other places the per-meal Hold appears
  for (const ba of ["list", "both"]) { const p = await open(ctx, `sel=thu-salmon&ba=${ba}`, errs); const hb = p.locator("[data-hold]").first(); const t0 = await hb.innerText(); await tap(hb); await sleep(200);
    const t1 = await p.locator("[data-hold]").first().innerText(); ok(`${tag}: ?ba=${ba}: in the list "${t0.trim()}" becomes "${t1.trim()}" (Release)`, /Hold/.test(t0) && /^\s*Release\s*$/.test(t1), [t0, t1]);
    ok(`${tag}: ?ba=${ba}: no "Held" word left`, !/\bHeld\b/.test(await p.locator(".ing").innerText()) && !/\bHeld\b/.test(await p.locator(".sfoot").innerText().catch(() => "")));
    await p.close(); }
  // mixed state rules
  for (const [rs, want] of [["all", ["Reserve"]], ["both", ["Reserve", "Release"]], ["any", ["Release"]]]) { const p = await open(ctx, `rs=${rs}`, errs);
    await setState(p, "S.meals.forEach(function (m) { if (m.id === 'thu-salmon') m.held = 1; });");
    const n = await names(p); ok(`${tag}: ?rs=${rs} mixed: ${want.join(" + ")} (after Add to buy)`, JSON.stringify(n.filter(x => x !== "Add to buy")) === JSON.stringify(want), n);
    const r = await p.locator(WA0).boundingBox(); ok(`${tag}: ?rs=${rs}: strip inside the viewport`, r.x >= 0 && r.x + r.width <= w + 0.5, r);
    ok(`${tag}: ?rs=${rs}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${tag}: ?rs=${rs}: buttons at least 44 high`, (await p.locator(WA0).locator("button").evaluateAll(bs => bs.every(b => b.getBoundingClientRect().height >= 44))));
    await p.close(); }
  // nothing on hand: neither Reserve nor Release; nothing missing too: no row
  { const p = await open(ctx, "", errs);
    await setState(p, "S.meals.forEach(function (m) { if (+m.day.slice(1) >= 13) { m.have = []; m.held = 1; } });");
    ok(`${tag}: nothing on hand (held or not): no Reserve, no Release`, (await p.locator(`${WA0} [data-wres], ${WA0} [data-wrel]`).count()) === 0 && (await p.locator(`${WA0} [data-wbuy]`).count()) === 1);
    await p.close(); }
  // view only: neither
  { const p = await open(ctx, "who=jane", errs); ok(`${tag}: other person's plan: no Reserve or Release`, (await p.locator("[data-wres],[data-wrel]").count()) === 0); await p.close(); }
  // next week acts on its own meals (seeded)
  { const p = await open(ctx, "", errs); await p.evaluate(() => { const A = window.__plan, S = A.S; S.meals.filter(m => +m.day.slice(1) >= 13 && +m.day.slice(1) <= 18).forEach(m => { const c = JSON.parse(JSON.stringify(m)); c.id = "n-" + m.id; c.day = "d" + (+m.day.slice(1) + 7); c.held = 1; if (!S.blocked[c.day]) S.meals.push(c); }); A.render(); });
    ok(`${tag}: next week all held: Release there, Reserve this week`, (await p.locator(`${WA1} [data-wrel]`).count()) === 1 && (await p.locator(`${WA0} [data-wres]`).count()) === 1);
    const before = await held(p); const nb = p.locator(`${WA1} [data-wrel]`); await nb.scrollIntoViewIfNeeded(); await tap(nb); await sleep(200);
    ok(`${tag}: releasing next week leaves this week alone`, JSON.stringify(await held(p)) === JSON.stringify(before));
    await p.close(); }
  // keyboard
  { const p = await open(ctx, "", errs); await setState(p, "S.meals.forEach(function (m) { m.held = 1; });"); const bt = p.locator(`${WA0} [data-wrel]`); await bt.focus(); await p.keyboard.press("Enter"); await sleep(200);
    ok(`${tag}: Enter on Release releases`, (await held(p)).every(([id, v]) => !v || id === "mon-shak") || (await held(p)).filter(x => x[0] !== "mon-shak").every(x => !x[1])); await p.close(); }
  // light theme
  { const lc = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: "light" }); const p = await open(lc, "", errs); await setState(p, "S.meals.forEach(function (m) { m.held = 1; });");
    const c = await p.locator(`${WA0} [data-wrel]`).evaluate(e => { const s = getComputedStyle(e); return [s.color, s.borderTopColor]; }); ok(`${tag}: light theme draws Release with visible tokens`, c[0] !== "rgba(0, 0, 0, 0)" && c[1] !== "rgba(0, 0, 0, 0)", c); await lc.close(); }
  // ?ws=bare: no counts on Release
  { const p = await open(ctx, "ws=bare", errs); await setState(p, "S.meals.forEach(function (m) { m.held = 1; });"); ok(`${tag}: ?ws=bare: Release has no count`, (await p.locator(`${WA0} [data-wrel] .ct`).count()) === 0); await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
