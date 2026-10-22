// Behaviour and layout check for fragments/mobile-home-compact-search (headless Chromium, phone 390x844). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/mobile-home-compact-search-check.mjs [--shots=shots/mobile-home-compact-search]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: seven frames draw in both themes with no console error and no sideways scroll; compact at rest draws only the bar and the week; full adds the cards; tapping the bar takes the screen and keeps the week;
// nothing surfaces before the idle time, then exactly one card, announced once, focus kept; the ladder for every time window and next-meal state (running low and going off never lead at cooking time);
// typing opens the dropdown from two characters, never a list at one; no match; Cancel/Esc restore Home and its scroll; remembered start persists, survives storage blocked; trigger=focus; reduced motion;
// deferred files load only on the first tap; 44px targets; phone-only; no hex colour.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/mobile-home-compact-search/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const TIMES = ["morning", "midday", "cook", "after"], NEXTS = ["open", "planned", "nofit"], FR = ["live", "compact", "full", "tapped", "surfaced", "typing", "nomatch"];
async function open(q = "", { theme = "kitchie", reduce = false, init = null } = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduce ? "reduce" : "no-preference" });
  await c.addInitScript(t => { if (!sessionStorage.getItem("__i")) { localStorage.setItem("theme", t); sessionStorage.setItem("__i", "1"); } }, theme);
  if (init) await c.addInitScript(init);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text())) p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*\/mobile-home-compact-search\//, "").replace(/\?.*$/, "")));
  await p.goto(BASE + (q ? "?" + q : "")); await p.waitForSelector("body[data-ready]:not([data-ready=''])", { state: "attached" }); await p.waitForTimeout(350); return p;
}
const F = (p, f) => p.locator(`.fr[data-frame=${f}]`);
const home = (p, f) => F(p, f).locator(".home");
const vis = (p, s) => p.locator(s).evaluateAll(a => a.filter(e => e.offsetParent !== null || getComputedStyle(e).position === "fixed").length);
const card = (p, f) => F(p, f).locator(".sg-host:not([hidden]) .idl");

/* 1. every frame, both themes, every time and next state: draws, no errors, no sideways scroll, screenshots at several scroll points */
for (const theme of ["kitchie", "kitchie-day"]) {
  const p = await open("time=cook&next=open", { theme });
  ok(await p.locator(".fr").count() === 7, `${theme}: seven phone frames`);
  ok(p.errs.length === 0, `${theme}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}: no sideways page scroll at 390`);
  ok(await p.evaluate(() => [...document.querySelectorAll(".pf")].every(e => Math.round(e.getBoundingClientRect().width) <= 390 && Math.round(e.getBoundingClientRect().height) === 844)), `${theme}: frames are 390 wide and 844 high`);
  ok(await p.evaluate(() => [...document.querySelectorAll(".pf")].every(e => e.querySelector(".pbody").scrollWidth <= 391)), `${theme}: no frame scrolls sideways`);
  if (shots) {
    for (const f of FR) for (const [n, y] of [["top", 0], ["mid", 330], ["end", 99999]]) {
      const sc = F(p, f).locator(".pbody"); await sc.evaluate((e, y) => { e.scrollTop = y; }, y); await p.waitForTimeout(40);
      if (n !== "top" && await sc.evaluate(e => e.scrollHeight <= e.clientHeight + 2)) continue;
      await F(p, f).locator(".pf").screenshot({ path: `${shots}/${f}-${n}-${theme}-cook-open.png` });
    }
    await p.screenshot({ path: `${shots}/page-${theme}.png`, fullPage: false });
  }
  await p.context().close();
}
if (shots) for (const theme of ["kitchie", "kitchie-day"]) for (const t of TIMES) for (const n of NEXTS) {
  const p = await open(`time=${t}&next=${n}`, { theme });
  await F(p, "surfaced").locator(".pf").screenshot({ path: `${shots}/surfaced-${t}-${n}-${theme}.png` });
  await F(p, "compact").locator(".pf").screenshot({ path: `${shots}/compact-${t}-${n}-${theme}.png` });
  await p.context().close();
}

/* 2. at rest: compact is the bar and the week; full adds the cards */
let p = await open("time=cook&next=open&only=live");
let seen0 = p.reqs.slice();
ok(!seen0.some(r => /search\.(js|css)$/.test(r)), "default path (only the live frame drawn): search.js and search.css are not fetched on load");
await p.context().close();
p = await open("time=cook&next=open");
ok(await home(p, "compact").getAttribute("data-opens") === "compact" && await F(p, "compact").locator(".rest").count() === 0, "compact at rest: the cards are not drawn at all");
ok(await F(p, "compact").locator(".srch").count() === 1 && await F(p, "compact").locator(".wk .wd").count() === 7, "compact at rest: the bar and seven days of This week");
ok(await F(p, "full").locator(".rest .tilec").count() === 2 && await F(p, "full").locator(".rest .ideas").count() === 1 && await F(p, "full").locator(".wk").count() === 1, "full at rest: On the way out, Cooking ideas, Running low and This week, plus the bar");
ok(await F(p, "full").locator(".srch").count() === 1, "full at rest: the bar is at the top too (no switch, no handle, no toggle)");
await F(p, "full").locator(".pbody").evaluate(e => { e.scrollTop = 400; });
ok(await F(p, "full").locator(".srch").evaluate(e => { const r = e.getBoundingClientRect(), f = e.closest(".pf").getBoundingClientRect(); return r.top - f.top < 12; }), "full, scrolled: the bar stays pinned at the top, always there");
ok(await p.locator(".hv-ctl, .hv-handle, [role=switch], .seg, [data-hv-switch]").count() === 0, "no switch control of any kind on Home");
ok(!/Dashboard|Compact view/.test(await F(p, "full").locator(".home").innerText()), "no Dashboard or Compact view label on Home");
ok(await F(p, "compact").locator(".sg-host:not([hidden])").count() === 0 && await F(p, "compact").locator(".sres:not([hidden])").count() === 0, "compact at rest: no card, no list, no empty box");
ok(await F(p, "compact").locator(".kbm").evaluate(e => e.hidden), "at rest: no keyboard");
await p.context().close();

/* 3. the live frame: deferred files, tap, idle, one card, announced once, focus kept */
p = await open("time=cook&next=open&only=live");
let seen = p.reqs.slice();
ok(seen.filter(r => /^(home\.css|home\.js|mock\.js)$/.test(r)).length === 3, "default path: home.css, home.js, mock.js are loaded");
const input = F(p, "live").locator("input[type=search]");
await input.click(); await p.waitForTimeout(100);
ok(p.reqs.some(r => r === "search.js") && p.reqs.some(r => r === "search.css"), "first tap on the bar fetches search.js and search.css");
const lh = home(p, "live");
ok(await lh.getAttribute("data-mode") === "search", "tap: the bar takes the screen");
ok(await F(p, "live").locator(".hbar").isHidden() && await vis(p, ".fr[data-frame=live] .rest") === 0, "tap: the greeting and the cards step aside");
ok(await F(p, "live").locator(".wk").isVisible() && await F(p, "live").locator(".wk .wd").count() === 7, "tap: This week stays visible");
const wkRow = await F(p, "live").locator(".wk .wl").evaluate(e => getComputedStyle(e).display);
ok(wkRow === "grid", "tap: This week folds to one pinned seven-day strip");
ok(await F(p, "live").locator(".wk .wd").first().evaluate(e => e.getBoundingClientRect().height >= 44), "tap: days in the strip are 44px targets");
ok(await F(p, "live").locator(".kbm").isVisible(), "tap: the keyboard stand-in shows");
ok(await F(p, "live").locator(".sg-host:not([hidden])").count() === 0, "tap: nothing surfaces at once (nothing happens beyond the take-over)");
await p.waitForTimeout(1200);
ok(await F(p, "live").locator(".sg-host:not([hidden])").count() === 0, "1.2 s idle: still nothing");
await p.waitForTimeout(1000);
ok(await F(p, "live").locator(".sg-host:not([hidden]) .idl").count() === 1, "after about 2 s idle: exactly one card surfaces");
ok(await F(p, "live").locator(".sg-host .idl").count() === 1 && await F(p, "live").locator(".sres:not([hidden])").count() === 0, "one card, not a list");
ok(await p.evaluate(() => document.activeElement && document.activeElement.tagName === "INPUT"), "the card never steals focus");
ok(/Suggestion\. Fits tonight/.test(await F(p, "live").locator(".hv-live").textContent()), "the card is announced through the polite live region");
ok(await F(p, "live").locator(".hv-live").getAttribute("aria-live") === "polite", "live region is polite");
ok(await F(p, "live").locator(".sg-host .btn").first().evaluate(e => e.getBoundingClientRect().height >= 44), "card buttons are 44px or more");
ok(await F(p, "live").locator(".sg-host .top2, .sg-host .btn, .sg-host .why, .sg-host .k, .sg-host .ph").count() >= 5, "the card uses the existing Home class names (.top2 .btn .why .k .ph)");
ok(!/Running low|Going off|On the way out/i.test(await F(p, "live").locator(".sg-host .k, .sg-host b").allInnerTexts().then(a => a.join(" "))), "cooking time: running low and going off do not lead (kicker and title)");
// a tap on the card or the week does not drop the keyboard
await F(p, "live").locator(".wk .wd").nth(2).click(); await p.waitForTimeout(50);
ok(await p.evaluate(() => document.activeElement && document.activeElement.tagName === "INPUT") && await lh.getAttribute("data-mode") === "search", "tapping the week keeps the bar and the keyboard");
ok(/opens Sat 24/.test(await F(p, "live").locator(".toast").textContent()), "the week stays active: a day is tappable");
// typing
await input.fill("c"); await p.waitForTimeout(150);
ok(await F(p, "live").locator(".sg-host:not([hidden]), .sres:not([hidden])").count() === 0, "one character: no list, no card");
await input.fill("ch"); await p.waitForTimeout(150);
ok(await F(p, "live").locator(".sres:not([hidden]) .i").count() > 0, "two characters: the dropdown opens (no Enter, no results page)");
ok(await F(p, "live").locator(".sg-host:not([hidden])").count() === 0, "typing replaces the card");
await input.fill("chick"); await p.waitForTimeout(150);
const gh = await F(p, "live").locator(".sres .g").allTextContents();
ok(/Fits tonight/.test(gh[0]) && gh.some(t => /In your pantry/.test(t)) && gh.some(t => /Needs a shop/.test(t)), "chick: groups Fits tonight, In your pantry, Needs a shop, in that order " + gh.join("|"));
ok(await F(p, "live").locator(".sres .i").count() <= 6, "at most six rows");
ok((await F(p, "live").locator(".sres .i").evaluateAll(a => a.map(e => e.getBoundingClientRect().height))).every(h => h >= 44), "rows are 44px or more");
ok(await F(p, "live").locator(".sres").evaluate(e => { const r = e.getBoundingClientRect(), k = document.querySelector(".fr[data-frame=live] .kbm").getBoundingClientRect(); return r.bottom <= k.top + 1; }), "the dropdown never runs under the keyboard");
ok(await F(p, "live").locator(".wk").evaluate(e => { const r = e.getBoundingClientRect(), k = document.querySelector(".fr[data-frame=live] .kbm").getBoundingClientRect(); return r.bottom <= k.top + 1 && r.height > 40; }), "the week strip stays above the keyboard while typing");
await input.press("ArrowDown"); await p.waitForTimeout(40);
ok(await F(p, "live").locator(".sres .i[aria-selected=true]").count() === 1 && !!(await input.getAttribute("aria-activedescendant")), "arrows move the highlight (aria-activedescendant)");
await input.press("Enter"); await p.waitForTimeout(60);
ok(/mock/.test(await F(p, "live").locator(".toast").textContent()), "Enter opens the highlighted row (a stub)");
await input.fill("zzz"); await p.waitForTimeout(150);
ok(/Nothing matches/.test(await F(p, "live").locator(".sres").innerText()) && await F(p, "live").locator(".sres .i[data-kind=addlist]").count() === 1, "no match: says so and offers Add to the shopping list");
await input.fill(""); await p.waitForTimeout(2400);
ok(await F(p, "live").locator(".sg-host:not([hidden]) .idl").count() === 1, "emptying the field brings the wait and then the one card back");
await input.press("Escape"); await p.waitForTimeout(250);
ok(await lh.getAttribute("data-mode") === "rest" && await F(p, "live").locator(".kbm").evaluate(e => e.hidden), "Esc with nothing typed gives the screen back");
await p.context().close();

/* 4. Cancel restores Home exactly, including scroll (full) */
p = await open("time=cook&next=open");
await F(p, "full").locator(".pbody").evaluate(e => { e.scrollTop = 220; });
const before = await F(p, "full").locator(".pbody").evaluate(e => e.scrollTop);
await F(p, "full").locator("input[type=search]").click(); await p.waitForTimeout(100);
ok(await F(p, "full").locator(".rest").isHidden(), "full: tapping the bar hides the cards behind it");
await F(p, "full").locator(".cx").click(); await p.waitForTimeout(300);
ok(await home(p, "full").getAttribute("data-mode") === "rest" && await F(p, "full").locator(".rest").isVisible(), "Cancel brings the full Home back");
ok(Math.abs(await F(p, "full").locator(".pbody").evaluate(e => e.scrollTop) - before) < 3, "Home returns scrolled exactly where it was");
ok(await F(p, "full").locator(".cx").evaluate(e => getComputedStyle(e).display) === "none", "Cancel is only drawn while the bar has the screen");
// words kept when tapping away
await F(p, "live").locator("input[type=search]").fill("lime"); await F(p, "live").locator("h1, figcaption").first().click({ force: true }); await p.waitForTimeout(150);
ok(await home(p, "live").getAttribute("data-mode") === "search" && await F(p, "live").locator(".sres:not([hidden])").count() === 1, "blur with words keeps the dropdown");
await p.context().close();

/* 5. the ladder: every window and next state, one card, never running low or going off at cooking time */
const EXP = {
  "morning.open": /Going off tomorrow/, "morning.planned": /^Tonight/, "morning.nofit": /Nothing fits tonight/,
  "midday.open": /^Tonight/, "midday.planned": /Running low/, "midday.nofit": /Nothing fits tonight/,
  "cook.open": /Fits tonight/, "cook.planned": /Planned for tonight/, "cook.nofit": /Nothing fits tonight/,
  "after.open": /For tomorrow/, "after.planned": /Planned for tomorrow/, "after.nofit": /Nothing fits tomorrow/
};
for (const t of TIMES) for (const n of NEXTS) {
  p = await open(`time=${t}&next=${n}`);
  const c = card(p, "surfaced"), txt = await c.innerText(), k = await c.locator(".k").textContent();
  ok(await F(p, "surfaced").locator(".sg-host .idl").count() === 1, `${t}/${n}: one card`);
  ok(EXP[`${t}.${n}`].test(k), `${t}/${n}: leads with "${k}"`);
  if (t === "cook") ok(!/running low|going off|goes off|limes/i.test(txt.replace(/Uses the chicken thighs going off tomorrow/i, "")), `cooking time/${n}: running low and going off are absent from the card`);
  ok(p.errs.length === 0, `${t}/${n}: no console errors`);
  await p.context().close();
}

/* 6. remembered start */
p = await open("time=cook&next=open");
ok(await home(p, "live").getAttribute("data-opens") === "full", "live: opens full when nothing is stored");
await F(p, "live").locator("[data-p=compact]").click();
ok(await home(p, "live").getAttribute("data-opens") === "compact" && await p.evaluate(() => localStorage.getItem("mock.f.live.homeStart.sam")) === "compact", "choosing compact stores kitchie.homeStart.<member> client-side");
await F(p, "live").locator("[data-p=reload]").click(); await p.waitForTimeout(200);
ok(await home(p, "live").getAttribute("data-opens") === "compact" && await F(p, "live").locator(".rest").count() === 0, "survives a reload");
ok(await F(p, "live").locator("[data-r=key]").textContent() === "mock.f.live.homeStart.sam", "the readout names the key");
await p.evaluate(() => localStorage.setItem("mock.f.live.homeStart.sam", "banana")); await F(p, "live").locator("[data-p=reload]").click(); await p.waitForTimeout(150);
ok(await home(p, "live").getAttribute("data-opens") === "full", "a bad stored value is ignored (full)");
await F(p, "live").locator("[data-p=compact]").click(); await F(p, "live").locator("[data-p=block]").check(); await F(p, "live").locator("[data-p=reload]").click(); await p.waitForTimeout(150);
ok(await home(p, "live").getAttribute("data-opens") === "full" && p.errs.length === 0, "storage blocked: opens full, nothing throws");
await F(p, "live").locator("[data-p=clear]").click();
await p.context().close();
p = await open("time=cook&next=open", { init: () => { Storage.prototype.getItem = function () { throw new Error("blocked"); }; Storage.prototype.setItem = function () { throw new Error("blocked"); }; } }).catch(e => null);
ok(p && await home(p, "live").getAttribute("data-opens") === "full" && p.errs.length === 0, "storage throwing on every call: still opens full, no error");
if (p) await p.context().close();

/* 7. trigger=focus: surfaces the moment the bar is tapped */
p = await open("time=cook&next=open&trigger=focus");
await F(p, "live").locator("input[type=search]").click(); await p.waitForTimeout(150);
ok(await F(p, "live").locator(".sg-host:not([hidden]) .idl").count() === 1, "?trigger=focus: the card surfaces at once");
await p.context().close();

/* 8. reduced motion: no animation, same behaviour */
p = await open("time=cook&next=open", { reduce: true });
await F(p, "live").locator("input[type=search]").click(); await p.waitForTimeout(2300);
ok(await F(p, "live").locator(".sg-host .idl").count() === 1, "reduced motion: the card still surfaces after the wait");
ok(await F(p, "live").locator(".sg-host .sg").evaluate(e => getComputedStyle(e).animationName).catch(() => "none") === "none", "reduced motion: the card has no animation");
ok(await p.evaluate(() => [...document.querySelectorAll(".fr .home *")].every(e => getComputedStyle(e).animationName === "none")), "reduced motion: nothing on Home animates");
await p.context().close();

/* 9. hygiene */
const css = readFileSync("fragments/mobile-home-compact-search/home.css", "utf8") + readFileSync("fragments/mobile-home-compact-search/search.css", "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in home.css or search.css (theme tokens only)");
ok(!/rgba?\(/.test(css), "no raw rgb colour in the stylesheets");
ok(!/@media\s*\(min-width/.test(css), "phone-width only: no min-width breakpoint in the stylesheets");
p = await open("time=cook&next=open", { theme: "kitchie-day" });
await F(p, "live").locator("input[type=search]").fill("egg"); await p.waitForTimeout(200);
ok(await F(p, "live").locator(".sres .g").filter({ hasText: "Left out" }).count() >= 0 && await F(p, "live").locator(".sres .i").count() > 0, "light theme: typing works");
const tapsSmall = await F(p, "compact").locator("button, input, a").evaluateAll(a => a.filter(e => e.offsetParent && !e.closest(".va") && e.getBoundingClientRect().height < 44).map(e => e.className || e.tagName));
ok(tapsSmall.length === 0, "compact frame: every control is 44px or more " + tapsSmall.join(","));
await p.context().close();
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED"); process.exit(fails ? 1 : 0);
