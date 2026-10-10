// Screenshots for the recipe-photos slice at several scroll points (phone 390 and 360, light and dark), plus console errors.
// Usage: python3 -m http.server 8123 &  then  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/shots-photos.mjs <outDir>
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/recipe-photos/";
const out = process.argv[2] || "shots/photos"; mkdirSync(out, { recursive: true });
const PAGES = [
  ["index", "index.html", "win"],
  ["list-A", "list.html?lt=A&state=photos", "body"], ["list-B", "list.html?lt=B", "body"], ["list-C", "list.html?lt=C", "body"],
  ["recipe-A", "recipe.html?id=efr&hero=A&state=photos", "body"], ["recipe-B", "recipe.html?id=efr&hero=B", "body"], ["recipe-C", "recipe.html?id=efr&hero=C", "body"],
  ["recipe-v2", "recipe.html?id=efr&v=v2&hero=A", "body"], ["recipe-rag", "recipe.html?id=rag", "body"],
  ["recipe-none", "recipe.html?id=efr&state=none", "body"], ["recipe-slow", "recipe.html?id=efr&state=slow", "body"],
  ["add-tonight", "add.html?to=efr&kind=cooked&from=cook&state=photos", "body"], ["add-row", "add.html?to=efr&kind=cooked&cook=29%20Sep", "body"],
  ["add-top", "add.html?to=efr&kind=cooked&step=edit&p=efr-c1,efr-c2", "body"], ["add-cam", "add.html?to=efr&kind=cooked&src=cam&from=cook", "body"],
  ["add-cover", "add.html?to=efr&kind=dish", "body"], ["add-replace", "add.html?to=efr&src=cam&kind=dish&replace=efr-1&p=efr-c2", "body"],
  ["note-recipe", "note.html?to=efr&from=recipe&n1=A", "body"], ["note-cook-B", "note.html?to=efr&from=cook&n1=B", "body"],
  ["note-rich", "note.html?to=efr&from=cook&n1=A&att=efr-c1&t=**Brown%20rice%20works**%0A-%202%20tbsp%20more%20soy%0A-%20Fry%20longer", "body"],
  ["done-cooked", "done.html?to=efr&kind=cooked&p=efr-c1,efr-c2,efr-c3&from=cook", "body"], ["done-note", "done.html?to=efr&kind=note", "body"], ["done-cover", "done.html?to=efr&kind=dish&p=efr-c2&replace=efr-1", "body"],
  ["ai-chat", "assistant.html?step=chat", "body"], ["ai-open", "assistant.html?step=open", "body"],
];
const W = [[390, 844], [360, 800]], T = [["kitchie-day", "light"], ["kitchie", "dark"]];
const b = await chromium.launch(); const problems = [];
for (const [name, path, scroller] of PAGES) for (const [w, h] of W) for (const [theme, mode] of T) {
  if (w === 360 && mode === "dark") continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(BASE + path, { waitUntil: "networkidle" }); await p.waitForTimeout(path.includes("slow") ? 400 : 700);
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
  if (w === 390 && mode === "light") console.log(name, "imgs at load:", info.imgs);
  await ctx.close();
}
await b.close();
console.log(problems.length ? "CHECKS:\n" + problems.join("\n") : "CHECKS: clean");
