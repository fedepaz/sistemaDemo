// src/features/alerts/hooks/useAlertSolved.ts
"use client";

import { alertsSolvedQueryKeys } from "@/lib/queryKeys";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertSolvedDto } from "@vivero/shared";
import { alertSolvedService } from "../api/alertSolvedService";

export const useAlertSolved = () => {
  return useSuspenseQuery<AlertSolvedDto[]>({
    queryKey: alertsSolvedQueryKeys.all(),
    queryFn: alertSolvedService.fetchAll,
    retry: 1, // Retry once to account for transient network issues
  });
};
