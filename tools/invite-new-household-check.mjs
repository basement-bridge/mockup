// Behaviour check for "Set someone up with their own household" (owner, 12 Oct 2026; mockup only): the gutter entry, the modal and its four states, the way back to the existing
// join invite, the recipient sign-up pages with the personal message, desktop and mobile widths, light and dark.
// Usage:  python3 -m http.server 8124 &   then   node tools/invite-new-household-check.mjs   (SHOTS=dir saves a PNG of each frame; needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH)
import { chromium } from "playwright-core";
const ROOT = process.env.ROOT || "http://localhost:8124/fragments/";
const PROF = ROOT + "desktop-profile/index.html", START = ROOT + "invite-new-household/start.html", NOTES = ROOT + "invite-new-household/index.html";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await chromium.launch();
async function open(url, w, h, mode, wait) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, mode === "dark" ? "kitchie" : "kitchie-day");
  const p = await ctx.newPage(), errs = [], navs = [];
  p.on("pageerror", e => errs.push(String(e)));
  p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  p.on("framenavigated", f => { if (f === p.mainFrame()) navs.push(f.url()); });
  await p.goto(url); await p.waitForSelector(wait || ".pf-win"); await p.waitForTimeout(350);
  await p.evaluate(() => { window.__same = 1; });
  return { ctx, p, errs, navs };
}
const shot = async (p, n) => { if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/${n}.png` }); };
const noNav = async (t, tag) => { ok(`${tag}: same page (no navigation, no reload)`, await t.p.evaluate(() => window.__same === 1) && t.navs.length === 1); ok(`${tag}: no script errors`, t.errs.length === 0, t.errs); };
const box = async (p, s) => p.locator(s).first().evaluate(n => { const r = n.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; });
const noSide = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll(".pf-inv,.pf-inv .pf-body,.pf-win,.st")].every(n => n.scrollWidth <= n.clientWidth + 1));
const MSG = "Hi Priya, this is what I use to keep track of our fridge.";

/* ---------- desktop ---------- */
for (const [w, h] of [[1024, 768], [1280, 860], [1440, 900]]) for (const mode of ["light", "dark"]) {
  const tag = `${w} ${mode}`;
  let t = await open(`${PROF}?open=me`, w, h, mode); let p = t.p;
  const ent = await box(p, ".pf-invent"), dock = await box(p, ".pf-dock"), keys = await box(p, ".pf-keysl");
  ok(`${tag}: the entry is in the left gutter, at the bottom, just above History`, ent.r <= 246 && ent.b <= dock.t + 2 && dock.t - ent.b < 14 && ent.t > 300, [ent, dock]);
  ok(`${tag}: History is still right above the keys line`, dock.b <= keys.t + 4 && keys.t - dock.b < 14);
  ok(`${tag}: the entry says what it is: set someone up, with their own household`, /Set someone up/.test(await p.locator(".pf-invent").innerText()) && /with their own household/.test(await p.locator(".pf-invent").innerText()));
  ok(`${tag}: it is not a section (no number key, not a tab)`, await p.locator(".pf-invent[role=tab]").count() === 0 && await p.locator(".pf-invent kbd").count() === 0);
  ok(`${tag}: five sections still, number keys 1 to 5`, (await p.locator(".pf-nav .pf-nvt:not(.pf-nvc) kbd").allInnerTexts()).join() === "1,2,3,4,5");
  await shot(p, `invite-entry-${w}-${mode}`);
  /* open it */
  await p.locator(".pf-invent").click(); await p.waitForSelector(".pf-inv");
  const dlg = p.locator(".pf-inv"), tx = await dlg.innerText();
  ok(`${tag}: opens as a modal dialog over the window (not a flyout, not a panel)`, await dlg.getAttribute("role") === "dialog" && await dlg.getAttribute("aria-modal") === "true" && await p.locator(".pf-scrim").count() === 2 && await p.locator(".pf-fly").count() === 0);
  const bx = await box(p, ".pf-inv"), win = await box(p, ".pf-win");
  ok(`${tag}: the modal is centred and smaller than the window`, bx.w < win.w - 100 && Math.abs((bx.l + bx.r) / 2 - w / 2) < 3 && bx.t > 0 && bx.b <= h, [bx, win]);
  ok(`${tag}: the window behind is inert`, await p.evaluate(() => [...document.querySelectorAll(".pf-scrim")].filter(s => !s.querySelector(".pf-inv")).every(s => s.inert)));
  ok(`${tag}: unmistakably their OWN household, not joining`, /Set someone up with their own household/.test(tx) && /Their own household/.test(tx) && /Not joining Our kitchen/.test(tx) && /not a member of it/.test(tx) && /Brand new and empty/.test(tx) && /not joined/i.test(tx), tx.slice(0, 300));
  ok(`${tag}: the way back is there and says what it is`, await p.locator(".pf-inv [data-inv=back]").count() === 1 && /Invite someone to Our kitchen/.test(await p.locator(".pf-inv [data-inv=back]").innerText()) && /different invite/.test(tx));
  ok(`${tag}: focus is in the message field`, await p.evaluate(() => document.activeElement && document.activeElement.id === "inv-msg"));
  ok(`${tag}: empty state: counter 0 of 280, the link is not made yet`, /0 of 280/.test(tx) && await p.locator("#inv-link").count() === 0 && await p.locator("[data-inv=create]").isEnabled());
  ok(`${tag}: nothing in the modal is a real address`, !/https?:\/\//.test(tx));
  await shot(p, `invite-empty-${w}-${mode}`);
  /* number keys and ? do nothing while the modal is open */
  await p.locator("[data-inv=create]").focus(); await p.keyboard.press("4");
  ok(`${tag}: number keys do not move the window behind`, await p.locator(".pf-win .pf-head h2").innerText() === "Profile" && await p.locator(".pf-inv").isVisible());
  await p.keyboard.press("?"); ok(`${tag}: ? opens nothing on top of the modal`, await p.locator(".pf-scrim").count() === 2);
  await p.locator("#inv-msg").focus(); await p.keyboard.type(MSG);
  ok(`${tag}: typing counts and does not leave the modal`, new RegExp(`${MSG.length} of 280`).test(await p.locator("#inv-count").innerText()) && await p.locator(".pf-inv").isVisible());
  ok(`${tag}: the mockup switch follows the typing (Filled)`, await p.locator("[data-inv=state][aria-checked=true]").innerText() === "Filled");
  await shot(p, `invite-filled-${w}-${mode}`);
  /* create and copy */
  await p.locator("[data-inv=create]").click(); await p.waitForSelector("#inv-link");
  ok(`${tag}: link created: a sample link, once, 48 hours, their own household`, (await p.locator("#inv-link").inputValue()) === "kitchie.example/start/sample-link" && /Works once/.test(await p.locator(".pf-inv").innerText()) && /48 hours/.test(await p.locator(".pf-inv").innerText()) && /cannot see its items/.test(await p.locator(".pf-inv").innerText()));
  ok(`${tag}: what they will see shows the typed message`, (await p.locator(".pf-invq").innerText()).includes(MSG));
  const href = await p.locator(".pf-inv a.pf-lnk").getAttribute("href");
  ok(`${tag}: the sign-up link carries the message`, href.includes("start.html") && decodeURIComponent(href).includes(MSG), href);
  ok(`${tag}: the way back is still offered under the link`, await p.locator(".pf-inv [data-inv=back]").count() === 1);
  await shot(p, `invite-created-${w}-${mode}`);
  await p.locator("[data-inv=copy]").click();
  ok(`${tag}: copied: the button says Copied, a line says what to do`, /Copied/.test(await p.locator("[data-inv=copy]").innerText()) && /Paste it into a message/.test(await p.locator("#inv-copied").innerText()));
  await shot(p, `invite-copied-${w}-${mode}`);
  /* the way back */
  await p.locator("[data-inv=back]").click(); await p.waitForTimeout(300);
  ok(`${tag}: way back closes the modal and shows Household`, await p.locator(".pf-inv").count() === 0 && await p.locator(".pf-win .pf-head h2").innerText() === "Household");
  ok(`${tag}: ...pointing at the existing Invite someone button, focused`, await p.evaluate(() => document.activeElement && document.activeElement.hasAttribute("data-hhinvite")) && /Invite someone/.test(await p.locator("[data-hhinvite]").innerText()));
  ok(`${tag}: ...and says what it is`, /Invite someone, below|own household/.test(await p.locator("#pf-toast").innerText()));
  await shot(p, `invite-way-back-${w}-${mode}`);
  /* reopen: what was typed is kept */
  await p.locator(".pf-invent").click(); await p.waitForSelector(".pf-inv");
  ok(`${tag}: reopened: the link made is still shown (going back and forth costs nothing)`, await p.locator("#inv-link").count() === 1);
  await p.locator("[data-inv=another]").click(); await p.waitForSelector("#inv-msg");
  ok(`${tag}: Make another link starts again, empty`, (await p.locator("#inv-msg").inputValue()) === "" && /0 of 280/.test(await p.locator("#inv-count").innerText()));
  /* close keys */
  await p.keyboard.press("Escape"); ok(`${tag}: plain Esc closes nothing`, await p.locator(".pf-inv").isVisible());
  await p.keyboard.press("Control+Escape");
  ok(`${tag}: the close chord closes the modal first, the window stays, focus returns to the entry`, await p.locator(".pf-inv").count() === 0 && await p.locator(".pf-win").isVisible() && await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("pf-invent")));
  await noNav(t, tag); await t.ctx.close();
  /* every state from the address */
  for (const st of ["empty", "filled", "created", "copied"]) {
    t = await open(`${PROF}?open=invite&inv=${st}`, w, h, mode, ".pf-inv"); p = t.p;
    const s = await p.locator(".pf-inv").innerText();
    if (st === "empty") ok(`${tag} inv=${st}: empty field`, (await p.locator("#inv-msg").inputValue()) === "" && /0 of 280/.test(s));
    if (st === "filled") ok(`${tag} inv=${st}: filled field and counter`, /Priya/.test(await p.locator("#inv-msg").inputValue()) && !/0 of 280/.test(s));
    if (st === "created") ok(`${tag} inv=${st}: link ready, Copy link`, await p.locator("#inv-link").count() === 1 && /Copy link/.test(await p.locator("[data-inv=copy]").innerText()));
    if (st === "copied") ok(`${tag} inv=${st}: Copied`, /Copied/.test(await p.locator("[data-inv=copy]").innerText()));
    await p.waitForTimeout(300);
    const small = await p.locator(".pf-inv button:not(.pf-mock button), .pf-inv a.pf-lnk, .pf-inv input, .pf-inv textarea").evaluateAll(ns => ns.filter(n => n.offsetParent && !n.closest(".pf-mock") && n.getBoundingClientRect().height < 43.5).map(n => n.className + n.textContent.slice(0, 20)));
    ok(`${tag} inv=${st}: tap targets at least 44px`, small.length === 0, small);
    ok(`${tag} inv=${st}: nothing scrolls sideways and the buttons are on screen`, await noSide(p) && await p.locator(".pf-invbtns").isVisible() && (await box(p, ".pf-invbtns")).b <= h, await box(p, ".pf-invbtns"));
    await noNav(t, `${tag} inv=${st}`); await t.ctx.close();
  }
  /* the Me row opens the same modal */
  t = await open(`${PROF}?open=me`, w, h, mode); p = t.p;
  await p.locator("#pf-panel [data-inv=open]").click(); await p.waitForSelector(".pf-inv");
  ok(`${tag}: Me, Other households row opens the same modal`, /Set someone up with their own household/.test(await p.locator(".pf-inv").innerText()));
  await t.ctx.close();
  /* Household still has its own Invite someone (not redrawn, not changed) */
  t = await open(`${PROF}?open=household`, w, h, mode); p = t.p;
  ok(`${tag}: Household still has Invite someone, the join invite (it says nothing about own households)`, await p.locator("[data-hhinvite]").count() === 1 && !/own household/i.test(await p.locator("#pf-panel").innerText()));
  await t.ctx.close();
  /* recipient side */
  t = await open(`${START}?s=landing&m=${encodeURIComponent(MSG)}`, w, h, mode, ".st-card"); p = t.p;
  ok(`${tag} recipient: lands on sign-up with the message visible`, (await p.locator("#st-note").innerText()).includes(MSG) && /note from arjan/i.test(await p.locator("#st-note").innerText()) && /Start my kitchen with Google/.test(await p.locator("#st-go").innerText()));
  ok(`${tag} recipient: says it is their own kitchen and the inviter is not a member`, /kitchen of your own/.test(await p.locator("h1").innerText()));
  await shot(p, `recipient-landing-${w}-${mode}`);
  await p.locator("#st-go").click(); await p.waitForSelector("#st-create");
  ok(`${tag} recipient: after sign-in the message is still there, and the last step is creating their household`, (await p.locator("#st-note").innerText()).includes(MSG) && /Create my household/.test(await p.locator("#st-create").innerText()) && (await p.locator("#st-name").inputValue()) === "My kitchen");
  await shot(p, `recipient-household-${w}-${mode}`);
  await t.ctx.close();
  t = await open(`${START}?s=landing&msg=none`, w, h, mode, ".st-card"); p = t.p;
  ok(`${tag} recipient: no message, no note card, same page`, await p.locator("#st-note").count() === 0 && /Start my kitchen/.test(await p.locator("#st-go").innerText()));
  await shot(p, `recipient-nomessage-${w}-${mode}`);
  await t.ctx.close();
  t = await open(`${START}?s=landing&m=${encodeURIComponent("<b onclick=x>bold</b><img src=x onerror=alert(1)>")}`, w, h, mode, ".st-card"); p = t.p;
  ok(`${tag} recipient: the message is text, never markup`, (await p.locator("#st-note").innerText()).includes("<b onclick=x>bold</b>") && await p.locator("#st-note b, #st-note img").count() === 0);
  await t.ctx.close();
  t = await open(NOTES, w, h, mode, ".wrap"); p = t.p;
  const nt = await p.locator(".wrap").innerText();
  ok(`${tag} notes page: says it is a growth feature, mockup only, and lists open questions`, /growth feature/i.test(nt) && /current behaviour stays/i.test(nt) && /Open questions/.test(nt));
  await t.ctx.close();
}

/* ---------- mobile widths ---------- */
for (const [w, h] of [[360, 780], [390, 844], [768, 1024]]) for (const mode of ["light", "dark"]) {
  const tag = `${w} ${mode}`;
  let t = await open(`${PROF}?open=me`, w, h, mode); let p = t.p;
  ok(`${tag}: no gutter entry in the strip (the Me row opens the modal)`, !(await p.locator(".pf-invent").isVisible()));
  await p.locator("#pf-panel [data-inv=open]").click(); await p.waitForSelector(".pf-inv");
  ok(`${tag}: the Me row opens the modal here too`, /Set someone up with their own household/.test(await p.locator(".pf-inv").innerText()));
  await t.ctx.close();
  for (const st of ["empty", "filled", "created", "copied"]) {
    t = await open(`${PROF}?open=invite&inv=${st}`, w, h, mode, ".pf-inv"); p = t.p;
    const bx = await box(p, ".pf-inv");
    ok(`${tag} ${st}: the modal fits the screen`, bx.l >= 0 && bx.r <= w && bx.t >= 0 && bx.b <= h, bx);
    ok(`${tag} ${st}: nothing scrolls sideways`, await noSide(p));
    const mb = st === "created" || st === "copied" ? "[data-inv=done]" : "[data-inv=create]";
    ok(`${tag} ${st}: the main button is visible and on screen`, await p.locator(mb).isVisible() && (await box(p, mb)).h > 30 && (await box(p, mb)).b <= h && (await box(p, mb)).t >= 0, await box(p, mb));
    await p.waitForTimeout(300);
    await p.waitForTimeout(300);
    const small = await p.locator(".pf-inv button:not(.pf-mock button), .pf-inv a.pf-lnk, .pf-inv input, .pf-inv textarea").evaluateAll(ns => ns.filter(n => n.offsetParent && !n.closest(".pf-mock") && n.getBoundingClientRect().height < 43.5).map(n => n.className + n.textContent.slice(0, 20)));
    ok(`${tag} ${st}: tap targets at least 44px`, small.length === 0, small);
    await shot(p, `invite-${st}-${w}-${mode}`);
    if (st === "empty") {
      ok(`${tag} empty: the way back is visible without scrolling far`, await p.locator(".pf-inv [data-inv=back]").isVisible());
      await p.locator("[data-inv=back]").click(); await p.waitForTimeout(250);
      ok(`${tag}: way back works on a phone (modal gone, Household shown)`, await p.locator(".pf-inv").count() === 0 && await p.locator("[data-hhinvite]").count() === 1);
    }
    await noNav(t, `${tag} ${st}`); await t.ctx.close();
  }
  for (const [u, n] of [[`${START}?s=landing&m=${encodeURIComponent(MSG)}`, "landing"], [`${START}?s=household&m=${encodeURIComponent(MSG)}`, "household"], [`${START}?s=landing&msg=none`, "nomessage"]]) {
    t = await open(u, w, h, mode, ".st-card"); p = t.p;
    ok(`${tag} recipient ${n}: nothing scrolls sideways`, await noSide(p));
    const small = await p.locator(".st-btn, .st-field input, .st-more summary").evaluateAll(ns => ns.filter(x => x.offsetParent && x.getBoundingClientRect().height < 43.5).map(x => x.className));
    ok(`${tag} recipient ${n}: tap targets at least 44px`, small.length === 0, small);
    ok(`${tag} recipient ${n}: the main button is reachable`, (await p.locator(".st-btn").first().evaluate(x => x.getBoundingClientRect().bottom)) <= h + 400);
    await shot(p, `recipient-${n}-${w}-${mode}`);
    await t.ctx.close();
  }
}
await browser.close();
console.log(`${total - fails} of ${total} checks passed`); process.exit(fails ? 1 : 0);
