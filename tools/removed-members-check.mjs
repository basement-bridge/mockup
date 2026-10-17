// Behaviour and layout check for Removed members (Kitchie #85; owner, 1 Oct 2026). Mockup only: fragments/removed-members/.
// Usage:  python3 -m http.server 8124 &   then   ROOT=http://localhost:8124 node tools/removed-members-check.mjs   (SHOTS=dir saves PNGs; needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH)
// Runs at 390, 360 (phone page) and 1280 (Profile window page), light and dark.
import { chromium } from "playwright-core";
const ROOT = process.env.ROOT || "http://localhost:8124";
const BASE = `${ROOT}/fragments/removed-members`;
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await chromium.launch();
async function open(url, w, h, mode) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, mode === "dark" ? "kitchie" : "kitchie-day");
  const p = await ctx.newPage(); await p.goto(url); await p.waitForTimeout(250); return p;
}
const txt = (p, sel) => p.locator(sel).innerText();
const layout = async (p, tag) => {
  ok(`${tag}: nothing scrolls sideways`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  const small = await p.evaluate(() => [...document.querySelectorAll(".pm a, .pm button, .pm summary, .pm input")].filter(e => e.offsetParent && !e.closest("details:not([open])>.admbox, details:not([open])>div")).map(e => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute("aria-label") || "").slice(0, 24), h: Math.round(r.height), w: Math.round(r.width) }; }).filter(x => x.h < 44 || x.w < 44));
  ok(`${tag}: every control is at least 44px both ways`, small.length === 0, small);
  ok(`${tag}: the theme applies (page is not the browser default white)`, await p.evaluate(() => getComputedStyle(document.body).backgroundColor !== "rgba(0, 0, 0, 0)" && getComputedStyle(document.body).backgroundColor !== "rgb(255, 255, 255)"));
};
const shot = async (p, name) => { if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/removed-members-${name}.png`, fullPage: true }); };
for (const mode of ["light", "dark"]) {
  for (const [form, file, w, h] of [["phone 390", "app.html", 390, 844], ["phone 360", "app.html", 360, 740], ["window 1280", "desktop.html", 1280, 800]]) {
    const tag = `${form} ${mode}`, u = `${BASE}/${file}`;
    if (file === "app.html") {
      const n = await open(`${BASE}/index.html`, w, 900, mode);
      ok(`${tag}: the notes page lists 4 owner decisions, 6 from the issue, 13 proposals and 6 questions`, (await n.locator("b.id").allInnerTexts()).length === 4 + 6 + 13 + 6);
      ok(`${tag}: the notes page has no raw colours in its frames and nothing scrolls sideways`, await n.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
      await shot(n, `notes-${form.replace(" ", "")}-${mode}`); await n.context().close();
    }
    // 1. the household page with two held members
    let p = await open(u, w, h, mode);
    ok(`${tag}: the Removed card is drawn when someone is held`, await p.locator("#removed").count() === 1);
    ok(`${tag}: the members list holds only the two current members`, await p.locator(".mrow[data-member]").count() === 2 && !/Sam|Jo/.test(await p.locator(".menu.card").first().innerText()));
    const rows = await p.locator("#removed .held .who2 b").allInnerTexts();
    ok(`${tag}: the one erased soonest comes first`, rows.join() === "Jo,Sam", rows);
    ok(`${tag}: the line says until when and how long is left`, /Can be restored until Wed 21 Oct, 9:15 am . 3 days left/.test(await txt(p, '[data-held="sam"]')), await txt(p, '[data-held="sam"]'));
    ok(`${tag}: who removed them and when is kept while held`, /Arjan removed Sam on Wed 14 Oct\./.test(await txt(p, '[data-held="sam"]')));
    ok(`${tag}: the last 24 hours read in the danger colour`, await p.locator('[data-held="jo"] .sub.soon').count() === 1 && /2 hours left/.test(await txt(p, '[data-held="jo"] .sub.soon')) && await p.locator('[data-held="sam"] .sub.soon').count() === 0);
    ok(`${tag}: the card says the week and "a former member"`, /7 days/.test(await txt(p, "#removed")) && /a former member/.test(await txt(p, "#removed")));
    ok(`${tag}: Restore is a button on every held row, confirm closed`, await p.locator("#removed summary[aria-label^=Restore]").count() === 2 && await p.locator("#removed details[open]").count() === 0);
    ok(`${tag}: no Erase now unless the option is on`, (await p.locator("#removed a.dg").count()) === 0);
    await layout(p, tag); await shot(p, `household-${form.replace(" ", "")}-${mode}`);
    // 2. restore: the confirm opens in place, then Sam is back
    await p.locator('summary[aria-label="Restore Sam"]').click();
    ok(`${tag}: pressing Restore opens the in-place confirm and the press now reads Cancel`, (await txt(p, "details[open] .admbox b")) === "Restore Sam?" && await p.locator("details[open] summary .c").isVisible());
    ok(`${tag}: the confirm says same name, sign in again, nothing sent`, /same name.*sign in again.*Nothing else is sent/.test(await txt(p, "details[open] .admbox")));
    await layout(p, tag + " restore open"); await shot(p, `restore-open-${form.replace(" ", "")}-${mode}`);
    await p.locator("details[open] .admbox .btn").click();
    ok(`${tag}: Sam is back among the members, told to sign in again`, await p.locator('.mrow[data-member="sam"]').count() === 1 && /Has to sign in again/.test(await txt(p, '[data-member="sam"]')));
    ok(`${tag}: Sam left the Removed card, Jo stays`, await p.locator('#removed [data-held="sam"]').count() === 0 && await p.locator('#removed [data-held="jo"]').count() === 1);
    ok(`${tag}: a note says Sam is back`, /Sam is back in Our kitchen\. Sam has to sign in again\./.test(await txt(p, ".note")));
    ok(`${tag}: the count reads 3 members`, /3 members/.test(await txt(p, ".mbody")));
    await shot(p, `restored-${form.replace(" ", "")}-${mode}`); await p.context().close();
    // 3. nothing held: the Removed section is not drawn
    p = await open(`${u}?removed=none`, w, h, mode);
    ok(`${tag}: nothing held draws no Removed card and no label`, await p.locator("#removed").count() === 0 && !/Removed/.test(await p.locator("body").innerText()));
    await layout(p, tag + " none"); await p.context().close();
    // 4. the remove page
    p = await open(`${u}?removed=none&dz=1`, w, h, mode);
    ok(`${tag}: the Danger zone offers Remove Maya`, await p.locator('.dz a[aria-label="Remove Maya from Our kitchen"]').count() === 1 && /7 days/.test(await txt(p, ".dz")));
    await shot(p, `danger-${form.replace(" ", "")}-${mode}`);
    await p.locator('.dz a[aria-label="Remove Maya from Our kitchen"]').click();
    ok(`${tag}: the confirm page tells the week, the date and the erase`, /Until Sat 24 Oct, 5:40 pm/.test(await txt(p, ".facts")) && /a former member/.test(await txt(p, ".facts")) && /After that, Maya is erased/.test(await txt(p, ".facts")));
    await layout(p, tag + " remove"); await shot(p, `remove-${form.replace(" ", "")}-${mode}`);
    await p.fill("#rmname", "Sam"); await p.locator("[data-removego]").click();
    ok(`${tag}: a wrong name changes nothing and says so`, /Nothing changed: the name typed did not match\./.test(await txt(p, ".note.bad")) && await p.locator('[data-removego]').count() === 1);
    await shot(p, `remove-wrong-${form.replace(" ", "")}-${mode}`);
    await p.fill("#rmname", "  maya "); await p.locator("[data-removego]").click();
    ok(`${tag}: the right name (case and spaces ignored) removes Maya into the Removed card`, await p.locator('#removed [data-held="maya"]').count() === 1 && await p.locator('.mrow[data-member="maya"]').count() === 0);
    ok(`${tag}: the note gives the restore deadline, exactly 7 days`, /Maya removed\. You can restore Maya until Sat 24 Oct, 5:40 pm\./.test(await txt(p, ".note")));
    ok(`${tag}: with nobody else the Danger zone is gone`, await p.locator(".dz").count() === 0);
    await layout(p, tag + " just removed"); await shot(p, `just-removed-${form.replace(" ", "")}-${mode}`); await p.context().close();
    // 5. Erase now (the option, RM-P12)
    p = await open(`${u}?erase=1`, w, h, mode);
    ok(`${tag}: with the option on, each held row has Erase now`, await p.locator("#removed a.dg").count() === 2);
    await layout(p, tag + " erase option"); await shot(p, `erase-option-${form.replace(" ", "")}-${mode}`);
    await p.locator('a[aria-label="Erase Sam now"]').click();
    ok(`${tag}: the erase page says it cannot be undone and names the date it replaces`, /cannot be undone/.test(await txt(p, ".facts")) && /not on Wed 21 Oct, 9:15 am/.test(await txt(p, ".facts")));
    await layout(p, tag + " erase page"); await shot(p, `erase-${form.replace(" ", "")}-${mode}`);
    await p.fill("#rmname", "Sam"); await p.locator("[data-erasego]").click();
    ok(`${tag}: erasing removes Sam from Removed for good and says so`, await p.locator('#removed [data-held="sam"]').count() === 0 && /Sam erased\./.test(await txt(p, ".note")));
    await p.context().close();
    // 6. History after an erase
    p = await open(`${u}?screen=history`, w, h, mode);
    const fm = await p.locator("[data-former]").allInnerTexts();
    ok(`${tag}: History shows "a former member" where a name was, twice in the sample`, fm.length === 2 && fm.every(x => x === "a former member"), fm);
    await layout(p, tag + " history"); await shot(p, `history-${form.replace(" ", "")}-${mode}`); await p.context().close();
  }
}
await browser.close();
console.log(fails ? `${fails} of ${total} checks FAILED` : `all ${total} checks passed`);
process.exit(fails ? 1 : 0);
