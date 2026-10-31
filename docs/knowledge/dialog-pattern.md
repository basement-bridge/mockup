# One dialog pattern (sheet, modal, flyout)

Mockup: `fragments/dialog-pattern/` (`index.html` notes with iframes, `frame.html` the working sample app, `dialog.css`, `dialog.js`, `dp.css` scaffolding). Owner: Arjan, voice, 31 October 2026: JavaScript and CSS minimal and used the same way everywhere; ONE shared dialog component, one stylesheet block, no per-dialog markup. **Mockup only. Nothing built in Kitchie; nothing approved.** Evidence is the Kitchie uat audits handed over with the request; not re-audited.

## Evidence (from the audits)
About 20 hand-written `role=dialog` sites in 18 files, none native `<dialog>`. Nine close idioms (data-close, data-close-sheet, data-closea, data-fly-close, data-hm-close, data-sheet-close, data-act=closesheet, data-sh=close, data-sheet-dim); close classes x, ib, pf-x, sib, icon, close, grab. `.btn` redefined in about 14 files plus layout.ts (min-height 40/44/46/48/52, radius .9rem/12px/14px, pill 99px, weight 600/700/800). `.ib` 44/40/38. `--dim` four values. Sheet/scrim rules in 15 files.

## The pattern
Native `<dialog class="dialog">`; `dialog.js` (27 lines) adds `[data-open]`, `[data-close]`, backdrop click (press and release both on the scrim), upgrade of a server-rendered `<dialog open>`, `[data-locked]` cancel gating, `show()` for flyouts, focus return for flyouts. `showModal()` gives Escape, focus trap, inert page, focus restore. `dialog.css` (46 lines): tokens, `.btn` (+ `--primary --ghost --pill --block`), `.close` (+ `--plain`), `.dialog`, `__body`, `__head`, `__grab`, `__foot`, `--flyout`. Scroll lock is `html:has(dialog:modal)`. Phone: bottom sheet with grab bar. 600px up: centred modal. Flyout 1024px up: non-modal; below that the same markup is a sheet/modal. Default-look principle: a plain `.dialog` is complete in both themes and without script; variants only add.

## Mapping (stage 1)
Moves onto the pattern: confirm sheet, Used up, Sign in again (locked), plan sheet, recipe share sheet, filters sheet, item flyout, plan flyout, keys help (desktop only), lightbox. **Left alone:** profile window (`profile.js`), receipt scan (`pantry-receipt.js`, `receipt-scan.js`).

## Decisions (all Proposal unless marked)
- **DLG-D1** (Owner goal) one component, one stylesheet block, no per-dialog markup.
- **DLG-D2** native `<dialog>` with `showModal()`; no hand-written role/aria-modal.
- **DLG-D3** one helper, nothing per dialog.
- **DLG-D4** one stylesheet block; scrim folded into the `<dialog>` element (no scrim element, `::backdrop` unused); `__foot` added for sticky actions.
- **DLG-D5** one close idiom: `data-close` on a button or link, value becomes `returnValue`.
- **DLG-D6** one `.close` (44px circle, 1px border, `--plain`), glyph drawn by CSS.
- **DLG-D7** actions in `__foot`, Cancel first, main last, `autofocus` on the safe action.
- **DLG-D8** phone sheet; 600px centred modal (`--dialog-w`); 1024px non-modal flyout (`--flyout-w`), sheet/modal below.
- **DLG-D9** scroll lock in CSS only.
- **DLG-D10** works without script (link close, server-rendered open dialog; ?param sheets stay).
- **DLG-D11** non-dismissible flows use `data-locked`.
- **DLG-D12** default-look principle.
- **DLG-D13** tokens only; new tokens `--dialog-w --flyout-w --grab-w --grab-h --z-dialog`.
- **DLG-D14** stage 1 leaves profile.js, pantry-receipt.js, receipt-scan.js alone.
- **DLG-D15** mockup and build share class names and data attributes; `dp.css`, `frame.html`, scaling script are not lifted.
- **DLG-D16** no animation in stage 1.

## Owner decisions and open questions
Visible changes (each drawn before/after; recommended answer yes unless noted): **DLG-O1** radius to 14px (skin.ts .9rem, settings 12px); **DLG-O2** 99px ghost pills vs rounded in dialogs (pill stays opt-in); **DLG-O3** icon buttons 38/40 to 44px; **DLG-O4** one `--dim` rgba(0,0,0,.5) (dark loses .65; light turns from green-grey to black); **DLG-O5** grab geometry 36x4px, phone only (current not measured); **DLG-O6** one button height 44 and weight 700.
Open: **DLG-O7** swipe-to-dismiss on the grab (not in stage 1); **DLG-O8** is Sign in again really locked; **DLG-O9** lightbox look (framed default vs old full-bleed variant); **DLG-O10** tablet 600-1023 centred vs sheet; **DLG-O11** destructive button style; **DLG-O12** `data-open` in the helper.

## Checks and limits
Run in headless Chromium (own script, not committed): index at 360/390/768/1280, light and dark, no sideways scroll, no page errors; on `frame.html` at 390 and 1280: modal state, autofocus, scroll lock, focus trap, Escape and focus return, backdrop close, locked ignores Escape and backdrop, flyout non-modal at 1280 and modal at 390, page behind a flyout clickable, modal over flyout, `?open=` upgrade. `tools/screenshots.mjs` has no entry for this page and `tools/` is out of scope, so it was not run for it. Not done: senior mobile-UX review, real-device iOS/Android, screen reader, no-script rendering, any check against Kitchie code. Pages deploys only from `prototype-v1`, so a push to main may not publish.
