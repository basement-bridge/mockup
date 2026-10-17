// Regenerates the screenshots on the empty-pane notes page (fragments/empty-pane/img/). Headless Chromium.
// Usage:  python3 -m http.server 8123 &   then   node tools/empty-pane-shots.mjs      (BASE=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const ROOT = process.env.BASE || "http://localhost:8123/fragments/empty-pane/";
const OUT = new URL("../fragments/empty-pane/img/", import.meta.url).pathname;
const T = { dark: "kitchie", light: "kitchie-day" };
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shot = async (name, file, q, scheme, w, h, sel) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme }); const p = await ctx.newPage();
  await p.goto(ROOT + file + "?" + q + "&theme=" + T[scheme]); await sleep(900);
  const opt = { path: OUT + name + ".jpg", type: "jpeg", quality: 72 };
  if (sel) await p.locator(sel).screenshot(opt); else await p.screenshot(opt);
  await ctx.close(); console.log(name);
};
for (const [s, d, th] of [["pantry", "typical", "dark"], ["pantry", "typical", "light"], ["pantry", "large", "dark"], ["pantry", "empty", "light"], ["pantry", "calm", "dark"],
  ["recipes", "typical", "light"], ["recipes", "large", "dark"], ["recipes", "empty", "dark"], ["recipes", "nostock", "light"]]) await shot(`cmp-${s}-${d}-${th}`, "compare.html", `s=${s}&d=${d}`, th, 1500, 2300, "#cmp");
await shot("pantry-f-typical-dark", "pantry.html", "o=f&d=typical&mk=0", "dark", 1280, 800);
await shot("pantry-f-typical-light", "pantry.html", "o=f&d=typical&mk=0", "light", 1280, 800);
await shot("recipes-f-typical-dark", "recipes.html", "o=f&d=typical&mk=0", "dark", 1280, 800);
await shot("recipes-f-large-light", "recipes.html", "o=f&d=large&mk=0", "light", 1280, 800);
await shot("pantry-f-1024-light", "pantry.html", "o=f&d=typical&mk=0", "light", 1024, 768);
await shot("pantry-e-1024-dark", "pantry.html", "o=e&d=typical&mk=0", "dark", 1024, 768);
await shot("pantry-e-1024-picked-dark", "pantry.html", "o=e&d=typical&open=p0&mk=0", "dark", 1024, 768);
await shot("pantry-d-touch-1024-light", "pantry.html", "o=d&d=typical&touch=1&mk=0", "light", 1024, 768);
await browser.close();
