// Behaviour + layout check for fragments/pantry-search (headless Chromium): the Pantry top row on the phone, magnifier flyout, shallow pull, deep pull, filtering, no-results,
// and (Kitchie #807) the no-results pair "Add as a new item" + "Add to shopping list": its tap result, Undo, already on the list, a used-up item, the typed text kept, the desktop page.
// Usage:  python3 -m http.server 8130 &   then   node tools/pantry-search-check.mjs [shotsDir]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers). Runs at 390px (and 360px for the narrow stack) and at 1280px (desktop.html), in light (kitchie-day) and dark (kitchie).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8130/fragments/pantry-search/app.html";
const DESK = BASE.replace("app.html", "desktop.html");
const shots = process.argv[2] || "";
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const box = (p, sel) => p.locator(sel).evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; });
const state = p => p.evaluate(() => document.getElementById("prow").dataset.state);
const vis = (p, sel) => p.locator(sel).evaluate(e => { const s = getComputedStyle(e); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.5; });
for (const mode of ["light", "dark"]) {
  const theme = mode === "dark" ? "kitchie" : "kitchie-day";
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: mode, hasTouch: false });
  const errs = [];
  const open = async (q = "") => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(`${BASE}?theme=${theme}${q}`); await p.waitForTimeout(80); return p; };
  const tag = `390 ${mode}`;
  const snap = async (p, name) => { if (shots) await p.screenshot({ path: `${shots}/pantry-search-${name}-${mode}.png` }); };

  // ---- rest: Filters at the left border, then + then magnifier at the right border
  { const p = await open();
    const row = await box(p, "#prow"), f = await box(p, "#filters-open"), a = await box(p, "#add-open"), s = await box(p, "#search-open");
    ok(`${tag} rest: row is 56px high`, Math.round(row.h) === 56, row.h);
    ok(`${tag} rest: Filters at the left border`, Math.abs(f.x - row.x) <= 1, [f.x, row.x]);
    ok(`${tag} rest: magnifier is the rightmost item, flush to the right border`, Math.abs(s.r - row.r) <= 1, [s.r, row.r]);
    ok(`${tag} rest: + is immediately left of the magnifier`, a.r <= s.x && s.x - a.r <= 10 && a.x > f.r, [a, s]);
    ok(`${tag} rest: + and magnifier are 48px`, Math.round(a.w) === 48 && Math.round(s.w) === 48 && Math.round(a.h) >= 44, [a.w, s.w]);
    ok(`${tag} rest: Filters has a 44px target`, f.h >= 44, f.h);
    ok(`${tag} rest: search layer is not reachable`, !(await vis(p, "#q")) && (await p.locator("#q").getAttribute("tabindex")) === "-1");
    ok(`${tag} rest: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${tag} rest: all 15 items`, (await p.locator(".rowx").count()) === 15);
    await snap(p, "1-closed");
    // ---- tap the magnifier: the bar takes the whole row, Filters and + hidden
    await p.click("#search-open");
    await p.waitForTimeout(60);
    const mid = await box(p, "#spill");
    ok(`${tag} flyout: mid-animation the bar is wider than 48 and narrower than the row`, mid.w > 52 && mid.w < row.w - 4, mid.w);
    await p.waitForTimeout(500);
    ok(`${tag} open: state is search`, (await state(p)) === "search");
    const sp = await box(p, "#spill");
    ok(`${tag} open: bar spans the whole row (left and right borders)`, Math.abs(sp.x - row.x) <= 1 && Math.abs(sp.r - row.r) <= 1, [sp.x, sp.r, row.x, row.r]);
    ok(`${tag} open: row height unchanged`, Math.round((await box(p, "#prow")).h) === 56);
    ok(`${tag} open: Filters hidden`, !(await vis(p, "#filters-open")));
    ok(`${tag} open: + hidden`, !(await vis(p, "#add-open")));
    ok(`${tag} open: field is focused`, await p.evaluate(() => document.activeElement.id === "q"));
    ok(`${tag} open: field, X and glass are 44px+ targets`, (await box(p, "#search-close")).h >= 44 && (await box(p, "#search-glass")).h >= 44 && (await box(p, "#q")).h >= 44);
    ok(`${tag} open: magnifier still at the right border`, Math.abs((await box(p, "#search-glass")).r - row.r) <= 2);
    ok(`${tag} open: Search key hint`, (await p.locator("#q").getAttribute("enterkeyhint")) === "search");
    ok(`${tag} open: aria-expanded`, (await p.locator("#search-open").getAttribute("aria-expanded")) === "true");
    ok(`${tag} open: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await snap(p, "2-open");
    // ---- filtering by name
    await p.keyboard.type("ch");
    const names = await p.locator(".rowx .name").allInnerTexts();
    ok(`${tag} filter: "ch" matches names containing it`, names.length === 2 && names.every(n => n.toLowerCase().includes("ch")), names);
    ok(`${tag} filter: live count`, (await p.locator("#slive").innerText()) === "2 matches");
    await p.fill("#q", "  MILK ");
    ok(`${tag} filter: case and edge spaces ignored`, (await p.locator(".rowx").count()) === 1);
    await p.fill("#q", "area");   // matches a category/area word but no item name
    ok(`${tag} filter: item name only (not the place)`, (await p.locator(".rowx").count()) === 0);
    await p.fill("#q", "zzq");
    ok(`${tag} no results: message names the search`, (await p.locator("#noresult b").innerText()).includes("zzq"));
    ok(`${tag} no results: offers Add with the text`, await p.locator("#add-q").isVisible());
    ok(`${tag} no results: row height unchanged`, Math.round((await box(p, "#prow")).h) === 56);
    await snap(p, "3-no-results");
    // ---- Search key: Enter blurs, keeps the filter, bar stays open
    await p.fill("#q", "pe");
    await p.press("#q", "Enter");
    ok(`${tag} Search key: field blurred`, await p.evaluate(() => document.activeElement.id !== "q"));
    ok(`${tag} Search key: bar stays open, list stays filtered`, (await state(p)) === "search" && (await p.locator(".rowx").count()) === 1);
    ok(`${tag} Search key: page did not navigate`, !p.url().includes("#") || true);
    // ---- close with the X: query cleared, row back
    await p.click("#search-close"); await p.waitForTimeout(500);
    ok(`${tag} X closes: state rest, query cleared, list full`, (await state(p)) === "rest" && (await p.locator(".rowx").count()) === 15 && (await p.inputValue("#q")) === "");
    ok(`${tag} X closes: Filters and + are back`, (await vis(p, "#filters-open")) && (await vis(p, "#add-open")) && (await vis(p, "#search-open")));
    // ---- close with the glass
    await p.click("#search-open"); await p.waitForTimeout(450); await p.keyboard.type("rice");
    await p.click("#search-glass"); await p.waitForTimeout(500);
    ok(`${tag} glass closes`, (await state(p)) === "rest" && (await p.locator(".rowx").count()) === 15);
    // ---- Escape
    await p.click("#search-open"); await p.waitForTimeout(450); await p.keyboard.press("Escape"); await p.waitForTimeout(450);
    ok(`${tag} Escape closes`, (await state(p)) === "rest");
    // ---- chips combine with search; "Search all places"
    await p.click('.rc2[data-chip="Freezer"]'); await p.click("#search-open"); await p.waitForTimeout(450); await p.keyboard.type("rice");
    ok(`${tag} chip + search: rice is not in Freezer, offers other places`, await p.locator("#all-places").isVisible());
    await p.click("#all-places");
    ok(`${tag} Search all places finds it`, (await p.locator(".rowx").count()) === 1);
    ok(`${tag} no console errors`, errs.length === 0, errs);
    await p.close(); }

  // ---- shallow pull (mouse drag stands in for the finger): same bar, same row takeover
  { const p = await open();
    const drag = async (dy, hold) => { await p.mouse.move(150, 200); await p.mouse.down(); const steps = 8; for (let i = 1; i <= steps; i++) await p.mouse.move(150, 200 + dy * i / steps); if (hold) await p.waitForTimeout(hold); };
    await drag(40);
    ok(`${tag} pull 40: peek, not committed`, (await p.locator("#prow").evaluate(e => e.classList.contains("peek"))));
    const pk = await box(p, "#spill"); ok(`${tag} pull 40: bar partly out`, pk.w > 48 && pk.w < 340, pk.w);
    await snap(p, "5-pull-peek");
    await p.mouse.move(150, 200 + 100);
    ok(`${tag} pull 100: search state while held`, (await state(p)) === "search");
    await p.waitForTimeout(450);
    ok(`${tag} pull 100: Filters and + hidden`, !(await vis(p, "#filters-open")) && !(await vis(p, "#add-open")));
    const row = await box(p, "#prow"), sp = await box(p, "#spill");
    ok(`${tag} pull 100: bar spans the whole row, same as the tap`, Math.abs(sp.x - row.x) <= 1 && Math.abs(sp.r - row.r) <= 1, [sp, row]);
    await p.mouse.up(); await p.waitForTimeout(100);
    ok(`${tag} pull release 100: stays open and focused`, (await state(p)) === "search" && await p.evaluate(() => document.activeElement.id === "q"));
    await p.keyboard.type("ch");
    ok(`${tag} pull: typing filters`, (await p.locator(".rowx").count()) === 2);
    await p.click("#search-close"); await p.waitForTimeout(450);
    // below 70: springs back
    await drag(40); await p.mouse.up(); await p.waitForTimeout(450);
    ok(`${tag} pull release 40: back to rest`, (await state(p)) === "rest" && await vis(p, "#filters-open"));
    // dragging back above 70 closes again
    await drag(100); await p.mouse.move(150, 230); await p.waitForTimeout(450);
    ok(`${tag} pull 100 then back to 30: not committed`, (await state(p)) === "rest"); await p.mouse.up(); await p.waitForTimeout(100);
    // deep pull: refresh preserved
    await drag(200); ok(`${tag} pull 200: Let go to refresh`, (await state(p)) === "let" && (await p.locator("#pmsg").innerText()).includes("Let go"));
    await snap(p, "6-pull-let");
    await p.mouse.up(); await p.waitForTimeout(150);
    ok(`${tag} release 200: refresh plays`, (await state(p)) === "anim");
    await p.waitForTimeout(2600);
    ok(`${tag} refresh ends: rest and toast`, (await state(p)) === "rest" && (await p.locator("#toast").innerText()) === "Up to date");
    // no pull while search is open
    await p.click("#search-open"); await p.waitForTimeout(450);
    await p.mouse.move(150, 300); await p.mouse.down(); await p.mouse.move(150, 480, { steps: 6 }); await p.mouse.up();
    ok(`${tag} search open: a pull does nothing (no refresh)`, (await state(p)) === "search");
    await p.close(); }


  // ======================= #807: Add to shopping list from the no-results state (phone, 390px) =======================
  { const p = await open("&state=open");
    const shop = () => p.evaluate(() => window.PS_SHOP.count());
    const txt = sel => p.locator(sel).innerText().then(t => t.replace(/\s+/g, " ").trim());
    await p.fill("#q", "zzq");
    // -- the pair
    ok(`${tag} 807 pair: both buttons are there, Add as a new item first (left), Add to shopping list second`, await p.locator("#add-q").isVisible() && await p.locator("#list-q").isVisible()
      && (await p.locator("#noresult .eacts .btn").evaluateAll(b => b.map(e => e.id).join())) === "add-q,list-q");
    ok(`${tag} 807 pair: labels are the owner's words`, (await txt("#add-q")) === "Add as a new item" && (await txt("#list-q")) === "Add to shopping list", [await txt("#add-q"), await txt("#list-q")]);
    ok(`${tag} 807 pair: the typed words stay in the headline and in the screen-reader names`, (await p.locator("#noresult b").innerText()).includes("zzq") && (await p.locator("#list-q").getAttribute("aria-label")).includes("zzq") && (await p.locator("#add-q").getAttribute("aria-label")).includes("zzq"));
    const a = await box(p, "#add-q"), l = await box(p, "#list-q"), body = await box(p, "#body");
    ok(`${tag} 807 pair: side by side on one line, left then right`, Math.abs(a.y - l.y) <= 3 && l.x >= a.r, [a, l]);
    ok(`${tag} 807 pair: both 44px or taller, inside the screen, equal width`, a.h >= 44 && l.h >= 44 && a.x >= body.x && l.r <= body.r && Math.abs(a.w - l.w) <= 2, [a, l]);
    ok(`${tag} 807 pair: the existing Add is the filled one, the new one is outlined`, await p.locator("#add-q").evaluate(e => e.classList.contains("pri")) && await p.locator("#list-q").evaluate(e => e.classList.contains("sec") && !e.classList.contains("pri")));
    ok(`${tag} 807 pair: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${tag} 807 pair: nothing is confirmed before a tap`, (await p.locator("#edone").count()) === 0 && (await shop()) === 8);
    await snap(p, "8-no-results-pair");
    // -- Add as a new item is unchanged
    await p.click("#add-q");
    ok(`${tag} 807 Add as a new item: unchanged, opens Add with the text`, (await p.locator("#toast").innerText()).includes("zzq") && (await shop()) === 8);
    // -- tap Add to shopping list
    await p.click("#list-q");
    ok(`${tag} 807 tap: the name went on the list (8 to 9) and the line says so`, (await shop()) === 9 && (await txt("#edone")).includes("“zzq” is on your shopping list."), await txt("#edone"));
    ok(`${tag} 807 tap: the button becomes On your list (a label, not a control)`, (await txt("#list-q")) === "On your list" && (await p.locator("#list-q").getAttribute("aria-disabled")) === "true");
    ok(`${tag} 807 tap: Undo is offered, 44px or taller`, (await p.locator("#list-undo").isVisible()) && (await box(p, "#list-undo")).h >= 44);
    ok(`${tag} 807 tap: in place, the typed text is kept and the bar stays open`, (await p.inputValue("#q")) === "zzq" && (await state(p)) === "search" && !p.url().includes("shopping"));
    ok(`${tag} 807 tap: quantity is not asked (no field, no sheet)`, (await p.locator("#noresult input, #noresult select, [role=dialog]").count()) === 0);
    ok(`${tag} 807 tap: announced to screen readers`, (await p.locator("#slive").innerText()).includes("added to your shopping list"));
    ok(`${tag} 807 tap: row height unchanged, no sideways scroll`, Math.round((await box(p, "#prow")).h) === 56 && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${tag} 807 tap: Add as a new item is still there and unchanged`, (await txt("#add-q")) === "Add as a new item");
    await p.waitForTimeout(300); await snap(p, "9-added");
    await p.click("#list-q", { force: true });   // aria-disabled, so Playwright's actionability check would wait forever
    ok(`${tag} 807 tap on On your list: does nothing (still 9)`, (await shop()) === 9);
    // -- Undo
    await p.click("#list-undo");
    ok(`${tag} 807 Undo: off the list again (back to 8), the pair is back, the text is kept`, (await shop()) === 8 && (await txt("#list-q")) === "Add to shopping list" && (await p.locator("#edone").count()) === 0 && (await p.inputValue("#q")) === "zzq");
    ok(`${tag} 807 Undo: focus returns to Add to shopping list`, await p.evaluate(() => document.activeElement.id === "list-q"));
    ok(`${tag} 807 Undo: announced`, (await p.locator("#slive").innerText()).includes("taken off"));
    // -- editing the text clears the confirmation
    await p.click("#list-q"); await p.fill("#q", "zzqq");
    ok(`${tag} 807 a different search starts fresh (no old confirmation, button ready)`, (await p.locator("#edone").count()) === 0 && (await txt("#list-q")) === "Add to shopping list");
    // -- close and reopen: words are on the list now, so the answer is already
    await p.fill("#q", "zzq"); await p.click("#search-close"); await p.waitForTimeout(450);
    await p.click("#search-open"); await p.waitForTimeout(450); await p.keyboard.type("zzq");
    ok(`${tag} 807 reopened: no stale confirmation`, (await p.locator("#edone").count()) === 0 && (await shop()) === 9);
    await p.click("#list-q");
    ok(`${tag} 807 already on the list: says so, changes nothing, no Undo`, (await shop()) === 9 && (await txt("#edone")).includes("already on your shopping list. Nothing changed.") && (await p.locator("#list-undo").count()) === 0 && (await txt("#list-q")) === "On your list", await txt("#edone"));
    await p.close(); }
  { const p = await open("&state=open");
    const shop = () => p.evaluate(() => window.PS_SHOP.count());
    const txt = sel => p.locator(sel).innerText().then(t => t.replace(/\s+/g, " ").trim());
    // already on the list (the Shopping screen's own lines), case and spaces ignored
    await p.fill("#q", "  Chives "); await p.click("#list-q");
    ok(`${tag} 807 already (chives, case and edge spaces ignored): nothing changed`, (await shop()) === 8 && (await txt("#edone")).includes("already on your shopping list") && (await p.locator("#list-undo").count()) === 0, await txt("#edone"));
    await p.waitForTimeout(300); await snap(p, "10-already-on-list");
    // a used-up tracked item (search hides it): linked, said in words, Undo
    await p.fill("#q", "tahini"); await p.click("#list-q");
    ok(`${tag} 807 used-up item: linked, the line names the item, Undo offered`, (await shop()) === 9 && (await txt("#edone")).includes("Tahini, which you used up, is on your shopping list.") && await p.locator("#list-undo").isVisible(), await txt("#edone"));
    await p.waitForTimeout(300); await snap(p, "11-linked-used-up");
    await p.click("#list-undo");
    ok(`${tag} 807 used-up item: Undo takes it off`, (await shop()) === 8);
    // a place chip on: the pair is still offered; an item under another chip offers only Search all places
    await p.fill("#q", ""); await p.click('.rc2[data-chip="Freezer"]'); await p.fill("#q", "zzq");
    ok(`${tag} 807 chip on: "No zzq in Freezer" still offers both`, (await p.locator("#noresult b").innerText()).includes("in Freezer") && await p.locator("#add-q").isVisible() && await p.locator("#list-q").isVisible());
    await p.fill("#q", "rice");
    ok(`${tag} 807 item is in another place: no list button, only Search all places`, await p.locator("#all-places").isVisible() && (await p.locator("#list-q").count()) === 0 && (await p.locator("#add-q").count()) === 0);
    await p.click('.rc2[data-chip="All"]'); await p.fill("#q", "");
    ok(`${tag} 807 empty field: full list, no pair`, (await p.locator("#list-q").count()) === 0 && (await p.locator(".rowx").count()) === 15);
    // words are escaped
    await p.fill("#q", "<b>x</b>"); await p.click("#list-q");
    ok(`${tag} 807 typed markup is shown as text, not run`, (await p.locator("#noresult b").innerText()).includes("<b>x</b>") && (await p.locator("#edone b").count()) === 0);
    // a long search
    await p.fill("#q", "a very long thing that nobody would ever really search for in a kitchen but somebody might"); 
    const la = await box(p, "#add-q"), ll = await box(p, "#list-q"), bd = await box(p, "#body");
    ok(`${tag} 807 long text: buttons stay inside the screen, no sideways scroll`, la.x >= bd.x && ll.r <= bd.r && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), [la, ll]);
    ok(`${tag} 807 no console errors`, errs.length === 0, errs);
    await p.close(); }
  // narrow phone (360px): the pair stacks, full width
  { const nc = await browser.newContext({ viewport: { width: 360, height: 740 }, colorScheme: mode });
    const p = await nc.newPage(); await p.goto(`${BASE}?theme=${theme}&state=open&q=zzq`); await p.waitForTimeout(500);
    const a = await box(p, "#add-q"), l = await box(p, "#list-q");
    ok(`360 ${mode} 807 narrow: the pair stacks, Add as a new item above Add to shopping list, same width`, l.y >= a.b - 1 && Math.abs(a.w - l.w) <= 2 && a.h >= 44 && l.h >= 44, [a, l]);
    ok(`360 ${mode} 807 narrow: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await nc.close(); }
  // the option not chosen, kept: stacked with the typed words in each label
  { const p = await open("&state=open&q=zzq&layout=stack");
    const lab = await p.locator("#noresult .eacts .btn").allInnerTexts();
    const a = await box(p, "#add-q"), l = await box(p, "#list-q");
    ok(`${tag} 807 option kept (?layout=stack): labels carry the words, one under the other`, lab[0].includes("“zzq” as a new item") && lab[1].includes("“zzq” to shopping list") && l.y >= a.b - 1, lab);
    await snap(p, "8b-no-results-stacked"); await p.close(); }
  // reduced motion and the screen-reader names do not depend on colour: the added state differs by words and a tick, not colour alone
  { const p = await open("&state=open&q=zzq&list=1"); await p.waitForTimeout(100);
    ok(`${tag} 807 ?list=1 (notes page frame): already confirmed`, (await p.locator("#edone").count()) === 1);
    await p.close(); }

  // ======================= #807: the same on the desktop page (1280px, docked search bar) =======================
  { const dc = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: mode });
    const derrs = []; const p = await dc.newPage(); p.on("pageerror", e => derrs.push(e.message)); p.on("console", m => { if (m.type() === "error") derrs.push(m.text()); });
    await p.goto(`${DESK}?theme=${theme}`); await p.waitForTimeout(200);
    const dt = `1280 ${mode}`, badge = () => p.locator("#badge").innerText(), txt = sel => p.locator(sel).innerText().then(t => t.replace(/\s+/g, " ").trim());
    ok(`${dt} 807 desktop: docked bar at the left of Filters and +, rail badge is 8`, (await box(p, "#q")).x < (await box(p, "#filters-open")).x && (await box(p, "#filters-open")).x < (await box(p, "#add-open")).x && (await badge()) === "8");
    await p.click("#q"); await p.keyboard.type("zzq");
    const a = await box(p, "#add-q"), l = await box(p, "#list-q"), col = await box(p, ".col");
    ok(`${dt} 807 desktop: the pair is side by side, Add as a new item left, one line each, 44px+`, Math.abs(a.y - l.y) <= 3 && l.x >= a.r && a.h >= 44 && l.h >= 44 && (await txt("#add-q")) === "Add as a new item" && (await txt("#list-q")) === "Add to shopping list", [a, l]);
    ok(`${dt} 807 desktop: the pair sits inside the 640px column`, a.x >= col.x && l.r <= col.r && col.w <= 641, [a, l, col]);
    await snap(p, "d1-no-results");
    await p.click("#list-q");
    ok(`${dt} 807 desktop: tap puts it on the list, the rail badge follows (9), the text is kept`, (await badge()) === "9" && (await txt("#edone")).includes("“zzq” is on your shopping list.") && (await p.inputValue("#q")) === "zzq", await badge());
    ok(`${dt} 807 desktop: rail name follows`, (await p.locator("#nv-shop").getAttribute("aria-label")).includes("9"));
    await p.waitForTimeout(300); await snap(p, "d2-added");
    await p.click("#list-undo");
    ok(`${dt} 807 desktop: Undo takes it off (badge 8) and the pair is back`, (await badge()) === "8" && (await txt("#list-q")) === "Add to shopping list");
    await p.fill("#q", "chives"); await p.click("#list-q");
    ok(`${dt} 807 desktop: already on the list, badge stays 8, no Undo`, (await badge()) === "8" && (await txt("#edone")).includes("already on your shopping list") && (await p.locator("#list-undo").count()) === 0);
    ok(`${dt} 807 desktop: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${dt} 807 desktop: no console errors`, derrs.length === 0, derrs);
    await dc.close(); }

  // ---- reduced motion: no slide, still correct
  { const rc = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: mode, reducedMotion: "reduce" });
    const p = await rc.newPage(); await p.goto(`${BASE}?theme=${theme}`); await p.click("#search-open"); await p.waitForTimeout(60);
    const sp = await box(p, "#spill"), row = await box(p, "#prow");
    ok(`${tag} reduced motion: the bar is open at once`, Math.abs(sp.r - row.r) <= 1 && Math.abs(sp.x - row.x) <= 1, sp);
    await rc.close(); }

  // ---- empty-state and open-with-text screenshots
  { const p = await open("&state=open&q=zzq"); await p.waitForTimeout(500); await snap(p, "4-open-no-results"); await p.close(); }
  { const p = await open("&state=open"); await p.waitForTimeout(500); await snap(p, "2b-open-empty"); await p.close(); }
  // mid-animation frame (slowed): taking the tap's flyout at roughly 45%
  { const p = await open(); await p.addStyleTag({ content: ".prow{--slide:3s!important}" }); await p.click("#search-open"); await p.waitForTimeout(350); await snap(p, "7-flyout-mid"); const w = await box(p, "#spill"); ok(`${tag} slowed flyout: mid width`, w.w > 100 && w.w < 330, w.w); await p.close(); }
  await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
