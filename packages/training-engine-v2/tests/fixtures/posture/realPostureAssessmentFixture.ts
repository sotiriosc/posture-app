import {
  deriveAlignmentPriorities,
  type AlignmentPriority,
  type AssessmentState,
} from "../../../src";

export const POSTURE_PHOTO_FILES = {
  front: "/home/sotiriosc/posture-app/docs/posturefront.png",
  back: "/home/sotiriosc/posture-app/docs/postureback.png",
  side: "/home/sotiriosc/posture-app/docs/postureside.png",
} as const;

export const POSTURE_PHOTO_POSE_ANALYSIS_SUMMARY = {
  execution: "Existing Praxis MoveNet pose analyzer executed from a throwaway developer script.",
  perViewConfidence: {
    front: 0.7476,
    back: 0.7316,
    side: 0.5624,
  },
  combinedConfidence: 0.6805,
  combinedConfidenceBand: "medium",
  combinedMetrics: {
    shoulderHeightDelta: 0.0082,
    hipHeightDelta: 0.0085,
    kneeAlignmentDelta: null,
    headForwardOffset: 0.3022,
    torsoLeanAngle: 1.1313,
    hipToShoulderAlignment: 0.0198,
    scapularSymmetry: 0.0031,
    hipShift: 0.0042,
  },
  rawPoseObservations: [
    "front: Head position measured 0.387 forward of shoulder line (threshold 0.08).",
    "front: Torso lean measured 9.8 degrees (threshold 6).",
    "front: Hip-to-shoulder alignment offset measured 0.172 (threshold 0.06).",
    "front: Hip lateral shift measured 0.220 (threshold 0.06).",
    "back: Head position measured 0.401 forward of shoulder line (threshold 0.08).",
    "back: Torso lean measured 10.4 degrees (threshold 6).",
    "back: Hip-to-shoulder alignment offset measured 0.181 (threshold 0.06).",
    "side: Knee tracking offset measured 0.081 (threshold 0.06).",
    "side: Head position measured 0.302 forward of shoulder line (threshold 0.08).",
  ],
  assessmentReportObservationIds: [
    "pose-trunk-bias",
    "pose-hip-shift",
    "pose-knee-alignment",
    "goal-posture-control",
  ],
  adapterNotes: [
    "Only pose-* report observations are converted to V2 AssessmentState.",
    "The self-report goal-posture-control observation is intentionally not converted for this photo-only experiment.",
    "The existing report did not emit pose-forward-head even though raw pose observations included head-position measurements.",
    "The existing report did not provide laterality; V2 side fields are intentionally unset.",
  ],
} as const;

export const POSTURE_PHOTO_SOURCE_FINDINGS = [
  {
    sourceObservationId: "pose-trunk-bias",
    mappedSignalId: "photo-pose-trunk-bias",
    title: "Trunk alignment bias",
    confidence: "medium",
    priority: "primary",
    evidence: [
      "Scan: torso lean or shoulder-to-hip offset",
      "Metric: torso lean angle 1 degrees",
      "Metric: shoulder-to-hip offset 2% of torso height",
      "View: front",
      "View: back",
    ],
  },
  {
    sourceObservationId: "pose-hip-shift",
    mappedSignalId: "photo-pose-hip-shift",
    title: "Hip balance asymmetry",
    confidence: "medium",
    priority: "primary",
    evidence: [
      "Scan: hip height or lateral shift difference",
      "Metric: hip height delta 1% of torso height",
      "Metric: lateral hip shift 0% of torso height",
      "View: front",
      "View: back",
    ],
  },
  {
    sourceObservationId: "pose-knee-alignment",
    mappedSignalId: "photo-pose-knee-alignment",
    title: "Knee alignment offset",
    confidence: "medium",
    priority: "secondary",
    evidence: ["Scan: knee tracking offset", "View: side"],
  },
] as const;

export const POSTURE_PHOTO_ASSESSMENT_STATE = {
  signals: [
    {
      id: "photo-pose-trunk-bias",
      type: "control_finding",
      source: "photo_assessment",
      confidence: "medium",
      priority: "primary",
      region: "lumbar_spine",
      movementRole: "anti_extension_core",
      muscleGroup: "trunk",
      description:
        "Existing assessment report: Trunk alignment bias. Evidence: torso lean or shoulder-to-hip offset from front/back/side aggregation.",
    },
    {
      id: "photo-pose-hip-shift",
      type: "asymmetry_finding",
      source: "photo_assessment",
      confidence: "medium",
      priority: "primary",
      region: "hip",
      movementRole: "single_leg",
      muscleGroup: "hip_abductors",
      description:
        "Existing assessment report: Hip balance asymmetry. Evidence: hip height or lateral shift difference.",
    },
    {
      id: "photo-pose-knee-alignment",
      type: "control_finding",
      source: "photo_assessment",
      confidence: "medium",
      priority: "secondary",
      region: "knee",
      movementRole: "squat",
      muscleGroup: "glutes",
      description:
        "Existing assessment report: Knee alignment offset. Evidence: knee tracking offset from side view.",
    },
  ],
  historicalWeaknesses: [],
} as const satisfies AssessmentState;

export const POSTURE_PHOTO_ALIGNMENT_PRIORITIES: readonly AlignmentPriority[] =
  deriveAlignmentPriorities(POSTURE_PHOTO_ASSESSMENT_STATE).priorities;
