// src/components/common/user-avatar.tsx
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-11 w-11 text-sm",
} as const;

function extractInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserAvatar({ name, size = "md", className }: UserAvatarProps) {
  const initials = extractInitials(name);

  return (
    <div
      className={cn(
        "shrink-0 bg-primary rounded-full flex items-center justify-center",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initials ? (
        <span className="text-primary-foreground font-black tracking-tighter">
          {initials}
        </span>
      ) : (
        <User className="h-4 w-4 text-primary-foreground" />
      )}
    </div>
  );
}
