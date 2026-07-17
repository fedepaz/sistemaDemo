import * as XLSX from "xlsx";
import type { ExportOptions } from "./types";
import { generateFilename, triggerDownload } from "./file-utils";
import { EXPORT_CONFIG } from "@/constants/export-config";

export function exportToExcel<T extends Record<string, unknown>>(
  options: ExportOptions<T>
): void {
  const { data, columns, title, filename } = options;
  const finalFilename = filename ?? generateFilename(title, "excel");

  // Build worksheet data
  const headers = columns.map((col) => col.exportHeader);
  const rows = data.map((row) =>
    columns.map((col) => {
      if (col.exportValue) {
        return col.exportValue(row[col.accessorKey], row);
      }
      const value = row[col.accessorKey];
      return value ?? "";
    })
  );

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = columns.map(() => ({ wch: 20 }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, EXPORT_CONFIG.excel.sheetName);

  // Generate buffer and trigger download
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, finalFilename);
}
