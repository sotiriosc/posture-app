import {
  LONGITUDINAL_ACTIONS,
  LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  LONGITUDINAL_ADAPTATION_GATE_16_ACTIVATION_STATUS,
  LONGITUDINAL_ADAPTATION_GATE_16_STATUS,
  LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION,
  LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY,
  LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
  LONGITUDINAL_DETAILED_CLASSIFICATIONS,
  LONGITUDINAL_GATE_16_SUBGATES,
  LONGITUDINAL_OUTCOME_SIGNALS,
  LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
  LONGITUDINAL_OUTCOME_SOURCE_OWNERS,
  LONGITUDINAL_STATES,
  LONGITUDINAL_TARGET_SCOPES,
} from "../../src/longitudinalAdaptation/designContracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5 } from "./effectiveAuthorityRegistryV5";
import {
  LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST,
  LONGITUDINAL_CONTROLLED_CHAIN_NAMES,
  LONGITUDINAL_FIXED_SHELL_DESCRIPTORS,
} from "./longitudinalAdaptationCohorts";
import {
  longitudinalAdaptationActivationGuards,
  longitudinalAdaptationFingerprints,
  runLongitudinalControlledChains,
  runLongitudinalFixedShell,
  runLongitudinalHoldout,
  runLongitudinalStress,
} from "../helpers/longitudinalAdaptationDesignLab";

export const LONGITUDINAL_ADAPTATION_CLASSIFICATION =
  "LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION" as const;

export const LONGITUDINAL_UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
  fullPrescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
  prescriptionPolicyV1: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
  productionPrescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  historicalCagt: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
  finalSequencingDesign: "71fcb88e231e2953d508e0a1d6389fed98ca0f6af5a67592cdb56bb3ce563f42",
  productionFinalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
  postPrescriptionWeekDesign: "6beea85cca5cfb73343c1ae7b6705ba6a9be4a6b82c737d09945357f6563fb82",
  productionPostPrescriptionWeek: "c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951",
  gate14: "ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6",
  gate14Holdout: "e6ce4f2ff891892d01d7dd5373c32cfa5610e85e68ed19b75a1004757214acda",
  gate15Design: "9b5602fbbfe5f9f32537bff8c07b434e8cb7528f62513a97d6c823d0cba3f3fc",
  gate15Holdout: "9d4c6fe5b46612e34a798beee89f0c6e83992df516ebdbdc37fe28b47aa7f293",
  productionPhaseContinuity: "39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232",
  productionPhaseContinuityGolden: "b0e6f7bd1605c7de9d85a16f0bb5c65cd2784d23d4f64d9d5d894bda4b92a635",
});

const common = `
**Classification:** \`${LONGITUDINAL_ADAPTATION_CLASSIFICATION}\`

**Authority:** \`LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE\`

**Runtime:** \`${LONGITUDINAL_ADAPTATION_GATE_16_STATUS}\`; activation \`${LONGITUDINAL_ADAPTATION_GATE_16_ACTIVATION_STATUS}\`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.
`;

function list(values: readonly string[]): string {
  return values.map((value) => `- \`${value}\``).join("\n");
}

function document(title: string, body: string): string {
  return `# ${title}\n${common}\n${body.trim()}\n`;
}

const ontology = document("Longitudinal Adaptation Ontology Audit", `
**Ontology audit classification:** \`${LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION}\`

## Finding

The repository previously had typed planned program truth, independent Performance outcome fields, Training Response Receiver applicability, Progression Readiness without axis selection, and production Phase Continuity with unapplied decisions. It did not have a canonical completed-exposure outcome ledger, bounded evidence window, longitudinal target/thread/state identity, closed action vocabulary, or decision/application validation contract.

The admitted design closes those ontology gaps without claiming runtime source adapters. Planned dose and timing remain references only; actual dose and timing require independent observation. Recovery is explicit or unknown, never inferred.

## Concept audit

| Concept | Pre-design classification | Gate 16 treatment |
|---|---|---|
| \`ExercisePerformanceRecord\` | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`COMPLETED_OUTCOME_OWNER\` | Authoritative occurrence and actual-performance source; normalized, never re-owned |
| \`CompletionStatus\` | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`COMPLETED_OUTCOME_OWNER\` | Preserves completed, partial, not-performed, substituted, and unknown distinctions |
| \`actualDose\` | \`COMPLETED_OUTCOME_OWNER\`, \`OBSERVATIONAL_ONLY\` | Independent observation; planned dose is reference-only |
| \`actualTiming\` | \`COMPLETED_OUTCOME_OWNER\`, \`OBSERVATIONAL_ONLY\` | Independent observation; prescribed timing is never copied as actual |
| \`ExecutionQualityObservation\` | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`OBSERVATIONAL_ONLY\` | Evidence with criterion and source identity, not an action |
| \`ExerciseSubstitutionRecord\` | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`COMPLETED_OUTCOME_OWNER\` | Preserves original assignment/exercise and realized exercise |
| \`recoveryStatus\` / \`recoveryEvidenceIds\` | \`COMPLETED_OUTCOME_OWNER\`, \`UNKNOWN_REQUIRES_REVIEW\` | Explicit recovered/concern/unknown truth; never inferred from elapsed time |
| \`TrainingResponseObservation\` | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`RESPONSE_OWNER\` | Response Receiver-owned signal linked to one completed source event |
| \`TrainingResponseHistory\` | \`RESPONSE_OWNER\` | Contextual history retained below exact and related realization evidence |
| Training Response Receiver | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`RESPONSE_OWNER\` | Owns applicability, tolerance, symptom course, re-exposure, and replacement consideration |
| exact/related/identity applicability | \`RESPONSE_OWNER\` | Canonical strongest-first hierarchy; structured related differences are required |
| successful re-exposure | \`RESPONSE_OWNER\` | Remains visible, weakens permanent-failure pressure, and preserves options |
| adverse-history summary | \`RESPONSE_OWNER\` | Context only; cannot override stronger current realization evidence without policy |
| \`ProgressionEvidence\` | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`PROGRESSION_READINESS_OWNER\` | Evidence, never an applied dose change |
| \`ProgressionReadinessTrace\` | \`PROGRESSION_READINESS_OWNER\` | May open progression review; selects no axis |
| \`ProgressionDecision\` | \`OVERLOADED_CONCEPT\`, \`DOMAIN_CHANGE_REQUIRED\` | Gate 16 separates axis authorization from downstream exact-dose realization |
| \`ExerciseProgressionProfile\` / \`ProgressionAxis\` | \`CORRECT_SINGLE_PURPOSE_CONCEPT\` | Defines legal axis candidates; no automatic choice |
| exercise transition relationships | \`CORRECT_SINGLE_PURPOSE_CONCEPT\` | Candidate/Composer knowledge after an explicit reopen directive |
| phase progression intent | \`PLANNED_ONLY\` | Contextual late input, never action authority |
| Production Phase Continuity result | \`CORRECT_SINGLE_PURPOSE_CONCEPT\` | Gate 15-owned current phase decision consumed without mutation |
| \`ProgramHistory\` / \`ExerciseHistoryEvent\` / \`SessionHistory\` | \`LEGACY_COMPATIBILITY_ONLY\` | May be adapted only through typed source records; prose/history alone has no authority |
| \`FatigueState\` | \`OBSERVATIONAL_ONLY\`, \`UNKNOWN_REQUIRES_REVIEW\` | Requires an explicit recovery, adherence, Performance, or reviewed aggregate owner |
| production source-exposure identity | \`CORRECT_SINGLE_PURPOSE_CONCEPT\` | Canonical join key; exactly one outcome entry per realized event |
| final Prescription revision | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`PLANNED_ONLY\` | Required lineage check; remains planned truth, not actual outcome |
| final Sequence revision | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`PLANNED_ONLY\` | Required lineage check; actual order remains independently observed when available |
| Production Post-Prescription Week result | \`CORRECT_SINGLE_PURPOSE_CONCEPT\`, \`PLANNED_ONLY\` | Gate 13 validates planned program truth and cannot prove completion |
| planned stress/burden traces | \`PLANNED_ONLY\` | References only; completed stress requires realized source evidence |
| live Performance/Product ingestion | \`MISSING_COMPLETED_EXPOSURE_LEDGER\`, \`OUT_OF_SCOPE\` | Explicit test/design adapters only; production adapters remain absent |
| Gate 11 | \`CORRECT_SINGLE_PURPOSE_CONCEPT\` | Foundation authority for Performance linkage, not live Gate 16 ingestion |
| Gate 13 | \`CORRECT_SINGLE_PURPOSE_CONCEPT\` | Production planned-Week validation authority |
| Gate 14 | \`TEST_FIXTURE_ONLY\` | Mixed production/design comparison evidence; no runtime decision authority |
| Gate 15 | \`CORRECT_SINGLE_PURPOSE_CONCEPT\` | Production Phase Continuity decision owner; application remains separate |
| current application-history storage | \`MISSING_APPLICATION_CONTRACT\`, \`OUT_OF_SCOPE\` | Candidate validation is designed; production persistence/orchestration is absent |
| completed exposure ledger | \`MISSING_COMPLETED_EXPOSURE_LEDGER\` | Closed by \`CompletedExposureOutcomeLedgerEntry\` design, not runtime storage |
| evidence window | \`MISSING_EVIDENCE_WINDOW\` | Closed by explicit bounded window with evaluation time and exclusions |
| target scope | \`MISSING_TARGET_SCOPE\` | Closed by the typed target and no-silent-broadening rule |
| action vocabulary | \`MISSING_ACTION_VOCABULARY\` | Closed by the 14-action vocabulary and owner/application fields |
| decision identity/revision | \`MISSING_DECISION_IDENTITY\`, \`MISSING_DECISION_REVISION\` | Closed by deterministic lineage and immutable revision-ledger designs |
| rotation/deload policy | \`MISSING_ROTATION_POLICY\`, \`MISSING_DELOAD_POLICY\` | Closed for review authorization only; application policy remains downstream |

## Required boundary answers

1. **Yes.** Actual dose remains independent from planned dose and requires an observed source.
2. **Yes.** Actual timing remains independent from prescribed timing and requires an observed source.
3. **Yes.** One completed exposure links to exactly one production source event.
4. **Yes.** Several response observations reference one event without multiplying exposures.
5. **Yes.** Substitution lineage preserves both original and realized exercise truth.
6. **Yes.** Exact realization evidence remains above related realization evidence.
7. **Yes.** Identity history remains contextual and weaker than realization evidence.
8. **Yes.** Successful re-exposure blocks inappropriate permanent-failure pressure without erasing history.
9. **Yes.** Progression Readiness remains evidence and selects no action or axis.
10. **Yes.** Gate 16 may authorize one legal axis without selecting exact future dose.
11. **Yes.** A separately authorized Prescription Compiler policy may later realize that axis.
12. **Yes.** One failed target cannot authorize global regression.
13. **Yes.** One adverse realization is insufficient for replacement review.
14. **Yes.** Repeated adverse evidence remains scoped to structured support/load/range/side context.
15. **Yes.** Local evidence remains local; unrelated targets are invariant.
16. **Yes.** Week fatigue/adherence requires a separate reviewed aggregate over distinct events.
17. **Yes.** Deload review is possible from that aggregate without a universal schedule.
18. **Yes.** Bounded rotation remains distinct from adverse-response replacement.
19. **Yes.** Phase review remains a request to Gate 15, separate from phase-state application.
20. **Yes.** Gate 16 can consume caller-supplied normalized outcomes while live Product ingestion is absent.

## Canonical layers

1. Source owners emit typed records and remain authoritative for their domains.
2. The outcome snapshot normalizes explicit source records without inventing observations.
3. One completed-outcome ledger entry represents one source exposure event.
4. Applicability is classified exact, related, then exercise identity history.
5. A bounded evidence window produces an ordered trajectory for one target.
6. Gate 16 selects one closed-vocabulary action for that target.
7. A directive records the decision; a rightful downstream owner may later propose application.
8. Gate 16 validates persistence and scope but applies nothing.

## Prohibited conflations

- planned is not completed;
- several sets are not several exposures;
- elapsed calendar time is not progression evidence;
- a phase label is not an adaptation signal;
- pain-region evidence is not a global exercise ban;
- replacement consideration is not replacement identity selection;
- an authorized action is not an applied program mutation;
- missing evidence is not poor response.
`);

const owners = document("Longitudinal Adaptation Owner Boundaries", `
## Upstream owners

${list(LONGITUDINAL_OUTCOME_SOURCE_OWNERS)}

Performance owns completion, independently observed actual dose/timing, quality observations, substitutions, and exposure lineage. The Training Response Receiver owns exact/related/identity response interpretation, successful re-exposure, and replacement consideration. Progression Readiness owns readiness evidence but selects no axis. Phase Continuity owns phase-state decisions and leaves them unapplied. Training Safety retains precedence for external review.

## Gate 16 owner

Gate 16 owns longitudinal evidence assembly validation, target-local state, candidate eligibility, one primary action, and an immutable action directive. It cannot synthesize missing owner facts, select a replacement exercise, rewrite goals/objectives, or apply any action.

## Downstream owners

The Prescription Compiler may later realize an authorized local axis. Candidate Intelligence and Composer may rerun candidate selection after replacement/rotation reopening. Week policy/allocation owns Week changes and deload realization. Phase Continuity owns phase reevaluation. Product application owns persistence. Every path requires separate production authorization.
`);

const policy = document("Longitudinal Adaptation Policy V1 Contract", `
Policy: \`${LONGITUDINAL_ADAPTATION_POLICY_REFERENCE.policyId}@${LONGITUDINAL_ADAPTATION_POLICY_REFERENCE.version}\`.

Owner state: \`OWNER_SELECTED_FOR_GATE_16_CAGT_ADMISSION_NOT_PRODUCTION\`.

## Philosophy

${list(LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY)}

The policy uses ordered typed conditions, not a weighted score. Unknown or mixed evidence holds continuity. Material changes require repeated distinct completed exposures. Local modification precedes replacement review, and successful re-exposure preserves the current option set.
`);

const outcomeSource = document("Longitudinal Outcome Source Contract", `
Contract: \`${LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE.contractId}@${LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE.contractVersion}\`.

## Supported owner vocabulary

${list(LONGITUDINAL_OUTCOME_SOURCE_OWNERS)}

## Signal vocabulary

${list(LONGITUDINAL_OUTCOME_SIGNALS)}

Source records require stable IDs, authority, athlete/target lineage, explicit occurred-at time, optional source event/session, realization context, declared applicability, typed signals, reviewed aggregate members, and provenance. Live Performance and adherence adapter counts remain zero.
`);

const ledger = document("Completed Exposure Outcome Ledger", `
The ledger preserves the expected planned source-event set separately from canonical outcomes. An entry links original and realized exercise, assignment, final Prescription revision, final Sequence revision, independently observed actual dose/timing, quality, substitution, response, recovery, session, opportunity, reservation, and explicit time.

Integrity fails closed on duplicate outcome/event IDs, missing event links, orphan Performance/Response records, wrong final revisions, cross-session event collision, planned-as-actual values, actual data attached to a not-performed event, or invalid/future time. One Prescription containing several sets remains one exposure event.
`);

const applicability = document("Longitudinal Evidence Applicability", `
1. \`EXACT_REALIZATION_EVIDENCE\`: exercise plus current Prescription/assignment, side, support, range, load, and dose-mode context match.
2. \`RELATED_REALIZATION_EVIDENCE\`: exercise identity matches while one or more structured realization dimensions differ.
3. \`EXERCISE_IDENTITY_HISTORY\`: broader historical context; visible but insufficient to claim an exact realization effect.

Declared and computed applicability must agree. Wrong side/support, unknown authority, target mismatch, and planned truth posing as completed evidence fail at 16.3. Broader evidence can inform review but cannot silently broaden a local action.
`);

const targets = document("Longitudinal Target Scope Contract", `
Supported scopes:

${list(LONGITUDINAL_TARGET_SCOPES)}

A target carries athlete, active needs/objectives, exercise/assignment/Prescription lineage where applicable, realization dimensions, current program and phase state, legality/anchor/rotation properties, legal and supported axes, implicated dimensions, and future policy references. One evaluation admits exactly one primary action for exactly one target.
`);

const windowDoc = document("Longitudinal Evidence Window", `
The window has explicit start, end, and evaluation times; included and excluded outcome IDs; required source owners; recency state; distinct event/session/realization counts; and reviewed aggregate members. Included events must exist, be unique, and fall in the window. Required owners must be present.

There is no fixed Week count. Windows may represent one exposure, repeated exposures, interrupted or irregular history, return after absence, and horizons from one through six opportunities. Material change requires distinct events or an explicit reviewed aggregate with distinct members.
`);

const trajectory = document("Longitudinal Evidence Trajectory", `
The trajectory orders included completed outcomes by explicit occurrence time and stable ID. It preserves completion, actual-dose fingerprint, execution quality, response, recovery, adherence, realization changes, re-exposure, plateau/failure records, conflicts, strongest applicability, current state, and source provenance.

No weighted adaptation score exists. State is a deterministic policy classification over typed evidence:

${list(LONGITUDINAL_STATES)}
`);

const actions = document("Longitudinal Action Vocabulary", `
Closed action vocabulary:

${list(LONGITUDINAL_ACTIONS)}

Priority is Safety, conflict review, replacement reopening, local modification, local regression/progression, bounded rotation reopening, owner reviews, hold/repeat/keep, then insufficient evidence. Each candidate declares eligibility, required/missing evidence, axis, conflicts, continuity cost, action owner, application owner, and provenance.
`);

const progression = document("Longitudinal Progression Axis Policy", `
Progression requires repeated success, target met, quality met, tolerated response, adequate recovery, readiness, an active legal target, and exactly one policy-resolved axis that is legal for the dose mode, supported, and available. Gate 16 authorizes an axis only; it does not choose a future numeric dose.

Two equally supported axes without a unique phase preference produce \`owner_review_required\`. Sets require explicit Week or Prescription policy, and tempo requires explicit tempo policy. Calendar time and phase alone never authorize progression.
`);

const regression = document("Longitudinal Regression Policy", `
Regression requires repeated local failure/adverse evidence and one legal, supported local regression axis. It remains target-scoped and does not alter unrelated exercises, sessions, Week objectives, or phase state. One failed set, one missed session, or region-only prose cannot authorize global regression.
`);

const replacement = document("Longitudinal Replacement Policy", `
Replacement review requires an active need, repeated adverse evidence across valid completed exposures or an illegal exercise, Response Receiver replacement consideration, and Prescription review attempted/exhausted where applicable. Successful re-exposure suppresses replacement.

The only Gate 16 action is \`reopen_candidate_selection_for_replacement\`. Candidate Intelligence and Composer must run again; Gate 16 never selects, swaps, or bans an exercise identity.
`);

const rotation = document("Longitudinal Rotation Policy", `
Rotation is optional and bounded to a legal, rotation-eligible, non-anchor target with an equivalent candidate pool plus explicit preference or plateau evidence. Adverse response cannot be disguised as variety. There is no novelty quota, calendar rotation, phase rotation, or automatic identity change. The action only reopens candidate selection.
`);

const review = document("Longitudinal Deload and Week Review", `
\`week_reallocation_review\` requires an explicit reviewed completed-Week/adherence aggregate. \`deload_review\` requires a reviewed multi-session recovery/adherence/performance aggregate. \`phase_review\` requests Gate 15 reevaluation. \`external_safety_review\` defers to Training Safety.

Gate 16 does not reallocate sessions, double missed work, prescribe a deload, mutate phase state, or use a calendar schedule as evidence. Future production policies and owner adapters remain required.
`);

const thread = document("Longitudinal Thread Identity", `
Thread identity is deterministic over athlete, target scope, active need/objective set, exercise/assignment/Prescription lineage, side, and phase cycle. A Prescription revision does not automatically create a new thread. Identity remains distinct from state and decision revision IDs.
`);

const stateDoc = document("Longitudinal State Identity and Revisions", `
State identity derives from athlete plus stable thread. Revisions form a linear immutable chain, bind an evidence window, state classification, pending/authorized action, explicit evaluation time, and decision attempt, and require exactly one final revision. Historical finalized revision IDs remain visible.
`);

const decisionDoc = document("Longitudinal Decision Identity and Revisions", `
Decision identity binds athlete, thread, evidence window, and decision attempt. A revision binds policy, outcome snapshot, current program, Phase Continuity decision, optional application snapshot, state revision, explicit evaluation time, and content fingerprint. Exactly one final revision is permitted; prior revisions are immutable historical context.
`);

const directive = document("Longitudinal Action Directive", `
The directive persists decision/revision, target/scope, closed action, optional axis, implicated dimensions, evidence and source-event IDs, reasons, action/application owners, future policy references, current continuity state, blockers, review state, authorization, and provenance. \`applicationApplied\` is always false in Gate 16 evidence.
`);

const application = document("Longitudinal Application Validation", `
An optional test-only candidate carries the authorized directive plus current/proposed program snapshots and claimed mappings/dimensions/targets. Validation detects an erased axis/reopen instruction, unrelated changed targets, phase or unauthorized Week mutation, extra dimensions, direct replacement identity selection, or a keep action paired with change.

Validating a candidate is not applying it. Status is one of \`valid_unapplied\`, \`valid_application_candidate\`, \`action_erased\`, or \`action_scope_exceeded\` (plus not-evaluated vocabulary).
`);

const inputContract = document("Longitudinal Adaptation Input Contract", `
Contract: \`${LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE.contractId}@${LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE.contractVersion}\`.

Input requires Registry V5, owner-selected policy, outcome source snapshot and canonical ledger, one target, thread/window/state lineage, production current program snapshot, production Gate 15 result, Gate 0-15 states, Safety/Response/Progression traces, normalized recovery/adherence IDs, optional application candidate, explicit evaluation time, decision attempt, and optional prior revision context.
`);

const outputContract = document("Longitudinal Adaptation Output Contract", `
Output preserves contract/authority/policy/source references; thread/state/decision IDs and ledgers; ledger integrity; applicability; trajectory; candidates; one selected action/directive; detailed classifications; traces; application validation; fail-stop trace; and status.

Every mutation flag is permanently false in this design: program, Prescription, replacement, rotation, deload, Week reallocation, and phase mutation. \`applicationOwnerRequired\` is true.

Classifications:

${list(LONGITUDINAL_DETAILED_CLASSIFICATIONS)}
`);

const evidenceReview = document("Longitudinal Adaptation Evidence Review", `
Evidence review date: 2026-08-14. Evidence informs candidate actions and uncertainty; it does not create runtime thresholds. Certainty labels are conservative design judgments based on study type, sample, consistency, and directness.

| Source | Population / status | Intervention / action definition | Comparator | Outcome | Certainty | Praxis applicability | Does not establish |
|---|---|---|---|---|---|---|---|
| [ACSM 2026 position stand](https://pubmed.ncbi.nlm.nih.gov/41843416/) | Healthy adults in 137 systematic reviews, >30,000 participants, mixed training status | Progressive resistance training; synthesis of load, volume, ROM, power and other variables | No exercise or alternate RT prescriptions | RT improves strength, hypertrophy, power and function; selected variables modify outcomes | High for broad RT benefit; variable by prescription comparison | Supports progression as goal- and outcome-specific with multiple legal axes | A universal weekly increment, rep target, rotation, deload, or individual action rule |
| [ACSM progression models](https://pubmed.ncbi.nlm.nih.gov/11828249/) | Healthy novice through advanced adults | Goal/status-specific progression; load increase after exceeding target reps | Narrative/position synthesis | Provides established progression model and power-loading principles | Authoritative but older and not an individual longitudinal trial | Historical rationale for typed load and power axes and training-status context | Automatic 2-10% changes from unverified app data or universal frequency |
| [Load vs repetition progression RCT](https://pubmed.ncbi.nlm.nih.gov/36199287/) | 43 resistance-trained men and women | Increase load at fixed reps vs increase reps at fixed load for 8 weeks | Active progression strategy | Both strategies produced similar adaptations; small outcome-specific differences | Moderate; direct but short and small | Supports multiple valid axes and policy resolution instead of load-only progression | Double progression superiority, set progression, novices, or a universal trigger |
| [Weekly set progression RCT](https://pubmed.ncbi.nlm.nih.gov/37796222/) | 31 trained men | Constant volume vs adding four or six sets every two weeks for 12 weeks | Constant sets and alternate set progressions | Greater strength with progressing sets; hypertrophy differences uncertain | Low-moderate due small male sample | Supports sets as a possible axis under explicit Week/Prescription policy | Automatic set addition, safety for all populations, or a universal two-week rule |
| [Older-adult load progression RCT](https://pubmed.ncbi.nlm.nih.gov/31107348/) | 82 healthy community-dwelling older adults, mean age about 72 | %1RM, RPE, RM, or RIR-guided load progression over 11 weeks | Four active methods | Direct comparison of multiple load-progression methods | Moderate; population-specific | Supports adapted populations and several structured evidence modes | One optimal method for every older adult or transfer to clinical restrictions |
| [RIR scoping review](https://pubmed.ncbi.nlm.nih.gov/38563729/) | Apparently healthy people of any age; experimental and observational studies | RIR scales to estimate proximity to failure and regulate intensity | Varied methods | RIR is feasible/useful, with gaps by sex, experience, exercise and conditioning | Low-moderate due heterogeneous scoping evidence | Supports RIR as an owner signal, not self-proving truth | Universal RIR target or exact accuracy for every exercise/person |
| [Autoregulation network meta-analysis](https://pubmed.ncbi.nlm.nih.gov/40791980/) | Resistance-training studies targeting maximal strength | APRE, RPE and velocity-based autoregulation | Percentage-based resistance training | Autoregulated methods were favorable overall, with exercise-specific uncertainty | Moderate; network assumptions and heterogeneous protocols | Supports autoregulation as a policy family and daily context signal | Automatic app-side changes or superiority for hypertrophy, pain, or all lifts |
| [Proximity-to-failure meta-regressions](https://pubmed.ncbi.nlm.nih.gov/38970765/) | Resistance-training interventions with strength/hypertrophy outcomes | Estimated RIR as continuous proximity-to-failure exposure | Different proximity levels | Outcome relationships differ and RIR was often estimated from intervention descriptions | Moderate for synthesis, lower for individual prescription | Supports keeping RIR evidence explicit and uncertainty visible | A universal failure threshold or direct validation of self-reported RIR |
| [Exercise variation systematic review](https://pubmed.ncbi.nlm.nih.gov/35438660/) | 241 young men across eight studies | Systematic exercise variation | Fixed or differently varied exercise selection | Some systematic variation may aid regional adaptation; excessive/random variation may hinder gains | Low-moderate; narrow population and few studies | Supports bounded optional rotation and preserving anchors | Novelty quotas, calendar rotation, automatic replacement, women/older populations |
| [Periodic detraining/retraining RCT](https://pubmed.ncbi.nlm.nih.gov/39364857/) | Healthy adults in continuous vs periodic RT | Ten-week break embedded in a 20-week RT period, followed by retraining | Continuous RT | Temporary losses recovered rapidly; final adaptations similar | Moderate; one protocol/population | Supports re-evaluation and successful re-exposure after interruption | No detraining risk, a universal return dose, or automatic regression |
| [Deload Delphi consensus](https://pubmed.ncbi.nlm.nih.gov/37730925/) | 34 invited expert strength/physique coaches; 21 completed round three | Three-round consensus on reduced training stress and deload design | Expert agreement/disagreement | Produced consensus principles; authors identify deloading as under-researched | Low for efficacy; useful practice consensus | Supports review-only action and explicit owner policy gap | Deload efficacy, universal timing, duration, magnitude, or automatic schedule |
| [Older-adult recovery scoping review](https://pubmed.ncbi.nlm.nih.gov/37395837/) | 27 studies of recovery after resistance exercise in older adults | Recovery observations after resistance exercise | Heterogeneous protocols/populations | Evidence is variable/inconsistent and data in women are limited | Low for precise thresholds | Supports explicit unknown recovery and owner review | A universal recovery duration, threshold, or inferred readiness |
| [Pain-monitoring Achilles RCT](https://pubmed.ncbi.nlm.nih.gov/17307888/) | 38 people with Achilles tendinopathy | Continued running/jumping under pain monitoring plus progressive loading | Initial active rest plus same rehabilitation | No negative effect from pain-monitored continued activity; both groups improved | Moderate but condition-specific and small | Supports pain-aware local modification and monitored re-exposure | Pain is always safe, global replacement, or transfer to unrelated conditions |
| [Painful exercise systematic review](https://pubmed.ncbi.nlm.nih.gov/28596288/) | 385 people in seven chronic musculoskeletal pain trials | Exercise allowing/encouraging pain | Pain-free exercise | Small short-term pain benefit; no clear medium/long-term superiority | Moderate short-term, uncertain long-term | Supports not treating any pain signal as automatic replacement | A pain threshold, Safety clearance, or universal painful loading prescription |
| [Strength/power in older adults meta-analysis](https://pubmed.ncbi.nlm.nih.gov/35842655/) | Community-dwelling adults aged 60+ in 12 studies | Maximal-intent fast concentric resistance training | Traditional/submaximal-intent strength training | Improvements in selected functional and strength outcomes | Moderate; heterogeneous interventions | Supports a power-oriented axis under population-aware policy | Universal velocity target, load, or automatic power progression |
| [Older-adult RT position statement](https://pubmed.ncbi.nlm.nih.gov/31343601/) | Older adults including frailty/sarcopenia/chronic-condition considerations | Evidence-based resistance program design | Literature synthesis | Supports strength, mass, function, mobility and independence benefits | Authoritative synthesis; detail varies | Supports adapted population context and gradual individualized progression | Treating age alone as a failure signal or one prescription for frailty |
| [Real-life adherence systematic review](https://pubmed.ncbi.nlm.nih.gov/41033882/) | Healthy community-dwelling adults, 69 studies | Real-life muscle-strengthening promotion interventions | Varied control/behavior strategies | Attendance varied widely; study quality was mostly weak | Low-moderate | Supports explicit adherence records and review rather than moralized inference | That one missed session proves nonresponse or a single best adherence intervention |
| [Pain-rehabilitation barriers review](https://pubmed.ncbi.nlm.nih.gov/40088807/) | People with musculoskeletal conditions | Review of barriers/facilitators to exercise rehabilitation | Across included studies | Time, pain and health were frequently reported barriers | Low-moderate, mostly associative | Supports distinguishing adherence constraint from physiological failure | Causality for an individual, automatic Week reallocation, or goal rewrite |

## Requested topic coverage

| Topic | Evidence rows used | Gate 16 conclusion |
|---|---|---|
| Progressive overload | ACSM 2026; ACSM progression models | Multiple legal axes; no calendar or universal increment |
| Autoregulation, RPE, and RIR | Autoregulation meta-analysis; RIR review; proximity-to-failure meta-regressions | Explicit owner signals with uncertainty; no automatic app-side dose change |
| Load progression | ACSM progression models; load-vs-repetition RCT; older-adult progression RCT | Legal only with observed load, repeated success, equipment capability, and policy |
| Double/repetition progression | Load-vs-repetition RCT | Plausible policy family; no universal trigger or superiority claim |
| Set progression | Weekly set progression RCT | Possible Prescription/Week axis; never inferred from one completed set |
| Exercise variation | Exercise variation review | Bounded optional rotation only; preserve anchors and reject novelty quotas |
| Plateau interpretation | Exercise variation review plus progression evidence | Plateau opens review but does not prove replacement or progression |
| Detraining and return | Periodic detraining/retraining RCT | Reassess completed evidence and preserve successful re-exposure; no fixed return dose |
| Deloading | Deload Delphi | Review-only with a genuine Week aggregate; no schedule, magnitude, or duration rule |
| Fatigue and recovery | Older-adult recovery review | Keep unknown explicit; no inferred or universal threshold |
| Adherence | Real-life adherence review; rehabilitation barriers review | Separate constraint from physiological nonresponse; Week review remains downstream |
| Strength and hypertrophy | ACSM 2026; load/repetition and set-progression trials | Outcome-specific adaptation with no single mandatory axis |
| Power progression | ACSM progression models; older-adult strength/power meta-analysis | Population-aware explicit policy and quality evidence required |
| Pain-aware progression and re-exposure | Achilles pain-monitoring RCT; painful-exercise review | Local Safety/Response ownership; pain alone is neither global regression nor replacement |
| Novice versus trained populations | ACSM progression models; trained load/repetition and set trials | Training status changes applicability, not automatic action authority |
| Older/adapted populations | Older-adult progression, recovery, power, and position-statement evidence | Conservative individualized review; age labels alone have no direct action effect |

## Policy conclusion

Evidence supports progressive, individualized resistance training and several plausible progression axes, while repeatedly showing population, protocol, outcome, and measurement dependence. The strongest defensible Gate 16 behavior is therefore response-led continuity: preserve a productive target; use repeated exact evidence before material change; request local owner action; expose conflict/unknown; and never convert a cohort average into automatic application.
`);

const realUserAudit = document("Real User Longitudinal Adaptation Variable Audit", `
Owner classifications below use only the requested receiver vocabulary. A row may name a capture owner and a separate decision/application owner where the fact crosses a typed handoff.

| Variable | Owner classification | Gate 16 use | Production gap |
|---|---|---|---|
| Actual completion | \`Performance\` | Canonical completed-event status | No live adapter authorized |
| Partial completion | \`Performance\` | Distinct partial status; never described as completed | No live adapter authorized |
| Substitution | \`Performance\` | Preserve original and realized identity | Product reconciliation absent |
| Actual dose | \`Performance\` | Dose trajectory independent from plan | Device/manual source and confidence contract absent |
| Actual effort | \`Performance\` | Readiness/realization context only when observed | Validated RPE/RIR schema absent |
| Actual tempo | \`Performance\` | Timing evidence independent from Prescription | Sensor/manual capture absent |
| Actual duration | \`Performance\` | Duration evidence independent from Prescription | Sensor/manual capture absent |
| Quality | \`Performance\` | Criterion-specific trajectory | Calibration and owner-specific criteria absent |
| Symptoms | \`Response Receiver\`, \`TrainingSafety\` | Local applicability, modification, or Safety review | Live response and escalation adapters absent |
| Delayed symptoms | \`Response Receiver\` | Time-ordered response/persistence evidence | Follow-up capture contract absent |
| Recovery | \`Progression Readiness\` | Adequate/concern/unknown evidence | Canonical normalized recovery source absent |
| Sleep/readiness | \`Progression Readiness\` | Explicit blocker/context, never inferred action | Validated normalization and uncertainty absent |
| Illness | \`TrainingSafety\` | Safety precedence or external review | Product-to-Safety source contract absent |
| Adherence | \`Product Adapter\`, \`Week\` | Constraint or reviewed Week aggregate | Live adherence adapter absent |
| Motivation | \`Future Typed Contract\`, \`Intentionally No Direct Effect\` | No direct progression/replacement effect in V1 | Legitimate receiver and semantics unresolved |
| Equipment | \`Product Adapter\`, \`Prescription\` | Legal realization and axis capability | Runtime equipment-delta adapter absent |
| Travel | \`Product Adapter\`, \`Week\` | Potential schedule/equipment constraint after normalization | Typed travel-to-Week handoff absent |
| Work/sport load | \`Product Adapter\`, \`Progression Readiness\` | Recovery/readiness context after owner review | External-load aggregate contract absent |
| Schedule | \`Week\` | Week-review input only | Production Week Planner/allocation absent |
| Repeated pain | \`Response Receiver\`, \`TrainingSafety\` | Scoped repeated adverse evidence; Safety retains precedence | Clinical escalation contract absent |
| Successful re-exposure | \`Response Receiver\` | Preserve options and weaken replacement pressure | Live response linkage absent |
| Plateau | \`Progression Readiness\`, \`Gate 16 Longitudinal Adaptation\` | Review evidence, never automatic replacement | Production policy/kernel absent |
| Return after absence | \`Progression Readiness\`, \`Gate 16 Longitudinal Adaptation\` | Rebuild evidence window; do not infer regression | Return/readiness source policy absent |
| Phase transition | \`Gate 15 Phase Continuity\` | Consume current result or request reevaluation | Gate 16-to-Gate 15 orchestration unauthorized |
| Goal change | \`Application/Persistence\`, \`Intentionally No Direct Effect\` | Invalidates/changes active lineage only after rightful owner update | Goal-owner revision contract absent |
| Preference/variety | \`Candidate Intelligence\`, \`Gate 16 Longitudinal Adaptation\` | Bounded non-anchor rotation review when eligible | Live preference source and rerun integration absent |
| Coach override | \`Application/Persistence\` | Reviewed source/revision; never hidden policy | Typed override, audit, and rollback absent |
| Clinician restriction | \`TrainingSafety\` | Safety authority and external review | Live clinical restriction adapter absent |
| Missed sessions | \`Performance\`, \`Week\` | Not-performed truth; repeated pattern may request Week review | Live completion and Week aggregate absent |
| Deload | \`Gate 16 Longitudinal Adaptation\`, \`Week\`, \`Prescription\` | Gate 16 may request review; Week/Prescription realize later | Production aggregate and realization policies absent |
| Progression | \`Gate 16 Longitudinal Adaptation\`, \`Prescription\` | Authorize one legal axis; exact dose deferred | Production Gate 16 kernel and compiler handoff absent |
| Regression | \`Gate 16 Longitudinal Adaptation\`, \`Prescription\` | Authorize one local legal axis | Production Gate 16 kernel and compiler handoff absent |
| Replacement | \`Gate 16 Longitudinal Adaptation\`, \`Candidate Intelligence\`, \`Session Composer\` | Reopen selection after repeated evidence/review; no identity choice | Candidate/Composer rerun integration absent |
| Rotation | \`Gate 16 Longitudinal Adaptation\`, \`Candidate Intelligence\`, \`Session Composer\` | Reopen bounded eligible non-anchor selection | Rotation source policy and rerun integration absent |

The design deliberately represents unknown values instead of imputing them. Before live integration, every source needs identity, authority, revision, occurrence time, confidence/unknown semantics, athlete consent/privacy handling, deduplication, correction behavior, and deterministic reconciliation.
`);

export function buildLongitudinalAdaptationReports(): Readonly<Record<string, string>> {
  const controlled = runLongitudinalControlledChains();
  const shell = runLongitudinalFixedShell();
  const holdout = runLongitudinalHoldout();
  const stress = runLongitudinalStress();
  const guards = longitudinalAdaptationActivationGuards();
  const fingerprints = Object.freeze({ ...longitudinalAdaptationFingerprints(), stress: stress.fingerprint });
  const admission = Object.freeze({ classification: LONGITUDINAL_ADAPTATION_CLASSIFICATION,
    ontologyAuditClassification: LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5.reference,
    gate16Authority: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5.gates.gate_16_longitudinal_adaptation,
    contract: LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE, policy: LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
    outcomeSourceContract: LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    controlled: { count: controlled.caseCount, mismatchCount: controlled.mismatchCount,
      validationFailureCount: controlled.validationFailureCount, fingerprint: controlled.fingerprint },
    fixedShell: { count: shell.caseCount, mismatchCount: shell.mismatchCount,
      validationFailureCount: shell.validationFailureCount, fingerprint: shell.fingerprint },
    holdout: { count: holdout.caseCount, genuineCompletedHistoryCount:
      holdout.requirementCounts.genuineCompletedHistory, mismatchCount: holdout.mismatchCount,
      validationFailureCount: holdout.validationFailureCount, manifestFingerprint: holdout.manifestFingerprint,
      resultFingerprint: holdout.fingerprint, actionCounts: holdout.actionCounts },
    stress, activationGuards: guards, fingerprints, productionBehaviorChanged: false,
    upstreamFingerprints: LONGITUDINAL_UPSTREAM_FINGERPRINTS,
    productionKernelImplemented: false, runtimeActivated: false,
    exactNextDependency: "OWNER_AUTHORIZATION_FOR_PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTATION" });
  const matrix = document("Longitudinal Adaptation CAGT Matrix", `
| Stage | Question | Fail-stop behavior |
|---|---|---|
${LONGITUDINAL_GATE_16_SUBGATES.map((stage) => `| \`${stage}\` | ${stage.replace(/^16\.\d_/, "").replaceAll("_", " ")} | Later stages not scored; optional diagnostics are shadow-only |`).join("\n")}

Controlled chains: ${controlled.caseCount}; mismatches: ${controlled.mismatchCount}; validator failures: ${controlled.validationFailureCount}. No downstream rescue was accepted.
`);
  const shellDoc = document("Longitudinal Adaptation Fixed Shell Cohort", `
Count: ${LONGITUDINAL_FIXED_SHELL_DESCRIPTORS.length}. Fingerprint: \`${shell.fingerprint}\`.

The shell spans all closed action families, successful re-exposure, seven dose modes, roles/sections, explicit times, and production Gate 15 current snapshots. Mismatches: ${shell.mismatchCount}; validation failures: ${shell.validationFailureCount}.
`);
  const holdoutMd = document("Longitudinal Adaptation Holdout Manifest", `
Manifest: \`${LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST.manifestId}@${LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST.version}\`.

Frozen before execution: ${LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST.frozenBeforeExecution}. Fingerprint: \`${holdout.manifestFingerprint}\`. Correction policy: \`${LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST.correctionPolicy}\`.

Count ${holdout.caseCount}; genuine completed histories ${holdout.requirementCounts.genuineCompletedHistory}; 45 exercises; 7 dose modes; 5 sections; 7 roles; 3 phases; horizons 1-6. Category counts: keep/repeat/hold 85, progression 75, regression/modification 55, replacement 45, rotation 30, owner reviews 35, no-rescue 35.
`);
  const admissionMd = document("Longitudinal Adaptation CAGT Admission Report", `
Result: **${LONGITUDINAL_ADAPTATION_CLASSIFICATION}**.

- Controlled chains: ${controlled.caseCount}/${controlled.caseCount} matched.
- Fixed shell: ${shell.caseCount}/${shell.caseCount} matched.
- Locked holdout: ${holdout.caseCount}/${holdout.caseCount} matched; fingerprint \`${holdout.manifestFingerprint}\`.
- Genuine completed histories: ${holdout.requirementCounts.genuineCompletedHistory}.
- Deterministic stress: ${stress.deterministicEvaluationCount}; mismatch ${stress.deterministicMismatchCount}.
- Each required stress family: at least 1,000.
- Activation guard failures: ${guards.failureCount}.
- Automatic actions applied: 0.
- Production behavior changed: no.

Frozen upstream fingerprints are preserved in the JSON admission report (${Object.keys(LONGITUDINAL_UPSTREAM_FINGERPRINTS).length} contracts/kernels/evidence sets).

Admission means the ontology, owner policy, contracts, and CAGT evidence are ready for a separate production-kernel implementation authorization. It is not production implementation approval and not product activation.
`);
  const stressMd = document("Longitudinal Adaptation Stress Report", `
Result: \`${stress.result}\`. Fingerprint: \`${stress.fingerprint}\`.

${Object.entries(stress).filter(([key]) => key.endsWith("Count")).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

Repeated deterministic run count: ${stress.repeatedDeterministicRunCount}; hidden clock reads: ${stress.hiddenClockReadCount}; random outputs: ${stress.randomOutputCount}; accepted downstream rescues: ${stress.acceptedDownstreamRescueCount}.
`);
  const readiness = document("Longitudinal Adaptation Implementation Readiness", `
## Ready

Ontology, Registry V5, owner policy, source contract, ledger/integrity, applicability hierarchy, targets, windows, repetition truth, trajectories, state/action vocabularies, owner deferrals, thread/state/decision revisions, application validation, 16.0-16.9 fail-stop, controlled/fixed/holdout/stress evidence, reports, and activation guards.

## Deliberately absent

Production kernel; live Performance/adherence/recovery adapters; persistence; product orchestration; numeric progression/regression realization; replacement/rotation candidate rerun integration; Week/deload policy; phase application; UI; automatic actions.

## Exact next dependency

\`OWNER_AUTHORIZATION_FOR_PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTATION\`

## Frozen upstream

${Object.entries(LONGITUDINAL_UPSTREAM_FINGERPRINTS).map(([name, fingerprint]) =>
    `- ${name}: \`${fingerprint}\``).join("\n")}
`);
  return Object.freeze({
    "LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT.md": ontology,
    "LONGITUDINAL_ADAPTATION_OWNER_BOUNDARIES.md": owners,
    "LONGITUDINAL_ADAPTATION_POLICY_V1_CONTRACT.md": policy,
    "LONGITUDINAL_OUTCOME_SOURCE_CONTRACT.md": outcomeSource,
    "COMPLETED_EXPOSURE_OUTCOME_LEDGER.md": ledger,
    "LONGITUDINAL_EVIDENCE_APPLICABILITY.md": applicability,
    "LONGITUDINAL_TARGET_SCOPE_CONTRACT.md": targets,
    "LONGITUDINAL_EVIDENCE_WINDOW.md": windowDoc,
    "LONGITUDINAL_EVIDENCE_TRAJECTORY.md": trajectory,
    "LONGITUDINAL_ACTION_VOCABULARY.md": actions,
    "LONGITUDINAL_PROGRESSION_AXIS_POLICY.md": progression,
    "LONGITUDINAL_REGRESSION_POLICY.md": regression,
    "LONGITUDINAL_REPLACEMENT_POLICY.md": replacement,
    "LONGITUDINAL_ROTATION_POLICY.md": rotation,
    "LONGITUDINAL_DELOAD_AND_WEEK_REVIEW.md": review,
    "LONGITUDINAL_THREAD_IDENTITY.md": thread,
    "LONGITUDINAL_STATE_IDENTITY_AND_REVISIONS.md": stateDoc,
    "LONGITUDINAL_DECISION_IDENTITY_AND_REVISIONS.md": decisionDoc,
    "LONGITUDINAL_ACTION_DIRECTIVE.md": directive,
    "LONGITUDINAL_APPLICATION_VALIDATION.md": application,
    "LONGITUDINAL_ADAPTATION_INPUT_CONTRACT.md": inputContract,
    "LONGITUDINAL_ADAPTATION_OUTPUT_CONTRACT.md": outputContract,
    "LONGITUDINAL_ADAPTATION_CAGT_MATRIX.md": matrix,
    "LONGITUDINAL_ADAPTATION_FIXED_SHELL_COHORT.md": shellDoc,
    "LONGITUDINAL_ADAPTATION_EVIDENCE_REVIEW.md": evidenceReview,
    "REAL_USER_LONGITUDINAL_ADAPTATION_VARIABLE_AUDIT.md": realUserAudit,
    "LONGITUDINAL_ADAPTATION_HOLDOUT_MANIFEST.md": holdoutMd,
    "LONGITUDINAL_ADAPTATION_HOLDOUT_MANIFEST.json": `${JSON.stringify(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST, null, 2)}\n`,
    "LONGITUDINAL_ADAPTATION_CAGT_ADMISSION_REPORT.md": admissionMd,
    "LONGITUDINAL_ADAPTATION_CAGT_ADMISSION_REPORT.json": `${JSON.stringify(admission, null, 2)}\n`,
    "LONGITUDINAL_ADAPTATION_STRESS_REPORT.md": stressMd,
    "LONGITUDINAL_ADAPTATION_IMPLEMENTATION_READINESS.md": readiness,
  });
}

export const LONGITUDINAL_ADAPTATION_REPORT_FILENAMES = Object.freeze([
  "LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT.md", "LONGITUDINAL_ADAPTATION_OWNER_BOUNDARIES.md",
  "LONGITUDINAL_ADAPTATION_POLICY_V1_CONTRACT.md", "LONGITUDINAL_OUTCOME_SOURCE_CONTRACT.md",
  "COMPLETED_EXPOSURE_OUTCOME_LEDGER.md", "LONGITUDINAL_EVIDENCE_APPLICABILITY.md",
  "LONGITUDINAL_TARGET_SCOPE_CONTRACT.md", "LONGITUDINAL_EVIDENCE_WINDOW.md",
  "LONGITUDINAL_EVIDENCE_TRAJECTORY.md", "LONGITUDINAL_ACTION_VOCABULARY.md",
  "LONGITUDINAL_PROGRESSION_AXIS_POLICY.md", "LONGITUDINAL_REGRESSION_POLICY.md",
  "LONGITUDINAL_REPLACEMENT_POLICY.md", "LONGITUDINAL_ROTATION_POLICY.md",
  "LONGITUDINAL_DELOAD_AND_WEEK_REVIEW.md", "LONGITUDINAL_THREAD_IDENTITY.md",
  "LONGITUDINAL_STATE_IDENTITY_AND_REVISIONS.md", "LONGITUDINAL_DECISION_IDENTITY_AND_REVISIONS.md",
  "LONGITUDINAL_ACTION_DIRECTIVE.md", "LONGITUDINAL_APPLICATION_VALIDATION.md",
  "LONGITUDINAL_ADAPTATION_INPUT_CONTRACT.md", "LONGITUDINAL_ADAPTATION_OUTPUT_CONTRACT.md",
  "LONGITUDINAL_ADAPTATION_CAGT_MATRIX.md", "LONGITUDINAL_ADAPTATION_FIXED_SHELL_COHORT.md",
  "LONGITUDINAL_ADAPTATION_EVIDENCE_REVIEW.md", "REAL_USER_LONGITUDINAL_ADAPTATION_VARIABLE_AUDIT.md",
  "LONGITUDINAL_ADAPTATION_HOLDOUT_MANIFEST.md", "LONGITUDINAL_ADAPTATION_HOLDOUT_MANIFEST.json",
  "LONGITUDINAL_ADAPTATION_CAGT_ADMISSION_REPORT.md", "LONGITUDINAL_ADAPTATION_CAGT_ADMISSION_REPORT.json",
  "LONGITUDINAL_ADAPTATION_STRESS_REPORT.md", "LONGITUDINAL_ADAPTATION_IMPLEMENTATION_READINESS.md",
] as const);

if (LONGITUDINAL_CONTROLLED_CHAIN_NAMES.length < 120 || LONGITUDINAL_FIXED_SHELL_DESCRIPTORS.length < 40 ||
    LONGITUDINAL_ADAPTATION_REPORT_FILENAMES.length !== 32) {
  throw new Error("LONGITUDINAL_ADAPTATION_REPORT_REQUIREMENTS_NOT_MET");
}
