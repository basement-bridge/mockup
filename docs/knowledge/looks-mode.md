# Looks: light and dark mode (Kitchie #1088)

Owner request (issue #1088): a light/dark toggle that overrides the system default. System (default), Light, Dark; every theme gets both modes; the theme picker stays, the mode control sits alongside it on Settings, Looks.

**Status: mockup only. Nothing is built.** Fragment: `fragments/looks-mode/index.html` (Pages: https://basement-bridge.github.io/mockup/fragments/looks-mode/index.html). Baseline: Kitchie `origin/uat` 1541867 (`server/src/theme.ts`, both halves of all ten looks).

**Proposals:** Mode row directly above Theme (phone: full-width three-segment `.seg2` radios; desktop: inline); icons for System, Light, Dark; one line says what is in effect; theme swatches redraw for the half in use; saves on change; mode independent of theme (issue option 3 not drawn).

**Open:** where mode is kept (device cookie vs member; issue question 2; the control looks the same); whether the old Light/Dark/Follow-the-phone display setting is removed; Platform and Recipe honouring it (question 5); pre-session screens; contrast of ten looks in two modes not measured.

Loads: static HTML, `theme.css`, about 5 KB inline script; nothing fetched.
