import type { ExportOptions } from "./types";
import { generateFilename, triggerDownload } from "./file-utils";

export function exportToCSV<T extends Record<string, unknown>>(
  options: ExportOptions<T>
): void {
  const { data, columns, title, filename } = options;
  const finalFilename = filename ?? generateFilename(title, "csv");

  // Build headers
  const headers = columns.map((col) => col.exportHeader);

  // Build rows
  const rows = data.map((row) =>
    columns.map((col) => {
      if (col.exportValue) {
        return col.exportValue(row[col.accessorKey], row);
      }
      const value = row[col.accessorKey];
      return value ?? "";
    })
  );

  // Escape CSV values
  const escapeCSV = (value: string | number): string => {
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV string
  const csvContent = [headers, ...rows]
    .map((row) => row.map((val) => escapeCSV(String(val ?? ""))).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, finalFilename);
}
