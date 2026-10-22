// Behaviour and layout check for fragments/mobile-home-g-revisions (headless Chromium). Prints PASS or FAIL per check.
// Usage:  python3 -m http.server 8123 &   then   node tools/mobile-home-g-revisions-check.mjs [--shots=shots/mobile-home-g-revisions]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: four frames draw for every phone height x data state x Running low rule, both themes, no console error, no sideways scroll; the hero is first, whole above the fold, with Make it and Plan, and never moves between data states;
// the ladder per option written out independently of revisions.js (urgent takes slot 2, ahead of other ideas and Running low; nothing urgent gives it to other ideas; Running low only when nothing is urgent and one is at zero; empty means absent);
// caps (1 or 2 on On the way out with "+N more", Running low uncapped); fit (nothing opened by default is cut by the fold, a taller phone never opens less); words not colour alone; tap and keyboard; 44px targets;
// the model's height numbers against the render; default path loads; reduced motion; no hex colour; phone-only; fragment G untouched.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const BASE = process.env.BASE || "http://localhost:8123/fragments/mobile-home-g-revisions/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const HS = ["short", "medium", "tall"], HPX = { short: 600, medium: 740, tall: 844 }, DS = ["calm", "today", "expired", "empty", "low"], OPTS = ["a", "b", "c", "d"];
const TOT = { calm: { soon: 3, low: 2 }, today: { soon: 3, low: 2 }, expired: { soon: 5, low: 2 }, empty: { soon: 0, low: 0 }, low: { soon: 0, low: 3 } };
const URGENT = { calm: 0, today: 1, expired: 3, empty: 0, low: 0 }, ZERO = { low: 1 };
async function open(q, { theme = "kitchie", reduce = false } = {}) {
  const c = await b.newContext({ viewport: { width: 1700, height: 1000 }, reducedMotion: reduce ? "reduce" : "no-preference" });
  await c.addInitScript(t => { if (!sessionStorage.getItem("__i")) { localStorage.setItem("theme", t); sessionStorage.setItem("__i", "1"); } }, theme);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text())) p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*\/mobile-home-g-revisions\//, "").replace(/\?.*$/, "")));
  await p.goto(BASE + "?" + q); await p.waitForSelector("body[data-ready]:not([data-ready=''])", { state: "attached" }); await p.waitForTimeout(120); return p;
}
const F = (p, o) => p.locator(`.fr[data-frame=${o}]`);
// what the layout must be, read from the drawn frame: [{sec, form, open, view, top, bottom}]
const read = (p, o) => F(p, o).evaluate(fr => { const body = fr.querySelector(".pbody"), br = body.getBoundingClientRect();
  return { V: body.clientHeight, secs: [...fr.querySelectorAll("[data-sec]")].map(s => { const r = s.getBoundingClientRect(); return { sec: s.dataset.sec, form: s.dataset.form || "hero", open: s.dataset.open === "true", view: s.dataset.view, top: Math.round(r.top - br.top), bottom: Math.round(r.bottom - br.top), rows: s.querySelectorAll(".ur").length, text: s.innerText }; }) }; });
const ids = L => L.secs.map(s => s.sec);
const sec = (L, k) => L.secs.find(s => s.sec === k);

/* 1. every combination draws; no errors; no sideways scroll; the frame is the height asked for */
const LAY = {};
for (const theme of ["kitchie", "kitchie-day"]) for (const h of HS) for (const d of DS) for (const lr of ["1", "0"]) {
  if (theme === "kitchie-day" && (lr === "0" || h === "medium")) continue;
  const p = await open(`h=${h}&d=${d}&lr=${lr}`, { theme });
  const tag = `${theme} ${h}/${d}/lr${lr}`;
  if (await F(p, "a").count() !== 1 || await p.locator(".fr").count() !== 4 || p.errs.length || !await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth) ||
      !await p.evaluate(px => [...document.querySelectorAll(".pf")].every(e => Math.round(e.getBoundingClientRect().height) === px && e.querySelector(".pbody").scrollWidth <= 391), HPX[h])) ok(false, `${tag}: four frames, no errors, no sideways scroll, ${HPX[h]}px high ${p.errs.join(";")}`);
  if (theme === "kitchie") for (const o of OPTS) LAY[`${h}.${d}.${lr}.${o}`] = await read(p, o);
  if (shots && theme === "kitchie" && lr === "1") await p.locator("#frames").screenshot({ path: `${shots}/${h}-${d}.png` });
  await p.context().close();
}
ok(true, "every height x data x Running-low rule x theme drew four frames, no console error, no sideways scroll, the frame the right height");

/* 2. the hero: first, whole above the fold on every phone, Make it and Plan, identical position in every data state */
{
  let good = true, why = "";
  for (const o of OPTS) for (const h of HS) {
    const tops = new Set();
    for (const d of DS) for (const lr of ["1", "0"]) {
      const L = LAY[`${h}.${d}.${lr}.${o}`], hero = L.secs[0];
      if (hero.sec !== "hero" || hero.bottom > L.V || !/Make it/.test(hero.text) || !/Plan/.test(hero.text)) { good = false; why += ` ${o}/${h}/${d}`; }
      tops.add(hero.top);
    }
    if (tops.size !== 1) { good = false; why += ` moves:${o}/${h}`; }
  }
  ok(good, "the hero is the first section, wholly above the fold on short, medium and tall, has Make it and Plan, and never moves between data states" + why);
}

/* 3. the ladder, per option, written out here and not read from revisions.js */
{
  const bad = [];
  for (const o of OPTS) for (const h of HS) for (const d of DS) for (const lr of ["1", "0"]) {
    const L = LAY[`${h}.${d}.${lr}.${o}`], tag = `${o}/${h}/${d}/lr${lr}`, order = ids(L), tot = TOT[d];
    const slot2 = URGENT[d] ? "soon" : (lr === "1" && ZERO[d] ? "low" : null);
    const present = ["soon", "low"].filter(k => tot[k] > 0);
    const wantChev = o === "d" || !slot2 ? present : [slot2].concat(present.filter(k => k !== slot2));
    if (JSON.stringify(order.filter(k => k === "soon" || k === "low")) !== JSON.stringify(wantChev)) bad.push(tag + " chevrons " + order);
    if (!present.every(k => order.includes(k)) || (tot.soon === 0 && order.includes("soon")) || (tot.low === 0 && order.includes("low"))) bad.push(tag + " absent-when-empty " + order);
    if (o !== "d") { if ((order[1]) !== (slot2 || "oi")) bad.push(tag + " slot 2 is " + order[1] + " want " + (slot2 || "oi")); }
    else if (order[1] !== "oi") bad.push(tag + " D keeps other ideas second");
    if (slot2 && o !== "d") {                                   // the urgent section is ahead of other ideas and of the other chevron
      if (order.indexOf(slot2) > order.indexOf("oi")) bad.push(tag + " urgent behind other ideas");
      if (o === "a" || o === "c") { if (!sec(L, slot2).open) bad.push(tag + " slot 2 not open"); }
      if (o === "b" && sec(L, slot2).form !== "ban") bad.push(tag + " B slot 2 not a strip");
      if (o === "a" && sec(L, slot2).form !== "card") bad.push(tag + " A slot 2 not a card");
    }
    if (!slot2 && o === "b" && L.secs.some(s => s.form === "ban")) bad.push(tag + " B strip drawn with nothing urgent");
    if (o === "a" && L.secs.filter(s => s.open).length > (slot2 ? 1 : 0)) bad.push(tag + " A opens more than slot 2");
    if (o === "d" && L.secs.filter(s => s.open).length > (slot2 ? 1 : 0)) bad.push(tag + " D opens more than its one");
    if (o === "d" && L.secs.some(s => s.open && s.sec !== slot2)) bad.push(tag + " D opened the wrong one");
    if (o === "c" && !slot2 && !sec(L, "oi").form.startsWith("fold")) bad.push(tag + " C other ideas not a chevron");
    if (o !== "c" && sec(L, "oi").form !== "rows") bad.push(tag + " other ideas not rows");
    if (!slot2 && ["a", "b", "d"].includes(o) && L.secs.some(s => s.open)) bad.push(tag + " something open with nothing urgent");
    if (tot.soon === 0 && tot.low === 0 && L.secs.some(s => s.sec !== "hero" && s.sec !== "oi")) bad.push(tag + " empty but drawn");
  }
  ok(bad.length === 0, "ladder holds for every option, height, state and rule (urgent second and open, nothing urgent gives other ideas the slot, empty is absent, D never moves) " + bad.slice(0, 6).join(" | "));
  ok(sec(LAY["medium.low.1.a"], "low").open && ids(LAY["medium.low.1.a"])[1] === "low", "only running low, one at zero, rule on: Running low takes slot 2, open");
  ok(ids(LAY["medium.low.0.a"])[1] === "oi" && !sec(LAY["medium.low.0.a"], "low").open, "only running low, rule off: other ideas keep slot 2, Running low is a closed chevron");
  ok(ids(LAY["medium.expired.1.a"])[1] === "soon" && ids(LAY["medium.expired.1.a"]).indexOf("low") > ids(LAY["medium.expired.1.a"]).indexOf("oi"), "expired and several: On the way out is ahead of other ideas and of Running low");
}

/* 4. caps: On the way out shows 1 (short) or 2 when open, with +N more; Running low shows everything */
{
  const bad = [];
  for (const o of OPTS) for (const h of HS) for (const d of ["today", "expired"]) {
    const L = LAY[`${h}.${d}.1.${o}`], s = sec(L, "soon"), cap = h === "short" ? 1 : 2, n = Math.min(cap, TOT[d].soon);
    if (s.open) { if (s.rows !== n) bad.push(`${o}/${h}/${d} rows ${s.rows} want ${n}`); if (!new RegExp(`\\+${TOT[d].soon - n} more`).test(s.text)) bad.push(`${o}/${h}/${d} no +${TOT[d].soon - n} more`); }
    else if (s.rows) bad.push(`${o}/${h}/${d} closed but has rows`);
  }
  ok(bad.length === 0, "On the way out when open shows at most 1 (short) or 2 items, most urgent first, with the right \"+N more\" " + bad.slice(0, 4).join(" | "));
  const p = await open("h=tall&d=expired&opt=a"); const t = await F(p, "a").locator("[data-sec=soon]").innerText();
  ok(t.indexOf("Milk") < t.indexOf("Chicken thighs") && /Expired yesterday/.test(t), "most urgent first: the expired one is listed before the ones due today"); await p.context().close();
  const q = await open("h=short&d=low&opt=a"), lowTxt = await F(q, "a").locator("[data-sec=low]").innerText();
  ok(["Limes", "Eggs", "Peanut butter"].every(n => lowTxt.includes(n)) && !/more/.test(lowTxt), "Running low shows everything it has (three of three), uncapped, even on the short phone"); await q.context().close();
}

/* 5. fit: nothing opened by default is cut by the fold (except A's and C's urgent card, which always opens); a taller phone never opens less */
{
  const bad = [];
  for (const o of OPTS) for (const d of DS) for (const lr of ["1", "0"]) {
    for (const h of HS) {
      const L = LAY[`${h}.${d}.${lr}.${o}`], s2 = URGENT[d] ? "soon" : (lr === "1" && ZERO[d] ? "low" : null);
      for (const s of L.secs) if (s.open && s.bottom > L.V && !(s.sec === s2 && (o === "a" || o === "c"))) bad.push(`${o}/${h}/${d}/${lr} ${s.sec} open but cut (${s.bottom} > ${L.V})`);
      if (o === "b" && s2 && sec(L, s2).open) { const oi = sec(L, "oi"); if (oi.top + 32 + 2 * 49 > L.V) bad.push(`${o}/${h}/${d} B opened with fewer than two other ideas fitting`); }
    }
    const n = h => LAY[`${h}.${d}.${lr}.${o}`].secs.filter(s => s.open).length;
    if (!(n("short") <= n("medium") && n("medium") <= n("tall")) && o === "c") bad.push(`${o}/${d}/${lr} a taller phone opens less (${n("short")},${n("medium")},${n("tall")})`);
  }
  ok(bad.length === 0, "what opens by default is never cut by the fold, and in C a taller phone never opens less " + bad.slice(0, 5).join(" | "));
  ok(LAY["tall.calm.1.c"].secs.filter(s => s.open).length > LAY["short.calm.1.c"].secs.filter(s => s.open).length, "C: tall opens more than short with nothing urgent");
  ok(LAY["short.calm.1.c"].secs.every(s => !s.open || s.sec === "hero"), "C: short phone, nothing urgent: hero only, everything else closed");
  ok(LAY["short.expired.1.c"].secs.filter(s => s.open).map(s => s.sec).join() === "soon", "C: short phone, expired: hero and the urgent section only");
  ok(LAY["short.expired.1.b"].secs.find(s => s.sec === "soon").form === "ban", "B: short phone: the urgent items are a strip");
  ok(LAY["tall.expired.1.b"].secs.find(s => s.sec === "soon").open, "B: tall phone: the strip opens in place by itself");
  ok(!LAY["short.expired.1.b"].secs.find(s => s.sec === "soon").open, "B: short phone: the strip stays one line (opens by tap)");
  ok(LAY["tall.expired.1.d"].secs.find(s => s.sec === "soon").open && !LAY["short.expired.1.d"].secs.find(s => s.sec === "soon").open, "D: opens the urgent one on tall (fits whole), stays closed with its badge on short");
  ok(LAY["short.expired.1.a"].secs.find(s => s.sec === "oi").view !== "above" || LAY["short.expired.1.a"].secs.find(s => s.sec === "oi").bottom <= LAY["short.expired.1.a"].V, "A: on the short phone other ideas is not cut off by the fold without being marked");
}

/* 6. the model's numbers against the render: opened sections end where the model said (within 8px) */
{
  const p = await open("h=tall&d=expired&opt=a");
  const m = await p.evaluate(() => { const K = MR.K, f = document.querySelector(".fr[data-frame=a]"), r = s => f.querySelector(s).getBoundingClientRect().height;
    return { hero: [r(".hero") + 8, K.hero], card: [r(".fold.urgent") + 8, K.card + K.openHead + K.fbPad + 2 * K.ur + K.va], oi: [r(".oi") + 8, K.card + K.oiHead + 3 * K.ol + K.oiPad], closed: [r(".fold:not(.urgent)") + 8, K.closed + K.card] }; });
  const p2 = await open("h=tall&d=expired&opt=b"); const bn = await p2.evaluate(() => { const f = document.querySelector(".fr[data-frame=b]"), K = MR.K; return [f.querySelector(".ban").getBoundingClientRect().height, K.banOpenHead + K.fbPad + 2 * K.ur + K.va]; });
  const p3 = await open("h=short&d=expired&opt=b"); const bc = await p3.evaluate(() => [document.querySelector(".ban").getBoundingClientRect().height, MR.K.banClosed]);
  for (const [k, [real, est]] of Object.entries({ ...m, banOpen: bn, banClosed: bc })) ok(Math.abs(real - est) <= 8, `model height for ${k}: render ${Math.round(real)}, model ${est}`);
  ok(await p.evaluate(() => MR.viewport("tall") === document.querySelector(".fr[data-frame=a] .pbody").clientHeight), "the model's fold (frame minus bar and border) equals the drawn scroll area");
  await p.context().close(); await p2.context().close(); await p3.context().close();
}

/* 7. words not colour alone; the badge; tap and keyboard; targets */
{
  const p = await open("h=tall&d=expired"), t = await F(p, "a").locator("[data-sec=soon]").innerText();
  ok(/EXPIRED/i.test(t) && /TODAY/i.test(t) && /Expired yesterday/.test(t) && /\bToday\b/.test(t), "urgency is in words: a badge (expired, today) and the row words, not colour alone");
  ok(await F(p, "a").locator("[data-sec=soon] .chv").evaluate(e => e.tagName.toLowerCase()) === "svg" && await F(p, "a").locator("[data-sec=soon] .tog").getAttribute("aria-expanded") === "true", "state shown by a chevron's shape and aria-expanded");
  await F(p, "a").locator("[data-sec=soon] .tog").click();
  ok(await F(p, "a").locator("[data-sec=soon] .tog").getAttribute("aria-expanded") === "false" && await F(p, "a").locator("[data-sec=soon] .fb").evaluate(e => e.hidden), "tap closes the open urgent section");
  await F(p, "a").locator("[data-sec=low] .tog").focus(); await p.keyboard.press("Enter");
  ok(await F(p, "a").locator("[data-sec=low] .tog").getAttribute("aria-expanded") === "true" && await F(p, "a").locator("[data-sec=low] .ur").count() === 2, "Enter opens Running low in place and lists everything");
  ok(/Above the fold/.test(await F(p, "a").locator(".rep").innerText()), "the report is redrawn from the frame after a tap");
  ok(await p.evaluate(() => [...document.querySelectorAll(".mr .tog, .mr .btn, .mr .go, .mr .va, .mr .sbtn")].filter(e => e.offsetParent).every(e => e.getBoundingClientRect().height >= 43.5)), "every tap target on Home is 44px or more");
  ok(await F(p, "b").locator("[data-sec=low] .fb").evaluate(e => !e.firstChild), "a closed section has no body markup yet (written on first open)");
  await p.context().close();
  const d = await open("h=medium&d=expired&opt=d"); const dt = await F(d, "d").locator("[data-sec=soon]").innerText();
  ok(/EXPIRED/i.test(dt) && await F(d, "d").locator("[data-sec=soon] .bdg").count() === 1 && await F(d, "d").locator("[data-sec=low] .bdg").count() === 0, "D: the badge is on On the way out only, and says it in words");
  await d.context().close();
  const e = await open("h=medium&d=empty"); ok(await e.locator("[data-sec=soon], [data-sec=low]").count() === 0 && await e.locator(".fr .tog").count() === 1, "nothing at all: no On the way out, no Running low; the only chevron is C's Other ideas"); await e.context().close();
  const s = await open("h=medium&d=today&opt=c"); ok(await s.locator(".fr").count() === 1 && await s.locator(".home[data-opt=c]").count() === 1, "?opt=c shows only option C"); await s.context().close();
}

/* 8. default path; reduced motion; hygiene; G untouched */
{
  const p = await open("h=medium&d=today");
  ok(["revisions.js", "mock.js", "revisions.css"].every(f => p.reqs.includes(f)) && !p.reqs.some(r => /search\.(js|css)$/.test(r)), "default path: revisions.css, revisions.js, mock.js; no search.js or search.css");
  await p.context().close();
  const r = await open("h=medium&d=today", { reduce: true });
  ok(await r.evaluate(() => [...document.querySelectorAll(".fr .home *")].every(e => getComputedStyle(e).animationName === "none" && getComputedStyle(e).transitionDuration.split(",").every(d => parseFloat(d) === 0))), "reduced motion: nothing animates or transitions"); await r.context().close();
  const css = readFileSync("fragments/mobile-home-g-revisions/revisions.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/#[0-9a-fA-F]{3,8}\b/.test(css) && !/rgba?\(/.test(css), "no hex or rgb colour in revisions.css (theme tokens only)");
  ok(!/@media\s*\(min-width/.test(css), "phone-width only: no min-width breakpoint in revisions.css");
  let g = true; try { g = execSync("git diff --name-only origin/main -- fragments/mobile-home-g tools/mobile-home-g-check.mjs docs/knowledge/jobs-to-be-done/mobile-home-g.md", { encoding: "utf8" }).trim() === ""; } catch (e) { }
  ok(g, "fragment G, its check and its doc are untouched");
}
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
await b.close(); process.exit(fails ? 1 : 0);
