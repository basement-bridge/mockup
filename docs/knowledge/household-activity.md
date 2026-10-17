# Household activity: the bell, what a tap shows, the setting (Kitchie #110)

Status: mockup for the owner to review (17 Oct 2026). Not built here: Level 1 (the bell with a number) is already in Kitchie `main` (PR #126, plan row 0.12.50, 3 Oct 2026); this mockup is the design record for it and for what is still open. Level 2 (device notifications) is drawn as an idea only, it is **not approved**. Lines marked **Proposal** are choices the mockup made where the owner was silent; **Open** lines are not decided. Merging this mockup settles none of them.

Mockup: `fragments/household-activity/` (notes page `index.html`; phone `app.html`; desktop `desktop.html`; code `activity.css` (PART 1 is for the build), `activity.js` (PART A is what the server derives), `sample.js` mock only). Check: `tools/household-activity-check.mjs` (390 px, 360 px, 1280 px, light and dark). Source: Kitchie issue #110 (body, the measurements comment, the owner's comment of 1 Oct 2026, the status comment of 3 Oct 2026). Sits beside the History decisions in `history-options.md` (H1 to H15) and must not contradict them (section "History: how the two fit").

## What the owner said (Kitchie #110, 1 Oct 2026, written comment)

> build to L1
> Notify everybody but that should be respecting the recipients setting for notification in their browser default household activity remove
> Added and use up

The second line is garbled (dictation). The plan row for the built Level 1 read it as a browser-only setting "Show household activity", on by default. The mockup keeps that reading and lists the other readings as HA-Q1 and HA-Q3.

## Owner decisions (numbered)

- **HA-D1. Build Level 1 only for now.** In-app activity first; device notifications (Level 2) are a separate later decision. ("build to L1", answer to the issue's question 1.)
- **HA-D2. Changes with no known person notify everybody.** The shared AI address has no member, so those changes are "Someone". (Answer to question 2.)
- **HA-D3. Each recipient's own setting decides whether they see it.** "Respecting the recipients setting for notification in their browser." Level 1 reading: a per-device, browser-only setting, Settings > Show household activity, on by default, saved on the device and never sent to the server. Whether the owner also meant the browser's own notification permission (Level 2) is HA-Q3.
- **HA-D4. What counts: items added and items used up.** (Answer to question 3, "Added and use up".) A plain removal (deleting an item) is **not** counted. This is how the mockup reads "added and use up" and the stray word "remove"; the built Level 1 counts removals too (see HA-Q1, HA-Q2).
- **HA-D5. Level 1 is the shape in the issue body**, which carried the label "approved for build": a small indicator in the header for other members' changes since the member last looked; one stored number per member (no row per item per member); one summary per burst by person; the cue ends after about 24 hours; no polling (the badge is worked out when the page opens and when it returns to the foreground, from the same small `/changes` call); the History page stays the durable record; a member away for weeks sees a count, not a flood. A member's own changes are never counted.

## What is built today (Kitchie PR #126), so the mockup starts from facts

A bell with a number in the header, before the profile and search buttons, hidden at zero, `9+` above nine. It links to History. The sentence ("Sam added 2 items and removed 1 item; Someone added 1 item") exists only as the link's `title` and `aria-label`, so a touch screen never shows it. Counts and names only, never item names. Last 24 hours, other members only, undone entries and undos skipped, shared address as "Someone". Opening History moves the member's `activity_seen` number to now. `/changes` returns `activity: { total, text }`. The setting is `showActivity` in `kitchie.settings` (browser only). No peek, nothing on desktop, no Level 2.

## What the mockup draws

1. **The bell** (phone header, desktop rail). Phone: left of the profile button, 44 px target, the number on its top-right corner (`4`, `9+` above nine). Desktop: a rail item labelled Activity just above the profile button, number in the same accent badge as Shopping's count. Hidden at zero and when the setting is off. States: `?scene=none|one|few|many` (none, 1, 4, 9+).
2. **A tap, two ways.** Option A: straight to History (as built). Option B (default here): a small peek card first, then History. Phone: a card under the header over a scrim. Desktop: the same card in the right lane (one parent flyout at a time, `docs/handover/desktop.md` section 2). `?option=a|b`.
3. **The peek** (option B). Title "Since you last looked", one line "What others added or used up in the last 24 hours. Your own changes are not counted." One row per person per burst: initial (a link glyph for the shared address), "**Sam** added 5 items", "Today, 8:05 to 8:12 am". Up to four rows, then "and n more in History". Buttons: Open History (the catch-up, H4), Settings. Close with X, the scrim or Esc on phone, Ctrl/Cmd+Enter on desktop (the standing close rule). Nothing is fetched to draw it.
4. **The setting** (`?screen=settings` on phone, `?open=settings` on desktop): one check row, "Show household activity", between the existing rows. Off hides the bell and the peek on this device.
5. **Level 2 as an idea**: a dashed card "Notify this device", tagged "Later, not approved", with its states (`?push=off|on|blocked|ios`) and what a notification says. It exists so the owner can see what the later decision would add to Settings. It is not part of Level 1.

## Proposals (the owner was silent)

- **HA-P1. Placement.** Phone header: bell left of the profile button (the app's order, `.hdr`: activity, profile, search). Desktop: a rail item above the profile button, not in the column header (the column header is the list's own controls). Wrong guess costs one move of one element.
- **HA-P2. Badge colour from the tokens.** The accent with the on-accent text (the same family as the desktop rail's counts and History option D's `.ib .n`), not the built red (`var(--danger)` with `#fff`). Red reads as an error or a warning, and nothing here is one. Cost of a wrong guess: two CSS values.
- **HA-P3. A tap opens the peek first (option B, recommended); A is the as-built fallback.** The sentence the built bell hides in a tooltip is what makes "N new" useful, and it is the aggregation the issue asks for ("5 items added by Sam"). It also follows `DESIGN.md` 6a (in place, not a refresh). The peek's one button leads to the locked History catch-up, so H4 is untouched. Cost of choosing A: the summary stays invisible on touch; cost of B: one small card and one call that moves the cursor.
- **HA-P4. Burst rule.** Same person, same kind of change, gaps of at most 30 minutes are one row; a different kind or a longer gap is a new row. Rows newest first, up to four, then "and n more in History". Counts only, never item names (as built); the names are in History. The shared address is "Someone", with "through the shared AI link" on the second line. Wrong guess costs one constant (`GAP`, `CAP` in `activity.js`).
- **HA-P5. Two cursors, so H11 holds.** The bell's cursor (`activity_seen`, built) moves when the member opens the peek or History. The History catch-up's "since you were last here" moves **only** on the tick (H11). Opening the bell therefore never marks the catch-up caught up; the tick **also** clears the bell (caught up means seen). Cost of a wrong guess: if the owner wants one shared cursor, opening History would have to stop clearing the bell or start clearing the catch-up, which H11 forbids. See HA-Q4.
- **HA-P6. The cue ends after 24 hours** (from the issue). Someone away for days sees no bell; the catch-up (three days with activity, H6) is the way to see more. A very busy day shows `9+` and four rows plus "and n more", not a flood.
- **HA-P7. The bell hides at zero** (as built), so the header stays quiet. When the peek is open the bell stays (pressed) until it closes, then hides, and focus moves to the profile button.
- **HA-P8. The setting is on by default** (the plan row's reading) and is a check row like the others on the settings page. Off also stops Level 2 on this device if it is ever built.
- **HA-P9. Only household-visible changes count.** Pantry adds and use-ups are household scope. Another person's personal records (stars, votes, preferences) are never counted, which keeps D6 and D7 of History option D. Recipe and Plan changes are not counted in Level 1 (the owner's words are pantry words); see HA-Q6.
- **HA-P10. Desktop key.** Close with Ctrl/Cmd+Enter (`desktop.md` section 1). No key to open the peek is drawn, to avoid a clash with `G`, `M`, `,` and the others. See HA-Q7.
- **HA-P11. Level 2 settings card and states** (idea only): off (Turn on), on (counts only, one per burst, Turn off), blocked in the browser (how to unblock, no button), iPhone not on the Home Screen (needs iOS 16.4 or later and Add to Home Screen), and disabled while Show household activity is off. A notification says "Our kitchen: Sam added 5 items": counts only, never item names, never to the person who made the change, one per burst after a quiet gap (a number to measure before any build), a tap opens History.

## Open questions (what a wrong guess costs)

- **HA-Q1. What did "default household activity remove" mean?** Readings: (a) the setting's default (Show household activity on); (b) removals (deleting an item) are not counted. **Recommended:** both (a) and (b), as drawn. Cost: a filter line and a default flag.
- **HA-Q2. Can the journal tell "used up" from "removed"?** The plan row says both are journal `remove`. **Recommended:** if the build cannot tell them apart, keep counting both and word the line "used up or removed" until it can, rather than miscounting. Cost: wording only.
- **HA-Q3. "The recipient's setting for notification in their browser": is it the in-app setting (Level 1) or the browser's own notification permission (Level 2)?** **Recommended:** Level 1 now (the in-app setting). If Level 2 is ever approved, a push needs **both** (the row on and the browser permission granted) and the browser prompt only appears after the person taps Turn on, never on page load. Cost of a wrong guess: none now.
- **HA-Q4. Should opening the bell also mark the History catch-up caught up?** **Recommended:** no (H11 says only the tick does); the tick clears the bell. Cost: one cursor more, or a visible inconsistency.
- **HA-Q5. Peek first (B) or straight to History (A)?** **Recommended:** B (HA-P3).
- **HA-Q6. Do recipe and plan changes count (a new version, a planned meal)?** **Recommended:** not yet; Recipe history is pulled by Kitchie later (`history-options.md`). Cost: a second kind of row.
- **HA-Q7. Should the bell have a keyboard key on desktop, and does it belong in the rail rather than the column header?** **Recommended:** rail, no key for now.
- **HA-Q8. Level 2 approval.** It adds a long-lived secret (VAPID private key), a subscription table, a new outbound path and a public endpoint to protect (rate limits, subscription caps). Cost: no fee. On iPhone it works only for the installed Home Screen app (iOS 16.4 or later). Aggregation must happen before sending (debounce), and a debounce and write-amplification check comes first. Per `AGENTS.md` (Kitchie) it needs the owner's explicit approval in the plan before any build. **Recommended:** keep it deferred until the owner has used Level 1 for a while.
- **HA-Q9. Is "Someone" the right word for the shared AI address?** **Recommended:** yes for now; it goes away when everyone uses personal links (`MCP_REQUIRE_LINK=1`, separate pending decision).

## History: how the two fit (no locked decision is changed)

- **H4, H8 (the catch-up is History's entry):** the peek's Open History and the notification's tap both go to the catch-up. Nothing new competes with it.
- **H6 (three calendar days with activity) versus the bell's 24 hours:** different jobs. The bell answers "is there news right now" with counts; the catch-up answers "what did I miss" with the changes themselves. The bell never fills the catch-up and the catch-up never changes the bell's window.
- **H11 (tick marks caught up, the X does not):** unchanged. HA-P5 keeps two cursors for this reason.
- **H9, H10 (no assistants as a separate kind):** an assistant acting through a member's personal link is shown as that member; only the shared address, which has no member, is "Someone".
- **D6, D7 (others' personal entries stay private):** HA-P9.
- The History question "is last seen stored per person on the server or per device" (shared question 8) is **per person on the server** for the bell (the built `activity_seen`). The catch-up's cursor is still open there.

## For the build

Copy PART 1 of `fragments/household-activity/activity.css` and the markup in `app.html` and `desktop.html`. Differences from the built Level 1 (`server/src/app.ts` `activityBadge`, `server/src/layout.ts`, `server/src/assets/refresh.js`), each to be listed in the Kitchie pull request:

1. `.activity-badge .n` uses `var(--accent)` and `var(--on-accent)` (was `var(--danger, #c0392b)` and `#fff`), 20 px high, offset `-6px` (HA-P2). On desktop the bell is `a.nv.activity-badge` in the rail; the element id stays `activity` so `refresh.js` updates it (only one of the two layouts is in a page).
2. Option B: the link keeps `href=".../history"` (works without script) and the script adds `role="button"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls="actpeek"`, and opens the peek instead of navigating.
3. `/changes` returns `activity: { total, text, rows: [{ who: "Sam" | null, kind: "added" | "used", n, from, to }] }`. `text` stays for the `aria-label`. The peek is built in the page from `rows` (no fetch); `from` and `to` are the first and last change of the burst.
4. Counted kinds follow HA-D4 (added and used up; plain removals out) once HA-Q2 is answered. Burst grouping (HA-P4) is done on the server from the journal rows the query already reads (`seq` range, `member_id`, kind).
5. Opening the peek moves the member's `activity_seen` with one small request (new, tiny: the built one moves it only as a side effect of GET `/history`). Opening History keeps doing so.
6. Desktop only: the peek renders in the existing right lane, replacing whatever parent flyout is open; Ctrl/Cmd+Enter closes it.
7. Settings: the existing `s-activity` check row, with its helper line.
8. Level 2 is **not** part of this build.

## What the default path loads, and what is deferred (`DESIGN.md` section 6)

- **Loads on open:** the bell's markup (about 0.4 KB, always in the page and hidden at zero) and about 1.5 KB of its CSS in the layout stylesheet. The number and the rows ride the existing `/changes` call (on open and on returning to the foreground). No new request, no timer, no polling.
- **Deferred until asked:** the peek is drawn on tap from data already in the page, in place (section 6a); one small request moves the cursor on open; History loads only if Open History is tapped; the Settings card loads with the settings page.
- **Level 2 (if ever approved):** nothing loads until the person taps Turn on: then the permission prompt, one subscription request, and a small service-worker push handler. A debounce and write-amplification check comes first.
- **Never loaded:** other people's personal entries, item names (counts only).
