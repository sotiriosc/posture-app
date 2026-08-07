# Phase 4 — Questionnaire / Capability Migration

See also `equipment-program-audit-phase4-baseline-bands.md` (Step A).

## Current questionnaire semantics

- Equipment token: `bands` (label: Resistance bands)
- New field: `bandSetup` with five options (loop only / long±anchor / both±anchor)

## Legacy migration policy

1. Stored `bands` without `bandSetup` → `legacy_unknown`
2. Never imply long/loop type or any anchor from legacy
3. Unknown anchors remain false
4. Existing stored programs remain viewable unchanged
5. New generation must not schedule unconfirmed type/anchor exercises

## Setup lanes

| Lane | Setup | Anchors |
|---|---|---|
| A | long/both + repositionable anchor | high + mid + low |
| B | long/both, no anchor | none |
| C | loop_only | none (loop + bodyweight) |
| Legacy | unknown type | none |
