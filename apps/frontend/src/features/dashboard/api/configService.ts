import { clientFetch } from "@/lib/api/client-fetch";

export interface Config {
  codigo: string;
  nombre: string;
}

export const configService = {
  fetchAll: () => {
    return clientFetch<Config[]>("l-config", {
      method: "GET",
    });
  },
};
