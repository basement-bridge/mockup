// Behaviour, layout and Tab-order check for fragments/preferences-h-final (headless Chromium). Prints PASS or FAIL per check.
// Usage:  python3 -m http.server 8123 &   then   node tools/preferences-h-final-check.mjs      (BASE=http://localhost:PORT/fragments/preferences-h-final/ to change the address)
// Needs playwright-core and Chromium at PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers).
// Covers: every view at 390x844 and 360x640, light and dark, the phone's own text size and +30%: no console error, no sideways scroll, nothing wider than the phone, every control 44px both ways;
// a plus (>=44px square, on the right edge) on every group header and no Add rows; Hard and Soft are WORDS (no lock glyph anywhere); Reason is Comment, a Share with household box sits ABOVE the box, off by default;
// the sheet is one design for Add and Edit (dialog, focus trapped, Esc, focus returned); a real-touch swipe (CDP) left removes (Soft at once, Hard asks in the row), short swipes spring back, a vertical scroll never swipes,
// swipe right does nothing; the Undo bar after every removal and Undo puts the rule back where it was; Delete on a row and Remove in the sheet are the non-gesture ways; Add validates; a member who is not an admin
// sees no plus, no swipe and no Remove, and never someone else's private comment; Tab reaches the last control; no hex colour; the notes (docs/knowledge/preferences-h-final.md, JTBD), REVIEW-QUEUE.
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:8123/fragments/preferences-h-final/";
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const b = await chromium.launch();
async function ctx(theme, scheme, w, h, touch = false) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, hasTouch: touch, isMobile: touch });
  await c.addInitScript(t => localStorage.setItem("theme", t), theme);
  return c;
}
function track(p) { p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error") p.errs.push(m.text()); }); return p; }
async function open(c, view = "mine", ts = 0, w = 390, extra = "") {
  const pg = track(await c.newPage());
  await pg.goto(`${BASE}index.html?bare=1&view=${view}&ts=${ts}&w=${w}${extra}`); await pg.waitForSelector("body[data-ready]"); await pg.waitForTimeout(80);
  return pg;
}
const LAYOUT = () => {
  const ph = document.querySelector(".ph"), R = ph.getBoundingClientRect();
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; if (e.closest("[hidden],[inert]")) return false; return true; };
  const small = [], wide = [];
  for (const e of ph.querySelectorAll("button,input,textarea,[role=switch]")) {
    if (e.closest(".vh") || e.classList.contains("vh")) continue;
    let t = e; if (e.type === "checkbox") t = e.closest("label") || e;
    if (!vis(t)) continue; const r = t.getBoundingClientRect();
    if (r.height < 43.5 || r.width < 43.5) small.push((e.getAttribute("aria-label") || e.textContent || e.className).trim().slice(0, 24) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  for (const e of ph.querySelectorAll("*")) {
    if (!vis(e) || e.classList.contains("vh") || e.closest(".vh") || e.closest(".fdel")) continue; const r = e.getBoundingClientRect();
    if (r.right > R.right + 1.5 || r.left < R.left - 1.5) wide.push(e.className && e.className.baseVal === undefined ? e.className : e.tagName);
  }
  const bd = ph.querySelector(".bd"), sh = ph.querySelector(".shp");
  return { small, wide: wide.slice(0, 3), sx: document.documentElement.scrollWidth > innerWidth + 1 || bd.scrollWidth > bd.clientWidth + 1 || (sh && sh.scrollWidth > sh.clientWidth + 1) };
};
const VIEWS = ["mine", "edit", "soft", "add", "addswap", "addlimit", "comment", "confirm", "undo", "hh", "member"];

/* 1. every view, both widths, light and dark, both text sizes */
for (const [th, sc] of [["kitchie", "dark"], ["kitchie-day", "light"]]) for (const [w, h] of [[390, 844], [360, 640]]) for (const ts of [0, 3]) {
  const c = await ctx(th, sc, w, h); let bad = [], n = 0;
  for (const v of VIEWS) { const p = await open(c, v, ts, w); n++; const L = await p.evaluate(LAYOUT); if (p.errs.length || L.sx || L.wide.length || L.small.length) bad.push(`${v}: ${p.errs.join(";")} ${L.sx ? "scroll-x " : ""}${L.wide.join(",")} ${L.small.join(",")}`); await p.close(); }
  ok(bad.length === 0, `${n} views ${th} ${w}x${h} text ${ts ? "+30%" : "own"}: no error, no sideways scroll, nothing wider than the phone, controls 44px ${bad.slice(0, 4).join(" | ")}`);
  await c.close();
}

/* 2. plus buttons, no add rows, words not glyphs */
{
  const c = await ctx("kitchie", "dark", 390, 844), p = await open(c, "mine", 0, 390);
  const r = await p.evaluate(() => {
    const ph = document.querySelector(".ph"), R = ph.getBoundingClientRect();
    const plus = [...ph.querySelectorAll(".fgroup .fh .fplus")].map(b => { const r = b.getBoundingClientRect(), h = b.closest(".fh").querySelector("h3").getBoundingClientRect(); return { w: r.width, h: r.height, edge: R.right - r.right, name: b.getAttribute("aria-label"), g: b.closest(".fgroup").getAttribute("aria-label"), mid: Math.abs((r.top + r.height / 2) - (h.top + h.height / 2)) }; });
    return {
      plus, addRows: ph.querySelectorAll(".addli,.fadd,.fadd-li,button.add").length,
      lockSvg: ph.querySelectorAll(".fgroup svg rect").length, markSvg: ph.querySelectorAll(".fmark svg").length,
      hard: [...ph.querySelectorAll(".fmark:not(.soft) .fw")].map(e => e.textContent), soft: [...ph.querySelectorAll(".fmark.soft .fw")].map(e => e.textContent),
      groups: [...ph.querySelectorAll(".fgroup")].map(g => g.getAttribute("aria-label")),
      first: ph.querySelector(".fgroup .fplus") && getComputedStyle(ph.querySelector(".fgroup:nth-of-type(1) .fplus")).color,
      scope: [...ph.querySelectorAll(".fscope")].map(e => e.querySelector(".vh").textContent), people: [...ph.querySelectorAll(".fscope svg")].length, rows: ph.querySelectorAll(".frow").length,
    };
  });
  ok(r.plus.length === 4 && r.plus.every(x => x.w >= 43.5 && x.h >= 43.5), `a plus (44px square or more) on each of the ${r.plus.length} group headers: ${r.plus.map(x => Math.round(x.w) + "x" + Math.round(x.h)).join(" ")}`);
  ok(r.plus.every(x => x.edge >= 0 && x.edge <= 16 && x.mid < 2), `the plus sits on the right edge of its header, on the heading's line (edge gaps ${r.plus.map(x => Math.round(x.edge)).join(",")})`);
  ok(r.plus.every(x => /^Add (avoid|like|swap|limit)$/.test(x.name)), `each plus names its group for a screen reader: ${r.plus.map(x => x.name).join(", ")}`);
  ok(r.addRows === 0, "no separate Add rows under any group");
  ok(r.lockSvg === 0 && r.markSvg === 0, "Hard and Soft are not lock glyphs: no lock drawn on any row");
  ok(r.hard.length >= 5 && r.hard.every(t => t === "Hard") && r.soft.length === 1 && r.soft[0] === "Soft", `Hard and Soft are words on the rows (${r.hard.length} Hard, ${r.soft.length} Soft)`);
  ok(r.people === r.rows, "every row still has its one-person or two-people glyph (state as a glyph for who it is for)");
  ok(JSON.stringify(r.groups) === JSON.stringify(["Avoids", "Likes", "Swaps", "Limits"]), "groups: Avoids, Likes, Swaps, Limits");
  await p.close(); await c.close();
}

/* 3. the sheet: one design for Add and Edit, preset to its group, Comment and the share box */
{
  const c = await ctx("kitchie", "dark", 390, 844);
  let p = await open(c, "mine");
  await p.click('[data-act="sheet:p"]');
  const e = await p.evaluate(() => { const s = document.querySelector(".shp"); return { role: s.getAttribute("role"), modal: s.getAttribute("aria-modal"), name: document.getElementById(s.getAttribute("aria-labelledby")).textContent, inFocus: s.contains(document.activeElement), html: s.innerHTML, bdInert: document.querySelector(".bd").inert, hdInert: document.querySelector(".hd").inert, labels: [...s.querySelectorAll("label,.flab")].map(x => x.textContent.trim()), btns: [...s.querySelectorAll("button")].map(x => (x.getAttribute("aria-label") || x.textContent).trim()) }; });
  ok(e.role === "dialog" && e.modal === "true" && e.name === "pasta" && e.inFocus, `Edit: a modal dialog named by the rule (${e.name}), focus inside`);
  ok(e.bdInert && e.hdInert, "the page behind the sheet is inert");
  ok(!/Reason/.test(e.html) && e.labels.includes("Comment"), `Reason is Comment (labels: ${e.labels.join(", ")})`);
  ok(e.labels.indexOf("Share with household") > -1 && e.labels.indexOf("Share with household") < e.labels.indexOf("Comment"), "the Share with household box is ABOVE the Comment box");
  ok(!/<svg[^>]*><rect/.test(e.html), "no lock glyph in the sheet; Hard and Soft are words: " + e.btns.filter(x => /Hard|Soft/.test(x)).join(","));
  const sh0 = await p.evaluate(() => ({ shared: document.getElementById("sh-share").checked, v: document.getElementById("sh-why").value, note: document.querySelector("[data-shnote]").textContent }));
  ok(sh0.shared === false && sh0.v === "Too many carbs" && /Only you/.test(sh0.note), "an existing comment is private (box off) and says who can read it: " + sh0.note);
  await p.click("#sh-share"); const n1 = await p.textContent("[data-shnote]"); ok(/household can read/.test(n1), "ticking the box changes the line under it: " + n1);
  // Tab loop
  const loop = await p.evaluate(async () => { const s = document.querySelector(".shp"); const f = [...s.querySelectorAll("button,input,textarea")].filter(x => !x.disabled && x.offsetParent); return f.length; });
  let seen = new Set(), inside = true; for (let i = 0; i < loop + 3; i++) { await p.keyboard.press("Tab"); const r = await p.evaluate(() => ({ i: document.querySelector(".shp").contains(document.activeElement), k: document.activeElement.getAttribute("data-fk") || document.activeElement.className })); inside = inside && r.i; seen.add(r.k); }
  ok(inside && seen.size >= 4, `Tab never leaves the sheet (${seen.size} stops)`);
  await p.keyboard.press("Escape");
  const back = await p.evaluate(() => ({ open: !!document.querySelector(".shp"), fk: document.activeElement.getAttribute("data-fk") }));
  ok(!back.open && back.fk === "sheet:p", "Esc closes the sheet and focus returns to the row that opened it (" + back.fk + ")");
  await p.click('[data-act="sheet:g"]'); const sg = await p.evaluate(() => document.getElementById("sh-share").checked); ok(sg === true, "the household's gluten comment is shared (box on)");
  await p.click('.shh [data-act="sheetx"]'); const f2 = await p.evaluate(() => document.activeElement.getAttribute("data-fk")); ok(f2 === "sheet:g", "the Close button returns focus to the row");
  // plus presets the group
  for (const [k, t] of [["avoid", "Add avoid"], ["like", "Add like"], ["swap", "Add swap"], ["limit", "Add limit"]]) {
    await p.click(`.fplus[data-act="add:${k}"]`); const o = await p.evaluate(() => ({ t: document.getElementById("sh-t").textContent, f: document.activeElement.id || document.activeElement.className, hardsoft: !!document.querySelector('[aria-label="Hard or soft"]'), use: !!document.getElementById("sh-to"), max: !!document.querySelector('[data-ctl="max"]'), cm: !!document.getElementById("sh-why"), who: !!document.querySelector('[aria-label="Who is it for"]') }));
    ok(o.t === t && o.who && o.hardsoft === (k === "avoid") && o.cm === (k === "avoid") && o.use === (k === "swap") && o.max === (k === "limit"), `plus on ${k}: sheet "${o.t}" preset to its group (Hard/Soft ${o.hardsoft}, Comment ${o.cm}, Use ${o.use}, Times a week ${o.max}), focus ${o.f}`);
    await p.keyboard.press("Escape"); const fr = await p.evaluate(() => document.activeElement.getAttribute("data-fk")); if (k === "avoid") ok(fr === "add:avoid", "Esc returns focus to the plus that opened the sheet");
  }
  await p.close();

  // Add validates, and adds
  p = await open(c, "mine");
  const nrows = () => p.evaluate(() => document.querySelectorAll(".frow").length);
  const n0 = await nrows();
  await p.click('.fplus[data-act="add:avoid"]'); await p.click('[data-act="addok"]');
  const er = await p.evaluate(() => ({ err: document.getElementById("sh-err")?.textContent, inv: document.getElementById("sh-name").getAttribute("aria-invalid"), open: !!document.querySelector(".shp"), foc: document.activeElement.id }));
  ok(er.err === "Needed" && er.inv === "true" && er.open && er.foc === "sh-name" && (await nrows()) === n0, "Add with nothing typed says so, keeps the sheet and puts focus on the box");
  await p.fill("#sh-name", "olives"); await p.click('[data-act="set:soft"]'); await p.click('[data-act="addok"]');
  const ad = await p.evaluate(() => { const r = [...document.querySelectorAll(".frow")].find(x => x.textContent.includes("olives")); return { has: !!r, soft: r && r.querySelector(".fmark.soft .fw")?.textContent, who: r && r.querySelector(".fscope .vh")?.textContent, closed: !document.querySelector(".shp"), foc: document.activeElement.closest(".frow")?.textContent.includes("olives") }; });
  ok(ad.has && ad.soft === "Soft" && ad.who === "Just you" && ad.closed && ad.foc, "Add: a Soft Just-you rule appears in its group and takes focus: " + JSON.stringify(ad));
  await p.click('.fplus[data-act="add:swap"]'); await p.fill("#sh-name", "butter"); await p.click('[data-act="addok"]');
  ok((await p.evaluate(() => document.getElementById("sh-err")?.textContent)) === "Needed", "a swap needs the Use box too");
  await p.fill("#sh-to", "ghee"); await p.click('[data-act="addok"]'); ok(await p.evaluate(() => [...document.querySelectorAll(".frow")].some(x => /butter/.test(x.textContent) && /ghee/.test(x.textContent))), "Add a swap shows the value on its row (Swap in ghee)");
  await p.click('.fplus[data-act="add:limit"]'); await p.fill("#sh-name", "cake"); await p.click('[data-act="max:1"]'); await p.click('[data-act="addok"]');
  ok(await p.evaluate(() => [...document.querySelectorAll(".frow")].some(x => /cake/.test(x.textContent) && /3 times a week/.test(x.textContent))), "Add a limit shows its value on its row (At most 3 times a week)");
  await p.click('.fplus[data-act="add:avoid"]'); await p.fill("#sh-name", "shellfish"); await p.click("#sh-share"); await p.fill("#sh-why", "Allergy"); await p.click('[data-act="who:hh"]'); await p.click('[data-act="addok"]');
  ok(await p.evaluate(() => { const r = [...document.querySelectorAll(".frow")].find(x => /shellfish/.test(x.textContent)); return r && r.querySelector(".fmark:not(.soft) .fw") && r.querySelector(".fscope .vh").textContent === "Everyone"; }), "Add a Hard Everyone avoid (a default Hard, Everyone chosen in the sheet)");
  await p.click('[data-act="sheet:p"]'); ok((await p.evaluate(() => document.getElementById("sh-share").checked)) === false, "the next sheet starts with the box off again");
  await p.close();

  // Hard to Soft asks once; Soft to Hard does not
  p = await open(c, "mine"); await p.click('[data-act="sheet:p"]'); await p.click('[data-act="set:soft"]');
  ok(await p.evaluate(() => !!document.querySelector('[aria-label="Make it soft"]') && document.querySelector('[data-act="set:hard"]').getAttribute("aria-checked") === "true"), "Hard to Soft asks once and changes nothing until answered");
  await p.click('[data-act="softok"]'); ok(await p.evaluate(() => document.querySelector('[data-act="set:soft"]').getAttribute("aria-checked") === "true"), "Make soft makes it soft");
  await p.click('[data-act="set:hard"]'); ok(await p.evaluate(() => document.querySelector('[data-act="set:hard"]').getAttribute("aria-checked") === "true" && !document.querySelector('[aria-label="Make it soft"]')), "Soft to Hard does not ask");
  await p.close(); await c.close();
}

/* 4. real touch: swipe left removes; the page's scroll stays the page's */
{
  const c = await ctx("kitchie", "dark", 390, 844, true);
  const p = await open(c, "mine", 0, 390, "&undoms=4000");
  const cdp = await c.newCDPSession(p);
  const touch = async (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  const centre = async sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }, sel);
  const swipe = async (sel, dx, dy = 0) => { const r = await centre(sel); const x0 = r.x + 60, y0 = r.y; await touch("touchStart", x0, y0); for (let i = 1; i <= 8; i++) { await touch("touchMove", x0 + dx * i / 8, y0 + dy * i / 8); await p.waitForTimeout(16); } const mid = await p.evaluate(s => ({ tr: document.querySelector(s).style.transform, sw: document.querySelector(s).parentNode.getAttribute("data-swipe") }), sel); await touch("touchEnd", 0, 0); await p.waitForTimeout(120); return mid; };
  const has = t => p.evaluate(t => [...document.querySelectorAll(".frow")].some(x => x.textContent.includes(t)), t);
  const order = () => p.evaluate(() => [...document.querySelectorAll(".fgroup[data-setting=avoids] .frow")].map(x => x.getAttribute("data-row")).join(","));
  const o0 = await order();
  let m = await swipe('[data-act="sheet:i"]', -40);
  ok(/translateX\(-/.test(m.tr) && m.sw === "on" && await has("iceberg") && !(await p.evaluate(() => !!document.querySelector(".undo:not([hidden])"))), "a short swipe (40px) moves the row, shows the red panel, and springs back: nothing removed");
  ok(await p.evaluate(() => document.querySelector('[data-act="sheet:i"]').style.transform === ""), "the row is back at rest after a short swipe");
  m = await swipe('[data-act="sheet:i"]', 60);
  ok(await has("iceberg") && !(await p.evaluate(() => !!document.querySelector(".shp"))), "swipe right does nothing (not removal, no sheet)");
  m = await swipe('[data-act="sheet:i"]', -150);
  ok(m.sw === "armed", "past the line the panel is armed (data-swipe=armed)");
  ok(!(await has("iceberg")), "a long swipe left on a Soft rule removes it at once, no prompt");
  const ub = await p.evaluate(() => { const u = document.querySelector(".undo"), b = u.querySelector(".u-b").getBoundingClientRect(); return { hidden: u.hidden, t: u.textContent, w: b.width, h: b.height, role: u.getAttribute("role") }; });
  ok(!ub.hidden && /^Removed\s*iceberg lettuce/.test(ub.t) && ub.w >= 43.5 && ub.h >= 43.5 && ub.role === "status", "the Undo bar shows (a status, Undo is 44px): " + ub.t.trim());
  await p.click(".undo .u-b"); ok((await has("iceberg")) && (await order()) === o0, "Undo puts the rule back in the same place: " + (await order()));
  ok(await p.evaluate(() => document.activeElement.closest(".frow")?.getAttribute("data-row") === "i" && document.querySelector(".undo").hidden), "focus goes to the restored row, the bar is gone");
  // the bar goes by itself
  await swipe('[data-act="sheet:i"]', -150); await p.waitForTimeout(4400); ok(await p.evaluate(() => document.querySelector(".undo").hidden) && !(await has("iceberg")), "the Undo bar goes by itself (4s here, 8s in the page) and the removal stays");
  // Hard asks in place
  const t0 = await has("pasta"); await swipe('[data-act="sheet:p"]', -150);
  const cf = await p.evaluate(() => { const r = document.querySelector('.frow[data-row="p"]'); return { conf: !!r.querySelector(".propconf"), q: r.querySelector(".propconf p")?.textContent, btns: [...r.querySelectorAll(".propconf button")].map(x => x.textContent), n: document.querySelectorAll(".frow").length, foc: document.activeElement.textContent, undo: !document.querySelector(".undo").hidden }; });
  ok(t0 && cf.conf && cf.q === "Remove this hard stop?" && cf.btns.join() === "Remove,Keep" && !cf.undo, "swiping a HARD rule asks in place (Remove or Keep), nothing is removed yet, no Undo bar yet");
  ok(cf.foc === "Keep", "the safe answer (Keep) has focus");
  await p.click('.frow[data-row="p"] .propconf .pbtn:last-child'); ok((await has("pasta")) && (await p.evaluate(() => document.activeElement.closest(".frow")?.getAttribute("data-row") === "p")), "Keep puts the row back and focus on it");
  await swipe('[data-act="sheet:p"]', -150); await p.click('.frow[data-row="p"] .propconf .pbtn.danger');
  ok(!(await has("pasta")) && await p.evaluate(() => !document.querySelector(".undo").hidden && /pasta/.test(document.querySelector(".undo").textContent)), "Remove on the Hard confirm removes it and shows the Undo bar");
  await p.click(".undo .u-b"); ok(await has("pasta"), "Undo brings a removed Hard rule back (as it was: Hard)"); ok(await p.evaluate(() => document.querySelector('.frow[data-row="p"] .fmark .fw').textContent === "Hard"), "...still Hard");
  // a vertical scroll never swipes or removes
  const before = await p.evaluate(() => document.querySelector(".bd").scrollTop); const r = await centre('[data-act="sheet:r"]');
  await touch("touchStart", r.x, r.y); for (let i = 1; i <= 10; i++) { await touch("touchMove", r.x, r.y - 30 * i); await p.waitForTimeout(16); } await touch("touchEnd", 0, 0); await p.waitForTimeout(350);
  const after = await p.evaluate(() => ({ st: document.querySelector(".bd").scrollTop, rows: document.querySelectorAll(".frow").length, sw: document.querySelectorAll("[data-swipe]").length, sheet: !!document.querySelector(".shp"), tr: [...document.querySelectorAll(".fmain")].some(x => x.style.transform) }));
  ok(after.st > before && after.sw === 0 && !after.sheet && !after.tr, `a touch scroll on a row scrolls the page (${before} to ${after.st}); no swipe state, no sheet, no row moved`);
  // a diagonal drag that is mostly vertical does not swipe
  m = await swipe('[data-act="sheet:r"]', -50, 120); ok(!(await p.evaluate(() => document.querySelectorAll("[data-swipe]").length)) && (await has("roti")), "a mostly-vertical drag is not a swipe");
  // a tap still opens the sheet; a swipe never also opens it
  await swipe('[data-act="sheet:t"]', -40); ok(!(await p.evaluate(() => !!document.querySelector(".shp"))), "a swipe that springs back does not also open the sheet");
  await p.waitForTimeout(450); await p.tap('[data-act="sheet:t"]'); ok(await p.evaluate(() => !!document.querySelector(".shp")), "a tap opens the sheet");
  await p.close();

  // two touch swipes: Like and Swap rows also remove, with Undo
  const p2 = await open(c, "mine", 0, 390, "&undoms=4000"); const cdp2 = await c.newCDPSession(p2);
  async function sw2(sel, dx) { const r = await p2.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + 200, y: r.top + r.height / 2 }; }, sel); const t = (type, x, y) => cdp2.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] }); await t("touchStart", r.x, r.y); for (let i = 1; i <= 8; i++) { await t("touchMove", r.x + dx * i / 8, r.y); await p2.waitForTimeout(16); } await t("touchEnd", 0, 0); await p2.waitForTimeout(100); }
  await p2.evaluate(() => document.querySelector('[data-act="sheet:s1"]').scrollIntoView({ block: "center" })); await sw2('[data-act="sheet:s1"]', -150);
  ok(await p2.evaluate(() => ![...document.querySelectorAll(".frow")].some(x => /white bread/.test(x.textContent)) && !document.querySelector(".undo").hidden), "a Swap row swipes away at once with Undo");
  await p2.close(); await c.close();
}

/* 5. the ways that are not a gesture: Delete on a row, Remove in the sheet */
{
  const c = await ctx("kitchie", "dark", 390, 844), p = await open(c, "mine", 0, 390, "&undoms=60000");
  const has = t => p.evaluate(t => [...document.querySelectorAll(".frow")].some(x => x.textContent.includes(t)), t);
  await p.focus('[data-act="sheet:i"]'); await p.keyboard.press("Delete");
  ok(!(await has("iceberg")) && await p.evaluate(() => !document.querySelector(".undo").hidden), "Delete on a focused Soft row removes it and shows Undo");
  await p.keyboard.press("Tab"); // focus is on the next row after a removal; Undo is reachable by keyboard
  const un = await p.evaluate(() => { const b = document.querySelector(".undo .u-b"); b.focus(); return document.activeElement === b; }); await p.keyboard.press("Enter"); ok(un && (await has("iceberg")), "Undo works from the keyboard");
  await p.focus('[data-act="sheet:r"]'); await p.keyboard.press("Delete");
  const dh = await p.evaluate(() => ({ conf: !!document.querySelector('.frow[data-row="r"] .propconf'), foc: document.activeElement.outerHTML.slice(0, 90) }));
  ok(dh.conf, "Delete on a Hard row asks in place, like the swipe " + dh.foc);
  await p.keyboard.press("Enter"); // focus is on Keep
  ok(await has("roti"), "Enter on the default (Keep) keeps it");
  await p.click('[data-act="sheet:r"]'); await p.click('[data-act="stop"]');
  ok(await p.evaluate(() => !!document.querySelector('.shp .propconf') && document.querySelector('.shp .propconf p').textContent === "Remove this hard stop?"), "Remove in the sheet on a Hard rule asks once");
  await p.click('.shp [data-act="stopok"]'); ok(!(await has("roti")) && await p.evaluate(() => !document.querySelector(".shp") && !document.querySelector(".undo").hidden), "confirming removes it, closes the sheet, shows Undo");
  await p.click(".undo .u-b"); await p.click('[data-act="sheet:i"]'); await p.click('[data-act="stop"]');
  ok(!(await has("iceberg")) && await p.evaluate(() => !document.querySelector(".shp") && !document.querySelector(".undo").hidden), "Remove in the sheet on a Soft rule needs no confirmation and shows Undo");
  await p.close(); await c.close();
}

/* 6. a member who is not an admin; someone else's private comment */
{
  const c = await ctx("kitchie", "dark", 390, 844), p = await open(c, "member", 0, 390);
  const r = await p.evaluate(() => ({ plus: document.querySelectorAll(".fplus").length, del: document.querySelectorAll(".fdel").length, swipeOk: document.querySelectorAll("[data-swipe-ok]").length, rows: document.querySelectorAll(".frow").length }));
  ok(r.plus === 0 && r.del === 0 && r.swipeOk === 0 && r.rows >= 2, `a member who is not an admin sees the household's rules with no plus and no swipe (${r.rows} rows)`);
  await p.click('[data-act="sheet:g"]');
  const s = await p.evaluate(() => { const s = document.querySelector(".shp"); return { btns: [...s.querySelectorAll("button")].map(x => (x.getAttribute("aria-label") || x.textContent).trim()), txt: s.textContent, tx: s.querySelectorAll("textarea,input").length }; });
  ok(s.tx === 0 && !s.btns.includes("Remove") && /Admins only/.test(s.txt) && /Coeliac/.test(s.txt), "its sheet is read-only: no field, no Remove, 'Admins only', and the SHARED comment is readable");
  await p.keyboard.press("Escape"); await p.click('[data-act="sheet:h2"]');
  const s2 = await p.evaluate(() => document.querySelector(".shp").textContent); ok(!/Sam is allergic/.test(s2) && !/Comment/.test(s2), "someone else's private comment is not shown at all (peanuts)");
  await p.close();
  const p2 = await open(c, "hh", 0, 390); await p2.click('[data-act="sheet:h2"]');
  const s3 = await p2.evaluate(() => { const s = document.querySelector(".shp").textContent; return { s, tx: document.querySelectorAll(".shp textarea").length }; });
  ok(!/Sam is allergic/.test(s3.s) && s3.tx === 0, "an admin does not see another admin's private comment either, and cannot overwrite it");
  await p2.keyboard.press("Escape"); const plus = await p2.evaluate(() => [...document.querySelectorAll(".fplus")].map(x => x.getAttribute("aria-label")).join());
  ok(plus.includes("Add avoid") && !(await p2.evaluate(() => !!document.querySelector('[aria-label="Who is it for"]'))), "on Everyone an admin's plus is there and Add is for Everyone without asking who");
  await p2.close(); await c.close();
}

/* 7. Tab reaches the last control, with the page and the sheet closed; words budget */
{
  const c = await ctx("kitchie", "dark", 390, 844), p = await open(c, "mine");
  const last = await p.evaluate(() => { const f = [...document.querySelectorAll(".ph button,.ph input,.ph textarea")].filter(x => !x.disabled && !x.closest("[hidden],[inert]") && x.offsetParent && !x.closest(".vh")); return f[f.length - 1].getAttribute("data-fk") || f[f.length - 1].getAttribute("aria-label") || f[f.length - 1].className; });
  let reached = false, n = 0; await p.focus(".ph .bk");
  for (let i = 0; i < 120 && !reached; i++) { await p.keyboard.press("Tab"); n++; reached = await p.evaluate(l => { const a = document.activeElement; return (a.getAttribute("data-fk") || a.getAttribute("aria-label") || a.className) === l; }, last); }
  ok(reached, `Tab reaches the last control (${last}) in ${n} presses`);
  const words = await p.evaluate(() => { const bad = []; for (const b of document.querySelectorAll(".ph button")) { const t = (b.getAttribute("aria-label") || b.textContent).replace(/\s+/g, " ").trim(); if (t.split(" ").length > 3 && !b.querySelector(".d")) bad.push(t); } return bad; });
  ok(words.length === 0, "every button is 3 words or fewer " + words.join("|"));
  for (const k of ["add:avoid", "sheet:p"]) { await p.click(`[data-act="${k}"]`); const w = await p.evaluate(() => [...document.querySelectorAll(".shp button")].map(b => (b.getAttribute("aria-label") || b.textContent).replace(/\s+/g, " ").trim()).filter(t => t.split(" ").length > 3)); ok(w.length === 0, `sheet buttons (${k}) are 3 words or fewer ` + w.join("|")); await p.keyboard.press("Escape"); }
  await p.close(); await c.close();
}

/* 8. files and notes */
{
  const css = readFileSync("fragments/preferences-h-final/ph.css", "utf8"), js = readFileSync("fragments/preferences-h-final/ph.js", "utf8");
  ok(!/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no hex colour in ph.css");
  ok(!/#[0-9a-fA-F]{6}\b/.test(js), "no hex colour in ph.js");
  const note = existsSync("docs/knowledge/preferences-h-final.md") ? readFileSync("docs/knowledge/preferences-h-final.md", "utf8") : "";
  ok(/PH-D1\b/.test(note) && /Proposal/.test(note) && /SR-Q64/.test(note), "the knowledge note exists (decisions PH-D, proposals, SR-Q64 closed)");
  const jtbd = readFileSync("docs/knowledge/jobs-to-be-done/settings-redesign.md", "utf8"); ok(/SR-Q64/.test(jtbd) && /preferences-h-final/.test(jtbd), "the JTBD note records H final and closes SR-Q64");
  ok(/fragments\/preferences-h-final /.test(readFileSync("REVIEW-QUEUE", "utf8")), "REVIEW-QUEUE has the line");
}
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nAll passed");
process.exit(fails ? 1 : 0);
