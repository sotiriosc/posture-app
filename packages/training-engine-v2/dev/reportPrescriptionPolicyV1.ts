import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  EXPECTED_PRESCRIPTION_POLICY_V1_FINGERPRINTS,
  PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST,
  buildPrescriptionPolicyV1AdmissionReport,
  renderOwnerDecisionMarkdown,
  renderOwnerPolicyAdmissionMarkdown,
  renderOwnerPolicyContractMarkdown,
  renderOwnerPolicyDurationMarkdown,
  renderOwnerPolicyFullSessionMarkdown,
  renderOwnerPolicyHoldoutManifestMarkdown,
  renderOwnerPolicyLoadSelectionMarkdown,
  renderOwnerPolicyPerformanceMarkdown,
  renderOwnerPolicyReadinessMarkdown,
  renderOwnerPolicyRestPlacementMarkdown,
  renderOwnerPolicyRuleMatrixMarkdown,
  renderOwnerPolicyScopeCoverageMarkdown,
  renderOwnerPolicySourceEventMarkdown,
  renderOwnerPolicyWarmupActivationMarkdown,
} from "../tests/cagt/prescriptionPolicyV1OwnerAdmission";

const report = buildPrescriptionPolicyV1AdmissionReport();
const docs = resolve(process.cwd(), "../../docs/training-engine-v2");
const marker = "## Prescription Policy V1 Owner Admission";

mkdirSync(docs, { recursive: true });

const files: Readonly<Record<string, string>> = {
  "PRESCRIPTION_POLICY_V1_OWNER_DECISIONS.md": renderOwnerDecisionMarkdown(report),
  "PRESCRIPTION_POLICY_V1_CONTRACT.md": renderOwnerPolicyContractMarkdown(report),
  "PRESCRIPTION_POLICY_V1_RULE_MATRIX.md": renderOwnerPolicyRuleMatrixMarkdown(),
  "PRESCRIPTION_POLICY_V1_LOAD_SELECTION.md": renderOwnerPolicyLoadSelectionMarkdown(report),
  "PRESCRIPTION_POLICY_V1_REST_PLACEMENT.md": renderOwnerPolicyRestPlacementMarkdown(),
  "PRESCRIPTION_POLICY_V1_HOLDOUT_MANIFEST.md": renderOwnerPolicyHoldoutManifestMarkdown(report),
  "PRESCRIPTION_POLICY_V1_HOLDOUT_MANIFEST.json": `${JSON.stringify(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST, null, 2)}\n`,
  "PRESCRIPTION_POLICY_V1_CAGT_ADMISSION_REPORT.md": renderOwnerPolicyAdmissionMarkdown(report),
  "PRESCRIPTION_POLICY_V1_CAGT_ADMISSION_REPORT.json": `${JSON.stringify({
    ...report,
    expectedFingerprints: EXPECTED_PRESCRIPTION_POLICY_V1_FINGERPRINTS,
  }, null, 2)}\n`,
  "PRESCRIPTION_POLICY_V1_FULL_SESSION_REPORT.md": renderOwnerPolicyFullSessionMarkdown(report),
  "PRESCRIPTION_POLICY_V1_WARMUP_ACTIVATION_REPORT.md": renderOwnerPolicyWarmupActivationMarkdown(report),
  "PRESCRIPTION_POLICY_V1_SOURCE_EVENT_REPORT.md": renderOwnerPolicySourceEventMarkdown(report),
  "PRESCRIPTION_POLICY_V1_PERFORMANCE_REPORT.md": renderOwnerPolicyPerformanceMarkdown(report),
  "PRESCRIPTION_POLICY_V1_DURATION_REPORT.md": renderOwnerPolicyDurationMarkdown(report),
  "PRESCRIPTION_POLICY_V1_SCOPE_COVERAGE.md": renderOwnerPolicyScopeCoverageMarkdown(report),
  "PRESCRIPTION_POLICY_V1_IMPLEMENTATION_READINESS.md": renderOwnerPolicyReadinessMarkdown(report),
};

for (const [name, contents] of Object.entries(files)) {
  writeFileSync(resolve(docs, name), contents);
}

const updateNotes: Readonly<Record<string, string>> = {
  "PRESCRIPTION_TOURNAMENT_V2_IMPLEMENTATION_READINESS.md": "The blinded V2 evaluator is now authoritative evidence for owner selection. CAGT did not select the policy; the owner-selected V1 candidate passed a separate admission holdout.",
  "PRESCRIPTION_NUMERIC_IMPLEMENTATION_READINESS.md": "The frozen numeric lattice is unchanged. The owner policy resolves among its values by structured context and does not activate a production numeric policy.",
  "FULL_PRESCRIPTION_IMPLEMENTATION_READINESS.md": "Policy V1 is ready for a separately authorized production Compiler implementation. Final Sequencing and post-Prescription Week validation remain blocked.",
  "REVIEWED_PRESCRIPTION_POLICY_RULES.md": "The reviewed owner candidate is `PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE@1.0.0`; its rules remain test/developer-only and unexported from the public package API.",
  "PRESCRIPTION_POLICY_RESOLUTION_AND_CONFLICTS.md": "V1 uses the 13-level specificity order. A lower rule cannot erase a higher rule, and equal-authority conflict returns `PRESCRIPTION_POLICY_CONFLICT` without weighted blending.",
  "PRESCRIPTION_COMPILER_DESIGN_CONTRACT.md": "The next Compiler may implement V1 only after separate authorization. It must preserve assignments, source events, duration unknowns, load evidence, and the no-automatic-progression boundary.",
  "PRESCRIPTION_CAGT_MATRIX.md": "Final owner-policy admission evaluates frozen Gates 0-8 plus Gates 9-11, full-session coherence, independent performance, load retention, rest placement, and duration truth.",
  "CAGT_GATED_STRESS_REPORT.md": "V1 admission adds 10,032 blinded policy/scenario comparisons, 1,452 independent performance comparisons, permutation/metamorphic checks, and repeated deterministic runs.",
  "CAGT_COHERENT_SESSION_PROGRAM_REPORT.md": "The owner holdout compiles 129 full sessions from production Planner, Candidate Intelligence, Composer, and handoff origins; support work remains bounded across the complete session.",
  "WEEK_POLICY_V1_IMPLEMENTATION_READINESS.md": "Week Policy remains `MUSCLE_H1_SINGLE_FLEXIBLE`; H2 and spacing remain Prescription-and-response dependent. No Week allocation or post-Prescription validation was added.",
  "ENGINE_V2_BLUEPRINT.md": "Owner Policy V1 is admitted as authorization evidence only. Production Compiler, Week allocation, Sequencing, Longitudinal Adaptation, application integration, and UI remain future milestones.",
  "ARCHITECTURE.md": "Prescription owner policy remains a test/developer artifact. No production dependency direction, package export, application wiring, or public API changed.",
  "DOMAIN.md": "V1 preserves the existing Prescription, source-exposure, revision, performance, load, range, support, side, effort, tempo, duration, and block-domain vocabulary without adding prose-driven behavior.",
  "OPTIMIZER.md": "CAGT evidence and owner choice remain separate. The optimizer may compare causal outcomes but does not select, activate, blend, or silently repair the owner policy.",
  "TESTING.md": "The V1 suite covers the locked 132-scenario holdout, 121 multi-assignment sessions, all five sections, seven roles, seven dose modes, 45 exercise identities across calibration/holdout, and hard-zero causal findings.",
};

for (const [name, note] of Object.entries(updateNotes)) {
  const path = resolve(docs, name);
  const current = readFileSync(path, "utf8");
  if (!current.includes(marker)) {
    writeFileSync(path, `${current.trimEnd()}\n\n${marker}\n\n${note}\n`);
  }
}

process.stdout.write(
  `${report.classification}: ${report.holdout.scenarioCount} locked scenarios; ${report.holdout.compiledFullSessionCount} compiled full sessions; ${report.performance.comparisonCount} independent performance comparisons.\n`,
);
