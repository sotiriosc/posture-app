import type { ProgramRoutineItem } from "@/lib/types";

type RoutineItemCoachingDetailsProps = {
  item: Pick<ProgramRoutineItem, "prescription" | "rationale">;
  fallbackDose?: string | null;
  fallbackRationale?: string | null;
  className?: string;
  showDetails?: boolean;
  tone?: "dark" | "light";
};

const formatSets = (sets: number) => `${sets} ${sets === 1 ? "set" : "sets"}`;

const formatReps = (reps: string) => {
  const value = reps.trim();
  if (!value) return null;
  return /^\d+\s*[-\u2013]\s*\d+$/.test(value) || /^\d+$/.test(value)
    ? `${value} reps`
    : value;
};

export const getRoutineItemDoseParts = (
  item: Pick<ProgramRoutineItem, "prescription">,
  fallbackDose?: string | null
) => {
  const prescription = item.prescription;
  if (!prescription) return fallbackDose ? [fallbackDose] : [];

  const parts = [
    typeof prescription.sets === "number" ? formatSets(prescription.sets) : null,
    prescription.reps ? formatReps(prescription.reps) : null,
    prescription.tempo,
    typeof prescription.restSeconds === "number" ? `${prescription.restSeconds}s rest` : null,
    typeof prescription.targetRPE === "number" ? `RPE ${prescription.targetRPE}` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length ? parts : fallbackDose ? [fallbackDose] : [];
};

export const formatRoutineItemDose = (
  item: Pick<ProgramRoutineItem, "prescription">,
  fallbackDose?: string | null
) => {
  const parts = getRoutineItemDoseParts(item, fallbackDose);
  return parts.length ? parts.join(" | ") : null;
};

const toneClasses = {
  dark: {
    root: "text-slate-300",
    dose: "text-slate-300",
    separator: "text-slate-600",
    summary: "text-slate-300 hover:text-white",
    panel: "border-slate-600/40 bg-slate-950/35 text-slate-300",
    label: "text-slate-500",
  },
  light: {
    root: "text-slate-600",
    dose: "text-slate-600",
    separator: "text-slate-300",
    summary: "text-slate-600 hover:text-slate-900",
    panel: "border-slate-200 bg-slate-50 text-slate-600",
    label: "text-slate-500",
  },
};

export default function RoutineItemCoachingDetails({
  item,
  fallbackDose,
  fallbackRationale,
  className = "",
  showDetails = true,
  tone = "light",
}: RoutineItemCoachingDetailsProps) {
  const classes = toneClasses[tone];
  const doseParts = getRoutineItemDoseParts(item, fallbackDose);
  const detailRows = [
    ["Why this", item.rationale?.whyThisExercise ?? fallbackRationale],
    ["Cue", item.rationale?.mainCue],
    ["Easier", item.rationale?.easierVersion],
    ["Harder", item.rationale?.harderVersion],
    ["Stop if", item.rationale?.stopIf ?? item.prescription?.stopRule],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  if (!doseParts.length && (!showDetails || detailRows.length === 0)) return null;

  return (
    <div className={`space-y-1.5 text-xs leading-5 ${classes.root} ${className}`}>
      {doseParts.length ? (
        <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 ${classes.dose}`}>
          {doseParts.map((part, index) => (
            <span key={`${part}-${index}`} className="inline-flex items-center gap-x-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className={classes.separator}>
                  &bull;
                </span>
              ) : null}
              <span>{part}</span>
            </span>
          ))}
        </div>
      ) : null}

      {showDetails && detailRows.length ? (
        <details className="group">
          <summary className={`inline-flex cursor-pointer list-none items-center text-xs font-semibold ${classes.summary}`}>
            <span>Coach notes</span>
            <span aria-hidden="true" className="ml-1 group-open:hidden">+</span>
            <span aria-hidden="true" className="ml-1 hidden group-open:inline">-</span>
          </summary>
          <div className={`mt-2 space-y-1.5 rounded-lg border px-3 py-2 ${classes.panel}`}>
            {detailRows.map(([label, value]) => (
              <p key={label}>
                <span className={`font-semibold ${classes.label}`}>{label}: </span>
                {value}
              </p>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
