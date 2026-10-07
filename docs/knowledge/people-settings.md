# People settings: Me and Household

Status: mockup for the owner to review (8 Oct 2026). Not built in Kitchie. Source: owner's voice spec of 8 Oct 2026. Lines marked **Proposal** are choices the mockup made where the spec was silent; the owner has not approved them.

Code: `flows/household/app.js` (screens `me` and `household`, sheets `avatar`, `removing`, `leave`), `flows/household/styles.css` (end of file).

## What the owner asked for

Under Settings, People stops being a flat invite-link screen and splits in two: **Me** and **Household**.

**Me** (the person looking at it):
- change their name
- change their avatar
- manage their AI assistant connections: see them, create a link, and revoke one
- change their own kitchen role (only their own, never anyone else's)
- invite another person to a different household (this lives under Me, not under Household; addendum of 8 Oct 2026)
- **Settled (owner, voice, 8 Oct 2026):** a different household is always a new one: the person invited starts their own household, it is not one the inviter already belongs to.
- **Settled (owner, voice, 8 Oct 2026):** the founding member cannot be removed by anyone. Anyone else can be removed by anyone.

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
- Me: tap the picture to open a sheet of twelve pictures plus the person's initial; a Name field with Save (enabled only when the name changed and isn't empty); a Kitchen role row that opens the existing role editor (the role is the person's own); an AI assistants list (ChatGPT, Claude, Other), each Active with Revoke, or Not linked with Create link (it opens the existing AI assistant screen on that assistant, where the link is copied); and an Other households row, Invite someone to a different household, which opens a sheet to pick the household and copy a single-use link.
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
- If the last member leaves, the sheet warns that the kitchen will have no one in it. What should actually happen?
