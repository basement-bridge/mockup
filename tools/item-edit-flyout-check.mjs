// Behaviour and layout check for fragments/item-edit-flyout (headless Chromium). Not a screenshot tool: it clicks and types through the flows and prints PASS or FAIL for each.
// Usage:  python3 -m http.server 8123 &   then   node tools/item-edit-flyout-check.mjs [--shots=dir]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers). Screenshots are written only when --shots is given (they are not kept in the repo).
// Covers (11 Oct 2026 round): the level control and the override rule, the two shopping states, Location / Spot / Category suggestion lists and the category chip row, the emoji picker in Edit and Add,
// the keys, no console errors, no sideways scroll, in light and dark, at phone, tablet and desktop widths.
// Covers (owner's voice answers of 11 Oct 2026, decisions 94 to 101): the battery everywhere (no drop is drawn), the four bands for counted AND weighed items with a minimum, no minimum = Plenty until 0 with Some / Running low by hand,
// a hand-set level cleared ONLY by an increase (a decrease, a unit change and a minimum change keep it), the shopping amount that starts at the top-up to twice the minimum, Category and Unit as chips plus free text,
// the use-by quick choices (same set in Edit and Add), a hand-set level drawn exactly like a calculated one, no automatic shopping, key hints shown on the icons.
// Covers (owner, typed, 12 Oct 2026, decisions 102 to 107): NO shopping group in Edit or Add at any width; "How much to buy" in the item flyout only at Running low or Out (calculated or hand-set), a stepper for weighed or counted and the own-words box
// for no exact quantity, the default per decision 99, the plain add unchanged at Plenty and Some, a level never adds anything, and the emoji tile in the item flyout header (opens the picker, picks, clears, Esc closes the picker only, History line).
// Covers (owner, by voice, 12 Oct 2026, decisions 116 to 121): the emoji as a plain text box with the suggestion strip (no picker, placeholder and its size, one row while typing, highlight, own emoji kept at once,
// the newest of two kept, words revert, clear saves no emoji, Esc closes the strip only, Shift+Enter left to Add), the item flyout's tile showing and focusing its box; units cleared, folded (kilos, Kg, boxes, ML) and "2kg" split.
// Covers (owner, by voice and text, 12 Oct 2026, decisions 129 to 132): the emoji tile is the whole field until tapped (box and strip hidden when an emoji is set and when none), what opens and closes it (tile, pill, typed emoji, Enter, Esc, blur),
// clearing keeps it open, keyboard-dismiss (blur) keeps a valid emoji, the phone sheet lifts above the keyboard, the input hints, Back to automatic as a 44px button on every viewport and no "Not set" on Level; plus a 360 wide pass.
// Env: W=390,1440 limits (W=360 runs only the 360 pass) the widths (a dev shortcut; the full run is all four).
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:8123/fragments/item-edit-flyout/pantry.html";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
const WANT = (process.env.W || "").split(",").filter(Boolean).map(Number);
const SIZES = [[390, 844, "phone"], [768, 1024, "tablet"], [1024, 768, "desktop"], [1440, 900, "desktop"]].filter(z => !WANT.length || WANT.includes(z[0]));
const LONG = (root => {
  const q = s => document.querySelector(root + " " + s), box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  const t = q(".shead .nm2"), cs = getComputedStyle(t), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2, panel = q(".shead").parentElement;
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const title = box(t), tile = box(q(".shead .ph")), btns = [...document.querySelectorAll(root + " .shead .hacts .ib")].map(box), caps = [...document.querySelectorAll(root + " .shead .hacts .ib .cap")].map(box);
  const subs = [...document.querySelectorAll(root + " .shead .shq, " + root + " .shead .shw")].filter(e => e.offsetHeight > 0).map(box);
  const lines = Math.round(title.h / lh);
  return { lines, btns: btns.length, caps: caps.length, titleAttr: t.getAttribute("title") === t.textContent, full: title.w, panel: panel.clientWidth,
    clear: ![tile, ...btns, ...caps].some(b => hit(title, b)), subClear: !subs.some(s => caps.some(c => hit(s, c)) || hit(s, title)), subVisible: subs.length > 0 && subs.every(s => s.y >= title.y + title.h - 1),
    subRight: subs.length > 0 && Math.min(...subs.map(s => s.y)) - (title.y + title.h) < 14, clipped: t.scrollHeight > t.clientHeight + 1, over: panel.scrollWidth - panel.clientWidth };
});
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };

const browser = await chromium.launch();
for (const [w, h, kind] of SIZES) {
  for (const [theme, mode] of [["kitchie", "dark"], ["kitchie-day", "light"]]) {
    const tag = `${w} ${mode}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode, hasTouch: kind === "phone" });
    await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
    const errs = [];
    const open = async (q) => {
      const p = await ctx.newPage();
      p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); p.on("pageerror", e => errs.push("PAGEERR " + e.message));
      await p.goto(BASE + q, { waitUntil: "load" }); await p.waitForSelector(/child=|mode=add/.test(q) ? "#ief-child .ef, #ief-panel .ef, #ief-child .hist" : "#ief-panel .shead", { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(150);
      return p;
    };
    const lvl = p => p.evaluate(() => { const c = document.querySelector('#ef-s-level [aria-checked="true"]'); return c ? c.querySelector(".sr-only").textContent : null; });
    const cue = p => p.evaluate(() => { const c = document.querySelector("#ef-s-level .ef-src"); return c ? c.textContent : ""; });
    const tileLv = p => p.evaluate(() => { const t = document.querySelector('#ief-tiles [data-k="qty"],#ief-tiles [data-k="level"]'); return t ? t.getAttribute("aria-label") : null; });
    const shot = async (p, n) => { if (shots) await p.screenshot({ path: `${shots}/${n}__${w}-${mode}.png` }); };
    /* open a folded chip row (Category or Unit) with its chevron, then press a chip */
    const chipPick = async (p, wrap, text) => { const row = p.locator(`${wrap} .ef-cats`); if ((await row.getAttribute("data-open")) !== "true" && (await p.locator(`${wrap} .ef-cx:visible`).count())) await p.click(`${wrap} .ef-cx`); await p.click(`${wrap} .ef-chip:text-is("${text}")`); };
    const scrollTo = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: "center" }); }, sel);

    /* 1. level: counted item, automatic, override, quantity change hands it back */
    let p = await open("?sel=eggs&child=edit");
    ok(`${tag} counted: starts automatic Plenty`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    ok(`${tag} four level icons, no level word drawn`, (await p.locator("#ef-s-level .opt").count()) === 4 && !(await p.evaluate(() => { const c = document.querySelector("#ef-s-level").cloneNode(true); c.querySelectorAll(".sr-only").forEach(n => n.remove()); return /Plenty|Some|Running low|Out/.test(c.textContent); })));
    await shot(p, "level-auto");
    await p.click('#ef-s-level [data-v="Running low"]');
    ok(`${tag} override: Running low, set by you`, (await lvl(p)) === "Running low" && (await cue(p)) === "Set by you", [await lvl(p), await cue(p)]);
    ok(`${tag} "Back to automatic" is a labelled 44px circular-arrow button on every viewport (decision 128 over 111)`, await p.evaluate(() => { const b = document.querySelector("#ef-s-level .ef-auto"); if (!b) return false; const r = b.getBoundingClientRect(), c = getComputedStyle(b); return r.width >= 44 && r.height >= 44 && b.getAttribute("aria-label") === "Back to automatic" && !!b.querySelector("svg") && r.width > 0 && c.visibility !== "hidden" && c.display !== "none"; }));
    ok(`${tag} the Level control never says "Not set" (Automatic or Set by you only)`, !/not set/i.test(await p.innerText("#ef-s-level")) && ["Automatic", "Set by you"].includes(await cue(p)));
    ok(`${tag} override shows in the item flyout tile`, /Running low/.test(await tileLv(p)), await tileLv(p));
    await shot(p, "level-set");
    await p.click('#ef-s-qty [data-key="amount"][data-d="-1"]');
    ok(`${tag} a DECREASE never clears a hand-set level (96)`, (await lvl(p)) === "Running low" && (await cue(p)) === "Set by you" && (await p.inputValue('[data-f="amount"]')) === "11", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} an INCREASE (restock) hands the level back to the rules`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-level [data-v="Plenty"]'); await p.fill('[data-f="amount"]', "2"); await p.press('[data-f="amount"]', "Tab");
    ok(`${tag} typing a LOWER number (below the minimum) keeps the hand-set level`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Set by you", [await lvl(p), await cue(p)]);
    await p.fill('[data-f="amount"]', "30"); await p.press('[data-f="amount"]', "Tab");
    ok(`${tag} typing a HIGHER number hands it back to the rules`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.fill('[data-f="amount"]', "12"); await p.press('[data-f="amount"]', "Tab");
    ok(`${tag} back at 12 eggs (a decrease from 30), automatic`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic");
    await p.click('#ef-s-level [data-v="Some"]'); await p.click('#ef-s-min [data-key="min"][data-d="1"]');
    ok(`${tag} a minimum change keeps the pick`, (await lvl(p)) === "Some" && (await cue(p)) === "Set by you", [await lvl(p), await cue(p)]);
    await chipPick(p, "#ef-s-qty", "tin");
    ok(`${tag} a unit change keeps the pick (not a restock)`, (await lvl(p)) === "Some" && (await cue(p)) === "Set by you" && (await p.inputValue('[data-f="unit"]')) === "tin", [await lvl(p), await cue(p)]);
    await p.click(".ef-auto");
    ok(`${tag} "Back to automatic" works`, (await cue(p)) === "Automatic", await cue(p));
    await p.click('#ef-s-level [data-v="Out"]');
    ok(`${tag} Out sets the amount to 0`, (await p.inputValue('[data-f="amount"]')) === "0" && (await lvl(p)) === "Out");
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} stock added after Out: automatic again`, (await cue(p)) === "Automatic" && (await lvl(p)) !== "Out", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-level [data-v="Plenty"]'); await p.click('#ef-s-level [data-v="Out"]'); await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} hand-set Plenty, then Out, then stock added: the rules decide (1 tin under minimum 5 is Running low)`, (await cue(p)) === "Automatic" && (await lvl(p)) === "Running low", [await lvl(p), await cue(p)]);
    ok(`${tag} no console errors (level)`, errs.length === 0, errs); errs.length = 0; await p.close();

    /* 1b. the override cue: "Set by you" + a labelled "Back to automatic" button (decisions 111 to 113) */
    p = await open("?sel=eggs&child=edit&field=level");
    ok(`${tag} automatic: the muted "Automatic" cue and NO control`, (await cue(p)) === "Automatic" && (await p.locator("#ef-s-level .ef-auto").count()) === 0);
    await p.click('#ef-s-level [data-v="Some"]');
    const au = p.locator('#ef-s-level button[aria-label="Back to automatic"]');
    ok(`${tag} hand-set: "Set by you" and a button named "Back to automatic" on the Level label row`, (await cue(p)) === "Set by you" && (await au.count()) === 1 && (await p.evaluate(() => !!document.querySelector("#ef-s-level .ef-lh .ef-lvm .ef-auto"))));
    const bb = await au.boundingBox();
    ok(`${tag} the button is 44px and shows a circular-arrow icon`, bb.width >= 43.5 && bb.height >= 43.5 && (await au.locator("svg").count()) === 1, bb);
    await au.focus();
    ok(`${tag} the button is keyboard focusable`, await p.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label") === "Back to automatic"));
    await shot(p, "level-cue-set");
    await p.keyboard.press("Enter");
    ok(`${tag} Enter on it clears the override at once: Automatic, the rules decide (12 eggs, minimum 5: Plenty), no control`, (await cue(p)) === "Automatic" && (await lvl(p)) === "Plenty" && (await p.locator("#ef-s-level .ef-auto").count()) === 0);
    await p.click('#ef-s-level [data-v="Running low"]'); await p.click("#ef-s-level .ef-auto");
    ok(`${tag} clicking it redraws the battery and the item flyout tile`, (await lvl(p)) === "Plenty" && /Plenty/.test(await tileLv(p)), [await lvl(p), await tileLv(p)]);
    await p.close();
    p = await open("?sel=spinach&child=edit&field=level");
    ok(`${tag} no number (worded quantity), level picked (decision 128): "Set by you" and the Back to automatic button, like any other item`, (await cue(p)) === "Set by you" && (await p.locator("#ef-s-level .ef-lvm .ef-auto").count()) === 1 && (await lvl(p)) === "Some", [await cue(p), await lvl(p)]);
    await p.click("#ef-s-level .ef-auto"); await p.waitForTimeout(150);
    ok(`${tag} no number: Back to automatic leaves NO level picked, the muted "Automatic" and no control (never "Not set")`, (await cue(p)) === "Automatic" && (await lvl(p)) === null && (await p.locator("#ef-s-level .ef-auto").count()) === 0 && !/not set/i.test(await p.innerText("#ef-s-level")), [await cue(p), await lvl(p)]);
    await p.click('#ef-s-level [data-v="Running low"]'); await p.waitForTimeout(150);
    ok(`${tag} no number: picking one is "Set by you" again, with the button`, (await cue(p)) === "Set by you" && (await lvl(p)) === "Running low" && (await p.locator("#ef-s-level .ef-auto").count()) === 1, [await cue(p), await lvl(p)]);
    await p.close();
    /* decision 128: on EVERY sample item the cue is one of the two states and the word "Not set" never appears in the Level control */
    for (const id of ["butter", "carrots", "cheddar", "eggs", "yog", "milk", "paneer", "spinach", "rice", "tom", "onion", "garam", "peas", "ice"]) {
      p = await open(`?sel=${id}&child=edit&field=level`);
      const c = await cue(p), txt = await p.innerText("#ef-s-level");
      ok(`${tag} ${id}: the Level control is Automatic or Set by you (never Not set)`, (c === "Automatic" || c === "Set by you") && !/not set/i.test(txt) && ((c === "Set by you") === ((await p.locator("#ef-s-level .ef-auto").count()) === 1)), [c, txt]);
      await p.close();
    }

    /* 2. weighed with a minimum: automatic; weighed without one and worded: four icons, no cue */
    p = await open("?sel=yog&child=edit");
    ok(`${tag} weighed with minimum: automatic Some`, (await lvl(p)) === "Some" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-level [data-v="Plenty"]');
    ok(`${tag} weighed override`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Set by you");
    await p.click('#ef-s-qty [data-key="amount"][data-d="-1"]');
    ok(`${tag} weighed: a decrease keeps the hand-set level`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Set by you", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} weighed: stock added, automatic again`, (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.close();
    p = await open("?sel=butter&child=edit");
    ok(`${tag} weighed, no minimum: four icons, automatic Plenty (95)`, (await p.locator("#ef-s-level .opt").count()) === 4 && (await cue(p)) === "Automatic" && (await lvl(p)) === "Plenty", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-level [data-v="Some"]');
    ok(`${tag} weighed, no minimum: Some can be hand-set`, (await lvl(p)) === "Some" && (await cue(p)) === "Set by you");
    await p.click('#ef-s-qty [data-key="amount"][data-d="-1"]');
    ok(`${tag} weighed, no minimum: a decrease keeps the pick`, (await lvl(p)) === "Some" && (await cue(p)) === "Set by you");
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} weighed, no minimum: stock added, back to Plenty`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.fill('[data-f="amount"]', "0"); await p.press('[data-f="amount"]', "Tab");
    ok(`${tag} no minimum: Out at zero`, (await lvl(p)) === "Out", await lvl(p));
    await p.fill('[data-f="amount"]', "5"); await p.press('[data-f="amount"]', "Tab");
    ok(`${tag} no minimum: Plenty at any amount above zero`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.close();
    p = await open("?sel=carrots&child=edit");
    ok(`${tag} counted, no minimum: Plenty, Automatic, hand-set Running low allowed`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic");
    await p.click('#ef-s-level [data-v="Running low"]'); ok(`${tag} counted, no minimum: Running low by hand`, (await lvl(p)) === "Running low" && (await cue(p)) === "Set by you");
    await p.close();
    /* weighed WITH a minimum walks all four bands (cheddar 200 g, minimum 250 g) */
    p = await open("?sel=cheddar&child=edit");
    const walk = [];
    ok(`${tag} weighed with minimum: 200 g under 250 g is Running low`, (await lvl(p)) === "Running low" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    for (const [a, want] of [["250", "Running low"], ["251", "Some"], ["500", "Some"], ["501", "Plenty"], ["0", "Out"], ["1", "Running low"]]) { await p.fill('[data-f="amount"]', a); await p.press('[data-f="amount"]', "Tab"); walk.push([a, await lvl(p)]); ok(`${tag} weighed with minimum 250: ${a} g is ${want}`, (await lvl(p)) === want, [a, await lvl(p)]); }
    await p.close();
    p = await open("?sel=spinach&child=edit");
    ok(`${tag} worded: four icons and a cue (decision 128: two states on every item)`, (await p.locator("#ef-s-level .opt").count()) === 4 && ["Automatic", "Set by you"].includes(await cue(p)), await cue(p));
    await p.close();

    /* 3. no shopping group in Edit or Add (decision 102, owner 12 Oct 2026): not at any width, for any item */
    for (const q of ["?sel=eggs&child=edit", "?sel=spinach&child=edit", "?sel=milk&child=edit", "?sel=tom&child=edit&lv=Out", "?sel=eggs&child=edit&field=shop", "?mode=add"]) {
      p = await open(q);
      const g = await p.evaluate(() => { const c = document.querySelector("#ief-child, #ief-panel[data-mode=add]"); const t = c ? c.innerText : ""; return { shop: !!c.querySelector("#ef-s-shop,.ef-shop,[data-ef=shopsave],[data-f=shop],[data-f=buy],[data-ef=openlist]"), words: /Shopping list|How much to buy|Add to shopping list|Update the shopping list|On the shopping list|Not on the shopping list/i.test(t), heads: [...c.querySelectorAll(".ef-h")].map(h => h.textContent) }; });
      ok(`${tag} ${q} the form has no shopping group, no how-much box, no status line, no list button`, !g.shop && !g.words, g);
      if (q.indexOf("mode=add") < 0) ok(`${tag} ${q} Edit's groups are Item, Amount, Where and then Use by`, g.heads.join("|") === "Item|Amount|Where", g.heads);
      await p.close();
    }
    p = await open("?sel=eggs&child=edit");
    const lastEl = await p.evaluate(() => { const e = document.querySelector("#ief-cbody .ef"); const k = [...e.children].map(c => c.id || c.className || c.tagName); return k; });
    ok(`${tag} the last two blocks are the Use by group and the "Use in a recipe" row`, (await p.locator("#ief-cbody .ef > *:last-child.ef-go").count()) === 1 && (await p.locator("#ief-cbody .ef > section:nth-last-child(2) #ef-s-useby").count()) === 1);
    await p.close();
    p = await open("?sel=eggs&child=edit&recipes=0");
    ok(`${tag} without Recipes, Edit ends after Use by`, (await p.locator("#ief-cbody .ef > section:last-child #ef-s-useby").count()) === 1 && (await p.locator(".ef-go").count()) === 0);
    await p.close();

    /* 4. Location, Spot, Category: the one suggestion strip (decisions 108 to 110) */
    const strip = (p, k) => p.locator(`#sg-${k}`);
    const pills = (p, k) => p.locator(`#sg-${k} .ef-chip`).allInnerTexts();
    const hlText = (p, k) => p.evaluate(kk => { const c = document.querySelector(`#sg-${kk} .ef-chip.hl`); return c ? c.firstChild.textContent : null; }, k);
    p = await open("?sel=eggs&child=edit&field=area");
    await scrollTo(p, "#ef-s-area");
    ok(`${tag} location has a value (Fridge): no strip, nothing extra drawn`, (await strip(p, "area").isHidden()) && (await p.inputValue('[data-f="area"]')) === "Fridge" && (await strip(p, "area").innerHTML()) === "");
    await p.click('[data-f="area"]');
    ok(`${tag} focusing a box that has a value still shows no strip`, await strip(p, "area").isHidden());
    await p.press('[data-f="area"]', "End"); await p.keyboard.type("x");
    ok(`${tag} typing in a box with a value pops the strip in (the typed text is offered)`, !(await strip(p, "area").isHidden()) && (await pills(p, "area")).join("|") === "Fridgex", await pills(p, "area"));
    await p.keyboard.press("Backspace");
    await p.fill('[data-f="area"]', "");
    ok(`${tag} clearing the box shows the strip with the first two suggestions`, !(await strip(p, "area").isHidden()) && (await pills(p, "area")).join("|") === "Fridge|Pantry", await pills(p, "area"));
    ok(`${tag} empty: one row, tag/pin icon, chevron to show the rest`, (await p.locator("#sg-area .ef-ct svg").count()) === 1 && (await p.locator("#sg-area .ef-cx:visible").count()) === 1 && (await p.locator("#sg-area .ef-chip").count()) === 2);
    ok(`${tag} strip pills are 44px targets`, await p.evaluate(() => [...document.querySelectorAll("#sg-area .ef-chip,#sg-area .ef-cx")].every(e => e.getBoundingClientRect().height >= 43.5)));
    await shot(p, "strip-empty");
    await p.click("#sg-area .ef-cx");
    ok(`${tag} chevron shows the rest of the locations`, (await pills(p, "area")).length === 3, await pills(p, "area"));
    await p.click("#sg-area .ef-cx");
    ok(`${tag} ARIA: combobox with listbox and option roles`, (await p.getAttribute('[data-f="area"]', "role")) === "combobox" && (await p.getAttribute('[data-f="area"]', "aria-expanded")) === "true" && (await p.getAttribute('[data-f="area"]', "aria-controls")) === "sg-area" && (await p.locator("#sg-area [role=listbox] [role=option]").count()) === 2);
    await p.fill('[data-f="area"]', "pan");
    ok(`${tag} typing filters and HIGHLIGHTS the match, with the typed text as the outlined add pill`, (await pills(p, "area")).join("|") === "pan|Pantry" && (await hlText(p, "area")) === "Pantry" && (await p.locator("#sg-area .ef-chip.add").count()) === 1, [await pills(p, "area"), await hlText(p, "area")]);
    ok(`${tag} the highlighted pill is aria-activedescendant and selected`, (await p.getAttribute('[data-f="area"]', "aria-activedescendant")) === (await p.locator("#sg-area .ef-chip.hl").getAttribute("id")) && (await p.locator("#sg-area .ef-chip.hl").getAttribute("aria-selected")) === "true");
    await shot(p, "strip-typing");
    await p.keyboard.press("Enter");
    ok(`${tag} Enter takes the highlighted match (Pantry), the strip goes away, the spot clears`, (await p.inputValue('[data-f="area"]')) === "Pantry" && (await strip(p, "area").isHidden()) && (await p.inputValue('[data-f="spot"]')) === "", [await p.inputValue('[data-f="area"]'), await p.inputValue('[data-f="spot"]')]);
    await p.fill('[data-f="area"]', "f"); await p.keyboard.press("ArrowDown");
    ok(`${tag} arrow keys move the highlight`, (await hlText(p, "area")) === "Freezer", await hlText(p, "area"));
    await p.keyboard.press("Enter");
    ok(`${tag} ...and Enter takes it`, (await p.inputValue('[data-f="area"]')) === "Freezer");
    await p.fill('[data-f="area"]', ""); await p.locator("#sg-area .ef-chip", { hasText: "Pantry" }).click();
    ok(`${tag} tapping a pill takes it`, (await p.inputValue('[data-f="area"]')) === "Pantry" && (await strip(p, "area").isHidden()));
    await p.fill('[data-f="area"]', "Gar");
    ok(`${tag} the outlined add pill is highlighted when nothing matches`, (await hlText(p, "area")) === "Gar" && (await p.locator("#sg-area .ef-chip").count()) === 1);
    await p.locator("#sg-area .ef-chip.add").click();
    ok(`${tag} tapping the add pill adds the typed place (free text)`, (await p.inputValue('[data-f="area"]')) === "Gar" && /Gar/.test(await p.innerText("#ief-list")), await p.inputValue('[data-f="area"]'));
    await p.fill('[data-f="area"]', "garage"); await p.press('[data-f="area"]', "Tab");
    ok(`${tag} leaving the box keeps a new location too`, /garage/i.test(await p.inputValue('[data-f="area"]')) && (await p.inputValue('[data-f="spot"]')) === "");
    await p.fill('[data-f="area"]', "Pantry"); await p.press('[data-f="area"]', "Tab");
    await p.click('[data-f="spot"]');
    ok(`${tag} empty spot: the strip shows (two of the Pantry's spots)`, (await pills(p, "spot")).join("|") === "Top shelf|Bottom shelf", await pills(p, "spot"));
    await p.click("#sg-spot .ef-cx");
    ok(`${tag} spot strip follows the location: all four Pantry spots on the chevron`, (await pills(p, "spot")).join("|") === "Top shelf|Bottom shelf|Baskets|Spice rack", await pills(p, "spot"));
    await p.fill('[data-f="spot"]', "spi");
    ok(`${tag} typing filters the spots, the match is highlighted`, (await hlText(p, "spot")) === "Spice rack" && (await pills(p, "spot")).join("|") === "spi|Spice rack", await pills(p, "spot"));
    await p.keyboard.press("Escape");
    ok(`${tag} Esc closes only the strip (the flyout stays open, the text stays)`, (await strip(p, "spot").isHidden()) && (await p.locator("#ief-child:visible").count()) === 1 && (await p.inputValue('[data-f="spot"]')) === "spi");
    await p.keyboard.type("c");
    ok(`${tag} typing again brings the strip back`, !(await strip(p, "spot").isHidden()) && (await hlText(p, "spot")) === "Spice rack");
    await p.locator("#sg-spot .ef-chip", { hasText: "Spice rack" }).click();
    ok(`${tag} spot chosen`, (await p.inputValue('[data-f="spot"]')) === "Spice rack" && (await strip(p, "spot").isHidden()));
    await p.fill('[data-f="area"]', ""); await p.press('[data-f="area"]', "Tab"); await p.click('[data-f="spot"]'); await p.fill('[data-f="spot"]', "");
    const hint = await p.locator("#sg-spot .ef-chip .hint").count();
    await p.fill('[data-f="area"]', "Annex"); await p.click('[data-f="spot"]'); await p.fill('[data-f="spot"]', "");
    ok(`${tag} a new location has no spots to suggest: no empty strip under Spot`, await strip(p, "spot").isHidden());
    await p.fill('[data-f="area"]', ""); await p.press('[data-f="area"]', "Tab"); await p.click('[data-f="spot"]'); await p.fill('[data-f="spot"]', "");
    ok(`${tag} with no location, the spot pills name each spot's location`, hint >= 2 && (await p.locator("#sg-spot .ef-chip").count()) === 2, hint);
    await p.click("#sg-spot .ef-cx");
    await p.locator('#sg-spot .ef-chip:has(.hint:text("Fridge"))').first().click();
    ok(`${tag} choosing a spot fills the location in`, (await p.inputValue('[data-f="area"]')) === "Fridge" && (await strip(p, "area").isHidden()), await p.inputValue('[data-f="area"]'));
    ok(`${tag} no console errors (where)`, errs.length === 0, errs); errs.length = 0; await p.close();

    p = await open("?sel=eggs&child=edit&field=cat");
    await scrollTo(p, "#ef-s-cat");
    ok(`${tag} category has a value: no strip`, await strip(p, "cat").isHidden());
    await p.fill('[data-f="cat"]', "");
    ok(`${tag} category cleared: two suggestions and the chevron`, (await p.locator("#sg-cat .ef-chip").count()) === 2 && (await p.locator("#sg-cat .ef-cx:visible").count()) === 1);
    await p.click("#sg-cat .ef-cx");
    ok(`${tag} chevron shows the rest of the categories`, (await p.locator("#sg-cat .ef-chip").count()) >= 8); await shot(p, "strip-cat-open");
    await p.click("#sg-cat .ef-cx");
    await p.locator("#sg-cat .ef-chip", { hasText: "Vegetables" }).first().click().catch(async () => { await p.click("#sg-cat .ef-cx"); await p.locator("#sg-cat .ef-chip", { hasText: "Vegetables" }).first().click(); });
    ok(`${tag} a pill picks the category and the strip goes`, (await p.inputValue('[data-f="cat"]')) === "Vegetables" && (await strip(p, "cat").isHidden()));
    await p.fill('[data-f="cat"]', "veg");
    ok(`${tag} typing highlights the match`, (await hlText(p, "cat")) === "Vegetables" && (await p.locator("#sg-cat .ef-chip.add").count()) === 1, await pills(p, "cat"));
    await p.fill('[data-f="cat"]', "");
    await p.fill('[data-f="cat"]', "pick");
    ok(`${tag} a new category is offered as the outlined add pill`, (await pills(p, "cat")).join("|") === "pick" && (await hlText(p, "cat")) === "pick");
    await p.press('[data-f="cat"]', "Enter");
    ok(`${tag} Enter adds a new category`, (await p.inputValue('[data-f="cat"]')) === "pick" && /· pick/.test(await p.innerText("#ief-list")), await p.inputValue('[data-f="cat"]'));
    await p.close();

    /* 4a. Add: every box empty shows its strip; one implementation */
    p = await open("?mode=add");
    await scrollTo(p, "#ef-s-area");
    ok(`${tag} Add: Location, Spot and Category each show their strip while empty`, (await strip(p, "area").isVisible()) && (await strip(p, "spot").isVisible()) && (await strip(p, "cat").isVisible()));
    await p.click('#sg-area .ef-chip >> nth=0');
    ok(`${tag} Add: taking a location hides its strip and the spot strip follows it`, (await strip(p, "area").isHidden()) && (await pills(p, "spot")).length === 2 && !(await strip(p, "spot").isHidden()));
    await shot(p, "strip-add");
    ok(`${tag} no console errors (add strips)`, errs.length === 0, errs); errs.length = 0; await p.close();

    /* 4b. Use by: the Add form's quick choices */
    p = await open("?sel=eggs&child=edit&field=useby");
    ok(`${tag} use-by quick choices are +3 days, +5 days, +1 week, Pick date`, (await p.locator("#ef-s-useby .pill").allInnerTexts()).join("|") === "+3 days|+5 days|+1 week|Pick date\u2026", await p.locator("#ef-s-useby .pill").allInnerTexts());
    await p.click('#ef-s-useby [data-n="7"]');
    ok(`${tag} +1 week sets Sat 17 Oct`, /Sat 17 Oct/.test(await p.innerText("#ef-s-useby .ef-ub")), await p.innerText("#ef-s-useby .ef-ub"));
    await p.click('[data-ef="pickdate"]');
    await p.$eval('#ef-s-useby [data-f="useby"]', el => { el.value = "2026-10-20"; el.dispatchEvent(new Event("change", { bubbles: true })); });
    ok(`${tag} a picked date is saved`, /Tue 20 Oct/.test(await p.innerText("#ef-s-useby .ef-ub")), await p.innerText("#ef-s-useby .ef-ub"));
    await p.click('[data-ef="clearuse"]');
    ok(`${tag} Clear removes the use-by`, /Not set/.test(await p.innerText("#ef-s-useby .ef-ub")));
    await p.close();

    /* 4c. History carries the edits made here, under Today */
    p = await open("?sel=eggs&child=edit");
    await p.click('#ef-s-level [data-v="Some"]'); await p.click('[data-ef="qclear"]');
    await p.click('#ief-head [data-ief="history"]'); await p.waitForSelector("#ief-child .hist");
    const hist = await p.innerText("#ief-cbody");
    ok(`${tag} history lists the level and quantity edits under Today`, /today/i.test(hist) && /Level/.test(hist) && /Quantity/.test(hist), hist.slice(0, 160));
    await p.close();

    /* 5. emoji, Edit and Add (decisions 116 to 119, 129 to 132): the tile is the field. Box and strip show only after a tap; no picker, no panel, no popup */
    const emoOpen = async (p, tile, box) => { await p.click(tile); await p.waitForSelector(box + ":visible", { timeout: 3000 }); await p.waitForSelector((box === "#ef-emoin" ? "#sg-emo" : "#ief-sg-emo") + ":visible", { timeout: 3000 }); };
    p = await open("?sel=butter&child=edit");
    ok(`${tag} emoji: with an emoji set only the tile shows: no text box, no strip, nothing fetched yet`, (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#sg-emo").isHidden()) && (await p.locator("#ef-emof").isHidden()) && !(await p.evaluate(() => !!window.IEF.emoji)) && (await p.innerText("#ef-emo")) === "🧈" && (await p.getAttribute("#ef-emo", "aria-expanded")) === "false");
    ok(`${tag} emoji: the tile is a 44px or larger target`, await p.evaluate(() => { const b = document.querySelector("#ef-emo").getBoundingClientRect(); return b.width >= 44 && b.height >= 44; }));
    await shot(p, "emoji-tile-only");
    await emoOpen(p, "#ef-emo", "#ef-emoin");
    ok(`${tag} emoji: the tile reveals the box and strip and focuses the box (no panel opens), the hint is its placeholder`, (await p.evaluate(() => document.activeElement && document.activeElement.id)) === "ef-emoin" && (await p.locator("#ief-child:visible").count()) === 1 && !(await p.locator("#sg-emo").isHidden()) && (await p.getAttribute("#ef-emoin", "placeholder")) === "Search, or type or paste your own emoji" && (await p.getAttribute("#ef-emo", "aria-expanded")) === "true" && (await p.locator("#ef-emojis, .ef-ep, [data-epi], .ef-eph").count()) === 0);
    ok(`${tag} emoji: the box holds the emoji, selected, so typing replaces it`, (await p.inputValue("#ef-emoin")) === "🧈" && (await p.evaluate(() => { const i = document.querySelector("#ef-emoin"); return i.selectionStart === 0 && i.selectionEnd === i.value.length; })));
    ok(`${tag} emoji: the box carries the input hints Kitchie uses and no emoji-keyboard claim`, await p.evaluate(() => { const i = document.querySelector("#ef-emoin"); return i.type === "text" && i.getAttribute("autocapitalize") === "none" && i.getAttribute("autocorrect") === "off" && i.getAttribute("spellcheck") === "false" && i.getAttribute("autocomplete") === "off" && i.getAttribute("enterkeyhint") === "done" && !i.getAttribute("inputmode"); }));
    ok(`${tag} emoji: the placeholder keeps the size rule (12 to 15px)`, await p.evaluate(() => { const f = parseFloat(getComputedStyle(document.querySelector("#ef-emoin"), "::placeholder").fontSize); return f >= 12 && f <= 15; }));
    await p.keyboard.type("c");
    const sh1 = (await p.locator("#sg-emo").boundingBox()).height, below1 = (await p.locator("#ef-s-qty").boundingBox()).y;
    await p.keyboard.type("hee");
    ok(`${tag} emoji: typing filters the list and highlights cheese`, /cheese/.test(await p.innerText("#sg-emo .ef-chip.hl")) && (await p.getAttribute("#ef-emoin", "aria-expanded")) === "true" && !!(await p.getAttribute("#ef-emoin", "aria-activedescendant")), await p.innerText("#sg-emo"));
    ok(`${tag} emoji: one row of 44px pills, and typing does not move anything (same strip height)`, await p.evaluate(() => [...document.querySelectorAll("#sg-emo .ef-chip")].every(b => b.getBoundingClientRect().height >= 44)) && Math.abs((await p.locator("#sg-emo").boundingBox()).height - sh1) < 1 && Math.abs((await p.locator("#ef-s-qty").boundingBox()).y - below1) < 1 && sh1 < 60, sh1);
    await shot(p, "emoji-typed");
    await p.keyboard.type("zz");
    ok(`${tag} emoji: no match says so, in the same row`, /No emoji matches/.test(await p.innerText("#sg-emo")) && Math.abs((await p.locator("#sg-emo").boundingBox()).height - sh1) < 1);
    await p.keyboard.press("Escape");
    ok(`${tag} emoji: Esc cancels: back to the tile, the emoji unchanged, the edit flyout stays, focus on the tile`, (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#sg-emo").isHidden()) && (await p.locator("#ief-child:visible").count()) === 1 && (await p.evaluate(() => document.activeElement.id)) === "ef-emo" && (await p.innerText("#ef-emo")) === "🧈" && (await p.inputValue("#ef-emoin")) === "🧈");
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.keyboard.type("zz"); await p.keyboard.press("Tab"); await p.waitForSelector("#ef-emoin", { state: "hidden", timeout: 2500 }).catch(() => {});
    ok(`${tag} emoji: blur with words that are no emoji goes back to what was there and collapses to the tile`, (await p.inputValue("#ef-emoin")) === "🧈" && (await p.innerText("#ef-emo")) === "🧈" && (await p.locator("#ef-emoin").isHidden()));
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.fill("#ef-emoin", "chee"); await p.press("#ef-emoin", "Enter");
    ok(`${tag} emoji: Enter takes the highlighted match, collapses to the tile; header and list update`, (await p.innerText("#ef-emo")) === "🧀" && (await p.inputValue("#ef-emoin")) === "🧀" && (await p.innerText("#ief-head .ph")) === "🧀" && /🧀 butter/.test(await p.innerText("#ief-list")) && (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#sg-emo").isHidden()));
    ok(`${tag} emoji: the change is a History line`, await p.evaluate(() => (IEF.LOG.butter || []).some(e => e.field === "Emoji" && e.to === "🧀")));
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.fill("#ef-emoin", "\u{1F99A}");
    ok(`${tag} emoji: a typed or pasted emoji outside the list is kept at once and the box collapses`, (await p.innerText("#ef-emo")) === "\u{1F99A}" && (await p.inputValue("#ef-emoin")) === "\u{1F99A}" && (await p.locator("#ef-emoin").isHidden()));
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.fill("#ef-emoin", "mango \u{1F96D}");
    ok(`${tag} emoji: an emoji with words is the outlined first pill, highlighted (the box stays open)`, (await p.locator("#sg-emo .ef-chip").first().getAttribute("class")).includes("add") && (await p.locator("#sg-emo .ef-chip.hl").first().innerText()).includes("\u{1F96D}"));
    await p.press("#ef-emoin", "Enter");
    ok(`${tag} emoji: Enter keeps that one emoji`, (await p.innerText("#ef-emo")) === "\u{1F96D}" && (await p.locator("#ef-emoin").isHidden()));
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.fill("#ef-emoin", "\u{1F96D}\u{1F350}");
    ok(`${tag} emoji: two emoji typed: the new one is kept, only one`, (await p.inputValue("#ef-emoin")) === "\u{1F350}" && (await p.innerText("#ef-emo")) === "\u{1F350}");
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.fill("#ef-emoin", "");
    ok(`${tag} emoji: clearing leaves the box OPEN with one row: one or two pills and the chevron`, !(await p.locator("#ef-emoin").isHidden()) && !(await p.locator("#sg-emo").isHidden()) && (await p.locator("#sg-emo .ef-chip:visible").count()) >= 1 && (await p.locator("#sg-emo .ef-chip:visible").count()) <= 2 && (await p.locator("#sg-emo .ef-cx:visible").count()) === 1 && (await p.locator("#sg-emo").boundingBox()).height < 60);
    ok(`${tag} emoji: Recent leads with the last pick`, (await p.locator("#sg-emo .ef-chip").first().innerText()).includes("\u{1F350}"), await p.innerText("#sg-emo"));
    await shot(p, "emoji-empty");
    await p.press("#ef-emoin", "Tab"); await p.waitForSelector("#ef-emoin", { state: "hidden", timeout: 2500 }).catch(() => {});
    ok(`${tag} emoji: leaving the cleared box saves no emoji and collapses: neutral tile, list row without one`, (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#ef-emo svg").count()) === 1 && (await p.getAttribute("#ef-emo", "aria-label")) === "Add an emoji" && (await p.evaluate(() => IEF.items.filter(i => i.id === "butter")[0].emoji)) === "" && !/\u{1F350} butter/u.test(await p.innerText("#ief-list")) && (await p.evaluate(() => (IEF.LOG.butter || []).some(e => e.field === "Emoji" && e.to === "not set"))));
    await shot(p, "emoji-neutral-tile");
    await emoOpen(p, "#ef-emo", "#ef-emoin");
    ok(`${tag} emoji: the neutral tile opens the same box and strip`, !(await p.locator("#sg-emo").isHidden()) && (await p.inputValue("#ef-emoin")) === "" && (await p.locator("#sg-emo .ef-cx:visible").count()) === 1);
    await p.keyboard.type("ap");
    const ad0 = await p.getAttribute("#ef-emoin", "aria-activedescendant"); await p.keyboard.press("ArrowDown");
    ok(`${tag} emoji: arrow keys move the highlight`, (await p.getAttribute("#ef-emoin", "aria-activedescendant")) !== ad0);
    await p.locator("#sg-emo .ef-chip").first().click();
    ok(`${tag} emoji: a tapped pill is kept and collapses to the tile`, (await p.locator("#ef-emo svg").count()) === 0 && (await p.innerText("#ef-emo")).length > 0 && (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#sg-emo").isHidden()));
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.keyboard.press("Escape");
    ok(`${tag} emoji: Esc with no change collapses to the tile`, (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#ef-emo svg").count()) === 0);
    await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.click("#ef-emo");
    ok(`${tag} emoji: a second tap on the tile puts the box away`, await p.locator("#ef-emoin").isHidden());
    ok(`${tag} emoji: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
    ok(`${tag} no console errors (emoji)`, errs.length === 0, errs); errs.length = 0; await p.close();

    p = await open("?mode=add");
    ok(`${tag} Add: there is no Level control (so no "Not set" or "Back to automatic" either)`, (await p.locator("#ef-s-level, .ef-auto, .ef-lvm").count()) === 0);
    ok(`${tag} Add: no emoji yet: the neutral tile only, no box, no strip`, (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#sg-emo").isHidden()) && (await p.locator("#ef-emo svg").count()) === 1);
    await emoOpen(p, "#ef-emo", "#ef-emoin");
    ok(`${tag} Add: the tile opens the box with its strip: one row, one or two pills, the chevron`, !(await p.locator("#sg-emo").isHidden()) && (await p.locator("#sg-emo .ef-chip:visible").count()) >= 1 && (await p.locator("#sg-emo .ef-chip:visible").count()) <= 2 && (await p.locator("#sg-emo .ef-cx:visible").count()) === 1);
    await p.keyboard.type("bread"); await p.keyboard.press("Enter");
    ok(`${tag} Add: emoji picked, back to the tile only`, (await p.innerText("#ef-emo")) === "🍞" && (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#ief-panel .ef, #ief-child .ef").count()) === 1);
    await p.fill('[data-f="name"]', "sourdough"); await p.click('[data-ef="addgo"]');
    await p.waitForTimeout(150);
    ok(`${tag} Add: the new item keeps its emoji and name`, /🍞 sourdough/.test(await p.innerText("#ief-list")), (await p.innerText("#ief-list")).slice(0, 80));
    if (kind === "desktop") {
      await p.click('[data-ief="add"]').catch(() => {}); await p.waitForSelector('[data-mode="add"] #ef-emo');
      await p.fill('[data-f="name"]', "croissant"); await emoOpen(p, "#ef-emo", "#ef-emoin"); await p.keyboard.insertText("cro \u{1F950}"); await p.waitForTimeout(100);
      await p.keyboard.press("Shift+Enter"); await p.waitForTimeout(150);
      ok(`${tag} Add: Shift+Enter is left to the form (adds, with the emoji, and starts another with only the neutral tile)`, /\u{1F950} croissant/u.test(await p.innerText("#ief-list")) && (await p.inputValue('[data-f="name"]')) === "" && (await p.locator("#ef-emoin").isHidden()), (await p.innerText("#ief-list")).slice(0, 80));
    }
    ok(`${tag} no console errors (add)`, errs.length === 0, errs); errs.length = 0; await p.close();

    /* 5b. units (decisions 120 and 121): clearing is always allowed; typed units fold onto the household's own; "2kg" splits when it is unambiguous */
    p = await open("?sel=carrots&child=edit");
    const unitIs = async (typed, want, amt) => { await p.fill('[data-f="unit"]', typed); await p.press('[data-f="unit"]', "Enter"); await p.waitForTimeout(30); const it = await p.evaluate(() => { const i = IEF.items.filter(x => x.id === "carrots")[0]; return [i.unit, i.amount]; }); ok(`${tag} unit: "${typed}" is ${want || "no unit"}${amt === undefined ? "" : " and " + amt}`, it[0] === want && (amt === undefined || it[1] === amt), it); };
    await unitIs("kilos", "kg"); await unitIs("Kg", "kg"); await unitIs("KILOGRAMS", "kg"); await unitIs("kilo", "kg");
    await unitIs("boxes", "box"); await unitIs("ML", "mL"); await unitIs("litres", "L"); await unitIs("packets", "pack");
    await unitIs("", "");
    ok(`${tag} unit: cleared, the item has no unit and reads as a plain number`, (await p.evaluate(() => IEF.qtyText(IEF.items.filter(x => x.id === "carrots")[0]))) === "1");
    await unitIs("2kg", "kg", 2);
    await p.fill('[data-f="amount"]', "3 kilos"); await p.press('[data-f="amount"]', "Tab"); await p.waitForTimeout(30);
    ok(`${tag} unit: "3 kilos" in the quantity box is 3 kg`, JSON.stringify(await p.evaluate(() => { const i = IEF.items.filter(x => x.id === "carrots")[0]; return [i.amount, i.unit]; })) === '[3,"kg"]');
    await p.fill('[data-f="unit"]', "kilos");
    ok(`${tag} unit: the note says what Enter will keep`, /Enter keeps it as kg/.test(await p.innerText("#ef-s-qty .ef-newunit")), await p.innerText("#ef-s-qty .ef-newunit"));
    await p.press('[data-f="unit"]', "Escape"); await p.close();
    p = await open("?sel=spinach&child=edit");
    await p.fill('[data-f="text"]', "2 x 400 g"); await p.press('[data-f="text"]', "Tab"); await p.waitForTimeout(30);
    ok(`${tag} unit: "2 x 400 g" in the own-words box stays words (not unambiguous)`, (await p.evaluate(() => { const i = IEF.items.filter(x => x.id === "spinach")[0]; return i.amount === null && i.text === "2 x 400 g"; })));
    await p.fill('[data-f="text"]', "2 kilos"); await p.press('[data-f="text"]', "Tab"); await p.waitForTimeout(30);
    ok(`${tag} unit: "2 kilos" in the own-words box becomes 2 kg`, JSON.stringify(await p.evaluate(() => { const i = IEF.items.filter(x => x.id === "spinach")[0]; return [i.amount, i.unit, i.text]; })) === '[2,"kg",""]');
    ok(`${tag} unit: the matcher's table`, JSON.stringify(await p.evaluate(() => [IEF.splitQty("2kg"), IEF.splitQty("250ml"), IEF.splitQty("1,500 g"), IEF.splitQty("2 eggs"), IEF.splitQty("half a bag"), IEF.unitMatch("tsps"), IEF.unitMatch("Box"), IEF.unitMatch("punnet")])) === JSON.stringify([{ amount: 2, unit: "kg" }, { amount: 250, unit: "mL" }, null, null, null, "tsp", "box", "punnet"]));
    ok(`${tag} no console errors (units)`, errs.length === 0, errs); errs.length = 0; await p.close();

    /* 7. the bands, as a table (decision 84 confirmed for counted AND weighed, 95 for no minimum) */
    p = await open("?sel=eggs");
    const bands = await p.evaluate(() => {
      const L = (amount, unit, min) => IEF.level({ amount, unit, min: min === null ? "" : String(min), level: "Plenty", lvSet: null });
      const out = [];
      for (const unit of ["", "tin", "g", "kg", "mL"]) for (const [a, m, want] of [[9, 4, "Plenty"], [8, 4, "Some"], [5, 4, "Some"], [4, 4, "Running low"], [1, 4, "Running low"], [0, 4, "Out"], [1, null, "Plenty"], [0.5, null, "Plenty"], [0, null, "Out"]]) out.push([unit || "none", a, m, want, L(a, unit, m)]);
      return out;
    });
    ok(`${tag} the four-band rule for counted and weighed with a minimum, and Plenty-until-0 with none (${bands.length} cases)`, bands.every(b => b[3] === b[4]), bands.filter(b => b[3] !== b[4]));
    await p.close();

    /* 8. "How much to buy" in the item flyout (decisions 99, 103 to 105): only at Running low or Out; the default amounts; the level is never an input */
    const listOf = (pg, id) => pg.evaluate(i => IEF.items.filter(x => x.id === i)[0].list, id);
    const buyBox = pg => pg.locator("#ief-buy");
    const buyVal = pg => pg.inputValue('#ief-buy [data-buy="num"]');
    const buyNote = pg => pg.innerText("#ief-buy .ef-note");
    const toast = pg => pg.innerText("#ief-toast");
    let pg0;
    /* Plenty and Some: no control, and the plain add is exactly as today */
    for (const [q, lvName] of [["?sel=eggs", "Plenty"], ["?sel=yog", "Some"], ["?sel=butter", "Plenty"], ["?sel=spinach", "Some"], ["?sel=rice", "Plenty"]]) {
      p = await open(q); ok(`${tag} ${q} at ${lvName} no how-much control is drawn`, (await buyBox(p).count()) === 0 && (await p.locator('[data-ief="shopquick"]').count()) === 1);
      await p.close();
    }
    p = await open("?sel=eggs");
    await p.click('[data-ief="shopquick"]');
    ok(`${tag} plain add at Plenty is unchanged: on the list with no amount, same toast`, (await listOf(p, "eggs")) === "" && /^eggs is on your shopping list\.\s*Undo/.test((await toast(p)).replace(/\s+/g, " ")), [await listOf(p, "eggs"), await toast(p)]);
    ok(`${tag} after the add the button reads On your list and no control shows`, (await p.locator("#ief-acts .btn:disabled:has-text('On your list')").count()) === 1 && (await buyBox(p).count()) === 0);
    await p.close();
    p = await open("?sel=yog");
    await p.click('[data-ief="shopquick"]');
    ok(`${tag} plain add at Some is unchanged (no amount)`, (await listOf(p, "yog")) === "", await listOf(p, "yog"));
    await p.close();
    /* counted, calculated Running low (tomatoes 4 tin, minimum 4) */
    p = await open("?sel=tom");
    ok(`${tag} counted, Running low: a stepper in the item's unit, no own-words box`, (await buyBox(p).count()) === 1 && (await p.locator('#ief-buy [data-buy="words"]').count()) === 0 && (await p.locator("#ief-buy .ef-unit").innerText()) === "tin");
    ok(`${tag} counted default: 4 tin held, minimum 4 starts at 4 (twice the minimum, 8, less the 4 held)`, (await buyVal(p)) === "4" && /twice your minimum \(8 tin\)/.test(await buyNote(p)), [await buyVal(p), await buyNote(p)]);
    ok(`${tag} the control sits above the buttons`, await p.evaluate(() => document.querySelector("#ief-buy").getBoundingClientRect().bottom <= document.querySelector("#ief-acts").getBoundingClientRect().top + 1));
    await shot(p, "sheet-buy-counted");
    await p.click('#ief-buy [data-d="1"]');
    ok(`${tag} the stepper moves a counted item by one`, (await buyVal(p)) === "5");
    await p.fill('#ief-buy [data-buy="num"]', "7");
    await p.click('[data-ief="shopquick"]');
    ok(`${tag} Add to shopping stores the number and unit: 7 tin`, (await listOf(p, "tom")) === "7 tin" && /on your shopping list: 7 tin/.test(await toast(p)), [await listOf(p, "tom"), await toast(p)]);
    ok(`${tag} then the control is gone and the button reads On your list`, (await buyBox(p).count()) === 0 && (await p.locator("#ief-acts .btn:disabled:has-text('On your list')").count()) === 1);
    await p.close();
    p = await open("?sel=tom&lv=Out");
    ok(`${tag} Out starts at the whole target (8 tin)`, (await buyVal(p)) === "8", await buyVal(p));
    ok(`${tag} Out: the button is still Add to shopping and Used up reads Marked Out`, (await p.locator('[data-ief="shopquick"]').count()) === 1 && (await p.locator("#ief-acts .btn:disabled:has-text('Marked Out')").count()) === 1);
    await p.close();
    /* weighed, calculated Running low (cheddar 200 g, minimum 250 g) */
    p = await open("?sel=cheddar");
    ok(`${tag} weighed, Running low: 200 g held, minimum 250 g, starts at 300 g; unit g`, (await buyVal(p)) === "300" && /\(500 g\)/.test(await buyNote(p)) && (await p.locator("#ief-buy .ef-unit").innerText()) === "g", [await buyVal(p), await buyNote(p)]);
    await p.click('#ief-buy [data-d="1"]');
    ok(`${tag} the weighed stepper moves it by 50`, (await buyVal(p)) === "350");
    await p.click('#ief-buy [data-d="-1"]'); await p.click('#ief-buy [data-d="-1"]');
    ok(`${tag} and back down by 50`, (await buyVal(p)) === "250");
    await p.fill('#ief-buy [data-buy="num"]', "abc");
    ok(`${tag} a bad number says so and is not kept`, (await p.locator("#ief-buy .ef-err").count()) === 1 && /Use a number/.test(await p.innerText("#ief-buy .ef-err")));
    await p.fill('#ief-buy [data-buy="num"]', "350");
    ok(`${tag} a good number clears the message`, (await p.locator("#ief-buy .ef-err").count()) === 0);
    await p.click('[data-ief="shopquick"]');
    ok(`${tag} the list stores the words "350 g"`, (await listOf(p, "cheddar")) === "350 g", await listOf(p, "cheddar"));
    await p.close();
    /* the tallest sheets (a stepper with its note, the own-words box with its two-line label, the Out state) still fit the half sheet with no scrolling: the buttons stay in view */
    for (const q of ["?sel=tom", "?sel=tom&lv=Out", "?sel=spinach&lv=Running%20low", "?sel=cheddar"]) {
      p = await open(q); await p.waitForTimeout(450);
      const fit = await p.evaluate(() => { const e = document.querySelector("#ief-panel"), b = document.querySelector('[data-ief="shopquick"]').getBoundingClientRect(), r = e.getBoundingClientRect(); return { sh: e.scrollHeight, ch: e.clientHeight, btnIn: b.bottom <= innerHeight + 0.5 && b.bottom <= r.bottom + 0.5 }; });
      ok(`${tag} ${q} the sheet fits its content: the buttons are in view with no scrolling`, fit.sh <= fit.ch + 1 && fit.btnIn, fit);
      await p.close();
    }
    /* a hand-set Running low shows the control exactly like a calculated one (paneer 50 g, no minimum: what you have) */
    p = await open("?sel=paneer");
    ok(`${tag} hand-set Running low (paneer): the control shows, no minimum starts from what you have (50 g)`, (await buyVal(p)) === "50" && /Starts from what you have/.test(await buyNote(p)), [await buyBox(p).count(), await buyVal(p)]);
    ok(`${tag} a hand-set level never added it to the list`, (await listOf(p, "paneer")) === null);
    await p.close();
    p = await open("?sel=milk");
    ok(`${tag} hand-set Running low but already on the list (milk): no control, button reads On your list`, (await buyBox(p).count()) === 0 && (await p.locator("#ief-acts .btn:disabled:has-text('On your list')").count()) === 1);
    await p.close();
    p = await open("?sel=butter&lv=Running low");
    ok(`${tag} hand-set Running low with no minimum (butter): control at what you have (250 g)`, (await buyVal(p)) === "250" && (await p.locator("#ief-tiles .tl:first-child .bat.lv-low").count()) === 1, await buyVal(p));
    await p.close();
    p = await open("?sel=carrots&lv=Running low");
    ok(`${tag} counted with no minimum, hand-set Running low: starts at 1 bag`, (await buyVal(p)) === "1" && (await p.locator("#ief-buy .ef-unit").innerText()) === "bag", await buyVal(p));
    await p.close();
    p = await open("?sel=eggs&lv=Running low");
    ok(`${tag} 12 eggs, minimum 4, hand-set Running low: already over twice the minimum, so one step`, (await buyVal(p)) === "1" && /already have twice/.test(await buyNote(p)), [await buyVal(p), await buyNote(p)]);
    await p.close();
    /* no exact quantity: own words */
    p = await open("?sel=spinach&lv=Running low");
    ok(`${tag} worded (no exact quantity), Running low: the own-words box, no stepper`, (await p.locator('#ief-buy [data-buy="words"]').count()) === 1 && (await p.locator('#ief-buy [data-buy="num"]').count()) === 0 && (await p.getAttribute('#ief-buy [data-buy="words"]', "placeholder")) === "1 kg, a packet, 3");
    await shot(p, "sheet-buy-words");
    await p.fill('#ief-buy [data-buy="words"]', "two big bags"); await p.click('[data-ief="shopquick"]');
    ok(`${tag} own words are stored as typed`, (await listOf(p, "spinach")) === "two big bags", await listOf(p, "spinach"));
    await p.close();
    p = await open("?sel=spinach&lv=Out");
    ok(`${tag} worded and Out: the own-words box too`, (await p.locator('#ief-buy [data-buy="words"]').count()) === 1);
    await p.click('[data-ief="shopquick"]');
    ok(`${tag} worded: an empty box adds with no words, as the plain add does`, (await listOf(p, "spinach")) === "", await listOf(p, "spinach"));
    await p.close();
    /* the control follows the level and the quantity as they change in the edit flyout; the amount is worked out again when the numbers change */
    p = await open("?sel=tom&child=edit");
    ok(`${tag} Edit open over the sheet: the sheet's how-much control is in step (4)`, (await buyVal(p)) === "4");
    await scrollTo(p, "#ef-s-qty"); await p.fill('[data-f="amount"]', "2"); await p.press('[data-f="amount"]', "Tab");
    ok(`${tag} a new quantity in Edit starts the amount again from the default (8 less 2 held = 6)`, (await buyVal(p)) === "6", await buyVal(p));
    await scrollTo(p, "#ef-s-level"); await p.click('#ef-s-level [data-v="Plenty"]');
    ok(`${tag} hand-setting Plenty in Edit takes the how-much control away from the sheet`, (await buyBox(p).count()) === 0 && (await listOf(p, "tom")) === null);
    await p.click('#ef-s-level [data-v="Running low"]');
    ok(`${tag} hand-setting Running low in Edit brings it back, and still adds nothing`, (await buyBox(p).count()) === 1 && (await listOf(p, "tom")) === null);
    await p.click('#ef-s-level [data-v="Out"]');
    ok(`${tag} hand-setting Out starts at the whole target (twice the minimum 4 is 8)`, (await buyVal(p)) === "8" && (await listOf(p, "tom")) === null, [await buyVal(p), await listOf(p, "tom")]);
    ok(`${tag} no console errors (how much to buy)`, errs.length === 0, errs); errs.length = 0; await p.close();
    if (kind === "desktop") {
      p = await open("?sel=tom");
      await p.keyboard.press("s");
      ok(`${tag} S adds with the how-much amount (4 tin)`, (await listOf(p, "tom")) === "4 tin", await listOf(p, "tom"));
      await p.close();
    }
    p = await open("?sel=tom&child=edit&field=level");
    await p.click('#ef-s-level [data-v="Running low"]'); await p.click('#ef-s-level [data-v="Out"]');
    ok(`${tag} picking Running low or Out in Edit does not put the item on the list`, (await listOf(p, "tom")) === null);
    await p.close();
    p = await open("?sel=tom");
    ok(`${tag} Add to shopping is still the explicit way on`, (await listOf(p, "tom")) === null);
    await p.click('[data-ief="shopquick"]');
    ok(`${tag} ... and now it is on`, (await listOf(p, "tom")) !== null);
    await p.close();
    p = await open("?sel=tom");
    ok(`${tag} the level itself reads from the one shared function (Running low shows the control, Plenty does not)`, await p.evaluate(() => { const t = IEF.items.filter(i => i.id === "tom")[0], was = JSON.stringify(t); const r = []; for (const a of [0, 3, 4, 5, 8, 9]) { t.amount = a; t.lvSet = null; r.push([a, IEF.level(t), IEF.buyShows(t)]); } Object.assign(t, JSON.parse(was)); return JSON.stringify(r) === JSON.stringify([[0, "Out", true], [3, "Running low", true], [4, "Running low", true], [5, "Some", false], [8, "Some", false], [9, "Plenty", false]]); }));
    await p.close();

    /* 8c. a hand-set level looks IDENTICAL to a calculated one everywhere outside the edit flyout's cue (decision 100); no drop is drawn anywhere */
    p = await open("?sel=milk");
    const milkIcon = await p.evaluate(() => document.querySelector("#ief-tiles .tl:first-child svg").outerHTML), milkTxt = await p.innerText("#ief-panel"), milkList = await p.innerText("#ief-list");
    await p.close();
    p = await open("?sel=tom");
    const tomIcon = await p.evaluate(() => document.querySelector("#ief-tiles .tl:first-child svg").outerHTML);
    await p.close();
    ok(`${tag} hand-set Running low (milk) and calculated Running low (tomatoes) draw the same battery`, milkIcon === tomIcon && /class="bat lv-low"/.test(milkIcon), [milkIcon.slice(0, 60), tomIcon.slice(0, 60)]);
    ok(`${tag} no "Automatic" or "Set by you" outside the edit flyout`, !/Set by you|Automatic/.test(milkTxt + milkList), milkTxt.slice(0, 80));
    p = await open("?sel=milk&child=edit&field=level");
    const pickOn = await p.evaluate(() => document.querySelector("#ef-s-level .opt.on svg").outerHTML);
    ok(`${tag} the level picker draws four batteries and the hand-set one is the same drawing`, (await p.locator("#ef-s-level .opt .bat").count()) === 4 && pickOn === await p.evaluate(() => document.querySelector('#ef-s-level [data-v="Running low"] svg').outerHTML) && (await cue(p)) === "Set by you");
    ok(`${tag} no drop is drawn anywhere on the page, the tile has a battery`, (await p.locator(".drop").count()) === 0 && (await p.locator("#ief-tiles .tl .bat").count()) === 1);
    ok(`${tag} battery cells match the level: 4, 2, 1, 0`, JSON.stringify(await p.evaluate(() => ["Plenty", "Some", "Running low", "Out"].map(l => document.querySelectorAll(`#ef-s-level [data-v="${l}"] svg rect`).length - 1))) === "[4,2,1,0]");
    ok(`${tag} the picker batteries use the level colours`, await p.evaluate(() => { const c = l => getComputedStyle(document.querySelector(`#ef-s-level [data-v="${l}"] svg`)).color; const t = document.documentElement; const cols = ["Plenty", "Some", "Running low", "Out"].map(c); return new Set(cols).size === 4; }));
    await p.close();
    {
      const src = ["flows/household/app.js", "flows/household/mobile/styles.css", "flows/household/tablet/styles.css", "flows/household/desktop/styles.css", "fragments/item-edit-flyout/flyout.js", "fragments/item-edit-flyout/flyout.css", "fragments/item-sheet/index.html"].map(f => readFileSync(new URL("../" + f, import.meta.url), "utf8")).join("\n");
      ok(`${tag} no level drop is left in the household flow, the flyout or the item-sheet options`, !/levelDrop|class="drop|IEF\.drop|\.drop\.lv|clipPath id="dc/.test(src));
    }

    /* 9. Category and Unit: chips plus free text for anything not in the list (decisions 91, 98) */
    p = await open("?sel=eggs&child=edit&field=cat");
    await scrollTo(p, "#ef-s-cat");
    await p.fill('[data-f="cat"]', "Pet food"); await p.press('[data-f="cat"]', "Enter");
    ok(`${tag} category: a word not in the list is kept (free text)`, (await p.inputValue('[data-f="cat"]')) === "Pet food" && /· Pet food/.test(await p.innerText("#ief-list")), await p.inputValue('[data-f="cat"]'));
    ok(`${tag} category: the value is kept and the strip is gone`, (await p.inputValue('[data-f="cat"]')) === "Pet food" && (await p.locator("#sg-cat").isHidden()));
    await p.close();
    p = await open("?sel=eggs&child=edit&field=qty");
    const uc = await p.locator("#ef-s-qty .ef-chip").allInnerTexts();
    ok(`${tag} unit quick-picks: weight and volume, the count units, then No unit`, ["g", "kg", "mL", "L", "pack", "tin", "jar", "bottle", "bag", "box", "carton", "bunch", "roll", "No unit"].every(u => uc.indexOf(u) > -1) && uc.length === 14, uc);
    ok(`${tag} unit: "No unit" is the chosen one for eggs, and the box says so`, (await p.locator("#ef-s-qty .ef-chip.on").innerText()) === "No unit" && (await p.inputValue('[data-f="unit"]')) === "");
    await shot(p, "unit-chips");
    ok(`${tag} unit chips fold to one line with a chevron`, (await p.locator("#ef-s-qty .ef-cx:visible").count()) === 1);
    await chipPick(p, "#ef-s-qty", "jar");
    ok(`${tag} a unit chip sets the unit (12 jar in the item flyout)`, (await p.inputValue('[data-f="unit"]')) === "jar" && /12 jar/.test(await p.innerText("#ief-panel")), await p.inputValue('[data-f="unit"]'));
    await p.fill('[data-f="unit"]', "punnet"); await p.press('[data-f="unit"]', "Enter");
    ok(`${tag} a unit not in the list is kept (free text): 12 punnet`, (await p.inputValue('[data-f="unit"]')) === "punnet" && /12 punnet/.test(await p.innerText("#ief-panel")), await p.inputValue('[data-f="unit"]'));
    ok(`${tag} the typed unit is a chip from then on, chosen`, (await p.locator("#ef-s-qty .ef-chip.on").innerText()) === "punnet");
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} a typed unit steps by one`, (await p.inputValue('[data-f="amount"]')) === "13");
    await p.fill('[data-f="unit"]', "ML"); await p.press('[data-f="unit"]', "Tab");
    ok(`${tag} a typed unit takes the household's own spelling (ML becomes mL)`, (await p.inputValue('[data-f="unit"]')) === "mL");
    await p.fill('[data-f="unit"]', "bo");
    ok(`${tag} typing filters the unit chips`, (await p.locator("#ef-s-qty .ef-chip").allInnerTexts()).join("|") === "bottle|box", await p.locator("#ef-s-qty .ef-chip").allInnerTexts());
    await p.fill('[data-f="unit"]', "furlong");
    ok(`${tag} typing a new unit offers it`, (await p.locator("#ef-s-qty .ef-chip").count()) === 0 && /furlong/.test(await p.innerText(".ef-newunit")));
    await p.press('[data-f="unit"]', "Enter"); await p.waitForTimeout(100);
    ok(`${tag} no console errors (category and unit)`, errs.length === 0, errs); errs.length = 0; await p.close();
    p = await open("?mode=add");
    await p.fill('[data-f="name"]', "gerbil seed"); await p.click('[data-ef="addunit"]');
    ok(`${tag} Add: Add unit shows the unit chips`, (await p.locator("#ef-s-qty .ef-chip").count()) === 14);
    await p.fill('[data-f="unit"]', "scoop"); await p.press('[data-f="unit"]', "Tab");
    ok(`${tag} Add: a typed unit is a chip, chosen`, (await p.locator("#ef-s-qty .ef-chip.on").innerText()) === "scoop");
    await scrollTo(p, "#ef-s-cat"); await p.fill('[data-f="cat"]', "Pet food"); await p.press('[data-f="cat"]', "Tab");
    ok(`${tag} Add: a typed category is kept`, (await p.inputValue('[data-f="cat"]')) === "Pet food");
    ok(`${tag} Add: the use-by quick choices are the same set as Edit`, (await p.locator("#ef-s-useby .pill").allInnerTexts()).join("|") === "+3 days|+5 days|+1 week|Pick date…", await p.locator("#ef-s-useby .pill").allInnerTexts());
    await p.click('[data-ef="addgo"]'); await p.waitForTimeout(150);
    ok(`${tag} Add: the new item keeps its free-text unit and category`, /gerbil seed\s*Unplaced · 1 scoop · Pet food/.test(await p.innerText("#ief-list")), (await p.innerText("#ief-list")).slice(-200));
    ok(`${tag} no console errors (add free text)`, errs.length === 0, errs); errs.length = 0; await p.close();

    /* 8d. the household flow's item sheet draws the same battery (phone only, it is a phone flow) */
    if (kind === "phone") {
      const hp = await ctx.newPage(); hp.on("pageerror", e => errs.push("PAGEERR " + e.message));
      await hp.goto(BASE.replace("fragments/item-edit-flyout/pantry.html", "flows/household/index.html"), { waitUntil: "networkidle" });
      for (let i = 0; i < 3; i++) { const bt = await hp.$('[data-act="signin"], .btn'); if (!bt) break; await bt.click(); await hp.waitForTimeout(300); }
      await hp.click('button[data-go="pantry"]'); await hp.waitForTimeout(300); await hp.locator(".pswipe .rowlink").first().click(); await hp.waitForTimeout(500);
      ok(`${tag} household item sheet: the level tile is a battery, no drop`, (await hp.locator(".sheet .tl .bat").count()) === 1 && (await hp.locator(".sheet .drop").count()) === 0 && /class="bat lv-plenty"/.test(await hp.locator(".sheet .tl .bat").evaluate(e => e.outerHTML)));
      await hp.locator('.tl[data-p="amount"], .tl[data-p="level"]').first().click(); await hp.waitForTimeout(400);
      ok(`${tag} household level picker: four batteries, 4 / 2 / 1 / 0 cells`, JSON.stringify(await hp.evaluate(() => [...document.querySelectorAll(".lvpick .opt svg")].map(s => s.querySelectorAll("rect").length - 1))) === "[0,1,2,4]", await hp.evaluate(() => [...document.querySelectorAll(".lvpick .opt svg")].map(s => s.querySelectorAll("rect").length - 1)));
      ok(`${tag} household sheet: no level word drawn in the picker (screen-reader text only)`, await hp.evaluate(() => [...document.querySelectorAll(".lvpick .opt")].every(o => [...o.childNodes].filter(n => n.nodeType === 3).length === 0 && o.querySelector(".sr-only"))));
      ok(`${tag} no console errors (household)`, errs.length === 0, errs); errs.length = 0; await hp.close();
    }

    /* 10. the emoji tile in the item flyout's header (decision 106, kept by 119): a tap shows the emoji box under the header and focuses it; same save path as Edit */
    p = await open("?sel=cheddar");
    ok(`${tag} sheet: no emoji shows the dashed "+" tile, labelled Add an emoji`, (await p.locator("#ief-emo svg").count()) === 1 && (await p.getAttribute("#ief-emo", "aria-label")) === "Add an emoji" && (await p.locator("#ief-emo.empty").count()) === 1);
    ok(`${tag} sheet: the tile is a 44px or larger target`, await p.evaluate(() => { const b = document.querySelector("#ief-emo").getBoundingClientRect(); return b.width >= 44 && b.height >= 44; }));
    ok(`${tag} sheet: nothing was fetched for the emoji before the tap, and the box is not shown`, !(await p.evaluate(() => !!window.IEF.emoji)) && (await p.locator("#ief-emof").isHidden()));
    await shot(p, "sheet-emoji-tile");
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 });
    ok(`${tag} sheet: the tap shows the box under the header and focuses it; the tiles and buttons stay (no panel)`, (await p.evaluate(() => document.activeElement.id)) === "ief-emoin" && (await p.locator("#ief-tiles:visible").count()) === 1 && (await p.locator("#ief-acts:visible").count()) === 1 && (await p.getAttribute("#ief-emo", "aria-expanded")) === "true" && (await p.getAttribute("#ief-emoin", "placeholder")) === "Search, or type or paste your own emoji");
    ok(`${tag} sheet: the empty box shows one row: one or two pills and the chevron`, (await p.locator("#ief-sg-emo .ef-chip:visible").count()) >= 1 && (await p.locator("#ief-sg-emo .ef-chip:visible").count()) <= 2 && (await p.locator("#ief-sg-emo").boundingBox()).height < 60);
    ok(`${tag} sheet: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
    await shot(p, "sheet-emoji-open");
    await p.keyboard.type("chee");
    ok(`${tag} sheet: typing highlights cheese`, /cheese/.test(await p.innerText("#ief-sg-emo .ef-chip.hl")));
    await p.locator("#ief-sg-emo .ef-chip.hl").click();
    ok(`${tag} sheet: picked: the tile and the list row follow, the box goes away`, (await p.innerText("#ief-emo")) === "🧀" && /🧀 cheddar/.test(await p.innerText("#ief-list")) && (await p.locator("#ief-emof").isHidden()) && (await p.locator("#ief-tiles:visible").count()) === 1 && (await p.getAttribute("#ief-emo", "aria-expanded")) === "false", await p.innerText("#ief-emo"));
    ok(`${tag} sheet: the toast says so, with Undo`, /emoji is 🧀/.test(await toast(p)) && /Undo/.test(await toast(p)), await toast(p));
    ok(`${tag} sheet: the change is in this item's History as an Emoji line`, await p.evaluate(() => (IEF.LOG.cheddar || []).some(e => e.field === "Emoji" && e.to === "🧀")));
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 });
    ok(`${tag} sheet: with an emoji set the tap opens the box holding it (selected) with the strip under it`, (await p.inputValue("#ief-emoin")) === "🧀" && !(await p.locator("#ief-sg-emo").isHidden()));
    await p.keyboard.type("ch");
    await p.keyboard.press("Escape");
    ok(`${tag} sheet: Esc cancels: only the tile shows, the emoji is kept, focus on the tile, sheet and tiles stay`, (await p.locator("#ief-emof").isHidden()) && (await p.locator("#ief-sg-emo").isHidden()) && (await p.innerText("#ief-emo")) === "🧀" && (await p.evaluate(() => document.activeElement && document.activeElement.id)) === "ief-emo" && (await p.locator("#ief-panel .shead:visible").count()) === 1 && (await p.locator("#ief-tiles:visible").count()) === 1);
    await p.keyboard.press("Escape");
    if (kind !== "desktop") ok(`${tag} sheet: another Esc then closes the sheet (phone)`, (await p.locator("#ief-panel .shead").count()) === 0);
    await p.close();
    p = await open("?sel=butter");
    ok(`${tag} sheet: an emoji set shows in the tile, labelled so`, (await p.innerText("#ief-emo")) === "🧈" && /Emoji 🧈/.test(await p.getAttribute("#ief-emo", "aria-label")));
    await p.close(); p = await open("?sel=butter");
    ok(`${tag} sheet: with an emoji set ONLY the tile shows: no text box, no strip (the owner's phone screenshot)`, (await p.locator("#ief-emoin").isHidden()) && (await p.locator("#ief-sg-emo").isHidden()) && (await p.locator("#ief-emof").isHidden()));
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.fill("#ief-emoin", "");
    ok(`${tag} sheet: clearing leaves the box open (no emoji is saved until it is left or Enter)`, !(await p.locator("#ief-emof").isHidden()) && !(await p.locator("#ief-sg-emo").isHidden()) && (await p.innerText("#ief-emo")) === "🧈");
    await p.keyboard.press("Tab"); await p.waitForSelector("#ief-emoin", { state: "hidden", timeout: 2500 }).catch(() => {});
    ok(`${tag} sheet: leaving the cleared box saves no emoji and collapses to the neutral tile`, (await p.locator("#ief-emof").isHidden()) && (await p.locator("#ief-emo svg").count()) === 1);
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.keyboard.insertText("mango \u{1F96D}");
    ok(`${tag} sheet: keyboard-dismiss: an emoji with words is typed and the box is still open, nothing saved yet`, !(await p.locator("#ief-emof").isHidden()) && (await p.locator("#ief-emo svg").count()) === 1);
    await p.evaluate(() => document.activeElement.blur()); await p.waitForSelector("#ief-emoin", { state: "hidden", timeout: 2500 }).catch(() => {});
    ok(`${tag} sheet: keyboard-dismiss (blur) keeps the valid emoji, collapses to the tile, and the list row has it`, (await p.innerText("#ief-emo")) === "\u{1F96D}" && (await p.locator("#ief-emof").isHidden()) && /\u{1F96D} butter/u.test(await p.innerText("#ief-list")));
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.keyboard.type("zzz");
    await p.evaluate(() => document.activeElement.blur()); await p.waitForSelector("#ief-emoin", { state: "hidden", timeout: 2500 }).catch(() => {});
    ok(`${tag} sheet: keyboard-dismiss with only words (no emoji) puts back what was there and collapses`, (await p.innerText("#ief-emo")) === "\u{1F96D}" && (await p.locator("#ief-emof").isHidden()));
    if (kind !== "desktop") {
      await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 });
      await p.evaluate(() => IEF.host.kb(300)); await p.waitForTimeout(350);
      const vh = h, r = await p.evaluate(() => { const a = document.querySelector("#ief-panel").getBoundingClientRect(), b = document.querySelector("#ief-emoin").getBoundingClientRect(), t = document.querySelector("#ief-sg-emo").getBoundingClientRect(); return { pb: a.bottom, pt: a.top, bb: b.bottom, bt: b.top, sb: t.bottom }; });
      ok(`${tag} sheet: with the keyboard up (300px) the sheet is lifted above it and the box and strip stay in view`, Math.abs(r.pb - (vh - 300)) <= 2 && r.bt >= 0 && r.sb <= vh - 300 + 1, r);
      await shot(p, "sheet-emoji-keyboard");
      await p.evaluate(() => IEF.host.kb(0)); await p.waitForTimeout(350);
      ok(`${tag} sheet: keyboard gone: the sheet is back at the bottom`, Math.abs((await p.evaluate(() => document.querySelector("#ief-panel").getBoundingClientRect().bottom)) - vh) <= 2);
    }
    await p.close(); p = await open("?sel=butter");
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.fill("#ief-emoin", ""); await p.press("#ief-emoin", "Enter");
    ok(`${tag} sheet: clearing the box and Enter saves no emoji (the "+" tile, the list row loses it, the box collapses)`, (await p.locator("#ief-emo svg").count()) === 1 && !/🧈 butter/.test(await p.innerText("#ief-list")) && (await p.getAttribute("#ief-emo", "aria-label")) === "Add an emoji" && (await p.locator("#ief-tiles:visible").count()) === 1);
    ok(`${tag} sheet: the clear is in History too`, await p.evaluate(() => (IEF.LOG.butter || []).some(e => e.field === "Emoji" && e.to === "not set")));
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.keyboard.insertText("\u{1F99A}");
    ok(`${tag} sheet: an emoji typed or pasted from the device is kept at once`, (await p.innerText("#ief-emo")) === "\u{1F99A}" && /\u{1F99A} butter/u.test(await p.innerText("#ief-list")));
    await p.click('[data-ief="history"]'); await p.waitForSelector("#ief-child .hist");
    ok(`${tag} sheet: the History flyout shows the Emoji line`, /Emoji/.test(await p.innerText("#ief-cbody")), (await p.innerText("#ief-cbody")).slice(0, 120));
    ok(`${tag} no console errors (sheet emoji)`, errs.length === 0, errs); errs.length = 0; await p.close();
    p = await open("?sel=cheddar&down=1");
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.locator("#ief-sg-emo .ef-chip").first().click();
    ok(`${tag} sheet: a failed save says so and keeps the old emoji`, /Not saved/.test(await toast(p)) && (await p.locator("#ief-emo.empty").count()) === 1, await toast(p));
    await p.close();
    p = await open("?sel=cheddar&child=edit");
    if (kind === "phone") ok(`${tag} sheet: with Edit open over it the tile does not intercept the tap (it steps back)`, (await p.evaluate(() => getComputedStyle(document.querySelector("#ief-emo")).pointerEvents)) === "none");
    await p.close();
    if (kind === "desktop") {
      p = await open("?sel=cheddar&child=edit");
      await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 });
      ok(`${tag} sheet: tapping the tile with Edit open steps Edit back and shows the box`, (await p.locator("#ief-child:visible").count()) === 0 && (await p.locator("#ief-emof:visible").count()) === 1);
      await p.keyboard.type("bread"); await p.keyboard.press("Enter");
      await p.click('#ief-head [data-ief="edit"]'); await p.waitForSelector("#ief-child .ef");
      ok(`${tag} sheet: reopening Edit shows the new emoji in its own tile and box`, (await p.innerText("#ef-emo")) === "🍞" && (await p.inputValue("#ef-emoin")) === "🍞", await p.innerText("#ef-emo"));
      await p.close();
      p = await open("?sel=cheddar");
      await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.keyboard.press("d");
      ok(`${tag} sheet: letter keys do nothing while typing in the box (D does not mark it used up)`, (await p.evaluate(() => IEF.items.filter(i => i.id === "cheddar")[0].amount)) === 200 && (await p.inputValue("#ief-emoin")) === "d");
      await p.close();
    }
    p = await open("?sel=milk");
    await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 }); await p.keyboard.type("milk");
    ok(`${tag} sheet: the strip marks the item's current emoji`, (await p.locator("#ief-sg-emo .ef-chip.on").first().innerText()).includes("🥛"));
    await p.click('#ief-head [data-ief="edit"]');
    await p.waitForSelector("#ief-child .ef");
    ok(`${tag} sheet: opening Edit puts the sheet's box away`, (await p.locator("#ief-emof").isHidden()) && (await p.getAttribute("#ief-emo", "aria-expanded")) === "false" && (await p.locator("#ef-emoin").count()) === 1);
    await p.close();

    /* 9b. key hints are shown on the icons (decision 68, confirmed) */
    p = await open("?sel=eggs");
    if (kind === "desktop") ok(`${tag} key hints shown on the pencil and the clock`, (await p.evaluate(() => document.querySelector("#ief-app").dataset.hint)) === "show" && (await p.locator("#ief-head .ib .kbd.cap:visible").allInnerTexts()).join("|") === "E|,", await p.locator("#ief-head .ib .kbd.cap").allInnerTexts());
    else ok(`${tag} no key hints on a phone or tablet`, (await p.locator("#ief-head .kbd").count()) === 0);
    await p.close();

    /* 9c. Add has a key: + (also = and the numpad +), shown on the button; Shift+Space turns the key hints on and off (decisions 120 to 124) */
    p = await open("?sel=eggs");
    if (kind === "desktop") {
      const mode = () => p.evaluate(() => IEF.S.mode), nocues = () => p.evaluate(() => document.body.classList.contains("nocues"));
      ok(`${tag} Add button shows + as its key hint, and names + and N for assistive tech`, (await p.locator(".hd [data-ief=add] .kbd").innerText()) === "+" && /Plus/.test(await p.getAttribute(".hd [data-ief=add]", "aria-keyshortcuts")));
      for (const [label, press] of [["Shift+= (types +)", "Shift+Equal"], ["=", "Equal"], ["numpad +", "NumpadAdd"]]) {
        await p.keyboard.press(press); await p.waitForSelector('#ief-panel [data-f="name"]', { timeout: 2000 }).catch(() => {});
        ok(`${tag} ${label} opens Add`, (await mode()) === "add" && (await p.locator('#ief-panel [data-f="name"]').count()) === 1, await mode());
        await p.keyboard.press("Control+Enter"); await p.waitForTimeout(80);
        await p.evaluate(() => IEF.openItem("eggs", {})); await p.waitForTimeout(80);
      }
      await p.keyboard.press("Control+Equal"); await p.keyboard.press("Alt+Shift+Equal"); await p.keyboard.press("Meta+Equal");
      ok(`${tag} + with Ctrl, Alt or Cmd held does not open Add`, (await mode()) !== "add", await mode());
      await p.close();
      p = await open("?sel=eggs&child=edit");
      const nm = '#ief-child [data-f="name"]'; await p.focus(nm); await p.keyboard.press("End"); const before = await p.inputValue(nm);
      await p.keyboard.type("+="); 
      ok(`${tag} + and = type into a text box and do not open Add`, (await p.inputValue(nm)) === before + "+=" && (await mode()) !== "add", [await p.inputValue(nm), await mode()]);
      /* Shift+Space: a space in the box, no toggle, and the press is not swallowed */
      await p.keyboard.press("Shift+Space");
      ok(`${tag} Shift+Space types a space in a text box and leaves the hints alone`, (await p.inputValue(nm)).endsWith("+= ") && !(await nocues()));
      const swallowed = await p.evaluate(() => { const i = document.querySelector('#ief-child [data-f="name"]'); return !i.dispatchEvent(new KeyboardEvent("keydown", { key: " ", shiftKey: true, bubbles: true, cancelable: true })); });
      ok(`${tag} Shift+Space in a text box is not preventDefault-ed`, swallowed === false);
      await p.close();
      /* the toggle itself */
      p = await open("?sel=eggs");
      await p.evaluate(() => { try { localStorage.removeItem("desktop-cues"); } catch (e) {} });
      const hintsShown = () => p.evaluate(() => { const k = document.querySelector("#ief-head .ib .kbd.cap"); return !!k && k.offsetParent !== null; });
      ok(`${tag} hints are shown by default (the existing look, decision 68)`, (await hintsShown()) && !(await nocues()));
      await p.evaluate(() => document.activeElement && document.activeElement.blur());
      const lost = await p.evaluate(() => !document.body.dispatchEvent(new KeyboardEvent("keydown", { key: " ", shiftKey: true, bubbles: true, cancelable: true })));
      await p.waitForTimeout(120);
      ok(`${tag} Shift+Space off: hints hidden, the press was handled (preventDefault), the choice kept on this device`, lost && !(await hintsShown()) && (await nocues()) && (await p.evaluate(() => localStorage.getItem("desktop-cues"))) === "0");
      const st = p.locator("#cue-status");
      ok(`${tag} status line is a polite live region and says "Key hints off"`, (await st.getAttribute("role")) === "status" && (await st.getAttribute("aria-live")) === "polite" && (await st.innerText()) === "Key hints off", await st.innerText());
      await p.reload(); await p.waitForSelector("#ief-panel .shead", { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(200);
      ok(`${tag} the choice survives a reload`, (await nocues()) && !(await hintsShown()));
      await p.keyboard.press("Shift+Space"); await p.waitForTimeout(120);
      ok(`${tag} Shift+Space on: hints back, status says "Key hints on"`, (await hintsShown()) && !(await nocues()) && (await st.innerText()) === "Key hints on" && (await p.evaluate(() => localStorage.getItem("desktop-cues"))) === "1");
      /* what it must not do */
      const shiftSpace = (mods = {}) => p.evaluate((m) => { const t = document.activeElement || document.body; return !t.dispatchEvent(new KeyboardEvent("keydown", { key: " ", shiftKey: true, bubbles: true, cancelable: true, ...m })); }, mods);
      await p.focus('#ief-head [data-ief="edit"]');
      ok(`${tag} Shift+Space on a focused button does nothing (Space presses it)`, !(await shiftSpace()) && !(await nocues()));
      await p.evaluate(() => document.activeElement.blur());
      ok(`${tag} Shift+Space with Ctrl, Cmd or Alt held does nothing`, !(await shiftSpace({ ctrlKey: true })) && !(await shiftSpace({ metaKey: true })) && !(await shiftSpace({ altKey: true })) && !(await nocues()));
      ok(`${tag} a held key does not flicker`, !(await shiftSpace({ repeat: true })) && !(await nocues()));
      ok(`${tag} an IME that is composing is ignored`, !(await shiftSpace({ isComposing: true })) && !(await shiftSpace({ keyCode: 229 })) && !(await nocues()));
      ok(`${tag} plain Space does nothing`, !(await p.evaluate(() => !document.body.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })))) && !(await nocues()));
      await p.keyboard.press("?"); await p.waitForSelector("#ief-help:not([hidden])");
      const list = await p.innerText("#ief-help");
      ok(`${tag} the shortcuts list names + or N for Add and Shift Space for the hints`, /\+\s*or\s*N/i.test(list.replace(/\n/g, " ")) && /Shift\s+Space/i.test(list.replace(/\n/g, " ")), list.slice(0, 200));
      await p.close();
    } else {
      ok(`${tag} no Add key hint on a phone or tablet`, (await p.locator(".hd [data-ief=add] .kbd").count()) === 0 && (await p.locator("#cue-status").count()) === 0);
      await p.keyboard.press("Shift+Equal"); await p.waitForTimeout(100);
      ok(`${tag} + opens nothing on a phone or tablet`, (await p.evaluate(() => IEF.S.mode)) !== "add");
      const lost = await p.evaluate(() => !document.body.dispatchEvent(new KeyboardEvent("keydown", { key: " ", shiftKey: true, bubbles: true, cancelable: true })));
      ok(`${tag} Shift+Space does nothing on a phone or tablet (no hints to switch)`, !lost && !(await p.evaluate(() => document.body.classList.contains("nocues"))));
      await p.close();
    }

    /* 6. keys (desktop only), layout and size */
    if (kind === "desktop") {
      p = await open("?sel=eggs");
      await p.keyboard.press("e"); await p.waitForSelector("#ief-child .ef");
      ok(`${tag} E opens the edit flyout`, (await p.locator("#ief-child:visible").count()) === 1);
      await p.click("#ef-emo"); await p.waitForSelector("#ef-emoin:visible"); await p.waitForSelector("#sg-emo:visible", { timeout: 3000 }); await p.keyboard.type("de");
      ok(`${tag} letters do nothing while typing in the emoji box`, (await p.locator("#ief-child:visible").count()) === 1 && (await p.inputValue("#ef-emoin")) === "de");
      await p.keyboard.press("Escape"); await p.keyboard.press("Escape"); await p.keyboard.press(",");
      ok(`${tag} comma swaps to history`, (await p.getAttribute("#ief-child", "data-kind")) === "history");
      await p.keyboard.press("Control+Enter"); ok(`${tag} Ctrl Enter closes the child`, (await p.locator("#ief-child:visible").count()) === 0);
      await p.close();
    }
    if (kind !== "desktop") {
      p = await open("?sel=eggs&child=edit");
      await p.keyboard.press("Escape");
      ok(`${tag} Esc closes the edit sheet, then the item`, (await p.locator("#ief-child:visible").count()) === 0 && (await p.locator("#ief-panel .shead").count()) === 1);
      await p.keyboard.press("Escape"); ok(`${tag} Esc again closes the item`, (await p.locator("#ief-panel .shead").count()) === 0);
      await p.close();
      p = await open("?sel=eggs&child=edit");
      await p.waitForTimeout(400); /* let the sheet finish rising */
      const g = await p.locator("#ief-child .chd").boundingBox();
      await p.mouse.move(g.x + 60, g.y + 12); await p.mouse.down(); await p.mouse.move(g.x + 60, g.y + 200, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(400);
      ok(`${tag} dragging the sheet's title bar down closes it (mouse, same as touch)`, (await p.locator("#ief-child:visible").count()) === 0);
      await p.close();
      p = await open("?sel=eggs");
      await p.click('#ief-tiles [data-k="qty"]'); await p.waitForSelector("#ief-child .ef");
      ok(`${tag} a tile tap lands on that field in Edit`, (await p.locator("#ef-s-qty.hl").count()) === 1);
      await p.close();
    }
    for (const q of ["?sel=eggs&child=edit", "?sel=spinach&child=edit", "?mode=add", "?sel=milk&child=history"]) {
      p = await open(q);
      const r = await p.evaluate(() => { const de = document.documentElement; const small = [...document.querySelectorAll("#ief-child button,#ief-child input,#ief-child select,#ief-panel button")].filter(el => { const b = el.getBoundingClientRect(), cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && (b.height < 43.5 || b.width < 43.5) && !el.closest("[hidden]") && !el.classList.contains("kbd"); }).slice(0, 5).map(el => el.tagName + "." + String(el.className).slice(0, 20) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)); return { sw: de.scrollWidth, cw: de.clientWidth, small }; });
      ok(`${tag} ${q} no sideways scroll`, r.sw <= r.cw, r);
      if (r.small.length) console.log("note small targets", tag, q, r.small.join("; "));
      ok(`${tag} ${q} no console errors`, errs.length === 0, errs); errs.length = 0; await p.close();
    }
    /* 13 Oct 2026, decision 157: a long item name has its own full-width row (3 lines at most, then an ellipsis), clear of the tile, the buttons and their key caps; the tucked child starts under it */
    if (kind === "desktop") for (const id of ["ranch", "flour"]) {
      const lp = await open("?sel=" + id); const m = await lp.evaluate(LONG, "#ief-panel");
      ok(`${tag} long name ${id}: pencil, clock, x and two key caps; title and sub line clear of them`, m.btns === 3 && m.caps === 2 && m.clear && m.subClear, m);
      ok(`${tag} long name ${id}: at most 3 lines (${m.lines}), the panel's full width, sub line visible right under it`, m.lines >= 1 && m.lines <= 3 && m.full >= m.panel - 60 && m.subVisible && m.subRight, m);
      ok(`${tag} long name ${id}: the whole name in its title attribute; no sideways scroll`, m.titleAttr && m.over <= 0, m);
      if (id === "flour") ok(`${tag} long name ${id}: past 3 lines it is cut with an ellipsis`, m.clipped && m.lines === 3, m);
      await shot(lp, "long-name-" + id); await lp.close();
      const cp = await open("?sel=" + id + "&child=history"); await cp.waitForTimeout(400);
      ok(`${tag} long name ${id}: the History child starts at or under the header's bottom (tucked) or beside it (column)`, await cp.evaluate(() => { const h = document.querySelector("#ief-head").getBoundingClientRect(), c = document.querySelector("#ief-child").getBoundingClientRect(); return c.left >= h.right - 1 || c.top >= h.bottom - 1; }));
      await shot(cp, "long-name-" + id + "-history"); await cp.close();
    }
    await ctx.close();
  }
}
/* 360 wide (the narrowest phone): the emoji tile alone, the box open, the level cue, Add; no sideways scroll and 44px targets (decision 129 to 132) */
if (!WANT.length || WANT.includes(360)) for (const [theme, mode] of [["kitchie", "dark"], ["kitchie-day", "light"]]) {
  const tag = `360 ${mode}`, ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, colorScheme: mode, hasTouch: true }), errs = [];
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const open = async q => { const p = await ctx.newPage(); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); p.on("pageerror", e => errs.push("PAGEERR " + e.message)); await p.goto(BASE + q, { waitUntil: "load" }); await p.waitForSelector(/child=|mode=add/.test(q) ? "#ief-child .ef, #ief-panel .ef" : "#ief-panel .shead", { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(400); return p; };
  const noScroll = p => p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  const small = p => p.evaluate(() => [...document.querySelectorAll("#ief-child button,#ief-child input:not([type=date]),#ief-panel button,#ief-panel input")].filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== "hidden" && (b.height < 43.5 || (b.width < 43.5 && !el.closest(".ef-clear,.ef-ubl"))) && !el.closest("[hidden]"); }).map(el => el.id || el.className || el.tagName));
  let p = await open("?sel=butter");
  ok(`${tag} sheet, emoji set: tile only, no sideways scroll`, (await p.locator("#ief-emof").isHidden()) && (await noScroll(p)));
  await p.click("#ief-emo"); await p.waitForSelector("#ief-emoin:visible"); await p.waitForSelector("#ief-sg-emo:visible", { timeout: 3000 });
  ok(`${tag} sheet, emoji box open: no sideways scroll, every target 44px`, (await noScroll(p)) && (await small(p)).length === 0, await small(p));
  await p.close();
  p = await open("?sel=eggs&child=edit");
  await p.click('#ef-s-level [data-v="Running low"]');
  ok(`${tag} edit: tile only, level "Set by you" with its 44px button, no sideways scroll`, (await p.locator("#ef-emoin").isHidden()) && (await p.locator("#ef-s-level .ef-auto").count()) === 1 && (await p.locator("#ef-s-level .ef-auto").evaluate(b => b.getBoundingClientRect().width >= 44 && b.getBoundingClientRect().height >= 44)) && (await noScroll(p)));
  await p.click("#ef-emo"); await p.waitForSelector("#ef-emoin:visible"); await p.waitForSelector("#sg-emo:visible", { timeout: 3000 });
  ok(`${tag} edit: emoji box open: no sideways scroll, strip pills 44px`, (await noScroll(p)) && (await p.evaluate(() => [...document.querySelectorAll("#sg-emo .ef-chip")].every(b => b.getBoundingClientRect().height >= 44))));
  ok(`${tag} edit: nothing under 44px`, (await small(p)).length === 0, await small(p));
  await p.close();
  p = await open("?mode=add"); await p.click("#ef-emo"); await p.waitForSelector("#ef-emoin:visible"); await p.waitForSelector("#sg-emo:visible", { timeout: 3000 });
  ok(`${tag} add: emoji box open: no sideways scroll`, await noScroll(p));
  ok(`${tag} no console errors`, errs.length === 0, errs); errs.length = 0; await p.close(); await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} of ${total} checks FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
