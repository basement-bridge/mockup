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
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine&sel=a:d:me:cap"); p = t.p;
  ok(`${tag} A: Preferences opens under itself (Mine, Household, one row per housemate with something to show)`, (await p.locator(".pf-kids .pf-nvc .pf-t").allInnerTexts()).join("|") === "Mine|Household|Sam|Maya|Someone else", await p.locator(".pf-kids .pf-nvc .pf-t").allInnerTexts());
  ok(`${tag} A: no Members and admins under Preferences`, !/members and admins/i.test(await p.locator(".pf-nav").innerText()));
  ok(`${tag} A: edit is a flyout`, await p.locator(".pf-fly").isVisible() && await p.locator(".pf-fly input[type=radio], .pf-fly [role=radio]").count() >= 2);
  await p.keyboard.press("Control+Escape");
  const mt = await p.locator("#pf-panel").innerText();
  ok(`${tag} A: Mine has the uat sections`, ["Ask me to check amounts", "Quiet hours", "Most suggestions per day", "Add a rule for a place or an item", "Switched off", "Your note", "Household note", "Added for you", "They are not about how much you have"].every(x => mt.toLowerCase().includes(x.toLowerCase())), mt.slice(0, 200));
  ok(`${tag} A: Mine has nothing about proposing for a housemate (round 7)`, !/add something for a housemate|added for housemates|propose something for/i.test(mt) && await p.locator("#pf-panel [data-sel=\"a:give\"], #pf-panel [data-pa=takeback]").count() === 0, mt.slice(0, 100));
  ok(`${tag} A: Mine keeps Added for you: dashed, Waiting for you, Confirm and Reject`, await p.locator("#pf-panel .pf-prop").count() === 1 && /Waiting for you/.test(mt) && await p.locator("#pf-panel [data-pa=confirm]").count() === 1);
  await shot(p, `pref-a-${w}-${mode}`);
  await p.locator('[data-sel="a:add:me"]').click(); await p.waitForSelector(".pf-fly .pf-pk");
  const pk0 = await p.locator(".pf-fly .pko, .pf-fly .pf-pko").count();
  ok(`${tag} A: add-rule picker is scoped, not a dump of every item`, pk0 > 0 && pk0 <= 20, pk0);
  await p.locator("#pk-q").fill("rice"); await p.waitForTimeout(150);
  ok(`${tag} A: picker searches by item`, await p.locator(".pf-fly .pf-pko").count() >= 1 && /rice/i.test(await p.locator(".pf-fly .pf-pko").first().innerText()));
  await shot(p, `pref-a-picker-${w}-${mode}`);
  await p.keyboard.press("Control+Escape");
  await p.locator("#pf-tab-preferences-hh").click();
  ok(`${tag} A: Household pane`, (await p.locator(".pf-head h2").innerText()) === "Household" && /Stock level check defaults/i.test(await p.locator("#pf-panel").innerText()) && !/members and admins/i.test(await p.locator("#pf-panel").innerText()));
  await p.locator('[data-as="sam"]').click(); await p.locator('[data-sel="a:d:hh:quiet"]').click();
  ok(`${tag} A: a member sees the household value read-only`, await p.locator(".pf-fly .pf-btn.pri").count() === 0 && /admin/i.test(await p.locator(".pf-fly").innerText()));
  await noNav(t, tag + " A"); await t.ctx.close();
  /* A: changed since last seen: the dot only (owner, 12 Oct 2026: SW-O13 resolved, option 2) */
  t = await open(w, h, mode, "open=preferences&pref=a&psub=hh"); p = t.p;
  let ht = await p.locator("#pf-panel").innerText();
  ok(`${tag} A dot: default frame shows dots on the changed rows and the Household gutter entry`, await p.locator("#pf-panel .pf-unseen .pf-dot").count() === 2 && await p.locator("#pf-tab-preferences-hh .pf-dot").count() === 1);
  ok(`${tag} A dot: no badge, no "changed this" line, no summary line`, await p.locator("#pf-panel .pf-chip.chg, #pf-panel .pf-chgline, #pf-panel .pf-sumbar, #pf-panel .pf-called").count() === 0 && !/changed since you last checked|changed this/.test(ht), ht.slice(0, 160));
  ok(`${tag} A dot: footer switcher is the dot only (Show, All seen), no 1/2/3 variants`, (await p.locator("[data-chg]").allInnerTexts()).join("|") === "Show|All seen");
  await shot(p, `pref-a-hh-dot-${w}-${mode}`);
  await p.locator('[data-sel="a:d:hh:cap"]').click(); await p.waitForTimeout(250);
  ok(`${tag} A dot: opening the row clears its dot; the other row and the gutter dot stay`, await p.locator('#pf-panel [data-sel="a:d:hh:cap"] .pf-dot').count() === 0 && await p.locator("#pf-panel .pf-unseen .pf-dot").count() === 1 && await p.locator("#pf-tab-preferences-hh .pf-dot").count() === 1);
  await p.keyboard.press("Control+Escape"); await p.locator('[data-sel="a:f:h2"]').click(); await p.waitForTimeout(250);
  ok(`${tag} A dot: opening the last changed row clears the gutter dot too`, await p.locator("#pf-panel .pf-dot").count() === 0 && await p.locator("#pf-tab-preferences-hh .pf-dot").count() === 0);
  await noNav(t, `${tag} A dot`); await t.ctx.close();
  for (const c of ["1", "3"]) {
    t = await open(w, h, mode, `open=preferences&pref=a&psub=hh&chg=${c}`); p = t.p;
    ok(`${tag} A chg=${c}: the old badge and summary links draw the dot`, await p.locator("#pf-panel .pf-unseen .pf-dot").count() === 2 && await p.locator("#pf-panel .pf-chip.chg, #pf-panel .pf-sumbar").count() === 0);
    await t.ctx.close();
  }
  t = await open(w, h, mode, "open=preferences&pref=a&psub=hh&chg=0"); p = t.p;
  ok(`${tag} A chg=0: all seen, no dots anywhere`, await p.locator(".pf-win .pf-dot").count() === 0);
  await t.ctx.close();
  /* A: dots on housemate rows (owner, 12 Oct 2026) */
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine"); p = t.p;
  ok(`${tag} A member dots: Sam (changed something, proposed for me) and Maya (changed something) have the same dot as Household`, await p.locator("#pf-tab-preferences-sam .pf-dot").count() === 1 && await p.locator("#pf-tab-preferences-maya .pf-dot").count() === 1 && await p.locator("#pf-tab-preferences-hh .pf-dot").count() === 1);
  await shot(p, `pref-a-member-dots-${w}-${mode}`);
  await p.locator("#pf-tab-preferences-sam").click(); await p.waitForTimeout(250);
  ok(`${tag} A member dots: opening Sam clears Sam's dot only`, await p.locator("#pf-tab-preferences-sam .pf-dot").count() === 0 && await p.locator("#pf-tab-preferences-maya .pf-dot").count() === 1 && await p.locator("#pf-tab-preferences-hh .pf-dot").count() === 1);
  await p.locator('[data-chg="0"]').click(); await p.waitForTimeout(200);
  ok(`${tag} A member dots: All seen leaves none`, await p.locator(".pf-nav .pf-dot").count() === 0);
  await p.locator('[data-chg="2"]').click(); await p.waitForTimeout(200);
  ok(`${tag} A member dots: Show brings them back (Sam is open, so Maya and Household)`, await p.locator("#pf-tab-preferences-maya .pf-dot").count() === 1 && await p.locator("#pf-tab-preferences-hh .pf-dot").count() === 1);
  await noNav(t, `${tag} A member dots`); await t.ctx.close();
  /* A: pending proposals: one visual both ways, controls differ, answered ones vanish at once */
  t = await open(w, h, mode, "open=preferences&pref=a&psub=sam"); p = t.p;
  const both = await p.locator("#pf-panel .pf-prop").evaluateAll(ns => ns.map(n => ({ cls: n.className, by: (n.querySelector(".pf-by") || {}).textContent, chip: (n.querySelector(".pf-chip.wait") || {}).textContent, chipCls: (n.querySelector(".pf-chip.wait") || {}).className, bs: [...n.querySelectorAll("button")].map(b => b.textContent.trim()).join("/"), bd: getComputedStyle(n).borderStyle })));
  ok(`${tag} A proposals: both directions on Sam's row share class, dashed style and chip class`, both.length === 2 && both[0].cls === both[1].cls && both[0].bd === both[1].bd && both[0].bd === "dashed" && both[0].chipCls === both[1].chipCls, both);
  ok(`${tag} A proposals: Proposed by you / Proposed by Sam, Waiting for Sam / Waiting for you`, both.some(x => x.by === "Proposed by you" && x.chip === "Waiting for Sam") && both.some(x => x.by === "Proposed by Sam" && x.chip === "Waiting for you"), both);
  ok(`${tag} A proposals: Take back only on mine; Confirm and Reject only on the one for me`, both.some(x => x.by === "Proposed by you" && x.bs === "Take back") && both.some(x => x.by === "Proposed by Sam" && x.bs === "Confirm/Reject"), both);
  await shot(p, `pref-a-proposals-both-${w}-${mode}`);
  await p.locator("[data-pa=confirm]").click(); await p.waitForTimeout(250);
  ok(`${tag} A proposals: Confirm makes it vanish at once; no answered state is drawn`, await p.locator("#pf-panel .pf-prop").count() === 1 && !/Confirmed|Answered|Kept|Rejected/.test(await p.locator("#pf-panel").innerText()));
  await p.locator("[data-pa=takeback]").click(); await p.waitForTimeout(250);
  ok(`${tag} A proposals: Take back makes it vanish at once; nothing waits on that row`, await p.locator("#pf-panel .pf-prop").count() === 0 && !/Taken back|Waiting for/.test(await p.locator("#pf-panel").innerText()));
  await noNav(t, `${tag} A proposals`); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine"); p = t.p;
  const mi = await p.locator("#pf-panel .pf-prop").evaluateAll(ns => ns.map(n => (n.querySelector(".pf-by") || {}).textContent + "|" + [...n.querySelectorAll("button")].map(b => b.textContent.trim()).join("/")));
  ok(`${tag} A proposals on Mine: only the one for you (Confirm/Reject); none by you (they live on the housemate's row)`, mi.length === 1 && mi[0] === "Proposed by Sam|Confirm/Reject", mi);
  await p.locator("[data-pa=reject]").click(); await p.waitForTimeout(250);
  ok(`${tag} A proposals: rejecting a non-safety one vanishes at once`, (await p.locator("#pf-panel .pf-prop").count()) === 0);
  await noNav(t, `${tag} A proposals on Mine`); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine&as=sam"); p = t.p;
  const asS = await p.locator("#pf-panel .pf-prop").evaluateAll(ns => ns.map(n => (n.querySelector(".pf-by") || {}).textContent + "|" + [...n.querySelectorAll("button")].map(b => b.textContent.trim()).join("/")));
  ok(`${tag} A proposals as Sam: Arjan's proposal for Sam has Confirm/Reject and says Proposed by Arjan`, asS.includes("Proposed by Arjan|Confirm/Reject"), asS);
  await p.locator("[data-pa=reject]").first().click(); await p.waitForTimeout(250);
  ok(`${tag} A proposals: rejecting a safety avoid asks once more, inline`, await p.locator(".pf-propconf").count() === 1 && /kept for safety/.test(await p.locator(".pf-propconf").innerText()));
  await p.locator("[data-pa=rejectyes]").click(); await p.waitForTimeout(250);
  ok(`${tag} A proposals: after Yes, reject it, nothing of it is left`, !/peanuts/.test(await p.locator("#pf-panel").innerText()));
  await noNav(t, `${tag} A proposals as Sam`); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine&sel=a:added"); p = t.p;
  ok(`${tag} A old link sel=a:added: opens Mine with no flyout`, await p.locator(".pf-fly").count() === 0 && await p.locator("#pf-panel .pf-prop").count() >= 1);
  await t.ctx.close();
  /* A: a member row, own items and a proposal */
  t = await open(w, h, mode, "open=preferences&pref=a&psub=sam"); p = t.p;
  const st = await p.locator("#pf-panel").innerText();
  ok(`${tag} A: member row is food only (Avoids, Likes) and read-only`, /avoids/i.test(st) && !/Quiet hours/.test(st) && await p.locator("#pf-panel [data-pa=dial]").count() === 0, st.slice(0, 160));
  ok(`${tag} A: member row shows my proposal, dashed, Waiting for Sam, with Take back`, await p.locator("#pf-panel .pf-prop").count() >= 1 && /Waiting for Sam/.test(st) && await p.locator("#pf-panel [data-pa=takeback]").count() >= 1);
  await shot(p, `pref-a-member-${w}-${mode}`);
  await noNav(t, tag + " A member"); await t.ctx.close();
  /* round 7: propose something for a housemate from that housemate's own row (Mine no longer has it) */
  t = await open(w, h, mode, "open=preferences&pref=a&psub=sam"); p = t.p;
  ok(`${tag} R7: Sam's row has Propose something for Sam, with his proposals under it`, await p.locator("#pf-panel [data-sel=\"a:give\"]").count() === 1 && /Propose something for Sam/.test(await p.locator("#pf-panel [data-sel=\"a:give\"]").innerText()));
  await p.locator('#pf-panel [data-sel="a:give"]').click(); await p.waitForSelector(".pf-fly .pf-in");
  const gf = await p.locator(".pf-fly").innerText();
  ok(`${tag} R7: the give form opens in place (flyout, no navigation), Sam is already chosen, no Who step`, !/who is it about/i.test(gf) && /what about sam/i.test(gf) && await p.locator(".pf-fly [data-pa=gwho]").count() === 0 && await p.evaluate(() => document.activeElement && document.activeElement.hasAttribute("data-gsubj")), gf.slice(0, 120));
  ok(`${tag} R7: form content is uat's: Avoids, Dislikes, Likes; for an avoid, why (safety, another reason, not sure)`, ["Avoids", "Dislikes", "Likes", "Safety (allergy", "Another reason", "Not sure"].every(x => gf.includes(x)) && /own list only/.test(gf) && /no end date/.test(gf));
  await shot(p, `r7-give-${w}-${mode}`);
  await p.locator(".pf-fly [data-pa=gsubmit]").click(); await p.waitForTimeout(150);
  ok(`${tag} R7: an empty subject is refused in the form`, await p.locator(".pf-fly .pf-err").count() === 1);
  await p.locator('.pf-fly [data-pa=gst][data-v="dislikes"]').click(); await p.locator(".pf-fly [data-gsubj]").fill("peaches");
  ok(`${tag} R7: a dislike has no Why step`, !/why\?/i.test(await p.locator(".pf-fly").innerText()));
  await p.locator(".pf-fly [data-pa=gsubmit]").click(); await p.waitForTimeout(250);
  const np = await p.locator("#pf-panel .pf-prop").evaluateAll(ns => ns.map(n => n.innerText.replace(/\s+/g, " ")));
  ok(`${tag} R7: the new proposal shows on Sam's row in the one visual, Proposed by you, Waiting for Sam, with Take back`, np.length === 3 && np.some(x => /peaches/.test(x) && /Proposed by you/.test(x) && /Waiting for Sam/.test(x) && /Take back/.test(x)) && await p.locator(".pf-fly").count() === 0, np);
  await p.locator("[data-pa=takeback]").last().click(); await p.waitForTimeout(200);
  ok(`${tag} R7: Take back clears it at once`, await p.locator("#pf-panel .pf-prop").count() === 2 && !/peaches/.test(await p.locator("#pf-panel").innerText()));
  await noNav(t, `${tag} R7 propose`); await t.ctx.close();
  /* nobody has a row with nothing to show: Someone else is the way to them */
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine"); p = t.p;
  ok(`${tag} R7: Jo has nothing to show, so no row; Someone else is last under Housemates`, (await p.locator(".pf-kids .pf-nvc .pf-t").allInnerTexts()).join("|") === "Mine|Household|Sam|Maya|Someone else");
  await p.locator("#pf-tab-preferences-else").click(); await p.waitForTimeout(200);
  ok(`${tag} R7: Someone else lists Jo, names only`, /Jo/.test(await p.locator("#pf-panel").innerText()) && await p.locator("#pf-panel [data-pa=gomember]").count() === 1);
  await p.locator("#pf-panel [data-pa=gomember]").click(); await p.waitForTimeout(200);
  ok(`${tag} R7: Jo's view is empty: no food, no proposals, still a Propose action; Jo's row shows while open`, /Nothing of Jo/.test(await p.locator("#pf-panel").innerText()) && await p.locator("#pf-panel .pf-prop").count() === 0 && await p.locator("#pf-panel [data-sel=\"a:give\"]").count() === 1 && await p.locator("#pf-tab-preferences-jo").count() === 1);
  await shot(p, `r7-empty-${w}-${mode}`);
  await p.locator('#pf-panel [data-sel="a:give"]').click(); await p.locator(".pf-fly [data-gsubj]").fill("nuts"); await p.locator(".pf-fly [data-pa=gsubmit]").click(); await p.waitForTimeout(250);
  ok(`${tag} R7: a proposal for Jo gives Jo a row`, await p.locator("#pf-panel .pf-prop").count() === 1);
  await p.locator("#pf-tab-preferences-mine").click(); await p.waitForTimeout(150);
  ok(`${tag} R7: Jo keeps a row while a proposal waits (with 1 waiting)`, /1 waiting/.test(await p.locator("#pf-tab-preferences-jo").innerText()));
  await noNav(t, `${tag} R7 else`); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=jo&sel=a:give"); p = t.p;
  ok(`${tag} R7: link psub=jo&sel=a:give opens Jo's form`, /Propose something for Jo/.test(await p.locator(".pf-fly").innerText()));
  await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine&sel=a:give"); p = t.p;
  ok(`${tag} R7: the old Mine give link opens Mine with no flyout`, await p.locator(".pf-fly").count() === 0);
  await t.ctx.close();
  /* household: members and admins live in Household settings */
  t = await open(w, h, mode, "open=household"); p = t.p;
  ok(`${tag}: Household settings holds Members and admins`, /members and admins/i.test(await p.locator("#pf-panel").innerText()));
  await t.ctx.close();
  /* profile: name in place, AI assistants */
  t = await open(w, h, mode, "open=me&ai=many"); p = t.p;
  ok(`${tag} profile: no separate Name field, name sits where the picture hint was, with a pencil`, await p.locator("#pf-panel label:has-text('Name')").count() === 0 && await p.locator("[data-act=editname] .pf-nmp").count() === 1 && !/tap the picture/i.test(await p.locator("#pf-panel").innerText()));
  await p.locator("[data-act=editname]").click(); await p.keyboard.press("ControlOrMeta+a"); await p.keyboard.type("Ari"); await p.keyboard.press("Enter");
  ok(`${tag} profile: name edits in place`, (await p.locator(".pf-nm").innerText()) === "Ari" && await p.locator("[data-nameinp]").count() === 0);
  await p.locator("[data-act=editname]").click(); await p.keyboard.press("ControlOrMeta+a"); await p.keyboard.type("Aria");
  ok(`${tag} profile: saves automatically as you type (gutter says Aria, hint says Saved, no Save button)`, (await p.locator(".pf-nwho b").innerText()) === "Aria" && /Saved/.test(await p.locator("[data-namehint]").innerText()) && await p.locator("#pf-who2 button:has-text('Save')").count() === 0);
  await p.keyboard.press("Escape");
  ok(`${tag} profile: Esc only closes the box; the saved name stays and the window stays`, (await p.locator(".pf-nm").innerText()) === "Aria" && await p.locator(".pf-win").isVisible());
  ok(`${tag} profile: connected assistants have chip and a radio, the unlinked one is greyed with Connect`, await p.locator(".pf-ai .pf-chip.ok").count() === 2 && await p.locator(".pf-ai [role=radio]").count() === 2 && await p.locator(".pf-ai.off [data-ai=connect]").count() === 1 && await p.locator(".pf-ai.off [role=radio]").count() === 0 && await p.locator("[data-ai=add]").count() === 1);
  await shot(p, `profile-${w}-${mode}`);
  await noNav(t, tag + " profile"); await t.ctx.close();
  /* kitchen setup: Locations, one form for add and edit */
  t = await open(w, h, mode, "open=settings&sub=locs"); p = t.p;
  const lt = await p.locator("#pf-panel").innerText();
  ok(`${tag} locs: rows show the name only (no counts, no spots)`, !/\d+ (items?|spots?)/.test(lt) && !/Crisper|Top shelf/.test(lt), lt);
  await p.locator('[data-sel="loc:fridge"]').click(); await p.waitForSelector(".pf-fly");
  const ef = await p.locator(".pf-fly").evaluate(n => [...n.querySelectorAll("label,.pf-lbl")].map(x => x.textContent.trim().toLowerCase()));
  ok(`${tag} locs: edit has Remove this location`, await p.locator(".pf-fly [data-act=rmloc]").count() === 1 && /Remove this location/.test(await p.locator(".pf-fly").innerText()));
  await p.keyboard.press("Control+Escape"); await p.locator('[data-sel="loc:new"]').click(); await p.waitForSelector(".pf-fly");
  const nf = await p.locator(".pf-fly").evaluate(n => [...n.querySelectorAll("label,.pf-lbl")].map(x => x.textContent.trim().toLowerCase()));
  ok(`${tag} locs: add and edit use the same fields`, ["name", "icon", "spots", "order"].every(f => ef.some(x => x.startsWith(f)) && nf.some(x => x.startsWith(f))), [ef, nf]);
  ok(`${tag} locs: add has no Remove, and Add stays off until a name`, await p.locator(".pf-fly [data-act=rmloc]").count() === 0 && await p.locator(".pf-fly [data-act=commitloc]").isDisabled());
  await p.keyboard.type("Garage"); ok(`${tag} locs: Add turns on with a name`, !(await p.locator(".pf-fly [data-act=commitloc]").isDisabled()));
  await p.locator(".pf-fly [data-act=commitloc]").click(); await p.waitForTimeout(200);
  ok(`${tag} locs: added row shows in the list`, /Garage/.test(await p.locator("#pf-panel").innerText()));
  await noNav(t, tag + " locs"); await t.ctx.close();
  /* categories: no "In this category" chips, counts stay */
  t = await open(w, h, mode, "open=settings&sub=cats&sel=cat:meat"); p = t.p;
  const cf = await p.locator(".pf-fly").innerText();
  ok(`${tag} cats: In this category block is gone, counts stay in rename hint and Remove or merge`, !/in this category/i.test(cf) && /3 items/.test(cf) && /Remove or merge/.test(cf), cf);
  await t.ctx.close();
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
  /* round 7: Preferences layout A on a phone or tablet */
  t = await open(w, h, mode, "open=preferences&pref=a&psub=hh"); p = t.p;
  ok(`${tag} phone A: the phone layout, tabs Mine and Household, no gutter tree, no flyout`, await p.locator(".pm-tabs [data-pa=mtab]").count() === 2 && await p.locator(".pf-kids").count() === 0 && await p.locator(".pf-fly").count() === 0 && await p.locator("iframe.pf-frame").count() === 0);
  ok(`${tag} phone A: clearly labelled as a mockup of the phone layout`, /phone and tablet layout/i.test(await p.locator(".pm-tag").innerText()));
  ok(`${tag} phone A: Household tab has the dot, so do the two changed rows, the Housemates group label and Sam and Maya`, await p.locator('.pm-tabs [data-v=hh] .pf-dot').count() === 1 && await p.locator("#pf-panel .pf-unseen .pf-dot").count() === 4 && await p.locator(".pm-hm .pf-lbl .pf-dot").count() === 1, await p.locator("#pf-panel .pf-dot").count());
  const hm = await p.locator(".pm-hm .pm-mrow").evaluateAll(ns => ns.map(n => n.innerText.replace(/\s+/g, " ")));
  ok(`${tag} phone A: Housemates rows say name, food count, N waiting`, hm.length === 2 && /Sam 3 food items.*2 waiting/.test(hm[0]) && /Maya 1 food item.*1 waiting/.test(hm[1]), hm);
  ok(`${tag} phone A: Someone else is a closed accordion row naming Jo`, await p.locator('[data-pa=melse]').getAttribute("aria-expanded") === "false" && /Jo/.test(await p.locator('[data-pa=melse]').innerText()));
  await shot(p, `m-r7-household-${w}-${mode}`);
  const overflow = async tg => ok(`${tag} phone A ${tg}: nothing scrolls sideways`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll(".pf-body,.pf-row,.pf-win")].every(n => n.scrollWidth <= n.clientWidth + 1)));
  await overflow("household");
  await p.locator('[data-pa=mtab][data-v=mine]').click(); await p.waitForTimeout(150);
  const mmt = await p.locator("#pf-panel").innerText();
  ok(`${tag} phone A: Mine has no outbound items and no Take back, keeps Added for you; the dot is not on Mine`, !/add something for a housemate|added for housemates/i.test(mmt) && /Added for you/i.test(mmt) && await p.locator("#pf-panel [data-pa=takeback]").count() === 0 && await p.locator('.pm-tabs [data-v=mine] .pf-dot').count() === 0);
  await shot(p, `m-r7-mine-${w}-${mode}`); await overflow("mine");
  await p.locator('[data-pa=mtab][data-v=hh]').click();
  await p.locator('[data-pa=gomember][data-id=sam]').click(); await p.waitForTimeout(200);
  ok(`${tag} phone A: opening Sam is a full page with a back link, not a flyout; his dot is gone, Maya's stays`, await p.locator(".pm-sub .pm-back").isVisible() && await p.locator(".pf-fly").count() === 0 && /Propose something for Sam/.test(await p.locator("#pf-panel").innerText()));
  const sp = await p.locator("#pf-panel .pf-prop").evaluateAll(ns => ns.map(n => ({ by: (n.querySelector(".pf-by") || {}).textContent, bs: [...n.querySelectorAll("button")].map(b => b.textContent.trim()).join("/"), r: ["t", "chip", "btn"].map((k) => k === "t" ? n.querySelector(".pf-t") : k === "chip" ? n.querySelector(".pf-chip") : n.querySelector("button")).map(e => e.getBoundingClientRect().top), w: n.getBoundingClientRect().width, hs: [...n.querySelectorAll("button")].map(b => b.getBoundingClientRect().height) })));
  ok(`${tag} phone A: Sam's proposals: Take back on mine, Confirm/Reject on the one for me`, sp.length === 2 && sp.some(x => x.by === "Proposed by you" && x.bs === "Take back") && sp.some(x => x.by === "Proposed by Sam" && x.bs === "Confirm/Reject"), sp);
  ok(`${tag} phone A: a proposal stacks (words, then chip, then buttons) and every button is 44px or more`, sp.every(x => x.r[0] < x.r[1] && x.r[1] < x.r[2] && x.hs.every(y => y >= 43.5)), sp);
  await shot(p, `m-r7-sam-${w}-${mode}`); await overflow("Sam");
  await p.locator('[data-sel="a:give"]').click(); await p.waitForSelector("#pm-give [data-gsubj]");
  ok(`${tag} phone A: Propose opens in place under its button (same page), subject focused`, await p.locator("#pm-give").isVisible() && await p.locator('[data-sel="a:give"]').getAttribute("aria-expanded") === "true" && await p.evaluate(() => document.activeElement.hasAttribute("data-gsubj")));
  await shot(p, `m-r7-give-${w}-${mode}`); await overflow("give");
  await p.locator("#pm-give [data-gsubj]").fill("peaches"); await p.locator("#pm-give [data-pa=gst][data-v=likes]").click(); await p.locator("#pm-give [data-pa=gsubmit]").click(); await p.waitForTimeout(200);
  ok(`${tag} phone A: the new proposal appears on Sam's page with Take back, the form closes`, await p.locator("#pf-panel .pf-prop").count() === 3 && await p.locator("#pm-give").count() === 0);
  await p.locator("[data-pa=takeback]").last().click(); await p.waitForTimeout(150);
  ok(`${tag} phone A: Take back clears it at once`, await p.locator("#pf-panel .pf-prop").count() === 2);
  await p.locator("[data-pa=confirm]").click(); await p.waitForTimeout(150);
  ok(`${tag} phone A: Confirm clears it at once`, await p.locator("#pf-panel .pf-prop").count() === 1);
  await p.locator('[data-pa=mback]').click(); await p.waitForTimeout(200);
  ok(`${tag} phone A: back returns to the Household tab; Sam's dot is gone, Maya's stays, the group dot stays; the tab dot stays`, await p.locator('[data-pa=gomember][data-id=sam] .pf-dot').count() === 0 && await p.locator('[data-pa=gomember][data-id=maya] .pf-dot').count() === 1 && await p.locator(".pm-hm .pf-lbl .pf-dot").count() === 1 && await p.locator('.pm-tabs [data-v=hh] .pf-dot').count() === 1);
  await p.locator('[data-pa=gomember][data-id=maya]').click(); await p.waitForTimeout(150); await p.locator('[data-pa=mback]').click(); await p.waitForTimeout(150);
  ok(`${tag} phone A: group dot clears with the last housemate; the tab dot stays while Household rows are unopened`, await p.locator(".pm-hm .pf-lbl .pf-dot").count() === 0 && await p.locator('.pm-tabs [data-v=hh] .pf-dot').count() === 1);
  await p.locator('[data-sel="a:d:hh:cap"]').click(); await p.waitForTimeout(150); await p.locator(".pm-back").click(); await p.waitForTimeout(150);
  await p.locator('[data-sel="a:f:h2"]').click(); await p.waitForTimeout(150); await p.locator(".pm-back").click(); await p.waitForTimeout(150);
  ok(`${tag} phone A: opening the last changed Household row clears every dot, tab included`, await p.locator(".pf-win .pf-dot").count() === 0);
  await p.locator('[data-pa=melse]').click(); await p.waitForTimeout(150);
  ok(`${tag} phone A: Someone else opens in place with Jo`, await p.locator('[data-pa=melse]').getAttribute("aria-expanded") === "true" && await p.locator("#pm-else-p [data-pa=gomember][data-id=jo]").isVisible());
  await shot(p, `m-r7-else-${w}-${mode}`);
  await p.locator("#pm-else-p [data-pa=gomember]").click(); await p.waitForTimeout(150);
  ok(`${tag} phone A: Jo's view is empty, with the Propose button`, /Nothing of Jo/.test(await p.locator("#pf-panel").innerText()) && await p.locator("#pf-panel .pf-prop").count() === 0 && await p.locator('[data-sel="a:give"]').isVisible());
  await shot(p, `m-r7-empty-${w}-${mode}`); await overflow("Jo");
  await noNav(t, `${tag} phone A household`); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=mine&sel=a:add:me"); p = t.p;
  ok(`${tag} phone A picker: a full page (back link), not a sheet, with scope All/Items/Categories/Places and a search box`, await p.locator(".pm-sub .pm-back").isVisible() && (await p.locator(".pm-sub .pf-pkseg button").allInnerTexts()).join("|") === "All|Items|Categories|Places" && await p.locator("#pk-q").isVisible() && await p.locator(".pm-sub select#pk-q, .pm-sub select[data-pa-sel=pkscope]").count() === 0);
  const pk0 = await p.locator(".pm-sub .pf-pko").count();
  ok(`${tag} phone A picker: quick picks only (not every item)`, pk0 > 0 && pk0 <= 10, pk0);
  await p.locator("#pk-q").fill("rice"); await p.waitForTimeout(150);
  ok(`${tag} phone A picker: searching finds the item`, /Rice/.test(await p.locator(".pm-sub .pf-pko").first().innerText()));
  const tg = await p.locator(".pm-sub .pf-pko, .pm-sub .pf-pkseg button, .pm-back, .pm-foot .pf-btn").evaluateAll(ns => ns.filter(n => n.getBoundingClientRect().height < 43.5).map(n => n.className));
  ok(`${tag} phone A picker: targets 44px or more`, tg.length === 0, tg);
  await shot(p, `m-r7-picker-${w}-${mode}`);
  await p.locator(".pm-sub .pf-pko").first().click(); await p.waitForTimeout(150);
  ok(`${tag} phone A picker: picking an item shows the level and how often, and Add the rule stays off until one is chosen`, await p.locator('.pm-sub [data-pa=addgo]').isDisabled());
  await p.locator('.pm-sub [data-pa=pklevel][data-v=quiet]').click(); await p.waitForTimeout(100);
  await p.locator('.pm-sub [data-pa=addgo]').click(); await p.waitForTimeout(200);
  ok(`${tag} phone A picker: Add the rule adds it and opens it (still a page)`, /Rice/.test(await p.locator(".pm-sub .pm-subh h3").innerText()));
  await overflow("picker");
  await p.keyboard.press("Control+Escape"); await p.waitForTimeout(150);
  ok(`${tag} phone A: the close chord goes back from a page first, the window stays`, await p.locator(".pm-sub").count() === 0 && await p.locator(".pf-win").isVisible());
  await p.locator('[data-sel="a:probe"]').click(); await p.waitForSelector("#pk-q");
  ok(`${tag} phone A probe: What applies to an item uses the same scoped picker`, (await p.locator(".pm-sub .pf-pkseg button").allInnerTexts()).join("|") === "All|Items|Categories|Places");
  await shot(p, `m-r7-probe-${w}-${mode}`);
  await noNav(t, `${tag} phone A picker`); await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=jo"); p = t.p;
  ok(`${tag} phone A: link psub=jo opens the empty view`, /Nothing of Jo/.test(await p.locator("#pf-panel").innerText()));
  await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=hh&chg=0"); p = t.p;
  ok(`${tag} phone A: chg=0 means no dots anywhere`, await p.locator(".pf-win .pf-dot").count() === 0);
  await t.ctx.close();
  t = await open(w, h, mode, "open=preferences&pref=a&psub=sam&as=sam"); p = t.p;
  ok(`${tag} phone A: as Sam, Sam's own page is Mine (not a housemate of himself)`, await p.locator(".pm-tabs").count() === 1);
  await t.ctx.close();
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
