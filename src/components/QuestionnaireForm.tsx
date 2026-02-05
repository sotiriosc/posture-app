"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";

export type QuestionnaireData = {
  goals: string;
  painAreas: string[];
  experience: string;
  equipment: string[];
  daysPerWeek: 3 | 4 | 5;
};

const STORAGE_KEY = "posture_questionnaire";

const goalOptions = [
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
];

const painOptions = [
  "Neck",
  "Upper back",
  "Lower back",
  "Shoulders",
  "Hips",
];

const experienceOptions = ["Beginner", "Intermediate", "Advanced"];

const equipmentOptions = [
  { value: "none", label: "None" },
  { value: "bands", label: "Resistance bands" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "foam_roller", label: "Foam roller" },
  { value: "gym", label: "Gym" },
];

const emptyData: QuestionnaireData = {
  goals: goalOptions[0],
  painAreas: [],
  experience: experienceOptions[0],
  equipment: ["none"],
  daysPerWeek: 3,
};

export default function QuestionnaireForm() {
  const [data, setData] = useState<QuestionnaireData>(() => {
    if (typeof window === "undefined") return emptyData;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyData;
    const parsed = JSON.parse(saved) as Partial<QuestionnaireData>;
    return {
      ...emptyData,
      ...parsed,
      equipment: normalizeEquipmentSelectionValues(parsed.equipment ?? ["none"]),
      daysPerWeek: parsed.daysPerWeek ?? 3,
    };
  });
  const router = useRouter();

  const updateData = (updates: Partial<QuestionnaireData>) => {
    const next = { ...data, ...updates };
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggleArrayValue = (key: "painAreas" | "equipment", value: string) => {
    const list = data[key].includes(value)
      ? data[key].filter((item) => item !== value)
      : [...data[key], value];

    if (key === "equipment") {
      if (value === "none") {
        updateData({ equipment: ["none"] });
        return;
      }
      if (list.includes("none")) {
        updateData({ equipment: list.filter((item) => item !== "none") });
        return;
      }
    }

    updateData({ [key]: list } as Partial<QuestionnaireData>);
  };

  return (
    <form
      className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"
      onSubmit={(event) => {
        event.preventDefault();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        router.push("/results");
      }}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Days per week
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[3, 4, 5].map((days) => (
            <button
              type="button"
              key={days}
              onClick={() =>
                updateData({ daysPerWeek: days as QuestionnaireData["daysPerWeek"] })
              }
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                data.daysPerWeek === days
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div>
            <label className="text-sm font-semibold text-slate-900">
              Primary goal
            </label>
            <select
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/25"
          value={data.goals}
          onChange={(event) => updateData({ goals: event.target.value })}
        >
          {goalOptions.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Pain areas</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {painOptions.map((area) => (
            <label
              key={area}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm"
            >
              <input
                type="checkbox"
                checked={data.painAreas.includes(area)}
                onChange={() => toggleArrayValue("painAreas", area)}
                className="h-4 w-4 accent-slate-900"
              />
              {area}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">
          Training experience
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {experienceOptions.map((level) => (
            <button
              type="button"
              key={level}
              onClick={() => updateData({ experience: level })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                data.experience === level
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Equipment</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {equipmentOptions.map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm"
            >
              <input
                type="checkbox"
                checked={data.equipment.includes(item.value)}
                onChange={() => toggleArrayValue("equipment", item.value)}
                className="h-4 w-4 accent-slate-900"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Generate routine
      </button>
    </form>
  );
}
