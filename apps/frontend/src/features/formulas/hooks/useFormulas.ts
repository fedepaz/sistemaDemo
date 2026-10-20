// apps/frontend/src/features/formulas/hooks/useFormulas.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateFormulaDto, FormulaDto } from "@vivero/shared";
import { toast } from "sonner";
import { formulaService } from "../api/formulaService";
import { formulaQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useFormulas = () => {
  return useSuspenseQuery<FormulaDto[]>({
    queryKey: formulaQueryKeys.all(),
    queryFn: formulaService.fetchAll,
    retry: 1,
  });
};

export const useCreateFormula = () => {
  const queryClient = useQueryClient();

  return useMutation<FormulaDto, Error, CreateFormulaDto>({
    mutationFn: formulaService.create,
    onSuccess: () => {
      toast.success("Fórmula creada exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createFormula");
    },
  });
};

export const useDeleteFormula = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: formulaService.remove,
    onSuccess: () => {
      toast.success("Fórmula eliminada exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "deleteFormula");
    },
  });
};
