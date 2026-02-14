import { generateWeeklyProgram } from "@/lib/program";
import { uuid } from "@/lib/logStore";
import type { Program } from "@/lib/types";
import type { EngineSignals } from "@/lib/engine/engineTypes";

export function generateProgramV2(signals: EngineSignals): Program {
  // V2 currently delegates to the existing generator to preserve behavior.
  return generateWeeklyProgram(signals.questionnaire, uuid());
}
