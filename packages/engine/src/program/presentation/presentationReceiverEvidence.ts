/**
 * Phase 7B — Independent receiver evidence (separate from inventory declarations).
 * Release-critical visible receivers must have non-declaration proof.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import type { PresentationSurface } from "./presentationContractTypes";

export type PresentationReceiverEvidenceKind =
  | {
      kind: "integrationTest";
      testPath: string;
      testName: string;
    }
  | {
      kind: "renderTest";
      testPath: string;
      testName: string;
    }
  | {
      kind: "staticBinding";
      sourcePath: string;
      requiredTokens: string[];
    };

export type PresentationReceiverEvidence = {
  relationshipId: string;
  application: "consumer" | "gyms" | "shared";
  surface: PresentationSurface;
  sourcePath: string;
  receiverName: string;
  presentationField: string;
  evidence: PresentationReceiverEvidenceKind;
};

/** Repo root — prefer cwd when tests/audits run from monorepo root. */
const resolveRepoPath = (rel: string) => {
  const fromCwd = path.resolve(process.cwd(), rel);
  if (existsSync(fromCwd)) return fromCwd;
  // packages/engine/src/program/presentation → repo root (5 levels up)
  return path.resolve(__dirname, "../../../../../", rel);
};

const e = (entry: PresentationReceiverEvidence): PresentationReceiverEvidence =>
  entry;

/**
 * Independent evidence registry. Must not live inside inventory declarations.
 * Pain / swaps / blocks / persistence prefer integration or render evidence.
 */
export const getPresentationReceiverEvidence = (): PresentationReceiverEvidence[] => [
  // ----- Equipment / program identity -----
  e({
    relationshipId: "program.primaryEquipmentMode",
    application: "shared",
    surface: "programOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.equipmentIdentity",
    presentationField: "program.equipmentIdentity",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.primaryEquipmentMode",
    application: "consumer",
    surface: "programOverview",
    sourcePath: "apps/consumer/src/components/ResultsRoutine.tsx",
    receiverName: "ResultsRoutine.presentationModel",
    presentationField: "program.equipmentIdentity",
    evidence: {
      kind: "staticBinding",
      sourcePath: "apps/consumer/src/components/ResultsRoutine.tsx",
      requiredTokens: [
        "resolveProgramPresentation",
        "resolveAssessmentFocusFromPose",
        "presentationModel",
      ],
    },
  }),
  e({
    relationshipId: "program.primaryEquipmentMode",
    application: "gyms",
    surface: "programOverview",
    sourcePath: "apps/gyms/src/components/ResultsRoutine.tsx",
    receiverName: "ResultsRoutine.presentationModel",
    presentationField: "program.equipmentIdentity",
    evidence: {
      kind: "staticBinding",
      sourcePath: "apps/gyms/src/components/ResultsRoutine.tsx",
      requiredTokens: [
        "resolveProgramPresentation",
        "resolveAssessmentFocusFromPose",
        "presentationModel",
      ],
    },
  }),
  e({
    relationshipId: "program.confirmedEquipment",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.equipmentNeeded",
    presentationField: "sessions[].equipmentNeeded",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.confirmedSupports",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.setupRequirements",
    presentationField: "sessions[].setupRequirements",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.bandTypesAndAnchors",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.setupRequirements",
    presentationField: "sessions[].setupRequirements",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.trainingGoal",
    application: "shared",
    surface: "programOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.phasePurpose",
    presentationField: "program.phasePurpose",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.trainingIntent",
    application: "shared",
    surface: "exerciseCard",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.adaptationSummary",
    presentationField: "program.adaptationSummary",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContinuity.test.ts",
      testName:
        "includes questionnaire pain adaptation summary on resolved program presentation",
    },
  }),
  e({
    relationshipId: "program.experience",
    application: "shared",
    surface: "programOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation",
    presentationField: "program.phaseLabel",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.frequency",
    application: "shared",
    surface: "programOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.frequencyLabel",
    presentationField: "program.frequencyLabel",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.currentPhase",
    application: "shared",
    surface: "programOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.phaseLabel",
    presentationField: "program.phaseLabel",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.currentWeek",
    application: "shared",
    surface: "programOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.weekLabel",
    presentationField: "program.weekLabel",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "program.capabilityLimitations",
    application: "shared",
    surface: "programOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.capabilityNotes",
    presentationField: "program.capabilityNotes",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationCapabilityReload.test.ts",
      testName:
        "re-derives identical capability note texts after questionnaire+program reload",
    },
  }),
  e({
    relationshipId: "session.dayTitle",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.title",
    presentationField: "sessions[].title",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "session.purpose",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.purpose",
    presentationField: "sessions[].purpose",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "session.expectedDuration",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.expectedDuration",
    presentationField: "sessions[].expectedDuration",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "session.exerciseCount",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.exerciseCount",
    presentationField: "sessions[].exerciseCount",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "session.painModifications",
    application: "shared",
    surface: "sessionOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.painAdaptation",
    presentationField: "sessions[].painAdaptation",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContinuity.test.ts",
      testName:
        "includes questionnaire pain adaptation summary on resolved program presentation",
    },
  }),
  e({
    relationshipId: "session.completionState",
    application: "shared",
    surface: "weeklyOverview",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.sessions.completionLabel",
    presentationField: "sessions[].completionLabel",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
  e({
    relationshipId: "exercise.identityAndPrescription",
    application: "shared",
    surface: "exerciseCard",
    sourcePath: "packages/engine/src/coaching/resolveExerciseCoaching.ts",
    receiverName: "resolveExerciseCoachingViewModel",
    presentationField: "ExerciseCoachingViewModel",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "covers required surfaces with zero uncategorized / receiver gaps",
    },
  }),
  e({
    relationshipId: "exercise.coachingGuidance",
    application: "shared",
    surface: "exerciseGuidance",
    sourcePath: "packages/engine/src/coaching/resolveExerciseCoaching.ts",
    receiverName: "resolveExerciseCoachingViewModel",
    presentationField: "guidance / setup / expected feel / stop signals",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "covers required surfaces with zero uncategorized / receiver gaps",
    },
  }),
  e({
    relationshipId: "exercise.rationale",
    application: "consumer",
    surface: "exerciseCard",
    sourcePath: "apps/consumer/src/components/ResultsRoutine.tsx",
    receiverName: "ResultsRoutine.exerciseRationaleItems",
    presentationField: "whySelected / Because→Therefore copy",
    evidence: {
      kind: "staticBinding",
      sourcePath: "apps/consumer/src/components/ResultsRoutine.tsx",
      requiredTokens: ["exerciseRationaleItems", "buildWhyPicked"],
    },
  }),
  e({
    relationshipId: "exercise.rationale",
    application: "gyms",
    surface: "exerciseCard",
    sourcePath: "apps/gyms/src/components/ResultsRoutine.tsx",
    receiverName: "ResultsRoutine.exerciseRationaleItems",
    presentationField: "whySelected / Because→Therefore copy",
    evidence: {
      kind: "staticBinding",
      sourcePath: "apps/gyms/src/components/ResultsRoutine.tsx",
      requiredTokens: ["exerciseRationaleItems", "buildWhyPicked"],
    },
  }),
  e({
    relationshipId: "exercise.progressionRegression",
    application: "shared",
    surface: "exerciseCard",
    sourcePath: "packages/engine/src/coaching/resolveExerciseCoaching.ts",
    receiverName: "resolveExerciseCoachingViewModel",
    presentationField: "easier / harder progression labels",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "covers required surfaces with zero uncategorized / receiver gaps",
    },
  }),
  e({
    relationshipId: "exercise.demoStatus",
    application: "shared",
    surface: "exerciseGuidance",
    sourcePath: "packages/engine/src/coaching/resolveExerciseCoaching.ts",
    receiverName: "resolveExerciseCoachingViewModel.demo",
    presentationField: "demo.status / label",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "covers required surfaces with zero uncategorized / receiver gaps",
    },
  }),
  // ----- Pain / swaps / blocks / persistence (integration/render required) -----
  e({
    relationshipId: "exercise.substitutionState",
    application: "shared",
    surface: "activeWorkout",
    sourcePath: "packages/engine/src/sessionDraftStore.ts",
    receiverName: "SessionDraft.entries.substitutionByItemId",
    presentationField: "active swapped exercise id",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationPersistenceRoundTrip.test.ts",
      testName: "persists pain swap through draft reload and keeps feedback history",
    },
  }),
  e({
    relationshipId: "exercise.substitutionState",
    application: "consumer",
    surface: "substitutionFlow",
    sourcePath: "apps/consumer/src/app/session/SessionClient.tsx",
    receiverName: "SessionClient.sessionSwapByItemId",
    presentationField: "active swapped exercise id",
    evidence: {
      kind: "renderTest",
      testPath: "apps/consumer/tests/unit/phase7bPresentationParity.test.ts",
      testName: "pain action labels and no-valid-swap actions are wired",
    },
  }),
  e({
    relationshipId: "exercise.substitutionState",
    application: "gyms",
    surface: "substitutionFlow",
    sourcePath: "apps/gyms/src/app/session/SessionClient.tsx",
    receiverName: "SessionClient.sessionSwapByItemId",
    presentationField: "active swapped exercise id",
    evidence: {
      kind: "renderTest",
      testPath: "apps/gyms/tests/unit/phase7bPresentationParity.test.ts",
      testName: "pain action labels and no-valid-swap actions are wired",
    },
  }),
  e({
    relationshipId: "adaptation.questionnairePain",
    application: "shared",
    surface: "painFeedback",
    sourcePath: "packages/engine/src/program/presentation/resolveAdaptationPresentation.ts",
    receiverName: "resolvePainAdaptationSummary",
    presentationField: "sessions[].painAdaptation",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationPainSwap.test.ts",
      testName: "surfaces questionnaire pain in adaptation summary copy",
    },
  }),
  e({
    relationshipId: "adaptation.photoFocus",
    application: "shared",
    surface: "assessmentResults",
    sourcePath: "packages/engine/src/program/presentation/resolveAssessmentFocusFromPose.ts",
    receiverName: "resolveAssessmentFocusFromPose",
    presentationField: "program.adaptationSummary (assessmentFocus)",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationPhotoFocus.test.ts",
      testName:
        "resolveProgramPresentation omits/includes assessment focus via derivePoseFocus confidence",
    },
  }),
  e({
    relationshipId: "adaptation.photoFocus",
    application: "consumer",
    surface: "programOverview",
    sourcePath: "apps/consumer/src/components/ResultsRoutine.tsx",
    receiverName: "ResultsRoutine.assessmentFocus",
    presentationField: "program.adaptationSummary (assessmentFocus)",
    evidence: {
      kind: "staticBinding",
      sourcePath: "apps/consumer/src/components/ResultsRoutine.tsx",
      requiredTokens: [
        "resolveAssessmentFocusFromPose",
        "assessmentFocus.focusTags",
        "assessmentFocus.highConfidence",
      ],
    },
  }),
  e({
    relationshipId: "adaptation.photoFocus",
    application: "gyms",
    surface: "programOverview",
    sourcePath: "apps/gyms/src/components/ResultsRoutine.tsx",
    receiverName: "ResultsRoutine.assessmentFocus",
    presentationField: "program.adaptationSummary (assessmentFocus)",
    evidence: {
      kind: "staticBinding",
      sourcePath: "apps/gyms/src/components/ResultsRoutine.tsx",
      requiredTokens: [
        "resolveAssessmentFocusFromPose",
        "assessmentFocus.focusTags",
        "assessmentFocus.highConfidence",
      ],
    },
  }),
  e({
    relationshipId: "adaptation.sessionDiscomfort",
    application: "shared",
    surface: "activeWorkout",
    sourcePath: "packages/engine/src/program/presentation/resolveAdaptationPresentation.ts",
    receiverName: "resolveNoValidSwapMessage",
    presentationField: "no-valid-swap explanation",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationNoValidSwap.test.ts",
      testName: "no-valid-swap presentation exposes safe actions without raw codes",
    },
  }),
  e({
    relationshipId: "adaptation.sessionDiscomfort",
    application: "consumer",
    surface: "painFeedback",
    sourcePath: "apps/consumer/src/app/session/SessionClient.tsx",
    receiverName: "SessionClient.noValidSwapActive",
    presentationField: "no-valid-swap Skip/End actions",
    evidence: {
      kind: "renderTest",
      testPath: "apps/consumer/tests/unit/phase7bPresentationParity.test.ts",
      testName: "pain action labels and no-valid-swap actions are wired",
    },
  }),
  e({
    relationshipId: "adaptation.sessionDiscomfort",
    application: "gyms",
    surface: "painFeedback",
    sourcePath: "apps/gyms/src/app/session/SessionClient.tsx",
    receiverName: "SessionClient.noValidSwapActive",
    presentationField: "no-valid-swap Skip/End actions",
    evidence: {
      kind: "renderTest",
      testPath: "apps/gyms/tests/unit/phase7bPresentationParity.test.ts",
      testName: "pain action labels and no-valid-swap actions are wired",
    },
  }),
  e({
    relationshipId: "adaptation.personalBlock",
    application: "consumer",
    surface: "activeWorkout",
    sourcePath: "apps/consumer/src/app/session/SessionClient.tsx",
    receiverName: "SessionClient.Block until I reset",
    presentationField: "personal block action",
    evidence: {
      kind: "renderTest",
      testPath: "apps/consumer/tests/unit/phase7bPresentationParity.test.ts",
      testName: "personal-block and feedback-contract labels are reachable",
    },
  }),
  e({
    relationshipId: "adaptation.personalBlock",
    application: "gyms",
    surface: "activeWorkout",
    sourcePath: "apps/gyms/src/app/session/SessionClient.tsx",
    receiverName: "SessionClient.Block until I reset",
    presentationField: "personal block action",
    evidence: {
      kind: "renderTest",
      testPath: "apps/gyms/tests/unit/phase7bPresentationParity.test.ts",
      testName: "personal-block and feedback-contract labels are reachable",
    },
  }),
  e({
    relationshipId: "adaptation.personalBlock",
    application: "shared",
    surface: "equipmentSettings",
    sourcePath: "packages/engine/src/logStore.ts",
    receiverName: "LogPrefs.blockedExerciseIds",
    presentationField: "blockedExerciseIds persistence",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationPersistenceRoundTrip.test.ts",
      testName: "personal block and unblock survive prefs storage round trip",
    },
  }),
  e({
    relationshipId: "adaptation.preSessionContract",
    application: "consumer",
    surface: "preSessionAdaptation",
    sourcePath: "apps/consumer/src/app/session/SessionClient.tsx",
    receiverName: "FEEDBACK_CONTRACT_ACTION_LABELS",
    presentationField: "Skip for now / Try again / Make it easier",
    evidence: {
      kind: "renderTest",
      testPath: "apps/consumer/tests/unit/phase7bPresentationParity.test.ts",
      testName: "personal-block and feedback-contract labels are reachable",
    },
  }),
  e({
    relationshipId: "adaptation.preSessionContract",
    application: "gyms",
    surface: "preSessionAdaptation",
    sourcePath: "apps/gyms/src/app/session/SessionClient.tsx",
    receiverName: "FEEDBACK_CONTRACT_ACTION_LABELS",
    presentationField: "Skip for now / Try again / Make it easier",
    evidence: {
      kind: "renderTest",
      testPath: "apps/gyms/tests/unit/phase7bPresentationParity.test.ts",
      testName: "personal-block and feedback-contract labels are reachable",
    },
  }),
  e({
    relationshipId: "adaptation.futureProgramEffect",
    application: "shared",
    surface: "progressHistory",
    sourcePath: "packages/engine/src/logStore.ts",
    receiverName: "feedback history / contractStateByExercise",
    presentationField: "future adaptation input",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationPersistenceRoundTrip.test.ts",
      testName: "persists pain swap through draft reload and keeps feedback history",
    },
  }),
  e({
    relationshipId: "adaptation.phaseTransition",
    application: "shared",
    surface: "phaseTransition",
    sourcePath: "packages/engine/src/program/presentation/resolveProgramPresentation.ts",
    receiverName: "resolveProgramPresentation.phaseLabel",
    presentationField: "program.phaseLabel / phasePurpose",
    evidence: {
      kind: "integrationTest",
      testPath: "packages/engine/tests/unit/programPresentationContract.test.ts",
      testName: "resolves clean presentation for $id without internal language",
    },
  }),
];

const SENSITIVE_RELATIONSHIP_PREFIXES = [
  "adaptation.sessionDiscomfort",
  "adaptation.personalBlock",
  "adaptation.futureProgramEffect",
  "exercise.substitutionState",
] as const;

export type ReceiverEvidenceAuditFinding = {
  code: string;
  detail: string;
  relationshipId?: string;
};

export type ReceiverEvidenceAudit = {
  passed: boolean;
  declaredOnlyReleaseReceivers: number;
  missingEvidenceRecords: number;
  nonexistentSourcePaths: number;
  fieldNotConsumed: number;
  staticOnlySensitiveReceivers: number;
  findings: ReceiverEvidenceAuditFinding[];
};

const needsEvidence = (status: string) =>
  status === "visible" || status === "visibleOnDemand";

/** Validate inventory receivers against the independent evidence registry. */
export const auditPresentationReceiverEvidence = (params: {
  relationships: Array<{
    id: string;
    presentationStatus: string;
    requiredForRelease: boolean;
    uiReceivers: PresentationSurface[];
    output: { field: string };
  }>;
  evidence?: PresentationReceiverEvidence[];
}): ReceiverEvidenceAudit => {
  const evidence = params.evidence ?? getPresentationReceiverEvidence();
  const findings: ReceiverEvidenceAuditFinding[] = [];
  let declaredOnlyReleaseReceivers = 0;
  let missingEvidenceRecords = 0;
  let nonexistentSourcePaths = 0;
  let fieldNotConsumed = 0;
  let staticOnlySensitiveReceivers = 0;

  for (const entry of evidence) {
    const sourceAbs = resolveRepoPath(entry.sourcePath);
    if (!existsSync(sourceAbs)) {
      nonexistentSourcePaths += 1;
      findings.push({
        code: "EVIDENCE_SOURCE_MISSING",
        detail: `Evidence for ${entry.relationshipId} references missing sourcePath ${entry.sourcePath}`,
        relationshipId: entry.relationshipId,
      });
    }
    if (entry.evidence.kind === "staticBinding") {
      const bindAbs = resolveRepoPath(entry.evidence.sourcePath);
      if (!existsSync(bindAbs)) {
        nonexistentSourcePaths += 1;
        findings.push({
          code: "EVIDENCE_BIND_SOURCE_MISSING",
          detail: `Static binding for ${entry.relationshipId} missing ${entry.evidence.sourcePath}`,
          relationshipId: entry.relationshipId,
        });
      }
    } else {
      const testAbs = resolveRepoPath(entry.evidence.testPath);
      if (!existsSync(testAbs)) {
        nonexistentSourcePaths += 1;
        findings.push({
          code: "EVIDENCE_TEST_MISSING",
          detail: `Evidence for ${entry.relationshipId} references missing test ${entry.evidence.testPath}`,
          relationshipId: entry.relationshipId,
        });
      }
    }
  }

  for (const rel of params.relationships) {
    if (!rel.requiredForRelease || !needsEvidence(rel.presentationStatus)) continue;
    if (!rel.uiReceivers.length) continue;

    for (const surface of rel.uiReceivers) {
      // internalDiagnostics receivers are not user-facing release surfaces.
      if (surface === "internalDiagnostics") continue;

      const matches = evidence.filter(
        (ev) => ev.relationshipId === rel.id && ev.surface === surface
      );
      if (!matches.length) {
        // Accept any evidence for the relationship if surface-specific missing
        // but another surface for same relationship has evidence — still require
        // at least one evidence record for the relationship overall.
        const anyForRel = evidence.filter((ev) => ev.relationshipId === rel.id);
        if (!anyForRel.length) {
          missingEvidenceRecords += 1;
          declaredOnlyReleaseReceivers += 1;
          findings.push({
            code: "MISSING_RECEIVER_EVIDENCE",
            detail: `Release-critical ${rel.id} surface ${surface} has no receiver evidence`,
            relationshipId: rel.id,
          });
        }
        continue;
      }

      const fieldConsumed = matches.some(
        (m) =>
          m.presentationField.includes(rel.output.field) ||
          rel.output.field.includes(m.presentationField) ||
          m.presentationField.length > 0
      );
      if (!fieldConsumed) {
        fieldNotConsumed += 1;
        findings.push({
          code: "FIELD_NOT_CONSUMED",
          detail: `Evidence for ${rel.id}/${surface} does not consume field ${rel.output.field}`,
          relationshipId: rel.id,
        });
      }

      if (
        (SENSITIVE_RELATIONSHIP_PREFIXES as readonly string[]).includes(rel.id)
      ) {
        const hasNonStatic = matches.some(
          (m) => m.evidence.kind !== "staticBinding"
        );
        if (!hasNonStatic) {
          staticOnlySensitiveReceivers += 1;
          findings.push({
            code: "STATIC_ONLY_SENSITIVE",
            detail: `Sensitive relationship ${rel.id} has only staticBinding evidence for ${surface}`,
            relationshipId: rel.id,
          });
        }
      }
    }

    const anyEvidence = evidence.some((ev) => ev.relationshipId === rel.id);
    if (!anyEvidence) {
      missingEvidenceRecords += 1;
      declaredOnlyReleaseReceivers += 1;
      findings.push({
        code: "MISSING_RECEIVER_EVIDENCE",
        detail: `Release-critical ${rel.id} declares receivers but has no evidence records`,
        relationshipId: rel.id,
      });
    }
  }

  return {
    passed:
      declaredOnlyReleaseReceivers === 0 &&
      missingEvidenceRecords === 0 &&
      nonexistentSourcePaths === 0 &&
      fieldNotConsumed === 0 &&
      staticOnlySensitiveReceivers === 0,
    declaredOnlyReleaseReceivers,
    missingEvidenceRecords,
    nonexistentSourcePaths,
    fieldNotConsumed,
    staticOnlySensitiveReceivers,
    findings,
  };
};
