// Check for the stacked-night cue options on the Plan it flyout (option F, desktop Home): fragments/plan-day-picker/stacked-cue/ (owner, 24 Oct 2026: the sliver reads as a stray border; OPEN, nothing built).
// Usage: python3 -m http.server 8123 &  then  node tools/plan-stacked-cue-check.mjs     (BASE=... to point elsewhere; SHOTS=1 writes the flyout screenshots into stacked-cue/shots/)
// Needs playwright or playwright-core on the module path; EXE=/opt/pw-browsers/chromium for the sandbox. Any page error or console error fails the run.
import { createRequire } from "module"; import fs from "fs";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const ORIGIN = process.env.BASE || "http://localhost:8123", HOME = ORIGIN + "/fragments/plan-day-picker/stacked-cue/home.html", HUB = ORIGIN + "/fragments/plan-day-picker/stacked-cue/index.html";
const DIR = new URL("../fragments/plan-day-picker/stacked-cue/shots/", import.meta.url).pathname, SHOTS = !!process.env.SHOTS;
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await pw.chromium.launch({ executablePath: process.env.EXE || "/opt/pw-browsers/chromium" });
const errs = [], TH = { dark: "kitchie", light: "kitchie-day" };
async function open(vw, vh, th, q) {
  const cx = await browser.newContext({ viewport: { width: vw, height: vh } }); await cx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, TH[th]);
  const p = await cx.newPage(); p.on("pageerror", e => errs.push("pageerror " + e.message)); p.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text() + m.location().url)) errs.push(m.text()); });
  await p.goto(HOME + "?pick=f&" + q); await sleep(900); p.cx = cx; return p;
}
// resolve any CSS colour (including color-mix) to [r,g,b] through a canvas pixel
const rgb = (p, v) => p.evaluate(c => { const x = document.createElement("canvas").getContext("2d"); x.fillStyle = "#000"; x.fillStyle = c; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data].slice(0, 3); }, v);
const lum = c => { const f = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const info = (p, sel, props) => p.evaluate(([s, pr]) => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e), r = e.getBoundingClientRect(), o = { w: r.width, h: r.height, l: r.left, t: r.top, text: e.textContent.trim() }; pr.forEach(k => o[k] = cs[k]); return o; }, [sel, props]);
const pseudo = (p, sel, ps, props) => p.evaluate(([s, q, pr]) => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e, q), o = {}; pr.forEach(k => o[k] = cs[k]); return o; }, [sel, ps, props]);
const nights = p => p.evaluate(() => [...document.querySelectorAll("#week .row-w")].map(w => ({ day: w.querySelector(".dl").textContent, peek: w.classList.contains("has-peek"), solo: w.classList.contains("cue-solo"), meals: w.dataset.meals || null, b: w.querySelector(".peek-b") ? w.querySelector(".peek-b").textContent.trim() : null })));

for (const [vw, vh] of [[1440, 900], [1280, 720]]) for (const th of ["dark", "light"]) {
  const tag = vw + "x" + vh + " " + th + " "; let base = 0;
  // baseline: the sliver as F draws it today
  { const p = await open(vw, vh, th, "cue=0"), ns = await nights(p);
    ok(tag + "baseline: the flyout is open on the seven nights with the F rows", ns.length === 7, ns.length);
    ok(tag + "baseline: stacked nights (Sat, Mon) and the own-plan-only nights have the sliver", ns.filter(n => n.peek).length >= 3, ns);
    const sl = await pseudo(p, "#week .row-w.has-peek", "::after", ["height", "borderTopWidth", "content"]); ok(tag + "baseline: the sliver is the 12px ::after", sl && sl.height === "12px", sl);
    base = await p.evaluate(() => Math.round([...document.querySelectorAll("#week .row-w")].pop().getBoundingClientRect().bottom));
    if (SHOTS) await p.screenshot({ path: DIR + "cue0-sliver-" + vw + "x" + vh + "-" + th + ".png", clip: { x: Math.max(0, vw - 640), y: 0, width: 640, height: vh } });
    await p.cx.close(); }
  for (const cue of ["1", "2", "3", "4"]) {
    const p = await open(vw, vh, th, "cue=" + cue), t = tag + "cue " + cue + ": ", ns = await nights(p), st = ns.filter(n => n.meals && +n.meals >= 2), solo = ns.filter(n => n.solo);
    ok(t + "the cue is on the two nights with more than one meal (Sat 2, Mon 3) and not on the single-meal nights", st.length === 2 && st[0].day === "Sat" && st[1].day === "Mon" && solo.length >= 1, ns);
    const bg = await rgb(p, await p.evaluate(() => getComputedStyle(document.querySelector("#week")).backgroundColor)), surf = await rgb(p, await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--surface"))), page = await rgb(p, await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg")));
    const b = "#week .row-w.has-peek:not(.cue-solo):not(.open) .peek-b";
    ok(t + "the cue is still F's button (aria-expanded, a label that names the meals)", (await p.locator(b).count()) === 2 && (await p.locator(b).first().getAttribute("aria-expanded")) === "false" && /meals on (Sat|Mon)/.test(await p.locator(b).first().getAttribute("aria-label")), await p.locator(b).first().getAttribute("aria-label"));
    ok(t + "the old sliver is gone (no 12px ::after strip)", cue === "2" || (await pseudo(p, "#week .row-w.has-peek:not(.cue-solo)", "::after", ["display"])).display === "none", await pseudo(p, "#week .row-w.has-peek:not(.cue-solo)", "::after", ["display"]));
    const ink = await rgb(p, await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--fg"))), muted = await rgb(p, await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--muted")));
    if (cue === "1") {
      const m = await info(p, b, ["color", "borderTopColor", "backgroundColor", "borderTopWidth"]); ok(t + "badge reads '2 meals' and '3 meals' with a stacked-cards glyph (shape plus words)", (await p.locator(b).allInnerTexts()).join("|") === "2 meals|3 meals" && (await p.locator(b + " svg").count()) === 2, await p.locator(b).allInnerTexts());
      ok(t + "badge text contrast at least 4.5:1", cr(await rgb(p, m.color), await rgb(p, m.backgroundColor)) >= 4.5, [m.color, m.backgroundColor]); ok(t + "badge outline at least 3:1 against the row", cr(await rgb(p, m.borderTopColor), surf) >= 3, m.borderTopColor);
      const ov = await p.evaluate(() => [...document.querySelectorAll("#week .row-w.has-peek:not(.cue-solo)")].map(w => { const b = w.querySelector(".peek-b").getBoundingClientRect(), r = [...w.querySelectorAll(".dt > *")].map(x => { const q = document.createRange(); q.selectNodeContents(x); return q.getBoundingClientRect().right; }); return Math.max(...r) <= b.left + 1 || true; })); ok(t + "measured", ov.length === 2);
      const clash = await p.evaluate(() => [...document.querySelectorAll("#week .row-w.has-peek:not(.cue-solo)")].every(w => { const b = w.querySelector(".peek-b").getBoundingClientRect(); return [...w.querySelectorAll(".row-d .dt > *")].every(x => { const q = document.createRange(); q.selectNodeContents(x); return [...q.getClientRects()].every(r => r.right <= b.left + 1 || r.bottom <= b.top || r.top >= b.bottom); }); })); ok(t + "badge does not overlap the row text", clash);
    }
    if (cue === "2") {
      const e = await pseudo(p, "#week .row-w.has-peek:not(.cue-solo)", "::after", ["borderTopColor", "borderTopWidth", "borderTopLeftRadius", "display"]); ok(t + "stacked cards: a whole rounded card edge (not a bottom-only border), at least 3:1 against the flyout", e.display === "block" && parseFloat(e.borderTopWidth) >= 1 && parseFloat(e.borderTopLeftRadius) > 8 && cr(await rgb(p, e.borderTopColor), bg) >= 3, [e, cr(await rgb(p, e.borderTopColor), bg)]);
      const n = await p.evaluate(() => [...document.querySelectorAll("#week .row-w.has-peek:not(.cue-solo)")].map(w => w.dataset.extra)); ok(t + "one back card for 2 meals, two for 3 meals", n.join() === "1,2", n);
      const fw = await p.evaluate(() => { const r = [...document.querySelectorAll("#week .row-w")].map(w => w.querySelector(".row-d").getBoundingClientRect().width); return [Math.max(...r), Math.min(...r)]; }); ok(t + "the front card is narrower than its neighbours (a pile, not a border)", fw[0] - fw[1] >= 6, fw);
      ok(t + "screen readers get the count", (await p.locator(b + " .cue-sr").allTextContents()).join("|") === "2 meals|3 meals");
    }
    if (cue === "3") {
      const av = await p.locator(".cue-av").evaluateAll(a => a.map(x => [...x.querySelectorAll("i")].map(i => i.textContent).join(""))); ok(t + "dots carry the initials: Sat S, Mon JS (letters plus ring, not colour)", av.join("|") === "S|JS", av);
      const i = await info(p, ".cue-av i", ["color", "backgroundColor", "borderTopColor", "borderTopWidth"]); ok(t + "initial text 4.5:1 and ring 3:1", cr(await rgb(p, i.color), await rgb(p, i.backgroundColor)) >= 4.5 && cr(await rgb(p, i.borderTopColor), surf) >= 3 && i.w >= 24, [i.color, i.backgroundColor, i.borderTopColor]);
      ok(t + "readers hear who has their own plan", /have their own|has their own/.test((await p.locator(b + " .cue-sr").allTextContents()).join(" ")));
    }
    if (cue === "4") {
      const m = await p.locator(".cue-mini").allInnerTexts(); ok(t + "mini rows say who and what: Sam Salmon patties; Jo Cheese toastie; Sam Leftover rice", m.map(x => x.replace(/\s+/g, " ").trim()).join("|") === "Sam Salmon patties|Jo Cheese toastie|Sam Leftover rice", m);
      const h = await info(p, ".cue-mini", ["minHeight"]), mt = await info(p, ".cue-mini > span", ["color"]); ok(t + "each mini row is at least 28px tall; the meal text is 4.5:1 on the flyout", h.h >= 28 && cr(await rgb(p, mt.color), bg) >= 4.5, [h.h, mt.color]);
      const l = await pseudo(p, ".cue-l", "::before", ["content"]); const lc = await info(p, ".cue-l", ["borderLeftColor", "borderLeftWidth", "borderBottomWidth"]); ok(t + "the elbow connector is a shape at least 3:1 against the flyout", cr(await rgb(p, lc.borderLeftColor), bg) >= 3 && parseFloat(lc.borderLeftWidth) >= 2, lc);
    }
    // behaviour F had: first pick opens the night (does not plan), the button opens and folds it, the right arrow opens it, Esc closes
    await p.locator(b).first().click(); await sleep(250);
    ok(t + "pressing the cue opens that night's full picture (Hide, aria-expanded true) and nothing is planned", (await p.locator("#week .row-w.open .row-full").count()) === 1 && (await p.locator("#week .row-w.open .peek-b").getAttribute("aria-expanded")) === "true" && (await p.locator("#week .pk-conf").count()) === 0);
    ok(t + "when open the cue is F's own 'Hide' strip (no leftover badge, avatars or mini row inside it)", (await p.locator("#week .row-w.open .peek-b").innerText()).trim().toLowerCase() === "hide" && (await p.locator("#week .row-w.open .cue-ic, #week .row-w.open .cue-av, #week .row-w.open .cue-mini").count()) === 0);
    await p.locator("#week .row-w.open .peek-b").click(); await sleep(250); ok(t + "pressing it again folds the night and the cue comes back", (await p.locator("#week .row-w.open").count()) === 0 && (await p.locator(b).count()) === 2);
    await p.locator('#week .row-d[data-i="5"]').focus(); await p.keyboard.press("ArrowRight"); await sleep(250); ok(t + "the right arrow opens the night (Mon), the left arrow folds it", (await p.locator("#week .row-w.open").count()) === 1); await p.locator('#week .row-d[data-i="5"]').focus(); await p.keyboard.press("ArrowLeft"); await sleep(250); ok(t + "left arrow folds", (await p.locator("#week .row-w.open").count()) === 0);
    await p.locator('#week .row-d[data-i="5"]').click(); await sleep(250); ok(t + "the first pick on a stacked night opens it and does not plan; the second plans", (await p.locator("#week .row-w.open").count()) === 1 && (await p.locator("#week .pk-conf").count()) === 0);
    await p.locator("#week .row-w.open .row-d").click(); await sleep(400); ok(t + "second pick plans (confirmation)", (await p.locator("#week .pk-conf").count()) === 1);
    await p.close(); await p.cx.close();
    // layout: no horizontal overflow in the flyout, the list is on screen, measure the height cost
    const q = await open(vw, vh, th, "cue=" + cue), lay = await q.evaluate(() => { const f = document.querySelector("#week"), r = f.getBoundingClientRect(), last = [...document.querySelectorAll("#week .row-w")].pop().getBoundingClientRect(); return { x: f.scrollWidth - f.clientWidth, w: Math.round(r.width), lastBottom: Math.round(last.bottom), vh: innerHeight, docY: document.documentElement.scrollHeight - innerHeight }; });
    ok(t + "no horizontal scroll in the flyout, the flyout is one lane wide", lay.x <= 0 && lay.w >= 380 && lay.w <= 420, lay);
    ok(t + "height cost against today's sliver is at most 90px (F's own list already needs the page to scroll at 1280x720; the cost is recorded in the notes)", lay.lastBottom - base <= 90, [lay.lastBottom, base]);
    if (vw === 1280) console.log("cost", th, "cue", cue, lay.lastBottom - base, "px");
    if (SHOTS) await q.screenshot({ path: DIR + "cue" + cue + "-" + ["", "badge", "cards", "dots", "mini"][+cue] + "-" + vw + "x" + vh + "-" + th + ".png", clip: { x: Math.max(0, vw - 640), y: 0, width: 640, height: vh } });
    await q.cx.close();
  }
}
// the options page
for (const th of ["dark", "light"]) { const cx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); await cx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, TH[th]); const h = await cx.newPage(); h.on("pageerror", e => errs.push("hub " + e.message)); await h.goto(HUB); await sleep(700);
  const txt = await h.locator("body").innerText(); ok("hub " + th + ": four cues, each with a trade-off, a recommendation and the open question, nothing built", /Cue 1/.test(txt) && /Cue 2/.test(txt) && /Cue 3/.test(txt) && /Cue 4/.test(txt) && /Trade-off/i.test(txt) && /Recommend/i.test(txt) && /awaiting the owner/i.test(txt) && /nothing is built/i.test(txt));
  ok("hub " + th + ": every cue has its screenshots in both themes and both sizes (16 images) and they load", (await h.locator("img.shot").count()) >= 16 && (await h.locator("img.shot").evaluateAll(a => a.every(i => i.complete && i.naturalWidth > 0))) === true, await h.locator("img.shot").count());
  ok("hub " + th + ": no horizontal scroll", (await h.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0); await cx.close(); }
ok("no page or console errors", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log((fails ? "FAILED " : "OK ") + (total - fails) + "/" + total);
process.exit(fails ? 1 : 0);
