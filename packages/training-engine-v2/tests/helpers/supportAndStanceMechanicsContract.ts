import { createHash } from "node:crypto";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src";

export const SUPPORT_AND_STANCE_MECHANICS_CONTRACT_CLASSIFICATION =
  "SUPPORT_AND_STANCE_SCHEMA_IMPLEMENTED";

export const SUPPORT_AND_STANCE_REVIEW_FIXED_AS_OF = "2026-08-12T00:00:00.000Z";

export const SUPPORT_AND_STANCE_CONSUMER_AUDIT = [
  {
    path: "packages/training-engine-v2/src/domain/exercise.ts",
    consumer: "ExerciseSupportProfile schema",
    currentUse:
      "Defines normalized base position, stance, orientation, contact, amount, relationship, review status, and notes.",
    migrationNeed:
      "Completed: the coarse pair was removed and explicit unknown remains legal in every dimension.",
  },
  {
    path: "packages/training-engine-v2/src/transitionComparison.ts",
    consumer: "transition mechanics delta",
    currentUse:
      "Compares every normalized support/stance dimension and canonicalized contact sets.",
    migrationNeed:
      "Completed: support amount is ordinal only when known; modifiable and unknown values remain non-directional.",
  },
  {
    path: "packages/training-engine-v2/src/candidate/rowSelectionKnowledge.ts",
    consumer: "horizontal row support trace and lumbar differentiator",
    currentUse:
      "Emits the compositional profile and detects primary chest contact structurally.",
    migrationNeed:
      "Completed: chest support remains observable without exercise-name inference.",
  },
  {
    path: "packages/training-engine-v2/tests/helpers/candidateIntelligenceReviewReport.ts",
    consumer: "review/report rendering",
    currentUse:
      "Formats all normalized support dimensions and explicit contact tuples.",
    migrationNeed:
      "Completed: unknown values render as unknown and are never replaced with inferred labels.",
  },
] as const;

export const SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION = [
  {
    field: "basePosition",
    recommendation:
      "Represent the body organization independent of external support, for example standing, half_kneeling, tall_kneeling, prone, side_support, supine, seated, quadruped, hanging, unknown.",
    decisionNeed:
      "Prevents half-kneeling from being encoded as standing and lets prone/side-support plank rows differ truthfully.",
  },
  {
    field: "stance",
    recommendation:
      "Represent stance details only when they change the task, for example bilateral, split, half_kneeling_lead_side, staggered, stacked_feet, bent_knee_side_support, alternating_march, unknown.",
    decisionNeed:
      "Keeps stance compositional instead of creating one enum value per exercise.",
  },
  {
    field: "orientation",
    recommendation:
      "Represent trunk/body orientation separately, for example upright, prone, supine, lateral, diagonal, suspended, unknown.",
    decisionNeed:
      "Allows prone forearm plank and lateral forearm side plank to be distinct without abusing body-support labels.",
  },
  {
    field: "supportContacts[]",
    recommendation:
      "Represent one or more contacts with body region, surface/source, mode, side, and task role: forearm-floor-primary, foot-floor-primary, knee-floor-variant, hand-wall-secondary, chest-bench-primary, seat-machine-primary.",
    decisionNeed:
      "Captures forearm support, lateral forearm/foot support, wall support, and machine/bench contacts without false `hands_supported` labels.",
  },
  {
    field: "supportAmount",
    recommendation:
      "Represent support magnitude only when task-changing: none, light_touch, partial, substantial, prescription_modifiable, unknown.",
    decisionNeed:
      "Keeps wall-supported suitcase march anti-lateral exposure contextual until support force/control is reviewed.",
  },
  {
    field: "supportRelationship",
    recommendation:
      "Represent side relationship when it changes mechanics: same_side_load, opposite_side_load, bilateral, side_neutral, alternating, unknown.",
    decisionNeed:
      "Captures suitcase-march load/support relationship without creating a new movement role.",
  },
] as const;

export const SEVEN_EXERCISE_SUPPORT_GAPS = [
  {
    exerciseId: "forearm-plank",
    gap: "Existing `bodySupport` cannot say prone forearm-and-foot support. `hands_supported` would be false.",
    requiredContract:
      "basePosition=prone, orientation=prone, supportContacts include bilateral forearms and feet, supportAmount captures knee-supported variant when prescribed.",
  },
  {
    exerciseId: "forearm-side-plank",
    gap: "Existing `bodySupport` cannot say lateral forearm/foot or bent-knee side support.",
    requiredContract:
      "basePosition=side_support, orientation=lateral, supportContacts include side forearm plus foot/knee contacts, side and lever remain prescription-visible.",
  },
  {
    exerciseId: "half-kneeling-high-to-low-cable-chop",
    gap: "Existing `bodySupport` cannot say half-kneeling. Encoding it as standing would lie.",
    requiredContract:
      "basePosition=half_kneeling, stance captures lead side, orientation/upright rotation path remains separate from cable anchor support.",
  },
  {
    exerciseId: "wall-supported-suitcase-march",
    gap: "Existing support fields cannot encode wall-support magnitude or opposite-side support/load relationship.",
    requiredContract:
      "basePosition=standing, stance=alternating_march, supportContacts include hand-wall secondary contact, supportAmount=prescription_modifiable, supportRelationship=opposite_side_load.",
  },
] as const;

export const SUPPORT_METADATA_LIE_STATUS =
  "NO_CURRENT_PRODUCTION_SUPPORT_STANCE_LIE_DISCOVERED";

export interface SupportInventoryRow {
  readonly exerciseId: string;
  readonly supportProfile: string;
  readonly reviewStatus: string;
  readonly notes: string;
}

export interface SupportAndStanceMechanicsContractData {
  readonly fixedAsOf: typeof SUPPORT_AND_STANCE_REVIEW_FIXED_AS_OF;
  readonly classification: typeof SUPPORT_AND_STANCE_MECHANICS_CONTRACT_CLASSIFICATION;
  readonly consumerAudit: typeof SUPPORT_AND_STANCE_CONSUMER_AUDIT;
  readonly schemaRecommendation: typeof SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION;
  readonly sevenExerciseGaps: typeof SEVEN_EXERCISE_SUPPORT_GAPS;
  readonly currentSupportInventory: readonly SupportInventoryRow[];
  readonly lieStatus: typeof SUPPORT_METADATA_LIE_STATUS;
  readonly currentProductionLieFindings: readonly string[];
  readonly schemaChangeStatus: "IMPLEMENTED";
  readonly selectionBehaviorChanged: false;
  readonly structuralTraceContractChanged: true;
  readonly fingerprint: string;
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function buildSupportInventory(): readonly SupportInventoryRow[] {
  return REFERENCE_EXERCISES.map((exercise) => {
    const support = exercise.mechanics?.support;
    return {
      exerciseId: exercise.id,
      supportProfile: support
        ? `${support.basePosition}/${support.stance}/${support.orientation}/${support.supportAmount}/${support.supportRelationship}; contacts=${support.supportContacts
            .map((contact) => `${contact.bodyRegion}:${contact.source}:${contact.mode}:${contact.side}:${contact.taskRole}`)
            .sort()
            .join(",") || "none"}`
        : "unknown/unknown/unknown/unknown/unknown; contacts=none",
      reviewStatus: support?.reviewStatus ?? "needs_review",
      notes: support?.notes ?? "Support mechanics are not modeled.",
    };
  }).sort((left, right) => left.exerciseId.localeCompare(right.exerciseId));
}

export function buildSupportAndStanceMechanicsContractData(): SupportAndStanceMechanicsContractData {
  const currentSupportInventory = buildSupportInventory();
  const payload = {
    consumerAudit: SUPPORT_AND_STANCE_CONSUMER_AUDIT,
    schemaRecommendation: SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION,
    sevenExerciseGaps: SEVEN_EXERCISE_SUPPORT_GAPS,
    currentSupportInventory,
    lieStatus: SUPPORT_METADATA_LIE_STATUS,
  };

  return {
    fixedAsOf: SUPPORT_AND_STANCE_REVIEW_FIXED_AS_OF,
    classification: SUPPORT_AND_STANCE_MECHANICS_CONTRACT_CLASSIFICATION,
    consumerAudit: SUPPORT_AND_STANCE_CONSUMER_AUDIT,
    schemaRecommendation: SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION,
    sevenExerciseGaps: SEVEN_EXERCISE_SUPPORT_GAPS,
    currentSupportInventory,
    lieStatus: SUPPORT_METADATA_LIE_STATUS,
    currentProductionLieFindings: [],
    schemaChangeStatus: "IMPLEMENTED",
    selectionBehaviorChanged: false,
    structuralTraceContractChanged: true,
    fingerprint: hash(payload),
  };
}

function list(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

export function renderSupportAndStanceMechanicsContractReport(
  data = buildSupportAndStanceMechanicsContractData(),
): string {
  const supportProfiles = Array.from(
    new Set(data.currentSupportInventory.map((row) => row.supportProfile)),
  ).sort();

  return [
    "# Support And Stance Mechanics Contract",
    "",
    `Fixed review time: \`${data.fixedAsOf}\`.`,
    "",
    `Classification: **${data.classification}**.`,
    "",
    "The approved compositional contract is implemented in production schema, catalog mechanics, validation, transition traces, row-selection knowledge, and review reports. Candidate scoring, ranking, eligibility, phase coefficients, prescription, Session Composer, Week Composer, and ledgers are unchanged.",
    "",
    "## Migrated Consumer Audit",
    "",
    table(
      ["Path", "Consumer", "Current use", "Migration need"],
      data.consumerAudit.map((row) => [
        row.path,
        row.consumer,
        row.currentUse,
        row.migrationNeed,
      ]),
    ),
    "",
    "## Implemented Schema",
    "",
    "Implemented shape: the smallest compositional support/stance profile built from base position, stance, orientation, support contacts, support amount, and support relationship. It preserves unknown and avoids one enum per exercise.",
    "",
    table(
      ["Field", "Recommendation", "Decision / trace need"],
      data.schemaRecommendation.map((row) => [
        row.field,
        row.recommendation,
        row.decisionNeed,
      ]),
    ),
    "",
    "## Resolved Seven-Exercise Schema Requirements",
    "",
    table(
      ["Exercise", "Gap", "Required contract"],
      data.sevenExerciseGaps.map((row) => [
        row.exerciseId,
        row.gap,
        row.requiredContract,
      ]),
    ),
    "",
    "## Existing Metadata Truth Audit",
    "",
    `Lie status: \`${data.lieStatus}\`.`,
    "",
    `Current production lie findings: ${list(data.currentProductionLieFindings)}.`,
    "",
    "The pre-migration production catalog did not encode half-kneeling as standing, forearm support as hands-supported, or known task-changing support amounts as false hard categories. Migration separates resistance anchors from support contacts and retains unknown where the old evidence was insufficient.",
    "",
    `Observed normalized support profiles: ${supportProfiles.join(", ")}.`,
    "",
    "## Production Boundary",
    "",
    `Schema change status: \`${data.schemaChangeStatus}\`.`,
    "",
    `Candidate selection behavior changed: \`${String(data.selectionBehaviorChanged)}\`.`,
    "",
    `Structural trace contract changed: \`${String(data.structuralTraceContractChanged)}\`.`,
    "",
    `Contract fingerprint: \`${data.fingerprint}\`.`,
    "",
  ].join("\n");
}
