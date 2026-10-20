// apps/frontend/src/features/productos/hooks/useProductos.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateProductoDto, ProductoDto, UpdateProductoDto } from "@vivero/shared";
import { toast } from "sonner";
import { productoService } from "../api/productoService";
import { productoQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useProductos = () => {
  return useSuspenseQuery<ProductoDto[]>({
    queryKey: productoQueryKeys.all(),
    queryFn: productoService.fetchAll,
    retry: 1,
  });
};

export const useCreateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation<ProductoDto, Error, CreateProductoDto>({
    mutationFn: productoService.create,
    onSuccess: (data) => {
      toast.success(`Producto ${data.nombre} creado exitosamente`, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createProducto");
    },
  });
};

export const useUpdateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProductoDto,
    Error,
    { id: string; data: UpdateProductoDto }
  >({
    mutationFn: ({ id, data }) => productoService.update(id, data),
    onSuccess: (data) => {
      toast.success(`Producto ${data.nombre} actualizado exitosamente`, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "updateProducto");
    },
  });
};

export const useDeleteProducto = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: productoService.remove,
    onSuccess: () => {
      toast.success("Producto eliminado exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "deleteProducto");
    },
  });
};
