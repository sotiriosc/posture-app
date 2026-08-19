import type {
  CandidatePainExecutionReadiness,
  CandidatePainExecutionReadinessTrace,
  CandidatePainMatchTrace,
  CandidatePainResultExecutionReadinessTrace,
  PainResponseRequirementTrace,
} from "./types";

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function classify(
  requirements: readonly PainResponseRequirementTrace[],
): CandidatePainExecutionReadiness {
  if (
    requirements.some(
      (requirement) =>
        requirement.requestedAction === "urgent_review" ||
        requirement.primaryFutureOwner === "external_urgent_review",
    )
  ) {
    return "URGENT_EXTERNAL_REVIEW";
  }

  if (
    requirements.some(
      (requirement) =>
        requirement.requestedAction === "substitute_role" ||
        requirement.primaryFutureOwner === "session_intent_or_session_composer",
    )
  ) {
    return "REQUIRES_SESSION_ROLE_SUBSTITUTION";
  }

  if (
    requirements.some(
      (requirement) =>
        requirement.primaryFutureOwner === "prescription" ||
        requirement.primaryFutureOwner === "future_candidate_prescription_or_session",
    )
  ) {
    return "REQUIRES_PRESCRIPTION";
  }

  if (
    requirements.some(
      (requirement) => requirement.primaryFutureOwner === "candidate_review",
    )
  ) {
    return "REQUIRES_CANDIDATE_REVIEW";
  }

  return "EXECUTABLE_AT_CANDIDATE_SCOPE";
}

function reasonFor(
  readiness: CandidatePainExecutionReadiness,
  applicableRequirements: readonly PainResponseRequirementTrace[],
  ignoredRequirementCount: number,
): string {
  const ignored = ignoredRequirementCount > 0
    ? ` ${ignoredRequirementCount} non-applicable requirement(s) were ignored because this candidate has no matching stress fact.`
    : "";

  switch (readiness) {
    case "URGENT_EXTERNAL_REVIEW":
      return `Explicit acute urgent-review evidence remains globally visible and takes precedence.${ignored}`;
    case "REQUIRES_SESSION_ROLE_SUBSTITUTION":
      return `At least one applicable pain response requires session-level role substitution.${ignored}`;
    case "REQUIRES_PRESCRIPTION":
      return `At least one applicable pain response requires prescription ownership.${ignored}`;
    case "REQUIRES_CANDIDATE_REVIEW":
      return `At least one applicable pain response requires candidate review.${ignored}`;
    case "EXECUTABLE_AT_CANDIDATE_SCOPE":
      return applicableRequirements.length === 0
        ? `Candidate Intelligence has no applicable pain-response requirement for this candidate.${ignored}`
        : `Applicable pain evidence requires observation only and creates no unresolved Candidate Intelligence action.${ignored}`;
  }
}

export function buildCandidatePainExecutionReadinessTrace(
  trace: CandidatePainMatchTrace,
): CandidatePainExecutionReadinessTrace {
  const ignoredNotApplicableRequirements = trace.responseRequirements.filter(
    (requirement) =>
      requirement.requestedAction !== "urgent_review" &&
      requirement.executionStatus === "not_applicable_no_candidate_stress_match",
  );
  const ignored = new Set(ignoredNotApplicableRequirements);
  const applicableRequirements = trace.responseRequirements.filter(
    (requirement) => !ignored.has(requirement),
  );
  const urgencySignals = applicableRequirements.filter(
    (requirement) =>
      requirement.requestedAction === "urgent_review" ||
      requirement.primaryFutureOwner === "external_urgent_review",
  );
  const readiness = classify(applicableRequirements);

  return {
    candidateExerciseId: trace.candidateExerciseId,
    readiness,
    applicableRequirements,
    ignoredNotApplicableRequirements,
    urgencySignals,
    reason: reasonFor(
      readiness,
      applicableRequirements,
      ignoredNotApplicableRequirements.length,
    ),
  };
}

export function buildCandidatePainResultExecutionReadinessTrace(input: {
  readonly rankedCandidateReadiness: readonly CandidatePainExecutionReadinessTrace[];
  readonly allCandidateReadiness: readonly CandidatePainExecutionReadinessTrace[];
}): CandidatePainResultExecutionReadinessTrace {
  const selected = input.rankedCandidateReadiness[0] ?? null;
  const executableCandidates = input.rankedCandidateReadiness.filter(
    (candidate) => candidate.readiness === "EXECUTABLE_AT_CANDIDATE_SCOPE",
  );

  return {
    selectedCandidateId: selected?.candidateExerciseId ?? null,
    selectedCandidatePainReadiness: selected?.readiness ?? null,
    executableCandidateIds: executableCandidates.map(
      (candidate) => candidate.candidateExerciseId,
    ),
    bestExecutableCandidateId:
      executableCandidates[0]?.candidateExerciseId ?? null,
    hasExecutableCandidate: executableCandidates.length > 0,
    urgentReviewSignalIds: unique(
      input.allCandidateReadiness.flatMap((candidate) =>
        candidate.urgencySignals.map((requirement) => requirement.signalId),
      ),
    ),
  };
}
