// Behaviour check for Household members and admins (owner, typed, 14 Oct 2026; SW-85 to SW-89; owner, voice, 15 Oct 2026, no special founder: SW-90 onward). Mockup only.
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
    const labels = async (pg) => await pg.locator("details.adm summary").evaluateAll((e) => e.map((x) => x.getAttribute("aria-label")));
    p = await page(`${base}?as=sam&third=1&samadmin=1`, w, 844, mode);
    ok(`${tag}: a second admin gets a button on everyone, the founding member included, and Step down on themselves`, JSON.stringify((await labels(p)).sort()) === JSON.stringify(["Make Maya an admin", "Remove Arjan as admin", "Step down as admin"]), await labels(p));
    ok(`${tag}: an admin is told a household always keeps one admin`, /A household always keeps one admin/.test(await p.locator("#admnote").innerText()));
    ok(`${tag}: no last-admin line while there are two admins`, (await p.locator(".lastadm").count()) === 0);
    ok(`${tag}: the confirm is closed until pressed`, (await p.locator("details.adm[open]").count()) === 0);
    await p.locator('details.adm summary[aria-label="Make Maya an admin"]').click();
    ok(`${tag}: pressing opens the confirm and the same press now reads Cancel`, (await p.locator("details.adm[open] .admbox b").innerText()) === "Make Maya an admin?" && await p.locator("details.adm[open] summary .c").isVisible() && !(await p.locator("details.adm[open] summary .o").isVisible()));
    if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/admin-open-${form}-${mode}.png` });
    await noScroll(p, tag);
    await p.locator("details.adm[open] .admbox button").click();
    ok(`${tag}: confirming makes Maya an admin`, (await p.locator(".m.mm .chip", { hasText: "Admin" }).count()) >= 2 && (await labels(p)).includes("Remove Maya as admin"), await labels(p));
    await p.context().close();
    // the founding member has no special standing: the other admin takes it back
    p = await page(`${base}?as=sam&third=1&samadmin=1`, w, 844, mode);
    await p.locator('details.adm summary[aria-label="Remove Arjan as admin"]').click();
    ok(`${tag}: the confirm names the founding member`, /Remove Arjan as admin\?/.test(await p.locator("details.adm[open] .admbox b").innerText()));
    await p.locator("details.adm[open] .admbox button").click();
    ok(`${tag}: the founding member is no longer an admin, and still the founding member`, /Arjan is no longer an admin/.test(await p.locator("body").innerText()) && (await p.locator(".m.mm .chip", { hasText: "Founding member" }).count()) === 1 && (await p.locator(".m.mm .chip", { hasText: /^Admin$/ }).count()) === 1);
    ok(`${tag}: Sam is now the last admin and reads what to do`, (await p.locator(".lastadm").allInnerTexts()).join("|") === "Make someone else an admin first." && !(await labels(p)).includes("Step down as admin"), await labels(p));
    await p.context().close();
    p = await page(`${base}?as=arjan&third=1&samadmin=1`, w, 844, mode);
    ok(`${tag}: the founding member, with another admin, can step down, remove Sam and make Maya`, JSON.stringify((await labels(p)).sort()) === JSON.stringify(["Make Maya an admin", "Remove Sam as admin", "Step down as admin"]), await labels(p));
    await p.locator('details.adm summary[aria-label="Step down as admin"]').click();
    await p.locator("details.adm[open] .admbox button").click();
    ok(`${tag}: stepping down says so, and the founder loses every button`, /You are no longer an admin/.test(await p.locator("body").innerText()) && (await p.locator("details.adm").count()) === 0);
    ok(`${tag}: the note now tells them who the admins are`, /Admins: Sam\./.test(await p.locator("#admnote").innerText()));
    await p.context().close();
    // the last admin
    p = await page(`${base}?as=arjan&third=1`, w, 844, mode);
    ok(`${tag}: the only admin has no Step down, and is told to make someone else an admin first`, (await p.locator(".lastadm").allInnerTexts()).join("|") === "Make someone else an admin first." && JSON.stringify((await labels(p)).sort()) === JSON.stringify(["Make Maya an admin", "Make Sam an admin"]), await labels(p));
    if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/admin-last-${form}-${mode}.png` });
    await noScroll(p, tag); await p.context().close();
    p = await page(`${base}?as=sam&third=1&arjanout=1`, w, 844, mode);
    ok(`${tag}: Sam, the only admin now, has the same line and can make Arjan an admin again`, (await p.locator(".lastadm").count()) === 1 && (await labels(p)).includes("Make Arjan an admin"), await labels(p));
    await p.context().close();
  }
  // the desktop Profile window
  const win = `${ROOT}/fragments/desktop-profile/index.html?open=household`;
  for (const [role, buttons, noteRe, last] of [["founder", 4, /Admins can make someone an admin/, 0], ["admin", 4, /Admins can make someone an admin/, 0], ["member", 0, /Only household admins can make someone an admin, or take it back\. Admins: .* and maya/, 0], ["last", 3, /A household always keeps one admin/, 1], ["exfounder", 3, /A household always keeps one admin/, 1]]) {
    const p = await page(`${win}&hhrole=${role}`, 1280, 800, mode);
    const tag = `window ${role} ${mode}`;
    ok(`${tag}: ${buttons} Make or Remove admin buttons`, (await p.locator("details.pf-adm").count()) === buttons, await p.locator("details.pf-adm").count());
    ok(`${tag}: the words under the list`, noteRe.test(await p.locator(".pf-pane, .pf-body").first().innerText()));
    ok(`${tag}: ${last} last-admin line`, (await p.locator(".pf-lastadm").count()) === last && (!last || /Make someone else an admin first\./.test(await p.locator(".pf-lastadm").innerText())));
    if (role === "founder" || role === "admin") ok(`${tag}: Step down on the own row`, (await p.locator('details.pf-adm summary[aria-label="Step down as admin"]').count()) === 1);
    if (role === "exfounder") ok(`${tag}: the founding member is told they are not an admin now`, /Not an admin now/.test(await p.locator(".pf-pane, .pf-body").first().innerText()));
    if (buttons) { await p.locator("details.pf-adm summary").first().click(); ok(`${tag}: the confirm opens`, await p.locator("details.pf-adm[open] .pf-admbox").isVisible()); }
    if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/window-${role}-${mode}.png` });
    await noScroll(p, tag); await p.context().close();
  }
}
await browser.close();
console.log(`${total - fails}/${total} checks passed`);
process.exit(fails ? 1 : 0);
