# Session Composer Architecture

Status: `SESSION_COMPOSER_DESIGN_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION`.

This document defines the approved Session Composer design. The implemented code is a deterministic non-production laboratory. It does not generate product workouts.

## Mission

The future Session Composer answers:

> Which smallest coherent set of legal exercises best satisfies this session's actual training needs for this person, while preserving useful continuity and avoiding unnecessary fatigue, redundancy and setup cost?

It does not fill a fixed warm-up, activation, main, accessory and cooldown template. Those labels can describe and present a finished session, but they do not create five independent exercise requirements.

## Reasoning Boundary

| Owner | Receives | Owns | Must not do |
| --- | --- | --- | --- |
| Session Intent | phase/weekly context, athlete facts, constraints | actual needs, rationale, priority, time and exercise-count bounds | choose exercises or doses |
| Candidate Intelligence | one exact need plus athlete context | hard legality, rank, value, readiness and candidate trace | compose the session |
| Session Composition | needs plus legal candidate snapshots | smallest covering set, overlap, whole-set coherence, continuity/fatigue/redundancy/setup tradeoffs | widen pools, repair illegality, prescribe, progress or replace |
| Sequencing | selected set plus explicit precedence dependencies | legal order and setup-transition minimization | change selected identities or prescribe dose |
| Prescription | one selected exercise in session context | sets, reps, load, range, support, tempo, effort, rest, side and realized stress | retroactively justify selection truth |

Week Composer, Weekly Development Ledger, phase advancement, automatic progression, automatic replacement and automatic rotation remain separate future owners.

## Needs-First Model

`NeedsFirstSessionIntent` contains a variable-length set of explicit `SessionNeed` values. A need has:

- a stable ID;
- one kind: training stimulus, preparation, capacity or recovery;
- required or optional priority;
- a rationale;
- explicit preparation or precedence relationships where they exist.

No kind is mandatory. A session may contain no cooldown identity, no standalone activation identity, or no loaded main identity when its actual needs do not justify one. Conversely, a pain-aware return session may be preparation-heavy without manufacturing a main exercise.

Preparation is conditional programming truth, not generic filler. A preparation need must identify what it prepares for. Display sections are derived later from selected exercise use and sequence; they do not determine cardinality.

## Candidate Handoff

`CandidateIntelligenceSnapshot` is read-only. It contains exact request IDs, legal ranked candidates by need, Candidate Intelligence readiness, and exercise-level logistics used by composition. A listed exercise can cover a need only because Candidate Intelligence placed it in that need's legal pool. Review-deferred training or candidates cannot be selected. Prescription-resolution requirements remain visible on a selected identity and pass downstream unresolved.

Composition cannot infer coverage from exercise names, summaries, coaching cues, muscle association or broad similarity. It cannot add a candidate because the session otherwise looks incomplete. Missing coverage produces an infeasible result.

## Composition Policy

The lab performs a bounded exhaustive search over at most 20 candidate identities and at most eight selected exercises. These are laboratory safety bounds, not production scale decisions.

Only subsets that cover every required need within duration and exercise-count constraints are feasible. Feasible sets are compared lexicographically:

1. fewest selected exercise identities;
2. most optional needs covered without increasing cardinality;
3. most productive continuity retained;
4. least pairwise redundancy;
5. lowest modeled fatigue cost;
6. fewest setup families;
7. strongest Candidate Intelligence rank and value;
8. canonical exercise ID order as the deterministic final tie-break.

This order makes anti-bloat structural. Candidate scores do not buy an extra exercise, and an optional benefit does not outrank a smaller complete set. Production coefficients, normalization and search strategy require separate authorization and calibration.

## Coherence And Anti-Bloat

A valid composed set must satisfy all of these invariants:

- every required need is covered by a legal per-need candidate;
- no exercise identity appears twice;
- every selected exercise is indispensable to at least one required need in the winning minimal set;
- no section quota can add an exercise;
- optional needs are accepted only when the minimal required set already covers them;
- preparation and ordering dependencies remain explicit;
- duration and exercise-count constraints are hard laboratory bounds;
- continuity is useful evidence, not permission to keep an illegal or unnecessary exercise;
- variety and artificial user-to-user uniqueness have no objective value.

Redundancy keys describe overlap for whole-set comparison only. They grant no weekly set credit and do not become permanent exercise classes.

## Sequencing

Sequencing is a second operation after selection. It creates a precedence graph from explicit `sequenceBeforeNeedIds` and `preparesForNeedIds`, enumerates legal orders within the small lab bound, minimizes adjacent setup transitions, and uses canonical ID order as the final tie-break.

A cycle is reported as infeasible. Sequencing does not drop, add or replace an exercise to repair the graph. It does not choose dose.

## Determinism And Trace

The same serialized intent and candidate snapshot produce the same selected set, metrics, trace and order. The lab reads no wall clock, randomness, database, product state or prose heuristic.

Trace output states that the smallest legal cover won and names the whole-set tie-break order. Each selection exposes the needs it covers and the required needs for which it is indispensable.

## Explicit Non-Goals

This design does not authorize:

- production Session Composer wiring;
- a production workout generator or public `composeSession` orchestrator;
- Week Composer or Weekly Development Ledger;
- final scoring coefficients or production search bounds;
- automatic prescription, progression, replacement or rotation;
- phase advancement;
- Praxis Library or Knowledge Layer implementation;
- Coaching Rail UI or product integration.

Exact next dependency: `SEPARATE_OWNER_AUTHORIZATION_FOR_PRODUCTION_SESSION_COMPOSER_IMPLEMENTATION`.
