# Removed members: a week to undo, then erased

**Status: mockup only, nothing built.** Kitchie issue #85 (label `approved for build`). Mockup in `fragments/removed-members/` (`app.html` phone, `desktop.html` the Profile window, `index.html` the notes page), check `tools/removed-members-check.mjs`. The look is the built Household page (`server/src/people-pages.ts`: `.pm .mtop .mbody .menu.card .mrow .who2 .av.sm .sub .chip .dz .stack .btn .note .adm .admbox`), so it matches Household members and admins (SW-85 to SW-92, `settings-window.md`) and the #82 danger-zone flow. Lines marked **Proposal** are the mockup's own choices; the owner has not approved them.

## What the owner said

Typed, 1 October 2026 (issue #85): a removed member can be restored for up to a week. If nobody acts, they are gone completely, like a "delete my account" under European rules: their data and the journal's link to them are erased, and any activity they did that must stay in the transaction log is anonymised.

Comment on the issue, 1 October 2026: "Former member is all we need there's no need for any other follow-ups identification any of that."

## Decisions

Owner's words:
- **RM-D1** A removed member can be restored for up to a week.
- **RM-D2** If nobody acts they are gone completely: data and the journal's link erased, activity that must stay in the transaction log anonymised.
- **RM-D3** History says "a former member" after the erase and nothing more identifying (answers issue question 3).
- **RM-D4** The removed person gets no notice and nothing else follows ("no need for any other follow-ups"). This reads the comment as the answer to issue question 4; the owner did not say "no notice" in those words.

From the issue's proposal, carried as written (the issue is labelled `approved for build`; the owner has not restated each point in words):
- **RM-B1** Removal (the #82 danger-zone flow) sets `members.removed_at` and ends sessions, the assistant link and invites at once.
- **RM-B2** The person leaves the member list and appears under a "Removed, can be restored until <date>" line with a Restore button.
- **RM-B3** Restore needs a new sign-in (sessions stay ended) and puts them back with the same name.
- **RM-B4** After 7 days a purge runs, on app start and hourly while running. It deletes the member row (sub, name), sessions, assistant link, their invites, join events, notices that name them and removal records that name them.
- **RM-B5** Journal rows they wrote keep the item and the change but lose `member_id` and any name in `note`. This needs one narrow, audited exception to the append-only trigger: an UPDATE is allowed only when only those two columns change and a session flag set by the purge is on (RM-Q1).
- **RM-B6** The window is exactly 7 days from removal and is shown on the household page. A member removing themselves, and leaving, are out of scope. Restore and erase-now are signed-in, same-origin, household-scoped writes; rate limits are unchanged.

## What the mockup draws

Phone (390 and 360) and the desktop Profile window (1280), light and dark. The desktop window shows the same page as its pane, because the built page is linked through into the window (SW-22), so each state exists once and is seen in both frames.

- **Household with someone held.** Members list (current members only), then a Removed card, then Invite someone and the Danger zone. Each held row: name, "Arjan removed Sam on Wed 14 Oct.", "Can be restored until Wed 21 Oct, 9:15 am · 3 days left", a Restore button. A line under the card says the week and that what they added stays as "a former member". Not drawn when nobody is held.
- **Restore, in place.** The same `<details class="adm">` box as Make admin: "Restore Sam?", one sentence (same name, has to sign in again, nothing else is sent), one button. Result: Sam is in Members with "Has to sign in again" and a note at the top.
- **Remove confirm page.** Cancel first (as the built confirm pages), three facts (now, the week and its exact end, the erase), then the typed name. A wrong name changes nothing and says "Nothing changed: the name typed did not match."; case and spaces are ignored. After a removal the note gives the deadline and the person is in the Removed card with 7 days left.
- **Danger zone.** As built (a Remove button per other member, only when someone else is in the household), with one sentence about the 7 days.
- **History after an erase.** "by a former member" in place of the name, item and change kept.
- **Option, off by default:** Erase now on each held row and a typed-name page.

Not drawn: the household name editor, admin buttons, invites (unchanged); the sign-in screen of a removed person (unchanged: not a member); a message of any kind to the removed person or the household.

## Proposals (the mockup's own; none approved)

- **RM-P1** One Removed card, under Members and above Invite someone, drawn only while someone is held (the #82 rule: no empty headings). It replaces today's Removals card: a removal record that names someone is erased with them (RM-B4), and the held row carries the same "Arjan removed Sam on <date>." line.
- **RM-P2** Row wording and countdown as above. Whole days while two or more are left, then "1 day left", hours, "1 hour left", "Less than an hour left". The last 24 hours read in the danger colour.
- **RM-P3** Restore asks first, in place, as Make admin does (SW-86). Why: it hands someone access back. Cost of a wrong guess: one extra tap.
- **RM-P4** A restored person is an ordinary member even if they were an admin (RM-Q4).
- **RM-P5** A restored member reads "Has to sign in again" until they have a live session. Derived from sessions; a build that prefers no new line can drop it.
- **RM-P6** Held rows are ordered by who is erased soonest.
- **RM-P7** Whoever may remove may restore (follows SW-O63: standalone Kitchie any member, Platform admins only).
- **RM-P8** At the 7-day mark Restore is refused and the row is hidden even if the hourly purge has not run, so the page and the server agree to the minute. The purge then erases within the hour.
- **RM-P9** The remove page says the week, its exact end and what the erase covers before the name is typed.
- **RM-P10** History says "by a former member" in the place of the name; every erased person reads the same (RM-D3).
- **RM-P11** Nothing tells the household when an erase happens and nothing is logged (RM-D4).
- **RM-P12** Erase now is drawn as an option, off in the default frames (`?erase=1`).
- **RM-P13** Times are shown in the household's time, "Wed 21 Oct, 9:15 am".

## Open questions (each with a recommended position)

- **RM-Q1** Approve the narrow journal exception (RM-B5)? It changes a protected rule. **Recommend yes,** exactly as the issue wrote it. A wrong no: the purge cannot anonymise, so either the link to the person stays or journal rows are deleted and stock history is lost. The `approved for build` label is not read as this approval.
- **RM-Q2** Erase now instead of waiting (issue question 2)? **Recommend not in version 1:** a second irreversible path and the week already meets the ask. A wrong no costs a household up to a week when someone asks to be erased at once. It is drawn so it can be added.
- **RM-Q3** A held person redeems a new invite. **Recommend it restores the same member** (hold cleared, same name, no second row). A wrong guess either blocks a deliberate re-invite for a week or creates a second row for one sign-in.
- **RM-Q4** Restored as an admin if they were one? **Recommend no;** giving household-wide rights back is a separate, deliberate step (SW-85).
- **RM-Q5** Who may restore? **Recommend the same people who may remove** (RM-P7); open with SW-O63.
- **RM-Q6** The one-time scrub of old "by Name" notes written before #84 uses the same exception. **Recommend a separate migration step after RM-Q1;** not drawn.

## Mockup and build stay close

Markup and class names are the built Household page's; new are `#removed`, `.mrow.held` (`.two` only with Erase now), `.sub.soon` and the confirm page's `ul.facts`. Every button is a link or a form post in the build (`POST /household/members/restore` beside the existing remove, `POST /household/members/erase` only if RM-Q2 says yes), no script, the confirm is a `<details>`. It reads `members.removed_at`. The mockup's script (`removed.js`) only moves sample data between states and is never lifted. The sample clock is fixed (Sat 17 Oct 2026, 5:40 pm) so the frames read the same every day. Differences the builder will list in the PR: none expected beyond the above.

## Default path and deferred

The page loads `theme.css`, `removed.css` (about 8 KB) and `removed.js` (about 13 KB); no images, no libraries, no new request. The confirm, erase and History pages are drawn only when opened (each its own server page in the build). Desktop reuses the same two files.
