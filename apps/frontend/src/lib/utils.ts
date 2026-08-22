import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detect mobile devices from user-agent string.
 * Uses regex for comprehensive coverage (Android, iPhone, iPad, etc.).
 */
export function isMobileDevice(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return /mobile|android|iphone|ipad/i.test(ua);
}
