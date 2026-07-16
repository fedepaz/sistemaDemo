# Export Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement client-side data export (CSV, Excel, PDF) for all data tables with lazy-loaded PDF generation.

**Architecture:** Centralized export utilities in `lib/export/`, a `useExportData` hook for orchestration, and column mapping extensions in each feature's `columns.tsx`. PDF uses pdfmake with dynamic import.

**Tech Stack:** papaparse (CSV), xlsx (Excel), pdfmake (PDF, lazy-loaded), file-saver (downloads), vitest (tests)

## Global Constraints

- All exports are client-side (no server API calls)
- PDF bundle (~500KB) lazy-loaded only on PDF export click
- Auto-generated filenames: `{TableName}_{YYYY-MM-DD}.{ext}`
- No loading feedback — trigger download immediately
- Centralized branding config in `src/constants/export-config.ts`
- Follow existing codebase patterns (hooks in `src/hooks/`, utils in `src/lib/`)
- TDD: write tests before implementation

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/export/types.ts` | Shared export types (`ExportFormat`, `ExportColumn<T>`, `ExportOptions<T>`) |
| Create | `src/lib/export/file-utils.ts` | Filename generation, browser download trigger |
| Create | `src/lib/export/csv.ts` | CSV generator using papaparse |
| Create | `src/lib/export/excel.ts` | Excel generator using xlsx |
| Create | `src/lib/export/pdf.ts` | PDF generator using pdfmake (lazy-loaded) |
| Create | `src/lib/export/index.ts` | Barrel export |
| Create | `src/constants/export-config.ts` | Centralized branding config |
| Create | `src/hooks/useExportData.ts` | Hook orchestrating all export formats |
| Modify | `src/components/data-display/data-table/export-dropdown.tsx` | Wire to useExportData |
| Modify | `src/components/data-display/data-table/data-table.tsx` | Accept and pass exportColumns |
| Modify | `src/features/users/components/columns.tsx` | Add exportHeader/exportValue |
| Modify | `src/features/users/components/user-data-table.tsx` | Pass exportColumns to DataTable |
| Modify | `src/features/auditLogs/components/columns.tsx` | Add exportHeader |
| Modify | `src/features/auditLogs/components/auditLog-data-table.tsx` | Pass exportColumns |
| Modify | `src/features/extendidos/components/columns.tsx` | Add exportHeader |
| Modify | `src/features/extendidos/components/extendido-data-table.tsx` | Pass exportColumns |
| Modify | `src/features/siembra/components/columns.tsx` | Add exportHeader |
| Modify | `src/features/siembra/components/siembra-data-table.tsx` | Pass exportColumns |
| Create | `src/lib/export/__tests__/file-utils.test.ts` | Tests for filename generation |
| Create | `src/lib/export/__tests__/csv.test.ts` | Tests for CSV generation |
| Create | `src/lib/export/__tests__/excel.test.ts` | Tests for Excel generation |
| Create | `src/lib/export/__tests__/pdf.test.ts` | Tests for PDF generation |
| Create | `src/hooks/__tests__/useExportData.test.ts` | Tests for hook |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `apps/frontend/package.json`

- [ ] **Step 1: Install papaparse, xlsx, pdfmake, file-saver**

```bash
pnpm --filter frontend add papaparse xlsx pdfmake file-saver
pnpm --filter frontend add -D @types/papaparse @types/file-saver
```

- [ ] **Step 2: Verify installation**

```bash
pnpm --filter frontend ls papaparse xlsx pdfmake file-saver
```

Expected: all four packages listed

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/package.json apps/frontend/pnpm-lock.yaml
git commit -m "feat(export): add papaparse, xlsx, pdfmake, file-saver dependencies"
```

---

## Task 2: Export Types & Config

**Files:**
- Create: `apps/frontend/src/lib/export/types.ts`
- Create: `apps/frontend/src/constants/export-config.ts`
- Create: `apps/frontend/src/lib/export/__tests__/file-utils.test.ts` (created here, implemented in Task 3)

**Interfaces:**
- Produces: `ExportFormat`, `ExportColumn<T>`, `ExportOptions<T>`, `EXPORT_CONFIG`

- [ ] **Step 1: Create types.ts**

```typescript
// src/lib/export/types.ts

export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportColumn<T> {
  /** Key in the data object */
  accessorKey: keyof T;
  /** Human-readable header for exports */
  exportHeader: string;
  /** Optional: transform value before export */
  exportValue?: (value: T[keyof T], row: T) => string | number;
}

export interface ExportOptions<T> {
  data: T[];
  columns: ExportColumn<T>[];
  title: string;
  format: ExportFormat;
  filename?: string;
}
```

- [ ] **Step 2: Create export-config.ts**

```typescript
// src/constants/export-config.ts

export const EXPORT_CONFIG = {
  company: {
    name: "Proplanta S.A.",
    logoPath: "/images/logo-big-removebg-preview.png",
  },
  pdf: {
    primaryColor: "#16a34a",
    headerBg: "#f0fdf4",
    fontSize: 10,
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
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

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/export/types.ts apps/frontend/src/constants/export-config.ts
git commit -m "feat(export): add shared types and centralized branding config"
```

---

## Task 3: File Utilities (filename + download)

**Files:**
- Create: `apps/frontend/src/lib/export/file-utils.ts`
- Create: `apps/frontend/src/lib/export/__tests__/file-utils.test.ts`

**Interfaces:**
- Consumes: `ExportFormat` from `types.ts`
- Produces: `generateFilename(title, format)`, `triggerDownload(blob, filename)`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/export/__tests__/file-utils.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateFilename, triggerDownload } from "../file-utils";

describe("generateFilename", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00Z"));
  });

  it("generates CSV filename from title", () => {
    expect(generateFilename("Usuarios", "csv")).toBe("Usuarios_2026-07-16.csv");
  });

  it("generates Excel filename from title", () => {
    expect(generateFilename("Auditoría", "excel")).toBe("Auditoría_2026-07-16.xlsx");
  });

  it("generates PDF filename from title", () => {
    expect(generateFilename("Partidas", "pdf")).toBe("Partidas_2026-07-16.pdf");
  });

  it("handles titles with spaces", () => {
    expect(generateFilename("Audit Logs", "csv")).toBe("Audit Logs_2026-07-16.csv");
  });
});

describe("triggerDownload", () => {
  it("creates and clicks a download link", () => {
    const clickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    const blob = new Blob(["test"], { type: "text/csv" });
    triggerDownload(blob, "test.csv");

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(clickSpy).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/file-utils.test.ts
```

Expected: FAIL — cannot find module `../file-utils`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/export/file-utils.ts
import type { ExportFormat } from "./types";

const EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  excel: "xlsx",
  pdf: "pdf",
};

export function generateFilename(title: string, format: ExportFormat): string {
  const date = new Date().toISOString().split("T")[0];
  return `${title}_${date}.${EXTENSIONS[format]}`;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/file-utils.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/export/file-utils.ts apps/frontend/src/lib/export/__tests__/file-utils.test.ts
git commit -m "feat(export): add filename generation and download trigger utilities"
```

---

## Task 4: CSV Generator

**Files:**
- Create: `apps/frontend/src/lib/export/csv.ts`
- Create: `apps/frontend/src/lib/export/__tests__/csv.test.ts`

**Interfaces:**
- Consumes: `ExportColumn<T>`, data array
- Produces: `exportToCSV(options)` — triggers CSV download

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/export/__tests__/csv.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToCSV } from "../csv";

describe("exportToCSV", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00Z"));
  });

  it("generates CSV with headers and data", () => {
    const downloadSpy = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        href: "",
        download: "",
        click: downloadSpy,
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    });

    const data = [
      { name: "Juan", email: "juan@test.com" },
      { name: "María", email: "maria@test.com" },
    ];

    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre" },
      { accessorKey: "email" as const, exportHeader: "Correo" },
    ];

    exportToCSV({ data, columns, title: "Usuarios", format: "csv" });

    // Verify download was triggered
    expect(downloadSpy).toHaveBeenCalled();
  });

  it("uses exportValue when provided", () => {
    const data = [{ firstName: "Juan", lastName: "Pérez" }];
    const columns = [
      {
        accessorKey: "firstName" as const,
        exportHeader: "Nombre completo",
        exportValue: (_: unknown, row: { firstName: string; lastName: string }) =>
          `${row.firstName} ${row.lastName}`,
      },
    ];

    // This should not throw
    expect(() =>
      exportToCSV({ data, columns, title: "Test", format: "csv" })
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/csv.test.ts
```

Expected: FAIL — cannot find module `../csv`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/export/csv.ts
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
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, finalFilename);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/csv.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/export/csv.ts apps/frontend/src/lib/export/__tests__/csv.test.ts
git commit -m "feat(export): add CSV generator with papaparse-style output"
```

---

## Task 5: Excel Generator

**Files:**
- Create: `apps/frontend/src/lib/export/excel.ts`
- Create: `apps/frontend/src/lib/export/__tests__/excel.test.ts`

**Interfaces:**
- Consumes: `ExportColumn<T>`, data array
- Produces: `exportToExcel(options)` — triggers .xlsx download

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/export/__tests__/excel.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToExcel } from "../excel";

describe("exportToExcel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00Z"));
  });

  it("generates Excel file with headers and data", () => {
    const downloadSpy = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        href: "",
        download: "",
        click: downloadSpy,
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    });

    const data = [
      { name: "Juan", email: "juan@test.com" },
      { name: "María", email: "maria@test.com" },
    ];

    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre" },
      { accessorKey: "email" as const, exportHeader: "Correo" },
    ];

    exportToExcel({ data, columns, title: "Usuarios", format: "excel" });

    expect(downloadSpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/excel.test.ts
```

Expected: FAIL — cannot find module `../excel`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/export/excel.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/excel.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/export/excel.ts apps/frontend/src/lib/export/__tests__/excel.test.ts
git commit -m "feat(export): add Excel generator with xlsx"
```

---

## Task 6: PDF Generator (lazy-loaded)

**Files:**
- Create: `apps/frontend/src/lib/export/pdf.ts`
- Create: `apps/frontend/src/lib/export/__tests__/pdf.test.ts`

**Interfaces:**
- Consumes: `ExportColumn<T>`, data array, EXPORT_CONFIG
- Produces: `exportToPDF(options)` — triggers PDF download

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/export/__tests__/pdf.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock pdfmake
vi.mock("pdfmake/build/pdfmake", () => ({
  default: {
    createPdf: vi.fn(() => ({
      download: vi.fn(),
    })),
  },
}));

vi.mock("pdfmake/build/vfs_fonts", () => ({}));

describe("exportToPDF", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00Z"));
  });

  it("creates PDF with logo, title, and table", async () => {
    const { exportToPDF } = await import("../pdf");

    const data = [
      { name: "Juan", email: "juan@test.com" },
      { name: "María", email: "maria@test.com" },
    ];

    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre" },
      { accessorKey: "email" as const, exportHeader: "Correo" },
    ];

    // Should not throw
    expect(() =>
      exportToPDF({ data, columns, title: "Usuarios", format: "pdf" })
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/pdf.test.ts
```

Expected: FAIL — cannot find module `../pdf`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/export/pdf.ts
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { ExportOptions } from "./types";
import { generateFilename } from "./file-utils";
import { EXPORT_CONFIG } from "@/constants/export-config";

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function exportToPDF<T extends Record<string, unknown>>(
  options: ExportOptions<T>
): void {
  const { data, columns, title, filename } = options;
  const finalFilename = filename ?? generateFilename(title, "pdf");

  const { primaryColor, headerBg, fontSize, margins, pageSize } = EXPORT_CONFIG.pdf;

  // Build table header
  const tableHeader = columns.map((col) => ({
    text: col.exportHeader,
    style: "tableHeader",
    bold: true,
    color: "#ffffff",
  }));

  // Build table body
  const tableBody = data.map((row, rowIndex) =>
    columns.map((col) => {
      let value: string | number;
      if (col.exportValue) {
        value = col.exportValue(row[col.accessorKey], row);
      } else {
        value = row[col.accessorKey] as string | number;
      }
      return {
        text: String(value ?? ""),
        style: rowIndex % 2 === 0 ? "tableRowEven" : "tableRowOdd",
      };
    })
  );

  const docDefinition = {
    pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    header: {
      columns: [
        {
          image: EXPORT_CONFIG.company.logoPath,
          width: 100,
          fit: [100, 50],
        },
        {
          text: EXPORT_CONFIG.company.name,
          alignment: "right",
          margin: [0, 10, 0, 0],
          fontSize: fontSize + 2,
          bold: true,
          color: primaryColor,
        },
      ],
      margin: [0, 0, 0, 20],
    },
    content: [
      {
        text: title,
        style: "title",
      },
      {
        text: `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
        style: "date",
      },
      {
        table: {
          headerRows: 1,
          widths: columns.map(() => "*"),
          body: [tableHeader, ...tableBody],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
          vLineWidth: () => 0.5,
          hLineColor: () => "#e5e7eb",
          vLineColor: () => "#e5e7eb",
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? primaryColor : rowIndex % 2 === 0 ? headerBg : "#ffffff",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
      },
    ],
    styles: {
      title: {
        fontSize: fontSize + 6,
        bold: true,
        margin: [0, 0, 0, 10],
        color: primaryColor,
      },
      date: {
        fontSize: fontSize,
        margin: [0, 0, 0, 20],
        color: "#6b7280",
      },
      tableHeader: {
        fontSize: fontSize,
        bold: true,
        color: "#ffffff",
      },
      tableRowEven: {
        fontSize: fontSize,
      },
      tableRowOdd: {
        fontSize: fontSize,
        fillColor: "#f9fafb",
      },
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: "center",
      margin: [0, 10, 0, 0],
      fontSize: fontSize - 2,
      color: "#9ca3af",
    }),
  };

  pdfMake.createPdf(docDefinition).download(finalFilename);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter frontend vitest run src/lib/export/__tests__/pdf.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/export/pdf.ts apps/frontend/src/lib/export/__tests__/pdf.test.ts
git commit -m "feat(export): add PDF generator with pdfmake (lazy-loaded)"
```

---

## Task 7: Barrel Export & Hook

**Files:**
- Create: `apps/frontend/src/lib/export/index.ts`
- Create: `apps/frontend/src/hooks/useExportData.ts`
- Create: `apps/frontend/src/hooks/__tests__/useExportData.test.ts`

**Interfaces:**
- Consumes: `exportToCSV`, `exportToExcel`, `exportToPDF`, `ExportOptions`
- Produces: `useExportData()` hook returning `{ exportData }`

- [ ] **Step 1: Create barrel export**

```typescript
// src/lib/export/index.ts
export { exportToCSV } from "./csv";
export { exportToExcel } from "./excel";
export { exportToPDF } from "./pdf";
export { generateFilename, triggerDownload } from "./file-utils";
export type { ExportFormat, ExportColumn, ExportOptions } from "./types";
```

- [ ] **Step 2: Write the failing test for useExportData**

```typescript
// src/hooks/__tests__/useExportData.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useExportData } from "../useExportData";

vi.mock("@/lib/export/csv", () => ({
  exportToCSV: vi.fn(),
}));

vi.mock("@/lib/export/excel", () => ({
  exportToExcel: vi.fn(),
}));

vi.mock("@/lib/export/pdf", () => ({
  exportToPDF: vi.fn(),
}));

describe("useExportData", () => {
  it("returns exportData function", () => {
    const { result } = renderHook(() => useExportData());
    expect(typeof result.current.exportData).toBe("function");
  });

  it("calls exportToCSV when format is csv", async () => {
    const { exportToCSV } = await import("@/lib/export/csv");
    const { result } = renderHook(() => useExportData());

    result.current.exportData({
      data: [{ name: "test" }],
      columns: [{ accessorKey: "name", exportHeader: "Name" }],
      title: "Test",
      format: "csv",
    });

    expect(exportToCSV).toHaveBeenCalled();
  });

  it("calls exportToExcel when format is excel", async () => {
    const { exportToExcel } = await import("@/lib/export/excel");
    const { result } = renderHook(() => useExportData());

    result.current.exportData({
      data: [{ name: "test" }],
      columns: [{ accessorKey: "name", exportHeader: "Name" }],
      title: "Test",
      format: "excel",
    });

    expect(exportToExcel).toHaveBeenCalled();
  });

  it("dynamically imports pdf for pdf format", async () => {
    const { exportToPDF } = await import("@/lib/export/pdf");
    const { result } = renderHook(() => useExportData());

    result.current.exportData({
      data: [{ name: "test" }],
      columns: [{ accessorKey: "name", exportHeader: "Name" }],
      title: "Test",
      format: "pdf",
    });

    // Dynamic import is async, so we wait
    await vi.dynamicImportSettled();
    expect(exportToPDF).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm --filter frontend vitest run src/hooks/__tests__/useExportData.test.ts
```

Expected: FAIL — cannot find module `../useExportData`

- [ ] **Step 4: Write minimal implementation**

```typescript
// src/hooks/useExportData.ts
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
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm --filter frontend vitest run src/hooks/__tests__/useExportData.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/lib/export/index.ts apps/frontend/src/hooks/useExportData.ts apps/frontend/src/hooks/__tests__/useExportData.test.ts
git commit -m "feat(export): add useExportData hook with lazy-loaded PDF"
```

---

## Task 8: Update DataTable & ExportDropdown

**Files:**
- Modify: `apps/frontend/src/components/data-display/data-table/data-table.tsx`
- Modify: `apps/frontend/src/components/data-display/data-table/export-dropdown.tsx`

**Interfaces:**
- Consumes: `useExportData`, `ExportColumn<T>`
- Produces: DataTable accepts `exportColumns` prop, wires to hook

- [ ] **Step 1: Add exportColumns prop to DataTable**

In `data-table.tsx`, add to the `DataTableProps` interface:

```typescript
// Add after line 91 (toolbarContent prop)
exportColumns?: ExportColumn<TData>[];
```

Add import at top:

```typescript
import type { ExportColumn } from "@/lib/export/types";
import { useExportData } from "@/hooks/useExportData";
```

- [ ] **Step 2: Wire useExportData in DataTable**

In the DataTable component body, after the existing hooks (around line 128):

```typescript
const { exportData } = useExportData<TData>();
```

- [ ] **Step 3: Update handleExport to use the hook**

Replace the existing `handleExport` function (lines 390-398):

```typescript
const handleExport = async (
  format: "csv" | "excel" | "json" | "pdf",
  selectedRows: TData[],
) => {
  if (!exportColumns || exportColumns.length === 0) return;

  const rowsToExport = selectedRows.length > 0 ? selectedRows : data;
  await exportData({
    data: rowsToExport,
    columns: exportColumns,
    title,
    format: format as "csv" | "excel" | "pdf",
  });
};
```

- [ ] **Step 4: Pass exportColumns to ExportDropdown**

In the JSX, update the ExportDropdown usage (around line 460-465):

```typescript
{dataTablePermissions.canRead && (
  <ExportDropdown
    onExport={handleExport}
    selectedCount={selectedCount}
    totalCount={data.length}
    disabled={data.length === 0}
    hasExportColumns={!!exportColumns && exportColumns.length > 0}
  />
)}
```

- [ ] **Step 5: Update ExportDropdown to accept hasExportColumns**

In `export-dropdown.tsx`, add to props:

```typescript
hasExportColumns?: boolean;
```

Update the disabled logic:

```typescript
disabled={disabled || !hasExportColumns}
```

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components/data-display/data-table/data-table.tsx apps/frontend/src/components/data-display/data-table/export-dropdown.tsx
git commit -m "feat(export): wire DataTable and ExportDropdown to useExportData hook"
```

---

## Task 9: Add Column Mappings to Users

**Files:**
- Modify: `apps/frontend/src/features/users/components/columns.tsx`
- Modify: `apps/frontend/src/features/users/components/user-data-table.tsx`

**Interfaces:**
- Consumes: `ExportColumn` type
- Produces: `userExportColumns` array

- [ ] **Step 1: Add exportColumns to userColumns**

In `columns.tsx`, add import:

```typescript
import type { ExportColumn } from "@/lib/export/types";
```

Add exportColumns array after the `userColumns` definition:

```typescript
export const userExportColumns: ExportColumn<UserProfileDto>[] = [
  {
    accessorKey: "firstName",
    exportHeader: "Nombre",
    exportValue: (_, row) => row.firstName || "",
  },
  {
    accessorKey: "lastName",
    exportHeader: "Apellido",
    exportValue: (_, row) => row.lastName || "",
  },
  {
    accessorKey: "email",
    exportHeader: "Correo electrónico",
  },
  {
    accessorKey: "isActive",
    exportHeader: "Estado",
    exportValue: (value) => (value ? "Activo" : "Inactivo"),
  },
  {
    accessorKey: "username",
    exportHeader: "Usuario",
  },
  {
    accessorKey: "createdAt",
    exportHeader: "Creado",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
  },
];
```

- [ ] **Step 2: Pass exportColumns to DataTable**

In `user-data-table.tsx`, add import:

```typescript
import { userExportColumns } from "./columns";
```

Add prop to DataTable (around line 120):

```typescript
exportColumns={userExportColumns}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/users/components/columns.tsx apps/frontend/src/features/users/components/user-data-table.tsx
git commit -m "feat(export): add export column mappings for Users table"
```

---

## Task 10: Add Column Mappings to Audit Logs

**Files:**
- Modify: `apps/frontend/src/features/auditLogs/components/columns.tsx`
- Modify: `apps/frontend/src/features/auditLogs/components/auditLog-data-table.tsx`

**Interfaces:**
- Consumes: `ExportColumn` type
- Produces: `auditLogExportColumns` array

- [ ] **Step 1: Add exportColumns to auditLogColumns**

In `columns.tsx`, add import:

```typescript
import type { ExportColumn } from "@/lib/export/types";
```

Add exportColumns array after the `auditLogColumns` definition:

```typescript
export const auditLogExportColumns: ExportColumn<AuditLogDto>[] = [
  {
    accessorKey: "action",
    exportHeader: "Acción",
  },
  {
    accessorKey: "user",
    exportHeader: "Usuario",
    exportValue: (_, row) => row.user?.username || "N/A",
  },
  {
    accessorKey: "changes",
    exportHeader: "Cambios",
    exportValue: (_, row) => formatChanges(row.changes),
  },
  {
    accessorKey: "timestamp",
    exportHeader: "Fecha",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
  },
  {
    accessorKey: "ipAddress",
    exportHeader: "IP",
    exportValue: (value) => (value as string) || "N/A",
  },
  {
    accessorKey: "userAgent",
    exportHeader: "Dispositivo",
    exportValue: (value) => {
      const ua = (value as string) || "";
      return /mobile|android|iphone|ipad/i.test(ua.toLowerCase()) ? "Móvil" : "Escritorio";
    },
  },
];
```

- [ ] **Step 2: Pass exportColumns to DataTable**

In `auditLog-data-table.tsx`, add import:

```typescript
import { auditLogExportColumns } from "./columns";
```

Add prop to DataTable (around line 39):

```typescript
exportColumns={auditLogExportColumns}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/auditLogs/components/columns.tsx apps/frontend/src/features/auditLogs/components/auditLog-data-table.tsx
git commit -m "feat(export): add export column mappings for Audit Logs table"
```

---

## Task 11: Add Column Mappings to Extendidos

**Files:**
- Modify: `apps/frontend/src/features/extendidos/components/columns.tsx`
- Modify: `apps/frontend/src/features/extendidos/components/extendido-data-table.tsx`

**Interfaces:**
- Consumes: `ExportColumn` type
- Produces: `partidaExportColumns` array

- [ ] **Step 1: Add exportColumns to partidaColumns**

In `columns.tsx`, add import:

```typescript
import type { ExportColumn } from "@/lib/export/types";
```

Add exportColumns array after the `partidaColumns` definition:

```typescript
export const partidaExportColumns: ExportColumn<ExtendidoDto>[] = [
  {
    accessorKey: "partidaId",
    exportHeader: "Partida",
    exportValue: (_, row) => `${row.partidaId}${row.indice !== 0 ? `/${row.indice}` : ""}`,
  },
  {
    accessorKey: "nombreEspecie",
    exportHeader: "Especie",
  },
  {
    accessorKey: "codigoEspecie",
    exportHeader: "Código",
  },
  {
    accessorKey: "injerto",
    exportHeader: "Injerto",
    exportValue: (value) => (value === "N" ? "" : (value as string)),
  },
  {
    accessorKey: "contenedor",
    exportHeader: "Contenedor",
  },
  {
    accessorKey: "con",
    exportHeader: "Cantidad",
  },
  {
    accessorKey: "codigoCamaraGerminacion",
    exportHeader: "Cámara",
  },
  {
    accessorKey: "fechaSugeridaSiembra",
    exportHeader: "Siembra Sugerida",
    exportValue: (value) => formatShortDate(value as string),
  },
  {
    accessorKey: "fechaSiembraReal",
    exportHeader: "Siembra Real",
    exportValue: (value) => formatShortDate(value as string),
  },
  {
    accessorKey: "fechaEgresoCamara",
    exportHeader: "Fecha a Extender",
    exportValue: (value) => formatShortDate(value as string),
  },
  {
    accessorKey: "diasEnCamara",
    exportHeader: "Días en Cámara",
  },
];
```

- [ ] **Step 2: Pass exportColumns to DataTable**

In `extendido-data-table.tsx`, add import:

```typescript
import { partidaExportColumns } from "./columns";
```

Add prop to DataTable (around line 200):

```typescript
exportColumns={partidaExportColumns}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/extendidos/components/columns.tsx apps/frontend/src/features/extendidos/components/extendido-data-table.tsx
git commit -m "feat(export): add export column mappings for Extendidos table"
```

---

## Task 12: Add Column Mappings to Siembra

**Files:**
- Modify: `apps/frontend/src/features/siembra/components/columns.tsx`
- Modify: `apps/frontend/src/features/siembra/components/siembra-data-table.tsx`

**Interfaces:**
- Consumes: `ExportColumn` type
- Produces: `partidaSiembraExportColumns` array

- [ ] **Step 1: Add exportColumns to partidaSiembraColumns**

In `columns.tsx`, add import:

```typescript
import type { ExportColumn } from "@/lib/export/types";
```

Add exportColumns array after the `partidaSiembraColumns` definition:

```typescript
export const partidaSiembraExportColumns: ExportColumn<SiembraDto>[] = [
  {
    accessorKey: "partidaId",
    exportHeader: "Partida",
    exportValue: (_, row) => `${row.partidaId}${row.indice !== 0 ? `/${row.indice}` : ""}`,
  },
  {
    accessorKey: "nombreEspecie",
    exportHeader: "Especie",
  },
  {
    accessorKey: "codigoEspecie",
    exportHeader: "Código",
  },
  {
    accessorKey: "injerto",
    exportHeader: "Injerto",
    exportValue: (value) => (value === "N" ? "" : (value as string)),
  },
  {
    accessorKey: "contenedor",
    exportHeader: "Contenedor",
  },
  {
    accessorKey: "con",
    exportHeader: "Cantidad",
  },
  {
    accessorKey: "fechaSugeridaSiembra",
    exportHeader: "Siembra Sugerida",
    exportValue: (value) => formatShortDate(value as string),
  },
  {
    accessorKey: "fechaSiembraReal",
    exportHeader: "Siembra Real",
    exportValue: (value) => formatShortDate(value as string),
  },
];
```

- [ ] **Step 2: Pass exportColumns to DataTable**

In `siembra-data-table.tsx`, add import:

```typescript
import { partidaSiembraExportColumns } from "./columns";
```

Add prop to DataTable (around line 97):

```typescript
exportColumns={partidaSiembraExportColumns}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/siembra/components/columns.tsx apps/frontend/src/features/siembra/components/siembra-data-table.tsx
git commit -m "feat(export): add export column mappings for Siembra table"
```

---

## Task 13: Run All Tests & Lint

**Files:** None (verification only)

- [ ] **Step 1: Run all export tests**

```bash
pnpm --filter frontend vitest run src/lib/export/ src/hooks/__tests__/useExportData.test.ts
```

Expected: All tests PASS

- [ ] **Step 2: Run full test suite**

```bash
pnpm --filter frontend test
```

Expected: No regressions

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: No errors

- [ ] **Step 4: Run type check**

```bash
pnpm type-check
```

Expected: No type errors

- [ ] **Step 5: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix(export): address lint and type check issues"
```

---

## Task 14: Manual Verification

**Files:** None (manual testing)

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test CSV export**
  - Navigate to Users table
  - Click Export → CSV
  - Verify file downloads with correct data

- [ ] **Step 3: Test Excel export**
  - Navigate to Users table
  - Click Export → Excel
  - Verify .xlsx file downloads with correct data

- [ ] **Step 4: Test PDF export**
  - Navigate to Users table
  - Click Export → PDF
  - Verify PDF downloads with logo, title, styled table, footer

- [ ] **Step 5: Test with selected rows**
  - Select 2-3 rows in any table
  - Click Export → CSV
  - Verify only selected rows are exported

- [ ] **Step 6: Test all tables**
  - Repeat export tests for Audit Logs, Extendidos, Siembra
