import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  type ExerciseStressExposureScope,
  type ExerciseStressSideScope,
  type JointStressTag,
} from "../../src";

export const LOW_BACK_RELEVANT_STRESS_VOCABULARY = [
  "loaded_hinge",
  "loaded_spinal_flexion",
  "loaded_spinal_extension",
  "heavy_axial_loading",
  "loaded_trunk_rotation",
  "lateral_trunk_loading",
  "loaded_gait",
  "loaded_march",
  "long_lever_core",
] as const satisfies readonly JointStressTag[];

export const LOW_BACK_ROW_STRESS_CURATION_CLASSIFICATION =
  "FOCUSED_OWNER_DECISIONS_APPLIED_PRODUCTION_MIGRATED";

export type StressCurationDecision =
  | "PROPOSE_ACCEPT_STRUCTURED"
  | "KEEP_NEEDS_REVIEW"
  | "REJECT_LEGACY_AS_INTRINSIC"
  | "DOCUMENTED_NOT_APPLICABLE";

export interface LowBackStressCurationFact {
  readonly exerciseId: string;
  readonly tag: (typeof LOW_BACK_RELEVANT_STRESS_VOCABULARY)[number];
  readonly proposedScope: ExerciseStressExposureScope;
  readonly sideScope: ExerciseStressSideScope;
  readonly decision: StressCurationDecision;
  readonly legacyPresent: boolean;
  readonly legacyPlan: "retain_for_compatibility" | "replace_after_equivalence_proof" | "remove_after_equivalence_proof" | "none";
  readonly provenance: readonly string[];
  readonly uncertainty: string;
  readonly rationale: string;
}

const PROPOSALS: readonly Omit<LowBackStressCurationFact, "legacyPresent">[] = [
  {
    exerciseId: "dead-bug",
    tag: "long_lever_core",
    proposedScope: "variant_dependent",
    sideScope: "bilateral_or_systemic",
    decision: "KEEP_NEEDS_REVIEW",
    legacyPlan: "replace_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Reviewed lever prescription contract"],
    uncertainty: "The realized lever can shorten or lengthen without changing exercise identity.",
    rationale: "Long-lever exposure is not intrinsic to every dead-bug prescription and must be realized from lever/range context.",
  },
  {
    exerciseId: "push-up",
    tag: "long_lever_core",
    proposedScope: "variant_dependent",
    sideScope: "bilateral_or_systemic",
    decision: "KEEP_NEEDS_REVIEW",
    legacyPlan: "replace_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Reviewed support and lever mechanics"],
    uncertainty: "Knee, incline and full-lever realizations change trunk demand.",
    rationale: "Support and lever realization determine long-lever exposure; horizontal pressing identity alone does not.",
  },
  {
    exerciseId: "one-arm-dumbbell-row",
    tag: "loaded_hinge",
    proposedScope: "variant_dependent",
    sideScope: "prescription_side",
    decision: "KEEP_NEEDS_REVIEW",
    legacyPlan: "replace_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Compositional support/stance review"],
    uncertainty: "Bench support, stance and load/support side alter realized trunk and hinge demand.",
    rationale: "Some unsupported row setups realize a loaded hinge, while supported realizations do not prove the same exposure.",
  },
  {
    exerciseId: "one-arm-dumbbell-row",
    tag: "loaded_spinal_flexion",
    proposedScope: "unknown",
    sideScope: "unknown",
    decision: "REJECT_LEGACY_AS_INTRINSIC",
    legacyPlan: "remove_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Low-back region/stress ownership audit"],
    uncertainty: "Actual spinal position is not represented by exercise identity or the current support metadata.",
    rationale: "A row or hinge setup does not itself prove loaded spinal flexion; compensation must not become intended exposure truth.",
  },
  {
    exerciseId: "dumbbell-shoulder-press",
    tag: "loaded_spinal_extension",
    proposedScope: "unknown",
    sideScope: "bilateral_or_systemic",
    decision: "REJECT_LEGACY_AS_INTRINSIC",
    legacyPlan: "remove_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Low-back stress ownership audit"],
    uncertainty: "Support, load, range and execution may alter trunk position; extension as compensation is not intended task truth.",
    rationale: "Overhead pressing identity does not prove loaded spinal extension.",
  },
  {
    exerciseId: "dumbbell-shoulder-press",
    tag: "heavy_axial_loading",
    proposedScope: "dose_created",
    sideScope: "bilateral_or_systemic",
    decision: "KEEP_NEEDS_REVIEW",
    legacyPlan: "none",
    provenance: ["Structured load prescription contract", "Exercise loading profile"],
    uncertainty: "No arbitrary threshold defines heavy; realized dose needs an external reviewed exposure classification.",
    rationale: "Axial loading can become heavy only through realized dose, never from shoulder-press identity alone.",
  },
  {
    exerciseId: "goblet-squat",
    tag: "heavy_axial_loading",
    proposedScope: "dose_created",
    sideScope: "bilateral_or_systemic",
    decision: "KEEP_NEEDS_REVIEW",
    legacyPlan: "none",
    provenance: ["Structured load prescription contract", "Exercise loading profile"],
    uncertainty: "The engine has no owner-approved heavy-load threshold and must preserve unknown until supplied.",
    rationale: "A goblet squat may realize substantial axial load at some doses, but identity cannot create heavy exposure.",
  },
  {
    exerciseId: "dumbbell-romanian-deadlift",
    tag: "loaded_hinge",
    proposedScope: "intrinsic",
    sideScope: "bilateral_or_systemic",
    decision: "PROPOSE_ACCEPT_STRUCTURED",
    legacyPlan: "retain_for_compatibility",
    provenance: ["Current catalog legacy jointStressTags", "Reviewed hinge movement role and identity"],
    uncertainty: "Exact magnitude remains prescription-dependent even though the hinge exposure is intrinsic.",
    rationale: "The reviewed identity is a loaded hip-hinge task; exposure does not imply danger or intolerance.",
  },
  {
    exerciseId: "dumbbell-romanian-deadlift",
    tag: "loaded_spinal_flexion",
    proposedScope: "unknown",
    sideScope: "bilateral_or_systemic",
    decision: "REJECT_LEGACY_AS_INTRINSIC",
    legacyPlan: "remove_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Low-back stress ownership audit"],
    uncertainty: "Actual range and spinal motion are realization/performance facts not currently captured as accepted stress exposure.",
    rationale: "Loaded hinge does not entail loaded spinal flexion, and technique compensation is not identity truth.",
  },
  {
    exerciseId: "dumbbell-romanian-deadlift",
    tag: "heavy_axial_loading",
    proposedScope: "dose_created",
    sideScope: "bilateral_or_systemic",
    decision: "KEEP_NEEDS_REVIEW",
    legacyPlan: "none",
    provenance: ["Structured load prescription contract", "Reviewed loaded-hinge identity"],
    uncertainty: "Heavy exposure requires explicit realized-dose authority; no threshold is approved here.",
    rationale: "Load magnitude can create heavy axial exposure, but RDL identity alone cannot.",
  },
  {
    exerciseId: "cable-pull-through",
    tag: "loaded_hinge",
    proposedScope: "intrinsic",
    sideScope: "bilateral_or_systemic",
    decision: "PROPOSE_ACCEPT_STRUCTURED",
    legacyPlan: "retain_for_compatibility",
    provenance: ["Current catalog legacy jointStressTags", "Reviewed hinge movement role and cable resistance path"],
    uncertainty: "Magnitude and range remain prescription-realized.",
    rationale: "The reviewed identity is a resisted hinge task; this is exposure truth, not a danger label.",
  },
  {
    exerciseId: "glute-bridge",
    tag: "loaded_spinal_extension",
    proposedScope: "unknown",
    sideScope: "bilateral_or_systemic",
    decision: "REJECT_LEGACY_AS_INTRINSIC",
    legacyPlan: "remove_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Low-back stress ownership audit"],
    uncertainty: "Hip extension intent does not reveal whether loaded spinal extension occurred.",
    rationale: "Potential compensation cannot be promoted to intrinsic exercise exposure.",
  },
  {
    exerciseId: "pallof-press",
    tag: "long_lever_core",
    proposedScope: "prescription_modifiable",
    sideScope: "prescription_side",
    decision: "KEEP_NEEDS_REVIEW",
    legacyPlan: "replace_after_equivalence_proof",
    provenance: ["Current catalog legacy jointStressTags", "Range/load/side prescription contracts"],
    uncertainty: "Arm reach, range, cable load and stance determine realized lever demand.",
    rationale: "Long-lever exposure must follow the actual press-out prescription rather than anti-rotation identity alone.",
  },
];

export const LOW_BACK_STRESS_OWNER_QUESTIONS = [
  "Approve loaded_hinge as intrinsic for dumbbell RDL and cable pull-through while keeping magnitude prescription-realized?",
  "Remove loaded_spinal_flexion from one-arm row and RDL legacy arrays after byte-equivalent structured migration tests?",
  "Remove loaded_spinal_extension from shoulder press and glute bridge rather than treating possible compensation as intrinsic exposure?",
  "Which upstream or human-reviewed authority may classify a realized load as heavy_axial_loading without an engine-invented threshold?",
  "Approve long_lever_core as variant/prescription-dependent for dead bug, push-up and Pallof press?",
  "Should one-arm row loaded_hinge remain needs-review until exact support/stance realization is linked to stress exposure?",
] as const;

function legacyContains(exerciseId: string, tag: JointStressTag): boolean {
  const exercise = REFERENCE_EXERCISES.find((candidate) => candidate.id === exerciseId);
  if (!exercise) throw new Error(`Missing production exercise ${exerciseId}.`);
  return (
    exercise.loading.jointStressTags.includes(tag) ||
    exercise.cautionStressTags.includes(tag) ||
    exercise.contraindicatedStressTags.includes(tag)
  );
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export interface LowBackRelevantRowStressCurationData {
  readonly classification: typeof LOW_BACK_ROW_STRESS_CURATION_CLASSIFICATION;
  readonly productionBehavior: "INTENTIONAL_STRESS_TRUTH_CORRECTIONS";
  readonly facts: readonly LowBackStressCurationFact[];
  readonly vocabularyWithoutCurrentAcceptedRow: readonly string[];
  readonly ownerQuestions: typeof LOW_BACK_STRESS_OWNER_QUESTIONS;
  readonly fingerprint: string;
}

export function buildLowBackRelevantRowStressCurationData(): LowBackRelevantRowStressCurationData {
  const facts = PROPOSALS.map((proposal): LowBackStressCurationFact => ({
    ...proposal,
    legacyPresent: legacyContains(proposal.exerciseId, proposal.tag),
  }));
  const acceptedTags = new Set(
    facts
      .filter((fact) => fact.decision === "PROPOSE_ACCEPT_STRUCTURED")
      .map((fact) => fact.tag),
  );
  const vocabularyWithoutCurrentAcceptedRow = LOW_BACK_RELEVANT_STRESS_VOCABULARY.filter(
    (tag) => !acceptedTags.has(tag),
  );
  const payload = {
    classification: LOW_BACK_ROW_STRESS_CURATION_CLASSIFICATION as typeof LOW_BACK_ROW_STRESS_CURATION_CLASSIFICATION,
    productionBehavior: "INTENTIONAL_STRESS_TRUTH_CORRECTIONS" as const,
    facts,
    vocabularyWithoutCurrentAcceptedRow,
    ownerQuestions: LOW_BACK_STRESS_OWNER_QUESTIONS,
  };
  return { ...payload, fingerprint: hash(payload) };
}

function cell(value: unknown): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [
    `| ${headers.map(cell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

export function renderLowBackRelevantRowStressCuration(
  data: LowBackRelevantRowStressCurationData,
): string {
  return [
    "# Low-Back-Relevant Row Stress Curation",
    "",
    `Classification: **${data.classification}**. Production behavior: **${data.productionBehavior}**.`,
    "",
    "This focused review covers only the approved low-back-relevant vocabulary. Exposure is not danger, pathology, diagnosis or contraindication. Exercise names and possible compensations are non-executable; prescription-modifiable, variant-dependent, dose-created and unknown facts require realization evidence.",
    "",
    `Fingerprint: \`${data.fingerprint}\`.`,
    "",
    "## Current Production Rows",
    "",
    table(
      ["Exercise", "Stress", "Scope", "Side", "Decision", "Legacy present", "Legacy plan", "Rationale", "Provenance", "Uncertainty"],
      data.facts.map((fact) => [
        fact.exerciseId,
        fact.tag,
        fact.proposedScope,
        fact.sideScope,
        fact.decision,
        fact.legacyPresent,
        fact.legacyPlan,
        fact.rationale,
        fact.provenance.join("; "),
        fact.uncertainty,
      ]),
    ),
    "",
    "## Vocabulary Without An Owner-Ready Current Accepted Row",
    "",
    data.vocabularyWithoutCurrentAcceptedRow.map((tag) => `- \`${tag}\``).join("\n"),
    "",
    "Absence means no current owner-ready accepted structured fact, not reviewed zero exposure. Proposed seven-row facts remain in their separate curation and are not production metadata.",
    "",
    "## Exact Owner Questions",
    "",
    data.ownerQuestions.map((question) => `- ${question}`).join("\n"),
    "",
  ].join("\n");
}

if (process.argv[1]?.endsWith("lowBackRelevantRowStressCuration.ts")) {
  const outputPath = join(
    process.cwd(),
    "../../docs/training-engine-v2/LOW_BACK_RELEVANT_ROW_STRESS_CURATION.md",
  );
  writeFileSync(
    outputPath,
    renderLowBackRelevantRowStressCuration(
      buildLowBackRelevantRowStressCurationData(),
    ),
  );
}
