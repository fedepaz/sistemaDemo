import { cn } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", true && "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
    expect(result).not.toContain("hidden");
  });

  it("handles object syntax", () => {
    const result = cn({ "text-red-500": true, "text-blue-500": false });
    expect(result).toBe("text-red-500");
  });

  it("handles array syntax", () => {
    const result = cn(["p-2", "m-1"], "text-sm");
    expect(result).toContain("p-2");
    expect(result).toContain("m-1");
    expect(result).toContain("text-sm");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles undefined and null", () => {
    const result = cn(undefined, null, "base");
    expect(result).toBe("base");
  });
});
