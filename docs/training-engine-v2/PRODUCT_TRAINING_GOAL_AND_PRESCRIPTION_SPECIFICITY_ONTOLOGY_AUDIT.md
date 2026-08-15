# Product Training Goal And Prescription Specificity Ontology Audit

Status: `AUDIT_ONLY_NO_BEHAVIOR_CHANGE`

Classification: `PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_V1_READY_FOR_OWNER_POLICY_SELECTION`

Selected policy: `NO`

Production/Product/shadow rollout changed: `NO/NO/NO`

## Classification

`PRODUCT_TRAINING_GOAL_ONTOLOGY_READY`

## Concept ownership and semantics

| Concept | Classification |
| --- | --- |
| canonicalOutcomeGoal | `CORRECT_OWNER_AND_SEMANTICS` |
| legacyTrainingGoal | `CORRECT_BUT_NOT_PRODUCT_EXPOSED` |
| productGoalStrings | `AMBIGUOUS_REQUIRES_OWNER_DECISION` |
| productTrainingIntent | `PRODUCT_LABEL_ONLY` |
| programmingContextMode | `PROGRAMMING_CONTEXT_ONLY` |
| weeklyDevelopmentObjective | `WEEK_OWNER` |
| sessionAllocationDirective | `CORRECT_OWNER_AND_SEMANTICS` |
| sessionIntent | `CORRECT_OWNER_AND_SEMANTICS` |
| sessionNeed | `CANDIDATE_COMPOSER_OWNER` |
| assignmentRoleAndSection | `CORRECT_OWNER_AND_SEMANTICS` |
| prescriptionPolicyUseCase | `PRESCRIPTION_OWNER` |
| prescriptionSpecificity | `CORRECT_BUT_NOT_GOAL_SPECIFIC` |
| compilerMainFallback | `OVERBROAD_FALLTHROUGH` |
| exerciseKnowledge | `EXERCISE_KNOWLEDGE_OWNER` |
| doseModeLegality | `EXERCISE_KNOWLEDGE_OWNER` |
| restTempoEffortLoad | `PRESCRIPTION_OWNER` |
| equipmentRealization | `EQUIPMENT_OWNER` |
| phaseContext | `PHASE_CONTEXT_ONLY` |
| painAwareRegression | `PROGRAMMING_CONTEXT_ONLY` |
| longitudinalAxes | `CORRECT_OWNER_AND_SEMANTICS` |
| productShadowMappings | `CORRECT_BUT_NOT_GOAL_SPECIFIC` |

## Explicit answers

1. **Strength canonical?** Yes. `strength` is a canonical `TrainingOutcomeGoal`.
2. **Consumed by Week planning?** Yes, narrowly: Week Policy V1 owns `major_strength_movement_development:S2` opportunity targets.
3. **Consumed by Session planning?** Yes. Explicit `outcomeGoal` is validated and carried into `SessionIntent`.
4. **Consumed by Prescription?** Yes. Main repetition-set work resolves to `main_strength` unless the goal is hypertrophy.
5. **Product exposed?** No explicit Build strength option exists.
6. **Meaning of Product build?** Developmental progression only; it does not distinguish strength from hypertrophy.
7. **Athletic performance sufficient?** No. It cannot truthfully select strength, power, conditioning, or mixed policy without another fact.
8. **General-fitness fallthrough?** Yes, for main repetition-set assignments.
9. **Posture fallthrough?** Yes, for main repetition-set assignments.
10. **Pain-aware fallthrough?** Yes when the legacy value is used as a main goal; canonically it is a context mode, not an outcome.
11. **Intentional?** The strength and hypertrophy branches are intentional; the defaulting of every other value to strength is overbroad and apparently accidental.
12. **General-fitness use case?** An explicit family or an explicit purpose-first rule is required; the owner must select which.
13. **Conditioning use case?** An explicit family or purpose-first rule is required before it is supported as main repetition work.
14. **Posture use case?** It needs explicit purpose semantics; posture should not silently mean low-repetition strength.
15. **Power representation?** Owner decision. A structured secondary goal is the smaller first option; a future canonical outcome requires separate domain authorization.
16. **Tone / definition?** Only as user language that is clarified into muscle-building and body-composition intent, never as a false high-repetition physiology.
17. **Body-composition owner?** Product/profile goal ownership outside the training Prescription; the engine may consume an authorized fact later.
18. **Nutrition owner?** A nutrition domain/service, not Candidate, Composer, Week, or Prescription.
19. **Same exercise for strength and hypertrophy?** Yes. Load, reps, sets, rest, effort, and weekly volume can differ while exercise identity converges.
20. **Classes protected from blanket low reps?** Preparation, activation, mobility, recovery, carries, holds, breaths, counted steps, and role-owned accessories.
21. **Equipment blockers?** Load ceilings, unavailable increments, missing anchors/benches/machines, and absent support or loaded-gait space.
22. **Missing Product facts?** Direct goal truth, owner-approved mapping, explicit equipment capabilities, usable availability, experience, and enough prior-load evidence for safe realization.

Audit fingerprint: `0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb`.

Next dependency: `OWNER_SELECTION_OF_PRODUCT_GOAL_VOCABULARY_AND_GOAL_SPECIFIC_PRESCRIPTION_POLICY`.
