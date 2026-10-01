import type { ButtonHTMLAttributes, ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gradient-to-b from-accent-bright to-accent text-white shadow-[0_1px_0_rgba(255,255,255,0.28)_inset,0_10px_22px_-12px_var(--accent-glow),0_3px_0_var(--accent-deep)] hover:from-[#318a6c] hover:to-accent-deep focus-visible:outline-accent",
  secondary:
    "bg-gradient-to-b from-white to-paper-raised text-ink border border-rule shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_10px_18px_-14px_rgba(28,25,23,0.2)] hover:border-rule-strong focus-visible:outline-ink",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 focus-visible:outline-ink shadow-none",
} as const;

const sizes = {
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-6 text-lg",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

function buttonClassName(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[20px] font-semibold tracking-tight",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "pressable",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName(variant, size, className)} {...props} />
  );
}
