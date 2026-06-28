// src/features/auditLogs/hooks/auditLogHooks.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { AuditLogDto } from "@vivero/shared";
import { auditLogService } from "../api/auditLogService";
import { auditLogQueryKeys } from "@/lib/queryKeys";

export const useAuditLogs = () => {
  return useSuspenseQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.all(),
    queryFn: auditLogService.fetchAll,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useAuditLogsByTenantName = (tenantName?: string) => {
  return useSuspenseQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.byTenantName(tenantName || ""),
    queryFn: () => auditLogService.fetchByTenantName(tenantName || ""),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useAuditLogsByUserId = (userId: string) => {
  return useSuspenseQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.byUserId(userId),
    queryFn: () => auditLogService.fetchByUserId(userId),
    retry: 1, // Retry once to account for transient network issues
  });
};
