import { toISODateString, utcToLocalTime } from "../date-utils";

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

describe("toISODateString", () => {
  it("returns undefined for null, undefined, empty string and 0000-00-00", () => {
    expect(toISODateString(null)).toBeUndefined();
    expect(toISODateString(undefined)).toBeUndefined();
    expect(toISODateString("")).toBeUndefined();
    expect(toISODateString("0000-00-00")).toBeUndefined();
  });

  it("passes YYYY-MM-DD strings through unchanged", () => {
    expect(toISODateString("2026-10-16")).toBe("2026-10-16");
  });

  it("normalizes Date objects using local date parts", () => {
    const d = new Date(2026, 9, 16); // local midnight, Oct 16 2026
    expect(toISODateString(d)).toBe("2026-10-16");
  });

  it("normalizes full ISO datetime strings using local date parts", () => {
    expect(toISODateString("2026-10-16T10:00:00.000Z")).toBe("2026-10-16");
  });

  it("returns undefined for unparseable strings", () => {
    expect(toISODateString("not-a-date")).toBeUndefined();
  });
});
