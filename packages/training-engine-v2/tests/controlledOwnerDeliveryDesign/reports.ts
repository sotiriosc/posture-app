import { fingerprint, jsonReport, ownerDeliveryContracts } from "./contracts";
import {
  activationGuards,
  activeProgramOwnership,
  activeSessionConflict,
  applicationDesign,
  approvalDesign,
  auditAnswers,
  authBaseline,
  billingBoundary,
  chunkGReadiness,
  controlledScenarios,
  currentProductInvariance,
  deliveryHealthGates,
  deliveryModePolicy,
  enrollmentDesign,
  fixedShellCohorts,
  generationDesign,
  getStrongerMapping,
  identityPolicy,
  implementationHandoff,
  killSwitchDesign,
  legacyFallback,
  lockedHoldout,
  metamorphicResults,
  minimumInputs,
  monitoringDesign,
  mutationResults,
  ontologyAudit,
  outcomeLongitudinal,
  ownerProfileDesign,
  ownerRouteDesign,
  ownerSurfaces,
  practiceOptionDelivery,
  previewDesign,
  privacySecurity,
  productProjection,
  productShadowBoundary,
  profileImportBoundary,
  programEnvelope,
  responsiveAccessibility,
  rollbackDesign,
  stateMachine,
  stressEvidence,
  twoKeyAuthorization,
  upstreamBaseline,
} from "./evidence";
import { validationSummary } from "./validation";

const bullets = (values: readonly string[]) => values.map((value) => `- ${value}`).join("\n");
const code = (value: unknown) => `\`${String(value)}\``;
const title = (value: string) => `# ${value}\n\n`;
const footer = () => `\n\nDesign-only. Owner delivery and Product activation counts remain ${code(0)}. ` +
  `Exact next dependency: ${code(chunkGReadiness.nextDependency)}.\n`;

const contractLine = (reference: { contractId: string; contractVersion: string }) =>
  `Contract: ${code(`${reference.contractId}@${reference.contractVersion}`)}.`;

const renderOntology = () => title("Controlled Owner Get Stronger Delivery Ontology Audit") +
  `Classification: ${code(ontologyAudit.classification)}. Live-account reads: ${code(0)}.\n\n` +
  `## Ownership audit\n\n| Subject | Classification |\n| --- | --- |\n` +
  ontologyAudit.rows.map((row) => `| ${row.subject} | ${code(row.classification)} |`).join("\n") +
  `\n\n## Required answers\n\n` + auditAnswers.map((row) => `${row.number}. **${row.question}** ${row.answer}`).join("\n") + footer();

const renderOwnerBoundaries = () => title("Controlled Owner Get Stronger Delivery Owner Boundaries") +
  `Authentication remains current authority. ${code("AUTH_USER_EMAIL")} remains a bootstrap identity input and ` +
  `configured owner reference, never sufficient delivery authority. The owner owns explicit enrollment, profile ` +
  `confirmation, review, approval, application, and rollback. Product Shadow remains counterfactual. Billing remains ` +
  `separate. G implementation and H activation remain open.` + footer();

const renderIdentity = () => title("Controlled Owner Account Identity Policy") +
  `${contractLine(identityPolicy.contract)}\n\nConfigured identity is referenced only as ${code(identityPolicy.configuredIdentitySource)}. ` +
  `Normalization: ${identityPolicy.normalization.map(code).join(", ")}. Passive calls: ` +
  `${identityPolicy.passiveResolution.map(code).join(", ")}. Prohibited calls: ${identityPolicy.prohibitedCalls.map(code).join(", ")}. ` +
  `Persisted owner identity: ${code(identityPolicy.persistedIdentity)}. The signed token resolves by sub and current ` +
  `readServerSession projects stored id/email/plan; token email is not delivery authority. Mismatch behavior: ${code(identityPolicy.mismatchBehavior)}.` + footer();

const renderMode = () => title("Controlled Owner Delivery Mode Policy") +
  `Server-only variable: ${code(deliveryModePolicy.variable)}. Closed values: ${deliveryModePolicy.values.map(code).join(", ")}. ` +
  `Absent or unknown defaults to ${code(deliveryModePolicy.default)}. No public variable exists. Preview cannot apply; ` +
  `apply remains exact-owner-only; off performs no writes or discovery.` + footer();

const renderTwoKey = () => title("Controlled Owner Two-Key Authorization") +
  `Key A: ${code(twoKeyAuthorization.keyA)}. Key B: ${code(twoKeyAuthorization.keyB)}. ` +
  `Application additionally requires ${code(twoKeyAuthorization.applicationAlsoRequires)}. Identity-only activation and client authority are both 0.` + footer();

const renderEnrollment = () => title("Controlled Owner V2 Enrollment Design") +
  `${contractLine(enrollmentDesign.contract)}\n\nStates: ${enrollmentDesign.states.map(code).join(", ")}. ` +
  `Enrollment is explicit, persists stable userId, fixed strength goal, versions and consent, and stores no email or free text.` + footer();

const renderProfile = () => title("Controlled Owner Get Stronger Profile Design") +
  `${contractLine(ownerProfileDesign.contract)}\n\nPrimary goal: ${code(ownerProfileDesign.primaryGoal)}. Training mode: ` +
  `${code(ownerProfileDesign.trainingMode)}. Secondary goal: ${code(ownerProfileDesign.secondaryGoal)}. ` +
  `Fields: ${ownerProfileDesign.fields.map(code).join(", ")}. This profile remains separate from current QuestionnaireData.` + footer();

const renderMinimumInputs = () => title("Controlled Owner Minimum Inputs") +
  `Preview generation requires explicit confirmation of ${code(minimumInputs.length)} structured inputs:\n\n${bullets(minimumInputs)}` +
  `\n\nUnknown minutes are visible in preview but must be resolved before approval/application.` + footer();

const renderImport = () => title("Controlled Owner Profile Import Boundary") +
  `Current Product facts may appear only as proposed imports with states ${profileImportBoundary.states.map(code).join(", ")}.\n\n` +
  `Prohibited inferences:\n\n${bullets(profileImportBoundary.prohibitedInferences)}` + footer();

const renderMapping = () => title("Controlled Owner Get Stronger Mapping") +
  `Product option ${code(getStrongerMapping.productOptionId)} maps exactly to outcome and weekly goal ` +
  `${code(getStrongerMapping.outcome)} in ${code(getStrongerMapping.trainingMode)} mode, with no secondary goal. ` +
  `No pain, hypertrophy, power, conditioning, composition, or performance remapping is allowed.` + footer();

const renderGeneration = () => title("Controlled Owner V2 Generation Design") +
  `${contractLine(generationDesign.contract)}\n\nServer-only production stages:\n\n${bullets(generationDesign.stages)}\n\n` +
  `Canned stages, Product Shadow delivery, client-authored engine artifacts, and legacy generateProgram calls are all 0.` + footer();

const renderPreview = () => title("Controlled Owner V2 Preview Design") +
  `${contractLine(previewDesign.contract)}\n\nReadiness states: ${previewDesign.states.map(code).join(", ")}. ` +
  `Only ${code(previewDesign.readyState)} can proceed. Review displays ${previewDesign.reviewDisplay.map(code).join(", ")} ` +
  `and makes none of ${previewDesign.prohibitedClaims.map(code).join(", ")}. Every preview is counterfactual, unapplied, lineage-complete, and changes no Product state.` + footer();

const renderApproval = () => title("Controlled Owner V2 Approval Design") +
  `${contractLine(approvalDesign.contract)}\n\nApproval is separate from application and binds one exact current preview ` +
  `fingerprint and version set. It requires apply mode, explicit consent, CSRF-safe same-origin mutation, idempotency, and no active-session conflict. ` +
  `Before apply mode enablement, health gates require ${deliveryHealthGates.map(code).join(", ")}.` + footer();

const renderApplication = () => title("Controlled Owner V2 Application Design") +
  `${contractLine(applicationDesign.contract)}\n\nApplication creates an immutable V2 envelope and owner-scoped active pointer. ` +
  `Legacy Program, ProgramProgress, history, and drafts are preserved. Stale previews and active-session conflicts fail closed. ` +
  `Legacy overwrite counts are 0.` + footer();

const renderOwnership = () => title("Controlled Owner Active Program Ownership") +
  `Owner-scoped modes are ${activeProgramOwnership.values.map(code).join(" and ")}. Initial mode is ` +
  `${code(activeProgramOwnership.initial)}; application selects ${code("v2_owner")}; rollback restores ${code("legacy")}. ` +
  `The pointer is persisted server-side and is neither global nor browser authority.` + footer();

const renderEnvelope = () => title("Owner V2 Product Program Envelope") +
  `${contractLine(programEnvelope.contract)}\n\nThe immutable envelope remains source of truth and preserves:\n\n` +
  `${bullets(programEnvelope.fields)}\n\nThe display projection is never the only truth.` + footer();

const renderProjection = () => title("Owner V2 Product Projection") +
  `Projection supports ${productProjection.supports.map(code).join(", ")} while preserving ` +
  `${productProjection.preservedLineage.map(code).join(", ")}. An immutable lineage sidecar is required; lineage loss is 0.` + footer();

const renderWeek = () => title("Controlled Owner Week Surface") +
  `Future route: ${code(ownerSurfaces.week.route)}. It reads the V2 envelope and displays purpose, count, duration truth, ` +
  `warnings, phase, owner-preview label, and legacy fallback. Ordinary /results remains unchanged.` + footer();

const renderSession = () => title("Controlled Owner Session Surface") +
  `Future route: ${code(ownerSurfaces.session.route)}. Dedicated owner routing is selected. It consumes ` +
  `${ownerSurfaces.session.uses.map(code).join(", ")} and imports nothing into current SessionClient.` + footer();

const renderPractice = () => title("Controlled Owner Session Practice Delivery") +
  `Owner V2 defaults to Full, separates Suggested state, requires explicit selection, locks after execution, and persists exact ` +
  `draft, realization, replay, and completion. Historical filtering calls are 0; ordinary Product remains V1.` + footer();

const renderFallback = () => title("Controlled Owner Legacy Fallback") +
  `Before application, capture ${legacyFallback.immutableReference.map(code).join(", ")}. Rollback restores the pointer ` +
  `without deleting V2 Program, Performance, legacy Program, progress, history, or drafts.` + footer();

const renderConflict = () => title("Controlled Owner Active Session Conflict") +
  `Application blockers:\n\n${bullets(activeSessionConflict.blockers)}\n\nNo active session is terminated automatically; the exact conflict is shown.` + footer();

const renderRollback = () => title("Controlled Owner V2 Rollback") +
  `${contractLine(rollbackDesign.contract)}\n\nRollback is explicit, idempotent and audited; it restores the legacy pointer ` +
  `while preserving all records and outcome evidence. Data deletion count: 0.` + footer();

const renderKillSwitch = () => title("Controlled Owner Kill Switch") +
  `Mode ${code(killSwitchDesign.mode)} blocks new access, generation, preview and apply. An active attempt may complete safely ` +
  `under exact persisted truth or enter a controlled disabled state before legacy navigation. It is never stranded; no data is deleted.` + footer();

const renderOutcome = () => title("Controlled Owner Outcome and Longitudinal Boundary") +
  `V2 execution records ${outcomeLongitudinal.performance.map(code).join(", ")}, then emits ` +
  `${outcomeLongitudinal.outcome.map(code).join(", ")}. Legacy logs remain restricted context, never V2 Performance. ` +
  `Automatic progression, regression, and deload counts are 0.` + footer();

const renderMonitoring = () => title("Controlled Owner Monitoring") +
  `Structured events: ${monitoringDesign.structuredEvents.map(code).join(", ")}. Prohibited fields: ` +
  `${monitoringDesign.prohibited.map(code).join(", ")}. Email logging and free-text telemetry counts are 0.` + footer();

const renderPrivacy = () => title("Controlled Owner Privacy and Security") +
  `Persisted identity is userId only. Tests use synthetic fixtures. Email, raw free text, photos, passwords, tokens, and raw ` +
  `Product snapshots are excluded. Security requires server session verification, exact identity consistency, CSRF, same-origin, ` +
  `no GET mutation, rate limits, idempotency, append-only audit, no caching, and 404 for ineligible access.` + footer();

const renderBilling = () => title("Controlled Owner Billing Boundary") +
  `Owner delivery entitlement is independent of billing. Plan, Stripe, paywall, and public Pro mutation counts are 0.` + footer();

const renderShadow = () => title("Controlled Owner Product Shadow Boundary") +
  `Product Shadow remains counterfactual with its own allowlist, route and persistence. Shadow artifacts, comparisons, modes, ` +
  `and allowlists cannot authorize or become delivered owner Programs. Applied Shadow artifact count: 0.` + footer();

const renderInvariance = () => title("Controlled Owner Current Product Invariance") +
  `Current routes ${currentProductInvariance.routes.map(code).join(", ")} remain exact. Runtime, middleware, Questionnaire, ` +
  `goal option, visibility, generateProgram, persistence, Product Shadow, practice control, gyms, owner route, owner Program, ` +
  `delivery, and activation deltas are all 0.` + footer();

const renderStateMachine = () => title("Controlled Owner Get Stronger Delivery State Machine") +
  `${contractLine(stateMachine.contract)}\n\nStates (${stateMachine.stateCount}): ${stateMachine.states.map(code).join(", ")}. ` +
  `Every transition declares owner, preconditions, side effects, idempotency, failure and rollback. Automatic apply transitions: 0.` + footer();

const renderResponsive = () => title("Controlled Owner Get Stronger Delivery Responsive Accessibility") +
  `Design widths: ${responsiveAccessibility.widths.map(code).join(", ")}. Mobile is one column; controls are at least 44 px; ` +
  `forms are semantic and keyboard-operable; focus is visible; generation uses aria-live; status is not color-only; reduced motion ` +
  `is honored; critical information is not modal-only. UI implementation count: 0.` + footer();

const renderOptions = () => title("Controlled Owner Get Stronger Delivery Options") +
  `Selected: **Option A**, dedicated owner-only route under /account. Option B's current-route branching risks legacy collision. ` +
  `Option C's legacy-store projection risks lineage loss and difficult rollback. Neutral presentation may be shared; decision authority may not.` + footer();

const renderHandoff = () => title("Controlled Owner Get Stronger Delivery Implementation Handoff") +
  `${contractLine(implementationHandoff.contract)}\n\nLater implementation sequence:\n\n` +
  implementationHandoff.steps.map((step, index) => `${index + 1}. ${step}`).join("\n") +
  `\n\nExpected commits: ${Object.entries(implementationHandoff.expectedCommits).map(([key, value]) => `${key}: ${value}`).join("; ")}. ` +
  `No implementation is executed in this tranche.` + footer();

const holdoutCategories = Object.fromEntries(Object.entries(
  lockedHoldout.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    return counts;
  }, {})
));

const renderHoldout = () => title("Controlled Owner Account Get Stronger Delivery Design V1 Holdout Manifest") +
  `Frozen cases: ${code(lockedHoldout.length)}. Categories: ` +
  `${Object.entries(holdoutCategories).map(([key, value]) => `${key}=${value}`).join(", ")}. ` +
  `All identities are synthetic; all modes, states and failure classes are represented; accepted downstream rescue is 0.` + footer();

const renderMutations = () => title("Controlled Owner Get Stronger Delivery Mutation Report") +
  `Semantic mutations: ${code(mutationResults.length)}; rejected: ${code(mutationResults.filter((row) => row.rejected).length)}; ` +
  `accepted downstream rescue: ${code(0)}. Identity, profile, generation, application, security, Product and scope mutations all fail closed.` + footer();

const renderMetamorphic = () => title("Controlled Owner Get Stronger Delivery Metamorphic Report") +
  `Invariants: ${code(`${metamorphicResults.invariants.length}/${metamorphicResults.invariants.length}`)}. ` +
  `Material responses: ${code(`${metamorphicResults.materialResponses.length}/${metamorphicResults.materialResponses.length}`)}. ` +
  `Repeated deterministic design simulation passed.` + footer();

const renderStress = () => title("Controlled Owner Get Stronger Delivery Stress Report") +
  Object.entries(stressEvidence).map(([key, value]) => `- ${key}: ${code(value)}`).join("\n") + footer();

const renderGuards = () => title("Controlled Owner Get Stronger Delivery Activation Guards") +
  Object.entries(activationGuards).map(([key, value]) => `- ${key}: ${code(value)}`).join("\n") + footer();

const renderReadiness = () => title("Controlled Owner Get Stronger Delivery Design Readiness") +
  `Classification: ${code(chunkGReadiness.classification)}.\n\nOntology: ${code(chunkGReadiness.ontology)}.\n\n` +
  `Combined status: ${code(chunkGReadiness.combinedStatus)}.\n\nSelected Option A and dedicated route are fully designed. ` +
  `Controlled scenarios: ${code(controlledScenarios.length)}; fixed-shell cohorts: ${code(validationSummary.fixedShellCohortCount)}; ` +
  `locked holdout: ${code(lockedHoldout.length)}; mutations rejected: ` +
  `${code(`${validationSummary.mutationRejectedCount}/${validationSummary.mutationCount}`)}; design/stress failures: ` +
  `${code(`${validationSummary.designFailureCount}/${validationSummary.stressFailureCount}`)}. G implementation and H remain open.` + footer();

export const gDesignMarkdownReports: Readonly<Record<string, string>> = Object.freeze({
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ONTOLOGY_AUDIT.md": renderOntology(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_OWNER_BOUNDARIES.md": renderOwnerBoundaries(),
  "CONTROLLED_OWNER_ACCOUNT_IDENTITY_POLICY.md": renderIdentity(),
  "CONTROLLED_OWNER_DELIVERY_MODE_POLICY.md": renderMode(),
  "CONTROLLED_OWNER_TWO_KEY_AUTHORIZATION.md": renderTwoKey(),
  "CONTROLLED_OWNER_V2_ENROLLMENT_DESIGN.md": renderEnrollment(),
  "CONTROLLED_OWNER_GET_STRONGER_PROFILE_DESIGN.md": renderProfile(),
  "CONTROLLED_OWNER_MINIMUM_INPUTS.md": renderMinimumInputs(),
  "CONTROLLED_OWNER_PROFILE_IMPORT_BOUNDARY.md": renderImport(),
  "CONTROLLED_OWNER_GET_STRONGER_MAPPING.md": renderMapping(),
  "CONTROLLED_OWNER_V2_GENERATION_DESIGN.md": renderGeneration(),
  "CONTROLLED_OWNER_V2_PREVIEW_DESIGN.md": renderPreview(),
  "CONTROLLED_OWNER_V2_APPROVAL_DESIGN.md": renderApproval(),
  "CONTROLLED_OWNER_V2_APPLICATION_DESIGN.md": renderApplication(),
  "CONTROLLED_OWNER_ACTIVE_PROGRAM_OWNERSHIP.md": renderOwnership(),
  "OWNER_V2_PRODUCT_PROGRAM_ENVELOPE.md": renderEnvelope(),
  "OWNER_V2_PRODUCT_PROJECTION.md": renderProjection(),
  "CONTROLLED_OWNER_WEEK_SURFACE.md": renderWeek(),
  "CONTROLLED_OWNER_SESSION_SURFACE.md": renderSession(),
  "CONTROLLED_OWNER_SESSION_PRACTICE_DELIVERY.md": renderPractice(),
  "CONTROLLED_OWNER_LEGACY_FALLBACK.md": renderFallback(),
  "CONTROLLED_OWNER_ACTIVE_SESSION_CONFLICT.md": renderConflict(),
  "CONTROLLED_OWNER_V2_ROLLBACK.md": renderRollback(),
  "CONTROLLED_OWNER_KILL_SWITCH.md": renderKillSwitch(),
  "CONTROLLED_OWNER_OUTCOME_LONGITUDINAL.md": renderOutcome(),
  "CONTROLLED_OWNER_MONITORING.md": renderMonitoring(),
  "CONTROLLED_OWNER_PRIVACY_SECURITY.md": renderPrivacy(),
  "CONTROLLED_OWNER_BILLING_BOUNDARY.md": renderBilling(),
  "CONTROLLED_OWNER_PRODUCT_SHADOW_BOUNDARY.md": renderShadow(),
  "CONTROLLED_OWNER_CURRENT_PRODUCT_INVARIANCE.md": renderInvariance(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_STATE_MACHINE.md": renderStateMachine(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_RESPONSIVE_ACCESSIBILITY.md": renderResponsive(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_OPTIONS.md": renderOptions(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_IMPLEMENTATION_HANDOFF.md": renderHandoff(),
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_DELIVERY_DESIGN_V1_HOLDOUT_MANIFEST.md": renderHoldout(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_MUTATION_REPORT.md": renderMutations(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_METAMORPHIC_REPORT.md": renderMetamorphic(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_STRESS_REPORT.md": renderStress(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ACTIVATION_GUARDS.md": renderGuards(),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_DESIGN_READINESS.md": renderReadiness(),
});

const componentFingerprints = Object.freeze({
  ontologyAudit: fingerprint(ontologyAudit), authBaseline: fingerprint(authBaseline),
  identityPolicy: fingerprint(identityPolicy), normalizedIdentity: fingerprint(identityPolicy.normalization),
  deliveryMode: fingerprint(deliveryModePolicy), twoKeyAuthorization: fingerprint(twoKeyAuthorization),
  enrollment: fingerprint(enrollmentDesign), ownerProfile: fingerprint(ownerProfileDesign),
  minimumInputs: fingerprint(minimumInputs), productImportBoundary: fingerprint(profileImportBoundary),
  getStrongerMapping: fingerprint(getStrongerMapping), ownerRoute: fingerprint(ownerRouteDesign),
  generation: fingerprint(generationDesign), preview: fingerprint(previewDesign), approval: fingerprint(approvalDesign),
  application: fingerprint(applicationDesign), activeProgramOwnership: fingerprint(activeProgramOwnership),
  programEnvelope: fingerprint(programEnvelope), productProjection: fingerprint(productProjection),
  ownerWeek: fingerprint(ownerSurfaces.week), ownerSession: fingerprint(ownerSurfaces.session),
  practiceOptionDelivery: fingerprint(practiceOptionDelivery), legacyFallback: fingerprint(legacyFallback),
  activeSessionConflict: fingerprint(activeSessionConflict), rollback: fingerprint(rollbackDesign),
  killSwitch: fingerprint(killSwitchDesign), outcomeLongitudinal: fingerprint(outcomeLongitudinal),
  monitoring: fingerprint(monitoringDesign), deliveryHealthGates: fingerprint(deliveryHealthGates),
  privacySecurity: fingerprint(privacySecurity),
  billingBoundary: fingerprint(billingBoundary), productShadowBoundary: fingerprint(productShadowBoundary),
  currentProductInvariance: fingerprint(currentProductInvariance), stateMachine: fingerprint(stateMachine),
  responsiveAccessibility: fingerprint(responsiveAccessibility), implementationHandoff: fingerprint(implementationHandoff),
  controlledScenarios: fingerprint(controlledScenarios), fixedShellCohorts: fingerprint(fixedShellCohorts),
  holdout: fingerprint(lockedHoldout), mutations: fingerprint(mutationResults),
  metamorphic: fingerprint(metamorphicResults), stress: fingerprint(stressEvidence),
  activationGuards: fingerprint(activationGuards), upstreamBaseline: fingerprint(upstreamBaseline),
  readiness: fingerprint(chunkGReadiness),
});

export const gDesignFingerprints = Object.freeze({
  ...componentFingerprints,
  combinedGDesign: fingerprint(componentFingerprints),
});

export const gDesignJsonReports: Readonly<Record<string, string>> = Object.freeze({
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_CONTRACTS.json": jsonReport(ownerDeliveryContracts),
  "CONTROLLED_OWNER_ACCOUNT_IDENTITY_POLICY.json": jsonReport(identityPolicy),
  "CONTROLLED_OWNER_DELIVERY_MODE_POLICY.json": jsonReport(deliveryModePolicy),
  "CONTROLLED_OWNER_V2_ENROLLMENT_DESIGN.json": jsonReport(enrollmentDesign),
  "CONTROLLED_OWNER_GET_STRONGER_PROFILE_DESIGN.json": jsonReport(ownerProfileDesign),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_STATE_MACHINE.json": jsonReport(stateMachine),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ROUTE_MATRIX.json": jsonReport(ownerRouteDesign),
  "CONTROLLED_OWNER_V2_PREVIEW_APPLICATION_ROLLBACK.json": jsonReport({ previewDesign, approvalDesign, applicationDesign, rollbackDesign }),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_SECURITY.json": jsonReport(privacySecurity),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_CONTROLLED_SCENARIOS.json": jsonReport(controlledScenarios),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_FIXED_SHELL_COHORTS.json": jsonReport(fixedShellCohorts),
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_DELIVERY_DESIGN_V1_HOLDOUT_MANIFEST.json": jsonReport(lockedHoldout),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_MUTATIONS.json": jsonReport(mutationResults),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_METAMORPHIC_RESULTS.json": jsonReport(metamorphicResults),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_STRESS.json": jsonReport(stressEvidence),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ACTIVATION_GUARDS.json": jsonReport(activationGuards),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_FINGERPRINTS.json": jsonReport(gDesignFingerprints),
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_DESIGN_READINESS.json": jsonReport({
    ...chunkGReadiness, validation: validationSummary, fingerprints: gDesignFingerprints,
  }),
});

export const gDesignIntegrationBlocks: Readonly<Record<string, string>> = Object.freeze({
  "docs/training-engine-v2/SESSION_PRACTICE_OPTIONS_V2_IMPLEMENTATION_READINESS.md":
    "Chunk G design specifies dedicated owner-only V2 session delivery through the existing exact Full/Lighter/Recovery bridge. Current SessionClient and historical V1 behavior remain unchanged; implementation is separately unauthorized.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md":
    "Chunk G design fixes one configured owner, Get stronger/strength/develop, server-only two-key eligibility, explicit enrollment, dedicated routes, immutable V2 application, and legacy fallback. No delivery is implemented.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md":
    "Chunk G design adds no activation authority. Owner implementation remains separately authorized, H remains open, and owner delivery and Product activation counts remain zero.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md":
    "Chunk G design selects Option A and records G-Impl A-E plus the sixteen-step implementation handoff. The next step is implementation authorization, not environment enablement or live verification.",
  "docs/training-engine-v2/SESSION_PRACTICE_PRODUCT_ADAPTER.md":
    "Future owner delivery uses the default-off V2 adapter only on the dedicated owner session route. Current Product retains the historical V1 control and SessionClient imports remain zero.",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_ACTIVATION_GUARDS.md":
    "Owner delivery and Product Shadow remain separate authorities, allowlists, routes, persistence and artifacts. A Shadow artifact can never be approved or applied as the owner Program.",
  "docs/training-engine-v2/PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_FUTURE_INTEGRATION.md":
    "Future owner execution emits exact V2 Performance and Outcome Source lineage only after actual delivery. Chunk G design treats legacy logs as restricted context and emits no live evidence.",
  "docs/training-engine-v2/PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md":
    "Future owner delivery sends completed evidence observations to admitted Longitudinal policy. One selection or session never auto-progresses, regresses, deloads, replaces work, or rewrites the Week.",
  "docs/training-engine-v2/TESTING.md":
    "Chunk G design adds synthetic-only contract, identity, mode, enrollment, profile, route, state-machine, generation, preview, application, rollback, security, holdout, mutation, metamorphic, stress and activation-guard evidence. No live account or production database is read.",
  "docs/training-engine-v2/ARCHITECTURE.md":
    "Chunk G design selects a dedicated /account/praxis-v2 boundary with server-only two-key eligibility, immutable V2 envelope, separate owner active-program pointer, exact lineage sidecar, and legacy fallback. Runtime implementation remains absent.",
  "docs/training-engine-v2/DOMAIN.md":
    "Chunk G design distinguishes configured identity reference, authenticated stable userId, delivery mode, consented enrollment, confirmed owner profile, counterfactual preview, approval, application, active-program ownership, rollback, and Product activation.",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md":
    "Chunk G design connects the admitted production V2 pipeline to a future isolated owner surface without flattening lineage into legacy Program state. G implementation and H activation remain separate owner decisions.",
});

export const gDesignReportCorpusFingerprint = fingerprint({
  markdown: gDesignMarkdownReports,
  json: gDesignJsonReports,
  integration: gDesignIntegrationBlocks,
});
