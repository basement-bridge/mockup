// Screenshots for the recipe-versions slice at several scroll points (phone 390, light and dark), plus console errors,
// sideways scroll and small tap targets. Usage: python3 -m http.server 8123 &  then
//   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/shots-versions.mjs <outDir>
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/recipe-versions/";
const out = process.argv[2] || "shots/versions"; mkdirSync(out, { recursive: true });
const PAGES = [
  ["index", "index.html", "win"], ["spec", "spec.html", "win", 8],
  ["usual-review", "version.html?v=v1", "body"], ["try", "version.html?v=v2", "body"], ["original", "version.html?v=v0", "body"],
  ["family", "family.html", "body"], ["change-keeper", "change.html?v=v1", "body"], ["chat-keeper", "change.html?v=v1&step=chat", "body"],
  ["chat-keeper-fix", "change.html?v=v1&step=chat", "body", 0, "[data-p=fix]"], ["chat-try", "change.html?v=v2&step=chat", "body"],
  ["after-try", "after-cook.html?v=v2", "body", 0, "[data-vd=no]"], ["after-unreviewed", "after-cook.html?v=v1", "body"],
  ["history", "history.html?v=v1", "body"], ["blame", "history.html?v=v1", "body", 0, "[data-tab=who]"], ["compare", "history.html?v=v1&cmp=v2", "body"],
  ["review", "suggestions.html", "body"], ["review-undo", "suggestions.html?cooked=1", "body", 0, "[data-undo=c2]"],
  // Owner's answers, 10 Oct 2026: notes inherited per version (2), undo any time (3), reactions per member (5)
  ["notes-child", "version.html?v=v2", "body", 4], ["notes-hidden", "version.html?v=v4", "body", 4],
  ["add-note", "version.html?v=v2", "body", 0, "[data-note]"], ["after-try-keep", "after-cook.html?v=v2", "body", 4, "[data-vd=keep]"],
  ["history-try", "history.html?v=v2", "body"], ["history-away", "history.html?v=v4", "body"],
  ["undo-rev", "history.html?v=v2", "body", 0, "[data-undorev='2']"]
];
const T = [["kitchie-day", "light"], ["kitchie", "dark"]];
const b = await chromium.launch(); const problems = [];
for (const [name, path, scroller, nStops, click] of PAGES) for (const [theme, mode] of T) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(BASE + path, { waitUntil: "networkidle" }); await p.waitForTimeout(400);
  if (click) { await p.click(click); await p.waitForTimeout(400); }
  const info = await p.evaluate(() => { const de = document.documentElement; const small = [...document.querySelectorAll("a,button,input")].filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !(el.tagName === "A" && cs.display === "inline") && !el.closest(".mockp") && (r.height < 35.5 || r.width < 35.5); }).slice(0, 4).map(el => el.tagName + "." + String(el.className).slice(0, 20) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)); return { sw: de.scrollWidth, cw: de.clientWidth, small }; });
  const H = scroller === "win" ? await p.evaluate(() => document.documentElement.scrollHeight - innerHeight) : await p.evaluate(() => { const b = document.getElementById("body") || document.querySelector(".body"); return b ? b.scrollHeight - b.clientHeight : 0; });
  const n = nStops || 3; const stops = [...new Set(Array.from({ length: n }, (_, i) => Math.round(H * i / (n - 1 || 1))))];
  let i = 0;
  for (const y of stops) {
    if (scroller === "win") await p.evaluate(y => window.scrollTo(0, y), y); else await p.evaluate(y => { const b = document.getElementById("body") || document.querySelector(".body"); if (b) b.scrollTop = y; }, y);
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${name}__${mode}-${i++}.png` });
  }
  const fl = [];
  if (info.sw > info.cw) fl.push(`SIDEWAYS ${info.sw}>${info.cw}`);
  if (info.small.length) fl.push("small: " + info.small.join("; "));
  if (errs.length) fl.push("ERRORS: " + errs.join(" / "));
  if (fl.length) problems.push(`${name} ${mode}: ${fl.join(" | ")}`);
  await ctx.close();
}
await b.close();
console.log(problems.length ? problems.join("\n") : "no problems");
