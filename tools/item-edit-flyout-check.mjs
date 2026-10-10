// Behaviour and layout check for fragments/item-edit-flyout (headless Chromium). Not a screenshot tool: it clicks and types through the flows and prints PASS or FAIL for each.
// Usage:  python3 -m http.server 8123 &   then   node tools/item-edit-flyout-check.mjs [--shots=dir]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers). Screenshots are written only when --shots is given (they are not kept in the repo).
// Covers (11 Oct 2026 round): the level control and the override rule, the two shopping states, Location / Spot / Category suggestion lists and the category chip row, the emoji picker in Edit and Add,
// the keys, no console errors, no sideways scroll, in light and dark, at phone, tablet and desktop widths.
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
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} quantity revised: back to automatic Plenty`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-level [data-v="Some"]'); await p.click('#ef-s-min [data-key="min"][data-d="1"]');
    ok(`${tag} a minimum change keeps the pick`, (await lvl(p)) === "Some" && (await cue(p)) === "Set by you", [await lvl(p), await cue(p)]);
    await p.click(".ef-auto");
    ok(`${tag} "go back to automatic" works`, (await cue(p)) === "Automatic", await cue(p));
    await p.click('#ef-s-level [data-v="Out"]');
    ok(`${tag} Out sets the amount to 0`, (await p.inputValue('[data-f="amount"]')) === "0" && (await lvl(p)) === "Out");
    await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} stock added after Out: automatic again`, (await cue(p)) === "Automatic" && (await lvl(p)) !== "Out", [await lvl(p), await cue(p)]);
    ok(`${tag} no console errors (level)`, errs.length === 0, errs); errs.length = 0; await p.close();

    /* 2. weighed with a minimum: automatic; weighed without one and worded: four icons, no cue */
    p = await open("?sel=yog&child=edit");
    ok(`${tag} weighed with minimum: automatic Some`, (await lvl(p)) === "Some" && (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.click('#ef-s-level [data-v="Plenty"]');
    ok(`${tag} weighed override`, (await lvl(p)) === "Plenty" && (await cue(p)) === "Set by you");
    await p.click('#ef-s-qty [data-key="amount"][data-d="-1"]');
    ok(`${tag} weighed: quantity revised, automatic again`, (await cue(p)) === "Automatic", [await lvl(p), await cue(p)]);
    await p.close();
    p = await open("?sel=butter&child=edit");
    ok(`${tag} weighed, no minimum: four icons, no cue`, (await p.locator("#ef-s-level .opt").count()) === 4 && (await cue(p)) === "");
    await p.click('#ef-s-level [data-v="Some"]'); await p.click('#ef-s-qty [data-key="amount"][data-d="1"]');
    ok(`${tag} weighed, no minimum: the pick stays`, (await lvl(p)) === "Some");
    await p.close();
    p = await open("?sel=spinach&child=edit");
    ok(`${tag} worded: four icons, no cue`, (await p.locator("#ef-s-level .opt").count()) === 4 && (await cue(p)) === "");
    await p.close();

    /* 3. the two shopping states */
    p = await open("?sel=eggs&child=edit&field=shop");
    ok(`${tag} shop with a quantity: stepper, no own-words box`, (await p.locator('#ef-s-shop [data-f="buy"]').count()) === 1 && (await p.locator('#ef-s-shop [data-f="shop"]').count()) === 0);
    await shot(p, "shop-quantity");
    await p.click('#ef-s-shop [data-key="buy"][data-d="1"]'); await p.click('[data-ef="shopsave"]');
    ok(`${tag} shop: Add saves the number in the item's unit`, /On the shopping list: 13/.test(await p.innerText("#ef-s-shop")) && /Update the shopping list/.test(await p.innerText("#ef-s-shop")), await p.innerText("#ef-s-shop"));
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
    ok(`${tag} category chips drawn, chevron when more than one line`, (await p.locator(".ef-chip").count()) >= 8 && (await p.locator(".ef-cx:visible").count()) === 1);
    const h1 = (await p.locator(".ef-cl").boundingBox()).height; await p.click(".ef-cx"); const h2 = (await p.locator(".ef-cl").boundingBox()).height;
    ok(`${tag} chevron shows the rest`, h2 > h1 + 20, [h1, h2]); await shot(p, "chips-open");
    await p.click(".ef-cx");
    await p.click('.ef-chip:has-text("Vegetables")');
    ok(`${tag} chip picks the category`, (await p.inputValue('[data-f="cat"]')) === "Vegetables" && (await p.locator('.ef-chip.on').innerText()) === "Vegetables");
    await p.click('.ef-chip.on');
    ok(`${tag} chip again clears it`, (await p.inputValue('[data-f="cat"]')) === "");
    await p.fill('[data-f="cat"]', "pick");
    ok(`${tag} typing filters the chips and offers a new category`, (await p.locator(".ef-chip").count()) === 0 && !(await p.locator(".ef-newcat").isHidden()));
    await p.press('[data-f="cat"]', "Enter");
    ok(`${tag} Enter adds a new category`, (await p.inputValue('[data-f="cat"]')) === "pick" && /· pick/.test(await p.innerText("#ief-list")), await p.inputValue('[data-f="cat"]'));
    await p.close();
    p = await open("?sel=eggs&child=edit&field=cat&cat=list");
    await scrollTo(p, "#ef-s-cat"); await p.click('[data-f="cat"]');
    ok(`${tag} ?cat=list gives the plain suggestion list`, (await p.locator("#cb-cat li").count()) > 5 && (await p.locator(".ef-chip").count()) === 0);
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
