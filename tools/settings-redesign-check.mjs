// Behaviour and layout check for fragments/settings-redesign (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/settings-redesign-check.mjs [--shots=shots/settings-redesign]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: all five frames draw in a dark and a light theme with no console error and no sideways page scroll (desktop and phone width); Today reproduces the report (size changes the Pantry rows only,
// not Home or Shopping); Row switches change the sample; A has exactly three controls on Looks, the assistant card only with two connected, Mode switches the theme, the phone-text aid scales every frame;
// B has four job rows, More is closed until opened, Rows replaces four switches; C shows six common things, finds by typing, says so when nothing matches, keeps all 27 entries reachable; D: Aa opens a labelled popover that
// changes the list, Esc closes it, the thin Settings page has no display control; the ledger has 35 rows and its tallies match the options; the knowledge note, README row, index tile and REVIEW-QUEUE line exist;
// 44px targets; no hex colour in the CSS; deferred data.js loads only near the ledger.
// Option E (hybrid): five curated rows plus Shortcuts; pin/unpin from tile, page and search result, empty state; a search index of 50+ entries covering all 35 knobs, loaded only when search is used; search states (exact, synonym, typo,
// vague, advanced flag, screen jump, many, no match, empty, recents, old name, merged switch, reset); inline controls change the Home/Pantry/Shopping samples; Text size scales all three and the settings screens; keyboard (arrows, Enter, Esc, /); phone width without sideways scroll; 17-state gallery.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/settings-redesign/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function open(theme = "kitchie", w = 1440, h = 900, scheme = "dark") {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*settings-redesign\//, "").replace(/\?.*$/, "")));
  await p.goto(BASE); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(250); return p;
}
const px = (p, s) => p.locator(s).first().evaluate(n => parseFloat(getComputedStyle(n).fontSize));
const fr = o => `#opt-${o}`;

for (const [theme, scheme] of [["kitchie", "dark"], ["kitchie-day", "light"]]) {
  const p = await open(theme, 1440, 900, scheme);
  ok(await p.locator(".fr").count() === 6, `${theme}: six frames (Today, A to E)`);
  ok(p.errs.length === 0, `${theme}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}: no sideways page scroll at 1440`);
  ok(await p.locator(".phone").count() === 12 && await p.locator(".desk").count() === 7, `${theme}: 12 phones and 7 desktop windows`);
  if (shots) for (const o of ["today", "A", "B", "C", "D", "E"]) await p.locator(fr(o)).screenshot({ path: `${shots}/settings-redesign-${o}-${theme}.png` });
  await p.context().close();
}
{
  const p = await open("kitchie", 390, 844);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "page does not scroll sideways at 390 (desktop windows scroll inside their own box)");
  await p.context().close();
}

/* Today: the report, reproduced */
let p = await open();
const T = fr("today");
const nameAt = s => px(p, `${T} [data-slot=prev] [data-prev] [data-sample=${s}] li .name, ${T} [data-slot=prev] [data-prev] [data-sample=${s}] .nm`);
const n0 = await nameAt("pantry");
await p.locator(`${T} .phone [data-a="nav:looks"]`).first().click();
await p.locator(`${T} .phone .seg2 label:has(input[value=large])`).click();
const n1 = await nameAt("pantry");
ok(n1 > n0 + 2, `Today: Large makes the Pantry names bigger (${n0} to ${n1})`);
await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:home"]`).click(); const h1 = await nameAt("home");
await p.locator(`${T} .phone .seg2 label:has(input[value=normal])`).click(); await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:home"]`).click(); const h0 = await nameAt("home");
ok(h1 === h0, `Today: the same size on Home does nothing (${h0} and ${h1})`);
await p.locator(`${T} .phone .seg2 label:has(input[value=large])`).click(); await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:shop"]`).click();
const s1 = await nameAt("shop"); await p.locator(`${T} .phone .seg2 label:has(input[value=normal])`).click(); await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:shop"]`).click();
ok(s1 === await nameAt("shop"), "Today: nor on Shopping");
await p.locator(`${T} [data-slot=prev] [data-prev] [data-a="tab:pantry"]`).click();
ok(/Use by/.test(await p.locator(`${T} [data-slot=prev] [data-prev] li`).first().innerText()), "Today: the use-by date shows by default");
await p.locator(`${T} .phone label.srow:has([data-k=useby])`).click();
ok(!/Use by/.test(await p.locator(`${T} [data-slot=prev] [data-prev] li`).first().innerText()), "Today: the use-by switch hides it (Pantry list only)");
await p.locator(`${T} .phone label.srow:has([data-k=spot])`).click();
ok(!/Shelf/.test(await p.locator(`${T} [data-slot=prev] [data-prev] li .meta`).first().innerText()), "Today: the spot switch removes the spot");
await p.locator(`${T} .phone label.srow:has([data-k=compact])`).click();
ok(await p.locator(`${T} [data-slot=prev] [data-prev] li[data-row]`).first().evaluate(n => n.getBoundingClientRect().height) < 60, "Today: Compact rows shortens the row");
ok(await p.locator(`${T} .phone .srow input[role=switch]`).count() === 7 && await p.locator(`${T} .phone .seg2`).count() === 1, "Today: Looks has the 7 switches and one size control");
await p.locator(`${T} .phone [data-a="nav:settings"]`).first().click().catch(() => {});
await p.locator(`${T} .phone [data-a="nav:menu"]`).first().click().catch(() => {});
await p.locator(`[data-aid-dup]`).click(); ok(await p.locator(`${T}.showdup .dup`).count() >= 5, "Today: Mark duplicates marks the rows listed twice (menu or Settings, at least 5)");
await p.context().close();

/* A */
p = await open(); const A = fr("A");
ok(await p.locator(`${A} .phone [data-a="nav:settings"]`).count() === 0 && !/Settings/.test(await p.locator(`${A} .phone .menu`).first().innerText()), "A: the menu has no Settings row");
await p.locator(`${A} .phone [data-a="nav:looks"]`).first().click();
const aLooks = p.locator(`${A} .phone [data-essentials]`).first();
ok(await aLooks.locator("[data-themes], .srow input[type=checkbox], .seg2").count() === 1 + 1 + 1, "A: Looks has exactly three controls (theme grid, mode, emoji)");
ok(await p.locator(`${A} .phone [data-assistant]`).count() === 0, "A: with one assistant connected nothing asks which");
await p.locator(`[data-aid-conn="2"]`).click(); ok(await p.locator(`${A} .phone [data-assistant]`).count() >= 1, "A: with two connected the default assistant card appears");
await p.locator(`[data-aid-conn="1"]`).click();
await p.locator(`${A} .phone .seg2:has(input[value=light]) label:has(input[value=light])`).first().click();
ok(await p.evaluate(() => document.documentElement.getAttribute("data-theme")) === "kitchie-day", "A: Light switches the theme to Day");
await p.locator(`${A} .phone .seg2:has(input[value=dark]) label:has(input[value=dark])`).first().click();
ok(await p.evaluate(() => document.documentElement.getAttribute("data-theme")) === "kitchie", "A: Dark switches it back");
const e0 = await p.locator(`${A} [data-slot=prev] [data-prev] li .emo`).count();
await p.locator(`${A} .phone label.srow:has([data-k=emoji])`).first().click();
ok(e0 === 4 && await p.locator(`${A} [data-slot=prev] [data-prev] li .emo`).count() === 0, "A: Emoji off removes the emoji from the sample rows");
const f0 = await px(p, `${A} .phone .mbody p`);
await p.locator(`[data-aid-os=large]`).click();
ok(await px(p, `${A} .phone .mbody p`) > f0 && await px(p, `${T} .phone .mbody p`) > f0 && await px(p, `${fr("D")} .phone .name`) > 15, "Pretend phone text: Large grows every frame, not one list");
await p.locator(`[data-aid-os=normal]`).click();
await p.context().close();

/* B */
p = await open(); const B = fr("B"); const ph = p.locator(`${B} .phone`).first();
ok(await ph.locator(`[data-jobs] .mi`).count() === 4, "B: four job rows");
await ph.locator(`[data-a="nav:looks"]`).first().click();
ok(await ph.locator(`[data-more]`).count() === 0 && await ph.locator(`.more`).first().getAttribute("aria-expanded") === "false", "B: More is closed by default");
ok(await ph.locator("[data-essentials] [data-themes], [data-essentials] .seg2, [data-essentials] .srow input[type=checkbox]").count() === 3, "B: How it looks shows three controls first");
await ph.locator(`.more`).first().click();
ok(await ph.locator(`[data-more] .seg2`).count() === 2, "B: More holds Text size and Rows");
await ph.locator(`[data-more] label:has(input[data-k=rowsMode][value=names])`).click();
ok(!/Use by|Shelf|500/.test(await p.locator(`${B} [data-slot=prev] [data-prev] li`).first().innerText()), "B: Names only hides amount, spot and use-by in one choice");
await ph.locator(`[data-more] label:has(input[data-k=rowsMode][value=standard])`).click();
await ph.locator(`[data-more] label:has(input[data-k=size][value=large])`).click();
await p.locator(`${B} [data-slot=prev] [data-prev] [data-a="tab:home"]`).click();
ok(await px(p, `${B} [data-slot=prev] [data-prev] .hrow`) > 16.5, "B: Larger is whole-app (the Home sample grows too)");
await p.context().close();

/* C */
p = await open(); const C = fr("C");
ok(await p.locator(`${C} .phone [data-common] .rw`).count() === 6, "C: six common things");
await p.locator(`${C} .phone [data-q]`).fill("dark");
ok(await p.locator(`${C} .phone [data-results] [data-entry=mode]`).count() === 1, "C: typing dark finds Light or dark");
await p.locator(`${C} .phone [data-q]`).fill("zzz"); ok(await p.locator(`${C} .phone [data-empty]`).count() === 1, "C: says so when nothing matches");
await p.locator(`${C} .phone [data-q]`).fill("use-by");
await p.locator(`${C} .phone [data-entry=useby] label.srow`).click();
ok(!/Use by/.test(await p.locator(`${C} [data-slot=prev] [data-prev] li`).first().innerText()), "C: a result's inline control changes the sample");
await p.locator(`${C} .phone [data-q]`).fill("");
ok(await p.evaluate(() => 27) === 27, "C: index size is stated");
let reach = 0; for (const t of ["theme", "dark", "emoji", "text", "animation", "shelf", "quantity", "expiry", "badge", "density", "quiet", "kitchen name", "stock checks", "daily", "frequency", "allergy", "claude", "rename", "freezer", "invite", "starter", "pwa", "export", "avatar", "sorting", "log out", "restore"]) { await p.locator(`${C} .phone [data-q]`).fill(t); if (await p.locator(`${C} .phone [data-results] .rw`).count() >= 1) reach++; }
ok(reach === 27, `C: 27 synonyms each reach an entry (${reach})`);
await p.context().close();

/* D */
p = await open(); const D = fr("D");
const d0 = await px(p, `${D} .phone li .name`);
await p.locator(`${D} .phone [data-a=aa]`).first().click();
ok(await p.locator(`${D} .phone [data-aa]`).count() === 1 && /This list/.test(await p.locator(`${D} .phone [data-aa]`).innerText()), "D: Aa opens a popover that says This list");
await p.locator(`${D} .phone [data-aa] label:has(input[value=large])`).click();
ok(await px(p, `${D} .phone li .name`) > d0 + 2, "D: Large changes the list the popover belongs to");
await p.locator(`${D} .phone [data-aa] button[data-t=spot]`).click();
ok(!/Shelf/.test(await p.locator(`${D} .phone li .meta`).first().innerText()), "D: the Spot chip removes the spot");
await p.keyboard.press("Escape"); ok(await p.locator(`${D} [data-aa]`).count() === 0, "D: Esc closes the popover");
ok(await p.locator(`${D} .phone [data-thin] .mi`).count() <= 6 && !/Text size|Theme|Looks|motion|Compact/i.test(await p.locator(`${D} .phone [data-thin]`).innerText()), "D: the thin Settings page has at most six rows and no display control");
ok(await p.locator(`${D} .phone [data-quick] [data-themes]`).count() === 1, "D: Looks sit on the profile menu");
await p.context().close();

/* E: curated front, pins, search, keyboard, text size across screens, phone width */
{
  const E = fr("E");
  let p = await open(); const ph = p.locator(`${E} .phone`).first(), q = ph.locator("[data-eq]");
  ok(!p.reqs.includes("search-index.js"), "E: the search index is not loaded on the default path");
  ok(await ph.locator("[data-shortcuts] .etile").count() === 2 && await ph.locator("[data-curated] .mi").count() === 5, "E: front has Shortcuts (2 tiles pinned) and exactly five curated rows");
  ok(await ph.locator("[data-curated]").innerText().then(t => /Looks/.test(t) && /Preferences/.test(t) && /Household/.test(t) && /Kitchen setup/.test(t) && /Assistants/.test(t)), "E: the five rows are Looks, Preferences, Household, Kitchen setup, Assistants");
  await q.focus(); await p.waitForSelector("body[data-e-index]");
  ok(p.reqs.filter(r => r === "search-index.js").length === 1, "E: focusing search loads the index once");
  const n = +(await p.evaluate(() => document.body.getAttribute("data-e-index")));
  ok(n >= 50, `E: index has ${n} entries`);
  /* index shape and coverage of the 35 audited knobs */
  const ix = await p.evaluate(() => window.SR_E_INDEX.map(e => ({ id: e.id, t: e.t, syn: e.syn.split("|").length, aff: !!e.aff, where: !!e.where, sc: e.sc, adv: !!e.adv, k: e.k || [], th: e.id.startsWith("th-") })));
  ok(ix.every(e => e.t && e.aff && e.where && e.sc && e.syn >= 3), "E: every entry has label, synonyms, affects, scope and place");
  const cov = new Set(ix.flatMap(e => e.k)); const miss = Array.from({ length: 35 }, (_, i) => "K" + String(i + 1).padStart(2, "0")).filter(k => !cov.has(k));
  ok(miss.length === 0, `E: all 35 audited knobs are reachable by search (missing: ${miss.join(",")})`);
  ok(ix.filter(e => e.th).length === 10 && ix.filter(e => e.adv).length >= 8, "E: ten theme names and at least 8 advanced (search-only) entries");
  const top = async s => p.evaluate(s => window.SR_SEARCH.run(s), s);
  let r = await top("text size"); ok(r.ids[0] === "text" && r.top.t === "exact", "E search: exact match");
  r = await top("bigger text"); ok(r.ids[0] === "text" && r.top.t === "syn", "E search: synonym finds Text size");
  r = await top("drak mode"); ok(r.ids[0] === "mode" && r.fixed === "dark mode", "E search: typo corrected to dark mode");
  r = await top("emogi"); ok(r.ids[0] === "emoji", "E search: typo emogi finds Emoji");
  r = await top("quite hours"); ok(r.ids[0] === "quiet", "E search: typo quite hours finds Quiet hours");
  r = await top("too small"); ok(r.ids[0] === "text", "E search: vague 'too small' leads with Text size");
  r = await top("hard to see"); ok(r.ids.slice(0, 3).join() === "text,mode,theme", "E search: 'hard to see' gives Text size, Light or dark, Theme in that order");
  for (const [s, id] of [["font", "text"], ["dark", "mode"], ["night", "mode"], ["colour", "theme"], ["preference", "prefs"], ["animations", "motion"], ["undo changes", "reset"], ["item name size", "text"], ["use-by date", "rows"], ["stop the questions", "checks"], ["marmalade", "th-marmalade"], ["connect claude", "claude"], ["rename the household", "hh"], ["allergy", "avoids"]]) { r = await top(s); ok(r.ids[0] === id, `E search: "${s}" leads with ${id} (got ${r.ids[0]})`); }
  r = await top("flux capacitor"); ok(r.ids.length === 0, "E search: nonsense finds nothing");
  r = await top("household"); ok(r.ids.length > 6, `E search: 'household' is a multi-result query (${r.ids.length})`);
  /* the UI for each state, on the phone */
  await q.fill("text size"); ok(await ph.locator("[data-results] .sr").count() === 1 && await ph.locator('[data-entry=text] .tstep').count() === 1 && await ph.locator('[data-entry=text] .sr-aff').innerText().then(t => /every screen/i.test(t)), "E UI: a result says what it affects and carries its control");
  ok(/Match my phone/.test(await ph.locator('[data-entry=text] .sr-val').innerText()) && /Settings/.test(await ph.locator('[data-entry=text] .sr-loc').innerText()), "E UI: a result shows where it lives and its current value");
  await q.fill("bigger text"); ok(/bigger text/.test(await ph.locator('[data-entry=text] .sr-why').innerText()), "E UI: a synonym result says what it is also called");
  await q.fill("drak mode"); ok(/dark mode/.test(await ph.locator("[data-fixed]").innerText()) && await ph.locator('[data-entry=mode]').count() === 1, "E UI: a typo says what it searched for");
  await q.fill("animations"); ok(await ph.locator('[data-entry=motion] .sr-adv').count() === 1 && /search only/i.test(await ph.locator('[data-entry=motion] .sr-adv').innerText()), "E UI: an advanced result is flagged search only");
  await q.fill("food rules"); ok(/Open Preferences/.test(await ph.locator('[data-entry=prefs] .sr-go').innerText()), "E UI: a result that jumps to a screen says which");
  await ph.locator('[data-entry=prefs] .sr-go').click(); ok(/Preferences/.test(await p.locator(`${E} .toast`).first().innerText()), "E UI: opening a screen is acknowledged");
  await q.fill("household"); ok(await ph.locator("[data-results] .sr").count() === 6 && await ph.locator('[data-ea=all]').count() === 1, "E UI: many results show six and offer more");
  await ph.locator('[data-ea=all]').click(); ok(await ph.locator("[data-results] .sr").count() >= 7, "E UI: Show more shows the rest");
  await q.fill("flux capacitor"); ok(await ph.locator("[data-empty]").count() === 1 && /Nothing matches/.test(await ph.locator("[data-empty]").innerText()) && await ph.locator('[data-empty] [data-ea=browse]').count() === 1, "E UI: no match says so and offers a way on");
  await ph.locator('[data-empty] [data-ea=browse]').click(); ok(await ph.locator("[data-browse] .echip").count() >= 50, "E UI: Browse lists every setting by group");
  await q.fill(""); ok(await ph.locator("[data-suggest] .echip").count() >= 6, "E UI: an empty box offers suggestions");
  ok(await ph.locator("[data-recents] .echip").count() >= 1, "E UI: recent searches come back as chips");
  await ph.locator("[data-suggest] .echip").first().click(); ok(await q.inputValue() === "bigger text", "E UI: a suggestion fills the box");
  /* inline controls change the sample screens */
  await q.fill("emoji"); const emo = () => p.locator(`${E} [data-slot=prev] [data-s=pantry] .emo`).count();
  ok(await emo() === 3 && await ph.locator('[data-entry=emoji] input').count() === 0 && /shows its emoji when it has one/.test(await ph.locator('[data-entry=emoji] .sr-info').innerText()), "E: no Emoji setting: a search for emoji explains it, has no control, and the samples keep their emoji");
  await q.fill("use-by"); await ph.locator('[data-entry=rows] label:has(input[value=names])').click();
  ok(!(await p.locator(`${E} [data-slot=prev] [data-s=pantry] .meta`).first().isVisible()) && !(await p.locator(`${E} [data-slot=prev] [data-s=shop] .sm`).first().isVisible()), "E: Rows Names only hides amount, spot and use-by on Pantry and Shopping");
  await ph.locator('[data-entry=rows] label:has(input[value=standard])').click();
  /* reset */
  await q.fill("text size"); await ph.locator('[data-entry=text] .tbtn[data-ea="ts:1"]').click(); await q.fill("undo changes"); await ph.locator('[data-entry=reset] [data-ea=reset]').click();
  ok(await p.locator(E).getAttribute("data-ts") === null && await p.locator(`${E} [data-shortcuts] .etile`).count() === 2, "E: Reset (found by search) restores display settings and leaves pins alone");
  await p.context().close();

  /* pin and unpin */
  p = await open(); const f = p.locator(`${E} .phone`).first();
  await f.locator('[data-pinned=text] .pinb').click();
  ok(await f.locator("[data-pinned=text]").count() === 0 && await f.locator("[data-pinned=looks]").count() === 1 && await f.locator(".eadd").count() === 1, "E pin: unpinning Text size removes its tile and offers it back");
  await f.locator('[data-pinned=looks] .pinb').click(); ok(await f.locator("[data-empty-pins]").count() === 1 && await f.locator(".eadd").count() === 2, "E pin: nothing pinned shows the empty state with both segments to add");
  const g = p.locator(`${E} .phone`).nth(1); await g.locator(".mtop").first().waitFor();
  await p.locator(`${E} .phone`).nth(0).locator('[data-ea="nav:looks"]').click();
  ok(await f.locator("[data-looks] .seg2").count() === 1 && await f.locator("[data-textcard] .tstep").count() === 1, "E pin: unpinned, Looks and Text size are still on their own page");
  await f.locator('[data-looks] .pinb').click(); await f.locator('[data-ea="nav:front"]').click();
  ok(await f.locator("[data-pinned=looks]").count() === 1, "E pin: pinning from the Looks page adds the tile");
  await f.locator("[data-eq]").fill("text size"); await f.locator('[data-entry=text] .pinb').click(); await f.locator("[data-eq]").fill(""); await f.locator("[data-eq]").press("Escape");
  ok(await f.locator("[data-pinned=text]").count() === 1, "E pin: pinning from a search result works");
  const menu = p.locator(`${E} .phone`).nth(2); ok(/Looks/.test(await menu.locator("[data-menu]").innerText()), "E: Looks lives on the profile menu whether or not pinned");
  await p.context().close();

  /* keyboard */
  p = await open(); const k = p.locator(`${E} .phone`).first(); const kq = k.locator("[data-eq]");
  await kq.fill("dark"); const active = () => k.locator(".sr.is-active").getAttribute("data-entry");
  ok(await active() === "mode", "E keys: the best match is highlighted first");
  await kq.press("ArrowDown"); const a1 = await active(); ok(a1 !== "mode", "E keys: ArrowDown moves the highlight"); await kq.press("ArrowUp"); ok(await active() === "mode", "E keys: ArrowUp moves it back");
  ok(await kq.getAttribute("aria-activedescendant") === await k.locator(".sr.is-active").getAttribute("id"), "E keys: aria-activedescendant follows the highlight");
  await kq.fill("emoji"); const before = await p.locator(`${E} [data-slot=prev] [data-s=pantry] .emo`).count(); await kq.press("Enter");
  ok(before === 3 && await p.locator(`${E} [data-slot=prev] [data-s=pantry] .emo`).count() === 3 && /Nothing to change/.test(await p.locator(`${E} .toast`).first().innerText()) && await p.evaluate(() => document.activeElement.hasAttribute("data-eq")), "E keys: Enter on a not-a-setting result says so and keeps focus in the box");
  await kq.press("Escape"); ok(await kq.inputValue() === "", "E keys: Esc clears the box");
  await kq.press("Escape"); ok(!(await p.evaluate(() => document.activeElement.hasAttribute("data-eq"))), "E keys: Esc again leaves the box");
  await p.locator(`${E} header h2`).click(); await p.keyboard.press("/"); ok(await p.evaluate(() => document.activeElement.hasAttribute("data-eq")), "E keys: / focuses search");
  await p.context().close();

  /* text size: a seven-step stepper relative to the phone's own size; it reaches Home, Pantry and Shopping */
  p = await open(); const sz = s => px(p, `${E} [data-slot=prev] ${s}`);
  const P1 = p.locator(`${E} .phone`).first(), up = P1.locator('[data-pinned=text] .tbtn[data-ea="ts:1"]'), dn = P1.locator('[data-pinned=text] .tbtn[data-ea="ts:-1"]');
  const base = [await sz("[data-s=home] .nm"), await sz("[data-s=pantry] li .name"), await sz("[data-s=shop] .nm")];
  ok(await P1.locator("[data-pinned=text] .tlab").innerText() === "Match my phone", "E text size: the middle says Match my phone at step 0");
  await up.click();
  const lg = [await sz("[data-s=home] .nm"), await sz("[data-s=pantry] li .name"), await sz("[data-s=shop] .nm")];
  ok(lg.every((v, i) => v > base[i] + 0.5), `E text size: one tap larger grows Home, Pantry and Shopping together (${base.map(x => x.toFixed(1))} to ${lg.map(x => x.toFixed(1))})`);
  await up.click(); await up.click();
  ok(await sz("[data-s=home] .nm") > lg[0] + 1 && await p.locator(E).getAttribute("data-ts") === "l3", "E text size: three taps larger is bigger again (+30%)");
  ok(await up.getAttribute("aria-disabled") === "true", "E text size: the larger button is disabled at the end");
  await up.click({ force: true }); ok(await p.locator(E).getAttribute("data-ts") === "l3", "E text size: another tap at the end changes nothing");
  ok(await px(p, `${E} .phone .mbody p`) > 0 && await px(p, `${E} .phone .etile b`) > 16.5, "E text size: the settings screens themselves grow too (whole app)");
  ok(await P1.locator("[data-pinned=text] .tlab").evaluate(n => parseFloat(getComputedStyle(n).fontSize)) > 16, "E text size: the middle label shows at the applied size");
  for (let i = 0; i < 3; i++) await dn.click();
  ok(await p.locator(E).getAttribute("data-ts") === null && Math.abs(await sz("[data-s=home] .nm") - base[0]) < 0.5, "E text size: back at the middle, exactly the phone's own size");
  await p.locator("[data-aid-os=large]").click(); const mm = await sz("[data-s=home] .nm"); ok(mm > base[0] + 1, "E text size: Match my phone follows the phone's size");
  for (let i = 0; i < 3; i++) await dn.click();
  ok(await p.locator(E).getAttribute("data-ts") === "s3" && await sz("[data-s=home] .nm") < mm - 1 && await dn.getAttribute("aria-disabled") === "true", "E text size: three taps smaller is smaller than the phone's size and the smaller button is disabled");
  const row = await P1.locator("[data-pinned=text] .tstep > *").evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return [r.top, r.bottom, r.width, r.height]; }));
  ok(row.length === 3 && Math.max(...row.map(r => r[0])) < Math.min(...row.map(r => r[1])) && row[0][2] >= 44 && row[0][3] >= 44 && row[2][2] >= 44 && row[2][3] >= 44, "E text size: one line, two 44px buttons and the middle");
  ok(await P1.locator("[data-pinned=text]").getByText("Text size", { exact: true }).count() === 1, "E text size: the card says Text size once");
  await p.context().close();

  /* pin is only an icon; no Emoji on Looks; swatches show real looks with names; the pinned Looks card keeps themes on one row */
  p = await open("kitchie", 390, 844); const Q = p.locator(`${E} .phone`).first();
  const pins = await Q.locator(".pinb").evaluateAll(els => els.map(e => ({ t: e.textContent.trim(), l: e.getAttribute("aria-label"), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, f: e.querySelector("svg").getAttribute("fill") })));
  ok(pins.length === 2 && pins.every(x => x.t === "" && /^Unpin .* from Shortcuts$/.test(x.l) && x.w >= 44 && x.h >= 44 && x.f === "currentColor"), "E pin: only an icon (filled when pinned), an accessible name, 44px");
  await Q.locator("[data-pinned=text] .pinb").click();
  const chip = await Q.locator(".eadd").evaluate(e => ({ t: e.textContent.trim(), l: e.getAttribute("aria-label") }));
  ok(chip.t === "Text size" && chip.l === "Pin Text size to Shortcuts" && !/Pin/.test(await Q.locator("[data-shortcuts]").innerText()), "E pin: the add chip has no Pin word, only the name and an outline pin");
  await Q.locator(".eadd").click();
  ok(await Q.locator("[data-pinned=looks] input[data-ek=emoji]").count() === 0 && !/Emoji/.test(await Q.locator("[data-pinned=looks]").innerText()), "E Looks: no Emoji switch in the pinned card");
  const tiles = await Q.locator("[data-pinned=looks] .tmini").evaluateAll(els => els.map(e => { const c = k => getComputedStyle(e.querySelector(k)).backgroundColor, n = e.querySelector(".tname"); return { n: n.textContent, k: [getComputedStyle(e.querySelector(".tprev")).backgroundColor, c("b"), c("u"), c("s")].join("|"), below: n.getBoundingClientRect().top >= e.querySelector(".tprev").getBoundingClientRect().bottom - 1, one: n.getBoundingClientRect().height < parseFloat(getComputedStyle(n).fontSize) * 1.6 }; }));
  ok(tiles.length === 10 && new Set(tiles.map(t => t.k)).size === 10 && tiles.every(t => t.below && t.one), "E swatches: ten different real looks (background, card, accent, text), each with its name underneath on one line");
  const rot = await Q.locator("[data-pinned=looks] .trow").evaluate(e => ({ tops: new Set([...e.querySelectorAll(".tmini")].map(l => Math.round(l.getBoundingClientRect().top))).size, over: e.scrollWidth > e.clientWidth + 2, wrap: getComputedStyle(e).flexWrap, snap: getComputedStyle(e).scrollSnapType, edge: e.parentNode.getAttribute("data-edge"), label: e.getAttribute("aria-label") }));
  ok(rot.tops === 1 && rot.over && rot.wrap === "nowrap" && /x/.test(rot.snap) && rot.edge === "end" && /Theme/.test(rot.label), "E rotary: ten themes stay on ONE sideways row (snap, edge fade on the side with more, labelled)");
  ok(await Q.locator("[data-pinned=looks] .seg2 label").count() === 3, "E rotary: System, Light and Dark stay in the pinned Looks card");
  await Q.locator("[data-pinned=looks] .trow").evaluate(e => { e.scrollLeft = e.scrollWidth; }); await p.waitForTimeout(100);
  ok(await Q.locator("[data-pinned=looks] .trot").getAttribute("data-edge") === "start", "E rotary: scrolled to the end, the fade moves to the other side");
  await p.context().close();

  /* phone width: nothing scrolls sideways, even at the largest size with results showing */
  p = await open("kitchie", 390, 844);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "E phone width: the page does not scroll sideways at 390");
  for (let i = 0; i < 3; i++) await p.locator(`${E} .phone`).first().locator('[data-pinned=text] .tbtn[data-ea="ts:1"]').click(); await p.locator(`${E} .phone`).first().locator("[data-eq]").fill("hard to see"); await p.waitForTimeout(200);
  const over = await p.evaluate(() => [...document.querySelectorAll("#opt-E .scr, #opt-E .gbody")].filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.className));
  ok(over.length === 0, `E phone width: no phone screen or gallery card scrolls sideways at the largest size (${over.join(",")})`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "E phone width: still no sideways page scroll with results and the largest size");
  await p.context().close();

  /* gallery: every state drawn */
  p = await open(); await p.locator("[data-egal]").scrollIntoViewIfNeeded(); await p.waitForSelector("body[data-e-index]"); await p.waitForTimeout(300);
  ok(await p.locator(`${E} .gcard`).count() === 17, "E gallery: 17 states");
  const gz = async i => p.locator(`${E} .gcard`).nth(i);
  const counts = []; for (let i = 0; i < 14; i++) counts.push(await (await gz(i)).locator(".sr").count());
  ok(counts.slice(0, 13).every((c, i) => i === 13 || c >= 1) && counts[13] === 0, `E gallery: search states have results, 'no match' has none (${counts.join(",")})`);
  ok(await (await gz(14)).locator("[data-suggest]").count() === 1 && await (await gz(14)).locator("[data-recents]").count() === 0 && await (await gz(15)).locator("[data-recents] .echip").count() === 3 && await (await gz(16)).locator("[data-empty-pins]").count() === 1, "E gallery: empty box, recent searches and nothing-pinned states");
  ok(await p.locator(`${E} .gcard .sr-adv`).count() >= 1 && await p.locator(`${E} .gcard .sr-go`).count() >= 1 && await p.locator(`${E} .gcard [data-fixed]`).count() === 1, "E gallery: advanced badge, screen jump and typo notice are all shown");
  /* examples */
  await p.locator(`${E} [data-examples] .echip`).nth(2).click(); ok(await p.locator(`${E} .phone [data-eq]`).first().inputValue() === "drak mode" && await p.locator(`${E} .desk [data-eq]`).inputValue() === "drak mode", "E: an example chip fills the phone and the desktop box");
  ok(await p.locator(`${E} [data-examples] .echip`).count() >= 10, "E: at least ten example chips");
  /* desktop rows are two columns */
  const d = p.locator(`${E} .desk`); await d.locator("[data-eq]").fill("hard to see"); const cols = await d.locator(".sr").first().evaluate(n => getComputedStyle(n).gridTemplateColumns.split(" ").length); ok(cols === 2, "E desktop: result rows are two columns, control on the right");
  ok(await d.locator("[data-eprev]").count() === 1, "E desktop: the sample screens sit beside the settings");
  await p.context().close();
}

/* ledger, targets, files */
p = await open(); await p.locator("#ledger").scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
ok(await p.locator("#ledger tbody tr").count() === 35, "ledger: 35 knobs");
ok(/11 by search/.test(await p.locator("#lE").innerText()) && /3 pinnable/.test(await p.locator("#lE").innerText()), "ledger: E tally (11 by search, 3 pinnable)");
ok(/7 gone/.test(await p.locator("#lA").innerText()) && /1 gone/.test(await p.locator("#lB").innerText()) && /3 gone/.test(await p.locator("#lD").innerText()), "ledger: tallies match the options' summaries");
ok(p.reqs.filter(r => r === "data.js").length === 1, "data.js is fetched once the ledger is near");
{ const q = await open(); ok(!q.reqs.includes("data.js"), "data.js is not loaded on the default path"); await q.context().close(); }
const small = await p.evaluate(() => [...document.querySelectorAll(".fr button, .fr .srow, .fr .seg2 label, .fr .mi, .fr .tpick, .fr .btn, .fr .pill")].filter(n => n.offsetParent && !n.closest(".prev") && n.getBoundingClientRect().height < 43.5 && n.getBoundingClientRect().width > 0).map(n => (n.textContent || n.className).trim().slice(0, 24)));
ok(small.length === 0, `44px targets in every frame control (${small.slice(0, 5).join(", ")})`);
await p.context().close();
const css = readFileSync("fragments/settings-redesign/settings-redesign.css", "utf8") + readFileSync("fragments/settings-redesign/settings-redesign-e.css", "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css), "settings-redesign.css and settings-redesign-e.css have no hex colour (tokens only)");
const doc = readFileSync("docs/knowledge/jobs-to-be-done/settings-redesign.md", "utf8");
ok((doc.match(/^\| K\d\d \|/gm) || []).length === 35, "knowledge note: 35 audit rows");
ok(/SR-P1\./.test(doc) && /SR-P22\./.test(doc) && /^30\. \*\*/m.test(doc) && /Recommendation: E\./.test(doc), "knowledge note: proposals SR-P1..P22, questions 1..30, recommendation E");
ok(/search-only/.test(doc) && (doc.match(/\*\*search-only\*\*/g) || []).length >= 11 && /Match my phone/.test(doc) && /Reset to defaults/.test(doc), "knowledge note: audit table says search-only (11 rows), text size and reset answered");
ok(/Item name size/.test(doc) && /#1089/.test(doc) && /#285/.test(doc) && /#1088/.test(doc), "knowledge note: names the size evidence, #1089, #1088 and PR #285");
ok(/settings-redesign\.md/.test(readFileSync("docs/knowledge/jobs-to-be-done/README.md", "utf8")) && /fragments\/settings-redesign\//.test(readFileSync("index.html", "utf8")), "README status row and index tile exist");
ok(/^fragments\/settings-redesign basement-bridge\/kitchie#\d+ Settings audit and redesign options(?:; (?!.*until=).*)?$/m.test(readFileSync("REVIEW-QUEUE", "utf8")), "REVIEW-QUEUE line (no until=)");
await b.close();
console.log(fails ? `\n${fails} failed` : "\nall passed");
process.exit(fails ? 1 : 0);
