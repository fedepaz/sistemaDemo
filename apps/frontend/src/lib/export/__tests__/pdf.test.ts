jest.mock("pdfmake/build/pdfmake", () => ({
  __esModule: true,
  default: {
    createPdf: jest.fn(() => ({
      download: jest.fn(),
    })),
    addVirtualFileSystem: jest.fn(),
    addFonts: jest.fn(),
  },
}));

jest.mock("pdfmake/build/vfs_fonts", () => ({
  __esModule: true,
  default: { pdfMake: { vfs: {} } },
  pdfMake: { vfs: {} },
}));

jest.mock("../fonts/poppins-vfs", () => ({
  poppinsVfs: {},
}));

const mockFetch = jest.fn();
Object.defineProperty(globalThis, "fetch", {
  value: mockFetch,
  writable: true,
  configurable: true,
});

class MockFileReader {
  result: string | null = null;
  onloadend: (() => void) | null = null;
  readAsDataURL(_blob: Blob) {
    this.result = "data:image/png;base64,mockBase64Data";
    this.onloadend?.();
  }
}
Object.defineProperty(globalThis, "FileReader", {
  value: MockFileReader,
  writable: true,
  configurable: true,
});

describe("exportToPDF", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-16T12:00:00Z"));
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it("creates PDF with company config data", async () => {
    const { exportToPDF } = await import("../pdf");

    const data = [{ name: "Juan", email: "juan@test.com" }];
    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre", pdfWidth: "*" },
      { accessorKey: "email" as const, exportHeader: "Correo", pdfWidth: "*" },
    ];

    const companyConfig = {
      name: "PROPLANTA S.A.",
      address: "QUINTANA 4690",
      city: "EL ALGARROBAL LAS HERAS",
      province: "MENDOZA",
      phone: "(0261) 490-7017",
      email: "proplanta@com.ar",
      taxId: "30-69470646-7",
      country: "ARGENTINA",
    };

    await expect(
      exportToPDF({
        data,
        columns,
        title: "Usuarios",
        format: "pdf",
        companyConfig,
      })
    ).resolves.toBeUndefined();
  });

  it("creates PDF with fallback when companyConfig is undefined", async () => {
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
