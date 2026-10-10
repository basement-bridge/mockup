# Plan on desktop: handover

**Status: frozen 10 October 2026 (Sydney), for anyone to pick up cold.** The mockup is drawn and merged. Nothing is built in the real app. Nothing is approved: decisions 49 to 62 are proposals by the design agent and wait for the owner. This file is the one place to start; every other durable thing is linked from section 11.

Style follows `docs/handover/desktop.md` (the Pantry and Home desktop handover). Read `AGENTS.md` and `DESIGN.md` in this repo first; the rules that bite are in sections 9 and 10.

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
