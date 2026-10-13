# Sharing a recipe outside the household: handover

**Status, 13 October 2026:** mockup done, picks made, build in `uat`. Four slices drawn and merged (placement #161, manage #162, recipient #163, sheet #164, invite states #169) and tied together by a hub page. Nothing is built yet in Kitchie, Recipe or platform. Decisions 206 to 258: 206, 209, 243, 247, 248, 250, 252, 253 and 254 to 257 are **confirmed** (13 October 2026), 258 is a **process** decision, the rest **proposed**. Picked: placement A, flyout Share button, sheet C, manage B (share panel), recipient bar B only with an unclaimed invite (sections 4 and 4b). A fifth slice, the Share button in the desktop recipe summary flyout (`fragments/recipe-share/flyout/`), was added the same day. This file is the place to start; the job note holds the wording.

Read `AGENTS.md` and `DESIGN.md` in this repo first. Style follows `docs/handover/plan-desktop.md`.

## 1. The ask, in the owner's words

Owner, voice, 13 October 2026, kept close to what was said:

- Share a recipe he is happy with **outside the household**, like the **shopping-list link**: an **expiring signed URL**.
- **No sign-in needed** to view, and the **same if signed in**.
- **Multi-use, not single-use, but it expires.**
- The intent is **growth hacking**.
- A **share button at the top of the recipe**, with a couple of placement options.
- **Pending URLs visible inside the recipe**, where they can be **cancelled**.
- Links can be **renamed**, like the shopping link.

The repo for this is `mockup` (basement-bridge/mockup), not `kitchie`.

## 2. Where everything lives

| What | Where |
|---|---|
| Hub: the slices, the picked path | `fragments/recipe-share/index.html` (live, not checked from the sandbox: https://basement-bridge.github.io/mockup/fragments/recipe-share/index.html) |
| Placement: where the Share button lives | `fragments/recipe-share/placement/` (`index.html`, `phone.html`, `desktop.html`, `notes.md`), PR #161 |
| Manage: see, rename, cancel links | `fragments/recipe-share/manage/` (`index.html`, `notes.md`), PR #162 |
| Recipient: the public page | `fragments/recipe-share/recipient/` (`index.html`, `page.html`, `notes.md`), PR #163 |
| Summary flyout (desktop) | `fragments/recipe-share/flyout/` (Share next to Open full recipe, drill-in in the same lane) |
| Create sheet | `fragments/recipe-share/sheet/` (`index.html`, `screen.html?o=a|b|c`, `notes.md`), PR #164 |
| Job note: owner's words, decisions 206 to 242, open questions | `docs/knowledge/jobs-to-be-done/recipe-share.md` |
| This handover | `docs/handover/recipe-share.md` |
| The pages it builds on | `recipe/` (the recipe page), `recipe-photos/` (Undo pattern, P-D17), `fragments/shopper-link/` and `docs/knowledge/shopper-link.md` (the link it is modelled on, SL-D1 to SL-D20) |

Each slice's `notes.md` is its own full spec: options, states, default path and deferred loading, files. The hub PR is the one that added the hub, the job note, this file and the index entries; check the PR list for its number.

## 3. The slices and their options

The owner has picked in every slice (marked below). The other options stay drawn for comparison.

| Slice | A (recommended) | B | C |
|---|---|---|---|
| Placement | **Picked.** Icon in the top row with a count; labelled pill and key S on desktop | Chip under the title | More menu row plus a status line |
| Create sheet | One screen: name, 24 hours / 7 days / 30 days (7 default), pinned switch (no longer recommended) | The link is made on open; name and expiry are rows to change | **Confirmed (247):** preview, version list shown only when other versions exist, usual by default; plus the invite opt-in (248) |
| Manage | A Shared section after Photos, chip in the jump row (not picked) | **Picked (254):** panel from the Share button | Card above the ingredients |
| Recipient | Quiet top strip, then one card after the last note (not picked) | **Picked (256):** slim bottom bar after reading starts, only with an unclaimed invite | Banner above the recipe |

## 4. Decided versus proposed

**Decided by the owner:** the seven points in section 1, plus the picks of 13 October 2026 (voice and typed):

- Mobile sharing is placement A: share icon in the top row with an active-links badge (decision 206).
- Desktop sharing is placement A on the main page of the fully opened recipe: Share pill with the S key hint (206, 209).
- The desktop summary flyout (click a row in the Recipes list) gets a Share button next to "Open full recipe", opening the share panel as a drill-in in the same lane. Desktop only, since mobile has no summary flyout (243).

**Proposed, not confirmed:** everything else in decisions 206 to 253, including the flyout button's visual, S shortcut and back behaviour (244 to 246). Question O12 (did "A" cover manage and recipient) is answered: B for both. They were filled in by the design agents where the owner was silent. Grouped: entry and placement (206 to 210), creating a link (211 to 220), seeing and managing links (221 to 229, with 221 superseded by 254), the recipient's page (230 to 239, with 233 superseded by 256), and cross-cutting (240 to 242: the path, entitlement, loading; 240 superseded).

Two of the proposals come from the integration brief rather than a slice: that a link is a Recipe entitlement concern with no per-feature flag (241), and the recommended path itself (240).

## 4a. Invite on a share link (owner, 13 October 2026)

Confirmed:

- The sender may optionally attach an **invite** to a share link, by an opt-in click (248).
- An invite is **single-purpose**: if the link is passed around, only the **first person to activate it claims the invite** (250).
- An invite sets up a **new household**; it never joins an existing one (252).
- Sending an invite respects the member's **maximum-invites limit** (253). Where the limit lives and its value are unknown; do not invent them.

Proposed: the switch defaults off (249); later openers of the link still read the recipe (251).

**Platform and trust.** The invite touches Platform: households, entitlements and member limits all belong there (see `platform-context` and Kitchie issue #127), not in Recipe or Kitchie. Whatever proves an invite or its claim must **reuse the trust mechanism already in place between Platform and the products, with no new token type just for this feature** (standing rule). What that mechanism is, and how a signed share URL relates to it, must be read from the real services, not guessed here.

## 4b. Picks of 13 October 2026, later the same day

Confirmed by the owner (voice and typed):

- **Manage is option B (254):** links are seen, renamed and cancelled in the share panel opened from the Share button (bottom sheet on phone, side panel on desktop). No Shared section in the page, no jump-row chip.
- **An invite counts in the usual place of the existing invite functionality (255).** No new allowance UI. The mockup's "1 of 3 invites left" line above the list is superseded; the real allowance is read from the existing place (open: how, O21).
- **Recipient is option B (256):** a bottom bar after reading starts, shown only when the member who shared attached an invite and it has not been taken up. In every other case the page has no growth invitation: no top strip card, no "Liked it? Keep it in Kitchie."
- **Sign-in (257):** a person with an account can also sign in from the recipient page. A person without an account is handled by the usual invite-only flow elsewhere.

**Process (258), not a product decision:** build the real feature with sensible defaults and merge into `uat` automatically. Never `main`, never tags.

Where the mockup lags the picks (draw it in the mockup only if the owner asks to see it; otherwise the build follows this list and records each difference in the PR): the recipient slice draws the bar B with generic wording and draws the invite claim as a card (option A); the manage slice's option B does not show the invite state rows as the build will; the allowance line in manage and sheet is to be dropped.

## 5. What to ask Arjan

In rough order of what a wrong guess costs. Detail and cost are in the job note's open questions.

1. **Answered:** manage B and recipient B (254, 256). Still open from that area: where the sign-in entry sits with no invitation, and what happens after sign-in (O22); whether Save to my recipes stays (O24); the bar's scroll point and dismiss (O25).
1b. **Invite questions** (O14 to O25): how the allowance is read from the usual place (O21, replaces the "where" half of O14); the value; whether the invite switch defaults off (proposed); what happens to an unclaimed invite when the link expires or is cancelled; what a signed-in person without a household can do; what the new household starts with; whether the shared recipe is copied into it (O19, O23); abuse limits on claiming. Also whether sheet C keeps the pinned radios and the date chip (O13).
1a. **Look at the flyout slice** (`fragments/recipe-share/flyout/`): the button's look and wording, S key, and how Back works. (244 to 246)
2. **Answered by 254:** the link list lives in the share panel (O3).
3. **Pinned or following by default** (decision 216, drawn pinned; open again under sheet C, O13). The version question is answered for the default: the usual, with a choice only when others exist (247). (O4)
4. **Default and longest expiry.** 7 days drawn; 24 hours and 30 days offered. (O6)
5. **The default name,** recipe title or date or "For ...", and its length (60 or 40). (O2)
6. **Esc on the desktop flyout:** Pantry's rule (Ctrl or Cmd Enter) or Esc as the create sheet draws it. (O1)
7. **Cap on links** and whether **Renew keeps the same URL.** (O7, O8)
8. **Does the recipient see the sender's first name?** (O9)
9. **Who may share:** any recipe, or only one with a settled version? (O10)
10. **How growth is measured** without a cookie banner on a no-sign-in page. Nothing is measured in the mockup.

## 6. What is NOT decided or built

- Nothing is built yet. Whether a Kitchie, Recipe or platform issue exists is unknown to this file.
- Unknown, to be answered by reading the real services, not guessed: how a signed URL is made and verified, where links and their counts are stored, which service serves the public page, how opens are counted without link-preview crawlers, how a banner is fetched through a signed link, and whether the existing shopping-link code can be reused. The slices use fictional data and placeholder links at `kitchie.example`.
- No data model, API or tool names are proposed here on purpose. The invite adds nothing to that: no limit value, no claim endpoint, no token.
- Measuring the invitation, and any sender notice when a recipient asks for a new link, are not designed.

## 7. How to build it

Owner instruction (process decision 258, 13 October 2026): build the real feature with sensible defaults and merge into `uat` automatically. Never `main`, never tags. The owner deploys.

**Who owns what.** Recipe owns the data (links, which version is shared, the recipes themselves). Kitchie renders (the Share entry, the panel, the create sheet, the recipient page's look). Platform owns households and invites (allowance, claim, new household). Read each service's own `AGENTS.md` and docs for what exists; this file does not describe their internals.

**Rules that hold.**
1. **Reuse the existing trust mechanism** between Platform and the products for anything that proves an invite or its claim. No new token type for this feature. What the mechanism is, and how a signed share URL relates to it, is read from the real services, not guessed.
2. **No per-feature flags.** Features follow Recipe entitlement (decision 241): whoever has Recipes has sharing; the recipient's page needs no entitlement, and a signed-in viewer without Recipes gets no invitation and no hint (234).
3. **The invite allowance is read from the usual place** of the existing invite functionality (255). No new allowance UI, no new counter.
4. **The built app matches the mockup**: copy the mockup's markup and CSS first, change only what the real code needs, list each difference in the PR (AGENTS.md). Class names are the app's: manage row (`rs-row`, `rs-name`, `rs-left`, `rs-stats`, `rs-acts`, `rs-undo`) and the create sheet (`sh-*`) are meant to be lifted. Sample data and `kitchie.example` links stay in the mockup scripts.
5. **Where the picks differ from the drawn mockup,** the picks win (section 4b): manage in the share panel, the recipient bar B only with an unclaimed invite, no allowance line. List each such difference in the PR.
6. **Chat tools and the UI call the same service methods** (owner standing rule, 7 October 2026): create, list, rename, cancel, renew, remove from view.
7. **Sensible defaults** where the owner is silent are the proposals in the job note (7 days, pinned, invite switch off, and so on). Open questions are answered by reading the real services; if they cannot be, take the cheapest reversible default and say so in the PR.
8. **Load on engagement:** the create sheet and panel load when tapped, the desktop host and key only from 1024px, the recipient page loads words first, then step photos, then the banner; the claim flow loads only on tap. Default path per slice is in its `notes.md`.
9. **Do it in place, not a refresh** (DESIGN.md 6a).
10. **Screenshots first:** captures at 360, 390, 768 and 1280 in light (`kitchie-day`) and dark (`kitchie`) (`tools/screenshots.mjs`, DESIGN.md 7).
11. A suggested order: the recipient's page and signed-link check first (it is the risky unknown), then create and the panel, then the Share entry, then the invite claim with Platform.

## 8. Rules from this repo that apply

- Mockups go straight to mockup `main` (owner, 9 October 2026); a PR here is not an approval step. This is for the mockup repo only. The built feature is different: it goes to `uat` (258).
- The PR description is the working spec: owner's words, proposals marked **Proposal**, open questions, what the default path loads. Do not turn a PR into an issue at PR time; the owner converts PRs into issues once a direction is chosen.
- One token set (`theme.css`); no raw colours in page CSS. Check in one light and one dark theme.
- The repo is public: no secrets, no real people's details.

## 9. Process notes for the next human

- Branch from `origin/main`, rebase before you push, read `git diff --stat` for anything outside your scope, merge your own PR (squash) into mockup `main`. Never touch `uat`, Kitchie code or tags from this repo (the build in Kitchie, Recipe and platform goes to their `uat`, decision 258).
- `gh pr create` can fail from Claude Code sessions (GraphQL 403). Create the PR with REST: `gh api repos/basement-bridge/mockup/pulls --input <json>` (JSON with `title`, `head`, `base`, `body`). Merge with `gh api -X PUT repos/basement-bridge/mockup/pulls/N/merge -f merge_method=squash`.
- Decision numbers here (206 to 258) continued the highest in the job notes at the time (205, Plan UI review). Other branches may take numbers too; check the highest before adding more, and renumber the proposals here if they clash.
- The Pages URL was not verified from the sandbox; open it once and fix this file if it differs.

## 10. Links to every related durable thing

- Job note: [`docs/knowledge/jobs-to-be-done/recipe-share.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/recipe-share.md).
- Hub: [source](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/index.html), [live](https://basement-bridge.github.io/mockup/fragments/recipe-share/index.html).
- Slice notes: [placement](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/placement/notes.md), [sheet](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/sheet/notes.md), [manage](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/manage/notes.md), [recipient](https://github.com/basement-bridge/mockup/blob/main/fragments/recipe-share/recipient/notes.md).
- The link it is modelled on: [`docs/knowledge/shopper-link.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/shopper-link.md).
- Recipe tab decisions it sits inside: [`docs/knowledge/jobs-to-be-done/recipe-tab.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/recipe-tab.md) and [`recipe-tab-handoff.md`](https://github.com/basement-bridge/mockup/blob/main/docs/knowledge/jobs-to-be-done/recipe-tab-handoff.md).
- Rules: [`AGENTS.md`](https://github.com/basement-bridge/mockup/blob/main/AGENTS.md), [`DESIGN.md`](https://github.com/basement-bridge/mockup/blob/main/DESIGN.md). Learnings applied: 1 (start from the job), 2 (one token set), 4 (one visual family), 5 (options before decisions), 6 (load only what is needed now), 6a (in place), 7 (form factors).
