# Engine V3 Prototype

## What This Is

This is a parallel, non-production programming prototype under `src/lib/engine_v3/`.

It does not replace the current engine, it does not rewire the app, and it does not change live program generation behavior. The goal is to give us a safe place to evaluate a cleaner slot/family design before we decide whether any part of it is worth adopting later.

## Current Shape

The prototype includes:

- a movement-family model:
  - `horiz_push`
  - `vert_push`
  - `horiz_pull`
  - `vert_pull`
  - `squat`
  - `hinge`
  - `anti_ext`
  - `anti_rot`
  - `core`
- an explicit slot/role model:
  - `main`
  - `accessory`
  - `core`
  - `prep`
  - `finisher`
- a compatibility adapter from the current exercise catalog into the V3 family/role model
- a deterministic 3-day / 3-week Latin-square-style schedule scaffold
- simple experience-aware ranking and uniqueness scoring
- audit output for coverage, pick history, uniqueness, and slot volume

## Assumptions

- The current exercise catalog has enough metadata to infer prototype families and support style using existing fields such as `pattern`, `movementPattern`, `familyKey`, `variantKey`, `equipment`, `difficulty`, `experienceMin`, and `tags`.
- Experience bias is intentionally simple:
  - beginners prefer machine/supported/stable options
  - intermediates tolerate a mix
  - advanced lifters can bias toward freer and more complex patterns
- The prototype schedule only fully supports the 3-day / 3-week case right now.
- Auditability matters more than squeezing out maximum selection sophistication in this pass.

## What Is Still Missing Before Production Adoption

- a broader family-to-slot curriculum that covers real 4-day and 5-day splits instead of only a 3-day prototype
- tighter capability modeling beyond equipment plus a few safe prototype flags
- validation against the current engine's constraints, repairs, pain handling, and progression rules
- stronger slot coverage rules for specialties like unilateral lower work, arm isolation, and movement-specific prep blocks
- a golden-anchor comparison harness to measure whether V3 behaves acceptably against production expectations
- a migration plan for how V3 would coexist with or replace the current selection/scoring/repair layer

## 4-Day / 5-Day Viability

The structure looks viable for expansion because the schedule, slot model, adapter, ranking, and audit layers are already separated.

What is not done yet is the actual curriculum design for 4-day and 5-day blocks. The current implementation keeps that intentionally out of scope so we can validate the family/slot approach on the safest 3-day path first.
