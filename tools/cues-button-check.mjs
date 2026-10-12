// Behaviour check for the Cues button (fragments/desktop): one button on the rail beside Keys and one in the ? list header, pressed = on (accent), off = cues hidden; the list has no
// switch row, line or footer and does not scroll. Usage:  python3 -m http.server 8124 &   then   node tools/cues-button-check.mjs   (SHOTS=dir saves PNGs)
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8124/fragments/desktop/pantry.html?sel=butter";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await chromium.launch();
for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900]]) for (const mode of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, mode === "dark" ? "kitchie" : "kitchie-day");
  const p = await ctx.newPage(), tag = `${w} ${mode}`;
  await p.goto(BASE);
  const rail = p.locator(".rail .cuesnv"), lst = p.locator("#kb .cuesb");
  ok(`${tag}: rail Cues button beside Keys`, await rail.count() === 1 && (await p.locator(".rail .me > button").allInnerTexts()).join("|").includes("Cues"));
  ok(`${tag}: pressed by default`, await rail.getAttribute("aria-pressed") === "true");
  const chip = p.locator(".kbd").first(), col = e => e.evaluate(n => getComputedStyle(n).color);
  const accent = await p.evaluate(() => { const d = document.createElement("i"); d.style.color = "var(--accent)"; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; });
  ok(`${tag}: chip is accent when on`, await col(chip) === accent, [await col(chip), accent]);
  ok(`${tag}: hint line is accent when on`, await col(p.locator(".phint").first()) === accent);
  if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/cues-${w}-${mode}-on.png` });
  await p.keyboard.press("?");
  ok(`${tag}: list header has the Cues button`, await lst.isVisible() && await lst.getAttribute("aria-pressed") === "true");
  ok(`${tag}: no switch row, line or footer`, await p.locator("#kb .kbt, #kb .kbf, #kb .sw2").count() === 0);
  ok(`${tag}: list does not scroll (from 800 px high; a 768 px window may still need it for the rows alone)`, h < 800 || await p.locator("#kb .kbc").evaluate(n => n.scrollHeight <= n.clientHeight), await p.locator("#kb .kbc").evaluate(n => [n.scrollHeight, n.clientHeight]));
  if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/cues-${w}-${mode}-list-on.png` });
  await lst.click();
  ok(`${tag}: header button off`, await lst.getAttribute("aria-pressed") === "false");
  ok(`${tag}: rail button follows`, await rail.getAttribute("aria-pressed") === "false");
  ok(`${tag}: cues hidden`, await p.evaluate(() => document.body.classList.contains("nocues") && !document.querySelector(".kbd:not(.keep)").offsetParent));
  if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/cues-${w}-${mode}-list-off.png` });
  await p.locator("#kb .x").click();
  await rail.click();
  ok(`${tag}: rail button turns cues back on`, await rail.getAttribute("aria-pressed") === "true" && await p.evaluate(() => !document.body.classList.contains("nocues")));
  await p.reload();
  ok(`${tag}: stored on survives`, await rail.getAttribute("aria-pressed") === "true");
  { // Add key and Shift+Space on the Pantry fragment (decisions 120 to 124)
    const q = await ctx.newPage(); await q.goto(BASE); await q.evaluate(() => localStorage.removeItem("desktop-cues")); await q.reload();
    const off = () => q.evaluate(() => document.body.classList.contains("nocues")), add = () => q.locator("#af").count();
    ok(`${tag}: Add button shows + as its hint`, (await q.locator("[data-add] .kbd").innerText()) === "+");
    await q.keyboard.press("Shift+Equal"); await q.waitForTimeout(120);
    ok(`${tag}: + opens the Add window`, (await add()) === 1);
    await q.keyboard.type("a+b= "); 
    ok(`${tag}: + = and a space type in the name box`, (await q.inputValue('#af [data-a="name"]')) === "a+b= " && !(await off()));
    await q.keyboard.press("Shift+Space"); ok(`${tag}: Shift+Space in the box types a space, cues stay`, !(await off()));
    await q.keyboard.press("Control+Enter"); await q.waitForTimeout(80);
    await q.evaluate(() => document.activeElement && document.activeElement.blur());
    await q.keyboard.press("Shift+Space"); await q.waitForTimeout(80);
    ok(`${tag}: Shift+Space turns cues off; rail Cues button and stored value follow`, (await off()) && (await q.locator(".rail .cuesnv").getAttribute("aria-pressed")) === "false" && (await q.evaluate(() => localStorage.getItem("desktop-cues"))) === "0");
    ok(`${tag}: status line says "Key hints off" in a live region`, (await q.locator("#cue-status").innerText()) === "Key hints off" && (await q.locator("#cue-status").getAttribute("aria-live")) === "polite");
    await q.keyboard.press("Shift+Space"); await q.waitForTimeout(80);
    ok(`${tag}: Shift+Space turns cues back on`, !(await off()) && (await q.locator(".rail .cuesnv").getAttribute("aria-pressed")) === "true" && (await q.locator("#cue-status").innerText()) === "Key hints on");
    await q.keyboard.press("?"); await q.waitForTimeout(80);
    const txt = (await q.innerText("#kb")).replace(/\n/g, " ");
    ok(`${tag}: ? list has "+ or N" for Add and the Cues button names Shift Space`, /\+\s*or\s*N\s*Add an item/.test(txt) && /Cues\s*Shift\s+Space/.test(txt), txt.slice(0, 160));
    await q.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`${total - fails} of ${total} checks passed`); process.exit(fails ? 1 : 0);
