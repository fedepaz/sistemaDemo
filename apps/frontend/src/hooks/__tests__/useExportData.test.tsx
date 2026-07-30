import { renderHook } from "@testing-library/react";
import { useExportData } from "../useExportData";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockExportToCSV = jest.fn();
const mockExportToExcel = jest.fn();
const mockExportToPDF = jest.fn();

jest.mock("@/lib/export/csv", () => ({
  exportToCSV: (...args: unknown[]) => mockExportToCSV(...args),
}));

jest.mock("@/lib/export/excel", () => ({
  exportToExcel: (...args: unknown[]) => mockExportToExcel(...args),
}));

jest.mock("@/lib/export/pdf", () => ({
  exportToPDF: (...args: unknown[]) => mockExportToPDF(...args),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
};

describe("useExportData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns exportData function", () => {
    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });
    expect(typeof result.current.exportData).toBe("function");
  });

  it("calls exportToCSV when format is csv", async () => {
    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    result.current.exportData({
      data: [{ name: "test" }],
      columns: [{ accessorKey: "name", exportHeader: "Name", pdfWidth: "*" }],
      title: "Test",
      format: "csv",
    });

    expect(mockExportToCSV).toHaveBeenCalled();
  });

  it("calls exportToExcel when format is excel", async () => {
    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    result.current.exportData({
      data: [{ name: "test" }],
      columns: [{ accessorKey: "name", exportHeader: "Name", pdfWidth: "*" }],
      title: "Test",
      format: "excel",
    });

    expect(mockExportToExcel).toHaveBeenCalled();
  });

  it("calls exportToPDF when format is pdf", async () => {
    mockExportToPDF.mockResolvedValue(undefined);

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    result.current.exportData({
      data: [{ name: "test" }],
      columns: [{ accessorKey: "name", exportHeader: "Name", pdfWidth: "*" }],
      title: "Test",
      format: "pdf",
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(mockExportToPDF).toHaveBeenCalled();
  });
});
