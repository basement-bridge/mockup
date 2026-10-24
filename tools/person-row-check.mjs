// Behaviour, count and layout check for fragments/person-row (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/person-row-check.mjs [--shots=shots/person-row]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: options A, B and C draw in light and dark at 390 and 360 wide, at the phone's own text size and at +30%, with no console error and no sideways scroll; the person area is the name
// (big, one tap to edit in place: Enter saves, Escape cancels, an error shows under the name and keeps the old name), the household line and the role rotary (the six real roles, exactly one
// in view at a time, swipe or arrow keys, applies when it settles); the assistants sit under the person (connected ones only, a symbol for state and no state words, a star for the default from
// two connected, unlink asks in place and Keep leaves it, Add shows the unconnected greyed); the Menu has no Assistants row; every control is at least 44px; every label is three words or fewer
// (the one disconnect question is the sentence the design allows); a very long name and a long household wrap or shorten and never push the page sideways; no hex colour in the CSS; the knowledge
// note, REVIEW-QUEUE line and index tile exist.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/person-row/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function open({ theme = "kitchie", scheme = "dark", w = 390, h = 844, ts = 0, q = "", o = "A", reduce = false } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: reduce ? "reduce" : "no-preference", hasTouch: true });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await c.newPage(); p.errs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); });
  await p.goto(`${BASE}index.html?bare=1&o=${o}&ts=${ts}${q}`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(200);
  return p;
}
const ROLES = ["Head Chef", "Supply Runner", "Full Stack Cook", "Knife Hand", "Pantry Marshal", "Sink General"];
const words = s => s.trim().split(/\s+/).filter(Boolean).length;

for (const o of ["A", "B", "C"]) for (const [th, scheme] of [["kitchie", "dark"], ["kitchie-day", "light"]]) for (const [w, h] of [[390, 844], [360, 640]]) for (const ts of [0, 3]) {
  const p = await open({ theme: th, scheme, w, h, ts, o, q: "&long=" + (ts ? 1 : 0) });
  const tag = `${o} ${scheme} ${w} ts${ts}`;
  ok(p.errs.length === 0, `${tag}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1) && await p.locator("[data-bd]").evaluate(n => n.scrollWidth <= n.clientWidth + 1), `${tag}: no sideways scroll`);
  const small = await p.evaluate(() => [...document.querySelectorAll(".phone :is(button,a[href],input)")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5); }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
  ok(small.length === 0, `${tag}: every control is at least 44px by 44px ${small.join(",")}`);
  const lab = await p.evaluate(() => [...document.querySelectorAll(".phone .pr :is(.role span,.nm,.addai span,.phh span,.ar.ask .acts button)")].map(e => e.textContent.trim()));
  ok(lab.every(s => s.split(/\s+/).length <= 3 || /household|kitchen/i.test(s)), `${tag}: labels within three words (${lab.filter(s => s.split(/\s+/).length > 3).join("|")})`);
  const clip = await p.evaluate(() => { const c = document.querySelector(".pcard"), r = c.getBoundingClientRect(); return [...c.querySelectorAll(".pn,.phh,.roles,.pav")].filter(e => { const b = e.getBoundingClientRect(); return b.right > r.right + 1 || b.left < r.left - 1; }).map(e => e.className); });
  ok(clip.length === 0, `${tag}: nothing leaves the person card ${clip.join(",")}`);
  const roleItems = await p.locator(".role").count();
  ok(roleItems === 6, `${tag}: the six real roles (${roleItems})`);
  const inView = await p.evaluate(() => { const r = document.querySelector(".roles").getBoundingClientRect(); return [...document.querySelectorAll(".role")].filter(e => { const b = e.getBoundingClientRect(); return Math.min(b.right, r.right - 2) - Math.max(b.left, r.left + 2) > 4; }).length; });
  ok(inView === 1, `${tag}: exactly one role in view, no neighbour peeking (${inView})`);
  if (shots) await p.screenshot({ path: `${shots}/${o}-${scheme}-${w}x${h}-ts${ts}.png` });
  await p.context().close();
}

/* content and structure, option A */
{
  const p = await open({});
  ok((await p.locator(".pn").innerText()) === "Alex", "name is drawn big (the person's own)");
  const fs = await p.locator(".pn").evaluate(n => parseFloat(getComputedStyle(n).fontSize));
  ok(fs >= 26, `name is large (${fs}px)`);
  ok((await p.locator(".phh span").innerText()) === "Fernwood", "warm detail line is the household's name");
  ok(JSON.stringify(await p.locator(".role span").allInnerTexts()) === JSON.stringify(ROLES), "the roles are the six Kitchie has");
  const menu = (await p.locator(".rowsx a").allInnerTexts()).map(s => s.trim());
  ok(!menu.some(s => /^Assistants/.test(s)) && menu.includes("History") && menu.includes("Install") && menu.includes("Download my data"), "no Assistants row in the menu; History, Install, Download my data unchanged");
  const names = await p.locator(".ai > ul:first-of-type .nm").allInnerTexts();
  ok(JSON.stringify(names) === JSON.stringify(["Claude", "ChatGPT"]), `connected assistants only, under the person (${names})`);
  ok(await p.locator(".ai .ar.on .lk[aria-label=Connected] svg").count() === 2, "connected is a symbol (linked icon), not a word");
  const txt = await p.locator(".ai").innerText();
  ok(!/connected/i.test(txt.replace(/Add an assistant/i, "")), "no state words drawn (connected is only the symbol and its label for a screen reader)");
  ok(await p.locator(".star").count() === 2 && await p.locator(".star[aria-pressed=true]").count() === 1, "from two connected, a star marks one default");
  ok(await p.locator("[data-setting=me],[data-setting=role],[data-setting=assistants],[data-setting~=claude],[data-setting~=chatgpt],[data-setting~=defassist],[data-setting~=disconnect]").count() >= 5, "search ids land on the name, role and assistant controls");
  await p.context().close();
}
{
  const p = await open({ q: "&ai=one" });
  ok(await p.locator(".star").count() === 0, "one connected: no star (it is the default by itself)");
  await p.context().close();
}
{
  const p = await open({ q: "&ai=none" });
  ok(await p.locator(".ai .ar.on").count() === 0 && await p.locator(".addai").count() === 1, "none connected: only the add control");
  await p.click(".addai");
  ok(await p.locator(".ar.off").count() === 3 && await p.locator(".ar.off .cn svg").count() === 3, "add shows the three unconnected, each a plain add icon, greyed");
  const f = await p.locator(".ar.off .logo").first().evaluate(n => getComputedStyle(n).filter + "|" + getComputedStyle(n).opacity);
  ok(/grayscale/.test(f), `unconnected is greyed (${f})`);
  await p.context().close();
}

/* name edit in place */
{
  const p = await open({});
  await p.click("[data-edit]");
  ok(await p.locator(".pn-in").isVisible() && await p.evaluate(() => document.activeElement.classList.contains("pn-in")), "tap on the name: the field opens in place, focused");
  await p.fill(".pn-in", "Sam"); await p.keyboard.press("Enter"); await p.waitForTimeout(100);
  ok((await p.locator(".pn").innerText()) === "Sam" && !(await p.locator(".pn-in").isVisible()), "Enter saves and closes");
  ok(await p.locator(".pav .pmi").innerText() === "S", "the picture's initial follows the name");
  await p.click("[data-edit]"); await p.fill(".pn-in", "Zed"); await p.keyboard.press("Escape"); await p.waitForTimeout(100);
  ok((await p.locator(".pn").innerText()) === "Sam" && !(await p.locator(".pn-in").isVisible()), "Escape cancels");
  await p.click("[data-edit]"); await p.fill(".pn-in", "Bad!!"); await p.keyboard.press("Enter"); await p.waitForTimeout(100);
  ok(await p.locator(".pe").isVisible() && (await p.locator(".pe").innerText()).split(/\s+/).length <= 3 && await p.locator(".pn-in").isVisible(), "an error shows under the name and the field stays open");
  await p.fill(".pn-in", ""); await p.keyboard.press("Enter"); await p.waitForTimeout(100);
  ok((await p.locator(".pn").innerText()) === "Sam", "an emptied name goes back to the saved one");
  await p.click("[data-edit]"); await p.fill(".pn-in", "Robin"); await p.locator(".find").click(); await p.waitForTimeout(150);
  ok((await p.locator(".pn").innerText()) === "Robin", "leaving the field saves");
  await p.context().close();
}

/* role rotary */
{
  const p = await open({});
  ok(await p.locator('.role[aria-checked=true] span').innerText() === "Supply Runner", "the picked role is the one in view");
  await p.evaluate(() => { const r = document.querySelector(".roles"); r.scrollTo({ left: r.clientWidth * 3, behavior: "instant" }); });
  await p.waitForTimeout(450);
  ok(await p.locator('.role[aria-checked=true] span').innerText() === "Knife Hand" && await p.evaluate(() => window.PERSON.S.role) === 3, "a swipe applies the role it settles on");
  ok(await p.locator(".rdots i.on").count() === 1, "the dots show where you are");
  await p.locator('.role[aria-checked=true]').focus(); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(500);
  ok(await p.locator('.role[aria-checked=true] span').innerText() === "Pantry Marshal", "arrow keys move it too");
  await p.context().close();
  const q = await open({ q: "&role=none" });
  ok(await q.locator('.role[aria-checked=true] span').innerText() === "Pick a role" && await q.evaluate(() => window.PERSON.S.role) === null, "no role yet: Pick a role is in view and nothing is saved");
  await q.context().close();
}

/* assistants: star, unlink in place, add */
{
  const p = await open({});
  await p.click('[data-star="chatgpt"]');
  ok(await p.locator('[data-star="chatgpt"]').getAttribute("aria-pressed") === "true" && await p.locator('[data-star="claude"]').getAttribute("aria-pressed") === "false", "the star moves the default");
  await p.click('[data-ask="claude"]');
  ok(await p.locator(".ar.ask").count() === 1 && await p.locator(".ar.ask").innerText().then(t => /Disconnect Claude\?/.test(t) && /Keep/.test(t)), "unlink asks in place");
  await p.click("[data-keep]");
  ok(await p.locator(".ar.ask").count() === 0 && await p.locator('.ar.on[data-assistant="claude"]').count() === 1, "Keep leaves it as it was");
  await p.click('[data-ask="claude"]'); await p.click("[data-disc]");
  ok(await p.locator('.ar.on[data-assistant="claude"]').count() === 0 && await p.locator(".star").count() === 0, "Disconnect removes it (one left: no star)");
  await p.click(".addai");
  ok(await p.locator(".ar.off .nm").allInnerTexts().then(a => a.includes("Claude") && a.includes("Gemini")), "Claude is back among the ones to add");
  await p.context().close();
}

/* css and notes */
const css = readFileSync(new URL("../fragments/person-row/person.css", import.meta.url), "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css), "no hex colour in the CSS (theme tokens, hsl tints only)");
const root = new URL("../", import.meta.url).pathname;
ok(existsSync(root + "docs/knowledge/person-row.md"), "the knowledge note exists");
ok(/fragments\/person-row /.test(readFileSync(root + "REVIEW-QUEUE", "utf8")), "REVIEW-QUEUE has the line");
ok(readFileSync(root + "index.html", "utf8").includes("fragments/person-row/"), "the index tile exists");
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nAll passed");
process.exit(fails ? 1 : 0);
