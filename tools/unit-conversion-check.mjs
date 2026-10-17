// Behaviour + layout check for fragments/unit-conversion (headless Chromium): Kitchie #800, switching an item's unit converts the quantity AND the minimum.
// Covers the conversion helper (convert.js), the quiet conversion, the ask (no known rate), the rounds-to-zero warning, Undo, rows of one name combined, and the layout at 390, 360 and 1280 px, light and dark.
// Usage:  python3 -m http.server 8130 &   then   node tools/unit-conversion-check.mjs [shotsDir]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8130/fragments/unit-conversion/app.html";
const shots = process.argv[2] || "";
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const norm = s => String(s).replace(/ /g, " ").replace(/\s+/g, " ").trim();
const val = (p, sel) => p.locator(sel).first().inputValue();
const txt = async (p, sel) => norm(await p.locator(sel).first().innerText());
const has = (p, sel) => p.locator(sel).count().then(n => n > 0);
const lvl = p => p.locator(".lvpick .opt.on .sr-only").innerText();
const box = (p, sel) => p.locator(sel).first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; });

// ---- 0. the helper itself (the same numbers the server's quantity.ts must give; test/quantity-parity.test.ts in the build)
{
  const p = await (await browser.newContext()).newPage(); await p.goto(BASE);
  const r = await p.evaluate(() => { const U = window.UCV; return {
    gkg: U.convert(500, "g", "kg"), kgg: U.convert(1.5, "kg", "g"), third: U.convert(333, "g", "kg"), one: U.convert(1, "g", "kg"), tiny: U.convert(0.4, "g", "kg"), lose: U.losesAll(0.4, "g", "kg"), loseOne: U.losesAll(1, "g", "kg"),
    ml: U.convert(750, "mL", "L"), cross: U.convert(500, "g", "mL"), count: U.convert(4, "tin", "kg"), same: U.convert(4, "tin", "tin"), dec: [U.decimals("g", "kg"), U.decimals("kg", "g"), U.decimals("mL", "L")],
    f: [U.factor("g", "kg"), U.factor("kg", "g"), U.factor("g", "mL"), U.factor("tin", "pack")], m: [U.match("kilos"), U.match("ml"), U.match("Tins"), U.match("L"), U.match("cup")],
    tog: U.together([{ amount: 250, unit: "g", min: 200 }, { amount: 1, unit: "kg", min: 0.5 }]), tog2: U.together([{ amount: 2, unit: "tin", min: 1 }, { amount: 1, unit: "kg", min: 0 }]), one1: U.together([{ amount: 1, unit: "g", min: 0 }]),
    lv: [U.level(0, 3), U.level(5, 0), U.level(8, 4), U.level(5, 4), U.level(4, 4), U.level(12, 4)], say: U.say(1500, "g") } });
  ok("helper: 500 g is 0.5 kg", r.gkg === 0.5, r.gkg); ok("helper: 1.5 kg is 1500 g", r.kgg === 1500, r.kgg); ok("helper: 333 g is 0.333 kg (three decimals, UC-D4)", r.third === 0.333, r.third);
  ok("helper: 1 g is exactly 0.001 kg, not zero (UC-Q3)", r.one === 0.001 && r.loseOne === false, [r.one, r.loseOne]); ok("helper: 0.4 g to kg rounds to zero and is reported (UC-D5)", r.tiny === 0 && r.lose === true, [r.tiny, r.lose]);
  ok("helper: 750 mL is 0.75 L", r.ml === 0.75, r.ml); ok("helper: a count unit or another kind has no rate (null, never a relabel)", r.cross === null && r.count === null, [r.cross, r.count]); ok("helper: same unit is the same number", r.same === 4);
  ok("helper: decimals come from the factor (1000 is 3)", r.dec.join() === "3,3,3", r.dec); ok("helper: factors", r.f[0] === 0.001 && r.f[1] === 1000 && r.f[2] === null && r.f[3] === null, r.f);
  ok("helper: unit spelling", r.m.join() === "kg,mL,tin,L,cup", r.m);
  ok("helper: rows of one name combine in the smaller unit, the larger minimum (UC-D7)", r.tog && r.tog.unit === "g" && r.tog.amount === 1250 && r.tog.min === 500, r.tog);
  ok("helper: rows that cannot be added are not combined", r.tog2 === null && r.one1 === null);
  ok("helper: level rules", r.lv.join() === "Out,Plenty,Some,Some,Running low,Plenty", r.lv); ok("helper: number and unit are joined by a no-break space", r.say === "1500 g");
}

// ---- the build can match this: every ef-* / lvpick class the page uses exists in item-edit-flyout/flyout.css, except the new #800 ones
{
  const css = readFileSync(new URL("../fragments/item-edit-flyout/flyout.css", import.meta.url), "utf8"), ucjs = readFileSync(new URL("../fragments/unit-conversion/uc.js", import.meta.url), "utf8"), uccss = readFileSync(new URL("../fragments/unit-conversion/uc.css", import.meta.url), "utf8");
  const used = [...new Set([...ucjs.matchAll(/\b(ef-[a-z0-9]+)/g)].map(m => m[1]))];
  const NEW = ["ef-conv", "ef-convh", "ef-convt", "ef-convb", "ef-convin", "ef-conv2", "ef-also", "ef-convnote", "ef-minunit", "ef-s", "ef-chip"];
  const missing = used.filter(c => !css.includes("." + c) && !NEW.includes(c) && !uccss.includes("." + c));
  ok("markup: every ef-* class used is in flyout.css or is one of the new #800 classes", missing.length === 0, missing);
  ok("tokens: uc.css has no raw colours", !/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(uccss.replace(/\/\*[\s\S]*?\*\//g, "")), "");
  ok("tokens: uc.css has no size rules for screens (only the two host rules)", (uccss.match(/@media/g) || []).length === 2);
}

for (const [vw, vh, label] of [[390, 844, "390"], [360, 780, "360"], [1280, 800, "1280"]]) for (const mode of ["light", "dark"]) {
  const theme = mode === "dark" ? "kitchie" : "kitchie-day", tag = `${label} ${mode}`;
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, colorScheme: mode });
  const errs = [];
  const open = async (qs = "") => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(`${BASE}?theme=${theme}&${qs}`); await p.waitForSelector(".ef"); return p; };
  const snap = async (p, name) => { if (shots) await p.screenshot({ path: `${shots}/unit-conversion-${name}-${label}-${mode}.png` }); };
  const noScroll = async (p, n) => ok(`${tag} ${n}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const inView = async (p, sel, n) => { const b = await box(p, sel); ok(`${tag} ${n}: inside the width`, b.x >= -1 && b.r <= vw + 1, b); };
  const targets = async (p, sel, n) => { const hs = await p.locator(sel).evaluateAll(es => es.filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)); ok(`${tag} ${n}: targets are 44px or more`, hs.length > 0 && hs.every(h => h >= 43.5), hs); };

  // ---- rest
  { const p = await open("item=yog");
    ok(`${tag} rest: Edit item sheet`, (await txt(p, "#ief-ctitle h2")) === "Edit item");
    ok(`${tag} rest: 500 g, minimum 250 g, Some`, (await val(p, "[data-f=amount]")) === "500" && (await val(p, "[data-f=unit]")) === "g" && (await val(p, "[data-f=min]")) === "250" && (await lvl(p)) === "Some");
    ok(`${tag} rest: no card`, !(await has(p, ".ef-conv")) && !(await has(p, ".ef-also")));
    ok(`${tag} rest: the Edit sheet is the flyout (ief-child, cbody, ef-sec)`, (await has(p, "aside.ief-child .cbody .ef .ef-sec")));
    if (vw >= 1024) { const c = await box(p, "#ief-child"), l = await box(p, "#uc-list"); ok(`${tag} rest: Edit in the right lane, list on the left`, c.x >= 800 && l.r <= c.x, [c.x, l.r]); ok(`${tag} rest: rail shown, tab bar hidden`, (await p.locator(".rail").isVisible()) && !(await p.locator(".tabbar").isVisible())); }
    else { const c = await box(p, "#ief-child"); ok(`${tag} rest: a bottom sheet`, Math.abs(c.b - vh) <= 2 && c.w >= vw - 1, c); ok(`${tag} rest: rail hidden`, !(await p.locator(".rail").isVisible())); }
    await noScroll(p, "rest"); await snap(p, "1-rest"); await p.close(); }

  // ---- known conversion: g to kg, quantity AND minimum, level unchanged, in place, Undo
  { const p = await open("item=yog");
    await p.click('[data-ef=unitchip][data-v="kg"]');
    ok(`${tag} g to kg: quantity 0.5`, (await val(p, "[data-f=amount]")) === "0.5"); ok(`${tag} g to kg: minimum 0.25`, (await val(p, "[data-f=min]")) === "0.25");
    ok(`${tag} g to kg: the unit box and the minimum's unit read kg`, (await val(p, "[data-f=unit]")) === "kg" && (await txt(p, "#ef-minunit")) === "kg");
    ok(`${tag} g to kg: the level did not change (lockstep)`, (await lvl(p)) === "Some", await lvl(p));
    const c = await txt(p, ".ef-conv.done"); ok(`${tag} g to kg: the line names both numbers`, /Converted 500 g to 0\.5 kg\./.test(c) && /Minimum 250 g to 0\.25 kg\./.test(c) && /Undo/.test(c), c);
    ok(`${tag} g to kg: done card is a status, in the Quantity group, nothing opens over the form`, (await has(p, "#ef-s-qty .ef-conv.done[role=status]")) && (await p.locator("dialog,[aria-modal=true]:not(.ief-child):not(.panel)").count()) === 0);
    ok(`${tag} g to kg: the list row follows in place`, /0\.5 kg/.test(await txt(p, ".rw.sel .mt")));
    ok(`${tag} g to kg: Saved shows`, /Saved/.test(await txt(p, "#ief-saved")));
    await inView(p, ".ef-conv.done", "g to kg"); await targets(p, ".ef-conv.done .ef-clear", "g to kg Undo"); await noScroll(p, "g to kg"); await snap(p, "2-known");
    await p.click("[data-ef=convundo]");
    ok(`${tag} Undo: 500 g and 250 g back`, (await val(p, "[data-f=amount]")) === "500" && (await val(p, "[data-f=unit]")) === "g" && (await val(p, "[data-f=min]")) === "250" && !(await has(p, ".ef-conv.done")));
    // there and back again through the typed box ("kilos"), then back to g
    await p.fill("[data-f=unit]", "kilos"); await p.press("[data-f=unit]", "Enter");
    ok(`${tag} typed "kilos" is kg and converts`, (await val(p, "[data-f=unit]")) === "kg" && (await val(p, "[data-f=amount]")) === "0.5");
    await p.click('[data-ef=unitchip][data-v="g"]');
    ok(`${tag} kg back to g is exact`, (await val(p, "[data-f=amount]")) === "500" && (await val(p, "[data-f=min]")) === "250");
    await p.close(); }
  { const p = await open("item=rice&to=g");
    ok(`${tag} kg to g: 5000 g, minimum 2000 g`, (await val(p, "[data-f=amount]")) === "5000" && (await val(p, "[data-f=min]")) === "2000" && /Converted 5 kg to 5000 g\./.test(await txt(p, ".ef-conv.done")), await txt(p, ".ef-conv.done"));
    await p.close(); }
  { const p = await open("item=yog&to=kg");  // typing a number is a correction, never converted (UC-P7)
    await p.fill("[data-f=amount]", "0.8"); await p.press("[data-f=amount]", "Tab");
    ok(`${tag} a typed amount is a correction`, (await val(p, "[data-f=amount]")) === "0.8" && (await val(p, "[data-f=min]")) === "0.25" && !(await has(p, ".ef-conv")));
    await p.close(); }

  // ---- no known rate: it asks the real count (UC-D3), nothing stored until answered
  { const p = await open("item=tom&to=kg");
    ok(`${tag} ask: the card is a labelled group and nothing is converted yet`, (await has(p, "#ef-s-qty .ef-conv.ask[role=group]")) && (await val(p, "[data-f=amount]")) === "4" && (await val(p, "[data-f=unit]")) === "tin" && (await val(p, "[data-f=min]")) === "4");
    const t = await txt(p, ".ef-conv.ask"); ok(`${tag} ask: says there is no fixed rate and asks for the count in kg`, /no fixed rate between tin and kg/.test(t) && /How many kg is your 4 tin\?/.test(t), t);
    ok(`${tag} ask: the tapped unit is outlined, the quantity and minimum are disabled`, (await p.locator('.ef-chip.pend[data-v="kg"]').count()) === 1 && (await p.locator("[data-f=amount]").isDisabled()) && (await p.locator("[data-f=min]").isDisabled()));
    ok(`${tag} ask: Convert is off until a number is typed`, await p.locator("[data-ef=convok]").isDisabled());
    await p.type("[data-f=convn]", "1.6");
    ok(`${tag} ask: Convert on, the minimum follows live`, !(await p.locator("[data-ef=convok]").isDisabled()) && /Minimum 4 tin becomes 1\.6 kg at the same rate/.test(await txt(p, "#ef-convnote")), await txt(p, "#ef-convnote"));
    await inView(p, ".ef-conv.ask", "ask"); await targets(p, ".ef-conv.ask .btn, .ef-conv.ask input", "ask"); await noScroll(p, "ask"); await snap(p, "3-ask");
    await p.click("[data-ef=convok]");
    ok(`${tag} ask: converted by the person's count, minimum at the same rate`, (await val(p, "[data-f=amount]")) === "1.6" && (await val(p, "[data-f=unit]")) === "kg" && (await val(p, "[data-f=min]")) === "1.6" && /Your count: 4 tin is 1\.6 kg\./.test(await txt(p, ".ef-conv.done")), await txt(p, ".ef-conv.done"));
    ok(`${tag} ask: the level is the same after (Running low, 1.6 against 1.6)`, (await lvl(p)) === "Running low", await lvl(p));
    await p.click("[data-ef=convundo]"); ok(`${tag} ask: Undo gives 4 tin, 4`, (await val(p, "[data-f=amount]")) === "4" && (await val(p, "[data-f=unit]")) === "tin" && (await val(p, "[data-f=min]")) === "4");
    await p.close(); }
  { const p = await open("item=tom"); await p.click('[data-ef=unitchip][data-v="kg"]');
    ok(`${tag} ask: the number field has focus`, await p.evaluate(() => document.activeElement.dataset.f === "convn"));
    await p.click("[data-ef=convcancel]");
    ok(`${tag} ask: Keep tin changes nothing`, (await val(p, "[data-f=amount]")) === "4" && (await val(p, "[data-f=unit]")) === "tin" && (await val(p, "[data-f=min]")) === "4" && !(await has(p, ".ef-conv")) && !(await p.locator("[data-f=amount]").isDisabled()));
    await p.click('[data-ef=unitchip][data-v="kg"]'); await p.fill("[data-f=convn]", "1.6"); await p.press("[data-f=convn]", "Enter");
    ok(`${tag} ask: Enter in the field converts`, (await val(p, "[data-f=unit]")) === "kg" && (await val(p, "[data-f=amount]")) === "1.6");
    await p.close(); }
  { const p = await open("item=tom&to=kg&ask=two&n=1.6&m=1.2");
    ok(`${tag} ask (two numbers): two fields, both needed`, (await p.locator(".ef-conv.ask .ef-convin").count()) === 2 && !(await p.locator("[data-ef=convok]").isDisabled()));
    await p.click("[data-ef=convok]"); ok(`${tag} ask (two numbers): quantity 1.6, minimum 1.2`, (await val(p, "[data-f=amount]")) === "1.6" && (await val(p, "[data-f=min]")) === "1.2");
    await snap(p, "3b-two"); await p.close(); }
  { const p = await open("item=tom0&to=kg");
    ok(`${tag} ask (quantity 0): only the minimum is asked`, (await p.locator(".ef-conv.ask [data-f=convm]").count()) === 1 && (await p.locator(".ef-conv.ask [data-f=convn]").count()) === 0 && /minimum of 2 tin/.test(await txt(p, ".ef-conv.ask")));
    await p.fill("[data-f=convm]", "0.8"); await p.click("[data-ef=convok]"); ok(`${tag} ask (quantity 0): 0 kg, minimum 0.8`, (await val(p, "[data-f=amount]")) === "0" && (await val(p, "[data-f=min]")) === "0.8" && (await val(p, "[data-f=unit]")) === "kg");
    await p.close(); }
  { const p = await open("item=yog&to=mL");
    ok(`${tag} ask: another kind (g to mL) asks too, never converts`, (await has(p, ".ef-conv.ask")) && /no fixed rate between g and mL/.test(await txt(p, ".ef-conv.ask")) && (await val(p, "[data-f=amount]")) === "500");
    await p.close(); }

  // ---- rounds to zero: the warning (UC-D5)
  { const p = await open("item=saffron&to=kg");
    ok(`${tag} warn: an alert, nothing changed yet`, (await has(p, "#ef-s-qty .ef-conv.warn[role=alert]")) && (await val(p, "[data-f=amount]")) === "2" && (await val(p, "[data-f=unit]")) === "g" && (await val(p, "[data-f=min]")) === "0.4");
    const t = await txt(p, ".ef-conv.warn"); ok(`${tag} warn: names the minimum, its value and what happens`, /The minimum 0\.4 g is 0\.0004 kg/.test(t) && /kept to 3 decimals/.test(t) && /become 0 \(no minimum\)/.test(t) && !/The quantity/.test(t), t);
    await p.click('[data-ef=convkeep]'); await p.click('[data-ef=unitchip][data-v="kg"]');
    ok(`${tag} warn: Keep g has the focus and is the filled button`, await p.evaluate(() => document.activeElement.dataset.ef === "convkeep") && (await p.locator(".ef-conv.warn .btn.pri").innerText()) === "Keep g");
    await inView(p, ".ef-conv.warn", "warn"); await targets(p, ".ef-conv.warn .btn", "warn"); await noScroll(p, "warn"); await snap(p, "4-warn");
    await p.click("[data-ef=convkeep]"); ok(`${tag} warn: Keep g changes nothing`, (await val(p, "[data-f=amount]")) === "2" && (await val(p, "[data-f=unit]")) === "g" && (await val(p, "[data-f=min]")) === "0.4" && !(await has(p, ".ef-conv")));
    await p.click('[data-ef=unitchip][data-v="kg"]'); await p.click("[data-ef=convgo]");
    ok(`${tag} warn: Switch anyway converts, the minimum becomes none and says so`, (await val(p, "[data-f=unit]")) === "kg" && (await val(p, "[data-f=amount]")) === "0.002" && (await val(p, "[data-f=min]")) === "" && /Minimum 0\.4 g is now none/.test(await txt(p, ".ef-conv.done")), await txt(p, ".ef-conv.done"));
    await p.click("[data-ef=convundo]"); ok(`${tag} warn: Undo restores the minimum`, (await val(p, "[data-f=min]")) === "0.4" && (await val(p, "[data-f=amount]")) === "2");
    await p.close(); }

  // ---- rows of one name, mixed units (UC-D7)
  { const p = await open("item=flour");
    const t = await txt(p, ".ef-also"); ok(`${tag} mixed: names the other row, the total in g and the larger minimum`, /Also held: 1 kg in Pantry \(minimum 0\.5 kg\)\. Together 1250 g/.test(t) && /larger minimum, 500 g/.test(t), t);
    ok(`${tag} mixed: the level reads from the total (Plenty, not Some)`, (await lvl(p)) === "Plenty", await lvl(p));
    await inView(p, ".ef-also", "mixed"); await noScroll(p, "mixed"); await snap(p, "5-mixed");
    await p.click('[data-ef=unitchip][data-v="kg"]');
    const t2 = await txt(p, ".ef-also"); ok(`${tag} mixed: switch this row to kg, the total is shown in kg (the smaller unit among the rows)`, /Together 1\.25 kg/.test(t2) && /larger minimum, 0\.5 kg/.test(t2) && (await val(p, "[data-f=amount]")) === "0.25" && (await val(p, "[data-f=min]")) === "0.2", t2);
    await p.close(); }
  { const p = await open("item=butter"); ok(`${tag} a single row has no combined block`, !(await has(p, ".ef-also"))); await p.click('[data-ef=unitchip][data-v="kg"]'); ok(`${tag} no minimum: 250 g is 0.25 kg and the minimum stays none`, (await val(p, "[data-f=amount]")) === "0.25" && (await val(p, "[data-f=min]")) === "" && !/Minimum/.test(await txt(p, ".ef-conv.done")), await txt(p, ".ef-conv.done")); await p.close(); }
  { const p = await open("item=yog"); await p.click('[data-ef=unitchip][data-v=""]'); ok(`${tag} No unit: relabel only, said so (UC-P8)`, (await val(p, "[data-f=unit]")) === "" && (await val(p, "[data-f=amount]")) === "500" && /number stays 500/.test(await txt(p, ".ef-conv.done")), await txt(p, ".ef-conv.done")); await p.close(); }
  if (vw >= 1024) { const p = await open("item=yog"); await p.click("[data-ief=open][data-id=tom]"); ok(`${tag} picking another row opens it in place`, (await val(p, "[data-f=unit]")) === "tin" && /Chopped tomatoes/.test(await txt(p, "#uc-ctitle"))); await p.close(); }
  ok(`${tag}: no page errors`, errs.length === 0, errs);
  await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} of ${total} checks FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
