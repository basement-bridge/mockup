# Preferences: proposing a preference for another member, Option C

Status: mockup drafted 10 October 2026. **Option C itself is awaiting the owner's approval, and so is every open question below.** The owner's direction (C-D1 to C-D4) is recorded as given, and so are the ten decisions locked later the same day (D5 to D14, below), which the mockup now follows. Six of the thirteen open questions are settled by them (C-Q1 to C-Q5 and C-Q10); seven remain open. Nothing is built in Kitchie, Recipe or platform. Mockup: `fragments/preferences-option-c/` (`index.html`, `option-c.css`, `option-c.js`, and the viewport files `option-c-600.css`, `option-c-1024.css`). Builds on option B's layout (`option-b-mine-and-household.md`); options A and B are not changed.

Numbering: A-1 to A-10 (option A) and B-P1 to B-P7 (option B) are proposals. Option C continues with **C-D** for what the owner said, **C-P** for the mockup's own proposals, **C-Q** for open questions. Owner decisions continue one shared numbering across options A, B and C in the order the owner makes them: D1 to D4 are C-D1 to C-D4 (kept under those labels), and the ten locked decisions of 10 October 2026 (voice session) are **D5 to D14**, in the order given. Nothing is renumbered; a settled C-Q keeps its number and says which decision settled it.

## What the owner said (voice, 10 October 2026)

The owner dislikes one person writing into another person's preferences silently, but does not want approval to block safety-relevant data (an allergy cannot wait on the person logging in). So it is not a hard approval gate.

- **C-D1** Any household member can propose a preference on behalf of another member (for example "Sam avoids peanuts").
- **C-D2** The proposal is written directly at the subject member's own personal level from the start, as that member's own preference record. It is not staged at the household level and not in a shared household bucket. The record is tagged "proposed by [other member]" and is pending the subject's acknowledgment.
- **C-D3** It takes effect immediately, so recipe building and planning pick it up right away.
- **C-D4** The subject gets a courtesy notification queued for their next login, where they can do one of three things: accept as is, edit, or reject. They are correcting their own personal-level record.

## Locked owner decisions (voice, later on 10 October 2026)

Recorded as given. D5 and D8 were revised by the owner after they were first stated; only the revised versions are recorded.

- **D5** Household-level settings and edits: **any** household member may edit them. No "owner" concept, no tenure gate, no restriction. The owner explicitly **deferred** any earn-your-way, tenure-based gating to a later decision. That is deliberate, not forgotten, and is not built in. (For Option C: the Household tab is editable by any member as in Option B; proposals still never go there.)
- **D6** Quiet hours: any member may override household quiet hours to none for themselves. *Stock-check settings, Options A and B; does not touch this option.*
- **D7** Most suggestions per day: 1 to 20, default 2, in the web form and in chat. *Options A and B; does not touch this option.*
- **D8** Household-level food claims (for example "we don't eat pork") are open to **any** member, consistent with D5. Person-level statements stay unrestricted. (For Option C: the Household tab's food list is open to any member. Option C still never writes at that level.)
- **D9** Any household member may propose a preference on behalf of another member. No restriction. Settles C-Q1. (Build note, not an owner decision: the proposer is recorded from the personal link, and a shared link has no member to name, so a shared-link session cannot propose. That is mechanical, not a restriction on who.)
- **D10** If the subject later rejects or edits a proposed preference, this does **not** retroactively change meals or plans already made. It only affects planning going forward. Settles C-Q2. The mockup's planning stand-in leaves a meal planned earlier as it was; the "Check this meal" flag shown while the record is in force is a display (C-P7, still a proposal), never an edit.
- **D11** The proposer is **never** notified of the subject's decision (accept, edit or reject). Silent. Settles C-Q3. There is no outcome line, no "Got it", no event. The proposer's "Waiting for Sam" line simply stops being listed once the subject has dealt with it; that is the only trace, and it says nothing about what was decided.
- **D12** Pending proposals never expire or escalate. They stay pending until the subject deals with them, on their own timing. Settles C-Q4. (A member who never signs in stays pending; no reminder, no ageing label, and the flag must not follow the 60 day deletion of household notices.)
- **D13** The subject has no visibility of a pending proposal before their next login: no badge or preview elsewhere. The next-login notification is the first they see. Settles C-Q5. Reading taken: "elsewhere" includes the assistant, so Sam's assistant uses the record (D14) but does not announce it as a proposal to Sam before the notice. If the owner meant only badges and previews inside the app, that line can be relaxed.
- **D14** While pending and unacknowledged, a proposed preference is treated as **fully reliable** immediately (for example for allergy-safe recipe filtering), not downgraded to "unconfirmed". Settles C-Q10. It is still labelled as the proposer's (C-D2), never presented as the subject's own words.

Meta-pattern (the owner's): person level, the person edits freely, no gate; household level, also no gate for now (any member), with a tenure / earn-your-way gate explicitly deferred. See `../preferences-principles.md` P2.

### What the decisions imply for the model and the code (not built)

- **No outcome notification to the proposer (D11).** Accept, edit and reject write nothing for the proposer: no event, queue or table. The proposer's list is a query over pending records they proposed; an answered record drops out of it.
- **No expiry or escalation (D12).** Nothing scans pending records by age. The pending flag is cleared only by the subject (accept, edit, reject) or by the proposer taking it back (C-Q7, still open).
- **Nothing shown to the subject before the notice (D13).** The pending count for the banner is read only for the signed-in subject on their first screen after sign-in. No badge on other screens, no preview, no mention by the assistant before then.
- **Reliable at once (D14).** The plan and recipe read treat a pending avoid as in force, with the same weight as the subject's own stated avoid. Grading must not add an "unconfirmed" tier for pending. Attribution ("proposed by") is kept for display, not for weighting.
- **No retroactive change (D10).** A reject or edit updates the record; plans already made are not rewritten and no history entry is changed. Planning from then on reads the new state.
- **Anyone may propose (D9).** The server checks only that the subject is another member of the same household as the proposer, from the personal link.
- **Household edits (D5, D8).** The Household tab in Kitchie needs no owner check; household food claims stay open to any member. Kitchie's form and chat range for Most suggestions per day becomes 1 to 20, default 2 (D7), and quiet hours can be set to none per member (D6): see `../preferences-option-a.md` and `option-b-mine-and-household.md` for those.

## What the code holds (re-read 10 October 2026)

Sources: Kitchie `main` 7e6fd08 (`server/src/context.ts`, `context-mcp.ts`, `auth.ts`, `auth-store.ts`, `plan.ts`, `docs/adr/nav-new-badges.md`), Recipe `main` 5cec532 (`server/src/schema.ts`, `preferences.ts`), platform `main` 409f44f (`packages/contract/src/token.ts`). Read only. The summary the owner relayed holds, with one addition (the household notices banner).

| Question | What the code does today | What Option C needs |
|---|---|---|
| Can a member write a record on another member's list? | No. `give_feedback` takes `who` as `me` or `household`; the member always comes from the link, never an argument (`context.ts` `ContextBook`). A claim's `member_id` is the writer, or null for the household. | A way to name the subject member, checked on the server as a member of the same household (D9: any member may). This changes the closed vocabulary of the tool (ADR `closed-vocabulary-for-ai`) and the "member comes from the link" rule. |
| Person-level food statements | Exist: `context_claims` with `member_id` set; avoids carry severity (hard, soft) and reason (safety, other). Retiring a claim keeps its evidence rows (append-only). | New fields on the claim: `proposed_by` (member), `proposed_at`, an acknowledgment state (`pending`, `accepted`, `edited`) and when. Rejected maps to the existing `retired` status, with the history kept. |
| Household-level claims | Any member can write or retire one; there is no owner check. | Unchanged, and now decided (D8). Option C never writes at this level. |
| Notification or claim-back loop | None for claims. The nearest things: the household-changes banner (`household_events`, `join_dismissals`; kinds joined and removed; never about the viewer; deleted after 60 days) and the "new" badges (`nav_seen`, `activity_seen`). | The notice can be a query over pending records on the member's own list, so no queue table is needed, only a store for "Later" (banner dismissed, flag kept). Nothing goes back to the proposer (D11), so no outcome event is stored either. Reusing the household-events table would not fit: it hides events about the viewer and deletes after 60 days. |
| Who reads whose claims | `get_context` returns the caller's own and the household's. "Another member's are never read." Plans carry `for_whom` (a member or everyone) but read no claims. | For C-D3 to be true the plan and recipe read must include the avoidances of each member a meal is for. This is a change to the visibility rule, and it is also missing today for a member's own avoidances. |
| What the engine calls these | Everything returned is `source: stated`, grade Established, permission use. | A proposal is stated by someone else. It needs its own source ("proposed") so the AI does not say Sam told it, but it is graded as fully reliable at once, not as unconfirmed (D14, which settles C-Q10). |
| Accept, edit, reject | `accepted` and `rejected` without a stop are kept as evidence and never acted on in v1. `corrected` retires a claim and may add a replacement. A safety avoidance asks once before it is removed or softened (`NeedsConfirmation`). | Accept clears the flag (a new effect for `accepted`). Edit is `corrected` with a replacement. Reject is a retire. The existing confirm-once rule applies to the subject (C-Q12). None of the three touches meals already planned (D10). |
| Web screen for food statements | None (said to the assistant only). Option B proposed one (B-P5). | The propose form and the review screen are new web screens, or the assistant does the same in words. |
| Recipe | Stars and votes are household only (no member column). | Nothing changes. |
| Platform | Stores no preferences. The token carries `sub`, `household`, `products`, `iat`, `exp`. | Nothing changes. `sub` already says who proposed. |

## What Option C draws

Screens (one live phone; View as Arjan who proposes, Sam the subject, Jo another member):

1. **Proposer's flow.** Mine > Food > "Add something for a housemate": who, what (avoids, dislikes, likes, usually), the thing, and for avoids how strict and why. Three lines before the button say it is used straight away, written on the person's own list as "proposed by you", and that they are told and have the last word. The button reads "Add to Sam's list now". A confirmation shows the record, its chip and what happens next.
2. **Pending, and who sees it.** On Sam's list, waiting records come first, chip "Waiting for you", with "Proposed by Arjan · when. In use now." To the proposer and other members: a read-only line under "Added for housemates" (person, thing, who proposed, "Waiting for Sam"), never the rest of Sam's list. The subject never gets a line about their own pending record (D13): Sam first meets it in the next-login banner. The Household tab says proposals never appear there. A stand-in plan screen shows planning using the record before Sam has seen it: the satay noodles are left out, and a meal planned earlier is flagged.
3. **Next login.** A banner (Review, Later) and a standing row "Added for you" (shown only after that first notice, never as a badge elsewhere, D13). The review screen has three answers, each with what it leaves behind: Keep it as it is, Change it, Remove it. Removing a safety avoidance asks once.
4. **States.** Pending, accepted, edited, rejected, and nothing waiting (no banner, "All clear", a leaf and one line).

| State | Subject's list | Used by plans and recipes | Proposer sees |
|---|---|---|---|
| Pending | Chip "Waiting for you", "Proposed by Arjan", first in the list | Yes, from the moment it was added, fully reliable (D14) | "Waiting for Sam", with Take back |
| Accepted | Flag cleared, chip "Just you", "Proposed by Arjan. You kept it" stays | Yes, unchanged | Nothing (D11). The waiting line is no longer listed |
| Edited | Sam's value replaces the proposed one, flag cleared, "Proposed by Arjan. You changed it" stays | Yes, Sam's value, from then on (D10) | Nothing (D11) |
| Rejected | Record removed (retired; feedback rows stay as history) | No, from then on; meals already planned are not changed (D10) | Nothing (D11) |
| Nothing waiting | No banner, "All clear" | n/a | n/a |

## Proposals the mockup made (the owner did not say these)

- **C-P1** Chip words: "Waiting for you" to the subject, "Waiting for Sam" to others; once answered it is the ordinary "Just you".
- **C-P2** Pending records first in the Food card.
- **C-P3** The three answers are full-width rows, icon first, one line each on what they leave behind; keep is the filled one.
- **C-P4** Strictness and reason may be "Not sure"; the model then treats it as none at all and for safety.
- **C-P5** A standing row "Added for you" keeps the review reachable after the banner is dismissed.
- **C-P6** The Household tab says plainly that proposals never appear there.
- **C-P7** The planning stand-in flags a meal planned earlier while the record is in force. The meal itself is never edited (D10); whether a flag counts as altering it is the judgment call in P6.

## Open questions (all awaiting approval; the mockup draws the reading given)

C-Q1 to C-Q5 and C-Q10 are settled by D9 to D14 and are removed from this list; the other numbers are not renumbered. Seven questions remain open.

- **C-Q6** Who can see a pending record? The subject's side is decided (D13: they first see it in the next-login notice). Reading for the rest: the proposer and every other member see a read-only line (person, thing, who proposed, status), and nothing else of the subject's list. That line stops being listed once the subject has dealt with it, which is the only trace the proposer gets (D11). Cost of a wrong guess: the privacy of a personal list, or surprise at a meal held back. P5 names the open part as a judgment call: may a proposer see that a proposal is still pending?
- **C-Q7** Can the proposer take it back or change it while pending? Reading: take back only.
- **C-Q8** If the subject already has a conflicting record? Reading (not drawn): a proposal never retires the subject's own record; both stand and the stricter is used.
- **C-Q9** Which statements can be proposed? Reading: avoids, dislikes, likes, usually, all with immediate effect; not "never suggest" or "fact".
- **C-Q11** After an edit does the attribution stay? Reading: yes ("proposed by Arjan, changed by you"). The owner said accepted keeps it.
- **C-Q12** Does a safety avoidance ask twice? Reading: Kitchie's existing confirm-once rule applies when the subject removes or softens it.
- **C-Q13** Where does the entry live? Reading: Mine > Food. Alternative: a member's row in Settings > People.

## What the default path loads

The page, shared theme and stylesheet, `option-c.css` (about 15 KB) and `option-c.js` (about 30 KB). No images, no requests, nothing stored. `option-c-600.css` and `option-c-1024.css` are applied by media attribute, so viewport-specific code is never in the shared file. In the real app the closed Mine tab needs one count (pending records on my list) for the banner; the pending records, the proposer's list and the plan check load when opened.

## Mockup and build stay close

The screen reuses option B's rules, which copy Kitchie's `sub-screen.ts` and `layout.ts` (`.sp`, `.mtop`, `.mbody`, `.card`, `.sgroup`, `.seg2`, `.src`, `.prow`, `.pbtn`, `.ped`, `.popt`, `.empty`, `.banner`) unchanged. New in option C: `.src.wait`, `.pact`, `.happens`, `.av`, `.sug`, `.hold`. Sample people and values stay in `option-c.js`. The planning screen is a stand-in; the real one is plan-week.
