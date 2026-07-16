"use client";

import { useCallback } from "react";
import type { ExportOptions } from "@/lib/export/types";
import { exportToCSV } from "@/lib/export/csv";
import { exportToExcel } from "@/lib/export/excel";

export function useExportData<T extends Record<string, unknown>>() {
  const exportData = useCallback(async (options: ExportOptions<T>) => {
    const { format } = options;

    switch (format) {
      case "csv":
        exportToCSV(options);
        break;
      case "excel":
        exportToExcel(options);
        break;
      case "pdf":
        // Dynamic import — ~500KB only loaded here
        const { exportToPDF } = await import("@/lib/export/pdf");
        exportToPDF(options);
        break;
    }
  }, []);

  return { exportData };
}
