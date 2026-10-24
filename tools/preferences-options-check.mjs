// Behaviour, tap-count, layout and Tab-order check for fragments/preferences-options (headless Chromium). Prints PASS or FAIL per check.
// Usage:  python3 -m http.server 8123 &   then   node tools/preferences-options-check.mjs
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: the nine options A to I at 390x844 and 360x640, light and dark, Match my phone and +30%, in three views (Mine, a rule opened, Everyone): no console error, no sideways scroll, nothing wider than the phone,
// every control at least 44px both ways; the four common jobs played tap by tap with the end state checked, and that directions.html prints those numbers; Tab reaches the last control of every option (and the
// sheet of H traps focus and gives it back); words budget of every button (3 words); behaviour (switch, quiet hours, stepper, Hard to Soft asks once, Stop remembering asks once, Everyone shows only the household's rules,
// F's arrows, G's chips, E's drill, D's cards); no hex colour in po.css or po.js; the knowledge note (SR-P69 on, SR-Q63 on), REVIEW-QUEUE and the index tile.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/preferences-options/";
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
const ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
async function ctx(theme, scheme, w, h) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  return c;
}
function track(p) { p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); }); return p; }
async function open(c, o, view = "mine", ts = 0, w = 390) {
  const pg = track(await c.newPage());
  await pg.goto(`${BASE}index.html?o=${o}&view=${view}&ts=${ts}&w=${w}&bare=1`); await pg.waitForSelector("body[data-ready]"); await pg.waitForTimeout(80);
  return pg;
}
const LAYOUT = () => {
  const ph = document.querySelector(".ph"), R = ph.getBoundingClientRect();
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; if (e.closest("[hidden],[inert]")) return false; return true; };
  const small = [], wide = [];
  for (const e of ph.querySelectorAll("button,input,textarea,[role=switch]")) {
    if (e.closest(".vh") || e.classList.contains("vh")) continue;
    let t = e; if (e.type === "checkbox") t = e.closest("label") || e; if (e.type === "hidden") continue;
    if (!vis(t)) continue; const r = t.getBoundingClientRect();
    if (r.height < 43.5 || r.width < 43.5) small.push((e.getAttribute("aria-label") || e.textContent || e.className).trim().slice(0, 24) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  for (const e of ph.querySelectorAll("*")) {
    if (!vis(e) || e.classList.contains("vh") || e.closest(".vh") || e.closest(".ln,.val,.ptt")) continue; const r = e.getBoundingClientRect(); /* a quiet line or a value is cut with an ellipsis on purpose */
    if (r.right > R.right + 1.5 || r.left < R.left - 1.5) wide.push(e.className && e.className.baseVal === undefined ? e.className : e.tagName);
  }
  const bd = ph.querySelector(".bd");
  const pg = ph.querySelector("[data-pager]");
  return { small, wide: wide.slice(0, 3), sx: document.documentElement.scrollWidth > innerWidth + 1 || bd.scrollWidth > bd.clientWidth + 1 || [...ph.querySelectorAll(".pgs:not([inert])")].some(x => x.scrollWidth > x.clientWidth + 1) };
};

/* 1. every option, three views, both widths, light and dark, both text sizes */
for (const [th, sc] of [["kitchie", "dark"], ["kitchie-day", "light"]]) for (const [w, h] of [[390, 844], [360, 640]]) for (const ts of [0, 3]) {
  const c = await ctx(th, sc, w, h); let bad = [], n = 0;
  for (const o of ORDER) for (const v of ["mine", "open", "hh"]) {
    const p = await open(c, o, v, ts, w); n++;
    const L = await p.evaluate(LAYOUT);
    if (p.errs.length || L.sx || L.wide.length || L.small.length) bad.push(`${o} ${v}: ${p.errs.join(";")} ${L.sx ? "scroll-x " : ""}${L.wide.join(",")} ${L.small.join(",")}`);
    await p.close();
  }
  ok(bad.length === 0, `${n} screens ${th} ${w}x${h} text ${ts ? "+30%" : "own"}: no error, no sideways scroll, nothing wider than the phone, controls 44px ${bad.slice(0, 4).join(" | ")}`);
  await c.close();
}

/* 2. the four jobs, played */
const C0 = await ctx("kitchie", "dark", 900, 1000); /* wide enough that the phone is its full 844 tall (under 600 wide the page makes it fit the window) */
const J = await (async () => { const p = await open(C0, "A"); const j = await p.evaluate(() => window.PO.JOBS); await p.close(); return j; })();
const visibleName = (p, name) => p.evaluate(n => { const ph = document.querySelector(".ph"), R = ph.getBoundingClientRect(); return [...ph.querySelectorAll(".bd .d")].some(e => { if (e.textContent.trim() !== n || e.closest("[hidden],[inert]")) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= R.top + 50 && r.bottom <= R.bottom + 1 && r.left >= R.left && r.right <= R.right + 1; }); }, name);
for (const o of ORDER) {
  const j = J[o];
  let p = await open(C0, o);
  for (const s of j.see) await p.click(s);
  const seen = (await visibleName(p, "gluten")) && (await visibleName(p, "iceberg lettuce"));
  ok(seen, `${o} see: ${j.see.length} tap(s) and both gluten and iceberg lettuce are on screen`); await p.close();
  p = await open(C0, o); for (const s of j.add) await p.click(s);
  const hint = await p.locator(".addhint").first().innerText().catch(() => "");
  ok(/Tell your assistant/.test(hint) && /peanuts/.test(hint), `${o} add an avoid: ${j.add.length} tap(s) and it says what to tell the assistant`); await p.close();
  p = await open(C0, o); for (const s of j.soft) await p.click(s);
  ok(await p.locator('[data-a="set:p:soft"][aria-checked="true"]').count() === 1 && await p.locator(".conf").count() === 0, `${o} Hard to Soft: ${j.soft.length} taps, Pasta is Soft and the confirm is gone`); await p.close();
  p = await open(C0, o); for (const s of j.scope) await p.click(s);
  ok(await p.locator('[data-a="scope:hh"][aria-checked="true"]').count() === 1, `${o} Mine to Everyone: ${j.scope.length} tap(s)`);
  const rows = await p.evaluate(() => [...document.querySelectorAll(".ph .bd .d")].map(e => e.textContent).filter(t => ["pasta", "roti", "iceberg lettuce"].includes(t)).length);
  ok(rows === 0, `${o} Everyone shows only the household's rules (no pasta, roti, iceberg lettuce)`); await p.close();
}
{ /* directions.html prints the same numbers, and a words count for every option */
  const p = track(await C0.newPage()); await p.goto(BASE + "directions.html"); await p.waitForSelector("body[data-ready]");
  let good = true, words = true;
  for (const o of ORDER) {
    const t = await p.evaluate(k => ["see", "add", "soft", "scope"].map(x => document.querySelector(`#row-${k} [data-t=${x}]`).textContent), o);
    const want = [J[o].see.length, J[o].add.length, J[o].soft.length, J[o].scope.length].map(String);
    if (t.join() !== want.join()) { good = false; console.log("  table", o, t, want); }
    const w = +(await p.locator(`#row-${o} [data-words]`).innerText()); if (!(w > 0 && w < 60)) words = false;
  }
  ok(good, "directions.html prints the played tap counts for all nine options");
  ok(words, "directions.html prints a words count for all nine options");
  ok(await p.locator(".cell").count() === 9, "directions.html draws nine phones");
  ok((await p.locator("#recbox").innerText()).includes("Recommendation") || (await p.locator("#recbox h3").count()) === 1, "directions.html carries a recommendation");
  ok(p.errs.length === 0, "directions.html: no console error " + p.errs.join(";"));
  const txt = await p.locator("body").innerText();
  ok(/SR-Q63/.test(txt) && /0\.177\.0/.test(txt) && /0\.180\.0/.test(txt), "directions.html has the open questions and the 0.177.0 / 0.180.0 comparison");
  await p.close();
}

/* 3. Tab order: every control of every option is reached, in order, and the last one is reached */
for (const o of ORDER) for (const v of ["mine", "open"]) {
  const p = await open(C0, o, v);
  const info = await p.evaluate(() => {
    const ph = document.querySelector(".ph"); const f = [...ph.querySelectorAll("button,input,textarea,a[href]")].filter(e => !e.disabled && !e.closest("[hidden],[inert]") && !e.classList.contains("vh") && getComputedStyle(e).visibility !== "hidden" && !(e.type === "checkbox" && false) && (e.getBoundingClientRect().width > 0 || e.type === "checkbox"));
    f.forEach((e, i) => e.setAttribute("data-tabi", i)); f[0].focus(); return f.length;
  });
  const seen = new Set([0]); let last = 0, order = true;
  for (let i = 0; i < info + 2; i++) { await p.keyboard.press("Tab"); const k = await p.evaluate(() => { const a = document.activeElement; const i = a && a.getAttribute && a.getAttribute("data-tabi"); return i == null ? -1 : +i; }); if (k >= 0) { if (k < last && k !== 0) order = false; seen.add(k); last = k; } }
  ok(seen.has(info - 1) && seen.size >= info - 1 && order, `${o} ${v}: Tab reaches the last of ${info} controls in screen order (${seen.size} seen)`);
  await p.close();
}
{ /* H's sheet traps focus, Escape closes, focus returns to the row */
  const p = await open(C0, "H"); await p.click('[data-a="sheet:p"]');
  let inside = true; for (let i = 0; i < 14; i++) { await p.keyboard.press("Tab"); if (!(await p.evaluate(() => !!document.activeElement.closest(".shp")))) inside = false; }
  ok(inside, "H: while the sheet is open Tab never leaves it");
  await p.keyboard.press("Escape");
  ok((await p.locator(".shp").count()) === 0 && (await p.evaluate(() => document.activeElement.getAttribute("data-fk"))) === "sheet:p", "H: Escape closes the sheet and focus returns to the Pasta row");
  await p.close();
}

/* 4. behaviour */
const txt = (p, s) => p.locator(s).first().innerText();
{ const p = await open(C0, "A");
  ok(await p.locator('[data-sw]').isChecked(), "A: Amount checks starts on");
  await p.click("label.sw"); ok(!(await p.locator('[data-sw]').isChecked()), "A: the switch turns checks off");
  ok((await txt(p, '[data-ctl="quiet"] .val')) === "10pm–6am", "A: Quiet hours shows its value, 10pm–6am, on the row");
  await p.click('[data-a="q"]'); ok(await p.locator('input[data-q]').count() === 2, "A: tapping the value opens the two times");
  await p.locator('input[data-q="s"]').fill("21:30"); ok((await txt(p, '[data-ctl="quiet"] .val')) === "9:30pm–6am", "A: changing a time changes the value on the row");
  await p.click('[data-a="qnone"]'); ok((await txt(p, '[data-ctl="quiet"] .val')) === "Off", "A: No quiet hours shows Off");
  await p.click('[data-a="qagain"]'); ok((await txt(p, '[data-ctl="quiet"] .val')) !== "Off", "A: Use quiet hours brings the times back");
  await p.click('[data-a="step:1"]'); ok((await txt(p, '[data-ctl="cap"] b')) === "4", "A: the stepper goes 3 to 4");
  await p.click('[data-a="tog:p"]'); await p.click('[data-a="set:p:soft"]');
  ok(await p.locator(".conf").count() === 1 && /still turn up/.test(await txt(p, ".conf")), "A: Hard to Soft asks once");
  await p.click('[data-a="keep"]'); ok(await p.locator('[data-a="set:p:hard"][aria-checked="true"]').count() === 1, "A: Keep hard leaves it Hard");
  await p.click('[data-a="set:p:soft"]'); await p.click('[data-a="softok:p"]'); await p.click('[data-a="set:p:hard"]');
  ok(await p.locator('[data-a="set:p:hard"][aria-checked="true"]').count() === 1 && await p.locator(".conf").count() === 0, "A: Soft back to Hard asks nothing");
  await p.click('[data-a="stop:p"]'); ok(await p.locator(".conf").count() === 1, "A: stopping a Hard rule asks once");
  await p.click('[data-a="stopok:p"]'); ok(await p.locator('[data-a="tog:p"]').count() === 0, "A: Remove takes Pasta off the list");
  await p.click('[data-a="tog:i"]'); await p.click('[data-a="stop:i"]'); ok(await p.locator('[data-a="tog:i"]').count() === 0 && await p.locator(".conf").count() === 0, "A: stopping a Soft rule asks nothing");
  await p.click('[data-a="disc:notes"]'); await p.locator("textarea").fill("No nuts"); await p.click('[data-a="disc:notes"]'); ok((await txt(p, '[data-ctl="notes"] .val')) === "No nuts", "A: Assistant notes opens a box and shows its text as the value");
  ok(p.errs.length === 0, "A: no console error while played " + p.errs.join(";")); await p.close(); }
{ const p = await open(C0, "F"); ok(await p.locator('.pgs:not([inert])').count() === 1, "F: one page is live, the others are inert");
  await p.click('[data-a="pg:1"]'); await p.waitForTimeout(500); ok((await txt(p, ".ptt b")) === "Likes" && await p.locator('.pgs:not([inert]) .d', { hasText: "rice noodles" }).count() === 1, "F: the next arrow shows Likes");
  await p.click('[data-a="pg:-1"]'); await p.waitForTimeout(500); ok((await txt(p, ".ptt b")) === "Avoids", "F: the previous arrow goes back");
  await p.evaluate(() => { const pg = document.querySelector("[data-pager]"); pg.scrollTo({ left: pg.clientWidth * 2 }); }); await p.waitForTimeout(700);
  ok((await txt(p, ".ptt b")) === "Swaps" && await p.locator('.pgs:not([inert]) .d', { hasText: "white bread" }).count() === 1, "F: swiping two pages lands on Swaps and the page is live"); await p.close(); }
{ const p = await open(C0, "G"); ok((await p.locator('[data-a="tab:avoid"]').getAttribute("aria-checked")) === "true", "G: Avoids is chosen on arrival");
  await p.click('[data-a="tab:like"]'); ok(await p.locator(".bd .d", { hasText: "rice noodles" }).count() === 1 && await p.locator(".bd .d", { hasText: "pasta" }).count() === 0, "G: the Likes chip shows the likes and hides the avoids");
  ok((await txt(p, '[data-a="tab:avoid"]')).includes("6"), "G: each chip carries its count"); await p.close(); }
{ const p = await open(C0, "E"); ok((await txt(p, '[data-a="drill:food"]')).includes("6 avoids · 3 likes"), "E: the top level shows Food with 6 avoids · 3 likes");
  await p.click('[data-a="drill:quiet"]'); ok((await txt(p, ".ttl")) === "Quiet hours" && await p.locator('input[data-q]').count() === 2, "E: Quiet hours drills to its times");
  await p.click('[data-a="back"]'); ok((await txt(p, ".ttl")) === "Preferences", "E: Back returns to the values"); await p.close(); }
{ const p = await open(C0, "D"); ok(await p.locator(".bd .d", { hasText: /^gluten, pasta/ }).count() === 1 && (await p.locator(".bd .row").count()) === 0, "D: cards are closed on arrival, with a preview and no rows");
  await p.click('[data-a="grp:like"]'); await p.click('[data-a="grp:avoid"]'); ok(await p.locator('[data-a="grp:like"][aria-expanded="true"]').count() === 0, "D: opening one card closes the other"); await p.close(); }
{ const p = await open(C0, "B"); const t = await txt(p, ".bd ul.list"); ok(/Never\s+gluten/.test(t) && /Rather not\s+iceberg lettuce/.test(t) && /Swap\s+white bread/.test(t), "B: rows read as sentences (Never gluten, Rather not iceberg lettuce, Swap white bread)"); await p.close(); }
{ const p = await open(C0, "I"); await p.click('[data-a="tog:g"]'); ok(await p.locator('.cloud .ped').count() === 1 && await p.locator('[data-a="tog:g"][aria-expanded="true"]').count() === 1, "I: tapping a chip opens its detail under the cloud"); await p.close(); }
{ const p = await open(C0, "C"); ok(await p.locator('.kg.ring').count() === 1, "C: only Everyone's rule has the ring (gluten)"); ok(await p.locator('.cbar [data-a="addany"]').count() === 1, "C: Add is the round button in the bottom bar with Mine and Everyone"); await p.close(); }

/* 5. words budget: no button says more than 3 words of its own (data, values and screen-reader text are not counted) */
for (const o of ORDER) {
  const p = await open(C0, o, "open"); const over = await p.evaluate(() => {
    const out = []; for (const e of document.querySelectorAll(".ph button:not([hidden])")) { if (e.closest("[hidden],[inert]")) continue; const c = e.cloneNode(true); c.querySelectorAll(".d,.vh,.val,svg,.dots").forEach(x => x.remove()); const w = c.textContent.replace(/[·→–]/g, " ").split(/\s+/).filter(x => /[A-Za-z0-9]/.test(x)); if (w.length > 3) out.push(w.join(" ")); } return out; });
  ok(over.length === 0, `${o}: every button is 3 words or fewer ${over.join(" | ")}`); await p.close();
}
await C0.close();

/* 6. files */
const css = readFileSync(new URL("../fragments/preferences-options/po.css", import.meta.url), "utf8"), js = readFileSync(new URL("../fragments/preferences-options/po.js", import.meta.url), "utf8");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/&#\d+;/g, "")), "no hex colour in po.css");
ok(!/#[0-9a-fA-F]{3,8}\b/.test(js.replace(/&#\d+;/g, "")) && !/rgba?\(/.test(js), "no hex or rgb colour in po.js");
const kn = readFileSync(new URL("../docs/knowledge/jobs-to-be-done/settings-redesign.md", import.meta.url), "utf8");
ok(/SR-P69/.test(kn) && /SR-Q63/.test(kn) && /preferences-options/.test(kn), "the knowledge note carries the new SR-P and SR-Q numbers and links the fragment");
ok(/fragments\/preferences-options/.test(readFileSync(new URL("../REVIEW-QUEUE", import.meta.url), "utf8")), "REVIEW-QUEUE has the line");
ok(/fragments\/preferences-options\//.test(readFileSync(new URL("../index.html", import.meta.url), "utf8")), "the root index has the tile");
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED"); process.exit(fails ? 1 : 0);
