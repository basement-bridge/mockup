// Screenshots for the recipe-photos slice (owner's typed decisions of 10 Oct 2026 applied) at several scroll points (phone 390 and 360, light and dark), plus console errors.
// Usage: python3 -m http.server 8123 &  then  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/shots-photos.mjs <outDir>
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/recipe-photos/";
const out = process.argv[2] || "shots/photos"; mkdirSync(out, { recursive: true });
const PAGES = [
  ["index", "index.html", "win"],
  ["list", "list.html?plan=yes&state=photos", "body"], ["list-noplan", "list.html?plan=no&state=photos", "body"], ["list-batch", "list.html?plan=yes&chip=batch&state=photos", "body"],
  ["recipe", "recipe.html?id=efr&state=photos", "body"], ["recipe-v2-inherited", "recipe.html?id=efr&v=v2&state=photos", "body"],
  ["recipe-rag-nobanner", "recipe.html?id=rag&state=photos", "body"], ["recipe-none", "recipe.html?id=efr&state=none", "body"],
  ["recipe-slow", "recipe.html?id=efr&state=slow", "body"], ["recipe-prep", "recipe.html?id=efr&state=prep", "body"],
  ["recipe-undo", "recipe.html?id=efr&state=photos&removed=efr-3", "body"],
  ["add-tonight", "add.html?to=efr&kind=cooked&from=cook&state=photos", "body"], ["add-row", "add.html?to=efr&kind=cooked&cook=29%20Sep", "body"],
  ["add-cam", "add.html?to=efr&kind=cooked&src=cam&from=cook", "body"], ["add-raw", "add.html?to=efr&kind=cooked&src=cam&from=cook&phone=raw", "body"],
  ["add-banner", "add.html?to=efr&kind=banner", "body"], ["add-replace", "add.html?to=efr&src=cam&kind=banner&replace=efr-1&p=efr-c2", "body"],
  ["add-step", "add.html?to=efr&kind=step&sn=2&src=cam&p=efr-s2", "body"],
  ["note-recipe", "note.html?to=efr&from=recipe&n1=A", "body"], ["note-flow", "note.html?to=efr&from=cook&v=v1&cook=ck_1&back=..%2Frecipe%2Fdetail.html%3Fid%3Defr%26v%3Dv1%23not", "body"],
  ["done-note-back", "done.html?to=efr&kind=note&v=v1&back=..%2Frecipe%2Fdetail.html%3Fid%3Defr%26v%3Dv1%23not", "body"],
  ["done-cooked", "done.html?to=efr&kind=cooked&p=efr-c1,efr-c2,efr-c3&from=cook", "body"], ["done-replace", "done.html?to=efr&kind=banner&p=efr-c2&replace=efr-1", "body"], ["done-raw", "done.html?to=efr&kind=cooked&p=efr-c2&phone=raw", "body"],
  ["ai-chat", "assistant.html?step=chat", "body"], ["ai-retry", "assistant.html?step=retry", "body"], ["ai-read", "assistant.html?step=read", "body"], ["ai-open", "assistant.html?step=open", "body"],
  ["free", "free.html?to=efr", "body"], ["free-open", "free.html?to=efr&open=efr:v0", "body"], ["free-undo", "free.html?removed=efr-3,efr-s1", "body"],
];
const W = [[390, 844], [360, 800]], T = [["kitchie-day", "light"], ["kitchie", "dark"]];
const b = await chromium.launch(); const problems = [];
for (const [name, path, scroller] of PAGES) for (const [w, h] of W) for (const [theme, mode] of T) {
  if (w === 360 && mode === "dark") continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(BASE + path, { waitUntil: "networkidle" }); await p.waitForTimeout(path.includes("slow") ? 4000 : 900);
  const info = await p.evaluate(() => { const de = document.documentElement; const small = [...document.querySelectorAll("a,button,input")].filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !(el.tagName === "A" && cs.display === "inline") && !el.closest(".mockp") && (r.height < 35.5 || r.width < 35.5); }).slice(0, 4).map(el => el.tagName + "." + String(el.className).slice(0, 20) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)); return { sw: de.scrollWidth, cw: de.clientWidth, small, imgs: [...document.querySelectorAll("img[src]")].length }; });
  const H = scroller === "win" ? await p.evaluate(() => document.documentElement.scrollHeight) : await p.evaluate(() => { const b = document.getElementById("body") || document.querySelector(".body"); return b ? b.scrollHeight - b.clientHeight : 0; });
  const stops = scroller === "win" ? [0, Math.round(H * .33), Math.round(H * .66), H] : [0, Math.round(H / 2), H];
  let i = 0;
  for (const y of [...new Set(stops)]) {
    if (scroller === "win") await p.evaluate(y => window.scrollTo(0, y), y); else await p.evaluate(y => { const b = document.getElementById("body") || document.querySelector(".body"); if (b) b.scrollTop = y; }, y);
    await p.waitForTimeout(450);
    await p.screenshot({ path: `${out}/${name}__${w}-${mode}-${i++}.png` });
  }
  const fl = [];
  if (info.sw > info.cw) fl.push(`SIDEWAYS ${info.sw}>${info.cw}`);
  if (info.small.length) fl.push("small: " + info.small.join("; "));
  if (errs.length) fl.push("ERRORS: " + errs.join(" / "));
  if (fl.length) problems.push(`${name} @${w} ${mode}: ${fl.join(" | ")}`);
  if (w === 390 && mode === "light") { const order = await p.evaluate(() => performance.getEntriesByType("resource").filter(e => /\/img\//.test(e.name)).map(e => e.name.split("/").pop())); const txt = await p.evaluate(() => performance.getEntriesByType("paint").map(e => e.name + ":" + Math.round(e.startTime)).join(" ")); console.log(name, "image requests in order:", order.join(" ") || "none", "|", txt); }
  await ctx.close();
}
await b.close();
console.log(problems.length ? "CHECKS:\n" + problems.join("\n") : "CHECKS: clean");
