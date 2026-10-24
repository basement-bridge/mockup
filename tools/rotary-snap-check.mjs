// Behaviour and layout check for fragments/rotary-snap (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/rotary-snap-check.mjs [--shots=shots/rotary-snap]      (BASE=http://localhost:PORT/fragments/rotary-snap/ to change the address)
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers (390 and 360 wide, light and dark, the phone's own text size and +30%): no console error, no sideways scroll; the rotary shows exactly one theme, centred, the neighbours cut off (no pixel of
// another theme's card inside the strip), and no arrows or dots; a real-touch swipe (CDP touch events) lands on exactly one theme, centred, and re-themes; a tap on the theme you see changes nothing;
// the arrow keys still choose; double tap is not broken by this (resetting is built, checked in the build's tests); the wiggle runs once (left, right, back to centre, no theme change, no scroll, no
// handler), never again after reload, not with reduced motion, not while a text field has focus, and is recorded in localStorage; the text size has the one label and nothing else, no end words,
// seven steps whose target width is bar/7 and measured (>=44 at 360), 44px tall, the pin on the label's line; no hex colour in the CSS apart from the theme-card data in the JS.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/rotary-snap/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function open({ scheme = "light", w = 390, h = 820, ts = 0, hint = "seen", reduced = false, touch = true, theme } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: reduced ? "reduce" : "no-preference", hasTouch: touch, isMobile: touch });
  if (theme) await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await c.newPage(); p.errs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  await p.goto(`${BASE}index.html?bare=1&w=${w}&ts=${ts}${hint ? "&hint=" + hint : ""}`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(250);
  return p;
}
const bgOf = p => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
const rotState = p => p.evaluate(() => {
  const rot = document.querySelector("#live [data-rot]"), r = rot.getBoundingClientRect();
  const its = [...rot.querySelectorAll(".rot-i")].map(e => { const a = e.getBoundingClientRect(); return { id: e.dataset.theme, l: a.left, r: a.right, w: a.width, on: e.getAttribute("aria-checked") === "true" }; });
  const vis = its.filter(i => i.r > r.left + 0.5 && i.l < r.right - 0.5);
  const cur = its.find(i => i.on);
  return { strip: { l: r.left, r: r.right, w: r.width }, items: its.length, vis: vis.map(v => v.id), cur: cur && cur.id, off: cur ? Math.abs((cur.l + cur.r) / 2 - (r.left + r.right) / 2) : 99, checked: its.filter(i => i.on).length, itemW: its[0].w };
});
// A finger: touch events from the right part of the strip, moving left by `frac` of the strip's width in 12 steps (a drag past the middle, or a fast flick with `fast`).
async function swipe(p, frac, fast = false) {
  const cdp = await p.context().newCDPSession(p);
  const box = await p.locator("#live [data-rot]").boundingBox(); const y = box.y + box.height / 2, x0 = box.x + box.width - 12, dx = frac * box.width;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
  for (let k = 1; k <= 12; k++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: Math.max(1, x0 - k * (dx / 12)), y }] }); if (!fast) await p.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

for (const [scheme, theme] of [["light", "kitchie-day"], ["dark", "kitchie"]]) {
  for (const w of [390, 360]) {
    for (const ts of [0, 3]) {
      const p = await open({ scheme, w, ts, theme });
      const tag = `${scheme} ${w} ts${ts}`;
      ok(p.errs.length === 0, `${tag}: no console errors ${p.errs.join(";")}`);
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${tag}: no sideways scroll`);
      const s = await rotState(p);
      ok(s.items === 9 && s.checked === 1 && s.vis.length === 1 && s.off < 1.5, `${tag}: exactly one theme in the strip, centred (visible ${s.vis.join()}, off ${s.off.toFixed(2)}px)`);
      ok(Math.abs(s.itemW - s.strip.w) < 1, `${tag}: a theme is as wide as the strip (${s.itemW.toFixed(1)} of ${s.strip.w.toFixed(1)})`);
      ok(await p.evaluate(() => { const rot = document.querySelector("#live [data-rot]"); return !rot.querySelector("[class*=dot],[class*=arrow],[class*=chev]") && [...rot.querySelectorAll(".rot-i")].every(i => !getComputedStyle(i, "::after").content.match(/[‹›<>]/)); }), `${tag}: no arrows, no dots`);
      const small = await p.evaluate(() => [...document.querySelectorAll("#live button, #live [role=slider], #live [role=radio]")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 43.5 || r.height < 43.5); }).map(e => e.getAttribute("aria-label") || e.className));
      ok(small.length === 0, `${tag}: every control is at least 44px by 44px ${small.join(",")}`);
      // text size
      const t = await p.evaluate(() => {
        const q = document.querySelector("#live .qc[data-q=text]"), bar = q.querySelector(".tsz-bar").getBoundingClientRect(), segs = [...q.querySelectorAll(".tsz-seg")].map(e => e.getBoundingClientRect()), pin = q.querySelector(".qc-pin").getBoundingClientRect(), nm = q.querySelector(".tsz-name").getBoundingClientRect();
        const words = [...q.querySelectorAll("*")].filter(e => e.children.length === 0 && e.offsetParent !== null && getComputedStyle(e).visibility !== "hidden" && e.textContent.trim()).map(e => e.textContent.trim());
        return { name: q.querySelector(".tsz-name").textContent, words, n: segs.length, w: segs.map(s => +s.width.toFixed(2)), h: segs[0].height, bar: { w: +bar.width.toFixed(1), x: bar.left }, tile: q.getBoundingClientRect().width, pinMid: pin.top + pin.height / 2, nameMid: nm.top + nm.height / 2, pinTop: pin.top, barTop: bar.top, pinBottom: pin.bottom, val: getComputedStyle(q.querySelector(".tsz-val")).display };
      });
      ok(t.name === "Text size" && t.words.join("|") === "Text size", `${tag}: one label and no other word on the control (${t.words.join("|")})`);
      ok(t.val === "none", `${tag}: the value line and the end words are not drawn`);
      ok(t.n === 7 && Math.max(...t.w) - Math.min(...t.w) < 0.1 && t.h >= 43.9, `${tag}: seven equal steps, 44px tall (${t.w[0]}px wide)`);
      ok(w === 360 ? t.w[0] >= 43.9 : t.w[0] >= 48, `${tag}: a step is ${t.w[0]}px wide as a target (360: at least 44, 390: at least 48)`);
      ok(Math.abs(t.pinMid - t.nameMid) < 3 && t.pinBottom <= t.barTop + 0.5, `${tag}: the pin is on the label's line, above the bar, not beside it`);
      if (w === 360 && ts === 0) console.log(`INFO 360 step target ${t.w[0]}px, drawn ${(t.w[0] - 2).toFixed(1)}px, bar ${t.bar.w}px`);
      if (w === 390 && ts === 0) console.log(`INFO 390 step target ${t.w[0]}px, drawn ${(t.w[0] - 2).toFixed(1)}px, bar ${t.bar.w}px`);
      if (shots) await p.screenshot({ path: `${shots}/${scheme}-${w}-ts${ts}.png`, fullPage: true });
      await p.context().close();
    }
  }
}

// swipe: a finger lands on exactly one theme, centred; the page re-themes; a tap on the visible theme does nothing
{
  const p = await open({ scheme: "light", w: 390, theme: "kitchie-day" });
  const bg0 = await bgOf(p);
  await p.locator("#live .rot-i[aria-checked=true]").tap();
  await p.waitForTimeout(500);
  let s = await rotState(p);
  ok(s.cur === "auto" && (await bgOf(p)) === bg0 && s.off < 1.5, "tap on the visible theme: nothing changes (still the first theme, same page colour, still centred)");
  await swipe(p, 0.7);                                   // a drag past the middle: moves on by exactly one
  await p.waitForFunction(() => document.querySelector('#live .rot-i[aria-checked=true]').dataset.theme !== "auto", null, { timeout: 4000 });
  await p.waitForTimeout(600);
  s = await rotState(p);
  ok(s.cur === "marmalade" && s.vis.length === 1 && s.off < 1.5, `a finger swipe lands on exactly one theme, centred (${s.cur}, visible ${s.vis.join()}, off ${s.off.toFixed(2)}px)`);
  ok((await bgOf(p)) !== bg0, "the page re-themed under the swipe");
  await swipe(p, 1.3, true);                              // a hard fast fling still moves by one stop (scroll-snap-stop: always), never between two
  await p.waitForTimeout(900);
  s = await rotState(p);
  ok(s.vis.length === 1 && s.off < 1.5 && s.checked === 1, `after a hard fling: still exactly one theme, centred (${s.cur})`);
  await p.focus("#live .rot-i[aria-checked=true]"); const before = s.cur; await p.keyboard.press("ArrowRight"); await p.waitForTimeout(700);
  s = await rotState(p);
  ok(s.cur !== before && s.vis.length === 1 && s.off < 1.5, `the arrow keys still choose one theme (${before} to ${s.cur}), centred`);
  await p.context().close();
}

// the wiggle
{
  const p = await open({ scheme: "light", w: 390, hint: "fresh", theme: "kitchie-day" });
  const samples = [], t0 = Date.now(); let scrolls = 0, applied = 0;
  await p.evaluate(() => { window.__sc = 0; document.querySelector("#live [data-rot]").addEventListener("scroll", () => window.__sc++); });
  while (Date.now() - t0 < 3200) {
    samples.push(await p.evaluate(() => { const it = document.querySelector("#live .rot-i[aria-checked=true]"), rot = it.closest("[data-rot]"); return { x: +(it.getBoundingClientRect().left - rot.getBoundingClientRect().left).toFixed(1), th: it.dataset.theme }; }));
    await p.waitForTimeout(40);
  }
  const xs = samples.map(s => s.x), min = Math.min(...xs), max = Math.max(...xs);
  const iMin = xs.indexOf(min), iMax = xs.indexOf(max);
  ok(min < -6 && min >= -14 && max > 6 && max <= 14, `the wiggle eases a few pixels left (${min}px) and right (${max}px)`);
  ok(iMin < iMax && Math.abs(xs[xs.length - 1]) < 0.6, "left first, then right, then settles centred (ends at " + xs[xs.length - 1] + "px)");
  ok(samples.every(s => s.th === "auto"), "the theme never changed during the wiggle");
  const sc = await p.evaluate(() => window.__sc), runs = await p.evaluate(() => window.RS.live.hintRuns);
  ok(sc === 0, `no scroll event fired (${sc})`);
  ok(runs === 1, `it ran once (${runs})`);
  ok((await p.evaluate(() => localStorage.getItem("kitchie.rotary.hint"))) === "1", "it is remembered on this device (kitchie.rotary.hint)");
  if (shots) { /* frames are in the page; one shot of the settled state */ await p.screenshot({ path: `${shots}/final-state-390.png`, clip: { x: 0, y: 0, width: 390, height: 360 } }); }
  await p.goto(`${BASE}index.html?bare=1&w=390`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(2200);
  ok((await p.evaluate(() => window.RS.live.hintRuns)) === 0, "after a reload it does not play again");
  await p.context().close();
}
{
  const p = await open({ scheme: "light", w: 390, hint: "fresh", reduced: true, theme: "kitchie-day" });
  await p.waitForTimeout(2200);
  ok((await p.evaluate(() => window.RS.live.hintRuns)) === 0, "reduced motion: no wiggle");
  await p.context().close();
}
{
  const p = await open({ scheme: "light", w: 390, hint: "fresh", theme: "kitchie-day" });
  await p.evaluate(() => { const i = document.createElement("input"); i.id = "srch"; document.body.prepend(i); i.focus(); });
  await p.waitForTimeout(2200);
  ok((await p.evaluate(() => window.RS.live.hintRuns)) === 0, "search focused: no wiggle");
  await p.evaluate(() => document.getElementById("srch").blur()); await p.waitForTimeout(2200);
  ok((await p.evaluate(() => window.RS.live.hintRuns)) === 1, "it plays once the search has let go");
  await p.context().close();
}
{
  const p = await open({ scheme: "light", w: 390, hint: "fresh", theme: "kitchie-day" });
  await swipe(p, 0.7); await p.waitForTimeout(3000);
  ok((await p.evaluate(() => window.RS.live.hintRuns)) === 0 && (await p.evaluate(() => localStorage.getItem("kitchie.rotary.hint"))) === "1", "swiping before it plays: it never plays (and is remembered as seen)");
  await p.context().close();
}

// the page and its CSS
const css = readFileSync(new URL("../fragments/rotary-snap/rotary-snap.css", import.meta.url), "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in the CSS (theme tokens only)");
ok(/scroll-snap-type:x mandatory/.test(css) && /scroll-snap-stop:always/.test(css) && /flex:0 0 100%/.test(css), "the CSS has mandatory snap, one stop per swipe and one theme per row");
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exit(fails ? 1 : 0);
