// Receipt scan, quantity with a unit (Kitchie #754): every state of qu-a.html and qu-b.html at phone, tablet and desktop in both themes, then the corrections (take the unit off, type a unit, B's sheet save).
// Reports console errors, sideways scroll and tap targets under 44px. Usage: python3 -m http.server 8123 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/receipt-scan-qu-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/receipt-scan/";
const base = "step=view&phase=end&pre=all";
const states = [base, base + "&filter=check", base + "&sel=l3", base + "&res=l6:new&sel=l6", base + "&sel=l3&nounit=l3", base + "&filter=check&sel=l7", base + "&filter=check&sel=l13", base + "&filter=unsure&sel=l12", base + "&qs=l3", base + "&typed=l3~2 litres of milk&sel=l3"];
const b = await chromium.launch(); let bad = 0, n = 0;
for (const opt of ["a", "b"]) for (const [w, h] of [[390, 844], [768, 1024], [1280, 800]]) for (const th of ["kitchie", "kitchie-day"]) for (const q of states) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(`${BASE}qu-${opt}.html?${q}`); await p.waitForTimeout(300); n++;
  const r = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent && getComputedStyle(e).visibility !== "hidden"; };
    const small = [...document.querySelectorAll("button,input")].filter(e => { const r = e.getBoundingClientRect(); return vis(e) && (r.height < 43.5 || r.width < 43.5) && !e.closest(".dvp,.dvh,.wantbox") ; }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
    return { x: document.documentElement.scrollWidth > innerWidth + 1, small: small.slice(0, 4) };
  });
  if (errs.length || r.x || r.small.length) { bad++; console.log(opt, w, th, q, errs.join("|"), r.x ? "SIDEWAYS" : "", r.small.join(" ")); }
  await p.close();
}
// corrections (A is the chosen option; B is kept)
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  const say = (m) => { bad++; console.log(m, w); };
  await p.goto(`${BASE}qu-a.html?${base}&sel=l3`); await p.waitForTimeout(300);
  await p.click("#qb-l3u"); let t = await p.textContent(".ro-li.on .ro-out"); if (!/Kept as a separate item/.test(t)) say("A clear unit: " + t);
  if (await p.getAttribute("#qb-l3", "inputmode")) say("A: the box is still numeric after the pill is cleared (RS-91)");
  await p.keyboard.type(" litres"); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/1 L to 3 L/.test(t) || !(await p.$("#qb-l3u"))) say("A typed words not folded to 2 L: " + t);
  await p.fill("#qb-l3", "2 litres of milk"); await p.press("#qb-l3", "Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/plus “2 litres of milk”/.test(t)) say("A own words not kept as typed: " + t);
  await p.fill("#qb-l3", "500 ml"); await p.press("#qb-l3", "Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/1 L to 1\.5 L/.test(t)) say("A type unit: " + t);
  // no quantity read: blank, never 1 (RS-88)
  await p.goto(`${BASE}qu-a.html?${base}&filter=check&sel=l7`); await p.waitForTimeout(300);
  if ((await p.inputValue("#qb-l7")) !== "") say("A: a line with no quantity does not show a blank box");
  t = await p.textContent(".ro-li.on .ro-out"); if (!/Type how much/.test(t)) say("A blank outcome: " + t);
  await p.fill("#qb-l7", "2"); await p.press("#qb-l7", "Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/1 bag to 3 bag/.test(t)) say("A blank then typed: " + t);
  // the photo follows the list (RS-89)
  await p.goto(`${BASE}qu-a.html?${base}`); await p.waitForTimeout(400);
  const first = await p.evaluate(() => (document.querySelector(".qu-track") || {}).dataset?.id || "");
  await p.evaluate(() => { const b = innerWidth >= 1024 ? document.querySelector(".panel[data-mode=lane]") : document.querySelector(".ro-list"); b.scrollTop = 1100; }); await p.waitForTimeout(400);
  const later = await p.evaluate(() => (document.querySelector(".qu-track") || {}).dataset?.id || "");
  if (!first || !later || first === later) say("the photo did not follow the list: " + first + " then " + later);
  // B is kept: its sheet saves
  await p.goto(`${BASE}qu-b.html?${base}&qs=l3`); await p.waitForTimeout(500);
  const f = (await p.$$("input[data-qu]")).pop(); await f.fill("3"); await f.press("Enter"); await p.waitForTimeout(100);
  t = await p.textContent('.ro-li[data-id="l3"] .ro-out'); if (!/1 L to 4 L/.test(t)) say("B save: " + t);
  if (errs.length) { bad++; console.log(errs); }
  await p.close();
}
await b.close(); console.log(`${n} states checked, ${bad} problems`); process.exit(bad ? 1 : 0);
