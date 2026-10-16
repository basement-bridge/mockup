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
  // ---- ?stc=4 amalgam (CSI-27..32) ----
  await p.goto(BASE + "?stc=4", { waitUntil: "networkidle" }); const t4 = "stc4: ";
  ok(t + t4 + "?stc=4 selects the amalgam and its control; 0..3 still selectable", (await p.locator('.ctl [data-stc="4"]').getAttribute("aria-pressed")) === "true" && (await p.locator("#pa .rsA").getAttribute("data-stc")) === "4");
  await goStep(1);
  const row4 = () => p.$$eval("#pa .cu li", ls => ls.map(l => ({ nm: l.querySelector(".nm").textContent, q: l.querySelector(".qt4").textContent, lf: (l.querySelector(".lf") || { textContent: "" }).textContent })));
  let r4 = await row4(); const g4 = n => r4.find(x => x.nm.startsWith(n));
  ok(t + t4 + "step 1 callout: chicken 1 + '1 left for step 2'; soy sauce 1 tbsp + '2 tbsp left for step 4'; garlic 2 + '1 left for step 4'", g4("chicken").q === "1" && g4("chicken").lf === "1 left for step 2" && g4("soy").q === "1 tbsp" && g4("soy").lf === "2 tbsp left for step 4" && g4("garlic").q === "2" && g4("garlic").lf === "1 left for step 4", r4);
  ok(t + t4 + "never '1 of 2' and no old arrow chip", !/\d of \d|→/.test(await txt("#pa .cu")) && (await p.locator("#pa .cu .go").count()) === 0);
  ok(t + t4 + "no count badge in the callout heading", (await p.locator("#pa .cu .n").count()) === 0 && /^In this step$/i.test((await txt("#pa .cu .lbl")).trim()));
  const l4 = await p.evaluate(() => { const l = document.querySelector("#pa .cu li:nth-child(2)"), n = l.querySelector(".nm"), q = l.querySelector(".qt4"); return { nmW: +getComputedStyle(n).fontWeight, qW: +getComputedStyle(q).fontWeight, left: n.getBoundingClientRect().left < q.getBoundingClientRect().left, align: getComputedStyle(q).textAlign }; });
  ok(t + t4 + "name left heavier, quantity right lighter", l4.nmW >= 700 && l4.qW <= 500 && l4.left && l4.align === "right", l4);
  await goStep(2); r4 = await row4();
  ok(t + t4 + "step 2: oil '3 tbsp left for steps 3, 7' (plural, several steps); chicken final use no chip; salt: nothing right, no filler", g4("oil").lf === "3 tbsp left for steps 3, 7" && g4("chicken").lf === "" && g4("chicken").q === "1" && g4("salt").q === "" && g4("salt").lf === "" && !/to taste|not given|–/i.test(await txt("#pa .cu")), r4);
  await goStep(3);
  // quiet rows: names only, muted, one line, trailing ellipsis, no count, no "+N more"
  const rowsTxt = await p.$$eval("#pa .rsA .stcrow", bs => bs.map(b => ({ k: b.querySelector(".k").textContent, v: b.querySelector(".v").textContent })));
  ok(t + t4 + "step 3: Still to come shows the next step's names only; Already used shows the latest finished names", rowsTxt[0].k === "Still to come" && /^soy sauce, garlic clove, cooked rice, eggs?\b|^soy sauce, garlic clove, cooked rice/.test(rowsTxt[0].v) && rowsTxt.length === 2 && rowsTxt[1].k === "Already used" && rowsTxt[1].v.length > 0, rowsTxt);
  ok(t + t4 + "quiet rows: no quantities, no count, no '+N more'", rowsTxt.every(x => !/\d/.test(x.v + x.k)) && !/\+\d|\(\d+\)|more/.test(await txt("#pa .rsA")), rowsTxt);
  const qs = await p.evaluate(() => { const rs = document.querySelector("#pa .rsA"), all = [...rs.querySelectorAll("*")].filter(e => e.getBoundingClientRect().width > 0), v = rs.querySelector(".v"), cs = getComputedStyle(v);
    return { fills: all.filter(e => !/rgba\(0, 0, 0, 0\)/.test(getComputedStyle(e).backgroundColor)).map(e => e.className.toString()), fs: cs.fontSize, ws: cs.whiteSpace, to: cs.textOverflow, h: [...rs.querySelectorAll(".stcrow")].map(b => b.getBoundingClientRect().height), color: cs.color }; });
  ok(t + t4 + "quiet rows: no fill, 13px, one line with text-overflow ellipsis, 44px rows", qs.fills.length === 0 && qs.fs === "13px" && qs.ws === "nowrap" && qs.to === "ellipsis" && qs.h.every(x => x >= 43.5), qs);
  await p.addStyleTag({ content: "#pa .rsA .v{max-width:70px!important}" });
  ok(t + t4 + "when space runs out the line is cut (scrollWidth > clientWidth, ellipsis), not wrapped or counted", await p.evaluate(() => { const v = document.querySelector("#pa .rsA .v"); return v.scrollWidth > v.clientWidth && v.getBoundingClientRect().height < 24; }));
  await p.goto(BASE + "?stc=4", { waitUntil: "networkidle" }); await goStep(3);
  ok(t + t4 + "muted text keeps 4.5:1 contrast", (await contrast("#pa .rsA .v")) >= 4.5 && (await contrast("#pa .rsA .k")) >= 4.5, [await contrast("#pa .rsA .v")]);
  // dock: both sections open in place above the step buttons with full detail
  ok(t + t4 + "dock closed by default", (await p.locator("#pa .dk4").count()) === 0 && (await p.locator('#pa [data-pr="todo"]').getAttribute("aria-expanded")) === "false");
  await p.click('#pa [data-pr="todo"]');
  const dk = await p.evaluate(() => { const d = document.querySelector("#pa .dk4"), a = document.querySelector("#pa .act"), b = document.querySelector("#pa .body"); return { have: !!d, above: d && d.getBoundingClientRect().bottom <= a.getBoundingClientRect().top + 1, inFrame: d && d.getBoundingClientRect().bottom <= document.querySelector("#pa").getBoundingClientRect().bottom, bodyH: b.getBoundingClientRect().height, tabs: [...d.querySelectorAll(".tb")].map(x => [x.textContent.trim(), x.getAttribute("aria-expanded"), x.getBoundingClientRect().height]), nav: location.search }; });
  const todoRows = await p.$$eval("#pa .dk4 .p li", ls => ls.map(l => l.textContent.replace(/\s+/g, " ").trim()));
  ok(t + t4 + "tap Still to come opens a dock in place (no navigation) with full detail and quantities", dk.have && dk.above && dk.inFrame && dk.nav === "?stc=4" && /Still to come/.test(await txt("#pa .dk4 .tb.todo")) && todoRows.length === 5 && todoRows.some(x => /soy sauce\s*2 tbsp/.test(x)) && todoRows.some(x => /cooked rice\s*3 cup/.test(x)), [dk, todoRows]);
  ok(t + t4 + "dock rows use the 'left for' wording for a split ingredient, 'for' otherwise", todoRows.some(x => /soy sauce.*left for step 4/.test(x)) && todoRows.some(x => /eggs.*for steps 6, 7/.test(x) && !/left for/.test(x)) && !/\d of \d/.test(todoRows.join(" ")), todoRows);
  ok(t + t4 + "dock tabs are 44px, state by aria-expanded and chevron", dk.tabs.length === 2 && dk.tabs.every(x => x[2] >= 43.5) && dk.tabs[0][1] === "true" && dk.tabs[1][1] === "false", dk.tabs);
  await p.click('#pa .dk4 [data-pd="used"]');
  const usedRows = await p.$$eval("#pa .dk4 .p.used li", ls => ls.map(l => l.textContent.replace(/\s+/g, " ").trim()));
  ok(t + t4 + "Already used opens through the same dock, with amounts and where it was used", usedRows.length === 2 && usedRows.every(x => /used in steps? \d/.test(x)) && /chicken breasts?\s*2/.test(usedRows.join(" ")), usedRows);
  ok(t + t4 + "dock stays within the frame, no sideways scroll", await p.evaluate(() => { const f = document.querySelector("#pa"); return f.scrollWidth <= f.clientWidth && document.documentElement.scrollWidth <= document.documentElement.clientWidth; }));
  await p.click('#pa .dk4 [data-pd="used"]'); ok(t + t4 + "tapping the open tab closes the dock", (await p.locator("#pa .dk4").count()) === 0);
  await p.click('#pa [data-pr="used"]'); ok(t + t4 + "Already used row opens it directly", (await p.locator("#pa .dk4 .p.used li").count()) === 2); await p.click('#pa .dk4 [data-pd="used"]');
  await p.click('#pa [data-go="3"]'); await p.click('#pa [data-go="4"]'); await p.click('#pa [data-go="5"]'); await p.click('#pa [data-go="6"]');
  ok(t + t4 + "last step: no Still to come row, Already used remains", (await p.locator('#pa [data-pr="todo"]').count()) === 0 && (await p.locator('#pa [data-pr="used"]').count()) === 1);
  for (const rec of ["none", "half"]) { await p.click('[data-rec="' + rec + '"]'); await goStep(rec === "half" ? 5 : 2); ok(t + t4 + rec + ": no callout, no rows, no dock (backward compatible)", (await p.locator("#pa .rsA, #pa .cu, #pa .dk4").count()) === 0); }
  await p.click('[data-rec="rice"]'); await p.click('.ctl [data-room="long"]');
  ok(t + t4 + "no sideways scroll with long text", await p.evaluate(() => { const f = document.querySelector("#pa"); return f.scrollWidth <= f.clientWidth && document.documentElement.scrollWidth <= document.documentElement.clientWidth; })); await p.click('.ctl [data-room="roomy"]');
  await p.click('[data-rec="tray"]'); await goStep(1);
  ok(t + t4 + "long list keeps the 5 + '+2 more' cap in the callout", (await p.locator("#pa .cu li").count()) === 5 && /^\+2 more$/.test((await txt("#pa .cu [data-more]")).trim()));
  await p.click('[data-rec="rice"]');
  // ---- label fix (CSI-32): B's remainder disclosure is not called "All ingredients" ----
  await p.goto(BASE, { waitUntil: "networkidle" });
  ok(t + "B disclosure says 'Still to come', not 'All ingredients', and does not repeat the heading", (await txt("#pb details.all > summary")).trim() === "Still to come" && !/All ingredients/.test(await txt("#opts")) && (await p.locator("#pb details.all .rest .lbl").allInnerTexts()).every(x => x !== "Still to come"));
  for (let i = 1; i <= 6; i++) await p.click('#pb [data-go="' + i + '"]');
  ok(t + "B on the last step: only Already used remains, so the heading says that", (await txt("#pb details.all > summary")).trim() === "Already used");
  await p.click('[data-rec="half"]'); await p.click('#pb [data-go="0"]').catch(() => {});
  ok(t + "B half tagged lists every ingredient, so 'All ingredients' stays", /^All ingredients$/.test((await txt("#pb details.all > summary")).trim()));
  await p.click('[data-rec="rice"]');
  // ---- display swaps (CSI-33): ?disp=check|table|pills|bullets|cards ----
  for (const d of ["check", "table", "pills", "bullets", "cards"]) {
    await p.goto(BASE + "?stc=4&disp=" + d, { waitUntil: "networkidle" }); await goStep(1); const td = "disp " + d + ": ";
    ok(t + td + "key selects it and its control", (await p.locator('.ctl [data-disp="' + d + '"]').getAttribute("aria-pressed")) === "true" && (await p.locator("#pa .cu.d4").getAttribute("data-disp")) === d);
    const dtx = (await txt("#pa .cu")).replace(/\s+/g, " ");
    ok(t + td + "three ingredients, split wording '1 left for step 2', no '1 of 2', no count, no step-text quantity change", /chicken breast/i.test(dtx) && /soy sauce/i.test(dtx) && /garlic/i.test(dtx) && /1 left for step 2/.test(dtx) && /2 tbsp left for step 4/.test(dtx) && !/\d of \d/.test(dtx) && (await p.locator("#pa .cu .n").count()) === 0, dtx);
    if (d === "check") {
      const hs = await p.$$eval("#pa .d-check label", ls => ls.map(l => l.getBoundingClientRect().height)); ok(t + td + "three checkbox rows, each a 44px target", hs.length === 3 && hs.every(h => h >= 43.5), hs);
      await p.locator("#pa .d-check input").first().check(); ok(t + td + "ticking keeps the tick and strikes the name (not colour alone)", (await p.locator("#pa .d-check input").first().isChecked()) && (await p.locator("#pa .d-check li:first-child .nm").evaluate(e => getComputedStyle(e).textDecorationLine)) === "line-through");
      await p.locator("#pa .d-check input").first().uncheck();
    }
    if (d === "table") ok(t + td + "two columns with visible headers Ingredient and Amount", (await p.locator("#pa .d-table th").allInnerTexts()).join("|").toLowerCase() === "ingredient|amount" && (await p.locator("#pa .d-table tbody tr").count()) === 3);
    if (d === "pills") ok(t + td + "wrapping pills with bold amount", (await p.locator("#pa .d-pills li").count()) === 3 && (await p.locator("#pa .d-pills li").first().evaluate(e => getComputedStyle(e).borderRadius)) !== "0px" && (await p.locator("#pa .d-pills .qt4").first().evaluate(e => +getComputedStyle(e).fontWeight)) >= 700);
    if (d === "bullets") ok(t + td + "bulleted list, bold amount first: '1 chicken breast'", (await p.locator("#pa .d-bul li").count()) === 3 && /^1 chicken breast/.test((await p.locator("#pa .d-bul li").first().innerText()).trim()) && (await p.locator("#pa .d-bul li").first().evaluate(e => getComputedStyle(e).display)) === "list-item" && (await p.locator("#pa .d-bul b").first().evaluate(e => +getComputedStyle(e).fontWeight)) >= 700);
    if (d === "cards") ok(t + td + "grouped by type with a heading per group", (await p.locator("#pa .gc h4").allInnerTexts()).join("|").toLowerCase() === "produce|meat|pantry");
    ok(t + td + "no sideways scroll, no 'Still to come' regression (quiet rows still follow ?stc=4)", await p.evaluate(() => { const f = document.querySelector("#pa"); return f.scrollWidth <= f.clientWidth && document.documentElement.scrollWidth <= document.documentElement.clientWidth; }) && (await p.locator("#pa .rsA .stcrow").count()) === 1);
    await p.click('[data-rec="none"]'); await goStep(2); ok(t + td + "not tagged: no callout at all", (await p.locator("#pa .cu").count()) === 0); await p.click('[data-rec="rice"]');
  }
  await p.goto(BASE + "?disp=check", { waitUntil: "networkidle" }); ok(t + "disp works with the older treatments too (callout swaps, rest follows ?stc)", (await p.locator("#pa .cu.d4").count()) === 1 && (await p.locator("#pa .rsA").getAttribute("data-stc")) === "1");
  await p.click('.ctl [data-disp="default"]'); ok(t + "Default restores the existing callout (with its count)", (await p.locator("#pa .cu .n").count()) === 1 && (await p.locator("#pa .d4").count()) === 0);
  await p.goto(BASE, { waitUntil: "networkidle" });
  }
  if (!phone) {
  // Desktop and options B, C do not change with the phone switch (CSI-22)
  const snap = () => p.evaluate(() => ["#da", "#db", "#dc", "#pb", "#pc"].map(i => document.querySelector(i).innerHTML).join("\u0001"));
  const before = await snap();
  for (const v of ["0", "2", "3", "4", "1"]) { await p.click('.ctl [data-stc="' + v + '"]'); ok(t + "desktop, B and C unchanged by treatment " + v, (await snap()) === before); }
  for (const d of ["check", "table", "pills", "bullets", "cards", "default"]) { await p.click('.ctl [data-disp="' + d + '"]'); ok(t + "desktop, B and C unchanged by display " + d, (await snap()) === before); }
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
