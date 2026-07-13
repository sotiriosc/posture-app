"use client";

import * as tf from "@tensorflow/tfjs";

type PoseKeypoint = {
  x: number;
  y: number;
  score?: number;
  name?: string;
};

export type PoseMetrics = {
  torsoHeight: number | null;
  avgKeypointScore: number | null;
  shoulderHeightDelta: number | null;
  hipHeightDelta: number | null;
  kneeAlignmentDelta: number | null;
  headForwardOffset: number | null;
  torsoLeanAngle: number | null;
  hipToShoulderAlignment: number | null;
  scapularSymmetry: number | null;
  hipShift: number | null;
};

export type PoseAnalysis = {
  metrics: PoseMetrics;
  observations: string[];
  priorities: string[];
  confidenceScore: number;
};

type PoseModel = {
  estimatePoses: (
    image: HTMLImageElement,
    config?: { maxPoses?: number; flipHorizontal?: boolean }
  ) => Promise<{ keypoints: PoseKeypoint[] }[]>;
};

let detectorPromise: Promise<PoseModel> | null = null;

const ensureBackend = async () => {
  if (tf.getBackend()) return;
  try {
    await tf.setBackend("webgl");
  } catch {
    await tf.setBackend("cpu");
  }
  await tf.ready();
};

export const loadPoseModel = async (): Promise<PoseModel> => {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      await ensureBackend();
      const movenet = await import(
        "@tensorflow-models/pose-detection/dist/movenet/detector"
      );
      return movenet.load({
        modelType: "SinglePose.Lightning",
        enableSmoothing: true,
      });
    })();
  }
  return detectorPromise;
};

const pointByName = (
  keypoints: PoseKeypoint[],
  name: string,
  minScore = 0.2
) => {
  const match = keypoints.find((point) => point.name === name);
  if (!match || (match.score ?? 0) < minScore) return null;
  return match;
};

const averagePoint = (
  a: PoseKeypoint | null,
  b: PoseKeypoint | null
) => {
  if (!a || !b) return null;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    score: Math.min(a.score ?? 0, b.score ?? 0),
  };
};

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const normalizeByTorso = (value: number | null, torsoHeight: number | null) => {
  if (value === null || torsoHeight === null || torsoHeight === 0) return null;
  return value / torsoHeight;
};

const averageScore = (points: (PoseKeypoint | null)[]) => {
  const scores = points
    .map((point) => point?.score)
    .filter((score): score is number => typeof score === "number");
  if (!scores.length) return null;
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
};

export const analyzeImagePose = async (
  imageElement: HTMLImageElement
): Promise<PoseKeypoint[] | null> => {
  const detector = await loadPoseModel();
  const poses = await detector.estimatePoses(imageElement, {
    maxPoses: 1,
    flipHorizontal: false,
  });
  return poses[0]?.keypoints ?? null;
};

export const computeMetrics = (keypoints: PoseKeypoint[]): PoseMetrics => {
  const leftShoulder = pointByName(keypoints, "left_shoulder");
  const rightShoulder = pointByName(keypoints, "right_shoulder");
  const leftHip = pointByName(keypoints, "left_hip");
  const rightHip = pointByName(keypoints, "right_hip");
  const leftKnee = pointByName(keypoints, "left_knee");
  const rightKnee = pointByName(keypoints, "right_knee");
  const leftAnkle = pointByName(keypoints, "left_ankle");
  const rightAnkle = pointByName(keypoints, "right_ankle");
  const leftWrist = pointByName(keypoints, "left_wrist");
  const rightWrist = pointByName(keypoints, "right_wrist");
  const leftEar = pointByName(keypoints, "left_ear");
  const rightEar = pointByName(keypoints, "right_ear");
  const nose = pointByName(keypoints, "nose");

  const midShoulder = averagePoint(leftShoulder, rightShoulder);
  const midHip = averagePoint(leftHip, rightHip);

  const torsoHeight =
    midShoulder && midHip ? distance(midShoulder, midHip) : null;

  const shoulderHeightDelta = normalizeByTorso(
    leftShoulder && rightShoulder
      ? Math.abs(leftShoulder.y - rightShoulder.y)
      : null,
    torsoHeight
  );

  const hipHeightDelta = normalizeByTorso(
    leftHip && rightHip ? Math.abs(leftHip.y - rightHip.y) : null,
    torsoHeight
  );

  const kneeAlignmentDelta = normalizeByTorso(
    leftKnee && leftAnkle && rightKnee && rightAnkle
      ? (Math.abs(leftKnee.x - leftAnkle.x) +
          Math.abs(rightKnee.x - rightAnkle.x)) /
          2
      : null,
    torsoHeight
  );

  const leftSideScore =
    (leftShoulder?.score ?? 0) +
    (leftHip?.score ?? 0) +
    (leftEar?.score ?? 0);
  const rightSideScore =
    (rightShoulder?.score ?? 0) +
    (rightHip?.score ?? 0) +
    (rightEar?.score ?? 0);
  const useLeftSide = leftSideScore >= rightSideScore;
  const sideShoulder = useLeftSide ? leftShoulder : rightShoulder;
  const sideHip = useLeftSide ? leftHip : rightHip;
  const sideEar = useLeftSide ? leftEar : rightEar;
  const sideHead = nose ?? sideEar;

  const headForwardOffset = normalizeByTorso(
    sideHead && sideShoulder ? Math.abs(sideHead.x - sideShoulder.x) : null,
    torsoHeight
  );

  const hipToShoulderAlignment = normalizeByTorso(
    sideShoulder && sideHip ? Math.abs(sideShoulder.x - sideHip.x) : null,
    torsoHeight
  );

  const torsoLeanAngle = (() => {
    if (!sideShoulder || !sideHip) return null;
    const dx = Math.abs(sideShoulder.x - sideHip.x);
    const dy = Math.abs(sideShoulder.y - sideHip.y);
    if (dy === 0) return null;
    const radians = Math.atan2(dx, dy);
    return (radians * 180) / Math.PI;
  })();

  const scapularSymmetry = normalizeByTorso(
    leftShoulder && rightShoulder
      ? Math.abs(leftShoulder.y - rightShoulder.y)
      : null,
    torsoHeight
  );

  const hipShift = normalizeByTorso(
    midHip && leftAnkle && rightAnkle
      ? Math.abs(midHip.x - (leftAnkle.x + rightAnkle.x) / 2)
      : leftHip && rightHip
      ? Math.abs(leftHip.x - rightHip.x) / 2
      : null,
    torsoHeight
  );

  return {
    torsoHeight,
    avgKeypointScore: averageScore([
      leftShoulder,
      rightShoulder,
      leftHip,
      rightHip,
      leftKnee,
      rightKnee,
      leftAnkle,
      rightAnkle,
      leftWrist,
      rightWrist,
      leftEar,
      rightEar,
      nose,
    ]),
    shoulderHeightDelta,
    hipHeightDelta,
    kneeAlignmentDelta,
    headForwardOffset,
    torsoLeanAngle,
    hipToShoulderAlignment,
    scapularSymmetry,
    hipShift,
  };
};

export const generateObservations = (metrics: PoseMetrics): PoseAnalysis => {
  const observations: string[] = [];
  const priorities: string[] = [];

  const threshold = {
    shoulder: 0.05,
    hip: 0.05,
    knee: 0.06,
    headForward: 0.08,
    torsoLean: 6,
    hipShoulder: 0.06,
    scapular: 0.06,
    hipShift: 0.06,
  };

  if (metrics.shoulderHeightDelta !== null && metrics.shoulderHeightDelta > threshold.shoulder) {
    observations.push("Mild shoulder height asymmetry detected.");
    priorities.push("Upper-back symmetry and scapular control");
  }

  if (metrics.hipHeightDelta !== null && metrics.hipHeightDelta > threshold.hip) {
    observations.push("Hip height difference may indicate uneven load sharing.");
    priorities.push("Hip stability and lateral balance");
  }

  if (metrics.kneeAlignmentDelta !== null && metrics.kneeAlignmentDelta > threshold.knee) {
    observations.push("Knee tracking appears offset; we’ll focus on alignment.");
    priorities.push("Lower-body alignment and stability");
  }

  if (metrics.headForwardOffset !== null && metrics.headForwardOffset > threshold.headForward) {
    observations.push("Forward head posture tendency detected.");
    priorities.push("Neck + upper-back endurance");
  }

  if (metrics.torsoLeanAngle !== null && metrics.torsoLeanAngle > threshold.torsoLean) {
    observations.push("Torso lean suggests a forward or backward bias.");
    priorities.push("Core bracing and upright posture");
  }

  if (metrics.hipToShoulderAlignment !== null && metrics.hipToShoulderAlignment > threshold.hipShoulder) {
    observations.push("Shoulder-to-hip alignment may be offset.");
    priorities.push("Trunk alignment and core control");
  }

  if (metrics.scapularSymmetry !== null && metrics.scapularSymmetry > threshold.scapular) {
    observations.push("Shoulder blade symmetry may be uneven.");
    priorities.push("Scapular positioning and control");
  }

  if (metrics.hipShift !== null && metrics.hipShift > threshold.hipShift) {
    observations.push("Possible lateral weight shift detected.");
    priorities.push("Balanced weight distribution");
  }

  if (!observations.length) {
    observations.push("No major asymmetries detected at this time.");
  }

  const confidenceScore = Math.min(1, Math.max(0.3, metrics.avgKeypointScore ?? 0.4));

  return {
    metrics,
    observations,
    priorities: Array.from(new Set(priorities)).slice(0, 4),
    confidenceScore,
  };
};
