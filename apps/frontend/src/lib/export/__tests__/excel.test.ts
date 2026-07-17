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
      { accessorKey: "name" as const, exportHeader: "Nombre", pdfWidth: "*" },
      { accessorKey: "email" as const, exportHeader: "Correo", pdfWidth: "*" },
    ];

    exportToExcel({ data, columns, title: "Usuarios", format: "excel" });

    expect(downloadSpy).toHaveBeenCalled();
  });
});
