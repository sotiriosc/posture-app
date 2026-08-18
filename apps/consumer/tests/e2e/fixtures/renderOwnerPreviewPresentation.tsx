import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ControlledOwnerV2ProgramPreview } from "@praxis/training-engine-v2";
import OwnerPreviewPresentation from "../../../src/app/account/praxis-v2/preview/[previewId]/OwnerPreviewPresentation";

const PROFILE_REVISION_ID = "owner-profile-revision:visual-fixture";
const REASON_CODES = ["UPSTREAM_ASSIGNMENT_PRESERVED", "ONE_ASSIGNMENT_ONE_SOURCE_EVENT",
  "ORDERED_BLOCKS_ARE_CANONICAL", "NO_AUTOMATIC_PROGRESSION", "FINAL_DURATION_REQUIRES_SEQUENCING"];

function assignment(index: number, exerciseId: string, developmental: {
  readonly volume: string; readonly target: string; readonly rest: string; readonly effort: string;
}) {
  return {
    assignmentId: `owner-assignment:${index}`,
    exerciseId,
    realizationId: `${exerciseId}:fixture`,
    sourceEventId: `owner-source-event:${index}`,
    prescriptionRevisionId: `prescription-revision:${index}`,
    sets: 2,
    reps: developmental.target.replace(" reps", ""),
    tempo: "Natural",
    restSeconds: 180,
    effort: developmental.effort,
    doseBlocks: [{ blockId: `preparation:${index}`, order: 0, purpose: "preparatory_acclimation" as const,
      volume: "1 set", target: "4-8 reps", rest: "60-180 seconds before strength work",
      effort: "Quality remains the limiting standard.", tempo: "Controlled tempo",
      load: "Choose load to match the effort target", calibrationRequired: true },
    { blockId: `development:${index}`, order: 1, purpose: "developmental_work" as const,
      ...developmental, tempo: "Natural", load: "Choose load to match the effort target",
      calibrationRequired: true }],
    equipmentRequirementIds: ["dumbbells"],
    reasonCodes: REASON_CODES,
    section: "main" as const,
    role: "primary_strength" as const,
  };
}

function preparationAssignment(index: number) {
  return {
    assignmentId: `owner-assignment:${index}`,
    exerciseId: "scapular-push-up",
    realizationId: "scapular-push-up:bodyweight",
    sourceEventId: `owner-source-event:${index}`,
    prescriptionRevisionId: `prescription-revision:${index}`,
    sets: 1, reps: "4-8 reps", tempo: "Controlled", restSeconds: 60,
    effort: "Low fatigue",
    doseBlocks: [{ blockId: `activation:${index}`, order: 0, purpose: "technique_quality_work",
      volume: "1 set", target: "4-8 reps", rest: "30-60 seconds", effort: "Low fatigue",
      tempo: "Controlled", load: "Bodyweight", calibrationRequired: false }],
    equipmentRequirementIds: ["stable-upper-limb-support"],
    reasonCodes: ["ASSESSMENT_PREPARATION_DEPENDENCY_PRESERVED"],
    section: "activation" as const, role: "activation" as const,
    preparationCategories: ["activation_control"],
    dependencyIds: ["assessment-dependency:shoulder-control"],
    dependencyReasons: ["Confirmed shoulder control supports low-fatigue preparation."],
  };
}

const exercises = (offset: number) => [
  preparationAssignment(offset),
  assignment(offset + 1, "goblet-squat", { volume: "2 sets", target: "3-6 reps",
    rest: "120-240 seconds between strength sets", effort: "2-4 reps in reserve" }),
  assignment(offset + 2, "dumbbell-romanian-deadlift", { volume: "2 sets", target: "5-10 reps",
    rest: "90-180 seconds between strength sets", effort: "2-3 reps in reserve" }),
  assignment(offset + 3, "dumbbell-bench-press", { volume: "2 sets", target: "5-10 reps",
    rest: "90-180 seconds between strength sets", effort: "2-3 reps in reserve" }),
  assignment(offset + 4, "chest-supported-dumbbell-row", { volume: "2 sets", target: "5-10 reps",
    rest: "90-180 seconds between strength sets", effort: "2-3 reps in reserve" }),
];

const preview: ControlledOwnerV2ProgramPreview = {
  contract: { contractId: "CONTROLLED_OWNER_V2_PROGRAM_PREVIEW", contractVersion: "1.0.0" },
  previewId: "owner-v2-preview:visualfixture",
  userId: "owner-visual-fixture",
  generationCommandId: "owner-v2-generation-command:visualfixture",
  profileId: "owner-profile:visualfixture",
  profileRevisionId: PROFILE_REVISION_ID,
  sourceProductSnapshotId: "product-snapshot:visualfixture",
  sourceProductRevisionId: "product-revision:visualfixture",
  activeLegacyProgramRevisionId: "legacy-program:visualfixture",
  engineVersion: "training-engine-v2@visual-fixture",
  policyVersions: ["controlled-owner-policy@visual-fixture", "prescription-policy-v1@visual-fixture"],
  completeProgramSnapshot: [],
  productProjection: {
    projectionContract: { contractId: "CONTROLLED_OWNER_PRODUCT_PROJECTION", contractVersion: "1.0.0" },
    goal: "strength",
    mode: "develop",
    weekObjectiveIds: [
      `week-v1_1:objective:owner-strength-responsibility:knee_dominant_lower_body:${PROFILE_REVISION_ID}`,
      `week-v1_1:objective:owner-strength-responsibility:hinge_lower_body:${PROFILE_REVISION_ID}`,
      `week-v1_1:objective:owner-strength-responsibility:upper_body_push:${PROFILE_REVISION_ID}`,
      `week-v1_1:objective:owner-strength-responsibility:upper_body_pull:${PROFILE_REVISION_ID}`,
    ],
    sessions: [{ sessionId: "owner-session:visual-1", opportunityId: "owner-opportunity-1",
      purpose: "strength_development", durationStatus: "unknown", durationMinutes: null,
      availableMinutes: 90, calculatedDuration: { status: "unknown_due_to_setup_transition",
        knownLowerBoundSeconds: 2_400, knownUpperBoundSeconds: null,
        unknownComponents: ["setup:SETUP_DURATION_NOT_EXPLICIT"],
        accountedAssignmentIds: exercises(0).map((entry) => entry.assignmentId), noInventedTime: true },
      exerciseAssignments: exercises(0), practiceModes: ["full", "lighter", "recovery"] },
    { sessionId: "owner-session:visual-2", opportunityId: "owner-opportunity-2",
      purpose: "strength_development", durationStatus: "unknown", durationMinutes: null,
      availableMinutes: 90, calculatedDuration: { status: "unknown_due_to_setup_transition",
        knownLowerBoundSeconds: 2_400, knownUpperBoundSeconds: null,
        unknownComponents: ["setup:SETUP_DURATION_NOT_EXPLICIT"],
        accountedAssignmentIds: exercises(10).map((entry) => entry.assignmentId), noInventedTime: true },
      exerciseAssignments: exercises(10), practiceModes: ["full", "lighter", "recovery"] }],
    unresolvedFacts: ["OWNER_LOAD_SELECTION_PENDING"],
    safetyState: "clear",
    engineVersion: "training-engine-v2@visual-fixture",
    policyVersions: ["controlled-owner-policy@visual-fixture"],
    authoritative: false,
    projectionFingerprint: "projection-fingerprint-visual-fixture",
  },
  unresolvedFacts: ["OWNER_LOAD_SELECTION_PENDING"],
  readinessStatus: "preview_only_unknown_duration",
  safetyState: "clear",
  createdAt: "2026-08-18T06:00:00.000Z",
  counterfactual: true,
  applied: false,
  stale: false,
  previewFingerprint: "preview-fingerprint-visual-fixture",
};

const styles = new Proxy({} as Record<string, string>, {
  get: (_target, property) => String(property),
});

process.stdout.write(renderToStaticMarkup(createElement(OwnerPreviewPresentation, { preview, styles,
  actions: createElement("p", { className: styles.warning }, "Application is unavailable in preview mode.") })));
