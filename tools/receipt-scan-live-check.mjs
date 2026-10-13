// Receipt scan, live revision check: every direction, state and size, then a click-through of the whole flow in every direction.
// Reports console errors, sideways scroll and tap targets under 44px; then drives scan, answer every line (confirm, override, add as new, cross off), summary, add, undo.
// Usage: python3 -m http.server 8123 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/receipt-scan-live-check.mjs   (needs playwright-core)
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/receipt-scan/";
const states = ["step=entry", "step=view&phase=look", "step=view&phase=found&pre=part", "step=view&phase=hold&p=0.6&pre=half", "step=view&phase=take&p=1&pre=half", "step=view&phase=end&pre=all", "step=view&phase=found&pre=half&sel=l9",
  "step=view&phase=found&pre=all&walk=1&sel=l12", "step=view&cond=blur&phase=found&pre=half", "step=view&cond=wall&pre=half", "step=view&cond=dark&phase=found&pre=half", "step=view&cond=glare&phase=found", "step=view&cond=partial&phase=found", "step=view&cond=rest",
  "step=view&phase=end&pre=resolved&sheet=summary", "step=done", "step=done&state=undone", "step=refused", "step=view&still=1&phase=still&pre=part"];
const sizes = [[390, 844], [768, 1024], [1280, 800]];
const b = await chromium.launch(); let bad = 0, n = 0;
for (const o of "abcd") for (const [w, h] of sizes) for (const th of ["kitchie", "kitchie-day"]) for (const q of states) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(`${BASE}live-${o}.html?${q}`); await p.waitForTimeout(300); n++;
  const r = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent && getComputedStyle(e).visibility !== "hidden"; };
    const small = [...document.querySelectorAll("button,summary,input,[role=radio]")].filter(e => { const r = e.getBoundingClientRect(); return vis(e) && (r.height < 43.5 || r.width < 43.5) && !e.closest(".dvp,.dvh"); }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
    const hit = [...document.querySelectorAll(".lv-hit")].filter(e => getComputedStyle(e).pointerEvents !== "none" && e.getBoundingClientRect().height < 43.5).length;
    return { x: document.documentElement.scrollWidth > innerWidth + 1, small: small.slice(0, 4), hit };
  });
  if (errs.length || r.x || r.small.length || r.hit) { bad++; console.log(o, w, th, q, errs.join("|"), r.x ? "SIDEWAYS" : "", r.small.join(" "), r.hit ? "HIT<44:" + r.hit : ""); }
  await p.close();
}
/* the click-through. A phone and a desktop per direction. The camera is held at "all lines read" so the path is the same every time; the clock is checked separately below. */
const first = { a: ".lv-ln.lv-need", b: "", c: "", d: "" };
const ans = { a: ".lv-sheet [data-act=match],.lv-sheet [data-act=new],.panel [data-act=match],.panel [data-act=new]", b: "[data-act=match],[data-act=new]", c: ".lv-dc [data-act=match],.lv-dc [data-act=new],.panel .lv-dc [data-act=match],.panel .lv-dc [data-act=new]", d: ".lv-lq [data-act=match],.lv-lq [data-act=new]" };
for (const o of "abcd") for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}live-${o}.html?step=view&phase=end&pre=all${o === "b" ? "&walk=1" : ""}`); await p.waitForTimeout(400);
  const clk = async s => { const e = await p.$(s); if (!e) return false; await e.click({ force: true }).catch(() => {}); await p.waitForTimeout(110); return true; };
  const open = () => p.evaluate(() => LV.openLines().length);
  let safety = 0, crossed = false;
  while ((await open()) > 0 && safety++ < 20) {
    if (o === "a" && !(await p.$(".lv-sheet [data-act=match],.lv-sheet [data-act=new],.panel [data-act=match],.panel [data-act=new]"))) await clk(first.a);
    if (!crossed) { const none = await p.evaluate(() => LV.openLines().filter(l => l.st === "none").map(l => l.id)[0]); if (none) { await p.evaluate(id => LV.act("box", id), none); await p.waitForTimeout(120); if (await clk(`.lv-card[data-id=${none}] [data-act=skip]`)) crossed = await p.evaluate(() => !!document.querySelector(".lv-scr")); continue; } }
    if (!(await clk(ans[o]))) { if (o === "c" || o === "d") await p.evaluate(() => { const l = LV.openLines()[0]; if (l) LV.act("box", l.id); }); await clk(ans[o]); }
  }
  const left = await open();
  await clk("[data-act=summary]"); await p.waitForTimeout(150);
  const sum = await p.evaluate(() => /Add \d+ to the Pantry/.test(document.body.innerText));
  await clk("[data-act=done]"); await p.waitForTimeout(200);
  const t = await p.evaluate(() => document.querySelector(".toast")?.textContent || "");
  await clk("[data-act=undodone]"); await p.waitForTimeout(150);
  const t2 = await p.evaluate(() => document.querySelector(".toast")?.textContent || "");
  const ok = left === 0 && sum && /Added \d+ to the Pantry/.test(t) && /Undone/.test(t2) && !errs.length;
  if (!ok) { bad++; console.log("FLOW", o, w, "left", left, "summary", sum, "|", t.replace(/\s+/g, " "), "|", t2.replace(/\s+/g, " "), "cross", crossed, errs.join("|")); } else console.log("flow ok", o, w, "crossed off:", crossed, t.replace("Undo", "").trim());
  await p.close();
}
/* the clock: scan from the Pantry and let the camera play. A: the whole receipt in two or three screens, end; B: held photo and the walk. */
for (const o of "ab") {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}live-${o}.html?step=entry`); await p.waitForTimeout(300); await p.click("[data-act=scan]");
  const want = o === "a" ? "end" : "frozen"; let got = ""; for (let i = 0; i < 40 && got !== want; i++) { await p.waitForTimeout(1000); got = await p.evaluate(() => LV.S.phase); }
  const seen = await p.evaluate(() => Object.keys(LV.S.seen).length);
  const ok = got === want && !errs.length && (o === "b" || seen === 16); if (!ok) { bad++; console.log("CLOCK", o, got, seen, errs.join("|")); } else console.log("clock ok", o, got, seen + " lines");
  await p.close();
}
console.log(n + " pages checked, " + bad + " problems"); await b.close();
