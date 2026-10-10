# Preferences: standing design principles

Status: **owner's principles, as given (voice, 10 October 2026).** These are rules, not proposals. They were worked out between the owner and Claude over the three preference options and are written here so that later preference and notification work checks against them instead of asking the owner again. The owner's own summary: anything related to a person is controllable by that person; others can propose, but the user overrides.

Options referred to: [A](preferences-option-a.md) (84c4e3f), [B](user-preferences/option-b-mine-and-household.md) (3e4627d), [C](user-preferences/option-c-propose-for-another-member.md) (e7fc19f). Where an option's note records the owner's own words they are cited as C-D1 to C-D4. The owner's ten locked decisions were not yet in those notes when this was written, so they are cited by option and topic, not by number.

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
**Seen in.** C (C-D2 and C-D4: written on the subject's own list, the subject corrects their own record). A and B (the You and Mine rows are the person's own; food statements marked Just you).

### P2. Gating by level

**Rule.** Household-level settings and edits need the household owner: the longest-standing member, with at least two weeks on the app. Anything at the person level is freely editable by that person, with no gate.
**Why.** Shared values need one accountable editor; personal values need none.
**Apply.** Classify each new setting as person or household first. Person: no gate, no approval step, saves for the person alone. Household: owner edits, everyone else reads it (with a line saying who can change it). Never put a gate on a person's own data.
**Seen in.** A and B (who may change household stock-check settings, notes: owner edits, others read-only; A's lock line, B's Household tab). C (the Household tab says proposals never appear there).
**Note.** The two-week condition is the owner's rule of 10 October; the notes and the code know only "longest-standing member". Which household owner applies in platform mode is still open in A and B.

### P3. Propose is not finalise

**Rule.** Any member may propose data about another member (for example an allergy) or about the household. Attribution ("proposed by X") stays distinct from the subject's own statements until the subject acknowledges it.
**Why.** The AI and the household must never say a person told them something they did not.
**Apply.** Store who proposed, when, and the acknowledgment state with the record. Show the proposer's name wherever the record is shown. Never present a proposal in the subject's voice. After acknowledgment the attribution can stay (Option C keeps "proposed by", including after an edit).
**Seen in.** C (C-D2, the "Waiting for you" chip, C-Q10 on what the AI may say, C-Q11 on attribution after an edit). A and B (food statements at household scope carry no owner check today).
**Judgment call.** Proposals about the household are named by the owner but no option draws them. Who finalises one is not decided; flag it (see Known tensions).

### P4. Safety first

**Rule.** Safety-sensitive or immediately actionable data (for example allergies) takes effect immediately on proposal and counts as fully reliable while pending. Courtesy acknowledgment happens later and never gates use.
**Why.** An allergy cannot wait for someone to log in.
**Apply.** Never put approval in front of data that plans, recipes or suggestions must respect. Pending changes how a record is labelled, never whether it is used. When unsure whether something is safety-relevant, treat it as in force and flag the question.
**Seen in.** C (C-D3 effect at once; C-Q10 used at once, labelled proposed). It departs deliberately from `evidence-grading.md`, where safety limits come from what the person states.
**Judgment call.** Where "immediately actionable" ends (a dislike, a preferred cuisine). Option C's reading applies the immediate effect to avoids, dislikes, likes and usually (C-Q9).

### P5. Acknowledgment on the subject's own terms

**Rule.** Acknowledgment is asynchronous and on the subject's timing. No forced check-in, no expiry, no escalation, nothing visible to the subject before their next login, and the proposer is not told what the subject decided (silent resolution).
**Why.** Answering is a courtesy to the subject's own record, not a task set by someone else.
**Apply.** Notifications to a subject are passive (a banner or row at next login, never a push, a count sent elsewhere or a nag). A pending state has no timer. Show the proposer no outcome: not kept, changed or removed. Do not build a reminder, an ageing label or a "still waiting" prompt.
**Seen in.** C (C-D4 courtesy notice queued for next login; C-Q3 to C-Q5 on telling the proposer, how long pending lasts, and seeing it before login).
**Judgment call.** Whether a proposer may see that a proposal is still pending, as opposed to what became of it. The owner's wording does not say.

### P6. Forward-looking changes

**Rule.** Changes a subject makes later (accept, edit, reject) apply going forward only. They do not retroactively alter plans or actions already taken with the prior data.
**Why.** People acted in good faith on what was in force at the time.
**Apply.** A change of record updates what is planned, suggested or shown from then on. Do not rewrite a past plan, history entry or earlier suggestion. Keep the history of the record itself.
**Seen in.** C (C-Q2 on what a reject does to plans already made; C-P7 the planning stand-in).
**Judgment call.** Whether a visible flag on an earlier-planned meal counts as altering it. Option C flags without editing.

## Known tensions

- **P1 and P4.** An unacknowledged proposal is in force before the subject has had their say. The principles reconcile it this way: P1 is about who may finalise the record, P4 is about when it is used. The proposal is used at once, stays labelled as the proposer's (P3), and the subject can still keep, change or remove it at any time, from then on (P6). No new rule is needed.
- **P4 and P5.** With no expiry and no escalation, a proposal can stay in force indefinitely, for example for a member who rarely signs in. That follows from the two principles together. The owner has not said otherwise; do not add an expiry or reminder (C-Q4 asks the same).
- **P5 and Option C as committed.** Option C's note and mockup show the proposer the outcome ("Sam kept it", "Sam changed it", "Sam removed it", C-Q3). P5 says the proposer is not told. Until the owner's decisions are recorded in that note, treat P5 as the rule, and do not copy those outcome lines into new work.
- **P2 and P3 (household proposals).** A member may propose about the household (P3), but household edits need the owner (P2). Whether a household proposal waits for the owner, and whether it applies at once under P4, is not decided. Flag it in any feature that needs it.
- **P2 and today's code.** Any member can write or retire a household food statement with no owner check (Option A and B, food statements). That does not match P2. Do not copy it into new design.
