export const PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_STATUS_REFERENCE = Object.freeze({
  contractId: "PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_STATUS",
  contractVersion: "1.0.0",
} as const);

export interface ProductGoalArchitectureImplementationStatusProjection {
  readonly contractReference: typeof PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_STATUS_REFERENCE;
  readonly canonicalAuthority: "PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER";
  readonly finalState: "INCOMPLETE_FUTURE_WORK_REMAINS";
  readonly chunks: Readonly<Record<"B1" | "B2" | "B3" | "B4" | "C" | "D" | "E" | "F" | "G" | "H",
    "completed" | "active" | "open">>;
  readonly duplicateOwnerPolicyCreated: false;
}

export function projectProductGoalArchitectureImplementationStatus(
  canonicalLedger: string,
): ProductGoalArchitectureImplementationStatusProjection {
  if (!canonicalLedger.includes("**Current state:** `INCOMPLETE_FUTURE_WORK_REMAINS`")) {
    throw new Error("PRODUCT_GOAL_ARCHITECTURE_LEDGER_FINAL_STATE_INVALID");
  }
  const completed = (heading: string) => {
    const start = canonicalLedger.indexOf(heading);
    if (start < 0) return false;
    const next = canonicalLedger.indexOf("\n## ", start + heading.length);
    const section = canonicalLedger.slice(start, next < 0 ? undefined : next);
    return /\*\*Status:\*\* (?:completed|`completed|completed and proven)/i.test(section);
  };
  const b1Completed = completed("## Chunk B1 \u2014 Canonical owner-policy contracts");
  const b2Completed = completed("## Chunk B2 \u2014 Purpose-first goal-specific Prescription resolver");
  const b3Completed = completed("## Chunk B3 \u2014 Supported goal and local-purpose policies");
  const b4Completed = completed("## Chunk B4 \u2014 Equipment-, experience-, and context-specific realization");
  const cCompleted = completed("## Chunk C \u2014 Controlled Product Shadow goal and realization mapping");
  return Object.freeze({
    contractReference: PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_STATUS_REFERENCE,
    canonicalAuthority: "PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER",
    finalState: "INCOMPLETE_FUTURE_WORK_REMAINS",
    chunks: Object.freeze({
      B1: b1Completed ? "completed" : "active", B2: b2Completed ? "completed" : "open",
      B3: b3Completed ? "completed" : "open", B4: b4Completed ? "completed" : "open",
      C: cCompleted ? "completed" : "active", D: "open", E: "open", F: "open", G: "open", H: "open",
    }),
    duplicateOwnerPolicyCreated: false,
  });
}
