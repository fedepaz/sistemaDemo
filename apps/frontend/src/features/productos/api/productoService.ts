// apps/frontend/src/features/productos/api/productoService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateProductoDto, ProductoDto, UpdateProductoDto } from "@vivero/shared";

export const productoService = {
  fetchAll: () => {
    return clientFetch<ProductoDto[]>("productos", { method: "GET" });
  },

  create: (data: CreateProductoDto) => {
    return clientFetch<ProductoDto>("productos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: UpdateProductoDto) => {
    return clientFetch<ProductoDto>(`productos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  remove: (id: string) => {
    return clientFetch<void>(`productos/${id}`, { method: "DELETE" });
  },
};
