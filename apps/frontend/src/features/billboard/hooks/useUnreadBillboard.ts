"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { BillboardMessageDto } from "@vivero/shared";
import { billboardService } from "../api/billboardService";
import { billboardQueryKeys } from "@/lib/queryKeys";

export const useUnreadBillboard = () => {
  return useSuspenseQuery<BillboardMessageDto[]>({
    queryKey: billboardQueryKeys.unread(),
    queryFn: billboardService.fetchUnread,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
