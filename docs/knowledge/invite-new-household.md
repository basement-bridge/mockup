# Invite someone to start their own household (growth)

Owner, by voice, 12 October 2026 (round 9, the same day, answers and a trim: INH-D7 to INH-D18 below). **Status: mockup only. Nothing is built.** The modal's title is now "Invite someone to a household of their own"; the gutter entry reads "Invite someone" ("My invites" once something has been sent). Older wording below ("Set someone up...") is what round 6 drew, kept for history; where it conflicts, the round 9 section wins. This is tracked separately from the settings rounds (SW-n in `settings-window.md`); it has its own numbers here: **INH-D** an owner decision, **INH-J** a judgement call the owner did not make, **INH-O** an open question. **Until this is built, current behaviour stays as it is** (see "What exists today").

## Framing (it matters)

This is a **growth / acquisition feature**: a way to expand the product by getting new households set up, one invitation at a time. It is not a utility tweak to the invite screen. The design pushes on three things a utility screen would not: it is an entry that is always one look away (the foot of the left gutter), it asks the inviter for a personal message because a warm note from someone the recipient knows is what makes a stranger open a link, and it carries that message into sign-up so the recipient arrives to a person, not a product page.

## What the owner asked for (12 October 2026)

- **INH-D1.** An entry at the **bottom of the left gutter** of the desktop main menu / settings window.
- **INH-D2.** It lets a member invite someone who is **not joining their household**, but getting a brand-new household of their own. A shareable invitation link that lands the recipient on **sign-up**, ending in them creating their own household (like the shopper link's invitation shape, but landing on account creation, not a shopping list).
- **INH-D3.** It opens as a **pop-up modal** that gives the user all the attention while they work it out. Not a side panel, not an inline flyout.
- **INH-D4.** A field for a **personalised message**. The message stays attached to the invitation link; when the invited person opens the link and goes through sign-up, the message is **visible to them during the flow**.
- **INH-D5.** Unmistakably labelled as "set someone up with their OWN household", clearly distinct from the existing "invite someone to MY household" (joining) flow, with an **easy route from the modal back to the existing invite-to-my-household place** for people who land on the wrong one. The existing join invite is linked to, not redrawn.
- **INH-D6.** Draw: the gutter entry, the modal (empty, filled, link created, copied), the recipient sign-up view showing the message, the way back, and a mobile-width check.

## What exists today (found, so it is not drawn twice, and not silently replaced)

This is the honest part: **a thinner version of "invite someone to start their own household" already exists**, and the new feature builds on it rather than appearing from nothing.

- **uat (Kitchie, read-only, 12 Oct 2026):** `server/src/people-pages.ts`, the Me page, row group "Other households": "Invite someone to a different household / They start their own new household" posts to `/invites` with `kind=own`. `server/src/invite-landing.ts` has an "own" landing ("Your kitchen. Now your AI knows what's in it", the inviter's name as "<name>'s kitchen is in order. Now it's your turn."). Its privacy notes already say: invite links work once and expire after 48 hours; the inviter won't be a member and can't see the new kitchen's items. Platform mode adds a six-digit code (issue #322) with failed-guess limits (`invite-limits.ts`). There is **no personal message**, and nothing in the gutter.
- **This mockup repo:** the phone flow has the same row and sheet (`flows/household/app.js`, sheet `invite2`: "Invite to start a new household", a six-digit code, Copy code, Copy link, works once, 24 hours, at most 3 unused codes; recorded in `people-settings.md`, "Invite codes", 8 Oct 2026). The desktop profile window had the Me row "Other households" that only toasted.
- **The invite to MY household (joining)**, the one the modal's way back points at: uat `people-pages.ts`, the Household page, "Invite someone" (`kind=join`); in this mockup `flows/household/index.html` (Menu, Household, **Invite someone**, sheet `invite`) and, in the window, **Household > Invite someone** (`fragments/desktop-profile/index.html?open=household`). Not redrawn.

What this mockup changes, only as a drawing: the Me row "Other households" now opens the new modal (so the window has one place for this), and the gutter has a new entry. Nothing else about today's behaviour is touched.

## Round 9: the owner's answers and the trim (12 October 2026, by voice)

Recorded as decisions, continuing the INH-D series. Nothing here is built; everything is drawn in the mockup.

- **INH-D7. The link is single use, and is consumed the moment the invited person COMPLETES sign-up.** Opening the link does not use it up (they can open it again, look, come back). Drawn: the Link ready screen says "Works once. Opening it does not use it up; finishing sign-up does." and the recipient's "What you should know".
- **INH-D8. The link expires automatically ONE MONTH after it was sent, if unused.** Drawn in the list (Pending, "Expires 3 Nov") and on the recipient side (the expired landing, "What you should know"). **It is deliberately not shown on the Link ready screen** (owner: "don't show anything about the expires"). **Difference from uat, and what the build must change:** uat's thinner `kind=own` invite is single use and expires after **48 hours** (`invite-landing.ts` privacy notes, issue #322 codes have their own limits). The owner chose a month for this feature, so the build must give `kind=own` a one-month expiry (and say so on its landing), and must consume the link at the end of sign-up (household created), not when the landing is opened. The six-digit code sheet in the phone flow (24 hours) is a different thing and is untouched.
- **INH-D9. Message length: not decided this round.** Left as drafted (optional, 280 characters, plain text) and **still open as INH-O3**.
- **INH-D10. What the inviter sees afterwards: a LIST OF INVITES they have sent, each with a status: Pending, Used or Expired.** There is **no "Withdrawn"** because the mockup has no way to withdraw an own-household invite (the join invite's Cancel in Household "Waiting to join" is a different flow); if withdrawing is ever added, a fourth status joins the list. Each row shows the first lines of the message (or "No message"), when it was sent and when it expires or was used. Names are never shown (INH-J7: the product does not know who it was for). Pending rows have a Copy link button (sample).
- **INH-D11. One dual-purpose entry.** The SAME gutter entry reads **"Invite someone"** until the person has sent at least one invite (any status), then **"My invites"**. Never sent: pressing it opens the send form (empty). Sent: it opens My invites, with **"Send a new invite"** there too. The fuller "Invite someone to set up their own household" is the tooltip on the gutter entry and the second line of the Me row ("Invite someone" / "to set up their own household"; "My invites" / "Invites you have sent, and where they stand"). Applies to desktop and, following the existing scoping (SW-4, INH-J3), to phone and tablet through the **Me row** (no gutter there). The Me row's old name "Other households" is gone. Creating a link flips the label live (the person has now sent one).
- **INH-D12. At most THREE outstanding invites per person.** Outstanding means unused and unexpired. A slot frees when one is used or expires. Drawn: with three pending, "Send a new invite" is **disabled** and the plain line above the list says "You have 3 invites pending, the most at one time. You can send another when one is used or expires. The next to free a slot is the one sent 20 Sep, which expires 20 Oct." Each pending row says when it frees ("Frees a slot when used, or when it expires on 9 Nov"). With fewer than three, a quiet "1 of 3 pending" line instead. The build rule: enforce the cap on the server, not only by disabling the button. (INH-O5's other parts, daily cap, report route, message retention, stay open.)
- **INH-D13. No relationship between the inviter and the new household afterwards.** A clean handoff: no ongoing link, no visibility, no "invited by". A Used status is only a historical record ("Used is a record only. It does not link you to their household."): no household name, nothing that opens it. Resolves INH-O6.
- **INH-D14. The icon is a paper plane, a "send" icon like a messaging app, not an envelope.** On the gutter entry, the Me row (which used to be an envelope), the modal header, "Create their link" and "Send a new invite".
- **INH-D15. The modal top is trimmed.** Title exactly "Invite someone to a household of their own". Directly under it ONE line: "They get their own brand new household". Every other top paragraph is gone, including the kicker, the filled "Their own household / Not joining Our kitchen" pill, the sentence on what they get, the two-households picture, and any line about the inviter not being a member (owner: no need). It goes straight from title and one-liner to the personal message field and the send button. The gutter-entry label is the shorter one (INH-D11).
- **INH-D16. The way back is a LOW-KEY SINGLE PLAIN LINE, not a card:** "Want to invite them to your household instead? Click here". It takes you to the existing invite-to-my-household (join) flow, exactly as before (closes the modal, moves the window to Household, points at the existing Invite someone button). Not redrawn. It sits under the message field, and again under a made link.
- **INH-D17. Link ready copy.** It says the link works once. It says nothing about expiry and nothing about the inviter not being a member. The Copied state matches ("Copied. Paste it into a message to them.").
- **INH-D18. The recipient sign-up view, with the inviter's message next to the sign-up button.** See "The recipient side" below: message present, no message, expired link, used link; the personal note sits directly above the sign-up button.

- **INH-D19. The recipient landing reuses the real own-household page's copy (round 10).** Prior art: kitchie `uat` `server/src/invite-landing.ts` already has a `kind: "own"` variant. Its wording is now used on `start.html?s=landing`: "Arjan's kitchen is in order. Now it's your turn.", "Your kitchen. Now your AI knows what's in it.", "You can drive Kitchie on the web, or with your favourite AI.", button "Start my kitchen", "Free while we're building Kitchie. No name or email needed.", "Your kitchen starts empty... won't be a member and can't see your items." The real page has no personal message; the note card above the button is the one new element (INH-D18). The old Google-specific button text and the "Jane's got her own kitchen going" wording from kitchie-mockup were not available to read (repo not reachable from this session), so they are not used. The modal one-liner was already only "They get their own brand new household" (INH-D15); no change.

### INH-O items, after round 9

- **INH-O1 resolved** (single use, consumed at sign-up completion, one month; INH-D7, D8). Still not drawn: whether an inviter can extend or cancel a link; the expired and used landings are drawn (below).
- **INH-O2 resolved** by INH-D7: one person, once. A multi-use link stays out.
- **INH-O3 still OPEN** (message length). Also still open inside it: editable after the link exists (drawn: no), links and contact details, language limits.
- **INH-O4 resolved** (the list with statuses; INH-D10). Notifications when one is used, and a count of people set up, are not drawn.
- **INH-O5 partly resolved:** the cap of three outstanding (INH-D12). Still open: a daily cap, a report route on the landing, whether messages are checked, how long a message is kept and when it is deleted.
- **INH-O6 resolved** (none; INH-D13).
- **INH-O9 resolved as drawn:** the one entry is dual-purpose on desktop (gutter) and reached through the Me row on phone and tablet; the Me row is also present in the window on desktop and opens the same thing.
- **INH-O13 partly resolved:** expired and already-used links are drawn. Still open: cancelled, wrong browser, sign-in refused.
- **Still open and untouched:** INH-O7, O8, O10, O11, O12.

### Judgement calls added in round 9 (INH-J, the owner did not decide these)

- **INH-J11. No "Withdrawn" status** (the mockup has no withdrawing). See INH-D10.
- **INH-J12. Rows are identified by their message, not a name,** and show "No message" when it was empty (INH-J7 stands).
- **INH-J13. Statuses use a word and an icon, never colour alone:** Pending (clock, accent outline), Used (tick, sage outline), Expired (hourglass, muted). Expired rows are dimmed.
- **INH-J14. Newest sent first.** Not by status.
- **INH-J15. Cancel on the send form goes back to My invites** once something has been sent (it closes the modal when nothing has). Done on a made link closes it.
- **INH-J16. After "Link ready", "Make another link"** is offered if a slot is free, otherwise "My invites".
- **INH-J17. Opening the entry after a link was made in the same sitting** keeps showing that link (going to the way back and returning costs nothing, as before), then the list.
- **INH-J18. Dates are sample text** ("3 Oct", "Expires 3 Nov"): today is 12 Oct 2026 in the drawing, so a link made now expires 12 Nov. The product's date format is for the build.
- **INH-J19. The expired and used landings** (recipient side) say plainly what happened and to ask the inviter for a new link. Used also offers "Sign in with Google" (in case it was them); expired offers a quiet "Go to Kitchie". The inviter's note is not shown on them.
- **INH-J20. INH-J1 and INH-J5 are superseded** (label and 48 hours). INH-J2 (the entry sits directly above History) and INH-J3 (no strip entry on phone and tablet) stand.
- **INH-J21. The mockup-only switches** in the modal's footer (Show: Empty, Filled, Link ready, Copied, My invites, At 3; Invites sent so far: None, Some, 3 pending) are drawing aids, hidden at phone widths (use the addresses). Choosing "Invites sent so far" re-seeds the sample list.

## What round 6 drew (kept for history; round 9 above changes the label, the top of the modal, the way back, the link copy and the recipient copy)

Code: `fragments/desktop-profile/invite.js` and `invite.css` (the modal; fetched only when the entry is pressed), the gutter entry in `profile.js` and `profile.css`, the recipient side in `fragments/invite-new-household/start.html` (`start.js`, `start.css`). Notes page: `fragments/invite-new-household/index.html`.

- **The gutter entry.** The last button in the left gutter, above History: a dashed outline with a sprout icon, "Set someone up" and under it "with their own household". Dashed on purpose: it reads as a different kind of thing from the sections above it. Not drawn in the phone and tablet strip (no gutter there, SW-4); on those widths the Me row opens the same modal.
- **The modal** (own scrim over the whole window, the window behind inert, focus trapped, close with the x, the close chord, Cancel or a click on the scrim). Top to bottom: a kicker "A household of their own"; the title "Set someone up with their own household"; a filled pill "Their own household" with "Not joining Our kitchen"; one sentence on what they get; a small picture of two separate households with "not joined" between them (Our kitchen with four people, theirs brand new and empty); the **way back** card ("Want them in Our kitchen, sharing your pantry and list? That is a different invite: it adds them to your household." with the button "Invite someone to Our kitchen"); the message field with a counter; the buttons Cancel and "Create their link".
- **States** (`inv=` in the address, and a mockup-only switch in the modal's footer): `empty`, `filled`, `created` (link ready: the sample link, Copy link, what they will see next to the sign-up button, "works once, expires after 48 hours", "they get their own household, you are not a member of it and cannot see its items", the way back again), `copied` (the button says Copied and a line says "Paste it into a message to them"). From a created link: Make another link, or Done.
- **The way back.** The card above (and again under a created link). It closes the modal, moves the window to **Household**, points at the existing **Invite someone** button (a short flash and focus) and says what it is. What the person typed is kept, so going back and forth costs nothing.
- **The recipient side.** `start.html?s=landing`: "Your kitchen. Now your AI knows what's in it." (the real page's own-household copy, INH-D19), the personal message in a note card with the inviter's initial and "A note from Arjan, written for you", then "Start my kitchen" and what to know (works once, a month, the inviter is not a member and cannot see their items). `?s=household`: after Google sign-in, "Your very own kitchen", the **same message still visible** (compact), a household name field and "Create my household". `&msg=none` is the same page when the inviter wrote nothing (no note card, nothing else changes). `&m=<text>` shows any message (the modal's "See their sign-up screen" link passes what was typed). The message is set as text, never as markup.
- **Mobile width.** The modal is full width at 360 and 390 (the picture stacks, buttons fill the width, the body scrolls, nothing scrolls sideways); the recipient side is a single column.

## Judgement calls (INH-J, the owner has not decided these)

- **INH-J1. The label.** "Set someone up with their own household" in the modal, "Set someone up / with their own household" in the gutter. The owner's phrase was "set someone up with their OWN household"; the word set up is also what the existing own-kind landing says ("Arjan set you up with a kitchen of your own").
- **INH-J2. Where in the gutter.** Directly above History, so History stays right above the keys line (SW-19).
- **INH-J3. Phone and tablet.** No gutter there, so no entry in the strip; the Me row "Other households" opens the modal instead. The built phone flow is untouched.
- **INH-J4. The message is optional and capped at 280 characters.** Plain text only.
- **INH-J5. Once, 48 hours.** Taken from uat's invite links (work once, expire after 48 hours) and the shopper link's 48 hours. The mockup's older six-digit code sheet says 24 hours; see INH-O1.
- **INH-J6. The sample link is `kitchie.example/start/sample-link`**, never a real address or token. Nothing is copied or sent.
- **INH-J7. No "who is it for" field.** The inviter writes the name into the message if they want ("Hi Priya"); the product never learns the recipient's name (uat's landing says it doesn't know names).
- **INH-J8. Any member can use it,** as any member can invite today.
- **INH-J9. The sign-up ends at "Create my household".** The existing own flow ends on a welcome ("Your very own kitchen... Zero peer pressure"); this keeps that and adds the household name field.
- **INH-J10. The message is shown on the landing and on the last sign-up step, not after the household exists.**

## Open questions (INH-O). Round 9 resolved O1, O2, O4, O6 and O9, and part of O5 and O13: see "INH-O items, after round 9" above. The list below is as first written.

- **INH-O1. Link expiry and reuse.** (RESOLVED in round 9.) 48 hours, once (drawn: uat's invite links, shopper link). The six-digit codes are 24 hours and the code sheet in this mockup says so. Which is right for a link that carries a personal message? Can the inviter extend a link, or cancel it? What does the recipient see when it has expired or was used (drawn: nothing; uat has one neutral message for codes)?
- **INH-O2. One-time or multi-use.** (RESOLVED in round 9.) Drawn: one person, once. A multi-use link (post it in a group chat) is a different growth shape and would carry one message to many strangers. Wanted?
- **INH-O3. The message.** (STILL OPEN (length not decided in round 9).) Length (280 drawn), optional or required (optional drawn), editable after the link exists (drawn: no, make another), plain text only (drawn), links and contact details stripped or allowed, any language limits.
- **INH-O4. What the inviter sees afterwards.** (RESOLVED in round 9.) Drawn: nothing after Done. Options: the link listed under Household's "Waiting to join" like a join invite (uat lists "Invite to a new household" there already, with a Cancel), a notice when it is used, a count of people they set up, or nothing (the new household is private).
- **INH-O5. Abuse and rate limits.** (PARTLY resolved in round 9 (cap of three).) The message is the inviter's words, shown to a stranger on a page from our domain: spam, harassment and phishing links are possible. Needed: a cap on unused links per person (3 unused codes today), a daily cap, a report route on the landing, whether messages are checked, how long the message is kept (it is personal data: a name and a note) and when it is deleted (when the link expires or is used?). The failed-guess limiter in uat is for codes, not links.
- **INH-O6. Any relationship between inviter and the new household.** (RESOLVED in round 9.) uat says none (not a member, cannot see items). Anything lasting: "invited by", sharing recipes later, being offered a join invite, a thank-you, a referral measure for growth?
- **INH-O7. Link or code, Kitchie sign-in or platform sign-in.** Platform mode uses a six-digit code (issue #322); Kitchie's own sign-in uses links. Does this link carry the code, and does the landing differ by mode?
- **INH-O8. The inviter's name on the landing.** uat shows the inviter's display name. Is it always shown, and can the inviter hide it?
- **INH-O9. One entry or two.** (RESOLVED in round 9.) The Me row "Other households" and the gutter entry now open the same modal in this drawing. In the built app should the Me row go, stay, or only exist where there is no gutter?
- **INH-O10. The reverse wrong-place route.** The way back goes from "own household" to "my household". Should the join invite (Household > Invite someone) also say "Setting someone up with their own instead? Go here"?
- **INH-O11. Who sees the entry.** Every member, always (drawn). Or only after a few days of use, or founding member and admins?
- **INH-O12. Growth measures.** Not drawn: no counts, no funnel. Which events matter (link made, opened, signed in, household created) is for a later decision.
- **INH-O13. (PARTLY resolved in round 9 (expired, used drawn).)** Link problems on the recipient side** (used, expired, cancelled, wrong browser, sign-in refused). Not drawn.

## The recipient side (round 9)

`fragments/invite-new-household/start.html` (`start.js`, `start.css`), one small page.

- **Reused vs redrawn.** The owner recalled prior art from 10 Oct 2026 in the older `kitchie-mockup` repo (an invite landing with a toggle between "Join a household" and "Start your own", copy like "Jane's got her own kitchen going, start yours"). **I could not read it:** this session's GitHub access is limited to its configured repositories and `basement-bridge/kitchie-mockup` and `neotechmonk/kitchie-mockup` both refused (not found or no access, also through `add_repo`), and the GitHub Pages addresses did not load from the sandbox. So nothing was reused from it and the copy "Jane's got her own kitchen going" is not used. What exists was kept: round 6's own landing and last-step page in this repo (the personal note card, "Start my kitchen with Google", the household name step), and the existing uat own-kind landing wording ("Your kitchen. Now your AI knows what's in it"; "<name>'s kitchen is in order. Now it's your turn."). A reviewer with access to `kitchie-mockup` should compare and reconcile (its join-or-start toggle would be a small addition here: this fragment is only the start-your-own side).
- **Changed:** the personal note now sits directly above the sign-up button (the line about what Kitchie is moved above it); "What you should know" says "This link works once. It is used up when you finish signing up, not when you open it." and "It stops working a month after it was sent." (it said 48 hours); two new frames for a link that has ended.
- **Frames:** the link opens with a message, with none, after sign-in, expired, already used (table below). `&m=` takes any message text.

## Frames

Local (serve the folder with `python3 -m http.server`), on `https://basement-bridge.github.io/mockup/` once published. The desktop frames are best at 1280 wide; phone and tablet: open the same addresses at 360, 390 or 768 (the Me row is the route there, no gutter).

| Frame | Address (under `fragments/`) |
| --- | --- |
| Gutter entry, never sent: "Invite someone" | `desktop-profile/index.html?open=me` |
| Gutter entry, sent something: "My invites" | `desktop-profile/index.html?open=me&invs=some` |
| Modal, empty (trimmed) | `desktop-profile/index.html?open=invite&inv=empty` |
| Modal, filled | `desktop-profile/index.html?open=invite&inv=filled` |
| Modal, link ready (works once, nothing about expiry) | `desktop-profile/index.html?open=invite&inv=created` |
| Modal, copied | `desktop-profile/index.html?open=invite&inv=copied` |
| My invites, mixed statuses | `desktop-profile/index.html?open=invite&inv=list` |
| My invites, three pending, send disabled | `desktop-profile/index.html?open=invite&inv=limit` |
| Me row with the gutter-less label (phone, tablet), never sent / sent | `desktop-profile/index.html?open=me` at 390, and `...?open=me&invs=some` at 390 |
| The way back, where it lands | `desktop-profile/index.html?open=household` (press Click here in a modal frame to see it arrive) |
| Recipient, the link opens, with the message | `invite-new-household/start.html?s=landing` |
| Recipient, no message | `invite-new-household/start.html?s=landing&msg=none` |
| Recipient, after sign-in | `invite-new-household/start.html?s=household` |
| Recipient, link expired | `invite-new-household/start.html?s=expired` |
| Recipient, link already used | `invite-new-household/start.html?s=used` |
| Notes page | `invite-new-household/index.html` |
| The existing join invite (not redrawn) | `../flows/household/index.html` (Menu, Household, Invite someone) |

## Loads (DESIGN.md section 6)

Default path of the window: one button in the gutter (a few hundred bytes of markup, about 700 bytes of CSS) and a few helper lines in `profile.js` for the label and the paper-plane icon. The modal's script (about 14 KB) and styles (about 5 KB) are fetched the first time the entry is pressed, not on page load; the sample invites are in that script. The recipient page is its own small page: theme tokens, one CSS file, one script, no images, no libraries, no storage.
