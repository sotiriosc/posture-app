"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "className"
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Classes for the outer label wrapper. */
  className?: string;
  /** Classes for the input (defaults to ui-input). */
  inputClassName?: string;
};

/**
 * Password input with show/hide toggle. Keeps value controlled by the parent.
 */
export default function PasswordField({
  label,
  value,
  onChange,
  className = "",
  inputClassName = "ui-input",
  id,
  ...inputProps
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <label className={className || undefined}>
      <span className="text-inherit">{label}</span>
      <span className="relative mt-2 block">
        <input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClassName} w-full pr-16`.trim()}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-1 my-1 rounded-md px-2 text-xs font-semibold text-current opacity-70 hover:bg-black/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
