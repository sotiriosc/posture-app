# One Inactive Get Stronger Product Option V1 Implementation Handoff

Contract: `ONE_INACTIVE_GET_STRONGER_PRODUCT_OPTION_V1_IMPLEMENTATION_HANDOFF@1.0.0`.

Option: `get_stronger` / **Get stronger** / `strength` / `future_inactive_internal`.

## Likely affected files

- apps/consumer/src/components/QuestionnaireForm.tsx
- apps/consumer/src/components/questionnaire/productGoalOptionRegistry.ts
- apps/consumer/tests/unit/inactiveGetStrongerOption.test.tsx
- apps/consumer/tests/e2e/inactiveGetStrongerPreview.spec.ts

## Prohibited files and areas

- apps/consumer/src/app/questionnaire/page.tsx current route invocation
- apps/gyms runtime source
- packages/engine/src/questionnaireSignature.ts
- packages/engine/src/engine/engine.ts
- packages/engine/src/engine/engineAdapter.ts
- Product persistence and training sync
- Product Shadow trigger or current-route integration

## Guards

- current_route_absent
- gyms_absent
- no_persistence
- no_signature_change
- no_generateProgram
- no_shadow_call
- no_v2_output

Ordinary consumer visibility: no. Ordinary gyms visibility: no. Buyer demo visibility: no. Preview may render/select/expose a structured value; it may not persist, call `generateProgram`, call current-route Product Shadow, or return V2 output. Non-preview submission fails closed.

Rollback: remove preview registry option prop harness and F tests; current route remains byte-for-byte behaviorally unchanged.

Expected F classification: `ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_READY_FOR_OWNER_ACCOUNT_GOAL_DELIVERY_DESIGN_AUTHORIZATION`.

Fingerprint: `d33b05c84cbbbb47d07be893349844635df43aaca3428c1585ef8c1562b1a9ed`.
