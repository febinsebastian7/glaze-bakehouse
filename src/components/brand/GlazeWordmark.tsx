import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

type GlazeWordmarkProps = ComponentPropsWithoutRef<"div"> & {
  size?: "compact" | "default" | "display";
  /** Optional context label, such as the private admin area. */
  subtitle?: string;
  inverse?: boolean;
};

const sizes = {
  compact: "h-[50px] w-[114px] sm:h-[58px] sm:w-[132px]",
  default: "h-[68px] w-[150px]",
  display: "h-[86px] w-[190px] sm:h-[104px] sm:w-[230px]",
};

/**
 * The production wordmark is an SVG with a transparent canvas. Its source canvas has
 * generous export margins, so object-cover only trims empty space and never stretches
 * the mark.
 */
export default function GlazeWordmark({ size = "default", subtitle, inverse = false, className = "", ...props }: GlazeWordmarkProps) {
  return <div className={`inline-flex items-center gap-2 ${className}`} {...props}>
    <span className={`relative block shrink-0 overflow-hidden ${sizes[size]}`}>
      <Image
        src="/brand/glaze-logo.svg"
        alt="Glaze Bakehouse"
        fill
        sizes="(max-width: 640px) 112px, 230px"
        className={`object-cover ${inverse ? "brightness-0 invert" : ""}`}
        priority={size === "compact"}
      />
    </span>
    {subtitle && <span className="text-[.42rem] font-semibold uppercase tracking-[.28em] text-current/60">{subtitle}</span>}
  </div>;
}
