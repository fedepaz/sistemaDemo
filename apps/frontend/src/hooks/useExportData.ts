"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ExportOptions, CompanyConfig } from "@/lib/export/types";
import { exportToCSV } from "@/lib/export/csv";
import { exportToExcel } from "@/lib/export/excel";
import { configService } from "@/features/dashboard/api/configService";
import { configQueryKeys } from "@/lib/queryKeys";

const CONFIG_KEY_MAP: Record<string, keyof CompanyConfig> = {
  Nombre: "name",
  Direccion: "address",
  Localidad: "city",
  Provincia: "province",
  Telefono: "phone",
  Mail: "email",
  Cuit: "taxId",
  Pais: "country",
};

function buildCompanyConfig(
  config: Array<{ codigo: string; nombre: string }>,
): CompanyConfig {
  const map = Object.fromEntries(config.map((c) => [c.codigo, c.nombre]));
  const result: CompanyConfig = {};
  for (const [key, field] of Object.entries(CONFIG_KEY_MAP)) {
    const value = map[key];
    if (value) {
      result[field] = value;
    }
  }
  return result;
}

export function useExportData<T extends Record<string, unknown>>() {
  const { data: config = [] } = useQuery({
    queryKey: configQueryKeys.all(),
    queryFn: configService.fetchAll,
    retry: false,
    throwOnError: false,
    staleTime: Infinity,
  });

  const companyConfig = useMemo(() => buildCompanyConfig(config), [config]);

  const exportData = useCallback(
    async (options: ExportOptions<T>) => {
      const { format } = options;

      switch (format) {
        case "csv":
          exportToCSV(options);
          break;
        case "excel":
          exportToExcel(options);
          break;
        case "pdf": {
          // Dynamic import — ~500KB only loaded here
          const { exportToPDF } = await import("@/lib/export/pdf");
          exportToPDF({ ...options, companyConfig });
          break;
        }
      }
    },
    [companyConfig],
  );

  return { exportData };
}
