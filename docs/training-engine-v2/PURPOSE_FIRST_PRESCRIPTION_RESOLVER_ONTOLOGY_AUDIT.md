# Purpose-First Prescription Resolver Ontology Audit

Status: `PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_IMPLEMENTED_NOT_ACTIVATED`

Classification: `PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_READY_FOR_SUPPORTED_PURPOSE_POLICY_ADMISSION_AUTHORIZATION`

Canonical authority: [Praxis Product Goal Architecture Ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md)

Product/Product Shadow/activation changed: `NO/NO/NO`

Ontology classification: `PURPOSE_FIRST_PRESCRIPTION_RESOLVER_ONTOLOGY_READY`

## Concept Classifications

| Concept | Classification |
| --- | --- |
| Weekly objective family/purpose/goal relationships | `CORRECT_LOCAL_PURPOSE_SOURCE` |
| Reserved responsibility and SessionNeed objective IDs | `PURPOSE_LINEAGE_AVAILABLE` |
| AllocatedSessionObjective family/purpose | `PURPOSE_LINEAGE_LOST_IN_PROJECTION` |
| Session assignment and Prescription handoff | `PURPOSE_LINEAGE_AVAILABLE` |
| TrainingRole and section | `CORRECT_STRUCTURAL_ROLE_ONLY` |
| V1.0 resolveUseCase global branch | `GLOBAL_GOAL_OVERREACH` |
| V1.0 secondary_strength branch | `STRUCTURAL_ROLE_OVERREACH` |
| V1.0 compiler | `LEGACY_COMPATIBILITY_ONLY` |
| V1.1 compiler | `VERSIONED_MIGRATION_REQUIRED` |
| B3 purpose policies | `FUTURE_PURPOSE_POLICY_REQUIRED` |

## Explicit Answers

1. Weekly objective family and purpose exist on `ProductionWeeklyDevelopmentObjective` in `ProductionWeeklyIntent.objectives`.
2. The materialized `AllocatedSessionObjective` retains structural kind and source ID but not family/purpose, so purpose is lost at that projection.
3. Yes. The original weekly objective is reconstructed exactly through reservation `weeklyObjectiveId` and responsibility IDs.
4. Yes. `SessionNeed.plannerProvenance.objectiveIds` identifies reserved/materialized responsibilities without prose parsing.
5. Yes. Assignment `satisfiedNeedIds` provides the exact need edge.
6. Yes. `SessionPrescriptionAssignmentHandoff` preserves handoff, exercise, need, section, and role identity.
7. Yes. The immutable snapshot is a read-only projection and does not alter Week allocation.
8. Yes. Candidate ranking and Composer selection are inputs, never rerun or changed.
9. Yes. Existing SessionNeed identity remains unchanged.
10. Yes. V1.0 lets `secondary_strength` over-own use-case selection; V1.1 requires explicit strength purpose.
11. `primary_strength` is a legacy structural placement role, not physiology authority.
12. `hypertrophy_accessory` is a legacy structural role, not independent hypertrophy authority.
13. Timed hold, breath cycles, march, counted steps, and recovery lanes are mode/section-owned after explicit purpose validation.
14. Main/secondary strength, main/accessory hypertrophy, direct accessory, and capacity carry are local-purpose-owned.
15. Non-hypertrophy main repetition work in V1.0 is global-goal fallthrough to strength.
16. Yes. V1.0 remains byte-compatible and Product Shadow stays pinned to it.
17. Yes. `PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0` avoids mutating the published V1.0 contract.
18. All purpose-complete supported use cases retain equivalent dose, rest, effort, timing, load, block, and source-event semantics.
19. Missing/unsupported purpose, role-only purpose, and the 60 audited global-goal fallthrough cells intentionally fail closed.
20. Movement quality, muscular endurance, systemic conditioning, power, secondary hypertrophy, maintain, and return/rebuild remain B3 gaps.
21. No. Secondary hypertrophy has no admitted numeric policy.
22. No. Movement-quality main work has no admitted numeric policy.
23. No. Muscular-endurance main work has no admitted numeric policy.
24. No. Systemic conditioning has no admitted numeric policy.
25. No. Power has no admitted numeric policy.
26. Yes. B2 earns readiness by making those gaps explicit and fail-closed without admitting B3 policy.
