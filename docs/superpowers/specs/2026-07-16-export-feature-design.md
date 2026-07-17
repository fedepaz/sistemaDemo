# Export Feature Design

**Date:** 2026-07-16
**Status:** Approved
**Scope:** All data tables (Users, Audit Logs, Extendidos, Siembra)

## Summary

Implement client-side data export (CSV, Excel, PDF) for all data tables. CSV and Excel generate instantly in the browser. PDF uses pdfmake with lazy-loaded bundle (~500KB) for branded, elegant output.

## Requirements

| Format | Purpose | Generation | Output |
|--------|---------|------------|--------|
| CSV | Raw data | Client-side (papaparse) | Plain text, comma-delimited |
| Excel | Clean table format | Client-side (xlsx) | .xlsx spreadsheet |
| PDF | Branded document for printing/emailing | Client-side (pdfmake, lazy-loaded) | Styled A4 with logo, table, footer |

- All exports use data already loaded in the table (no extra API calls)
- Filenames auto-generated: `{TableName}_{YYYY-MM-DD}.{ext}`
- No loading feedback needed — trigger download immediately
- Centralized branding config for PDF (logo, colors, company name)

## Architecture

```
apps/frontend/src/
├── constants/
│   └── export-config.ts          # Centralized export/branding config (imports PDF_THEME)
├── lib/
│   └── export/
│       ├── index.ts              # Barrel export
│       ├── csv.ts                # CSV generator (papaparse)
│       ├── excel.ts              # Excel generator (xlsx)
│       ├── pdf.ts                # PDF generator (pdfmake, lazy-loaded)
│       ├── types.ts              # Shared export types (ExportColumn, CompanyConfig)
│       ├── file-utils.ts         # Filename generation, download trigger
│       ├── pdf-theme.ts          # PDF color palette (⚠️ keep in sync with globals.css)
│       ├── theme.ts              # OKLCH-to-hex converter (runtime theme extraction)
│       └── fonts/
│           └── poppins-vfs.ts    # Poppins font as base64 VFS for pdfmake
├── hooks/
│   └── useExportData.ts          # Hook that orchestrates exports + reads company config
├── components/data-display/data-table/
│   ├── export-dropdown.tsx       # Wire to useExportData
│   └── data-table.tsx            # Pass column mappings
└── features/
    └── [each feature]/
        └── components/
            └── columns.tsx       # Add exportHeader to each column
```

## Types

### `src/lib/export/types.ts`

```ts
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
```

### `src/constants/export-config.ts`

```ts
import { PDF_THEME } from "@/lib/export/pdf-theme";

export const EXPORT_CONFIG = {
  company: {
    name: "Proplanta S.A.",
    tagline: "El mejor comienzo para sus cultivos",
    logoUrl: "/images/logo-big-removebg-preview.png",
  },
  pdf: {
    ...PDF_THEME,
    fontSize: 6,
    margins: { top: 85, bottom: 30, left: 30, right: 30 },
    pageSize: "A4" as const,
  },
  csv: {
    delimiter: ",",
  },
  excel: {
    sheetName: "Datos",
  },
} as const;
```

## Data Flow

```
DataTable (exportColumns prop)
  ↓
ExportDropdown → handleExport("csv" | "excel" | "pdf")
  ↓
useExportData.exportData({ data, columns, format, title })
  │ reads company config from legacy DB (useQuery, non-suspending)
  ↓
lib/export/csv.ts | excel.ts | pdf.ts
  │ pdf.ts receives companyConfig for dynamic header/footer/metadata
  ↓
Browser download (blob URL)
```

- `selectedRows` are resolved internally by DataTable from `table.getFilteredSelectedRowModel().rows`
- ExportDropdown only receives the format; no external `onExport` callback needed

## Column Mapping

Each feature's `columns.tsx` adds `exportHeader`:

```ts
// Example: userColumns
{
  id: "fullName",
  header: ({ column }) => <SortableHeader column={column}>Nombre completo</SortableHeader>,
  exportHeader: "Nombre completo",
  accessorKey: "username",
  exportValue: (_, row) => `${row.firstName} ${row.lastName}`,
}
```

## Hook

### `src/hooks/useExportData.ts`

```ts
"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ExportOptions, CompanyConfig } from "@/lib/export/types";
import { exportToCSV } from "@/lib/export/csv";
import { exportToExcel } from "@/lib/export/excel";
import { configService } from "@/features/dashboard/api/configService";
import { configQueryKeys } from "@/lib/queryKeys";

// Maps legacy config keys to CompanyConfig fields
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

function buildCompanyConfig(config: Array<{ codigo: string; nombre: string }>): CompanyConfig {
  const map = Object.fromEntries(config.map((c) => [c.codigo, c.nombre]));
  const result: CompanyConfig = {};
  for (const [key, field] of Object.entries(CONFIG_KEY_MAP)) {
    const value = map[key];
    if (value) result[field] = value;
  }
  return result;
}

export function useExportData<T extends Record<string, unknown>>() {
  const { data: config = [] } = useQuery({
    queryKey: configQueryKeys.all(),
    queryFn: configService.fetchAll,
    retry: false,
    throwOnError: false,  // Config is optional — never crash the DataTable
    staleTime: Infinity,
  });

  const companyConfig = useMemo(() => buildCompanyConfig(config), [config]);

  const exportData = useCallback(
    async (options: ExportOptions<T>) => {
      const { format } = options;
      switch (format) {
        case "csv":  exportToCSV(options); break;
        case "excel": exportToExcel(options); break;
        case "pdf":
          const { exportToPDF } = await import("@/lib/export/pdf");
          exportToPDF({ ...options, companyConfig });
          break;
      }
    },
    [companyConfig],
  );

  return { exportData };
}
```

## PDF Styling

- Letterhead header: logo (left) + company name + address/contact info (right), separated by a canvas rule in primary color
- Logo fetched as base64 data URL at runtime, passed via `docDefinition.images`
- Table title + export date below the header rule
- Styled table with column widths driven by `pdfWidth` on each `ExportColumn`
- Alternating row colors via `layout.fillColor` (single source of truth)
- Dynamic company config from legacy `config` table (fallback to defaults if unavailable)
- PDF metadata: title, author (company name), subject (tax ID + address), creator
- Custom Poppins font for headings/brand, Roboto for body text (Poppins embedded as base64 VFS)
- Footer with indigo rule line + page numbers + company name
- A4 page size, compact cell padding for 6pt content font
- Theme colors synced from `globals.css` via `pdf-theme.ts` (⚠️ keep in sync)

## Dependencies

| Package | Purpose | Bundle Impact |
|---------|---------|---------------|
| `papaparse` | CSV generation | ~15KB |
| `@types/papaparse` | TypeScript types | 0KB (dev only) |
| `xlsx` | Excel generation | ~80KB |
| `pdfmake` | PDF generation | ~500KB (lazy-loaded) |
| `file-saver` | Download trigger | ~2KB |

## Affected Tables

| Table | Feature | ExportColumns Source |
|-------|---------|---------------------|
| Users | `src/features/users/components/columns.tsx` | `userColumns` |
| Audit Logs | `src/features/auditLogs/components/columns.tsx` | `auditLogColumns` |
| Extendidos | `src/features/extendidos/components/columns.tsx` | `partidaColumns` |
| Siembra | `src/features/siembra/components/columns.tsx` | `partidaSiembraColumns` |

## Testing

- Unit tests for each generator (csv.ts, excel.ts, pdf.ts)
- Unit test for useExportData hook
- Unit test for file-utils (filename generation)
- Integration test: ExportDropdown triggers correct format
