// packages/shared/src/schemas/__tests__/partidas.schema.spec.ts
import {
  AsignarUbiExtendidoDtoSchema,
  AsignarUbiSiembraDtoSchema,
} from "../partidas.schema";

describe("AsignarUbiExtendidoDtoSchema", () => {
  const valid = {
    partida: 1,
    ano: 2026,
    indice: 1,
    ubicacion: 100,
    stock_ini: 50,
  };

  it("accepts valid assignment", () => {
    const result = AsignarUbiExtendidoDtoSchema.parse(valid);
    expect(result.partida).toBe(1);
    expect(result.ubicacion).toBe(100);
  });

  it("applies default values for optional fields", () => {
    const result = AsignarUbiExtendidoDtoSchema.parse(valid);
    expect(result.detalle).toBe("");
    expect(result.baja).toBe(0);
    expect(result.extendido).toBe("");
  });

  it("accepts valid optional fields", () => {
    const result = AsignarUbiExtendidoDtoSchema.parse({
      ...valid,
      detalle: "Test detail",
      baja: 5,
      extendido: "Extended notes",
      edita: "admin",
    });
    expect(result.detalle).toBe("Test detail");
    expect(result.baja).toBe(5);
    expect(result.extendido).toBe("Extended notes");
    expect(result.edita).toBe("admin");
  });

  it("rejects negative ubicacion", () => {
    expect(() =>
      AsignarUbiExtendidoDtoSchema.parse({ ...valid, ubicacion: -1 }),
    ).toThrow();
  });

  it("rejects zero ubicacion", () => {
    expect(() =>
      AsignarUbiExtendidoDtoSchema.parse({ ...valid, ubicacion: 0 }),
    ).toThrow();
  });

  it("rejects non-integer ubicacion", () => {
    expect(() =>
      AsignarUbiExtendidoDtoSchema.parse({ ...valid, ubicacion: 1.5 }),
    ).toThrow();
  });

  it("rejects negative stock_ini", () => {
    expect(() =>
      AsignarUbiExtendidoDtoSchema.parse({ ...valid, stock_ini: -1 }),
    ).toThrow();
  });

  it("accepts zero stock_ini", () => {
    const result = AsignarUbiExtendidoDtoSchema.parse({
      ...valid,
      stock_ini: 0,
    });
    expect(result.stock_ini).toBe(0);
  });

  it("rejects detalle longer than 30 characters", () => {
    expect(() =>
      AsignarUbiExtendidoDtoSchema.parse({ ...valid, detalle: "a".repeat(31) }),
    ).toThrow();
  });

  it("accepts detalle with exactly 30 characters", () => {
    const result = AsignarUbiExtendidoDtoSchema.parse({
      ...valid,
      detalle: "a".repeat(30),
    });
    expect(result.detalle).toHaveLength(30);
  });
});

describe("AsignarUbiSiembraDtoSchema", () => {
  const valid = {
    partida: 1,
    ano: 2026,
    indice: 1,
    cg: 92,
    cantidaNroCont: 120,
    germin: 80,
    detalle: "Test",
  };

  it("accepts valid assignment", () => {
    const result = AsignarUbiSiembraDtoSchema.parse(valid);
    expect(result.partida).toBe(1);
    expect(result.cg).toBe(92);
    expect(result.cantidaNroCont).toBe(120);
  });

  it("applies default values", () => {
    const result = AsignarUbiSiembraDtoSchema.parse(valid);
    expect(result.detalle).toBe("");
  });

  it("accepts with optional fields", () => {
    const result = AsignarUbiSiembraDtoSchema.parse({
      ...valid,
      baja: 5,
      detalle: "Test",
      extendido: "Notes",
      edita: "admin",
    });

    expect(result.edita).toBe("admin");
  });

  it("rejects negative ubicacion", () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, cg: -1 }),
    ).toThrow();
  });

  it("rejects non-integer ubicacion", () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, cg: 1.5 }),
    ).toThrow();
  });

  it("rejects detalle longer than 30 characters", () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, detalle: "a".repeat(31) }),
    ).toThrow();
  });
});
