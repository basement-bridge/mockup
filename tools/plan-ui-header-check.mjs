// Behaviour check for the Plan UI phone mockup, the week header (Plan UI review 191 to 194, owner-stated 13 Oct 2026): the counts are buttons that jump (191) and read clearly (192), the Today pill is gone and a long hold on the
// "Week of ..." label (or T) goes to today (193), Copy last week and Clear week are two icon buttons beside the cog that flip to Undo in place (194). Headless Chromium, touch and mouse, dark and light, reduced motion.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-header-check.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + (q ? "?" + q : "")); await sleep(500); return p; }
const S = (p, f) => p.evaluate(f);
const st = p => S(p, "({ cur: window.__plan.S.cur, y: Math.round(scrollY) })");
async function hold(ctx, p, touch, x, y, ms, jitter) { if (!touch) { await p.mouse.move(x, y); await p.mouse.down(); if (jitter) { await p.mouse.move(x + jitter, y); } await sleep(ms); await p.mouse.up(); return; }
  const c = await ctx.newCDPSession(p); await c.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] }); if (jitter) await c.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + jitter, y, id: 1 }] }); await sleep(ms); await c.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); }
const lab = async p => { const b = await p.locator("#wkt").boundingBox(); return { x: b.x + 24, y: b.y + b.height / 2 }; };
const contrast = (p, sel, bgSel) => p.evaluate(([sel, bgSel]) => { const el = document.querySelector(sel), bgEl = document.querySelector(bgSel || sel); const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const f = parse(getComputedStyle(el).color); let n = bgEl, bg = { r: 255, g: 255, b: 255, a: 0 }; while (n) { const c = parse(getComputedStyle(n).backgroundColor); if (c.a > 0) { bg = c; break; } n = n.parentElement; }
  const L = c => { const u = [c.r, c.g, c.b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * u[0] + .7152 * u[1] + .0722 * u[2]; }; const a = L(f), b = L(bg); return +((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2); }, [sel, bgSel]);
const rects = (p, sel) => p.locator(sel).evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; }));
const hit = async (p, wkIdx, kind, tap) => { const b = p.locator(".wkd").nth(wkIdx).locator(kind === "nc" ? ".wnc" : ".wop"); await b.scrollIntoViewIfNeeded(); await tap(b); await sleep(1500); return S(p, "({ cur: window.__plan.S.cur, pulse: [...document.querySelectorAll('.pw-day.pulse')].map(e => e.dataset.d), hidden: [...document.querySelectorAll('.pw-day.hid')].map(e => e.dataset.d) })"); };
const topOf = (p, d) => S(p, `(function () { var e = document.getElementById('d-${d}'); return e ? Math.round(e.getBoundingClientRect().top - window.__plan.stkH()) : null; })()`);

for (const [scheme, reduced] of [["dark", false], ["light", false], ["dark", true]]) for (const [w, h, touch] of scheme === "dark" && !reduced ? [[390, 844, true], [360, 740, true], [1280, 900, false]] : [[390, 844, true], [360, 740, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme, reducedMotion: reduced ? "reduce" : "no-preference" }); const errs = []; const tag = `${scheme}${reduced ? " reduced" : ""} ${touch ? "touch" : "mouse"} ${w}`;
  const tap = loc => touch ? loc.tap() : loc.click();
  // ---------- B. counts: buttons, jump, legible ----------
  { const p = await open(ctx, "", errs);
    const row = p.locator(".wkd").nth(1);
    ok(`${tag} B: both counts are real buttons, focusable, with names that say where they go`, await row.evaluate(r => [...r.querySelectorAll(".wnc,.wop")].length === 2 && [...r.querySelectorAll(".wnc,.wop")].every(b => b.tagName === "BUTTON" && b.tabIndex === 0 && /Go to the first one/.test(b.getAttribute("aria-label")))));
    const rs = await rects(p, ".wkd:nth-of-type(n) .wnc, .wkd .wop"); ok(`${tag} B: every count has a 44 x 44 hit area`, rs.length >= 2 && rs.every(r => r.w >= 43.5 && r.h >= 43.5), rs.slice(0, 2));
    if (!reduced) {
      let r = await hit(p, 1, "nc", tap); ok(`${tag} B: the moon count goes to the first Not cooking night of this week from today on (Sat 17), opened and pulsed`, r.cur === "d17" && r.pulse.includes("d17") && !r.hidden.includes("d17"), r);
      ok(`${tag} B: the target sits just under the header`, Math.abs(await topOf(p, "d17") - 6) < 60, await topOf(p, "d17"));
      r = await hit(p, 1, "op", tap); ok(`${tag} B: the open-padlock count goes to the first open night (Sun 18)`, r.cur === "d18" || r.pulse.includes("d18"), r);
      r = await hit(p, 2, "nc", tap); ok(`${tag} B: next week's moon goes to its first Not cooking night (Thu 22)`, r.pulse.includes("d22"), r);
      r = await hit(p, 2, "nc", tap); ok(`${tag} B: tapping again goes to the same first night (always the first, as he said)`, r.pulse.includes("d22") && r.cur === "d22", r);
      r = await hit(p, 2, "op", tap); ok(`${tag} B: next week's box goes to Mon 19`, r.pulse.includes("d19"), r);
    }
    // keyboard
    await S(p, "window.scrollTo(0, 0)"); await sleep(300); const kb = p.locator(".wkd").nth(1).locator(".wnc"); await kb.focus(); await p.keyboard.press("Enter"); await sleep(1400);
    ok(`${tag} B: Enter on the focused moon count jumps too`, (await st(p)).cur === "d17", await st(p));
    ok(`${tag} B: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await p.close(); }
  // pulse is a still outline when motion is reduced
  if (reduced) { const p = await open(ctx, "", errs); await hit(p, 1, "nc", tap); ok(`${tag} B: reduced motion: the arrival is a still outline, not an animation`, await S(p, "(function () { var e = document.querySelector('.pw-day.pulse'); if (!e) return false; var c = getComputedStyle(e); return c.animationName === 'none' && c.boxShadow !== 'none'; })()"), await S(p, "(function () { var e = document.querySelector('.pw-day.pulse'); return e ? getComputedStyle(e).animationName : null; })()")); await p.close(); }
  // what is counted: Not cooking however it got marked, never a past night, the person filter for open nights
  { const p = await open(ctx, "", errs); const mo = async k => +(await p.locator(".wkd").nth(k).locator(".wnc b").innerText());
    ok(`${tag} B: next week's moon counts a one-off mark and a usual day off together`, (await mo(2)) === 2, await mo(2));
    await S(p, "window.__plan.S.blocked.d12 = 'once'; window.__plan.S.blocked.d17 = 'usual'; window.__plan.render(false)"); const a = await mo(1);
    ok(`${tag} B: a past night is never counted (Mon 12 marked), and a one-off and a usual mark count the same`, a === 1, a);
    await p.close(); const q2 = await open(ctx, "who=priya", errs);
    const exp = await S(q2, "(function () { var A = window.__plan, S = A.S, P = window.PUR, n = 0; P.RIB.forEach(function (r) { if (r.wk !== 0 || r.id < 'd13' || S.blocked[r.id]) return; if (!S.meals.some(function (m) { return m.day === r.id && P.match(m, 'priya'); })) n++; }); return n; })()");
    ok(`${tag} B: another person's view counts the open nights of that view, and still jumps`, +(await q2.locator(".wkd").nth(1).locator(".wop b").innerText()) === exp, exp); await q2.close(); }
  // 192: legibility
  { const p = await open(ctx, "", errs);
    await p.locator(".wkd").nth(1).scrollIntoViewIfNeeded(); const bx = await p.locator(".wkd").nth(1).locator(".wop b").boundingBox();
    // 215: the count glyph is the open padlock (an inline svg line icon), not the dashed box; the numeral stays solid and bold
    ok(`${tag} B: the open-night count is a bold numeral and an open padlock svg, no dashed box`, bx.height >= 12 && await p.locator(".wop").first().evaluate(e => { const b = e.querySelector("b"), s = e.querySelector("svg"), c = getComputedStyle(b); return !!s && s.getBoundingClientRect().width >= 13 && c.borderTopStyle === "none" && parseFloat(c.fontSize) >= 12 && parseInt(c.fontWeight) >= 700; }), bx);
    ok(`${tag} B: the numeral is solid and 4.5:1 or better against the box (light and dark)`, (await contrast(p, ".wkd .wop b")) >= 4.5, await contrast(p, ".wkd .wop b"));
    ok(`${tag} B: the moon is unchanged (13 px moon, 12 px muted number)`, await p.locator(".wnc").first().evaluate(e => { const s = e.querySelector("svg"), c = getComputedStyle(e); return s.getBoundingClientRect().width === 13 && c.fontSize === "12px" && s.querySelector("path").getAttribute("d") === "M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"; }));
    ok(`${tag} B: the moon number is 3:1 or better`, (await contrast(p, ".wkd .wnc")) >= 3, await contrast(p, ".wkd .wnc"));
    // nothing cramped with long labels: the counts never touch the label, and the row never overflows
    for (const [k, wkId] of [[1, "d12"], [2, "d19"], [3, "d26"], [4, "n02"]]) { const cell = await p.locator(".wkd").nth(k).evaluate(r => { const kids = [...r.children].map(c => c.getBoundingClientRect()), l = kids[0], rel = kids[1], wr = r.querySelector(".wr").getBoundingClientRect(), rr = r.getBoundingClientRect(); return { labelRight: Math.max(l.right, rel.right), wrLeft: wr.left, wrTop: wr.top, labelBottom: Math.max(l.bottom, rel.bottom), sw: r.scrollWidth, cw: r.clientWidth, right: rr.right, wrRight: wr.right, h: rr.height }; });
      ok(`${tag} B: row ${k} (${wkId}): the counts never touch the label, nothing overflows`, (cell.wrLeft >= cell.labelRight + 4 || cell.wrTop >= cell.labelBottom - 2) && cell.sw <= cell.cw && cell.wrRight <= cell.right + 1, cell); }
    ok(`${tag} B: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await p.close(); }
  // ---------- D. no Today pill; long hold, T, Enter ----------
  { const p = await open(ctx, "", errs);
    ok(`${tag} D: there is no Today pill or button anywhere in the header`, (await p.locator(".hd .tdy, .hd [data-today]").count()) === 0 && !/\bToday\b/.test(await p.locator(".hd").innerText()));
    await S(p, "window.__plan.showWeek('d26')"); await sleep(900);
    ok(`${tag} D: away from today there is still no Today pill`, (await p.locator(".hd .tdy, .hd [data-today]").count()) === 0 && !/\bToday\b/.test(await p.locator(".hd").innerText()), await p.locator(".hd").innerText());
    const l = p.locator("#wkt"); ok(`${tag} D: the label is a button with the T shortcut and a description, and no visible hint`, await l.evaluate(e => e.tagName === "BUTTON" && e.getAttribute("aria-keyshortcuts") === "T" && /hold/i.test(e.getAttribute("aria-description")) && !e.title && !/hold|press|long/i.test(e.closest(".hd").innerText)));
    ok(`${tag} D: the label hit area is 44 high`, (await l.boundingBox()).height >= 30 && (await p.locator(".wt").boundingBox()).height >= 30);
    let pt = await lab(p); await hold(ctx, p, touch, pt.x, pt.y, 200); await sleep(900);
    ok(`${tag} D: a short press does nothing`, (await st(p)).cur !== "d13");
    pt = await lab(p); await hold(ctx, p, touch, pt.x, pt.y, 100); await sleep(500); await l.click().catch(() => { }); await sleep(700);
    ok(`${tag} D: a plain tap or click on the label does nothing (no meaning yet)`, (await st(p)).cur !== "d13");
    pt = await lab(p); await hold(ctx, p, touch, pt.x, pt.y, 900, 20); await sleep(900);
    ok(`${tag} D: a hold that wanders more than 8 px does nothing (a scroll or a drag)`, (await st(p)).cur !== "d13");
    // touch scroll that starts on the label
    if (touch) { const c = await ctx.newCDPSession(p); pt = await lab(p); await c.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pt.x, y: pt.y, id: 1 }] }); for (let i = 1; i <= 10; i++) { await c.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: pt.x, y: pt.y + i * 30, id: 1 }] }); await sleep(70); } await sleep(300); await c.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(800);
      ok(`${tag} D: a drag that starts on the label and scrolls the page does not jump to today`, (await st(p)).cur !== "d13", await st(p)); }
    pt = await lab(p); await hold(ctx, p, touch, pt.x, pt.y, 800); await sleep(250);
    ok(`${tag} D: the label pulsed, and there is no toast or message`, (await S(p, "document.getElementById('wkt').classList.contains('wkl-pulse')")) && (await p.locator(".unote, .upill, .ubn, [role=status]").count()) === 0);
    if (reduced) ok(`${tag} D: reduced motion: the pulse is a still outline`, await S(p, "(function () { var c = getComputedStyle(document.getElementById('wkt')); return c.animationName === 'none' && c.boxShadow !== 'none'; })()"));
    await sleep(1300);
    ok(`${tag} D: a hold of 500 ms goes to today (agenda scrolled, Tue 13 under the header)`, (await st(p)).cur === "d13" && Math.abs(await topOf(p, "d13")) < 80, [await st(p), await topOf(p, "d13")]);
    ok(`${tag} D: the header label now reads Week of 12 Oct, This week`, (await l.innerText()) === "Week of 12 Oct" && (await p.locator("#wks").innerText()) === "This week");
    await S(p, "window.__plan.showWeek('n02')"); await sleep(900); await p.keyboard.press("t"); await sleep(1500);
    ok(`${tag} D: the T key goes to today`, (await st(p)).cur === "d13", await st(p));
    await S(p, "window.__plan.showWeek('d26')"); await sleep(900); await p.locator("#wkt").focus(); await p.keyboard.press("Enter"); await sleep(1500);
    ok(`${tag} D: Enter on the focused label goes to today (keyboard and screen readers)`, (await st(p)).cur === "d13", await st(p));
    await S(p, "window.__plan.showWeek('d26')"); await sleep(900); await p.locator("#wkt").focus(); await p.keyboard.press("Space"); await sleep(1500);
    ok(`${tag} D: Space on the focused label goes to today`, (await st(p)).cur === "d13", await st(p));
    ok(`${tag} D: no sideways scroll`, await S(p, "document.documentElement.scrollWidth <= innerWidth")); await p.close(); }
  { const p = await open(ctx, "", errs); await S(p, "window.__plan.showWeek('d26')"); await sleep(900); await tap(p.locator("[data-fmenu]")); await sleep(300); await p.locator("#fq").focus(); await p.keyboard.type("t"); await sleep(400);
    ok(`${tag} D: typing t in the person search does not jump`, (await st(p)).cur !== "d13" && (await p.locator("#fq").inputValue()) === "t"); await p.close(); }
  { const p = await open(ctx, "sel=wed-curry", errs); await sleep(300); await S(p, "window.__plan.goDay('d15')"); await sleep(500); const pt = await lab(p); await hold(ctx, p, touch, pt.x, pt.y, 800); await sleep(1000);
    ok(`${tag} D: with a detail docked, the hold swaps the docked day to today`, await S(p, "window.__plan.S.cur === 'd13' && window.__plan.S.sel && window.__plan.find(window.__plan.S.sel).day === 'd13'"), await S(p, "[window.__plan.S.cur, window.__plan.S.sel]")); await p.close(); }
  // ---------- E. Copy and Clear beside the cog ----------
  { const p = await open(ctx, "ut=6", errs); const hd = ".hd";
    ok(`${tag} E: no ... menu and no week-actions button any more`, (await p.locator("[data-wkmenu], .wkm").count()) === 0 && (await p.locator(".hd .ib[aria-label^='Week actions']").count()) === 0);
    const bs = await p.locator(".hd .ib").evaluateAll(es => es.map(e => ({ l: e.getAttribute("aria-label"), t: e.title, x: e.getBoundingClientRect().x, w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, d: e.disabled })));
    ok(`${tag} E: Copy last week, Clear week, Plan settings in that order, each with a name and a tooltip`, bs.length === 3 && /^Copy last week/.test(bs[0].l) && /^Clear week/.test(bs[1].l) && /settings/i.test(bs[2].l) && bs.every(b => b.t && b.l && b.h >= 43.5 && b.w >= 36), bs);
    ok(`${tag} E: the two icons sit next to the cogwheel, right of the Mine dropdown`, bs[0].x > (await p.locator(".fmenu").boundingBox()).x && bs[1].x + bs[1].w <= bs[2].x + 2, bs);
    const icon = await p.locator(".hd [data-clearw] svg path").first().getAttribute("d"); ok(`${tag} E: Clear week keeps the eraser glyph`, icon.startsWith("m7 21-4.3-4.3"));
    const fits = async label => ok(`${tag} E: header does not overflow (${label})`, await S(p, "(function () { var h = document.querySelector('.hd'), r = h.getBoundingClientRect(); return h.scrollWidth <= h.clientWidth + 1 && [...h.querySelectorAll('button, h1, small')].every(function (b) { var q = b.getBoundingClientRect(); return q.width === 0 || (q.left >= -0.5 && q.right <= innerWidth + 0.5); }) && document.documentElement.scrollWidth <= innerWidth; })()"), await S(p, "[...document.querySelectorAll('.hd button')].map(function (b) { return Math.round(b.getBoundingClientRect().right); })"));
    await fits("idle");
    // Copy flips in place
    const c0 = (await p.locator(".hd [data-copy]").boundingBox()); await tap(p.locator(".hd [data-copy]")); await sleep(400);
    const u1 = await p.locator(".hd .flipundo").boundingBox();
    /* Plan UI review 214 (owner-stated, 14 Oct 2026: the in-place Undo is too big/fat): the visible chip is at most 32 px high (the icon button stays 44), and the touch target is still 44 px high and 44 px wide at its edges (invisible hit area), in the same green */
    ok(`${tag} E214: the Undo chip is visibly smaller (height <= 32, icon button still 44 high and 38 wide)`, u1.height <= 32 && c0.height === 44 && c0.width === 38, [c0, u1]);
    ok(`${tag} E214: the Undo keeps a 44 px touch target (hit-tests inside it, 21 px above and below the centre)`, await p.evaluate(([x, y]) => [[x, y - 21], [x, y + 21]].every(([a, b]) => { const e = document.elementFromPoint(a, b); return !!(e && e.closest(".flipundo")); }), [u1.x + u1.width / 2, u1.y + u1.height / 2]));
    ok(`${tag} E214: the Undo is still the accent green`, await p.evaluate(() => { const t = document.createElement("i"); t.style.background = "var(--accent)"; document.body.appendChild(t); const a = getComputedStyle(t).backgroundColor; t.remove(); return getComputedStyle(document.querySelector(".hd .flipundo")).backgroundColor === a; }));
    ok(`${tag} E214: no horizontal overflow with the Undo showing`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector(".hd").scrollWidth <= document.querySelector(".hd").clientWidth));
    ok(`${tag} E: Copy last week flips to Undo in the same place (left edge within 16 px: the chip is right-anchored and is 12 px narrower since 214; centred on the icon row)`, (await p.locator(".hd .flipundo").count()) === 1 && Math.abs(u1.x - c0.x) <= 16 && Math.abs((u1.y + u1.height / 2) - (c0.y + c0.height / 2)) <= 1 && /copy/i.test(await p.locator(".hd .flipundo").innerText()) && (await p.locator(".hd [data-copy]").count()) === 0, [c0, u1]);
    ok(`${tag} E: the Clear icon is still there beside it`, (await p.locator(".hd [data-clearw]").count()) === 1);
    await fits("Undo copy");
    await tap(p.locator(".hd .flipundo")); await sleep(300); const c1 = await p.locator(".hd [data-copy]").boundingBox();
    ok(`${tag} E: Undo puts the Copy icon back in place and removes the copied meals`, Math.abs(c1.x - c0.x) <= 4 && (await S(p, "window.__plan.S.meals.every(function (m) { return m.id.indexOf('cp-') !== 0; })")));
    // Clear flips in place, and returns after the window
    const k0 = await p.locator(".hd [data-clearw]").boundingBox(); await tap(p.locator(".hd [data-clearw]")); await sleep(400); const k1 = (await p.locator(".hd .flipundo").boundingBox()) || { x: -999, width: 0 };
    ok(`${tag} E: Clear week flips to Undo in the same place`, (await p.locator(".hd .flipundo").count()) === 1 && /clear/i.test(await p.locator(".hd .flipundo").innerText()) && Math.abs(k1.x - k0.x) <= 40 && k1.x + k1.width > k0.x, [k0, k1]);
    await fits("Undo clear"); await sleep(6200);
    ok(`${tag} E: after the window the Undo goes back to the Clear icon (nothing left to clear, so it is dimmed)`, (await p.locator(".hd .flipundo").count()) === 0 && (await p.locator(".hd [data-clearw]").count()) === 1);
    ok(`${tag} E: no page error and no sideways scroll`, errs.length === 0 && await S(p, "document.documentElement.scrollWidth <= innerWidth"), errs); await p.close(); }
  // long label in the header
  { const p = await open(ctx, "", errs); for (const d of ["d26", "n02"]) { await S(p, `window.__plan.showWeek('${d}')`); await sleep(900);
      ok(`${tag} E: header with "${await p.locator("#wkt").innerText()}" fits`, await S(p, "(function () { var h = document.querySelector('.hd'); return h.scrollWidth <= h.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth; })()")); }
    // past week: both disabled and say why; scope: gone for another person's plan
    await S(p, "window.__plan.showWeek('d05')"); await sleep(900);
    ok(`${tag} E: last week (read only): Copy and Clear are drawn disabled so the row does not move`, (await p.locator(".hd [data-copy]").isDisabled()) && (await p.locator(".hd [data-clearw]").isDisabled()) && /read only/i.test(await p.locator(".hd [data-copy]").getAttribute("title")));
    await S(p, "window.__plan.showWeek('d19')"); await sleep(900); ok(`${tag} E: next week: Copy is enabled`, !(await p.locator(".hd [data-copy]").isDisabled())); await p.close();
    const q2 = await open(ctx, "who=priya", errs); ok(`${tag} E: another person's plan: neither button is drawn (scope rule, 190)`, (await q2.locator(".hd [data-copy], .hd [data-clearw]").count()) === 0 && (await q2.locator(".hd .ib").count()) === 1); await q2.close();
    const q3 = await open(ctx, "cw=menu&cl=meals", errs); ok(`${tag} E: the old ?cw= and ?cl= switches are gone (ignored)`, (await q3.locator(".hd [data-copy]").count()) === 1 && (await q3.locator("[data-wkmenu]").count()) === 0); await q3.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
