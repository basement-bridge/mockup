// Behaviour, grounding and layout check for History search and filters (history/search/), revised 23 Oct 2026. Mockup only.
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
