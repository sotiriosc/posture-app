import { createHash } from "node:crypto";
import {
  BODYWEIGHT_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  NO_TRAINING_SAFETY_SIGNALS,
  buildTrainingReadinessTrace,
  type EquipmentCapabilities,
  type TrainingOutcomeGoal,
} from "../../src";
import type {
  ReviewedWeeklyPolicyRule,
  ReviewedWeeklyProgrammingPolicy,
  WeekFactProvenance,
  WeekPlanningHorizon,
  WeeklyPolicyRuleScope,
} from "../../src/weekComposer/designContracts";
import type {
  CurrentSessionContextAdapterResult,
  CurrentSessionContextInput,
  ProductAdapterScenarioResult,
  ProductHorizonSourceResolutionTrace,
  ProductHorizonUnresolvedContext,
  ProductOpportunitySourceFact,
  ProductProfileWeekDefaults,
  ProductWeekConfirmationState,
  ProductWeekHorizonAdapterResult,
  ProductWeekHorizonSourceInput,
  ProductWeekSourceProvenance,
  ProductWeekSourceType,
  StableOpportunityIdentityDecision,
  VersionedEquipmentCapabilityRecord,
} from "../../src/weekComposer/productAdapterDesignContracts";
import {
  NON_PRODUCTION_WEEKLY_POLICY,
  runWeeklyPolicyConsequenceLab,
} from "./weekComposerDesignLab";

export const POLICY_HORIZON_AS_OF = "2026-08-12T20:00:00-04:00";
export const POLICY_HORIZON_SEED = 0x086711;

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonical(entry)]));
  }
  return value;
}

export const OWNER_WEEK_POLICY_DECISIONS = Object.freeze({
  sourceType: "owner_decision",
  reviewerId: "sotiriosc",
  reviewedAt: "2026-08-12T00:00:00-04:00",
  sourceRef: "WEEK_POLICY_AND_HORIZON_OWNER_DECISIONS:owner-week-semantics-v1",
  allocationOpportunity: "responsibility_only_no_dose_credit",
  frequencyAuthority: "explicit_authority_required",
  frequencyBand: ["minimum", "target", "soft_maximum_review"] as const,
  directDevelopment: "primary_required_or_exact_action",
  secondaryDevelopment: "explicit_general_objective_only_no_numeric_credit",
  assessmentRecurrence: "one_objective_per_coherent_cluster_additional_frequency_requires_authority",
  softCeiling: "review_state_unique_marginal_value",
  recoverySpacing: "typed_basis_no_universal_hours",
  phase: "applicability_without_multiplier",
  deload: "longitudinal_owner_no_calendar_default",
  standaloneRecoverySession: "KEEP_DEFERRED",
  search: "exhaustive_oracle_pareto_lexicographic_bounds_unapproved",
});

export type EvidenceClassification =
  | "SUPPORTED_FOR_PRODUCTION_REVIEW"
  | "SUPPORTED_ONLY_AS_BROAD_PRIOR"
  | "POPULATION_SPECIFIC"
  | "PRESCRIPTION_DEPENDENT"
  | "LONGITUDINAL_RESPONSE_DEPENDENT"
  | "INSUFFICIENT_FOR_NUMERIC_POLICY"
  | "CONFLICTING_EVIDENCE"
  | "EXTERNAL_REFERENCE_PENDING";

export interface WeeklyEvidenceInventoryRow {
  readonly id: string;
  readonly publicationDate: string;
  readonly citation: string;
  readonly url: string;
  readonly population: string;
  readonly trainingStatus: string;
  readonly goal: string;
  readonly outcome: string;
  readonly doseDefinition: string;
  readonly volumeEquated: "yes" | "no" | "mixed_or_not_applicable";
  readonly effectCertainty: string;
  readonly praxisApplicability: string;
  readonly doesNotEstablish: readonly string[];
  readonly classification: EvidenceClassification;
}

export const WEEKLY_EVIDENCE_INVENTORY: readonly WeeklyEvidenceInventoryRow[] = [
  {
    id: "acsm-2026-overview", publicationDate: "2026-03-05",
    citation: "Currier et al. ACSM Position Stand, PMID 41843416",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/",
    population: "healthy adults age 18+, reviews of trials lasting at least six weeks",
    trainingStatus: "mixed", goal: "strength, hypertrophy, power and physical performance",
    outcome: "RT improves outcomes; selected prescription variables can enhance specific adaptations",
    doseDefinition: "frequency as RT days/week; volume as sets/exercise or sets/week depending on source review",
    volumeEquated: "mixed_or_not_applicable", effectCertainty: "overview of 137 systematic reviews; source-specific certainty varies",
    praxisApplicability: "authoritative broad prior and owner-review input",
    doesNotEstablish: ["per-objective opportunity frequency", "a split", "a universal per-person set target", "pain-aware policy"],
    classification: "SUPPORTED_ONLY_AS_BROAD_PRIOR",
  },
  {
    id: "currier-2023-network", publicationDate: "2023-07-06",
    citation: "Currier et al. Bayesian network meta-analysis, PMID 37414459",
    url: "https://pubmed.ncbi.nlm.nih.gov/37414459/",
    population: "healthy adults; 178 strength and 119 hypertrophy studies",
    trainingStatus: "mixed", goal: "strength and hypertrophy", outcome: "all tested RT prescriptions outperformed no exercise",
    doseDefinition: "load, single/multiple sets and one/two/three-plus days per week",
    volumeEquated: "mixed_or_not_applicable", effectCertainty: "network estimates robust to threshold analysis",
    praxisApplicability: "candidate Prescription and broad participation review",
    doesNotEstablish: ["one best rule for every objective", "allocation equals completed dose"],
    classification: "PRESCRIPTION_DEPENDENT",
  },
  {
    id: "pelland-2026-dose-response", publicationDate: "2025-12-04",
    citation: "Pelland et al. dose-response meta-regressions, PMID 41343037",
    url: "https://pubmed.ncbi.nlm.nih.gov/41343037/",
    population: "67 studies, 2058 participants, mostly young men",
    trainingStatus: "adjusted for training status", goal: "strength and hypertrophy",
    outcome: "volume showed diminishing-return relationships; frequency was clearer for strength than hypertrophy",
    doseDefinition: "weekly direct and modeled indirect sets plus weekly frequency",
    volumeEquated: "mixed_or_not_applicable", effectCertainty: "model-dependent observational meta-regression of interventions",
    praxisApplicability: "owner-ready evidence that source exposure and relationship matter",
    doesNotEstablish: ["Praxis fractional set coefficients", "allocation credit", "individual targets"],
    classification: "PRESCRIPTION_DEPENDENT",
  },
  {
    id: "schoenfeld-2019-frequency", publicationDate: "2018-12-17",
    citation: "Schoenfeld et al. hypertrophy frequency meta-analysis, PMID 30558493",
    url: "https://pubmed.ncbi.nlm.nih.gov/30558493/",
    population: "healthy human resistance-training studies", trainingStatus: "mixed including trained subgroup",
    goal: "hypertrophy", outcome: "no meaningful frequency difference when volume was equated",
    doseDefinition: "muscle-group training days/week", volumeEquated: "yes",
    effectCertainty: "strong conclusion within available volume-equated evidence",
    praxisApplicability: "supports distribution flexibility after Prescription dose is known",
    doesNotEstablish: ["frequency is irrelevant to feasibility", "one session is always enough", "dose targets"],
    classification: "SUPPORTED_FOR_PRODUCTION_REVIEW",
  },
  {
    id: "grgic-2018-strength-frequency", publicationDate: "2018-02-22",
    citation: "Grgic et al. strength frequency meta-analysis, PMID 29470825",
    url: "https://pubmed.ncbi.nlm.nih.gov/29470825/",
    population: "22 studies, mostly untrained participants", trainingStatus: "mostly untrained",
    goal: "maximal strength", outcome: "higher frequency association disappeared in volume-equated subgroup",
    doseDefinition: "training frequency and volume", volumeEquated: "yes",
    effectCertainty: "moderate study quality; limited trained evidence",
    praxisApplicability: "broad strength-practice candidate requiring scope review",
    doesNotEstablish: ["universal strength frequency", "frequency independent of volume"],
    classification: "CONFLICTING_EVIDENCE",
  },
  {
    id: "schoenfeld-2017-volume", publicationDate: "2016-07-19",
    citation: "Schoenfeld et al. weekly volume meta-analysis, PMID 27433992",
    url: "https://pubmed.ncbi.nlm.nih.gov/27433992/",
    population: "15 hypertrophy studies", trainingStatus: "mixed", goal: "muscle hypertrophy",
    outcome: "graded association between weekly sets and hypertrophy with uncertainty around categories",
    doseDefinition: "weekly sets per muscle", volumeEquated: "no",
    effectCertainty: "meta-regression; 34 treatment groups",
    praxisApplicability: "Prescription evidence candidate only",
    doesNotEstablish: ["ten opportunities", "ten direct sets for everyone", "allocation frequency"],
    classification: "PRESCRIPTION_DEPENDENT",
  },
  {
    id: "borde-2015-older", publicationDate: "2015-09-29",
    citation: "Borde et al. healthy older adult dose-response review, PMID 26420238",
    url: "https://pubmed.ncbi.nlm.nih.gov/26420238/",
    population: "healthy adults with mean age 65+", trainingStatus: "mixed/typically not advanced",
    goal: "strength and morphology", outcome: "RT improved strength; morphology evidence was smaller and sparse",
    doseDefinition: "frequency, intensity, sets, repetitions and duration",
    volumeEquated: "no", effectCertainty: "25 RCTs; independent-variable estimates are not causal optima",
    praxisApplicability: "population-specific prior requiring older-adult scope",
    doesNotEstablish: ["policy for younger users", "per-objective frequency", "clinical safety eligibility"],
    classification: "POPULATION_SPECIFIC",
  },
  {
    id: "barbalho-2018-direct-indirect", publicationDate: "2018-11-02",
    citation: "Barbalho et al. multi-joint plus single-joint trial, PMID 30662699",
    url: "https://pubmed.ncbi.nlm.nih.gov/30662699/",
    population: "20 untrained young men", trainingStatus: "untrained", goal: "strength and arm anthropometry",
    outcome: "adding single-joint work did not improve measured strength but increased arm circumference more",
    doseDefinition: "multi-joint program with or without added single-joint exercises",
    volumeEquated: "no", effectCertainty: "small eight-week single trial",
    praxisApplicability: "limited evidence that direct and indirect contribution cannot be assumed equivalent",
    doesNotEstablish: ["fractional credit", "all-muscle rules", "trained or clinical population effects"],
    classification: "INSUFFICIENT_FOR_NUMERIC_POLICY",
  },
  {
    id: "who-2020-participation", publicationDate: "2020-11-25",
    citation: "WHO Guidelines on Physical Activity and Sedentary Behaviour",
    url: "https://www.who.int/publications/i/item/9789240015128",
    population: "adults and older adults", trainingStatus: "general population", goal: "health",
    outcome: "muscle-strengthening activity involving major muscle groups on two or more days is recommended",
    doseDefinition: "participation days, not objective allocation or set dose", volumeEquated: "mixed_or_not_applicable",
    effectCertainty: "authoritative public-health guideline",
    praxisApplicability: "broad participation prior only",
    doesNotEstablish: ["every muscle twice weekly", "a split", "individual Prescription dose"],
    classification: "SUPPORTED_ONLY_AS_BROAD_PRIOR",
  },
];

export interface PolicyCandidateRow {
  readonly id: string;
  readonly candidateRule: string;
  readonly scope: string;
  readonly evidenceRefs: readonly string[];
  readonly consequences: readonly string[];
  readonly failureModes: readonly string[];
  readonly prescriptionDependency: string;
  readonly affects: "allocation" | "dose" | "allocation_and_later_dose";
  readonly sessionBloatRisk: "low" | "moderate" | "high";
  readonly templateConvergenceRisk: "low" | "moderate" | "high";
  readonly classification: EvidenceClassification;
  readonly productionState: "NOT_SELECTED_FOR_PRODUCTION";
}

export const WEEKLY_POLICY_CANDIDATES: readonly PolicyCandidateRow[] = [
  ["participation", "Treat broad weekly resistance participation guidance as a horizon-level prior, not objective frequency.", "healthy adults/general health", ["acsm-2026-overview", "who-2020-participation"], "allocation"],
  ["strength-practice", "Review repeated major-strength practice as a goal-specific candidate after dose and skill scope are declared.", "healthy adults/strength", ["acsm-2026-overview", "grgic-2018-strength-frequency"], "allocation_and_later_dose"],
  ["muscle-distribution", "Permit flexible muscle opportunity distribution when prescribed volume is equated.", "healthy adults/hypertrophy", ["schoenfeld-2019-frequency"], "allocation_and_later_dose"],
  ["direct-accessory", "Require direct truth for direct objectives and leave indirect credit to Prescription review.", "explicit direct muscle/action objectives", ["pelland-2026-dose-response", "barbalho-2018-direct-indirect"], "allocation_and_later_dose"],
  ["assessment", "Limit one coherent assessment cluster to one weekly objective unless explicit policy adds recurrence.", "reviewed assessment priorities", [], "allocation"],
  ["spacing", "Select typed spacing basis by objective and known prescribed burden; retain unknown otherwise.", "objective-specific", ["acsm-2026-overview"], "allocation"],
  ["soft-ceiling", "Treat above-ceiling occurrence as review requiring unique marginal value.", "all approved frequency bands", [], "allocation"],
  ["constrained-week", "Protect required responsibility before preferred and optional without doubling.", "constrained horizons", [], "allocation"],
  ["phase-applicability", "Allow an explicitly scoped phase rule without numeric phase multipliers.", "phase-scoped reviewed policy", [], "allocation"],
].map(([id, candidateRule, scope, evidenceRefs, affects]) => ({
  id: id as string,
  candidateRule: candidateRule as string,
  scope: scope as string,
  evidenceRefs: evidenceRefs as readonly string[],
  consequences: ["owner can review scope without activating a value"],
  failureModes: ["overreading broad evidence", "confusing allocation with dose"],
  prescriptionDependency: affects === "allocation" ? "none for semantics; numeric rules remain unapproved" : "source exposure and dose required",
  affects: affects as PolicyCandidateRow["affects"],
  sessionBloatRisk: id === "direct-accessory" || id === "assessment" ? "high" : "moderate",
  templateConvergenceRisk: id === "participation" || id === "phase-applicability" ? "high" : "moderate",
  classification: evidenceRefs.length === 0 ? "INSUFFICIENT_FOR_NUMERIC_POLICY" :
    (affects === "allocation" ? "SUPPORTED_ONLY_AS_BROAD_PRIOR" : "PRESCRIPTION_DEPENDENT"),
  productionState: "NOT_SELECTED_FOR_PRODUCTION" as const,
}));

const EMPTY_SCOPE: WeeklyPolicyRuleScope = {
  outcomeGoals: [], secondaryGoals: [], experienceLevels: [], phaseIds: [], contextModes: [], objectivePurposes: [],
  targetTypes: [], populations: [], horizonCapacity: [],
};

export function frequencyPolicyRule(input: {
  readonly id: string;
  readonly candidateRef: string;
  readonly goals?: readonly TrainingOutcomeGoal[];
  readonly overridesRuleIds?: readonly string[];
}): ReviewedWeeklyPolicyRule {
  return {
    id: input.id, kind: "objective_frequency_intent", candidateRef: input.candidateRef,
    executableState: "value_not_approved", evidenceRefs: [], overridesRuleIds: input.overridesRuleIds ?? [],
    scope: { ...EMPTY_SCOPE, outcomeGoals: input.goals ?? [] },
  };
}

function scopeSpecificity(scope: WeeklyPolicyRuleScope): number {
  return Object.values(scope).filter((entry) => entry.length > 0).length;
}

export function resolveWeeklyPolicyRules(
  rules: readonly ReviewedWeeklyPolicyRule[],
  kind: ReviewedWeeklyPolicyRule["kind"],
): { readonly status: "policy_rule_resolved"; readonly rule: ReviewedWeeklyPolicyRule } |
  { readonly status: "WEEKLY_POLICY_REQUIRED" | "WEEKLY_POLICY_CONFLICT"; readonly rule: null } {
  const candidates = rules.filter((entry) => entry.kind === kind)
    .sort((left, right) => scopeSpecificity(right.scope) - scopeSpecificity(left.scope) || left.id.localeCompare(right.id));
  if (candidates.length === 0) return { status: "WEEKLY_POLICY_REQUIRED", rule: null };
  const bestSpecificity = scopeSpecificity(candidates[0].scope);
  const best = candidates.filter((entry) => scopeSpecificity(entry.scope) === bestSpecificity);
  if (best.length === 1) return { status: "policy_rule_resolved", rule: best[0] };
  const explicitWinner = best.find((entry) => best.every((other) => other.id === entry.id || entry.overridesRuleIds.includes(other.id)));
  if (explicitWinner) return { status: "policy_rule_resolved", rule: explicitWinner };
  const semantic = unique(best.map((entry) => digest({ ...entry, id: undefined, evidenceRefs: [], overridesRuleIds: [] })));
  return semantic.length === 1 ? { status: "policy_rule_resolved", rule: best[0] } :
    { status: "WEEKLY_POLICY_CONFLICT", rule: null };
}

export const CAPACITY_CONDITIONING_AUDIT = Object.freeze({
  loadedCarryBracingWorkCapacity: "CURRENTLY_SUPPORTED",
  localMuscularCapacity: "PARTIALLY_SUPPORTED",
  systemicCardiorespiratoryConditioning: "PRESCRIPTION_CONTRACT_REQUIRED",
  intervalAndCardioModalitiesOutsideCatalog: "CATALOG_OR_MODALITY_REQUIRED",
  carryAsAllConditioning: "CURRENTLY_UNSUPPORTED",
});

export const FULL_GYM_RECORD: VersionedEquipmentCapabilityRecord = {
  equipmentRef: "equipment:full-gym", version: "1", capabilities: FULL_GYM_EQUIPMENT,
  sourceRef: "equipment-registry:full-gym:v1", reviewedAt: POLICY_HORIZON_AS_OF,
};

export const HOME_RECORD: VersionedEquipmentCapabilityRecord = {
  equipmentRef: "equipment:home", version: "1", capabilities: BODYWEIGHT_EQUIPMENT,
  sourceRef: "equipment-registry:home:v1", reviewedAt: POLICY_HORIZON_AS_OF,
};

export function sourceProvenance(input: {
  readonly id: string;
  readonly type?: ProductWeekSourceType;
  readonly confirmation?: ProductWeekConfirmationState;
  readonly truthState?: ProductWeekSourceProvenance["truthState"];
  readonly basedOnRevisionId?: string;
}): ProductWeekSourceProvenance {
  return {
    sourceId: input.id,
    sourceType: input.type ?? "explicit_user_confirmation",
    recordedAt: POLICY_HORIZON_AS_OF,
    confirmationState: input.confirmation ?? "user_confirmed",
    truthState: input.truthState ?? "expected_future_fact",
    updateRef: `${input.id}:update`,
    ...(input.basedOnRevisionId ? { basedOnRevisionId: input.basedOnRevisionId } : {}),
  };
}

export function opportunityFact(input: {
  readonly key: string;
  readonly sourceId?: string;
  readonly sourceType?: ProductWeekSourceType;
  readonly confirmation?: ProductWeekConfirmationState;
  readonly status?: ProductOpportunitySourceFact["availabilityStatus"];
  readonly completion?: ProductOpportunitySourceFact["completionStatus"];
  readonly minutes?: number | null;
  readonly capacity?: ProductOpportunitySourceFact["structuralCapacity"];
  readonly equipmentRef?: string;
  readonly equipment?: EquipmentCapabilities;
  readonly locationRef?: string;
  readonly order?: number;
  readonly startAt?: string;
  readonly endAt?: string;
  readonly timezone?: string;
}): ProductOpportunitySourceFact {
  const confirmation = input.confirmation ?? "user_confirmed";
  return {
    opportunityKey: input.key,
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.startAt && input.endAt ? { timeWindow: {
      startAt: input.startAt, endAt: input.endAt, timezone: input.timezone ?? "America/Toronto",
      sourceRef: `${input.sourceId ?? input.key}:window`, confirmationState: confirmation,
    } } : {}),
    availabilityStatus: input.status ?? "available",
    completionStatus: input.completion ?? "not_started",
    availableMinutes: input.minutes === undefined ? 50 : input.minutes,
    structuralCapacity: input.capacity ?? "standard",
    ...(input.locationRef ? { locationRef: input.locationRef } : {}),
    equipment: input.equipment ? { kind: "capability_snapshot", capabilities: input.equipment,
      sourceRef: `${input.sourceId ?? input.key}:equipment` } : input.equipmentRef === "unknown"
      ? { kind: "unknown", sourceRef: `${input.sourceId ?? input.key}:equipment-unknown` }
      : { kind: "equipment_reference", equipmentRef: input.equipmentRef ?? "equipment:full-gym",
        sourceRef: `${input.sourceId ?? input.key}:equipment-ref` },
    provenance: sourceProvenance({ id: input.sourceId ?? `${input.key}:source`, type: input.sourceType, confirmation }),
  };
}

export function profileDefaults(input: Partial<ProductProfileWeekDefaults> = {}): ProductProfileWeekDefaults {
  return {
    daysPerWeek: input.daysPerWeek ?? 4,
    typicalMinutes: input.typicalMinutes === undefined ? 45 : input.typicalMinutes,
    preferredDayRefs: input.preferredDayRefs ?? ["profile-day-1", "profile-day-2", "profile-day-3", "profile-day-4"],
    equipmentRef: input.equipmentRef ?? "equipment:full-gym",
    provenance: input.provenance ?? sourceProvenance({ id: "profile-default", type: "profile_default",
      confirmation: "suggested_training_opportunity" }),
  };
}

export function horizonSourceInput(input: Partial<ProductWeekHorizonSourceInput> & {
  readonly opportunityFacts?: readonly ProductOpportunitySourceFact[];
} = {}): ProductWeekHorizonSourceInput {
  return {
    athleteId: input.athleteId ?? "athlete:policy-horizon",
    horizonId: input.horizonId ?? "product-horizon:week-1",
    revisionId: input.revisionId ?? "revision:1",
    ...(input.basedOnRevisionId ? { basedOnRevisionId: input.basedOnRevisionId } : {}),
    createdAt: input.createdAt ?? POLICY_HORIZON_AS_OF,
    evaluationAsOf: input.evaluationAsOf ?? POLICY_HORIZON_AS_OF,
    timezone: input.timezone ?? "America/Toronto",
    opportunityFacts: input.opportunityFacts ?? [opportunityFact({ key: "monday" }), opportunityFact({ key: "thursday", order: 1 })],
    ...(input.profileDefaults ? { profileDefaults: input.profileDefaults } : {}),
    equipmentRecords: input.equipmentRecords ?? [FULL_GYM_RECORD, HOME_RECORD],
    ...(input.previousHorizon ? { previousHorizon: input.previousHorizon } : {}),
    unresolvedContext: input.unresolvedContext ?? [],
    trainingSafety: input.trainingSafety ?? NO_TRAINING_SAFETY_SIGNALS,
  };
}

const SOURCE_PRECEDENCE: Readonly<Record<ProductWeekSourceType, number>> = {
  explicit_user_confirmation: 0,
  explicit_coach_confirmation: 1,
  explicit_equipment_override: 1,
  explicit_training_location: 1,
  explicit_travel_plan: 1,
  current_product_schedule: 2,
  connected_calendar_window: 3,
  session_completion_state: 0,
  prior_horizon_revision: 4,
  profile_default: 5,
};

function factualSignature(fact: ProductOpportunitySourceFact): string {
  return JSON.stringify(canonical({
    status: fact.availabilityStatus, completion: fact.completionStatus, minutes: fact.availableMinutes,
    capacity: fact.structuralCapacity, window: fact.timeWindow, location: fact.locationRef, equipment: fact.equipment,
  }));
}

function profileFacts(defaults: ProductProfileWeekDefaults): readonly ProductOpportunitySourceFact[] {
  return Array.from({ length: defaults.daysPerWeek }, (_, index) => opportunityFact({
    key: defaults.preferredDayRefs[index] ?? `profile-order-${index + 1}`,
    sourceId: `${defaults.provenance.sourceId}:${index + 1}`,
    sourceType: "profile_default",
    confirmation: "suggested_training_opportunity",
    status: "tentative",
    minutes: defaults.typicalMinutes,
    equipmentRef: defaults.equipmentRef ?? "unknown",
    order: index,
  }));
}

function identityToken(fact: ProductOpportunitySourceFact): unknown {
  return fact.timeWindow ? [fact.timeWindow.startAt, fact.timeWindow.endAt, fact.timeWindow.timezone] : [fact.opportunityKey];
}

function opportunityId(horizonId: string, fact: ProductOpportunitySourceFact): string {
  return `opportunity:${digest([horizonId, fact.opportunityKey, identityToken(fact)]).slice(0, 16)}`;
}

function weekProvenance(fact: ProductOpportunitySourceFact): WeekFactProvenance {
  return {
    sourceType: fact.provenance.sourceType === "profile_default" ? "product_adapter" : "athlete_explicit_input",
    sourceRef: fact.provenance.sourceId,
    evidenceBasis: [fact.provenance.updateRef],
    recordedAt: fact.provenance.recordedAt,
    reviewStatus: fact.provenance.confirmationState === "user_confirmed" || fact.provenance.confirmationState === "coach_confirmed"
      ? "accepted" : "needs_review",
    truthState: "expected_future_fact",
  };
}

function isConfirmed(state: ProductWeekConfirmationState): boolean {
  return state === "user_confirmed" || state === "coach_confirmed" || state === "product_confirmed";
}

function resolveEquipment(fact: ProductOpportunitySourceFact, records: readonly VersionedEquipmentCapabilityRecord[]) {
  if (fact.equipment.kind !== "equipment_reference") return { equipment: fact.equipment, unresolvedRef: null };
  const equipment = fact.equipment;
  const record = records.find((entry) => entry.equipmentRef === equipment.equipmentRef);
  return record ? { equipment: { kind: "capability_snapshot" as const, capabilities: record.capabilities,
    sourceRef: record.sourceRef }, unresolvedRef: null } : { equipment, unresolvedRef: equipment.equipmentRef };
}

export function adaptProductWeekHorizon(input: ProductWeekHorizonSourceInput): ProductWeekHorizonAdapterResult {
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.trainingSafety });
  const decisionTrace = ["PRODUCT_ADAPTER_DESIGN_ONLY", "FACTS_ONLY_NO_WEEKLY_ALLOCATION", "NO_PROSE_PARSING"];
  if (!readiness.downstreamTrainingAllowed) {
    return { status: "blocked_by_training_readiness", horizon: null, sourceResolutionTraces: [], tentativeOpportunityIds: [],
      conflictSourceRefs: [], profileDefaultSourceRefs: [], equipmentResolutionRefs: [], unresolvedContext: input.unresolvedContext,
      revision: null, decisionTrace: [...decisionTrace, "training_safety_block"] };
  }
  const sourceFacts = input.opportunityFacts.length > 0 ? input.opportunityFacts : input.profileDefaults ? profileFacts(input.profileDefaults) : [];
  const grouped = new Map<string, ProductOpportunitySourceFact[]>();
  for (const fact of sourceFacts) grouped.set(fact.opportunityKey, [...(grouped.get(fact.opportunityKey) ?? []), fact]);
  const selected: ProductOpportunitySourceFact[] = [];
  const traces: ProductHorizonSourceResolutionTrace[] = [];
  const conflicts: string[] = [];
  for (const [key, facts] of [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const ordered = [...facts].sort((left, right) => SOURCE_PRECEDENCE[left.provenance.sourceType] -
      SOURCE_PRECEDENCE[right.provenance.sourceType] || left.provenance.sourceId.localeCompare(right.provenance.sourceId));
    const topRank = SOURCE_PRECEDENCE[ordered[0].provenance.sourceType];
    const top = ordered.filter((entry) => SOURCE_PRECEDENCE[entry.provenance.sourceType] === topRank);
    if (unique(top.map(factualSignature)).length > 1) {
      conflicts.push(...top.map((entry) => entry.provenance.sourceId));
      traces.push({ opportunityKey: key, selectedSourceId: null, consideredSourceIds: ordered.map((entry) => entry.provenance.sourceId),
        code: "source_conflict", consequence: "conflict" });
      continue;
    }
    const winner = top[0];
    selected.push(winner);
    const calendarNeedsConfirmation = winner.provenance.sourceType === "connected_calendar_window" &&
      winner.provenance.confirmationState === "observed_free_window";
    const profile = winner.provenance.sourceType === "profile_default";
    traces.push({
      opportunityKey: key,
      selectedSourceId: winner.provenance.sourceId,
      consideredSourceIds: ordered.map((entry) => entry.provenance.sourceId),
      code: calendarNeedsConfirmation ? "calendar_window_requires_confirmation" : profile ? "profile_default_proposed_only" :
        winner.provenance.sourceType === "explicit_user_confirmation" ? "explicit_user_fact_selected" :
          winner.provenance.sourceType === "explicit_coach_confirmation" ? "explicit_coach_fact_selected" : "current_product_fact_selected",
      consequence: winner.availabilityStatus === "cancelled" ? "unavailable" :
        isConfirmed(winner.provenance.confirmationState) ? "available" : "tentative",
    });
  }
  if (conflicts.length > 0) {
    return { status: "horizon_source_conflict", horizon: null, sourceResolutionTraces: traces,
      tentativeOpportunityIds: [], conflictSourceRefs: unique(conflicts), profileDefaultSourceRefs: [], equipmentResolutionRefs: [],
      unresolvedContext: input.unresolvedContext, revision: null, decisionTrace: [...decisionTrace, "HORIZON_SOURCE_CONFLICT"] };
  }
  const equipmentUnresolved: string[] = [];
  const opportunities = selected.map((fact, index) => {
    const resolved = resolveEquipment(fact, input.equipmentRecords);
    if (resolved.unresolvedRef) equipmentUnresolved.push(resolved.unresolvedRef);
    const confirmed = isConfirmed(fact.provenance.confirmationState);
    const id = opportunityId(input.horizonId, fact);
    return {
      id,
      ...(fact.timeWindow ? { calendarDateRef: fact.timeWindow.startAt } : {}),
      order: fact.order ?? index,
      expectedAvailability: { availableMinutes: fact.availableMinutes, structuralCapacity: fact.structuralCapacity,
        provenance: weekProvenance(fact) },
      expectedEquipment: resolved.equipment.kind === "capability_snapshot"
        ? { kind: "capability_snapshot" as const, capabilities: resolved.equipment.capabilities, provenance: weekProvenance(fact) }
        : resolved.equipment.kind === "equipment_reference"
          ? { kind: "equipment_reference" as const, equipmentRef: resolved.equipment.equipmentRef, provenance: weekProvenance(fact) }
          : { kind: "unknown" as const, provenance: weekProvenance(fact) },
      provenance: weekProvenance(fact),
      availabilityStatus: fact.availabilityStatus === "cancelled" ? "cancelled" as const :
        confirmed && fact.availabilityStatus === "available" ? "available" as const : "tentative" as const,
      completionStatus: fact.completionStatus,
      constraints: [],
      unresolvedActualDayContextRefs: [`${id}:actual_day_context_required`],
    };
  }).sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const tentativeIds = opportunities.filter((entry) => entry.availabilityStatus === "tentative").map((entry) => entry.id);
  const availableIds = opportunities.filter((entry) => entry.availabilityStatus === "available" && entry.completionStatus === "not_started")
    .map((entry) => entry.id);
  const completedIds = opportunities.filter((entry) => entry.completionStatus === "completed").map((entry) => entry.id);
  const oldIds = input.previousHorizon?.opportunities.map((entry) => entry.id) ?? [];
  const nextIds = opportunities.map((entry) => entry.id);
  const changedIds = nextIds.filter((id) => !oldIds.includes(id));
  const unchangedIds = nextIds.filter((id) => oldIds.includes(id));
  const removedIds = oldIds.filter((id) => !nextIds.includes(id));
  const horizon: WeekPlanningHorizon = {
    id: input.horizonId,
    athleteId: input.athleteId,
    boundary: { kind: "ordered_cycle", cycleRef: `${input.horizonId}:${input.revisionId}`, startOrder: 0,
      endOrder: Math.max(0, opportunities.length - 1) },
    evaluationAsOf: input.evaluationAsOf,
    opportunities,
    provenance: {
      sourceType: "product_adapter", sourceRef: input.revisionId,
      evidenceBasis: unique(sourceFacts.map((entry) => entry.provenance.sourceId)), recordedAt: input.createdAt,
      reviewStatus: tentativeIds.length > 0 ? "needs_review" : "accepted", truthState: "expected_future_fact",
    },
    ...(input.timezone ? { timezone: input.timezone } : {}),
    completedOpportunityIds: completedIds,
    remainingOpportunityIds: opportunities.filter((entry) => entry.completionStatus === "not_started").map((entry) => entry.id),
    unresolvedScheduleContext: input.unresolvedContext.map((entry) => ({
      observationId: entry.id, category: entry.category === "illness_or_safety" ? "illness_or_safety" :
        entry.category === "external_training_load" ? "external_training_load" :
          entry.category === "accessibility" ? "accessibility" : entry.category === "recovery_readiness" ? "recovery_readiness" : "unknown",
      proposedOwner: entry.proposedOwner, resolutionState: "requires_typed_input", blocksWeeklyIntent: entry.blocksHorizon,
      blocksAllocation: entry.blocksHorizon, sourceRef: entry.sourceRef,
      explanation: "Structured Product Adapter observation; no hidden programming consequence.",
    })),
  };
  const revision = {
    horizonId: input.horizonId, revisionId: input.revisionId, basedOnRevisionId: input.basedOnRevisionId ?? null,
    createdAt: input.createdAt, evaluationAsOf: input.evaluationAsOf,
    sourceEventRefs: unique(sourceFacts.map((entry) => entry.provenance.updateRef)),
    changedOpportunityIds: changedIds, unchangedOpportunityIds: unchangedIds, completedOpportunityIds: completedIds,
    invalidatedReservationIds: removedIds.map((id) => `${id}:reservation`),
    reallocationRequired: Boolean(input.previousHorizon && (changedIds.length > 0 || removedIds.length > 0)),
  };
  const blockingUnsupported = input.unresolvedContext.some((entry) => entry.blocksHorizon);
  const status = blockingUnsupported ? "unsupported_context" : equipmentUnresolved.length > 0 ? "equipment_resolution_required" :
    availableIds.length === 0 && tentativeIds.length > 0 ? "user_confirmation_required" :
      availableIds.length === 0 ? "current_week_availability_required" : tentativeIds.length > 0
        ? "horizon_ready_with_tentative_opportunities" : "horizon_ready";
  return {
    status, horizon, sourceResolutionTraces: traces, tentativeOpportunityIds: tentativeIds, conflictSourceRefs: [],
    profileDefaultSourceRefs: sourceFacts.filter((entry) => entry.provenance.sourceType === "profile_default")
      .map((entry) => entry.provenance.sourceId),
    equipmentResolutionRefs: unique(equipmentUnresolved), unresolvedContext: input.unresolvedContext, revision,
    decisionTrace: [...decisionTrace, status, "calendar_free_time_is_not_training_consent", "profile_defaults_are_tentative"],
  };
}

export function adaptCurrentSessionContext(input: CurrentSessionContextInput): CurrentSessionContextAdapterResult {
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.actualTrainingSafety });
  const base = { availability: input.actualAvailability ?? null, equipment: input.actualEquipment ?? null,
    safety: input.actualTrainingSafety, unresolvedContext: input.unresolvedContext,
    decisionTrace: ["PRODUCT_DAY_OF_ADAPTER_DESIGN_ONLY", "NO_PROGRAMMING_POLICY"] };
  if (!readiness.downstreamTrainingAllowed) return { ...base, status: "blocked_by_training_readiness" };
  if (input.userCancelled) return { ...base, status: "user_cancelled" };
  if (input.unresolvedContext.some((entry) => entry.blocksPlanning)) return { ...base, status: "unsupported_context" };
  if (!input.actualAvailability || !input.actualEquipment || input.actualAvailability.availableMinutes === null) {
    return { ...base, status: "under_specified_current_context" };
  }
  return { ...base, status: "current_context_ready" };
}

export function decideStableOpportunityIdentity(input: {
  readonly horizonId: string;
  readonly previous: ProductOpportunitySourceFact | null;
  readonly next: ProductOpportunitySourceFact;
}): StableOpportunityIdentityDecision {
  const nextId = opportunityId(input.horizonId, input.next);
  if (!input.previous) return { previousOpportunityId: null, nextOpportunityId: nextId,
    decision: "new_identity_required", reason: "new_opportunity" };
  const previousId = opportunityId(input.horizonId, input.previous);
  if (input.previous.availabilityStatus === "cancelled" && input.next.availabilityStatus !== "cancelled") {
    return { previousOpportunityId: previousId, nextOpportunityId: nextId,
      decision: "new_identity_required", reason: "cancelled_and_replaced" };
  }
  if (JSON.stringify(identityToken(input.previous)) !== JSON.stringify(identityToken(input.next))) {
    return { previousOpportunityId: previousId, nextOpportunityId: nextId,
      decision: "new_identity_required", reason: "material_window_change" };
  }
  return { previousOpportunityId: previousId, nextOpportunityId: nextId,
    decision: "identity_retained", reason: factualSignature(input.previous) === factualSignature(input.next)
      ? "same_intended_window" : "metadata_only" };
}

function unresolved(id: string, category: ProductHorizonUnresolvedContext["category"], blocksHorizon: boolean): ProductHorizonUnresolvedContext {
  const owner = category === "recovery_readiness" ? "future_recovery_readiness_contract" :
    category === "illness_or_safety" ? "safety_clinical" : category === "external_training_load" ? "future_week_policy" :
      category === "accessibility" ? "future_accessibility_contract" : "unknown";
  return { id, category, proposedOwner: owner, blocksHorizon, sourceRef: `${id}:source` };
}

export interface ProductHorizonScenarioDefinition {
  readonly id: string;
  readonly input: ProductWeekHorizonSourceInput;
  readonly expectedStatus: ProductWeekHorizonAdapterResult["status"];
}

export function buildProductHorizonScenarioDefinitions(): readonly ProductHorizonScenarioDefinition[] {
  const gym3 = ["mon", "wed", "fri"].map((key, index) => opportunityFact({ key, order: index }));
  const prior = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "mon" }),
    opportunityFact({ key: "wed", order: 1 })] })).horizon!;
  const calendar = opportunityFact({ key: "calendar-free", sourceType: "connected_calendar_window",
    confirmation: "observed_free_window", startAt: "2026-08-13T18:00:00-04:00", endAt: "2026-08-13T19:00:00-04:00" });
  return [
    { id: "confirmed-three-gym", input: horizonSourceInput({ opportunityFacts: gym3 }), expectedStatus: "horizon_ready" },
    { id: "profile-four-user-two", input: horizonSourceInput({ opportunityFacts: gym3.slice(0, 2), profileDefaults: profileDefaults() }), expectedStatus: "horizon_ready" },
    { id: "calendar-free-unconfirmed", input: horizonSourceInput({ opportunityFacts: [calendar] }), expectedStatus: "user_confirmation_required" },
    { id: "mixed-gym-home", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "gym" }), opportunityFact({ key: "home", order: 1, equipmentRef: "equipment:home" })] }), expectedStatus: "horizon_ready" },
    { id: "travel-week", input: horizonSourceInput({ timezone: "Europe/Athens", opportunityFacts: [opportunityFact({ key: "travel", equipmentRef: "equipment:home", locationRef: "athens" })] }), expectedStatus: "horizon_ready" },
    { id: "tentative-to-confirmed", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "tentative", confirmation: "user_confirmed" })] }), expectedStatus: "horizon_ready" },
    { id: "confirmed-cancelled", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "cancelled", status: "cancelled", confirmation: "user_confirmed" })] }), expectedStatus: "current_week_availability_required" },
    { id: "session-moved", input: horizonSourceInput({ revisionId: "revision:2", basedOnRevisionId: "revision:1", previousHorizon: prior,
      opportunityFacts: [opportunityFact({ key: "mon" }), opportunityFact({ key: "thu", order: 1 })] }), expectedStatus: "horizon_ready" },
    { id: "expected-gym", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "expected-gym" })] }), expectedStatus: "horizon_ready" },
    { id: "machine-outage", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "outage", equipment: BODYWEIGHT_EQUIPMENT })] }), expectedStatus: "horizon_ready" },
    { id: "minutes-change-same-capacity", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "minutes", minutes: 25 })] }), expectedStatus: "horizon_ready" },
    { id: "structural-capacity-change", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "capacity", capacity: "condensed" })] }), expectedStatus: "horizon_ready" },
    { id: "completed-before-revision", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "done", completion: "completed" }), opportunityFact({ key: "remaining", order: 1 })] }), expectedStatus: "horizon_ready" },
    { id: "missed-before-reallocation", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "missed", status: "cancelled", completion: "missed" }), opportunityFact({ key: "remaining", order: 1 })] }), expectedStatus: "horizon_ready" },
    { id: "calendar-user-precedence", input: horizonSourceInput({ opportunityFacts: [calendar, opportunityFact({ key: "calendar-free", sourceId: "user-current", minutes: 30 })] }), expectedStatus: "horizon_ready" },
    { id: "same-authority-conflict", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "conflict", sourceId: "user-a", minutes: 30 }), opportunityFact({ key: "conflict", sourceId: "user-b", minutes: 60 })] }), expectedStatus: "horizon_source_conflict" },
    { id: "equipment-unresolved", input: horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "unknown-kit", equipmentRef: "equipment:missing" })] }), expectedStatus: "equipment_resolution_required" },
    { id: "travel-timezone", input: horizonSourceInput({ timezone: "Asia/Tokyo", opportunityFacts: [opportunityFact({ key: "tokyo", startAt: "2026-08-15T09:00:00+09:00", endAt: "2026-08-15T10:00:00+09:00", timezone: "Asia/Tokyo" })] }), expectedStatus: "horizon_ready" },
    { id: "no-current-availability", input: horizonSourceInput({ opportunityFacts: [], profileDefaults: undefined }), expectedStatus: "current_week_availability_required" },
    { id: "poor-sleep-unresolved", input: horizonSourceInput({ unresolvedContext: [unresolved("sleep", "recovery_readiness", false)] }), expectedStatus: "horizon_ready" },
    { id: "illness-safety", input: horizonSourceInput({ trainingSafety: { signals: [{ signalId: "illness",
      requestedReviewLevel: "review_required_before_ordinary_training", authority: { source: "clinician", sourceRef: "illness-review",
        evidenceBasis: ["explicit illness report"], reportedBy: "clinician", reportedAt: POLICY_HORIZON_AS_OF },
      resolution: { state: "unresolved" }, notes: ["Acute illness."] }] } }), expectedStatus: "blocked_by_training_readiness" },
    { id: "external-load-no-policy", input: horizonSourceInput({ unresolvedContext: [unresolved("sport", "external_training_load", false)] }), expectedStatus: "horizon_ready" },
    { id: "accessibility-no-receiver", input: horizonSourceInput({ unresolvedContext: [unresolved("access", "accessibility", true)] }), expectedStatus: "unsupported_context" },
  ];
}

export function runProductHorizonScenarios(): readonly ProductAdapterScenarioResult[] {
  return buildProductHorizonScenarioDefinitions().map((scenario) => {
    const result = adaptProductWeekHorizon(scenario.input);
    return {
      id: scenario.id,
      status: result.status,
      opportunityIds: result.horizon?.opportunities.map((entry) => entry.id) ?? [],
      availableOpportunityIds: result.horizon?.opportunities.filter((entry) => entry.availabilityStatus === "available")
        .map((entry) => entry.id) ?? [],
      tentativeOpportunityIds: result.tentativeOpportunityIds,
      unresolvedCategories: result.unresolvedContext.map((entry) => entry.category),
      changedOpportunityIds: result.revision?.changedOpportunityIds ?? [],
    };
  });
}

export function buildSameProfileCurrentWeekCohort() {
  const facts = [
    ["two-gym", [opportunityFact({ key: "mon" }), opportunityFact({ key: "thu", order: 1 })]],
    ["three-gym", [opportunityFact({ key: "mon" }), opportunityFact({ key: "wed", order: 1 }), opportunityFact({ key: "fri", order: 2 })]],
    ["home-only", [opportunityFact({ key: "home", equipmentRef: "equipment:home" })]],
    ["travel", [opportunityFact({ key: "travel", equipmentRef: "equipment:home", locationRef: "hotel" })]],
    ["cancelled-plus-one", [opportunityFact({ key: "mon", status: "cancelled" }), opportunityFact({ key: "fri", order: 1 })]],
    ["timed-morning", [opportunityFact({ key: "timed", startAt: "2026-08-13T07:00:00-04:00", endAt: "2026-08-13T08:00:00-04:00" })]],
    ["timed-evening", [opportunityFact({ key: "timed", startAt: "2026-08-13T18:00:00-04:00", endAt: "2026-08-13T19:00:00-04:00" })]],
    ["condensed", [opportunityFact({ key: "mon", capacity: "condensed", minutes: 25 })]],
    ["mixed-location", [opportunityFact({ key: "gym" }), opportunityFact({ key: "home", equipmentRef: "equipment:home", order: 1 })]],
    ["calendar-tentative", [opportunityFact({ key: "calendar", sourceType: "connected_calendar_window", confirmation: "observed_free_window" })]],
    ["identical-a", [opportunityFact({ key: "same" })]],
    ["identical-b", [opportunityFact({ key: "same" })]],
  ] as const;
  return facts.map(([id, opportunityFacts]) => {
    const result = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts, profileDefaults: profileDefaults() }));
    return { id, status: result.status, signature: digest({ status: result.status, opportunities: result.horizon?.opportunities }) };
  });
}

export function runUpdatedPolicyConsequenceLab() {
  return [
    ...runWeeklyPolicyConsequenceLab().map((entry) => ({ ...entry, productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const })),
    { id: "participation-vs-objective-frequency", observedConsequence: "Public-health participation days do not create every-objective frequency.", productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const },
    { id: "week-goal-vs-session-goal", observedConsequence: "Copying the primary Week goal misclassifies explicitly secondary-goal sessions.", productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const },
    { id: "capacity-main-support", observedConsequence: "A required allocated capacity responsibility can truthfully dominate without a strength main.", productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const },
    { id: "order-vs-elapsed-spacing", observedConsequence: "Opportunity order cannot establish elapsed recovery time.", productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const },
    { id: "profile-vs-confirmed-horizon", observedConsequence: "Profile defaults stay tentative and yield to confirmed current facts.", productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const },
    { id: "volume-vs-frequency", observedConsequence: "Set-dose evidence cannot become allocation-frequency authority.", productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const },
  ];
}

export function runPolicyHorizonFuzz(caseCount = 10_000) {
  let seed = POLICY_HORIZON_SEED;
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const failures: string[] = [];
  const signatures: string[] = [];
  const confirmations = ["user_confirmed", "coach_confirmed", "observed_free_window", "tentative"] as const;
  for (let index = 0; index < caseCount; index += 1) {
    const count = next() % 5;
    const facts = Array.from({ length: count }, (_, factIndex) => opportunityFact({
      key: `slot-${factIndex}`,
      sourceId: `fuzz-${index}-${factIndex}`,
      confirmation: confirmations[next() % confirmations.length],
      sourceType: confirmations[next() % confirmations.length] === "observed_free_window"
        ? "connected_calendar_window" : "explicit_user_confirmation",
      minutes: next() % 2 === 0 ? next() % 121 : null,
      capacity: (["condensed", "standard", "expanded", "unknown"] as const)[next() % 4],
      equipmentRef: next() % 7 === 0 ? "equipment:missing" : next() % 2 === 0 ? "equipment:home" : "equipment:full-gym",
      order: factIndex,
    }));
    const input = horizonSourceInput({ horizonId: `fuzz-horizon-${index}`, revisionId: `fuzz-revision-${index}`,
      opportunityFacts: facts, profileDefaults: count === 0 && next() % 2 === 0 ? profileDefaults({ daysPerWeek: next() % 5 }) : undefined });
    const first = adaptProductWeekHorizon(input);
    const second = adaptProductWeekHorizon(input);
    if (digest(first) !== digest(second)) failures.push(`non_deterministic:${index}`);
    if (JSON.stringify(first).includes("weeklyObjective") || JSON.stringify(first).includes("exerciseId") || JSON.stringify(first).includes("dose")) {
      failures.push(`wrong_layer_effect:${index}`);
    }
    if (first.horizon?.opportunities.some((entry) => entry.availabilityStatus === "available" &&
      entry.provenance.reviewStatus !== "accepted")) failures.push(`unconfirmed_available:${index}`);
    signatures.push(digest(first));
  }
  return { cases: caseCount, failures, digest: digest(signatures) };
}

export function buildPolicyHorizonFingerprintPayloads() {
  const scenarios = runProductHorizonScenarios();
  const cohort = buildSameProfileCurrentWeekCohort();
  const baseline = adaptProductWeekHorizon(horizonSourceInput());
  const changedFact = opportunityFact({ key: "monday", minutes: 30 });
  return {
    ownerPolicyDecisions: OWNER_WEEK_POLICY_DECISIONS,
    evidenceReviewInventory: WEEKLY_EVIDENCE_INVENTORY,
    policyCandidateMatrix: WEEKLY_POLICY_CANDIDATES,
    policyResolutionConflicts: [
      resolveWeeklyPolicyRules([], "objective_frequency_intent"),
      resolveWeeklyPolicyRules([frequencyPolicyRule({ id: "a", candidateRef: "candidate:a" }),
        frequencyPolicyRule({ id: "b", candidateRef: "candidate:b" })], "objective_frequency_intent"),
    ],
    sessionSpecificGoalContract: ["weekly_primary_reference", "weekly_secondary_references", "session_goal", "dominant_objective_evidence"],
    objectiveToGoalOwnership: ["primary_weekly_goal", "secondary_weekly_goal", "cross_goal_support"],
    capacityMainCorrection: ["required", "main", "capacity", "sole_dominant_responsibility"],
    capacityConditioningAudit: CAPACITY_CONDITIONING_AUDIT,
    spacingBasisRefinement: ["ordered_opportunity_gap", "elapsed_time_duration", "unknown_pending_prescription", "external_event_spacing"],
    horizonSourceContract: horizonSourceInput(),
    horizonSourceResolution: baseline.sourceResolutionTraces,
    horizonRevision: baseline.revision,
    stableOpportunityIdentity: decideStableOpportunityIdentity({ horizonId: "identity", previous: changedFact,
      next: { ...changedFact, availableMinutes: 60 } }),
    availabilitySourcePrecedence: SOURCE_PRECEDENCE,
    equipmentResolution: baseline.horizon?.opportunities.map((entry) => entry.expectedEquipment.kind),
    dayOfContext: adaptCurrentSessionContext({ reservationId: "reservation", actualEvaluationTime: POLICY_HORIZON_AS_OF,
      actualAvailability: { availableMinutes: 45, structuralCapacity: "standard", provenance: "explicit_today", sourceRef: "today" },
      actualEquipment: { capabilities: FULL_GYM_EQUIPMENT, provenance: "explicit_today", sourceRef: "today-equipment" },
      actualTrainingSafety: NO_TRAINING_SAFETY_SIGNALS, userCancelled: false, unresolvedContext: [], productUpdateRefs: [] }),
    productAdapterStatusModel: ["horizon_ready", "horizon_ready_with_tentative_opportunities", "user_confirmation_required",
      "horizon_source_conflict", "current_week_availability_required", "equipment_resolution_required", "unsupported_context",
      "blocked_by_training_readiness"],
    realUserHorizonScenarios: scenarios,
    sameProfileCurrentWeekRegression: cohort,
    updatedPolicyConsequenceLab: runUpdatedPolicyConsequenceLab(),
    implementationReadiness: {
      overall: "TARGETED_WEEK_POLICY_DECISIONS_REMAIN",
      evidence: "EVIDENCE_READY_FOR_OWNER_NUMERIC_REVIEW",
      productAdapter: "DESIGN_READY",
      numericPolicyActivated: false,
      productionWeekAuthorized: false,
    },
  };
}

export function computePolicyHorizonFingerprints(): Readonly<Record<string, string>> {
  const individual = Object.fromEntries(Object.entries(buildPolicyHorizonFingerprintPayloads())
    .map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedPolicyHorizonDesign: digest(individual) };
}

export const EXPECTED_POLICY_HORIZON_FINGERPRINTS: Readonly<Record<string, string>> = {
  ownerPolicyDecisions: "19d5283f2b34f973e017d3831012768dac852c7bb003249bf9c1491fdf94135f",
  evidenceReviewInventory: "3b67106192c8a1f89dcb548c8edf48ee5d4f0a3b221a6a29d1a82424d7ac02e6",
  policyCandidateMatrix: "8a3a8be12354a2c9de1fcefc634f9a06d8aabf0d79be73fa8c31fc95371fc334",
  policyResolutionConflicts: "ca160646e82237c903f9b23c60727b4329231185e1f246e703296488ba4cdf7d",
  sessionSpecificGoalContract: "35d0bac00578c5eb835b89c3f10c6d7493b4a3a39a6c62ab7b14ba0ba4678218",
  objectiveToGoalOwnership: "9f17aa1556ffeeec612bb27de039a78a37a3d3c5839306cfed443ec7ade5f42b",
  capacityMainCorrection: "7d7d1c4a1e7f4b09181f48cdcb771bd4f63b0ef47e3e55aa415b99837078ec94",
  capacityConditioningAudit: "e4265246235e93f850c4c8a334145a4a9804f87d61b7f08b80a122d074a8213f",
  spacingBasisRefinement: "6792338beedc330cc8e4d11616e12cd68900b94d4c6a73d5c5183de4d1e2d6a8",
  horizonSourceContract: "fc588ad367d85d68552f8a7ca60839443f0f9973bf59cda5cff2b00b5955d65c",
  horizonSourceResolution: "14299350d88cc31b52eabee16103e7620fbea20d62cece6cfc53d2050e784d1e",
  horizonRevision: "3a6873fc2962a57b68bd72374d0e986e8093d61700d09d969a524d9f8832bddc",
  stableOpportunityIdentity: "aa4a6078dea450238d67b31911dcd529ed4929fb6c451fd81e1d7ff914a5ab1a",
  availabilitySourcePrecedence: "9234b68278898009eed5e414c8928727129f7c8b06fcb7a4e65e69cd504d1d45",
  equipmentResolution: "780308284f5da8510cf5c72c273f318a8d5c5f2145e42a690e4e19a2e814aebc",
  dayOfContext: "81c1c00be9dd91d1ea8c340c35a122df168614d899283ef5d11c1f07d1412d4b",
  productAdapterStatusModel: "70affcb77a50cf1fd772ab554309668a5c5563b36edd452e9cf481411ae4da9e",
  realUserHorizonScenarios: "32ca1c8b33a284995702c576fa16ca55835b545ba47030d66d3f89622bc7f34f",
  sameProfileCurrentWeekRegression: "6bbc47b229adcde48239c2b551e5d58c7074c03019ac850840d27d0d45ad1e10",
  updatedPolicyConsequenceLab: "3f5e0b02a7b5463ea987827ab6ca75fe6d8b11537f727e919ed4cbbcdf97ba9f",
  implementationReadiness: "83b63487ba163ff8ed1b064441f2b5df633f8ff1228cda18bc985307bd6aa87f",
  combinedPolicyHorizonDesign: "ac7949f93f1ee3688f6c87ed316d89c886081853fa6cb7fab5746815187563cc",
};

export const POLICY_DESIGN_FIXTURE: ReviewedWeeklyProgrammingPolicy = {
  ...NON_PRODUCTION_WEEKLY_POLICY,
  policyId: "policy-resolution-design-fixture",
  rules: [frequencyPolicyRule({ id: "broad-frequency-candidate", candidateRef: "candidate:unapproved" })],
};
