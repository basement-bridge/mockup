// Behaviour and layout check for fragments/mobile-home-g (headless Chromium, phone 390x844). Prints PASS or FAIL per check; optional screenshots.
// Usage:  python3 -m http.server 8123 &   then   node tools/mobile-home-g-check.mjs [--shots=shots/mobile-home-g]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: nine frames draw in both themes, no console error, no sideways scroll; for EVERY time x next-meal x cards-with-something state, search and the lead idea (with Make it and Plan) are on the first screen with no scroll,
// Cooking ideas is the first card and never moves, the collapsed cards follow the order rule and an empty card is not drawn at all (no heading, no chevron); collapsed by default, chevron opens in place (aria-expanded, keyboard);
// the search button is a small 48px named control in the greeting row, in the same box on Home, Pantry and Shopping; tap takes the screen (greeting, cards and bottom bar step aside, no This week strip);
// nothing before 2 s, then exactly one card, announced once, focus kept; the ladder for every window and state (running low and going off never lead at cooking time); typing from 2 characters; Esc/Cancel restore Home, scroll and focus;
// deferred files load only on the first tap; reduced motion; 44px targets; phone-only; no hex colour.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/mobile-home-g/";
const shots = (process.argv.find(a => a.startsWith("--shots=")) || "").slice(8);
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const TIMES = ["morning", "midday", "cook", "after"], NEXTS = ["open", "planned", "missing", "nofit"], HAS = ["both", "soon", "low", "none"];
const FR = ["live", "rest", "open", "tapped", "surfaced", "typing", "nomatch", "pantry", "shopping"];
async function open(q = "", { theme = "kitchie", reduce = false, init = null } = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduce ? "reduce" : "no-preference" });
  await c.addInitScript(t => { if (!sessionStorage.getItem("__i")) { localStorage.setItem("theme", t); sessionStorage.setItem("__i", "1"); } }, theme);
  if (init) await c.addInitScript(init);
  const p = await c.newPage(); p.errs = []; p.reqs = [];
  p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text())) p.errs.push(m.text()); });
  p.on("request", r => p.reqs.push(r.url().replace(/^.*\/mobile-home-g\//, "").replace(/\?.*$/, "")));
  await p.goto(BASE + (q ? "?" + q : "")); await p.waitForSelector("body[data-ready]:not([data-ready=''])", { state: "attached" }); await p.waitForTimeout(300); return p;
}
const F = (p, f) => p.locator(`.fr[data-frame=${f}]`);
const home = (p, f) => F(p, f).locator(".home");
const vis = (p, s) => p.locator(s).evaluateAll(a => a.filter(e => e.offsetParent !== null).length);
const card = (p, f) => F(p, f).locator(".sg-host:not([hidden]) .idl");
const hide = p => p.addStyleTag({ content: ".themebtn,#themeBtn,[class*=theme-fab]{display:none!important}" }).catch(() => {});
// what the order rule must give, written out independently of home.js
const wantOrder = (t, n, h) => { const pref = t === "cook" ? ["low", "soon"] : (t === "morning" || t === "midday") && n === "missing" ? ["low", "soon"] : ["soon", "low"]; return pref.filter(k => k === "soon" ? (h === "both" || h === "soon") : (h === "both" || h === "low")); };

/* 1. every frame, both themes: draws, no errors, no sideways scroll; screenshots at several scroll points */
for (const theme of ["kitchie", "kitchie-day"]) {
  const p = await open("time=cook&next=open", { theme });
  ok(await p.locator(".fr").count() === 9, `${theme}: nine phone frames`);
  ok(p.errs.length === 0, `${theme}: no console errors ${p.errs.join(";")}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}: no sideways page scroll at 390`);
  ok(await p.evaluate(() => [...document.querySelectorAll(".pf")].every(e => Math.round(e.getBoundingClientRect().width) <= 390 && Math.round(e.getBoundingClientRect().height) === 844)), `${theme}: frames are 390 wide and 844 high`);
  ok(await p.evaluate(() => [...document.querySelectorAll(".pf")].every(e => e.querySelector(".pbody").scrollWidth <= 391)), `${theme}: no frame scrolls sideways`);
  if (shots) {
    for (const f of FR) for (const [n, y] of [["top", 0], ["mid", 300], ["end", 99999]]) {
      const sc = F(p, f).locator(".pbody"); await sc.evaluate((e, y) => { e.scrollTop = y; }, y); await p.waitForTimeout(40);
      if (n !== "top" && await sc.evaluate(e => e.scrollHeight <= e.clientHeight + 2)) continue;
      await F(p, f).locator(".pf").screenshot({ path: `${shots}/${f}-${n}-${theme}-cook-open.png` });
    }
  }
  await p.context().close();
}

/* 2. every state: first screen, order, empty means absent */
let shown = 0;
for (const theme of ["kitchie", "kitchie-day"]) for (const t of TIMES) for (const n of NEXTS) for (const h of HAS) {
  const both = theme === "kitchie";
  if (!both && h !== "both") continue;                    // the full matrix in the dark theme, the main one in the light theme
  const p = await open(`time=${t}&next=${n}&has=${h}`, { theme });
  const tag = `${theme} ${t}/${n}/${h}`, f = F(p, "rest");
  const g = await f.evaluate(fr => {
    const pf = fr.querySelector(".pf").getBoundingClientRect(), bar = fr.querySelector(".bar").getBoundingClientRect(), s = fr.querySelector(".sbtn").getBoundingClientRect(), idl = fr.querySelector(".ideas .idl"), btn = fr.querySelectorAll(".ideas .idl .acts .btn");
    const rest = fr.querySelector(".rest"), kids = [...rest.children];
    return { sTop: s.top - pf.top, sBot: s.bottom - pf.top, sH: s.height, sW: s.width, barTop: bar.top, btnBottom: Math.max(...[...btn].map(e => e.getBoundingClientRect().bottom)), nb: btn.length,
      first: kids[0] && kids[0].classList.contains("ideas"), order: kids.slice(1).map(k => k.dataset.fold), folds: fr.querySelectorAll(".fold").length, chev: fr.querySelectorAll(".chv").length, tog: fr.querySelectorAll(".tog").length, dataOrder: fr.querySelector(".home").dataset.order,
      before: fr.querySelector(".hbar").nextElementSibling.className, hbarFirst: fr.querySelector(".home").firstElementChild.className };
  });
  const w = wantOrder(t, n, h);
  ok(g.btnBottom <= g.barTop && g.nb === 2 && g.sBot < 70, `${tag}: search and the lead idea (Make it, Plan) are on the first screen, no scroll`);
  ok(g.first, `${tag}: Cooking ideas is the first card`);
  ok(JSON.stringify(g.order) === JSON.stringify(w), `${tag}: collapsed cards ${JSON.stringify(g.order)} follow the order rule ${JSON.stringify(w)}`);
  ok(g.folds === w.length && g.chev === w.length && g.tog === w.length, `${tag}: an empty card is not drawn (no heading, no chevron): ${w.length} drawn`);
  if (shots) { await hide(p); await f.locator(".pf").screenshot({ path: `${shots}/rest-${t}-${n}-${h}-${theme}.png` }); if (h === "both") await F(p, "surfaced").locator(".pf").screenshot({ path: `${shots}/surfaced-${t}-${n}-${theme}.png` }); }
  await p.context().close(); shown++;
}

/* 3. collapsed by default, chevron opens in place, keyboard */
let p = await open("time=cook&next=open&only=live");
const lh = home(p, "live");
ok(await lh.locator(".tog").evaluateAll(a => a.every(e => e.getAttribute("aria-expanded") === "false")) && await lh.locator(".fb:not([hidden])").count() === 0, "by default every card is collapsed");
ok(await lh.locator(".fb").evaluateAll(a => a.every(e => !e.firstChild)), "a collapsed card has no body markup yet (written on first open)");
const rh0 = await lh.locator(".tilec.fold").first().evaluate(e => e.getBoundingClientRect().height);
ok(rh0 <= 72, `a collapsed card is one row (${Math.round(rh0)}px)`);
await lh.locator(".tog").first().click();
ok(await lh.locator(".tog").first().getAttribute("aria-expanded") === "true" && await lh.locator(".fold").first().locator(".minis span").count() > 0 && await lh.locator(".fold").first().locator(".va").count() === 1, "chevron opens the card in place: names and View all");
ok(await lh.locator(".tog").first().evaluate(e => e.getBoundingClientRect().height >= 44), "the toggle row is a 44px target");
ok(/items/.test(await lh.locator(".tog .n").first().innerText()) || (await lh.locator(".tog .n .sr").first().textContent()).includes("items"), "the count is text with an accessible 'items'");
await lh.locator(".tog").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(50);
ok(await lh.locator(".tog").first().getAttribute("aria-expanded") === "false" && await lh.locator(".fold").first().locator(".fb").evaluate(e => e.hidden), "Enter closes it again");
ok(await lh.locator(".fold .chv").first().evaluate(e => e.tagName.toLowerCase()) === "svg", "state shown by the chevron's shape (turned over), not colour alone");
await p.context().close();

/* 4. the search button: small, named, same box on Home, Pantry, Shopping; the greeting row */
p = await open("time=cook&next=open");
const box = async f => F(p, f).locator(".sbtn").evaluate(e => { const r = e.getBoundingClientRect(), pf = e.closest(".pf").getBoundingClientRect(); return [Math.round(r.left - pf.left), Math.round(r.top - pf.top), Math.round(r.width), Math.round(r.height)].join(","); });
const bh = await box("rest"), bp = await box("pantry"), bs = await box("shopping");
ok(bh === bp && bp === bs, `the search button is in the same place and box on Home, Pantry and Shopping (${bh} | ${bp} | ${bs})`);
const [bx, by, bw, bhh] = bh.split(",").map(Number);
ok(bw === 48 && bhh === 48 && bw >= 44, "the search button is 48 x 48, a small quiet box (44px minimum met)");
ok(bx + bw >= 390 - 16 - 2, "it sits at the right edge, in the right thumb's corner");
ok(await F(p, "rest").locator(".hbar").evaluate(e => { const h1 = e.querySelector(".hi").getBoundingClientRect(), s = e.querySelector(".sbtn").getBoundingClientRect(); return Math.abs((h1.top + h1.height / 2) - (s.top + s.height / 2)) < 4 && s.left > h1.left; }), "search is in the SAME ROW as the greeting, at the right");
ok(await F(p, "rest").locator(".sbtn").getAttribute("aria-label") === "Search" && await F(p, "rest").locator(".sbtn").innerText() === "", "icon-only, with the accessible name 'Search'");
ok(await F(p, "pantry").locator(".sbtn").getAttribute("aria-label") === "Search" && await F(p, "shopping").locator(".sbtn").getAttribute("aria-label") === "Search", "named on Pantry and Shopping too");
ok(await p.locator(".fr[data-frame=rest] .srch").evaluate(e => getComputedStyle(e).display) === "none", "at rest there is no search field drawn on the page (not a real estate hogging bar)");
ok(await F(p, "rest").locator(".sbtn").evaluate(e => getComputedStyle(e.closest(".hbar")).position) === "sticky", "the greeting row stays on screen while Home scrolls (same spot)");
ok(await F(p, "open").locator(".pbody").evaluate(e => { e.scrollTop = 9999; const r = e.querySelector(".sbtn").getBoundingClientRect(), pf = e.closest(".pf").getBoundingClientRect(); return r.top - pf.top < 12; }), "scrolled to the end: search is still at the top");
ok(await p.locator(".fr[data-frame=rest] .wk, .fr[data-frame=rest] .wd").count() === 0, "no This week on mobile Home");
ok(!/Dashboard|Compact view/.test(await home(p, "rest").innerText()), "no Dashboard or Compact view label");
ok(await p.locator(".hv-ctl, .hv-handle, [role=switch], .seg, [data-hv-switch]").count() === 0, "no switch control of any kind on Home");
await p.context().close();

/* 5. the takeover: tap, nothing, then one card; nothing else kept */
p = await open("time=cook&next=open&only=live");
ok(!p.reqs.some(r => /search\.(js|css)$/.test(r)), "default path: search.js and search.css are not fetched on load");
ok(p.reqs.filter(r => /^(home\.css|home\.js|mock\.js)$/.test(r)).length === 3, "default path: home.css, home.js, mock.js are loaded");
await home(p, "live").locator(".tog").first().click();
await F(p, "live").locator(".pbody").evaluate(e => { e.scrollTop = 60; });
const before = await F(p, "live").locator(".pbody").evaluate(e => e.scrollTop);
await F(p, "live").locator(".sbtn").click(); await p.waitForTimeout(150);
ok(p.reqs.some(r => r === "search.js") && p.reqs.some(r => r === "search.css"), "first tap on the magnifier fetches search.js and search.css");
ok(await home(p, "live").getAttribute("data-mode") === "search", "tap: the field takes the screen");
ok(await F(p, "live").locator(".hbar").isHidden() && await vis(p, ".fr[data-frame=live] .rest") === 0 && await F(p, "live").locator(".ideas").isHidden() && await F(p, "live").locator(".fold").first().isHidden(), "tap: the greeting, Cooking ideas and both cards step aside with the same weight");
ok(await F(p, "live").locator(".srch").isVisible() && await p.evaluate(() => document.activeElement && document.activeElement.tagName === "INPUT"), "tap: the field is shown and focused");
ok(await F(p, "live").locator(".wk, .wd").count() === 0, "tap: no pinned This week strip");
ok(await F(p, "live").locator(".kbm").isVisible() && await F(p, "live").locator(".bar").isHidden(), "tap: the keyboard shows, the bottom bar steps aside");
ok(await F(p, "live").locator(".sg-host:not([hidden])").count() === 0, "tap: nothing surfaces at once");
await p.waitForTimeout(1200);
ok(await F(p, "live").locator(".sg-host:not([hidden])").count() === 0, "1.2 s idle: still nothing");
await p.waitForTimeout(1000);
ok(await F(p, "live").locator(".sg-host:not([hidden]) .idl").count() === 1 && await F(p, "live").locator(".sres:not([hidden])").count() === 0, "after about 2 s idle: exactly one card, not a list");
ok(await p.evaluate(() => document.activeElement && document.activeElement.tagName === "INPUT"), "the card never steals focus");
ok(/Suggestion\. Fits tonight/.test(await F(p, "live").locator(".hv-live").textContent()) && await F(p, "live").locator(".hv-live").getAttribute("aria-live") === "polite", "announced once through a polite live region");
ok(await F(p, "live").locator(".sg-host .btn").first().evaluate(e => e.getBoundingClientRect().height >= 44), "card buttons are 44px or more");
ok(await F(p, "live").locator(".sg-host .top2, .sg-host .btn, .sg-host .why, .sg-host .k, .sg-host .ph").count() >= 5, "the card uses the existing Home class names (.top2 .btn .why .k .ph)");
ok(await F(p, "live").locator(".srch .cx").evaluate(e => e.getBoundingClientRect().height >= 44), "Cancel is a 44px target");
await F(p, "live").locator("input[type=search]").fill("c"); await p.waitForTimeout(150);
ok(await F(p, "live").locator(".sg-host:not([hidden]), .sres:not([hidden])").count() === 0, "one character: no list, no card");
const input = F(p, "live").locator("input[type=search]");
await input.fill("ch"); await p.waitForTimeout(150);
ok(await F(p, "live").locator(".sres:not([hidden]) .i").count() > 0 && await F(p, "live").locator(".sg-host:not([hidden])").count() === 0, "two characters: desktop's dropdown replaces the card");
await input.fill("chick"); await p.waitForTimeout(150);
const gh = await F(p, "live").locator(".sres .g").allTextContents();
ok(/Fits tonight/.test(gh[0]) && gh.some(t => /In your pantry/.test(t)) && gh.some(t => /Needs a shop/.test(t)), "chick: Fits tonight, In your pantry, Needs a shop, in order " + gh.join("|"));
ok(await F(p, "live").locator(".sres .i").count() <= 6 && (await F(p, "live").locator(".sres .i").evaluateAll(a => a.map(e => e.getBoundingClientRect().height))).every(h => h >= 44), "at most six rows, each 44px or more");
ok(await F(p, "live").locator(".sres").evaluate(e => e.getBoundingClientRect().bottom <= document.querySelector(".fr[data-frame=live] .kbm").getBoundingClientRect().top + 1), "the dropdown never runs under the keyboard");
await input.press("ArrowDown"); await p.waitForTimeout(40);
ok(await F(p, "live").locator(".sres .i[aria-selected=true]").count() === 1 && !!(await input.getAttribute("aria-activedescendant")), "arrows move the highlight (aria-activedescendant)");
await input.press("Enter"); await p.waitForTimeout(60);
ok(/mock/.test(await F(p, "live").locator(".toast").textContent()), "Enter opens the highlighted row (a stub)");
await input.fill("zzz"); await p.waitForTimeout(150);
ok(/Nothing matches/.test(await F(p, "live").locator(".sres").innerText()) && await F(p, "live").locator(".sres .i[data-kind=addlist]").count() === 1, "no match: says so and offers Add to the shopping list");
await input.fill(""); await p.waitForTimeout(2400);
ok(await F(p, "live").locator(".sg-host:not([hidden]) .idl").count() === 1, "emptying the field brings the wait and then the one card back");
await input.press("Escape"); await p.waitForTimeout(300);
ok(await home(p, "live").getAttribute("data-mode") === "rest" && await F(p, "live").locator(".kbm").evaluate(e => e.hidden), "Esc with nothing typed gives the screen back");
ok(Math.abs(await F(p, "live").locator(".pbody").evaluate(e => e.scrollTop) - before) < 3, "Home returns scrolled exactly where it was");
ok(await F(p, "live").locator(".tog").first().getAttribute("aria-expanded") === "true", "an opened card is still open on return");
ok(await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("sbtn")), "focus returns to the magnifier");
await F(p, "live").locator(".sbtn").click(); await p.waitForTimeout(100); await F(p, "live").locator(".cx").click(); await p.waitForTimeout(250);
ok(await home(p, "live").getAttribute("data-mode") === "rest", "Cancel gives the screen back");
await F(p, "live").locator(".sbtn").click(); await input.fill("lime"); await F(p, "live").locator("figcaption").click({ force: true }); await p.waitForTimeout(150);
ok(await home(p, "live").getAttribute("data-mode") === "search" && await F(p, "live").locator(".sres:not([hidden])").count() === 1, "blur with words keeps the dropdown");
await p.context().close();

/* 6. the ladder: every window x next state (cards both present), one card, never running low or going off at cooking time; and with a card missing */
const EXP = {
  "morning.open": /Going off tomorrow/, "morning.planned": /^Tonight/, "morning.missing": /Needs buying/, "morning.nofit": /Nothing fits tonight/,
  "midday.open": /^Tonight/, "midday.planned": /Running low/, "midday.missing": /Needs buying/, "midday.nofit": /Nothing fits tonight/,
  "cook.open": /Fits tonight/, "cook.planned": /Planned for tonight/, "cook.missing": /Planned for tonight/, "cook.nofit": /Nothing fits tonight/,
  "after.open": /For tomorrow/, "after.planned": /Planned for tomorrow/, "after.missing": /Planned for tomorrow/, "after.nofit": /Nothing fits tomorrow/
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
for (const [t, n, h, re] of [["morning", "open", "low", /^Tonight/], ["morning", "open", "none", /^Tonight/], ["midday", "planned", "soon", /^Tonight/], ["midday", "planned", "none", /^Tonight/], ["midday", "missing", "none", /Needs buying/]]) {
  p = await open(`time=${t}&next=${n}&has=${h}`);
  const k = await card(p, "surfaced").locator(".k").textContent();
  ok(re.test(k), `${t}/${n}/has ${h}: the card does not reach for a card that is empty ("${k}")`);
  await p.context().close();
}

/* 7. cooking ideas label: when it applies */
for (const [t, re] of [["morning", /^Today/i], ["midday", /^Today/i], ["cook", /^Today/i], ["after", /^Coming up/i]]) {
  p = await open(`time=${t}&next=open`);
  ok(re.test(await F(p, "rest").locator(".ideas .k").first().innerText()), `${t}: Cooking ideas is labelled ${re}`);
  await p.context().close();
}

/* 8. trigger=focus, reduced motion */
p = await open("time=cook&next=open&trigger=focus&only=live");
await F(p, "live").locator(".sbtn").click(); await p.waitForTimeout(250);
ok(await F(p, "live").locator(".sg-host:not([hidden]) .idl").count() === 1, "?trigger=focus: the card surfaces at once");
await p.context().close();
p = await open("time=cook&next=open&only=live", { reduce: true });
await F(p, "live").locator(".sbtn").click(); await p.waitForTimeout(2300);
ok(await F(p, "live").locator(".sg-host .idl").count() === 1, "reduced motion: the card still surfaces after the wait");
await F(p, "live").locator(".cx").click(); await F(p, "live").locator(".tog").first().click();
ok(await p.evaluate(() => [...document.querySelectorAll(".fr .home *")].every(e => getComputedStyle(e).animationName === "none" && getComputedStyle(e).transitionDuration.split(",").every(d => parseFloat(d) === 0))), "reduced motion: nothing on Home animates or transitions");
await p.context().close();

/* 9. hygiene */
const css = readFileSync("fragments/mobile-home-g/home.css", "utf8") + readFileSync("fragments/mobile-home-g/search.css", "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in home.css or search.css (theme tokens only)");
ok(!/rgba?\(/.test(css), "no raw rgb colour in the stylesheets");
ok(!/@media\s*\(min-width/.test(css), "phone-width only: no min-width breakpoint in the stylesheets");
p = await open("time=cook&next=open", { theme: "kitchie-day" });
const lo = await F(p, "rest").locator(".fold .tt small").first().evaluate(e => getComputedStyle(e).color);
ok(!!lo && p.errs.length === 0, "light theme draws without errors");
await p.context().close();
// the other option fragments are untouched by this branch (only checked when run inside a git checkout)
console.log(fails ? `\n${fails} FAILED` : `\nall passed (${shown} states drawn)`);
await b.close(); process.exit(fails ? 1 : 0);
