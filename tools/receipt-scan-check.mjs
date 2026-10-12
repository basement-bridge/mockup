// Receipt scan mockup check: every option, step and edge state at 390, 768 and 1280, light and dark.
// Reports console errors, sideways scroll and tap targets under 44px, then drives the whole flow by clicking (scan, photo, read, decide every line, commit, undo).
// Usage: python3 -m http.server 8123 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/receipt-scan-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/receipt-scan/";
const steps = ["", "step=capture", "step=capture&photo=1", "step=reading", "step=review&pre=half", "step=review&state=lowq", "step=review&state=nothing", "step=summary&pre=resolved", "step=done", "step=done&state=undone", "step=capture&state=download", "step=capture&state=offline", "step=capture&state=perm", "step=review&open=l3&pre=half", "step=review&filter=skip&open=s1"];
const sizes = [[390, 844], [768, 1024], [1280, 800]];
const b = await chromium.launch(); let bad = 0, n = 0;
for (const o of "abcd") for (const [w, h] of sizes) for (const th of ["kitchie", "kitchie-day"]) for (const q of steps) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(`${BASE}${o}.html?${q}`); await p.waitForTimeout(250); n++;
  const r = await p.evaluate(() => { const small = [...document.querySelectorAll("button,[role=tab],summary,input")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent && (r.height < 43.5 || r.width < 43.5) && !e.closest(".c-tick.sm") && !e.classList.contains("c-tick") && getComputedStyle(e).visibility !== "hidden"; }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)); return { x: document.documentElement.scrollWidth > innerWidth + 1, small: small.slice(0, 4) }; });
  if (errs.length || r.x || r.small.length) { bad++; console.log(o, w, th, q || "entry", errs.join("|"), r.x ? "SIDEWAYS" : "", r.small.join(" ")); }
  await p.close();
}
for (const o of "abcd") for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}${o}.html?step=pantry`); await p.waitForTimeout(250);
  const clk = async s => { await p.click(s); await p.waitForTimeout(120); };
  if (o === "c") { await clk("[data-act=add]"); await clk(".rs-menu [data-act=scan]"); } else { await clk("[data-act=add]"); await clk("[data-act=scan]"); }
  await clk("[data-act=" + (w < 1000 ? "take" : "choose") + "]"); await clk("[data-act=read]"); await p.waitForTimeout(2000);
  for (let i = 0; i < 12; i++) { const a = await p.$("[data-act=match],[data-act=new]"); if (!a) break; if (o === "a" && w < 1000) {} await a.click({ force: true }).catch(() => {}); await p.waitForTimeout(100); }
  const sk = await p.$("[data-act=skip]"); if (sk) await sk.click({ force: true }).catch(() => {});
  await p.evaluate(() => { document.querySelectorAll("[data-act=commit]")[0]?.click(); }); await p.waitForTimeout(150);
  await p.evaluate(() => { document.querySelector("[data-act=done]")?.click(); }); await p.waitForTimeout(200);
  const t = await p.evaluate(() => document.querySelector(".toast")?.textContent || "");
  await p.evaluate(() => document.querySelector("[data-act=undodone]")?.click()); await p.waitForTimeout(150);
  const t2 = await p.evaluate(() => document.querySelector(".toast")?.textContent || "");
  const ok = /Added/.test(t) && /Undone/.test(t2) && !errs.length; if (!ok) { bad++; console.log("FLOW", o, w, t, "|", t2, errs.join("|")); } else console.log("flow ok", o, w, t.replace("Undo", "").trim());
  await p.close();
}
console.log(n + " pages checked, " + bad + " problems"); await b.close();
