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
    <div className={`relative min-h-screen min-h-[100svh] ${className}`}>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[url('/landing-bg.png')] bg-cover bg-center bg-no-repeat" />
      <div
        className={`pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/70 backdrop-blur-sm ${overlayClassName}`}
      />
      <div className="relative z-10 min-h-screen min-h-[100svh] text-white">
        {children}
      </div>
    </div>
  );
}
