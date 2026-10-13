# Shared recipe: the recipient side

Mockup only, nothing built. Slice "recipient" of recipe sharing (other slices: Share button placement, create sheet, manage and cancel panel). Files: `index.html` (options and states framed), `page.html` (the page itself, parameters at the top of the file), `rs.css`, `rs.js`, `desktop.css` (fetched from 1024px up only), `index.css` (frames only). Live: https://basement-bridge.github.io/mockup/fragments/recipe-share/recipient/index.html

## The owner's words (voice, 13 October 2026)

- A recipe he is happy with can be shared with people outside the household through an expiring signed link.
- Recipients need no sign-in to view; it works exactly the same if they are signed in. Links are multi-use and expire after a set time.
- "The intent of this is growth hacking": the shared page should be a good read on its own and invite people into Kitchie, without getting in the way of the recipe.
- No hints or upsell for products the person is not entitled to inside the signed-in app. This public page is outside the app, so a gentle invitation is fine.

## What the page shows

Banner photo, title, one-line description, time and servings, ingredients, method with step photos, notes. Never: stock or what is missing, reactions, cook counts, member names, who cooked, version history. Notes appear without names. A Print button (and a print stylesheet that drops every invitation). Footer says when the link stops working. Desktop: wide banner, ingredients in a sticky box beside the method.

## The growth invitation: three options

Rule used to judge them: the recipe stays readable, meaning nothing covers it, moves it or sits ahead of it, and the invitation is seen by someone who has read it.

**A. Quiet top strip, then one card after the last note (recommended).** The strip is identity only (logo, Sign in) and scrolls away. The card says "Liked it? Keep it in Kitchie." with one button (Try Kitchie) and a text link (I have an account). Signed in: the same card becomes "Want this one in your kitchen?" with Save to my recipes. Trade-off: lowest visibility; anyone who stops before the end never sees it. It matches the owner's wording best (invite, do not get in the way) and asks at the moment of interest.

**B. Slim bottom bar.** One line, Try Kitchie, a close button; appears only after about a third of the page is read; a dismiss lasts the visit; on desktop a small card bottom right. Trade-off: seen more than A, but it holds about 56px of a phone screen for someone who may be cooking from it, and fixed bars are the easiest thing to close unread.

**C. Banner above the recipe.** One soft line and Take a look, dismissible. Trade-off: highest visibility, but it comes before the dish and pushes the title down about 150px on a phone. It is the option that most breaks "the recipe stays readable". Shown for the weight comparison.

**Recommendation: A.** Considered and left out: a prompt after the ingredients ("add these to a shopping list") is contextual but sits inside the reading flow; a pop-up or full-screen interstitial breaks the rule outright.

## States

Not signed in; signed in (Save to my recipes, in place: tap and it reads "Saved. Open in Recipes"); signed in with a household that has no Recipes (same page, no invitation, no hint); link expiring soon (small notice in the flow, shown in the last 24 hours, with the time in the viewer's own zone); expired and cancelled (one identical page: "This link has run out", explains in plain words, Ask for a new link, keeps the invitation in the chosen option); loading (words first, step photos next, banner last, boxes sized and coloured from the first paint so nothing jumps; `?s=loading` plays it over about 2 seconds, `&phase=` freezes it); link preview (banner, title, one-line description; an expired or cancelled link unfurls as a plain "A shared recipe" card).

## Default path and deferred (DESIGN.md section 6)

Default path: one HTML page, `rs.css`, `rs.js`, the shared theme file. Text and layout need no image. Deferred: step photos after the text, the banner last (the decided order), desktop CSS only from 1024px, `sms:` and print only on tap. Not loaded: icon sets, fonts, any framework, anything about stock or the household. In place, not a refresh (6a): Save, Ask for a new link, copy and dismiss all change the page where it is.

## Proposed decisions (numbers added later by the integration agent)

- **Proposal:** the page is one public page for everyone; signed in changes only the invitation slot into Save to my recipes. Wrong guess costs: a second page to maintain.
- **Proposal:** no names anywhere, not even the sender's. The page says "from a Kitchie kitchen". Cost: less personal; the sender's name is the strongest trust signal for a stranger. Open question below.
- **Proposal:** the shared version is the one the sender chose; notes show without authors; no versions strip, no history.
- **Proposal:** expired and cancelled look identical and the recipe name is not shown, so nothing leaks (a cancelled link says nothing about the sender's choice). Cost: a recipient cannot tell "turned off" from "timed out".
- **Proposal:** Ask for a new link drafts a message in the person's own messages app (`sms:` link and Copy message); Kitchie never sees it and needs no sender contact. Cost: it only works if the person knows who sent it, which they do.
- **Proposal:** the expiring notice appears in the last 24 hours, with a Print suggestion for people without an account.
- **Proposal:** a signed-in viewer whose household has no Recipes sees no invitation and no Save (the no-hints rule); a signed-in viewer with Recipes sees Save, which makes a copy that is theirs to change.
- **Proposal:** invitation wording is "Liked it? Keep it in Kitchie." / "Try Kitchie" / "I have an account". Copy only; easy to change.
- **Proposal:** the link preview uses the banner, the title and the one-line description; with the link gone, a generic card.
- **Proposal:** option B bar waits for 35% scroll and a dismiss lasts the visit (session storage only; never needed for the page to work).

## Open questions (and what a wrong guess costs)

- Does the sender's first name show ("Shared by Sam")? He said no household-private data; a first name chosen by the sharer is arguably theirs to give. Cost either way is small; trust against privacy.
- Does a signed-in viewer's Save need a household choice when they belong to one household only? Assumed no.
- Preview crawlers fetch the link without cookies: the banner must be fetchable through the signed link for the unfurl to show a photo. A wrong guess: previews with no picture.
- Should a recipient be able to ask for a new link through Kitchie (the sender gets a notice) as well as by message? That needs a contact route for people with no account.
- Link lifetime and the 24-hour notice threshold depend on what the create sheet offers; the notice reads the time left, whatever it is.
- Does Save keep the shared version only, or the whole family? Assumed the shared version only.
- Tracking: how the owner will know the invitation works (clicks on Try Kitchie by option). Nothing is measured in the mockup, and any measuring must not be a cookie banner problem on a no-sign-in page.

## Update 13 October 2026: a link that carries an invite

### Owner's words (voice and typed, 13 October 2026)

- A share link can optionally carry an invite (the sender opts in on the create sheet). An invite is single-purpose: if the link is passed around, only the first person to activate it claims the invite. It sets up a new household and never joins an existing one. Sending invites respects the member's maximum-invites limit.
- The create sheet is option C (usual version by default), so the link may show the usual or a chosen version; the recipient page shows whichever the link points at, as before.
- Ask: the claim experience, four states, and the claim-then-set-up-household stub screens in one compact flow.

### What changed

- New states in `page.html` (`s=` parameter): `invite`, `claimed`, `memberinvite`, `withdrawn`. `flow=1|2|3` with `s=invite` freezes a screen of the claim flow. Placement is always option A, the recommended one (the card after the last note); the invite states ignore `opt=`. Phone and desktop.
- **1. First person, invite unclaimed:** the recipe reads as before. After the last note a card with a solid accent edge (the growth card has a dashed one): ticket icon, "Start your own household", "Whoever sent you this recipe included an invite. Set up a Kitchie household of your own: it takes a minute and it is yours, not theirs.", a button "Start my household" and the text link "I have an account". Nothing above it changes; no bar, no banner.
- **2. Invite already claimed by someone else:** the recipe opens, no claim card, the normal "Liked it? Keep it in Kitchie." invitation stays, with one line inside it: "The invite that came with this link has already been used."
- **3. Signed in with a household:** they cannot claim. The card is the usual Save to my recipes, plus one line: "This link also came with an invite to start a new household. You already have one, so the invite stays unused." The invite is not spent, so someone else can still claim it.
- **4. Invite withdrawn, link still live:** same as state 2 with the line "The invite that came with this link is no longer available." **Link expired or cancelled:** unchanged ("This link has run out"); the invite goes with the link, nothing is said about it.
- **Claim flow (compact, in place, three screens):** 1 Create your account (one email field, "Create my account", the line "Once you continue, the invite is yours and nobody else can use it."), 2 Name your household (one field, a default name, "Create household"), 3 Done ("The Naidoo kitchen is ready", two ticks, Open my kitchen). A "Back to the recipe" button on step 1 restores the page.
- Everything earlier still works: the three invitation options, signed in, no Recipes, expiring, expired, cancelled, loading, preview.

### Proposed decisions (unnumbered; the owner was silent)

- **Proposal:** the claim card is quiet by placement, not by hiding: it sits where the growth card sits, after the recipe, and replaces it for the first person (one invitation at a time, never two cards). Its solid edge and ticket icon make it read as "this one is for you".
- **Proposal:** wording is "Start your own household" / "Start my household" / "I have an account". The card never says who sent it and never says how many invites the sender has left.
- **Proposal:** the invite is claimed when step 1 is passed (the account exists), not when the page is opened and not on step 3. Opening the page claims nothing, so link-preview crawlers and people who just read cannot burn the invite. Once claimed, a second person who opens the link sees state 2 at once.
- **Proposal:** the claimed and withdrawn lines differ ("already been used" and "no longer available"), and neither names anyone. The claimed line is the one the owner asked for.
- **Proposal:** a signed-in viewer is told about the invite in one line rather than left to wonder why there is no claim card; the invite stays unspent.
- **Proposal:** the flow replaces the recipe in place and is a separate file (`claim.js`, `claim.css`) fetched only on tap, so the page for everyone who does not claim loads nothing extra (DESIGN.md sections 6 and 6a).
- **Proposal:** the new household starts empty except for this recipe as the person's own copy (drawn on the Done screen). Open question below.
- **Proposal:** the stub asks for an email only, so a real sign-up replaces step 1 with whatever Kitchie uses (platform's decision); the mockup does not decide credentials.

### Open questions (and what a wrong guess costs)

1. What can an already-signed-in person without a household do? Drawn: nothing special (treated as state 3, Save to my recipes). If such an account exists, it could claim without a new sign-up. Cost: a fifth state.
2. What does the new household start with? Drawn: empty, plus the shared recipe. Does it get Recipes only, or Pantry and Plan too? Cost of a wrong guess: the Done screen's second tick and the first-run experience.
3. Is the shared recipe copied into the new household (drawn) or only viewable through the link? Copying matches the signed-in Save (their own copy). Cost: the Done line, and the recipe page's version rule (shared version only, as in Save).
4. If someone starts the claim and stops after step 1 (account made, no household named), what happens? Drawn: the invite is theirs and they land on step 2 next time. Cost: if the invite were released after a time, a sender's allowance could return and a second person claim it.
5. Should a person who already has an account but is signed out ("I have an account") be told, after signing in, that the invite cannot be used? Drawn: they sign in and see state 3.
6. Does the page tell a first-time visitor how many people can use the invite? Drawn: no, "yours, not theirs" only.
7. If the sender cancels the link after someone has begun claiming, does the claim finish? Drawn: yes, a claimed invite stays claimed.

### Default path and deferred (DESIGN.md sections 6 and 6a)

Default path unchanged plus a few lines in `rs.js` and `rs.css` for the card and note. Deferred: `claim.js` and `claim.css`, fetched only when "Start my household" is tapped (or `flow=` is in the address); not loaded for any other state or for anyone who does not claim. The flow's three screens swap the page's content in place; "Back to the recipe" restores it and refetches nothing but the photos.

## Update 14 October 2026: one invitation, only with an unclaimed invite

### Owner's words (voice and typed, 13 October 2026)

- Growth invitation = **option B, the bottom bar that appears after reading starts**, shown **only when the member who shared attached an invite and it has not been taken up**. In every other case (no invite, claimed, withdrawn, expired) **no growth invitation at all**: a clean recipe page. The generic invitation is removed.
- A person with an account can sign in from the page; once signed in it shows **Save to my recipes**, no household claim (an invite never joins an existing household). A person without an account who claims the invite goes to the usual invite-only flow. An invite is single-purpose (the first person to activate it claims it) and sets up a new household.

### What changed

- Options A (end card) and C (banner) and the generic "Liked it? Keep it in Kitchie." card are removed. The only invitation is the bar: "You have a Kitchie invite / A household of your own, free. Have an account? Sign in", button **Claim invite**, an x. It waits for about 35% scroll; the x lasts the visit. Desktop: small card bottom right.
- The usual flow exists, so my own claim stub is deleted (`claim.js`, `claim.css`). **Claim invite** goes to `fragments/invite-new-household/start.html?s=landing&msg=none` (the invite-only sign-up, INH-D18/D19).
- Sign in: the top strip's Sign in (and the link in the bar) goes to the signed-in sample. Signed in, the meta row gets **Save to my recipes** (tap: "Saved. Open in Recipes"). Even with an unclaimed invite on the link, a signed-in viewer gets no bar and no claim. A household without Recipes gets no Save.
- `page.html` parameters: `s=anon|member|norecipes|expiring|expired|cancelled|loading|preview` plus `inv=unclaimed|claimed|withdrawn|none`. Old `s=invite|claimed|withdrawn|memberinvite` still map. `index.html` is rewritten around the picks.
- States drawn: unclaimed (bar after reading), no invite, claimed, withdrawn, signed in, signed in with invite, expiring (notice, plus bar if an unclaimed invite rides), expired and cancelled (identical, no invitation, even with an invite attached), loading, link preview. Print drops the bar.

### Proposed decisions (unnumbered)

- **Proposal:** the "invite already used" line is removed. It does not earn its place: the page is for reading, the sender's message (not the page) is what promised an invite, and a note about someone else's claim tells the reader nothing to act on. The sender sees the claim in the manage panel.
- **Proposal:** the bar offers no "I have an account" button; a Sign in link inside it covers that.
- **Proposal:** Save to my recipes sits in the meta row beside Print, because it is a function of the account, not an invitation.
- **Proposal:** the bar never says who sent it or how many invites remain.
- **Proposal:** the invite is claimed only when the usual flow's sign-up completes (INH-D7), so opening the page or tapping Claim invite spends nothing.

### Open questions

1. The usual landing greets with the inviter's name ("Arjan's kitchen is in order") and has its own personal message; a share-link invite has neither. Drawn with `msg=none`. Does the share link get a name-free variant of that landing? A wrong guess: the landing reads wrong for a stranger who got a recipe.
2. Signed in with an account but no household: can they claim? Drawn: treated as signed in (Save only).
3. With the invite claimed or withdrawn, a person on the page gets no pointer to Kitchie anywhere. Accepted as the owner asked.

### Default path and deferred

Nothing new loads: `rs.js` and `rs.css` only; the claim files are gone. The bar exists in the markup hidden and shows on scroll; the usual sign-up page loads only on tap.
