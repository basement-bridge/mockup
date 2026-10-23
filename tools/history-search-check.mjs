// Behaviour, grounding and layout check for History search and filters (history/search/), revised 24 Oct 2026 (filter patterns A to D). Mockup only.
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

for (const mode of ["light", "dark"]) {
  for (const [form, w, h] of [["phone 390", 390, 844], ["phone 360", 360, 740], ["desktop 1280", 1280, 800]]) {
    const tag = `${form} ${mode}`, fn = form.replace(" ", "");
    const wide = w >= 1024;
    const surface = wide ? "#panel" : ".fsheet";
    // 1. catch-up: person tabs, tick and X, no counts anywhere, template-rendered rows, nothing hidden
    let p = await open("", w, h, mode);
    ok(`${tag}: three tabs, My activity, Sam, Others, with no count on any of them`, (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.trim()).join() === "My activity,Sam,Others");
    ok(`${tag}: tick and X both on the catch-up, separate`, await p.locator("[data-tick]").count() >= 1 && await p.locator("[data-closecatch]").count() >= 1);
    const sumTxt = await p.locator(".catch").first().innerText();
    ok(`${tag}: the catch-up says since when and counts nothing`, /Since you were last here/.test(sumTxt) && /Sat 17 Oct, 5:30 pm/.test(sumTxt) && !/\d+\s*(change|by|entries|results|new)/i.test(sumTxt.replace(/Sat 17 Oct, 5:30 pm/, "")) && await p.locator(".hx .n, .hx-tabs .c, .tok").count() === 0, sumTxt);
    ok(`${tag}: no 'N changes', no badge, no private or hidden count on the page`, !/\b\d+ (changes?|entries|results|private|hidden)\b/i.test(await p.locator("body").innerText()) && !/private|hidden/i.test(await p.locator("body").innerText()));
    ok(`${tag}: a person in the summary is a link (you, Sam, Others)`, await p.locator(".catch .plink2").count() >= 3);
    ok(`${tag}: a row reads who, then the kind's template output`, /You\s*·\s*Basmati rice Moved to Pantry, Top shelf/.test((await rows(p).first().innerText()).replace(/\n/g, " ")), await rows(p).first().innerText());
    ok(`${tag}: no 'Touches you' mark anywhere`, await p.locator(".chip.me").count() === 0 && !/touches you/i.test(await p.locator("#feed .ev").allInnerTexts().then(a => a.join(" "))));
    ok(`${tag}: no app (product) filter and no keyword box by default (Q1: elements only)`, await p.locator("#kw, [data-opt^='product']").count() === 0);
    ok(`${tag}: the notes name the two jobs and say which fields are read`, /catch up/.test(await p.locator(".hx-main .ann").first().innerText()) && /who did something and when/.test(await p.locator(".hx-main .ann").first().innerText()) && /It never reads payload/.test(await p.locator(".hx-main .ann").first().innerText()));
    await layout(p, tag + " catch-up"); await shot(p, `catchup-${fn}-${mode}`);
    // Sam's tab: Sam only
    await p.locator('[data-tab="person"]').click();
    ok(`${tag}: Sam's tab lists only Sam's rows`, (await rows(p).allInnerTexts()).every(t => /^S|Sam/.test(t.replace(/\s+/g, " ").trim())) && await rows(p).count() === 2);
    // Others (Q4): everyone but me, including the shopper link and a former member; nothing hidden
    await p.locator('[data-tab="others"]').click();
    const oth = (await rows(p).allInnerTexts()).map(t => t.replace(/\s+/g, " ").trim());
    ok(`${tag}: Others shows the shopper-link change as 'Someone' (Q4: never hidden)`, oth.some(t => /^Someone/.test(t) && /Milk/.test(t)), oth);
    ok(`${tag}: Others shows a removed member's change as 'A former member'`, oth.some(t => /^A former member/.test(t) && /Yoghurt/.test(t)), oth);
    ok(`${tag}: the Others note says what is in it and that it is anonymised`, /no member/.test(await p.locator("#feed .ann").innerText()) && /former member/.test(await p.locator("#feed .ann").innerText()) && /anonymised/.test(await p.locator("#feed .ann").innerText()));
    await shot(p, `catchup-others-${fn}-${mode}`);
    // person link scopes the catch-up, with a way back
    await p.locator('[data-tab="mine"]').click();
    await p.locator('.catch .plink2:visible').first().click();
    ok(`${tag}: a person link shows the way back to the full catch-up`, /Back to the full catch-up/.test(await p.locator("body").innerText()));
    await p.context().close();

    // 2. the cap: a last visit older than three active days shows three days, and says so
    p = await open("?last=wed", w, h, mode);
    ok(`${tag}: older than the cap loads three active days and says so`, await p.evaluate(() => window.__hx.S.pages.length) === 3 && /Showing the last 3 days with activity/.test(await p.locator("#feed").innerText()));
    ok(`${tag}: the quiet Fri 16 Oct is skipped, not drawn as a day`, !/Fri 16 Oct/.test(await p.locator("#feed").innerText()));
    await p.context().close();

    // 3. the X leaves without marking caught up; the quiet filter opens: Date (the Pantry rotary row) and Topic, nothing else
    p = await open("?tab=person", w, h, mode);
    await p.locator("[data-closecatch]:visible").first().click();
    if (!wide) ok(`${tag}: the X opens the filter sheet over the recent list`, await p.locator(".fsheet").isVisible());
    else ok(`${tag}: the X opens the filter panel in the lane`, /Filter/.test(await txt(p, "#panel")));
    const fsTxt = await p.locator(surface).innerText();
    ok(`${tag}: the filter has Date and Topic only: no App, Touches, Where or What happened group`, await p.locator(`${surface} .rotrow`).count() === 1 && (await p.locator(`${surface} h3.fh`).allInnerTexts()).map(t => t.replace(/\s+pick any$/i, "").trim().toLowerCase()).join() === "topic" && !/\bApp\b|Touches|Where|What happened/.test(fsTxt), fsTxt);
    ok(`${tag}: Topic offers Pantry, Shopping and Recipes, one combined feed (no per-app choice)`, (await p.locator(`${surface} [data-opt^="topic|area"]`).allInnerTexts()).map(t => t.trim()).join() === "Pantry,Shopping,Recipes");
    ok(`${tag}: no counts anywhere in the filter surface`, await p.locator(`${surface} .fpl i, ${surface} .mc i, ${surface} .n`).count() === 0 && !/\d+\s*(entries|results|changes|items)/.test(fsTxt));
    ok(`${tag}: left the catch-up without marking it caught up`, await p.evaluate(() => window.__hx.S.ticked === false));
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
    ok(`${tag}: Pantry then Removed (the milk vanished): Sam's removals, with Date still Anytime`, await rows(p).count() === 1 && /Green tea\s*Used up/.test((await rows(p).first().innerText()).replace(/\s+/g, " ")), await rows(p).allInnerTexts());
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
    p = await open("?view=list&area=shopping", w, h, mode);
    ok(`${tag}: ?area=shopping lists the shopping change in the one feed`, await rows(p).count() === 1 && /You\s*made a change in Kitchie/.test((await rows(p).first().innerText()).replace(/\s+/g, " ")) && /Shopping/.test(await rows(p).first().innerText()), await rows(p).allInnerTexts());
    // 5. the result detail defers to the template; a generic row opens a generic detail
    await rows(p).first().click();
    const det = wide ? "#panel" : ".dsheet";
    ok(`${tag}: the generic row opens a detail with the skeleton and no invented body`, /You made a change in Kitchie/.test((await txt(p, det)).replace(/\s+/g, " ")) && /No template for kitchie\/shopping\.added\/1 is published/.test(await txt(p, det)));
    await shot(p, `detail-generic-${fn}-${mode}`);
    await p.close();

    // 6. recent: a day at a time, newest day first, filtered results page the same way
    p = await open("?view=list&tab=person", w, h, mode);
    ok(`${tag}: recent opens with the newest day only`, await p.locator("#feed section.day").count() === 1 && /today/i.test(await txt(p, "#feed")));
    ok(`${tag}: on a phone one quiet line shows the filter, Anytime · All topics`, wide ? await p.locator(".qline").count() === 0 : (await txt(p, ".qline")).trim() === "Anytime · All topics");
    const before = await p.locator("#feed section.day").count();
    await p.evaluate(() => window.__hx.moreDay());
    await p.waitForTimeout(100);
    ok(`${tag}: one more day with activity loads (Yesterday), not a button`, await p.locator("#feed section.day").count() === before + 1 && !(await p.locator("#feed").innerText()).includes("Show more"));
    for (let i = 0; i < 6; i++) await p.evaluate(() => window.__hx.moreDay());
    const labels = await p.locator("#feed section.day .lbl").allInnerTexts();
    ok(`${tag}: days after Thu 15 Oct skip the quiet Fri 16 Oct`, /thu 15 oct/i.test(labels.join("|")) && !/fri 16 oct/i.test(labels.join("|")), labels);
    await layout(p, tag + " recent"); await shot(p, `recent-${fn}-${mode}`);
    // 6b. the sentinel loads the next day by itself when it scrolls into view (no button)
    const au = await open("?view=list&tab=person", w, h, mode, true); await au.waitForTimeout(1600);
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
      // ---- B: Sentence
      p = await open("?way=sentence&view=list", w, h, mode);
      ok(`${tag} B: the screen reads one line, You · anything · anytime`, (await line(p)).startsWith("You · anything · anytime"), await line(p));
      ok(`${tag} B: no panel, no cascade: no filter sheet, no lane panel, no Date row until a word is tapped`, await p.locator(".fsheet, .fp, .rotrow").count() === 0);
      ok(`${tag} B: the tabs are as they were (My activity, Sam, Others)`, (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.trim()).join() === "My activity,Sam,Others");
      await p.locator('[data-pick="what"]').click();
      ok(`${tag} B: tapping What opens a ${wide ? "popover" : "short sheet"} with Anything, Pantry, Shopping, Recipes`, (await p.locator(`${popS} [data-opt^="topic|"]`).allInnerTexts()).map(t => t.trim()).join() === "Anything,Pantry,Shopping,Recipes", await p.locator(popS).count());
      await p.locator(`${popS} [data-opt="topic|area:pantry"]`).click();
      ok(`${tag} B: Pantry sets the line and offers its kinds in the same picker`, (await line(p)).startsWith("You · Pantry · anytime") && /in pantry/i.test(await p.locator(`${popS} .ksub`).innerText()), await line(p));
      realQ("B Pantry", await Qp(p));
      await p.locator(`${popS} [data-opt="topic|kind:pantry.removed"]`).click();
      ok(`${tag} B: a kind completes the choice: the picker closes and the line says Removed in Pantry`, (await line(p)).startsWith("You · Removed in Pantry · anytime") && await p.locator(popS).count() === 0, await line(p));
      let q = await Qp(p); realQ("B kind", q); ok(`${tag} B: What is kind, with actor me`, q.kind === "pantry.removed" && q.actor === "me" && q.area === undefined, q);
      await p.locator('[data-pick="when"]').click();
      ok(`${tag} B: tapping When opens Pantry's Date row (toggle left, rotary right), not a new control`, await p.locator(`${popS} .strow .stt[role=checkbox] .dotc`).count() === 1 && await p.locator(`${popS} .strow .rot .rar`).count() === 1);
      await p.locator(`${popS} .rot`).click();
      ok(`${tag} B: the rotary steps as in Pantry and the line follows`, (await line(p)).includes("Last 7 days") && (await txt(p, `${popS} .rot .rv`)) === "Last 7 days", await line(p));
      q = await Qp(p); realQ("B date", q); ok(`${tag} B: When is from`, typeof q.from === "string" && q.to === undefined, q);
      await p.mouse.move(0, 0);
      await layout(p, tag + " B picker"); await shot(p, `b-when-${fn}-${mode}`);
      await p.keyboard.press("Escape");
      ok(`${tag} B: Esc closes the picker`, await p.locator(popS).count() === 0);
      await p.locator('[data-pick="who"]').click();
      ok(`${tag} B: Who offers You, Sam, Others (the tabs' own values)`, (await p.locator(`${popS} [data-who]`).allInnerTexts()).map(t => t.trim()).join() === "You,Sam,Others");
      await p.locator(`${popS} [data-who="person"]`).click();
      ok(`${tag} B: choosing Sam is the same as the Sam tab: the line, the tab and the actor all agree`, (await line(p)).startsWith("Sam · Removed in Pantry · Last 7 days") && await p.locator('[data-tab="person"][aria-selected="true"]').count() === 1 && (await Qp(p)).actor === HM_SAM, [await line(p), await Qp(p)]);
      ok(`${tag} B: no counts anywhere on the line or its pickers`, !/\b\d+\s*(entries|results|changes|matches)\b/.test(await p.locator("#qline").innerText()));
      await shot(p, `b-line-${fn}-${mode}`);
      await p.locator("#qline [data-clear]").click();
      ok(`${tag} B: the X clears every part at once (the tab stays)`, (await line(p)).startsWith("Sam · anything · anytime"), await line(p));
      await layout(p, tag + " B"); await p.context().close();
      p = await open("?way=sentence&view=list&search=text", w, h, mode);
      ok(`${tag} B: the free-text B-search keeps its own label and still sits above the line`, await p.locator("#kw").count() === 1 && /Comparison/.test(await txt(p, ".kw")) && await p.locator(".sline").count() === 1);
      await p.context().close();

      // ---- C: Quick answers
      p = await open("?way=quick&view=list", w, h, mode);
      ok(`${tag} C: the strip is Mine today, Removed this week, Moved this week, By Sam, By others`, (await p.locator(".qstrip .qc").allInnerTexts()).map(t => t.trim()).join() === "Mine today,Removed this week,Moved this week,By Sam,By others");
      ok(`${tag} C: no cascade: no panel, no sheet, nothing to open`, await p.locator(".fsheet, .fp, .rotrow, [data-pick]").count() === 0);
      for (const c of ["mine-today", "removed-week", "moved-week", "by-person", "by-others"]) { // every chip is built only from real model filters: tap it, read the query back, tap it off
        await p.locator(`[data-chip="${c}"]`).click(); const cq = await Qp(p); realQ(`C chip ${c}`, cq);
        ok(`${tag} C: chip ${c} uses actor, kind and from only`, Object.keys(cq).every(k => ["actor", "actorNot", "kind", "from"].includes(k)), cq);
        await p.locator(`[data-chip="${c}"]`).click();
      }
      await p.locator('[data-chip="mine-today"]').click();
      ok(`${tag} C: one tap sets the whole answer: Mine today reads You · anything · Today`, (await line(p)).includes("You · anything · Today") && (await p.locator('[data-chip="mine-today"]').getAttribute("aria-pressed")) === "true", await line(p));
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
      ok(`${tag} C: tapping a chip that is on clears just its parts: What and When go, Who stays`, (await line(p)).includes("Others · anything · anytime") && (await p.locator('[data-chip="by-others"]').getAttribute("aria-pressed")) === "true", await line(p));
      await p.locator('[data-chip="moved-week"]').click(); await p.locator("#qline [data-clear]").click();
      ok(`${tag} C: the X clears everything the chips set`, (await line(p)).includes("Others · anything · anytime") && await p.locator('.qc[aria-pressed="true"]').count() === 1, await line(p));
      ok(`${tag} C: no counts on any chip`, !/\d/.test((await p.locator(".qstrip").innerText())));
      await p.context().close();
      p = await open("?way=quick&household=more&view=list", w, h, mode);
      ok(`${tag} C: with more people there is no per-person chip (By others covers them)`, (await p.locator(".qstrip .qc").allInnerTexts()).map(t => t.trim()).join() === "Mine today,Removed this week,Moved this week,By others");
      await p.context().close();

      // ---- D: Tap to filter
      p = await open("?way=tap&view=list", w, h, mode);
      ok(`${tag} D: the line starts as You · anything · anytime, with one hint and no panel`, (await line(p)).startsWith("You · anything · anytime") && /Tap a name, a topic or a day/.test(await line(p)) && await p.locator(".fsheet, .fp").count() === 0, await line(p));
      ok(`${tag} D: a row is separate targets: the line opens the change, topic and kind and the thing are their own buttons, the row itself is not a button`, await p.locator("#feed div.ev.dv").count() >= 3 && await p.locator("#feed .ev > button.evo, #feed .ev .evo").count() >= 3 && await p.locator("#feed button.ev").count() === 0 && /Pantry/.test(await p.locator('#feed .ev:first-child .hd[data-f^="area:"]').first().innerText()), await p.locator("#feed button.ev").count());
      ok(`${tag} D: in My activity the avatar is plain (a person tap would not narrow anything)`, await p.locator("#feed button.avb").count() === 0);
      const hs = await p.locator("#feed .ev").first().locator(".hd").allInnerTexts(); ok(`${tag} D: the first row offers Pantry, Moved and Basmati rice`, hs.map(t => t.trim()).join() === "Pantry,Moved,Basmati rice", hs);
      await layout(p, tag + " D rows"); await shot(p, `d-rows-${fn}-${mode}`);
      await p.locator('#feed .hd[data-f="area:pantry"]').first().click();
      ok(`${tag} D: tapping a topic narrows the list; the line says Pantry and it clears with one tap`, (await line(p)).startsWith("You · Pantry") && await p.locator('#qline .ap[data-unset="what"]').count() === 1 && !/Tap a name/.test(await line(p)), await line(p));
      ok(`${tag} D: the toast says what happened and offers Undo`, /Showing only Pantry/.test(await txt(p, "#toast")) && await p.locator("#toast [data-undo]").count() === 1);
      q = await Qp(p); realQ("D area", q); ok(`${tag} D: topic is area, with actor me`, q.area === "pantry" && q.actor === "me", q);
      ok(`${tag} D: once Pantry is on, its handle is gone from the rows (they get quieter as the list narrows)`, await p.locator('#feed .hd[data-f="area:pantry"]').count() === 0 && await p.locator('#feed .hd[data-f^="kind:"]').count() >= 1);
      await p.locator("#toast [data-undo]").click();
      ok(`${tag} D: Undo puts the list back`, (await line(p)).startsWith("You · anything · anytime") && await p.locator('#feed .hd[data-f="area:pantry"]').count() >= 1);
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
      ok(`${tag} D: and so does What`, (await line(p)).startsWith("You · anything · anytime"));
      // a day label is a handle: from and to for that one day
      await p.locator('#feed .dl').first().click();
      q = await Qp(p); realQ("D day", q);
      ok(`${tag} D: tapping a day label narrows to that day: from and to are that calendar day`, /Sat 17 Oct/.test(await line(p)) && typeof q.from === "string" && typeof q.to === "string" && Date.parse(q.to) - Date.parse(q.from) === 86400000 - 1 && await p.locator("#feed section.day").count() === 1 && await p.locator("#feed .dl").count() === 0, [await line(p), q]);
      await p.locator('#qline .apt').click();
      ok(`${tag} D: the date pill opens Pantry's rotary and a step replaces the day with a window`, await p.locator(`${popS} .rot`).count() === 1);
      await p.locator(`${popS} .rot`).click();
      ok(`${tag} D: now Last 7 days, no 'to'`, (await line(p)).includes("Last 7 days") && (await Qp(p)).to === undefined, await line(p));
      await p.keyboard.press("Escape"); await p.locator('#qline [data-unset="when"]').click();
      ok(`${tag} D: the date pill clears with its X: anytime again`, (await line(p)).startsWith("You · anything · anytime"));
      await p.context().close();
      // the thing is offered only where the model guarantees it: bulk_changed has no entity id; a generic row says 'This recipe', never a name
      p = await open("?way=tap&view=list&tab=person", w, h, mode);
      await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); });
      const bulk = p.locator('#feed .ev:has(.hd[data-f="kind:pantry.bulk_changed"])').first();
      ok(`${tag} D: a kind about no single thing (entity.id null) has topic and kind handles but no entity handle`, await bulk.count() === 1 && await bulk.locator('.hd[data-f^="entity:"]').count() === 0 && await bulk.locator('.hd[data-f^="kind:"]').count() === 1, await bulk.count());
      const rec = p.locator('#feed .ev:has(.hd[data-f="area:recipe"])').first();
      ok(`${tag} D: a generic row (no template) offers 'This recipe' for its entity, never a name`, await rec.count() === 1 && /This recipe/.test(await rec.locator('.hd[data-f^="entity:"]').innerText()) && !/rcp_|Fried/.test(await rec.innerText()), await rec.innerText());
      ok(`${tag} D: in Sam's own tab his avatar is plain`, await p.locator("#feed button.avb").count() === 0);
      await p.context().close();
      // a person tap exists only where it narrows: Others
      p = await open("?way=tap&view=list&tab=others", w, h, mode);
      await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); });
      ok(`${tag} D: in Others a named member's avatar is a button; 'Someone' and 'A former member' are plain (no single person to filter by)`, await p.locator('#feed .ev:has-text("Sam") button.avb').count() >= 1 && await p.locator('#feed .ev:has-text("Someone") button.avb, #feed .ev:has-text("A former member") button.avb').count() === 0 && await p.locator('#feed .ev:has-text("Someone") .avb').count() >= 1);
      await p.locator('#feed button.avb[data-f^="who:"]').first().click();
      ok(`${tag} D: tapping Sam in Others opens Sam's view (the tab, actor=Sam)`, await p.locator('[data-tab="person"][aria-selected="true"]').count() === 1 && (await Qp(p)).actor === HM_SAM && /Showing only changes by Sam/.test(await txt(p, "#toast")), await Qp(p));
      await p.context().close();
      p = await open("?way=tap&view=list&tab=others&household=more", w, h, mode);
      await p.evaluate(() => { for (let i = 0; i < 2; i++) window.__hx.moreDay(); });
      await p.locator('#feed .ev:has-text("Priya") button.avb').first().click();
      q = await Qp(p); realQ("D person", q);
      ok(`${tag} D: with three people, tapping Priya stays in Others and narrows by actor=<id>; the pill clears it`, q.actor === "c3d5e7f9a1b30246c8e0f2a4" && await p.locator('[data-tab="others"][aria-selected="true"]').count() === 1 && /Priya/.test(await line(p)) && await p.locator('#qline [data-unset="who"]').count() === 1, [q, await line(p)]);
      await p.locator('#qline [data-unset="who"]').click();
      ok(`${tag} D: clearing the person returns to everyone in Others`, (await Qp(p)).actorNot !== undefined && (await Qp(p)).actor === undefined);
      await p.context().close();
      // from the catch-up: a tap leaves the catch-up and narrows, and the X is unchanged
      p = await open("?way=tap", w, h, mode);
      ok(`${tag} D: the catch-up keeps the tick and the X and its rows carry the same handles`, await p.locator("[data-tick]").count() >= 1 && await p.locator("[data-closecatch]").count() >= 1 && await p.locator("#feed .hd").count() >= 3 && await p.locator("#qline .sline").count() === 0);
      await p.locator('#feed .hd[data-f="kind:pantry.moved"]').first().click();
      ok(`${tag} D: tapping a handle in the catch-up leaves it and shows the line (not marked caught up)`, (await line(p)).startsWith("You · Moved in Pantry") && await p.evaluate(() => window.__hx.S.view === "list" && window.__hx.S.ticked === false));
      await p.context().close();
      // the catch-up X in B, C and D opens the list, not a sheet
      for (const way of ["sentence", "quick", "tap"]) {
        p = await open(`?way=${way}`, w, h, mode); await p.locator("[data-closecatch]:visible").first().click();
        ok(`${tag} ${way}: the X leaves the catch-up to the list with its line; no filter sheet opens`, await p.locator(".fsheet, .fp").count() === 0 && await p.locator("#qline .sline").count() === 1);
        await p.context().close();
      }
      // D opens a change from its line; the detail is the same as A's
      p = await open("?way=tap&view=list", w, h, mode);
      await p.locator("#feed .evo").first().click();
      ok(`${tag} D: the line opens the change (same detail as A)`, /Basmati rice\s*Moved to Pantry, Top shelf/.test((await txt(p, wide ? "#panel" : ".dsheet")).replace(/\s+/g, " ")));
      await p.context().close();
    }
  }
}

// 8. states that do not depend on viewport
for (const [mode, w, h] of [["dark", 390, 844], ["light", 1280, 800]]) {
  const fn = w < 1024 ? "phone390" : "desktop1280", wide = w >= 1024;
  let p = await open("?view=list&tab=person&tpl=loading", w, h, mode);
  ok(`${fn}: fetching a template shows skeleton rows with who, when and app, and no claim`, await p.locator(".ev .skbody").count() >= 1 && /Sam/.test(await rows(p).first().innerText()) && !/Used up|Moved/.test(await txt(p, "#feed")));
  await shot(p, `tpl-fetching-${fn}-${mode}`); await p.close();
  p = await open("?view=list&tpl=none", w, h, mode);
  ok(`${fn}: nothing published makes every row the generic row`, (await rows(p).allInnerTexts()).every(t => /made a change in Kitchie/.test(t.replace(/\s+/g, " "))));
  await shot(p, `tpl-none-${fn}-${mode}`); await p.close();
  // Q1: Preview B, a free-text search, labelled honestly
  p = await open("?view=list&tab=person&search=text", w, h, mode);
  ok(`${fn}: Preview B is a marked comparison and says it searches the days loaded only`, await p.locator("#kw").count() === 1 && /Comparison/.test(await txt(p, ".kw")) && /Search the days loaded/.test(await p.locator("#kw").getAttribute("placeholder")) && /only the days loaded so far, not the whole history/.test(await txt(p, ".kwnote")));
  await p.locator("#kw").fill("peas");
  ok(`${fn}: free text matches the template-rendered text of loaded rows`, await rows(p).count() === 1 && /Frozen peas/.test(await rows(p).first().innerText()));
  ok(`${fn}: B still has no counts`, !/\b\d+\s*(day|days|match|matches|results?)\b/i.test(await txt(p, ".kwnote")) && !/\b\d+ (days?|results?|matches)\b/.test(await txt(p, "#feed")));
  await p.locator("#kw").press("Escape");
  ok(`${fn}: Esc clears the search`, (await p.locator("#kw").inputValue()) === "");
  await shot(p, `search-b-${fn}-${mode}`); await p.close();
  p = await open("?view=list", w, h, mode);
  await p.locator("#pvb").click();
  ok(`${fn}: the Preview switch offers A (default, elements only) and B (free text)`, /A: filters only/.test(await txt(p, "#pvp")) && /B: free text/.test(await txt(p, "#pvp")) && await p.locator('#pvp a[aria-pressed="true"]:has-text("A: filters only")').count() === 1);
  ok(`${fn}: the Preview switch offers the filter patterns A Cascade (baseline, default), B Sentence, C Quick answers, D Tap to filter (recommended)`, /A: Cascade \(baseline\)/.test(await txt(p, "#pvp")) && /B: Sentence/.test(await txt(p, "#pvp")) && /C: Quick answers/.test(await txt(p, "#pvp")) && /D: Tap to filter \(recommended\)/.test(await txt(p, "#pvp")) && await p.locator('#pvp a[aria-pressed="true"]:has-text("A: Cascade")').count() === 1);
  ok(`${fn}: the pattern links keep the other parameters and use ?way=sentence|quick|tap`, (await p.locator('#pvp a:has-text("D: Tap")').getAttribute("href")).includes("way=tap") && (await p.locator('#pvp a:has-text("D: Tap")').getAttribute("href")).includes("view=list"));
  ok(`${fn}: the Preview switch keeps the lists alternative reachable and marks Q2 undecided`, /Several \(lists\)/.test(await txt(p, "#pvp")) && /Q2, undecided/i.test(await txt(p, "#pvp")));
  await p.close();
  // Q2: the lists alternative
  p = await open(`?view=list&tab=person&choices=several&filters=1`, w, h, mode);
  const sf = wide ? "#panel" : ".fsheet";
  await p.locator(`${sf} [data-opt="topic|area:pantry"]`).click(); await p.locator(`${sf} [data-opt="topic|area:recipe"]`).click();
  ok(`${fn}: Preview Q2 several: two topics on at once, and the screen says it is undecided`, await p.locator(`${sf} [data-opt^="topic|area"].on`).count() === 2 && /undecided/.test(await txt(p, `${sf} .ann`)) && await p.locator(`${sf} .ksub`).count() === 0);
  await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); });
  const sev = (await rows(p).allInnerTexts()).join("|");
  ok(`${fn}: several topics show Pantry and Recipes changes in the one feed`, /Frozen peas/.test(sev) && /Recipe/.test(sev), sev);
  await shot(p, `choices-several-${fn}-${mode}`); await p.close();
  // Q4 with three members: no per-person tab, Others holds everyone else
  p = await open("?view=list&household=more&tab=others", w, h, mode);
  ok(`${fn}: with more people the tabs are My activity and Others, and Others holds Priya, the shopper link and a former member`, (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.trim()).join() === "My activity,Others" && await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); return true; }) && /Priya/.test(await txt(p, "#feed")) && /Someone/.test(await txt(p, "#feed")) && /A former member/.test(await txt(p, "#feed")));
  await p.close();
  // Others, former member detail
  p = await open("?view=list&tab=others", w, h, mode);
  await p.evaluate(() => { for (let i = 0; i < 2; i++) window.__hx.moreDay(); });
  await p.locator('#feed .ev:has-text("A former member")').first().click();
  ok(`${fn}: a former member's change opens a detail that says 'A former member' and never a name`, /A former member/.test(await txt(p, wide ? "#panel .dh" : ".dsheet .dh")));
  await p.close();
  p = await open("?view=list&entity=item:itm_rice", w, h, mode);
  ok(`${fn}: in context (entity) is sent with the product the API wants, and shows as 'This item', not as an app filter`, /This item/.test(await txt(p, wide ? "#panel .fph p" : ".qline")) && await p.locator(".tok, [data-opt^='product']").count() === 0 && await rows(p).count() >= 1);
  await p.close();
  p = await open("?state=loading", w, h, mode); ok(`${fn}: loading draws skeletons`, await p.locator(".sk").count() >= 2); await shot(p, `loading-${fn}-${mode}`); await p.close();
  p = await open("?state=empty", w, h, mode); ok(`${fn}: a new household is playful and honest`, /A quiet kitchen so far/.test(await txt(p, "#feed"))); await p.close();
  p = await open("?state=down", w, h, mode); ok(`${fn}: Platform down is shown as down, not as empty`, /History is not reachable/.test(await txt(p, "#feed")) && /not an empty history/.test(await txt(p, "#feed"))); await shot(p, `down-${fn}-${mode}`); await p.close();
  p = await open("?view=list&notes=0&filters=1", w, h, mode);
  ok(`${fn}: with notes off there is no annotation at all`, await p.locator(".ann").count() === 0);
  await p.close();
}
await browser.close();
console.log(fails === 0 ? `OK, all ${total} checks passed` : `${fails} of ${total} checks FAILED`);
process.exit(fails === 0 ? 0 : 1);
