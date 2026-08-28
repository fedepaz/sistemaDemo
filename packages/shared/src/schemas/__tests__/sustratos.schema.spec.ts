// packages/shared/src/schemas/__tests__/sustratos.schema.spec.ts
import { SustratoSchema, CreateSustratoSchema, UpdateSustratoSchema } from "../sustratos.schema";

describe("SustratoSchema", () => {
  const valid = { id: "clx1234567890abcdef123456", nombre: "Turba", createdAt: new Date("2026-01-15") };

  it("accepts valid sustrato", () => {
    const result = SustratoSchema.parse(valid);
    expect(result.id).toBe("clx1234567890abcdef123456");
    expect(result.nombre).toBe("Turba");
  });

  it("rejects missing id", () => {
    const { id, ...withoutId } = valid;
    expect(() => SustratoSchema.parse(withoutId)).toThrow();
  });

  it("rejects invalid id with Spanish message", () => {
    const result = SustratoSchema.safeParse({ ...valid, id: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("sustrato"))).toBe(true);
    }
  });

  it("rejects missing nombre", () => {
    const { nombre, ...withoutNombre } = valid;
    expect(() => SustratoSchema.parse(withoutNombre)).toThrow();
  });
});

describe("CreateSustratoSchema", () => {
  it("accepts valid create data", () => {
    const result = CreateSustratoSchema.parse({ nombre: "Perlita" });
    expect(result.nombre).toBe("Perlita");
  });

  it("rejects missing nombre", () => {
    const result = CreateSustratoSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty nombre with Spanish message", () => {
    const result = CreateSustratoSchema.safeParse({ nombre: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("El nombre del sustrato es requerido");
    }
  });
});

describe("UpdateSustratoSchema", () => {
  it("accepts partial update", () => {
    const result = UpdateSustratoSchema.parse({ nombre: "Updated" });
    expect(result.nombre).toBe("Updated");
  });

  it("accepts empty update", () => {
    const result = UpdateSustratoSchema.parse({});
    expect(result).toEqual({});
  });

  it("rejects empty nombre with Spanish message", () => {
    const result = UpdateSustratoSchema.safeParse({ nombre: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("El nombre del sustrato es requerido");
    }
  });
});
