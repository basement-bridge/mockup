# Boundary contract: the conversational AI and the learning engine

Status: draft v0.2, 5 Oct 2026. **As built (v1, stated only):** Kitchie issue #236, PR #237 against `uat`, requirement R26 in Kitchie's `docs/project-plan.md`. Where this draft and R26 differ, R26 is what was built: v1 acts only on stated and corrected feedback, hints have no priority field, and evidence roles are supports, retired and noted. A proposal, written for the owner to review. Not built. v0.2 narrows to two tools (owner, 5 Oct 2026): one to get context and hints, one for feedback, where a correction carries more weight than going along with an inference. No personal data in this file (public repo).

Scope: the engine only informs the conversational AI. The AI is the only way in and the only way out. Framework: see `evidence-grading.md`.

## Principles

1. The AI owns language and judgement. The engine owns memory, evidence, grading, decay and safety rules. Neither does the other's job. The engine does no language processing.
2. The AI always initiates. An MCP server can only answer calls. "Kitchie tells the AI" means the AI asked, or a response it was already getting carried extra.
3. Tolerant in, strict out. Every input field is optional. Unknown enum values are accepted as `other`. Output is small, deterministic and schema-stable.
4. Nothing here ever blocks an existing tool. With the engine off or slow, every existing tool behaves as today.
5. The AI is a sensor, not an authority. It reports what the person said or did. It never sets a grade and never writes an inferred claim.
6. Safe default: when context or evidence is missing, act less, not more.

## Shared types

```
Job        = "cooking" | "planning" | "shopping" | "scanning_in" | "using_up" | "main_ingredient" | "other"
Mode       = "preference" | "discovery"                    // default "preference"
Context    = { job?: Job, mode?: Mode, for_whom?: PersonRef[], headcount?: int,
               meal_time?: "breakfast" | "lunch" | "dinner" | "snack",
               day_type?: "weekday" | "weekend", rushed?: bool }
Grade      = "established" | "probable" | "tentative"      // "unknown" is never returned as a claim
Permission = "use" | "suggest" | "ask_first"
ClaimKind  = "safety" | "taste" | "habit" | "trait" | "other"
Scope      = { who: PersonRef[] | "household", meal_time?, day_type?, headcount?, job?, mode? }

ClaimView = {
  id: string,
  kind: ClaimKind,
  statement: string,               // plain words
  grade: Grade,
  permission: Permission,          // what the AI may do with it (below)
  source: "stated" | "observed" | "inferred",
  support: int,                    // independent interactions behind it
  scope: Scope,                    // what it covers, and no more
  severity?: "hard" | "soft",      // safety claims only, as stated by the person
  as_of: timestamp,
  reason: string                   // one line, built from stored fields, never improvised
}

AskHint = {
  id: string,
  wants_to_know: string,
  why_it_matters: string,          // benefit to the person, and what we assume if unknown
  priority: "must" | "should" | "may",
  ok_when: Job[],
  gap: string,                     // what evidence is missing
  on_answer: string,
  example_phrasing?: string        // suggestion only; the AI words it freely
}
```

Permission meanings:

- `use`: the AI may treat it as fact. Established claims only.
- `suggest`: the AI may offer it, with the reason. It must not assume it.
- `ask_first`: the AI should confirm before relying on it.

A claim below the bar for the current situation is not returned as a claim. It may appear under `unknown`.

## Tool 1: `get_context` (engine to AI, with hints)

When: planning, the start of a session, whenever the situation changes, or when the person asks "why did you suggest that?". A read.

Input (all optional):

```
{ context?: Context,
  topic?: string[],        // items, ingredients, a dish, a meal
  explain?: string,        // a claim_id or suggestion_id: return its reasons instead
  max_claims?: int }       // engine caps it regardless
```

Output:

```
{ contract_version: "0.2",
  as_of: timestamp,
  engine: "on" | "off",
  context_used: { ...Context, "<field>_from": "given" | "session" | "default" },
  evidence_quality: "sufficient" | "limited" | "insufficient",   // stated first, per the owner's rule
  constraints: ClaimView[],        // safety limits, separate from taste
  claims: ClaimView[],             // only those that clear the bar for context_used
  unknown: [{ about: string, note: "insufficient evidence" }],
  hints: AskHint[],                // 0 to 2; "ask if appropriate", each with why it matters
  explanation?: {                  // only when explain was given
    claim: ClaimView,
    because: [{ kind: "corrected" | "rejected" | "stated" | "observed" | "accepted",
                said?: string, at: timestamp, count: int }],   // at most 5
    not_enough?: string,
    status: "active" | "faded" | "rejected" } }
```

Rules:

- Context comes from, in order: the call, the recent calls in this session (`cook_meal` suggests cooking, `shopping_list` suggests shopping, a burst of `add_item` suggests scanning in), a short-lived session memory that decays, then the cautious default.
- Cautious default (job unknown): only Established claims, highest bar, and a hint addressed to the AI to pass the job.
- Never returns raw evidence, and never returns anything below the bar as a claim.
- Hints are offers, not orders: the AI asks only if it is appropriate, uses `why_it_matters` to decide, asks one at a time, and never asks a `may` or `should` hint while the job is `cooking`.
- Explanations are built only from stored fields. The AI may paraphrase, never invent a reason.
- Answers from stored rollups. No inference on the call. Bounded payload.
- When the engine is off: `engine: "off"`, empty lists, `evidence_quality: "insufficient"`.
- Hard constraints are always included for the people in `for_whom`, whatever the job.

Why one read tool and not two: hints depend on the context, so they come back from the call that receives the context. Explanations are a read too, so they are an option on the same tool.

## Tool 2: `give_feedback` (AI to engine)

When: the person reacts to a hint, a suggestion or a claim, or says something worth remembering. A write.

Input:

```
{ feedback: Feedback[],          // 1 to 10; one utterance can carry several
  context?: Context }            // applies to every item that has none of its own

Feedback = {
  kind: "corrected" | "rejected" | "stated" | "observed" | "accepted",
  said?: string,                 // the person's words verbatim, max 500. Required for corrected and stated.
  on?: { hint?: string, suggestion?: string, claim?: string },   // what it responds to, if anything
  about?: { type: "item" | "ingredient" | "recipe" | "cuisine" | "person" | "other",
            ref?: string, text?: string },
  statement?: "likes" | "dislikes" | "avoids" | "usually" | "fact",   // for stated and corrected
  severity?: "hard" | "soft",    // for "avoids", only if the person said how strict
  applies_to?: Scope,            // if the person limited it ("at dinner", "when it's just me")
  client_ref?: string            // optional, to de-duplicate retries
}
```

Output (deliberately small, no claims echoed):

```
{ accepted: int,
  ignored: [{ index: int, reason: string }],
  applied_now: string[] }        // e.g. "correction recorded"
```

### Weight of feedback (strongest first)

No numbers. An ordering the engine respects:

1. `corrected`: the person said the system was wrong, and usually what is right ("no, that's wrong", "not chicken, it was the sauce"). Retires the claim, blocks re-inference from the same evidence, and the right answer becomes a stated fact.
2. `rejected`: the person said no to a hint or suggestion without saying what is right. Lowers the claim it came from; repeated rejections retire it.
3. `stated`: the person said something about themselves unprompted, or answered a hint. Can create an Established claim.
4. `observed`: the person did something unprompted, seen by the AI (a choice, a tool call). Never the AI's interpretation. Weak on its own.
5. `accepted`: the person went along with a suggestion. The weakest signal, because going along with an inference is partly the system's own doing. It never raises a claim to Established on its own.

Rules:

- `corrected` and `rejected` are written immediately (synchronously). The rest can be handled in the background.
- A suggestion the person simply ignored is not a rejection.
- The AI's own inference is not feedback. It is ignored if sent.
- Never fails the conversation. Unknown values become `other`, bad items go to `ignored`.

## Evidence: selective, traceable, not only the journal

From the owner (5 Oct 2026, by voice):

- The journal holds what the person sees. There will be other facts the system gets to know that are not journal entries (for example, which hints were offered, asked and answered, or what context was served).
- Capture is selective. Write only what is worth keeping as evidence, otherwise it is spam.
- Whatever is captured as evidence must have a way back to it. Relying purely on the journal is myopic.

So each evidence entry points either at a journal row or at its own record, and both are resolvable later. How the evidence store is shaped is open.

## Cross-cutting

- Hot path: no engine call may add measurable latency to existing operations. Evidence points at rows the operation already wrote (the journal). Rollups run in the background. Only corrections, rejections and hard avoids are written synchronously.
- Scoping: per person and per household, from the authenticated session. `PersonRef` is an id the engine already knows, never free text.
- Versioning: `contract_version` on every output. Additive changes only within a major version.
- Where a suggestion comes from another tool, that tool's response carries a `suggestion_id` so feedback can point at it.
- Tool descriptions carry the usage guidance: what each permission means, that hints are optional, to ask at most one at a time, never to ask while the job is `cooking` unless the hint is `must`, and to send a correction whenever the person says the system got something wrong.
- Testing: a set of recorded conversations as contract tests (does the AI send the right feedback kind, respect `permission`, and skip `may` hints mid-cook), plus a log of whether each hint was followed.

## Open questions

- Exact job list and whether `shopping` needs a "before" and "in store" split.
- `PersonRef` and household identity across Kitchie, Recipe and the platform.
- Where `suggestion_id` is issued when the suggestion is the AI's own and not a tool's.
- Which of these live in Kitchie, Recipe or the platform, and who owns the engine.
- What the evidence store looks like, beyond the journal, and which events earn a place in it.
- Where personal data (preferences, constraints) is stored, given the repositories are treated as public and Kitchie's MCP endpoint may be unauthenticated.
- Thresholds and the definition of a "strong signal" (see `evidence-grading.md`).
