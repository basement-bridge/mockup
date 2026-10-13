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
