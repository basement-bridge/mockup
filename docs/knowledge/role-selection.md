# Kitchen role selection: today, and three options

Fragment: `fragments/role-selection/`. Mockup only; nothing built or approved. Owner (Arjan), voice, 1 Nov 2026; mockup built 4 Nov 2026.

## Owner's words

The role screen "feels counterintuitive compared with everything else on the site", and every sign-in lands on it ("every time I log in I am directly taken to the choose-the-role screen"). Expected: only a genuinely new sign-up sees role selection. The redirect itself is a separate bug (hand-off log, same request).

## Why the screen keeps returning (read from `server/src/web-welcome.ts` on uat)

- The welcome is "first" per BROWSER: the `kitchie_welcomed` cookie, set only by "Take me to the kitchen".
- "Later" saves nothing and sets nothing by design, so the welcome returns at the next sign-in. A new browser or cleared cookies bring it back too. Nothing is stored per member.
- Consequence for every option here: Skip must be final, and "seen" must be a fact about the member (or the role), not the browser. That change is in the bug fix, not in this mockup.

## Today (drawn from `skin.ts` and `welcome.js`, not a screenshot)

Kitchen scene, three perks, "Pick a role you like playing", a 3 by 2 tile grid (icon, name, two-line tagline; taglines hidden under 760px of height), then a full-width "Take me to the kitchen" and a quiet "Later". After the first tap the hero hides and an editor (icon, name, tagline) opens in its place.

## Options

- **A Grid and preview.** Six icon-and-name tiles, one preview card with the tagline and a pencil, Save off until you pick, Skip always. Desktop: tiles with taglines left, preview and buttons right.
- **B Swipe, same as the Menu rotary (recommended).** One role at a time, snaps to one, no neighbours peeking, one-time wiggle. "Use this" and Skip. Desktop: arrows, arrow keys, an icon strip.
- **C No step.** New sign-ups go straight in; Home shows one card with the six icons (tap sets it with Undo, the cross dismisses for good).

## Proposals (the mockup chose where the owner was silent)

PR-1 phone title "Your role", desktop "Your kitchen role", no helper text on the phone. PR-2 scene and perks leave this screen. PR-3 Skip and a saved role count as seen per member. PR-4 a role cannot be cleared here (as on the Menu person row). PR-5 an icon outside the drawn set shows the sparkle (default-look principle). PR-6 name and tagline stay editable through the pencil, with the existing 32 and 80 character limits.

## Open

Q1 which option. Q2 does a brand-new person still get the welcome (scene, perks) before the role. Q3 in C, does a dismissed card ever come back (proposal: never).

## Not done

`tools/` check script (tools/ goes by PR, not straight to main); +30% text size drawn (sizes are px here, the build uses rem and `--hs`); a real phone. Today's desktop width is approximate.

## Performance

One stylesheet and one ~3 KB script, inline icons, no images, no requests; nothing is deferred because nothing is heavy.
