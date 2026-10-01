import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: InputProps) {
  const fieldId = id ?? props.name;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(hintId, errorId) || undefined}
        className={cn(
          "min-h-12 w-full rounded-2xl border bg-gradient-to-b from-white to-paper-raised px-4 text-base text-ink",
          "placeholder:text-ink-muted/70",
          "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_16px_-14px_rgba(11,18,32,0.25)]",
          "transition-[box-shadow,border-color,transform] duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          "focus-visible:border-accent/40 focus-visible:-translate-y-px",
          error ? "border-crimson" : "border-rule",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-crimson">
          {error}
        </p>
      ) : null}
    </div>
  );
}
