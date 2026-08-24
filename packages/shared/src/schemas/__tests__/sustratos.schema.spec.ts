// packages/shared/src/schemas/__tests__/sustratos.schema.spec.ts
import { SustratoSchema, CreateSustratoSchema, UpdateSustratoSchema } from "../sustratos.schema";

describe("SustratoSchema", () => {
  const valid = { id: "sust-1", nombre: "Turba", createdAt: "2026-01-15T00:00:00.000Z" };

  it("accepts valid sustrato", () => {
    const result = SustratoSchema.parse(valid);
    expect(result.id).toBe("sust-1");
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
