import Image from "next/image";
import { branding } from "@/config/branding";
import { cn } from "@/lib/utils";

interface GogaLogoProps {
  size?: "sm" | "md" | "lg";
  showBorder?: boolean;
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  sm: { box: "h-10 w-10", image: 40 },
  md: { box: "h-14 w-14", image: 56 },
  lg: { box: "h-24 w-24", image: 96 }
} as const;

export function GogaLogo({
  size = "md",
  showBorder = false,
  className,
  priority = false
}: GogaLogoProps) {
  const dimensions = sizeMap[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        dimensions.box,
        showBorder &&
          "rounded-lg border border-goga-crimson/20 bg-goga-crimson/5 p-1.5 shadow-sm",
        className
      )}
    >
      <Image
        src={branding.logo.src}
        alt={branding.logo.alt}
        width={dimensions.image}
        height={dimensions.image}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
