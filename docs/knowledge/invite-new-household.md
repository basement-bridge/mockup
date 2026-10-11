# Invite someone to start their own household (growth)

Owner, by voice, 12 October 2026. **Status: mockup only. Nothing is built.** This is tracked separately from the settings rounds (SW-n in `settings-window.md`); it has its own numbers here: **INH-D** an owner decision, **INH-J** a judgement call the owner did not make, **INH-O** an open question. **Until this is built, current behaviour stays as it is** (see "What exists today").

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

## What is drawn

Code: `fragments/desktop-profile/invite.js` and `invite.css` (the modal; fetched only when the entry is pressed), the gutter entry in `profile.js` and `profile.css`, the recipient side in `fragments/invite-new-household/start.html` (`start.js`, `start.css`). Notes page: `fragments/invite-new-household/index.html`.

- **The gutter entry.** The last button in the left gutter, above History: a dashed outline with a sprout icon, "Set someone up" and under it "with their own household". Dashed on purpose: it reads as a different kind of thing from the sections above it. Not drawn in the phone and tablet strip (no gutter there, SW-4); on those widths the Me row opens the same modal.
- **The modal** (own scrim over the whole window, the window behind inert, focus trapped, close with the x, the close chord, Cancel or a click on the scrim). Top to bottom: a kicker "A household of their own"; the title "Set someone up with their own household"; a filled pill "Their own household" with "Not joining Our kitchen"; one sentence on what they get; a small picture of two separate households with "not joined" between them (Our kitchen with four people, theirs brand new and empty); the **way back** card ("Want them in Our kitchen, sharing your pantry and list? That is a different invite: it adds them to your household." with the button "Invite someone to Our kitchen"); the message field with a counter; the buttons Cancel and "Create their link".
- **States** (`inv=` in the address, and a mockup-only switch in the modal's footer): `empty`, `filled`, `created` (link ready: the sample link, Copy link, what they will see next to the sign-up button, "works once, expires after 48 hours", "they get their own household, you are not a member of it and cannot see its items", the way back again), `copied` (the button says Copied and a line says "Paste it into a message to them"). From a created link: Make another link, or Done.
- **The way back.** The card above (and again under a created link). It closes the modal, moves the window to **Household**, points at the existing **Invite someone** button (a short flash and focus) and says what it is. What the person typed is kept, so going back and forth costs nothing.
- **The recipient side.** `start.html?s=landing`: "Arjan set you up with a kitchen of your own", the personal message in a note card with the inviter's initial and "A note from Arjan, written for you", then "Start my kitchen with Google" and what to know (once, 48 hours, the inviter is not a member and cannot see their items). `?s=household`: after Google sign-in, "Your very own kitchen", the **same message still visible** (compact), a household name field and "Create my household". `&msg=none` is the same page when the inviter wrote nothing (no note card, nothing else changes). `&m=<text>` shows any message (the modal's "See their sign-up screen" link passes what was typed). The message is set as text, never as markup.
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

## Open questions (INH-O, none decided, nothing guessed silently)

- **INH-O1. Link expiry and reuse.** 48 hours, once (drawn: uat's invite links, shopper link). The six-digit codes are 24 hours and the code sheet in this mockup says so. Which is right for a link that carries a personal message? Can the inviter extend a link, or cancel it? What does the recipient see when it has expired or was used (drawn: nothing; uat has one neutral message for codes)?
- **INH-O2. One-time or multi-use.** Drawn: one person, once. A multi-use link (post it in a group chat) is a different growth shape and would carry one message to many strangers. Wanted?
- **INH-O3. The message.** Length (280 drawn), optional or required (optional drawn), editable after the link exists (drawn: no, make another), plain text only (drawn), links and contact details stripped or allowed, any language limits.
- **INH-O4. What the inviter sees afterwards.** Drawn: nothing after Done. Options: the link listed under Household's "Waiting to join" like a join invite (uat lists "Invite to a new household" there already, with a Cancel), a notice when it is used, a count of people they set up, or nothing (the new household is private).
- **INH-O5. Abuse and rate limits.** The message is the inviter's words, shown to a stranger on a page from our domain: spam, harassment and phishing links are possible. Needed: a cap on unused links per person (3 unused codes today), a daily cap, a report route on the landing, whether messages are checked, how long the message is kept (it is personal data: a name and a note) and when it is deleted (when the link expires or is used?). The failed-guess limiter in uat is for codes, not links.
- **INH-O6. Any relationship between inviter and the new household.** uat says none (not a member, cannot see items). Anything lasting: "invited by", sharing recipes later, being offered a join invite, a thank-you, a referral measure for growth?
- **INH-O7. Link or code, Kitchie sign-in or platform sign-in.** Platform mode uses a six-digit code (issue #322); Kitchie's own sign-in uses links. Does this link carry the code, and does the landing differ by mode?
- **INH-O8. The inviter's name on the landing.** uat shows the inviter's display name. Is it always shown, and can the inviter hide it?
- **INH-O9. One entry or two.** The Me row "Other households" and the gutter entry now open the same modal in this drawing. In the built app should the Me row go, stay, or only exist where there is no gutter?
- **INH-O10. The reverse wrong-place route.** The way back goes from "own household" to "my household". Should the join invite (Household > Invite someone) also say "Setting someone up with their own instead? Go here"?
- **INH-O11. Who sees the entry.** Every member, always (drawn). Or only after a few days of use, or founding member and admins?
- **INH-O12. Growth measures.** Not drawn: no counts, no funnel. Which events matter (link made, opened, signed in, household created) is for a later decision.
- **INH-O13. Link problems on the recipient side** (used, expired, cancelled, wrong browser, sign-in refused). Not drawn.

## Frames

Local (serve the folder with `python3 -m http.server`), on `https://basement-bridge.github.io/mockup/` once published. The desktop frames are best at 1280 wide; add `&inv=` to any `open=invite` address.

| Frame | Address |
| --- | --- |
| The gutter entry | `fragments/desktop-profile/index.html?open=me` (foot of the left gutter) |
| Modal, empty | `fragments/desktop-profile/index.html?open=invite&inv=empty` |
| Modal, filled | `fragments/desktop-profile/index.html?open=invite&inv=filled` |
| Modal, link created | `fragments/desktop-profile/index.html?open=invite&inv=created` |
| Modal, copied | `fragments/desktop-profile/index.html?open=invite&inv=copied` |
| The way back, where it lands | `fragments/desktop-profile/index.html?open=household` (press the way-back card in any modal frame to see it arrive) |
| Recipient, the link opens | `fragments/invite-new-household/start.html?s=landing` |
| Recipient, after sign-in | `fragments/invite-new-household/start.html?s=household` |
| Recipient, no message | `fragments/invite-new-household/start.html?s=landing&msg=none` |
| Notes page | `fragments/invite-new-household/index.html` |
| The existing join invite (not redrawn) | `flows/household/index.html` (Menu, Household, Invite someone) |

## Loads (DESIGN.md section 6)

Default path of the window: one new button in the gutter (a few hundred bytes of markup and about 700 bytes of CSS). The modal's script (about 9 KB) and styles (about 4 KB) are fetched the first time the entry is pressed, not on page load. The recipient page is its own small page: theme tokens, one CSS file, one script, no images, no libraries, no storage.
