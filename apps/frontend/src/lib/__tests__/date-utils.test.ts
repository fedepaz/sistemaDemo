import { utcToLocalTime } from "../date-utils";

describe("utcToLocalTime", () => {
  it("converts UTC string to local time", () => {
    const result = utcToLocalTime("2026-09-01T17:00:00.000Z");
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("returns empty string for null", () => {
    expect(utcToLocalTime(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(utcToLocalTime(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(utcToLocalTime("")).toBe("");
  });

  it("returns empty string for invalid date", () => {
    expect(utcToLocalTime("not-a-date")).toBe("");
  });

  it("handles UTC midnight", () => {
    const result = utcToLocalTime("2026-09-01T00:00:00.000Z");
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("handles UTC end of day", () => {
    const result = utcToLocalTime("2026-09-01T23:59:59.999Z");
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("handles ISO string with offset", () => {
    const result = utcToLocalTime("2026-09-01T14:00:00.000-03:00");
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});
