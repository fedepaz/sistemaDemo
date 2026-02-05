//src/features/clients/hooks/hooks.ts

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { mockClientService } from "../api/mockClientService";
import { Client, UpdateClientDto } from "../types";
import { useError } from "@/providers/error-provider";

export const CLIENT_QUERY_KEYS = {
  all: "clients" as const,
  lists: () => [...CLIENT_QUERY_KEYS.all, "lists"] as const,
  list: (filters: string) =>
    [...CLIENT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...CLIENT_QUERY_KEYS.all, "details"] as const,
  detail: (id: string) => [...CLIENT_QUERY_KEYS.details(), { id }] as const,
};

export function useClients() {
  return useSuspenseQuery({
    queryKey: CLIENT_QUERY_KEYS.lists(),
    queryFn: mockClientService.fetchClients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useClient(id: string) {
  return useSuspenseQuery({
    queryKey: CLIENT_QUERY_KEYS.detail(id),
    queryFn: () => mockClientService.fetchClientById(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { handleError } = useError();
  return useMutation({
    mutationFn: mockClientService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      handleError(error, { context: "Crear cliente", shouldRedirect: false });
    },
  });
}

export function useUpdateClient() {
  const { handleError } = useError();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      clientUpdate,
    }: {
      id: string;
      clientUpdate: UpdateClientDto;
    }) => mockClientService.updateClient(id, clientUpdate),
    onSuccess: (updatedUser: Client) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
      queryClient.setQueryData(
        CLIENT_QUERY_KEYS.detail(updatedUser.id),
        updatedUser,
      );
    },
    onError: (error) => {
      handleError(error, {
        context: "Actualizar cliente",
        shouldRedirect: false,
      });
    },
  });
}

export function useDeleteClient() {
  const { handleError } = useError();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockClientService.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      handleError(error, {
        context: "Eliminar cliente",
        shouldRedirect: false,
      });
    },
  });
}
