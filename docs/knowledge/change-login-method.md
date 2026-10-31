# Change login method (swap one login for another, with a trial)

Mockup: `fragments/change-login-method/` (one page, six screens, phone and desktop, light and dark; builds on `sign-in-providers.md`, SP-D numbers). Owner: Arjan, from the voice/text hand-off log, 27 October 2026. **Mockup only. Nothing built in Platform or Kitchie; nothing approved.** Items marked Proposal are the mockup's choice where the owner was silent. The owner converts this into an issue once a direction is chosen.

## The owner's design (summary)

"Change login method" is a swap, not an add, like changing an email address. A signed-in person taps it in their profile, signs in with the new provider (proves control), and Kitchie attaches the new identity. The old method stays valid until the new one has been used successfully 5 times (a config value); then the old one is retired in the same step. Failures are ours, never the person's: they never count, never retire anything, and the old method keeps working.

## What was and was not seen

UAT answers 401 to a signed-out reader, so the real profile screen was **not reachable**. The frames use the mockup's own profile menu and Profile window (`fragments/profile-about`, `fragments/desktop-profile`) and the sign-in buttons of `fragments/sign-in-providers` (SP-D11 treatment). Not checked against Platform's member store or provider ids.

## Screens

1. Profile (Me page): a "How you sign in" card with the current login and the row Change login method.
2. Picker: sheet (phone) or dialog (desktop); only enabled, healthy providers; current one marked Current and not tappable; empty list has one plain line that blames us.
3. Status line (CL-D40, 31 Oct): plain `Switching to Microsoft. Keep signing in with Microsoft.` with no count and no markers; finish state; afterwards line; paused state.
4. Sign-in surfaces: ordinary sign-in page during the trial (nothing about a swap); transition-only nudge on the first screen after an old-login sign-in (CL-D40); after retirement the sign-in page shows "You moved from Google to Microsoft" (or a plain no-name note); neutral line when the new provider is down.
5. Failure messages: provider unavailable, cancelled at provider ("No change made"), identity belongs to another member, swap paused, could not save.
6. Support/admin view (read only; the only place the count N of 5 is shown): current method, switching to, N of 5, pending retirement, old-login sign-ins in the trial, last failure and when. Provider names and times only.

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
- **CL-D10** (Owner). State is visible: a plain line in the profile and a support/admin view per person (current method, pending retirement, N of 5, last failure and when). **Superseded in part by CL-D40:** the profile line no longer carries a count (the 27 Oct wording "Switching to Microsoft: 2 of 5 sign-ins done" is withdrawn); the count stays in the support/admin view.
- **CL-D11** (Proposal). The number 5 is read from configuration, never typed into the screens: the support view is built as "N of {limit}". **Superseded in part by CL-D40:** no person-facing text uses the value any more.
- **CL-D12** (Proposal; superseded by CL-D44 and CL-D51, 31 Oct). The row lives on the Me page in a "How you sign in" card (desktop: the Profile pane), not in Settings or Household.
- **CL-D13** (Proposal). Picker: sheet on phone, dialog on desktop; current provider marked with a tick and the word Current, not tappable; absent providers are not shown and not explained; empty list gets one plain line that blames us. Order is the fixed order of the sign-in fragment.
- **CL-D14** (Proposal). **Superseded by CL-D40.** Was: a status line with a count and five decorative markers. Now: the status line is plain text without a count and without markers; a paused swap says "paused" with a pause shape.
- **CL-D15** (Proposal). The proving sign-in (the one that attaches the new identity) does not count in the support count (N of 5; a fresh swap reads 0 of 5 there). **Superseded in part by CL-D40:** no person-facing 0 of 5 screen.
- **CL-D16** (Proposal). Trial nudge: a dismissible note on the first screen after an old-login sign-in, with a link to the profile line. **Wording replaced by CL-D40** (transition-only note, no count). It never blocks, and it shows again on the next old-login sign-in. The sign-in page itself is unchanged during the trial.
- **CL-D17** (Proposal). After retirement the old identity is remembered only as "moved to {provider}" (a provider name, no email, no account id) so the nudge can name it. If that is gone, the plain no-name note is used.
- **CL-D18** (Proposal). Failure copy as drawn (five messages). A cancel is "No change made" and is not called a failure. The "belongs to another member" message never says who.
- **CL-D19** (Proposal, with a recommendation). Safe fallback for a repeatedly failing new provider: after 3 failed new-method sign-ins in a row (a configuration value) the swap pauses by itself; the old login is kept as is; the count is kept (in the support view only, CL-D40); the profile says so in plain words, without a count, and blames us; the swap resumes by itself when the provider is healthy again. Recommended over leaving it counting (a failing provider could strand the person) and over cancelling (they lose their progress).
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

- **CL-D40** (Owner, Arjan, typed, 31 October 2026) The person is never told how many sign-ins they have left. No "N of 5", "X of 5 sign-ins done", progress markers or "5th sign-in" on any of the person's own screens (profile mid-swap line, paused state, finish state, failure messages, picker help, nudge). Instead: (a) signing in with the OLD login during the transition shows a nudge: "Temporary: this login is available during the transition only. Your old account will soon be retired. Sign in with <new provider> from now on." (wording is a proposal: plain, calm, never the person's fault); (b) mid-swap profile line: "Switching to Microsoft. Keep signing in with Microsoft."; (c) paused state keeps "our problem, your old login works as normal", no count; (d) finish state: "You now sign in with Microsoft. Google no longer signs you in."; (e) after retirement the existing "you moved from <old> to <new>" nudge stays. The count (N of 5) stays in the support/admin view only, and 5 stays a configuration value. **Supersedes:** the visible N of 5 profile line (27 Oct entry, CL-D10), CL-D14 (markers), CL-D15 as a person-facing 0 of 5 screen, CL-D11 person-facing use of the value, the CL-D16 nudge wording, and the 0, 2 and 4 of 5 frames. CL-D4, CL-D5 and CL-D9 stand.

## Open questions (owner picks)

- **CL-O1** (answered 31 Oct: no Me page, see CL-D44). Is the Me page the right place for the row, or Settings? If wrong: A wrong guess moves one row.
- **CL-O2.** Does the proving sign-in count as the first of the 5? If wrong: Drawn as no. If yes, the swap finishes one sign-in sooner. Now visible to support only (CL-D40); the person never sees a count.
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
- **CL-O18** Is the transition-only nudge (CL-D40) too strong, or too soft, without a number? It says "soon" and never a date. If wrong: Wording only. Drawn calm; a harder line could read as a threat.

## Recovery: Re-invite, admin only (owner, voice, 27 October 2026; section 7 of the page)

Owner: nobody signs up without an invite, so a signed-out person trying a different provider with no invite is refused and no empty account is made (CL-D23). Change login method works only while signed in (CL-D24). Recovery is a re-invite, admin only: on the person's existing row in the members list an admin taps Re-invite (CL-D25); Kitchie creates a one-time invite tied to that member; the person opens it, signs in with whatever login they have now, and that identity attaches to the same member, history, meals and notes staying (CL-D26). One tap, no passwords or resets, admins never see the email (CL-D27). Never merge, never link by email, refuse plainly if the identity belongs to another member (CL-D28). The old login is replaced at the moment the new one attaches, atomically (CL-D29).

Screens (7a to 7f, phone and desktop, light and dark): the members list with Re-invite on a row (admin) and without it (member); confirm then share; the invite landing page with errors (used, expired, withdrawn or replaced, login belongs to someone else) and the unknown-login refusal on the sign-in page; the pending row with Re-send and Withdraw, and the expired row; completion for the person, the admin row afterwards, and the History line "Re-invited by <admin>"; a table of every invite state.

Proposals: 7-day expiry as a config value, one pending re-invite per member, and the History note (the three the owner asked to be marked), plus CL-D33 to CL-D39. Open: CL-O10 to CL-O17. The link is a bearer secret (CL-O10) and an admin could use it to take over a member (CL-O11); these are the two to read first. Mockup only: the schema is reserved until the owner's explicit go.

## Owner decision, 31 October 2026: no count shown to the person (CL-D40)

Arjan, typed: the person must not be told how many sign-ins they have left. Removed from every person-facing screen: the "N of 5" line, the five-tick row, "5th sign-in" and "Your 2 sign-ins are kept". Added: a transition-only nudge on an old-login sign-in ("Temporary: this login is available during the transition only. Your old account will soon be retired. Sign in with Microsoft from now on."), a plain mid-swap line, a count-free paused state, and a finish state "You now sign in with Microsoft. Google no longer signs you in." The count stays in the support/admin view; 5 stays a configuration value. Superseded: the visible N of 5 profile line from the 27 Oct entry, CL-D14, the person-facing part of CL-D15 and CL-D11, the CL-D16 wording. Open question CL-O2 now affects support only; CL-O18 added.

## Owner decisions, 31 October 2026 (voice): Menu and Profile layouts (L1 to L4 of the page)

Rule: a mockup of an existing screen starts from what UAT shows, then adds the feature. Drawn from the owner's UAT screenshots (person Brown Bogan, kitchen UAT Kitchen, role Supply Runner): desktop Profile (numbered rail 1 to 6, Kitchen role, AI assistants "Connected through sign-in", My invites) and the phone Menu (search, pinnable Text size and theme, a profile card, assistants list, Household row). The earlier Me page on the phone was wrong and is replaced (section 1 of the old page is gone; L1 to L4 take its place). The screenshots were relayed to the builder as text and not re-read; nothing checked against the running app.

- **CL-D41** (Owner). Desktop Profile order: Kitchen role, My invites, AI assistants, Sign-in last. Sign-in is one row: key icon, provider logo, current login, chevron into Change login method.
- **CL-D42** (Owner). Phone Menu: critical information stays visible read only; deep things nest. Text size and theme stay pinnable blocks.
- **CL-D43** (Owner). The Menu profile card is replaced by a read-only summary with no person name (no avatar, no role pill): kitchen and role; the default AI assistant (the only one, or the chosen one); sign-in as key icon plus provider logo. Nothing tappable. While a swap is in progress, a small dot on the key. **Superseded in part by CL-D56 (31 Oct):** the assistant and sign-in method moved to the right of the person row; whether the summary stays (kitchen and role only) is open, CL-O24.
- **CL-D44** (Owner). A row labelled with the person's own name (not "Me"), the level-two entry to the person's own screen (kitchen role, My invites, AI assistants, Sign-in with chevron into Change login method), same order as desktop. Icon is the role icon (basket for Supply Runner), not an avatar.
- **CL-D45** (Owner). Label rule, 10 characters, spaces count: full name if 10 or fewer; else first name if 10 or fewer; else initials of every name part. Row starts at the same left edge as Household.
- **CL-D46** (Proposal). The Household row stays as its own row next to the person row (owner did not say replace or next to). CL-O19.
- **CL-D47** (Proposal). Summary heading "At a glance" (working name) with a "Read only" hint; a description list, not links; none connected reads "None connected".
- **CL-D48** (Proposal). Swap dot: top right of the key, accent fill with a ring, hidden text; the person screen's Sign-in row also says "Switching to Microsoft".
- **CL-D49** (Proposal). Key plus logo is one image with the name "Signed in with Google" (plus ". Sign-in change in progress" mid-swap).
- **CL-D50** (Proposal). Largest text size: label wraps, row grows, no ellipsis; full name is the screen title. Drawn at 1.6 times (real scale not seen) for "Sam Jacobs" and "Maximilian" at 360.
- **CL-D51** (Proposal). Change login method is its own screen from the Sign-in row; holds current login, status line and one row "Choose a new login". Picker, status, nudge links and failures live there. Replaces the Me page card (CL-D12).
- **CL-D52** (Proposal). The old-login nudge links to the Sign-in row; the "N of 5" counter stays removed (CL-D40).
- **CL-D53** (Proposal). Assistants move off the Menu into the person screen: phone keeps the UAT phone list (badge, star, link or unlink, dashed Add an assistant); desktop keeps the UAT cards.
- **CL-D54** (Proposal). Support view and Re-invite keep their screens; only the desktop rail is re-drawn (numbered, Household is 4).
- **CL-D55** (Proposal). Desktop frames drawn at 1280 (were 1040).

Label examples (computed by the rule): Ann Lee, Sam Jacobs (exactly 10) show in full; Brown Bogan (11) shows Brown; Mary Jane Watson shows Mary (first-name rule wins over initials); Christopher Lee shows CL; Bartholomew Jane Watson shows BJW; Bartholomew alone shows B.

Open: **CL-O19** replace or sit next to Household (drawn next to); **CL-O20** name-rule edges (one long name gives one letter, shared initials, hyphens, non-Latin); **CL-O21** where Sign out lives now; **CL-O22** heading wording and whether the dot suffices; **CL-O23** rail tab names after Profile are the mockup's, not read from UAT.

Checks: headless Chromium at 360, 390, 1280, light and dark: no sideways scroll, no page errors, controls 44px or more (text-size segments 44px at 360 after phone frames were made full width), no clipped text in the phone frames. Also fixed: section 3's first phone grid was missing its opening `<div class="cl-grid"><figure>` (existing bug). The senior-mobile-UX review is still not done.

## Owner decision, 31 October 2026 (voice): two read-only icons on the person row (CL-D56 to CL-D62, L2 of the page)

- **CL-D56** (Owner). The phone Menu's person row (role icon and name, 10-character budget, starting at Household's left edge) carries two read-only pieces of information on its right side, before the chevron, as simple icons with no labels: (a) the default AI assistant as a tiny round badge in the assistant's own colour matching the assistants list (orange C for Claude, green GPT for ChatGPT), or a dashed empty circle if none is set (like the unconnected Gemini); (b) the sign-in method as a small key icon with the provider logo (for example the Google G) in the accent brown, with a small dot on the key while a swap is in progress. Nothing in them is tappable on its own; tapping the row opens the person's screen. UI only, no functionality change; the Sign-in row is the only new thing and does nothing until the owner says go on the build.
- **CL-D57** (Proposal). No default assistant: dashed empty circle, muted, named "Default assistant: none".
- **CL-D58** (Proposal). Several assistants connected: only the chosen default is drawn (one badge). Connected but none chosen: CL-O26.
- **CL-D59** (Proposal). Email provider: no logo exists, so a generic envelope mark stands in the logo slot (same envelope as the pending Re-invite row), named "Signed in with Email".
- **CL-D60** (Proposal). Accessible names: one image role per icon ("Default assistant: ChatGPT", "Signed in with Google", plus ". Sign-in change in progress" mid-swap); inner shapes hidden; no focus stop, no button. The row link reads "Brown Default assistant: ChatGPT Signed in with Google" (checked in the browser). Extends CL-D49.
- **CL-D61** (Proposal). Largest text size (1.6 times, assumed): the label wraps (CL-D50), the icons grow by a quarter at most and stack in a column on the right; they never clip or overlap the label or chevron; row grows, 56px minimum.
- **CL-D62** (Proposal). Sizes: assistant badge 24px, key 24px with 20px logo; key and logo in the accent token.

Drawn: the row at 360 and 390, light and dark; every state (Claude, ChatGPT, none, several connected, swap dot, Email envelope); the accessible-name table; Variant A and Variant B of the Menu top, light and dark; largest text for "Sam Jacobs" and "Maximilian" including a worst case (no assistant, Email, swap dot). The L3 label examples now also carry the icons.

Caution: CL-D43 put these two facts in a summary section; the owner's latest words put them on the row. **CL-O24** (open): does the summary section stay? Variant A keeps it with kitchen and role only (no duplicate); Variant B removes it. Recommendation (Proposal): **Variant B**, since the summary would hold two lines the person screen already shows, B shortens the Menu and removes the "At a glance" wording question (CL-O22). PROPOSAL consequence of B: kitchen name and role are one tap away (person screen, Household screen) and CL-D47 is withdrawn. Consequence of A: CL-D47 stands narrowed to two rows; A is the only variant with the kitchen name always on the Menu.

Open: **CL-O24** summary section stays (A) or goes (B), recommend B; **CL-O25** icons have no labels: clear enough for a first-time person and at 24px for low vision; **CL-O26** several assistants connected and none chosen: nothing, first connected, or dashed circle. CL-O19 to CL-O23 stand.

Checks: headless Chromium at 360, 390 and 1280, light and dark: no sideways scroll, no page errors, controls 44px or more, icons not clipped and not overlapping at 1.6 times text, screenshots inspected. Not done: the senior-mobile-UX review; the real largest text scale; the real UAT Menu was not seen.

## Checks and loads

Headless Chromium at 360, 390 and 1280, light and dark: no sideways scroll, no page errors, controls 44px or more, no clipped text. The separate senior-mobile-UX review required by `AGENTS.md` is **not done**. Default path: theme, shared and `cl.css`; inline SVG marks; no request after load; one 12-line script scales the desktop frames (mockup only). The build lifts the `lm-` rules in `cl.css`.
