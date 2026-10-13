// Behaviour check for Plan UI review 154 to 158, 178, 183 and 187 (13 Oct 2026 live test): light Not cooking panel, 3 s swipe undo, muted Not cooking colour,
// ECG marker on the divider line (only where days are hidden, 178), tear on every drag (top and bottom only). Headless Chromium, touch and mouse.
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
    await S(p, "window.__plan.openDay('d18')"); await sleep(300); await p.locator('#lite [data-ask="d18"]').focus(); await p.keyboard.press("Shift+X"); await sleep(4200);
    ok(`${tag} 155 (187): Shift X from the open day's card keeps the longer undo (the card has no Not cooking button)`, (await p.locator("#lite [data-undo]").count()) === 1 && (await S(p, "window.__plan.S.ustk[window.__plan.S.ustk.length - 1].ms")) === undefined);
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
    ok(`${tag} 178: the opened day carries NO marker (no open marker, none for d17, none inside or on it)`, (await p.locator('.ecg.open, .ecg[data-ecg*="d17"], #d-d17 .ecg').count()) === 0);
    ok(`${tag} 178: every marker left is over days that are really hidden, and collapsed (aria-expanded false)`, await S(p, "[...document.querySelectorAll('.ecg')].every(b => b.getAttribute('aria-expanded') === 'false' && b.dataset.ecg.split(',').every(d => document.getElementById('d-' + d).classList.contains('hid')))"));
    await sleep(1300); await S(p, "window.scrollBy(0, 30)"); await sleep(400);
    ok(`${tag} 178: still on screen after 1.3 s and a small scroll, it stays open`, (await hidCount(p, ["d17"])) === 0);
    await S(p, "window.scrollTo(0, document.getElementById('d-d17').getBoundingClientRect().top + window.scrollY + 700)"); await sleep(500);
    ok(`${tag} 178: scrolled well past, the opened day folds back by the peek rule (96)`, (await hidCount(p, ["d17"])) === 1);
    ok(`${tag} 178: and the flat marker is back in its gap, one only`, (await p.locator('.ecg[data-ecg="d17"]').count()) === 1 && (await p.locator('.ecg').count()) === (await S(p, "new Set([...document.querySelectorAll('.ecg')].map(b => b.dataset.ecg)).size")));
    await p.locator('.ecg[data-ecg="d17"]').scrollIntoViewIfNeeded(); await tap(p, '.ecg[data-ecg="d17"]'); await sleep(300); ok(`${tag} 178: it opens again from the marker`, (await hidCount(p, ["d17"])) === 0);
    ok(`${tag}: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth"));
    await p.close(); }
  { const p = await open(ctx, "", errs); await twoGap(p);
    ok(`${tag} 157: two hidden days in one gap give ONE marker`, (await p.locator('.ecg[data-ecg="d19,d20"]').count()) === 1 && (await p.locator('.ecg[data-ecg*="d19"]').count()) === 1);
    await p.locator('.ecg[data-ecg="d19,d20"]').scrollIntoViewIfNeeded(); await tap(p, '.ecg[data-ecg="d19,d20"]'); await sleep(350);
    ok(`${tag} 157: one tap opens ALL of them`, (await hidCount(p, ["d19", "d20"])) === 0 && (await p.locator("#d-d19 .blk, #d-d20 .blk").count()) === 2);
    ok(`${tag} 178: no marker on either opened day`, (await p.locator('.ecg.open, .ecg[data-ecg*="d19"], .ecg[data-ecg*="d20"]').count()) === 0);
    await sleep(1300); await S(p, "window.scrollTo(0, document.getElementById('d-d19').getBoundingClientRect().top + window.scrollY + 700)"); await sleep(500);
    ok(`${tag} 178: scrolled on, BOTH fold back together and one marker returns for the pair`, (await hidCount(p, ["d19", "d20"])) === 2 && (await p.locator('.ecg[data-ecg="d19,d20"]').count()) === 1);
    await p.close(); }
  { const p = await open(ctx, "", errs); await twoGap(p);   // keyboard
    await p.locator('.ecg[data-ecg="d19,d20"]').focus(); ok(`${tag} 157: the marker is focusable`, await S(p, "document.activeElement.classList.contains('ecg')"));
    await p.keyboard.press("Enter"); await sleep(300); ok(`${tag} 157: Enter opens the gap`, (await hidCount(p, ["d19", "d20"])) === 0);
    ok(`${tag} 178: focus moves to the first opened day (not lost) and no marker is left on it`, await S(p, "document.activeElement && document.activeElement.closest('#d-d19') !== null && !!document.activeElement.classList.contains('blk')") && (await p.locator('.ecg[data-ecg*="d19"]').count()) === 0);
    await sleep(1300); await S(p, "window.scrollTo(0, document.getElementById('d-d19').getBoundingClientRect().top + window.scrollY + 700)"); await sleep(500);
    ok(`${tag} 178: while focus is still inside an opened day it is not pulled away`, (await hidCount(p, ["d19", "d20"])) === 0);
    await S(p, "document.activeElement.blur()"); await S(p, "window.scrollBy(0, -40)"); await sleep(500);
    ok(`${tag} 178: once focus has left it folds back`, (await hidCount(p, ["d19", "d20"])) === 2);
    await p.locator('.ecg[data-ecg="d19,d20"]').focus(); await p.keyboard.press("Space"); await sleep(300); ok(`${tag} 157: Space opens the gap too`, (await hidCount(p, ["d19", "d20"])) === 0);
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
  // 183 an open night opens the SAME light card (owner-stated, 13 Oct 2026): Ask AI and Surprise me only (187, no Not cooking button); no tongue, no empty sheet
  { const p = await open(ctx, "", errs); const od = '.od[data-od-b="d21"]'; await p.locator(od).scrollIntoViewIfNeeded(); await tap(p, od); await sleep(400);
    const lite = await S(p, "(() => { const e = document.getElementById('lite'); const r = e && e.querySelector('.lpiece').getBoundingClientRect(); return e ? { h: Math.round(r.height), t: [...e.querySelectorAll('.oa button')].map(b => b.textContent.trim()), line: e.querySelector('.lnote').textContent.trim(), x: !!e.querySelector('[data-close]'), head: e.querySelector('h2').textContent.trim() } : null; })()");
    ok(`${tag} 183: tapping an open night shows the light card with exactly Ask AI and Surprise me`, !!lite && lite.t.join("|") === "Ask AI|Surprise me" && lite.line === "Open night" && lite.x, lite);
    ok(`${tag} 183: heading names the day`, !!lite && /Wed.*21 Oct/.test(lite.head), lite);
    ok(`${tag} 183: small (under 200 px), the same size class as the Not cooking card`, lite && lite.h < 200, lite);
    ok(`${tag} 183: no tongue, no sheet, no day piece, no footer, no full stack, no 'Nothing planned yet' text`, (await p.locator(".tongue, .spiece, .dpiece, .sfoot, .emptyb, .stackw:not(.lite)").count()) === 0 && !(await S(p, "document.body.textContent.includes('Nothing planned yet')")));
    ok(`${tag} 183: the week stays visible under it`, (await p.locator("#plan .pw-day").count()) > 20 && (await p.locator("#rib").count()) === 1);
    await sleep(2500); await S(p, "window.scrollBy(0, 30)"); await sleep(300); ok(`${tag} 183: stays open (no timer, small scroll)`, (await p.locator("#lite").count()) === 1);
    await tap(p, '#lite [data-ask="d21"]'); await sleep(300);
    ok(`${tag} 183: Ask AI keeps the card and says so inside it, once`, (await p.locator("#lite").count()) === 1 && (await p.locator("#lite .unote").count()) === 1 && (await p.locator("#d-d21 .unote").count()) === 0);
    ok(`${tag} 187: no Not cooking button or data-block anywhere in the open night card (no moon icon button, one 44 px row of two)`, (await p.locator("#lite [data-block], #lite .mko").count()) === 0 && (await p.locator("#lite .oa button").count()) === 2);
    ok(`${tag} 187: the open card announces Shift X (aria-keyshortcuts, no visible text)`, (await p.locator('#lite[aria-keyshortcuts="Shift+X"]').count()) === 1 && !/Shift/.test(await p.locator("#lite").textContent()));
    await p.keyboard.press("Escape"); await sleep(250);
    // 187 Not cooking is a swipe: with the card CLOSED, right swipe on the dashed box
    { const c = await center(p, '.od[data-od-b="d21"]');
      if (touch) await touchSwipe(ctx, p, c.x - 60, c.y, 160); else { await p.mouse.move(c.x - 60, c.y); await p.mouse.down(); await p.mouse.move(c.x + 20, c.y + 1, { steps: 6 }); await p.mouse.move(c.x + 100, c.y + 1, { steps: 6 }); await p.mouse.up(); }
      await sleep(150);
      ok(`${tag} 187: right swipe on the open night still marks Not cooking, Undo in place, 3 s`, (await blocked(p, "d21")) && (await p.locator("#d-d21 .unote [data-undo]").count()) === 1 && (await S(p, "window.__plan.S.ustk[window.__plan.S.ustk.length - 1].ms")) === 3000);
      await tap(p, "#d-d21 [data-undo]"); await sleep(300); ok(`${tag} 187: Undo puts the open night back`, !(await blocked(p, "d21"))); }
    // swipe while the card is open for that night: the card becomes the Not cooking card (Mark as open), nothing breaks
    await p.locator('.od[data-od-b="d21"]').scrollIntoViewIfNeeded(); await tap(p, '.od[data-od-b="d21"]'); await sleep(350);
    await S(p, "window.__plan.block('d21', 3000)"); await sleep(300);
    ok(`${tag} 187: marking the night Not cooking (swipe or Shift X) while its card is open turns the card into the Not cooking card`, (await blocked(p, "d21")) && (await p.locator("#lite").count()) === 1 && (await p.locator("#lite .oa button").allTextContents()).map(t => t.trim()).join("|") === "Ask AI|Surprise me|Mark as open");
    await sleep(600); await S(p, "window.__plan.unblock('d21')"); await sleep(300); await S(p, "window.__plan.closeDetail()"); await sleep(1500);
    await p.locator('.od[data-od-b="d21"]').scrollIntoViewIfNeeded(); await tap(p, '.od[data-od-b="d21"]'); await sleep(350);
    await tap(p, '.dy[data-dy="d15"]'); await sleep(300); ok(`${tag} 183: ribbon to a meal day swaps to the full detail`, (await p.locator("#lite").count()) === 0 && (await p.locator(".stackw .spiece").count()) === 1);
    await tap(p, '.dy[data-dy="d21"]'); await sleep(300); ok(`${tag} 183: ribbon back to the open night swaps to the card`, (await p.locator("#lite").count()) === 1 && (await p.locator(".spiece").count()) === 0);
    await p.keyboard.press("Escape"); await sleep(250); ok(`${tag} 183: Esc closes it`, (await p.locator("#lite").count()) === 0);
    await p.locator(od).scrollIntoViewIfNeeded(); await tap(p, od); await sleep(300); await tap(p, "#lite [data-close]"); await sleep(250); ok(`${tag} 183: the close button closes it`, (await p.locator("#lite").count()) === 0);
    await p.locator(od).scrollIntoViewIfNeeded(); await tap(p, od); await sleep(300); await tap(p, '#lite [data-surprise="d21"]'); await sleep(400);
    ok(`${tag} 183: Surprise me gives a real meal and its full detail`, (await S(p, "window.__plan.S.meals.some(m => m.day === 'd21' && m.src === 'surprise')")) && (await p.locator("#lite").count()) === 0 && (await p.locator(".stackw .spiece").count()) === 1);
    ok(`${tag} 183: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await p.close(); }
  // 183 keyboard: Enter opens the card from the dashed box, Tab reaches the buttons, Enter on Not cooking marks it
  { const p = await open(ctx, "", errs); const od = '.od[data-od-b="d21"]'; await p.locator(od).scrollIntoViewIfNeeded(); await p.locator(od).focus(); await p.keyboard.press("Enter"); await sleep(350);
    ok(`${tag} 183 keyboard: Enter on the open night opens the card`, (await p.locator("#lite").count()) === 1);
    await p.locator('#lite [data-ask="d21"]').focus(); await p.keyboard.press("Shift+X"); await sleep(350);
    ok(`${tag} 187 keyboard: Shift X with the card open marks the night Not cooking, the card becomes the Not cooking card`, (await blocked(p, "d21")) && (await p.locator("#lite .mko[data-unblock]").count()) === 1);
    await p.keyboard.press("Z"); await sleep(250); ok(`${tag} 187 keyboard: Z undoes it`, !(await blocked(p, "d21")));
    await p.keyboard.press("Escape"); await sleep(250); ok(`${tag} 183 keyboard: Esc closes the card`, (await p.locator("#lite").count()) === 0); await p.close(); }
  // 187 keyboard route that exists today: Tab to the dashed box, Shift X (announced in its label and aria-keyshortcuts), 3 s Undo
  { const p = await open(ctx, "", errs); await p.locator('.od[data-od-b="d21"]').scrollIntoViewIfNeeded();
    ok(`${tag} 187 keyboard: the dashed box is a focusable button that names Shift X and carries aria-keyshortcuts`, (await p.locator('button.od[data-od-b="d21"][aria-keyshortcuts="Shift+X"][aria-label*="Shift X"]').count()) === 1);
    await p.locator('.od[data-od-b="d21"]').focus(); await p.keyboard.press("Shift+X"); await sleep(300);
    ok(`${tag} 187 keyboard: Shift X on the focused dashed box marks Not cooking with the 3 s Undo`, (await blocked(p, "d21")) && (await S(p, "window.__plan.S.ustk[window.__plan.S.ustk.length - 1].ms")) === 3000); await p.close(); }
  // 183 ?lay=focus and the other detail variants
  { const p = await open(ctx, "lay=focus&day=d21", errs); await p.locator('.od[data-od-b="d21"]').scrollIntoViewIfNeeded(); await tap(p, '.od[data-od-b="d21"]'); await sleep(350);
    ok(`${tag} 183 ?lay=focus: the card is drawn in flow above the day, no big sheet`, (await p.locator("#lite.infl").count()) === 1 && (await p.locator(".spiece, .tongue").count()) === 0 && (await S(p, "document.documentElement.scrollWidth <= innerWidth"))); await p.close(); }
  for (const dt of ["peek", "strip", "hide", "sheet"]) { const p = await open(ctx, "dt=" + dt, errs);
    ok(`${tag} 183 ?dt=${dt}: no per-day card, the open night keeps its row with Ask AI and Surprise me (unchanged)`, (await p.locator("#lite").count()) === 0 && (await p.locator('[data-ask="d21"]').count()) >= 1 && (await p.locator('.od[data-od-b="d21"]').count()) === 0); await p.close(); }
  // reduced motion
  { const c2 = await browser.newContext(touch ? { viewport: { width: w, height: h }, hasTouch: true, isMobile: true, reducedMotion: "reduce" } : { viewport: { width: w, height: h }, reducedMotion: "reduce" }); const p = await open(c2, "", errs);
    ok(`${tag} 157 reduced motion: flat at once (no beat class, beat path invisible)`, (await p.locator(".ecg.beat").count()) === 0 && (await S(p, "parseFloat(getComputedStyle(document.querySelector('.ecg .bt')).opacity)")) === 0 && (await S(p, "getComputedStyle(document.querySelector('.ecg .bt')).animationName")) === "none");
    await p.locator('.ecg[data-ecg="d17"]').scrollIntoViewIfNeeded(); await (touch ? p.locator('.ecg[data-ecg="d17"]').tap() : p.locator('.ecg[data-ecg="d17"]').click()); await sleep(200);
    ok(`${tag} 157 reduced motion: still tappable`, (await hidCount(p, ["d17"])) === 0);
    ok(`${tag} 178 reduced motion: opened day has no marker, no entrance animation`, (await p.locator('.ecg[data-ecg*="d17"], .ecg.open').count()) === 0 && (await S(p, "getComputedStyle(document.getElementById('d-d17')).animationName")) === "none");
    await sleep(1300); await S(p, "window.scrollTo(0, document.getElementById('d-d17').getBoundingClientRect().top + window.scrollY + 700)"); await sleep(500);
    ok(`${tag} 178 reduced motion: folds back when scrolled on, flat marker returns`, (await hidCount(p, ["d17"])) === 1 && (await p.locator('.ecg[data-ecg="d17"]').count()) === 1); await c2.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} checks passed`); process.exit(fails ? 1 : 0);
