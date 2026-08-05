/**
 * Phase 7B — Program presentation contract audit.
 * Writes phase7b presentation-contract artifacts only (does not overwrite Phase 0–7).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  FEEDBACK_CONTRACT_ACTION_LABELS,
  getProgramPresentationInventory,
  PRESENTATION_INVENTORY_VERSION,
  resolveProgramPresentation,
  validateProgramPresentationInventory,
  validateResolvedPresentationModel,
} from "@/lib/program/presentation";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const AUDIT_MD = path.join(
  OUT_DIR,
  "program-quality-v2-phase7b-presentation-contract.md"
);
const AUDIT_JSON = path.join(
  OUT_DIR,
  "program-quality-v2-phase7b-presentation-contract.json"
);
const INVENTORY_MD = path.join(
  OUT_DIR,
  "program-quality-v2-phase7b-relational-inventory.md"
);
const INVENTORY_JSON = path.join(
  OUT_DIR,
  "program-quality-v2-phase7b-relational-inventory.json"
);

const MODE_CASES: Array<{ id: string; questionnaire: QuestionnaireData }> = [
  {
    id: "gym",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    },
  },
  {
    id: "dumbbells",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    },
  },
  {
    id: "bands-anchored",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
      bandSetup: "long_with_anchor",
    },
  },
  {
    id: "bands-no-anchor",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
      bandSetup: "long_no_anchor",
    },
  },
  {
    id: "bands-loop-only",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
      bandSetup: "loop_only",
    },
  },
  {
    id: "bodyweight",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["none"],
    },
  },
  {
    id: "mixedHome",
    questionnaire: {
      goals: "Improve posture",
      painAreas: ["Shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["dumbbells", "bands"],
    },
  },
];

const main = () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const inventory = getProgramPresentationInventory();
  const validation = validateProgramPresentationInventory(inventory);
  const generatedAt = new Date().toISOString();

  const modeResults = MODE_CASES.map((modeCase) => {
    clearProgramVariationHistory();
    const program = generateWeeklyProgram(
      modeCase.questionnaire,
      `p7b-presentation-${modeCase.id}`,
      {
        phaseIndex: 1,
        seed: `p7b-presentation-${modeCase.id}`,
        skipQualityGate: true,
      }
    );
    const model = resolveProgramPresentation({
      program,
      questionnaire: modeCase.questionnaire,
      assessmentFocusTags:
        modeCase.id === "mixedHome" ? ["scapular control"] : [],
      assessmentFocusHighConfidence: modeCase.id === "mixedHome",
    });
    const modelFindings = validateResolvedPresentationModel(model);
    return {
      id: modeCase.id,
      equipmentIdentity: model.program.equipmentIdentity,
      frequencyLabel: model.program.frequencyLabel,
      phaseLabel: model.program.phaseLabel,
      weekLabel: model.program.weekLabel,
      weeklyStructure: model.program.weeklyStructure,
      adaptationCount: model.program.adaptationSummary.length,
      capabilityNoteCount: model.program.capabilityNotes.length,
      sessionCount: model.sessions.length,
      modelFindings,
      samplePurpose: model.sessions[0]?.purpose ?? null,
    };
  });

  const inventoryJson = {
    generatedAt,
    phase: "7b",
    inventoryVersion: PRESENTATION_INVENTORY_VERSION,
    totalRelationships: inventory.length,
    countsByStatus: validation.countsByStatus,
    relationships: inventory,
  };

  const auditJson = {
    generatedAt,
    phase: "7b",
    verdict: validation.passed && modeResults.every((m) => m.modelFindings.length === 0)
      ? "PASS"
      : "FAIL",
    inventoryVersion: PRESENTATION_INVENTORY_VERSION,
    validation,
    feedbackContractLabels: FEEDBACK_CONTRACT_ACTION_LABELS,
    modeResults,
    targets: {
      criticalRelationshipsMapped: "100%",
      requiredOutputsWithoutReceivers: validation.outputsWithoutReceivers,
      unresolvedUnused: validation.unresolvedUnused,
      rawInternalLanguageLeaks: validation.rawInternalLanguageLeaks,
    },
  };

  writeFileSync(INVENTORY_JSON, `${JSON.stringify(inventoryJson, null, 2)}\n`);
  writeFileSync(AUDIT_JSON, `${JSON.stringify(auditJson, null, 2)}\n`);

  const inventoryMd = [
    "# Program Quality V2 — Phase 7B Relational Inventory",
    "",
    `Generated: ${generatedAt}`,
    "",
    `Inventory version: **${PRESENTATION_INVENTORY_VERSION}**`,
    "",
    `Total relationships: **${inventory.length}**`,
    "",
    "## Status counts",
    "",
    ...Object.entries(validation.countsByStatus).map(
      ([status, count]) => `- \`${status}\`: ${count}`
    ),
    "",
    "## Relationships",
    "",
    "| ID | Status | Giver | UI receivers | Persistence |",
    "|----|--------|-------|--------------|-------------|",
    ...inventory.map(
      (rel) =>
        `| \`${rel.id}\` | ${rel.presentationStatus} | ${rel.giver.module} | ${rel.uiReceivers.join(", ")} | ${rel.persistenceEffect.kind} |`
    ),
    "",
    "Vocabulary: system input → giver → output → UI receiver → persistence effect.",
    "",
  ].join("\n");

  const auditMd = [
    "# Program Quality V2 — Phase 7B Presentation Contract",
    "",
    `Verdict: **${auditJson.verdict}**`,
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Validation summary",
    "",
    `- Total relationships: ${validation.totalRelationships}`,
    `- Relationships without givers: ${validation.relationshipsWithoutGivers}`,
    `- Outputs without receivers: ${validation.outputsWithoutReceivers}`,
    `- Visible without canonical source: ${validation.visibleWithoutCanonicalSource}`,
    `- Required without persistence: ${validation.requiredWithoutPersistence}`,
    `- Inputs without output: ${validation.inputsWithoutOutput}`,
    `- Unresolved unused: ${validation.unresolvedUnused}`,
    `- Raw internal language leaks: ${validation.rawInternalLanguageLeaks}`,
    "",
    "## Feedback-contract plain labels",
    "",
    ...Object.values(FEEDBACK_CONTRACT_ACTION_LABELS).map(
      (label) =>
        `- \`${label.action}\` → **${label.label}** — ${label.description}`
    ),
    "",
    "## Mode presentation smoke",
    "",
    "| Mode | Identity | Sessions | Adaptations | Model findings |",
    "|------|----------|----------|-------------|----------------|",
    ...modeResults.map(
      (m) =>
        `| ${m.id} | ${m.equipmentIdentity} | ${m.sessionCount} | ${m.adaptationCount} | ${m.modelFindings.length} |`
    ),
    "",
    "## Findings",
    "",
    ...(validation.findings.length
      ? validation.findings.map((f) => `- \`${f.code}\`: ${f.detail}`)
      : ["- None"]),
    "",
    "Canonical owner: `packages/engine/src/program/presentation/`.",
    "",
  ].join("\n");

  writeFileSync(INVENTORY_MD, inventoryMd);
  writeFileSync(AUDIT_MD, auditMd);

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        verdict: auditJson.verdict,
        totalRelationships: validation.totalRelationships,
        passed: validation.passed,
        modeResults: modeResults.map((m) => ({
          id: m.id,
          identity: m.equipmentIdentity,
          findings: m.modelFindings.length,
        })),
      },
      null,
      2
    )
  );

  if (auditJson.verdict !== "PASS") {
    process.exitCode = 1;
  }
};

main();
