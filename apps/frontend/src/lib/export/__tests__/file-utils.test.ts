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
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockReturnValue({} as unknown as Node);
    const removeChildSpy = vi.spyOn(document.body, "removeChild").mockReturnValue({} as unknown as Node);
    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    const blob = new Blob(["test"], { type: "text/csv" });
    triggerDownload(blob, "test.csv");

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
