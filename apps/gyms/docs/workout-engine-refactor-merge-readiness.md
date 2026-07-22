# Workout Engine Refactor Merge Readiness

## What Was Extracted

This branch keeps the engine as the app-facing program-generation entry point and moves internal orchestration out of `src/lib/program.ts` into focused internal modules:

- engine routing and stable seed policy
- post-generation sequencing
- shared program/result assembly
- progression state, guards, and target transitions
- approved-target progression execution/runtime setup
- progression callback adapters and result finalization
- weekly runtime setup and weekly pipeline adapters
- variation runtime helpers and observability side-effects
- variation-memory state, history aggregation, recent-summary application, and snapshot commit

## Behavior Intentionally Unchanged

These areas were kept behaviorally stable on purpose:

- engine and UI APIs
- stable seed composition and same-state determinism
- weekly / nextCycle / nextPhase behavior
- selection, scoring, repair, optimizer, and exercise-catalog policy
- warning propagation semantics
- audit/selection-trace semantics
- recent-generation / variation-memory semantics

## What Still Remains In `src/lib/program.ts`

The large policy layer is still intentionally there:

- raw split-template generation
- selection/scoring heuristics
- day and week repair policy
- optimizer policy inputs
- constraint and curriculum policy
- remaining large-domain helper functions tightly coupled to selection behavior

## Recommended Next Step After Merge

The best next move is a dedicated policy pass that extracts the selection/scoring/repair layer behind a fixed golden-anchor harness, so we can reduce `src/lib/program.ts` further without risking behavior drift.
