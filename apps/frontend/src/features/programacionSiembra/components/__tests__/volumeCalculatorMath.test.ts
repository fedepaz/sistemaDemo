// __tests__/volumeCalculatorMath.test.ts
import {
  parseNumber,
  formatL,
  isLossy,
  isCalcDisabled,
  resolvePair,
} from "../volumeCalculatorMath";

describe("parseNumber", () => {
  it("parses dot decimals", () => {
    expect(parseNumber("0.740")).toBe(0.74);
  });

  it("parses comma decimals", () => {
    expect(parseNumber("0,740")).toBe(0.74);
  });

  it("parses plain integers", () => {
    expect(parseNumber("200")).toBe(200);
  });

  it("parses grouped thousands with comma", () => {
    expect(parseNumber("1.234,5")).toBe(1234.5);
  });

  it("returns null for empty string", () => {
    expect(parseNumber("")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("formatL", () => {
  it("formats whole numbers without decimals", () => {
    expect(formatL(148)).toBe("148");
  });

  it("rounds to 3 decimals and uses a comma", () => {
    expect(formatL(100 / 3)).toBe("33,333");
  });

  it("trims trailing zeros", () => {
    expect(formatL(0.63)).toBe("0,63");
  });

  it("formats zero", () => {
    expect(formatL(0)).toBe("0");
  });

  it("keeps meaningful decimals", () => {
    expect(formatL(0.74)).toBe("0,74");
  });
});

describe("isLossy", () => {
  it("flags values needing more than 3 decimals", () => {
    expect(isLossy(100 / 3)).toBe(true);
  });

  it("does not flag exact values", () => {
    expect(isLossy(148)).toBe(false);
    expect(isLossy(0.63)).toBe(false);
  });

  it("ignores floating point noise", () => {
    expect(isLossy(0.1 * 3)).toBe(false);
  });
});

describe("isCalcDisabled", () => {
  it("disables for null, undefined, zero and negatives", () => {
    expect(isCalcDisabled(null)).toBe(true);
    expect(isCalcDisabled(undefined)).toBe(true);
    expect(isCalcDisabled(0)).toBe(true);
    expect(isCalcDisabled(-5)).toBe(true);
  });

  it("enables for positive quantities", () => {
    expect(isCalcDisabled(0.5)).toBe(false);
    expect(isCalcDisabled(200)).toBe(false);
  });
});

describe("resolvePair", () => {
  const qty = 200;

  it("shows default unit 1 and derived total on mount", () => {
    expect(
      resolvePair({ unitRaw: "1", totalRaw: "", qty, source: "unit" }),
    ).toEqual({ unit: "1", total: "200", lossy: false });
  });

  it("derives total from a comma-typed unit", () => {
    expect(
      resolvePair({ unitRaw: "0,740", totalRaw: "", qty, source: "unit" }),
    ).toEqual({ unit: "0,740", total: "148", lossy: false });
  });

  it("derives unit from a typed total", () => {
    expect(
      resolvePair({ unitRaw: "", totalRaw: "126", qty, source: "total" }),
    ).toEqual({ unit: "0,63", total: "126", lossy: false });
  });

  it("flags lossy derivation when division exceeds 3 decimals", () => {
    const result = resolvePair({
      unitRaw: "",
      totalRaw: "100",
      qty: 3,
      source: "total",
    });
    expect(result.unit).toBe("33,333");
    expect(result.lossy).toBe(true);
  });

  it("shows a dash for an unparseable typed side", () => {
    expect(
      resolvePair({ unitRaw: "abc", totalRaw: "", qty, source: "unit" }),
    ).toEqual({ unit: "abc", total: "—", lossy: false });
  });

  it("returns defaults when qty is disabled", () => {
    expect(
      resolvePair({ unitRaw: "5", totalRaw: "", qty: null, source: "unit" }),
    ).toEqual({ unit: "1", total: "—", lossy: false });
  });
});
