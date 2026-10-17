// Behaviour + layout check for fragments/household-activity (headless Chromium): the bell and its badge (phone header, desktop rail), the peek (option B), option A,
// the counting rules (own changes, removals and old changes left out, 30-minute bursts, 9+ cap), the setting, the Level 2 idea card states, the notes page.
// Usage:  python3 -m http.server 8191 &   then   node tools/household-activity-check.mjs [shotsDir]
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers). Runs at 390px and 360px (app.html) and 1280px (desktop.html), light (kitchie-day) and dark (kitchie).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8191/fragments/household-activity/app.html";
const DESK = BASE.replace("app.html", "desktop.html"), NOTES = BASE.replace("app.html", "index.html");
const shots = process.argv[2] || "";
if (shots) mkdirSync(shots, { recursive: true });
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const box = (p, sel) => p.locator(sel).evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; });
const vis = (p, sel) => p.locator(sel).count().then(n => n ? p.locator(sel).first().evaluate(e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0; }) : false);
const noSideways = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

async function phone(width, mode) {
  const theme = mode === "dark" ? "kitchie" : "kitchie-day";
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: mode });
  const errs = [];
  const open = async (q = "") => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(`${BASE}?theme=${theme}${q}`); await p.waitForTimeout(80); return p; };
  const tag = `${width} ${mode}`;
  const snap = async (p, name) => { if (shots) await p.screenshot({ path: `${shots}/household-activity-${name}-${width}-${mode}.png` }); };

  // ---- none: the bell is not there; own changes and a removal are not counted
  { const p = await open("&scene=none");
    ok(`${tag} none: bell hidden`, !(await vis(p, "#activity")));
    ok(`${tag} none: aria says no new changes`, (await p.locator("#activity").getAttribute("aria-label")) === "No new changes");
    ok(`${tag} none: no sideways scroll`, await noSideways(p));
    await p.close(); }
  // ---- few: 4 new, the badge, the header order, target size
  { const p = await open("&scene=few");
    const b = await box(p, "#activity"), av = await box(p, "#profile"), top = await box(p, ".top");
    ok(`${tag} few: bell visible`, await vis(p, "#activity"));
    ok(`${tag} few: badge says 4`, (await p.locator("#activity .n").innerText()) === "4");
    ok(`${tag} few: aria-label has the count and the sentences`, (await p.locator("#activity").getAttribute("aria-label")) === "4 new: Sam used up 1 item; Priya used up 2 items; Someone added 1 item", await p.locator("#activity").getAttribute("aria-label"));
    ok(`${tag} few: bell is left of the profile button, same row`, b.r <= av.x && Math.abs((b.y + b.h / 2) - (av.y + av.h / 2)) <= 2, [b, av]);
    ok(`${tag} few: bell and profile are 44px targets`, b.w >= 44 && b.h >= 44 && av.w >= 44 && av.h >= 44, [b.w, b.h, av.w, av.h]);
    ok(`${tag} few: header text is not squeezed to nothing`, (await box(p, ".top>span")).w > 80);
    ok(`${tag} few: badge fits inside the frame (not clipped)`, (await box(p, "#activity .n")).r <= top.r && (await box(p, "#activity .n")).y >= top.y - 8);
    ok(`${tag} few: badge text and fill differ`, await p.locator("#activity .n").evaluate(e => { const s = getComputedStyle(e); return s.color !== s.backgroundColor; }));
    ok(`${tag} few: no sideways scroll`, await noSideways(p));
    await snap(p, "1-bell");
    await p.close(); }
  // ---- one, many: counts and the cap
  { const p = await open("&scene=one");
    ok(`${tag} one: badge 1, singular sentence`, (await p.locator("#activity .n").innerText()) === "1" && (await p.locator("#activity").getAttribute("aria-label")) === "1 new: Someone added 1 item");
    await p.close(); }
  { const p = await open("&scene=many");
    ok(`${tag} many: 12 changes show 9+`, (await p.locator("#activity .n").innerText()) === "9+");
    ok(`${tag} many: 9+ badge inside the header`, (await box(p, "#activity .n")).r <= (await box(p, ".top")).r);
    await snap(p, "2-nine-plus");
    // ---- the peek, option B
    await p.click("#activity");
    await p.waitForSelector("#actpeek");
    const pk = await box(p, "#actpeek"), ph = await box(p, "#phone"), top = await box(p, ".top");
    ok(`${tag} peek: opens in place, no navigation`, p.url().includes("app.html"));
    ok(`${tag} peek: bell is a pressed button`, (await p.locator("#activity").getAttribute("aria-expanded")) === "true" && (await p.locator("#activity").getAttribute("role")) === "button");
    ok(`${tag} peek: card sits under the header, inside the frame`, pk.y >= top.b && pk.x >= ph.x && pk.r <= ph.r && pk.b <= ph.b, [pk, ph]);
    ok(`${tag} peek: four rows then "and 1 more in History"`, (await p.locator(".ap-row").count()) === 4 && (await p.locator(".ap-more").innerText()) === "and 1 more in History");
    const rows = await p.locator(".ap-tx").evaluateAll(a => a.map(e => e.firstChild ? e.innerText.replace(/\n/g, " | ") : ""));
    ok(`${tag} peek: bursts are one row each (5 items by Sam are one row)`, rows[0].startsWith("Sam added 5 items | Today, 8:05 to 8:12 am") || rows.some(r => r.startsWith("Sam added 5 items | Today, 8:05 to 8:12 am")), rows);
    ok(`${tag} peek: rows say who and what, never an item name`, rows.every(r => /^(Sam|Priya|Someone) (added|used up) \d+ items?/.test(r)), rows);
    ok(`${tag} peek: your own and a removal are not listed`, !rows.some(r => /Arjan|removed|deleted/.test(r)), rows);
    ok(`${tag} peek: the shared address is Someone with a note`, rows.some(r => r.startsWith("Someone added 1 item") && r.includes("shared AI link")), rows);
    ok(`${tag} peek: the count clears on open (cursor moved), bell stays`, !(await vis(p, "#activity .n")) && (await vis(p, "#activity")));
    ok(`${tag} peek: scrim and card present`, (await vis(p, "#actscrim")) && (await vis(p, "#actpeek")));
    ok(`${tag} peek: close, history and settings are 44px targets`, (await box(p, "#ap-close")).h >= 44 && (await box(p, "#ap-history")).h >= 44 && (await box(p, "#ap-settings")).h >= 44);
    ok(`${tag} peek: Open History links to the catch-up`, (await p.locator("#ap-history").getAttribute("href")).includes("history/option-d"));
    ok(`${tag} peek: no sideways scroll`, await noSideways(p));
    ok(`${tag} peek: focus is inside the card`, await p.evaluate(() => document.getElementById("actpeek").contains(document.activeElement)));
    await snap(p, "3-peek");
    await p.keyboard.press("Escape");
    ok(`${tag} peek: Esc closes it`, !(await vis(p, "#actpeek")));
    ok(`${tag} peek: after closing the bell is gone (seen) and focus moves to the profile button`, !(await vis(p, "#activity")) && (await p.evaluate(() => document.activeElement.id)) === "profile");
    await p.close(); }
  // ---- the scrim closes the peek; the X closes it
  { const p = await open("&scene=few&open=peek");
    ok(`${tag} peek few: three rows, no "and more" line`, (await p.locator(".ap-row").count()) === 3 && (await p.locator(".ap-more").count()) === 0);
    await p.click("#ap-close"); ok(`${tag} peek: X closes`, !(await vis(p, "#actpeek")));
    await p.close(); }
  // ---- option A: the bell is a plain link to History, no peek
  { const p = await open("&scene=few&option=a");
    ok(`${tag} option A: plain link to the History catch-up`, (await p.locator("#activity").getAttribute("href")).includes("history/option-d") && (await p.locator("#activity").getAttribute("role")) === null);
    await p.close(); }
  // ---- the setting
  { const p = await open("&screen=settings&push=off");
    ok(`${tag} settings: Show household activity is a labelled checkbox, checked`, await p.locator("#s-activity").isChecked() && (await p.locator("label.check", { hasText: "Show household activity" }).count()) === 1);
    ok(`${tag} settings: check row is a 44px target`, (await box(p, "label.check:has(#s-activity)")).h >= 44);
    ok(`${tag} settings: title is Settings`, (await p.locator("#toptitle").innerText()) === "Settings");
    ok(`${tag} settings: Level 2 card says it is not approved`, (await p.locator("#push-card .idea").innerText()).includes("not approved"));
    ok(`${tag} settings: Turn on is shown`, await vis(p, "#push-on"));
    await snap(p, "4-settings");
    await p.click("#push-on");
    ok(`${tag} settings: Turn on switches to on with a counts-only notification`, (await p.locator("#push-card").getAttribute("data-push")) === "on" && (await p.locator(".pushcard").innerText()).includes("Sam added 5 items") && !/Green tea|butter|milk/i.test(await p.locator(".pushcard").innerText()));
    await snap(p, "5-push-on");
    await p.uncheck("#s-activity");
    ok(`${tag} settings: unchecking hides the bell and disables the Level 2 card`, !(await vis(p, "#activity")) && (await p.locator("#push-card").getAttribute("data-off")) !== null && (await p.locator("#push-card").innerText()).includes("Off while Show household activity is off"));
    await p.check("#s-activity");
    ok(`${tag} settings: checking it brings the bell back`, await vis(p, "#activity"));
    ok(`${tag} settings: no sideways scroll`, await noSideways(p));
    await p.close(); }
  for (const [st, want] of [["blocked", "Blocked in this browser"], ["ios", "Home Screen"]]) {
    const p = await open(`&screen=settings&push=${st}`);
    ok(`${tag} Level 2 ${st}: wording`, (await p.locator("#push-card").innerText()).includes(want));
    ok(`${tag} Level 2 ${st}: no way to turn it on`, !(await vis(p, "#push-on")));
    if (st === "blocked") await snap(p, "6-blocked");
    await p.close();
  }
  { const p = await open("&scene=many&pref=0");
    ok(`${tag} setting off: no bell`, !(await vis(p, "#activity")));
    await p.close(); }
  ok(`${tag}: no console errors`, errs.length === 0, errs);
  await ctx.close();
}
for (const w of [390, 360]) for (const m of ["light", "dark"]) await phone(w, m);

// ---- desktop 1280: bell in the rail, peek in the lane
for (const mode of ["light", "dark"]) {
  const theme = mode === "dark" ? "kitchie" : "kitchie-day";
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: mode });
  const errs = [];
  const open = async (q = "") => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(`${DESK}?theme=${theme}${q}`); await p.waitForTimeout(80); return p; };
  const tag = `1280 ${mode}`;
  const snap = async (p, name) => { if (shots) await p.screenshot({ path: `${shots}/household-activity-desktop-${name}-${mode}.png` }); };
  { const p = await open("&scene=few");
    const b = await box(p, "#activity"), av = await box(p, "#profile"), rail = await box(p, ".rail");
    ok(`${tag} bell is a rail item above the profile button`, b.r <= rail.r && b.b <= av.y && b.x >= rail.x, [b, av]);
    ok(`${tag} badge 4 in the rail`, (await p.locator("#activity .n").innerText()) === "4");
    ok(`${tag} bell is a 44px target`, b.h >= 44);
    ok(`${tag} lane is empty`, (await p.locator("#lane .pempty").count()) === 1);
    await snap(p, "1-rail");
    await p.click("#activity");
    await p.waitForSelector("#actpeek");
    const pk = await box(p, "#actpeek"), lane = await box(p, "#lane");
    ok(`${tag} peek opens in the lane`, pk.x >= lane.x && pk.r <= lane.r + 1 && pk.y >= lane.y, [pk, lane]);
    ok(`${tag} peek: three rows`, (await p.locator(".ap-row").count()) === 3);
    ok(`${tag} peek: close button is whole (not clipped)`, (await box(p, "#ap-close")).r <= lane.r - 8);
    ok(`${tag} peek: the list column did not move`, (await box(p, ".col")).x > 100 && (await box(p, ".col")).r <= lane.x);
    ok(`${tag} peek: no overlay scrim on desktop`, (await p.locator("#actscrim").count()) === 0);
    await snap(p, "2-peek");
    await p.keyboard.press("Control+Enter");
    ok(`${tag} peek: Ctrl+Enter closes it and restores the empty lane`, (await p.locator("#actpeek").count()) === 0 && (await p.locator("#lane .pempty").count()) === 1);
    ok(`${tag} peek: bell hides after the peek (seen), focus on the profile button`, !(await vis(p, "#activity")) && (await p.evaluate(() => document.activeElement.id)) === "profile");
    ok(`${tag} no sideways scroll`, await noSideways(p));
    await p.close(); }
  { const p = await open("&scene=many&open=peek");
    ok(`${tag} many: four rows and "and 1 more"`, (await p.locator(".ap-row").count()) === 4 && (await p.locator(".ap-more").count()) === 1);
    await p.click("#ap-settings");
    ok(`${tag} Settings link opens settings in the lane`, (await p.locator("#s-activity").count()) === 1 && (await p.locator("#actpeek").count()) === 0);
    await p.close(); }
  { const p = await open("&open=settings&push=on");
    await snap(p, "3-settings");
    ok(`${tag} settings in the lane: card and notification`, (await p.locator(".pushcard").count()) === 1 && (await box(p, "#lane")).w >= 400);
    await p.close(); }
  { const p = await open("&scene=none"); ok(`${tag} none: no bell in the rail`, !(await vis(p, "#activity"))); await p.close(); }
  ok(`${tag}: no console errors`, errs.length === 0, errs);
  await ctx.close();
}

// ---- notes page at three widths: no sideways scroll, links present
for (const w of [390, 360, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage(); await p.goto(NOTES); await p.waitForTimeout(150);
  ok(`${w} notes: no sideways scroll`, await noSideways(p));
  ok(`${w} notes: decisions, proposals and open questions listed`, (await p.locator("text=HA-D4").count()) > 0 && (await p.locator("text=HA-P3").count()) > 0 && (await p.locator("text=HA-Q8").count()) > 0);
  if (shots && w === 390) await p.screenshot({ path: `${shots}/household-activity-notes-390.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(`${total - fails} of ${total} checks passed`);
process.exit(fails ? 1 : 0);
