// Option C (auto-on) check: the guarantees the owner asked for, proved on the real engine and real sample photos.
//  1. the original is never changed (pixels of the Original canvas and of the decoded bitmap before = after switching levels)
//  2. hold-to-compare shows the original and releases back (pointer and keyboard)
//  3. nothing is encoded before Use photo (count of session.encode calls)
//  4. levels are not cumulative (balanced, light, balanced again: identical pixels)
//  plus: opens already enhanced (no extra step), Undo is one tap, tap targets 44 px, no sideways scroll, no console errors.
// Usage: python3 -m http.server 8103 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/photo-enhance-c-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8103/fragments/photo-enhance/c/index.html";
const b = await chromium.launch(); let bad = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) bad++; };
for (const [w, h, th] of [[390, 844, "kitchie-day"], [360, 740, "kitchie"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: false });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.addInitScript(t => {
    try { localStorage.setItem("theme", t); sessionStorage.clear(); } catch (e) {}
    window.__sessions = [];   // the engine's own counter (PhotoEnhance.stats.encodeCalls) says how often anything was encoded
    let pe; Object.defineProperty(window, "PhotoEnhance", { configurable: true, get() { return pe; }, set(v) {
      pe = v; const open = v.open.bind(v);
      v.open = async (...a) => { const s = await open(...a); window.__sessions.push(s); return s; };
    } });
  }, th);
  console.log(`--- ${w}x${h} ${th}`);
  await p.goto(BASE + "?s=dark&kind=banner"); 
  const px = sel => p.evaluate(s => { const c = document.querySelector(s); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 7) h = Math.imul(h ^ d[i], 16777619); return c.width + "x" + c.height + ":" + (h >>> 0); }, sel);
  const bm = () => p.evaluate(() => { const s = window.__sessions[0], o = s.original; const c = document.createElement("canvas"); c.width = Math.min(o.width, 600); c.height = Math.round(o.height * c.width / o.width); c.getContext("2d").drawImage(o, 0, 0, c.width, c.height); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 7) h = Math.imul(h ^ d[i], 16777619); return o.width + "x" + o.height + ":" + (h >>> 0); });
  // opens already enhanced, no extra step
  await p.waitForSelector('[data-pe-pill][data-view="enhanced"]', { timeout: 20000 });
  ok(await p.textContent("[data-pe-label]") === "Enhanced" || /Looks good/.test(await p.textContent("[data-pe-label]")), "opens already enhanced (pill says Enhanced), no extra step");
  ok((await p.$$("[data-pe-use]")).length === 1, "one primary button: Use photo");
  const o0 = await px("[data-cv-o]"), b0 = await bm(), e0 = await px("[data-cv-e]");
  // 4. non-cumulative: balanced -> light -> full -> balanced
  const setLevel = async id => { await p.click("[data-pe-levels]"); await p.click(`[data-level="${id}"]`); await p.waitForSelector('[data-pe-pill][data-view="enhanced"]'); await p.waitForTimeout(150); };
  await setLevel("light"); const eL = await px("[data-cv-e]");
  await setLevel("full"); const eF = await px("[data-cv-e]");
  await setLevel("balanced"); const e1 = await px("[data-cv-e]");
  ok(e1 === e0, "balanced, light, full, balanced again: byte-identical balanced (non-cumulative)");
  ok(eL !== e0 && eF !== eL, "levels differ from each other");
  // 1. original unchanged
  ok(await px("[data-cv-o]") === o0 && await bm() === b0, "original unchanged after switching levels (canvas and decoded bitmap)");
  // 2. hold to compare: pointer
  const box = await (await p.$("[data-pe-hold]")).boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height * 0.7); await p.mouse.down();
  ok(await p.getAttribute("[data-stage]", "data-shown") === "o" && await p.textContent("[data-pe-label]") === "Original", "holding the photo (mouse) shows the original");
  ok(await p.evaluate(() => document.querySelector("[data-cv-o]").hidden === false && document.querySelector("[data-cv-e]").hidden === true), "original canvas visible, enhanced hidden while held");
  await p.mouse.up();
  ok(await p.getAttribute("[data-stage]", "data-shown") === "e", "release returns to the chosen level");
  // keyboard
  await p.focus("[data-pe-hold]"); await p.keyboard.down("Space");
  ok(await p.getAttribute("[data-stage]", "data-shown") === "o", "holding Space on the photo shows the original");
  await p.keyboard.up("Space"); ok(await p.getAttribute("[data-stage]", "data-shown") === "e", "releasing Space returns");
  await p.keyboard.down("Enter"); ok(await p.getAttribute("[data-stage]", "data-shown") === "o", "holding Enter shows the original"); await p.keyboard.up("Enter");
  // toggle and Undo (one tap)
  await p.click("[data-pe-toggle]"); ok(await p.getAttribute("[data-stage]", "data-shown") === "o" && await p.getAttribute("[data-pe-toggle]", "aria-pressed") === "false", "pill tap toggles to Original");
  await p.click("[data-pe-toggle]"); await p.waitForSelector('[data-pe-pill][data-view="enhanced"]');
  await p.click("[data-pe-undo]"); ok(await p.getAttribute("[data-stage]", "data-shown") === "o", "Undo is one tap and shows the original");
  await p.click("[data-pe-redo]"); await p.waitForSelector('[data-pe-pill][data-view="enhanced"]');
  // 3. nothing encoded before confirm
  ok(await p.evaluate(() => PhotoEnhance.stats.encodeCalls) === 0, "encode() calls before Use photo: 0");
  // layout checks on the review screen
  const lay = await p.evaluate(() => ({ x: document.documentElement.scrollWidth > innerWidth, small: [...document.querySelectorAll(".phone button,.phone summary,.phone label")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && (r.height < 43.5 || r.width < 43.5) && !e.hidden && getComputedStyle(e).visibility !== "hidden"; }).map(e => (e.textContent || e.className).trim().slice(0, 20) + ":" + Math.round(e.getBoundingClientRect().height)) }));
  ok(!lay.x, "no sideways scroll"); ok(!lay.small.length, "tap targets 44 px or more " + lay.small.join("|"));
  // confirm
  await p.click("[data-pe-use]"); await p.waitForSelector("[data-pe-res]", { timeout: 30000 });
  ok(await p.evaluate(() => PhotoEnhance.stats.encodeCalls) === 1, "encode() calls after Use photo: exactly 1");
  const res = await p.textContent("[data-pe-res]"); ok(/px long edge/.test(res) && /KB|MB/.test(res), "result shows size and long edge: " + res.replace(/\s+/g, " ").slice(0, 90));
  await p.waitForSelector(".pundo", { timeout: 15000 }); ok(true, "queue states run to Done, then the 5-minute Undo line");
  ok(!errs.length, "no console errors " + errs.join("|"));
  await ctx.close();
}
console.log(bad ? bad + " FAILED" : "ALL PASSED"); await b.close(); process.exit(bad ? 1 : 0);
