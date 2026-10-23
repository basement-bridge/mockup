# History: the canonical minimum event model

**Status: derived from real code on 18 Oct 2026, for the owner's review. Not a decision record.** Owner (voice, 18 Oct 2026): the point of the History work is a canonical model; search and filtering may use only fields that model guarantees; result detail defers to the kind's template; templates are owned by the producing product (Kitchie owns Kitchie kinds, Recipe owns Recipe kinds), Platform hosts the registry and serves what the owner publishes and never writes rendering for others, and consumers ask Platform for the template. Every point below that the code and docs do not settle is a numbered owner question at the end (Q1 to Q10), not a quiet choice.

Nothing here changes Platform or Kitchie. If the owner wants this recorded in Platform, the proposal is to add it as a short section (or `docs/plans/history-event-model.md`) next to `docs/plans/history-capability.md` section 2, through Platform's own issue, PR and merge route. It is **not** pushed there from this repo.

The mockup built on this model: `history/search/` (spec: `history-search.md`).

**Re-baselined 23 Oct 2026.** Re-read after Kitchie `uat` was promoted to `main` (#1054) and Platform `uat` reached #108: Platform's ADR 0003 (with Amendment 2), `history-capability.md`, `history.ts`, the contract and the reference store, and Kitchie's `history-envelope.ts` are **byte-for-byte unchanged** since 18 Oct, so nothing below moved. Facts that matter: History writes run on the member's own Platform token (no service token class; Amendment 2), so the outbox drains on live requests; the template registry, `/kinds` and `/templates` are still not built. Kitchie's `docs/plans/history-build.md` (12 Oct) **pre-dates the ADR**; where it assumes counts and a Where filter (G8), a per-event `visibility` (G12), and a Kitchie-side "Affects me" computed at write (D12), the model above wins and those are Q3, Q-H1 and Q6.

## Sources read (all on `uat`, 18 Oct 2026, re-checked 23 Oct 2026)

| Source | What it settles |
| --- | --- |
| Platform `docs/adr/0003-history-writer-auth-read-path-and-template-rendering.md`, incl. Amendment 2 | Envelope skeleton, payload ownership, template registry design, auth (reuse the Platform token, no new credential). **Status Proposed** except O-1; O-2 to O-7 open. |
| Platform `docs/plans/history-capability.md` | The wire contract in prose (section 2), the read API (5.3), open questions Q-H1 to Q-H6 (section 12). |
| Platform `apps/portal/src/history.ts` | The routes as built: `POST /api/history/events`, `GET /api/history`. |
| Platform `packages/contract/src/history.ts` (imported by `history.ts`) | The strict schema: what is mandatory, optional, nullable. The ground truth for "guaranteed". |
| Platform `packages/store/src/memory-history.ts` (the reference store the routes' contract tests run against) | What each filter really does (for example `actor=others`). |
| Kitchie `server/src/history-envelope.ts` | What the first real writer actually sends. |
| Kitchie `docs/plans/history-extraction.md` (sections 4, 4.1, 13) | Kitchie's kinds, payloads, and the wording each template must reproduce. |

Not built yet (so nothing in the mockup that depends on it can be called real): the template registry, `GET /api/history/kinds`, `GET /api/history/templates`, template publication. The feed answers `template_revs: {}` (`history.ts`, `feed`). Recipe has no History code on `uat` at all (no file with "history" in its tree); Kitchie emits only `pantry.*`.

## 1. The model

An event is written once by a product and read many times by consumers (Kitchie screens now; Recipe, an app, a watch later).

### 1.1 Mandatory (the write is refused without them)

| Field | Shape | Notes |
| --- | --- | --- |
| `v` | the number `1` | Envelope version. Hard match. |
| `event_id` | `^[A-Za-z0-9_.:-]{1,128}$` | Product-chosen, unique per product within a household; the idempotency key. Kitchie: `kitchie:journal:<seq>`. |
| `product` | a product id | Must be in the token's `products` snapshot and live-entitled. |
| `actor` | member id **or `null`** | The key must be present. `null` is allowed. Must be a member of the token's household. |
| `kind` | `<area>.<kind>` or `<area>.<noun>.<verb>`, lowercase, at most 96 chars | The first segment is the **area**. |
| `kind_v` | integer 1 to 1000 | Version of this kind's payload shape (the producer's). |
| `entity.type` | `^[a-z][a-z0-9_]{1,31}$` | `entity` itself is mandatory. |
| `occurred_at` | UTC `YYYY-MM-DDTHH:mm:ss.sssZ` | When it happened, not when it was delivered. Within 5 minutes ahead and 366 days back. |
| `payload` | a JSON object, at most 2048 bytes | May be empty `{}`. Platform never reads it. |

Never in the body: `household` (400 by name). It is the token's.

### 1.2 Optional on write (may be absent, null or empty on read)

| Field | Shape | Reality today |
| --- | --- | --- |
| `entity.id` | id, or null | Null for "no single thing". Kitchie leaves it out for `bulk_changed`. |
| `via` | `web`, `assistant`, `system`, or null | **Kitchie sends none** (`history-envelope.ts`; its `source` string travels as `payload.channel`). Captured, not displayed (Q-H5). |
| `affects` | up to 8 unique member ids of the household | **Kitchie sends none.** Reads return `[]`. |
| `ref_event_id` | an earlier `event_id` of the same product, or null | **Kitchie sends none** (its undo kind carries `payload.reverses`). Inert; not validated. |

### 1.3 What a read returns (`GET /api/history`), per event

`seq` (Platform's position, the cursor key), `event_id`, `product`, `kind`, `kind_v`, `entity: {type, id|null}`, `actor: {member, name|null} | null`, `via|null`, `affects: []`, `ref_event_id|null`, `occurred_at`, `payload` (an object, `{}` if stored text was unreadable). Plus `template_revs` and `next`. Platform stamps `recorded_at` and does **not** return it. Names are resolved at read time; a removed member is `{member, name: null}`.

So the **guaranteed minimum** for a consumer, on every row, is: **when** (`occurred_at`), **who** (`actor`, nullable), **which app** (`product`), **which area** (first segment of `kind`, derived), **what kind and version** (`kind`, `kind_v`), **about what** (`entity.type`, `entity.id` possibly null), a stable identity (`seq`, `event_id`). Everything else is optional or payload.

### 1.4 Two gaps between the contract and today's writer

1. The contract allows `affects`, `via`, `ref_event_id`; Kitchie populates none of them. Any feature built on them shows nothing from Kitchie until Kitchie writes them (Q6).
2. ADR 0003 says `actor` is null "only for a system event". Kitchie also sends null for the shopper link and a shared assistant link (`history-envelope.ts`: "no member"). Plan M2b is still open. So **null does not mean system**.

## 2. What is filterable

The read API accepts exactly these query parameters (`HISTORY_QUERY_PARAMS`); an unknown one is refused, and **a repeated one is refused by name, so every filter is single-valued**.

| Filter | Parameter | Field it reads | Notes |
| --- | --- | --- | --- |
| Who did it | `actor` = member id, `me`, `others` | `actor` | `others` is "not me **and not null**" (`memory-history.ts`: `actorMemberId !== null && !== me`). Events with no member appear under neither "mine" nor "others", and **no parameter selects them**. |
| Who it touches | `affects` = member id or `me` | `affects` | Works; empty for Kitchie today. |
| App | `product` | `product` | Bounded by the token's snapshot. |
| Area | `area` | first segment of `kind` | Derived, exact. |
| Kind | `kind` | `kind` | Exact string only, no prefix, no list. |
| In context | `entity_type`, `entity_id` | `entity.*` | Needs `product`. Ids only, never names. |
| When | `from`, `to`, `since` | `occurred_at` | `since` is strictly after. Late-arriving events are older than a marker (Q-H4). |
| Paging | `limit` (1 to 100), `after` (opaque cursor) | | Newest first only. |
| Day at a time | `days=1` with `tz` | `occurred_at` in the zone | Next older calendar day that has at least one matching event. |

**Not available, and so not drawable as real:** more than one value of a filter (no OR inside a group); facet counts; a total result count; a filter on `via`, `ref_event_id` or `payload`; sorting; any text parameter.

## 3. What is payload-owned and NOT guaranteed

Everything a person calls "the thing": item or recipe **name**, quantity, from and to, **place** (Fridge), meal, reason, the field list of a correction, the visitor flag, `channel`. It lives in `payload`, is shaped per `(product, kind, kind_v)`, can grow without a release, and Platform neither indexes nor reads it. Kitchie's current payloads are listed in its plan section 4; they are examples of one producer's shape, not part of the model.

Consequences: a consumer may **display** payload only through the kind's template slots, and may **not** filter, group, count or sort on it. "Where" (place), item name and recipe name are not filters. Entity **ids** are guaranteed and filterable; names are not.

Also not on the wire in version 1, so not part of the model: audience or privacy scope (Q-H1), "needs review", an actor kind (person or visitor), a summary string, an icon, a route, a `fallback_text`, a "words" field. ADR 0003 forbids product-written words in the envelope.

## 4. Templates: who owns, who serves, who asks

```
Kitchie / Recipe (owner of the kind)   authors and versions the template for (product, kind, kind_v); publishes it with its release
        |  publish (mechanism open: ADR O-3)
Platform                                validates against the vocabulary, hosts the registry, serves it; never writes it, never reads a payload
        |  GET /api/history/templates?product=&kind=&kind_v=     (and template_revs in each feed response)
Consumer (a Kitchie screen, an app)     asks Platform; caches; one generic evaluator turns template + payload into a tree; its painter styles it
```

- Three independent version numbers: `kind_v` (data shape, on the event), `template_rev` (wording, on the template), `vocab_v` (the tag set).
- The consumer never needs the owning product to be reachable at read time.
- **Degraded rows are defined, not invented:** template cached, then the rendered line; fetching, then a skeleton (when, who, product, empty body); no template published, no `kind_v` match, or evaluation fails, then the **generic row** "{who} made a change in {Product}" with the time. The generic row needs only the skeleton, which is why `occurred_at`, `actor`, `product` are mandatory.
- A template may link only to an entity route the owning product registered (`routes`), built from event data. A kind whose template defines no link has no "open" target.
- Writing an event is never gated on a template existing.

## 5. What "free text search" can legitimately mean

Today it means nothing: the API has no text parameter (owner H9, plan 5.3, Q-H6 open). The ADR states the structural limit: **rendered text exists only on the client**, because Platform may not read payloads and the owner does not want product-written words. So the only readings are:

| Reading | Who computes the text | Cost | Fits the locked rules? |
| --- | --- | --- | --- |
| **S0. No keyword search.** Structured filters only. | n/a | Nothing. Finding "the milk" means filtering by area and scrolling. | Yes. Matches H9 and today's API. |
| **S1. Search the days already loaded, by rendered text.** | The client, from the template output it already built. | No server or contract change. Honest limit: it can only find what has been loaded (one day per scroll), so it must say "in the days loaded". Every client re-implements it. | Yes. No invented field; text is the kind's template output. |
| **S2. Server search over product-supplied search terms.** | The producing product, as a new optional envelope field; Platform adds an index. | An envelope change (Platform first, then product), a migration, product-written words back in the store. | Conflicts with "no product-written words" unless the owner carves out terms. |
| **S3. Server search over rendered text.** | Platform would evaluate every template over every payload. | Platform reads payloads. | **No.** Contradicts "Platform never interprets a payload". |
| **S4. Raw substring over the payload JSON.** | Platform. | Matches ids, numbers and keys; breaks the moment payloads change shape. | No. Not meaningful text. |

Position proposed (not decided): S0 stays the default; if the owner wants a box, S1 is the only reading that needs nothing from Platform. This is Q1.

## 6. How option D must change

Option D (`history-option-d.md`, locked H1 to H15: two tabs "My activity" and a person or "Others", tick and X, person link, recent history a day at a time, structured filters, no typed search) keeps its **structure**. Its **field catalogue and a few features** were drawn from a sample shape that is not the model. What changes:

| Option D today | Against the model | Change |
| --- | --- | --- |
| Tabs: My activity, person or Others | `actor=me` and `actor=<id>` or `others` exist | **Keep.** But "Others" misses events with no member (Q5). The second tab should be the member's id, not a name search. |
| "Others" includes the shopper link (D25, Proposal) | `others` excludes null actors; no filter selects them | **Blocked** until Q5. Drawn as: null-actor events shown in neither tab. |
| Tick and X, catch-up, `since` | `since` is `occurred_at` only | **Keep**, with the late-arrival caveat (Q-H4). |
| Catch-up cap: three calendar days with a change | `days=1` and `tz` give exactly that | **Keep.** The cap is the screen's rule. |
| Person link in the catch-up | `actor=<id>`; summary counts can be computed from the loaded rows | **Keep.** |
| Recent, a day at a time, no ceiling | `days=1&tz` with `after` | **Keep.** Filtered results page the same way. |
| Row sentence: "Sam used up *Green tea*" (a bold subject, a verb) | Name and verb are payload; words are the template's | **Change.** Row = skeleton chrome (who, when, product) + the template's output. Without a template: the generic row. |
| Field `subject.name`, `place`, `verb` text | Not in the envelope | **Drop as fields.** `verb` becomes `kind`. |
| Filter groups When, Who, Area, **Where**, App, Touches me | Where (place) is payload | **Where is dropped.** Add **Kind** ("What happened"), from the registry. |
| Same group = OR, different groups = AND (D14) | Every parameter is single-valued | **Single choice per group** unless the API changes (Q2). |
| Counts on every option, zero options dashed | No facets, no totals | **Drop counts** (Q3). The "N new" tab count and "N changes" summary can only be what is loaded. |
| Areas: Pantry, Shopping, Plan, Cooking, Preferences, Versions, Stars and votes, Household | `area` is the first kind segment; only `pantry` exists in real data | Area options and labels come from the registry (Q4). Drawn: Pantry, and Recipe as a placeholder. |
| `scope` / lock chip / "2 private, hidden" (D6 to D8), admin-only entries | No audience on the wire (Q-H1) | **Drop** until the owner answers Q-H1. |
| `affects` with a **sentence per person** ("Green tea ran out, so it is on the list now") and an action button | `affects` is ids only; sentences are product-written words | **Change.** A person is "touched" by a row; the row is the template's. No per-person sentence, no invented action button (Q6). |
| `needs_review` chip and Review button | Not in the model | **Drop** (Recipe's To review is its own screen). |
| `actor_kind` visitor "No sign-in" label | Only `actor: null` | Null actors read as one wording (Q5). |
| Tap a row opens option C's flyout with its own invented rendering (H5) | Detail defers to the template | **Change C's content, keep its frame.** The flyout shows the skeleton plus the template's output and the template's link. Q8. |
| Preview-only person/last-visit switcher | Mockup control | Unchanged. |

## 7. Open decisions (owner questions)

**Revision 2, 23 Oct 2026 (owner, voice, 23 Oct 2026; details in `history-search.md`, decisions log).** Decided: Q1, Q3, Q5, Q6. **Undecided and still drawn: Q2, Q7, Q9** (the owner's own numbering in his voice list ran one behind this document after Q3; the mapping used here is Q5 = events with no member, Q6 = `affects`, Q9 = time zone). Q4 (where the choice lists come from) is still a Proposal. Q8 and Q10 are untouched.

Each: options, then a recommended position. None is applied as decided; the mockup draws the recommended position where a choice was forced and marks it **Proposal**.

**Q1. Is there a keyword box at all, and what does it search?** (S0 to S4 in section 5.) Recommended: S0 now; S1 if wanted, labelled "in the days loaded"; never S3. Wrong guess costs: S2 means an envelope change and product-written terms; S3 reverses the ADR. **Decided (owner, voice, 23 Oct 2026): no keyword box in the default design. He asked to see one for comparison, so Preview offers B (free text over the days loaded, S1, labelled as such) beside A (elements only, the default).**

**Q2. Combining choices.** (a) One choice per group (no API change); (b) Platform accepts a list per parameter (contract change, store change, owner approval); (c) the client makes several calls and merges (breaks keyset paging). Recommended: (a). Wrong guess costs: with (a) a person cannot see "Sam or Priya" together; "Others" covers the common case. **Undecided (owner, voice, 23 Oct 2026): one choice per group is what is shown; the lists alternative stays reachable in Preview, marked undecided.**

**Q3. Counts.** (a) None; (b) counts only of what is loaded; (c) a new count route on Platform (new surface, needs approval, cost on every filter open). Recommended: (a), with (b) only for the catch-up summary. **Decided (owner, voice, 23 Oct 2026): (a) no counts anywhere, including the catch-up summary and the tabs.**

**Q4. Where the choice lists come from** (areas, kinds, their labels). (a) The registry's `GET /api/history/kinds` (the design; not built; labels written by the owning product); (b) hard-coded in each client (no); (c) built from the days already loaded (misses what has not been loaded). Recommended: (a). Until it is built the mockup draws Pantry and a Recipe placeholder, and kind names as ids.

**Q5. Events with no member** (shopper link, shared assistant link, system). (a) `actor=others` also returns them (a one-line Platform store change plus its contract test; matches "Others includes the shopper link", D25); (b) a new `actor=none` choice; (c) leave as is and they appear only in an unfiltered list. Also the wording for a null actor in the row ("Someone", "Someone without a sign-in"), which today no document defines. Recommended: (a), with the wording owned by the generic row and templates. Wrong guess costs: with (c), a shopper-link purchase is invisible in both tabs. **Decided (owner, voice, 23 Oct 2026): (a). Events with no member are shown under Others, never hidden; a removed member's past events read "A former member" (members are erased after a week; History is anonymised). Platform doc change needed: `actor=others` includes no-member events.**

**Q6. `affects`.** Kitchie writes none, so "Touches me" is empty until it does. (a) Ask Kitchie, per kind, to populate `affects` (an evidence-only issue on Kitchie); (b) drop the filter. And confirm that the catch-up's per-person sentence and action button are replaced by the row plus a "touches you" mark. Recommended: (a) and the replacement. **Decided (owner, voice, 23 Oct 2026): (b) in effect. Kitchie does not record who an event affects for now; the Touches filter and the "Touches you" mark are removed. `affects` stays in the contract, unread.**

**Q7. Is ADR 0003's template design confirmed?** It is "Proposed". The mockup's detail and rows depend on O-2 to O-7 (unknown tags, publication mechanism, bundled starter templates, localisation, where Kitchie evaluates (server or browser script, which decides whether the detail can open in place), the vocabulary). Until then every real row is a generic row. Recommended: confirm O-3 and O-6 first; they decide whether History can show anything but the generic row. **Undecided (owner, voice, 23 Oct 2026).**

**Q8. Option C's flyout as the container.** Keep the frame (H5: the detail is the same whichever way you arrive) but its content is only the template's output, plus the template's own link; no invented sub-fields. Confirm.

**Q9. Which time zone cuts the days** (`tz`)? Platform has no household zone. Mockup uses the device's. Recommended: device, with the household's later if one is ever stored. **Device zone is what the mockup uses (owner, voice, 23 Oct 2026); undecided as a decision.**

**Q10. Recording the model.** Should this model be recorded in Platform (proposed: a short section next to `history-capability.md` section 2, through Platform's own issue and PR), and should Kitchie's and Recipe's docs link to it? Proposed only; nothing is pushed there from here.

Already open elsewhere and unchanged: visibility of private changes (Q-H1), retention beyond 30 days (Q-H2), undo scope (Q-H3), last-seen server or device and late arrivals (Q-H4), assistant mark (Q-H5).
