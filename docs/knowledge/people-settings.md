# People settings: Me and Household

Status: mockup for the owner to review (8 Oct 2026). Not built in Kitchie. Source: owner's voice spec of 8 Oct 2026. Lines marked **Proposal** are choices the mockup made where the spec was silent; the owner has not approved them.

Code: `flows/household/app.js` (screens `me` and `household`, sheets `avatar`, `removing`, `leave`), `flows/household/styles.css` (end of file).

## What the owner asked for

Under Settings, People stops being a flat invite-link screen and splits in two: **Me** and **Household**.

**Me** (the person looking at it):
- change their name
- change their avatar
- manage their AI assistant link: one personal link per person, created and copied in one tap, revoked with a confirmation (see Settled simplification below)
- change their own kitchen role (only their own, never anyone else's)
- invite another person to a different household (this lives under Me, not under Household; addendum of 8 Oct 2026)
- **Settled (owner, voice, 8 Oct 2026):** a different household is always a new one: the person invited starts their own household, it is not one the inviter already belongs to.
- **Settled (owner, voice, 8 Oct 2026):** the founding member cannot be removed by anyone. Anyone else can be removed by anyone.
- **Settled (owner, voice, 8 Oct 2026):** leaving is always allowed, even for the last member. Once everyone has left the household is an orphan: nobody can get back in. The last member gets an explicit warning before confirming that they will not be able to come back in.

**Household**:
- invite another person to this household, the list of members, with a badge on the founding member
- tap a person to remove them. Anyone can remove anyone except the founding member, who cannot be removed (owner)
- pending invitations are listed, and anyone can cancel one (owner)
- Leave household, for the person looking at it, behaves like a danger zone: the person has to type their own name to confirm
- the "Included for this household" section (the Pantry and Recipes chips) is removed. The owner said "Pantry and Receipts"; the section in the mockup held Pantry and Recipes, and both went.

Also from the owner, 8 Oct 2026, in the profile menu:
- **My data** is its own group, with one item for now: Download inventory CSV. Download JSON is removed.
- **History** moves up into the first group, next to Settings, in place of "Pick a kitchen role" (the role moved under Me). The group keeps the name Look and kitchen. (Spoken, not yet in a written request; trivial to undo.)

## What the mockup does

- Profile menu, People group: two rows, Me (shows the name) and Household (shows the member count). The old "Create invite link" row is gone; Invite someone lives on Household. Plan and billing stays for the billing contact.
- Me: tap the picture to open a sheet of twelve pictures plus the person's initial; a Name field that saves as you type (no Save button; an emptied field goes back to the saved name); a Kitchen role row that opens the existing role editor (the role is the person's own); an AI assistants row, Your link, showing Active or Not linked: tapping it opens the AI assistant screen where the one link is copied (copying makes it Active), and when Active a Revoke button opens a confirmation sheet (Keep it, or Yes, revoke it); and an Other households row, Invite someone to a different household, which opens a sheet to pick the household and copy a single-use link.
- Household: members (You chip, Founding member chip, role line), pending invites with Cancel, Invite someone, then a Danger zone box with Leave household.
- Tap a member: the existing member sheet, now with a "Remove <name> from household" button for anyone but yourself and the founding member (who shows a short note instead). It leads to a confirm sheet (Remove or Keep).
- Leave household: sheet that says what is lost and what is kept, a field "Type <your name> to confirm", and a Leave button that stays disabled until the typed name matches (ignoring case and spaces at the ends). Confirming returns the person to the "not a member" screen.

## Proposals (not from the owner)


- **Proposal:** the profile menu's Connect group (AI assistant) is removed, because AI links now live under Me. The Link your AI step in Get started still opens the AI assistant screen.
- **Proposal:** a name is at most 24 characters; the avatar set is twelve emoji plus the initial.
- **Proposal:** removing someone takes a second confirm (the owner said tapping a person lets you remove them).
- **Proposal:** an assistant that has never been linked reads Not linked, and revoking returns it to Not linked (no separate Revoked state).

## Open

- What happens to the Founding member badge when the founder has left?

## Settled simplification: one AI link (owner's decision, 8 Oct 2026)

Owner, by voice: "why are we calling out ChatGPT versus..." and agreed to one link, one revoke. "You would want an area where you click to open up your AI assistance thing, that would copy a link." And any other AI assistant there should be able to be revoked with a confirmation.

- The three named rows (ChatGPT, Claude, Other) are gone. A person has **one** personal link; its Active or Not linked state is singular. Revoking it stops every assistant at once.
- The AI assistant screen keeps ChatGPT / Claude / Other only as a "How to connect" selector: the setup steps differ per product, the link does not.
- Revoke always asks first: "Revoke your AI link?", Keep it (primary) or Yes, revoke it. Revoking from the Me row or from the AI assistant screen opens the same sheet.
- **Proposal:** "any other AI assistant there should be able to revoke with confirmation" is read as this single confirmed revoke covering every assistant. If the owner wants to see and revoke each connected assistant separately, that would need Kitchie to report which assistants are connected; the mockup does not show that.
- **Proposal:** the Me row is tappable to open the screen, with Revoke beside it when Active. The owner's "click to open … that would copy a link" may mean the row itself should copy the link in one tap; the mockup copies from the screen's Copy link button. Open question.

## Settled: Me polish and the theme picker (owner's decisions, 8 Oct 2026)

Owner, by voice: "There's no need to have a save button." "Me knows Sam, right? So you don't need to have Sam in there." And on Settings: the named themes are not needed, "just the two colour thing", with a tooltip as enough, or "let people click those icons and under theme write the name of the thing they picked. So it saves a bit of space."

- Name saves as you type. No Save button, no toast.
- The Me body no longer shows the person's name as text above the Name field; the Name field is the only place.
- Settings > Theme shows only the two-tone swatches (tooltip and screen-reader label carry the name). The picked theme's name is written once underneath. The five themes are unchanged; `theme.js` gained an opt-in swatch-only mode, the profile menu popup still shows names.
- **Open question (not changed):** the owner said the picture should not be an emoji grid and should reuse the avatar people pick at sign-up. The mockup has no sign-up avatar picker: its only avatar set is the twelve emoji plus initial in the Me sheet. Which avatar system does sign-up use in Kitchie (Google picture, drawn icons, something else)? Until that is known the Me picker is unchanged.
- Settings no longer has a "Your kitchen role" row (owner, 8 Oct 2026: "we don't need your kitchen role under settings, because we set that under Me"). The role is set only under Me.
