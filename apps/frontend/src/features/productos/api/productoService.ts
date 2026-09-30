// apps/frontend/src/features/productos/api/productoService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateProductoDto, ProductoDto } from "@vivero/shared";

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
};
