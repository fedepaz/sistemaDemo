//src/features/invoices/hooks/hooks.ts

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { mockInvoiceService } from "../api/mockInvoiceService";
import { Invoice, UpdateInvoiceDto } from "../types";

export const INVOICE_QUERY_KEYS = {
  all: "invoices" as const,
  lists: () => [...INVOICE_QUERY_KEYS.all, "lists"] as const,
  list: (filters: string) =>
    [...INVOICE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...INVOICE_QUERY_KEYS.all, "details"] as const,
  detail: (id: string) => [...INVOICE_QUERY_KEYS.details(), { id }] as const,
};

export function useInvoices() {
  return useSuspenseQuery({
    queryKey: INVOICE_QUERY_KEYS.lists(),
    queryFn: mockInvoiceService.fetchInvoices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInvoice(id: string) {
  return useSuspenseQuery({
    queryKey: INVOICE_QUERY_KEYS.detail(id),
    queryFn: () => mockInvoiceService.fetchInvoiceById(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockInvoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      invoiceUpdate,
    }: {
      id: string;
      invoiceUpdate: UpdateInvoiceDto;
    }) => mockInvoiceService.updateInvoice(id, invoiceUpdate),
    onSuccess: (updatedInvoice: Invoice) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
      queryClient.setQueryData(
        INVOICE_QUERY_KEYS.detail(updatedInvoice.id),
        updatedInvoice
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockInvoiceService.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
