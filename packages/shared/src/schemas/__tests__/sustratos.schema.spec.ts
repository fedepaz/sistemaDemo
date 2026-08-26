// packages/shared/src/schemas/__tests__/sustratos.schema.spec.ts
import { SustratoSchema, CreateSustratoSchema, UpdateSustratoSchema } from "../sustratos.schema";

describe("SustratoSchema", () => {
  const valid = { id: "clx1234567890abcdef12345", nombre: "Turba", createdAt: new Date("2026-01-15") };

  it("accepts valid sustrato", () => {
    const result = SustratoSchema.parse(valid);
    expect(result.id).toBe("clx1234567890abcdef12345");
    expect(result.nombre).toBe("Turba");
  });

  it("rejects missing id", () => {
    const { id, ...withoutId } = valid;
    expect(() => SustratoSchema.parse(withoutId)).toThrow();
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
    expect(() => CreateSustratoSchema.parse({})).toThrow();
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
});
