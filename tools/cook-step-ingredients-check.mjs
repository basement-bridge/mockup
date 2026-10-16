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
  const contrast = sel => p.evaluate(s => { const rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number), lum = a => { const f = a.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
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
  await p.goto(BASE, { waitUntil: "networkidle" });
  }
  if (!phone) {
  // Desktop and options B, C do not change with the phone switch (CSI-22)
  const snap = () => p.evaluate(() => ["#da", "#db", "#dc", "#pb", "#pc"].map(i => document.querySelector(i).innerHTML).join("\u0001"));
  const before = await snap();
  for (const v of ["0", "2", "3", "1"]) { await p.click('.ctl [data-stc="' + v + '"]'); ok(t + "desktop, B and C unchanged by treatment " + v, (await snap()) === before); }
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
