// Behaviour check for the desktop recipe page, INLINE EDIT mockup (Kitchie #892), headless Chromium.
// Usage:  python3 -m http.server 8123 &   then   node tools/inline-edit-check.mjs      (BASE=... to point elsewhere; SHOTS=1 writes the screenshots into the folder)
// Needs playwright or playwright-core on the module path; set EXE to a Chromium binary when the default is not installed (the agent sandbox: /opt/pw-browsers/chromium-1194/chrome-linux/chrome).
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const BASE = process.env.BASE || "http://localhost:8123/fragments/recipe-detail-desktop/inline-edit/index.html";
const DIR = new URL("../fragments/recipe-detail-desktop/inline-edit/screenshots/", import.meta.url).pathname;
const SHOTS = !!process.env.SHOTS;
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch(process.env.EXE ? { executablePath: process.env.EXE } : {});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [];
async function open(ctx, q) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push("pageerror " + e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); p.on("response", r => { if (r.status() >= 400) errs.push("HTTP " + r.status() + " " + r.url()); }); await p.goto(BASE + "?" + (q ? q + "&" : "") + (/theme=/.test(q || "") ? "" : "theme=dark")); await sleep(350); return p; }
const txt = (p, sel) => p.locator(sel).first().innerText();
const focusedLabel = p => p.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute("aria-label") || a.tagName) : ""; });
const noOverflow = p => p.evaluate(() => { const d = document.documentElement; return { x: d.scrollWidth - d.clientWidth, y: d.scrollHeight - d.clientHeight }; });
const shot = async (p, name) => { if (SHOTS) await p.screenshot({ path: DIR + name + ".png" }); };

// ---------------------------------------------------------------- A. sizes: no overflow, no console errors, read and edit mode
for (const [w, h] of [[1280, 720], [1440, 900], [1920, 1080]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const tag = w + "x" + h;
  for (const r of ["typical", "short", "long", "empty"]) {
    for (const edit of [false, true]) {
      const p = await open(ctx, "r=" + r + (edit ? "&edit=1&choose=fix" : ""));
      const o = await noOverflow(p);
      ok(tag + " A " + r + (edit ? " edit" : " read") + ": the document does not scroll", o.x <= 0 && o.y <= 0, o);
      if (edit) ok(tag + " A " + r + ": edit mode is on and has its strip", (await p.locator("#estrip").count()) === 1 && (await p.locator("#rtab").getAttribute("data-edit")) === "1");
      if (SHOTS && r !== "empty") await shot(p, r + (edit ? "-edit" : "-read") + "-" + tag + "-dark");
      if (SHOTS && r === "empty" && edit) await shot(p, "empty-edit-" + tag + "-dark");
      // nothing overflows sideways inside the rail or the method either
      const inner = await p.evaluate(() => [".rail", ".meth", ".hero", ".estrip"].map(s => { const e = document.querySelector(s); return e ? e.scrollWidth - e.clientWidth : 0; }));
      ok(tag + " A " + r + ": rail, method, hero, strip have no sideways overflow", inner.every(v => v <= 1), inner);
      await p.close();
    }
  }
  for (const lane of ["1", "h"]) {   // the Notes and reactions flyout and the History flyout push the page: edit mode must still fit
    const p = await open(ctx, "r=typical&edit=1&choose=fix&lane=" + lane);
    const o = await noOverflow(p);
    ok(tag + " A lane=" + lane + " edit: the document does not scroll", o.x <= 0 && o.y <= 0, o);
    const inner = await p.evaluate(() => [".rail", ".meth", ".hero", ".estrip"].map(s => { const e = document.querySelector(s); return e ? e.scrollWidth - e.clientWidth : 0; }));
    ok(tag + " A lane=" + lane + " edit: no sideways overflow inside", inner.every(v => v <= 1), inner);
    const hh = await p.evaluate(() => Math.round(document.querySelector("#estrip").getBoundingClientRect().height));
    ok(tag + " A lane=" + lane + " edit: the strip stays on one or two lines", hh <= 100, hh);
    if (SHOTS && w === 1280) await shot(p, "typical-edit-" + (lane === "1" ? "notes-flyout" : "history-flyout") + "-" + tag + "-dark");
    await p.close();
  }
  await ctx.close();
}

// ---------------------------------------------------------------- B to N at 1440x900 (the keyboard and data behaviour does not depend on size)
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
{ // B. the keeper question gates editing
  const p = await open(ctx, "edit=1");
  ok("B: a keeper asks where changes go, nothing is chosen", (await p.locator("#esq").count()) === 1 && (await p.locator('[data-act=target][aria-pressed=true]').count()) === 0);
  ok("B: values are dimmed until it is answered", (await p.locator("#rtab").getAttribute("data-gated")) === "1");
  await p.click('[data-ed="title"]'); await sleep(120);
  ok("B: clicking a value before choosing opens no field and asks", (await p.locator(".edw").count()) === 0 && /Choose where/.test(await txt(p, "#toast")));
  await p.click('[data-act=target][data-v=own]'); await sleep(100);
  ok("B: Different dish only explains (not drawn here)", /own recipe/.test(await txt(p, "#toast")) && (await p.locator("#esq").count()) === 1);
  await p.click('[data-act=target][data-v=fix]'); await sleep(120);
  ok("B: choosing Fix this one opens editing and says revision 4", /Fixing this version, revision 4/.test(await txt(p, ".es-w")) && (await p.locator("#esq").count()) === 0);
  await shot(p, "keeper-question-1440x900-dark");
  await p.close();
  const t = await open(ctx, "edit=1&ver=trying");
  ok("B: a Trying version edits in place with no question", (await t.locator("#esq").count()) === 0 && /A try, edited in place/.test(await txt(t, ".es-w")));
  await t.close();
}
{ // C. hero fields
  const p = await open(ctx, "edit=1&choose=fix");
  await p.click('[data-ed="title"]'); await sleep(80);
  ok("C: click opens the field in place, selected", (await focusedLabel(p)) === "Name" && await p.evaluate(() => { const i = document.activeElement; return i.selectionStart === 0 && i.selectionEnd === i.value.length; }));
  await p.keyboard.type("Egg fried rice, the quick one"); await p.keyboard.press("Enter"); await sleep(120);
  ok("C: Enter saves the title", (await txt(p, "h1")) === "Egg fried rice, the quick one" && (await p.locator(".edw").count()) === 0);
  ok("C: the strip says Saved and counts one change", /Saved .* 1 change/.test(await txt(p, "#ess")), await txt(p, "#ess"));
  ok("C: the toast carries Undo", (await p.locator("#toast .tundo").count()) === 1);
  await p.click('[data-ed="title"]'); await p.keyboard.press("Control+a"); await p.keyboard.press("Delete"); await p.keyboard.press("Enter"); await sleep(100);
  ok("C: an empty title is refused, stays open with a message", (await p.locator(".edw .edmsg.err").count()) === 1 && (await p.locator(".edw .edin[aria-invalid=true]").count()) === 1);
  await shot(p, "validation-title-1440x900-dark");
  await p.keyboard.press("Escape"); await sleep(80);
  ok("C: Esc cancels and the old title is back", (await txt(p, "h1")) === "Egg fried rice, the quick one" && (await p.locator(".edw").count()) === 0);
  // serves
  await p.click('[data-ed="serves"]'); await p.keyboard.type("0"); await p.keyboard.press("Enter"); await sleep(80);
  ok("C: Serves 0 is refused", /whole number/.test(await txt(p, ".edw .edmsg")));
  await p.keyboard.press("Control+a"); await p.keyboard.type("4"); await p.keyboard.press("Enter"); await sleep(100);
  ok("C: Serves saved as 4 and the written amounts did not change", /Serves 4/.test(await txt(p, '[data-ed="serves"]')) && (await txt(p, '[data-ed="i:' + (await p.evaluate(() => window.__ie.ING[0].id)) + ':q"]')).trim() === "3");
  // time
  await p.click('[data-ed="time"]'); await p.keyboard.press("Control+a"); await p.keyboard.type("soon"); await p.keyboard.press("Enter"); await sleep(80);
  ok("C: a time that is not a time is refused", /minutes/.test(await txt(p, ".edw .edmsg")));
  await p.keyboard.press("Control+a"); await p.keyboard.type("1 h 30"); await p.keyboard.press("Enter"); await sleep(100);
  ok("C: 1 h 30 saved and shown as 1 h 30", /1 h 30/.test(await txt(p, '[data-ed="time"]')));
  // version name
  await p.click('[data-ed="vname"]'); await sleep(60);
  ok("C: renaming the version hides the chip while the field is open", await p.locator(".vwrap").evaluate(e => e.hidden));
  await p.keyboard.press("Control+a"); await p.keyboard.type("Original"); await p.keyboard.press("Enter"); await sleep(80);
  ok("C: a name another version has is refused", /already/.test(await txt(p, ".edw .edmsg")));
  await p.keyboard.press("Control+a"); await p.keyboard.type("With frozen peas"); await p.keyboard.press("Enter"); await sleep(100);
  ok("C: the version name changes in the chip and the strip", /With frozen peas/.test(await txt(p, ".vchip")) && /With frozen peas/.test(await txt(p, ".es-t")));
  await p.keyboard.press("Escape");
  // history shows every change with Undo
  await p.keyboard.press(","); await sleep(300);
  const rows = await p.locator("#hlane .hrow.mine").count();
  ok("C: History lists this session's changes, newest first, each with Undo", rows === 4 && (await p.locator("#hlane .hrow.mine .hundo").count()) === 4, rows);
  await shot(p, "history-changes-1440x900-dark");
  await p.locator('#hlane .hrow.mine .hundo').first().click(); await sleep(150);
  ok("C: Undo from History puts the old version name back and marks the row", /With peas/.test(await txt(p, ".vchip")) && (await p.locator("#hlane .hrow.undone").count()) === 1);
  await p.close();
}
{ // D. Tab flow through ingredients, Enter, quick add, remove, reorder
  const p = await open(ctx, "edit=1&choose=fix");
  const first = await p.evaluate(() => window.__ie.ING[0].id);
  await p.click('[data-ed="i:' + first + ':q"]'); await p.keyboard.type("4"); await p.keyboard.press("Tab"); await sleep(120);
  ok("D: Tab saves the amount and opens the unit", (await focusedLabel(p)) === "Unit" && (await txt(p, '[data-ed="i:' + first + ':q"]')).trim() === "4");
  await p.keyboard.press("Tab"); await sleep(60);
  ok("D: Tab again opens the name", (await focusedLabel(p)) === "Ingredient");
  await p.keyboard.press("Tab"); await sleep(60);
  ok("D: Tab again opens the next row's amount", (await focusedLabel(p)) === "Amount");
  await p.keyboard.press("Shift+Tab"); await sleep(60);
  ok("D: Shift+Tab goes back to the name", (await focusedLabel(p)) === "Ingredient");
  await p.keyboard.type("1"); await p.keyboard.press("Escape"); await sleep(60);
  ok("D: Esc cancels (name unchanged)", (await txt(p, '[data-ed="i:' + first + ':n"]')).trim() === "Eggs");
  // bad amount
  await p.click('[data-ed="i:' + first + ':q"]'); await p.keyboard.type("lots"); await p.keyboard.press("Enter"); await sleep(60);
  ok("D: a bad amount is refused with a hint", /number like/.test(await txt(p, ".edw .edmsg")));
  await p.keyboard.press("Control+a"); await p.keyboard.type("1/2"); await p.keyboard.press("Enter"); await sleep(80);
  ok("D: 1/2 is accepted as 0.5", (await txt(p, '[data-ed="i:' + first + ':q"]')).trim() === "0.5");
  // quick add
  await p.fill("[data-add=ing]", "2 tbsp tahini"); await p.keyboard.press("Enter"); await sleep(150);
  const last = await p.evaluate(() => { const a = window.__ie.ING; return a[a.length - 1]; });
  ok("D: the quick add row parses 2 tbsp tahini into amount, unit and name", last.q === 2 && last.u === "tbsp" && last.name === "tahini", last);
  ok("D: the quick add field stays focused and empty for the next one", (await focusedLabel(p)) === "Add an ingredient" || (await p.evaluate(() => document.activeElement.dataset.add)) === "ing");
  await shot(p, "ingredients-edit-1440x900-dark");
  // remove, then undo from the toast
  const n0 = await p.evaluate(() => window.__ie.ING.length);
  await p.click('[data-row="' + last.id + '"] [data-act=rm]'); await sleep(120);
  ok("D: remove takes the row off and the toast offers Undo", (await p.evaluate(() => window.__ie.ING.length)) === n0 - 1 && (await p.locator("#toast .tundo").count()) === 1);
  await p.click("#toast .tundo"); await sleep(120);
  ok("D: Undo from the toast brings it back", (await p.evaluate(() => window.__ie.ING.length)) === n0);
  // reorder by keyboard on the grip
  const ids = await p.evaluate(() => window.__ie.ING.map(x => x.id));
  await p.focus('[data-row="' + ids[0] + '"] .grip'); await p.keyboard.press("ArrowDown"); await sleep(120);
  const ids2 = await p.evaluate(() => window.__ie.ING.map(x => x.id));
  ok("D: ArrowDown on the grip moves the row down and keeps the focus on its grip", ids2[1] === ids[0] && (await p.evaluate(() => document.activeElement.classList.contains("grip"))));
  // reorder by dragging
  await p.dragAndDrop('[data-row="' + ids2[3] + '"] .grip', '[data-row="' + ids2[0] + '"]', { targetPosition: { x: 80, y: 3 } }); await sleep(200);
  const ids3 = await p.evaluate(() => window.__ie.ING.map(x => x.id));
  ok("D: dragging a grip onto the top of the first row moves it there", ids3[0] === ids2[3], ids3.slice(0, 4));
  // Ctrl+Z undoes the last change when no field is open
  await p.keyboard.press("Escape"); await p.evaluate(() => document.activeElement.blur()); await p.keyboard.press("Control+z"); await sleep(150);
  ok("D: Ctrl+Z undoes the last change (the drag)", JSON.stringify(await p.evaluate(() => window.__ie.ING.map(x => x.id))) === JSON.stringify(ids2));
  await p.close();
}
{ // E. method: text, Shift+Enter, time, add, photo, remove, reorder
  const p = await open(ctx, "edit=1&choose=fix");
  const s0 = await p.evaluate(() => window.__ie.STP[4].id);   // step 5 has no photo and a time
  await p.click('[data-ed="s:' + s0 + ':t"]'); await p.keyboard.press("End");
  await p.keyboard.press("Shift+Enter"); await p.keyboard.type("Taste."); await p.keyboard.press("Enter"); await sleep(120);
  ok("E: Shift+Enter makes a line break, Enter saves the step", (await p.evaluate(id => window.__ie.STP.find(x => x.id === id).t, s0)).includes("\nTaste."));
  await p.click('[data-ed="s:' + s0 + ':m"]'); await p.keyboard.type("9999"); await p.keyboard.press("Enter"); await sleep(60);
  ok("E: a step time over a day is refused", /1 to 1440/.test(await txt(p, ".edw .edmsg")));
  await p.keyboard.press("Control+a"); await p.keyboard.type("7"); await p.keyboard.press("Enter"); await sleep(100);
  ok("E: the step time shows beside the number", /7 min/.test(await txt(p, '[data-row="' + s0 + '"] .nbw')));
  await p.click('[data-ed="s:' + s0 + ':m"]'); await p.keyboard.press("Control+a"); await p.keyboard.press("Delete"); await p.keyboard.press("Enter"); await sleep(100);
  ok("E: an empty time removes the timer", await p.evaluate(id => window.__ie.STP.find(x => x.id === id).m === 0, s0));
  // add a step by the quick add row, then Ctrl+Enter insert
  const c0 = await p.evaluate(() => window.__ie.STP.length);
  await p.fill("[data-add=stp]", "Rest for two minutes."); await p.keyboard.press("Enter"); await sleep(150);
  ok("E: the quick add row adds a step at the end", (await p.evaluate(() => window.__ie.STP.length)) === c0 + 1 && /7 steps/.test(await txt(p, "#met .sub")));
  const s1 = await p.evaluate(() => window.__ie.STP[0].id);
  await p.click('[data-ed="s:' + s1 + ':t"]'); await p.keyboard.press("Control+Enter"); await sleep(200);
  ok("E: Ctrl+Enter saves the step and opens a new blank one right after it", (await p.evaluate(() => window.__ie.STP[1].fresh === true)) && (await focusedLabel(p)) === "Step");
  await p.keyboard.press("Escape"); await sleep(120);
  ok("E: Esc on the blank step drops it again and renumbers", (await p.evaluate(() => window.__ie.STP.length)) === c0 + 1);
  // photos
  const withPh = await p.evaluate(() => window.__ie.STP.filter(x => x.ph).length);
  await p.click('[data-row="' + s0 + '"] [data-act=addph]'); await sleep(150);
  ok("E: Add photo puts a photo on the step", (await p.evaluate(() => window.__ie.STP.filter(x => x.ph).length)) === withPh + 1);
  await p.click('[data-row="' + s0 + '"] [data-act=rmph]'); await sleep(150);
  ok("E: the x removes it again; the toast says it can be undone", (await p.evaluate(() => window.__ie.STP.filter(x => x.ph).length)) === withPh && /photo/.test(await txt(p, "#toast")));
  await p.keyboard.press("Control+z"); await sleep(150);
  // reorder + remove
  const sid = await p.evaluate(() => window.__ie.STP.map(x => x.id));
  await p.focus('[data-row="' + sid[1] + '"] .grip'); await p.keyboard.press("ArrowUp"); await sleep(150);
  ok("E: ArrowUp on a step's grip moves it up and renumbers", (await p.evaluate(() => window.__ie.STP[0].id)) === sid[1] && (await txt(p, '[data-row="' + sid[1] + '"] .nb')) === "1");
  await shot(p, "method-edit-1440x900-dark");
  await p.close();
}
{ // F. notes
  const p = await open(ctx, "edit=1&choose=fix&tab=notes");
  const own = await p.evaluate(() => window.__ie.NOTES.filter(n => !n.inh)[0].id);
  ok("F: a note inherited from the parent is read-only with a lock line", (await p.locator(".note.inh .lockn").count()) >= 1);
  await p.click('[data-ed="n:' + own + '"]'); await sleep(80);
  ok("F: a note opens as a multi-line box", (await p.locator(".edw.nt textarea").count()) === 1);
  await p.keyboard.press("Control+End"); await p.keyboard.press("Enter"); await p.keyboard.type("- thaw first"); await p.keyboard.press("Control+Enter"); await sleep(120);
  ok("F: Enter adds a line and Ctrl+Enter saves, the dash line becomes a list", await p.evaluate(id => { const n = window.__ie.NOTES.find(x => x.id === id); return n.li && n.li.includes("thaw first"); }, own));
  await p.click('[data-act=note]'); await sleep(80);
  await p.keyboard.type("Works with leftover rice too."); await p.keyboard.press("Control+Enter"); await sleep(150);
  ok("F: Add a note composes inline and Ctrl+Enter adds it", (await p.evaluate(() => window.__ie.NOTES.length)) === 6 && /Works with leftover rice/.test(await txt(p, "#p-notes")));
  const nn = await p.evaluate(() => window.__ie.NOTES.length);
  await p.click('[data-row="' + (await p.evaluate(() => window.__ie.NOTES[window.__ie.NOTES.length - 1].id)) + '"] [data-act=rm]'); await sleep(120);
  ok("F: remove takes the note off", (await p.evaluate(() => window.__ie.NOTES.length)) === nn - 1);
  await shot(p, "notes-edit-1440x900-dark");
  await p.close();
  // adding a note needs no edit mode
  const r = await open(ctx, "tab=notes");
  await r.click('[data-act=note]'); await r.keyboard.type("Read-mode note."); await r.keyboard.press("Control+Enter"); await sleep(150);
  ok("F: adding a note also works in read mode", /Read-mode note/.test(await txt(r, "#p-notes")));
  await r.close();
}
{ // G. keep both starts a new version; History and the version menu show it
  const p = await open(ctx, "edit=1&choose=both");
  ok("G: Keep both says a new version starts at the first change", /New version starts/.test(await txt(p, ".es-w")));
  await p.click('[data-ed="title"]'); await p.keyboard.type(" x"); await p.keyboard.press("Enter"); await sleep(200);
  ok("G: the first change starts the new version: chip, strip and revision 1", /With peas, edited/.test(await txt(p, ".vchip")) && /New version, a try, revision 1/.test(await txt(p, ".es-w")), await txt(p, ".es-w"));
  await p.click('[data-act=vchip]'); await sleep(80);
  ok("G: the version menu lists it as Trying, from With peas", /With peas, edited/.test(await txt(p, "[data-vpop]")) && /Trying/.test(await txt(p, "[data-vpop] .vi.on")) && /From With peas/.test(await txt(p, "[data-vpop] .vi.on")));
  await shot(p, "version-menu-new-1440x900-dark");
  await p.keyboard.press("Escape"); await p.keyboard.press(","); await sleep(300);
  ok("G: History shows 'started this version from With peas' and the change", /started .*With peas, edited/.test(await txt(p, "#hlane")) && (await p.locator("#hlane .hrow.mine").count()) === 1);
  ok("G: the lineage chain ends at the new version", /With peas\s*→\s*With peas, edited|Original\s*→\s*With peas\s*→\s*With peas, edited/.test(await txt(p, "#hlane .chain")));
  await p.close();
}
{ // H. empty state
  const p = await open(ctx, "r=empty");
  ok("H: read mode says what to do", /Press E to add them/.test(await txt(p, "#p-ing")) && /Press E to add them/.test(await txt(p, "#met")));
  await p.keyboard.press("e"); await sleep(150);
  ok("H: E turns edit on; a new recipe is a Trying version so there is no question", (await p.locator("#esq").count()) === 0 && (await p.locator("#rtab").getAttribute("data-edit")) === "1");
  ok("H: the empty list invites the first ingredient", /No ingredients yet/.test(await txt(p, "#p-ing")) && /Type the first one/.test(await txt(p, "#p-ing")));
  await p.fill("[data-add=ing]", "3 eggs"); await p.keyboard.press("Enter"); await sleep(120);
  ok("H: the first ingredient appears and the empty message goes", !/No ingredients yet/.test(await txt(p, "#p-ing")) && /Eggs|eggs/.test(await txt(p, "#p-ing .ing-e")));
  ok("H: an empty time shows Add time", /Add time/.test(await txt(p, '[data-ed="time"]')));
  await shot(p, "empty-edit-after-1440x900-dark");
  await p.evaluate(() => document.activeElement.blur()); await p.keyboard.press("e"); await sleep(100);
  ok("H: E again leaves edit mode and says how many changes were saved", /Done\. 1 change saved/.test(await txt(p, "#toast")) && (await p.locator("#estrip").count()) === 0);
  await p.close();
}
{ // I. keys are quiet inside a field; Serves stepper in read mode still scales
  const p = await open(ctx, "edit=1&choose=fix");
  await p.click('[data-ed="title"]'); await p.keyboard.type("n1e,"); await sleep(60);
  ok("I: letters and digits that are page keys just type inside a field", (await p.evaluate(() => document.activeElement.value)).endsWith("n1e,") && (await p.locator("#lane:not([hidden])").count()) === 0 && (await p.locator("#hlane:not([hidden])").count()) === 0);
  await p.keyboard.press("Escape"); await p.keyboard.press("e"); await sleep(120);
  await p.click("[data-act=svcta]"); await p.click("[data-act=inc]"); await sleep(100);
  ok("I: read mode: the Serves stepper still scales the amounts", /3|4/.test(await txt(p, "#p-ing .ing .q")) && /Serves 3/.test(await txt(p, "[data-act=svcta]")));
  await p.close();
}
{ // J. below 80rem x 700px the build keeps today's panel
  const small = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const p = await open(small, "");
  await p.keyboard.press("e"); await sleep(120);
  ok("J: below the wide size E explains and stays in read mode", /keeps today's edit panel/.test(await txt(p, "#toast")) && (await p.locator("#rtab").getAttribute("data-edit")) === "");
  await p.close(); await small.close();
}
{ // K. light theme, and the screenshots the notes link
  const light = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await open(light, "edit=1&choose=fix&theme=light");
  await p.click('[data-ed="title"]'); await sleep(100);
  await shot(p, "title-editing-1440x900-light");
  await p.close(); await light.close();
}
await ctx.close();
// console must be clean everywhere
ok("no console or page errors anywhere", errs.length === 0, errs.slice(0, 5));
await browser.close();
console.log(fails ? fails + " of " + total + " checks FAILED" : "all " + total + " checks passed");
process.exit(fails ? 1 : 0);
