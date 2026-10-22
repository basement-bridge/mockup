// Behaviour and layout check for fragments/mobile-home-view-switch (headless Chromium, phone width 390x844). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/mobile-home-view-switch-check.mjs [--shots=shots/mobile-home-view-switch]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: every option draws in both themes with no console error and no sideways scroll; each switch works and shows its state by shape (not colour alone) with an accessible name and aria-pressed;
// the choice is remembered in localStorage and survives a reload; storage blocked or throwing falls back to the full view with no hint and no error; the hint shows once; bad stored values are ignored;
// B drag up, drag down, tap and keyboard; C hold, pinch in and out, keyboard; D lens does not break the field; E learns after three visits and the heading overrides; reduced motion turns every animation off;
// 44px targets; phone-width only files; no hex colour in home-view.css.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/mobile-home-view-switch/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const OPTS = ["A", "B", "C", "D", "E"], FR = ["first", "settled", "live"];
async function open(o, { theme = "kitchie", ctx = null, reduce = false, init = null } = {}) {
  const c = ctx || await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduce ? "reduce" : "no-preference" });
  if (!ctx) await c.addInitScript(t => { if (!sessionStorage.getItem("__init")) { localStorage.setItem("theme", t); sessionStorage.setItem("__init", "1"); } }, theme);
  if (init) await c.addInitScript(init);
  const p = await c.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  await p.goto(BASE + "?o=" + o); await p.waitForSelector(`body[data-ready=${o}]`, { state: "attached" }); await p.waitForTimeout(250); return p;
}
const live = p => p.locator(".fr[data-frame=live]");
const view = (p, f = "live") => p.locator(`.fr[data-frame=${f}] .home`).getAttribute("data-view");
const stored = (p, o) => p.evaluate(o => localStorage.getItem(`mock.homeView.${o}.live.sam`), o);
const hintFlag = (p, o) => p.evaluate(o => localStorage.getItem(`mock.homeView.${o}.live.hint.sam`), o);
const reload = async p => { await live(p).locator("[data-p=reload]").click(); await p.waitForTimeout(150); };
const hintShown = p => live(p).locator(".hv-hint:not([hidden])").count();

/* 1. every option, frame, theme: draws, no errors, no sideways scroll; screenshots at three scroll points */
for (const theme of ["kitchie", "kitchie-day"]) for (const o of OPTS) {
  const p = await open(o, { theme });
  ok(await p.locator(".fr").count() === 3, `${theme} ${o}: three phone frames (first visit, settled compact, live)`);
  ok(p.errs.length === 0, `${theme} ${o}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} ${o}: no sideways page scroll at 390`);
  ok(await view(p, "first") === "full" && await view(p, "settled") === "compact", `${theme} ${o}: the first-visit frame is full and the settled frame is compact`);
  ok(await p.locator(".fr[data-frame=first] .hv-hint:not([hidden])").count() === (o === "E" ? 0 : 1), `${theme} ${o}: the first-visit frame shows one hint` + (o === "E" ? " (none: E teaches only when Home first changes itself)" : ""));
  ok(await p.locator(".fr[data-frame=settled] .hv-hint:not([hidden])").count() === (o === "E" ? 1 : 0), `${theme} ${o}: the settled frame shows ` + (o === "E" ? "the one learned-change note" : "no hint"));
  if (shots) for (const f of FR) {
    const fr = p.locator(`.fr[data-frame=${f}] .pf`);
    for (const [n, y] of [["top", 0], ["mid", 330], ["end", 99999]]) { await p.locator(`.fr[data-frame=${f}] .pbody`).evaluate((e, y) => { e.scrollTop = y; }, y); await p.waitForTimeout(60); await fr.screenshot({ path: `${shots}/${o}-${f}-${n}-${theme}.png` }); }
    await p.locator(`.fr[data-frame=${f}] .pbody`).evaluate(e => { e.scrollTop = 0; });
  }
  if (shots) { await p.locator("#opt").scrollIntoViewIfNeeded(); await p.screenshot({ path: `${shots}/${o}-page-${theme}.png` }); }
  await p.context().close();
}

/* 2. the icon switch (A), as the model for persistence */
let p = await open("A");
let ctl = live(p).locator(".hv-ctl");
ok(await ctl.getAttribute("aria-label") === "Just tonight’s answer" && await ctl.getAttribute("aria-pressed") === "false", "A: the icon button has an accessible name and aria-pressed=false in the full view");
const box = await ctl.boundingBox(); ok(box.width >= 44 && box.height >= 44, `A: the icon button is a 44px target (${box.width}x${box.height})`);
ok(await view(p) === "full" && await stored(p, "A") === null, "A: opens full and stores nothing until the person chooses");
const glyph = () => ctl.evaluate(e => [getComputedStyle(e.querySelector(".g1")).display, getComputedStyle(e.querySelector(".g2")).display].join("/"));
ok(await glyph() === "block/none", "A: full shows the rows glyph");
await ctl.click(); ok(await view(p) === "compact" && await ctl.getAttribute("aria-pressed") === "true", "A: a tap flips to compact and sets aria-pressed=true");
ok(await glyph() === "none/block", "A: compact shows a different glyph (state is shape, not colour alone)");
ok((await ctl.evaluate(e => getComputedStyle(e).borderTopStyle + getComputedStyle(e).borderTopWidth)) === "solid1px", "A: pressed also draws a ring");
ok(/just tonight/i.test(await live(p).locator(".hv-live").first().textContent()), "A: a polite live region says what changed");
ok(await stored(p, "A") === "compact", "A: the choice is written to localStorage (client-side, nothing sent anywhere)");
ok(await live(p).locator(".home").evaluate(h => h.querySelector(".tilec") && getComputedStyle(h.querySelector(".tilec")).display === "none"), "A: compact hides the tiles");
await reload(p); ok(await view(p) === "compact", "A: survives a reload of the frame (re-mounted from storage)");
await p.reload(); await p.waitForSelector("body[data-ready=A]", { state: "attached" }); ok(await view(p) === "compact", "A: survives a full page reload");
const reqs = []; p.on("request", r => { if (!r.url().startsWith(BASE) && !r.url().includes("localhost")) reqs.push(r.url()); });
await live(p).locator(".hv-ctl").click(); ok(await view(p) === "full" && await stored(p, "A") === "full", "A: flips back and stores full");
ok(reqs.length === 0, "A: switching makes no network request");
await p.evaluate(() => localStorage.setItem("mock.homeView.A.live.sam", "garbage")); await reload(p);
ok(await view(p) === "full", "A: a bad stored value is ignored (default view)");
await live(p).locator("[data-p=clear]").click(); ok(await stored(p, "A") === null && await hintFlag(p, "A") === null, "A: Forget my choice clears the value and the hint flag");
await p.context().close();

/* 3. the hint is shown once, and never when nothing can remember it */
p = await open("A");
ok(await hintShown(p) === 1 && await hintFlag(p, "A") === "1", "A: first visit in the live frame shows one hint and marks it shown at once");
ok(/Tap for just tonight/.test(await live(p).locator(".hv-hint").textContent()), "A: the hint text names the one thing to do");
await reload(p); ok(await hintShown(p) === 0, "A: after a reload the hint does not return");
await live(p).locator("[data-p=clear]").click(); await p.waitForTimeout(200); ok(await hintShown(p) === 1, "A: it can only return when the stored flag is gone");
await p.waitForTimeout(5300); ok(await hintShown(p) === 0, "A: the hint goes by itself after five seconds");
await p.context().close();
p = await open("A"); await live(p).locator("[data-p=clear]").click();
await live(p).locator("[data-p=block]").check(); await reload(p);
ok(await view(p) === "full" && await hintShown(p) === 0, "A, storage blocked: opens in the default (full) view and shows no hint");
await live(p).locator(".hv-ctl").click(); ok(await view(p) === "compact" && p.errs.length === 0, "A, storage blocked: the switch still works for this visit and nothing throws");
ok(await stored(p, "A") === null, "A, storage blocked: nothing is written");
await reload(p); ok(await view(p) === "full", "A, storage blocked: the next load is the default again");
await p.context().close();
p = await open("A", { init: () => { Storage.prototype.setItem = function (k) { if (k !== "theme") throw new Error("quota"); }; Storage.prototype.getItem = function (k) { if (k !== "theme") throw new Error("denied"); return null; }; } });
await live(p).locator(".hv-ctl").click(); ok(await view(p) === "compact" && p.errs.filter(e => !/quota|denied/.test(e)).length === 0 && !p.errs.some(e => /Uncaught/.test(e)), "A, getItem and setItem throwing: no uncaught error, the switch works in memory");
await p.context().close();

/* 4. B: the handle */
p = await open("B");
const h = live(p).locator(".hv-handle"); await h.scrollIntoViewIfNeeded(); const hb = await h.boundingBox();
ok(hb.height >= 44 && hb.width >= 44, `B: the handle is a 44px target (${Math.round(hb.width)}x${Math.round(hb.height)})`);
ok(await h.getAttribute("aria-label") === "Just tonight’s answer" && await h.getAttribute("aria-pressed") === "false", "B: the handle has an accessible name and aria-pressed");
const drag = async dy => { const bb = await h.boundingBox(), x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x, y + dy / 2, { steps: 3 }); await p.mouse.move(x, y + dy, { steps: 3 }); await p.mouse.up(); await p.waitForTimeout(80); };
await drag(-50); ok(await view(p) === "compact" && await stored(p, "B") === "compact", "B: dragging up folds Home to the answer and remembers it");
await drag(-50); ok(await view(p) === "compact", "B: dragging up again in compact does nothing");
await drag(50); ok(await view(p) === "full", "B: dragging down opens everything");
await drag(10); ok(await view(p) === "full", "B: a short drag under 32px does nothing");
await h.click(); ok(await view(p) === "compact", "B: a plain tap folds it");
await h.click(); ok(await view(p) === "full", "B: and a tap opens it");
await h.focus(); await p.keyboard.press("Enter"); ok(await view(p) === "compact", "B: Enter on the focused handle toggles (no gesture needed)");
await p.keyboard.press("Space"); ok(await view(p) === "full", "B: Space toggles too");
ok(await h.evaluate(e => [getComputedStyle(e.querySelector(".up")).display, getComputedStyle(e.querySelector(".dn")).display].join("/")) === "block/none", "B: full shows the up chevron");
await h.click(); ok(await h.evaluate(e => [getComputedStyle(e.querySelector(".up")).display, getComputedStyle(e.querySelector(".dn")).display, e.querySelector("i").getBoundingClientRect().width].join("/")) === "none/block/56", "B: compact shows the down chevron and a longer pill (shape, not colour)");
{ const relOf = async () => { const hy = await h.boundingBox(), pfb = await live(p).locator(".pf").boundingBox(); return [(hy.y - pfb.y) / pfb.height, hy.y + hy.height < pfb.y + pfb.height - 68]; };
  const [rc, c2] = await relOf(); ok(rc > 0.8 && c2, `B, compact: the handle sits at the bottom, thumb height (${Math.round(rc * 100)}% down), clear of the bottom bar`);
  await h.click(); await live(p).locator(".pbody").evaluate(e => { e.scrollTop = 0; }); const [rf] = await relOf(); ok(rf > 0.55, `B, full: the handle sits in the lower half (${Math.round(rf * 100)}% down) before any scrolling`); await h.click(); }
const gr = (await p.evaluate(() => performance.getEntriesByType("resource").map(r => r.name.split("/").pop()))); ok(gr.includes("gestures.js"), "B: gestures.js is fetched for this option");
await p.context().close();

/* 5. C: pinch and hold */
p = await open("C");
const hb2 = live(p).locator(".hbtn"); await hb2.scrollIntoViewIfNeeded();
ok((await hb2.boundingBox()).height >= 44, "C: the heading target is at least 44px tall");
const hold = async ms => { const bb = await hb2.boundingBox(); await p.mouse.move(bb.x + 30, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(ms); await p.mouse.up(); await p.waitForTimeout(60); };
await hold(150); ok(await view(p) === "full", "C: a short press does nothing");
await hold(600); ok(await view(p) === "compact" && await stored(p, "C") === "compact", "C: press and hold 450 ms toggles and remembers it");
await hold(600); ok(await view(p) === "full", "C: and back");
await hb2.focus(); await p.keyboard.press("Enter"); ok(await view(p) === "compact", "C: Enter on the focused heading toggles (no timing needed)");
await p.keyboard.press("Enter");
const pinch = async (d0, d1) => live(p).locator(".pbody").evaluate((el, [d0, d1]) => {
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + 300, ev = (t, id, x) => el.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: "touch", clientX: x, clientY: cy, bubbles: true }));
  ev("pointerdown", 1, cx - d0 / 2); ev("pointerdown", 2, cx + d0 / 2); ev("pointermove", 1, cx - d1 / 2); ev("pointermove", 2, cx + d1 / 2); ev("pointerup", 1, cx - d1 / 2); ev("pointerup", 2, cx + d1 / 2);
}, [d0, d1]);
await pinch(200, 100); ok(await view(p) === "compact", "C: pinching in folds Home to the answer");
await pinch(100, 200); ok(await view(p) === "full", "C: pinching out opens it");
await pinch(200, 180); ok(await view(p) === "full", "C: a slight pinch does nothing");
ok(await live(p).locator(".pbody").evaluate(e => e.style.touchAction) === "pan-y", "C: the Home scroller is touch-action: pan-y (scroll kept, browser page zoom off there: the cost noted on the page)");
ok(await live(p).locator(".hv-mark").count() === 1, "C: the dot mark is there as a second, non-text state signal");
await p.context().close();

/* 6. D: the lens in the field */
p = await open("D");
const lens = live(p).locator(".hv-ctl"); ok((await lens.boundingBox()).width >= 44 && await lens.getAttribute("aria-label") === "Just tonight’s answer", "D: the lens is a 44px target with an accessible name");
await live(p).locator(".srch input").fill("rice"); ok(await live(p).locator(".srch input").inputValue() === "rice" && await view(p) === "full", "D: typing in the field does not switch the view");
await lens.click(); ok(await view(p) === "compact" && await live(p).locator(".srch input").inputValue() === "rice", "D: the lens switches the view and leaves the query alone");
ok(await live(p).locator(".srch").count() === 1 && await live(p).locator(".home.has-srch").count() === 1, "D: the field is in both views");
ok(await lens.evaluate(e => [getComputedStyle(e.querySelector(".g1")).display, getComputedStyle(e.querySelector(".g2")).display].join("/")) === "none/block", "D: compact shows the ring with a dot (shape, not colour)");
await reload(p); ok(await view(p) === "compact", "D: remembered");
const sh = await live(p).locator(".srch").boundingBox(); ok(sh.height >= 44 && sh.height <= 54, `D: the field costs about 52px (${Math.round(sh.height)}px) on both views`);
await p.context().close();

/* 7. E: Home learns */
p = await open("E");
const H = live(p).locator(".hbtn");
ok(await view(p) === "full" && await live(p).locator(".hv-ctl, .hv-handle").count() === 0, "E: no control is drawn; Home opens full");
for (let i = 1; i <= 3; i++) { await live(p).locator("[data-p=answered]").click(); await live(p).locator("[data-p=visit]").click(); await p.waitForTimeout(120); if (i < 3) ok(await view(p) === "full", `E: after ${i} visit(s) on the answer Home still opens full`); }
ok(await view(p) === "compact", "E: after three visits in a row on the answer Home opens compact");
ok(await hintShown(p) === 1 && /just the answer/.test(await live(p).locator(".hv-hint").textContent()), "E: one note explains the change, under the answer");
await reload(p); ok(await hintShown(p) === 0, "E: the note does not repeat");
await H.click(); ok(await view(p) === "full" && await stored(p, "E") === "full", "E: tapping the heading flips it and remembers it");
ok(/"n":0/.test(await p.evaluate(() => localStorage.getItem("mock.homeView.E.live.learn.sam"))), "E: a direct choice resets the learning run");
await live(p).locator("[data-p=answered]").click(); await live(p).locator("[data-p=visit]").click();
await live(p).locator("[data-p=browsed]").click(); await live(p).locator("[data-p=visit]").click();
ok(/"kind":"browse","n":1/.test(await p.evaluate(() => localStorage.getItem("mock.homeView.E.live.learn.sam"))), "E: a different kind of visit restarts the run");
await p.context().close();

/* 8. reduced motion */
p = await open("A", { reduce: true });
ok(await p.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), "reduced motion is on for this run");
ok(await live(p).locator(".hv-ctl").evaluate(e => getComputedStyle(e, "::after").animationName) === "none", "A, reduced motion: no pulsing ring (a still ring)");
await live(p).locator(".hv-ctl").click(); ok(await live(p).locator(".ideas").evaluate(e => getComputedStyle(e).animationName) === "none", "A, reduced motion: the switch has no fade");
ok(await live(p).locator(".hv-hint").evaluate(e => getComputedStyle(e).animationName) === "none", "A, reduced motion: the hint has no fade");
await p.context().close();
p = await open("B", { reduce: true });
ok(await live(p).locator(".hv-handle i").evaluate(e => getComputedStyle(e).animationName) === "none", "B, reduced motion: the handle does not nudge");
{ const hh = live(p).locator(".hv-handle"), bb = await hh.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + 20); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2, bb.y - 10, { steps: 4 });
  ok(await hh.evaluate(e => e.style.transform) === "", "B, reduced motion: the handle does not follow the finger"); await p.mouse.up(); }
await p.context().close();

/* 9. files: phone only, tokens only */
const css = readFileSync(new URL("../fragments/mobile-home-view-switch/home-view.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css), "home-view.css has no hex colour (tokens only)");
ok(!/@media[^{]*(min|max)-width/.test(css), "home-view.css has no width breakpoint (phone only; nothing shared with desktop)");
ok(!/\.home[^{]*\{[^}]*\bwidth:\s*\d{3,}px/.test(css), "home-view.css fixes no page width (the frame is the page's)");
const js = readFileSync(new URL("../fragments/mobile-home-view-switch/home-view.js", import.meta.url), "utf8");
ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(js), "home-view.js makes no network call (client-side only)");
ok((js.match(/localStorage/g) || []).length >= 1 && /try \{/.test(js), "home-view.js reads and writes localStorage inside try/catch");
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nall passed"); process.exit(fails ? 1 : 0);
