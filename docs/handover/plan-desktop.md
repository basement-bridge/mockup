# Plan on desktop: handover

**Status update 14 October 2026 (latest, later again): top Copy last week and Clear week only when the gutter is not seen, decision 287, section 16.** **Status update 14 October 2026 (earlier): empty week asks once, hold everything and week tools in the gutter, decisions 282 to 286, section 15 (same PR #184, open).** **Status update 14 October 2026 (later): replan cleanup, one detail order and less red, decisions 276 to 281, section 14 (PR open, not merged).** **Status update 14 October 2026: option B is realigned with the phone Plan (PR open, not merged, for the owner), decisions 259 to 275, section 13.** Options A, C and D are unchanged.

**Status update 12 October 2026: the owner chose option B as the base and gave direction by voice; option B is refined in PR (open, not merged, for the owner), decisions 110 to 120 (see section 12).** Original status, frozen 10 October 2026: the mockup is drawn and merged. Nothing is built in the real app. Decisions 49 to 62 are proposals by the design agent and wait for the owner. This file is the one place to start; every other durable thing is linked from section 11.

Style follows `docs/handover/desktop.md` (the Pantry and Home desktop handover). Read `AGENTS.md` and `DESIGN.md` in this repo first; the rules that bite are in sections 9 and 10.

**Off days flyout, 17 October 2026 (Kitchie #860):** the usual-days flyout now has a Household row, the person wins, and no Categories row; drawn in `fragments/plan-usual-days/`, notes in `docs/knowledge/plan-usual-days.md` (decisions UD-D1 to UD-D20, proposals UD-P1 to UD-P13; no legend, a dotted ring marks a day that differs from the household, a tap resets it). This option's own flyout keeps one row per person and points there.

## 1. The ask, in the owner's words

Owner, 10 October 2026, paraphrased closely from the request and kept as given: make a **desktop version of the Plan UI**; look at how **Pantry does its flyouts** and **redesign Plan on similar principles**; **mockup first**, **hands off** (no questions, use best judgment), draw **several visual options**; **the owner confirms before anything is built**. The repo for this is **`mockup`** (basement-bridge/mockup), **not `kitchie` and not `kitchie-mockup`**.

## 2. The complaint about the current desktop page

From the owner's screenshot (10 October 2026, dark theme, about 1440 wide):

- It is the phone layout stretched into a 60% column.
- The right half of the screen is wasted.
- The meal panel is pinned bottom-right, covers the week it relates to, and is clipped at the bottom.
- It assumes touch (swipe, long-press, bottom sheet).
- There is no keyboard way to do anything.

## 3. What exists and where

| What | Where |
|---|---|
| Mockup index (four options, states, size table, notes) | `fragments/plan-desktop/index.html`; live (not verified from the sandbox, check it): <https://basement-bridge.github.io/mockup/fragments/plan-desktop/index.html> |
| Options | `a.html`, `b.html`, `c.html`, `d.html` in the same folder |
| Job note with decisions 49 to 62 | `docs/knowledge/jobs-to-be-done/plan-desktop.md` |
| Hard avoid guard on the Plan it panel (hand-planned meals; decisions SW-74 to SW-82) | `fragments/plan-hard-avoid/index.html`; `docs/knowledge/settings-window.md` round 10 |
| Phone Plan it builds on | `fragments/plan-week-ai/index.html`; `docs/knowledge/jobs-to-be-done/plan-week-ai.md` (decisions 1 to 48) |
| Pantry desktop rules it copies | `docs/knowledge/desktop-layout.md`, `docs/handover/desktop.md` |
| Quick-look screenshots | `fragments/plan-desktop/shots/` (`a-1440.jpg` to `d-1440.jpg`) |
| Merged by | PR #69, commit `8def810`, squashed into mockup `main` |

**Open it and switch size.** Serve the folder (`python3 -m http.server`) and open `fragments/plan-desktop/index.html`, or use the Pages URL. Open any option, then move the pointer to the top edge or press the backtick key: a hidden control lists the window sizes (1024 x 768, 1280 x 800, 1366 x 768 short laptop, 1440 x 900, 1920 x 1080, 2560 x 1440) and the theme picker. Or add `?vp=1920` to a URL; the page then loads itself in an iframe of exactly that size, so its own width rules run. `frame.js` does this. Other URL options: `?sel=wed-curry` picks a meal, `?day=Wed` (option C), `?state=` (`empty`, `loading`, `offline`, `syncing`, `assistant`, `today`, `past`), `?drag=wed-curry&over=Tue` (add `&copy=1`), `?menu=`, `?toast=1`, `?picker=1`, `?help=1`. The index lists every state with a link.

**File layout (viewport code lives in its own files, DESIGN.md section 7).**

- Shared, no size rules: `plan.css`, `plan.js`, `frame.js`. Per option: `<opt>.html`, `<opt>.css`, `<opt>.js`.
- Per-size CSS for each option, linked with `media=` so a size loads only its own file: `<opt>-1280.css`, `<opt>-1440.css`, `<opt>-1920.css`, `<opt>-2560.css` (min-width 2200) and `<opt>-short.css` (max-height 800).
- Per-size scripts fetched only when their query matches: `lane-summary-2200.js`, `d-overlay.js` (option D below 1440), `d-2560.js`.
- No images in the default path.

## 4. The four options

All four use the same cards, pills and states as the phone Plan; only the layout and the pointer and keyboard behaviour differ.

| Option | One-line pitch | Size rules |
|---|---|---|
| A. Week board | Seven day columns plus a docked inspector; the whole week at a glance. | Agenda under 1280 (this is B's layout). Board from 1280, inspector summoned (360) and pushes. Inspector always docked from 1440 (400), 440 at 1920. Board max 1760; from 2200 the summary gets its own lane. |
| B. Agenda and detail pane | The phone list at a readable width with a permanent pane: Pantry's master-detail. | One layout from 1024. List max 760 (820 at 1920). Pane 340, 380, 400, 440. |
| C. Week strip, one day | Seven day tabs, the chosen day in big cards, Pantry-style flyout. | Rail 88 + column 736 + flyout 340 to 440, left-anchored. At 1920 a second column, "Mise en place" (buy by, past use-by, cook for N). |
| D. Cook sheet | The week as a cook reads it: ingredients down the side, days across; use first, to buy by day, shared, leftovers chain. | Lane overlays below 1440 (the sheet needs its width), docks from 1440. Sheet max 1500. Second lane at 2200 ("Prep ahead and shop by day"). |

**Recommendation (a proposal, the design agent's):** A as the default; B as its narrow form and the fallback; D later as a second view of the same week; C's Mise en place kept as a summary section (it is the idle inspector's content). This is a recommendation only.

## 5. Decisions 49 to 62

All are **proposed, not confirmed** (design agent, 10 October 2026). Full wording and the touch-to-pointer table are in `docs/knowledge/jobs-to-be-done/plan-desktop.md`. Numbers continue the list in `plan-week-ai.md`.

| # | Decision in one line | Status |
|---|---|---|
| 49 | Desktop Plan is its own layout, not the phone column stretched. Recommended option A. | Proposed, not confirmed |
| 50 | The inspector never covers the week it is about: it docks and pushes. Only option D overlays, below 1440. | Proposed, not confirmed |
| 51 | Inspector widths 340, 380, 400, 440 (400 at 1440, as Pantry). | Proposed, not confirmed |
| 52 | With nothing picked the inspector is the week summary (to buy by day, use-by pressure, cook order). Never empty. | Proposed, not confirmed |
| 53 | Close is Ctrl or Cmd Enter and the x; Esc only cancels a drag, lift, menu or picker (Pantry's rule). Lane resizable 320 to 560, dismissible; a picked meal is in the URL (`?sel=`). | Proposed, not confirmed |
| 54 | No Move key (decision 6 stands); desktop adds Space to lift and carry. M stays "focus the main column", as in Pantry. | Proposed, not confirmed |
| 55 | X is Replan, Shift X is remove and not cooking, H is Hold (carries 13, 25, 38 and 9 to the keyboard). | Proposed, not confirmed |
| 56 | Breakpoints and caps as in section 4; left-anchored, free space on the right. | Proposed, not confirmed |
| 57 | Two-finger sideways scroll steps a week; the title opens a picker of last week to four weeks ahead (44). | Proposed, not confirmed |
| 58 | Sync indicator in the header; offline pauses edits and says so, it does not queue them. | Proposed, not confirmed |
| 59 | Undo toast for every removal, replan, move and copy. | Proposed, not confirmed |
| 60 | Use-by is a drop hint ("fixes use-by", "after use-by"); it never blocks a move. | Proposed, not confirmed |
| 61 | Hover buttons are also reachable by focus, so keyboards and touch laptops get them. | Proposed, not confirmed |
| 62 | Day-state looks (34 to 36), the stable week title (46) and last week read-only (31) carry over unchanged. | Proposed, not confirmed |

## 6. Open questions

1. **Which option** does the owner pick? A wrong guess costs a rebuild of the whole screen; nothing is built, so it costs nothing yet.
2. **Does D become a second view** of the same week (recommended), or is it dropped?
3. **Should D's sheet be reachable on phone?** Not drawn.
4. **Decisions 47 (week remembered) and 48 (people strip)** are carried by reuse only; the people strip is not redrawn for desktop. Confirm that is enough.
5. **1024 and 1366 x 768:** the board's day columns keep a full-height drop area only from 1280 up. Confirm that is acceptable at 1024 (the agenda is used there).

## 7. What is NOT decided or built

- Nothing is built in the real app (Kitchie). No Kitchie issue is approved for build.
- No data-model change. Decision 44 stands: data work only for last week to four weeks ahead.
- Decision 42 stands: there is no in-app agent. Decision 45 stands: "Open your assistant" opens the person's default AI app.
- Phone and tablet Plan are untouched; nothing under 1024 is in scope.
- Decisions 49 to 62 and the recommendation in section 4 are proposals.

## 8. Next steps once the owner confirms

Only after the owner picks an option and confirms decisions. This is a **proposal** for slicing, not a plan the owner agreed:

1. Settle section 6 in this file and in the job note; update the mockup first if anything changes (a change to a settled mockup is shown here first, never built first).
2. Slice (proposal): shared inspector and week summary; board or agenda layout for the chosen option; keyboard layer (keys in 53 to 55, 61); drag with keyboard and copy; sync pill and offline; per-size files. Open Kitchie issues for the slices from the PR #69 description and the job note (the owner converts PRs into issues once a direction is stable).
3. Build in the mockup-to-UAT order: Kitchie **`uat`**, never `main`, never tags. Kitchie PRs go to `uat`; read Kitchie's own `AGENTS.md`.
4. **Screens must match the mockup exactly** (markup, class names, tokens, look). Copy the mockup's CSS and markup first, change only what the real code needs, list each difference in the PR.
5. **Chat tools (MCP) and the UI call the same service methods** (owner standing rule, 7 October 2026). Plan actions (replan, hold, move, copy, remove) must not be reimplemented in the UI.
6. **Headless screenshots first** at the bucket widths (see `tools/screenshots.mjs` and DESIGN.md section 7; add 1024, 1280, 1366 x 768, 1440, 1920, 2560 for this screen) before asking the owner to look.
7. **Viewport code in its own files**, as in the mockup: shared component code carries no size rules. Default path loads two shared files plus the size files that match (DESIGN.md section 6).
8. Keep the class names shared with the phone Plan and Pantry (`.mc .tg .blocked .slot`, `.rail .panel .toast .kbd`). Realtime: the sync pill reads the same stream the phone uses.

## 9. Rules from this repo that apply

- Mockups go **straight to mockup `main`** (owner, 9 October 2026); a PR here is not an approval step. This rule is for the mockup repo only.
- The PR description is the working spec: owner's words, proposals marked **Proposal**, open questions, what the default path loads. Do not turn a PR into an issue at PR time.
- One token set (`theme.css`); no raw colours in page CSS. Check in one light and one dark theme.
- Close key on desktop is Ctrl or Cmd Enter, not Esc (owner, voice, 10 October 2026).
- This repo is public: no secrets, no personal details of real people.

## 10. Process notes for the next human

- Branch from `origin/main`, rebase before you push, read `git diff --stat` for anything outside your scope, merge your own PR (squash) into mockup `main`. Never touch `uat`, Kitchie code or tags from this repo.
- **`gh pr create` fails from Claude Code sessions** (GraphQL returns 403). Create the PR with REST: `gh api repos/basement-bridge/mockup/pulls --input <json>` where the JSON has `title`, `head`, `base` (`main`) and `body`. Merge with `gh api -X PUT repos/basement-bridge/mockup/pulls/N/merge -f merge_method=squash`.
- Kitchie issues from a session are also REST only (`gh api repos/basement-bridge/kitchie/issues/...`), and the session must have the repo attached with push access.
- The GitHub Pages URL for the mockup was not verified from the sandbox; open it once and fix this file if it differs.

## 11. Links to every related durable thing

- This handover: `docs/handover/plan-desktop.md` ([blob](https://github.com/basement-bridge/mockup/blob/main/docs/handover/plan-desktop.md)).
- Mockup index: `fragments/plan-desktop/index.html` ([source](https://github.com/basement-bridge/mockup/blob/main/fragments/plan-desktop/index.html), [live](https://basement-bridge.github.io/mockup/fragments/plan-desktop/index.html)).
- PR #69, merged as `8def810`: <https://github.com/basement-bridge/mockup/pull/69>.
- Job note, decisions 49 to 62: [`docs/knowledge/jobs-to-be-done/plan-desktop.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/plan-desktop.md).
- Phone Plan decisions 1 to 48: [`plan-week-ai.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/plan-week-ai.md). Kitchie issue "Plan the week": <https://github.com/basement-bridge/kitchie/issues/392>.
- Pantry desktop: [`docs/knowledge/desktop-layout.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/desktop-layout.md), [`docs/handover/desktop.md`](https://github.com/basement-bridge/mockup/blob/main/docs/handover/desktop.md).
- Rules: [`AGENTS.md`](https://github.com/basement-bridge/mockup/blob/main/AGENTS.md) and [`DESIGN.md`](https://github.com/basement-bridge/mockup/blob/main/DESIGN.md). Learnings applied: 1 (start from the job), 2 (one token set), 4 (one visual family), 5 (options before decisions), 6 (load only what is needed now), 7 (form factors and responsive loading).
- Format reference for a build handoff: [`docs/knowledge/preferences-build-handoff.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/preferences-build-handoff.md).

## 12. Option B refined (12 October 2026)

**Status:** owner chose B as the base (voice). B is revised on branch `design/plan-desktop-b-refine-12oct`; the PR is left open for the owner (do not merge it for him). A, C, D are untouched. Nothing is built in Kitchie.

**What changed** (decisions 110 to 120 in the job note): agenda | meal detail | "This week at a glance" (three columns from 1440, summary tucked behind the detail below it); summary = what to buy by day, use-by pressure, rolling tally, "Add all N" (cook order removed) with a distinct overview look; tile = one status on the left (Missing <item>, On the list, Use by, quiet All on hand) and persistent Hold, Replan, Not cooking, Add missing icons on the right; Hold toggle and Replan releasing holds; open night with Surprise me and Ask AI; four day states (unplanned, planned, Not cooking with the moon, usual day). Files: `b.js`, `b.css`, `b-<size>.css`, `b-three-1440.js`, hooks in `plan.js`. State links: `fragments/plan-desktop/index.html` ("Option B, refined"). Extra URL options: `?sum=1` (summary behind the detail), `?surprise=confirm&prop=Sun`, `?cleared=Mon`, `?listed=1`, `?fri=cook`.

**Added 12 Oct 2026 (separate PR, open): decision 156**, a "just dropped in" cue on every tile whose content changes, option B only (owner voice: "everything"); follow-up not built: carry it to A, C, D?

**Open questions:** fold ideas from A and C (for example a week strip) into B (not decided); Surprise me lock in or confirm first; headline priority (proposal); where three columns start and the 632 agenda width; moon (revisits 24) and dashed open night (revisits 92); Replan on a held meal wording. Full list in the job note.

**Next steps:** owner reviews the PR and answers the open questions; settle them in the job note and this file; then slice a build for Kitchie `uat` as in section 8 (Surprise me needs a service method). Older sections 5 to 8 still describe A as the recommendation; decision 107 supersedes that for now.


## 13. Realigned with the phone Plan (14 October 2026)

- **Ask:** owner, typed, 14 Oct: "given the changes to mobile ... realign the web now based on the key decisions and overall desktop design language".
- **What changed in B:** view-only other people with an eye; Household and participants (new member Priya); Copy and Clear icons with in-place Undo; Clear week by scope; five weeks; open night as an open padlock with Ask AI and Surprise me only (Shift X for Not cooking); Not cooking day offers Surprise me, Ask AI and Mark as open; detail with one list, Total time, Hold N and Add N, real Open recipe; week-level Add, Reserve, Release; moon and padlock counts that jump; T for today; Copy forward on past tiles; the tear on drag; "in the cart" wording and "Nothing missing"; one palette for the glance column; Ask AI leaves a visible note; fewer reds.
- **Audit:** 14 carry over, 9 translate, 6 not applicable, 2 conflict; table in `docs/knowledge/jobs-to-be-done/plan-desktop.md`.
- **Files:** new `b-week.js`, `b-detail.js`, `b-hand.js`; shared `plan.js` gained flags and hooks only; `tools/plan-desktop-b-check.mjs` runs 108 headless checks at 1440 and 1280.
- **Open questions:** blocked hold, 121 and 122 vs 115 and 116, 156 vs 119, discoverability of Not cooking, folding Not cooking days, reds. Costs are in the knowledge note.
- **Next steps:** owner reads the PR and answers the open questions; then the build copies the mockup's CSS and markup first.


## 14. Replan cleanup, one detail order, less red (14 October 2026, decisions 276 to 281)

- **Status update:** PR open, not merged, for the owner (branch `design/plan-replan-cleanup-reds-14oct`). Applies to desktop option B and the phone Plan together.
- **Ask:** owner, voice, 14 Oct 2026: six decisions (hold never blocks and Replan releases it; Replan undoes the meal's footprint on the unbought shopping list; less red on both; one detail order; plain grey is for past days only; desktop keeps Not cooking days full size).
- **What changed in B:** Replan, Not cooking and Clear take the meal's own amounts off the list (reduced line, removed line, bought item untouched), shown in the undo toast; a Shopping list stand-in (rail Shopping, `?shop=1`) with Bought; the detail follows the phone's order (status added at the top, Total time after the source, hold hint above the footer); a refused drop is red again; A, C, D untouched. Sample: lemon on the list for both Thursday meals, bought chicken thighs, milk by hand.
- **Record corrected:** the PR #180 audit's row 31 was a misread (decision 280); counts are 14, 9, 6, 1 conflict, 1 misread. Open questions 1, 3 and 5 of section 13 are closed (276, 280, 281).
- **Still open:** how a mouse user reaches Not cooking from an open night; which reds the owner wants back (both platforms); rows 30 (words vs circle); phone Not cooking colour (280); Open recipe placement; hand-edited line amounts.
- **Next steps:** owner reads the PR; then the build copies the mockup's CSS and markup first. The real shopping list must remember which meal caused each amount.
- **Check:** `tools/plan-desktop-b-check.mjs` 154 checks at 1440 and 1280.


## 15. An empty week asks once; hold everything and week tools in the gutter (14 October 2026, decisions 282 to 286)

- **Status:** added to PR #184 (open, not merged), desktop B only.
- **Ask:** owner, voice, 14 Oct 2026: hold everything in the gutter as on the phone; one whole-week Surprise me and Ask AI on an empty week, per-night lines once any night has a meal, never Not cooking or usual days; Copy last week, its Undo chip and Clear week by scope in the gutter; the drop-in cue stays.
- **What changed:** hold everything is the existing Reserve and Release (269), now labelled in its tooltip; the empty-week card with Surprise me, Ask AI and Copy last week (`?wkfill=card|header|gutter`); per-night pairs hidden only while the week is empty; a Week actions group in the gutter with Copy last week and Clear week (scope in words) sharing the Undo chip with the header icons.
- **Still open:** what "a cog for selecting which of the ..." selects (not drawn); the word Reserve against "hold everything"; placement; keep both header icons and gutter buttons.
- **Next steps:** owner picks the placement; then the build copies the CSS and markup (`.wkfill`, `.wkacts`). The whole-week fill needs a service call that plans many nights in one undoable step and skips blocked days.
- **Check:** `tools/plan-desktop-b-check.mjs`, 220 checks at 1440 and 1280.


## 16. Top Copy and Clear only when the gutter is not seen (14 October 2026, decision 287)

- **Ask:** owner, voice, 14 Oct 2026: Copy last week and Clear week are in the gutter, so the top copies show only when the gutter is not seen.
- **What changed (desktop B):** header icons and the empty-week card's Copy are wrapped as `.wktop`; `lanes()` sets `gut-on` or `gut-off` on `.app`; one CSS rule hides `.wktop` under `gut-on`. Same actions, Undo chip and keys. Hidden at 1440 and up always; below 1440 shown only when a meal is open and the summary is tucked. Where the gutter has no Week actions (empty week, last week, another person) the top copies stay.
- **Tile audit:** all four icons present (Hold or Release, Replan, Remove and not cooking, Add missing when something is missing); none dropped.
- **Check:** `tools/plan-desktop-b-check.mjs`, 230 checks at 1440 and 1280 (F and G now click whichever copy is visible).


## 17. Surprise me is the Home cooking-ideas engine (14 October 2026, decision 292)

- **Ask:** owner, voice, 14 Oct 2026: Surprise me must not hand off to an AI assistant (only Ask AI does); it uses the same rule-based heuristics as the Home cooking-ideas pane, so the same logic holds everywhere.
- **Verdict (decision 94 against Kitchie `recipe-tab/ideas.ts` `rank()` and `ideas-signals.ts` `gather()`):** agree on in-app, no AI, prefer what is in, no obvious repeat. Conflict, Home wins: the shopping list is not a signal (gathered, never scored); no early-week or late-week switch; recency is Home's filters and scores, not 7 days either side; extra signals (use-by within 3 days, star, weeknight minutes). Whole week = Home's Plan ahead lens.
- **What changed (desktop B and the phone):** `plan.js` `rankIdeas`, `pickSurprise`, `planAhead` (replace the old `soon` / `hand` pick); `b-week.js` `fillWeek` uses `planAhead`; `b.js` `?surprise=none`; phone `data.js` `surprise()` and `SUR`. The pool and its signals (`POOL`, `SIG`, `SUR`) are sample data only. Same class names and data attributes; nothing in markup or CSS changed.
- **Kept:** lock in with Undo and the drop-in cue (156) as the default; `?surprise=confirm`; Ask AI the only hand-off. **No-idea state (Proposal):** "Nothing fits from what is in. Try Ask AI.", nothing planned, no Undo entry.
- **The reason in plain words (owner, voice, 14 Oct; Proposal):** a "Why this" chip on the Surprise me tile (`.why[data-why]` > `button.why-btn[aria-describedby]` + `.why-tip[role=tooltip]`), one sentence from at most two Home factors, keyboard-focusable, kept after the toast, cleared when the meal is changed by hand (`whyk` key). Two layers: the human `why` is shown; the technical provenance (`prov`) exists only in the server response and is never drawn. Files: `plan.js` (`human`, `whyKey`, `surpCard`), `b.js` (`whyChip`), `b.css`; phone `data.js`, `phone.js` (`whyChip`), `phone.css`.
- **Still open:** 118 lock in or confirm; keep 94's stricter 7 days on top of Home's filters; which Lean Surprise me follows; whether a pick reserves what the week already holds.
- **Next steps for the build:** the Surprise me service method calls the Home ranking (one function, shared), not a copy; it must also read food rules and the Not tonight snooze, which the mockup does not draw.
- **Check:** `tools/plan-desktop-b-check.mjs` 258 checks (U and V2 are new: the Home rules, the no-idea state, confirm mode).

