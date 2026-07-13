import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";
import type { FocusTag } from "@/lib/tags";

export type ObservationConfidence = "low" | "medium" | "high";

export type AssessmentObservation = {
  id: string;
  title: string;
  description: string;
  confidence: ObservationConfidence;
  evidence: string[];
  likelyDrivers: string[];
  riskIfIgnored: string;
  primaryFocusTags: FocusTag[];
  recommendedInterventions: Array<{
    type: "mobility" | "activation" | "strength" | "motorControl" | "breathing";
    target: string;
    suggestion: string;
  }>;
};

export type AssessmentReport = {
  observations: AssessmentObservation[];
  priorities: string[];
  summary: string;
  disclaimers: string[];
};

type AssessmentInput = {
  questionnaire: QuestionnaireData;
  poseAnalysis?: PoseAnalysis | null;
  userNotes?: string | null;
};

const toConfidence = (score?: number | null): ObservationConfidence => {
  if (!score) return "low";
  if (score >= 0.75) return "high";
  if (score >= 0.5) return "medium";
  return "low";
};

const toPercent = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value * 100);
};

const viewPrefix = (item: string) => {
  const match = item.match(/^([a-z]+):\s*/i);
  if (!match) return null;
  return match[1].toLowerCase();
};

const unique = (values: string[]) => Array.from(new Set(values));

const buildPoseObservations = (
  poseAnalysis: PoseAnalysis
): AssessmentObservation[] => {
  const confidence = toConfidence(poseAnalysis.confidenceScore);
  const byId = new Map<string, AssessmentObservation>();

  const addOrMerge = (
    id: string,
    title: string,
    description: string,
    evidence: string[],
    likelyDrivers: string[],
    focusTags: FocusTag[],
    suggestion: AssessmentObservation["recommendedInterventions"]
  ) => {
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, {
        id,
        title,
        description,
        confidence,
        evidence: unique(evidence),
        likelyDrivers: unique(likelyDrivers),
        riskIfIgnored: "May slow progress or increase stiffness over time.",
        primaryFocusTags: focusTags,
        recommendedInterventions: suggestion,
      });
      return;
    }
    existing.evidence = unique([...existing.evidence, ...evidence]);
    existing.likelyDrivers = unique([...existing.likelyDrivers, ...likelyDrivers]);
  };

  poseAnalysis.observations.forEach((item) => {
    const lower = item.toLowerCase();
    const view = viewPrefix(item);
    const viewEvidence = view ? [`View: ${view}`] : [];
    if (lower.includes("shoulder height")) {
      const shoulderDelta = toPercent(poseAnalysis.metrics.shoulderHeightDelta);
      addOrMerge(
        "pose-shoulder-asymmetry",
        "Shoulder height asymmetry",
        "Pattern shows uneven shoulder position, often linked with one-side dominant posture and reduced scapular control.",
        unique([
          "Scan: shoulder height difference",
          ...(shoulderDelta !== null
            ? [`Metric: shoulder height delta ${shoulderDelta}% of torso height`]
            : []),
          ...viewEvidence,
        ]),
        ["scapular control", "upper-back endurance"],
        ["scap_control", "posture_endurance", "pull_strength"],
        [
          {
            type: "activation",
            target: "scapular control",
            suggestion: "prone Y/T/W with slow holds",
          },
          {
            type: "strength",
            target: "upper back",
            suggestion: "band rows or face pulls",
          },
        ]
      );
    }
    if (lower.includes("forward head")) {
      const headOffset = toPercent(poseAnalysis.metrics.headForwardOffset);
      addOrMerge(
        "pose-forward-head",
        "Forward head tendency",
        "Pattern shows a forward head bias, which can increase neck strain and make upright posture harder to maintain.",
        unique([
          "Scan: head position offset",
          ...(headOffset !== null
            ? [`Metric: head forward offset ${headOffset}% of torso height`]
            : []),
          ...viewEvidence,
        ]),
        ["limited T-spine extension", "neck flexor endurance"],
        ["neck_endurance", "tspine_extension", "posture_endurance"],
        [
          {
            type: "motorControl",
            target: "deep neck flexors",
            suggestion: "chin tucks with breathing",
          },
          {
            type: "mobility",
            target: "thoracic extension",
            suggestion: "wall slides or T-spine rotations",
          },
        ]
      );
    }
    if (lower.includes("hip")) {
      const hipDelta = toPercent(poseAnalysis.metrics.hipHeightDelta);
      const hipShift = toPercent(poseAnalysis.metrics.hipShift);
      addOrMerge(
        "pose-hip-shift",
        "Hip balance asymmetry",
        "Pattern suggests uneven hip loading and side-to-side balance drift, which can affect squat and gait control.",
        unique([
          "Scan: hip height or lateral shift difference",
          ...(hipDelta !== null
            ? [`Metric: hip height delta ${hipDelta}% of torso height`]
            : []),
          ...(hipShift !== null
            ? [`Metric: lateral hip shift ${hipShift}% of torso height`]
            : []),
          ...viewEvidence,
        ]),
        ["hip stability", "single-leg control"],
        ["glute_medius", "hip_extension", "core_anti_rotation"],
        [
          {
            type: "activation",
            target: "glute med",
            suggestion: "side-lying hip abduction",
          },
          {
            type: "motorControl",
            target: "single-leg balance",
            suggestion: "split squat holds",
          },
        ]
      );
    }
    if (lower.includes("knee")) {
      const kneeDelta = toPercent(poseAnalysis.metrics.kneeAlignmentDelta);
      addOrMerge(
        "pose-knee-alignment",
        "Knee alignment offset",
        "Pattern shows knee tracking bias, usually tied to hip stability and ankle mobility limits.",
        unique([
          "Scan: knee tracking offset",
          ...(kneeDelta !== null
            ? [`Metric: knee tracking delta ${kneeDelta}% of torso height`]
            : []),
          ...viewEvidence,
        ]),
        ["hip stability", "ankle mobility"],
        ["squat_pattern", "ankle_mobility", "glute_medius"],
        [
          {
            type: "motorControl",
            target: "squat tracking",
            suggestion: "tempo bodyweight squats",
          },
          {
            type: "mobility",
            target: "ankle",
            suggestion: "ankle rocks and calf stretch",
          },
        ]
      );
    }
    if (lower.includes("torso lean") || lower.includes("shoulder-to-hip")) {
      const leanAngle = poseAnalysis.metrics.torsoLeanAngle;
      const trunkOffset = toPercent(poseAnalysis.metrics.hipToShoulderAlignment);
      addOrMerge(
        "pose-trunk-bias",
        "Trunk alignment bias",
        "Pattern suggests torso alignment drift, which can reduce efficient force transfer and make posture less stable.",
        unique([
          "Scan: torso lean or shoulder-to-hip offset",
          ...(typeof leanAngle === "number" && Number.isFinite(leanAngle)
            ? [`Metric: torso lean angle ${Math.round(leanAngle)}°`]
            : []),
          ...(trunkOffset !== null
            ? [`Metric: shoulder-to-hip offset ${trunkOffset}% of torso height`]
            : []),
          ...viewEvidence,
        ]),
        ["core bracing", "trunk alignment control"],
        ["core_stability", "posture_endurance", "core_anti_extension"],
        [
          {
            type: "motorControl",
            target: "trunk alignment",
            suggestion: "tempo squats and wall-supported upright holds",
          },
          {
            type: "activation",
            target: "core brace",
            suggestion: "dead bug + breathing + anti-rotation holds",
          },
        ]
      );
    }
  });

  return Array.from(byId.values());
};

const buildSelfReportObservations = (
  questionnaire: QuestionnaireData,
  userNotes?: string | null
): AssessmentObservation[] => {
  const observations: AssessmentObservation[] = [];
  const painAreas = questionnaire.painAreas.length
    ? questionnaire.painAreas
    : [];
  const confidence: ObservationConfidence =
    questionnaire.experience === "Beginner" ? "medium" : "low";

  painAreas.slice(0, 2).forEach((area) => {
    const id = `pain-${area.toLowerCase().replace(/\s+/g, "-")}`;
    observations.push({
      id,
      title: `${area} sensitivity`,
      description: `Self-report suggests ${area.toLowerCase()} sensitivity; we’ll prioritize gentle, supportive work.`,
      confidence,
      evidence: [`Self-report: ${area} discomfort`],
      likelyDrivers: ["local stiffness", "postural load", "limited mobility"],
      riskIfIgnored: "May limit training consistency or comfort.",
      primaryFocusTags: [
        area === "Upper back"
          ? "scap_control"
          : area === "Lower back"
          ? "core_anti_extension"
          : area === "Neck"
          ? "neck_endurance"
          : area === "Hips"
          ? "hip_extension"
          : area === "Knees"
          ? "squat_pattern"
          : "posture_endurance",
        area === "Upper back"
          ? "posture_endurance"
          : area === "Lower back"
          ? "hip_extension"
          : area === "Neck"
          ? "tspine_extension"
          : area === "Hips"
          ? "glute_medius"
          : area === "Knees"
          ? "ankle_mobility"
          : "core_stability",
      ] as FocusTag[],
      recommendedInterventions: [
        {
          type: "mobility",
          target: area,
          suggestion: "slow range-of-motion work and breathing",
        },
        {
          type: "activation",
          target: "supporting muscles",
          suggestion: "low-load activation before main work",
        },
      ],
    });
  });

  if (questionnaire.goals.includes("posture")) {
    observations.push({
      id: "goal-posture-control",
      title: "Posture control focus",
      description:
        "Goal suggests improving posture; we’ll build endurance in upper back and core.",
      confidence: "medium",
      evidence: ["Self-report: posture improvement goal"],
      likelyDrivers: ["upper-back endurance", "core stability"],
      riskIfIgnored: "Posture improvements may plateau.",
      primaryFocusTags: [
        "posture_endurance",
        "scap_control",
        "core_anti_extension",
      ] as FocusTag[],
      recommendedInterventions: [
        {
          type: "strength",
          target: "upper back",
          suggestion: "rows, pull-aparts, face pulls",
        },
        {
          type: "motorControl",
          target: "ribcage alignment",
          suggestion: "breathing + bracing drills",
        },
      ],
    });
  }

  if (userNotes) {
    observations.push({
      id: "notes-considerations",
      title: "User notes highlight",
      description:
        "Notes suggest a specific focus area; we’ll adjust sessions accordingly.",
      confidence: "low",
      evidence: ["Self-report: user notes"],
      likelyDrivers: ["individual preferences"],
      riskIfIgnored: "Less personalized session feel.",
      primaryFocusTags: ["posture_endurance", "core_stability"] as FocusTag[],
      recommendedInterventions: [
        {
          type: "motorControl",
          target: "custom focus",
          suggestion: "blend in preferred drills",
        },
      ],
    });
  }

  return observations;
};

const prioritizeObservations = (observations: AssessmentObservation[]) => {
  const painFirst = observations.filter((obs) => obs.id.startsWith("pain-"));
  const poseNext = observations.filter((obs) => obs.id.startsWith("pose-"));
  const rest = observations.filter(
    (obs) => !obs.id.startsWith("pain-") && !obs.id.startsWith("pose-")
  );
  return [...painFirst, ...poseNext, ...rest].map((obs) => obs.id);
};

export const buildAssessmentReport = ({
  questionnaire,
  poseAnalysis,
  userNotes,
}: AssessmentInput): AssessmentReport => {
  const poseObservations = poseAnalysis ? buildPoseObservations(poseAnalysis) : [];
  const selfReportObservations = buildSelfReportObservations(
    questionnaire,
    userNotes
  );

  const mergedById = new Map<string, AssessmentObservation>();
  [...poseObservations, ...selfReportObservations].forEach((obs) => {
    const existing = mergedById.get(obs.id);
    if (!existing) {
      mergedById.set(obs.id, {
        ...obs,
        evidence: unique(obs.evidence),
        likelyDrivers: unique(obs.likelyDrivers),
      });
      return;
    }
    existing.evidence = unique([...existing.evidence, ...obs.evidence]);
    existing.likelyDrivers = unique([
      ...existing.likelyDrivers,
      ...obs.likelyDrivers,
    ]);
  });

  const observations = Array.from(mergedById.values()).slice(0, 6);

  while (observations.length < 3) {
    observations.push({
      id: `baseline-${observations.length}`,
      title: "Movement baseline",
      description:
        "Pattern suggests we can build consistent movement quality with simple progressions.",
      confidence: "low",
      evidence: ["Self-report: baseline program data"],
      likelyDrivers: ["general conditioning"],
      riskIfIgnored: "Progress may feel slower.",
      primaryFocusTags: ["posture_endurance", "core_stability"] as FocusTag[],
      recommendedInterventions: [
        {
          type: "motorControl",
          target: "tempo",
          suggestion: "slow, controlled reps",
        },
      ],
    });
  }

  const priorities = prioritizeObservations(observations);
  const topTitles = observations.slice(0, 2).map((obs) => obs.title);

  return {
    observations,
    priorities,
    summary: topTitles.length
      ? `Key focus areas: ${topTitles.join(" + ")}.`
      : "Key focus areas identified.",
    disclaimers: [
      "This scan estimates posture patterns — not a medical diagnosis.",
      "Observations may indicate movement tendencies, not injuries.",
    ],
  };
};
