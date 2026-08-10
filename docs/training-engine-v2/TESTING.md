# Training Engine V2 Testing

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Current Test Responsibilities

Tests should remain small and readable at the component boundary. Current responsibilities include:

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
- truthful assessment relevance and feature matching;
- feature target fit independent of feature challenge;
- explicit unknown/`not_modeled`/`not_applicable` behavior;
- deterministic history recency through `CandidateEvaluationContext.asOf`;
- source scans that prohibit hidden wall-clock decisions;
- same-exercise progression versus observational cross-exercise transitions;
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

## Candidate Intelligence Readiness

Green build and test results are necessary but insufficient to begin Session Composer. Readiness also requires deterministic Candidate Lab review, legal-pool inspection, reason-code and trace audits, tie review, uncertainty review, exercise-science judgment, and explicit acceptance of the permanent gate in `ENGINE_V2_BLUEPRINT.md`.

Tests must not force arbitrary row differentiation. If two legal candidates have identical meaningful structured inputs, an explained tie is preferable to false precision. A new distinction requires a real request fact and reviewed exercise metadata.

## Bug Localization

Tests should preserve enough pipeline context to identify whether a failure came from input interpretation, assessment interpretation, phase intent, session intent, eligibility, candidate scoring, session composition, week composition, prescription, same-exercise progression, cross-exercise transition, or validation.
