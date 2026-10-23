// Behaviour and layout check for fragment mobile-home-g-revisions, round 2 (headless Chromium). Prints PASS or FAIL per check.
// Usage:  python3 -m http.server 8123 &   then   node tools/mobile-home-g-revisions-check.mjs [--shots=shots/mobile-home-g-revisions]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers (round 1, kept or adapted): every phone height x data state x theme draws three frames, no console error, no sideways scroll; the hero is first, whole above the fold, with Make it and Plan, never moves;
// the ladder per option written out independently of revisions.js; caps ("+N more", Running low uncapped); fit (nothing opened by default is cut by the fold, a taller phone never opens less); words not colour alone;
// tap and keyboard; 44px targets; the model's height numbers against the render; default path; reduced motion; no hex colour; phone-only; fragment G untouched. Option D is retired and asserted gone.
// Round 2 adds: urgency = consequence + neglect restated independently, the ranking replacing the time-of-day order, Running low taking slot 2 when its consequence is worse, the countdown window changing urgency
// while the date label stays honest, the expired and off-today warning on the hero and on More ideas rows, expiring stock as its own idea, scrolling never changing state,
// More ideas open has no label and continues the hero as one card (MR-P26), the chevron header only when closed,
// drag-to-reveal with mouse and with touch (sections open in sequence, no shift under the thumb, a tap still toggles, tap-only mode, keyboard path, reduced motion), and the session (kept within a sitting, reset after a gap).
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const BASE = process.env.BASE || "http://localhost:8123/fragments/mobile-home-g-revisions/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const HS = ["short", "medium", "tall"], HPX = { short: 600, medium: 740, tall: 844 }, OPTS = ["a", "b", "c"];

/* ---- the model, written out here and not read from revisions.js. soon: [name, hours to go (negative = expired), on a plan, days ignored]; low: [name, none left, a planned meal needs it]. ---- */
const NOW = 14;
const M = {
  calm:    { soon: [["Chicken thighs", 30, 0, 0], ["Cucumbers", 56, 0, 0], ["Spinach", 80, 0, 0]], low: [["Limes", 0, 0], ["Peanut butter", 0, 0]] },
  window:  { soon: [["Chicken thighs", 9, 0, 0], ["Cucumbers", 16, 0, 0], ["Spinach", 50, 0, 0]], low: [["Limes", 0, 0], ["Peanut butter", 0, 0]] },
  neglect: { soon: [["Chicken thighs", 30, 0, 3], ["Cucumbers", 56, 0, 0], ["Spinach", 40, 1, 3]], low: [["Limes", 0, 0], ["Peanut butter", 0, 0]] },
  today:   { soon: [["Chicken thighs", 3, 0, 0], ["Cucumbers", 20, 0, 0], ["Spinach", 44, 0, 0]], low: [["Limes", 0, 0], ["Peanut butter", 0, 0]] },
  expired: { soon: [["Milk", -20, 0, 0], ["Chicken thighs", 3, 0, 0], ["Cucumbers", 5, 0, 0], ["Spinach", 20, 0, 0], ["Yoghurt", 40, 0, 0]], low: [["Limes", 0, 0], ["Peanut butter", 0, 0]] },
  heroexp: { soon: [["Milk", -20, 0, 0], ["Yoghurt", 30, 0, 0], ["Spinach", 56, 0, 0]], low: [["Limes", 0, 0], ["Peanut butter", 0, 0]] },
  lowride: { soon: [["Milk", -20, 0, 0], ["Spinach", 40, 0, 0]], low: [["Limes", 1, 1], ["Eggs", 0, 0], ["Peanut butter", 0, 0]] },
  onlylow: { soon: [], low: [["Limes", 1, 0], ["Eggs", 0, 0], ["Peanut butter", 0, 0]] },
  empty:   { soon: [], low: [] }
};
const DS = Object.keys(M);
const itemScore = ([, h, plan, ign], n) => (h < 0 ? 60 : h <= n ? 50 : h <= 48 ? (plan ? 10 : 20) : 5) + (plan ? 0 : Math.min(ign, 3) * 15);
const lowScore = ([, zero, rides]) => (rides && zero ? 90 : rides ? 55 : zero ? 50 : 5);
function expect(d, n = 6) {
  const s = M[d], sc = { soon: s.soon.length ? Math.max(...s.soon.map(x => itemScore(x, n))) : -1, low: s.low.length ? Math.max(...s.low.map(lowScore)) : -1, oi: 30 };
  const rank = ["soon", "low", "oi"].filter(k => sc[k] >= 0).sort((a, c) => sc[c] - sc[a]);
  return { sc, rank, urgent: k => k !== "oi" && sc[k] >= 50, tot: { soon: s.soon.length, low: s.low.length } };
}
const labelOf = h => { const d = Math.floor((NOW + h) / 24); return h < 0 ? (d < -1 ? `Expired ${-d} days ago` : d < 0 ? "Expired yesterday" : "Went off today") : d === 0 ? "Today" : d === 1 ? "Tomorrow" : `in ${d} days`; };

async function open(q, { theme = "kitchie", reduce = false, touch = false, vh = 1000 } = {}) {
  const c = await b.newContext({ viewport: { width: 1700, height: vh }, reducedMotion: reduce ? "reduce" : "no-preference", hasTouch: touch });
  await c.addInitScript(t => { if (!sessionStorage.getItem("__i")) { localStorage.setItem("theme", t); sessionStorage.setItem("__i", "1"); } }, theme);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text())) p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*\/mobile-home-g-revisions\//, "").replace(/\?.*$/, "")));
  await p.goto(BASE + "?" + q); await p.waitForSelector("body[data-ready]:not([data-ready=''])", { state: "attached" }); await p.waitForTimeout(120); return p;
}
const F = (p, o) => p.locator(`.fr[data-frame=${o}]`);
const settle = p => p.waitForTimeout(380);
// the layout, read from the drawn frame
const read = (p, o) => F(p, o).evaluate(fr => { const body = fr.querySelector(".pbody"), br = body.getBoundingClientRect();
  return { V: body.clientHeight, secs: [...fr.querySelectorAll("[data-sec]")].map(s => { const r = s.getBoundingClientRect(); return { sec: s.dataset.sec, form: s.dataset.form || "hero", open: s.dataset.open === "true", urgent: s.dataset.urgent === "true", score: +s.dataset.score, view: s.dataset.view, top: Math.round(r.top - br.top), bottom: Math.round(r.bottom - br.top), rows: s.querySelectorAll(".ur").length, text: s.innerText, warn: s.dataset.warn || "" }; }) }; });
// DOM order, except that an OPEN More ideas sits under the hero by design (MR-P26): put it back in its rank slot (before the first section scoring under its 30) so the ranking checks still read the rank
const ids = L => { const a = L.secs.map(s => s.sec), o = L.secs.find(s => s.sec === "oi"); if (o && o.open && a[1] === "oi") { a.splice(1, 1); let i = 1; while (i < a.length && sec(L, a[i]).score >= 30) i++; a.splice(i, 0, "oi"); } return a; };
const sec = (L, k) => L.secs.find(s => s.sec === k);
const openMap = (p, o) => F(p, o).evaluate(fr => Object.fromEntries([...fr.querySelectorAll(".fold")].map(s => [s.dataset.sec, s.dataset.open])));

// MR-P26: what More ideas looks like in a frame (null when the frame has none)
const probe = (p, o) => F(p, o).evaluate(fr => {
  const rest = fr.querySelector(".mr-rest"), kids = [...rest.children], hero = fr.querySelector("[data-sec=hero]"), oi = fr.querySelector("[data-sec=oi]"); if (!oi) return null;
  const tog = oi.querySelector(".tog"), hr = hero.getBoundingClientRect(), r = oi.getBoundingClientRect(), tr = tog.getBoundingClientRect(), vis = e => { const c = getComputedStyle(e); return c.display !== "none" && c.visibility !== "hidden" && e.getBoundingClientRect().width > 2; };
  return { open: oi.dataset.open === "true", after: kids.indexOf(oi) - kids.indexOf(hero), label: vis(oi.querySelector(".tt")) && /More ideas/.test(oi.querySelector(".tt").innerText), rows: oi.querySelectorAll(".ol").length, gap: Math.round(r.top - hr.bottom), dx: Math.round(Math.abs(r.left - hr.left) + Math.abs(r.width - hr.width)),
    tb: Math.round(r.bottom - tr.bottom), th: Math.round(tr.height), exp: tog.getAttribute("aria-expanded"), ctl: tog.getAttribute("aria-controls") === oi.querySelector(".fb").id, hl: oi.querySelector(".hl") && vis(oi.querySelector(".hl")), heroExt: hero.classList.contains("has-ext")};
});

/* 1. every combination draws; no errors; no sideways scroll; the frame is the height asked for; D is retired */
const LAY = {};
for (const theme of ["kitchie", "kitchie-day"]) for (const h of HS) for (const d of DS) {
  if (theme === "kitchie-day" && h === "medium") continue;
  const p = await open(`h=${h}&d=${d}`, { theme });
  const tag = `${theme} ${h}/${d}`;
  if (await p.locator(".fr").count() !== 3 || await F(p, "d").count() !== 0 || p.errs.length || !await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth) ||
      !await p.evaluate(px => [...document.querySelectorAll(".pf")].every(e => Math.round(e.getBoundingClientRect().height) === px && e.querySelector(".pbody").scrollWidth <= 391), HPX[h])) ok(false, `${tag}: three frames (D retired), no errors, no sideways scroll, ${HPX[h]}px high ${p.errs.join(";")}`);
  if (theme === "kitchie") for (const o of OPTS) { const L = LAY[`${h}.${d}.${o}`] = await read(p, o); L.__pr = await probe(p, o); }
  if (shots && theme === "kitchie") await p.locator("#frames").screenshot({ path: `${shots}/${h}-${d}.png` });
  await p.context().close();
}
ok(true, "every height x data state x theme drew three frames (A, B, C; D is gone), no console error, no sideways scroll, the frame the right height");
{ const p = await open("opt=d&h=medium&d=calm"); ok(await p.locator(".fr").count() === 3, "?opt=d falls back to all three (D retired)"); await p.context().close(); }

/* 2. the hero: first, whole above the fold on every phone, Make it and Plan, identical top in every data state */
{
  let good = true, why = "";
  for (const o of OPTS) for (const h of HS) {
    const tops = new Set();
    for (const d of DS) {
      const L = LAY[`${h}.${d}.${o}`], hero = L.secs[0];
      if (hero.sec !== "hero" || hero.bottom > L.V || !/Make it/.test(hero.text) || !/Plan/.test(hero.text)) { good = false; why += ` ${o}/${h}/${d}`; }
      tops.add(hero.top);
    }
    if (tops.size !== 1) { good = false; why += ` moves:${o}/${h}`; }
  }
  ok(good, "the hero is the first section, wholly above the fold on short, medium and tall, has Make it and Plan, and never moves between data states" + why);
}

/* 3. the ranking, per option, height and state, against the independent model (replaces the time-of-day order) */
{
  const bad = [];
  for (const o of OPTS) for (const h of HS) for (const d of DS) {
    const L = LAY[`${h}.${d}.${o}`], tag = `${o}/${h}/${d}`, E = expect(d), order = ids(L).slice(1);
    if (ids(L)[0] !== "hero") bad.push(tag + " hero not first");
    if (JSON.stringify(order) !== JSON.stringify(E.rank)) bad.push(`${tag} order ${order} want ${E.rank}`);
    if (E.tot.soon === 0 && order.includes("soon") || E.tot.low === 0 && order.includes("low")) bad.push(tag + " empty section drawn");
    for (const k of E.rank) {
      const s = sec(L, k);
      if (s.score !== E.sc[k]) bad.push(`${tag} ${k} score ${s.score} want ${E.sc[k]}`);
      if (s.urgent !== E.urgent(k)) bad.push(`${tag} ${k} urgent ${s.urgent}`);
    }
    E.rank.forEach((k, i) => {
      const s = sec(L, k), want = o === "a" ? (E.urgent(k) ? "card" : "fold") : o === "b" ? (i === 0 && E.urgent(k) ? "ban" : "fold") : "fold";
      if (s.form !== want) bad.push(`${tag} ${k} form ${s.form} want ${want}`);
    });
    if (o !== "b") for (const k of E.rank) if (E.urgent(k) && !sec(L, k).open) bad.push(`${tag} urgent ${k} not open`);
  }
  ok(bad.length === 0, "ranking holds for every option, height and state: hero first, then sections by score (ties On the way out, Running low, More ideas), empty ones absent, urgent opens in A and C, forms right " + bad.slice(0, 6).join(" | "));
  const rk = (d, h = "medium", o = "c") => ids(LAY[`${h}.${d}.${o}`]).slice(1).join(">");
  ok(rk("calm") === "oi>soon>low", `nothing urgent: More ideas, then a calm On the way out, then plain Running low (got ${rk("calm")})`);
  ok(rk("expired") === "soon>oi>low", "expired and several: On the way out is slot 2, More ideas next, plain Running low last");
  ok(rk("lowride") === "low>soon>oi", "Running low rides on a planned meal and is gone: it takes slot 2 AHEAD of On the way out");
  ok(rk("onlylow") === "low>oi", "only running low, one at zero: Running low is urgent and ranks above More ideas");
  ok(rk("empty") === "oi" && LAY["medium.empty.c"].secs.length === 2, "nothing at all: only the hero and More ideas are drawn");
  ok(!sec(LAY["medium.calm.c"], "low").urgent && !/\bout\b|needed/i.test(sec(LAY["medium.calm.c"], "low").text), "plain low, nothing riding on it: background, no badge, not urgent");
  ok(!sec(LAY["medium.calm.c"], "soon").urgent, "expiring tomorrow, not ignored, outside the window: On the way out is not urgent");
}

/* 4. urgency = consequence + neglect */
{
  const p = await open("h=tall&d=neglect&opt=c"), L = await read(p, "c"), E = expect("neglect"), t = L.secs.find(s => s.sec === "soon").text;
  ok(ids(L).slice(1)[0] === "soon" && E.sc.soon === 65 && sec(L, "soon").urgent && /ignored/i.test(t), "ignored for 3 days: goes off tomorrow yet On the way out ranks first as urgent, and says ignored");
  ok(/Chicken thighs[\s\S]*Tomorrow/.test(t) && !/Today/.test(t.split("Spinach")[0] || ""), "the ignored item is still labelled Tomorrow (neglect does not change the date)");
  ok(E.sc.soon > itemScore(["Spinach", 40, 1, 3], 6), "restated: the same ignoring on an item on a plan adds nothing (spinach 10, chicken 65)");
  await p.context().close();
  const c = await open("h=tall&d=calm&opt=c"); ok(!sec(await read(c, "c"), "soon").urgent, "the same chicken, not ignored: not urgent (calm)"); await c.context().close();
  const lr = await open("h=tall&d=lowride&opt=a"), t2 = await F(lr, "a").locator("[data-sec=low]").innerText();
  ok(/OUT/i.test(t2) && /needed/i.test(t2), "Running low gone and needed by a plan: the badge says so in words"); await lr.context().close();
}

/* 5. the countdown window: a visible control; it changes urgency; the date label stays honest */
{
  const p = await open("h=tall&d=window&opt=c");
  ok(await p.locator("#win").getAttribute("type") === "range" && await p.locator("#win").inputValue() === "6" && /guess/i.test(await p.locator("#winHelp").innerText()), "a countdown control is on the page, default 6 h, flagged as a guess");
  const bad = [];
  for (const n of [0, 3, 6, 8, 9, 12, 15, 16, 18, 24, 48]) {
    await p.locator("#win").fill(String(n)); await p.waitForTimeout(160);
    const L = await read(p, "c"), E = expect("window", n);
    if (JSON.stringify(ids(L).slice(1)) !== JSON.stringify(E.rank)) bad.push(`n=${n} order ${ids(L).slice(1)} want ${E.rank}`);
    if (sec(L, "soon").urgent !== E.urgent("soon")) bad.push(`n=${n} urgent ${sec(L, "soon").urgent}`);
    if (E.urgent("soon") && !new RegExp(`in ${n}h`, "i").test(sec(L, "soon").text)) bad.push(`n=${n} badge missing "in ${n}h"`);
  }
  ok(bad.length === 0, "moving the window changes urgency exactly as the independent model says (0 to 48 h), and the badge names the window " + bad.slice(0, 4).join(" | "));
  await p.locator("#win").fill("6"); await p.waitForTimeout(160);
  ok(!sec(await read(p, "c"), "soon").urgent, "window 6 h: chicken (9 h, Today 23:00) is not urgent");
  await p.locator("#win").fill("12"); await p.waitForTimeout(160);
  ok(sec(await read(p, "c"), "soon").urgent && ids(await read(p, "c"))[1] === "soon", "window 12 h: chicken is urgent and On the way out is slot 2");
  await p.locator("#win").fill("18"); await p.waitForTimeout(160);
  const t = await F(p, "c").locator("[data-sec=soon]").innerText();
  ok(/Tomorrow 06:00/.test(t) && /Today 23:00/.test(t) && !/Today 06:00/.test(t), "window 18 h: cucumbers go off at 06:00 tomorrow, are urgent, and the label says Tomorrow 06:00, never today");
  ok(/2 in 18h/i.test(t), "window 18 h: the badge counts both items inside the window");
  const labels = await p.evaluate(() => { const r = []; for (let h = -60; h <= 130; h++) r.push([h, MR.dueText(h)]); return r; });
  ok(labels.every(([h, s]) => s.startsWith(labelOf(h))), "the date label for every hour from -60 to +130 comes from the calendar day (Today only for today, Tomorrow only for tomorrow)");
  const day = await p.evaluate(() => [...document.querySelectorAll(".fr[data-frame=c] .ur[data-h]")].map(e => [+e.dataset.h, e.querySelector(".tg").innerText]));
  ok(day.length > 0 && day.every(([h, s]) => s.startsWith(labelOf(h))), "every rendered On the way out row starts with the honest label for its hour");
  await p.context().close();
}

/* 6. the expired and off-today warning; expiring stock as its own idea */
{
  const warnOf = async (q, o = "c") => { const p = await open(q); const w = await F(p, o).locator(".hero").evaluate(h => ({ warn: h.dataset.warn || "", alarm: !!h.querySelector(".why.alarm"), svg: !!h.querySelector(".why.alarm svg.alr"), text: h.querySelector(".why").innerText, vis: h.querySelector(".why.alarm") ? getComputedStyle(h.querySelector(".why.alarm svg")).color : "" })); await p.context().close(); return w; };
  const e = await warnOf("h=tall&d=heroexp");
  ok(e.warn === "expired" && e.alarm && e.svg && /Check this is still OK/.test(e.text) && /milk/.test(e.text) && /yesterday/.test(e.text), "hero built on expired milk stays eligible and carries a red alert mark and \"Check this is still OK: uses milk that went off yesterday\"");
  const t = await warnOf("h=tall&d=today");
  ok(t.warn === "today" && t.alarm && t.svg && /chicken that goes off today at 17:00/.test(t.text), "hero using chicken that goes off today carries the alert and \"uses chicken that goes off today at 17:00\"");
  const w = await warnOf("h=tall&d=window&n=6");
  ok(w.warn === "today" && /Uses chicken that goes off today at 23:00/.test(w.text), "off today is by the calendar day, not the window: chicken at 23:00 warns even with the window at 6 h");
  const c = await warnOf("h=tall&d=calm"), l = await warnOf("h=tall&d=lowride"), o = await warnOf("h=tall&d=onlylow");
  ok(!c.warn && !c.alarm && /tomorrow/.test(c.text) && !l.alarm && !o.alarm, "no warning when nothing is expired or off today: tomorrow is never alarmed (calm, ignoring the window), nor a hero with no expiring stock");
  const p = await open("h=tall&d=window&n=48"); ok(await F(p, "c").locator(".hero").evaluate(h => !!h.querySelector(".why.alarm")), "window 48 h: the warning still follows the calendar rule (the hero's chicken goes off today)"); await p.context().close();
  const q = await open("h=tall&d=expired&opt=c"); await F(q, "c").locator("[data-sec=oi] .tog").click(); await settle(q);
  const rows = await F(q, "c").locator("[data-sec=oi] .ol").evaluateAll(r => r.map(x => ({ w: x.dataset.warn || "", t: x.innerText, svg: !!x.querySelector("svg.alr") })));
  ok(rows[0] && rows[0].w === "expired" && /Rice pudding/.test(rows[0].t) && /Check first/.test(rows[0].t) && rows[0].svg, "expiring stock is its own idea in More ideas: Rice pudding (expired milk) first, with the alert mark and the words Check first");
  ok(rows[1] && rows[1].w === "today" && /Off today/.test(rows[1].t) && rows[1].svg, "...then the idea for the cucumbers that go off today, warned in words");
  await q.context().close();
  const r = await open("h=tall&d=window&opt=c"); await F(r, "c").locator("[data-sec=oi] .tog").click().catch(() => { }); await settle(r);
  const txt = await F(r, "c").locator("[data-sec=oi]").innerText();
  ok(/Cucumber and spring onion salad/.test(txt), "expiring stock appears in More ideas even when it is not urgent (the cucumber salad)"); await r.context().close();
}

/* 7. caps: On the way out shows 1 (short) or 2 when open, with +N more; Running low shows everything */
{
  const bad = [];
  for (const o of ["a", "c"]) for (const h of HS) for (const d of ["today", "expired"]) {
    const L = LAY[`${h}.${d}.${o}`], s = sec(L, "soon"), cap = h === "short" ? 1 : 2, n = Math.min(cap, M[d].soon.length);
    if (s.open) { if (s.rows !== n) bad.push(`${o}/${h}/${d} rows ${s.rows} want ${n}`); if (!new RegExp(`\\+${M[d].soon.length - n} more`).test(s.text)) bad.push(`${o}/${h}/${d} no +${M[d].soon.length - n} more`); }
    else if (s.rows) bad.push(`${o}/${h}/${d} closed but has rows`);
  }
  ok(bad.length === 0, "On the way out when open shows at most 1 (short) or 2 items, most urgent first, with the right \"+N more\" " + bad.slice(0, 4).join(" | "));
  const p = await open("h=tall&d=expired&opt=a"); const t = await F(p, "a").locator("[data-sec=soon]").innerText();
  ok(t.indexOf("Milk") < t.indexOf("Chicken thighs") && /Expired yesterday/.test(t), "most urgent first: the expired one is listed before the ones due today"); await p.context().close();
  const q = await open("h=short&d=onlylow&opt=a"), lowTxt = await F(q, "a").locator("[data-sec=low]").innerText();
  ok(["Limes", "Eggs", "Peanut butter"].every(n => lowTxt.includes(n)) && !/more/.test(lowTxt), "Running low shows everything it has (three of three), uncapped, even on the short phone"); await q.context().close();
}

/* 8. fit: what opens by default is a prefix of the ranking, never cut by the fold (except an urgent section in A and C); a taller phone never opens less; scrolling changes nothing */
{
  const bad = [];
  for (const o of OPTS) for (const d of DS) {
    for (const h of HS) {
      const L = LAY[`${h}.${d}.${o}`], E = expect(d);
      for (const s of L.secs) if (s.open && s.bottom > L.V && !(E.urgent(s.sec) && o !== "b")) bad.push(`${o}/${h}/${d} ${s.sec} open but cut (${s.bottom} > ${L.V})`);
      const nonU = E.rank.filter(k => !(E.urgent(k) && o !== "b")), opens = nonU.map(k => sec(L, k).open);
      if (opens.some((x, i) => x && opens.slice(0, i).some(y => !y))) bad.push(`${o}/${h}/${d} a lower-ranked section opened while a higher one stayed closed`);
    }
    const n = h => LAY[`${h}.${d}.${o}`].secs.filter(s => s.open).length;
    if (!(n("short") <= n("medium") && n("medium") <= n("tall"))) bad.push(`${o}/${d} a taller phone opens less (${n("short")},${n("medium")},${n("tall")})`);
  }
  ok(bad.length === 0, "what opens by default follows the ranking, is never cut by the fold (urgent in A and C excepted), and a taller phone never opens less " + bad.slice(0, 5).join(" | "));
  const cnt = (h, d, o) => LAY[`${h}.${d}.${o}`].secs.filter(s => s.open).length;
  ok(cnt("tall", "calm", "c") > cnt("short", "calm", "c") && cnt("short", "calm", "c") === 0, "C: tall opens more than short; short with nothing urgent opens none (hero only)");
  ok(LAY["short.expired.c"].secs.filter(s => s.open).map(s => s.sec).join() === "soon", "C: short phone, expired: only the urgent section opens");
  ok(LAY["short.expired.b"].secs.find(s => s.sec === "soon").form === "ban" && !LAY["short.expired.b"].secs.find(s => s.sec === "soon").open, "B: short phone: the urgent items are a strip that stays one line");
  ok(LAY["tall.expired.b"].secs.find(s => s.sec === "soon").open, "B: tall phone: the strip opens in place by itself");
  ok(LAY["medium.lowride.a"].secs.filter(s => s.open).map(s => s.sec).join() === "low,soon", "two urgent sections (A): both open, in rank order");
  const p = await open("h=short&d=expired&opt=c"), before = await openMap(p, "c");
  await F(p, "c").locator(".pbody").hover(); await p.mouse.wheel(0, 400); await p.waitForTimeout(150);
  const st = await F(p, "c").locator(".pbody").evaluate(e => e.scrollTop);
  ok(st > 0 && JSON.stringify(await openMap(p, "c")) === JSON.stringify(before), `scrolling the frame (scrollTop ${st}) never changes what is open or closed`); await p.context().close();
}

/* 9. the model's numbers against the render (within 8px) */
{
  const p = await open("h=tall&d=expired&opt=a");
  const m = await p.evaluate(() => { const K = MR.K, f = document.querySelector(".fr[data-frame=a]"), r = s => f.querySelector(s).getBoundingClientRect().height;
    return { heroWarn: [r(".hero") + 8, K.hero + K.heroWarn], card: [r(".fold.urgent") + 8, K.card + K.openHead + K.fbPad + 2 * K.ur + K.va], closed: [r(".fold[data-open=false]:not(.urgent)") + 8, K.closed + K.card] }; });
  const c = await open("h=tall&d=calm&opt=c"); const mc = await c.evaluate(() => { const K = MR.K, f = document.querySelector(".fr[data-frame=c]"), r = s => f.querySelector(s).getBoundingClientRect().height; return { hero: [r(".hero") + 8, K.hero], oiOpen: [r("[data-sec=oi]") + 8, K.card + K.openHead + K.fbPad + 3 * K.ol] }; });
  const l = await open("h=tall&d=lowride&opt=a"); const ml = await l.evaluate(() => { const K = MR.K, f = document.querySelector(".fr[data-frame=a]"); return { lowOpen: [f.querySelector("[data-sec=low]").getBoundingClientRect().height + 8, K.card + K.openHead + K.fbPad + 3 * K.ur + K.va] }; });
  const p2 = await open("h=tall&d=expired&opt=b"); const bn = await p2.evaluate(() => { const f = document.querySelector(".fr[data-frame=b]"), K = MR.K; return [f.querySelector(".ban").getBoundingClientRect().height, K.banOpenHead + K.fbPad + 2 * K.ur + K.va]; });
  const p3 = await open("h=short&d=expired&opt=b"); const bc = await p3.evaluate(() => [document.querySelector(".ban").getBoundingClientRect().height, MR.K.banClosed]);
  for (const [k, [real, est]] of Object.entries({ ...m, ...mc, ...ml, banOpen: bn, banClosed: bc })) ok(Math.abs(real - est) <= 8, `model height for ${k}: render ${Math.round(real)}, model ${est}`);
  ok(await p.evaluate(() => MR.viewport("tall") === document.querySelector(".fr[data-frame=a] .pbody").clientHeight), "the model's fold (frame minus bar and border) equals the drawn scroll area");
  for (const x of [p, c, l, p2, p3]) await x.context().close();
}

/* 10. words not colour alone; aria; tap and keyboard; targets; the report */
{
  const p = await open("h=tall&d=expired"), t = await F(p, "a").locator("[data-sec=soon]").innerText();
  ok(/EXPIRED/i.test(t) && /IN 6H/i.test(t) && /Expired yesterday/.test(t) && /\bToday\b/.test(t), "urgency is in words: a badge (expired, in 6h) and the row words, not colour alone");
  ok(await F(p, "a").locator("[data-sec=soon] .chv").evaluate(e => e.tagName.toLowerCase()) === "svg" && await F(p, "a").locator("[data-sec=soon] .tog").getAttribute("aria-expanded") === "true", "state shown by a chevron's shape and aria-expanded");
  ok(await p.evaluate(() => [...document.querySelectorAll(".fr .tog")].every(b => b.getAttribute("aria-expanded") === "true" || b.getAttribute("aria-expanded") === "false")), "every header carries aria-expanded");
  await F(p, "a").locator("[data-sec=soon] .tog").click(); await settle(p);
  ok(await F(p, "a").locator("[data-sec=soon] .tog").getAttribute("aria-expanded") === "false" && await F(p, "a").locator("[data-sec=soon] .fb").evaluate(e => e.hidden), "tap closes the open urgent section");
  ok(/closed/.test(await F(p, "a").locator(".hv-live").innerText()), "a live region announces the change (On the way out closed)");
  await F(p, "a").locator("[data-sec=low] .tog").focus(); await p.keyboard.press("Enter"); await settle(p);
  ok(await F(p, "a").locator("[data-sec=low] .tog").getAttribute("aria-expanded") === "true" && await F(p, "a").locator("[data-sec=low] .ur").count() === 2, "Enter opens Running low in place and lists everything");
  await p.keyboard.press("Space"); await settle(p);
  ok(await F(p, "a").locator("[data-sec=low] .tog").getAttribute("aria-expanded") === "false", "Space closes it again (the non-gesture path)");
  ok(/Ranking:/.test(await F(p, "a").locator(".rep").innerText()) && /Above the fold/.test(await F(p, "a").locator(".rep").innerText()), "the report shows the ranking and is redrawn from the frame after a tap");
  ok(await p.evaluate(() => [...document.querySelectorAll(".mr .tog, .mr .btn, .mr .go, .mr .va, .mr .sbtn")].filter(e => e.offsetParent).every(e => e.getBoundingClientRect().height >= 43.5)), "every tap target on Home is 44px or more");
  ok(await F(p, "b").locator("[data-sec=low] .fb").evaluate(e => !e.firstChild), "a closed section has no body markup yet (written on first open)");
  await p.context().close();
  const e = await open("h=medium&d=empty&opt=c"); ok(await e.locator("[data-sec=soon], [data-sec=low]").count() === 0 && await e.locator(".fr .tog").count() === 1, "nothing at all: no On the way out, no Running low; the only chevron is More ideas"); await e.context().close();
  const s = await open("h=medium&d=today&opt=c"); ok(await s.locator(".fr").count() === 1 && await s.locator(".home[data-opt=c]").count() === 1, "?opt=c shows only option C"); await s.context().close();
}

/* 11. animation: the height animates when motion is allowed and settles to nothing left behind */
{
  const p = await open("h=short&d=calm&opt=c"), tog = F(p, "c").locator("[data-sec=soon] .tog");
  await tog.click(); await p.waitForTimeout(40);
  const mid = await F(p, "c").locator("[data-sec=soon] .fb").evaluate(e => ({ h: e.style.height, tr: e.style.transition }));
  await settle(p);
  const end = await F(p, "c").locator("[data-sec=soon] .fb").evaluate(e => ({ css: e.style.cssText, hidden: e.hidden, h: e.getBoundingClientRect().height }));
  ok(/height/.test(mid.tr) && end.css === "" && !end.hidden && end.h > 60, "opening animates the height (inline transition while moving) and leaves no inline style behind");
  await p.context().close();
}

/* 12. drag to reveal, with a mouse. All closed (short phone, nothing urgent): press the LOWEST header, drag up over the two above it. */
const heads = (p, o) => F(p, o).evaluate(fr => [...fr.querySelectorAll(".fold .tog")].map(t => { const r = t.getBoundingClientRect(); return { sec: t.closest(".fold").dataset.sec, x: r.left + 60, y: r.top + r.height / 2, top: r.top }; }));
const state = (p, o) => F(p, o).evaluate(fr => ({ open: Object.fromEntries([...fr.querySelectorAll(".fold")].map(s => [s.dataset.sec, s.dataset.open === "true"])), st: fr.querySelector(".pbody").scrollTop, log: MR.LOG.filter(l => l.via === "drag").map(l => l.sec) }));
const headTop = (p, o, k) => F(p, o).evaluate((fr, k) => fr.querySelector(`.fold[data-sec=${k}] .tog`).getBoundingClientRect().top, k);
async function dragUp(p, o, fromSec, steps, { touch = false, cdp = null, pause = 18 } = {}) {
  const H = await heads(p, o), a = H.find(h => h.sec === fromSec), tops = [], seen = [];
  if (touch) await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: a.x, y: a.y }] }); else { await p.mouse.move(a.x, a.y); await p.mouse.down(); }
  let y = a.y;
  for (let i = 0; i < steps; i++) {
    y -= 10;
    if (touch) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: a.x, y }] }); else await p.mouse.move(a.x, y);
    await p.waitForTimeout(pause);
    // the header under the finger now: while the finger rests on it, its top must not move as its section opens
    const under = (await heads(p, o)).find(h => y >= h.top && y <= h.top + 57);
    if (under && !seen.includes(under.sec)) { seen.push(under.sec); await p.waitForTimeout(380); tops.push([under.sec, under.top, await headTop(p, o, under.sec)]); }
  }
  await p.waitForTimeout(400);
  if (touch) await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); else await p.mouse.up();
  await p.waitForTimeout(150);
  return { tops, seen };
}
{
  const p = await open("h=short&d=calm&opt=c", { vh: 2000 });
  ok(await p.locator("#dragSw button[aria-pressed=true]").innerText().then(t => /Drag up/.test(t)), "the gesture is a switch on the page, on by default (Tap only is the other)");
  ok((await heads(p, "c")).map(h => h.sec).join() === "oi,soon,low" && Object.values((await state(p, "c")).open).every(v => !v), "start: all three closed, ranked More ideas, On the way out, Running low");
  ok(await F(p, "c").locator("[data-sec=low] .tog").evaluate(e => getComputedStyle(e).touchAction) === "none" && await F(p, "c").locator(".hero").evaluate(e => getComputedStyle(e).touchAction) === "auto", "only a header takes the gesture (touch-action none); the hero and the rest scroll as normal");
  const r = await dragUp(p, "c", "low", 14), s = await state(p, "c");
  ok(JSON.stringify(s.log) === JSON.stringify(["low", "soon", "oi"]), `one continuous drag up from the lowest header opens the sections in sequence, bottom to top (got ${s.log})`);
  ok(Object.values(s.open).every(Boolean) && await F(p, "c").locator(".fold .tog[aria-expanded=true]").count() === 3, "all three are open and aria-expanded says so after the drag");
  ok(r.tops.length >= 3 && r.tops.every(([, t0, t1]) => Math.abs(t0 - t1) <= 1.5), `no jumpy shift under the thumb: the header under the finger kept its place while its section opened (${r.tops.map(x => x.map(v => typeof v === "number" ? Math.round(v) : v).join(":")).join(" ")})`);
  ok(s.st === 0, "scroll position unchanged by the drag (anchoring preserved)");
  ok(Object.values((await state(p, "c")).open).every(Boolean), "releasing does not toggle anything back (the click after a drag is swallowed)");
  await p.close();
  const q = await open("h=short&d=calm&opt=c", { vh: 2000 }); await dragUp(q, "c", "soon", 8);
  const s2 = await state(q, "c"); ok(JSON.stringify(s2.log) === JSON.stringify(["soon", "oi"]) && !s2.open.low, "starting on the middle header: it and the one above open, the one below stays closed");
  await q.context().close();
  const t = await open("h=short&d=calm&opt=c", { vh: 2000 }); const hd = (await heads(t, "c")).find(h => h.sec === "soon");
  await t.mouse.click(hd.x, hd.y); await settle(t);
  ok((await state(t, "c")).open.soon === true && (await state(t, "c")).log.length === 0, "a plain tap on a header still toggles it (open)"); await t.mouse.click(hd.x, hd.y); await settle(t);
  ok((await state(t, "c")).open.soon === false, "...and a second tap closes it");
  await t.mouse.move(hd.x, hd.y); await t.mouse.down(); await t.mouse.move(hd.x, hd.y + 20, { steps: 4 }); await t.mouse.up(); await settle(t);
  ok(Object.values((await state(t, "c")).log).length === 0, "dragging DOWN on a header does not open the drag path");
  await t.context().close();
}

/* 13. drag to reveal with touch (CDP touch events become touch pointer events); tap-only mode; keyboard; reduced motion */
{
  const p = await open("h=short&d=calm&opt=c", { vh: 2000, touch: true }), cdp = await p.context().newCDPSession(p);
  const r = await dragUp(p, "c", "low", 14, { touch: true, cdp }), s = await state(p, "c");
  ok(JSON.stringify(s.log) === JSON.stringify(["low", "soon", "oi"]), `touch: the same continuous drag opens the sections in sequence (got ${s.log})`);
  ok(r.tops.length >= 3 && r.tops.every(([, t0, t1]) => Math.abs(t0 - t1) <= 1.5) && s.st === 0, "touch: no shift under the thumb, scroll position kept");
  await p.context().close();
  const q = await open("h=short&d=calm&opt=c&dg=0", { vh: 2000 });
  ok(await q.locator("#dragSw button[aria-pressed=true]").innerText().then(t => /Tap only/.test(t)) && await F(q, "c").locator("[data-sec=low] .tog").evaluate(e => getComputedStyle(e).touchAction) !== "none", "tap-only mode: the switch says so and headers take no gesture (touch-action is not none)");
  await dragUp(q, "c", "low", 14); ok(Object.values((await state(q, "c")).open).every(v => !v) && (await state(q, "c")).log.length === 0, "tap-only: a drag up opens nothing");
  const hd = (await heads(q, "c")).find(h => h.sec === "low"); await q.mouse.click(hd.x, hd.y); await settle(q);
  ok((await state(q, "c")).open.low === true, "tap-only: a tap still opens");
  await q.locator("#dragSw button[data-dg='1']").click(); await q.waitForTimeout(100);
  ok(await F(q, "c").locator(".home").getAttribute("data-drag") === "on" && await F(q, "c").locator("[data-sec=low] .tog").evaluate(e => getComputedStyle(e).touchAction) === "none", "switching the gesture on live arms the headers without a redraw");
  await q.context().close();
  const k = await open("h=short&d=calm&opt=c", { vh: 2000 }); await F(k, "c").locator("[data-sec=oi] .tog").focus(); await k.keyboard.press("Enter"); await settle(k);
  ok((await state(k, "c")).open.oi === true && await F(k, "c").locator("[data-sec=oi] .tog").getAttribute("aria-expanded") === "true", "gesture on: the keyboard path (Enter on a header) still works, with aria-expanded"); await k.context().close();
  const m = await open("h=short&d=calm&opt=c", { vh: 2000, reduce: true }); await dragUp(m, "c", "low", 14);
  const sm = await state(m, "c"); ok(JSON.stringify(sm.log) === JSON.stringify(["low", "soon", "oi"]), "reduced motion: the drag still opens the sections in sequence");
  ok(await F(m, "c").locator(".fb").evaluateAll(a => a.every(e => e.style.cssText === "")), "reduced motion: no height animation is used (nothing inline), the sections just open");
  await m.context().close();
}

/* 14. session: a manual open or close is kept within a sitting (hop away 1 min) and forgotten after a real gap (45 min) */
{
  const u = await open("h=short&d=calm&opt=c");
  const unit = await u.evaluate(() => { const s = MR.session(30); s.set("c", "low", true); s.leave(10); const kept = !s.enter(11) && s.get("c").low === true; s.leave(20); const reset = s.enter(50); return { kept, reset, gone: Object.keys(s.get("c")).length === 0, edge: (() => { const t = MR.session(30); t.set("c", "oi", true); t.leave(0); return t.enter(29.99) === false && (t.set("c", "oi", true), t.leave(0), t.enter(30) === true); })() }; });
  ok(unit.kept && unit.reset && unit.gone && unit.edge, "session unit: kept after 1 min, reset after 45 min, the boundary is 30 min");
  await u.context().close();
  const p = await open("h=short&d=calm&opt=c", { vh: 2000 });
  await F(p, "c").locator("[data-sec=low] .tog").click(); await settle(p);
  ok((await state(p, "c")).open.low === true, "setup: opened Running low by hand (the default was closed)");
  await p.locator("#away1").click(); await p.waitForTimeout(200);
  ok((await openMap(p, "c")).low === "true" && /Kept/.test(await p.locator("#sessMsg").innerText()), "hop away 1 min and back: the manual open is kept, and the page says so");
  await p.locator("#away45").click(); await p.waitForTimeout(200);
  ok((await openMap(p, "c")).low === "false" && /Forgotten/.test(await p.locator("#sessMsg").innerText()), "away 45 min and back: reset to the computed default (closed), and the page says so");
  await p.close();
  const q = await open("h=short&d=expired&opt=c", { vh: 2000 });
  ok((await openMap(q, "c")).soon === "true", "setup: the urgent section is open by default");
  await F(q, "c").locator("[data-sec=soon] .tog").click(); await settle(q); await q.locator("#away1").click(); await q.waitForTimeout(200);
  ok((await openMap(q, "c")).soon === "false", "a manual CLOSE of a default-open section is also kept within the sitting");
  await q.locator("#away45").click(); await q.waitForTimeout(200);
  ok((await openMap(q, "c")).soon === "true", "...and the urgent section reopens after a real gap");
  await q.locator("#gap").fill("60"); await q.locator("#gap").dispatchEvent("change");
  await F(q, "c").locator("[data-sec=soon] .tog").click(); await settle(q); await q.locator("#away45").click(); await q.waitForTimeout(200);
  ok((await openMap(q, "c")).soon === "false", "with the gap set to 60 min, 45 min away is still the same sitting");
  await q.context().close();
}

/* 16. MR-P26 (owner decision): More ideas OPEN has no label, its rows continue the hero as one card; the chevron header exists only when closed; the same button collapses it */
{
  const bad = [], badC = [];
  for (const o of OPTS) for (const h of HS) for (const d of DS) {
    const L = LAY[`${h}.${d}.${o}`], pr = L.__pr, t = `${o}/${h}/${d}`; if (!pr) continue;
    if (pr.open) {
      if (pr.after !== 1) bad.push(t + " open: not directly under the hero"); if (pr.label) bad.push(t + " open: a More ideas label is visible"); if (pr.gap > 1 || pr.gap < -1) bad.push(t + ` open: gap to hero ${pr.gap}px`);
      if (pr.dx > 1) bad.push(t + " open: not the hero's width"); if (pr.exp !== "true" || !pr.ctl) bad.push(t + " open: aria on the control"); if (pr.th < 43.5 || Math.abs(pr.tb) > 1) bad.push(t + ` open: collapse bar ${pr.th}px high, ${pr.tb}px from the card's bottom edge`); if (!pr.heroExt) bad.push(t + " open: hero not marked as continued");
    } else { if (!pr.label) badC.push(t + " closed: header label missing"); if (pr.exp !== "false") badC.push(t + " closed: aria-expanded"); if (pr.hl) badC.push(t + " closed: the hide label shows"); }
  }
  ok(bad.length === 0, "More ideas OPEN, every option, height and state: no label, directly under the hero, same width, rows flush to the hero, a 44px collapse bar on the card's bottom edge, aria-expanded true " + bad.slice(0, 4).join(" | "));
  ok(badC.length === 0, "More ideas CLOSED, every option, height and state: the chevron header with its label and count, aria-expanded false " + badC.slice(0, 4).join(" | "));
  ok(Object.values(LAY).some(l => l.__pr && l.__pr.open) && Object.values(LAY).some(l => l.__pr && !l.__pr.open), "the sweep covers both open and closed More ideas");

  /* tap and keyboard: open, no label, focus stays on the same button, collapse again from the card's bottom edge */
  for (const o of OPTS) {
    const p = await open(`h=short&d=expired&opt=${o}`, { vh: 2000 }), tog = F(p, o).locator("[data-sec=oi] .tog");
    const before = await probe(p, o); ok(before && !before.open && before.label && before.after > 1, `${o}: short phone, expired: More ideas starts closed as a labelled header in its ranked slot (slot ${before && before.after})`);
    await tog.focus(); await p.keyboard.press("Enter"); await settle(p);
    const mid = await probe(p, o), foc = await p.evaluate(() => document.activeElement && document.activeElement.className + "|" + document.activeElement.closest("[data-sec]").dataset.sec);
    ok(mid.open && mid.after === 1 && !mid.label && mid.rows === 2 && mid.exp === "true", `${o}: Enter opens it: no label, directly under the hero, the two short-phone rows (${JSON.stringify(mid)})`);
    ok(/^tog\|oi$/.test(foc), `${o}: focus stays on the same control after opening (${foc})`);
    ok(await F(p, o).locator("[data-sec=oi] .ol .m.w").count() >= 1 && await F(p, o).locator("[data-sec=oi] .ol svg.alr").count() >= 1, `${o}: the expired-ingredient warning is still on the idea row when it continues the hero`);
    const nOpen = await F(p, o).getByRole("button", { name: "Hide more ideas", exact: true }).count(), nOld = await F(p, o).getByRole("button", { name: /^More ideas/ }).count();
    ok(nOpen === 1 && nOld === 0, `${o}: in the accessibility tree the open control is named for what it does ("Hide more ideas"), and no "More ideas" label remains (${nOpen}/${nOld})`);
    await p.keyboard.press("Enter"); await settle(p);
    const aft = await probe(p, o), foc2 = await p.evaluate(() => document.activeElement.className + "|" + document.activeElement.closest("[data-sec]").dataset.sec);
    ok(!aft.open && aft.label && aft.after === before.after && aft.exp === "false" && /^tog\|oi$/.test(foc2), `${o}: Enter on the bar collapses it back to the labelled header in its ranked slot, focus kept (${JSON.stringify(aft)})`);
    await tog.click(); await settle(p); ok((await probe(p, o)).open, `${o}: a tap on the header opens it`);
    await p.mouse.click(...(await tog.evaluate(e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }))); await settle(p);
    ok(!(await probe(p, o)).open, `${o}: a tap on the bar at the card's bottom edge collapses it`);
    const w = await openMap(p, o); ok(JSON.stringify(Object.keys(w)) !== "[]", `${o}: the other sections are still there`);
    await p.context().close();
  }
  /* B with a strip: hero, open More ideas, then the strip fused to the bottom of the stack */
  { const p = await open("h=medium&d=expired&opt=b", { vh: 2000 }); await F(p, "b").locator("[data-sec=oi] .tog").click(); await settle(p);
    const r = await F(p, "b").evaluate(fr => { const k = [...fr.querySelector(".mr-rest").children]; return { order: k.map(e => e.dataset.sec), heroBan: k[0].classList.contains("has-ban"), oiBan: k[1].classList.contains("has-ban"), ban: k.filter(e => e.classList.contains("ban")).length, gap: Math.round(k[2].getBoundingClientRect().top - k[1].getBoundingClientRect().bottom) }; });
    ok(r.order.join() === "hero,oi,soon,low" && !r.heroBan && r.oiBan && r.ban === 1 && Math.abs(r.gap) <= 1, `B: with the strip, More ideas opens between the hero and the strip and the stack stays one fused card (${JSON.stringify(r)})`);
    await F(p, "b").locator("[data-sec=oi] .tog").click(); await settle(p);
    const r2 = await F(p, "b").evaluate(fr => [...fr.querySelector(".mr-rest").children].map(e => e.dataset.sec + (e.classList.contains("has-ban") ? "*" : "")).join()); ok(r2 === "hero*,soon,oi,low", `B: closing it puts the strip back against the hero and More ideas back in its slot (${r2})`);
    await p.context().close(); }
  /* a closed header can still be reached by the drag, and the result is the same continuation */
  { const p = await open("h=short&d=calm&opt=c", { vh: 2000 }); await dragUp(p, "c", "low", 14); const pr = await probe(p, "c"), st = await state(p, "c");
    ok(pr.open && pr.after === 1 && !pr.label && JSON.stringify(st.log) === JSON.stringify(["low", "soon", "oi"]), "drag-to-reveal still opens all three; More ideas ends up as the hero's continuation without a label"); await p.context().close(); }
  /* session memory: a manual open of More ideas survives a hop away and is forgotten after a gap; tall phones open it by default and a manual close is kept */
  { const p = await open("h=short&d=calm&opt=c", { vh: 2000 }); await F(p, "c").locator("[data-sec=oi] .tog").click(); await settle(p);
    await p.locator("#away1").click(); await p.waitForTimeout(250); const k = await probe(p, "c"); ok(k.open && k.after === 1 && !k.label, "session: a manual open of More ideas is kept after a short hop, still as the hero's continuation");
    await p.locator("#away45").click(); await p.waitForTimeout(250); const g = await probe(p, "c"); ok(!g.open && g.label, "session: after a real gap it is a closed labelled header again"); await p.close(); }
  /* On the way out and Running low keep their labelled headers when open */
  { const p = await open("h=tall&d=lowride&opt=a", { vh: 2000 }); const t = await F(p, "a").locator("[data-sec=low] .tt").innerText(), u = await F(p, "a").locator("[data-sec=soon] .tt").innerText();
    ok(/Running low/.test(t) && /On the way out/.test(u) && await F(p, "a").locator("[data-sec=low][data-open=true], [data-sec=soon][data-open=true]").count() >= 1, "On the way out and Running low keep their labelled headers, open or closed"); await p.context().close(); }
}

/* 15. default path; reduced motion; hygiene; G untouched */
{
  const p = await open("h=medium&d=today");
  ok(["revisions.js", "mock.js", "revisions.css"].every(f => p.reqs.includes(f)) && !p.reqs.some(r => /search\.(js|css)$/.test(r)), "default path: revisions.css, revisions.js, mock.js; no search.js or search.css");
  await p.context().close();
  const r = await open("h=medium&d=today", { reduce: true });
  ok(await r.evaluate(() => [...document.querySelectorAll(".fr .home *")].every(e => getComputedStyle(e).animationName === "none" && getComputedStyle(e).transitionDuration.split(",").every(d => parseFloat(d) === 0))), "reduced motion: nothing animates or transitions"); await r.context().close();
  const css = readFileSync("fragments/mobile-home-g-revisions/revisions.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/#[0-9a-fA-F]{3,8}\b/.test(css) && !/rgba?\(/.test(css), "no hex or rgb colour in revisions.css (theme tokens only)");
  ok(!/@media\s*\(min-width/.test(css), "phone-width only: no min-width breakpoint in revisions.css");
  ok(/prefers-reduced-motion:\s*reduce/.test(css), "revisions.css honours prefers-reduced-motion");
  let g = true; try { g = execSync("git diff --name-only origin/main -- fragments/mobile-home-g tools/mobile-home-g-check.mjs docs/knowledge/jobs-to-be-done/mobile-home-g.md", { encoding: "utf8" }).trim() === ""; } catch (e) { }
  ok(g, "fragment G, its check and its doc are untouched");
}
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
await b.close(); process.exit(fails ? 1 : 0);
