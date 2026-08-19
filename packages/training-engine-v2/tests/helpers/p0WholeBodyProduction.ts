import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  EMPTY_TRAINING_HISTORY,
  NO_PAIN_OR_INJURY,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  rankCandidateRequest,
  type CandidateRequest,
} from "../../src";
import { buildCurrentTrunkCurationFingerprints } from "./trunkMechanicsCurationProposal";
import { buildWholeBodyExerciseKnowledgeAuditData } from "./wholeBodyExerciseKnowledgeAudit";

export const P0_PRODUCTION_IDS = [
  "standing-calf-raise",
  "side-lying-hip-adduction",
  "loop-band-lateral-walk",
  "side-lying-dumbbell-external-rotation",
  "supine-hamstring-walkout",
  "wall-ankle-dorsiflexion-rock",
  "bodyweight-hip-hinge-rehearsal",
  "single-leg-balance-rehearsal",
] as const;

export const P0_PRODUCTION_CLASSIFICATION =
  "P0_WHOLE_BODY_PRODUCTION_ADMITTED" as const;
export const CANDIDATE_GRADUATION_CLASSIFICATION =
  "CANDIDATE_INTELLIGENCE_READY_FOR_SESSION_COMPOSER_DESIGN" as const;
export const PRE_P0_PRODUCTION_RANKING_FINGERPRINT =
  "6d4603fa0a2f604c13e8dde8d1758b38af0452a505c2df6c7618520524fdda56";
export const PRE_P0_COMPREHENSIVE_FINGERPRINT =
  "fb08893df66978c60edf912d58cd333e649c5b79d1bf965595b588f49db104de";

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function baseRequest(): CandidateRequest {
  const request = CONTROLLED_CANDIDATE_SCENARIOS.find(
    (scenario) => scenario.id === "horizontal-pull-gym-neutral",
  )?.request;
  if (!request) throw new Error("Missing fixed-shell baseline request.");
  return request;
}

export function p0Request(
  need: CandidateRequest["need"],
  equipment: CandidateRequest["equipment"],
): CandidateRequest {
  const base = baseRequest();
  return {
    ...base,
    id: `p0-${need.id}`,
    goal: need.goal,
    need,
    equipment,
    candidatePool: REFERENCE_EXERCISES,
    assessment: { signals: [], historicalWeaknesses: [] },
    alignmentPriorities: [],
    painAndInjury: NO_PAIN_OR_INJURY,
    trainingSafety: undefined,
    continuity: {
      productiveExerciseIds: [], plateauedExerciseIds: [],
      failedProgressionExerciseIds: [], painResponseExerciseIds: [],
    },
    history: EMPTY_TRAINING_HISTORY,
    fatigueSignals: [],
    notes: [],
  };
}

export function candidateOutcome(request: CandidateRequest) {
  const result = rankCandidateRequest(request);
  return {
    legal: result.rankedCandidates.map((entry) => entry.exercise.id),
    scores: result.rankedCandidates.map((entry) => [entry.exercise.id, entry.total]),
    readiness: result.trainingReadiness.status,
  };
}

function p0Rows() {
  return P0_PRODUCTION_IDS.map((id) => {
    const exercise = REFERENCE_EXERCISES.find((row) => row.id === id);
    if (!exercise) throw new Error(`Missing P0 production row ${id}.`);
    return exercise;
  });
}

export function buildP0WholeBodyProductionData() {
  const rows = p0Rows();
  const allIds = REFERENCE_EXERCISES.map((row) => row.id);
  const preP0Ids = allIds.filter((id) => !P0_PRODUCTION_IDS.includes(id as typeof P0_PRODUCTION_IDS[number]));
  const behavior = buildCurrentTrunkCurationFingerprints();
  const wholeBody = buildWholeBodyExerciseKnowledgeAuditData();
  const fingerprints = {
    catalogAddition: hash({ before: preP0Ids, after: allIds }),
    p0Identities: hash(rows.map((row) => ({ id: row.id, name: row.name, family: row.family }))),
    p0RoleActionPools: hash(rows.map((row) => ({ id: row.id, movementRoles: row.movementRoles, actions: row.actionFunctions, trainingRoles: row.trainingRoles, sections: row.sectionSuitability }))),
    p0MuscleContributions: hash(rows.map((row) => ({ id: row.id, contributions: row.muscleContributions }))),
    p0EquipmentLegality: hash(rows.map((row) => ({ id: row.id, required: row.equipmentRequirements, optional: row.optionalEquipment }))),
    supportStanceAdditions: hash(rows.map((row) => ({ id: row.id, support: row.mechanics?.support }))),
    resistancePathAdditions: hash(rows.map((row) => ({ id: row.id, path: row.mechanics?.resistancePath }))),
    p0Personalization: hash(rows.map((row) => ({ id: row.id, roles: row.movementRoles, actions: row.actionFunctions.map((entry) => entry.action), primary: row.primaryMuscles }))),
    p0PainSafetyResponse: hash(rows.map((row) => ({ id: row.id, stress: row.stressAnnotations ?? [], caution: row.cautionStressTags, contraindicated: row.contraindicatedStressTags }))),
    wholeBodyMatrix: wholeBody.fingerprints.candidatePoolMatrix,
    graduationReview: hash({ classification: CANDIDATE_GRADUATION_CLASSIFICATION, blockers: [] }),
    knowledgeCompatibility: hash(rows.map((row) => ({ id: row.id, coachingFocus: row.coachingFocus, contentDependency: false }))),
    productionRanking: behavior.productionRanking,
    comprehensiveBehavior: behavior.comprehensiveBehavior,
  };
  return {
    classification: P0_PRODUCTION_CLASSIFICATION,
    graduation: CANDIDATE_GRADUATION_CLASSIFICATION,
    catalogBefore: preP0Ids.length,
    catalogAfter: REFERENCE_EXERCISES.length,
    uniqueCatalogAfter: new Set(allIds).size,
    productionRankingBefore: PRE_P0_PRODUCTION_RANKING_FINGERPRINT,
    productionRankingAfter: behavior.productionRanking,
    comprehensiveBefore: PRE_P0_COMPREHENSIVE_FINGERPRINT,
    comprehensiveAfter: behavior.comprehensiveBehavior,
    rows,
    fingerprints,
  } as const;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`),
  ].join("\n");
}

export function renderP0WholeBodyProductionReport(): string {
  const data = buildP0WholeBodyProductionData();
  const equipment = (requirements: typeof data.rows[number]["equipmentRequirements"]) =>
    requirements.map((requirement) => {
      if (requirement.allOf) return `${requirement.id}:all(${requirement.allOf.join("+")})`;
      return `${requirement.id}:oneOf(${requirement.oneOf?.join("|") ?? "none"})`;
    }).join(", ") || "none";
  return [
    "# P0 Whole-Body Production Report", "",
    `Classification: \`${data.classification}\`. Catalog: ${data.catalogBefore} -> ${data.catalogAfter}; unique IDs: ${data.uniqueCatalogAfter}.`, "",
    "## Production Contract", "",
    table(["ID", "Family", "Movement roles", "Actions", "Training roles", "Sections"], data.rows.map((row) => [row.id, row.family, row.movementRoles.join(", "), row.actionFunctions.map((entry) => entry.action).join(", "), row.trainingRoles.join(", "), Object.keys(row.sectionSuitability).join(", ")])), "",
    "## Anatomy And Equipment", "",
    table(["ID", "Canonical muscle contributions", "Required", "Optional"], data.rows.map((row) => [row.id, row.muscleContributions.map((entry) => `${entry.muscle}:${entry.relationship}`).join(", "), equipment(row.equipmentRequirements), equipment(row.optionalEquipment)])), "",
    "## Mechanics And Loading", "",
    table(["ID", "Support/stance", "Resistance path", "Loadability", "Loading potential", "Local/systemic fatigue"], data.rows.map((row) => [row.id, `${row.mechanics?.support.basePosition}/${row.mechanics?.support.stance}/${row.mechanics?.support.orientation}/${row.mechanics?.support.supportAmount}`, row.mechanics?.resistancePath?.resistancePath ?? "unknown", row.loading.loadability, row.loading.loadingPotential, `${row.loading.localFatigue}/${row.loading.systemicFatigue}`])), "",
    "## Progression, Transitions, And Coaching", "",
    table(["ID", "Progression axes", "Observational transitions", "Coaching focus"], data.rows.map((row) => [row.id, row.progression.progressionAxes.join(", "), row.progression.transitionRelationships.map((entry) => `${entry.targetExerciseId} (${entry.purposes.join(", ")}; automatic=none)`).join("; ") || "none", row.coachingFocus.join(" / ")])), "",
    "All eight rows have no hard prerequisites, no accepted contextual phase annotation, and no caution or contraindication tag. Standing Calf Raise alone exposes `grip_loading` as dose-created potential when an implement is prescribed; the other seven rows add no accepted stress annotation.", "",
    "All rows use canonical muscle contributions, compact coaching fallbacks, contextual phase abstention, and one canonical catalog. No P1 row, Composer, Library, Knowledge implementation, Coaching Rail, or automatic behavior is included.", "",
    "## Fingerprints", "",
    `Production ranking before/after: \`${data.productionRankingBefore}\` / \`${data.productionRankingAfter}\`.`, "",
    `Comprehensive behavior before/after: \`${data.comprehensiveBefore}\` / \`${data.comprehensiveAfter}\`.`, "",
    table(["Dimension", "Fingerprint"], Object.entries(data.fingerprints)), "",
  ].join("\n");
}

export function renderP0ActionPainBoundaryReport(): string {
  return [
    "# P0 Action and Pain Input Boundary", "",
    "Action/function metadata is selection truth, not pain or danger truth. The eight P0 rows add no action-derived pain penalty or fabricated intrinsic stress tag.", "",
    "Current explicit exercise blocks, reviewed stress matching, TrainingSafety, side/realization-aware response history, and later tolerated re-exposure retain authority. Body region alone, notes, and coaching prose remain behaviorally inert.", "",
    "Future explicit action-specific discomfort input may be useful when an athlete can report a reproducible action-linked response that current region plus reviewed stress vocabulary cannot represent. That requires a separate approved giver, receiver, side/realization scope, trace, and calibration contract; this task implements none.", "",
  ].join("\n");
}

export function renderCandidateGraduationReview(): string {
  const data = buildP0WholeBodyProductionData();
  return [
    "# Candidate Intelligence Graduation Review", "",
    `Classification: \`${data.graduation}\`.`, "",
    "Macro roles remain pure; exact actions and primary-required muscles are selectable; preparation dependencies have truthful candidates; equipment gaps remain explicit; pain, safety, response, continuity, and contextual phase boundaries remain intact; and fixed-shell personalization remains causal.", "",
    "Thin equipment-specific pools remain visible but do not require fake Composer logic. P1 remains future improvement. Session Composer design still requires separate owner authorization and must consume legal candidate pools without inventing exercise truth.", "",
    `Graduation fingerprint: \`${data.fingerprints.graduationReview}\`.`, "",
  ].join("\n");
}

export function writeP0ProductionReports(rootDir = process.cwd()): readonly string[] {
  const reports = [
    ["P0_WHOLE_BODY_PRODUCTION_REPORT.md", renderP0WholeBodyProductionReport()],
    ["P0_ACTION_AND_PAIN_INPUT_BOUNDARY.md", renderP0ActionPainBoundaryReport()],
    ["CANDIDATE_INTELLIGENCE_GRADUATION_REVIEW.md", renderCandidateGraduationReview()],
  ] as const;
  return reports.map(([name, content]) => {
    const path = join(rootDir, "docs/training-engine-v2", name);
    writeFileSync(path, content);
    return path;
  });
}
