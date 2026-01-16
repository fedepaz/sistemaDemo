//src/features/users/hooks/hooks.ts

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { mockUserService } from "../api/mockUserService";
import { User, UpdateUserDto } from "../types";

export const USER_QUERY_KEYS = {
  all: "users" as const,
  lists: () => [...USER_QUERY_KEYS.all, "lists"] as const,
  list: (filters: string) => [...USER_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...USER_QUERY_KEYS.all, "details"] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), { id }] as const,
};

export function useUsers() {
  return useSuspenseQuery({
    queryKey: USER_QUERY_KEYS.lists(),
    queryFn: mockUserService.fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUser(id: string) {
  return useSuspenseQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => mockUserService.fetchUserById(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockUserService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      userUpdate,
    }: {
      id: string;
      userUpdate: UpdateUserDto;
    }) => mockUserService.updateUser(id, userUpdate),
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.setQueryData(
        USER_QUERY_KEYS.detail(updatedUser.id),
        updatedUser
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockUserService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
