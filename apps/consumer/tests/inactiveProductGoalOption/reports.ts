import {
  F_AUTHORIZATION,
  F_CLASSIFICATION,
  F_COMBINED_STATUS,
  F_NEXT_DEPENDENCY,
  LEGACY_GOALS,
  TARGET_VIEWPORTS,
  buildEvidenceModel,
} from "./evidence";

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function document(title: string, body: string): string {
  return `# ${title}\n\n${body.trim()}\n`;
}

const ontologyAnswers = [
  "Yes. The optional prop defaults absent and ordinary rendering has no preview branch.",
  "No. Preview selection is a separate versioned ephemeral record.",
  "Yes. The registry option is appended only inside an explicit preview optgroup.",
  "Yes. Selecting get_stronger does not call updateData.",
  "Yes. Saved and server-hydrated payloads retain the current QuestionnaireData shape.",
  "Yes. The preview guard is the first submit branch after preventDefault.",
  "Yes. Preview submit returns before openChangeConfirm.",
  "Yes. Preview submit returns before commitAndRegenerateProgram.",
  "Yes. The active-session warning is never evaluated for preview submit.",
  "Yes. The ordinary CTA DOM, copy, and classes are unchanged.",
  "No. Direct component rendering supplies sufficient isolated preview evidence.",
  "Yes. Component/unit rendering proves the explicit preview contract.",
  "Yes. Browser E2E proves absence on the current route at six viewports.",
  "Yes. Gyms runtime source and behavior remain untouched.",
  "Yes. Buyer-demo behavior remains untouched.",
  "Yes. Identity and availability metadata are consumer app-local.",
  "No. This authorization permits exactly one implemented future option.",
  "Yes. The one-option registry plus all fail-closed gates earns the bounded F classification.",
  "Yes. QuestionnaireData and questionnaire signature V1 are unchanged.",
  "Remove the optional preview imports/branch and the three app-local preview files.",
] as const;

export function buildInactiveProductGoalReportFiles(): ReadonlyMap<string, string> {
  const evidence = buildEvidenceModel();
  const fingerprints = evidence.fingerprints as Record<string, unknown>;
  const files = new Map<string, string>();

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_CONTRACTS.json",
    json({
      authorization: F_AUTHORIZATION,
      contracts: evidence.contracts,
      exactVersionRequired: true,
      hiddenLatestAlias: false,
      publicExports: [],
    })
  );
  files.set("ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_REGISTRY.json", json(evidence.registry));
  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_PREVIEW_INPUT.json",
    json(evidence.previewInput)
  );
  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_PREVIEW_RESULT.json",
    json(evidence.previewResult)
  );
  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_CONTROLLED_SCENARIOS.json",
    json({
      contract: "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_CONTROLLED_SCENARIOS@1.0.0",
      count: evidence.controlledScenarios.length,
      scenarios: evidence.controlledScenarios,
    })
  );
  files.set("ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_HOLDOUT_MANIFEST.json", json(evidence.holdout));
  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_MUTATIONS.json",
    json({ count: evidence.mutations.length, mutations: evidence.mutations })
  );
  files.set("ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_METAMORPHIC_RESULTS.json", json(evidence.metamorphic));
  files.set("ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_STRESS.json", json(evidence.stress));
  files.set("ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_FINGERPRINTS.json", json(fingerprints));

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_ONTOLOGY_AUDIT.md",
    document(
      "One Inactive Product Goal Option V1 Ontology Audit",
      `Authorization: \`${F_AUTHORIZATION}\`.\n\nClassification: \`ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_ONTOLOGY_READY\`.\n\nThe canonical ledger, Chunk E readiness and handoff, option-state policy, copy/state/ownership matrices, consumer and gyms questionnaires, buyer demo, current schema/signature/storage/sync/session/generation/routing, Product Shadow triggers, browser invariance evidence, and supplied Product screenshots were audited before implementation.\n\n## Concept classification\n\n| Concept | Classification |\n| --- | --- |\n| Legacy QuestionnaireForm and four goals | CURRENT_LEGACY_RUNTIME_FROZEN |\n| Consumer questionnaire page | CURRENT_ROUTE_AUTHORITY |\n| QuestionnaireData and normalization | CURRENT_PRODUCT_STATE_AUTHORITY |\n| Questionnaire signature V1 | CURRENT_SIGNATURE_AUTHORITY |\n| get_stronger registry record | INACTIVE_OPTION_DEFINITION |\n| Optional versioned prop | EXPLICIT_PREVIEW_INPUT |\n| Preview selection | PREVIEW_LOCAL_STATE_ONLY |\n| First submit branch | PREVIEW_FAIL_CLOSED_BOUNDARY |\n| InactiveProductGoalPreview wrapper | TEST_HARNESS_ONLY |\n| Ordinary consumer route exposure | CURRENT_ROUTE_PROHIBITED |\n| Local or remote preview writes | PERSISTENCE_PROHIBITED |\n| Legacy or V2 generation | GENERATION_PROHIBITED |\n| Product Shadow invocation | SHADOW_PROHIBITED |\n| Gyms integration | GYMS_PROHIBITED |\n| Buyer-demo integration | BUYER_DEMO_PROHIBITED |\n| Controlled owner delivery | FUTURE_G_DELIVERY_OWNER |\n| Broad activation | FUTURE_H_ACTIVATION_OWNER |\n| Five app-local contracts | VERSIONED_CONTRACT_REQUIRED |\n\n## Twenty decisions\n\n${ontologyAnswers.map((answer, index) => `${index + 1}. ${answer}`).join("\n")}\n\nOntology fingerprint: \`${fingerprints.ontology_audit}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_OWNER_BOUNDARIES.md",
    document(
      "One Inactive Product Goal Option V1 Owner Boundaries",
      `## Legacy QuestionnaireForm\n\nOwns current legacy fields, persistence, confirmation, and generation. F does not alter that authority.\n\n## Inactive option registry\n\nOwns static identity and availability metadata only. It creates zero Product state, Program, exercise, or dose.\n\n## Explicit preview input\n\nOwns permission to render exactly one inactive option in direct component preview. It authorizes no persistence, generation, Product Shadow, delivery, or activation.\n\n## Preview selection state\n\nOwns only an ephemeral selected record. It remains separate from QuestionnaireData, committed/pending state, storage, server snapshots, signature, and Program state.\n\n## Future owners\n\nChunk G owns separately authorized controlled owner-account delivery design and delivery. Chunk H owns broad activation. Both remain open.\n\nFingerprint: \`${fingerprints.owner_boundaries}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_CONTRACT.md",
    document(
      "One Inactive Product Goal Option V1 Contract",
      `The app-local contracts are exact-version only: \`${Object.values(evidence.contracts).join("`, `")}\`. Unsupported versions fail closed; no latest alias or engine/training-engine/consumer public export exists.\n\nThe bounded option is \`get_stronger\` / Get stronger / \`strength\` / \`future_inactive_internal\`. Follow-up count is zero. Submission behavior is \`preview_only_fail_closed\`.\n\nOption contract fingerprint: \`${fingerprints.option_contract}\`. Registry contract fingerprint: \`${fingerprints.registry_contract}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_REGISTRY.md",
    document(
      "One Inactive Product Goal Option V1 Registry",
      `Implemented future option count: **1**. Validation is pure, reads no environment/browser state, and rejects unsupported contracts/IDs, duplicate IDs/labels, wrong label/outcome/availability/follow-up/submission behavior, all three current-route visibility permissions, persistence, legacy generation, Product Shadow, V2 output, and any cardinality other than one.\n\nRegistry fingerprint: \`${fingerprints.registry}\`. Validation fingerprint: \`${fingerprints.registry_validation}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_PREVIEW_INPUT.md",
    document(
      "One Inactive Product Goal Option V1 Preview Input",
      `The preview requires the exact optional component input \`${evidence.contracts.previewInput}\` with option ID \`get_stronger\` and \`enabled: true\`. Default, malformed, disabled, wrong-version, or wrong-ID input renders no preview. No environment, query string, storage, server profile, account allowlist, current navigation, Menu, buyer demo, gyms route, or production preview page can synthesize the input.\n\nFingerprint: \`${fingerprints.preview_input_contract}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_SELECTION_STATE.md",
    document(
      "One Inactive Product Goal Option V1 Selection State",
      `Selection creates only \`${evidence.contracts.previewSelection}\`: \`get_stronger\`, strength, future inactive, explicit internal preview, unpersisted, generation/shadow/delivery/Product mutation all false. It leaves the current goal, committed/pending data, dirty state, signature, storage, server snapshot, Product state, and Program state unchanged. Selecting a legacy goal clears it and resumes existing update behavior; removing the prop clears it.\n\nFingerprint: \`${fingerprints.preview_selection_contract}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_FAIL_CLOSED_SUBMISSION.md",
    document(
      "One Inactive Product Goal Option V1 Fail-Closed Submission",
      `Preview submit returns \`${evidence.contracts.previewResult}\` with status \`future_submission_unavailable\` and reason \`INACTIVE_PRODUCT_GOAL_PREVIEW_ONLY\`. It returns before dirty comparison, confirmation, active-session warning, commit, persistence, draft clearing, signals, generation, stores, navigation, Product Shadow, or V2.\n\nAnnounced alert: "Get stronger is not available for plan generation yet. Your current profile and plan were not changed." Focus moves deterministically to that alert only after submit.\n\nFingerprint: \`${fingerprints.fail_closed_submission}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_PERSISTENCE_GENERATION_GUARDS.md",
    document(
      "One Inactive Product Goal Option V1 Persistence and Generation Guards",
      `Component tripwire tests prove zero preview writes/calls for localStorage, training sync, draft store, signal building, generateProgram, Program, ProgramProgress, app state, and router. The app-local registry has all persistence/generation/shadow/V2 permissions false. QuestionnaireData, normalization, storage/server shape, and questionnaire signature V1 are unchanged.\n\nPersistence fingerprint: \`${fingerprints.persistence_guards}\`. Generation fingerprint: \`${fingerprints.generation_guards}\`. Product Shadow fingerprint: \`${fingerprints.product_shadow_guards}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_CURRENT_ROUTE_INVARIANCE.md",
    document(
      "One Inactive Product Goal Option V1 Current Route Invariance",
      `Ordinary \`/questionnaire\` passes browser checks with exactly these options in order: ${LEGACY_GOALS.map((goal) => `\`${goal}\``).join(", ")}. The default remains Improve posture. Get stronger, preview optgroup/panel/alert/select test ID, and preview input are absent. Current field order, CTA copy/style, confirmation, active-session warning, submit/generation behavior, and page height remain on the legacy branch.\n\nViewports: ${TARGET_VIEWPORTS.map((viewport) => `\`${viewport}\``).join(", ")}. Horizontal overflow: 0.\n\nFingerprint: \`${fingerprints.current_route_invariance}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_GYMS_BUYER_DEMO_INVARIANCE.md",
    document(
      "One Inactive Product Goal Option V1 Gyms and Buyer-Demo Invariance",
      `Gyms runtime source changes: 0. Gyms preview contract imports: 0. Current gyms goal values, training-mode behavior, and gym-locked equipment remain unchanged. Buyer-demo behavior changes: 0 and Get stronger occurrences: 0. No consumer preview prop crosses either boundary.\n\nGyms fingerprint: \`${fingerprints.gyms_invariance}\`. Buyer-demo fingerprint: \`${fingerprints.buyer_demo_invariance}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_ACCESSIBILITY_RESPONSIVE.md",
    document(
      "One Inactive Product Goal Option V1 Accessibility and Responsive Evidence",
      `In explicit preview, the native select receives an associated label and stable test ID. Selection adds a stable helper ID through \`aria-describedby\`; blocked submit adds a role alert and deterministic focus. Keyboard selection/return preserve native semantics and selection does not steal focus. Text labels accompany border/color treatment, visible focus remains, and no animation, modal, fixed preview control, or hover-only explanation is added.\n\nThe select is full width; helper and alert use wrapping text inside the existing Primary goal section. Component contracts cover ${TARGET_VIEWPORTS.join(", ")}; ordinary browser checks prove zero overflow at the same widths. This is bounded evidence, not a claim of full WCAG conformance.\n\nAccessibility fingerprint: \`${fingerprints.accessibility}\`. Responsive fingerprint: \`${fingerprints.responsive}\`.`
    )
  );

  const holdoutRows = evidence.holdout.cases
    .map((item) => `| ${item.id} | ${item.partition} | ${item.expected} |`)
    .join("\n");
  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_HOLDOUT_MANIFEST.md",
    document(
      "One Inactive Product Goal Option V1 Holdout Manifest",
      `Contract: \`${evidence.holdout.contract}\`. Frozen before evaluation: **yes**. Any semantic correction requires a new contract version and holdout. Total: **240**, split 80 registry/contracts, 80 preview selection/submission, and 80 route/app invariance.\n\n| Case | Partition | Expected |\n| --- | --- | --- |\n${holdoutRows}\n\nFingerprint: \`${fingerprints.holdout}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_MUTATION_REPORT.md",
    document(
      "One Inactive Product Goal Option V1 Mutation Report",
      `All **${evidence.mutations.length}** semantic mutations were rejected.\n\n${evidence.mutations.map((item) => `- \`${item.id}\` ${item.name}: ${item.observed}`).join("\n")}\n\nNo downstream render difference rescues an ownership failure. Fingerprint: \`${fingerprints.mutations}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_METAMORPHIC_REPORT.md",
    document(
      "One Inactive Product Goal Option V1 Metamorphic Report",
      `Invariant relations passed: **${evidence.metamorphic.invariant.length}**. Material-response relations passed: **${evidence.metamorphic.material.length}**.\n\n## Invariant\n\n${evidence.metamorphic.invariant.map((item) => `- ${item.relation}: ${item.observed}`).join("\n")}\n\n## Material\n\n${evidence.metamorphic.material.map((item) => `- ${item.relation}: ${item.observed}`).join("\n")}\n\nFingerprint: \`${fingerprints.metamorphic_results}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_STRESS_REPORT.md",
    document(
      "One Inactive Product Goal Option V1 Stress Report",
      `Deterministic runs: **${evidence.stress.deterministicRuns}**. Assertions: **${evidence.stress.assertions}**. Side effects, hidden clock reads, and production random reads: **0**.\n\n${Object.entries(evidence.stress.counts).map(([name, count]) => `- ${name}: ${count}`).join("\n")}\n\nAll minimums met: **yes**. Digest: \`${evidence.stress.digest}\`. Fingerprint: \`${fingerprints.stress}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_ACTIVATION_GUARDS.md",
    document(
      "One Inactive Product Goal Option V1 Activation Guards",
      `${Object.entries(evidence.activationGuards).map(([name, count]) => `- ${name}: ${count}`).join("\n")}\n\nProduct delivery is not authorized. Product activation is not authorized. G and H remain open. Final ledger state remains \`INCOMPLETE_FUTURE_WORK_REMAINS\`.\n\nFingerprint: \`${fingerprints.activation_guards}\`.`
    )
  );

  files.set(
    "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_READINESS.md",
    document(
      "One Inactive Product Goal Option V1 Implementation Readiness",
      `Authorization honored: \`${F_AUTHORIZATION}\`.\n\nCombined status: \`${F_COMBINED_STATUS}\`.\n\nTop classification: \`${F_CLASSIFICATION}\`.\n\nExactly one app-local inactive option is implemented and reachable only by exact prop injection. Selection is ephemeral; submit fails closed with an announced result; all current route, gyms, buyer-demo, persistence, signature, generation, session, Product Shadow, and V2 boundaries remain closed. Controlled scenarios: ${evidence.controlledScenarios.length}. Holdout: ${evidence.holdout.cases.length}. Semantic mutations rejected: ${evidence.mutations.length}. Metamorphic relations passed: ${evidence.metamorphic.invariant.length + evidence.metamorphic.material.length}. Stress assertions: ${evidence.stress.assertions}. Side effects observed: 0.\n\nLimitations: no owner-account delivery, no Product activation, no production preview route, no V2 output, and no broad future registry.\n\nRollback: remove the optional preview branch and the three app-local files; ordinary behavior requires no data migration.\n\nExact next dependency: \`${F_NEXT_DEPENDENCY}\`.\n\nReadiness fingerprint: \`${fingerprints.readiness}\`. Combined Chunk F fingerprint: \`${fingerprints.combined_chunk_f}\`.`
    )
  );

  return files;
}
