import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "teal" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy-deep shadow-sm border border-navy",
  teal: "bg-teal text-white hover:bg-teal-dark shadow-sm border border-teal",
  secondary:
    "bg-white text-navy border border-line hover:border-navy/40 hover:bg-page",
  ghost: "bg-transparent text-navy hover:bg-navy/5",
  outline:
    "bg-transparent text-navy border border-navy/20 hover:border-navy/50 hover:bg-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2";

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  download,
}: Common & { href: string; download?: boolean | string }) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (download) {
    const filename = typeof download === "string" ? download : true;
    return (
      <a href={href} className={cls} download={filename}>
        {children}
      </a>
    );
  }
  if (href.startsWith("http")) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
