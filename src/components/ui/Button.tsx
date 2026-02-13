"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  "inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-sky-300/45 bg-[linear-gradient(135deg,#26a6ff,#0e8de8)] text-slate-950 shadow-[0_10px_28px_rgba(35,166,255,0.28)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
  secondary:
    "border-slate-400/40 bg-slate-900/55 text-slate-100 hover:bg-slate-800/65 focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
  ghost:
    "border-transparent bg-transparent text-slate-200 hover:border-slate-300/35 hover:bg-slate-900/35 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
