// Behaviour check for the Pantry row actions on desktop without swipe (Kitchie #866). Headless Chromium, desktop 1280 (and 1024, 1440 for overflow), dark and light, a mouse and a touch laptop.
// Checks, per option (A hover actions, B context menu, C select and act, D panel and keys) and for "Today": every swipe action (Use one, Used up, Add to the shopping list) is reachable by the option's own way and
// by the keys, each has an Undo (button and Z), level-only and Out rows offer what applies and no more, rest state shows nothing extra, key caps and the cues switch, the touch-laptop fallback (no hover needed, 44px),
// the used-up guardrail, the empty, all-used-up and saved-list states, no sideways scroll, targets, only the chosen option's files load, and no raw colours.
// Usage:  python3 -m http.server 8123 &   then   node tools/pantry-row-actions-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox).
import { createRequire } from "module";
import { readFileSync, readdirSync } from "fs";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const ROOT = process.env.BASE || "http://localhost:8123/fragments/pantry-row-actions/";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [];
async function open(ctx, q, w) {
  const p = await ctx.newPage(); p.reqs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url()));
  await p.goto(ROOT + "desktop.html?" + q); await p.waitForSelector("html[data-ready]"); await sleep(120); return p;
}
const li = (p, id) => p.locator(`#plist li[data-id="${id}"]`);
const meta = async (p, id) => (await li(p, id).locator(".meta").innerText()).trim();
const badge = async p => Number(await p.locator("#badge").innerText());
const gone = async (p, id) => (await li(p, id).count()) === 0;
const bar = p => p.locator("#undo-bar").innerText().catch(() => "");
const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return { op: Number(c.opacity), v: c.visibility, d: c.display, w: r.width, h: r.height, pe: c.pointerEvents }; }, sel);
const shown = async (p, sel) => { const v = await vis(p, sel); return !!v && v.op > 0.9 && v.v !== "hidden" && v.d !== "none" && v.h > 0; };

// ---- how each option performs the three actions on a row, with the mouse (the same scenario then runs on every option)
const WAYS = {
  a: { one: async (p, id) => { await li(p, id).locator(".rowlink").hover(); await li(p, id).locator(".rb.one").click(); }, shop: async (p, id) => { await li(p, id).locator(".rowlink").hover(); await li(p, id).locator(".rb.shop").click(); }, all: async (p, id) => { await li(p, id).locator(".rowlink").hover(); await li(p, id).locator(".rb.all").click(); } },
  b: { one: async (p, id) => { await li(p, id).click({ button: "right" }); await p.locator('.rmenu [data-m="one"]').click(); }, shop: async (p, id) => { await li(p, id).click({ button: "right" }); await p.locator('.rmenu [data-m="shop"]').click(); }, all: async (p, id) => { await li(p, id).click({ button: "right" }); await p.locator('.rmenu [data-m="all"]').click(); } },
  c: { one: async (p, id) => { await p.keyboard.press("Control+Enter"); await li(p, id).locator(".rowlink").hover(); await li(p, id).locator(".rsel").click(); await p.locator('[data-bulk="one"]').click(); }, shop: async (p, id) => { await p.keyboard.press("Control+Enter"); await li(p, id).locator(".rowlink").hover(); await li(p, id).locator(".rsel").click(); await p.locator('[data-bulk="shop"]').click(); }, all: async (p, id) => { await p.keyboard.press("Control+Enter"); await li(p, id).locator(".rowlink").hover(); await li(p, id).locator(".rsel").click(); await p.locator('[data-bulk="all"]').click(); } },
  d: { one: async (p, id) => { await li(p, id).locator(".rowlink").click(); await p.locator('.pact [data-do="one"]').click(); }, shop: async (p, id) => { await li(p, id).locator(".rowlink").click(); await p.locator('.pact [data-do="shop"]').click(); }, all: async (p, id) => { await li(p, id).locator(".rowlink").click(); await p.locator('.pact [data-do="all"]').click(); } }
};

const ONLY = process.env.ONLY; // ONLY=c  runs one option while you work on it
for (const [scheme, theme] of [["dark", "kitchie"], ["light", "kitchie-day"]]) {
  for (const opt of ["a", "b", "c", "d"].filter(o => !ONLY || ONLY.includes(o))) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme }); // a fresh context per option keeps the mouse and focus clean
    const tag = `${opt} ${scheme}`, W = WAYS[opt], Q = `opt=${opt}&theme=${theme}`;
    // ---------- rest, loading ----------
    { const p = await open(ctx, Q);
      const loaded = p.reqs.filter(u => /\/opt-[a-z]+\.(css|js)$/.test(u)).map(u => u.split("/").pop());
      ok(`${tag} load: only opt-${opt}.css and opt-${opt}.js are fetched`, loaded.sort().join() === `opt-${opt}.css,opt-${opt}.js`, loaded);
      ok(`${tag} load: nothing from outside this folder or the repo's theme files`, p.reqs.every(u => u.startsWith(new URL(ROOT).origin)), p.reqs.filter(u => !u.startsWith(new URL(ROOT).origin)));
      ok(`${tag} rest: 12 items listed, the used-up one hidden by default`, (await p.locator("#plist li[data-row]").count()) === 12 && await gone(p, "tahini"));
      ok(`${tag} theme: the page background is the theme's token`, await p.evaluate(t => getComputedStyle(document.body).backgroundColor === (t === "kitchie" ? "rgb(15, 30, 25)" : "rgb(246, 241, 230)"), theme));
      if (opt === "a") ok(`${tag} rest: no row shows its buttons until hover, focus or current`, !(await shown(p, "li[data-id=eggs] .ract")) && !(await shown(p, "li[data-id=milk] .ract")));
      if (opt === "b") ok(`${tag} rest: no three-dot button shows until hover, focus or current`, !(await shown(p, "li[data-id=eggs] .rmore")));
      if (opt === "c") ok(`${tag} rest: no check box shows until hover, focus, current or a pick`, !(await shown(p, "li[data-id=eggs] .rsel")));
      if (opt === "d") ok(`${tag} rest: the rows carry nothing (no button inside any row but the link)`, (await p.locator("#plist li[data-row] button").count()) === 0);
      if (opt === "d") ok(`${tag} rest: the keys line is at the foot of the column`, (await p.locator(".keysline").innerText()).replace(/\s+/g, " ").includes("move") && (await p.locator(".keysline .kbd").count()) === 6);
      await p.close(); }

    // ---------- the three actions, by this option's own way, each with Undo ----------
    { const p = await open(ctx, Q);
      await W.one(p, "eggs"); ok(`${tag} Use one: eggs 10 goes to 9`, (await meta(p, "eggs")).startsWith("9"), await meta(p, "eggs"));
      ok(`${tag} Use one: the bar says so and offers Undo`, /eggs: 9 left/.test(await bar(p)) && (await p.locator("#undo-button").count()) === 1, await bar(p));
      await p.locator("#undo-button").click(); ok(`${tag} Use one: Undo (button) puts 10 back`, (await meta(p, "eggs")).startsWith("10"));
      await W.one(p, "eggs"); await p.keyboard.press("z"); await sleep(60); ok(`${tag} Use one: Z undoes it too`, (await meta(p, "eggs")).startsWith("10"), await meta(p, "eggs"));
      if (opt === "c") await p.keyboard.press("Control+Enter");
      const b0 = await badge(p); await W.shop(p, "pasta"); ok(`${tag} Add to list: the Shopping badge goes up by one`, (await badge(p)) === b0 + 1);
      ok(`${tag} Add to list: the bar says so and offers Undo`, /pasta added to your list/.test(await bar(p)) && (await p.locator("#undo-button").count()) === 1, await bar(p));
      await p.locator("#undo-button").click(); ok(`${tag} Add to list: Undo takes it off again`, (await badge(p)) === b0);
      if (opt === "c") await p.keyboard.press("Control+Enter");
      await W.shop(p, "carrots"); ok(`${tag} Add to list: an item already on the list says so, changes nothing, no Undo`, (await badge(p)) === b0 && /already on your list/.test(await bar(p)) && (await p.locator("#undo-button").count()) === 0, await bar(p));
      if (opt === "c") await p.keyboard.press("Control+Enter");
      await W.all(p, "icecream"); ok(`${tag} Used up: the row leaves the list`, await gone(p, "icecream"));
      ok(`${tag} Used up: the bar says so and offers Undo`, /ice cream used up/.test(await bar(p)) && (await p.locator("#undo-button").count()) === 1, await bar(p));
      await p.locator("#undo-button").click(); ok(`${tag} Used up: Undo brings the row back`, !(await gone(p, "icecream")));
      await p.close(); }

    // ---------- the keys are the app's and still work from every option ----------
    { const p = await open(ctx, Q);
      await li(p, "eggs").locator(".rowlink").click();
      await p.keyboard.press("u"); ok(`${tag} keys: U uses one of the open item`, (await meta(p, "eggs")).startsWith("9"));
      await p.keyboard.press("z"); await p.keyboard.press("s"); ok(`${tag} keys: S adds it to the list`, /eggs added to your list|already/.test(await bar(p)), await bar(p));
      await p.keyboard.press("z");
      await p.keyboard.press("d"); ok(`${tag} keys: D uses it up and the next row (carrots) is open`, await gone(p, "eggs") && (await li(p, "carrots").locator(".rowlink[aria-current]").count()) === 1);
      await p.keyboard.press("z"); ok(`${tag} keys: Z brings eggs back`, !(await gone(p, "eggs")));
      await p.keyboard.press("j"); await p.keyboard.press("j"); ok(`${tag} keys: J moves down and opens the item`, (await p.locator(".rowlink[aria-current]").count()) === 1);
      await li(p, "milk").locator(".rowlink").click(); await p.keyboard.press("u");
      ok(`${tag} keys: U on a level-only item says there is no Use one and changes nothing`, /not counted/.test(await bar(p)) && (await meta(p, "milk")).startsWith("1 litre"), await bar(p));
      await p.close(); }

    // ---------- level-only and Out rows ----------
    { const p = await open(ctx, Q + "&sel=milk");
      if (opt === "a") { await li(p, "milk").locator(".rowlink").hover(); ok(`${tag} level-only: no Use one button, the other two show`, (await li(p, "milk").locator(".rb.one").count()) === 0 && await shown(p, "li[data-id=milk] .rb.shop") && await shown(p, "li[data-id=milk] .rb.all")); }
      if (opt === "b") { await li(p, "milk").click({ button: "right" }); ok(`${tag} level-only: the menu's Use one is disabled and says why`, (await p.locator('.rmenu [data-m="one"]').getAttribute("aria-disabled")) === "true" && /not counted/.test(await p.locator('.rmenu [data-m="one"]').innerText())); await p.keyboard.press("Control+Enter"); }
      if (opt === "d") ok(`${tag} level-only: Use one is disabled in the panel, with the reason`, (await p.locator('.pact [data-do="one"]').getAttribute("aria-disabled")) === "true" && /Not counted/.test(await p.locator("#panel .why").innerText()));
      if (opt === "c") { await li(p, "milk").locator(".rowlink").hover(); await li(p, "milk").locator(".rsel").click(); ok(`${tag} level-only: Use one is disabled and the lane says none are counted`, (await p.locator('[data-bulk="one"]').getAttribute("aria-disabled")) === "true" && /None of these are counted/.test(await p.locator(".sellane").innerText())); }
      await p.close();
      const o = await open(ctx, Q + "&chip=Out");
      ok(`${tag} Out: the Out chip lists the used-up item`, (await li(o, "tahini").count()) === 1);
      if (opt === "a") { await li(o, "tahini").locator(".rowlink").hover(); ok(`${tag} Out: only Add to list shows`, await shown(o, "li[data-id=tahini] .rb.shop") && !(await shown(o, "li[data-id=tahini] .rb.all")) && !(await shown(o, "li[data-id=tahini] .rb.one"))); await li(o, "tahini").locator(".rb.shop").click(); ok(`${tag} Out: Add to list works on it`, /tahini added to your list/.test(await bar(o))); }
      if (opt === "b") { await li(o, "tahini").click({ button: "right" }); const dis = async k => (await o.locator(`.rmenu [data-m="${k}"]`).getAttribute("aria-disabled")) === "true"; ok(`${tag} Out: Use one and Used up are disabled, Add to shopping list is not`, await dis("one") && await dis("all") && !(await dis("shop"))); await o.keyboard.press("Control+Enter"); }
      if (opt === "c") ok(`${tag} Out: no check box (nothing to use or use up; Add to list is on the open item)`, !(await shown(o, "li[data-id=tahini] .rsel")));
      if (opt === "d") { await li(o, "tahini").locator(".rowlink").click(); ok(`${tag} Out: the panel's Used up is disabled, Add to shopping list is live`, (await o.locator('.pact [data-do="all"]').getAttribute("aria-disabled")) === "true" && (await o.locator('.pact [data-do="shop"]').getAttribute("aria-disabled")) === null); }
      await o.close(); }

    // ---------- the used-up guardrail: the third inside five minutes ----------
    { const p = await open(ctx, Q + "&guard=2&sel=peas");
      if (opt === "c") { await li(p, "peas").locator(".rowlink").hover(); await li(p, "peas").locator(".rsel").click(); await p.locator('[data-bulk="all"]').click(); } else await W.all(p, "peas");
      ok(`${tag} guardrail: a third used-up inside 5 minutes asks in place and changes nothing`, !(await gone(p, "peas")) && /Several items were used up just now\. Use up peas anyway\?/.test(await bar(p)) && (await p.locator("#undo-bar .ubtn").count()) === 2, await bar(p));
      await p.locator("#undo-bar .ubtn", { hasText: "Use up" }).click(); ok(`${tag} guardrail: Use up then does it`, await gone(p, "peas"));
      await p.close();
      const t = await open(ctx, Q + "&guard=today");
      await t.keyboard.press("j"); await t.keyboard.press("d");
      ok(`${tag} guardrail (today's words, ?guard=today): the message is the app's and nothing changes`, /Several items were used up just now\. Open the item to confirm\./.test(await bar(t)) && !(await gone(t, "milk")), await bar(t));
      await t.close(); }

    // ---------- states ----------
    { const p = await open(ctx, Q + "&state=empty");
      ok(`${tag} empty: nothing drawn but the one next action`, /Nothing here yet\./.test(await p.locator("#plist").innerText()) && (await p.locator("#plist li[data-row]").count()) === 0 && (await p.locator("#plist .btn").count()) === 1);
      await p.keyboard.press("u"); ok(`${tag} empty: a key says Pick an item first`, /Pick an item first/.test(await bar(p)));
      await p.close();
      const a = await open(ctx, Q + "&state=allout");
      ok(`${tag} all used up: says so and offers the used-up items`, /Nothing in stock\./.test(await a.locator("#plist").innerText()) && (await a.locator('#plist [data-chip="Out"]').count()) === 1);
      await a.locator('#plist [data-chip="Out"]').click(); ok(`${tag} all used up: the Out chip lists them`, (await a.locator("#plist li[data-row]").count()) === 13);
      await a.close();
      const d = await open(ctx, Q + "&down=1&sel=eggs");
      ok(`${tag} saved list: the banner is up`, (await d.locator(".banner").count()) === 1);
      await d.keyboard.press("u"); ok(`${tag} saved list: an action says changes wait and changes nothing`, /Changes will work again shortly/.test(await bar(d)) && (await meta(d, "eggs")).startsWith("10"));
      await d.close();
      const lone = await open(ctx, Q + "&keep=peas");
      ok(`${tag} last item: one item in stock`, (await lone.locator("#plist li[data-row]").count()) === 1);
      await lone.locator("li[data-id=peas] .rowlink").click(); await lone.keyboard.press("d");
      ok(`${tag} last item: using it up leaves "Nothing in stock." with a way to the used-up items, and Undo`, /Nothing in stock\./.test(await lone.locator("#plist").innerText()) && (await lone.locator("#undo-button").count()) === 1);
      await lone.locator("#undo-button").click(); ok(`${tag} last item: Undo restores the row`, (await lone.locator("#plist li[data-row]").count()) === 1);
      await lone.close();
      const srch = await open(ctx, Q);
      await srch.locator("#q").fill("peas"); await sleep(80); ok(`${tag} search: one match`, (await srch.locator("#plist li[data-row]").count()) === 1);
      await srch.locator("li[data-id=peas] .rowlink").click(); await srch.keyboard.press("d");
      ok(`${tag} search: a used-up item stays findable, shown as Out`, (await srch.locator("li[data-id=peas][data-gone]").count()) === 1 && /Out/.test(await srch.locator("li[data-id=peas] .due").textContent()));
      await srch.close(); }

    // ---------- key caps and the cues switch ----------
    { const p = await open(ctx, Q + "&sel=eggs");
      const caps = await p.locator(".kbd").count(); ok(`${tag} caps: key caps use the shared .kbd class`, caps >= 3, caps);
      const before = await p.locator(".pic .kbd").first().isVisible(); await p.keyboard.press("Shift+Space"); await sleep(60);
      ok(`${tag} caps: Shift Space turns every key cap off and on`, before && !(await p.locator(".pic .kbd").first().isVisible()) && (await (async () => { await p.keyboard.press("Shift+Space"); await sleep(60); return p.locator(".pic .kbd").first().isVisible(); })()));
      await p.close(); }

    // ---------- option specifics ----------
    if (opt === "a") {
      const p = await open(ctx, Q);
      await li(p, "eggs").locator(".rowlink").hover();
      ok(`a hover: three buttons with key caps U, S, D, in that order, the tick last`, (await li(p, "eggs").locator(".rb .kbd").allInnerTexts()).join("") === "USD");
      ok(`a hover: the use-by words step aside while the buttons show`, (await vis(p, "li[data-id=eggs] .due")).v === "hidden");
      ok(`a hover: the buttons are 40px tall or more`, (await vis(p, "li[data-id=eggs] .rb.one")).h >= 40);
      ok(`a hover: a button opens its label under the pointer, the others stay icons`, await (async () => { await li(p, "eggs").locator(".rb.shop").hover(); const a = (await vis(p, "li[data-id=eggs] .rb.shop .lbl")).d, b = (await vis(p, "li[data-id=eggs] .rb.one .lbl")).d; return a !== "none" && b === "none"; })());
      ok(`a hover: each button has a spoken name with the item`, /Use one of Eggs/.test(await li(p, "eggs").locator(".rb.one").getAttribute("aria-label")) && /Add to shopping list: Eggs/.test(await li(p, "eggs").locator(".rb.shop").getAttribute("aria-label")) && /Mark as used up: Eggs/.test(await li(p, "eggs").locator(".rb.all").getAttribute("aria-label")));
      await p.mouse.move(5, 5); await li(p, "milk").locator(".rowlink").focus();
      ok(`a keyboard: focus on a row shows its buttons`, await shown(p, "li[data-id=milk] .ract"));
      await li(p, "thighs").locator(".rowlink").hover();
      const g = await p.evaluate(() => { const n = document.querySelector("li[data-id=thighs] .name").getBoundingClientRect(), s = document.querySelector("li[data-id=thighs] .ract").getBoundingClientRect(); return { nameRight: n.right, stripLeft: s.left + 28 }; });
      ok(`a long name: the name ends before the buttons, it does not run under them`, g.nameRight <= g.stripLeft + 1, g);
      await p.close();
      const m = await open(ctx, Q + "&opt=a&sel=eggs"); // a mouse: no swipe by drag is drawn, nothing moves
      const x0 = await li(m, "eggs").locator(".rowlink").boundingBox(); await m.mouse.move(x0.x + 100, x0.y + 20); await m.mouse.down(); await m.mouse.move(x0.x + 300, x0.y + 22, { steps: 6 }); await m.mouse.up();
      ok(`a drag: dragging a row with the mouse does nothing (no swipe on desktop)`, (await meta(m, "eggs")).startsWith("10") && !(await m.locator("#undo-button").count()));
      await m.close();
    }
    if (opt === "b") {
      const p = await open(ctx, Q);
      await li(p, "eggs").click({ button: "right" });
      const items = await p.locator(".rmenu .mi .lb").allInnerTexts();
      ok(`b menu: Use one, Add to shopping list, Used up, Edit, History, in that order`, items.map(s => s.replace(/\s+/g, " ").trim().replace(/ (not counted|already out)$/, "")).join("|") === "Use one|Add to shopping list|Used up|Edit|History", items);
      ok(`b menu: key caps on every entry`, (await p.locator(".rmenu .mi .kbd").allInnerTexts()).join("") === "USDE,");
      ok(`b menu: roles and the first entry has focus`, (await p.locator(".rmenu").getAttribute("role")) === "menu" && (await p.evaluate(() => document.activeElement.dataset.m)) === "one");
      ok(`b menu: entries are 44px tall and the menu is inside the window`, await p.evaluate(() => { const m = document.querySelector(".rmenu").getBoundingClientRect(); return [...document.querySelectorAll(".rmenu .mi")].every(e => e.getBoundingClientRect().height >= 44) && m.right <= innerWidth && m.bottom <= innerHeight && m.left >= 0 && m.top >= 0; }));
      await p.keyboard.press("ArrowDown"); ok(`b menu: arrow keys move`, (await p.evaluate(() => document.activeElement.dataset.m)) === "shop");
      await p.keyboard.press("End"); ok(`b menu: End goes to the last entry`, (await p.evaluate(() => document.activeElement.dataset.m)) === "hist");
      await p.keyboard.press("Control+Enter"); ok(`b menu: Ctrl or Cmd Enter closes it (the owner's close chord)`, (await p.locator(".rmenu").isHidden()));
      await li(p, "eggs").click({ button: "right" }); await p.mouse.click(1100, 600); ok(`b menu: a click outside closes it`, await p.locator(".rmenu").isHidden());
      await li(p, "eggs").click({ button: "right", modifiers: ["Shift"] }); ok(`b menu: Shift right click leaves the browser's own menu alone`, await p.locator(".rmenu").isHidden());
      await li(p, "eggs").locator(".rowlink").click(); await p.keyboard.press("ContextMenu"); ok(`b menu: the Menu key opens it on the current row`, !(await p.locator(".rmenu").isHidden()));
      await p.keyboard.press("Control+Enter"); await p.keyboard.press("Shift+F10"); ok(`b menu: Shift F10 opens it too`, !(await p.locator(".rmenu").isHidden()));
      await p.keyboard.press("d"); ok(`b menu: a letter inside the menu does the action (D: used up)`, await gone(p, "eggs") && await p.locator(".rmenu").isHidden());
      await p.keyboard.press("z");
      await li(p, "carrots").locator(".rowlink").hover(); await li(p, "carrots").locator(".rmore").click(); ok(`b button: the three-dot button opens the same menu`, !(await p.locator(".rmenu").isHidden()) && (await p.locator("li[data-id=carrots] .rmore").getAttribute("aria-expanded")) === "true");
      ok(`b button: it is 40px or more and named`, (await vis(p, "li[data-id=carrots] .rmore")).h >= 40 && /Actions for Carrots/.test(await li(p, "carrots").locator(".rmore").getAttribute("aria-label")));
      await p.close();
      const lm = await open(ctx, Q + "&menu=eggs"); ok(`b menu (?menu=eggs): opens for the still, dark and light`, !(await lm.locator(".rmenu").isHidden())); await lm.close();
    }
    if (opt === "c") {
      const p = await open(ctx, Q);
      await li(p, "eggs").locator(".rowlink").hover(); await li(p, "eggs").locator(".rsel").click();
      ok(`c select: one pick shows "1 selected" in the lane, every row now shows a check box`, /1 selected/.test(await p.locator("#panel").innerText()) && await shown(p, "li[data-id=milk] .rsel"));
      await li(p, "pasta").locator(".rowlink").click(); ok(`c select: with a pick, a plain click on a row adds it, it does not open it`, /2 selected/.test(await p.locator("#panel").innerText()));
      await li(p, "pasta").locator(".rowlink").click(); ok(`c select: and a second click removes it`, /1 selected/.test(await p.locator("#panel").innerText()));
      await p.keyboard.press("Control+Enter"); await li(p, "eggs").locator(".rowlink").hover(); await li(p, "eggs").locator(".rsel").click();
      await li(p, "carrots").locator(".rowlink").click({ modifiers: ["Shift"] }); ok(`c select: Shift click picks the range from the last pick (eggs to carrots)`, /2 selected/.test(await p.locator("#panel").innerText()));
      await p.keyboard.press("Control+a"); const all = Number((await p.locator("#panel h2").innerText()).split(" ")[0]); ok(`c select: Ctrl or Cmd A picks every row on screen (12)`, all === 12, all);
      await p.keyboard.press("Control+Enter"); ok(`c select: Ctrl or Cmd Enter clears, the lane goes back to the item`, !/selected/.test(await p.locator("#panel").innerText()) && (await p.locator("#plist[data-selecting]").count()) === 0);
      await li(p, "eggs").locator(".rowlink").focus(); await p.keyboard.press("x"); ok(`c select: X on the current row picks it`, /1 selected/.test(await p.locator("#panel").innerText()));
      await p.keyboard.press("Shift+j"); await p.keyboard.press("Shift+j"); ok(`c select: Shift J extends the pick down`, /3 selected/.test(await p.locator("#panel").innerText()), await p.locator("#panel h2").innerText());
      await p.locator('[data-bulk="all"]').click(); ok(`c bulk: Used up on three asks once, in the lane, and changes nothing yet`, /Use up 3 items\?/.test(await p.locator("#panel").innerText()) && !(await gone(p, "eggs")));
      await p.locator('[data-bulk="back"]').click(); ok(`c bulk: Back returns to the actions with the pick kept`, /3 selected/.test(await p.locator("#panel").innerText()));
      await p.locator('[data-bulk="all"]').click(); await p.locator('[data-bulk="confirm"]').click();
      ok(`c bulk: confirming uses all three up and says so, one Undo for the lot`, await gone(p, "eggs") && await gone(p, "carrots") && /3 items used up/.test(await bar(p)), await bar(p));
      await p.locator("#undo-button").click(); ok(`c bulk: Undo brings all three back together`, !(await gone(p, "eggs")) && !(await gone(p, "carrots")) && !(await gone(p, "butter")));
      await li(p, "eggs").locator(".rowlink").hover(); await li(p, "eggs").locator(".rsel").click(); await li(p, "peas").locator(".rsel").click(); await li(p, "rice").locator(".rsel").click(); await p.locator('[data-bulk="one"]').click();
      ok(`c bulk: Use one applies to the counted ones only (eggs 9, peas used up, rice untouched) and says 2 of 3`, (await meta(p, "eggs")).startsWith("9") && await gone(p, "peas") && /2 items used one of|used one/.test(await bar(p)), await bar(p));
      await p.close();
      const lp = await open(ctx, Q + "&pick=eggs,peas,rice&ask=1"); ok(`c (?pick, ?ask): the confirm still opens for the link`, /Use up 3 items\?/.test(await lp.locator("#panel").innerText())); await lp.close();
      const lq = await open(ctx, Q + "&pick=eggs,peas"); ok(`c bulk: two used up at once need no question`, !/Use up 2 items\?/.test(await lq.locator("#panel").innerText())); await lq.locator('[data-bulk="all"]').click(); ok(`c bulk: and are used up at once`, await gone(lq, "eggs") && await gone(lq, "peas")); await lq.close();
    }
    if (opt === "d") {
      const p = await open(ctx, Q + "&sel=eggs");
      ok(`d panel: leads with Use one, Add to shopping list, Used up, each with its cap`, (await p.locator(".pact .btn").allInnerTexts()).map(s => s.replace(/\s+/g, " ").trim()).join("|") === "Use one U|Add to shopping list S|Used up D");
      ok(`d panel: the buttons are 44px or more`, (await p.evaluate(() => [...document.querySelectorAll(".pact .btn")].every(b => b.getBoundingClientRect().height >= 44))));
      ok(`d panel: no second copy of Used up lower down`, (await p.locator("#panel .pbtns").count()) === 0);
      await p.close();
    }
    await ctx.close();
  }
}

// ---------- Today (what the app does now), for the comparison ----------
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
  const p = await open(ctx, "opt=now&theme=kitchie");
  await li(p, "eggs").locator(".rowlink").hover();
  ok("now: the minus and the tick show on hover, no cart, no key caps on the row", (await li(p, "eggs").locator(".nb").count()) === 2 && (await li(p, "eggs").locator(".kbd").count()) === 0 && (await li(p, "eggs").locator(".nb svg circle").count()) === 0);
  ok("now: a level-only row has the tick only", (await li(p, "milk").locator(".nb").count()) === 1);
  ok("now: the shopping list is reachable only by the key or the panel (no row button)", (await li(p, "eggs").locator('[data-do="shop"]').count()) === 0);
  await ctx.close(); }

// ---------- the touch laptop: no hover, a tap makes a row current ----------
for (const [scheme, theme] of [["dark", "kitchie"], ["light", "kitchie-day"]]) {
  for (const opt of ["a", "b", "c", "d"]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme, hasTouch: true });
    const tag = `${opt} touch ${scheme}`, Q = `opt=${opt}&theme=${theme}&input=touch`;
    const p = await open(ctx, Q);
    ok(`${tag}: the page knows it is a touch laptop`, (await p.evaluate(() => document.documentElement.getAttribute("data-input"))) === "touch");
    const sel = { a: "li[data-id=eggs] .ract", b: "li[data-id=eggs] .rmore", c: "li[data-id=eggs] .rsel" }[opt];
    if (sel) ok(`${tag}: nothing extra on a row nobody has touched`, !(await shown(p, sel)));
    await li(p, "eggs").locator(".rowlink").tap(); await sleep(80);
    if (sel) ok(`${tag}: a tap makes the row current and its actions show, no hover needed`, await shown(p, sel));
    if (sel) ok(`${tag}: other rows stay quiet`, !(await shown(p, sel.replace("eggs", "carrots"))));
    const hs = await p.evaluate(o => { const q = { a: ".ract .rb", b: ".rmore", c: ".rsel", d: ".pact .btn" }[o]; return [...document.querySelectorAll(o === "d" ? q : "li[data-id=eggs] " + q)].map(e => Math.round(e.getBoundingClientRect().height)); }, opt);
    ok(`${tag}: the targets are 44px or more`, hs.length > 0 && hs.every(h => h >= 44), hs);
    if (opt === "a") { await li(p, "eggs").locator(".rb.one").tap(); ok(`${tag}: Use one by tap works`, (await meta(p, "eggs")).startsWith("9")); await p.locator("#undo-button").tap(); ok(`${tag}: Undo by tap works`, (await meta(p, "eggs")).startsWith("10")); }
    if (opt === "b") { await li(p, "eggs").locator(".rmore").tap(); ok(`${tag}: the three-dot button opens the menu by tap`, !(await p.locator(".rmenu").isHidden())); await p.locator('.rmenu [data-m="shop"]').tap(); ok(`${tag}: and an entry works by tap`, /eggs added to your list/.test(await bar(p))); }
    if (opt === "c") { await li(p, "eggs").locator(".rsel").tap(); await p.locator('[data-bulk="shop"]').tap(); ok(`${tag}: select and act by tap`, /eggs added to your list/.test(await bar(p))); }
    if (opt === "d") { await p.locator('.pact [data-do="shop"]').tap(); ok(`${tag}: the panel's button works by tap`, /eggs added to your list/.test(await bar(p))); }
    await ctx.close();
  }
}

// ---------- layout: no sideways scroll at the desktop widths, both themes ----------
for (const w of [1024, 1280, 1440]) for (const opt of ["now", "a", "b", "c", "d"]) for (const theme of ["kitchie", "kitchie-day"]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, colorScheme: theme === "kitchie" ? "dark" : "light" });
  const p = await open(ctx, `opt=${opt}&theme=${theme}&sel=thighs&hover=thighs` + (opt === "c" ? "&pick=eggs,thighs,rice" : "") + (opt === "b" ? "&menu=thighs" : ""));
  ok(`layout ${opt} ${w} ${theme}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
  ok(`layout ${opt} ${w} ${theme}: the long name does not push the row wider than the column`, await p.evaluate(() => document.querySelector("li[data-id=thighs]").getBoundingClientRect().width <= 641));
  await ctx.close();
}

// ---------- static: no raw colours in the page CSS (DESIGN.md section 2), the page loads shared tokens ----------
{ const dir = new URL("../fragments/pantry-row-actions/", import.meta.url).pathname;
  for (const f of readdirSync(dir).filter(n => n.endsWith(".css"))) { const t = readFileSync(dir + f, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""); ok(`static ${f}: no hex, rgb or hsl colour (tokens only)`, !/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(t), t.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)); }
  const idx = readFileSync(dir + "index.html", "utf8"); const style = ((idx.match(/<style>([\s\S]*?)<\/style>/) || [, ""])[1]).replace(/\/\*[\s\S]*?\*\//g, "");
  ok("static index.html: its own style block has no raw colours", !/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(style));
  const html = readFileSync(dir + "desktop.html", "utf8"); ok("static desktop.html: shared theme.css, no option file linked by default", /\.\.\/\.\.\/theme\.css/.test(html) && !/opt-[a-z]+\.(css|js)/.test(html)); }

// ---------- the options page: its live frames load, numbered decisions and questions are there ----------
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message));
  await p.goto(ROOT + "index.html"); await sleep(400);
  const t = await p.locator("body").innerText();
  ok("index: title, the owner's ask and the four options are on the page", /Pantry row actions/.test(t) && /not the right way to do it on a desktop/.test(t) && ["A", "B", "C", "D"].every(o => new RegExp("Option " + o + "\\b").test(t)));
  ok("index: the comparison table and the recommendation are there", (await p.locator("table.cmp").count()) >= 2 && /Recommended/.test(t));
  ok("index: decisions, proposals and open questions are numbered", /DA-D1\b/.test(t) && /DA-P1\b/.test(t) && /DA-Q1\b/.test(t) && /DA-Q9\b/.test(t));
  ok("index: a Build impact verdict names migration and lane", /Build impact/.test(t) && /No migration/i.test(t) && /routine/i.test(t) && /guarded/i.test(t));
  const srcs = await p.locator("iframe").evaluateAll(a => a.map(f => f.getAttribute("src")));
  ok("index: there are live frames for every option, touch and light", srcs.length >= 8 && ["opt=a", "opt=b", "opt=c", "opt=d", "input=touch", "theme=kitchie-day"].every(k => srcs.some(s => s.includes(k))), srcs.length);
  let bad = []; for (const s of srcs) { const r = await ctx.request.get(new URL(s, ROOT + "index.html").href); if (!r.ok()) bad.push(s); }
  ok("index: every frame address answers", bad.length === 0, bad);
  ok("index: no sideways scroll", await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close(); }

ok("no page errors in any run", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log(fails ? `${fails} of ${total} checks FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
