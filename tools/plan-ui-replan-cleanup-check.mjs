// Behaviour check for the Plan UI phone mockup: Replan cleans the shopping list, a hold never blocks and Replan releases it, one detail order, less red
// (owner, 14 Oct 2026, decisions 276 to 281), headless Chromium, touch at 390 and 360, mouse at 1280, light and dark.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-replan-cleanup-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + "?jig=0" + (q ? "&" + q : "")); await sleep(500); return p; }
for (const [w, h, touch, scheme] of [[390, 844, true, "light"], [360, 740, true, "dark"], [1280, 900, false, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme }); const errs = []; const tag = `${touch ? "touch" : "mouse"} ${w} ${scheme}`;
  const NOTE = p => p.locator(".unote span").first().innerText().catch(() => "");
  const act = async (p, a, id) => { await p.evaluate(([a, id]) => window.__plan.act(a, id), [a, id]); await sleep(250); };
  const undo = async p => { await p.keyboard.press("z"); await sleep(250); };
  { const p = await open(ctx, "", errs);
    const L = () => p.evaluate(() => [...document.querySelectorAll(".asheet .shl:not(.bought) li[data-line]")].map(e => e.dataset.line + ":" + e.querySelector(".ln i")?.textContent).join("|"));
    const openShop = async () => { await p.locator("[data-shop]").click(); await sleep(250); };
    const closeShop = async () => { await p.keyboard.press("Escape"); await sleep(200); };
    ok(`${tag}: the nav Shopping button opens the list stand-in, badge 3 (curry roux, lemon, milk)`, (await p.locator(".nv .nb").innerText()) === "3");
    await openShop();
    ok(`${tag}: sample lines are curry roux 1 block, lemon 3 (Salmon patties 2 + Tuna salad 1) and milk`, (await L()) === "curry roux:1 block|lemon:3|milk:2 L", await L());
    ok(`${tag}: chicken thighs sit in Bought, in Pantry`, (await p.locator(".asheet .shl.bought li").count()) === 1 && /chicken thighs/.test(await p.locator(".asheet .shl.bought").innerText()));
    await closeShop();
    // shared line: reduce
    await act(p, "replan", "thu-tuna");
    ok(`${tag}: replan Tuna salad reduces lemon 3 down to 2`, /lemon 3 down to 2/.test(await NOTE(p)) && !/taken off/.test(await NOTE(p)), await NOTE(p));
    await openShop(); ok(`${tag}: the list now has lemon 2`, (await L()) === "curry roux:1 block|lemon:2|milk:2 L", await L()); await closeShop();
    await undo(p);
    await act(p, "replan", "thu-salmon");
    ok(`${tag}: replan Salmon patties takes only its own 2 lemons off (3 down to 1)`, /lemon 3 down to 1/.test(await NOTE(p)), await NOTE(p));
    await act(p, "replan", "thu-tuna");
    ok(`${tag}: replanning the last meal that needs lemon takes the line off`, /lemon 1 taken off, nothing else needs it/.test(await NOTE(p)), await NOTE(p));
    await openShop(); ok(`${tag}: lemon is gone, milk (added by hand) is untouched`, (await L()) === "curry roux:1 block|milk:2 L", await L()); await closeShop();
    await undo(p); await undo(p);
    await openShop(); ok(`${tag}: two undos restore every line`, (await L()) === "curry roux:1 block|lemon:3|milk:2 L", await L()); await closeShop();
    // single-use line removed, bought item untouched
    await act(p, "replan", "wed-curry");
    const n = await NOTE(p);
    ok(`${tag}: replan the curry takes curry roux off and leaves the bought chicken thighs alone`, /curry roux 1 block taken off, nothing else needs it/.test(n) && /Already bought, left alone: chicken thighs/.test(n), n);
    await openShop(); ok(`${tag}: thighs are still bought and unchanged`, (await p.locator(".asheet .shl.bought li").count()) === 1 && /600 g/.test(await p.locator(".asheet .shl.bought").innerText())); await closeShop();
    ok(`${tag}: the badge reads 2 after the curry's line went`, (await p.locator(".nv .nb").innerText()) === "2");
    await undo(p);
    // Bought moves lemon into Pantry, tiles go green, replan leaves it
    await openShop(); await p.locator('.asheet [data-buy="lemon"]').click(); await sleep(300);
    ok(`${tag}: Bought takes lemon off the list and into Pantry`, /lemon/.test(await p.locator(".asheet .shl.bought").innerText()) && !/lemon:/.test(await L()), await L());
    await closeShop(); await act(p, "replan", "thu-tuna");
    ok(`${tag}: replan after lemon was bought does not touch the list`, !/Shopping list:/.test(await NOTE(p)) && /left alone: lemon/.test(await NOTE(p)), await NOTE(p));
    ok(`${tag}: no console errors`, errs.length === 0, errs.slice(0, 3));
    await p.close(); }
  // hold: never blocks, Replan releases it entirely
  { const p = await open(ctx, "", errs);
    await p.evaluate(() => { const S = window.__plan.S; S.meals.find(m => m.id === "thu-salmon").held = 1; S.meals.find(m => m.id === "thu-tuna").held = 0; window.__plan.render(); });
    await p.evaluate(() => window.__plan.act("hold", "thu-tuna")); await sleep(200);
    ok(`${tag}: holding a meal never blocks (Salmon patties and Tuna salad both hold the same kind of ingredient)`, (await p.evaluate(() => window.__plan.S.meals.filter(m => m.held && (m.id === "thu-salmon" || m.id === "thu-tuna")).length)) === 2);
    await act(p, "replan", "thu-salmon");
    ok(`${tag}: replan a held meal: the hold goes and the note names what was released`, /Hold released: salmon, eggs, breadcrumbs/.test(await NOTE(p)) && (await p.evaluate(() => window.__plan.S.meals.some(m => m.id === "thu-salmon"))) === false, await NOTE(p));
    ok(`${tag}: the other meal keeps its own hold`, (await p.evaluate(() => window.__plan.S.meals.find(m => m.id === "thu-tuna").held)) === 1);
    await p.close(); }
  // one order in the detail, and the hold hint
  { const p = await open(ctx, "sel=wed-curry", errs);
    await p.evaluate(() => { window.__plan.S.meals.find(m => m.id === "wed-curry").held = 1; window.__plan.render(); }); await sleep(200);
    const order = await p.evaluate(() => { const els = [".dkh", ".dpiece .pw-stack .mc", ".sbody .srcl", ".sbody .tt", ".sbody .nt", ".sbody .ppl", ".sbody .ing", ".sbody .holdhint", ".sfoot"].map(s => document.querySelector(s)); return els.map((e, i) => !e ? "missing " + i : i === 0 ? "ok" : (els[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) ? "ok" : "before " + i); });
    ok(`${tag}: detail order is who and when, tile and status, source, total time, note, people, one list, hold hint, footer`, order.every(x => x === "ok"), order);
    await p.close(); }
  // reds
  { const p = await open(ctx, "", errs);
    const dg = await p.evaluate(() => { const t = document.createElement("i"); t.style.color = "var(--danger)"; document.body.appendChild(t); const c = getComputedStyle(t).color; t.remove(); return c; });
    const bg = sel => p.evaluate(sel => { const t = document.createElement("div"); t.innerHTML = '<div class="sw l"><div class="und"><span class="l"></span><span class="r"></span></div></div>'; document.body.appendChild(t); const c = getComputedStyle(t.querySelector(sel)).backgroundColor; t.remove(); return c; }, sel);
    ok(`${tag}: the Replan swipe reveal is not red`, (await bg(".und .r")) !== dg, await bg(".und .r"));
    ok(`${tag}: the Not cooking swipe reveal is not red`, (await bg(".und .l")) !== dg);
    await p.evaluate(() => window.__plan.openDetail("wed-curry")); await sleep(300);
    ok(`${tag}: the missing name is red and the use-by text is not`, await p.evaluate(dg => { const m = document.querySelector(".ing.one li.m.red .in"), u = document.querySelector(".ubt"); return !!m && getComputedStyle(m).color === dg && (!u || getComputedStyle(u).color !== dg); }, dg));
    await p.close(); }
  await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} FAILED of ${total}` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
