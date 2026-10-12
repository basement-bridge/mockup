// Desktop check for fragments/item-edit-flyout/pantry.html (headless Chromium): decision 159 (owner, 13 Oct 2026: "in the edit it should replace the simple view otherwise it's duplicate info").
// At every desktop width (1024, 1100, 1239, 1240, 1440, 1920) Edit and History REPLACE the simple view in the item flyout's own lane: the header, tiles, buttons and hint are not shown, one title row and one
// close, the name once (Edit: as the field), no fourth column, nothing tucked under the header; the x or the key again returns to the simple view of the same item and focus returns to the pencil or clock.
// Usage:  python3 -m http.server 8123 &   then   node tools/item-edit-replaces-check.mjs [--shots=docs/screenshots]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/item-edit-flyout/pantry.html";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
for (const w of [1024, 1100, 1239, 1240, 1440, 1920]) for (const kind of ["edit", "history"]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } }), p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(BASE + "?sel=butter"); await p.waitForTimeout(500);
  const vis = sel => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== "hidden" && c.display !== "none"; }).length, sel);
  await p.keyboard.press(kind === "edit" ? "e" : ","); await p.waitForTimeout(700);
  const at = `${w} ${kind}`;
  ok(await vis("#ief-head, #ief-tiles, #ief-acts, #ief-hintw") === 0, `${at}: the simple header, tiles, buttons and hint are not shown`);
  ok(await vis("#ief-child .chd h2") === 1 && await vis("#ief-child .x") === 1 && await vis("#ief-panel .x") === 0, `${at}: one title row and one close`);
  const g = await p.evaluate(() => { const a = document.getElementById("ief-panel").getBoundingClientRect(), c = document.getElementById("ief-child").getBoundingClientRect(); return { dx: Math.abs(a.left - c.left), dw: Math.abs(a.width - c.width), top: c.top, cols: getComputedStyle(document.getElementById("ief-app")).gridTemplateColumns.split(" ").length }; });
  ok(g.dx < 2 && g.dw < 2 && g.top < 2 && g.cols === 3, `${at}: it sits in the item flyout's own lane from the top, no fourth column (${JSON.stringify(g)})`);
  const n = await p.evaluate(() => { const shown = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; }; const c = document.getElementById("ief-child"); return [...c.querySelectorAll("input")].filter(i => shown(i) && i.value === "butter").length + [...c.querySelectorAll("*")].filter(e => !e.children.length && shown(e) && /^butter( only)?$/.test(e.textContent.trim())).length; });
  ok(n === 1, `${at}: the name appears once (${n})`);
  if (shots && [1100, 1440].includes(w)) await p.screenshot({ path: `${shots}/item-edit-flyout-${w}-${kind}-replaces.png` });
  await p.keyboard.press("Control+Escape").catch(() => {}); 
  if (await vis("#ief-child") === 1) await p.evaluate(() => document.querySelector("#ief-child .x").click());
  await p.waitForTimeout(300);
  ok(await vis("#ief-child") === 0 && await vis("#ief-head") === 1 && await vis("#ief-tiles") === 1, `${at}: closing returns to the simple view`);
  ok(await p.evaluate(k => { const a = document.activeElement; return !!a && a.getAttribute("data-ief") === k; }, kind), `${at}: focus returns to the ${kind === "edit" ? "pencil" : "clock"}`);
  ok(errs.length === 0, `${at}: no page errors`); await ctx.close();
}
await b.close();
console.log(fails ? fails + " FAILED" : "ALL PASSED"); process.exit(fails ? 1 : 0);
