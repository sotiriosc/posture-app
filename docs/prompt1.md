You are working in:

Repository: sotiriosc/posture-app
Product: Praxis
Related open PR: (stay on current pr)
Branch strategy: begin from current branch.

MISSION

Perform a complete audit and production-grade improvement of Praxis pain-aware workout generation.

right now current pr only adds “Knees” to the consumer and gyms questionnaires. The engine already contains some pain-specific behavior, but current handling appears uneven:

- questionnaire pain areas include Neck, Upper back, Lower back, Shoulders, Hips, and now Knees;
- some areas have PAIN_RULES;
- exercise catalog entries may contain structured painContraindications;
- some selection/filtering paths reportedly rely on free-text contraindication substring matching;
- hard intent-level restrictions are stronger for shoulder/neck and lower-back cases than for knees;
- wrists, elbows, and ankles may exist as catalog pain tokens without questionnaire inputs or dedicated rules;
- mid-session pain ratings may use a separate adaptation path.

The goal is not to apply aggressive blanket restrictions. The goal is to make pain handling explicit, deterministic, consistent, explainable, and safe across every program-generation and session-adaptation path.

THIS IS A SAFETY-CRITICAL ENGINE CHANGE.

Do not start coding immediately.

PHASE 1 — TRACE AND AUDIT

First inspect the repository and document the exact pain-data lifecycle.

Find and map:

1. Consumer questionnaire pain options.
2. Gyms questionnaire pain options.
3. Questionnaire schemas, validation, serialization, persistence, defaults, migrations, API boundaries, and stored user/program shapes.
4. Every pain-area normalization or canonicalization function.
5. PAIN_RULES and all equivalent pain-specific scoring or preference rules.
6. Exercise catalog:
   - painContraindications
   - free-text contraindications
   - movement patterns
   - joints/body regions
   - regressions/progressions/substitution metadata
7. Candidate hard filters.
8. Candidate scoring and soft penalties.
9. Program repair logic.
10. Warm-up or protective exercise injection.
11. Program regeneration.
12. Saved-program loading.
13. Weekly, next-cycle, and next-phase generation.
14. Session-level pain feedback and substitutions.
15. Progression decisions following pain.
16. Audit logs, warnings, reasons, and selection traces.
17. All pain-related tests, fixtures, fuzz tests, golden tests, and scenario matrices.

Produce an audit table before implementation:

| Input pain area | Canonical token | Questionnaire source | Persisted correctly | Dedicated policy | Hard contraindication path | Soft scoring path | Warm-up path | Session adaptation | Progression protection | Test coverage |

Include at least:

- neck
- upper_back
- lower_back
- shoulders
- hips
- knees
- wrists
- elbows
- ankles

Do not assume all of these should be exposed in the questionnaire. Report the current truth first.

PHASE 2 — DEFINE ONE CANONICAL PAIN MODEL

Create or consolidate a single typed canonical pain taxonomy used across the engine.

Requirements:

- Do not scatter raw display strings such as “Knees”, “knee”, “Lower back”, or “low-back” through engine logic.
- Separate user-facing labels from canonical engine identifiers.
- Normalize accepted legacy variants safely.
- Preserve backward compatibility with existing stored questionnaire/program data.
- Unknown values must not crash generation.
- Unknown values must be surfaced in an audit warning rather than silently treated as a known area.
- Avoid broad substring checks that produce false matches.
- Do not infer diagnoses from pain-area selection.

Example conceptual shape only—adapt to the existing architecture rather than imposing this exact API:

type CanonicalPainArea =
  | "neck"
  | "upper_back"
  | "lower_back"
  | "shoulders"
  | "hips"
  | "knees"
  | "wrists"
  | "elbows"
  | "ankles";

Build a single normalization boundary and reuse it everywhere.

PHASE 3 — DEFINE THE SAFETY HIERARCHY

Pain handling must distinguish at least four levels:

A. HARD EXCLUSION

Use only when the exercise has a structured contraindication matching an active pain area or when an existing explicit safety policy requires exclusion.

A hard-excluded exercise must not re-enter through:

- repair;
- fallback;
- optimizer;
- variation;
- progression;
- saved-program regeneration;
- session substitution.

B. STRONG DEPRIORITIZATION

Use where an exercise is not universally contraindicated but commonly loads the selected painful region or violates an existing Praxis pain policy.

It may be selected only when:

- no safer valid option satisfies program invariants;
- the selection is explicitly traceable;
- an appropriate regression or reduced-load alternative is unavailable.

C. POSITIVE PREFERENCE

Prefer compatible movement families, regressions, stabilizing work, mobility, or warm-up choices already represented in the catalog and rules.

Do not hard-code unsupported medical claims.

D. RUNTIME PAIN RESPONSE

Mid-session pain feedback must be treated separately from questionnaire history.

Confirm and enforce the existing runtime policy:

- stop or regress the current aggravating exercise;
- avoid substituting another exercise with the same relevant contraindication or loading pattern;
- do not automatically progress an exercise associated with unresolved pain;
- preserve the user’s program structure where safely possible;
- create a clear reason/audit entry.

Do not silently rewrite the entire program from one isolated session rating unless current architecture explicitly requires it.

PHASE 4 — STRUCTURED CONTRAINDICATIONS MUST BE AUTHORITATIVE

Audit whether structured exercise.painContraindications is currently bypassed or secondary to free-text matching.

Make structured metadata the primary machine-readable safety source.

Rules:

1. Structured exact canonical match should drive hard exclusion where intended.
2. Free-text contraindications may be retained only as a conservative legacy fallback.
3. Free-text matching must:
   - use normalized word/phrase boundaries;
   - avoid accidental substring collisions;
   - produce an audit warning identifying legacy fallback use;
   - never override clearer structured metadata.
4. Add an audit or validation test that identifies:
   - malformed pain tokens;
   - unknown pain tokens;
   - duplicate aliases;
   - contradictions between structured and textual contraindications;
   - catalog entries using unsupported variants.

Do not mass-edit the catalog blindly. Generate a report first, then make only justified corrections.

PHASE 5 — COMPLETE KNEE HANDLING

Verify that selecting Knees in either questionnaire:

- survives validation and storage;
- normalizes to the canonical knees token;
- reaches every generation entry point;
- activates the intended knee PAIN_RULES;
- appropriately deprioritizes aggravating squat/knee-dominant choices;
- prefers suitable hinge, glute, core, or other established compatible categories;
- injects existing protective warm-up content when appropriate;
- cannot be defeated by repair or fallback;
- influences session substitutions;
- prevents inappropriate progression following knee-pain feedback;
- does not remove all lower-body training unnecessarily;
- does not make unsupported clinical assumptions.

Do not create the false rule “knee pain means no squats ever.”

The behavior must be based on catalog metadata, movement/loading characteristics already represented in the engine, and explicit Praxis policy.

PHASE 6 — AREA PARITY WITHOUT FALSE UNIFORMITY

Neck, upper back, lower back, shoulders, hips, and knees should all pass through the same infrastructure, but they do not need identical rules.

Build common machinery with area-specific policies.

For wrists, elbows, and ankles:

- audit whether they are valid catalog tokens;
- audit whether users can communicate these areas through any current input;
- do not expose new questionnaire fields automatically;
- recommend whether they belong in:
  A. the current consumer questionnaire,
  B. an advanced/secondary pain input,
  C. session-only feedback,
  D. catalog metadata only.

Implement new UI fields only if repository evidence clearly supports doing so and the change is safe and product-consistent. Otherwise document the recommendation separately.

PHASE 7 — PRESERVE ENGINE INVARIANTS

Do not weaken or bypass:

- phase gating;
- phase objectives;
- weekly / nextCycle / nextPhase semantics;
- progression rules;
- required movement-pattern coverage;
- equipment capability;
- program coherence;
- repair behavior;
- optimizer behavior;
- stable seeded determinism;
- variation memory;
- audit/selection trace;
- warning propagation;
- saved-program compatibility.

Do not touch:

- authentication;
- billing;
- Stripe;
- database infrastructure unrelated to pain persistence;
- deployment configuration;
- unrelated UI;
- posture-analysis logic.

Preserve local-safe operation:

USER_STORE_DRIVER=memory
TRAINING_STORE_DRIVER=disabled
DATABASE_URL empty

Do not introduce network-dependent tests.

PHASE 8 — EXPLAINABILITY

For every material pain-driven engine decision, add or preserve a structured reason that can be inspected in tests and debugging.

Examples:

- hard_excluded:pain_contraindication:knees
- deprioritized:pain_policy:knees
- preferred:pain_compatible_pattern:hinge
- warmup_added:pain_protection:knees
- substituted:session_pain:knees
- progression_held:recent_pain:knees
- legacy_text_contraindication_used:knees
- unknown_pain_token:<token>

Use the repository’s existing warning/audit/trace conventions. Do not invent an unrelated parallel logging framework.

User-facing language must remain calm and non-diagnostic.

Do not tell users an exercise is medically safe.
Do not claim to diagnose an injury.
Do not imply that the engine replaces professional medical assessment.

PHASE 9 — TEST-FIRST REGRESSION MATRIX

Before modifying behavior, add failing tests demonstrating the actual gaps.

Add focused tests for:

1. Canonicalization:
   - Knees
   - knee
   - knees
   - Lower back
   - low back
   - shoulder / shoulders
   - unknown tokens
   - duplicate aliases

2. Questionnaire parity:
   - consumer and gyms expose the intended same supported pain set;
   - selected Knees persists through submission and reload.

3. Structured hard filtering:
   - an exercise contraindicated for knees cannot be selected;
   - repair cannot reintroduce it;
   - fallback cannot reintroduce it;
   - progression cannot reintroduce it;
   - session substitution cannot reintroduce it.

4. Soft policy:
   - knee pain shifts scoring toward safer compatible choices;
   - it does not eliminate all lower-body training;
   - output still satisfies phase and coverage constraints.

5. Multi-area pain:
   - shoulders + knees;
   - lower_back + knees;
   - hips + knees;
   - no pain;
   - unknown + known area together.

6. Determinism:
   - same seed + same state + same pain input produces identical output;
   - canonical aliases produce equivalent output.

7. Session pain:
   - aggravating exercise is regressed/substituted appropriately;
   - same-risk replacement is rejected;
   - progression is held where required;
   - unrelated movement categories remain stable.

8. Legacy stored data:
   - old display labels still load;
   - missing pain areas remain valid;
   - unknown legacy tokens generate warnings, not crashes.

9. Catalog integrity:
   - every structured painContraindication is canonical or explicitly mapped;
   - no unsupported spelling silently bypasses enforcement.

10. Fuzz/property tests:
   - generated programs never contain a hard-contraindicated exercise for an active pain area;
   - repair and fallback preserve this invariant;
   - generation remains deterministic.

Use existing fixtures and architecture. Avoid snapshot-only tests for safety behavior; assert explicit semantic invariants.

PHASE 10 — VALIDATION COMMANDS

Inspect package scripts and run all applicable commands, including the repository equivalents of:

- npm run build
- npx tsc --noEmit
- full unit/integration test suite
- targeted pain tests
- golden tests
- program fuzz tests
- program matrix
- scenario matrix
- acceptance/coherence suites

Run consumer and gyms tests/builds where they are separate workspaces.

Do not claim success if a suite was not run.

For every failure, classify it as:

- caused by this change;
- pre-existing;
- environmental;
- flaky/indeterminate.

PHASE 11 — MANUAL ACCEPTANCE

Verify both consumer and gyms flows:

1. Open questionnaire.
2. Confirm Knees appears.
3. Select Knees.
4. Submit/save.
5. Reload and confirm persistence.
6. Generate or regenerate a program.
7. Inspect selected exercises and audit reasons.
8. Confirm hard contraindications are absent.
9. Confirm lower-body training remains useful rather than disappearing.
10. Trigger a simulated mid-session knee pain response.
11. Confirm substitution/regression and progression-hold behavior.
12. Confirm no diagnostic or medical-certainty wording appears.

PHASE 12 — DELIVERY

Create one focused PR unless the audit proves the work should be split safely.

Preferred separation:

PR A:
- canonical pain model;
- structured contraindication enforcement;
- engine/session consistency;
- tests;
- no unnecessary UI expansion.

PR B only if justified:
- additional pain-input UI such as wrists/elbows/ankles.

Do not merge any PR.

Final report must contain:

1. Executive verdict:
   - what was unsafe or inconsistent;
   - what is now guaranteed;
   - what remains intentionally soft or unresolved.

2. Files changed and why.

3. Before/after pain-flow diagram.

4. Pain-area coverage matrix.

5. Catalog integrity findings.

6. Exact behavior for Knees.

7. Exact handling of wrists/elbows/ankles.

8. Tests added.

9. Commands run and complete results.

10. Remaining risks or unsupported assumptions.

11. PR URL.

12. Explicit confirmation:
   - no auth/billing/Stripe changes;
   - deterministic output preserved;
   - phase/progression/coverage invariants preserved;
   - no merge performed.

QUALITY BAR

This is not complete merely because tests are green.

It is complete only when:

- all user-selectable pain areas reach the engine consistently;
- canonicalization is centralized;
- structured contraindications cannot be bypassed by repair/fallback/progression/substitution;
- knee behavior is protective without being a blanket ban;
- runtime pain and questionnaire pain have clearly defined roles;
- decisions are explainable;
- old data remains compatible;
- deterministic generation and core Praxis invariants remain intact;
- consumer and gyms behavior agree where intended.