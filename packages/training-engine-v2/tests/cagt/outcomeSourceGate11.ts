import { OUTCOME_SOURCE_GATE_11_SUBGATES } from "../../src/outcomeSources/designContracts";

export interface OutcomeSourceGate11SubgateInput {
  readonly subgate: typeof OUTCOME_SOURCE_GATE_11_SUBGATES[number];
  readonly reasonCodes: readonly string[];
}

export interface OutcomeSourceGate11Result {
  readonly status: "PASS" | "FAIL_STOP";
  readonly firstFailingSubgate: typeof OUTCOME_SOURCE_GATE_11_SUBGATES[number] | null;
  readonly trace: readonly {
    readonly subgate: typeof OUTCOME_SOURCE_GATE_11_SUBGATES[number];
    readonly state: "PASS" | "FAIL_STOP" | "SHADOW_DIAGNOSTIC_ONLY";
    readonly scored: boolean;
    readonly reasonCodes: readonly string[];
  }[];
  readonly downstreamRescueAccepted: false;
}

export function evaluateOutcomeSourceGate11(
  inputs: readonly OutcomeSourceGate11SubgateInput[],
): OutcomeSourceGate11Result {
  let stopped = false;
  let first: typeof OUTCOME_SOURCE_GATE_11_SUBGATES[number] | null = null;
  const bySubgate = new Map(inputs.map((input) => [input.subgate, input]));
  const trace = OUTCOME_SOURCE_GATE_11_SUBGATES.map((subgate) => {
    const reasons = Object.freeze([...(bySubgate.get(subgate)?.reasonCodes ?? [])].sort());
    if (stopped) return Object.freeze({ subgate, state: "SHADOW_DIAGNOSTIC_ONLY" as const,
      scored: false, reasonCodes: reasons });
    if (reasons.length) {
      stopped = true;
      first = subgate;
      return Object.freeze({ subgate, state: "FAIL_STOP" as const, scored: true, reasonCodes: reasons });
    }
    return Object.freeze({ subgate, state: "PASS" as const, scored: true, reasonCodes: reasons });
  });
  return Object.freeze({ status: stopped ? "FAIL_STOP" : "PASS", firstFailingSubgate: first,
    trace: Object.freeze(trace), downstreamRescueAccepted: false });
}
