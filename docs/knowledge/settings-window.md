# Settings window (the desktop Profile window): full screen, close key, household count, AI assistants

Owner, by voice, 11 October 2026 (one round of feedback on the Settings panel). The window is `fragments/desktop-profile/` (sections Profile, Settings, Preferences, History, Household, My data); the AI assistants block is the Profile sketch in `fragments/preferences-mine-household/` (`?as=arjan&tab=mine&to=profile-demo`). Handover: `docs/handover/desktop.md` section 7. Numbers here are SW-n; they are not renumbered. Owner words are quoted or closely paraphrased; **Proposal** marks a choice the owner did not make.

## Owner's words

1. "The settings modal is centered. Settings take centre stage and some parts need more room. Make it fill the entire screen, keep the same left-gutter width. Keep the translucent backdrop; with the modal full-screen it shows as a small buffer around the edges."
2. "The household entry shows the number of people, which conflicts with the shortcut."
3. "Plain Esc is something the app moved away from. The close key is Cmd+Esc on Mac, Ctrl+Esc elsewhere. Settings panel, hint text, tooltips, help list and tests use that."
4. "Connected AI assistants have a separate default widget. Remove it: list the connected assistants and give each a radio button to mark the default. Keep existing storage and behaviour."
5. "The 'link through sign in' wording appears more than once. Keep the one useful instance."

## Notes

**SW-1. Full screen (owner).** `.pf-win` is 100% by 100% of the scrim. The scrim keeps the translucent, blurred backdrop and now has `padding: var(--pf-gap)`: 12px, 8px under 600px wide. The section list is still 244px.

**SW-2. Inner scrolling (Proposal).** Only the page (`.pf-body`) scrolls. The section list, the header with its close button and the footer hints stay put. The section list scrolls on its own when the screen is shorter than it. Height is `100dvh`, so a phone browser bar does not hide the footer.

**SW-3. Content measure (Proposal).** "Some parts need more room" is read as: the window is big, the content is not stretched across it. Section content is capped at 60rem and sits left, next to the list. The Preferences screen keeps its own 640px column; whether it should be wider is open (SW-O1).

**SW-4. Phone and tablet (Proposal).** Under 900px the section list becomes one horizontal, scrolling strip across the top (icon and name, no keys), the footer hints are left out (no keys on touch), and the window still fills the screen with the same buffer. At 360 and 390 nothing scrolls sideways. The built app draws the window only at 64rem and up (phone and tablet keep the full pages), so this layout is the mockup's answer if the window is ever shown narrower; no build change is made for it.

**SW-5. Scrollbar (Proposal).** With a classic scrollbar the page behind used to keep a reserved gutter (`scrollbar-gutter: stable`), which drew a stray strip beside a full-screen window. The gutter is no longer reserved while the window is open; the page behind may move a scrollbar width under the backdrop.

**SW-6. Sub-screens and flyouts (Proposal).** The shortcuts list (`?`) stays a small centred dialog on top of the full-screen window, on its own backdrop. The Preferences sub-screens (Members and admins, Categories, Locations and spots) stay inside the window's body as before. A flyout on the Pantry behind is inert and under the backdrop. The close key closes the top level first (shortcuts, then the window), as before.

**SW-7. Household count (owner).** Found: the section list drew the household's member count as a boxed chip (2) directly before the Household row's number key (5). Two boxed digits side by side, and 2 is the key for Settings. Reproduced in the mockup and the build at 1024, 1280 and 1920 wide, light and dark: the chip and the key sit 7px apart; at under 900px (mockup, keys hidden) the chip is the only digit and there is no clash. Fix: no count in the section list. The count is the line "2 members" under the household name in the Household section.

**SW-8. Household count, alternative (open).** If the clash meant something else (for example the owner pressing 2 expecting Household), the fix above still holds, because the only digit left on that row is its key (5). If the owner wants the count back in the list, it should be plain muted text under the label ("2 people"), never a boxed digit beside the key.

**SW-9. Close key (owner).** Ctrl+Esc, Cmd+Esc on a Mac, shown as `Ctrl Esc` and `⌘ Esc` (the build's `platformKey()`). It is in the header chip, the footer hint, the shortcuts list ("Close the window", "Press ⌘ Esc to go back") and now the close button's tooltip ("Close (Ctrl Esc)"). Plain Esc closes nothing. The mockup said Ctrl/Cmd Enter, which the built app replaced on 10 October (Kitchie #475); Ctrl/Cmd Enter stays as a silent alias for one release in the build and in this mockup, never shown. Other desktop fragments (Pantry, item flyout, Plan) still say Enter in their notes: not touched here (SW-O2).

**SW-10. AI assistants, no separate default widget (owner).** Each linked assistant is one row: its name, and its Disconnect button. With two or more, the row's left side is a radio that marks the default (the whole name area is the target; checked rows say "Your default"). The group is one radio group labelled "Default assistant". Storage and behaviour are unchanged: choosing a row writes the same `assistant` pref, the plan button opens it, and until one is chosen the note says to choose and the plan button copies its message.

**SW-11. Zero and one assistant (owner: "handle sensibly").** None linked: the note and the Link your assistant button, as before. One linked: it is already the default, so no radio and no "Default" word, just the name, Disconnect, and the line saying it is used automatically.

**SW-12. "Linked through sign-in" once (owner).** It was on every assistant row. It is now one caption above the list (`Linked through sign-in`). The "Your default" word on a row replaces the old "Linked through sign-in. Your default". Not changed: the invite sentences ("They sign in with Google and join Our kitchen") are about people joining, not about linking an assistant, and each is said once on its own screen.

## Open questions

- **SW-O1.** Which parts need more room? Done: the whole window and a 60rem content measure. Not done: widening the Preferences screen (kept at 640px). A wrong guess costs one CSS value.
- **SW-O2.** The other desktop mockup fragments still describe Ctrl/Cmd Enter as the close key. Update them to Esc in a separate pass?
- **SW-O3.** The page behind may move by a scrollbar width when the window opens on a classic-scrollbar system (SW-5). Acceptable, or keep the gutter and a visible strip?

## Performance (DESIGN.md section 6)

No new files, no new requests. The window is still built only when opened; the CSS change is about 700 bytes.
