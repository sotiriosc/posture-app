# Future Praxis Knowledge Layer Compatibility

## Product Boundary

```text
Engine = makes decisions
Knowledge Layer = stores reusable canonical educational knowledge
App = presents concise contextual versions during training
Library = presents deeper educational versions publicly
```

The public feature is **Praxis Library**. The conceptual internal canonical
educational system is **Praxis Knowledge Layer**. Neither is implemented by
Training Engine V2.

The invariant is: **One fact. One canonical source. Multiple presentations.**

Training Engine V2 remains fully functional when no Knowledge Layer exists or
when an exercise has no educational content. Knowledge resolution is a future
adapter, never an eligibility, ranking, identity, stress, progression,
support, phase, response, or validation dependency. The engine adds no network,
database, CMS, route, UI, or content-fetch dependency.

## Canonical Identity Seam

The stable `ExerciseDefinition.id` is the future exercise-knowledge seam. For
example, `serratus-wall-slide` is sufficient for a future external adapter to
request educational content. There is one production exercise catalog, no
Library-specific exercise ID, no competing cue identifier system, and no full
knowledge object inside `ExerciseDefinition`.

An illustrative future call may resemble:

```ts
resolveExerciseKnowledge({
  exerciseId,
  context,
  reasonCodes?,
  mechanicsIds?,
  stressTags?,
})
```

This is not an approved schema and is not implemented. Resolution should use
structured engine output, including exercise ID, movement roles, reason codes,
mechanics identifiers, stress tags, response requirements, pain context, and
requested depth. It must never parse arbitrary prose to choose content.

## Current Text Ownership

| Current field/output | Current ownership | Future boundary |
| --- | --- | --- |
| `ExerciseDefinition.name` | `ENGINE_DOMAIN_IDENTITY` | Stable compact identity label; may title external knowledge but is not an article. |
| `ExerciseDefinition.summary` | `FUTURE_KNOWLEDGE_LAYER_CANDIDATE` | Current compact fallback; richer explanation belongs outside the engine. |
| `ExerciseDefinition.coachingFocus` | `CURRENT_COMPACT_COACHING_FALLBACK` | One or two immediate reminders; a future adapter may enrich by exercise ID without changing decisions. |
| section suitability reasons | `ENGINE_DECISION_EXPLANATION` | Explain legal session use; not public educational copy. |
| legacy and contextual phase reasons | `ENGINE_DECISION_EXPLANATION` | Explain bounded phase evidence; not physiology education. |
| mechanics notes | `CURATION_OR_PROVENANCE` | Evidence and uncertainty for engine facts; not coaching content. |
| stress notes | `CURATION_OR_PROVENANCE` | Explain exposure scope and ownership; not danger or public advice. |
| transition notes | `CURATION_OR_PROVENANCE` | Explain reviewed relationship intent; never automatic progression copy. |
| `DecisionTrace` reasons | `ENGINE_DECISION_EXPLANATION` | Request-specific decision evidence; not reusable Library prose. |
| reason codes | `NOT_PUBLIC_EDUCATIONAL_CONTENT` | Stable machine-readable decision semantics for adapters and audits. |
| prescription execution standards | `ENGINE_DOMAIN_IDENTITY` | Define realized task and progression evidence; future coaching may present a contextual subset. |
| pain-response explanations | `ENGINE_DECISION_EXPLANATION` | Explain structured response ownership; not diagnosis, screening, or treatment content. |

## Current `coachingFocus` Policy

`coachingFocus` remains a compact fallback for immediate exercise coaching. It
is not the canonical Knowledge Layer schema. New production rows use only one
or two short reminders and contain no full setup guide, execution article,
error essay, mechanics provenance, or large instruction blob.

## Future Coaching Rail

Future categories are `focus`, `cues`, `setup`, `during`, `pattern`, and
`watchFor`; the exact schema is unapproved. A future compact workout card should
show focus immediately, default to cues, support tap navigation and mobile
horizontal swipe, and replace content within a stable compact area. Routine
execution coaching remains inside the active workout rather than forcing a
Library visit.

Preferred future pain flow:

```text
reported pain/problem
    -> short contextual explanation inside workout
    -> optional deeper Praxis Library article
```

No Coaching Rail, workout-card change, route, link, animation, or swipe behavior
is implemented here.

<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:START -->

## Pre-G2 - Package R production catalog and Knowledge core

Pre-G2 implements the pure `@praxis/knowledge-core` data boundary for the selected eight rows. Engine production code consumes only committed generated compact fallbacks. Coaching Rail and Library runtime/UI integration remain unimplemented.

Combined Pre-G2 fingerprint: `f67906f4078f29ca0ac9903e5bbc556483bac2083c598e3bad5e6893155df18a`. Exact next dependency: `CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_AUTHORIZATION`.

<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:END -->
