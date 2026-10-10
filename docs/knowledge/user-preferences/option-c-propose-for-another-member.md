# Preferences: proposing a preference for another member, Option C

Status: mockup drafted 10 October 2026. **Option C itself is awaiting the owner's approval, and so is every open question below.** The owner's direction (C-D1 to C-D4) is recorded as given. Nothing is built in Kitchie, Recipe or platform. Mockup: `fragments/preferences-option-c/` (`index.html`, `option-c.css`, `option-c.js`, and the viewport files `option-c-600.css`, `option-c-1024.css`). Builds on option B's layout (`option-b-mine-and-household.md`); options A and B are not changed.

Numbering: A-1 to A-10 (option A) and B-P1 to B-P7 (option B) are proposals. Option C continues with **C-D** for what the owner said, **C-P** for the mockup's own proposals, **C-Q** for open questions. Owner decisions on the earlier options, if made, continue the shared numbering in the order the owner makes them.

## What the owner said (voice, 10 October 2026)

The owner dislikes one person writing into another person's preferences silently, but does not want approval to block safety-relevant data (an allergy cannot wait on the person logging in). So it is not a hard approval gate.

- **C-D1** Any household member can propose a preference on behalf of another member (for example "Sam avoids peanuts").
- **C-D2** The proposal is written directly at the subject member's own personal level from the start, as that member's own preference record. It is not staged at the household level and not in a shared household bucket. The record is tagged "proposed by [other member]" and is pending the subject's acknowledgment.
- **C-D3** It takes effect immediately, so recipe building and planning pick it up right away.
- **C-D4** The subject gets a courtesy notification queued for their next login, where they can do one of three things: accept as is, edit, or reject. They are correcting their own personal-level record.

## What the code holds (re-read 10 October 2026)

Sources: Kitchie `main` 7e6fd08 (`server/src/context.ts`, `context-mcp.ts`, `auth.ts`, `auth-store.ts`, `plan.ts`, `docs/adr/nav-new-badges.md`), Recipe `main` 5cec532 (`server/src/schema.ts`, `preferences.ts`), platform `main` 409f44f (`packages/contract/src/token.ts`). Read only. The summary the owner relayed holds, with one addition (the household notices banner).

| Question | What the code does today | What Option C needs |
|---|---|---|
| Can a member write a record on another member's list? | No. `give_feedback` takes `who` as `me` or `household`; the member always comes from the link, never an argument (`context.ts` `ContextBook`). A claim's `member_id` is the writer, or null for the household. | A way to name the subject member, checked on the server as a member of the same household. This changes the closed vocabulary of the tool (ADR `closed-vocabulary-for-ai`) and the "member comes from the link" rule. |
| Person-level food statements | Exist: `context_claims` with `member_id` set; avoids carry severity (hard, soft) and reason (safety, other). Retiring a claim keeps its evidence rows (append-only). | New fields on the claim: `proposed_by` (member), `proposed_at`, an acknowledgment state (`pending`, `accepted`, `edited`) and when. Rejected maps to the existing `retired` status, with the history kept. |
| Household-level claims | Any member can write or retire one; there is no owner check. | Unchanged. Option C never writes at this level. |
| Notification or claim-back loop | None for claims. The nearest things: the household-changes banner (`household_events`, `join_dismissals`; kinds joined and removed; never about the viewer; deleted after 60 days) and the "new" badges (`nav_seen`, `activity_seen`). | The notice can be a query over pending records on the member's own list, so no queue table is needed, only a store for "Later" (banner dismissed, flag kept). Reusing the household-events table would not fit: it hides events about the viewer and deletes after 60 days. |
| Who reads whose claims | `get_context` returns the caller's own and the household's. "Another member's are never read." Plans carry `for_whom` (a member or everyone) but read no claims. | For C-D3 to be true the plan and recipe read must include the avoidances of each member a meal is for. This is a change to the visibility rule, and it is also missing today for a member's own avoidances. |
| What the engine calls these | Everything returned is `source: stated`, grade Established, permission use. | A proposal is stated by someone else. It needs its own source ("proposed") so the AI does not say Sam told it. See C-Q10. |
| Accept, edit, reject | `accepted` and `rejected` without a stop are kept as evidence and never acted on in v1. `corrected` retires a claim and may add a replacement. A safety avoidance asks once before it is removed or softened (`NeedsConfirmation`). | Accept clears the flag (a new effect for `accepted`). Edit is `corrected` with a replacement. Reject is a retire. The existing confirm-once rule applies to the subject (C-Q12). |
| Web screen for food statements | None (said to the assistant only). Option B proposed one (B-P5). | The propose form and the review screen are new web screens, or the assistant does the same in words. |
| Recipe | Stars and votes are household only (no member column). | Nothing changes. |
| Platform | Stores no preferences. The token carries `sub`, `household`, `products`, `iat`, `exp`. | Nothing changes. `sub` already says who proposed. |

## What Option C draws

Screens (one live phone; View as Arjan who proposes, Sam the subject, Jo another member):

1. **Proposer's flow.** Mine > Food > "Add something for a housemate": who, what (avoids, dislikes, likes, usually), the thing, and for avoids how strict and why. Three lines before the button say it is used straight away, written on the person's own list as "proposed by you", and that they are told and have the last word. The button reads "Add to Sam's list now". A confirmation shows the record, its chip and what happens next.
2. **Pending, and who sees it.** On Sam's list, waiting records come first, chip "Waiting for you", with "Proposed by Arjan · when. In use now." To the proposer and other members: a read-only line under "Added for housemates" (person, thing, who proposed, "Waiting for Sam"), never the rest of Sam's list. The Household tab says proposals never appear there. A stand-in plan screen shows planning using the record before Sam has seen it: the satay noodles are left out, and a meal planned earlier is flagged.
3. **Next login.** A banner (Review, Later) and a standing row "Added for you". The review screen has three answers, each with what it leaves behind: Keep it as it is, Change it, Remove it. Removing a safety avoidance asks once.
4. **States.** Pending, accepted, edited, rejected, and nothing waiting (no banner, "All clear", a leaf and one line).

| State | Subject's list | Used by plans and recipes | Proposer sees |
|---|---|---|---|
| Pending | Chip "Waiting for you", "Proposed by Arjan", first in the list | Yes, from the moment it was added | "Waiting for Sam", with Take back |
| Accepted | Flag cleared, chip "Just you", "Proposed by Arjan. You kept it" stays | Yes, unchanged | "Sam kept it" until Got it |
| Edited | Sam's value replaces the proposed one, flag cleared, "Proposed by Arjan. You changed it" stays | Yes, Sam's value | "Sam changed it" |
| Rejected | Record removed (retired; feedback rows stay as history) | No, from then on | "Sam removed it" |
| Nothing waiting | No banner, "All clear" | n/a | n/a |

## Proposals the mockup made (the owner did not say these)

- **C-P1** Chip words: "Waiting for you" to the subject, "Waiting for Sam" to others; once answered it is the ordinary "Just you".
- **C-P2** Pending records first in the Food card.
- **C-P3** The three answers are full-width rows, icon first, one line each on what they leave behind; keep is the filled one.
- **C-P4** Strictness and reason may be "Not sure"; the model then treats it as none at all and for safety.
- **C-P5** A standing row "Added for you" keeps the review reachable after the banner is dismissed.
- **C-P6** The Household tab says plainly that proposals never appear there.
- **C-P7** The planning stand-in flags a meal planned earlier while the record is in force.

## Open questions (all awaiting approval; the mockup draws the reading given)

- **C-Q1** Who may propose? Reading: any member, for any other member of the household, from a personal link; not for themselves, not from the shared link.
- **C-Q2** What does a reject do to plans already made? Reading: nothing is edited; a meal planned earlier is flagged while the record is in force and the flag goes after a reject. Wrong guess on a safety item is the costly one.
- **C-Q3** Is the proposer told? Reading: yes, quietly, on their own list, until Got it. No push.
- **C-Q4** How long does the pending flag persist? Reading: until the subject answers, no expiry; dismissing the banner does not clear it. A member who never signs in (a child) stays pending. Household notices are deleted after 60 days today and the flag must not follow that.
- **C-Q5** Can the subject see it before login? Reading: not in the app, but the assistant reads the record at once and could mention it. Is that the notification?
- **C-Q6** Who can see a pending record? Reading: the subject, plus a read-only line for everyone else. Cost of a wrong guess: the privacy of a personal list, or surprise at a meal held back.
- **C-Q7** Can the proposer take it back or change it while pending? Reading: take back only.
- **C-Q8** If the subject already has a conflicting record? Reading (not drawn): a proposal never retires the subject's own record; both stand and the stricter is used.
- **C-Q9** Which statements can be proposed? Reading: avoids, dislikes, likes, usually, all with immediate effect; not "never suggest" or "fact".
- **C-Q10** What grade is an unacknowledged proposal? `evidence-grading.md` says safety limits come from what the person states and are never inferred. A proposal is stated by someone else. Reading: used at once (the safe direction for an avoidance), labelled proposed, never presented as the subject's own words.
- **C-Q11** After an edit does the attribution stay? Reading: yes ("proposed by Arjan, changed by you"). The owner said accepted keeps it.
- **C-Q12** Does a safety avoidance ask twice? Reading: Kitchie's existing confirm-once rule applies when the subject removes or softens it.
- **C-Q13** Where does the entry live? Reading: Mine > Food. Alternative: a member's row in Settings > People.

## What the default path loads

The page, shared theme and stylesheet, `option-c.css` (about 15 KB) and `option-c.js` (about 30 KB). No images, no requests, nothing stored. `option-c-600.css` and `option-c-1024.css` are applied by media attribute, so viewport-specific code is never in the shared file. In the real app the closed Mine tab needs one count (pending records on my list) for the banner; the pending records, the proposer's list and the plan check load when opened.

## Mockup and build stay close

The screen reuses option B's rules, which copy Kitchie's `sub-screen.ts` and `layout.ts` (`.sp`, `.mtop`, `.mbody`, `.card`, `.sgroup`, `.seg2`, `.src`, `.prow`, `.pbtn`, `.ped`, `.popt`, `.empty`, `.banner`) unchanged. New in option C: `.src.wait`, `.pact`, `.happens`, `.av`, `.sug`, `.hold`. Sample people and values stay in `option-c.js`. The planning screen is a stand-in; the real one is plan-week.
