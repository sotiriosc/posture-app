import { describe, expect, test } from "vitest";
import { resolveExerciseHistoryIds } from "@/lib/exercises";

const rowLineageIds = [
  "dumbbell-rows",
  "split-stance-row",
  "band-row",
  "machine-seated-row",
  "cable-seated-row",
  "prone-elbow-row",
  "supine-elbow-drive-row",
];

const scapRearDeltLineageIds = [
  "prone-ytw",
  "face-pull",
  "band-pull-aparts",
  "reverse-snow-angel",
  "prone-swimmer",
  "scapular-pushups",
  "wall-slides",
  "suspension-face-pull",
];

describe("exercise lineage integrity", () => {
  test("row lineage history neighbors do not include scap/rear-delt lineage", () => {
    rowLineageIds.forEach((rowId) => {
      const neighbors = new Set(resolveExerciseHistoryIds(rowId, 1));
      scapRearDeltLineageIds.forEach((scapId) => {
        expect(neighbors.has(scapId)).toBe(false);
      });
    });
  });

  test("scap/rear-delt lineage history neighbors do not include row lineage", () => {
    scapRearDeltLineageIds.forEach((scapId) => {
      const neighbors = new Set(resolveExerciseHistoryIds(scapId, 1));
      rowLineageIds.forEach((rowId) => {
        expect(neighbors.has(rowId)).toBe(false);
      });
    });
  });
});
