// Receipt scan, revision 4 (Read, then Sort) check: ro2.html options a, b and c at phone and tablet, in both themes, every state; then a click-through of the live clock
// (read, Sort, settle a line, back to the receipt, Sort again, Add, done). Reports console errors, sideways scroll and tap targets under 44px. The chosen flow (ro.html) has its own check.
// Usage: python3 -m http.server 8123 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/receipt-scan-two-step-check.mjs   (needs playwright-core)
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/receipt-scan/";
const states = ["step=view&phase=look", "step=view&phase=end&pre=all", "step=view&phase=end&pre=half", "step=view&still=1&phase=still&pre=all", "step=view&cond=blur&phase=found&pre=half",
  "step=sort&pre=half", "step=sort&pre=half&filter=ready", "step=sort&pre=all&filter=ignored", "step=sort&pre=half&sel=l9", "step=sort&pre=resolved", "step=sort&pre=resolved&sheet=summary"];
const sizes = [[390, 844], [768, 1024]];
const b = await chromium.launch(); let bad = 0, n = 0;
for (const opt of ["a", "b", "c"]) for (const [w, h] of sizes) for (const th of ["kitchie", "kitchie-day"]) for (const q of states) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(`${BASE}ro2.html?opt=${opt}&${q}`); await p.waitForTimeout(300); n++;
  const r = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent && getComputedStyle(e).visibility !== "hidden"; };
    const small = [...document.querySelectorAll("button,summary,input,[role=radio]")].filter(e => { const r = e.getBoundingClientRect(); return vis(e) && (r.height < 43.5 || r.width < 43.5); }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
    const st = document.querySelector(".lv-stage"), step = document.getElementById("app").dataset.step;
    return { x: document.documentElement.scrollWidth > innerWidth + 1, small: small.slice(0, 4), stageH: st ? Math.round(st.getBoundingClientRect().height) : 0, step };
  });
  /* step 1 must give the paper real room: at least 40% of the screen; step 2 of option c about a quarter */
  const tooSmall = r.step === "view" && r.stageH < h * 0.4 && !/cond=/.test(q);
  if (errs.length || r.x || r.small.length || tooSmall) { bad++; console.log(opt, w, th, q, errs.join("|"), r.x ? "SIDEWAYS" : "", r.small.join(" "), tooSmall ? "PAPER TOO SMALL " + r.stageH : ""); }
  await p.close();
}
/* the click-through, live: the clock plays the camera until the whole receipt is read */
for (const opt of ["a", "b", "c"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}ro2.html?opt=${opt}&step=view`);
  await p.waitForSelector(".ro2-sort:not([disabled])", { timeout: 60000 });
  const read = await p.innerText(".ro2-n"), stamp = !!(await p.$(".ro2-stamp"));
  await p.click(".ro2-sort"); await p.waitForTimeout(250);
  const step1 = await p.evaluate(() => document.getElementById("app").dataset.step);
  const before = await p.evaluate(() => RO.tally().ready);
  const acc = await p.$("[data-act=accept]"); if (acc) { await acc.click(); await p.waitForTimeout(150); }
  const after = await p.evaluate(() => RO.tally().ready);
  await p.click("[data-act=seepaper]"); await p.waitForTimeout(250);
  const back = await p.evaluate(() => document.getElementById("app").dataset.step) === "view" && !!(await p.$(".ro2-stamp"));
  await p.click(".ro2-sort"); await p.waitForTimeout(200); await p.click("[data-act=summary]"); await p.waitForTimeout(250);
  const sheet = !!(await p.$("[data-mode=sum]")); await p.click("[data-act=done]"); await p.waitForTimeout(250);
  const done = await p.evaluate(() => document.getElementById("app").dataset.step);
  const ok = /16 lines read/.test(read) && stamp && step1 === "sort" && (!acc || after === before + 1) && back && sheet && done === "done" && !errs.length;
  console.log("flow", opt, ok ? "ok" : "FAIL", read, "stamp", stamp, "sort", step1, "accept", before, "->", after, "back", back, "sheet", sheet, "done", done, errs.join("|"));
  if (!ok) bad++; await p.close();
}
await b.close(); console.log(n + " pages checked," , bad ? bad + " problems" : "0 problems"); process.exit(bad ? 1 : 0);
