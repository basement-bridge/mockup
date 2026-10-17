// Behaviour check for the idle pane options (Kitchie #867, Pantry and Recipes on desktop, nothing picked). Headless Chromium, 1280 and 1024 wide, dark and light.
// Checks: every option draws (or, for E, draws nothing) in every household state on both screens; the numbers in a block equal the rows its filter then shows (so the pane cannot disagree with the list);
// a name opens the item and closing brings the pane back; empty households get prompts, not summaries; the all-fine state of the recommendation is today's one line (Empty is absent);
// every control in the pane is 44px or more high; no sideways scroll; no page errors; and the pane asks the network for nothing (no fetch, no XHR) at load or on a click.
// Usage:  python3 -m http.server 8123 &   then   node tools/empty-pane-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox).
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const ROOT = process.env.BASE || "http://localhost:8123/fragments/empty-pane/";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const errs = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, file, q) {
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  const reqs = []; p.on("request", r => { if (["fetch", "xhr"].includes(r.resourceType())) reqs.push(r.url()); }); p.__reqs = reqs;
  await p.goto(ROOT + file + "?" + (q || "") + (q ? "&" : "") + "mk=0"); await sleep(120); return p;
}
const lane = p => p.locator("#lane");
const laneText = async p => (await lane(p).innerText()).replace(/\s+/g, " ").trim();
const laneShown = p => p.evaluate(() => { const l = document.getElementById("lane"); return !!l && !l.hidden && getComputedStyle(l).display !== "none" && l.innerText.trim() !== ""; });
const OPTS = ["a", "b", "c", "d", "e", "f"];
const SHAPES = { pantry: ["empty", "typical", "large", "calm"], recipes: ["empty", "typical", "large", "calm", "nostock"] };
const num = t => +String(t).replace(/\D/g, "");

for (const [w, h, scheme] of [[1280, 800, "dark"], [1280, 800, "light"], [1024, 768, "dark"], [1024, 768, "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme }); const tag = `${w} ${scheme}`;
  const theme = scheme === "dark" ? "kitchie" : "kitchie-day";
  for (const screen of ["pantry", "recipes"]) {
    const file = screen + ".html";
    for (const d of SHAPES[screen]) for (const o of OPTS) {
      const p = await open(ctx, file, `o=${o}&d=${d}&theme=${theme}`); const t = `${tag} ${screen} ${d} ${o.toUpperCase()}`;
      const shown = await laneShown(p);
      if (o === "e") {
        ok(`${t}: option E draws no lane at rest`, !shown && (await p.evaluate(() => document.getElementById("app").dataset.lane)) === "none");
      } else {
        ok(`${t}: the lane has content`, shown);
        const text = await laneText(p);
        if (d === "empty") ok(`${t}: an empty household gets a way forward, not a summary`, /Add an item|Ask your assistant|Nothing opened yet|Find it fast/.test(text) && !/Use soon|Running low|Ready now/.test(text), text);
        // every control in the pane is at least 44px high
        const small = await p.evaluate(() => [...document.querySelectorAll("#lane button")].filter(b => b.offsetParent && b.getBoundingClientRect().height < 43.5).map(b => b.className + ":" + Math.round(b.getBoundingClientRect().height)));
        ok(`${t}: every control in the pane is 44px or more`, small.length === 0, small);
      }
      ok(`${t}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
      ok(`${t}: the pane asked the network for nothing`, p.__reqs.length === 0, p.__reqs);
      await p.close();
    }
  }

  // ---------- the numbers equal what the filter then shows (Pantry A and F, large) ----------
  for (const [o, d] of [["a", "typical"], ["a", "large"], ["f", "typical"], ["f", "large"]]) {
    const p = await open(ctx, "pantry.html", `o=${o}&d=${d}&theme=${theme}`); const t = `${tag} Pantry ${o.toUpperCase()} ${d}`;
    for (const f of ["soon", "low", "out"]) {
      const has = await p.locator(`#lane [data-blk="${f}"]`).count();
      if (!has) continue;
      const n = num(await p.locator(`#lane [data-blk="${f}"] .ip-n`).innerText());
      await p.locator(`#lane [data-blk="${f}"] .ip-bh`).click(); await sleep(60);
      const rows = await p.locator("#list [data-row]").count();
      ok(`${t}: "${f}" says ${n} and its filter lists ${rows}`, n === rows, [n, rows]);
      await p.locator('[data-act="clearflt"]').click(); await sleep(40);
    }
    await p.close();
  }
  for (const [o, d] of [["a", "typical"], ["a", "large"], ["f", "large"]]) {
    const p = await open(ctx, "recipes.html", `o=${o}&d=${d}&theme=${theme}`); const t = `${tag} Recipes ${o.toUpperCase()} ${d}`;
    const n = num(await p.locator('#lane [data-blk="ready"] .ip-n').innerText());
    await p.locator('#lane [data-blk="ready"] .ip-bh').click(); await sleep(60);
    const rows = await p.locator("#list [data-row]").count();
    ok(`${t}: "Ready now" says ${n} and its filter lists ${rows}`, n === rows, [n, rows]);
    await p.close();
  }

  // ---------- picking, closing, keys ----------
  { const p = await open(ctx, "pantry.html", `o=f&d=typical&theme=${theme}`); const t = `${tag} Pantry F`;
    await p.locator('#lane [data-blk="soon"] .ip-nm').first().click(); await sleep(60);
    ok(`${t}: a name in the pane opens that item in the lane`, /Used up/.test(await laneText(p)) && (await p.locator(".rowx.sel").count()) === 1);
    ok(`${t}: opening it made no request`, p.__reqs.length === 0, p.__reqs);
    await p.keyboard.press("Control+Escape"); await sleep(60);
    ok(`${t}: Ctrl Esc closes it and the pane is back`, /Use soon/.test(await laneText(p)) && (await p.locator(".rowx.sel").count()) === 0);
    await p.keyboard.press("/"); ok(`${t}: "/" focuses the search`, await p.evaluate(() => document.activeElement && document.activeElement.id === "q"));
    await p.close(); }
  { const p = await open(ctx, "pantry.html", `o=f&d=calm&theme=${theme}`); const t = `${tag} Pantry F calm`;
    const text = await laneText(p);
    ok(`${t}: when nothing needs attention the lane says today's one line and draws no blocks (Empty is absent)`, /^Pick an item to see it here\./.test(text) && (await p.locator("#lane .ip-blk").count()) === 0, text); await p.close(); }
  { const p = await open(ctx, "recipes.html", `o=f&d=nostock&theme=${theme}`); const t = `${tag} Recipes F nostock`;
    ok(`${t}: with the pantry unreadable it says so and never claims anything is ready`, /cannot read the pantry/.test(await laneText(p)) && (await p.locator('#lane [data-blk="ready"]').count()) === 0); await p.close(); }
  { const p = await open(ctx, "recipes.html", `o=f&d=typical&theme=${theme}`); const t = `${tag} Recipes F`;
    ok(`${t}: Planned this week and Cooked lately are labels, not buttons (the list has no such chip)`, (await p.locator('#lane [data-blk="planned"] button.ip-bh').count()) === 0 && (await p.locator('#lane [data-blk="lately"] button.ip-bh').count()) === 0);
    ok(`${t}: the pane never names a missing ingredient (the list does not carry one)`, !/missing/i.test((await laneText(p)).replace(/Planned|Cooked/g, "")));
    await p.close(); }

  // ---------- option C remembers on this device, and starts empty on a first visit ----------
  { const p = await open(ctx, "pantry.html", `o=c&d=typical&fresh=1&theme=${theme}`); const t = `${tag} Pantry C`;
    ok(`${t}: a first visit says nothing has been opened yet`, /Nothing opened yet/.test(await laneText(p)));
    await p.locator("#list [data-row]").nth(2).click(); await p.keyboard.press("Control+Escape"); await sleep(60);
    ok(`${t}: after opening one it is the "left off" item`, (await p.locator("#lane .ip-last").count()) === 1);
    await p.close();
    const p2 = await open(ctx, "pantry.html", `o=c&d=typical&theme=${theme}`);
    ok(`${t}: a visit with some history leads with the last item`, (await p2.locator("#lane .ip-last").count()) === 1); await p2.close(); }

  // ---------- option D on a touch tablet: no keys it cannot use ----------
  { const p = await open(ctx, "pantry.html", `o=d&d=typical&touch=1&theme=${theme}`); const t = `${tag} Pantry D touch`;
    ok(`${t}: touch mode drops the key list for a tap line`, (await p.locator("#lane .ip-keys").count()) === 0 && /Tap an item/.test(await laneText(p))); await p.close(); }
  { const p = await open(ctx, "pantry.html", `o=f&d=typical&touch=1&theme=${theme}`); const t = `${tag} Pantry F touch`;
    ok(`${t}: the hint line in touch mode says Tap, no key caps`, /Tap an item/.test(await laneText(p)) && (await p.locator("#lane .ip-foot .kbd").count()) === 0); await p.close(); }

  // ---------- option E: the lane appears on a pick, the column moves (this is the cost) ----------
  { const p = await open(ctx, "pantry.html", `o=e&d=typical&theme=${theme}`); const t = `${tag} Pantry E`;
    const w0 = await p.evaluate(() => Math.round(document.querySelector(".col").getBoundingClientRect().width));
    await p.locator("#list [data-row]").first().click(); await sleep(60);
    const w1 = await p.evaluate(() => Math.round(document.querySelector(".col").getBoundingClientRect().width));
    ok(`${t}: a pick opens the lane`, await laneShown(p));
    if (w < 1224) ok(`${t}: at ${w}px the list gives up width when the lane opens (so the list moves on a pick)`, w0 > w1, [w0, w1]);
    else ok(`${t}: at ${w}px the list is already capped at 640, so collapsing buys no width`, w0 === w1 && w0 === 640, [w0, w1]);
    await p.keyboard.press("Control+Escape"); await sleep(60);
    ok(`${t}: closing hides the lane again`, !(await laneShown(p)));
    await p.close(); }
  { const p = await open(ctx, "pantry.html", `o=e&d=typical&ev=quiet&theme=${theme}`); const t = `${tag} Pantry E quiet`;
    ok(`${t}: the quiet variant keeps the lane's place but draws nothing in it`, (await p.evaluate(() => document.getElementById("app").dataset.lane)) === "quiet" && (await lane(p).innerText()).trim() === ""); await p.close(); }

  // ---------- the pane fits the lane at a small laptop height (F only; A is allowed to scroll, and the page says so) ----------
  for (const [screen, d] of [["pantry", "typical"], ["pantry", "large"], ["recipes", "typical"], ["recipes", "large"]]) {
    const p = await open(ctx, screen + ".html", `o=f&d=${d}&theme=${theme}`);
    const hgt = await p.evaluate(() => { const e = document.querySelector(".ip"); e.style.minHeight = "0"; e.querySelector(".ip-foot") && (e.querySelector(".ip-foot").style.marginTop = "0"); return Math.round(e.getBoundingClientRect().height); });
    ok(`${tag} ${screen} F ${d}: the recommended pane is at most 768px tall, so it does not scroll on a small laptop`, hgt <= 768, hgt);
    await p.close();
  }
  await ctx.close();
}
ok("no page errors", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log(fails ? `${fails} of ${total} checks FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
