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

## Options (A is the recommended default)

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

## Recommendation

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
