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
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); await p.goto(BASE, { waitUntil: "networkidle" }); const t = "w" + w + " ";
  const txt = id => p.locator(id).innerText();
  const goStep = async n => { for (let i = 0; i < 9; i++) { const m = /Step (\d+) of/i.exec(await txt("#pa .bigstep .lbl")); const cur = m ? +m[1] : n; if (cur === n) return; await p.click(cur < n ? "#pa .act .next" : "#pa .act .nb:not(.next)"); } };
  ok(t + "no sideways scroll", await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  const phone = w < 1024; // the desktop frames are hidden below 1024
  if (phone) {
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
  }
  if (!phone) {
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
