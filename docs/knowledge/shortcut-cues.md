# Global shortcut cues (Shift + ?)

Owner, voice, 11 October 2026 (Arjan): a GLOBAL shortcut, Shift and question mark, that turns on the shortcut cues (the keyboard-shortcut hints) no matter where the user is. App-wide: every screen, flyout, modal and sub-screen of Kitchie, desktop and wherever keyboards apply, not just the screens that have a hint list today. Mockup first, then built in Kitchie `uat` to match.

Prototype: `fragments/shortcut-cues/demo.html` (`?screen=pantry|plan|history|settings|household`, `&fly=1` item flyout open, `&add=1` Add modal open). Check: `node tools/shortcut-cues-check.mjs` (324 checks at 390, 1024 and 1440 px, light and dark). Reference code to lift: `fragments/shortcut-cues/cues.js`, `cues.css`.

## What exists today (checked in the mockup and the build, 11 Oct 2026)

- The Pantry, Home, Plan and Recipe mockups and the build's rail pages already open a Shortcuts list on `?` or `H`, with a switch "Show shortcut cues on buttons and hints" (`.nocues` hides every `.kbd` chip and `.phint` line). The Profile window has its own `?` list.
- Gaps found in the build (headless Chromium, 1280 px, Shift+? on each route): the list opens on Pantry, Plan, Shopping, Cooking and the signed-out landing; it does NOT open on History, Menu, Settings (all screens), Preferences, Household and Offline, because those pages never load the page script that owns `?`. Below 1024 px nothing answers anywhere (the list's CSS is desktop only).

## Owner decisions

- **SC-D1** (owner, 11 Oct 2026): Shift+? is global. It works on every screen, flyout, modal and sub-screen, desktop and any keyboard.
- **SC-D2** (owner): it turns on the shortcut cues.
- **SC-D3** (owner): `?` must still type a `?` in inputs, textareas and contenteditable; never hijack typing.
- **SC-D4** (owner): think about IME and non-US layouts where `?` needs Shift.
- **SC-D5** (owner): no clash with existing shortcuts, such as the close shortcut Cmd+Esc on Mac and Ctrl+Esc elsewhere.
- **SC-D6** (owner): mockup first, notes recorded here, then the build with tests.

## Behaviour drawn (every line below that the owner did not say is a proposal, see SC-J)

1. **Shift+? opens the Shortcuts list on whatever is up** (SC-J1). Pressed again, it closes it (toggle). H does the same (already in the app) and is the way in on a layout with no `?`. The rail's Keys button stays.
2. **It turns the cues on** (SC-J2). If the saved cue switch is Off, the hint chips and hint lines come on for this visit while the list is up and stay on until the page is left. The list says so in one line ("Cues were switched off. They are on for this visit"). The saved switch only changes when the person flips it.
3. **What the cues show on each screen** (SC-J3). The list has two parts: "On this screen" (the keys the screen, and any flyout or modal open on top of it, register; a flyout's keys are added while it is open and leave with it) and "Anywhere" (Shift ?, the close chord, Tab, Enter). A screen with no keys of its own says so instead of an empty list (History, Household, most of Settings today).
4. **Dismissal**: Shift+? again, H, the x, a click on the scrim, or the close chord (Ctrl+Esc, Cmd+Esc on a Mac; Ctrl/Cmd+Enter does the same). Closing the list never closes the flyout, modal or screen behind it: the close chord is the list's first, in the capture phase, so ONE press closes the list and the second closes the panel behind (SC-J4). Focus goes back to where it was.
5. **Typing** (SC-D3): nothing happens while focus is in a text-like input (text, search, email, url, tel, password, number, date), a textarea, a select, a contenteditable, or a role textbox, combobox or searchbox. A checkbox, radio, button or range is not typing, so Shift+? works there (SC-J5). To use Shift+? after typing, click outside the box or press Tab.
6. **IME and layouts** (SC-D4, SC-J6): the key is judged by the character it produces (`event.key === "?"`), never by the physical key or the keyboard code. So Shift+/ (US, UK), Shift+, (French AZERTY), Shift+ss (German), Shift+' (Spanish) and a `?` made with AltGr all work. Ignored: a press while an IME is composing (`isComposing`, keyCode 229), key repeat (a held key does not flicker), and Ctrl or Cmd combinations (Ctrl+? is the browser's). A layout with no `?` key uses H or the Keys button.
7. **No clash** (SC-D5): Shift+? takes nothing that exists. Ctrl/Cmd+Esc keeps closing the top layer (rule 4). A page handler that already took the press (preventDefault: an inline edit, the search box, the Profile window, which keeps its own list) wins; the global handler runs after it (bubble phase on window).
8. **Narrow screens and the list's look** (SC-J7): the list works at every width. Wide: the Pantry's list as today (two columns, anchored on the main column). Narrow or a page without the rail: the same list as a centred dialog, one column below 640 px.
9. **Where it loads** (SC-J8): a very small script on every page (it only listens for the key); the list's code is fetched on the first press, as today. Nothing else loads on page load.

## Judgement calls

- **SC-J1** The owner said "turns on the cues". `?` already opens the list in the app and the handover (desktop.md section 3). One key cannot do two things, so Shift+? is the list, and the cues come on with it (SC-J2). The alternative (a silent cue toggle, with the list moved to H) is Q-SC1.
- **SC-J2** Cues come on for the visit, not for good, so one press to look at the keys never overrides a choice made on purpose in the list's switch.
- **SC-J3** "On this screen" is built from what the screen registers, so the list never names a key the screen does not have (the Pantry's existing rule).
- **SC-J4** The list sits on top of a flyout or modal, so it takes the close chord first. Tested: the first Ctrl+Esc closes only the list.
- **SC-J5** Only text-like inputs count as typing (the app's registry treats every input as typing; the global handler is narrower, so a focused checkbox does not block it).
- **SC-J6** AltGr (reported as Ctrl+Alt on Windows) is allowed for `?`; plain Ctrl, Cmd and Alt are not.
- **SC-J7** Below 1024 px the list is a plain centred dialog; no hint chips are invented on phone screens (the cues there are the list).
- **SC-J8** The shopper link page (a visitor, no sign-in, phone first) is included only if its tests allow one more script; see the build PR.

## Open questions

- **Q-SC1** Should Shift+? instead only flip the cues on and off (no list), with the list on H and the Keys button? Drawn: no, one key one list, cues come on with it. A wrong guess costs one keybinding change, no data.
- **Q-SC2** Should the cues come on for good (saved) when Shift+? is pressed with the switch Off? Drawn: no (visit only).
- **Q-SC3** Where the Profile window is open it keeps its own shortcuts view (Shift+? opens that one). Same list for both, or leave?
- **Q-SC4** A person who is typing cannot reach Shift+? (SC-D3). Offer a modifier chord that works inside boxes (for example Ctrl/Cmd+/)? Not drawn.
