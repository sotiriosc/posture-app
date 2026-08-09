# Training Engine V2 Testing

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Foundation Tests

The initial tests are small and readable. They cover:

- reference exercise validation;
- equipment capability representation;
- assessment confidence and priority;
- pain-state distinctions;
- personal blocks;
- hard eligibility reasons;
- candidate score decomposition;
- phase representation;
- session-section dependency representation;
- longitudinal training history;
- decision trace structure;
- modular component boundaries;
- structured reason codes;
- assessment/alignment influence;
- pipeline snapshots for bug localization.

## Current Command

```bash
npm run build --workspace=@praxis/training-engine-v2
npm run test --workspace=@praxis/training-engine-v2
```

## Later Testing Direction

The blueprint calls for a gradual path: 12 golden personas, then more deeply inspected personas, then broad matrices, then fuzz/property tests only after behavior is understood.

## Test Hierarchy

The intended hierarchy is:

1. component/unit tests;
2. domain interaction tests;
3. candidate-ranking tests;
4. session-composition tests;
5. week-composition tests;
6. longitudinal phase tests;
7. property/fuzz tests.

Lower-level component failures should be diagnosable without relying on full-program fuzz tests.

## Bug Localization

Tests should preserve enough pipeline context to identify whether a failure came from input interpretation, assessment interpretation, phase intent, session intent, eligibility, candidate scoring, session composition, week composition, prescription, progression, or validation.
