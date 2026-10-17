// Behaviour check for the idle pane (Kitchie #867, Pantry and Recipes on desktop, nothing picked). Headless Chromium, 1280 and 1024 wide, dark and light.
// Revised 17 Oct 2026 for the owner's decisions: F is the decided pane on both screens (Pantry: Use soon, Running low, Out; Recipes: Ready now, Planned this week, Newly added, Recently cooked), one shared section and row widget,
// count first then shimmer then rows when it came straight to the screen, Home's data handed over when it came from Home, plan-state icons, shopping-list ordering, reduced motion honoured.
// Checks: every option draws (or, for E, draws nothing) in every household state on both screens; the numbers in a block equal the rows its filter then shows (so the pane cannot disagree with the list);
// a name opens the item and closing brings the pane back; empty households get prompts, not summaries; the all-fine state of the recommendation is today's one line (Empty is absent);
// every control in the pane is 44px or more high; no sideways scroll; no page errors; and the pane asks the network for nothing (no fetch, no XHR) at load or on a click.
// Usage:  python3 -m http.server 8123 &   then   node tools/empty-pane-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox).
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const ROOT = process.env.BASE || "http://localhost:8125/fragments/empty-pane/";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const errs = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
// clk=true: the page runs on a paused fake clock (Playwright), so the loading timings are exact on a busy machine; adv(p, ms) moves it forward.
const adv = (p, ms) => p.clock.runFor(ms);
async function open(ctx, file, q, clk) {
  const p = await ctx.newPage(); if (clk) { await p.clock.install({ time: 0 }); await p.clock.pauseAt(100); } p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  const reqs = []; p.on("request", r => { if (["fetch", "xhr"].includes(r.resourceType())) reqs.push(r.url()); }); p.__reqs = reqs;
  const qq = (q || "") + (/(^|&)from=/.test(q || "") ? "" : (q ? "&" : "") + "from=ready"); await p.goto(ROOT + file + "?" + qq + "&mk=0"); if (!clk) await sleep(120); return p;
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
    ok(`${t}: Planned this week, Newly added and Recently cooked are labels, not buttons (the list has no such chip)`, (await p.locator('#lane [data-blk="planned"] button.ip-bh, #lane [data-blk="fresh"] button.ip-bh, #lane [data-blk="cooked"] button.ip-bh').count()) === 0);
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

  // ---------- the first screenful (768px) holds the first two sections complete, so what matters is seen without scrolling ----------
  for (const [screen, d] of [["pantry", "typical"], ["pantry", "large"], ["recipes", "typical"], ["recipes", "large"]]) {
    const p = await open(ctx, screen + ".html", `d=${d}&theme=${theme}`);
    const bottom = await p.evaluate(() => { const b = document.querySelectorAll("#lane .ip-blk"); return b.length > 1 ? Math.round(b[1].getBoundingClientRect().bottom) : 0; });
    ok(`${tag} ${screen} ${d}: the first two sections end above 768px, so they show without scrolling on a small laptop`, bottom > 0 && bottom <= 768, bottom);
    await p.close();
  }
  await ctx.close();
}

// =====================================================================================================================
// The decided pane (17 Oct 2026): loading behaviour, plan state, shopping-list order, search sketch, Recipes sections, reduced motion.
// Run at 1280 wide in both schemes (the timing does not depend on the width).
// =====================================================================================================================
const listOf = (p, screen, d, key) => p.evaluate(([screen, d, key]) => {
  const items = window.EP_DATA[screen][d]; const D = window.EP_IDLE.defs({ screen, items, data: d });
  const def = D.defs.filter(x => x.key === key)[0]; return def ? def.list.map(x => ({ id: x.id, n: x.n, ub: x.ub, lvl: x.lvl, onList: !!x.onList, kind: x.plan ? (x.plan.d <= x.ub ? "ok" : "late") : "none", added: x.added, cd: x.cd })) : [];
}, [screen, d, key]);
const CAPS = { soon: 3, low: 3, out: 2, ready: 3, planned: 2, fresh: 2, cooked: 2 };
for (const [scheme, theme] of [["dark", "kitchie"], ["light", "kitchie-day"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme }); const tag = `1280 ${scheme}`;

  // ---------- straight to Pantry: head only, then the count, then the shimmer, then the rows ----------
  for (const [screen, keys] of [["pantry", ["soon", "low", "out"]], ["recipes", ["ready", "planned", "fresh", "cooked"]]]) {
    const p = await open(ctx, screen + ".html", `d=typical&from=direct&theme=${theme}`, true); const t = `${tag} ${screen} straight here`;
    const lists = {}; for (const k of keys) lists[k] = await listOf(p, screen, "typical", k);
    const visible = keys.filter(k => lists[k].length || (k === "fresh"));
    // t about 120 ms: heads only
    ok(`${t}: at first only the section heads draw, with a grey pill where each number will be`, (await p.locator("#lane .ip-n.sk").count()) === keys.length && (await p.locator("#lane .or").count()) === 0, await laneText(p));
    const txt0 = await laneText(p);
    ok(`${t}: before the count there is no item or recipe name in the pane`, !lists[keys[0]].some(x => txt0.includes(x.n)), txt0);
    await adv(p, 300); // 300 ms after the page drew
    for (const k of keys) {
      const sec = p.locator(`#lane [data-blk="${k}"]`);
      if (!lists[k].length) { ok(`${t}: ${k} has none, so it leaves once the counts arrive${k === "fresh" ? " (Newly added stays as a quiet line, see below)" : ""}`, k === "fresh" || (await sec.count()) === 0); continue; }
      ok(`${t}: ${k} shows its count (${lists[k].length}) before any row`, num(await sec.locator(".ip-n").innerText()) === lists[k].length && (await sec.getAttribute("aria-busy")) === "true");
      ok(`${t}: ${k} shows one grey row per row to come (${Math.min(lists[k].length, CAPS[k])}), so nothing will jump`, (await sec.locator(".sk-r").count()) === Math.min(lists[k].length, CAPS[k]) && (await sec.locator(".sk-r").allInnerTexts()).every(x => x.trim() === ""));
    }
    const txt1 = await laneText(p);
    ok(`${t}: while the shimmer shows, the pane carries no item or recipe name`, !lists[keys[0]].some(x => txt1.includes(x.n)), txt1);
    const h1 = await p.evaluate(() => document.querySelector("#lane .ip").getBoundingClientRect().height);
    await adv(p, 1500); // 1800 ms after the page drew
    for (const k of keys) {
      const sec = p.locator(`#lane [data-blk="${k}"]`);
      if (!lists[k].length) continue;
      ok(`${t}: ${k} rows replaced the shimmer (${Math.min(lists[k].length, CAPS[k])} rows, count unchanged)`, (await sec.locator(".sk-r").count()) === 0 && (await sec.locator("li.or").count()) === Math.min(lists[k].length, CAPS[k]) && num(await sec.locator(".ip-n").innerText()) === lists[k].length && (await sec.getAttribute("aria-busy")) === null);
    }
    const h2 = await p.evaluate(() => document.querySelector("#lane .ip").getBoundingClientRect().height);
    ok(`${t}: the pane is the same height before and after the rows arrive (no jump, within 12px)`, Math.abs(h1 - h2) <= 12, [h1, h2]);
    ok(`${t}: no request was made while it loaded (the mock only simulates the lazy request)`, p.__reqs.length === 0, p.__reqs);
    await p.close();
  }

  // ---------- coming from Home: what Home holds is drawn at once and never shimmers; the rest is lazy ----------
  for (const [screen, held, lazy] of [["pantry", ["soon", "low"], ["out"]], ["recipes", ["ready", "planned"], ["fresh", "cooked"]]]) {
    const p = await open(ctx, screen + ".html", `d=typical&from=home&theme=${theme}`, true); const t = `${tag} ${screen} from Home`;
    for (const k of held) {
      ok(`${t}: ${k} has its rows at once (handed over, nothing fetched)`, (await p.locator(`#lane [data-blk="${k}"] li.or:not(.sk-r)`).count()) > 0 && (await p.locator(`#lane [data-blk="${k}"] .sk-r`).count()) === 0);
    }
    for (const k of lazy) ok(`${t}: ${k} is not on Home, so it is still lazy at first`, (await p.locator(`#lane [data-blk="${k}"] li.or:not(.sk-r)`).count()) === 0);
    await adv(p, 350);
    for (const k of held) ok(`${t}: ${k} never showed a shimmer`, (await p.locator(`#lane [data-blk="${k}"] .sk-r`).count()) === 0);
    await adv(p, 1500);
    for (const k of lazy) ok(`${t}: ${k} rows arrived after the shimmer`, (await p.locator(`#lane [data-blk="${k}"] li.or:not(.sk-r)`).count()) > 0 && (await p.locator(`#lane [data-blk="${k}"] .sk-r`).count()) === 0);
    ok(`${t}: coming from Home made no request`, p.__reqs.length === 0, p.__reqs);
    await p.close();
  }

  // ---------- a calm household straight here: the heads, then today's one line ----------
  { const p = await open(ctx, "pantry.html", `d=calm&from=direct&theme=${theme}`, true); const t = `${tag} Pantry calm straight here`;
    ok(`${t}: first the three heads`, (await p.locator("#lane .ip-blk").count()) === 3);
    await adv(p, 1900);
    ok(`${t}: once the counts are all zero it settles on today's one line, no blocks`, /^Pick an item to see it here\./.test(await laneText(p)) && (await p.locator("#lane .ip-blk").count()) === 0, await laneText(p));
    await p.close(); }
  { const p = await open(ctx, "pantry.html", `d=empty&from=direct&theme=${theme}`); const t = `${tag} Pantry empty straight here`;
    ok(`${t}: an empty household needs no shimmer (the list already knows it is empty): prompts at once`, (await p.locator("#lane .sk-r, #lane .ip-n.sk").count()) === 0 && /Add an item/.test(await laneText(p)));
    await p.close(); }

  // ---------- Pantry Use soon: order and the plan icons ----------
  for (const d of ["typical", "large"]) {
    const p = await open(ctx, "pantry.html", `d=${d}&theme=${theme}`); const t = `${tag} Pantry ${d} Use soon`;
    const L = await listOf(p, "pantry", d, "soon");
    const firstOk = L.findIndex(x => x.kind === "ok"); const lastNot = L.map(x => x.kind !== "ok").lastIndexOf(true);
    ok(`${t}: planned-in-time items sit below everything that still needs a plan`, firstOk === -1 || lastNot < firstOk, L.map(x => x.kind));
    const byUb = (a) => a.every((x, i) => i === 0 || a[i - 1].ub <= x.ub);
    ok(`${t}: inside each group the closest use-by comes first`, byUb(L.filter(x => x.kind !== "ok")) && byUb(L.filter(x => x.kind === "ok")));
    const rows = await p.$$eval('#lane [data-blk="soon"] li.or', els => els.map(e => ({ plan: e.dataset.plan, ctl: [...e.querySelectorAll(".ip-ib")].map(c => ({ label: c.getAttribute("aria-label"), tip: c.getAttribute("data-tip"), text: c.textContent.trim(), tag: c.tagName })) })));
    ok(`${t}: every Use soon row has exactly one plan icon, with words only in its name and tooltip`, rows.length > 0 && rows.every(r => r.ctl.length === 1 && r.ctl[0].text === "" && r.ctl[0].label && r.ctl[0].tip), rows);
    ok(`${t}: not planned is a one-click find-a-recipe button`, rows.filter(r => r.plan === "none").every(r => r.ctl[0].tag === "BUTTON" && /^Not planned\. Find a recipe to plan with /.test(r.ctl[0].label)));
    ok(`${t}: planned too late says it comes after the use-by, names the meal and the night, and is a different icon from planned in time`, rows.filter(r => r.plan === "late").every(r => /after its use-by/.test(r.ctl[0].label) && /after its use-by/.test(r.ctl[0].tip)));
    // all three states drawn: use the row builders on the typical sample
    const states = await p.evaluate(() => { const R = window.EP_IDLE.rows; const mk = (ub, plan) => ({ id: "z", n: "Milk", ub, plan }); const h = [R.soon(mk(1, { meal: "Pasta", night: "Thursday", d: 1 })), R.soon(mk(1, { meal: "Pasta", night: "Saturday", d: 4 })), R.soon(mk(1, null))]; return h.map(x => { const d = document.createElement("ul"); d.innerHTML = x; const c = d.querySelector(".ip-ib"); return { label: c.getAttribute("aria-label"), tip: c.getAttribute("data-tip"), tag: c.tagName, svg: c.innerHTML }; }); });
    ok(`${t}: the three plan states have three different icons`, new Set(states.map(x => x.svg)).size === 3);
    ok(`${t}: planned in time names the meal and the night, and is not a button`, /Planned in time: Pasta, Thursday/.test(states[0].label) && /Pasta, Thursday/.test(states[0].tip) && states[0].tag === "SPAN");
    await p.close();
  }

  // ---------- Running low and Out: not on the list first, each with Add; on the list last, with the on-the-list icon ----------
  for (const [d, key] of [["typical", "low"], ["large", "low"], ["typical", "out"], ["large", "out"]]) {
    const p = await open(ctx, "pantry.html", `d=${d}&theme=${theme}`); const t = `${tag} Pantry ${d} ${key}`;
    const L = await listOf(p, "pantry", d, key);
    const firstOn = L.findIndex(x => x.onList), lastOff = L.map(x => !x.onList).lastIndexOf(true);
    ok(`${t}: everything not on the shopping list comes before anything that is`, firstOn === -1 || lastOff < firstOn, L.map(x => x.onList));
    const rows = await p.$$eval(`#lane [data-blk="${key}"] li.or`, els => els.map(e => ({ on: e.dataset.onlist, add: e.querySelectorAll('[data-act="shop-add"]').length, label: e.querySelector(".ip-ib").getAttribute("aria-label") })));
    ok(`${t}: a row not on the list has an Add to shopping list icon button`, rows.filter(r => r.on === "0").every(r => r.add === 1 && /^Add .* to the shopping list$/.test(r.label)), rows);
    ok(`${t}: a row on the list has no Add button and says it is on the shopping list`, rows.filter(r => r.on === "1").every(r => r.add === 0 && r.label === "On the shopping list"), rows);
    await p.close();
  }
  { const p = await open(ctx, "pantry.html", `d=typical&theme=${theme}`); const t = `${tag} Pantry Add to shopping list`;
    const before = num(await p.locator('#lane [data-blk="low"] .ip-n').innerText());
    const name = (await p.locator('#lane [data-blk="low"] li.or').first().locator(".ip-t").innerText());
    await p.locator('#lane [data-blk="low"] [data-act="shop-add"]').first().click(); await sleep(80);
    ok(`${t}: pressing Add says so and the count stays`, /Added .* to the shopping list/.test(await p.locator("#toast").innerText()) && num(await p.locator('#lane [data-blk="low"] .ip-n').innerText()) === before);
    const L = await listOf(p, "pantry", "typical", "low"); const me = L.findIndex(x => x.n === name);
    ok(`${t}: the item just added moved below the ones not yet on the list`, me > -1 && L[me].onList && L.slice(me + 1).every(x => x.onList));
    const st = await p.evaluate((nm) => { const li = [...document.querySelectorAll('#lane [data-blk="low"] li.or')].filter(e => e.querySelector(".ip-t").textContent === nm)[0]; return li ? { on: li.dataset.onlist, add: li.querySelectorAll('[data-act="shop-add"]').length, label: li.querySelector(".ip-ib").getAttribute("aria-label") } : null; }, name);
    ok(`${t}: it now shows the on-the-list icon and no Add`, st && st.on === "1" && st.add === 0 && st.label === "On the shopping list", st);
    ok(`${t}: Add made no request`, p.__reqs.length === 0, p.__reqs);
    await p.close(); }

  // ---------- find a recipe to plan: opens a search sketch with the item typed in; back returns ----------
  { const p = await open(ctx, "pantry.html", `d=typical&theme=${theme}`); const t = `${tag} Pantry find a recipe`;
    const btn = p.locator('#lane [data-act="plan-find"]').first(); const nameBefore = await btn.getAttribute("aria-label");
    await btn.click(); await sleep(60);
    const txt = await laneText(p);
    ok(`${t}: one click opens a recipe search with the item typed in`, (await p.locator("#lane .ip-search").count()) === 1 && new RegExp("Recipes with " + nameBefore.replace(/^.*plan with /, ""), "i").test(txt), txt);
    ok(`${t}: it lists recipes with a Plan control each`, (await p.locator("#lane .ip-search li.or").count()) >= 1 && (await p.locator('#lane .ip-search [data-act="plan-pick"]').count()) >= 1);
    ok(`${t}: its controls are 44px or more`, (await p.evaluate(() => [...document.querySelectorAll("#lane .ip-search button")].every(b => b.getBoundingClientRect().height >= 43.5))));
    await p.locator('#lane [data-act="idle-back"]').click(); await sleep(60);
    ok(`${t}: Back returns to the pane`, (await p.locator('#lane [data-blk="soon"]').count()) === 1 && (await p.locator("#lane .ip-search").count()) === 0);
    await p.locator('#lane [data-act="plan-find"]').first().click(); await sleep(40); await p.keyboard.press("Control+Escape"); await sleep(60);
    ok(`${t}: Ctrl or Cmd Esc also returns`, (await p.locator('#lane [data-blk="soon"]').count()) === 1);
    ok(`${t}: opening it made no request`, p.__reqs.length === 0, p.__reqs);
    await p.close(); }

  // ---------- Replay ----------
  { const p = await open(ctx, "pantry.html", `d=typical&from=direct&mk=1&theme=${theme}`, true); const t = `${tag} Pantry replay`;
    await adv(p, 1900);
    ok(`${t}: after loading the rows are there`, (await p.locator("#lane .sk-r").count()) === 0 && (await p.locator("#lane li.or").count()) > 0);
    await p.locator('.mk [data-act="replay"]').click(); await adv(p, 120);
    ok(`${t}: Replay starts again from the heads`, (await p.locator("#lane .ip-n.sk").count()) === 3 && (await p.locator("#lane li.or").count()) === 0);
    await adv(p, 1900);
    ok(`${t}: and loads again`, (await p.locator("#lane .sk-r").count()) === 0 && (await p.locator("#lane li.or").count()) > 0);
    await p.close(); }

  // ---------- Recipes: the four decided sections ----------
  for (const d of ["typical", "large"]) {
    const p = await open(ctx, "recipes.html", `d=${d}&theme=${theme}`); const t = `${tag} Recipes ${d}`;
    const titles = await p.$$eval("#lane .ip-blk .ip-bh b", e => e.map(x => x.textContent));
    ok(`${t}: the sections are Ready now, Planned this week, Newly added, Recently cooked, in that order`, JSON.stringify(titles) === JSON.stringify(["Ready now", "Planned this week", "Newly added", "Recently cooked"]), titles);
    const txt = await laneText(p);
    ok(`${t}: the old names are gone (no Cooked lately, no One thing short)`, !/Cooked lately|One thing short/i.test(txt), txt);
    const F = await listOf(p, "recipes", d, "fresh");
    ok(`${t}: Newly added holds only recipes added in the last 14 days, newest first`, F.every((x, i) => x.added <= 14 && (i === 0 || F[i - 1].added <= x.added)), F);
    const rows = await p.$$eval('#lane [data-blk="fresh"] li.or', els => els.map(e => { const c = e.querySelector(".ip-ib"); return { label: c.getAttribute("aria-label"), tip: c.getAttribute("data-tip"), text: c.textContent.trim() }; }));
    ok(`${t}: a Newly added row carries a new icon with the added-when in its name and tooltip`, rows.length > 0 && rows.every(r => /^New: added /.test(r.label) && /^Added /.test(r.tip) && r.text === ""), rows);
    const C = await listOf(p, "recipes", d, "cooked");
    ok(`${t}: Recently cooked is the last 7 days, most recent first`, C.every((x, i) => x.cd <= 7 && (i === 0 || C[i - 1].cd <= x.cd)), C);
    await p.close();
  }
  { const p = await open(ctx, "recipes.html", `d=typical&nonew=1&theme=${theme}`); const t = `${tag} Recipes nothing new`;
    ok(`${t}: with nothing added lately, Newly added stays as one quiet line that offers the assistant`, /Nothing added in the last 14 days/.test(await laneText(p)) && (await p.locator('#lane [data-blk="fresh"] [data-act="assistant"]').count()) === 1 && (await p.locator('#lane [data-blk="fresh"] .ip-ib').first().getAttribute("aria-label")) === "Ask your assistant to add a recipe");
    await p.close(); }
  { const p = await open(ctx, "recipes.html", `d=typical&from=ready&theme=${theme}`); const t = `${tag} Recipes mock bar`;
    ok(`${t}: Recipes is no longer marked as pending a decision`, !/pending/i.test(await p.evaluate(() => document.body.innerText)));
    await p.close(); }

  // ---------- the notes page that draws the flow ----------
  { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); await p.clock.install({ time: 0 }); await p.clock.pauseAt(100); await p.goto(ROOT + "loading.html?theme=" + theme); await adv(p, 1900); const t = `${tag} loading.html`;
    ok(`${t}: the frame loads the Pantry pane straight here, rows in`, (await p.locator("#lane li.or").count()) > 0 && (await p.locator("#lane .sk-r").count()) === 0);
    await p.locator("#b-home").click(); await adv(p, 150);
    ok(`${t}: Came from Home draws Use soon and Running low at once`, (await p.locator('#lane [data-blk="soon"] li.or:not(.sk-r)').count()) > 0 && (await p.locator('#lane [data-blk="out"] .ip-n.sk, #lane [data-blk="out"] .sk-r').count()) > 0 && (await p.locator("#b-home").getAttribute("aria-pressed")) === "true");
    await p.locator("#b-direct").click(); await p.locator("#b-replay").click(); await adv(p, 120);
    ok(`${t}: Came straight here then Replay starts from the heads`, (await p.locator("#lane .ip-n.sk").count()) === 3);
    await p.locator("#b-recipes").click(); await adv(p, 2100);
    ok(`${t}: the same frame draws the Recipes sections`, (await p.locator("#lane .ip-blk").count()) === 4 && (await p.locator("#lane .sk-r").count()) === 0);
    ok(`${t}: the event log lists what happened with times`, /ms/.test(await p.locator("#log").innerText()));
    await p.close(); }
  await ctx.close();
}

// ---------- reduced motion: the placeholders stand still ----------
for (const rm of ["no-preference", "reduce"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: rm }); const p = await open(ctx, "pantry.html", "d=typical&from=direct&theme=kitchie", true); await adv(p, 350);
  const an = await p.evaluate(() => [...document.querySelectorAll("#lane .sk-r i, #lane .sk-a")].map(e => getComputedStyle(e).animationName));
  ok(`reduced motion ${rm}: the shimmer ${rm === "reduce" ? "is static (no animation)" : "moves"}`, an.length > 0 && an.every(x => rm === "reduce" ? x === "none" : x !== "none"), an.slice(0, 3));
  ok(`reduced motion ${rm}: the placeholders still show, with the same count first`, (await p.locator("#lane .sk-r").count()) > 0);
  await adv(p, 1700); ok(`reduced motion ${rm}: and the rows still replace them`, (await p.locator("#lane .sk-r").count()) === 0 && (await p.locator("#lane li.or").count()) > 0);
  await ctx.close();
}

ok("no page errors", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log(fails ? `${fails} of ${total} checks FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
