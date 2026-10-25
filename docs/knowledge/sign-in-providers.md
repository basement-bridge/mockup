# Sign-in with six providers (Kitchie's sign-in screen for the built WorkOS and Clerk sign-in)

Mockup: `fragments/sign-in-providers/` (`index.html` the options and notes, `screen.html#o=a|b|c&s=...&t=day|night` one frame; the hash settings are listed at the top of `si.js`). Owner request: Arjan, typed, 26 October 2026: mock up the sign-in screen for the built WorkOS and Clerk sign-in (platform PR #134, issue #128, merged into `uat`), straight into mockup `main` (exception `mockup-direct-to-main`), and say what it looks like. Six buttons, three through WorkOS (Google, Apple, Microsoft) and three through Clerk (Facebook, X, TikTok); no email and password, no phone, minimal data. **Mockup only. Nothing built, nothing approved. Every decision below is proposed; none is confirmed.** The owner converts this into an issue once a direction is chosen.

## What exists (read from code on 26 October 2026, not run, not seen on a screen)

Read from `basement-bridge/platform` `uat` at `b53453f` (`apps/portal/src/pages.ts`, `server.ts`, `authn-vendors.ts`, `authn-workos.ts`, `authn-clerk.ts`, `authn.ts`) and `basement-bridge/kitchie` `uat` at `32f66eb` (`server/src/skin.ts`, `web-signin.ts`, `platform-config.ts`). **The built app has not been checked against the mockup.**

- **Platform's own `/signin` page** (`signInPage`): heading "Platform", one line "Sign in to see what your household has.", then one full-width accent button per provider that is on, "Sign in with {label}", no glyphs. Beside a direct Google button the WorkOS one is labelled "Google (WorkOS)". Order is by vendor: direct providers, WorkOS (Google, Microsoft, Apple), Clerk (Facebook, X, TikTok). Dev sign-in below. Reached only by typing its address.
- **Kitchie's sign-in screen** (`signInPageHtml`), the one a person meets: the kitchen, "Welcome to Kitchie", one primary button "Continue with Google". The provider is a fixed value (`PLATFORM_PROVIDER = "google"`) sent to Platform's `/auth/start`. **So the six buttons exist in Platform but Kitchie's screen cannot offer them yet.**
- **Redirects only**: Platform answers `/auth/start` and the callback with 303s. Failure goes to Kitchie's `/signin?signin_error=1` ("That sign-in didn't work. Please try again."); a verified account with no member goes to `/not-a-member` ("Good kitchens start with an invite."; its ghost button reads "Use a different Google account"). Nothing is drawn for redirecting or returning.
- **A provider is off when its key is not set**: WorkOS needs `WORKOS_CLIENT_ID` and `WORKOS_API_KEY`, Clerk needs `CLERK_PUBLISHABLE_KEY`, `CLERK_OAUTH_CLIENT_ID` and `CLERK_OAUTH_CLIENT_SECRET`; some-but-not-all stops start-up.
- **Stored**: provider name plus the vendor's subject id. No linking: two buttons are two members.
- **Own page or vendor page**: see the vendor section below. The WorkOS flow goes from Kitchie's page straight to the provider; the Clerk flow goes through a Clerk-hosted page.

## The three options (phone 360 and 390, desktop 1280, light and dark; frames in the fragment)

- **A, one column.** Six full-width buttons, glyph and one word each, "Continue with" once above. All visible; the kitchen shrinks to a strip on a small phone.
- **B, two across (recommended).** Google first and in the accent, then Apple, Facebook, Microsoft, X, TikTok, two to a row. All six on screen with the kitchen in view, one tap each.
- **C, one button, the rest folded.** One full-width button, "Other ways" opens the other five in place (plain `details`, no script). Calmest; most people pay a second tap on a new phone because there is no last-used button to promote.

Why B: DESIGN.md 9.1 and 9.3 ask for icons, short labels and one accent, and the owner's order (Google, Apple, Facebook, Microsoft first) assumes people see their own provider. B does that without hiding anything and without squeezing the kitchen (9.10). C is better only for people who return on a known phone.

## States drawn (on B)

Redirecting (pressed button "Opening…" with a spinner, others dim); back from the vendor (only if slow: "Checking it's you"); error and session ended (the built lines); Clerk off (three buttons, the odd one spans); WorkOS off; everything off (the built "Sign-in isn't available right now"); last used on this device (tick and accent move, order fixed). Frames for "two buttons, two members" N1 (nothing, as built), N2 (a line under the buttons, always), N3 (a line on the invite-only screen only, recommended).

## Own look or vendor page (from the vendors' docs, 26 October 2026)

**Short answer.** Kitchie's own screen is always first, and the WorkOS buttons can go straight to the provider with no WorkOS page in between. What remains that is not Kitchie's: the provider's own consent screen (never Kitchie's look), and, as built, a Clerk-hosted screen for the three Clerk buttons.

1. **WorkOS, as built: own page.** Platform sends `https://api.workos.com/user_management/authorize` with `provider=GoogleOAuth|MicrosoftOAuth|AppleOAuth`, PKCE and its state. WorkOS's reference says that without `provider=authkit` you name one connection, organisation or provider and the URL sends the person to that identity provider. Confirmed in the docs: `GoogleOAuth` (Google integration page) and `AppleOAuth` (example value on the reference page). `MicrosoftOAuth` is named in prose, value not shown. **Not run against WorkOS** (#134 says the same).
2. **WorkOS hosted UI (not what was built).** AuthKit sits at an AuthKit URL (`<random-phrase>.authkit.app` in staging, a custom domain in production); "customizable domain and branding" through the Dashboard and page CSS, within the hosted domain's limits; it brings sign-up, password, email and MFA we do not want. The **headless** Authentication API builds and owns the UI entirely; for social only that is the built flow.
3. **Clerk, as built: Kitchie's page, then a Clerk-hosted page, then the provider.** Clerk is an OpenID Connect provider to Platform (browser to `<Frontend API>/oauth/authorize`). Clerk's docs say users authenticate with their Clerk credentials there, which implies Clerk's own sign-in page (the Account Portal); the page fetched does not say so outright. Per #134 all three buttons begin at Clerk and the button only names the stored provider: **pressing "X" does not make Clerk show X**; whether Clerk can preselect a social is unverified.
4. **Clerk hosted Account Portal.** "Hosted on Clerk servers"; a random subdomain of `accounts.dev` in development, `accounts.<your-domain>` in production; "cannot be customized beyond the options provided in the Clerk Dashboard".
5. **Clerk own buttons (custom flow).** Kitchie's buttons call Clerk's browser SDK (`signIn.sso(...)` in the React example, a strategy such as `oauth_google`) and go to the provider with no Clerk page. A different design: a Clerk script on Kitchie's page (Kitchie's pages carry no third-party script) and a Clerk session in the browser instead of the one OpenID Connect code Platform checks. Not built, not costed.
6. **What shows during the hop.** WorkOS to Google: by default "Choose an account to continue to workos.com" (Google names the redirect host). Staging uses WorkOS's default Google credentials and "Google's authentication flow will display WorkOS' name, logo, and other information". Production needs our own Google credentials; a custom domain removes `workos.com` from the wording. Clerk: development uses "preconfigured shared OAuth credentials and redirect URIs"; production needs our own credentials (Apple needs a Services ID and key). What the shared credentials show on the provider's screen: not stated.
7. **Free tiers.** WorkOS: free to 1 million monthly active users; social login in "Batteries included", no separate price; **custom domain $99 a month** (covers AuthKit, Admin Portal, email sender); custom branding a further fee, price not listed. Clerk Hobby: 50,000 monthly retained users per app, **up to 3 social connections** (our three exactly; a fourth needs Pro), custom domain listed as included on Hobby (pricing page; verify), Clerk-branding removal is Pro or Business.

**Could not fetch**: WorkOS `/docs/authkit/hosted-ui` and the social-login guides directly (read the `.md` copy, the blog and the reference instead); WorkOS Apple and Microsoft integration pages (so what Apple and Microsoft show during the hop, and Apple's developer cost, are unchecked); WorkOS branding page (price of custom branding); Clerk's "How Clerk implements OAuth" and the OAuth reference (what Clerk's authorize page and consent screen look like; preselecting a social); Clerk shared-credential consent branding. No real sign-in with either vendor was run.

## Decisions (all proposed, none confirmed)

- **SP-1.** Layout B; A and C kept for comparison.
- **SP-2.** Fixed order Google, Apple, Facebook, Microsoft, X, TikTok. Built order is by vendor; the composition list in Platform changes.
- **SP-3.** One accent: Google, or the button last used on this device; a tick marks last used (shape, not colour alone). The order never moves.
- **SP-4.** Glyph and one word per button; "Continue with" once above (one button alone reads "Continue with Google").
- **SP-5.** A provider with no key is absent (not greyed, not explained). One on: one button. None: the built "Sign-in isn't available right now".
- **SP-6.** Redirecting: "Opening…" and a spinner on the pressed button, the rest dim and stop taking taps; plain link without script.
- **SP-7.** Errors stay neutral, never naming a vendor or a reason.
- **SP-8.** Back from the vendor: nothing unless slow (about a second), then "Checking it's you".
- **SP-9.** Two buttons, two members: nothing on the main screen, last-used tick, one line on the invite-only screen (N3). N1 and N2 drawn.
- **SP-10.** "Use a different Google account" becomes "Try another sign-in".
- **SP-11.** Desktop: the same centred column (30rem), a taller kitchen.
- **SP-12.** Glyphs are one-colour stand-ins, not the vendors' marks; real marks and button rules before any build.

## Open questions

- **SP-O1.** Kitchie's screen only knows Google. How does it learn which providers are on: a list in Kitchie's configuration, or a read from Platform? A wrong guess shows a button that fails or hides one that works.
- **SP-O2.** Platform's own `/signin` page is plain with seven accent buttons: restyle to match or leave?
- **SP-O3.** Keep direct Google beside Google by WorkOS (two members)? If WorkOS is off, Google disappears.
- **SP-O4.** Clerk's three buttons start at one Clerk screen: accept a second choice there, or should the button decide?
- **SP-O5.** Clerk custom flow (own buttons, no Clerk page): different architecture; worth costing?
- **SP-O6.** Accept "continue to workos.com" on Google's screen (custom domain $99 a month; owner pays nothing)?
- **SP-O7.** Production: developer apps and review for Facebook, X, TikTok; Apple credentials; own Google and Microsoft credentials (owner actions in #134); each vendor's button rules.
- **SP-O8.** Leave the welcome line and invite-only footer as they are?
- **SP-O9.** A per-device cookie with the last-used provider id (no account, no name): allowed?
- **SP-O10.** Look at it on a real phone on UAT once the keys exist; nothing here proves how WorkOS or Clerk behave.

## Review and checks

- **The separate senior-mobile-UX design review required by `AGENTS.md` and DESIGN.md 9.8 has not been done** (no agent available to hand it to in this session). The builder's own checklist answers are on the fragment page and do not count as that review. It must happen before a build.
- Checked in headless Chromium, 360, 390, 768 and 1280, light and dark: no sideways scroll, controls 44px or more, no clipped names, no page errors, on every frame; C folds and opens in place; a press shows the redirecting state and returns; the options page scales its desktop frames. Not checked: a real phone, Safari, text size +30%.
- **Default path and deferred (DESIGN.md section 6):** the frame loads the shared theme, `si.css`, `si.js`; no image, no request after load. In the app the six glyphs are inline SVG (no request); the only script is the redirecting state (about 1 KB, optional). Option C's fold is a plain `details`.
