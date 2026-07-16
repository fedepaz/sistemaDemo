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
│   └── export-config.ts          # Centralized export/branding config
├── lib/
│   └── export/
│       ├── index.ts              # Barrel export
│       ├── csv.ts                # CSV generator (papaparse)
│       ├── excel.ts              # Excel generator (xlsx)
│       ├── pdf.ts                # PDF generator (pdfmake, lazy-loaded)
│       ├── types.ts              # Shared export types
│       └── file-utils.ts         # Filename generation, download trigger
├── hooks/
│   └── useExportData.ts          # Hook that orchestrates exports
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

export interface ExportOptions<T> {
  data: T[];
  columns: ExportColumn<T>[];
  title: string;
  format: ExportFormat;
  filename?: string;
}
```

### `src/constants/export-config.ts`

```ts
export const EXPORT_CONFIG = {
  company: {
    name: "Proplanta S.A.",
    tagline: "El mejor comienzo para sus cultivos",
    logoUrl: "/images/logo-big-removebg-preview.png",
  },
  pdf: {
    primaryColor: "#16a34a",
    headerBg: "#f0fdf4",
    fontSize: 10,
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
  ↓
lib/export/csv.ts | excel.ts | pdf.ts
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
export function useExportData<T extends Record<string, any>>() {
  const exportData = useCallback(async (options: ExportOptions<T>) => {
    const { data, columns, title, format, filename } = options;
    const finalFilename = filename ?? generateFilename(title, format);

    switch (format) {
      case "csv":
        exportToCSV({ data, columns, filename: finalFilename });
        break;
      case "excel":
        exportToExcel({ data, columns, filename: finalFilename });
        break;
      case "pdf":
        const { exportToPDF } = await import("@/lib/export/pdf");
        exportToPDF({ data, columns, title, filename: finalFilename });
        break;
    }
  }, []);

  return { exportData };
}
```

## PDF Styling

- Letterhead header: logo (left) + company name + tagline (right), separated by a canvas rule in primaryColor
- Logo fetched as base64 data URL at runtime, passed via `docDefinition.images`
- Table title + export date below the header rule
- Styled table with column widths driven by `pdfWidth` on each `ExportColumn`
- Alternating row colors via `layout.fillColor` (single source of truth)
- Primary color (#16a34a) for headers and rule
- Footer with page numbers
- A4 page size

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
