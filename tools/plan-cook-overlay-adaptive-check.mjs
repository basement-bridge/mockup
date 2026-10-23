// Behaviour check for option C of the Plan it / Make it banner overlay: ADAPTIVE contrast (Kitchie #830 / #898), headless Chromium.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-cook-overlay-adaptive-check.mjs     (BASE=... to point elsewhere; SHOTS=1 writes screenshots into plan-cook-overlay/c/adaptive/)
// EXE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome in the agent sandbox. Needs playwright or playwright-core on the module path.
import { createRequire } from "module"; import http from "http"; import fs from "fs";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const ORIGIN = process.env.BASE || "http://localhost:8123";
const FR = ORIGIN + "/fragments/recipe-detail-desktop/";
const C = FR + "plan-cook-overlay/c/index.html";
const DIR = new URL("../fragments/recipe-detail-desktop/plan-cook-overlay/c/adaptive/", import.meta.url).pathname;
const SHOTS = !!process.env.SHOTS;
let fails = 0, total = 0; const log = [];
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: process.env.EXE || "/opt/pw-browsers/chromium" });
const errs = [];
// a second origin that sends no CORS headers: an image from it taints the canvas
const other = http.createServer((q, s) => { s.writeHead(200, { "content-type": "image/png" }); s.end(fs.readFileSync(new URL("../fragments/recipe-detail-desktop/plan-cook-overlay/test-banners/very-dark.png", import.meta.url))); }).listen(8124);
async function open(ctx, url) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push("pageerror " + e.message + " @" + url)); p.on("console", m => { if (m.type() === "error" && !/favicon/.test(m.text() + m.location().url)) errs.push(m.text() + " @" + url); }); p.on("response", r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push("HTTP " + r.status() + " " + r.url()); }); await p.goto(url); return p; }
const settled = async (p, ms = 500) => { await p.waitForFunction(() => { const h = document.getElementById("hero"); return h && h.dataset.ovAdapt && h.dataset.ovWhy !== "not-loaded"; }, null, { timeout: 5000 }).catch(() => {}); await sleep(ms); };
const noOverflow = p => p.evaluate(() => { const d = document.documentElement; return { x: d.scrollWidth - d.clientWidth, y: d.scrollHeight - d.clientHeight }; });

// ground truth: hide everything that sits on the banner, screenshot the region behind the stack, decode in the page, then judge the REAL rendered buttons against it
async function groundTruth(p) {
  const g = await p.evaluate(() => { const r = document.querySelector(".pc-go").getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), w: r.width + 16, h: r.height + 16 }; });
  await p.addStyleTag({ content: ".pc,.ban-scrim,.ban-adapt,.ban-zoom,.ban-open{visibility:hidden!important}" , }).then(h => h.evaluate(n => n.id = "gt-hide"));
  const buf = await p.screenshot({ clip: { x: g.x, y: g.y, width: g.w, height: g.h } });
  await p.evaluate(() => document.getElementById("gt-hide").remove());
  return p.evaluate(async b64 => {
    const lin = c => { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
    const L = (r, g, b) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
    const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const im = new Image(); im.src = "data:image/png;base64," + b64; await im.decode();
    const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data;
    const hero = document.getElementById("hero"), P = getComputedStyle, btns = [...document.querySelectorAll(".pc-go .rb-btn")];
    const ad = [...document.querySelectorAll(".ban-adapt i")].map(i => ({ k: i.className, o: +P(i).opacity }));
    const dark = ad.find(a => a.k === "d").o, light = ad.find(a => a.k === "l").o;
    const rgb = s => s.match(/[\d.]+/g).map(Number);
    const sc = btns.map(b => { const s = P(b); return { text: cr(L(...rgb(s.color)), L(...rgb(s.backgroundColor))), edge: rgb(s.borderTopColor), edgeW: parseFloat(s.borderTopWidth), bg: s.backgroundColor, fg: s.color }; });
    const px = []; for (let i = 0; i < d.length; i += 4) { // blend the real scrim over the raw pixel
      let r = d[i], g = d[i + 1], bl = d[i + 2]; r = r * (1 - dark) + 0 * dark; g = g * (1 - dark); bl = bl * (1 - dark); r = r * (1 - light) + 255 * light; g = g * (1 - light) + 255 * light; bl = bl * (1 - light) + 255 * light; px.push(L(r, g, bl)); }
    px.sort((a, b) => a - b); const edgeL = sc.map(s => L(...s.edge));
    const worst = Math.min(...px.map(v => Math.min(...edgeL.map(e => cr(v, e))))), p90 = px[Math.floor(px.length * .9)], p10 = px[Math.floor(px.length * .1)];
    const e90 = Math.min(...edgeL.map(e => Math.min(cr(p90, e), cr(p10, e)))); // the two tails at the 10/90 percentile
    const mean = px.length ? px.reduce((a, b) => a + b, 0) / px.length : 0;
    return { text: Math.min(...sc.map(s => s.text)), edgeP: e90, edgeWorst: worst, meanRaw: mean, tone: hero.dataset.ovTone, adapt: hero.dataset.ovAdapt, dark, light, claimed: hero.dataset.ovEdge, lum: hero.dataset.ovLum, level: hero.dataset.ovLevel };
  }, buf.toString("base64"));
}

const BANNERS = { "very-light": "on-light", "very-dark": "on-dark", "mid-busy": null, "split-light-dark": "on-dark", "split-dark-light": "on-light" };
const SIZES = [[1280, 720], [1440, 900], [1920, 1080]];
for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const tag = w + "x" + h;
  for (const [b, want] of Object.entries(BANNERS)) {
    const p = await open(ctx, C + "?banner=" + b + "&theme=dark"); await settled(p);
    const o = await noOverflow(p); ok(tag + " " + b + ": no page scroll", o.x <= 0 && o.y <= 0, o);
    const lay = await p.evaluate(() => { const g = document.querySelector(".pc-go").getBoundingClientRect(), ph = document.querySelector(".hphoto").getBoundingClientRect(), z = document.querySelector(".ban-zoom").getBoundingClientRect(), bt = [...document.querySelectorAll(".pc-go .rb-btn")].map(x => x.getBoundingClientRect()); return { inside: g.left >= ph.left && g.right <= ph.right && g.top >= ph.top && g.bottom <= ph.bottom, bannerH: Math.round(ph.height), col: getComputedStyle(document.querySelector(".pc-go")).flexDirection, zoomClear: z.right <= g.left || z.top >= g.bottom || z.left >= g.right, stackedH: bt[1].top >= bt[0].bottom - 0.5, labels: bt.length && [...document.querySelectorAll(".pc-go .rb-btn")].map(x => x.textContent.trim()) }; });
    ok(tag + " " + b + ": stack inside the banner, clear of the magnifier", lay.inside && lay.zoomClear, lay);
    ok(tag + " " + b + ": " + (lay.bannerH < 112 ? "row under 112px" : "column from 112px"), lay.bannerH < 112 ? lay.col === "row" : lay.col === "column", lay);
    ok(tag + " " + b + ": labels are Plan it / Planned Tue and Make it", /^(Plan it|Planned)/.test(lay.labels[0]) && lay.labels[1] === "Make it", lay.labels);
    const t = await groundTruth(p);
    ok(tag + " " + b + ": adaptive ran (sampled)", t.adapt === "sampled", t);
    if (want) ok(tag + " " + b + ": style is " + want, t.tone === want, t);
    ok(tag + " " + b + ": label text >= 4.5:1", t.text >= 4.5, t);
    ok(tag + " " + b + ": button edge >= 3:1 against the 10th/90th percentile pixel behind it", t.edgeP >= 3, t);
    if (b === "mid-busy") ok(tag + " mid-busy: subtle scrim is on (mid-tone, high variance)", t.dark + t.light >= .29, t);
    if (b.startsWith("very")) ok(tag + " " + b + ": no scrim needed on a flat extreme", t.dark + t.light === 0, t);
    log.push([tag, b, t.tone, "lum " + t.lum + " (rendered, after scrim " + t.meanRaw.toFixed(3) + ")", "scrim " + Math.round((t.dark + t.light) * 100) + "%", "text " + t.text.toFixed(1), "edge p10/90 " + t.edgeP.toFixed(2), "worst px " + t.edgeWorst.toFixed(2)].join(" | "));
    if (SHOTS && ["very-light", "very-dark", "mid-busy", "split-light-dark"].includes(b)) await p.screenshot({ path: DIR + "adaptive-" + b + "-" + tag + "-dark.png" });
    await p.close();
  }
  await ctx.close();
}

// ---- the same, light theme, two banners
{ const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const b of ["very-light", "very-dark"]) { const p = await open(ctx, C + "?banner=" + b + "&theme=light"); await settled(p); const t = await groundTruth(p); ok("light theme " + b + ": text and edge", t.text >= 4.5 && t.edgeP >= 3 && t.adapt === "sampled", t); if (SHOTS) await p.screenshot({ path: DIR + "adaptive-" + b + "-1440x900-light.png" }); await p.close(); }
  await ctx.close(); }

// ---- hysteresis, re-sample on src change, crop mapping, resize, tainted canvas, no banner, reduced motion
{ const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await open(ctx, C + "?banner=very-dark&theme=dark"); await settled(p);
  const grey = L => Math.round(255 * (Math.pow(L, 1 / 2.4) * 1.055 - .055));
  const setGrey = async L => { await p.evaluate(v => { const c = document.createElement("canvas"); c.width = 160; c.height = 56; const x = c.getContext("2d"); x.fillStyle = "rgb(" + v + "," + v + "," + v + ")"; x.fillRect(0, 0, 160, 56); document.querySelector(".hphoto img").src = c.toDataURL(); }, grey(L)); await sleep(120); return p.evaluate(() => document.getElementById("hero").dataset.ovTone + "|" + document.getElementById("hero").dataset.ovLum); };
  const seq = []; for (const L of [.10, .14, .17, .20, .23, .26, .30, .26, .23, .20, .17, .16, .14, .10]) { const r = await setGrey(L); seq.push(L + ":" + r.split("|")[0]); }
  const flips = seq.filter((s, i) => i && s.split(":")[1] !== seq[i - 1].split(":")[1]);
  ok("hysteresis: exactly two flips over a up-and-down ramp", flips.length === 2, seq);
  ok("hysteresis: holds on-dark up to 0.23 and flips to on-light at 0.26", seq.slice(0, 5).every(s => s.endsWith("on-dark")) && seq[5].endsWith("on-light"), seq);
  ok("hysteresis: holds on-light down to 0.16 and flips back at 0.14", seq.slice(6, 12).every(s => s.endsWith("on-light")) && seq[12].endsWith("on-dark") && seq[13].endsWith("on-dark"), seq);
  log.push("hysteresis ramp: " + seq.join(" "));
  // src change: light then dark
  await p.evaluate(() => { document.querySelector(".hphoto img").src = "../test-banners/very-light.png"; }); await settled(p, 400);
  ok("src change re-samples (very-light -> on-light)", await p.evaluate(() => document.getElementById("hero").dataset.ovTone) === "on-light");
  await p.evaluate(() => { document.querySelector(".hphoto img").src = "../test-banners/very-dark.png"; }); await settled(p, 400);
  ok("src change re-samples (very-dark -> on-dark)", await p.evaluate(() => document.getElementById("hero").dataset.ovTone) === "on-dark");
  // resize: banner height changes with the viewport; style stays right and the layout switches column/row
  for (const [w, h] of [[1280, 720], [1920, 1080], [1440, 900]]) { await p.setViewportSize({ width: w, height: h }); await sleep(450); const t = await groundTruth(p); ok("resize to " + w + "x" + h + ": still on-dark and legible", t.tone === "on-dark" && t.text >= 4.5 && t.edgeP >= 3, t); }
  // label change (Planned -> Plan it) keeps working: click Plan it, the stub toasts; just check the stack is still sampled
  ok("sampled flag set", (await p.evaluate(() => document.getElementById("hero").dataset.ovAdapt)) === "sampled");
  // transitions
  const tr = await p.evaluate(() => getComputedStyle(document.querySelector(".pc-go .rb-btn")).transitionDuration);
  ok("transition is on (.28s)", /0\.28s/.test(tr), tr);
  await p.close();
  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const pr = await open(rm, C + "?banner=very-dark&theme=dark"); await settled(pr);
  const trr = await pr.evaluate(() => ({ b: getComputedStyle(document.querySelector(".pc-go .rb-btn")).transitionDuration, s: getComputedStyle(document.querySelector(".ban-adapt i.d")).transitionDuration, f: getComputedStyle(document.querySelector(".ban-scrim")).transitionDuration }));
  ok("prefers-reduced-motion: no transitions", /^0s/.test(trr.b) && /^0s/.test(trr.s) && /^0s/.test(trr.f), trr); await pr.close(); await rm.close();
  // tainted canvas -> safe fallback with the fixed scrim
  const pt = await open(ctx, C + "?banner=very-dark&theme=dark"); await settled(pt);
  await pt.evaluate(() => { document.querySelector(".hphoto img").src = "http://localhost:8124/x.png"; }); await sleep(900);
  const tn = await pt.evaluate(() => { const h = document.getElementById("hero"), b = document.querySelector(".pc-go .rb-btn.pri"); return { adapt: h.dataset.ovAdapt, why: h.dataset.ovWhy, scrim: +getComputedStyle(document.querySelector(".ban-scrim")).opacity, bg: getComputedStyle(b).backgroundColor, accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(), vis: document.querySelector(".ban-scrim").getBoundingClientRect().width > 0 }; });
  ok("tainted canvas: falls back, fixed scrim visible, theme buttons", tn.adapt === "fallback" && tn.why === "tainted" && tn.scrim === 1 && tn.bg === "rgb(242, 184, 75)", tn);
  log.push("tainted: " + JSON.stringify(tn));
  await pt.close();
  // ?adaptive=off
  const po = await open(ctx, C + "?banner=very-light&theme=dark&adaptive=off"); await sleep(600);
  ok("adaptive=off keeps the fixed look", (await po.evaluate(() => document.getElementById("hero").dataset.ovAdapt + "/" + document.getElementById("hero").dataset.ovWhy)) === "fallback/off"); await po.close();
  // no banner (owner, 24 Oct 2026, RD-NB1 to RD-NB4): Plan it / Make it SWAP ROWS with the socials; nothing overlaid, adaptive idle. Both themes, both sizes, short and long recipes.
  for (const th of ["dark", "light"]) for (const [vw, vh] of [[1440, 900], [1280, 720]]) for (const r of ["typical", "long"]) {
    const cx = await browser.newContext({ viewport: { width: vw, height: vh } }), t = "no banner " + th + " " + vw + "x" + vh + " " + r + ": ";
    const pn = await open(cx, C + "?banner=none&theme=" + th + "&r=" + r); await sleep(500);
    const nb = await pn.evaluate(() => { const R = e => e ? e.getBoundingClientRect() : null, q = s => document.querySelector(s), hgo = q(".hgo"), hi = q(".hicons"), r1 = q(".hr1"), r2 = q(".hr2"), h1 = q("h1"), sv = q(".svcta"), mo = q("[data-more]");
      const bt = [...hgo.querySelectorAll(".rb-btn")].map(x => R(x)), all = [...document.querySelectorAll("#hero button, #hero a")], ix = e => all.indexOf(e);
      return { pc: document.querySelectorAll("[data-pc]").length, goRow1: r1.contains(hgo), iconsRow2: r2.contains(hi), goNotRow2: !r2.contains(hgo), iconsNotRow1: !r1.contains(hi), swap: document.getElementById("hero").classList.contains("ov-swap"),
        adapt: document.getElementById("hero").dataset.ovAdapt || null, labels: [...hgo.querySelectorAll(".rb-btn")].map(x => x.textContent.trim()), h: bt.map(x => Math.round(x.height)),
        goAbove: R(hgo).bottom <= R(hi).top + 1, goRight: Math.abs(R(hgo).right - R(r1).right) <= 2, iconsRight: Math.abs(R(hi).right - R(r2).right) <= 2, titleLeftOfGo: R(h1).right <= R(hgo).left + 1, servesLeftOfIcons: R(sv).right <= R(hi).left + 1,
        sameRow: Math.abs(R(hgo).top - R(h1).top) < 40, tabOrder: ix(hgo.querySelector("[data-plan]")) < ix(sv) && ix(sv) < ix(q("[data-star]")) && ix(q("[data-cook]")) < ix(sv), moreInside: R(mo).right <= R(q("#hero")).right,
        grp: hgo.getAttribute("aria-label"), hero: Math.round(R(q("#hero")).height) }; });
    ok(t + "Plan it, Make it are in row one at the right, socials in row two at the right, nothing overlaid, adaptive idle", nb.pc === 0 && nb.goRow1 && nb.iconsRow2 && nb.goNotRow2 && nb.iconsNotRow1 && nb.swap && nb.adapt === null && nb.labels[0].startsWith("Plan") && nb.labels[1] === "Make it", nb);
    ok(t + "the two action buttons are on top (above the socials), right aligned, beside the title; Serves is left of the socials", nb.goAbove && nb.goRight && nb.iconsRight && nb.titleLeftOfGo && nb.servesLeftOfIcons && nb.sameRow, nb);
    ok(t + "buttons are 44px tall, keyboard order follows the new visual order (Plan it, Make it, then Serves, then the socials), group labelled", nb.h.every(x => x >= 44) && nb.tabOrder && nb.grp === "Plan it or make it" && nb.moreInside, nb);
    ok(t + "the hero keeps two rows (no taller than 126px)", nb.hero <= 126, nb.hero);
    const on = await noOverflow(pn); ok(t + "no page scroll", on.x <= 0 && on.y <= 0, on);
    if (SHOTS && r === "typical") await pn.screenshot({ path: DIR + "nobanner-swap-" + vw + "x" + vh + "-" + th + ".png" });
    if (r === "typical") { await pn.locator("[data-plan]").click(); await sleep(150); ok(t + "Plan it still works from row one (its toast shows)", (await pn.locator("#toast:not([hidden])").count()) === 1); }
    await cx.close(); }
  { const pb = await open(ctx, C + "?theme=dark"); await sleep(600); ok("with a banner the buttons stay on the banner (no swap): Plan it / Make it overlaid, socials in row one", await pb.evaluate(() => !document.getElementById("hero").classList.contains("ov-swap") && document.querySelectorAll("[data-pc]").length === 1 && document.querySelector(".hr1").contains(document.querySelector(".hicons"))));
    await pb.close(); }
  await ctx.close(); }

// ---- the real banners (typical/short/long) through C at the three sizes, plus the other fragments: label and overflow
for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const tag = w + "x" + h;
  for (const r of ["typical", "short", "long"]) for (const th of ["dark", "light"]) {
    const p = await open(ctx, C + "?r=" + r + "&theme=" + th); await settled(p); const o = await noOverflow(p); const t = await groundTruth(p);
    ok(tag + " C real " + r + " " + th + ": no page scroll, legible", o.x <= 0 && o.y <= 0 && t.text >= 4.5 && t.edgeP >= 3, { o, t });
    if (SHOTS && th === "dark" && r === "typical") await p.screenshot({ path: DIR + "../typical-" + tag + "-dark.png" });
    await p.close(); }
  for (const [name, url] of [["A", FR + "plan-cook-overlay/a/index.html"], ["B", FR + "plan-cook-overlay/b/index.html"], ["recommended", FR + "recommended/index.html"], ["inline-edit", FR + "inline-edit/index.html"], ["inline-edit edit", FR + "inline-edit/index.html?edit=1&choose=fix"]]) {
    const p = await open(ctx, url + (url.includes("?") ? "&" : "?") + "theme=dark"); await sleep(500); const o = await noOverflow(p);
    const lab = await p.evaluate(() => [...document.querySelectorAll("[data-cook],[data-act=cook]")].map(x => x.textContent.trim()));
    ok(tag + " " + name + ": no page scroll", o.x <= 0 && o.y <= 0, o); ok(tag + " " + name + ": button reads Make it", lab.length >= 1 && lab.every(l => l === "Make it"), lab); await p.close(); }
  for (const [name, url] of [["hub", FR + "index.html"], ["overlay index", FR + "plan-cook-overlay/index.html"], ["adaptive-test", FR + "plan-cook-overlay/adaptive-test.html"]]) {
    const p = await open(ctx, url + "?theme=dark"); await sleep(name === "adaptive-test" ? 1800 : 400); const o = await noOverflow(p); ok(tag + " " + name + ": no horizontal scroll", o.x <= 0, o);
    if (SHOTS && name === "adaptive-test" && w === 1440) await p.screenshot({ path: DIR + "adaptive-test-1440x900.png", fullPage: true });
    if (name === "adaptive-test") { const rd = await p.evaluate(() => [...document.querySelectorAll("[data-rd]")].map(x => x.textContent)); ok(tag + " adaptive-test: every readout filled, adaptive ones pass", rd.length === 10 && rd.every(x => x.length > 5) && rd.filter((x, i) => i % 2).every(x => /sampled|on-(dark|light)/.test(x)), rd); }
    await p.close(); }
  await ctx.close();
}
await browser.close(); other.close();
console.log(log.join("\n"));
console.log("console errors (favicon ignored):", errs.length ? errs : "none");
ok("no console errors", errs.length === 0, errs);
console.log(fails ? "\n" + fails + " of " + total + " checks FAILED" : "\nall " + total + " checks passed");
process.exit(fails ? 1 : 0);
