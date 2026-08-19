import { resolve } from "node:path";
import { auditPureServerBoundary } from "../tests/helpers/pureServerBoundary";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const result = auditPureServerBoundary(workspaceRoot);

process.stdout.write(`${JSON.stringify({
  classification: result.classification,
  pureToServerImportCount: result.executableImportEdges.length,
  packageAliasViolationCount: result.packageAliasViolations.length,
  typeCoverageFailureCount: result.typeCoverageFailures.length,
  fingerprint: result.fingerprint,
}, null, 2)}\n`);

if (result.classification !== "PURE_SERVER_DEPENDENCY_DIRECTION_VALID") {
  process.stderr.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = 1;
}
