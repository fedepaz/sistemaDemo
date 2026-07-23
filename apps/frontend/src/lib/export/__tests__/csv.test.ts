import { exportToCSV } from "../csv";

describe("exportToCSV", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-16T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("generates CSV with headers and data", () => {
    const clickSpy = jest.fn();
    const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);
    const appendChildSpy = jest.spyOn(document.body, "appendChild").mockReturnValue({} as unknown as Node);
    const removeChildSpy = jest.spyOn(document.body, "removeChild").mockReturnValue({} as unknown as Node);

    const data = [
      { name: "Juan", email: "juan@test.com" },
      { name: "María", email: "maria@test.com" },
    ];

    const columns = [
      { accessorKey: "name" as const, exportHeader: "Nombre", pdfWidth: "*" },
      { accessorKey: "email" as const, exportHeader: "Correo", pdfWidth: "*" },
    ];

    exportToCSV({ data, columns, title: "Usuarios", format: "csv" });

    expect(clickSpy).toHaveBeenCalled();
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("uses exportValue when provided", () => {
    const data = [{ firstName: "Juan", lastName: "Pérez" }];
    const columns = [
      {
        accessorKey: "firstName" as const,
        exportHeader: "Nombre completo",
        exportValue: (_: unknown, row: { firstName: string; lastName: string }) =>
          `${row.firstName} ${row.lastName}`,
        pdfWidth: "*",
      },
    ];

    expect(() =>
      exportToCSV({ data, columns, title: "Test", format: "csv" })
    ).not.toThrow();
  });
});
