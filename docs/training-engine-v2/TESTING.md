# Training Engine V2 Testing

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Current Test Responsibilities

Tests should remain small and readable at the component boundary. Current responsibilities include:

- reference exercise validation;
- equipment capability representation;
- explicit floor-space, stable-loaded-standing, and loaded-gait non-implication tests;
- cable-height, band/cable separation, exact-machine, and dumbbell single/pair tests;
- synthetic future trunk/carry requirements without production exercise rows;
- current equipment-legality and expanded-fixture serialization fingerprints;
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
- all approved trunk/core movement-role values and unchanged reference-role metadata;
- field-complete `TrunkMechanicsProfile` validation, structured provenance, and accepted-unknown review basis;
- structural separation of reviewed `none`, field-level `unknown`, and profile-unavailable evidence;
- role-legality counterfactuals proving strong trunk mechanics cannot manufacture a movement role;
- trunk trace completeness and source-consumer scans prohibiting ID/name/prose/cue/tag inference;
- eligibility, ranking, pain-readiness, phase, assessment, transition, notes, and provenance invariance under trunk-profile-only changes;
- fixed comprehensive production fingerprints covering ranks, totals, component raw values, rejection codes, pain readiness, phase, and assessment traces;
- response-led flat moderate severity across values 3-6;
- standard versus elevated non-hard moderate review urgency;
- candidate-specific response applicability and readiness precedence;
- selected-result readiness, executable alternatives, all-non-executable pools, and global urgent-review visibility;
- numeric and ranking invariance when only severity or required response changes;
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

The trunk/core domain contract does not make current exercises more specific by assertion. Counterfactual equipment tests use synthetic requirements; all reference exercises retain their prior equipment requirements and none uses `carry_load`. Only 90/90 Breathing, Dead Bug, and Pallof Press carry the separately approved trunk profiles. The trunk/carry equipment contract adds no proposed exercise; its next dependency is structured dose / prescription and progression-axis truth before any catalog implementation.

## Bug Localization

Tests should preserve enough pipeline context to identify whether a failure came from input interpretation, assessment interpretation, phase intent, session intent, eligibility, candidate scoring, session composition, week composition, prescription, same-exercise progression, cross-exercise transition, or validation.
