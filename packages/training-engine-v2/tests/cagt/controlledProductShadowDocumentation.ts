import { buildControlledProductShadowImplementationReport } from "./controlledProductShadowReport";

export function controlledProductShadowDocumentationMarker(): string {
  const report = buildControlledProductShadowImplementationReport();
  return `<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:START -->
## Controlled Product Shadow Integration V1

- Status: \`${report.status}\`.
- Classification: \`${report.classification}\`.
- Product decision/output authority: \`${report.productAuthority}\`.
- V2 application state: \`${report.v2ApplicationState}\`.
- Runtime shape: one shared successful-sync notification, two thin authenticated routes, one server service.
- Rollout: default off, dedicated internal allowlist only, no all-user/percentage/random/anonymous mode.
- Evidence: ${report.controlledScenarioCount} controlled, ${report.fixedShellCount} fixed-shell, ${report.holdout.scenarioCount} frozen holdout; fingerprint \`${report.holdout.manifestFingerprint}\`.
- Persistence: explicit forward-only migration plan, ${report.persistence.tableCount} append-only tables, no legacy Product table changes, no automatic or production migration.
- Safety: zero Product mutation, application, delivery, rendering, performed credit, or counterfactual outcome attribution.
- Remaining dependency: \`${report.nextDependency}\`.
<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:END -->`;
}
