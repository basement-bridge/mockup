// Receipt scan, quantity with a unit (Kitchie #754): every state of qu-a.html and qu-b.html at phone, tablet and desktop in both themes, then the corrections (take the unit off, type a unit, B's sheet save).
// Reports console errors, sideways scroll and tap targets under 44px. Usage: python3 -m http.server 8123 &   then   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/receipt-scan-qu-check.mjs
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:8123/fragments/receipt-scan/";
const base = "step=view&phase=end&pre=all";
const states = [base, base + "&filter=check", base + "&sel=l3", base + "&res=l6:new&sel=l6", base + "&sel=l3&nounit=l3", base + "&filter=check&sel=l7", base + "&filter=check&sel=l13", base + "&filter=unsure&sel=l12", base + "&qs=l3", base + "&typed=l3~2 litres of milk&sel=l3", base + "&hold=1", base + "&cf=all&toast=cf", base + "&filter=unsure", base + "&filter=ignored"];
const b = await chromium.launch(); let bad = 0, n = 0;
for (const opt of ["a", "b"]) for (const [w, h] of [[390, 844], [768, 1024], [1280, 800]]) for (const th of ["kitchie", "kitchie-day"]) for (const q of states) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(t => { try { localStorage.setItem("theme", t); } catch (e) {} }, th);
  await p.goto(`${BASE}qu-${opt}.html?${q}`); await p.waitForTimeout(300); n++;
  const r = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent && getComputedStyle(e).visibility !== "hidden"; };
    const small = [...document.querySelectorAll("button,input")].filter(e => { const r = e.getBoundingClientRect(); return vis(e) && (r.height < 43.5 || r.width < 43.5) && !e.closest(".dvp,.dvh,.wantbox") ; }).map(e => (e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
    return { x: document.documentElement.scrollWidth > innerWidth + 1, small: small.slice(0, 4) };
  });
  if (errs.length || r.x || r.small.length) { bad++; console.log(opt, w, th, q, errs.join("|"), r.x ? "SIDEWAYS" : "", r.small.join(" ")); }
  await p.close();
}
// corrections (A is the chosen option; B is kept)
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on("pageerror", e => errs.push(e.message));
  const say = (m) => { bad++; console.log(m, w); };
  await p.goto(`${BASE}qu-a.html?${base}&sel=l3`); await p.waitForTimeout(300);
  await p.click("#qb-l3u"); let t = await p.textContent(".ro-li.on .ro-out"); if (!/Kept separate/.test(t)) say("A clear unit: " + t);
  if (await p.getAttribute("#qb-l3", "inputmode")) say("A: the box is still numeric after the pill is cleared (RS-91)");
  await p.keyboard.type(" litres"); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/1 L to 3 L/.test(t) || !(await p.$("#qb-l3u"))) say("A typed words not folded to 2 L: " + t);
  await p.fill("#qb-l3", "2 litres of milk"); await p.press("#qb-l3", "Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/plus “2 litres of milk”/.test(t)) say("A own words not kept as typed: " + t);
  await p.fill("#qb-l3", "500 ml"); await p.press("#qb-l3", "Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/1 L to 1\.5 L/.test(t)) say("A type unit: " + t);
  // no quantity read: blank, never 1 (RS-88)
  await p.goto(`${BASE}qu-a.html?${base}&filter=check&sel=l7`); await p.waitForTimeout(300);
  if ((await p.inputValue("#qb-l7")) !== "") say("A: a line with no quantity does not show a blank box");
  t = await p.textContent(".ro-li.on .ro-out"); if (!/Type how much/.test(t)) say("A blank outcome: " + t);
  await p.fill("#qb-l7", "2"); await p.press("#qb-l7", "Enter"); await p.waitForTimeout(200);
  t = await p.textContent(".ro-li.on .ro-out"); if (!/1 bag to 3 bag/.test(t)) say("A blank then typed: " + t);
  // the photo follows the list (RS-89)
  await p.goto(`${BASE}qu-a.html?${base}&filter=check`); await p.waitForTimeout(400);
  const first = await p.evaluate(() => (document.querySelector(".qu-track") || {}).dataset?.id || "");
  await p.evaluate(() => { const b = innerWidth >= 1024 ? document.querySelector(".panel[data-mode=lane]") : document.querySelector(".ro-list"); b.scrollTop = 1100; }); await p.waitForTimeout(400);
  const later = await p.evaluate(() => (document.querySelector(".qu-track") || {}).dataset?.id || "");
  if (!first || !later || first === later) say("the photo did not follow the list: " + first + " then " + later);
  // RS-92: the first pill is Exact (a rename of All), every line is in exactly one pill
  await p.goto(`${BASE}qu-a.html?${base}`); await p.waitForTimeout(300);
  const pills = await p.$$eval(".ro-f", e => e.map(x => x.querySelector("span").textContent));
  if (pills[0] !== "Exact" || pills.includes("All") || pills.length !== 4) say("pills: " + pills.join(","));
  let seen = 0; const ids = new Set();
  for (const k of ["exact", "check", "unsure", "ignored"]) { await p.click(`.ro-f[data-v="${k}"]`); (await p.$$eval(".ro-li", e => e.map(x => x.dataset.id))).forEach(i => { seen++; ids.add(i); }); }
  if (ids.size !== 16 || seen !== 16) say("a line is unreachable or in two pills: " + ids.size + "/" + seen);
  // RS-93: unsure rows say only the reason; other reasons are short
  await p.click('.ro-f[data-v="unsure"]'); t = await p.textContent(".ro-list");
  if (/No recommendation|looks like it/.test(t) || !/Nothing matches/.test(t) || !/Text unclear/.test(t)) say("unsure row text: " + t.slice(0, 120));
  await p.click('.ro-f[data-v="ignored"]'); t = await p.textContent(".ro-list"); if (/It will not be added|takes \$3|a bag charge/.test(t) || !/Discount, not an item/.test(t)) say("ignored reasons not terse");
  // RS-101: with nothing chosen the list opens on Check when any line needs a check (this receipt has some); an explicit filter or a selected line wins
  { await p.goto(`${BASE}qu-a.html?${base}`); await p.waitForTimeout(300); const on = await p.getAttribute('.ro-f[aria-selected="true"]', "data-v"); if (on !== "check") say("RS-101: opened on " + on + ", wanted check");
    await p.goto(`${BASE}qu-a.html?${base}&filter=exact`); await p.waitForTimeout(300); if ((await p.getAttribute('.ro-f[aria-selected="true"]', "data-v")) !== "exact") say("RS-101: an explicit filter did not win");
    await p.goto(`${BASE}qu-a.html?${base}&sel=l3`); await p.waitForTimeout(300); if ((await p.getAttribute('.ro-f[aria-selected="true"]', "data-v")) !== "exact") say("RS-101: a selected exact line did not open its pill"); }
  // RS-98: Exact lines count toward Add by themselves; the long press (and Mark all reviewed, key A) only marks them reviewed
  await p.goto(`${BASE}qu-a.html?${base}&filter=exact`); await p.waitForTimeout(300);
  const addN = async () => +(/Add (\d+)/.exec(await p.textContent(".lv-add"))[1]);
  const before = await addN(); if (!(await p.$(".qu-hintrow"))) say("RS-98: no hint under Exact");
  const nEx = +(await p.textContent('.ro-f[data-v="exact"] b'));
  if (before !== nEx || nEx < 5) say(`RS-98: Add starts at ${before}, wanted every exact line (${nEx}) with no tap`);
  if (!/mark all \d+ reviewed/i.test(await p.textContent(".qu-hintrow"))) say("RS-98: hint does not say reviewed: " + await p.textContent(".qu-hintrow"));
  await p.click('.ro-f[data-v="exact"]'); if ((await addN()) !== before) say("RS-98: a short tap changed the count");
  const bb = await p.locator('.ro-f[data-v="exact"]').boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(250);
  if (!(await p.$(".ro-f.qu-hold"))) say("RS-98: no pressed state"); await p.waitForTimeout(600); await p.mouse.up(); await p.waitForTimeout(200);
  if ((await addN()) !== before) say(`RS-98: the long press changed the count (${before} to ${await addN()})`);
  if (!/marked reviewed/.test(await p.textContent(".toast")) || await p.$(".qu-hintrow")) say("RS-98: no toast or hint still showing");
  if ((await p.$$(".ro-li[data-tick]")).length !== nEx) say("RS-98: rows not marked reviewed");
  if (!/Reviewed/.test(await p.textContent(".ro-li[data-tick]"))) say("RS-98: reviewed rows do not say Reviewed");
  await p.click('.toast [data-act="excfundo"]'); await p.waitForTimeout(100); if ((await p.$$(".ro-li[data-tick]")).length !== 0 || (await addN()) !== before) say("RS-98: Undo did not clear the reviewed state");
  await p.click('[data-act="exall"]'); await p.waitForTimeout(100); if ((await p.$$(".ro-li[data-tick]")).length !== nEx || (await addN()) !== before) say("RS-98: Mark all reviewed button");
  // RS-100: a weight in the name is an amount (a pill), never a pack size
  await p.goto(`${BASE}qu-a.html?${base}&filter=check&sel=l13`); await p.waitForTimeout(300);
  if ((await p.inputValue("#qb-l13")) !== "400" || !/^g/.test(await p.textContent("#qb-l13u"))) say("RS-100: SMKD SLMN 400G is not the amount 400 g with a g pill");
  t = await p.textContent(".ro-li.on .ro-out"); if (!/Kept separate: 400 g cannot join 2 pack/.test(t)) say("RS-100: l13 outcome: " + t);
  const allText = await p.evaluate(async () => (await (await fetch("qu-data.js")).text()));
  if (/pack size|tin size|is the .{0,8}size|rd: "size"/.test(allText)) say("RS-100: the data still calls a weight a size");
  await p.goto(`${BASE}qu-a.html?${base}&filter=check`); await p.waitForTimeout(300);
  if (/pack size|tin size/i.test(await p.textContent("body"))) say("RS-100: a size note is still shown");
  // RS-96: the handle between the receipt and the list (phone: picture height; desktop: lane width), kept on this device, with a keyboard way
  const kind = w >= 1024 ? "lane" : "stage";
  await p.goto(`${BASE}qu-a.html?${base}`); await p.waitForTimeout(400);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
  if (!(await p.$(".qu-split"))) say("RS-96: no handle");
  const sz = () => p.evaluate(k => k === "lane" ? Math.round(document.querySelector(".panel[data-mode=lane]").getBoundingClientRect().width) : Math.round(document.querySelector(".lv-stage").getBoundingClientRect().height), kind);
  const s0 = await sz(); const hb = await p.locator(".qu-split").boundingBox();
  if (hb.width < 43 && hb.height < 43 && kind === "stage" && hb.height + 22 < 43) say("RS-96: handle too small to grab " + hb.width + "x" + hb.height);
  await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.mouse.down(); await p.mouse.move(hb.x + hb.width / 2 + (kind === "lane" ? -80 : 0), hb.y + hb.height / 2 + (kind === "lane" ? 0 : 90), { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(200);
  const s1 = await sz(); if (kind === "stage" ? s1 < s0 + 60 : s1 < s0 + 60) say(`RS-96: drag did not resize (${s0} to ${s1})`);
  await p.reload(); await p.waitForTimeout(500); const s2 = await sz(); if (Math.abs(s2 - s1) > 2) say(`RS-96: not remembered (${s1} then ${s2})`);
  await p.focus(".qu-split"); await p.keyboard.press(kind === "lane" ? "ArrowRight" : "ArrowUp"); await p.waitForTimeout(150); const s3 = await sz(); if (s3 >= s2) say(`RS-96: keyboard did not move the handle (${s2} to ${s3})`);
  await p.click('.ro-f[data-v="check"]'); if (!(await p.$(".ro-li"))) say("RS-96: pills stop working after a drag");
  if (kind === "stage") { const f1 = await p.evaluate(() => (document.querySelector(".qu-track") || {}).dataset?.id || ""); await p.evaluate(() => { document.querySelector(".ro-list").scrollTop = 1e5; }); await p.waitForTimeout(400); const f2 = await p.evaluate(() => (document.querySelector(".qu-track") || {}).dataset?.id || ""); if (!f1 || !f2 || f1 === f2) say("RS-96: photo no longer follows the list after a drag " + f1 + "/" + f2); }
  // RS-99: client-side only: the value is in localStorage, and no request ever carries it or is anything but a static GET
  const stored = await p.evaluate(() => Object.keys(localStorage).filter(k => /split/.test(k)).map(k => k + "=" + localStorage.getItem(k)));
  if (!stored.length) say("RS-99: the handle position is not in localStorage");
  const reqs = []; p.on("request", r => reqs.push(r.method() + " " + r.url()));
  await p.focus(".qu-split"); await p.keyboard.press(kind === "lane" ? "ArrowRight" : "ArrowUp"); await p.waitForTimeout(150);
  await p.reload(); await p.waitForTimeout(400); await p.goto(`${BASE}qu-a.html?${base}&phase=end&filter=check`); await p.waitForTimeout(300);
  const bad99 = reqs.filter(r => !r.startsWith("GET ") || /split|stage|lane/i.test(r.replace(/qu-a\.html.*/, "")));
  if (bad99.length) say("RS-99: a request that is not a static GET: " + bad99.join(" | "));
  if (/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(await (await fetch(`${BASE}qu.js`)).text())) say("RS-99: qu.js talks to a server");
  await p.evaluate(() => localStorage.clear());
  // H2: a remembered handle value is clamped on read and on resize/rotation; the list is never left 1 px high, a non-number is ignored
  { const listH = () => p.evaluate(() => Math.round(document.querySelector(".ro-list").getBoundingClientRect().height));
    const key = kind === "lane" ? "rs754.split.lane" : "rs754.split.stage";
    for (const bigV of ["900", "99999", "500", "abc", "-40", "0"]) {
      await p.evaluate(([k, v]) => localStorage.setItem(k, v), [key, bigV]); await p.reload(); await p.waitForTimeout(500);
      if (kind === "stage") { const lh = await listH(); if (lh < (h >= 600 ? 110 : 40)) say(`H2: saved ${bigV} leaves the list ${lh} px high at ${w}x${h}`); }
      else { const lw = await p.evaluate(() => Math.round(document.querySelector(".panel[data-mode=lane]").getBoundingClientRect().width)); if (lw < 320 || lw > 561) say(`H2: saved ${bigV} gives a ${lw}px lane`); }
      if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) say("H2: sideways scroll with saved " + bigV);
    }
    if (kind === "stage") {   // rotate with a big value kept: portrait then landscape then back
      await p.evaluate(([k, v]) => localStorage.setItem(k, v), [key, "500"]); await p.reload(); await p.waitForTimeout(400);
      await p.setViewportSize({ width: h, height: w }); await p.waitForTimeout(500); const lh2 = await listH(); if (lh2 < (w >= 600 ? 110 : 40)) say(`H2: after rotating to ${h}x${w} the list is ${lh2} px high`);
      await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500); const lh3 = await listH(); if (lh3 < (h >= 600 ? 110 : 40)) say(`H2: after rotating back the list is ${lh3} px high`);
      if (await p.evaluate(() => localStorage.getItem("rs754.split.stage")) !== "500") say("H2: the stored value was overwritten by the clamp");
    }
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300); }
  // H13: the resting handle bar reaches 3:1 against the page (non-text contrast)
  for (const th of ["kitchie", "kitchie-day"]) { await p.evaluate(t => localStorage.setItem("theme", t), th); await p.goto(`${BASE}qu-a.html?${base}`); await p.waitForTimeout(400);
    const cr = await p.evaluate(() => {
      const rgb = c => (c.match(/[\d.]+/g) || []).map(Number), lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, L = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
      const h = document.querySelector(".qu-split"); if (!h) return null; const i = h.querySelector("i"), cs = getComputedStyle(i), op = +cs.opacity, fg = rgb(cs.backgroundColor);
      let bgEl = h, bg = [0, 0, 0, 0]; while (bgEl) { const c = rgb(getComputedStyle(bgEl).backgroundColor); if (c.length >= 3 && (c[3] === undefined || c[3] > 0.99)) { bg = c; break; } bgEl = bgEl.parentElement; }
      const mix = fg.slice(0, 3).map((v, k) => v * op + bg[k] * (1 - op)), a = L(mix), b2 = L(bg); return (Math.max(a, b2) + .05) / (Math.min(a, b2) + .05); });
    if (cr === null) say("H13: no handle to measure in " + th); else if (cr < 3) say("H13: handle contrast " + cr.toFixed(2) + ":1 in " + th); }
  await p.evaluate(() => localStorage.clear());
  // RS-95: the whole receipt, full size, with boxes; tap a box for its line; a way back
  await p.goto(`${BASE}qu-a.html?${base}&filter=exact`); await p.waitForTimeout(400);
  await p.click(".qu-expand"); await p.waitForTimeout(200);
  if (!(await p.$(".qu-viewer .lv-ln"))) say("RS-95: the whole receipt did not open with its boxes");
  const nb = await p.$$eval(".qu-viewer .lv-ln[data-id]", e => e.length); if (nb !== 16) say("RS-95: boxes drawn " + nb + ", wanted 16");
  const vp = await p.evaluate(() => { const v = document.querySelector(".qu-vpaper"); return v.scrollHeight >= document.querySelector(".qu-vpaper").getBoundingClientRect().height; }); 
  await p.click('.qu-viewer .lv-ln[data-id="l3"]'); t = await p.textContent(".qu-vcall"); if (!/Line 3 of 16/.test(t) || !/MILK 2L/.test(t)) say("RS-95: a tapped box does not name its line: " + t);
  await p.keyboard.press("Escape"); await p.waitForTimeout(100); if (await p.$(".qu-viewer")) say("RS-95: Escape does not go back");
  await p.click(".lv-stage", { position: { x: 30, y: 8 } }); await p.waitForTimeout(150); if (!(await p.$(".qu-viewer"))) say("RS-95: tapping the picture does not open it");
  await p.click('.qu-viewer .lv-ln[data-id]:nth-of-type(8)'); await p.click('[data-act="quclosev"]'); if (await p.$(".qu-viewer")) say("RS-95: Back does not close");
  // RS-97: the bottom row is tight to the bottom edge (phone)
  if (w < 600) { const gap = await p.evaluate(() => { const bs = [...document.querySelectorAll(".rl-actions button")].map(e => e.getBoundingClientRect().bottom); return innerHeight - Math.max(...bs); }); if (gap > 8) say("RS-97: gap under the bottom row " + Math.round(gap) + "px"); const css = await (await fetch(`${BASE}qu.css`)).text(); if (!/safe-area-inset-bottom/.test(css.split("RS-97")[1] || "")) say("RS-97: safe-area inset not kept"); }
  // B is kept: its sheet saves
  await p.goto(`${BASE}qu-b.html?${base}&filter=exact&qs=l3`); await p.waitForTimeout(500);
  const f = (await p.$$("input[data-qu]")).pop(); await f.fill("3"); await f.press("Enter"); await p.waitForTimeout(100);
  t = await p.textContent('.ro-li[data-id="l3"] .ro-out'); if (!/1 L to 4 L/.test(t)) say("B save: " + t);
  if (errs.length) { bad++; console.log(errs); }
  await p.close();
}
await b.close(); console.log(`${n} states checked, ${bad} problems`); process.exit(bad ? 1 : 0);
