// Behaviour check for "Invite someone to a household of their own" (owner, 12 Oct 2026, rounds 9 and 12; mockup only): the dual-purpose gutter entry ("Invite someone" / "My invites"), the trimmed modal and its states
// (empty, filled, link ready, copied, My invites, at three pending), the one-line way back to the existing join invite, the label field and Copy link / Show link / editable label on My invites (round 12), the recipient sign-up pages (message, no message, expired, used), desktop and mobile widths, light and dark.
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
  ok(`${tag}: never sent anything: the entry reads "Invite someone", with a paper-plane icon (not an envelope) and the fuller wording as its tooltip`, (await p.locator(".pf-invent").innerText()).trim() === "Invite someone" && /set up their own household/.test(await p.locator(".pf-invent").getAttribute("title")) && await p.locator(".pf-invent svg path[d^='M21.5']").count() > 0 && await p.locator(".pf-invent svg rect").count() === 0);
  ok(`${tag}: it is not a section (no number key, not a tab)`, await p.locator(".pf-invent[role=tab]").count() === 0 && await p.locator(".pf-invent kbd").count() === 0);
  ok(`${tag}: five sections still, number keys 1 to 5`, (await p.locator(".pf-nav .pf-nvt:not(.pf-nvc) kbd").allInnerTexts()).join() === "1,2,3,4,5");
  await shot(p, `invite-entry-${w}-${mode}`);
  { const t2 = await open(`${PROF}?open=me&invs=some`, w, h, mode); const p2 = t2.p;
    ok(`${tag}: once an invite has been sent (any status) the same entry reads "My invites"`, (await p2.locator(".pf-invent").innerText()).trim() === "My invites" && /invites you have sent/i.test(await p2.locator(".pf-invent").getAttribute("title")));
    const eb = await box(p2, ".pf-invent"); ok(`${tag}: ...in the same place (gutter foot, above History)`, eb.r <= 246 && eb.t > 300);
    await shot(p2, `invite-entry-mine-${w}-${mode}`); await t2.ctx.close(); }
  /* open it */
  await p.locator(".pf-invent").click(); await p.waitForSelector(".pf-inv");
  const dlg = p.locator(".pf-inv"), tx = await dlg.innerText();
  ok(`${tag}: opens as a modal dialog over the window (not a flyout, not a panel)`, await dlg.getAttribute("role") === "dialog" && await dlg.getAttribute("aria-modal") === "true" && await p.locator(".pf-scrim").count() === 2 && await p.locator(".pf-fly").count() === 0);
  const bx = await box(p, ".pf-inv"), win = await box(p, ".pf-win");
  ok(`${tag}: the modal is centred and smaller than the window`, bx.w < win.w - 100 && Math.abs((bx.l + bx.r) / 2 - w / 2) < 3 && bx.t > 0 && bx.b <= h, [bx, win]);
  ok(`${tag}: the window behind is inert`, await p.evaluate(() => [...document.querySelectorAll(".pf-scrim")].filter(s => !s.querySelector(".pf-inv")).every(s => s.inert)));
  ok(`${tag}: the title is exactly "Invite someone to a household of their own", one short line under it, nothing else explains at the top`, (await p.locator(".pf-inv h2").innerText()).trim() === "Invite someone to a household of their own" && (await p.locator(".pf-invone").innerText()).trim() === "They get their own brand new household" && await p.locator(".pf-invdia, .pf-invlead, .pf-invkick").count() === 0 && !/not a member|cannot see|not joining|not joined/i.test(tx), tx.slice(0, 300));
  ok(`${tag}: the first thing under the one-liner is the message field`, await p.evaluate(() => { const b = document.querySelector(".pf-invb"); return b.firstElementChild.classList.contains("pf-invmsg"); }));
  ok(`${tag}: round 12: an optional "Who is this for?" field sits BELOW the message (not above it), says only the inviter sees it, and is light (one line)`, await p.evaluate(() => { const m = document.querySelector(".pf-invmsg").getBoundingClientRect(), l = document.querySelector("#inv-label"); if (!l) return false; const r = l.getBoundingClientRect(); return r.top >= m.bottom && r.height < 60 && l.maxLength === 40 && /Optional/.test(document.querySelector(".pf-invlab").textContent) && /Who is this for\?/.test(document.querySelector(".pf-invlab").textContent) && /Only you see this/.test(document.querySelector("#inv-labhelp").innerText); }));
  ok(`${tag}: round 12: the way back is still the last line, the modal top has not grown (title and ONE line only)`, await p.evaluate(() => document.querySelector(".pf-invb").lastElementChild.classList.contains("pf-invwrong")) && await p.locator(".pf-inv .pf-who > *").count() === 2);
  ok(`${tag}: the way back is one plain low-key line, not a card`, await p.locator(".pf-inv [data-inv=back]").count() === 1 && (await p.locator(".pf-invwrong").innerText()).replace(/\s+/g, " ").trim() === "Want to invite them to your household instead? Click here" && await p.locator(".pf-invwrong .pf-btn").count() === 0 && await p.locator(".pf-invwrong").evaluate(n => getComputedStyle(n).backgroundColor === "rgba(0, 0, 0, 0)" && getComputedStyle(n).borderTopWidth === "0px"));
  ok(`${tag}: the send button is the paper plane`, await p.locator("[data-inv=create] svg path[d^='M21.5']").count() > 0);
  ok(`${tag}: focus is in the message field`, await p.evaluate(() => document.activeElement && document.activeElement.id === "inv-msg"));
  ok(`${tag}: empty state: counter 0 of 280, the link is not made yet`, /0 of 280/.test(tx) && await p.locator("#inv-link").count() === 0 && await p.locator("[data-inv=create]").isEnabled());
  ok(`${tag}: nothing in the modal is a real address`, !/https?:\/\//.test(tx));
  await shot(p, `invite-empty-${w}-${mode}`);
  /* number keys and ? do nothing while the modal is open */
  await p.locator("[data-inv=create]").focus(); await p.keyboard.press("4");
  ok(`${tag}: number keys do not move the window behind`, await p.locator(".pf-win .pf-head h2").innerText() === "Profile" && await p.locator(".pf-inv").isVisible());
  await p.keyboard.press("?"); ok(`${tag}: ? opens nothing on top of the modal`, await p.locator(".pf-scrim").count() === 2);
  await p.locator("#inv-label").focus(); await p.keyboard.type("Mum's kitchen");
  ok(`${tag}: typing a label stays in the modal and does not change the message counter`, await p.locator(".pf-inv").isVisible() && /0 of 280/.test(await p.locator("#inv-count").innerText()));
  await p.locator("#inv-msg").focus(); await p.keyboard.type(MSG);
  ok(`${tag}: typing counts and does not leave the modal`, new RegExp(`${MSG.length} of 280`).test(await p.locator("#inv-count").innerText()) && await p.locator(".pf-inv").isVisible());
  ok(`${tag}: the mockup switch follows the typing (Filled)`, await p.locator("[data-inv=state][aria-checked=true]").innerText() === "Filled");
  await shot(p, `invite-filled-${w}-${mode}`);
  /* create and copy */
  await p.locator("[data-inv=create]").click(); await p.waitForSelector("#inv-link");
  { const ct = await p.locator(".pf-inv").innerText();
  ok(`${tag}: link ready: a sample link, says it works once, and says NOTHING about expiry`, (await p.locator("#inv-link").inputValue()) === "kitchie.example/start/sample-link" && /Works once/.test(ct) && !/expire|expiry|48|24 hours|month|days/i.test(ct), ct);
  ok(`${tag}: link ready: no line about the inviter not being a member`, !/not be a member|not a member|cannot see/i.test(ct)); }
  ok(`${tag}: round 12: link ready says it is saved under the label (only you see it), points to My invites for a lost link, and the recipient preview does not carry the label`, /Saved in My invites as Mum's kitchen/.test(await p.locator(".pf-invkept").innerText()) && /copy it again/.test(await p.locator(".pf-invkept").innerText()) && !(await p.locator(".pf-invq").innerText()).includes("Mum") && !(await p.locator("#inv-link").inputValue()).includes("Mum"));
  ok(`${tag}: what they will see shows the typed message`, (await p.locator(".pf-invq").innerText()).includes(MSG));
  ok(`${tag}: no "See their sign-up screen" link in the modal (INH-D20)`, await p.locator(".pf-inv a.pf-lnk").count() === 0 && !/sign-up screen/i.test(await p.locator(".pf-inv").innerText()));
  ok(`${tag}: the way back (one line) is still offered under the link`, await p.locator(".pf-inv [data-inv=back]").count() === 1);
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
  ok(`${tag}: a link was made, so the gutter entry now reads "My invites"; reopened, the link made is still shown (going back and forth costs nothing)`, (await p.locator(".pf-invent").innerText()).trim() === "My invites" && await p.locator("#inv-link").count() === 1);
  await p.locator("[data-inv=another]").click(); await p.waitForSelector("#inv-msg");
  ok(`${tag}: Make another link starts again, empty`, (await p.locator("#inv-msg").inputValue()) === "" && /0 of 280/.test(await p.locator("#inv-count").innerText()));
  await p.locator("[data-inv=tolist]").click(); await p.waitForSelector(".pf-invlist");
  ok(`${tag}: Cancel (once something is sent) goes back to My invites, which lists the new link as Pending`, (await p.locator(".pf-inv h2").innerText()) === "My invites" && (await p.locator(".pf-invrow").first().innerText()).includes("Pending"));
  ok(`${tag}: round 12: the new invite's row is titled with the label typed, and has Copy link`, (await p.locator(".pf-invrow").first().locator(".pf-invlt").innerText()) === "Mum's kitchen" && await p.locator(".pf-invrow").first().locator("[data-inv=copyrow]").count() === 1);
  await p.locator("[data-inv=new]").click(); await p.waitForSelector("#inv-msg");
  /* close keys */
  await p.keyboard.press("Escape"); ok(`${tag}: plain Esc closes nothing`, await p.locator(".pf-inv").isVisible());
  await p.keyboard.press("Control+Escape");
  ok(`${tag}: the close chord closes the modal first, the window stays, focus returns to the entry`, await p.locator(".pf-inv").count() === 0 && await p.locator(".pf-win").isVisible() && await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("pf-invent")));
  await noNav(t, tag); await t.ctx.close();
  /* every state from the address */
  for (const st of ["empty", "filled", "created", "copied", "list", "limit"]) {
    t = await open(`${PROF}?open=invite&inv=${st}`, w, h, mode, ".pf-inv"); p = t.p;
    const s = await p.locator(".pf-inv").innerText();
    if (st === "empty" || st === "filled") ok(`${tag} inv=${st}: the gutter entry behind still reads "Invite someone" (nothing sent yet)`, (await p.locator(".pf-invent").innerText()).trim() === "Invite someone");
    if (st === "empty") ok(`${tag} inv=${st}: empty field`, (await p.locator("#inv-msg").inputValue()) === "" && /0 of 280/.test(s));
    if (st === "filled") ok(`${tag} inv=${st}: filled field and counter`, /Priya/.test(await p.locator("#inv-msg").inputValue()) && !/0 of 280/.test(s));
    if (st === "created") ok(`${tag} inv=${st}: link ready, Copy link`, await p.locator("#inv-link").count() === 1 && /Copy link/.test(await p.locator("[data-inv=copy]").innerText()));
    if (st === "copied") ok(`${tag} inv=${st}: Copied`, /Copied/.test(await p.locator("[data-inv=copy]").innerText()));
    if (st === "list" || st === "limit") {
      const rows = await p.locator(".pf-invrow").evaluateAll(ns => ns.map(n => ({ st: n.dataset.st, tx: n.innerText })));
      const sts = new Set(rows.map(r => r.st));
      ok(`${tag} inv=${st}: My invites: a title, a list, each invite with a status word (Pending, Used, Expired)`, (await p.locator(".pf-inv h2").innerText()) === "My invites" && rows.length >= 3 && rows.every(r => /Pending|Used|Expired/.test(r.tx)) && sts.has("pending") && sts.has("used") && sts.has("expired"), rows);
      ok(`${tag} inv=${st}: no "withdrawn" (the mockup has no withdrawing) and no links to their households`, !/withdrawn/i.test(s) && !/\/start\//.test(s));
      ok(`${tag} inv=${st}: a "Send a new invite" action is there, with the plane`, await p.locator("[data-inv=new]").count() === 1 && await p.locator("[data-inv=new] svg path[d^='M21.5']").count() > 0);
      ok(`${tag} inv=${st}: Used is a record only`, /record only/i.test(s));
      { const rr = await p.locator(".pf-invrow").evaluateAll(ns => ns.map(n => ({ st: n.dataset.st, title: n.querySelector(".pf-invlt").innerText, copy: n.querySelectorAll("[data-inv=copyrow]").length, show: n.querySelectorAll("[data-inv=showrow]").length, pen: n.querySelectorAll("[data-inv=editlabel]").length, links: n.querySelectorAll("input[readonly]").length })));
        ok(`${tag} inv=${st}: round 12: Pending rows have Copy link and Show link; Used and Expired rows have neither; every row has a label title and a pencil`, rr.every(r => r.pen === 1 && r.copy === (r.st === "pending" ? 1 : 0) && r.show === (r.st === "pending" ? 1 : 0) && r.title.length > 0), rr);
        ok(`${tag} inv=${st}: round 12: the label is the row title (Priya, Sam), and a row without one says "No label"`, rr.some(r => r.title === "Priya") && rr.some(r => r.title === "Sam") && (st === "limit" ? true : rr.some(r => r.title === "No label")), rr);
        ok(`${tag} inv=${st}: round 12: links are hidden until Show link is pressed`, rr.every(r => r.links === 0)); }
      if (st === "list") { ok(`${tag} inv=list: one pending of three: the new-invite action is enabled`, await p.locator("[data-inv=new]").isEnabled() && /1 of 3 pending/.test(s)); }
      if (st === "limit") {
        ok(`${tag} inv=limit: three pending: the new-invite action is disabled, with a plain explanation that the button points to`, await p.locator("[data-inv=new]").isDisabled() && await p.locator("[data-inv=new]").getAttribute("aria-describedby") === "inv-lim" && /3 invites pending, the most at one time/.test(await p.locator("#inv-lim").innerText()) && /used or expires/.test(await p.locator("#inv-lim").innerText()), await p.locator("#inv-lim").innerText());
        ok(`${tag} inv=limit: it says which invite frees a slot first (20 Sep, expires 20 Oct) and each pending row says when it frees`, /20 Sep, which expires 20 Oct/.test(s) && (await p.locator(".pf-invfree").count()) === 3, s);
      }
    }
    await p.waitForTimeout(300);
    const small = await p.locator(".pf-inv button:not(.pf-mock button), .pf-inv a.pf-lnk, .pf-inv input, .pf-inv textarea").evaluateAll(ns => ns.filter(n => n.offsetParent && !n.closest(".pf-mock") && n.getBoundingClientRect().height < 43.5).map(n => n.className + n.textContent.slice(0, 20)));
    ok(`${tag} inv=${st}: tap targets at least 44px`, small.length === 0, small);
    ok(`${tag} inv=${st}: nothing scrolls sideways and the buttons are on screen`, await noSide(p) && await p.locator(".pf-invbtns").isVisible() && (await box(p, ".pf-invbtns")).b <= h, await box(p, ".pf-invbtns"));
    await shot(p, `invite-state-${st}-${w}-${mode}`);
    await noNav(t, `${tag} inv=${st}`); await t.ctx.close();
  }
  /* round 12: copy again, show the link, edit the label in place (desktop) */
  t = await open(`${PROF}?open=invite&inv=limit`, w, h, mode, ".pf-inv"); p = t.p;
  { const rows = p.locator(".pf-invrow[data-st=pending]");
    await rows.nth(0).locator("[data-inv=copyrow]").click();
    ok(`${tag} copy again: the row's button says Copied, a line says to paste it, the same Copied feel as Link ready; the other rows are unchanged`, /Copied/.test(await rows.nth(0).locator("[data-inv=copyrow]").innerText()) && /Copied. Paste it into a message to them/.test(await rows.nth(0).innerText()) && /Copy link/.test(await rows.nth(1).locator("[data-inv=copyrow]").innerText()) && await p.locator(".pf-inv").isVisible() && await p.evaluate(() => document.activeElement.dataset.inv === "copyrow"));
    await shot(p, `invite-row-copied-${w}-${mode}`);
    await rows.nth(1).locator("[data-inv=copyrow]").click();
    ok(`${tag} copy again: only one row says Copied at a time`, await p.locator(".pf-invrow [data-inv=copyrow]:has-text('Copied')").count() === 1);
    await rows.nth(0).locator("[data-inv=showrow]").click();
    const shown = rows.nth(0).locator("input[readonly]");
    ok(`${tag} show link: pressing Show link reveals the same sample link in a read-only box (never a real address), and the button says Hide link`, (await shown.inputValue()).startsWith("kitchie.example/start/sample-link") && !/https?:/.test(await shown.inputValue()) && /Hide link/.test(await rows.nth(0).locator("[data-inv=showrow]").innerText()) && await rows.nth(0).locator("[data-inv=showrow]").getAttribute("aria-expanded") === "true");
    ok(`${tag} show link: the label is not part of the link`, !/jo|priya|mum/i.test((await shown.inputValue()).replace("kitchie.example", "")));
    await rows.nth(0).locator("[data-inv=showrow]").click();
    ok(`${tag} show link: Hide link puts it away`, await p.locator(".pf-invrow input[readonly]").count() === 0);
    /* edit the label */
    await p.locator(".pf-invrow").nth(0).locator("[data-inv=editlabel]").click();
    const li = p.locator(".pf-invrow").nth(0).locator("[data-invlabin]");
    ok(`${tag} edit label: the pencil turns the title into a box right there (no repaint of the list), focused, saying it saves automatically and only you see it`, await li.count() === 1 && await p.evaluate(() => document.activeElement.hasAttribute("data-invlabin")) && /Saves automatically. Only you see this/.test(await p.locator("[data-labhint]").innerText()) && await p.locator(".pf-inv h2").innerText() === "My invites");
    await li.fill("Jo (work)");
    ok(`${tag} edit label: saved as you type`, /Saved\./.test(await p.locator("[data-labhint]").innerText()));
    await shot(p, `invite-row-edit-${w}-${mode}`);
    await p.keyboard.press("Enter");
    ok(`${tag} edit label: Enter closes the box, the new label is the title, focus returns to the pencil, the modal stays`, (await p.locator(".pf-invrow").nth(0).locator(".pf-invlt").innerText()) === "Jo (work)" && await p.evaluate(() => document.activeElement.dataset.inv === "editlabel") && await p.locator(".pf-inv").isVisible());
    await p.locator(".pf-invrow").nth(3).locator("[data-inv=editlabel]").click();
    await p.locator(".pf-invrow").nth(3).locator("[data-invlabin]").fill("");
    await p.keyboard.press("Escape");
    ok(`${tag} edit label: an emptied label becomes "No label" (allowed: it is optional), Esc only closes the box`, (await p.locator(".pf-invrow").nth(3).locator(".pf-invlt").innerText()) === "No label" && await p.locator(".pf-inv").isVisible());
    await p.locator(".pf-invrow").nth(2).locator("[data-inv=editlabel]").click();
    ok(`${tag} edit label: Used rows can be relabelled too`, await p.locator(".pf-invrow").nth(2).locator("[data-invlabin]").count() === 1);
    await p.locator(".pf-invrow").nth(2).locator("[data-invlabin]").fill("Sam B");
    await p.locator("[data-inv=showrow]").first().focus();
    await p.waitForTimeout(100);
    ok(`${tag} edit label: leaving the box keeps what was typed`, (await p.locator(".pf-invrow").nth(2).locator(".pf-invlt").innerText()) === "Sam B");
    ok(`${tag} round 12: the label is never in the recipient copy (the modal's "what they will see" is not on My invites)`, await p.locator(".pf-invq").count() === 0);
  }
  await noNav(t, `${tag} round 12 rows`); await t.ctx.close();
  /* the extra addresses */
  for (const [st, sel] of [["listcopy", ".pf-invrowc"], ["listshow", ".pf-invshow input"], ["listedit", "[data-invlabin]"]]) {
    t = await open(`${PROF}?open=invite&inv=${st}`, w, h, mode, ".pf-inv"); p = t.p;
    ok(`${tag} inv=${st}: shows its state on the first pending row`, await p.locator(".pf-invrow[data-st=pending]").first().locator(sel).count() === 1 && (await p.locator(".pf-inv h2").innerText()) === "My invites");
    await shot(p, `invite-state-${st}-${w}-${mode}`);
    ok(`${tag} inv=${st}: nothing scrolls sideways, tap targets at least 44px`, await noSide(p) && (await p.locator(".pf-inv button:not(.pf-mock button), .pf-inv input").evaluateAll(ns => ns.filter(n => n.offsetParent && !n.closest(".pf-mock") && n.getBoundingClientRect().height < 43.5).length)) === 0);
    await noNav(t, `${tag} inv=${st}`); await t.ctx.close();
  }
  /* the Me row opens the same modal */
  t = await open(`${PROF}?open=me`, w, h, mode); p = t.p;
  await p.locator("#pf-panel [data-inv=open]").click(); await p.waitForSelector(".pf-inv");
  ok(`${tag}: the Me row opens the same modal`, /Invite someone to a household of their own/.test(await p.locator(".pf-inv h2").innerText()));
  await t.ctx.close();
  t = await open(`${PROF}?open=me`, w, h, mode); p = t.p;
  ok(`${tag}: the Me row reads Invite someone / to set up their own household, with a plane`, /^Invite someone\s+to set up their own household$/.test((await p.locator("#pf-panel [data-inv=open]").innerText()).trim()) && await p.locator("#pf-panel [data-inv=open] svg path[d^='M21.5']").count() > 0);
  await t.ctx.close();
  t = await open(`${PROF}?open=me&invs=full`, w, h, mode); p = t.p;
  ok(`${tag}: the Me row switches to My invites the same way`, /^My invites\s+Invites you have sent/.test((await p.locator("#pf-panel [data-inv=open]").innerText()).trim()));
  await p.locator(".pf-invent").click(); await p.waitForSelector(".pf-inv");
  ok(`${tag}: pressing "My invites" opens the list (at three: the new-invite action is disabled)`, (await p.locator(".pf-inv h2").innerText()) === "My invites" && await p.locator("[data-inv=new]").isDisabled());
  await p.locator("[data-inv=mode][data-v=none]").click(); await p.waitForSelector("#inv-msg");
  ok(`${tag}: mockup switch: Invites sent: None puts the gutter entry back to "Invite someone" and the form back`, (await p.locator(".pf-invent").innerText()).trim() === "Invite someone" && (await p.locator(".pf-inv h2").innerText()).startsWith("Invite someone to"));
  await t.ctx.close();
  /* Household still has its own Invite someone (not redrawn, not changed) */
  t = await open(`${PROF}?open=household`, w, h, mode); p = t.p;
  ok(`${tag}: Household still has Invite someone, the join invite (it says nothing about own households)`, await p.locator("[data-hhinvite]").count() === 1 && !/own household/i.test(await p.locator("#pf-panel").innerText()));
  await t.ctx.close();
  /* recipient side */
  t = await open(`${START}?s=landing&m=${encodeURIComponent(MSG)}`, w, h, mode, ".st-card"); p = t.p;
  ok(`${tag} recipient: lands on sign-up with the message visible`, (await p.locator("#st-note").innerText()).includes(MSG) && /note from arjan/i.test(await p.locator("#st-note").innerText()) && /^Start my kitchen$/.test(await p.locator("#st-go").innerText()));
  ok(`${tag} recipient: round 12: there is no label anywhere on the recipient page (the label is for the inviter only)`, !/who is this for|label|Priya's kitchen|Mum/i.test(await p.locator("body").innerText().then(x => x.replace(MSG, ""))));
  ok(`${tag} recipient: says it is their own kitchen`, /Your kitchen\./.test(await p.locator("h1").innerText()) && /your turn/.test(await p.locator(".st-pill").innerText()));
  ok(`${tag} recipient: the personal note sits directly above the sign-up button`, await p.evaluate(() => { const n = document.getElementById("st-note").getBoundingClientRect(), g = document.getElementById("st-go").getBoundingClientRect(); return n.bottom <= g.top && g.top - n.bottom < 40; }));
  await p.locator(".st-more summary").click();
  { const rt2 = await p.locator(".st-card").innerText();
    ok(`${tag} recipient: the link rules are the new ones: works once (used when sign-up finishes), a month, and no 48 hours`, /works once/i.test(rt2) && /finish signing up/.test(rt2) && /a month/.test(rt2) && !/48|24 hours/.test(rt2), rt2); }
  await shot(p, `recipient-landing-${w}-${mode}`);
  await p.locator("#st-go").click(); await p.waitForSelector("#st-create");
  ok(`${tag} recipient: after sign-in the message is still there, and the last step is creating their household`, (await p.locator("#st-note").innerText()).includes(MSG) && /Create my household/.test(await p.locator("#st-create").innerText()) && (await p.locator("#st-name").inputValue()) === "My kitchen");
  await shot(p, `recipient-household-${w}-${mode}`);
  await t.ctx.close();
  t = await open(`${START}?s=landing&msg=none`, w, h, mode, ".st-card"); p = t.p;
  ok(`${tag} recipient: no message, no note card, same page`, await p.locator("#st-note").count() === 0 && /Start my kitchen/.test(await p.locator("#st-go").innerText()));
  await shot(p, `recipient-nomessage-${w}-${mode}`);
  await t.ctx.close();
  for (const [sn, re] of [["expired", /has expired/i], ["used", /has been used/i]]) {
    t = await open(`${START}?s=${sn}`, w, h, mode, ".st-card"); p = t.p;
    const gt = await p.locator(".st-card").innerText();
    ok(`${tag} recipient ${sn}: says so plainly, tells them what to do, shows no note card`, re.test(gt) && /ask Arjan/i.test(gt) && await p.locator("#st-note, #st-go").count() === 0 && await p.locator("#st-gone").count() === 1, gt);
    ok(`${tag} recipient ${sn}: the other recipient frames are one press away`, await p.locator(".st-mock a").count() >= 4);
    await shot(p, `recipient-${sn}-${w}-${mode}`);
    await t.ctx.close();
  }
  t = await open(`${START}?s=landing&m=${encodeURIComponent("<b onclick=x>bold</b><img src=x onerror=alert(1)>")}`, w, h, mode, ".st-card"); p = t.p;
  ok(`${tag} recipient: the message is text, never markup`, (await p.locator("#st-note").innerText()).includes("<b onclick=x>bold</b>") && await p.locator("#st-note b, #st-note img").count() === 0);
  await t.ctx.close();
  t = await open(NOTES, w, h, mode, ".wrap"); p = t.p;
  const nt = await p.locator(".wrap").innerText();
  ok(`${tag} notes page: says it is a growth feature, mockup only, and lists open questions`, /growth feature/i.test(nt) && /current behaviour stays/i.test(nt) && /Still open/.test(nt) && /what the build must change/i.test(nt));
  await t.ctx.close();
}

/* ---------- mobile widths ---------- */
for (const [w, h] of [[360, 780], [390, 844], [768, 1024]]) for (const mode of ["light", "dark"]) {
  const tag = `${w} ${mode}`;
  let t = await open(`${PROF}?open=me`, w, h, mode); let p = t.p;
  ok(`${tag}: no gutter entry in the strip (the Me row opens the modal)`, !(await p.locator(".pf-invent").isVisible()));
  ok(`${tag}: the Me row is the route: "Invite someone, to set up their own household"`, /Invite someone\s+to set up their own household/.test(await p.locator("#pf-panel [data-inv=open]").innerText()));
  await p.locator("#pf-panel [data-inv=open]").click(); await p.waitForSelector(".pf-inv");
  ok(`${tag}: the Me row opens the modal here too`, /Invite someone to a household of their own/.test(await p.locator(".pf-inv h2").innerText()));
  await t.ctx.close();
  t = await open(`${PROF}?open=me&invs=some`, w, h, mode); p = t.p;
  ok(`${tag}: after sending, the Me row switches to My invites`, /^My invites/.test((await p.locator("#pf-panel [data-inv=open]").innerText()).trim()));
  await shot(p, `invite-me-row-mine-${w}-${mode}`);
  await p.locator("#pf-panel [data-inv=open]").click(); await p.waitForSelector(".pf-inv");
  ok(`${tag}: ...and it opens My invites`, (await p.locator(".pf-inv h2").innerText()) === "My invites" && await p.locator(".pf-invrow").count() >= 3);
  await t.ctx.close();
  for (const st of ["empty", "filled", "created", "copied", "list", "limit", "listcopy", "listshow", "listedit"]) {
    t = await open(`${PROF}?open=invite&inv=${st}`, w, h, mode, ".pf-inv"); p = t.p;
    const bx = await box(p, ".pf-inv");
    ok(`${tag} ${st}: the modal fits the screen`, bx.l >= 0 && bx.r <= w && bx.t >= 0 && bx.b <= h, bx);
    ok(`${tag} ${st}: nothing scrolls sideways`, await noSide(p));
    const mb = st === "created" || st === "copied" ? "[data-inv=done]" : /^(list|limit)/.test(st) ? ".pf-invbtns [data-close]" : "[data-inv=create]";
    ok(`${tag} ${st}: the main button is visible and on screen`, await p.locator(mb).isVisible() && (await box(p, mb)).h > 30 && (await box(p, mb)).b <= h && (await box(p, mb)).t >= 0, await box(p, mb));
    await p.waitForTimeout(300);
    await p.waitForTimeout(300);
    const small = await p.locator(".pf-inv button:not(.pf-mock button), .pf-inv a.pf-lnk, .pf-inv input, .pf-inv textarea").evaluateAll(ns => ns.filter(n => n.offsetParent && !n.closest(".pf-mock") && n.getBoundingClientRect().height < 43.5).map(n => n.className + n.textContent.slice(0, 20)));
    ok(`${tag} ${st}: tap targets at least 44px`, small.length === 0, small);
    await shot(p, `invite-${st}-${w}-${mode}`);
    if (st === "limit") ok(`${tag} limit: the explanation is visible at the top and the send action is disabled`, await p.locator("#inv-lim").isVisible() && await p.locator("[data-inv=new]").isDisabled());
    if (st === "empty") {
      ok(`${tag} empty: the way back is visible without scrolling far`, await p.locator(".pf-inv [data-inv=back]").isVisible());
      await p.locator("[data-inv=back]").click(); await p.waitForTimeout(250);
      ok(`${tag}: way back works on a phone (modal gone, Household shown)`, await p.locator(".pf-inv").count() === 0 && await p.locator("[data-hhinvite]").count() === 1);
    }
    await noNav(t, `${tag} ${st}`); await t.ctx.close();
  }
  for (const [u, n] of [[`${START}?s=landing&m=${encodeURIComponent(MSG)}`, "landing"], [`${START}?s=household&m=${encodeURIComponent(MSG)}`, "household"], [`${START}?s=landing&msg=none`, "nomessage"], [`${START}?s=expired`, "expired"], [`${START}?s=used`, "used"]]) {
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
