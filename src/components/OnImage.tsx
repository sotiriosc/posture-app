"use client";

import type { ReactNode } from "react";

type OnImageProps = {
  children: ReactNode;
  className?: string;
};

export default function OnImage({ children, className = "" }: OnImageProps) {
  return (
    <div
      className={`text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-slate-200 [&_span]:text-slate-200 [&_label]:text-slate-200 [&_a]:text-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}
