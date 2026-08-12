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
- structured prescription dose modes, load/laterality/support/tempo/effort validation, and execution-quality criteria;
- runtime prescription truth validation for identity, source exposure event, exercise binding, phase, explicit timestamp, rationale, provenance, canonical progression axes, units, mode-owned fields, side truth, range/tempo/effort/load variants, and execution-standard references;
- completed-performance and progression-evidence validation for planned-vs-actual identity, explicit occurrence time, criterion references, pain/recovery references, substitutions, continuity/runway evidence, and malformed notes;
- synthetic structured trunk/carry prescription fixtures with no production exercise rows or recommended values;
- same-exercise progression-readiness blockers for form, pain response, recovery, insufficient observation, missing same-exercise productivity evidence, and missing progression-axis runway evidence;
- prescription-only counterfactuals proving hard eligibility, ranking, phase, pain, assessment, and transition behavior remain unchanged;
- independent training-safety regression proving low-severity explicit authority can gate downstream readiness while candidate scores/ranks remain unchanged, severity alone cannot create escalation, external resolution is required, and explicit legacy urgent authority remains bridged;
- exposure-linked training-response regression covering exact prescription/performance references, tolerance/symptom/timing/consequence semantics, explicit unknown, side scope, support-context distinction, successful later re-exposure, mixed history, and inert prose;
- response-receiver regression covering exact/related/identity applicability, structured realization differences, prescription-first routing, progression hold/regression/review, continuity support, repeated-adverse observability, no automatic replacement, and no prose parsing;
- contextual annotation-only production regression proving omitted unknown/no-match/conflict components and denominator weights, accepted poor `5.5`, no duplicate mechanical bonuses, and audit-only legacy scoring;
- historical-injury doctrine proving resolved history alone leaves rankings unchanged while explicit hard restrictions retain authority;
- structured prescription contract report and current-behavior fingerprints;
- structured pain-stress exposure vocabulary, annotation validation, optional pain side preservation, potential-versus-realized traces, prescription stress exposure traces, and no ID/name/prose stress inference;
- exact seven-exercise trunk/carry curation review, including recorded owner decisions, complete proposed contracts, provenance-bearing mechanics, explicit unknown/phase and support/stance blockers, no production rows, no mandatory carry policy, no loaded-gait wall march, no hard anti-lateral wall march, and unchanged behavior fingerprints;
- knowledge-compatible seven-row production regression retaining the pre-P0 37-row boundary, seven stable IDs, complete owner provenance, the three explained contextual winner changes, no continuity winner change, contextual omission semantics, intrinsic-versus-potential stress, truthful role/section pools, compact fallback coaching, no second catalog/UI/Knowledge dependency, and isolated before/after fingerprints;
- whole-body candidate-intelligence audit covering all 45 rows, 44 need archetypes across ten explicit equipment environments, role purity, primary-versus-secondary muscle truth, direct muscle-only requests, pain/support/progression boundaries, admitted P0 and unimplemented P1 concepts, report/source consistency, and separate audit fingerprints;
- P0 whole-body production regression covering exactly eight stable IDs, 37-to-45 admission, family/schema bounds, role/action/section truth, canonical muscle relationships, equipment and derived-support legality, phase abstention, sparse prerequisites, exact progression axes, four observational transitions, compact coaching, fixed-shell personalization, anti-bloat, pain/safety/response boundaries, Knowledge compatibility, and Candidate Intelligence graduation;
- support/stance mechanics contract review, including current support consumer audit, compositional schema recommendation, seven-exercise blocking gaps, no existing support/stance lie findings, and unchanged production behavior;
- pipeline snapshots for bug localization.
- Session Composer current-seam migration and exported public API;
- production normalized SessionNeed, SessionIntent, composition-input, skeleton, satisfaction, trace and infeasibility contracts;
- sixteen controlled whole-session scenarios spanning strength, hypertrophy, general fitness, movement quality, pain contexts, continuity, response, availability, home equipment, P0 direct work, safety blocking and empty cooldown;
- canonical multi-need truth, one identity/one future source event, section legality and preparation ordering constraints;
- nine-case greedy failure oracle, anti-bloat invariants, continuity counterfactuals and no fallback/repair behavior;
- raw-minute invariance, Planner-owned structural-capacity consequences, and no invented duration estimates;
- eleven-user fixed-shell session cohort with material difference, same-anchor personalization, prescription difference, justified convergence and zero unresponsive-material-input failures;
- twenty-two isolated Session Composer production fingerprints plus frozen production ranking, comprehensive, catalog and Knowledge compatibility fingerprints.

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

Green build and test results were necessary but insufficient to begin Session Composer. Deterministic Candidate Lab review, legal-pool inspection, reason-code and trace audits, tie review, uncertainty review, exercise-science judgment, and explicit owner acceptance completed that gate.

Tests must not force arbitrary row differentiation. If two legal candidates have identical meaningful structured inputs, an explained tie is preferable to false precision. A new distinction requires a real request fact and reviewed exercise metadata.

The trunk/core domain contract does not make current exercises more specific by assertion. The response receiver, progression integration, engine safety boundary, production contextual phase scorer, 90-row historical phase disposition, focused low-back stress curation, and seven-row response-sensitive support/stress contracts remain independently testable. Golden-product safety adapter work remains separately `PRODUCT_ADAPTER_PENDING` and does not make the normalized engine boundary incomplete.

Current status supersedes historical pre-implementation wording: Candidate Intelligence remains frozen, and the production Session Composer kernel passes needs-first domain, 16-scenario, 11-user, multiple-anchor, review, Prescription, availability, anti-bloat, exhaustive/bounded, and 10,000-case deterministic tests. Classification is `SESSION_COMPOSER_PRODUCTION_KERNEL_READY_FOR_SESSION_INTENT_PLANNER`. Session Intent Planner, Week Composer, final Sequencing, Prescription generation, P1 rows, Knowledge/Library/Coaching Rail, and automatic progression/replacement remain outside this suite.

## Bug Localization

Tests should preserve enough pipeline context to identify whether a failure came from input interpretation, assessment interpretation, phase intent, session intent, eligibility, candidate scoring, session composition, week composition, prescription, same-exercise progression, cross-exercise transition, or validation.
# Role, Muscle, and Personalization Matrix (2026-08-12)

Focused tests verify all 45 canonical contribution projections, the role/action corrections, the five knee-dominant rows, action hard requirements, all three muscle relationship requirements, goal authority diagnostics, and fixed-shell counterfactuals. Fingerprints are isolated for movement roles, actions, muscle migration, need requirements, personalization, role pools, unchanged pre-P0 phase/safety/response boundaries, the 37-row identity inventory, the eight admitted P0 rows, whole-body matrix, Knowledge compatibility, and graduation.

# Session Intent Planner Validation (2026-08-12)

Planner tests cover ontology and fact ownership, all nine objective mappings, allocation-required and Week-reallocation statuses, goal/context separation, assessment clustering/actions/typed range requirements, pain/safety/phase boundaries, availability provenance, anti-bloat, equivalent merge, active-need continuity, unresolved context, 18 fixed-shell users, 10+ same-experience/equipment users, real Planner-to-Candidate-to-Composer execution, 23 fingerprints, and 10,000 fixed-seed deterministic cases. Week allocation algorithms, dose, and final sequencing remain intentionally absent.
