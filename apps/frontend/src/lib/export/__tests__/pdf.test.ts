import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for logo
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock FileReader — synchronous invocation for fake timers
class MockFileReader {
  result: string | null = null;
  onloadend: (() => void) | null = null;
  readAsDataURL(_blob: Blob) {
    this.result = "data:image/png;base64,mockBase64Data";
    this.onloadend?.();
  }
}
vi.stubGlobal("FileReader", MockFileReader);

// Mock pdfmake
vi.mock("pdfmake/build/pdfmake", () => ({
  default: {
    createPdf: vi.fn(() => ({
      download: vi.fn(),
    })),
    addVirtualFileSystem: vi.fn(),
  },
}));

vi.mock("pdfmake/build/vfs_fonts", () => ({
  default: { pdfMake: { vfs: {} } },
  pdfMake: { vfs: {} },
}));

describe("exportToPDF", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00Z"));

    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
  });

  it("creates PDF with logo, title, and table", async () => {
    const { exportToPDF } = await import("../pdf");

    const data = [
      { name: "Juan", email: "juan@test.com" },
      { name: "María", email: "maria@test.com" },
    ];

    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre", pdfWidth: "*" },
      { accessorKey: "email" as const, exportHeader: "Correo", pdfWidth: "*" },
    ];

    await expect(
      exportToPDF({ data, columns, title: "Usuarios", format: "pdf" })
    ).resolves.toBeUndefined();
  });

  it("creates PDF even when logo fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const { exportToPDF } = await import("../pdf");

    const data = [{ name: "Juan", email: "juan@test.com" }];
    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre", pdfWidth: "*" },
      { accessorKey: "email" as const, exportHeader: "Correo", pdfWidth: "*" },
    ];

    await expect(
      exportToPDF({ data, columns, title: "Test", format: "pdf" })
    ).resolves.toBeUndefined();
  });

  it("creates PDF even when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { exportToPDF } = await import("../pdf");

    const data = [{ name: "Juan", email: "juan@test.com" }];
    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre", pdfWidth: "*" },
      { accessorKey: "email" as const, exportHeader: "Correo", pdfWidth: "*" },
    ];

    await expect(
      exportToPDF({ data, columns, title: "Test", format: "pdf" })
    ).resolves.toBeUndefined();
  });
});
