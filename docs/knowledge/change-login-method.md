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

## Checks and loads

Headless Chromium at 360, 390 and 1280, light and dark: no sideways scroll, no page errors, controls 44px or more, no clipped text. The separate senior-mobile-UX review required by `AGENTS.md` is **not done**. Default path: theme, shared and `cl.css`; inline SVG marks; no request after load; one 12-line script scales the desktop frames (mockup only). The build lifts the `lm-` rules in `cl.css`.
