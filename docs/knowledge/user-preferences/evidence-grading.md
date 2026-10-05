# Learning about a person: evidence and thresholds

Status: captured from the owner, 5 Oct 2026. This is a framework for how the system learns about people and decides what to act on. It is not a profile of anyone. No personal data belongs in this repo (it is public).

## The idea

Not every signal carries the same weight. Every kind of claim about a person has its own threshold, and the thresholds can differ. There are too many variables to account for, so the system does not generalise from what it sees. **Unless there is a strong signal, it does not act.**

Two separate gates:

1. **Grade the evidence** (what we can say, and how sure).
2. **Check the threshold for that kind of claim** (whether we may act on it).

A claim can be gradable and still be below the threshold to act on.

## Gate 1: grading the evidence

For every conclusion, state the grade and how many independent interactions support it. If there is not enough, say "insufficient evidence" rather than filling the gap.

| Grade | Meaning |
|---|---|
| Established | Directly stated by the person, or repeatedly demonstrated. |
| Probable | Supported by several independent examples, not explicitly stated. |
| Tentative | Weak inference from limited examples. |
| Unknown | Not enough information. |

Rules from the owner:

- Observed facts and inferred preferences are kept apart.
- Do not generalise from one or two examples.
- **Do not turn behaviour into preference unless the person explicitly states the preference, or the same pattern occurs across at least three materially different situations.**
- Before presenting any profile, say whether the evidence is sufficient to make one reliably. If not, describe only what the evidence supports.

Opening line, for example:

> Evidence quality: limited. I have several recent cooking interactions, but they are concentrated around a small number of meals and ingredients. They are enough to describe some recent behaviours, but not enough to infer a reliable overall food-preference profile.

Wording: say what was observed, not what it means about the person.

- Not: "You prefer Mediterranean food."
- But: "Tentative: several recent meals used yoghurt, feta, cucumber and olive oil. This shows recent use of Mediterranean-style flavours. It does not establish that Mediterranean food is a general preference."

## Gate 2: thresholds differ by kind of claim

The bar to act is not one number. It depends on what kind of claim it is, and on what acting would cost if wrong. Kinds of claim that came up:

| Kind of claim | Threshold to act |
|---|---|
| Safety limits (allergy, intolerance) and how severe | Not set. Never inferred from behaviour. Comes from what the person states. |
| Taste and cuisine | Not set. Needs more than recent meals. |
| Habits and routines | Not set. |
| Mood or situation right now (rushed, leftovers, not in the mood) | Not set. Depends on what the person says in the moment. |
| Household level (several people, who is eating) | Not set. |

Thresholds are to be set per kind. Until a threshold is set, treat the answer as "do not act".

## Variables that make generalising unsafe

All came up in the discussion. The list is not exhaustive.

- Recent behaviour often reflects convenience (what was easy to get), not preference.
- Preference is not habit.
- People may not yet know what they like. Taste moves through exposure, discovery and appetite.
- Timing differs by person and day. Some nights suit experiments, some don't.
- More people in the household makes a single answer harder. What anchors one person may not anchor another.
- Severity of a constraint varies by person and by ingredient. A soft avoidance and a hard allergy are never handled alike.
- The person's state in the moment overrides the profile (for example, rushed).
- Some people do not want to be asked, and some do not want to decide at all.
- Not asking, and not withholding: a suggestion can repeat until the person says stop, but a dislike is never invented.

## What the person can do

- Ask why something was surfaced, and what the system believes about them, and correct it.
- A correction counts as an explicit statement.

## Open questions

- The threshold for each kind of claim above.
- What counts as "materially different" situations, and as an "independent interaction" (same day, session, meal).
- What counts as a "strong signal" for acting, and what acting means for each feature (suggesting, ranking, hiding, filling in a field).
- Where the grade, the count and the threshold are stored, and how they are shown back to the person.
