// One list language (fragments/list-language): four variants (A dense, B cards, C sections, D table) of Pantry, Recipes and Home at 390 and 360, light and dark.
// 1. every state of every phone: console errors, sideways scroll, tap targets under 44px, a row or control cut off at the right edge;
// 2. the shared drive: on each variant Filters, Add (or the assistant) and the magnifier sit in the same place on Pantry and Recipes, and the same controls exist;
// 3. behaviour: chips, fold, sort (menu, direction, Custom view, clear), Filters sheet, search and its empty state, picking several and the bar that replaces the tab bar, toasts;
// 4. the comparison page (index.html): all twelve phones, no sideways scroll at 360, 390 and 1760, the four stylesheets present;
// 5. tokens only: no raw colour in the fragment's CSS (a box-shadow's black is the one allowed literal).
// Usage: python3 -m http.server 8140 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/list-language-check.mjs [shotsDir]
import { chromium } from "playwright-core";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8140/fragments/list-language/";
const shots = process.argv[2] || ""; if (shots) mkdirSync(shots, { recursive: true });
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const V = (process.env.ONLY || "abcd").split(""), S = ["pantry", "recipes", "home"], FAST = !!process.env.FAST; /* ONLY=ab limits the variants; FAST=1 skips the all-states sweep */
const STATES = ["", "state=search", "state=search&q=ch", "state=search&q=zzq", "state=select&pick=turmeric,spinach", "state=filters", "state=sort", "state=custom", "state=folded", "chip=Veggies"];
const RSTATES = ["", "state=search", "state=search&q=zzq", "state=select&pick=saag,dal", "state=filters", "state=sort", "state=custom", "state=folded", "chip=ready"];
const audit = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && r.height && cs.visibility !== "hidden" && cs.display !== "none" && !e.closest("[hidden]"); };
  const ph = document.querySelector(".llp").getBoundingClientRect();
  const small = [...document.querySelectorAll(".llp button,.llp a,.llp input")].filter((e) => { const r = e.getBoundingClientRect(); return vis(e) && (r.height < 43.5 || r.width < 43.5) && r.bottom > ph.top && r.top < ph.bottom; }).map((e) => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
  const cut = [...document.querySelectorAll(".llp .r-main,.llp .tp-rest>*,.llp .hm-acts .btn")].filter((e) => vis(e) && e.getBoundingClientRect().right > ph.right + 1 && !e.closest(".ch-scroll,.cv-pills,.hm-out .rows,.hm-low .rows")).map((e) => e.className);
  return { x: document.documentElement.scrollWidth > innerWidth + 1, small: [...new Set(small)].slice(0, 5), cut: [...new Set(cut)].slice(0, 3) };
};
const open = async (ctx, v, s, q, errs) => { const p = await ctx.newPage(); p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(`${BASE}app.html?v=${v}&s=${s}${q ? "&" + q : ""}`); await p.waitForSelector(".llp .ll-body", { timeout: 5000 }); await p.waitForTimeout(40); return p; };

// ---- 1. every state ----
for (const mode of FAST ? [] : ["dark", "light"]) for (const w of [390, 360]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, colorScheme: mode }); const errs = [];
  for (const v of V) for (const s of S) for (const q of (s === "pantry" ? STATES : s === "recipes" ? RSTATES : [""])) {
    const p = await open(ctx, v, s, q, errs);
    const r = await p.evaluate(audit);
    ok(`${v} ${s} ${w} ${mode} [${q}] layout`, !r.x && !r.small.length && !r.cut.length, r);
    if (shots && (!q || /select|filters|sort/.test(q)) && w === 390) await p.screenshot({ path: `${shots}/ll-${v}-${s}-${q.replace(/\W+/g, "_") || "rest"}-${mode}.png` });
    await p.close();
  }
  ok(`console errors ${w} ${mode}`, !errs.length, errs.slice(0, 3));
  await ctx.close();
}

// ---- 2. the shared drive: same controls, same places, Pantry and Recipes ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" }); const errs = [];
  for (const v of V) {
    const g = async (s) => { const p = await open(ctx, v, s, "", errs); const r = await p.evaluate(() => { const bx = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const vis = r.width && r.height && getComputedStyle(e).display !== "none"; return vis ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null; };
      return { filters: bx(".tp-filters"), add: bx(".tp-add"), find: bx(".tp-find"), sort: bx(".tp-sort") || bx(".hd-name"), sel: bx(".tp-sel") || bx(".ch-sel") || bx(".hd-sel") || bx(".ll-fab"), mode: bx(".ch-mode") || bx(".ll-seg"), chips: bx(".ch-scroll"), tabs: bx(".ll-tabs"), badge: !!document.querySelector(".ll-tabs .badge"), tabn: document.querySelectorAll(".ll-tabs a").length, top: bx(".ll-top") }; }); await p.close(); return r; };
    const P = await g("pantry"), R = await g("recipes");
    const same = (a, b) => a === b || (a && b && a[1] === b[1] && a[3] === b[3] && (a[0] === b[0] || a[0] + a[2] === b[0] + b[2])); /* a label may change the width (A to Z, Best match); the row, the height and one edge may not */
    for (const k of ["filters", "add", "find", "sort", "sel", "mode", "tabs", "top"]) ok(`${v} same ${k} on Pantry and Recipes`, same(P[k], R[k]), [P[k], R[k]]);
    ok(`${v} Filters is the leftmost control and the magnifier the rightmost`, P.filters[0] < 20 && P.find[0] + P.find[2] > 390 - 20, [P.filters, P.find]);
    ok(`${v} the add control sits immediately left of the magnifier`, P.add && P.add[0] + P.add[2] <= P.find[0] + 1 && P.find[0] - (P.add[0] + P.add[2]) <= 12, [P.add, P.find]);
    ok(`${v} five tabs and the Shopping badge`, P.tabn === 5 && P.badge && R.tabn === 5 && R.badge);
    ok(`${v} a pick-several entry and a sort entry are visible (C: the sheet and the segmented control)`, !!P.sel && (!!P.sort || v === "c"), P);
  }
  await ctx.close();
}

// ---- 3. behaviour ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" }); const errs = [];
  const txt = async (p, sel) => (await p.locator(sel).first().textContent()).replace(/\s+/g, " ").trim();
  const cnt = (p, sel) => p.locator(sel).count();
  for (const v of V) {
    // Pantry
    let p = await open(ctx, v, "pantry", "", errs);
    ok(`${v} pantry opens grouped by category, A to Z`, (await cnt(p, ".g")) === 5 && /Spices/i.test(await txt(p, ".g-h h2")));
    ok(`${v} the past-use-by flag reads "Past use by 1 day" (or its short form in D)`, v === "d" ? /Past 1d/.test(await p.locator(".fl--p .fl-s", { hasText: "Past" }).first().textContent()) : /Past use by 1 day/.test(await p.locator(".fl--p .fl-t", { hasText: "Past" }).first().textContent()));
    ok(`${v} turmeric shows the past-use-by flag, danger tone`, (await cnt(p, ".r .fl-danger.fl--p")) === 1);
    ok(`${v} the 24 hour cue is on Smoked paprika`, (await cnt(p, '.cue[aria-label="Added in the last 24 hours"]')) >= 1);
    ok(`${v} no category repeated in the grey line while grouped by category`, !(await p.locator(".g").first().locator(".m-grp").count()));
    // chips
    await p.click('.ch[data-c="Veggies"]'); ok(`${v} Veggies chip narrows the list`, (await cnt(p, ".r")) === 5 && (await p.locator('.ch[data-c="Veggies"]').getAttribute("aria-pressed")) === "true", await cnt(p, ".r"));
    await p.click('.ch[data-c="all"]');
    // mode toggle: location (A B D) or segmented (C)
    if (v === "c") await p.click('.ll-seg [data-g="loc"]'); else await p.click(".ch-mode");
    ok(`${v} switches to locations`, (await cnt(p, '.ch[data-c="Fridge"]')) === 1 && /Fridge|Pantry/.test(await txt(p, ".g-h h2")), [await cnt(p, '.ch[data-c="Fridge"]'), await txt(p, ".g-h h2")]);
    if (v === "c") { await p.click('.ll-seg [data-g="use"]'); ok(`C Use by grouping has Past use by first`, /Past use by/.test(await txt(p, ".g-h h2"))); await p.click('.ll-seg [data-g="cat"]'); } else await p.click(".ch-mode");
    // fold
    await p.click(".g-h"); ok(`${v} a group folds`, (await cnt(p, ".g.shut")) === 1 && (await p.locator(".g.shut .rows").isHidden()));
    await p.click(".g-h"); ok(`${v} and opens again`, (await cnt(p, ".g.shut")) === 0);
    // sort
    if (v === "c") { await p.click(".tp-filters"); await p.click('.sh-seg [data-k="use"]'); await p.click('.ll-sheet .btn.pri'); }
    else if (v === "d") await p.click('.hd[data-k="use"]');
    else { await p.click(".tp-sort"); await p.click('.ll-menu [data-k="use"]'); }
    ok(`${v} sorting by Use by makes a Custom view (one list, a strip with a remove pill)`, (await cnt(p, ".ll-cv")) === 1 && (await cnt(p, ".g")) === 0 && (await cnt(p, ".cv-p")) === 1);
    ok(`${v} Use by sort puts the past-use-by item first`, /Turmeric/.test(await txt(p, ".r .nm")));
    await p.click(".cv-clear"); ok(`${v} Clear returns to the grouped default`, (await cnt(p, ".ll-cv")) === 0 && (await cnt(p, ".g")) === 5);
    // Filters sheet
    await p.click(".tp-filters"); ok(`${v} Filters sheet opens`, (await cnt(p, ".ll-sheet")) === 1);
    await p.click('.sh-p[data-k="low"]'); ok(`${v} Running low filter narrows and the sheet says how many`, /Show 5 items/.test(await txt(p, ".sh-f .btn.pri")), await txt(p, ".sh-f .btn.pri"));
    await p.click(".sh-f .btn.pri"); ok(`${v} Show closes the sheet; the Filters button carries a count`, (await cnt(p, ".ll-sheet")) === 0 && (await txt(p, ".tp-n")) === "1");
    await p.click(".cv-p"); ok(`${v} removing the pill ends the Custom view`, (await cnt(p, ".ll-cv")) === 0);
    // search
    await p.click(".tp-find"); ok(`${v} the magnifier opens a search bar over the whole row`, (await p.locator(".tp-search").isVisible()) && (await p.locator(".tp-filters").isHidden() || (await p.evaluate(() => getComputedStyle(document.querySelector(".tp-rest")).visibility)) === "hidden"));
    await p.fill(".tp-q", "milk"); ok(`${v} typing filters by name and keeps focus`, (await cnt(p, ".r")) === 1 && (await p.evaluate(() => document.activeElement.classList.contains("tp-q"))));
    await p.fill(".tp-q", "zzq"); ok(`${v} no results offers Add as a new item and Add to shopping list`, /Add as a new item/.test(await txt(p, ".ll-empty")) && /Add to shopping list/.test(await txt(p, ".ll-empty")));
    await p.keyboard.press("Escape"); ok(`${v} Escape closes search and clears it`, (await p.locator(".tp-search").isHidden()) && (await cnt(p, ".r")) === 18);
    // pick several
    const entry = { a: ".ch-sel", b: ".ll-fab", c: ".tp-sel", d: ".hd-sel" }[v];
    await p.click(entry); ok(`${v} pick several shows tick boxes and the bar replaces the tab bar`, (await cnt(p, ".r-sel:visible")) > 10 && (await p.locator(".ll-selbar").isVisible()) && (await p.locator(".ll-tabs").count()) === 0);
    await p.locator(".r-main").nth(1).click(); await p.locator(".r-main").nth(3).click();
    ok(`${v} two picked`, /2 picked/.test(await txt(p, ".sb-n")));
    await p.click('.sb-a[data-t="Add to list"]'); ok(`${v} an action ends picking and says what happened`, (await cnt(p, ".ll-selbar")) === 0 && /Add to list: 2 items/.test(await txt(p, ".ll-toast")) && (await cnt(p, ".ll-tabs .badge")) === 1);
    await p.click(".tp-add"); ok(`${v} + says Add item opens`, /Add item/.test(await txt(p, ".ll-toast")));
    await p.close();
    // Recipes
    p = await open(ctx, v, "recipes", "", errs);
    ok(`${v} recipes: Ready now first, one ranked order`, /Spinach omelette/.test(await txt(p, ".r .nm")) || v === "c", await txt(p, ".r .nm"));
    ok(`${v} recipes: thumbnail only where there is a banner`, (await cnt(p, ".r-lead.th")) === 5 && (await cnt(p, ".r .r-lead")) === 5 || v === "d" || v === "b", [await cnt(p, ".r-lead.th"), await cnt(p, ".r .r-lead")]);
    ok(`${v} recipes: the assistant icon replaces +, the magnifier is the same`, (await cnt(p, ".tp-add.ask")) === 1 && (await cnt(p, ".tp-find")) === 1);
    await p.click(".tp-add"); ok(`${v} the assistant icon says it opens the AI app`, /AI app/.test(await txt(p, ".ll-toast")));
    ok(`${v} recipe chips are All, Ready now, Starred, Batch, Under 30, Added by me`, (await p.locator(".ch").allInnerTexts()).map((t) => t.replace(/\s*\d+$/, "").trim()).join("|") === "All|Ready now|Starred|Batch|Under 30|Added by me");
    await p.click('.ch[data-c="quick"]'); ok(`${v} Under 30 narrows`, (await cnt(p, ".r")) === 5, await cnt(p, ".r"));
    await p.click('.ch[data-c="all"]');
    await p.click(v === "c" ? '.ll-seg [data-g="ready"]' : ".ch-mode"); ok(`${v} recipes group by readiness in the Pantry's group slot`, /Ready now/.test(await txt(p, ".g-h h2")) && (await cnt(p, ".g")) === 3);
    await p.close();
    // Home
    p = await open(ctx, v, "home", "", errs);
    ok(`${v} home: greeting, On the way out, Cooking ideas, Running low, Plan and Make it, five tabs`, (await cnt(p, ".hm-hi")) === 1 && (await cnt(p, ".hm-sec")) === 3 && /Plan/.test(await txt(p, ".hm-acts .btn.pri")) && (await cnt(p, ".ll-tabs a")) === 5 && (await cnt(p, ".r .fl-danger")) >= 1);
    await p.close();
  }
  ok("behaviour: console errors", !errs.length, errs.slice(0, 3));
  await ctx.close();
}

// ---- 4. the comparison page ----
for (const [w, h] of [[360, 800], [390, 844], [1280, 900], [1760, 1000]]) for (const mode of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode }); const errs = [];
  const p = await ctx.newPage(); p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(`${BASE}index.html?eager=1`); await p.waitForSelector(".llp .ll-body", { timeout: 5000 }); await p.waitForTimeout(200);
  const r = await p.evaluate(() => ({ x: document.documentElement.scrollWidth > innerWidth + 1, phones: document.querySelectorAll(".llp .ll-body").length, sheets: [...document.styleSheets].filter((s) => /v-[abcd]\.css/.test(s.href || "")).length, small: [...document.querySelectorAll(".sts button,.links a,.tpick")].filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5; }).length }));
  ok(`index ${w} ${mode} no sideways scroll, 12 phones, 4 variant sheets, 44px tools`, !r.x && r.phones === 12 && r.sheets === 4 && !r.small && !errs.length, { r, errs: errs.slice(0, 2) });
  if (w === 1760) {
    const rows = await p.evaluate(() => [...document.querySelectorAll('.cell[data-s="pantry"]')].map((e) => Math.round(e.getBoundingClientRect().top)));
    ok("index 1760: the four Pantry phones share a row (shared drive side by side)", new Set(rows).size === 1, rows);
  }
  if (shots && mode === "dark") await p.screenshot({ path: `${shots}/ll-index-${w}.png`, fullPage: w > 400 });
  await ctx.close();
}
// lazy mount: nothing is drawn before it scrolls near
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  await p.goto(`${BASE}index.html`); await p.waitForTimeout(300);
  const n0 = await p.evaluate(() => document.querySelectorAll(".llp .ll-body").length);
  await p.evaluate(() => document.querySelector(".cell").scrollIntoView()); await p.waitForTimeout(300);
  const n1 = await p.evaluate(() => document.querySelectorAll(".llp .ll-body").length);
  ok("index draws phones lazily (none on first paint at phone width, some once scrolled to, not all twelve)", n0 === 0 && n1 > 0 && n1 < 12, [n0, n1]);
  await ctx.close();
}

// ---- 5. tokens only ----
for (const f of readdirSync("fragments/list-language").filter((n) => n.endsWith(".css"))) {
  const css = readFileSync(`fragments/list-language/${f}`, "utf8");
  const bad = css.split("\n").filter((l) => /#[0-9a-fA-F]{3,8}\b|\b(rgb|hsl)a?\(/.test(l) && !/box-shadow/.test(l));
  ok(`${f}: no raw colour outside a shadow`, !bad.length, bad.slice(0, 2));
}
await browser.close();
console.log(fails ? `\n${fails} of ${total} checks FAILED` : `\nall ${total} checks passed`);
process.exit(fails ? 1 : 0);
