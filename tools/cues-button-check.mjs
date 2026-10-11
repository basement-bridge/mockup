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
  await ctx.close();
}
await browser.close();
console.log(`${total - fails} of ${total} checks passed`); process.exit(fails ? 1 : 0);
