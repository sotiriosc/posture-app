import { buildApplicationOrchestrationImplementationReport } from "./applicationOrchestrationReport";

export function applicationOrchestrationDocumentationMarker(): string {
  const report = buildApplicationOrchestrationImplementationReport();
  return `<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:START -->
## Adaptation Application Orchestration V1

- Status: \`${report.status}\`
- Activation: \`${report.activationStatus}\`
- Classification: \`${report.classification}\`
- Contract: \`${report.contract.contractId}@${report.contract.contractVersion}\`
- Authority: \`${report.authorityRegistry.applicationOrchestrationAuthority}\` (post-Gate 16)
- Persistence: \`${report.persistence.migrationId}\`, explicit and never automatic
- Product/app wiring: zero
- Application applied count: zero
- Combined fingerprint: \`${report.combinedFingerprint}\`
- Exact next dependency: \`${report.nextDependency}\`

The explicit server-only service can validate, build, persist, and replay unapplied shadow candidates through caller-supplied owner ports. Controlled Product shadow integration and all live Product confirmation/application remain unimplemented.
<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:END -->`;
}

export const ADAPTATION_APPLICATION_ORCHESTRATION_DOCUMENTATION_FINGERPRINT =
  buildApplicationOrchestrationImplementationReport().combinedFingerprint;
