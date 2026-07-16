// src/lib/export/types.ts

export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportColumn<T> {
  /** Key in the data object */
  accessorKey: keyof T;
  /** Human-readable header for exports */
  exportHeader: string;
  /** Optional: transform value before export */
  exportValue?: (value: T[keyof T], row: T) => string | number;
  /** PDF column width — '*' for equal distribution, or a fixed value like '15%' */
  pdfWidth: string | number;
}

export interface ExportOptions<T> {
  data: T[];
  columns: ExportColumn<T>[];
  title: string;
  format: ExportFormat;
  filename?: string;
}
