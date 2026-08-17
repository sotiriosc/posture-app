import { OWNER_DELIVERY_CONTRACTS, OWNER_DELIVERY_STATES, type OwnerDeliveryState } from "./contracts";

const transitions = Object.freeze(OWNER_DELIVERY_STATES.map((state, index) => Object.freeze({
  from: state,
  to: OWNER_DELIVERY_STATES[index + 1] ?? "unavailable",
  owner: index < 4 ? "server_eligibility" : index < 10 ? "configured_owner" : "owner_delivery_application",
  preconditions: Object.freeze(["exact_current_state", "server_verified_authority", "version_match"]),
  stateChanges: Object.freeze([`${state}->${OWNER_DELIVERY_STATES[index + 1] ?? "unavailable"}`]),
  repositoryEffects: index < 4 ? Object.freeze([]) : Object.freeze(["append_only_designated_record_only"]),
  idempotent: true,
  automaticApply: false,
  failure: "FAIL_CLOSED_WITH_STRUCTURED_REASON",
  rollback: "RETURN_TO_LAST_DURABLE_STATE_WITHOUT_DATA_DELETION",
})));

export const OWNER_DELIVERY_STATE_MACHINE = Object.freeze({
  contract: OWNER_DELIVERY_CONTRACTS.stateMachine,
  states: OWNER_DELIVERY_STATES,
  transitions,
  stateCount: OWNER_DELIVERY_STATES.length,
  automaticApplyTransitions: 0,
});

export function canTransitionOwnerDeliveryState(from: OwnerDeliveryState, to: OwnerDeliveryState): boolean {
  return transitions.some((transition) => transition.from === from && transition.to === to);
}
