# AGENTS.md

Before changing any mockup here, read `DESIGN.md`. It is the design brief for this repo: jobs to be done first, one theme token set, playful tone, one visual family, options before decisions.

Static files, no build. Test by serving the folder (`python3 -m http.server`) and opening `index.html`.

## Performance and regression guard

Speed is a design constraint (`DESIGN.md` section 6). For every mockup screen, say in its notes what the default path loads, what is deferred and why. Load on engagement, not on page load; keep one token set and small per-screen files. Rebase before you push, read `git diff --stat` for anything outside your scope, and never undo an earlier settled improvement. Once a mockup is settled, the built app matches it exactly; a change to a settled mockup is shown here first, never built first.
