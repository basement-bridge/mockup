# Recipe share links: manage (seeing, renaming, cancelling)

Mockup only, nothing built. Fragment: `fragments/recipe-share/manage/index.html`. Live: https://basement-bridge.github.io/mockup/fragments/recipe-share/manage/index.html. One slice of sharing a recipe; the Share button, the create sheet and the recipient's page are other slices. Fictional data, placeholder links at `https://kitchie.example/s/...`.

## Owner's words (voice, 13 October 2026)

- A recipe he is happy with can be shared with people outside the household through an expiring signed link, "in spirit like the shopping-list link".
- "Somewhere in the recipe there should be information about the pending URLs that people can go and cancel."
- Links can be renamed, like the shopping link.
- Recipients need no sign-in; links are multi-use (not single-use) and they expire.
- The intent is growth, so showing that a link is being used (opens count, last opened) is useful.

## What is reused

- Shopping link (`docs/knowledge/shopper-link.md`): a link line with its countdown and Cancel (SL-D12 multi-use, SL-D15 cancel in one tap), Withdraw wording, the live-link row in `fragments/shopper-link/member.css` (`sl-live`).
- Recipe photos (`recipe-photos`, P-D17): remove is hidden at once, Undo for 5 minutes, then gone. Cancel uses the same pattern and wording ("Undo for 5:00, then ..."), so no confirm dialog.
- Recipe page (`recipe/`, `recipe-photos/recipe.html`): the continuous scroll and the R-O2 jump row. Pantry item panel lane for the desktop panel (DESIGN.md section 7).
- SL-D19: no icon that suggests delete unless it deletes. The rename "Keep" button is a word, not a cross; the close button only closes.

## What is drawn (all three options)

A row per link: **name** (tap it, or the pencil, to rename in place), **expiry countdown** ("6 days left", "9 h left", "45 min left"), **opens count and last opened** ("4 opens · last 2 h ago", "Not opened yet"), **Copy link**, **Cancel link**. Active links first, ended ones last.

- Rename: inline, Enter or Save keeps it, Escape or Keep leaves it, 40 characters, an empty name keeps the old one.
- Cancel: one tap, no confirm. The row becomes an Undo line with a live 5 minute clock, then it stays cancelled and leaves the list. Nothing is hard deleted.
- Ending soon: under 24 hours, the row gets the accent border and the countdown turns accent.
- Ended: greyed, dashed, "Ended 2 days ago". **Renew** gives the same link another 7 days (the already-sent message works again). **Remove from view** hides it, with the same Undo.
- Empty, 3 active, ends soon, one expired, cancelled with undo: all switchable on the page, phone and desktop, all three options.

Every control earns its place: no expand/detail, no URL text (Copy covers it), no bulk actions, no sort, no extend-by-days picker (Renew has one fixed answer).

## Options

**A. A Shared section in the scroll (recommended).** After Photos, with a "Shared 3" chip in the jump row. Both appear only when there is something to show.
- Rationale: it is "somewhere in the recipe", costs the cooking job nothing (end of page, absent for most recipes), needs no new container on either form factor.
- Trade-off: the way in is a scroll or the chip; nothing at the top says links are out apart from the chip count. Empty state is absence, nothing to design.

**B. A panel from the Share button.** The button carries a count badge; it opens a bottom sheet on phone and a side panel on desktop, with "New link" and the list.
- Rationale: nothing on the page, one door for making and managing, the only option with a real empty state.
- Trade-off: one tap deeper, the information is not in the recipe until opened (weakest reading of the owner's "in the recipe"); on desktop the panel uses the lane the column was using; it ties this slice to wherever the Share button ends up.

**C. A card in the recipe's details.** Between title block and ingredients: "Shared outside the household, 3 links out", opening in place.
- Rationale: always seen, so a link about to end is noticed.
- Trade-off: it pushes Ingredients down in the cooking job even closed, for a rarely used feature (DESIGN.md section 1).

**Recommendation: A.** If the integration agent's Share button has no room for a badge or sheet, A needs nothing from it. A and B combine well: the Share button could scroll to the section when links exist (not drawn).

## Proposed decisions (unnumbered; the integration agent numbers them)

- **Proposal:** a link is managed where the recipe is, by any household member (not only its maker), like the shopping link.
- **Proposal:** cancel is one tap with Undo for 5 minutes (P-D17 pattern), not a confirm. Undo puts the same link back; after 5 minutes it stays cancelled. A recipient who opens a cancelled link sees the recipient slice's "no longer available" page.
- **Proposal:** ended links stay in the list, greyed, until renewed or removed from view; removal is a hide, not a delete, with the same 5 minute Undo.
- **Proposal:** Renew gives the same link 7 days from now. "Ends soon" is under 24 hours.
- **Proposal:** the name is for the household only; recipients never see it. A link made without a name is called by its date ("Link, 13 Oct"), set by the create slice.
- **Proposal:** "opens" counts visits to the recipe page by a person, not link-preview fetchers (WhatsApp, Signal crawlers). Last opened is shown in words, exact times on hover/title only for the end time.
- **Proposal:** option A shows the section and chip only while a listed link exists; the empty state is absence.
- **Proposal:** no cap on links per recipe is drawn (the shopping list caps at 3, SL-D16).

## Open questions

1. Where does the Share button sit, and does it scroll to the section (A), open the panel (B), or neither? Depends on the other slice. A wrong guess costs a rework of B only.
2. Default expiry for a recipe link (7 days drawn for Renew; the shopping link is 48 hours). Recipes are evergreen, so longer seems right; owner to say. Wrong guess: one constant.
3. Should there be a cap per recipe or per household, as the shopping list has (3)? Not drawn.
4. Does Renew keep the same URL (drawn) or make a new one? Same URL means old messages work again; a new one is safer if the link leaked.
5. Are opens counted only by distinct visitors or every open? Drawn: every open, previews excluded.
6. Should the household see who opened (they have no sign-in, so only counts)? Not drawn, and not possible without sign-in.
7. History: should cancelled and removed links be searchable in the History feature (area history-feature)? Not drawn.

## Default path and deferred (DESIGN.md section 6)

Default path: `theme.css`, `shared.css`, `manage.css`, `manage.js`; no images, no network, one 1 second timer only while an Undo line shows. Deferred: only the form factor on screen loads its own `phone.css` + `phone.js` or `desktop.css` + `desktop.js`, on first show (section 7: viewport-specific code in its own file). Cancel, rename, renew and undo change the row in place, no reload (section 6a). In the build the list would come with the recipe page's own read of the recipe's links, no extra request.

## Files

`index.html` (page and controls), `manage.css` and `manage.js` (list, rows, interactions, states), `phone.css` / `phone.js`, `desktop.css` / `desktop.js` (the drawings of A, B and C). The row and its classes (`rs-row`, `rs-name`, `rs-left`, `rs-stats`, `rs-acts`, `rs-undo`) are what a build lifts; the frame classes only draw a recipe page around it.

## Update 13 October 2026: invites and versions on a link

### Owner's words (voice and typed, 13 October 2026)

- A share link can optionally carry an invite (the sender opts in on the create sheet: "Include an invite", "2 of 3 invites left"). An invite is single-purpose: if the link is passed around, only the first person to activate it claims the invite. It sets up a new household and never joins an existing one. Sending invites respects the member's maximum-invites limit.
- The create sheet is option C (the usual version by default, a version choice only when other versions exist), so a link may point at the usual version or a chosen one.
- Ask: show the invite state on each row (none, unclaimed, claimed with date, expired or withdrawn), the sender's remaining invites near the list, what cancel does to an unclaimed invite, and the version only when it is not the usual. Option A stays the recommended layout.

### What changed

- Row: a quiet invite line under the numbers, with a small ticket icon. Four states: **Invite waiting** (with a quiet Withdraw), **Invite claimed Mon 12 Oct**, **Invite ended with the link**, **Invite withdrawn**. No invite: no line, the row is as before.
- Version tag: a small pill before the opens count ("With peas"), shown only when the link points at a version other than the usual. Usual links look exactly as before.
- Allowance: one card above the list, "1 of 3 invites left. Cancel a link and its unused invite comes back." Same in options A, B and C (above the list in each). It counts invites waiting plus invites claimed; it is derived from the rows, so it moves live as you cancel, withdraw, undo or renew.
- Cancel on a link with an unclaimed invite: the Undo line adds "Its invite is withdrawn and back with you." On a claimed invite it says "Its invite stays claimed." Undo puts the invite back with the link.
- New sample states: Invites, Cancel invite, Invite ended, None left. The earlier five states are untouched and still work (they show "3 of 3 invites left").
- Desktop wide rows: the invite line sits under the numbers, the actions keep their right-hand place.

### Proposed decisions (unnumbered; the owner was silent)

- **Proposal:** a household member sees only the date a link's invite was claimed. No name, email or household name of the person who claimed it. Reason: they are a new household and have not agreed to be named; the sender can ask them. Open question below.
- **Proposal:** cancelling the link withdraws an unclaimed invite and returns it to the allowance at once; a claimed invite stays claimed and is not returned (the household already exists).
- **Proposal:** Withdraw (invite only) is a one-tap quiet button on a waiting invite. The link keeps working as an ordinary share link; the invite returns to the allowance and cannot be re-attached (make a new link to send another). No confirm, because the allowance comes back.
- **Proposal:** an unclaimed invite ends with its link when the link expires, and returns to the allowance. Renew brings the invite back if an invite is left; if not, Renew still works and the link opens the recipe only (the toast says so).
- **Proposal:** the allowance counts a waiting invite as spent, so the sender cannot promise more invites than they have. Claimed invites stay spent.
- **Proposal:** the allowance is shown whenever the list is, even for a member with no invites in use, so the sender sees the limit without opening the create sheet. With none left it turns accent and the text is unchanged; making a link without an invite is still possible (the create sheet's slice).
- **Proposal:** the version pill appears only for a non-usual version, using the version's own name. If the usual later changes, a link made to "the usual" follows the create sheet's pinned-or-follows rule.
- **Proposal:** an invite can only be on a new link; a link made without one cannot get one later (so the claim rule stays on a link the sender chose at creation).

### Open questions (and what a wrong guess costs)

1. Should the sender see who claimed it, for instance the new household's name? Drawn: no, date only. Cost of a wrong guess: a sender who wants to know it worked has to ask, or a privacy surprise if it were shown.
2. Can a link get an invite after it was made? Drawn: no. Cost: a rework of the row (an "Add invite" action) and of the single-purpose rule.
3. Does the allowance return when an unclaimed invite's link expires (drawn: yes) or only when the sender withdraws or cancels? Cost: a constant and one line of copy.
4. Is the limit per member (drawn: "your allowance") or per household? The owner said "the member's maximum-invites limit"; the wording follows him. Cost: the card says "your" or "the household's".
5. If a claim is started but not finished, does the invite stay held for that person (see the recipient notes)? The row would show "Invite waiting" while it is held; a distinct "being claimed" state is not drawn.

### Default path and deferred (unchanged)

No new file is loaded: the invite line, the version pill and the allowance are in `manage.js` and `manage.css`, and the desktop row rule is in `desktop.css`. In place (6a): withdraw, cancel, undo and renew change the row and the allowance where they are.

## Update 14 October 2026: option B is the main view

### Owner's words (voice and typed, 13 October 2026)

- Manage (links view) is **option B**: the share panel opened from the Share button (bottom sheet on phone, side panel on desktop; on the desktop summary flyout it is the same lane). A and C stay on the page, marked "not chosen". Rows keep rename, copy, cancel with undo, expiry countdown, opens and the invite state.
- An invite attached to a link counts **in the usual place of the existing invite functionality**. Do not invent or duplicate an allowance UI; the panel may show a small pointer to it.

### What changed

- `index.html` opens on B ("B · Share panel (chosen)"); A and C carry a "Not chosen" pill. All states still work on phone and desktop (empty, 3 active, ends soon, one expired, cancelled with undo, Invites, Cancel invite, Invite ended).
- The allowance card ("1 of 3 invites left") and the "None left" state are removed. The usual place is **My invites** (`fragments/desktop-profile/invite.js`, INH-D10 to INH-D12: at most three pending per person, a slot frees when an invite is used or expires). While any listed link carries an invite, the panel shows one quiet line, "Invites on links count in My invites", linking there.
- Cancel undo line now says "Its unused invite is withdrawn." (claimed: "stays claimed", unchanged). Withdraw and Renew toasts no longer talk about an allowance.
- Earlier text above (the "Update 13 October" allowance card and the recommendation of A) is superseded by this section.

### Proposed decisions (unnumbered)

- **Proposal:** a claimed invite does not hold a slot (INH-D12: outstanding means unused and unexpired). The earlier card counted claimed ones as spent; that contradicted the existing rule, so it is dropped.
- **Proposal:** the pointer shows only while a listed link carries an invite, and carries no number (the count is My invites' to show).
- **Proposal:** on the desktop summary flyout the panel opens in the flyout's lane; the flyout slice draws that, not this one.

### Open questions

1. Does an invite on a share link appear as a row in My invites (label = the link's name), or only count toward its cap? Cost of a wrong guess: the pointer wording and one row type there.
2. Renew on a link whose invite ended: it comes back only if a slot is free in My invites (not drawn, the toast assumes it does).
3. Panel on desktop opens in a 320px lane in this drawing; the build uses the flyout's own width.

### Default path (unchanged)

No new file; the pointer is in `manage.js` and `manage.css`. `phone.js`/`desktop.js` still load on demand.
