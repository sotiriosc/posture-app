import type {
  SessionPracticeAttemptLifecycle,
  SessionPracticeOptionAvailability,
  SessionPracticePolicyContext,
  SessionPracticeStructuralProjection,
} from "./contracts";
import { projectFullSessionPractice } from "./fullPolicy";
import { projectLighterSessionPractice } from "./lighterPolicy";
import { projectRecoverySessionPractice } from "./recoveryPolicy";

export function evaluateSessionPracticeOption(
  context: SessionPracticePolicyContext,
): SessionPracticeStructuralProjection {
  if (context.request.requestedMode === "full") return projectFullSessionPractice(context);
  if (context.request.requestedMode === "lighter") return projectLighterSessionPractice(context);
  return projectRecoverySessionPractice(context);
}

export function applySessionPracticeExecutionLock(input: {
  readonly availability: SessionPracticeOptionAvailability;
  readonly lifecycle: SessionPracticeAttemptLifecycle;
}): SessionPracticeOptionAvailability {
  if (!["execution_started", "completed"].includes(input.lifecycle.state)) return input.availability;
  return Object.freeze({
    ...input.availability,
    state: "blocked_by_execution_started",
    reasonCodes: Object.freeze(["SESSION_PRACTICE_MODE_LOCKED_AFTER_EXECUTION_START"]),
    fallbackApplied: false,
  });
}

export function defaultSelectedSessionPracticeMode(): "full" {
  return "full";
}
