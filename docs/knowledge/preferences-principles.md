# Preferences: standing design principles

Status: **owner's principles, as given (voice, 10 October 2026).** These are rules, not proposals. They were worked out between the owner and Claude over the three preference options and are written here so that later preference and notification work checks against them instead of asking the owner again. The owner's own summary: anything related to a person is controllable by that person; others can propose, but the user overrides.

Options referred to: [A](preferences-option-a.md) (84c4e3f), [B](user-preferences/option-b-mine-and-household.md) (3e4627d), [C](user-preferences/option-c-propose-for-another-member.md) (e7fc19f). The owner's decisions are numbered once across the three options: D1 to D4 are C-D1 to C-D4 (the owner's own words on Option C, kept under those labels), and the ten decisions locked in the voice session of 10 October 2026 are **D5 to D14**, recorded in the option notes: D5 to D8 in A and B (household edits, quiet hours, the daily cap, household food claims), D5, D8 and D9 to D14 in C (who may propose, no retroactive change, silent resolution, no expiry, nothing visible before login, reliable at once). Principles below cite them by number.

Revision (10 October 2026, same session): the first version of P2 said household edits need the household owner, the longest-standing member with at least two weeks on the app. The owner revised that before it was recorded as a decision: there is no owner and no gate at the household level for now, and a tenure-based gate is deferred (D5). P2 and the tensions below are corrected to match.

## How to use this document

- It governs the design of any new or changed preference, setting, proposal or notification feature, in the mockups and in the build. Check each feature against P1 to P6 before drawing it, and say in the notes which principles it touches.
- If a design would break a principle, do not decide it silently. Flag it for the owner in the PR description (open questions, with what a wrong guess costs) and in the screen's notes. A flagged departure is not approval to ship it as settled.
- New principles, changes to a principle and exceptions come only from the owner. Do not add your own here; put them in the PR as proposals.
- Some principles are judgment calls at the edges (marked **Judgment call**). Reasonable designs can meet them differently; state which reading you took.
- These principles do not replace `evidence-grading.md` or `boundary-contract.md`. They sit beside them and say who controls a record, not how the engine grades it.

## The principles

### P1. Subject control

**Rule.** The subject has ultimate control over anything about them at the person level. Others may propose on their behalf, but only the subject can finalise, edit or reject it as their own record. Nobody else's proposal becomes final over the person without the subject's say.
**Why.** A person's own list must never be silently written by someone else.
**Apply.** For every field about a person, ask who can write it as final. Only that person. Anyone else's input is a proposal that stays marked as theirs (P3) until the subject acts. Give the subject all three answers: keep, change, remove.
**Seen in.** C (C-D2 and C-D4: written on the subject's own list, the subject corrects their own record; D9: any member may propose, so the subject's say is what keeps it theirs). A and B (the You and Mine rows are the person's own; food statements marked Just you; D6: a member may set quiet hours to none for themselves).

### P2. Gating by level

**Rule.** At the person level the person edits freely, with no gate. At the household level there is also, for now, no gate: **any household member** may edit household-level settings and statements (D5, D8). There is no owner concept and no tenure condition. A tenure-based, earn-your-way gate is **explicitly deferred** by the owner to a later decision. It is not decided and not forgotten: do not build it in, and do not draw a read-only state for non-owners.
**Why.** Personal values need no gate. Shared values are edited by whoever lives there until the owner decides whether household editing should be earned.
**Apply.** Classify each new setting as person or household first. Person: no gate, no approval step, saves for the person alone. Household: no gate either; any member edits, and the screen says so in one line ("Any member can change this"). Keep the design ready for a gate (one place decides who may edit, no copy that assumes everyone always can), but draw none. Never put a gate on a person's own data. If a future decision adds a gate, this principle is the place it is written, and the notes and mockups change together.
**Seen in.** A and B (the Household side is editable by any member with that line; D5 replaced A's lock line and B's read-only list). C (the Household tab is editable as in B; proposals never appear there). D8 for household food claims.
**Note.** The first version of this principle named the household owner and a two-week condition. Those are withdrawn (D5). The code still has `isHouseholdOwner` on household stock settings and notes; that check goes in the build (see A's and B's notes for the list of code changes).

### P3. Propose is not finalise

**Rule.** Any member may propose data about another member (for example an allergy) or about the household. Attribution ("proposed by X") stays distinct from the subject's own statements until the subject acknowledges it.
**Why.** The AI and the household must never say a person told them something they did not.
**Apply.** Store who proposed, when, and the acknowledgment state with the record. Show the proposer's name wherever the record is shown. Never present a proposal in the subject's voice. After acknowledgment the attribution can stay (Option C keeps "proposed by", including after an edit).
**Seen in.** C (C-D2, D9 any member may propose, the "Waiting for you" chip, D14 on how a proposal is weighed, C-Q11 on attribution after an edit, still open). A and B (food statements at household scope are open to any member, D8).
**Judgment call.** Proposals about the household are named by the owner but no option draws them. With no gate at the household level (P2, D5), a member edits household data directly, so the question of a household proposal waiting for someone arises only if a gate is added later. Flag it then (see Known tensions).

### P4. Safety first

**Rule.** Safety-sensitive or immediately actionable data (for example allergies) takes effect immediately on proposal and counts as fully reliable while pending. Courtesy acknowledgment happens later and never gates use.
**Why.** An allergy cannot wait for someone to log in.
**Apply.** Never put approval in front of data that plans, recipes or suggestions must respect. Pending changes how a record is labelled, never whether it is used. When unsure whether something is safety-relevant, treat it as in force and flag the question.
**Seen in.** C (C-D3 effect at once; D14 fully reliable at once, not downgraded to unconfirmed, labelled proposed). It departs deliberately from `evidence-grading.md`, where safety limits come from what the person states.
**Judgment call.** Where "immediately actionable" ends (a dislike, a preferred cuisine). Option C's reading applies the immediate effect to avoids, dislikes, likes and usually (C-Q9, still open).

### P5. Acknowledgment on the subject's own terms

**Rule.** Acknowledgment is asynchronous and on the subject's timing. No forced check-in, no expiry, no escalation, nothing visible to the subject before their next login, and the proposer is not told what the subject decided (silent resolution).
**Why.** Answering is a courtesy to the subject's own record, not a task set by someone else.
**Apply.** Notifications to a subject are passive (a banner or row at next login, never a push, a count sent elsewhere or a nag). A pending state has no timer. Show the proposer no outcome: not kept, changed or removed. Do not build a reminder, an ageing label or a "still waiting" prompt.
**Seen in.** C (C-D4 courtesy notice queued for next login; D11 the proposer is never told the outcome; D12 pending never expires or escalates; D13 the subject sees nothing before the next-login notice). The mockup no longer shows the proposer any outcome, and the subject never gets a "waiting" line about their own record.
**Judgment call.** Whether a proposer may see that a proposal is still pending, as opposed to what became of it. The owner's wording does not say (C-Q6, still open). The mockup draws a read-only "Waiting for Sam" line that stops being listed once the subject has dealt with it, so the line's disappearance is the only trace and says nothing about what was decided.

### P6. Forward-looking changes

**Rule.** Changes a subject makes later (accept, edit, reject) apply going forward only. They do not retroactively alter plans or actions already taken with the prior data.
**Why.** People acted in good faith on what was in force at the time.
**Apply.** A change of record updates what is planned, suggested or shown from then on. Do not rewrite a past plan, history entry or earlier suggestion. Keep the history of the record itself.
**Seen in.** C (D10: a later reject or edit does not change meals or plans already made; C-P7 the planning stand-in).
**Judgment call.** Whether a visible flag on an earlier-planned meal counts as altering it. Option C flags without editing, and D10 does not say either way.

## Known tensions

- **P1 and P4.** An unacknowledged proposal is in force before the subject has had their say. The principles reconcile it this way: P1 is about who may finalise the record, P4 is about when it is used. The proposal is used at once and fully reliably (D14), stays labelled as the proposer's (P3), and the subject can still keep, change or remove it at any time, from then on (P6, D10). No new rule is needed.
- **P4 and P5.** With no expiry and no escalation (D12), a proposal can stay in force indefinitely, for example for a member who rarely signs in. That follows from the two principles together and is now the owner's decision. Do not add an expiry or reminder.
- **P5 and Option C.** Resolved in the mockup. Option C used to show the proposer an outcome ("Sam kept it", "Sam changed it", "Sam removed it"); D11 says the proposer is never told, so those lines and the "Got it" button are gone. What remains is the P5 judgment call: the proposer's "Waiting for Sam" line stops being listed once the subject has dealt with it. Do not add an outcome, a "resolved" label or a count to it. Also, the subject sees no "waiting" line about their own record (D13).
- **P2 and P3 (household proposals).** A member may propose about the household (P3), and under P2 any member may also edit household data directly (D5), so a household proposal has nothing to wait for today. If a tenure-based gate is added later (deferred, not decided), whether a household proposal waits for someone who passes the gate, and whether it applies at once under P4, will need deciding then. Flag it in any feature that needs it.
- **P2 and today's code.** Kitchie today lets only the longest-standing member write household stock settings and the household note, with a 403 for others. P2 and D5 say any member may, so that check is a code change (A's and B's notes list it). Household food statements already match: any member can write or retire one (D8). Do not copy the owner check into new design.
