//src/features/purchase-orders/hooks/hooks.ts

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { mockPurchaseOrderSevice } from "../api/mockPurchaseOrderSevice";
import { PurchaseOrder, UpdatePurchaseOrderDto } from "../types";

export const PURCHASE_ORDER_QUERY_KEYS = {
  all: "purchaseOrders" as const,
  lists: () => [...PURCHASE_ORDER_QUERY_KEYS.all, "lists"] as const,
  list: (filters: string) =>
    [...PURCHASE_ORDER_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PURCHASE_ORDER_QUERY_KEYS.all, "details"] as const,
  detail: (id: string) =>
    [...PURCHASE_ORDER_QUERY_KEYS.details(), { id }] as const,
};

export function usePurchaseOrders() {
  return useSuspenseQuery({
    queryKey: PURCHASE_ORDER_QUERY_KEYS.lists(),
    queryFn: mockPurchaseOrderSevice.fetchPurchaseOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePurchaseOrder(id: string) {
  return useSuspenseQuery({
    queryKey: PURCHASE_ORDER_QUERY_KEYS.detail(id),
    queryFn: () => mockPurchaseOrderSevice.fetchPurchaseOrderById(id),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockPurchaseOrderSevice.createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEYS.lists(),
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      purchaseOrderUpdate,
    }: {
      id: string;
      purchaseOrderUpdate: UpdatePurchaseOrderDto;
    }) => mockPurchaseOrderSevice.updatePurchaseOrder(id, purchaseOrderUpdate),
    onSuccess: (updatedPurchaseOrder: PurchaseOrder) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_ORDER_QUERY_KEYS.lists(),
      });
      queryClient.setQueryData(
        PURCHASE_ORDER_QUERY_KEYS.detail(updatedPurchaseOrder.id),
        updatedPurchaseOrder
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockPurchaseOrderSevice.deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
