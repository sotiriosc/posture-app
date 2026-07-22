/**
 * Phase 5 — Gyms operator member progress demo data.
 *
 * Uses the existing demo pattern from gymSaas/demoData.ts.
 * No PII beyond what the gym already has from membership (member ID + handle).
 */

import type { ResultsProjection } from "@praxis/engine/results/resultsProjection";

export type MemberRosterRow = {
  /** Opaque member handle — no real name or email. */
  memberId: string;
  handle: string;
  currentPhase: "activation" | "skill" | "growth";
  sessionsThisWeek: number;
  laddersClimbedTotal: number;
  retirementsSinceLastCheck: number;
  lastSeenSessionCount: number;
};

export type MemberProjectionDrill = {
  member: MemberRosterRow;
  projection: ResultsProjection;
};

// ---------------------------------------------------------------------------
// Demo roster (operator-facing, no PII)
// ---------------------------------------------------------------------------

export const demoMemberRoster: MemberRosterRow[] = [
  {
    memberId: "member-001",
    handle: "Athlete #001",
    currentPhase: "skill",
    sessionsThisWeek: 3,
    laddersClimbedTotal: 4,
    retirementsSinceLastCheck: 1,
    lastSeenSessionCount: 14,
  },
  {
    memberId: "member-002",
    handle: "Athlete #002",
    currentPhase: "activation",
    sessionsThisWeek: 2,
    laddersClimbedTotal: 1,
    retirementsSinceLastCheck: 0,
    lastSeenSessionCount: 6,
  },
  {
    memberId: "member-003",
    handle: "Athlete #003",
    currentPhase: "growth",
    sessionsThisWeek: 3,
    laddersClimbedTotal: 8,
    retirementsSinceLastCheck: 0,
    lastSeenSessionCount: 36,
  },
  {
    memberId: "member-004",
    handle: "Athlete #004",
    currentPhase: "skill",
    sessionsThisWeek: 1,
    laddersClimbedTotal: 2,
    retirementsSinceLastCheck: 0,
    lastSeenSessionCount: 11,
  },
];

// ---------------------------------------------------------------------------
// Operator coaching notes derived from projection data (no PII layer)
// ---------------------------------------------------------------------------

export function buildOperatorCoachNote(member: MemberRosterRow): string {
  if (member.retirementsSinceLastCheck > 0) {
    return `Athlete cleared a posture focus on their last retest. Consider mentioning at next session.`;
  }
  if (member.laddersClimbedTotal >= 6) {
    return `Athlete is tracking well — ${member.laddersClimbedTotal} rung advancements logged.`;
  }
  if (member.sessionsThisWeek === 0) {
    return `No sessions this week — check in if appropriate.`;
  }
  return `${member.sessionsThisWeek} session${member.sessionsThisWeek === 1 ? "" : "s"} this week.`;
}
