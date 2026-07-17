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
      columns: [{ accessorKey: "name", exportHeader: "Name", pdfWidth: "*" }],
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
      columns: [{ accessorKey: "name", exportHeader: "Name", pdfWidth: "*" }],
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
      columns: [{ accessorKey: "name", exportHeader: "Name", pdfWidth: "*" }],
      title: "Test",
      format: "pdf",
    });

    // Dynamic import is async, so we wait
    await vi.dynamicImportSettled();
    expect(exportToPDF).toHaveBeenCalled();
  });
});