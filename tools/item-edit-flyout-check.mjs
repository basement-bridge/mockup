// Behaviour and layout check for fragments/item-edit-flyout (headless Chromium). Not a screenshot tool: it clicks and types through the flows and prints PASS or FAIL for each.
// Usage:  python3 -m http.server 8123 &   then   node tools/item-edit-flyout-check.mjs [--shots=dir]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers). Screenshots are written only when --shots is given (they are not kept in the repo).
// Covers (11 Oct 2026 round): the level control and the override rule, the two shopping states, Location / Spot / Category suggestion lists and the category chip row, the emoji picker in Edit and Add,
// the keys, no console errors, no sideways scroll, in light and dark, at phone, tablet and desktop widths.
// Covers (owner's voice answers of 11 Oct 2026, decisions 94 to 101): the battery everywhere (no drop is drawn), the four bands for counted AND weighed items with a minimum, no minimum = Plenty until 0 with Some / Running low by hand,
// a hand-set level cleared ONLY by an increase (a decrease, a unit change and a minimum change keep it), the shopping amount that starts at the top-up to twice the minimum, Category and Unit as chips plus free text,
// the use-by quick choices (same set in Edit and Add), a hand-set level drawn exactly like a calculated one, no automatic shopping, key hints shown on the icons.
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:8123/fragments/item-edit-flyout/pantry.html";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
const SIZES = [[390, 844, "phone"], [768, 1024, "tablet"], [1024, 768, "desktop"], [1440, 900, "desktop"]];
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
      await p.goto(BASE + q, { waitUntil: "networkidle" }); await p.waitForSelector("#ief-child .ef, #ief-panel .ef", { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(150);
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
    ok(`${tag} "go back to automatic" works`, (await cue(p)) === "Automatic", await cue(p));
    await p.click('#ef-s-level [data-v="Out"]');
    ok(`${tag} Out sets the amount to 0`, (await p.inputValue('[data-f="amount"]')) === "0" && (await lvl(p)) === "Out");
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} stock added after Out: automatic again`, (await cue(p)) === "Automatic" && (await lvl(p)) !== "Out", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-level [data-v="Plenty"]'); await p.click('#ef-s-level [data-v="Out"]'); await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} hand-set Plenty, then Out, then stock added: the rules decide (1 tin under minimum 5 is Running low)`, (await cue(p)) === "Automatic" && (await lvl(p)) === "Running low", [await lvl(p), await cue(p)]);
    ok(`${tag} no console errors (level)`, errs.length === 0, errs); errs.length = 0; await p.close();

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
    ok(`${tag} worded: four icons, no cue`, (await p.locator("#ef-s-level .opt").count()) === 4 && (await cue(p)) === "");
    await p.close();

    /* 3. the two shopping states */
    p = await open("?sel=eggs&child=edit&field=shop");
    ok(`${tag} shop with a quantity: stepper, no own-words box`, (await p.locator('#ef-s-shop [data-f="buy"]').count()) === 1 && (await p.locator('#ef-s-shop [data-f="shop"]').count()) === 0);
    await shot(p, "shop-quantity");
    await p.click('#ef-s-shop [data-key="buy"][data-d="1"]'); await p.click('[data-ef="shopsave"]');
    ok(`${tag} shop: Add saves the number in the item's unit`, /On the shopping list: 2\./.test(await p.innerText("#ef-s-shop")) && /Update the shopping list/.test(await p.innerText("#ef-s-shop")), await p.innerText("#ef-s-shop"));
    await scrollTo(p, "#ef-s-qty"); await p.click('[data-ef="qclear"]');
    ok(`${tag} clearing the quantity brings the own-words box`, (await p.locator('#ef-s-shop [data-f="shop"]').count()) === 1 && (await p.locator('#ef-s-shop [data-f="buy"]').count()) === 0);
    await scrollTo(p, "#ef-s-shop"); await p.fill('#ef-s-shop [data-f="shop"]', "two trays"); await p.click('[data-ef="shopsave"]');
    ok(`${tag} shop: own words saved`, /two trays/.test(await p.innerText("#ef-s-shop")), await p.innerText("#ef-s-shop"));
    ok(`${tag} cleared quantity: level keeps what showed, no cue`, (await cue(p)) === "");
    await p.close();
    p = await open("?sel=spinach&child=edit&field=shop");
    ok(`${tag} shop with no quantity: own-words box, no stepper`, (await p.locator('#ef-s-shop [data-f="shop"]').count()) === 1 && (await p.locator('#ef-s-shop [data-f="buy"]').count()) === 0);
    ok(`${tag} status line says Not on the shopping list`, /Not on the shopping list/.test(await p.innerText("#ef-s-shop")));
    await shot(p, "shop-words");
    await p.close();
    p = await open("?sel=milk&child=edit&field=shop");
    ok(`${tag} on the list: status and Update`, /On the shopping list: 2 L/.test(await p.innerText("#ef-s-shop")) && /Update the shopping list/.test(await p.innerText("#ef-s-shop")), await p.innerText("#ef-s-shop"));
    await p.close();

    /* 4. Location, Spot, Category */
    p = await open("?sel=eggs&child=edit&field=area");
    await scrollTo(p, "#ef-s-area"); await p.click('[data-f="area"]');
    ok(`${tag} location list opens on click`, (await p.locator("#cb-area li").count()) === 3, await p.locator("#cb-area li").count());
    await shot(p, "combo-open");
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown"); await p.keyboard.press("Enter");
    ok(`${tag} arrow keys and Enter choose a location, the spot clears`, (await p.inputValue('[data-f="area"]')) === "Pantry" && (await p.inputValue('[data-f="spot"]')) === "", [await p.inputValue('[data-f="area"]'), await p.inputValue('[data-f="spot"]')]);
    await p.click('[data-f="spot"]');
    ok(`${tag} spot list shows the spots of the location above`, (await p.locator("#cb-spot li").allInnerTexts()).join("|") === "Top shelf|Bottom shelf|Baskets|Spice rack", await p.locator("#cb-spot li").allInnerTexts());
    await p.fill('[data-f="spot"]', "spi");
    ok(`${tag} typing filters the spots`, (await p.locator("#cb-spot li").count()) === 1);
    await p.keyboard.press("Escape");
    ok(`${tag} Esc closes only the list (sheet stays open)`, (await p.locator("#cb-spot:visible").count()) === 0 && (await p.locator("#ief-child:visible").count()) === 1);
    await p.click('[data-f="spot"]'); await p.fill('[data-f="spot"]', "Spice"); await p.locator("#cb-spot li").first().click();
    ok(`${tag} spot chosen`, (await p.inputValue('[data-f="spot"]')) === "Spice rack");
    await p.fill('[data-f="area"]', "garage"); await p.press('[data-f="area"]', "Tab");
    ok(`${tag} a new location is accepted`, /garage/i.test(await p.inputValue('[data-f="area"]')) && (await p.inputValue('[data-f="spot"]')) === "");
    await p.fill('[data-f="area"]', ""); await p.press('[data-f="area"]', "Tab"); await p.click('[data-f="spot"]');
    const hint = await p.locator("#cb-spot li .hint").count();
    ok(`${tag} with no location, the spot list names each spot's location`, hint > 3, hint);
    await p.locator('#cb-spot li:has(.hint:text("Fridge"))').first().click();
    ok(`${tag} choosing a spot fills the location in`, (await p.inputValue('[data-f="area"]')) === "Fridge", await p.inputValue('[data-f="area"]'));
    ok(`${tag} no console errors (where)`, errs.length === 0, errs); errs.length = 0; await p.close();

    p = await open("?sel=eggs&child=edit&field=cat");
    await scrollTo(p, "#ef-s-cat");
    ok(`${tag} category chips drawn, chevron when more than one line`, (await p.locator("#ef-s-cat .ef-chip").count()) >= 8 && (await p.locator("#ef-s-cat .ef-cx:visible").count()) === 1);
    const h1 = (await p.locator("#ef-s-cat .ef-cl").boundingBox()).height; await p.click("#ef-s-cat .ef-cx"); const h2 = (await p.locator("#ef-s-cat .ef-cl").boundingBox()).height;
    ok(`${tag} chevron shows the rest`, h2 > h1 + 20, [h1, h2]); await shot(p, "chips-open");
    await p.click("#ef-s-cat .ef-cx");
    await p.click('#ef-s-cat .ef-chip:has-text("Vegetables")');
    ok(`${tag} chip picks the category`, (await p.inputValue('[data-f="cat"]')) === "Vegetables" && (await p.locator('#ef-s-cat .ef-chip.on').innerText()) === "Vegetables");
    await p.click('#ef-s-cat .ef-chip.on');
    ok(`${tag} chip again clears it`, (await p.inputValue('[data-f="cat"]')) === "");
    await p.fill('[data-f="cat"]', "pick");
    ok(`${tag} typing filters the chips and offers a new category`, (await p.locator("#ef-s-cat .ef-chip").count()) === 0 && !(await p.locator(".ef-newcat").isHidden()));
    await p.press('[data-f="cat"]', "Enter");
    ok(`${tag} Enter adds a new category`, (await p.inputValue('[data-f="cat"]')) === "pick" && /· pick/.test(await p.innerText("#ief-list")), await p.inputValue('[data-f="cat"]'));
    await p.close();
    p = await open("?sel=eggs&child=edit&field=cat&cat=list");
    await scrollTo(p, "#ef-s-cat"); await p.click('[data-f="cat"]');
    ok(`${tag} ?cat=list gives the plain suggestion list`, (await p.locator("#cb-cat li").count()) > 5 && (await p.locator("#ef-s-cat .ef-chip").count()) === 0);
    await p.close();

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

    /* 5. emoji, Edit and Add */
    p = await open("?sel=butter&child=edit");
    await p.click("#ef-emo");
    await p.waitForSelector("#ef-emojis [data-epi]");
    ok(`${tag} emoji picker opens with search, recent, grid`, (await p.locator("#ef-emojis .ef-epr .ef-e").count()) > 0 && (await p.locator("#ef-emojis .ef-epa .ef-e").count()) > 100);
    await shot(p, "emoji-open");
    await p.fill("[data-epi]", "chee");
    ok(`${tag} emoji search finds cheese`, (await p.locator("#ef-emojis .ef-epa .ef-e").first().getAttribute("data-e")) === "🧀" && (await p.locator("#ef-emojis .ef-epr").isHidden()));
    await p.fill("[data-epi]", "zzzz");
    ok(`${tag} emoji search with no match says so`, !(await p.locator(".ef-epn").isHidden()));
    await p.fill("[data-epi]", "chee"); await p.locator("#ef-emojis .ef-epa .ef-e").first().click();
    ok(`${tag} emoji picked: tile, header and list update`, (await p.innerText("#ef-emo")) === "🧀" && (await p.innerText("#ief-head .ph")) === "🧀" && /🧀 butter/.test(await p.innerText("#ief-list")) && (await p.locator("#ef-emojis:visible").count()) === 0);
    await p.click("#ef-emo"); await p.waitForSelector("#ef-emojis [data-epi]");
    ok(`${tag} recent now leads with the pick`, (await p.locator("#ef-emojis .ef-epr .ef-e").first().getAttribute("data-e")) === "🧀");
    ok(`${tag} No emoji offered once one is set`, (await p.locator('#ef-emojis .ef-eno').count()) === 1);
    await p.keyboard.press("Escape");
    ok(`${tag} Esc closes the picker only`, (await p.locator("#ef-emojis:visible").count()) === 0 && (await p.locator("#ief-child:visible").count()) === 1);
    await p.click("#ef-emo"); await p.waitForSelector("#ef-emojis .ef-eno"); await p.click("#ef-emojis .ef-eno");
    ok(`${tag} No emoji clears it`, (await p.locator("#ef-emo svg").count()) === 1 && !/🧀 butter|🧈 butter/.test(await p.innerText("#ief-list")) && (await p.getAttribute("#ef-emo", "aria-label")) === "Add an emoji");
    ok(`${tag} no console errors (emoji)`, errs.length === 0, errs); errs.length = 0; await p.close();

    p = await open("?mode=add");
    await p.click("#ef-emo"); await p.waitForSelector("#ef-emojis [data-epi]"); await p.fill("[data-epi]", "bread");
    await p.locator("#ef-emojis .ef-epa .ef-e").first().click();
    ok(`${tag} Add: emoji picked`, (await p.innerText("#ef-emo")) === "🍞");
    await p.fill('[data-f="name"]', "sourdough"); await p.click('[data-ef="addgo"]');
    await p.waitForTimeout(150);
    ok(`${tag} Add: the new item keeps its emoji and name`, /🍞 sourdough/.test(await p.innerText("#ief-list")), (await p.innerText("#ief-list")).slice(0, 80));
    ok(`${tag} no console errors (add)`, errs.length === 0, errs); errs.length = 0; await p.close();

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

    /* 8. the shopping list: default amount (decision 99), and the level never feeds it (101) */
    const buyOf = async q => { const pg = await open(q); const v = await pg.inputValue('#ef-s-shop [data-f="buy"]'); const n = await pg.innerText("#ef-s-shop .ef-note"); return [pg, v, n]; };
    let b;
    b = await buyOf("?sel=tom&child=edit&field=shop"); p = b[0];
    ok(`${tag} buy default with a minimum: 4 tin, minimum 4 starts at 4 (twice the minimum, 8, less the 4 held)`, b[1] === "4" && /twice your minimum \(8 tin\)/.test(b[2]), b.slice(1));
    await shot(p, "buy-default");
    await scrollTo(p, "#ef-s-level"); await p.click('#ef-s-level [data-v="Plenty"]'); await scrollTo(p, "#ef-s-shop");
    ok(`${tag} a hand-set Plenty does not change the default (level is not an input)`, (await p.inputValue('#ef-s-shop [data-f="buy"]')) === "4");
    await scrollTo(p, "#ef-s-min"); await p.click('#ef-s-min [data-key="min"][data-d="1"]'); await scrollTo(p, "#ef-s-shop");
    ok(`${tag} raising the minimum to 5 moves the default to 6 (10 less 4)`, (await p.inputValue('#ef-s-shop [data-f="buy"]')) === "6", await p.inputValue('#ef-s-shop [data-f="buy"]'));
    await p.fill('[data-f="amount"]', "0"); await p.press('[data-f="amount"]', "Tab"); await scrollTo(p, "#ef-s-shop");
    ok(`${tag} Out with a minimum of 5 starts at the whole target, 10`, (await p.inputValue('#ef-s-shop [data-f="buy"]')) === "10", await p.inputValue('#ef-s-shop [data-f="buy"]'));
    await p.click('#ef-s-shop [data-key="buy"][data-d="1"]');
    ok(`${tag} the stepper moves it by one for a counted item`, (await p.inputValue('#ef-s-shop [data-f="buy"]')) === "11");
    await p.close();
    b = await buyOf("?sel=cheddar&child=edit&field=shop"); p = b[0];
    ok(`${tag} weighed with a minimum: 200 g held, minimum 250 g, starts at 300 g`, b[1] === "300" && /\(500 g\)/.test(b[2]), b.slice(1));
    await p.click('#ef-s-shop [data-key="buy"][data-d="1"]');
    ok(`${tag} the weighed stepper moves it by 50`, (await p.inputValue('#ef-s-shop [data-f="buy"]')) === "350");
    await p.click('[data-ef="shopsave"]');
    ok(`${tag} the list stores the words "350 g"`, /On the shopping list: 350 g/.test(await p.innerText("#ef-s-shop")), await p.innerText("#ef-s-shop"));
    await p.close();
    b = await buyOf("?sel=eggs&child=edit&field=shop"); p = b[0];
    ok(`${tag} at or over twice the minimum: starts at one step`, b[1] === "1" && /already have twice/.test(b[2]), b.slice(1));
    await p.close();
    b = await buyOf("?sel=butter&child=edit&field=shop"); p = b[0];
    ok(`${tag} no minimum keeps the fallback: what you have now (250 g)`, b[1] === "250" && /Starts from what you have/.test(b[2]), b.slice(1));
    await p.close();
    b = await buyOf("?sel=carrots&child=edit&field=shop"); p = b[0];
    ok(`${tag} no minimum, one bag: starts at 1`, b[1] === "1", b.slice(1));
    await p.close();

    /* 8b. a hand-set level never adds the item to the list; the manual add stays an explicit action */
    p = await open("?sel=tom&child=edit&field=level");
    await p.click('#ef-s-level [data-v="Running low"]'); await p.click('#ef-s-level [data-v="Out"]');
    ok(`${tag} picking Running low or Out does not put the item on the list`, (await p.evaluate(() => IEF.items.filter(i => i.id === "tom")[0].list)) === null && /Not on the shopping list/.test(await p.innerText("#ef-s-shop")));
    await p.close();
    p = await open("?sel=tom");
    await p.click('[data-ief="shopquick"]');
    ok(`${tag} the item flyout's Add to shopping is still the explicit way on`, (await p.evaluate(() => IEF.items.filter(i => i.id === "tom")[0].list)) !== null);
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
      const src = ["flows/household/app.js", "flows/household/styles.css", "fragments/item-edit-flyout/flyout.js", "fragments/item-edit-flyout/flyout.css", "fragments/item-sheet/index.html"].map(f => readFileSync(new URL("../" + f, import.meta.url), "utf8")).join("\n");
      ok(`${tag} no level drop is left in the household flow, the flyout or the item-sheet options`, !/levelDrop|class="drop|IEF\.drop|\.drop\.lv|clipPath id="dc/.test(src));
    }

    /* 9. Category and Unit: chips plus free text for anything not in the list (decisions 91, 98) */
    p = await open("?sel=eggs&child=edit&field=cat");
    await scrollTo(p, "#ef-s-cat");
    await p.fill('[data-f="cat"]', "Pet food"); await p.press('[data-f="cat"]', "Enter");
    ok(`${tag} category: a word not in the list is kept (free text)`, (await p.inputValue('[data-f="cat"]')) === "Pet food" && /· Pet food/.test(await p.innerText("#ief-list")), await p.inputValue('[data-f="cat"]'));
    ok(`${tag} category: it is a chip from then on, chosen`, (await p.locator('#ef-s-cat .ef-chip.on').innerText()) === "Pet food");
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
    ok(`${tag} Add: a typed category is a chip, chosen`, (await p.locator("#ef-s-cat .ef-chip.on").innerText()) === "Pet food");
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

    /* 9b. key hints are shown on the icons (decision 68, confirmed) */
    p = await open("?sel=eggs");
    if (kind === "desktop") ok(`${tag} key hints shown on the pencil and the clock`, (await p.evaluate(() => document.querySelector("#ief-app").dataset.hint)) === "show" && (await p.locator("#ief-head .ib .kbd.cap:visible").allInnerTexts()).join("|") === "E|,", await p.locator("#ief-head .ib .kbd.cap").allInnerTexts());
    else ok(`${tag} no key hints on a phone or tablet`, (await p.locator("#ief-head .kbd").count()) === 0);
    await p.close();

    /* 6. keys (desktop only), layout and size */
    if (kind === "desktop") {
      p = await open("?sel=eggs");
      await p.keyboard.press("e"); await p.waitForSelector("#ief-child .ef");
      ok(`${tag} E opens the edit flyout`, (await p.locator("#ief-child:visible").count()) === 1);
      await p.click("#ef-emo"); await p.waitForSelector("[data-epi]"); await p.keyboard.type("de");
      ok(`${tag} letters do nothing while typing in the emoji search`, (await p.locator("#ief-child:visible").count()) === 1 && (await p.inputValue("[data-epi]")) === "de");
      await p.keyboard.press("Escape"); await p.keyboard.press(",");
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
    await ctx.close();
  }
}
await browser.close();
console.log(fails ? `${fails} of ${total} checks FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
