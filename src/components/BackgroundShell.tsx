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
    <div className={`app-bg relative min-h-screen min-h-[100svh] ${className}`}>
      <div
        className={`alien-overlay pointer-events-none fixed inset-0 ${overlayClassName}`}
      />
      <div className="relative z-10 min-h-screen min-h-[100svh] text-white">
        {children}
      </div>
    </div>
  );
}
