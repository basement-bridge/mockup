# Preferences: standing design principles

Status: **owner's principles, as given (voice, 10 October 2026).** These are rules, not proposals. They were worked out between the owner and Claude over the three preference options and are written here so that later preference and notification work checks against them instead of asking the owner again. The owner's own summary: anything related to a person is controllable by that person; others can propose, but the user overrides.

Options referred to: [A](preferences-option-a.md) (84c4e3f), [B](user-preferences/option-b-mine-and-household.md) (3e4627d), [C](user-preferences/option-c-propose-for-another-member.md) (e7fc19f). The owner's decisions are numbered once across the three options: D1 to D4 are C-D1 to C-D4 (the owner's own words on Option C, kept under those labels), and the ten decisions locked in the voice session of 10 October 2026 are **D5 to D14**, recorded in the option notes: D5 to D8 in A and B (household edits, quiet hours, the daily cap, household food claims), D5, D8 and D9 to D14 in C (who may propose, no retroactive change, silent resolution, no expiry, nothing visible before login, reliable at once). A later session the same day introduced the household admin role as **D25 to D30** (D15 to D24 belong to other work of that day and are recorded with it); D25 to D29 **supersede D5 and D8**, which stay in the notes with their history. Principles below cite them by number.

Revisions, 10 October 2026. First, the first version of P2 said household edits need the household owner, the longest-standing member with at least two weeks on the app; the owner revised that before it was recorded: no owner and no gate at the household level, a tenure-based gate deferred (D5). Second, in a later voice session the same day the owner introduced the first role, a binary **household admin** (D25 to D30), and with it a gate at the household level. That supersedes D5 and D8 and rewrites P2 and the tensions below. Tenure or earn-your-way gating and finer roles stay deferred.

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

**Rule.** At the person level the person edits freely, with no gate, whatever their role (D29). At the household level the gate is a **binary household-admin role** (D25, D28): only admins change household-level things (household settings, household-level food claims and rules, household notes, the household quiet-hours default and the like), and a member who is not an admin may not. The founding member (the person who first set the household up) is an admin by default (D26) and may grant admin to other members, per person, and revoke it (D27). The role is admin or not and nothing finer. Finer roles and a **tenure-based, earn-your-way gate are explicitly deferred** by the owner: not decided, not forgotten, do not build them in. The rule is deliberately blanket, so the role can grow.
**Why.** Personal values need no gate. Shared values can change what everyone else sees, so they are changed by the people the founding member has trusted with that, not by whoever happens to be a member.
**Apply.** Classify each new setting as person or household first. Person: no gate, no approval step, saves for the person alone, for every role (including a member's own quiet hours set to none, D6). Household: editable for admins; for a member who is not an admin it is read-only with one line ("Only household admins can change this"), never hidden. Put the decision in one place (one check on household writes) and have the screen, the web routes and the assistant tools all call it, so no surface is a back door. Never put a gate on a person's own data, and never on proposing for another member (P3, D9): a proposal is written on the subject's own record, so no role is needed. If a finer role or a tenure condition is added, this principle is the place it is written, and the notes and mockups change together. Keep the word **Household admin** apart from **Kitchen role**, a free profile label the person edits for themselves (D30).
**Seen in.** A, B and C (the Household side is editable for admins and read-only for others, with the line above; Option B draws the Members and admins view where the founding member grants or revokes admin; A and C stand in for the viewer's role with a control). D25 to D30 (the admin role and its rules; they supersede D5 and D8, which made household editing open to any member).
**Note.** The first version of this principle named the household owner and a two-week condition. Those were withdrawn (D5), and D5 itself is now superseded by the admin role. The code still has `isHouseholdOwner` (the longest-standing member) on household stock settings and notes; that check is replaced by an admin check, not removed (see the notes' code changes). The founding member is derived the same way today; the role, the founding-member flag and grant and revoke are new fields and operations.

### P3. Propose is not finalise

**Rule.** Any member may propose data about another member (for example an allergy) or about the household. Attribution ("proposed by X") stays distinct from the subject's own statements until the subject acknowledges it.
**Why.** The AI and the household must never say a person told them something they did not.
**Apply.** Store who proposed, when, and the acknowledgment state with the record. Show the proposer's name wherever the record is shown. Never present a proposal in the subject's voice. After acknowledgment the attribution can stay (Option C keeps "proposed by", including after an edit).
**Seen in.** C (C-D2, D9 any member may propose, the "Waiting for you" chip, D14 on how a proposal is weighed, C-Q11 on attribution after an edit, still open). A and B (food statements about yourself are your own; at household scope they are changed by admins only, D28, which replaced D8's any member).
**Judgment call.** Proposals about the household are named by the owner but no option draws them. Under P2 only household admins change household data (D28), so a member who is not an admin cannot change it and has no proposal path for it either: no option draws one, and the owner has not said whether there should be. This is the question the P2 and P3 tension below describes. Flag it in any feature that needs it, and do not invent a household proposal.

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
- **P2 and P3 (household proposals).** P3 says any member may propose about the household, and P2 now says a member who is not an admin may not change household data (D28). Whether a non-admin may propose a household change, and whether it then waits for an admin (and applies at once under P4, as an allergy would), is not decided. No option draws it: flag it in any feature that needs it. Do not read D9 (any member may propose for another member) as covering it: that proposal lands on a person's own record, not on the household.
- **P2 and P4.** A safety statement for the whole household (for example a household allergy) now needs an admin to record it, so a member who is not an admin cannot make it take effect at once. Today any member can say it to the assistant. Not decided: whether a household safety claim is an exception to D28, or goes through the household-proposal question above. Do not weaken P4 for the person's own record, which is ungated (D29).
- **P2 and today's code.** Kitchie today lets only the longest-standing member write household stock settings and the household note, with a 403 for others, and lets any member record or retire a household food claim. D28 gates all of them by the admin role, so that is a code change in the web routes and the MCP tools (the notes list it). D5 had said to remove the owner check; with D25 to D28 it is replaced by an admin check, and the household food claim check is new. Do not copy the old owner check into new design.
- **P2 and D6.** A member's own quiet hours, including none, are personal and ungated (D29); the household's default is household level and admin only. Both are drawn. Whether the household default needs an admin is on the open list in the notes.
