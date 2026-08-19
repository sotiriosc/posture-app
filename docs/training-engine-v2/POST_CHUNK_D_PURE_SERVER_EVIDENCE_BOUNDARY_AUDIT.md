# Post-Chunk D Pure/Server Evidence Boundary Audit

Status: `COMPLETED_AND_PROVEN`

Root-cause classification: `PURE_TO_SERVER_TEST_DEPENDENCY_DIRECTION_VIOLATION`

## Failure Authority

- Workflow run: `31941030623`
- Job: `95150139482`, Outcome source, orchestration, and Product shadow PostgreSQL integration
- Step: `Build pure and server persistence contracts`
- The PostgreSQL 16 service initialized, but all three integration commands were skipped after the pure build failed.
- Reported aliases: `@/lib/appState`, `@/lib/types`, and `@/lib/program/warmupLibrary`.

## Import Graph Before

| # | Pure source | Engine target | Syntax |
| --- | --- | --- | --- |
| 1 | `packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/contracts.ts` | `packages/engine/src/controlledProductShadowGoalRealization/contracts.ts` | `import_type` |
| 2 | `packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts` | `packages/engine/tests/controlledProductShadowGoalEvidence/artifactStore.ts` | `import` |
| 3 | `packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts` | `packages/engine/tests/controlledProductShadowGoalEvidence/futureGoalFixtures.ts` | `import` |
| 4 | `packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts` | `packages/engine/tests/controlledProductShadowGoalEvidence/evidenceSuite.ts` | `import` |
| 5 | `packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts` | `packages/engine/tests/controlledProductShadowGoalEvidence/genuineStagePorts.ts` | `import` |

The first source-order edge was the type import from the pure evidence contracts into the engine goal-realization contracts. The report assembler added four more direct engine-test edges. Those paths traversed `trainingStateModel.ts` and `types.ts`; their package-local `@/lib/*` aliases predated Chunk D but were not owned by the Training Engine V2 TypeScript project.

Production pure source imports into engine code: 0. The violation was confined to Chunk D test/report tooling. Focused Vitest and `tsx` report commands appeared healthy because they ran with engine-side resolution; the PostgreSQL job consistently exposed the inversion by running the complete Training Engine V2 TypeScript build first.

## Repair

- Moved report assembly to `packages/engine/tests/controlledProductShadowGoalEvidence/reportAssembly.ts`.
- Kept pure contracts, scenarios, causal pairs, metrics, serializers, and comparison logic in Training Engine V2.
- Replaced the engine-owned stage type import with an equivalent pure evidence-stage type.
- Added an AST validator covering imports, re-exports, import types, dynamic imports, require calls, relative traversal, package subpaths, and tsconfig alias leakage.
- Added mandatory pure production and pure test/dev type-check rows.

After repair, executable pure-to-engine imports: 0. Cross-package engine aliases added to the pure tsconfig: 0. Frozen report result: `REPORT_CORPUS_BYTE_EQUIVALENT`. Chunk D combined fingerprint remains `dcedd35ec88a929420036dee8f34f909af2a043f3e5133edca40fe76efa89464`.
