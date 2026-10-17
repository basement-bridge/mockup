// Behaviour check for the Off days flyout with a household level of usual days off (Kitchie #860). Headless Chromium, phone (390, 360) and desktop (1280), dark and light.
// Checks (owner's redesign, 17 Oct 2026): no legend; a day equal to the household's is plain and says "Same as household"; a day that differs carries a dotted ring (dotted open, dotted off); a tap on a
// differing day resets it (an override is stored only when it differs); no bulk Inherit all; the phone list is a fixed height showing Household and You with the others scrolling in place; a member changes only their
// own row, the household row is admin only. Also: the Categories row is gone, the person-wins rule, the empty, solo, every-day and removed-member states, the week tiles, the keyboard, 44px targets, no page errors.
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
const st = async (p, who, d) => p.evaluate(([w, x]) => { const b = document.querySelector(`#ud [data-who="${w}"][data-d="${x}"]`); return b ? { eff: b.dataset.eff, diff: b.hasAttribute("data-diff"), ro: b.getAttribute("aria-disabled") === "true", tip: b.getAttribute("title") || "", label: b.getAttribute("aria-label"), stored: (window.UD.S.own[w] || {})[x] || null } : null; }, [who, d]);
const tile = (p, d) => p.evaluate(x => { const n = document.querySelector(`.pg-night[data-d="${x}"]`); return n ? { state: n.dataset.state, src: n.dataset.src, text: n.innerText.replace(/\s+/g, " ").trim() } : null; }, d);
const txt = p => p.locator("#ud").innerText();
const poke = loc => loc.evaluate(b => b.click()); /* a click on a read-only (aria-disabled) chip, which Playwright will not tap */
const norm = t => t.replace(/\s+/g, " ").trim();
const ndiff = (p, who) => p.locator(`#ud [data-who="${who}"][data-diff]`).count();
const ring = (p, who, d) => p.evaluate(([w, x]) => { const b = document.querySelector(`#ud [data-who="${w}"][data-d="${x}"]`), a = getComputedStyle(b, "::after"), c = getComputedStyle(b); return { dotted: a.content !== "none" && a.content !== "normal" && a.borderTopStyle === "dotted", dashed: a.borderTopStyle === "dashed", bg: c.backgroundColor, fg: c.color, pressed: b.getAttribute("aria-pressed") }; }, [who, d]);

for (const [page, w, h, scheme, touch] of [["phone", 390, 844, "dark", true], ["phone", 360, 740, "light", true], ["phone", 390, 844, "light", true], ["desktop", 1280, 800, "dark", false], ["desktop", 1280, 800, "light", false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, colorScheme: scheme }); const tag = `${page} ${w} ${scheme}`;
  const tap = loc => touch ? loc.tap() : loc.click();
  const phone = page === "phone";

  // ---------- A. the flyout as it opens: typical household (Sam, Jane, Priya; Tue and Fri off for the household) ----------
  { const p = await open(ctx, page, "");
    const t = norm(await txt(p));
    ok(`${tag} A: the flyout is open on load and titled exactly "Off days" (heading, dialog name)`, /^Off days\b/i.test(t) && (await p.locator("#ud-t").innerText()) === "Off days" && (await p.locator("#ud").getAttribute("aria-labelledby")) === "ud-t" && !/Meal planning/i.test(t));
    ok(`${tag} A: the sentence under the title is the one the app has today`, t.includes("Usual days off cooking. Each week starts with these blocked. Repeating days are set only here; the grid changes one week at a time."));
    ok(`${tag} A: no Categories row, no Leftovers, no Rename (owner: remove them from this flyout)`, !/Categories|Leftovers|Rename/.test(t));
    const labels = await p.locator("#ud .ud-lbl").allInnerTexts();
    ok(`${tag} A: the rows run Household, You (Sam), Jane, Priya`, labels.length === 4 && /^Household/i.test(labels[0]) && /^You \(Sam\)/i.test(labels[1]) && /^Jane · only Jane can change/i.test(labels[2]) && /^Priya · only Priya can change/i.test(labels[3]), labels);
    ok(`${tag} A: each row has seven weekday chips`, (await p.locator("#ud .ud-days").count()) === 4 && (await p.locator("#ud .ud-days").evaluateAll(a => a.every(r => r.querySelectorAll(".ud-d").length === 7))));
    // NO LEGEND anywhere: no key element, no swatches, no corner dot, no bulk reset, none of the old flag words
    const everything = norm(t + " " + (await p.evaluate(() => [...document.querySelectorAll("#ud [aria-label],#ud [title]")].map((e) => (e.getAttribute("aria-label") || "") + " " + (e.getAttribute("title") || "")).join(" "))));
    ok(`${tag} A: no legend or key: no key element, no swatch, no dot element, no "Inherit all" or other bulk reset`, (await p.locator("#ud .ud-key, #ud .ud-sw, #ud .ud-dot, #ud [data-clear], #ud [data-legend]").count()) === 0 && !/\bkey\b|legend|inherit all|set by the person|set by you/i.test(everything), everything.slice(0, 200));
    ok(`${tag} A: no "inherited", "follow" or "pinned" wording (the owner's words are Same as household and Different from the household)`, !/inherit|follow|pinned/i.test(everything), everything.slice(0, 200));
    // the states
    ok(`${tag} A: household is off on Tue and Fri, open on Mon`, (await st(p, "hh", "Tue")).eff === "off" && (await st(p, "hh", "Fri")).eff === "off" && (await st(p, "hh", "Mon")).eff === "open");
    const sTue = await st(p, "sam", "Tue"), sFri = await st(p, "sam", "Fri"), sSun = await st(p, "sam", "Sun"), sMon = await st(p, "sam", "Mon"), jWed = await st(p, "jane", "Wed");
    ok(`${tag} A: a day equal to the household's (Sam Tue off, Mon open) is plain and says "Same as household" on hover and to a screen reader`, !sTue.diff && sTue.eff === "off" && sTue.tip === "Same as household" && /same as household/.test(sTue.label) && !sMon.diff && sMon.eff === "open" && sMon.tip === "Same as household", [sTue, sMon]);
    ok(`${tag} A: household off + Sam opens it (Fri): marked as different, open; the tip says so and offers the reset`, sFri.diff && sFri.eff === "open" && sFri.tip === "Different from the household (open). Click again to reset" && /different from the household, which has it off/.test(sFri.label) && /Click again to reset/.test(sFri.label), sFri);
    ok(`${tag} A: household open + Sam closes it (Sun): marked as different, off`, sSun.diff && sSun.eff === "off" && sSun.tip === "Different from the household (off). Click again to reset" && /which has it open/.test(sSun.label), sSun);
    ok(`${tag} A: Jane's own difference shows on her row, read only (no click, aria-disabled, says who can change it)`, jWed.diff && jWed.eff === "off" && jWed.ro && /Different from the household \(off\)\. Only Jane can change this/.test(jWed.tip) && /only Jane can change this/.test(jWed.label), jWed);
    ok(`${tag} A: a member changes only their own row: Jane's and Priya's chips are read only, Sam's seven are not, and the household's seven are editable for an admin`, (await p.locator('#ud [data-who="jane"]:not([aria-disabled="true"]), #ud [data-who="priya"]:not([aria-disabled="true"])').count()) === 0 && (await p.locator('#ud [data-who="sam"][aria-disabled="true"]').count()) === 0 && (await p.locator('#ud [data-who="hh"][aria-disabled="true"]').count()) === 0);
    ok(`${tag} A: the household row says what is off; each person's row says how they differ or that they match`, /Off every Tue and Fri\./.test(t) && /Different from the household: Fri open, Sun off\./.test(t) && /Different from the household: Wed off\./.test(t) && /Same as the household\./.test(t), t);
    // the look: fill is the value, a dotted ring is the difference, nothing else
    const L = { hhOff: await ring(p, "hh", "Tue"), hhOpen: await ring(p, "hh", "Mon"), sameOff: await ring(p, "sam", "Tue"), sameOpen: await ring(p, "sam", "Mon"), dotOpen: await ring(p, "sam", "Fri"), dotOff: await ring(p, "sam", "Sun") };
    ok(`${tag} A: filled is off and unfilled is open, the same on every row, and the difference does not change the fill`, L.hhOff.bg === L.sameOff.bg && L.sameOff.bg === L.dotOff.bg && L.hhOpen.bg === L.sameOpen.bg && L.sameOpen.bg === L.dotOpen.bg && L.hhOff.bg !== L.hhOpen.bg && [L.hhOff, L.sameOff, L.dotOff].every((x) => x.pressed === "true") && [L.hhOpen, L.sameOpen, L.dotOpen].every((x) => x.pressed === "false"), L);
    ok(`${tag} A: a day that differs has the dotted ring (dotted open, and dotted ring on the solid fill for dotted off)`, L.dotOpen.dotted && L.dotOff.dotted, L);
    ok(`${tag} A: a day equal to the household's has no ring at all (no dotted, no dashed), and the household row has none either`, [L.sameOff, L.sameOpen, L.hhOff, L.hhOpen].every((x) => !x.dotted && !x.dashed), L);
    ok(`${tag} A: dotted open and dotted off are told apart by the fill, and each differs from its plain twin`, L.dotOpen.bg !== L.dotOff.bg && L.dotOpen.dotted !== L.sameOpen.dotted && L.dotOff.dotted !== L.sameOff.dotted);
    // the trigger is the moon, named Off days, on this page (phone and desktop); the title bar says Off days too
    const trig = await p.evaluate(() => { const b = document.getElementById("offtrig"), v = b && b.querySelector("svg"); return b ? { label: b.getAttribute("aria-label"), title: b.getAttribute("title"), d: [...v.querySelectorAll("path")].map((x) => x.getAttribute("d")), circles: v.querySelectorAll("circle").length, doc: document.title } : null; });
    ok(`${tag} A: the trigger is a moon button named "Off days" (tooltip "Off days (S)"), not a cog; the title bar says Off days`, !!trig && trig.label === "Off days" && trig.title === "Off days (S)" && trig.circles === 0 && trig.d.length === 1 && /^M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z$/.test(trig.d[0]) && /^Off days/.test(trig.doc) && !/settings|cog|meal planning/i.test(JSON.stringify(trig)), trig);
    // size, fit
    const small = await p.evaluate(() => [...document.querySelectorAll("#ud button")].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); }).map(b => (b.getAttribute("aria-label") || b.textContent).slice(0, 30) + " " + Math.round(b.getBoundingClientRect().width) + "x" + Math.round(b.getBoundingClientRect().height)));
    ok(`${tag} A: every button in the flyout is at least 44 by 44`, small.length === 0, small);
    ok(`${tag} A: no sideways scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const box = await p.locator("#ud").boundingBox(); ok(`${tag} A: the flyout sits inside the window`, box.x >= -0.5 && box.x + box.width <= w + 0.5 && box.y >= -0.5 && box.y + box.height <= h + 0.5 + 1, box);
    if (phone) {
      const hb = await p.locator("#ud-host").boundingBox(); ok(`${tag} A: on a phone it is a bottom sheet (touches the bottom edge, at most 88% high)`, Math.abs(hb.y + hb.height - h) < 2 && hb.height <= h * 0.88 + 1, hb);
      // the list is a FIXED height: Household and You always in view, the others scroll in place
      const g = () => p.evaluate(() => { const l = document.getElementById("ud-list"), lb = l.getBoundingClientRect(), r = (k) => document.querySelector(`#ud [data-row="${k}"]`).getBoundingClientRect(), hb = document.getElementById("ud-host").getBoundingClientRect(); return { lh: Math.round(lb.height), lt: lb.top, lbot: lb.bottom, sh: l.scrollHeight, ch: l.clientHeight, oy: getComputedStyle(l).overflowY, hh: r("hh").bottom, me: r("sam").bottom, jane: r("jane").top, janeB: r("jane").bottom, priyaB: r("priya").bottom, host: Math.round(hb.top), more: l.dataset.more }; });
      const a = await g();
      ok(`${tag} A: phone: the list is a fixed height that scrolls (overflow auto, content taller than the box)`, a.oy === "auto" && a.sh > a.ch + 20 && a.lh >= 150, a);
      ok(`${tag} A: phone: Household and You are fully in view, the other people are below the fold (Jane starts inside the list but does not fit)`, a.hh <= a.lbot + 0.5 && a.me <= a.lbot + 0.5 && a.janeB > a.lbot + 1, a);
      ok(`${tag} A: phone: a hint that more people are below (fade flag and the status line names them)`, a.more === "true" && /Jane and Priya below/.test(t), [a.more, t.slice(-80)]);
      await p.evaluate(() => { document.getElementById("ud-list").scrollTop = 9999; }); await sleep(120);
      const b = await g();
      ok(`${tag} A: phone: scrolling the list in place brings Priya into view and the sheet and the list do not move or resize`, b.priyaB <= b.lbot + 1 && b.lh === a.lh && b.host === a.host && b.lt === a.lt && b.more === "false", [a, b]);
      await p.evaluate(() => { document.getElementById("ud-list").scrollTop = 0; });
    } else {
      const lb = await p.locator("#lane").boundingBox(), fb = await p.locator("#ud").boundingBox(); ok(`${tag} A: on desktop it is the right-hand flyout in the lane (same 400px lane, inside it)`, Math.abs(lb.width - 400) < 2 && fb.x >= lb.x && fb.x + fb.width <= lb.x + lb.width + 1, [lb, fb]); ok(`${tag} A: the lane's own content is hidden while it is open`, await p.locator("#idle").isHidden());
      ok(`${tag} A: desktop: everyone is in view, nothing scrolls (Household, You, Jane, Priya)`, await p.evaluate(() => { const l = document.getElementById("ud-list"); return l.scrollHeight <= l.clientHeight + 1 && getComputedStyle(l).overflowY !== "auto"; }));
    }
    // the week tiles say what the flyout decides
    const tue = await tile(p, "Tue"), fri = await tile(p, "Fri"), sun = await tile(p, "Sun"), mon = await tile(p, "Mon");
    ok(`${tag} A: the week shows Tue as Not cooking, same as household`, tue.state === "off" && tue.src === "same" && /Not cooking/.test(tue.text) && /Every week, usual day off, same as household/.test(tue.text), tue);
    ok(`${tag} A: Fri, which the household has off and Sam opened, is a plain open night`, fri.state === "open" && /Open night/.test(fri.text) && !/Usual day off, cooking this week/.test(fri.text), fri);
    ok(`${tag} A: Sun, Sam's own day off, reads Every week, usual day off (no "same as household")`, sun.state === "off" && sun.src === "own" && /Every week, usual day off/.test(sun.text) && !/same as household/.test(sun.text), sun);
    ok(`${tag} A: Mon is open`, mon.state === "open");
    ok(`${tag} A: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- B. the household changes a day: nobody's result changes, an own setting that now equals it is dropped ----------
  { const p = await open(ctx, page, "");
    await tap(chip(p, "hh", "Wed")); await sleep(120);
    ok(`${tag} B: household Wed is now off`, (await st(p, "hh", "Wed")).eff === "off");
    const sw = await st(p, "sam", "Wed"); ok(`${tag} B: Sam, who had nothing, is off on Wed, same as household`, sw.eff === "off" && !sw.diff && sw.tip === "Same as household", sw);
    const jw = await st(p, "jane", "Wed");
    ok(`${tag} B: Jane's own Wed off now equals the household's: it is plain and no longer stored (stored only when it differs)`, jw.eff === "off" && !jw.diff && jw.stored === null, jw);
    ok(`${tag} B: the status line says so, with Undo`, /Wednesdays are off for the household\. Now the same as household: Jane\./.test(norm(await txt(p))) && (await p.locator("#ud [data-undo]").count()) === 1, norm(await txt(p)));
    await tap(p.locator("#ud [data-undo]")); await sleep(100);
    const jw2 = await st(p, "jane", "Wed"); ok(`${tag} B: Undo puts the household and Jane's own Wed back`, (await st(p, "hh", "Wed")).eff === "open" && jw2.diff && jw2.stored === "off", jw2);
    await tap(chip(p, "hh", "Fri")); await sleep(120);
    const f2 = await st(p, "sam", "Fri"); ok(`${tag} B: household opens Fri: Sam's own open Fri equals it, so it is plain, open and no longer stored`, f2.eff === "open" && !f2.diff && f2.stored === null, f2);
    await tap(chip(p, "hh", "Tue")); await sleep(120);
    const t2 = await st(p, "sam", "Tue"); ok(`${tag} B: household opens Tue: Sam (who matched it) is open on Tue, still plain`, t2.eff === "open" && !t2.diff, t2);
    await tap(chip(p, "hh", "Sat")); await sleep(120);
    ok(`${tag} B: a household change nobody had set on is just said (no "Now the same" clause)`, /^Tap|Saturdays are off for the household\.$/.test(norm(await p.locator("#ud .ud-say").innerText()).replace(/ Undo$/, "")), norm(await p.locator("#ud .ud-say").innerText()));
    ok(`${tag} B: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- C. one tap changes your own day; a tap on a day that differs resets it ----------
  { const p = await open(ctx, page, "");
    ok(`${tag} C: no choice list and no picker: one tap is the whole interaction`, (await p.locator("#ud-pick, #ud [role=radio], #ud [aria-expanded]").count()) === 0);
    // household off + I open it: dotted open
    await tap(chip(p, "sam", "Tue")); await sleep(120);
    let s = await st(p, "sam", "Tue"); ok(`${tag} C: Tue (household off, plain) tapped: open, marked as different (dotted open), stored`, s.eff === "open" && s.diff && s.stored === "open" && /different from the household/.test(s.label), s);
    const r1 = await ring(p, "sam", "Tue"); ok(`${tag} C: and drawn as the dotted ring on an unfilled chip`, r1.dotted && r1.pressed === "false", r1);
    ok(`${tag} C: the status line says what changed and how to undo it`, /Tuesdays: open for you, the household has them off\. Tap again to reset\./.test(norm(await txt(p))) && (await p.locator("#ud [data-undo]").count()) === 1);
    ok(`${tag} C: the week shows Tue as an open night, with no one-week tip`, await (async () => { const t = await tile(p, "Tue"); return t.state === "open" && !/cooking this week/.test(t.text); })());
    // tap again: it is the reset
    await tap(chip(p, "sam", "Tue")); await sleep(120);
    s = await st(p, "sam", "Tue"); ok(`${tag} C: tapping the overridden day again resets it to the household (off), plain, and the override is deleted`, s.eff === "off" && !s.diff && s.stored === null && s.tip === "Same as household", s);
    ok(`${tag} C: and the week reads the household's again (Tue off)`, (await tile(p, "Tue")).state === "off");
    // household open + I close it: dotted ring with the solid fill
    await tap(chip(p, "sam", "Mon")); await sleep(120);
    s = await st(p, "sam", "Mon"); const r2 = await ring(p, "sam", "Mon");
    ok(`${tag} C: Mon (household open) tapped: off, marked as different (dotted ring on the solid fill)`, s.eff === "off" && s.diff && s.stored === "off" && r2.dotted && r2.pressed === "true", [s, r2]);
    ok(`${tag} C: the week shows Mon as Not cooking, usual day off`, /Every week, usual day off/.test((await tile(p, "Mon")).text) && !/same as household/.test((await tile(p, "Mon")).text));
    await tap(chip(p, "sam", "Mon")); await sleep(120);
    s = await st(p, "sam", "Mon"); ok(`${tag} C: tapping it again resets it to the household (open) and deletes the override`, s.eff === "open" && !s.diff && s.stored === null, s);
    // reset the two existing differences by tapping them
    await tap(chip(p, "sam", "Fri")); await sleep(100); await tap(chip(p, "sam", "Sun")); await sleep(100);
    ok(`${tag} C: tapping Sam's two existing differences (Fri, Sun) resets both: nothing is marked and nothing is stored`, (await ndiff(p, "sam")) === 0 && (await p.evaluate(() => Object.keys(window.UD.S.own.sam).length)) === 0 && /Same as the household\./.test(norm(await p.locator('#ud [data-row="sam"]').innerText())));
    // Undo
    await tap(chip(p, "sam", "Wed")); await sleep(100); await tap(p.locator("#ud [data-undo]")); await sleep(100);
    s = await st(p, "sam", "Wed"); ok(`${tag} C: Undo takes the last change back`, s.eff === "open" && !s.diff && s.stored === null && /Undone/.test(norm(await txt(p))), s);
    // the one-week lift still beats everything (existing behaviour)
    await tap(chip(p, "sam", "Mon")); await sleep(100);
    await p.evaluate(() => document.querySelector('.pg-night[data-d="Mon"] [data-lift]').click()); await sleep(100); /* on a phone the sheet covers the week: the page script gets the tap, as it would once the sheet is closed */
    ok(`${tag} C: tapping a blocked night lifts it for this week only (the existing tip)`, /Usual day off, cooking this week/.test((await tile(p, "Mon")).text));
    ok(`${tag} C: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- D. keyboard (desktop and phone with a keyboard) ----------
  if (!touch) {
    const p = await open(ctx, page, ""); await chip(p, "sam", "Mon").focus();
    await p.keyboard.press("ArrowRight"); ok(`${tag} D: the right arrow moves along the row`, (await p.evaluate(() => document.activeElement.dataset.d)) === "Tue");
    await p.keyboard.press("Enter"); await sleep(100); ok(`${tag} D: Enter on a day flips it (Tue off to open, marked as different) and focus stays on the day`, (await st(p, "sam", "Tue")).diff && (await p.evaluate(() => document.activeElement.dataset.d)) === "Tue");
    await p.keyboard.press("Enter"); await sleep(100); ok(`${tag} D: Enter again resets it`, !(await st(p, "sam", "Tue")).diff && (await st(p, "sam", "Tue")).stored === null);
    await chip(p, "jane", "Mon").focus(); ok(`${tag} D: another person's day can be focused (to read its tip) and Enter changes nothing`, await (async () => { const before = await p.evaluate(() => JSON.stringify(window.UD.S.own)); await p.keyboard.press("Enter"); await sleep(100); return before === (await p.evaluate(() => JSON.stringify(window.UD.S.own))); })());
    await p.keyboard.press("Escape"); await sleep(120); ok(`${tag} D: Escape closes the flyout and the lane gets its content back`, (await p.locator("#ud").count()) === 0 && await p.locator("#idle").isVisible());
    await p.keyboard.press("s"); await sleep(120); ok(`${tag} D: S opens it again (the Plan's existing key for Usual days)`, (await p.locator("#ud").count()) === 1);
    ok(`${tag} D: no page errors`, errs.length === 0, errs); await p.close();
  }

  // ---------- E. who can change what ----------
  { const p = await open(ctx, page, "as=member"); const t = norm(await txt(p));
    ok(`${tag} E: a member who is not an admin: the household row is read only (all seven chips aria-disabled, with the household's tip)`, (await p.locator('#ud [data-who="hh"][aria-disabled="true"]').count()) === 7 && /Only household admins can change this/.test((await st(p, "hh", "Tue")).tip), await st(p, "hh", "Tue"));
    ok(`${tag} E: it says so in the household's words: Only household admins can change this.`, t.includes("Only household admins can change this."));
    ok(`${tag} E: the household row is not hidden and still shows what is off`, /Off every Tue and Fri/.test(t) && (await st(p, "hh", "Tue")).eff === "off");
    const before = await p.evaluate(() => JSON.stringify([window.UD.S.hh, window.UD.S.own]));
    await poke(chip(p, "hh", "Wed")); await sleep(100); await poke(chip(p, "jane", "Mon")); await sleep(100);
    ok(`${tag} E: tapping a household day or Jane's day changes nothing (it says why)`, before === (await p.evaluate(() => JSON.stringify([window.UD.S.hh, window.UD.S.own]))) && /Only Jane can change this/.test(norm(await txt(p))), norm(await txt(p)));
    await poke(chip(p, "hh", "Wed")); await sleep(100);
    ok(`${tag} E: tapping a household day says only admins can change it, and changes nothing`, /Only household admins can change the household days\./.test(norm(await txt(p))) && (await st(p, "hh", "Wed")).eff === "open");
    ok(`${tag} E: the member can still change their own row (seven chips, none read only)`, (await p.locator('#ud [data-who="sam"]:not([aria-disabled="true"])').count()) === 7);
    await tap(chip(p, "sam", "Tue")); await sleep(100);
    ok(`${tag} E: a member's own setting wins over the household's too (Tue opens, marked as different)`, (await st(p, "sam", "Tue")).eff === "open" && (await st(p, "sam", "Tue")).diff);
    ok(`${tag} E: the member's hint on the row (status) says to tap their row`, /Tap a day on your row/.test(norm(await p.locator("#ud .ud-say").innerText())) || /Tuesdays: open for you/.test(norm(await p.locator("#ud .ud-say").innerText())));
    ok(`${tag} E: no page errors`, errs.length === 0, errs); await p.close(); }
  { const p = await open(ctx, page, ""); const before = await p.evaluate(() => JSON.stringify(window.UD.S.own));
    await poke(chip(p, "jane", "Mon")); await sleep(100);
    ok(`${tag} E: even an admin cannot change another person's row (a member changes only their own)`, before === (await p.evaluate(() => JSON.stringify(window.UD.S.own))) && /Only Jane can change this/.test(norm(await txt(p))));
    await p.close(); }

  // ---------- F. nothing set yet ----------
  { const p = await open(ctx, page, "data=empty"); const t = norm(await txt(p));
    ok(`${tag} F: no household days: it says so and where to tap`, /No household days off yet\. Tap the days nobody usually cooks\./.test(t));
    ok(`${tag} F: nothing is marked and every row says it matches the household`, (await p.locator("#ud [data-diff]").count()) === 0 && (t.match(/Same as the household\./g) || []).length === 3, t);
    ok(`${tag} F: every chip is open, and the week is all open nights`, (await p.locator('#ud [aria-pressed="true"]').count()) === 0 && (await p.locator('.pg-night[data-state="off"]').count()) === 0);
    await tap(chip(p, "sam", "Wed")); await sleep(100);
    ok(`${tag} F: a day off is Sam's own difference (dotted ring on the solid fill) and shows in the week`, (await st(p, "sam", "Wed")).diff && (await ring(p, "sam", "Wed")).dotted && (await tile(p, "Wed")).state === "off");
    await tap(chip(p, "hh", "Wed")); await sleep(100);
    ok(`${tag} F: the household taking the same day off makes Sam's plain, and it is not stored`, !(await st(p, "sam", "Wed")).diff && (await st(p, "sam", "Wed")).stored === null && /Now the same as household: you\./.test(norm(await txt(p))), norm(await txt(p)));
    ok(`${tag} F: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- G. a person who differs on every day ----------
  { const p = await open(ctx, page, "data=everyday"); const t = norm(await txt(p));
    ok(`${tag} G: every one of Sam's chips is marked as different, and there is no bulk reset`, (await ndiff(p, "sam")) === 7 && (await p.locator("#ud [data-clear]").count()) === 0 && !/Inherit all/i.test(t), t.slice(0, 200));
    ok(`${tag} G: the week shows Sam's days, not the household's (Tue open, Wed off)`, (await tile(p, "Tue")).state === "open" && (await tile(p, "Wed")).state === "off");
    for (const d of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) { await tap(chip(p, "sam", d)); await sleep(60); }
    ok(`${tag} G: tapping each day resets it one at a time: all seven back to the household's, nothing stored`, (await ndiff(p, "sam")) === 0 && (await p.evaluate(() => Object.keys(window.UD.S.own.sam).length)) === 0 && (await tile(p, "Tue")).state === "off");
    await tap(p.locator("#ud [data-undo]")); await sleep(100);
    ok(`${tag} G: Undo puts the last one back`, (await ndiff(p, "sam")) === 1);
    ok(`${tag} G: no page errors`, errs.length === 0, errs); await p.close(); }

  // ---------- H. a household of one, and a person left alone with the household's days ----------
  { const p = await open(ctx, page, "data=solo"); const t = norm(await txt(p));
    ok(`${tag} H: one member and no household days: no Household row, and nothing says "household" or "same as"`, !/household/i.test(t) && (await p.locator("#ud .ud-days").count()) === 1 && !/same as/i.test(t));
    ok(`${tag} H: the row is as today: You (Sam), seven chips, Sun off, no ring (there is nothing to differ from), no tip`, /You \(Sam\)/i.test(t) && (await st(p, "sam", "Sun")).eff === "off" && (await p.locator("#ud [data-diff]").count()) === 0 && (await st(p, "sam", "Sun")).tip === "");
    await tap(chip(p, "sam", "Mon")); await sleep(100);
    ok(`${tag} H: a tap is a plain on and off`, (await st(p, "sam", "Mon")).eff === "off");
    ok(`${tag} H: the strip has only Mine`, (await p.locator(".pg-strip button").allInnerTexts()).join("|") === "Mine");
    await p.close(); }
  { const p = await open(ctx, page, "data=solohh"); const t = norm(await txt(p));
    ok(`${tag} H: one member but household days left over: the Household row stays so the days that apply can be seen and changed`, /Household/i.test(await p.locator("#ud .ud-lbl").first().innerText()) && /Off every Fri/.test(t) && (await st(p, "sam", "Fri")).eff === "off" && !(await st(p, "sam", "Fri")).diff && (await st(p, "sam", "Fri")).tip === "Same as household");
    ok(`${tag} H: the only member can edit the household row (the last admin)`, (await p.locator('#ud [data-who="hh"]:not([aria-disabled="true"])').count()) === 7);
    ok(`${tag} H: two rows only: nothing to scroll`, await p.evaluate(() => { const l = document.getElementById("ud-list"); return l.scrollHeight <= l.clientHeight + 1; }));
    await p.close(); }

  // ---------- I. a member who was removed ----------
  { const p = await open(ctx, page, "data=removed"); const t = norm(await txt(p)); const labels = await p.locator("#ud .ud-lbl").allInnerTexts();
    ok(`${tag} I: a removed member has no row (Household, You, Priya only)`, labels.length === 3 && !/Jane/.test(t), labels);
    ok(`${tag} I: nobody else's days change`, (await st(p, "sam", "Fri")).diff && !(await st(p, "priya", "Tue")).diff);
    ok(`${tag} I: the Plan strip does not list them`, !(await p.locator(".pg-strip").innerText()).includes("Jane"));
    await p.close(); }

  // ---------- J. another person's plan in the week is view only, with the same reading ----------
  { const p = await open(ctx, page, ""); await p.evaluate(() => window.UD.close()); await sleep(100); /* the sheet is modal on a phone: close it to use the week */ await tap(p.locator('.pg-strip [data-view="jane"]')); await sleep(100);
    const wed = await tile(p, "Wed"), tue = await tile(p, "Tue");
    ok(`${tag} J: Jane's week shows her own Wed off and the household's Tue`, wed.state === "off" && wed.src === "own" && tue.state === "off" && tue.src === "same" && (await p.locator(".pg-night [data-lift]").count()) === 0);
    await tap(p.locator('.pg-strip [data-view="household"]')); await sleep(100);
    ok(`${tag} J: the Household view shows the household's days (Tue and Fri), not anyone's own`, (await tile(p, "Fri")).state === "off" && (await tile(p, "Sun")).state === "open");
    await p.close(); }

  await ctx.close();
}

// ---------- K. the centred window alternative on desktop, and a closed page ----------
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  { const p = await open(ctx, "desktop", "c=dialog"); const b = await p.locator("#ud-host").boundingBox();
    ok(`desktop K: ?c=dialog draws the same content as a centred window`, b.x > 200 && b.x + b.width < 1080 && /Household/i.test(await p.locator("#ud .ud-lbl").first().innerText()) && !/Categories/.test(await txt(p)), b);
    ok(`desktop K: the dialog has no legend, a dotted ring on a differing day (Fri) and none on a matching one (Tue), and everyone is in view`, (await p.locator("#ud .ud-key, #ud .ud-sw, #ud .ud-dot").count()) === 0 && (await ring(p, "sam", "Fri")).dotted && !(await ring(p, "sam", "Tue")).dotted && (await p.evaluate(() => { const l = document.getElementById("ud-list"); return l.scrollHeight <= l.clientHeight + 1; })));
    await tap0(p.locator('#ud [data-who="sam"][data-d="Fri"]')); await sleep(100);
    ok(`desktop K: in the dialog a tap on a differing day resets it`, !(await st(p, "sam", "Fri")).diff && (await st(p, "sam", "Fri")).stored === null);
    await p.close(); }
  { const p = await open(ctx, "desktop", "open=0"); ok(`desktop K: ?open=0 shows the page alone, the lane has its own content`, (await p.locator("#ud").count()) === 0 && await p.locator("#idle").isVisible()); await p.locator("#offtrig").click(); await sleep(150); ok(`desktop K: the Off days moon opens the flyout`, (await p.locator("#ud").count()) === 1); await p.locator("#ud .ud-x").click(); await sleep(100); ok(`desktop K: the X closes it and focus returns to the moon button`, (await p.locator("#ud").count()) === 0 && (await p.evaluate(() => document.activeElement.id)) === "offtrig"); await p.close(); }
  await ctx.close(); }
function tap0(l) { return l.click(); }

await browser.close();
console.log(fails ? `\n${fails} of ${total} checks FAILED` : `\nall ${total} checks passed`);
process.exit(fails ? 1 : 0);
