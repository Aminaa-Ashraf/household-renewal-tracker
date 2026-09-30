import type { ButtonHTMLAttributes, ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-terracotta text-paper-raised hover:bg-terracotta-deep focus-visible:outline-terracotta",
  secondary:
    "bg-paper-raised text-ink border border-rule hover:border-ink/30 focus-visible:outline-ink",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 focus-visible:outline-ink",
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
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
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
