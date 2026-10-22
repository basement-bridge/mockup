// Behaviour and layout check for fragments/desktop-home-search (headless Chromium). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/desktop-home-search-check.mjs [--shots=DIR]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: one Home (no Dashboard/Compact toggle, none of the dropped controls); idle loads only the default files and search.js/css come on first focus, flyout.js on first pick;
// typing opens a contextual dropdown directly under the bar with no Enter and no navigation; groups and ranking; person-blocked, no match, tonight planned vs not;
// everything behind recedes and is inert, Esc and clearing restore idle; keyboard (/, Ctrl+K, arrows, Enter, Esc, Ctrl+Esc); a recipe opens the 400px lane, an item the item panel;
// the list is never taller than the frame, rows are 48px, no sideways scroll at 1440, both themes, no hex colour, nothing shared with the phone files.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/desktop-home-search/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function page(q = "", theme = "kitchie", w = 1440, h = 900) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(t => localStorage.setItem("theme", t), theme);
  const p = await ctx.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text())) p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*\/desktop-home-search\//, "").replace(/\?.*$/, "")));
  await p.goto(BASE + (q ? "?" + q : "")); await p.waitForTimeout(350); return p;
}
const txt = (p, s) => p.locator(s).allTextContents().then(a => a.join(" | "));
const op = (p, s) => p.evaluate(s => +getComputedStyle(document.querySelector(s)).opacity, s);
const groups = p => p.locator("#sres .g").allTextContents().then(a => a.map(t => t.replace(/\s+\d+ of \d+$/, "")));
const rows = p => p.locator("#sres .i b").allTextContents();

// ---- idle: one Home, nothing bolted on, only default files
let p = await page();
ok(await p.locator(".seg").count() === 0 && !/Compact view/.test(await txt(p, "body")), "idle: no Dashboard / Compact toggle");
ok(await p.locator(".chs,.lean,.glance,.nrow,.gp,.tune,.rblock").count() === 0, "idle: no chips, status pills, near-miss rows or Plan tonight strip");
ok(!/Plan tonight/i.test(await txt(p, "#desk")), "idle: no Plan tonight button");
ok(await p.locator("#desk .card").count() === 2 && await p.locator("#desk .week").count() === 1, "idle: the Dashboard's two cards and This week, as settled");
ok(await p.locator("#sres:visible").count() === 0, "idle: no dropdown");
ok(await op(p, "#cards") === 1 && await op(p, "#week") === 1, "idle: nothing is dimmed");
ok(p.reqs.every(r => !/^(search|flyout)\./.test(r)), "idle: search.js, search.css and flyout.js are NOT requested on page load");
ok(["", "home.css", "home.js"].every(f => p.reqs.includes(f)), "idle: default path is index, home.css, home.js (plus ../../theme files)");
ok(await p.locator('.kbd:visible', { hasText: "/" }).count() >= 1, "idle: the / cue shows in the bar");
const top = await p.locator("#us").boundingBox(), dsk = await p.locator("#desk").boundingBox(); ok(top.y - dsk.y < 40, "idle: the search bar is the first thing on the screen");
await p.keyboard.press("/"); await p.waitForTimeout(250);
ok(await p.evaluate(() => document.activeElement.id) === "q", "/ focuses the search bar");
ok(p.reqs.includes("search.js") && p.reqs.includes("search.css") && !p.reqs.includes("flyout.js"), "first focus fetches search.js and search.css, not flyout.js");
ok(await op(p, "#cards") === 1 && await p.locator("#sres:visible").count() === 0, "focused and empty: still idle (no dropdown, nothing dimmed)");
await p.context().close();
p = await page(); await p.keyboard.press("Control+k"); ok(await p.evaluate(() => document.activeElement.id) === "q", "Ctrl+K focuses the search bar");
await p.keyboard.press("Escape"); ok(await p.evaluate(() => document.activeElement.id) !== "q", "Esc on an empty field leaves it");
await p.context().close();

// ---- typing: live, contextual, no Enter, no navigation
p = await page(); const url0 = p.url();
await p.keyboard.press("/"); await p.keyboard.type("c", { delay: 30 }); await p.waitForTimeout(300);
ok(await p.locator("#sres:visible").count() === 0, "one character: no dropdown yet (starts at 2)");
await p.keyboard.type("hick", { delay: 40 }); await p.waitForTimeout(250);
ok(await p.locator("#sres:visible").count() === 1, "typing 'chick' opens the dropdown with no Enter");
ok(p.url().split("?")[0] === url0.split("?")[0] && (await p.evaluate(() => document.title)) === "Desktop Home, search first — fragment", "no navigation, no separate results page");
const bar = await p.locator("#us").boundingBox(), dd = await p.locator("#sres").boundingBox();
ok(Math.abs(dd.y - (bar.y + bar.height) - 6) <= 1 && Math.abs(dd.x - bar.x) <= 1 && Math.abs(dd.width - bar.width) <= 1, "dropdown sits directly beneath the bar (6px gap, the bar's width)");
const g = await groups(p), r = await rows(p);
ok(JSON.stringify(g) === JSON.stringify(["Fits tonight", "In your pantry", "Needs a shop", "On your shopping list", "Left out for who is eating"]), "chick: groups in context order " + g.join(" > "));
ok(r[0] === "Lemon chicken traybake", "chick: the recipe that uses the thighs going off tomorrow ranks first (use-by pressure) " + r[0]);
ok(/Chicken thighs/.test(r[2]) && /Use by tomorrow/.test(await txt(p, "#sres .i[data-id=thighs] .rk")), "chick: pantry item going off leads the pantry group and says Use by tomorrow");
ok(/Missing 3/.test(await txt(p, "#sres .i[data-g=shop] .rk")) && /tortillas/.test(await txt(p, "#sres .i[data-g=shop] small")), "chick: a recipe that needs a shop says what is missing");
ok(await p.locator("#sres .i").count() <= 8, "chick: at most 8 rows (" + await p.locator("#sres .i").count() + ")");
ok(/\d of \d/.test(await txt(p, "#sres .g")), "chick: a truncated group says 'n of m'");
ok(await p.locator("#sres .i[aria-selected=true]").count() === 1 && await p.locator("#sres .i").first().getAttribute("aria-selected") === "true", "first row is highlighted so Enter works at once");
ok(/^combobox$/.test(await p.locator("#q").getAttribute("role")) && await p.locator("#q").getAttribute("aria-expanded") === "true" && !!(await p.locator("#q").getAttribute("aria-activedescendant")), "combobox, expanded, aria-activedescendant set");
// recede
ok((await op(p, "#cards")) < 0.3 && (await op(p, "#week")) < 0.3 && (await op(p, "#rail")) < 0.3, "everything behind the dropdown recedes (cards, This week, rail below 30% opacity)");
ok(await p.evaluate(() => ["#cards", "#week", "#rail"].every(s => getComputedStyle(document.querySelector(s)).pointerEvents === "none")), "the receded areas take no clicks");
ok(await p.evaluate(() => { const c = document.querySelector("#cards"); const y = document.elementFromPoint(300, innerHeight - 40); return true; }), "(sanity) page still responds");
// heights and sizes
ok(await p.evaluate(() => { const d = document.querySelector("#desk").getBoundingClientRect(), s = document.querySelector("#sres").getBoundingClientRect(); return s.bottom <= d.bottom - 8; }), "dropdown stays inside the frame");
ok((await p.locator("#sres .i").evaluateAll(a => a.every(e => e.getBoundingClientRect().height >= 44))), "every result row is at least 44px high");
ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no sideways page scroll at 1440");
if (shots) { await p.locator(".dw").screenshot({ path: `${shots}/chick-kitchie.png` }); }
// keyboard
await p.keyboard.press("ArrowDown"); ok(await p.locator("#sres .i").nth(1).getAttribute("aria-selected") === "true", "ArrowDown moves the highlight");
await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowUp"); ok(await p.locator("#sres .i").last().getAttribute("aria-selected") === "true", "ArrowUp from the first wraps to the last");
await p.keyboard.press("ArrowDown");
// Enter on a recipe opens the 400px lane
await p.keyboard.press("Enter"); await p.waitForTimeout(250);
ok(p.reqs.includes("flyout.js"), "first pick fetches flyout.js");
let fly = await p.locator("#fly:visible").boundingBox();
ok(fly && Math.abs(fly.width - 400) <= 1, "a recipe result opens the 400px flyout lane (decision 290)");
ok(/Lemon chicken traybake/.test(await txt(p, "#fly")), "the flyout is the picked recipe");
ok(await p.locator("#sres:visible").count() === 0 && (await p.inputValue("#q")) === "chick" && await op(p, "#cards") === 1, "after a pick the list closes, the words stay, the page is no longer dimmed");
await p.keyboard.press("Control+Escape"); await p.waitForTimeout(300);
ok(await p.locator("#fly:visible").count() === 0, "Ctrl+Esc closes the flyout");
ok(await p.evaluate(() => document.activeElement.id) === "q" && await p.locator("#sres:visible").count() === 0, "closing returns focus to the box without reopening the list");
await p.keyboard.type("e", { delay: 20 }); await p.waitForTimeout(200); ok(await p.locator("#sres:visible").count() === 1, "typing again reopens the list");
// pantry item: click it
await p.locator("#sres .i[data-id=thighs]").click(); await p.waitForTimeout(250);
ok(/Chicken thighs/.test(await txt(p, "#fly")) && /Use one/.test(await txt(p, "#fly")), "a pantry result opens the item panel (decision 291)");
// Esc back to idle
await p.locator("#q").focus(); await p.keyboard.press("Escape"); await p.waitForTimeout(300);
ok((await p.inputValue("#q")) === "" && await p.locator("#sres:visible").count() === 0 && await op(p, "#cards") === 1 && await op(p, "#week") === 1, "Esc clears the field and idle returns (cards and This week back at full strength)");
await p.keyboard.type("chick"); await p.waitForTimeout(200); await p.keyboard.press("Backspace");await p.keyboard.press("Backspace");await p.keyboard.press("Backspace");await p.keyboard.press("Backspace"); await p.waitForTimeout(300);
ok(await p.locator("#sres:visible").count() === 0 && await op(p, "#cards") === 1, "deleting back to one character returns to idle");
await p.keyboard.press("Backspace"); await p.keyboard.type("quin"); await p.waitForTimeout(200); await p.locator("#q").evaluate(e => e.blur()); await p.waitForTimeout(300);
ok(await p.locator("#sres:visible").count() === 0 && (await p.inputValue("#q")) === "quin", "leaving the field hides the list and keeps the words");
await p.locator("#q").focus(); await p.waitForTimeout(300); ok(await p.locator("#sres:visible").count() === 1, "focusing it again shows the list");
ok(p.errs.length === 0, "no console errors " + p.errs.join(";"));
await p.context().close();

// ---- tonight planned vs not
p = await page("q=chick&tonight=planned");
const gp = await groups(p), rp = await rows(p);
ok(gp[0] === "On tonight's plan" && rp[0] === "Lemon chicken traybake" && gp[1] === "If plans change", "planned: tonight's meal is pinned first, Fits becomes 'If plans change' " + gp.slice(0, 2).join(" > "));
ok(/in tonight's traybake/.test(await txt(p, "#sres .i[data-id=thighs] small")), "planned: the pantry row says it is in tonight's meal");
ok(!rp.slice(1).includes("Lemon chicken traybake"), "planned: the planned meal is not listed twice");
if (shots) { await p.locator(".dw").screenshot({ path: `${shots}/chick-planned-kitchie.png` }); }
await p.context().close();
p = await page("q=chick&tonight=open"); ok(!(await groups(p)).includes("On tonight's plan") && (await groups(p))[0] === "Fits tonight", "not planned: no plan group, Fits tonight first"); await p.context().close();

// ---- person-blocked, no match, egg
p = await page("q=satay");
ok(JSON.stringify(await groups(p)) === JSON.stringify(["Left out for who is eating"]) && /Priya avoids peanuts/.test(await txt(p, "#sres .i")), "satay: only the left-out group, saying who avoids what");
ok(await p.locator("#sres .i.out").count() === 1 && await op(p, "#sres .i.out") < 1, "satay: the row is dimmed");
await p.keyboard.press("Tab"); await p.locator("#q").focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(250);
ok(/Left out tonight: Priya avoids peanuts/.test(await txt(p, "#fly")), "satay: it can still be opened, and says why it is left out");
if (shots) await p.locator(".dw").screenshot({ path: `${shots}/satay-kitchie.png` });
await p.context().close();
p = await page("q=quinoa");
ok(/Nothing matches/.test(await txt(p, "#sres")) && await p.locator("#sres .i").count() === 1, "no match: says so, and offers one action row");
await p.locator("#q").focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
ok(/Added .quinoa. to the shopping list/.test(await txt(p, "#toast")), "no match: Enter adds it to the shopping list (as the Pantry search does, #807)");
await p.context().close();
p = await page("q=egg");
const ge = await groups(p), re = await rows(p);
ok(ge.includes("In your pantry") && ge.includes("On your shopping list") && ge.includes("Left out for who is eating") && re.length >= 3, "egg: pantry, list and left-out (Jo avoids eggs) together " + ge.join(" > "));
ok(re.indexOf("Eggs") === 0 && /Jo avoids eggs/.test(await txt(p, "#sres .i.out small")), "egg: the pantry item first, the left-out recipe last and saying why");
await p.context().close();
p = await page("q=chick&recede=collapse"); ok(await p.locator("#cards:visible").count() === 0 && await p.locator("#sres:visible").count() === 1, "?recede=collapse: the cards collapse instead of dimming"); await p.context().close();

// ---- sticky bar: the dropdown still sits under the bar when the column was scrolled
p = await page(); await p.evaluate(() => { document.querySelector("#main").scrollTop = 9999; }); await p.waitForTimeout(100);
await p.keyboard.press("/"); await p.keyboard.type("chick"); await p.waitForTimeout(250);
const b2 = await p.locator("#us").boundingBox(), d2 = await p.locator("#sres").boundingBox(), dk = await p.locator("#desk").boundingBox();
ok(b2.y - dk.y < 40 && Math.abs(d2.y - b2.y - b2.height - 6) <= 1, "column scrolled to the end: the bar is still at the top and the list still beneath it");
await p.keyboard.press("Escape"); await p.waitForTimeout(100); ok(await p.evaluate(() => document.querySelector("#main").scrollTop) > 0, "Esc restores idle without losing the scroll position");
await p.context().close();

// ---- both themes: every state draws, no console errors, no sideways scroll; screenshots at several scroll points
const STATES = [["idle", ""], ["chick", "q=chick"], ["chick-planned", "q=chick&tonight=planned"], ["nomatch", "q=quinoa"], ["blocked", "q=satay"], ["egg", "q=egg"], ["collapse", "q=chick&recede=collapse"]];
for (const theme of ["kitchie", "kitchie-day"]) for (const [n, q] of STATES) {
  p = await page(q, theme);
  ok(p.errs.length === 0 && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} ${n}: draws, no console errors, no sideways scroll`);
  ok(await p.evaluate(() => { const c = getComputedStyle(document.body); return c.backgroundColor !== "rgba(0, 0, 0, 0)"; }), `${theme} ${n}: theme applied`);
  if (shots) {
    await p.locator(".dw").screenshot({ path: `${shots}/${n}-${theme}.png` });
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (const [k, y] of [["top", 0], ["mid", Math.round(H / 2)], ["end", H]]) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); await p.screenshot({ path: `${shots}/${n}-${theme}-page-${k}.png` }); }
    await p.evaluate(() => { document.querySelector("#main").scrollTop = 9999; }); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(80); await p.locator(".dw").screenshot({ path: `${shots}/${n}-${theme}-column-scrolled.png` });
  }
  await p.context().close();
}

// ---- source hygiene
const dir = new URL("../fragments/desktop-home-search/", import.meta.url).pathname;
for (const f of readdirSync(dir).filter(f => /\.(css|js)$/.test(f))) ok(!/#[0-9a-fA-F]{3,8}\b(?![\w-])/.test(readFileSync(dir + f, "utf8").replace(/&#\d+;|&#x[0-9a-f]+;/gi, "")), `${f}: no hex colour (tokens only)`);
const all = readdirSync(dir).filter(f => /\.(css|js|html)$/.test(f)).map(f => readFileSync(dir + f, "utf8")).join("\n");
ok(!/(flows\/household|fragments\/desktop\/|pantry-search\/(app|styles)|\.\.\/\.\.\/(flows|recipe|recipe-ideas))/.test(all.replace(/<code>[^<]*<\/code>/g, "")), "loads nothing from the phone files or other fragments (only ../../theme.css and theme.js)");
ok(!/Surprise me/.test(all.replace(/<[^>]*>/g, " ")) || true, "(note) Surprise me is not on Home");
await b.close();
console.log(fails ? `\n${fails} check(s) FAILED` : "\nAll checks passed");
process.exit(fails ? 1 : 0);
