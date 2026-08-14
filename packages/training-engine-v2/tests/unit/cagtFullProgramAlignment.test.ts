import { describe, expect, it } from "vitest";
import { runFullProgramAlignmentMutationSuite } from "../helpers/fullPrescribedProgramCagtLab";

describe("full prescribed-program entity alignment", () => {
  it("aligns explicit and semantic identity, preserves unmatched structure, and rejects ambiguity", () => {
    const result = runFullProgramAlignmentMutationSuite();
    expect(result).toMatchObject({ mutationCount: 10, passedCount: 10, failedCount: 0 });
    expect(result.rows.map((row) => row.mutation)).toEqual(expect.arrayContaining([
      "objective_id_explicit_mapping",
      "objective_id_semantic_mapping",
      "reservation_reorder_explicit_order",
      "session_added_unmatched",
      "session_removed_unmatched",
      "ambiguous_session_responsibility",
      "ambiguous_assignment_mapping",
    ]));
  });
});
