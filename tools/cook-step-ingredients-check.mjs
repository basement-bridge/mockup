// Behaviour and layout check for the per-step ingredients fragment, headless Chromium. Mockup only.
// Usage:  python3 -m http.server 8123 &   then   node tools/cook-step-ingredients-check.mjs   (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const BASE = process.env.BASE || "http://localhost:8123/fragments/cook-step-ingredients/";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await pw.chromium.launch(); const errs = [];
for (const [w, mode] of [[360, "light"], [390, "dark"], [1024, "dark"], [1280, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: mode });
  const p = await ctx.newPage(); p.setDefaultTimeout(4000); p.on("pageerror", e => errs.push(e.message)); await p.goto(BASE, { waitUntil: "networkidle" }); const t = "w" + w + " ";
  const txt = id => p.locator(id).innerText();
  const goStep = async n => { for (let i = 0; i < 9; i++) { const m = /Step (\d+) of/i.exec(await txt("#pa .bigstep .lbl")); const cur = m ? +m[1] : n; if (cur === n) return; await p.click(cur < n ? "#pa .act .next" : "#pa .act .nb:not(.next)"); } };
  ok(t + "no sideways scroll", await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  const phone = w < 1024; // the desktop frames are hidden below 1024
  if (phone) {
  // Treatment 0 ("Before") is the open Still to come list; the settled rules CSI-15..19 are checked on it, then 1..3 below (CSI-22..26).
  ok(t + "default treatment is 1 (Next line), recommended", (await p.locator('.ctl [data-stc="1"]').getAttribute("aria-pressed")) === "true" && (await p.locator('#pa .rsA').getAttribute("data-stc")) === "1");
  await p.click('.ctl [data-stc="0"]');
  // A (phone) starts on step 2: split chicken (final use), explicit oil (rest in 3, 7), unknown salt
  let a = await txt("#pa .cu");
  ok(t + "A callout names the three ingredients", /chicken breast/.test(a) && /\boil\b/.test(a) && /salt/.test(a), a);
  const rows = await p.$$eval("#pa .cu li", ls => ls.map(l => ({ nm: l.querySelector(".nm").textContent, q: l.querySelector(".qt").textContent, go: (l.querySelector(".go [aria-hidden]") || { textContent: "" }).textContent })));
  const row = n => rows.find(r => r.nm.startsWith(n));
  ok(t + "A oil: 1 tbsp and chip \u2192 3, 7", row("oil").q === "1 tbsp" && row("oil").go === "\u2192 3, 7", rows);
  ok(t + "A chicken: this step's portion, final use so no chip", row("chicken breast").q === "1" && row("chicken breast").go === "", rows);
  ok(t + "A salt: no quantity means nothing on the right, no filler", row("salt").q === "" && row("salt").go === "" && !/to taste|not given|\u2013|quantity absent/i.test(a), rows);
  ok(t + "A no prose sentence for the split (no 'left for', 'already used in', 'of 2')", !/left for|already used in|\d of \d/.test(a), a);
  ok(t + "A shows only this step's items (no rice)", !/rice/.test(a));
  const lay = await p.evaluate(() => { const l = document.querySelector("#pa .cu li:nth-child(2)"), n = l.querySelector(".nm"), q = l.querySelector(".qt"), c = document.querySelector("#pa .cu").getBoundingClientRect(), qr = q.getBoundingClientRect();
    return { nmW: +getComputedStyle(n).fontWeight, qW: +getComputedStyle(q).fontWeight, left: n.getBoundingClientRect().left < qr.left, qRight: c.right - qr.right, h: c.height, rowH: l.getBoundingClientRect().height, fixed: getComputedStyle(document.querySelector("#pa .cu")).height }; });
  ok(t + "A name heavier than quantity, name left of quantity", lay.nmW >= 700 && lay.qW <= 500 && lay.left, lay);
  ok(t + "A callout is dense and content-sized (3 rows under 130px, rows under 34px)", lay.h < 130 && lay.rowH < 34, lay);
  const chipTxt = await p.$$eval("#pa .go", g => g.map(x => (x.querySelector("[aria-hidden]") || { textContent: "" }).textContent.replace(/\s+/g, " ").trim()).filter(Boolean));
  ok(t + "A chips are short tags, never sentences", chipTxt.length > 0 && chipTxt.every(c => c.length < 40 && !/left|already/.test(c)), chipTxt);
  // Still to come: ordered by what the next steps need; roomy shows all five
  const stc = await p.$$eval("#pa .rsA ul:first-of-type li", ls => ls.map(l => l.querySelector(".go [aria-hidden]").textContent.replace(/\D+/, " ").trim()));
  ok(t + "A still to come is ordered by the next step that needs it", stc.length === 5 && stc.map(x => +x.split(" ")[0]).every((v, i, arr) => i === 0 || v >= arr[i - 1]), stc);
  ok(t + "A roomy: all five shown, no +N more", (await p.locator("#pa .rsA ul:first-of-type li").count()) === 5 && (await p.locator("#pa [data-rest]").count()) === 0);
  for (const room of ["photo", "long", "small"]) {
    await p.click('.ctl [data-room="' + room + '"]');
    ok(t + "A tight (" + room + "): three shown, +2 more behind a button", (await p.locator("#pa .rsA ul:first-of-type li").count()) === 3 && /^\+2 more$/.test((await txt("#pa [data-rest]")).trim()));
  }
  await p.click('.ctl [data-room="photo"]'); await p.click("#pa [data-rest]");
  ok(t + "A +N more expands in place to five", (await p.locator("#pa .rsA ul:first-of-type li").count()) === 5);
  await p.click('.ctl [data-room="roomy"]');
  // scaling 4 -> 8: step 4 soy sauce is the rest (6 total, 2 used earlier) and has no chip; already used folded
  await p.click('[data-sv="2"]'); await p.click('[data-sv="2"]'); await p.click('#pa [data-go="2"]'); await p.click('#pa [data-go="3"]');
  a = await txt("#pa .cu"); ok(t + "scale 8: step 4 soy sauce shows 4 tbsp, final use, no chip", /soy sauce\s+4 tbsp/.test(a) && !/\u2192/.test((await p.locator("#pa .cu li", { hasText: "soy" }).innerText())), a);
  await p.click('[data-sv="-2"]'); await p.click('[data-sv="-2"]');
  // Already used: a quiet collapsed row, closed by default, opens on tap
  ok(t + "Already used is a collapsed row with a count", (await p.locator("#pa details.used").getAttribute("open")) === null && /^Already used \(\d+\)$/.test((await txt("#pa details.used > summary")).trim()));
  ok(t + "Already used list is hidden by default", (await p.locator("#pa details.used li:visible").count()) === 0 && !/Already used/.test(await txt("#pa .rsA .lbl")));
  const sb = await p.locator("#pa details.used > summary").boundingBox(); ok(t + "Already used row is a 44px tap target", sb.height >= 43.5, sb);
  await p.click("#pa details.used > summary"); ok(t + "Already used opens on tap and shows names with step tags", (await p.locator("#pa details.used li:visible").count()) > 0 && /step \d/.test(await txt("#pa details.used")));
  await p.click("#pa details.used > summary");
  // ---- Phone treatments of Still to come (CSI-22..26): ?stc=1 Next line, 2 Summary row, 3 Inline names ----
  const contrast = sel => p.evaluate(s => { const rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number).map(x => /^color\(srgb/.test(c) ? x * 255 : x), lum = a => { const f = a.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
    const el = document.querySelector(s); let bg = el; while (bg && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(bg).backgroundColor)) bg = bg.parentElement; const a = lum(rgb(getComputedStyle(el).color)), b = lum(rgb(getComputedStyle(bg).backgroundColor)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }, sel);
  const quiet = async (v, tag) => { // the callout leads: the rest has no fill, no accent, small muted type
    const q = await p.evaluate(() => { const cu = document.querySelector("#pa .cu"), rs = document.querySelector("#pa .rsA"), all = [...rs.querySelectorAll("*")].filter(e => e.getBoundingClientRect().width > 0);
      const fills = all.filter(e => !/rgba\(0, 0, 0, 0\)/.test(getComputedStyle(e).backgroundColor)).map(e => e.className.toString() || e.tagName);
      const accent = getComputedStyle(cu).borderLeftColor, bar = all.filter(e => getComputedStyle(e).borderTopColor === accent && parseFloat(getComputedStyle(e).borderTopWidth) > 0 || getComputedStyle(e).borderLeftColor === accent && parseFloat(getComputedStyle(e).borderLeftWidth) > 0).map(e => e.className.toString());
      const big = Math.max(...[...cu.querySelectorAll(".nm")].map(e => parseFloat(getComputedStyle(e).fontSize))), txt = all.filter(e => e.children.length === 0 && e.textContent.trim()).map(e => parseFloat(getComputedStyle(e).fontSize));
      return { leads: cu.getBoundingClientRect().top < rs.getBoundingClientRect().top, fills, bar, big, maxSmall: Math.max(...txt), rsH: rs.getBoundingClientRect().height, cuH: cu.getBoundingClientRect().height }; });
    ok(t + tag + " callout comes first and the rest has no fill and no accent bar or accent chips", q.leads && q.fills.length === 0 && q.bar.length === 0, q);
    ok(t + tag + " rest is small (13px) next to the 16px callout names", q.maxSmall <= 13 && q.big >= 16, q);
    return q; };
  for (const v of ["1", "2", "3"]) {
    await p.goto(BASE + "?stc=" + v, { waitUntil: "networkidle" }); const tg = "stc" + v + ": ";
    ok(t + tg + "?stc=" + v + " selects the treatment and its control", (await p.locator('.ctl [data-stc="' + v + '"]').getAttribute("aria-pressed")) === "true" && (await p.locator("#pa .rsA").getAttribute("data-stc")) === v);
    const q = await quiet(v, tg);
    ok(t + tg + "collapsed rest is quieter than the callout in height" + (v === "3" ? " (under the callout)" : " (one 44px row)"), v === "3" ? q.rsH < q.cuH : q.rsH <= 50, q);
    if (v === "1") {
      ok(t + tg + "one line naming only the next step's ingredients", /^Next · step 3\s*oil$/.test((await txt("#pa .stcrow")).replace(/\s+/g, " ").trim()) && !/soy|garlic|rice|egg/.test(await txt("#pa .rsA")));
      const sb = await p.locator("#pa .stcrow").boundingBox(); ok(t + tg + "Next row is a 44px tap target", sb.height >= 43.5, sb);
      ok(t + tg + "not colour alone: arrow glyph, words 'Next · step n', chevron", (await p.locator("#pa .stcrow svg").count()) === 2 && /Next/.test(await txt("#pa .stcrow")));
      ok(t + tg + "closed by default, no list", (await p.locator("#pa .stcrow").getAttribute("aria-expanded")) === "false" && (await p.locator("#pa .stcp").count()) === 0);
      await p.click("#pa .stcrow"); const id = await p.locator("#pa .stcrow").getAttribute("aria-controls");
      ok(t + tg + "opens in place to all five, linked by aria-controls", (await p.locator("#pa .stcp li").count()) === 5 && (await p.locator("#" + id).count()) === 1 && (await p.locator("#pa .stcrow").getAttribute("aria-expanded")) === "true");
      await quiet(v, tg + "open ");
      await p.click("#pa .stcrow"); ok(t + tg + "closes again", (await p.locator("#pa .stcp").count()) === 0);
      await p.click('#pa [data-go="2"]'); await p.click('#pa [data-go="3"]');
      ok(t + tg + "skips a step with no ingredients: step 4 says 'Next · step 6'", /^Next · step 6\s*eggs$/.test((await txt("#pa .stcrow")).replace(/\s+/g, " ").trim()), await txt("#pa .stcrow"));
      await p.click('#pa [data-go="4"]'); await p.click('#pa [data-go="5"]'); await p.click('#pa [data-go="6"]');
      ok(t + tg + "last step: nothing left, no row", (await p.locator("#pa .stcrow").count()) === 0 && (await p.locator("#pa details.used").count()) === 1);
      await p.click('#pa [data-go="5"]');
      await p.click('.ctl [data-room="photo"]'); await p.click('#pa [data-go="0"]').catch(() => {}); await goStep(2); await p.click("#pa .stcrow");
      ok(t + tg + "tight: opened list is three plus '+n more'", (await p.locator("#pa .stcp li").count()) === 3 && /^\+\d more$/.test((await txt("#pa .stcp [data-rest]")).trim()));
      await p.click('.ctl [data-room="roomy"]');
    }
    if (v === "2") {
      ok(t + tg + "a fold like Already used: 'Still to come (5)', closed, list hidden", /^Still to come \(5\)$/.test((await txt("#pa details.stc > summary")).trim()) && (await p.locator("#pa details.stc").getAttribute("open")) === null && (await p.locator("#pa details.stc li:visible").count()) === 0);
      const sb = await p.locator("#pa details.stc > summary").boundingBox(); ok(t + tg + "summary row is a 44px tap target", sb.height >= 43.5, sb);
      await p.click("#pa details.stc > summary"); ok(t + tg + "opens in place to all five", (await p.locator("#pa details.stc li:visible").count()) === 5);
      await quiet(v, tg + "open ");
      await p.click("#pa details.stc > summary");
      await p.click('.ctl [data-room="photo"]'); await p.click("#pa details.stc > summary");
      ok(t + tg + "tight: three plus '+2 more'", (await p.locator("#pa details.stc li:visible").count()) === 3 && /^\+2 more$/.test((await txt("#pa details.stc [data-rest]")).trim()));
      await p.click("#pa details.stc [data-rest]"); ok(t + tg + "+2 more expands to five", (await p.locator("#pa details.stc li:visible").count()) === 5);
      await p.click('.ctl [data-room="roomy"]');
      await p.click('#pa [data-go="2"]'); await p.click('#pa [data-go="3"]');
      ok(t + tg + "Already used stays a separate fold after it", (await p.locator("#pa .rsA > details").evaluateAll(d => d.map(x => x.className))).join("|") === "fold stc|used");
    }
    if (v === "3") {
      const run = await p.$$eval("#pa .run li", ls => ls.map(l => l.textContent.replace(/\s+/g, " ").trim()));
      ok(t + tg + "names only, five on roomy, no quantities", run.length === 5 && !/\d\s*(tbsp|cup)|^\d/.test(run.join("|").replace(/→[\s\d,+]*/g, "")), run);
      ok(t + tg + "each name carries only a small step pointer", run.every(x => /→ [\d, +]+/.test(x)), run);
      const hb = await p.locator("#pa .amt").boundingBox(); ok(t + tg + "Amounts toggle is a 44px target", hb.height >= 43.5 && hb.width >= 43.5, hb);
      await p.click("#pa .amt"); ok(t + tg + "Amounts shows the quantities on demand", /2 tbsp/.test(await txt("#pa .stc3")) && (await p.locator("#pa .stc3 .run").count()) === 0 && (await p.locator("#pa .amt").getAttribute("aria-expanded")) === "true");
      await quiet(v, tg + "amounts ");
      await p.click("#pa .amt");
      await p.click('.ctl [data-room="photo"]');
      ok(t + tg + "tight: three names plus '+2 more'", (await p.locator("#pa .run li").count()) === 3 && /^\+2 more$/.test((await txt("#pa .stc3 [data-rest]")).trim()));
      await p.click("#pa .stc3 [data-rest]"); ok(t + tg + "+2 more expands to five", (await p.locator("#pa .run li").count()) === 5);
      await p.click('.ctl [data-room="roomy"]');
    }
    // all treatments: contrast, Already used unchanged, backward compat, no overflow, tap targets
    await p.goto(BASE + "?stc=" + v, { waitUntil: "networkidle" }); await p.click('#pa [data-go="2"]'); await p.click('#pa [data-go="3"]');
    const sel = v === "1" ? "#pa .stcrow .v" : v === "2" ? "#pa details.stc > summary" : "#pa .run li";
    ok(t + tg + "muted text keeps 4.5:1 contrast", (await contrast(sel)) >= 4.5 && (await contrast("#pa details.used > summary")) >= 4.5, [await contrast(sel)]);
    ok(t + tg + "Already used is the same collapsed row, last", (await p.locator("#pa details.used").getAttribute("open")) === null && /^Already used \(2\)$/.test((await txt("#pa details.used > summary")).trim()) && (await p.locator("#pa .rsA").evaluate(e => e.lastElementChild.className)) === "used");
    for (const rec of ["none", "half"]) { await p.click('[data-rec="' + rec + '"]'); await goStep(rec === "half" ? 5 : 2); ok(t + tg + rec + ": no rest block at all (backward compatible)", (await p.locator("#pa .rsA, #pa .stcrow, #pa .cu").count()) === 0); }
    await p.click('[data-rec="rice"]'); await p.click('.ctl [data-room="long"]');
    ok(t + tg + "no sideways scroll in the frame (long text)", await p.evaluate(() => { const f = document.querySelector("#pa"), b = f.querySelector(".body"); return f.scrollWidth <= f.clientWidth && b.scrollWidth <= b.clientWidth && document.documentElement.scrollWidth <= document.documentElement.clientWidth; }));
    await p.click('.ctl [data-room="roomy"]');
  }
  // ---- ?stc=4, the owner's locked design (CSI-27..42) ----
  await p.goto(BASE + "?stc=4", { waitUntil: "networkidle" }); const t4 = "stc4: ";
  ok(t + t4 + "?stc=4 selects the design and its control; 0..3 still selectable", (await p.locator('.ctl [data-stc="4"]').getAttribute("aria-pressed")) === "true" && (await p.locator("#pa .cu.c4").count()) === 1);
  await goStep(1);
  const row4 = () => p.$$eval("#pa .cu tr", ls => ls.map(l => ({ nm: l.querySelector(".nm .t").textContent, q: l.querySelector(".am").textContent, lf: (l.querySelector(".lf") || { textContent: "" }).textContent, box: !!l.querySelector("td.ck input[type=checkbox]") })));
  let r4 = await row4(); const g4 = n => r4.find(x => x.nm.startsWith(n));
  ok(t + t4 + "merged table: three rows, each amount | checkbox | name", r4.length === 3 && r4.every(x => x.box), r4);
  ok(t + t4 + "step 1: chicken 1 + '1 left for step 2'; soy sauce 1 tbsp + '2 tbsp left for step 4'; garlic 2 + '1 left for step 4'", g4("chicken").q === "1" && g4("chicken").lf === "1 left for step 2" && g4("soy").q === "1 tbsp" && g4("soy").lf === "2 tbsp left for step 4" && g4("garlic").q === "2" && g4("garlic").lf === "1 left for step 4", r4);
  const cx = await p.evaluate(() => { const rw = document.querySelector("#pa .cu tr"), am = rw.querySelector(".am").getBoundingClientRect(), ck = rw.querySelector("input").getBoundingClientRect(), nm = rw.querySelector(".nm .t").getBoundingClientRect(); return { order: am.left < ck.left && ck.right <= nm.left + 1, amW: +getComputedStyle(rw.querySelector(".am")).fontWeight, rows: [...document.querySelectorAll("#pa .cu tr")].map(r => r.getBoundingClientRect().height), tag: document.querySelector("#pa .cu .t4").tagName, th: document.querySelectorAll("#pa .cu th, #pa .cu thead").length }; });
  ok(t + t4 + "amount on the LEFT, then the checkbox, then the name", cx.order && cx.amW >= 700, cx);
  ok(t + t4 + "compact table, no header row, and no word 'Ingredient' anywhere in the callout", cx.tag === "TABLE" && cx.th === 0 && !/ingredient/i.test(await txt("#pa .cu")) && !/amount/i.test(await txt("#pa .cu")), await txt("#pa .cu"));
  ok(t + t4 + "rows keep a 44px tap target", cx.rows.every(h => h >= 43.5), cx.rows);
  ok(t + t4 + "never '1 of 2', no old arrow chip, no count badge", !/\d of \d|→/.test(await txt("#pa .cu")) && (await p.locator("#pa .cu .n, #pa .cu .go").count()) === 0 && /^In this step$/i.test((await txt("#pa .cu .lbl")).trim()));
  const lb = await p.locator("#pa .cu tr:first-child input").boundingBox(), cb = await p.locator("#pa .cu tr:first-child label.cb").boundingBox(); ok(t + t4 + "checkbox target (label) is 44 x 44", cb.width >= 43.5 && cb.height >= 43.5, [lb, cb]);
  await p.locator("#pa .cu tr:first-child input").check();
  ok(t + t4 + "ticking strikes the name (not colour alone) and the box shows ticked; amount stays", (await p.locator("#pa .cu tr:first-child input").isChecked()) && (await p.locator("#pa .cu tr:first-child .nm .t").evaluate(e => getComputedStyle(e).textDecorationLine)) === "line-through" && (await p.locator("#pa .cu tr:first-child .am").evaluate(e => getComputedStyle(e).textDecorationLine)) === "none");
  await p.locator("#pa .cu tr:nth-child(2) .nm label").click(); ok(t + t4 + "tapping the name also toggles it", await p.locator("#pa .cu tr:nth-child(2) input").isChecked());
  ok(t + t4 + "tick is screen-only: it does not touch the URL, storage or the other steps", (await p.evaluate(() => location.search + localStorage.length)) === "?stc=40" && (await (async () => { await goStep(2); const n = await p.locator("#pa .cu input:checked").count(); await goStep(1); return n; })()) === 0);
  await goStep(2); r4 = await row4();
  ok(t + t4 + "step 2: oil '3 tbsp left for steps 3, 7'; chicken final use no line; salt: empty amount, no filler", g4("oil").lf === "3 tbsp left for steps 3, 7" && g4("chicken").lf === "" && g4("chicken").q === "1" && g4("salt").q === "" && g4("salt").lf === "" && !/to taste|not given|–/i.test(await txt("#pa .cu")), r4);
  ok(t + t4 + "empty amount keeps the checkbox column aligned", await p.evaluate(() => { const l = [...document.querySelectorAll("#pa .cu tr input")].map(i => Math.round(i.getBoundingClientRect().left)); return new Set(l).size === 1; }));
  await goStep(3);
  // Already used: grey accordion in place under "In this step"; Still to come: bottom dock
  const ord = await p.evaluate(() => { const f = document.querySelector("#pa"), cu = f.querySelector(".cu").getBoundingClientRect(), us = f.querySelector(".us4").getBoundingClientRect(), dk = f.querySelector(".dk4").getBoundingClientRect(), act = f.querySelector(".act").getBoundingClientRect(), body = f.querySelector(".body").getBoundingClientRect(); return { under: us.top >= cu.bottom - 1 && us.top - cu.bottom < 20, dockBelowBody: dk.top >= body.bottom - 1, dockAboveBtns: Math.abs(dk.bottom - act.top) <= 1.5, nextSib: f.querySelector(".cu").nextElementSibling.className }; });
  ok(t + t4 + "Already used accordion sits directly under 'In this step'; the dock bar sits at the bottom just above the step buttons", ord.under && ord.dockBelowBody && ord.dockAboveBtns && /us4/.test(ord.nextSib), ord);
  ok(t + t4 + "no 'Still to come' row in the body any more (it is only the docked bar)", (await p.locator("#pa .body .stcrow, #pa .body [data-pd=todo]").count()) === 0 && (await p.locator("#pa .dk4 [data-pd=todo]").count()) === 1);
  const ac = await p.evaluate(() => { const u = document.querySelector("#pa .us4"), b = u.querySelector(".usb"), cs = getComputedStyle(b), ch = b.querySelector(".ch"), tr = getComputedStyle(ch).transform; return { closed: b.getAttribute("aria-expanded"), txt: b.textContent.trim(), h: b.getBoundingClientRect().height, color: cs.color, muted: getComputedStyle(document.documentElement).getPropertyValue("--muted"), bar: getComputedStyle(u).borderLeftColor, accent: getComputedStyle(document.querySelector("#pa .dk4 .bar")).borderLeftColor, tr, ic: getComputedStyle(b.querySelector("svg")).color, bg: getComputedStyle(u).backgroundColor }; });
  ok(t + t4 + "accordion: closed, 'Already used (2)', 44px header", ac.closed === "false" && ac.txt === "Already used (2)" && ac.h >= 43.5, ac);
  ok(t + t4 + "accordion header is grey: grey bar differs from the accent bar, header text and icon use the muted colour, tinted grey fill", ac.bar !== ac.accent && ac.color === ac.ic && ac.tr === "none" && (await p.evaluate(() => getComputedStyle(document.querySelector("#pa .usb")).color === getComputedStyle(document.querySelector("#pa .usb svg")).color && getComputedStyle(document.querySelector("#pa .usb")).color !== getComputedStyle(document.querySelector("#pa .dk4 .k")).color)), ac);
  ok(t + t4 + "arrow points DOWN when closed (chevron unrotated)", ac.tr === "none" || ac.tr === "matrix(1, 0, 0, 1, 0, 0)", ac.tr);
  const ba = await p.evaluate(() => getComputedStyle(document.querySelector("#pa .dk4 .bar .ch")).transform); ok(t + t4 + "dock bar chevron points up when closed (it opens upward)", /matrix\(-1, /.test(ba), ba);
  // dock bar: names of the next step only, one line, ellipsis
  const bar = await p.evaluate(() => { const b = document.querySelector("#pa .dk4 .bar"), v = b.querySelector(".v"), cs = getComputedStyle(v); return { k: b.querySelector(".k").textContent, v: v.textContent, fs: cs.fontSize, ws: cs.whiteSpace, to: cs.textOverflow, h: b.getBoundingClientRect().height, text: b.textContent }; });
  ok(t + t4 + "dock bar: 'Still to come' + the next step's names only (no quantity, no count, no '+N more'), 44px, nowrap with ellipsis", bar.k === "Still to come" && /^soy sauce, garlic clove, cooked rice/.test(bar.v) && !/\d|\+|more|\(/.test(bar.v + bar.k) && bar.h >= 43.5 && bar.ws === "nowrap" && bar.to === "ellipsis", bar);
  ok(t + t4 + "dock bar: hint-free (no 'tap', 'swipe')", !/tap|swipe|drag/i.test(bar.text));
  await p.addStyleTag({ content: "#pa .dk4 .v{max-width:70px!important}" });
  ok(t + t4 + "when space runs out the names are cut (scrollWidth > clientWidth), not wrapped or counted", await p.evaluate(() => { const v = document.querySelector("#pa .dk4 .v"); return v.scrollWidth > v.clientWidth && v.getBoundingClientRect().height < 24; }));
  await p.goto(BASE + "?stc=4", { waitUntil: "networkidle" }); await goStep(3);
  ok(t + t4 + "muted text keeps 4.5:1 contrast (dock names, accordion header)", (await contrast("#pa .dk4 .v")) >= 4.5 && (await contrast("#pa .usb")) >= 4.5, [await contrast("#pa .dk4 .v"), await contrast("#pa .usb")]);
  // open the accordion
  await p.click('#pa [data-pd="used"]');
  const ao = await p.evaluate(() => { const u = document.querySelector("#pa .us4"), r = [...u.querySelectorAll(".usp tr")].map(x => [...x.children].map(c => c.textContent.trim()).filter(Boolean).join(" ")); return { open: u.classList.contains("open"), exp: u.querySelector(".usb").getAttribute("aria-expanded"), tr: getComputedStyle(u.querySelector(".usb .ch")).transform, r, nav: location.search, fits: u.getBoundingClientRect().right <= document.querySelector("#pa").getBoundingClientRect().right }; });
  ok(t + t4 + "accordion opens in place with amounts and where used; arrow rotates UP when open; no navigation", ao.open && ao.exp === "true" && /matrix\(-1, /.test(ao.tr) && ao.r.length === 2 && ao.r.every(x => /used in steps? \d/.test(x)) && /^2 chicken breasts/.test(ao.r.join("|")) && ao.nav === "?stc=4" && ao.fits, ao);
  ok(t + t4 + "dock bar still shown while the accordion is open, but its flyout is closed", (await p.locator("#pa .dk4 .bar").getAttribute("aria-expanded")) === "false" && (await p.locator("#pa .dk4 .p").count()) === 0);
  // either-or
  await p.click('#pa .dk4 [data-pd="todo"]');
  const eo = await p.evaluate(() => ({ flyout: !!document.querySelector("#pa .dk4 .p"), acc: document.querySelector("#pa .us4").classList.contains("open"), accExp: document.querySelector("#pa .usb").getAttribute("aria-expanded"), rows: [...document.querySelectorAll("#pa .dk4 .p tr")].map(x => [...x.children].map(c => c.textContent.trim()).filter(Boolean).join(" ")), above: document.querySelector("#pa .dk4").getBoundingClientRect().bottom <= document.querySelector("#pa .act").getBoundingClientRect().top + 1, barExp: document.querySelector("#pa .dk4 .bar").getAttribute("aria-expanded"), tr: getComputedStyle(document.querySelector("#pa .dk4 .bar .ch")).transform }));
  ok(t + t4 + "either-or: opening the dock closes Already used", eo.flyout && !eo.acc && eo.accExp === "false" && eo.barExp === "true", eo);
  ok(t + t4 + "dock flyout: full detail with quantities and 'left for', above the buttons; bar arrow points down when open", eo.rows.length === 5 && eo.rows.some(x => /^2 tbsp soy sauce.*left for step 4/.test(x)) && eo.rows.some(x => /^3 cup cooked rice/.test(x)) && eo.rows.some(x => /eggs?.*for steps 6, 7/.test(x) && !/left for/.test(x)) && eo.above && !/\d of \d/.test(eo.rows.join(" ")) && !/matrix\(-1, /.test(eo.tr), eo);
  ok(t + t4 + "dock flyout stays inside the frame, no sideways scroll", await p.evaluate(() => { const f = document.querySelector("#pa"); return f.scrollWidth <= f.clientWidth && document.documentElement.scrollWidth <= document.documentElement.clientWidth; }));
  await p.click('#pa [data-pd="used"]');
  ok(t + t4 + "either-or: opening Already used closes the dock", (await p.locator("#pa .dk4 .p").count()) === 0 && (await p.locator("#pa .us4.open").count()) === 1 && (await p.locator("#pa .dk4 .bar").getAttribute("aria-expanded")) === "false");
  await p.click('#pa [data-pd="used"]'); ok(t + t4 + "tapping the open accordion closes it; nothing open", (await p.locator("#pa .us4.open, #pa .dk4 .p").count()) === 0);
  await p.click('#pa .dk4 [data-pd="todo"]'); await p.click('#pa .dk4 [data-pd="todo"]'); ok(t + t4 + "tapping the open dock bar closes it", (await p.locator("#pa .dk4 .p").count()) === 0);
  await p.click('#pa [data-go="3"]'); await p.click('#pa [data-go="4"]'); await p.click('#pa [data-go="5"]'); await p.click('#pa [data-go="6"]');
  ok(t + t4 + "last step: no dock bar (nothing to come), Already used remains", (await p.locator("#pa .dk4").count()) === 0 && (await p.locator('#pa [data-pd="used"]').count()) === 1);
  for (const rec of ["none", "half"]) { await p.click('[data-rec="' + rec + '"]'); await goStep(rec === "half" ? 5 : 2); ok(t + t4 + rec + ": no callout, no accordion, no dock (backward compatible)", (await p.locator("#pa .rsA, #pa .cu, #pa .dk4, #pa .us4").count()) === 0); }
  await p.click('[data-rec="rice"]'); await p.click('.ctl [data-room="long"]');
  ok(t + t4 + "no sideways scroll with long text", await p.evaluate(() => { const f = document.querySelector("#pa"); return f.scrollWidth <= f.clientWidth && document.documentElement.scrollWidth <= document.documentElement.clientWidth; })); await p.click('.ctl [data-room="roomy"]');
  await p.click('[data-rec="tray"]'); await goStep(1);
  ok(t + t4 + "long list keeps the 5 + '+2 more' cap in the callout", (await p.locator("#pa .cu tr").count()) === 5 && /^\+2 more$/.test((await txt("#pa .cu [data-more]")).trim()));
  await p.click('[data-rec="rice"]');
  // the dropped options are gone (CSI-34)
  await p.goto(BASE + "?stc=4&disp=check", { waitUntil: "networkidle" });
  ok(t + "dropped display options: no control, no checklist, pills, bullets, cards or old table; ?disp is ignored", (await p.locator("[data-disp]").count()) === 0 && (await p.locator("#pa .d4, #pa .d-check, #pa .d-table, #pa .d-pills, #pa .d-bul, #pa .d-cards, #pa .qt4").count()) === 0 && (await p.locator("#pa .cu .t4").count()) === 1 && !/In this step \(phone\)|Grouped cards|Pills|Bullets|Checklist/.test(await txt(".ctl")));
  await p.goto(BASE + "?stc=4", { waitUntil: "networkidle" });
  const pz = (await (await fetch(BASE + "steps.js")).text()) + (await (await fetch(BASE + "steps.css")).text()) + (await (await fetch(BASE)).text());
  ok(t + "dropped options are gone from the code too", !/calloutDisp|d-check|d-pills|d-cards|d-bul|d-table|data-disp|GORDER/.test(pz));
  // ---- label fix (CSI-32): B's remainder disclosure is not called "All ingredients" ----
  await p.goto(BASE, { waitUntil: "networkidle" });
  ok(t + "B disclosure says 'Still to come', not 'All ingredients', and does not repeat the heading", (await txt("#pb details.all > summary")).trim() === "Still to come" && !/All ingredients/.test(await txt("#opts")) && (await p.locator("#pb details.all .rest .lbl").allInnerTexts()).every(x => x !== "Still to come"));
  for (let i = 1; i <= 6; i++) await p.click('#pb [data-go="' + i + '"]');
  ok(t + "B on the last step: only Already used remains, so the heading says that", (await txt("#pb details.all > summary")).trim() === "Already used");
  await p.click('[data-rec="half"]'); await p.click('#pb [data-go="0"]').catch(() => {});
  ok(t + "B half tagged lists every ingredient, so 'All ingredients' stays", /^All ingredients$/.test((await txt("#pb details.all > summary")).trim()));
  await p.click('[data-rec="rice"]');
  await p.goto(BASE, { waitUntil: "networkidle" });
  }
  if (!phone) {
  // Desktop and options B, C do not change with the phone switch (CSI-22)
  const snap = () => p.evaluate(() => ["#da", "#db", "#dc", "#pb", "#pc"].map(i => document.querySelector(i).innerHTML).join("\u0001"));
  const before = await snap();
  for (const v of ["0", "2", "3", "4", "1"]) { await p.click('.ctl [data-stc="' + v + '"]'); ok(t + "desktop, B and C unchanged by treatment " + v, (await snap()) === before); }
  // Desktop composition: chips in the step card, dock for the rest, two accents
  await p.click('#da [data-go="0"]').catch(() => {});
  ok(t + "desktop: no separate callout, chips sit inside the step card", (await p.locator("#da .cu").count()) === 0 && (await p.locator("#da .bigstep .chipsA li").count()) > 0);
  const dl = await p.$$eval("#da .bigstep .chipsA li", ls => ls.map(l => ({ nm: l.querySelector(".nm").textContent, qt: l.querySelector(".qt").textContent, go: (l.querySelector(".go [aria-hidden]") || { textContent: "" }).textContent })));
  ok(t + "desktop chips: name, quantity, final-use no chip, no filler", dl.every(c => c.nm && !/to taste|not given|\u2013/.test(c.qt)), dl);
  ok(t + "desktop dock collapsed by default", (await p.locator("#da [data-dk]").first().getAttribute("aria-expanded")) === "false" && (await p.locator("#da .dkp").count()) === 0);
  await p.click('#da [data-dk="todo"]'); ok(t + "desktop Still to come opens in place", (await p.locator("#da .dkp.todo li").count()) > 0 && /Still to come/.test(await txt("#da .tb.todo")));
  await p.click('#da [data-go="1"]'); await p.click('#da [data-go="2"]'); await p.click('#da [data-go="3"]');
  await p.click('#da [data-dk="used"]'); ok(t + "desktop Already used opens in place and replaces the other", (await p.locator("#da .dkp.used li").count()) > 0 && (await p.locator("#da .dkp.todo").count()) === 0 && (await p.locator("#da [data-dk=todo]").getAttribute("aria-expanded")) === "false");
  const col = await p.evaluate(() => ({ t: getComputedStyle(document.querySelector("#da .tb.todo")).borderLeftColor, u: getComputedStyle(document.querySelector("#da .tb.used")).borderLeftColor, ty: document.querySelector("#da .tb.todo").getBoundingClientRect().left < document.querySelector("#da .tb.used").getBoundingClientRect().left }));
  ok(t + "desktop two accents differ, and label and position differ too", col.t !== col.u && col.ty, col);
  ok(t + "desktop frame has no sideways overflow", await p.evaluate(() => { const f = document.querySelector("#da"); return f.scrollWidth <= f.clientWidth; }));
  }
  // No quantities in step text (CSI-21): quantities live in the list and the links only
  for (const [rec, n] of [["rice", 7], ["tray", 3]]) {
    await p.click('[data-rec="' + rec + '"]');
    for (let k = 1; k <= n; k++) {
      await goStep(k);
      const step = (await p.locator("#pa .bigstep p").innerText()).replace(/\d+\s*(minutes?|degrees)/gi, "").replace(/\b(one|two|three)\s+minutes?/gi, "");
      ok(t + rec + " step " + k + " text carries no quantity", !/\d/.test(step) && !/\b(one|two|three|four|half)\b/i.test(step), step);
    }
  }
  await p.click('[data-rec="rice"]');
  // no-ingredients step
  await goStep(5);
  ok(t + "tagged-empty step says so", /No ingredients in this step/.test(await txt("#pa .body")));
  ok(t + "no strip on that step", (await p.locator("#pa .cu").count()) === 0);
  // untagged
  await p.click('[data-rec="none"]'); await goStep(1); const body = await txt("#pa .body");
  ok(t + "untagged: no strip, no list, no hint", (await p.locator("#pa .cu, #pa .rsA, #pa .noings").count()) === 0 && !/tagged/i.test(body));
  await p.click('[data-rec="half"]'); await goStep(4);
  ok(t + "half tagged: untagged step shows nothing, no rest list", (await p.locator("#pa .cu, #pa .rsA, #pa .noings").count()) === 0);
  // long list caps at five and expands in place
  await p.click('[data-rec="tray"]'); await goStep(1);
  ok(t + "long list caps at five", (await p.locator("#pa .cu li").count()) === 5);
  await p.click("#pa [data-more]"); ok(t + "+N more expands in place to seven", (await p.locator("#pa .cu li").count()) === 7);
  // C dock opens in place
  await p.click('#pc [data-go="0"]').catch(() => {}); ok(t + "C dock is collapsed by default", (await p.locator("#pc [data-dock]").getAttribute("aria-expanded")) === "false");
  await p.click("#pc [data-dock]"); ok(t + "C dock opens the callout", (await p.locator("#pc .stepuse:visible").count()) === 1);
  // no gesture hints
  ok(t + "no gesture hint text", !/swipe|arrow key/i.test(await txt("#opts")));
  // tap targets
  const small = await p.evaluate(() => [...document.querySelectorAll("button")].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); }).map(b => b.className + b.textContent.slice(0, 14)));
  ok(t + "controls at least 44px", small.length === 0, small);
  await ctx.close();
}
await browser.close();
ok("no page errors", errs.length === 0, errs);
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} checks passed`); process.exit(fails ? 1 : 0);
