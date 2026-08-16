import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildPostChunkDBoundaryRepairEvidence,
  renderPostChunkDBoundaryAudit,
} from "../tests/controlledProductShadowGoalEvidence/postChunkDBoundaryRepairEvidence";

const workspaceRoot = process.cwd().endsWith("packages/engine") ? resolve(process.cwd(), "../..") : process.cwd();
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const evidence = buildPostChunkDBoundaryRepairEvidence(workspaceRoot);
writeFileSync(resolve(docsRoot, "POST_CHUNK_D_PURE_SERVER_EVIDENCE_BOUNDARY_AUDIT.md"),
  renderPostChunkDBoundaryAudit(workspaceRoot), "utf8");
writeFileSync(resolve(docsRoot, "POST_CHUNK_D_PURE_SERVER_BOUNDARY_REPAIR_EVIDENCE.json"),
  `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ classification: evidence.classification,
  rootCauseClassification: evidence.rootCauseClassification,
  pureToServerBefore: evidence.importGraphBefore.length,
  pureToServerAfter: evidence.importGraphAfter.length,
  reportFileCount: evidence.reportFileCount,
  reportEquivalence: evidence.reportEquivalence,
  mutationResult: `${evidence.mutations.rejectedCount}/${evidence.mutations.mutationCount}`,
  metamorphicResult: `${evidence.metamorphic.passedCount}/${evidence.metamorphic.relationCount}`,
  combinedMaintenanceTranche: evidence.fingerprints.combinedMaintenanceTranche,
}, null, 2)}\n`);
