import { clientFetch } from "@/lib/api/client-fetch";
import { CreateEntityDto, Entity } from "@vivero/shared";

export const entityService = {
  fetchAll: () => {
    return clientFetch<Entity[]>("entities/tables", { method: "GET" });
  },

  create: (entityData: CreateEntityDto) => {
    return clientFetch<Entity>(`entities/entity`, {
      method: "POST",
      body: JSON.stringify(entityData),
    });
  },

  delete: (id: string) => {
    return clientFetch<void>(`entities/${id}`, {
      method: "DELETE",
    });
  },
};
