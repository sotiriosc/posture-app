import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  demoMemberRoster,
  buildOperatorCoachNote,
} from "@/lib/gymSaas/memberProgressData";
import MemberDrillIn from "@/components/member-progress/MemberDrillIn";

export const metadata: Metadata = {
  title: "Member Detail | Praxis for Gyms",
};

type PageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function MemberDetailPage({ params }: PageProps) {
  const { memberId } = await params;
  const member = demoMemberRoster.find((m) => m.memberId === memberId);
  if (!member) notFound();

  return (
    <div className="min-h-screen bg-[#0B0B0E] px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/gym-admin/members"
          className="text-xs text-[#5B8FA8] hover:text-[#7BB3CC]"
        >
          ← Members
        </Link>
        <header className="mt-4 mb-8">
          <h1 className="text-lg font-semibold text-white">{member.handle}</h1>
          <p className="mt-1 text-sm text-[#6B7280] capitalize">{member.currentPhase} phase</p>
        </header>

        {/* Operator coaching note — derived from projection, no diagnosis */}
        <div className="mb-6 rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
            Coach note
          </p>
          <p className="mt-1 text-sm text-[#D1D5DB]">{buildOperatorCoachNote(member)}</p>
        </div>

        {/* Full projection drill-in — same engine surface as consumer */}
        <MemberDrillIn member={member} />
      </div>
    </div>
  );
}
