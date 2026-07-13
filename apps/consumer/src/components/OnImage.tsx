"use client";

import type { ReactNode } from "react";

type OnImageProps = {
  children: ReactNode;
  className?: string;
};

export default function OnImage({ children, className = "" }: OnImageProps) {
  return (
    <div
      className={`ui-on-image text-slate-100 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_.ui-kicker]:text-slate-300 [&_.ui-body]:text-slate-300 ${className}`}
    >
      {children}
    </div>
  );
}
