# Sharing a recipe outside the household

Handover for whoever drives this next: [../../handover/recipe-share.md](../../handover/recipe-share.md). Mockup hub: `fragments/recipe-share/index.html` (live: https://basement-bridge.github.io/mockup/fragments/recipe-share/index.html). Mockup only; nothing is built. Everything numbered below is **PROPOSED** unless marked **CONFIRMED** (206, 209, 243, 247, 248, 250, 252 and 253 so far, 13 October 2026, see "Owner picks"). Decision numbers continue after 205 (the last in [plan-ui-review.md](plan-ui-review.md)).

## Job

Send a recipe the household is happy with to someone outside it, the way the shopping-list link hands a list to someone outside it, and let the recipient read it with no account. The intent is growth.

The owner's words (voice, 13 October 2026):

- Share a recipe he is happy with outside the household, like the shopping-list link: an expiring signed URL.
- No sign-in is needed to view, and the same if the viewer is signed in.
- Multi-use, not single-use, but it expires.
- The intent is growth hacking.
- A share button at the top of the recipe, with a couple of placement options.
- Pending URLs are visible inside the recipe, where they can be cancelled.
- Links can be renamed, like the shopping link.

Also from the recipient slice, as the owner's standing rule for the signed-in app: no hints or upsell for a product the person is not entitled to. The public page is outside the app, so a gentle invitation is fine there.

## How we know the person is in this job

Two people, two entries. The sender is on a recipe page (Recipes tab) and taps Share; there is nothing to detect. The recipient arrives through the link itself, as with the shopping link (`shopper-link.md`). The page is the same whether or not they are signed in; sign-in only changes the invitation slot.

## What leads

- Sender: the Share entry in the recipe's top row, then a create screen whose every field already has an answer, then the link in a field with Copy.
- Links already out: a Shared section in the recipe, each link with its name, time left, opens and last opened, Copy and Cancel.
- Recipient: the recipe itself. Invitation last, never ahead of it.

## What this job does not need

- No stock, "what is missing", reactions, cook counts, member names, cook history or version history on the public page.
- No sign-in, password, QR code, "who can view" setting, note to the recipient, single-use option or custom expiry date in the first version.
- No per-feature flag (see decision 241).
- A cook who never shares sees nothing new: no badge at zero, no Shared section or chip without a link.

## Mockup

Hub: `fragments/recipe-share/index.html`. Four slices, merged separately (PRs #161 to #164), each with its own `notes.md`:

| Slice | Folder | Question | Recommended |
|---|---|---|---|
| Placement | `fragments/recipe-share/placement/` | Where does the Share button live? | A: icon in the top row, count of active links on it; labelled pill and key S on desktop |
| Create sheet | `fragments/recipe-share/sheet/` | What do you choose before the link exists? | C, CONFIRMED (247): shares the usual version; a version choice only when others exist (was A) |
| Manage | `fragments/recipe-share/manage/` | Where do pending links show, and how are they renamed and cancelled? | A: a Shared section after Photos with a chip in the jump row |
| Recipient | `fragments/recipe-share/recipient/` | What does the person with the link see? | A: quiet top strip, one invitation card after the last note |

Recommended path: placement A, sheet C (confirmed), manage A, recipient A. Other options are kept drawn for comparison; none is rejected by the owner.

## Owner picks (13 October 2026, voice and typed)

1. **CONFIRMED:** mobile sharing is placement option A (share icon in the top row with an active-links badge). Decision 206.
2. **CONFIRMED:** desktop sharing is placement option A on the main page of the fully opened recipe (Share pill with the S key hint). Decisions 206 and 209.
3. **CONFIRMED:** the desktop recipe summary flyout (opened by clicking a row in the Recipes list) also gets a Share button next to the "Open full recipe" link, opening the share panel as a drill-in in the same flyout lane. Desktop only: mobile has no summary flyout (a row tap opens the full recipe page). Decision 243. Its visual and wording are proposed by the flyout slice and stay PROPOSED (244 to 246).
4. **CONFIRMED:** the create sheet is option C. It shares "the usual" version by default; a version choice appears only when other versions are available. Decision 247.
5. **CONFIRMED:** the sender may attach an invite to a link (opt-in), single-claim, setting up a new household, within the member's maximum-invites limit. Decisions 248, 250, 252, 253; 249 and 251 PROPOSED.
6. **Not yet confirmed:** whether "A" also covers the links list and recipient page. Those A options stay PROPOSED (recommended). See open question O12.

## Decisions (206, 209, 243, 247, 248, 250, 252, 253 CONFIRMED; the rest PROPOSED)

Merged from the four slices' unnumbered proposals. Where two slices said the same thing it is here once. Where they disagreed it is not decided here; it is an open question (O1 to O5). "Source" names the slice or slices.

### Entry and placement

206. **CONFIRMED (13 Oct 2026, owner, voice; mobile and desktop placement A). Share is a recipe action in the top row.** Icon on phone (between Edit and More), labelled pill on desktop, with the count of active links on it. Recommended: placement A. B (chip under the title) and C (More menu plus a status line) stay drawn. Source: placement.
207. **The count is of active links only** (not expired, not cancelled), and nothing shows at zero. Source: placement.
208. **Share opens in place:** a bottom sheet on phone, the right flyout lane on desktop, no navigation (DESIGN.md 6a). Source: placement, sheet.
209. **CONFIRMED (13 Oct 2026, owner, voice; desktop pill with S key hint). Desktop key S opens Share**, shown as a key hint like E and the comma. Not on phone. Source: placement. See O1 for how it closes.
210. **Every household member** can see, create, rename and cancel any link, not only its maker (as the shopping links, and R-O5 for recipe actions). Source: placement, manage.

### Creating a link

211. **SUPERSEDED by 247 (sheet option C confirmed; A is no longer recommended). One create screen, three answers, link made in place.** Name, how long it works, and "Keep it as it is today", then Create; the result replaces the form in the same sheet. Closing before Create makes nothing. Was recommended: sheet A. B (link made on open) stays drawn. Source: sheet.
212. **The name is for the household only.** The recipient never sees it. It can be renamed later in the links list. Its default text and length are open (O2). Source: sheet, manage.
213. **Expiry (AFFECTED by 247: option C as drawn adds a "Pick a date" chip, which the owner has not confirmed; see O13): 24 hours, 7 days or 30 days, 7 days by default.** The end is written plainly under the chips ("Ends Tue 20 Oct"). No custom date and no "never expires" (the owner said links expire). Source: sheet.
214. **Links are multi-use and expire.** Said once in the created state's line, not a control. Source: sheet; the owner's words.
215. **SUPERSEDED by 247 (usual by default, a choice only when other versions are available). The link shows one version, the one on screen when Share was tapped** (on opening, the household's usual). It is stated as text in sheet A and B, a choice only in C. Whether a link belongs to the recipe or a version is open (O4). Source: sheet, recipient.
216. **AFFECTED by 247, still PROPOSED and now open (see O13). Pinned by default: the link shows the recipe as it is today.** Later edits stay private. The switch "Keep it as it is today" (on) turned off makes the link follow the newest copy of that version. Reason: he shares a recipe he is happy with. Wrong guess: the recipient sees an old copy after he fixes a typo. Source: sheet.
217. **Copy link everywhere; the phone's own Share sheet on phone only.** The link is a read-only, selectable field. Source: sheet.
218. **A failed Create makes nothing,** says so, and offers one Try again; the form stays filled in. Source: sheet.
219. **After Done a toast** gives the end date ("Link ready. Anyone with it can view Egg fried rice until Tue 20 Oct."). The link then lives in the links list. Source: sheet.
220. **Nothing more in the first version:** no preview, QR, password, "who can view" setting or note to the recipient. Source: sheet.

### Seeing and managing links

221. **Links are listed where the recipe is:** a Shared section after Photos with a "Shared N" chip in the jump row, both present only while a listed link exists; the empty state is absence. Recommended: manage A. B (panel from the Share button) and C (a card above the ingredients) stay drawn. Source: manage. The seam with placement is O3.
222. **A row per link:** its name (tap or the pencil to rename in place), time left in words, opens count and last opened ("4 opens, last 2 h ago" or "Not opened yet"), Copy link and Cancel link. Active first, ended last. No URL text, no detail view, no bulk actions, no sort. Source: manage.
223. **Rename in place:** Enter or Save keeps it, Escape or Keep leaves it, an empty name keeps the old one. Maximum length is open (O2). The Keep button is a word, not a cross (SL-D19). Source: manage.
224. **Cancel is one tap with Undo for 5 minutes,** the recipe photos pattern (P-D17), no confirm dialog. Undo puts the same link back; after 5 minutes it stays cancelled. Nothing is hard deleted. A recipient who opens a cancelled link sees the "run out" page (decision 235). Source: manage.
225. **Ending soon means under 24 hours:** the row gets the accent border and the countdown turns accent. The recipient's expiring notice uses the same 24 hours (decision 237). Source: manage, recipient.
226. **Ended links stay listed, greyed, until renewed or removed from view.** Removing from view is a hide, not a delete, with the same 5 minute Undo. Source: manage.
227. **Renew gives the same link 7 days from now,** so a message already sent works again. Whether it should be the same URL is open (O8). Source: manage.
228. **"Opens" counts a person visiting the page,** not link-preview crawlers (WhatsApp, Signal and similar). "Last opened" is shown in words; exact times only on the end time, on hover. Source: manage.
229. **No cap on links per recipe or household is drawn,** though the shopping list caps at 3 (SL-D16). Open (O7). Source: placement, manage, sheet.

### The recipient's page

230. **One public page for everyone.** Signed in changes only the invitation slot, which becomes "Save to my recipes". Signed-in viewers see the same recipe. Source: recipient; the owner's words.
231. **What it shows:** banner photo, title, one-line description, time and servings, ingredients, method with step photos, notes without names. Print button, and a print stylesheet that drops every invitation. **Never:** stock or what is missing, reactions, cook counts, member names, who cooked, version history. The shared version is the one the sender chose. Source: recipient.
232. **No names anywhere, not even the sender's.** The page says it is from a Kitchie kitchen. Cost: less personal. Sender first name is open (O9). Source: recipient.
233. **Recommended invitation: a quiet top strip (logo, Sign in) that scrolls away, then one card after the last note** ("Liked it? Keep it in Kitchie.", Try Kitchie, I have an account). Rule used: nothing covers the recipe, moves it or sits ahead of it. B (slim bottom bar after about 35% scroll, dismiss lasts the visit) and C (banner above the recipe) stay drawn. Source: recipient.
234. **Signed in with Recipes: Save to my recipes** makes a copy that is theirs to change (the shared version only; it says "Saved. Open in Recipes" in place). **Signed in without Recipes: no invitation and no Save, no hint** (the no-hints rule). Source: recipient.
235. **Expired and cancelled links show one identical page,** "This link has run out", without the recipe name, so nothing leaks and a cancel says nothing about the sender's choice. Cost: a recipient cannot tell "turned off" from "timed out". Source: recipient.
236. **Ask for a new link drafts a message in the person's own messages app** (`sms:` link and Copy message). Kitchie never sees it and needs no sender contact. Source: recipient.
237. **An expiring notice in the last 24 hours,** small, in the flow, with the time in the viewer's own zone and a Print suggestion for people without an account. Source: recipient.
238. **Link preview uses the banner, title and one-line description;** with the link gone, a plain "A shared recipe" card. Source: recipient.
239. **Loading order on the recipient's page: words first, step photos next, banner last,** boxes sized from first paint so nothing jumps. Desktop CSS from 1024px only; `sms:` and print only on tap. Source: recipient.

### Cross-cutting

240. **Recommended path:** placement A, sheet C (confirmed by 247), manage A, recipient A (the hub). Source: all four.
241. **A link is a Recipe entitlement concern; there is no per-feature flag.** Whoever has Recipes has sharing; the recipient's page needs no entitlement. Source: integration brief (owner), not in the voice note. Treat as PROPOSED until the owner restates it.
242. **Default path loads one small stylesheet and script per slice;** the create sheet, links list and desktop host load on engagement, and viewport code lives in its own files (phone under 1024px, desktop from 1024px). Everything changes in place, no reload (DESIGN.md 6 and 6a). Source: all four.

### Share in the desktop recipe summary flyout

Slice: `fragments/recipe-share/flyout/`. Desktop only.

243. **CONFIRMED (13 Oct 2026, owner, typed and voice). The summary flyout has a Share button right next to the "Open full recipe" link.** It opens the share panel as a drill-in in the same flyout lane the summary uses, no navigation. Mobile has no summary flyout, so nothing changes there. Source: owner pick 3.
244. **The button's visual and wording are the flyout slice's proposal.** PROPOSED. The slice shows it and its notes say why.
245. **Whether key S also works while the summary flyout is focused,** and what the active-links badge shows there. PROPOSED, left to the flyout slice.
246. **Back behaviour of the drill-in:** how the person returns from the share panel to the summary (back control, Esc, or the lane's usual close), and whether the summary keeps its scroll. PROPOSED, left to the flyout slice; see also O1.

### Create sheet and invite (13 Oct 2026, owner, voice and typed)

247. **CONFIRMED. The create-link sheet is option C.** It shares "the usual" version by default, and a version choice appears only when other versions are available (a recipe with one version shows none). Supersedes 211 and 215; affects 213 and 216 (the date chip and the pinned choice are drawn in C but not confirmed, O13); answers O4 for the default.
248. **CONFIRMED. The sender may optionally attach an invite to a share link,** by an opt-in click in the sheet.
249. **PROPOSED. The invite switch defaults off,** so a plain share stays a plain share. Wrong guess: a sender who wanted invites must click each time, or one who did not sends an invite by accident.
250. **CONFIRMED. An invite is single-purpose:** if the link is passed around, only the first person to activate it claims the invite.
251. **PROPOSED. Later openers of the link still read the recipe** (the link stays multi-use and unchanged for reading); they simply have no invite to claim and see no invitation to it. Wrong guess: they get an error instead of the recipe.
252. **CONFIRMED. An invite sets up a NEW household;** it never joins an existing household.
253. **CONFIRMED. Sending an invite respects the member's maximum-invites limit.** Where the limit lives and its value are OPEN (unknown, not invented; O14).

Decision numbers 206 to 253. Confirmed: 206, 209, 243, 247, 248, 250, 252, 253. The rest are proposals.

## Open questions

Where two slices answered the same thing differently the contradiction is stated; where several asked the same question it is here once.

**Contradictions between the slices**

- **O1. Does Esc close the Share flyout on desktop?** Placement: plain Esc closes nothing, Ctrl or Cmd Enter closes (Pantry's rule, decision 53). Sheet: Esc or the x closes. Leaning (not a decision): follow Pantry, so the sheet's desktop flyout should change; the phone sheet keeps its x. Wrong guess: one key handler.
- **O2. The default name and its length.** Sheet: prefilled with the recipe title, 60 characters. Manage: a link without a name is called by its date ("Link, 13 Oct"), rename limit 40. A title prefill makes every link for one recipe look the same in the list; a date tells links apart but says nothing about who it is for; "For Mum" (sheet question 6) is the alternative. Wrong guess: the names column of the list is useless until renamed.
- **O3. Where the link list lives.** Placement's tap on the Share icon opens a stub that lists the links with Cancel (no Undo) and Make a link. Manage recommends the list as a section in the page, and its own option B is that panel. With both recommended, links would be listed in two places. Possible glue (not drawn): the icon opens the create sheet, and when links exist it also scrolls to the Shared section. Wrong guess: a rework of one slice's entry point.
- **O4. Is a link for the recipe or for one version?** Placement puts the entry on the recipe, not a version. Sheet pins the version on screen. Recipient shows the one the sender chose. A recipe with versions needs an answer: the version on screen, the household's usual, or a choice in the sheet. Wrong guess: someone shares "With peas" and the recipient sees the Original.
- **O5. What the count means.** Placement's badge counts active links; manage's "Shared N" chip appears while a *listed* link exists, which includes ended ones. They could show different numbers on one recipe. Pick one meaning.

**Owner follow-up**

- **O12. Did "A" also mean the links list and recipient page?** The owner confirmed placement A on mobile and desktop and, separately, sheet C (247). Manage A and recipient A stay PROPOSED (recommended) until he says.
- **O13. In sheet C, are the pinned-or-follows radios and the "Pick a date" chip kept?** Sheet C as drawn has both; the owner confirmed only the usual default and the conditional version choice. Affects 213 and 216.

**Invite (decisions 248 to 253)**

- **O14. Where does the maximum-invites limit live, and what is its value?** Unknown; not invented. Owner or Platform to say. Also: what the sender sees at the limit.
- **O15. Default of the invite switch** (249 proposes off).
- **O16. What happens to an unclaimed invite when the link expires or is cancelled?** Voided, or kept claimable? Does the invite slot come back to the sender's limit?
- **O17. What can an already-signed-in person without a household do** with an invite: claim it and get a new household, or only sign up fresh?
- **O18. What does the new household start with?** Empty, or defaults. Does the claimer get the Recipe entitlement?
- **O19. Is the shared recipe copied into the new household** (as Save does, decision 234), or only the invite is claimed?
- **O20. Abuse limits on claiming:** attempts per link, rate per address or device, and what the claimer sees on failure.

**Questions several slices asked**

- **O6. Default expiry and longest expiry.** 7 days is drawn everywhere it matters (create, Renew); 24 hours and 30 days are the other chips. Placement's stub shows 5 and 12 days only as sample text. Growth might want longer; the owner said links expire. One constant.
- **O7. A cap on links per recipe or household.** Shopping caps at 3. Not drawn in any slice; matters most for sheet B, which makes a link on every open.
- **O8. Does Renew keep the same URL** (drawn, so old messages work again) **or make a new one** (safer if the link leaked)?
- **O9. Does the recipient's page name the sender** ("Shared by Sam")? Less private, more trust.
- **O10. Does a recipe with no settled version or never cooked offer sharing at all** ("a recipe he is happy with")?
- **O11. The word on the button:** "Share", "Share this recipe", or a hand-off wording like the shopping list's? Does the phone need the word too (placement B) if the icon is missed?

**Other open points, from one slice each**

- 360px phone top row is tight with five controls (placement).
- Is every open counted or distinct visitors? Drawn: every open, previews excluded (manage).
- Should cancelled and removed links be searchable in the History feature (manage)?
- Does a signed-in viewer's Save need a household choice when they belong to one household only? Assumed no. Does Save keep the shared version only or the whole family? Assumed the shared version (recipient).
- Preview crawlers fetch without cookies: the banner must be fetchable through the signed link or the unfurl has no photo (recipient).
- Can a recipient ask for a new link through Kitchie so the sender gets a notice? Needs a contact route for people with no account (recipient).
- How will the owner know the invitation works (clicks on Try Kitchie, by option)? Nothing is measured, and measuring must not need a cookie banner on a no-sign-in page (recipient).

## For the implementation

- **Mockup first, then Kitchie `uat`.** Never `main`, never tags. The built app matches the mockup exactly: copy the mockup's markup and CSS first and list each difference in the PR (AGENTS.md).
- **One service, two doors.** Chat tools and the UI call the same service methods for create, list, rename, cancel, renew and remove-from-view. Nothing is reimplemented in the UI.
- **Entitlement:** a link is a Recipe concern; no per-feature flag (decision 241). Nothing about stock or the household is loaded on the public page.
- **Lifted names:** the manage row classes (`rs-row`, `rs-name`, `rs-left`, `rs-stats`, `rs-acts`, `rs-undo`) and the create sheet's `sh-*` are what a build lifts. Sample data and `kitchie.example` links stay in the mockup scripts.
- **Unknown, not to be guessed:** how a signed URL is made and checked, where links are stored, how opens are counted without counting crawlers, whether Recipe or Kitchie serves the public page, and how a banner is fetched through a signed link. Nothing in the mockup answers these.
- Default path and deferred loading per slice are in each slice's `notes.md` (DESIGN.md 6 and 7).
