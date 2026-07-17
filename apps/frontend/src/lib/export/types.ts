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

/** Company information from the legacy config table — used in PDF header/footer/metadata */
export interface CompanyConfig {
  name?: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  country?: string;
}

export interface ExportOptions<T> {
  data: T[];
  columns: ExportColumn<T>[];
  title: string;
  format: ExportFormat;
  filename?: string;
  /** Company config from legacy DB — used for PDF header, footer, and metadata */
  companyConfig?: CompanyConfig;
}
