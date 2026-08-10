import type { AssessmentSeverity, AssessmentSignal } from "../../../domain/assessment";
import type { BodyRegion } from "../../../domain/primitives";
import type {
  AssessmentDemandDimension,
  AssessmentSignalInterpretationTrace,
  AthleteCapabilityEstimateTrace,
  CapabilityEstimateSource,
  CapabilityEvidenceQuality,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import { demandLevelToValue } from "./candidateDemand";

function clampCapability(value: number): number {
  return Number(Math.max(0, Math.min(3, value)).toFixed(3));
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function severityMagnitude(severity: AssessmentSeverity): number {
  switch (severity) {
    case "unknown":
      return 0.45;
    case "mild":
      return 0.25;
    case "moderate":
      return 0.5;
    case "substantial":
      return 0.8;
  }
}

export function interpretAssessmentSignal(
  signal: AssessmentSignal,
): AssessmentSignalInterpretationTrace {
  const severity = signal.severity ?? "unknown";
  const severitySource = signal.severity ? "provided" : "default_conservative";

  return {
    confidence: signal.confidence,
    priority: signal.priority,
    severity,
    severitySource,
    deficitMagnitude: severityMagnitude(severity),
    evidence: [
      signal.severity
        ? `${signal.id} provided severity ${signal.severity}.`
        : `${signal.id} has no severity; using documented conservative unknown-severity default.`,
      `Confidence ${signal.confidence} scales trust in influence, not physical deficit magnitude.`,
      `Priority ${signal.priority} represents programming importance, not physical deficit magnitude.`,
    ],
  };
}

function experienceWeakPrior(experience: CandidateRequest["athlete"]["experience"]): number {
  switch (experience) {
    case "novice":
      return -0.1;
    case "beginner":
      return 0;
    case "intermediate":
      return 0.1;
    case "advanced":
      return 0.15;
  }
}

function phaseCapabilityForDimension(
  request: CandidateRequest,
  dimension: AssessmentDemandDimension,
): number {
  switch (dimension) {
    case "trunk_control":
      return average([
        demandLevelToValue(request.phase.capabilityExpectation.control),
        demandLevelToValue(request.phase.capabilityExpectation.stability),
      ]);
    case "scapular_control":
      return average([
        demandLevelToValue(request.phase.capabilityExpectation.control),
        demandLevelToValue(request.phase.capabilityExpectation.coordination),
      ]);
    case "stability":
      return demandLevelToValue(request.phase.capabilityExpectation.stability);
    case "coordination":
      return demandLevelToValue(request.phase.capabilityExpectation.coordination);
    case "range":
    case "joint_control":
      return demandLevelToValue(request.phase.capabilityExpectation.control);
  }
}

function painCapabilityAdjustment(request: CandidateRequest, region?: BodyRegion): number {
  if (!region) {
    return 0;
  }

  const currentDiscomfort = request.painAndInjury.currentDiscomforts.some((pain) => pain.region === region);
  const moderatePain = request.painAndInjury.moderatePain.some((pain) => pain.region === region);

  if (moderatePain) {
    return -0.35;
  }

  if (currentDiscomfort) {
    return -0.15;
  }

  return 0;
}

function uniqueSources(sources: readonly CapabilityEstimateSource[]): readonly CapabilityEstimateSource[] {
  return [...new Set(sources)];
}

function estimateSourceForSignal(
  interpretation: AssessmentSignalInterpretationTrace,
): CapabilityEstimateSource {
  return interpretation.severitySource === "provided" ? "assessment_inferred" : "phase_default";
}

function evidenceQualityForSignal(
  interpretation: AssessmentSignalInterpretationTrace,
): CapabilityEvidenceQuality {
  return interpretation.severitySource === "provided" ? "moderate" : "weak";
}

export function estimateAthleteCapability(input: {
  readonly request: CandidateRequest;
  readonly signal: AssessmentSignal;
  readonly dimension: AssessmentDemandDimension;
  readonly signalInterpretation: AssessmentSignalInterpretationTrace;
}): AthleteCapabilityEstimateTrace {
  const phasePrior = phaseCapabilityForDimension(input.request, input.dimension);
  const experienceAdjustment = experienceWeakPrior(input.request.athlete.experience);
  const painAdjustment = painCapabilityAdjustment(input.request, input.signal.region);
  const severityAdjustment = -input.signalInterpretation.deficitMagnitude;
  const value = clampCapability(
    Math.max(0.75, phasePrior + experienceAdjustment + painAdjustment + severityAdjustment),
  );
  const estimateSource = estimateSourceForSignal(input.signalInterpretation);
  const evidenceQuality = evidenceQualityForSignal(input.signalInterpretation);

  return {
    value,
    estimateSource,
    contributingSources: uniqueSources([
      "phase_default",
      estimateSource,
      "generic_default",
    ]),
    evidenceQuality,
    evidence: [
      `Phase prior ${phasePrior.toFixed(3)} from ${input.request.phase.id} capability expectation.`,
      `Experience weak contextual prior ${experienceAdjustment.toFixed(3)} from ${input.request.athlete.experience}.`,
      `Severity adjustment ${severityAdjustment.toFixed(3)} from ${input.signalInterpretation.severity}.`,
      `Pain adjustment ${painAdjustment.toFixed(3)} from current pain/discomfort in the signal region.`,
      `Capability estimate source ${estimateSource} with ${evidenceQuality} evidence quality.`,
      "No direct observed capability measurement is used in Candidate Intelligence v0.",
      "Training exposure history is not yet used as direct capability evidence in Candidate Intelligence v0.",
    ],
  };
}

export function phaseIntentDemandForDimension(
  request: CandidateRequest,
  dimension: AssessmentDemandDimension,
): { readonly value: number; readonly evidence: readonly string[] } {
  const loadingIntent = demandLevelToValue(request.phase.progressionIntent.loading);
  const controlExpectation = demandLevelToValue(request.phase.capabilityExpectation.control);

  if (dimension === "trunk_control" || dimension === "scapular_control") {
    return {
      value: Number(average([controlExpectation, loadingIntent]).toFixed(3)),
      evidence: [
        `Averaged phase control expectation ${controlExpectation.toFixed(3)} and loading intent ${loadingIntent.toFixed(3)} for ${dimension}.`,
      ],
    };
  }

  return {
    value: loadingIntent,
    evidence: [`Used phase loading intent ${loadingIntent.toFixed(3)} for ${dimension}.`],
  };
}
