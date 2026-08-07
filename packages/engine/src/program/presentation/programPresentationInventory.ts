/**
 * Phase 7B — Canonical relational inventory.
 * Every important program relationship is categorized with a presentation status.
 */

import type { PresentationRelationship } from "./presentationContractTypes";

const rel = (
  entry: PresentationRelationship
): PresentationRelationship => entry;

/** Full machine-readable presentation inventory (deterministic order). */
export const getProgramPresentationInventory = (): PresentationRelationship[] => [
  // ----- Program identity -----
  rel({
    id: "program.primaryEquipmentMode",
    systemInput: {
      source: "questionnaire",
      field: "equipment",
      meaning: "Confirmed training tools available to the user",
    },
    giver: {
      module: "program/equipmentMode",
      functionOrPolicy: "resolvePrimaryProgramEquipmentMode",
      responsibility: "Resolve first-class equipment identity",
    },
    output: {
      field: "program.equipmentIdentity",
      meaning: "User-facing equipment identity label (gym, dumbbells, bands, bodyweight, mixed home)",
    },
    uiReceivers: ["programOverview", "weeklyOverview", "equipmentSettings"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.equipment",
      futureEffect: "Drives mode-specific generation and presentation labels",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
    fallbackBehavior: "Show Bodyweight when equipment is empty or unrecognized",
  }),
  rel({
    id: "program.confirmedEquipment",
    systemInput: {
      source: "questionnaire",
      field: "equipment",
      meaning: "Normalized equipment tokens",
    },
    giver: {
      module: "equipment",
      functionOrPolicy: "normalizeEquipmentSelection",
      responsibility: "Expand gym and normalize available equipment set",
    },
    output: {
      field: "sessions[].equipmentNeeded",
      meaning: "Equipment required for the week and each session",
    },
    uiReceivers: ["programOverview", "sessionOverview", "activeWorkout"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.equipment",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "program.confirmedSupports",
    systemInput: {
      source: "questionnaire",
      field: "equipment (bench, pullup_bar, foam_roller)",
      meaning: "Confirmed support surfaces",
    },
    giver: {
      module: "program/equipmentCapabilities",
      responsibility: "Derive support capability flags",
    },
    output: {
      field: "sessions[].setupRequirements",
      meaning: "Bench, pull-up bar, or other supports needed today",
    },
    uiReceivers: ["sessionOverview", "exerciseCard", "exerciseGuidance"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.equipment",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
    fallbackBehavior: "Omit unconfirmed support claims from coaching setup",
  }),
  rel({
    id: "program.bandTypesAndAnchors",
    systemInput: {
      source: "questionnaire",
      field: "bandSetup",
      meaning: "Band type and confirmed anchor heights",
    },
    giver: {
      module: "program/bandSetup",
      responsibility: "Resolve band setup lane and legal band exercises",
    },
    output: {
      field: "sessions[].setupRequirements (anchor sequence)",
      meaning: "Anchor-height sequence and band setup notes",
    },
    uiReceivers: ["sessionOverview", "exerciseGuidance", "equipmentSettings"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.bandSetup",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
    fallbackBehavior: "No-anchor / loop-only lanes omit fixed-anchor claims",
  }),
  rel({
    id: "program.trainingGoal",
    systemInput: {
      source: "questionnaire",
      field: "goals",
      meaning: "User training goal text",
    },
    giver: {
      module: "program",
      functionOrPolicy: "buildSelectionContext / intentProfile",
      responsibility: "Bias selection toward goal-aligned patterns",
    },
    output: {
      field: "program.adaptationSummary (goal influence)",
      meaning: "Goal informs program emphasis without diagnostic claims",
    },
    uiReceivers: ["questionnaire", "programOverview"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.goals",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
  }),
  rel({
    id: "program.trainingIntent",
    systemInput: {
      source: "questionnaire",
      field: "trainingIntent",
      meaning: "build | maintain | rehab intent",
    },
    giver: {
      module: "program/trainingIntent",
      responsibility: "Adjust ladder and progression aggressiveness",
    },
    output: {
      field: "progression targets / maintain language",
      meaning: "Intent-aware progression wording",
    },
    uiReceivers: ["exerciseCard", "preSessionAdaptation", "progressHistory"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.trainingIntent",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
  }),
  rel({
    id: "program.experience",
    systemInput: {
      source: "questionnaire",
      field: "experience",
      meaning: "Beginner / Intermediate / Advanced",
    },
    giver: {
      module: "program",
      responsibility: "Volume contracts and progression difficulty",
    },
    output: {
      field: "session volume and progression targets",
      meaning: "Experience-appropriate session structure",
    },
    uiReceivers: ["programOverview", "sessionOverview"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.experience",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
  }),
  rel({
    id: "program.frequency",
    systemInput: {
      source: "questionnaire",
      field: "daysPerWeek",
      meaning: "Training days per week",
    },
    giver: {
      module: "program",
      functionOrPolicy: "buildSplitTemplates / getWeeklyCoverageContract",
      responsibility: "Author weekly day structure and coverage quotas",
    },
    output: {
      field: "program.frequencyLabel / weeklyStructure",
      meaning: "Days-per-week label and ordered day titles",
    },
    uiReceivers: ["programOverview", "weeklyOverview"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "Program.daysPerWeek / Program.week",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "program.currentPhase",
    systemInput: {
      source: "progressionState",
      field: "phaseIndex",
      meaning: "Current curriculum phase",
    },
    giver: {
      module: "phases",
      functionOrPolicy: "getPhaseMetaByIndex / formatPhaseName",
      responsibility: "Canonical phase label and purpose",
    },
    output: {
      field: "program.phaseLabel / phasePurpose",
      meaning: "User-facing phase name and one-sentence purpose",
    },
    uiReceivers: ["programOverview", "phaseTransition", "progressHistory"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "Program.phaseIndex / phaseTransitionState",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "program.currentWeek",
    systemInput: {
      source: "progressionState",
      field: "weekIndex / totalWeekIndex",
      meaning: "Week within phase and overall plan",
    },
    giver: {
      module: "program",
      responsibility: "Track week indices on generated program",
    },
    output: {
      field: "program.weekLabel",
      meaning: "Current week label",
    },
    uiReceivers: ["programOverview", "weeklyOverview"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "Program.weekIndex / totalWeekIndex",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "program.templateVersion",
    systemInput: {
      source: "engine",
      field: "PROGRAM_TEMPLATE_VERSION",
      meaning: "Generated program composition version",
    },
    giver: {
      module: "program",
      responsibility: "Stamp template version on generated programs",
    },
    output: {
      field: "program.templateVersion",
      meaning: "Compatibility version for stored programs",
    },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "Program.templateVersion",
    },
    presentationStatus: "internalOnly",
    requiredForRelease: true,
    notes: "Presentation metadata alone must not bump this version",
  }),
  rel({
    id: "program.capabilityLimitations",
    systemInput: {
      source: "qualityGate / equipmentCapabilities",
      field: "capabilityLimitations",
      meaning: "Honest limits when equipment or pain blocks ideal coverage",
    },
    giver: {
      module: "program/qualityGate",
      functionOrPolicy: "evaluateProgramQuality",
      responsibility: "Classify capability limitations separately from hard failures",
    },
    output: {
      field: "program.capabilityNotes",
      meaning: "Plain-language limitation notes",
    },
    uiReceivers: ["programOverview", "sessionOverview"],
    persistenceEffect: {
      kind: "temporary",
      location: "Program.qualityEvaluation (non-enumerable)",
      futureEffect: "Guides user-safe limitation copy without leaking reason codes",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
    fallbackBehavior: "Omit when no capability limitations exist",
  }),
  rel({
    id: "program.regenerationReason",
    systemInput: {
      source: "qualityGate",
      field: "recoveryAttempted / fallbackUsed",
      meaning: "Whether generation recovered or fell back",
    },
    giver: {
      module: "program/qualityGate/recoverProgramQuality",
      responsibility: "Bounded deterministic recovery",
    },
    output: {
      field: "internal recovery metadata",
      meaning: "Diagnostics for why a seed offset was used",
    },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: {
      kind: "temporary",
      location: "qualityEvaluation.recovery*",
    },
    presentationStatus: "internalOnly",
    requiredForRelease: true,
  }),

  // ----- Session identity -----
  rel({
    id: "session.dayTitle",
    systemInput: {
      source: "split templates",
      field: "day.title",
      meaning: "Authored day identity",
    },
    giver: {
      module: "program",
      functionOrPolicy: "buildSplitTemplates",
      responsibility: "Assign mode-owned day titles",
    },
    output: {
      field: "sessions[].title",
      meaning: "Session title shown in week and workout UI",
    },
    uiReceivers: ["weeklyOverview", "sessionOverview", "activeWorkout"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "ProgramDay.title",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "session.purpose",
    systemInput: {
      source: "day title + focusTags",
      field: "ProgramDay.focusTags / title",
      meaning: "Movement emphasis for the day",
    },
    giver: {
      module: "program/presentation",
      functionOrPolicy: "resolveSessionPurpose",
      responsibility: "One-sentence session purpose without inventing claims",
    },
    output: {
      field: "sessions[].purpose",
      meaning: "Short purpose for the session",
    },
    uiReceivers: ["sessionOverview", "weeklyOverview"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "visible",
    requiredForRelease: true,
    fallbackBehavior: "Derive from day title when focus tags are empty",
  }),
  rel({
    id: "session.expectedDuration",
    systemInput: {
      source: "routine volume",
      field: "exercise count + section doses",
      meaning: "Estimated session length",
    },
    giver: {
      module: "program/presentation",
      functionOrPolicy: "estimateSessionDuration",
      responsibility: "Canonical duration label from routine structure",
    },
    output: {
      field: "sessions[].expectedDuration",
      meaning: "Expected duration string",
    },
    uiReceivers: ["sessionOverview", "weeklyOverview"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "session.exerciseCount",
    systemInput: {
      source: "ProgramDay.routine",
      field: "routine.length (main+accessory)",
      meaning: "Countable work items",
    },
    giver: {
      module: "program/presentation",
      responsibility: "Count executable routine items",
    },
    output: {
      field: "sessions[].exerciseCount",
      meaning: "Exercise count for the session",
    },
    uiReceivers: ["sessionOverview", "weeklyOverview"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "ProgramDay.routine",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "session.painModifications",
    systemInput: {
      source: "questionnaire.painAreas + sessionAdaptation",
      field: "painAreas / sessionAdaptation",
      meaning: "Pain-aware adjustments applied to this week",
    },
    giver: {
      module: "program",
      responsibility: "Pain-aware selection and sessionAdaptation notes",
    },
    output: {
      field: "sessions[].painAdaptation / program.adaptationSummary",
      meaning: "Plain-language pain adaptation message",
    },
    uiReceivers: ["programOverview", "sessionOverview", "preSessionAdaptation"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "Program.sessionAdaptation",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
    fallbackBehavior: "Omit when pain-free and no adaptation notes",
  }),
  rel({
    id: "session.completionState",
    systemInput: {
      source: "programProgress",
      field: "completedDayIndices",
      meaning: "Which days are completed",
    },
    giver: {
      module: "programProgress",
      responsibility: "Track day completion",
    },
    output: {
      field: "sessions[].completionLabel",
      meaning: "Completed / not started labels",
    },
    uiReceivers: ["weeklyOverview", "progressHistory"],
    persistenceEffect: {
      kind: "progressionState",
      location: "ProgramProgress.completedDayIndices",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),

  // ----- Exercise execution -----
  rel({
    id: "exercise.identityAndPrescription",
    systemInput: {
      source: "ProgramRoutineItem + catalog",
      field: "exerciseId / sets / reps / rest",
      meaning: "Selected exercise and dose",
    },
    giver: {
      module: "coaching/resolveExerciseCoaching",
      responsibility: "Presentation-safe exercise card fields",
    },
    output: {
      field: "ExerciseCoachingViewModel",
      meaning: "Name, prescription, cue, setup, feel, stop signals",
    },
    uiReceivers: ["exerciseCard", "exerciseGuidance", "exerciseDetails", "activeWorkout"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "ProgramRoutineItem",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
  }),
  rel({
    id: "exercise.roleTruth",
    systemInput: {
      source: "selectionDebug / slotRoles",
      field: "slotKind / movement role",
      meaning: "Required movement role for the slot",
    },
    giver: {
      module: "program/*ProgramContract",
      functionOrPolicy: "classifyGymMovementRoleTruth (and mode analogs)",
      responsibility: "Role-truth classification for quality",
    },
    output: {
      field: "internal role truth + swap eligibility",
      meaning: "Ensures swaps preserve purpose",
    },
    uiReceivers: ["internalDiagnostics", "substitutionFlow"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "ProgramRoutineItem.selectionDebug",
    },
    presentationStatus: "internalOnly",
    requiredForRelease: true,
    notes: "Surfaced to users only as purpose/why language, never raw truth enums",
  }),
  rel({
    id: "exercise.coachingGuidance",
    systemInput: {
      source: "coaching registry",
      field: "ExerciseCoachingContent",
      meaning: "Canonical coaching copy",
    },
    giver: {
      module: "coaching",
      functionOrPolicy: "resolveExerciseCoachingViewModel",
      responsibility: "Capability-filtered coaching presentation",
    },
    output: {
      field: "guidance / setup / expected feel / stop signals",
      meaning: "User-facing coaching",
    },
    uiReceivers: ["exerciseGuidance", "exerciseDetails", "exerciseCard"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
  }),
  rel({
    id: "exercise.rationale",
    systemInput: {
      source: "prescriptionRationale / sourceObservation",
      field: "rationale / sourceObservation",
      meaning: "Why this exercise was selected",
    },
    giver: {
      module: "program/prescriptionRationale",
      responsibility: "Attach why/cue/easier/harder/stop",
    },
    output: {
      field: "whySelected / Because→Therefore copy",
      meaning: "Plain selection rationale when present",
    },
    uiReceivers: ["exerciseCard", "exerciseDetails", "programOverview"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "ProgramRoutineItem.rationale / selectionDebug.sourceObservation",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
    fallbackBehavior: "Omit when no rationale was authored",
  }),
  rel({
    id: "exercise.progressionRegression",
    systemInput: {
      source: "ladderState + coaching registry",
      field: "progressionId / regressionId / progressionTarget",
      meaning: "Next harder or easier target",
    },
    giver: {
      module: "coaching + ladderAdvancement",
      responsibility: "Canonical progression target labels",
    },
    output: {
      field: "progression / regression presentation",
      meaning: "What to aim for next or easier fallback",
    },
    uiReceivers: ["exerciseCard", "exerciseDetails", "progressHistory"],
    persistenceEffect: {
      kind: "progressionState",
      location: "LadderState / coaching registry refs",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
  }),
  rel({
    id: "exercise.substitutionState",
    systemInput: {
      source: "session draft + LogPrefs",
      field: "substitutionByExercise / sessionSwapByItemId",
      meaning: "Active replacement for an exercise",
    },
    giver: {
      module: "program",
      functionOrPolicy: "previewPainSubstitutionChoices",
      responsibility: "Role-preserving, equipment-legal swaps",
    },
    output: {
      field: "active substitution on card",
      meaning: "Replacement exercise and confirmation state",
    },
    uiReceivers: ["activeWorkout", "substitutionFlow", "painFeedback"],
    persistenceEffect: {
      kind: "sessionDraft",
      location: "LogPrefs.substitutionByExercise + session draft",
      futureEffect: "Feeds future adaptation when saved with feedback",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
    userAction: "Swap exercise / Make it easier / Skip safely",
    fallbackBehavior: "No-valid-swap explanation + skip/stop; never empty broken picker",
  }),
  rel({
    id: "exercise.demoStatus",
    systemInput: {
      source: "catalog + demo policy",
      field: "videoUrl / demoStatus",
      meaning: "Whether a demo exists",
    },
    giver: {
      module: "coaching/exerciseDemoPolicy",
      responsibility: "Resolve demo availability labels",
    },
    output: {
      field: "demo.status / label",
      meaning: "available | planned | notRequired",
    },
    uiReceivers: ["exerciseGuidance", "exerciseDetails"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
    notes: "Planned videos are deferred content, not fake availability",
  }),

  // ----- Adaptation -----
  rel({
    id: "adaptation.questionnairePain",
    systemInput: {
      source: "questionnaire",
      field: "painAreas",
      meaning: "Reported pain regions at intake",
    },
    giver: {
      module: "program",
      functionOrPolicy: "painContraindications + intent avoidPatterns",
      responsibility: "Safer initial selection and loading",
    },
    output: {
      field: "adaptationSummary (reportedPain)",
      meaning: "Program responded to reported pain",
    },
    uiReceivers: ["assessmentResults", "programOverview", "sessionOverview"],
    persistenceEffect: {
      kind: "questionnaire",
      location: "QuestionnaireData.painAreas",
      futureEffect: "Continues to constrain generation until questionnaire updates",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
    userAction: "Update pain answers in questionnaire/settings when status changes",
  }),
  rel({
    id: "adaptation.photoFocus",
    systemInput: {
      source: "assessment / pose analysis",
      field: "pose focus tags (confidence-qualified)",
      meaning: "Photo-informed emphasis areas",
    },
    giver: {
      module: "engine/poseFocus + assessment",
      responsibility: "Confidence-qualified focus tags and intervention intent",
    },
    output: {
      field: "adaptationSummary (assessmentFocus)",
      meaning: "Broad emphasis reason without diagnostic claims",
    },
    uiReceivers: ["assessmentResults", "programOverview", "exerciseDetails"],
    persistenceEffect: {
      kind: "assessment",
      location: "assessmentHistory / focusTagLifecycle",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
    fallbackBehavior: "Low confidence → no unsupported adaptation claim",
  }),
  rel({
    id: "adaptation.sessionDiscomfort",
    systemInput: {
      source: "active workout",
      field: "pain report modal (level, location, notes)",
      meaning: "In-session discomfort report",
    },
    giver: {
      module: "session UI + program substitution policy",
      responsibility: "Record pain feedback and offer safer actions",
    },
    output: {
      field: "pain feedback + optional swap/skip",
      meaning: "Immediate adaptation choice",
    },
    uiReceivers: ["painFeedback", "activeWorkout", "substitutionFlow"],
    persistenceEffect: {
      kind: "exerciseLog",
      location: "ExerciseLog pain fields + feedbackSummaryByExercise",
      futureEffect: "Triggers pre-session contract and future selection constraints",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
    userAction: "Report discomfort; Make it easier; Swap; Skip safely; Stop session",
  }),
  rel({
    id: "adaptation.personalBlock",
    systemInput: {
      source: "user preference",
      field: "blockedExerciseIds",
      meaning: "Personal equipment or preference blocks",
    },
    giver: {
      module: "program",
      functionOrPolicy: "blockedExerciseIds hard-filter + quality recovery preserve",
      responsibility: "Exclude blocked exercises from all pools and recovery",
    },
    output: {
      field: "program without blocked exercises",
      meaning: "Blocked IDs never appear until reset",
    },
    uiReceivers: ["activeWorkout", "equipmentSettings"],
    persistenceEffect: {
      kind: "feedbackHistory",
      location: "LogPrefs.blockedExerciseIds",
      futureEffect: "Survives regeneration and quality-gate recovery",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
    userAction: "Remove from my program / Block until reset; Unblock in Settings",
  }),
  rel({
    id: "adaptation.preSessionContract",
    systemInput: {
      source: "recent logs",
      field: "pain/difficulty/completion triggers",
      meaning: "Flagged exercises needing a pre-session decision",
    },
    giver: {
      module: "program/feedbackContract",
      functionOrPolicy: "computeFlaggedExercises / applyFeedbackContractAction",
      responsibility: "Sacrifice/Test/Modify policy (internal enums)",
    },
    output: {
      field: "pre-session adaptation prompt (plain labels)",
      meaning: "User chooses reduce/skip, keep & retest, or easier variation",
    },
    uiReceivers: ["preSessionAdaptation", "activeWorkout"],
    persistenceEffect: {
      kind: "feedbackHistory",
      location: "feedbackSummaryByExercise / contractStateByExercise / retest queue",
    },
    presentationStatus: "visible",
    requiredForRelease: true,
    userAction: "Choose plain-language adaptation action",
    notes: "UI must never show raw sacrifice/test/modify labels",
  }),
  rel({
    id: "adaptation.futureProgramEffect",
    systemInput: {
      source: "logs + feedback + blocks + substitutions",
      field: "aggregated feedback summaries",
      meaning: "History that shapes the next generation",
    },
    giver: {
      module: "program + ladderAdvancement",
      responsibility: "Maintain, regress, defer, block, or progress",
    },
    output: {
      field: "next-session card / progression prompt",
      meaning: "Future workout reflects prior feedback",
    },
    uiReceivers: ["preSessionAdaptation", "progressHistory", "exerciseCard"],
    persistenceEffect: {
      kind: "progressionState",
      location: "LadderState + feedback summaries + LogPrefs",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
  }),
  rel({
    id: "adaptation.phaseTransition",
    systemInput: {
      source: "phase gating",
      field: "phaseTransitionState / phaseHistory",
      meaning: "Eligibility to advance phase",
    },
    giver: {
      module: "program/phaseGatingEvaluator",
      responsibility: "Deterministic phase advance/hold",
    },
    output: {
      field: "phase transition explanation",
      meaning: "What stayed vs what changes",
    },
    uiReceivers: ["phaseTransition", "progressHistory", "programOverview"],
    persistenceEffect: {
      kind: "storedProgram",
      location: "Program.phaseHistory / phaseTransitionState",
    },
    presentationStatus: "visibleOnDemand",
    requiredForRelease: true,
  }),

  // ----- Internal systems -----
  rel({
    id: "internal.selectionScores",
    systemInput: {
      source: "selection engine",
      field: "candidate scores",
      meaning: "Ranking inputs for exercise choice",
    },
    giver: {
      module: "program/selectionScore",
      responsibility: "Score candidates deterministically",
    },
    output: { field: "selectionDebug scores", meaning: "Internal ranking" },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: {
      kind: "temporary",
      location: "selectionDebug (optional)",
    },
    presentationStatus: "internalOnly",
    requiredForRelease: true,
  }),
  rel({
    id: "internal.rejectedCandidates",
    systemInput: {
      source: "eligibility filters",
      field: "rejected exercise ids",
      meaning: "Why candidates were skipped",
    },
    giver: {
      module: "program",
      responsibility: "Eligibility and repair traces",
    },
    output: { field: "decision traces", meaning: "Diagnostics" },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: { kind: "temporary" },
    presentationStatus: "internalOnly",
    requiredForRelease: true,
  }),
  rel({
    id: "internal.deterministicSeeds",
    systemInput: {
      source: "generation options",
      field: "seed",
      meaning: "Determinism token",
    },
    giver: {
      module: "program",
      responsibility: "Stable RNG seeding",
    },
    output: { field: "seed", meaning: "Repeatable generation" },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: {
      kind: "temporary",
      location: "generation options / audits",
    },
    presentationStatus: "internalOnly",
    requiredForRelease: true,
  }),
  rel({
    id: "internal.qualityGateCodes",
    systemInput: {
      source: "mode contracts",
      field: "reasonCode",
      meaning: "Hard failure and warning codes",
    },
    giver: {
      module: "program/qualityGate",
      responsibility: "Unified quality evaluation",
    },
    output: {
      field: "hardFailures[].code / userSafeMessage",
      meaning: "Internal codes; user-safe message when blocking generation",
    },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: {
      kind: "temporary",
      location: "qualityEvaluation",
    },
    presentationStatus: "internalOnly",
    requiredForRelease: true,
    notes: "userSafeMessage may surface on generation failure only; never raw codes in workout UI",
  }),
  rel({
    id: "internal.recoveryHistory",
    systemInput: {
      source: "quality recovery",
      field: "recoveryAttemptCount / fallbackStrategy",
      meaning: "Recovery path taken",
    },
    giver: {
      module: "program/qualityGate/recoverProgramQuality",
      responsibility: "Bounded recovery observability",
    },
    output: { field: "observability event", meaning: "Telemetry/diagnostics" },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: { kind: "temporary" },
    presentationStatus: "telemetryOnly",
    requiredForRelease: true,
  }),
  rel({
    id: "internal.fuzzIdentifiers",
    systemInput: {
      source: "audit runners",
      field: "persona / seed ids",
      meaning: "Fuzz case identity",
    },
    giver: {
      module: "program/__debug__",
      responsibility: "Audit reproduction",
    },
    output: { field: "audit reports", meaning: "Dev-only identifiers" },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "telemetryOnly",
    requiredForRelease: false,
  }),
  rel({
    id: "internal.auditMetadata",
    systemInput: {
      source: "audits",
      field: "structural scores / coverage audits",
      meaning: "Quality measurement",
    },
    giver: {
      module: "program contracts + audits",
      responsibility: "Release gates",
    },
    output: { field: "dev reports", meaning: "Internal quality evidence" },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "telemetryOnly",
    requiredForRelease: false,
  }),

  // ----- Deferred product surfaces -----
  rel({
    id: "deferred.plannedExerciseVideos",
    systemInput: {
      source: "demo policy",
      field: "demoStatus=planned",
      meaning: "Videos not yet produced",
    },
    giver: {
      module: "coaching/exerciseDemoPolicy",
      responsibility: "Honest planned status",
    },
    output: {
      field: "demo.label",
      meaning: "Planned demo — text guidance remains available",
    },
    uiReceivers: ["exerciseGuidance"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "deferred",
    requiredForRelease: false,
    notes: "Deferred to content production; not Phase 8 layout work",
  }),
  rel({
    id: "deferred.weeklyAdaptationRecord",
    systemInput: {
      source: "assessment + training history + pain trends",
      field: "future weekly adaptation summary",
      meaning: "Measurement-backed progress narrative",
    },
    giver: {
      module: "future weekly adaptation system",
      responsibility: "Not implemented in Phase 7B",
    },
    output: {
      field: "shareable progress summary",
      meaning: "Future Phase — document relationships only",
    },
    uiReceivers: ["progressHistory"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "deferred",
    requiredForRelease: false,
    notes: "Phase 8+/future system; do not implement in 7B",
  }),
  rel({
    id: "deferred.knowledgePortal",
    systemInput: {
      source: "product roadmap",
      field: "knowledge portal",
      meaning: "Educational content hub",
    },
    giver: {
      module: "future knowledge portal",
      responsibility: "Not in Phase 7B",
    },
    output: { field: "n/a", meaning: "Deferred" },
    uiReceivers: ["internalDiagnostics"],
    persistenceEffect: { kind: "none" },
    presentationStatus: "deferred",
    requiredForRelease: false,
  }),
];

export const PRESENTATION_INVENTORY_VERSION = 1;
