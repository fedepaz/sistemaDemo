//src/components/common/loading-spinner.tsx
"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function LoadingSpinner() {
  const t = useTranslations("LoadingSpinner");

  const funnyMessages = [
    t("message1"),
    t("message2"),
    t("message3"),
    t("message4"),
    t("message5"),
    t("message6"),
    t("message7"),
    t("message8"),
    t("message9"),
    t("message10"),
    t("message11"),
    t("message12"),
  ];

  const randomMessage =
    funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 text-foreground">
      <div className={cn("flex items-center justify-center", "mb-6")}>
        <div className="animate-spin rounded-full h-20 w-20 border-t-6 border-b-6 border-primary"></div>
      </div>
      <p className="text-xl font-semibold text-muted-foreground max-w-md text-center px-4">
        {randomMessage}
      </p>
    </div>
  );
}
