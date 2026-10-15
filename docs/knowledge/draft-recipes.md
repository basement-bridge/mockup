# Draft recipes: cook first, keep it after

Mockup: [`fragments/draft-recipes/`](../../fragments/draft-recipes/).
Issue: [basement-bridge/recipe#123](https://github.com/basement-bridge/recipe/issues/123).
Source: owner, voice session, 15 October 2026.

The person starts by **cooking** — often improvising, talking to the assistant — and is offered the chance to
keep it as a recipe only afterwards. Saving is the reward for the dish turning out well, never the price of
entry, and never a precondition for logging a cook.

## Decisions the owner settled

**D1 — an improvised dish is a recipe from the first moment.** *"you, in fact, might have to think about the
random ones as recipes you add with a different status."* Not a separate lightweight object that later has to
be converted: same object, same identity, from the moment cooking starts; only the status differs.

**D2 — cooking is the entry point; keeping is offered afterwards.** *"[they] might just start making a random
recipe by just talking to AI… if they find that it's useful, they should be able to convert that into a
recipe."*

**D3 — a draft stops being offered after one day.** *"if they don't confirm it within an hour, sorry, a day,
you just wipe it."* **Refined the same evening (D7, D8 below): the day is a state transition, not a
deletion.** **Open:** a day from the cook starting or from the cook finishing. The mockup assumes finishing.

**D7 — 24 hours is a state transition.** The draft leaves the pending-save shelf and stops asking to be
promoted, but remains a live recipe object. It is not deleted at 24 hours.

**D8 — data is retained for one week.** Copy-last-week must still reach whatever was cooked, so killing the
data at 24 hours would put holes in it. After the week, outside the copy-last-week window, it retires.

**D9 — the cook log is a rolling week, not an archive.** No permanent cooking history, so an expired draft
needs no frozen-snapshot machinery. This supersedes the earlier "keep a frozen snapshot" lean.

**D10 — the retire is almost certainly a soft delete** (state flip to put-away, filtered out of reads), per
Recipe's own rule. **Open, builder's call:** whether a never-kept draft is the one legitimate hard-delete
exception.

**D11 — prefer lazy, read-time expiry** over a background sweeper, to match the simple infra and avoid
deletions firing on a timer. Builder to confirm against what the code already does.

### Verified against Recipe's code, 15 October 2026

- A cook log **already exists and is permanent today**: table `cooks` (`server/src/schema.ts:538`), no time
  window in any query, and `list_cooks` states *"Cooks are never edited or deleted."* So D9 narrows a
  published contract rather than filling a blank. Worth deciding whether the rolling week applies to all
  cooks or only to cooks of never-kept drafts.
- A cook row stores `version_id`/`revision_id` and **nothing of the dish itself**; the log is rendered by
  joining to `versions` and `revisions` (`service.ts:779`). A hard-deleted draft would leave a cook row that
  is unreadable — an argument for D10's soft-delete path.
- The foreign keys have **no `ON DELETE` clause**, so a hard delete either fails or orphans. The hard-delete
  exception is not a one-line change.

**D4 — drafts are visible in the library, in their own group.** *"you'd want to have a category, uh, awaiting
to save or something… pending save. Or or something like that. You come up with what's the more sensible
thing."* **Proposal on the label:** "Not kept yet" rather than "Pending save" — it is what a person would say,
and it implies the action rather than naming a system state. Owner to confirm the word.

**D5 — loose on how much, strict on what kind.** *"there's still the concept of like you don't put ingredients
as part of method. And you don't mix it up… you need to control that at the point of MCP… I'm happy for you to
enforce that as a contract."* And: *"you must have ingredients and ingredients with quantity, um, quantity
optional."*

A draft accepts any subset — ingredients with no steps, steps with no ingredients, free text that is neither —
and never validates for **completeness**. It does enforce **typing**: an ingredient is a typed ingredient (name
required, amount optional), a step is a separate typed thing, and the two never share a field. Enforced at the
MCP boundary. Structure is imposed only at keeping.

**D6 — assistant edits mid-cook land on the screen in place.** *"they might then start uh, giving you… MCP
instructions to fiddle with it. Which then again should go and update what's on the screen."* The MCP and the
screen act on one object; the screen updates where the person is looking, consistent with `DESIGN.md`
section 6a.

## What the mockup proposes (owner was silent)

| Fork | Proposed | Why | Rejected |
|---|---|---|---|
| Where a draft lives | Its own group pinned above `All recipes`, hidden when empty | It is the only thing in this library with a deadline, so it cannot be somewhere you must go looking | A chip (invisible by default, so drafts expire unseen); inline in date order (clutters a list of things with no deadline) |
| The offer to keep | A quiet dashed card during the cook, becoming a direct question when cooking ends | The end of the cook is the only moment the person knows the answer. Asked once; if they answer neither, it is not asked again | Asking during cooking (interrupts); never asking (good dishes evaporate) |
| The clock | Words — an absolute time while far off, a relative countdown under about four hours | Automatic deletion should be stated plainly from the first moment, not revealed late. Needs no second mechanism for screen readers | A draining ring alone (not a time, and needs words anyway); silence until the last hours (a dish vanishes with no deadline ever shown) |
| Mid-cook change marking | Changed lines outlined for a few seconds, the removed one struck through until the next change, and one line echoing *what was heard* | The person's hands are busy: a moving list is hard to re-find, a mis-heard instruction must stay visible, and the heard sentence is what they can check against memory | Animating rows; removing the dropped line immediately; echoing what the system *did* rather than what it heard |

All four are cheap to reverse: a section versus a chip, one condition, one threshold constant, and some CSS.

## Open questions, and what a wrong guess costs

1. ~~**When a draft expires, what happens to the cook-log entry that pointed at it?**~~ **Settled 15 October
   2026 (D9):** the cook log is a rolling week, not an archive, so there is no permanent history to protect
   and no snapshot machinery is needed. See the verified note above: a permanent log does exist today, so
   this is a narrowing of current behaviour, and whether it applies to all cooks or only to never-kept
   drafts is worth stating explicitly.
2. **Does a draft count as a recipe anywhere else?** Search, the chips, `what_can_i_cook`, the week plan.
   **Proposal:** excluded from planning and from "what can I cook" (you cannot plan next Tuesday around
   something that evaporates tomorrow), included in search. Cost: a plan built on a dish that disappears.
3. **Is the expiry a household thing or a personal thing?** If two people cook, whose draft is it, and can the
   other keep it? Cost: one member silently losing another's dish, or a draft nobody feels responsible for.
4. **How does a one-day wipe reconcile with Recipe's own rule** that nothing a person made is deleted — put
   away replaces deletion? It probably reconciles as "a draft is not yet something the person made", but the
   builder should state that reasoning rather than assume it. Cost: a deliberate rule quietly broken, and a
   precedent for deleting other things.
5. **What does the assistant say when a draft is about to go?** Nothing in the mockup notifies outside the app.
   A push or a chat message is the obvious place and is not drawn, deliberately: it crosses into the
   assistant's behaviour rather than the screen's. Cost: drafts expiring while the person is nowhere near the
   Recipes tab — which is most of the time.

## What the screen loads

Nothing new on the default path. The draft group is part of the Recipes list already being fetched, and a
draft row carries the same fields as a kept row plus an expiry timestamp. The keep sheet is fetched when the
person taps Keep, not with the list (`DESIGN.md` section 6). The clock is computed in the client from one
timestamp — no polling, no timer requests; the row re-reads it when the tab regains focus, as the desktop
Pantry already does. The mid-cook update arrives on the connection the cooking screen already holds and is
applied in place (section 6a), so no new request at all.

## Desktop

No new pattern. The group sits at the top of the column in the existing rail layout; selecting a draft opens
the usual side panel, where **Keep it** is the primary action and **Let it go** — which does now what the clock
would do tomorrow — is the quietest of the three controls.

## Related

- [`fragments/mid-cook/`](../../fragments/mid-cook/) — the cooking screen this borrows from. Its "Made up with
  the AI" variant already says *"Not in your saved recipes"*, which is the gap this feature closes.
- [`fragments/recipe-list-ideas/`](../../fragments/recipe-list-ideas/) — the library the draft group sits in;
  row, chip and panel styles are taken from it so the two read as one screen.
- Journey walk findings `0005` and `0006` on `basement-bridge/recipe` branch `sandbox/journey-walk`: **both
  were withdrawn** on 15 October 2026 as not reproducing against the code. #123 does **not** depend on them —
  it is a product decision about where the cooking journey starts, not a bug fix.
