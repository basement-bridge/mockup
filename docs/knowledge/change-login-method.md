# Change login method (swap one login for another, with a 5-sign-in trial)

Mockup: `fragments/change-login-method/` (one page, six screens, phone and desktop, light and dark; builds on `sign-in-providers.md`, SP-D numbers). Owner: Arjan, from the voice/text hand-off log, 27 October 2026. **Mockup only. Nothing built in Platform or Kitchie; nothing approved.** Items marked Proposal are the mockup's choice where the owner was silent. The owner converts this into an issue once a direction is chosen.

## The owner's design (summary)

"Change login method" is a swap, not an add, like changing an email address. A signed-in person taps it in their profile, signs in with the new provider (proves control), and Kitchie attaches the new identity. The old method stays valid until the new one has been used successfully 5 times (a config value); then the old one is retired in the same step. Failures are ours, never the person's: they never count, never retire anything, and the old method keeps working.

## What was and was not seen

UAT answers 401 to a signed-out reader, so the real profile screen was **not reachable**. The frames use the mockup's own profile menu and Profile window (`fragments/profile-about`, `fragments/desktop-profile`) and the sign-in buttons of `fragments/sign-in-providers` (SP-D11 treatment). Not checked against Platform's member store or provider ids.

## Screens

1. Profile (Me page): a "How you sign in" card with the current login and the row Change login method.
2. Picker: sheet (phone) or dialog (desktop); only enabled, healthy providers; current one marked Current and not tappable; empty list has one plain line that blames us.
3. Status line: `Switching to Microsoft: N of 5 sign-ins done`, five decorative markers, one help sentence; shown at 0, 2, 4; finish state; afterwards line; paused state.
4. Sign-in surfaces: ordinary sign-in page during the trial (nothing about a swap); nudge on the first screen after an old-login sign-in; after retirement the sign-in page shows "You moved from Google to Microsoft" (or a plain no-name note); neutral line when the new provider is down.
5. Failure messages: provider unavailable, cancelled at provider ("No change made"), identity belongs to another member, swap paused, could not save.
6. Support/admin view (read only): current method, switching to, N of 5, pending retirement, old-login sign-ins in the trial, last failure and when. Provider names and times only.

## Decisions

- **CL-D1** (Owner). Change login method is a swap, not an add, like changing an email address.
- **CL-D2** (Owner). Flow: signed-in person taps Change login method in their profile, signs in with the new provider (proves control), Kitchie attaches the new identity.
- **CL-D3** (Owner). The old method is not retired yet. It stays valid, and nothing on the sign-in surface shows both exist.
- **CL-D4** (Owner). The old method is retired only after the new one has been used successfully 5 times. Five is a configuration value. Only successful new-method sign-ins count; the old method signing in never counts and never costs anything.
- **CL-D5** (Owner). On the 5th success the old method is retired in the same step. Only ever one previous method at a time.
- **CL-D6** (Owner). During the trial, signing in with the old method shows a nudge toward the new one. After retirement, trying the old method on the sign-in page shows a nudge: "you moved from <old> to <new>", naming it if known.
- **CL-D7** (Owner). Attach and retire are atomic. If the new identity already belongs to another member: refuse and say so. Never merge two people. Never link by email.
- **CL-D8** (Owner). A provider is offered only if switched on and healthy now. A swap starts only after the new provider has already signed the person in.
- **CL-D9** (Owner). Failures never count toward 5, never retire the old method, and the old method keeps working. Failure messages blame us, never the person.
- **CL-D10** (Owner). State is visible: a plain line in the profile ("Switching to Microsoft: 2 of 5 sign-ins done") and a support/admin view per person (current method, pending retirement, N of 5, last failure and when).
- **CL-D11** (Proposal). The number 5 is read from configuration, never typed into the screens: the line is built as "N of {limit}" and the help text uses the same value.
- **CL-D12** (Proposal). The row lives on the Me page in a "How you sign in" card (desktop: the Profile pane), not in Settings or Household.
- **CL-D13** (Proposal). Picker: sheet on phone, dialog on desktop; current provider marked with a tick and the word Current, not tappable; absent providers are not shown and not explained; empty list gets one plain line that blames us. Order is the fixed order of the sign-in fragment.
- **CL-D14** (Proposal). The status line is one sentence in the card with five decorative markers (done = filled with a tick, to do = hollow) and one help sentence that says the old login still works. Paused swaps use dashed markers and the word "paused".
- **CL-D15** (Proposal). The proving sign-in (the one that attaches the new identity) does not count: a fresh swap reads 0 of 5. This follows the owner asking for a 0 of 5 screen; it is stated here so it can be corrected.
- **CL-D16** (Proposal). Trial nudge: a dismissible note on the first screen after an old-login sign-in, with a link to the profile line. It never blocks, and it shows again on the next old-login sign-in. The sign-in page itself is unchanged during the trial.
- **CL-D17** (Proposal). After retirement the old identity is remembered only as "moved to {provider}" (a provider name, no email, no account id) so the nudge can name it. If that is gone, the plain no-name note is used.
- **CL-D18** (Proposal). Failure copy as drawn (five messages). A cancel is "No change made" and is not called a failure. The "belongs to another member" message never says who.
- **CL-D19** (Proposal, with a recommendation). Safe fallback for a repeatedly failing new provider: after 3 failed new-method sign-ins in a row (a configuration value) the swap pauses by itself; the old login is kept as is; the count is kept; the profile says so in plain words and blames us; the swap resumes by itself when the provider is healthy again. Recommended over leaving it counting (a failing provider could strand the person) and over cancelling (they lose their progress).
- **CL-D20** (Proposal). "Stop switching" in the profile ends a swap that has not finished: it detaches the not-yet-primary new identity and clears the count. The old login is untouched. Needs a confirm step in the build (not drawn).
- **CL-D21** (Proposal). Support view is read only, shows provider names and times only (no email, no provider ids), and includes the number of old-login sign-ins during the trial.
- **CL-D22** (Proposal). Layout and look: the app's existing tokens, 56px rows, 44px controls, the SP-D11 button treatment for the picker, a shape (tick, dash, pause) wherever colour could carry meaning.

- **CL-D23** (Owner) Nobody signs up without an invite. A signed-out person who tries a different provider with no invite is refused, and no new empty account is created.
- **CL-D24** (Owner) Change login method works only while signed in (CL-D2 stands). A person who lost their old login cannot use it.
- **CL-D25** (Owner) Recovery is a Re-invite, admin only: on the person's existing row in the household members list an admin taps Re-invite.
- **CL-D26** (Owner) Kitchie creates a one-time invite tied to that member. The person opens it, signs in with whatever login they have now, and that identity attaches to the same member: history, meals and notes stay.
- **CL-D27** (Owner) Not admin-heavy: one tap, no passwords and no resets (Kitchie holds none), and admins never see the person's email.
- **CL-D28** (Owner) Never merge two people, never link by email. If the identity already belongs to another member, refuse plainly; it is never the person's fault.
- **CL-D29** (Owner) The old login is replaced at the moment the new one attaches, atomically. No trial, no count: this is recovery, not a swap.
- **CL-D30** (Proposal) Invite expiry is 7 days, read from configuration (never typed into a screen; the landing and row text use the same value). The invite works once.
- **CL-D31** (Proposal) One pending re-invite per member. Re-invite while one is pending is not offered; Re-send makes a new link and the old one stops working; Withdraw ends it and the row returns to normal.
- **CL-D32** (Proposal) History gets one line when the person reconnects, with the note "Re-invited by <admin>" (admin name only; no provider id, no email). Creating, withdrawing or expiring an invite leaves no History line.
- **CL-D33** (Proposal) The Re-invite button is a 44px text button on other people's rows. It is not rendered for non-admins (not greyed), and not on the admin's own row (they use Change login method).
- **CL-D34** (Proposal) Confirm then share: one confirm that says what will happen, then a share step with Share and Copy link. Kitchie sends nothing itself, because the admin never has the person's email; the admin passes the link on.
- **CL-D35** (Proposal) Landing page: "Welcome back, <first name>" and "Sign in to reconnect your kitchen." Providers are the on and healthy ones. Errors: used, expired, and one message for withdrawn, replaced or unknown links (so a link never tells a stranger which). "Belongs to someone else" does not use up the invite.
- **CL-D36** (Proposal) The pending row says Re-invite sent. Expires in N days. with an envelope; expired says Re-invite expired. with a clock. Words and shapes, not colour alone.
- **CL-D37** (Proposal) Completion: Jo sees "You're back" and that the old login has been replaced, then opens the kitchen. The admin sees an ordinary row with a quiet "Reconnected today" for one day. No push or email to anyone.
- **CL-D38** (Proposal) A Re-invite works even if Jo's old login still works (the admin cannot tell). If a Change login method swap is in progress, the attach ends it: the new identity is the only login and the count is cleared.
- **CL-D39** (Proposal) The unknown-login refusal on the sign-in page names the way back: "ask a household admin to Re-invite you", and offers Try another login. It creates nothing and does not say whether the account exists anywhere.

## Open questions (owner picks)

- **CL-O1.** Is the Me page the right place for the row, or Settings? If wrong: A wrong guess moves one row.
- **CL-O2.** Does the proving sign-in count as the first of the 5? If wrong: Drawn as no (0 of 5). If yes, the swap finishes one sign-in sooner.
- **CL-O3.** Pause rule: is 3 failures in a row right, does the count stay while paused (proposed), and should it resume by itself (proposed) or wait for the person? If wrong: Too low pauses on a blip; too high strands someone.
- **CL-O4.** Where does the support view live: Platform admin, or Household admin for each household? If wrong: Decides who can see another person's sign-in state.
- **CL-O5.** May support pause, cancel or force-retire a swap, or is the view read only for now? If wrong: Drawn read only.
- **CL-O6.** Can a person stop a swap (CL-D20), and does the new identity then stay attached or leave? If wrong: Proposed: it leaves.
- **CL-O7.** How long do we remember "moved from X to Y" after retirement, and may it be shown to someone who signs in with the old identity (it proves they once had that account)? If wrong: A privacy and tidiness call; forever is the worst case.
- **CL-O8.** Is there a time limit on a swap that never reaches 5? If wrong: Proposed: none; the old login just keeps working. A stale swap may sit forever.
- **CL-O9.** Which sign-ins count: only interactive ones, or also a session that renews? If wrong: Drawn as interactive only.

- **CL-O10** The invite link is a secret: anyone who opens it first becomes Jo. Do we add a check, such as a short word the admin tells Jo aloud, or accept one-time plus 7 days plus Withdraw? If wrong: If wrong: Drawn without a check. A leaked link means someone takes over a member, history and all.
- **CL-O11** May an admin re-invite another admin? An admin could use their own link to become another member. If wrong: If wrong: Drawn: yes for any other member, never on one's own row. Wrong means a member can be taken over by an admin, with no trace beyond the History line.
- **CL-O12** Does the admin pass the link on (drawn), or may Kitchie send it somewhere? Kitchie would need the person's contact, which admins must never see. If wrong: If wrong: Wrong costs a feature: either a sending path or a share sheet.
- **CL-O13** Is the 7-day expiry right, and may a household set it? If wrong: If wrong: Drawn as one config value for all.
- **CL-O14** Does Jo, or the old login, get any notice when an attach replaces the old login (CL-D37 says none)? If wrong: If wrong: Wrong means a quiet replacement nobody sees.
- **CL-O15** Link opened while signed in as someone else: sign out first, or refuse? If wrong: If wrong: Not drawn. Wrong could attach a login to the wrong member; the build needs a rule.
- **CL-O16** Should withdrawn and expired invites leave a History line (CL-D32 says no) and for how long is History kept? If wrong: If wrong: Wrong means the audit trail misses attempts.
- **CL-O17** Removed members use Restore (removed-members). Is Re-invite hidden for them? If wrong: If wrong: Drawn: hidden; a removed person is not on the members list.

## Recovery: Re-invite, admin only (owner, voice, 27 October 2026; section 7 of the page)

Owner: nobody signs up without an invite, so a signed-out person trying a different provider with no invite is refused and no empty account is made (CL-D23). Change login method works only while signed in (CL-D24). Recovery is a re-invite, admin only: on the person's existing row in the members list an admin taps Re-invite (CL-D25); Kitchie creates a one-time invite tied to that member; the person opens it, signs in with whatever login they have now, and that identity attaches to the same member, history, meals and notes staying (CL-D26). One tap, no passwords or resets, admins never see the email (CL-D27). Never merge, never link by email, refuse plainly if the identity belongs to another member (CL-D28). The old login is replaced at the moment the new one attaches, atomically (CL-D29).

Screens (7a to 7f, phone and desktop, light and dark): the members list with Re-invite on a row (admin) and without it (member); confirm then share; the invite landing page with errors (used, expired, withdrawn or replaced, login belongs to someone else) and the unknown-login refusal on the sign-in page; the pending row with Re-send and Withdraw, and the expired row; completion for the person, the admin row afterwards, and the History line "Re-invited by <admin>"; a table of every invite state.

Proposals: 7-day expiry as a config value, one pending re-invite per member, and the History note (the three the owner asked to be marked), plus CL-D33 to CL-D39. Open: CL-O10 to CL-O17. The link is a bearer secret (CL-O10) and an admin could use it to take over a member (CL-O11); these are the two to read first. Mockup only: the schema is reserved until the owner's explicit go.

## Checks and loads

Headless Chromium at 360, 390 and 1280, light and dark: no sideways scroll, no page errors, controls 44px or more, no clipped text. The separate senior-mobile-UX review required by `AGENTS.md` is **not done**. Default path: theme, shared and `cl.css`; inline SVG marks; no request after load; one 12-line script scales the desktop frames (mockup only). The build lifts the `lm-` rules in `cl.css`.
