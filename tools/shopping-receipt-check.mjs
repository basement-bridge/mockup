// Shopping receipt mockup check (Kitchie #797): options A, B, C and the notes page at 390, 768 and 1280, light (kitchie-day) and dark (kitchie).
// Reports console errors, sideways scroll and tap targets under 44px, then drives each option by clicking (answer every question, add, undo)
// and checks the rule itself: a row already in the Pantry is not added again unless the person says so.
// Usage: python3 -m http.server 8123 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/shopping-receipt-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/shopping-receipt/";
const steps = ["", "pre=resolved", "step=done", "step=done&pre=resolved", "open=agree,pantry"];
const sizes = [[390, 844], [768, 1024], [1280, 800]];
const b = await chromium.launch(); let bad = 0, n = 0;
const probe = () => {
  const small = [...document.querySelectorAll("button,[role=tab],summary,input,select,a.btn")].filter(e => {
    const r = e.getBoundingClientRect();
    return r.width && r.height && e.offsetParent && (r.height < 43.5 || r.width < 43.5) && !e.closest(".dvp") && !e.classList.contains("dvh") && getComputedStyle(e).visibility !== "hidden";
  }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
  return { x: document.documentElement.scrollWidth > innerWidth + 1, small: small.slice(0, 4) };
};
const pages = [];
for (const o of "abc") for (const q of steps) pages.push([o + ".html", q]);
pages.push(["index.html", ""]);
for (const [w, h] of sizes) for (const th of ["kitchie", "kitchie-day"]) for (const [f, q] of pages) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(`${BASE}${f}${q ? "?" + q : ""}`); await p.waitForTimeout(f === "index.html" ? 700 : 200); n++;
  const r = await p.evaluate(probe);
  if (errs.length || r.x || r.small.length) { bad++; console.log(f, w, th, q || "entry", errs.join("|"), r.x ? "SIDEWAYS" : "", r.small.join(" ")); }
  await p.close();
}
// flows
for (const o of "abc") for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [], fail = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}${o}.html`); await p.waitForTimeout(200);
  const clk = async s => { await p.evaluate(sel => document.querySelector(sel)?.click(), s); await p.waitForTimeout(60); };
  const txt = s => p.evaluate(sel => document.querySelector(sel)?.textContent || "", s);
  const dis = () => p.evaluate(() => document.querySelector("[data-act=commit]").disabled);
  // default: the three already-in-Pantry rows are not added again
  if (o === "c") await clk("[data-act=fold][data-v=pantry]");
  const keeps = await p.evaluate(() => [...document.querySelectorAll("[data-k=done] [data-act=mode][aria-pressed=true]")].map(e => e.dataset.v));
  if (keeps.length !== 3 || keeps.some(v => v !== "keep")) fail.push("already rows not default keep: " + keeps);
  // unit-less chicken: must ask for the unit
  if (!(await dis())) fail.push("commit enabled with questions open");
  if (o === "b") { for (const id of ["rice", "chk", "yog"]) await clk(`[data-id=${id}] [data-act=src][data-v=rcpt]`); }
  await clk("[data-id=chk] [data-act=unit][data-v=kg]");
  if (await dis()) fail.push("commit still disabled after all answered");
  // fix the blind swipe amount
  if (o === "c") { /* pantry fold is open */ }
  await clk("[data-id=banana] [data-act=mode][data-v=fix]");
  const bar = await txt(".sr-bar p"); if (!/fixes 1/.test(bar)) fail.push("bar: " + bar);
  await clk("[data-act=commit]");
  const t = await txt(".toast"); if (!/Added/.test(t)) fail.push("toast: " + t);
  const body = await txt(".sr-sumbox"); if (!/1 to 1.204 kg/.test(body) || !/Not added again/.test(body)) fail.push("summary: " + body.slice(0, 80));
  await clk("[data-act=undo]"); const t2 = await txt(".toast"); if (!/Undone/.test(t2)) fail.push("undo: " + t2);
  if (errs.length) fail.push(errs.join("|"));
  if (fail.length) { bad++; console.log("FLOW", o, w, fail.join(" ; ")); } else console.log("flow ok", o, w);
  await p.close();
}
console.log(n + " pages checked, " + bad + " problems"); await b.close();
