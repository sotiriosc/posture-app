import { describe, expect, test } from "vitest";
import { exercises } from "@/lib/exercises";
import {
  CANONICAL_PAIN_AREAS,
  parsePainToken,
} from "@/lib/painModel";

/** Known non-area structured tokens retained as tissue/strain metadata. */
const ALLOWED_UNMAPPED_STRUCTURED = new Set([
  "hamstrings",
  "hamstring_strain",
]);

describe("pain catalog integrity", () => {
  test("every structured painContraindication is canonical, acuity-mapped, or allowlisted", () => {
    const bad: string[] = [];
    for (const ex of exercises) {
      for (const token of ex.painContraindications ?? []) {
        const parsed = parsePainToken(token);
        if (parsed.area) continue;
        const normalized = token
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, "_");
        if (ALLOWED_UNMAPPED_STRUCTURED.has(normalized)) continue;
        bad.push(`${ex.id}:${token}`);
      }
    }
    expect(bad, `unmapped structured tokens: ${bad.slice(0, 20).join(", ")}`).toEqual(
      []
    );
  });

  test("canonical area set is stable", () => {
    expect(CANONICAL_PAIN_AREAS).toContain("knees");
    expect(CANONICAL_PAIN_AREAS).toContain("wrists");
    expect(CANONICAL_PAIN_AREAS).toContain("elbows");
    expect(CANONICAL_PAIN_AREAS).toContain("ankles");
  });
});
