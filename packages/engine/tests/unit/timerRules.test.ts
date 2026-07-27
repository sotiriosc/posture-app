import { describe, expect, it } from "vitest";
import {
  getEffectiveTimer,
  parseRepTarget,
  tempoDisplayForItem,
  tempoDisplayForSection,
  tempoNotationForPace,
  tempoPaceForSection,
  TEMPO_NOTATION,
  TEMPO_SEC_PER_REP,
  workSecondsFromRepsAndTempo,
} from "../../src/timerRules";

describe("timerRules — section tempo + reps×tempo", () => {
  it("maps sections to slow/fast", () => {
    expect(tempoPaceForSection("warmup")).toBe("slow");
    expect(tempoPaceForSection("activation")).toBe("slow");
    expect(tempoPaceForSection("main")).toBe("slow");
    expect(tempoPaceForSection("cooldown")).toBe("slow");
    expect(tempoPaceForSection("accessory")).toBe("fast");
  });

  it("uses classic tempo notation for section paces", () => {
    expect(TEMPO_NOTATION.slow).toBe("2-0-2-0");
    expect(TEMPO_NOTATION.fast).toBe("1-0-1-0");
    expect(tempoNotationForPace("slow")).toBe("2-0-2-0");
    expect(tempoNotationForPace("fast")).toBe("1-0-1-0");
  });

  it("displays section tempo and omits it for timed holds", () => {
    expect(tempoDisplayForSection("main")).toBe("Tempo 2-0-2-0");
    expect(tempoDisplayForSection("accessory")).toBe("Tempo 1-0-1-0");
    expect(
      tempoDisplayForItem({ section: "warmup", loadType: "bodyweight" })
    ).toBe("Tempo 2-0-2-0");
    expect(
      tempoDisplayForItem({ section: "main", loadType: "timed" })
    ).toBeNull();
  });

  it("parses rep ranges, per-side, and per-letter (Y-T-W)", () => {
    expect(parseRepTarget("8-12")).toEqual({
      reps: 12,
      perSide: false,
      perLetter: false,
    });
    expect(parseRepTarget("6-8 per side")).toEqual({
      reps: 8,
      perSide: true,
      perLetter: false,
    });
    expect(parseRepTarget("10 each")).toEqual({
      reps: 10,
      perSide: true,
      perLetter: false,
    });
    expect(parseRepTarget("6-8 reps per letter")).toEqual({
      reps: 8,
      perSide: false,
      perLetter: true,
    });
    expect(parseRepTarget("5 each direction")).toEqual({
      reps: 5,
      perSide: false,
      perLetter: false,
    });
  });

  it("computes work seconds from reps × tempo", () => {
    expect(
      workSecondsFromRepsAndTempo({ reps: 10, pace: "slow" })
    ).toBe(10 * TEMPO_SEC_PER_REP.slow);
    expect(
      workSecondsFromRepsAndTempo({ reps: 12, pace: "fast" })
    ).toBe(12 * TEMPO_SEC_PER_REP.fast);
    expect(
      workSecondsFromRepsAndTempo({ reps: 8, perSide: true, pace: "slow" })
    ).toBe(16 * TEMPO_SEC_PER_REP.slow);
    expect(
      workSecondsFromRepsAndTempo({ reps: 8, perLetter: true, pace: "slow" })
    ).toBe(24 * TEMPO_SEC_PER_REP.slow);
  });

  it("aligns prone Y-T-W as reps×tempo (not a timed hold)", () => {
    const ytw = getEffectiveTimer({
      exerciseId: "prone-ytw",
      sets: "2",
      reps: "6-8 reps per letter",
      durationSec: null,
      loadType: "bodyweight",
      section: "activation",
      restSec: 30,
    });
    expect(ytw.fromRepTempo).toBe(true);
    expect(ytw.tempoPace).toBe("slow");
    expect(ytw.workSeconds).toBe(24 * TEMPO_SEC_PER_REP.slow);
  });

  it("uses slow reps×tempo for main and fast for accessory", () => {
    const main = getEffectiveTimer({
      exerciseId: "goblet-squat",
      sets: "3",
      reps: "8-10",
      loadType: "weighted",
      section: "main",
    });
    expect(main.fromRepTempo).toBe(true);
    expect(main.tempoPace).toBe("slow");
    expect(main.workSeconds).toBe(10 * TEMPO_SEC_PER_REP.slow);

    const accessory = getEffectiveTimer({
      exerciseId: "band-pull-aparts",
      sets: "2",
      reps: "12-15",
      loadType: "bodyweight",
      section: "accessory",
    });
    expect(accessory.tempoPace).toBe("fast");
    expect(accessory.workSeconds).toBe(15 * TEMPO_SEC_PER_REP.fast);
  });

  it("keeps timed holds on durationSec", () => {
    const hold = getEffectiveTimer({
      exerciseId: "plank",
      sets: "2",
      reps: null,
      durationSec: 40,
      loadType: "timed",
      section: "main",
    });
    expect(hold.fromRepTempo).toBe(false);
    expect(hold.workSeconds).toBe(40);
  });
});
