import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { generateWeeklyProgram } from "@/lib/program";

type TraceProfile = {
  label: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const PROFILES: TraceProfile[] = [
  {
    label: "posture-beginner-none-activation",
    questionnaire: {
      goals: "Improve posture",
      painAreas: ["shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["none"],
    },
    phaseIndex: 1,
  },
  {
    label: "intermediate-bands-skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 4,
      equipment: ["bands"],
    },
    phaseIndex: 2,
  },
  {
    label: "intermediate-gym-3day-skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym"],
    },
    phaseIndex: 2,
  },
  {
    label: "advanced-gym-growth",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 5,
      equipment: ["gym"],
    },
    phaseIndex: 3,
  },
  {
    label: "advanced-gym-3day-growth",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym"],
    },
    phaseIndex: 3,
  },
];

PROFILES.forEach((profile, profileIndex) => {
  const byDay = new Map<
    string,
    Map<
      string,
      {
        slotId: string;
        slotKind: string;
        chosenExerciseId: string;
        chosen: string;
        reasons: string[];
        penalties: string[];
        top: string;
      }
    >
  >();
  const finalizedTraceDaySet = new Set<string>();

  const program = generateWeeklyProgram(
    profile.questionnaire,
    `decision-trace-${profileIndex + 1}`,
    {
      phaseIndex: profile.phaseIndex,
      seed: `decision-trace-seed-${profile.label}`,
      selectionAuditHook: (entry) => {
        const isFinalTrace = entry.chosen.reasons.includes("[final_trace]");
        const reasons = entry.chosen.reasons
          .filter((reason) => reason !== "[final_trace]")
          .slice(0, 3);
        const penalties = reasons
          .filter((reason) => reason.trim().startsWith("-"))
          .slice(0, 3);
        const top = entry.top
          .slice(0, 3)
          .map((candidate) => `${candidate.name}(${candidate.score.toFixed(2)})`)
          .join(" | ");

        const current =
          isFinalTrace && !finalizedTraceDaySet.has(entry.dayTitle)
            ? new Map<
                string,
                {
                  slotId: string;
                  slotKind: string;
                  chosenExerciseId: string;
                  chosen: string;
                  reasons: string[];
                  penalties: string[];
                  top: string;
                }
              >()
            : byDay.get(entry.dayTitle) ?? new Map();
        if (isFinalTrace) {
          finalizedTraceDaySet.add(entry.dayTitle);
        } else if (finalizedTraceDaySet.has(entry.dayTitle)) {
          return;
        }
        current.set(entry.slotId, {
          slotId: entry.slotId,
          slotKind: entry.slotKind,
          chosenExerciseId: entry.chosen.exerciseId,
          chosen: `${entry.chosen.name} (${entry.chosen.score.toFixed(2)})`,
          reasons,
          penalties,
          top,
        });
        byDay.set(entry.dayTitle, current);
      },
    }
  );

  console.log(`CASE ${profile.label} | phase=${program.phaseName ?? profile.phaseIndex}`);
  program.week.forEach((day) => {
    console.log(`- ${day.title}`);
    const traces = Array.from((byDay.get(day.title) ?? new Map()).values()).sort(
      (left, right) => left.slotId.localeCompare(right.slotId)
    );
    traces.forEach((trace) => {
      console.log(`  SLOT ${trace.slotId} ${trace.slotKind}: ${trace.chosen} (${trace.chosenExerciseId})`);
      console.log(`    reasons: ${trace.reasons.join(" ; ") || "(none)"}`);
      if (trace.penalties.length) {
        console.log(`    penalties: ${trace.penalties.join(" ; ")}`);
      }
      console.log(`    top: ${trace.top}`);
    });
  });
  console.log("");
});
