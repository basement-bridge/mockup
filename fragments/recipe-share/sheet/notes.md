# Recipe share links: the create sheet

Mockup only, nothing built. Fragment: `fragments/recipe-share/sheet/index.html` (the options page; each option is `screen.html?o=a|b|c`, phone and desktop). Live: https://basement-bridge.github.io/mockup/fragments/recipe-share/sheet/index.html. One slice of sharing a recipe; the Share button (placement), the links panel (manage) and the recipient's page (recipient) are other slices. Fictional data, placeholder links at `https://kitchie.example/s/...`.

## Owner's words (voice, 13 October 2026)

- A recipe he is happy with can be shared with people outside the household through an expiring signed link, "in spirit like the shopping-list link".
- Recipients need no sign-in to view; it works the same if they are signed in. Links are multi-use (not single-use) and they expire. The intent is growth.
- Links can be renamed: give the name at creation and rename it later, like the shopping link.

## What is reused

- Shopping link wording and rules (`docs/knowledge/shopper-link.md`): the link made in place, Copy and the phone's own share sheet, "No sign-in needed", an end time in words (SL-D13), the name is for the household only (manage slice).
- The recipe tab's own parts: `.sheet`, `.scrim`, `.grab`, `.field`, `.btn`, `.badge`, `.toast`, the switch (`.sw2`), its icons and sample recipe (Egg fried rice, its three versions). Desktop uses the Pantry's lanes: rail 88, column 736, flyout 400 (`.app .rail .nv .main .col .panel`). Phone is a bottom sheet over a dim.
- New names are `sh-*`, for this sheet only, in `share.css`. No global style changed, no theme token added. Sizes by form factor live only in `phone.css` and `desktop.css`.

## What each option shows (all three, phone and desktop)

States: default, created, copied (button reads Copied, a live line says so, resets after 2.6 s when live), error (Create failed: nothing was made, "Try again"), and after Done (a short confirmation toast with the end date). Live (tap through) works everywhere; `?fail=1` makes the first Create fail. Pinned states (`?s=...`) run no timers so screenshots are steady.

Created state: "Link ready", the link in a read-only field, Copy link, Share (phone only: the native share sheet; desktop has Copy only), one line saying what they see, Done.

## Update 13 October 2026: option C is chosen, with an optional invite

### Owner's words (voice and typed, 13 October 2026)

- The create-link sheet is option C. Default: it shares "the usual" version. A version choice appears only when the recipe has other versions available; a single-version recipe shows no picker. Options A and B stay on the page, marked not chosen.
- Optional invite: the sender can click to include an invite with the share link. An invite is single-purpose: if the link is passed around, only the first person to activate it claims it. It sets up a new household; it never joins an existing one. Sending an invite respects the member's maximum-invites limit.
- The invite count is shown and handled in the usual place of the existing invite functionality: do not invent a new allowance UI. In the sheet, show only the opt-in and a short pointer or count sourced from there.
- The share panel (the flyout lane on desktop, the bottom sheet on phone) is the links view (manage option B); the panel and the sheet must read as one flow.

### What changed

- **C is the main view** (`screen.html` now defaults to `o=c`; the options page leads with C, marked Chosen; A and B are marked Not chosen and kept as they were).
- **C's form, top to bottom:** Link name (prefilled), Which version (only with 2 or more versions: chips "The usual" preselected, then each other version; one line says what the usual is right now), Link works for (24 hours, 7 days default, 30 days, with the end date), **Include an invite** (ticket icon, a switch, one helper line, the count), a one-line "what they see", Create link (held at the bottom on phone).
- **Dropped from the earlier C:** the preview card (the one-line "what they see" says the same), the pinned-or-follows radios (see proposals), the custom date ("Pick a date": it did not earn its space; three chips cover the realistic answers, and 30 days already covers a month).
- **Reused, not invented:** the invite count is manage's allowance wording ("2 of 3 invites left") with the same ticket icon and the same sample limit of 3. The allowance card itself stays in the links panel (manage); the sheet only shows the count beside the switch. The invite line in the created state and the "Invite waiting" row marker use the manage wording.
- **States** (addresses on `screen.html?o=c`): `s=default` (invite off, `inv=off`), `inv=on` (the count reads "1 of 3 invites left after this"), `inv=limit` (switch disabled, "All 3 are in use. Cancel a link or withdraw an invite to free one.", "0 of 3 invites left"), `ver=1` (one-version recipe, no picker), `s=created` and `s=created&inv=on` (an invite line under the link: "Invite included. Only the first person to use it starts a household."), `s=copied`, `s=error` (with `inv=on`: "Nothing was shared, and no invite was used."), `s=done` (the toast adds "Its invite is waiting for the first person to use it."). Live: `fail=1` fails the first Create.
- **Flyout:** the summary-flyout slice's create form is the same design (see `../flyout/notes.md`).

### Proposed decisions (unnumbered; the owner was silent)

- Include an invite is off by default. Reason: an invite is a limited, single-purpose thing and a link is also a plain recipe share; opting in keeps a slot from being spent by accident. Wrong guess costs: if he wants it on by default, one default flips and the helper reads as a statement.
- One helper line, "One person starts a household of their own. Only the first to use the link.", says both owner rules (new household, first to activate). The recipient side (join never offered) is the recipient slice's job.
- At the limit the switch is disabled and the row says why in one line; Create link still works (a link without an invite). The sheet does not link to the panel (nowhere new to go): the reason names the two ways to free one, which are in the links list.
- The count stays visible whenever the row is (on, off or at the limit), so the sender sees the limit before turning the switch on. When on, it says what is left after this link.
- The pinned-or-follows control is gone. The link points at the usual version as it stands when made; an unchanged question for the owner below. A chosen version is fixed to that version.
- "The usual" is the first chip and the preselection, and the helper under the chips names the version it currently is. Picking another version says "Fixed to Original, not your usual."
- The version row is shown only when the recipe has 2 or more versions; the demo recipe (Egg fried rice) has three, and `ver=1` shows the one-version case.
- Phone: Create link is held at the bottom of the sheet while it scrolls (as the earlier C did); desktop: it follows the form in the flyout.
- If Create fails, nothing is made and no invite is used; the invite choice stays as it was.

### Open questions (and what a wrong guess costs)

1. Does the link follow the household's usual if the usual changes later, or stay on the version it pointed at? Drawn: it points at the usual as it stands now. A wrong guess: a recipient sees an old version after the usual changes, or a link changes under someone.
2. Off by default? (above.) Cost: one default.
3. Can an invite be added to a link after it was made? Drawn: no (the manage slice agrees). Cost: an "Add invite" action on the row.
4. Is the limit per member or per household? The sheet says "invites left" with no owner, as manage does. Cost: one word on the row and the card.
5. Should the sheet at the limit offer to open the links list? Not drawn; cost: one text link.
6. A shared recipe with no settled version (also placement's question): does the usual exist? Cost: the picker hides, the sheet shares the only version.

### Default path and deferred

Unchanged from before: `share.css`, `share.js`, `page.js` plus one form-factor pair (`phone` or `desktop`); the invite control is drawn in `share.js` with the form, so nothing extra loads. Everything is in place: toggling the invite, picking a version, Create and the created state change the sheet where it is, no navigation (DESIGN.md 6a).

## Options (A was recommended before the owner chose C on 13 October 2026; kept below for the record)

**A. One screen, three choices (recommended).**
- Link name (the recipe's title already filled in, 60 characters, "For you ... the people you send it to do not see it"), Link works for (24 hours, 7 days, 30 days; 7 days on, with the end date written under it), a read-only line "Anyone with the link can look. View only. No sign-in. Egg fried rice, With peas", one switch "Keep it as it is today" (on), then Create link.
- Rationale: every control earns its place. The name is the rename the owner asked for, the chips are the expiry, the switch is the pinned-or-follows question. One tap to a link in the common case (Create), no version picker, no custom date.
- Trade-off: one decision screen before the link exists, though every field already has an answer.

**B. The link already exists.** Opening Share makes the link at once with the defaults ("Making your link", then Link ready, Copy, Share). Name and expiry are rows below that you tap to change; what they see is a read-only row.
- Rationale: fastest for the common case (Share, Copy, Done).
- Trade-off: a link is made every time the sheet is opened, even if never copied, so the manage list fills with strays and any cap fills up (the shopping list caps at 3). A build would need to discard an unused link on close, and changing the expiry of an existing link is a new rule.

**C. Pick exactly what they get.** A preview card ("View only"), a version list (Original, With peas, Less soy more garlic), the pinned-or-follows choice as two radios, expiry with a fourth chip "Pick a date", then the name, with Create held at the bottom.
- Rationale: the clearest answer to "what will they see", and the only one where the version is a real choice.
- Trade-off: five groups in a sheet that scrolls on a phone before a share to a cousin; the custom date is drawn to show its cost and does not earn its space (a date picker for a link nobody will count days on; 30 days already covers "a month").

## Recommendation (superseded: C chosen 13 October 2026)

A. Default expiry 7 days, pinned to the version on screen as it is today. B is the follow-up if testing shows the extra screen is felt; C's version choice can come back later if people share versions other than their usual.

## Proposed decisions (the owner was silent; each is a proposal, unnumbered)

- Create opens from Share, in place: a bottom sheet on phone, the flyout lane on desktop, no navigation (DESIGN.md 6a). Esc or the x closes; closing before Create makes nothing.
- The name is prefilled with the recipe's title, 60 characters at most, for the household only (the recipient never sees it, as in manage). Renaming later is the manage slice's row.
- Expiry choices 24 hours, 7 days, 30 days; default 7 days (recipes are evergreen, the shopping link's 48 hours is too short). No custom date: three chips cover the realistic answers and the date picker is the control that least earns its space. Shown as the plain end date under the chips ("Ends Tue 20 Oct"); 24 hours reads "Ends tomorrow, 9:41 am".
- What the recipient sees is stated, not asked: view only, no sign-in, the recipe name and one version. It works the same if they are signed in.
- Version: the one on screen when Share was tapped, which on opening is the household's usual. Shown as text in A and B, a choice only in C.
- Pinned by default: the link shows the recipe as it is today; later edits stay private ("Keep it as it is today", on). Turning it off makes the link follow the newest copy of that version. Reason: the owner shares a recipe he is "happy with"; a half-edit going to a relative would surprise him. Wrong guess costs: a recipient sees an old copy after he fixes a typo; he makes a new link, or switches it off.
- Links are multi-use and expire; this is said once in the created state's line, not as a control (no single-use option).
- Copy link everywhere; Share (the native sheet) on phone only, since a desktop browser rarely has one and Copy is the one action there. The link is a read-only field, selectable.
- Error: nothing is made, the message says so, one Try again button; the form stays filled in.
- After Done: the sheet closes with a toast "Link ready. Anyone with it can view Egg fried rice until Tue 20 Oct." with an OK. The link then lives in the manage slice's list.
- No preview, no QR, no "who can view" setting, no password, no note to the recipient: none earns its place for the first version.

## Open questions

1. Is a link for the recipe or for one version (also placement's question 1)? A and B take the version on screen; C asks. A wrong guess: "With peas" shared when he meant Original.
2. Pinned or follows by default? Drawn: pinned. If he would rather it always be current, the switch default flips and the line changes.
3. Is 7 days the right default, and should 30 be the longest? Growth might want "no expiry"; the owner said links expire, so none is drawn.
4. Should creating a link be limited per recipe or household (shopping has 3)? Not drawn; with B it would matter more.
5. Should the created state say how many people opened it? That is the manage slice; not repeated here.
6. Should the name ask for a person ("For Mum") rather than prefill the title? A title prefill is quicker but every link then has the same name; a per-person name helps tell links apart in manage.
7. Does a recipe without a settled version offer sharing at all (also placement's question 5)?

## Default path and deferred (DESIGN.md section 6)

Default path: `theme.css`, the recipe tab's `recipe.css`, `keys.css` and `recipe.js` (the page behind already loads them), `share.css`, `share.js`, `page.js`. In the build the sheet's code would load when Share is tapped, not with the recipe page. Only the form factor on screen loads its own pair: `phone.css` and `phone.js` under 1024px, `desktop.css` and `desktop.js` at 1024px and up (`screen.html` decides, the other pair is never fetched). The link is made in place and the result replaces the form in the same sheet; no reload or navigation. No images, no network, timers only while Creating (650 ms in the mock) and for the Copied reset.

## Files

`index.html` and `index.css` (the options page, frames the real screen in iframes), `screen.html` (one screen, `?o=a|b|c&s=default|created|copied|error|done&fail=1`), `share.js` and `share.css` (state, the three bodies, behaviour), `page.js` (the stand-in recipe page behind), `phone.js`/`phone.css` and `desktop.js`/`desktop.css` (the layouts).
