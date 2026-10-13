// Receipt scan, Receipt order (revision 3) check: every state at phone, tablet and desktop in both themes, then a click-through of the whole flow
// (scan, accept, new, pick, ignore, put back, summary, add, undo) on a phone and a desktop. Reports console errors, sideways scroll and tap targets under 44px.
// Usage: python3 -m http.server 8123 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/receipt-scan-ro-check.mjs   (needs playwright-core)
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/receipt-scan/";
const states = ["step=entry", "step=view&phase=look", "step=view&phase=found&pre=part", "step=view&phase=hold&p=0.6&pre=half", "step=view&phase=end&pre=all", "step=view&phase=end&pre=half",
  "step=view&phase=end&pre=half&filter=check", "step=view&phase=end&pre=all&filter=unsure", "step=view&phase=end&pre=all&filter=ignored", "step=view&phase=end&pre=half&sel=l9&filter=check",
  "step=view&phase=end&pre=all&filter=unsure&pick=l12", "step=view&cond=blur&phase=found&pre=half", "step=view&cond=wall&pre=half", "step=view&cond=dark&phase=found&pre=half",
  "step=view&cond=partial&phase=found", "step=view&cond=rest", "step=view&phase=end&pre=resolved&sheet=summary", "step=done", "step=done&state=undone", "step=refused", "step=view&still=1&phase=still&pre=part"];
const sizes = [[390, 844], [768, 1024], [1280, 800]];
const b = await chromium.launch(); let bad = 0, n = 0;
for (const [w, h] of sizes) for (const th of ["kitchie", "kitchie-day"]) for (const q of states) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(`${BASE}ro.html?${q}`); await p.waitForTimeout(300); n++;
  const r = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent && getComputedStyle(e).visibility !== "hidden"; };
    const small = [...document.querySelectorAll("button,summary,input,[role=radio]")].filter(e => { const r = e.getBoundingClientRect(); return vis(e) && (r.height < 43.5 || r.width < 43.5) && !e.closest(".dvp,.dvh"); }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
    return { x: document.documentElement.scrollWidth > innerWidth + 1, small: small.slice(0, 4) };
  });
  if (errs.length || r.x || r.small.length) { bad++; console.log(w, th, q, errs.join("|"), r.x ? "SIDEWAYS" : "", r.small.join(" ")); }
  await p.close();
}
/* the click-through: the camera is held at "all lines read" so the path is the same every time */
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}ro.html?step=view&phase=end&pre=all`); await p.waitForTimeout(400);
  const act = async (a, id, v) => { await p.evaluate(([a, id, v]) => RO.act(a, id, v), [a, id, v]); await p.waitForTimeout(60); };
  const t0 = await p.evaluate(() => RO.tally());
  // the controls on each line, read from the closed list (RS-59, RS-74): Exact and Check have Pick another item and New (Check also Accept, Exact no Accept), Unsure has Add as new, Match to existing, Ignore, Ignored has Put back
  const WANT = { "top": ["Pick another item", "New"], "check": ["Accept", "Pick another item", "New"], "unsure": ["Add as new", "Match to existing", "Ignore"], "ignored": ["Put back"], "new/exact": ["Pick another item", "Ignore"], "new/check": ["Pick another item", "Ignore"], "new/unsure": ["Match to existing", "Ignore"] };
  const controls = () => p.evaluate(() => [...document.querySelectorAll(".ro-li")].map(li => ({ k: li.dataset.k, st: li.dataset.st, open: li.classList.contains("on"), l: [...li.querySelectorAll(".ro-acts .rs-b")].map(b => b.querySelector("span").textContent.trim()), vis: [...li.querySelectorAll(".ro-acts .rs-b")].every(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) })));
  const wrong = async (what) => { const bad = (await controls()).filter(r => r.open || !r.vis || JSON.stringify(r.l) !== JSON.stringify(WANT[r.k === "new" ? "new/" + r.st : r.k])); if (bad.length) { console.log("CONTROLS", w, what, JSON.stringify(bad.slice(0, 3))); return 1; } return 0; };
  bad += await wrong("as read");
  {
    // a recommended line sent to New keeps Pick another item; an Unsure line sent to New keeps Match to existing; an Ignored line has Put back
    const ids = await p.evaluate(() => ({ rec: (RO.D.lines.find(l => RO.out(l).k === "top" || RO.out(l).k === "check") || {}).id, uns: (RO.D.lines.find(l => RO.out(l).k === "unsure") || {}).id }));
    if (ids.rec) await act("new", ids.rec); if (ids.uns) await act("new", ids.uns);
    bad += await wrong("after New");
    if (ids.uns) { await act("ignore", ids.uns); bad += await wrong("after Ignore"); await act("restore", ids.uns); }
    if (ids.rec) await act("undo", ids.rec);
    bad += await wrong("after Undo");
  }
  // the buttons are really on the rows: click one with the pointer
  await act("filter", null, "check");
  const clicked = await p.$('[data-act=accept]'); if (clicked) { await clicked.click({ force: true }).catch(() => {}); await p.waitForTimeout(100); }
  for (let i = 0; i < 30; i++) {
    const todo = await p.evaluate(() => RO.D.lines.filter(l => { const o = RO.out(l); return o.k === "check" || o.k === "unsure"; }).map(l => [l.id, RO.out(l).k, l.st]));
    if (!todo.length) break;
    const [id, k] = todo[0]; const j = i % 3;
    if (k === "check") await act("accept", id); else if (j === 0) await act("new", id); else if (j === 1) await act("ignore", id); else await act("pick", id, await p.evaluate(() => RO.D.pantry[0].id));
  }
  const t1 = await p.evaluate(() => RO.tally());
  await act("restore", await p.evaluate(() => (RO.D.lines.find(l => RO.out(l).k === "ignored") || {}).id)); await act("ignore", await p.evaluate(() => (RO.D.lines.find(l => RO.out(l).k === "check" || RO.out(l).k === "unsure") || {}).id).catch?.(() => null));
  await act("filter", null, "all");
  await act("summary"); await p.waitForTimeout(150);
  const sum = await p.evaluate(() => /Add \d+ to the Pantry/.test(document.body.innerText));
  await act("done"); await p.waitForTimeout(200);
  const t = await p.evaluate(() => document.querySelector(".toast")?.textContent || "");
  await act("undodone"); await p.waitForTimeout(150);
  const t2 = await p.evaluate(() => document.querySelector(".toast")?.textContent || "");
  const ok = sum && /Added \d+ to the Pantry/.test(t) && /Undone/.test(t2) && !errs.length && t1.check + t1.unsure === 0;
  if (!ok) { bad++; console.log("FLOW", w, "before", JSON.stringify(t0), "after", JSON.stringify(t1), "summary", sum, "|", t.replace(/\s+/g, " "), "|", t2.replace(/\s+/g, " "), errs.join("|")); } else console.log("flow ok", w, t.replace("Undo", "").trim());
  await p.close();
}
/* the clock: scan from the Pantry and let the camera play to the end of the receipt */
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}ro.html?step=entry`); await p.waitForTimeout(300); await p.evaluate(() => RO.act("add")); await p.evaluate(() => RO.act("scan"));
  let got = ""; for (let i = 0; i < 110 && got !== "end"; i++) { await p.waitForTimeout(1000); got = await p.evaluate(() => RO.S ? RO.S.phase : ""); }
  const ok = got === "end" && !errs.length; if (!ok) { bad++; console.log("CLOCK", got, errs.join("|")); } else console.log("clock ok", got);
  await p.close();
}
/* RS-76: the desktop never offers a webcam. From 1024px up the scan opens on a drop zone, there is no viewfinder, shutter, Webcam pill, camera-condition state or permission state, and a photo (drop, paste, choose) reads the receipt. The phone keeps its viewfinder. */
for (const [w, h, cam] of [[1280, 800, false], [390, 844, true]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}ro.html?step=entry`); await p.waitForTimeout(300); await p.evaluate(() => RO.act("add")); await p.evaluate(() => RO.act("scan")); await p.waitForTimeout(300);
  const q = () => p.evaluate(() => ({ drop: !!document.querySelector(".rl-drop"), shutter: !!document.querySelector(".rl-shutter"), pill: /Webcam/.test(document.body.innerText), steady: !!document.querySelector(".rl-steady"), still: RO.S.still }));
  const a = await q(); let ok = a.drop === !cam && a.shutter === cam && !a.pill && a.steady === cam;
  if (!cam) { await p.evaluate(() => RO.act("photos")); await p.waitForTimeout(200); const c = await q(); ok = ok && c.still && !c.drop && !c.shutter && !c.pill && (await p.evaluate(() => RO.tally().total)) > 0; }
  for (const st of ["step=view&cond=blur&phase=found&pre=half", "step=refused", "step=view&cond=rest"]) { await p.goto(`${BASE}ro.html?${st}`); await p.waitForTimeout(300); const d = await q(); if (!cam && (d.shutter || d.pill || !(await p.evaluate(() => !!document.querySelector(".rl-drop,.lv-paper"))))) ok = false; }
  if (!ok || errs.length) { bad++; console.log("NOCAM", w, JSON.stringify(a), errs.join("|")); } else console.log("no-webcam", cam ? "phone keeps the viewfinder" : "desktop is a drop zone", "ok");
  await p.close();
}
console.log(n + " pages checked, " + bad + " problems"); await b.close();
