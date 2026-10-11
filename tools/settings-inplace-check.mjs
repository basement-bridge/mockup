// Behaviour check for the Settings window, round 4 (owner, 11 Oct 2026): Settings opens under itself in the left gutter, detail is a flyout in the main area (nothing navigates),
// Install knows desktop from phone and tablet, History is docked above the keys line, Preferences layouts A/B/C. Mockup only.
// Usage:  python3 -m http.server 8124 &   then   node tools/settings-inplace-check.mjs   (SHOTS=dir saves a PNG of each frame; needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH)
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8124/fragments/desktop-profile/index.html";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const box = async (p, s) => p.locator(s).first().evaluate(n => { const r = n.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; });
const browser = await chromium.launch();
async function open(w, h, mode, q) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, mode === "dark" ? "kitchie" : "kitchie-day");
  const p = await ctx.newPage(), errs = [], navs = [];
  p.on("pageerror", e => errs.push(String(e)));
  p.on("framenavigated", f => { if (f === p.mainFrame()) navs.push(f.url()); });
  await p.goto(BASE + "?" + q); await p.waitForSelector(".pf-win"); await p.waitForTimeout(350);
  await p.evaluate(() => { window.__same = 1; });
  return { ctx, p, errs, navs };
}
const shot = async (p, n) => { if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/${n}.png` }); };
const noNav = async (t, tag) => { ok(`${tag}: same page (no navigation, no reload)`, await t.p.evaluate(() => window.__same === 1) && t.navs.length === 1); ok(`${tag}: no script errors`, t.errs.length === 0, t.errs); };
const sbs = (a, b) => a.l >= b.r - 2;

/* ---------- desktop 1024, 1280, 1440, light and dark ---------- */
for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900]]) for (const mode of ["light", "dark"]) {
  const tag = `${w} ${mode}`;
  /* gutter: five sections, History docked above the keys line */
  let t = await open(w, h, mode, "open=settings"); let p = t.p;
  ok(`${tag}: five sections, no History section`, (await p.locator(".pf-nav [role=tab][data-view]").evaluateAll(ns => ns.filter(n => !n.dataset.sub).map(n => n.dataset.view))).join() === "me,settings,preferences,household,data");
  ok(`${tag}: number keys 1 to 5`, (await p.locator(".pf-nav .pf-nvt:not(.pf-nvc) kbd").allInnerTexts()).join() === "1,2,3,4,5");
  const dock = await box(p, ".pf-dock"), keys = await box(p, ".pf-keysl");
  ok(`${tag}: History docked right above the keys line`, dock.b <= keys.t + 4 && keys.t - dock.b < 14, [dock, keys]);
  ok(`${tag}: History is not inside the tablist`, await p.locator(".pf-nav [role=tablist] .pf-dock").count() === 0);
  await p.locator(".pf-dock").click();
  ok(`${tag}: History click says it waits for the owner (nothing designed)`, /waiting for the owner/.test(await p.locator("#pf-toast").innerText()));
  /* Settings opens under itself */
  ok(`${tag}: Settings expanded in the gutter`, await p.locator("#pf-tab-settings").getAttribute("aria-expanded") === "true");
  ok(`${tag}: children Looks, Categories, Locations and spots, Install Kitchie`, (await p.locator(".pf-kids .pf-nvc .pf-t").allInnerTexts()).join("|") === "Looks|Categories|Locations and spots|Install Kitchie");
  ok(`${tag}: group labels Kitchen setup and Install`, (await p.locator(".pf-kids .pf-ngl").allInnerTexts()).join("|").toLowerCase() === "kitchen setup|install");
  ok(`${tag}: Settings pane no longer lists Categories or Locations rows`, await p.locator("#pf-panel [data-sel]").count() === 0);
  await shot(p, `looks-${w}-${mode}`);
  await p.locator("#pf-tab-settings-cats").click(); await p.waitForSelector("#pf-panel [data-sel]");
  ok(`${tag}: Categories opens in place`, (await p.locator(".pf-head h2").innerText()) === "Categories" && await p.locator("#pf-panel [data-sel]").count() === 10);
  ok(`${tag}: no flyout until a row is picked`, await p.locator(".pf-fly").count() === 0);
  await shot(p, `cats-${w}-${mode}`);
  await p.locator('[data-sel="cat:dairy"]').click(); await p.waitForTimeout(300);
  ok(`${tag}: flyout opens, the window stays`, await p.locator(".pf-fly").isVisible() && await p.locator(".pf-win").isVisible());
  const fly = await box(p, ".pf-fly"), row = await box(p, ".pf-row"), lst = await box(p, "#pf-panel");
  if (w >= 1280) ok(`${tag}: flyout beside the list (list still visible)`, sbs(fly, { r: lst.r }) && lst.w > 400 && fly.w >= 380, [fly, lst]);
  else ok(`${tag}: flyout takes the main area at 1024`, Math.abs(fly.l - row.l) <= 2 && Math.abs(fly.r - row.r) <= 2, [fly, row]);
  ok(`${tag}: gutter and header stay while the flyout is open`, await p.locator(".pf-nav").isVisible() && await p.locator(".pf-head h2").isVisible());
  ok(`${tag}: focus lands in the name box`, await p.evaluate(() => document.activeElement && document.activeElement.hasAttribute("data-flyfocus")));
  await p.keyboard.press("ControlOrMeta+a"); await p.keyboard.type("Dairy");
  ok(`${tag}: renaming updates the list at once`, (await p.locator('[data-sel="cat:dairy"] .pf-name').innerText()) === "Dairy");
  ok(`${tag}: remove stays off until a destination is picked`, await p.locator('[data-act="rmcat"]').isDisabled());
  await p.selectOption("select[data-mv]", "veg");
  ok(`${tag}: remove turns on and says where`, !(await p.locator('[data-act="rmcat"]').isDisabled()) && /to Vegetables and remove/.test(await p.locator('[data-act="rmcat"]').innerText()));
  await shot(p, `cats-flyout-${w}-${mode}`);
  await p.keyboard.press("Control+Escape");
  ok(`${tag}: close chord closes the flyout first`, await p.locator(".pf-fly").count() === 0 && await p.locator(".pf-win").isVisible());
  ok(`${tag}: focus returns to the row`, await p.evaluate(() => document.activeElement && document.activeElement.dataset.sel === "cat:dairy"));
  await p.keyboard.press("Control+Escape");
  ok(`${tag}: second chord closes the window`, await p.locator(".pf-win").count() === 0);
  await noNav(t, tag); await t.ctx.close();
  /* locations and spots, spot flyout */
  t = await open(w, h, mode, "open=settings&sub=locs&sel=spot:fridge.crisper"); p = t.p;
  ok(`${tag}: spot flyout from a link`, (await p.locator(".pf-fly h3").innerText()) === "Crisper" && await p.locator(".pf-head h2").innerText() === "Locations and spots");
  await shot(p, `locs-spot-${w}-${mode}`);
  await p.locator(".pf-fly .pf-flyback, .pf-fly .pf-x").first().isVisible();
  await p.keyboard.press("Control+Escape");
  await p.locator('[data-sel="loc:fridge"]').click();
  ok(`${tag}: location flyout lists its spots`, await p.locator(".pf-fly [data-sel^='spot:fridge']").count() === 4);
  await p.locator(".pf-fly [data-sel='spot:fridge.top']").click();
  ok(`${tag}: a spot opens from inside the location flyout`, (await p.locator(".pf-fly h3").innerText()) === "Top shelf");
  await noNav(t, tag); await t.ctx.close();
  /* install, desktop: browser variants */
  for (const [os, has] of [["chrome", "[data-inst=go]"], ["edge", "[data-inst=go]"], ["safari", ".pf-menu"], ["firefox", "[data-inst=copy]"]]) {
    t = await open(w, h, mode, `open=settings&sub=install&os=${os}`); p = t.p;
    ok(`${tag} ${os}: its own steps (${has})`, await p.locator("#pf-panel " + has).count() === 1 && (await p.locator("[data-detect]").getAttribute("data-detect")) === os);
    ok(`${tag} ${os}: not the phone steps`, await p.locator("#pf-panel [data-imob]").count() === 0 && !/Add to Home Screen/.test(await p.locator("#pf-panel").innerText()));
    ok(`${tag} ${os}: Install Kitchie is selected in the gutter`, await p.locator("#pf-tab-settings-install").getAttribute("aria-selected") === "true");
    if (os === "safari") ok(`${tag} safari: no install button (Safari cannot start one)`, await p.locator("[data-inst=go]").count() === 0);
    if (os === "firefox") ok(`${tag} firefox: says it cannot install`, /cannot install web apps/.test(await p.locator("#pf-panel").innerText()));
    await shot(p, `install-${os}-${w}-${mode}`);
    if (os === "chrome") { await p.locator("[data-inst=go]").click(); ok(`${tag} chrome: shows done once, button stays (reinstall any time)`, await p.locator(".pf-note.ok").count() === 1 && await p.locator("[data-inst=go]").isEnabled()); await shot(p, `install-chrome-done-${w}-${mode}`); await p.locator('[data-ib="safari"]').click(); ok(`${tag}: mockup switch swaps the variant`, await p.locator(".pf-menu").count() === 1); }
    await noNav(t, tag + " " + os); await t.ctx.close();
  }
  /* preferences: today, A, B, C */
  t = await open(w, h, mode, "open=preferences"); p = t.p;
  ok(`${tag}: Preferences today is still the embedded screen`, await p.locator("iframe.pf-frame").count() === 1);
  await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine&sel=pref:me:cap"); p = t.p;
  ok(`${tag} A: Preferences opens under itself (Mine, Household, Members and admins)`, (await p.locator(".pf-kids .pf-nvc .pf-t").allInnerTexts()).join("|") === "Mine|Household|Members and admins");
  ok(`${tag} A: edit is a flyout`, await p.locator(".pf-fly").isVisible() && await p.locator(".pf-fly input[type=radio]").count() === 3);
  await shot(p, `pref-a-${w}-${mode}`);
  await p.keyboard.press("Control+Escape"); await p.locator("#pf-tab-preferences-hh").click();
  ok(`${tag} A: Household list`, (await p.locator(".pf-head h2").innerText()) === "Household" && await p.locator("#pf-panel [data-sel]").count() === 9);
  await p.locator('[data-as="sam"]').click(); await p.locator('[data-sel="pref:hh:quiet"]').click();
  ok(`${tag} A: a member sees the household value read-only`, await p.locator(".pf-fly .pf-btn.pri").count() === 0 && /Only an admin/.test(await p.locator(".pf-fly").innerText()));
  await noNav(t, tag + " A"); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=b&sel=pref:hh:cap"); p = t.p;
  ok(`${tag} B: Mine and Household side by side on the same row`, await p.locator(".pf-sbs2").count() >= 6 && await p.locator(".pf-sbs2").first().evaluate(n => { const c = n.children; return c.length === 2 && c[1].getBoundingClientRect().left > c[0].getBoundingClientRect().right - 2; }));
  ok(`${tag} B: gutter stays flat (Preferences has no children)`, await p.locator(".pf-kids").count() === 0);
  ok(`${tag} B: household edit opens as a flyout`, await p.locator(".pf-fly").isVisible());
  await shot(p, `pref-b-${w}-${mode}`);
  await noNav(t, tag + " B"); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=c"); p = t.p;
  ok(`${tag} C: editor always open beside the list, no flyout`, await p.locator("#pf-ed").isVisible() && await p.locator(".pf-fly").count() === 0);
  const before = await p.locator("#pf-ed h3").innerText(); await p.locator('[data-csel="me:cap"]').click();
  ok(`${tag} C: picking a row changes the editor`, before !== await p.locator("#pf-ed h3").innerText());
  await p.locator('[data-ptab="hh"]').click();
  ok(`${tag} C: Household tab`, await p.locator('[data-csel^="hh:"]').count() > 0);
  await shot(p, `pref-c-${w}-${mode}`);
  await noNav(t, tag + " C"); await t.ctx.close();
  /* tap targets in the gutter and rows */
  t = await open(w, h, mode, "open=settings&sub=cats"); p = t.p;
  const small = await p.locator(".pf-nav .pf-nvt, #pf-panel .pf-item, #pf-panel .pf-btn").evaluateAll(ns => ns.filter(n => n.offsetParent && n.getBoundingClientRect().height < 43.5).map(n => n.className + n.textContent.slice(0, 20)));
  ok(`${tag}: tap targets at least 44px`, small.length === 0, small);
  await t.ctx.close();
}

/* ---------- phone and tablet: 360, 390, 768, no navigation, open in place ---------- */
for (const [w, h] of [[360, 780], [390, 844], [768, 1024]]) for (const mode of ["light", "dark"]) {
  const tag = `${w} ${mode}`;
  let t = await open(w, h, mode, "open=settings"); let p = t.p;
  ok(`${tag}: strip across the top, no tree, no History dock`, await p.locator(".pf-kids").count() === 0 && !(await p.locator(".pf-dock").isVisible()));
  ok(`${tag}: Kitchen setup rows and Install are rows under the theme card, nothing else`, await p.locator('[data-acc]').count() === 3 && await p.locator("#pf-panel [data-sel]").count() === 0);
  await shot(p, `m-settings-${w}-${mode}`);
  await p.locator('[data-acc="cats"]').click();
  ok(`${tag}: Categories opens under its row`, await p.locator('[data-acc="cats"]').getAttribute("aria-expanded") === "true" && await p.locator("#pf-acc-cats [data-sel]").count() === 10 && await p.locator("#pf-acc-cats").isVisible());
  await p.locator('[data-acc="locs"]').click();
  ok(`${tag}: one row open at a time`, await p.locator('[data-acc="cats"]').getAttribute("aria-expanded") === "false" && await p.locator("#pf-acc-locs").isVisible());
  await p.locator('[data-acc="cats"]').click(); await p.locator('[data-sel="cat:dairy"]').click(); await p.waitForTimeout(350);
  const fly = await box(p, ".pf-fly"), row = await box(p, ".pf-row");
  if (w < 600) ok(`${tag}: a bottom sheet`, Math.abs(fly.b - row.b) <= 2 && Math.abs(fly.l - row.l) <= 2 && Math.abs(fly.r - row.r) <= 2 && fly.h < row.h, [fly, row]);
  else ok(`${tag}: a drawer from the right`, Math.abs(fly.r - row.r) <= 2 && fly.w >= 330 && fly.w < row.w, [fly, row]);
  ok(`${tag}: the sheet or drawer fits (Done is on screen)`, (await box(p, ".pf-fly-f")).b <= h && await p.locator(".pf-fly-f .pf-btn").isVisible());
  await shot(p, `m-cat-${w}-${mode}`);
  await p.keyboard.press("Control+Escape");
  ok(`${tag}: close chord closes the sheet, the window stays, the row stays open`, await p.locator(".pf-fly").count() === 0 && await p.locator(".pf-win").isVisible() && await p.locator('[data-acc="cats"]').getAttribute("aria-expanded") === "true");
  ok(`${tag}: nothing scrolls sideways`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll(".pf-body,.pf-row,.pf-win")].every(n => n.scrollWidth <= n.clientWidth + 1)));
  await noNav(t, tag); await t.ctx.close();
  for (const os of ["ios", "android"]) {
    t = await open(w, h, mode, `open=settings&acc=install&os=${os}`); p = t.p;
    const txt = await p.locator("#pf-acc-install").innerText();
    ok(`${tag} ${os}: in place steps for the device, shared by phone and tablet`, os === "ios" ? /Add to Home Screen/.test(txt) && !/Install app/.test(txt) : /Install app/.test(txt) && !/Add to Home Screen/.test(txt));
    ok(`${tag} ${os}: no desktop browser steps`, await p.locator(".pf-menu, [data-ib], [data-inst=go]").count() === 0);
    await shot(p, `m-install-${os}-${w}-${mode}`);
    await noNav(t, tag + " " + os); await t.ctx.close();
  }
  t = await open(w, h, mode, "open=preferences&pref=b"); p = t.p;
  ok(`${tag}: phone and tablet keep the Preferences screen (the layouts are desktop only)`, await p.locator("iframe.pf-frame").count() === 1 && await p.locator(".pf-sbs").count() === 0);
  await t.ctx.close();
}

/* ---------- the window resizes live: desktop to phone keeps the open row ---------- */
{
  const t = await open(1280, 800, "light", "open=settings&sub=cats"); const p = t.p;
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(250);
  ok("resize to phone: Categories stays open, now under its row", await p.locator('[data-acc="cats"]').getAttribute("aria-expanded") === "true");
  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(250);
  ok("resize back: Categories is the open child again", await p.locator("#pf-tab-settings-cats").getAttribute("aria-selected") === "true");
  await t.ctx.close();
}
/* ---------- keys: arrows walk the gutter children; number keys; History letter is gone ---------- */
{
  const t = await open(1280, 800, "light", "open=settings"); const p = t.p;
  await p.locator("#pf-tab-settings-looks").focus(); await p.keyboard.press("ArrowDown"); await p.waitForSelector("#pf-panel [data-sel]"); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(150);
  ok("arrow down walks into the children (Looks, Categories, Locations)", await p.locator(".pf-head h2").innerText() === "Locations and spots");
  await p.keyboard.press("4"); ok("4 is Household now", await p.locator(".pf-head h2").innerText() === "Household");
  await p.keyboard.press("5"); ok("5 is My data", await p.locator(".pf-head h2").innerText() === "My data");
  await p.keyboard.press("6"); ok("6 does nothing (History is not a section)", await p.locator(".pf-head h2").innerText() === "My data");
  await p.keyboard.press("2"); ok("2 is Settings, back to Looks", await p.locator(".pf-head h2").innerText() === "Settings" && await p.locator("#pf-tab-settings-looks").getAttribute("aria-selected") === "true");
  await p.keyboard.press("Control+Escape");
  await p.keyboard.press("g"); await p.keyboard.press("y");
  ok("G then Y opens nothing", await p.locator(".pf-win").count() === 0);
  await t.ctx.close();
}
await browser.close();
console.log(`${total - fails} of ${total} checks passed`); process.exit(fails ? 1 : 0);
