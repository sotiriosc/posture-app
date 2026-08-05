/**
 * Phase 7B — Deterministic presentation contract validation.
 */

import { getProgramPresentationInventory } from "./programPresentationInventory";
import {
  containsForbiddenInternalUiLanguage,
  FEEDBACK_CONTRACT_ACTION_LABELS,
} from "./resolveAdaptationPresentation";
import type {
  PresentationContractStatus,
  PresentationRelationship,
  PresentationValidationFinding,
  ProgramPresentationModel,
  ProgramPresentationValidation,
} from "./presentationContractTypes";

const emptyCounts = (): Record<PresentationContractStatus, number> => ({
  visible: 0,
  visibleOnDemand: 0,
  internalOnly: 0,
  telemetryOnly: 0,
  deferred: 0,
  unused: 0,
});

const hasGiver = (rel: PresentationRelationship) =>
  Boolean(rel.giver?.module?.trim() && rel.giver?.responsibility?.trim());

const hasOutput = (rel: PresentationRelationship) =>
  Boolean(rel.output?.field?.trim() && rel.output?.meaning?.trim());

const hasInput = (rel: PresentationRelationship) =>
  Boolean(rel.systemInput?.source?.trim() && rel.systemInput?.field?.trim());

const needsUiReceiver = (rel: PresentationRelationship) =>
  rel.presentationStatus === "visible" ||
  rel.presentationStatus === "visibleOnDemand";

export const validateProgramPresentationInventory = (
  relationships: PresentationRelationship[] = getProgramPresentationInventory()
): ProgramPresentationValidation => {
  const findings: PresentationValidationFinding[] = [];
  const countsByStatus = emptyCounts();

  let relationshipsWithoutGivers = 0;
  let outputsWithoutReceivers = 0;
  let visibleWithoutCanonicalSource = 0;
  let requiredWithoutPersistence = 0;
  let inputsWithoutOutput = 0;
  let unresolvedUnused = 0;
  let rawInternalLanguageLeaks = 0;

  for (const rel of relationships) {
    countsByStatus[rel.presentationStatus] =
      (countsByStatus[rel.presentationStatus] ?? 0) + 1;

    if (!hasGiver(rel)) {
      relationshipsWithoutGivers += 1;
      findings.push({
        code: "MISSING_GIVER",
        detail: `Relationship ${rel.id} has no giver`,
        relationshipId: rel.id,
      });
    }
    if (hasInput(rel) && !hasOutput(rel)) {
      inputsWithoutOutput += 1;
      findings.push({
        code: "INPUT_WITHOUT_OUTPUT",
        detail: `Relationship ${rel.id} has input but no output`,
        relationshipId: rel.id,
      });
    }
    if (needsUiReceiver(rel) && (!rel.uiReceivers || rel.uiReceivers.length === 0)) {
      outputsWithoutReceivers += 1;
      findings.push({
        code: "OUTPUT_WITHOUT_RECEIVER",
        detail: `Visible relationship ${rel.id} has no UI receiver`,
        relationshipId: rel.id,
      });
    }
    if (needsUiReceiver(rel) && !hasOutput(rel)) {
      visibleWithoutCanonicalSource += 1;
      findings.push({
        code: "VISIBLE_WITHOUT_SOURCE",
        detail: `Visible relationship ${rel.id} lacks canonical output`,
        relationshipId: rel.id,
      });
    }
    if (
      rel.requiredForRelease &&
      (!rel.persistenceEffect || !rel.persistenceEffect.kind)
    ) {
      requiredWithoutPersistence += 1;
      findings.push({
        code: "REQUIRED_WITHOUT_PERSISTENCE",
        detail: `Required relationship ${rel.id} lacks persistence definition`,
        relationshipId: rel.id,
      });
    }
    if (rel.presentationStatus === "unused") {
      unresolvedUnused += 1;
      findings.push({
        code: "UNRESOLVED_UNUSED",
        detail: `Unused relationship ${rel.id} must be connected, internalized, deferred, or removed`,
        relationshipId: rel.id,
      });
    }

    const textBlob = [
      rel.output.meaning,
      rel.fallbackBehavior ?? "",
      rel.userAction ?? "",
      rel.notes ?? "",
    ].join(" ");
    if (containsForbiddenInternalUiLanguage(textBlob)) {
      // Notes may mention internal enums for developers — only flag userAction/fallback/output.
      const userFacing = [
        rel.output.meaning,
        rel.fallbackBehavior ?? "",
        rel.userAction ?? "",
      ].join(" ");
      if (containsForbiddenInternalUiLanguage(userFacing)) {
        rawInternalLanguageLeaks += 1;
        findings.push({
          code: "RAW_INTERNAL_LANGUAGE",
          detail: `Relationship ${rel.id} leaks internal language into user-facing fields`,
          relationshipId: rel.id,
        });
      }
    }
  }

  // Feedback-contract plain labels must never equal raw internal action names.
  for (const label of Object.values(FEEDBACK_CONTRACT_ACTION_LABELS)) {
    if (
      label.label.toLowerCase() === label.action ||
      containsForbiddenInternalUiLanguage(label.label)
    ) {
      rawInternalLanguageLeaks += 1;
      findings.push({
        code: "RAW_CONTRACT_LABEL",
        detail: `Feedback contract action ${label.action} still exposes raw/internal label "${label.label}"`,
      });
    }
  }

  const hardFindings = findings.filter(
    (f) =>
      f.code === "MISSING_GIVER" ||
      f.code === "OUTPUT_WITHOUT_RECEIVER" ||
      f.code === "VISIBLE_WITHOUT_SOURCE" ||
      f.code === "REQUIRED_WITHOUT_PERSISTENCE" ||
      f.code === "INPUT_WITHOUT_OUTPUT" ||
      f.code === "UNRESOLVED_UNUSED" ||
      f.code === "RAW_CONTRACT_LABEL" ||
      f.code === "RAW_INTERNAL_LANGUAGE"
  );

  return {
    passed: hardFindings.length === 0,
    totalRelationships: relationships.length,
    totalFields: relationships.length,
    countsByStatus,
    relationshipsWithoutGivers,
    outputsWithoutReceivers,
    visibleWithoutCanonicalSource,
    requiredWithoutPersistence,
    inputsWithoutOutput,
    unresolvedUnused,
    rawInternalLanguageLeaks,
    findings,
  };
};

export const validateResolvedPresentationModel = (
  model: ProgramPresentationModel
): PresentationValidationFinding[] => {
  const findings: PresentationValidationFinding[] = [];
  const texts = [
    model.program.equipmentIdentity,
    model.program.frequencyLabel,
    model.program.phaseLabel,
    model.program.phasePurpose,
    model.program.weekLabel,
    ...model.program.capabilityNotes.map((m) => m.text),
    ...model.program.adaptationSummary.map((m) => m.text),
    ...model.sessions.flatMap((s) => [
      s.title,
      s.purpose,
      s.expectedDuration,
      s.painAdaptation?.text ?? "",
      ...s.equipmentNeeded,
      ...s.setupRequirements,
    ]),
  ];
  for (const text of texts) {
    if (text && containsForbiddenInternalUiLanguage(text)) {
      findings.push({
        code: "RESOLVED_INTERNAL_LANGUAGE",
        detail: `Resolved presentation text leaks internal language: ${text.slice(0, 120)}`,
      });
    }
  }
  if (!model.program.equipmentIdentity.trim()) {
    findings.push({
      code: "MISSING_EQUIPMENT_IDENTITY",
      detail: "Resolved model missing equipment identity",
    });
  }
  if (!model.sessions.length) {
    findings.push({
      code: "MISSING_SESSIONS",
      detail: "Resolved model has no sessions",
    });
  }
  return findings;
};
