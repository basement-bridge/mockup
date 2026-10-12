// Behaviour check for Plan UI review 154 to 158 (13 Oct 2026 live test): light Not cooking panel, 3 s swipe undo, muted Not cooking colour,
// ECG marker on the divider line, tear on every drag (top and bottom only). Headless Chromium, touch and mouse.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-not-cooking-check.mjs
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(450); return p; }
const S = (p, f) => p.evaluate(f);
const blocked = (p, d) => S(p, `!!window.__plan.S.blocked.${d}`);
const center = async (p, sel) => { await p.locator(sel).scrollIntoViewIfNeeded(); const b = await p.locator(sel).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
async function touchSwipe(ctx, p, x, y, dx, steps = 8) { const c = await ctx.newCDPSession(p); const t = (type, xx) => c.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: xx, y, id: 1 }] }); await t("touchStart", x); for (let i = 1; i <= steps; i++) { await t("touchMove", x + dx * i / steps); await sleep(12); } await t("touchEnd", x); await sleep(150); }
const tearEdges = p => S(p, `(() => { const h = document.getElementById('hand'); return h ? { cls: h.className, edge: h.dataset.tear || null, ph: (document.querySelector('.mc.lifted') || {dataset:{}}).dataset.tear || null } : null; })()`);
// a gap of two hidden Not cooking days (Mon 19, Tue 20) before an open Wed 21
const twoGap = p => S(p, "(() => { const P = window.__plan; P.S.blocked.d19 = 'once'; P.S.blocked.d20 = 'once'; P.render(); })()");
const hidCount = (p, ds) => S(p, `${JSON.stringify(ds)}.filter(d => document.getElementById('d-' + d).classList.contains('hid')).length`);

for (const [w, h, touch] of [[390, 844, true], [360, 740, true], [1280, 900, false]]) {
  const ctx = await browser.newContext(touch ? { viewport: { width: w, height: h }, hasTouch: true, isMobile: true } : { viewport: { width: w, height: h } }); const errs = []; const tag = `${touch ? "touch" : "mouse"} ${w}`;
  const tap = (p, sel) => touch ? p.locator(sel).tap() : p.locator(sel).click();
  // 154 the light panel
  { const p = await open(ctx, "", errs); await p.locator('.ecg[data-ecg="d17"]').scrollIntoViewIfNeeded(); await tap(p, '.ecg[data-ecg="d17"]'); await sleep(300); await tap(p, "#d-d17 .blk"); await sleep(400);
    const lite = await S(p, "(() => { const e = document.getElementById('lite'); const r = e && e.querySelector('.lpiece').getBoundingClientRect(); return e ? { h: Math.round(r.height), t: [...e.querySelectorAll('button')].map(b => b.textContent.trim()), top: Math.round(r.top) } : null; })()");
    ok(`${tag} 154: tapping a Not cooking day shows the light panel with Ask AI, Surprise me, Mark as open only`, !!lite && lite.t.filter(Boolean).join("|") === "Ask AI|Surprise me|Mark as open", lite);
    ok(`${tag} 154: it is small (under 200 px tall), not a full-height stack`, lite && lite.h < 200, lite);
    ok(`${tag} 154: no recipe chrome (stepper, ingredients, total time, day piece, sheet, tongue, footer)`, (await p.locator(".ppl, .ing, .tt, .dpiece, .spiece, .tongue, .sfoot, .stackw:not(.lite)").count()) === 0);
    ok(`${tag} 154: the day is still Not cooking and docked under the ribbon`, (await blocked(p, "d17")) && (await p.locator("#rib").count()) === 1);
    ok(`${tag} 154: the week is still drawn under it`, (await p.locator("#plan .pw-day").count()) > 20);
    // a ribbon tap on a meal day then on this day
    await tap(p, '.dy[data-dy="d15"]'); await sleep(300); ok(`${tag} 154: ribbon to a meal day gives the full detail`, (await p.locator(".stackw:not(.lite) .spiece").count()) === 1 && (await p.locator("#lite").count()) === 0);
    await tap(p, '.dy[data-dy="d17"]'); await sleep(300); ok(`${tag} 154: ribbon back to the Not cooking day gives the light panel`, (await p.locator("#lite").count()) === 1 && (await p.locator(".spiece").count()) === 0);
    await p.keyboard.press("Escape"); await sleep(250); ok(`${tag} 154: Esc closes it`, (await p.locator("#lite").count()) === 0);
    ok(`${tag}: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await p.close(); }
  // 155 undo lengths
  { const p = await open(ctx, "", errs);
    let c = await center(p, '.od[data-od-b="d18"]');
    if (touch) await touchSwipe(ctx, p, c.x - 60, c.y, 160); else { await p.mouse.move(c.x - 60, c.y); await p.mouse.down(); await p.mouse.move(c.x + 20, c.y + 1, { steps: 6 }); await p.mouse.move(c.x + 100, c.y + 1, { steps: 6 }); await p.mouse.up(); }
    await sleep(100); ok(`${tag} 155: swipe right on an open day sets Not cooking with the inline Undo in the day`, (await blocked(p, "d18")) && (await p.locator("#d-d18 .unote [data-undo]").count()) === 1);
    ok(`${tag} 155: the Undo entry carries 3000 ms`, (await S(p, "window.__plan.S.ustk[window.__plan.S.ustk.length - 1].ms")) === 3000);
    await sleep(2300); ok(`${tag} 155: still there at 2.4 s`, (await p.locator("#d-d18 [data-undo]").count()) === 1); await sleep(1300);
    ok(`${tag} 155: gone at 3.7 s, the day stays Not cooking`, (await p.locator("[data-undo]").count()) === 0 && await blocked(p, "d18"));
    // the Not cooking button in the open day's detail keeps the default (14 s, 130)
    await S(p, "window.__plan.unblock('d18')"); await sleep(600); await S(p, "window.__plan.closeDetail()"); await sleep(300);
    await S(p, "window.__plan.openDay('d18')"); await sleep(300); await tap(p, '[data-block="d18"]'); await sleep(4200);
    ok(`${tag} 155: Not cooking from the day's own button keeps the longer undo`, (await p.locator("#lite [data-undo]").count()) === 1 && (await S(p, "window.__plan.S.ustk[window.__plan.S.ustk.length - 1].ms")) === undefined);
    await p.close(); }
  // 156 colour
  { const p = await open(ctx, "", errs);
    const col = await S(p, `(() => { const t = document.createElement('i'); t.style.color = 'var(--muted)'; document.body.appendChild(t); const m = getComputedStyle(t).color; t.remove(); const blk = document.querySelector('.blk'); const past = document.querySelector('.pw-day.past .mc'); return { m, edge: getComputedStyle(blk).borderLeftColor, und: (() => { const u = document.querySelector('.und .l:not(.cf)'); return u ? getComputedStyle(u).backgroundColor : null; })(), pastF: getComputedStyle(past).filter, pastO: getComputedStyle(past).opacity, nc: getComputedStyle(document.body).getPropertyValue('--nc').trim(), ac: !!document.body.dataset.ac }; })()`);
    ok(`${tag} 156: the Not cooking edge is --muted, the grey of past days`, col.edge === col.m, col);
    ok(`${tag} 156: no --nc token and no data-ac`, col.nc === "" && !col.ac, col);
    ok(`${tag} 156: past-week tiles unchanged (grayscale, 62 per cent)`, col.pastF.includes("grayscale(1)") && col.pastO === "0.62", col);
    ok(`${tag} 156: the swipe reveal for Not cooking is the same muted grey`, col.und === col.m, col);
    const sel = await S(p, `(() => { const mk = document.querySelector('.mc'); return 1; })()`); await p.close(); }
  // 157 the ECG marker
  { const p = await open(ctx, "", errs);
    ok(`${tag} 157: a gap with one hidden Not cooking day has one marker`, (await p.locator('.ecg[data-ecg="d17"]').count()) === 1);
    ok(`${tag} 157: no label text, a real button, aria says what it opens`, (await p.locator('.ecg[data-ecg="d17"]').evaluate(e => e.tagName === "BUTTON" && e.textContent.trim() === "" && /Show 1 hidden Not cooking day: Sat 17 Oct/.test(e.getAttribute("aria-label")))));
    const bb = await p.locator('.ecg[data-ecg="d17"]').boundingBox(); ok(`${tag} 157: hit area is at least 44 px tall`, bb.height >= 44, bb);
    ok(`${tag} 157: it beats once then settles flat (the beat path fades out)`, await (async () => { const o1 = await S(p, "parseFloat(getComputedStyle(document.querySelector('.ecg.beat .bt')).opacity)"); await sleep(2600); const o2 = await S(p, "parseFloat(getComputedStyle(document.querySelector('.ecg .bt')).opacity)"); return o1 > 0 && o2 === 0; })());
    await S(p, "window.__plan.render()"); ok(`${tag} 157: a re-render does not replay the beat`, (await p.locator(".ecg.beat").count()) === 0);
    await p.locator('.ecg[data-ecg="d17"]').scrollIntoViewIfNeeded(); await tap(p, '.ecg[data-ecg="d17"]'); await sleep(300);
    ok(`${tag} 157: tap opens just that one day, Sun 18 (open) and the others are untouched`, (await hidCount(p, ["d17"])) === 0 && (await p.locator("#d-d17 .blk").count()) === 1 && (await hidCount(p, ["d22", "d25", "d10"])) === 3);
    ok(`${tag} 157: the marker is now the open one and says Hide`, (await p.locator('.ecg.open[data-ecg="d17"]').count()) === 1 && /^Hide/.test(await p.locator('.ecg.open').first().getAttribute("aria-label")));
    await tap(p, '.ecg.open[data-ecg="d17"]'); await sleep(300); ok(`${tag} 157: tapping again closes it`, (await hidCount(p, ["d17"])) === 1 && (await p.locator('.ecg[data-ecg="d17"]:not(.open)').count()) === 1);
    await p.close(); }
  { const p = await open(ctx, "", errs); await twoGap(p);
    ok(`${tag} 157: two hidden days in one gap give ONE marker`, (await p.locator('.ecg[data-ecg="d19,d20"]').count()) === 1 && (await p.locator('.ecg[data-ecg*="d19"]').count()) === 1);
    await p.locator('.ecg[data-ecg="d19,d20"]').scrollIntoViewIfNeeded(); await tap(p, '.ecg[data-ecg="d19,d20"]'); await sleep(350);
    ok(`${tag} 157: one tap opens ALL of them`, (await hidCount(p, ["d19", "d20"])) === 0 && (await p.locator("#d-d19 .blk, #d-d20 .blk").count()) === 2);
    ok(`${tag} 157: they stay open after a scroll (not re-hidden by scrolling)`, await (async () => { await S(p, "window.scrollBy(0, 400)"); await sleep(400); await S(p, "window.scrollBy(0, -400)"); await sleep(400); return (await hidCount(p, ["d19", "d20"])) === 0; })());
    ok(`${tag} 157: one open marker above them closes both`, (await p.locator('.ecg.open[data-ecg="d19,d20"]').count()) === 1);
    await tap(p, '.ecg.open[data-ecg="d19,d20"]'); await sleep(300); ok(`${tag} 157: and closing hides both again`, (await hidCount(p, ["d19", "d20"])) === 2);
    await p.close(); }
  { const p = await open(ctx, "", errs); await twoGap(p);   // keyboard
    await p.locator('.ecg[data-ecg="d19,d20"]').focus(); ok(`${tag} 157: the marker is focusable`, await S(p, "document.activeElement.classList.contains('ecg')"));
    await p.keyboard.press("Enter"); await sleep(300); ok(`${tag} 157: Enter opens the gap`, (await hidCount(p, ["d19", "d20"])) === 0 && await S(p, "document.activeElement.classList.contains('ecg') && document.activeElement.classList.contains('open')"));
    await p.keyboard.press("Space"); await sleep(300); ok(`${tag} 157: Space closes it`, (await hidCount(p, ["d19", "d20"])) === 2);
    await p.close(); }
  { const p = await open(ctx, "gap=off", errs); ok(`${tag} 157: ?gap=off draws no marker`, (await p.locator(".ecg").count()) === 0); await p.close(); }
  { const p = await open(ctx, "", errs); await S(p, "window.scrollTo(0, 0)"); await sleep(200);
    const y = await S(p, "(() => { const el = document.getElementById('d-d17'); return el.getBoundingClientRect().top + window.scrollY - window.__plan.stkH() - 14; })()"); await S(p, `window.scrollTo(0, ${y})`); await sleep(500);
    ok(`${tag} 157: the peek at the scroll edge (96) is unchanged`, !(await S(p, "document.getElementById('peekT').hidden && document.getElementById('peekB').hidden")), await S(p, "[document.getElementById('peekT').hidden, document.getElementById('peekB').hidden]")); await p.close(); }
  // 158 the tear on every drag, top and bottom only
  if (touch) {
    { const p = await open(ctx, "", errs); const c = await center(p, '.mc[data-id="wed-curry"]'); const cd = await ctx.newCDPSession(p);
      const t = (type, x, y) => cd.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
      await t("touchStart", c.x, c.y); await sleep(450); ok(`${tag} 158: hold lifts in the plain agenda`, (await p.locator(".mc.hold").count()) === 1);
      for (let i = 1; i <= 6; i++) { await t("touchMove", c.x, c.y + 6 * i); await sleep(16); } await sleep(100);
      let e = await tearEdges(p); ok(`${tag} 158: dragging down in the PLAIN AGENDA tears the tile's TOP edge`, e && e.cls.includes("torn") && e.edge === "top" && e.ph === "bottom", e);
      const ph = await S(p, "(() => { const m = document.querySelector('.mc.lifted'); return m ? { o: getComputedStyle(m).opacity, bs: getComputedStyle(m).borderTopStyle } : null; })()"); ok(`${tag} 158: the opacity fade and dashed place-holder are still there`, ph && ph.o === "0.4" && ph.bs === "dashed", ph);
      ok(`${tag} 158: the tilt is still there`, (await S(p, "document.getElementById('hand').style.transform")).includes("rotate(-1.5deg)"));
      for (let i = 1; i <= 8; i++) { await t("touchMove", c.x + 12 * i, c.y + 36 + 2 * i); await sleep(16); } await sleep(80);
      e = await tearEdges(p); ok(`${tag} 158: a sideways move never tears a side (edge stays top)`, e && e.edge === "top" && e.ph === "bottom" && !["left", "right"].includes(e.edge), e);
      for (let i = 1; i <= 8; i++) { await t("touchMove", c.x + 96, c.y + 52 - 14 * i); await sleep(16); } await sleep(80);
      e = await tearEdges(p); ok(`${tag} 158: dragging up tears the BOTTOM edge`, e && e.edge === "bottom" && e.ph === "top", e);
      ok(`${tag} 158: the clip-path has no side teeth (polygon runs along the top or bottom only)`, await S(p, "(() => { const v = getComputedStyle(document.getElementById('hand')).getPropertyValue('--tin') || document.getElementById('hand').style.getPropertyValue('--tin'); return /^polygon\\(0% calc/.test(v.trim()) || v.includes('calc(100%'); })()"));
      await t("touchEnd"); await sleep(300); await p.keyboard.press("Escape"); await p.close(); }
    { const p = await open(ctx, "tear=detail", errs); const c = await center(p, '.mc[data-id="wed-curry"]'); const cd = await ctx.newCDPSession(p);
      const t = (type, x, y) => cd.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
      await t("touchStart", c.x, c.y); await sleep(450); for (let i = 1; i <= 6; i++) { await t("touchMove", c.x, c.y + 6 * i); await sleep(16); }
      const e = await tearEdges(p); ok(`${tag} 158: ?tear=detail keeps the old scoping (plain in the agenda)`, e && e.cls.includes("plain"), e); await t("touchEnd"); await p.close(); }
    { const p = await open(ctx, "sel=wed-curry", errs); await sleep(300); const c = await center(p, '.dpiece .mc'); const cd = await ctx.newCDPSession(p);
      const t = (type, x, y) => cd.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
      await t("touchStart", c.x, c.y); for (let i = 1; i <= 8; i++) { await t("touchMove", c.x + 3 * i, c.y + 8 * i); await sleep(16); } await sleep(80);
      const e = await tearEdges(p); ok(`${tag} 158: the detail drag-out still tears, top edge`, e && e.cls.includes("torn") && e.edge === "top", e); await t("touchEnd"); await p.close(); }
  } else {
    const p = await open(ctx, "", errs); const c = await center(p, '.mc[data-id="wed-curry"]');
    await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.mouse.move(c.x, c.y + 30, { steps: 6 }); await sleep(100);
    let e = await tearEdges(p); ok(`${tag} 158: mouse drag in the agenda tears top, place-holder bottom`, e && e.cls.includes("torn") && e.edge === "top" && e.ph === "bottom", e);
    await p.mouse.move(c.x + 200, c.y + 30, { steps: 8 }); e = await tearEdges(p); ok(`${tag} 158: a sideways mouse move never tears a side`, e && ["top", "bottom"].includes(e.edge), e);
    await p.mouse.up(); await sleep(300); await p.keyboard.press("Escape"); await p.close();
  }
  // reduced motion
  { const c2 = await browser.newContext(touch ? { viewport: { width: w, height: h }, hasTouch: true, isMobile: true, reducedMotion: "reduce" } : { viewport: { width: w, height: h }, reducedMotion: "reduce" }); const p = await open(c2, "", errs);
    ok(`${tag} 157 reduced motion: flat at once (no beat class, beat path invisible)`, (await p.locator(".ecg.beat").count()) === 0 && (await S(p, "parseFloat(getComputedStyle(document.querySelector('.ecg .bt')).opacity)")) === 0 && (await S(p, "getComputedStyle(document.querySelector('.ecg .bt')).animationName")) === "none");
    await p.locator('.ecg[data-ecg="d17"]').scrollIntoViewIfNeeded(); await (touch ? p.locator('.ecg[data-ecg="d17"]').tap() : p.locator('.ecg[data-ecg="d17"]').click()); await sleep(200);
    ok(`${tag} 157 reduced motion: still tappable`, (await hidCount(p, ["d17"])) === 0); await c2.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} checks passed`); process.exit(fails ? 1 : 0);
