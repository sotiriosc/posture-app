import type { Metadata } from "next";
import Link from "next/link";
import { demoMemberRoster, buildOperatorCoachNote } from "@/lib/gymSaas/memberProgressData";

export const metadata: Metadata = {
  title: "Member Progress | Praxis for Gyms",
  description: "Operator view of member ladder progress and assessment retirements.",
};

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0E] px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link
            href="/gym-admin/dashboard"
            className="text-xs text-[#5B8FA8] hover:text-[#7BB3CC]"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-4 text-lg font-semibold text-white">Member Progress</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Ladder advancements, posture retirements, and session activity per member.
          </p>
        </header>

        <div className="overflow-hidden rounded-lg border border-[#1F2937]">
          <table className="min-w-full divide-y divide-[#1F2937]">
            <thead className="bg-[#111827]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4B5563]">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4B5563]">
                  Phase
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4B5563]">
                  Ladders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4B5563]">
                  Sessions / wk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4B5563]">
                  Note
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] bg-[#0B0B0E]">
              {demoMemberRoster.map((member) => (
                <tr key={member.memberId} className="hover:bg-[#111827]/50">
                  <td className="px-4 py-4">
                    <p className="text-sm text-white">{member.handle}</p>
                    {member.retirementsSinceLastCheck > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-[#2D4A1E]/60 px-2 py-0.5 text-[10px] font-medium text-[#86EFAC]">
                        {member.retirementsSinceLastCheck} retired
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="capitalize text-sm text-[#9CA3AF]">
                      {member.currentPhase}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm tabular-nums text-[#9CA3AF]">
                    {member.laddersClimbedTotal}
                  </td>
                  <td className="px-4 py-4 text-sm tabular-nums text-[#9CA3AF]">
                    {member.sessionsThisWeek}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#6B7280] max-w-xs">
                    {buildOperatorCoachNote(member)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/gym-admin/members/${member.memberId}`}
                      className="text-xs text-[#5B8FA8] hover:text-[#7BB3CC]"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-[#374151]">
          Demo data. In production, each row reflects a live member program projection.
          No PII is displayed beyond the member handle already held by the gym.
        </p>
      </div>
    </div>
  );
}
