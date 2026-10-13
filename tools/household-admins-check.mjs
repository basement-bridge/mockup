// Behaviour check for Household members and admins (owner, typed, 14 Oct 2026; SW-85 to SW-89). Mockup only.
// Usage:  python3 -m http.server 8124 &   then   node tools/household-admins-check.mjs   (SHOTS=dir saves PNGs; needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH)
import { chromium } from "playwright-core";
const ROOT = process.env.ROOT || "http://localhost:8124";
let fails = 0, total = 0;
const ok = (n, c, x) => { total++; if (!c) { fails++; console.log("FAIL", n, x === undefined ? "" : JSON.stringify(x)); } };
const browser = await chromium.launch();
async function page(url, w, h, mode) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
  await ctx.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, mode === "dark" ? "kitchie" : "kitchie-day");
  const p = await ctx.newPage(); await p.goto(url); await p.waitForTimeout(500); return p;
}
const noScroll = async (p, t) => ok(`${t}: nothing scrolls sideways`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
for (const mode of ["light", "dark"]) {
  // the phone household flow, three forms
  for (const form of ["mobile", "tablet", "desktop"]) {
    const w = form === "mobile" ? 390 : form === "tablet" ? 820 : 1280, tag = `${form} ${mode}`, base = `${ROOT}/flows/household/${form}/index.html`;
    let p = await page(`${base}?as=sam&third=1`, w, 844, mode);
    ok(`${tag}: a member sees no Make admin or Remove admin`, await p.locator("details.adm").count() === 0);
    const note = await p.locator("#admnote").innerText();
    ok(`${tag}: a member is told who the admins are`, /Only household admins can make someone an admin, or take it back\. Admins: Arjan\./.test(note), note);
    ok(`${tag}: all three people are listed with their role chips`, (await p.locator(".m.mm .chip").allInnerTexts()).join("|").includes("Founding member") && (await p.locator(".m.mm").count()) === 3);
    await noScroll(p, tag); await p.context().close();
    p = await page(`${base}?as=sam&third=1&samadmin=1`, w, 844, mode);
    ok(`${tag}: an admin who is not the founder gets a button on Maya only (not the founder, not themselves)`, (await p.locator("details.adm").count()) === 1 && /Make Maya an admin/.test(await p.locator("details.adm summary").getAttribute("aria-label")));
    ok(`${tag}: an admin is told the founding member is always an admin`, /The founding member is always an admin/.test(await p.locator("#admnote").innerText()));
    ok(`${tag}: the confirm is closed until pressed`, (await p.locator("details.adm[open]").count()) === 0);
    await p.locator("details.adm summary").click();
    ok(`${tag}: pressing opens the confirm and the same press now reads Cancel`, (await p.locator("details.adm[open] .admbox b").innerText()) === "Make Maya an admin?" && await p.locator("details.adm[open] summary .c").isVisible() && !(await p.locator("details.adm[open] summary .o").isVisible()));
    if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/admin-open-${form}-${mode}.png` });
    await noScroll(p, tag);
    await p.locator("details.adm .admbox button").click();
    ok(`${tag}: confirming makes Maya an admin and says so`, /Maya is now an admin/.test(await p.locator("#toast, .toast").first().innerText().catch(() => "")) || (await p.locator(".m.mm .chip", { hasText: "Admin" }).count()) === 2);
    ok(`${tag}: Maya now has Remove admin`, /Remove Maya as admin/.test(await p.locator("details.adm summary").getAttribute("aria-label")));
    await p.context().close();
    p = await page(`${base}?as=arjan&third=1&samadmin=1`, w, 844, mode);
    ok(`${tag}: the founding member can remove Sam's admin and make Maya one (two buttons, none on themselves)`, (await p.locator("details.adm").count()) === 2);
    await p.context().close();
  }
  // the desktop Profile window
  const win = `${ROOT}/fragments/desktop-profile/index.html?open=household`;
  for (const [role, buttons, noteRe] of [["founder", 3, /Admins can make someone an admin/], ["admin", 2, /Admins can make someone an admin/], ["member", 0, /Only household admins can make someone an admin, or take it back\. Admins: .* and maya/]]) {
    const p = await page(`${win}&hhrole=${role}`, 1280, 800, mode);
    const tag = `window ${role} ${mode}`;
    ok(`${tag}: ${buttons} Make or Remove admin buttons`, (await p.locator("details.pf-adm").count()) === buttons, await p.locator("details.pf-adm").count());
    ok(`${tag}: the words under the list`, noteRe.test(await p.locator(".pf-pane, .pf-body").first().innerText()));
    if (buttons) { await p.locator("details.pf-adm summary").first().click(); ok(`${tag}: the confirm opens`, await p.locator("details.pf-adm[open] .pf-admbox").isVisible()); }
    if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/window-${role}-${mode}.png` });
    await noScroll(p, tag); await p.context().close();
  }
}
await browser.close();
console.log(`${total - fails}/${total} checks passed`);
process.exit(fails ? 1 : 0);
