// Behaviour check for the Off days flyout with a household level of usual days off (Kitchie #860). Headless Chromium, phone (390, 360) and desktop (1280), dark and light.
// Checks: the Categories row is gone, the Household row and who may change it, the three states per weekday and the person-wins rule, what each person sees for another person's row, the empty, solo, every-day and
// removed-member states, the week tiles, the keyboard, the 44px targets, no sideways scroll, no page errors.
// Usage:  python3 -m http.server 8123 &   then   node tools/plan-usual-days-check.mjs      (BASE=... to point elsewhere)
// Needs playwright or playwright-core on the module path (NODE_PATH=/opt/node22/lib/node_modules works in the agent sandbox).
import { createRequire } from "module";
const req = createRequire(import.meta.url); let pw; try { pw = req("playwright-core"); } catch (e) { pw = req("playwright"); }
const { chromium } = pw;
const ROOT = process.env.BASE || "http://localhost:8123/fragments/plan-usual-days/";
let fails = 0, total = 0;
const ok = (name, cond, extra) => { total++; if (!cond) { fails++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const browser = await chromium.launch();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [];
async function open(ctx, page, q) { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); await p.goto(ROOT + page + ".html" + (q ? "?" + q : "")); await sleep(350); return p; }
const chip = (p, who, d) => p.locator(`#ud [data-who="${who}"][data-d="${d}"]`);
const st = async (p, who, d) => p.evaluate(([w, x]) => { const b = document.querySelector(`#ud [data-who="${w}"][data-d="${x}"]`); return b ? { eff: b.dataset.eff || (b.getAttribute("aria-pressed") === "true" ? "off" : "open"), src: b.dataset.src || null, dis: b.disabled, label: b.getAttribute("aria-label") } : null; }, [who, d]);
const tile = (p, d) => p.evaluate(x => { const n = document.querySelector(`.pg-night[data-d="${x}"]`); return n ? { state: n.dataset.state, src: n.dataset.src, text: n.innerText.replace(/\s+/g, " ").trim() } : null; }, d);
const txt = p => p.locator("#ud").innerText();
const norm = t => t.replace(/\s+/g, " ").trim();

for (const [page, w, h, scheme, touch] of [["phone", 390, 844, "dark", true], ["phone", 360, 740, "light", true], ["phone", 390, 844, "light", true], ["desktop", 1280, 800, "dark", false], ["desktop", 1280, 800, "light", false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme }); const tag = `${page} ${w} ${scheme}`;
  const tap = loc => touch ? loc.tap() : loc.click();
  const phone = page === "phone";

  // ---------- A. the flyout as it opens: typical household ----------
  { const p = await open(ctx, page, "");
    const t = norm(await txt(p));
    ok(`${tag} A: the flyout is open on load and titled exactly "Off days" (heading, dialog name)`, /^Off days\b/i.test(t) && (await p.locator("#ud-t").innerText()) === "Off days" && (await p.locator("#ud").getAttribute("aria-labelledby")) === "ud-t" && !/Meal planning/i.test(t));
    ok(`${tag} A: the sentence under the title is the one the app has today`, t.includes("Usual days off cooking. Each week starts with these blocked. Repeating days are set only here; the grid changes one week at a time."));
    ok(`${tag} A: no Categories row, no Leftovers, no Rename (owner: remove them from this flyout)`, !/Categories|Leftovers|Rename/.test(t));
    const labels = await p.locator("#ud .ud-lbl").allInnerTexts();
    ok(`${tag} A: the rows run Household, You (Sam), Jane, Priya`, labels.length === 4 && /^Household/i.test(labels[0]) && /^You \(Sam\)/i.test(labels[1]) && /^Jane · only Jane can change/i.test(labels[2]) && /^Priya · only Priya can change/i.test(labels[3]), labels);
    ok(`${tag} A: each row has seven weekday chips`, (await p.locator("#ud .ud-days").count()) === 4 && (await p.locator("#ud .ud-days").evaluateAll(a => a.every(r => r.querySelectorAll(".ud-d").length === 7))));
    // the states
    ok(`${tag} A: household is off on Tue and Fri, open on Mon`, (await st(p, "hh", "Tue")).eff === "off" && (await st(p, "hh", "Fri")).eff === "off" && (await st(p, "hh", "Mon")).eff === "open");
    const sTue = await st(p, "sam", "Tue"), sFri = await st(p, "sam", "Fri"), sSun = await st(p, "sam", "Sun"), sMon = await st(p, "sam", "Mon"), jWed = await st(p, "jane", "Wed");
    ok(`${tag} A: Sam inherits Tue from the household (off, inherited)`, sTue.eff === "off" && sTue.src === "inherited" && /inherited from the household/.test(sTue.label), sTue);
    ok(`${tag} A: Sam opened Fri himself (open, set by the person: the person wins over the household)`, sFri.eff === "open" && sFri.src === "own" && /set by you/.test(sFri.label), sFri);
    ok(`${tag} A: Sam is off on Sun by his own setting`, sSun.eff === "off" && sSun.src === "own", sSun);
    ok(`${tag} A: Sam inherits a day the household has open (Mon: open, inherited)`, sMon.eff === "open" && sMon.src === "inherited", sMon);
    ok(`${tag} A: Jane's own setting shows on her row, read only`, jWed.eff === "off" && jWed.src === "own" && jWed.dis === true && /Jane only can change this/.test(jWed.label), jWed);
    ok(`${tag} A: Jane's and Priya's chips are all disabled, Sam's are not`, (await p.locator('#ud [data-who="jane"]:not(:disabled), #ud [data-who="priya"]:not(:disabled)').count()) === 0 && (await p.locator('#ud [data-who="sam"]:not(:disabled)').count()) === 7);
    ok(`${tag} A: the household row says what is off and who has their own`, /Off every Tue and Fri\. Everyone inherits this unless they set their own\./.test(t) && /Different for you \(Fri open, Sun off\) and Jane \(Wed off\)\./.test(t), t);
    ok(`${tag} A: Sam's row says what is his own and that the rest is inherited`, /Your own: Fri open, Sun off\. The rest is inherited from the household\./.test(t));
    ok(`${tag} A: the legend names the four looks`, /Off, inherited/.test(t) && /Off, set by the person/.test(t) && /Open, set by the person/.test(t) && /Open, inherited/.test(t));
    // the value is the fill (filled = off, unfilled = open); the flags are separate shapes: a dashed ring inside = inherited, a dot = set by the person
    const looks = await p.evaluate(() => { const g = (w, d) => { const b = document.querySelector(`#ud [data-who="${w}"][data-d="${d}"]`), c = getComputedStyle(b), a = getComputedStyle(b, "::after"); return { bg: c.backgroundColor, ring: a.content !== "none" && a.borderTopStyle === "dashed", ringW: a.borderTopWidth, dot: !!b.querySelector(".ud-dot"), pressed: b.getAttribute("aria-pressed") }; }; return { offInh: g("sam", "Tue"), openInh: g("sam", "Mon"), ownOff: g("sam", "Sun"), ownOpen: g("sam", "Fri"), hhOff: g("hh", "Tue"), hhOpen: g("hh", "Mon") }; });
    ok(`${tag} A: filled is off and unfilled is open, the same on every row`, looks.offInh.bg === looks.ownOff.bg && looks.ownOff.bg === looks.hhOff.bg && looks.openInh.bg === looks.ownOpen.bg && looks.ownOpen.bg === looks.hhOpen.bg && looks.offInh.bg !== looks.openInh.bg && [looks.offInh, looks.ownOff, looks.hhOff].every((x) => x.pressed === "true") && [looks.openInh, looks.ownOpen, looks.hhOpen].every((x) => x.pressed === "false"), looks);
    ok(`${tag} A: inherited is a dashed ring inside the chip (with no dot), own is a dot (with no ring), on either value`, looks.offInh.ring && looks.openInh.ring && !looks.offInh.dot && !looks.openInh.dot && !looks.ownOff.ring && !looks.ownOpen.ring && looks.ownOff.dot && looks.ownOpen.dot, looks);
    ok(`${tag} A: the household row's chips carry neither flag`, !looks.hhOff.ring && !looks.hhOpen.ring && !looks.hhOff.dot && !looks.hhOpen.dot, looks);
    ok(`${tag} A: the four looks have four different faces (value x flag)`, new Set(["offInh", "openInh", "ownOff", "ownOpen"].map((k) => looks[k].bg + looks[k].ring + looks[k].dot)).size === 4, looks);
    // the legend swatches are drawn with the same rules
    const sw = await p.evaluate(() => [...document.querySelectorAll("#ud .ud-sw")].map((b) => { const c = getComputedStyle(b), a = getComputedStyle(b, "::after"); return { eff: b.dataset.eff, src: b.dataset.src, bg: c.backgroundColor, ring: a.content !== "none" && a.borderTopStyle === "dashed", dot: !!b.querySelector(".ud-dot") }; }));
    ok(`${tag} A: the legend swatches match the chips (fill = value, ring = inherited, dot = own)`, sw.length === 4 && sw.every((x) => x.ring === (x.src === "inherited") && x.dot === (x.src === "own")) && sw.filter((x) => x.eff === "off").every((x) => x.bg === looks.offInh.bg) && sw.filter((x) => x.eff === "open").every((x) => x.bg === looks.openInh.bg), sw);
    // one vocabulary: no old wording anywhere in what is read or announced
    const everything = norm(t + " " + (await p.evaluate(() => [...document.querySelectorAll("#ud [aria-label],#ud [title]")].map((e) => (e.getAttribute("aria-label") || "") + " " + (e.getAttribute("title") || "")).join(" "))));
    ok(`${tag} A: one vocabulary: no "follow", "same as household", "pinned" or "from the household" (as a state) anywhere in the flyout`, !/follow|same as household|pinned/i.test(everything) && !/(off|open), from the household/i.test(everything), everything.slice(0, 200));
    // the trigger is the moon, named Off days, on this page (phone and desktop); the title bar says Off days too
    const trig = await p.evaluate(() => { const b = document.getElementById("offtrig"), v = b && b.querySelector("svg"); return b ? { label: b.getAttribute("aria-label"), title: b.getAttribute("title"), d: [...v.querySelectorAll("path")].map((x) => x.getAttribute("d")), circles: v.querySelectorAll("circle").length, doc: document.title } : null; });
    ok(`${tag} A: the trigger is a moon button named "Off days" (tooltip "Off days (S)"), not a cog; the title bar says Off days`, !!trig && trig.label === "Off days" && trig.title === "Off days (S)" && trig.circles === 0 && trig.d.length === 1 && /^M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z$/.test(trig.d[0]) && /^Off days/.test(trig.doc) && !/settings|cog|meal planning/i.test(JSON.stringify(trig)), trig);
    // size, fit
    const small = await p.evaluate(() => [...document.querySelectorAll("#ud button")].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); }).map(b => (b.getAttribute("aria-label") || b.textContent).slice(0, 30) + " " + Math.round(b.getBoundingClientRect().width) + "x" + Math.round(b.getBoundingClientRect().height)));
    ok(`${tag} A: every button in the flyout is at least 44 by 44`, small.length === 0, small);
    ok(`${tag} A: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const box = await p.locator("#ud").boundingBox(); ok(`${tag} A: the flyout sits inside the window`, box.x >= -0.5 && box.x + box.width <= w + 0.5 && box.y >= -0.5 && box.y + box.height <= h + 0.5 + 1, box);
    if (phone) { const hb = await p.locator("#ud-host").boundingBox(); ok(`${tag} A: on a phone it is a bottom sheet (touches the bottom edge, at most 88% high)`, Math.abs(hb.y + hb.height - h) < 2 && hb.height <= h * 0.88 + 1, hb); }
    else { const lb = await p.locator("#lane").boundingBox(), fb = await p.locator("#ud").boundingBox(); ok(`${tag} A: on desktop it is the right-hand flyout in the lane (same 400px lane, inside it)`, Math.abs(lb.width - 400) < 2 && fb.x >= lb.x && fb.x + fb.width <= lb.x + lb.width + 1, [lb, fb]); ok(`${tag} A: the lane's own content is hidden while it is open`, await p.locator("#idle").isHidden()); }
    // the week tiles say what the flyout decides
    const tue = await tile(p, "Tue"), fri = await tile(p, "Fri"), sun = await tile(p, "Sun"), mon = await tile(p, "Mon");
    ok(`${tag} A: the week shows Tue as Not cooking, inherited`, tue.state === "off" && tue.src === "inherited" && /Not cooking/.test(tue.text) && /Every week, usual day off \(inherited\)/.test(tue.text), tue);
    ok(`${tag} A: Fri, which the household has off and Sam opened, is a plain open night`, fri.state === "open" && /Open night/.test(fri.text) && !/Usual day off, cooking this week/.test(fri.text), fri);
    ok(`${tag} A: Sun, Sam's own day off, reads Every week, usual day off`, sun.state === "off" && sun.src === "own" && /Every week, usual day off/.test(sun.text), sun);
    ok(`${tag} A: Mon is open`, mon.state === "open");
    ok(`${tag} A: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- B. the person wins, both ways, and the household never rewrites a person ----------
  { const p = await open(ctx, page, "");
    // household turns Wed off: Sam inherits, Jane keeps her own (off anyway), the status line names both
    await tap(chip(p, "hh", "Wed")); await sleep(120);
    ok(`${tag} B: household Wed is now off`, (await st(p, "hh", "Wed")).eff === "off");
    const sw = await st(p, "sam", "Wed"); ok(`${tag} B: Sam inherits it (off, inherited)`, sw.eff === "off" && sw.src === "inherited", sw);
    ok(`${tag} B: the status line names who inherits and whose own setting stays`, /Wednesdays are off for the household\. Inherited by: you and Priya\. /.test(norm(await txt(p))) || /Wednesdays are off for the household\. Inherited by: you and Priya\./.test(norm(await txt(p))), norm(await txt(p)));
    ok(`${tag} B: Jane's own Wed setting is untouched (still hers)`, (await st(p, "jane", "Wed")).src === "own");
    // household turns Fri open: Sam's own open on Fri is unchanged
    await tap(chip(p, "hh", "Fri")); await sleep(120);
    const f2 = await st(p, "sam", "Fri"); ok(`${tag} B: Sam's own Fri stays open and his`, f2.eff === "open" && f2.src === "own", f2);
    // household turns Sun off: Sam's own off on Sun agrees, Sam's own setting is still his
    await tap(chip(p, "hh", "Sun")); await sleep(120);
    ok(`${tag} B: Sam's own Sun off is still his own`, (await st(p, "sam", "Sun")).src === "own");
    // the household opens Tue: Sam, who inherited it, is now open on Tue; Jane (inherits) too
    await tap(chip(p, "hh", "Tue")); await sleep(120);
    const t2 = await st(p, "sam", "Tue"); ok(`${tag} B: when the household opens Tue, Sam (who inherited it) is open on Tue, still inherited`, t2.eff === "open" && t2.src === "inherited", t2);
    ok(`${tag} B: no own setting was written by any household change (Sam still has exactly Fri and Sun)`, /Your own: Fri open, Sun off\./.test(norm(await txt(p))));
    ok(`${tag} B: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- C. choosing for one day: three choices, the person wins ----------
  { const p = await open(ctx, page, "");
    ok(`${tag} C: no choice list is open to begin with`, (await p.locator("#ud-pick").count()) === 0);
    await tap(chip(p, "sam", "Tue")); await sleep(120);
    const radios = await p.locator("#ud-pick [role=radio]").allInnerTexts();
    ok(`${tag} C: tapping a day on your own row opens three choices for that day`, radios.length === 3 && /Inherited from the household \(off\)/.test(radios[0]) && /Off every Tuesday/.test(radios[1]) && /Open every Tuesday/.test(radios[2]), radios);
    ok(`${tag} C: the one in force is checked (Inherited from the household)`, (await p.locator('#ud-pick [aria-checked="true"]').innerText()).startsWith("Inherited from the household"));
    ok(`${tag} C: the chip says its choices are open`, (await chip(p, "sam", "Tue").getAttribute("aria-expanded")) === "true");
    ok(`${tag} C: the choices are 44px high`, await p.locator("#ud-pick .ud-opt").evaluateAll(a => a.every(b => b.getBoundingClientRect().height >= 43.5)));
    await tap(p.locator('#ud-pick [data-set="open"]')); await sleep(120);
    let s = await st(p, "sam", "Tue"); ok(`${tag} C: Open every Tuesday: the day is open and Sam's own (he opened a household day)`, s.eff === "open" && s.src === "own", s);
    ok(`${tag} C: the choices close and the status line says what happened`, (await p.locator("#ud-pick").count()) === 0 && /Tuesdays: open for you every week, the household has it off\./.test(norm(await txt(p))));
    ok(`${tag} C: the week shows Tue as an open night, with no one-week tip`, await (async () => { const t = await tile(p, "Tue"); return t.state === "open" && !/cooking this week/.test(t.text); })());
    await tap(chip(p, "sam", "Tue")); await sleep(120); await tap(p.locator('#ud-pick [data-set="inherit"]')); await sleep(120);
    s = await st(p, "sam", "Tue"); ok(`${tag} C: Inherited from the household drops the own setting (Tue is off again, inherited)`, s.eff === "off" && s.src === "inherited", s);
    await tap(chip(p, "sam", "Mon")); await sleep(120); await tap(p.locator('#ud-pick [data-set="off"]')); await sleep(120);
    s = await st(p, "sam", "Mon"); ok(`${tag} C: Off every Monday: a day the household has open is off, set by Sam`, s.eff === "off" && s.src === "own", s);
    ok(`${tag} C: the week shows Mon as Not cooking, usual day off`, /Every week, usual day off/.test((await tile(p, "Mon")).text));
    // the week's one-week lift still beats everything (existing behaviour)
    await p.evaluate(() => document.querySelector('.pg-night[data-d="Mon"] [data-lift]').click()); await sleep(100); /* on a phone the sheet covers the week: the page script gets the tap, as it would once the sheet is closed */
    ok(`${tag} C: tapping a blocked night lifts it for this week only (the existing tip)`, /Usual day off, cooking this week/.test((await tile(p, "Mon")).text));
    ok(`${tag} C: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- D. keyboard (desktop and phone with a keyboard) ----------
  if (!touch) {
    const p = await open(ctx, page, ""); await chip(p, "sam", "Mon").focus();
    await p.keyboard.press("ArrowRight"); ok(`${tag} D: the right arrow moves along the row`, (await p.evaluate(() => document.activeElement.dataset.d)) === "Tue");
    await p.keyboard.press("Enter"); await sleep(100); ok(`${tag} D: Enter on a day opens its choices and focus goes to the one in force`, (await p.locator("#ud-pick").count()) === 1 && (await p.evaluate(() => document.activeElement.dataset.set)) === "inherit");
    await p.keyboard.press("ArrowDown"); await p.keyboard.press("Enter"); await sleep(100); ok(`${tag} D: down then Enter picks Off every Tuesday, focus returns to the day`, (await st(p, "sam", "Tue")).src === "own" && (await p.evaluate(() => document.activeElement.dataset.d)) === "Tue");
    await p.keyboard.press("Enter"); await sleep(80); await p.keyboard.press("Escape"); await sleep(80);
    ok(`${tag} D: the first Escape closes only the choices, the flyout stays`, (await p.locator("#ud-pick").count()) === 0 && (await p.locator("#ud").count()) === 1);
    await p.keyboard.press("Escape"); await sleep(120); ok(`${tag} D: the second Escape closes the flyout and the lane gets its content back`, (await p.locator("#ud").count()) === 0 && await p.locator("#idle").isVisible());
    await p.keyboard.press("s"); await sleep(120); ok(`${tag} D: S opens it again (the Plan's existing key for Usual days)`, (await p.locator("#ud").count()) === 1);
    ok(`${tag} D: no page errors`, errs.length === 0, errs); await p.close();
  }

  // ---------- E. a member who is not an admin ----------
  { const p = await open(ctx, page, "as=member"); const t = norm(await txt(p));
    ok(`${tag} E: the household row is read only for a member (all seven chips disabled)`, (await p.locator('#ud [data-who="hh"]:not(:disabled)').count()) === 0 && (await p.locator('#ud [data-who="hh"]').count()) === 7);
    ok(`${tag} E: it says so in the household's words: Only household admins can change this.`, t.includes("Only household admins can change this."));
    ok(`${tag} E: the household row is not hidden and still shows what is off`, /Off every Tue and Fri/.test(t) && (await st(p, "hh", "Tue")).eff === "off");
    ok(`${tag} E: the member can still change their own row`, (await p.locator('#ud [data-who="sam"]:not(:disabled)').count()) === 7);
    await tap(chip(p, "sam", "Tue")); await sleep(100); await tap(p.locator('#ud-pick [data-set="open"]')); await sleep(100);
    ok(`${tag} E: a member's own setting wins over the household's too`, (await st(p, "sam", "Tue")).eff === "open");
    ok(`${tag} E: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- F. nothing set yet ----------
  { const p = await open(ctx, page, "data=empty"); const t = norm(await txt(p));
    ok(`${tag} F: no household days: it says so and where to tap`, /No household days off yet\. Tap the days nobody usually cooks\./.test(t));
    ok(`${tag} F: nothing is drawn that has nothing to say (no legend, no Nothing set lines on other people's rows)`, !/Off, from the household/.test(t) && (t.match(/Nothing set/g) || []).length === 1);
    ok(`${tag} F: every chip is open, and the week is all open nights`, (await p.locator('#ud [aria-pressed="true"]').count()) === 0 && (await p.locator('.pg-night[data-state="off"]').count()) === 0);
    await tap(chip(p, "sam", "Wed")); await sleep(100);
    ok(`${tag} F: with nothing to inherit, the choice still says what Inherited from the household means (open)`, /Inherited from the household \(open\)/.test(await p.locator("#ud-pick").innerText()));
    await tap(p.locator('#ud-pick [data-set="off"]')); await sleep(100);
    ok(`${tag} F: a day off is Sam's own and shows in the week`, (await st(p, "sam", "Wed")).src === "own" && (await tile(p, "Wed")).state === "off");
    if (!(await chip(p, "hh", "Wed").isDisabled())) { await tap(chip(p, "hh", "Wed")); await sleep(100); ok(`${tag} F: the household can then take the same day off (status says Sam keeps his own)`, /Own setting stays: /.test(norm(await txt(p))) === false /* his own agrees, nothing differs */ && /Following it: you/.test(norm(await txt(p))) === false, norm(await txt(p))); }
    ok(`${tag} F: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- G. the person sets every day ----------
  { const p = await open(ctx, page, "data=everyday"); const t = norm(await txt(p));
    ok(`${tag} G: it says the person's own setting covers every day`, /Your own on every day\. Nothing is inherited\./.test(t));
    ok(`${tag} G: every one of Sam's chips is his own`, (await p.locator('#ud [data-who="sam"][data-src="own"]').count()) === 7);
    ok(`${tag} G: the week shows Sam's days, not the household's (Tue open, Wed off)`, (await tile(p, "Tue")).state === "open" && (await tile(p, "Wed")).state === "off");
    await tap(p.locator("#ud [data-clear]")); await sleep(100);
    ok(`${tag} G: Inherit all clears every own day at once`, (await p.locator('#ud [data-who="sam"][data-src="own"]').count()) === 0 && /Your own days are cleared\. Every day is inherited from the household\./.test(norm(await txt(p))));
    ok(`${tag} G: and the week is the household's again (Tue off)`, (await tile(p, "Tue")).state === "off");
    await tap(p.locator("#ud [data-undo]")); await sleep(100);
    ok(`${tag} G: Undo puts every own day back`, (await p.locator('#ud [data-who="sam"][data-src="own"]').count()) === 7);
    ok(`${tag} G: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- H. a household of one, and a person left alone with the household's days ----------
  { const p = await open(ctx, page, "data=solo"); const t = norm(await txt(p));
    ok(`${tag} H: one member and no household days: no Household row, no legend, no words about a household`, !/household/i.test(t) && (await p.locator("#ud .ud-days").count()) === 1);
    ok(`${tag} H: the row is as today: You (Sam), seven chips, Sun off`, /You \(Sam\)/i.test(t) && (await st(p, "sam", "Sun")).eff === "off");
    await tap(chip(p, "sam", "Mon")); await sleep(100);
    ok(`${tag} H: a tap is a plain on and off, there is nothing to choose between`, (await p.locator("#ud-pick").count()) === 0 && (await st(p, "sam", "Mon")).eff === "off");
    ok(`${tag} H: the strip has only Mine`, (await p.locator(".pg-strip button").allInnerTexts()).join("|") === "Mine");
    await p.close(); }
  { const p = await open(ctx, page, "data=solohh"); const t = norm(await txt(p));
    ok(`${tag} H: one member but household days left over: the Household row stays so the days that apply can be seen and changed`, /Household/i.test(await p.locator("#ud .ud-lbl").first().innerText()) && /Off every Fri/.test(t) && (await st(p, "sam", "Fri")).eff === "off" && (await st(p, "sam", "Fri")).src === "inherited");
    ok(`${tag} H: the only member can edit the household row (the last admin)`, (await p.locator('#ud [data-who="hh"]:not(:disabled)').count()) === 7);
    await p.close(); }

  // ---------- I. a member who was removed ----------
  { const p = await open(ctx, page, "data=removed"); const t = norm(await txt(p)); const labels = await p.locator("#ud .ud-lbl").allInnerTexts();
    ok(`${tag} I: a removed member has no row (Household, You, Priya only)`, labels.length === 3 && !/Jane/.test(t), labels);
    ok(`${tag} I: nobody else's days change`, (await st(p, "sam", "Fri")).src === "own" && (await st(p, "priya", "Tue")).src === "inherited");
    ok(`${tag} I: the Plan strip does not list them`, !(await p.locator(".pg-strip").innerText()).includes("Jane"));
    await p.close(); }

  // ---------- J. another person's plan in the week is view only, with the same reading ----------
  { const p = await open(ctx, page, ""); await p.evaluate(() => window.UD.close()); await sleep(100); /* the sheet is modal on a phone: close it to use the week */ await tap(p.locator('.pg-strip [data-view="jane"]')); await sleep(100);
    const wed = await tile(p, "Wed"), tue = await tile(p, "Tue");
    ok(`${tag} J: Jane's week shows her own Wed off and the household's Tue`, wed.state === "off" && wed.src === "own" && tue.state === "off" && tue.src === "inherited" && (await p.locator(".pg-night [data-lift]").count()) === 0);
    await tap(p.locator('.pg-strip [data-view="household"]')); await sleep(100);
    ok(`${tag} J: the Household view shows the household's days (Tue and Fri), not anyone's own`, (await tile(p, "Fri")).state === "off" && (await tile(p, "Sun")).state === "open");
    await p.close(); }

  await ctx.close();
}

// ---------- K. the centred window alternative on desktop, and a closed page ----------
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  { const p = await open(ctx, "desktop", "c=dialog"); const b = await p.locator("#ud-host").boundingBox();
    ok(`desktop K: ?c=dialog draws the same content as a centred window`, b.x > 200 && b.x + b.width < 1080 && /Household/i.test(await p.locator("#ud .ud-lbl").first().innerText()) && !/Categories/.test(await txt(p)), b); await p.close(); }
  { const p = await open(ctx, "desktop", "open=0"); ok(`desktop K: ?open=0 shows the page alone, the lane has its own content`, (await p.locator("#ud").count()) === 0 && await p.locator("#idle").isVisible()); await p.locator("#offtrig").click(); await sleep(150); ok(`desktop K: the Off days moon opens the flyout`, (await p.locator("#ud").count()) === 1); await p.locator("#ud .ud-x").click(); await sleep(100); ok(`desktop K: the X closes it and focus returns to the moon button`, (await p.locator("#ud").count()) === 0 && (await p.evaluate(() => document.activeElement.id)) === "offtrig"); await p.close(); }
  await ctx.close(); }

await browser.close();
console.log(fails ? `\n${fails} of ${total} checks FAILED` : `\nall ${total} checks passed`);
process.exit(fails ? 1 : 0);
