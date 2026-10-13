// Behaviour check for the Plan UI phone mockup, the follow-up of 13 Oct 2026 (Plan UI review 206 to 212, owner-stated, voice): another person's plan is FULLY read only (206, supersedes 204's "can hold and add" and resolves 205),
// the blocked-hold question is dropped (207), a household meal can carry named participants and Clear week respects them (208 to 211). Headless Chromium, touch and mouse, dark and light, reduced motion.
// Usage:  python3 -m http.server 8123 &   then   NODE_PATH=/opt/node22/lib/node_modules node tools/plan-ui-readonly-check.mjs      (ORIGIN=... to point elsewhere)
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const ORIGIN = process.env.ORIGIN || "http://localhost:8123", BASE = process.env.BASE || ORIGIN + "/fragments/plan-ui-review/phone.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(); const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(ctx, q, errs, url) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto((url || BASE) + (q ? "?" + q : "")); await sleep(700); return p; }
const S = (p, f) => p.evaluate(f);
const norm = t => t.replace(/\s+/g, " ").trim();
const noSide = p => S(p, "document.documentElement.scrollWidth <= innerWidth");
const snapAll = p => S(p, "JSON.stringify([window.__plan.S.meals, window.__plan.S.blocked, window.__plan.S.bown])");
const ids = p => S(p, "window.__plan.S.meals.map(function (m) { return m.id; })");
const ACTION = /\b(hold|release|add|reserve|copy forward|replan|not cooking|move|clear)\b/i;
const ACTATTR = /data-(hold|addall|addone|wbuy|wres|wrel|act|replan|nocook|moveto|copy|clearw|n|pcsel|block|openday|unblock|od-b|surprise|ask)\b/;
const noMore = a => a.replace(/\bdata-more\b/, "");
/* every focusable, enabled, visible element in the plan area (main, the docked stack, the sheet, the action sheet, the dropdown) with its attribute names and its accessible name */
const focusables = p => S(p, `[...document.querySelectorAll('main button, main select, main input, main a, main [tabindex], .sheet button, #aw button, #aw input')].filter(function (e) { return !e.disabled && e.getAttribute('tabindex') !== '-1' && e.offsetParent !== null; }).map(function (e) { return { attrs: [...e.attributes].map(function (a) { return a.name; }).join(' '), name: (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\\s+/g, ' ') }; })`);

for (const [scheme, reduced, w, h, touch] of [["dark", false, 390, 844, true], ["dark", false, 360, 740, true], ["dark", false, 1280, 900, false], ["light", false, 390, 844, true], ["dark", true, 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme, reducedMotion: reduced ? "reduce" : "no-preference" }); const errs = []; const tag = `${scheme}${reduced ? " reduced" : ""} ${touch ? "touch" : "mouse"} ${w}`;
  const tap = loc => touch ? loc.tap() : loc.click();

  // ---------- A. another person's meal: nothing to act on (206) ----------
  for (const [q, name] of [["who=priya&sel=wed-curry", "default"], ["who=priya&sel=wed-curry&ba=list", "?ba=list"], ["who=priya&sel=wed-curry&ba=both", "?ba=both"], ["who=priya&sel=wed-curry&long=1", "a long ingredient list"], ["who=priya&sel=wed-curry&dt=sheet", "the sheet"], ["who=priya&sel=thu-salmon&wo=show", "the old ?wo=show link"], ["who=priya&sel=fri-dump", "a subset meal"]]) {
    const p = await open(ctx, q, errs); const meal = q.match(/sel=([a-z-]+)/)[1], before = await snapAll(p);
    ok(`${tag} A (${name}): the detail is open and says "View only, Priya's plan" with the eye`, (await S(p, "window.__plan.S.sel")) === meal && /View only, Priya's plan/.test(await p.locator(".ronote").first().innerText()) && (await p.locator(".ronote svg").count()) === 1);
    const f = await focusables(p);
    ok(`${tag} A (${name}): no focusable control is a plan, hold or shopping action (attributes)`, f.length >= 2 && !f.some(x => ACTATTR.test(noMore(x.attrs))), f.filter(x => ACTATTR.test(noMore(x.attrs))));
    ok(`${tag} A (${name}): and none is named Hold, Release, Add, Reserve, Replan, Not cooking, Move, Copy forward or Clear (every name read)`, !f.some(x => ACTION.test(x.name.replace(/^Actions for .*/, "").replace(/^(Show \d+ hidden Not cooking day.*|\d+ nights? (not cooking|open)\..*)$/, ""))), f.map(x => x.name).filter(n => ACTION.test(n)));
    ok(`${tag} A (${name}): no footer, no cart, no Add all, no Hold all, no hold row`, (await p.locator(".sfoot, [data-hold], [data-addall], [data-addone], .ga, .gbtn, .ing .ib").count()) === 0);
    ok(`${tag} A (${name}): the stepper (or its select) is disabled`, await p.locator("[data-n], [data-pcsel]").evaluateAll(es => es.length >= 1 && es.every(e => e.disabled)));
    const sk = await S(p, "[...document.querySelectorAll('[aria-keyshortcuts]')].map(function (e) { return e.getAttribute('aria-keyshortcuts'); })");
    ok(`${tag} A (${name}): nothing advertises the H or L key to a screen reader (aria-keyshortcuts: ${sk.join(", ")})`, !sk.some(k => /(^|\+)[HL]\b/i.test(k)));
    const tree = await p.locator("body").ariaSnapshot(); const names = [...tree.matchAll(/- (?:button|link|checkbox|menuitem|combobox|option) "([^"]*)"/g)].map(m => m[1]);
    ok(`${tag} A (${name}): the accessibility tree has no button named Hold, Release, Add, Reserve, Replan, Not cooking, Move or Copy forward`, !names.some(n => /^(Hold|Release|Add|Reserve|Replan|Move|Copy forward|Not cooking)\b|Add .* to the shopping list|Hold all|Release the hold/i.test(n)), names.filter(n => ACTION.test(n)));
    if (!/dt=sheet/.test(q)) { await tap(p.locator("[data-more]").first()); await sleep(300); const items = (await p.locator(".asheet .it").allInnerTexts()).map(norm); ok(`${tag} A (${name}): the ... menu offers Open recipe only`, items.length === 1 && /Open recipe/.test(items[0]), items); await p.keyboard.press("Escape"); await sleep(250); }
    await S(p, "document.activeElement && document.activeElement.blur()");
    for (const key of ["h", "l", "H", "L", "x", "Shift+X"]) { await p.keyboard.press(key); await sleep(120); }
    const tile = p.locator(".mc").first(); await tile.focus(); for (const key of ["h", "l", "Shift+H", "Shift+L", "x", "Shift+X"]) { await p.keyboard.press(key); await sleep(120); }
    ok(`${tag} A (${name}): the H, L, X and Shift X keys (detail open, tile focused) change nothing and show nothing`, (await snapAll(p)) === before && !(await S(p, "!!window.__plan.S.note")) && (await S(p, "window.__plan.S.sel")) === meal);
    await S(p, "window.__plan.act('hold', '" + meal + "'); window.__plan.act('list', '" + meal + "'); window.__plan.act('copyfwd', '" + meal + "'); window.__plan.act('replan', '" + meal + "'); window.__plan.act('nocook', '" + meal + "')");
    ok(`${tag} A (${name}): a hold, add, copy, replan or Not cooking sent to the handler anyway changes nothing`, (await snapAll(p)) === before);
    ok(`${tag} A (${name}): no sideways scroll, no page errors`, (await noSide(p)) && errs.length === 0, errs); await p.close();
  }
  { // the tile row, the week and the header of another person's plan
    const p = await open(ctx, "who=priya", errs); const before = await snapAll(p);
    ok(`${tag} A: week level: no Add to buy, Reserve or Release on any of the five weeks of another person's plan`, (await p.locator(".wact, [data-wbuy], [data-wres], [data-wrel]").count()) === 0);
    await S(p, "window.__plan.showWeek('d14')"); await sleep(300); ok(`${tag} A: still none with a week scrolled in`, (await p.locator(".wact, [data-wbuy], [data-wres], [data-wrel]").count()) === 0);
    ok(`${tag} A: the header has no Copy last week and no Clear week`, (await p.locator("[data-copy], [data-clearw]").count()) === 0);
    const f = await focusables(p); ok(`${tag} A: no tile-row control in their plan is a hold, add, reserve or plan change`, !f.some(x => ACTATTR.test(noMore(x.attrs))) && !f.some(x => /^(Hold|Release|Add|Reserve)\b/i.test(x.name)), f.filter(x => ACTATTR.test(noMore(x.attrs))));
    ok(`${tag} A: nothing changed in the plan`, (await snapAll(p)) === before);
    ok(`${tag} A: no page errors`, errs.length === 0, errs); await p.close(); }
  { // Mine and Household are unchanged: the stepper, Hold, Add, the week buttons and the ... menu are all there
    for (const who of ["", "who=household"]) {
      const p = await open(ctx, who, errs); await S(p, "window.__plan.showWeek('d14')"); await sleep(300);
      ok(`${tag} A (${who || "mine"}): the week still has Add to buy and Reserve`, (await p.locator(".wact [data-wbuy]").count()) >= 1 && (await p.locator(".wact [data-wres], .wact [data-wrel]").count()) >= 1);
      await S(p, "window.__plan.openDetail('wed-curry')"); await sleep(700); const foot = (await p.locator(".sfoot button").allInnerTexts()).map(norm);
      ok(`${tag} A (${who || "mine"}): the detail footer has Hold 5 and Add 1, the cart and a live stepper`, foot.length === 2 && foot[0] === "Hold 5" && foot[1] === "Add 1" && (await p.locator(".ing [data-addone]").count()) === 1 && (await p.locator("[data-n]:not([disabled]), [data-pcsel]:not([disabled])").count()) >= 1, foot);
      await p.keyboard.press("h"); await sleep(300); ok(`${tag} A (${who || "mine"}): H holds (the footer reads Release 5)`, norm(await p.locator(".sfoot [data-hold]").innerText()) === "Release 5");
      await p.keyboard.press("l"); await sleep(300); ok(`${tag} A (${who || "mine"}): L adds the missing items`, await S(p, "window.__plan.find('wed-curry').miss.every(function (x) { return x[2]; })"));
      await tap(p.locator("[data-more]").first()); await sleep(300); const items = (await p.locator(".asheet .it").allInnerTexts()).map(norm); ok(`${tag} A (${who || "mine"}): the ... menu has Open recipe, Replan, Move and Not cooking`, items.length === 4, items);
      ok(`${tag} A (${who || "mine"}): no page errors`, errs.length === 0, errs); await p.close();
    }
    const p = await open(ctx, "sel=thu-salmon&ba=list", errs); ok(`${tag} A (mine): ?ba=list still draws Add all and Hold all in the list`, (await p.locator(".ing .ga-add [data-addall], .ing .ga-hold [data-hold]").count()) === 2); await p.close(); }
  { // a past meal in another person's plan is still read only; Mine's past meal keeps Copy forward
    const q = await open(ctx, "who=priya&sel=l-wed", errs); ok(`${tag} A: a past meal in their plan: view only, no footer, no Copy forward`, /View only, Priya's plan/.test(await q.locator(".ronote").innerText()) && (await q.locator(".sfoot, [data-act=copyfwd]").count()) === 0); await q.close();
    const m = await open(ctx, "sel=l-wed", errs); ok(`${tag} A: a past meal in Mine still has Copy forward`, (await m.locator("[data-act=copyfwd]").count()) === 1); await m.close(); }

  // ---------- B. household meals with named participants (208 to 211) ----------
  { const p = await open(ctx, "who=household", errs); await S(p, "window.__plan.showWeek('d15')"); await sleep(500);
    const line = id => p.locator('.mc[data-id="' + id + '"] .tx p').first();
    ok(`${tag} B: Household: Salmon patties reads "Sam, Jane, Priya" and Veggie dumplings "Jane, Priya, Kit"`, norm(await line("thu-salmon").innerText()) === "Sam, Jane, Priya" && norm(await line("fri-dump").innerText()) === "Jane, Priya, Kit");
    ok(`${tag} B: Household: a meal for everyone reads just "Household" (no "4 people", no "Everyone")`, norm(await line("wed-curry").innerText()) === "Household" && !/Everyone|4 people/.test(await p.locator("main").innerText()));
    ok(`${tag} B: Household: a person's own meal keeps its own line ("Sam · 1 person")`, /^Sam · 1 person$/.test(norm(await line("thu-tuna").innerText())));
    const dims = await S(p, "[...document.querySelectorAll('.mc .tx p:not(.lf)')].map(function (e) { var r = e.getBoundingClientRect(), t = e.closest('.mc').getBoundingClientRect(); return { h: Math.round(r.height), over: e.scrollWidth > e.clientWidth + 1 || r.right > t.right - 40 }; })");
    ok(`${tag} B: every audience line is one line and fits its tile`, dims.length > 4 && dims.every(d => d.h <= 20 && !d.over), dims);
    ok(`${tag} B: the tile's accessible name says who it is for`, /for Sam, Jane and Priya, 3 of the household/.test(await p.locator('.mc[data-id="thu-salmon"]').getAttribute("aria-label")));
    ok(`${tag} B: the audience line carries a title with the full list`, /Sam, Jane and Priya/.test((await p.locator('.mc[data-id="thu-salmon"] .tx p').first().getAttribute("title")) || ""));
    ok(`${tag} B: no sideways scroll, no page errors`, (await noSide(p)) && errs.length === 0, errs); await p.close(); }
  { // who sees a subset meal (Proposal 210)
    const seen = {}; for (const who of ["mine", "household", "priya", "jane", "kit", "tom"]) { const p = await open(ctx, "who=" + who, errs); seen[who] = await S(p, "window.__plan.S.meals.filter(function (m) { return window.PUR.match(m, window.__plan.S.view); }).map(function (m) { return m.id; })"); await p.close(); }
    ok(`${tag} B: Mine (Sam is named) shows Salmon patties and not Veggie dumplings`, seen.mine.includes("thu-salmon") && !seen.mine.includes("fri-dump"), seen.mine);
    ok(`${tag} B: Household shows both`, seen.household.includes("thu-salmon") && seen.household.includes("fri-dump"));
    ok(`${tag} B: Priya and Jane are in both, Kit in the dumplings only, Tom in neither (a meal for everyone is in all)`, seen.priya.includes("thu-salmon") && seen.priya.includes("fri-dump") && seen.jane.includes("thu-salmon") && seen.jane.includes("fri-dump") && !seen.kit.includes("thu-salmon") && seen.kit.includes("fri-dump") && !seen.tom.includes("thu-salmon") && !seen.tom.includes("fri-dump") && seen.tom.includes("wed-curry"));
    const p = await open(ctx, "", errs); await tap(p.locator("[data-fmenu]")); await sleep(250); const cn = await p.locator(".dd .it").evaluateAll(es => es.map(e => [e.children[1].innerText.split("\n")[0], +e.querySelector(".kbd").innerText]));
    const get = n => (cn.find(c => c[0].trim().startsWith(n)) || [0, -1])[1];
    ok(`${tag} B: the dropdown counts follow it (Household ${get("Household")}, Mine ${get("Mine")}, Kit ${get("Kit")}, Tom ${get("Tom")})`, get("Household") === seen.household.length && get("Mine") === seen.mine.length && get("Kit") === seen.kit.length && get("Tom") === seen.tom.length, cn); await p.close(); }
  { // the sheet header shows the names too
    const p = await open(ctx, "who=household&sel=thu-salmon&dt=sheet", errs); ok(`${tag} B: the sheet header reads "Thu 15 Oct · Sam, Jane, Priya"`, /Thu 15 Oct · Sam, Jane, Priya/.test(norm(await p.locator(".shd .tx p").innerText()))); await p.close(); }

  // ---------- C. Clear week respects the audience (209, 211) ----------
  { // Mine: my own meals go, the household's stay (named or not), a household meal I am not in is not shown and not touched
    const p = await open(ctx, "", errs); const all0 = await snapAll(p); await tap(p.locator("[data-clearw]")); await sleep(600);
    const left = await ids(p), note = await S(p, "window.__plan.S.note && window.__plan.S.note.msg || ''");
    ok(`${tag} C: Mine: Clear removes Tuna salad and the leftovers (mine) and keeps Pasta, Curry, Salmon patties (household, Sam named) and Veggie dumplings (household, Sam not named)`, !left.includes("thu-tuna") && !left.includes("fri-left") && ["tue-pasta", "wed-curry", "thu-salmon", "fri-dump", "mon-shak"].every(i => left.includes(i)), left);
    ok(`${tag} C: Mine: the note says "3 household meals stay" (the dumplings are not Sam's to count)`, /3 household meals stay/.test(note), note);
    await tap(p.locator(".flipundo[data-undo]").first()); await sleep(500); ok(`${tag} C: Mine: Undo restores exactly`, (await snapAll(p)) === all0); await p.close(); }
  { // Household: the household's meals (everyone or a named subset) go from today on; a person's own meal stays; the past stays
    const p = await open(ctx, "who=household", errs); const all0 = await snapAll(p); await tap(p.locator("[data-clearw]")); await sleep(600);
    const left = await ids(p), note = await S(p, "window.__plan.S.note && window.__plan.S.note.msg || ''");
    ok(`${tag} C: Household: Clear removes Pasta, Curry, Salmon patties (named three) and Veggie dumplings (named three)`, !["tue-pasta", "wed-curry", "thu-salmon", "fri-dump"].some(i => left.includes(i)), left);
    ok(`${tag} C: Household: Tuna salad and the leftovers (Sam's own) stay, so does the past (Mon 12 Shakshuka)`, left.includes("thu-tuna") && left.includes("fri-left") && left.includes("mon-shak"), left);
    ok(`${tag} C: Household: the note says what stayed ("2 personal meals stay")`, /2 personal meals stay/.test(note), note);
    await tap(p.locator(".flipundo[data-undo]").first()); await sleep(500); ok(`${tag} C: Household: Undo restores exactly (the named participants too)`, (await snapAll(p)) === all0 && (await S(p, "window.__plan.find('fri-dump').part.join()")) === "jane,priya,kit"); await p.close(); }
  { // ?cs=visible (the other reading): Mine clears what Mine shows
    const p = await open(ctx, "cs=visible", errs); await tap(p.locator("[data-clearw]")); await sleep(600); const left = await ids(p);
    ok(`${tag} C: ?cs=visible: Mine clears everything Mine shows (the subset meal Sam is named in included) and still leaves the one Sam is not named in`, !left.includes("thu-salmon") && left.includes("fri-dump") && !left.includes("tue-pasta"), left); await p.close(); }
  { // another person's plan has no Clear
    const p = await open(ctx, "who=priya", errs); ok(`${tag} C: another person's plan: no Clear week at all`, (await p.locator("[data-clearw]").count()) === 0); const b = await snapAll(p); await S(p, "window.__plan.clearWeek()"); ok(`${tag} C: and the handler called directly changes nothing`, (await snapAll(p)) === b); await p.close(); }

  // ---------- D. the desktop and the data it shares are not changed ----------
  { const p = await open(ctx, "", errs, ORIGIN + "/fragments/plan-ui-review/desktop.html"); const t = await S(p, "document.body.innerText"), n = await S(p, "window.PUR.meals.length");
    ok(`${tag} D: desktop still draws "Everyone · 4 people", has no participants (${n} meals, no Veggie dumplings) and no page errors`, /Everyone · 4 people/.test(t) && !/Veggie dumplings/.test(t) && n === 13 && !(await S(p, "window.PUR.meals.some(function (m) { return !!m.part; })")) && errs.length === 0, [n, errs]); await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs); await ctx.close();
}
console.log(`${total - fails}/${total} checks pass`); await browser.close(); process.exit(fails ? 1 : 0);
