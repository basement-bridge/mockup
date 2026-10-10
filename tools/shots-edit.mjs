// Screenshots for Edit by hand (recipe/edit.html): phone 390 in light and dark, desktop 1280 in light, plus console errors, sideways scroll
// and small tap targets. Usage: python3 -m http.server 8123 &  then
//   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/shots-edit.mjs <outDir>      (ONLY=crop,photos limits it to those scenes)
// (playwright-core must resolve: run with NODE_PATH or from a folder that has it; tools/shots-versions.mjs imports it the same way.)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/recipe/";
const out = process.argv[2] || "shots/edit"; mkdirSync(out, { recursive: true });
const body = (p, y) => p.evaluate(y => { const b = document.getElementById("body"); b.style.scrollBehavior = "auto"; b.scrollTop = typeof y === "number" ? y : b.scrollHeight; }, y);
const to = (p, id) => p.evaluate(id => { const b = document.getElementById("body"); b.style.scrollBehavior = "auto"; const  el = document.getElementById(id), jr = b.querySelector(".jumps"); b.scrollTop = el.offsetTop - (jr ? jr.offsetHeight : 0); }, id);
const click = async (p, s) => { await p.click(s); await p.waitForTimeout(350); };
// [name, url, viewports ("p" phone, "d" desktop), async action]
const S = [
  ["try-details", "edit.html?id=efr&v=v2", "p", async p => {}],
  ["keeper-details", "edit.html?id=efr&v=v1", "pd", async p => {}],
  ["ingredients", "edit.html?id=efr&v=v1&sec=ing&demo=changed", "pd", async p => { await to(p, "ing"); }],
  ["reorder-mode", "edit.html?id=efr&v=v1", "p", async p => { await to(p, "ing"); await click(p, "[data-reord=ing]"); await click(p, "[data-mv='ings:i2:1']"); }],
  ["reorder-menu", "edit.html?id=efr&v=v1&reorder=menu", "p", async p => { await to(p, "ing"); await click(p, "[data-menu='ings:i1']"); }],
  ["method", "edit.html?id=efr&v=v1&sec=met&demo=changed", "pd", async p => { await to(p, "met"); }],
  ["method-prep", "edit.html?id=efr&v=v2", "p", async p => { await to(p, "met"); await body(p, (await p.evaluate(() => document.getElementById("met").offsetTop)) + 130); }],
  ["notes-edit", "edit.html?id=efr&v=v1", "pd", async p => { await to(p, "not"); await click(p, "[data-nedit]"); }],
  ["photos", "edit.html?id=efr&v=v1", "pd", async p => { await body(p); await p.waitForTimeout(900); }],
  ["photos-inherited", "edit.html?id=efr&v=v2", "p", async p => { await body(p); await p.waitForTimeout(900); }],
  ["photo-actions-step", "edit.html?id=efr&v=v1", "pd", async p => { await to(p, "met"); await click(p, "[data-sph]:has(img)"); await p.waitForTimeout(600); }],
  ["photo-actions-prep", "edit.html?id=efr&v=v2", "p", async p => { await to(p, "met"); await click(p, ".edph.has"); await p.waitForTimeout(400); }],
  ["photo-actions-banner", "edit.html?id=efr&v=v1", "p", async p => { await body(p); await click(p, "[data-bph]"); await p.waitForTimeout(600); }],
  ["crop", "edit.html?id=efr&v=v1", "pd", async p => { await body(p); await click(p, "[data-bph]"); await click(p, "[data-a=crop]"); await p.waitForTimeout(600); }],
  ["crop-soft", "edit.html?id=efr&v=v1", "pd", async p => { await body(p); await click(p, "[data-bph]"); await click(p, "[data-a=crop]"); await p.evaluate(() => { const r = document.querySelector(".crop input[type=range]"); r.value = 3; r.dispatchEvent(new Event("input")); }); await click(p, "[data-rot='90']"); await p.waitForTimeout(300); }],
  ["crop-used", "edit.html?id=efr&v=v1", "p", async p => { await body(p); await click(p, "[data-bph]"); await click(p, "[data-a=crop]"); await click(p, "[data-rot='90']"); await click(p, "[data-use]"); await body(p); await p.waitForTimeout(700); }],
  ["replace-prep", "edit.html?id=efr&v=v1", "p", async p => { await body(p); await click(p, "[data-bph]"); await click(p, "[data-a=replace]"); await click(p, "[data-src]"); await body(p); }],
  ["save-keeper-sheet", "edit.html?id=efr&v=v1&demo=ask", "p", async p => {}],
  ["save-keeper-both", "edit.html?id=efr&v=v1&demo=ask", "p", async p => { await click(p, "[data-p=both]"); }],
  ["save-keeper-inline", "edit.html?id=efr&v=v1&demo=changed&ask=inline", "p", async p => { await click(p, "#sv"); await click(p, "[data-ask=fix]"); }],
  ["save-keeper-lane", "edit.html?id=efr&v=v1&demo=changed", "d", async p => { await click(p, "[data-p=both]"); }],
  ["save-try", "edit.html?id=efr&v=v2&demo=changed", "pd", async p => {}],
  ["discard", "edit.html?id=efr&v=v1&demo=changed", "p", async p => { await click(p, ".top .back"); }],
  ["one-version", "edit.html?id=cur&v=v0", "p", async p => {}],
  ["detail", "detail.html?id=efr&v=v1", "pd", async p => {}],
  ["detail-saved", "detail.html?id=efr&v=v1&saved=4&how=fix&n=3", "p", async p => {}],
  ["detail-more", "detail.html?id=efr&v=v1", "p", async p => { await click(p, "[data-more]"); }],
  ["history", "../recipe-versions/history.html?v=v1", "p", async p => {}]
];
const VP = { p: { width: 390, height: 844 }, d: { width: 1280, height: 800 } };
const T = [["kitchie-day", "light"], ["kitchie", "dark"]];
const b = await chromium.launch(); const problems = [];
const ONLY = (process.env.ONLY || "").split(",").filter(Boolean);
for (const [name, path, vps, act] of S) if (!ONLY.length || ONLY.includes(name)) for (const vp of vps) for (const [theme, mode] of T) {
  if (vp === "d" && mode === "dark" && !["keeper-details", "crop"].includes(name)) continue;
  const ctx = await b.newContext({ viewport: VP[vp], colorScheme: mode, hasTouch: vp === "p", isMobile: false });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(BASE + path, { waitUntil: "load" }); await p.waitForTimeout(500);
  try { await act(p); } catch (e) { errs.push("ACTION: " + e.message.split("\n")[0]); }
  await p.waitForTimeout(300);
  const info = await p.evaluate(() => { const de = document.documentElement; const small = [...document.querySelectorAll(".phone a,.phone button,.phone input,.phone select")].filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !(el.tagName === "A" && cs.display === "inline") && !el.closest("#rk-help") && (r.height < 35.5 || r.width < 35.5); }).slice(0, 4).map(el => el.tagName + "." + String(el.className).slice(0, 20) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)); return { sw: de.scrollWidth, cw: de.clientWidth, small }; });
  await p.screenshot({ path: `${out}/${name}__${vp === "p" ? "phone" : "desktop"}-${mode}.png` });
  const fl = [];
  if (info.sw > info.cw) fl.push(`SIDEWAYS ${info.sw}>${info.cw}`);
  if (info.small.length) fl.push("small: " + info.small.join("; "));
  if (errs.length) fl.push("ERRORS: " + errs.join(" / "));
  if (fl.length) problems.push(`${name} ${vp} ${mode}: ${fl.join(" | ")}`);
  await ctx.close();
}
await b.close();
console.log(problems.length ? problems.join("\n") : "no problems");
