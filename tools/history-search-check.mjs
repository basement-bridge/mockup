// Behaviour, grounding and layout check for History search and filters (history/search/), revision 5, 24-25 Oct 2026 (B Sentence is the default: time first then action, light popups with three options and More, last 30 days, All time, one-page first load, divider in words, undo as one line; A, C, D kept as variations). Mockup only.
// Usage:  python3 -m http.server 8131 &   then   ROOT=http://localhost:8131 node tools/history-search-check.mjs   (SHOTS=dir saves PNGs; needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH)
// Runs at 390, 360 (phone) and 1280 (desktop), light and dark. The "grounding" checks read the screen's own source: it may use only the canonical fields (docs/knowledge/history-event-model.md).
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const ROOT = process.env.ROOT || "http://localhost:8131";
const BASE = `${ROOT}/history/search/index.html`;
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await chromium.launch();
async function open(qs, w, h, mode, auto) {
  if (!/[?&]way=/.test(qs) && qs !== "@default") qs = (qs ? qs + "&" : "?") + "way=cascade"; if (qs === "@default") qs = ""; // the default is B (revision 5); checks of the cascade baseline name it
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, mode === "dark" ? "kitchie" : "kitchie-day");
  if (!auto) await ctx.addInitScript(() => { window.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} }; }); // days then load only when the check asks (window.__hx.moreDay), so counts are exact
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(`${BASE}${qs}`); await p.waitForTimeout(300); p.errs = errs; return p;
}
const txt = (p, sel) => p.locator(sel).first().innerText();
const rows = p => p.locator("#feed .ev");
const layout = async (p, tag) => {
  ok(`${tag}: no page errors`, p.errs.length === 0, p.errs);
  ok(`${tag}: nothing scrolls sideways`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  const small = await p.evaluate(() => [...document.querySelectorAll(".hx button, .hx a, .hx input, .pv a, .pv button")].filter(e => e.offsetParent && !e.matches(".plink2, a.tl, .pv .pl") && !e.closest(".pv .pop")).map(e => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute("aria-label") || "").slice(0, 24), h: Math.round(r.height), w: Math.round(r.width) }; }).filter(x => x.h < 44 || x.w < 44));
  ok(`${tag}: every control is at least 44px both ways`, small.length === 0, small);
  ok(`${tag}: the theme applies`, await p.evaluate(() => getComputedStyle(document.body).backgroundColor !== "rgba(0, 0, 0, 0)" && getComputedStyle(document.body).backgroundColor !== "rgb(255, 255, 255)"));
};
const shot = async (p, name) => { if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/history-search-${name}.png`, fullPage: true }); };

// 0. Grounding: the screen reads only canonical fields, and every control maps to one real model field. The model file is the only place a payload is read.
const ui = readFileSync(new URL("../history/search/search.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
const code = ui.replace(/"(?:[^"\\\n]|\\.)*"/g, '""'); // strings (screen text, annotations) are not field reads
ok("grounding: search.js never reads a payload", !/payload/.test(code), code.match(/.{0,30}payload.{0,30}/));
ok("grounding: search.js has no place, scope, needs_review or counts fields", !/\bplace\b|\.scope\b|needs_review|\.count\b|\bfacet/.test(code), code.match(/.{0,30}(\bplace\b|\.scope\b|needs_review|\.count\b|\bfacet).{0,30}/));
ok("grounding: search.js does not read affects (Kitchie records none; the control and its mark are removed)", !/\baffects\b|\btouches\b/i.test(code), code.match(/.{0,30}(affects|touches).{0,30}/i));
ok("grounding: search.js has no product filter control (product stays on the event, shown on the detail)", !/data-opt="product|"product\||S\.f\.product|HM\.PRODUCTS\)/.test(ui.replace(/\/\*[\s\S]*?\*\//g, "")), ui.match(/.{0,30}S\.f\.product.{0,30}/));
const HM_SAM = "b7e2d4a6c8f01357b9d1e3f5"; // Sam's member id in the sample (model.js)
const ALLOWED = ["actor", "actorNot", "product", "area", "kind", "entityType", "entityId", "from", "to", "since"]; // the parameters GET /api/history has (model doc section 3)
const assigned = [...code.matchAll(/\bq\.(\w+)\s*=/g)].map(m => m[1]);
ok("grounding: search.js builds its query only from parameters the API has (every q.x = is one of them)", assigned.length > 0 && assigned.every(k => ALLOWED.includes(k)), assigned.filter(k => !ALLOWED.includes(k)));
ok("grounding: the patterns B, C and D add no new field read: nothing in search.js touches name, text or title of an entity or event for filtering", !/\.entity\.name\b|e\.name\b|\.title\b/.test(code) && /q\.entityType = e\[0\]; q\.entityId = e\[1\]/.test(code));
const api = readFileSync(new URL("../history/search/model.js", import.meta.url), "utf8");
ok("grounding: the stand-in filters only on the parameters the API has", [..."actor,actorNot,product,area,kind,entityType,entityId,from,to,since".split(",")].every(k => api.includes(`q.${k} !== undefined`)) && !/q\.(place|scope|text|search|name|affects)\b/.test(api));
ok("grounding: actor=others returns events with no member (Q4); the stand-in no longer has the old exclusion switch", /q\.actorNot !== undefined\) \{ if \(r\.actor && r\.actor\.member === q\.actorNot\) return false/.test(api) && !/noMember/.test(api));

// 0b. Revision 5 records (owner, voice, 24-25 Oct 2026): the docs carry the decisions table, the shared-widget sentence, the open questions; Pantry's rotary is the one this page reuses
const doc = readFileSync(new URL("../docs/knowledge/history-search.md", import.meta.url), "utf8");
ok("docs: revision 5 has a decisions table marked 'owner, voice, 24-25 Oct 2026' with rows R5-1 to R5-8", /## Revision 5 decisions \(owner, voice, 24-25 Oct 2026\)/.test(doc) && [1, 2, 3, 4, 5, 6, 7, 8].every(n => doc.includes(`| R5-${n} |`)));
ok("docs: the shared widget rule is recorded word for word", doc.includes("one component for History and Pantry; specific dates is new for both; a change to one reaches both".replace(/^o/, "O")) || /one component for History and Pantry; specific dates is new for both; a change to one reaches both/i.test(doc));
ok("docs: the open questions are recorded (30 days settled, summary endpoint approved, templates are FETCH, seen-mark still open)", /settled: 30 days/.test(doc) && /summary endpoint is approved/.test(doc) && /Templates are FETCH/.test(doc) && /seen-mark after the tick's removal is still open/.test(doc));
ok("docs: no stale statement that the default is D or that B opens on Last 7 days or that the divider prints a date and time", !/opens on \*\*D: Tap to filter\*\* on phone and desktop \(the designer/.test(doc) && !/B opens on Last 7 days;/.test(doc) && !/"You were last here Sat 17 Oct, 5:30 pm" \(the visit/.test(doc));
const pantryJs = readFileSync(new URL("../flows/household/app.js", import.meta.url), "utf8"), pantryCss = readFileSync(new URL("../flows/household/mobile/styles.css", import.meta.url), "utf8"), myCss = readFileSync(new URL("../history/search/search.css", import.meta.url), "utf8");
const ROTR = "touch-action:none;cursor:ns-resize;font-weight:600;font-size:14px;user-select:none;-webkit-user-select:none";
ok("shared widget: History's rotary is Pantry's: the same rules (.rot) and the same pointer, wheel and step logic, in the one place each; no lookalike", pantryCss.includes(ROTR) && myCss.includes(ROTR) && /status rotary: drag up or down on the value, scroll over it, or tap to step/.test(pantryJs) && /const rotStep = /.test(pantryJs) && /function rotStep\(/.test(ui) && /Math\.round\(dy \/ 20\)/.test(pantryJs) && /Math\.round\(dy \/ 20\)/.test(ui) && /navigator\.vibrate\(6\)/.test(pantryJs) && /navigator\.vibrate\(6\)/.test(ui));
for (const mode of ["light", "dark"]) {
  for (const [form, w, h] of [["phone 390", 390, 844], ["phone 360", 360, 740], ["desktop 1280", 1280, 800]]) {
    const tag = `${form} ${mode}`, fn = form.replace(" ", "");
    const wide = w >= 1024;
    const surface = wide ? "#panel" : ".fsheet";
    // 1. the divider (owner, voice, 24 Oct 2026): no card, nothing in the gutter; the plain recent list opens with a line "You were last here ..." and the newer changes above it, quietly marked
    let p = await open("", w, h, mode);
    ok(`${tag}: three tabs, My activity, Sam, Others, with no count on any of them`, (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.trim()).join() === "My activity,Sam,Others");
    ok(`${tag}: no catch-up card, no tick, no X, no 'Since you were last here' anywhere (phone or lane)`, await p.locator(".catch, .phonecatch, [data-tick], [data-closecatch], .plink2, .pbar").count() === 0 && !/Since you were last here/.test(await p.locator("body").innerText()));
    const seamEl = p.locator("#feed .seam");
    ok(`${tag}: one divider reading 'You were here on Saturday evening' (in words, revision 5), loaded by default (no tap needed)`, await seamEl.count() === 1 && (await seamEl.first().innerText()).replace(/\s+/g, " ").trim().startsWith("You were here on Saturday evening") && (await seamEl.first().getAttribute("role")) === "separator", await seamEl.allInnerTexts());
    const seamTxt = await seamEl.first().innerText();
    ok(`${tag}: no counts, no clock time and no date in the divider (no digit at all), and no counts anywhere near it`, !/\d/.test(seamTxt) && await p.locator(".hx .n, .hx-tabs .c, .tok").count() === 0 && !/\b\d+\s*(new|change|changes|entries|results)\b/i.test(await p.locator("body").innerText()), seamTxt);
    ok(`${tag}: nothing goes in the gutter for it (desktop lane carries no catch text; the lane holds the filter, or the open-a-change prompt)`, !wide || !/last here|since you were|\bnew\b/i.test(await p.locator("#panel").innerText()), wide ? await p.locator("#panel").innerText() : "");
    const order = await p.evaluate(() => { const n = [...document.querySelectorAll("#feed .ev, #feed .seam")]; const si = n.findIndex(x => x.classList.contains("seam")); return { si, above: n.slice(0, si).map(x => x.classList.contains("new")), below: n.slice(si + 1).map(x => x.classList.contains("new")) }; });
    ok(`${tag}: changes newer than the divider sit above it and carry the quiet new mark; everything below it does not`, order.si > 0 && order.above.length >= 2 && order.above.every(Boolean) && order.below.length >= 1 && order.below.every(x => !x), order);
    ok(`${tag}: the new mark is a dot with a screen-reader word, not a number or a badge`, await p.locator("#feed .ev.new .sr-only").count() === order.above.length && !/\d+ new/.test(await p.locator("body").innerText()));
    ok(`${tag}: no 'N changes', no badge, no private or hidden count on the page`, !/\b\d+ (changes?|entries|results|private|hidden)\b/i.test(await p.locator("body").innerText()) && !/private|hidden/i.test(await p.locator("body").innerText()));
    ok(`${tag}: a row reads who, then the kind's template output`, /You\s*·\s*Basmati rice Moved to Pantry, Top shelf/.test((await rows(p).first().innerText()).replace(/\n/g, " ")), await rows(p).first().innerText());
    ok(`${tag}: no 'Touches you' mark anywhere`, await p.locator(".chip.me").count() === 0 && !/touches you/i.test(await p.locator("#feed .ev").allInnerTexts().then(a => a.join(" "))));
    ok(`${tag}: no app (product) filter and no keyword box by default (Q1: elements only)`, await p.locator("#kw, [data-opt^='product']").count() === 0);
    ok(`${tag}: the notes name the two jobs and say which fields are read`, /catch up/.test(await p.locator(".hx-main .ann").first().innerText()) && /who did something and when/.test(await p.locator(".hx-main .ann").first().innerText()) && /It never reads payload/.test(await p.locator(".hx-main .ann").first().innerText()));
    await layout(p, tag + " divider"); await shot(p, `divider-${fn}-${mode}`);
    // the tabs: Sam's list (his newest changes are today, older than the divider come after)
    await p.locator('[data-tab="person"]').click();
    ok(`${tag}: Sam's tab lists only Sam's rows, and the divider sits between today's and Saturday's`, (await rows(p).allInnerTexts()).every(t => /^S|Sam/.test(t.replace(/\s+/g, " ").trim())) && await rows(p).count() === 5 && await p.locator("#feed .seam").count() === 1 && await p.locator("#feed .ev.new").count() === 2, await rows(p).count());
    // Others (Q4): everyone but me, including the shopper link and a former member; nothing hidden
    await p.locator('[data-tab="others"]').click();
    const oth = (await rows(p).allInnerTexts()).map(t => t.replace(/\s+/g, " ").trim());
    ok(`${tag}: Others shows the shopper-link change as 'Someone' (Q4: never hidden)`, oth.some(t => /^Someone/.test(t) && /Milk/.test(t)), oth);
    ok(`${tag}: Others shows a removed member's change as 'A former member'`, oth.some(t => /^A former member/.test(t) && /Yoghurt/.test(t)), oth);
    ok(`${tag}: the Others note says what is in it and that it is anonymised`, /no member/.test(await p.locator("#feed .ann").innerText()) && /former member/.test(await p.locator("#feed .ann").innerText()) && /anonymised/.test(await p.locator("#feed .ann").innerText()));
    await shot(p, `divider-others-${fn}-${mode}`);
    await p.context().close();

    // 2. the cap (H6, kept): a last visit older than three active days still loads and marks at most three days, and the divider says so
    p = await open("?last=wed&tab=person", w, h, mode);
    ok(`${tag}: older than the cap loads three active days and puts the divider after them, saying only the last three days are marked new`, await p.evaluate(() => window.__hx.S.pages.length) === 3 && /Only the last three days with activity are marked new/.test(await p.locator("#feed .seam").innerText()) && /You were here on Wednesday evening/.test(await p.locator("#feed .seam").innerText()), await p.locator("#feed .seam").allInnerTexts());
    ok(`${tag}: the quiet Fri 16 Oct is skipped, not drawn as a day`, !/Fri 16 Oct/.test(await p.locator("#feed").innerText()));
    ok(`${tag}: every row above the capped divider is marked new, none below`, await p.evaluate(() => { const n = [...document.querySelectorAll("#feed .ev, #feed .seam")]; const si = n.findIndex(x => x.classList.contains("seam")); return si > 0 && n.slice(0, si).every(x => x.classList.contains("new")) && n.slice(si + 1).every(x => !x.classList.contains("new")); }));
    await shot(p, `divider-capped-${fn}-${mode}`);
    await p.context().close();
    p = await open("?last=wed&way=cascade&tab=others", w, h, mode); // the divider stays with a tab change
    ok(`${tag}: a tab change keeps the divider in the list`, await p.locator("#feed .seam").count() === 1);
    await p.context().close();

    // 3. A, the cascade: the quiet line opens the filter sheet (phone), the lane holds it (desktop): Date (the Pantry rotary row) and Topic, nothing else
    p = await open("?tab=person", w, h, mode);
    if (!wide) { await p.locator(".qfb").click(); ok(`${tag}: the quiet line opens the filter sheet over the list`, await p.locator(".fsheet").isVisible()); }
    else ok(`${tag}: the filter is in the lane from the start`, /Filter/.test(await txt(p, "#panel")));
    const fsTxt = await p.locator(surface).innerText();
    ok(`${tag}: the filter has Date and Topic only: no App, Touches, Where or What happened group`, await p.locator(`${surface} .rotrow`).count() === 1 && (await p.locator(`${surface} h3.fh`).allInnerTexts()).map(t => t.replace(/\s+pick any$/i, "").trim().toLowerCase()).join() === "topic" && !/\bApp\b|Touches|Where|What happened/.test(fsTxt), fsTxt);
    ok(`${tag}: Topic offers Pantry, Shopping and Recipes, one combined feed (no per-app choice)`, (await p.locator(`${surface} [data-opt^="topic|area"]`).allInnerTexts()).map(t => t.trim()).join() === "Pantry,Shopping,Recipes");
    ok(`${tag}: no counts anywhere in the filter surface`, await p.locator(`${surface} .fpl i, ${surface} .mc i, ${surface} .n`).count() === 0 && !/\d+\s*(entries|results|changes|items)/.test(fsTxt));
    // the Date row is Pantry's status row: toggle (checkbox) on the left, rotary on the right, same classes
    ok(`${tag}: the Date row is Pantry's: .strow with a .stt checkbox and .dotc on the left, .rot with .rar on the right`, await p.locator(`${surface} .strow .stt[role=checkbox] .dotc`).count() === 1 && await p.locator(`${surface} .strow .rot .rv`).count() === 1 && await p.locator(`${surface} .strow .rot .rar`).count() === 1);
    ok(`${tag}: Date starts off and reads Anytime; the toggle is unchecked`, (await txt(p, `${surface} .rot .rv`)) === "Anytime" && (await p.locator(`${surface} .stt`).getAttribute("aria-checked")) === "false");
    await shot(p, `filter-${fn}-${mode}`);
    // the rotary, as Pantry has it: tap steps, drag changes, wheel changes; a hold is not special
    const rv = () => txt(p, `${surface} .rot .rv`), rot = p.locator(`${surface} .rot`);
    await rot.click();
    ok(`${tag}: the first tap on an off row turns Date on at its remembered window (Last 7 days) and filters the list`, (await rv()) === "Last 7 days" && await p.locator(`${surface} .rotrow.on`).count() === 1 && await p.evaluate(() => window.__hx.S.f.on === true));
    await rot.click(); ok(`${tag}: the next tap steps to Last 30 days`, (await rv()) === "Last 30 days");
    await rot.click(); ok(`${tag}: and wraps round to Today`, (await rv()) === "Today");
    ok(`${tag}: Date Today with Sam's tab lists Sam's two changes from Today only`, await rows(p).count() === 2 && /today/i.test(await txt(p, "#feed")));
    let bx = await rot.boundingBox(); const cx = bx.x + bx.width / 2, cy = bx.y + bx.height / 2;
    await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx, cy - 25, { steps: 5 });
    ok(`${tag}: dragging up moves the window and the row label shows the window while dragging`, (await rv()) === "Last 7 days" && (await txt(p, `${surface} .rotrow .lbl2`)) === "Last 7 days" && await p.locator(`${surface} .rotrow.drag`).count() === 1, [await rv(), await txt(p, `${surface} .rotrow .lbl2`)]);
    await p.mouse.up();
    ok(`${tag}: on release the label returns to Date and the rotary keeps the value`, (await txt(p, `${surface} .rotrow .lbl2`)) === "Date" && (await rv()) === "Last 7 days");
    bx = await rot.boundingBox(); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2 + 45, { steps: 5 }); await p.mouse.up();
    ok(`${tag}: dragging down goes back to Today`, (await rv()) === "Today");
    await p.mouse.move(cx, cy); await p.mouse.wheel(0, 120); await p.waitForTimeout(50);
    ok(`${tag}: the wheel over the rotary steps it`, (await rv()) === "Last 7 days");
    // press and hold: Pantry has none, so a hold here is a plain tap. Nothing opens.
    await p.mouse.move(cx, cy); await p.mouse.down(); await p.waitForTimeout(900); await p.mouse.up();
    ok(`${tag}: press and hold does nothing special (Pantry has none): one step, no extra surface opens`, (await rv()) === "Last 30 days" && await p.locator(`${surface} .rotpick, [role=listbox], [role=menu]`).count() === 0, await rv());
    await rot.focus(); await p.keyboard.press("ArrowUp"); await p.waitForTimeout(30);
    ok(`${tag}: arrow keys step it too (access)`, (await rv()) === "Last 7 days");
    ok(`${tag}: no sub-row of kinds until a topic is picked`, await p.locator(`${surface} .ksub`).count() === 0);
    await layout(p, tag + " date"); await shot(p, `date-${fn}-${mode}`);
    // the toggle on the left switches it off: Anytime again, and the window is remembered
    await p.locator(`${surface} .stt`).click();
    ok(`${tag}: the toggle turns Date off: Anytime, and the list is no longer limited`, (await rv()) === "Anytime" && await p.locator(`${surface} .rotrow.on`).count() === 0 && await p.evaluate(() => window.__hx.S.f.on === false && window.__hx.S.f.i === 1));
    // Topic: one choice; a finer step only where an area has several kinds
    const pick = async (o) => { await p.locator(`${surface} [data-opt="topic|${o}"]`).click(); };
    await pick("area:pantry");
    ok(`${tag}: Topic Pantry shows one chip on and a finer 'In Pantry' row`, await p.locator(`${surface} [data-opt^="topic|area"].on`).count() === 1 && /in pantry/i.test(await p.locator(`${surface} .ksub`).innerText()));
    await pick("kind:pantry.removed");
    ok(`${tag}: Pantry then Removed (the milk vanished): Sam's removals, with Date still Anytime: today's tea (new) then the divider then Thursday's bread`, await rows(p).count() === 2 && /Green tea\s*Used up/.test((await rows(p).first().innerText()).replace(/\s+/g, " ")) && /Bread/.test(await rows(p).nth(1).innerText()) && await p.locator("#feed .seam").count() === 1, await rows(p).allInnerTexts());
    ok(`${tag}: the lane header (desktop) or the quiet line (phone) names what is on`, /Removed in Pantry/.test(await p.evaluate(() => (document.querySelector(".fph p") || document.querySelector(".qline")).textContent)));
    await pick("area:recipe");
    ok(`${tag}: choosing Recipes replaces Pantry: one choice per group, and Recipes has no finer row`, await p.locator(`${surface} [data-opt^="topic|area"].on`).count() === 1 && await p.locator(`${surface} .ksub`).count() === 0 && await rows(p).count() === 1 && /Sam\s*made a change in Recipe/.test((await rows(p).first().innerText()).replace(/\s+/g, " ")), await rows(p).allInnerTexts());
    await shot(p, `topic-${fn}-${mode}`);
    // zero result names the filters and offers 30 days
    await p.locator(`${surface} .stt`).click(); /* on, at Last 7 days */ await rot.click(); /* Last 30 days */ await rot.click(); /* Today */
    ok(`${tag}: Today and Recipes together give no matches, said by name`, /No matches/.test(await txt(p, "#feed")) && /Today/.test(await txt(p, "#feed")) && /Recipes/.test(await txt(p, "#feed")), await txt(p, "#feed"));
    await shot(p, `zero-${fn}-${mode}`);
    if (!wide) await p.locator(".fsheet .ffoot .pri").click();
    await p.locator("[data-month]").click();
    ok(`${tag}: Look back 30 days widens Date and finds the Recipes row`, await rows(p).count() === 1 && /Recipe/.test(await rows(p).first().innerText()) && await p.evaluate(() => window.__hx.S.f.on && window.__hx.S.f.i === 2), await rows(p).count());
    ok(`${tag}: a kind with no published template is the generic row, never blank`, /Sam\s*made a change in Recipe/.test((await rows(p).first().innerText()).replace(/\s+/g, " ")), await rows(p).first().innerText());
    await p.context().close();
    p = await open("?area=shopping", w, h, mode);
    ok(`${tag}: ?area=shopping lists the shopping change in the one feed`, await rows(p).count() === 1 && /You\s*made a change in Kitchie/.test((await rows(p).first().innerText()).replace(/\s+/g, " ")) && /Shopping/.test(await rows(p).first().innerText()), await rows(p).allInnerTexts());
    // 5. the result detail defers to the template; a generic row opens a generic detail
    await rows(p).first().click();
    const det = wide ? "#panel" : ".dsheet";
    ok(`${tag}: the generic row opens a detail with the skeleton and no invented body`, /You made a change in Kitchie/.test((await txt(p, det)).replace(/\s+/g, " ")) && /No template for kitchie\/shopping\.added\/1 is published/.test(await txt(p, det)));
    await shot(p, `detail-generic-${fn}-${mode}`);
    await p.close();

    // 6. recent: a day at a time, newest day first, filtered results page the same way
    p = await open("?tab=person", w, h, mode);
    ok(`${tag}: the list opens with the newest days up to the divider (Today, Yesterday), not the whole month`, await p.locator("#feed section.day").count() === 2 && /today/i.test(await txt(p, "#feed")) && await p.locator("#feed .seam").count() === 1);
    ok(`${tag}: on a phone one quiet line shows the filter, Anytime · All topics`, wide ? await p.locator(".qline").count() === 0 : (await txt(p, ".qline")).trim() === "Anytime · All topics");
    const before = await p.locator("#feed section.day").count();
    await p.evaluate(() => window.__hx.moreDay());
    await p.waitForTimeout(100);
    ok(`${tag}: one more day with activity loads, not a button`, await p.locator("#feed section.day").count() === before + 1 && !(await p.locator("#feed").innerText()).includes("Show more"));
    for (let i = 0; i < 6; i++) await p.evaluate(() => window.__hx.moreDay());
    const labels = await p.locator("#feed section.day .lbl").allInnerTexts();
    ok(`${tag}: days after Thu 15 Oct skip the quiet Fri 16 Oct`, /thu 15 oct/i.test(labels.join("|")) && !/fri 16 oct/i.test(labels.join("|")), labels);
    await layout(p, tag + " recent"); await shot(p, `recent-${fn}-${mode}`);
    // 6b. the sentinel loads the next day by itself when it scrolls into view (no button)
    const au = await open("?tab=person", w, h, mode, true); await au.waitForTimeout(1600);
    ok(`${tag}: scrolling into the end of the list loads more days on its own`, await au.evaluate(() => window.__hx.S.pages.length) > 1); await au.close();
    // 7. the result detail, template present: wording is the template's, detail lines are the template's, the link is the template's
    await p.locator('#feed .ev:has-text("Frozen peas")').first().click();
    ok(`${tag}: the detail shows the template's line and its detail line`, /Frozen peas\s*Moved to Freezer, Drawer 2/.test((await txt(p, det)).replace(/\s+/g, " ")) && /Was in Freezer, Drawer 1/.test(await txt(p, det)), await txt(p, det));
    ok(`${tag}: the only link in the detail is the template's, to a route Kitchie registered`, await p.locator(`${det} a[data-route]`).count() === 1 && (await p.locator(`${det} a[data-route]`).getAttribute("data-route")) === "/kitchie-uat/pantry/items/itm_peas");
    ok(`${tag}: the detail says who, when and the app from the skeleton`, /Sam/.test(await txt(p, det + " .dh")) && /Sun 18 Oct, 7:40 am/.test(await txt(p, det + " .dh")) && /Kitchie/.test(await txt(p, det + " .dh")), await txt(p, det + " .dh"));
    await layout(p, tag + " detail"); await shot(p, `detail-template-${fn}-${mode}`);
    await p.close();

    // 9. the filter patterns B, C and D (owner, voice, 24 Oct 2026). Every control must map to a real model filter: after each tap the query the screen would send is read back and must use only the API's parameters.
    {
      const Qp = pg => pg.evaluate(() => window.__hx.params(false));
      const realQ = (name, q) => ok(`${tag}: ${name}: the query uses only parameters the API has`, Object.keys(q).every(k => ALLOWED.includes(k)) && !/Basmati|Sam\b|Pantry|Removed/.test(JSON.stringify(q)), q);
      const line = async pg => (await pg.locator("#qline").innerText()).replace(/\s+/g, " ").trim();
      const popS = wide ? ".pop2" : ".psheet";
      // ---- B: Sentence, the DEFAULT (revision 5, owner, voice, 24-25 Oct 2026): time first, then action; no person word; light popups of at most three options from a 30-day summary, with More (gutter flyout on desktop, sheet on phone);
      //      opens on Last 30 days; All time is the last stop; scrolling past 30 days turns to All time; the first load is one page; the divider says it in words
      const popB = ".pop2.light", opts = async pg => (await pg.locator(`${popB} .qo:not(.qmore)`).allInnerTexts()).map(t => t.trim());
      const PERSON = /\b(you|sam|arjan|others?|mine|my|by|someone)\b/i, ME_ID = "a1f3c9d2e4b60718a3c5d9e0", DAYMS = 86400000;
      const flyS = wide ? "#panel .fly" : ".fsheet";
      // the expected suggestions, computed here from the sample rows independently of the screen (same rule: 30 days, one count per kind per day, 0.5^(age/2))
      const expectFor = (pg, tab) => pg.evaluate(tab => {
        const A = window.__hx, HM = A.HM, ME = "a1f3c9d2e4b60718a3c5d9e0", SAM = "b7e2d4a6c8f01357b9d1e3f5", NOW = HM.NOW;
        const inTab = e => tab === "mine" ? e.actor && e.actor.member === ME : tab === "person" ? e.actor && e.actor.member === SAM : !(e.actor && e.actor.member === ME);
        const ev = A.ALL.filter(e => inTab(e) && Date.parse(e.occurred_at) >= NOW - 30 * 86400000 && Date.parse(e.occurred_at) <= NOW), kinds = {};
        ev.forEach(e => { (kinds[e.kind] = kinds[e.kind] || new Set()).add(HM.dayKey(e.occurred_at)); });
        const sc = k => [...kinds[k]].reduce((n, d) => n + Math.pow(0.5, Math.max(0, (NOW - Date.parse(HM.dayBounds(d)[1])) / 86400000) / 2), 0);
        const regs = HM.REGISTRY.kinds.map(k => k.kind), lab = k => HM.REGISTRY.kinds.find(x => x.kind === k).label + " in " + HM.REGISTRY.areas.find(a => a.id === k.split(".")[0]).label;
        const ranked = Object.keys(kinds).filter(k => regs.includes(k)).sort((a, b) => sc(b) - sc(a) || (a < b ? -1 : 1));
        const today = HM.dayKey(new Date(NOW).toISOString()), win = [];
        if (ev.some(e => HM.dayKey(e.occurred_at) === today)) win.push("Today"); if (ev.some(e => Date.parse(e.occurred_at) >= NOW - 7 * 86400000)) win.push("Last 7 days"); if (ev.length) win.push("Last 30 days");
        return { pantry: ranked.filter(k => k.startsWith("pantry.")).map(k => HM.REGISTRY.kinds.find(x => x.kind === k).label), top: ranked.slice(0, 3).map(lab), all: ranked, win, nKinds: ranked.length, byDays: ranked.slice().sort((a, b) => kinds[b].size - kinds[a].size || (a < b ? -1 : 1)).slice(0, 3).map(lab) };
      }, tab);
      p = await open("@default", w, h, mode);
      const lineTxt = await line(p);
      ok(`${tag} B default: with no ?way= the page opens on the sentence line (B is the default pattern)`, await p.evaluate(() => window.__hx.WAY) === "b" && await p.locator("#qline .sline").count() === 1 && await p.locator(".fsheet, .fp, .rotrow, .qstrip").count() === 0);
      ok(`${tag} B 1: the line reads 'last 30 days · everything' (time first, then action)`, lineTxt === "last 30 days · everything", lineTxt);
      ok(`${tag} B 1: time before action: the first tappable word is the time, the second the action`, (await p.locator("#qline [data-pick]").evaluateAll(a => a.map(x => x.dataset.pick))).join() === "when,what");
      ok(`${tag} B 1: no person word in the sentence or its aria label (the tabs say whose): no You, name, mine, others, by`, !PERSON.test(lineTxt) && !PERSON.test(await p.locator("#qline .sline").getAttribute("aria-label")) && await p.locator('[data-pick="who"], [data-who]').count() === 0, lineTxt);
      ok(`${tag} B 1: 'everything' is the no-action-filter state; the word 'anything' is gone from the line`, /everything/.test(lineTxt) && !/anything/i.test(lineTxt) && !/anything/i.test(await p.locator("#qline .sline").getAttribute("aria-label")));
      for (const [tab, name] of [["person", "Sam"], ["others", "Others"], ["mine", "My activity"]]) { await p.locator(`[data-tab="${tab}"]`).click(); ok(`${tag} B 1: on the ${name} tab the sentence is the same, only time and action`, (await line(p)) === "last 30 days · everything", await line(p)); }
      ok(`${tag} B: the tabs are as they were (My activity, Sam, Others)`, (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.trim()).join() === "My activity,Sam,Others");
      // 3. opens on last 30 days; the first load is one page of whole days; the divider is in it
      ok(`${tag} B 3: it opens on a rolling Last 30 days (not 7, not Anytime): Date on at the third window, from is thirty days back`, await p.evaluate(() => { const S = window.__hx.S, f = window.__hx.params().from; return S.f.on === true && S.f.i === 2 && !S.f.day && Math.abs(Date.parse(f) - (Date.parse("2026-10-17T23:00:00.000Z") - 30 * 86400000)) < 1000; }));
      const fl = await p.evaluate(() => { const A = window.__hx, S = A.S, f = A.params().from, inWin = A.ALL.filter(e => e.actor && e.actor.member === "a1f3c9d2e4b60718a3c5d9e0" && e.occurred_at >= f); return { loadedDays: S.pages.length, loadedRows: A.rows().length, winDays: new Set(inWin.map(e => A.HM.dayKey(e.occurred_at))).size, winRows: inWin.length, need: A.pageRows(), more: S.more }; });
      ok(`${tag} B 3: the first load is ONE PAGE worth of whole days (about what fills the screen), not 30 days of entries`, fl.loadedRows >= fl.need && fl.loadedRows < fl.winRows && fl.loadedDays < fl.winDays && fl.more === true && await p.locator("#feed section.day").count() === fl.loadedDays, fl);
      ok(`${tag} B 3: the list opens with the divider, loaded by default`, await p.locator("#feed .seam").count() === 1);
      ok(`${tag} B: no panel, no cascade: no filter sheet, no lane panel, no Date row until a slot is tapped`, await p.locator(".fsheet, .fp, .rotrow").count() === 0);
      // 5. the divider in words; the quiet dot is kept
      ok(`${tag} B 5: the divider reads 'You were here on Saturday evening' (no clock time, no date, no count)`, (await p.locator("#feed .seam .sm1").innerText()) === "You were here on Saturday evening" && !/\d/.test(await p.locator("#feed .seam").innerText()), await p.locator("#feed .seam").allInnerTexts());
      const hv = await p.evaluate(() => { const H = window.__hx.humanVisit, U = window.__hx.HM.utc, now = new Date(window.__hx.HM.NOW).toISOString(); return { sat: H(U(1, 17, 30), now), wed: H(U(4, 17, 30), now), lastSat: H("2026-10-10T07:30:00.000Z", "2026-10-17T00:30:00.000Z"), fri: H(U(2, 14, 0), now), morning: H(U(0, 6, 0), now), wk: H(U(10, 9, 0), now), weeks: H(U(30, 9, 0), now), months: H(U(120, 9, 0), now), night: H(U(1, 23, 30), now) }; });
      ok(`${tag} B 5: humanVisit: Saturday evening within the week, Wednesday evening, 'last Saturday evening' for the same weekday one week back`, hv.sat === "on Saturday evening" && hv.wed === "on Wednesday evening" && hv.lastSat === "last Saturday evening", hv);
      ok(`${tag} B 5: humanVisit: part of day (morning, afternoon, night), the week before, a few weeks, a few months; never a digit`, hv.fri === "on Friday afternoon" && hv.morning === "this morning" && hv.night === "on Saturday night" && /^last \w+$/.test(hv.wk) && hv.weeks === "a few weeks ago" && hv.months === "a few months ago" && !/\d/.test(JSON.stringify(hv)), hv);
      ok(`${tag} B 5: the quiet dot is kept on entries newer than the last visit: a dot (::before) on every row above the divider, a screen-reader word, none below`, await p.evaluate(() => { const n = [...document.querySelectorAll("#feed .ev, #feed .seam")], si = n.findIndex(x => x.classList.contains("seam")), up = n.slice(0, si), dn = n.slice(si + 1); const dot = e => { const c = getComputedStyle(e, "::before"); return c.content !== "none" && parseFloat(c.width) > 0 && c.backgroundColor !== "rgba(0, 0, 0, 0)"; }; return si > 0 && up.length >= 2 && up.every(e => e.classList.contains("new") && dot(e) && e.querySelector(".sr-only")) && dn.every(e => !e.classList.contains("new")); }));
      await shot(p, `b-default-${fn}-${mode}`);
      p.setDefaultTimeout(8000);
      // 4. the time slot: a light popup, at most three options drawn from the data, and More
      await p.locator('[data-pick="when"]').click();
      ok(`${tag} B 2: the time slot opens a light popup under the line (not a sheet, not a flyout), same dotted look`, await p.locator(popB).count() === 1 && await p.locator(".fsheet, .sheet, #panel .fp").count() === 0 && await p.locator(`${popB} .t`).first().evaluate(e => getComputedStyle(e).textDecorationStyle) === "dotted");
      let ex = await expectFor(p, "mine");
      ok(`${tag} B 2: time options are drawn from the data: My activity did nothing today, so Today is not offered`, (await opts(p)).join() === ex.win.join() && !(await opts(p)).includes("Today") && ex.win.join() === "Last 7 days,Last 30 days", [await opts(p), ex.win]);
      ok(`${tag} B 2: at most three options plus More; More is always there`, (await opts(p)).length <= 3 && await p.locator(`${popB} [data-more="when"]`).count() === 1);
      await p.mouse.move(0, 0); await layout(p, tag + " B time popup"); await shot(p, `b-time-popup-${fn}-${mode}`);
      await p.locator('[data-win="1"]').click();
      ok(`${tag} B 2: choosing a window sets the time, closes the popup and the list follows`, (await line(p)) === "last 7 days · everything" && await p.locator(popB).count() === 0 && (await Qp(p)).from !== undefined && Math.abs(Date.parse((await Qp(p)).from) - (Date.parse("2026-10-17T23:00:00.000Z") - 7 * DAYMS)) < 1000, await line(p));
      await p.locator('[data-pick="when"]').click(); await p.locator('[data-win="2"]').click();
      await p.locator('[data-tab="person"]').click(); await p.locator('[data-pick="when"]').click();
      ex = await expectFor(p, "person");
      ok(`${tag} B 2: Sam did something today, so his popup offers Today, Last 7 days, Last 30 days`, (await opts(p)).join() === "Today,Last 7 days,Last 30 days" && ex.win.join() === (await opts(p)).join(), [await opts(p), ex.win]);
      await p.keyboard.press("Escape");
      ok(`${tag} B 2: Esc closes the popup`, await p.locator(popB).count() === 0);
      // the action slot: the top three of that person, ranked by recent activity from the 30-day summary
      for (const [tab, name] of [["mine", "My activity"], ["person", "Sam"], ["others", "Others"]]) {
        await p.locator(`[data-tab="${tab}"]`).click(); await p.locator('[data-pick="what"]').click(); ex = await expectFor(p, tab);
        ok(`${tag} B 2: ${name}: the action slot offers at most three kinds, the top three by recent activity (0.5^(age/2) per day with activity), then More`, (await opts(p)).length === 3 && (await opts(p)).join() === ex.top.join() && await p.locator(`${popB} [data-more="what"]`).count() === 1 && await p.locator(`${popB} [data-rank]`).count() === 3, [await opts(p), ex.top]);
        if (tab !== "others") ok(`${tag} B 2: ${name}: recency counts, so the top three are not just the kinds done on the most days`, ex.top.join() !== ex.byDays.join(), [ex.top, ex.byDays]);
        await p.keyboard.press("Escape");
      }
      // the suggestions come from the separate 30-day summary: summarize30, no entries
      const sl = await p.evaluate(() => ({ log: window.__hx.sumLog.slice(), shape: window.__hx.summarize30("mine").map(x => Object.keys(x).join()), sample: window.__hx.summarize30("mine")[0] }));
      const logBefore = sl.log.filter(x => x.via !== "summarize30" && x.via !== "summarize.widened");
      ok(`${tag} B 4: the suggestions are drawn from summarize30 (a separate cheap 30-day summary): every summary call so far was summarize30 over 30 days`, sl.log.length > 3 && sl.log.every(x => x.via === "summarize30" && x.span === 30) && logBefore.length === 0, sl.log.slice(0, 4));
      ok(`${tag} B 4: the summary carries kind and days only, no entries (no actor, payload, seq or text)`, sl.shape.every(s => s === "kind,days") && sl.sample.days.every(d => /^\d{4}-\d\d-\d\d$/.test(d)), sl.shape);
      ok(`${tag} B 4: the mockup says it is a fake: 'in the real build this is one cheap Platform call, owner approved' (in the source)`, /in the real build this is one cheap Platform call, owner approved/i.test(readFileSync(new URL("../history/search/search.js", import.meta.url), "utf8")) && /function summarize30\(/.test(ui));
      ok(`${tag} B 4: half-life is the one constant, 2 days, marked a proposal`, await p.evaluate(() => window.__hx.HALF_LIFE) === 2 && /HALF_LIFE = 2;[^\n]*PROPOSAL/.test(readFileSync(new URL("../history/search/search.js", import.meta.url), "utf8")));
      // pick a kind from the popup
      await p.locator('[data-tab="mine"]').click(); await p.locator('[data-pick="what"]').click(); await p.locator(`${popB} [data-opt="topic|kind:pantry.moved"]`).click();
      ok(`${tag} B 2: choosing a kind closes the popup and reads 'last 30 days · Moved in Pantry'`, (await line(p)) === "last 30 days · Moved in Pantry" && await p.locator(popB).count() === 0, await line(p));
      let q = await Qp(p); realQ("B kind", q); ok(`${tag} B 2: the action is kind, with actor me; the time is from only (thirty days)`, q.kind === "pantry.moved" && q.actor === "me" && q.area === undefined && q.to === undefined && typeof q.from === "string", q);
      await p.locator("#qline [data-clear]").click();
      ok(`${tag} B 3: the X clears the action and puts the time back to Last 30 days (never Anytime)`, (await line(p)) === "last 30 days · everything" && await p.evaluate(() => window.__hx.S.f.on === true && window.__hx.S.f.i === 2), await line(p));
      // More (action): the fuller two-level list, in the gutter flyout (desktop) or a sheet (phone)
      await p.locator('[data-pick="what"]').click(); await p.locator(`${popB} [data-more="what"]`).click();
      ok(`${tag} B 2: action More opens the fuller filter as a ${wide ? "flyout in the right gutter" : "sheet"}, not a popover`, await p.locator(popB).count() === 0 && await p.locator(flyS).isVisible() && (wide ? await p.locator(".fsheet").count() === 0 : await p.locator("#panel .fly").count() === 0), await p.locator(flyS).count());
      const fo = async () => (await p.locator(`${flyS} [data-opt]`).allInnerTexts()).map(t => t.trim());
      ok(`${tag} B 2: the two-level list: Everything, then only the areas My activity has used (Pantry, Shopping; no Recipes)`, (await fo()).join() === "Everything,Pantry,Shopping", await fo());
      await p.locator(`${flyS} [data-opt="topic|area:pantry"]`).click();
      ok(`${tag} B 2: choosing the area shows only its kinds this person has done, as whole phrases under 'In Pantry'`, /in pantry/i.test(await p.locator(`${flyS} .ksub`).innerText()) && (await p.locator(`${flyS} .ksub ~ div [data-opt]`).allInnerTexts()).map(t => t.trim()).join() === (await expectFor(p, "mine")).pantry.join() && (await expectFor(p, "mine")).pantry.length === 6, [await p.locator(`${flyS} .ksub ~ div [data-opt]`).allInnerTexts(), (await expectFor(p, "mine")).pantry]);
      ex = await expectFor(p, "mine"); ok(`${tag} B 2: hidden means hidden: no Purchased, Swapped, Restored, Undone, Bulk changed for this person`, !/Purchased|Swapped|Restored|Undone|Bulk/.test(await p.locator(`${flyS} .ksub ~ div[role=group]`).innerText()));
      await p.locator(`${flyS} [data-opt="topic|kind:pantry.removed"]`).click(); q = await Qp(p); realQ("B flyout kind", q);
      ok(`${tag} B 2: a pick in the flyout is the same filter: the line says 'last 30 days · Removed in Pantry' and the query is kind and actor me`, (await line(p)) === "last 30 days · Removed in Pantry" && q.kind === "pantry.removed" && q.actor === "me", [await line(p), q]);
      await p.mouse.move(0, 0); await layout(p, tag + " B action flyout"); await shot(p, `b-action-more-${fn}-${mode}`);
      ok(`${tag} B 6: the mockup note says the action slot means an area or a kind, area is not the app, kind is one phrase under its area, kind names are whole phrases`, await (async () => { const t = (await p.locator(".ann").allInnerTexts()).join(" ").replace(/\s+/g, " "); return /means an area or a kind/.test(t) && /broad bucket inside an app/.test(t) && /not the app: the app filter is removed/i.test(t) && /specific action/.test(t) && /Stock checked, shown as one phrase under its area/.test(t) && /whole phrases because the template builds the line/.test(t); })());
      await p.locator(`${flyS} [data-closefly]`).first().click(); await p.locator("#qline [data-clear]").click();
      ok(`${tag} B 2: closing the flyout leaves the filter on; the X clears it`, await p.locator(flyS).count() === 0 && (await line(p)) === "last 30 days · everything");
      // Hide options a person has no activity in: Sam
      await p.locator('[data-tab="person"]').click(); await p.locator('[data-pick="what"]').click(); await p.locator(`${popB} [data-more="what"]`).click();
      ok(`${tag} B 2: Sam has no Shopping activity: More lists Everything, Pantry, Recipes (hidden, not reordered)`, (await fo()).join() === "Everything,Pantry,Recipes", await fo());
      await p.locator(`${flyS} [data-opt="topic|area:pantry"]`).click();
      const samK = (await p.locator(`${flyS} .ksub ~ div [data-opt]`).allInnerTexts()).map(t => t.trim());
      ok(`${tag} B 4: within the 30-day summary Sam has Undone (the mango undo) and Bulk changed but no Purchased, Swapped; Restored is older than 30 days so it is not offered yet`, samK.includes("Undone") && samK.includes("Bulk changed") && !samK.includes("Restored") && !samK.includes("Purchased") && !samK.includes("Swapped"), samK);
      // More (time): the date widget with All time as the last stop, and specific dates
      await p.locator(`${flyS} [data-closefly]`).first().click(); await p.locator("#qline [data-clear]").click();
      await p.locator('[data-pick="when"]').click(); await p.locator(`${popB} [data-more="when"]`).click();
      ok(`${tag} B 2: time More opens the ${wide ? "gutter flyout" : "sheet"} with Pantry's Date rotary row (no Anytime toggle) and a specific-date picker`, await p.locator(`${flyS} .strow .rot .rar`).count() === 1 && await p.locator(`${flyS} .strow .stt[role=checkbox], ${flyS} .dotc`).count() === 0 && await p.locator(`${flyS} .daypick`).count() === 1 && (await txt(p, `${flyS} .rot .rv`)) === "Last 30 days");
      ok(`${tag} B 4: it is the same rotary as Pantry's and A's: same .strow .rot .rar markup, one rotary implementation in the source`, (code.match(/function rotStep\(/g) || []).length === 1 && (code.match(/function rotRow\(/g) || []).length === 1);
      const rvv = () => txt(p, `${flyS} .rot .rv`), seenT = []; for (let i = 0; i < 4; i++) { await p.locator(`${flyS} .rot`).click(); seenT.push(await rvv()); }
      ok(`${tag} B 3: the time scale is Today, Last 7 days, Last 30 days and All time is the last stop (a tap past it wraps to Today)`, seenT.join() === "All time,Today,Last 7 days,Last 30 days", seenT);
      await p.locator(`${flyS} .rot`).click();
      ok(`${tag} B 3: at All time the line reads 'all time · everything' and the query has no from`, (await rvv()) === "All time" && (await line(p)) === "all time · everything" && (await Qp(p)).from === undefined, [await rvv(), await line(p)]);
      await p.locator(`${flyS} .rot`).click(); await p.locator(`${flyS} .rot`).click(); await p.locator(`${flyS} .rot`).click();
      // specific dates: a day picker; days with nothing on record are not selectable
      const dis = await p.evaluate(() => ({ off: [...document.querySelectorAll(".daypick .dpd:disabled")].length, on: [...document.querySelectorAll(".daypick .dpd:not(:disabled)")].map(e => e.dataset.day) }));
      ok(`${tag} B 2: the day picker only lets Sam pick days he has activity (Sun 18 Oct yes, Fri 16 Oct no, nothing after today)`, dis.on.includes("2026-10-18") && dis.on.includes("2026-10-17") && !dis.on.includes("2026-10-16") && !dis.on.some(d => d > "2026-10-18") && dis.off > 10, dis);
      await p.locator('.daypick [data-day="2026-10-17"]').click(); q = await Qp(p); realQ("B day", q);
      ok(`${tag} B 2: a specific date narrows to that one day (from and to), the line reads 'Sat 17 Oct · everything', the list is that day only`, (await line(p)) === "Sat 17 Oct · everything" && typeof q.from === "string" && typeof q.to === "string" && Date.parse(q.to) - Date.parse(q.from) === DAYMS - 1 && await p.locator("#feed section.day").count() === 1 && await p.locator('.daypick .dpd.on[data-day="2026-10-17"]').count() === 1, [await line(p), q]);
      await p.mouse.move(0, 0); await layout(p, tag + " B time flyout"); await shot(p, `b-time-more-${fn}-${mode}`);
      ok(`${tag} B 2: the mockup note says the date widget is one component for History and Pantry, specific dates is new for both, a change to one reaches both`, /One component for History and Pantry/.test(await p.locator(`${flyS} .ann`).innerText()) && /specific-date picker are new for both/.test(await p.locator(`${flyS} .ann`).innerText()) && /a change to one reaches both/.test(await p.locator(`${flyS} .ann`).innerText()));
      if (wide) {
        await p.locator("#feed .ev").first().click();
        ok(`${tag} B lane: opening a change replaces the flyout with the change, closing it brings the flyout back`, await p.locator("#panel .fly").count() === 0 && await p.locator("#panel .dtl").count() === 1 && (await p.locator("#panel [data-closedetail]").click(), await p.locator("#panel .fly").count() === 1));
      }
      await p.keyboard.press("Escape");
      ok(`${tag} B 2: Esc closes the flyout`, await p.locator(flyS).count() === 0);
      await p.locator("#qline [data-clear]").click();
      // 3. scrolling past the 30-day edge: the time quietly turns into All time and pages keep loading
      await p.evaluate(() => { for (let i = 0; i < 60 && window.__hx.S.more; i++) window.__hx.moreDay(); });
      const edge = await p.evaluate(() => ({ line: document.querySelector("#qline").innerText.replace(/\s+/g, " ").trim(), i: window.__hx.S.f.i, more: window.__hx.S.more, pages: window.__hx.S.pages.length, last: window.__hx.S.pages[window.__hx.S.pages.length - 1].day, sentinel: !!document.getElementById("sentinel"), from: window.__hx.params().from }));
      ok(`${tag} B 3: at the 30-day edge the list still offers to load one more day (no wall, no button), and the slot still reads last 30 days`, edge.line === "last 30 days · everything" && edge.more === false && edge.sentinel === true && edge.last >= "2026-09-18", edge);
      await p.evaluate(() => window.__hx.moreDay());
      const past = await p.evaluate(() => ({ line: document.querySelector("#qline").innerText.replace(/\s+/g, " ").trim(), i: window.__hx.S.f.i, pages: window.__hx.S.pages.length, last: window.__hx.S.pages[window.__hx.S.pages.length - 1].day, from: window.__hx.params().from, toast: !!document.querySelector("#toast:not([hidden])") }));
      ok(`${tag} B 3: scrolling past it turns the time slot into All time, quietly (no toast), and a page older than 30 days loads`, past.line === "all time · everything" && past.i === 3 && past.from === undefined && past.pages === edge.pages + 1 && past.last < edge.last && past.last < "2026-09-18" && past.toast === false, past);
      await p.evaluate(() => { for (let i = 0; i < 40 && window.__hx.S.more; i++) window.__hx.moreDay(); });
      ok(`${tag} B 3: pages keep loading to the end of the record, whole days newest first; then it says that is everything`, await p.evaluate(() => window.__hx.S.more === false) && /That is everything on record/.test(await txt(p, "#feed")) && await p.evaluate(() => { const d = window.__hx.S.pages.map(x => x.day); return d.every((x, i) => i === 0 || d[i - 1] > x); }));
      // the summary widens to match the range
      await p.locator('[data-tab="person"]').click(); await p.locator('[data-pick="what"]').click(); await p.locator(`${popB} [data-more="what"]`).click(); await p.locator(`${flyS} [data-opt="topic|area:pantry"]`).click();
      ok(`${tag} B 4: with the range widened to All time the summary widens to match: Sam's Pantry kinds now include Restored (older than 30 days)`, (await p.locator(`${flyS} .ksub ~ div [data-opt]`).allInnerTexts()).map(t => t.trim()).includes("Restored") && (await p.evaluate(() => window.__hx.sumLog.slice(-1)[0])).span === 0, await p.evaluate(() => window.__hx.sumLog.slice(-1)[0]));
      await p.keyboard.press("Escape"); await p.context().close();
      // 7. undo is ONE line; seeds never appear
      p = await open("@default", w, h, mode);
      const ud = await p.evaluate(() => { const A = window.__hx, E = A.ALL.filter(e => e.entity.id === "itm_mango"); const und = E.find(e => e.kind === "pantry.undone"), orig = E.find(e => und && e.event_id === und.ref_event_id); return { n: E.length, kinds: E.map(e => e.kind).sort(), undoActor: und && und.actor.name, origActor: orig && orig.actor.name, origQty: orig && orig.payload.quantity, removed: E.filter(e => /removed|used/.test(e.kind)).length, seeds: A.HM.SEEDS, seedEvents: A.ALL.filter(e => A.HM.SEEDS.some(s => s.toLowerCase() === String((e.payload || {}).name || "").toLowerCase()) || (e.payload || {}).origin === "seed").length }; });
      ok(`${tag} B 7: undo is its own entry, attributed to whoever pressed undo (Sam), linked to the original (Arjan's add of 10) by ref_event_id; no second 'removed' line`, ud.n === 3 && ud.kinds.join() === "pantry.added,pantry.added,pantry.undone" && ud.undoActor === "Sam" && ud.origActor === "Arjan" && ud.origQty === "10" && ud.removed === 0, ud);
      ok(`${tag} B 7: on screen the original says 'undone' and the undo reads one line, 'Sam · Undid adding 10 mangoes'`, /undone/.test(await p.locator('#feed .ev:has-text("Mangoes Added (10)")').innerText()) && !/undone/.test(await p.locator('#feed .ev:has-text("Mangoes Added (5)")').innerText()), await p.locator("#feed").innerText());
      await p.locator('[data-tab="person"]').click(); await p.evaluate(() => { for (let i = 0; i < 4; i++) window.__hx.moreDay(); });
      const undoRows = (await rows(p).allInnerTexts()).map(t => t.replace(/\s+/g, " ").trim()).filter(t => /mango/i.test(t));
      ok(`${tag} B 7: in Sam's tab it is exactly one line, 'Sam · Undid adding 10 mangoes' (no Removed, no second line)`, undoRows.length === 1 && /^S?\s*Sam · Undid adding 10 mangoes/.test(undoRows[0]) && !/removed|used up/i.test(undoRows[0]), undoRows);
      await p.locator('[data-tab="others"]').click(); await p.evaluate(() => { for (let i = 0; i < 4; i++) window.__hx.moreDay(); });
      ok(`${tag} B 7: Others shows the same single undo line`, (await rows(p).allInnerTexts()).filter(t => /mango/i.test(t)).length === 1);
      const allText = await p.evaluate(() => { const A = window.__hx; return A.ALL.map(e => { const r = A.HM.render(e); return r.text || ""; }).join("|"); });
      ok(`${tag} B 7: seed (starter-list) items never appear in History: none of ${ud.seeds.join(", ")} is an event, and none appears in any rendered row`, ud.seeds.length >= 3 && ud.seedEvents === 0 && !ud.seeds.some(s => new RegExp("\\b" + s + "\\b", "i").test(allText)), ud);
      ok(`${tag} B 7: the note says so: seeds never appear, a seeded category enters History only through use`, /Starter-list \(seed\) items never appear in History; a seeded category enters History only through use/.test((await p.locator(".ann").allInnerTexts()).join(" ").replace(/\s+/g, " ")));
      await shot(p, `b-undo-${fn}-${mode}`); await layout(p, tag + " B undo"); await p.context().close();
      // the same pattern is reachable at ?way=sentence; household with more people
      p = await open("?way=sentence&household=more", w, h, mode);
      ok(`${tag} B: ?way=sentence is the same default; with more people the tabs are My activity and Others and the sentence is still time and action only`, (await line(p)) === "last 30 days · everything" && (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.trim()).join() === "My activity,Others");
      await p.context().close();
      p = await open("?way=sentence&search=text", w, h, mode); // the free-text B-search on the default pattern
      ok(`${tag} B: the free-text B-search keeps its own label and still sits above the line`, await p.locator("#kw").count() === 1 && /Comparison/.test(await txt(p, ".kw")) && await p.locator(".sline").count() === 1);
      await p.context().close();
      p = await open("?way=sentence&last=wed&tab=person", w, h, mode); // the three-day cap in words, on the default pattern
      ok(`${tag} B 5: with the last visit on Wednesday the divider reads 'You were here on Wednesday evening' and still says only three days are marked new`, (await p.locator("#feed .seam .sm1").innerText()) === "You were here on Wednesday evening" && /Only the last three days with activity are marked new/.test(await p.locator("#feed .seam").innerText()) && await p.locator("#feed section.day").evaluateAll(a => a.length >= 3) && await p.evaluate(() => { const n = [...document.querySelectorAll("#feed section.day, #feed .seam")]; const si = n.findIndex(x => x.classList.contains("seam")); return si === 3; }), await p.locator("#feed .seam").allInnerTexts());
      await shot(p, `b-wed-${fn}-${mode}`); await p.context().close();

      // ---- C: Quick answers
      p = await open("?way=quick", w, h, mode);
      ok(`${tag} C: the strip is Mine today, Removed this week, Moved this week, By Sam, By others`, (await p.locator(".qstrip .qc").allInnerTexts()).map(t => t.trim()).join() === "Mine today,Removed this week,Moved this week,By Sam,By others");
      ok(`${tag} C: no cascade: no panel, no sheet, nothing to open`, await p.locator(".fsheet, .fp, .rotrow, [data-pick]").count() === 0);
      for (const c of ["mine-today", "removed-week", "moved-week", "by-person", "by-others"]) { // every chip is built only from real model filters: tap it, read the query back, tap it off
        await p.locator(`[data-chip="${c}"]`).click(); const cq = await Qp(p); realQ(`C chip ${c}`, cq);
        ok(`${tag} C: chip ${c} uses actor, kind and from only`, Object.keys(cq).every(k => ["actor", "actorNot", "kind", "from"].includes(k)), cq);
        await p.locator(`[data-chip="${c}"]`).click();
      }
      await p.locator('[data-chip="mine-today"]').click();
      ok(`${tag} C: one tap sets the whole answer: Mine today reads You · everything · Today`, (await line(p)).includes("You · everything · Today") && (await p.locator('[data-chip="mine-today"]').getAttribute("aria-pressed")) === "true", await line(p));
      q = await Qp(p); ok(`${tag} C: Mine today is actor me and from today's start`, q.actor === "me" && typeof q.from === "string", q);
      await p.locator('[data-chip="removed-week"]').click();
      ok(`${tag} C: a second chip is combined: Removed this week adds What and replaces the date (Mine stays)`, (await line(p)).includes("You · Removed in Pantry · Last 7 days") && (await p.locator('[data-chip="mine-today"]').getAttribute("aria-pressed")) === "false" && (await p.locator('[data-chip="removed-week"]').getAttribute("aria-pressed")) === "true", await line(p));
      await p.locator('[data-chip="by-others"]').click();
      ok(`${tag} C: a person chip changes only Who: Others · Removed in Pantry · Last 7 days`, (await line(p)).includes("Others · Removed in Pantry · Last 7 days") && await p.locator('[data-tab="others"][aria-selected="true"]').count() === 1, await line(p));
      q = await Qp(p); realQ("C combined", q); ok(`${tag} C: the combination is actor=others, kind and from together`, q.actorNot !== undefined && q.kind === "pantry.removed" && typeof q.from === "string", q);
      ok(`${tag} C: and it finds Sam's removal`, await rows(p).count() >= 1 && /Green tea/.test(await rows(p).first().innerText()), await rows(p).allInnerTexts());
      await shot(p, `c-combined-${fn}-${mode}`);
      await layout(p, tag + " C");
      await p.locator('[data-chip="removed-week"]').click();
      ok(`${tag} C: tapping a chip that is on clears just its parts: What and When go, Who stays`, (await line(p)).includes("Others · everything · anytime") && (await p.locator('[data-chip="by-others"]').getAttribute("aria-pressed")) === "true", await line(p));
      await p.locator('[data-chip="moved-week"]').click(); await p.locator("#qline [data-clear]").click();
      ok(`${tag} C: the X clears everything the chips set`, (await line(p)).includes("Others · everything · anytime") && await p.locator('.qc[aria-pressed="true"]').count() === 1, await line(p));
      ok(`${tag} C: no counts on any chip`, !/\d/.test((await p.locator(".qstrip").innerText())));
      await p.context().close();
      p = await open("?way=quick&household=more", w, h, mode);
      ok(`${tag} C: with more people there is no per-person chip (By others covers them)`, (await p.locator(".qstrip .qc").allInnerTexts()).map(t => t.trim()).join() === "Mine today,Removed this week,Moved this week,By others");
      await p.context().close();

      // ---- D: Tap to filter
      p = await open("?way=tap", w, h, mode);
      ok(`${tag} D: the line starts as You · everything · anytime, with one hint and no panel`, (await line(p)).startsWith("You · everything · anytime") && /Tap a name, a topic or a day/.test(await line(p)) && await p.locator(".fsheet, .fp").count() === 0, await line(p));
      ok(`${tag} D: a row is separate targets: the line opens the change, topic and kind and the thing are their own buttons, the row itself is not a button`, await p.locator("#feed div.ev.dv").count() >= 3 && await p.locator("#feed .ev > button.evo, #feed .ev .evo").count() >= 3 && await p.locator("#feed button.ev").count() === 0 && /Pantry/.test(await p.locator('#feed .ev:first-child .hd[data-f^="area:"]').first().innerText()), await p.locator("#feed button.ev").count());
      ok(`${tag} D: in My activity the avatar is plain (a person tap would not narrow everything)`, await p.locator("#feed button.avb").count() === 0);
      const hs = await p.locator("#feed .ev").first().locator(".hd").allInnerTexts(); ok(`${tag} D: the first row offers Pantry, Moved and Basmati rice`, hs.map(t => t.trim()).join() === "Pantry,Moved,Basmati rice", hs);
      await layout(p, tag + " D rows"); await shot(p, `d-rows-${fn}-${mode}`);
      await p.locator('#feed .hd[data-f="area:pantry"]').first().click();
      ok(`${tag} D: tapping a topic narrows the list; the line says Pantry and it clears with one tap`, (await line(p)).startsWith("You · Pantry") && await p.locator('#qline .ap[data-unset="what"]').count() === 1 && !/Tap a name/.test(await line(p)), await line(p));
      ok(`${tag} D: the toast says what happened and offers Undo`, /Showing only Pantry/.test(await txt(p, "#toast")) && await p.locator("#toast [data-undo]").count() === 1);
      q = await Qp(p); realQ("D area", q); ok(`${tag} D: topic is area, with actor me`, q.area === "pantry" && q.actor === "me", q);
      ok(`${tag} D: once Pantry is on, its handle is gone from the rows (they get quieter as the list narrows)`, await p.locator('#feed .hd[data-f="area:pantry"]').count() === 0 && await p.locator('#feed .hd[data-f^="kind:"]').count() >= 1);
      await p.locator("#toast [data-undo]").click();
      ok(`${tag} D: Undo puts the list back`, (await line(p)).startsWith("You · everything · anytime") && await p.locator('#feed .hd[data-f="area:pantry"]').count() >= 1);
      await p.locator('#feed .hd[data-f="kind:pantry.moved"]').first().click();
      ok(`${tag} D: tapping a kind narrows by kind: Moved in Pantry, every row is a move`, (await line(p)).startsWith("You · Moved in Pantry") && (await rows(p).allInnerTexts()).every(t => /Moved to/.test(t)) && await rows(p).count() >= 1, await rows(p).allInnerTexts());
      q = await Qp(p); realQ("D kind", q); ok(`${tag} D: it is kind (pantry.moved)`, q.kind === "pantry.moved" && q.area === undefined, q);
      ok(`${tag} D: with the kind on, area and kind handles are gone and only the thing's handle is left`, await p.locator('#feed .hd[data-f^="area:"], #feed .hd[data-f^="kind:"]').count() === 0 && await p.locator('#feed .hd[data-f^="entity:"]').count() >= 1);
      await shot(p, `d-narrowed-${fn}-${mode}`);
      await p.locator('#feed .hd[data-f="entity:item:itm_rice"]').first().click();
      ok(`${tag} D: tapping the item name narrows to that entity: 'just Basmati rice'`, /just Basmati rice/.test(await line(p)) && await rows(p).count() === 1, await line(p));
      q = await Qp(p); realQ("D entity", q); ok(`${tag} D: the entity filter is entity_type + entity_id (ids, never the name), sent with the product the API requires`, q.entityType === "item" && q.entityId === "itm_rice" && q.product === "kitchie" && !JSON.stringify(q).includes("Basmati"), q);
      ok(`${tag} D: the screen says the thing is matched by id, and that some kinds have none`, /id can be null/.test(await p.locator(".ann").last().innerText().catch(() => "")) || /id can be null/.test(await p.locator("body").innerText()));
      await layout(p, tag + " D entity"); await shot(p, `d-entity-${fn}-${mode}`);
      await p.locator('#qline [data-unset="entity"]').click();
      ok(`${tag} D: the entity pill clears with one tap and the rest stays on`, !/just/.test(await line(p)) && (await line(p)).startsWith("You · Moved in Pantry") && (await Qp(p)).entityId === undefined, await line(p));
      await p.locator('#qline [data-unset="what"]').click();
      ok(`${tag} D: and so does What`, (await line(p)).startsWith("You · everything · anytime"));
      // a day label is a handle: from and to for that one day
      await p.locator('#feed .dl').first().click();
      q = await Qp(p); realQ("D day", q);
      ok(`${tag} D: tapping a day label narrows to that day: from and to are that calendar day`, /Sat 17 Oct/.test(await line(p)) && typeof q.from === "string" && typeof q.to === "string" && Date.parse(q.to) - Date.parse(q.from) === 86400000 - 1 && await p.locator("#feed section.day").count() === 1 && await p.locator("#feed .dl").count() === 0, [await line(p), q]);
      await p.locator('#qline .apt').click();
      ok(`${tag} D: the date pill opens Pantry's rotary and a step replaces the day with a window`, await p.locator(`${popS} .rot`).count() === 1);
      await p.locator(`${popS} .rot`).click();
      ok(`${tag} D: now Last 7 days, no 'to'`, (await line(p)).includes("Last 7 days") && (await Qp(p)).to === undefined, await line(p));
      await p.keyboard.press("Escape"); await p.locator('#qline [data-unset="when"]').click();
      ok(`${tag} D: the date pill clears with its X: anytime again`, (await line(p)).startsWith("You · everything · anytime"));
      await p.context().close();
      // the thing is offered only where the model guarantees it: bulk_changed has no entity id; a generic row says 'This recipe', never a name
      p = await open("?way=tap&tab=person", w, h, mode);
      await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); });
      const bulk = p.locator('#feed .ev:has(.hd[data-f="kind:pantry.bulk_changed"])').first();
      ok(`${tag} D: a kind about no single thing (entity.id null) has topic and kind handles but no entity handle`, await bulk.count() === 1 && await bulk.locator('.hd[data-f^="entity:"]').count() === 0 && await bulk.locator('.hd[data-f^="kind:"]').count() === 1, await bulk.count());
      const rec = p.locator('#feed .ev:has(.hd[data-f="area:recipe"])').first();
      ok(`${tag} D: a generic row (no template) offers 'This recipe' for its entity, never a name`, await rec.count() === 1 && /This recipe/.test(await rec.locator('.hd[data-f^="entity:"]').innerText()) && !/rcp_|Fried/.test(await rec.innerText()), await rec.innerText());
      ok(`${tag} D: in Sam's own tab his avatar is plain`, await p.locator("#feed button.avb").count() === 0);
      await p.context().close();
      // a person tap exists only where it narrows: Others
      p = await open("?way=tap&tab=others", w, h, mode);
      await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); });
      ok(`${tag} D: in Others a named member's avatar is a button; 'Someone' and 'A former member' are plain (no single person to filter by)`, await p.locator('#feed .ev:has-text("Sam") button.avb').count() >= 1 && await p.locator('#feed .ev:has-text("Someone") button.avb, #feed .ev:has-text("A former member") button.avb').count() === 0 && await p.locator('#feed .ev:has-text("Someone") .avb').count() >= 1);
      await p.locator('#feed button.avb[data-f^="who:"]').first().click();
      ok(`${tag} D: tapping Sam in Others opens Sam's view (the tab, actor=Sam)`, await p.locator('[data-tab="person"][aria-selected="true"]').count() === 1 && (await Qp(p)).actor === HM_SAM && /Showing only changes by Sam/.test(await txt(p, "#toast")), await Qp(p));
      await p.context().close();
      p = await open("?way=tap&tab=others&household=more", w, h, mode);
      await p.evaluate(() => { for (let i = 0; i < 2; i++) window.__hx.moreDay(); });
      await p.locator('#feed .ev:has-text("Priya") button.avb').first().click();
      q = await Qp(p); realQ("D person", q);
      ok(`${tag} D: with three people, tapping Priya stays in Others and narrows by actor=<id>; the pill clears it`, q.actor === "c3d5e7f9a1b30246c8e0f2a4" && await p.locator('[data-tab="others"][aria-selected="true"]').count() === 1 && /Priya/.test(await line(p)) && await p.locator('#qline [data-unset="who"]').count() === 1, [q, await line(p)]);
      await p.locator('#qline [data-unset="who"]').click();
      ok(`${tag} D: clearing the person returns to everyone in Others`, (await Qp(p)).actorNot !== undefined && (await Qp(p)).actor === undefined);
      await p.context().close();
      // the divider is in every pattern's plain list, loaded by default, and a filter tap never pushes it out
      for (const way of ["sentence", "quick", "tap"]) {
        p = await open(`?way=${way}`, w, h, mode);
        ok(`${tag} ${way}: opens on the plain recent list with the divider and the line; no card, no sheet, no panel`, await p.locator("#feed .seam").count() === 1 && await p.locator("#qline .sline").count() === 1 && await p.locator(".fsheet, .fp, .catch").count() === 0);
        await p.context().close();
      }
      p = await open("?way=tap", w, h, mode);
      await p.locator('#feed .hd[data-f="kind:pantry.moved"]').first().click();
      ok(`${tag} D: tapping a handle narrows the list and the divider is still in it (filters never push the catch-up out)`, (await line(p)).startsWith("You · Moved in Pantry") && await p.locator("#feed .seam").count() === 1 && await p.locator("#feed .ev.new").count() >= 1);
      await p.locator('#qline [data-unset="what"]').click();
      await p.locator('#qline [data-pick="when"]').click(); await p.locator(`${popS} .rot`).click(); await p.keyboard.press("Escape");
      ok(`${tag} D: a date window keeps the divider too`, await p.locator("#feed .seam").count() === 1 && (await line(p)).includes("Last 7 days"), await line(p));
      await p.context().close();
      // D variation: the filter choices in the desktop gutter as a flyout (new; D is unchanged by default)
      p = await open("?way=tap", w, h, mode);
      ok(`${tag} D: by default there is no gutter flyout and no Filter button (the variation is opt-in)`, await p.locator("#panel .fp, .hx-head [data-filters]").count() === 0 && (!wide || await p.locator("#panel .lane0").count() === 1));
      await p.context().close();
      p = await open("?way=tap&lane=1", w, h, mode);
      if (wide) {
        ok(`${tag} D lane: a Filter button in the header, and the gutter shows the prompt until it is opened`, await p.locator(".hx-head [data-filters]").count() === 1 && await p.locator("#panel .lane0").count() === 1 && /Variation for owner review/i.test(await txt(p, "#panel")));
        await p.locator(".hx-head [data-filters]").click();
        ok(`${tag} D lane: the filter opens in the right lane as a flyout: Pantry's Date row, then Topic (not a popover under the line)`, await p.locator("#panel .fp .rotrow").count() === 1 && await p.locator('#panel .fp [data-opt="topic|area:pantry"]').count() === 1 && await p.locator(".pop2").count() === 0, await txt(p, "#panel"));
        ok(`${tag} D lane: the flyout is marked as a variation for owner review, and has a close`, /Variation for owner review/i.test(await txt(p, "#panel")) && await p.locator("#panel .fp [data-closepanel]").count() === 1);
        await shot(p, `d-lane-open-${fn}-${mode}`); await layout(p, tag + " D lane");
        await p.locator('#panel .fp [data-opt="topic|area:pantry"]').click();
        ok(`${tag} D lane: a pick in the flyout narrows the list and the line, the flyout stays open and offers Pantry's kinds`, (await line(p)).startsWith("You · Pantry") && await p.locator("#panel .fp .ksub").count() === 1 && await p.locator("#feed .seam").count() === 1, await line(p));
        await p.locator('#panel .fp [data-opt="topic|kind:pantry.moved"]').click();
        q = await Qp(p); realQ("D lane kind", q); ok(`${tag} D lane: it is the same filter as tapping the word in a row: kind pantry.moved, actor me`, q.kind === "pantry.moved" && q.actor === "me", q);
        await p.locator("#panel .fp .rot").click();
        ok(`${tag} D lane: the same Pantry rotary steps the date from the flyout`, (await line(p)).includes("Last 7 days") && (await Qp(p)).from !== undefined, await line(p));
        await p.locator("#feed .evo").first().click();
        ok(`${tag} D lane: opening a change replaces the flyout with the change`, await p.locator("#panel .fp").count() === 0 && await p.locator("#panel .dtl").count() === 1);
        await p.locator("#panel [data-closedetail]").click();
        ok(`${tag} D lane: closing the change brings the flyout back`, await p.locator("#panel .fp").count() === 1);
        await p.locator("#panel .fp [data-closepanel]").click();
        ok(`${tag} D lane: the close puts the prompt back; the filter that was set stays on`, await p.locator("#panel .fp").count() === 0 && await p.locator("#panel .lane0").count() === 1 && (await line(p)).startsWith("You · Moved in Pantry"));
        await p.locator('#qline [data-pick="when"], #qline .apt').first().click();
        ok(`${tag} D lane: the date word in the line opens the flyout, not a popover`, await p.locator("#panel .fp .rotrow").count() === 1 && await p.locator(".pop2").count() === 0);
      } else {
        ok(`${tag} D lane: on a phone the variation changes nothing: no Filter button, no flyout, the popover sheet as in D`, await p.locator(".hx-head [data-filters]").count() === 0 && await p.locator(".fsheet").count() === 0);
        await p.locator('[data-pick="when"]').click();
        ok(`${tag} D lane: on a phone the date word still opens the short sheet`, await p.locator(".psheet .rotrow").count() === 1 && await p.locator("#panel .fp").count() === 0);
        await p.keyboard.press("Escape");
        ok(`${tag} D lane: the variation note is not shown on a phone`, !/gutter/.test(await p.locator(".ann").allInnerTexts().then(a => a.join(" "))));
      }
      await p.context().close();
      // D opens a change from its line; the detail is the same as A's
      p = await open("?way=tap", w, h, mode);
      await p.locator("#feed .evo").first().click();
      ok(`${tag} D: the line opens the change (same detail as A)`, /Basmati rice\s*Moved to Pantry, Top shelf/.test((await txt(p, wide ? "#panel" : ".dsheet")).replace(/\s+/g, " ")));
      await p.context().close();
    }
  }
}

// 8. states that do not depend on viewport
for (const [mode, w, h] of [["dark", 390, 844], ["light", 1280, 800]]) {
  const fn = w < 1024 ? "phone390" : "desktop1280", wide = w >= 1024;
  let p = await open("?tab=person&tpl=loading", w, h, mode);
  ok(`${fn}: fetching a template shows skeleton rows with who, when and app, and no claim`, await p.locator(".ev .skbody").count() >= 1 && /Sam/.test(await rows(p).first().innerText()) && !/Used up|Moved/.test(await txt(p, "#feed")));
  await shot(p, `tpl-fetching-${fn}-${mode}`); await p.close();
  p = await open("?tpl=none", w, h, mode);
  ok(`${fn}: nothing published makes every row the generic row`, (await rows(p).allInnerTexts()).every(t => /made a change in Kitchie/.test(t.replace(/\s+/g, " "))));
  await shot(p, `tpl-none-${fn}-${mode}`); await p.close();
  // Q1: Preview B, a free-text search, labelled honestly
  p = await open("?tab=person&search=text", w, h, mode);
  ok(`${fn}: Preview B is a marked comparison and says it searches the days loaded only`, await p.locator("#kw").count() === 1 && /Comparison/.test(await txt(p, ".kw")) && /Search the days loaded/.test(await p.locator("#kw").getAttribute("placeholder")) && /only the days loaded so far, not the whole history/.test(await txt(p, ".kwnote")));
  await p.locator("#kw").fill("peas");
  ok(`${fn}: free text matches the template-rendered text of loaded rows`, await rows(p).count() === 1 && /Frozen peas/.test(await rows(p).first().innerText()));
  ok(`${fn}: B still has no counts`, !/\b\d+\s*(day|days|match|matches|results?)\b/i.test(await txt(p, ".kwnote")) && !/\b\d+ (days?|results?|matches)\b/.test(await txt(p, "#feed")));
  await p.locator("#kw").press("Escape");
  ok(`${fn}: Esc clears the search`, (await p.locator("#kw").inputValue()) === "");
  await shot(p, `search-b-${fn}-${mode}`); await p.close();
  p = await open("@default", w, h, mode);
  ok(`${fn}: with no parameters the filter pattern is B, the sentence line, on phone and desktop (revision 5)`, await p.evaluate(() => window.__hx.WAY) === "b");
  await p.close();
  p = await open("", w, h, mode);
  await p.locator("#pvb").click();
  ok(`${fn}: the Preview switch offers A (default, elements only) and B (free text)`, /A: filters only/.test(await txt(p, "#pvp")) && /B: free text/.test(await txt(p, "#pvp")) && await p.locator('#pvp a[aria-pressed="true"]:has-text("A: filters only")').count() === 1);
  ok(`${fn}: the Preview switch offers A Cascade (baseline), B Sentence (default), C Quick answers, D Tap to filter (variation); A to D stay reachable`, /A: Cascade \(baseline\)/.test(await txt(p, "#pvp")) && /B: Sentence \(default\)/.test(await txt(p, "#pvp")) && /C: Quick answers/.test(await txt(p, "#pvp")) && /D: Tap to filter \(variation\)/.test(await txt(p, "#pvp")) && !/\(recommended\)/.test(await txt(p, "#pvp")) && await p.locator('#pvp a[aria-pressed="true"]:has-text("A: Cascade")').count() === 1);
  await p.close(); p = await open("@default", w, h, mode); await p.locator("#pvb").click();
  ok(`${fn}: by default the pressed pattern in the Preview switch is B: Sentence (default)`, await p.locator('#pvp a[aria-pressed="true"]:has-text("B: Sentence (default)")').count() === 1 && await p.locator('#pvp a[aria-pressed="true"]').filter({ hasText: /^(A: Cascade|C: Quick|D: Tap)/ }).count() === 0 && !(await p.locator('#pvp a:has-text("B: Sentence")').getAttribute("href")).includes("way="));
  ok(`${fn}: the pattern links keep the other parameters and use ?way=cascade|quick|tap (B is no parameter)`, (await p.locator('#pvp a:has-text("D: Tap")').getAttribute("href")).includes("way=tap") && (await p.locator('#pvp a:has-text("D: Tap")').getAttribute("href")).includes("choices=") === false && (await p.locator('#pvp a:has-text("D: Tap")').getAttribute("href")).includes("notes") === false);
  ok(`${fn}: the Preview switch keeps the lists alternative reachable and marks Q2 undecided`, /Several \(lists\)/.test(await txt(p, "#pvp")) && /Q2, undecided/i.test(await txt(p, "#pvp")));
  await p.close();
  // Q2: the lists alternative
  p = await open(`?tab=person&choices=several&filters=1`, w, h, mode);
  const sf = wide ? "#panel" : ".fsheet";
  await p.locator(`${sf} [data-opt="topic|area:pantry"]`).click(); await p.locator(`${sf} [data-opt="topic|area:recipe"]`).click();
  ok(`${fn}: Preview Q2 several: two topics on at once, and the screen says it is undecided`, await p.locator(`${sf} [data-opt^="topic|area"].on`).count() === 2 && /undecided/.test(await txt(p, `${sf} .ann`)) && await p.locator(`${sf} .ksub`).count() === 0);
  await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); });
  const sev = (await rows(p).allInnerTexts()).join("|");
  ok(`${fn}: several topics show Pantry and Recipes changes in the one feed`, /Frozen peas/.test(sev) && /Recipe/.test(sev), sev);
  await shot(p, `choices-several-${fn}-${mode}`); await p.close();
  // Q4 with three members: no per-person tab, Others holds everyone else
  p = await open("?household=more&tab=others", w, h, mode);
  ok(`${fn}: with more people the tabs are My activity and Others, and Others holds Priya, the shopper link and a former member`, (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.trim()).join() === "My activity,Others" && await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); return true; }) && /Priya/.test(await txt(p, "#feed")) && /Someone/.test(await txt(p, "#feed")) && /A former member/.test(await txt(p, "#feed")));
  await p.close();
  // Others, former member detail
  p = await open("?tab=others", w, h, mode);
  await p.evaluate(() => { for (let i = 0; i < 2; i++) window.__hx.moreDay(); });
  await p.locator('#feed .ev:has-text("A former member")').first().click();
  ok(`${fn}: a former member's change opens a detail that says 'A former member' and never a name`, /A former member/.test(await txt(p, wide ? "#panel .dh" : ".dsheet .dh")));
  await p.close();
  p = await open("?entity=item:itm_rice", w, h, mode);
  ok(`${fn}: in context (entity) is sent with the product the API wants, and shows as 'This item', not as an app filter`, /This item/.test(await txt(p, wide ? "#panel .fph p" : ".qline")) && await p.locator(".tok, [data-opt^='product']").count() === 0 && await rows(p).count() >= 1);
  await p.close();
  p = await open("?state=loading", w, h, mode); ok(`${fn}: loading draws skeletons`, await p.locator(".sk").count() >= 2); await shot(p, `loading-${fn}-${mode}`); await p.close();
  p = await open("?state=empty", w, h, mode); ok(`${fn}: a new household is playful and honest`, /A quiet kitchen so far/.test(await txt(p, "#feed"))); await p.close();
  p = await open("?state=down", w, h, mode); ok(`${fn}: Platform down is shown as down, not as empty`, /History is not reachable/.test(await txt(p, "#feed")) && /not an empty history/.test(await txt(p, "#feed"))); await shot(p, `down-${fn}-${mode}`); await p.close();
  p = await open("?notes=0&filters=1", w, h, mode);
  ok(`${fn}: with notes off there is no annotation at all`, await p.locator(".ann").count() === 0);
  await p.close();
}
await browser.close();
console.log(fails === 0 ? `OK, all ${total} checks passed` : `${fails} of ${total} checks FAILED`);
process.exit(fails === 0 ? 0 : 1);
