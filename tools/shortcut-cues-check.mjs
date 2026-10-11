// Behaviour check for fragments/shortcut-cues (headless Chromium): Shift+? from several screens, from inside a flyout and a modal, never in a text box, IME and non-US layouts, cue peek, no clash with Ctrl/Cmd+Esc.
// Usage:  python3 -m http.server 8124 &   then   node tools/shortcut-cues-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8124/fragments/shortcut-cues/demo.html";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
for (const [w, h] of [[390, 844], [1024, 768], [1440, 900]]) for (const mode of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, mode === "dark" ? "kitchie" : "kitchie-day");
  const errs = [];
  const open = async (q = "") => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(BASE + q); await p.waitForTimeout(100); return p; };
  const shown = p => p.evaluate(() => { const k = document.getElementById("kb"); return !!k && !k.hidden; });
  const tag = `${w} ${mode}`;
  for (const scr of ["pantry", "plan", "history", "settings", "household"]) {
    const p = await open(`?screen=${scr}`);
    await p.keyboard.press("Shift+?"); ok(`${tag} ${scr}: Shift+? opens the list`, await shown(p));
    ok(`${tag} ${scr}: list names the screen`, (await p.locator("#kbscreen").innerText()).length > 4);
    ok(`${tag} ${scr}: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await p.keyboard.press("Shift+?"); ok(`${tag} ${scr}: Shift+? again closes`, !(await shown(p)));
    await p.keyboard.press("h"); ok(`${tag} ${scr}: H opens`, await shown(p));
    await p.keyboard.press("Control+Escape"); ok(`${tag} ${scr}: Ctrl+Esc closes the list first`, !(await shown(p)));
    await p.close();
  }
  { const p = await open("?screen=pantry&fly=1");
    await p.keyboard.press("Shift+?"); ok(`${tag} flyout: opens`, await shown(p));
    ok(`${tag} flyout: shows the flyout's keys`, (await p.locator("#kb").innerText()).includes("Edit the open item"));
    await p.keyboard.press("Shift+?"); ok(`${tag} flyout: still open after list closes`, await p.locator("#fly").isVisible());
    await p.close(); }
  { const p = await open("?screen=pantry&add=1");
    ok(`${tag} modal: focus is in the name box`, await p.evaluate(() => document.activeElement.id === "addname"));
    await p.keyboard.type("Why?"); ok(`${tag} modal: ? types a ? in the box`, (await p.inputValue("#addname")) === "Why?" && !(await shown(p)));
    await p.keyboard.press("H"); ok(`${tag} modal: H types in the box too`, (await p.inputValue("#addname")) === "Why?H" && !(await shown(p)));
    await p.evaluate(() => document.getElementById("chk").focus());
    await p.keyboard.press("Shift+?"); ok(`${tag} modal: a checkbox is not typing`, await shown(p));
    await p.keyboard.press("Control+Escape"); ok(`${tag} modal: Ctrl+Esc closes the list, not the modal`, !(await shown(p)) && await p.locator("#modal").isVisible());
    await p.keyboard.press("Control+Escape"); ok(`${tag} modal: second Ctrl+Esc closes the modal`, !(await p.locator("#modal").isVisible()));
    await p.close(); }
  { const p = await open("?screen=settings");
    await p.focus("#nm"); await p.keyboard.type("a?b"); ok(`${tag} settings: ? types in the household name`, (await p.inputValue("#nm")) === "a?b" && !(await shown(p)));
    await p.evaluate(() => document.activeElement.blur());
    // IME: composing keydown and keyCode 229 are ignored
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", isComposing: true, bubbles: true })));
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", keyCode: 229, bubbles: true })));
    ok(`${tag} IME: composing presses are ignored`, !(await shown(p)));
    // non-US layouts: judged by the character produced, whatever physical key and modifiers made it
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", code: "Comma", shiftKey: true, bubbles: true })));
    ok(`${tag} layout: ? from Shift+Comma (French) opens`, await shown(p));
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", code: "Minus", shiftKey: true, bubbles: true })));
    ok(`${tag} layout: ? from Shift+Minus (German) toggles it closed`, !(await shown(p)));
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "/", code: "Slash", shiftKey: false, bubbles: true })));
    ok(`${tag} layout: a plain / is not a ?`, !(await shown(p)));
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", ctrlKey: true, bubbles: true })));
    ok(`${tag} Ctrl+? is left alone`, !(await shown(p)));
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", repeat: true, bubbles: true })));
    ok(`${tag} a held key does not flicker`, !(await shown(p)));
    await p.close(); }
  { // cues switched off: Shift+? turns them on for this visit, the saved switch stays Off
    const p = await open("?screen=pantry"); await p.evaluate(() => localStorage.setItem("cues", "off")); await p.reload(); await p.waitForTimeout(100);
    ok(`${tag} cues off: chips hidden`, !(await p.locator("#addbtn .kbd").isVisible()));
    await p.keyboard.press("Shift+?");
    ok(`${tag} cues off: Shift+? shows them`, await p.evaluate(() => !document.body.classList.contains("nocues")));
    ok(`${tag} cues off: the list says they were off`, (await p.locator("#kb .peek").count()) === 1);
    ok(`${tag} cues off: the switch still reads Off`, (await p.locator("#kb .sw2").getAttribute("aria-checked")) === "false");
    await p.keyboard.press("Shift+?");
    ok(`${tag} cues off: cues stay on after the list closes`, await p.locator("#addbtn .kbd").isVisible());
    await p.reload(); await p.waitForTimeout(100);
    ok(`${tag} cues off: back to Off on the next page`, !(await p.locator("#addbtn .kbd").isVisible()));
    await p.keyboard.press("Shift+?"); await p.locator("#kb .sw2").click();
    await p.keyboard.press("Control+Escape"); await p.reload(); await p.waitForTimeout(100);
    ok(`${tag} cues off: the switch turns them on for good`, await p.locator("#addbtn .kbd").isVisible());
    await p.evaluate(() => localStorage.removeItem("cues")); await p.close(); }
  ok(`${tag} no console errors`, errs.length === 0, errs);
  await ctx.close();
}
await browser.close();
console.log(fails ? `${fails} of ${total} FAILED` : `all ${total} passed`);
process.exit(fails ? 1 : 0);
