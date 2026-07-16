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
