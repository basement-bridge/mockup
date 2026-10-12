# Profile: the quiet About line

Mockup only (`fragments/profile-about/`). Decision SW-83 is **PROPOSED**; open questions SW-O57 to SW-O60 are awaiting the owner. Numbers continue the Settings window series (`settings-window.md`, last used SW-82 and SW-O56).

## The owner's words

Voice, 12 October 2026. The transcript is garbled; as received:

> "add abscured about in the profile some pretty. much insignificant to report the tag number of recipe, platform and kitchie only if the deployment is not prod. we have a ......slug somewhere we can use"

## The agent's reading (a Proposal, to be corrected)

An "About" line in the profile that is pretty, obscured and deliberately insignificant: small, low contrast, at the very bottom, not a feature. It reports the release (tag) number of Recipe, Platform and Kitchie, only when the deployment is not production. "We have a slug somewhere" is the environment slug that already exists.

## SW-83 (PROPOSED). The About line

- **Where.** Phone and tablet: the last thing on the profile menu (`/menu`), under Sign out. Desktop: the foot of the Profile window's left gutter, under the section list. Nowhere else; Settings, the Household and Me pages and the page footer do not carry it.
- **What it says.** `Kitchie v0.101.0 · Platform v0.1.7 · Recipe v1.1.0` (sample numbers). The versions are the ones each service already reports. A version that starts with a digit is shown with a `v`.
- **How quiet.** 11px, the muted text colour at 70 per cent opacity, letter-spaced a little, dots between the three. Not a link, not a button, no icon, no tooltip, not in the tab order. Text can be selected and copied (so it can be pasted into a bug report). Theme tokens only (`--muted`); no new value.
- **When.** Only when the deployment is not production. On production the element is not drawn and nothing is fetched for it: no gap, no empty line.
- **A missing service.** If Platform or Recipe is down, not served, or says nothing about its version, it is left out of the line. Never "unknown", never a dash, never an error. Kitchie always knows its own version, so the line is never empty on a non-production deployment where Kitchie runs.
- **Only what the household holds.** Recipe is named only for a household that holds Recipe (the product UI never hints at a product a household has not enabled).
- **The slug.** `ENVIRONMENT_SLUG`, owned by Platform, published at `/.well-known/platform-environment.json` as `{"environment_slug":"uat"}` or `null` for production. Kitchie already reads it (`platform-environment.ts`) for the session cookie name and the header's "(uat)". Not invented here.

## Build contract (so the build matches the mockup)

- Markup, identical: `<p class="about" data-about><span>Kitchie v0.101.0</span><span>Platform v0.1.7</span><span>Recipe v1.1.0</span></p>`.
- CSS: `fragments/profile-about/about.css` goes into the profile menu's CSS unchanged; `about-rail.css` (desktop only, 1024px and up) goes into the desktop Profile window's own stylesheet.
- Kitchie draws the element on the server, inside the `/menu` page; the desktop Profile window already reads that page once and lifts the element into its gutter. No new endpoint in Kitchie, no new script.
- Platform adds one optional key to the existing member route (`GET /api/member?release=1`), present only on a deployment with a slug and only when asked. Kitchie asks only when its cached slug is not null.
- Recipe changes nothing: its version is already in its manifest and health answer, which Platform reads.

## Loads (DESIGN.md section 6)

- Production: nothing extra. The element is not in the page, no request is made, no CSS rule applies (the rules cost under 1 KB inside the profile menu's existing inline CSS).
- Non-production: one request from Kitchie to Platform when the profile opens (never on page load, never on Home, Pantry or any other screen), answered from Platform's cached product check. The desktop window adds no request of its own: it reads the same `/menu` page it already reads.

## Open questions

- **SW-O57. Is "the tag number" the version the service reports, or the git tag?** The mockup assumes the reported version (`PLATFORM_VERSION` or the package version, a product's manifest version), because that is what the services publish today. On UAT these can differ from a release tag (for example Kitchie's package says 0.100.1 while its newest tag is v0.88.0 and the owner's example said v0.101.0). If the owner means the git tag, the deploy has to pass the tag in (infra change). A wrong guess costs: the line shows a number the owner does not recognise.
- **SW-O58. When Platform cannot be reached, show only Kitchie's own release, or nothing?** The mockup shows Kitchie's own (frame 6) because it is always known. A wrong guess costs one line either way.
- **SW-O59. Standalone Kitchie (no Platform).** There is no slug, so nothing is drawn. If the owner wants it on a standalone test deployment, that needs a setting; the mockup does not draw one.
- **SW-O60. Placement on desktop.** The gutter foot is a Proposal; the alternative is the foot bar of the window beside the key hints. The gutter keeps the key hints bar unchanged.
