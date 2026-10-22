// Check for fragments/add-amount-or-level (Kitchie #1047), headless Chromium, 360 / 390 / 768 / 1280, light and dark.
// Each option: no sideways scroll, every control at least 44px, no page errors; A switches both ways and saves only the side showing;
// C swaps in place and back; B keeps both and says a level beside an exact amount is not read; a picked square can be taken back;
// the readout reaches the options page from its frame. Usage:  python3 -m http.server 8123 &   then   node tools/add-amount-or-level-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/add-amount-or-level/";
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const out = p => p.$eval("#ael-out", e => e.textContent);
for (const w of [360, 390, 768, 1280]) for (const [theme, scheme] of [["kitchie-day", "light"], ["kitchie", "dark"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, colorScheme: scheme }); await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  for (const o of ["a", "a-level", "b", "c", "c-level", "d", "dp"]) {
    const p = await ctx.newPage(), errs = []; p.on("pageerror", e => errs.push(e.message)); await p.goto(BASE + "add.html#" + o); await p.waitForTimeout(250);
    const g = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, small: [...document.querySelectorAll("button,input")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 43.5 && !e.closest(".ef-cl"); }).map(e => e.getAttribute("aria-label") || e.textContent.trim()).slice(0, 4) }));
    ok(g.sw <= g.cw, `${w} ${scheme} #${o}: no sideways scroll`); ok(g.small.length === 0, `${w} ${scheme} #${o}: controls at least 44px high ${g.small.join("|")}`); ok(errs.length === 0, `${w} ${scheme} #${o}: no page errors`); await p.close();
  }
  await ctx.close();
}
const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
const go = async u => { await p.goto("about:blank"); await p.goto(u); await p.waitForTimeout(300); }; // via a blank page: a hash change alone reloads the page by design
// A: switch both ways, only the side showing is saved
await go(BASE + "add.html#a"); await p.fill('[data-in="words"]', "a handful");
ok((await out(p)).includes("a handful (your words)"), "A: the typed words are the quantity");
await p.click('[data-ael="seg"][data-v="level"]'); await p.click('[data-ael="lvl"][data-v="Running low"]');
let t = await out(p);
ok(t.includes("Level: Running low, set by you") && t.includes("Quantity: none") && t.includes("not saved: the quantity you typed") && t.includes("listed as running low, no minimum needed"), "A: Level side saves the level only, says the words were kept, and the list reads it");
ok(await p.$eval("#ael-cue", e => e.textContent.includes("Set by you")), "A: the cue reads Set by you");
await p.click('[data-ael="lvl"][data-v="Running low"]'); ok((await out(p)).includes("Level: none"), "A: tapping the picked square takes it back");
await p.click('[data-ael="seg"][data-v="qty"]'); ok(await p.$eval('[data-in="words"]', e => e.value) === "a handful", "A: the words are still there after flipping back");
// A: structured quantity, minimum, level not read next to an exact amount (B)
await p.click('[data-ael="addunit"]'); await p.click('[data-ael="unit"][data-v="jar"]'); ok(await p.$("#ael-m") !== null, "A: Minimum stock appears once there is a unit");
await p.click('[data-ael="seg"][data-v="level"]'); ok(await p.$("#ael-m") === null, "A: no Minimum stock on the Level side");
await go(BASE + "add.html#b"); await p.click('[data-ael="addunit"]'); await p.click('[data-ael="unit"][data-v="jar"]'); await p.click('[data-ael="lvl"][data-v="Out"]');
ok((await out(p)).includes("the level is not read"), "B: a level beside an exact amount says the list does not read it");
// C: swaps in place and back
await go(BASE + "add.html#c"); await p.click('[data-ael="tolevel"]'); ok(await p.$("#ael-l") !== null && await p.$("#ael-q") === null, "C: Set a level swaps the quantity for the squares");
await p.click('[data-ael="toqty"]'); ok(await p.$("#ael-q") !== null && await p.$("#ael-l") === null, "C: Use a quantity swaps it back");
// D: the setting frame has the two choices; the level frame has no switch
await go(BASE + "add.html#d"); ok(await p.$(".ael-seg") === null && await p.$("#ael-l") !== null, "D: Add draws only the level");
// the options page: the readout arrives from the frame; keyboard on the switch
await p.goto(BASE + "index.html"); await p.waitForTimeout(900);
ok((await p.$$eval(".ael-out", e => e.map(x => x.textContent).filter(Boolean).length)) >= 1, "options page: a frame's readout is drawn under it");
ok(errs.length === 0, "no page errors on the way");
await b.close(); console.log(fails ? fails + " FAILED" : "ALL PASSED"); process.exit(fails ? 1 : 0);
