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
        className={`pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_14%,rgba(38,166,255,0.2),transparent_56%),radial-gradient(circle_at_83%_78%,rgba(20,43,90,0.35),transparent_54%),linear-gradient(150deg,rgba(5,10,19,0.84),rgba(8,15,28,0.86))] backdrop-blur-[2px] ${overlayClassName}`}
      />
      <div className="relative z-10 min-h-screen min-h-[100svh] text-white">
        {children}
      </div>
    </div>
  );
}
