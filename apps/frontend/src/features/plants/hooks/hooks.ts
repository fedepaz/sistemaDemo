//src/features/plants/hooks/hooks.ts

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { mockPlantService } from "../api/mockPlantService";
import { Plant, UpdatePlantDto } from "../types";

export const PLANT_QUERY_KEYS = {
  all: "plants" as const,
  lists: () => [...PLANT_QUERY_KEYS.all, "lists"] as const,
  list: (filters: string) =>
    [...PLANT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PLANT_QUERY_KEYS.all, "details"] as const,
  detail: (id: string) => [...PLANT_QUERY_KEYS.details(), { id }] as const,
};

export function usePlants() {
  return useSuspenseQuery({
    queryKey: PLANT_QUERY_KEYS.lists(),
    queryFn: mockPlantService.fetchPlants,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlant(id: string) {
  return useSuspenseQuery({
    queryKey: PLANT_QUERY_KEYS.detail(id),
    queryFn: () => mockPlantService.fetchPlantById(id),
  });
}

export function useCreatePlant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockPlantService.createPlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useUpdatePlant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      plantUpdate,
    }: {
      id: string;
      plantUpdate: UpdatePlantDto;
    }) => mockPlantService.updatePlant(id, plantUpdate),
    onSuccess: (updatedPlant: Plant) => {
      queryClient.invalidateQueries({ queryKey: PLANT_QUERY_KEYS.lists() });
      queryClient.setQueryData(
        PLANT_QUERY_KEYS.detail(updatedPlant.id),
        updatedPlant
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

export function useDeletePlant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockPlantService.deletePlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
