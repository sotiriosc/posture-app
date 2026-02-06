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

const buildPoseObservations = (
  poseAnalysis: PoseAnalysis
): AssessmentObservation[] => {
  const confidence = toConfidence(poseAnalysis.confidenceScore);
  const observations: AssessmentObservation[] = [];

  const add = (
    id: string,
    title: string,
    description: string,
    evidence: string[],
    likelyDrivers: string[],
    focusTags: FocusTag[],
    suggestion: AssessmentObservation["recommendedInterventions"]
  ) => {
    observations.push({
      id,
      title,
      description,
      confidence,
      evidence,
      likelyDrivers,
      riskIfIgnored: "May slow progress or increase stiffness over time.",
      primaryFocusTags: focusTags,
      recommendedInterventions: suggestion,
    });
  };

  poseAnalysis.observations.forEach((item) => {
    const lower = item.toLowerCase();
    if (lower.includes("shoulder height")) {
      add(
        "pose-shoulder-asymmetry",
        "Shoulder height asymmetry",
        "Pattern suggests uneven shoulder positioning; we’ll even out upper-back control.",
        ["Scan: shoulder height difference"],
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
      add(
        "pose-forward-head",
        "Forward head tendency",
        "Pattern suggests forward head bias; we’ll focus on neck endurance and rib alignment.",
        ["Scan: head position offset"],
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
      add(
        "pose-hip-shift",
        "Hip balance asymmetry",
        "Pattern suggests hip loading bias; we’ll reinforce balanced hip control.",
        ["Scan: hip height or shift difference"],
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
      add(
        "pose-knee-alignment",
        "Knee alignment offset",
        "Pattern suggests knee tracking bias; we’ll reinforce alignment and control.",
        ["Scan: knee tracking offset"],
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
  });

  return observations;
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

  const combined = [...poseObservations, ...selfReportObservations].slice(0, 6);
  const observations = [...combined];

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
