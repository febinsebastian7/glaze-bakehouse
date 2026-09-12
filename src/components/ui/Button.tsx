import Link from "next/link";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline";
  className?: string;
}

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "glaze-primary-button"
      : "glaze-outline-button";

  const classes = `
    inline-flex
    min-h-12
    items-center
    justify-center
    gap-3
    rounded-full
    px-6
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.16em]
    ${styles}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes}>
      {children}
    </button>
  );
}