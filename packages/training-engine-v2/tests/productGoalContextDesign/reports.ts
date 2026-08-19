import { fingerprint, jsonReport } from "./contracts";
import {
  activationGuards,
  chunkEReadiness,
  closureProjection,
  consumerGymsParity,
  copyMatrix,
  currentOwnership,
  currentRenderBaseline,
  dEvidenceConsequences,
  designEvidence,
  designOptions,
  designRisks,
  driftAudit,
  fHandoff,
  followUpDesign,
  goalOptionPolicy,
  informationArchitecture,
  inputNecessityProjection,
  legacyCompatibility,
  ownerScreenshotCorpus,
  painContextDesign,
  primaryGoalDesign,
  productProfileV2Design,
  reducePainMigration,
  responsiveAccessibility,
  scheduleExperienceEquipmentDesign,
  secondaryGoalDesign,
  signatureV2Design,
  stateMachine,
  trainingModeDesign,
  visualInvariants,
} from "./evidence";
import {
  designMetamorphicResults,
  designMutationResults,
  validationSummary,
} from "./validation";

const upstreamFingerprints = Object.freeze({
  historicalProductShadow: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
  chunkC: "01f3a6a9b1eb6ef28d33876c5cb00d3b01948cad90cf7939ac1d072ffa071a9d",
  chunkD: "dcedd35ec88a929420036dee8f34f909af2a043f3e5133edca40fe76efa89464",
  postChunkDMaintenance: "39f761ac75423c549a889c4559b50e2bbf6e608c709ddb8616b5347c32c211bb",
});

const ontologyAudit = Object.freeze({
  oneSurface: informationArchitecture.selectedSurface,
  primaryOutcomeOwner: "primary_goal",
  broadGoalOwner: "conditional_goal_focus",
  painOwner: "programming_context",
  modeOwner: "training_mode",
  scheduleOwner: "availability",
  experienceOwner: "coarse_context_not_exact_realization",
  equipmentOwner: "environment_plus_conditional_capability",
  secondaryOwner: "optional_personalization",
  runtimeAuthority: "none_design_only",
});

const fingerprintInputs = Object.freeze({
  ontologyAudit,
  screenshotObservationCorpus: ownerScreenshotCorpus,
  sanitizedScreenshotEvidence: ownerScreenshotCorpus.sanitization,
  currentRenderBaseline,
  driftAudit,
  implementationOwnership: currentOwnership,
  dEvidenceConsequences,
  visualInvariants,
  informationArchitecture,
  designOptions,
  selectedOptionA: { selected: designOptions.selected },
  goalVocabulary: goalOptionPolicy.options.map((option) => ({ id: option.id, label: option.displayLabel,
    canonicalOutcome: option.canonicalOutcome })),
  goalOptionStates: goalOptionPolicy,
  primaryGoal: primaryGoalDesign,
  followUp: followUpDesign,
  painContext: painContextDesign,
  reducePainMigration,
  trainingMode: trainingModeDesign,
  secondaryGoal: secondaryGoalDesign,
  days: scheduleExperienceEquipmentDesign.days,
  minutes: scheduleExperienceEquipmentDesign.minutes,
  experience: scheduleExperienceEquipmentDesign.experience,
  equipment: scheduleExperienceEquipmentDesign.equipment,
  desktop: responsiveAccessibility.desktop,
  mobile: responsiveAccessibility.mobile,
  accessibility: responsiveAccessibility.accessibilityContract,
  copyMatrix,
  stateMachine,
  signatureV2Design,
  productProfileV2Design,
  legacyCompatibility,
  consumerGymsParity,
  designRisks,
  firstSurfaceRecommendation: informationArchitecture.eventualOrder,
  fHandoff,
  mutations: designMutationResults.mutations,
  metamorphicResults: designMetamorphicResults,
  activationGuards,
  ledgerBeforeClosure: closureProjection.ledgerBeforeSha,
  ledgerAfterClosure: closureProjection,
  readiness: chunkEReadiness,
});

type FingerprintInputKey = keyof typeof fingerprintInputs;

const individualFingerprints = Object.freeze(Object.fromEntries(
  Object.entries(fingerprintInputs).map(([key, value]) => [key, fingerprint(value)])
) as Record<FingerprintInputKey, string>);

export const chunkEFingerprints: Readonly<
  { upstream: typeof upstreamFingerprints; combinedChunkE: string } &
  Record<FingerprintInputKey, string>
> = Object.freeze({
  upstream: upstreamFingerprints,
  ...individualFingerprints,
  combinedChunkE: fingerprint({ upstreamFingerprints, individualFingerprints }),
});

const escape = (value: unknown) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const title = (heading: string) => `# ${heading}\n\n`;
const bullets = (values: readonly unknown[]) => values.map((value) => `- ${escape(value)}`).join("\n");
const table = (headers: readonly string[], rows: readonly (readonly unknown[])[]) => [
  `| ${headers.join(" | ")} |`,
  `| ${headers.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
].join("\n");
const reportFooter = (key: FingerprintInputKey) =>
  `\n\nFingerprint: \`${chunkEFingerprints[key]}\`.\n`;

const renderOntology = () => title("Screenshot-Guided Product Goal and Context Design Ontology Audit") +
  `Contract: \`SCREENSHOT_GUIDED_PRODUCT_GOAL_CONTEXT_INPUT_DESIGN@1.0.0\`.\n\n` +
  `Classification: \`${chunkEReadiness.classification}\`.\n\n` +
  table(["Concept", "Owner"], Object.entries(ontologyAudit).map(([key, value]) => [key, typeof value === "object" ? JSON.stringify(value) : value])) +
  `\n\nThe audit selects only the consumer \`/questionnaire\` surface. It creates no Product option, route, Program, exercise, dose, output, mutation, or activation.` +
  reportFooter("ontologyAudit");

const renderScreenshotCorpus = () => title("Owner-Supplied Product Screenshot Observation Corpus") +
  `Contract: \`${ownerScreenshotCorpus.reference.contractId}@${ownerScreenshotCorpus.reference.contractVersion}\`.\n\n` +
  `The owner declares ${ownerScreenshotCorpus.declaredLogicalImageCount} logical images: five desktop composites and eight representative mobile crops. ` +
  `The local workspace contains ${ownerScreenshotCorpus.locallyObservedBinaryCount} untracked PNG binaries; five are verified Product composites, one includes partial Product plus development context, and two show unrelated development desktop context. ` +
  `This discrepancy is recorded without requesting images again or inventing mobile observations.\n\n` +
  `## Sanitized observations\n\n${bullets(ownerScreenshotCorpus.sanitizedObservationIds)}\n\n` +
  `## Binary disposition\n\n- Owner screenshot binaries committed: 0\n- Personal values committed: 0\n- Pixel data copied into docs: 0\n- Disposition: ${ownerScreenshotCorpus.binaryPolicy}\n\n` +
  `Desktop observation: \`${ownerScreenshotCorpus.desktopObservationResult}\`. Mobile observation: \`${ownerScreenshotCorpus.mobileObservationResult}\`.` +
  reportFooter("screenshotObservationCorpus");

const renderBaseline = () => title("Product Goal and Context Current Render Baseline") +
  `Current branch commit: \`${currentRenderBaseline.commit}\`. All state is synthetic. PNG artifacts remain ignored under app-local \`test-results\`; semantic review does not depend on pixel-perfect equality or background crop.\n\n` +
  table(["App", "Route", "Viewport", "State", "Conditional", "Overflow", "Fixed overlap", "Artifact SHA-256"],
    currentRenderBaseline.entries.map((entry) => [entry.appSurface, entry.route,
      `${entry.viewport.width}x${entry.viewport.height}`, entry.syntheticState, entry.conditionalState,
      entry.horizontalOverflow, entry.fixedControlOverlap, entry.artifactSha256])) +
  `\n\nConsumer result: \`${currentRenderBaseline.consumerResult}\`. Gyms result: \`${currentRenderBaseline.gymsResult}\`.\n\n` +
  `Current accessibility observations remain findings, not WCAG conformance claims:\n\n${bullets(currentRenderBaseline.currentAccessibilityLimitations)}` +
  reportFooter("currentRenderBaseline");

const renderDrift = () => title("Product Goal and Context Screenshot, Code, and Render Drift Audit") +
  table(["ID", "Evidence", "Classifications", "Disposition", "Material to E"],
    driftAudit.rows.map((row) => [row.id, row.evidence, row.classifications.join(", "), row.disposition, row.materialToChunkE])) +
  `\n\nUnresolved targeted drift count: ${driftAudit.unresolvedCount}. ` +
  `Top Chunk E classification remains earnable because the discrepancies are explicit and do not prevent the one-surface design.` +
  reportFooter("driftAudit");

const renderOwnership = () => title("Product Goal and Context Current Implementation Ownership") +
  table(["Field", "Classifications", "Current behavior", "Future disposition"],
    currentOwnership.rows.map((row) => [row.field, row.classifications.join(", "), row.currentBehavior, row.futureDisposition])) +
  `\n\n## Audit answers\n\n${table(["Question", "Answer"], Object.entries(currentOwnership.auditAnswers).map(([key, value]) =>
    [key, Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : value]))}` +
  reportFooter("implementationOwnership");

const renderInformationArchitecture = () => title("Product Goal and Context Information Architecture") +
  `Direction: \`${informationArchitecture.direction}\`. Selected surface: consumer \`/questionnaire\`, component \`${informationArchitecture.selectedSurface.component}\`.\n\n` +
  `## Eventual one-page order\n\n${informationArchitecture.eventualOrder.map((field, index) => `${index + 1}. ${field}`).join("\n")}\n\n` +
  `Ordinary supported-path target: under ${informationArchitecture.ordinarySupportedPathTargetSeconds} seconds. ` +
  `No giant questionnaire, multi-page wizard, or F field reorder is authorized.` +
  reportFooter("informationArchitecture");

const renderVisual = () => title("Product Goal and Context Visual Invariants") +
  table(["Invariant", "Current source"], visualInvariants.preserve.map((entry) => [entry.invariant, entry.source])) +
  `\n\nNo new design system or new hard-coded color palette is required. Screenshot/current-render verdict: \`${visualInvariants.screenshotMatch}\`.` +
  reportFooter("visualInvariants");

const renderDesktop = () => title("Product Goal and Context Desktop Specification") +
  bullets([
    "Keep the current constrained column and photographic BackgroundShell.",
    "Place primary goal near the top in the eventual architecture; F does not reorder fields.",
    "Render conditional follow-up inside the goal section, never in a side panel or modal.",
    "Retain two-column checkbox grids only where labels fit.",
    "Keep concise helper text and a full-width CTA.",
    "Preserve dirty-state confirmation and active-session warning behavior.",
    "Prevent horizontal overflow at 1024 and 1440 px.",
  ]) + reportFooter("desktop");

const renderMobile = () => title("Product Goal and Context Mobile Specification") +
  bullets([
    "Use one column at 320-390 px.",
    "Keep every interactive target at least 44 by 44 px.",
    "Wrap labels without clipping and preserve visible focus.",
    "Expand follow-up inline; collapse checkbox grids where needed.",
    "Do not use hover-only behavior or horizontal scrolling.",
    "Keep CTA in document flow and reserve bottom safe space for Info and Menu.",
    "Keep error text near its field and screen-reader order aligned with visual order.",
    "Respect reduced motion.",
  ]) + `\n\nCurrent synthetic render result: \`${responsiveAccessibility.currentRenderResult}\`.` +
  reportFooter("mobile");

const renderAccessibility = () => title("Product Goal and Context Accessibility Contract") +
  `This is a design contract, not a WCAG conformance claim.\n\n${bullets(responsiveAccessibility.accessibilityContract)}\n\n` +
  `Review matrix:\n\n${bullets(responsiveAccessibility.reviewMatrix)}` + reportFooter("accessibility");

const renderCopyMatrix = () => title("Product Goal and Context Copy Matrix") +
  table(["Field", "Label", "Helper", "Validation", "Unsupported", "F relevance", "Later relevance"],
    copyMatrix.map((row) => [row.fieldId, row.label, row.helper, row.validationCopy, row.unsupportedCopy,
      row.fRelevance, row.laterRelevance])) + reportFooter("copyMatrix");

const renderStateMachine = () => title("Product Goal and Context State Machine") +
  `States: ${stateMachine.states.length}.\n\n` +
  table(["From", "Event", "To"], stateMachine.transitions.map((entry) => [entry.from, entry.event, entry.to])) +
  `\n\nProhibited transitions:\n\n${bullets(stateMachine.prohibitedTransitions)}\n\n` +
  `Inactive preview reaches legacy generation: no. Unsupported focus reaches generation: no. Cancel restores exact committed state: yes. Current legacy flow remains representable: yes.` +
  reportFooter("stateMachine");

const renderGoalPolicy = () => title("Product Goal Option State Policy") +
  `State vocabulary: ${goalOptionPolicy.stateVocabulary.map((state) => `\`${state}\``).join(", ")}.\n\n` +
  table(["ID", "Display", "Outcome", "States", "Follow-up", "Submission"], goalOptionPolicy.options.map((option) =>
    [option.id, option.displayLabel, option.canonicalOutcome, option.states.join(", "), option.requiredFollowUp, option.submissionBehavior])) +
  `\n\nFirst inactive option: \`get_stronger\`. No current UI reads this registry in Chunk E.` +
  reportFooter("goalOptionStates");

const renderPrimaryGoal = () => title("Product Goal and Context Primary Goal") +
  `Preferred label: **${primaryGoalDesign.fieldLabel}**. Compact alternative: **${primaryGoalDesign.compactLabel}**.\n\n` +
  `Use the existing compact select direction with stable canonical IDs, a closed registry, explicit availability, mapping, follow-up, compatibility, and provenance. ` +
  `Fuzzy matching and arbitrary-string behavior remain prohibited.` + reportFooter("primaryGoal");

const renderFollowUp = () => title("Product Goal and Context Conditional Follow-Up") +
  `Follow-up expands ${followUpDesign.placement}; modal and separate-route counts are zero.\n\n` +
  `## Fitness and stamina\n\nPrompt: **${followUpDesign.fitnessAndStamina.prompt}**\n\n${bullets(followUpDesign.fitnessAndStamina.options)}\n\n` +
  `Systemic conditioning remains policy-required and is never remapped.\n\n` +
  `## Athletic performance\n\nPrompt: **${followUpDesign.athleticPerformance.prompt}**\n\n${bullets(followUpDesign.athleticPerformance.options)}\n\n` +
  `Unsupported focus is visibly unavailable or follow-up-required.` + reportFooter("followUp");

const renderPain = () => title("Product Goal and Context Pain and Limitations") +
  `Label: **${painContextDesign.label}**\n\nHelper: ${painContextDesign.helper}\n\n` +
  `Pain is optional context. Diagnosis, severity inference, permanent blocks, generic corrective circuits, and Safety escalation from region alone all remain zero. ` +
  `Knees remains \`${painContextDesign.kneesDisposition}\`.` + reportFooter("painContext");

const renderReducePainMigration = () => title("Product Goal and Context Legacy Reduce Pain Migration") +
  `Display: **${reducePainMigration.display}**\n\nPrompt: ${reducePainMigration.prompt}\n\n` +
  bullets([
    "Preserve the current Program until explicit confirmation.",
    "Preserve selected pain regions and history.",
    "Require a primary outcome without silently selecting posture.",
    "Do not migrate or regenerate on read.",
    "Do not implement this migration in F.",
  ]) + reportFooter("reducePainMigration");

const renderTrainingMode = () => title("Product Goal and Context Training Mode") +
  `Label: **${trainingModeDesign.label}**\n\n` +
  table(["ID", "Label", "Copy"], trainingModeDesign.modes.map((mode) => [mode.id, mode.label, mode.copy])) +
  `\n\nCurrent copy issue: ${trainingModeDesign.currentBuildCopyIssue}. Training mode remains separate from outcome.` +
  reportFooter("trainingMode");

const renderSecondaryGoal = () => title("Product Goal and Context Secondary Goal") +
  `Disclosure: **${secondaryGoalDesign.disclosureLabel}**. It is collapsed by default, optional, removable, inline, limited to one, distinct from primary, and unable to override primary. ` +
  `F implementation count: 0.` + reportFooter("secondaryGoal");

const renderScheduleMinutes = () => title("Product Goal and Context Schedule and Minutes") +
  `Days label: **${scheduleExperienceEquipmentDesign.days.label}**. Preserve 3 / 4 / 5 and infer no weekdays, dates, spacing, two-a-days, or minutes.\n\n` +
  `Minutes label: **${scheduleExperienceEquipmentDesign.minutes.label}**. Include an explicit value or **Not sure**. ` +
  `Evidence candidates are ${scheduleExperienceEquipmentDesign.minutes.evidenceCandidates.join(", ")}; final Product options remain \`${scheduleExperienceEquipmentDesign.minutes.finalOptionDisposition}\`. ` +
  `Unknown duration must never be called exact fit.` + reportFooter("minutes");

const renderExperience = () => title("Product Goal and Context Experience") +
  `Preserve Beginner / Intermediate / Advanced initially.\n\nHelper: ${scheduleExperienceEquipmentDesign.experience.helper}\n\n` +
  `Training years, exact load, exact volume, exercise familiarity, and recovery are not inferred or added in F.` +
  reportFooter("experience");

const renderEquipment = () => title("Product Goal and Context Equipment Progressive Disclosure") +
  `Top level: ${scheduleExperienceEquipmentDesign.equipment.topLevel.join(", ")}. ` +
  `Separate environment, capability, and exact-load realization. Use the smallest truthful hybrid: top-level environment on the form plus one inline capability question only when legality requires it.\n\n` +
  table(["Environment", "Potential conditional facts"], [
    ["Resistance bands", scheduleExperienceEquipmentDesign.equipment.bands.join(", ")],
    ["Dumbbells", scheduleExperienceEquipmentDesign.equipment.dumbbells.join(", ")],
    ["Gym", scheduleExperienceEquipmentDesign.equipment.gym.join(", ")],
    ["No equipment", scheduleExperienceEquipmentDesign.equipment.none.join(", ")],
  ]) + `\n\nNo full-gym universal inference, band kilogram equivalence, or mandatory initial exact-load input is authorized. Legal self-selected calibration may substitute after base legality is known.` +
  reportFooter("equipment");

const renderSignature = () => title("Product Goal and Context Questionnaire Signature V2 Design") +
  `Design-only contract: \`${signatureV2Design.reference.contractId}@${signatureV2Design.reference.contractVersion}\`. Canonical IDs replace display labels.\n\n` +
  table(["Field", "Ownership"], signatureV2Design.semanticInputs.map((entry) => [entry.field, entry.ownership])) +
  `\n\nCurrent \`trainingIntent\` is absent from V1 signature identity. V1 behavior is unchanged; V2 is not implemented.` +
  reportFooter("signatureV2Design");

const renderProfile = () => title("Product Goal and Context Product Profile V2 Design") +
  `Design-only type: \`${productProfileV2Design.typeName}\` / \`${productProfileV2Design.reference.contractVersion}\`.\n\n` +
  `Fields:\n\n${bullets(productProfileV2Design.fields)}\n\n` +
  `Prohibited fields/owners:\n\n${bullets(productProfileV2Design.prohibitedFields)}\n\n` +
  `Runtime exports: 0. Exercise, dose, Program, diagnosis, and free-text parsing remain outside this contract.` +
  reportFooter("productProfileV2Design");

const renderLegacy = () => title("Product Goal and Context Legacy Compatibility") +
  table(["Vocabulary", "Values"], [
    ["Goals", legacyCompatibility.goals.join(", ")],
    ["Modes", legacyCompatibility.modes.join(", ")],
    ["Equipment", legacyCompatibility.equipment.join(", ")],
    ["Experience", legacyCompatibility.experience.join(", ")],
  ]) + `\n\nOld profiles load and old Programs remain valid. Migration-on-read, regeneration-on-read, and silent goal rewrites are all zero. Historical shadow replay and current routes remain exact.` +
  reportFooter("legacyCompatibility");

const renderParity = () => title("Product Goal and Context Consumer and Gyms Parity") +
  table(["Dimension", "Consumer", "Gyms"], [
    ["Schema shape", "duplicated equivalent", "duplicated equivalent"],
    ["Training mode visible", true, false],
    ["Ordinary equipment", "user checkboxes", "user checkboxes"],
    ["Buyer demo equipment", "not applicable", "gym-owner locked panel"],
    ["F scope", "inactive preview candidate", "runtime invariant"],
  ]) + `\n\nFuture direction: ${consumerGymsParity.futureDirection}. E gyms runtime changes: 0.` +
  reportFooter("consumerGymsParity");

const renderRisks = () => title("Product Goal and Context Design Risks") +
  table(["Risk", "Severity", "Evidence", "Mitigation", "F", "Later"], designRisks.map((risk) =>
    [risk.id, risk.severity, risk.evidence, risk.mitigation, risk.fRelevance, risk.laterRelevance])) +
  reportFooter("designRisks");

const renderOptions = () => title("Product Goal and Context Design Options") +
  table(["Option", "Label", "Advantages", "Risks"], designOptions.compared.map((option) =>
    [option.id, option.label, option.advantages.join(", "), option.risks.join(", ")])) +
  `\n\nOwner-selected immediate direction: **Option A**. Goal cards remain an optional later design. A separate goal step is not selected.` +
  reportFooter("designOptions");

const renderFirstSurface = () => title("Product Goal and Context First Surface Recommendation") +
  `The first later active Product surface remains one consumer questionnaire/profile page:\n\n` +
  informationArchitecture.eventualOrder.map((field, index) => `${index + 1}. ${field}`).join("\n") +
  `\n\nChunk F delta is only \`get_stronger\` under an explicit inactive preview. It changes no current route, persistence, generation, shadow call, or output.` +
  reportFooter("firstSurfaceRecommendation");

const renderFHandoff = () => title("One Inactive Get Stronger Product Option V1 Implementation Handoff") +
  `Contract: \`${fHandoff.reference.contractId}@${fHandoff.reference.contractVersion}\`.\n\n` +
  `Option: \`${fHandoff.option.id}\` / **${fHandoff.option.displayLabel}** / \`${fHandoff.option.canonicalOutcome}\` / \`${fHandoff.option.state}\`.\n\n` +
  `## Likely affected files\n\n${bullets(fHandoff.likelyAffectedFiles)}\n\n` +
  `## Prohibited files and areas\n\n${bullets(fHandoff.prohibitedFilesAndAreas)}\n\n` +
  `## Guards\n\n${bullets(fHandoff.activationGuards)}\n\n` +
  `Ordinary consumer visibility: no. Ordinary gyms visibility: no. Buyer demo visibility: no. ` +
  `Preview may render/select/expose a structured value; it may not persist, call \`generateProgram\`, call current-route Product Shadow, or return V2 output. ` +
  `Non-preview submission fails closed.\n\nRollback: ${fHandoff.rollback}.\n\nExpected F classification: \`${fHandoff.expectedClassification}\`.` +
  reportFooter("fHandoff");

const renderReadiness = () => title("Screenshot-Guided Product Goal and Context Input Design Readiness") +
  `Combined status: \`${chunkEReadiness.combinedStatus}\`.\n\nClassification: \`${chunkEReadiness.classification}\`.\n\n` +
  table(["Evidence", "Result"], [
    ["Selected surface", "consumer /questionnaire"],
    ["Screenshot observation contract", "OWNER_SUPPLIED_PRODUCT_SCREENSHOT_OBSERVATION_CORPUS@1.0.0"],
    ["Current render baseline", `${currentRenderBaseline.entries.length} states`],
    ["Drift", `${driftAudit.unresolvedCount} targeted unresolved records`],
    ["Design mutations", `${designMutationResults.rejectedCount}/${designMutationResults.totalCount} rejected`],
    ["Metamorphic", `${validationSummary.metamorphicPassed}/${validationSummary.metamorphicTotal} passed`],
    ["Product/UI/runtime changes", 0],
    ["Activation", 0],
  ]) + `\n\nRemaining unsupported policy gaps: ${chunkEReadiness.unsupportedPolicyGaps.join(", ")}.\n\n` +
  `Exact next dependency: \`${chunkEReadiness.nextDependency}\`.` + reportFooter("readiness");

export const chunkEMarkdownReports: Readonly<Record<string, string>> = Object.freeze({
  "SCREENSHOT_GUIDED_PRODUCT_GOAL_CONTEXT_DESIGN_ONTOLOGY_AUDIT.md": renderOntology(),
  "OWNER_SUPPLIED_PRODUCT_SCREENSHOT_OBSERVATION_CORPUS.md": renderScreenshotCorpus(),
  "PRODUCT_GOAL_CONTEXT_CURRENT_RENDER_BASELINE.md": renderBaseline(),
  "PRODUCT_GOAL_CONTEXT_SCREENSHOT_CODE_RENDER_DRIFT_AUDIT.md": renderDrift(),
  "PRODUCT_GOAL_CONTEXT_CURRENT_IMPLEMENTATION_OWNERSHIP.md": renderOwnership(),
  "PRODUCT_GOAL_CONTEXT_INFORMATION_ARCHITECTURE.md": renderInformationArchitecture(),
  "PRODUCT_GOAL_CONTEXT_VISUAL_INVARIANTS.md": renderVisual(),
  "PRODUCT_GOAL_CONTEXT_DESKTOP_SPEC.md": renderDesktop(),
  "PRODUCT_GOAL_CONTEXT_MOBILE_SPEC.md": renderMobile(),
  "PRODUCT_GOAL_CONTEXT_ACCESSIBILITY.md": renderAccessibility(),
  "PRODUCT_GOAL_CONTEXT_COPY_MATRIX.md": renderCopyMatrix(),
  "PRODUCT_GOAL_CONTEXT_STATE_MACHINE.md": renderStateMachine(),
  "PRODUCT_GOAL_OPTION_STATE_POLICY.md": renderGoalPolicy(),
  "PRODUCT_GOAL_CONTEXT_PRIMARY_GOAL.md": renderPrimaryGoal(),
  "PRODUCT_GOAL_CONTEXT_FOLLOW_UP.md": renderFollowUp(),
  "PRODUCT_GOAL_CONTEXT_PAIN_LIMITATIONS.md": renderPain(),
  "PRODUCT_GOAL_CONTEXT_LEGACY_REDUCE_PAIN_MIGRATION.md": renderReducePainMigration(),
  "PRODUCT_GOAL_CONTEXT_TRAINING_MODE.md": renderTrainingMode(),
  "PRODUCT_GOAL_CONTEXT_SECONDARY_GOAL.md": renderSecondaryGoal(),
  "PRODUCT_GOAL_CONTEXT_SCHEDULE_MINUTES.md": renderScheduleMinutes(),
  "PRODUCT_GOAL_CONTEXT_EXPERIENCE.md": renderExperience(),
  "PRODUCT_GOAL_CONTEXT_EQUIPMENT_PROGRESSIVE_DISCLOSURE.md": renderEquipment(),
  "PRODUCT_GOAL_CONTEXT_QUESTIONNAIRE_SIGNATURE_V2_DESIGN.md": renderSignature(),
  "PRODUCT_GOAL_CONTEXT_PRODUCT_PROFILE_V2_DESIGN.md": renderProfile(),
  "PRODUCT_GOAL_CONTEXT_LEGACY_COMPATIBILITY.md": renderLegacy(),
  "PRODUCT_GOAL_CONTEXT_CONSUMER_GYMS_PARITY.md": renderParity(),
  "PRODUCT_GOAL_CONTEXT_DESIGN_RISKS.md": renderRisks(),
  "PRODUCT_GOAL_CONTEXT_DESIGN_OPTIONS.md": renderOptions(),
  "PRODUCT_GOAL_CONTEXT_FIRST_SURFACE_RECOMMENDATION.md": renderFirstSurface(),
  "ONE_INACTIVE_GET_STRONGER_PRODUCT_OPTION_V1_IMPLEMENTATION_HANDOFF.md": renderFHandoff(),
  "SCREENSHOT_GUIDED_PRODUCT_GOAL_CONTEXT_INPUT_DESIGN_READINESS.md": renderReadiness(),
});

export const chunkEJsonReports: Readonly<Record<string, string>> = Object.freeze({
  "OWNER_SUPPLIED_PRODUCT_SCREENSHOT_OBSERVATIONS.json": jsonReport(ownerScreenshotCorpus),
  "PRODUCT_GOAL_CONTEXT_CURRENT_RENDER_BASELINE.json": jsonReport(currentRenderBaseline),
  "PRODUCT_GOAL_CONTEXT_SCREENSHOT_CODE_RENDER_DRIFT_AUDIT.json": jsonReport(driftAudit),
  "PRODUCT_GOAL_CONTEXT_CURRENT_IMPLEMENTATION_OWNERSHIP.json": jsonReport(currentOwnership),
  "PRODUCT_GOAL_CONTEXT_VISUAL_INVARIANTS.json": jsonReport(visualInvariants),
  "PRODUCT_GOAL_CONTEXT_INFORMATION_ARCHITECTURE.json": jsonReport(informationArchitecture),
  "PRODUCT_GOAL_OPTION_STATES.json": jsonReport(goalOptionPolicy),
  "PRODUCT_GOAL_CONTEXT_COPY_MATRIX.json": jsonReport(copyMatrix),
  "PRODUCT_GOAL_CONTEXT_STATE_MACHINE.json": jsonReport(stateMachine),
  "PRODUCT_GOAL_CONTEXT_INPUT_NECESSITY_PROJECTION.json": jsonReport(inputNecessityProjection),
  "ONE_INACTIVE_GET_STRONGER_PRODUCT_OPTION_V1_IMPLEMENTATION_HANDOFF.json": jsonReport(fHandoff),
  "PRODUCT_GOAL_CONTEXT_DESIGN_MUTATIONS.json": jsonReport(designMutationResults.mutations),
  "PRODUCT_GOAL_CONTEXT_DESIGN_METAMORPHIC_RESULTS.json": jsonReport(designMetamorphicResults),
  "PRODUCT_GOAL_CONTEXT_DESIGN_FINGERPRINTS.json": jsonReport(chunkEFingerprints),
  "SCREENSHOT_GUIDED_PRODUCT_GOAL_CONTEXT_INPUT_DESIGN_READINESS.json": jsonReport({
    ...chunkEReadiness,
    validation: validationSummary,
    fingerprints: chunkEFingerprints,
  }),
});

export const reportCorpusFingerprint = fingerprint({
  markdown: chunkEMarkdownReports,
  json: chunkEJsonReports,
  designEvidence,
});
