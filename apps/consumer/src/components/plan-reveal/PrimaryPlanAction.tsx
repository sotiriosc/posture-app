"use client";

import Link from "next/link";
import { planRevealTransition } from "./planRevealStyles";

type PrimaryPlanActionProps = {
  href: string;
  label?: string;
  pulse?: boolean;
};

export default function PrimaryPlanAction({
  href,
  label = "Start Day 1",
  pulse = false,
}: PrimaryPlanActionProps) {
  return (
    <Link
      href={href}
      scroll
      data-testid="plan-reveal-start-day-1"
      className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-5 text-base font-semibold text-white shadow-[0_16px_38px_rgba(37,99,235,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${planRevealTransition} ${
        pulse ? "hero-cta-pulse" : ""
      }`}
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
