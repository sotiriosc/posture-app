"use client";

import DailyInsightCard from "@/components/dashboard/DailyInsightCard";
import type { Insight } from "@/lib/insightGenerator";

export type KnowledgeCard = {
  key: "movement" | "stability" | "compensation" | "adaptation";
  title: string;
  summary: string;
  items: string[];
};

type InsightsPanelProps = {
  dailyInsight: Insight;
  coachNotes: [string, string, string];
  weeklyPriorities: string[];
};

export default function InsightsPanel({
  dailyInsight,
  coachNotes,
  weeklyPriorities,
}: InsightsPanelProps) {
  return (
    <div className="order-4">
      <DailyInsightCard
        insight={dailyInsight}
        coachNotes={coachNotes}
        priorities={weeklyPriorities}
      />
    </div>
  );
}
