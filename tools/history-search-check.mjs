// Behaviour, grounding and layout check for History search and filters (history/search/). Mockup only.
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

// 0. Grounding: the screen reads only canonical fields. The model file is the only place a payload is read.
const ui = readFileSync(new URL("../history/search/search.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
const code = ui.replace(/"(?:[^"\\\n]|\\.)*"/g, '""'); // strings (screen text, annotations) are not field reads
ok("grounding: search.js never reads a payload", !/payload/.test(code), code.match(/.{0,30}payload.{0,30}/));
ok("grounding: search.js has no place, scope, needs_review or counts fields", !/\bplace\b|\.scope\b|needs_review|\.count\b|\bfacet/.test(code), code.match(/.{0,30}(\bplace\b|\.scope\b|needs_review|\.count\b|\bfacet).{0,30}/));
const api = readFileSync(new URL("../history/search/model.js", import.meta.url), "utf8");
ok("grounding: the stand-in filters only on the parameters the API has", [..."actor,actorNot,affects,product,area,kind,entityType,entityId,from,to,since".split(",")].every(k => api.includes(`q.${k} !== undefined`)) && !/q\.(place|scope|text|search|name)\b/.test(api));

for (const mode of ["light", "dark"]) {
  for (const [form, w, h] of [["phone 390", 390, 844], ["phone 360", 360, 740], ["desktop 1280", 1280, 800]]) {
    const tag = `${form} ${mode}`, fn = form.replace(" ", "");
    const wide = w >= 1024;
    // 1. catch-up: tabs, tick and X, summary from loaded rows, template-rendered rows, generic row for an unpublished kind
    let p = await open("", w, h, mode);
    ok(`${tag}: two tabs, My activity and the other person's name`, (await p.locator(".hx-tabs button").allInnerTexts()).map(t => t.replace(/\s*\d+$/, "").trim()).join() === "My activity,Sam");
    ok(`${tag}: tick and X both on the catch-up, separate`, await p.locator("[data-tick]").count() >= 1 && await p.locator("[data-closecatch]").count() >= 1);
    ok(`${tag}: the summary is of the loaded rows and names no private or hidden count`, /5 changes/.test(await txt(p, ".catch .sum")) && !/private|hidden/i.test(await p.locator("body").innerText()));
    ok(`${tag}: a person in the summary is a link`, await p.locator(".catch .plink2").count() >= 2);
    ok(`${tag}: a row reads who, then the kind's template output`, /You\s*·\s*Basmati rice Moved to Pantry, Top shelf/.test((await rows(p).first().innerText()).replace(/\n/g, " ")), await rows(p).first().innerText());
    ok(`${tag}: the notes say which fields are read`, /It never reads payload/.test(await p.locator(".hx-main .ann").first().innerText()));
    await layout(p, tag + " catch-up"); await shot(p, `catchup-${fn}-${mode}`);
    // the other tab: the no-member event is in neither tab (Q5), said plainly
    await p.locator('[data-tab="other"]').click();
    ok(`${tag}: Sam's tab lists only Sam's rows`, (await rows(p).allInnerTexts()).every(t => /^S|Sam/.test(t.replace(/\s+/g, " ").trim())) && await rows(p).count() === 2);
    ok(`${tag}: the no-member change is not in Sam's tab and the note says why (Q5)`, /Q5\. 1 change has no member/.test(await p.locator("#feed .ann").innerText()));
    ok(`${tag}: a Touches you chip marks a change that touches me`, await p.locator("#feed .chip.me").count() === 1);
    await shot(p, `catchup-sam-${fn}-${mode}`);
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

    // 3. the X leaves without marking caught up; the filter surface opens (Sam's tab, so Touches me has something to find)
    p = await open("?tab=other", w, h, mode);
    await p.locator("[data-closecatch]:visible").first().click();
    if (!wide) ok(`${tag}: the X opens the filter sheet over the recent list`, await p.locator(".sheet.tall").isVisible());
    else ok(`${tag}: the X opens the filter panel in the lane`, /Filters/.test(await txt(p, "#panel")));
    const groups = wide ? (await p.locator("#panel .fpb h3").allInnerTexts()) : (await p.locator(".sheet.tall .strow .stt").allInnerTexts());
    const names = groups.map(g => g.replace(/\s+(occurred_at|actor|kind, first part|kind|product|affects)$/, "").trim());
    ok(`${tag}: the groups are When, Who, Area, What happened, App, Touches (no Where)`, names.join("|").toLowerCase() === "when|who|area|what happened|app|touches", names);
    ok(`${tag}: no counts anywhere in the filter surface`, await p.locator(".fpl i, .mc i, .pl .ct").count() === 0 && !/\d+\s*(entries|results|changes)/.test(wide ? await p.locator("#panel").innerText() : await p.locator(".sheet.tall").innerText()));
    ok(`${tag}: left the catch-up without marking it caught up`, await p.evaluate(() => window.__hx.S.ticked === false));
    const pick = async (g, o) => { if (!wide) { if (await p.locator(".back2").count()) await p.locator(".back2").click(); await p.locator(`.strow[data-step="${g}"]`).click(); } await p.locator(`[data-opt="${g}|${o}"]`).click(); };
    if (!wide) { await p.locator('.strow[data-step="touches"]').click(); await shot(p, `sheet-options-${fn}-${mode}`); await p.locator(".back2").click(); await shot(p, `sheet-groups-${fn}-${mode}`); }
    await pick("touches", "me"); if (!wide) await p.locator(".ffoot .pri").click();
    ok(`${tag}: Touches me keeps only rows that touch me`, (await rows(p).count()) >= 1 && await rows(p).count() === await p.locator("#feed .ev .chip.me").count() && await p.locator(".tok").count() === 1);
    await layout(p, tag + " touches me"); await shot(p, `touches-${fn}-${mode}`);

    // 4. one choice per group; combine across groups; zero result names the filters and offers 30 days
    await p.locator('[data-rm="touches"]').click();
    if (!wide) await p.locator("[data-filters]").click();
    await pick("when", "today"); await pick("area", "recipe"); if (!wide) await p.locator(".ffoot .pri").click();
    ok(`${tag}: Today and Recipe together give no matches, said by name`, /No matches/.test(await txt(p, "#feed")) && /today/i.test(await txt(p, "#feed")) && /Recipe/.test(await txt(p, "#feed")), await txt(p, "#feed"));
    await shot(p, `zero-${fn}-${mode}`);
    await p.locator("[data-month]").click();
    ok(`${tag}: Look back 30 days widens When and finds the Recipe row`, await rows(p).count() === 1 && /Recipe/.test(await rows(p).first().innerText()), await rows(p).count());
    ok(`${tag}: a kind with no published template is the generic row, never blank`, /Sam\s*made a change in Recipe/.test((await rows(p).first().innerText()).replace(/\s+/g, " ")), await rows(p).first().innerText());
    // 5. the result detail defers to the template; a generic row opens a generic detail
    await rows(p).first().click();
    const det = wide ? "#panel" : ".dsheet";
    ok(`${tag}: the generic row opens a detail with the skeleton and no invented body`, /Sam made a change in Recipe/.test((await txt(p, det)).replace(/\s+/g, " ")) && /No template for recipe\/recipe\.edited\/1 is published/.test(await txt(p, det)));
    await shot(p, `detail-generic-${fn}-${mode}`);
    await p.close();

    // 6. recent: a day at a time, newest day first, filtered results page the same way
    p = await open("?view=list&tab=other", w, h, mode);
    ok(`${tag}: recent opens with the newest day only`, await p.locator("#feed section.day").count() === 1 && /today/i.test(await txt(p, "#feed")));
    const before = await p.locator("#feed section.day").count();
    await p.evaluate(() => window.__hx.moreDay());
    await p.waitForTimeout(100);
    ok(`${tag}: one more day with activity loads (Yesterday), not a button`, await p.locator("#feed section.day").count() === before + 1 && !(await p.locator("#feed").innerText()).includes("Show more"));
    for (let i = 0; i < 6; i++) await p.evaluate(() => window.__hx.moreDay());
    const labels = await p.locator("#feed section.day .lbl").allInnerTexts();
    ok(`${tag}: days after Thu 15 Oct skip the quiet Fri 16 Oct`, /thu 15 oct/i.test(labels.join("|")) && !/fri 16 oct/i.test(labels.join("|")), labels);
    await layout(p, tag + " recent"); await shot(p, `recent-${fn}-${mode}`);
    // 6b. the sentinel loads the next day by itself when it scrolls into view (no button)
    const au = await open("?view=list&tab=other", w, h, mode, true); await au.waitForTimeout(1600);
    ok(`${tag}: scrolling into the end of the list loads more days on its own`, await au.evaluate(() => window.__hx.S.pages.length) > 1); await au.close();
    // 7. the result detail, template present: wording is the template's, detail lines are the template's, the link is the template's
    await p.locator('#feed .ev:has-text("Frozen peas")').first().click();
    ok(`${tag}: the detail shows the template's line and its detail line`, /Frozen peas\s*Moved to Freezer, Drawer 2/.test((await txt(p, det)).replace(/\s+/g, " ")) && /Was in Freezer, Drawer 1/.test(await txt(p, det)), await txt(p, det));
    ok(`${tag}: the only link in the detail is the template's, to a route Kitchie registered`, await p.locator(`${det} a[data-route]`).count() === 1 && (await p.locator(`${det} a[data-route]`).getAttribute("data-route")) === "/kitchie-uat/pantry/items/itm_peas");
    ok(`${tag}: the detail says who and when from the skeleton`, /Sam/.test(await txt(p, det + " .dh")) && /Sun 18 Oct, 7:40 am/.test(await txt(p, det + " .dh")), await txt(p, det + " .dh"));
    await layout(p, tag + " detail"); await shot(p, `detail-template-${fn}-${mode}`);
    await p.close();
  }
}

// 8. states that do not depend on viewport: template registry fetching and empty; keyword Proposal; context scope; no-member option; affects as written today
for (const [mode, w, h] of [["dark", 390, 844], ["light", 1280, 800]]) {
  const fn = w < 1024 ? "phone390" : "desktop1280";
  let p = await open("?view=list&tab=other&tpl=loading", w, h, mode);
  ok(`${fn}: fetching a template shows skeleton rows with who, when and app, and no claim`, await p.locator(".ev .skbody").count() >= 1 && /Sam/.test(await rows(p).first().innerText()) && !/Used up|Moved/.test(await txt(p, "#feed")));
  await shot(p, `tpl-fetching-${fn}-${mode}`); await p.close();
  p = await open("?view=list&tpl=none", w, h, mode);
  ok(`${fn}: nothing published makes every row the generic row`, (await rows(p).allInnerTexts()).every(t => /made a change in Kitchie/.test(t.replace(/\s+/g, " "))));
  await shot(p, `tpl-none-${fn}-${mode}`); await p.close();
  p = await open("?view=list&tab=other&keyword=1", w, h, mode);
  ok(`${fn}: the keyword box is a marked Proposal and says it searches the days loaded`, await p.locator("#kw").count() === 1 && /Proposal/.test(await txt(p, ".kw")) && /Search the days loaded/.test(await p.locator("#kw").getAttribute("placeholder")));
  await p.locator("#kw").fill("peas");
  ok(`${fn}: keyword matches the template-rendered text of loaded rows`, await rows(p).count() === 1 && /Frozen peas/.test(await rows(p).first().innerText()) && /Searching the 1 day loaded/.test(await txt(p, ".kwnote")));
  await p.locator("#kw").press("Escape");
  ok(`${fn}: Esc clears the keyword`, (await p.locator("#kw").inputValue()) === "");
  await shot(p, `keyword-${fn}-${mode}`); await p.close();
  p = await open("?view=list&nomember=include&tab=other&household=more", w, h, mode);
  await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__hx.moreDay(); });
  ok(`${fn}: option (a) puts the no-member change in Others`, /Someone/.test(await txt(p, "#feed")) && !/Q5\. /.test(await p.locator("#feed").innerText()));
  await p.close();
  p = await open("?view=list&entity=item:itm_rice&product=kitchie", w, h, mode);
  ok(`${fn}: in context (entity) is a removable token and needs the product`, await p.locator('.tok[data-rm="entity"]').count() === 1 && await p.locator('.tok[data-rm="product"]').count() === 1);
  await p.close();
  p = await open("?view=list&affects=today&filters=1&step=touches&tab=other", w, h, mode);
  await p.locator('[data-opt="touches|me"]').click(); if (w < 1024) await p.locator(".ffoot .pri").click();
  ok(`${fn}: as Kitchie writes affects today, Touches me is empty (Q6), named plainly`, /No matches/.test(await txt(p, "#feed")));
  await shot(p, `affects-today-${fn}-${mode}`); await p.close();
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
