// Screenshots for the per-step ingredients fragment (phone option A), headless Chromium. Mockup only.
// Usage:  python3 -m http.server 8123 &   then   node tools/cook-step-ingredients-shots.mjs   (writes docs/screenshots/cook-step-ingredients-*.png)
// Writes the phone option A set (default treatment, CSI-22..26) and a side-by-side of the four Still to come treatments (before, 1, 2, 3).
import { createRequire } from "module";
import { mkdirSync } from "node:fs";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const BASE = process.env.BASE || "http://localhost:8123/fragments/cook-step-ingredients/index.html";
const OUT = process.env.OUT || "docs/screenshots"; mkdirSync(OUT, { recursive: true });
const browser = await pw.chromium.launch(); const errs = [];
const NAMES = ["Before", "1 Next line (recommended)", "2 Summary row", "3 Inline names"];
async function page(w, mode, q) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: mode }); const p = await ctx.newPage();
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(BASE + (q || ""), { waitUntil: "networkidle" }); await p.addStyleTag({ content: ".tfab,.tpop{display:none!important}" }); return [ctx, p];
}
const goto = async (p, n) => { for (let i = 0; i < 9; i++) { const m = /Step (\d+) of/i.exec(await p.locator("#pa .bigstep .lbl").innerText()); const c = +m[1]; if (c === n) return; await p.click(c < n ? "#pa .act .next" : "#pa .act .nb:not(.next)"); } };
const shot = async (p, f) => p.locator("#pa").screenshot({ path: `${OUT}/cook-step-ingredients-${f}.png` });
for (const w of [360, 390]) for (const mode of ["light", "dark"]) {
  const s = w + "-" + mode;
  // the option A set, default treatment
  let [c, p] = await page(w, mode); await shot(p, "a-" + s);
  for (const room of ["long", "photo", "small"]) { await p.click('.ctl [data-room="' + room + '"]'); await shot(p, "a-tight-" + room + "-" + s); }
  await p.click('.ctl [data-room="roomy"]'); await goto(p, 4); await p.click("#pa details.used > summary"); await shot(p, "a-used-open-" + s);
  await p.click('[data-rec="none"]'); await p.click('[data-rec="rice"]'); await goto(p, 6); await shot(p, "a-noings-" + s); await c.close();
  if (w === 390 && mode === "light") { [c, p] = await page(w, mode); await p.click('[data-rec="tray"]'); await p.click('#pa [data-go="0"]'); await shot(p, "a-longlist-" + s); await c.close(); }
  // the four treatments side by side: step 2 closed, and opened in the tight (step photo) frame scrolled to the end
  for (const [tag, setup] of [["closed", async p => {}], ["open", async p => { await p.click('.ctl [data-room="photo"]'); const o = await p.$("#pa [data-nx], #pa details.stc > summary, #pa [data-amt]"); if (o) await o.click(); await p.evaluate(() => { const b = document.querySelector("#pa .body"); b.scrollTop = b.scrollHeight; }); }]]) {
    const imgs = [];
    for (let v = 0; v < 4; v++) { const [c2, p2] = await page(w, mode, "?stc=" + v); await setup(p2); imgs.push((await p2.locator("#pa").screenshot()).toString("base64")); await c2.close(); }
    const [c3, p3] = await page(w, mode); const bg = await p3.evaluate(() => getComputedStyle(document.body).backgroundColor), fg = await p3.evaluate(() => getComputedStyle(document.body).color);
    await p3.setViewportSize({ width: 4 * w + 60, height: 800 });
    await p3.setContent(`<body style="margin:0;padding:12px;background:${bg};color:${fg};font:600 14px system-ui"><div style="display:flex;gap:12px">${imgs.map((b, i) => `<figure style="margin:0"><img src="data:image/png;base64,${b}" style="display:block;width:${w}px"><figcaption style="padding:8px 2px">${NAMES[i]}</figcaption></figure>`).join("")}</div></body>`);
    await p3.screenshot({ path: `${OUT}/cook-step-ingredients-stc-compare-${tag}-${s}.png`, fullPage: true }); await c3.close();
  }
}

// ?stc=4 (amalgam) and ?disp=... (CSI-27..33): roomy and tight (small screen), 360 and 390, light and dark
const DISP = ["check", "table", "pills", "bullets", "cards"];
for (const w of [360, 390]) for (const mode of ["light", "dark"]) {
  const s = w + "-" + mode;
  for (const room of ["roomy", "small"]) {
    const [c, p] = await page(w, mode, "?stc=4"); await p.click('.ctl [data-room="' + room + '"]');
    await goto(p, 3); await shot(p, "stc4-step3-" + room + "-" + s);
    await goto(p, 1); await shot(p, "stc4-step1-" + room + "-" + s);
    await goto(p, 4); await p.click('#pa [data-pr="todo"]'); await shot(p, "stc4-dock-todo-" + room + "-" + s);
    await p.click('#pa .dk4 [data-pd="used"]'); await shot(p, "stc4-dock-used-" + room + "-" + s); await c.close();
    const imgs = [];
    for (const d of DISP) { const [c2, p2] = await page(w, mode, "?stc=4&disp=" + d); await p2.click('.ctl [data-room="' + room + '"]'); await goto(p2, 1); imgs.push((await p2.locator("#pa").screenshot()).toString("base64")); await c2.close(); }
    const [c3, p3] = await page(w, mode); const bg = await p3.evaluate(() => getComputedStyle(document.body).backgroundColor), fg = await p3.evaluate(() => getComputedStyle(document.body).color);
    await p3.setViewportSize({ width: 5 * w + 72, height: 800 });
    await p3.setContent(`<body style="margin:0;padding:12px;background:${bg};color:${fg};font:600 14px system-ui"><div style="display:flex;gap:12px">${imgs.map((b, i) => `<figure style="margin:0"><img src="data:image/png;base64,${b}" style="display:block;width:${w}px"><figcaption style="padding:8px 2px">?disp=${DISP[i]}</figcaption></figure>`).join("")}</div></body>`);
    await p3.screenshot({ path: `${OUT}/cook-step-ingredients-disp-compare-${room}-${s}.png`, fullPage: true }); await c3.close();
  }
}
// the full-page desktop captures (they include the phone frames)
for (const [w, mode] of [[1024, "light"], [1024, "dark"], [1280, "light"], [1280, "dark"]]) { const [c, p] = await page(w, mode); await p.screenshot({ path: `${OUT}/cook-step-ingredients-desktop-${w}-${mode}.png`, fullPage: true }); await c.close(); }
await browser.close(); console.log(errs.length ? "ERRORS " + JSON.stringify(errs) : "no console or page errors");
