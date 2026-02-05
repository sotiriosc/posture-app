"use client";

import type { ReactNode } from "react";

type BackgroundShellProps = {
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
};

export default function BackgroundShell({
  children,
  className = "",
  overlayClassName = "",
}: BackgroundShellProps) {
  return (
    <div
      className={`relative min-h-screen bg-[url('/landing-bg.png')] bg-cover bg-center ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/70 backdrop-blur-sm ${overlayClassName}`}
      />
      <div className="relative z-10 text-white">{children}</div>
    </div>
  );
}
