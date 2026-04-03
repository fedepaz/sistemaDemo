// src/components/common/logo.tsx
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  variant?: "full" | "icon" | "sidebar";
  className?: string;
  blend?: boolean;
}

export function Logo({
  variant = "full",
  className,
  blend = false,
}: LogoProps) {
  const blendClass = blend ? "mix-blend-multiply" : "";

  if (variant === "icon") {
    return (
      <Image
        src="/images/logo-big-removebg-preview.png"
        alt="Proplanta"
        width={200}
        height={200}
        className={cn(blendClass, className)}
        priority
      />
    );
  }

  if (variant === "sidebar") {
    return (
      <Image
        src="/images/logo-start-typo-small-removebg-preview.png"
        alt="Proplanta S.A."
        width={300}
        height={100}
        className={cn(blendClass, className)}
        priority
      />
    );
  }

  return (
    <Image
      src="/images/logo-up-typo-medium-removebg-preview.png"
      alt="Proplanta S.A."
      width={300}
      height={150}
      className={cn(blendClass, className)}
      priority
    />
  );
}
