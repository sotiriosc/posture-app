# Program Quality V2 — Phase 7B Relational Inventory

Generated: 2026-08-05T20:09:35.638Z

Inventory version: **1**

Total relationships: **43**

## Status counts

- `visible`: 16
- `visibleOnDemand`: 14
- `internalOnly`: 7
- `telemetryOnly`: 3
- `deferred`: 3
- `unused`: 0

## Relationships

| ID | Status | Giver | UI receivers | Persistence |
|----|--------|-------|--------------|-------------|
| `program.primaryEquipmentMode` | visible | program/equipmentMode | programOverview, weeklyOverview, equipmentSettings | questionnaire |
| `program.confirmedEquipment` | visible | equipment | programOverview, sessionOverview, activeWorkout | questionnaire |
| `program.confirmedSupports` | visibleOnDemand | program/equipmentCapabilities | sessionOverview, exerciseCard, exerciseGuidance | questionnaire |
| `program.bandTypesAndAnchors` | visibleOnDemand | program/bandSetup | sessionOverview, exerciseGuidance, equipmentSettings | questionnaire |
| `program.trainingGoal` | visibleOnDemand | program | questionnaire, programOverview | questionnaire |
| `program.trainingIntent` | visibleOnDemand | program/trainingIntent | exerciseCard, preSessionAdaptation, progressHistory | questionnaire |
| `program.experience` | visibleOnDemand | program | programOverview, sessionOverview | questionnaire |
| `program.frequency` | visible | program | programOverview, weeklyOverview | storedProgram |
| `program.currentPhase` | visible | phases | programOverview, phaseTransition, progressHistory | storedProgram |
| `program.currentWeek` | visible | program | programOverview, weeklyOverview | storedProgram |
| `program.templateVersion` | internalOnly | program | internalDiagnostics | storedProgram |
| `program.capabilityLimitations` | visibleOnDemand | program/qualityGate | programOverview, sessionOverview | temporary |
| `program.regenerationReason` | internalOnly | program/qualityGate/recoverProgramQuality | internalDiagnostics | temporary |
| `session.dayTitle` | visible | program | weeklyOverview, sessionOverview, activeWorkout | storedProgram |
| `session.purpose` | visible | program/presentation | sessionOverview, weeklyOverview | none |
| `session.expectedDuration` | visible | program/presentation | sessionOverview, weeklyOverview | none |
| `session.exerciseCount` | visible | program/presentation | sessionOverview, weeklyOverview | storedProgram |
| `session.painModifications` | visibleOnDemand | program | programOverview, sessionOverview, preSessionAdaptation | storedProgram |
| `session.completionState` | visible | programProgress | weeklyOverview, progressHistory | progressionState |
| `exercise.identityAndPrescription` | visible | coaching/resolveExerciseCoaching | exerciseCard, exerciseGuidance, exerciseDetails, activeWorkout | storedProgram |
| `exercise.roleTruth` | internalOnly | program/*ProgramContract | internalDiagnostics, substitutionFlow | storedProgram |
| `exercise.coachingGuidance` | visibleOnDemand | coaching | exerciseGuidance, exerciseDetails, exerciseCard | none |
| `exercise.rationale` | visibleOnDemand | program/prescriptionRationale | exerciseCard, exerciseDetails, programOverview | storedProgram |
| `exercise.progressionRegression` | visibleOnDemand | coaching + ladderAdvancement | exerciseCard, exerciseDetails, progressHistory | progressionState |
| `exercise.substitutionState` | visible | program | activeWorkout, substitutionFlow, painFeedback | sessionDraft |
| `exercise.demoStatus` | visibleOnDemand | coaching/exerciseDemoPolicy | exerciseGuidance, exerciseDetails | none |
| `adaptation.questionnairePain` | visible | program | assessmentResults, programOverview, sessionOverview | questionnaire |
| `adaptation.photoFocus` | visibleOnDemand | engine/poseFocus + assessment | assessmentResults, programOverview, exerciseDetails | assessment |
| `adaptation.sessionDiscomfort` | visible | session UI + program substitution policy | painFeedback, activeWorkout, substitutionFlow | exerciseLog |
| `adaptation.personalBlock` | visible | program | activeWorkout, equipmentSettings | feedbackHistory |
| `adaptation.preSessionContract` | visible | program/feedbackContract | preSessionAdaptation, activeWorkout | feedbackHistory |
| `adaptation.futureProgramEffect` | visibleOnDemand | program + ladderAdvancement | preSessionAdaptation, progressHistory, exerciseCard | progressionState |
| `adaptation.phaseTransition` | visibleOnDemand | program/phaseGatingEvaluator | phaseTransition, progressHistory, programOverview | storedProgram |
| `internal.selectionScores` | internalOnly | program/selectionScore | internalDiagnostics | temporary |
| `internal.rejectedCandidates` | internalOnly | program | internalDiagnostics | temporary |
| `internal.deterministicSeeds` | internalOnly | program | internalDiagnostics | temporary |
| `internal.qualityGateCodes` | internalOnly | program/qualityGate | internalDiagnostics | temporary |
| `internal.recoveryHistory` | telemetryOnly | program/qualityGate/recoverProgramQuality | internalDiagnostics | temporary |
| `internal.fuzzIdentifiers` | telemetryOnly | program/__debug__ | internalDiagnostics | none |
| `internal.auditMetadata` | telemetryOnly | program contracts + audits | internalDiagnostics | none |
| `deferred.plannedExerciseVideos` | deferred | coaching/exerciseDemoPolicy | exerciseGuidance | none |
| `deferred.weeklyAdaptationRecord` | deferred | future weekly adaptation system | progressHistory | none |
| `deferred.knowledgePortal` | deferred | future knowledge portal | internalDiagnostics | none |

Vocabulary: system input → giver → output → UI receiver → persistence effect.
