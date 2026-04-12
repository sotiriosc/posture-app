"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-semibold transition-[transform,box-shadow,background-color,color,opacity] duration-300 ease-out focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "min-h-11 border-blue-300/45 bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] text-white shadow-[0_16px_38px_rgba(37,99,235,0.32)] hover:-translate-y-px hover:shadow-[0_18px_42px_rgba(37,99,235,0.38)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-blue-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
  secondary:
    "border-slate-400/35 bg-slate-900/45 text-slate-300 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-px hover:bg-slate-800/55 hover:shadow-[0_12px_30px_rgba(0,0,0,0.26)] focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
  ghost:
    "border-transparent bg-transparent text-slate-300 hover:-translate-y-px hover:border-slate-300/35 hover:bg-slate-900/35 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
  danger:
    "min-h-11 border-rose-300/45 bg-rose-600 text-white shadow-[0_16px_38px_rgba(225,29,72,0.26)] hover:-translate-y-px hover:bg-rose-500 hover:shadow-[0_18px_42px_rgba(225,29,72,0.34)] focus-visible:ring-2 focus-visible:ring-rose-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
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
