import Image from "next/image";

export interface LogoProps {
  variant?: "horizontal" | "vertical" | "emblem" | "wordmark";
  theme?: "dark" | "white" | "gold";
  className?: string;
  priority?: boolean;
  alt?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  variant = "horizontal",
  theme = "dark",
  className = "h-9 w-auto",
  priority = false,
  alt = "SHYN.ISH — Everyday Shine. Effortless Style.",
  width,
  height,
}: LogoProps) {
  // Determine file based on variant and theme
  let src = "/assets/shyn-logo-horizontal.png";
  let defaultWidth = 651;
  let defaultHeight = 160;

  if (variant === "horizontal") {
    defaultWidth = 651;
    defaultHeight = 160;
    if (theme === "white") src = "/assets/shyn-logo-horizontal-white.png";
    else if (theme === "gold") src = "/assets/shyn-logo-horizontal-gold.png";
    else src = "/assets/shyn-logo-horizontal.png";
  } else if (variant === "vertical") {
    defaultWidth = 1622;
    defaultHeight = 864;
    if (theme === "white") src = "/assets/shyn-logo-white.png";
    else if (theme === "gold") src = "/assets/shyn-logo-gold.png";
    else src = "/assets/shyn-logo.png";
  } else if (variant === "emblem") {
    defaultWidth = 512;
    defaultHeight = 512;
    if (theme === "white") src = "/assets/shyn-emblem-white.png";
    else if (theme === "gold") src = "/assets/shyn-emblem-gold.png";
    else src = "/assets/shyn-emblem.png";
  } else if (variant === "wordmark") {
    defaultWidth = 1622;
    defaultHeight = 442;
    if (theme === "white") src = "/assets/shyn-wordmark-white.png";
    else if (theme === "gold") src = "/assets/shyn-wordmark-gold.png";
    else src = "/assets/shyn-wordmark.png";
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || defaultWidth}
      height={height || defaultHeight}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
