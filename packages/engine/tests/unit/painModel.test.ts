import { describe, expect, test } from "vitest";
import {
  QUESTIONNAIRE_PAIN_DISPLAY_LABELS,
  canonicalizePainAreas,
  evaluateHardPainExclusion,
  hasUsableStructuredPainMetadata,
  legacyTextContraindicationHits,
  painAreasConflict,
  parsePainToken,
} from "@/lib/painModel";

describe("painModel canonicalization", () => {
  test("maps Knees / knee / knees aliases", () => {
    expect(canonicalizePainAreas(["Knees"]).areas).toEqual(["knees"]);
    expect(canonicalizePainAreas(["knee"]).areas).toEqual(["knees"]);
    expect(canonicalizePainAreas(["knees"]).areas).toEqual(["knees"]);
  });

  test("maps lower-back aliases", () => {
    expect(canonicalizePainAreas(["Lower back"]).areas).toEqual(["lower_back"]);
    expect(canonicalizePainAreas(["low back"]).areas).toEqual(["lower_back"]);
    expect(canonicalizePainAreas(["low_back"]).areas).toEqual(["lower_back"]);
  });

  test("maps shoulder / shoulders and hip / hips", () => {
    expect(canonicalizePainAreas(["shoulder"]).areas).toEqual(["shoulders"]);
    expect(canonicalizePainAreas(["Shoulders"]).areas).toEqual(["shoulders"]);
    expect(canonicalizePainAreas(["hip", "Hips"]).areas).toEqual(["hips"]);
  });

  test("dedupes duplicate aliases", () => {
    expect(canonicalizePainAreas(["Knees", "knee", "knees"]).areas).toEqual([
      "knees",
    ]);
  });

  test("unknown tokens warn and do not crash", () => {
    const result = canonicalizePainAreas(["Knees", "martian_joint"]);
    expect(result.areas).toEqual(["knees"]);
    expect(result.unknown).toContain("martian_joint");
    expect(result.warnings.some((w) => w.startsWith("unknown_pain_token:"))).toBe(
      true
    );
  });

  test("acute modifier parses without changing area match semantics", () => {
    const parsed = parsePainToken("acute knees");
    expect(parsed.area).toBe("knees");
    expect(parsed.modifier).toBe("acute");
    expect(painAreasConflict(["acute knees"], ["knees"]).excluded).toBe(true);
  });

  test("questionnaire display set includes Knees", () => {
    expect(QUESTIONNAIRE_PAIN_DISPLAY_LABELS).toContain("Knees");
    expect(QUESTIONNAIRE_PAIN_DISPLAY_LABELS).toHaveLength(6);
  });
});

describe("painModel hard exclusion precedence", () => {
  test("structured acute knees is soft caution for questionnaire planning", () => {
    const result = evaluateHardPainExclusion(
      { painContraindications: ["acute knees", "hips"], contraindications: [] },
      ["Knees"]
    );
    expect(result.excluded).toBe(false);
    expect(result.via).toBe("none");
    expect(result.reasonCodes).toContain(
      "deprioritized:pain_policy:acute_caution:knees"
    );
  });

  test("unmodified structured knees hard-excludes; acute can hard-exclude when opted in", () => {
    const hard = evaluateHardPainExclusion(
      { painContraindications: ["knees"], contraindications: [] },
      ["Knees"]
    );
    expect(hard.excluded).toBe(true);
    expect(hard.via).toBe("structured");

    const acuteSession = evaluateHardPainExclusion(
      { painContraindications: ["acute knees"], contraindications: [] },
      ["Knees"],
      { treatAcuteAsHard: true }
    );
    expect(acuteSession.excluded).toBe(true);
    expect(acuteSession.via).toBe("structured");
  });

  test("usable structured without match does not use free-text", () => {
    const result = evaluateHardPainExclusion(
      {
        painContraindications: ["shoulders"],
        contraindications: ["Knee pain (reduce range)"],
      },
      ["Knees"]
    );
    expect(hasUsableStructuredPainMetadata(["shoulders"])).toBe(true);
    expect(result.excluded).toBe(false);
    expect(result.via).toBe("none");
  });

  test("legacy free-text hard-excludes only when structured unusable", () => {
    const result = evaluateHardPainExclusion(
      {
        painContraindications: [],
        contraindications: ["Knee pain (shorten range)"],
      },
      ["knees"]
    );
    expect(result.excluded).toBe(true);
    expect(result.via).toBe("legacy_text");
    expect(result.reasonCodes).toContain(
      "legacy_text_contraindication_used:knees"
    );
  });

  test("legacy matcher uses word boundaries (no false ankle from rankle)", () => {
    const hit = legacyTextContraindicationHits(
      ["Do not rankle the joint"],
      ["ankles"]
    );
    expect(hit.excluded).toBe(false);
  });
});
