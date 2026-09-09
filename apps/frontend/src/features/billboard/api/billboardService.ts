// src/features/billboard/api/billboardService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import type { BillboardMessageDto, MarkBillboardReadDto } from "@vivero/shared";

export const billboardService = {
  fetchUnread: () => {
    return clientFetch<BillboardMessageDto[]>("billboard/unread", {
      method: "GET",
    });
  },

  markAsRead: (data: MarkBillboardReadDto = {}) => {
    return clientFetch<{ markedCount: number }>("billboard/read", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
